/* ==========================================================================
   SWITCH CYBER KINETIC SHIELD — Client-Side Security System v2.0
   Комплексная система защиты от всех типов клиентских атак
   ========================================================================== */

(function () {
  'use strict';

  const SWITCH_SHIELD = {
    version: '2.0.0',
    name: 'SWITCH Cyber Kinetic Shield',
    violations: [],
    maxViolations: 10,
    isBlocked: false,
    sessionId: null,
    config: {
      enableAntiXSS: true,
      enableAntiClickjacking: true,
      enableAntiBot: true,
      enableRateLimiting: true,
      enableInputSanitization: true,
      enableDevToolsDetection: false, // отключено по умолчанию — для продакшена
      enableCopyProtection: false,    // опционально
      enableHoneypot: true,
      enableCSP: true,
      enableSessionIntegrity: true,
      enableFormProtection: true,
      enableLinkProtection: true,
      enableDOMProtection: true,
      rateLimitWindow: 1000,     // ms
      rateLimitMaxRequests: 30,
      blockDuration: 300000,     // 5 минут бан
      maxInputLength: 5000,
      suspiciousPatterns: [
        /<script\b[^>]*>/gi,
        /javascript\s*:/gi,
        /on\w+\s*=\s*["']/gi,
        /eval\s*\(/gi,
        /document\s*\.\s*cookie/gi,
        /document\s*\.\s*write/gi,
        /window\s*\.\s*location/gi,
        /innerHTML\s*=/gi,
        /outerHTML\s*=/gi,
        /insertAdjacentHTML/gi,
        /fromCharCode/gi,
        /String\s*\.\s*raw/gi,
        /<iframe\b/gi,
        /<object\b/gi,
        /<embed\b/gi,
        /<form\b[^>]*action\s*=\s*["'](?!#)/gi,
        /data\s*:\s*text\/html/gi,
        /vbscript\s*:/gi,
        /expression\s*\(/gi,
        /url\s*\(\s*["']?\s*javascript/gi,
      ],
      sqlPatterns: [
        /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|FETCH|DECLARE|TRUNCATE|CAST|CONVERT|TABLE|FROM|WHERE|AND|OR)\b.*\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|UNION|FETCH|DECLARE|TRUNCATE|CAST|CONVERT|TABLE|FROM|WHERE)\b)/gi,
        /('\s*(OR|AND)\s*'?\s*\d+\s*=\s*\d+)/gi,
        /(--\s*$|;\s*--)/gm,
        /\/\*[\s\S]*?\*\//g,
        /(BENCHMARK|SLEEP|WAITFOR|DELAY)\s*\(/gi,
        /LOAD_FILE\s*\(/gi,
        /INTO\s+(OUT|DUMP)FILE/gi,
      ],
      pathTraversalPatterns: [
        /\.\.\//g,
        /\.\.%2[fF]/g,
        /\.\.%5[cC]/g,
        /%2[eE]%2[eE]/g,
        /etc\/passwd/gi,
        /etc\/shadow/gi,
        /proc\/self/gi,
        /wp-admin/gi,
        /wp-config/gi,
        /phpinfo/gi,
        /\.env$/gi,
        /\.git\//gi,
        /\.htaccess/gi,
        /web\.config/gi,
      ],
    },

    /* ─── Инициализация ─── */
    init() {
      this.sessionId = this.generateSessionId();
      this.log('🛡️ SWITCH Cyber Kinetic Shield v' + this.version + ' активирован');

      // Порядок важен
      if (this.config.enableAntiClickjacking) this.antiClickjacking();
      if (this.config.enableCSP) this.enforceCSP();
      if (this.config.enableAntiXSS) this.antiXSS();
      if (this.config.enableAntiBot) this.antiBot();
      if (this.config.enableRateLimiting) this.rateLimiter();
      if (this.config.enableInputSanitization) this.inputSanitization();
      if (this.config.enableHoneypot) this.honeypotSystem();
      if (this.config.enableSessionIntegrity) this.sessionIntegrity();
      if (this.config.enableFormProtection) this.formProtection();
      if (this.config.enableLinkProtection) this.linkProtection();
      if (this.config.enableDOMProtection) this.domProtection();
      if (this.config.enableDevToolsDetection) this.devToolsDetection();
      if (this.config.enableCopyProtection) this.copyProtection();

      this.urlProtection();
      this.headerProtection();
      this.errorBoundary();

      this.log('✅ Все модули защиты инициализированы');
    },

    /* ─── Утилиты ─── */
    generateSessionId() {
      const arr = new Uint8Array(16);
      crypto.getRandomValues(arr);
      return Array.from(arr, b => b.toString(16).padStart(2, '0')).join('');
    },

    log(msg, level = 'info') {
      const prefix = `[SWITCH Shield]`;
      const ts = new Date().toISOString();
      if (level === 'warn') {
        console.warn(`${prefix} ${ts} ⚠️ ${msg}`);
      } else if (level === 'error') {
        console.error(`${prefix} ${ts} 🚨 ${msg}`);
      } else {
        console.log(`${prefix} ${ts} ${msg}`);
      }
    },

    recordViolation(type, details = '') {
      const violation = {
        type,
        details,
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        sessionId: this.sessionId,
      };
      this.violations.push(violation);
      this.log(`НАРУШЕНИЕ [${type}]: ${details}`, 'warn');

      if (this.violations.length >= this.maxViolations) {
        this.blockUser();
      }
    },

    blockUser() {
      if (this.isBlocked) return;
      this.isBlocked = true;
      this.log('🚫 Пользователь заблокирован — превышен лимит нарушений', 'error');

      try {
        sessionStorage.setItem('switch_shield_blocked', Date.now().toString());
      } catch (e) { /* */ }

      // Перенаправляем на страницу ошибки
      try {
        window.location.href = 'error.html?code=403&reason=security';
      } catch (e) {
        document.body.innerHTML = '<div style="background:#000;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;font-family:\'Unbounded\',sans-serif;text-align:center;padding:20px;"><div><h1 style="font-size:4rem;margin-bottom:1rem;">🚫 403</h1><p style="color:#a1a1aa;">Доступ ограничен по соображениям безопасности SWITCH Shield.</p></div></div>';
      }
    },

    checkBlocked() {
      try {
        const blockedAt = sessionStorage.getItem('switch_shield_blocked');
        if (blockedAt) {
          const elapsed = Date.now() - parseInt(blockedAt, 10);
          if (elapsed < this.config.blockDuration) {
            this.isBlocked = true;
            window.location.href = 'error.html?code=403&reason=security';
            return true;
          } else {
            sessionStorage.removeItem('switch_shield_blocked');
          }
        }
      } catch (e) { /* */ }
      return false;
    },

    sanitizeString(str) {
      if (typeof str !== 'string') return str;
      const div = document.createElement('div');
      div.appendChild(document.createTextNode(str));
      return div.innerHTML;
    },

    /* ═══════════════════════════════════════════════════════════════════
       МОДУЛЬ 1: ANTI-CLICKJACKING
       ═══════════════════════════════════════════════════════════════════ */
    antiClickjacking() {
      // Framebusting — запрет загрузки в iframe
      if (window.self !== window.top) {
        this.recordViolation('CLICKJACKING', 'Сайт загружен внутри iframe');
        try {
          window.top.location = window.self.location;
        } catch (e) {
          // Cross-origin — не можем перенаправить, скрываем контент
          document.body.innerHTML = '';
          document.body.style.display = 'none';
        }
      }

      // Визуальная защита от наложений (UI Redressing)
      document.addEventListener('click', (e) => {
        const el = e.target;
        if (el) {
          const style = window.getComputedStyle(el);
          const opacity = parseFloat(style.opacity);
          if (opacity < 0.1 && el.tagName !== 'INPUT' && el.type !== 'hidden') {
            e.preventDefault();
            e.stopPropagation();
            this.recordViolation('UI_REDRESS', 'Клик по невидимому элементу заблокирован');
          }
        }
      }, true);

      this.log('🔒 Anti-Clickjacking: активен');
    },

    /* ═══════════════════════════════════════════════════════════════════
       МОДУЛЬ 2: ANTI-XSS (Cross-Site Scripting)
       ═══════════════════════════════════════════════════════════════════ */
    antiXSS() {
      const self = this;

      // Перехват innerHTML / outerHTML
      const origInnerHTMLSetter = Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML').set;
      const origOuterHTMLSetter = Object.getOwnPropertyDescriptor(Element.prototype, 'outerHTML').set;

      Object.defineProperty(Element.prototype, 'innerHTML', {
        set(value) {
          if (this.hasAttribute && this.hasAttribute('data-switch-safe')) {
            return origInnerHTMLSetter.call(this, value);
          }
          if (typeof value === 'string' && self.detectXSS(value)) {
            self.recordViolation('XSS_INNERHTML', 'Подозрительный innerHTML заблокирован');
            return origInnerHTMLSetter.call(this, self.sanitizeString(value));
          }
          return origInnerHTMLSetter.call(this, value);
        },
        get: Object.getOwnPropertyDescriptor(Element.prototype, 'innerHTML').get,
        configurable: true,
      });

      Object.defineProperty(Element.prototype, 'outerHTML', {
        set(value) {
          if (typeof value === 'string' && self.detectXSS(value)) {
            self.recordViolation('XSS_OUTERHTML', 'Подозрительный outerHTML заблокирован');
            return origOuterHTMLSetter.call(this, self.sanitizeString(value));
          }
          return origOuterHTMLSetter.call(this, value);
        },
        get: Object.getOwnPropertyDescriptor(Element.prototype, 'outerHTML').get,
        configurable: true,
      });

      // Перехват document.write
      const origWrite = document.write.bind(document);
      document.write = function (content) {
        if (typeof content === 'string' && self.detectXSS(content)) {
          self.recordViolation('XSS_DOC_WRITE', 'document.write с XSS заблокирован');
          return;
        }
        origWrite(content);
      };

      // Перехват insertAdjacentHTML
      const origInsertAdjHTML = Element.prototype.insertAdjacentHTML;
      Element.prototype.insertAdjacentHTML = function (position, text) {
        if (typeof text === 'string' && self.detectXSS(text)) {
          self.recordViolation('XSS_INSERT_ADJ', 'insertAdjacentHTML с XSS заблокирован');
          text = self.sanitizeString(text);
        }
        return origInsertAdjHTML.call(this, position, text);
      };

      // Перехват eval с проверкой стека для своих скриптов
      const origEval = window.eval;
      window.eval = function (code) {
        const stack = new Error().stack || '';
        if (stack.includes('security.js') || stack.includes('script.js') || stack.includes('analytics.js') || stack.includes('switch')) {
          return origEval(code);
        }
        self.recordViolation('XSS_EVAL', 'eval() вызов от стороннего скрипта заблокирован');
        self.log('⛔ eval() заблокирован: ' + String(code).substring(0, 100), 'error');
        return undefined;
      };

      // Защита от DOM-based XSS: перехват location изменений
      const origLocationAssign = window.location.assign;
      const origLocationReplace = window.location.replace;

      // MutationObserver для удаления инжектированных скриптов
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) {
              // Удаление inline event handlers
              const attrs = node.attributes;
              if (attrs) {
                for (let i = attrs.length - 1; i >= 0; i--) {
                  const attr = attrs[i];
                  if (attr.name.startsWith('on') && attr.name !== 'onsubmit') {
                    // Проверяем — не наш ли это обработчик
                    if (!node.hasAttribute('data-switch-safe')) {
                      node.removeAttribute(attr.name);
                      self.recordViolation('XSS_INLINE_EVENT', `Inline ${attr.name} удалён у <${node.tagName}>`);
                    }
                  }
                }
              }

              // Удаление инжектированных script тегов без src или с подозрительным src
              if (node.tagName === 'SCRIPT') {
                const src = node.getAttribute('src') || '';
                const isTrusted = src === '' ||
                  src.includes('switch-studio') ||
                  src.includes('google') ||
                  src.includes('yandex') ||
                  src.includes('fonts.googleapis') ||
                  node.hasAttribute('data-switch-safe');

                if (!isTrusted && !node.type?.includes('json')) {
                  node.remove();
                  self.recordViolation('XSS_SCRIPT_INJECT', `Инжектированный <script> удалён: ${src || '[inline]'}`);
                }
              }
            }
          });
        });
      });

      observer.observe(document.documentElement, {
        childList: true,
        subtree: true,
      });

      this.log('🔒 Anti-XSS: активен (innerHTML, outerHTML, document.write, eval, MutationObserver)');
    },

    detectXSS(str) {
      if (typeof str !== 'string') return false;
      for (const pattern of this.config.suspiciousPatterns) {
        pattern.lastIndex = 0;
        if (pattern.test(str)) return true;
      }
      return false;
    },

    /* ═══════════════════════════════════════════════════════════════════
       МОДУЛЬ 3: ANTI-BOT (поведенческий анализ)
       ═══════════════════════════════════════════════════════════════════ */
    antiBot() {
      const self = this;
      const botSignals = {
        mouseMovements: 0,
        keyPresses: 0,
        scrollEvents: 0,
        touchEvents: 0,
        startTime: Date.now(),
        hasInteracted: false,
      };

      document.addEventListener('mousemove', () => {
        botSignals.mouseMovements++;
        botSignals.hasInteracted = true;
      }, { passive: true });

      document.addEventListener('keydown', () => {
        botSignals.keyPresses++;
        botSignals.hasInteracted = true;
      }, { passive: true });

      document.addEventListener('scroll', () => {
        botSignals.scrollEvents++;
        botSignals.hasInteracted = true;
      }, { passive: true });

      document.addEventListener('touchstart', () => {
        botSignals.touchEvents++;
        botSignals.hasInteracted = true;
      }, { passive: true });

      // Проверка через 8 секунд — если нет активности, скорее всего бот
      setTimeout(() => {
        const elapsed = (Date.now() - botSignals.startTime) / 1000;
        if (!botSignals.hasInteracted && elapsed > 7) {
          self.log('🤖 Возможная бот-активность: нет взаимодействий за 8 сек', 'warn');
          // Не блокируем, просто помечаем
          document.documentElement.setAttribute('data-bot-suspect', 'true');
        }
      }, 8000);

      // Проверка headless браузеров с исключением iOS и Safari
      const headlessSignals = [];
      const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
      const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);

      if (navigator.webdriver) headlessSignals.push('webdriver');
      if (!navigator.languages || navigator.languages.length === 0) headlessSignals.push('no_languages');
      if (navigator.plugins && navigator.plugins.length === 0 && !isMobile && !isSafari) {
        headlessSignals.push('no_plugins');
      }
      if (/HeadlessChrome|PhantomJS|Nightmare|Selenium|puppeteer/i.test(navigator.userAgent)) {
        headlessSignals.push('headless_ua');
      }
      if (window.callPhantom || window._phantom || window.__nightmare) {
        headlessSignals.push('phantom_globals');
      }

      if (headlessSignals.length >= 2) {
        this.recordViolation('BOT_DETECTED', `Headless: ${headlessSignals.join(', ')}`);
      }

      this.log('🔒 Anti-Bot: активен');
    },

    /* ═══════════════════════════════════════════════════════════════════
       МОДУЛЬ 4: RATE LIMITER
       ═══════════════════════════════════════════════════════════════════ */
    rateLimiter() {
      const self = this;
      const clickTimestamps = [];
      const submitTimestamps = [];

      // Защита от кликового флуда
      document.addEventListener('click', () => {
        const now = Date.now();
        clickTimestamps.push(now);

        // Очищаем старые записи
        while (clickTimestamps.length > 0 && clickTimestamps[0] < now - self.config.rateLimitWindow) {
          clickTimestamps.shift();
        }

        if (clickTimestamps.length > self.config.rateLimitMaxRequests) {
          self.recordViolation('RATE_LIMIT_CLICK', `${clickTimestamps.length} кликов за ${self.config.rateLimitWindow}мс`);
        }
      }, true);

      // Защита от спама форм
      document.addEventListener('submit', (e) => {
        const now = Date.now();
        submitTimestamps.push(now);

        // Не более 3 отправок за 10 секунд
        const recentSubmits = submitTimestamps.filter(t => t > now - 10000);
        if (recentSubmits.length > 3) {
          e.preventDefault();
          self.recordViolation('RATE_LIMIT_SUBMIT', 'Слишком частая отправка форм');
        }
      }, true);

      // Защита от rapid-fire XHR и Fetch
      const origOpen = XMLHttpRequest.prototype.open;
      const xhrTimestamps = [];
      XMLHttpRequest.prototype.open = function (...args) {
        const now = Date.now();
        xhrTimestamps.push(now);
        while (xhrTimestamps.length > 0 && xhrTimestamps[0] < now - 1000) {
          xhrTimestamps.shift();
        }
        if (xhrTimestamps.length > 50) {
          self.recordViolation('RATE_LIMIT_XHR', `${xhrTimestamps.length} XHR запросов за секунду`);
        }
        return origOpen.apply(this, args);
      };

      if (window.fetch) {
        const origFetch = window.fetch;
        const fetchTimestamps = [];
        window.fetch = function (...args) {
          const now = Date.now();
          fetchTimestamps.push(now);
          while (fetchTimestamps.length > 0 && fetchTimestamps[0] < now - 1000) {
            fetchTimestamps.shift();
          }
          if (fetchTimestamps.length > 50) {
            self.recordViolation('RATE_LIMIT_FETCH', `${fetchTimestamps.length} fetch запросов за секунду`);
            return Promise.reject(new Error('Rate limit exceeded'));
          }
          return origFetch.apply(this, args);
        };
      }

      this.log('🔒 Rate Limiter: активен');
    },

    /* ═══════════════════════════════════════════════════════════════════
       МОДУЛЬ 5: INPUT SANITIZATION
       ═══════════════════════════════════════════════════════════════════ */
    inputSanitization() {
      const self = this;

      document.addEventListener('input', (e) => {
        const el = e.target;
        if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA')) {
          const val = el.value;

          // Проверка длины
          if (val.length > self.config.maxInputLength) {
            el.value = val.substring(0, self.config.maxInputLength);
            self.recordViolation('INPUT_LENGTH', `Ввод обрезан: ${val.length} → ${self.config.maxInputLength}`);
          }

          // Проверка XSS паттернов
          if (self.detectXSS(val)) {
            self.recordViolation('INPUT_XSS', 'XSS паттерн в поле ввода');
            el.value = self.sanitizeString(val);
          }

          // Проверка SQL-injection
          for (const pattern of self.config.sqlPatterns) {
            pattern.lastIndex = 0;
            if (pattern.test(val)) {
              self.recordViolation('INPUT_SQL', 'SQL-injection паттерн в поле ввода');
              el.value = '';
              break;
            }
          }
        }
      }, true);

      // Защита от paste-атак
      document.addEventListener('paste', (e) => {
        const clipText = (e.clipboardData || window.clipboardData)?.getData('text') || '';
        if (self.detectXSS(clipText)) {
          e.preventDefault();
          self.recordViolation('PASTE_XSS', 'XSS-контент при вставке заблокирован');
        }
      }, true);

      this.log('🔒 Input Sanitization: активен');
    },

    /* ═══════════════════════════════════════════════════════════════════
       МОДУЛЬ 6: HONEYPOT SYSTEM
       ═══════════════════════════════════════════════════════════════════ */
    honeypotSystem() {
      const self = this;

      document.querySelectorAll('form').forEach((form) => {
        if (form.querySelector('[data-switch-honeypot]')) return;

        // Создаём скрытые ловушки с заманчивыми именами для ботов (website, fax_number)
        const honeypot = document.createElement('input');
        honeypot.type = 'text';
        honeypot.name = 'website_url_confirm';
        honeypot.setAttribute('data-switch-honeypot', 'true');
        honeypot.setAttribute('tabindex', '-1');
        honeypot.setAttribute('autocomplete', 'off');
        honeypot.style.cssText = 'position:absolute;left:-9999px;top:-9999px;width:0;height:0;opacity:0;pointer-events:none;';
        honeypot.setAttribute('aria-hidden', 'true');

        const faxHoneypot = document.createElement('input');
        faxHoneypot.type = 'text';
        faxHoneypot.name = 'fax_number';
        faxHoneypot.setAttribute('tabindex', '-1');
        faxHoneypot.setAttribute('autocomplete', 'off');
        faxHoneypot.style.cssText = 'position:absolute;left:-9999px;top:-9999px;width:0;height:0;opacity:0;pointer-events:none;';
        faxHoneypot.setAttribute('aria-hidden', 'true');

        form.appendChild(honeypot);
        form.appendChild(faxHoneypot);

        form.addEventListener('submit', (e) => {
          const botCheckInput = form.querySelector('input[name="botcheck"]');
          const isBotChecked = botCheckInput && botCheckInput.checked;

          if (honeypot.value.length > 0 || faxHoneypot.value.length > 0 || isBotChecked) {
            e.preventDefault();
            self.recordViolation('HONEYPOT', 'Зафиксировано автоматическое заполнение ловушки бота');
          }
        });
      });

      this.log('🔒 Honeypot System: активен (расширенная фильтрация)');
    },

    /* ═══════════════════════════════════════════════════════════════════
       МОДУЛЬ 7: CSP ENFORCEMENT (мета-тег)
       ═══════════════════════════════════════════════════════════════════ */
    enforceCSP() {
      // Проверяем, есть ли уже CSP в мета-тегах HTML
      if (document.querySelector('meta[http-equiv="Content-Security-Policy"]')) {
        this.log('✅ CSP уже установлен в HTML, пропущена динамическая генерация');
        return;
      }
      const meta = document.createElement('meta');
      meta.httpEquiv = 'Content-Security-Policy';
      meta.content = [
        "default-src 'self'",
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://fonts.googleapis.com https://fonts.gstatic.com https://www.googletagmanager.com https://www.google-analytics.com https://mc.yandex.ru https://mc.yandex.com https://cdn.jsdelivr.net",
        "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.gstatic.com",
        "img-src 'self' data: https: blob:",
        "font-src 'self' https://fonts.gstatic.com https://fonts.googleapis.com data:",
        "connect-src 'self' https://www.google-analytics.com https://mc.yandex.ru https://mc.yandex.com https://formspree.io https://api.web3forms.com",
        "frame-src 'self' https://www.youtube.com https://youtu.be https://www.google.com/maps",
        "object-src 'none'",
        "base-uri 'self'",
        "form-action 'self' https://formspree.io https://api.web3forms.com",
      ].join('; ');
      document.head.prepend(meta);

      this.log('🔒 CSP Enforcement: активен');
    },

    /* ═══════════════════════════════════════════════════════════════════
       МОДУЛЬ 8: SESSION INTEGRITY
       ═══════════════════════════════════════════════════════════════════ */
    sessionIntegrity() {
      const self = this;

      try {
        let storedFp = sessionStorage.getItem('switch_shield_fp');
        const currentFp = this.generateFingerprint();
        if (!storedFp) {
          sessionStorage.setItem('switch_shield_fp', currentFp);
        } else if (storedFp !== currentFp) {
          this.recordViolation('SESSION_HIJACK', 'Fingerprint сессии изменился');
        }
      } catch (e) { /* storage disabled */ }

      // Защита от tab-napping
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') {
          try {
            const currentFp = self.generateFingerprint();
            const stored = sessionStorage.getItem('switch_shield_fp');
            if (stored && stored !== currentFp) {
              self.recordViolation('TAB_NAPPING', 'Fingerprint изменился при возврате на вкладку');
            }
          } catch (e) { /* */ }
        }
      });

      this.log('🔒 Session Integrity: активен');
    },

    generateFingerprint() {
      const components = [
        navigator.userAgent,
        navigator.language,
        screen.width + 'x' + screen.height,
        screen.colorDepth,
        new Date().getTimezoneOffset(),
        navigator.hardwareConcurrency || 'unknown',
        navigator.platform,
      ];
      // Simple hash
      const str = components.join('|');
      let hash = 0;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash;
      }
      return hash.toString(36);
    },

    /* ═══════════════════════════════════════════════════════════════════
       МОДУЛЬ 9: FORM PROTECTION (CSRF-like + timing)
       ═══════════════════════════════════════════════════════════════════ */
    formProtection() {
      const self = this;

      // Автоматическое заполнение элемента #csrf_token при наличии
      const csrfInput = document.getElementById('csrf_token');
      const sessionToken = self.generateSessionId();
      if (csrfInput) {
        csrfInput.value = sessionToken;
      }

      document.querySelectorAll('form').forEach((form) => {
        // Добавляем CSRF-like токен
        const token = sessionToken.substring(0, 16);
        const hiddenField = document.createElement('input');
        hiddenField.type = 'hidden';
        hiddenField.name = '_switch_token';
        hiddenField.value = token;
        form.appendChild(hiddenField);

        form.addEventListener('submit', (e) => {
          // Проверяем токен
          if (hiddenField.value !== token) {
            e.preventDefault();
            self.recordViolation('FORM_CSRF', 'CSRF-токен формы изменён');
          }
        });
      });
    });

  this.log('🔒 Form Protection: активен');
},

  /* ═══════════════════════════════════════════════════════════════════
     МОДУЛЬ 10: LINK PROTECTION (anti-phishing, anti-redirect)
     ═══════════════════════════════════════════════════════════════════ */
  linkProtection() {
  const self = this;
  const trustedDomains = [
    'switch-studio.ru',
    'google.com',
    'yandex.ru',
    'fonts.googleapis.com',
    'fonts.gstatic.com',
    'formspree.io',
    't.me',
    'vk.com',
    'wa.me',
    'whatsapp.com',
  ];

  document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (!link) return;

    const href = link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('/') || href.startsWith('./') || href.startsWith('mailto:') || href.startsWith('tel:')) return;

    try {
      const url = new URL(href, window.location.origin);

      // Проверка javascript: протокола
      if (url.protocol === 'javascript:') {
        e.preventDefault();
        self.recordViolation('LINK_JAVASCRIPT', 'javascript: ссылка заблокирована');
        return;
      }

      // Проверка data: протокола
      if (url.protocol === 'data:') {
        e.preventDefault();
        self.recordViolation('LINK_DATA', 'data: ссылка заблокирована');
        return;
      }

      // Проверка внешних ссылок — добавляем rel=noopener
      if (url.hostname !== window.location.hostname) {
        link.setAttribute('rel', 'noopener noreferrer');
        link.setAttribute('target', '_blank');
      }
    } catch (err) {
      // Невалидный URL — блокируем
      e.preventDefault();
      self.recordViolation('LINK_INVALID', `Невалидный URL: ${href}`);
    }
  }, true);

  this.log('🔒 Link Protection: активен');
},

