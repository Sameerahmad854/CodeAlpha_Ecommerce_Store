# VOLTRIX. — Technology that moves you.

A responsive electronics and gadgets storefront built as the CodeAlpha Full Stack Development Internship Task 1. VOLTRIX pairs a clean, premium storefront with a full-stack app using HTML, CSS, browser JavaScript, Node.js, Express and MongoDB/Mongoose.

## Features

- Responsive electronics storefront with light and dark themes
- Product listings, category cards and product details
- Database-backed product search, category filters and price/name sorting
- Shopping cart with add/remove/quantity controls and local persistence
- User registration, login and logout
- Password hashing with bcrypt
- JWT session stored in an HTTP-only cookie
- Products, users and orders stored in MongoDB
- Authenticated order processing and order history
- Order history available in the storefront account dialog
- Server validates product IDs, quantities and stock, and calculates totals from database prices
- Starter products are inserted automatically when the products collection is empty

## Requirements

Install Node.js (LTS) and MongoDB Community Server, and make sure MongoDB is running locally. MongoDB Atlas can also be used by placing its connection string in `.env`.

## Run locally

1. Open Terminal and go to this project folder.
2. Install dependencies:

   ```bash
   npm install
   ```

3. Create your local environment file:

   ```bash
   cp .env.example .env
   ```

4. Replace both placeholder values in `.env`: set `MONGODB_URI` to your MongoDB connection string and `JWT_SECRET` to a long, private secret. Do not upload `.env` to GitHub.
5. Ensure MongoDB is running, then start the app:

   ```bash
   npm run dev
   ```

6. Open `http://localhost:5000` (or the port printed at startup).

If port 5000 is already in use on macOS, choose another port for this run:

```bash
PORT=5001 npm run dev
```

To run the production start script on port 5001:

```bash
PORT=5001 npm start
```

To see the process currently listening on port 5000:

```bash
lsof -nP -iTCP:5000 -sTCP:LISTEN
```

## API routes

| Method | Route                                                          | Purpose                                |
| ------ | -------------------------------------------------------------- | -------------------------------------- |
| GET    | `/api/health`                                                  | Check server                           |
| GET    | `/api/products`                                                | List products                          |
| GET    | `/api/products?search=bag&category=Accessories&sort=price-asc` | Search, filter and sort products       |
| GET    | `/api/products/categories`                                     | List available product categories      |
| GET    | `/api/products/:id`                                            | Product details                        |
| POST   | `/api/auth/register`                                           | Create account                         |
| POST   | `/api/auth/login`                                              | Log in                                 |
| GET    | `/api/auth/me`                                                 | Current account                        |
| POST   | `/api/auth/logout`                                             | Log out                                |
| POST   | `/api/orders`                                                  | Place order (login required)           |
| GET    | `/api/orders/my-orders`                                        | Current user's orders (login required) |

## Test checklist

- [ ] Storefront loads products
- [ ] Switch themes, reload, and confirm the selected theme persists
- [ ] Browse the catalog-derived category cards
- [ ] Search and category filters work
- [ ] Change product sorting and open product details
- [ ] Add/remove products and change quantities in cart
- [ ] Create an account using an email you control
- [ ] Log out, then log in again
- [ ] Add items, log in, and place a demo order
- [ ] Check MongoDB for users, products and orders
- [ ] Try placing an order with insufficient stock
- [ ] Check `/api/health` in your browser

## Important limitations

- This is a learning/demo project, not a production-ready shop.
- No real payment gateway is connected; orders are demo orders only.
- Product photos load from Unsplash, so internet access is needed for those images.
- The order route reserves stock with atomic updates and attempts to restore reserved stock if order creation fails. This is a learning-project approach; production systems need stronger transaction and recovery guarantees.
- Before production use, add rate limiting, robust logging, email verification/password reset, a proper CSRF strategy, and more deployment/security checks.

## GitHub repository

Create a GitHub repository named `CodeAlpha_Ecommerce_Store`. The `.gitignore` excludes `.env`; commit `.env.example`, never `.env` or its secret values.

```bash
git init
git add .
git commit -m "Build CodeAlpha e-commerce store"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/CodeAlpha_Ecommerce_Store.git
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username. Run these commands only after creating an empty repository with that name on GitHub.
