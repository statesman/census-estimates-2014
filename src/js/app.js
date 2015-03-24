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

    /*
    svg.append('path')
      .data(countyGeos)
      .attr('d', path);
    */

    svg.selectAll('.county')
      .data(topojson.feature(counties, counties.objects.tl_2014_us_county_texas).features)
    .enter().append('path')
      .attr('class', function(d) { return 'county ' + d.id; })
      .attr('d', path);
  });

});
