# ⚖️ LawBaba

### Smart Online Legal Consultation Platform

![React](https://img.shields.io/badge/Frontend-React-blue)
![Vite](https://img.shields.io/badge/Bundler-Vite-purple)
![Supabase](https://img.shields.io/badge/Backend-Supabase-green)
![Tailwind](https://img.shields.io/badge/UI-TailwindCSS-38BDF8)
![License](https://img.shields.io/badge/License-MIT-yellow)
![Status](https://img.shields.io/badge/Project-Active-success)

LawBaba is a **modern legal consultation platform** designed to connect **clients and lawyers through a secure online environment**.
The system enables users to **search lawyers, schedule consultations, chat in real-time, and receive legal assistance** through a clean and responsive web interface.

This project demonstrates a **full modern web application architecture using React, Supabase, and real-time communication technologies**.

---

# 📌 Table of Contents

* Overview
* Key Features
* Screenshots
* System Architecture
* Technology Stack
* Project Structure
* Installation
* Environment Variables
* Running the Project
* Testing
* Security
* Future Improvements
* Contributing
* License

---

# 📖 Overview

Legal consultation is often difficult to access quickly and efficiently. LawBaba aims to simplify this process by providing a **digital platform where users can easily connect with professional lawyers**.

The platform provides:

* Lawyer discovery
* Consultation booking
* Secure messaging
* Document sharing
* AI-powered legal help

It is built with **scalable frontend architecture and modern developer tooling**, making it suitable for real-world deployment and further expansion.

---

# 🚀 Key Features

## 👤 Client Features

* Search and browse verified lawyers
* Book legal consultations
* Real-time chat with lawyers
* Upload legal documents
* AI legal assistant chatbot
* Secure login and registration

---

## ⚖️ Lawyer Features

* Lawyer dashboard
* Client management system
* Consultation tracking
* Messaging system
* Case communication tools

---

## 🧠 Smart System Features

* Real-time messaging with Socket.io
* Secure authentication via Supabase
* AI chatbot support
* Form validation
* Responsive UI for mobile and desktop

---

# 🏗 System Architecture

```
                ┌───────────────────┐
                │      Client       │
                │   React + Vite    │
                └─────────┬─────────┘
                          │
                          │ API Calls
                          │
                 ┌────────▼────────┐
                 │     Supabase    │
                 │ Auth + Database │
                 └────────┬────────┘
                          │
             Real-time    │
            Messaging     │
                          ▼
                   ┌────────────┐
                   │ Messaging  │
                   └────────────┘
```

Architecture layers:

1. **Presentation Layer**

   * React UI
   * TailwindCSS styling

2. **Application Layer**

   * React Query
   * Axios API calls
   * Form validation

3. **Service Layer**

   * Supabase authentication
   * Database management
   * Real-time chat

---

# 🧰 Technology Stack

## Frontend

* React 19
* Vite
* React Router DOM
* TailwindCSS

---

## State & Data Fetching

* React Query
* Axios

---

## Backend / Services

* Supabase (Database + Auth)
* Socket.io Client

---

## Forms & Validation

* React Hook Form
* Formik
* Yup

---

## UI Libraries

* Heroicons
* Lucide React
* React Icons
* React Toastify
* React Hot Toast

---

## Testing Tools

* Vitest
* Cypress
* Testing Library

---

## Development Tools

* ESLint
* Prettier
* PostCSS
* Autoprefixer

---

# 📁 Project Structure

```
LawBaba
│
├── public
│
├── src
│   │
│   ├── assets
│   │     images, logos
│   │
│   ├── chat
│   │   ├── api
│   │   └── hooks
│   │
│   ├── components
│   │   │
│   │   ├── auth
│   │   │     login, signup
│   │   │
│   │   ├── booking
│   │   │     consultation modal
│   │   │
│   │   ├── chat
│   │   │     chat interface
│   │   │
│   │   ├── chatbot
│   │   │     AI assistant
│   │   │
│   │   ├── common
│   │   │     navbar, footer
│   │   │
│   │   ├── dashboard
│   │   │     lawyer dashboard
│   │   │
│   │   ├── error
│   │   │     error pages
│   │   │
│   │   └── lawyers
│   │         lawyer cards and search
│   │
│   ├── App.jsx
│   ├── main.jsx
│   └── App.css
│
├── package.json
├── vite.config.js
└── README.md
```

---

# ⚙️ Installation

Clone the repository:

```bash
git clone https://github.com/saifulislam735/LawBaba.git
```

Move into the project directory:

```bash
cd lawbaba
```

Install dependencies:

```bash
npm install
```

---

# 🔐 Environment Variables

Create a `.env` file in the root directory.

Example:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
```

These are required for authentication and database communication.

---

# ▶️ Running the Project

Start development server:

```
npm run dev
```

Build production version:

```
npm run build
```

Preview build:

```
npm run preview
```

---

# 🧪 Testing

Run unit tests:

```
npm run test
```

Watch mode:

```
npm run test:watch
```

Coverage report:

```
npm run test:coverage
```

Run Cypress end-to-end tests:

```
npm run test:e2e
```

Headless E2E testing:

```
npm run test:e2e:headless
```

---

# 🔒 Security

Security considerations implemented in the project:

* Protected routes for authenticated users
* Supabase authentication
* Environment variable configuration
* Form validation using Yup
* Secure API handling

---

# 📈 Future Improvements

Planned enhancements include:

* Video consultation support
* Payment gateway integration
* AI legal document analysis
* Lawyer rating & review system
* Case management system
* Notification system
* Mobile application version

---

# 🤝 Contributing

Contributions are welcome.

Steps to contribute:

1. Fork the repository
2. Create a new feature branch

```
git checkout -b feature-name
```

3. Commit your changes

```
git commit -m "Add new feature"
```

4. Push the branch

```
git push origin feature-name
```

5. Create a Pull Request

---

# 📜 License

This project is licensed under the **MIT License**.

---

# ⭐ Support

If you find this project useful:

* ⭐ Star the repository
* 🍴 Fork the project
* 📢 Share it with others

---

**LawBaba – Making Legal Help Accessible Online**
