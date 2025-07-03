from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict
from fastapi.responses import FileResponse
import tempfile
from fpdf import FPDF
import pandas as pd
from fastapi_users import FastAPIUsers, models as fa_models, schemas as fa_schemas
from fastapi_users.authentication import JWTStrategy, AuthenticationBackend, CookieTransport
from fastapi_users.db import SQLAlchemyUserDatabase
from sqlalchemy import create_engine, Column, String, Boolean
from sqlalchemy.ext.declarative import DeclarativeMeta, declarative_base
from sqlalchemy.orm import sessionmaker
from fastapi import Depends, Request
import uuid
import os
from dotenv import load_dotenv

app = FastAPI()

# Allow CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for demo
DEPARTMENTS: Dict[str, dict] = {}
EMPLOYEES: Dict[str, dict] = {}
SESSIONS: List[dict] = []
UPLOADED_DATA: List[dict] = []
CASH_TRANSACTIONS = {}

class Department(BaseModel):
    id: str
    name: str

class Employee(BaseModel):
    id: str
    name: str
    department_id: str

class Session(BaseModel):
    id: str
    employee_id: str
    expected: int
    actual: int

class CashTransaction(BaseModel):
    id: str
    type: str  # 'in' or 'out'
    amount: float
    description: str = ""

@app.get("/")
def read_root():
    return {"message": "Welcome to the Power BI Clone API!"}

# Database setup
load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./test.db")
SECRET = os.getenv("SECRET", "SECRET")

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base: DeclarativeMeta = declarative_base()

class User(Base):
    __tablename__ = "user"
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False)
    username = Column(String, unique=True, index=True, nullable=True)

Base.metadata.create_all(bind=engine)

class UserRead(fa_schemas.BaseUser[str]):
    username: str | None

class UserCreate(fa_schemas.BaseUserCreate):
    username: str | None

class UserUpdate(fa_schemas.BaseUserUpdate):
    username: str | None

def get_user_db():
    db = SessionLocal()
    yield SQLAlchemyUserDatabase(db, User)

cookie_transport = CookieTransport(cookie_name="auth", cookie_max_age=3600)

def get_jwt_strategy() -> JWTStrategy:
    return JWTStrategy(secret=SECRET, lifetime_seconds=3600)

jwt_backend = AuthenticationBackend(
    name="jwt",
    transport=cookie_transport,
    get_strategy=get_jwt_strategy,
)

fastapi_users = FastAPIUsers[User, str](get_user_db, [jwt_backend])

app.include_router(
    fastapi_users.get_auth_router(jwt_backend),
    prefix="/auth/jwt",
    tags=["auth"],
)
app.include_router(
    fastapi_users.get_register_router(UserRead, UserCreate),
    prefix="/auth",
    tags=["auth"],
)
app.include_router(
    fastapi_users.get_users_router(UserRead, UserUpdate),
    prefix="/users",
    tags=["users"],
)

def get_user(request: Request):
    return request.state.user

# Example of user data isolation for departments
@app.post("/departments", response_model=Department)
def add_department(dept: Department, user=Depends(fastapi_users.current_user())):
    key = f"{user.id}:{dept.id}"
    if key in DEPARTMENTS:
        raise HTTPException(status_code=400, detail="Department already exists")
    DEPARTMENTS[key] = {**dept.dict(), "user_id": user.id}
    return dept

@app.get("/departments", response_model=List[Department])
def list_departments(user=Depends(fastapi_users.current_user())):
    return [d for d in DEPARTMENTS.values() if d.get("user_id") == user.id]

@app.post("/employees", response_model=Employee)
def add_employee(emp: Employee, user=Depends(fastapi_users.current_user())):
    if emp.id in EMPLOYEES:
        raise HTTPException(status_code=400, detail="Employee already exists")
    if emp.department_id not in DEPARTMENTS:
        raise HTTPException(status_code=404, detail="Department not found")
    EMPLOYEES[emp.id] = emp.dict()
    return emp

@app.get("/employees", response_model=List[Employee])
def list_employees(user=Depends(fastapi_users.current_user())):
    return [e for e in EMPLOYEES.values() if e.get("user_id") == user.id]

@app.post("/sessions", response_model=Session)
def add_session(sess: Session, user=Depends(fastapi_users.current_user())):
    if sess.employee_id not in EMPLOYEES:
        raise HTTPException(status_code=404, detail="Employee not found")
    SESSIONS.append(sess.dict())
    return sess

