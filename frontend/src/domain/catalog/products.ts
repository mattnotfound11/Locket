import type { Product } from './types';

/** Prices are centavos. ₱95.00 is 9500. */
export const PRODUCTS: readonly Product[] = [
  // ---------------------------------------------------------------- cookies
  {
    id: 'ckl-001', slug: 'classic-chocolate-chunk', name: 'Classic Chocolate Chunk',
    category: 'cookies', price: 9500, unit: 'per piece',
    description: 'Browned butter, dark 58% chunks, a flake of sea salt. Pulled while the centre is still soft.',
    image: '/products/classic-chocolate-chunk.webp',
    allergens: ['gluten', 'dairy', 'eggs', 'soy'], dietary: ['vegetarian', 'nut-free'],
    bestseller: true,
  },
  {
    id: 'ckl-002', slug: 'double-dark-chunk', name: 'Double Dark Chunk',
    category: 'cookies', price: 11000, unit: 'per piece',
    description: 'Cocoa dough folded with two kinds of dark chocolate. Fudgy the whole way through.',
    image: '/products/double-dark-chunk.webp',
    allergens: ['gluten', 'dairy', 'eggs', 'soy'], dietary: ['vegetarian', 'nut-free'],
  },
  {
    id: 'ckl-003', slug: 'cereal-treat-cakesicles', name: 'Cereal Treat Cakesicles',
    category: 'cookies', price: 13500, unit: 'per piece',
    description: 'Toasted rice and marshmallow on a stick, dipped in couverture and showered with sprinkles.',
    image: '/products/cereal-treat-cakesicles.webp',
    allergens: ['gluten', 'dairy', 'soy'], dietary: ['vegetarian', 'eggless', 'nut-free'],
    prepacked: {
      servingSize: '1 bar (62 g)', servingsPerPack: 1, calories: 248, fatG: 9.4,
      saturatedFatG: 5.8, carbsG: 39.2, sugarsG: 24.6, proteinG: 2.1, sodiumMg: 143,
      ingredients:
        'Toasted rice cereal (rice, sugar, salt, malt extract), marshmallow (glucose syrup, sugar, gelatine), ' +
        'butter, couverture chocolate (cocoa mass, sugar, cocoa butter, soy lecithin), sugar sprinkles ' +
        '(sugar, cornstarch, vegetable oil, colours).',
      shelfLife: 'Best within 7 days, stored below 25°C away from direct sun.',
    },
  },
  // --------------------------------------------------------------- cupcakes
  {
    id: 'cup-001', slug: 'cotton-candy-swirl', name: 'Cotton Candy Swirl',
    category: 'cupcakes', price: 13500, unit: 'per piece',
    description: 'Vanilla bean sponge under a two-tone swirl. The one everybody photographs.',
    image: '/products/cotton-candy-swirl.webp',
    allergens: ['gluten', 'dairy', 'eggs'], dietary: ['vegetarian', 'nut-free'],
    bestseller: true,
  },
  {
    id: 'cup-002', slug: 'strawberry-cream-cupcake', name: 'Strawberry Cream',
    category: 'cupcakes', price: 14500, unit: 'per piece',
    description: 'Baguio strawberry compote folded into Swiss meringue buttercream, on a butter sponge.',
    image: '/products/strawberry-cream-cupcake.webp',
    allergens: ['gluten', 'dairy', 'eggs'], dietary: ['vegetarian', 'nut-free'],
  },
  {
    id: 'cup-003', slug: 'devils-chocolate-cupcake', name: "Devil's Chocolate",
    category: 'cupcakes', price: 14500, unit: 'per piece',
    description: 'Dark cocoa crumb, whipped chocolate ganache, cocoa nib crunch on top.',
    image: '/products/devils-chocolate-cupcake.webp',
    allergens: ['gluten', 'dairy', 'eggs', 'soy'], dietary: ['vegetarian', 'nut-free'],
  },
  {
    id: 'cup-004', slug: 'funfetti-cupcake', name: 'Funfetti',
    category: 'cupcakes', price: 12500, unit: 'per piece',
    description: 'Sprinkles through the batter and over the top. Standard issue at every birthday we cater.',
    image: '/products/funfetti-cupcake.webp',
    allergens: ['gluten', 'dairy', 'eggs'], dietary: ['vegetarian', 'nut-free'],
  },
  {
    id: 'cup-005', slug: 'mint-fudge-cupcake', name: 'Mint Fudge',
    category: 'cupcakes', price: 14500, unit: 'per piece',
    description: 'Fudge base with peppermint buttercream and a dark chocolate button.',
    image: '/products/mint-fudge-cupcake.webp',
    allergens: ['gluten', 'dairy', 'eggs', 'soy'], dietary: ['vegetarian', 'nut-free'],
    soldOut: true,
  },
  // ------------------------------------------------------------------ cakes
  {
    id: 'cak-001', slug: 'ube-macapuno-slice', name: 'Ube Macapuno Slice',
    category: 'cakes', price: 19500, unit: 'per slice',
    description: 'Real purple yam from Quezon, layered with macapuno strings and coconut cream cheese.',
    image: '/products/ube-macapuno-slice.webp',
    allergens: ['gluten', 'dairy', 'eggs', 'coconut'], dietary: ['vegetarian', 'nut-free'],
    bestseller: true,
  },
  {
    id: 'cak-002', slug: 'chocolate-drip-cake', name: 'Chocolate Drip Cake',
    category: 'cakes', price: 165000, unit: '7 inch, serves 12',
    description: 'Four layers of chocolate sponge, dark ganache drip, piped shell border.',
    image: '/products/chocolate-drip-cake.webp',
    allergens: ['gluten', 'dairy', 'eggs', 'soy'], dietary: ['vegetarian', 'nut-free'],
    leadTimeDays: 2,
  },
  {
    id: 'cak-003', slug: 'confetti-celebration-cake', name: 'Confetti Celebration Cake',
    category: 'cakes', price: 178000, unit: '7 inch, serves 12',
    description: 'Rainbow layers under a sprinkle-crusted shell. Cut it and the table makes a noise.',
    image: '/products/confetti-celebration-cake.webp',
    allergens: ['gluten', 'dairy', 'eggs'], dietary: ['vegetarian', 'nut-free'],
    leadTimeDays: 2,
  },
  // ------------------------------------------------------------- tarts, pies
  {
    id: 'trt-001', slug: 'lemon-meringue-tart', name: 'Lemon Meringue Tart',
    category: 'tarts-pies', price: 18500, unit: 'per slice',
    description: 'Sharp lemon curd in butter pastry, torched Italian meringue on top.',
    image: '/products/lemon-meringue-tart.webp',
    allergens: ['gluten', 'dairy', 'eggs'], dietary: ['vegetarian', 'nut-free'],
  },
  {
    id: 'trt-002', slug: 'mini-fruit-tartlets', name: 'Mini Fruit Tartlets',
    category: 'tarts-pies', price: 39500, unit: 'box of 6',
    description: 'Vanilla crème pâtissière in sweet pastry, topped with whatever came in that morning.',
    image: '/products/mini-fruit-tartlets.webp',
    allergens: ['gluten', 'dairy', 'eggs'], dietary: ['vegetarian', 'nut-free'],
    leadTimeDays: 1,
  },
  {
    id: 'trt-003', slug: 'lattice-apple-pie', name: 'Lattice Apple Pie',
    category: 'tarts-pies', price: 89500, unit: '8 inch, serves 8',
    description: 'Cinnamon apples under a hand-woven lattice, brushed with egg and demerara.',
    image: '/products/lattice-apple-pie.webp',
    allergens: ['gluten', 'dairy', 'eggs'], dietary: ['vegetarian', 'nut-free'],
    leadTimeDays: 1,
  },
  // ------------------------------------------------------------------ chilled
  {
    id: 'chl-001', slug: 'strawberry-panna-cotta', name: 'Strawberry Panna Cotta',
    category: 'chilled', price: 17500, unit: 'per jar',
    description: 'Vanilla cream set soft, with macerated strawberries spooned over. Served in glass.',
    image: '/products/strawberry-panna-cotta.webp',
    allergens: ['dairy'], dietary: ['vegetarian', 'gluten-free', 'nut-free', 'eggless'],
  },
  {
    id: 'chl-002', slug: 'brownie-sundae', name: 'Brownie Sundae',
    category: 'chilled', price: 22500, unit: 'per serving',
    description: 'Warm fudge brownie, vanilla bean ice cream, salted caramel poured just before it goes out.',
    image: '/products/brownie-sundae.webp',
    allergens: ['gluten', 'dairy', 'eggs', 'soy'], dietary: ['vegetarian', 'nut-free'],
  },
  {
    id: 'chl-003', slug: 'berry-cream-crepe', name: 'Berry Cream Crepe',
    category: 'chilled', price: 19500, unit: 'per serving',
    description: 'Thin crepes folded around chantilly, with berries and a dusting of icing sugar.',
    image: '/products/berry-cream-crepe.webp',
    allergens: ['gluten', 'dairy', 'eggs'], dietary: ['vegetarian', 'nut-free'],
  },
  {
    id: 'chl-004', slug: 'belgian-waffle-stack', name: 'Belgian Waffle Stack',
    category: 'chilled', price: 21500, unit: 'per serving',
    description: 'Pearl sugar waffles with raspberries and cream. Only until the batter runs out.',
    image: '/products/belgian-waffle-stack.webp',
    allergens: ['gluten', 'dairy', 'eggs'], dietary: ['vegetarian', 'nut-free'],
    soldOut: true,
  },
  {
    id: 'chl-005', slug: 'truffle-gift-box', name: 'Truffle Gift Box',
    category: 'chilled', price: 78500, unit: 'box of 12',
    description: 'Twelve hand-rolled ganache truffles in a ribboned tin. Sealed, so it travels.',
    image: '/products/truffle-gift-box.webp',
    allergens: ['dairy', 'soy', 'tree-nuts', 'sulphites'], dietary: ['vegetarian', 'gluten-free'],
    prepacked: {
      servingSize: '2 truffles (24 g)', servingsPerPack: 6, calories: 132, fatG: 8.9,
      saturatedFatG: 5.5, carbsG: 12.4, sugarsG: 11.1, proteinG: 1.3, sodiumMg: 18,
      ingredients:
        'Couverture chocolate (cocoa mass, sugar, cocoa butter, soy lecithin), double cream, butter, ' +
        'invert sugar, hazelnut praline (hazelnuts, sugar), cocoa powder, natural vanilla extract, ' +
        'preservative (potassium sorbate), antioxidant (sulphites).',
      shelfLife: 'Best within 14 days. Keep chilled between 4°C and 8°C.',
    },
  },
];

export const PRODUCT_BY_SLUG: Readonly<Record<string, Product>> =
  Object.fromEntries(PRODUCTS.map((p) => [p.slug, p]));

export const PRODUCT_BY_ID: Readonly<Record<string, Product>> =
  Object.fromEntries(PRODUCTS.map((p) => [p.id, p]));