/* ═══════════════════════════════════════════════════════════════════
   МОДУЛЬ 11: DOM PROTECTION (Mutation Security)
   ═══════════════════════════════════════════════════════════════════ */
domProtection() {
  const self = this;

  // Белый список разрешённых доменов для iframe
  const allowedIframeDomains = ['youtube.com', 'youtu.be', 'google.com', 'vimeo.com', 'vk.com'];
  const dangerousTags = ['object', 'embed', 'applet', 'base'];

  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === 1) {
          const tag = node.tagName.toLowerCase();
          if (tag === 'iframe') {
            const src = node.getAttribute('src') || '';
            const isAllowed = allowedIframeDomains.some(domain => src.includes(domain));
            if (!isAllowed) {
              node.remove();
              self.recordViolation('DOM_DANGEROUS_TAG', `<iframe src="${src}"> удалён из DOM (не в белом списке)`);
            }
          } else if (dangerousTags.includes(tag)) {
            node.remove();
            self.recordViolation('DOM_DANGEROUS_TAG', `<${tag}> удалён из DOM`);
          }
        }
      });
    });
  });

  observer.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });

  // Защита критических элементов от удаления
  const protectSelectors = ['head', 'body', '.header', '#bg-particles-canvas'];
  const protectObserver = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.removedNodes.forEach((node) => {
        if (node.nodeType === 1) {
          for (const sel of protectSelectors) {
            if (node.matches && node.matches(sel)) {
              self.recordViolation('DOM_CRITICAL_REMOVE', `Попытка удаления критического элемента: ${sel}`);
            }
          }
        }
      });
    });
  });

  protectObserver.observe(document.documentElement, {
    childList: true,
    subtree: true,
  });

  this.log('🔒 DOM Protection: активен');
},

