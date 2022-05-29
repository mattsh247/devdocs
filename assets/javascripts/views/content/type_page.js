app.views.TypePage = (function() {
  class TypePage extends app.View {
    deactivate() {
      if (super.deactivate()) {
        this.empty();
        this.type = null;
      }
    }

    render(type) {
      this.type = type;
      this.html(this.tmpl('typePage', this.type));
      setFaviconForDoc(this.type.doc);
    }

    getTitle() {
      return `${this.type.doc.fullName} / ${this.type.name}`;
    }

    onRoute(context) {
      this.render(context.type);
    }

  };

  TypePage.className = '_page';

  return TypePage;

}).call(this);
