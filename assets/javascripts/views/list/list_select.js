var ref,
  boundMethodCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new Error('Bound instance method accessed before binding'); } };

ref = app.views.ListSelect = (function() {
  class ListSelect extends app.View {
    constructor(el1) {
      super(el1);
      this.onClick = this.onClick.bind(this);
    }

    deactivate() {
      if (super.deactivate()) {
        this.deselect();
      }
    }

    select(el) {
      this.deselect();
      if (el) {
        el.classList.add(this.constructor.activeClass);
        $.trigger(el, 'select');
      }
    }

    deselect() {
      var selection;
      if (selection = this.getSelection()) {
        selection.classList.remove(this.constructor.activeClass);
        $.trigger(selection, 'deselect');
      }
    }

    selectByHref(href) {
      var ref1;
      if (((ref1 = this.getSelection()) != null ? ref1.getAttribute('href') : void 0) !== href) {
        this.select(this.find(`a[href='${href}']`));
      }
    }

    selectCurrent() {
      this.selectByHref(location.pathname + location.hash);
    }

    getSelection() {
      return this.findByClass(this.constructor.activeClass);
    }

    onClick(event) {
      var target;
      boundMethodCheck(this, ref);
      if (event.which !== 1 || event.metaKey || event.ctrlKey) {
        return;
      }
      target = $.eventTarget(event);
      if (target.tagName === 'A') {
        this.select(target);
      }
    }

  };

  ListSelect.activeClass = 'active';

  ListSelect.events = {
    click: 'onClick'
  };

  return ListSelect;

}).call(this);
