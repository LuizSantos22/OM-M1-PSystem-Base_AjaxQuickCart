<?php
/**
 * @category   PSystem
 * @package    PSystem_Base
 * @author     Pascal System <info@pascalsystem.pl>
 * @version    1.1.2
 */
/**
 * Pascal Catalog Ajax config block
 * 
 * @category   PSystem
 * @package    PSystem_Base
 * @author     Pascal System <info@pascalsystem.pl>
 * @version    1.1.2
 */
class PSystem_Base_Block_Headerjs extends Mage_Core_Block_Abstract
{
    /**
     * Prepare additional js to head
     * 
     * @return string
     */
    protected function _toHtml()
    {
        if (Mage::getStoreConfig('psbase/quickimages/disable')) {
            return '';
        }
        
        if (!$selector = Mage::getStoreConfig('psbase/quickimages/selector')) {
            $selector = 'a.product-image';
        }
        
        // Properly escape the selector for JavaScript
        $selector = $this->escapeJs($selector);
        
        // Use proper JavaScript inclusion method
        $html = '<div style="display:none;">';
        $html .= '<script type="text/javascript">//<![CDATA[';
        $html .= 'document.observe("dom:loaded", function() {';
        $html .= '    if (typeof PS !== "undefined" && PS.catalogQuickViewImage) {';
        $html .= '        PS.catalogQuickViewImage.init(\'' . $selector . '\');';
        $html .= '    }';
        $html .= '});';
        $html .= '//]]></script>';
        $html .= '</div>';
        
        return $html;
    }
    
    /**
     * Escape string for JavaScript
     *
     * @param string $string
     * @return string
     */
    public function escapeJs($string)
    {
        if ($string === null) {
            return '';
        }
        
        return str_replace(
            ['\\', '\'', '"', "\r", "\n", "\t", '<', '>', '&'],
            ['\\\\', '\\\'', '\\"', '', '', '', '\\u003C', '\\u003E', '\\u0026'],
            $string
        );
    }
}
