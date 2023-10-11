(function() {
  'use strict';

  showdown.setOption('tables', true);

  var converter = new showdown.Converter();

  var loadJSFileRequests = [];

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
      if (request.readyState === XMLHttpRequest.DONE) {
        var status = request.status;
        if (status === 0 || (status >= 200 && status < 400)) {
          callback(request.responseText);
        } else {
          loadJSFile(addJavaScriptExtension(path), callback);
        }
      }
    };
    request.send();
  }

  function loadJSFile(path, callback) {
    loadJSFileRequests.push([path, callback]);
    if (loadJSFileRequests.length > 1) {
      return;
    }
    loadJSFileInner(path, callback);
  }

  function loadJSFileInner(path, callback) {
    var el = document.createElement('script');
    var onmessage = function(event) {
      el.parentNode.removeChild(el);
      window.removeEventListener('message', onmessage);
      callback(event.data.toString().trim());
      loadNextJSFile();
    };
    el.src = path;
    el.onerror = function() {
      el.parentNode.removeChild(el);
      window.removeEventListener('message', onmessage);
      callback('');
      loadNextJSFile();
    };
    window.addEventListener('message', onmessage);
    document.getElementsByTagName('head')[0].appendChild(el);
  }

  function loadNextJSFile() {
    loadJSFileRequests.shift();
    if (loadJSFileRequests.length > 0) {
      var request = loadJSFileRequests[0];
      loadJSFileInner(request[0], request[1]);
    }
  }

  function loadIndex(name) {
    var url = 'doc/' + addMarkdownExtension(name);
    loadFileText(url, function(text) {
      var htmlText = converter.makeHtml(text) + '<br>';
      document.getElementById('index-pane').innerHTML = htmlText;
    });
  }

  function addMarkdownExtension(name) {
    if (!(/\.md$/.test(name))) {
      name += '.md';
    }
    return name;
  }

  function addJavaScriptExtension(name) {
    if (!(/\.js$/.test(name))) {
      name += '.js';
    }
    return name;
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
