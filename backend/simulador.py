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
        with open(ARQUIVO_DADOS, 'r', encoding='utf-8') as arquivo:
            eventos = json.load(arquivo)
            
        # 2. Percorre cada evento na lista
        for evento in eventos:
            # CORRIGIDO: Usando 'device_id' conforme o padrão atualizado
            device_id = evento.get('device_id') or evento.get('deviceId')
            print(f"📡 Enviando dados do sensor: {device_id} (ID: {evento.get('event_id')})...")
            
            # 3. Envia o evento para a nossa API via POST
            resposta = requests.post(URL_API, json=evento)
            
            # 4. Verifica o que a API respondeu
            if resposta.status_code == 200:
                dados_resposta = resposta.json()
                print("    ✅ Sucesso: Evento processado e validado pelo NotificationHub.")
            elif resposta.status_code == 400:
                # Trata o bloqueio de duplicidade ou erro de validação graciosamente
                detalhe = resposta.json().get("detail", "Erro desconhecido")
                print(f"    ⚠️ Aviso da API: {detalhe}")
            else:
                print(f"    ❌ Erro ao enviar: Código {resposta.status_code} - {resposta.text}")
                
            print("-" * 50)
            
            # Pausa de 2 segundos entre um envio e outro para simular tempo real
            time.sleep(2)
            
        print("\n🏁 Simulação concluída!")
        
    except FileNotFoundError:
        print(f"Erro: Arquivo '{ARQUIVO_DADOS}' não encontrado.")
    except requests.exceptions.ConnectionError:
        print("Erro: Não foi possível conectar à API. O servidor no main.py está rodando?")

if __name__ == "__main__":
    iniciar_simulacao()
