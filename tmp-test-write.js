const SerialPort = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');

const portName = 'COM3';
const baudRate = 9600;

const port = new SerialPort(portName, { baudRate, autoOpen: false });
const parser = port.pipe(new ReadlineParser({ delimiter: '\n' }));

port.open(err => {
  if (err) return console.error('Erro abrindo porta:', err.message);
  console.log('Aberta', portName);
  const cmds = ['1\n','on\n','toggle\n'];
  cmds.forEach((c, i) => {
    setTimeout(()=>{
      port.write(c, err => {
        if (err) console.error('Erro escrevendo:', err.message);
        else console.log('Enviado:', c.trim());
      });
    }, i*500);
  });
});

parser.on('data', d => console.log('<-', d));
port.on('error', e => console.error('Port error:', e.message));
port.on('close', () => console.log('Porta fechada'));

setTimeout(()=>{
  try{ port.close(); }catch(e){}
  process.exit(0);
}, 4000);
