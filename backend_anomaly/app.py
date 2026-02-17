# ---------------------- Imports ----------------------
from database import init_db, save_inspection, get_history
from fastapi.middleware.cors import CORSMiddleware

import os, uuid, shutil, json, io
import numpy as np
import faiss

from fastapi import FastAPI, UploadFile, File, Depends, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from pydantic import BaseModel

from patchcore_engine import (
    train_object,
    infer_image,
    infer_batch,
    encode_heatmap_png,
    load_profile
)

from auth import (
    users_db,
    hash_password,
    verify_password,
    create_access_token,
    decode_token
)

# ---------------------- App Init ----------------------
app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-Anomaly-Score", "X-Result"],
)

init_db()
BASE_DIR = "storage/objects"
os.makedirs(BASE_DIR, exist_ok=True)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

# ---------------------- Auth Dependency ----------------------
def get_current_user(token: str = Depends(oauth2_scheme)):
    try:
        payload = decode_token(token)
        username = payload.get("sub")
        if username not in users_db:
            raise HTTPException(status_code=401)
        return username
    except:
        raise HTTPException(status_code=401, detail="Invalid token")

# ---------------------- Register ----------------------

class UserCreate(BaseModel):
    username: str
    password: str

@app.post("/register")
def register(user: UserCreate):
    if user.username in users_db:
        raise HTTPException(status_code=400, detail="User exists")

    users_db[user.username] = {
        "username": user.username,
        "password": hash_password(user.password)
    }
    return {"message": "Registered"}

# ---------------------- Login ----------------------
@app.post("/login")
def login(form: OAuth2PasswordRequestForm = Depends()):
    user = users_db.get(form.username)

    if not user or not verify_password(form.password, user["password"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_access_token({"sub": form.username})
    return {"access_token": token, "token_type": "bearer"}

# ---------------------- Create Object ----------------------
@app.post("/objects")
def create_object(name: str, user: str = Depends(get_current_user)):
    obj_id = str(uuid.uuid4())
    path = f"{BASE_DIR}/{user}/{obj_id}"
    os.makedirs(path, exist_ok=True)

    return {"object_id": obj_id, "owner": user}

# ---------------------- Train Object ----------------------
@app.post("/objects/{object_id}/train")
def train(object_id: str, files: list[UploadFile] = File(...),
          user: str = Depends(get_current_user)):

    obj_dir = f"{BASE_DIR}/{user}/{object_id}"
    if not os.path.exists(obj_dir):
        raise HTTPException(status_code=403, detail="Access denied")

    temp_dir = f"/tmp/{object_id}_train"
    os.makedirs(temp_dir, exist_ok=True)

    image_paths = []
    for f in files:
        p = f"{temp_dir}/{f.filename}"
        with open(p, "wb") as buffer:
            shutil.copyfileobj(f.file, buffer)
        image_paths.append(p)

    train_object(image_paths, obj_dir)
    return {"status": "trained", "images_used": len(image_paths)}

# ---------------------- Inspect (Single + Heatmap) ----------------------
@app.post("/objects/{object_id}/inspect")
def inspect(object_id: str, file: UploadFile = File(...),
            user: str = Depends(get_current_user)):

    obj_dir = f"{BASE_DIR}/{user}/{object_id}"
    if not os.path.exists(obj_dir):
        raise HTTPException(status_code=403, detail="Access denied")

    # Save uploaded image
    path = f"/tmp/{file.filename}"
    with open(path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    # Load object profile
    index, threshold, config = load_profile(obj_dir)
    top_k = config["top_k"]

    score, score_map = infer_image(path, index, top_k)
    result = "DEFECT" if score > threshold else "NORMAL"
    
    save_inspection(
    user=user,
    object_id=object_id,
    filename=file.filename,
    score=score,
    result=result
    )

    heatmap_bytes = encode_heatmap_png(path, score_map)

    headers = {
        "X-Anomaly-Score": str(score),
        "X-Result": result
    }

    return StreamingResponse(
        io.BytesIO(heatmap_bytes),
        media_type="image/png",
        headers=headers
    )

# ---------------------- Batch Inspection ----------------------
@app.post("/objects/{object_id}/inspect-batch")
def inspect_batch(object_id: str, files: list[UploadFile] = File(...),
                  user: str = Depends(get_current_user)):

    obj_dir = f"{BASE_DIR}/{user}/{object_id}"
    if not os.path.exists(obj_dir):
        raise HTTPException(status_code=403, detail="Access denied")

    temp_dir = f"/tmp/{object_id}_batch"
    os.makedirs(temp_dir, exist_ok=True)

    image_paths = []
    for f in files:
        p = f"{temp_dir}/{f.filename}"
        with open(p, "wb") as buffer:
            shutil.copyfileobj(f.file, buffer)
        image_paths.append(p)

    index, threshold, config = load_profile(obj_dir)
    top_k = config["top_k"]

    batch_results = infer_batch(image_paths, index, top_k)

    response = []
    for path, score, _ in batch_results:
        result = "DEFECT" if score > threshold else "NORMAL"
        save_inspection(
            user=user,
            object_id=object_id,
            filename=os.path.basename(path),
            score=score,
            result=result
        )

        response.append({
            "filename": os.path.basename(path),
            "score": float(score),
            "result": result
        })

    return {
        "object_id": object_id,
        "batch_size": len(response),
        "results": response
    }

# --------------------------- VIEW HISTORY ---------------------------
@app.get("/objects/{object_id}/history")
def history(object_id: str, user: str = Depends(get_current_user)):
    rows = get_history(user, object_id)

    data = []
    for r in rows:
        data.append({
            "filename": r[0],
            "score": r[1],
            "result": r[2],
            "timestamp": r[3]
        })

    return {"history": data}

# --------------------------- ANALYTICS ---------------------------
@app.get("/objects/{object_id}/analytics")
def analytics(object_id: str, user: str = Depends(get_current_user)):
    rows = get_history(user, object_id)

    total = len(rows)
    if total == 0:
        return {
            "total": 0,
            "normal": 0,
            "defect": 0,
            "defect_rate": 0,
        }

    normal = sum(1 for r in rows if r[2] == "NORMAL")
    defect = sum(1 for r in rows if r[2] == "DEFECT")
    defect_rate = round((defect / total) * 100, 2)

    return {
        "total": total,
        "normal": normal,
        "defect": defect,
        "defect_rate": defect_rate,
    }
