# Desplegar AgroAlerta AI (URL pública)

El proyecto (React + FastAPI + ConvNeXt/PyTorch) necesita **~1–2 GB RAM** al cargar el modelo.
Por eso el hosting gratis de 512 MB (Render free clásico) suele fallar. La opción más
realista y gratuita (con créditos de prueba) es **Railway**.

URL típica: `https://agroalerta-ai-production.up.railway.app`

## Opción recomendada: Railway (gratis con créditos)

### 1. Cuenta
1. Entra a https://railway.app y regístrate con GitHub (`emersonrodriguez1455-lang`).
2. Acepta el trial / créditos free (suelen dar ~$5).

### 2. Nuevo proyecto desde GitHub
1. **New Project** → **Deploy from GitHub repo**
2. Elige `buildAndPitch`
3. Railway detectará el `Dockerfile` automáticamente
4. Variables de entorno (Settings → Variables):

```
APP_ENV=production
DEBUG=false
AUTO_LOAD_MODEL=true
CORS_ORIGINS=*
PORT=8000
```

5. Genera dominio público: **Settings → Networking → Generate Domain**

### 3. Primera carga
- El build tarda **10–20 min** (torch + modelo HF).
- La primera petición de diagnóstico puede tardar mientras descarga pesos.
- Health: `https://TU-DOMINIO.up.railway.app/api/health`

## Opción B: Render (Blueprint)

1. https://render.com → New → Blueprint
2. Conecta el repo y usa `render.yaml`
3. Si el plan free se queda sin memoria al cargar ConvNeXt, sube a **Starter** o usa Railway.

## Opción C: solo frontend (Vercel/Netlify)

Si ya tienes API en otro lado:

```bash
cd frontend
VITE_API_URL=https://TU-API.up.railway.app npm run build
```

Despliega la carpeta `frontend/dist`.

## Local con Docker (prueba antes de subir)

```powershell
docker build -t agroalerta .
docker run --rm -p 8000:8000 agroalerta
```

Abre http://127.0.0.1:8000

## Notas
- SQLite y uploads son **efímeros** en free tiers (se pierden al redeploy).
- El Space duerme tras inactividad; el primer wake puede tardar 1–2 min.
- No subas `.env` con secretos; usa variables del panel del hosting.
