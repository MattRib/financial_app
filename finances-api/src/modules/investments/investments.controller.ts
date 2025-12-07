import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
  ParseUUIDPipe,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { InvestmentsService } from './investments.service';
import {
  CreateInvestmentDto,
  UpdateInvestmentDto,
  FilterInvestmentDto,
} from './dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/user.decorator';
import type { User } from '@supabase/supabase-js';

@Controller('investments')
@UseGuards(AuthGuard)
export class InvestmentsController {
  constructor(private readonly investmentsService: InvestmentsService) {}

  @Post()
  create(@CurrentUser() user: User, @Body() dto: CreateInvestmentDto) {
    return this.investmentsService.create(user.id, dto);
  }

  @Get()
  findAll(@CurrentUser() user: User, @Query() filters: FilterInvestmentDto) {
    return this.investmentsService.findAll(user.id, filters);
  }

  @Get('summary')
  getSummary(
    @CurrentUser() user: User,
    @Query('start_date') startDate?: string,
    @Query('end_date') endDate?: string,
  ) {
    return this.investmentsService.getSummary(user.id, startDate, endDate);
  }

  @Get('evolution')
  getEvolution(
    @CurrentUser() user: User,
    @Query('year', ParseIntPipe) year: number,
  ) {
    return this.investmentsService.getMonthlyEvolution(user.id, year);
  }

  @Get('monthly')
  getMonthlyTotal(
    @CurrentUser() user: User,
    @Query('month', ParseIntPipe) month: number,
    @Query('year', ParseIntPipe) year: number,
  ) {
    return this.investmentsService.getTotalByMonth(user.id, month, year);
  }

  @Get(':id')
  findOne(@CurrentUser() user: User, @Param('id', ParseUUIDPipe) id: string) {
    return this.investmentsService.findOne(user.id, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateInvestmentDto,
  ) {
    return this.investmentsService.update(user.id, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@CurrentUser() user: User, @Param('id', ParseUUIDPipe) id: string) {
    return this.investmentsService.remove(user.id, id);
  }
}
