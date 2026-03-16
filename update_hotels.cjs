const fs = require('fs');

const newHotels = [
  // Emaar Al Diyafa Hotels - Madinah
  {
    id: 'emaar-royal-madinah',
    name: 'Emaar Royal',
    city: 'Madinah',
    vendor: 'Emaar Al Diyafa',
    mealPlan: 'FB',
    stars: 5,
    seasons: [
      {
        range: '30 JUN 2026 TO 19 AUG 2026',
        prices: [
          { roomType: 'Double', price: 575 },
          { roomType: 'Triple', price: 650 },
          { roomType: 'Quad', price: 725 },
        ],
      },
      {
        range: '19 AUG 2026 TO 16 DEC 2026',
        prices: [
          { roomType: 'Double', price: 675 },
          { roomType: 'Triple', price: 775 },
          { roomType: 'Quad', price: 875 },
        ],
      },
      {
        range: '16 DEC 2026 TO 09 JAN 2027',
        prices: [
          { roomType: 'Double', price: 1100 },
          { roomType: 'Triple', price: 1250 },
          { roomType: 'Quad', price: 1400 },
        ],
      },
      {
        range: '09 JAN 2027 TO 08 FEB 2027',
        prices: [
          { roomType: 'Double', price: 775 },
          { roomType: 'Triple', price: 875 },
          { roomType: 'Quad', price: 975 },
        ],
      },
    ],
  },
  {
    id: 'emaar-elite-madinah',
    name: 'Emaar Elite',
    city: 'Madinah',
    vendor: 'Emaar Al Diyafa',
    mealPlan: 'FB',
    stars: 5,
    seasons: [
      {
        range: '30 JUN 2026 TO 19 AUG 2026',
        prices: [
          { roomType: 'Double', price: 550 },
          { roomType: 'Triple', price: 625 },
          { roomType: 'Quad', price: 700 },
        ],
      },
      {
        range: '19 AUG 2026 TO 16 DEC 2026',
        prices: [
          { roomType: 'Double', price: 650 },
          { roomType: 'Triple', price: 750 },
          { roomType: 'Quad', price: 850 },
        ],
      },
      {
        range: '16 DEC 2026 TO 09 JAN 2027',
        prices: [
          { roomType: 'Double', price: 1075 },
          { roomType: 'Triple', price: 1225 },
          { roomType: 'Quad', price: 1375 },
        ],
      },
      {
        range: '09 JAN 2027 TO 08 FEB 2027',
        prices: [
          { roomType: 'Double', price: 750 },
          { roomType: 'Triple', price: 850 },
          { roomType: 'Quad', price: 950 },
        ],
      },
    ],
  },
  {
    id: 'emaar-el-mektan-madinah',
    name: 'Emaar El Mektan',
    city: 'Madinah',
    vendor: 'Emaar Al Diyafa',
    mealPlan: 'FB',
    stars: 4,
    seasons: [
      {
        range: '16 JUN 2026 TO 19 AUG 2026',
        prices: [
          { roomType: 'Double', price: 550 },
          { roomType: 'Triple', price: 625 },
          { roomType: 'Quad', price: 700 },
          { roomType: 'Delux Suite (04 pax)', price: 800 },
          { roomType: 'Family Suite (05 pax)', price: 820 },
          { roomType: 'Royal Suite (05 pax)', price: 890 },
        ],
      },
      {
        range: '19 AUG 2026 TO 16 DEC 2026',
        prices: [
          { roomType: 'Double', price: 650 },
          { roomType: 'Triple', price: 750 },
          { roomType: 'Quad', price: 850 },
          { roomType: 'Delux Suite (04 pax)', price: 950 },
          { roomType: 'Family Suite (05 pax)', price: 970 },
          { roomType: 'Royal Suite (05 pax)', price: 1040 },
        ],
      },
      {
        range: '16 DEC 2026 TO 09 JAN 2027',
        prices: [
          { roomType: 'Double', price: 1075 },
          { roomType: 'Triple', price: 1225 },
          { roomType: 'Quad', price: 1375 },
          { roomType: 'Delux Suite (04 pax)', price: 1475 },
          { roomType: 'Family Suite (05 pax)', price: 1495 },
          { roomType: 'Royal Suite (05 pax)', price: 1565 },
        ],
      },
      {
        range: '09 JAN 2027 TO 08 FEB 2027',
        prices: [
          { roomType: 'Double', price: 750 },
          { roomType: 'Triple', price: 850 },
          { roomType: 'Quad', price: 950 },
          { roomType: 'Delux Suite (04 pax)', price: 1050 },
          { roomType: 'Family Suite (05 pax)', price: 1070 },
          { roomType: 'Royal Suite (05 pax)', price: 1140 },
        ],
      },
    ],
  },
  {
    id: 'emaar-taibah-madinah',
    name: 'Emaar Taibah',
    city: 'Madinah',
    vendor: 'Emaar Al Diyafa',
    mealPlan: 'FB',
    stars: 4,
    seasons: [
      {
        range: '30 JUN 2026 TO 19 AUG 2026',
        prices: [
          { roomType: 'Double', price: 380 },
          { roomType: 'Triple', price: 420 },
          { roomType: 'Quad', price: 460 },
        ],
      },
      {
        range: '19 AUG 2026 TO 16 DEC 2026',
        prices: [
          { roomType: 'Double', price: 425 },
          { roomType: 'Triple', price: 485 },
          { roomType: 'Quad', price: 545 },
        ],
      },
      {
        range: '16 DEC 2026 TO 09 JAN 2027',
        prices: [
          { roomType: 'Double', price: 600 },
          { roomType: 'Triple', price: 660 },
          { roomType: 'Quad', price: 720 },
        ],
      },
      {
        range: '09 JAN 2027 TO 08 FEB 2027',
        prices: [
          { roomType: 'Double', price: 470 },
          { roomType: 'Triple', price: 535 },
          { roomType: 'Quad', price: 600 },
        ],
      },
    ],
  },
  
  // Al Shohada Hotel - Makkah
  {
    id: 'al-shohada-makkah',
    name: 'Al Shohada Hotel',
    city: 'Makkah',
    vendor: 'Palm Rich',
    mealPlan: 'RO',
    stars: 5,
    seasons: [
      {
        range: '16 JUN 2026 TO 14 JUL 2026',
        prices: [
          { roomType: 'Double', price: 500 },
          { roomType: 'Triple', price: 590 },
          { roomType: 'Quad', price: 680 },
        ],
      },
      {
        range: '14 JUL 2026 TO 11 SEP 2026',
        prices: [
          { roomType: 'Double', price: 535 },
          { roomType: 'Triple', price: 625 },
          { roomType: 'Quad', price: 715 },
        ],
      },
      {
        range: '11 SEP 2026 TO 10 NOV 2026',
        prices: [
          { roomType: 'Double', price: 660 },
          { roomType: 'Triple', price: 750 },
          { roomType: 'Quad', price: 840 },
        ],
      },
      {
        range: '10 NOV 2026 TO 09 DEC 2026',
        prices: [
          { roomType: 'Double', price: 710 },
          { roomType: 'Triple', price: 800 },
          { roomType: 'Quad', price: 890 },
        ],
      },
      {
        range: '09 DEC 2026 TO 20 JAN 2027',
        prices: [
          { roomType: 'Double', price: 1260 },
          { roomType: 'Triple', price: 1350 },
          { roomType: 'Quad', price: 1440 },
        ],
      },
      {
        range: '20 JAN 2027 TO 07 FEB 2027',
        prices: [
          { roomType: 'Double', price: 710 },
          { roomType: 'Triple', price: 800 },
          { roomType: 'Quad', price: 890 },
        ],
      },
    ],
  },

  // Emaar Al Diyafa Hotels - Makkah
  {
    id: 'emaar-grand-makkah',
    name: 'Emaar Grand Hotel',
    city: 'Makkah',
    vendor: 'Emaar Al Diyafa',
    mealPlan: 'FB',
    stars: 5,
    seasons: [
      {
        range: '16 JUN 2026 TO 15 JUL 2026',
        prices: [
          { roomType: 'Double', price: 340 },
          { roomType: 'Triple', price: 410 },
          { roomType: 'Quad', price: 480 },
        ],
      },
      {
        range: '15 JUL 2026 TO 12 SEP 2026',
        prices: [
          { roomType: 'Double', price: 375 },
          { roomType: 'Triple', price: 445 },
          { roomType: 'Quad', price: 515 },
        ],
      },
      {
        range: '12 SEP 2026 TO 10 DEC 2026',
        prices: [
          { roomType: 'Double', price: 420 },
          { roomType: 'Triple', price: 490 },
          { roomType: 'Quad', price: 560 },
        ],
      },
      {
        range: '10 DEC 2026 TO 21 JAN 2027',
        prices: [
          { roomType: 'Double', price: 745 },
          { roomType: 'Triple', price: 815 },
          { roomType: 'Quad', price: 885 },
        ],
      },
      {
        range: '21 JAN 2027 TO 07 FEB 2027',
        prices: [
          { roomType: 'Double', price: 510 },
          { roomType: 'Triple', price: 580 },
          { roomType: 'Quad', price: 650 },
        ],
      },
    ],
  },
  {
    id: 'emaar-manar-makkah',
    name: 'Emaar Manar Hotel',
    city: 'Makkah',
    vendor: 'Emaar Al Diyafa',
    mealPlan: 'FB',
    stars: 4,
    seasons: [
      {
        range: '16 JUN 2026 TO 15 JUL 2026',
        prices: [
          { roomType: 'Double', price: 330 },
          { roomType: 'Triple', price: 400 },
          { roomType: 'Quad', price: 470 },
        ],
      },
      {
        range: '15 JUL 2026 TO 12 SEP 2026',
        prices: [
          { roomType: 'Double', price: 345 },
          { roomType: 'Triple', price: 415 },
          { roomType: 'Quad', price: 485 },
        ],
      },
      {
        range: '12 SEP 2026 TO 10 DEC 2026',
        prices: [
          { roomType: 'Double', price: 390 },
          { roomType: 'Triple', price: 460 },
          { roomType: 'Quad', price: 530 },
        ],
      },
      {
        range: '10 DEC 2026 TO 21 JAN 2027',
        prices: [
          { roomType: 'Double', price: 685 },
          { roomType: 'Triple', price: 755 },
          { roomType: 'Quad', price: 825 },
        ],
      },
      {
        range: '21 JAN 2027 TO 07 FEB 2027',
        prices: [
          { roomType: 'Double', price: 445 },
          { roomType: 'Triple', price: 515 },
          { roomType: 'Quad', price: 585 },
        ],
      },
    ],
  },
  {
    id: 'emaar-andalusia-makkah',
    name: 'Emaar Andalusia Hotel',
    city: 'Makkah',
    vendor: 'Emaar Al Diyafa',
    mealPlan: 'FB',
    stars: 4,
    seasons: [
      {
        range: '16 JUN 2026 TO 15 JUL 2026',
        prices: [
          { roomType: 'Double', price: 330 },
          { roomType: 'Triple', price: 400 },
          { roomType: 'Quad', price: 470 },
        ],
      },
      {
        range: '15 JUL 2026 TO 12 SEP 2026',
        prices: [
          { roomType: 'Double', price: 345 },
          { roomType: 'Triple', price: 415 },
          { roomType: 'Quad', price: 485 },
        ],
      },
      {
        range: '12 SEP 2026 TO 10 DEC 2026',
        prices: [
          { roomType: 'Double', price: 390 },
          { roomType: 'Triple', price: 460 },
          { roomType: 'Quad', price: 530 },
        ],
      },
      {
        range: '10 DEC 2026 TO 21 JAN 2027',
        prices: [
          { roomType: 'Double', price: 685 },
          { roomType: 'Triple', price: 755 },
          { roomType: 'Quad', price: 825 },
        ],
      },
      {
        range: '21 JAN 2027 TO 07 FEB 2027',
        prices: [
          { roomType: 'Double', price: 445 },
          { roomType: 'Triple', price: 515 },
          { roomType: 'Quad', price: 585 },
        ],
      },
    ],
  },
  {
    id: 'emaar-khalil-makkah',
    name: 'Emaar Khalil Hotel',
    city: 'Makkah',
    vendor: 'Emaar Al Diyafa',
    mealPlan: 'FB',
    stars: 3,
    seasons: [
      {
        range: '16 JUN 2026 TO 15 JUL 2026',
        prices: [
          { roomType: 'Double', price: 295 },
          { roomType: 'Triple', price: 365 },
          { roomType: 'Quad', price: 435 },
        ],
      },
      {
        range: '15 JUL 2026 TO 12 SEP 2026',
        prices: [
          { roomType: 'Double', price: 335 },
          { roomType: 'Triple', price: 405 },
          { roomType: 'Quad', price: 475 },
        ],
      },
      {
        range: '12 SEP 2026 TO 10 DEC 2026',
        prices: [
          { roomType: 'Double', price: 355 },
          { roomType: 'Triple', price: 425 },
          { roomType: 'Quad', price: 495 },
        ],
      },
      {
        range: '10 DEC 2026 TO 21 JAN 2027',
        prices: [
          { roomType: 'Double', price: 455 },
          { roomType: 'Triple', price: 525 },
          { roomType: 'Quad', price: 595 },
        ],
      },
      {
        range: '21 JAN 2027 TO 07 FEB 2027',
        prices: [
          { roomType: 'Double', price: 355 },
          { roomType: 'Triple', price: 425 },
          { roomType: 'Quad', price: 495 },
        ],
      },
    ],
  },
  {
    id: 'emar-elite-makkah',
    name: 'Emar Elite Makkah',
    city: 'Makkah',
    vendor: 'Emaar Al Diyafa',
    mealPlan: 'FB',
    stars: 4,
    seasons: [
      {
        range: '16 JUN 2026 TO 15 JUL 2026',
        prices: [
          { roomType: 'Double', price: 215 },
          { roomType: 'Triple', price: 280 },
          { roomType: 'Quad', price: 345 },
        ],
      },
      {
        range: '15 JUL 2026 TO 12 SEP 2026',
        prices: [
          { roomType: 'Double', price: 240 },
          { roomType: 'Triple', price: 305 },
          { roomType: 'Quad', price: 370 },
        ],
      },
      {
        range: '12 SEP 2026 TO 10 DEC 2026',
        prices: [
          { roomType: 'Double', price: 285 },
          { roomType: 'Triple', price: 350 },
          { roomType: 'Quad', price: 415 },
        ],
      },
      {
        range: '10 DEC 2026 TO 21 JAN 2027',
        prices: [
          { roomType: 'Double', price: 390 },
          { roomType: 'Triple', price: 455 },
          { roomType: 'Quad', price: 520 },
        ],
      },
      {
        range: '21 JAN 2027 TO 07 FEB 2027',
        prices: [
          { roomType: 'Double', price: 265 },
          { roomType: 'Triple', price: 330 },
          { roomType: 'Quad', price: 395 },
        ],
      },
    ],
  },
  {
    id: 'afaq-al-sud-makkah',
    name: 'Afaq Al Sud Hotel',
    city: 'Makkah',
    vendor: 'Emaar Al Diyafa',
    mealPlan: 'RO',
    stars: 3,
    seasons: [
      {
        range: '16 JUN 2026 TO 15 JUL 2026',
        prices: [
          { roomType: 'Double', price: 105 },
          { roomType: 'Triple', price: 120 },
          { roomType: 'Quad', price: 135 },
        ],
      },
      {
        range: '15 JUL 2026 TO 12 SEP 2026',
        prices: [
          { roomType: 'Double', price: 130 },
          { roomType: 'Triple', price: 145 },
          { roomType: 'Quad', price: 160 },
        ],
      },
      {
        range: '12 SEP 2026 TO 10 DEC 2026',
        prices: [
          { roomType: 'Double', price: 160 },
          { roomType: 'Triple', price: 175 },
          { roomType: 'Quad', price: 190 },
        ],
      },
      {
        range: '10 DEC 2026 TO 21 JAN 2027',
        prices: [
          { roomType: 'Double', price: 260 },
          { roomType: 'Triple', price: 275 },
          { roomType: 'Quad', price: 290 },
        ],
      },
      {
        range: '21 JAN 2027 TO 07 FEB 2027',
        prices: [
          { roomType: 'Double', price: 165 },
          { roomType: 'Triple', price: 180 },
          { roomType: 'Quad', price: 195 },
        ],
      },
    ],
  },
  {
    id: 'al-dewan-makkah',
    name: 'Al Dewan Hotel',
    city: 'Makkah',
    vendor: 'Emaar Al Diyafa',
    mealPlan: 'RO',
    stars: 3,
    seasons: [
      {
        range: '16 JUN 2026 TO 15 JUL 2026',
        prices: [
          { roomType: 'Double', price: 105 },
          { roomType: 'Triple', price: 120 },
          { roomType: 'Quad', price: 135 },
        ],
      },
      {
        range: '15 JUL 2026 TO 12 SEP 2026',
        prices: [
          { roomType: 'Double', price: 130 },
          { roomType: 'Triple', price: 145 },
          { roomType: 'Quad', price: 160 },
        ],
      },
      {
        range: '12 SEP 2026 TO 10 DEC 2026',
        prices: [
          { roomType: 'Double', price: 160 },
          { roomType: 'Triple', price: 175 },
          { roomType: 'Quad', price: 190 },
        ],
      },
      {
        range: '10 DEC 2026 TO 21 JAN 2027',
        prices: [
          { roomType: 'Double', price: 260 },
          { roomType: 'Triple', price: 275 },
          { roomType: 'Quad', price: 290 },
        ],
      },
      {
        range: '21 JAN 2027 TO 07 FEB 2027',
        prices: [
          { roomType: 'Double', price: 165 },
          { roomType: 'Triple', price: 180 },
          { roomType: 'Quad', price: 195 },
        ],
      },
    ],
  },
  {
    id: 'austorah-makkah',
    name: 'Austorah Hotel',
    city: 'Makkah',
    vendor: 'Emaar Al Diyafa',
    mealPlan: 'RO',
    stars: 3,
    seasons: [
      {
        range: '16 JUN 2026 TO 15 JUL 2026',
        prices: [
          { roomType: 'Double', price: 65 },
          { roomType: 'Triple', price: 80 },
          { roomType: 'Quad', price: 95 },
        ],
      },
      {
        range: '15 JUL 2026 TO 12 SEP 2026',
        prices: [
          { roomType: 'Double', price: 80 },
          { roomType: 'Triple', price: 95 },
          { roomType: 'Quad', price: 110 },
        ],
      },
      {
        range: '12 SEP 2026 TO 10 DEC 2026',
        prices: [
          { roomType: 'Double', price: 90 },
          { roomType: 'Triple', price: 105 },
          { roomType: 'Quad', price: 120 },
        ],
      },
      {
        range: '10 DEC 2026 TO 21 JAN 2027',
        prices: [
          { roomType: 'Double', price: 160 },
          { roomType: 'Triple', price: 175 },
          { roomType: 'Quad', price: 190 },
        ],
      },
      {
        range: '21 JAN 2027 TO 07 FEB 2027',
        prices: [
          { roomType: 'Double', price: 90 },
          { roomType: 'Triple', price: 105 },
          { roomType: 'Quad', price: 120 },
        ],
      },
    ],
  },
  {
    id: 'emaar-al-noor-makkah',
    name: 'Emaar Al Noor Hotel',
    city: 'Makkah',
    vendor: 'Emaar Al Diyafa',
    mealPlan: 'RO',
    stars: 3,
    seasons: [
      {
        range: '16 JUN 2026 TO 15 JUL 2026',
        prices: [
          { roomType: 'Double', price: 65 },
          { roomType: 'Triple', price: 80 },
          { roomType: 'Quad', price: 95 },
        ],
      },
      {
        range: '15 JUL 2026 TO 12 SEP 2026',
        prices: [
          { roomType: 'Double', price: 75 },
          { roomType: 'Triple', price: 90 },
          { roomType: 'Quad', price: 105 },
        ],
      },
      {
        range: '12 SEP 2026 TO 10 DEC 2026',
        prices: [
          { roomType: 'Double', price: 85 },
          { roomType: 'Triple', price: 100 },
          { roomType: 'Quad', price: 115 },
        ],
      },
      {
        range: '10 DEC 2026 TO 21 JAN 2027',
        prices: [
          { roomType: 'Double', price: 150 },
          { roomType: 'Triple', price: 165 },
          { roomType: 'Quad', price: 180 },
        ],
      },
      {
        range: '21 JAN 2027 TO 07 FEB 2027',
        prices: [
          { roomType: 'Double', price: 85 },
          { roomType: 'Triple', price: 100 },
          { roomType: 'Quad', price: 115 },
        ],
      },
    ],
  },
  {
    id: 'emaar-international-makkah',
    name: 'Emaar International Hotel',
    city: 'Makkah',
    vendor: 'Emaar Al Diyafa',
    mealPlan: 'RO',
    stars: 3,
    seasons: [
      {
        range: '12 SEP 2026 TO 10 DEC 2026',
        prices: [
          { roomType: 'Double', price: 75 },
          { roomType: 'Triple', price: 90 },
          { roomType: 'Quad', price: 105 },
        ],
      },
      {
        range: '10 DEC 2026 TO 21 JAN 2027',
        prices: [
          { roomType: 'Double', price: 120 },
          { roomType: 'Triple', price: 135 },
          { roomType: 'Quad', price: 150 },
        ],
      },
      {
        range: '21 JAN 2027 TO 07 FEB 2027',
        prices: [
          { roomType: 'Double', price: 85 },
          { roomType: 'Triple', price: 100 },
          { roomType: 'Quad', price: 115 },
        ],
      },
    ],
  },

  // Maysan Int. Group - Madinah
  {
    id: 'al-harithia-madinah',
    name: 'Al Harithia',
    city: 'Madinah',
    vendor: 'Maysan Int. Group',
    mealPlan: 'FB',
    stars: 5,
    seasons: [
      {
        range: '30 JUN 2026 TO 20 SEP 2026',
        prices: [
          { roomType: 'Double', price: 750 },
          { roomType: 'Triple', price: 900 },
          { roomType: 'Quad', price: 1050 },
          { roomType: 'Junior suite (2 Pax)', price: 1125 },
          { roomType: 'Executive Suite (2 Rooms 4 Pax)', price: 2250 },
        ],
      },
    ],
  },
  {
    id: 'grand-plaza-badr-almaqam-madinah',
    name: 'Grand Plaza Badr Almaqam',
    city: 'Madinah',
    vendor: 'Maysan Int. Group',
    mealPlan: 'FB',
    stars: 4,
    seasons: [
      {
        range: '30 JUN 2026 TO 20 SEP 2026',
        prices: [
          { roomType: 'Double', price: 520 },
          { roomType: 'Triple', price: 600 },
          { roomType: 'Quad', price: 680 },
        ],
      },
    ],
  },
  {
    id: 'shaza-regency-plaza-madinah',
    name: 'Shaza Regency Plaza',
    city: 'Madinah',
    vendor: 'Maysan Int. Group',
    mealPlan: 'FB',
    stars: 5,
    seasons: [
      {
        range: '30 JUN 2026 TO 20 SEP 2026',
        prices: [
          { roomType: 'Double', price: 500 },
          { roomType: 'Triple', price: 580 },
          { roomType: 'Quad', price: 660 },
        ],
      },
    ],
  },
  {
    id: 'grand-plaza-almadina-madinah',
    name: 'Grand Plaza Almadina',
    city: 'Madinah',
    vendor: 'Maysan Int. Group',
    mealPlan: 'FB',
    stars: 4,
    seasons: [
      {
        range: '30 JUN 2026 TO 20 SEP 2026',
        prices: [
          { roomType: 'Double', price: 480 },
          { roomType: 'Triple', price: 550 },
          { roomType: 'Quad', price: 620 },
        ],
      },
    ],
  },
  {
    id: 'maysan-rehab-elmysk-madinah',
    name: 'Maysan Rehab Elmysk',
    city: 'Madinah',
    vendor: 'Maysan Int. Group',
    mealPlan: 'FB',
    stars: 4,
    seasons: [
      {
        range: '30 JUN 2026 TO 20 SEP 2026',
        prices: [
          { roomType: 'Double', price: 430 },
          { roomType: 'Triple', price: 490 },
          { roomType: 'Quad', price: 550 },
        ],
      },
    ],
  },
  {
    id: 'arkan-almanar-madinah',
    name: 'Arkan Almanar',
    city: 'Madinah',
    vendor: 'Maysan Int. Group',
    mealPlan: 'FB',
    stars: 4,
    seasons: [
      {
        range: '30 JUN 2026 TO 20 SEP 2026',
        prices: [
          { roomType: 'Double', price: 430 },
          { roomType: 'Triple', price: 490 },
          { roomType: 'Quad', price: 550 },
        ],
      },
    ],
  },
  {
    id: 'maysan-altaqwa-madinah',
    name: 'Maysan Altaqwa',
    city: 'Madinah',
    vendor: 'Maysan Int. Group',
    mealPlan: 'FB',
    stars: 4,
    seasons: [
      {
        range: '30 JUN 2026 TO 20 SEP 2026',
        prices: [
          { roomType: 'Double', price: 360 },
          { roomType: 'Triple', price: 410 },
          { roomType: 'Quad', price: 460 },
        ],
      },
    ],
  },
  {
    id: 'plaza-inn-ohud-madinah',
    name: 'Plaza Inn Ohud',
    city: 'Madinah',
    vendor: 'Maysan Int. Group',
    mealPlan: 'FB',
    stars: 3,
    seasons: [
      {
        range: '30 JUN 2026 TO 20 SEP 2026',
        prices: [
          { roomType: 'Double', price: 335 },
          { roomType: 'Triple', price: 385 },
          { roomType: 'Quad', price: 435 },
        ],
      },
    ],
  }
];

let content = fs.readFileSync('src/data/hotels.ts', 'utf8');

// remove ]; at the end of defaultHotels array
content = content.replace(/ {2}\},\n\];\n\nexport const getHotels/, '  },\n' + newHotels.map(h => '  ' + JSON.stringify(h, null, 2).replace(/\n/g, '\n  ') + ',').join('\n') + '\n];\n\nexport const getHotels');

fs.writeFileSync('src/data/hotels.ts', content);
console.log('Done');
