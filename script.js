let map = L.map('map').setView([28.6129, 77.2310], 12);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap contributors',
  maxZoom: 19
}).addTo(map);

let carIcon = L.icon({
  iconUrl: 'https://img.icons8.com/color/48/car.png',
  iconSize: [40, 40],
  iconAnchor: [20, 20]
});

let carMarker = L.marker([28.6129, 77.2310], { icon: carIcon }).addTo(map);

let routingControl;
let routeCoords = [];
let animationIndex = 0;
let animationInterval;
let isAnimating = false;

async function geocode(address) {
  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon)
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error('Geocoding error:', error);
    return null;
  }
}

document.getElementById('routeBtn').onclick = async function() {
  const startAddress = document.getElementById('start').value.trim();
  const endAddress = document.getElementById('end').value.trim();
  
  if (!startAddress || !endAddress) {
    alert('Please enter both start and end locations');
    return;
  }
  
  document.getElementById('status').textContent = '🔍 Finding locations...';
  

  const startCoords = await geocode(startAddress);
  const endCoords = await geocode(endAddress);
  
  if (!startCoords) {
    alert('Could not find start location. Try being more specific (e.g., add city name)');
    document.getElementById('status').textContent = '';
    return;
  }
  
  if (!endCoords) {
    alert('Could not find end location. Try being more specific (e.g., add city name)');
    document.getElementById('status').textContent = '';
    return;
  }
  
  document.getElementById('status').textContent = '🗺️ Calculating route...';
  
  
  if (routingControl) {
    map.removeControl(routingControl);
  }
  

  if (animationInterval) {
    clearInterval(animationInterval);
    isAnimating = false;
  }
  
  
  carMarker.setLatLng([startCoords.lat, startCoords.lng]);
  
  
  routingControl = L.Routing.control({
    waypoints: [
      L.latLng(startCoords.lat, startCoords.lng),
      L.latLng(endCoords.lat, endCoords.lng)
    ],
    routeWhileDragging: false,
    addWaypoints: false,
    draggableWaypoints: false,
    fitSelectedRoutes: true,
    showAlternatives: false,
    lineOptions: {
      styles: [{ color: '#4CAF50', weight: 5, opacity: 0.7 }]
    }
  }).addTo(map);
  
  
  routingControl.on('routesfound', function(e) {
    const route = e.routes[0];
    routeCoords = route.coordinates;
    
    document.getElementById('status').textContent = `✅ Route found! Distance: ${(route.summary.totalDistance / 1000).toFixed(2)} km`;
    document.getElementById('animateBtn').style.display = 'inline-block';
    
    console.log(`Route has ${routeCoords.length} points`);
  });
  

  routingControl.on('routingerror', function(e) {
    document.getElementById('status').textContent = '❌ Could not find route between these locations';
    console.error('Routing error:', e);
  });
};


document.getElementById('animateBtn').onclick = function() {
  if (routeCoords.length === 0) {
    alert('Please show a route first');
    return;
  }
  
  if (isAnimating) {
    
    clearInterval(animationInterval);
    isAnimating = false;
    document.getElementById('animateBtn').textContent = 'Animate Car';
    document.getElementById('animateBtn').style.backgroundColor = '#2196F3';
  } else {
    
    animationIndex = 0;
    isAnimating = true;
    document.getElementById('animateBtn').textContent = 'Stop Animation';
    document.getElementById('animateBtn').style.backgroundColor = '#f44336';
    animateCar();
  }
};


function animateCar() {
  animationInterval = setInterval(function() {
    if (animationIndex < routeCoords.length) {
      const coord = routeCoords[animationIndex];
      carMarker.setLatLng([coord.lat, coord.lng]);
      map.panTo([coord.lat, coord.lng]);
      animationIndex++;
    } else {
      
      clearInterval(animationInterval);
      isAnimating = false;
      document.getElementById('animateBtn').textContent = 'Animate Car';
      document.getElementById('animateBtn').style.backgroundColor = '#2196F3';
      document.getElementById('status').textContent = '✅ Animation complete!';
    }
  }, 100); 
}

console.log('Map initialized successfully! 🗺️');