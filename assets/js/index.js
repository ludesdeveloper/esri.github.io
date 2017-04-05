/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "http://localhost:8080/";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 2);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

/*! highlight.js v9.6.0 | BSD3 License | git.io/hljslicense */
(function (factory) {

  // Find the global object for export to both the browser and web workers.
  var globalObject = typeof window === 'object' && window || typeof self === 'object' && self;

  // Setup highlight.js for different environments. First is Node.js or
  // CommonJS.
  if (true) {
    factory(exports);
  } else if (globalObject) {
    // Export hljs globally even when using AMD for cases when this script
    // is loaded with others that may still expect a global hljs.
    globalObject.hljs = factory({});

    // Finally register the global hljs with AMD.
    if (typeof define === 'function' && define.amd) {
      define([], function () {
        return globalObject.hljs;
      });
    }
  }
})(function (hljs) {
  // Convenience variables for build-in objects
  var ArrayProto = [],
      objectKeys = Object.keys;

  // Global internal variables used within the highlight.js library.
  var languages = {},
      aliases = {};

  // Regular expressions used throughout the highlight.js library.
  var noHighlightRe = /^(no-?highlight|plain|text)$/i,
      languagePrefixRe = /\blang(?:uage)?-([\w-]+)\b/i,
      fixMarkupRe = /((^(<[^>]+>|\t|)+|(?:\n)))/gm;

  var spanEndTag = '</span>';

  // Global options used when within external APIs. This is modified when
  // calling the `hljs.configure` function.
  var options = {
    classPrefix: 'hljs-',
    tabReplace: null,
    useBR: false,
    languages: undefined
  };

  // Object map that is used to escape some common HTML characters.
  var escapeRegexMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;'
  };

  /* Utility functions */

  function escape(value) {
    return value.replace(/[&<>]/gm, function (character) {
      return escapeRegexMap[character];
    });
  }

  function tag(node) {
    return node.nodeName.toLowerCase();
  }

  function testRe(re, lexeme) {
    var match = re && re.exec(lexeme);
    return match && match.index === 0;
  }

  function isNotHighlighted(language) {
    return noHighlightRe.test(language);
  }

  function blockLanguage(block) {
    var i, match, length, _class;
    var classes = block.className + ' ';

    classes += block.parentNode ? block.parentNode.className : '';

    // language-* takes precedence over non-prefixed class names.
    match = languagePrefixRe.exec(classes);
    if (match) {
      return getLanguage(match[1]) ? match[1] : 'no-highlight';
    }

    classes = classes.split(/\s+/);

    for (i = 0, length = classes.length; i < length; i++) {
      _class = classes[i];

      if (isNotHighlighted(_class) || getLanguage(_class)) {
        return _class;
      }
    }
  }

  function inherit(parent, obj) {
    var key;
    var result = {};

    for (key in parent) result[key] = parent[key];
    if (obj) for (key in obj) result[key] = obj[key];
    return result;
  }

  /* Stream merging */

  function nodeStream(node) {
    var result = [];
    (function _nodeStream(node, offset) {
      for (var child = node.firstChild; child; child = child.nextSibling) {
        if (child.nodeType === 3) offset += child.nodeValue.length;else if (child.nodeType === 1) {
          result.push({
            event: 'start',
            offset: offset,
            node: child
          });
          offset = _nodeStream(child, offset);
          // Prevent void elements from having an end tag that would actually
          // double them in the output. There are more void elements in HTML
          // but we list only those realistically expected in code display.
          if (!tag(child).match(/br|hr|img|input/)) {
            result.push({
              event: 'stop',
              offset: offset,
              node: child
            });
          }
        }
      }
      return offset;
    })(node, 0);
    return result;
  }

  function mergeStreams(original, highlighted, value) {
    var processed = 0;
    var result = '';
    var nodeStack = [];

    function selectStream() {
      if (!original.length || !highlighted.length) {
        return original.length ? original : highlighted;
      }
      if (original[0].offset !== highlighted[0].offset) {
        return original[0].offset < highlighted[0].offset ? original : highlighted;
      }

      /*
      To avoid starting the stream just before it should stop the order is
      ensured that original always starts first and closes last:
       if (event1 == 'start' && event2 == 'start')
        return original;
      if (event1 == 'start' && event2 == 'stop')
        return highlighted;
      if (event1 == 'stop' && event2 == 'start')
        return original;
      if (event1 == 'stop' && event2 == 'stop')
        return highlighted;
       ... which is collapsed to:
      */
      return highlighted[0].event === 'start' ? original : highlighted;
    }

    function open(node) {
      function attr_str(a) {
        return ' ' + a.nodeName + '="' + escape(a.value) + '"';
      }
      result += '<' + tag(node) + ArrayProto.map.call(node.attributes, attr_str).join('') + '>';
    }

    function close(node) {
      result += '</' + tag(node) + '>';
    }

    function render(event) {
      (event.event === 'start' ? open : close)(event.node);
    }

    while (original.length || highlighted.length) {
      var stream = selectStream();
      result += escape(value.substr(processed, stream[0].offset - processed));
      processed = stream[0].offset;
      if (stream === original) {
        /*
        On any opening or closing tag of the original markup we first close
        the entire highlighted node stack, then render the original tag along
        with all the following original tags at the same offset and then
        reopen all the tags on the highlighted stack.
        */
        nodeStack.reverse().forEach(close);
        do {
          render(stream.splice(0, 1)[0]);
          stream = selectStream();
        } while (stream === original && stream.length && stream[0].offset === processed);
        nodeStack.reverse().forEach(open);
      } else {
        if (stream[0].event === 'start') {
          nodeStack.push(stream[0].node);
        } else {
          nodeStack.pop();
        }
        render(stream.splice(0, 1)[0]);
      }
    }
    return result + escape(value.substr(processed));
  }

  /* Initialization */

  function compileLanguage(language) {

    function reStr(re) {
      return re && re.source || re;
    }

    function langRe(value, global) {
      return new RegExp(reStr(value), 'm' + (language.case_insensitive ? 'i' : '') + (global ? 'g' : ''));
    }

    function compileMode(mode, parent) {
      if (mode.compiled) return;
      mode.compiled = true;

      mode.keywords = mode.keywords || mode.beginKeywords;
      if (mode.keywords) {
        var compiled_keywords = {};

        var flatten = function (className, str) {
          if (language.case_insensitive) {
            str = str.toLowerCase();
          }
          str.split(' ').forEach(function (kw) {
            var pair = kw.split('|');
            compiled_keywords[pair[0]] = [className, pair[1] ? Number(pair[1]) : 1];
          });
        };

        if (typeof mode.keywords === 'string') {
          // string
          flatten('keyword', mode.keywords);
        } else {
          objectKeys(mode.keywords).forEach(function (className) {
            flatten(className, mode.keywords[className]);
          });
        }
        mode.keywords = compiled_keywords;
      }
      mode.lexemesRe = langRe(mode.lexemes || /\w+/, true);

      if (parent) {
        if (mode.beginKeywords) {
          mode.begin = '\\b(' + mode.beginKeywords.split(' ').join('|') + ')\\b';
        }
        if (!mode.begin) mode.begin = /\B|\b/;
        mode.beginRe = langRe(mode.begin);
        if (!mode.end && !mode.endsWithParent) mode.end = /\B|\b/;
        if (mode.end) mode.endRe = langRe(mode.end);
        mode.terminator_end = reStr(mode.end) || '';
        if (mode.endsWithParent && parent.terminator_end) mode.terminator_end += (mode.end ? '|' : '') + parent.terminator_end;
      }
      if (mode.illegal) mode.illegalRe = langRe(mode.illegal);
      if (mode.relevance == null) mode.relevance = 1;
      if (!mode.contains) {
        mode.contains = [];
      }
      var expanded_contains = [];
      mode.contains.forEach(function (c) {
        if (c.variants) {
          c.variants.forEach(function (v) {
            expanded_contains.push(inherit(c, v));
          });
        } else {
          expanded_contains.push(c === 'self' ? mode : c);
        }
      });
      mode.contains = expanded_contains;
      mode.contains.forEach(function (c) {
        compileMode(c, mode);
      });

      if (mode.starts) {
        compileMode(mode.starts, parent);
      }

      var terminators = mode.contains.map(function (c) {
        return c.beginKeywords ? '\\.?(' + c.begin + ')\\.?' : c.begin;
      }).concat([mode.terminator_end, mode.illegal]).map(reStr).filter(Boolean);
      mode.terminators = terminators.length ? langRe(terminators.join('|'), true) : { exec: function () /*s*/{
          return null;
        } };
    }

    compileMode(language);
  }

  /*
  Core highlighting function. Accepts a language name, or an alias, and a
  string with the code to highlight. Returns an object with the following
  properties:
   - relevance (int)
  - value (an HTML string with highlighting markup)
   */
  function highlight(name, value, ignore_illegals, continuation) {

    function subMode(lexeme, mode) {
      var i, length;

      for (i = 0, length = mode.contains.length; i < length; i++) {
        if (testRe(mode.contains[i].beginRe, lexeme)) {
          return mode.contains[i];
        }
      }
    }

    function endOfMode(mode, lexeme) {
      if (testRe(mode.endRe, lexeme)) {
        while (mode.endsParent && mode.parent) {
          mode = mode.parent;
        }
        return mode;
      }
      if (mode.endsWithParent) {
        return endOfMode(mode.parent, lexeme);
      }
    }

    function isIllegal(lexeme, mode) {
      return !ignore_illegals && testRe(mode.illegalRe, lexeme);
    }

    function keywordMatch(mode, match) {
      var match_str = language.case_insensitive ? match[0].toLowerCase() : match[0];
      return mode.keywords.hasOwnProperty(match_str) && mode.keywords[match_str];
    }

    function buildSpan(classname, insideSpan, leaveOpen, noPrefix) {
      var classPrefix = noPrefix ? '' : options.classPrefix,
          openSpan = '<span class="' + classPrefix,
          closeSpan = leaveOpen ? '' : spanEndTag;

      openSpan += classname + '">';

      return openSpan + insideSpan + closeSpan;
    }

    function processKeywords() {
      var keyword_match, last_index, match, result;

      if (!top.keywords) return escape(mode_buffer);

      result = '';
      last_index = 0;
      top.lexemesRe.lastIndex = 0;
      match = top.lexemesRe.exec(mode_buffer);

      while (match) {
        result += escape(mode_buffer.substr(last_index, match.index - last_index));
        keyword_match = keywordMatch(top, match);
        if (keyword_match) {
          relevance += keyword_match[1];
          result += buildSpan(keyword_match[0], escape(match[0]));
        } else {
          result += escape(match[0]);
        }
        last_index = top.lexemesRe.lastIndex;
        match = top.lexemesRe.exec(mode_buffer);
      }
      return result + escape(mode_buffer.substr(last_index));
    }

    function processSubLanguage() {
      var explicit = typeof top.subLanguage === 'string';
      if (explicit && !languages[top.subLanguage]) {
        return escape(mode_buffer);
      }

      var result = explicit ? highlight(top.subLanguage, mode_buffer, true, continuations[top.subLanguage]) : highlightAuto(mode_buffer, top.subLanguage.length ? top.subLanguage : undefined);

      // Counting embedded language score towards the host language may be disabled
      // with zeroing the containing mode relevance. Usecase in point is Markdown that
      // allows XML everywhere and makes every XML snippet to have a much larger Markdown
      // score.
      if (top.relevance > 0) {
        relevance += result.relevance;
      }
      if (explicit) {
        continuations[top.subLanguage] = result.top;
      }
      return buildSpan(result.language, result.value, false, true);
    }

    function processBuffer() {
      result += top.subLanguage != null ? processSubLanguage() : processKeywords();
      mode_buffer = '';
    }

    function startNewMode(mode) {
      result += mode.className ? buildSpan(mode.className, '', true) : '';
      top = Object.create(mode, { parent: { value: top } });
    }

    function processLexeme(buffer, lexeme) {

      mode_buffer += buffer;

      if (lexeme == null) {
        processBuffer();
        return 0;
      }

      var new_mode = subMode(lexeme, top);
      if (new_mode) {
        if (new_mode.skip) {
          mode_buffer += lexeme;
        } else {
          if (new_mode.excludeBegin) {
            mode_buffer += lexeme;
          }
          processBuffer();
          if (!new_mode.returnBegin && !new_mode.excludeBegin) {
            mode_buffer = lexeme;
          }
        }
        startNewMode(new_mode, lexeme);
        return new_mode.returnBegin ? 0 : lexeme.length;
      }

      var end_mode = endOfMode(top, lexeme);
      if (end_mode) {
        var origin = top;
        if (origin.skip) {
          mode_buffer += lexeme;
        } else {
          if (!(origin.returnEnd || origin.excludeEnd)) {
            mode_buffer += lexeme;
          }
          processBuffer();
          if (origin.excludeEnd) {
            mode_buffer = lexeme;
          }
        }
        do {
          if (top.className) {
            result += spanEndTag;
          }
          if (!top.skip) {
            relevance += top.relevance;
          }
          top = top.parent;
        } while (top !== end_mode.parent);
        if (end_mode.starts) {
          startNewMode(end_mode.starts, '');
        }
        return origin.returnEnd ? 0 : lexeme.length;
      }

      if (isIllegal(lexeme, top)) throw new Error('Illegal lexeme "' + lexeme + '" for mode "' + (top.className || '<unnamed>') + '"');

      /*
      Parser should not reach this point as all types of lexemes should be caught
      earlier, but if it does due to some bug make sure it advances at least one
      character forward to prevent infinite looping.
      */
      mode_buffer += lexeme;
      return lexeme.length || 1;
    }

    var language = getLanguage(name);
    if (!language) {
      throw new Error('Unknown language: "' + name + '"');
    }

    compileLanguage(language);
    var top = continuation || language;
    var continuations = {}; // keep continuations for sub-languages
    var result = '',
        current;
    for (current = top; current !== language; current = current.parent) {
      if (current.className) {
        result = buildSpan(current.className, '', true) + result;
      }
    }
    var mode_buffer = '';
    var relevance = 0;
    try {
      var match,
          count,
          index = 0;
      while (true) {
        top.terminators.lastIndex = index;
        match = top.terminators.exec(value);
        if (!match) break;
        count = processLexeme(value.substr(index, match.index - index), match[0]);
        index = match.index + count;
      }
      processLexeme(value.substr(index));
      for (current = top; current.parent; current = current.parent) {
        // close dangling modes
        if (current.className) {
          result += spanEndTag;
        }
      }
      return {
        relevance: relevance,
        value: result,
        language: name,
        top: top
      };
    } catch (e) {
      if (e.message && e.message.indexOf('Illegal') !== -1) {
        return {
          relevance: 0,
          value: escape(value)
        };
      } else {
        throw e;
      }
    }
  }

  /*
  Highlighting with language detection. Accepts a string with the code to
  highlight. Returns an object with the following properties:
   - language (detected language)
  - relevance (int)
  - value (an HTML string with highlighting markup)
  - second_best (object with the same structure for second-best heuristically
    detected language, may be absent)
   */
  function highlightAuto(text, languageSubset) {
    languageSubset = languageSubset || options.languages || objectKeys(languages);
    var result = {
      relevance: 0,
      value: escape(text)
    };
    var second_best = result;
    languageSubset.filter(getLanguage).forEach(function (name) {
      var current = highlight(name, text, false);
      current.language = name;
      if (current.relevance > second_best.relevance) {
        second_best = current;
      }
      if (current.relevance > result.relevance) {
        second_best = result;
        result = current;
      }
    });
    if (second_best.language) {
      result.second_best = second_best;
    }
    return result;
  }

  /*
  Post-processing of the highlighted markup:
   - replace TABs with something more useful
  - replace real line-breaks with '<br>' for non-pre containers
   */
  function fixMarkup(value) {
    return !(options.tabReplace || options.useBR) ? value : value.replace(fixMarkupRe, function (match, p1) {
      if (options.useBR && match === '\n') {
        return '<br>';
      } else if (options.tabReplace) {
        return p1.replace(/\t/g, options.tabReplace);
      }
    });
  }

  function buildClassName(prevClassName, currentLang, resultLang) {
    var language = currentLang ? aliases[currentLang] : resultLang,
        result = [prevClassName.trim()];

    if (!prevClassName.match(/\bhljs\b/)) {
      result.push('hljs');
    }

    if (prevClassName.indexOf(language) === -1) {
      result.push(language);
    }

    return result.join(' ').trim();
  }

  /*
  Applies highlighting to a DOM node containing code. Accepts a DOM node and
  two optional parameters for fixMarkup.
  */
  function highlightBlock(block) {
    var node, originalStream, result, resultNode, text;
    var language = blockLanguage(block);

    if (isNotHighlighted(language)) return;

    if (options.useBR) {
      node = document.createElementNS('http://www.w3.org/1999/xhtml', 'div');
      node.innerHTML = block.innerHTML.replace(/\n/g, '').replace(/<br[ \/]*>/g, '\n');
    } else {
      node = block;
    }
    text = node.textContent;
    result = language ? highlight(language, text, true) : highlightAuto(text);

    originalStream = nodeStream(node);
    if (originalStream.length) {
      resultNode = document.createElementNS('http://www.w3.org/1999/xhtml', 'div');
      resultNode.innerHTML = result.value;
      result.value = mergeStreams(originalStream, nodeStream(resultNode), text);
    }
    result.value = fixMarkup(result.value);

    block.innerHTML = result.value;
    block.className = buildClassName(block.className, language, result.language);
    block.result = {
      language: result.language,
      re: result.relevance
    };
    if (result.second_best) {
      block.second_best = {
        language: result.second_best.language,
        re: result.second_best.relevance
      };
    }
  }

  /*
  Updates highlight.js global options with values passed in the form of an object.
  */
  function configure(user_options) {
    options = inherit(options, user_options);
  }

  /*
  Applies highlighting to all <pre><code>..</code></pre> blocks on a page.
  */
  function initHighlighting() {
    if (initHighlighting.called) return;
    initHighlighting.called = true;

    var blocks = document.querySelectorAll('pre code');
    ArrayProto.forEach.call(blocks, highlightBlock);
  }

  /*
  Attaches highlighting to the page load event.
  */
  function initHighlightingOnLoad() {
    addEventListener('DOMContentLoaded', initHighlighting, false);
    addEventListener('load', initHighlighting, false);
  }

  function registerLanguage(name, language) {
    var lang = languages[name] = language(hljs);
    if (lang.aliases) {
      lang.aliases.forEach(function (alias) {
        aliases[alias] = name;
      });
    }
  }

  function listLanguages() {
    return objectKeys(languages);
  }

  function getLanguage(name) {
    name = (name || '').toLowerCase();
    return languages[name] || languages[aliases[name]];
  }

  /* Interface definition */

  hljs.highlight = highlight;
  hljs.highlightAuto = highlightAuto;
  hljs.fixMarkup = fixMarkup;
  hljs.highlightBlock = highlightBlock;
  hljs.configure = configure;
  hljs.initHighlighting = initHighlighting;
  hljs.initHighlightingOnLoad = initHighlightingOnLoad;
  hljs.registerLanguage = registerLanguage;
  hljs.listLanguages = listLanguages;
  hljs.getLanguage = getLanguage;
  hljs.inherit = inherit;

  // Common regexps
  hljs.IDENT_RE = '[a-zA-Z]\\w*';
  hljs.UNDERSCORE_IDENT_RE = '[a-zA-Z_]\\w*';
  hljs.NUMBER_RE = '\\b\\d+(\\.\\d+)?';
  hljs.C_NUMBER_RE = '(-?)(\\b0[xX][a-fA-F0-9]+|(\\b\\d+(\\.\\d*)?|\\.\\d+)([eE][-+]?\\d+)?)'; // 0x..., 0..., decimal, float
  hljs.BINARY_NUMBER_RE = '\\b(0b[01]+)'; // 0b...
  hljs.RE_STARTERS_RE = '!|!=|!==|%|%=|&|&&|&=|\\*|\\*=|\\+|\\+=|,|-|-=|/=|/|:|;|<<|<<=|<=|<|===|==|=|>>>=|>>=|>=|>>>|>>|>|\\?|\\[|\\{|\\(|\\^|\\^=|\\||\\|=|\\|\\||~';

  // Common modes
  hljs.BACKSLASH_ESCAPE = {
    begin: '\\\\[\\s\\S]', relevance: 0
  };
  hljs.APOS_STRING_MODE = {
    className: 'string',
    begin: '\'', end: '\'',
    illegal: '\\n',
    contains: [hljs.BACKSLASH_ESCAPE]
  };
  hljs.QUOTE_STRING_MODE = {
    className: 'string',
    begin: '"', end: '"',
    illegal: '\\n',
    contains: [hljs.BACKSLASH_ESCAPE]
  };
  hljs.PHRASAL_WORDS_MODE = {
    begin: /\b(a|an|the|are|I'm|isn't|don't|doesn't|won't|but|just|should|pretty|simply|enough|gonna|going|wtf|so|such|will|you|your|like)\b/
  };
  hljs.COMMENT = function (begin, end, inherits) {
    var mode = hljs.inherit({
      className: 'comment',
      begin: begin, end: end,
      contains: []
    }, inherits || {});
    mode.contains.push(hljs.PHRASAL_WORDS_MODE);
    mode.contains.push({
      className: 'doctag',
      begin: '(?:TODO|FIXME|NOTE|BUG|XXX):',
      relevance: 0
    });
    return mode;
  };
  hljs.C_LINE_COMMENT_MODE = hljs.COMMENT('//', '$');
  hljs.C_BLOCK_COMMENT_MODE = hljs.COMMENT('/\\*', '\\*/');
  hljs.HASH_COMMENT_MODE = hljs.COMMENT('#', '$');
  hljs.NUMBER_MODE = {
    className: 'number',
    begin: hljs.NUMBER_RE,
    relevance: 0
  };
  hljs.C_NUMBER_MODE = {
    className: 'number',
    begin: hljs.C_NUMBER_RE,
    relevance: 0
  };
  hljs.BINARY_NUMBER_MODE = {
    className: 'number',
    begin: hljs.BINARY_NUMBER_RE,
    relevance: 0
  };
  hljs.CSS_NUMBER_MODE = {
    className: 'number',
    begin: hljs.NUMBER_RE + '(' + '%|em|ex|ch|rem' + '|vw|vh|vmin|vmax' + '|cm|mm|in|pt|pc|px' + '|deg|grad|rad|turn' + '|s|ms' + '|Hz|kHz' + '|dpi|dpcm|dppx' + ')?',
    relevance: 0
  };
  hljs.REGEXP_MODE = {
    className: 'regexp',
    begin: /\//, end: /\/[gimuy]*/,
    illegal: /\n/,
    contains: [hljs.BACKSLASH_ESCAPE, {
      begin: /\[/, end: /\]/,
      relevance: 0,
      contains: [hljs.BACKSLASH_ESCAPE]
    }]
  };
  hljs.TITLE_MODE = {
    className: 'title',
    begin: hljs.IDENT_RE,
    relevance: 0
  };
  hljs.UNDERSCORE_TITLE_MODE = {
    className: 'title',
    begin: hljs.UNDERSCORE_IDENT_RE,
    relevance: 0
  };
  hljs.METHOD_GUARD = {
    // excludes method names from keyword processing
    begin: '\\.\\s*' + hljs.UNDERSCORE_IDENT_RE,
    relevance: 0
  };

  hljs.registerLanguage('cpp', function (hljs) {
    var CPP_PRIMITIVE_TYPES = {
      className: 'keyword',
      begin: '\\b[a-z\\d_]*_t\\b'
    };

    var STRINGS = {
      className: 'string',
      variants: [{
        begin: '(u8?|U)?L?"', end: '"',
        illegal: '\\n',
        contains: [hljs.BACKSLASH_ESCAPE]
      }, {
        begin: '(u8?|U)?R"', end: '"',
        contains: [hljs.BACKSLASH_ESCAPE]
      }, {
        begin: '\'\\\\?.', end: '\'',
        illegal: '.'
      }]
    };

    var NUMBERS = {
      className: 'number',
      variants: [{ begin: '\\b(0b[01\'_]+)' }, { begin: '\\b([\\d\'_]+(\\.[\\d\'_]*)?|\\.[\\d\'_]+)(u|U|l|L|ul|UL|f|F|b|B)' }, { begin: '(-?)(\\b0[xX][a-fA-F0-9\'_]+|(\\b[\\d\'_]+(\\.[\\d\'_]*)?|\\.[\\d\'_]+)([eE][-+]?[\\d\'_]+)?)' }],
      relevance: 0
    };

    var PREPROCESSOR = {
      className: 'meta',
      begin: /#\s*[a-z]+\b/, end: /$/,
      keywords: {
        'meta-keyword': 'if else elif endif define undef warning error line ' + 'pragma ifdef ifndef include'
      },
      contains: [{
        begin: /\\\n/, relevance: 0
      }, hljs.inherit(STRINGS, { className: 'meta-string' }), {
        className: 'meta-string',
        begin: '<', end: '>',
        illegal: '\\n'
      }, hljs.C_LINE_COMMENT_MODE, hljs.C_BLOCK_COMMENT_MODE]
    };

    var FUNCTION_TITLE = hljs.IDENT_RE + '\\s*\\(';

    var CPP_KEYWORDS = {
      keyword: 'int float while private char catch import module export virtual operator sizeof ' + 'dynamic_cast|10 typedef const_cast|10 const struct for static_cast|10 union namespace ' + 'unsigned long volatile static protected bool template mutable if public friend ' + 'do goto auto void enum else break extern using class asm case typeid ' + 'short reinterpret_cast|10 default double register explicit signed typename try this ' + 'switch continue inline delete alignof constexpr decltype ' + 'noexcept static_assert thread_local restrict _Bool complex _Complex _Imaginary ' + 'atomic_bool atomic_char atomic_schar ' + 'atomic_uchar atomic_short atomic_ushort atomic_int atomic_uint atomic_long atomic_ulong atomic_llong ' + 'atomic_ullong new throw return',
      built_in: 'std string cin cout cerr clog stdin stdout stderr stringstream istringstream ostringstream ' + 'auto_ptr deque list queue stack vector map set bitset multiset multimap unordered_set ' + 'unordered_map unordered_multiset unordered_multimap array shared_ptr abort abs acos ' + 'asin atan2 atan calloc ceil cosh cos exit exp fabs floor fmod fprintf fputs free frexp ' + 'fscanf isalnum isalpha iscntrl isdigit isgraph islower isprint ispunct isspace isupper ' + 'isxdigit tolower toupper labs ldexp log10 log malloc realloc memchr memcmp memcpy memset modf pow ' + 'printf putchar puts scanf sinh sin snprintf sprintf sqrt sscanf strcat strchr strcmp ' + 'strcpy strcspn strlen strncat strncmp strncpy strpbrk strrchr strspn strstr tanh tan ' + 'vfprintf vprintf vsprintf endl initializer_list unique_ptr',
      literal: 'true false nullptr NULL'
    };

    var EXPRESSION_CONTAINS = [CPP_PRIMITIVE_TYPES, hljs.C_LINE_COMMENT_MODE, hljs.C_BLOCK_COMMENT_MODE, NUMBERS, STRINGS];

    return {
      aliases: ['c', 'cc', 'h', 'c++', 'h++', 'hpp'],
      keywords: CPP_KEYWORDS,
      illegal: '</',
      contains: EXPRESSION_CONTAINS.concat([PREPROCESSOR, {
        begin: '\\b(deque|list|queue|stack|vector|map|set|bitset|multiset|multimap|unordered_map|unordered_set|unordered_multiset|unordered_multimap|array)\\s*<', end: '>',
        keywords: CPP_KEYWORDS,
        contains: ['self', CPP_PRIMITIVE_TYPES]
      }, {
        begin: hljs.IDENT_RE + '::',
        keywords: CPP_KEYWORDS
      }, {
        // This mode covers expression context where we can't expect a function
        // definition and shouldn't highlight anything that looks like one:
        // `return some()`, `else if()`, `(x*sum(1, 2))`
        variants: [{ begin: /=/, end: /;/ }, { begin: /\(/, end: /\)/ }, { beginKeywords: 'new throw return else', end: /;/ }],
        keywords: CPP_KEYWORDS,
        contains: EXPRESSION_CONTAINS.concat([{
          begin: /\(/, end: /\)/,
          keywords: CPP_KEYWORDS,
          contains: EXPRESSION_CONTAINS.concat(['self']),
          relevance: 0
        }]),
        relevance: 0
      }, {
        className: 'function',
        begin: '(' + hljs.IDENT_RE + '[\\*&\\s]+)+' + FUNCTION_TITLE,
        returnBegin: true, end: /[{;=]/,
        excludeEnd: true,
        keywords: CPP_KEYWORDS,
        illegal: /[^\w\s\*&]/,
        contains: [{
          begin: FUNCTION_TITLE, returnBegin: true,
          contains: [hljs.TITLE_MODE],
          relevance: 0
        }, {
          className: 'params',
          begin: /\(/, end: /\)/,
          keywords: CPP_KEYWORDS,
          relevance: 0,
          contains: [hljs.C_LINE_COMMENT_MODE, hljs.C_BLOCK_COMMENT_MODE, STRINGS, NUMBERS, CPP_PRIMITIVE_TYPES]
        }, hljs.C_LINE_COMMENT_MODE, hljs.C_BLOCK_COMMENT_MODE, PREPROCESSOR]
      }]),
      exports: {
        preprocessor: PREPROCESSOR,
        strings: STRINGS,
        keywords: CPP_KEYWORDS
      }
    };
  });

  hljs.registerLanguage('cs', function (hljs) {
    var KEYWORDS = {
      keyword:
      // Normal keywords.
      'abstract as base bool break byte case catch char checked const continue decimal dynamic ' + 'default delegate do double else enum event explicit extern finally fixed float ' + 'for foreach goto if implicit in int interface internal is lock long when ' + 'object operator out override params private protected public readonly ref sbyte ' + 'sealed short sizeof stackalloc static string struct switch this try typeof ' + 'uint ulong unchecked unsafe ushort using virtual volatile void while async ' + 'nameof ' +
      // Contextual keywords.
      'ascending descending from get group into join let orderby partial select set value var ' + 'where yield',
      literal: 'null false true'
    };

    var VERBATIM_STRING = {
      className: 'string',
      begin: '@"', end: '"',
      contains: [{ begin: '""' }]
    };
    var VERBATIM_STRING_NO_LF = hljs.inherit(VERBATIM_STRING, { illegal: /\n/ });
    var SUBST = {
      className: 'subst',
      begin: '{', end: '}',
      keywords: KEYWORDS
    };
    var SUBST_NO_LF = hljs.inherit(SUBST, { illegal: /\n/ });
    var INTERPOLATED_STRING = {
      className: 'string',
      begin: /\$"/, end: '"',
      illegal: /\n/,
      contains: [{ begin: '{{' }, { begin: '}}' }, hljs.BACKSLASH_ESCAPE, SUBST_NO_LF]
    };
    var INTERPOLATED_VERBATIM_STRING = {
      className: 'string',
      begin: /\$@"/, end: '"',
      contains: [{ begin: '{{' }, { begin: '}}' }, { begin: '""' }, SUBST]
    };
    var INTERPOLATED_VERBATIM_STRING_NO_LF = hljs.inherit(INTERPOLATED_VERBATIM_STRING, {
      illegal: /\n/,
      contains: [{ begin: '{{' }, { begin: '}}' }, { begin: '""' }, SUBST_NO_LF]
    });
    SUBST.contains = [INTERPOLATED_VERBATIM_STRING, INTERPOLATED_STRING, VERBATIM_STRING, hljs.APOS_STRING_MODE, hljs.QUOTE_STRING_MODE, hljs.C_NUMBER_MODE, hljs.C_BLOCK_COMMENT_MODE];
    SUBST_NO_LF.contains = [INTERPOLATED_VERBATIM_STRING_NO_LF, INTERPOLATED_STRING, VERBATIM_STRING_NO_LF, hljs.APOS_STRING_MODE, hljs.QUOTE_STRING_MODE, hljs.C_NUMBER_MODE, hljs.inherit(hljs.C_BLOCK_COMMENT_MODE, { illegal: /\n/ })];
    var STRING = {
      variants: [INTERPOLATED_VERBATIM_STRING, INTERPOLATED_STRING, VERBATIM_STRING, hljs.APOS_STRING_MODE, hljs.QUOTE_STRING_MODE]
    };

    var TYPE_IDENT_RE = hljs.IDENT_RE + '(<' + hljs.IDENT_RE + '>)?(\\[\\])?';
    return {
      aliases: ['csharp'],
      keywords: KEYWORDS,
      illegal: /::/,
      contains: [hljs.COMMENT('///', '$', {
        returnBegin: true,
        contains: [{
          className: 'doctag',
          variants: [{
            begin: '///', relevance: 0
          }, {
            begin: '<!--|-->'
          }, {
            begin: '</?', end: '>'
          }]
        }]
      }), hljs.C_LINE_COMMENT_MODE, hljs.C_BLOCK_COMMENT_MODE, {
        className: 'meta',
        begin: '#', end: '$',
        keywords: { 'meta-keyword': 'if else elif endif define undef warning error line region endregion pragma checksum' }
      }, STRING, hljs.C_NUMBER_MODE, {
        beginKeywords: 'class interface', end: /[{;=]/,
        illegal: /[^\s:]/,
        contains: [hljs.TITLE_MODE, hljs.C_LINE_COMMENT_MODE, hljs.C_BLOCK_COMMENT_MODE]
      }, {
        beginKeywords: 'namespace', end: /[{;=]/,
        illegal: /[^\s:]/,
        contains: [hljs.inherit(hljs.TITLE_MODE, { begin: '[a-zA-Z](\\.?\\w)*' }), hljs.C_LINE_COMMENT_MODE, hljs.C_BLOCK_COMMENT_MODE]
      }, {
        // Expression keywords prevent 'keyword Name(...)' from being
        // recognized as a function definition
        beginKeywords: 'new return throw await',
        relevance: 0
      }, {
        className: 'function',
        begin: '(' + TYPE_IDENT_RE + '\\s+)+' + hljs.IDENT_RE + '\\s*\\(', returnBegin: true, end: /[{;=]/,
        excludeEnd: true,
        keywords: KEYWORDS,
        contains: [{
          begin: hljs.IDENT_RE + '\\s*\\(', returnBegin: true,
          contains: [hljs.TITLE_MODE],
          relevance: 0
        }, {
          className: 'params',
          begin: /\(/, end: /\)/,
          excludeBegin: true,
          excludeEnd: true,
          keywords: KEYWORDS,
          relevance: 0,
          contains: [STRING, hljs.C_NUMBER_MODE, hljs.C_BLOCK_COMMENT_MODE]
        }, hljs.C_LINE_COMMENT_MODE, hljs.C_BLOCK_COMMENT_MODE]
      }]
    };
  });

  hljs.registerLanguage('go', function (hljs) {
    var GO_KEYWORDS = {
      keyword: 'break default func interface select case map struct chan else goto package switch ' + 'const fallthrough if range type continue for import return var go defer ' + 'bool byte complex64 complex128 float32 float64 int8 int16 int32 int64 string uint8 ' + 'uint16 uint32 uint64 int uint uintptr rune',
      literal: 'true false iota nil',
      built_in: 'append cap close complex copy imag len make new panic print println real recover delete'
    };
    return {
      aliases: ['golang'],
      keywords: GO_KEYWORDS,
      illegal: '</',
      contains: [hljs.C_LINE_COMMENT_MODE, hljs.C_BLOCK_COMMENT_MODE, {
        className: 'string',
        variants: [hljs.QUOTE_STRING_MODE, { begin: '\'', end: '[^\\\\]\'' }, { begin: '`', end: '`' }]
      }, {
        className: 'number',
        variants: [{ begin: hljs.C_NUMBER_RE + '[dflsi]', relevance: 1 }, hljs.C_NUMBER_MODE]
      }, {
        begin: /:=/ // relevance booster
      }, {
        className: 'function',
        beginKeywords: 'func', end: /\s*\{/, excludeEnd: true,
        contains: [hljs.TITLE_MODE, {
          className: 'params',
          begin: /\(/, end: /\)/,
          keywords: GO_KEYWORDS,
          illegal: /["']/
        }]
      }]
    };
  });

  hljs.registerLanguage('gradle', function (hljs) {
    return {
      case_insensitive: true,
      keywords: {
        keyword: 'task project allprojects subprojects artifacts buildscript configurations ' + 'dependencies repositories sourceSets description delete from into include ' + 'exclude source classpath destinationDir includes options sourceCompatibility ' + 'targetCompatibility group flatDir doLast doFirst flatten todir fromdir ant ' + 'def abstract break case catch continue default do else extends final finally ' + 'for if implements instanceof native new private protected public return static ' + 'switch synchronized throw throws transient try volatile while strictfp package ' + 'import false null super this true antlrtask checkstyle codenarc copy boolean ' + 'byte char class double float int interface long short void compile runTime ' + 'file fileTree abs any append asList asWritable call collect compareTo count ' + 'div dump each eachByte eachFile eachLine every find findAll flatten getAt ' + 'getErr getIn getOut getText grep immutable inject inspect intersect invokeMethods ' + 'isCase join leftShift minus multiply newInputStream newOutputStream newPrintWriter ' + 'newReader newWriter next plus pop power previous print println push putAt read ' + 'readBytes readLines reverse reverseEach round size sort splitEachLine step subMap ' + 'times toInteger toList tokenize upto waitForOrKill withPrintWriter withReader ' + 'withStream withWriter withWriterAppend write writeLine'
      },
      contains: [hljs.C_LINE_COMMENT_MODE, hljs.C_BLOCK_COMMENT_MODE, hljs.APOS_STRING_MODE, hljs.QUOTE_STRING_MODE, hljs.NUMBER_MODE, hljs.REGEXP_MODE]
    };
  });

  hljs.registerLanguage('http', function (hljs) {
    var VERSION = 'HTTP/[0-9\\.]+';
    return {
      aliases: ['https'],
      illegal: '\\S',
      contains: [{
        begin: '^' + VERSION, end: '$',
        contains: [{ className: 'number', begin: '\\b\\d{3}\\b' }]
      }, {
        begin: '^[A-Z]+ (.*?) ' + VERSION + '$', returnBegin: true, end: '$',
        contains: [{
          className: 'string',
          begin: ' ', end: ' ',
          excludeBegin: true, excludeEnd: true
        }, {
          begin: VERSION
        }, {
          className: 'keyword',
          begin: '[A-Z]+'
        }]
      }, {
        className: 'attribute',
        begin: '^\\w', end: ': ', excludeEnd: true,
        illegal: '\\n|\\s|=',
        starts: { end: '$', relevance: 0 }
      }, {
        begin: '\\n\\n',
        starts: { subLanguage: [], endsWithParent: true }
      }]
    };
  });

  hljs.registerLanguage('java', function (hljs) {
    var GENERIC_IDENT_RE = hljs.UNDERSCORE_IDENT_RE + '(<' + hljs.UNDERSCORE_IDENT_RE + '(\\s*,\\s*' + hljs.UNDERSCORE_IDENT_RE + ')*>)?';
    var KEYWORDS = 'false synchronized int abstract float private char boolean static null if const ' + 'for true while long strictfp finally protected import native final void ' + 'enum else break transient catch instanceof byte super volatile case assert short ' + 'package default double public try this switch continue throws protected public private ' + 'module requires exports';

    // https://docs.oracle.com/javase/7/docs/technotes/guides/language/underscores-literals.html
    var JAVA_NUMBER_RE = '\\b' + '(' + '0[bB]([01]+[01_]+[01]+|[01]+)' + // 0b...
    '|' + '0[xX]([a-fA-F0-9]+[a-fA-F0-9_]+[a-fA-F0-9]+|[a-fA-F0-9]+)' + // 0x...
    '|' + '(' + '([\\d]+[\\d_]+[\\d]+|[\\d]+)(\\.([\\d]+[\\d_]+[\\d]+|[\\d]+))?' + '|' + '\\.([\\d]+[\\d_]+[\\d]+|[\\d]+)' + ')' + '([eE][-+]?\\d+)?' + // octal, decimal, float
    ')' + '[lLfF]?';
    var JAVA_NUMBER_MODE = {
      className: 'number',
      begin: JAVA_NUMBER_RE,
      relevance: 0
    };

    return {
      aliases: ['jsp'],
      keywords: KEYWORDS,
      illegal: /<\/|#/,
      contains: [hljs.COMMENT('/\\*\\*', '\\*/', {
        relevance: 0,
        contains: [{
          // eat up @'s in emails to prevent them to be recognized as doctags
          begin: /\w+@/, relevance: 0
        }, {
          className: 'doctag',
          begin: '@[A-Za-z]+'
        }]
      }), hljs.C_LINE_COMMENT_MODE, hljs.C_BLOCK_COMMENT_MODE, hljs.APOS_STRING_MODE, hljs.QUOTE_STRING_MODE, {
        className: 'class',
        beginKeywords: 'class interface', end: /[{;=]/, excludeEnd: true,
        keywords: 'class interface',
        illegal: /[:"\[\]]/,
        contains: [{ beginKeywords: 'extends implements' }, hljs.UNDERSCORE_TITLE_MODE]
      }, {
        // Expression keywords prevent 'keyword Name(...)' from being
        // recognized as a function definition
        beginKeywords: 'new throw return else',
        relevance: 0
      }, {
        className: 'function',
        begin: '(' + GENERIC_IDENT_RE + '\\s+)+' + hljs.UNDERSCORE_IDENT_RE + '\\s*\\(', returnBegin: true, end: /[{;=]/,
        excludeEnd: true,
        keywords: KEYWORDS,
        contains: [{
          begin: hljs.UNDERSCORE_IDENT_RE + '\\s*\\(', returnBegin: true,
          relevance: 0,
          contains: [hljs.UNDERSCORE_TITLE_MODE]
        }, {
          className: 'params',
          begin: /\(/, end: /\)/,
          keywords: KEYWORDS,
          relevance: 0,
          contains: [hljs.APOS_STRING_MODE, hljs.QUOTE_STRING_MODE, hljs.C_NUMBER_MODE, hljs.C_BLOCK_COMMENT_MODE]
        }, hljs.C_LINE_COMMENT_MODE, hljs.C_BLOCK_COMMENT_MODE]
      }, JAVA_NUMBER_MODE, {
        className: 'meta', begin: '@[A-Za-z]+'
      }]
    };
  });

  hljs.registerLanguage('javascript', function (hljs) {
    return {
      aliases: ['js', 'jsx'],
      keywords: {
        keyword: 'in of if for while finally var new function do return void else break catch ' + 'instanceof with throw case default try this switch continue typeof delete ' + 'let yield const export super debugger as async await static ' +
        // ECMAScript 6 modules import
        'import from as',

        literal: 'true false null undefined NaN Infinity',
        built_in: 'eval isFinite isNaN parseFloat parseInt decodeURI decodeURIComponent ' + 'encodeURI encodeURIComponent escape unescape Object Function Boolean Error ' + 'EvalError InternalError RangeError ReferenceError StopIteration SyntaxError ' + 'TypeError URIError Number Math Date String RegExp Array Float32Array ' + 'Float64Array Int16Array Int32Array Int8Array Uint16Array Uint32Array ' + 'Uint8Array Uint8ClampedArray ArrayBuffer DataView JSON Intl arguments require ' + 'module console window document Symbol Set Map WeakSet WeakMap Proxy Reflect ' + 'Promise'
      },
      contains: [{
        className: 'meta',
        relevance: 10,
        begin: /^\s*['"]use (strict|asm)['"]/
      }, {
        className: 'meta',
        begin: /^#!/, end: /$/
      }, hljs.APOS_STRING_MODE, hljs.QUOTE_STRING_MODE, { // template string
        className: 'string',
        begin: '`', end: '`',
        contains: [hljs.BACKSLASH_ESCAPE, {
          className: 'subst',
          begin: '\\$\\{', end: '\\}'
        }]
      }, hljs.C_LINE_COMMENT_MODE, hljs.C_BLOCK_COMMENT_MODE, {
        className: 'number',
        variants: [{ begin: '\\b(0[bB][01]+)' }, { begin: '\\b(0[oO][0-7]+)' }, { begin: hljs.C_NUMBER_RE }],
        relevance: 0
      }, { // "value" container
        begin: '(' + hljs.RE_STARTERS_RE + '|\\b(case|return|throw)\\b)\\s*',
        keywords: 'return throw case',
        contains: [hljs.C_LINE_COMMENT_MODE, hljs.C_BLOCK_COMMENT_MODE, hljs.REGEXP_MODE, { // E4X / JSX
          begin: /</, end: /(\/\w+|\w+\/)>/,
          subLanguage: 'xml',
          contains: [{ begin: /<\w+\s*\/>/, skip: true }, { begin: /<\w+/, end: /(\/\w+|\w+\/)>/, skip: true, contains: ['self'] }]
        }],
        relevance: 0
      }, {
        className: 'function',
        beginKeywords: 'function', end: /\{/, excludeEnd: true,
        contains: [hljs.inherit(hljs.TITLE_MODE, { begin: /[A-Za-z$_][0-9A-Za-z$_]*/ }), {
          className: 'params',
          begin: /\(/, end: /\)/,
          excludeBegin: true,
          excludeEnd: true,
          contains: [hljs.C_LINE_COMMENT_MODE, hljs.C_BLOCK_COMMENT_MODE]
        }],
        illegal: /\[|%/
      }, {
        begin: /\$[(.]/ // relevance booster for a pattern common to JS libs: `$(something)` and `$.something`
      }, hljs.METHOD_GUARD, { // ES6 class
        className: 'class',
        beginKeywords: 'class', end: /[{;=]/, excludeEnd: true,
        illegal: /[:"\[\]]/,
        contains: [{ beginKeywords: 'extends' }, hljs.UNDERSCORE_TITLE_MODE]
      }, {
        beginKeywords: 'constructor', end: /\{/, excludeEnd: true
      }],
      illegal: /#(?!!)/
    };
  });

  hljs.registerLanguage('json', function (hljs) {
    var LITERALS = { literal: 'true false null' };
    var TYPES = [hljs.QUOTE_STRING_MODE, hljs.C_NUMBER_MODE];
    var VALUE_CONTAINER = {
      end: ',', endsWithParent: true, excludeEnd: true,
      contains: TYPES,
      keywords: LITERALS
    };
    var OBJECT = {
      begin: '{', end: '}',
      contains: [{
        className: 'attr',
        begin: /"/, end: /"/,
        contains: [hljs.BACKSLASH_ESCAPE],
        illegal: '\\n'
      }, hljs.inherit(VALUE_CONTAINER, { begin: /:/ })],
      illegal: '\\S'
    };
    var ARRAY = {
      begin: '\\[', end: '\\]',
      contains: [hljs.inherit(VALUE_CONTAINER)], // inherit is a workaround for a bug that makes shared modes with endsWithParent compile only the ending of one of the parents
      illegal: '\\S'
    };
    TYPES.splice(TYPES.length, 0, OBJECT, ARRAY);
    return {
      contains: TYPES,
      keywords: LITERALS,
      illegal: '\\S'
    };
  });

  hljs.registerLanguage('objectivec', function (hljs) {
    var API_CLASS = {
      className: 'built_in',
      begin: '\\b(AV|CA|CF|CG|CI|CL|CM|CN|CT|MK|MP|MTK|MTL|NS|SCN|SK|UI|WK|XC)\\w+'
    };
    var OBJC_KEYWORDS = {
      keyword: 'int float while char export sizeof typedef const struct for union ' + 'unsigned long volatile static bool mutable if do return goto void ' + 'enum else break extern asm case short default double register explicit ' + 'signed typename this switch continue wchar_t inline readonly assign ' + 'readwrite self @synchronized id typeof ' + 'nonatomic super unichar IBOutlet IBAction strong weak copy ' + 'in out inout bycopy byref oneway __strong __weak __block __autoreleasing ' + '@private @protected @public @try @property @end @throw @catch @finally ' + '@autoreleasepool @synthesize @dynamic @selector @optional @required ' + '@encode @package @import @defs @compatibility_alias ' + '__bridge __bridge_transfer __bridge_retained __bridge_retain ' + '__covariant __contravariant __kindof ' + '_Nonnull _Nullable _Null_unspecified ' + '__FUNCTION__ __PRETTY_FUNCTION__ __attribute__ ' + 'getter setter retain unsafe_unretained ' + 'nonnull nullable null_unspecified null_resettable class instancetype ' + 'NS_DESIGNATED_INITIALIZER NS_UNAVAILABLE NS_REQUIRES_SUPER ' + 'NS_RETURNS_INNER_POINTER NS_INLINE NS_AVAILABLE NS_DEPRECATED ' + 'NS_ENUM NS_OPTIONS NS_SWIFT_UNAVAILABLE ' + 'NS_ASSUME_NONNULL_BEGIN NS_ASSUME_NONNULL_END ' + 'NS_REFINED_FOR_SWIFT NS_SWIFT_NAME NS_SWIFT_NOTHROW ' + 'NS_DURING NS_HANDLER NS_ENDHANDLER NS_VALUERETURN NS_VOIDRETURN',
      literal: 'false true FALSE TRUE nil YES NO NULL',
      built_in: 'BOOL dispatch_once_t dispatch_queue_t dispatch_sync dispatch_async dispatch_once'
    };
    var LEXEMES = /[a-zA-Z@][a-zA-Z0-9_]*/;
    var CLASS_KEYWORDS = '@interface @class @protocol @implementation';
    return {
      aliases: ['mm', 'objc', 'obj-c'],
      keywords: OBJC_KEYWORDS,
      lexemes: LEXEMES,
      illegal: '</',
      contains: [API_CLASS, hljs.C_LINE_COMMENT_MODE, hljs.C_BLOCK_COMMENT_MODE, hljs.C_NUMBER_MODE, hljs.QUOTE_STRING_MODE, {
        className: 'string',
        variants: [{
          begin: '@"', end: '"',
          illegal: '\\n',
          contains: [hljs.BACKSLASH_ESCAPE]
        }, {
          begin: '\'', end: '[^\\\\]\'',
          illegal: '[^\\\\][^\']'
        }]
      }, {
        className: 'meta',
        begin: '#',
        end: '$',
        contains: [{
          className: 'meta-string',
          variants: [{ begin: '\"', end: '\"' }, { begin: '<', end: '>' }]
        }]
      }, {
        className: 'class',
        begin: '(' + CLASS_KEYWORDS.split(' ').join('|') + ')\\b', end: '({|$)', excludeEnd: true,
        keywords: CLASS_KEYWORDS, lexemes: LEXEMES,
        contains: [hljs.UNDERSCORE_TITLE_MODE]
      }, {
        begin: '\\.' + hljs.UNDERSCORE_IDENT_RE,
        relevance: 0
      }]
    };
  });

  hljs.registerLanguage('perl', function (hljs) {
    var PERL_KEYWORDS = 'getpwent getservent quotemeta msgrcv scalar kill dbmclose undef lc ' + 'ma syswrite tr send umask sysopen shmwrite vec qx utime local oct semctl localtime ' + 'readpipe do return format read sprintf dbmopen pop getpgrp not getpwnam rewinddir qq' + 'fileno qw endprotoent wait sethostent bless s|0 opendir continue each sleep endgrent ' + 'shutdown dump chomp connect getsockname die socketpair close flock exists index shmget' + 'sub for endpwent redo lstat msgctl setpgrp abs exit select print ref gethostbyaddr ' + 'unshift fcntl syscall goto getnetbyaddr join gmtime symlink semget splice x|0 ' + 'getpeername recv log setsockopt cos last reverse gethostbyname getgrnam study formline ' + 'endhostent times chop length gethostent getnetent pack getprotoent getservbyname rand ' + 'mkdir pos chmod y|0 substr endnetent printf next open msgsnd readdir use unlink ' + 'getsockopt getpriority rindex wantarray hex system getservbyport endservent int chr ' + 'untie rmdir prototype tell listen fork shmread ucfirst setprotoent else sysseek link ' + 'getgrgid shmctl waitpid unpack getnetbyname reset chdir grep split require caller ' + 'lcfirst until warn while values shift telldir getpwuid my getprotobynumber delete and ' + 'sort uc defined srand accept package seekdir getprotobyname semop our rename seek if q|0 ' + 'chroot sysread setpwent no crypt getc chown sqrt write setnetent setpriority foreach ' + 'tie sin msgget map stat getlogin unless elsif truncate exec keys glob tied closedir' + 'ioctl socket readlink eval xor readline binmode setservent eof ord bind alarm pipe ' + 'atan2 getgrent exp time push setgrent gt lt or ne m|0 break given say state when';
    var SUBST = {
      className: 'subst',
      begin: '[$@]\\{', end: '\\}',
      keywords: PERL_KEYWORDS
    };
    var METHOD = {
      begin: '->{', end: '}'
      // contains defined later
    };
    var VAR = {
      variants: [{ begin: /\$\d/ }, { begin: /[\$%@](\^\w\b|#\w+(::\w+)*|{\w+}|\w+(::\w*)*)/ }, { begin: /[\$%@][^\s\w{]/, relevance: 0 }]
    };
    var STRING_CONTAINS = [hljs.BACKSLASH_ESCAPE, SUBST, VAR];
    var PERL_DEFAULT_CONTAINS = [VAR, hljs.HASH_COMMENT_MODE, hljs.COMMENT('^\\=\\w', '\\=cut', {
      endsWithParent: true
    }), METHOD, {
      className: 'string',
      contains: STRING_CONTAINS,
      variants: [{
        begin: 'q[qwxr]?\\s*\\(', end: '\\)',
        relevance: 5
      }, {
        begin: 'q[qwxr]?\\s*\\[', end: '\\]',
        relevance: 5
      }, {
        begin: 'q[qwxr]?\\s*\\{', end: '\\}',
        relevance: 5
      }, {
        begin: 'q[qwxr]?\\s*\\|', end: '\\|',
        relevance: 5
      }, {
        begin: 'q[qwxr]?\\s*\\<', end: '\\>',
        relevance: 5
      }, {
        begin: 'qw\\s+q', end: 'q',
        relevance: 5
      }, {
        begin: '\'', end: '\'',
        contains: [hljs.BACKSLASH_ESCAPE]
      }, {
        begin: '"', end: '"'
      }, {
        begin: '`', end: '`',
        contains: [hljs.BACKSLASH_ESCAPE]
      }, {
        begin: '{\\w+}',
        contains: [],
        relevance: 0
      }, {
        begin: '\-?\\w+\\s*\\=\\>',
        contains: [],
        relevance: 0
      }]
    }, {
      className: 'number',
      begin: '(\\b0[0-7_]+)|(\\b0x[0-9a-fA-F_]+)|(\\b[1-9][0-9_]*(\\.[0-9_]+)?)|[0_]\\b',
      relevance: 0
    }, { // regexp container
      begin: '(\\/\\/|' + hljs.RE_STARTERS_RE + '|\\b(split|return|print|reverse|grep)\\b)\\s*',
      keywords: 'split return print reverse grep',
      relevance: 0,
      contains: [hljs.HASH_COMMENT_MODE, {
        className: 'regexp',
        begin: '(s|tr|y)/(\\\\.|[^/])*/(\\\\.|[^/])*/[a-z]*',
        relevance: 10
      }, {
        className: 'regexp',
        begin: '(m|qr)?/', end: '/[a-z]*',
        contains: [hljs.BACKSLASH_ESCAPE],
        relevance: 0 // allows empty "//" which is a common comment delimiter in other languages
      }]
    }, {
      className: 'function',
      beginKeywords: 'sub', end: '(\\s*\\(.*?\\))?[;{]', excludeEnd: true,
      relevance: 5,
      contains: [hljs.TITLE_MODE]
    }, {
      begin: '-\\w\\b',
      relevance: 0
    }, {
      begin: "^__DATA__$",
      end: "^__END__$",
      subLanguage: 'mojolicious',
      contains: [{
        begin: "^@@.*",
        end: "$",
        className: "comment"
      }]
    }];
    SUBST.contains = PERL_DEFAULT_CONTAINS;
    METHOD.contains = PERL_DEFAULT_CONTAINS;

    return {
      aliases: ['pl', 'pm'],
      lexemes: /[\w\.]+/,
      keywords: PERL_KEYWORDS,
      contains: PERL_DEFAULT_CONTAINS
    };
  });

  hljs.registerLanguage('php', function (hljs) {
    var VARIABLE = {
      begin: '\\$+[a-zA-Z_\x7f-\xff][a-zA-Z0-9_\x7f-\xff]*'
    };
    var PREPROCESSOR = {
      className: 'meta', begin: /<\?(php)?|\?>/
    };
    var STRING = {
      className: 'string',
      contains: [hljs.BACKSLASH_ESCAPE, PREPROCESSOR],
      variants: [{
        begin: 'b"', end: '"'
      }, {
        begin: 'b\'', end: '\''
      }, hljs.inherit(hljs.APOS_STRING_MODE, { illegal: null }), hljs.inherit(hljs.QUOTE_STRING_MODE, { illegal: null })]
    };
    var NUMBER = { variants: [hljs.BINARY_NUMBER_MODE, hljs.C_NUMBER_MODE] };
    return {
      aliases: ['php3', 'php4', 'php5', 'php6'],
      case_insensitive: true,
      keywords: 'and include_once list abstract global private echo interface as static endswitch ' + 'array null if endwhile or const for endforeach self var while isset public ' + 'protected exit foreach throw elseif include __FILE__ empty require_once do xor ' + 'return parent clone use __CLASS__ __LINE__ else break print eval new ' + 'catch __METHOD__ case exception default die require __FUNCTION__ ' + 'enddeclare final try switch continue endfor endif declare unset true false ' + 'trait goto instanceof insteadof __DIR__ __NAMESPACE__ ' + 'yield finally',
      contains: [hljs.HASH_COMMENT_MODE, hljs.COMMENT('//', '$', { contains: [PREPROCESSOR] }), hljs.COMMENT('/\\*', '\\*/', {
        contains: [{
          className: 'doctag',
          begin: '@[A-Za-z]+'
        }]
      }), hljs.COMMENT('__halt_compiler.+?;', false, {
        endsWithParent: true,
        keywords: '__halt_compiler',
        lexemes: hljs.UNDERSCORE_IDENT_RE
      }), {
        className: 'string',
        begin: /<<<['"]?\w+['"]?$/, end: /^\w+;?$/,
        contains: [hljs.BACKSLASH_ESCAPE, {
          className: 'subst',
          variants: [{ begin: /\$\w+/ }, { begin: /\{\$/, end: /\}/ }]
        }]
      }, PREPROCESSOR, {
        className: 'keyword', begin: /\$this\b/
      }, VARIABLE, {
        // swallow composed identifiers to avoid parsing them as keywords
        begin: /(::|->)+[a-zA-Z_\x7f-\xff][a-zA-Z0-9_\x7f-\xff]*/
      }, {
        className: 'function',
        beginKeywords: 'function', end: /[;{]/, excludeEnd: true,
        illegal: '\\$|\\[|%',
        contains: [hljs.UNDERSCORE_TITLE_MODE, {
          className: 'params',
          begin: '\\(', end: '\\)',
          contains: ['self', VARIABLE, hljs.C_BLOCK_COMMENT_MODE, STRING, NUMBER]
        }]
      }, {
        className: 'class',
        beginKeywords: 'class interface', end: '{', excludeEnd: true,
        illegal: /[:\(\$"]/,
        contains: [{ beginKeywords: 'extends implements' }, hljs.UNDERSCORE_TITLE_MODE]
      }, {
        beginKeywords: 'namespace', end: ';',
        illegal: /[\.']/,
        contains: [hljs.UNDERSCORE_TITLE_MODE]
      }, {
        beginKeywords: 'use', end: ';',
        contains: [hljs.UNDERSCORE_TITLE_MODE]
      }, {
        begin: '=>' // No markup, just a relevance booster
      }, STRING, NUMBER]
    };
  });

  hljs.registerLanguage('python', function (hljs) {
    var PROMPT = {
      className: 'meta', begin: /^(>>>|\.\.\.) /
    };
    var STRING = {
      className: 'string',
      contains: [hljs.BACKSLASH_ESCAPE],
      variants: [{
        begin: /(u|b)?r?'''/, end: /'''/,
        contains: [PROMPT],
        relevance: 10
      }, {
        begin: /(u|b)?r?"""/, end: /"""/,
        contains: [PROMPT],
        relevance: 10
      }, {
        begin: /(u|r|ur)'/, end: /'/,
        relevance: 10
      }, {
        begin: /(u|r|ur)"/, end: /"/,
        relevance: 10
      }, {
        begin: /(b|br)'/, end: /'/
      }, {
        begin: /(b|br)"/, end: /"/
      }, hljs.APOS_STRING_MODE, hljs.QUOTE_STRING_MODE]
    };
    var NUMBER = {
      className: 'number', relevance: 0,
      variants: [{ begin: hljs.BINARY_NUMBER_RE + '[lLjJ]?' }, { begin: '\\b(0o[0-7]+)[lLjJ]?' }, { begin: hljs.C_NUMBER_RE + '[lLjJ]?' }]
    };
    var PARAMS = {
      className: 'params',
      begin: /\(/, end: /\)/,
      contains: ['self', PROMPT, NUMBER, STRING]
    };
    return {
      aliases: ['py', 'gyp'],
      keywords: {
        keyword: 'and elif is global as in if from raise for except finally print import pass return ' + 'exec else break not with class assert yield try while continue del or def lambda ' + 'async await nonlocal|10 None True False',
        built_in: 'Ellipsis NotImplemented'
      },
      illegal: /(<\/|->|\?)/,
      contains: [PROMPT, NUMBER, STRING, hljs.HASH_COMMENT_MODE, {
        variants: [{ className: 'function', beginKeywords: 'def', relevance: 10 }, { className: 'class', beginKeywords: 'class' }],
        end: /:/,
        illegal: /[${=;\n,]/,
        contains: [hljs.UNDERSCORE_TITLE_MODE, PARAMS, {
          begin: /->/, endsWithParent: true,
          keywords: 'None'
        }]
      }, {
        className: 'meta',
        begin: /^[\t ]*@/, end: /$/
      }, {
        begin: /\b(print|exec)\(/ // don’t highlight keywords-turned-functions in Python 3
      }]
    };
  });

  hljs.registerLanguage('xml', function (hljs) {
    var XML_IDENT_RE = '[A-Za-z0-9\\._:-]+';
    var TAG_INTERNALS = {
      endsWithParent: true,
      illegal: /</,
      relevance: 0,
      contains: [{
        className: 'attr',
        begin: XML_IDENT_RE,
        relevance: 0
      }, {
        begin: /=\s*/,
        relevance: 0,
        contains: [{
          className: 'string',
          endsParent: true,
          variants: [{ begin: /"/, end: /"/ }, { begin: /'/, end: /'/ }, { begin: /[^\s"'=<>`]+/ }]
        }]
      }]
    };
    return {
      aliases: ['html', 'xhtml', 'rss', 'atom', 'xjb', 'xsd', 'xsl', 'plist'],
      case_insensitive: true,
      contains: [{
        className: 'meta',
        begin: '<!DOCTYPE', end: '>',
        relevance: 10,
        contains: [{ begin: '\\[', end: '\\]' }]
      }, hljs.COMMENT('<!--', '-->', {
        relevance: 10
      }), {
        begin: '<\\!\\[CDATA\\[', end: '\\]\\]>',
        relevance: 10
      }, {
        begin: /<\?(php)?/, end: /\?>/,
        subLanguage: 'php',
        contains: [{ begin: '/\\*', end: '\\*/', skip: true }]
      }, {
        className: 'tag',
        /*
        The lookahead pattern (?=...) ensures that 'begin' only matches
        '<style' as a single word, followed by a whitespace or an
        ending braket. The '$' is needed for the lexeme to be recognized
        by hljs.subMode() that tests lexemes outside the stream.
        */
        begin: '<style(?=\\s|>|$)', end: '>',
        keywords: { name: 'style' },
        contains: [TAG_INTERNALS],
        starts: {
          end: '</style>', returnEnd: true,
          subLanguage: ['css', 'xml']
        }
      }, {
        className: 'tag',
        // See the comment in the <style tag about the lookahead pattern
        begin: '<script(?=\\s|>|$)', end: '>',
        keywords: { name: 'script' },
        contains: [TAG_INTERNALS],
        starts: {
          end: '\<\/script\>', returnEnd: true,
          subLanguage: ['actionscript', 'javascript', 'handlebars', 'xml']
        }
      }, {
        className: 'meta',
        variants: [{ begin: /<\?xml/, end: /\?>/, relevance: 10 }, { begin: /<\?\w+/, end: /\?>/ }]
      }, {
        className: 'tag',
        begin: '</?', end: '/?>',
        contains: [{
          className: 'name', begin: /[^\/><\s]+/, relevance: 0
        }, TAG_INTERNALS]
      }]
    };
  });

  hljs.registerLanguage('qml', function (hljs) {
    var KEYWORDS = {
      keyword: 'in of on if for while finally var new function do return void else break catch ' + 'instanceof with throw case default try this switch continue typeof delete ' + 'let yield const export super debugger as async await import',
      literal: 'true false null undefined NaN Infinity',
      built_in: 'eval isFinite isNaN parseFloat parseInt decodeURI decodeURIComponent ' + 'encodeURI encodeURIComponent escape unescape Object Function Boolean Error ' + 'EvalError InternalError RangeError ReferenceError StopIteration SyntaxError ' + 'TypeError URIError Number Math Date String RegExp Array Float32Array ' + 'Float64Array Int16Array Int32Array Int8Array Uint16Array Uint32Array ' + 'Uint8Array Uint8ClampedArray ArrayBuffer DataView JSON Intl arguments require ' + 'module console window document Symbol Set Map WeakSet WeakMap Proxy Reflect ' + 'Behavior bool color coordinate date double enumeration font geocircle georectangle ' + 'geoshape int list matrix4x4 parent point quaternion real rect ' + 'size string url var variant vector2d vector3d vector4d' + 'Promise'
    };

    var QML_IDENT_RE = '[a-zA-Z_][a-zA-Z0-9\\._]*';

    // Isolate property statements. Ends at a :, =, ;, ,, a comment or end of line.
    // Use property class.
    var PROPERTY = {
      className: 'keyword',
      begin: '\\bproperty\\b',
      starts: {
        className: 'string',
        end: '(:|=|;|,|//|/\\*|$)',
        returnEnd: true
      }
    };

    // Isolate signal statements. Ends at a ) a comment or end of line.
    // Use property class.
    var SIGNAL = {
      className: 'keyword',
      begin: '\\bsignal\\b',
      starts: {
        className: 'string',
        end: '(\\(|:|=|;|,|//|/\\*|$)',
        returnEnd: true
      }
    };

    // id: is special in QML. When we see id: we want to mark the id: as attribute and
    // emphasize the token following.
    var ID_ID = {
      className: 'attribute',
      begin: '\\bid\\s*:',
      starts: {
        className: 'string',
        end: QML_IDENT_RE,
        returnEnd: false
      }
    };

    // Find QML object attribute. An attribute is a QML identifier followed by :.
    // Unfortunately it's hard to know where it ends, as it may contain scalars,
    // objects, object definitions, or javascript. The true end is either when the parent
    // ends or the next attribute is detected.
    var QML_ATTRIBUTE = {
      begin: QML_IDENT_RE + '\\s*:',
      returnBegin: true,
      contains: [{
        className: 'attribute',
        begin: QML_IDENT_RE,
        end: '\\s*:',
        excludeEnd: true,
        relevance: 0
      }],
      relevance: 0
    };

    // Find QML object. A QML object is a QML identifier followed by { and ends at the matching }.
    // All we really care about is finding IDENT followed by { and just mark up the IDENT and ignore the {.
    var QML_OBJECT = {
      begin: QML_IDENT_RE + '\\s*{', end: '{',
      returnBegin: true,
      relevance: 0,
      contains: [hljs.inherit(hljs.TITLE_MODE, { begin: QML_IDENT_RE })]
    };

    return {
      aliases: ['qt'],
      case_insensitive: false,
      keywords: KEYWORDS,
      contains: [{
        className: 'meta',
        begin: /^\s*['"]use (strict|asm)['"]/
      }, hljs.APOS_STRING_MODE, hljs.QUOTE_STRING_MODE, { // template string
        className: 'string',
        begin: '`', end: '`',
        contains: [hljs.BACKSLASH_ESCAPE, {
          className: 'subst',
          begin: '\\$\\{', end: '\\}'
        }]
      }, hljs.C_LINE_COMMENT_MODE, hljs.C_BLOCK_COMMENT_MODE, {
        className: 'number',
        variants: [{ begin: '\\b(0[bB][01]+)' }, { begin: '\\b(0[oO][0-7]+)' }, { begin: hljs.C_NUMBER_RE }],
        relevance: 0
      }, { // "value" container
        begin: '(' + hljs.RE_STARTERS_RE + '|\\b(case|return|throw)\\b)\\s*',
        keywords: 'return throw case',
        contains: [hljs.C_LINE_COMMENT_MODE, hljs.C_BLOCK_COMMENT_MODE, hljs.REGEXP_MODE, { // E4X / JSX
          begin: /</, end: />\s*[);\]]/,
          relevance: 0,
          subLanguage: 'xml'
        }],
        relevance: 0
      }, SIGNAL, PROPERTY, {
        className: 'function',
        beginKeywords: 'function', end: /\{/, excludeEnd: true,
        contains: [hljs.inherit(hljs.TITLE_MODE, { begin: /[A-Za-z$_][0-9A-Za-z$_]*/ }), {
          className: 'params',
          begin: /\(/, end: /\)/,
          excludeBegin: true,
          excludeEnd: true,
          contains: [hljs.C_LINE_COMMENT_MODE, hljs.C_BLOCK_COMMENT_MODE]
        }],
        illegal: /\[|%/
      }, {
        begin: '\\.' + hljs.IDENT_RE, relevance: 0 // hack: prevents detection of keywords after dots
      }, ID_ID, QML_ATTRIBUTE, QML_OBJECT],
      illegal: /#/
    };
  });

  hljs.registerLanguage('swift', function (hljs) {
    var SWIFT_KEYWORDS = {
      keyword: '__COLUMN__ __FILE__ __FUNCTION__ __LINE__ as as! as? associativity ' + 'break case catch class continue convenience default defer deinit didSet do ' + 'dynamic dynamicType else enum extension fallthrough false final for func ' + 'get guard if import in indirect infix init inout internal is lazy left let ' + 'mutating nil none nonmutating operator optional override postfix precedence ' + 'prefix private protocol Protocol public repeat required rethrows return ' + 'right self Self set static struct subscript super switch throw throws true ' + 'try try! try? Type typealias unowned var weak where while willSet',
      literal: 'true false nil',
      built_in: 'abs advance alignof alignofValue anyGenerator assert assertionFailure ' + 'bridgeFromObjectiveC bridgeFromObjectiveCUnconditional bridgeToObjectiveC ' + 'bridgeToObjectiveCUnconditional c contains count countElements countLeadingZeros ' + 'debugPrint debugPrintln distance dropFirst dropLast dump encodeBitsAsWords ' + 'enumerate equal fatalError filter find getBridgedObjectiveCType getVaList ' + 'indices insertionSort isBridgedToObjectiveC isBridgedVerbatimToObjectiveC ' + 'isUniquelyReferenced isUniquelyReferencedNonObjC join lazy lexicographicalCompare ' + 'map max maxElement min minElement numericCast overlaps partition posix ' + 'precondition preconditionFailure print println quickSort readLine reduce reflect ' + 'reinterpretCast reverse roundUpToAlignment sizeof sizeofValue sort split ' + 'startsWith stride strideof strideofValue swap toString transcode ' + 'underestimateCount unsafeAddressOf unsafeBitCast unsafeDowncast unsafeUnwrap ' + 'unsafeReflect withExtendedLifetime withObjectAtPlusZero withUnsafePointer ' + 'withUnsafePointerToObject withUnsafeMutablePointer withUnsafeMutablePointers ' + 'withUnsafePointer withUnsafePointers withVaList zip'
    };

    var TYPE = {
      className: 'type',
      begin: '\\b[A-Z][\\w\']*',
      relevance: 0
    };
    var BLOCK_COMMENT = hljs.COMMENT('/\\*', '\\*/', {
      contains: ['self']
    });
    var SUBST = {
      className: 'subst',
      begin: /\\\(/, end: '\\)',
      keywords: SWIFT_KEYWORDS,
      contains: [] // assigned later
    };
    var NUMBERS = {
      className: 'number',
      begin: '\\b([\\d_]+(\\.[\\deE_]+)?|0x[a-fA-F0-9_]+(\\.[a-fA-F0-9p_]+)?|0b[01_]+|0o[0-7_]+)\\b',
      relevance: 0
    };
    var QUOTE_STRING_MODE = hljs.inherit(hljs.QUOTE_STRING_MODE, {
      contains: [SUBST, hljs.BACKSLASH_ESCAPE]
    });
    SUBST.contains = [NUMBERS];

    return {
      keywords: SWIFT_KEYWORDS,
      contains: [QUOTE_STRING_MODE, hljs.C_LINE_COMMENT_MODE, BLOCK_COMMENT, TYPE, NUMBERS, {
        className: 'function',
        beginKeywords: 'func', end: '{', excludeEnd: true,
        contains: [hljs.inherit(hljs.TITLE_MODE, {
          begin: /[A-Za-z$_][0-9A-Za-z$_]*/
        }), {
          begin: /</, end: />/
        }, {
          className: 'params',
          begin: /\(/, end: /\)/, endsParent: true,
          keywords: SWIFT_KEYWORDS,
          contains: ['self', NUMBERS, QUOTE_STRING_MODE, hljs.C_BLOCK_COMMENT_MODE, { begin: ':' } // relevance booster
          ],
          illegal: /["']/
        }],
        illegal: /\[|%/
      }, {
        className: 'class',
        beginKeywords: 'struct protocol class extension enum',
        keywords: SWIFT_KEYWORDS,
        end: '\\{',
        excludeEnd: true,
        contains: [hljs.inherit(hljs.TITLE_MODE, { begin: /[A-Za-z$_][0-9A-Za-z$_]*/ })]
      }, {
        className: 'meta', // @attributes
        begin: '(@warn_unused_result|@exported|@lazy|@noescape|' + '@NSCopying|@NSManaged|@objc|@convention|@required|' + '@noreturn|@IBAction|@IBDesignable|@IBInspectable|@IBOutlet|' + '@infix|@prefix|@postfix|@autoclosure|@testable|@available|' + '@nonobjc|@NSApplicationMain|@UIApplicationMain)'

      }, {
        beginKeywords: 'import', end: /$/,
        contains: [hljs.C_LINE_COMMENT_MODE, BLOCK_COMMENT]
      }]
    };
  });

  hljs.registerLanguage('typescript', function (hljs) {
    var KEYWORDS = {
      keyword: 'in if for while finally var new function do return void else break catch ' + 'instanceof with throw case default try this switch continue typeof delete ' + 'let yield const class public private protected get set super ' + 'static implements enum export import declare type namespace abstract',
      literal: 'true false null undefined NaN Infinity',
      built_in: 'eval isFinite isNaN parseFloat parseInt decodeURI decodeURIComponent ' + 'encodeURI encodeURIComponent escape unescape Object Function Boolean Error ' + 'EvalError InternalError RangeError ReferenceError StopIteration SyntaxError ' + 'TypeError URIError Number Math Date String RegExp Array Float32Array ' + 'Float64Array Int16Array Int32Array Int8Array Uint16Array Uint32Array ' + 'Uint8Array Uint8ClampedArray ArrayBuffer DataView JSON Intl arguments require ' + 'module console window document any number boolean string void'
    };

    return {
      aliases: ['ts'],
      keywords: KEYWORDS,
      contains: [{
        className: 'meta',
        begin: /^\s*['"]use strict['"]/
      }, hljs.APOS_STRING_MODE, hljs.QUOTE_STRING_MODE, { // template string
        className: 'string',
        begin: '`', end: '`',
        contains: [hljs.BACKSLASH_ESCAPE, {
          className: 'subst',
          begin: '\\$\\{', end: '\\}'
        }]
      }, hljs.C_LINE_COMMENT_MODE, hljs.C_BLOCK_COMMENT_MODE, {
        className: 'number',
        variants: [{ begin: '\\b(0[bB][01]+)' }, { begin: '\\b(0[oO][0-7]+)' }, { begin: hljs.C_NUMBER_RE }],
        relevance: 0
      }, { // "value" container
        begin: '(' + hljs.RE_STARTERS_RE + '|\\b(case|return|throw)\\b)\\s*',
        keywords: 'return throw case',
        contains: [hljs.C_LINE_COMMENT_MODE, hljs.C_BLOCK_COMMENT_MODE, hljs.REGEXP_MODE],
        relevance: 0
      }, {
        className: 'function',
        begin: 'function', end: /[\{;]/, excludeEnd: true,
        keywords: KEYWORDS,
        contains: ['self', hljs.inherit(hljs.TITLE_MODE, { begin: /[A-Za-z$_][0-9A-Za-z$_]*/ }), {
          className: 'params',
          begin: /\(/, end: /\)/,
          excludeBegin: true,
          excludeEnd: true,
          keywords: KEYWORDS,
          contains: [hljs.C_LINE_COMMENT_MODE, hljs.C_BLOCK_COMMENT_MODE],
          illegal: /["'\(]/
        }],
        illegal: /%/,
        relevance: 0 // () => {} is more typical in TypeScript
      }, {
        beginKeywords: 'constructor', end: /\{/, excludeEnd: true
      }, { // prevent references like module.id from being higlighted as module definitions
        begin: /module\./,
        keywords: { built_in: 'module' },
        relevance: 0
      }, {
        beginKeywords: 'module', end: /\{/, excludeEnd: true
      }, {
        beginKeywords: 'interface', end: /\{/, excludeEnd: true,
        keywords: 'interface extends'
      }, {
        begin: /\$[(.]/ // relevance booster for a pattern common to JS libs: `$(something)` and `$.something`
      }, {
        begin: '\\.' + hljs.IDENT_RE, relevance: 0 // hack: prevents detection of keywords after dots
      }]
    };
  });

  hljs.registerLanguage('ruby', function (hljs) {
    var RUBY_METHOD_RE = '[a-zA-Z_]\\w*[!?=]?|[-+~]\\@|<<|>>|=~|===?|<=>|[<>]=?|\\*\\*|[-/+%^&*~`|]|\\[\\]=?';
    var RUBY_KEYWORDS = {
      keyword: 'and then defined module in return redo if BEGIN retry end for self when ' + 'next until do begin unless END rescue else break undef not super class case ' + 'require yield alias while ensure elsif or include attr_reader attr_writer attr_accessor',
      literal: 'true false nil'
    };
    var YARDOCTAG = {
      className: 'doctag',
      begin: '@[A-Za-z]+'
    };
    var IRB_OBJECT = {
      begin: '#<', end: '>'
    };
    var COMMENT_MODES = [hljs.COMMENT('#', '$', {
      contains: [YARDOCTAG]
    }), hljs.COMMENT('^\\=begin', '^\\=end', {
      contains: [YARDOCTAG],
      relevance: 10
    }), hljs.COMMENT('^__END__', '\\n$')];
    var SUBST = {
      className: 'subst',
      begin: '#\\{', end: '}',
      keywords: RUBY_KEYWORDS
    };
    var STRING = {
      className: 'string',
      contains: [hljs.BACKSLASH_ESCAPE, SUBST],
      variants: [{ begin: /'/, end: /'/ }, { begin: /"/, end: /"/ }, { begin: /`/, end: /`/ }, { begin: '%[qQwWx]?\\(', end: '\\)' }, { begin: '%[qQwWx]?\\[', end: '\\]' }, { begin: '%[qQwWx]?{', end: '}' }, { begin: '%[qQwWx]?<', end: '>' }, { begin: '%[qQwWx]?/', end: '/' }, { begin: '%[qQwWx]?%', end: '%' }, { begin: '%[qQwWx]?-', end: '-' }, { begin: '%[qQwWx]?\\|', end: '\\|' }, {
        // \B in the beginning suppresses recognition of ?-sequences where ?
        // is the last character of a preceding identifier, as in: `func?4`
        begin: /\B\?(\\\d{1,3}|\\x[A-Fa-f0-9]{1,2}|\\u[A-Fa-f0-9]{4}|\\?\S)\b/
      }]
    };
    var PARAMS = {
      className: 'params',
      begin: '\\(', end: '\\)', endsParent: true,
      keywords: RUBY_KEYWORDS
    };

    var RUBY_DEFAULT_CONTAINS = [STRING, IRB_OBJECT, {
      className: 'class',
      beginKeywords: 'class module', end: '$|;',
      illegal: /=/,
      contains: [hljs.inherit(hljs.TITLE_MODE, { begin: '[A-Za-z_]\\w*(::\\w+)*(\\?|\\!)?' }), {
        begin: '<\\s*',
        contains: [{
          begin: '(' + hljs.IDENT_RE + '::)?' + hljs.IDENT_RE
        }]
      }].concat(COMMENT_MODES)
    }, {
      className: 'function',
      beginKeywords: 'def', end: '$|;',
      contains: [hljs.inherit(hljs.TITLE_MODE, { begin: RUBY_METHOD_RE }), PARAMS].concat(COMMENT_MODES)
    }, {
      // swallow namespace qualifiers before symbols
      begin: hljs.IDENT_RE + '::'
    }, {
      className: 'symbol',
      begin: hljs.UNDERSCORE_IDENT_RE + '(\\!|\\?)?:',
      relevance: 0
    }, {
      className: 'symbol',
      begin: ':(?!\\s)',
      contains: [STRING, { begin: RUBY_METHOD_RE }],
      relevance: 0
    }, {
      className: 'number',
      begin: '(\\b0[0-7_]+)|(\\b0x[0-9a-fA-F_]+)|(\\b[1-9][0-9_]*(\\.[0-9_]+)?)|[0_]\\b',
      relevance: 0
    }, {
      begin: '(\\$\\W)|((\\$|\\@\\@?)(\\w+))' // variables
    }, {
      className: 'params',
      begin: /\|/, end: /\|/,
      keywords: RUBY_KEYWORDS
    }, { // regexp container
      begin: '(' + hljs.RE_STARTERS_RE + ')\\s*',
      contains: [IRB_OBJECT, {
        className: 'regexp',
        contains: [hljs.BACKSLASH_ESCAPE, SUBST],
        illegal: /\n/,
        variants: [{ begin: '/', end: '/[a-z]*' }, { begin: '%r{', end: '}[a-z]*' }, { begin: '%r\\(', end: '\\)[a-z]*' }, { begin: '%r!', end: '![a-z]*' }, { begin: '%r\\[', end: '\\][a-z]*' }]
      }].concat(COMMENT_MODES),
      relevance: 0
    }].concat(COMMENT_MODES);

    SUBST.contains = RUBY_DEFAULT_CONTAINS;
    PARAMS.contains = RUBY_DEFAULT_CONTAINS;

    var SIMPLE_PROMPT = "[>?]>";
    var DEFAULT_PROMPT = "[\\w#]+\\(\\w+\\):\\d+:\\d+>";
    var RVM_PROMPT = "(\\w+-)?\\d+\\.\\d+\\.\\d(p\\d+)?[^>]+>";

    var IRB_DEFAULT = [{
      begin: /^\s*=>/,
      starts: {
        end: '$', contains: RUBY_DEFAULT_CONTAINS
      }
    }, {
      className: 'meta',
      begin: '^(' + SIMPLE_PROMPT + "|" + DEFAULT_PROMPT + '|' + RVM_PROMPT + ')',
      starts: {
        end: '$', contains: RUBY_DEFAULT_CONTAINS
      }
    }];

    return {
      aliases: ['rb', 'gemspec', 'podspec', 'thor', 'irb'],
      keywords: RUBY_KEYWORDS,
      illegal: /\/\*/,
      contains: COMMENT_MODES.concat(IRB_DEFAULT).concat(RUBY_DEFAULT_CONTAINS)
    };
  });

  hljs.registerLanguage('yaml', function (hljs) {
    var LITERALS = { literal: '{ } true false yes no Yes No True False null' };

    var keyPrefix = '^[ \\-]*';
    var keyName = '[a-zA-Z_][\\w\\-]*';
    var KEY = {
      className: 'attr',
      variants: [{ begin: keyPrefix + keyName + ":" }, { begin: keyPrefix + '"' + keyName + '"' + ":" }, { begin: keyPrefix + "'" + keyName + "'" + ":" }]
    };

    var TEMPLATE_VARIABLES = {
      className: 'template-variable',
      variants: [{ begin: '\{\{', end: '\}\}' }, // jinja templates Ansible
      { begin: '%\{', end: '\}' } // Ruby i18n
      ]
    };
    var STRING = {
      className: 'string',
      relevance: 0,
      variants: [{ begin: /'/, end: /'/ }, { begin: /"/, end: /"/ }],
      contains: [hljs.BACKSLASH_ESCAPE, TEMPLATE_VARIABLES]
    };

    return {
      case_insensitive: true,
      aliases: ['yml', 'YAML', 'yaml'],
      contains: [KEY, {
        className: 'meta',
        begin: '^---\s*$',
        relevance: 10
      }, { // multi line string
        className: 'string',
        begin: '[\\|>] *$',
        returnEnd: true,
        contains: STRING.contains,
        // very simple termination: next hash key
        end: KEY.variants[0].begin
      }, { // Ruby/Rails erb
        begin: '<%[%=-]?', end: '[%-]?%>',
        subLanguage: 'ruby',
        excludeBegin: true,
        excludeEnd: true,
        relevance: 0
      }, { // data type
        className: 'type',
        begin: '!!' + hljs.UNDERSCORE_IDENT_RE
      }, { // fragment id &ref
        className: 'meta',
        begin: '&' + hljs.UNDERSCORE_IDENT_RE + '$'
      }, { // fragment reference *ref
        className: 'meta',
        begin: '\\*' + hljs.UNDERSCORE_IDENT_RE + '$'
      }, { // array listing
        className: 'bullet',
        begin: '^ *-',
        relevance: 0
      }, STRING, hljs.HASH_COMMENT_MODE, hljs.C_NUMBER_MODE],
      keywords: LITERALS
    };
  });

  return hljs;
});

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

(function (global, factory) {
   true ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.calcite = factory());
}(this, (function () { 'use strict';

// Cool Helpers
// ┌────────────────────┐
// │ Class Manipulation │
// └────────────────────┘

// check if an element has a specific class
function has(domNode, className) {
  return new RegExp('(\\s|^)' + className + '(\\s|$)').test(domNode.getAttribute('class'));
}

// add one or more classes to an element
function add(domNode, classes) {
  classes.split(' ').forEach(function (c) {
    if (!has(domNode, c)) {
      domNode.setAttribute('class', domNode.getAttribute('class') + ' ' + c);
    }
  });
}

// remove one or more classes from an element
function remove(domNode, classes) {
  classes.split(' ').forEach(function (c) {
    var removedClass = domNode.getAttribute('class').replace(new RegExp('(\\s|^)' + c + '(\\s|$)', 'g'), '$2');
    if (has(domNode, c)) {
      domNode.setAttribute('class', removedClass);
    }
  });
}

// if domNode has the class, remove it, else add it
function toggle(domNode, className) {
  if (has(domNode, className)) {
    remove(domNode, className);
  } else {
    add(domNode, className);
  }
}

// remove 'is-active' class from every element in an array
function removeActive(array) {
  array = nodeListToArray(array);
  array.forEach(function (item) {
    remove(item, 'is-active');
  });
}

// add 'is-active' class from every element in an array
function addActive(array) {
  array = nodeListToArray(array);
  array.forEach(function (item) {
    add(item, 'is-active');
  });
}

// remove 'is-active' class from every element in an array, add to one element
function toggleActive(array, el) {
  removeActive(array);
  add(el, 'is-active');
}

// ┌─────┐
// │ DOM │
// └─────┘
// Handles dom nodes

// returns closest element up the DOM tree matching a given class
function closest(className, context) {
  var current;
  for (current = context; current; current = current.parentNode) {
    if (current.nodeType === 1 && has(current, className)) {
      break;
    }
  }
  return current;
}

// turn a domNodeList into an array
function nodeListToArray(domNodeList) {
  if (Array.isArray(domNodeList)) {
    return domNodeList;
  } else {
    return Array.prototype.slice.call(domNodeList);
  }
}

// Finds all the elements inside a node, or the document and returns them as an array
function findElements(query, domNode) {
  var context = domNode || document;
  var elements = context.querySelectorAll(query);
  return nodeListToArray(elements);
}

function filterArray(value, array) {
  var results = array.filter(function (item) {
    var val = value.toLowerCase();
    var t = item.innerHTML.toLowerCase();
    return t.indexOf(val) !== -1;
  });
  return results;
}

// ┌────────────────┐
// │ Aria Adjusters │
// └────────────────┘
// utilities to help manage aria properties

// toggles `aria-hidden` on a domNode
function toggleHidden(array) {
  array.forEach(function (node) {
    if (!node) {
      return;
    }
    var hidden = node.getAttribute('aria-hidden');
    if (hidden !== 'true') {
      node.setAttribute('aria-hidden', true);
    } else {
      node.removeAttribute('aria-hidden');
    }
  });
}

// adds `aria-hidden` on a domNode
function hide(array) {
  array.forEach(function (node) {
    if (!node) {
      return;
    }
    node.setAttribute('aria-hidden', true);
  });
}

// removes `aria-hidden` on a domNode
function show(array) {
  array.forEach(function (node) {
    if (!node) {
      return;
    }
    node.removeAttribute('aria-hidden');
  });
}

function toggleExpanded(domNode) {
  if (!domNode) {
    return;
  }
  var isExpanded = domNode.getAttribute('aria-expanded');
  if (isExpanded) {
    domNode.removeAttribute('aria-expanded');
  } else {
    domNode.setAttribute('aria-expanded', 'true');
  }
}

// ┌──────────────────────┐
// │ DOM Event Management │
// └──────────────────────┘

var boundEvents = {
  dropdowns: [],
  accordions: []
};

// returns standard interaction event, later will add touch support
function click() {
  return 'click';
}

// add a callback function to an event on a DOM node
function add$1(domNode, e, fn) {
  if (domNode.addEventListener) {
    return domNode.addEventListener(e, fn, false);
  } else if (domNode.attachEvent) {
    return domNode.attachEvent('on' + e, fn);
  }
}

// remove a specific function binding from a DOM node event
function remove$1(domNode, e, fn) {
  if (domNode.removeEventListener) {
    return domNode.removeEventListener(e, fn, false);
  } else if (domNode.detachEvent) {
    return domNode.detachEvent('on' + e, fn);
  }
}

// get the target element of an event
function target(e) {
  return e.target || e.srcElement;
}

// prevent default behavior of an event
function preventDefault(e) {
  if (e.preventDefault) {
    return e.preventDefault();
  } else if (e.returnValue) {
    e.returnValue = false;
  }
}

// stop and event from bubbling up the DOM tree
function stopPropagation(e) {
  e = e || window.event;
  if (e.stopPropagation) {
    return e.stopPropagation();
  }
  if (e.cancelBubble) {
    e.cancelBubble = true;
  }
}

// return a function that will only execute
// once it is NOT called for delay milliseconds
function throttle(fn, time, context) {
  var lock, args, wrapperFn, later;

  later = function later() {
    // reset lock and call if queued
    lock = false;
    if (args) {
      wrapperFn.apply(context, args);
      args = false;
    }
  };

  wrapperFn = function wrapperFn() {
    if (lock) {
      // called too soon, queue to call later
      args = arguments;
    } else {
      // call and lock until later
      fn.apply(context, arguments);
      setTimeout(later, time);
      lock = true;
    }
  };

  return wrapperFn;
}

function E() {
  // Keep this empty so it's easier to inherit from
  // (via https://github.com/lipsmack from https://github.com/scottcorgan/tiny-emitter/issues/3)
}

E.prototype = {
  on: function on(name, callback, ctx) {
    var e = this.e || (this.e = {});

    (e[name] || (e[name] = [])).push({
      fn: callback,
      ctx: ctx
    });

    return this;
  },

  once: function once(name, callback, ctx) {
    var self = this;
    function listener() {
      self.off(name, listener);
      callback.apply(ctx, arguments);
    }

    listener._ = callback;
    return this.on(name, listener, ctx);
  },

  emit: function emit(name) {
    var data = [].slice.call(arguments, 1);
    var evtArr = ((this.e || (this.e = {}))[name] || []).slice();
    var i = 0;
    var len = evtArr.length;

    for (i; i < len; i++) {
      evtArr[i].fn.apply(evtArr[i].ctx, data);
    }

    return this;
  },

  off: function off(name, callback) {
    var e = this.e || (this.e = {});
    var evts = e[name];
    var liveEvents = [];

    if (evts && callback) {
      for (var i = 0, len = evts.length; i < len; i++) {
        if (evts[i].fn !== callback && evts[i].fn._ !== callback) {
          liveEvents.push(evts[i]);
        }
      }
    }

    // Remove event from queue to prevent memory leak
    // Suggested by https://github.com/lazd
    // Ref: https://github.com/scottcorgan/tiny-emitter/commit/c6ebfaa9bc973b33d110a84a307742b7cf94c953#commitcomment-5024910

    liveEvents.length ? e[name] = liveEvents : delete e[name];
    return this;
  }
};

var bus = new E();

// Cool Helpers
function clipboard() {
  var copyBtns = findElements('.js-copy-to-clipboard');
  bus.on('clipboard:bind', bindButtons);

  function bindButtons(options) {
    if (!options) {
      copyBtns.forEach(function (btn) {
        add$1(btn, 'click', copy);
      });
    } else {
      add$1(options.node, 'click', copy);
    }
  }

  function copy(e) {
    e.preventDefault();
    var target$$1 = e.target.getAttribute('data-clipboard-target');
    document.querySelector(target$$1).select();
    document.execCommand('copy');
  }

  bus.emit('clipboard:bind');
}

// Cool Helpers
// ┌───────────┐
// │ Accordion │
// └───────────┘
// collapsible accordion list
// Listens to a 'accordion:bind' Obj.node = DOMNode
// Emits and listens on the 'accordion:open' channel. Obj.node = DOMNode
// Emits and listens to on the 'accorion:close' channel. Obj.node = DOMNode
// Emitting a modal id toggle that modals state.
// Emitting false or null closes all modals.

function toggleClick(e) {
  stopPropagation(e);
  var parent = closest('accordion-section', target(e));
  bus.emit('accordion:toggle', { node: parent });
}

function handleToggle(options) {
  toggle(options.node, 'is-active');
  toggleExpanded(options.node);
}

function checkKeyCode(e) {
  if (e.keyCode === 13) {
    toggleClick(e);
  }
}

function bindAccordions(options) {
  var accordions = findElements('.js-accordion');
  if (!options) {
    accordions.forEach(function (accordion) {
      setUpAccordion(accordion);
    });
  } else {
    setUpAccordion(options.node);
  }
}

function setUpAccordion(accordion) {
  accordion.setAttribute('aria-live', 'polite');
  accordion.setAttribute('role', 'tablist');
  nodeListToArray(accordion.children).forEach(function (section) {
    var sectionTitle = section.querySelector('.accordion-title');
    sectionTitle.setAttribute('role', 'tab');
    sectionTitle.setAttribute('tabindex', '0');
    if (has(section, 'is-active')) {
      section.setAttribute('aria-expanded', 'true');
    }
    // check if the event was already added
    var eventExists = false;
    boundEvents.accordions.forEach(function (e) {
      if (e.target === sectionTitle && e.event === click() && e.fn === toggleClick) {
        eventExists = true;
      }
    });
    if (!eventExists) {
      boundEvents.accordions.push({ target: sectionTitle, event: click(), fn: toggleClick });
      boundEvents.accordions.push({ target: section, event: 'keyup', fn: checkKeyCode });
      add$1(sectionTitle, click(), toggleClick);
      add$1(section, 'keyup', checkKeyCode);
    }
  });
}

function addListeners() {
  bus.on('accordion:bind', bindAccordions);
  bus.on('accordion:toggle', handleToggle);
  listenersAdded = true;
}

var listenersAdded = false;

function accordion() {
  // only add the listeners if they haven't been added already
  if (!listenersAdded) {
    addListeners();
  }
  bus.emit('accordion:bind');
}

// Cool Helpers
// ┌──────────┐
// │ Dropdown │
// └──────────┘
// show and hide dropdown menus
function closeAllDropdowns(options) {
  remove$1(document.body, click(), closeAllDropdowns);
  findElements('.js-dropdown').forEach(function (dropdown) {
    remove(dropdown, 'is-active');
  });
  findElements('.js-dropdown-toggle').forEach(function (toggle$$1) {
    toggle$$1.setAttribute('aria-expanded', 'false');
  });
  remove$1(document, 'keydown', seizeArrows);
}

function toggleDropdown(options) {
  if (!options) return;
  var isOpen = has(options.node, 'is-active');
  bus.emit('dropdown:close');
  if (!isOpen) {
    add(options.node, 'is-active');
    if (options.target) {
      options.target.setAttribute('aria-expanded', 'true');
    }
    add$1(document, 'keydown', seizeArrows);
  }
  if (has(options.node, 'is-active')) {
    add$1(document.body, click(), closeAllDropdowns);
  }
}

function seizeArrows(e) {
  if (e.keyCode === 40 | e.keyCode === 38) {
    e.preventDefault();
  }
}

function bindDropdowns(options) {
  // attach the new events
  var toggles = findElements('.js-dropdown-toggle');
  toggles.forEach(function (toggle$$1) {
    // check if the event was already added
    var eventExists = false;
    boundEvents.dropdowns.forEach(function (e) {
      if (e.target === toggle$$1 && e.event === click() && e.fn === toggleClick$1) {
        eventExists = true;
      }
    });
    if (!eventExists) {
      boundEvents.dropdowns.push({ target: toggle$$1, event: click(), fn: toggleClick$1 });
      add$1(toggle$$1, click(), toggleClick$1);
    }
  });
}

function dropdownIsOpen() {
  var dropdown = document.querySelector('.js-dropdown.is-active');
  if (dropdown) {
    return dropdown;
  } else {
    return false;
  }
}

function dropownFocusOn(options) {
  var activeLink = document.activeElement;
  var current = options.links.indexOf(activeLink);
  if (current === -1) {
    if (options.forward) {
      current = 0;
    } else {
      current = options.links.length - 1;
    }
  } else {
    if (options.forward) {
      current += 1;
      if (current === options.links.length) {
        current = 0;
      }
    } else {
      current -= 1;
      if (current === -1) {
        current = options.links.length - 1;
      }
    }
  }
  options.links[current].focus();
}

function arrowDown() {
  var dropdown = dropdownIsOpen();
  if (dropdown) {
    var links = findElements('.dropdown-link', dropdown);
    bus.emit('dropdown:focus', { links: links, forward: true });
  }
}

function arrowUp() {
  var dropdown = dropdownIsOpen();
  if (dropdown) {
    var links = findElements('.dropdown-link', dropdown);
    bus.emit('dropdown:focus', { links: links, forward: false });
  }
}

function toggleClick$1(e) {
  preventDefault(e);
  stopPropagation(e);
  var dropdown = closest('js-dropdown', e.target);
  bus.emit('dropdown:toggle', { node: dropdown, target: e.target });
}

function addListeners$1() {
  bus.on('dropdown:toggle', toggleDropdown);
  bus.on('dropdown:close', closeAllDropdowns);
  bus.on('keyboard:escape', closeAllDropdowns);
  bus.on('keyboard:arrow:down', arrowDown);
  bus.on('keyboard:arrow:up', arrowUp);
  bus.on('dropdown:focus', dropownFocusOn);
  listenersAdded$1 = true;
}

var listenersAdded$1 = false;

function dropdown() {
  // only add the listeners if they haven't been added already
  if (!listenersAdded$1) {
    addListeners$1();
  }
  bindDropdowns();
}

// Cool Helpers
// ┌────────┐
// │ Drawer │
// └────────┘
// show and hide drawers
function drawer() {
  var wrapper = document.querySelector('.wrapper');
  var footer = document.querySelector('.footer');
  var toggles = findElements('.js-drawer-toggle');
  var drawers = findElements('.js-drawer');
  var lastOn;

  // Bus events
  bus.on('drawer:open', openDrawer);
  bus.on('keyboard:escape', closeDrawer);
  bus.on('drawer:close', closeDrawer);
  bus.on('drawer:bind', bindDrawers);

  function openDrawer(options) {
    bus.emit('drawer:close');
    var drawer = document.querySelector('.js-drawer[data-drawer="' + options.id + '"]');
    var right = has(drawer, 'drawer-right');
    var left = has(drawer, 'drawer-left');

    drawer.setAttribute('tabindex', 0);
    add(drawer, 'is-active');

    if (right) {
      add(wrapper, 'drawer-right-is-active');
    } else if (left) {
      add(wrapper, 'drawer-left-is-active');
    }

    hide([wrapper, footer]);
    add$1(drawer, click(), closeClick);
    add$1(document, 'focusin', fenceDrawer);
  }

  function closeDrawer(options) {
    if (!options) {
      drawers.forEach(function (drawer) {
        drawer.removeAttribute('tabindex');
        remove(drawer, 'is-active');
      });
    } else {
      var drawer = document.querySelector('.js-drawer[data-drawer="' + options.id + '"]');
      drawer.removeAttribute('tabindex');
      remove(drawer, 'is-active');
    }
    remove(wrapper, 'drawer-left-is-active');
    remove(wrapper, 'drawer-right-is-active');
    show([wrapper, footer]);
    remove$1(document, 'focusin', fenceDrawer);
    if (lastOn) lastOn.focus();
  }

  function fenceDrawer(e) {
    if (!closest('js-drawer', e.target)) {
      drawers.forEach(function (drawer) {
        if (has(drawer, 'is-active')) {
          drawer.focus();
        }
      });
    }
  }

  function bindDrawers(options) {
    if (!options) {
      toggles.forEach(function (toggle$$1) {
        add$1(toggle$$1, click(), toggleClick);
      });
    } else {
      add$1(options.node, click(), toggleClick);
    }
  }

  function closeClick(e) {
    if (has(e.target, 'js-drawer')) {
      bus.emit('drawer:close');
    }
  }

  function toggleClick(e) {
    preventDefault(e);
    var drawerId = e.target.getAttribute('data-drawer');
    bus.emit('drawer:open', { id: drawerId });
  }

  bus.emit('drawer:bind');
}

// Cool Helpers
// ┌─────────────────┐
// │ Filter Dropdown │
// └─────────────────┘
// Select one or many from a searchable list

function filterDropdown() {
  bus.on('filterDropdown:bind', bindFilterDropdowns);
  bus.on('filterDropdown:select', toggleItem);
  bus.on('filterDropdown:select', emitActive);
  bus.on('filterDropdown:select:remove', removeItem);
  bus.on('filterDropdown:active', drawActive);
  bus.on('filterDropdown:active:clear', clearActive);
  bus.on('filterDropdown:toggle', toggleDropdown);
  bus.on('filterDropdown:open', openList);
  bus.on('filterDropdown:close', closeList);
  bus.on('keyboard:escape', closeList);

  function bindFilterDropdowns() {
    var dropdowns = findElements('.js-filter-dropdown');
    dropdowns.forEach(function (dropdown) {
      var dropdownId = dropdown.getAttribute('data-filter-dropdown');
      var input = dropdown.querySelector('.filter-dropdown-input');
      add$1(input, 'focus', inputFocus);

      var opens = dropdown.querySelectorAll('.js-filter-dropdown-open');
      for (var i = 0; i < opens.length; i++) {
        var open = opens[i];
        open.setAttribute('data-id', dropdownId);
        add$1(open, click(), toggleClick);
      }
      var closes = dropdown.querySelectorAll('.js-filter-dropdown-close');
      for (var _i = 0; _i < closes.length; _i++) {
        var close = closes[_i];
        close.setAttribute('data-id', dropdownId);
        add$1(close, click(), toggleClick);
      }

      var items = dropdown.querySelectorAll('.filter-dropdown-link');
      for (var _i2 = 0; _i2 < items.length; _i2++) {
        var item = items[_i2];
        item.setAttribute('data-item-id', _i2);
        add$1(item, click(), itemClick);
      }

      add$1(input, 'keyup', function (e) {
        var itemsArray = nodeListToArray(items);
        itemsArray.forEach(function (item) {
          add(item, 'hide');
        });

        filterArray(input.value, itemsArray).forEach(function (item) {
          remove(item, 'hide');
        });
      });
    });
  }

  function getOptions(e) {
    var parent = closest('js-filter-dropdown', e.target);
    return {
      parent: parent,
      id: parent.getAttribute('data-filter-dropdown'),
      item: e.target
    };
  }

  function inputFocus(e) {
    stopPropagation(e);
    var options = getOptions(e);
    bus.emit('filterDropdown:input:focus', options);
  }

  function itemClick(e) {
    preventDefault(e);
    stopPropagation(e);
    var options = getOptions(e);
    bus.emit('filterDropdown:select', options);
  }

  function toggleClick(e) {
    e.preventDefault();
    var options = getOptions(e);
    toggle(e.target, 'is-active');
    bus.emit('filterDropdown:toggle', options);
  }

  function toggleDropdown(options) {
    var list = options.parent.querySelector('.filter-dropdown-list');
    if (has(list, 'is-active')) {
      bus.emit('filterDropdown:close', options);
    } else {
      bus.emit('filterDropdown:open', options);
    }
  }

  function toggleItem(options) {
    toggle(options.item, 'is-active');
  }

  function removeItem(options) {
    var activeItems = options.parent.querySelectorAll('.filter-dropdown-link.is-active');
    var toRemove = activeItems[options.i];
    remove(toRemove, 'is-active');

    var newActiveItems = options.parent.querySelectorAll('.filter-dropdown-link.is-active');

    var emit = {
      parent: options.parent,
      id: options.id,
      active: newActiveItems
    };
    bus.emit('filterDropdown:active', emit);
  }

  function openList(options) {
    closeList();
    var list = options.parent.querySelector('.filter-dropdown-list');
    add(list, 'is-active');

    var closes = findElements('.js-filter-dropdown-close', options.parent);
    var opens = findElements('.js-filter-dropdown-open', options.parent);
    opens.forEach(function (el) {
      return remove(el, 'is-active');
    });
    closes.forEach(function (el) {
      return add(el, 'is-active');
    });
  }

  function closeList(e) {
    var lists = document.querySelectorAll('.filter-dropdown-list');
    removeActive(lists);

    var opens = findElements('.js-filter-dropdown-open');
    var closes = findElements('.js-filter-dropdown-close');
    opens.forEach(function (el) {
      return add(el, 'is-active');
    });
    closes.forEach(function (el) {
      return remove(el, 'is-active');
    });
  }

  function emitActive(options) {
    var activeItems = options.parent.querySelectorAll('.filter-dropdown-link.is-active');
    var emit = {
      parent: options.parent,
      id: options.id,
      active: activeItems
    };
    bus.emit('filterDropdown:active', emit);
  }

  function drawActive(options) {
    bus.emit('filterDropdown:active:clear', options);

    var placeholder = options.parent.querySelector('.js-flilter-dropdown-no-filters');
    if (options.active.length > 0) {
      add(placeholder, 'hide');
    } else {
      remove(placeholder, 'hide');
    }

    for (var i = 0; i < options.active.length; i++) {
      var item = options.active[i];
      var template = '<span class="filter-dropdown-active">\n        ' + item.innerHTML + '\n        <a class="filter-dropdown-remove" href="#" data-item-id=\'' + i + '\'>\n          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 32 32" class="svg-icon"><path d="M18.404 16l9.9 9.9-2.404 2.404-9.9-9.9-9.9 9.9L3.696 25.9l9.9-9.9-9.9-9.898L6.1 3.698l9.9 9.899 9.9-9.9 2.404 2.406-9.9 9.898z"/></svg>\n        </a>\n      </span>';
      options.parent.insertAdjacentHTML('beforeend', template);
      var remove$$1 = options.parent.querySelector('.filter-dropdown-remove[data-item-id="' + i + '"]');
      add$1(remove$$1, click(), removeClick);
    }
  }

  function removeClick(e) {
    e.preventDefault();
    var options = getOptions(e);
    options.i = e.target.getAttribute('data-item-id');
    bus.emit('filterDropdown:select:remove', options);
  }

  function clearActive(options) {
    var current = options.parent.querySelectorAll('.filter-dropdown-active');
    for (var i = 0; i < current.length; i++) {
      options.parent.removeChild(current[i]);
    }
  }

  bus.emit('filterDropdown:bind');
}

// Cool Helpers
// ┌───────┐
// │ Modal │
// └───────┘
// show and hide modal dialogues
// Listens to a 'modal:bind' optionally takes a node
// Emits and listens on the 'modal:open' channel. Takes a data-modal attr
// Emits and listens to on the 'modal:close' channel. Optionally takes a data-modal
// Emitting a modal id toggle that modals state.
// Emitting false or null closes all modals.

function modal() {
  // Cool nodes
  var wrapper = document.querySelector('.wrapper');
  var footer = document.querySelector('.footer');
  var toggles = findElements('.js-modal-toggle');
  var modals = findElements('.js-modal');

  // Bus events
  bus.on('modal:open', openModal);
  bus.on('keyboard:escape', closeModal);
  bus.on('modal:close', closeModal);
  bus.on('modal:bind', bindModals);

  function dependentNodes() {
    var nodes = [];
    if (wrapper) {
      nodes.push(wrapper);
    }
    if (footer) {
      nodes.push(footer);
    }
    return nodes;
  }

  function openModal(modalId) {
    bus.emit('modal:close');
    if (!modalId) return;
    var modal = document.querySelector('.js-modal[data-modal="' + modalId + '"]');
    modal.removeAttribute('tabindex');
    add$1(document, 'focusin', fenceModal);
    add(modal, 'is-active');
    hide(dependentNodes());
    modal.focus();
  }

  function closeModal(modalId) {
    if (!modalId) return removeActive(modals);
    var modal = document.querySelector('.js-modal[data-modal="' + modalId + '"]');
    remove(modal, 'is-active');
    modal.setAttribute('tabindex', 0);
    remove$1(document, 'focusin', fenceModal);
    show(dependentNodes());
  }

  function bindModals(node) {
    if (!node) {
      toggles.forEach(function (toggle$$1) {
        add$1(toggle$$1, click(), toggleClick);
      });
    } else {
      add$1(node, click(), toggleClick);
    }
  }

  function fenceModal(e) {
    if (!closest('js-modal', e.target)) {
      modals.forEach(function (modal) {
        if (has(modal, 'is-active')) {
          modal.focus();
        }
      });
    }
  }

  function toggleClick(e) {
    preventDefault(e);
    var modalId = e.target.dataset.modal;
    bus.emit('modal:open', modalId);
  }

  bus.emit('modal:bind');
}

// Cool Helpers
// ┌────────┐
// │ Search │
// └────────┘
// Expanding search bar that lives in the top nav.
function search() {
  var toggles = findElements('.js-search-toggle');
  var overlay = findElements('.js-search')[0];

  bus.on('search:bind', bindSearches);
  bus.on('search:toggle', toggleSearch);
  bus.on('keyboard:escape', closeSearch);
  bus.on('search:focus', focusSearch);

  function bindSearches(node) {
    if (!node) {
      toggles.forEach(function (toggle$$1) {
        add$1(toggle$$1, click(), toggleClick);
      });
    } else {
      add$1(node, click(), toggleClick);
    }
  }

  function toggleSearch(node) {
    var openIcon = node.querySelector('.js-search-icon');
    var closeIcon = node.querySelector('.js-close-icon');
    toggle(openIcon, 'hide');
    toggle(closeIcon, 'hide');
    toggle(overlay, 'is-active');
    toggle(document.body, 'overflow-hidden');
    bus.emit('search:focus');
  }

  function focusSearch() {
    var input = document.querySelector('.js-search-input');
    input.focus();
  }

  function closeSearch() {
    remove(overlay, 'is-active');
    remove(document.body, 'overflow-hidden');
    var toggleNodes = nodeListToArray(toggles);
    toggleNodes.forEach(toggleSearch);
  }

  function toggleClick(e) {
    preventDefault(e);
    bus.emit('search:toggle', e.target);
  }

  bus.emit('search:bind');
}

function selectNav() {
  bus.on('selectnav:bind', bindSelects);

  var selects = findElements('.js-select-nav');

  function bindSelects() {
    selects.forEach(function (select) {
      add$1(select, 'change', selectPage);
    });
  }

  function selectPage(e) {
    window.location.assign(e.currentTarget.value);
  }

  bus.emit('selectnav:bind');
}

var validator = new RegExp('^[a-z0-9]{8}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{12}$', 'i');

function gen(count) {
  var out = '';
  for (var i = 0; i < count; i++) {
    out += ((1 + Math.random()) * 0x10000 | 0).toString(16).substring(1);
  }
  return out;
}

function Guid(guid) {
  if (!guid) throw new TypeError('Invalid argument `value` has no value.');
  this.value = Guid.EMPTY;
  if (guid && guid instanceof Guid) {
    this.value = guid.toString();
  } else if (guid && Object.prototype.toString.call(guid) === '[object String]' && Guid.isGuid(guid)) {
    this.value = guid;
  }
  this.equals = function (other) {
    return Guid.isGuid(other) && this.value === other;
  };
  this.isEmpty = function () {
    return this.value === Guid.EMPTY;
  };
  this.toString = function () {
    return this.value;
  };
  this.toJSON = function () {
    return this.value;
  };
}

Guid.EMPTY = '00000000-0000-0000-0000-000000000000';
Guid.isGuid = function (value) {
  return value && (value instanceof Guid || validator.test(value.toString()));
};
Guid.create = function () {
  return new Guid([gen(2), gen(1), gen(1), gen(1), gen(3)].join('-'));
};
Guid.raw = function () {
  return [gen(2), gen(1), gen(1), gen(1), gen(3)].join('-');
};

// Cool Helpers
// ┌────────┐
// │ Sticky │
// └────────┘
// sticks things to the window

function sticky() {
  bus.on('scrolling:at', scrollHandler);
  bus.on('sticky:stick', stickItem);
  bus.on('sticky:unstick', unstickItem);

  var elements = findElements('.js-sticky');
  var stickies = elements.map(function (el) {
    var offset = el.offsetTop;
    var dataTop = el.getAttribute('data-top') || 0;
    el.style.top = dataTop + 'px';
    var hasId = el.getAttribute('data-sticky-id');
    if (!hasId) createShim(el);
    return {
      top: offset - parseInt(dataTop, 0),
      element: el
    };
  });

  function createShim(el) {
    var guid = Guid.raw();
    el.setAttribute('data-sticky-id', guid);
    var parent = el.parentNode;
    var shim = el.cloneNode('deep');
    add(shim, 'js-shim');
    remove(shim, 'js-sticky');
    shim.setAttribute('data-sticky-id', guid);
    shim.style.visibility = 'hidden';
    shim.style.display = 'none';
    parent.insertBefore(shim, el);
  }

  function stickItem(item) {
    var id = item.element.getAttribute('data-sticky-id');
    var shim = document.querySelector('.js-shim[data-sticky-id="' + id + '"]');
    if (id && shim) {
      add(item.element, 'is-sticky');
      shim.style.display = '';
    }
  }

  function unstickItem(item) {
    var id = item.element.getAttribute('data-sticky-id');
    var shim = document.querySelector('.js-shim[data-sticky-id="' + id + '"]');
    if (id && shim) {
      remove(item.element, 'is-sticky');
      shim.style.display = 'none';
    }
  }

  function scrollHandler(pageYOffset) {
    stickies.forEach(function (item) {
      var referenceElement = item.element;
      if (has(item.element, 'is-sticky')) {
        var id = item.element.getAttribute('data-sticky-id');
        referenceElement = document.querySelector('.js-shim[data-sticky-id="' + id + '"]');
      }

      if (referenceElement) {
        var dataTop = referenceElement.getAttribute('data-top') || 0;
        item.top = referenceElement.offsetTop - parseInt(dataTop, 0);
      }

      if (item.top < pageYOffset) {
        bus.emit('sticky:stick', item);
      } else {
        bus.emit('sticky:unstick', item);
      }
    });
  }
}

// Cool Helpers
// ┌──────┐
// │ Tabs │
// └──────┘
// tabbed content pane
function tabs() {
  bus.on('tabs:bind', bindTabs);
  bus.on('tabs:active', setTab);

  function bindTabs() {
    var tabs = findElements('.js-tab');
    var tabGroups = findElements('.js-tab-group');
    var tabSections = findElements('.js-tab-section');

    // set max width for each tab
    tabGroups.forEach(function (tab) {
      tab.setAttribute('aria-live', 'polite');
      groupId(tab);
      tab.children[0].setAttribute('role', 'tablist');
      var tabsInGroup = tab.querySelectorAll('.js-tab');
      var percent = 100 / tabsInGroup.length;
      for (var i = 0; i < tabsInGroup.length; i++) {
        tabsInGroup[i].style.maxWidth = percent + '%';
      }
    });

    tabs.forEach(function (tab) {
      tab.setAttribute('aria-expanded', 'false');
      tab.setAttribute('role', 'tab');
      tab.setAttribute('tabindex', '0');
      add$1(tab, click(), clickTab);
      add$1(tab, 'keyup', enterTab);
    });

    tabSections.forEach(function (section) {
      section.setAttribute('role', 'tabpanel');
      var isOpen = has(section, 'is-active');
      if (isOpen) {
        section.setAttribute('aria-expanded', true);
      } else {
        section.setAttribute('aria-expanded', false);
      }
    });
  }

  function groupId(tab) {
    var hasId = tab.getAttribute('data-tab');
    if (hasId) {
      return hasId;
    } else {
      var id = Guid.raw();
      tab.setAttribute('data-tab', id);
      return id;
    }
  }

  function setTab(options) {
    var group = options.parent;
    var tabs = nodeListToArray(group.querySelectorAll('.js-tab'));
    var activeTab = options.active;

    var sections = nodeListToArray(group.querySelectorAll('.js-tab-section'));
    var index = tabs.indexOf(activeTab);
    var activeSection = sections[index];

    tabs.forEach(function (t) {
      t.setAttribute('aria-expanded', false);
    });
    activeTab.setAttribute('aria-expanded', true);
    toggleActive(tabs, activeTab);

    sections.forEach(function (s) {
      s.setAttribute('aria-expanded', false);
    });
    activeSection.setAttribute('aria-expanded', true);
    toggleActive(sections, activeSection);
  }

  function getOptions(e) {
    var tab = e.target;
    var group = closest('js-tab-group', tab);
    var id = groupId(group);
    return {
      parent: group,
      id: id,
      active: tab
    };
  }

  function clickTab(e) {
    e.preventDefault();
    var options = getOptions(e);
    bus.emit('tabs:active', options);
  }

  function enterTab(e) {
    var options = getOptions(e);
    if (e.keycode === 13) {
      bus.emit('tabs:active', options);
    }
  }

  bus.emit('tabs:bind');
}

// Cool Helpers
// ┌───────────┐
// │ Third Nav │
// └───────────┘
// sticks things to the window

function thirdNav() {
  var nav = findElements('.js-nav-overflow')[0];
  var leftBtn = findElements('.js-overflow-left')[0];
  var rightBtn = findElements('.js-overflow-right')[0];

  function scroll(distance) {
    nav.scrollLeft += distance;
  }

  function resize() {
    remove(leftBtn, 'is-active');
    remove(rightBtn, 'is-active');
    if (nav.scrollLeft > 0) add(leftBtn, 'is-active');
    if (nav.scrollLeft + nav.clientWidth + 5 < nav.scrollWidth) add(rightBtn, 'is-active');
  }

  if (nav) {
    if (leftBtn) {
      add$1(leftBtn, click(), scroll.bind(null, -40));
    }
    if (rightBtn) {
      add$1(rightBtn, click(), scroll.bind(null, 40));
    }
    add$1(nav, 'scroll', resize);
    add$1(window, 'resize', resize);
    resize();
  }
}

// ┌─────────┐
// │ Helpers │
// └─────────┘
// utilities for working with dom, and removing browser inconsistencies
// with support back to IE9+
// ┌─────┐
// │ Bus │
// └─────┘
// all event passing takes place over a bus
// this is just an instance of tinyEmitter
// ┌─────────────────┐
// │ Import Patterns │
// └─────────────────┘
// import all interactive patterns
// Object Assign Polyfill
if (typeof Object.assign !== 'function') {
  Object.assign = function (target$$1) {
    'use strict';

    if (target$$1 == null) {
      throw new TypeError('Cannot convert undefined or null to object');
    }

    target$$1 = Object(target$$1);
    for (var index = 1; index < arguments.length; index++) {
      var source = arguments[index];
      if (source != null) {
        for (var key in source) {
          if (Object.prototype.hasOwnProperty.call(source, key)) {
            target$$1[key] = source[key];
          }
        }
      }
    }
    return target$$1;
  };
}

// ┌──────────────────────┐
// │ Emit Keyboard Events │
// └──────────────────────┘
// emit presses of escape and return keys
add$1(document, 'keyup', translateKeypress);
function translateKeypress(e) {
  if (e.keyCode === 27) {
    bus.emit('keyboard:escape');
  } else if (e.keyCode === 13) {
    bus.emit('keyboard:return');
  } else if (e.keyCode === 32) {
    bus.emit('keyboard:space');
  } else if (e.keyCode === 38) {
    bus.emit('keyboard:arrow:up');
  } else if (e.keyCode === 40) {
    bus.emit('keyboard:arrow:down');
  } else if (e.keyCode === 37) {
    bus.emit('keyboard:arrow:left');
  } else if (e.keyCode === 39) {
    bus.emit('keyboard:arrow:right');
  }
}

// ┌────────────────────┐
// │ Emit Scroll Events │
// └────────────────────┘
// throttled for performance
add$1(window, 'scroll', throttle(isScrolling, 100));
function isScrolling() {
  bus.emit('scrolling:at', window.pageYOffset);
}

// ┌────────────────────┐
// │ Initialize Calcite │
// └────────────────────┘
// start up Calcite and attach all the patterns
// optionally pass an array of patterns you'd like to watch
var patterns = [accordion, clipboard, dropdown, drawer, filterDropdown, modal, search, selectNav, sticky, tabs, thirdNav];

function init() {
  patterns.forEach(function (pattern) {
    pattern();
  });
}

function extend(plugin) {
  for (var key in plugin) {
    patterns.push(plugin[key]);
  }
  Object.assign(this, plugin);
}

// ┌────────────┐
// │ Public API │
// └────────────┘
// define all public api methods
var calciteWeb = {
  version: '1.0.0',
  click: click,
  addEvent: add$1,
  removeEvent: remove$1,
  eventTarget: target,
  preventDefault: preventDefault,
  stopPropagation: stopPropagation,
  throttle: throttle,
  hasClass: has,
  addClass: add,
  removeClass: remove,
  toggleClass: toggle,
  removeActive: removeActive,
  addActive: addActive,
  toggleActive: toggleActive,
  toggleAriaHidden: toggleHidden,
  toggleAriaExpanded: toggleExpanded,
  closest: closest,
  nodeListToArray: nodeListToArray,
  findElements: findElements,
  bus: bus,
  accordion: accordion,
  dropdown: dropdown,
  drawers: drawer,
  filterDropdown: filterDropdown,
  modal: modal,
  search: search,
  selectNav: selectNav,
  sticky: sticky,
  tabs: tabs,
  thirdNav: thirdNav,
  extend: extend,
  init: init
};

return calciteWeb;

})));


/***/ },
/* 2 */
/***/ function(module, exports, __webpack_require__) {

"use strict";
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_calcite_web__ = __webpack_require__(1);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_calcite_web___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_calcite_web__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__lib_highlight_pack_js__ = __webpack_require__(0);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__lib_highlight_pack_js___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1__lib_highlight_pack_js__);



__WEBPACK_IMPORTED_MODULE_0_calcite_web___default.a.init();
window.calcite = __WEBPACK_IMPORTED_MODULE_0_calcite_web___default.a;

__WEBPACK_IMPORTED_MODULE_1__lib_highlight_pack_js___default.a.initHighlighting();
window.hljs = __WEBPACK_IMPORTED_MODULE_1__lib_highlight_pack_js___default.a;

/***/ }
/******/ ]);
//# sourceMappingURL=index.js.map