# VÉLURE — Haute & Contemporary Fashion Boutique • Tamil Nadu

A luxury, editorial-grade e-commerce boutique website built with **vanilla HTML5, CSS3, and JavaScript**, powered by live REST API integration with the **DummyJSON Products API**, strictly localized for **Tamil Nadu, India** with **Indian standard contact numbers** and **Font Awesome 6 icons and arrows**.

---

## ✨ Features & Highlights

### 1. Mandatory & Bonus Sections
- **Announcement Bar:** Top notification banner featuring free courier delivery thresholds across Tamil Nadu, Chennai atelier contact links, INR (`₹`) currency indicator, and active promo code.
- **Sticky Header & Responsive Navigation:** 
  - Official Stackly branding logo with custom editorial sub-typography (`Stackly - Haute Boutique • Tamil Nadu`).
  - Dynamic navigation links with smooth scrolling.
  - Live instant search with Font Awesome search and clear icons.
  - Interactive Wishlist button with real-time counter badge (`<i class="fa-regular fa-heart"></i>`).
  - Interactive Shopping Bag button with real-time counter badge (`<i class="fa-solid fa-bag-shopping"></i>`).
  - Mobile slide-out drawer menu for smartphones and tablets.
- **Hero Section with Fashion Banner:**
  - High-impact editorial layout with gold accents.
  - Value propositions & stats tickers (`500+ Luxury Styles`, `100% Authentic Ateliers`, `24h Tamil Nadu Delivery`).
  - Direct call-to-actions linking to collection and new arrivals with Font Awesome arrows.
  - Floating showcase card: `Atelier Signature Silk • Handcrafted in Kanchipuram & Chennai, Tamil Nadu`.
- **Featured Categories:**
  - Dynamic category cards showcasing Women's Dresses, Footwear, Luxury Bags, Men's Apparel, Eyewear, and Timepieces.
  - Click-to-filter interaction that instantly navigates to and filters the main catalog.
- **New Arrivals Showcase:**
  - Highlights newly dropped haute items with Font Awesome quick action controls (Quick View, Add to Wishlist, Add to Bag).
- **Trending & Signature Collection (Interactive Catalog):**
  - **Category Filter Pills:** All Collection, Women's Dresses, Shoes, Bags, Jewellery, Men's Shirts, Men's Shoes, Eyewear, Watches with Font Awesome icons.
  - **Real-time Live Search:** Instant keyword searching across titles, descriptions, categories, and tags.
  - **Product Sorting:** Sort by Price (Low to High), Price (High to Low), Highest Customer Rating, and Largest Discount Percentage.
  - **Dynamic Pagination:** "Load More" functionality with Font Awesome chevron.
  - **Loading & Error Handling:** Shimmering skeleton loader cards during API fetch and graceful error fallback with a "Retry Loading" button.
- **Promotional Special Offers (3+ Offers):**
  - `WELCOME15`: 15% off first order with complimentary delivery across Tamil Nadu.
  - `LUXE40`: 40% off Tamil Nadu runway showcase.
  - `FREESHIP`: Complimentary express delivery across all Tamil Nadu districts (Chennai, Coimbatore, Madurai, Trichy, Salem).
  - Interactive **"Copy & Apply"** button with Font Awesome copy icon.
- **Customer Testimonials (3+ Reviews from Tamil Nadu):**
  - Dr. Priyadarshini Sundaram (Nungambakkam, Chennai, Tamil Nadu)
  - Karthik Ramaswamy (RS Puram, Coimbatore, Tamil Nadu)
  - Meenakshi Natarajan (KK Nagar, Madurai, Tamil Nadu)
- **Newsletter Subscription:**
  - Interactive form with instant confirmation toast and promo unlock.
- **Tamil Nadu Flagship Salon Footer:**
  - Address: `No. 18, Khadar Nawaz Khan Road, Nungambakkam, Chennai, Tamil Nadu - 600034, India`
  - Mobile numbers (Indian Standard): `+91 98401 23456 / +91 (044) 2827 8800`
  - WhatsApp Concierge: `+91 94440 88990`
  - Indian payment badges (Google Pay, UPI, Net Banking, RuPay, Visa, Mastercard).
- **Custom 404 Error Page (`404.html`):**
  - Styled high-fashion 404 page with return-to-boutique routing.

---

### 2. Interactive Modals & E-Commerce Functionality
- **Product Details Modal (Quick View):**
  - Multi-image gallery with interactive thumbnail switcher.
  - Title, SKU (`VEL-TN-XXX`), Indian Rupee pricing (`₹`), original price strike-through, and discount percentage badge.
  - Live stock availability badge and warranty / shipping details for Tamil Nadu.
  - Size selection pills (`XS`, `S`, `M`, `L`, `XL`, `EU Sizes`).
  - Color palette swatches (`Noir Black`, `Champagne Gold`, `Ivory Cream`, `Rose Blush`).
  - Quantity increment / decrement stepper with **Font Awesome plus (`fa-plus`) and minus (`fa-minus`) icons**.
  - Verified customer reviews from Tamil Nadu patrons.
  - Direct "Add to Bag" action.
