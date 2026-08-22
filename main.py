from fastapi import FastAPI
from pydantic import BaseModel
from typing import Union, Optional
from database import criar_banco_e_tabela, salvar_registro, buscar_historico

# 1. Importando as funções do nosso arquivo de banco de dados
from database import criar_banco_e_tabela, salvar_registro

app = FastAPI(
    title="NotificationHub - Fazenda Inteligente",
    description="MVP de monitoramento e alertas em tempo real",
    version="1.0.0"
)

# 2. Cria o banco de dados e a tabela assim que o servidor iniciar
criar_banco_e_tabela()

# O Molde de Validação
class EventoSensor(BaseModel):
    eventId: str
    farmId: str
    deviceId: str
    type: str
    value: Union[float, str]
    unit: Optional[str] = None
    timestamp: str

# O Motor de Regras (O "Juiz")
def processar_regras(evento: EventoSensor):
    alerta = False
    mensagem = ""

    if evento.type == "AIR_TEMPERATURE" and isinstance(evento.value, (int, float)) and evento.value > 35:
        alerta = True
        mensagem = f"🌡️ Alerta: A temperatura ambiente está alta, atingindo {evento.value}°C."
    elif evento.type == "AIR_HUMIDITY" and isinstance(evento.value, (int, float)) and evento.value < 30:
        alerta = True
        mensagem = f"💨 Atenção: A umidade do ar está criticamente baixa, marcando apenas {evento.value}%."
    elif evento.type == "SOIL_MOISTURE" and isinstance(evento.value, (int, float)) and evento.value < 20:
        alerta = True
        mensagem = f"💧 Alerta de irrigação: A umidade do solo caiu para {evento.value}%. Considere iniciar a rega."
    elif evento.type == "WATER_RESERVOIR_LEVEL" and isinstance(evento.value, (int, float)) and evento.value < 15:
        alerta = True
        mensagem = f"⚠️ Crítico: O nível do reservatório de água está em {evento.value}% e precisa de reabastecimento."
    elif evento.type == "SILO_LEVEL" and isinstance(evento.value, (int, float)) and evento.value < 15:
        alerta = True
        mensagem = f"🌾 Aviso: O nível do silo atingiu {evento.value}%. Planeje o reabastecimento de grãos."
    elif evento.type == "EQUIPMENT_STATUS" and evento.value == "FAILURE":
        alerta = True
        mensagem = f"🚨 URGENTE: Falha detectada no equipamento {evento.deviceId}. Necessária intervenção imediata."

    return alerta, mensagem

@app.get("/")
def raiz():
    return {"status": "online", "mensagem": "NotificationHub operando na porta 9000!"}

# Nova rota para visualizar o histórico
@app.get("/api/eventos")
def listar_eventos():
    historico = buscar_historico()
    return {
        "status": "sucesso",
        "total_registros": len(historico),
        "dados": historico
    }

# A Rota Atualizada
@app.post("/api/eventos")
def receber_evento(evento: EventoSensor):
    # Passo A: Passa o dado recebido para o Motor de Regras
    gerou_alerta, mensagem_alerta = processar_regras(evento)
    
    # Passo B: Salva o histórico definitivo no banco de dados SQLite
    salvar_registro(evento, gerou_alerta, mensagem_alerta)
    
    return {
        "status": "sucesso",
        "alerta_disparado": gerou_alerta,
        "notificacao": mensagem_alerta if gerou_alerta else "Status normal. Nenhuma notificação gerada.",
        "dados_originais": evento
    }
