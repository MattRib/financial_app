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
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { DebtsService } from './debts.service';
import { CreateDebtDto, UpdateDebtDto, FilterDebtDto } from './dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/user.decorator';
import type { User } from '@supabase/supabase-js';

@Controller('debts')
@UseGuards(AuthGuard)
export class DebtsController {
  constructor(private readonly debtsService: DebtsService) {}

  @Post()
  create(@CurrentUser() user: User, @Body() dto: CreateDebtDto) {
    return this.debtsService.create(user.id, dto);
  }

  @Get()
  findAll(@CurrentUser() user: User, @Query() filters: FilterDebtDto) {
    return this.debtsService.findAll(user.id, filters);
  }

  @Get('summary')
  getSummary(@CurrentUser() user: User) {
    return this.debtsService.getSummary(user.id);
  }

  @Get('overdue')
  getOverdue(@CurrentUser() user: User) {
    return this.debtsService.getOverdue(user.id);
  }

  @Patch(':id/pay')
  markAsPaid(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.debtsService.markAsPaid(user.id, id);
  }

  @Get(':id')
  findOne(@CurrentUser() user: User, @Param('id', ParseUUIDPipe) id: string) {
    return this.debtsService.findOne(user.id, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDebtDto,
  ) {
    return this.debtsService.update(user.id, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@CurrentUser() user: User, @Param('id', ParseUUIDPipe) id: string) {
    return this.debtsService.remove(user.id, id);
  }
}
