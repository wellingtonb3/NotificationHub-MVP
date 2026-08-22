from fastapi import FastAPI

# Inicializando o aplicativo FastAPI com título e descrição para a documentação automática
app = FastAPI(
    title="NotificationHub - Fazenda Inteligente",
    description="MVP de monitoramento e alertas em tempo real",
    version="1.0.0"
)

# Rota básica de teste para ver se o servidor está no ar
@app.get("/")
def raiz():
    return {
        "status": "online",
        "mensagem": "NotificationHub operando com sucesso na porta 9000!"
    }
