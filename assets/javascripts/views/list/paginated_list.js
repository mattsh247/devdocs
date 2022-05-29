var ref,
  boundMethodCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new Error('Bound instance method accessed before binding'); } };

ref = app.views.PaginatedList = (function() {
  var PER_PAGE;

  class PaginatedList extends app.View {
    constructor(data) {
      var base, base1;
      super();
      this.onClick = this.onClick.bind(this);
      this.data = data;
      if ((base = ((base1 = this.constructor).events || (base1.events = {}))).click == null) {
        base.click = 'onClick';
      }
    }

    renderPaginated() {
      this.page = 0;
      if (this.totalPages() > 1) {
        this.paginateNext();
      } else {
        this.html(this.renderAll());
      }
    }

    // render: (dataSlice) -> implemented by subclass
    renderAll() {
      return this.render(this.data);
    }

    renderPage(page) {
      return this.render(this.data.slice(((page - 1) * PER_PAGE), (page * PER_PAGE)));
    }

    renderPageLink(count) {
      return this.tmpl('sidebarPageLink', count);
    }

    renderPrevLink(page) {
      return this.renderPageLink((page - 1) * PER_PAGE);
    }

    renderNextLink(page) {
      return this.renderPageLink(this.data.length - page * PER_PAGE);
    }

    totalPages() {
      return Math.ceil(this.data.length / PER_PAGE);
    }

    paginate(link) {
      $.lockScroll(link.nextSibling || link.previousSibling, () => {
        $.batchUpdate(this.el, () => {
          if (link.nextSibling) {
            this.paginatePrev(link);
          } else {
            this.paginateNext(link);
          }
        });
      });
    }

    paginateNext() {
      if (this.el.lastChild) { // remove link
        this.remove(this.el.lastChild);
      }
      if (this.page >= 2) { // keep previous page into view
        this.hideTopPage();
      }
      this.page++;
      this.append(this.renderPage(this.page));
      if (this.page < this.totalPages()) {
        this.append(this.renderNextLink(this.page));
      }
    }

    paginatePrev() {
      this.remove(this.el.firstChild); // remove link
      this.hideBottomPage();
      this.page--;
      this.prepend(this.renderPage(this.page - 1)); // previous page is offset by one
      if (this.page >= 3) {
        this.prepend(this.renderPrevLink(this.page - 1));
      }
    }

    paginateTo(object) {
      var i, index, ref1;
      index = this.data.indexOf(object);
      if (index >= PER_PAGE) {
        for (i = 0, ref1 = Math.floor(index / PER_PAGE); (0 <= ref1 ? i < ref1 : i > ref1); 0 <= ref1 ? i++ : i--) {
          this.paginateNext();
        }
      }
    }

    hideTopPage() {
      var i, n, ref1;
      n = this.page <= 2 ? PER_PAGE : PER_PAGE + 1; // remove link
      for (i = 0, ref1 = n; (0 <= ref1 ? i < ref1 : i > ref1); 0 <= ref1 ? i++ : i--) {
        this.remove(this.el.firstChild);
      }
      this.prepend(this.renderPrevLink(this.page));
    }

    hideBottomPage() {
      var i, n, ref1;
      n = this.page === this.totalPages() ? this.data.length % PER_PAGE || PER_PAGE : PER_PAGE + 1; // remove link
      for (i = 0, ref1 = n; (0 <= ref1 ? i < ref1 : i > ref1); 0 <= ref1 ? i++ : i--) {
        this.remove(this.el.lastChild);
      }
      this.append(this.renderNextLink(this.page - 1));
    }

    onClick(event) {
      var target;
      boundMethodCheck(this, ref);
      target = $.eventTarget(event);
      if (target.tagName === 'SPAN') { // link
        $.stopEvent(event);
        this.paginate(target);
      }
    }

  };

  PER_PAGE = app.config.max_results;

  return PaginatedList;

}).call(this);
