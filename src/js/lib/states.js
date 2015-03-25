define(['d3', 'lib/utils'], function(d3, utils) {

  var data = null;

  var el = d3.select('#state-pops');

  function writeState() {
    this.html(function(d) {
      return '<i class="stateface stateface-' + d.code + '"></i> <strong>' + d.code.toUpperCase() +
        '</strong> <span>' +
        utils.popChangeText(d['p' + utils.compare.start], d['p' + utils.compare.end]) + '</span>';
    });
  }

  d3.csv('data/statepops.csv', function(err, states) {
    if(err) return console.error(err);

    data = states;

    // Setup the individual states
    el.selectAll('div')
      .data(data)
      .enter()
      .append('div')
      .attr('class', 'col-xs-6 col-sm-4 col-md-6 state')
      .call(writeState);
  });

  return {
    update: function() {
      d3.selectAll('div.state')
        .call(writeState);
    }
  };

});
