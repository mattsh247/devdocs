var ref,
  boundMethodCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new Error('Bound instance method accessed before binding'); } };

ref = app.views.Content = (function() {
  class Content extends app.View {
    init() {
      this.scrollEl = app.isMobile()
        ? document.scrollingElement || document.body
        : this.el;
      this.scrollMap = {};
      this.scrollStack = [];
      this.rootPage = new app.views.RootPage();
      this.staticPage = new app.views.StaticPage();
      this.settingsPage = new app.views.SettingsPage();
      this.offlinePage = new app.views.OfflinePage();
      this.typePage = new app.views.TypePage();
      this.entryPage = new app.views.EntryPage();
      this.entryPage
        .on("loading", this.onEntryLoading)
        .on("loaded", this.onEntryLoaded);
      app.on("ready", this.onReady).on("bootError", this.onBootError);
    }

    show(view) {
      var ref1;
      this.hideLoading();
      if (view !== this.view) {
        if ((ref1 = this.view) != null) {
          ref1.deactivate();
        }
        this.html((this.view = view));
        this.view.activate();
      }
    }

    showLoading() {
      this.addClass(this.constructor.loadingClass);
    }

    isLoading() {
      return this.el.classList.contains(this.constructor.loadingClass);
    }

    hideLoading() {
      this.removeClass(this.constructor.loadingClass);
    }

    scrollTo(value) {
      this.scrollEl.scrollTop = value || 0;
    }

    smoothScrollTo(value) {
      if (app.settings.get("fastScroll")) {
        this.scrollTo(value);
      } else {
        $.smoothScroll(this.scrollEl, value || 0);
      }
    }

    scrollBy(n) {
      this.smoothScrollTo(this.scrollEl.scrollTop + n);
    }

    scrollToTop() {
      boundMethodCheck(this, ref);
      this.smoothScrollTo(0);
    }

    scrollToBottom() {
      boundMethodCheck(this, ref);
      this.smoothScrollTo(this.scrollEl.scrollHeight);
    }

    scrollStepUp() {
      boundMethodCheck(this, ref);
      this.scrollBy(-80);
    }

    scrollStepDown() {
      boundMethodCheck(this, ref);
      this.scrollBy(80);
    }

    scrollPageUp() {
      boundMethodCheck(this, ref);
      this.scrollBy(40 - this.scrollEl.clientHeight);
    }

    scrollPageDown() {
      boundMethodCheck(this, ref);
      this.scrollBy(this.scrollEl.clientHeight - 40);
    }

    scrollToTarget() {
      var el;
      if (
        this.routeCtx.hash &&
        (el = this.findTargetByHash(this.routeCtx.hash))
      ) {
        $.scrollToWithImageLock(el, this.scrollEl, "top", {
          margin: this.scrollEl === this.el ? 0 : $.offset(this.el).top,
        });
        $.highlight(el, {
          className: "_highlight",
        });
      } else {
        this.scrollTo(this.scrollMap[this.routeCtx.state.id]);
      }
    }

    onReady() {
      boundMethodCheck(this, ref);
      this.hideLoading();
    }

    onBootError() {
      boundMethodCheck(this, ref);
      this.hideLoading();
      this.html(this.tmpl("bootError"));
    }

    onEntryLoading() {
      boundMethodCheck(this, ref);
      this.showLoading();
      if (this.scrollToTargetTimeout) {
        clearTimeout(this.scrollToTargetTimeout);
        this.scrollToTargetTimeout = null;
      }
    }

    onEntryLoaded() {
      boundMethodCheck(this, ref);
      this.hideLoading();
      if (this.scrollToTargetTimeout) {
        clearTimeout(this.scrollToTargetTimeout);
        this.scrollToTargetTimeout = null;
      }
      this.scrollToTarget();
    }

    beforeRoute(context) {
      boundMethodCheck(this, ref);
      this.cacheScrollPosition();
      this.routeCtx = context;
      this.scrollToTargetTimeout = this.delay(this.scrollToTarget);
    }

    cacheScrollPosition() {
      if (!this.routeCtx || this.routeCtx.hash) {
        return;
      }
      if (this.routeCtx.path === "/") {
        return;
      }
      if (this.scrollMap[this.routeCtx.state.id] == null) {
        this.scrollStack.push(this.routeCtx.state.id);
        while (this.scrollStack.length > app.config.history_cache_size) {
          delete this.scrollMap[this.scrollStack.shift()];
        }
      }
      this.scrollMap[this.routeCtx.state.id] = this.scrollEl.scrollTop;
    }

    afterRoute(route, context) {
      var base;
      boundMethodCheck(this, ref);
      if (route !== "entry" && route !== "type") {
        resetFavicon();
      }
      switch (route) {
        case "root":
          this.show(this.rootPage);
          break;
        case "entry":
          this.show(this.entryPage);
          break;
        case "type":
          this.show(this.typePage);
          break;
        case "settings":
          this.show(this.settingsPage);
          break;
        case "offline":
          this.show(this.offlinePage);
          break;
        default:
          this.show(this.staticPage);
      }
      this.view.onRoute(context);
      app.document.setTitle(
        typeof (base = this.view).getTitle === "function"
          ? base.getTitle()
          : void 0
      );
    }

    onClick(event) {
      var link;
      boundMethodCheck(this, ref);
      link = $.closestLink($.eventTarget(event), this.el);
      if (link && this.isExternalUrl(link.getAttribute("href"))) {
        $.stopEvent(event);
        $.popup(link);
      }
    }

    onAltF(event) {
      var ref1;
      boundMethodCheck(this, ref);
      if (
        !(document.activeElement && $.hasChild(this.el, document.activeElement))
      ) {
        if ((ref1 = this.find("a:not(:empty)")) != null) {
          ref1.focus();
        }
        return $.stopEvent(event);
      }
    }

    findTargetByHash(hash) {
      var el;
      el = (function () {
        try {
          return $.id(decodeURIComponent(hash));
        } catch (error) {}
      })();
      el ||
        (el = (function () {
          try {
            return $.id(hash);
          } catch (error) {}
        })());
      return el;
    }

    isExternalUrl(url) {
      var ref1;
      return (
        (ref1 = url != null ? url.slice(0, 6) : void 0) === "http:/" ||
        ref1 === "https:"
      );
    }
  };

  Content.el = '._content';

  Content.loadingClass = '_content-loading';

  Content.events = {
    click: 'onClick'
  };

  Content.shortcuts = {
    altUp: 'scrollStepUp',
    altDown: 'scrollStepDown',
    pageUp: 'scrollPageUp',
    pageDown: 'scrollPageDown',
    pageTop: 'scrollToTop',
    pageBottom: 'scrollToBottom',
    altF: 'onAltF'
  };

  Content.routes = {
    before: 'beforeRoute',
    after: 'afterRoute'
  };

  return Content;

}).call(this);
