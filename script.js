// conecta ao mesmo host/porta que serviu a página (melhor para produção/ambientes locais)
const socket = io();

// elementos UI
const portsSelect = document.getElementById('ports');
const refreshBtn = document.getElementById('refreshBtn');
const openBtn = document.getElementById('openBtn');
const closeBtn = document.getElementById('closeBtn');
const onBtn = document.getElementById('onBtn');
const offBtn = document.getElementById('offBtn');
const log = document.getElementById('log');
const toggleButton = document.getElementById('toggleButton');
const nivelSpan = document.getElementById('nivelAtual');

function appendLog(txt){
  log.textContent += txt + '\n';
  log.scrollTop = log.scrollHeight;
}

socket.on('connect', () => appendLog('Conectado ao servidor Socket.IO'));
socket.on('disconnect', () => appendLog('Desconectado do servidor'));

socket.on('ports', list => {
  portsSelect.innerHTML = '';
  list.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.path || p.comName || p.filename;
    opt.textContent = opt.value + (p.manufacturer ? ` — ${p.manufacturer}` : '');
    portsSelect.appendChild(opt);
  });
  appendLog('Lista de portas atualizada.');
});

socket.on('serial-data', data => {
  appendLog('Arduino: ' + data);
});

socket.on('serial-closed', () => {
  appendLog('Serial fechada no servidor');
  setUIForClosed();
});

socket.on('error', msg => appendLog('Erro: ' + msg));

refreshBtn.addEventListener('click', () => socket.emit('refresh-ports'));

openBtn.addEventListener('click', () => {
  const port = portsSelect.value;
  if (!port) { appendLog('Selecione uma porta.'); return; }
  socket.emit('open-serial', port);
  appendLog('Pedido para abrir: ' + port);
  setUIForOpen();
});

closeBtn.addEventListener('click', () => {
  socket.emit('close-serial');
  appendLog('Pedido para fechar serial');
  setUIForClosed();
});

onBtn.addEventListener('click', () => {
  socket.emit('led', 'on');
  appendLog('Enviado: on');
});

offBtn.addEventListener('click', () => {
  socket.emit('led', 'off');
  appendLog('Enviado: off');
});

function setUIForOpen(){
  openBtn.disabled = true;
  closeBtn.disabled = false;
  onBtn.disabled = false;
  offBtn.disabled = false;
  if (toggleButton) toggleButton.disabled = false;
}

function setUIForClosed(){
  openBtn.disabled = false;
  closeBtn.disabled = true;
  onBtn.disabled = true;
  offBtn.disabled = true;
  if (toggleButton) toggleButton.disabled = true;
}

// === gráficos (simulação local) ===
const nivelAgua = new Chart(document.getElementById('graficoNivel'), {
  type: 'line',
  data: { labels: [], datasets: [{ label: 'Nível da Água (cm)', borderColor: '#007bff', data: [], fill: false, tension: 0.3 }]},
  options: { scales: { y: { beginAtZero: true, max: 100 } } }
});

const desnivel = new Chart(document.getElementById('graficoDesnivel'), {
  type: 'line',
  data: { labels: [], datasets: [{ label: 'Desnível (cm)', borderColor: '#dc3545', data: [], fill: false, tension: 0.3 }]},
  options: { scales: { y: { beginAtZero: true, max: 10 } } }
});

let nivelAtual = 70; let direcao = 1; let estabilidade = 0;
function atualizarGraficos(){
  const hora = new Date().toLocaleTimeString();
  if (Math.random() < 0.2) { estabilidade++; } else { estabilidade = 0; }
  if (estabilidade < 3) { const variacao = (Math.random() * 0.5) * direcao; nivelAtual += variacao; }
  if (nivelAtual > 100) { nivelAtual = 100; direcao = -1; } else if (nivelAtual < 0) { nivelAtual = 0; direcao = 1; }
  nivelAgua.data.labels.push(hora); nivelAgua.data.datasets[0].data.push(nivelAtual.toFixed(2));
  if (nivelAgua.data.labels.length > 15) { nivelAgua.data.labels.shift(); nivelAgua.data.datasets[0].data.shift(); }
  nivelAgua.update();
  const valorDesnivel = (Math.abs(Math.sin(Date.now() / 5000)) * 5 + Math.random()).toFixed(2);
  desnivel.data.labels.push(hora); desnivel.data.datasets[0].data.push(valorDesnivel);
  if (desnivel.data.labels.length > 15) { desnivel.data.labels.shift(); desnivel.data.datasets[0].data.shift(); }
  desnivel.update();
  nivelSpan.textContent = nivelAtual.toFixed(2);
}
setInterval(atualizarGraficos, 2000);

// toggle button agora envia comando 'toggle' via socket e atualiza UI
if (toggleButton) {
  toggleButton.addEventListener('click', () => {
    socket.emit('led', 'toggle');
    appendLog('Enviado: toggle');
  });
}

// pede portas ao conectar
socket.emit('refresh-ports');
setUIForClosed();
