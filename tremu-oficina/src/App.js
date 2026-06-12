import React, { useState, useEffect, useRef, useCallback } from 'react';
import './App.css';
import '@tensorflow/tfjs-core';
import '@tensorflow/tfjs-backend-webgl';
import * as hpd from '@tensorflow-models/hand-pose-detection';

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

// Descrições dos gestos LGP para o manual
const LGP_DESCRICAO = {
  A: "Punho fechado, polegar ao lado",
  B: "4 dedos juntos esticados para cima, polegar dobrado",
  C: "Mão curvada em forma de C",
  D: "Indicador esticado, restantes curvados a tocar o polegar",
  E: "Todos os dedos dobrados, pontas na palma",
  F: "Polegar toca indicador (ok), restantes esticados",
  G: "Polegar e indicador apontam para o lado",
  H: "Indicador e médio esticados horizontalmente",
  I: "Só o mindinho esticado",
  J: "Mindinho esticado, faz movimento de J",
  K: "Indicador esticado, médio dobrado, polegar no meio",
  L: "Polegar e indicador fazem L",
  M: "3 dedos dobrados sobre o polegar",
  N: "2 dedos dobrados sobre o polegar",
  O: "Todos os dedos formam um O com o polegar",
  P: "Como K mas apontado para baixo",
  Q: "Como G mas apontado para baixo",
  R: "Indicador e médio cruzados",
  S: "Punho fechado, polegar por cima dos dedos",
  T: "Polegar entre indicador e médio (punho)",
  U: "Indicador e médio juntos esticados",
  V: "Indicador e médio esticados em V",
  W: "Indicador, médio e anelar esticados em W",
  X: "Indicador dobrado em gancho",
  Y: "Polegar e mindinho esticados",
  Z: "Indicador traça Z no ar",
};


