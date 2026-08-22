# Development Log - NotificationHub

## 1. Arquitetura e Tecnologias Escolhidas
* **Backend:** Python com FastAPI. Escolhido por gerar documentação interativa automaticamente (Swagger) e possuir validação de dados nativa e rigorosa com Pydantic.
* **Banco de Dados:** SQLite3. Adotado por ser nativo do Python, leve e perfeito para armazenar o histórico do MVP sem custos extras de infraestrutura (Separation of Concerns aplicado com o arquivo `database.py`).
* **Automação:** Biblioteca `requests` do Python para criar o script `simulador.py`, responsável por disparar os dados em lote.
* **Hospedagem de Desenvolvimento:** Oracle Cloud Infrastructure (OCI).

## 2. Estratégia do MVP e Funcionalidades Implementadas
O foco foi construir o fluxo completo exigido pelo desafio, garantindo que cada etapa funcionasse de forma independente e conectada:
1. **Validação de Entrada:** Uso de modelos Pydantic para barrar formatos inválidos (gerando erro 422 em caso de falha).
2. **Motor de Regras:** Implementação de lógica condicional para analisar os limites de temperatura, umidade, níveis de silo/reservatório e status de falha do maquinário.
3. **Persistência de Dados:** Toda leitura, gerando alerta ou não, é salva em uma tabela SQLite para auditoria futura.
4. **Endpoint de Histórico:** Criação da rota `GET /api/eventos` para visualização dos dados arquivados.
5. **Simulação Realista:** Criação de um script autônomo (`simulador.py`) que consome o arquivo `dados_demonstracao.json` e envia as requisições com atraso de tempo, simulando o comportamento de sensores reais na fazenda.

## 3. Uso de Inteligência Artificial
Utilizei o LLM Gemini (Google) como assistente de "pair programming". A IA auxiliou na interpretação das regras do edital, na criação dos scripts iniciais de validação (FastAPI), na estruturação do banco de dados e na elaboração do script de simulação, operando como um guia técnico focado em boas práticas ao longo do desenvolvimento.
