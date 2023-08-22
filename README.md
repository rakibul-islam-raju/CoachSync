# Coaching-Management-System

## Installation

Follow these steps to set up the Coaching Management System on your machine:

### Step 1: Clone the Repository

Begin by cloning the repository to your local machine.

### Step 2: Configure Environment Files

Navigate to both the server and client directories. You will find .env.example files in each of these directories. Copy the contents of .env.example and create a new .env file in the respective directories (server and client). Paste the copied contents into these .env files.

### Step 3: Docker Setup

Make sure you have Docker and Docker Compose installed on your machine. If not, please install them first.

Run the following command to start the development server:

```
 docker-compose up -d
```

### Step 4: Access URLs

Once the server is up and running, you can access the following URLs:

- Frontend: https://localhost:5137
- API Documentation: https://localhost:8000

  That's it! You have successfully set up the Coaching Management System. You can now access the frontend interface and explore the API documentation.

## Pre-commit Hooks and Code Formatting

To maintain consistent code style and quality, we use pre-commit hooks and code formatting tools for both the Django backend and the React frontend.

### Django Backend

We use pre-commit hooks to automatically format and lint the code in the Django backend.

1. Install `pre-commit` globally if not already installed:

   ```bash
   pip install pre-commit
   ```

2. Navigate to the server directory and install pre-commit:

   ```bash
   pre-commit install
   ```

### React Frontend

1. Navigate to the root directory (where the .git folder is located) and nstall husky as a development dependency:

   ```bash
   yarn add -D husky
   ```

2. Configure Husky to run Prettier before commits. In package.json:

   ```bash
   "husky": {
      "hooks": {
      "pre-commit": "cd client && pretty-quick --staged"
      }
    }
   ```

3. Install Husky hooks:

   ```bash
   npx husky install
   ```

This should provide the complete instructions for both the Django backend and the React frontend, including the Husky setup.