// Componente SVG que desenha a mão para cada letra do alfabeto gestual
function HandSVG({ letra }) {
  const skin = "#f5c89a";
  const dark = "#d4956a";
  const nail = "#fde8d8";

  // Palma base comum
  const Palma = ({cx=100,cy=170,w=80,h=60}) => (
    <ellipse cx={cx} cy={cy} rx={w/2} ry={h/2} fill={skin} stroke={dark} strokeWidth="2"/>
  );

  // Dedo genérico
  const Dedo = ({x,y,w=18,h=50,rx=9,fill=skin}) => (
    <g>
      <rect x={x-w/2} y={y-h} width={w} height={h+10} rx={rx} fill={fill} stroke={dark} strokeWidth="1.5"/>
      <ellipse cx={x} cy={y-h+8} rx={w/2-2} ry={6} fill={nail} opacity="0.6"/>
    </g>
  );

  // Dedo dobrado (apenas a base visível)
  const DedoDobrado = ({x,y,w=18,h=20,rx=9}) => (
    <rect x={x-w/2} y={y-h} width={w} height={h+10} rx={rx} fill={skin} stroke={dark} strokeWidth="1.5"/>
  );

  const gestos = {
    A: ( // Punho fechado, polegar ao lado
      <g>
        <Palma/>
        {[72,88,104,120].map((x,i)=><DedoDobrado key={i} x={x} y={150} h={25}/>)}
        {/* polegar ao lado */}
        <rect x={48} y={138} width={16} height={30} rx={8} fill={skin} stroke={dark} strokeWidth="1.5"/>
      </g>
    ),
    B: ( // 4 dedos esticados, polegar dobrado
      <g>
        <Palma cy={175}/>
        {[72,88,104,120].map((x,i)=><Dedo key={i} x={x} y={175} h={60}/>)}
        <rect x={56} y={155} width={16} height={25} rx={8} fill={skin} stroke={dark} strokeWidth="1.5"/>
      </g>
    ),
    C: ( // Mão em C
      <g>
        <path d="M140,120 Q170,100 170,160 Q170,210 140,220" fill="none" stroke={dark} strokeWidth="3"/>
        <path d="M140,120 Q105,100 100,160 Q100,210 140,220" fill={skin} stroke={dark} strokeWidth="2"/>
        <path d="M100,160 Q100,100 140,90 Q175,80 180,140" fill="none" stroke={skin} strokeWidth="18"/>
        <path d="M100,160 Q100,215 140,225 Q175,230 180,190" fill="none" stroke={skin} strokeWidth="18"/>
        {/* contorno C */}
        <path d="M175,130 Q145,100 105,120 Q75,140 75,175 Q75,210 105,225 Q140,240 175,220"
              fill="none" stroke={dark} strokeWidth="3"/>
        <path d="M175,130 Q145,100 105,120 Q75,140 75,175 Q75,210 105,225 Q140,240 175,220"
              fill={skin} stroke={dark} strokeWidth="2" opacity="0.9"/>
      </g>
    ),
    D: ( // Indicador esticado, resto curvo tocando polegar
      <g>
        <Palma cy={175}/>
        <Dedo x={88} y={175} h={65}/>
        {[104,118].map((x,i)=><DedoDobrado key={i} x={x} y={155} h={20}/>)}
        <DedoDobrado x={72} y={155} h={20}/>
        {/* polegar toca dedos curvados */}
        <ellipse cx={80} cy={162} rx={10} ry={8} fill={skin} stroke={dark} strokeWidth="1.5"/>
      </g>
    ),
    E: ( // Todos os dedos dobrados, pontas na palma
      <g>
        <Palma cy={170}/>
        {[72,88,104,120].map((x,i)=><DedoDobrado key={i} x={x} y={155} h={22}/>)}
        <rect x={50} y={155} width={16} height={20} rx={8} fill={skin} stroke={dark} strokeWidth="1.5"/>
      </g>
    ),
    F: ( // Polegar toca indicador, resto esticado
      <g>
        <Palma cy={175}/>
        <DedoDobrado x={88} y={155} h={22}/>
        {[104,120,136].map((x,i)=><Dedo key={i} x={x} y={175} h={55-i*3}/>)}
        <ellipse cx={75} cy={158} rx={10} ry={9} fill={skin} stroke={dark} strokeWidth="1.5"/>
      </g>
    ),
    G: ( // Polegar e indicador apontam para o lado
      <g>
        <Palma cy={175}/>
        {[88,104,120].map((x,i)=><DedoDobrado key={i} x={x} y={158} h={22}/>)}
        {/* indicador apontado lado */}
        <rect x={115} y={148} width={50} height={16} rx={8} fill={skin} stroke={dark} strokeWidth="1.5"/>
        <ellipse cx={116} cy={155} rx={9} ry={8} fill={nail} opacity="0.5"/>
        {/* polegar */}
        <rect x={110} y={162} width={40} height={14} rx={7} fill={skin} stroke={dark} strokeWidth="1.5"/>
      </g>
    ),
    H: ( // Indicador e médio esticados horizontalmente
      <g>
        <Palma cy={175}/>
        {[104,120].map((x,i)=><DedoDobrado key={i} x={x} y={158} h={22}/>)}
        {/* indicador e médio deitados */}
        <rect x={108} y={140} width={55} height={15} rx={7} fill={skin} stroke={dark} strokeWidth="1.5"/>
        <rect x={108} y={156} width={55} height={15} rx={7} fill={skin} stroke={dark} strokeWidth="1.5"/>
      </g>
    ),
    I: ( // Só o mindinho esticado
      <g>
        <Palma cy={175}/>
        {[72,88,104].map((x,i)=><DedoDobrado key={i} x={x} y={158} h={22}/>)}
        <Dedo x={120} y={175} h={55}/>
        <rect x={50} y={158} width={16} height={22} rx={8} fill={skin} stroke={dark} strokeWidth="1.5"/>
      </g>
    ),
    J: ( // Mindinho esticado + movimento J
      <g>
        <Palma cy={175}/>
        {[72,88,104].map((x,i)=><DedoDobrado key={i} x={x} y={158} h={22}/>)}
        <Dedo x={120} y={175} h={55}/>
        <rect x={50} y={158} width={16} height={22} rx={8} fill={skin} stroke={dark} strokeWidth="1.5"/>
        {/* seta J */}
        <path d="M120,120 Q140,105 145,120 Q148,135 130,145" fill="none" stroke="#fbbf24" strokeWidth="2.5" strokeDasharray="4,2"/>
        <polygon points="126,143 134,148 128,152" fill="#fbbf24"/>
      </g>
    ),
    K: ( // Indicador esticado, médio dobrado, polegar no meio
      <g>
        <Palma cy={175}/>
        <Dedo x={88} y={175} h={65}/>
        <DedoDobrado x={104} y={158} h={28}/>
        {[120,136].map((x,i)=><DedoDobrado key={i} x={x} y={155} h={22}/>)}
        <rect x={95} y={158} width={16} height={16} rx={7} fill={skin} stroke={dark} strokeWidth="1.5"/>
      </g>
    ),
    L: ( // Polegar e indicador em L
      <g>
        <Palma cy={175}/>
        {[104,120,136].map((x,i)=><DedoDobrado key={i} x={x} y={158} h={22}/>)}
        <Dedo x={88} y={175} h={65}/>
        <rect x={50} y={152} width={35} height={15} rx={7} fill={skin} stroke={dark} strokeWidth="1.5"/>
      </g>
    ),
    M: ( // 3 dedos dobrados sobre polegar
      <g>
        <Palma cy={172}/>
        {[80,96,112].map((x,i)=><DedoDobrado key={i} x={x} y={162} h={28}/>)}
        <DedoDobrado x={128} y={158} h={22}/>
        <ellipse cx={96} cy={168} rx={20} ry={8} fill={skin} stroke={dark} strokeWidth="1.5"/>
      </g>
    ),
    N: ( // 2 dedos dobrados sobre polegar
      <g>
        <Palma cy={172}/>
        {[88,104].map((x,i)=><DedoDobrado key={i} x={x} y={162} h={28}/>)}
        {[120,136].map((x,i)=><DedoDobrado key={i} x={x} y={158} h={22}/>)}
        <ellipse cx={96} cy={168} rx={14} ry={8} fill={skin} stroke={dark} strokeWidth="1.5"/>
      </g>
    ),
    O: ( // Todos os dedos formam O
      <g>
        <ellipse cx={100} cy={160} rx={38} ry={45} fill={skin} stroke={dark} strokeWidth="2"/>
        <ellipse cx={100} cy={160} rx={20} ry={25} fill="#1e293b"/>
        <ellipse cx={100} cy={160} rx={18} ry={23} fill="#1e293b"/>
      </g>
    ),
    P: ( // Como K mas para baixo
      <g>
        <Palma cx={100} cy={130}/>
        <Dedo x={88} y={130} h={55}/>
        <DedoDobrado x={104} y={118} h={28}/>
        {[120,136].map((x,i)=><DedoDobrado key={i} x={x} y={115} h={22}/>)}
      </g>
    ),
    Q: ( // Como G mas para baixo
      <g>
        <Palma cx={100} cy={130}/>
        {[80,96,112].map((x,i)=><DedoDobrado key={i} x={x} y={118} h={22}/>)}
        <rect x={58} y={130} width={50} height={15} rx={7} fill={skin} stroke={dark} strokeWidth="1.5"/>
        <rect x={58} y={145} width={40} height={13} rx={6} fill={skin} stroke={dark} strokeWidth="1.5"/>
      </g>
    ),
    R: ( // Indicador e médio cruzados
      <g>
        <Palma cy={175}/>
        {[120,136].map((x,i)=><DedoDobrado key={i} x={x} y={158} h={22}/>)}
        <DedoDobrado x={72} y={158} h={22}/>
        {/* dois dedos cruzados */}
        <rect x={80} y={115} width={17} height={65} rx={8} fill={skin} stroke={dark} strokeWidth="1.5" transform="rotate(-8,88,148)"/>
        <rect x={95} y={115} width={17} height={65} rx={8} fill={skin} stroke={dark} strokeWidth="1.5" transform="rotate(8,104,148)"/>
      </g>
    ),
    S: ( // Punho fechado, polegar por cima
      <g>
        <Palma/>
        {[72,88,104,120].map((x,i)=><DedoDobrado key={i} x={x} y={152} h={25}/>)}
        <rect x={55} y={140} width={70} height={14} rx={7} fill={skin} stroke={dark} strokeWidth="1.5"/>
      </g>
    ),
    T: ( // Polegar entre indicador e médio
      <g>
        <Palma/>
        {[72,88,104,120].map((x,i)=><DedoDobrado key={i} x={x} y={152} h={25}/>)}
        <ellipse cx={88} cy={150} rx={10} ry={9} fill={skin} stroke={dark} strokeWidth="1.5"/>
      </g>
    ),
    U: ( // Indicador e médio juntos esticados
      <g>
        <Palma cy={175}/>
        <Dedo x={88} y={175} h={65}/>
        <Dedo x={104} y={175} h={65}/>
        {[120,136].map((x,i)=><DedoDobrado key={i} x={x} y={158} h={22}/>)}
        <rect x={50} y={158} width={16} height={22} rx={8} fill={skin} stroke={dark} strokeWidth="1.5"/>
      </g>
    ),
    V: ( // Indicador e médio em V
      <g>
        <Palma cy={175}/>
        {[120,136].map((x,i)=><DedoDobrado key={i} x={x} y={158} h={22}/>)}
        <DedoDobrado x={72} y={158} h={22}/>
        <Dedo x={88} y={175} h={65} fill={skin}/>
        <Dedo x={110} y={175} h={65} fill={skin}/>
      </g>
    ),
    W: ( // Indicador, médio e anelar esticados
      <g>
        <Palma cy={175}/>
        <DedoDobrado x={136} y={158} h={22}/>
        <DedoDobrado x={68} y={158} h={22}/>
        {[84,100,116].map((x,i)=><Dedo key={i} x={x} y={175} h={60-i*3}/>)}
      </g>
    ),
    X: ( // Indicador dobrado em gancho
      <g>
        <Palma cy={175}/>
        {[104,120,136].map((x,i)=><DedoDobrado key={i} x={x} y={158} h={22}/>)}
        <rect x={50} y={158} width={16} height={22} rx={8} fill={skin} stroke={dark} strokeWidth="1.5"/>
        {/* gancho */}
        <path d="M88,155 Q88,130 96,125 Q104,120 104,135 Q104,148 88,155" fill={skin} stroke={dark} strokeWidth="1.5"/>
      </g>
    ),
    Y: ( // Polegar e mindinho esticados
      <g>
        <Palma cy={175}/>
        {[88,104].map((x,i)=><DedoDobrado key={i} x={x} y={158} h={22}/>)}
        <DedoDobrado x={72} y={158} h={22}/>
        <Dedo x={120} y={175} h={55}/>
        <rect x={44} y={152} width={35} height={14} rx={7} fill={skin} stroke={dark} strokeWidth="1.5"/>
      </g>
    ),
    Z: ( // Indicador traça Z
      <g>
        <Palma cy={175}/>
        {[104,120,136].map((x,i)=><DedoDobrado key={i} x={x} y={158} h={22}/>)}
        <rect x={50} y={158} width={16} height={22} rx={8} fill={skin} stroke={dark} strokeWidth="1.5"/>
        <Dedo x={88} y={175} h={65}/>
        {/* seta Z */}
        <path d="M75,118 L105,118 L75,138 L105,138" fill="none" stroke="#fbbf24" strokeWidth="2.5" strokeLinecap="round"/>
        <polygon points="102,134 108,141 98,141" fill="#fbbf24"/>
      </g>
    ),
  };

  return (
    <svg viewBox="0 0 200 260" width="120" height="120" style={{background:"#1e293b",borderRadius:8,padding:4}}>
      <rect width="200" height="260" fill="#1e293b" rx="8"/>
      {gestos[letra] || <text x="100" y="140" textAnchor="middle" fill="#fbbf24" fontSize="80" fontWeight="bold">{letra}</text>}
    </svg>
  );
}

