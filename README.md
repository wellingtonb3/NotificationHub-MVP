```markdown
# 🌾 NotificationHub - Fazenda Inteligente (MVP)

O **NotificationHub** é uma plataforma desenvolvida para monitorar e alertar, em tempo real, sobre as condições de sensores IoT instalados em uma fazenda inteligente. 

O sistema conta com um **Back-End** robusto em FastAPI, um **Banco de Dados** SQLite para histórico e alertas críticos, e um **Front-End** moderno em React (Vite) integrado via Nginx em ambiente de produção.

---

## 🚀 Tecnologias Utilizadas

### **Back-End & Dados**
* **Python / FastAPI:** Framework web de alta performance responsável pelas rotas e API REST.
* **Pydantic:** Validação rigorosa dos dados de entrada (payload dos sensores).
* **SQLite3:** Banco de dados relacional para armazenamento do histórico de eventos e alarmes.
* **Uvicorn:** Servidor ASGI para execução da API.

### **Front-End & Infraestrutura**
* **React / Vite:** Interface de usuário dinâmica, organizada em cards e painéis de controle.
* **Nginx:** Servidor web e proxy reverso (responsável por servir a build estática do Front-End em `/api-agro2/` e redirecionar a API do Back-End em `/api-agro/`).

---

## 📋 Regras de Negócio e os 6 Sensores Oficiais

O sistema monitora e valida automaticamente os seguintes dispositivos de campo:

| Nome Amigável | `deviceId` (Técnico) | `type` | Unidade | Critério de Alerta / Comportamento |
| :--- | :--- | :--- | :---: | :--- |
| **Temperatura do Ar** | `sensor-temp-01` | `AIR_TEMPERATURE` | °C | Alerta crítico se ultrapassar os limites seguros de calor. |
| **Umidade do Ar** | `sensor-humidity-01` | `AIR_HUMIDITY` | % | Alerta crítico se a umidade estiver criticamente baixa. |
| **Umidade do Solo** | `sensor-soil-01` | `SOIL_MOISTURE` | % | Dispara aviso de irrigação se o solo secar abaixo do limite. |
| **Reservatório de Água** | `reservoir-sensor-01` | `WATER_RESERVOIR_LEVEL` | % | Alerta crítico de nível baixo de água para reabastecimento. |
| **Silo de Grãos** | `silo-sensor-01` | `SILO_LEVEL` | % | Alerta se o armazenamento de grãos estiver esvaziando. |
| **Bomba de Irrigação** | `irrigation-pump-01` | `EQUIPMENT_STATUS` | *N/A* | Status operacional (`FAILURE` dispara alarme de manutenção). |

---

## ⚙️ Como Executar o Projeto (Desenvolvimento / Servidor)

### 1. Configurando o Back-End (API)
No terminal da sua máquina virtual ou ambiente de desenvolvimento:

```bash
# Cria e ativa o ambiente virtual
python3 -m venv .venv
source .venv/bin/activate

# Instala as dependências
pip install -r requirements.txt

# Inicia o servidor FastAPI na porta 9000
uvicorn main:app --host 0.0.0.0 --port 9000 --reload

```

### 2. Configurando o Front-End (React)

Para compilar e gerar os arquivos estáticos de produção do painel:

```bash
cd frontend

# Instala as dependências (se necessário)
npm install

# Gera a build otimizada na pasta 'dist'
npm run build

```

---

## 🌐 Endpoints Principais e Acesso

* **Painel Web (Front-End):** `https://wcorporate.com.br/api-agro2`
* **API REST (Back-End):** `https://wcorporate.com.br/api-agro/api/eventos`
* **Documentação Interativa (Swagger):** `http://<SEU_IP>:9000/docs`

---

## 📂 Estrutura do Projeto

* `main.py`: Ponto de entrada da API, contendo o Motor de Regras e rotas.
* `database.py`: Gerenciador de conexão e queries do SQLite.
* `simulador.py`: Script de automação via terminal para testes de carga.
* `frontend/`: Código fonte completo e arquivos de build da interface em React (Vite).
* `DEVELOPMENT_LOG.md`: Diário de bordo detalhando arquitetura e uso de IA.

```
