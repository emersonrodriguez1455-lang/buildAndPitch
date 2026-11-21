export const CLASS_LABELS: Record<string, string> = {
  "Berry Blotch": "Manchas de baya",
  "Cercospora Brown Eye Spot": "Mancha de ojo pardo (Cercospora)",
  Healthy: "Hoja aparentemente sana",
  "Leaf Miner": "Minador de la hoja",
  Phoma: "Phoma",
  "Red Spider Mite": "Ácaro rojo",
  Rust: "Roya del café",
};

export const CLASS_OPTIONS = Object.entries(CLASS_LABELS).map(([value, label]) => ({
  value,
  label,
}));
