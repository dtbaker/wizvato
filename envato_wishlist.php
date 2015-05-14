<?php
/*
 * Plugin Name: Envato WishList Plugin
 * Version: 1.1
 * Plugin URI: http://envato-wishlist.dtbaker.net
 * Description: Helps buyers find the perfect item to purchase
 * Author: dtbaker
 * Author URI: http://dtbaker.net
 * Requires at least: 4.1
 * Tested up to: 4.1
 *
 * Version 1.1 - 2015-05-13 - initial release
 *
 */


if ( ! defined( 'ABSPATH' ) ) exit;
defined('__DIR__') or define('__DIR__', dirname(__FILE__));

define('_DEFAULT_ENVATO_PERSONAL_TOKEN','Fc3oLv8VM9PcH0anOWEAWFxIW9WILOmW'); // token from dtbaker for search.

class envato_wishlist {

	private static $instance = null;
	private static $ch_api = false;

	public static function getInstance( $file = false ) {
		if ( is_null( self::$instance ) ) {
			self::$instance = new self( $file );
		}
		return self::$instance;
	}

	public function init() {
		add_action( 'admin_menu' , array( $this, 'add_menu_item' ) );
		add_action( 'admin_init' , array( $this, 'admin_register_settings' ) );
		add_action( 'wp_enqueue_scripts' , array( $this, 'register_scripts' ) );
		add_action( 'wp_footer', array( $this, 'footer_javascript' ) );
		add_shortcode('envato_wishlist', array($this,'envato_wishlist_shortcode'));
	}

	/**
	 * backend admin options:
	 */
	public function admin_register_settings(){
		register_setting( 'envato_wishlist_group', 'envato_personal_token' );
	}
	public function add_menu_item(){
		$page = add_management_page( 'Envato WishList', 'Envato WishList', 'manage_options', 'envato-wishlist', array( $this, 'envato_wishlist_page_options') );
		add_action( 'admin_print_styles-'.$page, array( $this, 'admin_assets' ) );
	}
	public function admin_assets(){
	}
	public function envato_wishlist_page_options(){
		require_once $this->_get_template('admin_envato_wishlist_page_options.php');
	}

	/**
	 * frontend styles and scripts:
	 */
	public function register_scripts(){
		wp_register_script( 'envato_wishlist_js', esc_url( trailingslashit( plugins_url( '/js/', __FILE__ ) ) ) . 'envato_wishlist.js', array( 'jquery' ), '1.0.0', true );
		wp_register_style( 'envato_wishlist_css', esc_url( trailingslashit( plugins_url( '/css/', __FILE__ ) ) ) . 'envato_wishlist.css', array(), '1.0.0' );
	}
	public function footer_javascript(){
		require_once $this->_get_template('envato_wishlist_footer.js');
	}


	/**** shortcode stuff: *****/
	public function envato_wishlist_shortcode($atts=array(), $innercontent='', $code=''){

		$translation_array = array(
			'market' => '',
			'ref' => 'dtbaker',
			'envato_personal_token' => get_option('envato_personal_token', _DEFAULT_ENVATO_PERSONAL_TOKEN),
		);
		wp_localize_script( 'envato_wishlist_js', 'envato_wishlist_options', $translation_array );
		wp_enqueue_script('envato_wishlist_js');
		wp_enqueue_style('envato_wishlist_css');

		extract(shortcode_atts(array(
	    ), $atts));

		ob_start();
		require_once $this->_get_template('envato_wishlist_shortcode.php');
		return ob_get_clean();
	}


	private function _get_template($template_name){
	    if( file_exists( get_stylesheet_directory() .'/'.$template_name)){
	        return get_stylesheet_directory() .'/'.$template_name;
	    }else if( file_exists( get_template_directory() .'/'.$template_name)){
	        return get_template_directory() .'/'.$template_name;
	    }else if (file_exists(dirname( __FILE__ ) . '/templates/' . $template_name)) {
	        return dirname( __FILE__ ) . '/templates/' . $template_name;
	    }
	    return false;
	}

	/**
	 *
	 * Helper for curl requests
	 *
	 * @param string $url
	 * @param array $post
	 */
	private function _curl( $url, $post ){
		self::$ch_api = curl_init();
		curl_setopt(self::$ch_api, CURLOPT_CONNECTTIMEOUT, 10);
		curl_setopt(self::$ch_api, CURLOPT_USERAGENT, "dtbaker sample oauth api");
		curl_setopt(self::$ch_api, CURLOPT_RETURNTRANSFER, true);
		curl_setopt(self::$ch_api, CURLOPT_SSL_VERIFYPEER, false);
		@curl_setopt(self::$ch_api, CURLOPT_FOLLOWLOCATION, 1);
		curl_setopt(self::$ch_api, CURLOPT_HEADER, 0);
		curl_setopt(self::$ch_api, CURLOPT_REFERER, 'http://dtbaker.net/sample_envato_api');
		curl_setopt(self::$ch_api, CURLOPT_RETURNTRANSFER,1);
		curl_setopt(self::$ch_api, CURLOPT_CONNECTTIMEOUT, 10);
		curl_setopt(self::$ch_api, CURLOPT_TIMEOUT, 20);

		curl_setopt(self::$ch_api, CURLOPT_URL, $url);
		if($post !== false && is_array($post)){
			curl_setopt(self::$ch_api, CURLOPT_POST, true);
			curl_setopt(self::$ch_api, CURLOPT_POSTFIELDS, $post);
		}
		$data = curl_exec(self::$ch_api);
		return $data;
	}
}


envato_wishlist::getInstance()->init();