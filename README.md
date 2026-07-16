# SentinelAI

> Predict • Prevent • Protect

SentinelAI is an AI-powered Industrial Safety Intelligence Platform designed for the **ET AI Hackathon 2.0**. 

SentinelAI functions as an **AI Intelligence Layer** that correlates data from multiple industrial subsystems—sensor readings, spatial worker telemetry, maintenance logs, and hot work permits—to proactively predict complex compound risks and recommend defensive shutdown actions before catastrophic incidents occur.

---

## 🏗️ Architecture Overview

SentinelAI uses a distributed MERN architecture augmented by a FastAPI Python AI microservice.

```
       ┌────────────────────────┐
       │     React Frontend     │
       │     (Vite + Tailwind)  │
       └───────────┬────────────┘
                   │  HTTP REST / WebSockets (Socket.IO)
                   ▼
       ┌────────────────────────┐
       │   Express API Server   │
       │    (Node.js + Mongo)   │
       └───────────┬────────────┘
                   │  HTTP REST
                   ▼
       ┌────────────────────────┐
       │   FastAPI Risk Engine  │
       │   (Python + Scikit-ML) │
       └────────────────────────┘
```

---

## 🛠️ Tech Stack

### Client
* **Framework**: React (Vite)
* **Styling**: Tailwind CSS, Framer Motion (Animations)
* **Charting**: Recharts
* **Maps/Layout**: Custom SVGs & Leaflet
* **Icons**: React Icons (Lucide)
* **State/Fetch**: Axios, React Query / Context

### Server
* **Framework**: Express.js
* **Database**: MongoDB via Mongoose
* **Authentication**: JSON Web Tokens (JWT) with Role-Based Access Control (Admin, Safety Officer, Supervisor, Worker)
* **Real-time**: Socket.IO (for sensor streaming & alerts broadcasting)

### AI Microservice
* **Framework**: FastAPI (Python)
* **Reasoning**: Rule-Based Compound Risk Engine (designed to be hot-swappable with Scikit-Learn classifiers)

---

## 📂 Project Structure

```
SentinelAI/
├── client/                 # React Frontend
├── server/                 # Node.js + Express Backend
├── intelligence-engine/    # Python FastAPI AI service
├── datasets/               # Reference datasets for ML training
├── assets/                 # SVGs, architecture diagrams, images
├── docs/                   # API contracts & user guides
├── deployment/             # Docker configurations
└── tests/                  # Integration testing scripts
```

---

## 🚀 Quick Start

### 1. Python Intelligence Engine
```bash
cd intelligence-engine
python -m venv .venv
source .venv/bin/activate  # Or `.venv\Scripts\activate` on Windows
pip install -r requirements.txt
python main.py
```
*Runs on `http://localhost:8000`*

### 2. Express Backend Server
```bash
cd server
npm install
npm run seed  # Seed the MongoDB database with initial mock data
npm run dev
```
*Runs on `http://localhost:5000`*

### 3. React Frontend Client
```bash
cd client
npm install
npm run dev
```
*Runs on `http://localhost:5173`*

---

## 🛡️ Compound Risk Example
If a gas sensor reports elevated values and a pressure vessel increases temperature, traditional systems trigger individual low-level warnings. SentinelAI reasons:
* **Gas Elevating** + **Pressure Increasing** + **Worker Proximity Detected** + **Active Work Permit**
* ➡️ **Explosion Probability: 93%**
* ➡️ **Action**: Broadcast evacuation route via WebSocket & Recommend Immediate Machine Shutdown.
