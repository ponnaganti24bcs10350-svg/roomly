import { Router, Request, Response } from 'express';
import { prisma } from '../prisma/client';
import { authenticateToken, AuthRequest, optionalAuth, requireRoles } from '../middleware/auth';
import { generatePlacesWithGroq } from '../services/groqPlaces';

const router = Router();

router.get('/amenities', async (req: Request, res: Response) => {
  try {
    const amenities = await prisma.amenity.findMany({
      orderBy: { name: 'asc' }
    });
    return res.json({ success: true, amenities });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch amenities' });
  }
});

router.get('/cities', async (req: Request, res: Response) => {
  try {
    const properties = await prisma.property.findMany({
      where: { status: 'ACTIVE' },
      select: { city: true },
      distinct: ['city']
    });
    const cities = properties
      .map((p) => p.city)
      .filter((c): c is string => Boolean(c) && c.trim().length > 0)
      .sort((a, b) => a.localeCompare(b));
    return res.json({ success: true, cities });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch cities' });
  }
});

router.get('/', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const {
      search,
      city,
      propertyType,
      furnishing,
      minRent,
      maxRent,
      amenities,
      sortBy = 'newest',
      page = '1',
      limit = '12'
    } = req.query;

    const pageNum = Math.max(1, parseInt(page as string, 10) || 1);
    const take = Math.min(50, Math.max(1, parseInt(limit as string, 10) || 12));
    const skip = (pageNum - 1) * take;

    const where: any = {
      status: 'ACTIVE'
    };

    if (city && city !== 'All') {
      where.city = { contains: city as string, mode: 'insensitive' };
    }

    if (propertyType && propertyType !== 'All') {
      where.propertyType = propertyType as any;
    }

    if (furnishing && furnishing !== 'All') {
      where.furnishing = furnishing as any;
    }

    if (minRent || maxRent) {
      where.rent = {};
      if (minRent) where.rent.gte = parseInt(minRent as string, 10);
      if (maxRent) where.rent.lte = parseInt(maxRent as string, 10);
    }

    if (search) {
      where.OR = [
        { title: { contains: search as string, mode: 'insensitive' } },
        { description: { contains: search as string, mode: 'insensitive' } },
        { address: { contains: search as string, mode: 'insensitive' } },
        { neighborhood: { contains: search as string, mode: 'insensitive' } }
      ];
    }

    if (amenities) {
      const amenitySlugs = (amenities as string).split(',').filter(Boolean);
      if (amenitySlugs.length > 0) {
        where.amenities = {
          some: {
            amenity: {
              slug: { in: amenitySlugs }
            }
          }
        };
      }
    }

    let orderBy: any = { createdAt: 'desc' };
    if (sortBy === 'rent_asc') orderBy = { rent: 'asc' };
    if (sortBy === 'rent_desc') orderBy = { rent: 'desc' };
    if (sortBy === 'views') orderBy = { viewsCount: 'desc' };

    let [total, properties] = await Promise.all([
      prisma.property.count({ where }),
      prisma.property.findMany({
        where,
        take,
        skip,
        orderBy,
        include: {
          images: { orderBy: { displayOrder: 'asc' } },
          rooms: true,
          amenities: {
            include: { amenity: true }
          },
          landlord: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
              isProfileVerified: true
            }
          },
          ...(req.user ? {
            favorites: {
              where: { userId: req.user.id }
            }
          } : {})
        }
      })
    ]);

    if (total === 0 && ((city && city !== 'All') || search)) {
      const targetQuery = (city && city !== 'All') ? (city as string) : (search as string);
      const cleanedTarget = targetQuery.replace(/\b(apartments?|flats?|rooms?|rentals?|in|near)\b/gi, '').trim() || targetQuery;
      try {
        console.log(`🤖 Groq AI generating real listings for: "${cleanedTarget}"...`);
        const groqProps = await generatePlacesWithGroq(cleanedTarget);
        if (groqProps && groqProps.length > 0) {
          total = groqProps.length;
          properties = groqProps as any;
        }
      } catch (e) {
        console.warn('Groq generation fallback error:', e);
      }
    }

    const formattedProperties = properties.map(p => ({
      ...p,
      isFavorited: req.user ? ((p as any).favorites && (p as any).favorites.length > 0) : false
    }));

    return res.json({
      success: true,
      properties: formattedProperties,
      pagination: {
        total,
        page: pageNum,
        limit: take,
        totalPages: Math.ceil(total / take)
      }
    });
  } catch (error: any) {
    console.error('Property search error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch properties' });
  }
});

