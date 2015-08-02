$(function() {
  var transparent = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
  var playStep = 60 * 60;

  var nImages = 0;

  var elements = $('[data-stamp-url]');
  var imgs = [];

  function setImages() {
    $(imgs).each(function() {
      this.element.src = this.image.src;
    });
  }

  function changeImage(stamp) {
    nImages = imgs.length;
    updateDate(stamp);
    $(imgs).each(function() {
      this.image.src = $(this.element).data('stamp-url') + '/' + stamp;
    });
  }

  function updateDate(stamp) {
    $('.current-timestamp').text(new Date(stamp * 1000) + " StepSize: " + (playStep / 60) + "min");
  }

  elements.each(function() {
    var img = new Image();

    img.onerror = function() {
      this.src = transparent;
    }

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

  $('#slider').rangeslider({
    polyfill: false,
    onSlide: function(position, value) {
      updateDate(value);
    },
    onSlideEnd: function(position, value) {
      changeImage(value);
    }
  }).change(function() {
    changeImage($(this).val());
  }).change();

  var interval;

  $('#fb').click(function(ev) {
    ev.preventDefault();
    playStep -= 60 * 60 * 1;
  });

  $('#ff').click(function(ev) {
    ev.preventDefault();
    playStep += 60 * 60 * 1;
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
          var newStep = parseInt($("#slider").val(), 10) + playStep;

          if ($('#skip-nights').is(":checked")) {
            do {
              var hours = new Date(newStep * 1000).getHours();
              newStep += playStep;
            } while (hours >= 22 || hours <= 6)
          }

          $("#slider").val(newStep).change();
          $('input[type="range"]').rangeslider('update', true);
        }

      }, 500);
    }
  });
});
