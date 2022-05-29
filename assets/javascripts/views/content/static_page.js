app.views.StaticPage = (function() {
  class StaticPage extends app.View {
    deactivate() {
      if (super.deactivate()) {
        this.empty();
        this.page = null;
      }
    }

    render(page) {
      this.page = page;
      this.html(this.tmpl(`${this.page}Page`));
    }

    getTitle() {
      return this.constructor.titles[this.page];
    }

    onRoute(context) {
      this.render(context.page || 'notFound');
    }

  };

  StaticPage.className = '_static';

  StaticPage.titles = {
    about: 'About',
    news: 'News',
    help: 'User Guide',
    notFound: '404'
  };

  return StaticPage;

}).call(this);
