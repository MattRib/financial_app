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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { AccountsService } from './accounts.service';
import {
  CreateAccountDto,
  UpdateAccountDto,
  FilterAccountDto,
  CreateTransferDto,
  PayInvoiceDto,
} from './dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/user.decorator';
import type { User } from '@supabase/supabase-js';

@ApiTags('Accounts')
@ApiBearerAuth()
@Controller('accounts')
@UseGuards(AuthGuard)
export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar nova conta/carteira' })
  @ApiResponse({ status: 201, description: 'Conta criada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  create(@CurrentUser() user: User, @Body() dto: CreateAccountDto) {
    return this.accountsService.create(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as contas do usuário' })
  @ApiResponse({ status: 200, description: 'Lista de contas com saldo' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: ['checking', 'savings', 'credit_card', 'cash', 'investment', 'other'],
  })
  @ApiQuery({ name: 'is_active', required: false, type: Boolean })
  findAll(@CurrentUser() user: User, @Query() filters: FilterAccountDto) {
    return this.accountsService.findAll(user.id, filters);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Obter resumo das contas' })
  @ApiResponse({ status: 200, description: 'Resumo com totais por tipo' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  getSummary(@CurrentUser() user: User) {
    return this.accountsService.getSummary(user.id);
  }

  @Post('transfer')
  @ApiOperation({ summary: 'Transferir entre contas' })
  @ApiResponse({ status: 201, description: 'Transferência realizada' })
  @ApiResponse({ status: 400, description: 'Dados inválidos ou contas iguais' })
  @ApiResponse({ status: 404, description: 'Conta não encontrada' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  transfer(@CurrentUser() user: User, @Body() dto: CreateTransferDto) {
    return this.accountsService.transfer(user.id, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar conta por ID' })
  @ApiResponse({ status: 200, description: 'Conta encontrada' })
  @ApiResponse({ status: 404, description: 'Conta não encontrada' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiParam({ name: 'id', description: 'ID da conta (UUID)' })
  findOne(@CurrentUser() user: User, @Param('id', ParseUUIDPipe) id: string) {
    return this.accountsService.findOne(user.id, id);
  }

  @Get(':id/invoices/current')
  @ApiOperation({ summary: 'Obter fatura atual do cartão de crédito' })
  @ApiResponse({ status: 200, description: 'Fatura atual' })
  @ApiResponse({ status: 400, description: 'Conta inválida ou não configurada' })
  @ApiResponse({ status: 404, description: 'Conta não encontrada' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiParam({ name: 'id', description: 'ID da conta (UUID)' })
  getCurrentInvoice(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.accountsService.getCurrentInvoice(user.id, id);
  }

  @Get(':id/invoices/history')
  @ApiOperation({ summary: 'Listar histórico de faturas do cartão' })
  @ApiResponse({ status: 200, description: 'Histórico de faturas' })
  @ApiResponse({ status: 400, description: 'Conta inválida ou não configurada' })
  @ApiResponse({ status: 404, description: 'Conta não encontrada' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiParam({ name: 'id', description: 'ID da conta (UUID)' })
  getInvoiceHistory(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.accountsService.getInvoiceHistory(user.id, id);
  }

  @Patch(':id/invoices/pay')
  @ApiOperation({ summary: 'Marcar fatura como paga (sem movimentação)' })
  @ApiResponse({ status: 200, description: 'Fatura marcada como paga' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 404, description: 'Conta não encontrada' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiParam({ name: 'id', description: 'ID da conta (UUID)' })
  markInvoicePaid(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: PayInvoiceDto,
  ) {
    return this.accountsService.markInvoicePaid(
      user.id,
      id,
      dto.period_start,
      dto.period_end,
    );
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar conta' })
  @ApiResponse({ status: 200, description: 'Conta atualizada' })
  @ApiResponse({ status: 404, description: 'Conta não encontrada' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiParam({ name: 'id', description: 'ID da conta (UUID)' })
  update(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAccountDto,
  ) {
    return this.accountsService.update(user.id, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover conta' })
  @ApiResponse({ status: 204, description: 'Conta removida' })
  @ApiResponse({ status: 404, description: 'Conta não encontrada' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiParam({ name: 'id', description: 'ID da conta (UUID)' })
  remove(@CurrentUser() user: User, @Param('id', ParseUUIDPipe) id: string) {
    return this.accountsService.remove(user.id, id);
  }
}
