import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface StateData {
    id: string;
    name: string;
}

export interface DistrictData {
    id: string;
    state_id: string;
    name: string;
}

@Injectable()
export class LocationService {
    constructor(private prisma: PrismaService) { }

    // Hardcoded Indian states and districts for now
    // In production, these would come from database
    private readonly states: StateData[] = [
        { id: '1', name: 'Andhra Pradesh' },
        { id: '2', name: 'Arunachal Pradesh' },
        { id: '3', name: 'Assam' },
        { id: '4', name: 'Bihar' },
        { id: '5', name: 'Chhattisgarh' },
        { id: '6', name: 'Goa' },
        { id: '7', name: 'Gujarat' },
        { id: '8', name: 'Haryana' },
        { id: '9', name: 'Himachal Pradesh' },
        { id: '10', name: 'Jharkhand' },
        { id: '11', name: 'Karnataka' },
        { id: '12', name: 'Kerala' },
        { id: '13', name: 'Madhya Pradesh' },
        { id: '14', name: 'Maharashtra' },
        { id: '15', name: 'Manipur' },
        { id: '16', name: 'Meghalaya' },
        { id: '17', name: 'Mizoram' },
        { id: '18', name: 'Nagaland' },
        { id: '19', name: 'Odisha' },
        { id: '20', name: 'Punjab' },
        { id: '21', name: 'Rajasthan' },
        { id: '22', name: 'Sikkim' },
        { id: '23', name: 'Tamil Nadu' },
        { id: '24', name: 'Telangana' },
        { id: '25', name: 'Tripura' },
        { id: '26', name: 'Uttar Pradesh' },
        { id: '27', name: 'Uttarakhand' },
        { id: '28', name: 'West Bengal' },
        { id: '29', name: 'Delhi' },
    ];

    private readonly districts: DistrictData[] = [
        // Kerala districts
        { id: '1', state_id: '12', name: 'Thiruvananthapuram' },
        { id: '2', state_id: '12', name: 'Kollam' },
        { id: '3', state_id: '12', name: 'Pathanamthitta' },
        { id: '4', state_id: '12', name: 'Alappuzha' },
        { id: '5', state_id: '12', name: 'Kottayam' },
        { id: '6', state_id: '12', name: 'Idukki' },
        { id: '7', state_id: '12', name: 'Ernakulam' },
        { id: '8', state_id: '12', name: 'Thrissur' },
        { id: '9', state_id: '12', name: 'Palakkad' },
        { id: '10', state_id: '12', name: 'Malappuram' },
        { id: '11', state_id: '12', name: 'Kozhikode' },
        { id: '12', state_id: '12', name: 'Wayanad' },
        { id: '13', state_id: '12', name: 'Kannur' },
        { id: '14', state_id: '12', name: 'Kasaragod' },
        // Karnataka districts
        { id: '15', state_id: '11', name: 'Bengaluru Urban' },
        { id: '16', state_id: '11', name: 'Bengaluru Rural' },
        { id: '17', state_id: '11', name: 'Mysuru' },
        { id: '18', state_id: '11', name: 'Mangaluru' },
        // Maharashtra districts
        { id: '19', state_id: '14', name: 'Mumbai' },
        { id: '20', state_id: '14', name: 'Pune' },
        { id: '21', state_id: '14', name: 'Nagpur' },
        // Tamil Nadu districts
        { id: '22', state_id: '23', name: 'Chennai' },
        { id: '23', state_id: '23', name: 'Coimbatore' },
        { id: '24', state_id: '23', name: 'Madurai' },
        // Delhi
        { id: '25', state_id: '29', name: 'Central Delhi' },
        { id: '26', state_id: '29', name: 'North Delhi' },
        { id: '27', state_id: '29', name: 'South Delhi' },
    ];

    async getAllStates(): Promise<StateData[]> {
        return this.states;
    }

    async getAllDistricts(): Promise<DistrictData[]> {
        return this.districts;
    }

    async getDistrictsByState(stateId: string): Promise<DistrictData[]> {
        return this.districts.filter((d) => d.state_id === stateId);
    }
}
