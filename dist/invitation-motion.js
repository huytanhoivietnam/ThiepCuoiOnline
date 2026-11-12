'use strict';


function animateWeddingNames() {
  const heading = document.querySelector('.hero-names');
  heading.setAttribute('aria-label', heading.textContent.replace('&', ' & ').replace(/\s+/g, ' ').trim());
  let delay = 0;
  for (const node of [...heading.childNodes]) {
    if (node.nodeType !== Node.TEXT_NODE || !node.textContent.trim()) continue;
    const line = document.createElement('span');
    line.className = 'name-line';
    line.setAttribute('aria-hidden', 'true');
    for (const letter of [...node.textContent.trim().normalize('NFC')]) {
      const span = document.createElement('span');
      span.className = 'name-letter';
      span.textContent = letter === ' ' ? '\u00a0' : letter;
      span.style.setProperty('--letter-delay', delay + 'ms');
      delay += 55;
      line.append(span);
    }
    node.replaceWith(line);
  }
  heading.querySelector('.amp').setAttribute('aria-hidden', 'true');
}

function revealWeddingDetails() {
  if (!('IntersectionObserver' in window)) return;
  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.classList.add('motion-visible');
      observer.unobserve(entry.target);
    }
  }, {threshold: 0.12});
  const selectors = '.section h2, .families > div, .event-time, .event-date, .countdown, .calendar, .rsvp-section form, .thankyou > .script';
  document.querySelectorAll(selectors).forEach((element, index) => {
    element.classList.add('motion-detail');
    element.style.setProperty('--detail-delay', (index % 3) * 90 + 'ms');
    observer.observe(element);
  });
}

function startWeddingAlbum() {
  const main = document.querySelector('.album-main');
  const buttons = [...document.querySelectorAll('.album-grid [data-photo]')];
  const photos = buttons.map(button => ({
    src: button.dataset.photo,
    alt: button.querySelector('img').alt
  }));
  createWeddingSlideshow(main, photos);
  createWeddingSlideshow(
    document.querySelector('.interlude-photo'),
    Array.from({length: 8}, (_, index) => ({
      src: 'assets/album-' + (index + 1) + '.jpg',
      alt: 'Khoảnh khắc ' + (index + 1) + ' của Quang Huy và Ngọc Lan'
    })),
    {duration: 4500, showControls: false}
  );
}

async function createWeddingSlideshow(main, photos, {duration = 5200, showControls = true} = {}) {
  let stage = main.closest('.photo-slideshow');
  if (!stage) {
    stage = document.createElement('div');
    stage.className = 'album-stage';
    main.before(stage);
    stage.append(main);
  }
  let index = -1;
  let timer;
  let visible = false;
  let paused = false;
  let previous = null;
  const transitions = ['fade', 'circle', 'wipe', 'split', 'diagonal'];
  let transitionIndex = 0;

  const slides = [];
  const loadedPhotos = [];

  function schedule() {
    clearTimeout(timer);
    if (visible && !paused && !document.hidden && !document.querySelector('#photo-dialog').open) {
      timer = setTimeout(() => show(index + 1), duration);
    }
  }

  function show(number) {
    if (!slides.length) return;
    const next = (number + slides.length) % slides.length;
    if (index === next) {
      schedule();
      return;
    }
    if (previous) previous.className = 'album-slide';
    previous = slides[index];
    if (previous) {
      previous.className = 'album-slide is-previous';
      previous.setAttribute('aria-hidden', 'true');
    }
    index = next;
    const slide = slides[index];
    slide.className = 'album-slide';
    void slide.offsetWidth;
    slide.className = 'album-slide is-current album-' + transitions[transitionIndex++ % transitions.length];
    slide.setAttribute('aria-hidden', 'false');
    main.dataset.photo = loadedPhotos[index].src;
    main.setAttribute('aria-label', 'Phóng to ' + loadedPhotos[index].alt);
    schedule();
  }

  if (showControls) {
    const controls = document.createElement('div');
    controls.className = 'album-controls';
    controls.setAttribute('role', 'group');
    controls.setAttribute('aria-label', 'Điều khiển album ảnh');
    function control(label, symbol, action) {
      const button = document.createElement('button');
      button.type = 'button';
      button.setAttribute('aria-label', label);
      button.title = label;
      button.textContent = symbol;
      button.addEventListener('click', action);
      controls.append(button);
      return button;
    }
    control('Ảnh trước', '‹', () => show(index - 1));
    const play = control('Tạm dừng chuyển ảnh', 'Ⅱ', () => {
      paused = !paused;
      updatePlay();
      schedule();
    });
    control('Ảnh tiếp theo', '›', () => show(index + 1));
    function updatePlay() {
      const label = paused ? 'Tiếp tục chuyển ảnh' : 'Tạm dừng chuyển ảnh';
      play.textContent = paused ? '▶' : 'Ⅱ';
      play.setAttribute('aria-label', label);
      play.title = label;
      play.setAttribute('aria-pressed', String(!paused));
    }
    updatePlay();
    stage.append(controls);
  }
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      schedule();
    }, {threshold: 0.1});
    observer.observe(stage);
  } else {
    visible = true;
    schedule();
  }
  document.addEventListener('visibilitychange', schedule);
  document.querySelector('#photo-dialog').addEventListener('close', schedule);
  main.addEventListener('click', () => clearTimeout(timer));

  // Display the first successful image immediately and preload the rest in order.
  for (const photo of photos) {
    const image = await new Promise(resolve => {
      const img = new Image();
      img.alt = photo.alt;
      img.decoding = 'async';
      img.onload = () => resolve(img);
      img.onerror = () => resolve(null);
      img.src = photo.src;
    });
    if (!image) continue;
    const slide = document.createElement('span');
    slide.className = 'album-slide';
    slide.setAttribute('aria-hidden', 'true');
    slide.append(image);
    if (!slides.length) main.replaceChildren();
    main.append(slide);
    slides.push(slide);
    loadedPhotos.push(photo);
    if (index === -1) show(0);
  }
}

function startReadingProgress() {
  const progress = document.createElement('div');
  progress.className = 'reading-progress';
  progress.setAttribute('aria-hidden', 'true');
  document.body.append(progress);
  let frame = 0;
  function update() {
    const range = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = 'scaleX(' + (range > 0 ? Math.min(1, scrollY / range) : 0) + ')';
    frame = 0;
  }
  addEventListener('scroll', () => {
    if (!frame) frame = requestAnimationFrame(update);
  }, {passive: true});
  addEventListener('resize', update);
  update();
}

animateWeddingNames();
revealWeddingDetails();
startWeddingAlbum();
startReadingProgress();
