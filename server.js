// Wrapper to start the actual server located in ./public/server.js
// Run from project root: `node server.js`
try {
  require('./public/server.js');
} catch (err) {
  console.error('Falha ao iniciar o servidor a partir de ./public/server.js:', err && err.message);
  console.error('Verifique se o arquivo existe em public/server.js e se as dependências estão instaladas.');
  process.exit(1);
}
