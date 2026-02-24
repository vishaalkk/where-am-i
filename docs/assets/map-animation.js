mapboxgl.accessToken = 'pk.eyJ1IjoidmlzaGtrIiwiYSI6ImNrbDFqeHl5MDBuZ2Eyd3BkYjc3ZjA1ZTIifQ.OWMuggD5niOsp8LW2MPqlQ';

document.addEventListener('DOMContentLoaded', async function () {
    const mapContainer = 'map';
    const travelDataUrl = 'assets/travels.json';
    const startBtn = document.getElementById('start-btn');
    const locationStat = document.getElementById('location-stat');
    const dateStat = document.getElementById('date-stat');
    
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

        // Load Plane Icon - DETAILED NYAN CAT
        const planeSvg = `<svg width="60" height="40" viewBox="0 0 60 40" xmlns="http://www.w3.org/2000/svg">
            <!-- POPTART BODY -->
            <rect x="15" y="10" width="30" height="20" fill="#FFCC99" stroke="#000" stroke-width="2"/>
            <!-- PINK FILLING -->
            <rect x="18" y="13" width="24" height="14" fill="#FF99FF"/>
            <!-- SPRINKLES -->
            <circle cx="20" cy="15" r="1.5" fill="#FF0000"/>
            <circle cx="30" cy="15" r="1.5" fill="#FF0000"/>
            <circle cx="38" cy="18" r="1.5" fill="#FF0000"/>
            <circle cx="22" cy="22" r="1.5" fill="#FF0000"/>
            <circle cx="35" cy="23" r="1.5" fill="#FF0000"/>
            
            <!-- HEAD -->
            <rect x="40" y="5" width="18" height="15" fill="#999999" stroke="#000" stroke-width="2"/>
            <polygon points="42,5 45,0 48,5" fill="#999999" stroke="#000" stroke-width="1"/>
            <polygon points="52,5 55,0 58,5" fill="#999999" stroke="#000" stroke-width="1"/>
            <rect x="44" y="10" width="3" height="3" fill="#000"/>
            <rect x="52" y="10" width="3" height="3" fill="#000"/>
            <!-- MOUTH -->
            <path d="M48 16 Q 50 18 52 16" stroke="#000" fill="none" stroke-width="1"/>

            <!-- TAIL -->
            <path d="M15 20 Q 5 15 10 25" stroke="#999999" stroke-width="3" fill="none"/>
            
            <!-- LEGS -->
            <rect x="18" y="30" width="4" height="5" fill="#999999" stroke="#000" stroke-width="1"/>
            <rect x="38" y="30" width="4" height="5" fill="#999999" stroke="#000" stroke-width="1"/>
            <rect x="25" y="30" width="4" height="5" fill="#999999" stroke="#000" stroke-width="1"/>
            <rect x="31" y="30" width="4" height="5" fill="#999999" stroke="#000" stroke-width="1"/>
        </svg>`;
        
        const planeImage = new Image(60, 40);
        planeImage.onload = () => {
            if (!map.hasImage('plane-icon')) {
                map.addImage('plane-icon', planeImage, { sdf: false });
            }
        };
        planeImage.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(planeSvg);

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
                'line-cap': 'round' // Square cap for pixel look? Let's stick to round for smooth turns
            },
            'paint': {
                'line-color': '#ff99cc', // Nyan Pink
                'line-width': 6, // Thicker trail
                'line-dasharray': [1, 0], // Solid line for rainbow trail
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
                'icon-image': 'plane-icon',
                'icon-size': 0.8,
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

    // Helper to stop everything
    function stopAnimation() {
        if (animationFrameId) cancelAnimationFrame(animationFrameId);
        if (timeoutId) clearTimeout(timeoutId);
        isPlaying = false;
        // Don't reset isPaused here to allow pause/resume flow?
        // Actually, if we stop animation (e.g. manual nav), we should unpause.
        isPaused = false;
        if (pauseBtn) pauseBtn.innerText = "||";
    }

    startBtn.addEventListener('click', () => {
        if (!mapLoaded || travels.length < 2) return;
        
        // Reset Map to Start
        const startLoc = travels[0];
        map.jumpTo({ center: startLoc.coordinates, zoom: 3 });
        
        // Reset Stats
        locationStat.innerText = "RESETTING...";
        dateStat.innerText = "----";
        
        // Reset Cat
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
        
        // Enable AutoPlay for Replay History
        autoPlay = true;
        isPaused = false;
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
        autoPlay = false; // Manual Mode
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
            // Journey Complete
            startBtn.style.opacity = '1';
            startBtn.style.pointerEvents = 'all';
            startBtn.innerText = 'REPLAY HISTORY ↺';
            locationStat.innerText = "COMPLETE";
            isPlaying = false;
            return;
        }

        const start = travels[currentSegmentIndex];
        const end = travels[currentSegmentIndex + 1];
        
        // Update Stats
        locationStat.innerText = end.location.split(',')[0].toUpperCase();
        dateStat.innerText = end.date ? end.date.split(' - ')[0] : '...';

        // Draw Route (History)
        const pastCoordinates = travels.slice(0, currentSegmentIndex + 1).map(t => t.coordinates);
        map.getSource('route').setData({
            'type': 'FeatureCollection',
            'features': [{
                'type': 'Feature',
                'geometry': {
                    'type': 'LineString',
                    'coordinates': pastCoordinates
                }
            }]
        });

        // Calculate Path (Linear)
        const startLng = start.coordinates[0];
        const startLat = start.coordinates[1];
        const endLng = end.coordinates[0];
        const endLat = end.coordinates[1];
        const arcCoords = [];
        const steps = 200; 

        for (let i = 0; i <= steps; i++) {
            const t = i / steps;
            const lng = startLng + (endLng - startLng) * t;
            const lat = startLat + (endLat - startLat) * t;
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

        // Rhumb Bearing
        const rawBearing = turf.rhumbBearing(turf.point(start.coordinates), turf.point(end.coordinates));
        const catRotation = rawBearing - 90;

        // Animate Plane Loop
        let frameIndex = 0;
        const speedSlider = document.getElementById('speed-slider');

        function frame() {
            if (!isPlaying) return; 

            // PAUSE LOGIC
            if (isPaused) {
                animationFrameId = requestAnimationFrame(frame);
                return;
            }

            // Calculate Speed
            const speedVal = parseInt(speedSlider.value); 
            // If skipping, go super fast
            const speedFactor = skipCurrent ? 1000 : speedVal; 

            if (frameIndex < arcCoords.length) {
                const currentCoord = arcCoords[frameIndex];
                
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
                const currentPath = arcCoords.slice(0, frameIndex + 1);
                const fullPath = [...pastCoordinates, ...currentPath];
                map.getSource('route').setData({
                    'type': 'FeatureCollection',
                    'features': [{
                        'type': 'Feature',
                        'geometry': {
                            'type': 'LineString',
                            'coordinates': fullPath
                        }
                    }]
                });

                frameIndex += speedFactor; 
                animationFrameId = requestAnimationFrame(frame);
            } else {
                // Arrived
                dateStat.innerText = end.date || 'ARRIVED';
                isPlaying = false; // Stopped
                
                // If AutoPlay, continue. Else Stop.
                if (autoPlay) {
                    currentSegmentIndex++;
                    timeoutId = setTimeout(playNextSegment, 1000); 
                }
            }
        }
        
        animationFrameId = requestAnimationFrame(frame);
    }
});
