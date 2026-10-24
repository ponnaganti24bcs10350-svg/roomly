import { Router, Response } from 'express';
import { prisma } from '../prisma/client';
import { authenticateToken, AuthRequest, optionalAuth } from '../middleware/auth';
import { calculateCompatibility } from '../services/matchingEngine';

const router = Router();

router.get('/', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { city, food, smoking, sleep, maxBudget, search } = req.query;

    const where: any = {
      user: {
        status: 'ACTIVE',
        role: 'TENANT',
        ...(req.user ? { id: { not: req.user.id } } : {})
      }
    };

    if (city && city !== 'All') {
      where.preferredCity = { contains: city as string, mode: 'insensitive' };
    }

    if (food && food !== 'All') {
      where.foodPreference = food as string;
    }

    if (smoking && smoking !== 'All') {
      where.smoking = smoking as string;
    }

    if (sleep && sleep !== 'All') {
      where.sleepSchedule = sleep as string;
    }

    if (maxBudget) {
      where.budgetMin = { lte: parseInt(maxBudget as string, 10) };
    }

    let currentUserProfile: any = null;
    if (req.user) {
      currentUserProfile = await prisma.roommateProfile.findUnique({
        where: { userId: req.user.id }
      });
    }

    const profiles = await prisma.roommateProfile.findMany({
      where,
      include: {
        user: {
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
        }
      }
    });

    const scoredProfiles = profiles.map(profile => {
      let compatibility = null;
      if (currentUserProfile) {
        compatibility = calculateCompatibility(currentUserProfile, profile);
      }
      return {
        ...profile,
        compatibility
      };
    });

    if (currentUserProfile) {
      scoredProfiles.sort((a, b) => (b.compatibility?.overallScore || 0) - (a.compatibility?.overallScore || 0));
    }

    return res.json({ success: true, roommates: scoredProfiles });
  } catch (error: any) {
    console.error('Roommate feed error:', error);
    return res.status(500).json({ success: false, message: 'Failed to fetch roommate candidates' });
  }
});

router.get('/:userId', optionalAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;

    const profile = await prisma.roommateProfile.findUnique({
      where: { userId },
      include: {
        user: {
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
        }
      }
    });

    if (!profile) {
      return res.status(404).json({ success: false, message: 'Roommate profile not found' });
    }

    let compatibility = null;
    if (req.user && req.user.id !== userId) {
      const myProfile = await prisma.roommateProfile.findUnique({
        where: { userId: req.user.id }
      });
      if (myProfile) {
        compatibility = calculateCompatibility(myProfile, profile);
      }
    }

    return res.json({
      success: true,
      roommate: {
        ...profile,
        compatibility
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch roommate details' });
  }
});

router.post('/match-action', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { targetUserId, action } = req.body;
    const userId = req.user!.id;

    if (!targetUserId || targetUserId === userId) {
      return res.status(400).json({ success: false, message: 'Invalid target user' });
    }

    const [myProfile, targetProfile] = await Promise.all([
      prisma.roommateProfile.findUnique({ where: { userId } }),
      prisma.roommateProfile.findUnique({ where: { userId: targetUserId } })
    ]);

    let score = 75;
    if (myProfile && targetProfile) {
      const resComp = calculateCompatibility(myProfile, targetProfile);
      score = resComp.overallScore;
    }

    const matchStatus = action === 'ACCEPT' ? 'ACCEPTED' : action === 'REJECT' ? 'REJECTED' : 'PENDING';

    const match = await prisma.match.upsert({
      where: {
        userId_matchedUserId: { userId, matchedUserId: targetUserId }
      },
      create: {
        userId,
        matchedUserId: targetUserId,
        compatibilityScore: score,
        status: matchStatus as any
      },
      update: {
        compatibilityScore: score,
        status: matchStatus as any
      }
    });

    return res.json({ success: true, message: 'Match preference recorded', match });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to process match action: ' + error.message });
  }
});

export default router;
