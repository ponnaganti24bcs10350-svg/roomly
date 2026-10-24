import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'roomly_jwt_secret_production_ready_token_key_2026';

router.post('/register', async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, role, phone, avatar } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ success: false, message: 'Please provide email, password, firstName and lastName' });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    });

    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email already exists' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const assignedRole = role === 'LANDLORD' ? 'LANDLORD' : role === 'ADMIN' ? 'ADMIN' : 'TENANT';

    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        password: passwordHash,
        firstName,
        lastName,
        phone: phone || null,
        avatar: avatar || null,
        role: assignedRole,
        isEmailVerified: true,
        isPhoneVerified: true,
        isProfileVerified: true,
        ...(assignedRole === 'TENANT' ? {
          roommateProfile: {
            create: {
              budgetMin: 8000,
              budgetMax: 18000,
              preferredCity: 'Bangalore',
              preferredLocations: 'Koramangala, HSR Layout',
              sleepSchedule: 'NIGHT_OWL',
              foodPreference: 'FLEXIBLE',
              cleanliness: 4,
              smoking: 'NON_SMOKER',
              pets: 'LOVES_PETS',
              socialLevel: 3,
              guests: 'SOMETIMES',
              noiseTolerance: 3,
              bio: 'Excited to find a great home with like-minded flatmates!'
            }
          }
        } : {})
      },
      include: {
        roommateProfile: true
      }
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password: _, ...userWithoutPassword } = user;
    return res.status(201).json({
      success: true,
      message: 'Registration successful',
      token,
      user: userWithoutPassword
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return res.status(500).json({ success: false, message: 'Registration failed: ' + error.message });
  }
});

router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide both email and password' });
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        roommateProfile: true,
        favorites: { select: { propertyId: true } }
      }
    });

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    if (user.status !== 'ACTIVE') {
      return res.status(403).json({ success: false, message: 'Your account is deactivated or suspended. Please contact support.' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password: _, ...userWithoutPassword } = user;
    return res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        ...userWithoutPassword,
        favoritePropertyIds: user.favorites.map(f => f.propertyId)
      }
    });
  } catch (error: any) {
    console.error('Login error:', error);
    return res.status(500).json({ success: false, message: 'Login failed: ' + error.message });
  }
});

router.get('/me', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: {
        roommateProfile: true,
        favorites: { select: { propertyId: true } }
      }
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const { password: _, ...userWithoutPassword } = user;
    return res.json({
      success: true,
      user: {
        ...userWithoutPassword,
        favoritePropertyIds: user.favorites.map(f => f.propertyId)
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch user session' });
  }
});

router.put('/profile', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { firstName, lastName, phone, avatar } = req.body;

    const updatedUser = await prisma.user.update({
      where: { id: req.user!.id },
      data: {
        ...(firstName ? { firstName } : {}),
        ...(lastName !== undefined ? { lastName } : {}),
        ...(phone !== undefined ? { phone } : {}),
        ...(avatar !== undefined ? { avatar } : {})
      },
      include: {
        roommateProfile: true,
        favorites: { select: { propertyId: true } }
      }
    });

    const { password: _, ...userWithoutPassword } = updatedUser;
    return res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        ...userWithoutPassword,
        favoritePropertyIds: updatedUser.favorites.map(f => f.propertyId)
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to update profile: ' + error.message });
  }
});

router.put('/roommate-profile', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const {
      budgetMin,
      budgetMax,
      preferredCity,
      preferredLocations,
      occupation,
      companyOrCollege,
      age,
      gender,
      sleepSchedule,
      foodPreference,
      cleanliness,
      smoking,
      pets,
      socialLevel,
      guests,
      noiseTolerance,
      bio
    } = req.body;

    const profile = await prisma.roommateProfile.upsert({
      where: { userId: req.user!.id },
      create: {
        userId: req.user!.id,
        budgetMin: parseInt(budgetMin) || 8000,
        budgetMax: parseInt(budgetMax) || 18000,
        preferredCity: preferredCity || 'Bangalore',
        preferredLocations: preferredLocations || null,
        occupation: occupation || null,
        companyOrCollege: companyOrCollege || null,
        age: age ? parseInt(age) : 24,
        gender: gender || 'Any',
        sleepSchedule: sleepSchedule || 'NIGHT_OWL',
        foodPreference: foodPreference || 'FLEXIBLE',
        cleanliness: parseInt(cleanliness) || 4,
        smoking: smoking || 'NON_SMOKER',
        pets: pets || 'LOVES_PETS',
        socialLevel: parseInt(socialLevel) || 3,
        guests: guests || 'SOMETIMES',
        noiseTolerance: parseInt(noiseTolerance) || 3,
        bio: bio || null
      },
      update: {
        budgetMin: budgetMin !== undefined ? parseInt(budgetMin) : undefined,
        budgetMax: budgetMax !== undefined ? parseInt(budgetMax) : undefined,
        preferredCity: preferredCity !== undefined ? preferredCity : undefined,
        preferredLocations: preferredLocations !== undefined ? preferredLocations : undefined,
        occupation: occupation !== undefined ? occupation : undefined,
        companyOrCollege: companyOrCollege !== undefined ? companyOrCollege : undefined,
        age: age !== undefined ? parseInt(age) : undefined,
        gender: gender !== undefined ? gender : undefined,
        sleepSchedule: sleepSchedule !== undefined ? sleepSchedule : undefined,
        foodPreference: foodPreference !== undefined ? foodPreference : undefined,
        cleanliness: cleanliness !== undefined ? parseInt(cleanliness) : undefined,
        smoking: smoking !== undefined ? smoking : undefined,
        pets: pets !== undefined ? pets : undefined,
        socialLevel: socialLevel !== undefined ? parseInt(socialLevel) : undefined,
        guests: guests !== undefined ? guests : undefined,
        noiseTolerance: noiseTolerance !== undefined ? parseInt(noiseTolerance) : undefined,
        bio: bio !== undefined ? bio : undefined
      }
    });

    return res.json({
      success: true,
      message: 'Roommate preferences saved successfully',
      roommateProfile: profile
    });
  } catch (error: any) {
    console.error('Roommate profile update error:', error);
    return res.status(500).json({ success: false, message: 'Failed to update roommate preferences: ' + error.message });
  }
});

router.get('/active-users', async (_req: Request, res: Response) => {
  try {
    const { onlineUsersMap } = await import('../socket');
    const activeList = Array.from(onlineUsersMap.values());
    return res.json({ success: true, activeUsers: activeList });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to fetch active users' });
  }
});

export default router;
