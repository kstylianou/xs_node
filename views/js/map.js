mapboxgl.accessToken = 'pk.eyJ1Ijoia3N0eWxpYW5vdSIsImEiOiJja2w4OWdlY3owZHFqMndydnlqYWdwODhzIn0.5p3nIkXRh8PeBiM-caYVJQ';
var map = new mapboxgl.Map({
    container: 'map',
    //style: 'mapbox://styles/mapbox/streets-v11',
    style: 'mapbox://styles/mapbox/satellite-v9', // style URL
    center: [34.054960,35.015934],
    zoom: 15,
});

const app = {
    markers: []
}

const marker = new mapboxgl.Marker()
    .setLngLat([0, 0])
    .addTo(map);

socket.on('location', (data) => {
    const boat_marker = findMarker(data.boat_id);

    if(boat_marker) {
        console.log('here');
        boat_marker.marker.setLngLat([data.cords[0], data.cords[1]]);
        return;
    }

    const popup = new mapboxgl.Popup({ offset: 25 }).setText(
        'Boat ' + data.boat_id
        );

    app.markers.push({
        marker: new mapboxgl.Marker().setLngLat([data.cords[0], data.cords[1]]).setPopup(popup).addTo(map),
        boat_id: data.boat_id
    })
   
    // map.setCenter([data[0], data[1]])
})


function findMarker(boat_id) {
    // If user has existing socket find the index
    let tempIndex = app.markers.find((marker => Number(marker.boat_id) === Number(boat_id)));

    // Check if boat is undefined
    if(tempIndex === undefined) return false;

    // Return user json
    return tempIndex;
}