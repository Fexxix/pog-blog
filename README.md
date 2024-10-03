# Pog Blog

Pog Blog is a social media blogging platform similar to Medium, where users can write, share, and discover articles on a variety of topics. Built using modern web development technologies, it consists of a **client** (frontend) and **server** (backend) that work together to deliver a seamless user experience.

## Table of Contents
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
  - [Running the Server](#running-the-server)
  - [Running the Client](#running-the-client)
- [Environment Variables](#environment-variables)
  - [Setting Up MongoDB](#setting-up-mongodb)
  - [Setting Up SMTP](#setting-up-smtp)

## Features
- User authentication and authorization
- Create, edit, and delete blog posts
- Follow other users and engage with content
- Full-text search functionality
- Email notifications for followers
- Responsive design with Tailwind CSS

## Tech Stack

### Backend (Server)
- **Node.js** with **Express**
- **MongoDB** for data storage
- **Lucia Auth** for authentication
- **Nodemailer** for email verification
- **TypeScript** for static typing

### Frontend (Client)
- **Vite** for fast development and build setup
- **React** for building the UI
- **Tailwind CSS** for styling
- **TypeScript** for better type safety
- **PostCSS** for CSS processing

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/en/) (v16 or higher)
- [MongoDB](https://www.mongodb.com/) instance
- [Vercel CLI](https://vercel.com/docs/cli) (for deployment, if needed)

### Running the Server

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Fexxix/pog-blog.git
   cd pog-blog/server
   ```

2. **Install server dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   Create a `.env` file in the `server` directory and populate it with the following variables:
   ```env
   PORT=3000
   MONGO_URI=YOUR_MONGO_URI
   NODE_ENV=development
   CLIENT_URL=http://localhost:5173
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=465
   SMTP_SERVICE=gmail
   SMTP_USER=YOUR_EMAIL
   SMTP_PASSWORD=YOUR_SMTP_PASSWORD
   ```

4. **Run the server in development mode:**
   ```bash
   npm run dev
   ```

   This will start the server on `http://localhost:3000`.

### Running the Client

1. **Navigate to the `client` directory:**
   ```bash
   cd ../client
   ```

2. **Install client dependencies:**
   ```bash
   npm install
   ```

3. **Start the client development server:**
   ```bash
   npm run dev
   ```

   The client will be accessible at `http://localhost:5173`.

### Building for Production

To create a production build of the client:

```bash
npm run build
```

The output will be available in the `dist` directory.

## Environment Variables

The application requires the following environment variables to run. Make sure to create a `.env` file with these values.

```env
PORT=3000
MONGO_URI=YOUR_MONGO_URI
NODE_ENV=development
CLIENT_URL=http://localhost:5173
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SERVICE=gmail
SMTP_USER=YOUR_EMAIL
SMTP_PASSWORD=YOUR_SMTP_PASSWORD
```

### Setting Up MongoDB

1. **Create a MongoDB instance**: 
   - You can either install MongoDB locally from [here](https://www.mongodb.com/try/download/community) or use a cloud service like [MongoDB Atlas](https://www.mongodb.com/atlas).

2. **Get the MongoDB URI**:
   - For a local instance, use `mongodb://localhost:27017/pog-blog`.
   - For MongoDB Atlas, follow their steps to create a database and get your connection string, typically in this format:
     ```env
     mongodb+srv://<username>:<password>@cluster0.mongodb.net/pog-blog?retryWrites=true&w=majority
     ```

3. **Update the `.env` file** with the `MONGO_URI`:
   ```env
   MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/pog-blog?retryWrites=true&w=majority
   ```

### Setting Up SMTP

1. **Create a Gmail account** (or use an existing one) to send emails via Nodemailer.

2. **Enable “Less secure app access”**: 
   Go to your Gmail account's security settings and enable access for less secure apps, or create an [App Password](https://support.google.com/accounts/answer/185833).

3. **Update the `.env` file** with SMTP details:
   ```env
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=465
   SMTP_SERVICE=gmail
   SMTP_USER=your-email@gmail.com
   SMTP_PASSWORD=your-app-password
   ```

This will allow your app to send email notifications.