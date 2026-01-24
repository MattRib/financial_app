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
import { GoalsService } from './goals.service';
import { CreateGoalDto, UpdateGoalDto, FilterGoalDto } from './dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/user.decorator';
import type { User } from '@supabase/supabase-js';

@ApiTags('Goals')
@ApiBearerAuth()
@Controller('goals')
@UseGuards(AuthGuard)
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  @Post()
  @ApiOperation({ summary: 'Criar nova meta financeira' })
  @ApiResponse({ status: 201, description: 'Meta criada com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  create(@CurrentUser() user: User, @Body() dto: CreateGoalDto) {
    return this.goalsService.create(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar todas as metas do usuário' })
  @ApiResponse({ status: 200, description: 'Lista de metas' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiQuery({ name: 'status', required: false, enum: ['active', 'completed', 'cancelled'] })
  @ApiQuery({ name: 'target_date_start', required: false, description: 'Data inicial (YYYY-MM-DD)' })
  @ApiQuery({ name: 'target_date_end', required: false, description: 'Data final (YYYY-MM-DD)' })
  @ApiQuery({ name: 'category', required: false, description: 'Categoria da meta' })
  findAll(@CurrentUser() user: User, @Query() filters: FilterGoalDto) {
    return this.goalsService.findAll(user.id, filters);
  }

  @Get('summary')
  @ApiOperation({ summary: 'Obter resumo das metas' })
  @ApiResponse({
    status: 200,
    description: 'Resumo com totais e distribuição por status',
  })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  getSummary(@CurrentUser() user: User) {
    return this.goalsService.getSummary(user.id);
  }

  @Get('at-risk')
  @ApiOperation({ summary: 'Listar metas em risco (prazo < 30 dias e progresso < 50%)' })
  @ApiResponse({ status: 200, description: 'Lista de metas em risco' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  getAtRisk(@CurrentUser() user: User) {
    return this.goalsService.getAtRisk(user.id);
  }

  @Get('near-completion')
  @ApiOperation({ summary: 'Listar metas próximas de conclusão (progresso >= 80%)' })
  @ApiResponse({ status: 200, description: 'Lista de metas próximas de conclusão' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  getNearCompletion(@CurrentUser() user: User) {
    return this.goalsService.getNearCompletion(user.id);
  }

  @Patch(':id/complete')
  @ApiOperation({ summary: 'Marcar meta como concluída' })
  @ApiResponse({ status: 200, description: 'Meta marcada como concluída' })
  @ApiResponse({ status: 404, description: 'Meta não encontrada' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiParam({ name: 'id', description: 'ID da meta (UUID)' })
  markAsCompleted(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.goalsService.markAsCompleted(user.id, id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar meta por ID' })
  @ApiResponse({ status: 200, description: 'Detalhes da meta' })
  @ApiResponse({ status: 404, description: 'Meta não encontrada' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiParam({ name: 'id', description: 'ID da meta (UUID)' })
  findOne(@CurrentUser() user: User, @Param('id', ParseUUIDPipe) id: string) {
    return this.goalsService.findOne(user.id, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualizar meta' })
  @ApiResponse({ status: 200, description: 'Meta atualizada com sucesso' })
  @ApiResponse({ status: 404, description: 'Meta não encontrada' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiParam({ name: 'id', description: 'ID da meta (UUID)' })
  update(
    @CurrentUser() user: User,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateGoalDto,
  ) {
    return this.goalsService.update(user.id, id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remover meta' })
  @ApiResponse({ status: 204, description: 'Meta removida com sucesso' })
  @ApiResponse({ status: 404, description: 'Meta não encontrada' })
  @ApiResponse({ status: 401, description: 'Não autorizado' })
  @ApiParam({ name: 'id', description: 'ID da meta (UUID)' })
  remove(@CurrentUser() user: User, @Param('id', ParseUUIDPipe) id: string) {
    return this.goalsService.remove(user.id, id);
  }
}
