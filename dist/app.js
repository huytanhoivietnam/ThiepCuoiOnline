'use strict';
const $ = (selector) => document.querySelector(selector);
const cover = $('#cover');
const invitation = $('#invitation');
const nav = $('.bottom-nav');
const musicButton = $('#music-button');
const weddingSong = $('#wedding-song');
weddingSong.volume = 0.5;

// Offset each flight so the two margins have petals at different heights.
const shower = $('.petal-shower');
for (let i = 0; i < 12; i++) {
  const petal = document.createElement('span');
  const right = i % 2 === 1;
  const duration = 13 + (i * 3) % 8;
  petal.className = i % 4 < 2 ? 'petal rose' : 'petal peach';
  petal.style.setProperty('--lane', (1 + (i * 3) % 10) + '%');
  petal.style.setProperty('--size', (12 + (i * 5) % 13) + 'px');
  petal.style.setProperty('--drift', ((right ? -1 : 1) * (6 + i % 13)) + 'px');
  petal.style.setProperty('--fall', duration + 's');
  petal.style.setProperty('--turn', (4.3 + (i % 4) * 0.7) + 's');
  petal.style.setProperty('--delay', (-duration * ((i * 5 + 1) % 12) / 12) + 's');
  shower.append(petal);
}

document.querySelectorAll('a[href^="#"]').forEach(link => {
  link.addEventListener('click', event => {
    const target = document.getElementById(link.getAttribute('href').slice(1));
    if (!target) return;
    event.preventDefault();
    target.scrollIntoView({behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth', block: 'start'});
    history.replaceState(null, '', link.getAttribute('href'));
  });
});
let opening = false;
$('#open-invitation').addEventListener('click', () => {
  if (opening) return;
  opening = true;
  $('#open-invitation').disabled = true;
  cover.classList.add('opening');
  invitation.inert = false;
  nav.hidden = false;
  musicButton.hidden = false;
  playWeddingSong();
  setTimeout(() => {
    cover.classList.add('opened');
    cover.inert = true;
    document.body.classList.remove('closed');
    $('.scroll-hint').focus({preventScroll: true});
  }, matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 650);
});
$('#reopen').addEventListener('click', () => {
  scrollTo({top: 0, behavior: 'instant'});
  cover.inert = false;
  cover.classList.remove('opened', 'opening');
  document.body.classList.add('closed');
  invitation.inert = true;
  nav.hidden = true;
  musicButton.hidden = true;
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
  ['days','hours','minutes','seconds'].forEach((id,index) => $('#'+id).textContent = String(values[index]).padStart(2,'0'));
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
  $('#full-photo').alt = button.querySelector('img').alt;
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
  musicButton.textContent = playing ? 'Ⅱ' : '♫';
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
