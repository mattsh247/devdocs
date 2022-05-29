var ref,
  boundMethodCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new Error('Bound instance method accessed before binding'); } };

ref = app.views.HiddenPage = (function() {
  class HiddenPage extends app.View {
    constructor(el, entry) {
      super(arguments);
      this.onClick = this.onClick.bind(this);
      this.el = el;
      this.entry = entry;
    }

    init() {
      this.addSubview(this.notice = new app.views.Notice('disabledDoc'));
      this.activate();
    }

    onClick(event) {
      var link;
      boundMethodCheck(this, ref);
      if (link = $.closestLink(event.target, this.el)) {
        $.stopEvent(event);
        $.popup(link);
      }
    }

  };

  HiddenPage.events = {
    click: 'onClick'
  };

  return HiddenPage;

}).call(this);
