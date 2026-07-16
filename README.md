# SentinelAI

An Industrial Safety Intelligence Platform that combines sensor telemetry, machine health, workforce activity, and operational context to identify compound risks before they become critical incidents.

---

## Overview

Industrial facilities already deploy hundreds of sensors, monitoring systems, surveillance cameras, maintenance software, and safety management tools.

The challenge is not the lack of data.

The challenge is that every system works independently.

SentinelAI introduces an intelligence layer that continuously correlates information from multiple industrial systems, reasons over operational conditions, and generates actionable safety recommendations before an incident occurs.

Instead of monitoring equipment individually, the platform understands the complete operational state of a plant.

---

## Problem Statement

Traditional industrial monitoring platforms focus primarily on visualization.

A gas sensor generates alerts.

A maintenance system tracks repairs.

A permit system authorizes work.

A CCTV system records activities.

These systems rarely communicate with one another.

As a result, hazardous situations involving multiple contributing factors often remain undetected until it is too late.

SentinelAI addresses this problem by performing compound risk analysis across heterogeneous industrial data sources.

---

## Proposed Solution

SentinelAI acts as a centralized Industrial Safety Intelligence Platform.

The platform continuously ingests operational data from multiple sources including sensor telemetry, worker information, maintenance activities, permits, and incident history.

Rather than reacting to isolated threshold violations, SentinelAI evaluates relationships between multiple events to estimate operational risk and recommend preventive actions.

Example

Gas Concentration          High

Pressure                  Increasing

Maintenance               Active

Worker Presence           Inside Zone

Permit                    Hot Work

↓

Risk Classification

Critical

↓

Recommended Action

Shutdown Equipment

Evacuate Personnel

Notify Safety Officer

Generate Incident Report

---

## Core Modules

Authentication

Dashboard

Industrial Plant Layout

Worker Management

Machine Management

Live Sensor Monitoring

Alert Management

Risk Prediction Engine

Analytics

Incident Reporting

---

## System Architecture

```
React Client

        │

        ▼

Express REST API

        │

        ▼

MongoDB Database

        │

        ▼

Python Intelligence Engine

        │

        ├── Risk Analysis

        ├── Decision Engine

        ├── Predictive Models

        └── Computer Vision (Upcoming)
```

---

## Technology Stack

Frontend

- React
- Vite
- Tailwind CSS
- React Router
- Axios

Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT Authentication

AI

- Python
- FastAPI
- Scikit-Learn
- OpenCV
- YOLO
- LangChain

Visualization

- Recharts
- Leaflet

---

## Repository Structure

```
SentinelAI

client/

server/

intelligence-engine/

datasets/

docs/

assets/

deployment/

tests/
```

---
## Client

```bash
cd client
npm install
npm run dev
```

## Server

```bash
cd server
npm install
npm run dev
```

## AI Engine

```bash
cd intelligence-engine
pip install -r requirements.txt
python app.py
```
---

## Design Philosophy

The platform has been designed around four principles.

1. Data Fusion

   Multiple independent industrial systems should contribute to a unified operational picture.

2. Explainability

   Every prediction must include the reasoning behind the decision.

3. Preventive Intelligence

   The objective is to predict incidents rather than react after they occur.

4. Scalability

   The architecture should support additional AI services without major changes.

---

## Development Roadmap

Phase I

- Authentication
- Dashboard
- Sensor Monitoring
- Worker Module
- Machine Module
- Rule-Based Risk Engine

Phase II

- PPE Detection
- Fire Detection
- Predictive Maintenance
- Compliance Analysis

Phase III

- RAG Assistant
- Knowledge Graph
- Multi-Agent Decision Engine
- Digital Twin

---