/* ═══════════════════════════════════════════════════════════════════
   МОДУЛЬ 12: URL PROTECTION
   ═══════════════════════════════════════════════════════════════════ */
urlProtection() {
  const url = window.location.href;
  const search = window.location.search;
  const hash = window.location.hash;

  // Проверка URL на XSS
  if (this.detectXSS(decodeURIComponent(url))) {
    this.recordViolation('URL_XSS', 'XSS паттерн в URL');
    window.location.href = 'error.html?code=400&reason=xss';
    return;
  }

  // Проверка path traversal
  for (const pattern of this.config.pathTraversalPatterns) {
    pattern.lastIndex = 0;
    if (pattern.test(url)) {
      this.recordViolation('URL_TRAVERSAL', `Path traversal: ${url}`);
      window.location.href = 'error.html?code=400&reason=traversal';
      return;
    }
  }

  // Проверка SQL injection в параметрах
  if (search) {
    const params = new URLSearchParams(search);
    for (const [key, val] of params) {
      for (const pattern of this.config.sqlPatterns) {
        pattern.lastIndex = 0;
        if (pattern.test(val)) {
          this.recordViolation('URL_SQL', `SQL injection в параметре: ${key}`);
          window.location.href = 'error.html?code=400&reason=sqli';
          return;
        }
      }
    }
  }

  this.log('🔒 URL Protection: активен');
},

