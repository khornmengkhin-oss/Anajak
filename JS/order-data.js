/* Shared development-demo menu and browser storage for customer and kitchen views. */
window.AnajakDemo = (() => {
  const dishes = [
    { id: "assorted-spring-rolls", meal: "breakfast", name: "Assorted Spring Rolls", description: "Fresh shrimp and crispy spring rolls with vegetables and dipping sauces.", price: 4.95, image: "menu-item-2.png" },
    { id: "mediterranean-salad", meal: "breakfast", name: "Mediterranean Salad", description: "Fresh lettuce, carrots, olives, cheese, and walnuts with light dressing.", price: 5.50, image: "menu-item-4.png" },
    { id: "asian-buddha-bowl", meal: "breakfast", name: "Asian Buddha Bowl (vegetarian)", description: "Rice with avocado, edamame, fresh vegetables, and sesame seeds.", price: 5.95, image: "menu-item-6.png" },
    { id: "grilled-chicken-salad", meal: "breakfast", name: "Grilled Chicken Salad", description: "Grilled chicken with fresh lettuce, tomatoes, cucumber, corn, and eggs.", price: 4.75, image: "menu-item-7.png" },
    { id: "double-bacon-cheeseburger", meal: "breakfast", name: "Double Bacon Cheeseburger", description: "Two beef patties with cheese, bacon, lettuce, tomatoes, and pickles.", price: 5.25, image: "menu-item-11.png" },
    { id: "bay-mreas-prov", meal: "breakfast", name: "Bay Mreas Prov", description: "Stir-fried minced meat with basil, chili, steamed rice, and fried egg.", price: 4.25, image: "menu-item-9.png" },
    { id: "spicy-stir-fried-tofu", meal: "lunch", name: "Spicy Stir-Fried Tofu", description: "Crispy tofu with bell peppers, garlic, chili, and fresh herbs.", price: 4.95, image: "menu-item-1.png" },
    { id: "green-papaya-salad", meal: "lunch", name: "Green Papaya Salad", description: "Shredded green papaya with crab, tomatoes, peanuts, and spicy dressing.", price: 4.95, image: "menu-item-3.png" },
    { id: "spicy-meat-curry", meal: "lunch", name: "Spicy Meat Curry", description: "Tender bone-in meat simmered in a rich, aromatic curry sauce.", price: 5.95, image: "menu-item-8.png" },
    { id: "grilled-beef-steak", meal: "lunch", name: "Grilled Beef Steak", description: "Tender sliced beef with grilled vegetables and savory sauce.", price: 3.50, image: "menu-item-5.png" },
    { id: "minced-meat-salad", meal: "lunch", name: "Minced Meat Salad (Larb)", description: "Seasoned minced meat with fresh mint, lime, and vegetables.", price: 3.75, image: "menu-item-12.png" },
    { id: "herb-roasted-chicken", meal: "lunch", name: "Herb-Roasted Chicken", description: "Golden roasted chicken with garlic, aromatic herbs, and spices.", price: 3.25, image: "menu-item-13.png" },
    { id: "bbq-chicken-corn", meal: "dinner", name: "BBQ Chicken with Corn", description: "Grilled chicken drumsticks with barbecue sauce, sweet corn, and herbs.", price: 6.95, image: "menu-item-14.png" },
    { id: "assorted-sushi-platter", meal: "dinner", name: "Assorted Sushi Platter", description: "Japanese sushi rolls and nigiri with salmon, shrimp, and fish roe.", price: 5.95, image: "menu-item-10.png" },
    { id: "khmer-red-curry", meal: "dinner", name: "Khmer Red Curry (Khmer Flavor)", description: "Mild coconut curry with chicken, potatoes, and baguette.", price: 4.50, image: "menu-transparent/dinner-3.png" },
    { id: "yaohon-hot-pot", meal: "dinner", name: "Yaohon Hot Pot", description: "Shared hot pot with meat, seafood, noodles, and vegetables.", price: 8.95, image: "menu-transparent/dinner-4.png" },
    { id: "ang-dtray-meuk", meal: "dinner", name: "Ang Dtray Meuk", description: "Grilled squid with lime, chili, garlic, and herbs.", price: 4.95, image: "menu-transparent/dinner-5.png" },
    { id: "sach-ko-ang", meal: "dinner", name: "Sach Ko Ang", description: "Grilled beef skewers with pickled papaya and dipping sauce.", price: 3.95, image: "menu-transparent/dinner-6.png" }
  ];
  const keys = { orders: "anajak-demo-orders-v1", availability: "anajak-demo-availability-v1", cart: "anajak-demo-cart-v1" };
  const read = (key, fallback) => { try { const value = localStorage.getItem(key); return value ? JSON.parse(value) : fallback; } catch { return fallback; } };
  const write = (key, value) => localStorage.setItem(key, JSON.stringify(value));
  const orders = () => read(keys.orders, []);
  const saveOrders = (value) => write(keys.orders, value);
  const cart = () => read(keys.cart, {});
  const saveCart = (value) => write(keys.cart, value);
  const availability = () => read(keys.availability, {});
  const setAvailable = (id, available) => { const value = availability(); value[id] = available; write(keys.availability, value); };
  const isAvailable = (id) => availability()[id] !== false;
  const formatMoney = (value) => new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
  const dateKey = (value) => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Phnom_Penh", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(value));
  const dateToday = () => dateKey(Date.now());
  const token = () => { const bytes = new Uint8Array(24); crypto.getRandomValues(bytes); return Array.from(bytes, (b) => b.toString(16).padStart(2, "0")).join(""); };
  const reference = () => `AJ-${dateToday().replaceAll("-", "").slice(2)}-${crypto.getRandomValues(new Uint32Array(1))[0].toString(36).toUpperCase().slice(0, 5)}`;
  const statusLabel = { received: "Received", preparing: "Preparing", "ready-for-pickup": "Ready for Pickup", ready: "Ready for Pickup", completed: "Completed" };
  return { dishes, keys, read, write, orders, saveOrders, cart, saveCart, availability, setAvailable, isAvailable, formatMoney, dateKey, dateToday, token, reference, statusLabel };
})();
