import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Param, 
  Put, 
  Delete, 
  HttpException, 
  HttpStatus, 
  ValidationPipe,
  UseGuards,
  Req,
} from '@nestjs/common';
import { 
  TasksService 
} from './tasks.service';
import { JwtAuthGuard  } from '../auth/guards/jwt-auth.guard';
import { 
  QueueService 
} from '../queue/queue.service';
import { 
  Task,
} from '@prisma/client';
import { 
  CreateTaskDto, 
  UpdateTaskDto, 
} from './dto/task.dto';
import { 
  ApiTags, 
  ApiCreatedResponse, 
  ApiBadRequestResponse, 
  ApiNotFoundResponse, 
  ApiInternalServerErrorResponse, 
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';


@Controller('tasks')
@ApiTags('tasks')
export class TasksController {
    constructor(
        private readonly tasksService: TasksService,
        private readonly queueService: QueueService,
    ) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiCreatedResponse({ description: 'List of tasks', isArray: true })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @ApiBearerAuth()
  async findAll(@Req() req): Promise<Task[]> {
    try {
        const userId = req.user.sub;
        const tasks = await this.tasksService.findAll(userId);
        return tasks;
    } catch (error) {
        throw new HttpException('Failed to retrieve tasks', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiCreatedResponse({ description: 'Task details' })
  @ApiNotFoundResponse({ description: 'Task not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @ApiBearerAuth()
  async findOne(
    @Req() req,
    @Param('id') id: number
  ): Promise<Task> {
    try {
        const userId = req.user.sub;
        const task = await this.tasksService.findOne(+id, userId);
        if (!task) {
            throw new HttpException('Task not found', HttpStatus.NOT_FOUND);
        }
        return task;
    } catch (error) {
        throw new HttpException('Failed to retrieve the task', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiCreatedResponse({ description: 'Task created' })
  @ApiBody({ type: CreateTaskDto }) 
  @ApiBadRequestResponse({ description: 'Bad request' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @ApiBearerAuth()
  async create(
    @Req() req,
    @Body(new ValidationPipe()) createTaskDto: CreateTaskDto,
  ): Promise<Task> {
    try {
      const userId = req.user.sub;
      const task = await this.tasksService.create(createTaskDto, userId);
      return task;
    } catch (error) {
      console.log('ERROR=', error.message);
      throw new HttpException('Failed to create the task', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @ApiCreatedResponse({ description: 'Task updated' })
  @ApiBody({ type: UpdateTaskDto }) 
  @ApiNotFoundResponse({ description: 'Task not found' })
  @ApiBadRequestResponse({ description: 'Bad request' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @ApiBearerAuth()
  async update(
    @Req() req,
    @Param('id') id: number, 
    @Body(new ValidationPipe()) updateTaskDto: UpdateTaskDto,
  ): Promise<Task> {
    try {
        const userId = req.user.sub;
        const task = await this.tasksService.update(+id, updateTaskDto, userId);
        if (!task) {
          throw new HttpException('Task not found', HttpStatus.NOT_FOUND);
        }
        return task;
    } catch (error) {
        console.log('error=', error);
        throw new HttpException('Failed to update the task', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiCreatedResponse({ description: 'Task deleted' })
  @ApiNotFoundResponse({ description: 'Task not found' })
  @ApiInternalServerErrorResponse({ description: 'Internal server error' })
  @ApiBearerAuth()
  async remove(
    @Req() req,
    @Param('id') id: number,
  ): Promise<{
    message: string,
  }> {
    try {
        const userId = req.user.sub;
        const result = await this.tasksService.remove(+id, userId);
        //@ts-ignore
        if (result === 0) {
          throw new HttpException('Task not found', HttpStatus.NOT_FOUND);
        }
        return {
          message: 'task deleted',
        }
    } catch (error) {
        console.log('error=', error);
        throw new HttpException('Failed to delete the task', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('process-overdue')
  async processOverdueTasks(): Promise<{ message: string }> {
    this.queueService.registerWorkers();
    return { message: 'Background processes started' };
  }

  @Get('get-collected-data')
  async getCollectedData(): Promise<Task[]> {
    const collectedData = await this.queueService.getCollectedData();
    return collectedData;
  }
}

