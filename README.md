# Hum Studios Website

This project is a responsive, multi-page website for Hum Studios. It features animated backgrounds, a mobile-friendly hamburger menu, and dedicated pages for content, privacy, cookies, and contact.

---

## 🔧 Project Structure

```text
index.html           # Homepage
contact.html         # Contact form and info
privacy.html         # Customer privacy policy
cookies.html         # Cookie policy
assets/
  └── img/           # Logo, cloud, and social images
  └── css/
      └── styles.css # Main global stylesheet
```

---

## ✅ Features

- Responsive layout with mobile and desktop views
- Animated cloud background
- Accessible hamburger menu navigation
- Sectioned legal content (Privacy & Cookies)
- Semantic HTML5 structure
- Clean, modular CSS

---

## 🖋 Font Usage

- **Atma**: used for headings and branding site-wide
- **Noto Sans**: used for body text by default
- **Vollkorn**: overrides used *only* in `privacy.html` and `cookies.html` for legal content

---

## 📱 Mobile Navigation

- `<div class="hamburger">` toggles visibility of `<nav class="mobile-nav">`
- JavaScript is placed before `</body>` in all pages
- `.top-header` has `position: relative` to correctly anchor dropdown menus

---

## 💡 Custom Styling Notes

- All pages use `section.card` containers for layout
- `.footer-bottom` uses `line-height: 1.3` to fix overlap on small screens
- Mobile nav links avoid hover zoom via:
  ```css
  .mobile-nav a:hover {
    transform: none;
  }
  ```

---

## 🚫 Known Warnings Resolved

- Mixed use of `<div>` and `<nav>` for mobile menus ✅ fixed
- Inconsistent nav script references ✅ fixed
- Inline overrides now scoped to avoid affecting global style ✅ confirmed

---

## ✨ Maintenance Tips

- To add a new page, copy an existing HTML structure (e.g., `contact.html`)
- Keep the `<script>` block and `.top-header` layout consistent for mobile nav
- Use `styles.css` for global styles; only use `<style>` in HTML for page-specific overrides

---

## 📬 Contact

Created by Hum Studios  
For questions or issues, contact: **humstudiosltd@gmail.com**