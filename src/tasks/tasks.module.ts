import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { QueueService } from '../queue/queue.service';
import { PrismaService } from '../prisma/prisma.service';
import { JwtService } from '../jwt/jwt.service';
@Module({
  controllers: [
    TasksController,
  ],
  providers: [
    TasksService, 
    QueueService,
    PrismaService,
    JwtService,
  ]
})
export class TasksModule {}
