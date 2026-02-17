# VisionGuard — AI Visual Inspection System

VisionGuard is an industrial-grade AI system for **surface anomaly detection** using PatchCore.  
It enables training on normal images and detecting defects with heatmap visualization, confidence score, and analytics dashboard.

---

## Features

- PatchCore anomaly detection (ResNet backbone)
- Train on normal images only
- Heatmap defect localization
- Confidence visualization
- Batch inspection
- Inspection history (database)
- Analytics dashboard (defect rate, charts)
- JWT authentication
- Multi-object architecture
- React industrial UI

---

## Tech Stack

**AI / Backend**
- Python
- PyTorch
- PatchCore
- FAISS
- FastAPI
- SQLite

**Frontend**
- React + Vite
- TypeScript
- Recharts
- Tailwind / Industrial UI

---

## Installation

### 1. Clone repo

--- bash
git clone https://github.com/YOUR_USERNAME/visionguard-ai-inspection.git
cd visionguard-ai-inspection

### 2. Backend Setup
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
uvicorn app:app --reload

--- Backend runs at:
    http://127.0.0.1:8000

### 3. Frontend Setup
cd frontend
npm install
npm run dev

--- Frontend runs at:
    http://localhost:8080
    
----
Usage:
1. Register user
2. Create object
3. Train with GOOD images
4. Run inspection
5. View heatmap + confidence
6. Batch inspect
7. View analytics dashboard

----
Future Improvements: 
1. Auto threshold tuning
2. Real-time inspection
3. Drift detection
4. Edge deployment
5. Docker support
6. Agentic AI retraining
