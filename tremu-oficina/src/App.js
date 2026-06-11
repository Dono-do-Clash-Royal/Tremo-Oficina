import React, { useState, useEffect, useCallback } from 'react';
import './App.css';

// ── Base de dados de palavras (temas de oficina / mecânica) ──────────────────
const PALAVRAS = [
  { palavra: "RODA", dica: "🔧 Parte circular do carro" },
  { palavra: "PNEU", dica: "🔧 Borracha que envolve a roda" },
  { palavra: "OLEO", dica: "🔧 Lubrifica o motor" },
  { palavra: "CHAVE", dica: "🔧 Ferramenta para apertar" },
  { palavra: "TREM", dica: "🚂 Veículo que anda em carris" },
  { palavra: "VELA", dica: "🔧 Peça de ignição do motor" },
  { palavra: "FUSO", dica: "🔧 Eixo de transmissão" },
  { palavra: "CABO", dica: "🔧 Fio ou haste de metal" },
  { palavra: "MOLA", dica: "🔧 Componente de suspensão" },
  { palavra: "PINO", dica: "🔧 Peça pequena de encaixe" },
  { palavra: "EIXO", dica: "🔧 Barra central de rotação" },
  { palavra: "TUBO", dica: "🔧 Condutor de fluidos" },
  { palavra: "PAPO", dica: "🗣️ Conversa na oficina" },
  { palavra: "LIMA", dica: "🔧 Ferramenta de lixar metal" },
  { palavra: "FITA", dica: "🔧 Fita métrica ou isoladora" },
];

