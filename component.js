const TEMPLATE_HTML = `
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">

  <style>
    :host {
      --primary-rgb: 138, 43, 226; 
      --secondary-rgb: 42, 171, 238; 
      --cyber-blue-rgb: 153, 50, 204;
      --accent: #8A2BE2;
      --accent-glow: rgba(138, 43, 226, 0.45);
      --accent-glow-intense: rgba(138, 43, 226, 0.85);
      --bg-pure: #050a0f; 
      --bg-card: rgba(12, 18, 28, 0.72);
      --border-glass: rgba(138, 43, 226, 0.15);
      --border-glass-bright: rgba(138, 43, 226, 0.35);
      --heading-dynamic: #ffffff;
      --text-main: #e0f2f1;
      --text-muted: #78909c;
      --text-dark: #455a64;
      --btn-main-bg: #ffffff;
      --btn-main-text: #050a0f;
      --player-shadow: 0 45px 120px -20px rgba(138, 43, 226, 0.25);
      display: block; position: relative; width: 100%; min-height: 100vh;
      background: radial-gradient(circle at 50% 0%, rgba(var(--primary-rgb), 0.12) 0%, transparent 60%), var(--bg-pure);
      color: var(--text-main); font-family: 'Inter', -apple-system, sans-serif; overflow-x: hidden;
      font-size: clamp(14px, 0.8vw + 0.45rem, 22px); box-sizing: border-box;
    }

    :host([data-theme="light"]) {
      --primary-rgb: 123, 31, 162;
      --accent: #7B1FA2;
      --accent-glow: rgba(123, 31, 162, 0.35);
      --bg-pure: #f5f5f7;
      --bg-card: rgba(255, 255, 255, 0.85);
      --border-glass: rgba(0, 0, 0, 0.1);
      --border-glass-bright: rgba(0, 0, 0, 0.25);
      --heading-dynamic: #000000;
      --text-main: #0a0f12;
      --text-muted: #546e7a;
      --text-dark: #90a4ae;
      --btn-main-bg: #091015;
      --btn-main-text: #ffffff;
    }

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    #warpGridCanvas { position: fixed; inset: 0; width: 100vw; height: 100vh; pointer-events: none; z-index: 0; opacity: 0.85; }
    .container { width: min(1500px, 92vw); margin: 0 auto; padding: 0 0 clamp(40px, 6vw, 100px); position: relative; z-index: 10; }
    .nav { height: clamp(64px, 8.5vh, 96px); display: flex; align-items: center; justify-content: space-between; position: relative; z-index: 50; }
    .brand { display: inline-flex; align-items: center; gap: clamp(10px, 1.2vw, 16px); text-decoration: none; }
    .brand-title { font-size: clamp(20px, 2.2vw, 28px); font-weight: 900; letter-spacing: -0.5px; text-transform: uppercase; color: var(--heading-dynamic); transition: color 0.25s ease; }

    .nav-actions { display: flex; align-items: center; gap: clamp(8px, 1vw, 14px); }
    .live-pill-badge { height: clamp(32px, 2.8vw, 40px); padding: 0 clamp(12px, 1.2vw, 16px); display: flex; align-items: center; gap: 6px; background: var(--bg-card); border: 1px solid var(--border-glass); backdrop-filter: blur(16px); border-radius: 100px; color: var(--text-muted); font-size: clamp(10px, 0.8vw, 12px); font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase; }
    .pulsing-live-dot { width: 6px; height: 6px; background: #ff2a2a; border-radius: 50%; box-shadow: 0 0 12px #ff2a2a; animation: liveSignal 1.5s ease-in-out infinite; }
    @keyframes liveSignal { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.35; transform: scale(0.8); } }
    
    .nav-join-btn { height: clamp(32px, 2.8vw, 40px); padding: 0 clamp(16px, 1.5vw, 24px); display: inline-flex; align-items: center; justify-content: center; border-radius: 100px; background: var(--btn-main-bg); color: var(--btn-main-text); text-decoration: none; font-size: clamp(12px, 0.9vw, 14px); font-weight: 700; transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1); }
    .nav-join-btn:hover { background: var(--accent); color: #fff; box-shadow: 0 0 20px var(--accent-glow); transform: translateY(-2px); }

    .hero { position: relative; padding: clamp(20px, 3.5vw, 56px) 0 clamp(14px, 2.2vw, 36px); }
    .hero-tag { display: inline-flex; align-items: center; gap: 10px; color: var(--accent); font-size: clamp(12px, 1.1vw, 15px); font-weight: 800; letter-spacing: 1.5px; text-transform: uppercase; }
    .hero-tag::before { content: ""; width: clamp(20px, 2.2vw, 34px); height: 2px; background: var(--accent); border-radius: 2px; }
    .hero-headline { margin-top: clamp(8px, 1.2vw, 18px); font-size: clamp(40px, 9.2vw, 110px); line-height: 0.9; letter-spacing: -0.04em; font-weight: 900; text-transform: uppercase; }
    .hero-headline .accent-txt { color: var(--accent); background: linear-gradient(135deg, #8A2BE2 0%, #2AABEE 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .hero-details { margin-top: clamp(12px, 1.5vw, 22px); display: flex; align-items: center; flex-wrap: wrap; gap: clamp(6px, 0.9vw, 12px); color: var(--text-muted); font-size: clamp(10px, 0.8vw, 12px); font-weight: 600; letter-spacing: 0.5px; text-transform: uppercase; }
    .hero-details b { color: var(--text-main); font-weight: 700; }
    .meta-separator { width: 3px; height: 3px; border-radius: 50%; background: var(--text-dark); }
    .track-separator-beam { width: 100%; height: 1px; background: linear-gradient(90deg, var(--accent) 0%, var(--border-glass) 45%, transparent 100%); margin-bottom: clamp(14px, 1.6vw, 22px); }

    .player-rig-box { width: 100%; aspect-ratio: 16/9; position: relative; background: #000; overflow: hidden; border-radius: clamp(14px, 1.8vw, 26px); border: 1px solid var(--border-glass-bright); box-shadow: var(--player-shadow); isolation: isolate; transition: transform 0.4s ease; }
    .player-rig-box:hover { transform: translateY(-5px); box-shadow: 0 55px 120px -10px rgba(138, 43, 226, 0.4); }
    .player-rig-box::after { content: ""; position: absolute; left: 0; right: 0; bottom: 0; height: 2px; background: linear-gradient(90deg, transparent, var(--accent), transparent); opacity: 0.9; z-index: 12; pointer-events: none; }
    
    iframe#player { width: 100%; height: 100%; border: none; display: block; position: relative; z-index: 5; border-radius: inherit; }
    .player-rig-box.fs-active { position: fixed !important; inset: 0 !important; width: 100vw !important; height: 100dvh !important; max-width: none !important; max-height: none !important; z-index: 9999999 !important; border-radius: 0 !important; border: none !important; transform: none !important; background: #000 !important; }
    
    .tg-modal-overlay { position: absolute; inset: 0; background: rgba(2, 4, 8, 0.92); backdrop-filter: blur(14px); -webkit-backdrop-filter: blur(14px); z-index: 20; display: flex; justify-content: center; align-items: center; opacity: 0; pointer-events: none; transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1); }
    .tg-modal-overlay.show { opacity: 1; pointer-events: all; }
    .tg-modal-box { background: var(--bg-card); border: 1px solid var(--border-glass-bright); border-radius: 24px; padding: clamp(24px, 4vw, 40px); text-align: center; max-width: 380px; width: 88%; transform: translateY(30px) scale(0.95); transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1); box-shadow: 0 30px 80px rgba(0, 0, 0, 0.8), inset 0 0 30px rgba(138, 43, 226, 0.05); }
    .tg-modal-overlay.show .tg-modal-box { transform: translateY(0) scale(1); }
    .tg-modal-icon { width: 64px; height: 64px; margin: 0 auto 20px; background: rgba(138, 43, 226, 0.1); border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 1px solid rgba(138, 43, 226, 0.2); box-shadow: 0 0 20px rgba(138, 43, 226, 0.2); }
    .tg-modal-icon svg { width: 32px; height: 32px; fill: url(#tg-gradient); }
    .tg-modal-title { font-size: clamp(20px, 2.5vw, 24px); font-weight: 800; color: #fff; margin-bottom: 8px; letter-spacing: -0.02em; }
    .tg-modal-desc { font-size: clamp(13px, 1vw, 15px); color: var(--text-muted); line-height: 1.5; margin-bottom: 24px; }
    .tg-modal-btn-join { display: flex; align-items: center; justify-content: center; gap: 8px; width: 100%; height: 50px; border-radius: 100px; background: linear-gradient(135deg, #8A2BE2 0%, #2AABEE 100%); color: #fff; font-size: 15px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; text-decoration: none; transition: all 0.3s ease; box-shadow: 0 10px 30px rgba(138, 43, 226, 0.3); cursor: pointer; }
    .tg-modal-btn-join:hover { transform: translateY(-2px); box-shadow: 0 15px 40px rgba(138, 43, 226, 0.5); filter: brightness(1.1); }

    .player-meta-bar { display: flex; align-items: center; justify-content: space-between; gap: 14px; padding: clamp(14px, 1.6vw, 22px) 2px 0; flex-wrap: wrap; }
    .stream-title-group { display: flex; flex-direction: column; gap: 4px; }
    .stream-title-group strong { font-size: clamp(16px, 1.35vw, 20px); font-weight: 700; letter-spacing: -0.3px; }
    .stream-title-group span { color: var(--text-muted); font-size: clamp(11px, 0.75vw, 13px); font-weight: 600; text-transform: uppercase; }

    .share-action-btn { height: clamp(38px, 3.2vw, 46px); padding: 0 clamp(18px, 1.8vw, 26px); display: inline-flex; align-items: center; gap: 8px; border-radius: 100px; background: linear-gradient(135deg, var(--bg-card) 0%, rgba(var(--primary-rgb), 0.16) 100%); border: 1px solid var(--accent); color: var(--text-main); font-size: clamp(11px, 0.8vw, 13px); font-weight: 700; text-transform: uppercase; cursor: pointer; backdrop-filter: blur(16px); box-shadow: 0 6px 25px var(--accent-glow); transition: all 0.3s ease; }
    .share-action-btn svg { width: 16px; height: 16px; stroke: var(--accent); stroke-width: 2.2; transition: stroke 0.3s ease; }
    .share-action-btn:hover { background: var(--accent); color: #fff; box-shadow: 0 10px 30px var(--accent-glow-intense); transform: translateY(-2px); }
    .share-action-btn:hover svg { stroke: #fff; }

    .community { margin-top: clamp(48px, 7vw, 110px); position: relative; }
    .community-header { display: flex; align-items: center; justify-content: space-between; padding-bottom: 14px; border-bottom: 1px solid var(--border-glass); }
    .comm-tag { color: var(--accent); font-size: clamp(12px, 1.1vw, 15px); font-weight: 800; letter-spacing: 1px; text-transform: uppercase; }
    .community-body { display: grid; grid-template-columns: 1fr auto; gap: 24px; align-items: end; padding: clamp(24px, 3.5vw, 42px) 0; }
    .comm-heading { font-size: clamp(28px, 4.8vw, 72px); line-height: 0.94; letter-spacing: -0.04em; font-weight: 800; max-width: 720px; }
    .comm-heading span { color: var(--text-dark); }
    
    .comm-btn-prime { height: clamp(44px, 3.8vw, 54px); padding: 0 clamp(22px, 2.2vw, 34px); display: inline-flex; align-items: center; gap: 12px; border-radius: 100px; background: var(--btn-main-bg); color: var(--btn-main-text); text-decoration: none; font-size: clamp(13px, 0.9vw, 15px); font-weight: 800; white-space: nowrap; transition: all 0.3s ease; }
    .comm-btn-prime:hover { background: var(--accent); color: #fff; box-shadow: 0 0 25px var(--accent-glow); transform: translateY(-2px); }

    .footer { margin-top: clamp(44px, 6vw, 80px); border-top: 1px solid var(--border-glass); padding: 20px 0 calc(20px + env(safe-area-inset-bottom)); display: flex; align-items: center; justify-content: space-between; color: var(--text-dark); font-size: clamp(10px, 0.8vw, 12px); font-weight: 600; text-transform: uppercase; }
    .footer strong { color: var(--text-muted); }

    .theme-switch-deck { position: fixed; right: clamp(14px, 2vw, 28px); bottom: clamp(14px, 2vw, 28px); z-index: 900; background: var(--bg-card); border: 1px solid var(--border-glass-bright); border-radius: 100px; backdrop-filter: blur(24px); box-shadow: 0 18px 50px rgba(0, 0, 0, 0.4); padding: 4px; display: flex; align-items: center; gap: 4px; }
    .mode-toggle-btn { height: clamp(28px, 2.2vw, 34px); padding: 0 clamp(10px, 1vw, 14px); display: inline-flex; align-items: center; gap: 6px; border: 0; background: transparent; color: var(--text-muted); font-size: clamp(9px, 0.7vw, 11px); font-weight: 600; text-transform: uppercase; border-radius: 100px; cursor: pointer; transition: all 0.3s ease; }
    .mode-toggle-btn i { width: 6px; height: 6px; border-radius: 50%; background: currentColor; transition: all 0.3s ease; }
    .mode-toggle-btn.active { background: var(--accent); color: #fff; box-shadow: 0 0 15px var(--accent-glow); }
    .mode-toggle-btn.active i { background: #fff; }

    @media (max-width: 680px) {
      .live-pill-badge { display: none; }
      .community-body { grid-template-columns: 1fr; gap: 18px; }
      .comm-btn-prime { width: 100%; justify-content: center; }
      .theme-switch-deck { right: 50%; transform: translateX(50%); bottom: calc(10px + env(safe-area-inset-bottom)); }
      .player-meta-bar { flex-direction: column; align-items: flex-start; }
      .share-action-btn { width: 100%; justify-content: center; }
    }
  </style>
  
  <svg style="width:0;height:0;position:absolute;" aria-hidden="true" focusable="false">
    <linearGradient id="tg-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#8A2BE2" />
      <stop offset="100%" stop-color="#2AABEE" />
    </linearGradient>
  </svg>

  <canvas id="warpGridCanvas"></canvas>
  <div class="container">
    <header class="nav">
      <a class="brand" href="https://t.me/+tZiiKH2HsjwzMzI1" target="_blank" rel="noopener">
        <div class="brand-title">CRICXCRATE</div>
      </a>
      <div class="nav-actions">
        <div class="live-pill-badge"><i class="pulsing-live-dot"></i>ON AIR</div>
        <a class="nav-join-btn" href="https://t.me/+tZiiKH2HsjwzMzI1" target="_blank" rel="noopener">JOIN</a>
      </div>
    </header>

    <section class="hero">
      <div class="hero-tag">LIVE BROADCAST</div>
      <h1 class="hero-headline">FANCODE<br><span class="accent-txt">FEED.</span></h1>
      <div class="hero-details">
        <b>CRICKET HD</b><span class="meta-separator"></span>SECURE PROXY<span class="meta-separator"></span>LIVE NOW
      </div>
    </section>

    <main class="broadcast">
      <div class="track-separator-beam"></div>

      <div class="player-rig-box" id="playerContainer">
        <iframe id="player" allow="autoplay; fullscreen; encrypted-media; picture-in-picture" allowfullscreen="true" webkitallowfullscreen="true" mozallowfullscreen="true"></iframe>
        
        <div class="tg-modal-overlay" id="tgPremiumModal">
          <div class="tg-modal-box">
            <div class="tg-modal-icon">
              <svg viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
            </div>
            <h3 class="tg-modal-title">Free Preview Ended</h3>
            <p class="tg-modal-desc">Join our official Telegram channel to unlock 24-hour uninterrupted access to the premium FanCode feed.</p>
            <div class="tg-modal-btn-join" id="tgJoinModalBtn">UNLOCK STREAM NOW</div>
          </div>
        </div>
      </div>

      <div class="player-meta-bar">
        <div class="stream-title-group">
          <strong>FanCode Match Stream · Live</strong>
          <span>CricxCrate Protected Proxy</span>
        </div>
        <button class="share-action-btn" id="btnShare">
          <svg viewBox="0 0 24 24" fill="none" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="17" x2="17" y2="7"></line><polyline points="7 7 17 7 17 17"></polyline></svg>
          <span id="shareBtnText">SHARE STREAM</span>
        </button>
      </div>
    </main>

    <section class="community">
      <div class="community-header"><div class="comm-tag">CRICXCRATE</div></div>
      <div class="community-body">
        <h2 class="comm-heading">Stay connected.<br><span>Never miss a match.</span></h2>
        <a class="comm-btn-prime" href="https://t.me/+tZiiKH2HsjwzMzI1" target="_blank" rel="noopener">JOIN COMMUNITY</a>
      </div>
    </section>

    <footer class="footer">
      <span>© 2026 <strong>CRICXCRATE</strong></span>
      <span>FANCODE SUITE · SECURE</span>
    </footer>
  </div>

  <aside class="theme-switch-deck">
    <button class="mode-toggle-btn active" id="themeDarkBtn"><i></i> Obsidian</button>
    <button class="mode-toggle-btn" id="themeLightBtn"><i></i> Ceramic</button>
  </aside>
`;
function getIframeContent(proxyUrl) {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <style>
        body, html { margin: 0; padding: 0; width: 100%; height: 100%; background: #000; overflow: hidden; }
        video { width: 100%; height: 100%; object-fit: contain; }
        :root { --plyr-color-main: #8A2BE2; --plyr-video-control-background-hover: rgba(138, 43, 226, 0.2); }
      </style>
      <link rel="stylesheet" href="https://cdn.plyr.io/3.7.8/plyr.css" />
      <script src="https://cdn.jsdelivr.net/npm/hls.js@latest"><\/script>
      <script src="https://cdn.plyr.io/3.7.8/plyr.polyfilled.js"><\/script>
    </head>
    <body>
      <video id="vid" controls crossorigin playsinline muted></video>
      <script>
        document.addEventListener('DOMContentLoaded', () => {
          const video = document.getElementById('vid');
          const source = '${proxyUrl}';
          let playerInstance = null;
          
          function initPlyrAndOrientation() {
            playerInstance = new Plyr(video, { 
              autoplay: true,
              controls: ['play', 'progress', 'current-time', 'mute', 'volume', 'settings', 'fullscreen'],
              settings: ['quality', 'speed'],
              fullscreen: { enabled: true, fallback: true, iosNative: true }
            });
            
            playerInstance.on('playing', () => window.parent.postMessage('cricxcrate-playing', '*'));
            playerInstance.on('enterfullscreen', () => window.parent.postMessage('cricxcrate-fs-enter', '*'));
            playerInstance.on('exitfullscreen', () => window.parent.postMessage('cricxcrate-fs-exit', '*'));
            
            video.play().catch(()=>{});
          }

          window.addEventListener('message', (e) => {
            if (e.data === 'cricxcrate-force-pause' && playerInstance) playerInstance.pause();
            if (e.data === 'cricxcrate-force-play' && playerInstance) playerInstance.play();
          });

          if (Hls.isSupported()) {
            const hls = new Hls({ 
              startLevel: -1, 
              capLevelToPlayerSize: true, 
              autoLevelCapping: -1,
              maxBufferLength: 30, 
              maxMaxBufferLength: 60, 
              maxBufferSize: 60 * 1000 * 1000, 
              liveSyncDurationCount: 3, 
              liveMaxLatencyDurationCount: 10,
              enableWorker: true,
              lowLatencyMode: true, 
              capLevelOnFPSDrop: true 
            });
            
            hls.loadSource(source);
            hls.attachMedia(video);
            
            hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
              initPlyrAndOrientation();
              if(data.levels.length > 1) {
                 const availableQualities = data.levels.map(l => l.height).sort((a, b) => b - a);
                 playerInstance.options.quality = {
                   default: availableQualities[0],
                   options: availableQualities,
                   forced: true,
                   onChange: (e) => { hls.currentLevel = data.levels.findIndex(l => l.height === e); }
                 };
              }
            });
            
            hls.on(Hls.Events.ERROR, function (event, data) {
              if (data.fatal) {
                switch (data.type) {
                  case Hls.ErrorTypes.NETWORK_ERROR:
                    hls.startLoad();
                    break;
                  case Hls.ErrorTypes.MEDIA_ERROR:
                    hls.recoverMediaError();
                    break;
                  default:
                    hls.destroy();
                    break;
                }
              }
            });
          } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            video.addEventListener('loadedmetadata', () => initPlyrAndOrientation());
          }
        });
      <\/script>
    </body>
    </html>
  `;
}
class CricXCrateUI extends HTMLElement {
  static get observedAttributes() {
    return ['stream-url'];
  }

  constructor() {
    super();
    this._shadow = this.attachShadow({ mode: 'closed' });
    this.SENSITIVITY = 2.5;
    this.CONFIG = {
      telegramLink: "https://t.me/+tZiiKH2HsjwzMzI1",
      streamManifest: this.getAttribute('stream-url') || "https://dai-fancode.pages.dev/mumbai/4248312_english_hls_72d930b34b31875_1ta-di_h264/index.m3u8",
      authKey: "cricxcrate"
    };

    this.isStreamUnlocked = false;
    this.lockTimer = null;
    this.PREVIEW_TIME = 10000;
    this.animationFrameId = null;
    this.stars = [];

    this.msgHandler = (e) => {
      if (e.data === 'cricxcrate-fs-enter') {
        const rig = this._shadow.getElementById('playerContainer');
        if (rig) {
          rig.classList.add('fs-active');
          try {
            if (rig.requestFullscreen) rig.requestFullscreen().catch(()=>{});
            else if (rig.webkitRequestFullscreen) rig.webkitRequestFullscreen();
            if (screen.orientation && screen.orientation.lock) screen.orientation.lock('landscape').catch(()=>{});
          } catch(err){}
        }
      } else if (e.data === 'cricxcrate-fs-exit') {
        const rig = this._shadow.getElementById('playerContainer');
        if (rig) {
          rig.classList.remove('fs-active');
          try {
            if (document.fullscreenElement) document.exitFullscreen().catch(()=>{});
            else if (document.webkitFullscreenElement) document.webkitExitFullscreen();
            if (screen.orientation && screen.orientation.unlock) screen.orientation.unlock();
          } catch(err){}
        }
      }

      if (e.data === 'cricxcrate-playing') {
        if (!this.isStreamUnlocked && !this.lockTimer) {
          this.lockTimer = setTimeout(() => this.triggerLock(), this.PREVIEW_TIME);
        }
      }
    };

    this.nativeFsHandler = () => {
       const rig = this._shadow.getElementById('playerContainer');
       if (!document.fullscreenElement && !document.webkitFullscreenElement) {
          if (rig) rig.classList.remove('fs-active');
       }
    };
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'stream-url' && oldValue !== newValue && newValue) {
      this.CONFIG.streamManifest = newValue;
      this.setupIframePlayer();
    }
  }

  async connectedCallback() {
    this.checkUnlockStatus();
    this._shadow.innerHTML = TEMPLATE_HTML;
    this.initWarpField();
    this.initThemeSwitching();
    this.initEventListeners();
    this.setupIframePlayer();

    window.addEventListener('message', this.msgHandler);
    document.addEventListener('fullscreenchange', this.nativeFsHandler);
    document.addEventListener('webkitfullscreenchange', this.nativeFsHandler);
  }

  disconnectedCallback() {
    if (this.animationFrameId) cancelAnimationFrame(this.animationFrameId);
    if (this.lockTimer) clearTimeout(this.lockTimer);
    window.removeEventListener('message', this.msgHandler);
    document.removeEventListener('fullscreenchange', this.nativeFsHandler);
    document.removeEventListener('webkitfullscreenchange', this.nativeFsHandler);
  }

  checkUnlockStatus() {
    const savedTime = localStorage.getItem('cricxcrate_unlocked_time');
    if (savedTime) {
      if (Date.now() - parseInt(savedTime, 10) < 24 * 60 * 60 * 1000) {
        this.isStreamUnlocked = true;
      } else {
        localStorage.removeItem('cricxcrate_unlocked_time');
      }
    }
  }

  triggerLock() {
    const iframe = this._shadow.getElementById('player');
    if (iframe && iframe.contentWindow) iframe.contentWindow.postMessage('cricxcrate-force-pause', '*');
    try {
      if (document.fullscreenElement) document.exitFullscreen().catch(()=>{});
      else if (document.webkitFullscreenElement) document.webkitExitFullscreen();
    } catch(err){}
    this._shadow.getElementById('tgPremiumModal').classList.add('show');
  }

  unlockStream() {
    localStorage.setItem('cricxcrate_unlocked_time', Date.now().toString());
    this.isStreamUnlocked = true;
    this._shadow.getElementById('tgPremiumModal').classList.remove('show');
    window.open(this.CONFIG.telegramLink, '_blank', 'noopener');
    const iframe = this._shadow.getElementById('player');
    if (iframe && iframe.contentWindow) iframe.contentWindow.postMessage('cricxcrate-force-play', '*');
  }
  
  initEventListeners() {
    const btnShare = this._shadow.getElementById("btnShare");
    const shareBtnText = this._shadow.getElementById("shareBtnText");
    const joinModalBtn = this._shadow.getElementById("tgJoinModalBtn");

    joinModalBtn.addEventListener("click", () => this.unlockStream());

    btnShare.addEventListener("click", async () => {
      const shareData = {
        title: "CRICXCRATE — FanCode Live",
        text: "Watch live cricket action on CRICXCRATE!",
        url: window.location.href
      };
      try {
        if (navigator.share && /mobile|android|iphone|ipad|tablet/i.test(navigator.userAgent)) {
          await navigator.share(shareData);
        } else if (navigator.clipboard) {
          await navigator.clipboard.writeText(window.location.href);
          const originalText = shareBtnText.textContent;
          shareBtnText.textContent = "COPIED!";
          setTimeout(() => { shareBtnText.textContent = originalText; }, 1800);
        }
      } catch (err) {}
    });
  }

  setupIframePlayer() {
    const iframe = this._shadow.getElementById('player');
    const rawUrl = this.CONFIG.streamManifest;
    const proxyUrl = `${window.location.origin}/?url=${encodeURIComponent(rawUrl)}&key=${this.CONFIG.authKey}`;
    iframe.srcdoc = getIframeContent(proxyUrl);
  }

  initWarpField() {
    const canvas = this._shadow.getElementById('warpGridCanvas');
    const ctx = canvas.getContext('2d');
    this.stars = [];
    const starCount = Math.min(120, Math.floor(window.innerWidth / 12));
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    window.addEventListener('resize', resize);
    resize();

    for (let i = 0; i < starCount; i++) {
      this.stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        length: (Math.random() * 24 + 10) * this.SENSITIVITY * 0.8,
        speed: (Math.random() * 2.5 + 1.2) * this.SENSITIVITY,
        alpha: Math.random() * 0.5 + 0.15
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.lineWidth = 1.2;
      this.stars.forEach(star => {
        ctx.strokeStyle = `rgba(138, 43, 226, ${star.alpha})`; 
        ctx.beginPath();
        ctx.moveTo(star.x, star.y);
        ctx.lineTo(star.x + star.length, star.y);
        ctx.stroke();
        star.x += star.speed;
        if (star.x > canvas.width) {
          star.x = -star.length;
          star.y = Math.random() * canvas.height;
        }
      });
      this.animationFrameId = requestAnimationFrame(render);
    };
    render();
  }

  initThemeSwitching() {
    const darkBtn = this._shadow.getElementById("themeDarkBtn");
    const lightBtn = this._shadow.getElementById("themeLightBtn");
    const setTheme = (mode) => {
      if (mode === "dark") {
        this.removeAttribute("data-theme");
        darkBtn.classList.add("active");
        lightBtn.classList.remove("active");
      } else {
        this.setAttribute("data-theme", "light");
        lightBtn.classList.add("active");
        darkBtn.classList.remove("active");
      }
    };
    darkBtn.addEventListener("click", () => setTheme("dark"));
    lightBtn.addEventListener("click", () => setTheme("light"));
  }
}

customElements.define('cricxcrate-ui', CricXCrateUI);
