/**
 PascalSystem Function
*/
var PS = {
	onload : function(func) {
		if (typeof this._domLoadedFunction == 'undefined')
			PS._domLoadedFunction = new Array();
		PS._domLoadedFunction.push(func);
		document.observe("dom:loaded", PS._onload);
	},
	substr : function(strVal, startIndex, lengthSubstring) {
		strVal = strVal.toString();
		if (typeof lengthSubstring == 'undefined')
			lengthSubstring = false;
		if (typeof strVal.substr == 'function') {
			if (lengthSubstring)
				return strVal.substr(startIndex, lengthSubstring);
			return strVal.substr(startIndex);
		}
		var strLen = strVal.length;
		if (strLen<startIndex)
			return '';
		var buildStr = '';
		for (var i=startIndex;i<strLen;i++) {
			if (i>startIndex+lengthSubstring)
				return buildStr;
			buildStr+= strVal[i];
		}
		return buildStr;
	},
	evalJsOnContent : function(content) {
		if (typeof content == 'string')
			content = document.getElementById(content);
		if (!content) return;
		var scripts = content.getElementsByTagName('script');
		for (var i=0;i<scripts.length;i++) {
			eval(scripts[i].innerHTML);
		}
	},
	overlayElement : function(element) {
		if (typeof element == 'string')
			element = document.getElementById(element);
		if (!element) return;
		element._psoverlay = document.createElement('div');
		element._psoverlay.className = 'pascalsystem-overlay';
		if (element.className && element.className.toString().length>0) {
			element._psoverlay.className+= ' pascalsystem-'+element.className.toString().split(' ').join(' pascalsystem-');
		}
		if (element.id && element.id.toString().length>0) {
			element._psoverlay.id+= 'pascalsystem-'+element.id.toString();
		}
		element._psoverlay.style.display = 'none';
		element._psoverlay.style.position = 'absolute';
		var temps = element.getElementsByTagName('*');
		if (temps.length) {
			element.insertBefore(element._psoverlay, temps[0]);
		} else {
			element.appendChild(element._psoverlay);
		}
		var dimm = $(element).getDimensions();
		element._psoverlay.style.width = dimm.width.toString()+'px';
		element._psoverlay.style.height = dimm.height.toString()+'px';
		element._psoverlay.style.display = 'block';
		return true;
	},
	unOverlayElement : function(element) {
		return;
		if (typeof element == 'string')
			element = document.getElementById(element);
		if (!element) return;
		if (typeof element._psoverlay == 'undefined') return;
		element._psoverlay.style.display = 'none';
		element._psoverlay.parentNode.removeChild(element._psoverlay);
		element._psoverlay = false;
		return true;
	},
	eachFunc : function(selector, funcRef) {
		if (typeof selector == 'string') {
			selector = $$(selector);
		}
		for (var i=0;i<selector.length;i++) {
			if (typeof funcRef == 'string') {
				selector[i].funcRef();
			} else {
				funcRef(selector[i]);
			}
		}
	},
	extendConfig : function(baseConfObj, config) {
		for (var key in config) {
			if (typeof baseConfObj[key] == 'undefined') {
				baseConfObj[key] = config[key];
				continue;
			}
			if ((typeof config[key] == 'object') && (typeof config[key].length == 'undefined')) {
				PS.extendConfig(baseConfObj[key], config[key]);
				continue;
			}
			baseConfObj[key] = config[key];
		}
	},
	removeCurrentElement : function(el) {
		setTimeout(function(){el.parentNode.removeChild(el);},100);
	},
	getCacheKey : function(params) {
		var cacheKey = '';
		var cKType;
		for (var key in params) {
			cKType = typeof params[key];
			cacheKey+=key+':'+cKType+':';
			if (cKType == 'object') {
				cacheKey+= PS.getCacheKey(params[key]);
			} else {
				cacheKey+= params[key].toString();
			}
		}
		return cacheKey;
	},
	_onload : function() {
		if (typeof PS._domLoadedFunction == 'undefined')
			return;
		var funcRef;
		for (var i=0;i<PS._domLoadedFunction.length;i++) {
			funcRef = PS._domLoadedFunction[i];
			if (typeof funcRef == 'function') {
				funcRef();
			}
		}
	}
};
/**
 * PascalSystem Window function
 */
