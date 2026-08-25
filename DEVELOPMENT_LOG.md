# Development Log - NotificationHub

## 1. Arquitetura e Organização de Pastas
* **Estrutura Monorepo:** O projeto foi reorganizado separando o **`backend/`** (onde residem a API, o banco de dados e o script de simulação) e preparando o espaço para o futuro **`frontend/`**.
* **Backend:** Python com FastAPI, escolhido pela geração automática de documentação (Swagger) e validação robusta com Pydantic.
* **Banco de Dados:** SQLite3 (`historico_fazenda.db`) isolado por meio de boas práticas de separação de responsabilidades (`database.py`).
* **Automação:** Script `simulador.py` utilizando a biblioteca `requests` para envio em lote dos dados de sensores.
* **Hospedagem de Desenvolvimento:** Oracle Cloud Infrastructure (OCI).

## 2. Estratégia do MVP e Funcionalidades Implementadas
1. **Validação de Entrada:** Bloqueio de dados inválidos via Pydantic (retornando erro 422).
2. **Motor de Regras:** Análise de limites críticos (temperatura, umidade, níveis de silo/reservatório e falhas de equipamentos).
3. **Persistência de Dados:** Gravação automática de todas as leituras em tabela SQLite.
4. **Endpoints da API:** 
   * `GET /`: Health check da aplicação.
   * `POST /api/eventos`: Recepção, validação, processamento de regras e salvamento do evento.
   * `GET /api/eventos`: Listagem completa do histórico de eventos.
5. **Simulação Realista:** Automação via `simulador.py` consumindo o `dados_demonstracao.json` com intervalo temporal.

## 3. Uso de Inteligência Artificial
Utilizei o LLM Gemini (Google) como assistente de *pair programming* para estruturação lógica, criação dos scripts em FastAPI, modelagem do banco de dados, refatoração da árvore de arquivos e diretrizes de boas práticas de desenvolvimento.


#######   ABAIXO JÁ COM ALTERAÇÕES PARA USO DO REACT PARA MELHOR QUALIDADE DO FRONTEND 




# 🚜 Guia de Desenvolvimento - Fazenda Inteligente (MVP)

Este documento descreve a arquitetura, os pré-requisitos e os passos para rodar o projeto localmente ou gerenciar o ambiente de produção na nuvem.

---

## 🛠️ Tecnologias Utilizadas

* **Backend:** Python (FastAPI, Uvicorn, Pydantic, SQLite)
* **Frontend:** React (Vite)
* **Gerenciador de Processos (Prod):** PM2
* **Proxy Reverso (Prod):** Nginx com SSL

---

## 📂 Estrutura do Projeto

```text
├── backend/
│   ├── main.py            # API FastAPI, rotas (/api/eventos) e CORS
│   ├── database.py        # Configuração do SQLite e funções de histórico
│   └── requirements.py    # Dependências do Python
├── src/                   # Código fonte do Frontend (React)
│   ├── App.jsx            # Painel principal integrado com a API
│   └── ...
├── .gitignore             # Arquivos ignorados pelo Git (.venv, .env, node_modules)
└── DEVELOPMENT.md         # Este arquivo de documentação
