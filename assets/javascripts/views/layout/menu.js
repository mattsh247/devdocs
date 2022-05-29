var ref,
  boundMethodCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new Error('Bound instance method accessed before binding'); } };

ref = app.views.Menu = (function() {
  class Menu extends app.View {
    constructor() {
      super(...arguments);
      this.onGlobalClick = this.onGlobalClick.bind(this);
    }

    init() {
      $.on(document.body, 'click', this.onGlobalClick);
    }

    onClick(event) {
      var target;
      target = $.eventTarget(event);
      if (target.tagName === 'A') {
        target.blur();
      }
    }

    onGlobalClick(event) {
      var base;
      boundMethodCheck(this, ref);
      if (event.which !== 1) {
        return;
      }
      if (typeof (base = event.target).hasAttribute === "function" ? base.hasAttribute('data-toggle-menu') : void 0) {
        this.toggleClass(this.constructor.activeClass);
      } else if (this.hasClass(this.constructor.activeClass)) {
        this.removeClass(this.constructor.activeClass);
      }
    }

  };

  Menu.el = '._menu';

  Menu.activeClass = 'active';

  Menu.events = {
    click: 'onClick'
  };

  return Menu;

}).call(this);