/* ═══════════════════════════════════════════════════════════════════
   МОДУЛЬ 13: HEADER PROTECTION (мета-теги безопасности)
   ═══════════════════════════════════════════════════════════════════ */
headerProtection() {
  const heads = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  };

  for (const [name, value] of Object.entries(heads)) {
    if (!document.querySelector(`meta[http-equiv="${name}"]`)) {
      const meta = document.createElement('meta');
      meta.httpEquiv = name;
      meta.content = value;
      document.head.appendChild(meta);
    }
  }

  this.log('🔒 Header Protection: активен (meta-теги)');
},

/* ═══════════════════════════════════════════════════════════════════
   МОДУЛЬ 14: DEVTOOLS DETECTION (опционально)
   ═══════════════════════════════════════════════════════════════════ */
devToolsDetection() {
  const self = this;
  let devToolsOpen = false;

  const threshold = 160;
  const check = () => {
    const widthThreshold = window.outerWidth - window.innerWidth > threshold;
    const heightThreshold = window.outerHeight - window.innerHeight > threshold;
    if (widthThreshold || heightThreshold) {
      if (!devToolsOpen) {
        devToolsOpen = true;
        self.log('🔧 DevTools обнаружены (информационно)', 'warn');
      }
    } else {
      devToolsOpen = false;
    }
  };

  setInterval(check, 2000);
  this.log('🔒 DevTools Detection: активен');
},