// ── Alfabeto em linguagem gestual (SVG desenhado à mão) ─────────────────────
// Cada letra tem um SVG que representa a mão a fazer o gesto
const GESTOS = {
  A: `<svg viewBox="0 0 80 100" xmlns="http://www.w3.org/2000/svg">
    <rect x="20" y="40" width="40" height="50" rx="8" fill="#FBBF24"/>
    <rect x="30" y="15" width="12" height="30" rx="6" fill="#FBBF24"/>
    <circle cx="35" cy="38" r="4" fill="#F59E0B"/>
    <text x="40" y="105" text-anchor="middle" font-size="11" fill="#374151" font-weight="bold">A</text>
  </svg>`,
  B: `<svg viewBox="0 0 80 100" xmlns="http://www.w3.org/2000/svg">
    <rect x="20" y="50" width="35" height="40" rx="6" fill="#FBBF24"/>
    <rect x="28" y="15" width="10" height="40" rx="5" fill="#FBBF24"/>
    <rect x="42" y="15" width="10" height="40" rx="5" fill="#FBBF24"/>
    <rect x="14" y="45" width="12" height="10" rx="5" fill="#FBBF24"/>
    <text x="40" y="105" text-anchor="middle" font-size="11" fill="#374151" font-weight="bold">B</text>
  </svg>`,
  C: `<svg viewBox="0 0 80 100" xmlns="http://www.w3.org/2000/svg">
    <path d="M55,30 Q20,30 20,60 Q20,90 55,90" stroke="#FBBF24" stroke-width="16" fill="none" stroke-linecap="round"/>
    <text x="40" y="105" text-anchor="middle" font-size="11" fill="#374151" font-weight="bold">C</text>
  </svg>`,
  D: `<svg viewBox="0 0 80 100" xmlns="http://www.w3.org/2000/svg">
    <rect x="22" y="50" width="36" height="40" rx="8" fill="#FBBF24"/>
    <rect x="30" y="20" width="10" height="35" rx="5" fill="#FBBF24"/>
    <rect x="44" y="28" width="9" height="27" rx="4" fill="#FBBF24"/>
    <rect x="14" y="42" width="14" height="11" rx="5" fill="#FBBF24"/>
    <text x="40" y="105" text-anchor="middle" font-size="11" fill="#374151" font-weight="bold">D</text>
  </svg>`,
  E: `<svg viewBox="0 0 80 100" xmlns="http://www.w3.org/2000/svg">
    <rect x="22" y="60" width="36" height="30" rx="8" fill="#FBBF24"/>
    <rect x="28" y="35" width="8" height="30" rx="4" fill="#F59E0B"/>
    <rect x="40" y="35" width="8" height="30" rx="4" fill="#F59E0B"/>
    <rect x="52" y="35" width="8" height="28" rx="4" fill="#F59E0B"/>
    <rect x="16" y="50" width="14" height="10" rx="5" fill="#FBBF24"/>
    <text x="40" y="105" text-anchor="middle" font-size="11" fill="#374151" font-weight="bold">E</text>
  </svg>`,
  F: `<svg viewBox="0 0 80 100" xmlns="http://www.w3.org/2000/svg">
    <rect x="20" y="50" width="40" height="40" rx="8" fill="#FBBF24"/>
    <rect x="28" y="20" width="10" height="34" rx="5" fill="#FBBF24"/>
    <rect x="42" y="20" width="10" height="20" rx="5" fill="#F59E0B"/>
    <rect x="14" y="44" width="14" height="12" rx="6" fill="#FBBF24"/>
    <circle cx="47" cy="47" r="7" fill="#FBBF24" stroke="#F59E0B" stroke-width="2"/>
    <text x="40" y="105" text-anchor="middle" font-size="11" fill="#374151" font-weight="bold">F</text>
  </svg>`,
  G: `<svg viewBox="0 0 80 100" xmlns="http://www.w3.org/2000/svg">
    <rect x="20" y="55" width="38" height="35" rx="8" fill="#FBBF24"/>
    <rect x="28" y="22" width="10" height="38" rx="5" fill="#FBBF24"/>
    <rect x="12" y="44" width="20" height="12" rx="6" fill="#FBBF24"/>
    <text x="40" y="105" text-anchor="middle" font-size="11" fill="#374151" font-weight="bold">G</text>
  </svg>`,
  H: `<svg viewBox="0 0 80 100" xmlns="http://www.w3.org/2000/svg">
    <rect x="20" y="55" width="38" height="35" rx="8" fill="#FBBF24"/>
    <rect x="26" y="22" width="10" height="38" rx="5" fill="#FBBF24"/>
    <rect x="40" y="22" width="10" height="38" rx="5" fill="#FBBF24"/>
    <rect x="12" y="44" width="16" height="12" rx="6" fill="#FBBF24"/>
    <text x="40" y="105" text-anchor="middle" font-size="11" fill="#374151" font-weight="bold">H</text>
  </svg>`,
  I: `<svg viewBox="0 0 80 100" xmlns="http://www.w3.org/2000/svg">
    <rect x="22" y="55" width="36" height="35" rx="8" fill="#FBBF24"/>
    <rect x="14" y="44" width="14" height="12" rx="6" fill="#FBBF24"/>
    <rect x="52" y="18" width="10" height="40" rx="5" fill="#FBBF24"/>
    <text x="40" y="105" text-anchor="middle" font-size="11" fill="#374151" font-weight="bold">I</text>
  </svg>`,
  J: `<svg viewBox="0 0 80 100" xmlns="http://www.w3.org/2000/svg">
    <rect x="22" y="55" width="36" height="35" rx="8" fill="#FBBF24"/>
    <rect x="14" y="44" width="14" height="12" rx="6" fill="#FBBF24"/>
    <rect x="52" y="18" width="10" height="40" rx="5" fill="#FBBF24"/>
    <path d="M62,58 Q62,80 45,80" stroke="#F59E0B" stroke-width="4" fill="none" stroke-linecap="round"/>
    <text x="40" y="105" text-anchor="middle" font-size="11" fill="#374151" font-weight="bold">J</text>
  </svg>`,
  K: `<svg viewBox="0 0 80 100" xmlns="http://www.w3.org/2000/svg">
    <rect x="20" y="55" width="38" height="35" rx="8" fill="#FBBF24"/>
    <rect x="26" y="20" width="10" height="40" rx="5" fill="#FBBF24"/>
    <rect x="38" y="20" width="10" height="26" rx="5" fill="#FBBF24" transform="rotate(20 43 33)"/>
    <rect x="14" y="44" width="14" height="12" rx="6" fill="#FBBF24"/>
    <text x="40" y="105" text-anchor="middle" font-size="11" fill="#374151" font-weight="bold">K</text>
  </svg>`,
  L: `<svg viewBox="0 0 80 100" xmlns="http://www.w3.org/2000/svg">
    <rect x="20" y="55" width="38" height="35" rx="8" fill="#FBBF24"/>
    <rect x="28" y="15" width="10" height="44" rx="5" fill="#FBBF24"/>
    <rect x="12" y="44" width="22" height="12" rx="6" fill="#FBBF24"/>
    <text x="40" y="105" text-anchor="middle" font-size="11" fill="#374151" font-weight="bold">L</text>
  </svg>`,
  M: `<svg viewBox="0 0 80 100" xmlns="http://www.w3.org/2000/svg">
    <rect x="20" y="60" width="40" height="30" rx="8" fill="#FBBF24"/>
    <rect x="26" y="32" width="9" height="32" rx="4" fill="#F59E0B"/>
    <rect x="36" y="32" width="9" height="32" rx="4" fill="#F59E0B"/>
    <rect x="46" y="32" width="9" height="32" rx="4" fill="#F59E0B"/>
    <rect x="14" y="50" width="14" height="12" rx="6" fill="#FBBF24"/>
    <text x="40" y="105" text-anchor="middle" font-size="11" fill="#374151" font-weight="bold">M</text>
  </svg>`,
  N: `<svg viewBox="0 0 80 100" xmlns="http://www.w3.org/2000/svg">
    <rect x="20" y="62" width="40" height="28" rx="8" fill="#FBBF24"/>
    <rect x="28" y="34" width="9" height="32" rx="4" fill="#F59E0B"/>
    <rect x="40" y="34" width="9" height="32" rx="4" fill="#F59E0B"/>
    <rect x="14" y="52" width="14" height="12" rx="6" fill="#FBBF24"/>
    <text x="40" y="105" text-anchor="middle" font-size="11" fill="#374151" font-weight="bold">N</text>
  </svg>`,
  O: `<svg viewBox="0 0 80 100" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="40" cy="60" rx="22" ry="28" fill="#FBBF24"/>
    <ellipse cx="40" cy="60" rx="12" ry="16" fill="#FEF3C7"/>
    <text x="40" y="105" text-anchor="middle" font-size="11" fill="#374151" font-weight="bold">O</text>
  </svg>`,
  P: `<svg viewBox="0 0 80 100" xmlns="http://www.w3.org/2000/svg">
    <rect x="20" y="45" width="38" height="42" rx="8" fill="#FBBF24"/>
    <rect x="26" y="15" width="10" height="35" rx="5" fill="#FBBF24"/>
    <rect x="40" y="20" width="9" height="28" rx="4" fill="#FBBF24"/>
    <rect x="14" y="40" width="14" height="12" rx="6" fill="#FBBF24"/>
    <text x="40" y="105" text-anchor="middle" font-size="11" fill="#374151" font-weight="bold">P</text>
  </svg>`,
  Q: `<svg viewBox="0 0 80 100" xmlns="http://www.w3.org/2000/svg">
    <ellipse cx="40" cy="60" rx="22" ry="28" fill="#FBBF24"/>
    <ellipse cx="40" cy="60" rx="12" ry="16" fill="#FEF3C7"/>
    <rect x="36" y="12" width="10" height="30" rx="5" fill="#FBBF24"/>
    <text x="40" y="105" text-anchor="middle" font-size="11" fill="#374151" font-weight="bold">Q</text>
  </svg>`,
  R: `<svg viewBox="0 0 80 100" xmlns="http://www.w3.org/2000/svg">
    <rect x="20" y="55" width="38" height="35" rx="8" fill="#FBBF24"/>
    <rect x="30" y="15" width="10" height="44" rx="5" fill="#FBBF24"/>
    <rect x="44" y="15" width="10" height="44" rx="5" fill="#FBBF24" transform="rotate(15 49 37)"/>
    <rect x="14" y="44" width="14" height="12" rx="6" fill="#FBBF24"/>
    <text x="40" y="105" text-anchor="middle" font-size="11" fill="#374151" font-weight="bold">R</text>
  </svg>`,
  S: `<svg viewBox="0 0 80 100" xmlns="http://www.w3.org/2000/svg">
    <rect x="20" y="45" width="40" height="45" rx="8" fill="#FBBF24"/>
    <rect x="14" y="40" width="14" height="12" rx="6" fill="#FBBF24"/>
    <text x="40" y="105" text-anchor="middle" font-size="11" fill="#374151" font-weight="bold">S</text>
  </svg>`,
  T: `<svg viewBox="0 0 80 100" xmlns="http://www.w3.org/2000/svg">
    <rect x="20" y="48" width="40" height="42" rx="8" fill="#FBBF24"/>
    <rect x="14" y="38" width="16" height="12" rx="6" fill="#FBBF24"/>
    <rect x="32" y="20" width="10" height="32" rx="5" fill="#F59E0B"/>
    <text x="40" y="105" text-anchor="middle" font-size="11" fill="#374151" font-weight="bold">T</text>
  </svg>`,
  U: `<svg viewBox="0 0 80 100" xmlns="http://www.w3.org/2000/svg">
    <rect x="20" y="55" width="38" height="35" rx="8" fill="#FBBF24"/>
    <rect x="28" y="15" width="10" height="44" rx="5" fill="#FBBF24"/>
    <rect x="42" y="15" width="10" height="44" rx="5" fill="#FBBF24"/>
    <rect x="14" y="44" width="14" height="12" rx="6" fill="#FBBF24"/>
    <text x="40" y="105" text-anchor="middle" font-size="11" fill="#374151" font-weight="bold">U</text>
  </svg>`,
  V: `<svg viewBox="0 0 80 100" xmlns="http://www.w3.org/2000/svg">
    <rect x="20" y="60" width="38" height="30" rx="8" fill="#FBBF24"/>
    <rect x="26" y="15" width="10" height="48" rx="5" fill="#FBBF24"/>
    <rect x="42" y="15" width="10" height="48" rx="5" fill="#FBBF24"/>
    <rect x="14" y="50" width="14" height="12" rx="6" fill="#FBBF24"/>
    <text x="40" y="105" text-anchor="middle" font-size="11" fill="#374151" font-weight="bold">V</text>
  </svg>`,
  W: `<svg viewBox="0 0 80 100" xmlns="http://www.w3.org/2000/svg">
    <rect x="18" y="60" width="44" height="30" rx="8" fill="#FBBF24"/>
    <rect x="22" y="15" width="9" height="48" rx="4" fill="#FBBF24"/>
    <rect x="35" y="15" width="9" height="48" rx="4" fill="#FBBF24"/>
    <rect x="49" y="15" width="9" height="48" rx="4" fill="#FBBF24"/>
    <rect x="12" y="50" width="14" height="12" rx="6" fill="#FBBF24"/>
    <text x="40" y="105" text-anchor="middle" font-size="11" fill="#374151" font-weight="bold">W</text>
  </svg>`,
  X: `<svg viewBox="0 0 80 100" xmlns="http://www.w3.org/2000/svg">
    <rect x="20" y="55" width="38" height="35" rx="8" fill="#FBBF24"/>
    <rect x="30" y="20" width="10" height="38" rx="5" fill="#F59E0B" transform="rotate(-20 35 39)"/>
    <rect x="14" y="44" width="14" height="12" rx="6" fill="#FBBF24"/>
    <text x="40" y="105" text-anchor="middle" font-size="11" fill="#374151" font-weight="bold">X</text>
  </svg>`,
  Y: `<svg viewBox="0 0 80 100" xmlns="http://www.w3.org/2000/svg">
    <rect x="22" y="52" width="36" height="38" rx="8" fill="#FBBF24"/>
    <rect x="14" y="42" width="16" height="12" rx="6" fill="#FBBF24"/>
    <rect x="52" y="15" width="10" height="40" rx="5" fill="#FBBF24"/>
    <text x="40" y="105" text-anchor="middle" font-size="11" fill="#374151" font-weight="bold">Y</text>
  </svg>`,
  Z: `<svg viewBox="0 0 80 100" xmlns="http://www.w3.org/2000/svg">
    <rect x="20" y="55" width="38" height="35" rx="8" fill="#FBBF24"/>
    <rect x="28" y="20" width="10" height="38" rx="5" fill="#F59E0B"/>
    <rect x="14" y="44" width="14" height="12" rx="6" fill="#FBBF24"/>
    <text x="40" y="105" text-anchor="middle" font-size="11" fill="#374151" font-weight="bold">Z</text>
  </svg>`,
};

