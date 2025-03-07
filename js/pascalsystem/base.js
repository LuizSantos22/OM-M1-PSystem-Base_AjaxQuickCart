/**
 * PascalSystem Function
 */
var PS = {
    onload: function(func) {
        if (typeof this._domLoadedFunction === 'undefined') {
            this._domLoadedFunction = [];
        }
        this._domLoadedFunction.push(func);
        document.observe("dom:loaded", this._onload.bind(this));
    },
    substr: function(strVal, startIndex, lengthSubstring) {
        strVal = strVal.toString();
        if (typeof lengthSubstring === 'undefined') lengthSubstring = strVal.length;
        return strVal.substr(startIndex, lengthSubstring);
    },
    evalJsOnContent: function(content) {
        if (typeof content === 'string') {
            content = document.getElementById(content);
        }
        if (!content) return;

        $A(content.getElementsByTagName('script')).each(script => {
            if (script.src) {
                const externalScript = document.createElement('script');
                externalScript.src = script.src;
                document.head.appendChild(externalScript);
            } else {
                try {
                    eval(script.innerHTML);
                } catch (e) {
                    console.error('Script evaluation failed:', e);
                }
            }
        });
    },
    overlayElement: function(element) {
        element = $(element);
        if (!element) return;

        element._psoverlay = new Element('div', {
            'class': 'pascalsystem-overlay ' + 
                (element.className ? 'pascalsystem-' + element.className.split(' ').join(' pascalsystem-') : '') +
                (element.id ? ' pascalsystem-' + element.id : '')
        });

        element._psoverlay.setStyle({
            display: 'none',
            position: 'absolute',
            width: element.getWidth() + 'px',
            height: element.getHeight() + 'px'
        });

        element.insert({ top: element._psoverlay });
        element._psoverlay.show();
        return true;
    },
    unOverlayElement: function(element) {
        element = $(element);
        if (!element || !element._psoverlay) return;
        element._psoverlay.remove();
        element._psoverlay = null;
        return true;
    },
    eachFunc: function(selector, funcRef) {
        $$(selector).each(funcRef);
    },
    extendConfig: function(baseConfObj, config) {
        Object.keys(config).each(key => {
            if (typeof config[key] === 'object' && !Array.isArray(config[key])) {
                this.extendConfig(baseConfObj[key], config[key]);
            } else {
                baseConfObj[key] = config[key];
            }
        });
    },
    removeCurrentElement: function(el) {
        setTimeout(() => el.remove(), 100);
    },
    getCacheKey: function(params) {
        return Object.keys(params).map(key => {
            const val = params[key];
            return `${key}:${typeof val}:${Array.isArray(val) ? val.join('|') : val}`;
        }).join('');
    },
    _onload: function() {
        if (!this._domLoadedFunction) return;
        this._domLoadedFunction.each(func => typeof func === 'function' && func());
    }
};

/**
 * PascalSystem Window function
 */
PS.window = {
    getWidth: () => window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth,
    getHeight: () => window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight,
    getScrollX: () => window.pageXOffset || document.documentElement.scrollLeft || document.body.scrollLeft,
    getScrollY: () => window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop,
    getDocumentWidth: () => Math.max(
        document.documentElement.scrollWidth, document.body.scrollWidth,
        document.documentElement.offsetWidth, document.body.offsetWidth,
        document.documentElement.clientWidth, document.body.clientWidth
    ),
    getDocumentHeight: () => Math.max(
        document.documentElement.scrollHeight, document.body.scrollHeight,
        document.documentElement.offsetHeight, document.body.offsetHeight,
        document.documentElement.clientHeight, document.body.clientHeight
    )
};

/**
 * PascalSystem Layer function
 */
PS.layer = function(identifier) {
    this._container = $(`ps-${identifier}`) || new Element('div', {
        id: `ps-${identifier}`,
        style: 'display: none; position: absolute; left: 0; top: 0;'
    }).update(new Element('div', { id: `pshtml-${identifier}` })).appendTo(document.body);
};

PS.layer.prototype = {
    setClass: function(className) {
        this._container.className = className;
        return this;
    },
    fullScreen: function() {
        this._container.setStyle({
            width: PS.window.getDocumentWidth() + 'px',
            height: PS.window.getDocumentHeight() + 'px',
            display: 'block'
        });
    },
    center: function() {
        const posX = PS.window.getScrollX() + Math.round(PS.window.getWidth() / 2);
        const posY = PS.window.getScrollY() + Math.round(PS.window.getHeight() / 2);
        const elDims = this._container.getDimensions();
        
        this._container.setStyle({
            left: (posX - Math.round(elDims.width / 2)) + 'px',
            top: (posY - Math.round(elDims.height / 2)) + 'px',
            display: 'block'
        });
    },
    hide: function() {
        this._container.down('div').update();
        this._container.hide();
    },
    isHide: function() {
        return this._container.getStyle('display') === 'none';
    }
};

