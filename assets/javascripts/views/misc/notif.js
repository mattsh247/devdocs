var ref,
  boundMethodCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new Error('Bound instance method accessed before binding'); } };

ref = app.views.Notif = (function() {
  class Notif extends app.View {
    constructor(type, options = {}) {
      super();
      this.onClick = this.onClick.bind(this);
      this.type = type;
      this.options = options;
      this.options = $.extend({}, this.constructor.defautOptions, this.options);
    }

    init() {
      this.show();
    }

    show() {
      if (this.timeout) {
        clearTimeout(this.timeout);
        this.timeout = this.delay(this.hide, this.options.autoHide);
      } else {
        this.render();
        this.position();
        this.activate();
        this.appendTo(document.body);
        this.el.offsetWidth; // force reflow
        this.addClass(this.constructor.activeClass);
        if (this.options.autoHide) {
          this.timeout = this.delay(this.hide, this.options.autoHide);
        }
      }
    }

    hide() {
      clearTimeout(this.timeout);
      this.timeout = null;
      this.detach();
    }

    render() {
      this.html(this.tmpl(`notif${this.type}`));
    }

    position() {
      var lastNotif, notifications;
      notifications = $$(`.${app.views.Notif.className}`);
      if (notifications.length) {
        lastNotif = notifications[notifications.length - 1];
        this.el.style.top = lastNotif.offsetTop + lastNotif.offsetHeight + 16 + 'px';
      }
    }

    onClick(event) {
      var target;
      boundMethodCheck(this, ref);
      if (event.which !== 1) {
        return;
      }
      target = $.eventTarget(event);
      if (target.hasAttribute('data-behavior')) {
        return;
      }
      if (target.tagName !== 'A' || target.classList.contains('_notif-close')) {
        $.stopEvent(event);
        this.hide();
      }
    }

  };

  Notif.className = '_notif';

  Notif.activeClass = '_in';

  Notif.attributes = {
    role: 'alert'
  };

  Notif.defautOptions = {
    autoHide: 15000
  };

  Notif.events = {
    click: 'onClick'
  };

  return Notif;

}).call(this);
