import { Module } from '@nestjs/common';
import { ProjectModule } from './project/module';
import { UserModule } from './user/module';
import { AuthModule } from './auth/module';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [AuthModule, UserModule, ProjectModule, ScheduleModule.forRoot()],
})
export class AppModule {}
