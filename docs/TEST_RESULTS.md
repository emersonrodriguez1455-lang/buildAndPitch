# Resultados de pruebas — AgroAlerta AI

Fecha de ejecución: 21 de noviembre de 2026

## Backend (`pytest`)

Comando:

```powershell
cd backend
.\venv\Scripts\Activate.ps1
pytest -q
```

Resultado real:

```
7 passed, 1 warning in 9.22s
```

Pruebas cubiertas:

- Health check
- Creación de finca y parcela
- Rechazo de imagen inválida
- Diagnóstico cuando el modelo no está disponible (503)
- Estadísticas vacías
- Historial vacío
- Disclaimer de métricas del modelo

## Frontend (`npm run build`)

Comando:

```powershell
cd frontend
npm run build
```

Resultado real:

```
tsc --noEmit && vite build
✓ 2924 modules transformed
✓ built in 5.52s
```

La verificación de TypeScript y el empaquetado de producción completaron sin errores.

## Modelo

Durante las pruebas de integración locales, el modelo `ixrbhii/coffee-disease-convnext` se descargó y cargó correctamente en CPU vía `timm`, confirmando 7 clases desde `pretrained_cfg.label_names`.
