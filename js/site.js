function hxlProxyToJSON(input){
    var output = [];
    var keys = [];
    input.forEach(function(e,i){
        if(i==0){
            e.forEach(function(e2,i2){
                var parts = e2.split('+');
                var key = parts[0]
                if(parts.length>1){
                    var atts = parts.splice(1,parts.length);
                    atts.sort();                    
                    atts.forEach(function(att){
                        key +='+'+att
                    });
                }
                keys.push(key);
            });
        } else {
            var row = {};
            e.forEach(function(e2,i2){
                row[keys[i2]] = e2;
            });
            output.push(row);
        }
    });
    return output;
}
function generateringComponent(vardata, vargeodata){
var lookup = genLookup(vargeodata) ;
var map = dc.leafletChoroplethChart('#map');
var activityChart = dc.rowChart('#activite');
var fundChart = dc.rowChart('#financement');
var cf = crossfilter(vardata) ;
var all = cf.groupAll();
var mapDimension = cf.dimension(function(d) { return d['#country+code']});
var mapGroup = mapDimension.group().reduceSum(function(d){ return d['#reached+households']});
var activityDimension = cf.dimension(function(d) {return d['#activity+name']});
var activityGroup = activityDimension.group().reduceSum(function(d){return d['#reached+people']});
var fundDimension = cf.dimension(function(d){return d['#country+name']});
var fundGroup = fundDimension.group().reduceSum(function(d){return d['#value+funding+total+usd']});
dc.dataCount('#count-info')
  .dimension(cf)
  .group(all);

//Row chart bénéficiaires par activité
activityChart
            .width(400)
            .height(310) 
    .margins({
            top: 10,
            right: 30,
            bottom: 30,
            left: 50
          })
            .dimension(activityDimension)
            .group(activityGroup)
            .elasticX(true)
            .data(function(group) {
                return group.top(Infinity);
            })
            //.filter(function(d) { return d.key !== ""; })
            .colors('#4169E1')
            .colorAccessor(function(d, i){return 0;})
            .xAxis().ticks(5);
  //rowChart financement par pays
  fundChart
            .width(400)
            .height(310) 
    .margins({
            top: 10,
            right: 30,
            bottom: 30,
            left: 50
          })
            .dimension(fundDimension)
            .group(fundGroup)
            .elasticX(true)
            .data(function(group) {
                return group.top(Infinity);
            })
            //.filter(function(d) { return d.key !== ""; })
            .colors('#4169E1')
            .colorAccessor(function(d, i){return 0;})
            .xAxis().ticks(4);
  //Map          
   map.width($('#mapChart').width())
       .height(300)
       .dimension(mapDimension)
       .group(mapGroup)
       .center([27.85,85.1])
       .zoom(8) 
       .geojson(vargeodata)
       .colors(['#DDDDDD', '#fff7bc', '#ffeda0', '#fec44f', '#d95f0e'])
       .colorDomain([0,5])
       .colorAccessor(function (d){
        var c = 0
           if (d>55000) {
                 c = 4;
               } else if (d>50000) {
                    c = 3;
               } else if (d>10000){
                  c = 2;
               } else if (d>0) {
                c = 1;
               }
               return c
        })
       .featureKeyAccessor(function (feature){
          return feature.properties['country_code'];
          }).popup(function (d){
          return '<h6>'+ 'Pays: '+d.properties['country_name']+'</h6>'
           +'<h6>'+'Nombre de projets: '+d.properties['projet']+ '</h6>'+'<h6>'
            +'Ménages bénéficiaires'+'</h6>';
       })
          
        .renderPopup(true);
       
       
      dc.renderAll();

      var map = map.map({ 
        maxZoom: 3,
        minZoom: 3
      });

      zoomToGeom(vargeodata);
      function zoomToGeom(geodata){
        var bounds = d3.geo.bounds(geodata) ;
        map.fitBounds([[bounds[0][1],bounds[0][0]],[bounds[1][1],bounds[1][0]]])
            .setZoom(3)
            .setView([20, 0],3)
            .dragging.disable();
      }
        map.keyboard.disable();
    
     
      function genLookup(geojson) {
        var lookup = {} ;
        geojson.features.forEach(function (e) {
          lookup[e.properties['country_code']] = String(e.properties['country_name']);
        });
        return lookup ;
      }
}

/*var dataCall = $.ajax({
    type: 'GET',
    url: 'data/data.json',
    dataType: 'json',
});*/
var dataCall = $.ajax({
  type: 'GET',
  url: 'https://proxy.hxlstandard.org/data.json?strip-headers=on&force=on&url=https%3A%2F%2Fdocs.google.com%2Fspreadsheets%2Fd%2F1_csDhgYdfvgaumE8uqKBRmh_JEpyem3XFuXuJ9WvbNw%2Fedit%23gid%3D785867042',
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
    var dat = hxlProxyToJSON(dataArgs[0]);
    generateringComponent(dat,geom);

});

// testing