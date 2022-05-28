// Match functions

var SEPARATOR,
  fuzzyRegexp,
  i,
  index,
  lastIndex,
  match,
  matchIndex,
  matchLength,
  matcher,
  query,
  queryLength,
  ref,
  score,
  separators,
  value,
  valueLength,
  boundMethodCheck = function (instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new Error("Bound instance method accessed before binding");
    }
  };

SEPARATOR = ".";

query = null;

queryLength = null;

value = null;

valueLength = null;

matcher = null; // current match function

fuzzyRegexp = null; // query fuzzy regexp

index = null; // position of the query in the string being matched

lastIndex = null; // last position of the query in the string being matched

match = null; // regexp match data

matchIndex = null;

matchLength = null;

score = null; // score for the current match

separators = null; // counter

i = null; // cursor

function exactMatch() {
  index = value.indexOf(query);

  if (!(index >= 0)) {
    return;
  }

  lastIndex = value.lastIndexOf(query);

  if (index !== lastIndex) {
    return Math.max(
      scoreExactMatch(),
      ((index = lastIndex) && scoreExactMatch()) || 0
    );
  } else {
    return scoreExactMatch();
  }
}

function scoreExactMatch() {
  // Remove one point for each unmatched character.
  score = 100 - (valueLength - queryLength);

  if (index > 0) {
    // If the character preceding the query is a dot, assign the same score
    // as if the query was found at the beginning of the string, minus one.
    if (value.charAt(index - 1) === SEPARATOR) {
      score += index - 1;
      // Don't match a single-character query unless it's found at the beginning
      // of the string or is preceded by a dot.
    } else if (queryLength === 1) {
      return;
    } else {
      // (1) Remove one point for each unmatched character up to the nearest
      //     preceding dot or the beginning of the string.
      // (2) Remove one point for each unmatched character following the query.
      i = index - 2;
      while (i >= 0 && value.charAt(i) !== SEPARATOR) {
        i--;
      }
      score -= index - i + (valueLength - queryLength - index); // (1) // (2)
    }

    // Remove one point for each dot preceding the query, except for the one
    // immediately before the query.
    separators = 0;
    i = index - 2;
    while (i >= 0) {
      if (value.charAt(i) === SEPARATOR) {
        separators++;
      }
      i--;
    }
    score -= separators;
  }

  // Remove five points for each dot following the query.
  separators = 0;

  i = valueLength - queryLength - index - 1;

  while (i >= 0) {
    if (value.charAt(index + queryLength + i) === SEPARATOR) {
      separators++;
    }
    i--;
  }

  score -= separators * 5;

  return Math.max(1, score);
}

function fuzzyMatch() {
  if (valueLength <= queryLength || value.indexOf(query) >= 0) {
    return;
  }

  if (!(match = fuzzyRegexp.exec(value))) {
    return;
  }

  matchIndex = match.index;

  matchLength = match[0].length;

  score = scoreFuzzyMatch();

  if (
    (match = fuzzyRegexp.exec(
      value.slice((i = value.lastIndexOf(SEPARATOR) + 1))
    ))
  ) {
    matchIndex = i + match.index;
    matchLength = match[0].length;
    return Math.max(score, scoreFuzzyMatch());
  } else {
    return score;
  }
}

function scoreFuzzyMatch() {
  // When the match is at the beginning of the string or preceded by a dot.
  if (matchIndex === 0 || value.charAt(matchIndex - 1) === SEPARATOR) {
    return Math.max(66, 100 - matchLength);
    // When the match is at the end of the string.
  } else if (matchIndex + matchLength === valueLength) {
    return Math.max(33, 67 - matchLength);
  } else {
    // When the match is in the middle of the string.
    return Math.max(1, 34 - matchLength);
  }
}

const CHUNK_SIZE = 20000;

const DEFAULTS = {
  max_results: app.config.max_results,
  fuzzy_min_length: 3,
};

const SEPARATORS_REGEXP =
  /#|::|:-|->|\$(?=\w)|\-(?=\w)|\:(?=\w)|\ [\/\-&]\ |:\ |\ /g;

const EOS_SEPARATORS_REGEXP = /(\w)[\-:]$/;

const INFO_PARANTHESES_REGEXP = /\ \(\w+?\)$/;

const EMPTY_PARANTHESES_REGEXP = /\(\)/;

const EVENT_REGEXP = /\ event$/;

const DOT_REGEXP = /\.+/g;

const WHITESPACE_REGEXP = /\s/g;

const EMPTY_STRING = "";

const ELLIPSIS = "...";

const STRING = "string";

// Searchers

