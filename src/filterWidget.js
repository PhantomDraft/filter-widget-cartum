// src/filterWidget.js
// ESM module for npm: export FilterWidget class with full API and debug logs

/** Represents a single filter option */
class FilterOption {
  constructor(name, url, imageUrl = null) {
    this.name     = String(name);
    this.url      = String(url);
    this.imageUrl = imageUrl ? String(imageUrl) : null;
    console.log('[FilterOption]', this.name, this.url, this.imageUrl);
  }
}

/** Parses filter lists from a Document */
class FilterParser {
  constructor(doc, selectors, hideZero) {
    this.doc       = doc;
    this.selectors = selectors;
    this.hideZero  = Boolean(hideZero);
    console.log('[FilterParser] init selectors=', selectors, 'hideZero=', this.hideZero);
  }

  parse() {
    console.log('[FilterParser] parse() start');
    const out = [];

    const uls = this.selectors
      .map(sel => Array.from(this.doc.querySelectorAll(sel)))
      .flat();

    uls.forEach(ul => {
      ul.querySelectorAll('li').forEach(li => {
        const a = li.querySelector('a');
        if (!a) return;

        if (this.hideZero) {
          const sup = li.querySelector('sup.filter-count');
          const cnt = sup ? parseInt(sup.textContent, 10) : NaN;
          if (!isNaN(cnt) && cnt <= 0) return;
        }

        const titleEl = li.querySelector('span.filter-title');
        const name    = titleEl ? titleEl.textContent.trim() : a.textContent.trim();

        const rawHref = a.getAttribute('href');
        console.log('[FilterParser] rawHref:', rawHref);

        let absUrl = '';
        try {
          absUrl = new URL(rawHref, window.location.origin).href;
        } catch (e) {
          console.warn('[FilterParser] cannot parse href, leaving empty:', rawHref);
        }

        out.push(new FilterOption(name, absUrl));
      });
    });

    console.log('[FilterParser] parse() result count=', out.length);
    return out;
  }
}

/** Renders the options into the existing brands container */
class FilterRenderer {
  /**
   * @param {FilterOption[]} options
   * @param {string} targetSelector
   * @param {{[name:string]:string}} imageMap
   * @param {{[name:string]:string}} labelMap
   * @param {(opt:FilterOption)=>string} labelFormatter
   */
  constructor(options, targetSelector, imageMap = {}, labelMap = {}, labelFormatter = null) {
    this.options       = options;
    this.targetSelector= targetSelector;
    this.imageMap      = imageMap;
    this.labelMap      = labelMap;
    this.labelFormatter= labelFormatter;
    this.container     = document.querySelector(targetSelector);
    console.log('[FilterRenderer] init target=', targetSelector, 'imageMap=', Object.keys(imageMap));
    if (!this.container) console.warn(`[FilterRenderer] target "${targetSelector}" not found`);
  }

  render() {
    console.log('[FilterRenderer] render() start, options=', this.options.length);
    if (!this.container) return;
    this.options.forEach(opt => {
      const li = document.createElement('li');
      li.className = 'frontBrands-i';

      const a = document.createElement('a');
      a.href      = opt.url;
      a.rel       = 'nofollow';
      a.className = 'frontBrands-a filter-block';
      a.title     = opt.name;

      if (this.imageMap[opt.name]) {
        const img = document.createElement('img');
        img.src       = this.imageMap[opt.name];
        img.alt       = opt.name;
        img.className = 'frontBrands-img filter-block__img';
        a.appendChild(img);
      } else {
        const span = document.createElement('span');
        let display = opt.name;
        if (typeof this.labelFormatter === 'function') {
          display = this.labelFormatter(opt);
        } else if (this.labelMap[opt.name]) {
          display = this.labelMap[opt.name];
        }
        span.textContent = display;
        span.className   = 'filter-block__label';
        a.appendChild(span);
      }

      li.appendChild(a);
      this.container.appendChild(li);
    });
    console.log('[FilterRenderer] render() done');
  }
}

/** Main widget controller */
class FilterWidget {
  /**
   * @param {Object} config
   * @param {string[]} config.sourceSelectors   — CSS selectors for UL filter lists
   * @param {string}   config.targetSelector    — CSS selector for UL.frontBrands-list
   * @param {boolean}  [config.hideOutOfStock=false]
   * @param {{[name:string]:string}} [config.imageMap={}]
   * @param {string}   [config.catalogUrl]      — URL to fetch catalog HTML
   * @param {boolean}  [config.autoExpand=false]
   * @param {boolean}  [config.disableExpander=false]
   * @param {string|string[]} [config.runOn='home'] — 'home' | 'all' | ['/path1',...]
   */
  static init(config) {
    console.log('[FilterWidget] init config=', config);

    // Basic validation
    if (
      !config ||
      !Array.isArray(config.sourceSelectors) ||
      typeof config.targetSelector !== 'string'
    ) {
      console.error('[FilterWidget] invalid config', config);
      return;
    }

    // runOn check
    const path = window.location.pathname;
    const runOn = config.runOn ?? 'home';
    console.log('[FilterWidget] runOn=', runOn, 'path=', path);
    if (runOn === 'home' && path !== '/') {
      console.log('[FilterWidget] skipping, not homepage');
      return;
    }
    if (runOn !== 'home' && runOn !== 'all') {
      const arr = Array.isArray(runOn) ? runOn : [runOn];
      if (!arr.includes(path)) {
        console.log('[FilterWidget] skipping, path not in runOn list');
        return;
      }
    }

    // Document processing function
    const processDoc = doc => {
      console.log('[FilterWidget] processing document');
      const opts = new FilterParser(doc, config.sourceSelectors, config.hideOutOfStock).parse();

      const target = document.querySelector(config.targetSelector);
      console.log('[FilterWidget] found target element', target);
      if (!target) return;

      // autoExpand: remove inline height/overflow and CSS toggle class
      if (config.autoExpand) {
        console.log('[FilterWidget] applying autoExpand');
        target.style.removeProperty('height');
        target.style.overflow = 'visible';
        target.classList.remove('__toggle');
      }
      // disableExpander: hide "show more" button
      if (config.disableExpander) {
        console.log('[FilterWidget] disabling expander');
        const btn = document.querySelector('.frontBrands-expander a');
        if (btn) btn.style.display = 'none';
      }

      new FilterRenderer(
        opts,
        config.targetSelector,
        config.imageMap     || {},
        config.labelMap     || {},
        config.labelFormatter || null
      ).render();
    };

    // Fetch or use current doc
    if (config.catalogUrl) {
      console.log('[FilterWidget] fetching catalogUrl=', config.catalogUrl);
      fetch(config.catalogUrl, { credentials: 'same-origin' })
        .then(r => r.ok ? r.text() : Promise.reject(r.status))
        .then(html => {
          console.log('[FilterWidget] catalog HTML fetched');
          const doc = new DOMParser().parseFromString(html, 'text/html');
          processDoc(doc);
        })
        .catch(err => console.error('[FilterWidget] fetch error:', err));
    } else {
      console.log('[FilterWidget] using current document');
      processDoc(document);
    }
  }
}

if (typeof window !== 'undefined' && window.FilterWidget && window.FilterWidget.default) {
  window.FilterWidget = window.FilterWidget.default;
}

export default FilterWidget;