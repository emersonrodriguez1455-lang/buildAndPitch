# AgroAlerta AI

**Inteligencia que protege tus cultivos.**

## Qué es

AgroAlerta AI es un MVP para pequeños y medianos productores de café en Guatemala. Permite registrar fincas y parcelas, clasificar de forma experimental fotografías de hojas de café con un modelo de inteligencia artificial ConvNeXt-Small ([`ixrbhii/coffee-disease-convnext`](https://huggingface.co/ixrbhii/coffee-disease-convnext)) y dar seguimiento a inspecciones fitosanitarias.

Es un entorno de un solo usuario: no incluye autenticación multiusuario ni está preparado para producción.

## Contexto

AgroAlerta AI nació en el Hackathon Build and Pitch 2026, celebrado en la Universidad del Valle de Guatemala, campus zona 15. En 12 horas, y dentro del track «Deep Tech: del paper al producto», el equipo partió de un avance científico: un modelo publicado de clasificación de enfermedades en hojas de café (ConvNeXt-Small). El fundamento de investigación se documenta en [`research/README.md`](research/README.md) y en el artículo de referencia [DOI 10.3390/s24248018](https://doi.org/10.3390/s24248018). A partir de ese avance construyeron una herramienta usable para el campo.

La demostración sigue este flujo: se sube una fotografía de una hoja, el sistema ofrece una clasificación preliminar, se guarda la inspección y se organiza por finca y parcela. El proyecto se presentó en un pitch de 3 minutos.

## Impacto

Enfermedades como la roya del café han afectado la economía cafetalera. Un café más sano mejora la economía de los agricultores, de las fincas y, por ende, del país. AgroAlerta busca que esa detección temprana, aunque experimental, ayude a documentar síntomas, priorizar inspecciones y hacer seguimiento en el tiempo. No sustituye la evaluación de un técnico agrícola.

## Mi rol

Emerson Rodríguez propuso llevar un modelo de inteligencia artificial especializado en enfermedades del café —del paper a una herramienta— para que sirviera a la industria cafetalera y tuviera un impacto en Guatemala: un café más sano mejora la economía de los agricultores, de las fincas y del país, y estas enfermedades han supuesto un dolor para esa economía. Pulió la idea con el equipo, la orientó a que la aplicación resultara más intuitiva para las personas agricultoras y a poder ponerla en línea.

## Funcionalidades

- **Dashboard:** resumen de la actividad y acceso rápido al último plan de seguimiento.
- **Fincas y parcelas:** alta, edición, consulta y eliminación de fincas (nombre, departamento, municipio, ubicación, área y descripción) y de parcelas asociadas (variedad de café, área, altitud y observaciones). Una parcela solo puede pertenecer a una finca existente.
- **Nuevo diagnóstico:** carga de una fotografía de hoja (JPG, JPEG, PNG o WEBP, hasta 10 MB). El sistema valida el archivo, ejecuta la clasificación ConvNeXt y muestra la clase predicha, el nivel de confianza, alternativas y una orientación general de cuidado y monitoreo.
- **Seguimiento de inspecciones:** permite agregar una nueva foto a un diagnóstico previo, ver la línea de tiempo de esa cadena y una tendencia comparada con la inspección anterior.
- **Historial:** listado paginado y filtrable por finca, clase, texto y rango de fechas.
- **Estadísticas:** totales de fincas, parcelas e inspecciones, distribución por clase, actividad por finca y una línea de tiempo por día, semana o mes.
- **Estado del modelo:** el backend arranca aunque la IA aún no esté lista; `/api/health` indica si el modelo está cargado y la interfaz muestra un aviso. No se generan diagnósticos ficticios.

## Stack

| Capa | Tecnologías |
| --- | --- |
| Frontend | React 18, Vite, TypeScript, Tailwind CSS, React Router, Axios y Recharts |
| Backend | FastAPI, Pydantic, SQLAlchemy y SQLite |
| IA | PyTorch, torchvision, timm y ConvNeXt-Small (`ixrbhii/coffee-disease-convnext`) |

También incluye un `Dockerfile` que construye el frontend y lo sirve junto con la API, y un `railway.toml` para el despliegue.

## Arquitectura

El frontend es una aplicación React (en desarrollo, puerto 5173). El backend expone la API bajo `/api` (puerto 8000), persiste fincas, parcelas e inspecciones en SQLite y guarda las imágenes en un directorio de archivos subidos. El modelo se descarga de Hugging Face en la primera ejecución (si `AUTO_LOAD_MODEL=true`) y después usa la caché local.

En el contenedor de producción, FastAPI también sirve la interfaz compilada (`STATIC_DIR`).

```
buildAndPitch/
├── frontend/          # SPA React + TypeScript
├── backend/           # API FastAPI + motor de IA
├── research/          # Fundamento científico y limitaciones
├── docs/              # Notas de pruebas
├── Dockerfile
├── railway.toml
└── README.md
```

## Requisitos

- Python 3.11+
- Node.js 18+ (se recomienda una versión LTS)
- Conexión a internet en la **primera** descarga del modelo

Los comandos de PowerShell están pensados para Windows. En Linux o macOS use `source venv/bin/activate` y `cp` en lugar de `Copy-Item`.

## Instalación del backend

```powershell
cd backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
```

Si PowerShell bloquea la activación del entorno virtual:

```powershell
Set-ExecutionPolicy -Scope CurrentUser RemoteSigned
```

## Instalación del frontend

```powershell
cd frontend
npm install
Copy-Item .env.example .env
```

Si `npm install` falla por certificados SSL o por acceso al registro oficial:

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

- Repositorio: [`ixrbhii/coffee-disease-convnext`](https://huggingface.co/ixrbhii/coffee-disease-convnext)
- Arquitectura: ConvNeXt-Small
- Carga: `timm.create_model("hf-hub:ixrbhii/coffee-disease-convnext", pretrained=True)`
- Clases del modelo (`config.json`) y su etiqueta en la aplicación:

| Clase | Etiqueta |
| --- | --- |
| Berry Blotch | Manchas de baya |
| Cercospora Brown Eye Spot | Mancha de ojo pardo (Cercospora) |
| Healthy | Hoja aparentemente sana |
| Leaf Miner | Minador de la hoja |
| Phoma | Phoma |
| Red Spider Mite | Ácaro rojo |
| Rust | Roya del café |

- Licencia del artefacto (model card): CC-BY-4.0. Crédito a *Multi-crop disease models, IXR (agritechixr)*.

La primera carga puede tardar varios minutos y necesita internet. Después utiliza la caché local de Hugging Face y timm.

Si el modelo no está listo:

- El backend **sí arranca**
- `/api/health` indica que la IA no está disponible
- El frontend muestra un aviso
- **No** se generan diagnósticos ficticios

## Flujo de demostración

1. Abrir el dashboard.
2. Registrar una finca en **Fincas y parcelas**.
3. Registrar una parcela.
4. Ir a **Nuevo diagnóstico**.
5. Cargar una foto real de hoja de café.
6. Esperar la clasificación ConvNeXt.
7. Revisar alternativas, confianza y orientación general.
8. Ver el registro en **Historial** y **Estadísticas**, y, si aplica, agregar un seguimiento.

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

- `APP_NAME`
- `APP_ENV`
- `DEBUG`
- `DATABASE_URL`
- `UPLOAD_DIR`
- `MAX_IMAGE_SIZE_MB`
- `CORS_ORIGINS`
- `MODEL_REPO`
- `MODEL_NAME`
- `MODEL_VERSION`
- `AUTO_LOAD_MODEL`
- `HOST`
- `PORT`

### Frontend (`frontend/.env`)

- `VITE_API_URL=http://127.0.0.1:8000`

Los valores de ejemplo están en `backend/.env.example` y `frontend/.env.example`.

## Docker

Para probar la aplicación completa en un solo contenedor (frontend compilado + API):

```powershell
docker build -t agroalerta .
docker run --rm -p 8000:8000 agroalerta
```

Abra http://127.0.0.1:8000. Hay más detalle de despliegue en [`DEPLOY.md`](DEPLOY.md).

## Errores frecuentes

| Problema | Solución |
| --- | --- |
| `Activate.ps1` bloqueado | `Set-ExecutionPolicy -Scope CurrentUser RemoteSigned` |
| CORS en el navegador | Verificar `CORS_ORIGINS` e iniciar el frontend en el puerto 5173 |
| IA no disponible | Esperar la descarga del modelo; revisar los registros de uvicorn |
| Torch lento en CPU | Es normal en laptops; la primera inferencia puede tardar |
| Imagen rechazada | Usar JPG, PNG o WEBP válidos y menores a 10 MB |

## Limitaciones

- Los resultados son **estimaciones experimentales** del modelo. No constituyen un diagnóstico agronómico definitivo. Se recomienda verificarlos con un técnico agrícola.
- El modelo no cubre todas las enfermedades posibles del café.
- La calidad de la fotografía (enfoque, luz, hoja dominante) influye en la confianza.
- AgroAlerta AI no prescribe pesticidas, productos químicos ni dosis.
- Es un MVP de un solo entorno de usuario, sin autenticación multiusuario, y no está preparado para producción.
- Pendiente una evaluación con fotografías reales de fincas guatemaltecas.

## Investigación

En [`research/README.md`](research/README.md) está el fundamento científico, las limitaciones del modelo y la referencia DOI [10.3390/s24248018](https://doi.org/10.3390/s24248018). El MVP no implementa el algoritmo exacto de ese artículo; usa el clasificador ConvNeXt citado arriba.

## Licencia

Este repositorio se publica bajo la [licencia MIT](LICENSE). El modelo de inteligencia artificial tiene su propia licencia (CC-BY-4.0), indicada en su model card.
