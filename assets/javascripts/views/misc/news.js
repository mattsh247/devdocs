//= require views/misc/notif
app.views.News = (function() {
  class News extends app.views.Notif {
    init() {
      this.unreadNews = this.getUnreadNews();
      if (this.unreadNews.length) {
        this.show();
      }
      this.markAllAsRead();
    }

    render() {
      this.html(app.templates.notifNews(this.unreadNews));
    }

    getUnreadNews() {
      var i, len, news, ref, results, time;
      if (!(time = this.getLastReadTime())) {
        return [];
      }
      ref = app.news;
      results = [];
      for (i = 0, len = ref.length; i < len; i++) {
        news = ref[i];
        if (new Date(news[0]).getTime() <= time) {
          break;
        }
        results.push(news);
      }
      return results;
    }

    getLastNewsTime() {
      return new Date(app.news[0][0]).getTime();
    }

    getLastReadTime() {
      return app.settings.get('news');
    }

    markAllAsRead() {
      app.settings.set('news', this.getLastNewsTime());
    }

  };

  News.className += ' _notif-news';

  News.defautOptions = {
    autoHide: 30000
  };

  return News;

}).call(this);
