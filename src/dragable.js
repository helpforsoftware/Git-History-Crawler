import $ from 'jquery';
$(function() {
  var dragging = false;
  var leftColumn = $('.left-column');
  var rightColumn = $('.right-column');
  var border = $('.draggable-border');
  border.mousedown(function(e) {
    e.preventDefault();
    dragging = true;
  });

  $(document).mouseup(function() {
    dragging = false;
  });

  $(document).mousemove(function(e) {
    if (dragging) {
      var offset = e.pageX - leftColumn.offset().left;
      var newLeftWidth = offset / leftColumn.parent().width() * 100;
      var newRightWidth = 100 - newLeftWidth;

      if (newLeftWidth < 30) {
        rightColumn.css('pointer-events', 'none');
      } else if (newRightWidth < 30) {
        leftColumn.css('pointer-events', 'none');
      } else {
        leftColumn.css('pointer-events', 'auto');
        rightColumn.css('pointer-events', 'auto');
        leftColumn.css('width', newLeftWidth + '%');
        rightColumn.css('width', newRightWidth + '%');
      }
    }
  });
});