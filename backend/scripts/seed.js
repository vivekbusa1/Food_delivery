/* eslint-disable no-console */
require('dotenv').config();
const mongoose = require('mongoose');
const config = require('../src/config');

const User = require('../src/models/User');
const Restaurant = require('../src/models/Restaurant');
const RestaurantCategory = require('../src/models/RestaurantCategory');
const RestaurantTiming = require('../src/models/RestaurantTiming');
const FoodCategory = require('../src/models/FoodCategory');
const Food = require('../src/models/Food');
const FoodVariant = require('../src/models/FoodVariant');
const Addon = require('../src/models/Addon');
const Coupon = require('../src/models/Coupon');
const Banner = require('../src/models/Banner');
const Offer = require('../src/models/Offer');
const Wallet = require('../src/models/Wallet');
const Setting = require('../src/models/Setting');
const DeliveryPartner = require('../src/models/DeliveryPartner');

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

const connect = async () => {
  if (!config.mongoUrl) {
    throw new Error('MONGODB_URL is not defined. Please set it in your .env file before seeding.');
  }
  await mongoose.connect(config.mongoUrl);
  console.log(`Connected to MongoDB: ${mongoose.connection.name}`);
};

const clearCollections = async () => {
  console.log('Clearing existing data...');
  await Promise.all([
    User.deleteMany({ email: { $ne: config.admin.email } }),
    Restaurant.deleteMany({}),
    RestaurantCategory.deleteMany({}),
    RestaurantTiming.deleteMany({}),
    FoodCategory.deleteMany({}),
    Food.deleteMany({}),
    FoodVariant.deleteMany({}),
    Addon.deleteMany({}),
    Coupon.deleteMany({}),
    Banner.deleteMany({}),
    Offer.deleteMany({}),
    DeliveryPartner.deleteMany({}),
    Wallet.deleteMany({}),
    Setting.deleteMany({}),
  ]);
  await User.deleteMany({ email: config.admin.email });

  // Drop legacy unique indexes that treated null as a value (E11000 on seed).
  try {
    await Wallet.collection.dropIndexes();
  } catch (err) {
    if (err.code !== 26) throw err; // 26 = NamespaceNotFound
  }
  await Wallet.syncIndexes();
};

const seedAdmin = async () => {
  const admin = await User.create({
    name: 'Super Admin',
    email: config.admin.email,
    phone: '9999999999',
    password: config.admin.password,
    role: 'admin',
    isEmailVerified: true,
    isPhoneVerified: true,
  });

  await Wallet.create({ ownerType: 'user', user: admin._id, balance: 0 });

  console.log(`Admin created: ${admin.email} / ${config.admin.password}`);
  return admin;
};

const seedRestaurantCategories = async () => {
  const categories = await RestaurantCategory.insertMany([
    { name: 'Fast Food', slug: 'fast-food', order: 1 },
    { name: 'North Indian', slug: 'north-indian', order: 2 },
    { name: 'South Indian', slug: 'south-indian', order: 3 },
    { name: 'Chinese', slug: 'chinese', order: 4 },
    { name: 'Desserts', slug: 'desserts', order: 5 },
    { name: 'Pizza', slug: 'pizza', order: 6 },
  ]);

  console.log(`Seeded ${categories.length} restaurant categories`);
  return categories;
};

const seedFoodCategories = async () => {
  const categories = await FoodCategory.insertMany([
    { name: 'Starters', slug: 'starters', isGlobal: true, order: 1 },
    { name: 'Main Course', slug: 'main-course', isGlobal: true, order: 2 },
    { name: 'Breads', slug: 'breads', isGlobal: true, order: 3 },
    { name: 'Rice & Biryani', slug: 'rice-biryani', isGlobal: true, order: 4 },
    { name: 'Desserts', slug: 'desserts', isGlobal: true, order: 5 },
    { name: 'Beverages', slug: 'beverages', isGlobal: true, order: 6 },
    { name: 'Pizza', slug: 'pizza', isGlobal: true, order: 7 },
    { name: 'Burgers', slug: 'burgers', isGlobal: true, order: 8 },
  ]);

  console.log(`Seeded ${categories.length} food categories`);
  return categories;
};

const createRestaurantOwner = async (index) => {
  const owner = await User.create({
    name: `Restaurant Owner ${index}`,
    email: `owner${index}@fooddelivery.com`,
    phone: `900000000${index}`,
    password: 'Owner@123',
    role: 'restaurant',
    isEmailVerified: true,
    isPhoneVerified: true,
  });

  await Wallet.create({ ownerType: 'user', user: owner._id, balance: 0 });
  return owner;
};

