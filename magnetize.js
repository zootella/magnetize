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
      url = location.substr(0, location.lastIndexOf('/') + 1) + url;
    }
  }
  url = encodeURIComponent(url);
  return url;
}

function createDownloadLinks(urls) {
  var containerStyles = 'position: fixed; top: 4px; font-weight: normal; right: 4px; border: 1px solid #333; background-color: #ffe; width: 190px; padding: 0; padding-bottom: 2px; z-index: 999990;' +
    '-webkit-border-radius: 7px; -webkit-box-shadow: 0 2px 3px #333; -moz-box-shadow: 0 2px 3px #333; -moz-border-radius: 7px; overflow: hidden;';

  var headerStyles = 'margin: 0; padding: 0; font-weight: normal; padding-bottom: 2px; font: 11px arial; background-color: #d3d3d3;' + 
    'border-bottom: 1px solid #313131; -webkit-border-top-right-radius: 7px; -webkit-border-top-left-radius: 7px; -moz-border-radius-topright: 7px; -moz-border-radius-topleft: 7px;';

  var urlsOfType = {
    Images: filterUrls(urls, IMAGE_TYPES),
    Video: filterUrls(urls, VIDEO_TYPES),
    Audio: filterUrls(urls, AUDIO_TYPES),
    Documents: filterUrls(urls, DOCUMENT_TYPES),
	Torrents: filterUrls(urls, TORRENT_TYPES)
  }

  var html =
     '<div style="' + containerStyles + '">' +
     '   <p style="' + headerStyles + '"><img style="margin: 3px 2px; margin-bottom: -3px;" src="http://github.com/iamjwc/magnetize/raw/master/lime.gif" alt="lime" /><a style="color: #2152a6; font-weight: normal;" href="' + generateMagnetUrl(urls) +  '">Download All Files (' + urls.length + ')</a></p>';

  var types = ["Audio", "Video", "Images", "Documents", "Torrents"];
  for(var i = 0; i < types.length; ++i) {
    if(urlsOfType[types[i]].length > 0) {
      html += '<p style="margin: 0; padding-top: 2px; margin-left: 18px;font: 11px arial; font-weight: normal;"><a style="color: #2152a6; font-weight: normal;" href="' + generateMagnetUrl(urlsOfType[types[i]]) + '">Download ' + types[i] + ' Only (' + urlsOfType[types[i]].length + ')</a></p>';
    }
  }
  html += '</div>';

  document.body.innerHTML += html;
}

function extension(url) {
  return url.toLowerCase().substr(url.lastIndexOf('.') + 1);
}

function isWhiteListed(url) {
  var ext = extension(url);
  return (ext in AUDIO_TYPES) ||
    (ext in IMAGE_TYPES) ||
    (ext in VIDEO_TYPES) ||
    (ext in DOCUMENT_TYPES ||
	 ext in TORRENT_TYPES);
}

function isSupportedLink(a) {
  return isSupported(a.href);
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
  var src = img.src;
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

function toTrueHash(s) {
  var hash = {};

  var items = s.split(' ');
  for(var i in items) {
    hash[items[i]] = true;
  }

  return hash;
}

AUDIO_TYPES    = toTrueHash('aif aifc aiff au fla flac kar lqt m4a med mid midi mod mp3 mpa ogg ra rmi rmj shn snd wav wma');
IMAGE_TYPES    = toTrueHash('bmp gif img jpe jpg jpeg png tif tiff');
VIDEO_TYPES    = toTrueHash('asf asx avi cdg dcr flv jve nsv ogm gt ram rm smi srt sub wmv');
DOCUMENT_TYPES = toTrueHash('pdf ps doc docx odt txt');
TORRENT_TYPES  = toTrueHash('torrent');

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

  if (urls.length > 0) {
    createDownloadLinks(urls);
  }
})();

