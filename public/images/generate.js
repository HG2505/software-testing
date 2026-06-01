const fs = require('fs');

const products = [
  {
    file: 'backpack.svg', label: 'Sauce Labs Backpack',
    bg: '#1a1a2e', accent: '#c8a96e', icon: `
      <rect x="130" y="140" width="140" height="170" rx="22" fill="#c8a96e" opacity="0.9"/>
      <rect x="155" y="110" width="90" height="45" rx="18" fill="none" stroke="#c8a96e" stroke-width="8"/>
      <rect x="148" y="190" width="104" height="8" rx="4" fill="#1a1a2e" opacity="0.4"/>
      <rect x="148" y="210" width="104" height="8" rx="4" fill="#1a1a2e" opacity="0.4"/>
      <circle cx="200" cy="225" r="12" fill="#1a1a2e" opacity="0.35"/>
    `
  },
  {
    file: 'bike-light.svg', label: 'Sauce Labs Bike Light',
    bg: '#0d2137', accent: '#4db8ff', icon: `
      <ellipse cx="200" cy="200" rx="60" ry="90" fill="#4db8ff" opacity="0.85"/>
      <ellipse cx="200" cy="200" rx="40" ry="65" fill="white" opacity="0.9"/>
      <ellipse cx="200" cy="200" rx="18" ry="28" fill="#ffee55"/>
      <rect x="180" y="290" width="40" height="14" rx="7" fill="#4db8ff" opacity="0.6"/>
      <rect x="180" y="110" width="40" height="14" rx="7" fill="#4db8ff" opacity="0.6"/>
      <!-- light rays -->
      <line x1="200" y1="115" x2="200" y2="80" stroke="#ffee55" stroke-width="3" opacity="0.5"/>
      <line x1="220" y1="125" x2="240" y2="95"  stroke="#ffee55" stroke-width="2" opacity="0.4"/>
      <line x1="180" y1="125" x2="160" y2="95"  stroke="#ffee55" stroke-width="2" opacity="0.4"/>
    `
  },
  {
    file: 'bolt-shirt.svg', label: 'Bolt T-Shirt',
    bg: '#1c1c1c', accent: '#f5a623', icon: `
      <path d="M110,130 L155,110 L175,145 L200,120 L225,145 L245,110 L290,130 L275,175 L240,165 L240,295 L160,295 L160,165 L125,175 Z"
            fill="#e8e8e8"/>
      <!-- bolt -->
      <polygon points="205,155 188,215 202,215 195,265 215,195 200,195 210,155"
               fill="#f5a623"/>
    `
  },
  {
    file: 'fleece-jacket.svg', label: 'Fleece Jacket',
    bg: '#1a0d2e', accent: '#9b59b6', icon: `
      <path d="M100,140 L155,110 L175,150 L160,155 L160,300 L240,300 L240,155 L225,150 L245,110 L300,140 L290,210 L265,205 L265,310 L135,310 L135,205 L110,210 Z"
            fill="#9b59b6" opacity="0.85"/>
      <!-- zipper -->
      <line x1="200" y1="155" x2="200" y2="300" stroke="white" stroke-width="3" opacity="0.5"/>
      <rect x="192" y="175" width="16" height="10" rx="3" fill="white" opacity="0.7"/>
      <!-- collar -->
      <path d="M175,150 Q200,175 225,150" fill="none" stroke="white" stroke-width="4" opacity="0.6"/>
    `
  },
  {
    file: 'onesie.svg', label: 'Sauce Labs Onesie',
    bg: '#2d0a0a', accent: '#e74c3c', icon: `
      <path d="M130,120 L175,105 L200,130 L225,105 L270,120 L255,175 L230,165 L230,220
               Q230,260 215,280 Q200,295 185,280 Q170,260 170,220
               L170,165 L145,175 Z"
            fill="#e74c3c" opacity="0.9"/>
      <!-- snaps -->
      <circle cx="185" cy="290" r="5" fill="white" opacity="0.8"/>
      <circle cx="200" cy="295" r="5" fill="white" opacity="0.8"/>
      <circle cx="215" cy="290" r="5" fill="white" opacity="0.8"/>
      <!-- collar -->
      <path d="M178,118 Q200,140 222,118" fill="none" stroke="white" stroke-width="3" opacity="0.6"/>
    `
  },
  {
    file: 'red-tshirt.svg', label: 'Test.allTheThings()',
    bg: '#0d1f0d', accent: '#27ae60', icon: `
      <path d="M110,140 L155,115 L175,150 L160,158 L160,295 L240,295 L240,158 L225,150 L245,115 L290,140 L275,185 L248,178 L248,305 L152,305 L152,178 L125,185 Z"
            fill="#27ae60" opacity="0.85"/>
      <!-- text on shirt -->
      <text x="200" y="225" text-anchor="middle" font-family="monospace" font-size="15"
            fill="white" opacity="0.95" font-weight="bold">test.all</text>
      <text x="200" y="245" text-anchor="middle" font-family="monospace" font-size="15"
            fill="white" opacity="0.95" font-weight="bold">TheThings()</text>
    `
  },
];

const W = 400, H = 500;

products.forEach(({ file, label, bg, accent, icon }) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <!-- background -->
  <rect width="${W}" height="${H}" fill="${bg}"/>
  <!-- subtle grid pattern -->
  <pattern id="grid" width="32" height="32" patternUnits="userSpaceOnUse">
    <path d="M32 0L0 0 0 32" fill="none" stroke="${accent}" stroke-width="0.3" opacity="0.15"/>
  </pattern>
  <rect width="${W}" height="${H}" fill="url(#grid)"/>
  <!-- glow circle behind product -->
  <radialGradient id="glow" cx="50%" cy="50%" r="40%">
    <stop offset="0%" stop-color="${accent}" stop-opacity="0.18"/>
    <stop offset="100%" stop-color="${accent}" stop-opacity="0"/>
  </radialGradient>
  <ellipse cx="200" cy="210" rx="160" ry="160" fill="url(#glow)"/>
  <!-- product illustration -->
  ${icon}
  <!-- brand strip at bottom -->
  <rect x="0" y="430" width="${W}" height="70" fill="${accent}" opacity="0.1"/>
  <line x1="0" y1="430" x2="${W}" y2="430" stroke="${accent}" stroke-width="1" opacity="0.3"/>
  <text x="200" y="458" text-anchor="middle" font-family="Georgia,serif"
        font-size="15" fill="${accent}" font-weight="bold" opacity="0.95">${label}</text>
  <text x="200" y="480" text-anchor="middle" font-family="sans-serif"
        font-size="11" fill="${accent}" opacity="0.5" letter-spacing="3">SAUCE LABS</text>
</svg>`;
  fs.writeFileSync(file, svg);
  console.log(`✓ ${file}`);
});
