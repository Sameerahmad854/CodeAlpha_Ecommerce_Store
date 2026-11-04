const productGrid = document.querySelector("#product-grid");
const categoryGrid = document.querySelector("#category-grid");
const arrivalGrid = document.querySelector("#arrival-grid");
const shopMessage = document.querySelector("#shop-message");
const searchInput = document.querySelector("#search-input");
const cartDrawer = document.querySelector("#cart-drawer");
const overlay = document.querySelector("#overlay");
const cartItemsBox = document.querySelector("#cart-items");
const cartCount = document.querySelector("#cart-count");
const cartTotal = document.querySelector("#cart-total");
const accountModal = document.querySelector("#account-modal");
const checkoutModal = document.querySelector("#checkout-modal");
const productModal = document.querySelector("#product-modal");

let products = [];
let allProducts = [];
const requestedCategory = new URLSearchParams(window.location.search).get("category");
let selectedCategory = ["Electronics", "Accessories", "Fashion"].includes(requestedCategory)
  ? requestedCategory
  : "All";
let cart = [];
try {
  const savedCart = JSON.parse(localStorage.getItem("shopnest_cart") || "[]");
  if (Array.isArray(savedCart))
    cart = savedCart.filter(
      (item) =>
        item &&
        typeof item.productId === "string" &&
        Number.isInteger(item.quantity) &&
        item.quantity > 0,
    );
} catch {
  localStorage.removeItem("shopnest_cart");
}
let currentUser = null;
let isRegisterMode = false;
let toastTimer;
let searchTimer;
let productLoadController;
const THEME_KEY = "nova_theme";

const money = (amount) => `Rs. ${Number(amount).toLocaleString("en-PK")}`;
const escapeHTML = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[char],
  );

async function api(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    credentials: "same-origin",
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(options.headers || {}),
    },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || "Something went wrong.");
  return data;
}

