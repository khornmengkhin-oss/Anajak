# ANAJAK Restaurant

ANAJAK is a static HTML, CSS, and JavaScript restaurant website.

## Open the site

From the project directory, start a local web server:

```sh
python3 -m http.server 8000
```

Then open:

- Customer contact, pickup ordering, and order tracking: `http://localhost:8000/HTML/contact.html`
- Kitchen dashboard and daily sales report: `http://localhost:8000/HTML/staff.html`
- Restaurant menu: `http://localhost:8000/HTML/menu.html`

## Ordering demo

The project has no server backend or database. Pickup orders, availability changes, and status updates run as a development demo in browser `localStorage`, shared by pages in the same browser profile. Menu items and prices are shared between the menu and ordering pages in `JS/order-data.js`. Daily reports use order-time price snapshots and Phnom Penh dates.

The staff page is labeled as a development demo and is not linked from public navigation. It has no staff authentication, and browser storage is not a secure production system. Connect the customer and staff interfaces to a protected backend before deploying online ordering or staff controls in production.
