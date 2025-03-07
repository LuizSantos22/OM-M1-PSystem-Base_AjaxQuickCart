<?php
/**
 * @category   PSystem
 * @package    PSystem_AjaxQuickCart
 * @author     Pascal System <info@pascalsystem.pl>
 * @version    1.0.3
 */
/**
 * Pascal Quick Cart Ajax Header JavaScripts
 * 
 * @category   PSystem
 * @package    PSystem_AjaxQuickCart
 * @author     Pascal System <info@pascalsystem.pl>
 * @version    1.0.3
 */
class PSystem_AjaxQuickCart_Block_Headerjs extends Mage_Core_Block_Abstract {
/**
 * Get html code
 * 
 * @return string
 */
	protected function _toHtml() {
		$disableViewCart = Mage::getStoreConfig('psajaxquickcart/viewcart/disable');
		$disableQuickCart = Mage::getStoreConfig('psajaxquickcart/quickcart/disable');
		$html = '';
		if (!$disableViewCart || !$disableQuickCart) {
			$html .= '<script type="text/javascript">'."\n";
			if (!$disableViewCart) {
				if (!$selectorViewCart = Mage::getStoreConfig('psajaxquickcart/viewcart/selector')) {
					$selectorViewCart = '.top-link-cart';
				}
				$html .= 'PS.AjaxQuickCart.initView('.json_encode($selectorViewCart).','.json_encode($this->getUrl('ajaxquickcart/viewcart/index')).');';
			}
			if (!$disableQuickCart) {
				$conf = array(
					'list'	=> array(
						'selector'	=> Mage::getStoreConfig('psajaxquickcart/quickcart/selectorlist'),
						'attribute'	=> Mage::getStoreConfig('psajaxquickcart/quickcart/attributelist'),
						'match'		=> Mage::getStoreConfig('psajaxquickcart/quickcart/matchlist'),
					),
					'single'	=> array(
						'selector'	=> Mage::getStoreConfig('psajaxquickcart/quickcart/selectorsingle'),
					)
				);
				if (empty($conf['list']['selector'])) {
					$conf['list']['selector'] = ".actions .btn-cart";
				}
				if (empty($conf['list']['attribute'])) {
					$conf['list']['attribute'] = "onclick";
				}
				if (empty($conf['list']['match'])) {
					$conf['list']['match'] = "setLocation('###URL###')";
				}
				if (empty($conf['single']['selector'])) {
					$conf['single']['selector'] = ".add-to-cart .btn-cart";
				}
				
				$html .= 'PS.AjaxQuickCart.initQuick('.json_encode($conf).');';
			}
			$html .= '</script>'."\n";
		}
		return $html;
	}
}
