# FilterWidget.js

JavaScript widget for rendering catalog filters on the homepage of Cartum IO and Horoshop e-commerce sites.

**Learn more on [GitHub](https://github.com/PhantomDraft/filter-widget-cartum) or install via [npm](https://www.npmjs.com/package/filter-widget-cartum).**

---

## Installation and Setup

Insert the following code into the platform’s admin panel (Settings → General Settings → Scripts → Before `</body>`):

```html
<script src="https://cdn.jsdelivr.net/npm/filter-widget-cartum@1.0.0/dist/filterWidget.js"></script>
<script>
  document.addEventListener('DOMContentLoaded', () => {
    FilterWidget.init({
      sourceSelectors: ['.filter__listScroll'],
      targetSelector : '.frontBrands.__grayscale',
      hideOutOfStock : true,  // hides options with no stock
      imageMap       : {      // brand logos
        'Canon': '/images/brands/canon.png',
        'Nikon': '/images/brands/nikon.png'
      }
    });
  });
</script>
```

---

## Configuration Options

| Option            | Type       | Description                                                                                         |
| ----------------- | ---------- | --------------------------------------------------------------------------------------------------- |
| `sourceSelectors` | `string[]` | CSS selectors of containers with filter lists, e.g. `['.filter__listScroll']` or `['all']`.         |
| `targetSelector`  | `string`   | CSS selector of the homepage container where blocks will be added, e.g. `.frontBrands.__grayscale`. |
| `hideOutOfStock`  | `boolean`  | `true` to hide options with zero stock; `false` to show all.                                        |
| `imageMap`        | `object`   | Mapping of option names to image URLs (used for brand logos).                                       |

---

## Styling (example CSS)

```css
.filter-block {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin: 8px;
  padding: 12px 16px;
  background: #f5f5f5;
  text-decoration: none;
  border-radius: 8px;
  transition: background 0.3s;
}
.filter-block:hover {
  background: #e0e0e0;
}
.filter-block__img {
  max-width: 100px;
  max-height: 100px;
  filter: grayscale(100%);
  transition: filter 0.3s;
}
.filter-block__img:hover {
  filter: none;
}
.filter-block__label {
  font-size: 14px;
  color: #333;
}
```

---

## Security

* Uses only `textContent` and `createElement` to prevent XSS.
* Sets `rel="nofollow"` on external links.
* Errors are caught in `try/catch` so the widget won’t break the page.
* All input parameters are validated in `validateConfig()`.

---

## Extending and Customization

* To add new filter rules, specify additional selectors in `sourceSelectors`.
* To extend `imageMap`, add new name→URL pairs.
* To integrate custom logic, add your own functions and call them after parsing.