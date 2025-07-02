/**
 * Filter widget module for Cartum/Horoshop platforms.
 *
 * The module exports the FilterWidget class used to render catalog filters on
 * various pages. Each helper class logs its initialization to aid debugging.
 */

// All indentation uses tabs and strings are wrapped in single quotes.

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
       * @param {string} title
       * @param {string} titleTag
       * @param {string} titleClass
       */
       constructor(options, targetSelector, imageMap = {}, labelMap = {}, labelFormatter = null, brandLast = false, autoExpand = false, expanderText = 'Expand', title = '', titleTag = 'span', titleClass = '') {
               this.options       = options;
               this.targetSelector= targetSelector;
               this.imageMap      = imageMap;
               this.labelMap      = labelMap;
               this.labelFormatter= labelFormatter;
               this.brandLast     = brandLast;
               this.autoExpand    = autoExpand;
               this.expanderText  = expanderText;
               this.title         = String(title || '');
               this.titleTag      = String(titleTag || 'span');
               this.titleClass    = String(titleClass || '');
               this.container     = document.querySelector(targetSelector);
               console.log('[FilterRenderer] init target=', targetSelector, 'imageMap=', Object.keys(imageMap));
               if (!this.container) console.warn(`[FilterRenderer] target "${targetSelector}" not found`);
       }

	render() {
		console.log('[FilterRenderer] render() start, options=', this.options.length);
		if (!this.container) return;
               const parent = this.container.parentNode;
               this.container.remove();

               // Optional title before the list(s)
               if (this.title) {
                       const h = document.createElement(this.titleTag);
                       if (this.titleClass) h.className = this.titleClass;
                       h.textContent = this.title;
                       parent.appendChild(h);
               }

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
 * @param {Object} config Configuration object for the widget.
 * @param {string[]} config.sourceSelectors CSS selectors of the original filter lists.
 * @param {string} [config.targetSelector] Selector of the block to replace.
 * @param {{targetSelector:string, match:(opt:FilterOption)=>boolean, brandLast?:boolean, title?:string, titleTag?:string, titleClass?:string}[]} [config.groups]
 * @param {boolean} [config.hideOutOfStock=false] Hide options with zero count.
 * @param {{[name:string]:string}} [config.imageMap={}] Mapping of option names to image URLs.
 * @param {string} [config.catalogUrl] URL of the catalog page to fetch filters from.
 * @param {boolean} [config.autoExpand=false] Expand the list immediately without an expander button.
 * @param {boolean} [config.brandLast=false] Place brand filters after general filters.
 * @param {string} [config.expanderText='Expand'] Text for the expander button.
 * @param {string} [config.title] Optional heading text before the list.
 * @param {string} [config.titleTag='span'] Tag name for the heading wrapper.
 * @param {string} [config.titleClass] Class name for the heading wrapper.
 * @param {string|string[]} [config.runOn='home'] Pages on which to run the widget.
 */
constructor(config) {
console.log('[FilterWidget] constructor config=', config);
if (!config || !Array.isArray(config.sourceSelectors)) {
throw new Error('[FilterWidget] invalid config');
}
const hasTarget = typeof config.targetSelector === 'string';
const hasGroups = Array.isArray(config.groups) && config.groups.length > 0;
if (!hasTarget && !hasGroups) {
throw new Error('[FilterWidget] missing targetSelector or groups');
}
this.config = {
imageMap: {},
labelMap: {},
hideOutOfStock: false,
autoExpand: false,
brandLast: false,
expanderText: 'Expand',
title: '',
titleTag: 'span',
titleClass: '',
runOn: 'home',
...config
};
}

/** Initialize the widget according to the provided configuration. */
init() {
if (!this.#shouldRun()) {
return;
}
if (this.config.catalogUrl) {
fetch(this.config.catalogUrl, { credentials: 'same-origin' })
.then(r => (r.ok ? r.text() : Promise.reject(r.status)))
.then(html => this.#processDoc(new DOMParser().parseFromString(html, 'text/html')))
.catch(err => console.error('[FilterWidget] fetch error:', err));
} else {
this.#processDoc(document);
}
}

/** Determine whether the widget should run on the current page. */
#shouldRun() {
const path = window.location.pathname;
const runOn = this.config.runOn;
if (runOn === 'home' && path !== '/') {
return false;
}
if (runOn !== 'home' && runOn !== 'all') {
const arr = Array.isArray(runOn) ? runOn : [runOn];
if (!arr.includes(path)) {
return false;
}
}
return true;
}

/**
 * Check if an option matches a condition.
 * @param {FilterOption} opt
 * @param {Function|RegExp|string|null} match
 * @returns {boolean}
 */
#matchOpt(opt, match) {
if (!match) return true;
if (typeof match === 'function') return match(opt);
if (match instanceof RegExp) return match.test(opt.url);
if (typeof match === 'string') return opt.url.includes(match);
return false;
}

/**
 * Parse filters from the given document and render them.
 * @param {Document} doc
 */
#processDoc(doc) {
const cfg = this.config;
const opts = new FilterParser(doc, cfg.sourceSelectors, cfg.hideOutOfStock).parse();
const hasGroups = Array.isArray(cfg.groups) && cfg.groups.length > 0;
const groups = hasGroups ? cfg.groups : [{ targetSelector: cfg.targetSelector, match: null, brandLast: cfg.brandLast, title: cfg.title, titleTag: cfg.titleTag, titleClass: cfg.titleClass }];
groups.forEach(g => {
const subset = opts.filter(o => this.#matchOpt(o, g.match));
if (subset.length === 0) return;
const target = document.querySelector(g.targetSelector);
if (!target) return;
const renderer = new FilterRenderer(
       subset,
       g.targetSelector,
       cfg.imageMap,
       cfg.labelMap,
       cfg.labelFormatter || null,
       g.brandLast ?? false,
       cfg.autoExpand,
       cfg.expanderText,
       g.title ?? cfg.title,
       g.titleTag ?? cfg.titleTag,
       g.titleClass ?? cfg.titleClass
);
renderer.render();
});
}

/** Shortcut to create and immediately run the widget. */
static init(config) {
const widget = new FilterWidget(config);
widget.init();
return widget;
}
}

if (typeof window !== 'undefined') {
window.FilterWidget = FilterWidget;
}

export default FilterWidget;