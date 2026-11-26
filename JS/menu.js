const menuTabs = document.querySelectorAll(".menu-tabs a");
const menuCards = document.querySelectorAll(".menu-card .card");

function showMeal(meal) {
  menuTabs.forEach((tab) => {
    const tabMeal = tab.getAttribute("href").replace("#", "");

    if (tabMeal === meal) {
      tab.setAttribute("aria-current", "page");
    } else {
      tab.removeAttribute("aria-current");
    }
  });

  menuCards.forEach((card) => {
    card.hidden = card.dataset.meal !== meal;
  });
}

function getCurrentMeal() {
  const meal = window.location.hash.replace("#", "");
  const availableMeals = Array.from(menuTabs).map((tab) =>
    tab.getAttribute("href").replace("#", "")
  );

  return availableMeals.includes(meal) ? meal : "breakfast";
}

menuTabs.forEach((tab) => {
  tab.addEventListener("click", (event) => {
    event.preventDefault();

    const meal = tab.getAttribute("href").replace("#", "");
    history.pushState(null, "", `#${meal}`);
    showMeal(meal);
  });
});

showMeal(getCurrentMeal());
