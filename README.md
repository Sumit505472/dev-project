# 👨‍💻 Judge Matrix 🚀

## 🌟 Introduction

The Judge Matrix is a cutting-edge online coding platform designed for developers and students to practice their programming skills, execute code in multiple languages, and submit solutions against real-world coding challenges. It's a full-stack solution that combines a robust and scalable backend with a seamless user experience.

This platform empowers you to:

* **Run code instantly** and see its output.

* **Submit solutions** for various programming problems.

* Get your code evaluated against **automated test cases**.

* Even receive **AI-powered code reviews** for your submissions!

## ✨ Features

* **🌐 Multi-Language Support:** Execute and submit code in C++, C, Java, and Python.

* **⚙️ Code Execution (Run):** Instantly run your code with custom input and view real-time output.

* **✅ Code Submission (Judge):** Submit code against automated test cases and receive precise verdicts like 'Accepted' or 'Wrong Answer'.

* **📊 Detailed Results:** Get a comprehensive breakdown of submission results, including input, expected output, actual output, and error details for each test case.

* **🔒 User Authentication:** Track your solutions with a secure registration and login system (JWT-based).

* **➕ Problem Management:** Ability for admins to add problems and their corresponding test cases.

* **🤖 AI Code Review (Gemini API):** Receive intelligent feedback and improvement suggestions for your code using the Gemini API.

* **🚀 Dockerized Environment:** Ensures a reliable and consistent code execution environment through containerization.

## 🛠️ Tech Stack

Our project is built upon a combination of powerful and modern technologies:

### **Frontend**

* **React.js:** For building dynamic and responsive user interfaces.

* **Axios:** An HTTP client for interacting with the backend API.

* **Monaco Editor:** The browser-based code editor (powering VS Code).

* **Tailwind CSS:** A utility-first CSS framework for rapid UI development.

* **React Router DOM:** For navigation within the single-page application.

### **Backend**

* **Node.js (Express.js):** For fast and scalable server-side logic.

* **MongoDB (Mongoose):** An Object Data Modeling (ODM) for interacting with the No-SQL database.

* **bcryptjs:** For password hashing and security.

* **jsonwebtoken (JWT):** For user authentication and authorization.

* **cookie-parser & cors:** To handle HTTP cookies and Cross-Origin Resource Sharing.

* **`child_process` (Node.js):** For executing external compilers/interpeterters within the Docker container.

* **`uuid`:** For generating unique file names.

### **Database**

* **MongoDB Atlas:** Our cloud-hosted MongoDB database.

### **Code Execution Environment**

* **Docker:** To containerize all compilers (g++, gcc, openjdk, python3) in an isolated and consistent environment.

### **Deployment**

* **AWS EC2:** For hosting the backend server.

* **Vercel:** For deploying the frontend application.

* **Nginx:** (If applicable) For reverse proxying and SSL termination.

## 🏗️ Architecture Overview

The Judge Matrix follows a robust client-server architecture, leveraging containerization for consistent code execution and cloud services for scalability.

