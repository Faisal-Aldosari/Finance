import pytest
from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def test_upload_data_validation():
    # No file
    r = client.post("/upload-data", files={})
    assert r.status_code == 422 or r.status_code == 400
    # Invalid file type
    r = client.post("/upload-data", files={"file": ("test.txt", b"bad data", "text/plain")})
    assert r.status_code == 400
    # Empty CSV
    r = client.post("/upload-data", files={"file": ("empty.csv", b"", "text/csv")})
    assert r.status_code == 400

def test_cash_transaction_validation():
    # Invalid type
    txn = {"id": "2", "type": "bad", "amount": 100, "description": "desc"}
    r = client.post("/cash/transaction", json=txn)
    assert r.status_code == 400
    # Negative amount
    txn = {"id": "3", "type": "in", "amount": -50, "description": "desc"}
    r = client.post("/cash/transaction", json=txn)
    assert r.status_code == 400
    # Empty description
    txn = {"id": "4", "type": "in", "amount": 50, "description": "   "}
    r = client.post("/cash/transaction", json=txn)
    assert r.status_code == 400
