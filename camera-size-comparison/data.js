/* Camera & lens database.
 * All values from manufacturer-published specifications (see `source` per
 * entry). Weights include battery + memory card for bodies where published.
 * depthMinMM = manufacturer's "minimum depth" (body at its thinnest point),
 * used to draw the body slab in the top view.
 * See README.md for the full schema and how to add entries.
 */

const CAMERAS = [
  // ---- Fujifilm ----
  { id: 'fujifilm-x-t5', brand: 'Fujifilm', name: 'X-T5', mount: 'X', sensor: 'APS-C',
    widthMM: 129.5, heightMM: 91, depthMM: 63.8, depthMinMM: 35, weightG: 557,
    depthInclEyecup: true, evf: 'center', grip: 'small', photos: { front: { src: 'https://commons.wikimedia.org/wiki/Special:FilePath/Fujifilm%20X-T5%204%20nov%202022a.jpg' } },  // Commons product shot — angle/crop unverified; recalibrate widthMM after checking
    source: 'https://www.fujifilm-x.com/en-us/products/cameras/x-t5/specifications/' },
  { id: 'fujifilm-x-t50', brand: 'Fujifilm', name: 'X-T50', mount: 'X', sensor: 'APS-C',
    widthMM: 123.8, heightMM: 84, depthMM: 48.8, weightG: 438,
    depthInclEyecup: true, evf: 'center', grip: 'small', photos: { front: { src: 'https://commons.wikimedia.org/wiki/Special:FilePath/Fujifilm%20X-T50%2025%20may%202025a.jpg' } },  // Commons product shot — angle/crop unverified; recalibrate widthMM after checking
    source: 'https://www.fujifilm-x.com/en-us/products/cameras/x-t50/specifications/' },
  { id: 'fujifilm-x-h2', brand: 'Fujifilm', name: 'X-H2', mount: 'X', sensor: 'APS-C',
    widthMM: 136.3, heightMM: 92.9, depthMM: 84.6, depthMinMM: 42.8, weightG: 660,
    depthInclEyecup: true, evf: 'center', grip: 'deep', source: 'https://www.fujifilm-x.com/global/products/cameras/x-h2/specifications/' },
  { id: 'fujifilm-x-h2s', brand: 'Fujifilm', name: 'X-H2S', mount: 'X', sensor: 'APS-C',
    widthMM: 136.3, heightMM: 92.9, depthMM: 84.6, depthMinMM: 42.8, weightG: 660,
    depthInclEyecup: true, evf: 'center', grip: 'deep', photos: { front: { src: 'https://commons.wikimedia.org/wiki/Special:FilePath/Fujifilm%20X-H2S%2017%20Jul%202022h.jpg' } },  // Commons product shot — angle/crop unverified; recalibrate widthMM after checking
    source: 'https://fujifilm-dsc.com/en/manual/x-h2s/technical_notes/spec/' },
  { id: 'fujifilm-x-s20', brand: 'Fujifilm', name: 'X-S20', mount: 'X', sensor: 'APS-C',
    widthMM: 127.7, heightMM: 85.1, depthMM: 65.4, weightG: 491,
    depthInclEyecup: true, evf: 'center', grip: 'deep', source: 'https://www.fujifilm-x.com/global/products/cameras/x-s20/specifications/' },
  { id: 'fujifilm-x-m5', brand: 'Fujifilm', name: 'X-M5', mount: 'X', sensor: 'APS-C',
    widthMM: 111.9, heightMM: 66.6, depthMM: 38, weightG: 355,
    evf: 'none', grip: 'flat', source: 'https://fujifilm-dsc.com/en/manual/x-m5/technical_notes/spec/' },
  { id: 'fujifilm-x100vi', brand: 'Fujifilm', name: 'X100VI', mount: 'fixed', sensor: 'APS-C',
    widthMM: 128, heightMM: 74.8, depthMM: 55.3, depthMinMM: 33.2, weightG: 521,
    evf: 'corner', grip: 'small',
    fixedLensName: '23mm f/2 (fixed)', fixedLensProtrusionMM: 22.1, fixedLensDiameterMM: 60,
    photos: { front: { src: 'https://commons.wikimedia.org/wiki/Special:FilePath/Fujifilm%20X100VI%2025%20may%202024a.jpg' } },  // Commons product shot — angle/crop unverified; recalibrate widthMM after checking
    source: 'https://www.fujifilm-x.com/global/products/cameras/x100vi/specifications/' },
  { id: 'fujifilm-x-pro3', brand: 'Fujifilm', name: 'X-Pro3', mount: 'X', sensor: 'APS-C',
    widthMM: 140.5, heightMM: 82.8, depthMM: 46.1, depthMinMM: 35.4, weightG: 497,
    depthInclEyecup: true, evf: 'corner', grip: 'small', source: 'https://www.fujifilm-x.com/global/products/cameras/x-pro3/specifications/' },
  { id: 'fujifilm-x-e4', brand: 'Fujifilm', name: 'X-E4', mount: 'X', sensor: 'APS-C',
    widthMM: 121.3, heightMM: 72.9, depthMM: 32.7, weightG: 364,
    depthInclEyecup: true, evf: 'corner', grip: 'flat', source: 'https://www.fujifilm-x.com/en-us/products/cameras/x-e4/specifications/' },

  // ---- OM System / Olympus ----
  { id: 'om-system-om-1-ii', brand: 'OM System', name: 'OM-1 Mark II', mount: 'MFT', sensor: 'Micro Four Thirds',
    widthMM: 134.8, heightMM: 91.6, depthMM: 72.7, weightG: 599,
    evf: 'center', grip: 'deep', photos: { front: { src: 'https://commons.wikimedia.org/wiki/Special:FilePath/OM%20System%20OM-1%20Mark%20II%209%20mar%202024e.jpg' } },  // Commons product shot — angle/crop unverified; recalibrate widthMM after checking
    source: 'https://explore.omsystem.com/us/en/om-1-mark-ii' },
  { id: 'om-system-om-3', brand: 'OM System', name: 'OM-3', mount: 'MFT', sensor: 'Micro Four Thirds',
    widthMM: 139.3, heightMM: 88.9, depthMM: 45.8, weightG: 496,
    evf: 'center', grip: 'flat', photos: { front: { src: 'https://commons.wikimedia.org/wiki/Special:FilePath/OM%20System%20OM-3%2028%20feb%202025a.jpg' } },  // Commons product shot — angle/crop unverified; recalibrate widthMM after checking
    source: 'https://explore.omsystem.com/us/en/om-3' },
  { id: 'om-system-om-5', brand: 'OM System', name: 'OM-5', mount: 'MFT', sensor: 'Micro Four Thirds',
    widthMM: 125.3, heightMM: 85.2, depthMM: 49.7, weightG: 414,
    evf: 'center', grip: 'small', photos: { front: { src: 'https://commons.wikimedia.org/wiki/Special:FilePath/OM%20System%20OM-5%2022%20nov%202022a.jpg' } },  // Commons product shot — angle/crop unverified; recalibrate widthMM after checking
    source: 'https://www.dpreview.com/products/olympus/slrs/omsystem_om5/specifications' },
  { id: 'om-system-om-5-ii', brand: 'OM System', name: 'OM-5 Mark II', mount: 'MFT', sensor: 'Micro Four Thirds',
    widthMM: 125.3, heightMM: 85.2, depthMM: 52, weightG: 418,
    evf: 'center', grip: 'small', source: 'https://explore.omsystem.com/us/en/om-5-mark-ii' },
  { id: 'olympus-e-m10-iv', brand: 'Olympus', name: 'OM-D E-M10 Mark IV', mount: 'MFT', sensor: 'Micro Four Thirds',
    widthMM: 121.7, heightMM: 84.4, depthMM: 49, weightG: 383,
    evf: 'center', grip: 'small', source: 'https://asia.olympus-imaging.com/product/dslr/em10mk4/spec.html' },
  { id: 'olympus-e-p7', brand: 'Olympus', name: 'PEN E-P7', mount: 'MFT', sensor: 'Micro Four Thirds',
    widthMM: 118.3, heightMM: 68.5, depthMM: 38.1, weightG: 337,
    evf: 'none', grip: 'flat', source: 'https://www.dpreview.com/products/olympus/slrs/olympus_ep7/specifications' },
];

