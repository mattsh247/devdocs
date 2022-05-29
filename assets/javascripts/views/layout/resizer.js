var ref,
  boundMethodCheck = function(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new Error('Bound instance method accessed before binding'); } };

ref = app.views.Resizer = (function() {
  var MAX, MIN;

  class Resizer extends app.View {
    constructor() {
      super();
      this.onDragStart = this.onDragStart.bind(this);
      this.onDrag = this.onDrag.bind(this);
      this.onDragEnd = this.onDragEnd.bind(this);
    }

    static isSupported() {
      return 'ondragstart' in document.createElement('div') && !app.isMobile();
    }

    init() {
      this.el.setAttribute('draggable', 'true');
      this.appendTo($('._app'));
    }

    resize(value, save) {
      var newSize;
      value -= app.el.offsetLeft;
      if (!(value > 0)) {
        return;
      }
      value = Math.min(Math.max(Math.round(value), MIN), MAX);
      newSize = `${value}px`;
      document.documentElement.style.setProperty('--sidebarWidth', newSize);
      if (save) {
        app.settings.setSize(value);
      }
    }

    onDragStart(event) {
      boundMethodCheck(this, ref);
      event.dataTransfer.effectAllowed = 'link';
      event.dataTransfer.setData('Text', '');
      $.on(window, 'dragover', this.onDrag);
    }

    onDrag(event) {
      var value;
      boundMethodCheck(this, ref);
      value = event.pageX;
      if (!(value > 0)) {
        return;
      }
      this.lastDragValue = value;
      if (this.lastDrag && this.lastDrag > Date.now() - 50) {
        return;
      }
      this.lastDrag = Date.now();
      this.resize(value, false);
    }

    onDragEnd(event) {
      var value;
      boundMethodCheck(this, ref);
      $.off(window, 'dragover', this.onDrag);
      value = event.pageX || (event.screenX - window.screenX);
      if (this.lastDragValue && !((this.lastDragValue - 5 < value && value < this.lastDragValue + 5))) { // https://github.com/freeCodeCamp/devdocs/issues/265
        value = this.lastDragValue;
      }
      this.resize(value, true);
    }

  };

  Resizer.className = '_resizer';

  Resizer.events = {
    dragstart: 'onDragStart',
    dragend: 'onDragEnd'
  };

  MIN = 260;

  MAX = 600;

  return Resizer;

}).call(this);
