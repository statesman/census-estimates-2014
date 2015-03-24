define(['d3'], function(d3) {

  var margin = {top: 0, right: 15, bottom: 30, left: 15},
    width = 960 - margin.left - margin.right,
    height = 50 - margin.top - margin.bottom;

  var x = d3.scale.linear()
      .domain([2010, 2014])
      .range([0, width]);

  var brush = d3.svg.brush()
      .x(x)
      .extent([2010, 2014])
      .on('brush', brushed);

  var svg = d3.select('#brush').append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
  .append('g')
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  svg.append("rect")
    .attr("class", "grid-background")
    .attr("width", width)
    .attr("height", height);

  svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.svg.axis()
      .scale(x)
      .orient("bottom")
      .ticks(5)
      .tickPadding(0))
    .selectAll("text")
      .attr("y", 10);

  var gBrush = svg.append("g")
    .attr("class", "brush")
    .call(brush);

  gBrush.selectAll("rect")
    .attr("height", height);

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

  return brush;

});
