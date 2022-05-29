//= require views/pages/base
app.views.RdocPage = (function() {
  class RdocPage extends app.views.BasePage {
    onClick(event) {
      var isShown, source;
      if (!event.target.classList.contains('method-click-advice')) {
        return;
      }
      $.stopEvent(event);
      source = $('.method-source-code', event.target.closest('.method-detail'));
      isShown = source.style.display === 'block';
      source.style.display = isShown ? 'none' : 'block';
      return event.target.textContent = isShown ? 'Show source' : 'Hide source';
    }

  };

  RdocPage.events = {
    click: 'onClick'
  };

  return RdocPage;

}).call(this);
