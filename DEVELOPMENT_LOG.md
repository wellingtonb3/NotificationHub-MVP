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

################# PARTE FINAL DE AJUSTES, TESTES, ETC



Entendi perfeitamente! Você quer registrar a **evidência da nossa jornada de desenvolvimento**, compilando essa nossa interação passo a passo (os testes, as correções de regras no backend, a criação dos modais, o tratamento de dados inválidos e a montagem do layout final) para colar direto no seu **Diário de Bordo (`DEVELOPMENT_LOG.md`)**.

Aqui está o texto pronto, em formato de relatório cronológico, detalhando tudo o que construímos e resolvemos juntos até chegarmos a este nível profissional:

---

### 📝 Diário de Bordo: Evolução e Refinamento do NotificationHub (MVP)

#### 1. Correções de Backend e Validação de Regras

* **Tratamento de Leituras Físicas Inválidas:** Implementação de barreiras no motor de regras do FastAPI para identificar leituras fisicamente impossíveis (ex: umidade acima de 100% ou abaixo de 0%), disparando automaticamente alertas de erro de sensor (`alerta_disparado = 1`) com mensagens descritivas de hardware.
* **Limpeza e Ordenação de Base de Dados:** Padronização dos timestamps dos eventos para garantir que o fluxo de dados em tempo real e o histórico ordenado por cronologia apareçam corretamente no painel.

#### 2. Refinamento e Layout do Front-End (React / Vite)

* **Tradução Amigável de Dispositivos:** Mapeamento completo dos IDs técnicos (`sensor-soil-01`, `sensor-humidity-01`, etc.) para nomes intuitivos no painel do operador ("Umidade do Solo", "Umidade do Ar", etc.).
* **Sistema de Modais em Destaque:** Implementação de janelas flutuantes interativas para as seções principais da barra lateral esquerda (**Clima**, **Sensores Ativos**, **Histórico de Leitura** e a **Central de Alertas Críticos**), dando um aspecto de sistema corporativo real.
* **Módulos Futuros Indicados:** Inclusão de visualizadores para expansões futuras do MVP (Culturas, Irrigação, Pecuária, Estoque, Relatórios e Configurações) com indicação visual de status desativado ("Em breve").
* **Identidade Visual Profissional:** Adição de elementos visuais no cabeçalho (como o avatar/foto da fazenda e widget de clima em tempo real integrado via Open-Meteo) alinhados às melhores práticas de UI/UX em monitoramento agrícola.

#### 3. Testes Funcionais e Integração Contínua

* Validação bem-sucedida das requisições via simulação de dados (`POST` / `GET`), confirmando a comunicação estável entre o front-end em React, a API REST em Python/FastAPI e o banco SQLite em ambiente de produção via Nginx.

---
