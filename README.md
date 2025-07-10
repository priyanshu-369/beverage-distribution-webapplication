# Beverage Distribution Webapp

This repository contains the frontend (React) and backend (Node.js/Express with MongoDB) components for the Beverage Distribution Webapp.

## Getting Started

Follow these instructions to set up and run the project on your local machine.

### Prerequisites to be done

* **Node.js and npm (or Yarn):** Required for both frontend and backend development.
    * [Download Node.js](https://nodejs.org/) (includes npm)
    * [Install Yarn (Optional)](https://classic.yarnpkg.com/en/docs/install/)
* **MongoDB:** Required for the backend database.
    * [Download & Install MongoDB Community Edition](https://www.mongodb.com/try/download/community)
    * Ensure your MongoDB server is running (e.g., via `mongod` command or MongoDB Compass).

### Frontend Setup (React with Vite)

1.  **Navigate to the frontend project directory:**
    If your `package.json` and `src` folder are in the root, you're likely already there. Otherwise, navigate to the folder containing your React application.

2.  **Install dependencies:**

    ```bash
    npm install
    # OR
    yarn install
    ```

3.  **Start the development server:**

    ```bash
    npm run dev
    # OR
    yarn dev
    ```

    The frontend application will typically open in your browser at `http://localhost:5173` (or a similar port).

### Backend Setup (Node.js/Express with MongoDB)

1.  **Navigate to the backend project directory:**
    This is typically a separate folder within your main project (e.g., `backend/`, `server/`).

2.  **Install dependencies:**

    ```bash
    npm install
    # OR
    yarn install
    ```

3.  **Configure Environment Variables:**

    * Create a `.env` file in the root of your backend directory.
    * Add necessary environment variables, such as:

        ```
        PORT=5000
        MONGODB_URI=mongodb://localhost:27017/beverage_delivery
        JWT_SECRET=your_very_strong_jwt_secret_key_here
        # Add any other variables your backend needs (e.g., payment gateway keys, SMS API keys)
        ```

    * **CRITICAL:** Replace `your_very_strong_jwt_secret_key_here` with a long, random, and complex string.

4.  **Start the backend server:**

    ```bash
    npm start
    # OR
    node server.js # Or whatever your main entry file is
    ```

    The backend API will typically run on `http://localhost:5000` (or the port defined in your `.env` file).