/**
 * VÉLURE Boutique - Shopping Cart Module
 * Handles cart state, quantities, discounts, subtotals, and LocalStorage persistence.
 * Tailored for Tamil Nadu, India Flagship Operations.
 */

const CART_STORAGE_KEY = 'velure_boutique_cart';
const COUPON_STORAGE_KEY = 'velure_applied_coupon';
const ORDERS_STORAGE_KEY = 'velure_boutique_orders';

const SHIPPING_BASE_FEE = 15.00;
const FREE_SHIPPING_THRESHOLD = 150.00;

class CartManager {
  constructor() {
    this.items = this.loadCart();
    this.appliedCoupon = this.loadCoupon();
    this.listeners = [];
  }

  /**
   * Subscribe to cart updates
   */
  onChange(callback) {
    this.listeners.push(callback);
  }

  notify() {
    this.saveCart();
    this.listeners.forEach((fn) => fn(this.getSummary()));
  }

  loadCart() {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Error loading cart from storage:', e);
      return [];
    }
  }

  saveCart() {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(this.items));
    } catch (e) {
      console.error('Error saving cart to storage:', e);
    }
  }

  loadCoupon() {
    try {
      const saved = localStorage.getItem(COUPON_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  }

  saveCoupon(coupon) {
    this.appliedCoupon = coupon;
    if (coupon) {
      localStorage.setItem(COUPON_STORAGE_KEY, JSON.stringify(coupon));
    } else {
      localStorage.removeItem(COUPON_STORAGE_KEY);
    }
  }

  /**
   * Add product to cart with chosen size, color, quantity
   */
  addItem(product, quantity = 1, size = 'M', color = 'Noir Black') {
    const qty = Math.max(1, parseInt(quantity, 10) || 1);
    const existingIndex = this.items.findIndex(
      (item) => item.id === product.id && item.size === size && item.color === color
    );

    if (existingIndex > -1) {
      this.items[existingIndex].quantity += qty;
    } else {
      this.items.push({
        id: product.id,
        title: product.title,
        price: Number(product.price),
        discountPercentage: product.discountPercentage || 0,
        thumbnail: product.thumbnail || (product.images && product.images[0]) || '',
        category: product.category,
        size: size,
        color: color,
        quantity: qty
      });
    }

    this.notify();
    return true;
  }

  /**
   * Remove specific item by index
   */
  removeItem(index) {
    if (index >= 0 && index < this.items.length) {
      const removed = this.items.splice(index, 1);
      this.notify();
      return removed[0];
    }
    return null;
  }

  /**
   * Update item quantity
   */
  updateQuantity(index, quantity) {
    const qty = parseInt(quantity, 10);
    if (isNaN(qty) || qty <= 0) {
      return this.removeItem(index);
    }

    if (this.items[index]) {
      this.items[index].quantity = qty;
      this.notify();
    }
  }

  /**
   * Increment quantity by 1
   */
  increment(index) {
    if (this.items[index]) {
      this.items[index].quantity += 1;
      this.notify();
    }
  }

  /**
   * Decrement quantity by 1
   */
  decrement(index) {
    if (this.items[index]) {
      if (this.items[index].quantity > 1) {
        this.items[index].quantity -= 1;
        this.notify();
      } else {
        this.removeItem(index);
      }
    }
  }

  /**
   * Clear all items in cart
   */
  clearCart() {
    this.items = [];
    this.saveCoupon(null);
    this.notify();
  }

  /**
   * Apply coupon code
   */
  applyCoupon(code) {
    if (!code) {
      return { success: false, message: 'Please enter a coupon code.' };
    }

    const cleanCode = code.trim().toUpperCase();
    const coupon = AVAILABLE_COUPONS[cleanCode];

    if (!coupon) {
      return {
        success: false,
        message: 'Invalid promo code. Try "WELCOME15", "LUXE40" or "FREESHIP".'
      };
    }

    this.saveCoupon({ code: cleanCode, ...coupon });
    this.notify();
    return {
      success: true,
      message: `Coupon "${cleanCode}" applied: ${coupon.description}`
    };
  }

  /**
   * Remove current coupon
   */
  removeCoupon() {
    this.saveCoupon(null);
    this.notify();
    return { success: true, message: 'Coupon removed successfully.' };
  }

  /**
   * Compute comprehensive financial calculations
   */
  getSummary() {
    const subtotal = this.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    const totalItemCount = this.items.reduce((sum, item) => sum + item.quantity, 0);

    let discountAmount = 0;
    let shipping = subtotal >= FREE_SHIPPING_THRESHOLD || subtotal === 0 ? 0 : SHIPPING_BASE_FEE;

    if (this.appliedCoupon) {
      if (this.appliedCoupon.discountPercent) {
        discountAmount = (subtotal * this.appliedCoupon.discountPercent) / 100;
      }
      if (this.appliedCoupon.freeShipping) {
        shipping = 0;
      }
    }

    const total = Math.max(0, subtotal - discountAmount + shipping);

    return {
      items: this.items,
      itemCount: totalItemCount,
      subtotal: Number(subtotal.toFixed(2)),
      discountAmount: Number(discountAmount.toFixed(2)),
      shipping: Number(shipping.toFixed(2)),
      total: Number(total.toFixed(2)),
      appliedCoupon: this.appliedCoupon,
      freeShippingThresholdRemaining: Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal)
    };
  }

  /**
   * Record finished order in localStorage
   */
  recordOrder(customerDetails) {
    const summary = this.getSummary();
    const orderRecord = {
      orderId: 'VEL-TN-' + Math.floor(100000 + Math.random() * 900000),
      date: new Date().toISOString(),
      customer: customerDetails,
      items: [...this.items],
      subtotal: summary.subtotal,
      discountAmount: summary.discountAmount,
      shipping: summary.shipping,
      total: summary.total,
      coupon: this.appliedCoupon ? this.appliedCoupon.code : null,
      status: 'Confirmed - Preparing for Dispatch from Chennai, Tamil Nadu Atelier'
    };

    try {
      const orders = JSON.parse(localStorage.getItem(ORDERS_STORAGE_KEY) || '[]');
      orders.unshift(orderRecord);
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
    } catch (e) {
      console.error('Error saving order history:', e);
    }

    this.clearCart();
    return orderRecord;
  }
}

