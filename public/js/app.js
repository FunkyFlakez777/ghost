
(() => {
  const STORAGE_KEY = 'ychat_yokai_state_v040';
  const defaultState = {
    skin:'standard', mood:'happy', coins:650, xp:72, level:3,
    unlocked:['standard'], motion:true, particles:true, moodDetect:true
  };

  let state;
  try { state = {...defaultState, ...JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}')}; }
  catch { state = {...defaultState}; }

  const $ = s => document.querySelector(s);
  const $$ = s => [...document.querySelectorAll(s)];
  const moodOrder = ['happy','calm','sleepy','sad','hyped','curious'];
  const icons = {happy:'☻',calm:'◒',sleepy:'☾',sad:'☁',hyped:'ϟ',curious:'?'};

  const save = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  const unlocked = id => state.unlocked.includes(id);

  function toast(message){
    const t=$('#toast'); t.textContent=message; t.classList.add('show');
    clearTimeout(toast.timer); toast.timer=setTimeout(()=>t.classList.remove('show'),1900);
  }

  function renderHero(){
    const host=$('#heroYokai'); host.innerHTML='';
    host.appendChild(Yokai.create({skin:state.skin,mood:state.mood,size:215,motion:state.motion,particles:state.particles}));
    $('#activeMoodName').textContent=Yokai.moods[state.mood].name;
    $('#moodQuote').textContent=Yokai.moods[state.mood].quote;
    $('#coinBalance').textContent=state.coins;
    $('#modalBalance').textContent=state.coins;
    $('#xpValue').textContent=state.xp;
    $('#levelValue').textContent=state.level;
    $('#xpBar').style.width=`${state.xp}%`;
  }

  function renderMoodTabs(){
    const host=$('#moodTabs'); host.innerHTML='';
    moodOrder.forEach(m=>{
      const b=document.createElement('button');
      b.className=`mood-tab ${state.mood===m?'active':''}`;
      b.innerHTML=`<span class="mood-icon">${icons[m]}</span><span>${Yokai.moods[m].name}</span>`;
      b.addEventListener('click',()=>setMood(m));
      host.appendChild(b);
    });
  }

  function skinCard(id){
    const d=Yokai.skins[id], card=document.createElement('button');
    card.className=`skin-card ${state.skin===id?'active':''}`;
    card.innerHTML=`<div class="skin-yokai"></div><h3>${d.name}</h3><div class="skin-status"></div>`;
    card.querySelector('.skin-yokai').appendChild(Yokai.create({skin:id,mood:state.mood,size:118,motion:state.motion,particles:state.particles}));
    const status=card.querySelector('.skin-status');
    if(state.skin===id) status.textContent='Aktiv';
    else if(unlocked(id)) status.textContent='Freigeschaltet';
    else status.innerHTML=`<span class="price"><span class="coin">◉</span>${d.price} YC</span>`;
    card.addEventListener('click',()=>{
      if(unlocked(id)){ state.skin=id; save(); renderAll(); toast(`${d.name} ausgerüstet`); }
      else openShop();
    });
    return card;
  }

  function renderSkins(){
    const host=$('#skinsGrid'); host.innerHTML='';
    Object.keys(Yokai.skins).forEach(id=>host.appendChild(skinCard(id)));
    $('#skinSectionTitle').textContent=`${Yokai.moods[state.mood].name} SKINS`;
  }

  function renderAccordions(){
    const host=$('#moodAccordions'); host.innerHTML='';
    moodOrder.filter(m=>m!==state.mood).forEach(m=>{
      const b=document.createElement('button'); b.className='accordion';
      b.innerHTML=`<span><span class="acc-icon">${icons[m]}</span>${Yokai.moods[m].name} SKINS</span><span>›</span>`;
      b.addEventListener('click',()=>setMood(m));
      host.appendChild(b);
    });
  }

  function renderReactions(){
    const host=$('#reactionGrid'); host.innerHTML='';
    moodOrder.forEach(m=>{
      const item=document.createElement('div'); item.className='reaction-item';
      item.innerHTML=`<div class="mini-yokai"></div><strong>${Yokai.moods[m].name}</strong><span>${Yokai.moods[m].quote.replace(/[„“]/g,'')}</span>`;
      item.querySelector('.mini-yokai').appendChild(Yokai.create({skin:'standard',mood:m,size:86,motion:state.motion,particles:false}));
      host.appendChild(item);
    });
    const sad=$('#sadPreview'); sad.innerHTML=''; sad.appendChild(Yokai.create({skin:'standard',mood:'sad',size:132,motion:state.motion,particles:state.particles}));
  }

  function renderModal(){
    const host=$('#modalGrid'); host.innerHTML='';
    Object.keys(Yokai.skins).filter(id=>id!=='standard').forEach(id=>{
      const d=Yokai.skins[id], box=document.createElement('div'); box.className='modal-skin';
      const owned=unlocked(id), active=state.skin===id, affordable=state.coins>=d.price;
      box.innerHTML=`<div class="skin-art"></div><strong>${d.name}</strong><div class="skin-status">${owned?'Freigeschaltet':`◉ ${d.price} YC`}</div><button>${active?'Aktiv':owned?'Ausrüsten':affordable?'Kaufen':'Zu wenig YC'}</button>`;
      box.querySelector('.skin-art').appendChild(Yokai.create({skin:id,mood:state.mood,size:102,motion:state.motion,particles:state.particles}));
      const btn=box.querySelector('button'); btn.disabled=active || (!owned && !affordable);
      btn.addEventListener('click',()=> buyOrEquip(id));
      host.appendChild(box);
    });
    $('#modalBalance').textContent=state.coins;
  }

  function buyOrEquip(id){
    const d=Yokai.skins[id];
    if(unlocked(id)){
      state.skin=id; save(); renderAll(); renderModal(); toast(`${d.name} ausgerüstet`);
      return;
    }
    if(state.coins<d.price) return toast('Nicht genug YC');
    state.coins-=d.price; state.unlocked=[...state.unlocked,id]; state.skin=id;
    save(); renderAll(); renderModal(); toast(`${d.name} freigeschaltet`);
  }

  function setMood(mood){
    if(!Yokai.moods[mood]) return;
    state.mood=mood; save(); renderAll();
  }

  function cycleSkin(dir){
    const ids=Object.keys(Yokai.skins).filter(unlocked);
    let i=ids.indexOf(state.skin); i=(i+dir+ids.length)%ids.length;
    state.skin=ids[i]; save(); renderAll();
  }

  function openShop(){ renderModal(); $('#shopModal').showModal(); }
  function renderAll(){
    renderHero(); renderMoodTabs(); renderSkins(); renderAccordions(); renderReactions();
  }

  $('#prevSkin').addEventListener('click',()=>cycleSkin(-1));
  $('#nextSkin').addEventListener('click',()=>cycleSkin(1));
  $('#shopButton').addEventListener('click',openShop);
  $('#modalClose').addEventListener('click',()=>$('#shopModal').close());
  $('#shopModal').addEventListener('click',e=>{if(e.target===$('#shopModal')) $('#shopModal').close()});

  $$('.phone-tab').forEach(b=>b.addEventListener('click',()=>{
    $$('.phone-tab').forEach(x=>x.classList.toggle('active',x===b));
    $$('.view').forEach(v=>v.classList.toggle('active',v.id===`view-${b.dataset.panel}`));
  }));

  $('#toggleMotion').checked=state.motion;
  $('#toggleParticles').checked=state.particles;
  $('#toggleMoodDetect').checked=state.moodDetect;
  $('#toggleMotion').addEventListener('change',e=>{state.motion=e.target.checked;save();renderAll()});
  $('#toggleParticles').addEventListener('change',e=>{state.particles=e.target.checked;save();renderAll()});
  $('#toggleMoodDetect').addEventListener('change',e=>{state.moodDetect=e.target.checked;save()});

  window.addEventListener('yokai:setMood',e=>setMood(e.detail.mood));
  window.addEventListener('yokai:setSkin',e=>{
    const id=e.detail.skin;
    if(!Yokai.skins[id]) return;
    if(unlocked(id)){state.skin=id;save();renderAll()} else openShop();
  });

  // Optional Socket.IO connection: leaves existing chat/presence backend compatible.
  try { window.socket = io({autoConnect:true}); } catch {}

  // Tiny browser API for future chat mood detection.
  window.YChatMood = {
    detect(text=''){
      if(!state.moodDetect) return state.mood;
      const t=text.toLowerCase();
      if(/traurig|schlecht|nicht gut|allein|vermiss/.test(t)) return 'sad';
      if(/müde|schlafen|nacht|kaputt/.test(t)) return 'sleepy';
      if(/wow|krass|lets go|geil|mega|!!!/.test(t)) return 'hyped';
      if(/\?|warum|wieso|wie |was /.test(t)) return 'curious';
      if(/ruhig|okay|passt|entspannt|flow/.test(t)) return 'calm';
      return 'happy';
    },
    react(text){ setMood(this.detect(text)); }
  };

  renderAll();
})();
