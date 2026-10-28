import { Router, Response } from 'express';
import { prisma } from '../prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

router.post('/', authenticateToken, async (req: AuthRequest, res: Response) => {
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

    return res.status(201).json({ success: true, message: 'Report submitted successfully for moderation review', report });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to submit report: ' + error.message });
  }
});

export default router;
