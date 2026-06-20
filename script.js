/* 
========================================================================
   MEWANA - MODERN PREMIUM EDITORIAL DESIGN
   Interactive Client Logic
========================================================================
*/

// --- State Variables ---
let cart = [];
const productsData = {
  almond: {
    title: "Mamra Almonds",
    img: "assets/almonds.png"
  },
  pistachio: {
    title: "Kerman Pistachios",
    img: "assets/pistachios.png"
  },
  cashew: {
    title: "W-180 Cashews",
    img: "assets/cashews.png"
  },
  walnut: {
    title: "Kashmiri Walnuts",
    img: "assets/walnuts.png"
  }
};

// --- DOM Elements ---
const siteHeader = document.getElementById("siteHeader");
const menuToggle = document.getElementById("menuToggle");
const navMenu = document.getElementById("navMenu");

const cartTrigger = document.getElementById("cartTrigger");
const cartCloseBtn = document.getElementById("cartCloseBtn");
const cartOverlay = document.getElementById("cartOverlay");
const cartDrawer = document.getElementById("cartDrawer");

const cartItemsContainer = document.getElementById("cartItems");
const cartCountBadge = document.getElementById("cartCount");
const cartPkgCount = document.getElementById("cartPkgCount");
const cartTotalSum = document.getElementById("cartTotalSum");
const giftWrapCheckbox = document.getElementById("giftWrapCheckbox");
const checkoutBtn = document.getElementById("checkoutBtn");

const successModalOverlay = document.getElementById("successModalOverlay");
const successCloseBtn = document.getElementById("successCloseBtn");

// ================= HEADER & MOBILE NAVIGATION =================

// Shrink header on scroll
window.addEventListener("scroll", () => {
  if (window.scrollY > 50) {
    siteHeader.classList.add("scrolled");
  } else {
    siteHeader.classList.remove("scrolled");
  }
});

// Toggle Mobile Menu
menuToggle.addEventListener("click", () => {
  navMenu.classList.toggle("open");
  const icon = menuToggle.querySelector("i");
  if (navMenu.classList.contains("open")) {
    icon.className = "fa-solid fa-xmark";
  } else {
    icon.className = "fa-solid fa-bars";
  }
});

// Close Mobile Menu on Link Click
document.querySelectorAll(".nav-link").forEach(link => {
  link.addEventListener("click", () => {
    navMenu.classList.remove("open");
    menuToggle.querySelector("i").className = "fa-solid fa-bars";
  });
});

// ================= TESTIMONIAL CAROUSEL =================
let activeTestimonial = 0;
const slides = document.querySelectorAll(".review-slide");
const dots = document.querySelectorAll(".slider-dot");
let testimonialInterval;

function showTestimonial(index) {
  slides.forEach(slide => slide.classList.remove("active"));
  dots.forEach(dot => dot.classList.remove("active"));
  
  slides[index].classList.add("active");
  dots[index].classList.add("active");
  activeTestimonial = index;
}

function setTestimonial(index) {
  showTestimonial(index);
  resetTestimonialInterval();
}

function startTestimonialCarousel() {
  testimonialInterval = setInterval(() => {
    let nextIndex = (activeTestimonial + 1) % slides.length;
    showTestimonial(nextIndex);
  }, 6000);
}

function resetTestimonialInterval() {
  clearInterval(testimonialInterval);
  startTestimonialCarousel();
}

// Start carousel on load
if (slides.length > 0) {
  startTestimonialCarousel();
}

// ================= INTERACTIVE PACKAGING TAB SELECTORS =================
document.querySelectorAll(".pkg-tabs").forEach(container => {
  const productKey = container.getAttribute("data-product");
  const options = container.querySelectorAll(".pkg-tab-btn");
  const priceDisplay = document.getElementById(`price-${productKey}`);
  
  options.forEach(opt => {
    opt.addEventListener("click", () => {
      // Remove active class from siblings
      options.forEach(o => o.classList.remove("active"));
      // Add active class to clicked
      opt.classList.add("active");
      
      // Update displayed price
      const price = parseFloat(opt.getAttribute("data-price")).toFixed(2);
      priceDisplay.innerText = `$${price}`;
    });
  });
});

// ================= SHOPPING CART Drawer SYSTEM =================

// Open/Close Cart Drawer
function toggleCart() {
  cartDrawer.classList.toggle("open");
  cartOverlay.classList.toggle("open");
  
  // Disable body scroll when cart is open
  if (cartDrawer.classList.contains("open")) {
    document.body.style.overflow = "hidden";
  } else {
    document.body.style.overflow = "";
  }
}

cartTrigger.addEventListener("click", toggleCart);
cartCloseBtn.addEventListener("click", toggleCart);
cartOverlay.addEventListener("click", toggleCart);

