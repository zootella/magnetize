//
// <p>
//   Bookmark this link:
//   <a href="javascript:(function()%20{var%20script%20=%20document.createElement(%22script%22);script.type%20=%20%22text/javascript%22;script.src%20=%20%22http://github.com/iamjwc/magnetize/raw/master/magnetize.js%22;document.getElementsByTagName(%22head%22)[0].appendChild(script);})();">magnetize</a>
// </p>
//


if (!console) {
  console = {
    log: function(e) {}
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

function createDownloadLinks(urls) {
  var containerStyles = 'position: fixed; top: 4px; right: 4px; border: 1px solid #333; background-color: #ffe; width: 172px; padding: 0; z-index: 10000;' +
    '-webkit-border-radius: 7px; -webkit-box-shadow: 0 2px 3px #333; -moz-box-shadow: 0 2px 3px #333; -moz-border-radius: 7px; overflow: hidden;';

  var headerStyles = 'margin: 0; padding: 0; padding-bottom: 2px; font: 12px arial; background-color: #d3d3d3;' + 
    'border-bottom: 1px solid #313131; -webkit-border-top-right-radius: 7px; -webkit-border-top-left-radius: 7px; -moz-border-radius-topright: 7px; -moz-border-radius-topleft: 7px;';

  var urlsOfType = {
    images: filterUrls(urls, IMAGE_TYPES),
    video: filterUrls(urls, VIDEO_TYPES),
    audio: filterUrls(urls, AUDIO_TYPES),
    documents: filterUrls(urls, DOCUMENT_TYPES)
  }

  var html =
     '<div style="' + containerStyles + '">' +
     '   <p style="' + headerStyles + '"><img style="margin: 3px 2px; margin-bottom: -3px;" src="http://github.com/iamjwc/magnetize/raw/master/lime.gif" alt="lime" /><a style="color: #2152a6;" href="' + generateMagnetUrl(urls) +  '">Download all files (' + urls.length + ')</a></p>';

  var types = ["audio", "video", "images", "documents"];
  for(var i = 0; i < types.length; ++i) {
    console.log(urlsOfType[types[i]]);
    if(urlsOfType[types[i]].length > 0) {
      html += '<p style="margin: 0; padding-top: 2px; margin-left: 18px;font: 12px arial;"><a style="color: #2152a6;" href="' + generateMagnetUrl(urlsOfType[types[i]]) + '">Download only ' + types[i] + ' (' + urlsOfType[types[i]].length + ')</a></p>';
    }
  }
  html += '</div>';


  //var html = '<div style="background: white; position: fixed; z-index: 1000; top: 0; right: 0; width: 140px; height: 14px">';
  //html += '<a href="' + link + '">Download all (' + count + ')</a>';
  //html += "</div>";
  document.body.innerHTML += html;
}

function extension(url) {
  return url.substr(url.lastIndexOf('.') + 1);
}

function isWhiteListed(url) {
  var ext = extension(url);
  return
    ext in AUDIO_TYPES ||
    ext in IMAGE_TYPES ||
    ext in VIDEO_TYPES ||
    ext in DOCUMENT_TYPES;
}

function isSupportedLink(a) {
  return isSupported(a.href.toLowerCase());
}

function isSupported(url) {
  // don't handle urls with query strings or javascript calls or
  // magnet links
  if(url.indexOf('?') != -1 || url.indexOf('javascript:') == 0 || url.indexOf('magnet:?') == 0) {
    return false
  } else {
    return isWhiteListed(url);
  }
}

function isImage(img) {
  var src = img.src.toLowerCase();
  return extension(src) in IMAGE_TYPES;
};

function rewriteLinks(links) {
  for (var i = 0; i < links.length; i++) {
    var a = links[i];
    var href = absoulutize(a.href);
    a.setAttribute('href', "magnet:?xs=" + href);
  }
}

function urlsFromLinks(links) {
  var urls = [];
  for (var i = 0; i < links.length; i++) {
    var a = links[i];
    var href = absoulutize(a.href);
    urls.push(href);
  }

  return urls;
}

function urlsFromImages(images) {
  var urls = [];
  for (var i = 0; i < images.length; i++) {
    urls.push(absoulutize(images[i].src))
  }

  return urls;
}

AUDIO_TYPES    = { 'mp3':'' };
IMAGE_TYPES    = { 'jpeg':'', 'jpg':'', 'png':'', 'gif':'' };
VIDEO_TYPES    = { 'flv':'' };
DOCUMENT_TYPES = { 'pdf':'', 'doc':'', 'docx': '', 'odt':'', 'txt':'' };

function filterUrls(urls, filter) {
  var returnUrls = [];

  for(var i = 0; i < urls.length; ++i) {
    if(extension(urls[i]) in filter) {
      returnUrls.push(urls[i]);
    }
  }

  return returnUrls;
}

function generateMagnetUrl(urls) {
  var magnetUrl = "magnet:?";

  for(var i = 0; i < urls.length; ++i) {
    magnetUrl += "&xs." + i + "=" + urls[i];
  }

  return magnetUrl;
}

(function() {
  var supportedLinks = getMatchingElements("a", null, isSupportedLink);
  var linkUrls = urlsFromLinks(supportedLinks);
  rewriteLinks(supportedLinks)

  var images = getMatchingElements("img", null, isImage);
  var imgUrls = urlsFromImages(images)

  var urls = linkUrls.concat(imgUrls);

  console.log(urls);
  if (urls.length > 0) {
    createDownloadLinks(urls);
  }
})();