router.get('/my-listings', authenticateToken, requireRoles('LANDLORD', 'ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const listings = await prisma.property.findMany({
      where: { landlordId: req.user!.id },
      include: {
        images: { orderBy: { displayOrder: 'asc' } },
        rooms: true,
        amenities: { include: { amenity: true } },
        visitRequests: {
          where: { status: 'PENDING' },
          select: { id: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const formatted = listings.map(p => ({
      ...p,
      pendingVisitsCount: p.visitRequests.length
    }));

    return res.json({ success: true, listings: formatted });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch your listings' });
  }
});

router.get('/compare', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { ids } = req.query;
    if (!ids) {
      return res.status(400).json({ success: false, message: 'ids query parameter is required' });
    }

    const propertyIds = (ids as string).split(',').filter(Boolean).slice(0, 4);
    if (propertyIds.length === 0) {
      return res.json({ success: true, properties: [] });
    }

    const properties = await prisma.property.findMany({
      where: { id: { in: propertyIds }, status: 'ACTIVE' },
      include: {
        images: { orderBy: { displayOrder: 'asc' } },
        rooms: true,
        amenities: { include: { amenity: true } },
        landlord: {
          select: { id: true, firstName: true, lastName: true, avatar: true, isProfileVerified: true }
        }
      }
    });

    const ordered = propertyIds
      .map(id => properties.find(p => p.id === id))
      .filter(Boolean);

    return res.json({ success: true, properties: ordered });
  } catch (error: any) {
    console.error('Compare properties error:', error);
    return res.status(500).json({ success: false, message: 'Failed to compare properties' });
  }
});