/* ═══════════════════════════════════════════════════════════════════
   МОДУЛЬ 15: COPY PROTECTION (опционально)
   ═══════════════════════════════════════════════════════════════════ */
copyProtection() {
  document.addEventListener('copy', (e) => {
    const selectedText = window.getSelection().toString();
    if (selectedText.length > 200) {
      e.clipboardData.setData('text/plain',
        selectedText + '\n\n© SWITCH Web Studio — switch-studio.ru');
      e.preventDefault();
    }
  });

  this.log('🔒 Copy Protection: активен');
},

/* ═══════════════════════════════════════════════════════════════════
   МОДУЛЬ 16: ERROR BOUNDARY (перехват глобальных ошибок)
   ═══════════════════════════════════════════════════════════════════ */
errorBoundary() {
  const self = this;

  window.addEventListener('error', (e) => {
    self.log(`Ошибка: ${e.message} в ${e.filename}:${e.lineno}`, 'error');
  });

  window.addEventListener('unhandledrejection', (e) => {
    self.log(`Unhandled Promise: ${e.reason}`, 'error');
  });

  this.log('🔒 Error Boundary: активен');
},
  };

/* ─── Запуск ─── */
if (SWITCH_SHIELD.checkBlocked()) return;

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => SWITCH_SHIELD.init());
} else {
  SWITCH_SHIELD.init();
}