PS.layer.ajax = function(url, blocks, methodForm, postData, specialFunction, cacheOn) {
    if (window._PSLayerAjax) return false;
    window._PSLayerAjax = true;

    postData = postData || {};
    postData.form_key = FORM_KEY;

    const manager = PS.layer.manager();
    manager.background.fullScreen();
    manager.loader.center();

    const params = Object.assign({}, blocks).inject({}, (acc, [key, value]) => {
        acc[`pascalsystem${key}`] = value;
        return acc;
    });

    const ajaxOptions = {
        method: methodForm || 'GET',
        parameters: params,
        postBody: Object.toQueryString(postData),
        requestHeaders: { 'X-Requested-With': 'XMLHttpRequest' },
        onSuccess: transport => {
            try {
                const data = transport.responseJSON || JSON.parse(transport.responseText);
                specialFunction(data, transport);
            } catch (e) {
                console.error('JSON parsing failed:', e);
            } finally {
                window._PSLayerAjax = false;
            }
        },
        onFailure: () => window._PSLayerAjax = false
    };

    if (cacheOn) {
        const cacheKey = PS.getCacheKey({ url, params, postData });
        if (window._PSAjaxCacheData?.[cacheKey]) {
            specialFunction(window._PSAjaxCacheData[cacheKey]);
            window._PSLayerAjax = false;
            return;
        }
        ajaxOptions.onSuccess = transport => {
            window._PSAjaxCacheData[cacheKey] = transport.responseText;
            ajaxOptions.onSuccess(transport);
        };
    }

    url = url.replace(/^http:/, 'https:');
    new Ajax.Request(url, ajaxOptions);
};

PS.layer.manager = function() {
    if (!this._manager) {
        this._manager = {
            background: new PS.layer('overlay').setClass('pascalsystem-overlay'),
            loader: new PS.layer('loader').setClass('pascalsystem-loader'),
            content: new PS.layer('content').setClass('pascalsystem-content')
        };
        this._manager.background._container.observe('click', this.close);
    }
    return this._manager;
};

PS.layer.manager.close = function() {
    if (this._manager) {
        this._manager.background.hide();
        this._manager.loader.hide();
        this._manager.content.hide();
    }
};

/**
 * PascalSystem Ajax function
 */
PS.ajax = {
    call: function(url, blocks) {
        const params = Object.assign({ form_key: FORM_KEY }, blocks).inject({}, (acc, [key, value]) => {
            acc[`pascalsystem${key}`] = value;
            return acc;
        });

        url = url.replace(/^http:/, 'https:');
        
        new Ajax.Request(url, {
            method: 'GET',
            parameters: params,
            onSuccess: transport => {
                try {
                    const data = transport.responseJSON || JSON.parse(transport.responseText);
                    Object.entries(data).each(([blockName, blockData]) => {
                        const [selector, replaceElement] = blockData.selector.split('|');
                        const elements = $$(selector);
                        
                        elements.each(element => {
                            if (replaceElement) {
                                const temp = new Element('div').update(blockData.html);
                                const newElement = temp.down(replaceElement);
                                if (newElement) {
                                    element.replace(newElement);
                                    PS.evalJsOnContent(newElement);
                                }
                            } else {
                                element.update(blockData.html);
                                PS.evalJsOnContent(element);
                            }
                        });
                    });
                    PS._onload();
                } catch (e) {
                    console.error('JSON parsing failed:', e);
                }
            }
        });
    }
};

/**
 * PascalSystem Catalog Quick View Image
 */
PS.catalogQuickViewImage = function(selector = 'a.product-image') {
    $$(selector).each(element => {
        element.observe('click', event => {
            event.preventDefault();
            
            PS.layer.ajax(element.href, {'product.info.media': 'media'}, 'GET', {}, (data, transport) => {
                if (!data['product.info.media']) return PS.layer.manager.close();

                const srcMatch = data['product.info.media'].html.match(/id="image"\s+src="([^"]+)"/);
                if (!srcMatch) return PS.layer.manager.close();

                const img = new Image();
                img.onload = function() {
                    const container = new Element('div', { 'class': 'pascalsystem-content-layerimage' });
                    container.appendChild(this);
                    container.observe('click', () => PS.layer.manager.close());
                    
                    const manager = PS.layer.manager();
                    manager.content._container.down('div').update(container);
                    manager.loader.hide();
                    manager.content.center();
                };
                img.src = srcMatch[1];
                img.style.visibility = 'hidden';
            });
        });
    });
};

// Security enhancements
function sanitizeHTML(str) {
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
}

// Initialize components
document.observe("dom:loaded", () => {
    PS.catalogQuickViewImage();
});
