var ref,
  boundMethodCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new Error('Bound instance method accessed before binding'); } };

ref = app.views.ListFocus = (function() {
  class ListFocus extends app.View {
    constructor(el1) {
      super(arguments);
      this.blur = this.blur.bind(this);
      this.onDown = this.onDown.bind(this);
      this.onUp = this.onUp.bind(this);
      this.onLeft = this.onLeft.bind(this);
      this.onEnter = this.onEnter.bind(this);
      this.onSuperEnter = this.onSuperEnter.bind(this);
      this.onClick = this.onClick.bind(this);
      this.el = el1;
      this.focusOnNextFrame = $.framify(this.focus, this);
    }

    focus(el, options = {}) {
      if (el && !el.classList.contains(this.constructor.activeClass)) {
        this.blur();
        el.classList.add(this.constructor.activeClass);
        if (options.silent !== true) {
          $.trigger(el, 'focus');
        }
      }
    }

    blur() {
      var cursor;
      boundMethodCheck(this, ref);
      if (cursor = this.getCursor()) {
        cursor.classList.remove(this.constructor.activeClass);
        $.trigger(cursor, 'blur');
      }
    }

    getCursor() {
      return this.findByClass(this.constructor.activeClass) || this.findByClass(app.views.ListSelect.activeClass);
    }

    findNext(cursor) {
      var next;
      if (next = cursor.nextSibling) {
        if (next.tagName === 'A') {
          return next;
        } else if (next.tagName === 'SPAN') { // pagination link
          $.click(next);
          return this.findNext(cursor);
        } else if (next.tagName === 'DIV') { // sub-list
          if (cursor.className.indexOf(' open') >= 0) {
            return this.findFirst(next) || this.findNext(next);
          } else {
            return this.findNext(next);
          }
        } else if (next.tagName === 'H6') { // title
          return this.findNext(next);
        }
      } else if (cursor.parentNode !== this.el) {
        return this.findNext(cursor.parentNode);
      }
    }

    findFirst(cursor) {
      var first;
      if (!(first = cursor.firstChild)) {
        return;
      }
      if (first.tagName === 'A') {
        return first;
      } else if (first.tagName === 'SPAN') { // pagination link
        $.click(first);
        return this.findFirst(cursor);
      }
    }

    findPrev(cursor) {
      var prev;
      if (prev = cursor.previousSibling) {
        if (prev.tagName === 'A') {
          return prev;
        } else if (prev.tagName === 'SPAN') { // pagination link
          $.click(prev);
          return this.findPrev(cursor);
        } else if (prev.tagName === 'DIV') { // sub-list
          if (prev.previousSibling.className.indexOf('open') >= 0) {
            return this.findLast(prev) || this.findPrev(prev);
          } else {
            return this.findPrev(prev);
          }
        } else if (prev.tagName === 'H6') { // title
          return this.findPrev(prev);
        }
      } else if (cursor.parentNode !== this.el) {
        return this.findPrev(cursor.parentNode);
      }
    }

    findLast(cursor) {
      var last;
      if (!(last = cursor.lastChild)) {
        return;
      }
      if (last.tagName === 'A') {
        return last;
      } else if (last.tagName === 'SPAN' || last.tagName === 'H6') { // pagination link or title
        return this.findPrev(last);
      } else if (last.tagName === 'DIV') { // sub-list
        return this.findLast(last);
      }
    }

    onDown() {
      var cursor;
      boundMethodCheck(this, ref);
      if (cursor = this.getCursor()) {
        this.focusOnNextFrame(this.findNext(cursor));
      } else {
        this.focusOnNextFrame(this.findByTag('a'));
      }
    }

    onUp() {
      var cursor;
      boundMethodCheck(this, ref);
      if (cursor = this.getCursor()) {
        this.focusOnNextFrame(this.findPrev(cursor));
      } else {
        this.focusOnNextFrame(this.findLastByTag('a'));
      }
    }

    onLeft() {
      var cursor, prev;
      boundMethodCheck(this, ref);
      cursor = this.getCursor();
      if (cursor && !cursor.classList.contains(app.views.ListFold.activeClass) && cursor.parentNode !== this.el) {
        prev = cursor.parentNode.previousSibling;
        if (prev && prev.classList.contains(app.views.ListFold.targetClass)) {
          this.focusOnNextFrame(cursor.parentNode.previousSibling);
        }
      }
    }

    onEnter() {
      var cursor;
      boundMethodCheck(this, ref);
      if (cursor = this.getCursor()) {
        $.click(cursor);
      }
    }

    onSuperEnter() {
      var cursor;
      boundMethodCheck(this, ref);
      if (cursor = this.getCursor()) {
        $.popup(cursor);
      }
    }

    onClick(event) {
      var target;
      boundMethodCheck(this, ref);
      if (event.which !== 1 || event.metaKey || event.ctrlKey) {
        return;
      }
      target = $.eventTarget(event);
      if (target.tagName === 'A') {
        this.focus(target, {
          silent: true
        });
      }
    }

  };

  ListFocus.activeClass = 'focus';

  ListFocus.events = {
    click: 'onClick'
  };

  ListFocus.shortcuts = {
    up: 'onUp',
    down: 'onDown',
    left: 'onLeft',
    enter: 'onEnter',
    superEnter: 'onSuperEnter',
    escape: 'blur'
  };

  return ListFocus;

}).call(this);
