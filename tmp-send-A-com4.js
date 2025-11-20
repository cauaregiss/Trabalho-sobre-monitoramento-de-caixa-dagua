const SerialPort = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

const PORT_NAME = 'COM4'; // altere se necessário
const BAUD = 9600;

console.log(`Tentando abrir ${PORT_NAME} a ${BAUD}bps...`);

const port = new SerialPort(PORT_NAME, { baudRate: BAUD, autoOpen: false });
const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));

port.open(err => {
  if (err) {
    console.error('Erro ao abrir porta:', err.message);
    process.exit(1);
  }
  console.log('Porta aberta. Aguardando estabilização (2.5s)...');

  // Espera a placa resetar ao abrir a serial
  setTimeout(() => {
    const msg = 'A';
    console.log('Enviando:', msg);
    port.write(msg + '\n', writeErr => {
      if (writeErr) console.error('Erro ao escrever:', writeErr.message);
    });
  }, 2500);
});

parser.on('data', line => {
  console.log('<- Serial recebeu:', line.trim());
});

port.on('error', err => {
  console.error('Serial error:', err.message);
});

// Fecha automaticamente após 8s
setTimeout(() => {
  if (port.isOpen) {
    console.log('Fechando porta...');
    port.close(closeErr => {
      if (closeErr) console.error('Erro ao fechar porta:', closeErr.message);
      else console.log('Porta fechada.');
      process.exit(0);
    });
  } else {
    console.log('Porta já fechada. Saindo.');
    process.exit(0);
  }
}, 8000);
