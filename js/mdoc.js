(function() {
  'use strict';

  showdown.setOption('tables', true);

  var converter = new showdown.Converter();
  var loadJSFileRequests = [];
  var isIE = !!document.documentMode;

  function createHttpRequest() {
    if ('ActiveXObject' in window) {
      var xmlHttpNames = ['Msxml2.XMLHTTP', 'Microsoft.XMLHTTP', 'Msxml2.XMLHTTP.4.0'];
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
        if ((isIE && status === 0) || (status >= 200 && status < 400)) {
          callback(request.responseText);
        } else {
          loadJSFile(addJavaScriptExtension(path), callback);
        }
      }
    };
    try {
      request.send();
    } catch (error) {
      // do nothing
    }
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
      el.removeEventListener('error', onerror);
      el.parentNode.removeChild(el);
      window.removeEventListener('message', onmessage);
      callback(event.data.toString().trim());
      loadNextJSFile();
    };
    var onerror = function() {
      el.removeEventListener('error', onerror);
      el.parentNode.removeChild(el);
      window.removeEventListener('message', onmessage);
      callback('');
      loadNextJSFile();
    };
    el.src = path;
    el.addEventListener('error', onerror);
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
    var hash = location.hash;
    if (!hash) {
      return 'top';
    }
    var match = hash.match(/^#!(.+)/);
    return (match ? match[1] : '');
  }

  function clearTextSelection() {
    window.getSelection().removeAllRanges();
  }

  window.addEventListener('hashchange', function() {
    changeArticle(getCurrentArticleName());
    clearTextSelection();
  });

  loadIndex('index');
  changeArticle(getCurrentArticleName());
})();
