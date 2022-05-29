//= require views/pages/base
app.views.SupportTablesPage = (function() {
  class SupportTablesPage extends app.views.BasePage {
    onClick(event) {
      var el;
      if (!event.target.classList.contains('show-all')) {
        return;
      }
      $.stopEvent(event);
      el = event.target;
      while (el.tagName !== 'TABLE') {
        el = el.parentNode;
      }
      el.classList.add('show-all');
    }

  };

  SupportTablesPage.events = {
    click: 'onClick'
  };

  return SupportTablesPage;

}).call(this);
