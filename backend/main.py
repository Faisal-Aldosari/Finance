from fastapi import FastAPI, HTTPException, UploadFile, File, BackgroundTasks, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Optional, Union
from fastapi.responses import FileResponse, JSONResponse
import tempfile
from fpdf import FPDF
import pandas as pd
from fastapi_users import FastAPIUsers, models as fa_models, schemas as fa_schemas
from fastapi_users.authentication import JWTStrategy, AuthenticationBackend, CookieTransport
from httpx_oauth.clients.google import GoogleOAuth2
from httpx_oauth.clients.microsoft import MicrosoftGraphOAuth2
from fastapi_users.db import SQLAlchemyUserDatabase
from sqlalchemy import create_engine, Column, String, Boolean
from sqlalchemy.ext.declarative import DeclarativeMeta, declarative_base
from sqlalchemy.orm import sessionmaker
from fastapi import Depends, Request
import uuid
import os
from datetime import datetime
from dotenv import load_dotenv
import smtplib
from email.message import EmailMessage
import asyncio

app = FastAPI()

# Load environment variables
load_dotenv()

# Get frontend URLs for CORS
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")
PRODUCTION_FRONTEND_URL = os.getenv("PRODUCTION_FRONTEND_URL", "https://your-frontend-url.com")

# Allow CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL, PRODUCTION_FRONTEND_URL, "http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root endpoint
@app.get("/")
async def root():
    return {"message": "YoussefBI Finance API", "status": "running"}

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": str(datetime.now())}

# In-memory storage for demo
DEPARTMENTS: Dict[str, dict] = {}
EMPLOYEES: Dict[str, dict] = {}
SESSIONS: List[dict] = []
UPLOADED_DATA: List[dict] = []
CASH_TRANSACTIONS = {}
VERIFIED_USERS = set()

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
# Database setup
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./test.db")
SECRET = os.getenv("SECRET", "SECRET")
EMAIL_ADDRESS = os.getenv("EMAIL_ADDRESS", "youssefbisystem@gmail.com")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD", "oqjo rvwg gzlz ztnh")

# Database setup
load_dotenv()
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./test.db")
SECRET = os.getenv("SECRET", "SECRET")
EMAIL_ADDRESS = os.getenv("EMAIL_ADDRESS", "youssefbisystem@gmail.com")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD", "oqjo rvwg gzlz ztnh")

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
    username: Optional[str]

class UserCreate(fa_schemas.BaseUserCreate):
    username: Optional[str]

class UserUpdate(fa_schemas.BaseUserUpdate):
    username: Optional[str]

async def get_user_db():
    db = SessionLocal()
    try:
        yield SQLAlchemyUserDatabase(db, User)
    finally:
        db.close()

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
@app.post("/auth/register")
async def register_user(data: dict, background_tasks: BackgroundTasks, user_db: SQLAlchemyUserDatabase = Depends(get_user_db)):
    """Custom registration endpoint that creates user and sends verification email"""
    email = data.get('email')
    username = data.get('username')
    password = data.get('password')
    
    if not email or not username or not password:
        raise HTTPException(status_code=400, detail="Missing required fields")
    
    # Check if user already exists
    existing_user = await user_db.get_by_email(email)
    if existing_user:
        raise HTTPException(status_code=400, detail="User already exists")
    
    # Create user
    user_create = UserCreate(email=email, username=username, password=password)
    try:
        user = await user_db.create(user_create)
        
        # Send verification email
        token = str(uuid.uuid4())
        VERIFIED_USERS.add(token)
        
        def send_email():
            msg = EmailMessage()
            msg['Subject'] = 'Verify your email for YoussefBI'
            msg['From'] = EMAIL_ADDRESS
            msg['To'] = email
            msg.set_content(f'Welcome to YoussefBI! Click to verify your email: {FRONTEND_URL}/verify-email?token={token}')
            try:
                with smtplib.SMTP('smtp.gmail.com', 587) as s:
                    s.starttls()
                    s.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
                    s.send_message(msg)
            except Exception as e:
                print('Email send failed:', e)
        
        background_tasks.add_task(send_email)
        return {"detail": "Registration successful. Verification email sent."}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/auth/request-verify")
def request_verify(data: dict, background_tasks: BackgroundTasks):
    email = data.get('email')
    username = data.get('username')
    password = data.get('password')
    if not email or not username or not password:
        raise HTTPException(status_code=400, detail="Missing fields")
    token = str(uuid.uuid4())
    VERIFIED_USERS.add(token)
    def send_email():
        msg = EmailMessage()
        msg['Subject'] = 'Verify your email'
        msg['From'] = EMAIL_ADDRESS
        msg['To'] = email
        msg.set_content(f'Click to verify: {FRONTEND_URL}/verify-email?token={token}')
        try:
            with smtplib.SMTP('smtp.gmail.com', 587) as s:
                s.starttls()
                s.login(EMAIL_ADDRESS, EMAIL_PASSWORD)
                s.send_message(msg)
        except Exception as e:
            print('Email send failed:', e)
    background_tasks.add_task(send_email)
    return JSONResponse({"detail": "Verification email sent."}, status_code=status.HTTP_200_OK)

@app.get("/auth/verify")
def verify_email(token: str):
    if token in VERIFIED_USERS:
        VERIFIED_USERS.remove(token)
        return {"detail": "Email verified."}
    raise HTTPException(status_code=400, detail="Invalid or expired token")

# OAuth2 setup
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "")
MICROSOFT_CLIENT_ID = os.getenv("MICROSOFT_CLIENT_ID", "")
MICROSOFT_CLIENT_SECRET = os.getenv("MICROSOFT_CLIENT_SECRET", "")

# Use your deployed backend URL for production
BACKEND_URL = os.getenv("BACKEND_URL", "https://finance-g72p.onrender.com")
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")

GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI", f"{BACKEND_URL}/auth/google/callback")
MICROSOFT_REDIRECT_URI = os.getenv("MICROSOFT_REDIRECT_URI", f"{BACKEND_URL}/auth/microsoft/callback")

google_oauth = GoogleOAuth2(
    client_id=GOOGLE_CLIENT_ID,
    client_secret=GOOGLE_CLIENT_SECRET
)
microsoft_oauth = MicrosoftGraphOAuth2(
    client_id=MICROSOFT_CLIENT_ID,
    client_secret=MICROSOFT_CLIENT_SECRET
)

app.include_router(
    fastapi_users.get_oauth_router(google_oauth, jwt_backend, UserRead),
    prefix="/auth/google",
    tags=["auth"],
)
app.include_router(
    fastapi_users.get_oauth_router(microsoft_oauth, jwt_backend, UserRead),
    prefix="/auth/microsoft",
    tags=["auth"],
)
