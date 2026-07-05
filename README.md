# Cognera Resolve

Cognera Resolve is a full-stack AI-assisted consumer complaint workspace built for hackathon submission.

The idea of the project is simple: when a user has a complaint against a company (refund not received, damaged product, billing issue, delivery problem, etc.), the app helps organize the case, store evidence, identify missing details, and generate a complaint draft.

---

## What the project does

The app lets a user:

- create a complaint case
- upload evidence files for that case
- run AI intake analysis on the case
- view missing information / follow-up questions
- generate a complaint draft for escalation

---

## Main Features

### 1. Case Management
Users can create and manage complaint cases with fields like:
- title
- merchant/company name
- issue category
- amount
- purchase date
- summary

### 2. Evidence Vault
Each case has an evidence section where files can be uploaded.

Supported file types:
- PDF
- PNG
- JPG / JPEG
- WEBP

Current evidence features:
- drag and drop upload
- file type validation
- max file size validation
- delete uploaded file

### 3. Intake Analysis
The app can run an AI intake analysis for a case.

It generates:
- a short case summary
- extracted complaint facts
- missing information checklist
- evidence assessment
- next follow-up questions

### 4. Missing Info View
The missing information tab shows what details are still needed before filing or escalating the complaint.

### 5. Complaint Draft Generation
The app can generate a complaint draft based on:
- case details
- intake analysis
- uploaded document metadata

---

## Tech Stack

### Frontend
- React
- Vite
- Zustand
- Tailwind CSS
- Axios

### Backend
- FastAPI
- SQLAlchemy
- Pydantic
- OpenAI Python SDK

### Database / Storage
- SQLite
- local file storage for uploads

---

## Project Structure

```bash
Cognera-resolve/
├── backend/
│   ├── app/
│   │   ├── core/
│   │   ├── db/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── schemas/
│   │   └── services/
│   ├── .env.example
│   └── requirements.txt
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   └── store/
│   └── .env.example
│
├── docs/
└── README.md
