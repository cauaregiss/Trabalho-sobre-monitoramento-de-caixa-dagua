# Arduino Dashboard - instruções rápidas

1. Verifique hardware
   - LED conectado ao pino 12 (ânodo) via resistor ~220Ω, cátodo ao GND.
   - Confirme que gravou o sketch `ONOFF.ino` na placa.

2. Instale dependências (no diretório do projeto):
   npm init -y
   npm install express socket.io serialport @serialport/parser-readline

3. Rode o servidor Node:
   node server.js
   - Por padrão o servidor ficará em http://localhost:3000

4. Abra o dashboard:
   - Navegue para http://localhost:3000/dashboard.html
   - Ou abra o arquivo `public/dashboard.html` localmente; o cliente conecta ao servidor em localhost:3000

## Projeto: Arduino Dashboard (resumo)

Este repositório contém um pequeno dashboard web e um servidor Node.js que se comunicam com um Arduino via porta serial. O objetivo é enviar comandos simples (ligar/desligar/toggle) para um LED conectado à placa e receber respostas via Serial.

### Como funciona (resumido)
- O `server.js` expõe uma API WebSocket (socket.io) e serve arquivos estáticos em `public/`.
- O cliente web (dashboard) lista portas seriais, abre a porta escolhida e envia comandos (`1`, `0`, `on`, `off`, `toggle`, ou `A` conforme adaptado) para o Arduino.
- O Arduino executa o sketch `ONOFF.ino`, que interpreta comandos recebidos pela Serial e comanda o pino do LED.

---

### Arquivos principais (explicação)
- `server.js` — servidor Express + Socket.IO. Lista portas seriais (usando `serialport`), abre/fecha a porta selecionada, escuta comandos do cliente e escreve na Serial. Também retransmite dados recebidos da Serial para o cliente via evento `serial-data`.
- `ONOFF.ino` — sketch para Arduino Uno. Lê linhas da Serial e aceita comandos:
  - `1` / `on` / `a` => acende o LED
  - `0` / `off` => apaga o LED
  - `toggle` => alterna estado
  O arquivo foi adaptado para usar o pino configurado no repositório (no momento `const int led = 8;`).
- `package.json` — dependências do projeto (quando usado): `express`, `socket.io`, `serialport`, `@serialport/parser-readline`.
- `public/` — interface web (HTML/JS/CSS) servida pelo `server.js`:
  - `public/index.html`, `public/dashboard.html` — páginas do dashboard/cliente.
  - `public/script.js` — código cliente que usa Socket.IO para interagir com o servidor.
- `tmp-*.js` — scripts auxiliares criados para testes locais (listar portas, enviar comandos via Node). Exemplos:
  - `tmp-list-ports.js` — lista portas seriais (útil para descobrir COM no Windows).
  - `tmp-send-A-com3-pin8.js` / `tmp-test-write.js` — scripts de teste que abrem uma porta e enviam comandos (usados durante depuração).

---

### Instruções rápidas de uso
1. Conecte o Arduino ao PC via USB.
2. No Arduino IDE: abra `ONOFF.ino` e faça upload para o Uno (Tools > Board: Arduino Uno, Tools > Port: COMx).
3. No projeto (pasta do repositório) instale dependências (se ainda não instalou):
   ```powershell
   npm install
   npm install express socket.io serialport @serialport/parser-readline
   ```
4. Rode o servidor:
   ```powershell
   node server.js
   ```
   O servidor, por padrão, fica em `http://localhost:3000`.
5. Abra o dashboard no navegador: `http://localhost:3000/dashboard.html`.
6. No dashboard: clique em atualizar, selecione a porta do Arduino (ex: `COM3`) e abra-a. Use os botões ou envie o comando desejado.

Observação: só uma aplicação por vez pode abrir a COM — feche o Serial Monitor do Arduino IDE antes de abrir a porta pelo servidor ou por scripts Node.

---

### Comandos seriais suportados
- `1` ou `on` ou `a`  -> acende o LED
- `0` ou `off`        -> apaga o LED
- `toggle`            -> alterna o estado do LED

---

### Solução de problemas rápida
- Porta não aparece: verifique o Device Manager (Windows) ou rode `node tmp-list-ports.js` para listar portas.
- Upload do sketch falha: verifique seleção da placa/porta no IDE e drivers do conversor USB-serial (CH340, FTDI, etc.).
- Sem resposta ao enviar comando:
  - Confirme que o sketch foi carregado (Serial Monitor mostra a mensagem inicial).
  - Verifique que o LED está realmente ligado ao pino usado no sketch (no repositório está `led = 8`).
  - Confirme fiação: ânodo do LED -> pino (com resistor ~220Ω), cátodo -> GND.
  - Feche outras aplicações que possam estar usando a mesma porta (IDE, outro script Node).

---

### Próximos passos / sugestões
- Se quiser, adiciono um `npm start` em `package.json` para rodar `node server.js` com `npm start`.
- Posso também gerar uma pequena checklist visual no `README` com capturas de tela do dashboard e do Serial Monitor.

Se quiser, atualizo o `README` com exemplos de comando exatos para Windows PowerShell ou adiciono imagens — diga qual opção prefere.




