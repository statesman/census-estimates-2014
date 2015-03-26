require(['d3', 'topojson', 'd3-tip', 'lib/brush', 'lib/utils', 'lib/states'], function(d3, topojson, d3tip, brush, utils, states) {

  'use strict';

  // Setup our SVG
  var aspect = 960 / 900;

  var el = d3.select('#county-map'),
      width = el.node().getBoundingClientRect().width,
      height = width / aspect;

  var svg = el.append('svg')
      .attr('width', width)
      .attr('height', height);

  var scale = function() {
    return 5.5 * width;
  };

  // Setup the projection
  var projection = d3.geo.conicConformal()
    .center([2, 31.15])
    .rotate([102, 0])
    .scale(scale())
    .translate([width / 2, height / 2]);

  // Path generator
  var path = d3.geo.path()
    .projection(projection);

  // A formatter for the whole population numbers
  var popFormat = d3.format('0,0');

  // Color scale
  var color = d3.scale.linear()
    .clamp(true)
    .domain([-0.04, 0, 0.04])
    .range(['#bf6742', '#fffefd', '#395271']);

  // A helper to shade the counties baed on percent change
  var shadeCounties = function() {
    this.attr('fill', function(d) {
      return color(utils.percentChange(d.properties['p' + utils.compare.start], d.properties['p' + utils.compare.end]));
    });
  };

  // Legend
  var legendRectSize = 15;
  var legendSpacing = 4;
  var legendBox = svg.append('g')
    .attr('transform', 'translate(25, 35)')
    .attr('class', 'legend');
  legendBox.append('text')
    .attr('class', 'label-head')
    .text('Legend');
  var legend = legendBox.selectAll('.legend-item')
    .data(color.domain().reverse())
    .enter()
    .append('g')
    .attr('class', 'legend-item')
    .attr('transform', function(d, i) {
      var height = legendRectSize + legendSpacing;
      var offset =  10;
      var vert = i * height + offset;
      return 'translate(0,' + vert + ')';
    });
  legend.append('rect')
    .attr('width', legendRectSize)
    .attr('height', legendRectSize)
    .style('fill', color);
  legend.append('text')
    .attr('x', legendRectSize + legendSpacing * 2)
    .attr('y', legendRectSize - legendSpacing + 1)
    .text(function(d) {
      var p = utils.changeFormat(d);
      if(p !== '0%') {
        p += '+';
      }
      return p;
    });

  d3.json('data/counties.topojson', function(err, counties) {
    if (err) return console.error(err);

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
            '<strong>2011:</strong> ' + popFormat(d.properties.p2011) + utils.popChangeText(d.properties.p2010, d.properties.p2011) + '<br />' +
            '<strong>2012:</strong> ' + popFormat(d.properties.p2012) + utils.popChangeText(d.properties.p2011, d.properties.p2012) + '<br />' +
            '<strong>2013:</strong> ' + popFormat(d.properties.p2013) + utils.popChangeText(d.properties.p2012, d.properties.p2013) + '<br />' +
            '<strong>2014:</strong> ' + popFormat(d.properties.p2014) + utils.popChangeText(d.properties.p2013, d.properties.p2014) +
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
    brush.on('brushend', function(evt) {
      var range = brush.extent();
      utils.compare.start = range[0];
      utils.compare.end = range[1];

      var diff = range[1] - range[0];

      var perYear = 0.04;
      color.domain([perYear * diff * -1, 0, perYear * diff]);

      d3.selectAll('.legend-item')
        .select('text')
        .data(color.domain().reverse())
        .text(function(d) {
          var p = utils.changeFormat(d);
          if(p !== '0%') {
            p += '+';
          }
          return p;
        });

      yearChange();
      states.update();
    });

    d3.select(window).on('resize', utils.debounce(resize, 350));

    function resize() {
      // Get new element size
      width = el.node().getBoundingClientRect().width;
      height = width / aspect;

      // Resize SVG
      svg
        .attr('width', width)
        .attr('height', height);

      // Update projection based on new size
      projection
        .scale(scale())
        .translate([width / 2, height / 2]);

      // Redraw counties
      d3.selectAll('.counties path')
        .attr('d', path);

      // And county border
      d3.select('path.county-borders')
        .attr('d', path);

      // And state border
      d3.select('path.texas-border')
        .attr('d', path);
    }
  });

});
