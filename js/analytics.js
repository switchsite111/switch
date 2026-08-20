/**
 * SWITCH Web Studio — Visitor Analytics & Real-Time Tracking Engine
 * Exclusive Client-Side Analytics System
 */

(function (window) {
  'use strict';

  const STORAGE_KEY_SESSIONS = 'switch_analytics_sessions';
  const STORAGE_KEY_VISITOR_ID = 'switch_visitor_id';
  const STORAGE_KEY_SETTINGS = 'switch_admin_settings';

  class SwitchAnalyticsEngine {
    constructor() {
      this.visitorId = this.getOrCreateVisitorId();
      this.sessionId = 'sess_' + Math.random().toString(36).substring(2, 11) + '_' + Date.now();
      this.startTime = Date.now();
      this.currentSession = null;
      this.heartbeatTimer = null;
      this.ipData = null;

      this.init();
    }

    getOrCreateVisitorId() {
      let id = localStorage.getItem(STORAGE_KEY_VISITOR_ID);
      if (!id) {
        id = 'vis_' + Math.random().toString(36).substring(2, 15) + '_' + Date.now();
        localStorage.setItem(STORAGE_KEY_VISITOR_ID, id);
      }
      return id;
    }

    detectDevice() {
      const ua = navigator.userAgent;
      if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
        return { type: 'Планшет', icon: 'tablet' };
      }
      if (/Mobile|iP(hone|od)|Android|BlackBerry|IEMobile|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(ua)) {
        return { type: 'Мобильный', icon: 'smartphone' };
      }
      return { type: 'Компьютер', icon: 'monitor' };
    }

    detectOS() {
      const ua = navigator.userAgent;
      if (ua.indexOf('Win') !== -1) return 'Windows';
      if (ua.indexOf('Mac') !== -1) return 'macOS';
      if (ua.indexOf('Linux') !== -1) return 'Linux';
      if (ua.indexOf('Android') !== -1) return 'Android';
      if (ua.indexOf('like Mac') !== -1) return 'iOS';
      return 'Неизвестно';
    }

    detectBrowser() {
      const ua = navigator.userAgent;
      if (ua.indexOf('Edg') !== -1) return 'Microsoft Edge';
      if (ua.indexOf('Chrome') !== -1) return 'Google Chrome';
      if (ua.indexOf('Firefox') !== -1) return 'Mozilla Firefox';
      if (ua.indexOf('Safari') !== -1 && ua.indexOf('Chrome') === -1) return 'Apple Safari';
      if (ua.indexOf('OPR') !== -1 || ua.indexOf('Opera') !== -1) return 'Opera';
      return 'Браузер';
    }

    getReferrer() {
      const ref = document.referrer;
      if (!ref) return 'Прямой заход';
      try {
        const url = new URL(ref);
        if (url.hostname === window.location.hostname) return 'Внутренний переход';
        return url.hostname;
      } catch (e) {
        return ref;
      }
    }

    async init() {
      const device = this.detectDevice();
      const os = this.detectOS();
      const browser = this.detectBrowser();
      const referrer = this.getReferrer();

      this.currentSession = {
        sessionId: this.sessionId,
        visitorId: this.visitorId,
        ip: 'Загрузка...',
        city: 'Определение...',
        country: 'Определение...',
        countryCode: '--',
        device: device.type,
        deviceIcon: device.icon,
        os: os,
        browser: browser,
        screen: `${window.innerWidth}x${window.innerHeight}`,
        referrer: referrer,
        entryTime: new Date().toISOString(),
        lastActive: new Date().toISOString(),
        durationSeconds: 0,
        pagesVisited: [window.location.hash || 'Главная страница'],
        isOnline: true
      };

      // Save initial session
      this.saveSession(this.currentSession);

      // Fetch Geolocation/IP asynchronously
      this.fetchGeoIP();

      // Track hash & section navigation
      window.addEventListener('hashchange', () => {
        const currentHash = window.location.hash || 'Главная страница';
        if (!this.currentSession.pagesVisited.includes(currentHash)) {
          this.currentSession.pagesVisited.push(currentHash);
        }
        this.updateHeartbeat();
      });

      // Track click interaction to update last active
      window.addEventListener('click', () => this.updateHeartbeat());
      window.addEventListener('scroll', () => this.updateHeartbeat(), { passive: true });

      // Start Heartbeat interval every 10 seconds
      this.heartbeatTimer = setInterval(() => {
        this.updateHeartbeat();
      }, 10000);

      // Unload handler
      window.addEventListener('beforeunload', () => {
        if (this.currentSession) {
          this.currentSession.isOnline = false;
          this.saveSession(this.currentSession);
        }
      });
    }

    async fetchGeoIP() {
      try {
        const response = await fetch('https://ipapi.co/json/', { cache: 'no-cache' });
        if (response.ok) {
          const data = await response.json();
          if (data && data.ip) {
            this.currentSession.ip = data.ip;
            this.currentSession.city = data.city || 'Неизвестно';
            this.currentSession.country = data.country_name || 'Неизвестно';
            this.currentSession.countryCode = data.country_code || 'RU';
            this.saveSession(this.currentSession);
          }
        }
      } catch (err) {
        // Fallback option 2
        try {
          const res2 = await fetch('https://api.ipify.org?format=json');
          if (res2.ok) {
            const d2 = await res2.json();
            if (d2.ip) {
              this.currentSession.ip = d2.ip;
              this.saveSession(this.currentSession);
            }
          }
        } catch (e) {
          // Graceful fallback
        }
      }
    }

    updateHeartbeat() {
      if (!this.currentSession) return;
      const now = Date.now();
      this.currentSession.durationSeconds = Math.floor((now - this.startTime) / 1000);
      this.currentSession.lastActive = new Date().toISOString();
      this.currentSession.isOnline = true;
      this.saveSession(this.currentSession);
    }

    getSessions() {
      try {
        const stored = localStorage.getItem(STORAGE_KEY_SESSIONS);
        let sessions = stored ? JSON.parse(stored) : [];
        const cutoff = Date.now() - 45000; // 45 seconds timeout for online status

        sessions = sessions.map(s => {
          if (s.sessionId === this.sessionId) {
            return this.currentSession;
          }
          const lastActiveTime = new Date(s.lastActive).getTime();
          s.isOnline = (Date.now() - lastActiveTime) < 45000;
          return s;
        });

        return sessions.sort((a, b) => new Date(b.lastActive) - new Date(a.lastActive));
      } catch (e) {
        return [this.currentSession];
      }
    }

    saveSession(session) {
      try {
        let sessions = [];
        const stored = localStorage.getItem(STORAGE_KEY_SESSIONS);
        if (stored) {
          sessions = JSON.parse(stored);
        }

        const index = sessions.findIndex(s => s.sessionId === session.sessionId);
        if (index !== -1) {
          sessions[index] = session;
        } else {
          sessions.unshift(session);
        }

        // Keep maximum 250 records
        if (sessions.length > 250) {
          sessions = sessions.slice(0, 250);
        }

        localStorage.setItem(STORAGE_KEY_SESSIONS, JSON.stringify(sessions));
      } catch (e) {
        console.warn('Analytics session save error:', e);
      }
    }

    getStats() {
      const sessions = this.getSessions();
      const now = Date.now();
      const uniqueVisitors = new Set(sessions.map(s => s.visitorId)).size;
      const onlineVisitors = sessions.filter(s => s.isOnline).length;

      let totalDuration = 0;
      const deviceCounts = {};
      const countryCounts = {};
      const referrerCounts = {};

      sessions.forEach(s => {
        totalDuration += s.durationSeconds || 0;
        
        const dev = s.device || 'Компьютер';
        deviceCounts[dev] = (deviceCounts[dev] || 0) + 1;

        const country = s.country || 'Россия';
        countryCounts[country] = (countryCounts[country] || 0) + 1;

        const ref = s.referrer || 'Прямой заход';
        referrerCounts[ref] = (referrerCounts[ref] || 0) + 1;
      });

      const avgDurationSec = sessions.length > 0 ? Math.round(totalDuration / sessions.length) : 0;

      return {
        totalVisits: sessions.length,
        uniqueVisitors: uniqueVisitors,
        onlineCount: onlineVisitors,
        avgDurationSec: avgDurationSec,
        deviceCounts: deviceCounts,
        countryCounts: countryCounts,
        referrerCounts: referrerCounts,
        sessions: sessions
      };
    }

    clearData() {
      localStorage.removeItem(STORAGE_KEY_SESSIONS);
      this.init();
    }

    simulateVisitor() {
      const cities = [
        { city: 'Санкт-Петербург', country: 'Россия', code: 'RU', ip: '188.170.81.' },
        { city: 'Алматы', country: 'Казахстан', code: 'KZ', ip: '2.75.149.' },
        { city: 'Минск', country: 'Беларусь', code: 'BY', ip: '37.214.42.' },
        { city: 'Москва', country: 'Россия', code: 'RU', ip: '95.24.112.' },
        { city: 'Екатеринбург', country: 'Россия', code: 'RU', ip: '5.140.78.' },
        { city: 'Ташкент', country: 'Узбекистан', code: 'UZ', ip: '84.54.80.' }
      ];
      const devices = [
        { type: 'Мобильный', icon: 'smartphone', browser: 'Apple Safari', os: 'iOS' },
        { type: 'Компьютер', icon: 'monitor', browser: 'Google Chrome', os: 'Windows' },
        { type: 'Компьютер', icon: 'monitor', browser: 'Mozilla Firefox', os: 'macOS' },
        { type: 'Планшет', icon: 'tablet', browser: 'Google Chrome', os: 'Android' }
      ];
      const pages = ['#services', '#calculator', '#portfolio', '#contact', '#about'];
      const referrers = ['yandex.ru', 'google.com', 't.me/switch_design', 'Прямой заход', 'vk.com'];

      const randomCity = cities[Math.floor(Math.random() * cities.length)];
      const randomDevice = devices[Math.floor(Math.random() * devices.length)];
      const randomRef = referrers[Math.floor(Math.random() * referrers.length)];
      const randomPage = pages[Math.floor(Math.random() * pages.length)];

      const fakeSessionId = 'sess_sim_' + Math.random().toString(36).substring(2, 9) + '_' + Date.now();
      const fakeVisitorId = 'vis_sim_' + Math.random().toString(36).substring(2, 9);
      const fakeIp = randomCity.ip + Math.floor(Math.random() * 254 + 1);

      const fakeSession = {
        sessionId: fakeSessionId,
        visitorId: fakeVisitorId,
        ip: fakeIp,
        city: randomCity.city,
        country: randomCity.country,
        countryCode: randomCity.code,
        device: randomDevice.type,
        deviceIcon: randomDevice.icon,
        os: randomDevice.os,
        browser: randomDevice.browser,
        screen: randomDevice.type === 'Мобильный' ? '390x844' : '1920x1080',
        referrer: randomRef,
        entryTime: new Date(Date.now() - Math.floor(Math.random() * 600000)).toISOString(),
        lastActive: new Date().toISOString(),
        durationSeconds: Math.floor(Math.random() * 240 + 15),
        pagesVisited: ['Главная страница', randomPage],
        isOnline: true
      };

      this.saveSession(fakeSession);
      return fakeSession;
    }

    exportData(format = 'json') {
      const sessions = this.getSessions();
      let blob, filename;

      if (format === 'csv') {
        let csvContent = 'SessionID,VisitorID,IP,City,Country,Device,OS,Browser,Referrer,EntryTime,DurationSec,OnlineStatus\n';
        sessions.forEach(s => {
          const row = [
            `"${s.sessionId}"`,
            `"${s.visitorId}"`,
            `"${s.ip}"`,
            `"${s.city}"`,
            `"${s.country}"`,
            `"${s.device}"`,
            `"${s.os}"`,
            `"${s.browser}"`,
            `"${s.referrer}"`,
            `"${s.entryTime}"`,
            s.durationSeconds,
            s.isOnline ? 'Online' : 'Offline'
          ];
          csvContent += row.join(',') + '\n';
        });
        blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
        filename = `switch_analytics_${new Date().toISOString().slice(0, 10)}.csv`;
      } else {
        const jsonContent = JSON.stringify(sessions, null, 2);
        blob = new Blob([jsonContent], { type: 'application/json' });
        filename = `switch_analytics_${new Date().toISOString().slice(0, 10)}.json`;
      }

      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  // Export instance to global window
  window.SwitchAnalytics = new SwitchAnalyticsEngine();

})(window);
