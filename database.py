import sqlite3

# Nome do arquivo do banco de dados que será criado automaticamente
NOME_BANCO = "historico_fazenda.db"

def criar_banco_e_tabela():
    """
    Conecta ao banco e cria a tabela principal de eventos se ela ainda não existir.
    """
    conexao = sqlite3.connect(NOME_BANCO)
    cursor = conexao.cursor()
    
    # Criando a tabela com todas as colunas necessárias para o histórico
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS eventos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            event_id TEXT NOT NULL,
            farm_id TEXT NOT NULL,
            device_id TEXT NOT NULL,
            sensor_type TEXT NOT NULL,
            leitura TEXT NOT NULL,
            data_hora TEXT NOT NULL,
            alerta_disparado BOOLEAN NOT NULL,
            mensagem_notificacao TEXT
        )
    ''')
    
    conexao.commit()
    conexao.close()

def salvar_registro(evento, alerta_disparado, mensagem):
    """
    Recebe os dados originais do evento e o resultado do Motor de Regras,
    e salva tudo em uma nova linha no banco de dados.
    """
    conexao = sqlite3.connect(NOME_BANCO)
    cursor = conexao.cursor()
    
    cursor.execute('''
        INSERT INTO eventos (
            event_id, farm_id, device_id, sensor_type, leitura, 
            data_hora, alerta_disparado, mensagem_notificacao
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ''', (
        evento.eventId,
        evento.farmId,
        evento.deviceId,
        evento.type,
        str(evento.value), # Convertido para texto para evitar conflitos no banco
        evento.timestamp,
        alerta_disparado,
        mensagem
    ))
    
    conexao.commit()
    conexao.close()
