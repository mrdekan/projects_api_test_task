import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../lib/prisma';
import { Prisma, Project } from '@prisma/client';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class ProjectService {
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

      console.log(
        `Updated ${expiredProjects.length} expired projects to status "expired".`,
      );
    } catch (error) {
      console.error('Error updating expired projects:', error);
    }
  }

  async findUnique(args: Prisma.ProjectFindUniqueArgs): Promise<Project> {
    return this.prismaService.project.findUnique(args);
  }

  async findMany(args: Prisma.ProjectFindManyArgs): Promise<Project[]> {
    return this.prismaService.project.findMany(args);
  }

  async create(data: Prisma.ProjectCreateInput): Promise<Project> {
    return this.prismaService.project.create({ data });
  }

  async update(args: Prisma.ProjectUpdateArgs): Promise<Project> {
    return this.prismaService.project.update(args);
  }

  async delete(args: Prisma.ProjectDeleteArgs): Promise<Project> {
    return this.prismaService.project.update({
      ...args,
      data: { status: 'archived' },
    });
  }

  async count(args: Prisma.ProjectCountArgs): Promise<number> {
    return this.prismaService.project.count(args);
  }
}
