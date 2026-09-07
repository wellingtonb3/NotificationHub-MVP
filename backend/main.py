from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, field_validator
from typing import Optional, Any
from datetime import datetime, timezone, timedelta
import sqlite3
from abc import ABC, abstractmethod
import logging

# 1. Abstração (Interface)
class NotificationProvider(ABC):
    @abstractmethod
    def send(self, message: str, recipient: str) -> str:
        pass

# 2. Implementação simulada para o MVP (Mock)
class MockWhatsAppProvider(NotificationProvider):
    def send(self, message: str, recipient: str) -> str:
        try:
            logging.info(f"[MockWhatsApp] Enviando para {recipient}: {message}")
            return "SENT"
        except Exception as e:
            logging.error(f"[MockWhatsApp] Erro ao enviar: {e}")
            return "FAILED"

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
        eventId TEXT,
        farmId TEXT,
        deviceId TEXT,
        type TEXT,
        value TEXT,
        unit TEXT,
        timestamp TEXT,
        alerta_disparado INTEGER,
        mensagem_notificacao TEXT,
        status_notificacao TEXT DEFAULT 'PENDING'
    );
    """)
    conn.commit()
    conn.close()

inicializar_banco()

# Schema blindado com validações de entrada
class EventoSchema(BaseModel):
    eventId: str
    farmId: str = "farm-001"
    deviceId: str
    type: str
    value: Any
    unit: Optional[str] = ""
    timestamp: str
    alerta_disparado: Optional[int] = 0
    mensagem_notificacao: Optional[str] = ""

    @field_validator('eventId', mode='before')
    def validar_event_id(cls, v):
        if not v or str(v).strip() in ["", "null", "undefined"]:
            raise ValueError("Event ID ausente ou inválido.")
        return str(v).strip()

    @field_validator('deviceId', mode='before')
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
        # Mapeamento para os campos oficiais em camelCase
        e_id = getattr(evento, 'eventId', None)
        f_id = getattr(evento, 'farmId', None) or "farm-001"
        d_id = getattr(evento, 'deviceId', None)
        s_type = getattr(evento, 'type', None) or "GENERIC"
        
        val = evento.value if evento.value is not None else "0"
        val_str = str(val).strip()
        
        t_stamp = evento.timestamp if evento.timestamp else datetime.now(fuso_brasil).isoformat()
         
        # --- VERIFICAÇÃO DE DUPLICIDADE ---
        conn = conectar_banco()
        cursor = conn.cursor()
        
        cursor.execute("SELECT eventId, value FROM eventos ORDER BY id DESC LIMIT 1")
        ultimo_registro = cursor.fetchone()
        
        if ultimo_registro:
            ultimo_event_id_salvo = str(ultimo_registro["eventId"])
            ultima_leitura_salva = str(ultimo_registro["value"])
            
            if ultimo_event_id_salvo == str(e_id):
                if ultima_leitura_salva == val_str:
                    conn.close()
                    raise HTTPException(
                        status_code=400, 
                        detail=f"⚠️ Evento duplicado descartado: O último registro do banco já é o eventId '{e_id}' com o mesmo valor ({val_str})."
                    )
        # ----------------------------------

        alerta_disparado = 0
        mensagem_notificacao = ""

        # --- AVALIAÇÃO DAS REGRAS DE NEGÓCIO OFICIAIS ---
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
                
                # REQUISITO: Rejeitar explicitamente valores fisicamente incompatíveis (Ex: Umidade de 130%)
                if "MOISTURE" in s_type or "LEVEL" in s_type or "HUMIDITY" in s_type or "TEMPERATURE" in s_type:
                    if "TEMPERATURE" in s_type:
                        if val_num < -50.0 or val_num > 80.0:
                            raise HTTPException(
                                status_code=400,
                                detail=f"⚠️ Entrada inválida: A temperatura de {val_num}°C é fisicamente incompatível (limite: -50°C a 80°C)."
                            )
                    else:
                        if val_num < 0.0 or val_num > 100.0:
                            raise HTTPException(
                                status_code=400,
                                detail=f"⚠️ Entrada inválida: O valor {val_num}% é fisicamente incompatível com o sensor '{s_type}' (limite permitido: 0 a 100%)."
                            )
                
                # Regras de Alerta Oficiais
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
                raise HTTPException(
                    status_code=400,
                    detail=f"⚠️ Entrada inválida: O sensor {d_id} recebeu um valor numérico corrompido ou incompatível ('{val_str}')."
                )

        # ==========================================
        # 🔔 LÓGICA DO PROVEDOR DE NOTIFICAÇÃO (MOCK)
        # ==========================================
        whatsapp_provider = MockWhatsAppProvider()
        
        if alerta_disparado == 1 and mensagem_notificacao:
            telefone_produtor = "+5535999999999"
            status_notificacao = whatsapp_provider.send(mensagem_notificacao, telefone_produtor)
        else:
            status_notificacao = "SENT"
        # ==========================================

        # Salva o evento validado no banco
        cursor.execute("""
        INSERT INTO eventos (eventId, farmId, deviceId, type, value, unit, timestamp, alerta_disparado, mensagem_notificacao, status_notificacao)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (
            e_id, f_id, d_id, s_type, val_str, getattr(evento, 'unit', ''), t_stamp, alerta_disparado, mensagem_notificacao, status_notificacao
        ))
        conn.commit()
        conn.close()

        return {"status": "sucesso", "mensagem": "Evento validado e processado com segurança."}
    except HTTPException as he:
        raise he
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Erro de validação: {str(e)}")
