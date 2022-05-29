//= require views/list/paginated_list
app.views.EntryList = (function() {
  class EntryList extends app.views.PaginatedList {
    constructor(entries1) {
      super();
      this.entries = entries1;
    }

    init() {
      this.renderPaginated();
      this.activate();
    }

    render(entries) {
      return this.tmpl('sidebarEntry', entries);
    }

  };

  EntryList.tagName = 'div';

  EntryList.className = '_list _list-sub';

  return EntryList;

}).call(this);
