import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { DriversService } from './drivers.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('drivers')
export class DriversController {
    constructor(private readonly driversService: DriversService) { }

    @UseGuards(AuthGuard('jwt'))
    @Get('user/:userId')
    async getDriverByUserId(@Param('userId') userId: string) {
        return this.driversService.findByUserId(userId);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get(':id')
    async getDriver(@Param('id') id: string) {
        return this.driversService.findById(id);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get(':id/job-requests')
    async getJobRequests(@Param('id') id: string) {
        return this.driversService.getJobRequests(id);
    }
}
