import React, { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';

const PALAVRAS = [
  { palavra: "RODA", dica: "🔧 Parte circular do carro" },
  { palavra: "PNEU", dica: "🔧 Borracha que envolve a roda" },
  { palavra: "OLEO", dica: "🔧 Lubrifica o motor" },
  { palavra: "TREM", dica: "🚂 Veículo que anda em carris" },
  { palavra: "VELA", dica: "🔧 Peça de ignição do motor" },
  { palavra: "MOLA", dica: "🔧 Componente de suspensão" },
  { palavra: "CABO", dica: "🔧 Fio ou haste de metal" },
  { palavra: "PINO", dica: "🔧 Peça pequena de encaixe" },
  { palavra: "EIXO", dica: "🔧 Barra central de rotação" },
  { palavra: "TUBO", dica: "🔧 Condutor de fluidos" },
  { palavra: "LIMA", dica: "🔧 Ferramenta de lixar metal" },
  { palavra: "FITA", dica: "🔧 Fita métrica ou isoladora" },
  { palavra: "FUSO", dica: "🔧 Eixo de transmissão" },
  { palavra: "CHAO", dica: "🏭 Piso da oficina" },
];

const LGP_DESCRICAO = {
  A: "Punho fechado, polegar ao lado",
  B: "4 dedos esticados, polegar dobrado",
  C: "Mão curvada em forma de C",
  D: "Indicador esticado, resto toca polegar",
  E: "Dedos dobrados, pontas na palma",
  F: "Polegar toca indicador (ok)",
  G: "Polegar e indicador para o lado",
  H: "Indicador e médio horizontais",
  I: "Só mindinho esticado",
  J: "Mindinho faz movimento J",
  K: "Indicador esticado, médio dobrado",
  L: "Polegar e indicador fazem L",
  M: "3 dedos sobre o polegar",
  N: "2 dedos sobre o polegar",
  O: "Todos os dedos formam um O",
  P: "Como K mas para baixo",
  Q: "Como G mas para baixo",
  R: "Indicador e médio cruzados",
  S: "Punho, polegar por cima",
  T: "Polegar entre indicador e médio",
  U: "Indicador e médio juntos",
  V: "Indicador e médio em V",
  W: "I, M e A esticados",
  X: "Indicador em gancho",
  Y: "Polegar e mindinho esticados",
  Z: "Indicador traça Z",
};

function HandSVG({ letra }) {
  const skin = "#f5c89a"; const dark = "#d4956a"; const nail = "#fde8d8";
  const Palma = ({cx=100,cy=170,w=80,h=60}) => (<ellipse cx={cx} cy={cy} rx={w/2} ry={h/2} fill={skin} stroke={dark} strokeWidth="2"/>);
  const Dedo = ({x,y,w=18,h=50,rx=9,fill=skin}) => (<g><rect x={x-w/2} y={y-h} width={w} height={h+10} rx={rx} fill={fill} stroke={dark} strokeWidth="1.5"/><ellipse cx={x} cy={y-h+8} rx={w/2-2} ry={6} fill={nail} opacity="0.6"/></g>);
  const DedoDobrado = ({x,y,w=18,h=20,rx=9}) => (<rect x={x-w/2} y={y-h} width={w} height={h+10} rx={rx} fill={skin} stroke={dark} strokeWidth="1.5"/>);
  const gestos = {
    A: (<g><Palma/>{[72,88,104,120].map((x,i)=><DedoDobrado key={i} x={x} y={150} h={25}/>)}<rect x={48} y={138} width={16} height={30} rx={8} fill={skin} stroke={dark} strokeWidth="1.5"/></g>),
    B: (<g><Palma cy={175}/>{[72,88,104,120].map((x,i)=><Dedo key={i} x={x} y={175} h={60}/>)}<rect x={56} y={155} width={16} height={25} rx={8} fill={skin} stroke={dark} strokeWidth="1.5"/></g>),
    C: (<g><path d="M175,130 Q145,100 105,120 Q75,140 75,175 Q75,210 105,225 Q140,240 175,220" fill="none" stroke={dark} strokeWidth="3"/><path d="M175,130 Q145,100 105,120 Q75,140 75,175 Q75,210 105,225 Q140,240 175,220" fill={skin} stroke={dark} strokeWidth="2" opacity="0.9"/></g>),
    D: (<g><Palma cy={175}/><Dedo x={88} y={175} h={65}/>{[104,118].map((x,i)=><DedoDobrado key={i} x={x} y={155} h={20}/>)}<DedoDobrado x={72} y={155} h={20}/><ellipse cx={80} cy={162} rx={10} ry={8} fill={skin} stroke={dark} strokeWidth="1.5"/></g>),
    E: (<g><Palma cy={170}/>{[72,88,104,120].map((x,i)=><DedoDobrado key={i} x={x} y={155} h={22}/>)}<rect x={50} y={155} width={16} height={20} rx={8} fill={skin} stroke={dark} strokeWidth="1.5"/></g>),
    F: (<g><Palma cy={175}/><DedoDobrado x={88} y={155} h={22}/>{[104,120,136].map((x,i)=><Dedo key={i} x={x} y={175} h={55-i*3}/>)}<ellipse cx={75} cy={158} rx={10} ry={9} fill={skin} stroke={dark} strokeWidth="1.5"/></g>),
    G: (<g><Palma cy={175}/>{[88,104,120].map((x,i)=><DedoDobrado key={i} x={x} y={158} h={22}/>)}<rect x={115} y={148} width={50} height={16} rx={8} fill={skin} stroke={dark} strokeWidth="1.5"/><ellipse cx={116} cy={155} rx={9} ry={8} fill={nail} opacity="0.5"/><rect x={110} y={162} width={40} height={14} rx={7} fill={skin} stroke={dark} strokeWidth="1.5"/></g>),
    H: (<g><Palma cy={175}/>{[104,120].map((x,i)=><DedoDobrado key={i} x={x} y={158} h={22}/>)}<rect x={108} y={140} width={55} height={15} rx={7} fill={skin} stroke={dark} strokeWidth="1.5"/><rect x={108} y={156} width={55} height={15} rx={7} fill={skin} stroke={dark} strokeWidth="1.5"/></g>),
    I: (<g><Palma cy={175}/>{[72,88,104].map((x,i)=><DedoDobrado key={i} x={x} y={158} h={22}/>)}<Dedo x={120} y={175} h={55}/><rect x={50} y={158} width={16} height={22} rx={8} fill={skin} stroke={dark} strokeWidth="1.5"/></g>),
    J: (<g><Palma cy={175}/>{[72,88,104].map((x,i)=><DedoDobrado key={i} x={x} y={158} h={22}/>)}<Dedo x={120} y={175} h={55}/><rect x={50} y={158} width={16} height={22} rx={8} fill={skin} stroke={dark} strokeWidth="1.5"/><path d="M120,120 Q140,105 145,120 Q148,135 130,145" fill="none" stroke="#fbbf24" strokeWidth="2.5" strokeDasharray="4,2"/><polygon points="126,143 134,148 128,152" fill="#fbbf24"/></g>),
    K: (<g><Palma cy={175}/><Dedo x={88} y={175} h={65}/><DedoDobrado x={104} y={158} h={28}/>{[120,136].map((x,i)=><DedoDobrado key={i} x={x} y={155} h={22}/>)}<rect x={95} y={158} width={16} height={16} rx={7} fill={skin} stroke={dark} strokeWidth="1.5"/></g>),
    L: (<g><Palma cy={175}/>{[104,120,136].map((x,i)=><DedoDobrado key={i} x={x} y={158} h={22}/>)}<Dedo x={88} y={175} h={65}/><rect x={50} y={152} width={35} height={15} rx={7} fill={skin} stroke={dark} strokeWidth="1.5"/></g>),
    M: (<g><Palma cy={172}/>{[80,96,112].map((x,i)=><DedoDobrado key={i} x={x} y={162} h={28}/>)}<DedoDobrado x={128} y={158} h={22}/><ellipse cx={96} cy={168} rx={20} ry={8} fill={skin} stroke={dark} strokeWidth="1.5"/></g>),
    N: (<g><Palma cy={172}/>{[88,104].map((x,i)=><DedoDobrado key={i} x={x} y={162} h={28}/>)}{[120,136].map((x,i)=><DedoDobrado key={i} x={x} y={158} h={22}/>)}<ellipse cx={96} cy={168} rx={14} ry={8} fill={skin} stroke={dark} strokeWidth="1.5"/></g>),
    O: (<g><ellipse cx={100} cy={160} rx={38} ry={45} fill={skin} stroke={dark} strokeWidth="2"/><ellipse cx={100} cy={160} rx={20} ry={25} fill="#1e293b"/></g>),
    P: (<g><Palma cx={100} cy={130}/><Dedo x={88} y={130} h={55}/><DedoDobrado x={104} y={118} h={28}/>{[120,136].map((x,i)=><DedoDobrado key={i} x={x} y={115} h={22}/>)}</g>),
    Q: (<g><Palma cx={100} cy={130}/>{[80,96,112].map((x,i)=><DedoDobrado key={i} x={x} y={118} h={22}/>)}<rect x={58} y={130} width={50} height={15} rx={7} fill={skin} stroke={dark} strokeWidth="1.5"/><rect x={58} y={145} width={40} height={13} rx={6} fill={skin} stroke={dark} strokeWidth="1.5"/></g>),
    R: (<g><Palma cy={175}/>{[120,136].map((x,i)=><DedoDobrado key={i} x={x} y={158} h={22}/>)}<DedoDobrado x={72} y={158} h={22}/><rect x={80} y={115} width={17} height={65} rx={8} fill={skin} stroke={dark} strokeWidth="1.5" transform="rotate(-8,88,148)"/><rect x={95} y={115} width={17} height={65} rx={8} fill={skin} stroke={dark} strokeWidth="1.5" transform="rotate(8,104,148)"/></g>),
    S: (<g><Palma/>{[72,88,104,120].map((x,i)=><DedoDobrado key={i} x={x} y={152} h={25}/>)}<rect x={55} y={140} width={70} height={14} rx={7} fill={skin} stroke={dark} strokeWidth="1.5"/></g>),
    T: (<g><Palma/>{[72,88,104,120].map((x,i)=><DedoDobrado key={i} x={x} y={152} h={25}/>)}<ellipse cx={88} cy={150} rx={10} ry={9} fill={skin} stroke={dark} strokeWidth="1.5"/></g>),
    U: (<g><Palma cy={175}/><Dedo x={88} y={175} h={65}/><Dedo x={104} y={175} h={65}/>{[120,136].map((x,i)=><DedoDobrado key={i} x={x} y={158} h={22}/>)}<rect x={50} y={158} width={16} height={22} rx={8} fill={skin} stroke={dark} strokeWidth="1.5"/></g>),
    V: (<g><Palma cy={175}/>{[120,136].map((x,i)=><DedoDobrado key={i} x={x} y={158} h={22}/>)}<DedoDobrado x={72} y={158} h={22}/><Dedo x={88} y={175} h={65} fill={skin}/><Dedo x={110} y={175} h={65} fill={skin}/></g>),
    W: (<g><Palma cy={175}/><DedoDobrado x={136} y={158} h={22}/><DedoDobrado x={68} y={158} h={22}/>{[84,100,116].map((x,i)=><Dedo key={i} x={x} y={175} h={60-i*3}/>)}</g>),
    X: (<g><Palma cy={175}/>{[104,120,136].map((x,i)=><DedoDobrado key={i} x={x} y={158} h={22}/>)}<rect x={50} y={158} width={16} height={22} rx={8} fill={skin} stroke={dark} strokeWidth="1.5"/><path d="M88,155 Q88,130 96,125 Q104,120 104,135 Q104,148 88,155" fill={skin} stroke={dark} strokeWidth="1.5"/></g>),
    Y: (<g><Palma cy={175}/>{[88,104].map((x,i)=><DedoDobrado key={i} x={x} y={158} h={22}/>)}<DedoDobrado x={72} y={158} h={22}/><Dedo x={120} y={175} h={55}/><rect x={44} y={152} width={35} height={14} rx={7} fill={skin} stroke={dark} strokeWidth="1.5"/></g>),
    Z: (<g><Palma cy={175}/>{[104,120,136].map((x,i)=><DedoDobrado key={i} x={x} y={158} h={22}/>)}<rect x={50} y={158} width={16} height={22} rx={8} fill={skin} stroke={dark} strokeWidth="1.5"/><Dedo x={88} y={175} h={65}/><path d="M75,118 L105,118 L75,138 L105,138" fill="none" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round"/></g>),
  };
  return (<svg viewBox="0 0 200 260" width="120" height="120" style={{background:"#1e293b",borderRadius:8,padding:4}}><rect width="200" height="260" fill="#1e293b" rx="8"/>{gestos[letra] || <text x="100" y="140" textAnchor="middle" fill="#fbbf24" fontSize="80" fontWeight="bold">{letra}</text>}</svg>);
}

const ALFABETO = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
function dist2d(a, b) { return Math.sqrt((a.x-b.x)**2 + (a.y-b.y)**2); }
function curvaturaDedo(lm, ponta, mcp) {
  const dPonta = dist2d(lm[ponta], lm[0]); const dMcp = dist2d(lm[mcp], lm[0]);
  return Math.max(0, Math.min(1, (1.3 - (dPonta / (dMcp || 0.01))) / 0.6));
}
function dedosEstendidos(lm) {
  const pulso = lm[0]; const escala = dist2d(lm[0], lm[17]) || 0.1;
  const ext = (p, m) => dist2d(lm[p], pulso) > dist2d(lm[m], pulso) * 1.15;
  return [dist2d(lm[4], lm[2]) / escala > 0.45, ext(8, 5), ext(12, 9), ext(16, 13), ext(20, 17)];
}

function detetarLetra(lm) {
  const [P, I, M, A, Mi] = dedosEstendidos(lm);
  const nExt = [P,I,M,A,Mi].filter(Boolean).length;
  const escala = dist2d(lm[0], lm[17]) || 0.1;
  const dPolInd = dist2d(lm[4], lm[8]) / escala;
  const cI = curvaturaDedo(lm, 8, 5); const cM = curvaturaDedo(lm, 12, 9);
  const cA = curvaturaDedo(lm, 16, 13); const cMi = curvaturaDedo(lm, 20, 17);

  // Gestos abertos
  if (!P && I && M && A && Mi) return { letra: 'B', conf: 90 };
  if (!P && I && M && A && !Mi) return { letra: 'W', conf: 87 };
  if (P && I && M && !A && !Mi) return { letra: 'K', conf: 85 };
  if (P && I && !M && !A && !Mi) return { letra: 'L', conf: 88 };
  if (P && !I && !M && !A && Mi) return { letra: 'Y', conf: 90 };
  if (!P && I && M && !A && !Mi) return { letra: 'V', conf: 88 };
  if (!P && I && !M && !A && !Mi) return { letra: 'D', conf: 88 };
  if (!P && !I && !M && !A && Mi) return { letra: 'I', conf: 90 };

  // Gestos curvos (C, O, F) - Sensibilidade aumentada
  if (dPolInd < 0.35 && cI > 0.35 && cM > 0.35) return { letra: 'O', conf: 92 };
  if (dPolInd > 0.35 && dPolInd < 0.95 && cI < 0.7 && cM < 0.7) return { letra: 'C', conf: 88 };
  if (dPolInd < 0.45 && cI > 0.4 && cM < 0.45) return { letra: 'F', conf: 85 };

  // Punhos (A, S, T, E, M, N)
  if (nExt <= 1) {
    const polX = lm[4].x; const indX = lm[5].x; const medX = lm[9].x;
    const polY = lm[4].y; const indY = lm[5].y;
    if (Math.abs(polX - medX) < escala * 0.25 && polY < indY) return { letra: 'S', conf: 88 };
    if (polX > indX && polX < medX && polY < indY) return { letra: 'T', conf: 85 };
    if (polX < indX - escala * 0.05) return { letra: 'A', conf: 85 };
    if (dPolInd < 0.45 && dPolMed < 0.45) {
      if (dist2d(lm[4], lm[16])/escala < 0.5) return { letra: 'M', conf: 84 };
      return { letra: 'N', conf: 84 };
    }
    if (cI > 0.75 && cM > 0.75) return { letra: 'E', conf: 86 };
  }
  return { letra: null, conf: 0 };
}

function sortearPalavra() { return { ...PALAVRAS[Math.floor(Math.random() * PALAVRAS.length)] }; }

export default function App() {
  const [entrada, setEntrada] = useState(sortearPalavra);
  const [tentativas, setTentativas] = useState([]);
  const [atual, setAtual] = useState([]);
  const [estadoJogo, setEstadoJogo] = useState('jogando');
  const [pontuacao, setPontuacao] = useState(0);
  const [mensagem, setMensagem] = useState('');
  const [msgTipo, setMsgTipo] = useState('');
  const [camAtiva, setCamAtiva] = useState(false);
  const [letraCam, setLetraCam] = useState(null);
  const [confianca, setConfianca] = useState(0);
  const [contagem, setContagem] = useState(null);
  const [letraManual, setLetraManual] = useState(null);
  const videoRef = useRef(null); const canvasRef = useRef(null);
  const detectorRef = useRef(null); const streamRef = useRef(null);
  const animRef = useRef(null); const letraRef = useRef(null);
  const contTimerRef = useRef(null);

  const mostrarMsg = useCallback((txt, tipo = '', ms = 2000) => {
    setMensagem(txt); setMsgTipo(tipo);
    if (ms) setTimeout(() => setMensagem(''), ms);
  }, []);

  const confirmar = useCallback(() => {
    if (atual.length !== 4) { mostrarMsg('⚠️ Precisa de 4 letras!', 'aviso'); return; }
    const chute = atual.join('');
    const pArr = entrada.palavra.split('');
    const res = atual.map((l, i) => l === pArr[i] ? 'correto' : pArr.includes(l) ? 'presente' : 'errado');
    const novas = [...tentativas, { letras: atual, resultado: res }];
    setTentativas(novas); setAtual([]);
    if (chute === entrada.palavra) {
      setPontuacao(p => p + (7 - novas.length) * 100); setEstadoJogo('ganhou');
      mostrarMsg('🎉 Parabéns!', 'ganhou', 3000);
    } else if (novas.length >= 6) {
      setEstadoJogo('perdeu'); mostrarMsg(`😔 Era: ${entrada.palavra}`, 'perdeu', 4000);
    }
  }, [atual, entrada, tentativas, mostrarMsg]);

  const ligarCamera = useCallback(async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 } });
      streamRef.current = s; videoRef.current.srcObject = s; setCamAtiva(true);
      if (!window.Hands) {
        const script = document.createElement('script'); script.src = 'https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js';
        script.crossOrigin = 'anonymous'; await new Promise(r => { script.onload = r; document.head.appendChild(script); });
      }
      const hands = new window.Hands({ locateFile: (f) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${f}` });
      hands.setOptions({ maxNumHands: 1, modelComplexity: 1, minDetectionConfidence: 0.7, minTrackingConfidence: 0.7 });
      hands.onResults((results) => {
        const canvas = canvasRef.current; if (!canvas) return;
        const ctx = canvas.getContext('2d'); canvas.width = results.image.width; canvas.height = results.image.height;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        if (results.multiHandLandmarks?.length > 0) {
          const lm = results.multiHandLandmarks[0]; const { letra, conf } = detetarLetra(lm);
          setLetraCam(letra); setConfianca(conf);
          if (letra && conf >= 55) {
            if (letra !== letraRef.current) {
              letraRef.current = letra; clearInterval(contTimerRef.current);
              let secs = 3; setContagem(3);
              contTimerRef.current = setInterval(() => {
                secs--; setContagem(secs);
                if (secs <= 0) {
                  clearInterval(contTimerRef.current); setContagem(null);
                  setAtual(prev => prev.length < 4 ? [...prev, letra] : prev);
                  letraRef.current = null;
                }
              }, 1000);
            }
          } else { clearInterval(contTimerRef.current); setContagem(null); letraRef.current = null; }
          ctx.strokeStyle = '#fbbf24'; ctx.lineWidth = 2;
          [[0,1],[1,2],[2,3],[3,4],[0,5],[5,6],[6,7],[7,8],[0,9],[9,10],[10,11],[11,12],[0,13],[13,14],[14,15],[15,16],[0,17],[17,18],[18,19],[19,20]].forEach(([a,b]) => {
            ctx.beginPath(); ctx.moveTo(lm[a].x*canvas.width, lm[a].y*canvas.height); ctx.lineTo(lm[b].x*canvas.width, lm[b].y*canvas.height); ctx.stroke();
          });
        } else { setLetraCam(null); setConfianca(0); clearInterval(contTimerRef.current); setContagem(null); }
      });
      detectorRef.current = hands;
      const loop = async () => {
        if (videoRef.current?.readyState >= 2) await detectorRef.current.send({ image: videoRef.current });
        animRef.current = requestAnimationFrame(loop);
      };
      loop();
    } catch (e) { mostrarMsg('❌ Erro na câmara', 'erro'); }
  }, [mostrarMsg]);

  const desligarCamera = useCallback(() => {
    cancelAnimationFrame(animRef.current); streamRef.current?.getTracks().forEach(t => t.stop());
    setCamAtiva(false); clearInterval(contTimerRef.current); setContagem(null);
  }, []);

  return (
    <div className="app">
      <header className="cabecalho">
        <div className="cab-titulo"><span>🚂</span><div><h1>TREMU NA OFICINA</h1><p>LGP — Língua Gestual Portuguesa</p></div><span>🔧</span></div>
        <div className="pontuacao">⭐ {pontuacao} pts</div>
      </header>
      <div className="dica-bar"><span>💡 {entrada.dica}</span><span>Tentativas: {tentativas.length}/6</span></div>
      <div className="centro">
        <div className="cam-bloco">
          <div className="cam-topo"><span>📷 Câmara</span><button className="btn-cam" onClick={camAtiva ? desligarCamera : ligarCamera}>{camAtiva ? 'Desligar' : 'Ligar'}</button></div>
          <div className={`cam-video-wrap ${camAtiva ? '' : 'oculto'}`}><video ref={videoRef} className="cam-video" autoPlay muted playsInline /><canvas ref={canvasRef} className="cam-canvas" /></div>
          {camAtiva && (
            <div className="cam-info">
              <div className="letra-grande">{letraCam || '—'}</div>
              <div className="conf-bar"><div className="conf-fill" style={{ width: confianca + '%', background: confianca > 80 ? '#4ade80' : '#fbbf24' }} /></div>
              {contagem !== null && <div className="contagem">⏱️ {contagem}s</div>}
              <div className="palavra-preview">{[0,1,2,3].map(i => <div key={i} className="caixa">{atual[i] || '_'}</div>)}</div>
              <div className="cam-btns"><button className="btn-apagar" onClick={() => setAtual(prev => prev.slice(0,-1))}>←</button><button className="btn-confirmar" onClick={confirmar}>✓</button></div>
            </div>
          )}
        </div>
        <div className="grelha-bloco">
          <div className="grelha">
            {[0,1,2,3,4,5].map(ri => (
              <div key={ri} className="linha">
                {[0,1,2,3].map(ci => {
                  const t = tentativas[ri];
                  return <div key={ci} className={`celula ${t ? t.resultado[ci] : ''}`}>{t ? t.letras[ci] : (ri === tentativas.length ? atual[ci] : '')}</div>
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
      {mensagem && <div className={`mensagem ${msgTipo}`}>{mensagem}</div>}
      {estadoJogo !== 'jogando' && (
        <div className="fim-jogo">
          <h2>{estadoJogo === 'ganhou' ? 'Ganhaste!' : 'Perbeste!'}</h2>
          <p>A palavra era: {entrada.palavra}</p>
          <button className="btn-novo-jogo" onClick={() => { setEntrada(sortearPalavra()); setTentativas([]); setAtual([]); setEstadoJogo('jogando'); }}>Novo Jogo</button>
        </div>
      )}
      <div className="manual">
        <div className="manual-grid">{ALFABETO.map(l => <div key={l} className="manual-carta" onClick={() => setLetraManual(l)}>{l}</div>)}</div>
        {letraManual && <div className="manual-detalhe"><span>{letraManual}</span><HandSVG letra={letraManual} /><span>{LGP_DESCRICAO[letraManual]}</span></div>}
      </div>
    </div>
  );
}
