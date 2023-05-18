const distanceContainer = document.getElementById('distance');
const markerContainer = document.querySelector('.marker-container');
const closeMarkerContainer = markerContainer.querySelector('.close');
const form = document.getElementById('login');

const cord = [];

let cord_data = [];

fetch('./data/data.json')
    .then((response) => response.json())
    .then((data) => {
        cord_data = data;
        //showMap();
    });

form.addEventListener('submit', (e) => {
    e.preventDefault();

    const boat_num = e.target.boat_num.value;

    localStorage.setItem('boat_id', boat_num);

    showMap();

    form.parentNode.style.display = 'none';
});

// Create a GeoJSON source with an empty lineString.
var geojson = {
    type: 'FeatureCollection',
    features: [
        {
            type: 'Feature',
            geometry: {
                type: 'LineString',
                coordinates: [],
            },
        },
    ],
};

function showMap() {
    mapboxgl.accessToken =
        'pk.eyJ1Ijoia3N0eWxpYW5vdSIsImEiOiJja2w4OWdlY3owZHFqMndydnlqYWdwODhzIn0.5p3nIkXRh8PeBiM-caYVJQ';

    let geolocate = new mapboxgl.GeolocateControl({
        positionOptions: {
            enableHighAccuracy: true,
        },
        // When active the map will receive updates to the device's location as it changes.
        trackUserLocation: true,
        // Draw an arrow next to the location dot to indicate which direction the device is heading.
        showUserHeading: true,
    });



    const map = new mapboxgl.Map({
        container: 'map',
        //style: 'mapbox://styles/mapbox/streets-v11',
        style: 'mapbox://styles/mapbox/streets-v12', // style URL
        center: [34.05496, 35.015934],
        zoom: 15,
    });


    map.on('load', function () {
        // Add geolocate control to the map.
        map.addControl(geolocate);

        let polygon = [];
        cord_data.forEach((item) => {
            polygon.push(new Point(item[0], item[1]));
        });

        geolocate.on('geolocate', function (e) {
            console.log(e);
            var lon = e.coords.longitude;
            var lat = e.coords.latitude;
            var position = [lon, lat];
            updatePolygonCheck(position, polygon);
            updateDatabase({
                boat_id: localStorage.getItem('boat_id'),
                cords: position,
            });

            console.log(map.getBearing());
        });

        const easing = t => t * (2 - t)

        if (window.DeviceOrientationEvent) {
          window.addEventListener('deviceorientation', event => {
            let compassdir
            if (event.webkitCompassHeading) {
              // Apple works only with this, alpha doesn't work
              compassdir = event.webkitCompassHeading
            }
            else {
              compassdir = event.alpha
            }
            map.easeTo({
              bearing: 360 - compassdir,
              easing: easing
            })
          })
        }
    

        map.addSource('maine', {
            type: 'geojson',
            data: {
                type: 'Feature',
                geometry: {
                    type: 'Polygon',
                    // These coordinates outline Maine.
                    coordinates: [cord_data],
                },
            },
        });

        // Add a new layer to visualize the polygon.
        map.addLayer({
            id: 'maine',
            type: 'fill',
            source: 'maine', // reference the data source
            layout: {},
            paint: {
                'fill-color': '#0080ff', // blue color fill
                'fill-opacity': 0.5,
            },
        });
        // Add a black outline around the polygon.
        map.addLayer({
            id: 'outline',
            type: 'line',
            source: 'maine',
            layout: {},
            paint: {
                'line-color': '#000',
                'line-width': 3,
            },
        });

        map.addSource('line', {
            type: 'geojson',
            data: geojson,
        });

        // add the line which will be modified in the animation
        map.addLayer({
            id: 'line-animation',
            type: 'line',
            source: 'line',
            layout: {
                'line-cap': 'round',
                'line-join': 'round',
            },
            paint: {
                'line-color': '#ed6498',
                'line-width': 5,
                'line-opacity': 0.8,
            },
        });

        fetch('./data/markers.json')
            .then((response) => response.json())
            .then((data) => {
                data.forEach((marker) => {
                    // Create a default Marker and add it to the map.
                    let c_marker = new mapboxgl.Marker()
                        .setLngLat([marker.lng, marker.lat])
                        .addTo(map);

                    console.log(c_marker);

                    // use GetElement to get HTML Element from marker and add event
                    c_marker.getElement().addEventListener('click', () => {
                        openMarkerContainer(marker.html);
                    });
                });
            });

        map.on('click', (e) => {
            let cor = e.lngLat.wrap();

            cord.push([cor.lng, cor.lat]);
            console.log([cor.lng, cor.lat]);
            console.log(cor);
        });
    });

    // const draw = new MapboxDraw({
    //     displayControlsDefault: false,
    //     // Select which mapbox-gl-draw control buttons to add to the map.
    //     controls: {
    //         polygon: true,
    //         trash: true,
    //     },
    //     // Set mapbox-gl-draw to draw by default.
    //     // The user does not have to click the polygon control button first.
    //     defaultMode: 'draw_polygon',
    // });
    // map.addControl(draw);

    // map.on('draw.create', updateArea);
    // map.on('draw.delete', updateArea);
    // map.on('draw.update', updateArea);
}

function distance(lat1, lon1, lat2, lon2) {
    // The math module contains a function
    // named toRadians which converts from
    // degrees to radians.
    lon1 = (lon1 * Math.PI) / 180;
    lon2 = (lon2 * Math.PI) / 180;
    lat1 = (lat1 * Math.PI) / 180;
    lat2 = (lat2 * Math.PI) / 180;

    // Haversine formula
    let dlon = lon2 - lon1;
    let dlat = lat2 - lat1;
    let a =
        Math.pow(Math.sin(dlat / 2), 2) +
        Math.cos(lat1) * Math.cos(lat2) * Math.pow(Math.sin(dlon / 2), 2);

    let c = 2 * Math.asin(Math.sqrt(a));

    // Radius of earth in kilometers. Use 3956
    // for miles
    let r = 6371;

    // calculate the result
    return parseInt(c * r * 1000);
}

function isScreenLockSupported() {
    return 'wakeLock' in navigator;
}

async function getScreenLock() {
    if (isScreenLockSupported()) {
        let screenLock;
        try {
            screenLock = await navigator.wakeLock.request('screen');
        } catch (err) {
            console.log(err.name, err.message);
        }
        return screenLock;
    }
}

getScreenLock().then((response) => console.log(response));

function updatePolygonCheck(cords, polygon) {
    let p = new Point(cords[0], cords[1]);
    let n = cord_data.length;

    distanceContainer.innerHTML = '';

    // if (checkInside(polygon, n, p)) {
    //     console.log('Point is inside.');
    //     const value = document.createElement('pre');
    //     value.textContent = `Point is inside.`;
    //     distanceContainer.appendChild(value);
    // } else {
    //     console.log('Point is outside.');
    //     const value = document.createElement('pre');
    //     value.textContent = `Point is outside.`;
    //     distanceContainer.appendChild(value);
    // }
}

function updateDatabase(position) {
    socket.emit('location_update', position);
}

function openMarkerContainer(html) {
    markerContainer.querySelector('.content').innerHTML = html;
    markerContainer.classList.add('active');
}

closeMarkerContainer.addEventListener('click', () => {
    markerContainer.classList.remove('active');
});
