import { Injectable } from '@nestjs/common';
import { Queue, Worker, QueueEvents, Job } from 'bullmq';
import { Task } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class QueueService {
  private TASK_QUEUE_NAME: string = 'taskQueue';
  private TASK_WORKER_NAME: string = 'taskWorker';
  private taskQueue: Queue;
  private taskQueueEvents: QueueEvents;
  private collectedData: Task[] = [];

  private redisOptions = {
    username: process.env.REDIS_USERNAME || 'default',
    password: process.env.REDIS_PASSWORD as string,
    host: process.env.REDIS_HOST as string,
    port: process.env.REDIS_PORT as unknown as number,
  }


  constructor(private prismaService: PrismaService) {
    this.taskQueue = new Queue(this.TASK_QUEUE_NAME, { connection: this.redisOptions });
    this.taskQueueEvents = new QueueEvents(this.TASK_QUEUE_NAME, { connection: this.redisOptions });
    this.listenForCompletedEvents();
  }

  private listenForCompletedEvents() {
    this.taskQueueEvents.on('completed', async (jobData: { jobId: string }) => {
      const job = await Job.fromId(this.taskQueue, jobData.jobId);
      console.log(job.returnvalue);
      this.processCompletedTask(JSON.parse(job.returnvalue));
    });
  }

  private processCompletedTask(taskData) {
    this.collectedData.push(taskData);
  }

  async registerWorkers() {
    new Worker(this.TASK_WORKER_NAME, async () => {
      const overdueTasks = await this.getOverdueTasks();
      for (const task of overdueTasks) {
        await this.addTaskToQueue(task);
      }
    });
  }

  async addTaskToQueue(task: Task) {
    await this.taskQueue.add('task', task);
  }

  async getCollectedData(): Promise<Task[]> {
    return this.collectedData;
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
