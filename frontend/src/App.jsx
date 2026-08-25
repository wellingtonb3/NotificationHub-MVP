import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [eventos, setEventos] = useState([]);
  const [erro, setErro] = useState('');

  // Função para buscar os dados na nossa API
  const buscarHistorico = async () => {
    try {
      const resposta = await fetch('https://wcorporate.com.br/api-agro/api/eventos');
      if (!resposta.ok) {
        throw new Error('Erro ao conectar com a API');
      }
      const resultado = await resposta.json();
      
      setEventos(resultado.dados || resultado);
      setErro('');
    } catch (err) {
      console.error(err);
      setErro('Não foi possível conectar ao backend.');
    }
  };

  useEffect(() => {
    buscarHistorico();
  }, []);

  return (
    <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>🚜 Fazenda Inteligente - Painel MVP</h1>
      <p>Bem-vindo ao frontend integrado com o FastAPI!</p>

      <button 
        onClick={buscarHistorico}
        style={{ padding: '10px 15px', backgroundColor: '#4CAF50', color: 'white', border: 'none', borderRadius: '5px', cursor: 'pointer' }}
      >
        Atualizar Dados da API
      </button>

      {erro && <p style={{ color: 'red', marginTop: '15px' }}>{erro}</p>}

      <h3 style={{ marginTop: '30px' }}>Histórico de Sensores:</h3>
      
      {eventos.length === 0 ? (
        <p>Nenhum evento encontrado ou banco vazio.</p>
      ) : (
        <ul style={{ listStyleType: 'none', padding: 0 }}>
          {eventos.map((evento, index) => (
            <li key={index} style={{ background: '#f4f4f4', margin: '10px 0', padding: '15px', borderRadius: '5px', borderLeft: evento.alerta_disparado ? '5px solid #ff4d4d' : '5px solid #4CAF50' }}>
              <strong>Sensor:</strong> {evento.device_id} ({evento.sensor_type}) <br />
              <strong>Valor:</strong> {evento.leitura} <br />
              <strong>Fazenda:</strong> {evento.farm_id} <br />
              {evento.mensagem_notificacao && (
                <p style={{ color: '#d9534f', marginTop: '5px', marginBottom: '0' }}>
                  <strong>{evento.mensagem_notificacao}</strong>
                </p>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;
