var ref,
  boundMethodCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new Error('Bound instance method accessed before binding'); } };

ref = app.views.Path = (function() {
  class Path extends app.View {
    constructor() {
      super(...arguments);
      this.onClick = this.onClick.bind(this);
      this.afterRoute = this.afterRoute.bind(this);
    }

    render(...args) {
      this.html(this.tmpl('path', ...args));
      this.show();
    }

    show() {
      if (!this.el.parentNode) {
        this.prependTo(app.el);
      }
    }

    hide() {
      if (this.el.parentNode) {
        $.remove(this.el);
      }
    }

    onClick(event) {
      var link;
      boundMethodCheck(this, ref);
      if (link = $.closestLink(event.target, this.el)) {
        this.clicked = true;
      }
    }

    afterRoute(route, context) {
      boundMethodCheck(this, ref);
      if (context.type) {
        this.render(context.doc, context.type);
      } else if (context.entry) {
        if (context.entry.isIndex()) {
          this.render(context.doc);
        } else {
          this.render(context.doc, context.entry.getType(), context.entry);
        }
      } else {
        this.hide();
      }
      if (this.clicked) {
        this.clicked = null;
        app.document.sidebar.reset();
      }
    }

  };

  Path.className = '_path';

  Path.attributes = {
    role: 'complementary'
  };

  Path.events = {
    click: 'onClick'
  };

  Path.routes = {
    after: 'afterRoute'
  };

  return Path;

}).call(this);
