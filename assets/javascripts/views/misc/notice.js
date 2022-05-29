app.views.Notice = (function() {
  class Notice extends app.View {
    constructor(type, ...args) {
      super();
      this.type = type;
      this.args = args;
    }

    init() {
      this.activate();
    }

    activate() {
      if (super.activate()) {
        this.show();
      }
    }

    deactivate() {
      if (super.deactivate()) {
        this.hide();
      }
    }

    show() {
      this.html(this.tmpl(`${this.type}Notice`, ...this.args));
      this.prependTo(app.el);
    }

    hide() {
      $.remove(this.el);
    }

  };

  Notice.className = '_notice';

  Notice.attributes = {
    role: 'alert'
  };

  return Notice;

}).call(this);
