import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TicketsService } from './tickets/tickets.service';
import { DatabaseModule } from './database/database.module';
import { TicketsController } from './tickets/tickets.controller';



@Module({
  imports: [DatabaseModule],
  controllers: [AppController, TicketsController],
  providers: [AppService, TicketsService],
})


export class AppModule {}
