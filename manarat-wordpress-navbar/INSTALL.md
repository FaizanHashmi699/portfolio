# Manarat navbar — install

Four files. Nothing else in the theme is touched.

## 1. Copy the files

Into `wp-content/themes/community-faith-pro/`:

```
inc/navbar-setup.php
template-parts/header/navbar.php
assets/css/manarat-navbar.css
assets/js/manarat-navbar.js
```

## 2. Load it — one line in `functions.php`

```php
require_once get_theme_file_path( 'inc/navbar-setup.php' );
```

## 3. Render it — in `header.php`, right after `wp_body_open()`

```php
<?php get_template_part( 'template-parts/header/navbar' ); ?>
```

Then give the page content an id so the skip link lands somewhere:

```php
<main id="manarat-content">
```

## 4. Assign the menu

**Appearance → Menus → Manarat Primary Navigation.**

Until a menu is assigned, the nav and the burger simply don't render — no empty bar, no placeholder links.

## 5. Point the buttons somewhere

**Appearance → Customise → Manarat Navbar.**

- **CTA label** — defaults to "Donate"
- **CTA URL** — leave empty and the button is not rendered
- **Prayer times URL** — same rule

If a published page with the slug `donate` or `prayer-times` exists, those are used automatically.

To drive them from Manarat Core instead:

```php
add_filter( 'manarat_navbar_cta', function ( $cta ) {
    $cta['url'] = manarat_core_get_donate_url();
    return $cta;
} );
```

---

## Transparent over the hero

The navbar goes transparent on the front page and solid everywhere else. To change which views get the overlay:

```php
add_filter( 'manarat_navbar_is_overlay', function ( $overlay ) {
    return is_front_page() || is_page_template( 'template-campaign.php' );
} );
```

An overlay page needs its hero to pull up under the fixed bar — `margin-top: -76px` on the hero, or whatever `--mn-header-h` is set to.

---

## What it does

| | |
|---|---|
| **Transparent → frosted** | Glass over the hero; frosted with a hairline and lift past 8px of scroll |
| **Hides down, returns up** | Only after 140px. Transform-driven, so no reflow and no layout shift |
| **Sliding pill** | Rests on the current page, follows hover and keyboard focus, settles back |
| **Reading progress** | 2px hairline, only once the bar is stuck |
| **Mobile drawer** | Focus trap, Escape to close, scroll lock, focus returned to the burger |
| **Reduced motion** | Bar stops hiding entirely; every transition collapses |

## Engineering notes

- `wp_nav_menu`, `register_nav_menus`, Customizer API — no page builder, no framework
- Every output escaped (`esc_url`, `esc_html`, `esc_attr`); all strings translation-ready
- Assets versioned by `filemtime()`, so a changed file busts its own cache
- ~3KB of vanilla JS. One passive scroll listener behind `requestAnimationFrame`
- Active state comes from WordPress's own `current-menu-item` class, so it works with JS off
- Everything is namespaced `.manarat-*` / `manarat_*` — it cannot collide with existing theme styles

## Colours

Set once at the top of `manarat-navbar.css` as custom properties — `--mn-primary`, `--mn-navy`, `--mn-light`, `--mn-border`, `--mn-muted`. Rebranding is a token change, not a find-and-replace.

## Not done here

This navbar was built without access to your theme, so before it goes live check:

1. `community-faith-pro` doesn't already register a menu location you'd rather reuse
2. Its existing header CSS doesn't set a conflicting `position` on a wrapper around the header
3. `wp_body_open()` is actually called in `header.php` (some older themes omit it)
