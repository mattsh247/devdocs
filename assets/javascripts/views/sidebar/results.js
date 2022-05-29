var ref,
  boundMethodCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new Error('Bound instance method accessed before binding'); } };

ref = app.views.Results = (function() {
  class Results extends app.View {
    constructor(sidebar, search) {
      super(arguments);
      this.onResults = this.onResults.bind(this);
      this.onNoResults = this.onNoResults.bind(this);
      this.onClear = this.onClear.bind(this);
      this.afterRoute = this.afterRoute.bind(this);
      this.onClick = this.onClick.bind(this);
      this.sidebar = sidebar;
      this.search = search;
    }

    deactivate() {
      if (super.deactivate()) {
        this.empty();
      }
    }

    init() {
      this.addSubview(this.listFocus = new app.views.ListFocus(this.el));
      this.addSubview(this.listSelect = new app.views.ListSelect(this.el));
      this.search.on('results', this.onResults).on('noresults', this.onNoResults).on('clear', this.onClear);
    }

    onResults(entries, flags) {
      var ref1;
      boundMethodCheck(this, ref);
      if (flags.initialResults) {
        if ((ref1 = this.listFocus) != null) {
          ref1.blur();
        }
      }
      if (flags.initialResults) {
        this.empty();
      }
      this.append(this.tmpl('sidebarResult', entries));
      if (flags.initialResults) {
        if (flags.urlSearch) {
          this.openFirst();
        } else {
          this.focusFirst();
        }
      }
    }

    onNoResults() {
      boundMethodCheck(this, ref);
      this.html(this.tmpl('sidebarNoResults'));
    }

    onClear() {
      boundMethodCheck(this, ref);
      this.empty();
    }

    focusFirst() {
      var ref1;
      if (!app.isMobile()) {
        if ((ref1 = this.listFocus) != null) {
          ref1.focusOnNextFrame(this.el.firstElementChild);
        }
      }
    }

    openFirst() {
      var ref1;
      if ((ref1 = this.el.firstElementChild) != null) {
        ref1.click();
      }
    }

    onDocEnabled(doc) {
      app.router.show(doc.fullPath());
      return this.sidebar.onDocEnabled();
    }

    afterRoute(route, context) {
      boundMethodCheck(this, ref);
      if (route === 'entry') {
        this.listSelect.selectByHref(context.entry.fullPath());
      } else {
        this.listSelect.deselect();
      }
    }

    onClick(event) {
      var doc, slug;
      boundMethodCheck(this, ref);
      if (event.which !== 1) {
        return;
      }
      if (slug = $.eventTarget(event).getAttribute('data-enable')) {
        $.stopEvent(event);
        doc = app.disabledDocs.findBy('slug', slug);
        if (doc) {
          return app.enableDoc(doc, this.onDocEnabled.bind(this, doc), $.noop);
        }
      }
    }

  };

  Results.className = '_list';

  Results.events = {
    click: 'onClick'
  };

  Results.routes = {
    after: 'afterRoute'
  };

  return Results;

}).call(this);
