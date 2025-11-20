(async () => {
  const SerialPort = require('serialport');
  try {
    const ports = await SerialPort.list();
    console.log(JSON.stringify(ports, null, 2));
  } catch (err) {
    console.error('Erro listando portas:', err && err.message);
    process.exit(1);
  }
})();
