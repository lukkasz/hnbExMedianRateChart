(function(window, $, Chart){
  'use strict';    
  
  var HnbexMedianRatesChart = {
    
    dates: null,
    selectedCurrency: null,
    charInstance: null,
    
    settings: {
      $chartForm: $('#chart-form'),
      $currency: $('#currency'),
      $ctx: $('#chart'),
      $inputDates: $('input.date'),

      chartOpt: {
        barType: 'bar',
        options: {
          scales: {
            yAxes: [{
              ticks: {
                beginAtZero: true
              },
            }]
          }
        },
        bgColors: [
          'rgba(255, 99, 132, 0.4)',
          'rgba(54, 162, 235, 0.4)'
        ]
      }
    },
    
    init: function(){
      var self = this;
      self.bindUIActions();
      self.drawChart();
    },
    
    bindUIActions: function() {
      var self = this;
      self.settings.$chartForm.submit(self.handleFormSubmit.bind(self));
    },
    
    handleFormSubmit: function(e) {
      var self = this;
      var rates = null;
      var medianRates = null;
      
      self.dates = [];
      self.selectedCurrency = self.settings.$currency.val();
      
      self.settings.$inputDates.each(function(key, element){
        var $self = $(this);
        if (!$self.val()) {
          $self.val($self.attr('placeholder'));
        } 
        self.dates.push($(this).val());  
      });
      
      hnbexAPIhelper.getRates(self.dates)
        .then(function(ratesArray){
          rates = self.findByCurrency(ratesArray, self.selectedCurrency);
          
          medianRates = self.getMedianRate(rates);
          
          self.drawChart(medianRates);
        })
        .catch(function(e){
          console.warn("Error:", e);
      });
      
      e.preventDefault();
    },
    
    findByCurrency: function(ratesArray, currency){
      return ratesArray.map(function(rates){
        return rates.find(function(rate){
          return rate.currency_code === currency;
        });
      });
    },
    
    getMedianRate: function(rates){
      return rates.map(function(item) {
        return item.median_rate;
      });
    },
    
    drawChart: function(data){
      var self = this;
      var chartDataSets = null;
      
      if(!self.charInstance) {
        self.charInstance = new Chart(self.settings.$ctx, {
          type: self.settings.chartOpt.barType,
          options: self.settings.chartOpt.options
        });  
      }
      
      if(!data) {
        return self.charInstance;
      }
      
      chartDataSets = data.map(function(medinaRate, i){
        return {
          label: self.dates[i],
          data: [medinaRate],
          backgroundColor: self.settings.chartOpt.bgColors[i]
        };
      });
      
      self.charInstance.data.datasets = chartDataSets;
      self.charInstance.data.labels = [self.selectedCurrency];
      self.charInstance.update();
      
    }
  };
  
  
  var hnbexAPIhelper = {

    settings: {
      url: 'http://hnbex.eu/api/v1/rates/daily/' 
    },
    
    getRates: function(dates) {
      var self = this;
      var promisesArray = self.createAjaxRequest(dates);
      
      return Promise.all(promisesArray);
    },
    
    createAjaxRequest: function(dates){
      var self = this;
      
      return dates.map(function(date){
        return $.ajax({
          url: self.settings.url,
          data: { date: date},
          dataType: "jsonp",
    	    type: "GET"
        });
      });
    }

  };

  $(document).ready(function(){
    HnbexMedianRatesChart.init();
  });
  
}(window, window.$, window.Chart));