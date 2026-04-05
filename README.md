# InterviewIQ 🚀

### *Elevate Your Career with AI-Powered Interview Preparation*

**InterviewIQ** is a state-of-the-art platform designed to transform the way candidates prepare for interviews. By leveraging **Retrieval-Augmented Generation (RAG)** and real-time AI interviewing, InterviewIQ provides a personalized, immersive, and data-driven preparation experience that ensures you're ready for any challenge.

---

## 🌟 Key Features

- **🤖 AI Video Interviewer**: Practice with a realistic, real-time AI interviewer that responds dynamically to your answers.
- **🧠 RAG-Powered "Neural Suggestions"**: Get personalized feedback and suggestions based on your resume and target job descriptions.
- **📄 Deep Resume Analysis**: Upload your resume to receive a detailed breakdown of your strengths, weaknesses, and alignment with specific roles.
- **🎨 Holographic Assessment HUD**: A futuristic, immersive interface for viewing your interview performance and reports.
- **💳 Integrated Payment System**: Secure access to premium features via Razorpay integration.
- **✨ Premium UI/UX**: A sleek, minimalist "White-Blue-Grey" design system with smooth animations and glassmorphism.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 (Vite)
- **Styling**: TailwindCSS 4, Framer Motion
- **State Management**: Redux Toolkit
- **Backend Services**: Firebase (Auth/Storage)
- **Visualization**: Recharts, jspdf (Report Generation)

### Backend
- **Runtime**: Node.js (Express 5)
- **Database**: MongoDB (Mongoose 9)
- **Security**: JWT, Helmet, Express Rate Limit
- **Payments**: Razorpay

### AI & RAG Service
- **Framework**: Python (LlamaIndex)
- **Vector Database**: ChromaDB
- **LLM Integrations**: OpenRouter, OpenAI, Gemini
- **Data Pipeline**: GitPython for repository ingestion, Multer for file uploads.

---

## 📂 Project Structure

```text
interview/
├── client/             # React/Vite Frontend
├── server/             # Express Node.js Backend
└── rag_service-open/  # Python RAG & AI Query Engine
    └── rag_service/    # Core RAG Logic & Vector DB
```

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18+)
- [Python](https://www.python.org/) (v3.10+)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) account
- [Razorpay](https://razorpay.com/) account (for payments)
- [Firebase](https://firebase.google.com/) project

### Installation

#### 1. Clone the repository
```bash
git clone https://github.com/gsjuneja226/AI-INTERVIEW-AGENT_THAPAR.git
cd AI-INTERVIEW-AGENT_THAPAR
```

#### 2. Setup the Client
```bash
cd client
npm install
# Create a .env file based on the template below
npm run dev
```

#### 3. Setup the Server
```bash
cd ../server
npm install
# Create a .env file based on the template below
npm run dev
```

#### 4. Setup the RAG Service
```bash
cd ../rag_service-open/rag_service
# Create and activate a virtual environment
python -m venv .venv
source .venv/bin/activate # or .venv\Scripts\activate on Windows
pip install -r requirements.txt
# Create a .env file based on the template below
python query_engine.py # Start the engine
```

---

## 🔑 Environment Variables

### Client (`client/.env`)
```env
VITE_FIREBASE_APIKEY="your_firebase_api_key"
VITE_RAZORPAY_KEY_ID="your_razorpay_key_id"
```

### Server (`server/.env`)
```env
PORT=8000
MONGODB_URL="your_mongodb_connection_string"
JWT_SECRET="your_jwt_secret"
OPENROUTER_API_KEY="your_openrouter_api_key"
RAZORPAY_KEY_ID="your_razorpay_key_id"
RAZORPAY_KEY_SECRET="your_razorpay_key_secret"
```

### RAG Service (`rag_service-open/rag_service/.env`)
```env
PORT=8000
MONGODB_URL="your_mongodb_connection_string"
JWT_SECRET="your_jwt_secret"
OPENROUTER_API_KEY="your_openrouter_api_key"
GEMINI_API_KEY="your_gemini_api_key"
```

---

## 📝 License

This project is licensed under the [ISC License](LICENSE).

---

*Made with ❤️ for the future of recruitment.*
