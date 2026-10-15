/* =====================================================================
 *  data.js — all numbers shown on the page live here.
 *  Tables / interference numbers are copied from the paper (exact).
 *  Surface grids + V-curve live in surface-data.js (generated from .npy).
 * ===================================================================== */

/* ---------- Table 1: visual document retrieval (NDCG@10) ---------- */
window.DOC_TABLE = {
  datasets: ["ChartQA", "DocVQA", "InfoVQA", "SlideVQA", "ViDoSeek", "Dude", "Avg"],
  groups: [
    {
      name: "CLIP-based Models",
      rows: [
        { model: "SigLIP2-L/16-384", v: [43.98, 4.06, 32.91, 2.73, 54.86, 2.10, 56.04, 5.20, 48.52, 5.00, 8.84, 3.95, 40.86, 3.84] },
        { model: "+ GR-CLIP", sub: true, v: [40.09, 19.59, 31.74, 11.07, 54.95, 16.88, 56.80, 28.00, 53.62, 22.62, 11.60, 4.45, 41.47, 17.10] },
        { model: "CLIP-ViT-L/14", v: [22.48, 18.44, 32.14, 1.22, 68.11, 6.49, 74.38, 6.81, 65.15, 19.01, 26.13, 3.18, 48.07, 9.19] },
        { model: "+ GR-CLIP", sub: true, v: [19.77, 26.87, 31.31, 17.81, 67.07, 48.25, 74.39, 46.55, 68.10, 50.34, 26.76, 26.22, 47.90, 36.01] },
        { model: "AltCLIP", v: [23.30, 14.64, 33.84, 14.13, 69.18, 25.01, 76.24, 21.66, 67.99, 29.85, 26.61, 12.73, 49.53, 19.67] },
        { model: "+ GR-CLIP", sub: true, v: [20.20, 26.39, 32.94, 24.84, 68.72, 51.00, 75.77, 47.82, 69.48, 46.24, 25.86, 24.88, 48.83, 36.86] },
        { model: "Jina-CLIP-v2", v: [37.00, 45.53, 46.23, 31.32, 64.10, 45.84, 71.93, 52.08, 64.32, 53.01, 24.94, 28.32, 51.42, 42.68], base: true },
        { model: "+ GR-CLIP", sub: true, v: [34.94, 45.75, 45.56, 34.39, 62.96, 54.03, 73.11, 60.64, 64.92, 59.77, 25.92, 32.17, 51.24, 47.79] },
        { model: "Trident-JinaCLIP (Ours)", ours: true, v: [31.40, 50.25, 54.10, 46.47, 68.73, 67.57, 75.84, 67.06, 61.78, 61.67, 26.36, 40.06, 53.04, 55.51] },
        { model: "w/o Multi-Positive View InfoNCE", ablation: true, v: [31.08, 51.06, 52.70, 45.21, 68.29, 66.21, 75.38, 67.22, 61.51, 61.55, 27.73, 39.42, 52.78, 55.11] }
      ]
    },
    {
      name: "VLM-based Models",
      rows: [
        { model: "UniME-Phi3.5-V-4.2B", v: [48.54, 55.84, 64.77, 39.68, 76.77, 58.50, 85.73, 72.46, 83.97, 74.93, 44.02, 42.71, 67.30, 57.35] },
        { model: "VisRAG-Ret", v: [55.57, 26.91, 79.27, 45.49, 88.88, 55.32, 92.46, 57.58, 80.32, 55.63, 57.80, 37.28, 75.72, 46.37] },
        { model: "Jina-embeddings-v5-omni-small", v: [64.70, 56.50, 77.80, 50.53, 87.12, 64.91, 93.26, 77.01, 81.31, 72.61, 60.17, 49.90, 77.39, 61.91] },
        { model: "Qwen3-VL-Embedding-2B", v: [67.60, 50.72, 81.66, 18.83, 90.07, 36.77, 93.94, 45.75, 85.35, 59.13, 46.92, 29.50, 77.59, 40.12], base: true },
        { model: "Qwen3-VL-Embedding-8B", v: [76.35, 45.13, 86.64, 27.56, 93.62, 44.56, 96.09, 55.30, 86.26, 73.57, 61.85, 36.87, 83.47, 47.17] },
        { model: "Trident-Qwen3VL-2B (Ours)", ours: true, v: [70.19, 65.82, 82.76, 67.68, 91.28, 80.09, 93.72, 88.54, 83.74, 81.98, 61.36, 59.31, 80.51, 73.90] },
        { model: "w/o Multi-Positive View InfoNCE", ablation: true, v: [67.41, 63.12, 80.57, 54.44, 89.47, 72.26, 93.06, 83.97, 78.43, 74.76, 55.20, 49.58, 77.36, 66.36] }
      ]
    }
  ]
};

