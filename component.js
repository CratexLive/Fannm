<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Live Stream</title>
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/shaka-player@latest/dist/controls.css" crossorigin="anonymous">
<script src="https://cdn.jsdelivr.net/npm/shaka-player@latest/dist/shaka-player.ui.js" crossorigin="anonymous"></script>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #000; color: #f5f5f7; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; padding: 16px; }
  
  .container { width: min(1000px, 100vw); display: flex; flex-direction: column; gap: 12px; }
  
  .player-box { width: 100%; aspect-ratio: 16/9; background: #0a0a0c; border-radius: 12px; overflow: hidden; border: 1px solid rgba(255, 255, 255, 0.08); box-shadow: 0 20px 40px rgba(0, 0, 0, 0.6); position: relative; }
  #video { width: 100%; height: 100%; }

  .actions { display: flex; justify-content: flex-end; align-items: center; padding: 0 4px; }
  .share-btn { background: rgba(255, 255, 255, 0.06); border: 1px solid rgba(255, 255, 255, 0.12); color: #f5f5f7; padding: 8px 18px; border-radius: 100px; font-weight: 600; font-size: 13px; cursor: pointer; transition: 0.2s ease; }
  .share-btn:hover { background: rgba(255, 255, 255, 0.12); border-color: rgba(255, 255, 255, 0.25); }

  /* Floating Telegram Button */
  .floating-tg { position: fixed; bottom: 20px; left: 20px; background: rgba(255, 255, 255, 0.08); backdrop-filter: blur(12px); border: 1px solid rgba(255, 255, 255, 0.15); color: #fff; width: 44px; height: 44px; border-radius: 50%; display: flex; align-items: center; justify-content: center; text-decoration: none; box-shadow: 0 10px 25px rgba(0,0,0,0.5); z-index: 900; transition: transform 0.2s ease; }
  .floating-tg:hover { transform: scale(1.08); background: rgba(255, 255, 255, 0.15); }
  .floating-tg svg { width: 20px; height: 20px; fill: #fff; }

  /* Minimal Premium Overlay & Popup */
  #tg-overlay { position: fixed; inset: 0; background: rgba(0, 0, 0, 0.8); backdrop-filter: blur(16px); opacity: 0; pointer-events: none; transition: 0.4s ease; z-index: 998; }
  #tg-overlay.show { opacity: 1; pointer-events: all; }
  
  #tg-popup { position: fixed; left: 50%; top: 50%; transform: translate(-50%, -50%) scale(0.95); width: min(340px, 90vw); background: #121216; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px; padding: 28px 20px; text-align: center; opacity: 0; pointer-events: none; transition: 0.4s cubic-bezier(0.16, 1, 0.3, 1); z-index: 999; box-shadow: 0 25px 50px rgba(0,0,0,0.8); }
  #tg-popup.show { opacity: 1; pointer-events: all; transform: translate(-50%, -50%) scale(1); }
  
  #tg-popup h3 { color: #fff; font-size: 17px; font-weight: 600; margin-bottom: 8px; }
  #tg-popup p { color: #8e8e93; font-size: 13px; margin-bottom: 20px; line-height: 1.4; }
  .popup-join { display: block; background: #fff; color: #000; padding: 11px; border-radius: 100px; text-decoration: none; font-weight: 600; font-size: 13px; margin-bottom: 8px; transition: opacity 0.2s; }
  .popup-join:hover { opacity: 0.9; }
  .popup-close { background: transparent; border: none; color: #8e8e93; padding: 6px 12px; border-radius: 100px; cursor: pointer; font-size: 12px; transition: color 0.2s; }
  .popup-close:hover { color: #fff; }

  #status { position: fixed; bottom: 12px; right: 16px; font-size: 11px; color: rgba(255,255,255,0.4); }
  #status:empty { display: none; }
</style>
</head>
<body>

<div class="container">
  <div class="player-box">
    <div data-shaka-player-container style="width:100%; height:100%;">
      <video autoplay muted playsinline data-shaka-player id="video"></video>
    </div>
  </div>

  <div class="actions">
    <button class="share-btn" id="shareBtn">Share Stream</button>
  </div>
</div>

<!-- Floating Telegram Button -->
<a href="https://t.me/+xSqMXDXp78ZiOWQ1" target="_blank" class="floating-tg" title="Join Telegram">
  <svg viewBox="0 0 24 24"><path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.892-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/></svg>
</a>

<div id="tg-overlay"></div>
<div id="tg-popup">
  <h3>Telegram Channel</h3>
  <p>Join our channel to keep the streams running smoothly and get regular updates.</p>
  <a class="popup-join" href="https://t.me/+xSqMXDXp78ZiOWQ1" target="_blank">Join Now</a>
  <button class="popup-close" id="closePopup">Continue</button>
</div>

<div id="status">Connecting...</div>

<script>
var TG_URL = 'https://t.me/+xSqMXDXp78ZiOWQ1';
var streamUrl = "https://otte.cache.aiv-cdn.net/bom-nitro/live/clients/dash/enc/rhf2dwosdt/out/v1/ee550d2a68d846c797e6ce4de2e8b76d/cenc.mpd";
var streamKeyId = "69a5aa835a061ce64a630d1046727e40";
var streamKeyVal = "d02feac8a999bd06bf4059bf33411749";

function showStatus(txt) { document.getElementById('status').textContent = txt; }

function showPopup() {
  document.getElementById('tg-overlay').classList.add('show');
  document.getElementById('tg-popup').classList.add('show');
}

function hidePopup() {
  document.getElementById('tg-overlay').classList.remove('show');
  document.getElementById('tg-popup').classList.remove('show');
}

async function initPlayer() {
  shaka.polyfill.installAll();
  if (!shaka.Player.isBrowserSupported()) return;

  var video = document.getElementById('video');
  var ui = video.ui;
  var player = ui.getControls().getPlayer();

  var keys = {};
  keys[streamKeyId] = streamKeyVal;

  player.configure({
    streaming: { lowLatencyMode: true, bufferingGoal: 6, rebufferingGoal: 1 },
    drm: { clearKeys: keys, preferredKeySystems: ['org.w3.clearkey'] }
  });

  try {
    await player.load(streamUrl);
    if (player.isLive()) player.seek(player.seekRange().end);
    showStatus('');
  } catch (e) {
    showStatus('Load failed');
  }
}

document.getElementById('shareBtn').onclick = async function() {
  var url = window.location.href;
  var text = "Live Stream\n" + url;
  try {
    if (navigator.share) {
      await navigator.share({ title: "Stream", text: text, url: url });
    } else if (navigator.clipboard) {
      await navigator.clipboard.writeText(text);
      var btn = document.getElementById('shareBtn');
      btn.textContent = "Copied!";
      setTimeout(() => btn.textContent = "Share Stream", 1500);
    }
  } catch(e) {}
};

document.getElementById('closePopup').onclick = hidePopup;
document.getElementById('tg-overlay').onclick = hidePopup;

document.addEventListener('shaka-ui-loaded', initPlayer);
window.onload = function() { setTimeout(showPopup, 500); };
</script>
</body>
</html>