const seedRestaurantWithFoods = async ({ index, name, cuisines, categoryIds, foodCategoryIds, coords }) => {
  const owner = await createRestaurantOwner(index);

  const restaurant = await Restaurant.create({
    owner: owner._id,
    name,
    slug: name.toLowerCase().replace(/\s+/g, '-'),
    description: `${name} serves delicious ${cuisines.join(', ')} food made with fresh ingredients.`,
    email: owner.email,
    phone: owner.phone,
    categories: categoryIds,
    cuisines,
    address: {
      street: `${100 + index} Main Street`,
      city: 'Bengaluru',
      state: 'Karnataka',
      country: 'India',
      zipCode: `5600${10 + index}`,
      landmark: 'Near City Center',
    },
    location: { type: 'Point', coordinates: coords },
    minOrderAmount: 100,
    deliveryFee: 30,
    freeDeliveryAbove: 500,
    avgDeliveryTime: 35,
    packagingCharge: 10,
    taxPercent: 5,
    commissionPercent: 15,
    isApproved: true,
    approvalStatus: 'approved',
    isOpen: true,
    isFeatured: index % 2 === 0,
    isActive: true,
  });

  await User.findByIdAndUpdate(owner._id, { restaurant: restaurant._id });

  await RestaurantTiming.insertMany(
    DAYS.map((day) => ({
      restaurant: restaurant._id,
      day,
      isOpen: true,
      openTime: '09:00',
      closeTime: '23:00',
    })),
  );

  const foodItems = [
    {
      name: `${name} Special Paneer Tikka`,
      category: foodCategoryIds.starters,
      price: 220,
      discountPrice: 199,
      isVeg: true,
      description: 'Chunks of paneer marinated in spices and grilled to perfection.',
      images: [{ url: 'https://images.unsplash.com/photo-1567188040759-fb8a883dc6d8', publicId: '' }],
      preparationTime: 20,
    },
    {
      name: `${name} Butter Chicken`,
      category: foodCategoryIds.mainCourse,
      price: 320,
      isVeg: false,
      description: 'Classic creamy tomato-based curry with tender chicken pieces.',
      images: [{ url: 'https://images.unsplash.com/photo-1588166524941-3bf61a9c41db', publicId: '' }],
      preparationTime: 25,
    },
    {
      name: `${name} Veg Biryani`,
      category: foodCategoryIds.riceBiryani,
      price: 250,
      isVeg: true,
      description: 'Fragrant basmati rice cooked with mixed vegetables and aromatic spices.',
      images: [{ url: 'https://images.unsplash.com/photo-1563379091339-03246963d96c', publicId: '' }],
      preparationTime: 30,
    },
    {
      name: `${name} Butter Naan`,
      category: foodCategoryIds.breads,
      price: 60,
      isVeg: true,
      description: 'Soft leavened bread brushed with butter, baked in a tandoor.',
      images: [{ url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950' }],
      preparationTime: 10,
    },
    {
      name: `${name} Gulab Jamun`,
      category: foodCategoryIds.desserts,
      price: 90,
      isVeg: true,
      description: 'Soft milk-solid dumplings soaked in rose flavored sugar syrup.',
      images: [{ url: 'https://images.unsplash.com/photo-1601050690597-df0568f70950' }],
      preparationTime: 5,
    },
    {
      name: `${name} Cold Coffee`,
      category: foodCategoryIds.beverages,
      price: 120,
      isVeg: true,
      description: 'Chilled blended coffee topped with a scoop of ice cream.',
      images: [{ url: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c' }],
      preparationTime: 8,
    },
  ];

  const createdFoods = [];
  for (const item of foodItems) {
    // eslint-disable-next-line no-await-in-loop
    const food = await Food.create({
      restaurant: restaurant._id,
      ...item,
      isAvailable: true,
      isFeatured: Math.random() > 0.6,
      totalOrders: Math.floor(Math.random() * 100),
    });

    // eslint-disable-next-line no-await-in-loop
    const variant = await FoodVariant.create({
      food: food._id,
      name: 'Half',
      price: Math.round(food.price * 0.6),
      isDefault: false,
    });
    // eslint-disable-next-line no-await-in-loop
    const fullVariant = await FoodVariant.create({
      food: food._id,
      name: 'Full',
      price: food.price,
      isDefault: true,
    });

    // eslint-disable-next-line no-await-in-loop
    const addon = await Addon.create({
      food: food._id,
      restaurant: restaurant._id,
      name: 'Extra Cheese',
      price: 30,
    });

    food.variants = [variant._id, fullVariant._id];
    food.addons = [addon._id];
    // eslint-disable-next-line no-await-in-loop
    await food.save();

    createdFoods.push(food);
  }

  console.log(`Seeded restaurant "${name}" with ${createdFoods.length} food items`);
  return restaurant;
};

const seedRestaurants = async (restaurantCategories, foodCategories) => {
  const categoryMap = restaurantCategories.reduce((acc, c) => {
    acc[c.slug] = c._id;
    return acc;
  }, {});

  const foodCategoryMap = foodCategories.reduce((acc, c) => {
    acc[c.slug] = c._id;
    return acc;
  }, {});

  const foodCategoryIds = {
    starters: foodCategoryMap.starters,
    mainCourse: foodCategoryMap['main-course'],
    breads: foodCategoryMap.breads,
    riceBiryani: foodCategoryMap['rice-biryani'],
    desserts: foodCategoryMap.desserts,
    beverages: foodCategoryMap.beverages,
  };

  const restaurantConfigs = [
    {
      index: 1,
      name: 'Spice Villa',
      cuisines: ['North Indian', 'Mughlai'],
      categoryIds: [categoryMap['north-indian']],
      coords: [77.5946, 12.9716],
    },
    {
      index: 2,
      name: 'Dosa Junction',
      cuisines: ['South Indian'],
      categoryIds: [categoryMap['south-indian']],
      coords: [77.6033, 12.9758],
    },
    {
      index: 3,
      name: 'Dragon Wok',
      cuisines: ['Chinese', 'Asian'],
      categoryIds: [categoryMap.chinese],
      coords: [77.5806, 12.9698],
    },
    {
      index: 4,
      name: 'Pizza Paradise',
      cuisines: ['Italian', 'Fast Food'],
      categoryIds: [categoryMap.pizza, categoryMap['fast-food']],
      coords: [77.6101, 12.9611],
    },
  ];

  const restaurants = [];
  for (const cfg of restaurantConfigs) {
    // eslint-disable-next-line no-await-in-loop
    const restaurant = await seedRestaurantWithFoods({ ...cfg, foodCategoryIds });
    restaurants.push(restaurant);
  }

  return restaurants;
};

const seedCoupons = async (admin, restaurants) => {
  const coupons = await Coupon.insertMany([
    {
      code: 'WELCOME50',
      description: 'Flat 50 off on your first order',
      discountType: 'flat',
      discountValue: 50,
      minOrderAmount: 200,
      applicableTo: 'new_user',
      usageLimit: 1000,
      usageLimitPerUser: 1,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      createdBy: admin._id,
    },
    {
      code: 'SAVE20',
      description: '20% off up to 100 on all orders',
      discountType: 'percentage',
      discountValue: 20,
      maxDiscountAmount: 100,
      minOrderAmount: 300,
      applicableTo: 'all',
      usageLimit: 5000,
      usageLimitPerUser: 3,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
      createdBy: admin._id,
    },
    {
      code: 'SPICE100',
      description: 'Flat 100 off on orders from Spice Villa',
      discountType: 'flat',
      discountValue: 100,
      minOrderAmount: 400,
      restaurant: restaurants[0]._id,
      applicableTo: 'restaurant',
      usageLimit: 500,
      usageLimitPerUser: 2,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      createdBy: admin._id,
    },
  ]);

  console.log(`Seeded ${coupons.length} coupons`);
  return coupons;
};

const seedBanners = async () => {
  const banners = await Banner.insertMany([
    {
      title: 'Get 50% OFF on your first order',
      subtitle: 'Use code WELCOME50',
      image: { url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836', publicId: '' },
      linkType: 'none',
      position: 'home_top',
      order: 1,
      isActive: true,
    },
    {
      title: 'Weekend Food Fest',
      subtitle: 'Top restaurants, best prices',
      image: { url: 'https://images.unsplash.com/photo-1414235077428-338989a2e8c0', publicId: '' },
      linkType: 'none',
      position: 'home_top',
      order: 2,
      isActive: true,
    },
    {
      title: 'Free Delivery Above ₹500',
      subtitle: 'On all orders this week',
      image: { url: 'https://images.unsplash.com/photo-1550547660-d9450f859349', publicId: '' },
      linkType: 'none',
      position: 'home_middle',
      order: 1,
      isActive: true,
    },
  ]);

  console.log(`Seeded ${banners.length} banners`);
  return banners;
};

const seedOffers = async (restaurants) => {
  const offers = await Offer.insertMany([
    {
      title: 'Flat 20% off',
      description: 'On all orders above ₹300',
      restaurant: restaurants[0]._id,
      discountType: 'percentage',
      discountValue: 20,
      maxDiscountAmount: 150,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000),
      isActive: true,
    },
    {
      title: 'Buy 1 Get 1 on Pizzas',
      description: 'Limited time offer',
      restaurant: restaurants[3]._id,
      discountType: 'percentage',
      discountValue: 50,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      isActive: true,
    },
  ]);

  console.log(`Seeded ${offers.length} offers`);
  return offers;
};

const seedSettings = async () => {
  await Setting.insertMany([
    {
      key: 'app_name',
      value: 'Food Delivery App',
      group: 'general',
      description: 'Application display name',
      isPublic: true,
    },
    {
      key: 'support_email',
      value: 'support@fooddelivery.com',
      group: 'general',
      description: 'Customer support email',
      isPublic: true,
    },
    {
      key: 'support_phone',
      value: '+91-9999999999',
      group: 'general',
      description: 'Customer support phone number',
      isPublic: true,
    },
    {
      key: 'default_commission_percent',
      value: 15,
      group: 'commission',
      description: 'Default commission charged to restaurants',
      isPublic: false,
    },
    {
      key: 'delivery_partner_earning_percent',
      value: 80,
      group: 'delivery',
      description: 'Percentage of delivery fee paid to delivery partners',
      isPublic: false,
    },
    {
      key: 'min_withdrawal_amount',
      value: 100,
      group: 'delivery',
      description: 'Minimum amount a delivery partner can withdraw',
      isPublic: true,
    },
  ]);

  console.log('Seeded application settings');
};

const seedSampleCustomer = async () => {
  const customer = await User.create({
    name: 'John Customer',
    email: 'customer@fooddelivery.com',
    phone: '9876543210',
    password: 'Customer@123',
    role: 'customer',
    isEmailVerified: true,
    isPhoneVerified: true,
    referralCode: 'JOHN1234',
  });

  await Wallet.create({ ownerType: 'user', user: customer._id, balance: 200 });

  console.log(`Sample customer created: ${customer.email} / Customer@123`);
  return customer;
};

const seedSampleDelivery = async () => {
  const user = await User.create({
    name: 'Dave Delivery',
    email: 'delivery@fooddelivery.com',
    phone: '9876543211',
    password: 'Delivery@123',
    role: 'delivery',
    isEmailVerified: true,
    isPhoneVerified: true,
  });

  const partner = await DeliveryPartner.create({
    user: user._id,
    vehicleType: 'bike',
    vehicleNumber: 'DL01AB1234',
    licenseNumber: 'DL-LIC-1001',
    isAvailable: true,
    isOnline: true,
    isApproved: true,
    approvalStatus: 'approved',
    currentLocation: { type: 'Point', coordinates: [77.209, 28.6139] },
  });

  user.deliveryPartner = partner._id;
  await user.save();

  await Wallet.create({
    ownerType: 'delivery_partner',
    deliveryPartner: partner._id,
    balance: 0,
  });

  console.log(`Sample delivery created: ${user.email} / Delivery@123`);
  return partner;
};

const run = async () => {
  try {
    await connect();
    await clearCollections();

    const admin = await seedAdmin();
    await seedSampleCustomer();
    await seedSampleDelivery();

    const restaurantCategories = await seedRestaurantCategories();
    const foodCategories = await seedFoodCategories();
    const restaurants = await seedRestaurants(restaurantCategories, foodCategories);

    await seedCoupons(admin, restaurants);
    await seedBanners();
    await seedOffers(restaurants);
    await seedSettings();

    console.log('\nSeed completed successfully!');
    console.log('----------------------------------------');
    console.log(`Admin login:    ${config.admin.email} / ${config.admin.password}`);
    console.log('Customer login: customer@fooddelivery.com / Customer@123');
    console.log('Delivery login: delivery@fooddelivery.com / Delivery@123');
    console.log('Restaurant owner logins: owner1@fooddelivery.com ... owner4@fooddelivery.com / Owner@123');
    console.log('----------------------------------------');

    process.exit(0);
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
};

run();