function showToast(message) {
  const toast = document.querySelector("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
}

function applyTheme(theme, persist = false) {
  document.documentElement.dataset.theme = theme;
  const toggle = document.querySelector("#theme-toggle");
  const isDark = theme === "dark";
  toggle.setAttribute("aria-pressed", String(isDark));
  toggle.setAttribute(
    "aria-label",
    `Switch to ${isDark ? "light" : "dark"} theme`,
  );
  toggle.title = `Switch to ${isDark ? "light" : "dark"} theme`;
  if (persist) {
    try {
      localStorage.setItem(THEME_KEY, theme);
    } catch {
      showToast("Theme preference could not be saved on this device.");
    }
  }
}

function initialTheme() {
  try {
    const savedTheme = localStorage.getItem(THEME_KEY);
    if (savedTheme === "dark" || savedTheme === "light") return savedTheme;
  } catch {}
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function saveCart() {
  try {
    localStorage.setItem("shopnest_cart", JSON.stringify(cart));
  } catch {
    showToast("Cart could not be saved on this device.");
  }
  renderCart();
}

function filteredProducts() {
  const search = searchInput.value.trim().toLowerCase();
  return products.filter((product) => {
    const matchesCategory =
      selectedCategory === "All" || product.category === selectedCategory;
    const matchesSearch =
      `${product.name} ${product.description} ${product.category}`
        .toLowerCase()
        .includes(search);
    return matchesCategory && matchesSearch;
  });
}

function renderProducts() {
  const visibleProducts = filteredProducts();
  document.querySelector("#result-count").textContent =
    `${visibleProducts.length} ${visibleProducts.length === 1 ? "product" : "products"}`;
  shopMessage.textContent = visibleProducts.length
    ? ""
    : "No products found. Try another search.";
  productGrid.innerHTML = visibleProducts.map(renderProductCard).join("");
}

function renderProductCard(product) {
  const available = product.stock > 0;
  return `
    <article class="product-card">
      <button class="product-image-action" data-details="${escapeHTML(product._id)}" type="button" aria-label="View ${escapeHTML(product.name)} details">
        <img class="product-image" src="${escapeHTML(product.image)}" alt="${escapeHTML(product.name)}" loading="lazy" onerror="this.onerror=null;this.src='https://placehold.co/720x600/101b2d/dbe8f7?text=VOLTRIX'">
        <span class="product-tag">${escapeHTML(product.category)}</span>
      </button>
      <div class="product-info">
        <div><h3>${escapeHTML(product.name)}</h3><p class="stock-status ${available ? "in-stock" : "out-of-stock"}">${available ? `${product.stock} in stock` : "Out of stock"}</p></div>
        <span class="product-price">${money(product.price)}</span>
      </div>
      <div class="product-actions">
        <button class="quick-view" data-details="${escapeHTML(product._id)}" type="button">Details</button>
        <button class="add-button" data-add="${escapeHTML(product._id)}" type="button" ${available ? "" : "disabled"}>${available ? "Add to cart" : "Unavailable"}</button>
      </div>
    </article>`;
}

function renderCategories() {
  const categoryProducts = new Map();
  for (const product of allProducts) {
    if (!categoryProducts.has(product.category))
      categoryProducts.set(product.category, []);
    categoryProducts.get(product.category).push(product);
  }
  const categories = [...categoryProducts.entries()];
  categoryGrid.innerHTML = categories
    .map(
      ([category, items]) => `
    <button class="category-card" data-category="${escapeHTML(category)}" type="button" aria-label="Shop ${escapeHTML(category)}, ${items.length} ${items.length === 1 ? "product" : "products"}">
      <img src="${escapeHTML(items[0].image)}" alt="" loading="lazy" onerror="this.onerror=null;this.src='https://placehold.co/720x600/101b2d/dbe8f7?text=VOLTRIX'">
      <span class="category-card-copy"><strong>${escapeHTML(category)}</strong><small>${items.length} ${items.length === 1 ? "item" : "items"}</small></span>
      <span class="category-arrow" aria-hidden="true">↗</span>
    </button>`,
    )
    .join("");
  document.querySelector("#category-section").hidden = categories.length === 0;
}

function renderNewArrivals() {
  const arrivals = allProducts
    .filter(
      (product) =>
        product.createdAt && Number.isFinite(Date.parse(product.createdAt)),
    )
    .sort(
      (first, second) =>
        Date.parse(second.createdAt) - Date.parse(first.createdAt),
    )
    .slice(0, 4);
  const section = document.querySelector("#arrivals-section");
  section.hidden = arrivals.length === 0;
  document.querySelector("#arrivals-link").hidden = arrivals.length === 0;
  arrivalGrid.innerHTML = arrivals.map(renderProductCard).join("");
}

function renderCart() {
  cart = cart.filter((item) =>
    allProducts.some((product) => product._id === item.productId),
  );
  const count = cart.reduce((sum, item) => sum + item.quantity, 0);
  const total = cart.reduce((sum, item) => {
    const product = allProducts.find((entry) => entry._id === item.productId);
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);

  cartCount.textContent = count;
  document
    .querySelector("#cart-button")
    .setAttribute(
      "aria-label",
      `Open cart, ${count} ${count === 1 ? "item" : "items"}`,
    );
  cartTotal.textContent = money(total);
  document.querySelector("#checkout-total").textContent = money(total);

  if (!cart.length) {
    cartItemsBox.innerHTML =
      '<p class="empty-cart">Your cart is taking a little break. Add something you love.</p>';
    return;
  }

  cartItemsBox.innerHTML = cart
    .map((item) => {
      const product = allProducts.find((entry) => entry._id === item.productId);
      if (!product) return "";
      return `<article class="cart-item">
      <img src="${escapeHTML(product.image)}" alt="${escapeHTML(product.name)}" onerror="this.onerror=null;this.src='https://placehold.co/720x600/101b2d/dbe8f7?text=VOLTRIX'">
      <div><h3>${escapeHTML(product.name)}</h3><p>${money(product.price)}</p>
        <div class="quantity-controls">
          <button data-quantity="${product._id}" data-change="-1" type="button" aria-label="Decrease quantity">−</button>
          <span>${item.quantity}</span>
          <button data-quantity="${product._id}" data-change="1" type="button" aria-label="Increase quantity" ${item.quantity >= Math.min(20, product.stock) ? "disabled" : ""}>＋</button>
        </div>
        <button class="remove-button" data-remove="${product._id}" type="button">Remove</button>
      </div><strong class="product-price">${money(product.price * item.quantity)}</strong>
    </article>`;
    })
    .join("");
}

function addToCart(productId) {
  const product = allProducts.find((entry) => entry._id === productId);
  if (!product || product.stock < 1)
    return showToast("This product is out of stock.");
  const item = cart.find((entry) => entry.productId === productId);
  if (item) {
    if (item.quantity >= Math.min(20, product.stock))
      return showToast("You've reached the available quantity.");
    item.quantity += 1;
  } else {
    cart.push({ productId, quantity: 1 });
  }
  saveCart();
  showToast(`${product.name} added to your cart.`);
}

async function loadProducts({ refreshAll = false } = {}) {
  if (productLoadController) productLoadController.abort();
  productLoadController = new AbortController();
  const { signal } = productLoadController;
  shopMessage.textContent = "Loading the good stuff...";
  productGrid.innerHTML = "";
  const params = new URLSearchParams({
    sort: document.querySelector("#sort-select").value,
  });
  if (searchInput.value.trim()) params.set("search", searchInput.value.trim());
  if (selectedCategory !== "All") params.set("category", selectedCategory);
  try {
    const needsAllProducts = refreshAll || allProducts.length === 0;
    const requests = [api(`/api/products?${params}`, { signal })];
    if (needsAllProducts) requests.push(api("/api/products", { signal }));
    const [data, allData] = await Promise.all(requests);
    if (allData) allProducts = allData.products;
    products = data.products;
    const heroProduct =
      allProducts.find((product) =>
        /electronics|headphones?|smartphones?|laptops?|technology|tech/i.test(
          `${product.category} ${product.name}`,
        ),
      ) || allProducts[0];
    if (heroProduct) {
      const heroImage = document.querySelector("#hero-image");
      heroImage.src = heroProduct.image;
      heroImage.alt = `${heroProduct.name} from the current collection`;
      document.querySelector("#hero-category").textContent =
        heroProduct.category;
    }
    renderCategories();
    renderNewArrivals();
    renderProducts();
    renderCart();
  } catch (error) {
    if (error.name === "AbortError") return;
    shopMessage.textContent = "We couldn't load the collection.";
    productGrid.innerHTML = `<p class="form-message error">${escapeHTML(error.message)} Check that the server and MongoDB are running, then try again.</p><button class="filter-button" id="retry-products" type="button">Try again</button>`;
  }
}

async function loadCategories() {
  try {
    const { categories } = await api("/api/products/categories");
    document.querySelector("#category-filters").innerHTML = [
      "All",
      ...categories,
    ]
      .map(
        (category) =>
          `<button class="filter-button ${category === selectedCategory ? "active" : ""}" data-category="${escapeHTML(category)}" type="button" aria-pressed="${category === selectedCategory}">${category === "All" ? "Everything" : escapeHTML(category)}</button>`,
      )
      .join("");
  } catch {
    // Keep the "Everything" filter usable if category discovery is unavailable.
  }
}

function openCart() {
  cartDrawer.classList.add("open");
  cartDrawer.inert = false;
  cartDrawer.setAttribute("aria-hidden", "false");
  overlay.hidden = false;
  document.body.style.overflow = "hidden";
  document.querySelector("#close-cart").focus();
}

function closeCart() {
  const wasOpen = cartDrawer.classList.contains("open");
  cartDrawer.classList.remove("open");
  cartDrawer.inert = true;
  cartDrawer.setAttribute("aria-hidden", "true");
  overlay.hidden = true;
  document.body.style.overflow = "";
  if (wasOpen) document.querySelector("#cart-button").focus();
}

function openAuth() {
  document.querySelector("#auth-message").textContent = "";
  accountModal.showModal();
}

function updateAuthMode() {
  const form = document.querySelector("#auth-form");
  form.classList.toggle("register-mode", isRegisterMode);
  document.querySelector("#auth-title").innerHTML = isRegisterMode
    ? "Join VOLTRIX<span>.</span>"
    : "Good to see you<span>.</span>";
  document.querySelector("#auth-description").textContent = isRegisterMode
    ? "Create an account to place and track your orders."
    : "Log in to place and view your orders.";
  document.querySelector("#auth-submit").textContent = isRegisterMode
    ? "Create account ↗"
    : "Log in ↗";
  document.querySelector("#switch-text").textContent = isRegisterMode
    ? "Already a member?"
    : "New here?";
  document.querySelector("#switch-auth").textContent = isRegisterMode
    ? "Log in"
    : "Create an account";
  form.elements.password.autocomplete = isRegisterMode
    ? "new-password"
    : "current-password";
}

async function refreshAccount() {
  try {
    const data = await api("/api/auth/me");
    currentUser = data.user;
  } catch {
    currentUser = null;
  }
  document.querySelector("#account-label").textContent = currentUser
    ? currentUser.name.split(" ")[0]
    : "Guest";
  document.querySelector("#account-button").title = currentUser
    ? "Log out"
    : "Log in or register";
  document
    .querySelector("#account-button")
    .setAttribute("aria-label", currentUser ? "Log out" : "Log in or register");
}

async function showProductDetails(productId) {
  const product = allProducts.find((entry) => entry._id === productId);
  if (!product) return;
  document.querySelector("#product-detail").innerHTML = `
    <div class="detail-layout">
      <img src="${escapeHTML(product.image)}" alt="${escapeHTML(product.name)}" onerror="this.onerror=null;this.src='https://placehold.co/720x600/101b2d/dbe8f7?text=VOLTRIX'">
      <div><p class="eyebrow">${escapeHTML(product.category)}</p><h3>${escapeHTML(product.name)}</h3>
      <span class="detail-price">${money(product.price)}</span>
      <p>${escapeHTML(product.description)}</p>
      <p>${product.stock > 0 ? `${product.stock} available` : "Out of stock"}</p>
      <button class="primary-button" data-add="${product._id}" type="button" ${product.stock < 1 ? "disabled" : ""}>Add to cart ↗</button></div>
    </div>`;
  productModal.showModal();
}

productGrid.addEventListener("click", (event) => {
  const addButton = event.target.closest("[data-add]");
  const detailsButton = event.target.closest("[data-details]");
  if (addButton) addToCart(addButton.dataset.add);
  if (detailsButton) showProductDetails(detailsButton.dataset.details);
});

arrivalGrid.addEventListener("click", (event) => {
  const addButton = event.target.closest("[data-add]");
  const detailsButton = event.target.closest("[data-details]");
  if (addButton) addToCart(addButton.dataset.add);
  if (detailsButton) showProductDetails(detailsButton.dataset.details);
});

document.querySelector("#product-detail").addEventListener("click", (event) => {
  const button = event.target.closest("[data-add]");
  if (button) {
    addToCart(button.dataset.add);
    productModal.close();
  }
});

cartItemsBox.addEventListener("click", (event) => {
  const quantityButton = event.target.closest("[data-quantity]");
  const removeButton = event.target.closest("[data-remove]");

  if (quantityButton) {
    const item = cart.find(
      (entry) => entry.productId === quantityButton.dataset.quantity,
    );
    const product = allProducts.find(
      (entry) => entry._id === quantityButton.dataset.quantity,
    );
    if (!item || !product) return;
    item.quantity += Number(quantityButton.dataset.change);
    if (item.quantity <= 0) cart = cart.filter((entry) => entry !== item);
    else item.quantity = Math.min(item.quantity, product.stock, 20);
    saveCart();
  }

  if (removeButton) {
    cart = cart.filter(
      (item) => item.productId !== removeButton.dataset.remove,
    );
    saveCart();
  }
});

document
  .querySelector("#category-filters")
  .addEventListener("click", (event) => {
    const button = event.target.closest("[data-category]");
    if (!button) return;
    selectedCategory = button.dataset.category;
    document
      .querySelectorAll("#category-filters .filter-button")
      .forEach((filter) => {
        const isSelected = filter.dataset.category === selectedCategory;
        filter.classList.toggle("active", isSelected);
        filter.setAttribute("aria-pressed", String(isSelected));
      });
    loadProducts();
  });

categoryGrid.addEventListener("click", (event) => {
  const button = event.target.closest("[data-category]");
  if (!button) return;
  selectedCategory = button.dataset.category;
  document
    .querySelectorAll("#category-filters .filter-button")
    .forEach((filter) => {
      const isSelected = filter.dataset.category === selectedCategory;
      filter.classList.toggle("active", isSelected);
      filter.setAttribute("aria-pressed", String(isSelected));
    });
  loadProducts();
  document.querySelector("#shop").scrollIntoView({ behavior: "smooth" });
});

document.querySelector("#theme-toggle").addEventListener("click", () => {
  const nextTheme =
    document.documentElement.dataset.theme === "dark" ? "light" : "dark";
  applyTheme(nextTheme, true);
});

window
  .matchMedia("(prefers-color-scheme: dark)")
  .addEventListener("change", (event) => {
    if (!localStorage.getItem(THEME_KEY)) {
      applyTheme(event.matches ? "dark" : "light");
    }
  });
searchInput.addEventListener("input", () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(loadProducts, 220);
});
document.addEventListener("keydown", (event) => {
  if (
    event.key === "/" &&
    !event.metaKey &&
    !event.ctrlKey &&
    !event.altKey &&
    !["INPUT", "TEXTAREA", "SELECT"].includes(document.activeElement.tagName)
  ) {
    event.preventDefault();
    searchInput.focus();
  }
});
document.querySelector("#sort-select").addEventListener("change", loadProducts);
productGrid.addEventListener("click", (event) => {
  if (event.target.id === "retry-products") loadProducts();
});
document.querySelector("#cart-button").addEventListener("click", openCart);
document.querySelector("#close-cart").addEventListener("click", closeCart);
overlay.addEventListener("click", closeCart);
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && cartDrawer.classList.contains("open")) {
    closeCart();
  }
});

