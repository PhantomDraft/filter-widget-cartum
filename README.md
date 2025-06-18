# FilterWidget.js

JavaScript widget for rendering catalog filters on the homepage of Cartum IO and Horoshop e-commerce sites.
Learn more on [GitHub](https://github.com/PhantomDraft/filter-widget-cartum) or install via [npm](https://www.npmjs.com/package/filter-widget-cartum).

---

## Installation and Setup

1. In your platform’s admin panel (Site → Design → Design Editor), make sure to place a **“Brands”** block—this is what the widget replaces by default.
2. Insert the following code **before** `</body>`:

```html
<script src="https://cdn.jsdelivr.net/npm/filter-widget-cartum@1.0.13/dist/filterWidget.umd.js"></script>
<script>
  document.addEventListener('DOMContentLoaded', () => {
    FilterWidget.init({
      runOn           : 'home',                    // 'home' | 'all' | [ '/path1', '/path2' ]
      catalogUrl      : '/kontaktni-linzy/',       // URL to fetch catalog filters from
      sourceSelectors : [
        'section.filter.__listScroll .filter-list ul.filter-lv1'
      ],
      targetSelector  : 'section.frontBrands.__grayscale ul.frontBrands-list',
      hideOutOfStock  : true,                      // hide options with zero items
      labelMap        : {                          // override displayed labels
        '1 день'   : 'Одноденні лінзи',
        '1 місяць' : 'Місячні лінзи'
      },
      imageMap        : {                          // brand logo URLs
        'Canon' : '/images/brands/canon.png',
        'Nikon' : '/images/brands/nikon.png'
      },
      autoExpand      : true,                      // remove height/overflow toggle
      disableExpander : false                      // hide “Show more” button
    });
  });
</script>
```

---

## Configuration Options

| Option                                        | Type                           | Description                                                                                               |
| --------------------------------------------- | ------------------------------ | --------------------------------------------------------------------------------------------------------- |
| `runOn`                                       | `string` \| `string[]`         | Where to run the widget:                                                                                  |
| • `'home'` — only on `/`                      |                                |                                                                                                           |
| • `'all'` — on every page                     |                                |                                                                                                           |
| • `['/path1','/path2']` — only on those paths |                                |                                                                                                           |
| `catalogUrl`                                  | `string`                       | URL of the catalog page to fetch filters from (relative or absolute).                                     |
| `sourceSelectors`                             | `string[]`                     | CSS selectors targeting the original filter-list containers, e.g. `['.filter__listScroll']`.              |
| `targetSelector`                              | `string`                       | CSS selector of the “Brands” `<ul>` to replace, e.g. `'.frontBrands.__grayscale ul.frontBrands-list'`.    |
| `hideOutOfStock`                              | `boolean`                      | `true` to omit options with zero count; `false` to show all.                                              |
| `labelMap`                                    | `Record<string,string>`        | Mapping from original option names to custom labels.                                                      |
| `labelFormatter`                              | `(option) ⇒ string` (optional) | Function that receives a `FilterOption` and returns a custom label; overrides `labelMap`.                 |
| `imageMap`                                    | `Record<string,string>`        | Mapping from option names (usually brands) to image URLs (logos).                                         |
| `autoExpand`                                  | `boolean`                      | `true` to remove inline height/overflow and `. __toggle` class so that all items are immediately visible. |
| `disableExpander`                             | `boolean`                      | `true` to hide the “Show more” expander button permanently.                                               |

---

## Styling (example CSS)

```css
.filter-block {
  display: flex;
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
.filter-block:hover .filter-block__img {
  filter: none;
}
.filter-block__label {
  font-size: 14px;
  color: #333;
}
```

---

## Security

* Only uses `textContent`, `createElement` and URL APIs—no innerHTML, preventing XSS.
* Links are given `rel="nofollow"`.
* Errors are caught so the widget won’t break your page.
* All configuration parameters are validated on init.

---

## Extending and Customization

* To capture additional filter groups, add more selectors to `sourceSelectors`.
* To supply custom logos or labels, extend `imageMap` and `labelMap` or provide a `labelFormatter`.
* For advanced logic, invoke your own functions after parsing or wrap widget init in your own script.