PS.window = {
	getWidth : function() {
		var myWidth = 0;
		if (typeof(window.innerWidth) == 'number') {
			myWidth = window.innerWidth;
		} else if (document.documentElement && document.documentElement.clientWidth) {
			myWidth = document.documentElement.clientWidth;
		} else if (document.body && document.body.clientWidth) {
			myWidth = document.body.clientWidth;
		}
		return myWidth;
	},
	getHeight : function() {
		var myHeight = 0;
		if (typeof(window.innerHeight) == 'number') {
			myHeight = window.innerHeight;
		} else if (document.documentElement && document.documentElement.clientHeight) {
			myHeight = document.documentElement.clientHeight;
		} else if (document.body && document.body.clientHeight) {
			myHeight = document.body.clientHeight;
		}
		return myHeight;
	},
	getScrollX : function() {
		var scrOfX = 0;
		if(typeof(window.pageXOffset)=='number') {
			scrOfX = window.pageXOffset;
		} else if(document.body && document.body.scrollLeft) {
			scrOfX = document.body.scrollLeft;
		} else if(document.documentElement && document.documentElement.scrollLeft) {
			scrOfX = document.documentElement.scrollLeft;
		}
		return scrOfX;
	},
	getScrollY : function() {
		var scrOfY = 0;
		if(typeof(window.pageYOffset)=='number') {
			scrOfY = window.pageYOffset;
		} else if(document.body && document.body.scrollTop) {
			scrOfY = document.body.scrollTop;
		} else if(document.documentElement && document.documentElement.scrollTop) {
			scrOfY = document.documentElement.scrollTop;
		}
		return scrOfY;
	},
	getDocumentWidth : function() {
		if (document.documentElement && document.documentElement.scrollWidth)
			return document.documentElement.scrollWidth;
		else if (document.body && document.body.scrollWidth)
			return document.body.scrollWidth;
		var D = document;
		return Math.max(
			Math.max(D.body.scrollWidth, D.documentElement.scrollWidth),
			Math.max(D.body.offsetWidth, D.documentElement.offsetWidth),
			Math.max(D.body.clientWidth, D.documentElement.clientWidth)
		);
	},
	getDocumentHeight : function() {
		if (document.documentElement && document.documentElement.scrollHeight)
			return document.documentElement.scrollHeight;
		else if (document.body && document.body.scrollHeight)
			return document.body.scrollHeight;
		var D = document;
		return Math.max(
			Math.max(D.body.scrollHeight, D.documentElement.scrollHeight),
			Math.max(D.body.offsetHeight, D.documentElement.offsetHeight),
			Math.max(D.body.clientHeight, D.documentElement.clientHeight)
		);
	}
};
/**
 * PascalSystem Layer function
 */
