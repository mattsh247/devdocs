var ref,
  boundMethodCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new Error('Bound instance method accessed before binding'); } };

ref = app.views.ListFold = (function() {
  class ListFold extends app.View {
    constructor(el1) {
      super(el1);
      this.onLeft = this.onLeft.bind(this);
      this.onRight = this.onRight.bind(this);
      this.onClick = this.onClick.bind(this);
    }

    open(el) {
      if (el && !el.classList.contains(this.constructor.activeClass)) {
        el.classList.add(this.constructor.activeClass);
        $.trigger(el, 'open');
      }
    }

    close(el) {
      if (el && el.classList.contains(this.constructor.activeClass)) {
        el.classList.remove(this.constructor.activeClass);
        $.trigger(el, 'close');
      }
    }

    toggle(el) {
      if (el.classList.contains(this.constructor.activeClass)) {
        this.close(el);
      } else {
        this.open(el);
      }
    }

    reset() {
      var el;
      while (el = this.findByClass(this.constructor.activeClass)) {
        this.close(el);
      }
    }

    getCursor() {
      return this.findByClass(app.views.ListFocus.activeClass) || this.findByClass(app.views.ListSelect.activeClass);
    }

    onLeft() {
      var cursor;
      boundMethodCheck(this, ref);
      cursor = this.getCursor();
      if (cursor != null ? cursor.classList.contains(this.constructor.activeClass) : void 0) {
        this.close(cursor);
      }
    }

    onRight() {
      var cursor;
      boundMethodCheck(this, ref);
      cursor = this.getCursor();
      if (cursor != null ? cursor.classList.contains(this.constructor.targetClass) : void 0) {
        this.open(cursor);
      }
    }

    onClick(event) {
      var el;
      boundMethodCheck(this, ref);
      if (event.which !== 1 || event.metaKey || event.ctrlKey) {
        return;
      }
      if (!event.pageY) { // ignore fabricated clicks
        return;
      }
      el = $.eventTarget(event);
      if (el.parentNode.tagName.toUpperCase() === 'SVG') {
        el = el.parentNode;
      }
      if (el.classList.contains(this.constructor.handleClass)) {
        $.stopEvent(event);
        this.toggle(el.parentNode);
      } else if (el.classList.contains(this.constructor.targetClass)) {
        if (el.hasAttribute('href')) {
          if (el.classList.contains(this.constructor.activeClass)) {
            if (el.classList.contains(app.views.ListSelect.activeClass)) {
              this.close(el);
            }
          } else {
            this.open(el);
          }
        } else {
          this.toggle(el);
        }
      }
    }

  };

  ListFold.targetClass = '_list-dir';

  ListFold.handleClass = '_list-arrow';

  ListFold.activeClass = 'open';

  ListFold.events = {
    click: 'onClick'
  };

  ListFold.shortcuts = {
    left: 'onLeft',
    right: 'onRight'
  };

  return ListFold;

}).call(this);
