var ref,
  boundMethodCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new Error('Bound instance method accessed before binding'); } };

ref = app.views.SettingsPage = (function() {
  class SettingsPage extends app.View {
    constructor() {
      super();
      this.onChange = this.onChange.bind(this);
      this.onClick = this.onClick.bind(this);
    }

    render() {
      this.html(this.tmpl('settingsPage', this.currentSettings()));
    }

    currentSettings() {
      var i, layout, len, ref1, settings;
      settings = {};
      settings.theme = app.settings.get('theme');
      settings.smoothScroll = !app.settings.get('fastScroll');
      settings.arrowScroll = app.settings.get('arrowScroll');
      settings.noAutofocus = app.settings.get('noAutofocus')
      settings.autoInstall = app.settings.get('autoInstall');
      settings.analyticsConsent = app.settings.get('analyticsConsent');
      settings.spaceScroll = app.settings.get('spaceScroll');
      settings.spaceTimeout = app.settings.get('spaceTimeout');
      settings.autoSupported = app.settings.autoSupported;
      ref1 = app.settings.LAYOUTS;
      for (i = 0, len = ref1.length; i < len; i++) {
        layout = ref1[i];
        settings[layout] = app.settings.hasLayout(layout);
      }
      return settings;
    }

    getTitle() {
      return 'Preferences';
    }

    setTheme(value) {
      app.settings.set('theme', value);
    }

    toggleLayout(layout, enable) {
      app.settings.setLayout(layout, enable);
    }

    toggleSmoothScroll(enable) {
      app.settings.set('fastScroll', !enable);
    }

    toggleAnalyticsConsent(enable) {
      app.settings.set('analyticsConsent', enable ? '1' : '0');
      if (!enable) {
        resetAnalytics();
      }
    }

    toggleSpaceScroll(enable) {
      app.settings.set('spaceScroll', enable ? 1 : 0);
    }

    setScrollTimeout(value) {
      return app.settings.set('spaceTimeout', value);
    }

    toggle(name, enable) {
      app.settings.set(name, enable);
    }

    export() {
      var data, link;
      data = new Blob([JSON.stringify(app.settings.export())], {
        type: 'application/json'
      });
      link = document.createElement('a');
      link.href = URL.createObjectURL(data);
      link.download = 'devdocs.json';
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    import(file, input) {
      var reader;
      if (!(file && file.type === 'application/json')) {
        new app.views.Notif('ImportInvalid', {
          autoHide: false
        });
        return;
      }
      reader = new FileReader();
      reader.onloadend = function() {
        var data;
        data = (function() {
          try {
            return JSON.parse(reader.result);
          } catch (error) {}
        })();
        if (!(data && data.constructor === Object)) {
          new app.views.Notif('ImportInvalid', {
            autoHide: false
          });
          return;
        }
        app.settings.import(data);
        $.trigger(input.form, 'import');
      };
      reader.readAsText(file);
    }

    onChange(event) {
      var input;
      boundMethodCheck(this, ref);
      input = event.target;
      switch (input.name) {
        case 'theme':
          this.setTheme(input.value);
          break;
        case 'layout':
          this.toggleLayout(input.value, input.checked);
          break;
        case 'smoothScroll':
          this.toggleSmoothScroll(input.checked);
          break;
        case 'import':
          this.import(input.files[0], input);
          break;
        case 'analyticsConsent':
          this.toggleAnalyticsConsent(input.checked);
          break;
        case 'spaceScroll':
          this.toggleSpaceScroll(input.checked);
          break;
        case 'spaceTimeout':
          this.setScrollTimeout(input.value);
          break;
        default:
          this.toggle(input.name, input.checked);
      }
    }

    onClick(event) {
      var target;
      boundMethodCheck(this, ref);
      target = $.eventTarget(event);
      switch (target.getAttribute('data-action')) {
        case 'export':
          $.stopEvent(event);
          this.export();
      }
    }

    onRoute(context) {
      this.render();
    }

  };

  SettingsPage.className = '_static';

  SettingsPage.events = {
    click: 'onClick',
    change: 'onChange'
  };

  return SettingsPage;

}).call(this);
