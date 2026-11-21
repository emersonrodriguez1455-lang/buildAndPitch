"""Demo flow: farm -> plot -> real image diagnosis."""

from __future__ import annotations

import json
import urllib.request
from pathlib import Path

import httpx
from PIL import Image, ImageDraw

BASE = "http://127.0.0.1:8000"
DEMO_DIR = Path(__file__).resolve().parents[1] / "uploads" / "demo"
IMG_PATH = DEMO_DIR / "coffee-leaf-demo.jpg"

URLS = [
    "https://upload.wikimedia.org/wikipedia/commons/2/25/Hemileia_vastatrix_-_coffee_leaf_rust.jpg",
    "https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Hemileia_vastatrix_-_coffee_leaf_rust.jpg/800px-Hemileia_vastatrix_-_coffee_leaf_rust.jpg",
]


def download_image() -> str:
    DEMO_DIR.mkdir(parents=True, exist_ok=True)
    for url in URLS:
        try:
            req = urllib.request.Request(
                url,
                headers={"User-Agent": "AgroAlertaAI-Demo/1.0 (hackathon; local demo)"},
            )
            with urllib.request.urlopen(req, timeout=40) as resp:
                data = resp.read()
            if data.startswith(b"\xff\xd8") or data.startswith(b"\x89PNG\r\n\x1a\n"):
                IMG_PATH.write_bytes(data)
                print(f"DESCARGADA {url} ({len(data)} bytes)")
                return "wikimedia"
            print(f"Respuesta no valida desde {url}")
        except Exception as exc:  # noqa: BLE001
            print(f"Fallo {url}: {exc}")

    img = Image.new("RGB", (512, 512), (34, 90, 40))
    draw = ImageDraw.Draw(img)
    draw.ellipse((80, 60, 430, 460), fill=(46, 120, 55), outline=(20, 60, 30), width=4)
    for xy in [(180, 180), (250, 220), (300, 160), (220, 280), (290, 300)]:
        draw.ellipse((xy[0], xy[1], xy[0] + 40, xy[1] + 28), fill=(210, 120, 40))
    img.save(IMG_PATH, quality=90)
    print(f"FALLBACK sintetico -> {IMG_PATH}")
    return "synthetic"


def main() -> None:
    source = download_image()
    client = httpx.Client(base_url=BASE, timeout=180.0)

    farm = client.post(
        "/api/farms",
        json={
            "name": "Finca La Esperanza",
            "department": "Huehuetenango",
            "municipality": "Jacaltenango",
            "location": "Aldea San Antonio",
            "area_hectares": 4.5,
            "description": "Finca de demostracion para AgroAlerta AI",
        },
    )
    farm.raise_for_status()
    farm_data = farm.json()
    print("FARM", farm_data["id"], farm_data["name"])

    plot = client.post(
        "/api/plots",
        json={
            "farm_id": farm_data["id"],
            "name": "Parcela Norte",
            "coffee_variety": "Bourbon",
            "area_hectares": 1.2,
            "altitude": 1450,
            "observations": "Sector de demostracion hackathon",
        },
    )
    plot.raise_for_status()
    plot_data = plot.json()
    print("PLOT", plot_data["id"], plot_data["name"])

    with IMG_PATH.open("rb") as handle:
        response = client.post(
            "/api/diagnosis",
            data={
                "farm_id": str(farm_data["id"]),
                "plot_id": str(plot_data["id"]),
                "observations": f"Inspeccion demo hackathon ({source})",
            },
            files={"image": ("coffee-leaf-demo.jpg", handle, "image/jpeg")},
        )
    response.raise_for_status()
    diag = response.json()

    summary = {
        "id": diag["id"],
        "predicted_class": diag["predicted_class"],
        "predicted_class_label": diag["predicted_class_label"],
        "confidence": round(diag["confidence"], 4),
        "is_healthy": diag["is_healthy"],
        "alternatives": [
            {"label": item["label"], "confidence": round(item["confidence"], 4)}
            for item in diag.get("alternatives", [])
        ],
        "recommendation": diag["recommendation"],
        "detail_url": f"http://localhost:5173/diagnostico/{diag['id']}",
        "image_source": source,
    }
    print(json.dumps(summary, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
