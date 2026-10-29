const socket = io();
const $ = (id) => document.getElementById(id);
const username = $('username'), mensaje = $('mensaje'), template = $('template');

// Enviar cambios al servidor mientras se escribe
username.addEventListener('input', () => socket.emit('vars:update', { username: username.value }));
mensaje.addEventListener('input', () => socket.emit('vars:update', { mensaje: mensaje.value }));
template.addEventListener('input', () => socket.emit('template:update', template.value));

$('form').addEventListener('submit', (e) => e.preventDefault());
$('msgForm').addEventListener('submit', (e) => {
  e.preventDefault();
  socket.emit('message:send', { username: username.value, mensaje: mensaje.value });
  mensaje.value = '';
});

// Recibir el estado compartido y pintarlo
socket.on('state', (s) => {
  $('output').innerHTML = s.html; // ya escapado por el motor
  $('userLabel').textContent = s.vars.username || '';
  // No pisar lo que la persona está escribiendo en este momento
  if (document.activeElement !== username) username.value = s.vars.username || '';
  if (document.activeElement !== mensaje) mensaje.value = s.vars.mensaje || '';
  if (document.activeElement !== template) template.value = s.template;
  $('history').replaceChildren(...s.history.map((h) => {
    const li = document.createElement('li');
    const b = document.createElement('b');
    b.textContent = h.username + ': ';
    li.append(b, h.mensaje);
    return li;
  }));
});
