export type Product = {
  slug: string;
  name: string;
  code: string;
  category: "Eveningwear" | "Bridal" | "RTW";
  collection: "Wedding Dresses" | "RTW Collection" | "Bridesmaids & Evening";
  tagline: string;
  description: string;
  priceFrom: string;
  leadTime: string;
  appointmentType: string;
  image: string;
  palette: string;
  materials: string[];
  madeFor: string[];
  highlights: string[];
  featured?: boolean;
};

export const products: Product[] = [
  {
    slug: "sculpted-satin-set",
    name: "Sculpted Satin Set",
    code: "OW-EVE-014",
    category: "Eveningwear",
    collection: "Bridesmaids & Evening",
    tagline: "Fluid movement with a precise waist and sharp shoulder line.",
    description:
      "A made-to-order evening set cut in satin-backed crepe, designed for gallery evenings, private dinners, and event dressing that needs structure without stiffness.",
    priceFrom: "$1,450",
    leadTime: "4 to 6 weeks",
    appointmentType: "Private studio fitting",
    image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=900&q=80",
    palette: "linear-gradient(135deg, #ead6cb 0%, #f7efe7 55%, #c6937b 100%)",
    materials: ["Satin-backed crepe", "Silk lining", "Hand-finished hem"],
    madeFor: ["Evening events", "Editorial styling", "Custom color adaptations"],
    highlights: ["Contoured waist seam", "Soft drape trouser", "Optional detachable sleeve"],
    featured: true,
  },
  {
    slug: "pearl-column-gown",
    name: "Pearl Column Gown",
    code: "OW-WED-001",
    category: "Bridal",
    collection: "Wedding Dresses",
    tagline: "A minimal bridal silhouette with luminous texture and clean lines.",
    description:
      "This column gown is built for intimate ceremonies and reception changes, balancing sharp structure through the bodice with a fluid skirt and pearl-detailed back.",
    priceFrom: "$2,200",
    leadTime: "6 to 8 weeks",
    appointmentType: "Bridal consultation",
    image: "https://images.unsplash.com/photo-1594552072238-b8a33785b261?auto=format&fit=crop&w=900&q=80",
    palette: "linear-gradient(135deg, #f6f2ee 0%, #fffaf5 50%, #decdbf 100%)",
    materials: ["Matte satin", "Pearl fastening", "Silk organza support"],
    madeFor: ["Civil ceremonies", "Reception look", "Bridal capsule styling"],
    highlights: ["Pearl back detail", "Internal corsetry", "Custom train options"],
    featured: true,
  },
  {
    slug: "midnight-tux-dress",
    name: "Midnight Tux Dress",
    code: "OW-RTW-008",
    category: "RTW",
    collection: "RTW Collection",
    tagline: "A sharp crossover between suiting discipline and dress movement.",
    description:
      "A tailored tux-inspired dress with satin lapels, a sculpted shoulder, and a hemline designed to move cleanly between formal events and after-dark occasions.",
    priceFrom: "$1,680",
    leadTime: "4 to 5 weeks",
    appointmentType: "Tailoring consultation",
    image: "https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=900&q=80",
    palette: "linear-gradient(135deg, #2a2425 0%, #63514f 40%, #d4b6a1 100%)",
    materials: ["Wool barathea", "Satin facing", "Cupro lining"],
    madeFor: ["Black-tie dressing", "Press events", "Personal wardrobe commissions"],
    highlights: ["Peak lapel neckline", "Wrapped skirt front", "Internal waist stay"],
    featured: true,
  },
  {
    slug: "soft-rose-corset",
    name: "Soft Rose Corset",
    code: "OW-EVE-031",
    category: "Eveningwear",
    collection: "Bridesmaids & Evening",
    tagline: "A lighter occasion piece with structure hidden beneath soft drape.",
    description:
      "Designed as a versatile separate, this corset pairs with skirts or tailored trousers and is fitted to the client through a guided measurement and alteration process.",
    priceFrom: "$860",
    leadTime: "3 to 4 weeks",
    appointmentType: "Virtual or studio fitting",
    image: "https://images.unsplash.com/photo-1520854221256-17451cc331bf?auto=format&fit=crop&w=1200&q=80",
    palette: "linear-gradient(135deg, #efd7d4 0%, #fbf3ef 52%, #d6a89d 100%)",
    materials: ["Silk faille", "Boning channels", "Soft cotton lining"],
    madeFor: ["Occasion separates", "Layered styling", "Wardrobe updates"],
    highlights: ["Hidden structure", "Adjustable lace back", "Optional matching skirt"],
  },
  {
    slug: "atelier-trouser-suit",
    name: "Atelier Trouser Suit",
    code: "OW-RTW-022",
    category: "RTW",
    collection: "RTW Collection",
    tagline: "Relaxed authority through custom proportions and precise finishing.",
    description:
      "A two-piece suit cut to the client with a softened shoulder, elongated line, and optional waist shaping for event dressing, editorial use, or modern bridal alternatives.",
    priceFrom: "$1,920",
    leadTime: "5 to 7 weeks",
    appointmentType: "Tailoring consultation",
    image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80",
    palette: "linear-gradient(135deg, #d7d1cb 0%, #f7f2ed 54%, #9f8f86 100%)",
    materials: ["Italian suiting wool", "Cupro lining", "Horn-effect buttons"],
    madeFor: ["Modern bridal", "Wardrobe foundations", "Power dressing"],
    highlights: ["Extended jacket line", "Single-pleat trouser", "Multiple fit passes"],
  },
  {
    slug: "silk-veil-cape",
    name: "Silk Veil Cape",
    code: "OW-WED-012",
    category: "Bridal",
    collection: "Wedding Dresses",
    tagline: "A lightweight overlay that adds ceremony without overwhelming the look.",
    description:
      "This cape is designed for pairing with gowns, column dresses, and structured separates, adding movement and presence while keeping the silhouette clean and minimal.",
    priceFrom: "$640",
    leadTime: "2 to 3 weeks",
    appointmentType: "Bridal consultation",
    image: "https://images.unsplash.com/photo-1525258946800-98cfd641d0de?auto=format&fit=crop&w=900&q=80",
    palette: "linear-gradient(135deg, #f9f4ef 0%, #fffdf9 55%, #e8dacc 100%)",
    materials: ["Silk tulle", "Rolled edges", "Discrete fastening"],
    madeFor: ["Ceremony styling", "Layered bridal looks", "Editorial bridal shoots"],
    highlights: ["Air-light finish", "Optional pearl trim", "Pairs with custom gowns"],
  },
];

export function getProductBySlug(slug: string) {
  return products.find((product) => product.slug === slug);
}

export function getFeaturedProducts() {
  return products.filter((product) => product.featured);
}

export function getProductsByCollection(collection: Product["collection"]) {
  return products.filter((product) => product.collection === collection);
}