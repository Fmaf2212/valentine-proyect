const screen1 = document.getElementById("screen1");
const screen2 = document.getElementById("screen2");
const screen3 = document.getElementById("screen3");

// Cambiar pantalla con cualquier tecla o click
function showScreen(screenId){
  const screens = [screen1, screen2, screen3];
  for(let i=0;i<screens.length;i++){
    screens[i].classList.remove("active");
  }
  const target = document.getElementById(screenId);
  if(target){
    target.classList.add("active");
  }
}

function goToScreen2(){
  showScreen("screen2");
}

document.addEventListener("keydown",()=>{
  if(screen1.classList.contains("active")){
    goToScreen2();
  }
});

document.addEventListener("click",()=>{
  if(screen1.classList.contains("active")){
    goToScreen2();
  }
});

// Botones
const yesBtn = document.getElementById("yesBtn");
const noBtn = document.getElementById("noBtn");
const sparkles = document.getElementById("sparkles");
const collage = document.getElementById("photo-collage");
let lastTouchTime = 0;
let collageInterval = null;

// ===== BOTÓN NO HUYE =====
const buttons = noBtn.parentElement;
const card = buttons.parentElement;
const baseParentRect = card.getBoundingClientRect();
const baseBtnRect = noBtn.getBoundingClientRect();
const baseLeft = baseBtnRect.left - baseParentRect.left;
const baseTop = baseBtnRect.top - baseParentRect.top;

function moveNoButton(){
  const parentRect = card.getBoundingClientRect();
  const maxX = parentRect.width - noBtn.offsetWidth;
  const maxY = parentRect.height - noBtn.offsetHeight;

  const targetLeft = Math.random()*maxX;
  const targetTop = Math.random()*maxY;

  const dxMove = targetLeft - baseLeft;
  const dyMove = targetTop - baseTop;

  noBtn.style.transform = "translate(" + dxMove + "px," + dyMove + "px)";
  createSparkles();
}

card.addEventListener("mousemove",(event)=>{
  const btnRect = noBtn.getBoundingClientRect();

  const mouseX = event.clientX;
  const mouseY = event.clientY;
  const btnCenterX = btnRect.left + btnRect.width / 2;
  const btnCenterY = btnRect.top + btnRect.height / 2;

  const dx = mouseX - btnCenterX;
  const dy = mouseY - btnCenterY;
  const distance = Math.hypot(dx, dy);
  const triggerDistance = 120;

  if(distance < triggerDistance){
    moveNoButton();
  }
});

noBtn.addEventListener("click",(event)=>{
  event.preventDefault();
  moveNoButton();
});

// ===== CHISPITAS =====
function createSparkles(){
  const card = sparkles.parentElement;
  const cardRect = card.getBoundingClientRect();
  const btnRect = noBtn.getBoundingClientRect();
  const originX = btnRect.left - cardRect.left + btnRect.width / 2;
  const originY = btnRect.top - cardRect.top + btnRect.height / 2;

  for(let i=0;i<10;i++){
    const s = document.createElement("div");
    s.className = "spark";
    s.style.left = (originX + (Math.random()*30 - 15)) + "px";
    s.style.top = (originY + (Math.random()*30 - 15)) + "px";
    sparkles.appendChild(s);

    setTimeout(()=>s.remove(),600);
  }
}

// ===== BOTÓN SÍ =====
yesBtn.addEventListener("click",()=>{
  showScreen("screen3");
  startHearts();
  startCollage();
});

// ===== CORAZONES CAYENDO =====
function startHearts(){
  const container = document.getElementById("hearts-container");
  const emojis = ["💖","💘","🌀","🦖","🔥","🐭","🦊"];

  setInterval(()=>{
    const heart = document.createElement("div");
    heart.className = "heart";
    heart.innerHTML = emojis[Math.floor(Math.random()*emojis.length)];

    heart.style.left = Math.random()*100 + "vw";
    heart.style.animationDuration = (3 + Math.random()*4) + "s";

    container.appendChild(heart);

    setTimeout(()=>heart.remove(),7000);
  },300);
}

