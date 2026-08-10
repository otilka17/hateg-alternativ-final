export type PachetItem = {
  n: string;
  d: string;
  includes: string[];
  p: number;
  ico: string;
  tag?: string;
  saves?: number;
};

export const PACHETE: PachetItem[] = [
  {
    n: "Pachetul de drum",
    d: "Tot ce îți trebuie pentru o oprire scurtă și satisfăcătoare. Un sandwich cald, o cafea bună și ceva dulce pentru drum.",
    includes: ["1 sandwich la alegere", "1 cafea la alegere", "1 fursec de casă"],
    p: 35,
    ico: "🎒",
    saves: 7,
    tag: "Popular",
  },
  {
    n: "Pachet familie",
    d: "Pentru tot echipajul din mașină. Patru sandwich-uri calde și două limonade proaspete — hrăniți toți, fericiti toți.",
    includes: ["4 sandwich-uri la alegere", "2 limonade la alegere"],
    p: 79,
    ico: "👨‍👩‍👧",
    saves: 9,
  },
  {
    n: "Pachetul dulce",
    d: "O selecție din prăjiturile noastre de casă — pentru cei cu un ochi pe desert. Tiramisu, cheesecake și fursecuri cu ovăz.",
    includes: ["1 tiramisu", "1 cheesecake la pahar", "3 fursecuri de casă"],
    p: 34,
    ico: "🍰",
    saves: 4,
  },
  {
    n: "Borcan & Cafea",
    d: "Duc-te acasă cu ceva bun. Un borcan din producția noastră și o cafea de specialitate pentru momentul ăla liniștit.",
    includes: ["1 borcan la alegere", "1 cafea la alegere"],
    p: 36,
    ico: "☕",
    saves: 4,
    tag: "Nou",
  },
  {
    n: "Pachetul de sănătate",
    d: "Energie curată pentru zi. Un fresh stors pe loc, o doză de sănătate cu fructe & legume și semințe chia.",
    includes: ["1 fresh la alegere", "1 doză Fructe & Legume", "1 Chia cu ovăz"],
    p: 38,
    ico: "🌿",
    saves: 6,
  },
  {
    n: "Cina de seară",
    d: "Două sandwich-uri calde, două limonade și două deserturi de casă. Seara asta gătești tu.",
    includes: ["2 sandwich-uri la alegere", "2 limonade la alegere", "2 deserturi la alegere"],
    p: 82,
    ico: "🌙",
    saves: 14,
    tag: "Valoare",
  },
];
