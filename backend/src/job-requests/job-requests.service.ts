import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';

@Injectable()
export class JobRequestsService {
    constructor(private prisma: PrismaService) { }

    async findById(id: string) {
        return this.prisma.jobRequest.findUnique({
            where: { id },
            include: {
                driver: true,
                employer: true,
            },
        });
    }

    async update(id: string, data: Prisma.JobRequestUpdateInput) {
        return this.prisma.jobRequest.update({
            where: { id },
            data,
        });
    }

    async delete(id: string) {
        return this.prisma.jobRequest.delete({
            where: { id },
        });
    }

    async create(data: Prisma.JobRequestCreateInput) {
        return this.prisma.jobRequest.create({
            data,
        });
    }
}
