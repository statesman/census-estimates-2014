require(['d3', 'topojson', 'd3-tip'], function(d3, topojson, d3tip) {

  'use strict';

  var startYear = d3.select('#start-year'),
      endYear = d3.select('#end-year');

  // The (default) years to compare
  var compare = {
    start: startYear[0][0].value,
    end: endYear[0][0].value
  };

  // Setup our SVG
  var width = 960, height = 900;

  var svg = d3.select('#county-map').append('svg')
      .attr('width', width)
      .attr('height', height);

  // Setup the projection
  var projection = d3.geo.conicConformal()
    .center([2, 31.15])
    .rotate([102, 0])
    .scale(5550)
    .translate([width / 2, height / 2]);

  // Path generator
  var path = d3.geo.path()
    .projection(projection);

  // Calculate percent change
  var percentChange = function(start, end) {
    return (end - start) / start;
  };

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

  // Color scale
  var color = d3.scale.linear()
    .clamp(true)
    .domain([-0.1, 0, 0.1])
    .range(['darkred', 'white', 'darkgreen']);

  // A helper to shade the counties baed on percent change
  var shadeCounties = function() {
    this.attr('fill', function(d) {
      return color(percentChange(d.properties['p' + compare.start], d.properties['p' + compare.end]));
    });
  };

  d3.json('data/counties.topojson', function(err, counties) {
    if (err) return console.error(err);

    // Get the county geos from the topo file
    var countyGeos = topojson.feature(counties, counties.objects.tl_2014_us_county_texas);

    // Extract features from topojson
    var countyGeo = topojson.feature(counties, counties.objects.tl_2014_us_county_texas).features;

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
    svg.append('g')
      .attr('class', 'counties')
      .selectAll('.county')
      .data(countyGeo)
      .enter()
        .append('path')
        .call(shadeCounties)
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

    // Handle year chages
    var yearChange = function() {
      svg.select('.counties')
        .selectAll('path')
        .call(shadeCounties);
    };
    startYear.on('input', function() {
      compare.start = this.value;
      yearChange();
    });
    endYear.on('input', function() {
      compare.end = this.value;
      yearChange();
    });
  });

});
