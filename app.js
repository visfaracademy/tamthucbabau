/* ==========================================================================
   TÂM THỨC BẦU – KIẾN TẠO THAI KỲ AN VUI
   Interactive Sales Page Logic & Micro-Interactions
   ========================================================================== */

// 🔗 CẤU HÌNH LIÊN KẾT GOOGLE SHEET:
// Dán đường link URL Ứng dụng web (Apps Script) của bạn vào giữa 2 dấu ngoặc kép "" dưới đây:
const CONFIG_GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyEUiQ9ASGw-pbFyBKkfh61ZiAkqEdNhtYCiVtFWycH755He2Bsm-Fz-7x6bwO8N8GC/exec";

document.addEventListener('DOMContentLoaded', () => {

  // 1) DYNAMIC COUNTDOWN TIMER
  // Sets countdown to 23:59:59 of current day or next 24h
  function initCountdown() {
    const topTimerDisplay = document.getElementById('top-timer-display');
    const cdHours = document.getElementById('cd-hours');
    const cdMinutes = document.getElementById('cd-minutes');
    const cdSeconds = document.getElementById('cd-seconds');

    // Target: Midnight tonight (23:59:59)
    function getTimeRemaining() {
      const now = new Date();
      const endOfDay = new Date();
      endOfDay.setHours(23, 59, 59, 999);
      
      let diff = endOfDay - now;
      if (diff <= 0) {
        // Reset to next day
        diff = 24 * 60 * 60 * 1000;
      }

      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / 1000 / 60) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      return {
        hours: String(hours).padStart(2, '0'),
        minutes: String(minutes).padStart(2, '0'),
        seconds: String(seconds).padStart(2, '0')
      };
    }

    function updateDisplay() {
      const t = getTimeRemaining();
      if (topTimerDisplay) {
        topTimerDisplay.textContent = `${t.hours}:${t.minutes}:${t.seconds}`;
      }
      if (cdHours && cdMinutes && cdSeconds) {
        cdHours.textContent = t.hours;
        cdMinutes.textContent = t.minutes;
        cdSeconds.textContent = t.seconds;
      }
    }

    updateDisplay();
    setInterval(updateDisplay, 1000);
  }
  initCountdown();

  // 2) FAQ ACCORDION INTERACTION
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const btn = item.querySelector('.faq-question');
    btn.addEventListener('click', () => {
      const isOpen = item.classList.contains('active');
      
      // Close all other items
      faqItems.forEach(otherItem => {
        if (otherItem !== item) {
          otherItem.classList.remove('active');
          otherItem.querySelector('.faq-question').setAttribute('aria-expanded', 'false');
        }
      });

      // Toggle current
      if (!isOpen) {
        item.classList.add('active');
        btn.setAttribute('aria-expanded', 'true');
      } else {
        item.classList.remove('active');
        btn.setAttribute('aria-expanded', 'false');
      }
    });
  });

  // 3) PLAN TYPE RADIO SELECTION HIGHLIGHT
  const radioCards = document.querySelectorAll('.radio-plan-card');
  radioCards.forEach(card => {
    const radio = card.querySelector('input[type="radio"]');
    card.addEventListener('click', () => {
      radioCards.forEach(c => c.classList.remove('selected'));
      card.classList.add('selected');
      radio.checked = true;
    });
  });

  // 4) REGISTRATION FORM VALIDATION & CONFETTI CELEBRATION
  const regForm = document.getElementById('registration-form');
  const successBox = document.getElementById('registration-success');
  const successName = document.getElementById('success-user-name');

  if (regForm) {
    regForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const fullName = document.getElementById('fullName');
      const phone = document.getElementById('phone');
      const email = document.getElementById('email');

      let isValid = true;

      // Reset errors
      document.querySelectorAll('.error-msg').forEach(el => el.textContent = '');

      if (!fullName.value.trim()) {
        document.getElementById('fullName-error').textContent = 'Vui lòng nhập họ và tên của mẹ';
        fullName.focus();
        isValid = false;
      }

      const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
      if (!phone.value.trim()) {
        document.getElementById('phone-error').textContent = 'Vui lòng nhập số điện thoại hoặc Zalo';
        if (isValid) phone.focus();
        isValid = false;
      } else if (!phoneRegex.test(phone.value.replace(/\s+/g, ''))) {
        document.getElementById('phone-error').textContent = 'Số điện thoại chưa đúng định dạng Việt Nam';
        if (isValid) phone.focus();
        isValid = false;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!email.value.trim()) {
        document.getElementById('email-error').textContent = 'Vui lòng nhập email nhận Ebook quà tặng';
        if (isValid) email.focus();
        isValid = false;
      } else if (!emailRegex.test(email.value.trim())) {
        document.getElementById('email-error').textContent = 'Địa chỉ email chưa hợp lệ';
        if (isValid) email.focus();
        isValid = false;
      }

      if (isValid) {
        // Change submit button state
        const submitBtn = document.getElementById('btn-submit');
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang lưu đăng ký vào hệ thống...';

        // Lấy thông tin các trường bổ sung
        const pregnancyWeekEl = document.getElementById('pregnancyWeek');
        const pregnancyWeekText = pregnancyWeekEl ? pregnancyWeekEl.options[pregnancyWeekEl.selectedIndex].text : '';
        const selectedPlanEl = document.querySelector('input[name="planType"]:checked');
        const planText = selectedPlanEl && selectedPlanEl.value === 'tron-goi' 
          ? 'Gói Cam Kết Trọn Vẹn: 499.000đ' 
          : 'Gieo Hạt Tùy Tâm';
        const notesEl = document.getElementById('notes');
        const notesVal = notesEl ? notesEl.value.trim() : '';

        // Dữ liệu đăng ký
        const registrationData = {
          timestamp: new Date().toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' }),
          fullName: fullName.value.trim(),
          phone: phone.value.trim(),
          email: email.value.trim(),
          pregnancyWeek: pregnancyWeekText,
          planType: planText,
          notes: notesVal,
          source: 'Landing Page Tâm Thức Bầu'
        };

        // 1) Lưu dự phòng ngay vào LocalStorage của trình duyệt
        try {
          const currentLeads = JSON.parse(localStorage.getItem('tam_thuc_bau_leads') || '[]');
          currentLeads.push(registrationData);
          localStorage.setItem('tam_thuc_bau_leads', JSON.stringify(currentLeads));
        } catch (e) {
          console.warn('LocalStorage error:', e);
        }

        // 2) Gửi dữ liệu về Google Sheet & Máy chủ nội bộ
        const scriptUrl = CONFIG_GOOGLE_SCRIPT_URL || window.GOOGLE_SCRIPT_WEBAPP_URL || '';
        const ZALO_GROUP_URL = 'https://zalo.me/g/gglowf639';

        const promises = [];

        // Gửi đến Google Apps Script (nếu đã cấu hình URL)
        if (scriptUrl) {
          promises.push(
            fetch(scriptUrl, {
              method: 'POST',
              mode: 'no-cors',
              cache: 'no-cache',
              keepalive: true,
              headers: { 'Content-Type': 'text/plain;charset=utf-8' },
              body: JSON.stringify(registrationData)
            }).then(() => {
              console.log('✅ Đã gửi dữ liệu thành công đến Google Sheet!');
            }).catch(err => {
              console.error('❌ Lỗi gửi Google Sheet:', err);
            })
          );
        }

        // Gửi đến endpoint lưu file CSV nội bộ (nếu server đang chạy)
        promises.push(
          fetch('/api/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(registrationData)
          }).catch(err => console.log('Local server log err:', err))
        );

        // Đợi gửi xong hoặc tối đa 2.5 giây
        Promise.race([
          Promise.allSettled(promises),
          new Promise(resolve => setTimeout(resolve, 2500))
        ]).then(() => {
          // Ẩn form, hiển thị thông báo thành công
          regForm.style.display = 'none';
          successBox.style.display = 'block';
          successName.textContent = fullName.value.trim();

          // Cuộn mượt đến khung thành công
          successBox.scrollIntoView({ behavior: 'smooth', block: 'center' });

          // Kích hoạt pháo hoa chúc mừng
          launchConfetti();

          // Tự động mở nhóm Zalo sau 2.5 giây
          setTimeout(() => {
            window.open(ZALO_GROUP_URL, '_blank');
          }, 2500);
        });
      }
    });
  }

  // 5) CONFETTI EFFECT
  function launchConfetti() {
    const canvas = document.getElementById('confetti-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const pieces = [];
    const colors = ['#C25E48', '#52796F', '#D4A373', '#F4A261', '#E76F51', '#2A9D8F'];

    for (let i = 0; i < 120; i++) {
      pieces.push({
        x: canvas.width * 0.5,
        y: canvas.height * 0.4,
        w: Math.random() * 10 + 6,
        h: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        vx: (Math.random() - 0.5) * 16,
        vy: (Math.random() - 0.8) * 16,
        gravity: 0.35,
        rotation: Math.random() * 360,
        rotationSpeed: (Math.random() - 0.5) * 12,
        opacity: 1
      });
    }

    let animationFrame;
    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let activePieces = 0;

      pieces.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += p.gravity;
        p.rotation += p.rotationSpeed;
        p.opacity -= 0.007;

        if (p.opacity > 0) {
          activePieces++;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.globalAlpha = Math.max(0, p.opacity);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
          ctx.restore();
        }
      });

      if (activePieces > 0) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        cancelAnimationFrame(animationFrame);
      }
    }
    animate();
  }

  // 6) VIDEO / TEASER MODAL & AUDIO PREVIEW
  const playTeaserBtn = document.getElementById('btn-play-teaser');
  const videoModal = document.getElementById('video-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalBackdrop = document.getElementById('modal-backdrop');

  if (playTeaserBtn && videoModal) {
    playTeaserBtn.addEventListener('click', () => {
      videoModal.style.display = 'flex';
    });

    const closeModal = () => {
      videoModal.style.display = 'none';
      stopAudioPreview();
    };

    if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeModal);
    if (modalBackdrop) modalBackdrop.addEventListener('click', closeModal);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && videoModal.style.display === 'flex') {
        closeModal();
      }
    });
  }

  // Synthetic Gentle Singing Bowl Sound (Web Audio API) for 432Hz ambient relaxation demo
  let audioCtx = null;
  let isPlayingAudio = false;
  let audioTimer = null;
  const audioToggleBtn = document.getElementById('audio-toggle-btn');
  const fakeAudioBar = document.querySelector('.fake-audio-bar');

  function playTone(freq, time, duration, gainVal = 0.08) {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, time);

    gain.gain.setValueAtTime(gainVal, time);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + duration);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(time);
    osc.stop(time + duration);
  }

  function startAudioPreview() {
    isPlayingAudio = true;
    if (audioToggleBtn) audioToggleBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
    if (fakeAudioBar) fakeAudioBar.classList.add('playing');

    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    // Play peaceful 432Hz harmonic chimes sequence
    const now = audioCtx.currentTime;
    playTone(432, now, 3.5, 0.1);
    playTone(540, now + 1.2, 3.0, 0.08);
    playTone(648, now + 2.4, 3.5, 0.07);

    audioTimer = setInterval(() => {
      if (!isPlayingAudio) return;
      const t = audioCtx.currentTime;
      playTone(432, t, 4.0, 0.09);
      playTone(540, t + 1.4, 3.5, 0.07);
    }, 4000);
  }

  function stopAudioPreview() {
    isPlayingAudio = false;
    if (audioToggleBtn) audioToggleBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
    if (fakeAudioBar) fakeAudioBar.classList.remove('playing');
    if (audioTimer) clearInterval(audioTimer);
  }

  if (audioToggleBtn) {
    audioToggleBtn.addEventListener('click', () => {
      if (isPlayingAudio) {
        stopAudioPreview();
      } else {
        startAudioPreview();
      }
    });
  }

  // 7) MOBILE STICKY BAR VISIBILITY
  const mobileBar = document.getElementById('mobile-sticky-bar');
  if (mobileBar) {
    window.addEventListener('scroll', () => {
      // Show only after scrolling past hero section
      const hero = document.getElementById('hero');
      if (hero) {
        const heroBottom = hero.getBoundingClientRect().bottom;
        if (heroBottom < 0) {
          mobileBar.style.display = 'block';
        } else {
          mobileBar.style.display = 'none';
        }
      }
    });
  }

});
