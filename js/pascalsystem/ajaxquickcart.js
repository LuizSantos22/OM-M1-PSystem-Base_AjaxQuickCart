PS.AjaxQuickCart = {
    initView: function (selector, url) {
        PS.onload(function () {
            var els = $$(selector);
            for (var i = 0; i < els.length; i++) {
                els[i]._ajaxUrl = url;
                els[i].onclick = PS.AjaxQuickCart.clickViewCart;
            }
        });
    },

    initQuick: function (conf) {
        PS.onload(function () {
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

    initLayerQuick: function (selector) {
        var els = $$(selector);
        var conf = { 'single': { 'selector': selector } };
        for (var i = 0; i < els.length; i++) {
            if (typeof els[i]._psquick != 'undefined')
                continue;
            els[i]._psquick = new PS.AjaxQuickCart.AddToCart(els[i], 'single', conf);
        }
    },

    refresh: function (url) {
        if (PS.AjaxQuickCart._fixDoubleRefresh)
            return;
        PS.AjaxQuickCart._fixDoubleRefresh = true;
        PS.ajax.call(url, {});
        setTimeout(function () { PS.AjaxQuickCart._fixDoubleRefresh = false; }, 100);
    },

    clickViewCart: function () {
        if (typeof this._ajaxUrl == 'undefined')
            return true;

        toggleCart(true);

        PS.layer.ajax(this._ajaxUrl, { 'content': 'content' });
        return false;
    },

    updateCart: function (itemId, qty) {
        var url = '/ajaxquickcart/viewcart/updatecart'; // URL para o controller
        new Ajax.Request(url, {
            method: 'post',
            parameters: {
                cart: {
                    [itemId]: { qty: qty }
                }
            },
            onSuccess: function (response) {
                var result = response.responseJSON;
                if (result.status === 'success') {
                    console.log(result.message);
                } else {
                    alert(result.message); // Exibe mensagem de erro para o usuário
                }
            },
            onFailure: function () {
                alert('Ocorreu um erro ao atualizar o carrinho. Por favor, tente novamente.');
            }
        });
    }
};

PS.AjaxQuickCart.AddToCart = function (el, type, conf) {
    if (typeof el.onclick == 'function') {
        el._orginalStringOnClick = el.getAttribute('onclick');
        if (typeof el._orginalStringOnClick == 'function')
            el._orginalStringOnClick = el._orginalStringOnClick.toString();
        el._psajaxonclick = el.onclick;
    }
    el.onclick = function () {
        if (this._psquick.actionClick())
            return false;
        return el._psajaxonclick();
    }
    this._element = el;
    this._type = type;
    this._conf = conf;
};

PS.AjaxQuickCart.AddToCart.prototype.actionClick = function () {
    if (this._type == 'single') {
        return this.actionClickSingle();
    }
    var url = this.getUrl();
    if (!url) return false;
    // Trigger the slide-in effect
    console.log("Showing cart");
    $('.flex-container .cart-header').addClass('active'); // Slide in the cart

    const cartOverlay = document.querySelector('.cart-overlay'); // Busca overlay
    document.body.classList.add('push-body');
    if (cartOverlay) {
        cartOverlay.classList.add('show'); // Show the overlay
    }

    PS.layer.ajax(url, { 'content': 'content' });
    return true;
};

PS.AjaxQuickCart.AddToCart.prototype.closeCart = function () {
    console.log("Hiding cart");
    $('.flex-container .cart-header').removeClass('active'); // Slide out the cart
    console.log("Hiding overlay");

    const cartOverlay = document.querySelector('.cart-overlay');
    if (cartOverlay) {
        cartOverlay.classList.remove('show'); // Oculta o  overlay
    }
    document.body.classList.remove('push-body');  //Remove a classe "push-body" do elemento <body>
    PS.layer.manager.close(); //Oculto cart

};

PS.AjaxQuickCart.AddToCart.submitAddProductToLayer = function () {
    var form = document.getElementById('product_addtocart_form');
    if (!form) {
        return this._psajaxquickcart();
    }
    var varienForm = new VarienForm('product_addtocart_form');
    if (!varienForm.validator.validate())
        return false;
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

PS.AjaxQuickCart.AddToCart.prototype.actionClickSingle = function () {
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

PS.AjaxQuickCart.AddToCart.prototype.getUrl = function () {
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

// Função para sincronizar as alterações de quantidade com o backend
document.observe('dom:loaded', function () {
    $$('.input-quantity').each(function (input) {
        input.observe('change', function (event) {
            var itemId = input.readAttribute('data-item-id');
            var qty = parseFloat(input.value) || 1;
            PS.AjaxQuickCart.updateCart(itemId, qty);
        });
    });

    $$('.btn-quantity').each(function (button) {
        button.observe('click', function (event) {
            var input = button.siblings('.input-quantity')[0];
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

    // Capture the existing close function and extend it
    const originalCloseFunction = PS.layer.manager.close;

    PS.layer.manager.close = function () {
        originalCloseFunction.apply(this, arguments); // Call the original function
        toggleCart(false); // Toggle the cart (remove class and hide overlay)
    };

    // Touch move prevent - Disable scroll page
    document.addEventListener('touchmove', function (event) {
        if (document.body.classList.contains('push-body')) {
            event.preventDefault();
        }
    }, { passive: false });

    // Adiciona uma função para abrir/fechar o carrinho (e para adicionar os efeitos)
    function toggleCart(open) {
        var pageWrapper = document.querySelector('#root-wrapper'); // Seletor do seu wrapper
        var cartOverlay = document.querySelector('.cart-overlay');

        if (!pageWrapper) {
            console.error('Page wrapper not found! Adjust the selector in ajaxquickcart.js');
            return;
        }

        if (open) {
            document.body.classList.add('push-body'); // Adiciona a classe para o "push effect"
            if (cartOverlay) {
                cartOverlay.classList.add('show'); // Show the overlay
            }
        } else {
            document.body.classList.remove('push-body'); // Remove a classe
            if (cartOverlay) {
                cartOverlay.classList.remove('show'); // Hide the overlay
            }
        }
    }

    // Capturar o evento de abertura do carrinho (AJAX)
    document.observe('ajaxquickcart:open', function () {
        toggleCart(true);
    });

    // Capturar o evento de fechamento do carrinho (AJAX ou clique)
    document.observe('ajaxquickcart:close', function () {
        toggleCart(false);
    });

    // Capturar o evento de fechamento do carrinho (AJAX ou clique)
    jQuery(document).on('click', '.ps-col-icon', function () {
        toggleCart(false);
    });

});
