var ref,
  boundMethodCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new Error('Bound instance method accessed before binding'); } };

ref = app.views.OfflinePage = (function() {
  class OfflinePage extends app.View {
    constructor() {
      super(...arguments);
      this.onClick = this.onClick.bind(this);
    }

    deactivate() {
      if (super.deactivate()) {
        this.empty();
      }
    }

    render() {
      if (app.cookieBlocked) {
        this.html(this.tmpl('offlineError', 'cookie_blocked'));
        return;
      }
      app.docs.getInstallStatuses((statuses) => {
        var doc, html, i, len, ref1;
        if (!this.activated) {
          return;
        }
        if (statuses === false) {
          this.html(this.tmpl('offlineError', app.db.reason, app.db.error));
        } else {
          html = '';
          ref1 = app.docs.all();
          for (i = 0, len = ref1.length; i < len; i++) {
            doc = ref1[i];
            html += this.renderDoc(doc, statuses[doc.slug]);
          }
          this.html(this.tmpl('offlinePage', html));
          this.refreshLinks();
        }
      });
    }

    renderDoc(doc, status) {
      return app.templates.render('offlineDoc', doc, status);
    }

    getTitle() {
      return 'Offline';
    }

    refreshLinks() {
      var action, i, len, ref1;
      ref1 = ['install', 'update', 'uninstall'];
      for (i = 0, len = ref1.length; i < len; i++) {
        action = ref1[i];
        this.find(`[data-action-all='${action}']`).classList[this.find(`[data-action='${action}']`) ? 'add' : 'remove']('_show');
      }
    }

    docByEl(el) {
      var slug;
      while (!(slug = el.getAttribute('data-slug'))) {
        el = el.parentNode;
      }
      return app.docs.findBy('slug', slug);
    }

    docEl(doc) {
      return this.find(`[data-slug='${doc.slug}']`);
    }

    onRoute(context) {
      this.render();
    }

    onClick(event) {
      var action, doc, el, i, len, ref1;
      boundMethodCheck(this, ref);
      el = $.eventTarget(event);
      if (action = el.getAttribute('data-action')) {
        doc = this.docByEl(el);
        if (action === 'update') {
          action = 'install';
        }
        doc[action](this.onInstallSuccess.bind(this, doc), this.onInstallError.bind(this, doc), this.onInstallProgress.bind(this, doc));
        el.parentNode.innerHTML = `${el.textContent.replace(/e$/, '')}ing…`;
      } else if (action = el.getAttribute('data-action-all') || el.parentElement.getAttribute('data-action-all')) {
        if (!(action !== 'uninstall' || window.confirm('Uninstall all docs?'))) {
          return;
        }
        app.db.migrate();
        ref1 = this.findAll(`[data-action='${action}']`);
        for (i = 0, len = ref1.length; i < len; i++) {
          el = ref1[i];
          $.click(el);
        }
      }
    }

    onInstallSuccess(doc) {
      if (!this.activated) {
        return;
      }
      doc.getInstallStatus((status) => {
        var el;
        if (!this.activated) {
          return;
        }
        if (el = this.docEl(doc)) {
          el.outerHTML = this.renderDoc(doc, status);
          $.highlight(el, {
            className: '_highlight'
          });
          this.refreshLinks();
        }
      });
    }

    onInstallError(doc) {
      var el;
      if (!this.activated) {
        return;
      }
      if (el = this.docEl(doc)) {
        el.lastElementChild.textContent = 'Error';
      }
    }

    onInstallProgress(doc, event) {
      var el, percentage;
      if (!(this.activated && event.lengthComputable)) {
        return;
      }
      if (el = this.docEl(doc)) {
        percentage = Math.round(event.loaded * 100 / event.total);
        el.lastElementChild.textContent = el.lastElementChild.textContent.replace(/(\s.+)?$/, ` (${percentage}%)`);
      }
    }

    onChange(event) {
      if (event.target.name === 'autoUpdate') {
        app.settings.set('manualUpdate', !event.target.checked);
      }
    }

  };

  OfflinePage.className = '_static';

  OfflinePage.events = {
    click: 'onClick',
    change: 'onChange'
  };

  return OfflinePage;

}).call(this);
