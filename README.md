
# 💳 Secure Auth & Payment API with Stripe

A secure and modern RESTful API built with **Node.js**, **Express**, **JWT**, **Passport.js**, **Prisma**, and **Stripe** for handling user authentication and payment processing.

---

## 📦 Tech Stack

- **Backend Framework**: Express.js
- **Authentication**: Passport.js + JWT
- **ORM**: Prisma (with MongoDB or PostgreSQL)
- **Password Security**: Bcrypt.js
- **Payments**: Stripe
- **Validation**: Zod
- **Environment Management**: dotenv
- **Typescript Support** ✅

---

## 🚀 Getting Started

### 1. **Clone the Repository**

```bash
git clone https://github.com/your-username/secure-auth-payment-api.git
cd secure-auth-payment-api
```

### 2. **Install Dependencies**

```bash
npm install
```

### 3. **Environment Configuration**

Create a `.env` file in the root of the project and configure:

```env
PORT=5000
DATABASE_URL=your_database_url_here
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=1d
STRIPE_SECRET_KEY=your_stripe_secret_key
SERVER_URL=http://localhost:5000
```

> 🔐 Make sure to never commit `.env` to version control.

---

## ⚙️ Prisma Setup (DB Connection)

### 1. **Generate Prisma Client**

```bash
npx prisma generate
```

### 2. **Push Schema to Database**

```bash
npx prisma db push
```

> Make sure your DB URL is set in `.env`

---

## 🔧 Run the Project

```bash
npm run dev
```

This will start the server on `http://localhost:5000`.

---

## 📚 API Endpoints

### 🧑‍💼 Authentication

| Method | Endpoint          | Description                      |
|--------|-------------------|----------------------------------|
| POST   | `/auth/register`  | Register a new user              |
| POST   | `/auth/login`     | Login and receive JWT token      |
| GET    | `/auth/me`        | Get logged-in user info (secure) |

### 💸 Payments

| Method | Endpoint                           | Description                          |
|--------|------------------------------------|--------------------------------------|
| POST   | `/payments/create-checkout-session` | Create a Stripe checkout session     |
| GET    | `/payments/status/:stripeId`       | Check status of a payment by Stripe ID |

---

## ✅ Validation

Zod is used to validate request bodies, ensuring reliable data entry and developer-friendly error messages.

---

## 📂 Project Structure

```
src/
├── app/
│   ├── modules/
│   │   ├── auth/
│   │   ├── payments/
│   │   └── users/
│   ├── middlewares/
│   ├── utils/
│   └── errors/
├── config/
├── prisma/
│   └── schema.prisma
└── index.ts
```

---

## ✅ To Do

- [x] User Authentication (JWT)
- [x] Secure Payment with Stripe
- [x] Protected Routes
- [x] Prisma ORM Integration
- [x] Status Check for Stripe Payments
- [ ] Webhook support (coming soon)

---

## 🤝 Contributing

Pull requests are welcome! For major changes, please open an issue first to discuss what you would like to change.

---

## 🛡️ License

This project is licensed under the MIT License.

---

## 🔗 Useful Links

- [Stripe API Docs](https://stripe.com/docs/api)
- [Prisma Docs](https://www.prisma.io/docs)
- [Passport.js Docs](http://www.passportjs.org/docs/)
