import {
    IsString,
    IsOptional,
    IsEnum,
    IsNumber,
    IsNotEmpty,
} from 'class-validator';

enum JobRequestStatus {
    PENDING = 'pending',
    ACCEPTED = 'accepted',
    REJECTED = 'rejected',
    WITHDRAWN = 'withdrawn',
    HIRED = 'hired',
}

export class UpdateJobRequestDto {
    @IsOptional()
    @IsEnum(JobRequestStatus, {
        message: 'Status must be one of: pending, accepted, rejected, withdrawn, hired',
    })
    status?: JobRequestStatus;

    @IsOptional()
    @IsString()
    driverResponseAt?: string;
}

export class CreateJobRequestDto {
    @IsNotEmpty()
    @IsString()
    employerId: string;

    @IsNotEmpty()
    @IsString()
    driverId: string;

    @IsNotEmpty()
    @IsString()
    jobTitle: string;

    @IsOptional()
    @IsString()
    jobDescription?: string;

    @IsOptional()
    @IsString()
    vehicleClassRequired?: string;

    @IsOptional()
    @IsString()
    location?: string;

    @IsOptional()
    @IsNumber()
    salaryOffered?: number;

    @IsOptional()
    @IsString()
    workType?: string;
}
