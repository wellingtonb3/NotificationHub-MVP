import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [eventos, setEventos] = useState([]);
  const [erro, setErro] = useState('');
  const [mostrarSimulador, setMostrarSimulador] = useState(false);
  
  const [simDeviceId, setSimDeviceId] = useState('sensor-soil-01');
  const [simSensorType, setSimSensorType] = useState('SOIL_MOISTURE');
  const [simLeitura, setSimLeitura] = useState('17.0%');
  const [simAlerta, setSimAlerta] = useState(1);
  const [simMensagem, setSimMensagem] = useState('⚠️ Alerta de irrigação: Umidade baixa.');

  const buscarHistorico = async () => {
    try {
      const resposta = await fetch('https://wcorporate.com.br/api-agro/api/eventos');
      if (!resposta.ok) throw new Error('Erro ao conectar com a API');
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

  const handleSimularEnvio = async (e) => {
    e.preventDefault();
    const payload = {
      event_id: `event-${Date.now()}`,
      farm_id: "farm-001",
      device_id: simDeviceId,
      sensor_type: simSensorType,
      leitura: simLeitura,
      data_hora: new Date().toISOString(),
      alerta_disparado: Number(simAlerta),
      mensagem_notificacao: simMensagem
    };

    try {
      const resposta = await fetch('https://wcorporate.com.br/api-agro/api/eventos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!resposta.ok) throw new Error('Erro ao enviar dados simulados');
      alert('Evento simulado enviado com sucesso!');
      setMostrarSimulador(false);
      buscarHistorico();
    } catch (err) {
      console.error(err);
      alert('Falha ao enviar simulação para a API.');
    }
  };

  // Pegando a última leitura de cada sensor para os cards
  const ultimosPorSensor = eventos.reduce((acc, evento) => {
    if (!acc[evento.device_id] || new Date(evento.data_hora) > new Date(acc[evento.device_id].data_hora)) {
      acc[evento.device_id] = evento;
    }
    return acc;
  }, {});

  const sensoresAtuais = Object.values(ultimosPorSensor);
  const alertasAtivos = eventos.filter(e => e.alerta_disparado === 1);

  // Ordenando os eventos do mais recente para o mais antigo para o histórico real
  const historicoOrdenado = [...eventos].sort((a, b) => new Date(b.data_hora) - new Date(a.data_hora));

  const obterStatusBadge = (alerta) => {
    if (alerta === 1) {
      return { cor: '#ef4444', texto: 'Crítico', bg: 'rgba(239, 68, 68, 0.15)' };
    } else {
      return { cor: '#10b981', texto: 'Ideal', bg: 'rgba(16, 185, 129, 0.15)' };
    }
  };

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh', backgroundColor: '#0f172a', color: '#f8fafc', fontFamily: 'Inter, sans-serif', overflow: 'hidden' }}>
      
      {/* SIDEBAR COM ÍCONES MENORES E ORGANIZADOS */}
      <aside style={{ width: '240px', backgroundColor: '#1e293b', borderRight: '1px solid #334155', display: 'flex', flexDirection: 'column', padding: '20px', flexShrink: 0 }}>
        <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#38bdf8', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          🌾 Fazenda Boa Vista
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
          <div style={{ padding: '8px 12px', borderRadius: '6px', backgroundColor: '#0284c7', color: 'white', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>📊 Visão Geral</div>
          <div style={{ padding: '8px 12px', borderRadius: '6px', color: '#94a3b8', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>🌤️ Clima</div>
          <div style={{ padding: '8px 12px', borderRadius: '6px', color: '#94a3b8', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>🌱 Solo</div>
          <div style={{ padding: '8px 12px', borderRadius: '6px', color: '#94a3b8', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>🚜 Máquinas</div>
          <div style={{ padding: '8px 12px', borderRadius: '6px', color: '#94a3b8', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>🚨 Alertas</div>
        </nav>

        <div style={{ fontSize: '11px', color: '#64748b', textAlign: 'center' }}>
          Safra 2026/2027
        </div>
      </aside>

      {/* CONTEÚDO PRINCIPAL */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', padding: '25px', width: '100%' }}>
        
        {/* CABEÇALHO */}
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #334155', paddingBottom: '15px' }}>
          <div>
            <h1 style={{ margin: 0, fontSize: '22px', color: '#f8fafc' }}>Painel de Controle</h1>
            <p style={{ margin: '3px 0 0 0', color: '#94a3b8', fontSize: '12px' }}>Monitoramento de sensores e operações de campo</p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={() => setMostrarSimulador(!mostrarSimulador)}
              style={{ padding: '6px 12px', backgroundColor: '#d97706', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
            >
              🧪 Simular Evento
            </button>
            <button 
              onClick={buscarHistorico}
              style={{ padding: '6px 12px', backgroundColor: '#0284c7', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}
            >
              🔄 Atualizar
            </button>
          </div>
        </header>

        {erro && <div style={{ backgroundColor: '#7f1d1d', color: '#fca5a5', padding: '8px', borderRadius: '6px', marginBottom: '15px', fontSize: '12px' }}>{erro}</div>}

        {/* MODAL DO SIMULADOR */}
        {mostrarSimulador && (
          <div style={{ backgroundColor: '#1e293b', border: '1px solid #38bdf8', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#38bdf8', fontSize: '14px' }}>🧪 Injetar Simulação de Sensor (POST)</h3>
            <form onSubmit={handleSimularEnvio} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
              <input type="text" value={simDeviceId} onChange={e => setSimDeviceId(e.target.value)} placeholder="Device ID" style={{ padding: '6px', backgroundColor: '#0f172a', border: '1px solid #334155', color: 'white', borderRadius: '4px', fontSize: '12px' }} />
              <input type="text" value={simSensorType} onChange={e => setSimSensorType(e.target.value)} placeholder="Sensor Type" style={{ padding: '6px', backgroundColor: '#0f172a', border: '1px solid #334155', color: 'white', borderRadius: '4px', fontSize: '12px' }} />
              <input type="text" value={simLeitura} onChange={e => setSimLeitura(e.target.value)} placeholder="Leitura" style={{ padding: '6px', backgroundColor: '#0f172a', border: '1px solid #334155', color: 'white', borderRadius: '4px', fontSize: '12px' }} />
              <input type="number" value={simAlerta} onChange={e => setSimAlerta(e.target.value)} placeholder="Alerta (0 ou 1)" style={{ padding: '6px', backgroundColor: '#0f172a', border: '1px solid #334155', color: 'white', borderRadius: '4px', fontSize: '12px' }} />
              <input type="text" value={simMensagem} onChange={e => setSimMensagem(e.target.value)} placeholder="Mensagem" style={{ gridColumn: '1 / -1', padding: '6px', backgroundColor: '#0f172a', border: '1px solid #334155', color: 'white', borderRadius: '4px', fontSize: '12px' }} />
              <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                <button type="button" onClick={() => setMostrarSimulador(false)} style={{ padding: '6px 12px', backgroundColor: '#64748b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>Cancelar</button>
                <button type="submit" style={{ padding: '6px 12px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px' }}>Enviar</button>
              </div>
            </form>
          </div>
        )}

        {/* CARDS DE RESUMO SUPERIOR */}
        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontSize: '14px', color: '#cbd5e1', marginBottom: '8px' }}>🌤️ Condições da Fazenda</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '12px' }}>
            <div style={{ backgroundColor: '#1e293b', padding: '12px', borderRadius: '8px', border: '1px solid #334155' }}>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>Umidade do Solo</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#f8fafc' }}>60%</div>
              <div style={{ fontSize: '10px', color: '#10b981', marginTop: '3px' }}>● Ideal</div>
            </div>
            <div style={{ backgroundColor: '#1e293b', padding: '12px', borderRadius: '8px', border: '1px solid #334155' }}>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>Temperatura do Solo</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#f8fafc' }}>23°C</div>
              <div style={{ fontSize: '10px', color: '#10b981', marginTop: '3px' }}>● Ideal</div>
            </div>
            <div style={{ backgroundColor: '#1e293b', padding: '12px', borderRadius: '8px', border: '1px solid #334155' }}>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>Precipitação (7 dias)</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#f8fafc' }}>12.6 mm</div>
              <div style={{ fontSize: '10px', color: '#38bdf8', marginTop: '3px' }}>● Normal</div>
            </div>
            <div style={{ backgroundColor: '#1e293b', padding: '12px', borderRadius: '8px', border: '1px solid #334155' }}>
              <div style={{ fontSize: '11px', color: '#94a3b8', marginBottom: '4px' }}>Radiação Solar</div>
              <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#f8fafc' }}>680 W/m²</div>
              <div style={{ fontSize: '10px', color: '#f59e0b', marginTop: '3px' }}>● Alta</div>
            </div>
          </div>
        </div>

        {/* LAYOUT PRINCIPAL EM DUAS COLUNAS */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
          
          {/* COLUNA ESQUERDA: SENSORES ATIVOS + HISTÓRICO DE LEITURAS */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            
            {/* SENSORES ATIVOS */}
            <div>
              <h3 style={{ fontSize: '14px', color: '#cbd5e1', marginBottom: '10px' }}>🌱 Sensores Ativos</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px' }}>
                {sensoresAtuais.map((evento, index) => {
                  const badge = obterStatusBadge(evento.alerta_disparado);
                  return (
                    <div key={index} style={{ 
                      backgroundColor: '#1e293b', 
                      borderRadius: '8px', 
                      padding: '12px', 
                      border: '1px solid #334155',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between'
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 'bold' }}>{evento.device_id}</span>
                        <span style={{ fontSize: '9px', padding: '2px 6px', borderRadius: '10px', backgroundColor: badge.bg, color: badge.cor, fontWeight: 'bold' }}>
                          {badge.texto}
                        </span>
                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '4px' }}>
                        <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#f8fafc' }}>{evento.leitura}</span>
                        <span style={{ fontSize: '9px', color: '#64748b' }}>
                          {new Date(evento.data_hora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* HISTÓRICO DE LEITURA DOS SENSORES (Dinâmico via API) */}
            <div style={{ backgroundColor: '#1e293b', borderRadius: '8px', padding: '14px', border: '1px solid #334155' }}>
              <h3 style={{ fontSize: '14px', color: '#cbd5e1', margin: '0 0 10px 0' }}>📄 Histórico de Leitura dos Sensores</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '220px', overflowY: 'auto' }}>
                {historicoOrdenado.slice(0, 10).map((hist, idx) => (
                  <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 0', borderBottom: '1px solid #334155', fontSize: '12px' }}>
                    <div>
                      <span style={{ fontWeight: 'bold', color: '#38bdf8' }}>{hist.device_id}</span>
                      <span style={{ color: '#94a3b8', marginLeft: '8px' }}>({hist.sensor_type})</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <span style={{ fontWeight: 'bold', color: '#f8fafc' }}>{hist.leitura}</span>
                      <span style={{ color: '#64748b', fontSize: '11px' }}>{new Date(hist.data_hora).toLocaleTimeString('pt-BR')}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* COLUNA DIREITA: ALERTAS IMPORTANTES */}
          <div>
            <h3 style={{ fontSize: '14px', color: '#ef4444', marginBottom: '10px' }}>🚨 Alertas Importantes</h3>
            <div style={{ 
              backgroundColor: '#1e293b', 
              borderRadius: '8px', 
              padding: '12px', 
              border: '1px solid #7f1d1d', 
              maxHeight: '440px', 
              overflowY: 'auto',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px'
            }}>
              {alertasAtivos.length === 0 ? (
                <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>Nenhum alerta crítico no momento.</p>
              ) : (
                alertasAtivos.map((alerta, idx) => (
                  <div key={idx} style={{ 
                    backgroundColor: 'rgba(239, 68, 68, 0.08)', 
                    borderLeft: '3px solid #ef4444', 
                    padding: '8px', 
                    borderRadius: '4px' 
                  }}>
                    <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#fca5a5' }}>{alerta.device_id}</div>
                    <div style={{ fontSize: '11px', color: '#cbd5e1', marginTop: '2px' }}>{alerta.mensagem_notificacao || 'Alerta disparado pelo sensor.'}</div>
                    <div style={{ fontSize: '9px', color: '#64748b', marginTop: '3px', textAlign: 'right' }}>
                      {new Date(alerta.data_hora).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}

export default App;
