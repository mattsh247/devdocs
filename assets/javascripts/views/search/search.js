var ref,
  boundMethodCheck = function (instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new Error("Bound instance method accessed before binding");
    }
  };

ref = app.views.Search = function () {
  var HASH_RGX, SEARCH_PARAM;

  class Search extends app.View {
    constructor() {
      super();
      this.focus = this.focus.bind(this);
      this.autoFocus = this.autoFocus.bind(this);
      this.onWindowFocus = this.onWindowFocus.bind(this);
      this.onReady = this.onReady.bind(this);
      this.onInput = this.onInput.bind(this);
      this.searchUrl = this.searchUrl.bind(this);
      this.google = this.google.bind(this);
      this.stackoverflow = this.stackoverflow.bind(this);
      this.duckduckgo = this.duckduckgo.bind(this);
      this.onResults = this.onResults.bind(this);
      this.onEnd = this.onEnd.bind(this);
      this.onClick = this.onClick.bind(this);
      this.onScopeChange = this.onScopeChange.bind(this);
      this.afterRoute = this.afterRoute.bind(this);
    }

    init() {
      this.addSubview((this.scope = new app.views.SearchScope(this.el)));
      this.searcher = new app.Searcher();
      this.searcher.on("results", this.onResults).on("end", this.onEnd);
      this.scope.on("change", this.onScopeChange);
      app.on("ready", this.onReady);
      $.on(window, "hashchange", this.searchUrl);
      $.on(window, "focus", this.onWindowFocus);
    }

    focus() {
      boundMethodCheck(this, ref);
      if (document.activeElement === this.input) {
        return;
      }
      if (app.settings.get("noAutofocus")) {
        return;
      }
      this.input.focus();
    }

    autoFocus() {
      boundMethodCheck(this, ref);
      if (app.isMobile() || $.isAndroid() || $.isIOS()) {
        return;
      }
      if (document.activeElement?.tagName === "INPUT") {
        return;
      }
      if (app.settings.get("noAutofocus")) {
        return;
      }
      this.input.focus();
    }

    onWindowFocus(event) {
      boundMethodCheck(this, ref);
      if (event.target === window) {
        return this.autoFocus();
      }
    }

    getScopeDoc() {
      if (this.scope.isActive()) {
        return this.scope.getScope();
      }
    }

    reset(force) {
      if (force || !this.input.value) {
        this.scope.reset();
      }
      this.el.reset();
      this.onInput();
      this.autoFocus();
    }

    onReady() {
      boundMethodCheck(this, ref);
      this.value = "";
      this.delay(this.onInput);
    }

    onInput() {
      boundMethodCheck(this, ref);
      if (this.value == null || this.value === this.input.value) {
        return;
      }
      this.value = this.input.value;
      if (this.value.length) {
        this.search();
      } else {
        this.clear();
      }
    }

    search(url = false) {
      this.addClass(this.constructor.activeClass);
      this.trigger("searching");
      this.hasResults = null;
      this.flags = {
        urlSearch: url,
        initialResults: true,
      };
      this.searcher.find(
        this.scope.getScope().entries.all(),
        "text",
        this.value
      );
    }

    searchUrl() {
      var value;
      boundMethodCheck(this, ref);
      if (location.pathname === "/") {
        this.scope.searchUrl();
      } else if (!app.router.isIndex()) {
        return;
      }
      if (!(value = this.extractHashValue())) {
        return;
      }
      this.input.value = this.value = value;
      this.input.setSelectionRange(value.length, value.length);
      this.search(true);
      return true;
    }

    clear() {
      this.removeClass(this.constructor.activeClass);
      this.trigger("clear");
    }

    externalSearch(url) {
      var value;
      if ((value = this.value)) {
        if (this.scope.name()) {
          value = `${this.scope.name()} ${value}`;
        }
        $.popup(`${url}${encodeURIComponent(value)}`);
        this.reset();
      }
    }

    google() {
      boundMethodCheck(this, ref);
      this.externalSearch("https://www.google.com/search?q=");
    }

    stackoverflow() {
      boundMethodCheck(this, ref);
      this.externalSearch("https://stackoverflow.com/search?q=");
    }

    duckduckgo() {
      boundMethodCheck(this, ref);
      this.externalSearch("https://duckduckgo.com/?t=devdocs&q=");
    }

    onResults(results) {
      boundMethodCheck(this, ref);
      if (results.length) {
        this.hasResults = true;
      }
      this.trigger("results", results, this.flags);
      this.flags.initialResults = false;
    }

    onEnd() {
      boundMethodCheck(this, ref);
      if (!this.hasResults) {
        this.trigger("noresults");
      }
    }

    onClick(event) {
      boundMethodCheck(this, ref);
      if (event.target === this.resetLink) {
        $.stopEvent(event);
        this.reset();
      }
    }

    onSubmit(event) {
      $.stopEvent(event);
    }

    onScopeChange() {
      boundMethodCheck(this, ref);
      this.value = "";
      this.onInput();
    }

    afterRoute(name, context) {
      var ref1;
      boundMethodCheck(this, ref);
      if (
        ((ref1 = app.shortcuts.eventInProgress) != null
          ? ref1.name
          : void 0) === "escape"
      ) {
        return;
      }
      if (!context.init && app.router.isIndex()) {
        this.reset(true);
      }
      if (context.hash) {
        this.delay(this.searchUrl);
      }
      $.requestAnimationFrame(this.autoFocus);
    }

    extractHashValue() {
      var value;
      if ((value = this.getHashValue()) != null) {
        app.router.replaceHash();
        return value;
      }
    }

    getHashValue() {
      var ref1;
      try {
        return (ref1 = HASH_RGX.exec($.urlDecode(location.hash))) != null
          ? ref1[1]
          : void 0;
      } catch (error) {}
    }
  }

  SEARCH_PARAM = app.config.search_param;

  Search.el = "._search";

  Search.activeClass = "_search-active";

  Search.elements = {
    input: "._search-input",
    resetLink: "._search-clear",
  };

  Search.events = {
    input: "onInput",
    click: "onClick",
    submit: "onSubmit",
  };

  Search.shortcuts = {
    typing: "focus",
    altG: "google",
    altS: "stackoverflow",
    altD: "duckduckgo",
  };

  Search.routes = {
    after: "afterRoute",
  };

  HASH_RGX = new RegExp(`^#${SEARCH_PARAM}=(.*)`);

  return Search;
}.call(this);
