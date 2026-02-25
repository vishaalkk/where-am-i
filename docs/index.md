---
hide:
  - navigation
  - toc
  - feedback
---

<div style="text-align: center; margin-bottom: 20px; margin-top: 20px;">
  <h1 style="font-size: 3rem; margin-bottom: 10px;">WHERE IS VISHAL?</h1>
</div>

<div id="map-container">
  <div id="map"></div>
  
  <button id="start-btn" style="position: absolute; top: 20px; left: 50%; transform: translateX(-50%); z-index: 20; font-size: 1rem; padding: 10px 20px;">
    REPLAY HISTORY ↺
  </button>

  <div class="stats-card">
    <div class="stats-group">
      <div class="stats-label">LOCATION</div>
      <div id="location-stat" class="stats-value">STANDBY</div>
    </div>
    <div class="stats-group">
      <div class="stats-label">DATE</div>
      <div id="date-stat" class="stats-value">----</div>
    </div>
    <div class="stats-group">
      <div class="stats-label">PILOT</div>
      <div style="display: flex; gap: 8px;">
        <button class="pilot-btn" id="btn-cat" onclick="switchPilot('cat')" style="background:none; border:none; cursor:pointer; font-size:1.2rem; padding:0; filter: drop-shadow(0 0 2px #00ff00);">🐱</button>
        <button class="pilot-btn" id="btn-plane" onclick="switchPilot('plane')" style="background:none; border:none; cursor:pointer; font-size:1.2rem; padding:0; opacity:0.5;">✈️</button>
        <button class="pilot-btn" id="btn-ufo" onclick="switchPilot('ufo')" style="background:none; border:none; cursor:pointer; font-size:1.2rem; padding:0; opacity:0.5;">🛸</button>
      </div>
    </div>
    <div class="stats-group">
      <div class="stats-label">VELOCITY</div>
      <input type="range" id="speed-slider" min="1" max="10" value="2" style="width: 80px; accent-color: #00ff00; cursor: pointer;">
    </div>
    <div class="stats-group">
      <div class="stats-label">CONTROLS</div>
      <div style="display: flex; gap: 10px;">
        <button id="prev-btn" style="background:transparent; border:1px solid #00ff00; color:#00ff00; font-family:'Space Mono'; cursor:pointer; font-size:0.8rem;">&lt;&lt;</button>
        <button id="pause-btn" style="background:transparent; border:1px solid #00ff00; color:#00ff00; font-family:'Space Mono'; cursor:pointer; font-size:0.8rem; width: 30px;">||</button>
        <button id="next-btn" style="background:transparent; border:1px solid #00ff00; color:#00ff00; font-family:'Space Mono'; cursor:pointer; font-size:0.8rem;">&gt;&gt;</button>
      </div>
    </div>
    <div class="stats-group">
      <div class="stats-label">FLIGHTS</div>
      <div id="flight-count" class="stats-value">00</div>
    </div>
  </div>
</div>
