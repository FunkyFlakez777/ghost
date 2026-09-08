const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const app = express();
const server = http.createServer(app);
const io = new Server(server);
const dataDir = process.env.MYGHO_DATA_DIR || path.join(__dirname, 'data');
const accountFile = path.join(dataDir, 'accounts.json');
fs.mkdirSync(dataDir, { recursive: true });

let accounts = [];
try { accounts = JSON.parse(fs.readFileSync(accountFile, 'utf8')); }
catch { accounts = []; }

const online = new Map(); // account id -> socket id
const normalizeName = value => String(value || '').trim().normalize('NFKC').toLocaleLowerCase('de-DE');
const publicAccount = account => ({ id: account.id, name: account.name, suffix: account.id.slice(-4) });
function saveAccounts() {
  const temporary = `${accountFile}.tmp`;
  fs.writeFileSync(temporary, JSON.stringify(accounts, null, 2));
  fs.renameSync(temporary, accountFile);
}
function newId() {
  let id;
  do { id = String(crypto.randomInt(100000000000, 1000000000000)); }
  while (accounts.some(account => account.id === id));
  return id;
}
function validName(name) { return /^[\p{L}\p{N}_. -]{2,24}$/u.test(name); }
function validPassword(password) { return typeof password === 'string' && password.length >= 8 && password.length <= 72; }
function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  return { salt, hash: crypto.scryptSync(password, salt, 64).toString('hex') };
}
function passwordMatches(account, password) {
  if (!account.passwordHash || !account.passwordSalt || !validPassword(password)) return false;
  const actual = Buffer.from(account.passwordHash, 'hex');
  const supplied = crypto.scryptSync(password, account.passwordSalt, 64);
  return actual.length === supplied.length && crypto.timingSafeEqual(actual, supplied);
}
function resolveAccount(query) {
  const clean = String(query || '').replace(/[\s-]/g, '');
  if (/^\d{12}$/.test(clean)) return accounts.find(account => account.id === clean);
  const normalized = normalizeName(query);
  return accounts.find(account => account.normalizedName === normalized);
}
function setOnline(socket, account) {
  socket.data.accountId = account.id;
  const previous = online.get(account.id);
  if (previous && previous !== socket.id) io.sockets.sockets.get(previous)?.disconnect(true);
  online.set(account.id, socket.id);
  io.emit('presence:update', { id: account.id, online: true, name: account.name });
}

app.use(express.static(path.join(__dirname, 'public')));

io.on('connection', socket => {
  socket.data.loginAttempts = 0;
  socket.on('account:register', ({ name, password, token } = {}, cb) => {
    const active = accounts.find(account => account.id === socket.data.accountId);
    if (active) return cb?.({ ok: true, account: publicAccount(active), token: active.token, restored: true });
    const restored = token && accounts.find(account => account.token === token);
    if (restored) { setOnline(socket, restored); return cb?.({ ok: true, account: publicAccount(restored), token: restored.token, restored: true }); }
    const cleanName = String(name || '').trim().replace(/\s+/g, ' ');
    if (!validName(cleanName)) return cb?.({ ok: false, reason: 'invalid_name' });
    if (!validPassword(password)) return cb?.({ ok: false, reason: 'invalid_password' });
    if (accounts.some(account => account.normalizedName === normalizeName(cleanName))) return cb?.({ ok: false, reason: 'name_taken' });
    const passwordData = hashPassword(password);
    const account = { id: newId(), name: cleanName, normalizedName: normalizeName(cleanName), passwordHash: passwordData.hash, passwordSalt: passwordData.salt, token: crypto.randomBytes(24).toString('hex'), email:null, emailVerified:false, createdAt: Date.now() };
    accounts.push(account); saveAccounts(); setOnline(socket, account);
    cb?.({ ok: true, account: publicAccount(account), token: account.token, restored: false });
  });

  socket.on('account:login', ({ login, password } = {}, cb) => {
    if (socket.data.loginAttempts >= 8) return cb?.({ ok:false, reason:'too_many_attempts' });
    const account = resolveAccount(login);
    if (!account || !passwordMatches(account, password)) { socket.data.loginAttempts += 1; return cb?.({ ok:false, reason:'invalid_credentials' }); }
    socket.data.loginAttempts = 0; account.token = crypto.randomBytes(24).toString('hex'); saveAccounts(); setOnline(socket, account);
    cb?.({ ok:true, account:publicAccount(account), token:account.token, restored:false });
  });

  socket.on('contact:lookup', ({ query } = {}, cb) => {
    if (!socket.data.accountId) return cb?.({ ok: false, reason: 'not_registered' });
    const account = resolveAccount(query);
    if (!account || account.id === socket.data.accountId) return cb?.({ ok: false, reason: 'not_found' });
    cb?.({ ok: true, contact: publicAccount(account), online: online.has(account.id) });
  });

  socket.on('presence:check', ({ id } = {}, cb) => {
    const account = accounts.find(item => item.id === String(id || ''));
    cb?.({ online: Boolean(account && online.has(account.id)), name: account && online.has(account.id) ? account.name : null });
  });

  socket.on('message:send', ({ to, text, clientId } = {}) => {
    const from = accounts.find(account => account.id === socket.data.accountId);
    const targetSocket = online.get(String(to || ''));
    if (!from || !targetSocket || !text) return socket.emit('message:error', { clientId, reason: 'offline' });
    const payload = { clientId, from: from.id, to: String(to), fromName: from.name, text: String(text).slice(0, 2000), sentAt: Date.now() };
    io.to(targetSocket).emit('message:incoming', payload);
    socket.emit('message:sent', payload);
  });

  socket.on('message:read', ({ to, clientId, readAt } = {}) => {
    const targetSocket = online.get(String(to || ''));
    if (targetSocket) io.to(targetSocket).emit('message:read', { clientId, readAt });
  });

  socket.on('disconnect', () => {
    const id = socket.data.accountId;
    if (id && online.get(id) === socket.id) { online.delete(id); io.emit('presence:update', { id, online: false, name: null }); }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => console.log(`MyGho running on http://0.0.0.0:${PORT}`));
