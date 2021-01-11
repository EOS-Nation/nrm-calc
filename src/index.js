
var chartJsData = function (prices) {
  return {
  datasets: [
    {
      label: "Price",
      showLine: true,
      data: prices,
      backgroundColor: "rgb(255, 99, 132)"
    }
  ]
  };
};

var calcPrices = function (minPrice, maxPrice, exponent, delta) {
  const res = new Array();
  for(let util=0; util+delta<1; util+=0.1)
  {
    var coefficient = (maxPrice - minPrice) / exponent;
    var start_u   = util;
    var end_u     = util + delta;
    price = minPrice * (end_u - start_u) + coefficient * (Math.pow(end_u, exponent) - Math.pow(start_u, exponent));
    res.push({x: util, y: price/10000});
    console.log(coefficient, minPrice, maxPrice, delta, ": ", minPrice * (end_u - start_u), Math.pow(end_u, exponent), Math.pow(start_u, exponent), coefficient * (Math.pow(end_u, exponent) - Math.pow(start_u, exponent)));
    console.log("Util:", util, "Price:", price/10000);
  }
  return res;
};

var options = {
  title: {
    display: true,
    text: "Price to power up",
  },
  scales: {
    xAxes: [{
      type: 'linear',
      scaleLabel: {
        display: true,
        labelString: 'Utilization'
      },
      ticks: {
        callback: function(value, index, values) {
          return value*100 + '%';
        }
      }
    }],
    yAxes: [{
      scaleLabel: {
        display: true,
        labelString: 'Price, EOS'
      },
      ticks: {
        beginAtZero: true
      }
    }]
  },
  tooltips: {
    enabled: true,
    callbacks: {
      title: function(tooltipItems, data) {
        var label = Math.round(tooltipItems[0].xLabel * 100);
        return label + '% Utilization';
      },
      label: function(tooltipItems, data) {
        var label = Math.round(tooltipItems.yLabel * 100) / 100;
        return label + ' EOS';
      }
    }
  },
};

var drawChart = function (minPrice, maxPrice, exponent, delta) {

  var prices = calcPrices(minPrice, maxPrice, exponent, delta);
  var data = chartJsData(prices);
  options.title.text = `Price to rent ${delta*100}% of network capacity`;
  if (window.chart) {
    window.chart.data = data;
    window.chart.update();
  } else {
    window.chart = new Chart(document.getElementById("chart-canvas"), {
      type: "line",
      options: options,
      data: data
    });
  }
};

drawChart(10000*10000, 400000*10000, 4, 0.001);
