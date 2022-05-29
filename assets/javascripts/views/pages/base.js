var ref,
  boundMethodCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new Error('Bound instance method accessed before binding'); } };

ref = app.views.BasePage = class BasePage extends app.View {
  constructor(el1, entry) {
    super(el1);
    this.paintCode = this.paintCode.bind(this);
    this.entry = entry;
  }

  deactivate() {
    if (super.deactivate()) {
      return this.highlightNodes = [];
    }
  }

  render(content, fromCache = false) {
    this.highlightNodes = [];
    this.previousTiming = null;
    if (!this.constructor.className) {
      this.addClass(`_${this.entry.doc.type}`);
    }
    this.html(content);
    if (!fromCache) {
      this.highlightCode();
    }
    this.activate();
    if (this.afterRender) {
      this.delay(this.afterRender);
    }
    if (this.highlightNodes.length > 0) {
      $.requestAnimationFrame(() => {
        return $.requestAnimationFrame(this.paintCode);
      });
    }
  }

  highlightCode() {
    var el, i, language, len, ref1;
    ref1 = this.findAll('pre[data-language]');
    for (i = 0, len = ref1.length; i < len; i++) {
      el = ref1[i];
      language = el.getAttribute('data-language');
      el.classList.add(`language-${language}`);
      this.highlightNodes.push(el);
    }
  }

  paintCode(timing) {
    var clipEl, el, i, len, ref1;
    boundMethodCheck(this, ref);
    if (this.previousTiming) {
      if (Math.round(1000 / (timing - this.previousTiming)) > 50) { // fps
        this.nodesPerFrame = Math.round(Math.min(this.nodesPerFrame * 1.25, 50));
      } else {
        this.nodesPerFrame = Math.round(Math.max(this.nodesPerFrame * .8, 10));
      }
    } else {
      this.nodesPerFrame = 10;
    }
    ref1 = this.highlightNodes.splice(0, this.nodesPerFrame);
    for (i = 0, len = ref1.length; i < len; i++) {
      el = ref1[i];
      if (clipEl = el.lastElementChild) {
        $.remove(clipEl);
      }
      Prism.highlightElement(el);
      if (clipEl) {
        $.append(el, clipEl);
      }
    }
    if (this.highlightNodes.length > 0) {
      $.requestAnimationFrame(this.paintCode);
    }
    this.previousTiming = timing;
  }

};
