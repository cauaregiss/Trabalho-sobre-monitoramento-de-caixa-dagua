const SerialPort = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

const portName = 'COM3';
const baudRate = 9600;

(async ()=>{
  const port = new SerialPort(portName, { baudRate, autoOpen: false });
  const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));

  parser.on('data', d => console.log('<- ' + d));
  port.on('error', e => console.error('Port error:', e.message));
  port.on('close', () => console.log('Porta fechada'));

  port.open(err => {
    if (err) return console.error('Erro abrindo porta:', err.message);
    console.log('Aberta', portName, '- aguardando 2.5s para estabilizar...');
    setTimeout(()=>{
      console.log('Enviando: A');
      port.write('A\n', err => {
        if (err) console.error('Erro escrevendo:', err.message);
      });
    }, 2500);
  });

  // fecha após 7s
  setTimeout(()=>{
    try{ port.close(); }catch(e){}
    process.exit(0);
  }, 7000);
})();
