```markdown
# 🌾 NotificationHub - Fazenda Inteligente (MVP)

Este é o Produto Mínimo Viável (MVP) do **NotificationHub**, uma plataforma desenvolvida para monitorar e alertar, em tempo real, sobre as condições de sensores IoT instalados em uma fazenda inteligente.

Nesta etapa inicial, o projeto contempla o **Backend** da aplicação, construído para receber dados, processar regras de negócio, disparar alertas e salvar o histórico. Uma interface Frontend será acoplada em breve para consumo destas informações.

## 🚀 Tecnologias Utilizadas

* **Python 3.x**
* **FastAPI:** Framework web principal, responsável pelas rotas e documentação interativa (Swagger).
* **Pydantic:** Validação rigorosa dos dados de entrada.
* **SQLite3:** Banco de dados relacional nativo para armazenamento do histórico.
* **Uvicorn:** Servidor de alta performance.
* **Requests:** Biblioteca utilizada no simulador de sensores.

## ⚙️ Como executar o projeto

Siga os passos abaixo para rodar o projeto localmente ou na sua máquina virtual (ex: Oracle Cloud).

### 1. Preparando o Ambiente
No terminal, clone o repositório e crie o seu ambiente virtual para isolar as bibliotecas:

```bash
# Cria o ambiente virtual
python3 -m venv .venv

# Ativa o ambiente virtual (Linux/macOS)
source .venv/bin/activate

```

### 2. Instalando Dependências

Com o ambiente ativado, instale as bibliotecas necessárias:

```bash
pip install -r requirements.txt

```

### 3. Iniciando o Servidor (API)

Inicie a aplicação FastAPI na porta 9000:

```bash
uvicorn main:app --host 0.0.0.0 --port 9000 --reload

```

Acesse a documentação interativa (Swagger UI) pelo navegador em: `http://<SEU_IP>:9000/docs`

### 4. Rodando o Simulador de Sensores

O projeto inclui um script que simula o maquinário da fazenda enviando dados para a API. Com o servidor rodando, abra um **segundo terminal**, ative a `.venv` novamente e execute:

```bash
python simulador.py

```

O script lerá o arquivo `dados_demonstracao.json` e disparará os eventos, exibindo os alertas gerados pelo motor de regras no terminal.

## 📂 Estrutura do Projeto

* `main.py`: Ponto de entrada da API, contendo o Motor de Regras e as rotas.
* `database.py`: Gerenciador de conexão e queries do SQLite.
* `simulador.py`: Script de automação que consome os dados de demonstração.
* `dados_demonstracao.json`: Carga de dados simulando leituras dos sensores.
* `DEVELOPMENT_LOG.md`: Diário de bordo detalhando arquitetura e uso de IA.

---

*Projeto em desenvolvimento - Integração com Frontend em breve.*

```