app.Searcher = class Searcher {
  static normalizeString(string) {
    return string
      .toLowerCase()
      .replace(ELLIPSIS, EMPTY_STRING)
      .replace(EVENT_REGEXP, EMPTY_STRING)
      .replace(INFO_PARANTHESES_REGEXP, EMPTY_STRING)
      .replace(SEPARATORS_REGEXP, SEPARATOR)
      .replace(DOT_REGEXP, SEPARATOR)
      .replace(EMPTY_PARANTHESES_REGEXP, EMPTY_STRING)
      .replace(WHITESPACE_REGEXP, EMPTY_STRING);
  }

  static normalizeQuery(string) {
    string = this.normalizeString(string);
    return string.replace(EOS_SEPARATORS_REGEXP, "$1.");
  }

  constructor(options = {}) {
    this.match = this.match.bind(this);
    this.matchChunks = this.matchChunks.bind(this);
    this.options = $.extend({}, DEFAULTS, options);
  }

  find(data, attr, q) {
    this.kill();
    this.data = data;
    this.attr = attr;
    this.query = q;
    this.setup();
    if (this.isValid()) {
      this.match();
    } else {
      this.end();
    }
  }

  setup() {
    query = this.query = this.constructor.normalizeQuery(this.query);
    queryLength = query.length;
    this.dataLength = this.data.length;
    this.matchers = [exactMatch];
    this.totalResults = 0;
    this.setupFuzzy();
  }

  setupFuzzy() {
    if (queryLength >= this.options.fuzzy_min_length) {
      fuzzyRegexp = this.queryToFuzzyRegexp(query);
      this.matchers.push(fuzzyMatch);
    } else {
      fuzzyRegexp = null;
    }
  }

  isValid() {
    return queryLength > 0 && query !== SEPARATOR;
  }

  end() {
    if (!this.totalResults) {
      this.triggerResults([]);
    }
    this.trigger("end");
    this.free();
  }

  kill() {
    if (this.timeout) {
      clearTimeout(this.timeout);
      this.free();
    }
  }

  free() {
    this.data =
      this.attr =
      this.dataLength =
      this.matchers =
      this.matcher =
      this.query =
      this.totalResults =
      this.scoreMap =
      this.cursor =
      this.timeout =
        null;
  }

  match() {
    if (!this.foundEnough() && (this.matcher = this.matchers.shift())) {
      this.setupMatcher();
      this.matchChunks();
    } else {
      this.end();
    }
  }

  setupMatcher() {
    this.cursor = 0;
    this.scoreMap = new Array(101);
  }

  matchChunks() {
    this.matchChunk();
    if (this.cursor === this.dataLength || this.scoredEnough()) {
      this.delay(this.match);
      this.sendResults();
    } else {
      this.delay(this.matchChunks);
    }
  }

  matchChunk() {
    var j, k, len, ref, ref1;
    matcher = this.matcher;
    for (
      j = 0, ref = this.chunkSize();
      0 <= ref ? j < ref : j > ref;
      0 <= ref ? j++ : j--
    ) {
      value = this.data[this.cursor][this.attr];
      if (value.split) {
        // string
        valueLength = value.length;
        if ((score = matcher())) {
          // array
          this.addResult(this.data[this.cursor], score);
        }
      } else {
        score = 0;
        ref1 = this.data[this.cursor][this.attr];
        for (k = 0, len = ref1.length; k < len; k++) {
          value = ref1[k];
          valueLength = value.length;
          score = Math.max(score, matcher() || 0);
        }
        if (score > 0) {
          this.addResult(this.data[this.cursor], score);
        }
      }
      this.cursor++;
    }
  }

  chunkSize() {
    if (this.cursor + CHUNK_SIZE > this.dataLength) {
      return this.dataLength % CHUNK_SIZE;
    } else {
      return CHUNK_SIZE;
    }
  }

  scoredEnough() {
    var ref;
    return (
      ((ref = this.scoreMap[100]) != null ? ref.length : void 0) >=
      this.options.max_results
    );
  }

  foundEnough() {
    return this.totalResults >= this.options.max_results;
  }

  addResult(object, score) {
    var base, name;
    (
      (base = this.scoreMap)[(name = Math.round(score))] || (base[name] = [])
    ).push(object);
    this.totalResults++;
  }

  getResults() {
    var j, objects, ref, results;
    results = [];
    ref = this.scoreMap;
    for (j = ref.length - 1; j >= 0; j += -1) {
      objects = ref[j];
      if (objects) {
        results.push.apply(results, objects);
      }
    }
    return results.slice(0, this.options.max_results);
  }

  sendResults() {
    var results;
    results = this.getResults();
    if (results.length) {
      this.triggerResults(results);
    }
  }

  triggerResults(results) {
    this.trigger("results", results);
  }

  delay(fn) {
    return (this.timeout = setTimeout(fn, 1));
  }

  queryToFuzzyRegexp(string) {
    var char, chars, j, len;
    chars = string.split("");
    for (i = j = 0, len = chars.length; j < len; i = ++j) {
      char = chars[i];
      chars[i] = $.escapeRegexp(char);
    }
    return new RegExp(chars.join(".*?")); // abc -> /a.*?b.*?c.*?/
  }
};

$.extend(app.Searcher.prototype, Events);

ref = app.SynchronousSearcher = class SynchronousSearcher extends app.Searcher {
  constructor() {
    super(...arguments);
    this.match = this.match.bind(this);
  }

  match() {
    boundMethodCheck(this, ref);
    if (this.matcher) {
      this.allResults || (this.allResults = []);
      this.allResults.push.apply(this.allResults, this.getResults());
    }
    return super.match();
  }

  free() {
    this.allResults = null;
    return super.free();
  }

  end() {
    this.sendResults(true);
    return super.end();
  }

  sendResults(end) {
    var ref1;
    if (end && ((ref1 = this.allResults) != null ? ref1.length : void 0)) {
      return this.triggerResults(this.allResults);
    }
  }

  delay(fn) {
    return fn();
  }
};