const ALFABETO = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

// Deteção de gestos baseada nos 21 pontos do HandPose
function dist(a, b) {
  return Math.sqrt((a.x-b.x)**2 + (a.y-b.y)**2 + ((a.z||0)-(b.z||0))**2);
}

function dist2d(a, b) {
  return Math.sqrt((a.x-b.x)**2 + (a.y-b.y)**2);
}

// Retorna valor 0..1 de quão dobrado está o dedo (0=esticado, 1=fechado)
function curvaturaDedo(lm, ponta, media, base, mcp) {
  const dPonta = dist2d(lm[ponta], lm[0]);
  const dMcp   = dist2d(lm[mcp],   lm[0]);
  // Se ponta está muito mais perto do pulso do que a articulação base, está dobrado
  const ratio = dPonta / (dMcp || 0.01);
  // ratio < 1 = dobrado, ratio > 1.2 = esticado
  return Math.max(0, Math.min(1, (1.3 - ratio) / 0.6));
}

function dedosEstendidos(lm) {
  const pulso  = lm[0];
  const escala = dist2d(pulso, lm[17]) || 0.1;

  // Cada dedo: ponta mais longe do pulso que a sua base MCP
  function ext(ponta, mcp) {
    return dist2d(lm[ponta], pulso) > dist2d(lm[mcp], pulso) * 1.15;
  }

  const P  = dist2d(lm[4], lm[2]) / escala > 0.45; // polegar: distância ponta-base
  const I  = ext(8,  5);
  const M  = ext(12, 9);
  const A  = ext(16, 13);
  const Mi = ext(20, 17);

  return [P, I, M, A, Mi];
}

