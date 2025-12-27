import { IsString, IsOptional, MaxLength, Matches } from 'class-validator';

export class UpdateDriverDto {
    @IsOptional()
    @IsString()
    @MaxLength(50)
    firstName?: string;

    @IsOptional()
    @IsString()
    @MaxLength(50)
    lastName?: string;

    @IsOptional()
    @IsString()
    @Matches(/^[0-9]{10}$/, {
        message: 'Phone number must be exactly 10 digits',
    })
    phone?: string;

    @IsOptional()
    @IsString()
    @MaxLength(200)
    address?: string;

    @IsOptional()
    @IsString()
    district?: string;

    @IsOptional()
    @IsString()
    state?: string;

    @IsOptional()
    @IsString()
    @Matches(/^[0-9]{6}$/, { message: 'PIN code must be exactly 6 digits' })
    pinCode?: string;
}
