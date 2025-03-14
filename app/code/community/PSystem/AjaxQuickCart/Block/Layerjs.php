<?php
/**
 * @category   PSystem
 * @package    PSystem_AjaxQuickCart
 * @author     Pascal System <info@pascalsystem.pl>
 * @version    1.0.3
 */
/**
 * Pascal Quick Cart Ajax Layer JavaScripts
 * 
 * @category   PSystem
 * @package    PSystem_AjaxQuickCart
 * @author     Pascal System <info@pascalsystem.pl>
 * @version    1.0.3
 */
class PSystem_AjaxQuickCart_Block_Layerjs extends Mage_Core_Block_Abstract {
/**
 * Get html code
 * 
 * @return string
 */
	protected function _toHtml() {
		$selector = Mage::getStoreConfig('psajaxquickcart/quickcart/selectorsingle');
		if (empty($selector)) {
			$selector = ".add-to-cart .btn-cart";
		}
		
		$html = '<script type="text/javascript">'."\n";
		$html .= 'PS.AjaxQuickCart.initLayerQuick('.json_encode($selector).');';
		$html .= '</script>'."\n";
		
		return $html;
	}
}
