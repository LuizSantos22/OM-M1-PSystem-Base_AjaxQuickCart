<?php
/**
 * @category   PSystem
 * @package    PSystem_AjaxQuickCart
 * @author     Pascal System <info@pascalsystem.pl>
 * @version    1.0.3
 */
/**
 * Pascal Quick Cart Ajax item layer renderer for configurable products
 * 
 * @category   PSystem
 * @package    PSystem_AjaxQuickCart
 * @author     Pascal System <info@pascalsystem.pl>
 * @version    1.0.3
 */
class PSystem_AjaxQuickCart_Block_Item_Renderer_Configurable extends Mage_Checkout_Block_Cart_Item_Renderer_Configurable
{
    /**
     * Get item delete url
     *
     * @return string
     */
    public function getDeleteUrl()
    {
        $params = array(
            'id' => $this->getItem()->getId(),
            Mage_Core_Controller_Front_Action::PARAM_NAME_URL_ENCODED => $this->helper('core/url')->getEncodedUrl(Mage::getUrl('checkout/cart/index'))
        );
        
        // Add form key for CSRF protection if available
        if (method_exists($this, 'getFormKey')) {
            $params['form_key'] = $this->getFormKey();
        }
        
        return $this->getUrl('checkout/cart/delete', $params);
    }
    
    /**
     * Get form key
     *
     * @return string
     */
    public function getFormKey()
    {
        return Mage::getSingleton('core/session')->getFormKey();
    }
    
    /**
     * Override to allow proper caching with CSRF protection
     *
     * @return array
     */
    public function getCacheKeyInfo()
    {
        $info = parent::getCacheKeyInfo();
        $info[] = $this->getItem()->getId();
        $info[] = $this->getFormKey();
        
        return $info;
    }
}
