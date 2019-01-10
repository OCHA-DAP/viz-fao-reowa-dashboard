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

//tooltip
var rowtip = d3.tip().attr('class', 'd3-tip').html(function (d) {
    return d.key + ': ' + d3.format('0,000')(d.value);

});

var formatNumber = function(d){
    return d3.format(',')(d);
}

function generateringComponent(vardata, vargeodata, funds){
var lookup = genLookup(vargeodata) ;
var map = dc.leafletChoroplethChart('#map');
var activityChart = dc.rowChart('#activite');
var fundChart = dc.rowChart('#financement');
var cf = crossfilter(vardata) ;
var cf1 = crossfilter(funds)
var all = cf.groupAll();
var mapDimension = cf.dimension(function(d) { return d['#country+code']});
var mapGroup = mapDimension.group().reduceSum(function(d){ return d['#reached+households']});
var activityDimension = cf.dimension(function(d) {return d['#activity+name']});
var activityGroup = activityDimension.group().reduceSum(function(d){return d['#reached+people']});
var fundDimension = cf1.dimension(function(d){return d['#country+name']});
var fundGroup = fundDimension.group().reduceSum(function(d){return d['#value+funding+total+usd']});
var personbenDimension = cf.dimension(function (d) {return d['#country+name']});
var personbenGroup = personbenDimension.group().reduceSum(function(d){return d['#reached+people']});
dc.dataCount('#count-info')
  .dimension(cf)
  .group(all);

//Row chart bénéficiaires par activité
activityChart
            .width(400)
            .height(310) 
            .margins({
              top: 5,
              right: 50,
              bottom: 20,
              left: 10
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
              top: 5,
              right: 50,
              bottom: 20,
              left: 10
            })
            .dimension(personbenDimension)
            .group(personbenGroup)
            .elasticX(true)
            .data(function(group) {
                return group.top(Infinity);
            })
            //.filter(function(d) { return d.key !== ""; })
            .colors('#4169E1')
            .colorAccessor(function(d, i){return 0;})
            .xAxis().ticks(4);
  //Map
  var mapColors = ['#DDDDDD','#A7C1D3','#71A5CA','#3B88C0', '#056CB6'];
   map
      .width($('#map').width())
      // .width(400)
       // .height(300)
       .dimension(mapDimension)
       .group(mapGroup)
       // .center([27.85,85.1])
       .center([0,0])
       .zoom(8)
       .geojson(vargeodata)
       .colors(mapColors)
       .colorDomain([0,5])
       .colorAccessor(function (d){
        /*var trueValue=1;
      NER  d==21617 ? trueValue= 38317:trueValue=d;
      BFA  d==18567 ? trueValue= 20550:trueValue=d;
      MLI  d==25756 ? trueValue= 29000:trueValue=d;
      MRT  d==21699 ? trueValue= 15600:trueValue=d;
      SEN  d==2300 ? trueValue = 14398:trueValue=d;
      TCD  d== 14232 ? trueValue=34500: trueValue=d;*/
        var c=0;
           if (d>25000) {
                 c = 4;
               } else if (d>18000) {
                    c = 3;
               } else if (d>14000){
                  c = 2;
                    } else if (d>2200){
                  c = 1;
               } else if (d>0) {
                c = 1;
               }
               return c
        })
       .featureKeyAccessor(function (d){
          return d.properties['country_code'];
          }).popup(function (feature){
          return '<h6><strong>'+(feature.properties['country_name']).toUpperCase()
          +'</strong><br>Nombre de projets: '+feature.properties['projet']
          +'<br>Financement reçu: '+feature.properties['financement']+ ' $'
          +'<br>Ménages bénéficiaires: '+feature.properties['menage_beneficiaire']
          +'</h6>';
       });

      dc.renderAll();
      d3.selectAll('g.row').call(rowtip);
      d3.selectAll('g.row').on('mouseover', rowtip.show).on('mouseout', rowtip.hide);

      var map = map.map({ 
        maxZoom: 3,
        minZoom: 3
      });

      // var map = map.map();
      // map.options.maxZoom = 3;
      // map.options.minZoom = 3;

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
      $('.viz-container').show();
      $('.loader').hide();
}
var sortData = function(d1, d2) {
    if (d1.key > d2.key) return 1;
    if (d1.key < d2.key) return -1;
    return 0;
};

