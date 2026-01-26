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
import { TransactionsService } from './transactions.service';
import {
  CreateTransactionDto,
  UpdateTransactionDto,
  FilterTransactionDto,
} from './dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/user.decorator';
import type { User } from '@supabase/supabase-js';

@Controller('transactions')
@UseGuards(AuthGuard)
export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  @Post()
  create(@CurrentUser() user: User, @Body() dto: CreateTransactionDto) {
    return this.transactionsService.create(user.id, dto);
  }

  @Get()
  findAll(@CurrentUser() user: User, @Query() filters: FilterTransactionDto) {
    return this.transactionsService.findAll(user.id, filters);
  }

  @Get('summary')
  getSummary(
    @CurrentUser() user: User,
    @Query('start_date') startDate: string,
    @Query('end_date') endDate: string,
  ) {
    return this.transactionsService.getSummary(user.id, startDate, endDate);
  }

  @Get('by-category')
  getByCategory(
    @CurrentUser() user: User,
    @Query('start_date') startDate: string,
    @Query('end_date') endDate: string,
  ) {
    return this.transactionsService.getByCategory(user.id, startDate, endDate);
  }

  @Get('installments/groups')
  getInstallmentGroups(@CurrentUser() user: User) {
    return this.transactionsService.getInstallmentGroups(user.id);
  }

  @Get('installments/group/:groupId')
  getInstallmentsByGroup(
    @CurrentUser() user: User,
    @Param('groupId', ParseUUIDPipe) groupId: string,
  ) {
    return this.transactionsService.findByInstallmentGroup(user.id, groupId);
  }

  @Get(':id')
  findOne(@CurrentUser() user: User, @Param('id', ParseUUIDPipe) id: string) {
    return this.transactionsService.findOne(user.id, id);
  }

  @Patch(':id')
  update(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateTransactionDto,
  ) {
    return this.transactionsService.update(user.id, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@CurrentUser() user: User, @Param('id', ParseUUIDPipe) id: string) {
    return this.transactionsService.remove(user.id, id);
  }
}
