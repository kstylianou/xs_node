let Latitude;
let Longitude;
let len = 0;


const distanceContainer = document.getElementById('distance');


const cord = [];
let id = 0;

let cord_data = [];

fetch('./data/data.json').then(response => response.json())
    .then(data => {
        cord_data = data;
        showMap();
    })

// Create a GeoJSON source with an empty lineString.
var geojson = {
    'type': 'FeatureCollection',
    'features': [
        {
            'type': 'Feature',
            'geometry': {
                'type': 'LineString',
                'coordinates': []
            }
        }
    ]
};

let urlJson = {
    "geometry": {
        "type": "Point",
        "coordinates": []
    },
    "type": "Feature",
    "properties": {
        "rotation": ''
    }
}

if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(showPosition);
}
else {
    document.getElementById("error").innerHTML = "Geolocation is not supported by your browser."; //TODO - Geolocation is NOT supported by browser.
}

function showPosition(position)
{
    Latitude = position.coords.latitude;
    Longitude = position.coords.longitude;
    // LatitudeArr.push(Latitude);
    // LongitudeArr.push(Longitude);
    // let lat = JSON.stringify(LatitudeArr);
    // let long = JSON.stringify(LongitudeArr);
    showMap();
}

function showMap(){

    mapboxgl.accessToken = 'pk.eyJ1Ijoia3N0eWxpYW5vdSIsImEiOiJja2w4OWdlY3owZHFqMndydnlqYWdwODhzIn0.5p3nIkXRh8PeBiM-caYVJQ';
    var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/mapbox/streets-v11',
        center: [34.054960,35.015934],
        zoom: 15,
    });

    map.on('load', function () {

        let geolocate = new mapboxgl.GeolocateControl({
            positionOptions: {
                enableHighAccuracy: true
            },
            trackUserLocation: true,
            showUserHeading: true
        });

        let polygon= [];
        cord_data.forEach(item => {
            polygon.push(new Point(item[0], item[1]));
        });

        map.addControl(geolocate);

        geolocate.on('geolocate', function(e) {
            var lon = e.coords.longitude;
            var lat = e.coords.latitude
            var position = [lon, lat];
            updatePolygonCheck(position, polygon);
            updateDatabase(position);
        });

        map.addSource('maine', {
            'type': 'geojson',
            'data': {
                'type': 'Feature',
                'geometry': {
                    'type': 'Polygon',
                    // These coordinates outline Maine.
                    'coordinates': [cord_data]
                }
            }
        });



        // Function call



        // Add a new layer to visualize the polygon.
        map.addLayer({
            'id': 'maine',
            'type': 'fill',
            'source': 'maine', // reference the data source
            'layout': {},
            'paint': {
                'fill-color': '#0080ff', // blue color fill
                'fill-opacity': 0.5
            }
        });
        // Add a black outline around the polygon.
        map.addLayer({
            'id': 'outline',
            'type': 'line',
            'source': 'maine',
            'layout': {},
            'paint': {
                'line-color': '#000',
                'line-width': 3
            }
        });


        window.setInterval(function () {

            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(show);
                // retrieve the JSON from the response
                function show(position) {
                    geojson.features[0].geometry.coordinates.push([position.coords.longitude, position.coords.latitude])
                    urlJson.geometry.coordinates = [position.coords.longitude, position.coords.latitude];

                    Longitude = position.coords.longitude;
                    Latitude = position.coords.latitude;

                    // update the drone symbol's location on the map
                    // map.getSource('drone').setData(urlJson);
                    // map.getSource('line').setData(geojson);
                    //map.setCenter([position.coords.longitude, position.coords.latitude])
                    window.addEventListener("deviceorientation", (event) => {
                        urlJson.properties.rotation = -event.alpha;
                        // map.getSource('drone').setData(urlJson);
                    }, true);

                }
            }
        }, 2000);



        // map.addSource('drone', { type: 'geojson', data: urlJson });
        // map.addLayer({
        //     'id': 'drone',
        //     'type': 'symbol',
        //     'source': 'drone',
        //     'layout': {
        //         'icon-image': 'rocket-15',
        //         'icon-rotate': ['get', 'rotation']
        //     }
        // });

        map.addSource('line', {
            'type': 'geojson',
            'data': geojson
        });

        // add the line which will be modified in the animation
        map.addLayer({
            'id': 'line-animation',
            'type': 'line',
            'source': 'line',
            'layout': {
                'line-cap': 'round',
                'line-join': 'round'
            },
            'paint': {
                'line-color': '#ed6498',
                'line-width': 5,
                'line-opacity': 0.8
            }
        });


        // Create a default Marker and add it to the map.
        const marker1 = new mapboxgl.Marker()
            .setLngLat([34.064557, 35.012344])
            .addTo(map);


        // cord_data.forEach(item => {
        //     new mapboxgl.Marker()
        //     .setLngLat([item[0], item[1]])
        //     .addTo(map);
        // })

        map.on('click', (e) => {
            let cor = e.lngLat.wrap()

            cord.push([
                cor.lng,
                cor.lat
            ])
            console.log([cor.lng, cor.lat])
            console.log(cor)
        });

    });
}


function distance(lat1, lon1, lat2, lon2) {

    // The math module contains a function
    // named toRadians which converts from
    // degrees to radians.
    lon1 =  lon1 * Math.PI / 180;
    lon2 = lon2 * Math.PI / 180;
    lat1 = lat1 * Math.PI / 180;
    lat2 = lat2 * Math.PI / 180;

    // Haversine formula
    let dlon = lon2 - lon1;
    let dlat = lat2 - lat1;
    let a = Math.pow(Math.sin(dlat / 2), 2)
        + Math.cos(lat1) * Math.cos(lat2)
        * Math.pow(Math.sin(dlon / 2),2);

    let c = 2 * Math.asin(Math.sqrt(a));

    // Radius of earth in kilometers. Use 3956
    // for miles
    let r = 6371;



    // calculate the result
    return(parseInt((c * r) * 1000));
}

function isScreenLockSupported() {
    return ('wakeLock' in navigator);
}

async function getScreenLock() {
    if(isScreenLockSupported()){
        let screenLock;
        try {
            screenLock = await navigator.wakeLock.request('screen');
        } catch(err) {
            console.log(err.name, err.message);
        }
        return screenLock;
    }
}

getScreenLock().then(response => console.log(response));


function updatePolygonCheck(cords, polygon) {

    let p = new Point(cords[0], cords[1]);
    let n = cord_data.length;

    distanceContainer.innerHTML = '';

    if (checkInside(polygon, n, p)) {
        console.log("Point is inside.");
        const value = document.createElement('pre');
        value.textContent = `Point is inside.`;
        distanceContainer.appendChild(value);
    }
    else {
        console.log("Point is outside.");
        const value = document.createElement('pre');
        value.textContent = `Point is outside.`;
        distanceContainer.appendChild(value);
    }
}

function updateDatabase(position) {
    socket.emit('location_update', position)
}