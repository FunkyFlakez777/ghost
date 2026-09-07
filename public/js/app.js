(() => {
  const socket = io();
  const $ = (id) => document.getElementById(id);
  const STORE = 'ychat_progress_v1';
  const unlockLevels = {standard:1, sakura:2, neon:4, kitsune:7, gold:10};
  const skinNames = {standard:'Standard', sakura:'Sakura', neon:'Neon', kitsune:'Kitsune', gold:'Gold'};
  const skinAssets = {standard:'/assets/yokai-standard-v2.png', sakura:'/assets/yokai-sakura.png', neon:'/assets/yokai-neon.png', kitsune:'/assets/yokai-kitsune.png', gold:'/assets/yokai-gold.png'};
  const shopSkins = [
    {id:'cherry', name:'Cherry Blossom', price:250, col:0, row:0},
    {id:'cyber', name:'Cyber', price:300, col:1, row:0},
    {id:'angel', name:'Angel', price:350, col:2, row:0},
    {id:'devil_skin', name:'Devil', price:400, col:3, row:0},
    {id:'panda', name:'Panda', price:250, col:0, row:1},
    {id:'neko', name:'Neko', price:300, col:1, row:1},
    {id:'dragon', name:'Dragon', price:450, col:2, row:1},
    {id:'galaxy', name:'Galaxy', price:450, col:3, row:1}
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
  const defaults = {xp:0, coins:0, messages:0, streak:0, lastActive:null, activeDate:null, todayMessages:0, skin:'standard', purchased:[], redeemedCodes:[]};
  let progress;
  try { progress = {...defaults, ...JSON.parse(localStorage.getItem(STORE) || '{}')}; }
  catch { progress = {...defaults}; }
  let me = '', peer = '', peerOnline = false;
  const timers = new Map();

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
    const scene = document.createElement('div'); scene.className = `rendered-scene mood-${currentMood}`;
    const background = document.createElement('img'); background.className = 'rendered-background'; background.src = '/assets/reference-scene-clean.jpg'; background.alt = '';
    const premium = shopSkins.find(item => item.id === progress.skin);
    const character = premium ? makeShopSprite(premium, 'rendered-character premium-character') : document.createElement('img');
    if (!premium) { character.className = 'rendered-character'; character.src = skinAssets[progress.skin]; }
    character.setAttribute('role','img'); character.setAttribute('aria-label', `${premium?.name || skinNames[progress.skin]} Gho, ${currentMood}`);
    scene.append(background, character);
    if (currentMood === 'sleepy') { const fx = document.createElement('span'); fx.className = 'mood-fx'; fx.textContent = 'Zz'; scene.appendChild(fx); }
    if (currentMood === 'sad') { const fx = document.createElement('span'); fx.className = 'mood-fx'; fx.textContent = '·'; scene.appendChild(fx); }
    $('yokaiHero').replaceChildren(scene);
    document.querySelectorAll('.yokai-thumb').forEach(img => img.src = premium ? '/assets/yokai-standard-v2.png' : skinAssets[progress.skin]);
    document.querySelectorAll('.rule-grid article').forEach((el, index) => el.classList.toggle('active', ['happy','sleepy','sad'][index] === currentMood));
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
    const sprite = document.createElement('span'); sprite.className = className;
    sprite.style.setProperty('--shop-x', `${item.col / 3 * 100}%`); sprite.style.setProperty('--shop-y', `${item.row * 100}%`); return sprite;
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

  function updatePeer(online) {
    peerOnline = online;
    $('peerName').textContent = peer || 'Noch kein Kontakt';
    $('conversationName').textContent = peer || 'Wähle einen Kontakt';
    $('peerState').textContent = peer ? (online ? 'Jetzt online' : 'Gerade offline') : 'ID eingeben und prüfen';
    $('conversationState').textContent = peer ? (online ? 'Online · Nachrichten live' : 'Offline · keine Zustellung') : 'Nicht verbunden';
    $('peerDot').classList.toggle('on', online); $('headDot').classList.toggle('on', online);
    $('messageInput').disabled = !(me && peer && online); $('sendButton').disabled = !(me && peer && online); $('emojiTrigger').disabled = !(me && peer && online);
    if (me && peer) $('emptyChat').classList.add('hidden');
  }

  $('identityForm').addEventListener('submit', e => {
    e.preventDefault(); const id = $('myId').value.trim(); if (!id) return;
    socket.emit('register', {id}, result => {
      if (!result?.ok) return toast('ID konnte nicht aktiviert werden');
      me = result.id; $('identityLabel').textContent = `Online als ${me}`; $('identityOrb').classList.add('on');
      $('myId').disabled = true; e.currentTarget.querySelector('button').disabled = true; updatePeer(peerOnline);
    });
  });
  $('peerForm').addEventListener('submit', e => {
    e.preventDefault(); peer = $('peerId').value.trim(); if (!peer) return;
    socket.emit('presence:check', {id:peer}, ({online}) => updatePeer(online));
  });
  $('newChat').addEventListener('click', () => { $('peerId').value = ''; $('peerId').focus(); });
  socket.on('presence:update', ({id, online}) => { if (id === peer) updatePeer(online); });

  function addMessage(data, mine) {
    $('emptyChat').classList.add('hidden');
    const item = document.createElement('div'); item.className = `message ${mine ? 'mine' : ''}`; item.dataset.id = data.clientId;
    const bubble = document.createElement('div'); bubble.className = 'bubble';
    const stickerMatch = /^\[\[yokai:([a-z]+)\]\]$/.exec(data.text);
    const reaction = stickerMatch && reactions.find(item => item.id === stickerMatch[1]);
    if (reaction) {
      bubble.classList.add('sticker-bubble');
      const sticker = document.createElement('span'); sticker.className = 'yokai-sticker'; sticker.setAttribute('role','img'); sticker.setAttribute('aria-label', reaction.label); sticker.style.setProperty('--sprite-x', `${reaction.col / 2 * 100}%`); sticker.style.setProperty('--sprite-y', `${reaction.row / 2 * 100}%`); bubble.appendChild(sticker);
    } else bubble.textContent = data.text;
    const meta = document.createElement('div'); meta.className = 'message-meta'; meta.innerHTML = `<span>${mine ? 'GESENDET' : 'GELESEN'}</span> · <span class="timer">${mine ? 'WARTET' : '60s'}</span>`;
    item.append(bubble, meta); $('messages').appendChild(item); $('messages').scrollTop = $('messages').scrollHeight;
    if (!mine) { const readAt = Date.now(); socket.emit('message:read', {to:data.from, clientId:data.clientId, readAt}); startTimer(data.clientId, readAt); }
  }
  function startTimer(clientId, readAt) {
    const item = document.querySelector(`[data-id="${CSS.escape(clientId)}"]`); if (!item) return;
    const label = item.querySelector('.timer'); clearInterval(timers.get(clientId));
    const tick = () => { const left = Math.max(0, 60 - Math.floor((Date.now() - readAt) / 1000)); label.textContent = `${left}s`; if (!left) { clearInterval(timers.get(clientId)); timers.delete(clientId); item.classList.add('gone'); setTimeout(() => item.remove(), 350); } };
    tick(); timers.set(clientId, setInterval(tick, 250));
  }
  $('messageForm').addEventListener('submit', e => {
    e.preventDefault(); let text = $('messageInput').value.trim(); if (!text || !me || !peerOnline) return;
    const exact = reactions.find(item => item.shortcut === text);
    if (exact) text = `[[yokai:${exact.id}]]`;
    else reactions.forEach(item => { text = text.split(item.shortcut).join(item.emoji); });
    socket.emit('message:send', {to:peer, text, clientId:crypto.randomUUID()}); $('messageInput').value = '';
    $('emojiPicker').hidden = true; $('emojiTrigger').setAttribute('aria-expanded','false');
  });
  socket.on('message:sent', data => { addMessage(data, true); recordSentMessage(); });
  socket.on('message:incoming', data => { if (!peer) { peer = data.from; $('peerId').value = peer; updatePeer(true); } if (data.from === peer) addMessage(data, false); });
  socket.on('message:read', ({clientId, readAt}) => startTimer(clientId, readAt));
  socket.on('message:error', () => { updatePeer(false); toast('Kontakt ist offline. Nichts wurde gespeichert.'); });

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
  renderYokai(); route(location.hash === '#yokai' ? 'yokai' : 'chat');
})();
