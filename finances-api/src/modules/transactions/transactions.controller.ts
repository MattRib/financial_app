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
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiConsumes,
  ApiBody,
  ApiResponse,
} from '@nestjs/swagger';
import { TransactionsService } from './transactions.service';
import {
  CreateTransactionDto,
  UpdateTransactionDto,
  FilterTransactionDto,
  GetMonthlyExpensesDto,
  OfxPreviewDto,
  ConfirmOfxImportDto,
} from './dto';
import { AuthGuard } from '../../common/guards/auth.guard';
import { CurrentUser } from '../../common/decorators/user.decorator';
import type { User } from '@supabase/supabase-js';
import { OfxParserService } from './ofx-parser.service';

@ApiTags('transactions')
@Controller('transactions')
@UseGuards(AuthGuard)
export class TransactionsController {
  constructor(
    private readonly transactionsService: TransactionsService,
    private readonly ofxParserService: OfxParserService,
  ) {}

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

  @Get('monthly-expenses')
  getMonthlyExpenses(
    @CurrentUser() user: User,
    @Query() dto: GetMonthlyExpensesDto,
  ) {
    return this.transactionsService.getMonthlyExpenses(user.id, dto.year);
  }

  @Post('import/ofx/preview')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({
    summary: 'Preview de importação OFX',
    description:
      'Faz upload de arquivo OFX e retorna preview com transações parseadas, sugestões de categoria e duplicatas detectadas',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Arquivo OFX',
        },
      },
    },
  })
  @ApiResponse({ status: 200, type: OfxPreviewDto })
  async previewOfxImport(
    @CurrentUser() user: User,
    @UploadedFile() file: Express.Multer.File,
    @Query('account_id') accountId: string,
  ) {
    if (!file) {
      throw new BadRequestException('Arquivo OFX é obrigatório');
    }
    return this.ofxParserService.parseOfxFile(file.buffer, user.id, accountId);
  }

  @Post('import/ofx/confirm')
  @ApiOperation({
    summary: 'Confirmar importação OFX',
    description:
      'Cria transações em batch a partir do preview confirmado pelo usuário',
  })
  @ApiResponse({
    status: 201,
    description: 'Transações importadas com sucesso',
  })
  async confirmOfxImport(
    @CurrentUser() user: User,
    @Body() dto: ConfirmOfxImportDto,
  ) {
    const created: any[] = [];
    for (const transaction of dto.transactions) {
      const result = await this.transactionsService.create(
        user.id,
        transaction,
      );
      // Handle both single transaction and installment array
      if (Array.isArray(result)) {
        created.push(...result);
      } else {
        created.push(result);
      }
    }
    return {
      imported: created.length,
      transactions: created,
    };
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