@app.get("/sessions/aggregate")
def aggregate_sessions(user=Depends(fastapi_users.current_user())):
    agg = {}
    for s in SESSIONS:
        eid = s['employee_id']
        if eid not in agg:
            agg[eid] = {'expected': 0, 'actual': 0}
        agg[eid]['expected'] += s['expected']
        agg[eid]['actual'] += s['actual']
    return agg

@app.get("/export/pdf")
def export_pdf(user=Depends(fastapi_users.current_user())):
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", size=12)
    pdf.cell(200, 10, txt="Departments", ln=True)
    for d in DEPARTMENTS.values():
        pdf.cell(200, 10, txt=f"{d['id']}: {d['name']}", ln=True)
    pdf.cell(200, 10, txt="Employees", ln=True)
    for e in EMPLOYEES.values():
        pdf.cell(200, 10, txt=f"{e['id']}: {e['name']} (Dept: {e['department_id']})", ln=True)
    pdf.cell(200, 10, txt="Sessions (Aggregated)", ln=True)
    agg = aggregate_sessions()
    for eid, data in agg.items():
        pdf.cell(200, 10, txt=f"Employee {eid}: Expected {data['expected']}, Actual {data['actual']}", ln=True)
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        pdf.output(tmp.name)
        return FileResponse(tmp.name, filename="report.pdf", media_type="application/pdf")

@app.post("/upload-data")
def upload_data(file: UploadFile = File(...), user=Depends(fastapi_users.current_user())):
    if not file.filename.endswith(('.csv', '.xlsx')):
        raise HTTPException(status_code=400, detail="Unsupported file type. Please upload a CSV or Excel file.")
    try:
        if file.filename.endswith('.csv'):
            df = pd.read_csv(file.file)
        else:
            df = pd.read_excel(file.file)
    except Exception:
        raise HTTPException(status_code=400, detail="Failed to parse file. Please check your file format.")
    if df.empty:
        raise HTTPException(status_code=400, detail="Uploaded file contains no data.")
    global UPLOADED_DATA
    UPLOADED_DATA = df.to_dict(orient='records')
    return {"columns": list(df.columns), "rows": len(df)}

@app.get("/uploaded-data")
def get_uploaded_data():
    global UPLOADED_DATA
    return UPLOADED_DATA if 'UPLOADED_DATA' in globals() else []

# --- Bank/Cash Tracking ---
@app.post("/cash/transaction")
def add_cash_transaction(txn: CashTransaction, user=Depends(fastapi_users.current_user())):
    if txn.type not in ("in", "out"):
        raise HTTPException(status_code=400, detail="Type must be 'in' or 'out'.")
    if txn.amount <= 0:
        raise HTTPException(status_code=400, detail="Amount must be positive.")
    if not txn.description.strip():
        raise HTTPException(status_code=400, detail="Description is required.")
    user_id = user.id
    if user_id not in CASH_TRANSACTIONS:
        CASH_TRANSACTIONS[user_id] = []
    CASH_TRANSACTIONS[user_id].append(txn.dict())
    return txn

@app.get("/cash/summary")
def get_cash_summary(user=Depends(fastapi_users.current_user())):
    txns = CASH_TRANSACTIONS.get(user.id, [])
    total_in = sum(t['amount'] for t in txns if t['type'] == 'in')
    total_out = sum(t['amount'] for t in txns if t['type'] == 'out')
    total_cash = total_in - total_out
    # For demo, gross margin = total_in * 0.6, net = total_cash * 0.8
    gross_margin = total_in * 0.6
    net = total_cash * 0.8
    return {
        "total_in": total_in,
        "total_out": total_out,
        "total_cash": total_cash,
        "gross_margin": gross_margin,
        "net": net
    }

@app.get("/cash/summary/pdf")
def export_cash_summary_pdf(user=Depends(fastapi_users.current_user())):
    from fpdf import FPDF
    import tempfile
    summary = get_cash_summary(user)
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font("Arial", size=16)
    pdf.cell(200, 10, txt="Financial Summary", ln=True)
    for k, v in summary.items():
        pdf.cell(200, 10, txt=f"{k.replace('_', ' ').title()}: {v}", ln=True)
    with tempfile.NamedTemporaryFile(delete=False, suffix=".pdf") as tmp:
        pdf.output(tmp.name)
        return FileResponse(tmp.name, filename="summary.pdf", media_type="application/pdf")