function detetarLetra(lm) {
  const [P, I, M, A, Mi] = dedosEstendidos(lm);
  const nExt = [P,I,M,A,Mi].filter(Boolean).length;

  const pulso  = lm[0];
  const escala = dist2d(pulso, lm[17]) || 0.1;

  // Distâncias úteis (normalizadas pela escala da mão)
  const dPolInd = dist2d(lm[4], lm[8])  / escala; // polegar-indicador
  const dPolMed = dist2d(lm[4], lm[12]) / escala; // polegar-médio
  const sepIndMed = dist2d(lm[8], lm[12]) / escala; // separação indicador-médio

  // Curvatura de cada dedo (0=esticado, 1=fechado)
  const cI  = curvaturaDedo(lm, 8,  7,  6,  5);
  const cM  = curvaturaDedo(lm, 12, 11, 10, 9);
  const cA  = curvaturaDedo(lm, 16, 15, 14, 13);
  const cMi = curvaturaDedo(lm, 20, 19, 18, 17);

  // Mão totalmente relaxada/neutra — não detetar nada
  // (todos os dedos semi-esticados sem padrão claro)
  if (nExt >= 3 && P && I && M) return { letra: null, conf: 0 };

  // ── PADRÕES POR Nº DE DEDOS ESTENDIDOS ───────────────────────

  // 4 dedos + sem polegar = B
  if (!P && I && M && A && Mi)    return { letra: 'B', conf: 90 };

  // Polegar + mindinho = Y
  if (P && !I && !M && !A && Mi)  return { letra: 'Y', conf: 90 };

  // Só mindinho = I
  if (!P && !I && !M && !A && Mi) return { letra: 'I', conf: 90 };

  // Só indicador = D
  if (!P && I && !M && !A && !Mi) {
    // Confirma que os outros estão mesmo dobrados
    if (cM > 0.4 && cA > 0.4) return { letra: 'D', conf: 88 };
  }

  // Indicador + médio + anelar = W
  if (!P && I && M && A && !Mi)   return { letra: 'W', conf: 87 };

  // Polegar + indicador = L ou G
  if (P && I && !M && !A && !Mi) {
    if (cM > 0.4 && cA > 0.4 && cMi > 0.4) { // outros dobrados
      const dyInd = (lm[5].y - lm[8].y) / escala;
      if (dyInd > 0.25) return { letra: 'L', conf: 88 };
      return { letra: 'G', conf: 82 };
    }
  }

  // Indicador + médio = V, U ou R
  if (!P && I && M && !A && !Mi) {
    if (cA > 0.4 && cMi > 0.4) { // outros dobrados
      if (sepIndMed > 0.35)  return { letra: 'V', conf: 88 };
      if (lm[8].x < lm[12].x - 0.01) return { letra: 'R', conf: 84 };
      return { letra: 'U', conf: 84 };
    }
  }

  // Polegar + indicador + médio = K ou P
  if (P && I && M && !A && !Mi) {
    if (cA > 0.4 && cMi > 0.4) {
      const dyInd = (lm[5].y - lm[8].y) / escala;
      if (dyInd > 0.2) return { letra: 'K', conf: 82 };
      return { letra: 'P', conf: 80 };
    }
  }

  // ── PADRÕES COM DEDOS DOBRADOS ────────────────────────────────

  // F: polegar toca indicador, médio+anelar+mindinho esticados
  if (!P && !I && M && A && Mi) {
    if (dPolInd < 0.3) return { letra: 'F', conf: 88 };
  }

  // O: todos curvados, polegar toca indicador (circulo fechado)
  if (!P && !I && !M && !A && !Mi) {
    if (dPolInd < 0.3 && cI > 0.3 && cM > 0.3) return { letra: 'O', conf: 90 };
  }

  // C: dedos semi-curvados, polegar afastado formando C
  // Requer que NENHUM dedo esteja esticado e que polegar-indicador tenha distância média
  if (nExt === 0 && dPolInd > 0.3 && dPolInd < 0.65) {
    if (cI < 0.8 && cM < 0.8) return { letra: 'C', conf: 84 };
  }

  // A: punho fechado, polegar ao lado
  if (nExt === 0) {
    if (dPolInd > 0.2 && cI > 0.5 && cM > 0.5 && cA > 0.5) {
      return { letra: 'A', conf: 86 };
    }
  }

  // S: punho fechado, polegar por cima dos dedos (ponta polegar perto do médio)
  if (nExt === 0 && dPolMed < 0.25) return { letra: 'S', conf: 82 };

  return { letra: null, conf: 0 };
}

