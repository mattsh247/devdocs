app.View = (function() {
  class View {
    constructor(el) {
      console.log(el);
      debugger;
      this.setupElement(el);
      if (this.el.className) {
        this.originalClassName = this.el.className;
      }
      if (this.constructor.className) {
        this.resetClass();
      }
      this.refreshElements();
      if (typeof this.init === "function") {
        this.init();
      }
      this.refreshElements();
    }

    setupElement(el) {
      var key, ref, value;
      this.el = this.el
        ? this.el
        : typeof el === "string"
        ? $(el)
        : el
        ? el
        : document.createElement(this.constructor.tagName || "div");
      if (this.constructor.attributes) {
        ref = this.constructor.attributes;
        for (key in ref) {
          value = ref[key];
          this.el.setAttribute(key, value);
        }
      }
    }

    refreshElements() {
      var name, ref, selector;
      if (this.constructor.elements) {
        ref = this.constructor.elements;
        for (name in ref) {
          selector = ref[name];
          this[name] = this.find(selector);
          if (!this[name]) console.warn(this, name, selector);
        }
      }
    }

    addClass(name) {
      this.el.classList.add(name);
    }

    removeClass(name) {
      this.el.classList.remove(name);
    }

    toggleClass(name) {
      this.el.classList.toggle(name);
    }

    hasClass(name) {
      return this.el.classList.contains(name);
    }

    resetClass() {
      var i, len, name, ref;
      this.el.className = this.originalClassName || "";
      if (this.constructor.className) {
        ref = this.constructor.className.split(" ");
        for (i = 0, len = ref.length; i < len; i++) {
          name = ref[i];
          this.addClass(name);
        }
      }
    }

    find(selector) {
      return $(selector, this.el);
    }

    findAll(selector) {
      return $$(selector, this.el);
    }

    findByClass(name) {
      return this.findAllByClass(name)[0];
    }

    findLastByClass(name) {
      var all;
      all = this.findAllByClass(name)[0];
      return all[all.length - 1];
    }

    findAllByClass(name) {
      return this.el.getElementsByClassName(name);
    }

    findByTag(tag) {
      return this.findAllByTag(tag)[0];
    }

    findLastByTag(tag) {
      var all;
      all = this.findAllByTag(tag);
      return all[all.length - 1];
    }

    findAllByTag(tag) {
      return this.el.getElementsByTagName(tag);
    }

    append(value) {
      $.append(this.el, value.el || value);
    }

    appendTo(value) {
      $.append(value.el || value, this.el);
    }

    prepend(value) {
      $.prepend(this.el, value.el || value);
    }

    prependTo(value) {
      $.prepend(value.el || value, this.el);
    }

    before(value) {
      $.before(this.el, value.el || value);
    }

    after(value) {
      $.after(this.el, value.el || value);
    }

    remove(value) {
      $.remove(value.el || value);
    }

    empty() {
      $.empty(this.el);
      this.refreshElements();
    }

    html(value) {
      this.empty();
      this.append(value);
    }

    tmpl(...args) {
      return app.templates.render(...args);
    }

    delay(fn, ...args) {
      var delay;
      delay = typeof args[args.length - 1] === "number" ? args.pop() : 0;
      return setTimeout(fn.bind(this, ...args), delay);
    }

    onDOM(event, callback) {
      $.on(this.el, event, callback);
    }

    offDOM(event, callback) {
      $.off(this.el, event, callback);
    }

    bindEvents() {
      var method, name, ref, ref1, ref2;
      if (this.constructor.events) {
        ref = this.constructor.events;
        for (name in ref) {
          method = ref[name];
          this.onDOM(name, this[method]);
        }
      }
      if (this.constructor.routes) {
        ref1 = this.constructor.routes;
        for (name in ref1) {
          method = ref1[name];
          app.router.on(name, this[method]);
        }
      }
      if (this.constructor.shortcuts) {
        ref2 = this.constructor.shortcuts;
        for (name in ref2) {
          method = ref2[name];
          app.shortcuts.on(name, this[method]);
        }
      }
    }

    unbindEvents() {
      var method, name, ref, ref1, ref2;
      if (this.constructor.events) {
        ref = this.constructor.events;
        for (name in ref) {
          method = ref[name];
          this.offDOM(name, this[method]);
        }
      }
      if (this.constructor.routes) {
        ref1 = this.constructor.routes;
        for (name in ref1) {
          method = ref1[name];
          app.router.off(name, this[method]);
        }
      }
      if (this.constructor.shortcuts) {
        ref2 = this.constructor.shortcuts;
        for (name in ref2) {
          method = ref2[name];
          app.shortcuts.off(name, this[method]);
        }
      }
    }

    addSubview(view) {
      return (this.subviews || (this.subviews = [])).push(view);
    }

    activate() {
      var i, len, ref, view;
      if (this.activated) {
        return;
      }
      this.bindEvents();
      if (this.subviews) {
        ref = this.subviews;
        for (i = 0, len = ref.length; i < len; i++) {
          view = ref[i];
          view.activate();
        }
      }
      this.activated = true;
      return true;
    }

    deactivate() {
      var i, len, ref, view;
      if (!this.activated) {
        return;
      }
      this.unbindEvents();
      if (this.subviews) {
        ref = this.subviews;
        for (i = 0, len = ref.length; i < len; i++) {
          view = ref[i];
          view.deactivate();
        }
      }
      this.activated = false;
      return true;
    }

    detach() {
      this.deactivate();
      $.remove(this.el);
    }
  };

  $.extend(View.prototype, Events);

  return View;

}).call(this);
