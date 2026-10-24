import { prisma } from '../prisma/client';

export async function seedGlobalProperties() {
  console.log('🌍 Seeding authentic global rental properties across world cities...');

  let landlord = await prisma.user.findFirst({ where: { role: 'LANDLORD' } });
  if (!landlord) {
    landlord = await prisma.user.create({
      data: {
        email: 'global.host@roomly.com',
        password: '$2a$10$uQsb5nSy3XjVM47oTOWHHunSI3Oo6GskEtrbXmt6Tg2ElQoX6hTt2',
        firstName: 'Global',
        lastName: 'Host',
        role: 'LANDLORD',
        isProfileVerified: true
      }
    });
  }

  const standardAmenities = [
    { name: 'High-Speed Wi-Fi (500 Mbps)', slug: 'wifi', icon: 'wifi', category: 'Essentials' },
    { name: 'Air Conditioning (HVAC)', slug: 'ac', icon: 'wind', category: 'Comfort' },
    { name: 'Dedicated Car Parking', slug: 'parking', icon: 'car', category: 'Building' },
    { name: 'In-Unit Washer & Dryer', slug: 'washing-machine', icon: 'shirt', category: 'Essentials' },
    { name: 'Full Fitness Gym', slug: 'gym', icon: 'dumbbell', category: 'Building' },
    { name: '24/7 Concierge & Security', slug: 'security', icon: 'shield-check', category: 'Safety' },
    { name: 'Private Balcony with Skyline View', slug: 'balcony', icon: 'sun', category: 'Comfort' },
    { name: 'Pet Friendly Building', slug: 'pet-friendly', icon: 'paw-print', category: 'Building' },
    { name: '100% Power Backup', slug: 'power-backup', icon: 'zap', category: 'Essentials' }
  ];

  for (const a of standardAmenities) {
    await prisma.amenity.upsert({
      where: { slug: a.slug },
      update: {},
      create: a
    });
  }

  const allAmenities = await prisma.amenity.findMany();

  const globalListings = [

    {
      title: 'Luxury Sun-Drenched Penthouse with Skyline View',
      description: 'Stunning high-floor loft in the heart of Manhattan with floor-to-ceiling panoramic windows, hardwood floors, marble kitchen island, and concierge services. 2 minutes walk to Subway.',
      propertyType: 'APARTMENT' as const,
      furnishing: 'FURNISHED' as const,
      address: '240 Central Park South',
      city: 'New York',
      neighborhood: 'Manhattan',
      latitude: 40.7667,
      longitude: -73.9806,
      rent: 4200,
      deposit: 4200,
      distanceMetro: 0.1,
      distanceTechPark: 1.5,
      featured: true,
      images: [
        { url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1000&auto=format&fit=crop&q=80', caption: 'Living area with floor-to-ceiling windows', isCover: true },
        { url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1000&auto=format&fit=crop&q=80', caption: 'Master bedroom with skyline views', isCover: false },
        { url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1000&auto=format&fit=crop&q=80', caption: 'Custom chef kitchen', isCover: false }
      ],
      rooms: [
        { name: 'Master Suite with Ensuite Marble Bath', rent: 2400, deposit: 2400, totalBeds: 1, occupiedBeds: 0, isAvailable: true, hasEnsuiteBath: true, hasBalcony: true, hasAC: true },
        { name: 'Private Bedroom with City View', rent: 1800, deposit: 1800, totalBeds: 1, occupiedBeds: 0, isAvailable: true, hasEnsuiteBath: false, hasBalcony: false, hasAC: true }
      ]
    },
    {
      title: 'Chic Exposed-Brick Loft in Williamsburg',
      description: 'Authentic Brooklyn loft with double-height ceilings, exposed timber beams, designer kitchen, and private rooftop access overlooking the East River and Manhattan skyline.',
      propertyType: 'APARTMENT' as const,
      furnishing: 'FURNISHED' as const,
      address: '185 Bedford Avenue',
      city: 'New York',
      neighborhood: 'Brooklyn',
      latitude: 40.7176,
      longitude: -73.9575,
      rent: 3300,
      deposit: 3300,
      distanceMetro: 0.2,
      distanceTechPark: 2.8,
      featured: true,
      images: [
        { url: 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=1000&auto=format&fit=crop&q=80', caption: 'Spacious loft interior', isCover: true },
        { url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1000&auto=format&fit=crop&q=80', caption: 'Building exterior', isCover: false }
      ],
      rooms: [
        { name: 'Loft Bedroom with Skylight', rent: 1800, deposit: 1800, totalBeds: 1, occupiedBeds: 0, isAvailable: true, hasEnsuiteBath: true, hasBalcony: true, hasAC: true },
        { name: 'Cozy Bedroom with Brick Wall', rent: 1500, deposit: 1500, totalBeds: 1, occupiedBeds: 0, isAvailable: true, hasEnsuiteBath: false, hasBalcony: false, hasAC: true }
      ]
    },

    {
      title: 'Elegant Victorian Garden Flat in Kensington',
      description: 'Classic period conversion flat moments from Kensington Palace and Hyde Park. Features high ornate ceilings, French doors opening to private patio garden, and bespoke wooden fittings.',
      propertyType: 'APARTMENT' as const,
      furnishing: 'FURNISHED' as const,
      address: '42 Kensington Church Street',
      city: 'London',
      neighborhood: 'Kensington',
      latitude: 51.5033,
      longitude: -0.1925,
      rent: 2800,
      deposit: 2800,
      distanceMetro: 0.3,
      distanceTechPark: 3.5,
      featured: true,
      images: [
        { url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1000&auto=format&fit=crop&q=80', caption: 'Living area with period fireplace', isCover: true },
        { url: 'https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?w=1000&auto=format&fit=crop&q=80', caption: 'Modern kitchen leading to garden', isCover: false }
      ],
      rooms: [
        { name: 'King Bedroom with Garden Access', rent: 1500, deposit: 1500, totalBeds: 1, occupiedBeds: 0, isAvailable: true, hasEnsuiteBath: true, hasBalcony: true, hasAC: true },
        { name: 'Quiet Garden View Room', rent: 1300, deposit: 1300, totalBeds: 1, occupiedBeds: 0, isAvailable: true, hasEnsuiteBath: false, hasBalcony: false, hasAC: false }
      ]
    },
    {
      title: 'Modern High-Rise Apartment with Thames Views',
      description: 'Sleek luxury residence in Canary Wharf with 24-hour concierge, private residents cinema, infinity gym, and direct access to Jubilee Line and Elizabeth Line stations.',
      propertyType: 'APARTMENT' as const,
      furnishing: 'FURNISHED' as const,
      address: '10 Upper Bank Street',
      city: 'London',
      neighborhood: 'Canary Wharf',
      latitude: 51.5039,
      longitude: -0.0187,
      rent: 2400,
      deposit: 2400,
      distanceMetro: 0.1,
      distanceTechPark: 0.5,
      featured: false,
      images: [
        { url: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1000&auto=format&fit=crop&q=80', caption: 'High-rise living room', isCover: true },
        { url: 'https://images.unsplash.com/photo-1512918728675-ed5a9ecdebfd?w=1000&auto=format&fit=crop&q=80', caption: 'Bedroom overlooking Canary Wharf', isCover: false }
      ],
      rooms: [
        { name: 'Waterfront Master Suite', rent: 1350, deposit: 1350, totalBeds: 1, occupiedBeds: 0, isAvailable: true, hasEnsuiteBath: true, hasBalcony: true, hasAC: true },
        { name: 'Secondary Double Room', rent: 1050, deposit: 1050, totalBeds: 1, occupiedBeds: 0, isAvailable: true, hasEnsuiteBath: false, hasBalcony: false, hasAC: true }
      ]
    },

    {
      title: 'Modern SoMa Designer Loft near Tech Hubs',
      description: 'Steps away from Salesforce Tower, Uber HQ, and Financial District. Features exposed industrial concrete ceilings, floor-to-ceiling glass, smart lighting, and fiber internet.',
      propertyType: 'APARTMENT' as const,
      furnishing: 'FURNISHED' as const,
      address: '350 Mission Street',
      city: 'San Francisco',
      neighborhood: 'SoMa',
      latitude: 37.7909,
      longitude: -122.3972,
      rent: 3400,
      deposit: 3400,
      distanceMetro: 0.2,
      distanceTechPark: 0.3,
      featured: true,
      images: [
        { url: 'https://images.unsplash.com/photo-1502005229762-ae1b46000c8b?w=1000&auto=format&fit=crop&q=80', caption: 'Contemporary SoMa living space', isCover: true },
        { url: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=1000&auto=format&fit=crop&q=80', caption: 'Sunlit bedroom workstation', isCover: false }
      ],
      rooms: [
        { name: 'Primary Suite with Standing Desk & Ergonomic Chair', rent: 1900, deposit: 1900, totalBeds: 1, occupiedBeds: 0, isAvailable: true, hasEnsuiteBath: true, hasBalcony: false, hasAC: true },
        { name: 'Cozy Second Bedroom', rent: 1500, deposit: 1500, totalBeds: 1, occupiedBeds: 0, isAvailable: true, hasEnsuiteBath: false, hasBalcony: false, hasAC: true }
      ]
    },

    {
      title: 'Ultra-Luxury Burj Khalifa & Fountain View Suite',
      description: 'Prestige residence in Downtown Dubai directly facing the Dubai Fountains and Burj Khalifa. Fully serviced apartment with marble finishes, Italian furniture, infinity pool, and valet.',
      propertyType: 'APARTMENT' as const,
      furnishing: 'FURNISHED' as const,
      address: 'Downtown Boulevard, Downtown Dubai',
      city: 'Dubai',
      neighborhood: 'Downtown Dubai',
      latitude: 25.1972,
      longitude: 55.2744,
      rent: 12000,
      deposit: 12000,
      distanceMetro: 0.4,
      distanceTechPark: 2.1,
      featured: true,
      images: [
        { url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1000&auto=format&fit=crop&q=80', caption: 'Burj Khalifa skyline view', isCover: true },
        { url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1000&auto=format&fit=crop&q=80', caption: 'Marble living salon', isCover: false }
      ],
      rooms: [
        { name: 'Royal Master Bedroom with Fountain Balcony', rent: 7000, deposit: 7000, totalBeds: 1, occupiedBeds: 0, isAvailable: true, hasEnsuiteBath: true, hasBalcony: true, hasAC: true },
        { name: 'Deluxe Guest Suite with Ensuite Jacuzzi', rent: 5000, deposit: 5000, totalBeds: 1, occupiedBeds: 0, isAvailable: true, hasEnsuiteBath: true, hasBalcony: false, hasAC: true }
      ]
    },

    {
      title: 'Minimalist High-Floor Apartment in Roppongi Hills',
      description: 'Modern Japanese architectural residence with panoramic views of Tokyo Tower. Features heated wooden floors, smart home tech, high security, and 3 minutes to Roppongi Station.',
      propertyType: 'APARTMENT' as const,
      furnishing: 'FURNISHED' as const,
      address: '6 Chome-10-1 Roppongi, Minato City',
      city: 'Tokyo',
      neighborhood: 'Roppongi',
      latitude: 35.6628,
      longitude: 139.7314,
      rent: 220000,
      deposit: 220000,
      distanceMetro: 0.2,
      distanceTechPark: 1.2,
      featured: true,
      images: [
        { url: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=1000&auto=format&fit=crop&q=80', caption: 'Tokyo skyline apartment view', isCover: true },
        { url: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=1000&auto=format&fit=crop&q=80', caption: 'Compact kitchen and dining', isCover: false }
      ],
      rooms: [
        { name: 'Main Tatami & Western Bedroom', rent: 120000, deposit: 120000, totalBeds: 1, occupiedBeds: 0, isAvailable: true, hasEnsuiteBath: true, hasBalcony: true, hasAC: true },
        { name: 'Studio Bedroom with Tokyo Tower View', rent: 100000, deposit: 100000, totalBeds: 1, occupiedBeds: 0, isAvailable: true, hasEnsuiteBath: false, hasBalcony: false, hasAC: true }
      ]
    },

    {
      title: 'Haussmannian Balcony Flat in Le Marais',
      description: 'Charming authentic Parisian apartment featuring original herringbone parquet, decorative moldings, wrought-iron balcony overlooking cafe-lined streets, and modern renovated bath.',
      propertyType: 'APARTMENT' as const,
      furnishing: 'FURNISHED' as const,
      address: '28 Rue des Francs-Bourgeois',
      city: 'Paris',
      neighborhood: 'Le Marais',
      latitude: 48.8575,
      longitude: 2.3619,
      rent: 2600,
      deposit: 2600,
      distanceMetro: 0.2,
      distanceTechPark: 2.5,
      featured: true,
      images: [
        { url: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1000&auto=format&fit=crop&q=80', caption: 'Classic Parisian salon', isCover: true },
        { url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=1000&auto=format&fit=crop&q=80', caption: 'Sunlit bedroom with balcony access', isCover: false }
      ],
      rooms: [
        { name: 'Chambre Principale avec Balcon', rent: 1450, deposit: 1450, totalBeds: 1, occupiedBeds: 0, isAvailable: true, hasEnsuiteBath: true, hasBalcony: true, hasAC: false },
        { name: 'Chambre d Amis Calme sur Cour', rent: 1150, deposit: 1150, totalBeds: 1, occupiedBeds: 0, isAvailable: true, hasEnsuiteBath: false, hasBalcony: false, hasAC: false }
      ]
    },

    {
      title: 'Ocean-Breeze Beachside Residence at Bondi Beach',
      description: 'Wake up to the sound of waves. 90 seconds walk to Bondi sands and coastal walk. Open-plan beachside living with wraparound sun deck, outdoor shower, and surfboard storage.',
      propertyType: 'APARTMENT' as const,
      furnishing: 'FURNISHED' as const,
      address: '112 Campbell Parade, Bondi Beach',
      city: 'Sydney',
      neighborhood: 'Bondi',
      latitude: -33.8915,
      longitude: 151.2767,
      rent: 3100,
      deposit: 3100,
      distanceMetro: 0.8,
      distanceTechPark: 6.2,
      featured: true,
      images: [
        { url: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1000&auto=format&fit=crop&q=80', caption: 'Coastal living room with sea breeze', isCover: true },
        { url: 'https://images.unsplash.com/photo-1540518614846-7eded433c457?w=1000&auto=format&fit=crop&q=80', caption: 'Bright bedroom', isCover: false }
      ],
      rooms: [
        { name: 'Master Ocean Suite with Private Balcony', rent: 1700, deposit: 1700, totalBeds: 1, occupiedBeds: 0, isAvailable: true, hasEnsuiteBath: true, hasBalcony: true, hasAC: true },
        { name: 'Sunlit Bondi Double Room', rent: 1400, deposit: 1400, totalBeds: 1, occupiedBeds: 0, isAvailable: true, hasEnsuiteBath: false, hasBalcony: false, hasAC: true }
      ]
    }
  ];

  for (const item of globalListings) {
    const existing = await prisma.property.findFirst({
      where: { title: item.title }
    });

    if (!existing) {
      const { images, rooms, ...propData } = item;
      const created = await prisma.property.create({
        data: {
          ...propData,
          landlordId: landlord.id,
          images: {
            create: images.map((img, i) => ({
              url: img.url,
              caption: img.caption,
              displayOrder: i,
              isCover: img.isCover
            }))
          },
          rooms: {
            create: rooms
          }
        }
      });

      const chosenAmenities = allAmenities.slice(0, 5);
      for (const am of chosenAmenities) {
        await prisma.propertyAmenity.create({
          data: {
            propertyId: created.id,
            amenityId: am.id
          }
        });
      }
      console.log(`✅ Created global listing in ${item.city}: ${item.title}`);
    }
  }

  console.log('🎉 Global listings successfully seeded!');
}

if (require.main === module) {
  seedGlobalProperties()
    .then(() => prisma.$disconnect())
    .catch((err) => {
      console.error(err);
      prisma.$disconnect();
    });
}
