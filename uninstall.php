<?php
/**
 * Uninstall script for Admin Bar Pagination
 *
 * This file is executed when the plugin is deleted from WordPress admin.
 * It cleans up all plugin data from the database.
 *
 * @package AdminBarPagination
 */

// If uninstall not called from WordPress, exit.
if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}

// Delete plugin options.
if ( is_multisite() ) {
	delete_site_option( 'admbarpgn_network_settings' );
} else {
	delete_option( 'admbarpgn_settings' );
}
