import { Router, Response } from 'express';
import { prisma } from '../prisma/client';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

router.get('/conversations', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const conversations = await prisma.conversation.findMany({
      where: {
        OR: [
          { tenantId: userId },
          { landlordId: userId }
        ]
      },
      include: {
        tenant: {
          select: { id: true, firstName: true, lastName: true, avatar: true, role: true }
        },
        landlord: {
          select: { id: true, firstName: true, lastName: true, avatar: true, role: true }
        },
        property: {
          select: { id: true, title: true, rent: true, city: true, images: { take: 1, select: { url: true } } }
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            sender: { select: { id: true, firstName: true } }
          }
        }
      },
      orderBy: { lastMessageAt: 'desc' }
    });

    const formatted = conversations.map(c => {
      const isTenant = c.tenantId === userId;
      const otherUser = isTenant ? c.landlord : c.tenant;
      return {
        id: c.id,
        otherUser,
        property: c.property,
        lastMessage: c.messages[0] || null,
        lastMessageAt: c.lastMessageAt,
        createdAt: c.createdAt
      };
    });

    return res.json({ success: true, conversations: formatted });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch conversations' });
  }
});

router.get('/conversations/:id/messages', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user!.id;

    const conversation = await prisma.conversation.findUnique({
      where: { id },
      include: {
        tenant: { select: { id: true, firstName: true, lastName: true, avatar: true } },
        landlord: { select: { id: true, firstName: true, lastName: true, avatar: true } },
        property: { select: { id: true, title: true, rent: true, city: true } }
      }
    });

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    if (conversation.tenantId !== userId && conversation.landlordId !== userId && req.user!.role !== 'ADMIN') {
      return res.status(403).json({ success: false, message: 'Unauthorized access to conversation' });
    }

    const messages = await prisma.message.findMany({
      where: { conversationId: id },
      include: {
        sender: {
          select: { id: true, firstName: true, lastName: true, avatar: true }
        }
      },
      orderBy: { createdAt: 'asc' }
    });

    await prisma.message.updateMany({
      where: {
        conversationId: id,
        senderId: { not: userId },
        isRead: false
      },
      data: { isRead: true }
    });

    const isTenant = conversation.tenantId === userId;
    const otherUser = isTenant ? conversation.landlord : conversation.tenant;

    return res.json({
      success: true,
      conversation: {
        id: conversation.id,
        otherUser,
        property: conversation.property
      },
      messages
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch messages' });
  }
});

router.post('/conversations', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const targetUserId = req.body.targetUserId || req.body.recipientId;
    const propertyId = req.body.propertyId || null;
    const initialMessage = req.body.initialMessage;
    const senderId = req.user!.id;

    if (!targetUserId) {
      return res.status(400).json({ success: false, message: 'targetUserId or recipientId is required' });
    }

    if (targetUserId === senderId) {
      return res.status(400).json({ success: false, message: 'Cannot start conversation with yourself' });
    }

    const recipient = await prisma.user.findUnique({ where: { id: targetUserId } });
    if (!recipient) {
      return res.status(404).json({ success: false, message: 'Target user not found' });
    }

    let conversation = await prisma.conversation.findFirst({
      where: {
        OR: [
          { tenantId: senderId, landlordId: targetUserId },
          { tenantId: targetUserId, landlordId: senderId }
        ],
        ...(propertyId ? { propertyId } : {})
      }
    });

    if (!conversation) {

      let tId = senderId;
      let lId = targetUserId;
      if (req.user!.role === 'LANDLORD' || recipient.role === 'TENANT') {
        tId = targetUserId;
        lId = senderId;
      }

      conversation = await prisma.conversation.create({
        data: {
          tenantId: tId,
          landlordId: lId,
          propertyId,
          lastMessageAt: new Date()
        }
      });
    }

    if (initialMessage && initialMessage.trim()) {
      await prisma.message.create({
        data: {
          conversationId: conversation.id,
          senderId,
          content: initialMessage.trim()
        }
      });
      await prisma.conversation.update({
        where: { id: conversation.id },
        data: { lastMessageAt: new Date() }
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Conversation ready',
      conversation,
      conversationId: conversation.id
    });
  } catch (error: any) {
    console.error('Conversation create error:', error);
    return res.status(500).json({ success: false, message: 'Failed to create conversation: ' + error.message });
  }
});

router.post('/conversations/:id/messages', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const conversationId = req.params.id;
    const { content } = req.body;
    const senderId = req.user!.id;

    if (!content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'Message content cannot be empty' });
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId }
    });

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    if (conversation.tenantId !== senderId && conversation.landlordId !== senderId) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId,
        content: content.trim()
      },
      include: {
        sender: {
          select: { id: true, firstName: true, lastName: true, avatar: true }
        }
      }
    });

    await prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() }
    });

    const io = req.app.get('io');
    if (io) {
      const recipientId = conversation.tenantId === senderId ? conversation.landlordId : conversation.tenantId;
      io.to(`conv_${conversationId}`).emit('new_message', message);
      io.to(`user_${recipientId}`).emit('new_message', message);
      io.to(`user_${senderId}`).emit('new_message', message);
      io.to(`user_${recipientId}`).emit('notification_received', {
        title: `New message from ${message.sender.firstName}`,
        message: content.length > 50 ? content.slice(0, 47) + '...' : content,
        type: 'NEW_MESSAGE',
        conversationId
      });
    }

    return res.status(201).json({ success: true, message });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to send message: ' + error.message });
  }
});

router.post('/messages', authenticateToken, async (req: AuthRequest, res: Response) => {
  try {
    const { conversationId, content } = req.body;
    const senderId = req.user!.id;

    if (!conversationId || !content || !content.trim()) {
      return res.status(400).json({ success: false, message: 'conversationId and content are required' });
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId }
    });

    if (!conversation) {
      return res.status(404).json({ success: false, message: 'Conversation not found' });
    }

    if (conversation.tenantId !== senderId && conversation.landlordId !== senderId) {
      return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const message = await prisma.message.create({
      data: {
        conversationId,
        senderId,
        content: content.trim()
      },
      include: {
        sender: {
          select: { id: true, firstName: true, lastName: true, avatar: true }
        }
      }
    });

    await prisma.conversation.update({
      where: { id: conversationId },
      data: { lastMessageAt: new Date() }
    });

    const io = req.app.get('io');
    if (io) {
      const recipientId = conversation.tenantId === senderId ? conversation.landlordId : conversation.tenantId;
      io.to(`conv_${conversationId}`).emit('new_message', message);
      io.to(`user_${recipientId}`).emit('new_message', message);
      io.to(`user_${senderId}`).emit('new_message', message);
      io.to(`user_${recipientId}`).emit('notification_received', {
        title: `New message from ${message.sender.firstName}`,
        message: content.length > 50 ? content.slice(0, 47) + '...' : content,
        type: 'NEW_MESSAGE',
        conversationId
      });
    }

    return res.status(201).json({ success: true, message });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: 'Failed to send message: ' + error.message });
  }
});

export default router;
