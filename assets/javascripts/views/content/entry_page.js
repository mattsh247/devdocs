var ref,
  boundMethodCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new Error('Bound instance method accessed before binding'); } };

ref = app.views.EntryPage = (function() {
  var LINKS;

  class EntryPage extends app.View {
    constructor() {
      super(...arguments);
      this.beforeRoute = this.beforeRoute.bind(this);
      this.onSuccess = this.onSuccess.bind(this);
      this.onError = this.onError.bind(this);
      this.onClick = this.onClick.bind(this);
      this.onAltC = this.onAltC.bind(this);
      this.onAltO = this.onAltO.bind(this);
    }

    init() {
      this.cacheMap = {};
      this.cacheStack = [];
    }

    deactivate() {
      if (super.deactivate()) {
        this.empty();
        this.entry = null;
      }
    }

    loading() {
      this.empty();
      this.trigger('loading');
    }

    render(content = '', fromCache = false) {
      if (!this.activated) {
        return;
      }
      this.empty();
      this.subview = new (this.subViewClass())(this.el, this.entry);
      $.batchUpdate(this.el, () => {
        this.subview.render(content, fromCache);
        if (!fromCache) {
          this.addCopyButtons();
        }
      });
      if (app.disabledDocs.findBy('slug', this.entry.doc.slug)) {
        this.hiddenView = new app.views.HiddenPage(this.el, this.entry);
      }
      setFaviconForDoc(this.entry.doc);
      this.delay(this.polyfillMathML);
      this.trigger('loaded');
    }

    addCopyButtons() {
      var el, i, len, ref1;
      if (!this.copyButton) {
        this.copyButton = document.createElement('button');
        this.copyButton.innerHTML = '<svg><use xlink:href="#icon-copy"/></svg>';
        this.copyButton.type = 'button';
        this.copyButton.className = '_pre-clip';
        this.copyButton.title = 'Copy to clipboard';
        this.copyButton.setAttribute('aria-label', 'Copy to clipboard');
      }
      ref1 = this.findAllByTag('pre');
      for (i = 0, len = ref1.length; i < len; i++) {
        el = ref1[i];
        el.appendChild(this.copyButton.cloneNode(true));
      }
    }

    polyfillMathML() {
      if (!(window.supportsMathML === false && !this.polyfilledMathML && this.findByTag('math'))) {
        return;
      }
      this.polyfilledMathML = true;
      $.append(document.head, `<link rel="stylesheet" href="${app.config.mathml_stylesheet}">`);
    }

    prepareContent(content) {
      var link, links, url;
      if (!(this.entry.isIndex() && this.entry.doc.links)) {
        return content;
      }
      links = (function() {
        var ref1, results;
        ref1 = this.entry.doc.links;
        results = [];
        for (link in ref1) {
          url = ref1[link];
          results.push(`<a href="${url}" class="_links-link">${LINKS[link]}</a>`);
        }
        return results;
      }).call(this);
      return `<p class="_links">${links.join('')}</p>${content}`;
    }

    empty() {
      var ref1, ref2;
      if ((ref1 = this.subview) != null) {
        ref1.deactivate();
      }
      this.subview = null;
      if ((ref2 = this.hiddenView) != null) {
        ref2.deactivate();
      }
      this.hiddenView = null;
      this.resetClass();
      super.empty().empty();
    }

    subViewClass() {
      return app.views[`${$.classify(this.entry.doc.type)}Page`] || app.views.BasePage;
    }

    getTitle() {
      return this.entry.doc.fullName + (this.entry.isIndex() ? ' documentation' : ` / ${this.entry.name}`);
    }

    beforeRoute() {
      boundMethodCheck(this, ref);
      this.cache();
      this.abort();
    }

    onRoute(context) {
      var isSameFile, ref1;
      isSameFile = context.entry.filePath() === ((ref1 = this.entry) != null ? ref1.filePath() : void 0);
      this.entry = context.entry;
      if (!isSameFile) {
        this.restore() || this.load();
      }
    }

    load() {
      this.loading();
      this.xhr = this.entry.loadFile(this.onSuccess, this.onError);
    }

    abort() {
      if (this.xhr) {
        this.xhr.abort();
        this.xhr = this.entry = null;
      }
    }

    onSuccess(response) {
      boundMethodCheck(this, ref);
      if (!this.activated) {
        return;
      }
      this.xhr = null;
      this.render(this.prepareContent(response));
    }

    onError() {
      var ref1;
      boundMethodCheck(this, ref);
      this.xhr = null;
      this.render(this.tmpl('pageLoadError'));
      this.resetClass();
      this.addClass(this.constructor.errorClass);
      if ((ref1 = app.serviceWorker) != null) {
        ref1.update();
      }
    }

    cache() {
      var path;
      if (this.xhr || !this.entry || this.cacheMap[path = this.entry.filePath()]) {
        return;
      }
      this.cacheMap[path] = this.el.innerHTML;
      this.cacheStack.push(path);
      while (this.cacheStack.length > app.config.history_cache_size) {
        delete this.cacheMap[this.cacheStack.shift()];
      }
    }

    restore() {
      var path;
      if (this.cacheMap[path = this.entry.filePath()]) {
        this.render(this.cacheMap[path], true);
        return true;
      }
    }

    onClick(event) {
      var target;
      boundMethodCheck(this, ref);
      target = $.eventTarget(event);
      if (target.hasAttribute('data-retry')) {
        $.stopEvent(event);
        this.load();
      } else if (target.classList.contains('_pre-clip')) {
        $.stopEvent(event);
        target.classList.add($.copyToClipboard(target.parentNode.textContent) ? '_pre-clip-success' : '_pre-clip-error');
        setTimeout((function() {
          return target.className = '_pre-clip';
        }), 2000);
      }
    }

    onAltC() {
      var link;
      boundMethodCheck(this, ref);
      if (!(link = this.find('._attribution:last-child ._attribution-link'))) {
        return;
      }
      console.log(link.href + location.hash);
      navigator.clipboard.writeText(link.href + location.hash);
    }

    onAltO() {
      var link;
      boundMethodCheck(this, ref);
      if (!(link = this.find('._attribution:last-child ._attribution-link'))) {
        return;
      }
      this.delay(function() {
        return $.popup(link.href + location.hash);
      });
    }

  };

  EntryPage.className = '_page';

  EntryPage.errorClass = '_page-error';

  EntryPage.events = {
    click: 'onClick'
  };

  EntryPage.shortcuts = {
    altC: 'onAltC',
    altO: 'onAltO'
  };

  EntryPage.routes = {
    before: 'beforeRoute'
  };

  LINKS = {
    home: 'Homepage',
    code: 'Source code'
  };

  return EntryPage;

}).call(this);
