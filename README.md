# FilterWidget.js

JavaScript widget for rendering catalog filters on the homepage of Cartum IO and Horoshop e-commerce sites.
Learn more on [GitHub](https://github.com/PhantomDraft/filter-widget-cartum) or install via [npm](https://www.npmjs.com/package/filter-widget-cartum).

---

## Installation and Setup

1. In your platform’s admin panel (Site → Design → Design Editor), make sure to place a **“Brands”** block—this is what the widget replaces by default.
2. Insert the following code **before** `</body>`:

```html
<script src="https://cdn.jsdelivr.net/npm/filter-widget-cartum@1.0.32/dist/filterWidget.umd.js"></script>
<script>
  document.addEventListener('DOMContentLoaded', () => {
    const widget = new FilterWidget({
      runOn          : 'home',                             // 'home' | 'all' | [ '/path1', '/path2' ]
      catalogUrl     : '/kontaktni-linzy/',                  // URL to fetch catalog filters from
      sourceSelectors: [
        'section.filter.__listScroll .filter-list ul.filter-lv1'
      ],
      targetSelector : 'section.frontBrands.__grayscale ul.frontBrands-list',                                 // render filters into different blocks
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
      expanderText   : 'Показать ещё',
      title          : 'Бренды'
    });
    widget.init();
  });
</script>
```

Also, using the production-ready variant without inline comments:

```html
<script src="https://cdn.jsdelivr.net/npm/filter-widget-cartum@1.0.32/dist/filterWidget.umd.js"></script>
<script>
  document.addEventListener('DOMContentLoaded', () => {
    const widget = new FilterWidget({
      runOn: 'home',
      catalogUrl: '/kontaktni-linzy/',
      sourceSelectors: [
        'section.filter.__listScroll .filter-list ul.filter-lv1'
      ],
      groups: [ // або targetSelector : 'section.frontBrands.__grayscale ul.frontBrands-list',
        {
          // Загальні фільтри (не брендовані)
          targetSelector: 'section.frontBrands.__grayscale ul.frontBrands-list',
          match: opt => !/\/filter\/brand=/.test(opt.url),
          title: 'Типи'
        },
        {
          // Тільки брендовані фільтри
          targetSelector: 'section.banners.banners--block.banners--gaps-none .banner-image',
          match: opt => /\/filter\/brand=/.test(opt.url),
          title: 'Бренди'
        }
      ],
      hideOutOfStock: true,
      labelMap: {
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
      labelFormatter: opt => {
        const u = opt.url;
        if (u.includes('uvFltr='))    return opt.name === 'Ні' ? 'Без UV-фільтра' : 'З UV-фільтром';
        if (u.includes('tonuvannja=')) return opt.name === 'Ні' ? 'Без тонування'   : opt.name;
        return opt.name;
      },
      imageMap: {
        'CooperVision'      : '/content/images/47/137x120l75nn0/coopervision-80176384117891.webp?884',
        'Alcon'             : '/content/images/48/120x120l75nn0/alcon-46644902566954.webp',
        'Bausch & Lomb'     : '/content/images/49/120x120l75nn0/bausch-lomb-23791386782850.webp',
        'Johnson & Johnson' : '/content/images/50/120x120l75nn0/johnson-johnson-99333620756049.jpg'
      },
      autoExpand: true,
      expanderText: 'Розгорнути'
    });
    widget.init();
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
| `groups`          | `Array`                | Advanced: array of `{targetSelector, match, title?}` objects to render options into multiple blocks. |
| `hideOutOfStock`  | `boolean`               | `true` to omit zero-count options.                                                             |
| `labelMap`        | `Record<string,string>` | Custom label overrides.                                                                        |
| `labelFormatter`  | `(option) ⇒ string`     | Function returning label per option; overrides `labelMap`.                                     |
| `imageMap`        | `Record<string,string>` | Mapping option names to logo image URLs.                                                       |
| `autoExpand`      | `boolean`               | `false` = render a single collapsed row + expander button; `true` = render all items expanded. |
| `expanderText`    | `string`                | Text of the “Show more” button when `autoExpand` is `false`.                                   |
| `title`           | `string`                | Optional heading text before the rendered list. Empty to omit.                               |
| `titleTag`        | `string`                | Wrapper tag name for the heading. Default `'span'`.                                           |
| `titleClass`      | `string`                | CSS class for the heading wrapper.                                                           |
| `brandLast`       | `boolean`               | `true` to render brand filters in a separate second list after general filters.                |
| `clone`           | `boolean`               | `true` to duplicate items instead of removing them from the source lists. |

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

### Horizontal layout for brand items

To make the brand list fill the row in four columns only inside its parent block
(`section.frontBrands`), use flex layout tied to that container. Other lists
remain unaffected:

```css
/* four items per row with gaps */
section.frontBrands .frontBrands-list {
  display: flex;
  flex-wrap: wrap;
}
section.frontBrands .frontBrands-i {
  box-sizing: border-box;
  flex: 0 0 calc(25% - 16px);
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
* For advanced logic, create an instance with `new FilterWidget(config)` and call `init()` in your own scripts after post-processing the rendered lists.

### Example: cloning filters into a custom menu

With the default `clone` behaviour enabled, you can duplicate selected options and place them into any list while keeping them in their original block. The snippet below adds three cloned items to an existing menu:

```html
<script>
  document.addEventListener("DOMContentLoaded", () => {
    FilterWidget.init({
      catalogUrl: "/kontaktni-linzy/",
      sourceSelectors: [
        "section.filter.__listScroll .filter-list ul.filter-lv1"
      ],
      groups: [
        {
          targetSelector: ".products-menu__container",
          match: opt => ["1 день", "Ні", "Гнучкий"].includes(opt.name)
          // clone defaults to true
        },
        {
          targetSelector: "section.frontBrands.__grayscale ul.frontBrands-list"
        }
      ],
      labelMap: {
        "1 день": "Однодневные",
        "Ні": "Без UV-фільтра",
        "Гнучкий": "Гибкие"
      }
    });
  });
</script>
```

Resulting markup inside `.products-menu__container`:

```html
<ul class="products-menu__container">
  <li class="products-menu__item j-submenu-item">…</li>
  <li class="frontBrands-i"><a href="/kontaktni-linzy/filter/rezhimZamni=1/" class="frontBrands-a filter-block"><span class="filter-block__label">Однодневные</span></a></li>
  <li class="frontBrands-i"><a href="/kontaktni-linzy/filter/uvFltr=no/" class="frontBrands-a filter-block"><span class="filter-block__label">Без UV-фільтра</span></a></li>
  <li class="frontBrands-i"><a href="/kontaktni-linzy/filter/rezhimNosnnja=1/" class="frontBrands-a filter-block"><span class="filter-block__label">Гибкие</span></a></li>
  <li class="products-menu__item j-submenu-item">…</li>
</ul>
```