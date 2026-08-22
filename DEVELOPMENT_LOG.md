# Development Log - NotificationHub

## 1. Arquitetura e Tecnologias Escolhidas
* **Backend:** Python com FastAPI. Escolhido por gerar documentação interativa automaticamente (Swagger) e possuir validação de dados nativa e rigorosa com Pydantic.
* **Banco de Dados:** SQLite3. Adotado por ser nativo do Python, leve e perfeito para armazenar o histórico do MVP sem custos extras de infraestrutura.
* **Hospedagem de Desenvolvimento:** Oracle Cloud Infrastructure (OCI) acessada via VS Code.

## 2. Estratégia do MVP
O foco inicial foi construir o fluxo principal exigido: receber dados, validar formatos e preparar o terreno para o motor de regras, utilizando dados de demonstração em JSON.

## 3. Uso de Inteligência Artificial
Utilizei o LLM Gemini (Google) como assistente de "pair programming". A IA auxiliou na interpretação das regras do edital, na criação dos scripts iniciais de validação (FastAPI) e na estruturação lógica do projeto, operando como um guia técnico ao longo do desenvolvimento.
