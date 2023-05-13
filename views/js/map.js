mapboxgl.accessToken = 'pk.eyJ1Ijoia3N0eWxpYW5vdSIsImEiOiJja2w4OWdlY3owZHFqMndydnlqYWdwODhzIn0.5p3nIkXRh8PeBiM-caYVJQ';
var map = new mapboxgl.Map({
    container: 'map',
    //style: 'mapbox://styles/mapbox/streets-v11',
    style: 'mapbox://styles/mapbox/satellite-v9', // style URL
    center: [34.054960,35.015934],
    zoom: 15,
});

const marker = new mapboxgl.Marker()
    .setLngLat([0, 0])
    .addTo(map);


socket.on('location', (data) => {
    marker.setLngLat([data[0], data[1]]);
    map.setCenter([data[0], data[1]])
})