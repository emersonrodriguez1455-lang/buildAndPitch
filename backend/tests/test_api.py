from __future__ import annotations

from fastapi.testclient import TestClient


def test_health(client: TestClient):
    response = client.get("/api/health")
    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "ok"
    assert "model" in payload
    assert payload["model"]["available"] is False


def test_create_farm_and_plot(client: TestClient):
    farm_resp = client.post(
        "/api/farms",
        json={
            "name": "Finca El Roble",
            "department": "Huehuetenango",
            "municipality": "Jacaltenango",
            "location": "Aldea La Libertad",
            "area_hectares": 3.5,
            "description": "Finca de demostración",
        },
    )
    assert farm_resp.status_code == 201
    farm_id = farm_resp.json()["id"]

    plot_resp = client.post(
        "/api/plots",
        json={
            "farm_id": farm_id,
            "name": "Parcela Norte",
            "coffee_variety": "Bourbon",
            "area_hectares": 1.2,
            "altitude": 1450,
            "observations": None,
        },
    )
    assert plot_resp.status_code == 201
    assert plot_resp.json()["farm_id"] == farm_id


def test_reject_invalid_image(client: TestClient, sample_image_bytes: bytes):
    farm = client.post(
        "/api/farms",
        json={
            "name": "Finca Test",
            "department": "Quetzaltenango",
            "municipality": "Coatepeque",
            "location": "Sector 1",
            "area_hectares": 1,
            "description": None,
        },
    ).json()
    plot = client.post(
        "/api/plots",
        json={
            "farm_id": farm["id"],
            "name": "Lote A",
            "coffee_variety": None,
            "area_hectares": 0.5,
            "altitude": None,
            "observations": None,
        },
    ).json()

    response = client.post(
        "/api/diagnosis",
        data={"farm_id": str(farm["id"]), "plot_id": str(plot["id"])},
        files={"image": ("bad.txt", b"not-an-image", "text/plain")},
    )
    assert response.status_code in {400, 503}
    assert sample_image_bytes  # fixture usable


def test_diagnosis_when_model_unavailable(client: TestClient, sample_image_bytes: bytes, monkeypatch):
    from app.services.model_service import model_service

    async def _unavailable() -> bool:
        model_service._loaded = False
        model_service._error = "Modelo deshabilitado en pruebas unitarias"
        return False

    monkeypatch.setattr(model_service, "ensure_loaded", _unavailable)
    model_service._loaded = False
    model_service._loading = False

    farm = client.post(
        "/api/farms",
        json={
            "name": "Finca Modelo",
            "department": "San Marcos",
            "municipality": "Tajumulco",
            "location": "Caserío X",
            "area_hectares": 2,
            "description": None,
        },
    ).json()
    plot = client.post(
        "/api/plots",
        json={
            "farm_id": farm["id"],
            "name": "Sector B",
            "coffee_variety": "Caturra",
            "area_hectares": 0.8,
            "altitude": 1600,
            "observations": None,
        },
    ).json()

    response = client.post(
        "/api/diagnosis",
        data={"farm_id": str(farm["id"]), "plot_id": str(plot["id"]), "observations": "prueba"},
        files={"image": ("leaf.jpg", sample_image_bytes, "image/jpeg")},
    )
    assert response.status_code == 503
    assert "modelo" in response.json()["detail"].lower()


def test_statistics_empty(client: TestClient):
    summary = client.get("/api/statistics/summary")
    assert summary.status_code == 200
    data = summary.json()
    assert data["total_diagnoses"] == 0
    assert data["healthy_percentage"] == 0

    diseases = client.get("/api/statistics/diseases")
    assert diseases.status_code == 200
    assert diseases.json() == []


def test_history_empty(client: TestClient):
    response = client.get("/api/diagnosis")
    assert response.status_code == 200
    payload = response.json()
    assert payload["total"] == 0
    assert payload["items"] == []


def test_model_metrics_disclaimer(client: TestClient):
    response = client.get("/api/model/metrics")
    assert response.status_code == 200
    payload = response.json()
    assert payload["verification_status"] == "reported_by_authors_not_independently_verified"
    assert payload["local_evaluation"]["status"] == "pending"
