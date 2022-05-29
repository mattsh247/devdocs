var ref,
  boundMethodCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new Error('Bound instance method accessed before binding'); } };

ref = app.views.DocPicker = (function() {
  class DocPicker extends app.View {
    constructor() {
      super(...arguments);
      this.onMouseDown = this.onMouseDown.bind(this);
      this.onMouseUp = this.onMouseUp.bind(this);
      this.onDOMFocus = this.onDOMFocus.bind(this);
    }

    init() {
      this.addSubview(this.listFold = new app.views.ListFold(this.el));
    }

    activate() {
      if (super.activate()) {
        this.render();
        $.on(this.el, 'focus', this.onDOMFocus, true);
      }
    }

    deactivate() {
      if (super.deactivate()) {
        this.empty();
        $.off(this.el, 'focus', this.onDOMFocus, true);
        this.focusEl = null;
      }
    }

    render() {
      var doc, docs, html, versions;
      html = this.tmpl('docPickerHeader');
      docs = app.docs.all().concat(...app.disabledDocs.all());
      while (doc = docs.shift()) {
        if (doc.version != null) {
          [docs, versions] = this.extractVersions(docs, doc);
          html += this.tmpl('sidebarVersionedDoc', doc, this.renderVersions(versions), {
            open: app.docs.contains(doc)
          });
        } else {
          html += this.tmpl('sidebarLabel', doc, {
            checked: app.docs.contains(doc)
          });
        }
      }
      this.html(html + this.tmpl('docPickerNote'));
      $.requestAnimationFrame(() => {
        var ref1;
        return (ref1 = this.findByTag('input')) != null ? ref1.focus() : void 0;
      });
    }

    renderVersions(docs) {
      var doc, html, i, len;
      html = '';
      for (i = 0, len = docs.length; i < len; i++) {
        doc = docs[i];
        html += this.tmpl('sidebarLabel', doc, {
          checked: app.docs.contains(doc)
        });
      }
      return html;
    }

    extractVersions(originalDocs, version) {
      var doc, docs, i, len, versions;
      docs = [];
      versions = [version];
      for (i = 0, len = originalDocs.length; i < len; i++) {
        doc = originalDocs[i];
        (doc.name === version.name ? versions : docs).push(doc);
      }
      return [docs, versions];
    }

    empty() {
      this.resetClass();
      super.empty();
    }

    getSelectedDocs() {
      var i, input, len, ref1, results;
      ref1 = this.findAllByTag('input');
      results = [];
      for (i = 0, len = ref1.length; i < len; i++) {
        input = ref1[i];
        if (input != null ? input.checked : void 0) {
          results.push(input.name);
        }
      }
      return results;
    }

    onMouseDown() {
      boundMethodCheck(this, ref);
      this.mouseDown = Date.now();
    }

    onMouseUp() {
      boundMethodCheck(this, ref);
      this.mouseUp = Date.now();
    }

    onDOMFocus(event) {
      var prev, target;
      boundMethodCheck(this, ref);
      target = event.target;
      if (target.tagName === 'INPUT') {
        if (!((this.mouseDown && Date.now() < this.mouseDown + 100) || (this.mouseUp && Date.now() < this.mouseUp + 100))) {
          $.scrollTo(target.parentNode, null, 'continuous');
        }
      } else if (target.classList.contains(app.views.ListFold.targetClass)) {
        target.blur();
        if (!(this.mouseDown && Date.now() < this.mouseDown + 100)) {
          if (this.focusEl === $('input', target.nextElementSibling)) {
            if (target.classList.contains(app.views.ListFold.activeClass)) {
              this.listFold.close(target);
            }
            prev = target.previousElementSibling;
            while (!(prev.tagName === 'LABEL' || prev.classList.contains(app.views.ListFold.targetClass))) {
              prev = prev.previousElementSibling;
            }
            if (prev.classList.contains(app.views.ListFold.activeClass)) {
              prev = $.makeArray($$('input', prev.nextElementSibling)).pop();
            }
            this.delay(function() {
              return prev.focus();
            });
          } else {
            if (!target.classList.contains(app.views.ListFold.activeClass)) {
              this.listFold.open(target);
            }
            this.delay(function() {
              return $('input', target.nextElementSibling).focus();
            });
          }
        }
      }
      this.focusEl = target;
    }

  };

  DocPicker.className = '_list _list-picker';

  DocPicker.events = {
    mousedown: 'onMouseDown',
    mouseup: 'onMouseUp'
  };

  return DocPicker;

}).call(this);
