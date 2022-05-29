var ref,
  boundMethodCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new Error('Bound instance method accessed before binding'); } };

ref = app.views.Mobile = (function() {
  class Mobile extends app.View {
    static detect() {
      if (Cookies.get('override-mobile-detect') != null) {
        return JSON.parse(Cookies.get('override-mobile-detect'));
      }
      try {
        // Need to sniff the user agent because some Android and Windows Phone devices don't take
        // resolution (dpi) into account when reporting device width/height.
        return (window.matchMedia('(max-width: 480px)').matches) || (window.matchMedia('(max-width: 767px)').matches) || (window.matchMedia('(max-height: 767px) and (max-width: 1024px)').matches) || (navigator.userAgent.indexOf('Android') !== -1 && navigator.userAgent.indexOf('Mobile') !== -1) || (navigator.userAgent.indexOf('IEMobile') !== -1);
      } catch (error) {
        return false;
      }
    }

    static detectAndroidWebview() {
      try {
        return /(Android).*( Version\/.\.. ).*(Chrome)/.test(navigator.userAgent);
      } catch (error) {
        return false;
      }
    }

    constructor() {
      super(document.documentElement);
      this.showSidebar = this.showSidebar.bind(this);
      this.hideSidebar = this.hideSidebar.bind(this);
      this.onClickBack = this.onClickBack.bind(this);
      this.onClickForward = this.onClickForward.bind(this);
      this.onClickToggleSidebar = this.onClickToggleSidebar.bind(this);
      this.onClickDocPickerTab = this.onClickDocPickerTab.bind(this);
      this.onClickSettingsTab = this.onClickSettingsTab.bind(this);
      this.onTapSearch = this.onTapSearch.bind(this);
      this.onEscape = this.onEscape.bind(this);
      this.afterRoute = this.afterRoute.bind(this);
    }

    init() {
      $.on($('._search'), 'touchend', this.onTapSearch);
      this.toggleSidebar = $('button[data-toggle-sidebar]');
      this.toggleSidebar.removeAttribute('hidden');
      $.on(this.toggleSidebar, 'click', this.onClickToggleSidebar);
      this.back = $('button[data-back]');
      this.back.removeAttribute('hidden');
      $.on(this.back, 'click', this.onClickBack);
      this.forward = $('button[data-forward]');
      this.forward.removeAttribute('hidden');
      $.on(this.forward, 'click', this.onClickForward);
      this.docPickerTab = $('button[data-tab="doc-picker"]');
      this.docPickerTab.removeAttribute('hidden');
      $.on(this.docPickerTab, 'click', this.onClickDocPickerTab);
      this.settingsTab = $('button[data-tab="settings"]');
      this.settingsTab.removeAttribute('hidden');
      $.on(this.settingsTab, 'click', this.onClickSettingsTab);
      app.document.sidebar.search.on('searching', this.showSidebar);
      this.activate();
    }

    showSidebar() {
      var scrollContainer, selection;
      boundMethodCheck(this, ref);
      if (this.isSidebarShown()) {
        window.scrollTo(0, 0);
        return;
      }
      this.contentTop = window.scrollY;
      this.content.style.display = 'none';
      this.sidebar.style.display = 'block';
      if (selection = this.findByClass(app.views.ListSelect.activeClass)) {
        scrollContainer = window.scrollY === this.body.scrollTop ? this.body : document.documentElement;
        $.scrollTo(selection, scrollContainer, 'center');
      } else {
        window.scrollTo(0, this.findByClass(app.views.ListFold.activeClass) && this.sidebarTop || 0);
      }
    }

    hideSidebar() {
      boundMethodCheck(this, ref);
      if (!this.isSidebarShown()) {
        return;
      }
      this.sidebarTop = window.scrollY;
      this.sidebar.style.display = 'none';
      this.content.style.display = 'block';
      window.scrollTo(0, this.contentTop || 0);
    }

    isSidebarShown() {
      return this.sidebar.style.display !== 'none';
    }

    onClickBack() {
      boundMethodCheck(this, ref);
      return history.back();
    }

    onClickForward() {
      boundMethodCheck(this, ref);
      return history.forward();
    }

    onClickToggleSidebar() {
      boundMethodCheck(this, ref);
      if (this.isSidebarShown()) {
        this.hideSidebar();
      } else {
        this.showSidebar();
      }
    }

    onClickDocPickerTab(event) {
      boundMethodCheck(this, ref);
      $.stopEvent(event);
      this.showDocPicker();
    }

    onClickSettingsTab(event) {
      boundMethodCheck(this, ref);
      $.stopEvent(event);
      this.showSettings();
    }

    showDocPicker() {
      window.scrollTo(0, 0);
      this.docPickerTab.classList.add('active');
      this.settingsTab.classList.remove('active');
      this.docPicker.style.display = 'block';
      this.content.style.display = 'none';
    }

    showSettings() {
      window.scrollTo(0, 0);
      this.docPickerTab.classList.remove('active');
      this.settingsTab.classList.add('active');
      this.docPicker.style.display = 'none';
      this.content.style.display = 'block';
    }

    onTapSearch() {
      boundMethodCheck(this, ref);
      return window.scrollTo(0, 0);
    }

    onEscape() {
      boundMethodCheck(this, ref);
      return this.hideSidebar();
    }

    afterRoute(route) {
      boundMethodCheck(this, ref);
      this.hideSidebar();
      if (route === 'settings') {
        this.showDocPicker();
      } else {
        this.content.style.display = 'block';
      }
      if (page.canGoBack()) {
        this.back.removeAttribute('disabled');
      } else {
        this.back.setAttribute('disabled', 'disabled');
      }
      if (page.canGoForward()) {
        this.forward.removeAttribute('disabled');
      } else {
        this.forward.setAttribute('disabled', 'disabled');
      }
    }

  };

  Mobile.className = '_mobile';

  Mobile.elements = {
    body: 'body',
    content: '._container',
    sidebar: '._sidebar',
    docPicker: '._settings ._sidebar'
  };

  Mobile.shortcuts = {
    escape: 'onEscape'
  };

  Mobile.routes = {
    after: 'afterRoute'
  };

  return Mobile;

}).call(this);
