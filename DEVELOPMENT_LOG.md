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




########################   COM REACT JA CONFIGURADO E FUNCIONANDO


## [2026-08-26] - Integração do Front-End (React/Vite) e Proxy Reverso (Nginx)

### 🚀 O que foi feito:
1. **Desenvolvimento e Build do Front-End:**
   - Criação de uma interface web moderna em **React (Vite)** para monitoramento em tempo real dos 6 sensores oficiais da fazenda inteligente ("Fazenda Boa Vista").
   - Implementação da seção de **Sensores Ativos** com cartões dinâmicos, indicadores de status (*Ideal* vs *Crítico*) e formatação de nomes amigáveis para leigos (substituindo os IDs técnicos como `sensor-temp-01` por nomes limpos como *Temperatura do Ar*).
   - Inclusão de um **Simulador Interativo via Web (POST)** blindado com um menu suspenso (`select`) oficial dos sensores e mensagens de notificação automáticas e vinculadas.

2. **Configuração de Infraestrutura e Proxy Reverso (Nginx):**
   - Configuração do Nginx para servir a build estática (`dist`) do painel React na subrota pública **`/api-agro2`**.
   - Ajuste do arquivo `vite.config.js` com a propriedade `base: '/api-agro2/'` para garantir o mapeamento correto dos assets estáticos.
   - Manutenção da rota de redirecionamento do Back-End FastAPI na porta `9000` (`/api-agro/`) para processamento dos dados e histórico no banco SQLite.

3. **Correção de Fluxo e Validação da API:**
   - Alinhamento do payload do Front-End para corresponder estritamente ao esquema exigido pelo Pydantic/FastAPI (`eventId`, `deviceId`, `type`, `value`, `unit`, `timestamp`).
   - Resolução bem-sucedida de requisições `POST` de simulação de eventos gravando diretamente no banco de dados e atualizando o painel instantaneamente.

---
## 📂 Estrutura do Projeto

```text
├── backend/               # Código do servidor FastAPI e banco SQLite
│   ├── main.py            # API REST, rotas e regras de negócio
│   ├── database.py        # Configuração do banco de dados
│   └── requirements.txt   # Dependências Python
├── frontend/              # Código fonte e build da interface React (Vite)
│   ├── src/               # Componentes e arquivos de tela (App.jsx)
│   ├── dist/              # Arquivos estáticos gerados para o Nginx
│   └── vite.config.js     # Configurações do Vite
├── README.md              # Documentação principal da plataforma
└── DEVELOPMENT_LOG.md     # Diário de bordo da evolução do MVP

