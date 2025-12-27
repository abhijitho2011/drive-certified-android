import {
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect,
    MessageBody,
    ConnectedSocket,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Socket, Server } from 'socket.io';

interface JoinRoomPayload {
    room: string;
    userId: string;
}

interface JobRequestUpdatePayload {
    jobRequestId: string;
    status: string;
    driverId?: string;
    employerId?: string;
}

interface ApplicationUpdatePayload {
    applicationId: string;
    status: string;
    driverId: string;
}

interface NotificationPayload {
    userId: string;
    message: string;
    type: 'info' | 'success' | 'warning' | 'error';
    data?: any;
}

@WebSocketGateway({
    cors: {
        origin: process.env.FRONTEND_URL || 'http://localhost:5173',
        credentials: true,
    },
})
export class AppGateway
    implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer() server: Server;
    private logger: Logger = new Logger('AppGateway');
    private userSockets: Map<string, string> = new Map(); // userId -> socketId

    afterInit(server: Server) {
        this.logger.log('WebSocket Gateway initialized');
    }

    handleConnection(client: Socket) {
        this.logger.log(`Client connected: ${client.id}`);

        // Extract userId from handshake query or auth
        const userId = client.handshake.query.userId as string;
        if (userId) {
            this.userSockets.set(userId, client.id);
            this.logger.log(`User ${userId} mapped to socket ${client.id}`);
        }
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected: ${client.id}`);

        // Remove user from map
        for (const [userId, socketId] of this.userSockets.entries()) {
            if (socketId === client.id) {
                this.userSockets.delete(userId);
                this.logger.log(`User ${userId} removed from socket map`);
                break;
            }
        }
    }

    // Join a room (for application-specific updates)
    @SubscribeMessage('joinRoom')
    handleJoinRoom(
        @ConnectedSocket() client: Socket,
        @MessageBody() payload: JoinRoomPayload,
    ): void {
        client.join(payload.room);
        this.logger.log(
            `Client ${client.id} (User: ${payload.userId}) joined room: ${payload.room}`,
        );
        client.emit('roomJoined', { room: payload.room });
    }

    // Leave a room
    @SubscribeMessage('leaveRoom')
    handleLeaveRoom(
        @ConnectedSocket() client: Socket,
        @MessageBody() payload: { room: string },
    ): void {
        client.leave(payload.room);
        this.logger.log(`Client ${client.id} left room: ${payload.room}`);
        client.emit('roomLeft', { room: payload.room });
    }

    // Job request status update
    @SubscribeMessage('jobRequestUpdate')
    handleJobRequestUpdate(
        @ConnectedSocket() client: Socket,
        @MessageBody() payload: JobRequestUpdatePayload,
    ): void {
        this.logger.log(
            `Job request ${payload.jobRequestId} updated to ${payload.status}`,
        );

        // Notify driver if present
        if (payload.driverId) {
            const driverSocketId = this.userSockets.get(payload.driverId);
            if (driverSocketId) {
                this.server.to(driverSocketId).emit('jobRequestStatusChanged', payload);
            }
        }

        // Notify employer if present
        if (payload.employerId) {
            const employerSocketId = this.userSockets.get(payload.employerId);
            if (employerSocketId) {
                this.server
                    .to(employerSocketId)
                    .emit('jobRequestStatusChanged', payload);
            }
        }
    }

    // Application status update
    @SubscribeMessage('applicationUpdate')
    handleApplicationUpdate(
        @ConnectedSocket() client: Socket,
        @MessageBody() payload: ApplicationUpdatePayload,
    ): void {
        this.logger.log(
            `Application ${payload.applicationId} updated to ${payload.status}`,
        );

        // Notify driver
        const driverSocketId = this.userSockets.get(payload.driverId);
        if (driverSocketId) {
            this.server.to(driverSocketId).emit('applicationStatusChanged', payload);
        }

        // Broadcast to application room
        this.server
            .to(`application:${payload.applicationId}`)
            .emit('applicationStatusChanged', payload);
    }

    // Send notification to specific user
    @SubscribeMessage('sendNotification')
    handleSendNotification(
        @ConnectedSocket() client: Socket,
        @MessageBody() payload: NotificationPayload,
    ): void {
        const targetSocketId = this.userSockets.get(payload.userId);
        if (targetSocketId) {
            this.server.to(targetSocketId).emit('notification', {
                message: payload.message,
                type: payload.type,
                data: payload.data,
                timestamp: new Date().toISOString(),
            });
            this.logger.log(`Notification sent to user ${payload.userId}`);
        } else {
            this.logger.warn(
                `User ${payload.userId} not connected, notification not sent`,
            );
        }
    }

    // Broadcast to all clients in a room
    broadcastToRoom(room: string, event: string, data: any): void {
        this.server.to(room).emit(event, data);
        this.logger.log(`Broadcasted ${event} to room ${room}`);
    }

    // Send to specific user by userId
    sendToUser(userId: string, event: string, data: any): void {
        const socketId = this.userSockets.get(userId);
        if (socketId) {
            this.server.to(socketId).emit(event, data);
            this.logger.log(`Sent ${event} to user ${userId}`);
        } else {
            this.logger.warn(`User ${userId} not connected`);
        }
    }

    // Get connected users count
    getConnectedUsersCount(): number {
        return this.userSockets.size;
    }

    // Check if user is online
    isUserOnline(userId: string): boolean {
        return this.userSockets.has(userId);
    }
}
