var ref,
  boundMethodCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new Error('Bound instance method accessed before binding'); } };

ref = app.views.TypeList = (function() {
  class TypeList extends app.View {
    constructor(doc) {
      super(arguments);
      this.onOpen = this.onOpen.bind(this);
      this.onClose = this.onClose.bind(this);
      this.doc = doc;
    }

    init() {
      this.lists = {};
      this.render();
      this.activate();
    }

    activate() {
      var list, ref1, slug;
      if (super.activate()) {
        ref1 = this.lists;
        for (slug in ref1) {
          list = ref1[slug];
          list.activate();
        }
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
      var group, html, i, len, ref1;
      html = '';
      ref1 = this.doc.types.groups();
      for (i = 0, len = ref1.length; i < len; i++) {
        group = ref1[i];
        html += this.tmpl('sidebarType', group);
      }
      return this.html(html);
    }

    onOpen(event) {
      var type;
      boundMethodCheck(this, ref);
      $.stopEvent(event);
      type = this.doc.types.findBy('slug', event.target.getAttribute('data-slug'));
      if (type && !this.lists[type.slug]) {
        this.lists[type.slug] = new app.views.EntryList(type.entries());
        $.after(event.target, this.lists[type.slug].el);
      }
    }

    onClose(event) {
      var type;
      boundMethodCheck(this, ref);
      $.stopEvent(event);
      type = this.doc.types.findBy('slug', event.target.getAttribute('data-slug'));
      if (type && this.lists[type.slug]) {
        this.lists[type.slug].detach();
        delete this.lists[type.slug];
      }
    }

    paginateTo(model) {
      var ref1;
      if (model.type) {
        if ((ref1 = this.lists[model.getType().slug]) != null) {
          ref1.paginateTo(model);
        }
      }
    }

  };

  TypeList.tagName = 'div';

  TypeList.className = '_list _list-sub';

  TypeList.events = {
    open: 'onOpen',
    close: 'onClose'
  };

  return TypeList;

}).call(this);
