import { Injectable } from '@nestjs/common';
import { Queue, Worker, QueueEvents, Job } from 'bullmq';
import { Task } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
@Injectable()
export class QueueService {
  private TASK_QUEUE_NAME: string = 'taskQueue';
  private taskQueue: Queue;
  private taskQueueEvents: QueueEvents;
  private worker: Worker;
  private collectedData: Task[] = [];

  private redisOptions = {
    username: process.env.REDIS_USERNAME || 'default',
    password: process.env.REDIS_PASSWORD as string,
    host: process.env.REDIS_HOST as string,
    port: process.env.REDIS_PORT as unknown as number,
  }

  constructor(private prismaService: PrismaService) {
    const connection = this.redisOptions;
    this.taskQueue = new Queue(
    this.TASK_QUEUE_NAME, 
    { connection });
    this.taskQueueEvents = new QueueEvents(
    this.TASK_QUEUE_NAME, 
    { connection });
    this.worker = new Worker(
    this.TASK_QUEUE_NAME, 
    async (job: Job) => {
      try {
        const isWaiting = await job.isWaiting();
        if (isWaiting) {
          await job.moveToCompleted(job.data, job.token);
        }
      } catch (error) {
        console.error('Error en el worker:', error);
        await job.moveToFailed(error, job.token);
      }
    }, 
    { connection });
    this._listenForCompletedEvents();
  }

  async getQueuedTasks(): Promise<Task[]> {
    const jobIds = await this.taskQueue.getWaiting();
    const queuedTasks = await Promise.all(
      jobIds.map(async (jobData: Job) => {
        const job = await this.taskQueue.getJob(jobData.id);
        return job.data as Task;
      })
    );
    return queuedTasks;
  }

  private _listenForCompletedEvents() {
    this.taskQueueEvents.on('completed', async (jobData: { jobId: string }) => {
      const job = await Job.fromId(this.taskQueue, jobData.jobId);
      if (job.data) {
        this._processCompletedTask(job.data);
        job.remove();
      }
    });

    this.taskQueueEvents.on('waiting', async () => {
      console.log('WAITING EVENT');
    });
  }

  private _processCompletedTask(taskData) {
    this.collectedData.unshift(taskData);
  }

  async initQueueAndMonitorWorkers() {
    await this.addTaskToQueue();
    console.log('WORKER_RUNNING=', this.worker.isRunning());
  }

  async addTaskToQueue() {
    try {
      const overdueTasks = await this._getOverdueTasks();
      const tasksToAdd = overdueTasks.map((task) => ({
        name: 'task',
        data: task,
        opts: { 
          removeOnFail: true 
        },
      }));
      const jobs = await this.taskQueue.addBulk(tasksToAdd);
      console.log(`Added ${jobs.length} overdue tasks to the queue.`);
    } catch (error) {
      console.error('Error adding overdue tasks to the queue:', error);
    }
  }

  private _removeDuplicatesFromArray(arr: Task[]) {
    // Utilizamos un conjunto para llevar un registro de los elementos únicos por su propiedad 'id'.
    const uniqueIds = new Set();
  
    // Usamos la función `filter` para crear un nuevo array con elementos únicos.
    const uniqueArray = arr.filter((item) => {
      if (!uniqueIds.has(item.id)) {
        uniqueIds.add(item.id);
        return true;
      }
      return false;
    });
  
    return uniqueArray;
  }

  async getCollectedData(): Promise<Task[]> {
    return this._removeDuplicatesFromArray(this.collectedData);
  }

  private async _getOverdueTasks(): Promise<Task[]> {
    const now = new Date();
    const tasks = await this.prismaService.task.findMany({
        where: {
            dueDate: {
                lt: now,
            },
        },
    });
    return tasks;
  }
}
