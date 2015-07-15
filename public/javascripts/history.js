/// <reference path="../../typings/jquery/jquery.d.ts"/>
$(function() {

  var end = Math.round(new Date().getTime() / 1000);
  var start = Math.round(new Date(2014, 08, 1).getTime() / 1000);
  var step = 2500;
  
  var playStep = 6000;
  
  var nImages = 0;
  
  var elements = $('[data-stamp-url]');
  var imgs = [];
  
  function setImages() {
    $(imgs).each(function(){
      this.element.src = this.image.src;
    });
  }
  
  function changeImage(stamp) {
    nImages = imgs.length;
    
    $(imgs).each(function (){
      this.image.src = $(this.element).data('stamp-url') + '/' + stamp;
    });
  }
  
  elements.each(function(){
   var img = new Image();
   
   img.onload = function() {
    nImages--;
    if(nImages === 0) {
      setImages();
    }
  };
  
  imgs.push({
    element: this, 
    image :img
   });
 });
 
  $('#slider').attr('min', start).attr('max', end).attr('step', step).rangeslider({
    polyfill:false,
    onSlide: function(position, value) {
        $('.current-timestamp').text(new Date(value*1000));
    },
    onSlideEnd: function(position, value) {
      changeImage(value);
    }
  }).change(function() {
    changeImage($(this).val());
  });
  
  var interval;
  
  $('#play').click(function() {
    if(interval) {
      clearInterval(interval);
      interval = null;
      $(this).text('PLAY');
    } else {
      $(this).text('STOP');
      interval = setInterval(function() {
        if(nImages === 0) {
          var newStep = parseInt($("#slider").val(), 10) + playStep;
          $("#slider").val(newStep).change();
          $('input[type="range"]').rangeslider('update', true);
        }
      }, 500);
    }
  });
});