import { Router, Response } from 'express';
import { prisma } from '../prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/my-visits', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const role = req.user!.role;

    let visits;
    if (role === 'LANDLORD' || role === 'ADMIN') {
      visits = await prisma.visitRequest.findMany({
        where: {
          property: { landlordId: userId }
        },
        include: {
          tenant: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              avatar: true,
              isProfileVerified: true,
              roommateProfile: true
            }
          },
          property: {
            select: {
              id: true,
              title: true,
              address: true,
              city: true,
              rent: true,
              images: { take: 1, select: { url: true } }
            }
          }
        },
        orderBy: { preferredDate: 'asc' }
      });
    } else {
      visits = await prisma.visitRequest.findMany({
        where: { tenantId: userId },
        include: {
          property: {
            select: {
              id: true,
              title: true,
              address: true,
              city: true,
              rent: true,
              images: { take: 1, select: { url: true } },
              landlord: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  phone: true,
                  avatar: true
                }
              }
            }
          }
        },
        orderBy: { preferredDate: 'asc' }
      });
    }

    return res.json({ success: true, visits });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch visits' });
  }
});

router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { propertyId, preferredDate, preferredTimeSlot, notes } = req.body;
    const tenantId = req.user!.id;

    if (!propertyId || !preferredDate || !preferredTimeSlot) {
      return res.status(400).json({ success: false, message: 'propertyId, preferredDate, and preferredTimeSlot are required' });
    }

    const property = await prisma.property.findUnique({
      where: { id: propertyId }
    });

    if (!property) {
      return res.status(404).json({ success: false, message: 'Property not found' });
    }

    const visit = await prisma.visitRequest.create({
      data: {
        tenantId,
        propertyId,
        preferredDate: new Date(preferredDate),
        preferredTimeSlot,
        notes: notes || null,
        status: 'PENDING'
      },
      include: {
        property: {
          select: { title: true, landlordId: true }
        }
      }
    });

    await prisma.notification.create({
      data: {
        userId: property.landlordId,
        title: 'New Visit Request',
        message: `${req.user!.firstName} requested a tour of "${property.title}" for ${preferredTimeSlot}`,
        type: 'VISIT_REQUEST',
        link: '/visits'
      }
    });

    return res.status(201).json({
      success: true,
      message: 'Visit request submitted successfully',
      visit
    });
  } catch (error: any) {
    console.error('Visit create error:', error);
    return res.status(500).json({ success: false, message: 'Failed to schedule visit: ' + error.message });
  }
});

router.patch('/:id/status', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, landlordNotes } = req.body;
    const userId = req.user!.id;

    const visit = await prisma.visitRequest.findUnique({
      where: { id },
      include: {
        property: true,
        tenant: { select: { id: true, firstName: true } }
      }
    });

    if (!visit) {
      return res.status(404).json({ success: false, message: 'Visit request not found' });
    }

    const isLandlord = visit.property.landlordId === userId;
    const isTenant = visit.tenantId === userId;

    if (!isLandlord && !isTenant && req.user!.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Unauthorized to update this visit' });
    }

    const updated = await prisma.visitRequest.update({
      where: { id },
      data: {
        status: status as any,
        ...(landlordNotes !== undefined ? { landlordNotes } : {})
      }
    });

    const targetUserId = isLandlord ? visit.tenantId : visit.property.landlordId;
    await prisma.notification.create({
      data: {
        userId: targetUserId,
        title: `Visit Request ${status}`,
        message: `The visit for "${visit.property.title}" was marked as ${status}.`,
        type: 'VISIT_UPDATE',
        link: '/visits'
      }
    });

    return res.json({ success: true, message: `Visit marked as ${status}`, visit: updated });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to update visit status: ' + error.message });
  }
});

export default router;
