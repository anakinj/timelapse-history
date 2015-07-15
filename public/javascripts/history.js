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
    updateDate(stamp);

    $(imgs).each(function (){
      this.image.src = $(this.element).data('stamp-url') + '/' + stamp;
    });
  }

  function updateDate(stamp){
    $('.current-timestamp').text(new Date(stamp*1000) + " StepSize: " + playStep);
  }

  elements.each(function(){
   var img = new Image();

   img.onerror = img.onload = function() {
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
        updateDate(value);
    },
    onSlideEnd: function(position, value) {
      changeImage(value);
    }
  }).change(function() {
    changeImage($(this).val());
  });

  var interval;

  $('#fb').click(function(ev) {
    ev.preventDefault();
    playStep -= 1000;
  });

  $('#ff').click(function(ev) {
    ev.preventDefault();
    playStep += 1000;
  });

  $('#play').click(function(ev) {
    ev.preventDefault();
    if(interval) {
      clearInterval(interval);
      interval = null;
      $(this).removeClass('glyphicon-pause');
    } else {
      $(this).addClass('glyphicon-pause');
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
