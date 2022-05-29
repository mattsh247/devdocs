var ref,
  boundMethodCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new Error('Bound instance method accessed before binding'); } };

ref = app.views.Sidebar = (function() {
  class Sidebar extends app.View {
    constructor() {
      super(...arguments);
      this.resetHoverOnMouseMove = this.resetHoverOnMouseMove.bind(this);
      this.resetHover = this.resetHover.bind(this);
      this.showResults = this.showResults.bind(this);
      this.onReady = this.onReady.bind(this);
      this.onScopeChange = this.onScopeChange.bind(this);
      this.onSearching = this.onSearching.bind(this);
      this.onSearchClear = this.onSearchClear.bind(this);
      this.onFocus = this.onFocus.bind(this);
      this.onSelect = this.onSelect.bind(this);
      this.onClick = this.onClick.bind(this);
      this.onAltR = this.onAltR.bind(this);
      this.onEscape = this.onEscape.bind(this);
      this.afterRoute = this.afterRoute.bind(this);
    }

    init() {
      if (!app.isMobile()) {
        this.addSubview(this.hover = new app.views.SidebarHover(this.el));
      }
      this.addSubview(this.search = new app.views.Search());
      this.search.on('searching', this.onSearching).on('clear', this.onSearchClear).scope.on('change', this.onScopeChange);
      this.results = new app.views.Results(this, this.search);
      this.docList = new app.views.DocList();
      app.on('ready', this.onReady);
      $.on(document.documentElement, 'mouseleave', () => {
        return this.hide();
      });
      $.on(document.documentElement, 'mouseenter', () => {
        return this.resetDisplay({
          forceNoHover: false
        });
      });
    }

    hide() {
      this.removeClass('show');
    }

    display() {
      this.addClass('show');
    }

    resetDisplay(options = {}) {
      if (!this.hasClass('show')) {
        return;
      }
      this.removeClass('show');
      if (!(options.forceNoHover === false || this.hasClass('no-hover'))) {
        this.addClass('no-hover');
        $.on(window, 'mousemove', this.resetHoverOnMouseMove);
      }
    }

    resetHoverOnMouseMove() {
      boundMethodCheck(this, ref);
      $.off(window, 'mousemove', this.resetHoverOnMouseMove);
      return $.requestAnimationFrame(this.resetHover);
    }

    resetHover() {
      boundMethodCheck(this, ref);
      return this.removeClass('no-hover');
    }

    showView(view) {
      var ref1, ref2;
      if (this.view !== view) {
        if ((ref1 = this.hover) != null) {
          ref1.hide();
        }
        this.saveScrollPosition();
        if ((ref2 = this.view) != null) {
          ref2.deactivate();
        }
        this.view = view;
        this.render();
        this.view.activate();
        this.restoreScrollPosition();
      }
    }

    render() {
      this.html(this.view);
    }

    showDocList() {
      this.showView(this.docList);
    }

    showResults() {
      boundMethodCheck(this, ref);
      this.display();
      this.showView(this.results);
    }

    reset() {
      this.display();
      this.showDocList();
      this.docList.reset();
      this.search.reset();
    }

    onReady() {
      boundMethodCheck(this, ref);
      this.view = this.docList;
      this.render();
      this.view.activate();
    }

    onScopeChange(newDoc, previousDoc) {
      boundMethodCheck(this, ref);
      if (previousDoc) {
        this.docList.closeDoc(previousDoc);
      }
      if (newDoc) {
        this.docList.reveal(newDoc.toEntry());
      } else {
        this.scrollToTop();
      }
    }

    saveScrollPosition() {
      if (this.view === this.docList) {
        this.scrollTop = this.el.scrollTop;
      }
    }

    restoreScrollPosition() {
      if (this.view === this.docList && this.scrollTop) {
        this.el.scrollTop = this.scrollTop;
        this.scrollTop = null;
      } else {
        this.scrollToTop();
      }
    }

    scrollToTop() {
      this.el.scrollTop = 0;
    }

    onSearching() {
      boundMethodCheck(this, ref);
      this.showResults();
    }

    onSearchClear() {
      boundMethodCheck(this, ref);
      this.resetDisplay();
      this.showDocList();
    }

    onFocus(event) {
      boundMethodCheck(this, ref);
      this.display();
      if (event.target !== this.el) {
        $.scrollTo(event.target, this.el, 'continuous', {
          bottomGap: 2
        });
      }
    }

    onSelect() {
      boundMethodCheck(this, ref);
      this.resetDisplay();
    }

    onClick(event) {
      var base;
      boundMethodCheck(this, ref);
      if (event.which !== 1) {
        return;
      }
      if (typeof (base = $.eventTarget(event)).hasAttribute === "function" ? base.hasAttribute('data-reset-list') : void 0) {
        $.stopEvent(event);
        this.onAltR();
      }
    }

    onAltR() {
      boundMethodCheck(this, ref);
      this.reset();
      this.docList.reset({
        revealCurrent: true
      });
      this.display();
    }

    onEscape() {
      var doc;
      boundMethodCheck(this, ref);
      this.reset();
      this.resetDisplay();
      if (doc = this.search.getScopeDoc()) {
        this.docList.reveal(doc.toEntry());
      } else {
        this.scrollToTop();
      }
    }

    onDocEnabled() {
      this.docList.onEnabled();
      this.reset();
    }

    afterRoute(name, context) {
      var ref1;
      boundMethodCheck(this, ref);
      if (((ref1 = app.shortcuts.eventInProgress) != null ? ref1.name : void 0) === 'escape') {
        return;
      }
      if (!context.init && app.router.isIndex()) {
        this.reset();
      }
      this.resetDisplay();
    }

  };

  Sidebar.el = '._sidebar';

  Sidebar.events = {
    focus: 'onFocus',
    select: 'onSelect',
    click: 'onClick'
  };

  Sidebar.routes = {
    after: 'afterRoute'
  };

  Sidebar.shortcuts = {
    altR: 'onAltR',
    escape: 'onEscape'
  };

  return Sidebar;

}).call(this);
