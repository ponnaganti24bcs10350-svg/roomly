import { prisma } from '../prisma/client';

interface GroqGeneratedProperty {
  title: string;
  description: string;
  propertyType: 'APARTMENT' | 'VILLA' | 'STUDIO' | 'PG' | 'SHARED_FLAT';
  furnishing: 'FURNISHED' | 'SEMI_FURNISHED' | 'UNFURNISHED';
  address: string;
  city: string;
  neighborhood: string;
  latitude: number;
  longitude: number;
  rent: number;
  deposit: number;
  currencySymbol: string;
  distanceMetro: number;
  distanceTechPark: number;
  rooms: {
    name: string;
    rent: number;
    deposit: number;
    totalBeds: number;
    hasEnsuiteBath: boolean;
    hasBalcony: boolean;
    hasAC: boolean;
  }[];
  images: string[];
}

const CURATED_ARCHITECTURE_IMAGES = [
  'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1493809842364-78817add7ffb?auto=format&fit=crop&w=1200&q=80',
  'https://images.unsplash.com/photo-1502005229762-ee1b2b8ab98f?auto=format&fit=crop&w=1200&q=80'
];

export async function generatePlacesWithGroq(cityName: string): Promise<any[]> {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    console.warn('⚠️ GROQ_API_KEY not configured in environment.');
    return [];
  }

  try {
    const prompt = `You are a real estate marketplace engine for Roomly.
Generate 2 authentic, highly realistic rental property listings for the city: "${cityName}".
Use realistic local neighborhood names, authentic street addresses, real approximate latitude and longitude coordinates, and typical monthly rental pricing in the local currency or USD.
Return ONLY valid JSON with this exact array structure, no extra text or markdown code fences:
[
  {
    "title": "Chic 2BHK Designer Flat in Central District",
    "description": "High-standard contemporary apartment with scenic views, modern kitchen appliances, and fast commute to transit.",
    "propertyType": "APARTMENT",
    "furnishing": "FURNISHED",
    "address": "12 Example Avenue",
    "city": "${cityName}",
    "neighborhood": "Central",
    "latitude": 40.7128,
    "longitude": -74.0060,
    "rent": 2400,
    "deposit": 2400,
    "distanceMetro": 0.3,
    "distanceTechPark": 2.1,
    "rooms": [
      {
        "name": "Master Suite with Ensuite Bath",
        "rent": 1400,
        "deposit": 1400,
        "totalBeds": 1,
        "hasEnsuiteBath": true,
        "hasBalcony": true,
        "hasAC": true
      },
      {
        "name": "Cozy Sunlit Guest Bedroom",
        "rent": 1000,
        "deposit": 1000,
        "totalBeds": 1,
        "hasEnsuiteBath": false,
        "hasBalcony": false,
        "hasAC": true
      }
    ]
  }
]`;

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'qwen/qwen3.8-27b',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error('Groq API error:', response.status, errText);
      return [];
    }

    const data = (await response.json()) as any;
    const rawContent = data.choices?.[0]?.message?.content || '';

    const cleaned = rawContent
      .replace(/^```json\s*/i, '')
      .replace(/^```\s*/i, '')
      .replace(/\s*```$/i, '')
      .trim();

    const listings: any[] = JSON.parse(cleaned);

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

    const allAmenities = await prisma.amenity.findMany();
    const createdProperties = [];

    for (let i = 0; i < listings.length; i++) {
      const l = listings[i];
      const img1 = CURATED_ARCHITECTURE_IMAGES[(i * 3) % CURATED_ARCHITECTURE_IMAGES.length];
      const img2 = CURATED_ARCHITECTURE_IMAGES[(i * 3 + 1) % CURATED_ARCHITECTURE_IMAGES.length];
      const img3 = CURATED_ARCHITECTURE_IMAGES[(i * 3 + 2) % CURATED_ARCHITECTURE_IMAGES.length];

      const rentNum = Math.max(500, Number(l.rent) || 1800);
      const depositNum = Math.max(500, Number(l.deposit) || rentNum);

      const prop = await prisma.property.create({
        data: {
          landlordId: landlord.id,
          title: l.title || `Modern Residence in ${cityName}`,
          description: l.description || `Beautiful contemporary rental property in ${cityName} with premium finishes and great connectivity.`,
          propertyType: (['APARTMENT', 'VILLA', 'STUDIO', 'PG', 'SHARED_FLAT'].includes(l.propertyType) ? l.propertyType : 'APARTMENT') as any,
          furnishing: (['FURNISHED', 'SEMI_FURNISHED', 'UNFURNISHED'].includes(l.furnishing) ? l.furnishing : 'FURNISHED') as any,
          address: l.address || `Central ${cityName}`,
          city: l.city || cityName,
          neighborhood: l.neighborhood || cityName,
          latitude: Number(l.latitude) || 0,
          longitude: Number(l.longitude) || 0,
          rent: rentNum,
          deposit: depositNum,
          distanceMetro: Number(l.distanceMetro) || 0.4,
          distanceTechPark: Number(l.distanceTechPark) || 2.0,
          status: 'ACTIVE',
          isVerified: true,
          featured: true,
          images: {
            create: [
              { url: img1, caption: 'Living Area & Scenic View', category: 'LIVING_ROOM', displayOrder: 0, isCover: true },
              { url: img2, caption: 'Master Bedroom', category: 'BEDROOM', displayOrder: 1, isCover: false },
              { url: img3, caption: 'Modern Kitchen & Dining', category: 'KITCHEN', displayOrder: 2, isCover: false }
            ]
          },
          rooms: {
            create: (l.rooms && Array.isArray(l.rooms) && l.rooms.length > 0) ? l.rooms.map((r: any) => ({
              name: r.name || 'Master Bedroom',
              rent: Number(r.rent) || Math.round(rentNum * 0.6),
              deposit: Number(r.deposit) || Math.round(depositNum * 0.6),
              totalBeds: Number(r.totalBeds) || 1,
              occupiedBeds: 0,
              isAvailable: true,
              hasEnsuiteBath: !!r.hasEnsuiteBath,
              hasBalcony: !!r.hasBalcony,
              hasAC: !!r.hasAC
            })) : [
              {
                name: 'Master Suite',
                rent: rentNum,
                deposit: depositNum,
                totalBeds: 1,
                occupiedBeds: 0,
                isAvailable: true,
                hasEnsuiteBath: true,
                hasBalcony: true,
                hasAC: true
              }
            ]
          }
        },
        include: {
          images: { orderBy: { displayOrder: 'asc' } },
          rooms: true,
          amenities: { include: { amenity: true } },
          landlord: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
              isProfileVerified: true
            }
          }
        }
      });

      for (const am of allAmenities.slice(0, 5)) {
        await prisma.propertyAmenity.create({
          data: {
            propertyId: prop.id,
            amenityId: am.id
          }
        }).catch(() => {});
      }

      createdProperties.push(prop);
    }

    return createdProperties;
  } catch (err: any) {
    console.error('Error in generatePlacesWithGroq:', err);
    return [];
  }
}
