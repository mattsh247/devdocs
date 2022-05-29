var ref,
  boundMethodCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new Error('Bound instance method accessed before binding'); } };

ref = app.views.RootPage = (function() {
  class RootPage extends app.View {
    constructor() {
      super(...arguments);
      this.onClick = this.onClick.bind(this);
    }

    init() {
      if (!this.isHidden()) { // reserve space in local storage
        this.setHidden(false);
      }
      this.render();
    }

    render() {
      var tmpl;
      this.empty();
      tmpl = app.isAndroidWebview() ? 'androidWarning' : this.isHidden() ? 'splash' : app.isMobile() ? 'mobileIntro' : 'intro';
      this.append(this.tmpl(tmpl));
    }

    hideIntro() {
      this.setHidden(true);
      this.render();
    }

    setHidden(value) {
      app.settings.set('hideIntro', value);
    }

    isHidden() {
      return app.isSingleDoc() || app.settings.get('hideIntro');
    }

    onRoute() {}

    onClick(event) {
      boundMethodCheck(this, ref);
      if ($.eventTarget(event).hasAttribute('data-hide-intro')) {
        $.stopEvent(event);
        this.hideIntro();
      }
    }

  };

  RootPage.events = {
    click: 'onClick'
  };

  return RootPage;

}).call(this);
