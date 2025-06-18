/*
 * filterWidget.js
 * Robust OOP-based filter widget with configurable API and security hardening.
 * Usage:
 *   FilterWidget.init({
 *     sourceSelectors: ['.filter__listScroll'], // array of container selectors or ['all']
 *     targetSelector: '.frontBrands.__grayscale',
 *     hideOutOfStock: true,
 *     imageMap: { 'Canon': '/images/brands/canon.png' }
 *   });
 */

/** Represents a single filter option */
class FilterOption {
  /**
   * @param {string} name - Display name of the filter (sanitized)
   * @param {string} url - Absolute URL to apply this filter
   * @param {?string} imageUrl - Optional URL for rendering an image
   */
  constructor(name, url, imageUrl = null) {
    this.name = String(name);
    this.url = String(url);
    this.imageUrl = imageUrl ? String(imageUrl) : null;
  }
}

/** Parses filter containers into FilterOption instances */
class FilterParser {
  /**
   * @param {string[]} selectors - CSS selectors to find filter lists or ['all']
   * @param {boolean} hideZero - whether to hide options with zero count
   */
  constructor(selectors, hideZero) {
    this.selectors = selectors;
    this.hideZero = Boolean(hideZero);
  }

  /**
   * @returns {FilterOption[]}
   */
  parse() {
    const options = [];
    const containers = this.selectors.includes('all')
      ? Array.from(document.querySelectorAll('ul, ol'))
      : this.selectors.map(sel => document.querySelector(sel)).filter(el => el);

    containers.forEach(container => {
      Array.from(container.children).forEach(item => {
        // Skip non-list items and section titles
        if (!(item instanceof HTMLElement)) return;
        if (item.classList.contains('filter__section-title')) return;

        const anchor = item.querySelector('a');
        if (!anchor) return;

        // Hide out-of-stock if configured
        if (this.hideZero) {
          const countNode = item.querySelector('.filter__count');
          const count = countNode ? parseInt(countNode.textContent, 10) : NaN;
          if (!isNaN(count) && count <= 0) return;
        }

        const name = anchor.textContent.trim();
        const url = anchor.href;

        options.push(new FilterOption(name, url));
      });
    });

    return options;
  }
}

/** Renders FilterOption instances as stylized link blocks */
class FilterRenderer {
  /**
   * @param {FilterOption[]} options
   * @param {string} targetSelector
   * @param {{[name: string]: string}} imageMap
   */
  constructor(options, targetSelector, imageMap = {}) {
    this.options = options;
    this.target = document.querySelector(targetSelector);
    if (!this.target) throw new Error(`Render target not found: ${targetSelector}`);
    this.imageMap = imageMap;
  }

  render() {
    this.options.forEach(opt => {
      // Create link element
      const link = document.createElement('a');
      link.href = opt.url;
      link.rel = 'nofollow';
      link.className = 'filter-block';
      link.title = opt.name;

      // Append image or text
      const imgUrl = this.imageMap[opt.name];
      if (imgUrl) {
        const img = document.createElement('img');
        img.src = imgUrl;
        img.alt = opt.name;
        img.className = 'filter-block__img';
        link.appendChild(img);
      } else {
        const span = document.createElement('span');
        span.textContent = opt.name;
        span.className = 'filter-block__label';
        link.appendChild(span);
      }

      this.target.appendChild(link);
    });
  }
}

/** Main widget controller with init API */
class FilterWidget {
  /**
   * Initialize and render the widget
   * @param {Object} config
   * @param {string[]} config.sourceSelectors
   * @param {string} config.targetSelector
   * @param {boolean} [config.hideOutOfStock=false]
   * @param {{[name: string]: string}} [config.imageMap={}]
   */
  static init(config) {
    try {
      // Validate config
      FilterWidget.validateConfig(config);
      // Only run on homepage
      if (window.location.pathname !== '/') return;
      // Ensure target exists
      if (!document.querySelector(config.targetSelector)) return;

      const parser = new FilterParser(config.sourceSelectors, config.hideOutOfStock);
      const options = parser.parse();

      // Optional: separate brands by config.imageMap keys
      const brandNames = Object.keys(config.imageMap);
      const brandOptions = options.filter(opt => brandNames.includes(opt.name));
      const otherOptions = options.filter(opt => !brandNames.includes(opt.name));

      // Render others first
      new FilterRenderer(otherOptions, config.targetSelector).render();
      // Render brands with images
      new FilterRenderer(brandOptions, config.targetSelector, config.imageMap).render();
    } catch (err) {
      console.error('FilterWidget error:', err);
    }
  }

  static validateConfig(cfg) {
    if (!cfg || typeof cfg !== 'object') throw new Error('Config object required');
    if (!Array.isArray(cfg.sourceSelectors) || !cfg.sourceSelectors.length)
      throw new Error('sourceSelectors must be a non-empty array');
    if (typeof cfg.targetSelector !== 'string' || !cfg.targetSelector)
      throw new Error('targetSelector must be a non-empty string');
    if (cfg.imageMap && typeof cfg.imageMap !== 'object')
      throw new Error('imageMap must be an object mapping names to URLs');
  }
}

// Auto-initialize example (customize or remove if loading manually)
document.addEventListener('DOMContentLoaded', () => {
  FilterWidget.init({
    sourceSelectors: ['.filter__listScroll'],
    targetSelector: '.frontBrands.__grayscale',
    hideOutOfStock: true,
    imageMap: {
      'Canon': '/images/brands/canon.png',
      'Nikon': '/images/brands/nikon.png'
    }
  });
});

/* Security review notes:
 * - All text inserted via textContent to prevent XSS
 * - URL and imageMap values cast to String
 * - No innerHTML usage
 * - link.rel="nofollow" to prevent crawler issues
 * - Wrapped execution in try/catch
 * - Validate config before use
 */