const LENSES = [
  // ---- Fujifilm XF zooms ----
  { id: 'xf-16-55-ii', brand: 'Fujifilm', mount: 'X', name: 'XF 16-55mm F2.8 R LM WR II', focal: '16-55mm', aperture: 'F2.8',
    diameterMM: 78.3, lengthMM: 95, weightG: 410, filterMM: 72, source: 'https://www.fujifilm-x.com/global/products/lenses/xf16-55mmf28-r-lm-wr-ii/specifications/' },
  { id: 'xf-18-55', brand: 'Fujifilm', mount: 'X', name: 'XF 18-55mm F2.8-4 R LM OIS', focal: '18-55mm', aperture: 'F2.8-4',
    diameterMM: 65, lengthMM: 70.4, weightG: 310, filterMM: 58, source: 'https://www.fujifilm-x.com/global/products/lenses/xf18-55mmf28-4-r-lm-ois/specifications/' },
  { id: 'xf-16-80', brand: 'Fujifilm', mount: 'X', name: 'XF 16-80mm F4 R OIS WR', focal: '16-80mm', aperture: 'F4',
    diameterMM: 78.3, lengthMM: 88.9, weightG: 440, filterMM: 72, source: 'https://www.fujifilm-x.com/en-us/products/lenses/xf16-80mmf4-r-ois-wr/specifications/' },
  { id: 'xf-70-300', brand: 'Fujifilm', mount: 'X', name: 'XF 70-300mm F4-5.6 R LM OIS WR', focal: '70-300mm', aperture: 'F4-5.6',
    diameterMM: 75, lengthMM: 132.5, weightG: 580, filterMM: 67, source: 'https://www.fujifilm-x.com/global/products/lenses/xf70-300mmf4-56-r-lm-ois-wr/specifications/' },
  { id: 'xf-50-140', brand: 'Fujifilm', mount: 'X', name: 'XF 50-140mm F2.8 R LM OIS WR', focal: '50-140mm', aperture: 'F2.8',
    diameterMM: 82.9, lengthMM: 175.9, weightG: 995, filterMM: 72, source: 'https://www.fujifilm-x.com/global/products/lenses/xf50-140mmf28-r-lm-ois-wr/specifications/' },
  { id: 'xf-10-24', brand: 'Fujifilm', mount: 'X', name: 'XF 10-24mm F4 R OIS WR', focal: '10-24mm', aperture: 'F4',
    diameterMM: 77.6, lengthMM: 87, weightG: 385, filterMM: 72, source: 'https://www.fujifilm-x.com/en-us/products/lenses/xf10-24mmf4-r-ois-wr/specifications/' },
  { id: 'xf-150-600', brand: 'Fujifilm', mount: 'X', name: 'XF 150-600mm F5.6-8 R LM OIS WR', focal: '150-600mm', aperture: 'F5.6-8',
    diameterMM: 99, lengthMM: 314.5, weightG: 1605, filterMM: 82, source: 'https://www.fujifilm-x.com/global/products/lenses/xf150-600mmf56-8-r-lm-ois-wr/specifications/' },

  // ---- Fujifilm XF primes ----
  { id: 'xf-18-f14', brand: 'Fujifilm', mount: 'X', name: 'XF 18mm F1.4 R LM WR', focal: '18mm', aperture: 'F1.4',
    diameterMM: 68.8, lengthMM: 75.6, weightG: 370, filterMM: 62, source: 'https://www.fujifilm-x.com/global/products/lenses/xf18mmf14-r-lm-wr/specifications/' },
  { id: 'xf-23-f14', brand: 'Fujifilm', mount: 'X', name: 'XF 23mm F1.4 R LM WR', focal: '23mm', aperture: 'F1.4',
    diameterMM: 67, lengthMM: 77.8, weightG: 375, filterMM: 58, source: 'https://www.fujifilm-x.com/global/products/lenses/xf23mmf14-r-lm-wr/specifications/' },
  { id: 'xf-33-f14', brand: 'Fujifilm', mount: 'X', name: 'XF 33mm F1.4 R LM WR', focal: '33mm', aperture: 'F1.4',
    diameterMM: 67, lengthMM: 73.5, weightG: 360, filterMM: 58, source: 'https://www.fujifilm-x.com/global/products/lenses/xf33mmf14-r-lm-wr/specifications/' },
  { id: 'xf-35-f14', brand: 'Fujifilm', mount: 'X', name: 'XF 35mm F1.4 R', focal: '35mm', aperture: 'F1.4',
    diameterMM: 65, lengthMM: 50.4, weightG: 187, filterMM: 52, source: 'https://www.fujifilm-x.com/global/products/lenses/xf35mmf14-r/specifications/' },
  { id: 'xf-56-f12', brand: 'Fujifilm', mount: 'X', name: 'XF 56mm F1.2 R WR', focal: '56mm', aperture: 'F1.2',
    diameterMM: 79.4, lengthMM: 76, weightG: 445, filterMM: 67, source: 'https://www.fujifilm-x.com/global/products/lenses/xf56mmf12-r-wr/specifications/' },
  { id: 'xf-27-f28', brand: 'Fujifilm', mount: 'X', name: 'XF 27mm F2.8 R WR', focal: '27mm', aperture: 'F2.8',
    diameterMM: 62, lengthMM: 23, weightG: 84, filterMM: 39, source: 'https://www.fujifilm-x.com/en-us/products/lenses/xf27mmf28-r-wr/specifications/' },

  // ---- Sigma X-mount ----
  { id: 'sigma-18-50-x', brand: 'Sigma', mount: 'X', name: '18-50mm F2.8 DC DN C', focal: '18-50mm', aperture: 'F2.8',
    diameterMM: 61.6, lengthMM: 76.8, weightG: 285, filterMM: 55, source: 'https://www.sigma-global.com/en/lenses/c021_18_50_28/' },
  { id: 'sigma-10-18-x', brand: 'Sigma', mount: 'X', name: '10-18mm F2.8 DC DN C', focal: '10-18mm', aperture: 'F2.8',
    diameterMM: 72.2, lengthMM: 64.3, weightG: 250, filterMM: 67, source: 'https://www.sigma-global.com/en/lenses/c023_10_18_28/' },
  { id: 'sigma-16-f14-x', brand: 'Sigma', mount: 'X', name: '16mm F1.4 DC DN C', focal: '16mm', aperture: 'F1.4',
    diameterMM: 72.2, lengthMM: 92.6, weightG: 405, filterMM: 67, source: 'https://www.sigma-global.com/en/lenses/c017_16_14/' },
  { id: 'sigma-23-f14-x', brand: 'Sigma', mount: 'X', name: '23mm F1.4 DC DN C', focal: '23mm', aperture: 'F1.4',
    diameterMM: 65.8, lengthMM: 79.2, weightG: 335, filterMM: 52, source: 'https://www.sigma-global.com/en/lenses/c023_23_14/' },
  { id: 'sigma-30-f14-x', brand: 'Sigma', mount: 'X', name: '30mm F1.4 DC DN C', focal: '30mm', aperture: 'F1.4',
    diameterMM: 64.8, lengthMM: 73.6, weightG: 275, filterMM: 52, source: 'https://www.sigma-global.com/en/lenses/c016_30_14/' },
  { id: 'sigma-56-f14-x', brand: 'Sigma', mount: 'X', name: '56mm F1.4 DC DN C', focal: '56mm', aperture: 'F1.4',
    diameterMM: 66.5, lengthMM: 59.8, weightG: 280, filterMM: 55, source: 'https://www.sigma-global.com/en/lenses/c018_56_14/' },
  { id: 'sigma-100-400-x', brand: 'Sigma', mount: 'X', name: '100-400mm F5-6.3 DG DN OS C', focal: '100-400mm', aperture: 'F5-6.3',
    diameterMM: 86, lengthMM: 199.5, weightG: 1135, filterMM: 67, source: 'https://www.sigma-global.com/en/lenses/c020_100_400_5_63/' },

  // ---- OM System / Olympus M.Zuiko zooms ----
  { id: 'mz-12-40-ii', brand: 'OM System', mount: 'MFT', name: 'M.Zuiko 12-40mm F2.8 PRO II', focal: '12-40mm', aperture: 'F2.8',
    diameterMM: 69.9, lengthMM: 84, weightG: 382, filterMM: 62, source: 'https://explore.omsystem.com/us/en/m-zuiko-ed-12-40mm-f2-8-pro-ii' },
  { id: 'mz-12-100', brand: 'OM System', mount: 'MFT', name: 'M.Zuiko 12-100mm F4.0 IS PRO', focal: '12-100mm', aperture: 'F4.0',
    diameterMM: 77.5, lengthMM: 116.5, weightG: 561, filterMM: 72, source: 'https://explore.omsystem.com/us/en/m-zuiko-ed-12-100mm-f4-0-is-pro' },
  { id: 'mz-40-150-f28', brand: 'OM System', mount: 'MFT', name: 'M.Zuiko 40-150mm F2.8 PRO', focal: '40-150mm', aperture: 'F2.8',
    diameterMM: 79.4, lengthMM: 160, weightG: 760, filterMM: 72, source: 'https://explore.omsystem.com/us/en/m-zuiko-ed-40-150mm-f2-8-pro' },
  { id: 'mz-40-150-f4', brand: 'OM System', mount: 'MFT', name: 'M.Zuiko 40-150mm F4.0 PRO', focal: '40-150mm', aperture: 'F4.0',
    diameterMM: 68.9, lengthMM: 99.4, weightG: 382, filterMM: 62, source: 'https://explore.omsystem.com/us/en/m-zuiko-ed-40-150mm-f4-0-pro' },
  { id: 'mz-8-25', brand: 'OM System', mount: 'MFT', name: 'M.Zuiko 8-25mm F4.0 PRO', focal: '8-25mm', aperture: 'F4.0',
    diameterMM: 77, lengthMM: 88.5, weightG: 411, filterMM: 72, source: 'https://explore.omsystem.com/us/en/m-zuiko-ed-8-25mm-f4-pro' },
  { id: 'mz-9-18-ii', brand: 'OM System', mount: 'MFT', name: 'M.Zuiko 9-18mm F4.0-5.6 II', focal: '9-18mm', aperture: 'F4.0-5.6',
    diameterMM: 56.2, lengthMM: 49.3, weightG: 154, filterMM: 52, source: 'https://www.dpreview.com/products/olympus/lenses/omsystem_9-18_4-5p6_ii/specifications' },
  { id: 'mz-100-400-ii', brand: 'OM System', mount: 'MFT', name: 'M.Zuiko 100-400mm F5.0-6.3 IS II', focal: '100-400mm', aperture: 'F5.0-6.3',
    diameterMM: 86.4, lengthMM: 205.6, weightG: 1125, filterMM: 72, source: 'https://explore.omsystem.com/us/en/m-zuiko-ed-100-400mm-f5-0-6-3-is-ii' },
  { id: 'mz-14-42-ez', brand: 'OM System', mount: 'MFT', name: 'M.Zuiko 14-42mm F3.5-5.6 EZ', focal: '14-42mm', aperture: 'F3.5-5.6',
    diameterMM: 60.6, lengthMM: 22.5, weightG: 93, filterMM: 37, source: 'https://explore.omsystem.com/us/en/m-zuiko-ed-14-42mm-f3-5-5-6-ez' },

  // ---- OM System / Olympus M.Zuiko primes ----
  { id: 'mz-20-f14', brand: 'OM System', mount: 'MFT', name: 'M.Zuiko 20mm F1.4 PRO', focal: '20mm', aperture: 'F1.4',
    diameterMM: 63.4, lengthMM: 61.7, weightG: 247, filterMM: 58, source: 'https://explore.omsystem.com/us/en/m-zuiko-ed-20mm-f1-4-pro' },
  { id: 'mz-17-f18', brand: 'Olympus', mount: 'MFT', name: 'M.Zuiko 17mm F1.8', focal: '17mm', aperture: 'F1.8',
    diameterMM: 57.5, lengthMM: 35.5, weightG: 120, filterMM: 46, source: 'https://asia.omsystem.com/product/dslr/mlens/17_18/spec.html' },
  { id: 'mz-25-f18', brand: 'Olympus', mount: 'MFT', name: 'M.Zuiko 25mm F1.8', focal: '25mm', aperture: 'F1.8',
    diameterMM: 57.8, lengthMM: 42, weightG: 137, filterMM: 46, source: 'https://asia.omsystem.com/product/dslr/mlens/25_18/spec.html' },
  { id: 'mz-45-f18', brand: 'Olympus', mount: 'MFT', name: 'M.Zuiko 45mm F1.8', focal: '45mm', aperture: 'F1.8',
    diameterMM: 56, lengthMM: 46, weightG: 116, filterMM: 37, source: 'https://explore.omsystem.com/us/en/m-zuiko-45mm-f1-8' },
  { id: 'mz-75-f18', brand: 'Olympus', mount: 'MFT', name: 'M.Zuiko 75mm F1.8', focal: '75mm', aperture: 'F1.8',
    diameterMM: 64, lengthMM: 69, weightG: 305, filterMM: 58, source: 'https://explore.omsystem.com/us/en/m-zuiko-ed-75mm-f1-8' },
  { id: 'mz-60-macro', brand: 'Olympus', mount: 'MFT', name: 'M.Zuiko 60mm F2.8 Macro', focal: '60mm', aperture: 'F2.8',
    diameterMM: 56, lengthMM: 82, weightG: 185, filterMM: 46, source: 'https://explore.omsystem.com/us/en/m-zuiko-ed-60mm-f2-8-macro' },

  // ---- Sigma Micro Four Thirds ----
  { id: 'sigma-16-f14-mft', brand: 'Sigma', mount: 'MFT', name: '16mm F1.4 DC DN C', focal: '16mm', aperture: 'F1.4',
    diameterMM: 72.2, lengthMM: 91.1, weightG: 395, filterMM: 67, source: 'https://www.sigma-global.com/en/lenses/c017_16_14/' },
  { id: 'sigma-30-f14-mft', brand: 'Sigma', mount: 'MFT', name: '30mm F1.4 DC DN C', focal: '30mm', aperture: 'F1.4',
    diameterMM: 64.8, lengthMM: 72.1, weightG: 260, filterMM: 52, source: 'https://www.sigma-global.com/en/lenses/c016_30_14/' },
  { id: 'sigma-56-f14-mft', brand: 'Sigma', mount: 'MFT', name: '56mm F1.4 DC DN C', focal: '56mm', aperture: 'F1.4',
    diameterMM: 66.5, lengthMM: 58.1, weightG: 256, filterMM: 55, source: 'https://www.sigma-global.com/en/lenses/c018_56_14/' },
];

/* What loads when the page is opened without a share URL. */
const DEFAULT_SLOTS = [
  { camId: 'fujifilm-x-t5', lensId: 'xf-16-55-ii', nudge: 0 },
  { camId: 'om-system-om-1-ii', lensId: 'mz-12-40-ii', nudge: 0 },
  { camId: 'fujifilm-x100vi', lensId: null, nudge: 0 },
];
