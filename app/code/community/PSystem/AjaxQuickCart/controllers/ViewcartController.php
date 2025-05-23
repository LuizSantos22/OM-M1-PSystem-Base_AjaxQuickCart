<?php
require_once Mage::getModuleDir('controllers', 'Mage_Checkout') . DS . 'CartController.php';

class PSystem_AjaxQuickCart_ViewcartController extends Mage_Checkout_CartController
{
    const LOG_FILE = 'pascal_ajaxquickcart.log';

    protected function _validateFormKey()
    {
        $session = Mage::getSingleton('core/session');
        if (!$session) {
            Mage::log('Core Session not available.', Zend_Log::ERR, self::LOG_FILE);
            return false;
        }

        $formKey = $this->getRequest()->getParam('form_key');
        if (!$formKey || $formKey !== $session->getFormKey()) {
            Mage::log("Form Key mismatch. Request: " . Mage::helper('core')->escapeHtml($formKey) . " | Session: " . $session->getFormKey(), Zend_Log::WARN, self::LOG_FILE);
            return false;
        }

        return true;
    }

    protected function _sendJson(array $response)
    {
        $this->getResponse()
            ->clearHeaders()
            ->setHeader('Content-Type', 'application/json', true)
            ->setBody(Mage::helper('core')->jsonEncode($response));
    }

    public function indexAction()
    {
        Mage::log('ViewcartController::indexAction triggered.', Zend_Log::DEBUG, self::LOG_FILE);
        $this->loadLayout()
             ->_initLayoutMessages('checkout/session')
             ->_initLayoutMessages('catalog/session');
        $this->renderLayout();
    }

    public function refreshAction()
    {
        Mage::log('ViewcartController::refreshAction triggered.', Zend_Log::DEBUG, self::LOG_FILE);
        $this->loadLayout();
        $block = $this->getLayout()->getBlock('ajax.response');

        if ($block instanceof PSystem_AjaxQuickCart_Block_Refresh_Response) {
            $this->getResponse()->setBody($block->toHtml());
        } else {
            Mage::log('ajax.response block not found or incorrect.', Zend_Log::WARN, self::LOG_FILE);
            $this->getResponse()->setBody('');
        }
    }

    public function updatecartAction()
    {
        Mage::log('ViewcartController::updatecartAction triggered.', Zend_Log::DEBUG, self::LOG_FILE);
        $response = ['status' => 'error', 'message' => '', 'grandTotal' => '', 'subtotal' => '', 'discountAmount' => ''];

        if (!$this->_validateFormKey()) {
            $response['message'] = $this->__('Invalid form key.');
            return $this->_sendJson($response);
        }

        try {
            $cart = $this->_getCart();
            $cartData = $this->getRequest()->getParam('cart');

            if (!is_array($cartData)) {
                Mage::log('Cart update failed: Invalid cart data format.', Zend_Log::WARN, self::LOG_FILE);
                $response['message'] = $this->__('Invalid cart data.');
                return $this->_sendJson($response);
            }

            $cart->updateItems($cartData)->save();
            Mage::log('Cart updated successfully.', Zend_Log::DEBUG, self::LOG_FILE);

            $quote = $cart->getQuote();
            $quote->getShippingAddress()->setCollectShippingRates(true);
            $quote->collectTotals()->save();

            Mage::getSingleton('checkout/session')->setCartWasUpdated(true);

            $discount = $quote->getSubtotal() - $quote->getSubtotalWithDiscount();

            $response['status'] = 'success';
            $response['message'] = $this->__('Shopping cart updated.');
            $response['grandTotal'] = Mage::helper('checkout')->formatPrice($quote->getGrandTotal());
            $response['subtotal'] = Mage::helper('checkout')->formatPrice($quote->getSubtotal());
            $response['discountAmount'] = $discount > 0.001 ? Mage::helper('checkout')->formatPrice(-$discount) : '';

        } catch (Mage_Core_Exception $e) {
            Mage::logException($e);
            $response['message'] = $e->getMessage();
        } catch (Exception $e) {
            Mage::logException($e);
            $response['message'] = $this->__('Cannot update shopping cart.');
        }

        $this->_sendJson($response);
    }

