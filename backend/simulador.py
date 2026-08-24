import json
import time
import requests

# A URL da nossa API
URL_API = "http://127.0.0.1:9000/api/eventos"
# Nome do nosso arquivo com os dados
ARQUIVO_DADOS = "dados_demonstracao.json"

def iniciar_simulacao():
    print("🚜 Iniciando simulador de sensores da Fazenda Inteligente...\n")
    
    try:
        # 1. Abre o arquivo JSON e carrega a lista de eventos
        with open(ARQUIVO_DADOS, 'r') as arquivo:
            eventos = json.load(arquivo)
            
        # 2. Percorre cada evento na lista
        for evento in eventos:
            print(f"📡 Enviando dados do sensor: {evento['deviceId']}...")
            
            # 3. Envia o evento para a nossa API via POST
            resposta = requests.post(URL_API, json=evento)
            
            # 4. Verifica o que a API respondeu
            if resposta.status_code == 200:
                dados_resposta = resposta.json()
                if dados_resposta.get("alerta_disparado"):
                    print(f"   🚨 ALERTA: {dados_resposta.get('notificacao')}")
                else:
                    print("   ✅ Status: Leitura normal. Tudo ok.")
            else:
                print(f"   ❌ Erro ao enviar: Código {resposta.status_code}")
                
            print("-" * 50)
            
            # Pausa de 2 segundos entre um envio e outro para simular tempo real
            time.sleep(2)
            
        print("\n🏁 Simulação concluída com sucesso!")
        
    except FileNotFoundError:
        print(f"Erro: Arquivo '{ARQUIVO_DADOS}' não encontrado.")
    except requests.exceptions.ConnectionError:
        print("Erro: Não foi possível conectar à API. O servidor no main.py está rodando?")

if __name__ == "__main__":
    iniciar_simulacao()
