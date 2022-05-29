var ref,
  boundMethodCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new Error('Bound instance method accessed before binding'); } };

ref = app.views.Document = (function() {
  class Document extends app.View {
    constructor() {
      super();
      this.afterRoute = this.afterRoute.bind(this);
      this.onVisibilityChange = this.onVisibilityChange.bind(this);
    }

    init() {
      this.addSubview(this.menu = new app.views.Menu(), this.addSubview(this.sidebar = new app.views.Sidebar()));
      if (app.views.Resizer.isSupported()) {
        this.addSubview(this.resizer = new app.views.Resizer());
      }
      this.addSubview(this.content = new app.views.Content());
      if (!(app.isSingleDoc() || app.isMobile())) {
        this.addSubview(this.path = new app.views.Path());
      }
      if (!app.isSingleDoc()) {
        this.settings = new app.views.Settings();
      }
      $.on(document.body, 'click', this.onClick);
      this.activate();
    }

    setTitle(title) {
      return this.el.title = title ? `${title} — DevDocs` : 'DevDocs API Documentation';
    }

    afterRoute(route) {
      var ref1, ref2;
      boundMethodCheck(this, ref);
      if (route === 'settings') {
        if ((ref1 = this.settings) != null) {
          ref1.activate();
        }
      } else {
        if ((ref2 = this.settings) != null) {
          ref2.deactivate();
        }
      }
    }

    onVisibilityChange() {
      boundMethodCheck(this, ref);
      if (this.el.visibilityState !== 'visible') {
        return;
      }
      this.delay(function() {
        if (app.isMobile() !== app.views.Mobile.detect()) {
          location.reload();
        }
      }, 300);
    }

    onHelp() {
      app.router.show('/help#shortcuts');
    }

    onPreferences() {
      app.router.show('/settings');
    }

    onEscape() {
      var path;
      path = !app.isSingleDoc() || location.pathname === app.doc.fullPath() ? '/' : app.doc.fullPath();
      app.router.show(path);
    }

    onBack() {
      history.back();
    }

    onForward() {
      history.forward();
    }

    onClick(event) {
      var target;
      target = $.eventTarget(event);
      if (!target.hasAttribute('data-behavior')) {
        return;
      }
      $.stopEvent(event);
      switch (target.getAttribute('data-behavior')) {
        case 'back':
          history.back();
          break;
        case 'reload':
          window.location.reload();
          break;
        case 'reboot':
          app.reboot();
          break;
        case 'hard-reload':
          app.reload();
          break;
        case 'reset':
          if (confirm('Are you sure you want to reset DevDocs?')) {
            app.reset();
          }
          break;
        case 'accept-analytics':
          Cookies.set('analyticsConsent', '1', {
            expires: 1e8
          }) && app.reboot();
          break;
        case 'decline-analytics':
          Cookies.set('analyticsConsent', '0', {
            expires: 1e8
          }) && app.reboot();
      }
    }

  };

  Document.el = document;

  Document.events = {
    visibilitychange: 'onVisibilityChange'
  };

  Document.shortcuts = {
    help: 'onHelp',
    preferences: 'onPreferences',
    escape: 'onEscape',
    superLeft: 'onBack',
    superRight: 'onForward'
  };

  Document.routes = {
    after: 'afterRoute'
  };

  return Document;

}).call(this);