function sortearPalavra() {
  return { ...PALAVRAS[Math.floor(Math.random() * PALAVRAS.length)] };
}

export default function App() {
  const MAX_TENT = 6;
  const TAMANHO  = 4;

  // Estado do jogo
  const [entrada,      setEntrada]      = useState(sortearPalavra);
  const [tentativas,   setTentativas]   = useState([]);
  const [atual,        setAtual]        = useState([]);
  const [estadoJogo,   setEstadoJogo]   = useState('jogando');
  const [pontuacao,    setPontuacao]    = useState(0);
  const [mensagem,     setMensagem]     = useState('');
  const [msgTipo,      setMsgTipo]      = useState('');

  // Estado câmara
  const [camAtiva,     setCamAtiva]     = useState(false);
  const [modeloOk,     setModeloOk]     = useState(false);
  const [letraCam,     setLetraCam]     = useState(null);
  const [confianca,    setConfianca]    = useState(0);
  const [contagem,     setContagem]     = useState(null);
  const [letraManual,  setLetraManual]  = useState(null);
  const [debugInfo,    setDebugInfo]    = useState('aguarda...');

  // Refs
  const videoRef      = useRef(null);
  const canvasRef     = useRef(null);
  const detectorRef   = useRef(null);
  const streamRef     = useRef(null);
  const animRef       = useRef(null);
  const letraRef      = useRef(null);
  const contTimerRef  = useRef(null);
  const contSecsRef   = useRef(0);

  // ── Mostrar mensagem temporária ──────────────────────────────
  const mostrarMsg = useCallback((txt, tipo = '', ms = 2000) => {
    setMensagem(txt);
    setMsgTipo(tipo);
    if (ms) setTimeout(() => setMensagem(''), ms);
  }, []);

  // ── Lógica do jogo ───────────────────────────────────────────
  const calcularResultado = (chute, palavra) => {
    const res  = Array(TAMANHO).fill('errado');
    const pArr = palavra.split('');
    const cArr = chute.split('');
    const used = Array(TAMANHO).fill(false);
    for (let i = 0; i < TAMANHO; i++)
      if (cArr[i] === pArr[i]) { res[i] = 'correto'; used[i] = true; }
    for (let i = 0; i < TAMANHO; i++) {
      if (res[i] === 'correto') continue;
      for (let j = 0; j < TAMANHO; j++)
        if (!used[j] && cArr[i] === pArr[j]) { res[i] = 'presente'; used[j] = true; break; }
    }
    return res;
  };

  const confirmar = useCallback(() => {
    setAtual(prev => {
      if (prev.length !== TAMANHO) { mostrarMsg('⚠️ Precisa de 4 letras!', 'aviso'); return prev; }
      const chute     = prev.join('');
      const resultado = calcularResultado(chute, entrada.palavra);
      const nova      = { letras: prev, resultado };
      setTentativas(t => {
        const novas = [...t, nova];
        if (chute === entrada.palavra) {
          const bonus = (MAX_TENT - novas.length + 1) * 100;
          setPontuacao(p => p + bonus);
          setEstadoJogo('ganhou');
          mostrarMsg(`🎉 Parabéns! +${bonus} pontos!`, 'ganhou', 3000);
        } else if (novas.length >= MAX_TENT) {
          setEstadoJogo('perdeu');
          mostrarMsg(`😔 Era: ${entrada.palavra}`, 'perdeu', 4000);
        }
        return novas;
      });
      return [];
    });
  }, [entrada, mostrarMsg]);

  const apagarLetra = useCallback(() => {
    setAtual(prev => prev.slice(0, -1));
    resetContagem();
  }, []);

  const novoJogo = useCallback(() => {
    setEntrada(sortearPalavra());
    setTentativas([]);
    setAtual([]);
    setEstadoJogo('jogando');
    setMensagem('');
    setLetraCam(null);
    setContagem(null);
    letraRef.current = null;
  }, []);

  // ── Câmara ───────────────────────────────────────────────────
  const ligarCamera = useCallback(async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 640 }, height: { ideal: 480 } }
      });
      streamRef.current = s;
      videoRef.current.srcObject = s;
      await videoRef.current.play();
      setCamAtiva(true);
      mostrarMsg('⏳ A carregar modelo de deteção...', '', 0);

      const tf = await import('@tensorflow/tfjs-core');
      try {
        await tf.setBackend('webgl');
      } catch {
        await tf.setBackend('cpu');
      }
      await tf.ready();
      detectorRef.current = await hpd.createDetector(
        hpd.SupportedModels.MediaPipeHands,
        { runtime: 'tfjs', modelType: 'lite', maxHands: 1 }
      );
      setModeloOk(true);
      mostrarMsg('✅ Câmara pronta! Faz um gesto!', 'ok', 2500);
      iniciarLoop();
    } catch (e) {
      mostrarMsg('❌ Sem acesso à câmara: ' + e.message, 'erro', 4000);
    }
  }, [mostrarMsg]);

  const desligarCamera = useCallback(() => {
    cancelAnimationFrame(animRef.current);
    streamRef.current?.getTracks().forEach(t => t.stop());
    setCamAtiva(false);
    setModeloOk(false);
    setLetraCam(null);
    setContagem(null);
    letraRef.current = null;
    resetContagem();
  }, []);

  function resetContagem() {
    clearInterval(contTimerRef.current);
    contSecsRef.current = 0;
    setContagem(null);
    letraRef.current = null;
  }

  function iniciarContagem(letra) {
    clearInterval(contTimerRef.current);
    contSecsRef.current = 10;
    setContagem(3);
    contTimerRef.current = setInterval(() => {
      contSecsRef.current -= 1;
      setContagem(contSecsRef.current);
      if (contSecsRef.current <= 0) {
        clearInterval(contTimerRef.current);
        setContagem(null);
        // Guardar letra!
        setAtual(prev => {
          if (prev.length < TAMANHO && estadoJogo === 'jogando') {
            mostrarMsg(`✅ "${letra}" guardada!`, 'ok', 1200);
            setLetraManual(letra);
            return [...prev, letra];
          }
          return prev;
        });
        letraRef.current = null;
      }
    }, 1000);
  }

  const iniciarLoop = useCallback(() => {
    const loop = async () => {
      const video  = videoRef.current;
      const canvas = canvasRef.current;
      if (!video || !canvas || !detectorRef.current) return;
      const ctx = canvas.getContext('2d');
      canvas.width  = video.videoWidth  || 640;
      canvas.height = video.videoHeight || 480;

      if (video.readyState >= 2) {
        try {
          const maos = await detectorRef.current.estimateHands(video);
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          setDebugInfo('maos:' + maos.length + ' res:' + video.videoWidth + 'x' + video.videoHeight);

          if (maos.length > 0) {
            const kp  = maos[0].keypoints;
            const kp3 = maos[0].keypoints3D || kp.map(k => ({ ...k, z: 0 }));

            // Desenhar esqueleto da mão
            desenharMao(ctx, kp);

            const { letra, conf } = detetarLetra(kp3);
            console.log('🖐️ mão detetada | letra:', letra, '| conf:', conf, '| kp3[0]:', kp3[0]);
            setLetraCam(letra);
            setConfianca(conf);

            if (letra && conf >= 55) {
              setLetraManual(letra);
              if (letra !== letraRef.current) {
                letraRef.current = letra;
                iniciarContagem(letra);
              }
            } else {
              if (!letra) resetContagem();
            }
          } else {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            setLetraCam(null);
            setConfianca(0);
            resetContagem();
          }
        } catch (e) { setDebugInfo('ERRO: ' + e.message); }
      }
      animRef.current = requestAnimationFrame(loop);
    };
    animRef.current = requestAnimationFrame(loop);
  }, [estadoJogo, mostrarMsg]);

  function desenharMao(ctx, kp) {
    const conexoes = [
      [0,1],[1,2],[2,3],[3,4],
      [0,5],[5,6],[6,7],[7,8],
      [0,9],[9,10],[10,11],[11,12],
      [0,13],[13,14],[14,15],[15,16],
      [0,17],[17,18],[18,19],[19,20],
      [5,9],[9,13],[13,17]
    ];
    ctx.strokeStyle = '#fbbf24';
    ctx.lineWidth   = 2;
    conexoes.forEach(([a, b]) => {
      if (!kp[a] || !kp[b]) return;
      ctx.beginPath();
      ctx.moveTo(kp[a].x, kp[a].y);
      ctx.lineTo(kp[b].x, kp[b].y);
      ctx.stroke();
    });
    ctx.fillStyle = '#fbbf24';
    kp.forEach(p => {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 4, 0, 2 * Math.PI);
      ctx.fill();
    });
  }

  useEffect(() => () => {
    desligarCamera();
    clearInterval(contTimerRef.current);
  }, []);

  // Estado das letras para o teclado visual
  const estadoLetras = {};
  tentativas.forEach(t => {
    t.letras.forEach((l, i) => {
      const est = estadoLetras[l];
      const nov = t.resultado[i];
      if (est === 'correto') return;
      if (nov === 'correto') estadoLetras[l] = 'correto';
      else if (nov === 'presente' && est !== 'correto') estadoLetras[l] = 'presente';
      else if (!est) estadoLetras[l] = 'errado';
    });
  });

  // ── RENDER ───────────────────────────────────────────────────
  return (
    <div className="app">

      {/* Cabeçalho */}
      <header className="cabecalho">
        <div className="cab-titulo">
          <span>🚂</span>
          <div>
            <h1>TREMU NA OFICINA</h1>
            <p>Jogo de Língua Gestual Portuguesa</p>
          </div>
          <span>🔧</span>
        </div>
        <div className="pontuacao">⭐ {pontuacao} pts</div>
      </header>

      {/* Dica */}
      <div className="dica-bar">
        <span>💡 {entrada.dica}</span>
        <span className="tent-count">Tentativas: {tentativas.length}/{MAX_TENT}</span>
      </div>

      {/* Área central: câmara + grelha */}
      <div className="centro">

        {/* --- Bloco câmara --- */}
        <div className="cam-bloco">
          <div className="cam-topo">
            <span>📷 Câmara — Deteção Gestual</span>
            <button
              className={`btn-cam ${camAtiva ? 'ativa' : ''}`}
              onClick={camAtiva ? desligarCamera : ligarCamera}
            >
              {camAtiva ? 'Desligar' : 'Ligar Câmara'}
            </button>
          </div>

          {/* Área sem câmara */}
          {!camAtiva && (
            <div className="cam-off">
              <div className="cam-off-icon">👋</div>
              <p>Liga a câmara para jogar com gestos!</p>
              <p className="cam-off-sub">A deteção corre no teu dispositivo — sem dados enviados.</p>
              <button className="btn-ligar" onClick={ligarCamera}>📷 Ligar Câmara</button>
            </div>
          )}

          {/* Vídeo + canvas */}
          <div className={`cam-video-wrap ${camAtiva ? '' : 'oculto'}`}>
            <video ref={videoRef} className="cam-video" autoPlay muted playsInline />
            <canvas ref={canvasRef} className="cam-canvas" />
          </div>

          {/* Letra detetada + contagem */}
          {camAtiva && (
            <div className="cam-info">
              <div style={{background:'#0f172a',color:'#fbbf24',fontSize:'11px',padding:'6px 8px',borderRadius:6,marginBottom:8,fontFamily:'monospace',lineHeight:1.6}}>
                🔍 {debugInfo} | Letra: <b>{letraCam || 'nenhuma'}</b> | Conf: {confianca}%
              </div>
              <div className="cam-label">Gesto detetado:</div>
              <div className="letra-grande">{letraCam || '—'}</div>

              {/* Barra de confiança */}
              <div className="conf-bar">
                <div
                  className="conf-fill"
                  style={{
                    width: confianca + '%',
                    background: confianca > 80 ? '#4ade80' : confianca > 60 ? '#fbbf24' : '#ef4444'
                  }}
                />
              </div>

              {/* Contagem regressiva */}
              {contagem !== null && (
                <div className={`contagem ${contagem === 1 ? 'ativa' : 'aviso'}`}>
                  ⏱️ A guardar em {contagem}...
                </div>
              )}
              {contagem === null && letraCam && (
                <div className="contagem-dica">Mantém o gesto 10 segundos</div>
              )}

              {/* Palavra a construir */}
              <div className="palavra-preview">
                {Array.from({ length: TAMANHO }).map((_, i) => (
                  <div key={i} className={`caixa ${atual[i] ? 'cheia' : 'vazia'}`}>
                    {atual[i] || '_'}
                  </div>
                ))}
              </div>

              {/* Botões */}
              <div className="cam-btns">
                <button className="btn-apagar" onClick={apagarLetra}>← Apagar</button>
                <button
                  className="btn-confirmar"
                  onClick={confirmar}
                  disabled={atual.length !== TAMANHO}
                >
                  Confirmar ✓
                </button>
              </div>
            </div>
          )}
        </div>

        {/* --- Grelha de tentativas --- */}
        <div className="grelha-bloco">
          <div className="grelha">
            {Array.from({ length: MAX_TENT }).map((_, ri) => {
              const tent  = tentativas[ri];
              const eAtual = ri === tentativas.length && estadoJogo === 'jogando';
              return (
                <div key={ri} className="linha">
                  {Array.from({ length: TAMANHO }).map((_, ci) => {
                    let letra = '';
                    let cls   = 'celula vazia';
                    if (tent) {
                      letra = tent.letras[ci];
                      cls   = `celula ${tent.resultado[ci]}`;
                    } else if (eAtual) {
                      letra = atual[ci] || '';
                      cls   = `celula ${letra ? 'preenchida' : 'vazia'}`;
                    }
                    return <div key={ci} className={cls}>{letra}</div>;
                  })}
                </div>
              );
            })}
          </div>
          <div className="legenda">
            <span>🟩 Lugar certo</span>
            <span>🟨 Existe, lugar errado</span>
            <span>⬜ Não existe</span>
          </div>
        </div>
      </div>

      {/* Mensagem de estado */}
      {mensagem && <div className={`mensagem ${msgTipo}`}>{mensagem}</div>}

      {/* Fim de jogo */}
      {estadoJogo !== 'jogando' && (
        <div className={`fim-jogo ${estadoJogo}`}>
          <div className="fim-emoji">{estadoJogo === 'ganhou' ? '🎉🚂🎉' : '😔🔧😔'}</div>
          <h2>{estadoJogo === 'ganhou' ? 'Excelente!' : 'Não foi desta vez...'}</h2>
          <p>{estadoJogo === 'ganhou'
            ? `Descobriste com ${tentativas.length} tentativa(s)!`
            : 'A palavra era:'}
          </p>
          <p className="palavra-revelada">{entrada.palavra}</p>
          <button className="btn-novo-jogo" onClick={novoJogo}>🚂 Nova Palavra!</button>
          <p className="pts-total">Pontuação total: ⭐ {pontuacao} pts</p>
        </div>
      )}

      {/* Manual LGP */}
      <div className="manual">
        <div className="manual-topo">
          <h3>📖 Manual — Alfabeto LGP</h3>
          <span>Clica para ver a descrição do gesto</span>
        </div>
        <div className="manual-grid">
          {ALFABETO.map(l => (
            <div
              key={l}
              className={`manual-carta ${letraManual === l ? 'destaque' : ''} ${estadoLetras[l] || ''}`}
              onClick={() => setLetraManual(letraManual === l ? null : l)}
            >
              <div className="manual-letra">{l}</div>
            </div>
          ))}
        </div>
        {letraManual && (
          <div className="manual-detalhe">
            <span className="manual-detalhe-letra">{letraManual}</span>
            <HandSVG letra={letraManual} />
            <span className="manual-detalhe-desc">{LGP_DESCRICAO[letraManual]}</span>
          </div>
        )}
      </div>

    </div>
  );
}