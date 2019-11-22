// Data source variables
var earthquakeInfo = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson';
var tectonicInfo = 'static/js/PB2002_boundaries.json'
var orogensInfo = 'static/js/PB2002_orogens.json'
var stepsInfo = 'static/js/PB2002_steps.json'

// Perform a GET request to the query URL
d3.json(earthquakeInfo, function (data) {
    // Once we get a response, send the data.features object to the createFeatures function
    createFeatures(data.features);
});

function createFeatures(earthquakeInfo) {
    // Define a function we want to run once for each feature in the features array
    // Give each feature a popup describing the place and time of the earthquake
    var quakes = L.geoJSON(earthquakeInfo, {
        onEachFeature(feature, layer) {
            layer.bindPopup(`<h3> Magnitued: ${feature.properties.mag}<h3> \
            <h3> Location: ${feature.properties.place}<h3> \
            <h3> Date: ${new Date(feature.properties.time)}<h3>`);
        },
        pointToLayer(feature, latlng) {
            return new L.circleMarker(latlng, {
                fillOpacity: .85,
                radius: setRadius(feature.properties.mag),
                fillColor: getColor(feature.properties.mag),
                stroke: false
            })
        }
    });
    createMap(quakes);
}

function createMap(earthquakes) {
    // Define streetmap and darkmap layers
    var satellite = L.tileLayer(`https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v10/tiles/256/{z}/{x}/{y}?access_token=${API_KEY}`, {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.sattel",
    });

    var greyscale = L.tileLayer(`https://api.mapbox.com/styles/v1/mapbox/light-v9/tiles/256/{z}/{x}/{y}?access_token=${API_KEY}`, {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.light",
    });

    var outdoors = L.tileLayer(`https://api.mapbox.com/styles/v1/mapbox/outdoors-v11/tiles/256/{z}/{x}/{y}?access_token=${API_KEY}`, {
        attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
        maxZoom: 18,
        id: "mapbox.outdoors",
    });

    // Define a baseMaps object to hold our base layers
    var baseMaps = {
        "Satellite": satellite,
        "Grayscale": greyscale,
        'Outdoors': outdoors
    };

    var tPlates = new L.LayerGroup();
    var oInfo = new L.LayerGroup();
    var sInfo = new L.LayerGroup();

    // Create overlay object to hold our overlay layer
    var overlayMaps = {
        'Earthquakes': earthquakes,
        'Tectonic Plates': tPlates,
        'Orogens': oInfo,
        'Steps': sInfo
    };

    // Create our map, giving it the streetmap and earthquakes layers to display on load
    var myMap = L.map("map", {
        worldCopyJump: true,
        center: [
            37.09, -95.71
        ],
        zoom: 5,
        layers: [satellite, earthquakes, tPlates, oInfo, sInfo]
    });

    // Tectonic plate data
    d3.json(tectonicInfo, function (plateData) {
        L.geoJSON(plateData, {
                color: "purple",
                weight: 2
            })
            .addTo(tPlates);
    });

    d3.json(orogensInfo, function (oData) {
        L.geoJSON(oData, {
                color: "pink",
                fillOpacity: .5,
                weight: 2
            })
            .addTo(oInfo);
    });

    d3.json(stepsInfo, function (sData) {
        L.geoJSON(sData, {
                color: "blue",
                weight: 2
            })
            .addTo(sInfo);
    });

    // Create a layer control
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(myMap);

    // Set up the legend - from https://leafletjs.com/examples/choropleth/
    var legend = L.control({
        position: "bottomright"
    });

    var legend = L.control({
        position: "bottomright"
    });
    legend.onAdd = function () {
        var div = L.DomUtil.create('div', 'info legend'),
            grades = [0, 1, 2, 3, 4, 5],
            labels = [];

        // loop through our density intervals and generate a label with a colored square for each interval
        for (var i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<i style="background:' + getColor(grades[i] + 1) + '"></i> ' +
                grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
        }

        return div;
    };
    // Adding legend to the map
    legend.addTo(myMap);
}

// -------

// Color function - from https://leafletjs.com/examples/choropleth/
function getColor(d) {
    return d > 5 ? '#800026' :
        d > 4 ? '#FF5733' :
        d > 3 ? '#FF5715' :
        d > 2 ? '#FFC300' :
        d > 1 ? '#7DFF33' :
        '#DAF7A6';
}

function setRadius(magRad) {
    return magRad * 5
}