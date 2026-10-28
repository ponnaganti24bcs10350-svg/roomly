import { Server as SocketIOServer, Socket } from 'socket.io';
import { prisma } from '../prisma/client';

export interface OnlineUser {
  userId: string;
  socketId: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
  city?: string;
  occupation?: string;
  connectedAt: Date;
}

export const onlineUsersMap = new Map<string, OnlineUser>();

export function setupSocketIO(io: SocketIOServer) {
  io.on('connection', (socket: Socket) => {
    console.log(`🔌 Client connected: ${socket.id}`);

    socket.on('register_user', async (userId: string) => {
      if (!userId) return;
      socket.join(`user_${userId}`);
      console.log(`👤 User joined personal room: user_${userId}`);

      try {
        const user = await prisma.user.findUnique({
          where: { id: userId },
          include: { roommateProfile: true }
        });

        if (user) {
          const onlineInfo: OnlineUser = {
            userId: user.id,
            socketId: socket.id,
            name: `${user.firstName} ${user.lastName}`.trim(),
            email: user.email,
            avatar: user.avatar,
            role: user.role,
            city: user.roommateProfile?.preferredCity || 'Bangalore',
            occupation: user.roommateProfile?.occupation || (user.role === 'LANDLORD' ? 'Property Owner' : 'Flatmate'),
            connectedAt: new Date()
          };

          onlineUsersMap.set(userId, onlineInfo);

          const activeList = Array.from(onlineUsersMap.values());
          io.emit('online_users_updated', activeList);
          console.log(`🟢 Online users count: ${onlineUsersMap.size}`);
        }
      } catch (err) {
        console.error('Error registering active user in socket:', err);
      }
    });

    socket.on('join_conversation', (conversationId: string) => {
      if (!conversationId) return;
      socket.join(`conv_${conversationId}`);
      console.log(`💬 Socket joined conv_${conversationId}`);
    });

    socket.on('leave_conversation', (conversationId: string) => {
      if (!conversationId) return;
      socket.leave(`conv_${conversationId}`);
    });

    socket.on('send_message', async (data: { conversationId: string; senderId: string; content: string }) => {
      const { conversationId, senderId, content } = data;
      if (!conversationId || !senderId || !content?.trim()) return;

      try {
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

        const conversation = await prisma.conversation.update({
          where: { id: conversationId },
          data: { lastMessageAt: new Date() }
        });

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
      } catch (err) {
        console.error('Socket message error:', err);
      }
    });

    socket.on('typing_start', (data: { conversationId: string; userName: string; userId: string }) => {
      socket.to(`conv_${data.conversationId}`).emit('user_typing', data);
    });

    socket.on('typing_stop', (data: { conversationId: string; userId: string }) => {
      socket.to(`conv_${data.conversationId}`).emit('user_stop_typing', data);
    });

    socket.on('disconnect', () => {
      console.log(`🔌 Client disconnected: ${socket.id}`);
      for (const [uid, data] of onlineUsersMap.entries()) {
        if (data.socketId === socket.id) {
          onlineUsersMap.delete(uid);
          break;
        }
      }
      io.emit('online_users_updated', Array.from(onlineUsersMap.values()));
    });
  });
}
