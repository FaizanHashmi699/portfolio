<?php
/**
 * Manarat navbar — registration, assets and settings.
 *
 * Drop this file into the theme and require it once from functions.php:
 *
 *     require_once get_theme_file_path( 'inc/navbar-setup.php' );
 *
 * It registers its own menu location and enqueues its own assets, so it does
 * not disturb anything the theme already has.
 *
 * @package community-faith-pro
 */

defined( 'ABSPATH' ) || exit;

const MANARAT_NAVBAR_MENU = 'manarat_primary';

/**
 * Register the navigation location.
 *
 * register_nav_menus() merges, so an existing location in the theme is kept.
 */
function manarat_navbar_register_menu() {
	register_nav_menus(
		array(
			MANARAT_NAVBAR_MENU => __( 'Manarat Primary Navigation', 'community-faith-pro' ),
		)
	);
}
add_action( 'after_setup_theme', 'manarat_navbar_register_menu' );

/**
 * Enqueue the navbar stylesheet and script.
 *
 * Versioned by file modification time so a changed file busts the cache
 * without anyone remembering to bump a number.
 */
function manarat_navbar_assets() {
	$css_rel = 'assets/css/manarat-navbar.css';
	$js_rel  = 'assets/js/manarat-navbar.js';

	$css_path = get_theme_file_path( $css_rel );
	$js_path  = get_theme_file_path( $js_rel );

	wp_enqueue_style(
		'manarat-navbar',
		get_theme_file_uri( $css_rel ),
		array(),
		file_exists( $css_path ) ? (string) filemtime( $css_path ) : null
	);

	wp_enqueue_script(
		'manarat-navbar',
		get_theme_file_uri( $js_rel ),
		array(),
		file_exists( $js_path ) ? (string) filemtime( $js_path ) : null,
		true
	);
}
add_action( 'wp_enqueue_scripts', 'manarat_navbar_assets' );

/**
 * The navbar's call-to-action.
 *
 * Returns null when no destination is configured, and the template then omits
 * the button rather than rendering a dead link. Filterable so a child theme or
 * Manarat Core can point it at a live donation route.
 *
 * @return array{label:string,url:string,icon:string}|null
 */
function manarat_navbar_cta() {
	$url = get_theme_mod( 'manarat_navbar_cta_url', '' );

	// Fall back to a published page with the "donate" slug, if one exists.
	if ( '' === $url ) {
		$donate = get_page_by_path( 'donate' );
		if ( $donate instanceof WP_Post && 'publish' === $donate->post_status ) {
			$url = (string) get_permalink( $donate );
		}
	}

	$cta = array(
		'label' => (string) get_theme_mod( 'manarat_navbar_cta_label', __( 'Donate', 'community-faith-pro' ) ),
		'url'   => (string) $url,
		'icon'  => 'heart',
	);

	/**
	 * Filter the navbar CTA.
	 *
	 * Return null to hide the button entirely.
	 *
	 * @param array|null $cta Label, URL and icon key.
	 */
	$cta = apply_filters( 'manarat_navbar_cta', $cta );

	if ( ! is_array( $cta ) || empty( $cta['url'] ) ) {
		return null; // No real destination — render nothing rather than a fake button.
	}

	return $cta;
}

/**
 * Secondary link shown beside the CTA (prayer times, by default).
 *
 * Same rule: no destination, no link.
 *
 * @return array{label:string,url:string}|null
 */
function manarat_navbar_secondary() {
	$url = (string) get_theme_mod( 'manarat_navbar_secondary_url', '' );

	if ( '' === $url ) {
		$page = get_page_by_path( 'prayer-times' );
		if ( $page instanceof WP_Post && 'publish' === $page->post_status ) {
			$url = (string) get_permalink( $page );
		}
	}

	$link = apply_filters(
		'manarat_navbar_secondary',
		array(
			'label' => __( 'Prayer Times', 'community-faith-pro' ),
			'url'   => $url,
		)
	);

	if ( ! is_array( $link ) || empty( $link['url'] ) ) {
		return null;
	}

	return $link;
}

/**
 * Customizer settings for the CTA, so an admin can point it anywhere.
 */
function manarat_navbar_customize( WP_Customize_Manager $wp_customize ) {
	$wp_customize->add_section(
		'manarat_navbar',
		array(
			'title'       => __( 'Manarat Navbar', 'community-faith-pro' ),
			'priority'    => 30,
			'description' => __( 'The header call-to-action. Leave a URL empty to hide that button.', 'community-faith-pro' ),
		)
	);

	$fields = array(
		'manarat_navbar_cta_label'     => array( __( 'CTA label', 'community-faith-pro' ), 'sanitize_text_field', __( 'Donate', 'community-faith-pro' ), 'text' ),
		'manarat_navbar_cta_url'       => array( __( 'CTA URL', 'community-faith-pro' ), 'esc_url_raw', '', 'url' ),
		'manarat_navbar_secondary_url' => array( __( 'Prayer times URL', 'community-faith-pro' ), 'esc_url_raw', '', 'url' ),
	);

	foreach ( $fields as $id => $field ) {
		list( $label, $sanitize, $default, $type ) = $field;

		$wp_customize->add_setting(
			$id,
			array(
				'default'           => $default,
				'sanitize_callback' => $sanitize,
				'transport'         => 'refresh',
			)
		);
		$wp_customize->add_control(
			$id,
			array(
				'label'   => $label,
				'section' => 'manarat_navbar',
				'type'    => $type,
			)
		);
	}
}
add_action( 'customize_register', 'manarat_navbar_customize' );

/**
 * Mark the <body> so pages with a full-bleed hero get the transparent navbar
 * and everything else gets the solid one. Uses a filter so a template can opt
 * in without editing this file.
 */
function manarat_navbar_body_class( array $classes ) {
	/**
	 * Filter whether the current view renders the navbar over a hero image.
	 *
	 * @param bool $overlay Defaults to the front page only.
	 */
	if ( apply_filters( 'manarat_navbar_is_overlay', is_front_page() ) ) {
		$classes[] = 'has-overlay-navbar';
	}
	return $classes;
}
add_filter( 'body_class', 'manarat_navbar_body_class' );
