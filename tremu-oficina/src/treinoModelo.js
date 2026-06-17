// ──────────────────────────────────────────────────────────────
// treinoModelo.js
// Lógica de treino de um modelo de Machine Learning (TensorFlow.js)
// para reconhecer letras do alfabeto LGP a partir dos 21 pontos
// da mão (MediaPipe Hands). Tudo corre localmente no browser —
// nenhum dado é enviado para a internet.
// ──────────────────────────────────────────────────────────────

import * as tf from '@tensorflow/tfjs';

export const ALFABETO = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

// ── Normalização dos pontos ──────────────────────────────────
// Em vez de usar as coordenadas absolutas (que dependem de onde a
// mão está no ecrã), normalizamos em relação ao pulso (ponto 0) e
// à escala da mão, para o modelo aprender a FORMA do gesto e não
// a posição/tamanho da mão na câmara.
export function normalizarPontos(pontos) {
  const pulso = pontos[0];
  // Escala de referência: distância pulso → base do mindinho (ponto 17)
  const ref = pontos[17];
  const escala = Math.hypot(ref.x - pulso.x, ref.y - pulso.y, (ref.z||0) - (pulso.z||0)) || 0.1;

  const flat = [];
  for (const p of pontos) {
    flat.push((p.x - pulso.x) / escala);
    flat.push((p.y - pulso.y) / escala);
    flat.push(((p.z || 0) - (pulso.z || 0)) / escala);
  }
  return flat; // array de 63 números
}

// ── Construção do dataset de treino a partir dos exemplos ──────
// exemplos: [{ letra: 'A', pontos: [21 x {x,y,z}] }, ...]
export function construirDataset(exemplos) {
  const xs = [];
  const ys = [];
  for (const ex of exemplos) {
    const idx = ALFABETO.indexOf(ex.letra);
    if (idx === -1) continue;
    xs.push(normalizarPontos(ex.pontos));
    const oneHot = new Array(ALFABETO.length).fill(0);
    oneHot[idx] = 1;
    ys.push(oneHot);
  }
  return {
    xsTensor: tf.tensor2d(xs),
    ysTensor: tf.tensor2d(ys),
    total: xs.length,
  };
}

// ── Construção do modelo (rede neuronal simples) ────────────────
export function criarModelo() {
  const model = tf.sequential();
  model.add(tf.layers.dense({ inputShape: [63], units: 64, activation: 'relu' }));
  model.add(tf.layers.dropout({ rate: 0.2 }));
  model.add(tf.layers.dense({ units: 32, activation: 'relu' }));
  model.add(tf.layers.dense({ units: ALFABETO.length, activation: 'softmax' }));
  model.compile({
    optimizer: tf.train.adam(0.01),
    loss: 'categoricalCrossentropy',
    metrics: ['accuracy'],
  });
  return model;
}

// ── Treino do modelo ─────────────────────────────────────────
// onProgress(epoch, totalEpochs, acc, loss) é chamado a cada epoch
// para podermos mostrar uma barra de progresso na interface.
export async function treinarModelo(exemplos, { epochs = 60, onProgress } = {}) {
  const { xsTensor, ysTensor, total } = construirDataset(exemplos);
  if (total < ALFABETO.length) {
    throw new Error('Precisas de pelo menos 1 exemplo por letra (idealmente muitos mais) para treinar.');
  }

  const model = criarModelo();

  await model.fit(xsTensor, ysTensor, {
    epochs,
    batchSize: 16,
    shuffle: true,
    validationSplit: total > 50 ? 0.15 : 0, // só separa validação se houver dados suficientes
    callbacks: {
      onEpochEnd: (epoch, logs) => {
        if (onProgress) {
          onProgress(epoch + 1, epochs, logs.acc ?? logs.accuracy, logs.loss);
        }
      },
    },
  });

  xsTensor.dispose();
  ysTensor.dispose();

  return model;
}

// ── Previsão em tempo real ──────────────────────────────────────
// Recebe o modelo treinado e os 21 pontos atuais da mão, devolve
// { letra, conf } tal como a função detetarLetra() original.
export function preverComModelo(model, pontos) {
  const entrada = normalizarPontos(pontos);
  const tensor = tf.tensor2d([entrada]);
  const saida = model.predict(tensor);
  const probs = saida.dataSync();
  tensor.dispose();
  saida.dispose();

  let melhorIdx = 0;
  let melhorProb = probs[0];
  for (let i = 1; i < probs.length; i++) {
    if (probs[i] > melhorProb) { melhorProb = probs[i]; melhorIdx = i; }
  }
  return {
    letra: ALFABETO[melhorIdx],
    conf: Math.round(melhorProb * 100),
  };
}

// ── Guardar / carregar modelo no IndexedDB do browser ────────────
// Isto permite que o modelo treinado fique disponível mesmo depois
// de recarregar a página, sem precisar de treinar de novo.
export async function guardarModelo(model) {
  await model.save('indexeddb://lgp-modelo-treinado');
}

export async function carregarModelo() {
  try {
    const model = await tf.loadLayersModel('indexeddb://lgp-modelo-treinado');
    return model;
  } catch (e) {
    return null; // ainda não existe modelo guardado
  }
}

export async function apagarModeloGuardado() {
  try {
    await tf.io.removeModel('indexeddb://lgp-modelo-treinado');
  } catch (e) {
    // já não existia, ignorar
  }
}

// ── Juntar vários ficheiros de dataset (de várias pessoas) ──────
// Recebe um array de objetos { colecionadoPor, exemplos } e devolve
// um único array de exemplos combinados.
export function juntarDatasets(datasets) {
  const todosExemplos = [];
  for (const d of datasets) {
    if (Array.isArray(d.exemplos)) {
      todosExemplos.push(...d.exemplos);
    }
  }
  return todosExemplos;
}
