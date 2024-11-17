import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { ProjectService } from '../service/project.service';
import { AuthGuard } from '../../auth/guard/auth.guard';
import { ProjectListResponse } from '../dto/project-list-response.dto';
import { Project } from '@prisma/client';
import { CreateUpdateProjectDto } from '../dto/project-create-update-request.dto';

@UseGuards(AuthGuard)
@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  async create(@Request() req, @Body() dto: CreateUpdateProjectDto) {
    const userId = req.user.sub as number;

    const project = await this.projectService.create({
      ...dto,
      status: 'active',
      //add 5 - minutes
      expiredAt: new Date(new Date().getTime() + 5*60000),
      user: {
        connect: { id: userId },
      },
    });
    return project;
  }

  @Patch(':id')
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: CreateUpdateProjectDto,
  ) {
    const userId = req.user.sub as number;

    const existingProject = await this.projectService.findUnique({
      where: { id: +id, userId },
    });
    if (!existingProject) {
      return { statusCode: 404, message: 'Project not found' };
    }

    const project = await this.projectService.update({
      where: { id: +id, userId },
      data: {
        ...dto,
        status: 'active',
        //add 5 - minutes
        expiredAt: new Date(new Date().getTime() + 5*60000),
        user: {
          connect: { id: userId },
        },
      },
    });
    return project;
  }

  @Delete(':id')
  async delete(@Request() req, @Param('id') id: string) {
    const userId = req.user.sub as number;

    const existingProject = await this.projectService.findUnique({
      where: { id: +id, userId },
    });
    if (!existingProject) {
      return { statusCode: 404, message: 'Project not found' };
    }

    return this.projectService.delete({ where: { id: +id, userId } });
  }

  @Get(':id')
  async get(@Request() req, @Param('id') id: string) {
    const userId = req.user.sub as number;

    const existingProject = await this.projectService.findUnique({
      where: { id: +id, userId },
    });
    if (!existingProject) {
      return { statusCode: 404, message: 'Project not found' };
    }

    return existingProject;
  }

  @Get()
  async list(
    @Request() req,
    @Query('limit') limit: number = 10,
    @Query('offset') offset: number = 0,
    @Query('search') search: string = '',
  ): Promise<ProjectListResponse> {
    const userId = req.user.sub as number;

    const [list, total] = await Promise.all([
      this.projectService.findMany({
        where: {
          userId,
          status: { not: 'archived' },
          OR: [
            { name: { contains: search.toLowerCase() } },
            { url: { contains: search.toLowerCase() } },
          ],
        },
        take: +limit,
        skip: +offset,
      }),
      this.projectService.count({
        where: {
          userId,
          OR: [
            { name: { contains: search.toLowerCase() } },
            { url: { contains: search.toLowerCase() } },
          ],
        },
      }),
    ]);

    return {
      data: list.map((x: Project) => ({
        id: x.id,
        name: x.name,
        url: x.url,
        status: x.status,
        expiredAt: x.expiredAt,
        createdAt: x.createdAt,
        updatedAt: x.updatedAt,
      })),
      total,
      size: list.length,
      offset: +offset,
      limit: +limit,
    };
  }
}