// Export singleton instance
const cartManager = new CartManager();
/**
 * VÉLURE Boutique - Wishlist Module
 * Handles wishlist state, heart icon toggling, and LocalStorage persistence.
 */

const WISHLIST_STORAGE_KEY = 'velure_boutique_wishlist';

class WishlistManager {
  constructor() {
    this.items = this.loadWishlist();
    this.listeners = [];
  }

  onChange(callback) {
    this.listeners.push(callback);
  }

  notify() {
    this.saveWishlist();
    this.listeners.forEach((fn) => fn(this.items));
  }

  loadWishlist() {
    try {
      const saved = localStorage.getItem(WISHLIST_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.error('Error loading wishlist from storage:', e);
      return [];
    }
  }

  saveWishlist() {
    try {
      localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(this.items));
    } catch (e) {
      console.error('Error saving wishlist to storage:', e);
    }
  }

  isInWishlist(productId) {
    return this.items.some((item) => item.id === Number(productId));
  }

  toggle(product) {
    const id = Number(product.id);
    const index = this.items.findIndex((item) => item.id === id);

    if (index > -1) {
      this.items.splice(index, 1);
      this.notify();
      return { added: false, count: this.items.length };
    } else {
      this.items.push({
        id: product.id,
        title: product.title,
        price: Number(product.price),
        discountPercentage: product.discountPercentage || 0,
        thumbnail: product.thumbnail || (product.images && product.images[0]) || '',
        category: product.category,
        rating: product.rating
      });
      this.notify();
      return { added: true, count: this.items.length };
    }
  }

  remove(productId) {
    const id = Number(productId);
    const index = this.items.findIndex((item) => item.id === id);
    if (index > -1) {
      this.items.splice(index, 1);
      this.notify();
      return true;
    }
    return false;
  }

  getItems() {
    return this.items;
  }

  getCount() {
    return this.items.length;
  }
}

// Export singleton instance
const wishlistManager = new WishlistManager();
/**
 * VÉLURE Boutique - Main Application Logic
 * Coordinates rendering, event handling, filters, modals, search, and animations.
 * Strictly focused on Tamil Nadu, India Flagship Operations.
 */

document.addEventListener('DOMContentLoaded', () => {
  VelureApp.init();
});

