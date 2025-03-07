<?php
/**
 * @category   PSystem
 * @package    PSystem_AjaxQuickCart
 * @author     Pascal System <info@pascalsystem.pl>
 * @version    1.0.3
 */
/**
 * Pascal Quick Cart Ajax refresh data JavaScripts
 * 
 * @category   PSystem
 * @package    PSystem_AjaxQuickCart
 * @author     Pascal System <info@pascalsystem.pl>
 * @version    1.0.3
 */
class PSystem_AjaxQuickCart_Block_Refresh extends Mage_Core_Block_Abstract
{
    /**
     * Get html code
     * 
     * @return string
     */
    public function _toHtml()
    {
        $html = '<script type="text/javascript">' . "\n";
        $html .= 'PS.AjaxQuickCart.refresh(' . json_encode($this->getUrl('ajaxquickcart/viewcart/refresh')) . ');';
        $html .= '</script>' . "\n";
        
        return $html;
    }
    
    /**
     * Override to allow csrf protection compatibility
     *
     * @return array
     */
    public function getCacheKeyInfo()
    {
        return [
            'BLOCK_TPL',
            Mage::app()->getStore()->getId(),
            $this->getTemplateFile(),
            'template' => $this->getTemplate(),
            $this->getUrl('ajaxquickcart/viewcart/refresh')
        ];
    }
}
