
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
  for(let util = 0; util + delta <= 1; util += 0.01)
  {
    var coefficient = (maxPrice - minPrice) / exponent;
    var start_u   = util;
    var end_u     = util + delta;
    price = minPrice * (end_u - start_u) + coefficient * (Math.pow(end_u, exponent) - Math.pow(start_u, exponent));
    res.push({x: util, y: price/10000});
  }
  return res;
};

var options = {
  legend: {
    display: false
  },
  title: {
    display: true,
    text: "Price to rent",
  },
  elements: {
      point:{
          radius: 0
      }
  },
  scales: {
    xAxes: [{
      type: 'linear',
      scaleLabel: {
        display: true,
        labelString: 'Network Utilization'
      },
      ticks: {
        suggestedMin: 0,
        suggestedMax: 1,
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
    mode: 'nearest',
    intersect : false,
    callbacks: {
      title: function(tooltipItems, data) {
        var label = Math.round(tooltipItems[0].xLabel * 100);
        return label + '% Utilization';
      },
      label: function(tooltipItems, data) {
        var label = Math.round(tooltipItems.yLabel * 10000) / 10000;
        return label + ' EOS';
      }
    }
  },
};

function drawChart() {

  var min = parseInt(minPrice.value);
  var max = parseInt(maxPrice.value);
  var expo = parseInt(exponent.value);
  var delta = parseFloat(powerUp.value);

  var prices = calcPrices(min*10000, max*10000, expo, delta/100);
  var data = chartJsData(prices);
  options.title.text = `Price to rent ${delta}% of network capacity for 24 hours`;
  if (window.chart) {
    window.chart.data = data;
    window.chart.options = options;
    window.chart.update();
  } else {
    window.chart = new Chart(document.getElementById("chart-canvas"), {
      type: "line",
      options: options,
      data: data
    });
  }
};

function msToMinutesAndSeconds(ms) {
  var minutes = ms / 60000;
  var seconds = (ms % 60000) / 1000;
  if(minutes > 1) return minutes.toFixed(2) + " min";
  if(seconds > 1) return seconds.toFixed(2) + " s";
  return ms.toFixed(0) + " ms";
}

function updateMs() {

  var delta = parseFloat(powerUp.value);
  var ms = 200 * 2 * 60 * 60 * 24 * delta / 100;
  document.getElementById('powerup-ms').innerHTML = ` equals ~${msToMinutesAndSeconds(ms)} in CPU`;
}

function enforceMinMax(el){
  if(el.value != ""){
    if(parseInt(el.value) < parseInt(el.min)){
      el.value = el.min;
    }
    if(parseInt(el.value) > parseInt(el.max)){
      el.value = el.max;
    }
  }
}

var priceSlider = document.getElementById('slider-prices');
var powerupSlider = document.getElementById('slider-powerup');
var minPrice = document.getElementById('input-minprice');
var maxPrice = document.getElementById('input-maxprice');
var powerUp = document.getElementById('input-powerup');
var exponent = document.getElementById('input-exponent');


noUiSlider.create(powerupSlider, {
  connect: [true, false],
  behaviour: 'drag-tap',
  start: [0.1],
  range: {
      'min': [0.00001],
      '50%': [1],
      '70%': [10],
      'max': [100]
  },
  pips: {
    mode: 'values',
    values: [0, 1, 10, 100],
    density: 4,
    stepped: true
}
});

powerupSlider.noUiSlider.on('update', function (values, handle) {

  var value = parseFloat(values[handle]);
  if(value < this.options.range.min[0]) value = this.options.range.min[0];
  powerUp.value = value;
  updateMs();

});

powerupSlider.noUiSlider.on('end', function (values, handle) {

  drawChart();
});

noUiSlider.create(priceSlider, {
  connect: true,
  behaviour: 'drag-tap',
  start: [10000, 400000],
  range: {
      'min': 0,
      'max': 1000000
  }
});

priceSlider.noUiSlider.on('update', function (values, handle) {

  var value = parseInt(values[handle]);

  if (!handle) {
    minPrice.value = Math.round(value);
  } else {
    maxPrice.value = Math.round(value);
  }
});

priceSlider.noUiSlider.on('end', function (values, handle) {

  drawChart();
});

minPrice.addEventListener('change', function () {
  enforceMinMax(this);
  priceSlider.noUiSlider.set([this.value, null]);
  drawChart();
});

maxPrice.addEventListener('change', function () {
  enforceMinMax(this);
  priceSlider.noUiSlider.set([null, this.value]);
  drawChart();
});

exponent.addEventListener('change', function () {
  enforceMinMax(this);
  drawChart();
});

powerUp.addEventListener('change', function () {
  enforceMinMax(this);
  updateMs();
  drawChart();
});
powerUp.dispatchEvent(new Event('change'));

drawChart();
