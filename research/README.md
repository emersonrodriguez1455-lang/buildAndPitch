# Investigación — AgroAlerta AI

## Problema abordado

Las enfermedades foliares del café reducen rendimiento y calidad. Para pequeños y medianos productores en Guatemala, detectar a tiempo síntomas visuales en hojas puede apoyar decisiones de inspección y seguimiento, especialmente cuando el acceso a técnicos es limitado.

## Importancia de la detección temprana

- La roya y otras afecciones pueden propagarse rápidamente en parcelas densas.
- El monitoreo fotográfico periódico crea un historial comparable en el tiempo.
- Una herramienta digital no sustituye al técnico agrícola, pero puede priorizar visitas de campo.

## Fundamento de visión artificial

AgroAlerta AI utiliza **clasificación de imágenes**: una red convolucional recibe una fotografía completa de hoja y asigna puntuaciones a un conjunto fijo de clases. No es detección de objetos; **no** estima cajas delimitadoras ni la ubicación exacta de una lesión.

## Arquitectura ConvNeXt

ConvNeXt moderniza el diseño de redes convolucionales con ideas inspiradas en Transformers (bloques, normalización y diseño de etapas), manteniendo eficiencia en clasificación de imágenes. El modelo del MVP se basa en **ConvNeXt-Small**.

## Modelo seleccionado

- Repositorio Hugging Face: [`ixrbhii/coffee-disease-convnext`](https://huggingface.co/ixrbhii/coffee-disease-convnext)
- Nombre: Coffee Disease Classifier
- Carga vía `timm.create_model("hf-hub:ixrbhii/coffee-disease-convnext", pretrained=True)`
- Entrada: RGB 224×224 con preprocesamiento de `timm.data`
- Clases (`label_names` de `config.json`):
  1. Berry Blotch
  2. Cercospora Brown Eye Spot
  3. Healthy
  4. Leaf Miner
  5. Phoma
  6. Red Spider Mite
  7. Rust

### Licencia y atribución del modelo

Según la model card del repositorio:

- Licencia declarada: **CC-BY-4.0**
- Crédito solicitado: *"Multi-crop disease models, IXR (agritechixr)"* y los datasets de entrenamiento (LeafNet CC-BY-4.0 y fotografías de campo de los autores).
- Nota de los autores: un diagnóstico apoya, pero no reemplaza, a un experto agrícola local.

> En `config.json`, el bloque `pretrained_cfg.license` aparece como `apache-2.0` (típico del backbone). Para el artefacto publicado, AgroAlerta AI adopta la licencia y atribución indicadas en la **model card** (CC-BY-4.0).

### Métricas publicadas por los autores

La model card reporta, sobre 506 fotos de prueba del mismo origen de entrenamiento:

- Exactitud de prueba reportada: 94.7 %
- Macro-F1 reportado: 0.809
- Advertencia: Cercospora tiene pocas fotos y suele fallar; fotos de campo reales suelen puntuar más bajo.

**AgroAlerta AI no ha reproducido estas métricas de forma independiente.** El endpoint `/api/model/metrics` las expone como *reportadas por autores / no verificadas localmente*.

## Diferencia entre clasificación y detección

| Clasificación (este MVP) | Detección de objetos |
| --- | --- |
| Una etiqueta (o ranking) por imagen | Localiza regiones con cajas |
| No indica dónde está la lesión | Indica posición aproximada |
| Más simple de desplegar en CPU | Suele requerir más postproceso |

## Referencia científica (fundamento, no implementación idéntica)

Artículo de referencia:

**Coffee Leaf Rust Disease Detection and Implementation of an Edge Device for Pruning Infected Leaves via Deep Learning Algorithms**

- DOI: [10.3390/s24248018](https://doi.org/10.3390/s24248018)
- Enlace: https://www.mdpi.com/1424-8220/24/24/8018

Este trabajo documenta enfoques de deep learning para roya del café y despliegue en dispositivo edge. **Nuestro MVP no implementa el algoritmo exacto del artículo**; usa el clasificador ConvNeXt citado arriba. El artículo sirve como fundamento científico y contexto de investigación.

## Limitaciones

- Resultados experimentales; requieren validación técnica.
- El modelo no cubre todas las enfermedades posibles del café.
- Calidad de la foto (enfoque, luz, hoja dominante) afecta la confianza.
- No prescribe tratamientos químicos ni dosis.
- Pendiente evaluación con fotografías reales de fincas guatemaltecas.

## Validación pendiente en Guatemala

Para uso serio en campo se recomienda:

1. Recolectar un conjunto etiquetado local (con técnico agrícola).
2. Medir precisión, recall y F1 por clase en ese conjunto.
3. Calibrar umbrales de confianza (p. ej. pedir mejor foto bajo ~45 %).
4. Documentar sesgos por variedad, altitud e iluminación.
