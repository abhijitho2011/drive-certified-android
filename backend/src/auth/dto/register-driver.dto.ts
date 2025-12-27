import {
    IsEmail,
    IsString,
    MinLength,
    MaxLength,
    Matches,
    IsNotEmpty,
} from 'class-validator';

export class RegisterDriverDto {
    @IsEmail({}, { message: 'Please provide a valid email address' })
    @IsNotEmpty({ message: 'Email is required' })
    email: string;

    @IsString()
    @MinLength(6, { message: 'Password must be at least 6 characters long' })
    @MaxLength(50, { message: 'Password must not exceed 50 characters' })
    @IsNotEmpty({ message: 'Password is required' })
    password: string;

    @IsString()
    @IsNotEmpty({ message: 'First name is required' })
    @MaxLength(50, { message: 'First name must not exceed 50 characters' })
    firstName: string;

    @IsString()
    @IsNotEmpty({ message: 'Last name is required' })
    @MaxLength(50, { message: 'Last name must not exceed 50 characters' })
    lastName: string;

    @IsString()
    @Matches(/^[0-9]{10}$/, {
        message: 'Phone number must be exactly 10 digits',
    })
    @IsNotEmpty({ message: 'Phone number is required' })
    phone: string;

    @IsString()
    @IsNotEmpty({ message: 'Address is required' })
    @MaxLength(200, { message: 'Address must not exceed 200 characters' })
    address: string;

    @IsString()
    @IsNotEmpty({ message: 'District is required' })
    district: string;

    @IsString()
    @IsNotEmpty({ message: 'State is required' })
    state: string;

    @IsString()
    @Matches(/^[0-9]{6}$/, { message: 'PIN code must be exactly 6 digits' })
    @IsNotEmpty({ message: 'PIN code is required' })
    pinCode: string;
}
