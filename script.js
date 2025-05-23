mapboxgl.accessToken = 'pk.eyJ1IjoiYWhhZHh4MjE4IiwiYSI6ImNtYjB2bGQ4djB4bjUya3NoeXBuNGh0MjMifQ.MflYCvVk2gJfJ1ycSdLdqw';
let destinationMarker = null;
let styleToggle = false;

const map = new mapboxgl.Map({
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v11',
  center: [39.8262, 21.4225],
  zoom: 15
});

navigator.geolocation.getCurrentPosition(pos => {
  const userLng = pos.coords.longitude;
  const userLat = pos.coords.latitude;
  map.setCenter([userLng, userLat]);

  new mapboxgl.Marker({ color: 'blue' })
    .setLngLat([userLng, userLat])
    .addTo(map);

  map.on('click', (e) => {
    const lng = e.lngLat.lng;
    const lat = e.lngLat.lat;

    if (destinationMarker) destinationMarker.remove();

    destinationMarker = new mapboxgl.Marker({ color: 'green' })
      .setLngLat([lng, lat])
      .addTo(map);

    fetch(`https://api.mapbox.com/directions/v5/mapbox/walking/${userLng},${userLat};${lng},${lat}?geometries=geojson&access_token=${mapboxgl.accessToken}`)
      .then(response => response.json())
      .then(data => {
        const coords = data.routes[0].geometry.coordinates;

        // Add Mapbox route
        if (map.getSource('route')) {
          map.removeLayer('route');
          map.removeSource('route');
        }

        map.addSource('route', {
          type: 'geojson',
          data: {
            type: 'Feature',
            geometry: {
              type: 'LineString',
              coordinates: coords
            }
          }
        });

        map.addLayer({
          id: 'route',
          type: 'line',
          source: 'route',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': '#ff8800',
            'line-width': 4
          }
        });

        // Display AR path in the scene
        const scene = document.querySelector('a-scene');
        const pathEntity = document.getElementById('path-line');
        pathEntity.innerHTML = '';

        coords.forEach((coord, i) => {
          const pos = `0 0 -${i * 0.5}`;
          const point = document.createElement('a-sphere');
          point.setAttribute('position', pos);
          point.setAttribute('radius', '0.05');
          point.setAttribute('color', '#ff8800');
          pathEntity.appendChild(point);
        });
      });
  });
});

function resetDestination() {
  if (destinationMarker) {
    destinationMarker.remove();
    destinationMarker = null;
  }
  if (map.getSource('route')) {
    map.removeLayer('route');
    map.removeSource('route');
  }
  document.getElementById('path-line').innerHTML = '';
}

function toggleStyle() {
  styleToggle = !styleToggle;
  map.setStyle(styleToggle ? 'mapbox://styles/mapbox/dark-v10' : 'mapbox://styles/mapbox/streets-v11');
}
