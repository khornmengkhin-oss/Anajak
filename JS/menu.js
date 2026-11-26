const menuTabs = document.querySelectorAll(".menu-tabs a");
const menuCards = document.querySelector("#menu-cards");
const D = window.AnajakDemo;

function renderMenu() {
  menuCards.innerHTML = D.dishes.map((dish) => `<div class="card" data-meal="${dish.meal}">
    <img src="../asset/image/${dish.image}" alt="${dish.name}">
    <h2>${dish.name}</h2>
    <p>${dish.description}</p>
    <span>${D.formatMoney(dish.price)}</span>
  </div>`).join("");
}

function showMeal(meal) {
  menuTabs.forEach((tab) => {
    const tabMeal = tab.getAttribute("href").replace("#", "");
    if (tabMeal === meal) tab.setAttribute("aria-current", "page");
    else tab.removeAttribute("aria-current");
  });
  menuCards.querySelectorAll(".card").forEach((card) => { card.hidden = card.dataset.meal !== meal; });
}

function getCurrentMeal() {
  const meal = window.location.hash.replace("#", "");
  const availableMeals = Array.from(menuTabs).map((tab) => tab.getAttribute("href").replace("#", ""));
  return availableMeals.includes(meal) ? meal : "breakfast";
}

menuTabs.forEach((tab) => tab.addEventListener("click", (event) => {
  event.preventDefault();
  const meal = tab.getAttribute("href").replace("#", "");
  history.pushState(null, "", `#${meal}`);
  showMeal(meal);
}));
window.addEventListener("popstate", () => showMeal(getCurrentMeal()));
renderMenu();
showMeal(getCurrentMeal());
