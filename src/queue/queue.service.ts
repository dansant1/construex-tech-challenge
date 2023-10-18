import { Injectable } from '@nestjs/common';
import { Queue, Worker, QueueEvents } from 'bullmq';
import { Task } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class QueueService {
  private taskQueue: Queue;
  private taskQueueEvents: QueueEvents;

  private redisOptions = {
    username: process.env.REDIS_USERNAME || 'default',
    password: process.env.REDIS_PASSWORD as string,
    host: process.env.REDIS_HOST as string,
    port: process.env.REDIS_PORT as unknown as number,
  }


  constructor(private prismaService: PrismaService) {
    this.taskQueue = new Queue('taskQueue', { connection: this.redisOptions });
    this.taskQueueEvents = new QueueEvents('taskQueue', { connection: this.redisOptions });
  }

  registerWorkers() {
    new Worker('taskWorker', async () => {
      const overdueTasks = await this.getOverdueTasks();
      await this.addTaskToQueue(overdueTasks);
    });
  }

  async addTaskToQueue(tasks: Task[]) {
    await this.taskQueue.add('taskWorker', tasks);
  }

  async getCollectedData(): Promise<Task[]> {
    // Crear una promesa para esperar los datos recolectados
    return new Promise<Task[]>(resolve => {
      this.taskQueueEvents.on('completed', job => {
        const collectedData = job.returnvalue;
        //@ts-ignore
        resolve(collectedData);
      });
    });
  }

  private async getOverdueTasks(): Promise<Task[]> {
    const now = new Date();
    return await this.prismaService.task.findMany({
        where: {
            dueDate: {
                lt: now,
            },
        },
    });
  }
}
