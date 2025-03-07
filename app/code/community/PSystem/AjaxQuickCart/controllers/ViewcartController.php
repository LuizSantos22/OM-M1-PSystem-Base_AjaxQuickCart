<?php
/**
 * @category   PSystem
 * @package    PSystem_AjaxQuickCart
 * @author     Pascal System <info@pascalsystem.pl>
 * @version    1.0.2
 */
/**
 * @see Mage_Checkout_CartController<?php
/**
 * @category   PSystem
 * @package    PSystem_AjaxQuickCart
 * @author     Pascal System <info@pascalsystem.pl>
 * @version    1.0.3
 */
/**
 * @see Mage_Checkout_CartController
 */
require_once 'Mage/Checkout/controllers/CartController.php';
/**
 * Pascal Quick Cart Ajax Header JavaScripts
 * 
 * @category   PSystem
 * @package    PSystem_AjaxQuickCart
 * @author     Pascal System <info@pascalsystem.pl>
 * @version    1.0.3
 */
class PSystem_AjaxQuickCart_ViewcartController extends Mage_Checkout_CartController {
    /**
     * Index action display only products in cart
     * 
     * @return void
     */
    public function indexAction() {
        $this->loadLayout()
            ->_initLayoutMessages('checkout/session')
            ->_initLayoutMessages('catalog/session');
        $this->renderLayout();
    }
    /**
     * Refresh box with items in cart
     * 
     * @return void
     */
    public function refreshAction() {
        /* @var $layout Mage_Core_Model_Layout */
        $layout = $this->loadLayout()->getLayout();
        /* @var $ajaxBlock PSystem_AjaxQuickCart_Block_Refresh_Response */
        if (($ajaxBlock = $layout->getBlock('ajax.response'))
            && ($ajaxBlock instanceof PSystem_AjaxQuickCart_Block_Refresh_Response)) {
            $this->getResponse()->setBody($ajaxBlock->toHtml());
            return;
        }
    }
    /**
     * Update cart via AJAX
     * 
     * @return void
     */
    public function updatecartAction() {
        $response = array();
        try {
            // Get the cart and data sent from frontend
            $cart = Mage::getSingleton('checkout/cart');
            $cartData = $this->getRequest()->getParam('cart');
            // Validate received data
            if (!is_array($cartData)) {
                // No notification will be displayed here
                throw new Exception();
            }
            // Iterate over cart items and update quantities
            foreach ($cartData as $itemId => $itemInfo) {
                $item = $cart->getQuote()->getItemById($itemId);
                if (!$item) {
                    // No notification will be displayed here
                    throw new Exception();
                }
                // Check if quantity was provided
                if (isset($itemInfo['qty'])) {
                    $qty = (float)$itemInfo['qty'];
                    if ($qty <= 0) {
                        // No notification will be displayed here
                        throw new Exception();
                    }
                    $item->setQty($qty);
                }
            }
            // Save cart and recalculate totals
            $cart->save();
            $cart->getQuote()->collectTotals();
            Mage::getSingleton('checkout/session')->setCartWasUpdated(true);
            // Success response without message
            $response['status'] = 'success';
        } catch (Exception $e) {
            // Log error but don't return any visible message to user
            Mage::logException($e);
            $response['status'] = 'error';
        }
        // Return response as JSON
        $this->getResponse()->setHeader('Content-Type', 'application/json');
        $this->getResponse()->setBody(Mage::helper('core')->jsonEncode($response));
    }
}
 */
require_once 'Mage/Checkout/controllers/CartController.php';
/**
 * Pascal Quick Cart Ajax Header JavaScripts
 * 
 * @category   PSystem
 * @package    PSystem_AjaxQuickCart
 * @author     Pascal System <info@pascalsystem.pl>
 * @version    1.0.2
 */
class PSystem_AjaxQuickCart_ViewcartController extends Mage_Checkout_CartController {
    /**
     * Index action display only products in cart
     * 
     * @return void
     */
    public function indexAction() {
        $this->loadLayout()
            ->_initLayoutMessages('checkout/session')
            ->_initLayoutMessages('catalog/session');
        $this->renderLayout();
    }

    /**
     * Refresh box with items in cart
     * 
     * @return void
     */
    public function refreshAction() {
        /* @var $layout Mage_Core_Model_Layout */
        $layout = $this->loadLayout()->getLayout();
        /* @var $ajaxBlock PSystem_AjaxQuickCart_Block_Refresh_Response */
        if (($ajaxBlock = $layout->getBlock('ajax.response'))
            && ($ajaxBlock instanceof PSystem_AjaxQuickCart_Block_Refresh_Response)) {
            echo $ajaxBlock->toHtml();
            exit;
        }
    }

    /**
     * Update cart via AJAX
     * 
     * @return void
     */
    public function updatecartAction() {
        $response = array();
        try {
            // Obter o carrinho e os dados enviados pelo frontend
            $cart = Mage::getSingleton('checkout/cart');
            $cartData = $this->getRequest()->getParam('cart');

            // Validar os dados recebidos
            if (!is_array($cartData)) {
                // Nenhuma notificação será exibida aqui
                throw new Exception();
            }

            // Iterar sobre os itens do carrinho e atualizar as quantidades
            foreach ($cartData as $itemId => $itemInfo) {
                $item = $cart->getQuote()->getItemById($itemId);
                if (!$item) {
                    // Nenhuma notificação será exibida aqui
                    throw new Exception();
                }

                // Verificar se a quantidade foi fornecida
                if (isset($itemInfo['qty'])) {
                    $qty = (float)$itemInfo['qty'];
                    if ($qty <= 0) {
                        // Nenhuma notificação será exibida aqui
                        throw new Exception();
                    }
                    $item->setQty($qty);
                }
            }

            // Salvar o carrinho e recalcular os totais
            $cart->getQuote()->collectTotals()->save();
            Mage::getSingleton('checkout/session')->setCartWasUpdated(true);

            // Resposta de sucesso sem mensagem
            $response['status'] = 'success';
        } catch (Exception $e) {
            // Logar o erro, mas não retornar nenhuma mensagem visível ao usuário
            Mage::logException($e);
            $response['status'] = 'error';
        }

        // Retornar a resposta como JSON
        $this->getResponse()->setBody(Mage::helper('core')->jsonEncode($response));
    }
}
