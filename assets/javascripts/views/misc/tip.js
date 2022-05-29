//= require views/misc/notif
app.views.Tip = (function() {
  class Tip extends app.views.Notif {
    render() {
      this.html(this.tmpl(`tip${this.type}`));
    }

  };

  Tip.className = '_notif _notif-tip';

  Tip.defautOptions = {
    autoHide: false
  };

  return Tip;

}).call(this);
