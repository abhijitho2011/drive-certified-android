import { Controller, Get, Patch, Delete, Param, Body, UseGuards } from '@nestjs/common';
import { JobRequestsService } from './job-requests.service';
import { AuthGuard } from '@nestjs/passport';
import { Prisma } from '@prisma/client';

@Controller('job-requests')
export class JobRequestsController {
    constructor(private readonly jobRequestsService: JobRequestsService) { }

    @UseGuards(AuthGuard('jwt'))
    @Get(':id')
    async getJobRequest(@Param('id') id: string) {
        return this.jobRequestsService.findById(id);
    }

    @UseGuards(AuthGuard('jwt'))
    @Patch(':id')
    async updateJobRequest(
        @Param('id') id: string,
        @Body() data: Prisma.JobRequestUpdateInput,
    ) {
        return this.jobRequestsService.update(id, data);
    }

    @UseGuards(AuthGuard('jwt'))
    @Delete(':id')
    async deleteJobRequest(@Param('id') id: string) {
        return this.jobRequestsService.delete(id);
    }
}