function generateC3Charts (argument) {
  var cf = crossfilter(argument);
  var dim = cf.dimension(function(d){ return [d['#activity+name'], d['#country+name'], d['#activity+type']]; });
  var grp = dim.group().reduceSum(function(d){ return d['#value']; }).top(Infinity).sort(sortData);

  var indics = cf.dimension(function(d){ return d['#activity+name']; });
  var gp = indics.group().top(Infinity);

  var indicatorNames = [];
  for (var i = gp.length - 1; i >= 0; i--) {
    indicatorNames.push(gp[i].key);
  }
  $('#c3chart').html('');
  for (var i = 0; i < indicatorNames.length; i++) {
    //i = nom de l'indicateur en cours
    $('#c3chart').append('<div class="col-md-4"><h5>'+indicatorNames[i]+'</h5><div id="chart'+i+'"></div></div>');
    let qteDistribue = ['Atteint'],
        qtePrevue = ['Cible'],
        countries = ['x'];
    for (var j = 0; j < grp.length; j++) {
      if (grp[j].key[0] == indicatorNames[i]) {
        grp[j].key[2] == "Cible" ? qtePrevue.push(grp[j].value): qteDistribue.push(grp[j].value);
        let test = 0;
        for (p in countries){
          grp[j].key[1]==countries[p] ? test++ : null;
        }
        test === 0 ? countries.push(grp[j].key[1]) : null;
      }
    } //end of for (j)

    i == 5 ? $('#c3chart').append('<div class="clearfix"></div>'): null;
    generateC3(countries,qteDistribue,qtePrevue,i);
  } //end of for (i)

} //end of generateC3Charts

var blueColor = '#6787E7',
    greenColor = '#6AA84F';

function generateC3(x, data1, data2, bind) {
  var xAxis = x,
      cible = data1,
      atteint = data2;

  var chart =  c3.generate({
                bindto: '#chart'+bind,
                data: {
                    x: 'x',
                    type: 'bar',
                    columns: [xAxis, cible, atteint],
                },
                color: {
                    pattern: [blueColor, greenColor]
                },
                axis: {
                    x: {
                        type: 'category',
                        tick: {
                          centered: true,
                         // rotate: 38,
                          outer: false,
                        
                    }
                    },
                    y: {
                        tick:{
                          count: 6,
                          format: d3.format('.2s'),
                        }
                    }
                },
                size: {
                    height: 250
                },
                padding: {left:30},
                legend: {
                  hide: true
                },
                tooltip:{
                    format: {
                        value: function(value, ratio, id ){
                            return d3.format('0.000')(value);
                        }
                    }
                }
    });
  // $('#chart'+bind).data('chartObj', chart);
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

// debut Amadu's code

var data2Call = $.ajax({
  type: 'GET',
  url: 'https://proxy.hxlstandard.org/data.json?strip-headers=on&url=https%3A%2F%2Fdocs.google.com%2Fspreadsheets%2Fd%2F1_csDhgYdfvgaumE8uqKBRmh_JEpyem3XFuXuJ9WvbNw%2Fedit%23gid%3D785657249&force=on',
  dataType: 'JSON'

});
var dataFundsCall = $.ajax({
  type: 'GET',
  url: 'https://proxy.hxlstandard.org/data.json?strip-headers=on&force=on&url=https%3A%2F%2Fdocs.google.com%2Fspreadsheets%2Fd%2F1_csDhgYdfvgaumE8uqKBRmh_JEpyem3XFuXuJ9WvbNw%2Fedit%23gid%3D642629955', 
  dataType: 'JSON'
});

$.when(dataCall, geomCall, data2Call, dataFundsCall).then(function(dataArgs, geomArgs, data2Args, dataFundsArgs){
    var geom = geomArgs[0];
    geom.features.forEach(function(e){
        e.properties['country_code'] = String(e.properties['country_code']);
    });
    var dat = hxlProxyToJSON(dataArgs[0]);
    var fund = hxlProxyToJSON(dataFundsArgs[0]);
    generateringComponent(dat, geom, fund);
console.log(fund)
    var data = hxlProxyToJSON(data2Args[0]);
    generateC3Charts(data);

});

// testing