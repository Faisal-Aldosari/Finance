import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_root():
    r = client.get("/")
    assert r.status_code == 200
    assert "message" in r.json()

def test_department_crud():
    # This test assumes authentication is mocked or disabled for demo
    dept = {"id": "test", "name": "Test Department"}
    r = client.post("/departments", json=dept)
    assert r.status_code in (200, 201, 400)  # 400 if already exists
    r = client.get("/departments")
    assert r.status_code == 200
    assert isinstance(r.json(), list)

def test_cash_transaction_and_summary():
    txn = {"id": "1", "type": "in", "amount": 100.0, "description": "Deposit"}
    r = client.post("/cash/transaction", json=txn)
    assert r.status_code in (200, 201)
    r = client.get("/cash/summary")
    assert r.status_code == 200
    data = r.json()
    assert "total_in" in data and "total_cash" in data
