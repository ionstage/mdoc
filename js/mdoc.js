(function() {
  'use strict';
  var showdown = require('showdown');

  var converter = new showdown.Converter();

  function createHttpRequest() {
    var xmlHttpNames = ['Msxml2.XMLHTTP', 'Microsoft.XMLHTTP', 'Msxml2.XMLHTTP.4.0'];
    if ('ActiveXObject' in window) {
      for (var i = 0, len = xmlHttpNames.length; i < len; i++) {
        try {
          return new ActiveXObject(xmlHttpNames[i]);
        } catch (e) {
          continue;
        }
      }
    }
    return new XMLHttpRequest();
  }

  function loadFileText(path, callback) {
    var request = createHttpRequest();
    request.open('GET', path, true);
    request.onreadystatechange = function() {
      if (request.readyState === 4)
        callback(request.responseText);
    };
    request.send();
  }

  function loadIndex(name) {
    var url = 'doc/' + addMarkdownExtension(name);
    loadFileText(url, function(text) {
      var htmlText = converter.makeHtml(text) + '<br>';
      document.getElementById('index-pane').innerHTML = htmlText;
    });
  }

  function addMarkdownExtension(text) {
    if (!(/.md$/.test(text)))
      text += '.md';
    return text;
  }

  function changeArticle(name) {
    var url = 'doc/' + addMarkdownExtension(name);
    loadFileText(url, function(text) {
      var htmlText = converter.makeHtml(text) + '<br>';
      var articlePane = document.getElementById('article-pane');
      articlePane.innerHTML = htmlText;
      articlePane.scrollTop = 0;
    });
  }

  function getCurrentArticleName() {
    var match = location.hash.match(/^#!(.+)/);
    return match ? match[1] : '';
  }

  function clearTextSelection() {
    if ('getSelection' in window) {
      window.getSelection().removeAllRanges();
    } else if ('createTextRange' in document.body) {
      var range = document.body.createTextRange();
      range.collapse(false);
      range.select();
    }
  }

  if ('onhashchange' in window) {
    window.onhashchange = function(event) {
      var article = getCurrentArticleName();
      changeArticle(article);
      clearTextSelection();
    };
  } else {
    setTimeout((function() {
      var cache = getCurrentArticleName();
      var watchHash = function() {
        var article = getCurrentArticleName();
        if (article && article !== cache) {
          changeArticle(article);
          cache = article;
          clearTextSelection();
        }
        setTimeout(watchHash, 60);
      };
      return watchHash;
    })(), 60);
  }

  loadIndex('index');
  changeArticle(getCurrentArticleName() || 'top');
})();