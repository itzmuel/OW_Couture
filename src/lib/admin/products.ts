export type AdminProduct = {
  slug: string;
  name: string;
  code: string;
  category: string;
  collection: string;
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
  featured: boolean;
  archived: boolean;
};
