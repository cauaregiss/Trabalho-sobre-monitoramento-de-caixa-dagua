const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const SerialPortLib = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

const app = express();
const server = http.createServer(app);
// mudou: habilita CORS para permitir que o dashboard (mesmo servido por Live Server) conecte
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(express.static('public'));

// Use process.env.PORT when provided (option B). Default to 3001 to avoid conflicts with services
const DEFAULT_HTTP_PORT = process.env.PORT || 3001; // fallback para 3001
const HTTP_PORT = DEFAULT_HTTP_PORT;

const baudRate = 9600;

let serialPort = null;
let parser = null;

async function listPorts() {
  try {
    const ports = await SerialPortLib.list();
    return ports.map(p => ({ path: p.path || p.comName || p.filename, manufacturer: p.manufacturer || '' }));
  } catch (err) {
    console.error('Erro listando portas:', err && err.message);
    return [];
  }
}

function openSerialPort(portName) {
  if (serialPort && serialPort.isOpen) {
    try { serialPort.close(); } catch (e) { /* ignore */ }
    serialPort = null;
    parser = null;
  }

  serialPort = new SerialPortLib(portName, { baudRate: baudRate, autoOpen: false });
  parser = serialPort.pipe(new ReadlineParser({ delimiter: '\n' }));

  serialPort.open(err => {
    if (err) {
      console.error('Erro ao abrir serial:', err.message);
    } else {
      console.log('Serial aberta em', portName);
    }
  });

  parser.on('data', line => {
    console.log('<- Serial:', line);
    io.emit('serial-data', line.trim());
  });

  serialPort.on('error', err => {
    console.error('Serial error:', err && err.message);
  });

  serialPort.on('close', () => {
    console.log('Serial fechada');
    io.emit('serial-closed');
  });
}

io.on('connection', async socket => {
  console.log('Cliente conectado (web)');
  const ports = await listPorts();
  socket.emit('ports', ports);

  socket.on('refresh-ports', async () => {
    const p = await listPorts();
    socket.emit('ports', p);
  });

  socket.on('open-serial', portName => {
    console.log('Pedido para abrir porta:', portName);
    openSerialPort(portName);
  });

  socket.on('close-serial', () => {
    if (serialPort && serialPort.isOpen) serialPort.close();
  });

  socket.on('led', cmd => {
    console.log('-> Comando LED:', cmd);
    if (serialPort && serialPort.isOpen) {
      serialPort.write(cmd + '\n', err => {
        if (err) console.error('Erro escrevendo serial:', err.message);
      });
    } else {
      console.warn('Serial não está aberta.');
      socket.emit('error', 'Serial não está aberta. Use a lista de portas e abra a porta correta.');
    }
  });
});

server.on('error', err => {
  if (err && err.code === 'EADDRINUSE') {
    console.error(`Porta ${HTTP_PORT} já está em uso. Pare o outro processo ou defina PORT diferente.`);
    process.exit(1);
  } else {
    console.error('Erro no servidor:', err);
    process.exit(1);
  }
});

server.listen(HTTP_PORT, () => console.log(`Servidor rodando: http://localhost:${HTTP_PORT}`));
