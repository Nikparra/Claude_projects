/* Camera Size Comparison — product database.
   PHYSICAL SPECS (specs.*) are manufacturer-published values with source URLs.
   VISUAL CALIBRATION (calibration.*) is image-specific: px-per-mm, anchors in
   image pixels, orientation, verification status. Keep them separate. */
window.CSC_PRODUCTS = {
  "schemaVersion": 1,
  "mounts": {
    "fuji-x": {
      "label": "Fujifilm X mount"
    },
    "m43": {
      "label": "Micro Four Thirds"
    }
  },
  "cameras": [
    {
      "id": "fuji-xe5",
      "code": "xe5",
      "brand": "Fujifilm",
      "name": "Fujifilm X-E5",
      "shortName": "X-E5",
      "aliases": [
        "xe5",
        "x e5",
        "xe 5",
        "x-e5"
      ],
      "mount": "fuji-x",
      "specs": {
        "widthMm": 124.9,
        "heightMm": 72.9,
        "depthMm": 39.1,
        "weightG": 445,
        "weightNote": "incl. battery & SD card",
        "source": "https://fujifilm-dsc.com/en/manual/x-e5/technical_notes/spec/",
        "sourceType": "manufacturer",
        "bodyOnlyWeightG": 396,
        "minDepthMm": 33.0
      },
      "calibration": {
        "image": "images/fuji-xe5-top.png",
        "view": "top",
        "imgW": 1915,
        "imgH": 604,
        "pxPerMm": 15.3323,
        "flangeY": 2,
        "lcdPlaneY": 601,
        "mountX": 723,
        "status": "verified",
        "credit": {
          "source": "Fujifilm product image via Best Buy",
          "page": "https://www.bestbuy.com/product/fujifilm-x-e5-mirrorless-camera-body-black/J7929VCRRP/sku/6635539",
          "note": ""
        }
      }
    },
    {
      "id": "fuji-xt5",
      "code": "xt5",
      "brand": "Fujifilm",
      "name": "Fujifilm X-T5",
      "shortName": "X-T5",
      "aliases": [
        "xt5",
        "x t5",
        "xt 5",
        "x-t5"
      ],
      "mount": "fuji-x",
      "specs": {
        "widthMm": 129.5,
        "heightMm": 91.0,
        "depthMm": 63.8,
        "weightG": 557,
        "weightNote": "incl. battery & SD card",
        "source": "https://fujifilm-dsc.com/en/manual/x-t5/technical_notes/spec/",
        "sourceType": "manufacturer",
        "bodyOnlyWeightG": 476,
        "minDepthMm": 37.9
      },
      "calibration": {
        "image": "images/fuji-xt5-top.png",
        "view": "top",
        "imgW": 633,
        "imgH": 291,
        "pxPerMm": 4.888,
        "flangeY": 45,
        "lcdPlaneY": 244,
        "mountX": 262,
        "status": "estimate",
        "credit": {
          "source": "Fujifilm press image via Imaging Resource",
          "page": "https://www.imaging-resource.com/news/2022/11/02/fujifilm-announces-x-t5-40mp-improved-af-6.2k-video-and-much-more",
          "note": "640px press asset; upgrade to hi-res planned"
        }
      }
    },
    {
      "id": "fuji-xh2s",
      "code": "xh2s",
      "brand": "Fujifilm",
      "name": "Fujifilm X-H2S",
      "shortName": "X-H2S",
      "aliases": [
        "xh2s",
        "x h2s",
        "xh2 s",
        "x-h2s",
        "h2s"
      ],
      "mount": "fuji-x",
      "specs": {
        "widthMm": 136.3,
        "heightMm": 92.9,
        "depthMm": 84.6,
        "weightG": 660,
        "weightNote": "incl. battery & SD card",
        "source": "https://fujifilm-dsc.com/en/manual/x-h2s/technical_notes/spec/",
        "sourceType": "manufacturer",
        "bodyOnlyWeightG": 579,
        "minDepthMm": 42.8
      },
      "calibration": {
        "image": "images/fuji-xh2s-top.png",
        "view": "top",
        "imgW": 622,
        "imgH": 384,
        "pxPerMm": 4.5635,
        "flangeY": 92,
        "lcdPlaneY": 368,
        "mountX": 258,
        "status": "estimate",
        "credit": {
          "source": "Fujifilm press image via Imaging Resource",
          "page": "https://www.imaging-resource.com/news/2022/05/31/fujifilm-announces-flagship-x-h2s",
          "note": "640px press asset; upgrade to hi-res planned"
        }
      }
    },
    {
      "id": "om-om1ii",
      "code": "om1ii",
      "brand": "OM System",
      "name": "OM System OM-1 Mark II",
      "shortName": "OM-1 II",
      "aliases": [
        "om1 mark ii",
        "om-1 mark ii",
        "om1 ii",
        "om1ii",
        "om 1 mark 2",
        "om1 mk2",
        "om-1 ii",
        "om1"
      ],
      "mount": "m43",
      "specs": {
        "widthMm": 134.8,
        "heightMm": 91.6,
        "depthMm": 72.7,
        "weightG": 599,
        "weightNote": "incl. battery & card (CIPA)",
        "source": "https://jp.omsystem.com/product/dslr/om-omd/om/om1mk2/spec.html",
        "sourceType": "manufacturer",
        "bodyOnlyWeightG": 511,
        "note": "OM US storefront lists 138.8mm width — typo; official spec table says 134.8"
      },
      "calibration": {
        "image": "images/om-om1ii-top.png",
        "view": "top",
        "imgW": 1097,
        "imgH": 657,
        "pxPerMm": 8.138,
        "flangeY": 142,
        "lcdPlaneY": 595,
        "mountX": 436,
        "status": "estimate",
        "credit": {
          "source": "OM System store product image",
          "page": "https://explore.omsystem.com/us/en/om-1-mark-ii-body",
          "note": ""
        }
      }
    },
    {
      "id": "om-om3",
      "code": "om3",
      "brand": "OM System",
      "name": "OM System OM-3",
      "shortName": "OM-3",
      "aliases": [
        "om3",
        "om 3",
        "om-3"
      ],
      "mount": "m43",
      "specs": {
        "widthMm": 139.3,
        "heightMm": 88.9,
        "depthMm": 45.8,
        "weightG": 496,
        "weightNote": "incl. battery & card (CIPA)",
        "source": "https://jp.omsystem.com/product/dslr/om-omd/om/om3/spec.html",
        "sourceType": "manufacturer",
        "bodyOnlyWeightG": 413
      },
      "calibration": {
        "image": "images/om-om3-top.png",
        "view": "top",
        "imgW": 1173,
        "imgH": 411,
        "pxPerMm": 8.4207,
        "flangeY": 4,
        "lcdPlaneY": 390,
        "mountX": 491,
        "status": "estimate",
        "credit": {
          "source": "OM System store product image",
          "page": "https://explore.omsystem.com/us/en/om-3-body",
          "note": ""
        }
      }
    }
  ],
  "lenses": [
    {
      "id": "fuji-xf1650",
      "code": "x1650",
      "brand": "Fujifilm",
      "name": "XF 16-50mm F2.8-4.8 R LM WR",
      "shortName": "XF 16-50",
      "aliases": [
        "16-50",
        "1650",
        "xf 16-50",
        "xf16-50",
        "16 50",
        "kit zoom",
        "16-50mm"
      ],
      "mount": "fuji-x",
      "specs": {
        "diameterMm": 65.0,
        "lengthMm": 71.4,
        "weightG": 240,
        "filterMm": 58,
        "lengthNote": "from flange; constant length across zoom",
        "source": "https://fujifilm-xmea.com/lense/xf16-50mmf2-8-4-8-r-lm-wr/",
        "sourceType": "manufacturer"
      },
      "calibration": {
        "image": "images/fuji-xf1650-side.png",
        "view": "side-up",
        "imgW": 1636,
        "imgH": 1913,
        "pxPerMm": 25.1692,
        "axisX": 818.0,
        "mountY": 1797.1,
        "status": "verified",
        "credit": {
          "source": "Fujifilm product image via Best Buy",
          "page": "https://www.bestbuy.com/product/xf16-50mmf2-8-4-8-r-lm-wr-zoom-lens-for-fujifilm-x-mount-system-cameras-black/J7929VCLZH/sku/10095840",
          "note": ""
        }
      }
    },
    {
      "id": "fuji-xf1655ii",
      "code": "x1655ii",
      "brand": "Fujifilm",
      "name": "XF 16-55mm F2.8 R LM WR II",
      "shortName": "XF 16-55 II",
      "aliases": [
        "16-55 ii",
        "16-55",
        "1655",
        "1655ii",
        "xf 16-55",
        "xf16-55",
        "16 55",
        "16-55 mark 2",
        "16-55mm ii",
        "16-55 mk2"
      ],
      "mount": "fuji-x",
      "specs": {
        "diameterMm": 78.3,
        "lengthMm": 95.0,
        "weightG": 410,
        "filterMm": 72,
        "lengthNote": "from flange at 16mm (wide); 122mm at 55mm",
        "source": "https://fujifilm-xmea.com/lense/xf16-55mmf2-8-r-lm-wr-ii/",
        "sourceType": "manufacturer"
      },
      "calibration": {
        "image": "images/fuji-xf1655ii-side.png",
        "view": "side-up",
        "imgW": 1136,
        "imgH": 1482,
        "pxPerMm": 14.5083,
        "axisX": 568.0,
        "mountY": 1378.3,
        "status": "verified",
        "credit": {
          "source": "Fujifilm product image via Best Buy",
          "page": "https://www.bestbuy.com/product/fujifilm-xf16-55mmf2-8-r-lm-wr-ii-lens-black/J7929VCPYV",
          "note": ""
        }
      }
    },
    {
      "id": "sigma-1850x",
      "code": "s1850",
      "brand": "Sigma",
      "name": "Sigma 18-50mm F2.8 DC DN (X mount)",
      "shortName": "Sigma 18-50",
      "aliases": [
        "sigma 18-50",
        "18-50",
        "1850",
        "sigma 18 50",
        "sigma",
        "18-50mm",
        "sigma 1850"
      ],
      "mount": "fuji-x",
      "specs": {
        "diameterMm": 61.6,
        "lengthMm": 76.8,
        "weightG": 285,
        "filterMm": 55,
        "lengthNote": "X-mount figure (E-mount differs); flange to front",
        "source": "https://www.sigma-global.com/en/lenses/c021_18_50_28/",
        "sourceType": "manufacturer"
      },
      "calibration": null
    },
    {
      "id": "om-1240ii",
      "code": "o1240ii",
      "brand": "OM System",
      "name": "M.Zuiko ED 12-40mm F2.8 PRO II",
      "shortName": "12-40 PRO II",
      "aliases": [
        "12-40",
        "1240",
        "12-40 pro ii",
        "12-40 pro",
        "12 40",
        "olympus 12-40",
        "12-40mm",
        "zuiko 12-40"
      ],
      "mount": "m43",
      "specs": {
        "diameterMm": 69.9,
        "lengthMm": 84.0,
        "weightG": 382,
        "filterMm": 62,
        "lengthNote": "tip to mount flange; constant-length spec",
        "source": "https://explore.omsystem.com/us/en/m-zuiko-ed-12-40mm-f2-8-pro-ii",
        "sourceType": "manufacturer"
      },
      "calibration": {
        "image": "images/om-1240ii-side.png",
        "view": "side-up",
        "imgW": 1355,
        "imgH": 1761,
        "pxPerMm": 19.3848,
        "axisX": 677.5,
        "mountY": 1628.3,
        "status": "verified",
        "credit": {
          "source": "OM System product image via Best Buy",
          "page": "https://www.bestbuy.com/product/om-system-m-zuiko-digital-ed-12-40mm-f-2-8-pro-ii-lens/CXKTW42PVC",
          "note": ""
        }
      }
    }
  ],
  "defaultComparison": [
    {
      "camId": "fuji-xe5",
      "lensId": "fuji-xf1650"
    },
    {
      "camId": "fuji-xe5",
      "lensId": "sigma-1850x"
    },
    {
      "camId": "fuji-xt5",
      "lensId": "fuji-xf1655ii"
    },
    {
      "camId": "fuji-xh2s",
      "lensId": "fuji-xf1655ii"
    },
    {
      "camId": "om-om1ii",
      "lensId": "om-1240ii"
    },
    {
      "camId": "om-om3",
      "lensId": "om-1240ii"
    }
  ]
};
