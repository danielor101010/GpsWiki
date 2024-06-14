var trackingInterval;
var startTrackingBtn = document.getElementById('startTrackingBtn');
var stopTrackingBtn = document.getElementById('stopTrackingBtn');
var speakBtn = document.getElementById('speakBtn');
var historicalPlacesList = document.getElementById('historical_places_list');
var map;
var marker;

var geoNamesUsername = 'your_geonames_username'; // Replace with your GeoNames username

function initMap() {
    map = L.map('map').setView([0, 0], 12); // Default center and zoom level

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
    }).addTo(map);

    marker = L.marker([0, 0], {
        draggable: false,
    }).addTo(map);

    // Attempt to get user's current location
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
            var latlng = {
                lat: position.coords.latitude,
                lng: position.coords.longitude
            };

            map.setView(latlng, 12); // Set map center
            marker.setLatLng(latlng); // Set marker position
        }, function() {
            handleLocationError(true, marker, map.getCenter());
        });
    } else {
        // Browser doesn't support Geolocation
        handleLocationError(false, marker, map.getCenter());
    }
}

// Function to handle geolocation errors
function handleLocationError(browserHasGeolocation, marker, pos) {
    marker.setLatLng(pos);
    marker.bindPopup(browserHasGeolocation ?
        'Error: The Geolocation service failed.' :
        'Error: Your browser doesn\'t support geolocation.').openPopup();
}

function startTracking() {
    if (!navigator.geolocation) {
        alert("Geolocation is not supported by your browser.");
        return;
    }

    trackingInterval = navigator.geolocation.watchPosition(showPosition, showError, {
        enableHighAccuracy: true,
        timeout: 15000, // 15 seconds
        maximumAge: 0
    });

    startTrackingBtn.style.display = 'none';
    stopTrackingBtn.style.display = 'inline-block';
}

function stopTracking() {
    if (trackingInterval) {
        navigator.geolocation.clearWatch(trackingInterval);
    }

    startTrackingBtn.style.display = 'inline-block';
    stopTrackingBtn.style.display = 'none';
    speakBtn.style.display = 'none';
}

function showPosition(position) {
    var latitude = position.coords.latitude.toFixed(6);
    var longitude = position.coords.longitude.toFixed(6);

    document.getElementById("latitude").textContent = latitude;
    document.getElementById("longitude").textContent = longitude;

    map.setView([latitude, longitude], 12); // Center the map on the current location
    marker.setLatLng([latitude, longitude]); // Move the marker to the current location

    fetchCityAndSummary(latitude, longitude);
    fetchHistoricalPlaces(latitude, longitude);
}

function showError(error) {
    switch (error.code) {
        case error.PERMISSION_DENIED:
            alert("User denied the request for Geolocation.");
            break;
        case error.POSITION_UNAVAILABLE:
            alert("Location information is unavailable.");
            break;
        case error.TIMEOUT:
            alert("The request to get user location timed out.");
            break;
        case error.UNKNOWN_ERROR:
            alert("An unknown error occurred.");
            break;
    }
}

function fetchCityAndSummary(latitude, longitude) {
    fetch('/get_city', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ latitude: latitude, longitude: longitude }),
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById("city_name").textContent = data.city;
        document.getElementById("wiki_content").textContent = data.wiki_summary;
        document.getElementById("error_message").textContent = "";
        speakBtn.style.display = 'inline-block';
        checkCityChange(data.city);
    })
    .catch(error => {
        console.error('Error:', error);
        document.getElementById("city_name").textContent = "Error retrieving city name.";
        document.getElementById("wiki_content").textContent = "Error retrieving Wikipedia information.";
        document.getElementById("error_message").textContent = "Error occurred during data retrieval.";
        speakBtn.style.display = 'none';
    });
}

function fetchHistoricalPlaces(latitude, longitude) {
    var geoNamesUrl = `http://api.geonames.org/findNearbyWikipediaJSON?lat=${latitude}&lng=${longitude}&username=${geoNamesUsername}`;

    fetch(geoNamesUrl)
        .then(response => response.json())
        .then(data => {
            historicalPlacesList.innerHTML = ''; // Clear the list before adding new places

            // Display real historical places from GeoNames
            data.geonames.forEach(place => {
                var placeMarker = L.marker([place.lat, place.lng], {
                    title: place.title || "Unknown"
                }).addTo(map);

                placeMarker.bindPopup(`<b>${place.title || "Unknown"}</b><br>${place.summary || "No description available"}`);
                
                placeMarker.on('click', function() {
                    alert(place.summary || "No description available");
                });

                var placeElement = document.createElement('div');
                placeElement.classList.add('historical-place');
                placeElement.innerHTML = `<b>${place.title || "Unknown"}</b><br>${place.summary || "No description available"}`;
                historicalPlacesList.appendChild(placeElement);
            });

            // Add a fake historical place for testing
            var fakePlaceLat = 34.052235;
            var fakePlaceLng = -118.243683;
            var fakePlaceMarker = L.marker([fakePlaceLat, fakePlaceLng], {
                title: "Fake Historical Place"
            }).addTo(map);

            fakePlaceMarker.bindPopup(`<b>Fake Historical Place</b><br>This is a fake historical place for testing purposes.`);
            
            fakePlaceMarker.on('click', function() {
                alert("This is a fake historical place for testing purposes.");
            });

            var fakePlaceElement = document.createElement('div');
            fakePlaceElement.classList.add('historical-place');
            fakePlaceElement.innerHTML = `<b>Fake Historical Place</b><br>This is a fake historical place for testing purposes.`;
            historicalPlacesList.appendChild(fakePlaceElement);
        })
        .catch(error => {
            console.error('Error fetching historical places:', error);
            // var errorElement = document.createElement('div');
            // errorElement.classList.add('historical-place');
            // errorElement.innerHTML = 'Error fetching historical places.';
            // historicalPlacesList.appendChild(errorElement);
        });
}

function speakSummary() {
    var wikiSummary = document.getElementById("wiki_content").textContent;
    var language = document.getElementById("language").value;

    fetch('/speak', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: wikiSummary, language: language }),
    })
    .then(response => response.json())
    .then(data => {
        console.log('Speaking initiated.');
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function translateSummary() {
    var wikiSummary = document.getElementById("wiki_content").textContent;
    var language = document.getElementById("language").value;

    fetch('/translate', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text: wikiSummary, language: language }),
    })
    .then(response => response.json())
    .then(data => {
        document.getElementById("wiki_content").textContent = data.translated_text;
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function checkCityChange(newCity) {
    var currentCity = localStorage.getItem('currentCity');

    if (currentCity && currentCity !== newCity) {
        var confirmPopup = confirm(`Would you like to hear about ${newCity}?`);

        if (confirmPopup) {
            speakSummary();
        }
    }

    localStorage.setItem('currentCity', newCity);
}

// Initialize the map when the page loads
document.addEventListener("DOMContentLoaded", function(event) {
    initMap();
});