// Shared visual tokens for marketing pages.

/** Rotating colourful gradients for icon tiles (brand green + supporting food colours). */
export const TILE_GRADIENTS = [
  "linear-gradient(135deg, hsl(150 55% 30%), hsl(150 50% 44%))", // food green
  "linear-gradient(135deg, hsl(28 85% 52%), hsl(38 92% 60%))", // turmeric orange
  "linear-gradient(135deg, hsl(340 62% 46%), hsl(350 75% 62%))", // berry
  "linear-gradient(135deg, hsl(185 70% 30%), hsl(178 58% 42%))", // teal
  "linear-gradient(135deg, hsl(42 88% 44%), hsl(48 95% 56%))", // mustard
  "linear-gradient(135deg, hsl(215 60% 38%), hsl(208 72% 54%))", // blue
];

export const tileStyle = (i: number) => ({ background: TILE_GRADIENTS[i % TILE_GRADIENTS.length] });

// Free-to-use photos from Unsplash (unsplash.com/license).
const u = (id: string) => `https://images.unsplash.com/photo-${id}?w=640&h=400&q=70&auto=format&fit=crop`;

export const IMAGES = {
  fruits: u("1610832958506-aa56368176cf"),
  grains: u("1586201375761-83865001e31c"),
  dairy: u("1550583724-b2692b85b150"),
  meat: u("1607623814075-e51df1bdc82f"),
  coffee: u("1495474472287-4d71bcdd2085"),
  spices: u("1596040033229-a9821ebd058d"),
  bakery: u("1509440159596-0249088772ff"),
  packaged: u("1621939514649-280e2ee25f60"),
  healthy: u("1512621776951-a57141f2eefd"),
  lab: u("1532187863486-abf9dbad1b69"),
  retail: u("1601598851547-4302969d0614"),
  factory: u("1581091226825-a6a2a5aee158"),
  design: u("1561070791-2526d30994b5"),
  kitchen: u("1556910103-1c02745aae4d"),
  warehouse: u("1586528116311-ad8dd3c8310d"),
  meeting: u("1552664730-d307ca884978"),
  farm: u("1500937386664-56d1dfef3854"),
  samosa: u("1601050690597-df0568f70950"),
  trucks: u("1565793298595-6a879b1d9492"),
  dishes: u("1504674900247-0877df9cc836"),
  produce: u("1542838132-92c53300491e"),
};

const CATEGORY_IMAGES: Record<string, string> = {
  "fresh-produce": IMAGES.fruits,
  "grains-pulses-cereals": IMAGES.grains,
  "dairy-alternatives": IMAGES.dairy,
  "meat-poultry-seafood": IMAGES.meat,
  beverages: IMAGES.coffee,
  "oils-fats-spices": IMAGES.spices,
  "bakery-confectionery-snacks": IMAGES.bakery,
  "packaged-processed-foods": IMAGES.packaged,
  "health-organic-specialty": IMAGES.healthy,
  "food-ingredients-additives": IMAGES.lab,
  "packaging-allied": IMAGES.warehouse,
  "cold-chain-logistics": IMAGES.trucks,
  "food-processing-machinery": IMAGES.factory,
  "branding-marketing-design": IMAGES.design,
  "horeca-institutional-supplies": IMAGES.kitchen,
  "private-label": IMAGES.retail,
  "consultants-contractors-solution-providers": IMAGES.meeting,
  "agri-farm-supplies": IMAGES.farm,
  "indian-snacks-sweets": IMAGES.samosa,
  "used-equipment-buy-and-sell": IMAGES.factory,
};

export const categoryImage = (slug: string) => CATEGORY_IMAGES[slug] ?? IMAGES.dishes;