// Letras do alfabeto para mostrar no teclado gestual
const ALFABETO = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

function sortearPalavra() {
  return PALAVRAS[Math.floor(Math.random() * PALAVRAS.length)];
}

function App() {
  const [entrada, setEntrada] = useState({ ...sortearPalavra() });
  const [tentativas, setTentativas] = useState([]);
  const [tentativaAtual, setTentativaAtual] = useState([]);
  const [estado, setEstado] = useState('jogando'); // 'jogando' | 'ganhou' | 'perdeu'
  const [pontuacao, setPontuacao] = useState(0);
  const [mensagem, setMensagem] = useState('');
  const [animacao, setAnimacao] = useState('');

  const MAX_TENTATIVAS = 6;
  const TAMANHO = 4;

  const novoJogo = useCallback(() => {
    setEntrada({ ...sortearPalavra() });
    setTentativas([]);
    setTentativaAtual([]);
    setEstado('jogando');
    setMensagem('');
    setAnimacao('');
  }, []);

  const clicarLetra = (letra) => {
    if (estado !== 'jogando') return;
    if (tentativaAtual.length >= TAMANHO) return;
    setTentativaAtual(prev => [...prev, letra]);
  };

  const apagarLetra = () => {
    if (tentativaAtual.length === 0) return;
    setTentativaAtual(prev => prev.slice(0, -1));
  };

  const confirmar = () => {
    if (tentativaAtual.length !== TAMANHO) {
      setMensagem('⚠️ Precisa de 4 letras!');
      setTimeout(() => setMensagem(''), 1500);
      return;
    }

    const palavraChutada = tentativaAtual.join('');
    const resultado = calcularResultado(palavraChutada, entrada.palavra);
    const novaTentativa = { letras: tentativaAtual, resultado };
    const novasTentativas = [...tentativas, novaTentativa];

    setTentativas(novasTentativas);
    setTentativaAtual([]);

    if (palavraChutada === entrada.palavra) {
      const bonusPontos = (MAX_TENTATIVAS - novasTentativas.length + 1) * 100;
      setPontuacao(prev => prev + bonusPontos);
      setEstado('ganhou');
      setAnimacao('ganhou');
      setMensagem(`🎉 Parabéns! +${bonusPontos} pontos!`);
    } else if (novasTentativas.length >= MAX_TENTATIVAS) {
      setEstado('perdeu');
      setAnimacao('perdeu');
      setMensagem(`😔 Era: ${entrada.palavra}`);
    }
  };

  const calcularResultado = (chute, palavra) => {
    const resultado = Array(TAMANHO).fill('errado');
    const palavraArr = palavra.split('');
    const chuteArr = chute.split('');
    const usados = Array(TAMANHO).fill(false);

    // Primeiro passo: corretos
    for (let i = 0; i < TAMANHO; i++) {
      if (chuteArr[i] === palavraArr[i]) {
        resultado[i] = 'correto';
        usados[i] = true;
      }
    }
    // Segundo passo: presente
    for (let i = 0; i < TAMANHO; i++) {
      if (resultado[i] === 'correto') continue;
      for (let j = 0; j < TAMANHO; j++) {
        if (!usados[j] && chuteArr[i] === palavraArr[j]) {
          resultado[i] = 'presente';
          usados[j] = true;
          break;
        }
      }
    }
    return resultado;
  };

  // Calcular estado de cada letra do teclado
  const estadoLetras = {};
  tentativas.forEach(t => {
    t.letras.forEach((l, i) => {
      const estadoAtual = estadoLetras[l];
      const novoEstado = t.resultado[i];
      if (estadoAtual === 'correto') return;
      if (novoEstado === 'correto') estadoLetras[l] = 'correto';
      else if (novoEstado === 'presente' && estadoAtual !== 'correto') estadoLetras[l] = 'presente';
      else if (!estadoAtual) estadoLetras[l] = 'errado';
    });
  });

  return (
    <div className="app">
      {/* Cabeçalho */}
      <header className="cabecalho">
        <div className="cabecalho-titulo">
          <span className="icone-comboio">🚂</span>
          <div>
            <h1>TREMU NA OFICINA</h1>
            <p>Jogo de linguagem gestual</p>
          </div>
          <span className="icone-comboio">🔧</span>
        </div>
        <div className="pontuacao">⭐ {pontuacao} pts</div>
      </header>

      {/* Dica */}
      <div className="dica">
        <span>💡 Dica: {entrada.dica}</span>
        <span className="tentativas-restantes">
          Tentativas: {tentativas.length}/{MAX_TENTATIVAS}
        </span>
      </div>

      {/* Grelha de tentativas */}
      <div className="grelha">
        {Array.from({ length: MAX_TENTATIVAS }).map((_, rowIdx) => {
          const tentativa = tentativas[rowIdx];
          const eAtual = rowIdx === tentativas.length && estado === 'jogando';

          return (
            <div key={rowIdx} className="linha">
              {Array.from({ length: TAMANHO }).map((_, colIdx) => {
                let letra = '';
                let classe = 'celula';

                if (tentativa) {
                  letra = tentativa.letras[colIdx];
                  classe = `celula ${tentativa.resultado[colIdx]}`;
                } else if (eAtual) {
                  letra = tentativaAtual[colIdx] || '';
                  classe = `celula ${letra ? 'preenchida' : 'vazia'}`;
                }

                return (
                  <div key={colIdx} className={classe}>
                    {letra}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Mensagem de estado */}
      {mensagem && (
        <div className={`mensagem ${animacao}`}>
          {mensagem}
        </div>
      )}

      {/* Legenda */}
      <div className="legenda">
        <span className="legenda-item correto-ex">🟩 Letra certa no lugar certo</span>
        <span className="legenda-item presente-ex">🟨 Letra existe mas no lugar errado</span>
        <span className="legenda-item errado-ex">⬜ Letra não existe</span>
      </div>

      {/* Teclado gestual */}
      {estado === 'jogando' && (
        <div className="teclado-area">
          <h2 className="teclado-titulo">👋 Clica no gesto da letra</h2>
          <div className="teclado-gestual">
            {ALFABETO.map(letra => (
              <button
                key={letra}
                className={`gesto-btn ${estadoLetras[letra] || ''}`}
                onClick={() => clicarLetra(letra)}
                title={`Letra ${letra}`}
                disabled={estadoLetras[letra] === 'errado'}
              >
                <div
                  className="gesto-svg"
                  dangerouslySetInnerHTML={{ __html: GESTOS[letra] }}
                />
              </button>
            ))}
          </div>

          {/* Botões de ação */}
          <div className="botoes-acao">
            <button className="btn-apagar" onClick={apagarLetra}>
              ← Apagar
            </button>
            <div className="palavra-atual">
              {tentativaAtual.map((l, i) => (
                <span key={i} className="letra-atual">{l}</span>
              ))}
              {Array.from({ length: TAMANHO - tentativaAtual.length }).map((_, i) => (
                <span key={i} className="letra-vazia">_</span>
              ))}
            </div>
            <button className="btn-confirmar" onClick={confirmar}>
              Confirmar ✓
            </button>
          </div>
        </div>
      )}

      {/* Ecrã de fim de jogo */}
      {estado !== 'jogando' && (
        <div className={`fim-jogo ${estado}`}>
          {estado === 'ganhou' ? (
            <>
              <div className="fim-emoji">🎉🚂🎉</div>
              <h2>Excelente!</h2>
              <p>Descobriste a palavra com {tentativas.length} tentativa(s)!</p>
              <p className="palavra-revelada">A palavra era: <strong>{entrada.palavra}</strong></p>
            </>
          ) : (
            <>
              <div className="fim-emoji">😔🔧😔</div>
              <h2>Não foi desta vez...</h2>
              <p>A palavra era:</p>
              <p className="palavra-revelada"><strong>{entrada.palavra}</strong></p>
            </>
          )}
          <button className="btn-novo-jogo" onClick={novoJogo}>
            🚂 Nova Palavra!
          </button>
          <p className="pontuacao-total">Pontuação total: ⭐ {pontuacao} pts</p>
        </div>
      )}
    </div>
  );
}

export default App;