    public function applyCouponAction()
    {
        Mage::log('ViewcartController::applyCouponAction triggered.', Zend_Log::DEBUG, self::LOG_FILE);
        $response = ['status' => 'error', 'message' => '', 'grandTotal' => '', 'subtotal' => '', 'discountAmount' => ''];

        if (!$this->_validateFormKey()) {
            $response['message'] = $this->__('Invalid form key.');
            return $this->_sendJson($response);
        }

        $couponCode = trim((string)$this->getRequest()->getParam('coupon_code'));
        if (!$this->getRequest()->isPost() || $couponCode === '') {
            Mage::log('Invalid coupon submission.', Zend_Log::WARN, self::LOG_FILE);
            $response['message'] = $this->__('Coupon code is empty or request invalid.');
            return $this->_sendJson($response);
        }

        try {
            $quote = $this->_getCart()->getQuote();
            $currentCode = $quote->getCouponCode();

            if ($currentCode === $couponCode) {
                $response['status'] = 'success';
                $response['message'] = sprintf($this->__('Coupon "%s" is already applied.'), Mage::helper('core')->escapeHtml($couponCode));
            } else {
                $quote->getShippingAddress()->setCollectShippingRates(true);
                $quote->setCouponCode($couponCode)->collectTotals()->save();

                if ($quote->getCouponCode() === $couponCode) {
                    $response['status'] = 'success';
                    $response['message'] = sprintf($this->__('Coupon "%s" applied successfully.'), Mage::helper('core')->escapeHtml($couponCode));
                } else {
                    $response['message'] = sprintf($this->__('Coupon "%s" is not valid.'), Mage::helper('core')->escapeHtml($couponCode));
                }
            }

            $discount = $quote->getSubtotal() - $quote->getSubtotalWithDiscount();
            $response['grandTotal'] = Mage::helper('checkout')->formatPrice($quote->getGrandTotal());
            $response['subtotal'] = Mage::helper('checkout')->formatPrice($quote->getSubtotal());
            $response['discountAmount'] = $discount > 0.001 ? Mage::helper('checkout')->formatPrice(-$discount) : '';

        } catch (Mage_Core_Exception $e) {
            Mage::logException($e);
            $response['message'] = $e->getMessage();
        } catch (Exception $e) {
            Mage::logException($e);
            $response['message'] = $this->__('Cannot apply the coupon code.');
        }

        $this->_sendJson($response);
    }

    public function removeCouponAction()
    {
        Mage::log('ViewcartController::removeCouponAction triggered.', Zend_Log::DEBUG, self::LOG_FILE);
        $response = ['status' => 'error', 'message' => '', 'grandTotal' => '', 'subtotal' => '', 'discountAmount' => ''];

        if (!$this->_validateFormKey()) {
            $response['message'] = $this->__('Invalid form key.');
            return $this->_sendJson($response);
        }

        try {
            $quote = $this->_getCart()->getQuote();
            $quote->setCouponCode('')
                  ->collectTotals()
                  ->save();

            $discount = $quote->getSubtotal() - $quote->getSubtotalWithDiscount();

            $response['status'] = 'success';
            $response['message'] = $this->__('Coupon code removed.');
            $response['grandTotal'] = Mage::helper('checkout')->formatPrice($quote->getGrandTotal());
            $response['subtotal'] = Mage::helper('checkout')->formatPrice($quote->getSubtotal());
            $response['discountAmount'] = $discount > 0.001 ? Mage::helper('checkout')->formatPrice(-$discount) : '';

        } catch (Mage_Core_Exception $e) {
            Mage::logException($e);
            $response['message'] = $e->getMessage();
        } catch (Exception $e) {
            Mage::logException($e);
            $response['message'] = $this->__('Cannot remove the coupon code.');
        }

        $this->_sendJson($response);
    }

    public function removeItemAction()
    {
        Mage::log('ViewcartController::removeItemAction triggered.', Zend_Log::DEBUG, self::LOG_FILE);
        $response = ['status' => 'error', 'message' => '', 'grandTotal' => '', 'subtotal' => '', 'discountAmount' => ''];

        if (!$this->_validateFormKey()) {
            $response['message'] = $this->__('Invalid form key.');
            Mage::getSingleton('checkout/session')->addError($response['message']);
            return $this->_sendJson($response);
        }

        $id = (int) $this->getRequest()->getParam('id');

        if ($id) {
            try {
                $cart = $this->_getCart();
                $quote = $cart->getQuote();
                $item = $quote->getItemById($id);

                if ($item) {
                    $cart->removeItem($id);
                    $quote->getShippingAddress()->setCollectShippingRates(true);
                    $quote->collectTotals();
                    $cart->save();
                    $quote->save();

                    Mage::getSingleton('checkout/session')->setCartWasUpdated(true);

                    $discount = $quote->getSubtotal() - $quote->getSubtotalWithDiscount();

                    $response['status'] = 'success';
                    $response['message'] = $this->__('Item removed from cart.');
                    $response['grandTotal'] = Mage::helper('checkout')->formatPrice($quote->getGrandTotal());
                    $response['subtotal'] = Mage::helper('checkout')->formatPrice($quote->getSubtotal());
                    $response['discountAmount'] = $discount > 0.001 ? Mage::helper('checkout')->formatPrice(-$discount) : '';
                } else {
                    $response['message'] = $this->__('Item not found in cart.');
                }

            } catch (Mage_Core_Exception $e) {
                Mage::logException($e);
                $response['message'] = $e->getMessage();
            } catch (Exception $e) {
                Mage::logException($e);
                $response['message'] = $this->__('Cannot remove item from cart.');
            }
        } else {
            $response['message'] = $this->__('Invalid item ID.');
        }

        $this->_sendJson($response);
    }
}
