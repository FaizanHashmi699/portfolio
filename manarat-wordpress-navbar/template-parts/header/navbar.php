<?php
/**
 * Manarat navbar.
 *
 * Include from header.php, immediately after wp_body_open():
 *
 *     get_template_part( 'template-parts/header/navbar' );
 *
 * @package community-faith-pro
 */

defined( 'ABSPATH' ) || exit;

$manarat_cta       = function_exists( 'manarat_navbar_cta' ) ? manarat_navbar_cta() : null;
$manarat_secondary = function_exists( 'manarat_navbar_secondary' ) ? manarat_navbar_secondary() : null;
$manarat_has_menu  = has_nav_menu( MANARAT_NAVBAR_MENU );
$manarat_home      = home_url( '/' );
?>

<a class="manarat-skip" href="#manarat-content"><?php esc_html_e( 'Skip to content', 'community-faith-pro' ); ?></a>

<header
	class="manarat-header"
	id="manarat-header"
	data-manarat-navbar
>
	<div class="manarat-header__inner">

		<?php // ---------- Brand ---------- ?>
		<a class="manarat-brand" href="<?php echo esc_url( $manarat_home ); ?>" rel="home">
			<span class="manarat-brand__mark" aria-hidden="true">
				<svg viewBox="0 0 32 32" focusable="false">
					<path d="M16 2.5 19.9 12.1 29.5 16 19.9 19.9 16 29.5 12.1 19.9 2.5 16 12.1 12.1Z" />
					<circle cx="16" cy="16" r="2.6" class="manarat-brand__mark-eye" />
				</svg>
			</span>
			<span class="manarat-brand__text">
				<span class="manarat-brand__name">
					<?php echo esc_html( get_bloginfo( 'name' ) ); ?>
				</span>
				<span class="manarat-brand__eyebrow">
					<?php esc_html_e( 'Masjid &middot; Islamic Centre &middot; Academy', 'community-faith-pro' ); ?>
				</span>
			</span>
		</a>

		<?php // ---------- Primary navigation ---------- ?>
		<?php if ( $manarat_has_menu ) : ?>
			<nav
				class="manarat-nav"
				id="manarat-nav"
				aria-label="<?php esc_attr_e( 'Primary', 'community-faith-pro' ); ?>"
			>
				<span class="manarat-nav__pill" data-manarat-pill aria-hidden="true"></span>
				<?php
				wp_nav_menu(
					array(
						'theme_location' => MANARAT_NAVBAR_MENU,
						'container'      => false,
						'menu_class'     => 'manarat-nav__list',
						'depth'          => 2,
						'fallback_cb'    => false,
					)
				);
				?>
			</nav>
		<?php endif; ?>

		<?php // ---------- Actions ---------- ?>
		<div class="manarat-actions">

			<?php if ( $manarat_secondary ) : ?>
				<a class="manarat-actions__link" href="<?php echo esc_url( $manarat_secondary['url'] ); ?>">
					<svg class="manarat-icon" viewBox="0 0 20 20" aria-hidden="true" focusable="false">
						<circle cx="10" cy="10" r="7.4" />
						<path d="M10 5.6V10l3 1.8" />
					</svg>
					<?php echo esc_html( $manarat_secondary['label'] ); ?>
				</a>
			<?php endif; ?>

			<?php if ( $manarat_cta ) : ?>
				<a class="manarat-cta" href="<?php echo esc_url( $manarat_cta['url'] ); ?>">
					<span class="manarat-cta__label"><?php echo esc_html( $manarat_cta['label'] ); ?></span>
					<span class="manarat-cta__arrow" aria-hidden="true">
						<svg viewBox="0 0 16 16" focusable="false">
							<path d="M3 8h9M8.5 4.2 12.3 8l-3.8 3.8" />
						</svg>
					</span>
				</a>
			<?php endif; ?>

			<?php if ( $manarat_has_menu ) : ?>
				<button
					class="manarat-burger"
					type="button"
					aria-expanded="false"
					aria-controls="manarat-drawer"
					data-manarat-burger
				>
					<span class="manarat-burger__box" aria-hidden="true">
						<span></span><span></span><span></span>
					</span>
					<span class="screen-reader-text"><?php esc_html_e( 'Menu', 'community-faith-pro' ); ?></span>
				</button>
			<?php endif; ?>
		</div>
	</div>

	<span class="manarat-header__progress" data-manarat-progress aria-hidden="true"></span>
</header>

<?php // ---------- Mobile drawer ---------- ?>
<?php if ( $manarat_has_menu ) : ?>
	<div class="manarat-drawer" id="manarat-drawer" data-manarat-drawer hidden>
		<div class="manarat-drawer__scrim" data-manarat-close></div>

		<div
			class="manarat-drawer__panel"
			role="dialog"
			aria-modal="true"
			aria-label="<?php esc_attr_e( 'Site menu', 'community-faith-pro' ); ?>"
		>
			<div class="manarat-drawer__head">
				<span class="manarat-drawer__title"><?php echo esc_html( get_bloginfo( 'name' ) ); ?></span>
				<button class="manarat-drawer__close" type="button" data-manarat-close>
					<svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
						<path d="M5 5l10 10M15 5 5 15" />
					</svg>
					<span class="screen-reader-text"><?php esc_html_e( 'Close menu', 'community-faith-pro' ); ?></span>
				</button>
			</div>

			<?php
			wp_nav_menu(
				array(
					'theme_location' => MANARAT_NAVBAR_MENU,
					'container'      => 'nav',
					'container_class' => 'manarat-drawer__nav',
					'container_aria_label' => __( 'Mobile', 'community-faith-pro' ),
					'menu_class'     => 'manarat-drawer__list',
					'depth'          => 2,
					'fallback_cb'    => false,
				)
			);
			?>

			<div class="manarat-drawer__foot">
				<?php if ( $manarat_secondary ) : ?>
					<a class="manarat-drawer__secondary" href="<?php echo esc_url( $manarat_secondary['url'] ); ?>">
						<?php echo esc_html( $manarat_secondary['label'] ); ?>
					</a>
				<?php endif; ?>
				<?php if ( $manarat_cta ) : ?>
					<a class="manarat-cta manarat-cta--block" href="<?php echo esc_url( $manarat_cta['url'] ); ?>">
						<span class="manarat-cta__label"><?php echo esc_html( $manarat_cta['label'] ); ?></span>
					</a>
				<?php endif; ?>
			</div>
		</div>
	</div>
<?php endif; ?>