function startCollage(){
  if(collageInterval) return;
  const photos = [];
  for(let i=1;i<=15;i++){
    photos.push("images/foto" + i + ".jpg");
  }

  let queue = photos.slice();
  let showCount = 6;
  const collageRoot = collage.parentElement;
  const cardElement = collageRoot.querySelector(".card");
  const positions = [
    { x:2, y:10, r:-6 },
    { x:20, y:6, r:5 },
    { x:48, y:8, r:-4 },
    { x:80, y:8, r:7 },
    { x:4, y:34, r:6 },
    { x:22, y:36, r:-8 },
    { x:76, y:36, r:4 },
    { x:90, y:34, r:-5 },
    { x:4, y:66, r:-3 },
    { x:22, y:70, r:6 },
    { x:74, y:68, r:-7 },
    { x:90, y:70, r:5 }
  ];

  function shuffle(list){
    for(let i=list.length-1;i>0;i--){
      const j = Math.floor(Math.random()*(i+1));
      const temp = list[i];
      list[i] = list[j];
      list[j] = temp;
    }
  }

  function nextBatch(count){
    const batch = [];
    for(let i=0;i<count;i++){
      if(queue.length === 0){
        queue = photos.slice();
      }
      batch.push(queue.shift());
    }
    return batch;
  }

  function render(){
    collage.innerHTML = "";
    const posList = positions.slice();
    shuffle(posList);
    const batch = nextBatch(showCount);

    const rootRect = collageRoot.getBoundingClientRect();
    const cardRect = cardElement.getBoundingClientRect();
    const isMobile = rootRect.width <= 768;
    const cardPadding = isMobile ? 6 : 16;
    const frameWidth = isMobile ? 110 : 160;
    const frameHeight = isMobile ? 82 : 120;
    const blocked = {
      left: cardRect.left - rootRect.left - cardPadding,
      top: cardRect.top - rootRect.top - cardPadding,
      right: cardRect.right - rootRect.left + cardPadding,
      bottom: cardRect.bottom - rootRect.top + cardPadding
    };

    function overlapsCard(left, top, width, height){
      const right = left + width;
      const bottom = top + height;
      const noOverlap = right < blocked.left || left > blocked.right || bottom < blocked.top || top > blocked.bottom;
      return !noOverlap;
    }

    for(let i=0;i<batch.length;i++){
      const frame = document.createElement("div");
      frame.className = "photo-frame";

      let chosen = null;
      for(let p=0;p<posList.length;p++){
        const candidate = posList[p];
        const left = (candidate.x / 100) * rootRect.width;
        const top = (candidate.y / 100) * rootRect.height;
        if(!overlapsCard(left, top, frameWidth, frameHeight)){
          chosen = candidate;
          posList.splice(p, 1);
          break;
        }
      }

      if(!chosen && posList.length){
        chosen = posList.shift();
      }

      frame.style.left = chosen.x + "%";
      frame.style.top = chosen.y + "%";
      frame.style.setProperty("--rot", chosen.r + "deg");
      frame.style.transform = "rotate(" + chosen.r + "deg)";

      const img = document.createElement("img");
      img.src = batch[i];
      img.alt = "";

      frame.appendChild(img);
      collage.appendChild(frame);
    }

    showCount = showCount === 6 ? 4 : 6;
  }

  render();
  collageInterval = setInterval(render, 2200);
}

function createTapBurst(x, y){
  for(let i=0;i<6;i++){
    const heart = document.createElement("div");
    heart.className = "tap-heart";
    heart.innerHTML = "💖";
    heart.style.left = (x + (Math.random()*40 - 20)) + "px";
    heart.style.top = (y + (Math.random()*40 - 20)) + "px";
    heart.style.fontSize = (22 + Math.random()*10) + "px";
    screen3.appendChild(heart);
    setTimeout(()=>heart.remove(),700);
  }
}

screen3.addEventListener("click",(event)=>{
  if(!screen3.classList.contains("active")) return;
  if(Date.now() - lastTouchTime < 500) return;
  createTapBurst(event.clientX, event.clientY);
});

screen3.addEventListener("touchstart",(event)=>{
  if(!screen3.classList.contains("active")) return;
  const touch = event.touches[0];
  if(!touch) return;
  lastTouchTime = Date.now();
  createTapBurst(touch.clientX, touch.clientY);
},{ passive:false });
