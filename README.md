<p align="center">
  <h1 align="center">Civix: Digital Civic Engagement Platform</h1>
</p>

<p align="center">
  Amplify your voice in local governance. Create petitions, participate in polls, and engage with your community.
  <br />
  <em>Developed as part of the Infosys Springboard program.</em>
</p>

<p align="center">
  <a href="#"><img src="https://img.shields.io/badge/Build-Passing-brightgreen" alt="Build Status"></a>
  <a href="#"><img src="https://img.shields.io/badge/React-blue?logo=react&logoColor=white" alt="React"></a>
  <a href="#"><img src="https://img.shields.io/badge/Node.js-green?logo=nodedotjs&logoColor=white" alt="Node.js"></a>
  <a href="#"><img src="https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white" alt="MongoDB"></a>
  <a href="#"><img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwindcss&logoColor=white" alt="Tailwind CSS"></a>
</p>

---

## 🚀 Overview

Civix is a full-stack web application designed to empower citizens by providing a modern, accessible platform for digital civic engagement. It bridges the gap between residents and local governance through intuitive tools for petitions, polls, and direct interaction tracking.

Built with a **React** frontend powered by **Vite** and styled with **Tailwind CSS**, Civix offers a responsive and user-friendly experience. The robust **Node.js** and **Express** backend, backed by **MongoDB**, ensures secure data management, real-time updates, and distinct user roles for citizens and public officials.

## ✨ Key Features

* **🔐 Secure Authentication:** JWT-based login/registration system differentiating between Citizens and Public Officials.
* **✍️ Petition Management:**
    * Effortless creation with rich descriptions, categories, goals, and location targeting.
    * Comprehensive viewing and filtering capabilities.
    * Secure digital signing process (authors cannot self-sign).
    * Author controls for editing and deletion.
    * **Status Management:** Public Officials can transition petitions through 'Active', 'Under Review', and 'Closed' states.
    * **Interactive Discussions:** Threaded comments and replies with upvote/downvote mechanics.
* **📊 Community Polls:**
    * Simple poll creation with custom options (2-5), descriptions, location focus, and optional closing dates.
    * Intuitive voting interface for active polls.
    * Dynamic result visualization upon voting or poll closure.
    * Author controls for editing and deletion.
* **📈 Reporting & Analytics:**
    * **Community Dashboard:** High-level overview of platform engagement (total petitions, polls, users, activity trends).
    * **Personal Insights:** Track individual contributions and participation.
    * **Official's Dashboard:** Tailored analytics for Public Officials focusing on their created content and overall civic response within their purview.
* **🔔 Real-time Notifications:** Keep users informed about relevant activities on their content.
* **⚙️ User Settings:** Manage profile details, update passwords, and handle account deletion securely.
* **❓ Help & Support:** Integrated FAQ for user guidance.

## 🛠️ Tech Stack

| Area      | Technology                                                                                                    |
| :-------- | :------------------------------------------------------------------------------------------------------------ |
| Frontend  | ![React](https://img.shields.io/badge/-React-61DAFB?logo=react&logoColor=white) ![Vite](https://img.shields.io/badge/-Vite-646CFF?logo=vite&logoColor=white) ![Tailwind CSS](https://img.shields.io/badge/-Tailwind_CSS-38B2AC?logo=tailwindcss&logoColor=white) React Router, Chart.js |
| Backend   | ![Node.js](https://img.shields.io/badge/-Node.js-339933?logo=nodedotjs&logoColor=white) ![Express](https://img.shields.io/badge/-Express-000000?logo=express&logoColor=white)                                |
| Database  | ![MongoDB](https://img.shields.io/badge/-MongoDB-47A248?logo=mongodb&logoColor=white) (with Mongoose ODM)          |
| Auth      | ![JWT](https://img.shields.io/badge/-JWT-000000?logo=jsonwebtokens&logoColor=white), bcryptjs                     |
| Styling   | Tailwind CSS                                                                                                   |
| Dev Tools | ESLint, Vite Dev Server                                                                                       |

## 🚀 Getting Started

### Prerequisites

* Node.js (v18 or later recommended)
* npm or yarn
* MongoDB instance (local or cloud-based like MongoDB Atlas)

### Installation & Setup

1.  **Clone the Repository:**
    ```bash
    git clone <repository-url>
    cd Civix-Digital-Civic-Engagement-Petition-Platform-Team2-KavyaTrivedi
    ```

2.  **Configure Backend:**
    * Navigate to the backend: `cd backend`
    * Install dependencies: `npm install`
    * Create a `.env` file based on the following template:
        ```env
        # .env (backend directory)
        MONGO_URI=<your_mongodb_connection_string>
        JWT_SECRET=<generate_a_strong_random_secret>
        PORT=5001
        ```
    * Run the backend server:
        ```bash
        npm start
        # Or using nodemon for development: npm run dev (if dev script is configured)
        ```

3.  **Configure Frontend:**
    * Navigate to the frontend: `cd ../frontend`
    * Install dependencies: `npm install`
    * (Optional) Create a `.env` file if your backend is not on `http://localhost:5001`:
        ```env
        # .env (frontend directory)
        VITE_BACKEND_URL=http://your-backend-host:your-backend-port
        ```
    * Run the frontend development server:
        ```bash
        npm run dev
        ```

4.  **Access the Application:**
    * Open your browser and go to the URL provided by Vite (usually `http://localhost:5173`).
