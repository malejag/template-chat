const path = require('path');
const http = require('http');
const express = require('express');
const { Server } = require('socket.io');
const { render } = require('./src/templateEngine');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

// Estado compartido entre todos los clientes
const state = {
  template: 'Hola {{username}}, tu mensaje es: {{mensaje}}\nHora: {{hora}}',
  vars: { username: 'ejemplo', mensaje: '' },
  history: [] // últimos mensajes enviados
};

const view = () => ({
  template: state.template,
  vars: state.vars,
  html: render(state.template, { ...state.vars, hora: new Date().toLocaleTimeString('es-CO') }),
  history: state.history
});

io.on('connection', (socket) => {
  socket.emit('state', view());

  // Cambios de variables (se transmiten mientras se escribe)
  socket.on('vars:update', (vars = {}) => {
    state.vars = { ...state.vars, ...vars };
    io.emit('state', view());
  });

  // Cambios de plantilla
  socket.on('template:update', (template) => {
    state.template = String(template).slice(0, 2000);
    io.emit('state', view());
  });

  // Botón ENVIAR: guarda el mensaje en el historial
  socket.on('message:send', ({ username, mensaje } = {}) => {
    if (!mensaje || !String(mensaje).trim()) return;
    state.vars = { ...state.vars, username, mensaje };
    state.history.push({
      username: String(username || 'anónimo').slice(0, 30),
      mensaje: String(mensaje).slice(0, 500),
      at: Date.now()
    });
    state.history = state.history.slice(-50);
    io.emit('state', view());
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));
