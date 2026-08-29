```markdown
# Development Log - NotificationHub

## 1. Decisões Relevantes e Escolhas Tecnológicas
* **Escolha das Tecnologias:** 
  * **Backend:** Python com **FastAPI** e **Pydantic**, selecionados pela alta performance, tipagem rigorosa e documentação automática integrada (Swagger).
  * **Frontend:** **React (Vite)** para construção de uma interface de monitoramento reativa, moderna e baseada em componentes.
  * **Banco de Dados:** **SQLite3** em arquivo local (`historico_fazenda.db`), garantindo portabilidade, isolamento de responsabilidades e facilidade para implantação em MVPs.
* **Definição da Arquitetura:** Estrutura em *Monorepo* limpa, separando claramente o diretório de serviços de API (`backend/`) da aplicação de interface (`frontend/` ou `src/`).
* **Estratégia de Processamento de Eventos:** Validação síncrona na entrada via schema Pydantic, seguida de checagem de duplicidade (comparando `eventId` e valor anterior) e execução de motor de regras para detecção de anomalias térmicas, hídricas ou falhas de atuadores.
* **Estratégia de Notificações:** Abstração baseada em uma interface `NotificationProvider` e uma implementação simulada `MockWhatsAppProvider`, registrando o ciclo de vida da mensagem (`PENDING`, `SENT`, `FAILED`) no banco de dados e exibindo-a em um painel/modal dedicado na aplicação.
* **Abordagem para Evitar Duplicidades:** Verificação do último registro persistido na tabela do banco antes de concluir o `INSERT`, descartando requisições repetidas idênticas com código HTTP adequado.

---

## 2. Histórico de Evolução do Desenvolvimento

### [Fase 1] - Arquitetura Inicial e Backend
* **Objetivo:** Estruturar a API REST em FastAPI, modelagem de dados inicial e automação de testes de carga.
* **Decisão Tomada:** Uso de SQLite com isolamento de funções de banco e script de simulação temporal (`simulador.py`).
* **Interação com IA (Gemini):**
  * *Ferramenta:* Gemini (Google).
  * *Objetivo:* Auxiliar na estruturação lógica do FastAPI, tratamento de exceções e criação dos schemas de validação.
  * *Status:* Sugestão aceita integralmente.
  * *Alterações do Desenvolvedor:* Ajuste dos mapeamentos de campos para o padrão oficial (`eventId`, `farmId`, `deviceId`, `type`, `value`, `unit`, `timestamp`).

### [Fase 2] - Integração do Front-End (React / Vite) e Proxy Reverso
* **Objetivo:** Desenvolver uma interface gráfica para o operador visualizar o estado dos 6 sensores oficiais e simular entradas via web.
* **Decisão Tomada:** Criação de componentes em React com suporte a modais e integração com o proxy reverso Nginx para publicação em produção.
* **Interação com IA (Gemini):**
  * *Ferramenta:* Gemini (Google).
  * *Objetivo:* Refatorar o componente principal (`App.jsx`) para consumir os endpoints da API, formatar valores com unidades e estruturar modais de navegação lateral.
  * *Status:* Sugestão aceita integralmente.
  * *Alterações do Desenvolvedor:* Implementação visual dos cartões de sensores ativos, tradução de IDs técnicos para nomes amigáveis ao usuário final e adição de relógio em tempo real.

### [Fase 3] - Refinamento de Erros, Validação Física e Mensageria (Mock)
* **Objetivo:** Atender a critérios avançados de tratamento de dados inválidos (como umidade de 130%) e estruturação de provedor de mensageria simulada.
* **Decisão Tomada:** Implementação de bloqueios físicos de faixa no backend (retornando HTTP 400 para leitores absurdos) e criação de uma Central de Mensageria (WhatsApp/Mock) baseada em modais.
* **Interação com IA (Gemini):**
  * *Ferramenta:* Gemini (Google).
  * *Objetivo:* Estruturar o padrão de classes abstratas de notificação (`NotificationProvider`) e ajustar as regras de validação física no código da API.
  * *Status:* Sugestão aceita integralmente.
  * *Alterações do Desenvolvedor:* Inserção do botão de acesso à mensageria no menu lateral e validação final dos fluxos de erro da API.

```
