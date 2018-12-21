function generateringComponent(vardata, vargeodata){
var lookup = genLookup(vargeodata) ;
var Imap = dc.leafletChoroplethChart('#MapInform');
//var dataTab1 = dc.dataTable('#dataTable2');
//var dataTab2 = dc.dataTable('#dataTable1');
var cf = crossfilter(vardata) ;
var all = cf.groupAll();
var mapDimension = cf.dimension(function(d) { return d.country_code});
var mapGroup = mapDimension.group().reduceSum(function(d){ return d.projet});

dc.dataCount('#count-info')
  .dimension(cf)
  .group(all);
  
   Imap.width(100)
       .height(100)
       .dimension(mapDimension)
       .group(mapGroup)
       .label(function (p) { return p.key; })
       .renderTitle(true)
       .center([0,0])
       .zoom(0)
       .geojson(vargeodata)
       .colors(['#DDDDDD', '#fff7bc', '#ffeda0', '#fec44f', '#d95f0e'])
       .colorDomain([0,4])
       .colorAccessor(function (d){
        var c = 0
           if (d>5) {
                 c = 5;
               } else if (d>4) {
                    c = 4;
               } else if (d>3){
                  c = 3;
             
              } else if (d>0) {
                c = 1;
              }
               return c
        })
       .featureKeyAccessor(function (feature){
          return feature.properties['country_code'];
          }).popup(function (d){
          return '<h5>'+ d.properties['country_name'] +'</h5> '+'<b>'+'Nombre de projets'+'</b>';
       })
          
        .renderPopup(true);
//begin test
function style(feature) {
    if (feature.properties['country_code']) 
        return {

            fillColor:'#f03b20',
            weight: 4,
            opacity: 0.9,
            color: '#f03b20',
            fillOpacity: 0.9
        };
 }      
 
  
     Winheight = $(window).height();
     //$("#MapInform").css("background-color","#FFFFFF");
      
      dc.renderAll();

      var map = Imap.map({ 
        /*maxZoom: 5,
        minZoom: 3*/
      });

      zoomToGeom(vargeodata);
      function zoomToGeom(geodata){
        var bounds = d3.geo.bounds(geodata) ;
        map.fitBounds([[bounds[0][1],bounds[0][0]],[bounds[1][1],bounds[1][0]]])
            .setZoom(4)
            .setView([9.80, 10.37], 4)
            .dragging.disable();
      }
    map.keyboard.disable();
    
 var legend = L.control({position: 'topright'});

    legend.onAdd = function (map) {

        var div = L.DomUtil.create('div', 'info legend'),
            labels = ['75 - 90','90 - 110','110 - 150 ','150+'];
            colors =['#31a354','#addd8e','#f7fcb9','#ffeda0'];

        div.innerHTML = '<br />Légende<br />';
        for (var i = 0; i < labels.length; i++) {
            div.innerHTML +=
                '<i style="background:' + colors[i] + '"></i> ' + labels[3-i] +'<br />';
        }
        return div;
    };
     
      function genLookup(geojson) {
        var lookup = {} ;
        geojson.features.forEach(function (e) {
          lookup[e.properties['country_code']] = String(e.properties['country_name']);
        });
        return lookup ;
      }
}

var dataCall = $.ajax({
    type: 'GET',
    url: 'data/InformData2.json',
    dataType: 'json',
});

var geomCall = $.ajax({
    type: 'GET',
    url: 'data/faoCountry.geojson',
    dataType: 'json',
});

$.when(dataCall, geomCall).then(function(dataArgs, geomArgs){
    var geom = geomArgs[0];
    geom.features.forEach(function(e){
        e.properties['country_code'] = String(e.properties['country_code']);
    });
    generateringComponent(dataArgs[0],geom);
});
// testing