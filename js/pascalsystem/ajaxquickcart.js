/**
 * Pascal System AjaxQuickCart
 * 
 * @category   PSystem
 * @package    PSystem_AjaxQuickCart
 * @author     Pascal System <info@pascalsystem.pl>
 * @version    1.0.2
 * @copyright  Copyright (c) 2013-2025 Pascal System
 */

PS.AjaxQuickCart = {
    initView: function(selector, url) {
        PS.onload(function() {
            var els = $$(selector);
            for (var i = 0; i < els.length; i++) {
                els[i]._ajaxUrl = url;
                els[i].onclick = PS.AjaxQuickCart.clickViewCart;
            }
        });
    },

    initQuick: function(conf) {
        PS.onload(function() {
            var els;
            var i;
            els = $$(conf.single.selector);
            for (i = 0; i < els.length; i++) {
                if (typeof els[i]._psquick != 'undefined')
                    continue;
                els[i]._psquick = new PS.AjaxQuickCart.AddToCart(els[i], 'single', conf);
            }
            els = $$(conf.list.selector);
            for (i = 0; i < els.length; i++) {
                if (typeof els[i]._psquick != 'undefined')
                    continue;
                els[i]._psquick = new PS.AjaxQuickCart.AddToCart(els[i], 'list', conf);
            }
        });
    },

    initLayerQuick: function(selector) {
        var els = $$(selector);
        var conf = { 'single': { 'selector': selector } };
        for (var i = 0; i < els.length; i++) {
            if (typeof els[i]._psquick != 'undefined')
                continue;
            els[i]._psquick = new PS.AjaxQuickCart.AddToCart(els[i], 'single', conf);
        }
    },

    refresh: function(url) {
        if (PS.AjaxQuickCart._fixDoubleRefresh)
            return;
        PS.AjaxQuickCart._fixDoubleRefresh = true;
        PS.ajax.call(url, {});
        setTimeout(function() { PS.AjaxQuickCart._fixDoubleRefresh = false; }, 100);
    },

    clickViewCart: function() {
        if (typeof this._ajaxUrl == 'undefined')
            return true;

        toggleCart(true);

        PS.layer.ajax(this._ajaxUrl, { 'content': 'content' });
        return false;
    },

    updateCart: function(itemId, qty) {
        var url = Mage.baseUrl + 'ajaxquickcart/viewcart/updatecart'; // Use Mage.baseUrl for better compatibility
        
        // Create parameters object with form key
        var parameters = {
            form_key: FORM_KEY // Global form key variable from OpenMage
        };
        
        // Create cart object in the expected format
        parameters.cart = {};
        parameters.cart[itemId] = { qty: qty };
        
        new Ajax.Request(url, {
            method: 'post',
            parameters: parameters,
            onSuccess: function(response) {
                try {
                    var result = response.responseJSON;
                    if (result && result.status === 'success') {
                        console.log(result.message);
                    } else {
                        console.warn(result && result.message ? result.message : 'Error updating cart');
                    }
                } catch(e) {
                    console.error('Invalid response format');
                }
            },
            onFailure: function() {
                console.error('Failed to update cart. Please try again.');
            }
        });
    }
};

PS.AjaxQuickCart.AddToCart = function(el, type, conf) {
    if (typeof el.onclick == 'function') {
        el._orginalStringOnClick = el.getAttribute('onclick');
        if (typeof el._orginalStringOnClick == 'function')
            el._orginalStringOnClick = el._orginalStringOnClick.toString();
        el._psajaxonclick = el.onclick;
    }
    el.onclick = function() {
        if (this._psquick.actionClick())
            return false;
        return el._psajaxonclick ? el._psajaxonclick() : true;
    }
    this._element = el;
    this._type = type;
    this._conf = conf;
};

PS.AjaxQuickCart.AddToCart.prototype.actionClick = function() {
    if (this._type == 'single') {
        return this.actionClickSingle();
    }
    var url = this.getUrl();
    if (!url) return false;
    
    // Trigger the slide-in effect
    console.log("Showing cart");
    if (typeof jQuery !== 'undefined') {
        jQuery('.flex-container .cart-header').addClass('active'); // Slide in the cart
    }
    
    const cartOverlay = document.querySelector('.cart-overlay'); // Find overlay
    document.body.classList.add('push-body');
    if (cartOverlay) {
        cartOverlay.classList.add('show'); // Show the overlay
    }

    PS.layer.ajax(url, { 'content': 'content' });
    return true;
};

PS.AjaxQuickCart.AddToCart.prototype.closeCart = function() {
    console.log("Hiding cart");
    if (typeof jQuery !== 'undefined') {
        jQuery('.flex-container .cart-header').removeClass('active'); // Slide out the cart
    }
    console.log("Hiding overlay");

    const cartOverlay = document.querySelector('.cart-overlay');
    if (cartOverlay) {
        cartOverlay.classList.remove('show'); // Hide overlay
    }
    document.body.classList.remove('push-body');  // Remove "push-body" class from body
    PS.layer.manager.close(); // Hide cart
};

