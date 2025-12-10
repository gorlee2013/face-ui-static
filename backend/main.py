import io
import torch
import timm
import torch.nn.functional as F
from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
from torchvision import transforms

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model once at startup
device = "cpu"
model_name = "vit_tiny_patch16_224"

model = timm.create_model(model_name, pretrained=False, num_classes=2)
model.load_state_dict(torch.load("model_mixed_finetuned.pth", map_location=device))
model.to(device)
model.eval()

# Image preprocessing (same as validation)
tf_val = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize((0.5,)*3, (0.5,)*3)
])

# Prediction endpoint
@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    # Load image
    contents = await file.read()
    img = Image.open(io.BytesIO(contents)).convert("RGB")
    x = tf_val(img).unsqueeze(0).to(device)

    # Softmax → probability of FAKE class (class 1)
    with torch.no_grad():
        logits = model(x)
        probs = F.softmax(logits, dim=1)[0]

    prob_real = float(probs[0])
    prob_fake = float(probs[1])

    pred = int(prob_fake > 0.5)

    return {
        "prediction": pred,               # 0=real, 1=fake
        "prob_real": prob_real,
        "prob_fake": prob_fake,
        "label": "fake" if pred == 1 else "real",
        "confidence": max(prob_real, prob_fake)
    }
