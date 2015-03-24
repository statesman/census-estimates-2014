require(['d3', 'topojson', 'd3-tip'], function(d3, topojson, d3tip) {

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
      .range(['darkred', 'white', 'darkgreen']);
      //.range(['rgb(131, 29, 29)', '#fff', 'rgb(8, 48, 107)']);

    // A formatter for the whole population numbers
    var popFormat = d3.format('0,0');
    var changeFormat = function(d) {
      if(d < 0) {
        d *= -1;
      }
      return d3.round(d * 100, 1) + '%';
    };

    // Helper that generates the population change snippet in the tooltip
    var popChangeText = function(start, end) {
      var text = ' <span class="pull-right">';
      if(end > start) {
        text += '<i class="fa fa-arrow-up"></i>';
      }
      else if (end < start) {
        text += '<i class="fa fa-arrow-down"></i>';
      }
      return text + ' ' + changeFormat(percentChange(start, end)) + '</span>';
    };

    // Enable tool tips
    var tip = d3tip()
      .attr('class', 'popover top')
      .offset(function() {
        return [this.getBBox().height * 0.25, 0];
      })
      .html(function(d) {
        return '<h3 class="popover-title">' + d.id + '</h3>' +
          '<div class="arrow"></div>' +
          '<div class="popover-content">' +
            '<strong>2010:</strong> ' + popFormat(d.properties.p2010) + '<br />' +
            '<strong>2011:</strong> ' + popFormat(d.properties.p2011) + popChangeText(d.properties.p2010, d.properties.p2011) + '<br />' +
            '<strong>2012:</strong> ' + popFormat(d.properties.p2012) + popChangeText(d.properties.p2011, d.properties.p2012) + '<br />' +
            '<strong>2013:</strong> ' + popFormat(d.properties.p2013) + popChangeText(d.properties.p2012, d.properties.p2013) + '<br />' +
            '<strong>2014:</strong> ' + popFormat(d.properties.p2014) + popChangeText(d.properties.p2013, d.properties.p2014) +
          '</div>';
      });
    svg.call(tip);

    // Add paths for counties
    svg.selectAll('.county')
      .data(data)
    .enter().append('path')
      .attr('fill', function(d) {
        return color(d.change);
      })
      .attr('d', path)
      .on('mouseover', tip.show)
      .on('mouseout', tip.hide);

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
