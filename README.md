# Phayao Hub

Phayao Hub is a comprehensive web application designed for the community of Phayao province, Thailand. It serves as a central platform for local commerce, job opportunities, tourism, and community interaction.

## Features

- **🛍️ Marketplace**: A platform for users to buy and sell second-hand items and local products.
- **💼 Job Board**: A dedicated section for finding local job opportunities and for employers to post vacancies.
- **🗺️ Travel Guide**: A curated guide to Phayao's tourist attractions, accommodations, and restaurants, complete with maps and details.
- **💬 Community**: A social space for users to share posts, news, and updates.
- **🛡️ Admin Dashboard**: A powerful backend interface for administrators to manage users, content, system settings, and monitor platform activity.

## Tech Stack

- **Frontend**: React, Vite, Tailwind CSS, Lucide React
- **Backend**: Node.js, Express.js
- **Database**: MySQL
- **Security**: Helmet, Rate Limiting, JWT Authentication, Bot Protection

## Prerequisites

Before you begin, ensure you have met the following requirements:
- **Node.js**: v18 or higher
- **MySQL**: v8.0 or higher

## Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/JoRJonG/phayaohub.git
   cd phayaohub
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   Create a `.env.local` file in the root directory with the following variables:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=phayaohub
   JWT_SECRET=your_jwt_secret
   PORT=3001
   ```

4. **Database Setup**
   Import the provided SQL file (if available) or ensure the database schema is set up in your MySQL instance.

5. **Run Locally**
   ```bash
   npm run dev
   ```
   This command runs both the frontend (Vite) and backend (Express) concurrently.
   - Frontend: `http://localhost:3000`
   - Backend: `http://localhost:3001`

## Deployment

This project is configured for deployment on Node.js hosting environments (e.g., HostAtom).

1. **Build for Production**
   ```bash
   npm run build
   ```
   This compiles the React frontend into the `dist` directory.

2. **Start the Server**
   ```bash
   node server/index.js
   ```
   The server is configured to serve the static files from the `dist` folder automatically.

## Security Features

- **Bot Protection**: Blocks malicious bots and scanners based on User-Agent.
- **Sensitive File Blocking**: Prevents access to sensitive system files like `.env` and `.git`.
- **Rate Limiting**: Limits the number of requests to prevent abuse.
- **Secure Headers**: Uses Helmet to set secure HTTP headers.

## License

This project is proprietary software.