document
  .querySelector("#account-button")
  .addEventListener("click", async () => {
    if (!currentUser) return openAuth();
    try {
      await api("/api/auth/logout", { method: "POST" });
      currentUser = null;
      await refreshAccount();
      showToast("You've logged out.");
    } catch (error) {
      showToast(error.message);
    }
  });

document.querySelector("#switch-auth").addEventListener("click", () => {
  isRegisterMode = !isRegisterMode;
  updateAuthMode();
  document.querySelector("#auth-message").textContent = "";
});

document
  .querySelector("#auth-form")
  .addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const message = document.querySelector("#auth-message");
    message.className = "form-message";
    message.textContent = "Please wait...";
    const payload = Object.fromEntries(new FormData(form).entries());

    try {
      const data = await api(
        `/api/auth/${isRegisterMode ? "register" : "login"}`,
        {
          method: "POST",
          body: JSON.stringify(payload),
        },
      );
      currentUser = data.user;
      await refreshAccount();
      accountModal.close();
      form.reset();
      showToast(data.message);
    } catch (error) {
      message.classList.add("error");
      message.textContent = error.message;
    }
  });

document
  .querySelector("#checkout-button")
  .addEventListener("click", async () => {
    if (!cart.length) return showToast("Your cart is empty.");
    closeCart();
    if (!currentUser) {
      openAuth();
      showToast("Log in or create an account before checkout.");
      return;
    }
    document.querySelector("#checkout-message").textContent = "";
    document.querySelector("#checkout-total").textContent =
      cartTotal.textContent;
    checkoutModal.showModal();
  });