PS.layer = function(identifier) {
	this._container = document.getElementById('ps-'+identifier);
	if (!this._container) {
		this._container = document.createElement('div');
		this._container.id = 'ps-'+identifier;
		this._container.style.display = 'none';
		this._container.style.position = 'absolute';
		this._container.style.left = '0px';
		this._container.style.top = '0px';
		this._html = document.createElement('div');
		this._html.id = 'pshtml-'+identifier;
		document.body.appendChild(this._container);
		this._container.appendChild(this._html);
	}
}
PS.layer.prototype.setClass = function(className) {
	this._container.className = className;
	return this;
}
PS.layer.prototype.fullScreen = function() {
	this._container.style.width = PS.window.getDocumentWidth().toString()+'px';
	this._container.style.height = PS.window.getDocumentHeight().toString()+'px';
	this._container.style.display = 'block';
}
PS.layer.prototype.center = function() {
	var posX = (PS.window.getScrollX() + Math.round(PS.window.getWidth() / 2));
	var posY = (PS.window.getScrollY() + Math.round(PS.window.getHeight() / 2));
	var elWidth = $(this._container).getWidth();
	var elHeight = $(this._container).getHeight();
	this._container.style.left = (posX-Math.round(elWidth/2)).toString()+'px';
	this._container.style.top = (posY-Math.round(elHeight/2)).toString()+'px';
	this._container.style.display = 'block';
}
PS.layer.prototype.hide = function() {
	this._html.innerHTML = '';
	this._container.style.display = 'none';
}
PS.layer.prototype.isHide = function() {
	return (this._container.style.display == 'none')?true:false;
}
PS.layer.ajax = function(url, blocks, methodForm, postData, specialFunction, cacheOn) {
    if ((typeof window._PSLayerAjax != 'undefined') && window._PSLayerAjax)
        return false;
    window._PSLayerAjax = true;
    if (typeof postData == 'undefined') postData = {};
    if (typeof blocks == 'undefined') blocks = {'content': 'content'};
    if (typeof methodForm == 'undefined') methodForm = 'GET';
    var params = {};
    for (var key in blocks) {
        params['pascalsystem' + key] = blocks[key];
    }
    var m = PS.layer.manager();
    m.background.fullScreen();
    m.loader.center();
    if (typeof specialFunction != 'function') {
        specialFunction = function(transport) {
            var response = transport.responseText || "";
            var data = eval('(' + response + ')');
            var m = PS.layer.manager();
            for (var key in data) {
                data[key]._html = document.createElement('div');
                data[key]._html.className = 'ps-' + data[key].selector;
                data[key]._html.innerHTML = data[key].html;
                m.content._html.appendChild(data[key]._html);
            }
            m.loader.hide();
            m.content.center();
            var scripts = m.content._html.getElementsByTagName('script');
            for (var i = 0; i < scripts.length; i++) {
                eval(scripts[i].innerHTML);
            }
        };
    }
    if (typeof window._PSAjaxCacheData == 'undefined') window._PSAjaxCacheData = {};
    var cacheKey = false;
    if ((typeof cacheOn != 'undefined') && cacheOn) {
        cacheKey = PS.getCacheKey({'url': url, 'params': params, 'postData': postData});
        if (typeof window._PSAjaxCacheData[cacheKey] != 'undefined') {
            window._PSLayerAjax = false;
            var m = PS.layer.manager();
            if (m.loader.isHide()) return;
            specialFunction(window._PSAjaxCacheData[cacheKey]);
            return;
        }
    }
    if ("https:" == document.location.protocol) {
        url = url.toString().replace('http://', 'https://');
    }
    var obj = new Ajax.Request(url, {
        method: methodForm,
        requestHeaders: params,
        data: postData,
        onSuccess: function(transport) {
            // Reset the AJAX loading flag
            window._PSLayerAjax = false;
            // Get the layer manager instance
            var m = PS.layer.manager();
            // If the loader is hidden, exit early
            if (m.loader.isHide()) return;
            // Cache the transport response for future use
            var el = this;
            window._PSAjaxCacheData[cacheKey] = transport;

            // Play the MP3 ringtone asynchronously using Base64 encoding
var base64Mp3 = "data:audio/mp3;base64,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"; 
var ringtone = new Audio(base64Mp3);
            ringtone.play().catch(error => {
                console.error("Error playing audio:", error);
                // Ensure this error does not disrupt the cart functionality
            });

            // Execute the specialFunction callback with the transport data
            specialFunction(transport, el);
        }
    });
};
PS.layer.manager = function() {
	if (typeof PS.layer.manager.background == 'undefined') {
		PS.layer.manager.background = new PS.layer('overlay');
		PS.layer.manager.background.setClass('pascalsystem-overlay');
		PS.layer.manager.background._container.onclick = function() {
			PS.layer.manager.close();
		}
	}
	if (typeof PS.layer.manager.loader == 'undefined') {
		PS.layer.manager.loader = new PS.layer('loader');
		PS.layer.manager.loader.setClass('pascalsystem-loader');
	}
	if (typeof PS.layer.manager.content == 'undefined') {
		PS.layer.manager.content = new PS.layer('content');
		PS.layer.manager.content.setClass('pascalsystem-content');
	}
	return PS.layer.manager;
}
PS.layer.manager.close = function() {
	if (!PS.layer.manager.loader.isHide()) return;
	if (typeof PS.layer.manager.background != 'undefined') {
		PS.layer.manager.background.hide();
	}
	if (typeof PS.layer.manager.loader != 'undefined') {
		PS.layer.manager.loader.hide();
	}
	if (typeof PS.layer.manager.content != 'undefined') {
		PS.layer.manager.content.hide();
	}
}
/**
 PascalSystem Ajax function
*/
PS.ajax = {
	call : function(url, blocks) {
		var isQuery = ((url.length>0) && (url[0]=='?') || (url.indexOf('?')>0))?true:false;
		var params = {};
		for (var key in blocks) {
			params['pascalsystem'+key] = blocks[key];
		}
		if ("https:" == document.location.protocol) {
			url = url.toString().replace('http://','https://');
		}
		var obj = new Ajax.Request(url,{
			method:'get',
			requestHeaders: params,
			onSuccess: function(transport){
				var response = transport.responseText || "";
				var data = eval('('+response+')');
				var selector;
				var html;
				var destEls;
				var regs;
				var replaceElement = false;
				var destEl; var srcEl;
				var temp;
				for (var blockName in data) {
					selector = data[blockName].selector;
					regs = selector.split('|');
					replaceElement = false;
					if (regs.length>1) {
						selector = regs[0];
						replaceElement = regs[1];
					}
					destEls = $$(selector);
					if (!destEls.length) continue;
					if (replaceElement) {
						destEls = $(destEls[0]).getElementsBySelector(replaceElement);
						if (!destEls.length) continue;
						temp = document.createElement('div');
						temp.innerHTML = data[blockName].html;
						srcEl = $(temp).getElementsBySelector(replaceElement);
						if (!srcEl.length) continue;
						srcEl = srcEl[0];
						destEls[0].style.display = 'none';
						destEls[0].parentNode.insertBefore(srcEl, destEls[0]);
						destEls[0].parentNode.removeChild(destEls[0]);
						temp = null;
						destEl = destEls[0];
					} else {
						destEl = destEls[0];
						//alert(data[blockName].html);
						destEl.innerHTML = data[blockName].html;
					}
					PS.evalJsOnContent(destEl);
				}
				PS._onload();
			}
		});
	}
};
/**
 * PascalSystem Catalog Quick View Image
 */
