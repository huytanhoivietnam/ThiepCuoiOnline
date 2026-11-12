'use strict';
const $ = (selector) => document.querySelector(selector);
const cover = $('#cover');
const invitation = $('#invitation');
const nav = $('.bottom-nav');
const musicButton = $('#music-button');
const musicPlayer = $('#music-player');
const weddingSong = $('#wedding-song');
weddingSong.volume = 0.5;

document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', event => {
    const target = document.getElementById(link.getAttribute('href').slice(1));
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({behavior: 'smooth', block: 'start'});
    history.replaceState(null, '', link.getAttribute('href'));
  });
});
function startInvitationScroll(delay) {
  const listeners = new AbortController();
  const options = {capture: true, passive: true, signal: listeners.signal};
  let frame = 0;
  let timer = 0;

  function stop() {
    clearTimeout(timer);
    cancelAnimationFrame(frame);
    listeners.abort();
  }

  for (const event of ['wheel', 'pointerdown', 'touchstart', 'keydown', 'pagehide']) {
    window.addEventListener(event, stop, options);
  }
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) stop();
  }, options);

  timer = setTimeout(() => {
    let lastTime = performance.now();
    let position = window.scrollY;
    function advance(time) {
      const bottom = document.documentElement.scrollHeight - window.innerHeight;
      const elapsed = Math.min(64, time - lastTime);
      position = Math.min(bottom, position + elapsed * 0.026);
      window.scrollTo({top: position, behavior: 'instant'});
      lastTime = time;
      if (position >= bottom) stop();
      else frame = requestAnimationFrame(advance);
    }
    frame = requestAnimationFrame(advance);
  }, delay);
}

let opening = false;
$('#open-invitation').addEventListener('click', () => {
  if (opening) return;
  opening = true;
  window.scrollTo({top: 0, behavior: 'instant'});
  startInvitationScroll(1800);
  $('#open-invitation').disabled = true;
  cover.classList.add('opening');
  invitation.inert = false;
  nav.hidden = false;
  musicPlayer.hidden = false;
  playWeddingSong();
  setTimeout(() => {
    cover.classList.add('opened');
    cover.inert = true;
    document.body.classList.remove('closed');
    $('.scroll-hint').focus({preventScroll: true});
  }, 650);
});
$('#reopen').addEventListener('click', () => {
  scrollTo({top: 0, behavior: 'instant'});
  cover.inert = false;
  cover.classList.remove('opened', 'opening');
  document.body.classList.add('closed');
  invitation.inert = true;
  nav.hidden = true;
  musicPlayer.hidden = true;
  weddingSong.pause();
  opening = false;
  $('#open-invitation').disabled = false;
  $('#open-invitation').focus({preventScroll: true});
});

const personalizedGuest = new URL(location.href).searchParams.get('khach');
if (personalizedGuest?.trim()) {
  document.querySelectorAll('[data-guest]').forEach(el => el.textContent = personalizedGuest.trim().slice(0, 100));
}

