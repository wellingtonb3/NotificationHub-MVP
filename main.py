from fastapi import FastAPI
from pydantic import BaseModel
from typing import Union, Optional

app = FastAPI(
    title="NotificationHub - Fazenda Inteligente",
    description="MVP de monitoramento e alertas em tempo real",
    version="1.0.0"
)

# 1. O nosso "Molde" para validar os dados do sensor
class EventoSensor(BaseModel):
    eventId: str
    farmId: str
    deviceId: str
    type: str
    value: Union[float, str]  # Pode ser número (38.5) ou texto ("FAILURE")
    unit: Optional[str] = None # Unidade pode ser nula em caso de falha de equipamento
    timestamp: str

# Rota de teste (mantida)
@app.get("/")
def raiz():
    return {"status": "online", "mensagem": "NotificationHub operando na porta 9000!"}

# 2. A nova rota que vai RECEBER os dados do JSON
@app.post("/api/eventos")
def receber_evento(evento: EventoSensor):
    # Por enquanto, ele apenas recebe e devolve uma confirmação.
    # No próximo passo, vamos colocar as regras aqui dentro!
    return {
        "status": "sucesso",
        "mensagem": "Evento validado e recebido!",
        "dados": evento
    }
