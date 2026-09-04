# Personal Finance Tracker

A modern, responsive, offline-first personal finance tracking web application built with React, TypeScript, and Tailwind CSS.

---

## Features

- **Automated Balances & Single-Entry Cascade**: Record an event once, and all account balances, category summaries, monthly budgets, and debt ledgers update automatically.
- **Lending & Borrowing Ledger**: Track money lent to or borrowed from contacts with detailed balance sheets and settlement records.
- **EMI & Debt Planner**: Keep track of upcoming and overdue loan EMIs, tenures, and monthly payment statuses.
- **Specialized Grocery Expense Tracker**: Detailed monthly average, item breakdown, and instant grocery logging.
- **Budgets & Analytics**: Monthly category targets with consumption warnings, 12-month cashflow trend charts, and printable reports.
- **Data Privacy & Offline Storage**: Zero external servers required; all data stays safely inside your browser's local storage with JSON backup and restore capabilities.

---

## 🚀 How to Host for Free on GitHub Pages

This project is pre-configured to be deployed directly to GitHub Pages without requiring any paid domain or backend server.

### Step 1: Push Code to GitHub
1. Create a new public repository on [GitHub](https://github.com/).
2. Push your project files:
   ```bash
   git init
   git add .
   git commit -m "Initial release"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   git push -u origin main
   ```

### Step 2: Enable GitHub Pages with GitHub Actions
1. Open your repository on GitHub.
2. Click **Settings** at the top right.
3. In the left navigation menu, click **Pages**.
4. Under the **"Build and deployment"** section, locate the **Source** dropdown.
5. Select **"GitHub Actions"** (instead of "Deploy from a branch").

### Step 3: View Your Live App
- GitHub Actions will automatically trigger the included workflow (`.github/workflows/deploy.yml`), build the production static files, and deploy them.
- Click the **Actions** tab in your repository to monitor progress (usually takes ~1 minute).
- Once finished, your free live URL will be ready at:
  ```
  https://<YOUR_USERNAME>.github.io/<YOUR_REPO_NAME>/
  ```

---

## 🛠 Local Development

```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Build for production
npm run build
```