const eventDate = new Date('2026-11-29T10:00:00+07:00');
function updateCountdown() {
  const seconds = Math.max(0, Math.floor((eventDate.getTime() - Date.now()) / 1000));
  const values = [Math.floor(seconds/86400), Math.floor(seconds/3600)%24, Math.floor(seconds/60)%60, seconds%60];
  ['days','hours','minutes','seconds'].forEach((id,index) => {
    const element = $('#'+id);
    const value = String(values[index]).padStart(2,'0');
    if (element.textContent === value) return;
    element.textContent = value;
    element.animate([
        {opacity: .35, transform: 'translateY(-5px)'},
        {opacity: 1, transform: 'translateY(0)'}
    ], {duration: 350, easing: 'ease-out'});
  });
}
updateCountdown(); setInterval(updateCountdown, 1000);
const calendar = $('#calendar');
['T2','T3','T4','T5','T6','T7','CN'].forEach(day => {
  const el = document.createElement('span'); el.className = 'weekday'; el.textContent = day; calendar.append(el);
});
const offset = (new Date(2026,10,1).getDay()+6)%7;
for(let i=0;i<offset;i++) calendar.append(document.createElement('span'));
for(let day=1;day<=30;day++) {
  const el = document.createElement('span'); el.textContent = day;
  if(day===29) {el.className='wedding-day';el.setAttribute('aria-label','Ngày cưới: Chủ nhật 29 tháng 11 năm 2026');}
  calendar.append(el);
}
const form = $('#rsvp-form');
function updateAttendance() {
  const attending = form.elements.attendance.value==='yes';
  $('#count-field').hidden = !attending;
  $('#guest-count').disabled = !attending;
}
form.elements.attendance.forEach(el => el.addEventListener('change', updateAttendance));
try {
  const saved = JSON.parse(localStorage.getItem('quang-huy-ngoc-lan-rsvp-preview')||'null');
  if(saved && typeof saved.name==='string') {
    form.elements.name.value = saved.name;
    form.elements.attendance.value = saved.attendance === 'no' ? 'no' : 'yes';
    form.elements.count.value = String(saved.count || 1);
    form.elements.wish.value = typeof saved.wish === 'string' ? saved.wish : '';
    updateAttendance();
  }
} catch { /* The form remains usable when browser storage is unavailable. */ }
form.addEventListener('submit', (event) => {
  event.preventDefault();
  const name = form.elements.name.value.trim();
  if (!name) {form.elements.name.setCustomValidity('Bạn nhập tên giúp chúng mình nhé.');form.elements.name.reportValidity();return;}
  const data = {name,attendance:form.elements.attendance.value,count:form.elements.attendance.value==='yes'?Number(form.elements.count.value):0,wish:form.elements.wish.value.trim()};
  try {
    localStorage.setItem('quang-huy-ngoc-lan-rsvp-preview',JSON.stringify(data));
    $('#form-feedback').textContent = `Cảm ơn ${name}! Hồi đáp mẫu đã được lưu trên thiết bị của bạn, chưa gửi đến cô dâu chú rể.`;
  } catch {
    $('#form-feedback').textContent = `Cảm ơn ${name}! Bạn đã xem thử phần hồi đáp. Trình duyệt hiện không cho phép lưu trên thiết bị.`;
  }
});
form.elements.name.addEventListener('input',()=>form.elements.name.setCustomValidity(''));

document.querySelectorAll('[data-photo]').forEach(button => button.addEventListener('click',()=>{
  $('#full-photo').src = button.dataset.photo;
  const image = button.querySelector('.album-slide.is-current img') || button.querySelector('img');
  $('#full-photo').alt = image.alt;
  $('#photo-dialog').showModal();
}));
document.querySelectorAll('dialog').forEach(dialog => {
  dialog.querySelector('[data-close]').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close();}});
});

function updateMusicButton() {
  const playing = !weddingSong.paused && !weddingSong.error;
  musicButton.setAttribute('aria-pressed', String(playing));
  musicButton.setAttribute('aria-label', playing ? 'Tạm dừng nhạc nền' : 'Phát nhạc nền');
  musicButton.classList.toggle('playing', playing);
  musicPlayer.classList.toggle('is-playing', playing);
}

function playWeddingSong() {
  weddingSong.play().catch(updateMusicButton);
}

weddingSong.addEventListener('play', updateMusicButton);
weddingSong.addEventListener('pause', updateMusicButton);
weddingSong.addEventListener('error', updateMusicButton);
musicButton.addEventListener('click', () => {
  if (weddingSong.paused) {
    playWeddingSong();
  } else {
    weddingSong.pause();
  }
});

if('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries=>entries.forEach(entry=>{
    if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target);}
  }),{threshold:.08});
  document.querySelectorAll('.section').forEach(section=>{section.classList.add('reveal');observer.observe(section);});
  document.querySelectorAll('.photo-interlude, .full-names, .wedding-day, .thin-rule')
    .forEach(detail => observer.observe(detail));
}
