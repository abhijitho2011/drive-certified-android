import { Controller, Get, Param } from '@nestjs/common';
import { LocationService } from './location.service';

@Controller('location')
export class LocationController {
    constructor(private readonly locationService: LocationService) { }

    @Get('states')
    async getStates() {
        return this.locationService.getAllStates();
    }

    @Get('districts')
    async getDistricts() {
        return this.locationService.getAllDistricts();
    }

    @Get('districts/:stateId')
    async getDistrictsByState(@Param('stateId') stateId: string) {
        return this.locationService.getDistrictsByState(stateId);
    }
}