PS.catalogQuickViewImage = function(selector) {
	if (typeof selector == 'undefined')
		selector = 'a.product-image'
	var els = $$(selector);
	for (var i=0;i<els.length;i++) {
		els[i].onclick = function() {
			var href = this.href;
			PS.layer.ajax(href, {'product.info.media':'media'}, undefined, undefined, function(transport) {
				var response = transport.responseText || "";
				var data = eval('('+response+')');
				var key = 'product.info.media';
				
				if (typeof data[key] == 'undefined') {
					PS.layer.manager.close();
					return;
				}
				var Re = new RegExp('id\=\"image\" src\=\"([^\"]+)\"');
				var res = Re.exec(data[key].html);
				if (!res) {
					PS.layer.manager.close();
					return;
				}
				var srcImg = res[1];
				
				var imgPreload = new Image();
				imgPreload.__onload = function() {
					this.style.visibility = 'hidden';
					this.style.width = 'auto';
					this.style.height = 'auto';
					var m = PS.layer.manager();
					
					var el = this;
					this._width = (this.width)?this.width:$(el).getWidth();
					this._height = (this.height)?this.height:$(el).getHeight();
					
					if (!this._width || !this._height) {
						PS.removeCurrentElement(this);
						PS.layer.manager.close();
						return;
					}
					m.loader.hide();
					
					var borderContainer = document.createElement('div')
					borderContainer.className = 'pascalsystem-content-layerimage';
					borderContainer.appendChild(el);
					borderContainer.onclick = function() {
						PS.layer.manager.close();
					};
					m.content._html.appendChild(borderContainer);
					var winWidth = PS.window.getWidth();
					var winHeight = PS.window.getHeight();
					winWidth-=40;
					winHeight-=40;
					var scale = 1;
					var scaleWidth;
					var scaleHeight;
					scaleWidth = this._width;
					scaleHeight = this._height;
					if (scaleWidth > winWidth) {
						scale = scaleWidth / winWidth;
						scaleHeight = Math.round(scaleHeight/scale);
						scaleWidth = winWidth;
					}
					if (scaleHeight > winHeight) {
						scale = scaleHeight / winHeight;
						scaleWidth = Math.round(scaleWidth/scale);
						scaleHeight = winHeight;
					}
					this.style.width = scaleWidth.toString()+'px';
					this.style.height = scaleHeight.toString()+'px';
					this.style.visibility = 'visible';
					this.style.position = 'static';
					this.style.top = 'auto';
					this.style.left = 'auto';
					m.content.center();
				}
				imgPreload.src = srcImg;
				imgPreload.style.width='1px';
				imgPreload.style.height='1px';
				imgPreload.style.top='0px';
				imgPreload.style.left='0px';
				imgPreload.style.position='absolute';
				imgPreload.onload = setTimeout(function(){
					if ((typeof imgPreload._postAction != 'undefined') && imgPreload._postAction) return;
					imgPreload.__onload();
				},250);
				document.body.appendChild(imgPreload);
				if ($(imgPreload).getWidth() && $(imgPreload).getHeight()) {
					imgPreload._postAction = true;
					setTimeout(function(){
						imgPreload.__onload();
					},250);
				}
			}, true);
			return false;
		}
	}
}
PS.catalogQuickViewImage.init = function(selector) {
	if (typeof window._catalogQuickViewImageLoaded != 'undefined') {
		PS.catalogQuickViewImage(selector);
		return;
	}
	document.observe("dom:loaded", function() {
		PS.catalogQuickViewImage(selector);
		window._catalogQuickViewImageLoaded = true;
	});
}