const VelureApp = {
  state: {
    allProducts: [],
    filteredProducts: [],
    activeCategory: 'all',
    activeSort: 'default',
    searchQuery: '',
    visibleCount: 12,
    pageSize: 8,
    selectedSize: 'M',
    selectedColor: 'Noir Black',
    quickViewProduct: null,
    quickViewQuantity: 1
  },

  // Promotional Offers (Minimum 3 required) - Strictly Tamil Nadu Focused
  promotions: [
    {
      code: 'WELCOME15',
      badge: 'First Purchase',
      discount: '15% OFF',
      title: 'New Season Welcome Privilege',
      description: 'Enjoy 15% off your maiden haute couture order with complimentary express delivery across Tamil Nadu.',
      expiry: 'Valid for all Tamil Nadu patrons',
      bgGradient: 'linear-gradient(135deg, #1f1f1f 0%, #2c2523 100%)'
    },
    {
      code: 'LUXE40',
      badge: 'Runway Special',
      discount: '40% OFF',
      title: 'Tamil Nadu Haute Showcase',
      description: 'Exclusive 40% privilege on selected evening wear, cocktail gowns, and designer silks in Tamil Nadu.',
      expiry: 'Limited time boutique flash',
      bgGradient: 'linear-gradient(135deg, #2b1f24 0%, #3d242c 100%)'
    },
    {
      code: 'FREESHIP',
      badge: 'State Courier',
      discount: 'FREE SHIPPING',
      title: 'Tamil Nadu Express Delivery',
      description: 'Zero shipping fee across all Tamil Nadu districts (Chennai, Coimbatore, Madurai, Trichy, Salem).',
      expiry: 'Applicable across Tamil Nadu',
      bgGradient: 'linear-gradient(135deg, #1b262c 0%, #172a3a 100%)'
    }
  ],

  // Customer Testimonials (Minimum 3 required) - Strictly Tamil Nadu Patrons
  testimonials: [
    {
      name: 'Dr. Priyadarshini Sundaram',
      role: 'Fashion Consultant & Stylist',
      avatar: 'assets/avatar-1.webp',
      rating: 5,
      comment: 'VÉLURE captures quintessential South Indian grandeur infused with modern runway couture. The bespoke silk gown arrived within 24 hours to our Chennai residence.',
      location: 'Nungambakkam, Chennai, Tamil Nadu'
    },
    {
      name: 'Karthik Ramaswamy',
      role: 'Creative Director & Architect',
      avatar: 'assets/avatar-2.webp',
      rating: 5,
      comment: 'The tailoring on the poplin shirts and handcrafted footwear is immaculate. It is rare to find such world-class sartorial finesse right here in Coimbatore.',
      location: 'RS Puram, Coimbatore, Tamil Nadu'
    },
    {
      name: 'Meenakshi Natarajan',
      role: 'Heritage Textiles Curator',
      avatar: 'assets/avatar-3.webp',
      rating: 5,
      comment: 'The curated leather accessories and sunglasses rival the finest luxury ateliers. Having this flagship salon in Tamil Nadu has redefined designer shopping for us.',
      location: 'KK Nagar, Madurai, Tamil Nadu'
    }
  ],

  async init() {
    this.initAOS();
    this.setupUIEventListeners();
    this.setupCartWishlistListeners();
    this.renderPromotions();
    this.renderTestimonials();
    this.renderFeaturedCategories();
    await this.loadProducts();
  },

  initAOS() {
    if (typeof AOS !== 'undefined') {
      AOS.init({
        duration: 750,
        once: true,
        offset: 60,
        easing: 'ease-out-cubic',
        disableMutationObserver: false
      });
    }
  },

  refreshAOS() {
    if (typeof AOS !== 'undefined') {
      setTimeout(() => {
        AOS.refresh();
      }, 100);
    }
  },

  async loadProducts() {
    const productsContainer = document.getElementById('products-grid');
    const newArrivalsContainer = document.getElementById('new-arrivals-grid');
    const loadingState = document.getElementById('products-loading');
    const errorState = document.getElementById('products-error');

    try {
      if (loadingState) loadingState.classList.remove('hidden');
      if (errorState) errorState.classList.add('hidden');

      // Fetch products using DummyJSON API
      const products = await api.getAllFashionProducts();
      this.state.allProducts = products;
      this.state.filteredProducts = [...products];

      if (loadingState) loadingState.classList.add('hidden');

      // Render New Arrivals (first 4 items with highest discounts or latest IDs)
      this.renderNewArrivals(products.slice(0, 4));

      // Render main collection grid
      this.applyFilterAndSort();
    } catch (error) {
      console.error('Error in loadProducts:', error);
      if (loadingState) loadingState.classList.add('hidden');
      if (errorState) errorState.classList.remove('hidden');
    }
  },

  renderFeaturedCategories() {
    const container = document.getElementById('featured-categories-grid');
    if (!container) return;

    const categories = api.getFeaturedCategories();
    const cards = categories.filter((c) => c.slug !== 'all').slice(0, 6);

    container.innerHTML = cards
      .map(
        (cat, idx) => `
        <div class="category-card" data-aos="fade-up" data-aos-delay="${idx * 100}" onclick="VelureApp.selectCategory('${cat.slug}')">
          <div class="category-img-wrapper">
            <img src="${cat.image}" alt="${cat.name}" loading="lazy" />
            <div class="category-overlay">
              <span class="category-badge">${cat.badge}</span>
              <div class="category-content">
                <i class="fa-solid ${cat.icon} category-icon"></i>
                <h3 class="category-title">${cat.name}</h3>
                <p class="category-tagline">${cat.tagline}</p>
                <span class="category-cta">Explore Collection <i class="fa-solid fa-arrow-right"></i></span>
              </div>
            </div>
          </div>
        </div>
      `
      )
      .join('');
    this.refreshAOS();
  },

  renderNewArrivals(items) {
    const container = document.getElementById('new-arrivals-grid');
    if (!container) return;

    container.innerHTML = items
      .map(
        (product, idx) => `
        <div class="product-card new-arrival-card" data-aos="fade-up" data-aos-delay="${idx * 100}">
          <div class="product-img-box">
            <img src="${product.thumbnail}" alt="${product.title}" loading="lazy" />
            <span class="badge-tag new">NEW ARRIVAL</span>
            ${product.discountPercentage > 0 ? `<span class="badge-tag discount">-${Math.round(product.discountPercentage)}%</span>` : ''}
            
            <div class="product-action-bar">
              <button class="action-btn" title="Quick View" onclick="VelureApp.openQuickView(${product.id})">
                <i class="fa-solid fa-eye"></i>
              </button>
              <a href="404.html" class="action-btn wishlist-btn" title="Wishlist">
                <i class="fa-regular fa-heart"></i>
              </a>
              <a href="404.html" class="action-btn cart-btn" title="Add to Bag">
                <i class="fa-solid fa-bag-shopping"></i>
              </a>
            </div>
          </div>
          <div class="product-info">
            <span class="product-category">${this.formatCategoryName(product.category)}</span>
            <h4 class="product-title" onclick="VelureApp.openQuickView(${product.id})">${product.title}</h4>
            <div class="product-rating">
              <div class="stars">${this.renderStars(product.rating)}</div>
              <span class="rating-num">(${product.rating})</span>
            </div>
            <div class="product-price-row">
              <span class="current-price">₹${product.price.toFixed(2)}</span>
              ${this.calcOriginalPrice(product.price, product.discountPercentage)}
            </div>
          </div>
        </div>
      `
      )
      .join('');
    this.refreshAOS();
  },

  applyFilterAndSort() {
    let result = [...this.state.allProducts];

    // Filter by category
    if (this.state.activeCategory !== 'all') {
      result = result.filter((p) => p.category === this.state.activeCategory);
    }

    // Filter by search query
    if (this.state.searchQuery.trim() !== '') {
      const q = this.state.searchQuery.toLowerCase().trim();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q) ||
          p.category.toLowerCase().includes(q) ||
          (p.tags && p.tags.some((t) => t.toLowerCase().includes(q)))
      );
    }

    // Sort products
    switch (this.state.activeSort) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating-high':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'discount-high':
        result.sort((a, b) => b.discountPercentage - a.discountPercentage);
        break;
      default:
        break;
    }

    this.state.filteredProducts = result;
    this.renderProductsGrid();
    this.updateResultsCount(result.length);
  },

  renderProductsGrid() {
    const container = document.getElementById('products-grid');
    const emptyState = document.getElementById('products-empty');
    const loadMoreBtn = document.getElementById('load-more-btn');
    if (!container) return;

    if (this.state.filteredProducts.length === 0) {
      container.innerHTML = '';
      if (emptyState) emptyState.classList.remove('hidden');
      if (loadMoreBtn) loadMoreBtn.classList.add('hidden');
      return;
    }

    if (emptyState) emptyState.classList.add('hidden');

    const visibleItems = this.state.filteredProducts.slice(0, this.state.visibleCount);

    container.innerHTML = visibleItems
      .map(
        (product, idx) => `
        <div class="product-card" data-aos="fade-up" data-aos-delay="${(idx % 4) * 80}">
          <div class="product-img-box">
            <img src="${product.thumbnail}" alt="${product.title}" loading="lazy" />
            ${product.discountPercentage > 12 ? `<span class="badge-tag discount">-${Math.round(product.discountPercentage)}%</span>` : ''}
            ${product.stock < 10 ? `<span class="badge-tag low-stock">Low Stock</span>` : ''}
            
            <div class="product-action-bar">
              <button class="action-btn" title="Quick View" onclick="VelureApp.openQuickView(${product.id})">
                <i class="fa-solid fa-eye"></i>
              </button>
              <a href="404.html" class="action-btn wishlist-btn" title="Wishlist">
                <i class="fa-regular fa-heart"></i>
              </a>
              <a href="404.html" class="action-btn cart-btn" title="Add to Bag">
                <i class="fa-solid fa-bag-shopping"></i>
              </a>
            </div>
          </div>
          <div class="product-info">
            <span class="product-category">${this.formatCategoryName(product.category)}</span>
            <h4 class="product-title" onclick="VelureApp.openQuickView(${product.id})">${product.title}</h4>
            <div class="product-rating">
              <div class="stars">${this.renderStars(product.rating)}</div>
              <span class="rating-num">(${product.rating})</span>
            </div>
            <div class="product-price-row">
              <span class="current-price">₹${product.price.toFixed(2)}</span>
              ${this.calcOriginalPrice(product.price, product.discountPercentage)}
            </div>
          </div>
        </div>
      `
      )
      .join('');

    // Toggle Load More button
    if (loadMoreBtn) {
      if (this.state.visibleCount >= this.state.filteredProducts.length) {
        loadMoreBtn.classList.add('hidden');
      } else {
        loadMoreBtn.classList.remove('hidden');
        loadMoreBtn.innerHTML = `Load More Creations (${this.state.filteredProducts.length - this.state.visibleCount} remaining) <i class="fa-solid fa-chevron-down"></i>`;
      }
    }

    this.refreshAOS();
  },

  renderPromotions() {
    const container = document.getElementById('promotions-grid');
    if (!container) return;

    container.innerHTML = this.promotions
      .map(
        (promo, idx) => `
        <div class="promo-card" data-aos="fade-up" data-aos-delay="${idx * 120}" style="background: ${promo.bgGradient};">
          <div class="promo-header">
            <span class="promo-badge">${promo.badge}</span>
            <span class="promo-discount">${promo.discount}</span>
          </div>
          <h3 class="promo-title">${promo.title}</h3>
          <p class="promo-description">${promo.description}</p>
          <div class="promo-footer">
            <div class="coupon-box" onclick="VelureApp.copyCouponCode('${promo.code}')" title="Click to copy coupon code">
              <span class="coupon-code">${promo.code}</span>
              <button class="copy-btn"><i class="fa-regular fa-copy"></i> Copy</button>
            </div>
            <span class="promo-expiry"><i class="fa-solid fa-location-dot"></i> ${promo.expiry}</span>
          </div>
        </div>
      `
      )
      .join('');
    this.refreshAOS();
  },

  renderTestimonials() {
    const container = document.getElementById('testimonials-grid');
    if (!container) return;

    container.innerHTML = this.testimonials
      .map(
        (t, idx) => `
        <div class="testimonial-card" data-aos="fade-up" data-aos-delay="${idx * 120}">
          <div class="quote-icon"><i class="fa-solid fa-quote-left"></i></div>
          <p class="testimonial-comment">"${t.comment}"</p>
          <div class="testimonial-rating">${this.renderStars(t.rating)}</div>
          <div class="testimonial-author">
            <img src="${t.avatar}" alt="${t.name}" class="author-img" />
            <div class="author-info">
              <h5 class="author-name">${t.name}</h5>
              <span class="author-role">${t.role}</span>
              <span class="author-location"><i class="fa-solid fa-location-dot"></i> ${t.location}</span>
            </div>
          </div>
        </div>
      `
      )
      .join('');
    this.refreshAOS();
  },

  setupUIEventListeners() {
    // Search input with debouncing
    const searchInput = document.getElementById('search-input');
    const searchClearBtn = document.getElementById('search-clear-btn');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.state.searchQuery = e.target.value;
        this.state.visibleCount = 12;
        if (searchClearBtn) {
          searchClearBtn.style.display = e.target.value ? 'block' : 'none';
        }
        this.applyFilterAndSort();
      });
    }

    if (searchClearBtn) {
      searchClearBtn.addEventListener('click', () => {
        if (searchInput) searchInput.value = '';
        this.state.searchQuery = '';
        searchClearBtn.style.display = 'none';
        this.applyFilterAndSort();
      });
    }

    // Category filter buttons
    const filterButtons = document.querySelectorAll('.category-filter-btn');
    filterButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        filterButtons.forEach((b) => b.classList.remove('active'));
        btn.classList.add('active');
        this.state.activeCategory = btn.getAttribute('data-category');
        this.state.visibleCount = 12;
        this.applyFilterAndSort();
      });
    });

    // Sort select
    const sortSelect = document.getElementById('sort-select');
    if (sortSelect) {
      sortSelect.addEventListener('change', (e) => {
        this.state.activeSort = e.target.value;
        this.applyFilterAndSort();
      });
    }

    // Load More button
    const loadMoreBtn = document.getElementById('load-more-btn');
    if (loadMoreBtn) {
      loadMoreBtn.addEventListener('click', () => {
        this.state.visibleCount += this.state.pageSize;
        this.renderProductsGrid();
      });
    }

    // Mobile Navigation Toggle
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileNavDrawer = document.getElementById('mobile-nav-drawer');
    const mobileNavClose = document.getElementById('mobile-nav-close');
    const mobileNavOverlay = document.getElementById('mobile-nav-overlay');

    const toggleMobileNav = (open) => {
      if (!mobileNavDrawer || !mobileNavOverlay) return;
      if (open) {
        mobileNavDrawer.classList.add('open');
        mobileNavOverlay.classList.add('open');
        document.body.style.overflow = 'hidden';
      } else {
        mobileNavDrawer.classList.remove('open');
        mobileNavOverlay.classList.remove('open');
        document.body.style.overflow = '';
      }
    };

    if (mobileMenuBtn) mobileMenuBtn.addEventListener('click', () => toggleMobileNav(true));
    if (mobileNavClose) mobileNavClose.addEventListener('click', () => toggleMobileNav(false));
    if (mobileNavOverlay) mobileNavOverlay.addEventListener('click', () => toggleMobileNav(false));

    // Mobile Nav links
    document.querySelectorAll('.mobile-nav-link').forEach((link) => {
      link.addEventListener('click', () => toggleMobileNav(false));
    });

    // Cart Drawer Toggles
    const cartBtn = document.getElementById('header-cart-btn');
    const cartDrawer = document.getElementById('cart-drawer');
    const cartCloseBtn = document.getElementById('cart-drawer-close');
    const cartOverlay = document.getElementById('cart-drawer-overlay');

    const toggleCartDrawer = (open) => {
      if (!cartDrawer || !cartOverlay) return;
      if (open) {
        cartDrawer.classList.add('open');
        cartOverlay.classList.add('open');
        document.body.style.overflow = 'hidden';
        this.renderCartUI();
      } else {
        cartDrawer.classList.remove('open');
        cartOverlay.classList.remove('open');
        document.body.style.overflow = '';
      }
    };

    if (cartBtn) cartBtn.addEventListener('click', () => toggleCartDrawer(true));
    if (cartCloseBtn) cartCloseBtn.addEventListener('click', () => toggleCartDrawer(false));
    if (cartOverlay) cartOverlay.addEventListener('click', () => toggleCartDrawer(false));

    // Wishlist Drawer Toggles
    const wishlistBtn = document.getElementById('header-wishlist-btn');
    const wishlistDrawer = document.getElementById('wishlist-drawer');
    const wishlistCloseBtn = document.getElementById('wishlist-drawer-close');
    const wishlistOverlay = document.getElementById('wishlist-drawer-overlay');

    const toggleWishlistDrawer = (open) => {
      if (!wishlistDrawer || !wishlistOverlay) return;
      if (open) {
        wishlistDrawer.classList.add('open');
        wishlistOverlay.classList.add('open');
        document.body.style.overflow = 'hidden';
        this.renderWishlistUI();
      } else {
        wishlistDrawer.classList.remove('open');
        wishlistOverlay.classList.remove('open');
        document.body.style.overflow = '';
      }
    };

    if (wishlistBtn) wishlistBtn.addEventListener('click', () => toggleWishlistDrawer(true));
    if (wishlistCloseBtn) wishlistCloseBtn.addEventListener('click', () => toggleWishlistDrawer(false));
    if (wishlistOverlay) wishlistOverlay.addEventListener('click', () => toggleWishlistDrawer(false));

    // Coupon Apply Form
    const couponForm = document.getElementById('coupon-form');
    if (couponForm) {
      couponForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const input = document.getElementById('coupon-input');
        const code = input ? input.value : '';
        const res = cartManager.applyCoupon(code);
        this.showToast(res.message, res.success ? 'success' : 'error');
        if (res.success && input) input.value = '';
      });
    }

    // Newsletter Subscription Form (Validates email then redirects to 404)
    const newsletterForm = document.getElementById('newsletter-form');
    if (newsletterForm) {
      newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const emailInput = document.getElementById('newsletter-email');
        if (!emailInput) return;

        const email = emailInput.value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!emailRegex.test(email)) {
          this.showToast('Please enter a valid email address.', 'error');
          emailInput.focus();
          return;
        }

        // Successfully validated: redirect to 404 page
        window.location.href = '404.html';
      });
    }

    // Quick View Modal Close
    const qvModal = document.getElementById('quickview-modal');
    const qvClose = document.getElementById('quickview-close');
    const qvBackdrop = document.getElementById('quickview-backdrop');

    if (qvClose) qvClose.addEventListener('click', () => this.closeQuickView());
    if (qvBackdrop) qvBackdrop.addEventListener('click', () => this.closeQuickView());

    // Checkout Modal Setup
    const checkoutBtn = document.getElementById('cart-checkout-btn');
    const checkoutModal = document.getElementById('checkout-modal');
    const checkoutClose = document.getElementById('checkout-modal-close');
    const checkoutBackdrop = document.getElementById('checkout-backdrop');
    const checkoutForm = document.getElementById('checkout-form');

    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', () => {
        if (cartManager.items.length === 0) {
          this.showToast('Your shopping bag is empty.', 'error');
          return;
        }
        toggleCartDrawer(false);
        this.openCheckoutModal();
      });
    }

    if (checkoutClose) checkoutClose.addEventListener('click', () => this.closeCheckoutModal());
    if (checkoutBackdrop) checkoutBackdrop.addEventListener('click', () => this.closeCheckoutModal());

    if (checkoutForm) {
      checkoutForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleCheckoutSubmit();
      });
    }

    // Confirmation Receipt Modal Close
    const orderModalClose = document.getElementById('order-confirmation-close');
    const orderModalBackdrop = document.getElementById('order-confirmation-backdrop');
    if (orderModalClose) orderModalClose.addEventListener('click', () => this.closeOrderConfirmation());
    if (orderModalBackdrop) orderModalBackdrop.addEventListener('click', () => this.closeOrderConfirmation());

    // Sticky Header Scroll effect
    window.addEventListener('scroll', () => {
      const header = document.querySelector('.site-header');
      if (header) {
        if (window.scrollY > 40) {
          header.classList.add('scrolled');
        } else {
          header.classList.remove('scrolled');
        }
      }
    });
  },

  setupCartWishlistListeners() {
    this.updateCartBadge(cartManager.getSummary().itemCount);
    this.updateWishlistBadge(wishlistManager.getCount());

    cartManager.onChange((summary) => {
      this.updateCartBadge(summary.itemCount);
      this.renderCartUI();
    });

    wishlistManager.onChange((items) => {
      this.updateWishlistBadge(items.length);
      this.renderWishlistUI();
      this.renderProductsGrid();
      if (this.state.allProducts.length > 0) {
        this.renderNewArrivals(this.state.allProducts.slice(0, 4));
      }
    });
  },

  updateCartBadge(count) {
    const badges = document.querySelectorAll('.cart-count-badge');
    badges.forEach((b) => {
      b.textContent = count;
      b.style.display = count > 0 ? 'inline-flex' : 'none';
    });
  },

  updateWishlistBadge(count) {
    const badges = document.querySelectorAll('.wishlist-count-badge');
    badges.forEach((b) => {
      b.textContent = count;
      b.style.display = count > 0 ? 'inline-flex' : 'none';
    });
  },

  updateResultsCount(count) {
    const label = document.getElementById('results-count-label');
    if (label) {
      label.textContent = `Showing ${Math.min(count, this.state.visibleCount)} of ${count} luxury creations`;
    }
  },

  selectCategory(categorySlug) {
    this.state.activeCategory = categorySlug;
    this.state.visibleCount = 12;

    const buttons = document.querySelectorAll('.category-filter-btn');
    buttons.forEach((btn) => {
      if (btn.getAttribute('data-category') === categorySlug) {
        btn.classList.add('active');
      } else {
        btn.classList.remove('active');
      }
    });

    const section = document.getElementById('main-collection');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    this.applyFilterAndSort();
  },

  quickAddToCart(productId) {
    const product = this.state.allProducts.find((p) => p.id === productId);
    if (!product) return;

    cartManager.addItem(product, 1, 'M', 'Noir Black');
    this.showToast(`"${product.title}" added to your bag`, 'success');
  },

  handleWishlistToggle(productId) {
    const product = this.state.allProducts.find((p) => p.id === productId);
    if (!product) return;

    const res = wishlistManager.toggle(product);
    if (res.added) {
      this.showToast(`Saved "${product.title}" to Wishlist`, 'success');
    } else {
      this.showToast(`Removed "${product.title}" from Wishlist`, 'info');
    }
  },

  copyCouponCode(code) {
    navigator.clipboard.writeText(code).then(() => {
      this.showToast(`Privilege code "${code}" copied! Applying to bag...`, 'success');
      cartManager.applyCoupon(code);
    }).catch(() => {
      cartManager.applyCoupon(code);
      this.showToast(`Privilege code "${code}" applied to bag!`, 'success');
    });
  },

  renderCartUI() {
    const container = document.getElementById('cart-items-container');
    const emptyNotice = document.getElementById('cart-empty-state');
    const footer = document.getElementById('cart-drawer-footer');
    if (!container) return;

    const summary = cartManager.getSummary();

    if (summary.items.length === 0) {
      container.innerHTML = '';
      if (emptyNotice) emptyNotice.classList.remove('hidden');
      if (footer) footer.classList.add('hidden');
      return;
    }

    if (emptyNotice) emptyNotice.classList.add('hidden');
    if (footer) footer.classList.remove('hidden');

    container.innerHTML = summary.items
      .map(
        (item, index) => `
        <div class="cart-item">
          <img src="${item.thumbnail}" alt="${item.title}" class="cart-item-thumb" />
          <div class="cart-item-details">
            <h5 class="cart-item-title">${item.title}</h5>
            <div class="cart-item-meta">
              <span>Size: <strong>${item.size}</strong></span> | 
              <span>Color: <strong>${item.color}</strong></span>
            </div>
            <div class="cart-item-price">₹${item.price.toFixed(2)}</div>
            <div class="cart-quantity-row">
              <div class="qty-stepper">
                <button type="button" onclick="cartManager.decrement(${index})" title="Decrease" aria-label="Decrease">
                  <i class="fa-solid fa-minus"></i>
                </button>
                <span>${item.quantity}</span>
                <button type="button" onclick="cartManager.increment(${index})" title="Increase" aria-label="Increase">
                  <i class="fa-solid fa-plus"></i>
                </button>
              </div>
              <button type="button" class="cart-item-remove-btn" onclick="cartManager.removeItem(${index})" title="Remove item">
                <i class="fa-regular fa-trash-can"></i> Remove
              </button>
            </div>
          </div>
        </div>
      `
      )
      .join('');

    // Update monetary breakdown
    const subtotalEl = document.getElementById('cart-subtotal');
    const discountEl = document.getElementById('cart-discount');
    const discountRow = document.getElementById('cart-discount-row');
    const shippingEl = document.getElementById('cart-shipping');
    const totalEl = document.getElementById('cart-grand-total');
    const freeShippingEl = document.getElementById('free-shipping-progress');

    if (subtotalEl) subtotalEl.textContent = `₹${summary.subtotal.toFixed(2)}`;

    if (discountRow && discountEl) {
      if (summary.discountAmount > 0) {
        discountRow.classList.remove('hidden');
        discountEl.textContent = `-₹${summary.discountAmount.toFixed(2)} (${summary.appliedCoupon.code})`;
      } else {
        discountRow.classList.add('hidden');
      }
    }

    if (shippingEl) {
      shippingEl.textContent = summary.shipping === 0 ? 'COMPLIMENTARY' : `₹${summary.shipping.toFixed(2)}`;
    }

    if (totalEl) totalEl.textContent = `₹${summary.total.toFixed(2)}`;

    if (freeShippingEl) {
      if (summary.freeShippingThresholdRemaining > 0) {
        freeShippingEl.innerHTML = `Add <strong>₹${summary.freeShippingThresholdRemaining.toFixed(2)}</strong> more for Complimentary Express Courier across Tamil Nadu.`;
      } else {
        freeShippingEl.innerHTML = `<i class="fa-solid fa-circle-check text-gold"></i> Unlocked Complimentary Express Courier across Tamil Nadu!`;
      }
    }
  },

  renderWishlistUI() {
    const container = document.getElementById('wishlist-items-container');
    const emptyNotice = document.getElementById('wishlist-empty-state');
    if (!container) return;

    const items = wishlistManager.getItems();

    if (items.length === 0) {
      container.innerHTML = '';
      if (emptyNotice) emptyNotice.classList.remove('hidden');
      return;
    }

    if (emptyNotice) emptyNotice.classList.add('hidden');

    container.innerHTML = items
      .map(
        (item) => `
        <div class="wishlist-item">
          <img src="${item.thumbnail}" alt="${item.title}" class="wishlist-thumb" />
          <div class="wishlist-item-info">
            <h5 class="wishlist-item-title">${item.title}</h5>
            <div class="wishlist-item-price">₹${item.price.toFixed(2)}</div>
            <div class="wishlist-actions">
              <button class="btn-primary-sm" onclick="VelureApp.moveWishlistToCart(${item.id})">
                <i class="fa-solid fa-bag-shopping"></i> Add to Bag
              </button>
              <button class="btn-ghost-sm" onclick="wishlistManager.remove(${item.id})" title="Remove">
                <i class="fa-regular fa-trash-can"></i>
              </button>
            </div>
          </div>
        </div>
      `
      )
      .join('');
  },

  moveWishlistToCart(productId) {
    const product = this.state.allProducts.find((p) => p.id === productId);
    if (!product) return;

    cartManager.addItem(product, 1, 'M', 'Noir Black');
    wishlistManager.remove(productId);
    this.showToast(`"${product.title}" moved to your bag!`, 'success');
  },

  openQuickView(productId) {
    const product = this.state.allProducts.find((p) => p.id === productId);
    if (!product) return;

    this.state.quickViewProduct = product;
    this.state.quickViewQuantity = 1;
    this.state.selectedSize = product.sizes ? product.sizes[0] : 'M';
    this.state.selectedColor = product.colors ? product.colors[0].name : 'Noir Black';

    const modal = document.getElementById('quickview-modal');
    if (!modal) return;

    // Populate data
    document.getElementById('qv-title').textContent = product.title;
    document.getElementById('qv-category').textContent = this.formatCategoryName(product.category);
    document.getElementById('qv-sku').textContent = `SKU: ${product.sku || 'VEL-TN-' + product.id}`;
    document.getElementById('qv-price').textContent = `₹${product.price.toFixed(2)}`;
    document.getElementById('qv-description').textContent = product.description;
    document.getElementById('qv-stock').textContent = product.stock > 0 ? `In Stock (${product.stock} pieces remaining at Tamil Nadu Atelier)` : 'Temporarily Unavailable';
    document.getElementById('qv-rating-stars').innerHTML = this.renderStars(product.rating);
    document.getElementById('qv-rating-text').textContent = `${product.rating} / 5 (${product.reviews ? product.reviews.length : 3} verified reviews)`;
    document.getElementById('qv-warranty').textContent = product.warrantyInformation || 'Full 2-Year Atelier Warranty & Authenticity Guarantee (Tamil Nadu)';
    document.getElementById('qv-shipping').textContent = product.shippingInformation || 'Same-Day / Next-Day Insured Courier across Tamil Nadu';
    document.getElementById('qv-qty-input').value = 1;

    // Image gallery
    const images = (product.images && product.images.length > 0) ? product.images : [product.thumbnail];
    const mainImg = document.getElementById('qv-main-image');
    mainImg.src = images[0];

    const thumbGallery = document.getElementById('qv-thumbnails');
    thumbGallery.innerHTML = images
      .map(
        (imgUrl, idx) => `
        <img src="${imgUrl}" alt="${product.title}" class="qv-thumb ${idx === 0 ? 'active' : ''}" onclick="VelureApp.switchQuickViewImage('${imgUrl}', this)" />
      `
      )
      .join('');

    // Size Selector
    const sizeContainer = document.getElementById('qv-sizes');
    if (sizeContainer && product.sizes) {
      sizeContainer.innerHTML = product.sizes
        .map(
          (size, idx) => `
          <button type="button" class="size-pill ${idx === 0 ? 'active' : ''}" onclick="VelureApp.selectSize('${size}', this)">${size}</button>
        `
        )
        .join('');
    }

    // Color Selector
    const colorContainer = document.getElementById('qv-colors');
    if (colorContainer && product.colors) {
      colorContainer.innerHTML = product.colors
        .map(
          (c, idx) => `
          <button type="button" class="color-swatch ${idx === 0 ? 'active' : ''}" style="background-color: ${c.hex};" title="${c.name}" onclick="VelureApp.selectColor('${c.name}', this)"></button>
        `
        )
        .join('');
    }

    // Reviews list
    const reviewsContainer = document.getElementById('qv-reviews-list');
    if (reviewsContainer) {
      const reviews = product.reviews && product.reviews.length > 0 ? product.reviews : [
        { reviewerName: 'Dr. Priyadarshini Sundaram', rating: 5, comment: 'Flawless quality, silhouette is stunning for Chennai galas.' },
        { reviewerName: 'Karthik Ramaswamy', rating: 5, comment: 'Exceptional craftsmanship and swift delivery in Coimbatore.' }
      ];

      reviewsContainer.innerHTML = reviews
        .map(
          (rev) => `
          <div class="qv-review-item">
            <div class="qv-rev-head">
              <span class="qv-rev-name"><i class="fa-solid fa-user-check text-gold"></i> ${rev.reviewerName}</span>
              <span class="qv-rev-stars">${this.renderStars(rev.rating)}</span>
            </div>
            <p class="qv-rev-comment">"${rev.comment}"</p>
          </div>
        `
        )
        .join('');
    }

    // Show modal
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  },

  switchQuickViewImage(url, elem) {
    const mainImg = document.getElementById('qv-main-image');
    if (mainImg) mainImg.src = url;
    document.querySelectorAll('.qv-thumb').forEach((t) => t.classList.remove('active'));
    if (elem) elem.classList.add('active');
  },

  selectSize(size, elem) {
    this.state.selectedSize = size;
    document.querySelectorAll('.size-pill').forEach((p) => p.classList.remove('active'));
    if (elem) elem.classList.add('active');
  },

  selectColor(colorName, elem) {
    this.state.selectedColor = colorName;
    document.querySelectorAll('.color-swatch').forEach((s) => s.classList.remove('active'));
    if (elem) elem.classList.add('active');
    const colorLabel = document.getElementById('qv-selected-color-name');
    if (colorLabel) colorLabel.textContent = colorName;
  },

  adjustQuickViewQty(delta) {
    const input = document.getElementById('qv-qty-input');
    if (!input) return;
    let val = parseInt(input.value, 10) || 1;
    val = Math.max(1, val + delta);
    input.value = val;
    this.state.quickViewQuantity = val;
  },

  addQuickViewToCart() {
    if (!this.state.quickViewProduct) return;
    const input = document.getElementById('qv-qty-input');
    const qty = input ? parseInt(input.value, 10) || 1 : 1;

    cartManager.addItem(
      this.state.quickViewProduct,
      qty,
      this.state.selectedSize,
      this.state.selectedColor
    );

    this.showToast(
      `Added ${qty}x "${this.state.quickViewProduct.title}" (${this.state.selectedSize}, ${this.state.selectedColor}) to your bag`,
      'success'
    );
    this.closeQuickView();
  },

  closeQuickView() {
    const modal = document.getElementById('quickview-modal');
    if (modal) modal.classList.remove('open');
    document.body.style.overflow = '';
    this.state.quickViewProduct = null;
  },

  openCheckoutModal() {
    const modal = document.getElementById('checkout-modal');
    if (!modal) return;

    const summary = cartManager.getSummary();
    const subtotalEl = document.getElementById('checkout-subtotal');
    const discountEl = document.getElementById('checkout-discount');
    const shippingEl = document.getElementById('checkout-shipping');
    const totalEl = document.getElementById('checkout-total');
    const itemsPreview = document.getElementById('checkout-items-preview');

    if (subtotalEl) subtotalEl.textContent = `₹${summary.subtotal.toFixed(2)}`;
    if (discountEl) discountEl.textContent = `-₹${summary.discountAmount.toFixed(2)}`;
    if (shippingEl) shippingEl.textContent = summary.shipping === 0 ? 'Complimentary' : `₹${summary.shipping.toFixed(2)}`;
    if (totalEl) totalEl.textContent = `₹${summary.total.toFixed(2)}`;

    if (itemsPreview) {
      itemsPreview.innerHTML = summary.items
        .map(
          (item) => `
          <div class="checkout-item-row">
            <span class="chk-item-name">${item.title} (x${item.quantity}) - ${item.size}</span>
            <span class="chk-item-price">₹${(item.price * item.quantity).toFixed(2)}</span>
          </div>
        `
        )
        .join('');
    }

    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  },

  closeCheckoutModal() {
    const modal = document.getElementById('checkout-modal');
    if (modal) modal.classList.remove('open');
    document.body.style.overflow = '';
  },

  handleCheckoutSubmit() {
    const name = document.getElementById('chk-name').value;
    const email = document.getElementById('chk-email').value;
    const phone = document.getElementById('chk-phone').value;
    const address = document.getElementById('chk-address').value;
    const city = document.getElementById('chk-city').value;
    const state = 'Tamil Nadu';
    const country = 'India';
    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked').value;

    const customerDetails = { name, email, phone, address, city, state, country, paymentMethod };
    const orderRecord = cartManager.recordOrder(customerDetails);

    this.closeCheckoutModal();
    this.showOrderConfirmation(orderRecord);
  },

  showOrderConfirmation(order) {
    const modal = document.getElementById('order-confirmation-modal');
    if (!modal) return;

    document.getElementById('conf-order-id').textContent = order.orderId;
    document.getElementById('conf-customer-name').textContent = order.customer.name;
    document.getElementById('conf-customer-email').textContent = order.customer.email;
    document.getElementById('conf-shipping-address').textContent = `${order.customer.address}, ${order.customer.city}, Tamil Nadu, India`;
    document.getElementById('conf-order-total').textContent = `₹${order.total.toFixed(2)}`;
    document.getElementById('conf-payment-method').textContent = order.customer.paymentMethod;

    const itemsList = document.getElementById('conf-items-list');
    if (itemsList) {
      itemsList.innerHTML = order.items
        .map(
          (i) => `
          <div class="conf-item-row">
            <span>${i.title} (${i.size}, ${i.color}) x${i.quantity}</span>
            <strong>₹${(i.price * i.quantity).toFixed(2)}</strong>
          </div>
        `
        )
        .join('');
    }

    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  },

  closeOrderConfirmation() {
    const modal = document.getElementById('order-confirmation-modal');
    if (modal) modal.classList.remove('open');
    document.body.style.overflow = '';
  },

  showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast-pill ${type}`;

    let icon = 'fa-circle-info';
    if (type === 'success') icon = 'fa-circle-check';
    if (type === 'error') icon = 'fa-circle-exclamation';

    toast.innerHTML = `
      <i class="fa-solid ${icon}"></i>
      <span class="toast-text">${message}</span>
    `;

    container.appendChild(toast);

    setTimeout(() => {
      toast.classList.add('show');
    }, 10);

    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 400);
    }, 3800);
  },

  formatCategoryName(slug) {
    const names = {
      'womens-dresses': "Women's Dresses",
      'womens-shoes': "Women's Footwear",
      'womens-bags': 'Luxury Bags',
      'womens-jewellery': 'Fine Jewellery',
      'womens-watches': 'Timepieces',
      'mens-shirts': "Men's Apparel",
      'mens-shoes': "Men's Footwear",
      'mens-watches': "Men's Timepieces",
      'sunglasses': 'Designer Eyewear',
      'tops': 'Tops & Blouses'
    };
    return names[slug] || slug.replace('-', ' ').toUpperCase();
  },

  renderStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalf = rating - fullStars >= 0.4;
    let starsHtml = '';

    for (let i = 0; i < fullStars; i++) {
      starsHtml += '<i class="fa-solid fa-star"></i>';
    }
    if (hasHalf) {
      starsHtml += '<i class="fa-solid fa-star-half-stroke"></i>';
    }
    const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
      starsHtml += '<i class="fa-regular fa-star"></i>';
    }
    return starsHtml;
  },

  calcOriginalPrice(price, discountPercent) {
    if (!discountPercent || discountPercent <= 0) return '';
    const original = price / (1 - discountPercent / 100);
    return `<span class="original-price">₹${original.toFixed(2)}</span>`;
  }
};
