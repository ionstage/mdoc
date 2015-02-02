(function(global) {
  var win = global.window;
  var doc = win.document;
  var marked = (function() {
    var converter = new Showdown.converter();
    return function(text) {
      return converter.makeHtml(text);
    };
  })();

  function createHttpRequest() {
    var xmlHttpNames = ['Msxml2.XMLHTTP', 'Microsoft.XMLHTTP', 'Msxml2.XMLHTTP.4.0'];
    if ('ActiveXObject' in window) {
      for (var i = 0, len = xmlHttpNames.length; i < len; i++) {
        try {
          return new ActiveXObject(xmlHttpNames[i]);
        } catch (e) {}
      }
      return null;
    } else if('XMLHttpRequest' in window){
      return new XMLHttpRequest();
    } else {
      return null;
    }
  }

  function loadFileText(path, callback) {
    var request = createHttpRequest();
    request.open('GET', path, true);
    request.onreadystatechange = function() {
      if (request.readyState === 4) {
        callback(request.responseText);
      }
    };
    request.send();
  }

  function loadIndex(name) {
    var url = 'doc/' + addMarkdownExtension(name);
    loadFileText(url, function(text) {
      var htmlText = marked(text);
      doc.getElementById('index-pane').innerHTML = htmlText;
    });
  }

  function addMarkdownExtension(text) {
    if (!(/.md$/.test(text))) {
      text += '.md';
    }
    return text;
  }

  function changeArticle(name) {
    var url = 'doc/' + addMarkdownExtension(name);
    loadFileText(url, function(text) {
      var htmlText = marked(text);
      var articlePane = doc.getElementById('article-pane');
      articlePane.innerHTML = htmlText;
      articlePane.scrollTop = 0;
    });
  }

  function getCurrentArticleName() {
    var match = location.hash.match(/^#!(.+)/);
    return (match) ? match[1] : '';
  }

  setTimeout((function() {
    var current = getCurrentArticleName();
    var watchHash = function() {
      var article = getCurrentArticleName();
      if (article && current !== article) {
        current = article;
        changeArticle(article);
      }
      setTimeout(watchHash, 60);
    };
    return watchHash;
  })(), 60);

  loadIndex('index');
  changeArticle(getCurrentArticleName() || 'top');
})(this);