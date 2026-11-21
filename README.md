# AgroAlerta AI

**Inteligencia que protege tus cultivos.**

Plataforma web para pequeños y medianos productores de café en Guatemala. Permite registrar fincas y parcelas, analizar fotografías de hojas con un clasificador ConvNeXt experimental y dar seguimiento a inspecciones fitosanitarias.

> MVP de un solo entorno de usuario. No incluye autenticación multiusuario ni está preparado para producción.

## Arquitectura

- **Frontend:** React + Vite + TypeScript + Tailwind CSS
- **Backend:** FastAPI + SQLAlchemy + SQLite
- **IA:** PyTorch + timm + modelo [`ixrbhii/coffee-disease-convnext`](https://huggingface.co/ixrbhii/coffee-disease-convnext)

```
buildAndPitch/
├── frontend/          # SPA React
├── backend/           # API FastAPI + motor IA
├── research/          # Documentación científica
├── README.md
└── LICENSE
```

## Requisitos

- Windows 11 (PowerShell)
- Python 3.11+
- Node.js 18+ (LTS recomendado)
- Conexión a internet en la **primera** descarga del modelo

## Instalación del backend

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
```

Si PowerShell bloquea la activación del venv:

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

## Instalación del frontend

```powershell
cd frontend
npm install
Copy-Item .env.example .env
```

Si `npm install` falla por certificados SSL o acceso al registry oficial, use:

```powershell
$env:NODE_TLS_REJECT_UNAUTHORIZED="0"
npm install --registry https://registry.npmmirror.com --strict-ssl=false
npm install-scripts approve esbuild
```

## Ejecución

### Backend (puerto 8000)

```powershell
cd backend
.\venv\Scripts\Activate.ps1
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend (puerto 5173)

```powershell
cd frontend
npm run dev
```

## URLs locales

| Recurso | URL |
| --- | --- |
| Frontend | http://localhost:5173 |
| Backend | http://127.0.0.1:8000 |
| Swagger | http://127.0.0.1:8000/docs |
| Health | http://127.0.0.1:8000/api/health |

## Modelo de inteligencia artificial

- Repositorio: `hf-hub:ixrbhii/coffee-disease-convnext`
- Arquitectura: ConvNeXt-Small
- Clases reales (config del modelo): Berry Blotch, Cercospora Brown Eye Spot, Healthy, Leaf Miner, Phoma, Red Spider Mite, Rust
- Licencia del artefacto (model card): CC-BY-4.0 — crédito a *Multi-crop disease models, IXR (agritechixr)*

La primera carga puede tardar varios minutos y necesita internet. Después usa la caché local de Hugging Face/timm.

Si el modelo no está listo:

- El backend **sí arranca**
- `/api/health` indica que la IA no está disponible
- El frontend muestra un aviso
- **No** se generan diagnósticos ficticios

## Flujo de demostración (hackathon)

1. Abrir el dashboard
2. Registrar una finca en **Fincas y parcelas**
3. Registrar una parcela
4. Ir a **Nuevo diagnóstico**
5. Cargar una foto real de hoja de café
6. Esperar la clasificación ConvNeXt
7. Revisar alternativas, confianza y orientación general
8. Ver el registro en **Historial** y **Estadísticas**

## Pruebas

### Backend

```powershell
cd backend
.\venv\Scripts\Activate.ps1
pytest -q
```

### Frontend (compilación)

```powershell
cd frontend
npm run build
```

## Variables de entorno

### Backend (`backend/.env`)

- `DATABASE_URL`
- `UPLOAD_DIR`
- `MAX_IMAGE_SIZE_MB`
- `CORS_ORIGINS`
- `MODEL_REPO`
- `AUTO_LOAD_MODEL`

### Frontend (`frontend/.env`)

- `VITE_API_URL=http://127.0.0.1:8000`

## Errores frecuentes

| Problema | Solución |
| --- | --- |
| `Activate.ps1` bloqueado | `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` |
| CORS en el navegador | Verificar `CORS_ORIGINS` e iniciar frontend en `:5173` |
| IA no disponible | Esperar descarga del modelo; revisar logs de uvicorn |
| Torch lento en CPU | Normal en laptops; la primera inferencia puede tardar |
| Imagen rechazada | Usar JPG/PNG/WEBP válidos y menores a 10 MB |

## Aviso importante

Los resultados son **estimaciones experimentales** del modelo. No constituyen un diagnóstico agronómico definitivo. Se recomienda verificación con un técnico agrícola. AgroAlerta AI no prescribe pesticidas ni dosis.

## Investigación

Ver [`research/README.md`](research/README.md) para fundamento científico, limitaciones y referencia DOI `10.3390/s24248018`.
