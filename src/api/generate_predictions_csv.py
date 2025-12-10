import os
import csv
import random
import torch
import timm
import numpy as np
from PIL import Image
from torchvision import transforms
from tqdm import tqdm

# CONFIG
PROJECT_ROOT = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "../../")
)

PUBLIC_DIR = os.path.join(PROJECT_ROOT, "public")
REAL_DIR   = os.path.join(PUBLIC_DIR, "real_images")
FAKE_DIR   = os.path.join(PUBLIC_DIR, "fake_images")

MODEL_PATH = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "../../backend/model_checkpoint.pth")
)
OUTPUT_CSV = os.path.join(PUBLIC_DIR, "labels.csv")

IMG_SIZE = 224
MAX_PER_CLASS = None   # set to e.g. 5000 to cap size

# DEVICE
device = "mps" if torch.backends.mps.is_available() else "cpu"
print("Using device:", device)

# LOAD MODEL
model = timm.create_model(
    "vit_tiny_patch16_224",
    pretrained=False,
    num_classes=2
)
model.load_state_dict(torch.load(MODEL_PATH, map_location=device))
model.to(device)
model.eval()

# TRANSFORM
transform = transforms.Compose([
    transforms.Resize((IMG_SIZE, IMG_SIZE)),
    transforms.ToTensor(),
    transforms.Normalize((0.5,) * 3, (0.5,) * 3),
])

# IMAGE COLLECTOR
def collect_images(folder):
    paths = []
    for root, _, files in os.walk(folder):
        for f in files:
            if f.lower().endswith((".jpg", ".jpeg", ".png")):
                paths.append(os.path.join(root, f))
    return paths

# LOAD + PREDICT
def process_images(paths, true_label):
    rows = []

    if MAX_PER_CLASS and len(paths) > MAX_PER_CLASS:
        paths = random.sample(paths, MAX_PER_CLASS)

    for path in tqdm(paths):
        try:
            img = Image.open(path).convert("RGB")
            x = transform(img).unsqueeze(0).to(device)

            with torch.no_grad():
                probs = torch.softmax(model(x), dim=1)[0].cpu().numpy()

            prob_real = float(probs[0])
            prob_fake = float(probs[1])

            pred = 0 if prob_real >= prob_fake else 1
            confidence = max(prob_real, prob_fake)

            # path relative to public/
            rel_path = os.path.relpath(path, PUBLIC_DIR)

            rows.append({
                "id": rel_path.replace("\\", "/"),
                "label": true_label,
                "model_label": pred,
                "confidence": round(confidence, 4),
                "prob_real": round(prob_real, 4),
                "prob_fake": round(prob_fake, 4),
            })

        except Exception as e:
            print("Skipping:", path, e)

    return rows

# MAIN
def main():
    real_imgs = collect_images(REAL_DIR)
    fake_imgs = collect_images(FAKE_DIR)

    if not real_imgs or not fake_imgs:
        raise RuntimeError("No images found. Check folder paths.")

    print(f"Real images: {len(real_imgs)}")
    print(f"Fake images: {len(fake_imgs)}")

    rows = []
    rows += process_images(real_imgs, true_label=0)
    rows += process_images(fake_imgs, true_label=1)

    # Write CSV
    with open(OUTPUT_CSV, "w", newline="") as f:
        writer = csv.DictWriter(
            f,
            fieldnames=["id", "label", "model_label", "confidence", "prob_real", "prob_fake"]
        )
        writer.writeheader()
        writer.writerows(rows)

    print(f"\n labels.csv written to {OUTPUT_CSV}")
    print(f"Total images: {len(rows)}")

if __name__ == "__main__":
    main()
