(() => {
  const socket = io();
  const $ = (id) => document.getElementById(id);
  const STORE = 'ychat_progress_v1';
  const unlockLevels = {standard:1, sakura:2, neon:4, kitsune:7, gold:10};
  const skinNames = {standard:'Standard', sakura:'Sakura', neon:'Neon', kitsune:'Kitsune', gold:'Gold'};
  const skinAssets = {standard:'/assets/mygho-uniform-standard.png', sakura:'/assets/mygho-uniform-sakura.png', neon:'/assets/mygho-uniform-neon.png', kitsune:'/assets/mygho-uniform-kitsune.png', gold:'/assets/mygho-uniform-gold.png'};
  const shopSkins = [
    {id:'cherry', name:'Cherry Blossom', price:250, asset:'/assets/mygho-uniform-cherry.png'},
    {id:'cyber', name:'Cyber', price:300, asset:'/assets/mygho-uniform-cyber.png'},
    {id:'angel', name:'Angel', price:350, asset:'/assets/mygho-uniform-angel.png'},
    {id:'devil_skin', name:'Devil', price:400, asset:'/assets/mygho-uniform-devil_skin.png'},
    {id:'panda', name:'Panda', price:250, asset:'/assets/mygho-uniform-panda.png'},
    {id:'neko', name:'Neko', price:300, asset:'/assets/mygho-uniform-neko.png'},
    {id:'dragon', name:'Dragon', price:450, asset:'/assets/mygho-uniform-dragon.png'},
    {id:'galaxy', name:'Galaxy', price:450, asset:'/assets/mygho-uniform-galaxy.png'}
  ];
  const reactions = [
    {id:'happy', label:'Freuen', shortcut:':-)', col:0, row:0, emoji:'😊'},
    {id:'laugh', label:'Lachen', shortcut:':D', col:1, row:0, emoji:'😄'},
    {id:'wink', label:'Zwinkern', shortcut:';-)', col:2, row:0, emoji:'😉'},
    {id:'sad', label:'Traurig', shortcut:':-(', col:0, row:1, emoji:'😢'},
    {id:'angry', label:'Wütend', shortcut:'>:(', col:1, row:1, emoji:'😠'},
    {id:'devil', label:'Devil', shortcut:'}:)', col:2, row:1, emoji:'😈'},
    {id:'love', label:'Verliebt', shortcut:'<3', col:0, row:2, emoji:'😍'},
    {id:'sleepy', label:'Müde', shortcut:'-_-', col:1, row:2, emoji:'😴'},
    {id:'confused', label:'Verwirrt', shortcut:':-?', col:2, row:2, emoji:'🤔'}
  ];
  const defaults = {xp:0, coins:0, messages:0, streak:0, lastActive:null, activeDate:null, todayMessages:0, skin:'standard', purchased:[], redeemedCodes:[], rituals:{morning:null,aura:null,sleep:null}};
  let progress;
  try { progress = {...defaults, ...JSON.parse(localStorage.getItem(STORE) || '{}')}; }
  catch { progress = {...defaults}; }
  progress.rituals = {...defaults.rituals, ...(progress.rituals || {})};
  const savedIdentity = JSON.parse(localStorage.getItem('mygho_identity_v1') || 'null');
  let account = null, peer = '', peerOnline = false, contacts = [], presence = new Map();
  const timers = new Map();
  const conversations = new Map();

  const dayKey = (date = new Date()) => {
    const year = date.getFullYear(), month = String(date.getMonth() + 1).padStart(2, '0'), day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  const daysBetween = (a, b) => Math.floor((new Date(b + 'T12:00:00') - new Date(a + 'T12:00:00')) / 86400000);
  function normalizeProgress() {
    const today = dayKey();
    if (progress.activeDate && progress.activeDate !== today) progress.todayMessages = 0;
    if (progress.lastActive && daysBetween(progress.lastActive, today) > 1) progress.streak = 0;
  }
  normalizeProgress();
  const save = () => localStorage.setItem(STORE, JSON.stringify(progress));
  const level = () => Math.floor(progress.xp / 100) + 1;
  function mood() {
    const today = dayKey();
    if (progress.lastActive && daysBetween(progress.lastActive, today) >= 2) return 'sad';
    if (progress.todayMessages >= 40) return 'sleepy';
    return 'happy';
  }
  const moodText = {
    happy:'Du bist regelmäßig da. Dein Gho freut sich.',
    sleepy:'Das war viel für heute. Dein Gho braucht eine Pause.',
    sad:'Es war lange still. Dein Gho hat dich vermisst.'
  };
  function toast(text) { const el = $('toast'); el.textContent = text; el.classList.add('show'); clearTimeout(toast.t); toast.t = setTimeout(() => el.classList.remove('show'), 1800); }
  function requireConnection() {
    if (socket.connected) return true;
    toast('Server nicht erreichbar. Bitte kurz neu laden.');
    return false;
  }

  function route(name) {
    document.querySelectorAll('.screen').forEach(el => el.classList.toggle('active', el.id === `screen-${name}`));
    history.replaceState(null, '', name === 'yokai' ? '#yokai' : '#chat');
    if (name === 'yokai') renderYokai();
  }
  document.querySelectorAll('[data-route]').forEach(button => button.addEventListener('click', () => route(button.dataset.route)));

  function renderYokai() {
    normalizeProgress(); save();
    const currentMood = mood(), currentLevel = level();
    $('levelValue').textContent = currentLevel;
    $('xpValue').textContent = progress.xp % 100;
    $('xpBar').style.width = `${progress.xp % 100}%`;
    $('coinValue').textContent = progress.coins;
    $('dialogCoins').textContent = progress.coins;
    $('messageCount').textContent = progress.messages;
    $('streakValue').textContent = progress.streak;
    $('moodName').textContent = currentMood.toUpperCase();
    $('sidebarMood').textContent = currentMood.toUpperCase();
    $('moodCopy').textContent = moodText[currentMood];
    const sleeping = progress.rituals.sleep === dayKey();
    const scene = document.createElement('div'); scene.className = `rendered-scene mood-${currentMood} ${sleeping ? 'ritual-sleeping' : ''}`;
    const background = document.createElement('img'); background.className = 'rendered-background'; background.src = '/assets/reference-scene-clean.jpg'; background.alt = '';
    const premium = shopSkins.find(item => item.id === progress.skin);
    const character = premium ? makeShopSprite(premium, 'rendered-character premium-character') : document.createElement('img');
    if (!premium) { character.className = 'rendered-character'; character.src = skinAssets[progress.skin]; }
    character.setAttribute('role','img'); character.setAttribute('aria-label', `${premium?.name || skinNames[progress.skin]} Gho, ${currentMood}`);
    scene.append(background, character);
    if (currentMood === 'sleepy') { const fx = document.createElement('span'); fx.className = 'mood-fx'; fx.textContent = 'Zz'; scene.appendChild(fx); }
    if (currentMood === 'sad') { const fx = document.createElement('span'); fx.className = 'mood-fx'; fx.textContent = '·'; scene.appendChild(fx); }
    $('yokaiHero').replaceChildren(scene);
    document.querySelectorAll('.yokai-thumb').forEach(img => img.src = premium ? premium.asset : skinAssets[progress.skin]);
    document.querySelectorAll('.rule-grid article').forEach((el, index) => el.classList.toggle('active', ['happy','sleepy','sad'][index] === currentMood));
    $('morningRitual').disabled = progress.rituals.morning === dayKey();
    $('auraRitual').disabled = progress.rituals.aura === dayKey();
    $('sleepRitual').disabled = sleeping;
    renderSkins();
  }

  function renderSkins() {
    const host = $('skinGrid'); host.innerHTML = '';
    Object.keys(unlockLevels).forEach(id => {
      const required = unlockLevels[id], available = level() >= required;
      const card = document.createElement('button');
      card.className = `skin-card ${progress.skin === id ? 'active' : ''} ${available ? '' : 'locked'}`;
      card.type = 'button';
      const preview = document.createElement('div'); preview.className = 'skin-card-preview';
      const image = document.createElement('img'); image.src = skinAssets[id]; image.alt = `${skinNames[id]} Skin`; preview.appendChild(image);
      const title = document.createElement('h3'); title.textContent = skinNames[id];
      const caption = document.createElement('p'); caption.textContent = progress.skin === id ? 'AKTIV' : available ? 'FREIGESCHALTET' : `AB LEVEL ${required}`;
      card.append(preview, title, caption);
      if (!available) { const lock = document.createElement('span'); lock.className = 'lock-tag'; lock.textContent = `LVL ${required}`; card.appendChild(lock); }
      if (available) card.addEventListener('click', () => { progress.skin = id; save(); renderYokai(); toast(`${skinNames[id]} ausgerüstet`); });
      host.appendChild(card);
    });
    shopSkins.filter(item => progress.purchased.includes(item.id)).forEach(item => {
      const card = document.createElement('button'); card.className = `skin-card ${progress.skin === item.id ? 'active' : ''}`; card.type = 'button';
      const preview = document.createElement('div'); preview.className = 'skin-card-preview'; preview.appendChild(makeShopSprite(item, 'shop-sprite owned-sprite'));
      const title = document.createElement('h3'); title.textContent = item.name;
      const caption = document.createElement('p'); caption.textContent = progress.skin === item.id ? 'AKTIV' : 'GEKAUFT'; card.append(preview,title,caption);
      card.addEventListener('click', () => { progress.skin = item.id; save(); renderYokai(); toast(`${item.name} ausgerüstet`); }); host.appendChild(card);
    });
  }

  function makeShopSprite(item, className) {
    const image = document.createElement('img'); image.className = className; image.src = item.asset; image.alt = item.name; return image;
  }

  function renderShop() {
    const host = $('shopCatalog'); host.innerHTML = ''; $('dialogCoins').textContent = progress.coins;
    shopSkins.forEach(item => {
      const owned = progress.purchased.includes(item.id), card = document.createElement('article'); card.className = 'shop-item';
      const art = document.createElement('div'); art.className = 'shop-item-art'; art.appendChild(makeShopSprite(item, 'shop-sprite'));
      const info = document.createElement('div'); info.innerHTML = `<strong>${item.name}</strong><span>${owned ? 'GEKAUFT' : `${item.price} MC`}</span>`;
      const button = document.createElement('button'); button.type = 'button'; button.textContent = owned ? (progress.skin === item.id ? 'Aktiv' : 'Ausrüsten') : 'Kaufen'; button.disabled = owned && progress.skin === item.id;
      button.addEventListener('click', () => {
        if (owned) { progress.skin = item.id; save(); renderYokai(); renderShop(); return toast(`${item.name} ausgerüstet`); }
        if (progress.coins < item.price) return toast('Nicht genug MyGho-Coins');
        progress.coins -= item.price; progress.purchased.push(item.id); progress.skin = item.id; save(); renderYokai(); renderShop(); toast(`${item.name} gekauft`);
      });
      card.append(art,info,button); host.appendChild(card);
    });
  }

  function recordSentMessage() {
    const today = dayKey();
    if (progress.activeDate !== today) {
      progress.streak = progress.lastActive && daysBetween(progress.lastActive, today) === 1 ? progress.streak + 1 : 1;
      progress.todayMessages = 0;
      progress.activeDate = today;
    }
    const oldLevel = level();
    progress.messages += 1; progress.todayMessages += 1; progress.xp += 1; progress.lastActive = today;
    if (level() > oldLevel) { progress.coins += 25; toast(`Level ${level()} · +25 YC`); }
    save(); renderYokai();
  }

  const formatId = id => String(id).replace(/(\d{3})(?=\d)/g, '$1 ');
  const contactStore = () => `mygho_contacts_${account?.id || 'guest'}`;
  function loadContacts() { try { contacts = JSON.parse(localStorage.getItem(contactStore()) || '[]'); } catch { contacts = []; } }
  function saveContacts() { localStorage.setItem(contactStore(), JSON.stringify(contacts)); }
  function addContact(contact, online = false) {
    const existing = contacts.find(item => item.id === contact.id);
    if (existing) Object.assign(existing, contact); else contacts.push(contact);
    presence.set(contact.id, {online, name:online ? contact.name : null}); saveContacts(); renderContacts();
  }
  function renderContacts() {
    const host = $('contactsList'); host.innerHTML = '';
    if (!contacts.length) { const empty = document.createElement('p'); empty.className = 'contacts-empty'; empty.textContent = 'Noch keine Kontakte.'; host.appendChild(empty); return; }
    contacts.forEach(contact => {
      const state = presence.get(contact.id) || {online:false,name:null};
      const button = document.createElement('button'); button.type = 'button'; button.className = `contact-card ${state.online ? 'online' : 'offline'} ${peer === contact.id ? 'active' : ''}`;
      button.innerHTML = `<span class="avatar">${state.online ? contact.name.slice(0,1).toUpperCase() : '◌'}</span><span><strong>${state.online ? contact.name : 'Schlafender Gho'}</strong><small>${state.online ? 'Jetzt da' : `•••• ${contact.id.slice(-4)}`}</small></span><i class="presence-dot ${state.online ? 'on' : ''}"></i>`;
      button.addEventListener('click', () => selectContact(contact.id)); host.appendChild(button);
    });
  }
  function selectContact(id) {
    peer = id; const contact = contacts.find(item => item.id === id), state = presence.get(id) || {online:false,name:null}; peerOnline = state.online;
    $('conversationName').textContent = state.online ? contact.name : `Schlafender Gho · ${id.slice(-4)}`;
    $('conversationState').textContent = state.online ? 'Online · Nachrichten live' : 'Offline · Name verborgen';
    $('headDot').classList.toggle('on', state.online);
    const enabled = Boolean(account && peer && state.online); $('messageInput').disabled = !enabled; $('sendButton').disabled = !enabled; $('emojiTrigger').disabled = !enabled;
    renderConversation(); renderContacts();
  }
  function checkAllPresence() {
    contacts.forEach(contact => socket.emit('presence:check', {id:contact.id}, result => { presence.set(contact.id,{online:result.online,name:result.name}); renderContacts(); if (peer === contact.id) selectContact(contact.id); }));
  }
  function activateIdentity(result) {
    account = result.account; localStorage.setItem('mygho_identity_v1', JSON.stringify({name:account.name,token:result.token,id:account.id}));
    $('identityLabel').textContent = account.name; $('ownId').textContent = formatId(account.id); $('ownId').hidden = false; $('shareId').hidden = false; $('identityOrb').classList.add('on');
    $('identityForm').hidden = true; $('loginForm').hidden = true; $('loginToggle').hidden = true; loadContacts(); renderContacts(); checkAllPresence();
  }
  $('identityForm').addEventListener('submit', e => {
    e.preventDefault(); const name = $('myId').value.trim(), password = $('registerPassword').value; if (!name || !password || !requireConnection()) return;
    socket.emit('account:register', {name,password}, result => {
      if (!result?.ok) return toast(result?.reason === 'name_taken' ? 'Dieser Name ist bereits vergeben' : result?.reason === 'invalid_password' ? 'Passwort braucht mindestens 8 Zeichen' : 'Bitte 2–24 gültige Zeichen verwenden'); activateIdentity(result);
    });
  });
  $('loginForm').addEventListener('submit', e => {
    e.preventDefault(); const login = $('loginId').value.trim(), password = $('loginPassword').value; if (!login || !password || !requireConnection()) return;
    socket.emit('account:login', {login,password}, result => {
      if (!result?.ok) return toast(result?.reason === 'too_many_attempts' ? 'Zu viele Versuche. Bitte Seite neu öffnen.' : 'Name, ID oder Passwort stimmt nicht'); activateIdentity(result);
    });
  });
  $('loginToggle').addEventListener('click', () => { $('identityForm').hidden = true; $('loginToggle').hidden = true; $('loginForm').hidden = false; $('loginId').focus(); });
  $('registerToggle').addEventListener('click', () => { $('loginForm').hidden = true; $('identityForm').hidden = false; $('loginToggle').hidden = false; $('myId').focus(); });
  $('peerForm').addEventListener('submit', e => {
    e.preventDefault(); const query = $('peerId').value.trim(); if (!query || !account) return toast('Registriere dich zuerst'); if (!requireConnection()) return;
    socket.emit('contact:lookup', {query}, result => {
      if (!result?.ok) return toast('Kein passender Name oder keine ID gefunden');
      addContact(result.contact, result.online); $('peerId').value = ''; selectContact(result.contact.id); toast(`${result.contact.name} hinzugefügt`);
    });
  });
  $('shareId').addEventListener('click', async () => { try { await navigator.clipboard.writeText(account.id); toast('MyGho-ID kopiert'); } catch { toast(formatId(account.id)); } });
  $('newChat').addEventListener('click', () => $('peerId').focus());
  socket.on('presence:update', ({id, online, name}) => {
    if (!contacts.some(contact => contact.id === id)) return;
    presence.set(id,{online,name}); renderContacts(); if (peer === id) selectContact(id);
  });
  if (savedIdentity?.token) socket.emit('account:register', {token:savedIdentity.token}, result => { if (result?.ok) activateIdentity(result); else localStorage.removeItem('mygho_identity_v1'); });

  function conversationFor(id) { if (!conversations.has(id)) conversations.set(id, new Map()); return conversations.get(id); }
  function findRecord(clientId) {
    for (const [contactId, records] of conversations) if (records.has(clientId)) return {contactId, record:records.get(clientId), records};
    return null;
  }
  function renderMessage(record) {
    const {data,mine,readAt} = record;
    const item = document.createElement('div'); item.className = `message ${mine ? 'mine' : ''}`; item.dataset.id = data.clientId;
    const bubble = document.createElement('div'); bubble.className = 'bubble';
    const stickerMatch = /^\[\[yokai:([a-z]+)\]\]$/.exec(data.text);
    const reaction = stickerMatch && reactions.find(item => item.id === stickerMatch[1]);
    if (reaction) {
      bubble.classList.add('sticker-bubble');
      const sticker = document.createElement('span'); sticker.className = 'yokai-sticker'; sticker.setAttribute('role','img'); sticker.setAttribute('aria-label', reaction.label); sticker.style.setProperty('--sprite-x', `${reaction.col / 2 * 100}%`); sticker.style.setProperty('--sprite-y', `${reaction.row / 2 * 100}%`); bubble.appendChild(sticker);
    } else bubble.textContent = data.text;
    const left = readAt ? Math.max(0, 60 - Math.floor((Date.now() - readAt) / 1000)) : null;
    const meta = document.createElement('div'); meta.className = 'message-meta'; meta.innerHTML = `<span>${mine ? 'GESENDET' : 'GELESEN'}</span> · <span class="timer">${left === null ? 'WARTET' : `${left}s`}</span>`;
    item.append(bubble, meta); return item;
  }
  function renderConversation() {
    const host = $('messages'); host.innerHTML = '';
    const records = peer ? conversationFor(peer) : new Map();
    $('emptyChat').classList.toggle('hidden', records.size > 0);
    records.forEach(record => host.appendChild(renderMessage(record))); host.scrollTop = host.scrollHeight;
  }
  function startTimer(clientId, readAt) {
    const found = findRecord(clientId); if (!found) return; found.record.readAt = readAt; clearInterval(timers.get(clientId));
    const tick = () => {
      const left = Math.max(0, 60 - Math.floor((Date.now() - readAt) / 1000));
      const visible = document.querySelector(`[data-id="${CSS.escape(clientId)}"] .timer`); if (visible) visible.textContent = `${left}s`;
      if (!left) { clearInterval(timers.get(clientId)); timers.delete(clientId); const item = document.querySelector(`[data-id="${CSS.escape(clientId)}"]`); item?.classList.add('gone'); setTimeout(() => { found.records.delete(clientId); if (peer === found.contactId) renderConversation(); }, 350); }
    };
    tick(); timers.set(clientId, setInterval(tick, 250));
  }
  function addMessage(data, mine) {
    const contactId = mine ? data.to : data.from; if (!contactId) return;
    const record = {data,mine,readAt:mine ? null : Date.now()}; conversationFor(contactId).set(data.clientId,record);
    if (!mine) { socket.emit('message:read',{to:data.from,clientId:data.clientId,readAt:record.readAt}); startTimer(data.clientId,record.readAt); }
    if (peer === contactId) renderConversation();
  }
  $('messageForm').addEventListener('submit', e => {
    e.preventDefault(); let text = $('messageInput').value.trim(); if (!text || !account || !peerOnline) return;
    const exact = reactions.find(item => item.shortcut === text);
    if (exact) text = `[[yokai:${exact.id}]]`;
    else reactions.forEach(item => { text = text.split(item.shortcut).join(item.emoji); });
    socket.emit('message:send', {to:peer, text, clientId:crypto.randomUUID()}); $('messageInput').value = '';
    $('emojiPicker').hidden = true; $('emojiTrigger').setAttribute('aria-expanded','false');
  });
  socket.on('message:sent', data => { addMessage(data, true); recordSentMessage(); });
  socket.on('message:incoming', data => {
    if (!contacts.some(contact => contact.id === data.from)) addContact({id:data.from,name:data.fromName,suffix:data.from.slice(-4)}, true);
    presence.set(data.from,{online:true,name:data.fromName});
    addMessage(data, false);
    if (!peer) selectContact(data.from);
  });
  socket.on('message:read', ({clientId, readAt}) => startTimer(clientId, readAt));
  socket.on('message:error', () => { if (peer) { presence.set(peer,{online:false,name:null}); selectContact(peer); } toast('Kontakt ist offline. Nichts wurde gespeichert.'); });
  socket.on('disconnect', () => { $('identityOrb').classList.remove('on'); });
  socket.on('connect_error', () => toast('Server nicht erreichbar. Bitte kurz neu laden.'));

  reactions.forEach(item => {
    const button = document.createElement('button'); button.type = 'button'; button.className = 'emoji-option'; button.title = `${item.label} · ${item.shortcut}`;
    const sprite = document.createElement('span'); sprite.className = 'emoji-sprite'; sprite.style.setProperty('--sprite-x', `${item.col / 2 * 100}%`); sprite.style.setProperty('--sprite-y', `${item.row / 2 * 100}%`);
    const label = document.createElement('small'); label.textContent = item.label; button.append(sprite, label);
    button.addEventListener('click', () => { $('messageInput').value = item.shortcut; $('messageInput').focus(); $('emojiPicker').hidden = true; $('emojiTrigger').setAttribute('aria-expanded','false'); });
    $('emojiGrid').appendChild(button);
  });
  $('emojiTrigger').addEventListener('click', () => { const opening = $('emojiPicker').hidden; $('emojiPicker').hidden = !opening; $('emojiTrigger').setAttribute('aria-expanded', String(opening)); });
  document.addEventListener('click', e => { if (!e.target.closest('.composer')) { $('emojiPicker').hidden = true; $('emojiTrigger').setAttribute('aria-expanded','false'); } });

  $('shopButton').addEventListener('click', () => { renderShop(); $('shopDialog').showModal(); });
  $('closeShop').addEventListener('click', () => $('shopDialog').close());
  $('shopDialog').addEventListener('click', e => { if (e.target === $('shopDialog')) $('shopDialog').close(); });
  $('codeForm').addEventListener('submit', e => {
    e.preventDefault(); const code = $('codeInput').value.trim().toLowerCase();
    if (code !== 'dan1000xl') return toast('Code nicht erkannt');
    if (progress.redeemedCodes.includes(code)) return toast('Code wurde bereits eingelöst');
    progress.redeemedCodes.push(code); progress.coins += 1000; save(); $('codeInput').value = ''; renderYokai(); renderShop(); toast('+1.000 MyGho-Coins');
  });
  function completeRitual(type, message, reward = 2) {
    if (progress.rituals[type] === dayKey()) return;
    progress.rituals[type] = dayKey(); progress.xp += reward; save(); renderYokai(); toast(`${message} · +${reward} XP`);
  }
  $('morningRitual').addEventListener('click', () => completeRitual('morning','Dein Gho ist wach'));
  $('auraRitual').addEventListener('click', () => {
    completeRitual('aura','Die Aura antwortet',1);
    $('yokaiHero').animate([{filter:'brightness(1)'},{filter:'brightness(1.45)'},{filter:'brightness(1)'}],{duration:650,easing:'ease-out'});
  });
  $('sleepRitual').addEventListener('click', () => completeRitual('sleep','Gute Nacht, kleiner Gho'));
  renderYokai(); route(location.hash === '#yokai' ? 'yokai' : 'chat');
})();
