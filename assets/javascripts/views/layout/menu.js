/*
 * decaffeinate suggestions:
 * DS206: Consider reworking classes to avoid initClass
 * Full docs: https://github.com/decaffeinate/decaffeinate/blob/master/docs/suggestions.md
 */
app.views.Menu = class Menu extends app.View {
  constructor() {
    super();
  }

  static initClass() {
    this.el = "._menu";
    this.activeClass = "active";

    this.events = { click: "onClick" };
  }

  init() {
    this.onGlobalClick = this.onGlobalClick.bind(this);

    $.on(document.body, "click", this.onGlobalClick);
  }

  onClick(event) {
    const target = $.eventTarget(event);
    if (target.tagName === "A") {
      target.blur();
    }
  }

  onGlobalClick(event) {
    if (event.which !== 1) {
      return;
    }
    if (event.target.hasAttribute?.("data-toggle-menu")) {
      this.toggleClass(this.constructor.activeClass);
    } else if (this.hasClass(this.constructor.activeClass)) {
      this.removeClass(this.constructor.activeClass);
    }
  }
};
app.views.Menu.initClass();
