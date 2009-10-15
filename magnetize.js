//
// <p>
//   Bookmark this link:
//   <a href="javascript:(function()%20{var%20script%20=%20document.createElement(%22script%22);script.type%20=%20%22text/javascript%22;script.src%20=%20%22http://github.com/iamjwc/magnetize/raw/master/magnetize.js%22;document.getElementsByTagName(%22head%22)[0].appendChild(script);})();">magnetize</a>
// </p>
//


if (!window.console) {
  console = {
    log : function(e) {}
  }
}

function getMatchingElements(tagName, parent, filter) {
  var a = [];
  var els = (parent ? parent : document).getElementsByTagName(tagName);
  if (!filter) {
    return els ? els : a;
  }
  for (var i = 0, j = els.length; i < j; i++) {
    if (filter(els[i])) {
      a.push(els[i]);
    }
  }
  return a;
}

function getElementsByClassName(tagName, className, parent)  {
  return getMatchingElements(tagName, parent, function(el) {
    return el.className == className;
  });
}

/**
 * Makes href element of url an absolute one and returns it.
 */
function absoulutize(url) {
  if (url.toLowerCase().indexOf("magnet:?") == 0) {
    return url;
  }
  if (url.substr(0, 7).toLowerCase() != "http://") {
    if (url.substr(0, 1) == "/") {
      var location = window.location.toString();
      url = location.substr(0, location.indexOf('/', 7)) + url;
    } else {
      var location = window.location.toString();
      url = location.substr(0, location.lastIndexof('/') + 1) + url;
    }
  }
  url = encodeURIComponent(url);
  console.log(url);
  return url;
}

function createDownloadAllLink(link, count) {
  var containerStyles = 'position: fixed; top: 4px; right: 4px; border: 1px solid #333; background-color: #ffe; width: 172px; padding: 0;' +
    '-webkit-border-radius: 7px; -webkit-box-shadow: 0 2px 3px #333; -moz-box-shadow: 0 2px 3px #333; -moz-border-radius: 7px; overflow: hidden;';

  var html = 
    <div style="position: fixed; top: 4px; right: 4px; border: 1px solid #333; background-color: #ffe; width: 172px; padding: 0; -webkit-border-radius: 7px; -webkit-box-shadow: 0 2px 3px #333; -moz-box-shadow: 0 2px 3px #333; -moz-border-radius: 7px; overflow: hidden;">
        <p style="margin: 0; padding: 0; padding-bottom: 2px; font: 12px arial; background-color: #d3d3d3; border-bottom: 1px solid #313131; -webkit-border-top-right-radius: 7px; -webkit-border-top-left-radius: 7px; -moz-border-radius-topright: 7px; -moz-border-radius-topleft: 7px;"><img style="margin: 3px 2px; margin-bottom: -3px;" src="assets/img/lime.gif" alt="lime" /><a style="color: #2152a6;" href="">Download all files (134)</a></p>
        <p style="margin: 0; padding-top: 2px; margin-left: 18px;font: 12px arial;"><a style="color: #2152a6;" href="">Download only images (12)</a></p>
        <p style="margin: 0; padding:2px 0; margin-left: 18px;font: 12px arial;"><a style="color: #2152a6;" href="">Download only audio (122)</a></p>
    </div>

  var html = '<div style="background: white; position: fixed; z-index: 1000; top: 0; right: 0; width: 140px; height: 14px">';
  html += '<a href="' + link + '">Download all (' + count + ')</a>';
  html += "</div>";
  document.body.innerHTML += html;
}

function main() {
  var non_page_links = getMatchingElements("a", null, function(a) {
    var href = a.href.toLowerCase();
    // don't handle urls with query strings or javascript calls or
    // magnet links
    if (href.indexOf('?') != -1 || href.indexOf('javascript:') == 0
      || href.indexOf('magnet:?') == 0) {
      return false;
    }

    var white_list = { 'jpeg':'', 'jpg':'', 'mp3':'', 'flv':'', 'png':'', 'gif':'', 'pdf':'', 'doc':'', 'docx': '', 'odt':'', 'txt':'' };
    var ext = href.substr(href.lastIndexOf('.') + 1);
    if (ext in white_list) {
      return true;
    }
    return false;
  });

  console.log(non_page_links);
  var download_all_link = "magnet:?";
  for (var i = 0; i < non_page_links.length; i++) {
    var a = non_page_links[i];
    var href = absoulutize(a.href);
    a.setAttribute('href', "magnet:?xs=" + href);
    download_all_link += "&xs." + i + "=" + href;
  }
  var images = getMatchingElements("img", null, function(img) {
    var src = img.src.toLowerCase();
    var white_list = { 'jpeg':'', 'jpg':'', 'png':'', 'gif':'' };
    var ext = src.substr(src.lastIndexOf('.') + 1);
    if (ext in white_list) {
      return true;
    }
  });
  console.log(images);
  for (var i = 0; i < images.length; i++) {
    download_all_link += "&xs." + (i + non_page_links.length) + "=" + absoulutize(images[i].src);
  }
  console.log(download_all_link);
  if (non_page_links.length > 0 || images.length > 0) {
    createDownloadAllLink(download_all_link, non_page_links.length + images.length);
  }
}

main();

