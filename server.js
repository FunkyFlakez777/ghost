const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

const online = new Map(); // ghostId -> socketId

function emitPresence(id, isOnline) {
  io.emit('presence:update', { id, online: isOnline });
}

io.on('connection', (socket) => {
  socket.on('register', ({ id }, cb) => {
    if (!id || typeof id !== 'string') return cb?.({ ok: false });
    const clean = id.trim().slice(0, 32);
    socket.data.ghostId = clean;
    online.set(clean, socket.id);
    emitPresence(clean, true);
    cb?.({ ok: true, id: clean });
  });

  socket.on('presence:check', ({ id }, cb) => {
    cb?.({ online: online.has((id || '').trim()) });
  });

  socket.on('message:send', ({ to, text, clientId }) => {
    const from = socket.data.ghostId;
    const targetSocket = online.get((to || '').trim());
    if (!from || !targetSocket || !text) {
      socket.emit('message:error', { clientId, reason: 'offline' });
      return;
    }

    const payload = {
      clientId,
      from,
      text: String(text).slice(0, 2000),
      sentAt: Date.now()
    };

    io.to(targetSocket).emit('message:incoming', payload);
    socket.emit('message:sent', payload);
  });

  socket.on('message:read', ({ to, clientId, readAt }) => {
    const targetSocket = online.get((to || '').trim());
    if (targetSocket) {
      io.to(targetSocket).emit('message:read', { clientId, readAt });
    }
  });

  socket.on('disconnect', () => {
    const id = socket.data.ghostId;
    if (id && online.get(id) === socket.id) {
      online.delete(id);
      emitPresence(id, false);
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`MyGho running on http://0.0.0.0:${PORT}`);
});
