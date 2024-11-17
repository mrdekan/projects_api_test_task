import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
//import { ProjectScheduler } from './project/scheduler/project.scheduler';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  //const projectScheduler = app.get(ProjectScheduler);
  //projectScheduler.start();

  await app.listen(3000);
}
bootstrap();
