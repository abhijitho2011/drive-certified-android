import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { AppRole } from '@prisma/client';

@Injectable()
export class AuthService {
    constructor(
        private prisma: PrismaService,
        private jwtService: JwtService,
    ) { }

    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.prisma.user.findUnique({ where: { email } });
        if (user && (await bcrypt.compare(pass, user.password))) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    async login(user: any) {
        const payload = { email: user.email, sub: user.id, role: user.role };
        return {
            access_token: this.jwtService.sign(payload),
            user: user,
        };
    }

    async register(data: { email: string; password: string; firstName?: string; lastName?: string; phone?: string; role?: AppRole }) {
        const hashedPassword = await bcrypt.hash(data.password, 10);
        const role = data.role || AppRole.driver; // Default to driver

        const user = await this.prisma.user.create({
            data: {
                email: data.email,
                password: hashedPassword,
                role,
            },
        });

        // Create UserRole entry
        await this.prisma.userRole.create({
            data: {
                userId: user.id,
                role: role,
            },
        });

        // If driver role and we have driver info, create Driver record
        if (role === AppRole.driver && data.firstName && data.lastName) {
            await this.prisma.driver.create({
                data: {
                    userId: user.id,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    phone: data.phone || '',
                    address: '',
                    district: '',
                    state: '',
                    pinCode: '',
                },
            });
        }

        const { password, ...result } = user;
        return { user: result };
    }
}
