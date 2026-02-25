mapboxgl.accessToken = 'pk.eyJ1IjoidmlzaGtrIiwiYSI6ImNrbDFqeHl5MDBuZ2Eyd3BkYjc3ZjA1ZTIifQ.OWMuggD5niOsp8LW2MPqlQ';

document.addEventListener('DOMContentLoaded', async function () {
    const mapContainer = 'map';
    const travelDataUrl = 'assets/travels.json';
    const startBtn = document.getElementById('start-btn');
    const locationStat = document.getElementById('location-stat');
    const dateStat = document.getElementById('date-stat');
    const flightCountStat = document.getElementById('flight-count');
    
    let mapLoaded = false;
    let travels = [];

    // 1. Initialize Mapbox GL Map - 2D FLAT MODE
    const map = new mapboxgl.Map({
        container: mapContainer,
        style: 'mapbox://styles/mapbox/dark-v11', 
        center: [0, 20],
        zoom: 1.5,
        projection: 'mercator', // Classic Flat 2D Map
        pitch: 0, // No tilt
        bearing: 0,
        antialias: false, // 2D rendering is simpler
        interactive: true
    });

    // CUSTOM STYLE: 2D RETRO
    map.on('style.load', () => {
        // No fog/atmosphere for 2D

        // 1. Water: Pitch Black
        if (map.getLayer('water')) {
            map.setPaintProperty('water', 'fill-color', '#000000');
        }

        // 2. Land: Very Dark Grey
        if (map.getLayer('background')) {
            map.setPaintProperty('background', 'background-color', '#0a0a0a');
        }
        
        // 3. Admin Boundaries: Neon Green Grid
        const layers = map.getStyle().layers;
        for (const layer of layers) {
            if (layer.id.includes('boundary') || layer.id.includes('admin')) {
                map.setPaintProperty(layer.id, 'line-color', '#00ff00'); 
                map.setPaintProperty(layer.id, 'line-width', 0.5); // Thinner lines for crisp look
                map.setPaintProperty(layer.id, 'line-opacity', 1);
            }
            // Hide noise
            if (layer.id.includes('road') || layer.id.includes('street') || layer.id.includes('building') || layer.id.includes('poi')) {
                map.setLayoutProperty(layer.id, 'visibility', 'none');
            }
            // Hide most labels
            if (layer.id.includes('label')) {
                map.setLayoutProperty(layer.id, 'visibility', 'none');
            }
        }
    });

    // 2. Load Travel Data
    try {
        const response = await fetch(travelDataUrl);
        travels = await response.json();
    } catch (error) {
        console.error('Error loading travel data:', error);
        locationStat.innerText = "Error Loading Data";
    }

    // 3. Setup Map Layers
    map.on('load', async () => {
        mapLoaded = true;
        if (travels.length === 0) return;

        // ----------------- LOAD ICONS -----------------
        const catSvg = `<svg width="60" height="40" viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg">
            <!-- BODY -->
            <rect x="10" y="10" width="40" height="25" fill="#ff99cc" stroke="#000" stroke-width="2"/>
            <!-- SPRINKLES -->
            <circle cx="15" cy="15" r="1.5" fill="#FF0000"/>
            <circle cx="25" cy="15" r="1.5" fill="#FF0000"/>
            <circle cx="35" cy="18" r="1.5" fill="#FF0000"/>
            <circle cx="20" cy="25" r="1.5" fill="#FF0000"/>
            <circle cx="30" cy="22" r="1.5" fill="#FF0000"/>
            <!-- HEAD -->
            <rect x="40" y="5" width="20" height="20" fill="#999999" stroke="#000" stroke-width="2"/>
            <polygon points="42,5 45,0 48,5" fill="#999999" stroke="#000" stroke-width="1"/>
            <polygon points="52,5 55,0 58,5" fill="#999999" stroke="#000" stroke-width="1"/>
            <rect x="45" y="10" width="4" height="4" fill="#000"/>
            <rect x="53" y="10" width="4" height="4" fill="#000"/>
            <path d="M10 20 Q 0 15 5 25" stroke="#999999" stroke-width="3" fill="none"/>
            <rect x="15" y="35" width="4" height="5" fill="#999999"/>
            <rect x="35" y="35" width="4" height="5" fill="#999999"/>
        </svg>`;
        
        const paperPlaneSvg = `<svg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"><path d="M10 50 L50 30 L10 10 L20 30 Z" fill="none" stroke="#ffffff" stroke-width="3" stroke-linejoin="round"/><path d="M20 30 L50 30" stroke="#ffffff" stroke-width="2"/></svg>`;
        
        const ufoSvg = `<svg width="60" height="40" viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg"><ellipse cx="30" cy="20" rx="25" ry="10" fill="#55ff55" stroke="#00ff00" stroke-width="2"/><ellipse cx="30" cy="15" rx="12" ry="8" fill="#aaffaa" stroke="#00ff00" stroke-width="1"/><circle cx="15" cy="20" r="2" fill="#ffff00"/><circle cx="30" cy="25" r="2" fill="#ffff00"/><circle cx="45" cy="20" r="2" fill="#ffff00"/></svg>`;

        const loadIcon = (name, svg, w, h) => {
            const img = new Image(w, h);
            img.onload = () => { if (!map.hasImage(name)) map.addImage(name, img, { sdf: false }); };
            img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg);
        };

        loadIcon('cat', catSvg, 60, 40);
        loadIcon('plane', paperPlaneSvg, 60, 60);
        loadIcon('ufo', ufoSvg, 60, 40);

        // Add Route Source
        map.addSource('route', {
            'type': 'geojson',
            'data': {
                'type': 'FeatureCollection',
                'features': []
            }
        });

        // Route Line Layer (NYAN TRAIL)
        map.addLayer({
            'id': 'route',
            'type': 'line',
            'source': 'route',
            'layout': {
                'line-join': 'round',
                'line-cap': 'round' 
            },
            'paint': {
                'line-color': ['get', 'color'], 
                'line-width': 3, 
                'line-dasharray': [1, 0], 
                'line-opacity': 0.8
            }
        });

        // Add Plane Source
        map.addSource('plane', {
            'type': 'geojson',
            'data': {
                'type': 'FeatureCollection',
                'features': []
            }
        });

        // Plane Icon Layer
        map.addLayer({
            'id': 'plane',
            'type': 'symbol',
            'source': 'plane',
            'layout': {
                'icon-image': 'cat', // Default to cat
                'icon-size': 0.6,
                'icon-rotate': ['get', 'bearing'],
                'icon-rotation-alignment': 'map',
                'icon-allow-overlap': true,
                'icon-ignore-placement': true
            },
            'paint': {
                'icon-opacity': 1
            }
        });

        // Create GeoJSON for Cities
        const cityFeatures = travels.map(trip => ({
            'type': 'Feature',
            'geometry': {
                'type': 'Point',
                'coordinates': trip.coordinates
            },
            'properties': {
                'title': trip.location,
                'description': trip.date,
                'type': trip.location.includes("Home") ? 'home' : 'trip'
            }
        }));

        const citiesGeoJSON = {
            'type': 'FeatureCollection',
            'features': cityFeatures
        };

        map.addSource('cities', {
            'type': 'geojson',
            'data': citiesGeoJSON
        });

        // Add Cities Layer (Circles)
        map.addLayer({
            'id': 'cities-layer',
            'type': 'circle',
            'source': 'cities',
            'paint': {
                'circle-radius': [
                    'match',
                    ['get', 'type'],
                    'home', 6, // Home radius
                    5 // Trip radius
                ],
                'circle-color': [
                    'match',
                    ['get', 'type'],
                    'home', '#ffffff', // Home color (White)
                    '#00ff00' // Trip color (Green)
                ],
                'circle-stroke-width': 1,
                'circle-stroke-color': '#000000',
                // Add a glow?
                'circle-blur': 0.2
            }
        });

        // Add Popup on Click (Interactive Layer)
        map.on('click', 'cities-layer', (e) => {
            const coordinates = e.features[0].geometry.coordinates.slice();
            const description = e.features[0].properties.description;
            const title = e.features[0].properties.title;

            new mapboxgl.Popup({ className: 'dark-popup' })
                .setLngLat(coordinates)
                .setHTML(`<strong>${title}</strong><br>${description}`)
                .addTo(map);
        });

        // Change cursor on hover
        map.on('mouseenter', 'cities-layer', () => {
            map.getCanvas().style.cursor = 'pointer';
        });
        map.on('mouseleave', 'cities-layer', () => {
            map.getCanvas().style.cursor = '';
        });

        // Ensure Plane is on TOP
        if (map.getLayer('plane')) {
            map.moveLayer('plane'); 
        }

        // Initial Position: JUMP TO CURRENT LOCATION (Last Entry)
        if(travels.length > 0) {
            const currentLoc = travels[travels.length - 1];
            
            // Stats Update
            locationStat.innerText = currentLoc.location.split(',')[0].toUpperCase();
            dateStat.innerText = "PRESENT";
            flightCountStat.innerText = travels.length.toString().padStart(2, '0');
            
            // Map Jump
            map.jumpTo({ center: currentLoc.coordinates, zoom: 4 });

            // Place Cat at Current Location
            map.getSource('plane').setData({
                'type': 'FeatureCollection',
                'features': [{
                    'type': 'Feature',
                    'geometry': {
                        'type': 'Point',
                        'coordinates': currentLoc.coordinates
                    },
                    'properties': {
                        'bearing': 0 // Face North/Default
                    }
                }]
            });
        }
    });

    // 4. Animation Logic
    let animationFrameId;
    let timeoutId;
    let currentSegmentIndex = 0;
    let isPlaying = false;
    let autoPlay = false; 
    let isPaused = false; 
    let flightHistory = {}; 
    let currentPilot = "cat";

    // Pilot Switcher
    window.switchPilot = (type) => {
        currentPilot = type;
        // Update UI
        ['cat', 'plane', 'ufo'].forEach(p => {
            const btn = document.getElementById(`btn-${p}`);
            if (p === type) {
                btn.style.opacity = '1';
                btn.style.filter = 'drop-shadow(0 0 2px #00ff00)';
            } else {
                btn.style.opacity = '0.5';
                btn.style.filter = 'none';
            }
        });
        
        // Update Icon immediately
        if (map.getLayer('plane')) {
            map.setLayoutProperty('plane', 'icon-image', type);
        }
    };

    // Helper to stop everything
    function stopAnimation() {
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        if (timeoutId) clearTimeout(timeoutId);
        isPlaying = false;
        isPaused = false;
        if (pauseBtn) pauseBtn.innerText = "||";
    }

    startBtn.addEventListener('click', () => {
        if (!mapLoaded || travels.length < 2) return;
        
        const startLoc = travels[0];
        map.jumpTo({ center: startLoc.coordinates, zoom: 3 });
        
        locationStat.innerText = "RESETTING...";
        dateStat.innerText = "----";
        
        // Reset Cat/Pilot
        map.getSource('plane').setData({
            'type': 'FeatureCollection',
            'features': [{
                'type': 'Feature',
                'geometry': {
                    'type': 'Point',
                    'coordinates': startLoc.coordinates
                },
                'properties': { 'bearing': 90 }
            }]
        });

        // Clear Route
        map.getSource('route').setData({
            'type': 'FeatureCollection',
            'features': []
        });
        
        startBtn.style.opacity = '0'; 
        startBtn.style.pointerEvents = 'none'; 
        
        autoPlay = true;
        isPaused = false;
        flightHistory = {}; 
        window.historyFeatures = []; 
        currentSegmentIndex = 0;
        setTimeout(playNextSegment, 1000);
    });

    // Control Buttons
    const nextBtn = document.getElementById('next-btn');
    const prevBtn = document.getElementById('prev-btn');
    const pauseBtn = document.getElementById('pause-btn');

    pauseBtn.addEventListener('click', () => {
        isPaused = !isPaused;
        pauseBtn.innerText = isPaused ? "|>" : "||";
    });

    nextBtn.addEventListener('click', () => {
        autoPlay = false; 
        isPaused = false;
        pauseBtn.innerText = "||";
        
        if (isPlaying) {
            skipCurrent = true;
        } else {
            if (currentSegmentIndex < travels.length - 1) {
                currentSegmentIndex++;
                playNextSegment();
            }
        }
    });

    prevBtn.addEventListener('click', () => {
        autoPlay = false; 
        stopAnimation();
        
        if (currentSegmentIndex > 0) {
            currentSegmentIndex--;
            playNextSegment(); 
        }
    });

    let skipCurrent = false;

    async function playNextSegment() {
        stopAnimation(); 
        isPlaying = true;
        skipCurrent = false;
        isPaused = false; 
        if (pauseBtn) pauseBtn.innerText = "||";

        if (currentSegmentIndex >= travels.length - 1) {
            startBtn.style.opacity = '1';
            startBtn.style.pointerEvents = 'all';
            startBtn.innerText = 'REPLAY HISTORY ↺';
            locationStat.innerText = "COMPLETE";
            isPlaying = false;
            return;
        }

        const start = travels[currentSegmentIndex];
        const end = travels[currentSegmentIndex + 1];
        
        locationStat.innerText = end.location.split(',')[0].toUpperCase();
        dateStat.innerText = end.date ? end.date.split(' - ')[0] : '...';
        flightCountStat.innerText = (currentSegmentIndex + 1).toString().padStart(2, '0');

        // ----------------- PILOT CONFIG -----------------
        let segmentColor;
        
        if (currentPilot === 'cat') {
            const catNeon = ['#ff00ff', '#ff00aa', '#ff99cc', '#ad00ff', '#ffaa00', '#ff0055', '#cc00ff'];
            segmentColor = catNeon[Math.floor(Math.random() * catNeon.length)];
        } else if (currentPilot === 'plane') {
            const planeColors = ['#ffffff', '#00ffff', '#aaffff', '#cccccc', '#00ccff', '#88ffff', '#e0f7fa'];
            segmentColor = planeColors[Math.floor(Math.random() * planeColors.length)];
        } else if (currentPilot === 'ufo') {
            const ufoColors = ['#00ff00', '#ccff00', '#ffff00', '#55ff55', '#33ff33', '#99ff00', '#eeff41'];
            segmentColor = ufoColors[Math.floor(Math.random() * ufoColors.length)];
        }

        // Toggle Layer Style Global
        if (currentPilot === 'plane') {
            map.setPaintProperty('route', 'line-dasharray', [2, 2]);
        } else {
            map.setPaintProperty('route', 'line-dasharray', [1, 0]);
        }

        // 1. Calculate Path
        const startLng = start.coordinates[0];
        const startLat = start.coordinates[1];
        const endLng = end.coordinates[0];
        const endLat = end.coordinates[1];
        
        const routeKey = [startLng, startLat, endLng, endLat].sort().join('|');
        const flightCount = flightHistory[routeKey] || 0;
        flightHistory[routeKey] = flightCount + 1;
        
        // Curve Logic (Only for Cat)
        let curveMagnitude = 0;
        if (currentPilot === 'cat') {
            curveMagnitude = (flightCount === 0) ? 0 : (Math.ceil(flightCount / 2) * (flightCount % 2 === 0 ? -1 : 1)) * 5.0; 
        }
        
        const arcCoords = [];
        const steps = 200; 

        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const lng = startLng + (endLng - startLng) * t;
            let lat = startLat + (endLat - startLat) * t;
            
            // Add Curve
            if (currentPilot === 'cat') {
                lat += Math.sin(t * Math.PI) * curveMagnitude;
            } 
            // Add Jitter (UFO)
            else if (currentPilot === 'ufo') {
                lat += (Math.random() - 0.5) * 0.5; // Random shake
            }
            
            arcCoords.push([lng, lat]);
        }
        
        // Animate Camera
        map.easeTo({
            center: end.coordinates,
            zoom: 2, 
            duration: 2000, 
            easing: (t) => t * (2 - t), 
            essential: true
        });

        // Ensure correct icon is set
        map.setLayoutProperty('plane', 'icon-image', currentPilot);

        let frameIndex = 0;
        const speedSlider = document.getElementById('speed-slider');

        function frame() {
            if (!isPlaying) return; 

            if (isPaused) {
                animationFrameId = requestAnimationFrame(frame);
                return;
            }

            const speedVal = parseInt(speedSlider.value); 
            const speedFactor = skipCurrent ? 1000 : speedVal; 

            if (frameIndex < arcCoords.length) {
                const currentCoord = arcCoords[frameIndex];
                
                // Dynamic Bearing
                let catRotation;
                if (currentPilot === 'ufo') {
                    catRotation = frameIndex * 10; // Spin
                } else {
                    const nextP = arcCoords[Math.min(frameIndex + 5, arcCoords.length - 1)];
                    const currentBearing = turf.rhumbBearing(turf.point(currentCoord), turf.point(nextP));
                    // Paper Plane SVG points Up-Right (45 deg) -> Offset -45.
                    // Cat SVG points Right (90 deg) -> Offset -90.
                    const offset = (currentPilot === 'plane') ? -45 : -90;
                    catRotation = currentBearing + offset;
                }

                // Update Plane
                map.getSource('plane').setData({
                    'type': 'FeatureCollection',
                    'features': [{
                        'type': 'Feature',
                        'geometry': {
                            'type': 'Point',
                            'coordinates': currentCoord
                        },
                        'properties': { 'bearing': catRotation }
                    }]
                });

                // Update Route
                const currentTrail = {
                    'type': 'Feature',
                    'geometry': {
                        'type': 'LineString',
                        'coordinates': arcCoords.slice(0, frameIndex + 1)
                    },
                    'properties': { 'color': segmentColor }
                };
                
                const allFeatures = [...(window.historyFeatures || []), currentTrail];
                
                map.getSource('route').setData({
                    'type': 'FeatureCollection',
                    'features': allFeatures
                });

                frameIndex += speedFactor; 
                animationFrameId = requestAnimationFrame(frame);
            } else {
                dateStat.innerText = end.date || 'ARRIVED';
                isPlaying = false; 
                
                if (!window.historyFeatures) window.historyFeatures = [];
                window.historyFeatures.push({
                    'type': 'Feature',
                    'geometry': {
                        'type': 'LineString',
                        'coordinates': arcCoords
                    },
                    'properties': { 'color': segmentColor }
                });
                
                if (autoPlay) {
                    currentSegmentIndex++;
                    timeoutId = setTimeout(playNextSegment, 1000); 
                }
            }
        }
        
        animationFrameId = requestAnimationFrame(frame);
    }
});