![images/architecture_diagram.png](https://github.com/Sumit505472/dev-project/blob/fb59ea6b9522dea68b25e9b232da2cf97c866209/architecture.png)

* **User's Browser / Client:** The interactive interface where users write, run, and submit their code.
* **Vercel:** Hosts the frontend application for fast global delivery.
* **AWS:** Provides the cloud infrastructure (e.g., EC2 instances) for the backend.
* **Handles Traffic, SSL:** Nginx or a similar proxy layer manages incoming requests, handles SSL/TLS termination, and routes traffic.
* **Docker:** Containerizes the execution environment, ensuring consistent and isolated compilation/running of user code.
* **Node.js Express Backend:** The core application logic, handling authentication, problem management, and orchestrating code execution and AI interactions.
* **MongoDB:** The NoSQL database used to store user data, problem statements, test cases, and submission records.
* **Gemini:** Utilized for AI-powered code reviews, providing intelligent feedback on user submissions.

## 🏁 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### **Prerequisites**

Ensure you have the following installed on your system:

* [Node.js](https://nodejs.org/en/download/) (v18 or newer)

* [npm](https://www.npmjs.com/get-npm) (comes with Node.js)

* [MongoDB Atlas Account](https://www.mongodb.com/cloud/atlas/register) (for the database)

* [Docker Desktop](https://www.docker.com/products/docker-desktop/)

* [Git](https://git-scm.com/downloads)

* [Google Cloud Project & Gemini API Key](https://cloud.google.com/gemini/docs/tutorials/text-tutorial) (for AI review)

### **1. Clone the Repository**
git clone https://github.com/Sumit505472/dev-project.git

### **2. Backend Setup**

1.  **Navigate to the Backend Directory:**

    ```
    cd server
    ```

2.  **Set up Environment Variables (`.env`):**
    Create a file named `.env` in the root of the `server` directory and populate it with the following details:

    ```
    PORT=5000
    MONGO_URI=mongodb+srv://<your_atlas_username>:<your_atlas_password>@<your_cluster_name>.mongodb.net/<your_database_name>?retryWrites=true&w=majority
    SECRET_KEY=YOUR_JWT_SECRET_KEY_HERE_FOR_AUTH
    GOOGLE_API_KEY=YOUR_GEMINI_API_KEY_HERE_FOR_AI_REVIEW
    ```

    **Make sure to replace `<your_atlas_username>`, `<your_atlas_password>`, `<your_cluster_name>`, `<your_database_name>`, `YOUR_JWT_SECRET_KEY_HERE_FOR_AUTH`, and `YOUR_GEMINI_API_KEY_HERE_FOR_AI_REVIEW` with your actual credentials and API keys.**

3.  **Install npm dependencies:**

    ```
    npm install
    ```

4.  **Build the Docker Image:**
    Ensure you are in the `server` directory containing the `Dockerfile`.

    ```
    sudo docker build -t cpp-compiler .
    ```

5.  **Run the Docker Container:**

    ```
    sudo docker run -d -p 5000:5000 --name online-judge-backend-con --restart always --env-file ./.env cpp-compiler
    ```

    This will run the backend server on port `5000`. You can check the logs using `sudo docker logs online-judge-backend-con`.

### **3. Frontend Setup**

1.  **Navigate to the Frontend Directory:**

    ```
    cd ../client
    ```

2.  **Set up Environment Variables (`.env.local`):**
    Create a file named `.env.local` in the root of the `client` directory and add your backend URL to it:

    ```
    VITE_BACKEND_URL=http://localhost:5000
    ```

    **Note:** For deployment, change this to your deployed backend URL (e.g., `https://backend.codedge.online`).

3.  **Install npm dependencies:**

    ```
    npm install
    ```

4.  **Run the Frontend Application:**

    ```
    npm run dev
    ```

    Your frontend application will typically be available at `http://localhost:5173`.

### **4. Adding Problems and Test Cases**

You can add problems and test cases to your MongoDB Atlas database either manually or via an admin panel if you've implemented one.

**Example JSON for adding a problem:**
{
title": "Sum of Two Numbers",
"question_description": "Write a program that takes two integers A and B as input and outputs their sum.",
"input_format": "The input consists of two space-separated integers on a single line.",
"output_format": "Output the sum of A and B.",
"difficulty": "Easy",
"tags": ["Math", "Basic"],
"time_limit": "1 Second",
"memory_limit": "256 MB",
"test_cases": [
{
"input": "5 10",
"output": "15"
},
{
"input": "100 200",
"output": "300"
}
]
}


You can add problems and their test cases by sending `POST` requests to the `/add` and `/testcases` endpoints respectively.

## 🗺️ API Endpoints

Here's a quick overview of your backend's main API endpoints:

### **Authentication**

* `POST /register`: User registration.

* `POST /login`: User login, issues a JWT token.

* `GET /me`: Get current logged-in user information (authentication required).

### **Code Execution & Judging**

* `POST /run`: Execute code with custom input.

    * **Request Body:** `{ code: string, language: string, input?: string }`

    * **Response:** `{ output: string }` or `{ error: string }`

* `POST /submit`: Submit and judge code against test cases.

    * **Request Body:** `{ code: string, language: string, problemId: string }`

    * **Response:** `{ success: boolean, verdict: string, results: Array<{ input: string, expected: string, actual: string, passed: boolean, error?: string, stderr?: string, stdout?: string }> }`

### **Problem Management**

* `POST /add`: Add a new problem (for admin use).

* `POST /testcases`: Add test cases for a specific problem.

* `GET /problem`: Get all available problems.

* `GET /problem/:id`: Get a specific problem by ID.

### **AI Review**

* `POST /ai-review`: Get an AI-generated review for code.

    * **Request Body:** `{ code: string }`

    * **Response:** `{ success: boolean, review: string }`

## ✉️ Contact

If you have any questions, suggestions, or issues, feel free to reach out to me:

* **Your Name:** Sumit Kumar Pathak

* **Email:** pathaksumit505@gmail.com








