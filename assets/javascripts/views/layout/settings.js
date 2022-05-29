var ref,
  boundMethodCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new Error('Bound instance method accessed before binding'); } };

ref = app.views.Settings = (function() {
  var SIDEBAR_HIDDEN_LAYOUT;

  class Settings extends app.View {
    constructor() {
      super(...arguments);
      this.onChange = this.onChange.bind(this);
      this.onEnter = this.onEnter.bind(this);
      this.onSubmit = this.onSubmit.bind(this);
      this.onImport = this.onImport.bind(this);
      this.onClick = this.onClick.bind(this);
    }

    init() {
      this.addSubview(this.docPicker = new app.views.DocPicker());
    }

    activate() {
      if (super.activate()) {
        this.render();
        document.body.classList.remove(SIDEBAR_HIDDEN_LAYOUT);
      }
    }

    deactivate() {
      if (super.deactivate()) {
        this.resetClass();
        this.docPicker.detach();
        if (app.settings.hasLayout(SIDEBAR_HIDDEN_LAYOUT)) {
          document.body.classList.add(SIDEBAR_HIDDEN_LAYOUT);
        }
      }
    }

    render() {
      this.docPicker.appendTo(this.sidebar);
      this.refreshElements();
      this.addClass('_in');
    }

    save(options = {}) {
      var disabledDocs, doc, docs;
      if (!this.saving) {
        this.saving = true;
        if (options.import) {
          docs = app.settings.getDocs();
        } else {
          docs = this.docPicker.getSelectedDocs();
          app.settings.setDocs(docs);
        }
        this.saveBtn.textContent = 'Saving\u2026';
        disabledDocs = new app.collections.Docs((function() {
          var i, len, ref1, results;
          ref1 = app.docs.all();
          results = [];
          for (i = 0, len = ref1.length; i < len; i++) {
            doc = ref1[i];
            if (docs.indexOf(doc.slug) === -1) {
              results.push(doc);
            }
          }
          return results;
        })());
        disabledDocs.uninstall(function() {
          app.db.migrate();
          return app.reload();
        });
      }
    }

    onChange() {
      boundMethodCheck(this, ref);
      this.addClass('_dirty');
    }

    onEnter() {
      boundMethodCheck(this, ref);
      this.save();
    }

    onSubmit(event) {
      boundMethodCheck(this, ref);
      event.preventDefault();
      this.save();
    }

    onImport() {
      boundMethodCheck(this, ref);
      this.addClass('_dirty');
      this.save({
        import: true
      });
    }

    onClick(event) {
      boundMethodCheck(this, ref);
      if (event.which !== 1) {
        return;
      }
      if (event.target === this.backBtn) {
        $.stopEvent(event);
        app.router.show('/');
      }
    }

  };

  SIDEBAR_HIDDEN_LAYOUT = '_sidebar-hidden';

  Settings.el = '._settings';

  Settings.elements = {
    sidebar: '._sidebar',
    saveBtn: 'button[type="submit"]',
    backBtn: 'button[data-back]'
  };

  Settings.events = {
    import: 'onImport',
    change: 'onChange',
    submit: 'onSubmit',
    click: 'onClick'
  };

  Settings.shortcuts = {
    enter: 'onEnter'
  };

  return Settings;

}).call(this);
