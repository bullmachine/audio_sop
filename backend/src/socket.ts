import { Server } from 'socket.io';
import { createServer } from 'http';
import mongoose from 'mongoose';
import app from './app';
import { logInfo, logError } from './utils/logger';
import User from './models/User';
 

// Create HTTP server from Express app
const server = createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:5173", "http://localhost:3001"], // Frontend URLs
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Store connected users
const connectedUsers = new Map<string, string>(); // userId -> socketId

// Handle Socket.IO connections
io.on('connection', (socket) => { 
  
  // Get userId from query
  const userId = socket.handshake.query.userId as string;
  
  if (userId) {
    // Join user-specific room
    socket.join(`user_${userId}`);
    
    // Store user connection
    connectedUsers.set(userId, socket.id);
     
    
    // Send connection confirmation
    socket.emit('connected', { 
      userId, 
      socketId: socket.id,
      message: 'Successfully connected to notification server'
    });
    
    // Send pending requests for user's level after connection is established
    setTimeout(async () => {
      await sendPendingRequestsForUser(userId, socket);
    }, 1000);
    
    // Handle joining level-specific room
    socket.on('join_level_room', (levelId) => { 
      socket.join(`level_${levelId}`);
      socket.emit('joined_level_room', { levelId, message: 'Joined level room successfully' });
    });
    
    // Handle user disconnection
    socket.on('disconnect', () => { 
      
      // Remove from connected users
      connectedUsers.delete(userId);
      
    });
    
    // Handle errors
    socket.on('error', (error) => {
      logError(`❌ Socket.IO error for user ${userId}: ${error}`);
    });
    
  } else {
    logError(`❌ User connected without userId: ${socket.id}`);
    socket.disconnect();
  }
});

// Export function to send pending requests to user based on their level
export const sendPendingRequestsForUser = async (userId: string, socket: any) => {
  try { 
    
    // Get user details with role and plant
    const user = await User.findById(userId).lean();
    if (!user) { 
      return;
    }
    
    if (!user.role) { 
      return;
    } 
     
  } catch (error) {
    logError(`❌ Error sending pending requests to user ${userId}: ${error}`);
  }
};

// Export Socket.IO instance for use in controllers
export { io };

// Export function to send notifications to specific users
export const sendNotificationToUser = (userId: string, notification: any) => { 
  io.to(`user_${userId}`).emit('notification', notification);
};

// Export function to broadcast notifications to all users
export const broadcastNotification = (event: string, data: any) => { 
  io.emit(event, data);
};

// Export function to get connected users count
export const getConnectedUsersCount = () => {
  return connectedUsers.size;
};

// Export function to check if user is connected
export const isUserConnected = (userId: string) => {
  return connectedUsers.has(userId);
};

// Export the server to be used in server.ts
export default server;
