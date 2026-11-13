/**
 * VÉLURE Boutique - Data & API Services
 * Fetches dynamic products from DummyJSON and provides curated Tamil Nadu boutique datasets.
 */

const API_BASE_URL = 'https://dummyjson.com';

const FASHION_CATEGORY_SLUGS = [
  'womens-dresses',
  'womens-shoes',
  'womens-bags',
  'womens-jewellery',
  'womens-watches',
  'tops',
  'mens-shirts',
  'mens-shoes',
  'mens-watches',
  'sunglasses'
];

const CATEGORY_METADATA = [
  {
    slug: 'all',
    name: 'All Collection',
    tagline: 'Curated Haute Couture',
    badge: 'Popular',
    icon: 'fa-wand-magic-sparkles',
    image: 'assets/hero-banner.webp'
  },
  {
    slug: 'womens-dresses',
    name: "Women's Dresses",
    tagline: 'Evening Gowns & Silk Silhouettes',
    badge: 'New',
    icon: 'fa-person-dress',
    image: 'assets/cat-dresses.webp'
  },
  {
    slug: 'womens-bags',
    name: 'Luxury Handbags',
    tagline: 'Italian Leather & Statement Totes',
    badge: 'Trending',
    icon: 'fa-bag-shopping',
    image: 'assets/cat-bags.webp'
  },
  {
    slug: 'womens-shoes',
    name: "Women's Footwear",
    tagline: 'Stiletto Heels & Velvet Mules',
    badge: 'Best Seller',
    icon: 'fa-shoe-prints',
    image: 'assets/cat-shoes.webp'
  },
  {
    slug: 'mens-shirts',
    name: "Men's Apparel",
    tagline: 'Tailored Poplin & Oxford Classics',
    badge: 'Premium',
    icon: 'fa-shirt',
    image: 'assets/cat-shirts.webp'
  },
  {
    slug: 'sunglasses',
    name: 'Designer Eyewear',
    tagline: 'Acetate Frames & UV Protection',
    badge: 'Limited',
    icon: 'fa-glasses',
    image: 'assets/cat-eyewear.webp'
  },
  {
    slug: 'womens-jewellery',
    name: 'Fine Jewellery',
    tagline: 'Gold Vermeil & Akoya Pearls',
    badge: 'Exclusive',
    icon: 'fa-gem',
    image: 'assets/cat-jewellery.webp'
  },
  {
    slug: 'womens-watches',
    name: 'Timepieces',
    tagline: 'Swiss Chronographs & Rose Gold',
    badge: 'Luxury',
    icon: 'fa-clock',
    image: 'assets/cat-watches.webp'
  }
];

const AVAILABLE_COUPONS = {
  'WELCOME15': { discountPercent: 15, description: '15% Off Your Entire Order across Tamil Nadu' },
  'LUXE40': { discountPercent: 40, description: '40% Off Haute Runway Special' },
  'FASHION10': { discountPercent: 10, description: '10% Off Boutique Favourites' },
  'FREESHIP': { freeShipping: true, description: 'Complimentary Express Courier across Tamil Nadu' }
};

const PROMOTIONS_DATA = [
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
];

const TESTIMONIALS_DATA = [
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
];

class BoutiqueAPI {
  constructor() {
    this.cache = {
      allProducts: null,
      categories: null
    };
  }

  async request(endpoint) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`);
      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`BoutiqueAPI Error fetching ${endpoint}:`, error);
      throw error;
    }
  }

  async getAllFashionProducts(forceRefresh = false) {
    if (this.cache.allProducts && !forceRefresh) {
      return this.cache.allProducts;
    }

    try {
      const data = await this.request('/products?limit=194');
      const allProducts = data.products || [];

      let fashionProducts = allProducts.filter((product) =>
        FASHION_CATEGORY_SLUGS.includes(product.category)
      );

      fashionProducts = fashionProducts.map((item) => ({
        ...item,
        sizes: item.category.includes('shoes')
          ? ['EU 37', 'EU 38', 'EU 39', 'EU 40', 'EU 41']
          : item.category.includes('accessories') || item.category.includes('sunglasses') || item.category.includes('watches') || item.category.includes('jewellery') || item.category.includes('bags')
          ? ['One Size']
          : ['XS', 'S', 'M', 'L', 'XL'],
        colors: [
          { name: 'Noir Black', hex: '#111111' },
          { name: 'Champagne Gold', hex: '#D4AF37' },
          { name: 'Ivory Cream', hex: '#FDFBF7' },
          { name: 'Rose Blush', hex: '#E8C5C8' }
        ],
        isNewArrival: item.id % 2 === 0,
        isTrending: item.rating >= 4.0 || item.discountPercentage > 15
      }));

      this.cache.allProducts = fashionProducts;
      return fashionProducts;
    } catch (error) {
      console.error('Failed to load fashion products from API:', error);
      throw error;
    }
  }

  async getProductsByCategory(categorySlug) {
    if (categorySlug === 'all') {
      return await this.getAllFashionProducts();
    }

    try {
      const data = await this.request(`/products/category/${encodeURIComponent(categorySlug)}`);
      const allFashion = await this.getAllFashionProducts();
      const matched = allFashion.filter((p) => p.category === categorySlug);
      return matched.length > 0 ? matched : (data.products || []);
    } catch (error) {
      console.warn(`Fallback to local category filter for ${categorySlug}:`, error);
      const allFashion = await this.getAllFashionProducts();
      return allFashion.filter((p) => p.category === categorySlug);
    }
  }

  async searchProducts(query) {
    if (!query || query.trim() === '') {
      return await this.getAllFashionProducts();
    }

    const trimmed = query.trim().toLowerCase();
    try {
      const allFashion = await this.getAllFashionProducts();
      const filtered = allFashion.filter(
        (p) =>
          p.title.toLowerCase().includes(trimmed) ||
          p.description.toLowerCase().includes(trimmed) ||
          p.category.toLowerCase().includes(trimmed) ||
          (p.tags && p.tags.some((t) => t.toLowerCase().includes(trimmed)))
      );
      return filtered;
    } catch (error) {
      console.error('Search failed:', error);
      throw error;
    }
  }

  async getProductById(id) {
    try {
      const allFashion = await this.getAllFashionProducts();
      const existing = allFashion.find((p) => p.id === Number(id));
      if (existing) return existing;

      const direct = await this.request(`/products/${id}`);
      return direct;
    } catch (error) {
      console.error(`Failed to fetch product ${id}:`, error);
      throw error;
    }
  }

  getFeaturedCategories() {
    return CATEGORY_METADATA;
  }
}

const api = new BoutiqueAPI();
