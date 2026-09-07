
(() => {
  const NS = 'http://www.w3.org/2000/svg';
  const uid = () => `y${Math.random().toString(36).slice(2,10)}`;

  const skinDefs = {
    standard: {
      id:'standard', name:'Standard', price:0,
      body:'#02070b', bodyMid:'#07141d', stroke:'#a6eaff',
      glow:'#6ad8ff', glowSoft:'#2f8fc9', accent:'#bff3ff',
      eye:'#ffffff', particles:'drops'
    },
    sakura: {
      id:'sakura', name:'Sakura', price:150,
      body:'#cf7fa8', bodyMid:'#efb0ce', stroke:'#ffd7ea',
      glow:'#ff8bc6', glowSoft:'#b84f8e', accent:'#ffe5f2',
      eye:'#21101b', particles:'petals'
    },
    neon: {
      id:'neon', name:'Neon', price:200,
      body:'#07101b', bodyMid:'#172658', stroke:'#62f6ff',
      glow:'#8d4dff', glowSoft:'#244dff', accent:'#7df9ff',
      eye:'#eaffff', particles:'sparks'
    },
    kitsune: {
      id:'kitsune', name:'Kitsune', price:300,
      body:'#05090c', bodyMid:'#10161c', stroke:'#ff9f68',
      glow:'#ff7548', glowSoft:'#9a2f19', accent:'#fff4ed',
      eye:'#ffffff', particles:'embers', ears:true, mask:true
    },
    gold: {
      id:'gold', name:'Gold', price:500,
      body:'#0b0903', bodyMid:'#28200b', stroke:'#ffe39a',
      glow:'#ffc84f', glowSoft:'#9d7114', accent:'#fff1b8',
      eye:'#ffffff', particles:'gold', halo:true
    }
  };

  const moods = {
    happy:{name:'HAPPY', icon:'☻', quote:'„Du chattest oft. Weiter so!“'},
    calm:{name:'CALM', icon:'◒', quote:'„Alles im Flow.“'},
    sleepy:{name:'SLEEPY', icon:'☾', quote:'„Gute Nacht.“'},
    sad:{name:'SAD', icon:'☁', quote:'„Ich bin da.“'},
    hyped:{name:'HYPED', icon:'ϟ', quote:'„Lange Session!“'},
    curious:{name:'CURIOUS', icon:'?', quote:'„Was geht ab?“'}
  };

  function el(name, attrs={}) {
    const n = document.createElementNS(NS, name);
    for (const [k,v] of Object.entries(attrs)) n.setAttribute(k, String(v));
    return n;
  }

  function defsFor(svg, d, prefix){
    const defs = el('defs');

    const bodyGrad = el('radialGradient',{id:`${prefix}-body`,cx:'38%',cy:'26%',r:'72%'});
    bodyGrad.append(
      el('stop',{offset:'0%','stop-color':d.bodyMid,'stop-opacity':'.96'}),
      el('stop',{offset:'55%','stop-color':d.body}),
      el('stop',{offset:'100%','stop-color':'#010305'})
    );

    const auraGrad = el('radialGradient',{id:`${prefix}-aura`,cx:'50%',cy:'50%',r:'50%'});
    auraGrad.append(
      el('stop',{offset:'0%','stop-color':d.glow,'stop-opacity':'.34'}),
      el('stop',{offset:'52%','stop-color':d.glowSoft,'stop-opacity':'.13'}),
      el('stop',{offset:'100%','stop-color':d.glowSoft,'stop-opacity':'0'})
    );

    const sky = el('linearGradient',{id:`${prefix}-sky`,x1:'0',y1:'0',x2:'0',y2:'1'});
    sky.append(
      el('stop',{offset:'0%','stop-color':'#02070b'}),
      el('stop',{offset:'58%','stop-color':'#061421'}),
      el('stop',{offset:'100%','stop-color':'#02080d'})
    );

    const moon = el('radialGradient',{id:`${prefix}-moon`,cx:'35%',cy:'32%',r:'72%'});
    moon.append(
      el('stop',{offset:'0%','stop-color':'#63829f'}),
      el('stop',{offset:'55%','stop-color':'#314a62'}),
      el('stop',{offset:'100%','stop-color':'#0e1d2b'})
    );

    const blur12 = el('filter',{id:`${prefix}-blur12`,x:'-70%',y:'-70%',width:'240%',height:'240%'});
    blur12.appendChild(el('feGaussianBlur',{stdDeviation:'12'}));

    const blur5 = el('filter',{id:`${prefix}-blur5`,x:'-70%',y:'-70%',width:'240%',height:'240%'});
    blur5.appendChild(el('feGaussianBlur',{stdDeviation:'5'}));

    const glow = el('filter',{id:`${prefix}-glow`,x:'-80%',y:'-80%',width:'260%',height:'260%'});
    glow.append(
      el('feGaussianBlur',{stdDeviation:'5',result:'b1'}),
      el('feGaussianBlur',{stdDeviation:'12',in:'SourceGraphic',result:'b2'})
    );
    const merge = el('feMerge');
    merge.append(el('feMergeNode',{in:'b2'}),el('feMergeNode',{in:'b1'}),el('feMergeNode',{in:'SourceGraphic'}));
    glow.appendChild(merge);

    defs.append(bodyGrad,auraGrad,sky,moon,blur12,blur5,glow);
    svg.appendChild(defs);
  }

  function bodyPath(){
    // Narrow flame crown, fuller cheeks, tucked waist, little feet.
    return 'M100 16 ' +
      'C93 31 102 38 89 51 ' +
      'C79 61 67 62 65 77 ' +
      'C63 89 69 94 57 104 ' +
      'C41 118 35 137 39 159 ' +
      'C44 190 64 207 87 211 ' +
      'C91 213 91 221 86 226 ' +
      'C82 230 84 236 91 237 ' +
      'C98 238 102 232 104 226 ' +
      'C108 232 112 238 120 237 ' +
      'C128 236 129 230 124 226 ' +
      'C119 221 119 214 124 211 ' +
      'C147 205 162 186 164 159 ' +
      'C166 136 157 118 143 106 ' +
      'C132 97 137 88 134 77 ' +
      'C130 61 116 60 110 48 ' +
      'C104 36 112 26 100 16 Z';
  }

  function faceForMood(svg, mood, d){
    const eyes = el('g',{class:'eyes'});
    const addEye = (cx,cy,rx,ry) => {
      const e = el('ellipse',{class:'eye',cx,cy,rx,ry,fill:d.eye});
      eyes.appendChild(e);
      return e;
    };

    if (mood === 'sleepy') {
      eyes.append(
        el('path',{class:'eye',d:'M72 139 Q80 145 88 139',fill:'none',stroke:d.eye,'stroke-width':4,'stroke-linecap':'round'}),
        el('path',{class:'eye',d:'M112 139 Q120 145 128 139',fill:'none',stroke:d.eye,'stroke-width':4,'stroke-linecap':'round'})
      );
    } else if (mood === 'sad') {
      addEye(80,138,8,10); addEye(120,138,8,10);
      eyes.append(
        el('path',{d:'M70 125 Q80 120 89 127',fill:'none',stroke:d.eye,'stroke-width':3,'stroke-linecap':'round'}),
        el('path',{d:'M111 127 Q120 120 130 125',fill:'none',stroke:d.eye,'stroke-width':3,'stroke-linecap':'round'})
      );
    } else if (mood === 'hyped') {
      addEye(79,135,9,12); addEye(121,135,9,12);
      eyes.append(
        el('path',{d:'M68 120 L88 126',stroke:d.eye,'stroke-width':3.5,'stroke-linecap':'round'}),
        el('path',{d:'M132 120 L112 126',stroke:d.eye,'stroke-width':3.5,'stroke-linecap':'round'})
      );
    } else {
      addEye(80,136,8.8,11.5); addEye(120,136,8.8,11.5);
      if (mood === 'curious') {
        eyes.appendChild(el('path',{d:'M112 117 Q122 110 132 118',fill:'none',stroke:d.eye,'stroke-width':3,'stroke-linecap':'round'}));
      }
    }

    svg.appendChild(eyes);

    const mouthMap = {
      happy:'M73 157 Q100 177 127 157',
      calm:'M82 160 Q100 165 118 160',
      sleepy:'M88 161 Q100 157 112 161',
      sad:'M77 171 Q100 152 123 171',
      hyped:'M76 156 Q100 182 124 156 Q100 170 76 156',
      curious:'M88 161 Q99 168 111 161'
    };
    svg.appendChild(el('path',{
      class:'mouth',d:mouthMap[mood]||mouthMap.calm,fill:'none',
      stroke:d.eye,'stroke-width':3.8,'stroke-linecap':'round'
    }));

    if (mood === 'sad') {
      svg.appendChild(el('path',{
        class:'mood-fx tear',d:'M139 140 C132 151 134 160 140 160 C147 160 149 151 139 140Z',
        fill:'#79dcff'
      }));
    }
    if (mood === 'sleepy') {
      const z = el('text',{x:149,y:111,fill:'#c8efff','font-size':18,'font-family':'Space Mono'});
      z.textContent='Z';
      const z2 = el('text',{x:163,y:94,fill:'#b7e9ff','font-size':12,'font-family':'Space Mono'});
      z2.textContent='z';
      svg.append(z,z2);
    }
    if (mood === 'curious') {
      const q = el('text',{x:146,y:111,fill:d.accent,'font-size':21,'font-family':'Space Mono'});
      q.textContent='?'; svg.appendChild(q);
    }
  }

  function addExtras(svg, d){
    if (d.ears) {
      svg.append(
        el('path',{d:'M56 102 L33 58 Q28 45 42 52 L74 77 Z',fill:'#d96546',stroke:d.stroke,'stroke-width':3}),
        el('path',{d:'M144 102 L167 58 Q172 45 158 52 L126 77 Z',fill:'#d96546',stroke:d.stroke,'stroke-width':3}),
        el('path',{d:'M42 61 L52 84 L65 77 Z',fill:'#f4dfd3',opacity:'.9'}),
        el('path',{d:'M158 61 L148 84 L135 77 Z',fill:'#f4dfd3',opacity:'.9'})
      );
    }
    if (d.mask) {
      svg.append(
        el('path',{d:'M62 111 Q100 84 138 111 L126 147 Q100 159 74 147 Z',fill:'#f3f0ed',stroke:'#ff7855','stroke-width':2.6}),
        el('path',{d:'M100 96 L91 115 L100 110 L109 115 Z',fill:'#ff614e'}),
        el('path',{d:'M72 113 L89 120 L76 126',fill:'none',stroke:'#ff614e','stroke-width':4}),
        el('path',{d:'M128 113 L111 120 L124 126',fill:'none',stroke:'#ff614e','stroke-width':4})
      );
    }
    if (d.halo) {
      svg.appendChild(el('ellipse',{cx:100,cy:23,rx:34,ry:8,fill:'none',stroke:d.stroke,'stroke-width':5,opacity:'.95'}));
    }
  }

  function createCharacterGroup({skin='standard',mood='happy',motion=true,particles=true,prefix='y'}={}){
    const d = skinDefs[skin] || skinDefs.standard;
    const g = el('g',{class:`yokai-rig ${motion?'':'no-motion'} ${particles?'':'particles-off'}`});

    // Back aura
    g.appendChild(el('ellipse',{
      class:'aura-back',cx:100,cy:146,rx:82,ry:105,
      fill:`url(#${prefix}-aura)`,filter:`url(#${prefix}-blur12)`
    }));

    // Ground glow under character
    g.appendChild(el('ellipse',{
      class:'ground-glow',cx:100,cy:226,rx:66,ry:11,
      fill:d.glow,opacity:'.18',filter:`url(#${prefix}-blur5)`
    }));

    // Arms tucked into silhouette
    g.append(
      el('path',{class:'limb arm',d:'M48 151 Q31 164 42 184 Q48 191 53 181',fill:'none',stroke:d.stroke,'stroke-width':5,'stroke-linecap':'round',opacity:'.92'}),
      el('path',{class:'limb arm',d:'M152 151 Q169 164 158 184 Q152 191 147 181',fill:'none',stroke:d.stroke,'stroke-width':5,'stroke-linecap':'round',opacity:'.92'})
    );

    // Soft body glow copy behind main body
    const glowBody = el('path',{
      class:'body-glow',d:bodyPath(),fill:'none',stroke:d.glow,'stroke-width':10,
      opacity:'.42',filter:`url(#${prefix}-glow)`
    });
    g.appendChild(glowBody);

    const body = el('path',{
      class:'body',d:bodyPath(),fill:`url(#${prefix}-body)`,stroke:d.stroke,
      'stroke-width':3.2,'stroke-linejoin':'round'
    });
    g.appendChild(body);

    // Small feet/front paws
    g.append(
      el('path',{class:'foot',d:'M80 213 Q72 218 73 229 Q75 237 88 235 Q95 232 94 221',fill:'#02070b',stroke:d.stroke,'stroke-width':3}),
      el('path',{class:'foot',d:'M120 213 Q128 218 127 229 Q125 237 112 235 Q105 232 106 221',fill:'#02070b',stroke:d.stroke,'stroke-width':3})
    );

    addExtras(g, d);
    faceForMood(g, mood, d);

    // Spirit particles around the character
    if (particles) {
      const pts = [[30,118,.1],[168,95,.6],[28,182,1.1],[170,178,1.5]];
      pts.forEach(([x,y,delay],i)=>{
        let p;
        if (d.particles === 'petals') {
          p = el('path',{d:`M${x} ${y} q8 -9 13 0 q-3 11 -13 8 q-9 4 -11 -4 q1 -7 11 -12`,fill:i%2?'#ffe5f1':'#ff9bc8',class:'particle'});
        } else if (d.particles === 'sparks') {
          p = el('path',{d:`M${x} ${y} l4 8 l8 3 l-8 3 l-4 8 l-4-8 l-8-3 l8-3z`,fill:i%2?d.accent:'#8554ff',class:'particle'});
        } else if (d.particles === 'embers') {
          p = el('circle',{cx:x,cy:y,r:i%2?2.5:4,fill:i%2?'#ffc077':'#ff704b',class:'particle'});
        } else if (d.particles === 'gold') {
          p = el('circle',{cx:x,cy:y,r:i%2?2.5:4,fill:i%2?'#fff1b1':'#ffc950',class:'particle'});
        } else {
          p = el('path',{
            d:`M${x} ${y} C${x-8} ${y+12},${x-7} ${y+23},${x} ${y+25} C${x+8} ${y+23},${x+8} ${y+12},${x} ${y}Z`,
            fill:d.accent,class:'particle spirit-drop'
          });
        }
        p.style.animationDelay=`${delay}s`;
        g.appendChild(p);
      });
    }

    return g;
  }

  function createYokai({skin='standard',mood='happy',size=200,motion=true,particles=true}={}){
    const d = skinDefs[skin] || skinDefs.standard;
    const prefix = uid();
    const svg = el('svg',{viewBox:'0 0 200 250',width:size,height:size*1.25,class:'yokai-svg compact-yokai'});
    svg.style.setProperty('--yokai-glow', d.glow);
    defsFor(svg,d,prefix);
    svg.appendChild(createCharacterGroup({skin,mood,motion,particles,prefix}));
    attachBounce(svg);
    return svg;
  }

  function spiritFlame(x,y,s,d,prefix,delay=0,opacity=1){
    const g = el('g',{class:'scene-spirit',transform:`translate(${x} ${y}) scale(${s})`,opacity});
    g.style.animationDelay = `${delay}s`;
    g.append(
      el('ellipse',{cx:0,cy:22,rx:16,ry:20,fill:d.glow,opacity:'.24',filter:`url(#${prefix}-blur12)`}),
      el('path',{d:'M0 0 C-7 10 -12 17 -9 27 C-6 38 7 39 10 28 C13 18 6 13 4 8 C2 5 2 2 0 0 Z',fill:d.glow,opacity:'.9'}),
      el('path',{d:'M1 11 C-2 17 -5 22 -3 28 C-1 33 4 33 6 27 C7 22 4 18 3 15 C2 13 2 12 1 11 Z',fill:'#dfffff'})
    );
    return g;
  }

  function createScene({skin='standard',mood='happy',width=400,height=520,motion=true,particles=true}={}){
    const d = skinDefs[skin] || skinDefs.standard;
    const prefix = uid();
    const svg = el('svg',{
      viewBox:'0 0 400 520',preserveAspectRatio:'xMidYMid slice',
      width:'100%',height:'100%',class:'yokai-scene-svg'
    });
    defsFor(svg,d,prefix);

    // Sky
    svg.appendChild(el('rect',{x:0,y:0,width:400,height:520,fill:`url(#${prefix}-sky)`}));

    // Star specks
    const stars = el('g',{class:'stars',opacity:'.52'});
    [[28,66,1.1],[48,91,.8],[92,48,.9],[121,77,.7],[161,39,.9],[206,72,.8],[260,45,1],[312,72,.9],[352,46,.8],[375,98,.6],[234,112,.7],[145,116,.6]].forEach(([x,y,r])=>{
      stars.appendChild(el('circle',{cx:x,cy:y,r,fill:'#bdeaff'}));
    });
    svg.appendChild(stars);

    // Moon + haze
    svg.append(
      el('circle',{cx:303,cy:104,r:42,fill:d.glowSoft,opacity:'.11',filter:`url(#${prefix}-blur12)`}),
      el('circle',{cx:303,cy:104,r:32,fill:`url(#${prefix}-moon)`,opacity:'.98'})
    );

    // Far mountains
    svg.append(
      el('path',{d:'M0 320 L60 246 L105 286 L151 214 L218 291 L269 231 L330 292 L400 242 L400 520 L0 520 Z',fill:'#06131e',opacity:'.9'}),
      el('path',{d:'M0 352 L72 288 L126 339 L197 270 L251 329 L318 277 L400 343 L400 520 L0 520 Z',fill:'#081a27',opacity:'.76'})
    );

    // Forest silhouettes
    const forest = el('g',{fill:'#02080c',opacity:'.96'});
    for(let i=0;i<9;i++){
      const x=12+i*47, h=76+(i%3)*18;
      forest.append(
        el('path',{d:`M${x} 338 L${x+17} ${338-h} L${x+34} 338 Z`}),
        el('path',{d:`M${x+4} 318 L${x+17} ${318-h*.7} L${x+30} 318 Z`})
      );
    }
    svg.appendChild(forest);

    // Torii on left, recognisable but still silhouette
    const torii = el('g',{fill:'#010406',opacity:'.97',transform:'translate(24 205) scale(.86)'});
    torii.append(
      el('rect',{x:18,y:36,width:12,height:118,rx:2}),
      el('rect',{x:78,y:36,width:12,height:118,rx:2}),
      el('path',{d:'M0 27 Q54 49 108 27 L104 40 Q54 58 4 40 Z'}),
      el('rect',{x:11,y:48,width:87,height:10,rx:2}),
      el('rect',{x:30,y:72,width:48,height:7,rx:2})
    );
    svg.appendChild(torii);

    // Foreground rocks
    svg.append(
      el('path',{d:'M0 410 Q38 374 74 399 Q104 367 139 405 L139 520 L0 520 Z',fill:'#02080c'}),
      el('path',{d:'M267 409 Q300 367 337 399 Q370 374 400 410 L400 520 L267 520 Z',fill:'#02080c'})
    );

    // Mist layers
    svg.append(
      el('ellipse',{cx:118,cy:403,rx:125,ry:26,fill:'#75b6db',opacity:'.05',filter:`url(#${prefix}-blur12)`}),
      el('ellipse',{cx:292,cy:430,rx:130,ry:24,fill:'#75b6db',opacity:'.045',filter:`url(#${prefix}-blur12)`})
    );

    // Character ground / reflection
    svg.append(
      el('ellipse',{cx:203,cy:447,rx:91,ry:18,fill:d.glow,opacity:'.14',filter:`url(#${prefix}-blur12)`}),
      el('ellipse',{cx:203,cy:447,rx:68,ry:10,fill:'none',stroke:d.glow,'stroke-width':1.8,opacity:'.55'})
    );

    // Scene spirits behind / around
    if (particles) {
      svg.append(
        spiritFlame(92,352,.78,d,prefix,.2,.95),
        spiritFlame(298,310,.62,d,prefix,.8,.85),
        spiritFlame(341,374,.82,d,prefix,1.25,.95)
      );
    }

    // Main character: scaled up, lower center
    const rig = createCharacterGroup({skin,mood,motion,particles,prefix});
    rig.setAttribute('transform','translate(103 166) scale(1.02)');
    rig.classList.add('hero-rig');
    svg.appendChild(rig);

    // Foreground haze
    svg.appendChild(el('rect',{x:0,y:455,width:400,height:65,fill:'#06131e',opacity:'.18'}));

    attachBounce(svg);
    return svg;
  }

  function attachBounce(target){
    target.addEventListener('click',()=>{
      const rig = target.querySelector('.yokai-rig');
      if (!rig) return;
      rig.animate(
        [{transform:rig.getAttribute('transform') || 'translateY(0)'},
         {transform:(rig.getAttribute('transform') || '') + ' translate(0 -10) scale(1.02)'},
         {transform:rig.getAttribute('transform') || 'translateY(0)'}],
        {duration:430,easing:'cubic-bezier(.2,.8,.2,1)'}
      );
    });
  }

  window.Yokai = {
    skins:skinDefs,
    moods,
    create:createYokai,
    createScene,
    setMood(mood){ window.dispatchEvent(new CustomEvent('yokai:setMood',{detail:{mood}})); },
    setSkin(skin){ window.dispatchEvent(new CustomEvent('yokai:setSkin',{detail:{skin}})); },
    blink(){
      document.querySelectorAll('.yokai-svg .eye,.yokai-scene-svg .eye').forEach(e=>{
        e.animate([{transform:'scaleY(1)'},{transform:'scaleY(.06)'},{transform:'scaleY(1)'}],{duration:220});
      });
    },
    bounce(){
      document.querySelectorAll('.yokai-rig').forEach(r=>{
        r.animate([{opacity:1},{opacity:.97},{opacity:1}],{duration:430});
      });
    },
    sleep(){ this.setMood('sleepy'); },
    lookLeft(){ document.querySelectorAll('.yokai-rig .eyes').forEach(e=>e.style.transform='translateX(-3px)'); },
    lookRight(){ document.querySelectorAll('.yokai-rig .eyes').forEach(e=>e.style.transform='translateX(3px)'); },
    lookCenter(){ document.querySelectorAll('.yokai-rig .eyes').forEach(e=>e.style.transform='translateX(0)'); }
  };
})();
