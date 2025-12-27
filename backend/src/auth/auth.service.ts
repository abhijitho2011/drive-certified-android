import {
    Injectable,
    UnauthorizedException,
    ConflictException,
} from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDriverDto } from './dto/register-driver.dto';

@Injectable()
export class AuthService {
    constructor(
        private usersService: UsersService,
        private jwtService: JwtService,
        private prisma: PrismaService,
    ) { }

    async validateUser(email: string, pass: string): Promise<any> {
        const user = await this.usersService.findOne(email);
        if (user && (await bcrypt.compare(pass, user.password))) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }

    async login(user: any) {
        // Fetch user roles
        const userWithRoles = await this.prisma.user.findUnique({
            where: { id: user.id },
            include: {
                userRoles: true,
                driver: true,
                partner: true,
                dataUser: true,
            },
        });

        const roles = userWithRoles?.userRoles.map((ur) => ur.role) || [];

        const payload = {
            email: user.email,
            sub: user.id,
            roles,
        };

        return {
            access_token: this.jwtService.sign(payload),
            user: {
                id: user.id,
                email: user.email,
                roles,
                driver: userWithRoles?.driver,
                partner: userWithRoles?.partner,
                dataUser: userWithRoles?.dataUser,
            },
        };
    }

    async register(registerDto: RegisterDriverDto) {
        // Check if user already exists
        const existingUser = await this.usersService.findOne(registerDto.email);
        if (existingUser) {
            throw new ConflictException('Email already registered');
        }

        // Check if phone already exists
        const existingPhone = await this.prisma.profile.findUnique({
            where: { phone: registerDto.phone },
        });
        if (existingPhone) {
            throw new ConflictException('Phone number already registered');
        }

        const hashedPassword = await bcrypt.hash(registerDto.password, 10);

        // Create user, profile, role, and driver in a transaction
        const result = await this.prisma.$transaction(async (tx) => {
            // Create user
            const user = await tx.user.create({
                data: {
                    email: registerDto.email,
                    password: hashedPassword,
                },
            });

            // Create profile
            await tx.profile.create({
                data: {
                    id: user.id,
                    phone: registerDto.phone,
                    firstName: registerDto.firstName,
                    lastName: registerDto.lastName,
                },
            });

            // Create user role
            await tx.userRole.create({
                data: {
                    userId: user.id,
                    role: 'driver',
                },
            });

            // Create driver record
            const driver = await tx.driver.create({
                data: {
                    userId: user.id,
                    firstName: registerDto.firstName,
                    lastName: registerDto.lastName,
                    phone: registerDto.phone,
                    address: registerDto.address,
                    district: registerDto.district,
                    state: registerDto.state,
                    pinCode: registerDto.pinCode,
                },
            });

            // Create driver employment status
            await tx.driverEmploymentStatus.create({
                data: {
                    driverId: driver.id,
                    employmentStatus: 'unemployed',
                    isVisibleToEmployers: false,
                },
            });

            return { user, driver };
        });

        const { password, ...userResult } = result.user;
        return {
            user: userResult,
            driver: result.driver,
        };
    }
}
