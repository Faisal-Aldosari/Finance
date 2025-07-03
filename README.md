# Power BI Clone

This project is a full-featured Power BI clone web application, featuring:

- **Backend**: FastAPI (Python) for APIs, data processing, and user management
- **Frontend**: Vite + React + TypeScript for a modern, user-friendly dashboard
- **Features**: Data upload, interactive visualizations (charts, tables, maps), dashboard/report creation, sharing, and embedding
- **UI/UX**: Responsive, beautiful interface using a top-tier UI library
- **Footer**: "Created by Faisal Aldosari" on all pages
- **Extensible**: Designed for easy customization and future expansion

## Getting Started

### Backend (FastAPI)
1. Create and activate the virtual environment:
   ```sh
   python3 -m venv backend-venv
   source backend-venv/bin/activate
   ```
2. Install dependencies:
   ```sh
   pip install fastapi uvicorn
   ```
3. Run the backend server:
   ```sh
   uvicorn backend.main:app --reload
   ```

### Frontend (Vite + React + TypeScript)
1. Install dependencies:
   ```sh
   npm install
   ```
2. Start the development server:
   ```sh
   npm run dev
   ```

## Customization
- All user-facing pages must include the footer: "Created by Faisal Aldosari".
- UI should be intuitive, responsive, and visually appealing.

## License
MIT
