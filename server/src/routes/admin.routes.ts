import { Router, Response } from 'express';
import { prisma } from '../prisma/client';
import { authenticateToken, AuthRequest, requireRoles } from '../middleware/auth';

const router = Router();

router.use(authenticateToken, requireRoles('ADMIN'));

router.get('/stats', async (req: AuthRequest, res: Response) => {
  try {
    const [totalUsers, totalProperties, totalVisits, totalReports, pendingVerifications] = await Promise.all([
      prisma.user.count(),
      prisma.property.count(),
      prisma.visitRequest.count(),
      prisma.report.count({ where: { status: 'PENDING' } }),
      prisma.verificationRecord.count({ where: { status: 'PENDING' } })
    ]);

    return res.json({
      success: true,
      stats: {
        totalUsers,
        totalProperties,
        totalVisits,
        pendingReports: totalReports,
        pendingVerifications
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch platform metrics' });
  }
});

router.get('/reports', async (req: AuthRequest, res: Response) => {
  try {
    const reports = await prisma.report.findMany({
      include: {
        reporter: { select: { id: true, firstName: true, lastName: true, email: true } },
        property: { select: { id: true, title: true, address: true, city: true, status: true } },
        targetUser: { select: { id: true, firstName: true, lastName: true, email: true, status: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    return res.json({ success: true, reports });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch reports' });
  }
});

router.patch('/reports/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    const report = await prisma.report.update({
      where: { id },
      data: {
        status,
        ...(adminNotes !== undefined ? { adminNotes } : {})
      }
    });

    return res.json({ success: true, message: 'Report updated successfully', report });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update report' });
  }
});

router.post('/submit-report', async (req: AuthRequest, res: Response) => {
  try {
    const { targetType, targetPropertyId, targetUserId, reason, description } = req.body;
    const reporterId = req.user!.id;

    if (!targetType || !reason || !description) {
      return res.status(400).json({ success: false, message: 'targetType, reason, and description are required' });
    }

    const report = await prisma.report.create({
      data: {
        reporterId,
        targetType,
        targetPropertyId: targetPropertyId || null,
        targetUserId: targetUserId || null,
        reason,
        description,
        status: 'PENDING'
      }
    });

    return res.status(201).json({ success: true, message: 'Report submitted for review', report });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to submit report: ' + error.message });
  }
});

router.get('/verifications', async (req: AuthRequest, res: Response) => {
  try {
    const records = await prisma.verificationRecord.findMany({
      include: {
        user: { select: { id: true, firstName: true, lastName: true, email: true, role: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
    return res.json({ success: true, verifications: records });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch verifications' });
  }
});

router.patch('/verifications/:id', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    const record = await prisma.verificationRecord.update({
      where: { id },
      data: {
        status: status as any,
        adminNotes: adminNotes || null,
        reviewedAt: new Date()
      }
    });

    if (status === 'VERIFIED') {
      await prisma.user.update({
        where: { id: record.userId },
        data: { isProfileVerified: true }
      });
    }

    return res.json({ success: true, message: 'Verification status updated', record });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update verification' });
  }
});

router.patch('/properties/:id/verify', async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { isVerified } = req.body;

    const property = await prisma.property.update({
      where: { id },
      data: { isVerified: !!isVerified }
    });

    return res.json({ success: true, message: 'Property verification updated', property });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update property verification' });
  }
});

export default router;
