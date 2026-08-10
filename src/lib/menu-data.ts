export type MenuItem = {
  n: string;
  d: string;
  p: number;
  kcal?: number;
  ing?: string[];
  img?: string;
  oldPrice?: number;
  badge?: string;
};

export type ComboItem = {
  n: string;
  d: string;
  p: number;
  ico: string;
  img?: string;
};

export type JarItem = {
  n: string;
  d: string;
  ico: string;
  p?: number;
  img?: string;
};

export const CAFEA: MenuItem[] = [
  { n: "Espresso", d: "Shot intens, corp plin.", p: 8, kcal: 5 },
  { n: "Espresso lung", d: "Espresso alungit, mai blând.", p: 9, kcal: 5 },
  { n: "Cappuccino", d: "Espresso, lapte cald și spumă cremoasă.", p: 12, kcal: 90 },
  { n: "Caffè latte", d: "Mult lapte catifelat peste un shot rotund.", p: 14, kcal: 120 },
];

export const SPEC: MenuItem[] = [
  { n: "Tiramisu Cappuccino", d: "Cappuccino cu note de tiramisu, pudrat cu cacao.", p: 18, kcal: 130 },
  { n: "Dolce Truffle Cappuccino", d: "Cremos, cu aromă fină de trufă dulce.", p: 17, kcal: 125 },
  { n: "Salted Caramel Mocha", d: "Cafea, ciocolată și caramel sărat.", p: 17, kcal: 200 },
  { n: "Hazelnut Affogato", d: "Espresso turnat peste înghețată, cu alună.", p: 16, kcal: 180 },
  { n: "Iced Rosemary Latte", d: "Latte rece cu sirop de rozmarin.", p: 15, kcal: 110 },
  { n: "Fizzy Iced Peach", d: "Cafea rece, acidulată, cu piersică.", p: 15, kcal: 95 },
];

export const LIM: MenuItem[] = [
  { n: "Citronadă", d: "Lămâie proaspătă, stoarsă pe loc.", p: 12, kcal: 60 },
  { n: "Limonadă de mentă", d: "Lămâie și mentă proaspătă.", p: 12, kcal: 65 },
  { n: "Fusion (cu sirop)", d: "Limonadă cu sirop de fructe, după zi.", p: 14, kcal: 80 },
  { n: "Limonadă cu fructe de pădure", d: "Cu fructe de pădure proaspete.", p: 15, kcal: 75 },
  { n: "Fresh de portocale", d: "Stors pe loc, 100% portocale.", p: 14, kcal: 110 },
];

export const SANATATE: MenuItem[] = [
  { n: "Fructe & Legume", d: "Băutură vie, stoarsă din fructe și legume — sortiment de sezon.", p: 16, kcal: 90 },
  { n: "Chia cu ovăz", d: "Gustare hrănitoare, cu semințe de chia.", p: 14, kcal: 220 },
];

export const SAND: MenuItem[] = [
  { n: "Nobil", d: "Somon afumat, legume crocante, sos fin, ciabatta caldă.", p: 26, kcal: 420, ing: ["Somon afumat", "Salată", "Castraveți", "Sos fin"] },
  { n: "Pădurenesc", d: "Piept de pui la grill, ciuperci, rucola, sos de muștar, ciabatta caldă.", p: 22, kcal: 370, ing: ["Pui la grill", "Ciuperci", "Rucola", "Sos de muștar"] },
  { n: "Acasă", d: "Piept de pui la grill, salată, sos de casă, pâine cu maia.", p: 21, kcal: 360, ing: ["Pui la grill", "Salată", "Roșii", "Sos de casă"] },
  { n: "Rustic", d: "Jambon, cașcaval, ciabatta caldă — ca acasă.", p: 19, kcal: 340, ing: ["Jambon", "Cașcaval"] },
  { n: "Bunătate", d: "Chiftea de casă, legume murate, sos, ciabatta.", p: 18, kcal: 310, ing: ["Chiftea de casă", "Legume murate", "Sos"] },
];

// Sandwich names used for promo detection
export const SANDWICH_NAMES = SAND.map((s) => s.n.toLowerCase());

export const DULCE: MenuItem[] = [
  { n: "Griș cu lapte", d: "Cremos, de casă, cu dulceață.", p: 12, kcal: 180 },
  { n: "Orez cu lapte", d: "Cremos, de casă, ca la mama acasă.", p: 12, kcal: 190 },
  { n: "Cheesecake", d: "Fin și catifelat, la pahar.", p: 16, kcal: 280 },
  { n: "Tiramisu", d: "Clasic italian, sigilat to-go.", p: 16, kcal: 310 },
  { n: "Fursecuri de casă cu ovăz", d: "Măr-scorțișoară · ciocolată · carrot cake.", p: 6, kcal: 120 },
];

export const COMBO: ComboItem[] = [
  { n: "Pachetul de drum", d: "Un sandwich la alegere + o cafea + un fursec. Gata de plecare.", p: 35, ico: "🎒" },
  { n: "Pachet familie", d: "4 sandwich-uri + 2 limonade. Pentru tot echipajul din mașină.", p: 79, ico: "👨‍👩‍👧" },
];

export const JARS: JarItem[] = [
  { n: "Zacuscă Metanoia", d: "Rețeta veche a familiei, 300g. Produs cu suflet.", ico: "🫙", p: 22 },
  { n: "Dulceață de casă", d: "Din fructe de sezon, 250g — căpșuni · afine · măceșe · prune.", ico: "🍯", p: 18 },
  { n: "Bulion de grădină", d: "Roșii pasate, gros și aromat, 720g.", ico: "🥫", p: 16 },
];

export type CartItem = {
  id: string;
  name: string;
  price: number;
  qty: number;
};
