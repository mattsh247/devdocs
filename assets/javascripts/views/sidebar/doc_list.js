var ref,
  boundMethodCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new Error('Bound instance method accessed before binding'); } };

ref = app.views.DocList = (function() {
  class DocList extends app.View {
    constructor() {
      super();
      this.render = this.render.bind(this);
      this.onOpen = this.onOpen.bind(this);
      this.onClose = this.onClose.bind(this);
      this.onClick = this.onClick.bind(this);
      this.onEnabled = this.onEnabled.bind(this);
      this.afterRoute = this.afterRoute.bind(this);
    }

    init() {
      this.lists = {};
      this.addSubview(this.listFocus = new app.views.ListFocus(this.el));
      this.addSubview(this.listFold = new app.views.ListFold(this.el));
      this.addSubview(this.listSelect = new app.views.ListSelect(this.el));
      app.on('ready', this.render);
    }

    activate() {
      var list, ref1, slug;
      if (super.activate()) {
        ref1 = this.lists;
        for (slug in ref1) {
          list = ref1[slug];
          list.activate();
        }
        this.listSelect.selectCurrent();
      }
    }

    deactivate() {
      var list, ref1, slug;
      if (super.deactivate()) {
        ref1 = this.lists;
        for (slug in ref1) {
          list = ref1[slug];
          list.deactivate();
        }
      }
    }

    render() {
      var doc, html, i, len, ref1;
      boundMethodCheck(this, ref);
      html = '';
      ref1 = app.docs.all();
      for (i = 0, len = ref1.length; i < len; i++) {
        doc = ref1[i];
        html += this.tmpl('sidebarDoc', doc, {
          fullName: app.docs.countAllBy('name', doc.name) > 1
        });
      }
      this.html(html);
      if (!(app.isSingleDoc() || app.disabledDocs.size() === 0)) {
        this.renderDisabled();
      }
    }

    renderDisabled() {
      this.append(this.tmpl('sidebarDisabled', {
        count: app.disabledDocs.size()
      }));
      this.refreshElements();
      this.renderDisabledList();
    }

    renderDisabledList() {
      if (app.settings.get('hideDisabled')) {
        this.removeDisabledList();
      } else {
        this.appendDisabledList();
      }
    }

    appendDisabledList() {
      var doc, docs, html, ref1, versions;
      html = '';
      docs = [].concat(...app.disabledDocs.all());
      while (doc = docs.shift()) {
        if (doc.version != null) {
          versions = '';
          while (true) {
            versions += this.tmpl('sidebarDoc', doc, {
              disabled: true
            });
            if (((ref1 = docs[0]) != null ? ref1.name : void 0) !== doc.name) {
              break;
            }
            doc = docs.shift();
          }
          html += this.tmpl('sidebarDisabledVersionedDoc', doc, versions);
        } else {
          html += this.tmpl('sidebarDoc', doc, {
            disabled: true
          });
        }
      }
      this.append(this.tmpl('sidebarDisabledList', html));
      this.disabledTitle.classList.add('open-title');
      this.refreshElements();
    }

    removeDisabledList() {
      if (this.disabledList) {
        $.remove(this.disabledList);
      }
      this.disabledTitle.classList.remove('open-title');
      this.refreshElements();
    }

    reset(options = {}) {
      var ref1;
      this.listSelect.deselect();
      if ((ref1 = this.listFocus) != null) {
        ref1.blur();
      }
      this.listFold.reset();
      if (options.revealCurrent || app.isSingleDoc()) {
        this.revealCurrent();
      }
    }

    onOpen(event) {
      var doc;
      boundMethodCheck(this, ref);
      $.stopEvent(event);
      doc = app.docs.findBy('slug', event.target.getAttribute('data-slug'));
      if (doc && !this.lists[doc.slug]) {
        this.lists[doc.slug] = doc.types.isEmpty() ? new app.views.EntryList(doc.entries.all()) : new app.views.TypeList(doc);
        $.after(event.target, this.lists[doc.slug].el);
      }
    }

    onClose(event) {
      var doc;
      boundMethodCheck(this, ref);
      $.stopEvent(event);
      doc = app.docs.findBy('slug', event.target.getAttribute('data-slug'));
      if (doc && this.lists[doc.slug]) {
        this.lists[doc.slug].detach();
        delete this.lists[doc.slug];
      }
    }

    select(model) {
      this.listSelect.selectByHref(model != null ? model.fullPath() : void 0);
    }

    reveal(model) {
      this.openDoc(model.doc);
      if (model.type) {
        this.openType(model.getType());
      }
      this.focus(model);
      this.paginateTo(model);
      this.scrollTo(model);
    }

    focus(model) {
      var ref1;
      if ((ref1 = this.listFocus) != null) {
        ref1.focus(this.find(`a[href='${model.fullPath()}']`));
      }
    }

    revealCurrent() {
      var model;
      if (model = app.router.context.type || app.router.context.entry) {
        this.reveal(model);
        this.select(model);
      }
    }

    openDoc(doc) {
      if (app.disabledDocs.contains(doc) && doc.version) {
        this.listFold.open(this.find(`[data-slug='${doc.slug_without_version}']`));
      }
      this.listFold.open(this.find(`[data-slug='${doc.slug}']`));
    }

    closeDoc(doc) {
      this.listFold.close(this.find(`[data-slug='${doc.slug}']`));
    }

    openType(type) {
      this.listFold.open(this.lists[type.doc.slug].find(`[data-slug='${type.slug}']`));
    }

    paginateTo(model) {
      var ref1;
      if ((ref1 = this.lists[model.doc.slug]) != null) {
        ref1.paginateTo(model);
      }
    }

    scrollTo(model) {
      $.scrollTo(this.find(`a[href='${model.fullPath()}']`), null, 'top', {
        margin: app.isMobile() ? 48 : 0
      });
    }

    toggleDisabled() {
      if (this.disabledTitle.classList.contains('open-title')) {
        this.removeDisabledList();
        app.settings.set('hideDisabled', true);
      } else {
        this.appendDisabledList();
        app.settings.set('hideDisabled', false);
      }
    }

    onClick(event) {
      var doc, slug, target;
      boundMethodCheck(this, ref);
      target = $.eventTarget(event);
      if (this.disabledTitle && $.hasChild(this.disabledTitle, target) && target.tagName !== 'A') {
        $.stopEvent(event);
        this.toggleDisabled();
      } else if (slug = target.getAttribute('data-enable')) {
        $.stopEvent(event);
        doc = app.disabledDocs.findBy('slug', slug);
        if (doc) {
          app.enableDoc(doc, this.onEnabled, this.onEnabled);
        }
      }
    }

    onEnabled() {
      boundMethodCheck(this, ref);
      this.reset();
      this.render();
    }

    afterRoute(route, context) {
      boundMethodCheck(this, ref);
      if (context.init) {
        if (this.activated) {
          this.reset({
            revealCurrent: true
          });
        }
      } else {
        this.select(context.type || context.entry);
      }
    }

  };

  DocList.className = '_list';

  DocList.attributes = {
    role: 'navigation'
  };

  DocList.events = {
    open: 'onOpen',
    close: 'onClose',
    click: 'onClick'
  };

  DocList.routes = {
    after: 'afterRoute'
  };

  DocList.elements = {
    disabledTitle: '._list-title',
    disabledList: '._disabled-list'
  };

  return DocList;

}).call(this);
