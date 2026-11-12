'use strict';

function startWeddingEffects() {
  const canvas = document.querySelector('#wedding-effects');
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const colors = ['#c62a3a', '#e05561', '#a3132a', '#f08a94', '#d4ac55'];
  const leaves = ['#879062', '#929451', '#b09a58'];
  const shapes = ['petal', 'heart', 'petal', 'flower', 'petal', 'leaf'];
  const pick = list => list[Math.floor(Math.random() * list.length)];
  let width, height, previousTime;
  let animationFrame = 0;
  let particles = [];

  function resize() {
    width = canvas.clientWidth;
    height = canvas.clientHeight;
    const ratio = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(width * ratio);
    canvas.height = Math.round(height * ratio);
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0);
  }

  function particle(type, y, once = false) {
    const dust = type === 'sparkle';
    return {
      type, once, y, x: Math.random() * width,
      size: dust ? 1 + Math.random() * 2 : 8 + Math.random() * 9,
      vy: dust ? .2 + Math.random() * .4 : .8 + Math.random() * 1.4,
      vx: (Math.random() - .5) * .8,
      angle: Math.random() * 6, spin: (Math.random() - .5) * .05,
      phase: Math.random() * 6,
      color: dust ? '#f3dfa2' : pick(type === 'leaf' ? leaves : colors)
    };
  }

  function draw(p) {
    const size = p.size;
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.fillStyle = p.color;
    ctx.globalAlpha = .9;
    ctx.beginPath();
    switch (p.type) {
      case 'petal':
        ctx.rotate(p.angle);
        ctx.scale(1, Math.abs(Math.sin(p.phase)) * .6 + .4);
        ctx.moveTo(0, -size);
        ctx.bezierCurveTo(size, -size, size * .8, size * .6, 0, size);
        ctx.bezierCurveTo(-size * .8, size * .6, -size, -size, 0, -size);
        ctx.fill();
        break;
      case 'heart':
        ctx.rotate(Math.sin(p.phase) * .5);
        ctx.scale(size / 10, size / 10);
        ctx.globalAlpha = .85;
        ctx.moveTo(0, 3);
        ctx.bezierCurveTo(-10, -5, -5, -12, 0, -6);
        ctx.bezierCurveTo(5, -12, 10, -5, 0, 3);
        ctx.fill();
        break;
      case 'flower':
        ctx.rotate(p.angle);
        ctx.scale(size * .45, size * .45);
        for (let i = 0; i < 5; i++) {
          ctx.rotate(2 * Math.PI / 5);
          ctx.beginPath();
          ctx.ellipse(0, -1, .6, 1, 0, 0, 2 * Math.PI);
          ctx.fill();
        }
        ctx.fillStyle = '#f3dfa2';
        ctx.beginPath();
        ctx.arc(0, 0, .45, 0, 2 * Math.PI);
        ctx.fill();
        break;
      case 'leaf':
        ctx.rotate(p.angle);
        ctx.scale(size, size);
        ctx.moveTo(0, -1);
        ctx.quadraticCurveTo(1, -.2, 0, 1);
        ctx.quadraticCurveTo(-.7, .1, 0, -1);
        ctx.fill();
        ctx.strokeStyle = '#e2d4a3';
        ctx.lineWidth = .07;
        ctx.beginPath();
        ctx.moveTo(0, -.8);
        ctx.quadraticCurveTo(.19, -.1, 0, .85);
        ctx.stroke();
        break;
      case 'sparkle':
        ctx.globalAlpha = .4 + .6 * Math.abs(Math.sin(p.phase));
        ctx.arc(0, 0, size, 0, 2 * Math.PI);
        ctx.fill();
        ctx.globalAlpha *= .25;
        ctx.beginPath();
        ctx.arc(0, 0, size * 3, 0, 2 * Math.PI);
        ctx.fill();
        break;
    }
    ctx.restore();
  }

  function seed() {
    particles = [];
    const count = 16;
    for (let i = 0; i < count; i++) {
      particles.push(particle(shapes[i % shapes.length], Math.random() * height));
    }
    for (let i = 0; i < 18; i++) {
      particles.push(particle('sparkle', Math.random() * height));
    }
  }

  function frame(time) {
    animationFrame = 0;
    if (document.hidden) return;
    const step = Math.min((time - (previousTime ?? time)) / (1000 / 60), 2);
    previousTime = time;
    ctx.clearRect(0, 0, width, height);
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.y += p.vy * step;
      p.x += (p.vx + Math.sin(p.phase) * .5) * step;
      p.angle += p.spin * step;
      p.phase += .03 * step;
      if (p.x < -25) p.x = width + 24;
      if (p.x > width + 25) p.x = -24;
      if (p.y > height + 30) {
        if (p.once) particles.splice(i, 1);
        else particles[i] = particle(p.type, -30);
      } else {
        draw(p);
      }
    }
    animationFrame = requestAnimationFrame(frame);
  }

  function resume() {
    if (animationFrame || document.hidden) return;
    previousTime = undefined;
    animationFrame = requestAnimationFrame(frame);
  }

  resize();
  seed();
  window.addEventListener('resize', resize);
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(animationFrame);
      animationFrame = 0;
    } else {
      resume();
    }
  });
  document.querySelector('#open-invitation').addEventListener('click', () => {
    particles = particles.filter(p => !p.once);
    for (let i = 0; i < 40; i++) {
      particles.push(particle(pick(shapes), -30 - Math.random() * height * .6, true));
    }
  });
  resume();
}

startWeddingEffects();

document.querySelector('#invitation').addEventListener('click', event => {
  if (!event.detail || event.target.closest('a, button, input, label, select, textarea, form, iframe')) return;
  const colors = ['#e8414b', '#d4ac55', '#f3dfa2', '#c2185b'];
  for (let i = 0; i < 7; i++) {
    const heart = document.createElement('span');
    heart.className = 'touch-heart';
    heart.setAttribute('aria-hidden', 'true');
    heart.textContent = '♥';
    const angle = Math.random() * Math.PI * 2;
    const distance = 40 + Math.random() * 90;
    heart.style.left = event.clientX + 'px';
    heart.style.top = event.clientY + 'px';
    heart.style.fontSize = (10 + Math.random() * 12) + 'px';
    heart.style.color = colors[i % colors.length];
    document.body.append(heart);
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance - 30;
    const end = 'translate(' + dx + 'px,' + dy + 'px) rotate(' + Math.random() * 360 + 'deg) scale(.4)';
    const animation = heart.animate([{opacity: 1}, {opacity: 0, transform: end}], {duration: 950, easing: 'ease-out'});
    animation.onfinish = () => heart.remove();
  }
});
