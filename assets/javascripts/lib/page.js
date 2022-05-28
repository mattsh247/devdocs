/*
 * Based on github.com/visionmedia/page.js
 * Licensed under the MIT license
 * Copyright 2012 TJ Holowaychuk <tj@vision-media.ca>
 */

let running = false;

let currentState = null;

const callbacks = [];

this.page = function (value, fn) {
  var route;
  if (typeof value === "function") {
    page("*", value);
  } else if (typeof fn === "function") {
    route = new Route(value);
    callbacks.push(route.middleware(fn));
  } else if (typeof value === "string") {
    page.show(value, fn);
  } else {
    page.start(value);
  }
};

page.start = function (options = {}) {
  if (!running) {
    running = true;
    addEventListener("popstate", onpopstate);
    addEventListener("click", onclick);
    page.replace(currentPath(), null, null, true);
  }
};

page.stop = function () {
  if (running) {
    running = false;
    removeEventListener("click", onclick);
    removeEventListener("popstate", onpopstate);
  }
};

page.show = function (path, state) {
  var context, previousState, res;
  if (path === (currentState != null ? currentState.path : void 0)) {
    return;
  }
  context = new Context(path, state);
  previousState = currentState;
  currentState = context.state;
  if ((res = page.dispatch(context))) {
    currentState = previousState;
    location.assign(res);
  } else {
    context.pushState();
    updateCanonicalLink();
    track();
  }
  return context;
};

page.replace = function (path, state, skipDispatch, init) {
  var context, result;
  context = new Context(path, state || currentState);
  context.init = init;
  currentState = context.state;
  if (!skipDispatch) {
    result = page.dispatch(context);
  }
  if (result) {
    context = new Context(result);
    context.init = init;
    currentState = context.state;
    page.dispatch(context);
  }
  context.replaceState();
  updateCanonicalLink();
  if (!skipDispatch) {
    track();
  }
  return context;
};

page.dispatch = function (context) {
  var i, next;
  i = 0;
  next = function () {
    var fn, res;
    if ((fn = callbacks[i++])) {
      res = fn(context, next);
    }
    return res;
  };
  return next();
};

page.canGoBack = function () {
  return !Context.isIntialState(currentState);
};

page.canGoForward = function () {
  return !Context.isLastState(currentState);
};

function currentPath() {
  return location.pathname + location.search + location.hash;
}

class Context {
  static isIntialState(state) {
    return state.id === 0;
  }

  static isLastState(state) {
    return state.id === this.stateId - 1;
  }

  static isInitialPopState(state) {
    return state.path === this.initialPath && this.stateId === 1;
  }

  static isSameSession(state) {
    return state.sessionId === this.sessionId;
  }

  constructor(path1, state1) {
    this.path = path1 || "/";
    this.state = state1 || {};
    this.pathname = this.path.replace(
      /(?:\?([^#]*))?(?:#(.*))?$/,
      (_, query, hash) => {
        this.query = query;
        this.hash = hash;
        return "";
      }
    );
    this.state.id = this.state.id ?? this.constructor.stateId++;
    this.state.sessionId = this.state.sessionId ?? this.constructor.sessionId;
    this.state.path = this.path;
  }

  pushState() {
    history.pushState(this.state, "", this.path);
  }

  replaceState() {
    try {
      history.replaceState(this.state, "", this.path); // NS_ERROR_FAILURE in Firefox
    } catch (error) {}
  }
}

Context.initialPath = currentPath();

Context.sessionId = Date.now();

Context.stateId = 0;

class Route {
  constructor(path1, options = {}) {
    this.path = path1;
    this.keys = [];
    this.regexp = pathtoRegexp(this.path, this.keys);
  }

  middleware(fn) {
    return (context, next) => {
      var params;
      if (this.match(context.pathname, (params = []))) {
        context.params = params;
        return fn(context, next);
      } else {
        return next();
      }
    };
  }

  match(path, params) {
    var i, j, key, len, matchData, ref, value;
    if (!(matchData = this.regexp.exec(path))) {
      return;
    }
    ref = matchData.slice(1);
    for (i = j = 0, len = ref.length; j < len; i = ++j) {
      value = ref[i];
      if (typeof value === "string") {
        value = decodeURIComponent(value);
      }
      if ((key = this.keys[i])) {
        params[key.name] = value;
      } else {
        params.push(value);
      }
    }
    return true;
  }
}

function pathtoRegexp(path, keys) {
  if (path instanceof RegExp) {
    return path;
  }
  if (path instanceof Array) {
    path = `(${path.join("|")})`;
  }
  path = path
    .replace(/\/\(/g, "(?:/")
    .replace(
      /(\/)?(\.)?:(\w+)(?:(\(.*?\)))?(\?)?/g,
      function (_, slash = "", format = "", key, capture, optional) {
        var str;
        keys.push({
          name: key,
          optional: !!optional,
        });
        str = optional ? "" : slash;
        str += "(?:";
        if (optional) {
          str += slash;
        }
        str += format;
        str += capture || (format ? "([^/.]+?)" : "([^/]+?)");
        str += ")";
        if (optional) {
          str += optional;
        }
        return str;
      }
    )
    .replace(/([\/.])/g, "\\$1")
    .replace(/\*/g, "(.*)");
  return new RegExp(`^${path}$`);
}

onpopstate = function (event) {
  if (!event.state || Context.isInitialPopState(event.state)) {
    return;
  }
  if (Context.isSameSession(event.state)) {
    page.replace(event.state.path, event.state);
  } else {
    location.reload();
  }
};

onclick = function (event) {
  var link, path;
  try {
    if (
      event.which !== 1 ||
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.defaultPrevented
    ) {
      return;
    }
  } catch (error) {
    return;
  }
  link = $.eventTarget(event);
  while (link && link.tagName !== "A") {
    link = link.parentNode;
  }
  if (link && !link.target && isSameOrigin(link.href)) {
    event.preventDefault();
    path = link.pathname + link.search + link.hash;
    path = path.replace(/^\/\/+/, "/"); // IE11 bug
    page.show(path);
  }
};

function isSameOrigin(url) {
  return url.indexOf(`${location.protocol}//${location.hostname}`) === 0;
}

function updateCanonicalLink() {
  this.canonicalLink ||
    (this.canonicalLink = document.head.querySelector('link[rel="canonical"]'));
  return this.canonicalLink.setAttribute(
    "href",
    `https://${location.host}${location.pathname}`
  );
}

const trackers = [];

function track() {
  var consentAsked, consentGiven, j, len, tracker;
  if (app.config.env !== "production") {
    return;
  }
  if (navigator.doNotTrack === "1") {
    return;
  }
  if (navigator.globalPrivacyControl) {
    return;
  }
  consentGiven = Cookies.get("analyticsConsent");
  consentAsked = Cookies.get("analyticsConsentAsked");
  if (consentGiven === "1") {
    for (j = 0, len = trackers.length; j < len; j++) {
      tracker = trackers[j];
      tracker.call();
    }
  } else if (consentGiven === void 0 && consentAsked === void 0) {
    // Only ask for consent once per browser session
    Cookies.set("analyticsConsentAsked", "1");
    new app.views.Notif("AnalyticsConsent", {
      autoHide: null,
    });
  }
}

this.resetAnalytics = function () {
  var cookie, j, len, name, ref;
  ref = document.cookie.split(/;\s?/);
  for (j = 0, len = ref.length; j < len; j++) {
    cookie = ref[j];
    name = cookie.split("=")[0];
    if (name[0] === "_" && name[1] !== "_") {
      Cookies.expire(name);
    }
  }
};
