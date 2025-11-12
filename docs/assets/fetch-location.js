document.addEventListener('DOMContentLoaded', function () {
    // ← these lat/lon are just examples
    const lat = 51.509865;
    const lon = -0.118092;
  
    // This must match your <div id="map">
    const map = L.map('map').setView([lat, lon], 13);
  
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);
  
    L.marker([lat, lon]).addTo(map)
      .bindPopup('You are here.')
      .openPopup();
  });
  
