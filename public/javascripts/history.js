/*global jQuery:true*/
(function($) {
  'use strict';
  $(function() {
    var transparent = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
    var fifteenMins = 60 * 15;
    var playStep = fifteenMins;

    var nImages = 0;

    var elements = $('[data-stamp-url]');
    var imgs = [];

    var dateSlider = $('#dateSlider');
    var timeSlider = $('#timeSlider');

    function setCurrentTimestamp(stamp) {
      var currentDate = new Date(stamp*1000);
      var currentTime = currentDate.getHours() * 60 * 60 + currentDate.getMinutes() * 60 + currentDate.getSeconds();

      currentDate.setHours(0);
      currentDate.setMinutes(0);
      currentDate.setSeconds(0);

      dateSlider.val(currentDate.getTime()/ 1000 / 60 / 60 / 24);
      timeSlider.val(currentTime);

      $([dateSlider, timeSlider]).rangeslider('update', true);
    }

    function getCurrentTimestamp() {
      var date = parseFloat(dateSlider.val(), 10);
      var time = parseInt(timeSlider.val(), 10);

      var stamp = date * 60 * 60 * 24;

      return stamp + time;
    }

    function setImages() {
      $(imgs).each(function() {
        this.element.src = this.image.src;
      });
    }

    function updateImages(noLoad) {
      nImages = imgs.length;
      var stamp = getCurrentTimestamp();

      updateDate(stamp);
      if (noLoad !== true) {
        $(imgs).each(function() {
          this.image.src = $(this.element).data('stamp-url') + '/' + stamp;
        });
      }
    }

    function updateDate(stamp) {
      $('.current-timestamp').text(new Date(stamp * 1000) + " StepSize: " + (playStep / 60) + "min");
    }

    elements.each(function() {
      var img = new Image();

      img.onerror = function() {
        this.src = transparent;
      };

      img.onload = function() {
        nImages--;
        if (nImages === 0) {
          setImages();
        }
      };

      imgs.push({
        element: this,
        image: img
      });
    });

    $('input[type="range"]').rangeslider({
      polyfill: false,
      onSlide: function(position, value) {
        updateImages(true);
      },
      onSlideEnd: function(position, value) {
        updateImages();
      }
    }).change(function() {
      updateImages();
    }).change();

    var interval;

    $('#fb').click(function(ev) {
      ev.preventDefault();
      playStep -= fifteenMins;
    });

    $('#ff').click(function(ev) {
      ev.preventDefault();
      playStep += fifteenMins;
    });

    $('#play').click(function(ev) {
      ev.preventDefault();
      if (interval) {
        clearInterval(interval);
        interval = null;
        $(this).removeClass('glyphicon-pause');
      } else {
        $(this).addClass('glyphicon-pause');

        interval = setInterval(function() {
          if (nImages === 0) {
            var newStep = getCurrentTimestamp() + playStep;

            if ($('#skip-nights').is(":checked")) {
              var hours = new Date(newStep * 1000).getHours();
              do {
                hours = new Date(newStep * 1000).getHours();
                newStep += playStep;
              } while (hours >= 22 || hours <= 5);
            }
            setCurrentTimestamp(newStep);
            updateImages();
          }
        }, 500);
      }
    });
  });
}(jQuery));
