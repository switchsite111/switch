document.addEventListener('DOMContentLoaded', () => {
  // --- Authentic Nintendo Switch MP3 & Visual Snap System ---
  const switchAudio = new Audio('audio/switch-click.mp3');
  switchAudio.volume = 0.85;

  function playNintendoSwitchSnapSound() {
    try {
      switchAudio.currentTime = 0;
      const playPromise = switchAudio.play();
      if (playPromise !== undefined) {
        playPromise.catch(err => console.warn('Audio play prevented:', err));
      }
    } catch (err) {
      console.warn('Nintendo Switch audio snap error:', err);
    }

    // Trigger Joy-Con visual snap on logo
    triggerSwitchJoyConSnapAnimation();
  }

  function triggerSwitchJoyConSnapAnimation() {
    const logoIcon = document.querySelector('.switch-joycon-icon');
    if (logoIcon) {
      logoIcon.classList.remove('snap-anim');
      void logoIcon.offsetWidth; // Force reflow
      logoIcon.classList.add('snap-anim');
    }
  }

  // Attach Nintendo Switch snap sound & animation to buttons & logo
  document.querySelectorAll('.btn-primary, .btn-secondary, #calc-apply-btn, #form-submit-btn, #header-switch-logo').forEach(btn => {
    btn.addEventListener('click', () => {
      playNintendoSwitchSnapSound();
    });
  });

  // 1. Subtle Cursor Light Follower
  const cursorGlow = document.createElement('div');
  cursorGlow.className = 'cursor-glow';
  document.body.appendChild(cursorGlow);

  window.addEventListener('mousemove', (e) => {
    cursorGlow.style.left = `${e.clientX}px`;
    cursorGlow.style.top = `${e.clientY}px`;
  });

  // 1.5 Aligned Dot Grid Matrix (Antigravity.google Dot Grid)
  const bgCanvas = document.createElement('canvas');
  bgCanvas.id = 'bg-particles-canvas';
  document.body.prepend(bgCanvas);
  const ctx = bgCanvas.getContext('2d');

  let width = bgCanvas.width = window.innerWidth;
  let height = bgCanvas.height = window.innerHeight;

  window.addEventListener('resize', () => {
    width = bgCanvas.width = window.innerWidth;
    height = bgCanvas.height = window.innerHeight;
  });

  const mouse = { x: -1000, y: -1000, radius: 160 };

  window.addEventListener('mousemove', (e) => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  });

  window.addEventListener('mouseleave', () => {
    mouse.x = -1000;
    mouse.y = -1000;
  });

  const gridSpacing = 44; // Distance between dots in aligned rows & columns

  function animateDotGrid() {
    ctx.clearRect(0, 0, width, height);
    const isLight = document.body.classList.contains('light-theme');
    const pColor = isLight ? '0, 0, 0' : '255, 255, 255';
    const baseAlpha = isLight ? 0.05 : 0.15;

    for (let x = gridSpacing / 2; x < width; x += gridSpacing) {
      for (let y = gridSpacing / 2; y < height; y += gridSpacing) {
        // Calculate subtle interactive glow around cursor
        const dx = x - mouse.x;
        const dy = y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        let alpha = baseAlpha;
        let radius = isLight ? 1.1 : 1.25;

        if (dist < mouse.radius) {
          const factor = (1 - dist / mouse.radius);
          alpha += factor * (isLight ? 0.12 : 0.35);
          radius += factor * 1.2;
        }

        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${pColor}, ${alpha})`;
        ctx.fill();
      }
    }
    requestAnimationFrame(animateDotGrid);
  }
  animateDotGrid();

  // Theme Switcher (Dark / Light) with SVG Sun/Moon Icons & Persistence
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const moonIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
  const sunIcon = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;

  // Restore saved theme preference
  const savedTheme = localStorage.getItem('switch_theme');
  if (savedTheme === 'light') {
    document.body.classList.add('light-theme');
    document.documentElement.classList.add('light-theme');
    if (themeToggleBtn) themeToggleBtn.innerHTML = sunIcon;
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      document.body.classList.toggle('light-theme');
      document.documentElement.classList.toggle('light-theme');
      const isLight = document.body.classList.contains('light-theme');
      localStorage.setItem('switch_theme', isLight ? 'light' : 'dark');
      themeToggleBtn.innerHTML = isLight ? sunIcon : moonIcon;
    });
  }

  // Language Switcher (RU / EN)
  const langToggleBtn = document.getElementById('lang-toggle-btn');
  window.currentLang = 'ru';

  if (langToggleBtn) {
    langToggleBtn.addEventListener('click', () => {
      window.currentLang = window.currentLang === 'ru' ? 'en' : 'ru';
      langToggleBtn.textContent = window.currentLang === 'ru' ? 'RU | EN' : 'EN | RU';
      applyLanguage(window.currentLang);
    });
  }

  function applyLanguage(lang) {
    document.querySelectorAll('[data-ru]').forEach(el => {
      const text = el.getAttribute(`data-${lang}`);
      if (text) {
        if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
          el.placeholder = text;
        } else {
          el.innerHTML = text;
        }
      }
    });
  }

  // 2. Header Scroll Effect
  const header = document.querySelector('.header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // 3. Navigation Links Active Highlight & ScrollSpy Observer
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');
  const mobileToggle = document.querySelector('.mobile-toggle');
  const navMenu = document.querySelector('.nav-menu');

  function updateActiveNavLink(activeId) {
    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (href === `#${activeId}`) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  }

  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        const targetId = href.substring(1);
        updateActiveNavLink(targetId);
      }
      if (navMenu) navMenu.classList.remove('open');
    });
  });

  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        updateActiveNavLink(entry.target.id);
      }
    });
  }, { threshold: 0.35 });

  sections.forEach(sec => sectionObserver.observe(sec));

  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      navMenu.classList.toggle('open');
      mobileToggle.setAttribute('aria-expanded', navMenu.classList.contains('open'));
    });
  }

  // 4. Enhanced Scroll Reveal & Typewriter Observer
  const revealElements = document.querySelectorAll('.reveal, .reveal-fade-up, .reveal-slide-left, .reveal-slide-right, .reveal-scale, .reveal-flip');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      }
    });
  }, { threshold: 0.12 });

  revealElements.forEach(el => revealObserver.observe(el));

  // 4.5 Typewriter Effect on Scroll (Antigravity Blinking Cursor with Multi-Language)
  const typewriterElements = document.querySelectorAll('.typewriter-text');
  const typeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !entry.target.classList.contains('typed-done')) {
        entry.target.classList.add('typed-done');
        startTypewriter(entry.target);
      }
    });
  }, { threshold: 0.2 });

  typewriterElements.forEach(el => typeObserver.observe(el));

  function startTypewriter(element) {
    const lang = window.currentLang || 'ru';
    const targetHTML = element.getAttribute(`data-${lang}`) || element.getAttribute('data-ru') || element.innerHTML;
    // Replace <br> tags with newlines so line breaks are preserved during typing
    const htmlWithBreaks = targetHTML.replace(/<br\s*\/?>/gi, '\n');
    // Strip other HTML tags for clean text typing
    const plainText = htmlWithBreaks.replace(/<[^>]*>/g, '').trim();
    
    element.textContent = '';
    element.style.whiteSpace = 'pre-line';
    element.classList.add('typewriter-cursor');
    let index = 0;

    function typeChar() {
      if (index < plainText.length) {
        element.textContent += plainText.charAt(index);
        index++;
        setTimeout(typeChar, 25 + Math.random() * 20);
      } else {
        setTimeout(() => {
          element.classList.remove('typewriter-cursor');
          element.style.whiteSpace = '';
          const activeLang = window.currentLang || 'ru';
          element.innerHTML = element.getAttribute(`data-${activeLang}`) || targetHTML;
        }, 1200);
      }
    }
    typeChar();
  }

  // 5. Interactive Cost Calculator
  const calcTypePills = document.querySelectorAll('#calc-types .calc-pill');
  const calcFeaturePills = document.querySelectorAll('#calc-features .calc-pill');
  const calcPriceVal = document.getElementById('calc-price-val');
  const calcTimeVal = document.getElementById('calc-time-val');
  const calcApplyBtn = document.getElementById('calc-apply-btn');

  let basePrice = 35000;
  let baseDays = 4;
  let featuresPrice = 0;
  let currentSiteType = "Лендинг пейдж";

  function updateCalculator() {
    let totalPrice = basePrice + featuresPrice;
    if (calcPriceVal) {
      calcPriceVal.textContent = `${totalPrice.toLocaleString('ru-RU')} ₽`;
    }
    if (calcTimeVal) {
      calcTimeVal.textContent = `Примерный срок: ${baseDays}-7 дней`;
    }
  }

  calcTypePills.forEach(pill => {
    pill.addEventListener('click', () => {
      calcTypePills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      basePrice = parseInt(pill.dataset.price, 10) || 35000;
      baseDays = parseInt(pill.dataset.days, 10) || 4;
      currentSiteType = pill.textContent.trim();
      updateCalculator();
    });
  });

  calcFeaturePills.forEach(pill => {
    pill.addEventListener('click', () => {
      pill.classList.toggle('active');
      calculateFeatures();
      updateCalculator();
    });
  });

  function calculateFeatures() {
    featuresPrice = 0;
    calcFeaturePills.forEach(pill => {
      if (pill.classList.contains('active')) {
        featuresPrice += parseInt(pill.dataset.price, 10) || 0;
      }
    });
  }

  if (calcApplyBtn) {
    calcApplyBtn.addEventListener('click', () => {
      const budgetSelect = document.getElementById('form-budget');
      const serviceSelect = document.getElementById('form-service');
      const contactSection = document.getElementById('contact');
      
      if (serviceSelect) {
        serviceSelect.value = currentSiteType;
      }
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
      }
      showToast('Параметры калькулятора перенесены в форму заявки!', 'success');
    });
  }

  // 5.1 Service Cards Click -> Form Transfer & Smooth Scroll
  document.querySelectorAll('.service-card').forEach(card => {
    card.addEventListener('click', () => {
      const serviceName = card.dataset.serviceName || card.querySelector('.service-title')?.textContent;
      const serviceSelect = document.getElementById('form-service');
      const contactSection = document.getElementById('contact');
      if (serviceSelect && serviceName) {
        serviceSelect.value = serviceName;
      }
      if (contactSection) {
        contactSection.scrollIntoView({ behavior: 'smooth' });
      }
      showToast(`Выбран формат: ${serviceName}`, 'success');
    });
  });

  // 6. Portfolio Filtering & Rich Interactive Case Modal Viewer
  const filterBtns = document.querySelectorAll('.filter-btn');
  const portfolioCards = document.querySelectorAll('.portfolio-card');
  const modalOverlay = document.getElementById('portfolio-modal');
  const modalBody = document.getElementById('modal-body-content');
  const modalClose = document.getElementById('modal-close-btn');

  const caseDataMap = {
    'almas': {
      title: 'ALMAS — Системный Интегратор',
      tag: 'System Integration',
      desc: 'Системный интегратор. Разработка веб-платформы с центральным орбитальным меню и диалоговым помощником.',
      color: '#0284c7',
      imgSrc: 'img/portfolio_almas.png',
      videoSrc: 'video/portfolio_almas.mp4',
      siteUrl: '../алмас/index.html'
    },
    'wrapgarage': {
      title: 'WrapGarage Detailing',
      tag: 'Auto Detailing Studio',
      desc: 'Премиальный сервис защиты кузова, оклейки и детейлинга Porsche с интерактивным управлением оптики.',
      color: '#E2D1BE',
      imgSrc: 'img/portfolio_wrapgarage.png',
      videoSrc: 'video/portfolio_wrapgarage.mp4',
      siteUrl: '../сто (славик)/index.html'
    }
  };

  function renderCaseViewer(caseId) {
    const data = caseDataMap[caseId] || caseDataMap['almas'];
    if (!modalBody) return;

    modalBody.innerHTML = `
      <div style="margin-bottom: 20px; overflow:hidden; border-radius:16px; border:1px solid rgba(255,255,255,0.15); background:#000;">
        <video controls autoplay loop muted playsinline poster="${data.imgSrc}" style="width:100%; max-height:480px; object-fit:cover; display:block;">
          ${data.videoSrc ? `<source src="${data.videoSrc}" type="video/mp4">` : ''}
          <img src="${data.imgSrc}" alt="${data.title}" style="width:100%; max-height:480px; object-fit:cover; display:block;">
        </video>
      </div>
      <div style="margin-bottom: 20px;">
        <span style="color:${data.color}; font-weight:700; font-size:0.85rem; text-transform:uppercase; letter-spacing:1px;">${data.tag}</span>
        <h3 style="font-size:2rem; margin:6px 0 12px; color:#ffffff;">${data.title}</h3>
        <p style="color:#cbd5e1; line-height:1.6; font-size:1rem; margin-bottom:20px;">${data.desc}</p>
      </div>
      <div style="margin-top:24px; padding-top:20px; border-top:1px solid rgba(255,255,255,0.1); display:flex; gap:14px; justify-content:space-between; align-items:center; flex-wrap:wrap;">
        <div style="display:flex; gap:12px; align-items:center; flex-wrap:wrap;">
          <a href="#contact" onclick="closePortfolioModal()" class="btn btn-primary" style="font-weight:bold;">Хочу аналогичный проект</a>
        </div>
        <button onclick="closePortfolioModal()" style="background:transparent; border:none; color:#94a3b8; cursor:pointer; font-size:0.9rem;">Закрыть окно</button>
      </div>
    `;

    if (modalOverlay) {
      modalOverlay.style.display = 'flex';
      void modalOverlay.offsetWidth;
      modalOverlay.classList.add('open', 'active');
    }
  }

  window.switchCaseModalTab = function(btnEl, tabId) {
    const nav = btnEl.closest('.case-modal-nav');
    if (nav) {
      nav.querySelectorAll('.case-modal-tab').forEach(t => t.classList.remove('active'));
    }
    btnEl.classList.add('active');

    const container = document.getElementById('case-tab-container');
    if (container) {
      container.querySelectorAll('.case-tab-pane').forEach(p => p.style.display = 'none');
      const targetPane = document.getElementById(`case-tab-${tabId}`);
      if (targetPane) targetPane.style.display = 'block';
    }
  };

  portfolioCards.forEach(card => {
    const followerBtn = card.querySelector('.portfolio-follower-btn');
    const imgWrapper = card.querySelector('.portfolio-img-wrapper');

    if (followerBtn && imgWrapper) {
      imgWrapper.addEventListener('mousemove', (e) => {
        const rect = imgWrapper.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        followerBtn.style.left = `${x}px`;
        followerBtn.style.top = `${y}px`;
      });
    }

    card.addEventListener('click', () => {
      const caseId = card.dataset.caseId || 'almas';
      if (typeof renderCaseViewer === 'function') {
        renderCaseViewer(caseId);
      }
    });
  });

  const portfolioModalEl = document.getElementById('portfolio-modal');
  const portfolioModalCloseBtn = document.getElementById('modal-close-btn');

  window.closePortfolioModal = function() {
    if (portfolioModalEl) {
      portfolioModalEl.style.display = 'none';
      portfolioModalEl.classList.remove('active', 'open');
    }
  };

  if (portfolioModalCloseBtn) {
    portfolioModalCloseBtn.addEventListener('click', window.closePortfolioModal);
  }

  if (portfolioModalEl) {
    portfolioModalEl.addEventListener('click', (e) => {
      if (e.target === portfolioModalEl) window.closePortfolioModal();
    });
  }

  // 7. FAQ Accordion
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const header = item.querySelector('.faq-header');
    if (header) {
      header.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        faqItems.forEach(i => i.classList.remove('active'));
        if (!isActive) {
          item.classList.add('active');
        }
      });
    }
  });

  // File upload input change UI handler
  const fileInput = document.getElementById('form-attachment');
  const fileLabel = document.getElementById('file-upload-label');
  const fileText = document.getElementById('file-upload-text');

  if (fileInput && fileLabel && fileText) {
    fileInput.addEventListener('change', () => {
      if (fileInput.files && fileInput.files.length > 0) {
        const file = fileInput.files[0];
        const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
        fileText.textContent = `📎 ${file.name} (${fileSizeMB} МБ)`;
        fileLabel.classList.add('file-selected');
      } else {
        const isEn = window.currentLang === 'en';
        fileText.textContent = isEn ? 'Attach requirements or layout (up to 10 MB)' : 'Прикрепить ТЗ или макет (до 10 МБ)';
        fileLabel.classList.remove('file-selected');
      }
    });
  }

  // 8. Web3Forms Contact Form Handler with Client-Side Rate-Limiting & Anti-DDoS Protection
  const contactForm = document.getElementById('web3forms-contact-form');
  const submitBtn = document.getElementById('form-submit-btn');
  let lastSubmissionTime = 0;
  const SUBMIT_COOLDOWN_MS = 45000; // 45 sec rate-limiting against DDoS/Spam

  if (contactForm) {
    contactForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const now = Date.now();
      if (now - lastSubmissionTime < SUBMIT_COOLDOWN_MS) {
        const remaining = Math.ceil((SUBMIT_COOLDOWN_MS - (now - lastSubmissionTime)) / 1000);
        const isEn = window.currentLang === 'en';
        const msg = isEn 
          ? `Anti-Spam Protection: Please wait ${remaining}s before resubmitting.` 
          : `Защита от спама: подождите ${remaining} сек. перед повторной отправкой.`;
        showToast(msg, 'error');
        return;
      }

      const formData = new FormData(contactForm);
      if (formData.get('botcheck')) {
        console.warn('Bot submission blocked via honeypot trap.');
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.innerHTML = `<span>Отправка...</span> <div class="pulse-dot"></div>`;
      }

      try {
        const response = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          body: formData
        });

        const result = await response.json();

        if (response.status === 200 && result.success) {
          lastSubmissionTime = Date.now();
          const isEn = window.currentLang === 'en';
          showToast(isEn ? 'Inquiry submitted successfully! We will contact you soon.' : 'Заявка успешно отправлена! Мы свяжемся с вами в ближайшее время.', 'success');
          contactForm.reset();
        } else {
          showToast(result.message || 'Произошла ошибка при отправке. Попробуйте еще раз.', 'error');
        }
      } catch (error) {
        console.error('Web3Forms Error:', error);
        showToast('Ошибка сети. Проверьте подключение и повторите попытку.', 'error');
      } finally {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.innerHTML = `<span>Отправить заявку</span> <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>`;
        }
      }
    });
  }

  // Toast System
  function showToast(message, type = 'success') {
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      toastContainer.className = 'toast-container';
      document.body.appendChild(toastContainer);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const iconSvg = type === 'success' 
      ? `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>`
      : `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>`;

    toast.innerHTML = `${iconSvg} <span>${message}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.4s ease';
      setTimeout(() => toast.remove(), 400);
    }, 4500);
  }

  // 9. Continuous Dynamic Code Type & Erase Streams
  const leftSnippets = [
    `const switchApp = new SwitchEngine({\n  precision: 1.0,\n  mode: 'perfection',\n  theme: 'pure-black'\n});`,
    `async function sendRequest(payload) {\n  const res = await fetch('/api',\n    { method: 'POST', body: payload });\n  return await res.json();\n}`,
    `function initParticles(count = 180) {\n  return Array.from({length: count},\n    () => new VectorPoint());\n}`
  ];

  const rightSnippets = [
    `.switch-card {\n  background: #09090b;\n  border: 1px solid #27272a;\n  border-radius: 16px;\n  transition: all 0.3s ease;\n}`,
    `@keyframes floatZeroG {\n  0% { transform: translateY(0); }\n  50% { transform: translateY(-10px); }\n  100% { transform: translateY(0); }\n}`,
    `h1.hero-title {\n  font-family: 'Unbounded';\n  letter-spacing: -0.03em;\n  color: #ffffff;\n}`
  ];

  function runCodeStream(elementId, snippets) {
    const container = document.getElementById(elementId);
    if (!container) return;

    let snippetIdx = 0;
    let charIdx = 0;
    let isDeleting = false;

    function tick() {
      const current = snippets[snippetIdx];

      if (!isDeleting) {
        container.innerHTML = highlightCodeSnippet(current.substring(0, charIdx + 1));
        charIdx++;
        if (charIdx === current.length) {
          isDeleting = true;
          setTimeout(tick, 2200);
          return;
        }
      } else {
        container.innerHTML = highlightCodeSnippet(current.substring(0, charIdx - 1));
        charIdx--;
        if (charIdx === 0) {
          isDeleting = false;
          snippetIdx = (snippetIdx + 1) % snippets.length;
          setTimeout(tick, 500);
          return;
        }
      }

      const delay = isDeleting ? 18 : 30 + Math.random() * 20;
      setTimeout(tick, delay);
    }
    tick();
  }

  function highlightCodeSnippet(code) {
    return code
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\n/g, "<br>")
      .replace(/\s/g, "&nbsp;")
      .replace(/(const|let|var|function|async|await|return|new|class)/g, "<span class='syn-kw'>$1</span>")
      .replace(/(#[\da-f]{3,6}|'[^']*'|"[^"]*")/gi, "<span class='syn-str'>$1</span>")
      .replace(/(0%|50%|100%|\d+px|\d+s)/gi, "<span class='syn-num'>$1</span>");
  }

  runCodeStream('code-stream-left', leftSnippets);
  runCodeStream('code-stream-right', rightSnippets);

  // ==========================================================================
  // SWITCH Exclusive Admin Panel & Real-Time Analytics Controller
  // ==========================================================================
  const adminAuthModal = document.getElementById('admin-auth-modal');
  const adminDashModal = document.getElementById('admin-dashboard-modal');
  const pinInputs = [
    document.getElementById('pin-1'),
    document.getElementById('pin-2'),
    document.getElementById('pin-3'),
    document.getElementById('pin-4')
  ];
  const pinErrorMsg = document.getElementById('admin-pin-error');
  let dashRefreshInterval = null;

  function openAdminAuth() {
    playNintendoSwitchSnapSound();
    if (window.SwitchAnalytics && window.SwitchAnalytics.isAuthenticated()) {
      openAdminDashboard();
    } else {
      if (adminAuthModal) {
        adminAuthModal.style.display = 'flex';
        adminAuthModal.classList.add('active');
        resetPinInputs();
        if (pinInputs[0]) pinInputs[0].focus();
      }
    }
  }

  function closeAdminAuth() {
    if (adminAuthModal) {
      adminAuthModal.style.display = 'none';
      adminAuthModal.classList.remove('active');
    }
  }

  function openAdminDashboard() {
    closeAdminAuth();
    if (adminDashModal) {
      adminDashModal.style.display = 'flex';
      adminDashModal.classList.add('active');
      renderAdminDashboard();
      playNintendoSwitchSnapSound();

      // Auto-refresh stats every 5 seconds while dashboard is open
      if (!dashRefreshInterval) {
        dashRefreshInterval = setInterval(() => {
          if (adminDashModal && adminDashModal.classList.contains('active')) {
            renderAdminDashboard();
          }
        }, 5000);
      }
    }
  }

  function closeAdminDashboard() {
    if (adminDashModal) {
      adminDashModal.style.display = 'none';
      adminDashModal.classList.remove('active');
    }
    if (dashRefreshInterval) {
      clearInterval(dashRefreshInterval);
      dashRefreshInterval = null;
    }
  }

  function resetPinInputs() {
    pinInputs.forEach(input => {
      if (input) input.value = '';
    });
    if (pinErrorMsg) pinErrorMsg.style.display = 'none';
  }

  function getEnteredPin() {
    return pinInputs.map(input => input ? input.value : '').join('');
  }

  function handlePinSubmit() {
    const pin = getEnteredPin();
    if (pin.length < 4) return;

    if (window.SwitchAnalytics && window.SwitchAnalytics.verifyPin(pin)) {
      openAdminDashboard();
    } else {
      playNintendoSwitchSnapSound();
      if (pinErrorMsg) pinErrorMsg.style.display = 'block';
      pinInputs.forEach(inp => {
        if (inp) {
          inp.style.borderColor = '#ff4d4d';
          setTimeout(() => inp.style.borderColor = '', 1000);
        }
      });
      resetPinInputs();
      if (pinInputs[0]) pinInputs[0].focus();
    }
  }

  // Setup PIN Input Auto-Advance & Backspace Nav
  pinInputs.forEach((input, index) => {
    if (!input) return;

    input.addEventListener('input', (e) => {
      const val = e.target.value;
      if (val && index < pinInputs.length - 1) {
        pinInputs[index + 1].focus();
      }
      if (getEnteredPin().length === 4) {
        handlePinSubmit();
      }
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Backspace' && !e.target.value && index > 0) {
        pinInputs[index - 1].focus();
      } else if (e.key === 'Enter') {
        handlePinSubmit();
      }
    });
  });

  // PIN Auth Submit & Cancel Buttons
  const authSubmitBtn = document.getElementById('admin-auth-submit');
  const authCancelBtn = document.getElementById('admin-auth-cancel');
  if (authSubmitBtn) authSubmitBtn.addEventListener('click', handlePinSubmit);
  if (authCancelBtn) authCancelBtn.addEventListener('click', closeAdminAuth);

  // Close Dashboard Modal
  const dashCloseBtn = document.getElementById('admin-dash-close');
  if (dashCloseBtn) dashCloseBtn.addEventListener('click', closeAdminDashboard);

  // Secret Trigger Button in Footer
  const secretTriggerBtn = document.getElementById('secret-admin-trigger');
  if (secretTriggerBtn) {
    secretTriggerBtn.addEventListener('click', (e) => {
      e.preventDefault();
      openAdminAuth();
    });
  }

  // Secret Entry Method 1: Keyboard Shortcut (Ctrl + Shift + S or Ctrl + Alt + A - supporting EN and RU layouts)
  window.addEventListener('keydown', (e) => {
    const isSKey = e.code === 'KeyS' || e.key.toLowerCase() === 's' || e.key.toLowerCase() === 'ы';
    const isAKey = e.code === 'KeyA' || e.key.toLowerCase() === 'a' || e.key.toLowerCase() === 'ф';
    
    if ((e.ctrlKey && e.shiftKey && isSKey) || (e.ctrlKey && e.altKey && isAKey)) {
      e.preventDefault();
      openAdminAuth();
    }
  });

  // Secret Entry Method 2: Triple-Click Footer Logo
  const footerLogo = document.querySelector('.footer .logo');
  let clickCount = 0;
  let clickTimer = null;
  if (footerLogo) {
    footerLogo.addEventListener('click', (e) => {
      clickCount++;
      if (clickCount === 1) {
        clickTimer = setTimeout(() => { clickCount = 0; }, 1000);
      } else if (clickCount >= 3) {
        e.preventDefault();
        clearTimeout(clickTimer);
        clickCount = 0;
        openAdminAuth();
      }
    });
  }

  // Secret Entry Method 3: URL Parameter / Hash (#admin or ?admin=true)
  function checkUrlForAdminSecret() {
    if (window.location.hash === '#admin' || window.location.search.includes('admin=true')) {
      openAdminAuth();
    }
  }
  checkUrlForAdminSecret();
  window.addEventListener('hashchange', checkUrlForAdminSecret);

  // Render Admin Dashboard Data & Charts
  function renderAdminDashboard() {
    if (!window.SwitchAnalytics) return;
    const stats = window.SwitchAnalytics.getStats();

    // Metric 1: Online
    const onlineEl = document.getElementById('metric-online');
    if (onlineEl) onlineEl.textContent = stats.onlineCount;

    // Metric 2: Total Visits
    const totalEl = document.getElementById('metric-total-visits');
    if (totalEl) totalEl.textContent = stats.totalVisits;

    // Metric 3: Unique Visitors
    const uniqueEl = document.getElementById('metric-unique');
    if (uniqueEl) uniqueEl.textContent = stats.uniqueVisitors;

    // Metric 4: Avg Duration
    const avgEl = document.getElementById('metric-avg-duration');
    if (avgEl) {
      const sec = stats.avgDurationSec;
      if (sec < 60) {
        avgEl.textContent = `${sec}с`;
      } else {
        const mins = Math.floor(sec / 60);
        const remSec = sec % 60;
        avgEl.textContent = `${mins}м ${remSec}с`;
      }
    }

    // Devices & Browsers Distribution
    const deviceListEl = document.getElementById('device-progress-list');
    if (deviceListEl) {
      deviceListEl.innerHTML = '';
      const devCounts = stats.deviceCounts;
      const totalDevs = stats.totalVisits || 1;
      
      Object.keys(devCounts).forEach(deviceType => {
        const count = devCounts[deviceType];
        const pct = Math.round((count / totalDevs) * 100);
        const item = document.createElement('div');
        item.className = 'admin-progress-item';
        item.innerHTML = `
          <div class="admin-progress-label">
            <span>${deviceType}</span>
            <span>${count} визитов (${pct}%)</span>
          </div>
          <div class="admin-progress-bar-bg">
            <div class="admin-progress-bar-fill" style="width: ${pct}%;"></div>
          </div>
        `;
        deviceListEl.appendChild(item);
      });
    }

    // Geo Locations Distribution
    const geoListEl = document.getElementById('geo-progress-list');
    if (geoListEl) {
      geoListEl.innerHTML = '';
      const countryCounts = stats.countryCounts;
      const totalGeos = stats.totalVisits || 1;

      Object.keys(countryCounts).forEach(countryName => {
        const count = countryCounts[countryName];
        const pct = Math.round((count / totalGeos) * 100);
        const item = document.createElement('div');
        item.className = 'admin-progress-item';
        item.innerHTML = `
          <div class="admin-progress-label">
            <span>🌍 ${countryName}</span>
            <span>${count} (${pct}%)</span>
          </div>
          <div class="admin-progress-bar-bg">
            <div class="admin-progress-bar-fill" style="width: ${pct}%;"></div>
          </div>
        `;
        geoListEl.appendChild(item);
      });
    }

    // Detailed Visitors Table
    const tableBody = document.getElementById('admin-table-body');
    if (tableBody) {
      tableBody.innerHTML = '';

      if (stats.sessions.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="8" style="text-align:center; padding:30px; color:var(--text-muted);">История визитов пуста</td></tr>`;
        return;
      }

      stats.sessions.forEach(sess => {
        const row = document.createElement('tr');
        const statusBadge = sess.isOnline
          ? `<span class="visitor-status-pill status-online"><span class="live-pulse-dot"></span> Онлайн</span>`
          : `<span class="visitor-status-pill status-offline">Завершен</span>`;

        const entryDate = new Date(sess.entryTime);
        const timeStr = entryDate.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
        const dateStr = entryDate.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });

        const durSec = sess.durationSeconds || 0;
        const durStr = durSec < 60 ? `${durSec} сек` : `${Math.floor(durSec / 60)} мин ${durSec % 60} сек`;
        const lastPage = (sess.pagesVisited && sess.pagesVisited.length > 0)
          ? sess.pagesVisited[sess.pagesVisited.length - 1]
          : 'Главная';

        row.innerHTML = `
          <td>${statusBadge}</td>
          <td>
            <div style="font-weight:600; color:#fff;">${sess.city || 'Неизвестно'}, ${sess.country || 'Россия'}</div>
            <div style="font-size:0.75rem; color:var(--text-dim);">${sess.ip}</div>
          </td>
          <td>
            <div>${sess.device}</div>
            <div style="font-size:0.75rem; color:var(--text-dim);">${sess.os}</div>
          </td>
          <td>${sess.browser}</td>
          <td><span style="color:#00f2fe; font-size:0.8rem;">${lastPage}</span></td>
          <td>
            <div>${timeStr}</div>
            <div style="font-size:0.75rem; color:var(--text-dim);">${dateStr}</div>
          </td>
          <td>${durStr}</td>
          <td><span style="background:rgba(255,255,255,0.06); padding:2px 8px; border-radius:6px; font-size:0.78rem;">${sess.referrer}</span></td>
        `;
        tableBody.appendChild(row);
      });
    }
  }

  // Dashboard Header Action Buttons
  const refreshBtn = document.getElementById('admin-refresh-btn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      playNintendoSwitchSnapSound();
      renderAdminDashboard();
    });
  }

  const simulateBtn = document.getElementById('admin-simulate-btn');
  if (simulateBtn) {
    simulateBtn.addEventListener('click', () => {
      playNintendoSwitchSnapSound();
      if (window.SwitchAnalytics) {
        window.SwitchAnalytics.simulateVisitor();
        renderAdminDashboard();
      }
    });
  }

  const exportBtn = document.getElementById('admin-export-btn');
  if (exportBtn) {
    exportBtn.addEventListener('click', () => {
      playNintendoSwitchSnapSound();
      if (window.SwitchAnalytics) {
        window.SwitchAnalytics.exportData('csv');
      }
    });
  }

  const clearBtn = document.getElementById('admin-clear-btn');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      playNintendoSwitchSnapSound();
      if (confirm('Вы действительно хотите очистить всю историю визитов?')) {
        if (window.SwitchAnalytics) {
          window.SwitchAnalytics.clearData();
          renderAdminDashboard();
        }
      }
    });
  }

  const changePinBtn = document.getElementById('admin-changepin-btn');
  if (changePinBtn) {
    changePinBtn.addEventListener('click', () => {
      playNintendoSwitchSnapSound();
      const newPin = prompt('Введите новый PIN-код для входа (минимум 4 символа):');
      if (newPin && newPin.trim().length >= 4) {
        if (window.SwitchAnalytics && window.SwitchAnalytics.changePin(newPin)) {
          alert('PIN-код успешно изменен на: ' + newPin.trim());
        }
      } else if (newPin !== null) {
        alert('Ошибка: PIN-код должен содержать минимум 4 символа!');
      }
    });
  }
});

