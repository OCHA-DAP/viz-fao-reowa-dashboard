var map = L.map('MapInform',
    {
  
        /*maxZoom: 18,
        minZoom: 2,*/
        zoomControl: false
    });
 map.setView([12, 0], 10)
 map.setZoom(3);
L.tileLayer('https://api.mapbox.com/styles/v1/mapbox/traffic-day-v1/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiYW1hZG91MTciLCJhIjoib3NhRnROQSJ9.lW0PVXVIS-j8dGaULTyupg', {
    attribution: '<a href="http://mapbox.com">Mapbox</a>'
}).addTo(map);

map.doubleClickZoom.disable();
map.scrollWheelZoom.disable();
map.keyboard.disable();
map.dragging.disable();
Winheight = $(window).height("#MapInform");
    // $("#MapInform").css("background-color","#FFFFFF");
     $('.leaflet-control-attribution').hide();

var geojson;
function highlightFeature(e) {
    var layer = e.target;

    layer.setStyle({
        weight: 5,
    });

    if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
        layer.bringToFront();
    }
}

function resetHighlight(e) {
    geojson.resetStyle(e.target);
}

function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
    });
    layer.bindPopup('<h6>'+ feature.properties['country_name']+ '</h6>' + '<h6>'+feature.properties['projet'] +' projets'+'</h6>'+'<h6>'+feature.properties['menage_beneficiaire'] +' ménages bénéficiaires'+'</h6>');//+'<h6>'+'Montant du financement reçu: '+feature.properties['financement']+ ' millions de dollars'+'</h6>');
    layer.on('mouseover', function (e) {
            this.openPopup();
        });
        layer.on('mouseout', function (e) {
            this.closePopup();
        });
}

function style(feature) {
    if (feature.properties.projet == 6) {
        return {

            fillColor: '#d95f0e',
            weight: 2,
            opacity: 0.6,
            color: '#d95f0e',
            fillOpacity: 0.8
        };
        } else if (feature.properties.projet == 5) {
        return {

            fillColor: '#d95f0e',
            weight: 2,
            opacity: 0.6,
            color: '#d95f0e',
            fillOpacity: 0.5
        };
    } else if (feature.properties.projet == 4) {
        return {

            fillColor: '#fec44f',
            weight: 2,
            opacity: 0.6,
            color: '#fec44f',
            fillOpacity: 0.5
        };
    } else if (feature.properties.projet == 3) {
        return {
            fillColor: '#ffeda0',
            weight: 2,
            opacity: 0.6,
            color: '#ffeda0',
            fillOpacity: 0.5
        };
    } else if (feature.properties.projet == 2) {
        return {
            fillColor: '#fff7bc',
            weight: 2,
            opacity: 0.6,
            color: '#fff7bc',
            fillOpacity: 0.5
        };
    }
}

geojson = L.geoJson(faoCountry, {
    style: style,
    onEachFeature: onEachFeature
}).addTo(map);

