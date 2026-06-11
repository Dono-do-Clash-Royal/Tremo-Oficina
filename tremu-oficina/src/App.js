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

const ALFABETO = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

// Deteção de gestos baseada nos 21 pontos do HandPose
function dedosEstendidos(lm) {
  const pontas  = [4, 8, 12, 16, 20];
  const medias  = [3, 6, 10, 14, 18];
  const pulso   = lm[0];
  const ext     = [];

  // Polegar: compara X com articulação
  ext.push(Math.abs(lm[4].x - lm[3].x) > 0.04);

  // Outros 4: ponta mais longe do pulso que a articulação média
  for (let i = 1; i < 5; i++) {
    const dyPonta = lm[pontas[i]].y - pulso.y;
    const dyMedia = lm[medias[i]].y - pulso.y;
    ext.push(dyPonta < dyMedia - 0.02);
  }
  return ext; // [Polegar, Indicador, Médio, Anelar, Mindinho]
}

function dist(a, b) {
  return Math.sqrt((a.x-b.x)**2 + (a.y-b.y)**2);
}

function detetarLetra(lm) {
  const [P, I, M, A, Mi] = dedosEstendidos(lm);
  const nExt = [P,I,M,A,Mi].filter(Boolean).length;

  // Y: polegar + mindinho
  if (P && !I && !M && !A && Mi)  return { letra: 'Y', conf: 90 };
  // I: só mindinho
  if (!P && !I && !M && !A && Mi) return { letra: 'I', conf: 88 };
  // L: polegar + indicador em ângulo
  if (P && I && !M && !A && !Mi) {
    const ang = lm[4].y - lm[8].y;
    if (ang > 0.05) return { letra: 'L', conf: 85 };
    return { letra: 'G', conf: 78 };
  }
  // V / U / R: indicador + médio
  if (!P && I && M && !A && !Mi) {
    const sep = Math.abs(lm[8].x - lm[12].x);
    if (sep > 0.06) return { letra: 'V', conf: 86 };
    const cruz = sep < 0.03;
    if (cruz)       return { letra: 'R', conf: 82 };
    return { letra: 'U', conf: 80 };
  }
  // W: indicador + médio + anelar
  if (!P && I && M && A && !Mi)   return { letra: 'W', conf: 82 };
  // B: 4 dedos (sem polegar)
  if (!P && I && M && A && Mi)    return { letra: 'B', conf: 84 };
  // Mão aberta (5 dedos)
  if (P && I && M && A && Mi)     return { letra: 'B', conf: 75 };
  // H: indicador + médio deitados (polegar afastado)
  if (!P && I && M && !A && !Mi)  return { letra: 'H', conf: 76 };
  // F: polegar toca indicador, resto esticado
  if (!I && M && A && Mi) {
    const d = dist(lm[4], lm[8]);
    if (d < 0.07)                 return { letra: 'F', conf: 85 };
  }
  // O: todos curvados a formar círculo
  if (!I && !M && !A && !Mi) {
    const d = dist(lm[4], lm[8]);
    if (d < 0.06)                 return { letra: 'O', conf: 88 };
  }
  // C: mão curvada aberta
  if (P && !I && !M && !A && !Mi) {
    const d = dist(lm[4], lm[8]);
    if (d > 0.08 && d < 0.18)    return { letra: 'C', conf: 80 };
    if (d < 0.08)                 return { letra: 'O', conf: 82 };
    return                               { letra: 'S', conf: 70 };
  }
  // Punho fechado
  if (nExt === 0)                 return { letra: 'A', conf: 80 };
  // D: só indicador
  if (!P && I && !M && !A && !Mi) return { letra: 'D', conf: 82 };

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

      // Carregar TensorFlow + HandPose
      const tf   = window.tf;
      const hpd  = window.handPoseDetection;
      if (!tf || !hpd) {
        mostrarMsg('⚠️ Modelos TF não carregados. Usa o teclado gestual.', 'aviso', 4000);
        return;
      }
      await tf.setBackend('webgl');
      await tf.ready();
      detectorRef.current = await hpd.createDetector(
        hpd.SupportedModels.MediaPipeHands,
        { runtime: 'mediapipe', solutionPath: 'https://cdn.jsdelivr.net/npm/@mediapipe/hands' }
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
    contSecsRef.current = 3;
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

          if (maos.length > 0) {
            const kp  = maos[0].keypoints;
            const kp3 = maos[0].keypoints3D || kp.map(k => ({ ...k, z: 0 }));

            // Desenhar esqueleto da mão
            desenharMao(ctx, kp);

            const { letra, conf } = detetarLetra(kp3);
            setLetraCam(letra);
            setConfianca(conf);

            if (letra && conf >= 65) {
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
        } catch (_) {}
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
                <div className="contagem-dica">Mantém o gesto 3 segundos</div>
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
            <span className="manual-detalhe-desc">{LGP_DESCRICAO[letraManual]}</span>
          </div>
        )}
      </div>

    </div>
  );
}