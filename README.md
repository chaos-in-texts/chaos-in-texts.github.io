
# 🔱 Chaos in the Text

### Revealing the Modality Preference in Mixed-Modality Retrievers

**Project page** · [Paper](https://arxiv.org/abs/2610.11816) · [Code](https://github.com/OpenBMB/Trident) · [🤗 Trident-Qwen3VL-2B](https://huggingface.co/openbmb/Trident-Qwen3VL-2B) · [🤗 Trident-Train](https://huggingface.co/datasets/openbmb/Trident-Train) · [🤗 Trident-Eval](https://huggingface.co/datasets/openbmb/Trident-Eval)

<img src="static/images/fig1_teaser.png" width="90%" alt="V-shaped curve and the Chaos in the Text example">

This repository holds the source of the **project page** for *Chaos in the Text*. It is a static site (plain HTML, CSS and JS with no build step) served by GitHub Pages.

> **TL;DR.** Multimodal retrievers do well on pure-image or pure-text corpora, but when text and images share one corpus, NDCG@10 follows a **V-shaped curve**. The reason is that models **systematically over-score text**, so an irrelevant passage outranks the relevant chart or slide. We call this *Chaos in the Text* and remove it with **Trident**, a Multi-Positive View InfoNCE objective. Trident lifts the Mix-corpus average from **40.1 to 73.9** on Qwen3-VL-Embedding-2B.

---

## Page contents

| Section | What it shows | Interactive |
|---|---|---|
| TL;DR | Three findings, one fix | count-up stats |
| Phenomenon | V-curve when moving a corpus from all-image to all-text; text vs image distractors | ✅ corpus slider (real data, Fig. 1a) |
| Why | Modality preference: positive similarity and interference rate | ✅ bar chart toggle |
| Method | Trident: three co-equal positive views in one shared softmax | ✅ loss playground (live gradients) |
| Results | Six visual-document benchmarks + four natural-image benchmarks | ✅ sortable table, Origin→Mix dumbbell, **3D composition surface** |
| Analysis | Similarity distributions, ablations | — |

## Repository layout

```
.
├── index.html                  # the whole page
├── .nojekyll                   # tells GitHub Pages to serve files as-is
├── README.md
├── tools/
│   └── npy_to_js.py            # converts static/data/*.npy → static/js/surface-data.js
└── static/
    ├── css/style.css
    ├── js/
    │   ├── main.js             # page behaviour + all interactive widgets
    │   ├── data.js             # tables / preference numbers (copied from the paper)
    │   └── surface-data.js     # AUTO-GENERATED 3D surfaces + V-curve (do not edit)
    ├── data/                   # raw composition grids, <dataset>_<model>_Z.npy (25×25)
    └── images/                 # paper figures + og-image.png (social preview)
```

## Deploying to GitHub Pages

1. Push this folder to the root of a GitHub repository. The root must contain `index.html`, not a sub-folder.
2. In the repo, go to **Settings → Pages → Build and deployment**. Set Source to *Deploy from a branch* and Branch to `main`, folder `/ (root)`, then **Save**.
3. After about 1 minute the site is live at `https://<user>.github.io/<repo>/`, or at `https://<user>.github.io/` if the repo is named `<user>.github.io`.

Every asset path is relative, so the page works from either URL.

## Citation

```bibtex
@article{sun2026chaos,
  title={Chaos in the Text: Revealing the Modality Preference in Mixed-Modality Retrievers},
  author={Sun, Yubo and Peng, Chunyi and Yan, Yukun and Liu, Zhenghao and Xu, Zhipeng and Mei, Sen and Xin, Linlin and Zeng, Zheni and Sun, Maosong},
  journal={arXiv preprint arXiv:2610.11816},
  year={2026}
}
```

## Acknowledgements

The page design is inspired by [Limit of RLVR](https://limit-of-rlvr.github.io/) and [Nerfies](https://nerfies.github.io/). Website content is licensed under [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).
