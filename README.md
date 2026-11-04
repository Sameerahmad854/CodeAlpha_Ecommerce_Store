# VOLTRIX

A full-stack e-commerce storefront for electronics, accessories, fashion, and everyday essentials.

## About the Project

VOLTRIX is a responsive online store built with a browser-based frontend and a Node.js/Express API backed by MongoDB. Visitors can browse and search the product catalog, manage a shopping cart, create an account, and place demo orders with delivery details.

## Main Features

- Responsive homepage and product catalog
- Product cards with product details
- Product category browsing and category filters
- Product search and sorting by featured order, price, or name
- Shopping cart with add, remove, and quantity controls
- Cart contents saved in browser local storage and restored after refresh
- User registration, login, and logout
- Delivery name and address collection during demo checkout
- Demo order placement and account order history
- Responsive interface with switchable light and dark themes

## Technologies Used

- HTML
- CSS
- JavaScript (browser)
- Node.js
- Express
- MongoDB
- Mongoose
- JSON Web Tokens (`jsonwebtoken`) and HTTP-only cookies for login sessions
- `bcryptjs` for password hashing

## Project Folder Structure

```text
.
├── middleware/
│   └── requireAuth.js       # Protects routes that require a signed-in user
├── models/
│   ├── Order.js             # Order data model
│   ├── Product.js           # Product data model
│   └── User.js              # User data model
├── public/
│   ├── app.js               # Storefront interactions and API calls
│   ├── index.html           # Storefront page
│   ├── style.css            # Base and responsive styles
│   └── theme.css            # Storefront theme styles
├── routes/
│   ├── auth.js              # Registration, login, logout, and account routes
│   ├── orders.js            # Order placement and order history routes
│   └── products.js          # Product catalog routes
├── .env.example             # Environment variable template
├── package.json
└── server.js                # Express app and MongoDB connection
```

## Installation and Setup Instructions

### Requirements

- Node.js and npm
- MongoDB running locally, or a MongoDB connection string

### Install dependencies

From the project directory, run:

```bash
npm install
```

Create a local environment file from the provided template:

```bash
cp .env.example .env
```

Edit `.env` and replace the template values with your own MongoDB connection string and a long, private JWT secret. Keep `.env` private and do not commit it.

## Environment Variables

The project uses these environment variables:

| Variable | Purpose |
| --- | --- |
| `MONGODB_URI` | Required. MongoDB connection string. |
| `JWT_SECRET` | Required. Private secret used to sign and verify login session tokens. |
| `PORT` | Optional. Server port; defaults to `5000`. |
| `NODE_ENV` | Optional. When set to `production`, authentication cookies use the `Secure` flag. |

See [`.env.example`](.env.example) for the required variable names and placeholder values. `PORT` and `NODE_ENV` are optional and can also be set in your environment.

## How to Run the Project Locally

1. Make sure MongoDB is running and `.env` contains valid values.
2. Start the development server:

   ```bash
   npm run dev
   ```

   Or use the regular start command:

   ```bash
   npm start
   ```

3. Open [http://localhost:5000](http://localhost:5000) in your browser.

The server uses port `5000` by default. It also reads an optional `PORT` environment variable if you need to use another port. When the product collection is empty, the server inserts a small starter catalog.

## API Overview

All endpoints use the same origin as the storefront. Protected endpoints require a signed-in account.

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | Check that the API server is running |
| `GET` | `/api/products` | List products; supports `search`, `category`, and `sort` query parameters |
| `GET` | `/api/products/categories` | Get the product categories in the catalog |
| `GET` | `/api/products/:id` | Get details for one product |
| `POST` | `/api/auth/register` | Create an account and start a login session |
| `POST` | `/api/auth/login` | Log in to an account |
| `GET` | `/api/auth/me` | Get the current signed-in account |
| `POST` | `/api/auth/logout` | End the current login session |
| `POST` | `/api/orders` | Place an order (login required) |
| `GET` | `/api/orders/my-orders` | List the signed-in user's orders (login required) |

The product `sort` parameter accepts `featured`, `price-asc`, `price-desc`, or `name`. For example:

```text
/api/products?search=bag&category=Accessories&sort=price-asc
```

## Screenshots

Create a `screenshots` folder in the project root and place your captured screenshots there. Replace each placeholder below with a Markdown image link that uses the actual filename of the screenshot you add.

- **Homepage:** _Add homepage screenshot here._
- **Product Listing:** _Add product listing screenshot here._
- **Product Details:** _Add product details screenshot here._
- **Shopping Cart:** _Add shopping cart screenshot here._
- **Checkout:** _Add checkout screenshot here._

## Current Limitations

- Checkout creates demo orders; no real payment gateway is connected.
- There is no admin dashboard in the current project.
- Product images are loaded from Unsplash URLs, so those images require internet access.
- The project is a learning/demo storefront and does not include all operational features expected of a production store.

## Future Improvements

- Add an admin interface for managing products and orders.
- Integrate a payment provider for real payments.
- Add product reviews and saved favorites.
- Add automated tests for the API and storefront flows.
- Add deployment documentation and production monitoring.

## Author

**Sameer Ahmad**

[GitHub Profile](https://github.com/Sameerahmad854)
