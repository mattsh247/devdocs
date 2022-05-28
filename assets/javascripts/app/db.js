app.DB = class DB {
  constructor() {
    this.NAME = "docs";
    this.VERSION = 15;
    this.onOpenSuccess = this.onOpenSuccess.bind(this);
    this.onOpenError = this.onOpenError.bind(this);
    this.checkForCorruptedDocs = this.checkForCorruptedDocs.bind(this);
    this.deleteCorruptedDocs = this.deleteCorruptedDocs.bind(this);
    this.versionMultipler = $.isIE() ? 1e5 : 1e9;
    this.useIndexedDB = this.useIndexedDB();
    this.callbacks = [];
  }

  db(fn) {
    var error, req;
    if (!this.useIndexedDB) {
      return fn();
    }
    if (fn) {
      this.callbacks.push(fn);
    }
    if (this.open) {
      return;
    }
    try {
      this.open = true;
      req = indexedDB.open(
        this.NAME,
        this.VERSION * this.versionMultipler + this.userVersion()
      );
      req.onsuccess = this.onOpenSuccess;
      req.onerror = this.onOpenError;
      req.onupgradeneeded = this.onUpgradeNeeded;
    } catch (error1) {
      error = error1;
      this.fail("exception", error);
    }
  }

  onOpenSuccess(event) {
    var db, error;
    db = event.target.result;
    if (db.objectStoreNames.length === 0) {
      try {
        db.close();
      } catch (error1) {}
      this.open = false;
      this.fail("empty");
    } else if ((error = this.buggyIDB(db))) {
      try {
        db.close();
      } catch (error1) {}
      this.open = false;
      this.fail("buggy", error);
    } else {
      this.runCallbacks(db);
      this.open = false;
      db.close();
    }
  }

  onOpenError(event) {
    var error;
    event.preventDefault();
    this.open = false;
    error = event.target.error;
    switch (error.name) {
      case "QuotaExceededError":
        this.onQuotaExceededError();
        break;
      case "VersionError":
        this.onVersionError();
        break;
      case "InvalidStateError":
        this.fail("private_mode");
        break;
      default:
        this.fail("cant_open", error);
    }
  }

  fail(reason, error) {
    this.cachedDocs = null;
    this.useIndexedDB = false;
    this.reason || (this.reason = reason);
    this.error || (this.error = error);
    if (error) {
      if (typeof console.error === "function") {
        console.error("IDB error", error);
      }
    }
    this.runCallbacks();
    if (error && reason === "cant_open") {
      Raven.captureMessage(`${error.name}: ${error.message}`, {
        level: "warning",
        fingerprint: [error.name],
      });
    }
  }

  onQuotaExceededError() {
    this.reset();
    this.db();
    app.onQuotaExceeded();
    Raven.captureMessage("QuotaExceededError", {
      level: "warning",
    });
  }

  onVersionError() {
    var req;
    req = indexedDB.open(this.NAME);
    req.onsuccess = (event) => {
      return this.handleVersionMismatch(event.target.result.version);
    };
    req.onerror = function (event) {
      event.preventDefault();
      return this.fail("cant_open", error);
    };
  }

  handleVersionMismatch(actualVersion) {
    if (Math.floor(actualVersion / this.versionMultipler) !== this.VERSION) {
      this.fail("version");
    } else {
      this.setUserVersion(actualVersion - this.VERSION * this.versionMultipler);
      this.db();
    }
  }

  buggyIDB(db) {
    var error;
    if (this.checkedBuggyIDB) {
      return;
    }
    this.checkedBuggyIDB = true;
    try {
      this.idbTransaction(db, {
        stores: $.makeArray(db.objectStoreNames).slice(0, 2),
        mode: "readwrite",
      }).abort(); // https://bugs.webkit.org/show_bug.cgi?id=136937
    } catch (error1) {
      error = error1;
      return error;
    }
  }

  runCallbacks(db) {
    var fn;
    while ((fn = this.callbacks.shift())) {
      fn(db);
    }
  }

  onUpgradeNeeded(event) {
    var db, doc, i, j, len, len1, name, objectStoreNames, ref;
    if (!(db = event.target.result)) {
      return;
    }
    objectStoreNames = $.makeArray(db.objectStoreNames);
    if (!$.arrayDelete(objectStoreNames, "docs")) {
      try {
        db.createObjectStore("docs");
      } catch (error1) {}
    }
    ref = app.docs.all();
    for (i = 0, len = ref.length; i < len; i++) {
      doc = ref[i];
      if (!$.arrayDelete(objectStoreNames, doc.slug)) {
        try {
          db.createObjectStore(doc.slug);
        } catch (error1) {}
      }
    }
    for (j = 0, len1 = objectStoreNames.length; j < len1; j++) {
      name = objectStoreNames[j];
      try {
        db.deleteObjectStore(name);
      } catch (error1) {}
    }
  }

  store(doc, data, onSuccess, onError, _retry = true) {
    this.db((db) => {
      var content, path, store, txn;
      if (!db) {
        onError();
        return;
      }
      txn = this.idbTransaction(db, {
        stores: ["docs", doc.slug],
        mode: "readwrite",
        ignoreError: false,
      });
      txn.oncomplete = () => {
        var ref;
        if ((ref = this.cachedDocs) != null) {
          ref[doc.slug] = doc.mtime;
        }
        onSuccess();
      };
      txn.onerror = (event) => {
        var ref;
        event.preventDefault();
        if (
          ((ref = txn.error) != null ? ref.name : void 0) === "NotFoundError" &&
          _retry
        ) {
          this.migrate();
          setTimeout(() => {
            return this.store(doc, data, onSuccess, onError, false);
          }, 0);
        } else {
          onError(event);
        }
      };
      store = txn.objectStore(doc.slug);
      store.clear();
      for (path in data) {
        content = data[path];
        store.add(content, path);
      }
      store = txn.objectStore("docs");
      store.put(doc.mtime, doc.slug);
    });
  }

  unstore(doc, onSuccess, onError, _retry = true) {
    this.db((db) => {
      var store, txn;
      if (!db) {
        onError();
        return;
      }
      txn = this.idbTransaction(db, {
        stores: ["docs", doc.slug],
        mode: "readwrite",
        ignoreError: false,
      });
      txn.oncomplete = () => {
        var ref;
        if ((ref = this.cachedDocs) != null) {
          delete ref[doc.slug];
        }
        onSuccess();
      };
      txn.onerror = function (event) {
        var ref;
        event.preventDefault();
        if (
          ((ref = txn.error) != null ? ref.name : void 0) === "NotFoundError" &&
          _retry
        ) {
          this.migrate();
          setTimeout(() => {
            return this.unstore(doc, onSuccess, onError, false);
          }, 0);
        } else {
          onError(event);
        }
      };
      store = txn.objectStore("docs");
      store.delete(doc.slug);
      store = txn.objectStore(doc.slug);
      store.clear();
    });
  }

  version(doc, fn) {
    var version;
    if ((version = this.cachedVersion(doc)) != null) {
      fn(version);
      return;
    }
    this.db((db) => {
      var req, store, txn;
      if (!db) {
        fn(false);
        return;
      }
      txn = this.idbTransaction(db, {
        stores: ["docs"],
        mode: "readonly",
      });
      store = txn.objectStore("docs");
      req = store.get(doc.slug);
      req.onsuccess = function () {
        fn(req.result);
      };
      req.onerror = function (event) {
        event.preventDefault();
        fn(false);
      };
    });
  }

  cachedVersion(doc) {
    if (!this.cachedDocs) {
      return;
    }
    return this.cachedDocs[doc.slug] || false;
  }

  versions(docs, fn) {
    var versions;
    if ((versions = this.cachedVersions(docs))) {
      fn(versions);
      return;
    }
    return this.db((db) => {
      var result, store, txn;
      if (!db) {
        fn(false);
        return;
      }
      txn = this.idbTransaction(db, {
        stores: ["docs"],
        mode: "readonly",
      });
      txn.oncomplete = function () {
        fn(result);
      };
      store = txn.objectStore("docs");
      result = {};
      docs.forEach(function (doc) {
        var req;
        req = store.get(doc.slug);
        req.onsuccess = function () {
          result[doc.slug] = req.result;
        };
        req.onerror = function (event) {
          event.preventDefault();
          result[doc.slug] = false;
        };
      });
    });
  }

  cachedVersions(docs) {
    var doc, i, len, result;
    if (!this.cachedDocs) {
      return;
    }
    result = {};
    for (i = 0, len = docs.length; i < len; i++) {
      doc = docs[i];
      result[doc.slug] = this.cachedVersion(doc);
    }
    return result;
  }

  load(entry, onSuccess, onError) {
    if (this.shouldLoadWithIDB(entry)) {
      onError = this.loadWithXHR.bind(this, entry, onSuccess, onError);
      return this.loadWithIDB(entry, onSuccess, onError);
    } else {
      return this.loadWithXHR(entry, onSuccess, onError);
    }
  }

  loadWithXHR(entry, onSuccess, onError) {
    return ajax({
      url: entry.fileUrl(),
      dataType: "html",
      success: onSuccess,
      error: onError,
    });
  }

  loadWithIDB(entry, onSuccess, onError) {
    return this.db((db) => {
      var req, store, txn;
      if (!db) {
        onError();
        return;
      }
      if (!db.objectStoreNames.contains(entry.doc.slug)) {
        onError();
        this.loadDocsCache(db);
        return;
      }
      txn = this.idbTransaction(db, {
        stores: [entry.doc.slug],
        mode: "readonly",
      });
      store = txn.objectStore(entry.doc.slug);
      req = store.get(entry.dbPath());
      req.onsuccess = function () {
        if (req.result) {
          onSuccess(req.result);
        } else {
          onError();
        }
      };
      req.onerror = function (event) {
        event.preventDefault();
        onError();
      };
      this.loadDocsCache(db);
    });
  }

  loadDocsCache(db) {
    var req, txn;
    if (this.cachedDocs) {
      return;
    }
    this.cachedDocs = {};
    txn = this.idbTransaction(db, {
      stores: ["docs"],
      mode: "readonly",
    });
    txn.oncomplete = () => {
      setTimeout(this.checkForCorruptedDocs, 50);
    };
    req = txn.objectStore("docs").openCursor();
    req.onsuccess = (event) => {
      var cursor;
      if (!(cursor = event.target.result)) {
        return;
      }
      this.cachedDocs[cursor.key] = cursor.value;
      cursor.continue();
    };
    req.onerror = function (event) {
      event.preventDefault();
    };
  }

  checkForCorruptedDocs() {
    this.db((db) => {
      var doc, docs, i, j, k, key, len, len1, len2, ref, slug, txn, value;
      this.corruptedDocs = [];
      docs = function () {
        var ref, results;
        ref = this.cachedDocs;
        results = [];
        for (key in ref) {
          value = ref[key];
          if (value) {
            results.push(key);
          }
        }
        return results;
      }.call(this);
      if (docs.length === 0) {
        return;
      }
      for (i = 0, len = docs.length; i < len; i++) {
        slug = docs[i];
        if (!app.docs.findBy("slug", slug)) {
          this.corruptedDocs.push(slug);
        }
      }
      ref = this.corruptedDocs;
      for (j = 0, len1 = ref.length; j < len1; j++) {
        slug = ref[j];
        $.arrayDelete(docs, slug);
      }
      if (docs.length === 0) {
        setTimeout(this.deleteCorruptedDocs, 0);
        return;
      }
      txn = this.idbTransaction(db, {
        stores: docs,
        mode: "readonly",
        ignoreError: false,
      });
      txn.oncomplete = () => {
        if (this.corruptedDocs.length > 0) {
          setTimeout(this.deleteCorruptedDocs, 0);
        }
      };
      for (k = 0, len2 = docs.length; k < len2; k++) {
        doc = docs[k];
        txn.objectStore(doc).get("index").onsuccess = (event) => {
          if (!event.target.result) {
            this.corruptedDocs.push(event.target.source.name);
          }
        };
      }
    });
  }

  deleteCorruptedDocs() {
    this.db((db) => {
      var doc, store, txn;
      txn = this.idbTransaction(db, {
        stores: ["docs"],
        mode: "readwrite",
        ignoreError: false,
      });
      store = txn.objectStore("docs");
      while ((doc = this.corruptedDocs.pop())) {
        this.cachedDocs[doc] = false;
        store.delete(doc);
      }
    });
    Raven.captureMessage("corruptedDocs", {
      level: "info",
      extra: {
        docs: this.corruptedDocs.join(","),
      },
    });
  }

  shouldLoadWithIDB(entry) {
    return (
      this.useIndexedDB && (!this.cachedDocs || this.cachedDocs[entry.doc.slug])
    );
  }

  idbTransaction(db, options) {
    var txn;
    app.lastIDBTransaction = [options.stores, options.mode];
    txn = db.transaction(options.stores, options.mode);
    if (options.ignoreError !== false) {
      txn.onerror = function (event) {
        event.preventDefault();
      };
    }
    if (options.ignoreAbort !== false) {
      txn.onabort = function (event) {
        event.preventDefault();
      };
    }
    return txn;
  }

  reset() {
    try {
      if (typeof indexedDB !== "undefined" && indexedDB !== null) {
        indexedDB.deleteDatabase(this.NAME);
      }
    } catch (error1) {}
  }

  useIndexedDB() {
    try {
      if (!app.isSingleDoc() && window.indexedDB) {
        return true;
      } else {
        this.reason = "not_supported";
        return false;
      }
    } catch (error1) {
      return false;
    }
  }

  migrate() {
    app.settings.set("schema", this.userVersion() + 1);
  }

  setUserVersion(version) {
    app.settings.set("schema", version);
  }

  userVersion() {
    return app.settings.get("schema");
  }
};
