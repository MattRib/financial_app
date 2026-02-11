import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseUUIDPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import type { User } from '@supabase/supabase-js';
import { InsightsService } from './insights.service';
import { GenerateInsightDto, FilterInsightDto } from './dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/user.decorator';

@ApiTags('insights')
@ApiBearerAuth()
@UseGuards(AuthGuard)
@Controller('insights')
export class InsightsController {
  constructor(private readonly insightsService: InsightsService) {}

  @Post('generate')
  @ApiOperation({
    summary: 'Gera insights financeiros para o mês/ano (ou retorna cached)',
  })
  @ApiResponse({
    status: 201,
    description: 'Insight gerado com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Sem transações no período',
  })
  @ApiResponse({
    status: 500,
    description: 'Erro ao chamar OpenAI',
  })
  generate(@CurrentUser() user: User, @Body() dto: GenerateInsightDto) {
    return this.insightsService.generate(user.id, dto);
  }

  @Post('regenerate')
  @ApiOperation({
    summary: 'Regenera insights com dados atualizados (sobrescreve o existente)',
  })
  @ApiResponse({
    status: 201,
    description: 'Insight regenerado com sucesso',
  })
  @ApiResponse({
    status: 404,
    description: 'Sem transações no período',
  })
  @ApiResponse({
    status: 500,
    description: 'Erro ao chamar OpenAI',
  })
  regenerate(@CurrentUser() user: User, @Body() dto: GenerateInsightDto) {
    return this.insightsService.regenerate(user.id, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista histórico de insights gerados' })
  @ApiResponse({
    status: 200,
    description: 'Lista de insights',
  })
  findAll(@CurrentUser() user: User, @Query() filters: FilterInsightDto) {
    return this.insightsService.findAll(user.id, filters);
  }

  @Get('evolution')
  @ApiOperation({ summary: 'Busca evolução financeira dos últimos meses' })
  @ApiResponse({
    status: 200,
    description: 'Dados de evolução mensal',
  })
  getEvolution(
    @CurrentUser() user: User,
    @Query('months') months?: number,
  ) {
    return this.insightsService.getEvolution(user.id, months || 6);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Busca insight por ID' })
  @ApiResponse({
    status: 200,
    description: 'Insight encontrado',
  })
  @ApiResponse({
    status: 404,
    description: 'Insight não encontrado',
  })
  findOne(@CurrentUser() user: User, @Param('id', ParseUUIDPipe) id: string) {
    return this.insightsService.findOne(user.id, id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Remove insight (invalidar cache)' })
  @ApiResponse({
    status: 204,
    description: 'Insight removido',
  })
  @ApiResponse({
    status: 404,
    description: 'Insight não encontrado',
  })
  remove(@CurrentUser() user: User, @Param('id', ParseUUIDPipe) id: string) {
    return this.insightsService.remove(user.id, id);
  }
}
