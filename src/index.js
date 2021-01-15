
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
    var price = minPrice * (end_u - start_u) + coefficient * (Math.pow(end_u, exponent) - Math.pow(start_u, exponent));
    res.push({x: util, y: price/10000});
  }
  return res;
};

//EOS Argentina formula - https://docs.google.com/document/d/11Eqc4y48NkoMXlgDxAhjRnEbStCWe6S6-RJCmJuEiaI/editz
var calcPrices2 = function (minPrice, C, exponent, delta) {
  const res = new Array();
  var k1 = (C - minPrice) / 99;
  var k2 = k1 - minPrice;
  for(let util = 0; util + delta <= 1; util += 0.01)
  {
    var price = k1/(1 - util) - k2 * util;
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
    text: "Fee to reserve",
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
        labelString: 'Fee, EOS'
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
  options.title.text = `Fee to reserve ${delta}% of network capacity for 24H`;
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
  window.history.replaceState(null, null, window.location.pathname+'?&powerup='+powerUp.value+'&minprice='+minPrice.value+'&maxprice='+maxPrice.value+'&exponent='+exponent.value);
};

function msToMinutesAndSeconds(ms) {
  var minutes = ms / 60000;
  var seconds = (ms % 60000) / 1000;
  if(minutes > 1) return minutes.toFixed(2) + " min";
  if(seconds > 1) return seconds.toFixed(2) + " s";
  return ms.toFixed(0) + " ms";
}

function bytesToXBytes(bytes) {
  if(Math.floor(bytes/(1024*1024*1024))) return (bytes/(1024*1024*1024)).toFixed(2) + " GB";
  if(Math.floor(bytes/(1024*1024))) return (bytes/(1024*1024)).toFixed(2) + " MB";
  if(Math.floor(bytes/(1024))) return (bytes/(1024)).toFixed(2) + " KB";
  return bytes.toFixed(0) + " B";
}

function parseUrl(url)  //workaround for edge that doesn't support URLSearchParams
{
    if (url == "") return {};
    const ret = {};
    for (var part of url)
    {
        const par=part.split('=', 2);
        if (par.length == 1)
            ret[par[0]] = "";
        else
            ret[par[0]] = decodeURIComponent(par[1].replace(/\+/g, " "));
    }
    return ret;
}

function updateCPUNET() {

  var delta = parseFloat(powerUp.value);
  var ms = 200 * 2 * 60 * 60 * 24 * delta / 100;
  var bytes = 1024*1024 * 2 * 60 * 60 * 24 * delta / 100;
  document.getElementById('powerup-cpunet').innerHTML = ` equals ~ ${msToMinutesAndSeconds(ms)} CPU or ${bytesToXBytes(bytes)} NET per 24H `;
}

function enforceMinMax(el){
  if(el.value != ""){
    if(parseFloat(el.value) < parseFloat(el.min)){
      el.value = el.min;
    }
    if(parseFloat(el.value) > parseFloat(el.max)){
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


const url = parseUrl(window.location.search.substr(1).split('&'));
powerUp.value = url['powerup'] || 4;
minPrice.value = url['minprice'] || 10000;
maxPrice.value = url['maxprice'] || 400000;
exponent.value = url['exponent'] || 4;


noUiSlider.create(powerupSlider, {
  connect: [true, false],
  behaviour: 'drag-tap',
  start: [powerUp.value],
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
  updateCPUNET();

});

powerupSlider.noUiSlider.on('end', function (values, handle) {

  drawChart();
});

noUiSlider.create(priceSlider, {
  connect: true,
  behaviour: 'drag-tap',
  start: [minPrice.value, maxPrice.value],
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
  var value = parseFloat(this.value);
  if(100*value == Math.ceil(100*value)) //slider has 2 decimal points resolution
    powerupSlider.noUiSlider.set([this.value]);
  updateCPUNET();
  drawChart();
});


powerUp.dispatchEvent(new Event('change'));

drawChart();