// Add Product to Cart
function addToCart(productKey) {
  const product = productsData[productKey];
  const container = document.querySelector(`.pkg-tabs[data-product="${productKey}"]`);
  const activeOpt = container.querySelector(".pkg-tab-btn.active");
  
  const pkgType = activeOpt.querySelector("span:first-child").innerText;
  const weight = activeOpt.getAttribute("data-weight");
  const price = parseFloat(activeOpt.getAttribute("data-price"));
  
  const cartItemId = `${productKey}-${activeOpt.getAttribute("data-pkg")}`;
  
  // Check if item already exists in cart
  const existingItemIndex = cart.findIndex(item => item.id === cartItemId);
  
  if (existingItemIndex > -1) {
    cart[existingItemIndex].quantity += 1;
  } else {
    cart.push({
      id: cartItemId,
      title: product.title,
      img: product.img,
      packaging: `${pkgType} // ${weight}`,
      price: price,
      quantity: 1
    });
  }
  
  renderCart();
  // Open the drawer automatically to show added item
  if (!cartDrawer.classList.contains("open")) {
    toggleCart();
  }
}

// Add Combo Pack to Cart
function addComboToCart(comboTitle, price) {
  const comboId = comboTitle.toLowerCase().replace(/\s+/g, "-");
  const existingItemIndex = cart.findIndex(item => item.id === comboId);
  
  if (existingItemIndex > -1) {
    cart[existingItemIndex].quantity += 1;
  } else {
    cart.push({
      id: comboId,
      title: comboTitle,
      img: "assets/hero.png", // Combo uses hero visual containing all nuts
      packaging: "Bespoke Gift Case",
      price: parseFloat(price),
      quantity: 1
    });
  }
  
  renderCart();
  if (!cartDrawer.classList.contains("open")) {
    toggleCart();
  }
}

// Update quantity of an item
function updateQty(itemId, delta) {
  const index = cart.findIndex(item => item.id === itemId);
  if (index > -1) {
    cart[index].quantity += delta;
    if (cart[index].quantity <= 0) {
      cart.splice(index, 1);
    }
    renderCart();
  }
}

// Remove item from cart
function removeItem(itemId) {
  cart = cart.filter(item => item.id !== itemId);
  renderCart();
}

// Calculate and render cart totals and HTML list
function renderCart() {
  cartItemsContainer.innerHTML = "";
  
  let totalItemsCount = 0;
  let totalSubtotal = 0;
  
  if (cart.length === 0) {
    cartItemsContainer.innerHTML = `
      <div class="cart-empty-view">
        <span class="cart-empty-num">00</span>
        <p>Your bag is currently empty.</p>
        <button class="btn-editorial-outline" onclick="toggleCart()">Begin Selection</button>
      </div>
    `;
    checkoutBtn.disabled = true;
    checkoutBtn.style.opacity = "0.4";
    checkoutBtn.style.cursor = "not-allowed";
  } else {
    checkoutBtn.disabled = false;
    checkoutBtn.style.opacity = "1";
    checkoutBtn.style.cursor = "pointer";
    
    cart.forEach(item => {
      totalItemsCount += item.quantity;
      totalSubtotal += item.price * item.quantity;
      
      const itemElement = document.createElement("div");
      itemElement.className = "cart-card-item";
      itemElement.innerHTML = `
        <div class="cart-card-img-wrap">
          <img src="${item.img}" alt="${item.title}" class="cart-card-img">
        </div>
        <div class="cart-card-details">
          <h3 class="cart-card-title">${item.title}</h3>
          <span class="cart-card-pkg">${item.packaging}</span>
          <div class="cart-card-action-bar">
            <div class="qty-stepper">
              <button class="qty-step-btn" onclick="updateQty('${item.id}', -1)" aria-label="Decrease quantity"><i class="fa-solid fa-minus"></i></button>
              <span class="qty-step-val">${item.quantity}</span>
              <button class="qty-step-btn" onclick="updateQty('${item.id}', 1)" aria-label="Increase quantity"><i class="fa-solid fa-plus"></i></button>
            </div>
            <span class="cart-card-price">$${(item.price * item.quantity).toFixed(2)}</span>
            <button class="cart-card-delete" onclick="removeItem('${item.id}')" aria-label="Remove item"><i class="fa-solid fa-trash-can"></i></button>
          </div>
        </div>
      `;
      cartItemsContainer.appendChild(itemElement);
    });
  }
  
  // Check calligraphy card selection
  let giftNoteCost = 0;
  if (giftWrapCheckbox.checked && cart.length > 0) {
    giftNoteCost = 5.00;
  }
  
  const finalTotal = totalSubtotal + giftNoteCost;
  
  // Update header and footer totals
  cartCountBadge.innerText = totalItemsCount;
  cartPkgCount.innerText = totalItemsCount;
  cartTotalSum.innerText = `$${finalTotal.toFixed(2)}`;
}

// Calligraphy checkbox listener
giftWrapCheckbox.addEventListener("change", renderCart);

// ================= CHECKOUT FLOW =================

checkoutBtn.addEventListener("click", () => {
  if (cart.length > 0) {
    // Show order success overlay
    successModalOverlay.classList.add("open");
    // Close the cart drawer
    toggleCart();
    
    // Clear cart state
    cart = [];
    giftWrapCheckbox.checked = false;
    renderCart();
  }
});

// Close success modal
successCloseBtn.addEventListener("click", () => {
  successModalOverlay.classList.remove("open");
});

// Initialize Cart View on startup
renderCart();
