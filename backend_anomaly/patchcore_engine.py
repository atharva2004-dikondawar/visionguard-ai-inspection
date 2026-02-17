# --------------------------- Imports -------------------
import os, json
import numpy as np
import faiss
import cv2
from PIL import Image

import torch
import torch.nn.functional as F
from torchvision import models, transforms

# --------------------- Shared backbone ------------------
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"

resnet = models.resnet18(weights=models.ResNet18_Weights.DEFAULT).to(DEVICE)
resnet.eval()
for p in resnet.parameters():
    p.requires_grad = False

# ----------------------- Hooks -------------------------
feature_maps = []

def hook_fn(_, __, output):
    feature_maps.append(output)

resnet.layer2.register_forward_hook(hook_fn)
resnet.layer3.register_forward_hook(hook_fn)

# --------------------- Transforms ------------------------
transform = transforms.Compose([
    transforms.Resize((224,224)),
    transforms.ToTensor(),
    transforms.Normalize(
        mean=[0.485,0.456,0.406],
        std=[0.229,0.224,0.225]
    )
])

# --------------------- Patch Extraction ---------------------
def extract_patches(img_tensor):
    global feature_maps
    feature_maps = []

    with torch.no_grad():
        _ = resnet(img_tensor)

    fmap1, fmap2 = feature_maps
    fmap2 = F.interpolate(fmap2, size=fmap1.shape[-2:], mode="bilinear")

    patches = torch.cat([fmap1, fmap2], dim=1)
    B, C, H, W = patches.shape

    patches = patches.permute(0,2,3,1).reshape(-1, C)
    return patches.cpu().numpy().astype(np.float32), (H, W)

# ----------------------- Build Object Profile (TRAIN) ----------------
def train_object(image_paths, save_dir, top_k=10, coreset_ratio=0.1):
    all_patches = []

    for path in image_paths:
        img = Image.open(path).convert("RGB")
        img_t = transform(img).unsqueeze(0).to(DEVICE)
        patches, _ = extract_patches(img_t)
        all_patches.append(patches)

    memory = np.concatenate(all_patches)

    # -------- Coreset Sampling --------
    n = int(len(memory) * coreset_ratio)
    idx = np.random.choice(len(memory), n, replace=False)
    memory = memory[idx]

    # -------- Build FAISS index --------
    index = faiss.IndexFlatL2(memory.shape[1])
    index.add(memory)

    # -------- Threshold Calibration --------
    scores = []
    for p in image_paths:
        s, _ = infer_image(p, index, top_k)
        scores.append(s)

    threshold = float(np.percentile(scores, 99.5))

    os.makedirs(save_dir, exist_ok=True)
    np.save(f"{save_dir}/memory.npy", memory)
    faiss.write_index(index, f"{save_dir}/faiss.index")

    with open(f"{save_dir}/threshold.json", "w") as f:
        json.dump({"threshold": threshold}, f)

    with open(f"{save_dir}/config.json", "w") as f:
        json.dump({
            "top_k": top_k,
            "coreset_ratio": coreset_ratio
        }, f)

# ---------------------------- Inference ---------------------------
def infer_image(image_path, index, top_k):
    img = Image.open(image_path).convert("RGB")
    img_t = transform(img).unsqueeze(0).to(DEVICE)

    patches, (H, W) = extract_patches(img_t)

    dists, _ = index.search(patches, 1)
    patch_scores = dists.squeeze()

    # -------- Top-K aggregation --------
    image_score = float(np.mean(np.sort(patch_scores)[-top_k:]))

    score_map = patch_scores.reshape(H, W)
    return image_score, score_map

# ---------------------------- Batch Inference ---------------------------
def infer_batch(image_paths, index, top_k):
    results = []

    for path in image_paths:
        score, score_map = infer_image(path, index, top_k)
        results.append((path, score, score_map))

    return results

# ------------------------------ Heatmap Utilities ------------------------------
def normalize_heatmap(hm):
    hm = hm - hm.min()
    return hm / (hm.max() + 1e-8)

def create_heatmap_overlay(image_path, score_map):
    img = Image.open(image_path).convert("RGB").resize((224, 224))
    img_np = np.array(img)

    hm = cv2.resize(score_map, (224, 224))
    hm = normalize_heatmap(hm)
    hm_color = cv2.applyColorMap(np.uint8(255 * hm), cv2.COLORMAP_JET)

    overlay = cv2.addWeighted(img_np, 0.6, hm_color, 0.4, 0)
    return overlay

# ------------------------------ Heatmap Encoding ------------------------------
def encode_heatmap_png(image_path, score_map):
    overlay = create_heatmap_overlay(image_path, score_map)
    _, png = cv2.imencode(".png", overlay)
    return png.tobytes()

# ------------------------------ Load Object Profile ------------------------------
def load_profile(profile_dir):
    memory = np.load(f"{profile_dir}/memory.npy")
    index = faiss.read_index(f"{profile_dir}/faiss.index")

    with open(f"{profile_dir}/threshold.json") as f:
        threshold = json.load(f)["threshold"]

    with open(f"{profile_dir}/config.json") as f:
        config = json.load(f)

    return index, threshold, config
