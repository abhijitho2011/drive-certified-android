import { Module } from '@nestjs/common';
import { JobRequestsController } from './job-requests.controller';
import { JobRequestsService } from './job-requests.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [JobRequestsController],
    providers: [JobRequestsService],
    exports: [JobRequestsService],
})
export class JobRequestsModule { }
