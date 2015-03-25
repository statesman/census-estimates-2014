define(['d3', 'lib/utils'], function(d3, utils) {
  var el = d3.select('#brush'),
      elWidth = el.node().getBoundingClientRect().width - 15;

  var margin = {top: 0, right: 15, bottom: 30, left: 15},
    width = elWidth - margin.left - margin.right,
    height = 50 - margin.top - margin.bottom;

  var x = d3.scale.linear()
      .domain([2010, 2014])
      .range([0, width]);

  var brush = d3.svg.brush()
      .x(x)
      .extent([2013, 2014])
      .on('brush', brushed);

  var svg = el.append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
  .append('g')
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  svg.append("rect")
    .attr("class", "grid-background")
    .attr("rx", 6)
    .attr("ry", 6)
    .attr('y', 4)
    .attr("width", width)
    .attr("height", 12);

  svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.svg.axis()
      .scale(x)
      .orient("bottom")
      .ticks(5)
      .tickFormat(function(d) {
        return d.toString();
      })
      .tickPadding(0))
    .selectAll("text")
      .attr("y", 10);

  var gBrush = svg.append("g")
    .attr("class", "brush")
    .call(brush);

  var handleWidth = 6;
  gBrush.selectAll('.resize').append('rect')
    .attr('class', 'handle')
    .attr('x', handleWidth / 2 * -1)
    .attr('height', height)
    .attr("rx", 0)
    .attr("ry", 2)
    .attr('width', handleWidth);

  gBrush.select('.extent')
    .attr('y', 8)
    .attr('height', 4);

  function brushed() {
    var extent0 = brush.extent(),
        extent1;

    // if dragging, preserve the width of the extent
    if (d3.event.mode === "move") {
      var d0 = d3.round(extent0[0]),
          d1 = d0 + Math.round(extent0[1] - extent0[0]);
      extent1 = [d0, d1];
    }

    // otherwise, if resizing, round both dates
    else {
      extent1 = extent0.map(Math.round);

      // if empty when rounded, use floor & ceil instead
      if (extent1[0] >= extent1[1]) {
        extent1[0] = Math.floor(extent0[0]);
        extent1[1] = Math.ceil(extent0[1]);
      }
    }

    d3.select(this).call(brush.extent(extent1));
  }

  // Handle window resizing
  d3.select(window).on('resize.brush', utils.debounce(resize, 350));
  function resize() {
    // Get the new size of the parent el
    elWidth = el.node().getBoundingClientRect().width - 15;
    width = elWidth - margin.left - margin.right;

    // Update the scale
    x.range([0, width]);

    // Then resize the weight-dependent parts
    svg.attr('width', width + margin.left + margin.right);
    svg.select('.grid-background').attr("width", width);

    // Redraw the axis
    var axis = d3.select('.x.axis');
    axis.selectAll('.tick')
      .attr('transform', function(d) {
        return 'translate(' + x(d) + ', 0)';
      });

    // And fire the brush callback to reposition it
    brush.event(d3.select(".brush"));
  }

  return brush;

});
