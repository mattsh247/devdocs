//= require views/misc/notif
app.views.Updates = (function() {
  class Updates extends app.views.Notif {
    init() {
      this.lastUpdateTime = this.getLastUpdateTime();
      this.updatedDocs = this.getUpdatedDocs();
      this.updatedDisabledDocs = this.getUpdatedDisabledDocs();
      if (this.updatedDocs.length > 0 || this.updatedDisabledDocs.length > 0) {
        this.show();
      }
      this.markAllAsRead();
    }

    render() {
      this.html(app.templates.notifUpdates(this.updatedDocs, this.updatedDisabledDocs));
    }

    getUpdatedDocs() {
      var doc, i, len, ref, results;
      if (!this.lastUpdateTime) {
        return [];
      }
      ref = app.docs.all();
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        doc = ref[i];
        if (doc.mtime > this.lastUpdateTime) {
          results.push(doc);
        }
      }
      return results;
    }

    getUpdatedDisabledDocs() {
      var doc, i, len, ref, results;
      if (!this.lastUpdateTime) {
        return [];
      }
      ref = app.disabledDocs.all();
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        doc = ref[i];
        if (doc.mtime > this.lastUpdateTime && app.docs.findBy('slug_without_version', doc.slug_without_version)) {
          results.push(doc);
        }
      }
      return results;
    }

    getLastUpdateTime() {
      return app.settings.get('version');
    }

    markAllAsRead() {
      app.settings.set('version', app.config.env === 'production' ? app.config.version : Math.floor(Date.now() / 1000));
    }

  };

  Updates.className += ' _notif-news';

  Updates.defautOptions = {
    autoHide: 30000
  };

  return Updates;

}).call(this);
