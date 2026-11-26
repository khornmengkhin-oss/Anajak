(() => {
  const D = window.AnajakDemo;
  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
  const formatTime = (date) => new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Phnom_Penh", hour: "numeric", minute: "2-digit" }).format(new Date(date));
  const statusInfo = {
    received: { label: "Received", next: "preparing", action: "Start preparing", icon: "fa-fire-burner" },
    preparing: { label: "Preparing", next: "ready-for-pickup", action: "Mark ready for pickup", icon: "fa-bell-concierge" },
    "ready-for-pickup": { label: "Ready for Pickup", next: "completed", action: "Complete order", icon: "fa-check" },
    completed: { label: "Completed", next: null, action: "", icon: "fa-check-double" }
  };

  function renderOrders() {
    const orders = D.orders().sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    const open = orders.filter((order) => order.status !== "completed");
    document.querySelector("#open-order-count").textContent = open.length;
    const container = document.querySelector("#kitchen-orders");
    container.innerHTML = orders.length ? orders.map((order) => {
      const status = statusInfo[order.status] || statusInfo.received;
      return `<article class="kitchen-order"><div class="kitchen-order__head"><div><span class="order-time">${formatTime(order.createdAt)}</span><h3>${escapeHtml(order.reference)}</h3></div><span class="status-badge status-${escapeHtml(order.status)}">${status.label}</span></div>
        <div class="kitchen-order__pickup"><span><i class="fa-regular fa-user" aria-hidden="true"></i> ${escapeHtml(order.customerName)}</span><a href="tel:${escapeHtml(order.customerPhone)}"><i class="fa-solid fa-phone" aria-hidden="true"></i> ${escapeHtml(order.customerPhone)}</a><span><i class="fa-regular fa-clock" aria-hidden="true"></i> ${escapeHtml(order.pickupTime)}</span></div>
        <div class="kitchen-order__items">${order.items.map((item) => `<div><span><b>${item.quantity}×</b> ${escapeHtml(item.name)}</span><strong>${D.formatMoney(item.unitPrice * item.quantity)}</strong></div>`).join("")}</div>
        ${order.notes ? `<p class="kitchen-note"><i class="fa-regular fa-note-sticky" aria-hidden="true"></i> ${escapeHtml(order.notes)}</p>` : ""}
        <div class="kitchen-order__foot"><strong>Total <span>${D.formatMoney(order.total)}</span></strong>${status.next ? `<button type="button" class="status-action" data-order-id="${escapeHtml(order.id)}" data-next-status="${status.next}"><i class="fa-solid ${status.icon}" aria-hidden="true"></i> ${status.action}</button>` : '<span class="completed-note"><i class="fa-solid fa-circle-check" aria-hidden="true"></i> Order complete</span>'}</div>
      </article>`;
    }).join("") : '<div class="staff-empty"><span><i class="fa-solid fa-inbox" aria-hidden="true"></i></span><h3>No pickup orders yet</h3><p>New customer orders will appear here as soon as they’re placed.</p><a href="contact.html#pickup">Open pickup ordering <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></a></div>';
  }

  function renderAvailability() {
    const availability = document.querySelector("#availability-list");
    availability.innerHTML = D.dishes.map((dish) => {
      const available = D.isAvailable(dish.id);
      return `<div class="availability-row"><div class="availability-row__dish"><span class="availability-thumb"><img src="../asset/image/${dish.image}" alt="" loading="lazy"></span><div><strong>${escapeHtml(dish.name)}</strong><small>${dish.meal} · ${D.formatMoney(dish.price)}</small></div></div><span class="availability-state ${available ? "is-available" : "is-unavailable"}"><i class="fa-solid ${available ? "fa-circle-check" : "fa-circle-xmark"}" aria-hidden="true"></i> ${available ? "Available" : "Sold out"}</span><button type="button" class="availability-toggle ${available ? "" : "is-sold-out"}" data-availability-id="${dish.id}" data-available="${!available}" aria-label="Mark ${escapeHtml(dish.name)} ${available ? "sold out" : "available"}">${available ? "Mark sold out" : "Mark available"}</button></div>`;
    }).join("");
  }

  function renderReport() {
    const date = document.querySelector("#report-date").value || D.dateToday();
    const done = D.orders().filter((order) => order.status === "completed" && D.dateKey(order.createdAt) === date);
    const sales = done.reduce((sum, order) => sum + Number(order.total), 0);
    const dishCounts = {};
    done.forEach((order) => order.items.forEach((item) => { dishCounts[item.name] = (dishCounts[item.name] || 0) + Number(item.quantity); }));
    const top = Object.entries(dishCounts).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).slice(0, 5);
    document.querySelector("#sales-report").innerHTML = done.length ? `<div class="sales-metrics"><article><span>Completed orders</span><strong>${done.length}</strong><small>On ${escapeHtml(date)}</small></article><article><span>Total sales</span><strong>${D.formatMoney(sales)}</strong><small>Recorded order prices</small></article></div><div class="top-dishes"><div class="top-dishes__heading"><div><p class="eyebrow">Most loved today</p><h3>Top dishes</h3></div><span>By quantity</span></div>${top.map(([name, quantity], i) => `<div class="top-dish-row"><span class="top-dish-rank">${String(i + 1).padStart(2, "0")}</span><strong>${escapeHtml(name)}</strong><span>${quantity} sold</span></div>`).join("")}</div>` : `<div class="report-empty"><span><i class="fa-solid fa-chart-simple" aria-hidden="true"></i></span><h3>No completed orders on this date</h3><p>Once the kitchen completes an order, its sales and dishes will appear here.</p></div>`;
  }

  document.addEventListener("click", (event) => {
    const statusButton = event.target.closest("[data-order-id]");
    if (statusButton) {
      const orders = D.orders();
      const order = orders.find((item) => item.id === statusButton.dataset.orderId);
      if (!order || !statusInfo[order.status]?.next || statusInfo[order.status].next !== statusButton.dataset.nextStatus) return;
      order.status = statusButton.dataset.nextStatus;
      order.updatedAt = new Date().toISOString();
      D.saveOrders(orders); renderOrders(); renderReport(); return;
    }
    const availabilityButton = event.target.closest("[data-availability-id]");
    if (availabilityButton) { D.setAvailable(availabilityButton.dataset.availabilityId, availabilityButton.dataset.available === "true"); renderAvailability(); }
  });

  document.querySelector("#report-date").value = D.dateToday();
  document.querySelector("#report-date").addEventListener("change", renderReport);
  const update = () => { renderOrders(); renderAvailability(); renderReport(); document.querySelector("#staff-current-time").textContent = `${new Intl.DateTimeFormat("en-US", { timeZone: "Asia/Phnom_Penh", weekday: "long", month: "short", day: "numeric" }).format(new Date())} · Phnom Penh`; };
  window.addEventListener("storage", (event) => { if ([D.keys.orders, D.keys.availability].includes(event.key)) update(); });
  window.setInterval(update, 1800);
  update();
})();