/* ---------- Table 4: natural-image retrieval (NDCG@10) ---------- */
window.NAT_TABLE = {
  datasets: ["Google-WIT", "MSCOCO", "VisualNews", "OVEN", "Avg"],
  groups: [
    {
      name: "CLIP-based Models",
      rows: [
        { model: "SigLIP2-L/16-384", v: [22.51, 6.29, 81.83, 40.94, 50.21, 17.58, 57.95, 22.42, 53.13, 21.81] },
        { model: "+ GR-CLIP", sub: true, v: [22.49, 19.35, 81.60, 62.02, 52.38, 43.04, 60.49, 44.66, 54.24, 42.27] },
        { model: "CLIP-ViT-L/14", v: [61.59, 51.94, 71.14, 37.06, 90.40, 49.68, 54.16, 13.23, 69.32, 37.98] },
        { model: "+ GR-CLIP", sub: true, v: [60.66, 66.65, 72.00, 60.89, 90.27, 75.94, 56.41, 39.01, 69.84, 60.62] },
        { model: "AltCLIP", v: [60.30, 49.17, 76.26, 52.28, 88.66, 57.03, 54.47, 18.44, 69.92, 44.23] },
        { model: "+ GR-CLIP", sub: true, v: [59.63, 68.08, 74.95, 62.96, 89.30, 75.69, 55.68, 36.61, 69.89, 60.84] },
        { model: "Jina-CLIP-v2", v: [48.83, 75.59, 73.81, 60.31, 64.82, 63.91, 40.37, 25.90, 56.96, 56.43], base: true },
        { model: "+ GR-CLIP", sub: true, v: [50.78, 82.28, 73.11, 71.56, 67.48, 76.10, 40.71, 26.31, 58.02, 64.06] },
        { model: "Trident-JinaCLIP (Ours)", ours: true, v: [44.60, 74.11, 76.20, 77.12, 74.29, 85.08, 50.51, 45.70, 61.40, 70.50] },
        { model: "w/o Multi-Positive InfoNCE", ablation: true, v: [40.56, 69.79, 74.56, 74.41, 71.75, 80.52, 51.37, 46.19, 59.56, 67.73] }
      ]
    },
    {
      name: "VLM-based Models",
      rows: [
        { model: "UniME-Phi3.5-V-4.2B", v: [41.11, 74.45, 81.70, 81.88, 72.96, 78.16, 39.76, 26.63, 58.88, 65.28] },
        { model: "VisRAG-Ret", v: [39.72, 42.14, 76.89, 43.88, 59.22, 31.92, 46.84, 17.68, 55.67, 33.91] },
        { model: "Jina-embeddings-v5-omni-small", v: [42.46, 79.72, 80.79, 74.10, 63.09, 73.67, 44.68, 25.16, 57.76, 63.16] },
        { model: "Qwen3-VL-Embedding-2B", v: [45.92, 70.66, 85.60, 86.11, 75.85, 82.06, 59.03, 55.85, 66.60, 73.67], base: true },
        { model: "Qwen3-VL-Embedding-8B", v: [56.28, 68.76, 87.18, 89.54, 79.20, 84.25, 59.41, 55.15, 70.52, 74.43] },
        { model: "Trident-Qwen3VL-2B (Ours)", ours: true, v: [56.10, 83.67, 84.89, 86.86, 80.57, 88.10, 57.67, 48.49, 69.81, 76.78] },
        { model: "w/o Multi-Positive InfoNCE", ablation: true, v: [56.10, 77.06, 81.82, 81.17, 77.54, 86.81, 57.79, 51.03, 68.31, 74.02] }
      ]
    }
  ]
};

/* ---------- Fig. 4 / 11 / 12: modality preference on SlideVQA ----------
 * pos  = mean positive-pair cosine similarity  [text, image, fused]
 * intf = interference rate (%) — fraction of queries where a text hard
 *        negative outscores the positive         [text, image, fused]   */
window.PREFERENCE = [
  { model: "CLIP-ViT-L/14",        family: "CLIP", pos: [0.625, 0.268, 0.548], intf: [68.2, 100.0, 96.0] },
  { model: "CLIP-ViT-L/14 + GR",   family: "CLIP", pos: [0.419, 0.321, 0.436], intf: [44.2, 81.0, 38.0] },
  { model: "SigLIP2-L",            family: "CLIP", pos: [0.777, 0.141, 0.611], intf: [87.6, 100.0, 100.0] },
  { model: "SigLIP2-L + GR",       family: "CLIP", pos: [0.192, 0.257, 0.287], intf: [82.0, 70.6, 60.4] },
  { model: "AltCLIP",              family: "CLIP", pos: [0.732, 0.292, 0.621], intf: [47.0, 100.0, 94.6] },
  { model: "AltCLIP + GR",         family: "CLIP", pos: [0.495, 0.363, 0.492], intf: [39.6, 82.6, 41.8] },
  { model: "Jina-CLIP-v2",         family: "CLIP", pos: [0.531, 0.308, 0.494], intf: [25.8, 94.6, 35.8] },
  { model: "UniME-Phi3.5",         family: "VLM",  pos: [0.593, 0.519, 0.591], intf: [18.8, 52.6, 19.6] },
  { model: "Jina-V5-small",        family: "VLM",  pos: [0.603, 0.461, 0.579], intf: [12.8, 53.2, 16.4] },
  { model: "Qwen3-VL-E-2B",        family: "VLM",  pos: [0.664, 0.484, 0.510], intf: [17.8, 87.8, 79.2] },
  { model: "Qwen3-VL-E-8B",        family: "VLM",  pos: [0.631, 0.445, 0.513], intf: [15.8, 76.0, 53.0] },
  { model: "Trident-Qwen3VL-2B",   family: "Ours", pos: [0.674, 0.672, 0.670], intf: [10.4, 10.6, 11.8] }
];

/* ---------- Fig. 17: Matryoshka dimensions (Trident gain over Qwen3-VL-E-2B) */
window.MATRYOSHKA = {
  dims: [128, 256, 512, 1024, 2048],
  originGain: [7.4, 4.0, 2.2, 0.9, 0.2],
  mixGain: [26.1, 28.8, 29.8, 29.6, 30.5]
};

/* ---------- Fig. 1(a) V-curve + Fig. 2/6 composition surfaces ----------
 * These now come from real experiment grids: static/data/*.npy is converted
 * by tools/npy_to_js.py into static/js/surface-data.js (window.SURFACES,
 * window.V_CURVE). Do not define them here.                              */
