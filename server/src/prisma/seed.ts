import { prisma } from './client';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('🌱 Starting Roomly Real-World Database Seeding...');

  await prisma.review.deleteMany();
  await prisma.verificationRecord.deleteMany();
  await prisma.report.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.message.deleteMany();
  await prisma.conversation.deleteMany();
  await prisma.visitRequest.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.propertyImage.deleteMany();
  await prisma.propertyAmenity.deleteMany();
  await prisma.room.deleteMany();
  await prisma.property.deleteMany();
  await prisma.match.deleteMany();
  await prisma.roommateProfile.deleteMany();
  await prisma.amenity.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('password123', 10);

  const amenitiesData = [
    { name: 'High-Speed Wi-Fi (300 Mbps)', slug: 'wifi', icon: 'wifi', category: 'Essentials' },
    { name: 'Dedicated Car Parking', slug: 'parking', icon: 'car', category: 'Building' },
    { name: 'Air Conditioning (Inverter)', slug: 'ac', icon: 'wind', category: 'Comfort' },
    { name: 'Front-Load Washing Machine', slug: 'washing-machine', icon: 'shirt', category: 'Essentials' },
    { name: 'Fully Equipped Fitness Gym', slug: 'gym', icon: 'dumbbell', category: 'Building' },
    { name: '24/7 Security & CCTV', slug: 'security', icon: 'shield-check', category: 'Safety' },
    { name: 'Fully Furnished Interior', slug: 'furnished', icon: 'sofa', category: 'Comfort' },
    { name: '100% DG Power Backup', slug: 'power-backup', icon: 'zap', category: 'Essentials' },
    { name: 'Modular Kitchen with Chimney', slug: 'kitchen', icon: 'utensils', category: 'Essentials' },
    { name: 'Automatic High-Speed Elevator', slug: 'elevator', icon: 'arrow-up-down', category: 'Building' },
    { name: 'Private Balcony with Open View', slug: 'balcony', icon: 'sun', category: 'Comfort' },
    { name: 'Pet Friendly Society', slug: 'pet-friendly', icon: 'paw-print', category: 'Building' },
    { name: 'Swimming Pool & Clubhouse', slug: 'swimming-pool', icon: 'waves', category: 'Building' },
    { name: 'RO Water Purifier', slug: 'water-purifier', icon: 'droplet', category: 'Essentials' },
  ];

  const amenities: Record<string, any> = {};
  for (const item of amenitiesData) {
    amenities[item.slug] = await prisma.amenity.create({ data: item });
  }

  const landlord1 = await prisma.user.create({
    data: {
      email: 'rajesh.sharma@example.com',
      password: passwordHash,
      firstName: 'Rajesh',
      lastName: 'Sharma',
      role: 'LANDLORD',
      phone: '+91 98450 12345',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces',
      isEmailVerified: true,
      isProfileVerified: true
    }
  });

  const landlord2 = await prisma.user.create({
    data: {
      email: 'priya.nair@example.com',
      password: passwordHash,
      firstName: 'Priya',
      lastName: 'Nair',
      role: 'LANDLORD',
      phone: '+91 98450 67890',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&h=200&fit=crop&crop=faces',
      isEmailVerified: true,
      isProfileVerified: true
    }
  });

  const landlord3 = await prisma.user.create({
    data: {
      email: 'vikram.mehta@example.com',
      password: passwordHash,
      firstName: 'Vikram',
      lastName: 'Mehta',
      role: 'LANDLORD',
      phone: '+91 98200 45678',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=faces',
      isEmailVerified: true,
      isProfileVerified: true
    }
  });

  const tenant1 = await prisma.user.create({
    data: {
      email: 'aarav.patel@example.com',
      password: passwordHash,
      firstName: 'Aarav',
      lastName: 'Patel',
      role: 'TENANT',
      phone: '+91 98765 11111',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&h=200&fit=crop&crop=faces',
      isEmailVerified: true,
      isProfileVerified: true,
      roommateProfile: {
        create: {
          budgetMin: 14000,
          budgetMax: 22000,
          preferredCity: 'Bangalore',
          preferredLocations: 'Koramangala, HSR Layout, Indiranagar',
          occupation: 'Senior Frontend Developer',
          companyOrCollege: 'Flipkart',
          age: 25,
          gender: 'Male',
          sleepSchedule: 'NIGHT_OWL',
          foodPreference: 'NON_VEG',
          cleanliness: 4,
          smoking: 'NON_SMOKER',
          pets: 'LOVES_PETS',
          socialLevel: 4,
          guests: 'SOMETIMES',
          noiseTolerance: 3,
          bio: 'Frontend engineer at Flipkart. Enjoy cooking pasta on weekends, tech podcasts, and keeping common areas tidy. Looking for friendly, respectful flatmates.'
        }
      }
    }
  });

  const tenant2 = await prisma.user.create({
    data: {
      email: 'ananya.iyer@example.com',
      password: passwordHash,
      firstName: 'Ananya',
      lastName: 'Iyer',
      role: 'TENANT',
      phone: '+91 98765 22222',
      avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&h=200&fit=crop&crop=faces',
      isEmailVerified: true,
      isProfileVerified: true,
      roommateProfile: {
        create: {
          budgetMin: 12000,
          budgetMax: 19000,
          preferredCity: 'Bangalore',
          preferredLocations: 'Indiranagar, Domlur, Old Airport Road',
          occupation: 'Product Designer',
          companyOrCollege: 'Swiggy',
          age: 24,
          gender: 'Female',
          sleepSchedule: 'EARLY_BIRD',
          foodPreference: 'VEG',
          cleanliness: 5,
          smoking: 'NON_SMOKER',
          pets: 'NO_PETS',
          socialLevel: 3,
          guests: 'RARELY',
          noiseTolerance: 2,
          bio: 'Product designer obsessed with neat spaces, indoor plants, and yoga in the morning. Looking for a quiet, organized home with peaceful vibes.'
        }
      }
    }
  });

  const tenant3 = await prisma.user.create({
    data: {
      email: 'rohan.deshmukh@example.com',
      password: passwordHash,
      firstName: 'Rohan',
      lastName: 'Deshmukh',
      role: 'TENANT',
      phone: '+91 98210 33333',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=200&fit=crop&crop=faces',
      isEmailVerified: true,
      isProfileVerified: true,
      roommateProfile: {
        create: {
          budgetMin: 18000,
          budgetMax: 28000,
          preferredCity: 'Mumbai',
          preferredLocations: 'Bandra West, Khar, Santacruz',
          occupation: 'Brand Strategist',
          companyOrCollege: 'Ogilvy',
          age: 27,
          gender: 'Male',
          sleepSchedule: 'FLEXIBLE',
          foodPreference: 'FLEXIBLE',
          cleanliness: 4,
          smoking: 'OUTSIDE_ONLY',
          pets: 'LOVES_PETS',
          socialLevel: 4,
          guests: 'SOMETIMES',
          noiseTolerance: 3,
          bio: 'Ad agency strategist in Mumbai. Love coffee walks around Bandra, music production, and weekend movie nights with roommates.'
        }
      }
    }
  });

  const tenant4 = await prisma.user.create({
    data: {
      email: 'sneha.reddy@example.com',
      password: passwordHash,
      firstName: 'Sneha',
      lastName: 'Reddy',
      role: 'TENANT',
      phone: '+91 98490 44444',
      avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=200&h=200&fit=crop&crop=faces',
      isEmailVerified: true,
      isProfileVerified: true,
      roommateProfile: {
        create: {
          budgetMin: 10000,
          budgetMax: 16000,
          preferredCity: 'Hyderabad',
          preferredLocations: 'Gachibowli, Hitec City, Madhapur',
          occupation: 'Data Analyst',
          companyOrCollege: 'Deloitte',
          age: 23,
          gender: 'Female',
          sleepSchedule: 'EARLY_BIRD',
          foodPreference: 'NON_VEG',
          cleanliness: 5,
          smoking: 'NON_SMOKER',
          pets: 'NO_PETS',
          socialLevel: 3,
          guests: 'RARELY',
          noiseTolerance: 3,
          bio: 'Consultant at Deloitte Gachibowli. Quiet, focused, enjoy badminton on weekends and keeping kitchen spotless.'
        }
      }
    }
  });

  const p1 = await prisma.property.create({
    data: {
      landlordId: landlord1.id,
      title: 'Modern 3BHK Penthouse in 4th Block Koramangala',
      description: 'Sunlit and fully furnished 3BHK penthouse with spacious wooden balcony, modular kitchen, and ultra high-speed fiber internet. Located 5 minutes from Sony World signal, walking distance to Wipro Park and top cafes.',
      propertyType: 'APARTMENT',
      furnishing: 'FURNISHED',
      address: '88, 4th Cross, 4th Block Koramangala',
      city: 'Bangalore',
      neighborhood: 'Koramangala',
      latitude: 12.9352,
      longitude: 77.6245,
      rent: 48000,
      deposit: 96000,
      distanceMetro: 1.2,
      distanceCollege: 0.8,
      distanceTechPark: 2.5,
      distanceHospital: 0.5,
      isVerified: true,
      featured: true,
      viewsCount: 342,
      rooms: {
        create: [
          { name: 'Master Bedroom with Ensuite Bath & Balcony', rent: 18000, deposit: 36000, totalBeds: 1, hasEnsuiteBath: true, hasBalcony: true, hasAC: true },
          { name: 'Deluxe Bedroom with Work Desk', rent: 16000, deposit: 32000, totalBeds: 1, hasEnsuiteBath: false, hasBalcony: false, hasAC: true },
          { name: 'Cozy Room with Wardrobe', rent: 14000, deposit: 28000, totalBeds: 1, hasEnsuiteBath: false, hasBalcony: false, hasAC: false }
        ]
      },
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1000&auto=format&fit=crop&q=80', caption: 'Spacious living room with large glass windows', displayOrder: 0, isCover: true },
          { url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1000&auto=format&fit=crop&q=80', caption: 'Sunlit Master bedroom with balcony access', displayOrder: 1 },
          { url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1000&auto=format&fit=crop&q=80', caption: 'Modern kitchen with chimney & breakfast counter', displayOrder: 2 },
          { url: 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=1000&auto=format&fit=crop&q=80', caption: 'Attached modern washroom with glass partition', displayOrder: 3 }
        ]
      },
      amenities: {
        create: [
          { amenity: { connect: { id: amenities['wifi'].id } } },
          { amenity: { connect: { id: amenities['ac'].id } } },
          { amenity: { connect: { id: amenities['parking'].id } } },
          { amenity: { connect: { id: amenities['washing-machine'].id } } },
          { amenity: { connect: { id: amenities['power-backup'].id } } },
          { amenity: { connect: { id: amenities['security'].id } } },
          { amenity: { connect: { id: amenities['balcony'].id } } },
          { amenity: { connect: { id: amenities['water-purifier'].id } } }
        ]
      }
    }
  });

  const p2 = await prisma.property.create({
    data: {
      landlordId: landlord2.id,
      title: 'Chic 2BHK Garden Apartment on 100ft Road Indiranagar',
      description: '3 minutes walk from Indiranagar Metro Station. Leafy quiet street with private patio, dedicated covered car parking, and pet-friendly society. Ideal for startup founders and creative professionals.',
      propertyType: 'APARTMENT',
      furnishing: 'FURNISHED',
      address: '412, 12th Main, 100ft Road, Indiranagar',
      city: 'Bangalore',
      neighborhood: 'Indiranagar',
      latitude: 12.9784,
      longitude: 77.6408,
      rent: 36000,
      deposit: 72000,
      distanceMetro: 0.3,
      distanceCollege: 2.1,
      distanceTechPark: 3.8,
      distanceHospital: 1.1,
      isVerified: true,
      featured: true,
      viewsCount: 289,
      rooms: {
        create: [
          { name: 'Garden Facing Suite with Attached Bath', rent: 19000, deposit: 38000, totalBeds: 1, hasEnsuiteBath: true, hasBalcony: true, hasAC: true },
          { name: 'Bright Corner Room with Workstation', rent: 17000, deposit: 34000, totalBeds: 1, hasEnsuiteBath: false, hasBalcony: false, hasAC: true }
        ]
      },
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1502005229762-ae1b46000c8b?w=1000&auto=format&fit=crop&q=80', caption: 'Garden apartment patio view', displayOrder: 0, isCover: true },
          { url: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=1000&auto=format&fit=crop&q=80', caption: 'Scandinavian bedroom with queen bed', displayOrder: 1 },
          { url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1000&auto=format&fit=crop&q=80', caption: 'Building exterior & tree cover', displayOrder: 2 }
        ]
      },
      amenities: {
        create: [
          { amenity: { connect: { id: amenities['wifi'].id } } },
          { amenity: { connect: { id: amenities['ac'].id } } },
          { amenity: { connect: { id: amenities['parking'].id } } },
          { amenity: { connect: { id: amenities['pet-friendly'].id } } },
          { amenity: { connect: { id: amenities['power-backup'].id } } }
        ]
      }
    }
  });

  const p3 = await prisma.property.create({
    data: {
      landlordId: landlord1.id,
      title: 'Smart 3BHK Serviced Co-Living in HSR Sector 2',
      description: 'Fully serviced shared apartment for young professionals. Includes high-speed Wi-Fi, daily housekeeping, washing machine, and dedicated workspace in every room. 5 mins drive to Outer Ring Road tech parks.',
      propertyType: 'SHARED_ROOM',
      furnishing: 'FURNISHED',
      address: '24, 27th Main Rd, HSR Layout Sector 2',
      city: 'Bangalore',
      neighborhood: 'HSR Layout',
      latitude: 12.9121,
      longitude: 77.6446,
      rent: 39000,
      deposit: 78000,
      distanceMetro: 2.8,
      distanceCollege: 1.5,
      distanceTechPark: 1.8,
      distanceHospital: 0.9,
      isVerified: true,
      featured: false,
      viewsCount: 195,
      rooms: {
        create: [
          { name: 'Room Alpha (Private Bath + AC)', rent: 14500, deposit: 29000, totalBeds: 1, hasEnsuiteBath: true, hasBalcony: false, hasAC: true },
          { name: 'Room Beta (Attached Balcony)', rent: 13000, deposit: 26000, totalBeds: 1, hasEnsuiteBath: false, hasBalcony: true, hasAC: false },
          { name: 'Room Gamma (Quiet Study Room)', rent: 11500, deposit: 23000, totalBeds: 1, hasEnsuiteBath: false, hasBalcony: false, hasAC: false }
        ]
      },
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1000&auto=format&fit=crop&q=80', caption: 'Co-living living lounge', displayOrder: 0, isCover: true },
          { url: 'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?w=1000&auto=format&fit=crop&q=80', caption: 'Bedroom with ergonomic chair', displayOrder: 1 }
        ]
      },
      amenities: {
        create: [
          { amenity: { connect: { id: amenities['wifi'].id } } },
          { amenity: { connect: { id: amenities['washing-machine'].id } } },
          { amenity: { connect: { id: amenities['gym'].id } } },
          { amenity: { connect: { id: amenities['security'].id } } }
        ]
      }
    }
  });

  const p4 = await prisma.property.create({
    data: {
      landlordId: landlord2.id,
      title: 'Luxury 3BHK Gated Society Flat near ITPL Whitefield',
      description: 'High-rise apartment inside a premium society with clubhouse, olympic swimming pool, tennis court, and power backup. Directly opposite Pattandur Agrahara Metro Station.',
      propertyType: 'APARTMENT',
      furnishing: 'SEMI_FURNISHED',
      address: 'Tower B, Prestige Shantiniketan, Whitefield Main Rd',
      city: 'Bangalore',
      neighborhood: 'Whitefield',
      latitude: 12.9892,
      longitude: 77.7289,
      rent: 42000,
      deposit: 84000,
      distanceMetro: 0.2,
      distanceCollege: 3.0,
      distanceTechPark: 0.8,
      distanceHospital: 1.0,
      isVerified: true,
      featured: true,
      viewsCount: 410,
      rooms: {
        create: [
          { name: 'Sky-view Master Room with Attached Bath', rent: 16000, deposit: 32000, totalBeds: 1, hasEnsuiteBath: true, hasBalcony: true, hasAC: true },
          { name: 'Spacious Bedroom 2', rent: 14000, deposit: 28000, totalBeds: 1, hasEnsuiteBath: false, hasBalcony: false, hasAC: true },
          { name: 'Spacious Bedroom 3', rent: 12000, deposit: 24000, totalBeds: 1, hasEnsuiteBath: false, hasBalcony: false, hasAC: false }
        ]
      },
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1000&auto=format&fit=crop&q=80', caption: 'High-rise tower view & pool', displayOrder: 0, isCover: true },
          { url: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?w=1000&auto=format&fit=crop&q=80', caption: 'Open-concept living room', displayOrder: 1 },
          { url: 'https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf?w=1000&auto=format&fit=crop&q=80', caption: 'Bedroom with wardrobe & hardwood floors', displayOrder: 2 }
        ]
      },
      amenities: {
        create: [
          { amenity: { connect: { id: amenities['wifi'].id } } },
          { amenity: { connect: { id: amenities['swimming-pool'].id } } },
          { amenity: { connect: { id: amenities['gym'].id } } },
          { amenity: { connect: { id: amenities['parking'].id } } },
          { amenity: { connect: { id: amenities['power-backup'].id } } },
          { amenity: { connect: { id: amenities['elevator'].id } } }
        ]
      }
    }
  });

  const p5 = await prisma.property.create({
    data: {
      landlordId: landlord3.id,
      title: 'Boutique 2BHK Sea-Breeze Flat in Pali Hill Bandra',
      description: 'Rare heritage apartment on serene Zig-Zag Road in Pali Hill. High ceilings, teakwood flooring, cross ventilation with Arabian sea breeze, and 24/7 security. Walking distance from Carter Road promenade.',
      propertyType: 'APARTMENT',
      furnishing: 'FURNISHED',
      address: '14, Zig Zag Road, Pali Hill, Bandra West',
      city: 'Mumbai',
      neighborhood: 'Bandra West',
      latitude: 19.0607,
      longitude: 72.8258,
      rent: 68000,
      deposit: 150000,
      distanceMetro: 2.1,
      distanceCollege: 1.2,
      distanceTechPark: 4.5,
      distanceHospital: 0.8,
      isVerified: true,
      featured: true,
      viewsCount: 520,
      rooms: {
        create: [
          { name: 'Pali Suite with Heritage Windows', rent: 36000, deposit: 80000, totalBeds: 1, hasEnsuiteBath: true, hasBalcony: true, hasAC: true },
          { name: 'Artsy Deluxe Bedroom', rent: 32000, deposit: 70000, totalBeds: 1, hasEnsuiteBath: false, hasBalcony: false, hasAC: true }
        ]
      },
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1000&auto=format&fit=crop&q=80', caption: 'Heritage living room interior', displayOrder: 0, isCover: true },
          { url: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1000&auto=format&fit=crop&q=80', caption: 'Designer bedroom with balcony', displayOrder: 1 },
          { url: 'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=1000&auto=format&fit=crop&q=80', caption: 'Art Deco dining area', displayOrder: 2 }
        ]
      },
      amenities: {
        create: [
          { amenity: { connect: { id: amenities['wifi'].id } } },
          { amenity: { connect: { id: amenities['ac'].id } } },
          { amenity: { connect: { id: amenities['security'].id } } },
          { amenity: { connect: { id: amenities['washing-machine'].id } } },
          { amenity: { connect: { id: amenities['pet-friendly'].id } } }
        ]
      }
    }
  });

  const p6 = await prisma.property.create({
    data: {
      landlordId: landlord3.id,
      title: 'Spacious 3BHK Gated Apartment in Financial District',
      description: 'Ultra-modern apartment 5 minutes from Amazon, Microsoft, and Google campus in Gachibowli. Features 100% power backup, club house, squash court, and reserved basement parking.',
      propertyType: 'APARTMENT',
      furnishing: 'FURNISHED',
      address: 'My Home Bhooja, Gachibowli, Financial District',
      city: 'Hyderabad',
      neighborhood: 'Gachibowli',
      latitude: 17.4399,
      longitude: 78.3685,
      rent: 38000,
      deposit: 76000,
      distanceMetro: 3.5,
      distanceCollege: 2.0,
      distanceTechPark: 0.5,
      distanceHospital: 1.2,
      isVerified: true,
      featured: false,
      viewsCount: 260,
      rooms: {
        create: [
          { name: 'Master Room with Glass Balcony', rent: 14000, deposit: 28000, totalBeds: 1, hasEnsuiteBath: true, hasBalcony: true, hasAC: true },
          { name: 'Comfort Room with Desk', rent: 12500, deposit: 25000, totalBeds: 1, hasEnsuiteBath: false, hasBalcony: false, hasAC: true },
          { name: 'Standard Room', rent: 11500, deposit: 23000, totalBeds: 1, hasEnsuiteBath: false, hasBalcony: false, hasAC: false }
        ]
      },
      images: {
        create: [
          { url: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1000&auto=format&fit=crop&q=80', caption: 'Spacious living room', displayOrder: 0, isCover: true },
          { url: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=1000&auto=format&fit=crop&q=80', caption: 'Master bedroom with balcony', displayOrder: 1 }
        ]
      },
      amenities: {
        create: [
          { amenity: { connect: { id: amenities['wifi'].id } } },
          { amenity: { connect: { id: amenities['ac'].id } } },
          { amenity: { connect: { id: amenities['parking'].id } } },
          { amenity: { connect: { id: amenities['swimming-pool'].id } } },
          { amenity: { connect: { id: amenities['power-backup'].id } } }
        ]
      }
    }
  });

  await prisma.review.create({
    data: {
      propertyId: p1.id,
      authorId: tenant1.id,
      rating: 5,
      comment: 'Super peaceful society, amazing wooden balcony for working from home, and Rajesh uncle is very accommodating and helpful!'
    }
  });

  await prisma.review.create({
    data: {
      propertyId: p2.id,
      authorId: tenant2.id,
      rating: 5,
      comment: 'Best location in Indiranagar. The metro station is literally 3 minutes walk, lots of trees, and cafes nearby!'
    }
  });

  await prisma.review.create({
    data: {
      propertyId: p5.id,
      authorId: tenant3.id,
      rating: 5,
      comment: 'Outstanding vintage charm in Bandra. Sea breeze is incredible, and the landlord Vikram is super professional.'
    }
  });

  await prisma.visitRequest.create({
    data: {
      tenantId: tenant1.id,
      propertyId: p1.id,
      preferredDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      preferredTimeSlot: '11:00 AM - 12:00 PM',
      notes: 'Would love to see the master bedroom and test the Wi-Fi speed.',
      status: 'ACCEPTED',
      landlordNotes: 'Confirmed! See you Saturday morning at the apartment gate.'
    }
  });

  const conversation = await prisma.conversation.create({
    data: {
      tenantId: tenant1.id,
      landlordId: landlord1.id,
      propertyId: p1.id,
      lastMessageAt: new Date()
    }
  });

  await prisma.message.create({
    data: {
      conversationId: conversation.id,
      senderId: tenant1.id,
      content: 'Hi Rajesh! Is the master bedroom with the attached balcony still available for move-in next month?',
      isRead: true
    }
  });

  await prisma.message.create({
    data: {
      conversationId: conversation.id,
      senderId: landlord1.id,
      content: 'Hello Aarav! Yes, it is available from the 1st of next month. Feel free to come visit anytime this weekend!',
      isRead: false
    }
  });

  await prisma.verificationRecord.create({
    data: {
      userId: tenant1.id,
      documentType: 'GOVERNMENT_ID',
      documentUrl: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600',
      status: 'VERIFIED',
      reviewedAt: new Date(),
      adminNotes: 'Government ID verified by Roomly Trust & Safety team.'
    }
  });

  console.log('✅ Real-world database seeding completed successfully!');
  console.log('📊 Properties seeded in: Bangalore (Koramangala, Indiranagar, HSR, Whitefield), Mumbai (Bandra West), Hyderabad (Gachibowli)');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
