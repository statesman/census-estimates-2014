define(function() {

  var exp = {};

  // The years we're comparing
  exp.compare = {
    start: 2013,
    end: 2014
  };

  // Calculate percent change
  exp.percentChange = function(start, end) {
    return (end - start) / start;
  };

  // A formatter for population change
  exp.changeFormat = function(d, pos) {
    if(d < 0 && pos) {
      d *= -1;
    }
    return d3.round(d * 100, 1) + '%';
  };

  // Helper that generates the population change snippet in the tooltip
  exp.popChangeText = function(start, end) {
    var text = ' <span class="pull-right">';
    if(end > start) {
      text += '<i class="fa fa-arrow-up"></i>';
    }
    else if (end < start) {
      text += '<i class="fa fa-arrow-down"></i>';
    }
    return text + ' ' + exp.changeFormat(exp.percentChange(start, end), true) + '</span>';
  };

  return exp;

});
