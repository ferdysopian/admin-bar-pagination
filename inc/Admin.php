<?php
/**
 * Admin Bar Pagination Admin Class
 *
 * @package AdminBarPagination
 * @since 1.0.0
 */

namespace FerdySopian\AdminBarPagination;

// Exit if accessed directly.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Admin class
 */
class Admin {

	/**
	 * Instance of this class.
	 *
	 * @var Admin|null
	 */
	private static $instance = null;

	/**
	 * Get instance of this class.
	 *
	 * @return Admin
	 */
	public static function instance() {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	/**
	 * Constructor
	 */
	private function __construct() {
		add_action( 'init', array( $this, 'init' ) );
	}

	/**
	 * Set up the plugin
	 */
	public function init() {
		// Load scripts on admin and frontend.
		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue_scripts' ), 20 );
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_scripts' ), 20 );

		// Add settings page.
		add_action( 'admin_menu', array( $this, 'add_admin_menu' ) );
		add_action( 'admin_init', array( $this, 'register_settings' ) );

		// Handle network settings.
		if ( is_multisite() ) {
			add_action( 'network_admin_menu', array( $this, 'add_network_admin_menu' ) );
		}
	}

	/**
	 * Load CSS and JS files
	 */
	public function enqueue_scripts() {
		// Only load when admin bar is shown.
		if ( is_admin() || is_admin_bar_showing() ) {

			// Load our minified CSS and JS files.
			wp_enqueue_style(
				'admin-bar-pagination',
				ADMBARPGN_PLUGIN_URL . 'assets/css/admin-bar-pagination.min.css',
				array( 'admin-bar' ),
				ADMBARPGN_VERSION
			);

			wp_enqueue_script(
				'admin-bar-pagination',
				ADMBARPGN_PLUGIN_URL . 'assets/js/admin-bar-pagination.min.js',
				array( 'admin-bar' ),
				ADMBARPGN_VERSION,
				true
			);

			// Pass settings to JavaScript.
			$items_per_page = 3; // Default.
			if ( is_multisite() ) {
				$network_options = get_site_option( 'admbarpgn_network_settings', array( 'items_per_page' => 3 ) );
				$items_per_page  = isset( $network_options['items_per_page'] ) ? $network_options['items_per_page'] : 3;
			} else {
				$site_options   = get_option( 'admbarpgn_settings', array( 'items_per_page' => 3 ) );
				$items_per_page = isset( $site_options['items_per_page'] ) ? $site_options['items_per_page'] : 3;
			}

			wp_localize_script(
				'admin-bar-pagination',
				'admbarpgnSettings',
				array(
					'itemsPerPage' => (int) $items_per_page,
				)
			);
		}
	}

	/**
	 * Add settings page to admin menu
	 */
	public function add_admin_menu() {
		add_options_page(
			__( 'Admin Bar Pagination Settings', 'admin-bar-pagination' ),
			__( 'Admin Bar Pagination', 'admin-bar-pagination' ),
			'manage_options',
			'admin-bar-pagination',
			array( $this, 'admin_page' )
		);
	}

	/**
	 * Add network admin menu
	 */
	public function add_network_admin_menu() {
		add_submenu_page(
			'settings.php',
			__( 'Admin Bar Pagination Settings', 'admin-bar-pagination' ),
			__( 'Admin Bar Pagination', 'admin-bar-pagination' ),
			'manage_network_options',
			'admin-bar-pagination',
			array( $this, 'admin_page' )
		);
	}

	/**
	 * Set up the settings
	 */
	public function register_settings() {
		if ( is_multisite() ) {
			// Network settings for multisite.
			register_setting(
				'admin_bar_pagination_network_options',
				'admbarpgn_network_settings',
				array(
					'sanitize_callback' => array( $this, 'sanitize_settings' ),
					'default'           => array( 'items_per_page' => 3 ),
				)
			);

			add_settings_section(
				'admbarpgn_network_section',
				__( 'Network Settings', 'admin-bar-pagination' ),
				array( $this, 'section_callback' ),
				'admin-bar-pagination'
			);

			add_settings_field(
				'admbarpgn_network_items_per_page',
				__( 'Items per page', 'admin-bar-pagination' ),
				array( $this, 'items_per_page_callback' ),
				'admin-bar-pagination',
				'admbarpgn_network_section'
			);
		} else {
			// Regular settings for single site.
			register_setting(
				'admin_bar_pagination_options',
				'admbarpgn_settings',
				array(
					'sanitize_callback' => array( $this, 'sanitize_settings' ),
				)
			);

			add_settings_section(
				'admbarpgn_general_section',
				__( 'General Settings', 'admin-bar-pagination' ),
				array( $this, 'section_callback' ),
				'admin-bar-pagination'
			);

			add_settings_field(
				'admbarpgn_items_per_page',
				__( 'Items per page', 'admin-bar-pagination' ),
				array( $this, 'items_per_page_callback' ),
				'admin-bar-pagination',
				'admbarpgn_general_section'
			);
		}
	}

	/**
	 * Clean up the settings input
	 *
	 * @param array $input The input to sanitize.
	 * @return array The sanitized input.
	 */
	public function sanitize_settings( $input ) {
		$sanitized = array();

		if ( isset( $input['items_per_page'] ) ) {
			$sanitized['items_per_page'] = absint( $input['items_per_page'] );
			if ( $sanitized['items_per_page'] < 1 ) {
				$sanitized['items_per_page'] = 3;
			}
			if ( $sanitized['items_per_page'] > 10 ) {
				$sanitized['items_per_page'] = 10;
			}
		}

		return $sanitized;
	}

	/**
	 * Show the items per page field
	 */
	public function items_per_page_callback() {
		if ( is_multisite() ) {
			$options     = get_site_option( 'admbarpgn_network_settings', array( 'items_per_page' => 3 ) );
			$value       = isset( $options['items_per_page'] ) ? $options['items_per_page'] : 3;
			$name        = 'admbarpgn_network_settings[items_per_page]';
			$description = __( 'Number of menu items to show per page for all sites (1-10).', 'admin-bar-pagination' );
		} else {
			$options     = get_option( 'admbarpgn_settings', array( 'items_per_page' => 3 ) );
			$value       = isset( $options['items_per_page'] ) ? $options['items_per_page'] : 3;
			$name        = 'admbarpgn_settings[items_per_page]';
			$description = __( 'Number of menu items to show per page (1-10).', 'admin-bar-pagination' );
		}

		echo '<input type="number" name="' . esc_attr( $name ) . '" value="' . esc_attr( $value ) . '" min="1" max="10" />';
		echo '<p class="description">' . esc_html( $description ) . '</p>';
	}

	/**
	 * Show section description
	 */
	public function section_callback() {
		if ( is_multisite() ) {
			echo '<p>' . esc_html__( 'Configure the admin bar pagination settings for all sites in the network.', 'admin-bar-pagination' ) . '</p>';
		} else {
			echo '<p>' . esc_html__( 'Configure the admin bar pagination settings.', 'admin-bar-pagination' ) . '</p>';
		}
	}

	/**
	 * Show the settings page
	 */
	public function admin_page() {
		// Handle form submission.
		if ( isset( $_POST['submit'] ) && isset( $_POST['_wpnonce'] ) && wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['_wpnonce'] ) ), 'admin_bar_pagination_options-options' ) ) {
			if ( is_multisite() && current_user_can( 'manage_network_options' ) ) {
				if ( isset( $_POST['admbarpgn_network_settings'] ) ) {
					// phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized,WordPress.Security.ValidatedSanitizedInput.MissingUnslash -- Input is sanitized via wp_unslash() and sanitize_settings()
					$input = wp_unslash( $_POST['admbarpgn_network_settings'] );
					if ( is_array( $input ) ) {
						$sanitized = $this->sanitize_settings( $input );
						update_site_option( 'admbarpgn_network_settings', $sanitized );
						echo '<div class="notice notice-success is-dismissible"><p>' . esc_html__( 'Settings saved.', 'admin-bar-pagination' ) . '</p></div>';
					}
				}
			} elseif ( ! is_multisite() && current_user_can( 'manage_options' ) ) {
				if ( isset( $_POST['admbarpgn_settings'] ) ) {
					// phpcs:ignore WordPress.Security.ValidatedSanitizedInput.InputNotSanitized,WordPress.Security.ValidatedSanitizedInput.MissingUnslash -- Input is sanitized via wp_unslash() and sanitize_settings()
					$input = wp_unslash( $_POST['admbarpgn_settings'] );
					if ( is_array( $input ) ) {
						$sanitized = $this->sanitize_settings( $input );
						update_option( 'admbarpgn_settings', $sanitized );
						echo '<div class="notice notice-success is-dismissible"><p>' . esc_html__( 'Settings saved.', 'admin-bar-pagination' ) . '</p></div>';
					}
				}
			}
		}
		?>
		<div class="wrap">
			<h1><?php echo esc_html( get_admin_page_title() ); ?></h1>
			<form method="post" action="">
				<?php
				wp_nonce_field( 'admin_bar_pagination_options-options' );
				do_settings_sections( 'admin-bar-pagination' );
				submit_button();
				?>
			</form>
		</div>
		<?php
	}
}

