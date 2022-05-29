  //= require views/pages/base
var ref,
  boundMethodCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new Error('Bound instance method accessed before binding'); } };

ref = app.views.SqlitePage = (function() {
  class SqlitePage extends app.views.BasePage {
    constructor() {
      super(...arguments);
      this.onClick = this.onClick.bind(this);
    }

    onClick(event) {
      var el, id;
      boundMethodCheck(this, ref);
      if (!(id = event.target.getAttribute('data-toggle'))) {
        return;
      }
      if (!(el = this.find(`#${id}`))) {
        return;
      }
      $.stopEvent(event);
      if (el.style.display === 'none') {
        el.style.display = 'block';
        event.target.textContent = 'hide';
      } else {
        el.style.display = 'none';
        event.target.textContent = 'show';
      }
    }

  };

  SqlitePage.events = {
    click: 'onClick'
  };

  return SqlitePage;

}).call(this);
