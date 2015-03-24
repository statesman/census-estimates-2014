require(['d3', 'topojson'], function(d3, topojson) {

  'use strict';

  d3.json('data/counties.topojson', function(err, counties) {
    if (err) return console.error(err);

    var width = 960,
    height = 900;

    var svg = d3.select('#county-map').append('svg')
        .attr('width', width)
        .attr('height', height);

    // Get the county geos from the topo file
    var countyGeos = topojson.feature(counties, counties.objects.tl_2014_us_county_texas);

    // Setup the projection
    var projection = d3.geo.conicConformal()
      .center([2, 31.15])
      .rotate([102, 0])
      .scale(5550)
      .translate([width / 2, height / 2]);

    // Path generator
    var path = d3.geo.path()
      .projection(projection);

    // The years to compare
    var compare = {
      start: 2010,
      end: 2014
    };

    // Calculate percent change
    var percentChange = function(start, end) {
      return (end - start) / start;
    };

    // Extract features from topojson
    var countyGeo = topojson.feature(counties, counties.objects.tl_2014_us_county_texas).features;

    // Add percent change, so we can set our color scale
    var data = countyGeo.map(function(d) {
      d.change = percentChange(d.properties['p' + compare.start], d.properties['p' + compare.end]);
      return d;
    });

    // Color scale
    var color = d3.scale.linear()
      .domain([
        d3.min(data, function(d) {
          return d.change;
        }),
        0,
        d3.max(data, function(d) {
          return d.change;
        })
      ])
      .range(['rgb(131, 29, 29)', '#fff', 'rgb(8, 48, 107)']);

    // Add paths for counties
    svg.selectAll('.county')
      .data(data)
    .enter().append('path')
      .attr('fill', function(d) {
        return color(d.change);
      })
      .attr('d', path);

    // Add inner boundaries
    svg.append('path')
      .datum(topojson.mesh(counties, counties.objects.tl_2014_us_county_texas, function(a, b) {
        return a === b;
      }))
      .attr('d', path)
      .attr('class', 'texas-border');

    // Add outer boundaries
    svg.append('path')
      .datum(topojson.mesh(counties, counties.objects.tl_2014_us_county_texas, function(a, b) {
        return a !== b;
      }))
      .attr('d', path)
      .attr('class', 'county-borders');
  });

});
