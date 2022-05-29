var isPointerEventsSupported, ref,
  boundMethodCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new Error('Bound instance method accessed before binding'); } };

ref = app.views.SidebarHover = (function() {
  class SidebarHover extends app.View {
    constructor(el1) {
      super(el1);
      this.position = this.position.bind(this);
      this.onFocus = this.onFocus.bind(this);
      this.onBlur = this.onBlur.bind(this);
      this.onMouseover = this.onMouseover.bind(this);
      this.onMouseout = this.onMouseout.bind(this);
      this.onScroll = this.onScroll.bind(this);
      this.onClick = this.onClick.bind(this);
      this.onRoute = this.onRoute.bind(this);
      if (!isPointerEventsSupported()) {
        delete this.constructor.events.mouseover;
      }
    }

    show(el) {
      if (el !== this.cursor) {
        this.hide();
        if (this.isTarget(el) && this.isTruncated(el.lastElementChild || el)) {
          this.cursor = el;
          this.clone = this.makeClone(this.cursor);
          $.append(document.body, this.clone);
          if (this.offsetTop == null) {
            this.offsetTop = this.el.offsetTop;
          }
          this.position();
        }
      }
    }

    hide() {
      if (this.cursor) {
        $.remove(this.clone);
        this.cursor = this.clone = null;
      }
    }

    position() {
      var rect;
      boundMethodCheck(this, ref);
      if (this.cursor) {
        rect = $.rect(this.cursor);
        if (rect.top >= this.offsetTop) {
          this.clone.style.top = rect.top + 'px';
          this.clone.style.left = rect.left + 'px';
        } else {
          this.hide();
        }
      }
    }

    makeClone(el) {
      var clone;
      clone = el.cloneNode(true);
      clone.classList.add('clone');
      return clone;
    }

    isTarget(el) {
      var ref1;
      return el != null ? (ref1 = el.classList) != null ? ref1.contains(this.constructor.itemClass) : void 0 : void 0;
    }

    isSelected(el) {
      return el.classList.contains('active');
    }

    isTruncated(el) {
      return el.scrollWidth > el.offsetWidth;
    }

    onFocus(event) {
      boundMethodCheck(this, ref);
      this.focusTime = Date.now();
      this.show(event.target);
    }

    onBlur() {
      boundMethodCheck(this, ref);
      this.hide();
    }

    onMouseover(event) {
      boundMethodCheck(this, ref);
      if (this.isTarget(event.target) && !this.isSelected(event.target) && this.mouseActivated()) {
        this.show(event.target);
      }
    }

    onMouseout(event) {
      boundMethodCheck(this, ref);
      if (this.isTarget(event.target) && this.mouseActivated()) {
        this.hide();
      }
    }

    mouseActivated() {
      // Skip mouse events caused by focus events scrolling the sidebar.
      return !this.focusTime || Date.now() - this.focusTime > 500;
    }

    onScroll() {
      boundMethodCheck(this, ref);
      this.position();
    }

    onClick(event) {
      boundMethodCheck(this, ref);
      if (event.target === this.clone) {
        $.click(this.cursor);
      }
    }

    onRoute() {
      boundMethodCheck(this, ref);
      this.hide();
    }

  };

  SidebarHover.itemClass = '_list-hover';

  SidebarHover.events = {
    focus: 'onFocus',
    blur: 'onBlur',
    mouseover: 'onMouseover',
    mouseout: 'onMouseout',
    scroll: 'onScroll',
    click: 'onClick'
  };

  SidebarHover.routes = {
    after: 'onRoute'
  };

  return SidebarHover;

}).call(this);

isPointerEventsSupported = function() {
  var el;
  el = document.createElement('div');
  el.style.cssText = 'pointer-events: auto';
  return el.style.pointerEvents === 'auto';
};
