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
import { CreateUpdateProjectDto } from '../dto/project-create-update-request.dto';

@UseGuards(AuthGuard)
@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Post()
  async create(@Request() req, @Body() dto: CreateUpdateProjectDto) {
    const userId = req.user.sub as number;
    return await this.projectService.createProject(dto, userId);
  }

  @Patch(':id')
  async update(
    @Request() req,
    @Param('id') id: string,
    @Body() dto: CreateUpdateProjectDto,
  ) {
    const userId = req.user.sub as number;
    return await this.projectService.updateProject(+id, dto, userId);
  }

  @Delete(':id')
  async delete(@Request() req, @Param('id') id: string) {
    const userId = req.user.sub as number;
    return await this.projectService.deleteProject(+id, userId);
  }

  @Get(':id')
  async get(@Request() req, @Param('id') id: string) {
    const userId = req.user.sub as number;
    return await this.projectService.getProjectById(+id, userId);
  }

  @Get()
  async list(
    @Request() req,
    @Query('limit') limit: string = '10',
    @Query('offset') offset: string = '0',
    @Query('search') search: string = '',
  ): Promise<ProjectListResponse> {
    const userId = req.user.sub as number;
    return await this.projectService.getProjectList(
      userId,
      +limit,
      +offset,
      search,
    );
  }
}