// Экспорт для отладки (только в dev)
window.__SWITCH_SHIELD = SWITCH_SHIELD;

}) ();

// ===== ГЕНЕРАЦИЯ CSRF-ТОКЕНА =====
(function () {
  const csrfInput = document.getElementById('csrf_token');
  if (csrfInput) {
    csrfInput.value = btoa(Math.random().toString(36).substring(2) + Date.now().toString(36));
  }
})();

// ===== ВАЛИДАЦИЯ ФОРМЫ ПЕРЕД ОТПРАВКОЙ =====
document.addEventListener('DOMContentLoaded', function () {
  const form = document.getElementById('web3forms-contact-form');
  if (form) {
    form.addEventListener('submit', function (e) {
      const name = document.getElementById('form-name');
      const message = document.getElementById('form-message');
      let hasError = false;

      // Проверка имени на HTML-теги
      if (name && (name.value.includes('<') || name.value.includes('>'))) {
        alert('⚠️ Имя не должно содержать HTML-теги');
        hasError = true;
      }

      // Проверка сообщения на опасные символы
      if (message && (message.value.includes('<script') || message.value.includes('onerror'))) {
        alert('⚠️ Сообщение содержит подозрительный код');
        hasError = true;
      }

      if (hasError) {
        e.preventDefault();
      }
    });
  }
});
