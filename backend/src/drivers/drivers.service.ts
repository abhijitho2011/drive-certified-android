import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class DriversService {
    constructor(private prisma: PrismaService) { }

    async findByUserId(userId: string) {
        return this.prisma.driver.findUnique({
            where: { userId },
            include: {
                applications: {
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                },
                employmentStatus: true,
            },
        });
    }

    async findById(id: string) {
        const driver = await this.prisma.driver.findUnique({
            where: { id },
            include: {
                applications: true,
                employmentStatus: true,
                employmentHistory: {
                    include: {
                        employer: true,
                    },
                },
            },
        });

        if (!driver) {
            throw new NotFoundException('Driver not found');
        }

        return driver;
    }

    async create(data: Prisma.DriverCreateInput) {
        return this.prisma.driver.create({
            data,
            include: {
                user: {
                    select: {
                        id: true,
                        email: true,
                    },
                },
            },
        });
    }

    async update(id: string, data: Prisma.DriverUpdateInput) {
        return this.prisma.driver.update({
            where: { id },
            data,
        });
    }

    async getJobRequests(driverId: string) {
        return this.prisma.jobRequest.findMany({
            where: { driverId },
            include: {
                employer: {
                    select: {
                        id: true,
                        companyName: true,
                        industryType: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
}
