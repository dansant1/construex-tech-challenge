import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Task } from '@prisma/client';

@Injectable()
export class TasksService {
    constructor(private prismaRepository: PrismaService) {}

    async findAll(userId: number): Promise<Task[]> {
        return this.prismaRepository.task.findMany({
            where: {
                userId,
            }
        });
    }

    async findOne(id: number, userId: number): Promise<Task> {
        return this.prismaRepository.task.findUnique({
            where: { 
                id,
                userId, 
            },
        });
    }

    async create(data: {
            title: string,
            dueDate: string,
        }, 
        userId: number
    ): Promise<Task> {
        return this.prismaRepository.task.create({ 
            data: {
                title: data.title,
                dueDate: new Date(data.dueDate),
                userId,
            } 
        });
    }

    async update(id: number, data: {
        title: string,
        dueDate: string,
    }, userId: number): Promise<Task> {
        return this.prismaRepository.task.update({
            where: { 
                id, 
                userId 
            },
            data: {
                title: data.title,
                dueDate: new Date(data.dueDate),
            },
        });
    }

    async remove(id: number, userId: number): Promise<Task> {
        return await this.prismaRepository.task.delete({
            where: { 
                id, 
                userId 
            },
        });
    }
}
