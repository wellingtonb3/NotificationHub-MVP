from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, field_validator
from typing import Optional, Any
from datetime import datetime, timezone, timedelta
import sqlite3
from datetime import datetime, timezone, timedelta

# Cria um fuso de -3 horas (Brasília)
fuso_brasil = timezone(timedelta(hours=-3))


# Instancia o FastAPI com o root_path correto
app = FastAPI(
    title="NotificationHub - Fazenda Inteligente",
    description="MVP de monitoramento e alertas em tempo real",
    version="1.0.0",
    root_path="/api-agro"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


DB_NAME = "historico_fazenda.db"

def conectar_banco():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    return conn

def inicializar_banco():
    conn = conectar_banco()
    cursor = conn.cursor()
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS eventos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_id TEXT NOT NULL,
        farm_id TEXT NOT NULL,
        device_id TEXT NOT NULL,
        sensor_type TEXT NOT NULL,
        leitura TEXT NOT NULL,
        timestamp TEXT NOT NULL,
        alerta_disparado BOOLEAN NOT NULL,
        mensagem_notificacao TEXT
    )
""")
    conn.commit()
    conn.close()

inicializar_banco()

# Schema blindado com validações de entrada
class EventoSchema(BaseModel):
    event_id: str
    farm_id: str = "farm-001"
    device_id: str
    sensor_type: str
    leitura: Any
    unit: Optional[str] = ""
    timestamp: str
    alerta_disparado: Optional[int] = 0
    mensagem_notificacao: Optional[str] = ""

    @field_validator('device_id', mode='before')
    def validar_device_id(cls, v):
        if not v or str(v).strip().lower() in ["string", "null", "undefined", ""]:
            raise ValueError("Device ID inválido ou genérico bloqueado pela API.")
        return str(v).strip()

@app.get("/")
def raiz():
    return {"status": "online", "mensagem": "NotificationHub operando na porta 9000!"}

@app.get("/api/eventos")
def listar_eventos():
    try:
        conn = conectar_banco()
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM eventos ORDER BY id DESC")
        linhas = cursor.fetchall()
        conn.close()
        dados = [dict(linha) for linha in linhas]
        return {"status": "sucesso", "dados": dados}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.post("/api/eventos")
def receber_evento(evento: EventoSchema):
    try:
        e_id = evento.event_id or getattr(evento, 'eventId', None)
        f_id = evento.farm_id or getattr(evento, 'farmId', None) or "farm-001"
        d_id = evento.device_id or getattr(evento, 'deviceId', None)
        s_type = evento.sensor_type or getattr(evento, 'type', None) or "GENERIC"
        
        val = evento.leitura if evento.leitura is not None else getattr(evento, 'value', None)
        val_str = str(val).strip() if val is not None else "0"
        
        t_stamp = evento.timestamp if evento.timestamp else datetime.now(fuso_brasil).isoformat()
         
        # --- LÓGICA DO ÚLTIMO REGISTRO GLOBAL DO BANCO ---
        conn = conectar_banco()
        cursor = conn.cursor()
        
        cursor.execute("SELECT event_id, leitura FROM eventos ORDER BY id DESC LIMIT 1")
        ultimo_registro = cursor.fetchone()
        
        if ultimo_registro:
            ultimo_event_id_salvo = str(ultimo_registro["event_id"])
            ultima_leitura_salva = str(ultimo_registro["leitura"])
            
            if ultimo_event_id_salvo == str(e_id):
                if ultima_leitura_salva == val_str:
                    conn.close()
                    raise HTTPException(
                        status_code=400, 
                        detail=f"⚠️ Evento duplicado descartado: O último registro do banco já é o event_id '{e_id}' com a mesma leitura ({val_str})."
                    )
        # -------------------------------------------------------------

        alerta_disparado = 0
        mensagem_notificacao = ""

        # Regras de Negócio Oficiais do NotificationHub
        if s_type == "EQUIPMENT_STATUS" or d_id == "irrigation-pump-01":
            if val_str.upper() == "FAILURE":
                alerta_disparado = 1
                mensagem_notificacao = f"🚨 Falha de equipamento: foi detectada uma falha no equipamento {d_id}."
            elif val_str.upper() == "READY":
                alerta_disparado = 0
                mensagem_notificacao = f"✅ Operação normalizada: O equipamento {d_id} retornou ao estado READY."
            else:
                alerta_disparado = 1
                mensagem_notificacao = f"❌ ERRO DE DADO: Valor inválido recebido para o atuador {d_id}."
        else:
            try:
                val_num = float(val_str)
                
                # Validação de limites físicos (0 a 100%) para umidades e níveis
                if "MOISTURE" in s_type or "LEVEL" in s_type or "HUMIDITY" in s_type:
                    if val_num < 0.0 or val_num > 100.0:
                        raise ValueError("Valor fora dos limites físicos (0-100%).")
                
                # REGRAS DE ALERTA OFICIAIS
                if s_type == "AIR_TEMPERATURE" and val_num > 35.0:
                    alerta_disparado = 1
                    mensagem_notificacao = f"⚠️ Alerta de temperatura: foi registrada temperatura de {val_num} °C pelo sensor {d_id} na Fazenda Boa Esperança."
                
                elif s_type == "AIR_HUMIDITY" and val_num < 30.0:
                    alerta_disparado = 1
                    mensagem_notificacao = f"⚠️ Alerta de umidade: a umidade do ar atingiu {val_num}% na Fazenda Boa Esperança."
                
                elif s_type == "SOIL_MOISTURE" and val_num < 20.0:
                    alerta_disparado = 1
                    mensagem_notificacao = f"💧 Alerta de irrigação: a umidade do solo está em {val_num}%. Verifique a necessidade de irrigação."
                
                elif s_type == "WATER_RESERVOIR_LEVEL" and val_num < 15.0:
                    alerta_disparado = 1
                    mensagem_notificacao = f"💧 Nível baixo de água: o reservatório está com apenas {val_num}% de sua capacidade."
                
                elif s_type == "SILO_LEVEL" and val_num < 15.0:
                    alerta_disparado = 1
                    mensagem_notificacao = f"⚠️ Nível baixo no silo: o silo monitorado por {d_id} está com {val_num}% de sua capacidade."

            except ValueError:
                alerta_disparado = 1
                mensagem_notificacao = f"🚨 FALHA DE HARDWARE / LEITURA CORROMPIDA: O sensor {d_id} enviou dado inválido ('{val_str}')."

        # Salva o evento validado no banco
        cursor.execute("""
        INSERT INTO eventos (event_id, farm_id, device_id, sensor_type, leitura, timestamp, alerta_disparado, mensagem_notificacao)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            e_id, f_id, d_id, s_type, val_str, t_stamp, alerta_disparado, mensagem_notificacao
        ))
        conn.commit()
        conn.close()

        return {"status": "sucesso", "mensagem": "Evento validado e processado com segurança."}
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro de validação: {str(e)}")
