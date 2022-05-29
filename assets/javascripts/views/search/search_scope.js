var ref,
  boundMethodCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new Error('Bound instance method accessed before binding'); } };

ref = app.views.SearchScope = (function() {
  var HASH_RGX, SEARCH_PARAM;

  class SearchScope extends app.View {
    constructor(el) {
      super(arguments);
      this.onResults = this.onResults.bind(this);
      this.reset = this.reset.bind(this);
      this.doScopeSearch = this.doScopeSearch.bind(this);
      this.onClick = this.onClick.bind(this);
      this.onKeydown = this.onKeydown.bind(this);
      this.onTextInput = this.onTextInput.bind(this);
      this.afterRoute = this.afterRoute.bind(this);
      this.el = el;
    }

    init() {
      this.placeholder = this.input.getAttribute('placeholder');
      this.searcher = new app.SynchronousSearcher({
        fuzzy_min_length: 2,
        max_results: 1
      });
      this.searcher.on('results', this.onResults);
    }

    getScope() {
      return this.doc || app;
    }

    isActive() {
      return !!this.doc;
    }

    name() {
      var ref1;
      return (ref1 = this.doc) != null ? ref1.name : void 0;
    }

    search(value, searchDisabled = false) {
      if (this.doc) {
        return;
      }
      this.searcher.find(app.docs.all(), 'text', value);
      if (!this.doc && searchDisabled) {
        this.searcher.find(app.disabledDocs.all(), 'text', value);
      }
    }

    searchUrl() {
      var value;
      if (value = this.extractHashValue()) {
        this.search(value, true);
      }
    }

    onResults(results) {
      var doc;
      boundMethodCheck(this, ref);
      if (!(doc = results[0])) {
        return;
      }
      if (app.docs.contains(doc)) {
        this.selectDoc(doc);
      } else {
        this.redirectToDoc(doc);
      }
    }

    selectDoc(doc) {
      var previousDoc;
      previousDoc = this.doc;
      if (doc === previousDoc) {
        return;
      }
      this.doc = doc;
      this.tag.textContent = doc.fullName;
      this.tag.style.display = 'block';
      this.input.removeAttribute('placeholder');
      this.input.value = this.input.value.slice(this.input.selectionStart);
      this.input.style.paddingLeft = this.tag.offsetWidth + 10 + 'px';
      $.trigger(this.input, 'input');
      this.trigger('change', this.doc, previousDoc);
    }

    redirectToDoc(doc) {
      var hash;
      hash = location.hash;
      app.router.replaceHash('');
      location.assign(doc.fullPath() + hash);
    }

    reset() {
      var previousDoc;
      boundMethodCheck(this, ref);
      if (!this.doc) {
        return;
      }
      previousDoc = this.doc;
      this.doc = null;
      this.tag.textContent = '';
      this.tag.style.display = 'none';
      this.input.setAttribute('placeholder', this.placeholder);
      this.input.style.paddingLeft = '';
      this.trigger('change', null, previousDoc);
    }

    doScopeSearch(event) {
      boundMethodCheck(this, ref);
      this.search(this.input.value.slice(0, this.input.selectionStart));
      if (this.doc) {
        $.stopEvent(event);
      }
    }

    onClick(event) {
      boundMethodCheck(this, ref);
      if (event.target === this.tag) {
        this.reset();
        $.stopEvent(event);
      }
    }

    onKeydown(event) {
      boundMethodCheck(this, ref);
      if (event.which === 8) { // backspace
        if (this.doc && this.input.selectionEnd === 0) {
          this.reset();
          $.stopEvent(event);
        }
      } else if (!this.doc && this.input.value && !$.isChromeForAndroid()) {
        if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) {
          return;
        }
        if (event.which === 9 || (event.which === 32 && app.isMobile())) { // space
          this.doScopeSearch(event);
        }
      }
    }

    onTextInput(event) {
      boundMethodCheck(this, ref);
      if (!$.isChromeForAndroid()) {
        return;
      }
      if (!this.doc && this.input.value && event.data === ' ') {
        this.doScopeSearch(event);
      }
    }

    extractHashValue() {
      var newHash, value;
      if (value = this.getHashValue()) {
        newHash = $.urlDecode(location.hash).replace(`#${SEARCH_PARAM}=${value} `, `#${SEARCH_PARAM}=`);
        app.router.replaceHash(newHash);
        return value;
      }
    }

    getHashValue() {
      var ref1;
      try {
        return (ref1 = HASH_RGX.exec($.urlDecode(location.hash))) != null ? ref1[1] : void 0;
      } catch (error) {

      }
    }

    afterRoute(name, context) {
      boundMethodCheck(this, ref);
      if (!app.isSingleDoc() && context.init && context.doc) {
        this.selectDoc(context.doc);
      }
    }

  };

  SEARCH_PARAM = app.config.search_param;

  SearchScope.elements = {
    input: '._search-input',
    tag: '._search-tag'
  };

  SearchScope.events = {
    click: 'onClick',
    keydown: 'onKeydown',
    textInput: 'onTextInput'
  };

  SearchScope.routes = {
    after: 'afterRoute'
  };

  HASH_RGX = new RegExp(`^#${SEARCH_PARAM}=(.+?) .`);

  return SearchScope;

}).call(this);
