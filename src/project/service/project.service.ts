import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../lib/prisma';
import { Prisma, Project, ProjectStatus } from '@prisma/client';
import { Cron } from '@nestjs/schedule';
import { CreateUpdateProjectDto } from '../dto/project-create-update-request.dto';
import { ProjectListResponse } from '../dto/project-list-response.dto';

@Injectable()
export class ProjectService {
  private static expiredTimeDelay = 5 * 60000; //5 minutes

  constructor(private readonly prismaService: PrismaService) {}

  @Cron('* * * * *')
  handleCron() {
    this.updateExpiredProjects();
  }

  async updateExpiredProjects() {
    try {
      const expiredProjects = await this.prismaService.project.findMany({
        where: {
          expiredAt: {
            lt: new Date(),
          },
          status: { not: 'expired' },
        },
      });

      await Promise.all(
        expiredProjects.map((project) =>
          this.prismaService.project.update({
            where: { id: project.id },
            data: { status: 'expired' },
          }),
        ),
      );
    } catch (error) {
      console.error('Error updating expired projects:', error);
    }
  }

  async getProjectById(
    id: number,
    userId: number,
  ): Promise<Project | { statusCode: number; message: string }> {
    const existingProject = await this.prismaService.project.findUnique({
      where: { id, userId },
    });

    if (!existingProject) {
      return { statusCode: 404, message: 'Project not found' };
    }

    return existingProject;
  }

  async getProjectList(
    userId: number,
    limit: number,
    offset: number,
    search: string,
  ): Promise<ProjectListResponse> {
    const filters = {
      userId,
      status: { not: 'archived' as ProjectStatus },
      OR: [
        { name: { contains: search.toLowerCase() } },
        { url: { contains: search.toLowerCase() } },
      ],
    };

    const [list, total] = await Promise.all([
      this.prismaService.project.findMany({
        where: filters,
        take: limit,
        skip: offset,
      }),
      this.prismaService.project.count({
        where: filters,
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
      offset,
      limit,
    };
  }

  async createProject(
    dto: CreateUpdateProjectDto,
    userId: number,
  ): Promise<Project> {
    const data: Prisma.ProjectCreateInput = {
      ...dto,
      status: 'active',
      expiredAt: new Date(Date.now() + ProjectService.expiredTimeDelay),
      user: {
        connect: { id: userId },
      },
    };
    return this.prismaService.project.create({ data });
  }

  async updateProject(
    id: number,
    dto: CreateUpdateProjectDto,
    userId: number,
  ): Promise<Project | { statusCode: number; message: string }> {
    const existingProject = await this.prismaService.project.findUnique({
      where: { id, userId },
    });

    if (!existingProject) {
      return { statusCode: 404, message: 'Project not found' };
    }

    const data: Prisma.ProjectUpdateInput = {
      ...dto,
      status: 'active',
      expiredAt: new Date(Date.now() + ProjectService.expiredTimeDelay),
      user: {
        connect: { id: userId },
      },
    };

    return this.prismaService.project.update({
      where: { id },
      data,
    });
  }

  async deleteProject(
    id: number,
    userId: number,
  ): Promise<Project | { statusCode: number; message: string }> {
    const existingProject = await this.prismaService.project.findUnique({
      where: { id, userId },
    });

    if (!existingProject) {
      return { statusCode: 404, message: 'Project not found' };
    }

    return this.prismaService.project.update({
      where: { id },
      data: { status: 'archived' },
    });
  }

  async count(args: Prisma.ProjectCountArgs): Promise<number> {
    return this.prismaService.project.count(args);
  }
}
