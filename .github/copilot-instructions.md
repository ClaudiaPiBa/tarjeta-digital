# Copilot Instructions for tarjeta-digital

## Project Overview
**tarjeta-digital** is a responsive digital business card web application built with vanilla JavaScript, HTML, and CSS. It demonstrates an interactive contact card template with action buttons (WhatsApp, call, email), social links, theme toggle, and export functionality. The project supports multi-profile portfolios via the `/storylaw` subdirectory.

### Key Architecture Decisions
- **No frameworks/build tools**: Vanilla JS/CSS for zero dependencies and easy deployment to GitHub Pages
- **Event delegation**: Single click handler on `document` (not individual button listeners) for scalability — event handlers at app.js lines 120-155
- **Data-driven template**: All contact info centralized in `DATA` object at top of app.js for easy customization
- **Persistent state**: Uses `localStorage` for theme preference to maintain user selection across sessions
- **Responsive design**: Mobile-first with CSS variables (`--bg`, `--card`, `--text` etc.) enabling light/dark theme toggle without duplicating styles

## Critical Patterns & Conventions

### Data Management (app.js, lines 1-20)
```javascript
const DATA = {
  phone: "5581451364",
  email: "hola@tudominio.com",
  links: { linkedin: "...", instagram: "...", ... },
  vcard: { firstName: "...", ... }
}
```
- **Single source of truth**: All text/links come from `DATA`. Template uses `data-action` and `data-link` attributes to reference values
- **vCard format**: Separate `vcard` object maintains contact format for download compatibility

### Event Handling Pattern
Uses **event delegation with data attributes** instead of individual listeners:
```javascript
// DOM: <button data-action="whatsapp">
// Handler: document.addEventListener("click", (e) => {
//   const btn = e.target.closest("[data-action]")
```
Benefits: Avoids memory leaks, handles dynamic elements, scales to multiple profile pages

### Theme Implementation
- **CSS Custom Properties**: Define all colors as `--bg`, `--card`, `--text` in `:root` and `[data-theme="dark"]`
- **No CSS duplication**: Single stylesheet handles both themes by toggling `data-theme` attribute on `<html>`
- **Persistence**: `localStorage.getItem("demoTheme")` applied on page load

### Mobile UI Patterns
- **Bottom sheet with swipe-to-close** (app.js, lines 219-265): uses `touchstart/move/end` for drag gesture (120px threshold to dismiss)
- **Accordion pattern**: Dynamic `max-height` calculation based on `scrollHeight` to avoid CSS animation issues on content change
- **Responsive sizing**: Uses `min(420px, 100%)` in styles.css for responsive card without media queries

## Multi-Profile Architecture

### Subdirectory Pattern
- `/storylaw/` - Portfolio container
- `/storylaw/alejandro-perez/` - Individual profile with duplicated structure
- Each profile has own `index.html`, `css/styles.css`, `assets/` (cv/, img/)
- `/storylaw/js/main.js` - Shared utilities for copy functionality

### Key Files per Profile
- `index.html` - Profile-specific markup and user details
- `css/styles.css` - Profile-specific branding (colors, spacing)
- `assets/cv/` - PDF or document files for download
- `assets/img/` - Profile photos and profile-specific images

## Deployment & Development

### GitHub Pages Setup
- Deployed at: `https://claudiapiba.github.io/tarjeta-digital/`
- No build step required - files deploy as-is
- Relative paths work for subdirectories (e.g., `/storylaw/alejandro-perez/`)

### Useful Features for Modification
- **Download vCard** (app.js, lines 57-67): generates and triggers `.vcf` file download
- **Share functionality** (app.js, lines 100-114): uses Web Share API with fallback to URL copy
- **Toast notifications** (app.js, lines 26-34): simple UI feedback system with auto-dismiss
- **Web link formatting** (app.js, lines 90-98): strips protocol/www for display labels

## Common Tasks

**Update contact info**: Edit `DATA` object in app.js (lines 1-20)

**Add social link**: 
1. Add entry to `DATA.links` in app.js
2. Add `<a data-link="key">` in index.html grid section
3. Add entry to sheet menu if needed

**Change theme colors**: Modify CSS variables in `:root` and `[data-theme="dark"]` at top of styles.css

**Add new profile**: Copy `/storylaw/alejandro-perez/` directory structure and customize `DATA` + styles

## Testing Considerations
- **No automated tests** currently - manual testing through browser
- Test all interactions: WhatsApp links (URL encoding), tel: links, vCard download, clipboard copy, theme toggle on reload, touch gestures on mobile
- Verify `data-*` attributes match handler selectors in event delegation code (app.js, lines 120-155)
