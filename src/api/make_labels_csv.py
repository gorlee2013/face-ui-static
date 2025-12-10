import os
import csv
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parents[2]

PUBLIC_DIR = BASE_DIR / "public"
REAL_DIR = PUBLIC_DIR / "real_images"
FAKE_DIR = PUBLIC_DIR / "fake_images"
OUTPUT_CSV = PUBLIC_DIR / "labels.csv"

IMAGE_EXTS = (".jpg", ".jpeg", ".png", ".webp")

# HELPERS

def collect_images(base_dir, label):
    rows = []
    abs_base = os.path.join(PUBLIC_DIR, base_dir)

    for root, _, files in os.walk(abs_base):
        for f in files:
            if f.lower().endswith(IMAGE_EXTS):
                abs_path = os.path.join(root, f)

                # Path relative to public/
                rel_path = os.path.relpath(abs_path, PUBLIC_DIR)

                rows.append({
                    "id": rel_path.replace("\\", "/"),  # Windows-safe
                    "label": label
                })

    return rows

# MAIN
def main():
    real_rows = collect_images(REAL_DIR, 0)
    fake_rows = collect_images(FAKE_DIR, 1)

    all_rows = real_rows + fake_rows

    if not all_rows:
        raise RuntimeError("No images found. Check folder paths.")

    output_path = os.path.join(PUBLIC_DIR, OUTPUT_CSV)

    with open(output_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["id", "label"])
        writer.writeheader()
        writer.writerows(all_rows)

    print(f"labels.csv written to {output_path}")
    print(f"Real images: {len(real_rows)}")
    print(f"Fake images: {len(fake_rows)}")
    print(f"Total images: {len(all_rows)}")

if __name__ == "__main__":
    main()
