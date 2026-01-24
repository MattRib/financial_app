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
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
  ApiParam,
} from '@nestjs/swagger';
import { InvestmentsService } from './investments.service';
import {
  CreateInvestmentDto,
  UpdateInvestmentDto,
  FilterInvestmentDto,
} from './dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/user.decorator';
import type { User } from '@supabase/supabase-js';

@ApiTags('Investments')
@ApiBearerAuth()
@Controller('investments')
@UseGuards(AuthGuard)
export class InvestmentsController {
  constructor(private readonly investmentsService: InvestmentsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar novo investimento' })
  @ApiResponse({ status: 201, description: 'Investimento criado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  create(@CurrentUser() user: User, @Body() dto: CreateInvestmentDto) {
    return this.investmentsService.create(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todos os investimentos do usuário' })
  @ApiResponse({ status: 200, description: 'Lista de investimentos' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiQuery({
    name: 'type',
    required: false,
    description:
      'Filtrar por tipo (renda_fixa, renda_variavel, cripto, outros)',
  })
  @ApiQuery({
    name: 'start_date',
    required: false,
    description: 'Data inicial (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'end_date',
    required: false,
    description: 'Data final (YYYY-MM-DD)',
  })
  findAll(@CurrentUser() user: User, @Query() filters: FilterInvestmentDto) {
    return this.investmentsService.findAll(user.id, filters);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Obter resumo dos investimentos' })
  @ApiResponse({
    status: 200,
    description: 'Resumo com total, distribuição por tipo e média mensal',
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiQuery({
    name: 'start_date',
    required: false,
    description: 'Data inicial (YYYY-MM-DD)',
  })
  @ApiQuery({
    name: 'end_date',
    required: false,
    description: 'Data final (YYYY-MM-DD)',
  })
  getSummary(
    @CurrentUser() user: User,
    @Query('start_date') startDate?: string,
    @Query('end_date') endDate?: string,
  ) {
    return this.investmentsService.getSummary(user.id, startDate, endDate);
  }

  @Get('evolution')
  @ApiOperation({ summary: 'Obter evolução mensal dos investimentos por ano' })
  @ApiResponse({
    status: 200,
    description: 'Array com total investido por mês',
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiQuery({
    name: 'year',
    required: true,
    description: 'Ano para buscar evolução',
  })
  getEvolution(
    @CurrentUser() user: User,
    @Query('year', ParseIntPipe) year: number,
  ) {
    return this.investmentsService.getMonthlyEvolution(user.id, year);
  }

  @Get('monthly')
  @ApiOperation({ summary: 'Obter total investido em um mês específico' })
  @ApiResponse({ status: 200, description: 'Total investido no mês' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiQuery({ name: 'month', required: true, description: 'Mês (1-12)' })
  @ApiQuery({ name: 'year', required: true, description: 'Ano' })
  getMonthlyTotal(
    @CurrentUser() user: User,
    @Query('month', ParseIntPipe) month: number,
    @Query('year', ParseIntPipe) year: number,
  ) {
    return this.investmentsService.getTotalByMonth(user.id, month, year);
  }

  @Get('monthly-total')
  @ApiOperation({
    summary: 'Obter total investido em um mês específico (alias)',
  })
  @ApiResponse({ status: 200, description: 'Total investido no mês' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiQuery({ name: 'month', required: true, description: 'Mês (1-12)' })
  @ApiQuery({ name: 'year', required: true, description: 'Ano' })
  getMonthlyTotalAlias(
    @CurrentUser() user: User,
    @Query('month', ParseIntPipe) month: number,
    @Query('year', ParseIntPipe) year: number,
  ) {
    return this.investmentsService.getTotalByMonth(user.id, month, year);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Obter investimento por ID' })
  @ApiResponse({ status: 200, description: 'Dados do investimento' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 404, description: 'Investimento não encontrado' })
  @ApiParam({ name: 'id', description: 'ID do investimento (UUID)' })
  findOne(@CurrentUser() user: User, @Param('id', ParseUUIDPipe) id: string) {
    return this.investmentsService.findOne(user.id, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar investimento' })
  @ApiResponse({
    status: 200,
    description: 'Investimento atualizado com sucesso',
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 404, description: 'Investimento não encontrado' })
  @ApiParam({ name: 'id', description: 'ID do investimento (UUID)' })
  update(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateInvestmentDto,
  ) {
    return this.investmentsService.update(user.id, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Excluir investimento' })
  @ApiResponse({
    status: 204,
    description: 'Investimento excluído com sucesso',
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiResponse({ status: 404, description: 'Investimento não encontrado' })
  @ApiParam({ name: 'id', description: 'ID do investimento (UUID)' })
  remove(@CurrentUser() user: User, @Param('id', ParseUUIDPipe) id: string) {
    return this.investmentsService.remove(user.id, id);
  }
}
