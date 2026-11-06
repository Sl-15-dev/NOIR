// A small, on-demand spring system. Positions are local to each fixed hook.
// No timer or animation frame survives once the last pendant comes to rest.
const clamp=(value,min,max)=>Math.min(max,Math.max(min,value));

export function createBadgePhysics({root,stage,world,badges,getScale,isAvailable}) {
  const reduced=matchMedia('(prefers-reduced-motion:reduce)');
  const bodies=new Map(badges.map((badge,index)=>{
    const element=root.querySelector(`[data-badge="${CSS.escape(badge.id)}"]`);
    return [badge.id,{
      badge,element,pendant:element.querySelector('.badge-pendant'),
      ribbons:[...element.querySelectorAll('.badge-lanyard > path')],
      left:element.querySelector('[data-strap-left]'),right:element.querySelector('[data-strap-right]'),
      x:0,y:0,vx:0,vy:0,angle:0,held:false,limits:null,
      // Different lengths and badge sizes carry slightly different weight.
      mass:clamp((badge.dimensions.width*badge.dimensions.height)/(160*198),.75,1.35),
      stiffness:62+index%4*5
    }];
  }));
  const active=new Set();
  let frame=0,lastFrame=0,previousPointer=null;

  function draw(body) {
    const {x,y,angle,badge}=body,end=badge.position.strap-9;
    const left=`M78 6Q${27+x*.44} ${48+y*.18} ${76+x} ${end+y}`;
    const right=`M82 6Q${133+x*.56} ${48+y*.18} ${84+x} ${end+y}`;
    body.pendant.style.transform=`translate3d(${x}px,${y}px,0) rotate(${angle}deg)`;
    body.ribbons.forEach(path=>path.setAttribute('d',left+right));
    body.left.setAttribute('d',left);body.right.setAttribute('d',right);
  }
  function rest(body) {
    body.x=body.y=body.vx=body.vy=body.angle=0;body.held=false;
    body.element.classList.remove('is-grabbed','is-moving');
    draw(body);active.delete(body);
  }
  function tick(time) {
    frame=0;
    if(!isAvailable()||reduced.matches){reset();return;}
    const dt=Math.min((time-(lastFrame||time-16.67))/1000,.032);lastFrame=time;
    for(const body of active){
      if(body.held)continue;
      // Small substeps keep integration stable after a busy browser frame.
      for(let n=0;n<3;n++){
        const h=dt/3,k=body.stiffness/body.mass,damping=12/body.mass;
        body.vx+=(-k*body.x-damping*body.vx)*h;
        body.vy+=(-k*body.y-damping*body.vy)*h;
        body.x+=body.vx*h;body.y+=body.vy*h;
      }
      if(body.limits){
        const {minX,maxX,minY,maxY}=body.limits;
        const x=clamp(body.x,minX,maxX),y=clamp(body.y,minY,maxY);
        if(x!==body.x)body.vx=0;if(y!==body.y)body.vy=0;
        body.x=x;body.y=y;
      }
      body.angle=clamp(body.x*.025+body.vx*.006,-9,9);
      if(Math.abs(body.x)+Math.abs(body.y)<.1&&Math.abs(body.vx)+Math.abs(body.vy)<.45)rest(body);
      else draw(body);
    }
    if([...active].some(body=>!body.held))frame=requestAnimationFrame(tick);
    else lastFrame=0;
  }
  function wake(body) {
    if(reduced.matches)return;
    active.add(body);body.element.classList.add('is-moving');
    if(!frame)frame=requestAnimationFrame(tick);
  }
  function reset() {
    if(frame)cancelAnimationFrame(frame);frame=0;lastFrame=0;previousPointer=null;
    bodies.forEach(rest);active.clear();
  }
  function dragStart(id) {
    const body=bodies.get(id);if(!body)return null;
    body.held=true;body.vx=body.vy=0;
    body.element.classList.add('is-grabbed');
    const scale=getScale()*.68;
    const rect=body.element.querySelector('.badge-face').getBoundingClientRect(),board=stage.getBoundingClientRect();
    const left=rect.left-body.x*scale,top=rect.top-body.y*scale;
    // Leave room for rotation and the sleeve's shadow. Keep rest within the bounds.
    body.limits={
      minX:Math.min(0,Math.max(-260,(board.left+16-left)/scale)),
      maxX:Math.max(0,Math.min(260,(board.right-16-left-rect.width)/scale)),
      minY:Math.min(0,Math.max(-body.badge.position.strap*.65,(board.top+20-top)/scale)),
      maxY:Math.max(0,Math.min(180,(board.bottom-20-top-rect.height)/scale))
    };
    const origin={x:body.x,y:body.y};
    let lastTime=performance.now(),lastX=body.x,lastY=body.y;
    return {
      move(dx,dy){
        const angle=body.badge.position.angle*Math.PI/180;
        const scale=getScale()*.68;
        const x=origin.x+(dx*Math.cos(angle)+dy*Math.sin(angle))/scale;
        const y=origin.y+(-dx*Math.sin(angle)+dy*Math.cos(angle))/scale;
        const now=performance.now(),dt=Math.max((now-lastTime)/1000,.008);
        body.x=clamp(x,body.limits.minX,body.limits.maxX);
        body.y=clamp(y,body.limits.minY,body.limits.maxY);
        body.vx=body.vx*.5+clamp((body.x-lastX)/dt,-600,600)*.5;
        body.vy=body.vy*.5+clamp((body.y-lastY)/dt,-600,600)*.5;
        body.angle=reduced.matches?0:clamp(body.x*.028+body.vx*.005,-9,9);
        lastTime=now;lastX=body.x;lastY=body.y;draw(body);
      },
      release(cancelled=false){
        body.held=false;body.element.classList.remove('is-grabbed');
        if(cancelled)body.vx=body.vy=0;
        if(reduced.matches)rest(body);else wake(body);
      }
    };
  }
  function proximity(e) {
    if(e.pointerType!=='mouse'||reduced.matches||!isAvailable())return;
    const point={x:e.clientX,y:e.clientY};
    if(!previousPointer){previousPointer=point;return;}
    const dx=clamp(point.x-previousPointer.x,-35,35);previousPointer=point;
    if(Math.abs(dx)<.5)return;
    const scale=getScale(),matrix=new DOMMatrixReadOnly(getComputedStyle(world).transform);
    const rect=stage.getBoundingClientRect();
    const px=(point.x-rect.left-matrix.e)/scale,py=(point.y-rect.top-matrix.f)/scale;
    for(const body of bodies.values()){
      if(body.held||body.element.inert)continue;
      const {position}=body.badge,hookX=position.x+80;
      const bottom=position.y+(position.strap+100)*.68;
      // A narrow wake around each ribbon; moving past one doesn't animate the whole collection.
      const distance=Math.hypot(px-hookX,py-clamp(py,position.y,bottom));
      const radius=48/Math.max(scale,.55);
      if(distance>radius)continue;
      body.limits=null;
      body.vx=clamp(body.vx+dx/scale*(1-distance/radius)*1.5,-85,85);
      body.vy=clamp(body.vy+Math.abs(dx)*.035,-12,12);
      wake(body);
    }
  }
  const onVisibility=()=>{if(document.hidden)reset();};
  document.addEventListener('visibilitychange',onVisibility);
  reduced.addEventListener('change',reset);
  return {dragStart,proximity,reset,
    clearProximity(){previousPointer=null;},
    destroy(){reset();document.removeEventListener('visibilitychange',onVisibility);reduced.removeEventListener('change',reset);}
  };
}
