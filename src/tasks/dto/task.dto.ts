import { IsString, IsOptional, IsISO8601 } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTaskDto {
  @IsString()
  @ApiProperty({ example: 'Título de la tarea', description: 'El título de la tarea' })
  title: string;

  @IsISO8601()
  @ApiProperty({ example: '2023-10-20T12:00:00', description: 'Fecha de vencimiento de la tarea' })
  dueDate: string;
}

export class UpdateTaskDto {
  @IsString()
  @IsOptional()
  @ApiProperty({ example: 'Título de la tarea', description: 'El título de la tarea' })
  title: string;

  @IsISO8601()
  @IsOptional()
  @ApiProperty({ example: '2023-10-20T12:00:00', description: 'Fecha de vencimiento de la tarea' })
  dueDate: string;
}
