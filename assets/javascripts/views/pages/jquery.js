  //= require views/pages/base
var ref,
  boundMethodCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new Error('Bound instance method accessed before binding'); } };

ref = app.views.JqueryPage = (function() {
  class JqueryPage extends app.views.BasePage {
    constructor() {
      super();
      this.onIframeLoaded = this.onIframeLoaded.bind(this);
    }

    afterRender() {
      var i, iframe, len, ref1;
      ref1 = this.findAllByTag('iframe');
      // Prevent jQuery Mobile's demo iframes from scrolling the page
      for (i = 0, len = ref1.length; i < len; i++) {
        iframe = ref1[i];
        iframe.style.display = 'none';
        $.on(iframe, 'load', this.onIframeLoaded);
      }
      return this.runExamples();
    }

    onIframeLoaded(event) {
      boundMethodCheck(this, ref);
      event.target.style.display = '';
      $.off(event.target, 'load', this.onIframeLoaded);
    }

    runExamples() {
      var el, i, len, ref1;
      ref1 = this.findAllByClass('entry-example');
      for (i = 0, len = ref1.length; i < len; i++) {
        el = ref1[i];
        try {
          this.runExample(el);
        } catch (error) {

        }
      }
    }

    runExample(el) {
      var doc, iframe, source;
      source = el.getElementsByClassName('syntaxhighlighter')[0];
      if (!(source && source.innerHTML.indexOf('!doctype') !== -1)) {
        return;
      }
      if (!(iframe = el.getElementsByClassName(this.constructor.demoClassName)[0])) {
        iframe = document.createElement('iframe');
        iframe.className = this.constructor.demoClassName;
        iframe.width = '100%';
        iframe.height = 200;
        el.appendChild(iframe);
      }
      doc = iframe.contentDocument;
      doc.write(this.fixIframeSource(source.textContent));
      doc.close();
    }

    fixIframeSource(source) {
      source = source.replace('"/resources/', '"https://api.jquery.com/resources/'); // attr(), keydown()
      source = source.replace('</head>', `<style>
  html, body { border: 0; margin: 0; padding: 0; }
  body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; }
</style>
<script>
  $.ajaxPrefilter(function(opt, opt2, xhr) {
    if (opt.url.indexOf('http') !== 0) {
      xhr.abort();
      document.body.innerHTML = "<p><strong>This demo cannot run inside DevDocs.</strong></p>";
    }
  });
</script>
</head>`);
      return source.replace(/<script>/gi, '<script nonce="devdocs">');
    }

  };

  JqueryPage.demoClassName = '_jquery-demo';

  return JqueryPage;

}).call(this);
