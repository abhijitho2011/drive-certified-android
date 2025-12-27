import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { LocationModule } from './location/location.module';
import { DriversModule } from './drivers/drivers.module';
import { JobRequestsModule } from './job-requests/job-requests.module';
import { AppGateway } from './app.gateway';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    AuthModule,
    LocationModule,
    DriversModule,
    JobRequestsModule,
  ],
  controllers: [AppController],
  providers: [AppService, AppGateway],
})
export class AppModule { }