- **Slide-Out Shopping Cart Drawer:**
  - Live item list with thumbnails, sizes, colors, and unit prices in `₹`.
  - Quantity controls with Font Awesome `fa-plus` / `fa-minus` icons and one-click remove item.
  - Free shipping progress calculator across Tamil Nadu.
  - Promo code voucher application with real-time recalculation:
    - Subtotal calculation in `₹`.
    - Voucher privilege discount deduction.
    - Express courier calculation.
    - Grand Total calculation.
  - Persistent storage in `localStorage` across page reloads.
- **Wishlist Module:**
  - Heart toggle on every product card (filled red when wishlisted).
  - Dedicated wishlist drawer with "Move to Bag" and "Remove" options.
  - Persistent storage in `localStorage`.
- **Checkout & Order Confirmation (Indian Standard):**
  - Comprehensive checkout modal with Customer Name, Indian Standard 10-digit mobile number (`+91 98401 23456`), Tamil Nadu delivery address, City (Chennai / Coimbatore / Madurai), pre-selected state (`Tamil Nadu`), and payment method selection (UPI GPay/PhonePe, RuPay Card, Net Banking, COD across Tamil Nadu).
  - Instant order generation with unique Order ID (`VEL-TN-XXXXXX`), itemized breakdown, and LocalStorage order archiving.

---

### 3. Technical Specifications
- **Core Languages:** HTML5, CSS3, Vanilla JavaScript (ES6+).
- **Frameworks:** None (0 framework dependencies, pure native JavaScript).
- **API:** [DummyJSON Products API](https://dummyjson.com/docs/products) using `async/await` and Fetch API.
- **Image Formats & Optimization:** All static and API images are in **`.webp` format**, strictly compressed to **below 100 KB** (average 5 KB - 56 KB) for blazing-fast performance.
- **Icons & Arrows:** Strictly **Font Awesome 6** throughout the entire application.
- **Location:** Strictly **Tamil Nadu, India** (Chennai, Coimbatore, Madurai, Kanchipuram).
- **Mobile Standard:** Strictly **Indian standard mobile numbers** (`+91` format).
- **Typography:** Google Fonts (`Playfair Display` & `Plus Jakarta Sans`).
- **Responsive Breakpoints:** 1200px (Desktop), 1024px (Laptops/Tablets), 768px (Tablets portrait), 480px (Mobile smartphones).

---

## 📂 Project Structure

```
Online Fashion&Clothing Boutique/
├── 404.html                     # Custom 404 Not Found page with Stackly branding
├── app.js                       # Core application logic (Cart, Wishlist, QuickView, UI)
├── assets/                      # All optimized .webp images (< 100 KB) directly in assets/
│   ├── avatar-1.webp
│   ├── avatar-2.webp
│   ├── avatar-3.webp
│   ├── cat-bags.webp
│   ├── cat-dresses.webp
│   ├── cat-eyewear.webp
│   ├── cat-jewellery.webp
│   ├── cat-shirts.webp
│   ├── cat-shoes.webp
│   ├── cat-watches.webp
│   ├── hero-banner.webp
│   └── stackly-logo-dark.webp
├── data.js                      # API service & boutique datasets (Categories, Vouchers, Testimonials)
├── index.html                   # Main boutique homepage
├── styles.css                   # Consolidated master stylesheet with responsive queries
├── .gitignore                   # Standard Git ignore file
├── server.js                    # Zero-dependency Node.js static preview server
└── README.md                    # Documentation & deployment guide
```

---

## 🚀 How to Run Locally

### Option 1: Direct File Access
Simply double-click `index.html` in your file explorer to open it directly in any modern web browser (Google Chrome, Edge, Safari, Firefox).

### Option 2: Using Node.js Local Server
If Node.js is installed on your machine:
```bash
# In the project directory:
node server.js
```
Then visit [http://localhost:3000](http://localhost:3000) in your web browser.

---

## 🌐 How to Deploy Live & Submit

### 1. Push to GitHub
If you have Git installed:
```bash
git init
git add .
git commit -m "Initial commit: VÉLURE Fashion Boutique Website"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo-name>.git
git push -u origin main
```

### 2. Live Deployment (Free & Instant)
- **GitHub Pages:**
  1. In your GitHub repository, navigate to **Settings** > **Pages**.
  2. Under **Branch**, select `main` and `/ (root)`, then click **Save**.
  3. Your site will be published at `https://<your-username>.github.io/<your-repo-name>/`.
- **Netlify Drop (No CLI needed):**
  1. Go to [app.netlify.com/drop](https://app.netlify.com/drop).
  2. Drag and drop this project folder.
  3. Netlify will deploy it instantly with a live `.netlify.app` URL.
- **Vercel:**
  1. Import the repository on [vercel.com](https://vercel.com).
  2. Set framework to "Other" and deploy instantly.

---

&copy; 2026 Stackly. All rights reserved.
