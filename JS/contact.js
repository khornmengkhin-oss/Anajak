(() => {
  const D = window.AnajakDemo;
  const dishList = document.querySelector("#dish-list");
  const cartItems = document.querySelector("#cart-items");
  const cartEmpty = document.querySelector("#cart-empty");
  const feedback = document.querySelector("#checkout-feedback");
  const checkout = document.querySelector("#checkout-form");
  let activeMeal = "all";
  let sending = false;
  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
  const activeOrders = () => D.orders();

  function renderDishes() {
    const items = D.dishes.filter((dish) => activeMeal === "all" || dish.meal === activeMeal);
    dishList.innerHTML = items.map((dish) => {
      const soldOut = !D.isAvailable(dish.id);
      const quantity = Number(D.cart()[dish.id]) || 0;
      return `<article class="dish-card${soldOut ? " is-sold-out" : ""}">
        <div class="dish-card__image"><img src="../asset/image/${dish.image}" alt="${escapeHtml(dish.name)}" loading="lazy">${soldOut ? '<span class="sold-out-tag">Sold out</span>' : `<span class="meal-tag">${dish.meal}</span>`}</div>
        <div class="dish-card__content"><div class="dish-card__top"><h3>${escapeHtml(dish.name)}</h3><strong>${D.formatMoney(dish.price)}</strong></div><p>${escapeHtml(dish.description)}</p>
          ${soldOut ? '<button type="button" class="add-button" disabled>Sold out for today</button>' : quantity ? `<div class="dish-quantity" aria-label="${escapeHtml(dish.name)} quantity"><button type="button" data-cart-action="decrease" data-dish="${dish.id}" aria-label="Remove one ${escapeHtml(dish.name)}">−</button><span>${quantity} in basket</span><button type="button" data-cart-action="increase" data-dish="${dish.id}" aria-label="Add one ${escapeHtml(dish.name)}">+</button></div>` : `<button type="button" class="add-button" data-cart-action="increase" data-dish="${dish.id}"><i class="fa-solid fa-plus" aria-hidden="true"></i> Add to order</button>`}
        </div></article>`;
    }).join("");
  }

  function renderCart() {
    const cart = D.cart();
    const entries = D.dishes.filter((dish) => Number(cart[dish.id]) > 0);
    let totalQty = 0;
    let total = 0;
    cartItems.innerHTML = entries.map((dish) => {
      const qty = Number(cart[dish.id]); totalQty += qty; total += dish.price * qty;
      const unavailable = !D.isAvailable(dish.id);
      return `<div class="cart-line${unavailable ? " cart-line--unavailable" : ""}"><div><strong>${escapeHtml(dish.name)}</strong><small>${unavailable ? "Unavailable · remove this dish to continue" : `${D.formatMoney(dish.price)} each`}</small></div><div class="cart-line__controls"><button type="button" data-cart-action="decrease" data-dish="${dish.id}" aria-label="Remove one ${escapeHtml(dish.name)}">−</button><span>${qty}</span><button type="button" data-cart-action="increase" data-dish="${dish.id}" aria-label="Add one ${escapeHtml(dish.name)}" ${unavailable ? "disabled" : ""}>+</button></div><strong>${D.formatMoney(dish.price * qty)}</strong></div>`;
    }).join("");
    document.querySelector("#cart-count").textContent = totalQty;
    document.querySelector("#cart-total").textContent = D.formatMoney(total);
    cartEmpty.hidden = entries.length > 0;
    checkout.querySelector("button[type=submit]").disabled = totalQty === 0 || sending;
    renderDishes();
  }

  function trackingCard(order) {
    const steps = ["received", "preparing", "ready", "completed"];
    const current = order.status === "ready-for-pickup" ? "ready" : order.status;
    const index = steps.indexOf(current);
    return `<div class="tracking-card"><div class="tracking-card__header"><div><small>Order reference</small><strong>${escapeHtml(order.reference)}</strong></div><span class="status-badge status-${escapeHtml(order.status)}">${D.statusLabel[order.status] || "Received"}</span></div>
      <ol class="status-steps">${steps.map((step, i) => `<li class="${i <= index ? "is-done" : ""} ${i === index ? "is-current" : ""}"><span>${i < index ? "✓" : i + 1}</span><b>${step === "ready" ? "Ready for Pickup" : D.statusLabel[step]}</b></li>`).join("")}</ol>
      <div class="tracking-order-lines">${order.items.map((item) => `<div><span>${item.quantity} × ${escapeHtml(item.name)}</span><strong>${D.formatMoney(item.unitPrice * item.quantity)}</strong></div>`).join("")}</div>
      <div class="tracking-card__footer"><span>${escapeHtml(order.pickupTime)}${order.customerName ? ` · ${escapeHtml(order.customerName)}` : ""}</span><strong>Total ${D.formatMoney(order.total)}</strong></div>
    </div>`;
  }

  function lookupToken(raw) {
    try {
      const url = new URL(raw, window.location.href);
      return url.searchParams.get("tracking") || url.searchParams.get("order") || raw.trim();
    } catch { return raw.trim(); }
  }

  function lookupOrder(raw) {
    const token = lookupToken(raw);
    if (!/^[a-f0-9]{48}$/i.test(token)) return null;
    return activeOrders().find((order) => order.trackingToken === token) || null;
  }

  function updateTracking(raw, message = "") {
    const result = document.querySelector("#tracking-result");
    const note = document.querySelector("#tracking-feedback");
    const order = lookupOrder(raw);
    note.textContent = message || (order ? "" : "We couldn’t find an order with that tracking link. Use the secure link from your confirmation.");
    note.classList.toggle("is-error", !order && Boolean(raw));
    result.hidden = !order;
    result.innerHTML = order ? trackingCard(order) : "";
  }

  document.querySelectorAll("[data-meal-filter]").forEach((button) => button.addEventListener("click", () => {
    activeMeal = button.dataset.mealFilter;
    document.querySelectorAll("[data-meal-filter]").forEach((item) => { const active = item === button; item.classList.toggle("is-active", active); item.setAttribute("aria-pressed", String(active)); });
    renderDishes();
  }));

  document.addEventListener("click", (event) => {
    const button = event.target.closest("[data-cart-action]");
    if (!button || button.disabled) return;
    const { dish: id, cartAction } = button.dataset;
    if (cartAction === "increase" && !D.isAvailable(id)) { renderCart(); return; }
    const cart = D.cart();
    const quantity = Number(cart[id]) || 0;
    if (cartAction === "increase") cart[id] = quantity + 1;
    if (cartAction === "decrease") { if (quantity <= 1) delete cart[id]; else cart[id] = quantity - 1; }
    D.saveCart(cart);
    feedback.textContent = "";
    renderCart();
  });

  checkout.addEventListener("submit", (event) => {
    event.preventDefault();
    if (sending) return;
    const cart = D.cart();
    const entries = D.dishes.filter((dish) => Number(cart[dish.id]) > 0);
    if (!entries.length) { feedback.textContent = "Add a dish to your basket before placing an order."; feedback.classList.add("is-error"); return; }
    const unavailable = entries.filter((dish) => !D.isAvailable(dish.id));
    if (unavailable.length) { feedback.textContent = `${unavailable.map((dish) => dish.name).join(", ")} ${unavailable.length === 1 ? "is" : "are"} now sold out. Remove ${unavailable.length === 1 ? "this dish" : "these dishes"} from your basket to continue.`; feedback.classList.add("is-error"); renderCart(); return; }
    sending = true; feedback.classList.remove("is-error"); feedback.textContent = "Placing your order…"; renderCart();
    try {
      const data = new FormData(checkout);
      const items = entries.map((dish) => ({ id: dish.id, name: dish.name, quantity: Number(cart[dish.id]), unitPrice: dish.price }));
      const order = { id: D.token(), trackingToken: D.token(), reference: D.reference(), createdAt: new Date().toISOString(), customerName: String(data.get("customerName")).trim(), customerPhone: String(data.get("customerPhone")).trim(), pickupTime: String(data.get("pickupTime")), notes: String(data.get("notes")).trim(), items, total: items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0), status: "received" };
      const orders = D.orders(); orders.push(order); D.saveOrders(orders); D.saveCart({});
      document.querySelector("#order-confirmation").innerHTML = `<div class="confirmation-icon"><i class="fa-solid fa-check" aria-hidden="true"></i></div><p class="eyebrow">Order received</p><h3>Thanks, ${escapeHtml(order.customerName)}.</h3><p>Your order <strong>${escapeHtml(order.reference)}</strong> is in the kitchen queue.</p><div class="confirmation-summary">${items.map((item) => `<div><span>${item.quantity} × ${escapeHtml(item.name)}</span><strong>${D.formatMoney(item.quantity * item.unitPrice)}</strong></div>`).join("")}<div class="confirmation-total"><span>Total</span><strong>${D.formatMoney(order.total)}</strong></div></div><p class="pickup-detail"><i class="fa-regular fa-clock" aria-hidden="true"></i> ${escapeHtml(order.pickupTime)} · We’ll prepare it fresh.</p><a class="outline-action" href="?tracking=${order.trackingToken}#track">Track this order <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></a>`;
      document.querySelector("#order-confirmation").hidden = false;
      checkout.hidden = true;
      feedback.textContent = "";
      renderCart();
    } catch (error) {
      console.error("Demo order submission failed", error);
      feedback.textContent = "We couldn’t save your order. Please try again."; feedback.classList.add("is-error");
    } finally { sending = false; renderCart(); }
  });

  document.querySelector("#tracking-form").addEventListener("submit", (event) => { event.preventDefault(); updateTracking(document.querySelector("#tracking-reference").value); });
  const initialToken = new URLSearchParams(window.location.search).get("tracking") || new URLSearchParams(window.location.search).get("order");
  if (initialToken) { document.querySelector("#tracking-reference").value = window.location.href; updateTracking(initialToken); }
  window.addEventListener("storage", (event) => { if ([D.keys.orders, D.keys.availability].includes(event.key)) { renderCart(); const value = document.querySelector("#tracking-reference").value || initialToken; if (value) updateTracking(value); } });
  window.setInterval(() => { const value = document.querySelector("#tracking-reference").value || initialToken; if (value) updateTracking(value); }, 1800);
  renderDishes(); renderCart();
})();
