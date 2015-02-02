(function(global) {
  var win = global.window;
  var doc = win.document;

  function loadFileText(path, callback) {
    var request = new XMLHttpRequest();
    request.open('GET', path, true);
    request.onreadystatechange = function() {
      if (this.readyState === 4) {
        callback(this.responseText);
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
      doc.getElementById('article-pane').innerHTML = htmlText;
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