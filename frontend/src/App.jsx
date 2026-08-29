import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [eventos, setEventos] = useState([]);
  const [erro, setErro] = useState('');
  const [mostrarSimulador, setMostrarSimulador] = useState(false);
  
  // Estados para controlar os Modais do Menu Lateral
  const [mostrarModalClima, setMostrarModalClima] = useState(false);
  const [mostrarModalSensores, setMostrarModalSensores] = useState(false);
  const [mostrarModalHistorico, setMostrarModalHistorico] = useState(false);
  const [mostrarModalAlertas, setMostrarModalAlertas] = useState(false);
  
  const [menuAberto, setMenuAberto] = useState(false);
  
  // Estado para os dados de clima no Header
  const [climaHeader, setClimaHeader] = useState({
    temperatura: '--',
    chuva: '--',
    vento: '--',
    condicao: 'Lavras, MG'
  });

  // Estado para o relógio em tempo real
  const [dataHoraAtual, setDataHoraAtual] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setDataHoraAtual(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);
  
  const nomesSensores = {
    'sensor-temp-01': 'Temperatura do Ar',
    'sensor-humidity-01': 'Umidade do Ar',
    'sensor-soil-01': 'Umidade do Solo',
    'reservoir-sensor-01': 'Reservatório de Água',
    'silo-sensor-01': 'Silo de Grãos',
    'irrigation-pump-01': 'Bomba de Irrigação'
  };

  const formatarNomeSensor = (deviceId) => {
    return nomesSensores[deviceId] || deviceId;
  };

  const formatarValorComUnidade = (deviceId, leitura) => {
    // Se for o atuador de status, retorna o texto puro (ex: FAILURE, READY)
    if (deviceId === 'irrigation-pump-01') return leitura;
    if (isNaN(leitura)) return leitura;

    switch (deviceId) {
      case 'sensor-temp-01':
        return `${leitura} °C`;
      case 'sensor-humidity-01':
      case 'sensor-soil-01':
      case 'reservoir-sensor-01':
      case 'silo-sensor-01':
        return `${leitura} %`;
      default:
        return leitura;
    }
  };

  const sensoresOficiais = [
    { nome: 'Sensor de Temperatura do Ar', deviceId: 'sensor-temp-01', eventId: 'event-001', type: 'AIR_TEMPERATURE', unidade: '°C', leituraPadrao: '38.5' },
    { nome: 'Sensor de Umidade do Ar', deviceId: 'sensor-humidity-01', eventId: 'event-002', type: 'AIR_HUMIDITY', unidade: '%', leituraPadrao: '24.0' },
    { nome: 'Sensor de Umidade do Solo', deviceId: 'sensor-soil-01', eventId: 'event-003', type: 'SOIL_MOISTURE', unidade: '%', leituraPadrao: '17.0' },
    { nome: 'Sensor do Reservatório de Água', deviceId: 'reservoir-sensor-01', eventId: 'event-004', type: 'WATER_RESERVOIR_LEVEL', unidade: '%', leituraPadrao: '12.0' },
    { nome: 'Sensor do Silo de Grãos', deviceId: 'silo-sensor-01', eventId: 'event-005', type: 'SILO_LEVEL', unidade: '%', leituraPadrao: '10.0' },
    { nome: 'Bomba de Irrigação (Status)', deviceId: 'irrigation-pump-01', eventId: 'event-006', type: 'EQUIPMENT_STATUS', unidade: '', leituraPadrao: 'FAILURE' }
  ];

 
  const [sensorSelecionadoIndex, setSensorSelecionadoIndex] = useState(2);
  const [simLeitura, setSimLeitura] = useState(sensoresOficiais[2].leituraPadrao);

  const handleSelectSensor = (e) => {
    const idx = Number(e.target.value);
    setSensorSelecionadoIndex(idx);
    setSimLeitura(sensoresOficiais[idx].leituraPadrao);
  };

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

    const lat = -21.2489;
    const lon = -45.0003;
    fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,precipitation,wind_speed_10m`)
      .then(res => res.json())
      .then(data => {
        if (data && data.current) {
          setClimaHeader({
            temperatura: `${data.current.temperature_2m}°C`,
            chuva: `${data.current.precipitation} mm`,
            vento: `${data.current.wind_speed_10m} km/h`,
            condicao: 'Lavras, MG'
          });
        }
      })
      .catch(err => console.error("Erro ao buscar clima externo:", err));
  }, []);

  const handleSimularEnvio = async (e) => {
    e.preventDefault();
    const sensorAtual = sensoresOficiais[sensorSelecionadoIndex];

    const valorDigitadoStr = String(simLeitura).trim().toUpperCase();
    
    const ehNumeroValido = !isNaN(Number(simLeitura)) && simLeitura !== '';
    const ehStatusValido = valorDigitadoStr === 'FAILURE' || valorDigitadoStr === 'READY';

    if (!ehNumeroValido && !ehStatusValido) {
      alert(`⚠️ Erro de preenchimento: O sensor "${sensorAtual.nome}" exige um valor numérico válido ou um status operacional ("FAILURE" / "READY").`);
      return; 
    }

    const payload = {
      event_id: sensorAtual.eventId, // <-- Agora usa o ID padrão correto (ex: event-001, event-002...)
      farm_id: "farm-001",
      device_id: sensorAtual.deviceId,
      sensor_type: sensorAtual.type,
      leitura: isNaN(simLeitura) ? simLeitura : Number(simLeitura),
      unit: sensorAtual.unidade,
      timestamp: new Date().toISOString()
    };


    try {
      const resposta = await fetch('https://wcorporate.com.br/api-agro/api/eventos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!resposta.ok) {
        const erroDetalhes = await resposta.text();
        throw new Error(`Erro ${resposta.status}: ${erroDetalhes}`);
      }

      alert('Leitura simulada e enviada com sucesso!');
      setMostrarSimulador(false);
      buscarHistorico();
    } catch (err) {
      console.error(err);
      alert('Falha ao enviar: ' + err.message);
    }
  };

  const ultimosPorSensor = Array.isArray(eventos) ? eventos.reduce((acc, evento) => {
    if (!acc[evento.device_id] || new Date(evento.timestamp) > new Date(acc[evento.device_id].timestamp)) {
      acc[evento.device_id] = evento;
    }
    return acc;
  }, {}) : {};

  const sensoresAtuais = Object.values(ultimosPorSensor);
  
  const alertasAtivos = Array.isArray(eventos) 
    ? eventos.filter(e => e.alerta_disparado === 1).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 10) 
    : [];

  const historicoOrdenado = Array.isArray(eventos) 
    ? [...eventos].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 20) 
    : [];

  const historicoCompleto = Array.isArray(eventos) 
    ? [...eventos].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)) 
    : [];

  const obterStatusBadge = (alerta) => {
    if (alerta === 1) {
      return { cor: '#ef4444', texto: 'Crítico', bg: 'rgba(239, 68, 68, 0.15)' };
    } else {
      return { cor: '#10b981', texto: 'Ideal', bg: 'rgba(16, 185, 129, 0.15)' };
    }
  };

  const dataFormatada = dataHoraAtual.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  const horaFormatada = dataHoraAtual.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

  return (
    <div className="app-container" style={{ display: 'flex', width: '100vw', height: '100vh', backgroundColor: '#0f172a', color: '#f8fafc', fontFamily: 'Inter, sans-serif', overflow: 'hidden' }}>
      
      {/* SIDEBAR */}
      <aside className={`sidebar ${menuAberto ? 'open' : ''}`} style={{ width: '240px', backgroundColor: '#1e293b', borderRight: '1px solid #334155', display: 'flex', flexDirection: 'column', padding: '20px', flexShrink: 0, overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
          <div style={{ fontSize: '15px', fontWeight: 'bold', color: '#38bdf8', display: 'flex', alignItems: 'center', gap: '8px' }}>
            🔔 NotificationHub
          </div>
          {menuAberto && (
            <button onClick={() => setMenuAberto(false)} style={{ background: 'none', border: 'none', color: '#f8fafc', fontSize: '18px', cursor: 'pointer' }}>
              ✕
            </button>
          )}
        </div>
        
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px', flex: 1 }}>
          <div onClick={() => setMenuAberto(false)} style={{ padding: '8px 12px', borderRadius: '6px', backgroundColor: '#0284c7', color: 'white', fontWeight: 'bold', fontSize: '13px', cursor: 'pointer' }}>📊 Visão Geral</div>
          <div onClick={() => { setMenuAberto(false); setMostrarModalClima(true); }} style={{ padding: '8px 12px', borderRadius: '6px', color: '#94a3b8', fontSize: '13px', cursor: 'pointer' }}>🌤️ Clima</div>
          <div onClick={() => { setMenuAberto(false); setMostrarModalSensores(true); }} style={{ padding: '8px 12px', borderRadius: '6px', color: '#94a3b8', fontSize: '13px', cursor: 'pointer' }}>🌱 Sensores Ativos</div>
          <div onClick={() => { setMenuAberto(false); setMostrarModalHistorico(true); }} style={{ padding: '8px 12px', borderRadius: '6px', color: '#94a3b8', fontSize: '13px', cursor: 'pointer' }}>📄 Histórico Completo</div>
          <div onClick={() => { setMenuAberto(false); setMostrarModalAlertas(true); }} style={{ padding: '8px 12px', borderRadius: '6px', color: '#94a3b8', fontSize: '13px', cursor: 'pointer' }}>🚨 Alertas</div>

          <hr style={{ borderColor: '#334155', margin: '12px 0' }} />
          <div style={{ fontSize: '10px', color: '#64748b', textTransform: 'uppercase', marginBottom: '4px', letterSpacing: '0.5px' }}>Módulos Futuros</div>

          <div onClick={() => alert('Módulo de Culturas indisponível neste MVP.')} style={{ padding: '8px 12px', borderRadius: '6px', color: '#475569', fontSize: '13px', cursor: 'not-allowed', opacity: 0.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>🌾 Culturas</span>
            <span style={{ fontSize: '9px', backgroundColor: '#334155', padding: '1px 5px', borderRadius: '4px', color: '#94a3b8' }}>Em breve</span>
          </div>
          <div onClick={() => alert('Módulo de Irrigação indisponível neste MVP.')} style={{ padding: '8px 12px', borderRadius: '6px', color: '#475569', fontSize: '13px', cursor: 'not-allowed', opacity: 0.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>💧 Irrigação</span>
            <span style={{ fontSize: '9px', backgroundColor: '#334155', padding: '1px 5px', borderRadius: '4px', color: '#94a3b8' }}>Em breve</span>
          </div>
          <div onClick={() => alert('Módulo de Pecuária indisponível neste MVP.')} style={{ padding: '8px 12px', borderRadius: '6px', color: '#475569', fontSize: '13px', cursor: 'not-allowed', opacity: 0.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>🐂 Pecuária</span>
            <span style={{ fontSize: '9px', backgroundColor: '#334155', padding: '1px 5px', borderRadius: '4px', color: '#94a3b8' }}>Em breve</span>
          </div>
          <div onClick={() => alert('Módulo de Estoque indisponível neste MVP.')} style={{ padding: '8px 12px', borderRadius: '6px', color: '#475569', fontSize: '13px', cursor: 'not-allowed', opacity: 0.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>📦 Estoque</span>
            <span style={{ fontSize: '9px', backgroundColor: '#334155', padding: '1px 5px', borderRadius: '4px', color: '#94a3b8' }}>Em breve</span>
          </div>
          <div onClick={() => alert('Módulo de Relatórios indisponível neste MVP.')} style={{ padding: '8px 12px', borderRadius: '6px', color: '#475569', fontSize: '13px', cursor: 'not-allowed', opacity: 0.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>📋 Relatórios</span>
            <span style={{ fontSize: '9px', backgroundColor: '#334155', padding: '1px 5px', borderRadius: '4px', color: '#94a3b8' }}>Em breve</span>
          </div>
          <div onClick={() => alert('Módulo de Configurações indisponível neste MVP.')} style={{ padding: '8px 12px', borderRadius: '6px', color: '#475569', fontSize: '13px', cursor: 'not-allowed', opacity: 0.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>⚙️ Configurações</span>
            <span style={{ fontSize: '9px', backgroundColor: '#334155', padding: '1px 5px', borderRadius: '4px', color: '#94a3b8' }}>Em breve</span>
          </div>
        </nav>

        <div style={{ fontSize: '11px', color: '#64748b', textAlign: 'center', marginTop: '15px' }}>Safra 2026/2027</div>
      </aside>

      {/* CONTEÚDO PRINCIPAL */}
      <main className="main-content" style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', padding: '25px', width: '100%' }}>
        
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', borderBottom: '1px solid #334155', paddingBottom: '15px', flexWrap: 'wrap', gap: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <button className="menu-toggle-btn" onClick={() => setMenuAberto(true)}>
              ☰
            </button>
            <img 
              src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=100&h=100&fit=crop" 
              alt="Fazenda Boa Vista" 
              style={{ width: '42px', height: '42px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #38bdf8' }} 
            />
            <div>
              <h1 style={{ margin: 0, fontSize: '20px', color: '#f8fafc' }}>Fazenda Boa Vista</h1>
              <p style={{ margin: '2px 0 0 0', color: '#94a3b8', fontSize: '11px' }}>Painel de Monitoramento</p>
            </div>
          </div>

          {/* Widget de Clima */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', backgroundColor: '#1e293b', padding: '8px 16px', borderRadius: '10px', border: '1px solid #334155', fontSize: '12px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '16px' }}>⛅</span>
              <div>
                <span style={{ fontWeight: 'bold', fontSize: '14px', color: '#f8fafc' }}>{climaHeader.temperatura}</span>
                <span style={{ fontSize: '10px', color: '#94a3b8', display: 'block' }}>{climaHeader.condicao}</span>
              </div>
            </div>
            <div style={{ color: '#334155' }}>|</div>
            <div style={{ color: '#94a3b8', fontSize: '11px' }}>
              Chuva: <strong style={{ color: '#f8fafc' }}>{climaHeader.chuva}</strong>
            </div>
            <div style={{ color: '#334155' }}>|</div>
            <div style={{ color: '#94a3b8', fontSize: '11px' }}>
              💨 Vento: <strong style={{ color: '#f8fafc' }}>{climaHeader.vento}</strong>
            </div>
          </div>

          {/* Relógio e Data */}
          <div style={{ backgroundColor: '#1e293b', padding: '8px 14px', borderRadius: '10px', border: '1px solid #334155', textAlign: 'right' }}>
            <div style={{ fontSize: '11px', color: '#94a3b8' }}>{dataFormatada}</div>
            <div style={{ fontSize: '14px', fontWeight: 'bold', color: '#38bdf8' }}>{horaFormatada}</div>
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => setMostrarSimulador(!mostrarSimulador)} style={{ padding: '6px 12px', backgroundColor: '#d97706', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>
              🧪 Simular Leitura
            </button>
            <button onClick={buscarHistorico} style={{ padding: '6px 12px', backgroundColor: '#0284c7', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>
              🔄 Atualizar
            </button>
          </div>
        </header>

        {erro && <div style={{ backgroundColor: '#7f1d1d', color: '#fca5a5', padding: '8px', borderRadius: '6px', marginBottom: '15px', fontSize: '12px' }}>{erro}</div>}

        {/* MODAL DO SIMULADOR */}
        {mostrarSimulador && (
          <div style={{ backgroundColor: '#1e293b', border: '1px solid #38bdf8', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#38bdf8', fontSize: '14px' }}>🧪 Simular Envio de Dado do Sensor</h3>
            <form onSubmit={handleSimularEnvio} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px' }}>
              
              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '3px' }}>Selecione o Sensor:</label>
                <select value={sensorSelecionadoIndex} onChange={handleSelectSensor} style={{ width: '100%', padding: '6px', backgroundColor: '#0f172a', border: '1px solid #334155', color: 'white', borderRadius: '4px', fontSize: '12px' }}>
                  {sensoresOficiais.map((s, idx) => (
                    <option key={idx} value={idx}>{s.nome} ({s.deviceId})</option>
                  ))}
                </select>
              </div>

              <div style={{ gridColumn: '1 / -1' }}>
                <label style={{ fontSize: '11px', color: '#94a3b8', display: 'block', marginBottom: '3px' }}>Valor da Leitura Bruta:</label>
                <input type="text" value={simLeitura} onChange={e => setSimLeitura(e.target.value)} style={{ width: '100%', padding: '6px', backgroundColor: '#0f172a', border: '1px solid #334155', color: 'white', borderRadius: '4px', fontSize: '12px' }} />
                <span style={{ fontSize: '10px', color: '#64748b', marginTop: '4px', display: 'block', lineHeight: '1.4' }}>
                  Digite o valor numérico ou <span style={{ color: '#ef4444', fontWeight: 'bold' }}>FAILURE</span> / <span style={{ color: '#10b981', fontWeight: 'bold' }}>READY</span> para simular falhas/status em qualquer sensor!
                </span>
              </div>

              <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: '5px' }}>
                <button type="button" onClick={() => setMostrarSimulador(false)} style={{ padding: '6px 12px', backgroundColor: '#64748b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '11px' }}>Cancelar</button>
                <button type="submit" style={{ padding: '6px 12px', backgroundColor: '#10b981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px' }}>Enviar para API</button>
              </div>
            </form>
          </div>
        )}

        {/* --- MODAIS DE DESTAQUE PARA CADA MENU --- */}

        {/* 1. MODAL CLIMA */}
        {mostrarModalClima && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
            <div style={{ backgroundColor: '#1e293b', border: '1px solid #38bdf8', borderRadius: '12px', width: '100%', maxWidth: '500px', padding: '20px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid #334155', paddingBottom: '10px' }}>
                <h2 style={{ margin: 0, fontSize: '16px', color: '#38bdf8' }}>🌤️ Informações de Clima</h2>
                <button onClick={() => setMostrarModalClima(false)} style={{ background: 'none', border: 'none', color: '#f8fafc', fontSize: '18px', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px', backgroundColor: '#0f172a', padding: '15px', borderRadius: '8px' }}>
                <div>📍 Local: <strong style={{ color: '#38bdf8' }}>{climaHeader.condicao}</strong></div>
                <div>🌡️ Temperatura Atual: <strong style={{ color: '#f8fafc' }}>{climaHeader.temperatura}</strong></div>
                <div>🌧️ Precipitação (Chuva): <strong style={{ color: '#f8fafc' }}>{climaHeader.chuva}</strong></div>
                <div>💨 Velocidade do Vento: <strong style={{ color: '#f8fafc' }}>{climaHeader.vento}</strong></div>
              </div>
              <div style={{ marginTop: '20px', textAlign: 'right' }}>
                <button onClick={() => setMostrarModalClima(false)} style={{ padding: '8px 16px', backgroundColor: '#334155', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>Fechar</button>
              </div>
            </div>
          </div>
        )}

        {/* 2. MODAL SENSORES ATIVOS */}
        {mostrarModalSensores && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
            <div style={{ backgroundColor: '#1e293b', border: '1px solid #10b981', borderRadius: '12px', width: '100%', maxWidth: '700px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', padding: '20px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid #334155', paddingBottom: '10px' }}>
                <h2 style={{ margin: 0, fontSize: '16px', color: '#10b981' }}>🌱 Sensores Ativos em Tempo Real</h2>
                <button onClick={() => setMostrarModalSensores(false)} style={{ background: 'none', border: 'none', color: '#f8fafc', fontSize: '18px', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
              </div>
              <div style={{ overflowY: 'auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '10px', flex: 1 }}>
                {sensoresAtuais.map((evento, index) => {
                  const badge = obterStatusBadge(evento.alerta_disparado);
                  return (
                    <div key={index} style={{ backgroundColor: '#0f172a', borderRadius: '8px', padding: '12px', border: '1px solid #334155', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontSize: '12px', color: '#38bdf8', fontWeight: 'bold' }}>{formatarNomeSensor(evento.device_id)}</span>
                        <span style={{ fontSize: '9px', padding: '2px 6px', borderRadius: '10px', backgroundColor: badge.bg, color: badge.cor, fontWeight: 'bold' }}>{badge.texto}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '4px' }}>
                        <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#f8fafc' }}>
                          {formatarValorComUnidade(evento.device_id, evento.leitura)}
                        </span>
                        <span style={{ fontSize: '9px', color: '#64748b' }}>{new Date(evento.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{ marginTop: '15px', textAlign: 'right' }}>
                <button onClick={() => setMostrarModalSensores(false)} style={{ padding: '8px 16px', backgroundColor: '#334155', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>Fechar</button>
              </div>
            </div>
          </div>
        )}

        {/* 3. MODAL HISTÓRICO COMPLETO */}
        {mostrarModalHistorico && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
            <div style={{ backgroundColor: '#1e293b', border: '1px solid #0284c7', borderRadius: '12px', width: '100%', maxWidth: '750px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', padding: '20px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid #334155', paddingBottom: '10px' }}>
                <h2 style={{ margin: 0, fontSize: '16px', color: '#0284c7' }}>📄 Histórico Completo de Leituras ({historicoCompleto.length} registros)</h2>
                <button onClick={() => setMostrarModalHistorico(false)} style={{ background: 'none', border: 'none', color: '#f8fafc', fontSize: '18px', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
              </div>
              <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                {historicoCompleto.map((hist, idx) => {
                  const isCritico = hist.alerta_disparado === 1;
                  const corStatus = isCritico ? '#ef4444' : '#10b981';
                  const textoStatus = isCritico ? 'Crítico' : 'Ideal';

                  return (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 8px', backgroundColor: '#0f172a', borderRadius: '6px', borderBottom: '1px solid #334155', fontSize: '12px' }}>
                      <div style={{ fontWeight: 'bold', color: '#38bdf8' }}>
                        {formatarNomeSensor(hist.device_id)}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: corStatus, display: 'inline-block' }} title={textoStatus}></span>
                          <span style={{ fontWeight: 'bold', color: '#f8fafc', fontSize: '13px' }}>
                            {formatarValorComUnidade(hist.device_id, hist.leitura)}
                          </span>
                        </div>
                        <span style={{ color: '#94a3b8', fontSize: '11px', minWidth: '130px', textAlign: 'right' }}>
                          {new Date(hist.timestamp).toLocaleString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div style={{ marginTop: '15px', textAlign: 'right' }}>
                <button onClick={() => setMostrarModalHistorico(false)} style={{ padding: '8px 16px', backgroundColor: '#334155', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>Fechar</button>
              </div>
            </div>
          </div>
        )}

        {/* 4. MODAL ALERTAS */}
        {mostrarModalAlertas && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', backgroundColor: 'rgba(15, 23, 42, 0.85)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}>
            <div style={{ backgroundColor: '#1e293b', border: '1px solid #ef4444', borderRadius: '12px', width: '100%', maxWidth: '600px', maxHeight: '80vh', display: 'flex', flexDirection: 'column', padding: '20px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.5)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px', borderBottom: '1px solid #334155', paddingBottom: '10px' }}>
                <h2 style={{ margin: 0, fontSize: '16px', color: '#ef4444' }}>🚨 Central de Alertas Críticos</h2>
                <button onClick={() => setMostrarModalAlertas(false)} style={{ background: 'none', border: 'none', color: '#f8fafc', fontSize: '18px', cursor: 'pointer', fontWeight: 'bold' }}>✕</button>
              </div>
              <div style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
                {alertasAtivos.length === 0 ? (
                  <p style={{ fontSize: '13px', color: '#64748b', textAlign: 'center', margin: '30px 0' }}>Nenhum alerta crítico no momento.</p>
                ) : (
                  alertasAtivos.map((alerta, idx) => (
                    <div key={idx} style={{ backgroundColor: 'rgba(239, 68, 68, 0.08)', borderLeft: '4px solid #ef4444', padding: '12px', borderRadius: '6px' }}>
                      <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#fca5a5' }}>{formatarNomeSensor(alerta.device_id)}</div>
                      <div style={{ fontSize: '12px', color: '#cbd5e1', marginTop: '4px' }}>{alerta.mensagem_notificacao || 'Alerta disparado pelo sensor.'}</div>
                      <div style={{ fontSize: '10px', color: '#64748b', marginTop: '6px', textAlign: 'right' }}>{new Date(alerta.timestamp).toLocaleString('pt-BR')}</div>
                    </div>
                  ))
                )}
              </div>
              <div style={{ marginTop: '15px', textAlign: 'right' }}>
                <button onClick={() => setMostrarModalAlertas(false)} style={{ padding: '8px 16px', backgroundColor: '#334155', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px' }}>Fechar</button>
              </div>
            </div>
          </div>
        )}

        {/* GRID PRINCIPAL */}
        <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
          
          {/* COLUNA ESQUERDA */}
          <div className="coluna-esquerda" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <h3 style={{ fontSize: '14px', color: '#cbd5e1', marginBottom: '10px' }}>🌱 Sensores Ativos</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px' }}>
                {sensoresAtuais.map((evento, index) => {
                  const badge = obterStatusBadge(evento.alerta_disparado);
                  return (
                    <div key={index} style={{ backgroundColor: '#1e293b', borderRadius: '8px', padding: '12px', border: '1px solid #334155', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                        <span style={{ fontSize: '12px', color: '#38bdf8', fontWeight: 'bold' }}>{formatarNomeSensor(evento.device_id)}</span>
                        <span style={{ fontSize: '9px', padding: '2px 6px', borderRadius: '10px', backgroundColor: badge.bg, color: badge.cor, fontWeight: 'bold' }}>{badge.texto}</span>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '4px' }}>
                        <span style={{ fontSize: '16px', fontWeight: 'bold', color: '#f8fafc' }}>
                          {formatarValorComUnidade(evento.device_id, evento.leitura)}
                        </span>
                        <span style={{ fontSize: '9px', color: '#64748b' }}>{new Date(evento.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* HISTÓRICO DA TELA PRINCIPAL (Últimas 20) */}
            <div style={{ backgroundColor: '#1e293b', borderRadius: '8px', padding: '14px', border: '1px solid #334155' }}>
              <h3 style={{ fontSize: '14px', color: '#cbd5e1', margin: '0 0 10px 0' }}>📄 Histórico de Leitura dos Sensores (Últimas 20 Leituras)</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '350px', overflowY: 'auto' }}>
                {historicoOrdenado.map((hist, idx) => {
                  const isCritico = hist.alerta_disparado === 1;
                  const corStatus = isCritico ? '#ef4444' : '#10b981';
                  const textoStatus = isCritico ? 'Crítico' : 'Ideal';

                  return (
                    <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 4px', borderBottom: '1px solid #334155', fontSize: '12px' }}>
                      <div style={{ fontWeight: 'bold', color: '#38bdf8' }}>
                        {formatarNomeSensor(hist.device_id)}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: corStatus, display: 'inline-block' }} title={textoStatus}></span>
                          <span style={{ fontWeight: 'bold', color: '#f8fafc', fontSize: '13px' }}>
                            {formatarValorComUnidade(hist.device_id, hist.leitura)}
                          </span>
                        </div>
                        <span style={{ color: '#94a3b8', fontSize: '11px', minWidth: '115px', textAlign: 'right' }}>
                          {new Date(hist.timestamp).toLocaleString('pt-BR')}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* COLUNA DIREITA */}
          <div className="coluna-direita">
            <h3 style={{ fontSize: '14px', color: '#ef4444', marginBottom: '10px' }}>🚨 Alertas Importantes (Últimos 10)</h3>
            <div style={{ backgroundColor: '#1e293b', borderRadius: '8px', padding: '12px', border: '1px solid #7f1d1d', maxHeight: '520px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {alertasAtivos.length === 0 ? (
                <p style={{ fontSize: '11px', color: '#64748b', margin: 0 }}>Nenhum alerta crítico no momento.</p>
              ) : (
                alertasAtivos.map((alerta, idx) => (
                  <div key={idx} style={{ backgroundColor: 'rgba(239, 68, 68, 0.08)', borderLeft: '3px solid #ef4444', padding: '8px', borderRadius: '4px' }}>
                    <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#fca5a5' }}>{formatarNomeSensor(alerta.device_id)}</div>
                    <div style={{ fontSize: '11px', color: '#cbd5e1', marginTop: '2px' }}>{alerta.mensagem_notificacao || 'Alerta disparado pelo sensor.'}</div>
                    <div style={{ fontSize: '9px', color: '#64748b', marginTop: '3px', textAlign: 'right' }}>{new Date(alerta.timestamp).toLocaleString('pt-BR')}</div>
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
