<?php
/**
 * Plugin Name: Admin Bar Pagination
 * Plugin URI: https://wordpress.org/plugins/admin-bar-pagination/
 * Description: Adds pagination to the WordPress admin toolbar to manage menu items on smaller screens. Created to solve cluttered admin toolbar issues when many plugins add their own menu items. Shows 3 menu items per page with navigation controls.
 * Version: 1.0.0
 * Author: Ferdy Sopian
 * Author URI: https://ferdysopian.github.io/
 * License: GPL v2 or later
 * License URI: https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain: admin-bar-pagination
 * Domain Path: /languages
 * Requires at least: 5.0
 * Tested up to: 6.8
 * Requires PHP: 7.4
 *
 * @package AdminBarPagination
 * @version 1.0.0
 */

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Define plugin version
 */
if ( ! defined( 'ADMBARPGN_VERSION' ) ) {
	define( 'ADMBARPGN_VERSION', '1.0.0' );
}

/**
 * Define plugin directory path
 */
if ( ! defined( 'ADMBARPGN_PLUGIN_FILE' ) ) {
	define( 'ADMBARPGN_PLUGIN_FILE', __FILE__ );
}

if ( ! defined( 'ADMBARPGN_PLUGIN_DIR' ) ) {
	define( 'ADMBARPGN_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
}

if ( ! function_exists( 'admbarpgn_get_plugin_path' ) ) {
	/**
	 * Get plugin path
	 *
	 * @param string $file File path relative to plugin directory.
	 * @return string
	 */
	function admbarpgn_get_plugin_path( $file ) {
		return ADMBARPGN_PLUGIN_DIR . $file;
	}
}

if ( ! function_exists( 'admbarpgn_plugin_url' ) ) {
	/**
	 * Get plugin URL
	 *
	 * @param string $url URL path relative to plugin directory.
	 * @return string
	 */
	function admbarpgn_plugin_url( $url ) {
		return plugins_url( $url, __FILE__ );
	}
}

/**
 * Define plugin assets directory folder path
 */
if ( ! defined( 'ADMBARPGN_PLUGIN_URL' ) ) {
	define( 'ADMBARPGN_PLUGIN_URL', plugins_url( '/', __FILE__ ) );
}

/**
 * Define menu page slug
 */
if ( ! defined( 'ADMBARPGN_MENU_PAGE_SLUG' ) ) {
	$admbarpgn_menu_slug = sanitize_key( 'admin-bar-pagination' );
	define( 'ADMBARPGN_MENU_PAGE_SLUG', $admbarpgn_menu_slug );
}

/**
 * Activation hook callback.
 * Sets up default settings when the plugin is activated.
 * This is a lightweight function that doesn't require the full plugin to load.
 */
function admbarpgn_activate() {
	$default_options = array(
		'items_per_page' => 3,
	);

	if ( is_multisite() ) {
		add_site_option( 'admbarpgn_network_settings', $default_options );
	} else {
		add_option( 'admbarpgn_settings', $default_options );
	}
}

/**
 * Register activation hook.
 */
register_activation_hook( __FILE__, 'admbarpgn_activate' );

/**
 * Hooks
 */
add_action( 'plugins_loaded', 'admbarpgn_element_load' );

/**
 * Load plugin
 */
function admbarpgn_element_load() {
	require_once admbarpgn_get_plugin_path( 'inc/Admin.php' );

	$admin_class = 'FerdySopian\AdminBarPagination\Admin';

	$admin_class::instance();
}
