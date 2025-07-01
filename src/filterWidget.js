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
    const uls = this.selectors.map(sel => Array.from(this.doc.querySelectorAll(sel))).flat();
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
        const rawHref = a.getAttribute('data-fake-href') || a.getAttribute('href');
        out.push(new FilterOption(name, rawHref));
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
   * @param {boolean} brandLast
   * @param {boolean} autoExpand
   * @param {string} expanderText
   */
  constructor(options, targetSelector, imageMap = {}, labelMap = {}, labelFormatter = null, brandLast = false, autoExpand = false, expanderText = 'Expand') {
    this.options       = options;
    this.targetSelector= targetSelector;
    this.imageMap      = imageMap;
    this.labelMap      = labelMap;
    this.labelFormatter= labelFormatter;
    this.brandLast     = brandLast;
    this.autoExpand    = autoExpand;
    this.expanderText  = expanderText;
    this.container     = document.querySelector(targetSelector);
    console.log('[FilterRenderer] init target=', targetSelector, 'imageMap=', Object.keys(imageMap));
    if (!this.container) console.warn(`[FilterRenderer] target "${targetSelector}" not found`);
  }

  render() {
    console.log('[FilterRenderer] render() start, options=', this.options.length);
    if (!this.container) return;
    const parent = this.container.parentNode;
    this.container.remove();

    // Helper to create a collapsed UL
    const baseClass = this.container ? this.container.className : 'frontBrands-list';
    const createList = () => {
      const ul = document.createElement('ul');
      ul.className = baseClass;
      ul.classList.add('__collapsed');
      return ul;
    };

    let lists = [];
    if (this.brandLast) {
      const generalUl = createList();
      const brandUl   = createList();
      this.options.forEach(opt => {
        const li = document.createElement('li'); li.className = 'frontBrands-i';
        const a  = document.createElement('a');
        a.href = opt.url; a.rel = 'nofollow';
        a.className = 'frontBrands-a filter-block'; a.title = opt.name;
        if (this.imageMap[opt.name]) {
          const img = document.createElement('img');
          img.src = this.imageMap[opt.name]; img.alt = opt.name;
          img.className = 'frontBrands-img filter-block__img';
          a.appendChild(img);
        } else {
          const span = document.createElement('span');
          let display = opt.name;
          if (typeof this.labelFormatter === 'function') display = this.labelFormatter(opt);
          else if (this.labelMap[opt.name]) display = this.labelMap[opt.name];
          span.textContent = display; span.className = 'filter-block__label';
          a.appendChild(span);
        }
        li.appendChild(a);
        (/\/filter\/brand=/.test(opt.url) ? brandUl : generalUl).appendChild(li);
      });
      lists = [generalUl, brandUl];
    } else {
      const singleUl = createList();
      this.options.forEach(opt => {
        const li = document.createElement('li'); li.className = 'frontBrands-i';
        const a  = document.createElement('a');
        a.href = opt.url; a.rel = 'nofollow';
        a.className = 'frontBrands-a filter-block'; a.title = opt.name;
        if (this.imageMap[opt.name]) {
          const img = document.createElement('img'); img.src = this.imageMap[opt.name]; img.alt = opt.name;
          img.className = 'frontBrands-img filter-block__img'; a.appendChild(img);
        } else {
          const span = document.createElement('span');
          let display = opt.name;
          if (typeof this.labelFormatter === 'function') display = this.labelFormatter(opt);
          else if (this.labelMap[opt.name]) display = this.labelMap[opt.name];
          span.textContent = display; span.className = 'filter-block__label'; a.appendChild(span);
        }
        li.appendChild(a);
        singleUl.appendChild(li);
      });
      lists = [singleUl];
    }

    // Append lists
    lists.forEach(ul => parent.appendChild(ul));

    // Expander logic
    if (!this.autoExpand) {
      const expander = document.createElement('div');
      expander.className = 'frontBrands-expander';
      const btn = document.createElement('a');
      btn.href = '#'; btn.textContent = this.expanderText;
      btn.addEventListener('click', e => {
        e.preventDefault();
        lists.forEach(ul => ul.classList.replace('__collapsed', '__expanded'));
        expander.remove();
      });
      expander.appendChild(btn);
      parent.appendChild(expander);
    } else {
      lists.forEach(ul => ul.classList.replace('__collapsed', '__expanded'));
    }

    console.log('[FilterRenderer] render() done');
  }
}

/** Main widget controller */
class FilterWidget {
  /**
   * @param {Object} config
   * @param {string[]} config.sourceSelectors
   * @param {string}   [config.targetSelector]
   * @param {{targetSelector:string, match:(opt:FilterOption)=>boolean}[]} [config.groups]
   * @param {boolean}  [config.hideOutOfStock=false]
   * @param {{[name:string]:string}} [config.imageMap={}]
   * @param {string}   [config.catalogUrl]
   * @param {boolean}  [config.autoExpand=false]
   * @param {boolean}  [config.brandLast=false]
   * @param {string}   [config.expanderText='Expand']
   * @param {string|string[]} [config.runOn='home']
   */
  static init(config) {
    console.log('[FilterWidget] init config=', config);
    if (!config || !Array.isArray(config.sourceSelectors)) {
      console.error('[FilterWidget] invalid config', config);
      return;
    }
    const hasTarget = typeof config.targetSelector === 'string';
    const hasGroups = Array.isArray(config.groups) && config.groups.length > 0;
    if (!hasTarget && !hasGroups) {
      console.error('[FilterWidget] missing targetSelector or groups', config);
      return;
    }
    const path = window.location.pathname;
    const runOn = config.runOn ?? 'home';
    if (runOn === 'home' && path !== '/') return;
    if (runOn !== 'home' && runOn !== 'all') {
      const arr = Array.isArray(runOn) ? runOn : [runOn];
      if (!arr.includes(path)) return;
    }
    const matchOpt = (opt, match) => {
      if (!match) return true;
      if (typeof match === 'function') return match(opt);
      if (match instanceof RegExp) return match.test(opt.url);
      if (typeof match === 'string') return opt.url.includes(match);
      return false;
    };
    const processDoc = doc => {
      const opts = new FilterParser(doc, config.sourceSelectors, config.hideOutOfStock).parse();
      const groups = hasGroups ? config.groups : [{ targetSelector: config.targetSelector, match: null, brandLast: config.brandLast }];
      groups.forEach(g => {
        const subset = opts.filter(o => matchOpt(o, g.match));
        if (subset.length === 0) return;
        const target = document.querySelector(g.targetSelector);
        if (!target) return;
        const renderer = new FilterRenderer(
          subset,
          g.targetSelector,
          config.imageMap     || {},
          config.labelMap     || {},
          config.labelFormatter || null,
          g.brandLast ?? false,
          config.autoExpand,
          config.expanderText || 'Expand'
        );
        renderer.render();
      });
    };
    if (config.catalogUrl) {
      fetch(config.catalogUrl, { credentials: 'same-origin' })
        .then(r => r.ok ? r.text() : Promise.reject(r.status))
        .then(html => processDoc(new DOMParser().parseFromString(html, 'text/html')))
        .catch(err => console.error('[FilterWidget] fetch error:', err));
    } else processDoc(document);
  }
}

if (typeof window !== 'undefined' && window.FilterWidget && window.FilterWidget.default) {
  window.FilterWidget = window.FilterWidget.default;
}

export default FilterWidget;