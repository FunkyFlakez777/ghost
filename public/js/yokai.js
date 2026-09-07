
(() => {
  const NS = 'http://www.w3.org/2000/svg';

  const skinDefs = {
    standard: {
      id:'standard', name:'Standard', price:0, mood:'happy',
      body:'#07151e', stroke:'#72d8ff', glow:'#56cfff', accent:'#7ee4ff', particles:'drops'
    },
    sakura: {
      id:'sakura', name:'Sakura', price:150, mood:'happy',
      body:'#f2a6ca', stroke:'#ffd0e5', glow:'#ff7ec2', accent:'#ffdef0', particles:'petals'
    },
    neon: {
      id:'neon', name:'Neon', price:200, mood:'hyped',
      body:'#0b132b', stroke:'#63f3ff', glow:'#8b45ff', accent:'#bb5cff', particles:'sparks'
    },
    kitsune: {
      id:'kitsune', name:'Kitsune', price:300, mood:'curious',
      body:'#090f14', stroke:'#ff9d65', glow:'#ff713e', accent:'#f4f6f8', particles:'embers', ears:true, mask:true
    },
    gold: {
      id:'gold', name:'Gold', price:500, mood:'calm',
      body:'#15130b', stroke:'#ffd879', glow:'#ffc94f', accent:'#fff0ac', particles:'gold', halo:true
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
    const n = document.createElementNS(NS,name);
    Object.entries(attrs).forEach(([k,v]) => n.setAttribute(k,String(v)));
    return n;
  }

  function mouthPath(mood){
    return {
      happy:'M75 152 Q100 170 125 152',
      calm:'M84 157 Q100 162 116 157',
      sleepy:'M86 157 Q100 151 114 157',
      sad:'M77 166 Q100 147 123 166',
      hyped:'M78 151 Q100 177 122 151 Q100 165 78 151',
      curious:'M89 158 Q99 164 109 158'
    }[mood] || 'M84 157 Q100 162 116 157';
  }

  function eyeGeometry(mood){
    if(mood === 'sleepy') return {ry:3, cy:132};
    if(mood === 'sad') return {ry:8, cy:136};
    if(mood === 'hyped') return {ry:12, cy:131};
    return {ry:11, cy:132};
  }

  function createParticles(svg, type, accent){
    const g = el('g',{class:'particles'});
    const pts = [[36,103,0],[161,85,.35],[31,170,.75],[171,166,1.05],[146,48,1.35]];
    pts.forEach(([x,y,d],i)=>{
      let p;
      if(type==='petals'){
        p=el('path',{d:`M${x} ${y} q8 -9 13 0 q-3 11 -13 8 q-9 4 -11 -4 q1 -7 11 -12`,fill: i%2?'#ffe4f1':'#ff9ac7',class:'particle'});
      }else if(type==='sparks'){
        p=el('path',{d:`M${x} ${y} l4 8 l8 3 l-8 3 l-4 8 l-4-8 l-8-3 l8-3z`,fill:i%2?accent:'#77f7ff',class:'particle'});
      }else if(type==='embers'){
        p=el('circle',{cx:x,cy:y,r:i%2?2:3,fill:i%2?'#ffbd72':'#ff704a',class:'particle'});
      }else if(type==='gold'){
        p=el('circle',{cx:x,cy:y,r:i%2?2:4,fill:i%2?'#fff2b1':'#ffc84d',class:'particle'});
      }else{
        p=el('path',{d:`M${x} ${y} C${x-8} ${y+12},${x-8} ${y+20},${x} ${y+22} C${x+8} ${y+20},${x+8} ${y+12},${x} ${y}Z`,fill:accent,class:'particle'});
      }
      p.style.animationDelay=`${d}s`;
      g.appendChild(p);
    });
    svg.appendChild(g);
  }

  function createYokai({skin='standard', mood='happy', size=200, motion=true, particles=true}={}){
    const d = skinDefs[skin] || skinDefs.standard;
    const svg = el('svg',{viewBox:'0 0 200 235',width:size,height:size*1.175,class:`yokai-svg ${motion?'':'no-motion'} ${particles?'':'particles-off'}`});
    svg.style.setProperty('--yokai-glow',d.glow);

    const defs=el('defs');
    const grad=el('radialGradient',{id:`g-${Math.random().toString(36).slice(2)}`,cx:'38%',cy:'28%'});
    grad.append(el('stop',{offset:'0%', 'stop-color': d.accent, 'stop-opacity':'.36'}));
    grad.append(el('stop',{offset:'56%', 'stop-color': d.body}));
    grad.append(el('stop',{offset:'100%', 'stop-color':'#02070b'}));
    defs.appendChild(grad);
    svg.appendChild(defs);
    const gradId=grad.id;

    if(d.halo) svg.appendChild(el('ellipse',{cx:100,cy:32,rx:34,ry:8,fill:'none',stroke:d.stroke,'stroke-width':5,opacity:.9}));

    if(d.ears){
      svg.appendChild(el('path',{d:'M48 100 L30 53 Q28 38 43 49 L70 73 Z',fill:'#d75f42',stroke:d.stroke,'stroke-width':3}));
      svg.appendChild(el('path',{d:'M152 100 L170 53 Q172 38 157 49 L130 73 Z',fill:'#d75f42',stroke:d.stroke,'stroke-width':3}));
      svg.appendChild(el('path',{d:'M39 58 L49 82 L61 73 Z',fill:'#f3d9ca',opacity:.9}));
      svg.appendChild(el('path',{d:'M161 58 L151 82 L139 73 Z',fill:'#f3d9ca',opacity:.9}));
    }

    const body=el('path',{
      class:'body',
      d:'M100 19 C86 31 93 43 77 50 C61 57 57 75 66 88 C43 95 31 117 34 146 C37 182 60 208 100 211 C140 208 163 182 166 146 C169 116 155 95 134 88 C143 71 134 53 117 49 C103 45 110 29 100 19 Z',
      fill:`url(#${gradId})`,stroke:d.stroke,'stroke-width':3.2,'stroke-linejoin':'round'
    });
    svg.appendChild(body);

    if(d.mask){
      svg.appendChild(el('path',{d:'M62 108 Q100 77 138 108 L126 144 Q100 158 74 144 Z',fill:'#f2f1ee',stroke:'#ff7652','stroke-width':2.4}));
      svg.appendChild(el('path',{d:'M100 95 L91 112 L100 108 L109 112 Z',fill:'#ff5f4b'}));
      svg.appendChild(el('path',{d:'M71 110 L89 118 L75 124',fill:'none',stroke:'#ff5f4b','stroke-width':4}));
      svg.appendChild(el('path',{d:'M129 110 L111 118 L125 124',fill:'none',stroke:'#ff5f4b','stroke-width':4}));
    }

    const eg=eyeGeometry(mood);
    const eyes=el('g',{class:'eyes'});
    const leftEye=el('ellipse',{class:'eye',cx:78,cy:eg.cy,rx:9,ry:eg.ry,fill:'#f7fcff'});
    const rightEye=el('ellipse',{class:'eye',cx:122,cy:eg.cy,rx:9,ry:eg.ry,fill:'#f7fcff'});
    eyes.append(leftEye,rightEye);
    if(mood==='curious'){
      const brow=el('path',{d:'M112 112 Q126 103 137 112',fill:'none',stroke:d.stroke,'stroke-width':3,'stroke-linecap':'round'});
      eyes.appendChild(brow);
    }
    if(mood==='hyped'){
      eyes.appendChild(el('path',{d:'M66 110 L83 115',stroke:'#ffffff','stroke-width':3,'stroke-linecap':'round'}));
      eyes.appendChild(el('path',{d:'M134 110 L117 115',stroke:'#ffffff','stroke-width':3,'stroke-linecap':'round'}));
    }
    svg.appendChild(eyes);

    const mouth=el('path',{d:mouthPath(mood),fill:'none',stroke:'#f7fcff','stroke-width':3.5,'stroke-linecap':'round'});
    svg.appendChild(mouth);

    if(mood==='sad'){
      svg.appendChild(el('path',{d:'M139 139 C132 151 134 158 140 158 C147 158 149 150 139 139Z',fill:'#6fd9ff',opacity:.9}));
    }
    if(mood==='sleepy'){
      const z=el('text',{x:148,y:95,fill:'#bfeaff','font-size':18,'font-family':'Space Mono'}); z.textContent='Z';
      const z2=el('text',{x:161,y:79,fill:'#bfeaff','font-size':12,'font-family':'Space Mono'}); z2.textContent='z';
      svg.append(z,z2);
    }

    createParticles(svg,d.particles,d.accent);
    svg.addEventListener('click',()=> {
      svg.animate([{transform:'translateY(0) scale(1)'},{transform:'translateY(-13px) scale(1.04)'},{transform:'translateY(0) scale(1)'}],{duration:420,easing:'cubic-bezier(.2,.8,.2,1)'});
    });
    return svg;
  }

  window.Yokai = {
    skins:skinDefs, moods,
    create:createYokai,
    setMood(mood){ window.dispatchEvent(new CustomEvent('yokai:setMood',{detail:{mood}})); },
    setSkin(skin){ window.dispatchEvent(new CustomEvent('yokai:setSkin',{detail:{skin}})); },
    blink(){ document.querySelectorAll('.yokai-svg .eye').forEach(e=>e.animate([{transform:'scaleY(1)'},{transform:'scaleY(.05)'},{transform:'scaleY(1)'}],{duration:220})); },
    bounce(){ document.querySelectorAll('.yokai-svg').forEach(e=>e.animate([{transform:'translateY(0)'},{transform:'translateY(-14px)'},{transform:'translateY(0)'}],{duration:430,easing:'ease-out'})); },
    sleep(){ this.setMood('sleepy'); },
    lookLeft(){ document.querySelectorAll('.yokai-svg .eyes').forEach(e=>e.style.transform='translateX(-3px)'); },
    lookRight(){ document.querySelectorAll('.yokai-svg .eyes').forEach(e=>e.style.transform='translateX(3px)'); },
    lookCenter(){ document.querySelectorAll('.yokai-svg .eyes').forEach(e=>e.style.transform='translateX(0)'); }
  };
})();