router.get('/:id', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const property = await prisma.property.findUnique({
      where: { id },
      include: {
        images: { orderBy: { displayOrder: 'asc' } },
        rooms: { orderBy: { rent: 'asc' } },
        amenities: {
          include: { amenity: true }
        },
        reviews: {
          include: {
            author: {
              select: { id: true, firstName: true, lastName: true, avatar: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        landlord: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            avatar: true,
            isProfileVerified: true,
            createdAt: true
          }
        },
        ...(req.user ? {
          favorites: {
            where: { userId: req.user.id }
          }
        } : {})
      }
    });

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    prisma.property.update({
      where: { id },
      data: { viewsCount: { increment: 1 } }
    }).catch(() => {});

    return res.json({
      success: true,
      property: {
        ...property,
        isFavorited: req.user ? ((property as any).favorites && (property as any).favorites.length > 0) : false
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch property details' });
  }
});

router.post('/', authenticateToken, requireRoles('LANDLORD', 'ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const {
      title,
      description,
      propertyType,
      furnishing,
      address,
      city,
      neighborhood,
      latitude,
      longitude,
      rent,
      deposit,
      availableFrom,
      distanceMetro,
      distanceCollege,
      distanceTechPark,
      distanceHospital,
      amenityIds = [],
      images = [],
      rooms = []
    } = req.body;

    if (!title || !description || !address || !city || !rent || !deposit) {
      return res.status(400).json({ success: false, message: 'Required fields: title, description, address, city, rent, deposit' });
    }

    const newProperty = await prisma.property.create({
      data: {
        landlordId: req.user!.id,
        title,
        description,
        propertyType: propertyType || 'APARTMENT',
        furnishing: furnishing || 'FURNISHED',
        address,
        city,
        neighborhood: neighborhood || null,
        latitude: parseFloat(latitude) || 12.9716,
        longitude: parseFloat(longitude) || 77.5946,
        rent: parseInt(rent, 10),
        deposit: parseInt(deposit, 10),
        availableFrom: availableFrom ? new Date(availableFrom) : new Date(),
        distanceMetro: distanceMetro ? parseFloat(distanceMetro) : null,
        distanceCollege: distanceCollege ? parseFloat(distanceCollege) : null,
        distanceTechPark: distanceTechPark ? parseFloat(distanceTechPark) : null,
        distanceHospital: distanceHospital ? parseFloat(distanceHospital) : null,
        status: 'ACTIVE',
        isVerified: true,

        amenities: {
          create: amenityIds.map((aId: string) => ({
            amenity: { connect: { id: aId } }
          }))
        },

        images: {
          create: images.map((img: any, idx: number) => ({
            url: img.url || img,
            caption: img.caption || null,
            category: img.category || 'EXTERIOR',
            displayOrder: idx,
            isCover: idx === 0
          }))
        },

        rooms: {
          create: rooms.map((r: any) => ({
            name: r.name || 'Standard Bedroom',
            rent: parseInt(r.rent, 10) || parseInt(rent, 10),
            deposit: parseInt(r.deposit, 10) || parseInt(deposit, 10),
            totalBeds: parseInt(r.totalBeds, 10) || 1,
            occupiedBeds: 0,
            isAvailable: true,
            hasEnsuiteBath: !!r.hasEnsuiteBath,
            hasBalcony: !!r.hasBalcony,
            hasAC: !!r.hasAC
          }))
        }
      },
      include: {
        images: true,
        rooms: true,
        amenities: { include: { amenity: true } }
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Property created successfully',
      property: newProperty
    });
  } catch (error: any) {
    console.error('Create property error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create listing: ' + error.message });
  }
});

router.put('/:id', authenticateToken, requireRoles('LANDLORD', 'ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const property = await prisma.property.findUnique({ where: { id } });

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    if (property.landlordId !== req.user!.id && req.user!.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Unauthorized to edit this property' });
    }

    const {
      title,
      description,
      rent,
      deposit,
      furnishing,
      propertyType,
      address,
      city,
      neighborhood,
      status
    } = req.body;

    const updated = await prisma.property.update({
      where: { id },
      data: {
        ...(title ? { title } : {}),
        ...(description ? { description } : {}),
        ...(rent !== undefined ? { rent: parseInt(rent, 10) } : {}),
        ...(deposit !== undefined ? { deposit: parseInt(deposit, 10) } : {}),
        ...(furnishing ? { furnishing } : {}),
        ...(propertyType ? { propertyType } : {}),
        ...(address ? { address } : {}),
        ...(city ? { city } : {}),
        ...(neighborhood !== undefined ? { neighborhood } : {}),
        ...(status ? { status } : {})
      },
      include: {
        images: true,
        rooms: true,
        amenities: { include: { amenity: true } }
      }
    });

    return res.json({ success: true, message: 'Listing updated successfully', property: updated });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to update property: ' + error.message });
  }
});

router.delete('/:id', authenticateToken, requireRoles('LANDLORD', 'ADMIN'), async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const property = await prisma.property.findUnique({ where: { id } });

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    if (property.landlordId !== req.user!.id && req.user!.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Unauthorized to delete this property' });
    }

    await prisma.property.delete({ where: { id } });
    return res.json({ success: true, message: 'Property deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to delete property' });
  }
});

router.post('/:id/favorite', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id: propertyId } = req.params;
    const userId = req.user!.id;

    const existingFavorite = await prisma.favorite.findUnique({
      where: {
        userId_propertyId: { userId, propertyId }
      }
    });

    if (existingFavorite) {
      await prisma.favorite.delete({
        where: { id: existingFavorite.id }
      });
      return res.json({ success: true, isFavorited: false, message: 'Removed from favorites' });
    } else {
      await prisma.favorite.create({
        data: { userId, propertyId }
      });
      return res.json({ success: true, isFavorited: true, message: 'Added to favorites' });
    }
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to toggle favorite: ' + error.message });
  }
});

router.post('/:id/reviews', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id: propertyId } = req.params;
    const { rating, comment } = req.body;

    if (!rating || !comment) {
      return res.status(400).json({ success: false, message: 'Rating and comment are required' });
    }

    const review = await prisma.review.create({
      data: {
        propertyId,
        authorId: req.user!.id,
        rating: Math.min(5, Math.max(1, parseInt(rating, 10))),
        comment: comment.trim()
      },
      include: {
        author: {
          select: { id: true, firstName: true, lastName: true, avatar: true }
        }
      }
    });

    return res.status(201).json({ success: true, message: 'Review added', review });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to add review: ' + error.message });
  }
});

export default router;