PS.AjaxQuickCart.AddToCart.submitAddProductToLayer = function() {
    var form = document.getElementById('product_addtocart_form');
    if (!form) {
        return this._psajaxquickcart ? this._psajaxquickcart() : false;
    }
    
    var varienForm = new VarienForm('product_addtocart_form');
    if (!varienForm.validator.validate())
        return false;
        
    // Add form key if not present
    var formKeyElement = form.querySelector('input[name="form_key"]');
    if (!formKeyElement && typeof FORM_KEY !== 'undefined') {
        formKeyElement = document.createElement('input');
        formKeyElement.type = 'hidden';
        formKeyElement.name = 'form_key';
        formKeyElement.value = FORM_KEY;
        form.appendChild(formKeyElement);
    }
    
    var methodSend = form.getAttribute('method');
    var url = form.getAttribute('action');
    var els = Form.getElements(form);
    var postData = '';
    for (var i = 0; i < els.length; i++) {
        if (postData)
            postData += '&';
        if (!els[i].name)
            continue;
        postData += els[i].name.toString() + '=' + encodeURIComponent(els[i].value.toString());
    }
    url += (url.indexOf('?') < 0) ? '?' : '&';
    url += postData;
    if (typeof PS.layer.manager.content != 'undefined') {
        PS.layer.manager.close();
    }
    PS.layer.ajax(url, { 'content': 'content' });
    return false;
};

PS.AjaxQuickCart.AddToCart.prototype.actionClickSingle = function() {
    if (typeof productAddToCartForm == 'undefined') {
        PS.AjaxQuickCart.AddToCart.submitAddProductToLayer();
        return false;
    }
    if (typeof productAddToCartForm._psajaxquickcart != 'undefined') {
        productAddToCartForm.submit();
        return true;
    }
    productAddToCartForm._psajaxquickcart = productAddToCartForm.submit;
    productAddToCartForm.submit = PS.AjaxQuickCart.AddToCart.submitAddProductToLayer;
    productAddToCartForm.submit();
    return true;
};

PS.AjaxQuickCart.AddToCart.prototype.getUrl = function() {
    if (typeof this._url == 'undefined') {
        var att = this._element._orginalStringOnClick;
        if (att) {
            if (this._conf[this._type].match) {
                this._url = false;
                var splitData = this._conf[this._type].match.toString().split('###URL###');
                if (splitData.length == 2) {
                    var parts = att.toString().split(splitData[0]);
                    if (parts.length > 1) {
                        var lastParts = parts[1].toString().split(splitData[1]);
                        var lastUrlPart = lastParts[0].toString();
                        if (lastUrlPart) {
                            this._url = lastUrlPart;
                        }
                    }
                }
            } else {
                this._url = att;
            }
        } else {
            this._url = false;
        }
        
        if (!this._url) {
            return false;
        }
        
        this._url = this._url.toString();
        if (this._url.indexOf('?') < 0)
            this._url += '?';
        else
            this._url += '&';
        this._url += 'ajaxquickcartoption=1';
    }
    return this._url;
};

PS.AjaxQuickCart._fixDoubleRefresh = false;

// Global function for toggling cart state
function toggleCart(open) {
    var pageWrapper = document.querySelector('#root-wrapper'); // Your wrapper selector
    var cartOverlay = document.querySelector('.cart-overlay');

    if (open) {
        document.body.classList.add('push-body'); // Add class for push effect
        if (cartOverlay) {
            cartOverlay.classList.add('show'); // Show overlay
        }
        // Fire custom event
        if (typeof Event === 'function') {
            document.dispatchEvent(new Event('ajaxquickcart:opened'));
        } else {
            // For IE compatibility
            var event = document.createEvent('Event');
            event.initEvent('ajaxquickcart:opened', true, true);
            document.dispatchEvent(event);
        }
    } else {
        document.body.classList.remove('push-body'); // Remove class
        if (cartOverlay) {
            cartOverlay.classList.remove('show'); // Hide overlay
        }
        // Fire custom event
        if (typeof Event === 'function') {
            document.dispatchEvent(new Event('ajaxquickcart:closed'));
        } else {
            // For IE compatibility
            var event = document.createEvent('Event');
            event.initEvent('ajaxquickcart:closed', true, true);
            document.dispatchEvent(event);
        }
    }
}

// Set up event listeners and functionality when DOM is ready
document.observe('dom:loaded', function() {
    // Handle quantity input changes
    $$('.input-quantity').each(function(input) {
        input.observe('change', function(event) {
            var itemId = input.readAttribute('data-item-id');
            var qty = parseFloat(input.value) || 1;
            PS.AjaxQuickCart.updateCart(itemId, qty);
        });
    });

    // Handle quantity adjustment buttons
    $$('.btn-quantity').each(function(button) {
        button.observe('click', function(event) {
            var input = button.up().select('.input-quantity')[0];
            if (!input) return;
            
            var itemId = input.readAttribute('data-item-id');
            var oldValue = parseFloat(input.value) || 1;
            var newValue = oldValue;

            if (button.hasClassName('plus')) {
                newValue = oldValue + 1;
            } else if (button.hasClassName('minus')) {
                newValue = Math.max(1, oldValue - 1);
            }

            input.value = newValue;
            PS.AjaxQuickCart.updateCart(itemId, newValue);
        });
    });

    // Extend PS.layer.manager.close to toggle cart state
    if (typeof PS !== 'undefined' && PS.layer && PS.layer.manager) {
        var originalCloseFunction = PS.layer.manager.close;
        PS.layer.manager.close = function() {
            originalCloseFunction.apply(this, arguments); // Call original function
            toggleCart(false); // Toggle cart state
        };
    }

    // Prevent page scrolling when cart is open
    document.addEventListener('touchmove', function(event) {
        if (document.body.classList.contains('push-body')) {
            event.preventDefault();
        }
    }, { passive: false });

    // Register custom events
    document.observe('ajaxquickcart:open', function() {
        toggleCart(true);
    });

    document.observe('ajaxquickcart:close', function() {
        toggleCart(false);
    });
    
    // Handle close button clicks
    if (typeof jQuery !== 'undefined') {
        jQuery(document).on('click', '.ps-col-icon', function() {
            toggleCart(false);
        });
    } else {
        // Fallback to Prototype for click handling
        document.on('click', '.ps-col-icon', function(event, element) {
            toggleCart(false);
        });
    }
});
