# FilterWidget.js

JavaScript widget for rendering catalog filters on the homepage of Cartum IO and Horoshop e-commerce sites.
Learn more on [GitHub](https://github.com/PhantomDraft/filter-widget-cartum) or install via [npm](https://www.npmjs.com/package/filter-widget-cartum).

---

## Installation and Setup

1. In your platform’s admin panel (Site → Design → Design Editor), make sure to place a **“Brands”** block—this is what the widget replaces by default.
2. Insert the following code **before** `</body>`:

```html
<script src="https://cdn.jsdelivr.net/npm/filter-widget-cartum@1.0.26/dist/filterWidget.umd.js"></script>
<script>
  document.addEventListener('DOMContentLoaded', () => {
    FilterWidget.init({
      runOn          : 'home',                             // 'home' | 'all' | [ '/path1', '/path2' ]
      catalogUrl     : '/kontaktni-linzy/',                  // URL to fetch catalog filters from
      sourceSelectors: [
        'section.filter.__listScroll .filter-list ul.filter-lv1'
      ],
      targetSelector : 'section.frontBrands.__grayscale ul.frontBrands-list',
      hideOutOfStock : true,                                 // hide options with zero items
      labelMap       : {                                     // override displayed labels
        '1 день'   : 'Одноденні лінзи',
        '1 місяць' : 'Місячні лінзи'
      },
      imageMap       : {                                     // brand logo URLs
        'CooperVision': '/images/brands/CooperVision.png',
        'Alcon'       : '/images/brands/Alcon.png'
      },
      autoExpand     : false,                                // false = show only one row + expander button; true = show all items
      expanderText   : 'Показать ещё',                      // text for expander button when autoExpand is false
      brandLast      : true                                  // render brands group after general filters
    });
  });
</script>
```

Also, using the production-ready variant without inline comments:

```html
<script src="https://cdn.jsdelivr.net/npm/filter-widget-cartum@1.0.26/dist/filterWidget.umd.js"></script>
<script>
  document.addEventListener('DOMContentLoaded', () => {
    FilterWidget.init({
      runOn          : 'home',                 
      catalogUrl     : '/kontaktni-linzy/',     
      sourceSelectors: [
        'section.filter.__listScroll .filter-list ul.filter-lv1'
      ],
      targetSelector : 'section.frontBrands.__grayscale ul.frontBrands-list',
      hideOutOfStock : true,
      labelMap       : {
        '1 день'            : 'Одноденні лінзи',
        '1 місяць'          : 'Місячні лінзи',
        '2 тижні'           : 'Двотижневі лінзи',
        'Світло-блакитне'   : 'Світло-блакитні лінзи',
        'Гідрогель'         : 'Гідрогель',
        'Силікон-гідрогель' : 'Силікон-гідрогель',
        'CooperVision'      : 'CooperVision',
        'Alcon'             : 'Alcon',
        'Bausch & Lomb'     : 'Bausch & Lomb',
        'Johnson & Johnson' : 'Johnson & Johnson',
        'Гнучкий'           : 'Гнучкі лінзи',
        'Денний'            : 'Денні лінзи',
        'Пролонгований'     : 'Пролонговані лінзи'
      },
      labelFormatter : opt => {
        const u = opt.url;
        if (u.includes('uvFltr='))   return opt.name === 'Ні' ? 'Без UV-фільтра' : 'З UV-фільтром';
        if (u.includes('tonuvannja=')) return opt.name === 'Ні' ? 'Без тонування'   : opt.name;
        return opt.name;
      },
      imageMap       : {
        'CooperVision'       : '/images/brands/CooperVision.png',
        'Alcon'              : '/images/brands/Alcon.png',
        'Bausch & Lomb'      : '/images/brands/Bausch&Lomb.png',
        'Johnson & Johnson'  : '/images/brands/Johnson&Johnson.png'
      },
      autoExpand     : true,
      expanderText   : 'Розгорнути',
      brandLast      : true
    });
  });
</script>
```

---

## Configuration Options

| Option            | Type                    | Description                                                                                    |
| ----------------- | ----------------------- | ---------------------------------------------------------------------------------------------- |
| `runOn`           | `string` \| `string[]`  | Where to run the widget: `'home'`, `'all'`, or specific paths.                                 |
| `catalogUrl`      | `string`                | URL of the catalog page to fetch filters from.                                                 |
| `sourceSelectors` | `string[]`              | CSS selectors targeting original filter lists.                                                 |
| `targetSelector`  | `string`                | CSS selector of the `<ul>` to replace with rendered filters.                                   |
| `hideOutOfStock`  | `boolean`               | `true` to omit zero-count options.                                                             |
| `labelMap`        | `Record<string,string>` | Custom label overrides.                                                                        |
| `labelFormatter`  | `(option) ⇒ string`     | Function returning label per option; overrides `labelMap`.                                     |
| `imageMap`        | `Record<string,string>` | Mapping option names to logo image URLs.                                                       |
| `autoExpand`      | `boolean`               | `false` = render a single collapsed row + expander button; `true` = render all items expanded. |
| `expanderText`    | `string`                | Text of the “Show more” button when `autoExpand` is `false`.                                   |
| `brandLast`       | `boolean`               | `true` to render brand filters in a separate second list after general filters.                |

---

## Styling (example CSS)

```css
.frontBrands .frontBrands-list {
  margin-bottom: 8px !important;
}
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
  width: 100px;
  height: 100px;
  object-fit: fill;
  object-position: center center;
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
.frontBrands-list.__collapsed {
  max-height: 120px;
  overflow: hidden;
}
.frontBrands-list.__expanded {
  max-height: none;
  overflow: visible;
}
.frontBrands-expander a {
  display: inline-block;
  margin: 8px;
  cursor: pointer;
}
```

---

## Security

* Only uses `textContent`, `createElement` and URL APIs—no innerHTML, preventing XSS.
* Links are given `rel="nofollow"`.
* Errors are caught so the widget won’t break your page.
* All parameters validated on init.

---

## Extending and Customization

* Add more selectors to `sourceSelectors` to capture additional groups.
* Extend `imageMap`/`labelMap` or implement `labelFormatter` for custom labels.
* You can obtain filter cover URLs by right-clicking the cover image in Products → References → Brands and selecting “Copy image address”.
* For advanced logic, wrap `FilterWidget.init` in your own scripts or post-process rendered lists.