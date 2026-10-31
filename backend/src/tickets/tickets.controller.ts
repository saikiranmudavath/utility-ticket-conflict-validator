import {Controller, Get, Query} from '@nestjs/common';
import { TicketsService } from './tickets.service';

@Controller("api/tickets")
export class TicketsController {
  constructor(private readonly ticketsService: TicketsService) {}

    @Get("conflicts")
    async getConflicts(@Query() query: any) {
        return this.ticketsService.getConflicts(query);
    }   
    }