document.querySelector("#orders-button").addEventListener("click", async () => {
  const modal = document.querySelector("#orders-modal");
  const list = document.querySelector("#orders-list");
  if (!currentUser) {
    openAuth();
    showToast("Log in to view your orders.");
    return;
  }
  list.innerHTML = '<p class="loading-note">Loading your orders...</p>';
  modal.showModal();
  try {
    const { orders } = await api("/api/orders/my-orders");
    list.innerHTML = orders.length
      ? orders
          .map(
            (order) => `
      <article class="order-card"><div><strong>Order ${escapeHTML(order._id.slice(-6).toUpperCase())}</strong><span>${new Date(order.createdAt).toLocaleDateString()}</span></div>
      <div><span>${order.items.reduce((sum, item) => sum + item.quantity, 0)} items · ${escapeHTML(order.status)}</span><strong>${money(order.total)}</strong></div></article>`,
          )
          .join("")
      : '<p class="empty-cart">No orders yet. Your next favorite is waiting.</p>';
  } catch (error) {
    list.innerHTML = `<p class="form-message error">${escapeHTML(error.message)}</p>`;
  }
});

document
  .querySelector("#checkout-form")
  .addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const message = document.querySelector("#checkout-message");
    message.className = "form-message";
    message.textContent = "Placing your order...";
    const payload = Object.fromEntries(new FormData(form).entries());
    payload.items = cart.map((item) => ({
      productId: item.productId,
      quantity: item.quantity,
    }));

    try {
      const data = await api("/api/orders", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      cart = [];
      saveCart();
      checkoutModal.close();
      form.reset();
      await loadProducts({ refreshAll: true });
      showToast(
        `Demo order placed · ${money(data.order.total)} · Ref ${data.order.id.slice(-6).toUpperCase()}`,
      );
    } catch (error) {
      message.classList.add("error");
      message.textContent = error.message;
    }
  });

document.querySelectorAll("[data-close]").forEach((button) => {
  button.addEventListener("click", () =>
    document.getElementById(button.dataset.close).close(),
  );
});

document.querySelector("#year").textContent = new Date().getFullYear();
applyTheme(initialTheme());
cartDrawer.inert = true;
updateAuthMode();
refreshAccount();
loadCategories();
loadProducts();
