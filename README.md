# AI-Based Early Warning and Landslide Risk Monitoring System in NER

An AI-based landslide risk monitoring and early warning system designed for the **North Eastern Region (NER) of India**.
The system combines geospatial data, environmental factors, historical landslide information, rainfall conditions, and machine-learning-based risk prediction to identify areas that may have an elevated risk of landslides.

---

## 🚨 Problem Statement

The North Eastern Region of India is highly susceptible to landslides because of its mountainous terrain, heavy rainfall, geological conditions, and other environmental factors.
Existing approaches often rely on historical information or manual monitoring, which can make it difficult to provide timely, location-specific risk information.

This project aims to develop a system that can:

* Monitor landslide-prone regions using geospatial data.
* Analyze environmental and terrain-related factors.
* Estimate landslide risk for specific locations.
* Provide risk information through an interactive map.
* Support early identification of potentially hazardous areas.
* Provide contributing factors associated with the predicted risk.

---

## 🎯 Objectives

1. Develop a geospatial database covering the North Eastern Region.
2. Divide the region into spatial grid cells for location-based analysis.
3. Store terrain, environmental, soil, rainfall, and historical landslide information.
4. Integrate machine learning for landslide-risk prediction.
5. Provide an interactive map for exploring risk across the region.
6. Display risk probability and contributing factors for selected locations.
7. Provide a foundation for future early-warning and alert mechanisms.

---

## 🗺️ System Overview

The system follows a data → prediction → visualization workflow:

```text
Environmental & Geospatial Data
              │
              ▼
       PostGIS Spatial DB
              │
              ▼
       Grid Cell Selection
              │
              ▼
       Feature Extraction
              │
              ▼
     Machine Learning Model
              │
              ▼
       Landslide Risk Score
              │
              ▼
       FastAPI Backend
              │
              ▼
       Next.js Web Dashboard
              │
              ▼
      Interactive Risk Map
```

---

## 🧩 Key Components

### 1. Spatial Grid

The project uses a **1 km × 1 km spatial grid covering the North Eastern Region**.

Each grid cell can contain information such as:

* Elevation
* Slope
* Soil characteristics
* Soil moisture-related information
* Rainfall
* Historical landslide information
* Other terrain and environmental features

The spatial data is managed using **PostgreSQL + PostGIS**.

---

### 2. Geospatial Database

The backend uses PostgreSQL with PostGIS to efficiently store and query spatial information.

Example spatial workflow:

```text
Latitude + Longitude
        │
        ▼
Find containing grid cell
        │
        ▼
Retrieve grid features
        │
        ▼
Send features to ML model
```

The project uses spatial reference systems appropriate for geographic and projected spatial operations.

---

### 3. Machine Learning

A machine-learning model is used to estimate the probability of landslide occurrence based on the available environmental and terrain features.

The model is being developed separately and integrated with the backend prediction pipeline.

The prediction output is intended to provide:

* Landslide probability
* Risk level
* Important contributing factors

> Model performance metrics and final model details will be added after the model development and validation stage.

---

### 4. Dynamic Rainfall Data

Rainfall is an important triggering factor for landslides.

The system is designed to incorporate recent rainfall information into the risk-analysis pipeline.

Future development includes maintaining recent rainfall observations and deriving rainfall-based features for grid cells.

---

### 5. Interactive Risk Map

The frontend provides an interactive map where users can:

* Explore the monitored region.
* Select a location.
* Identify the corresponding grid cell.
* View the predicted landslide risk.
* View contributing environmental factors.
* Visualize risk information geographically.

Future versions will provide a more comprehensive region-wide risk overlay.

---

## 🖥️ Technology Stack

### Backend

* **Python**
* **FastAPI**
* **SQLAlchemy**
* **PostgreSQL**
* **PostGIS**
* **Pydantic**

### Frontend

* **Next.js**
* **React**
* **TypeScript**
* **Leaflet**
* **Tailwind CSS**

### Machine Learning

* Python
* NumPy
* Pandas
* Scikit-learn

### Development

* Git
* GitHub
* VS Code
* QGIS

---

## 🗄️ Data

The project uses a region-wide spatial grid containing environmental and terrain-related information.

The complete dataset is **not included directly in this repository** when its size or distribution constraints make Git storage inappropriate.

Dataset documentation and instructions for obtaining/using the required data will be provided separately.

---

## 🔐 Environment Variables

Sensitive configuration such as database credentials and API keys should be stored in environment variables.

Example:

```env
DATABASE_URL=your_database_connection_string
```

Do **not** commit `.env` files containing real credentials.

A safe example configuration can be provided through:

```text
.env.example
```

---

## 🚀 Getting Started

### Prerequisites

Make sure you have installed:

* Python 3.x
* Node.js
* PostgreSQL
* PostGIS
* Git

---

### Backend Setup

Clone the repository:

```bash
git clone <repository-url>
cd landslide-project
```

Create and activate a Python virtual environment:

```bash
python -m venv .myenv
```

Windows:

```powershell
.myenv\Scripts\activate
```

Install backend dependencies:

```bash
pip install -r requirements.txt
```

Configure your environment variables and database connection.

Start the FastAPI server:

```bash
uvicorn app.main:app --reload
```

---

### Frontend Setup

Move to the frontend directory:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

The frontend can then be accessed through the local development URL displayed by Next.js.

---

## 🔄 Current Development Workflow

The project is being developed in multiple layers:

```text
1. Spatial Dataset
       ↓
2. PostGIS Database
       ↓
3. FastAPI APIs
       ↓
4. ML Model Integration
       ↓
5. Next.js Dashboard
       ↓
6. Risk Visualization
       ↓
7. Early Warning System
```

---

## 🛣️ Roadmap

### Completed / In Progress

* [x] FastAPI backend setup
* [x] PostgreSQL database integration
* [x] PostGIS spatial database setup
* [x] NER-wide 1 km × 1 km grid integration
* [x] Location-to-grid spatial query
* [x] Frontend dashboard
* [x] Interactive map
* [x] Backend/frontend integration
* [ ] Machine-learning model integration
* [ ] Dynamic rainfall integration
* [ ] Region-wide risk overlay
* [ ] Advanced contributing-factor analysis
* [ ] Early warning and alert workflow

---

## 👥 Team

This project is being developed as part of the **Smart India Hackathon (SIH)**.

**SIH Problem Statement:**
**SIH26001 — AI-Based Early Warning and Landslide Risk Monitoring System in NER**


| Area                | Responsibility                            |
| ------------------- | ----------------------------------------- |
| Backend             | FastAPI, APIs, database integration       |
| Database            | PostgreSQL, PostGIS, spatial data         |
| Frontend            | Next.js, React, interactive visualization |
| Machine Learning    | Model development and prediction          |
| Geospatial Analysis | Terrain and environmental data processing |

---

## ⚠️ Project Status

This project is currently under active development.

Some components, including the final machine-learning model, dynamic environmental-data pipeline, and complete early-warning workflow, are still being integrated and validated.

Therefore, the current implementation should be considered a **development/MVP version** rather than a production-ready early-warning system.

---

## 📜 License


---

## ⭐ Acknowledgements

This project is developed for **Smart India Hackathon (SIH)** with the goal of applying artificial intelligence, geospatial technologies, and environmental data analysis to landslide-risk monitoring in the North Eastern Region of India.
