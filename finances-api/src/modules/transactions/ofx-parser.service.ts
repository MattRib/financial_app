import { Injectable, Inject, BadRequestException } from '@nestjs/common';
import type { SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_CLIENT } from '../../config/supabase.module';
import { CategoriesService } from '../categories/categories.service';
import * as OFX from 'ofx-js';
import { format, parse } from 'date-fns';
import { OfxPreviewDto, ParsedOfxTransactionDto } from './dto/import-ofx.dto';
import type { Category } from '../categories/entities/category.entity';
import type { Transaction } from './entities/transaction.entity';

@Injectable()
export class OfxParserService {
  constructor(
    @Inject(SUPABASE_CLIENT) private supabase: SupabaseClient,
    private categoriesService: CategoriesService,
  ) {}

  private readonly categoryKeywords: Record<string, string[]> = {
    Alimentação: [
      'mercado',
      'supermercado',
      'padaria',
      'restaurante',
      'ifood',
      'uber eats',
      'rappi',
      'lanchonete',
      'pizzaria',
      'hamburgueria',
      'açougue',
      'feira',
    ],
    Transporte: [
      'uber',
      'posto',
      'combustivel',
      'gasolina',
      'etanol',
      'estacionamento',
      'pedagio',
      '99',
      'taxi',
      'onibus',
      'metro',
      'metrô',
    ],
    Moradia: [
      'aluguel',
      'condominio',
      'energia',
      'agua',
      'internet',
      'luz',
      'gas',
      'iptu',
      'condomínio',
      'água',
      'gás',
    ],
    Saúde: [
      'farmacia',
      'drogaria',
      'clinica',
      'hospital',
      'laboratorio',
      'consulta',
      'médico',
      'dentista',
      'plano de saude',
      'saúde',
      'farmácia',
      'clínica',
      'laboratório',
    ],
    Lazer: [
      'cinema',
      'netflix',
      'spotify',
      'jogo',
      'ingresso',
      'teatro',
      'show',
      'parque',
      'disney',
      'prime video',
      'youtube',
    ],
    Compras: [
      'loja',
      'shopping',
      'magazine',
      'mercado livre',
      'amazon',
      'americanas',
      'shopee',
      'shein',
      'renner',
      'c&a',
    ],
    Contas: [
      'telefone',
      'celular',
      'conta',
      'fatura',
      'cartão',
      'cartao',
      'banco',
      'tarifa',
      'anuidade',
    ],
  };

  async parseOfxFile(
    fileBuffer: Buffer,
    userId: string,
    accountId: string,
  ): Promise<OfxPreviewDto> {
    try {
      // Parse OFX file
      const ofxContent = fileBuffer.toString('utf-8');
      const ofxData = OFX.parse(ofxContent);

      // Validate OFX data
      if (!ofxData || !ofxData.OFX) {
        throw new BadRequestException('Formato OFX inválido');
      }

      // Extract transactions from OFX structure
      const bankTransactions =
        ofxData.OFX.BANKMSGSRSV1?.STMTTRNRS?.STMTRS?.BANKTRANLIST?.STMTTRN ||
        [];

      if (!Array.isArray(bankTransactions) || bankTransactions.length === 0) {
        throw new BadRequestException('Arquivo OFX não contém transações');
      }

      if (bankTransactions.length > 500) {
        throw new BadRequestException(
          'Máximo de 500 transações por importação',
        );
      }

      // Validate account_id
      const { data: accountData, error: accountError } = await this.supabase
        .from('accounts')
        .select('id')
        .eq('id', accountId)
        .eq('user_id', userId)
        .single();

      if (accountError || !accountData) {
        throw new BadRequestException('Conta inválida ou não encontrada');
      }

      // Get user categories
      const categories = await this.categoriesService.findAll(userId);

      // Get existing transactions for duplicate detection
      const { data: existingTransactions } = await this.supabase
        .from('transactions')
        .select('amount, date')
        .eq('user_id', userId)
        .eq('account_id', accountId);

      // Map OFX transactions to our format
      const parsedTransactions: ParsedOfxTransactionDto[] =
        bankTransactions.map((tx: any) => {
          const amount = Math.abs(parseFloat(tx.TRNAMT));
          const type = parseFloat(tx.TRNAMT) >= 0 ? 'income' : 'expense';
          const description = tx.MEMO || tx.NAME || 'Transação importada';

          // Parse date (OFX format: YYYYMMDD or YYYYMMDDHHMMSS)
          let date: string;
          try {
            const dateStr = String(tx.DTPOSTED || '');
            const year = dateStr.substring(0, 4);
            const month = dateStr.substring(4, 6);
            const day = dateStr.substring(6, 8);
            date = `${year}-${month}-${day}`;

            // Validate date
            const parsedDate = parse(date, 'yyyy-MM-dd', new Date());
            if (isNaN(parsedDate.getTime())) {
              date = format(new Date(), 'yyyy-MM-dd');
            }
          } catch {
            date = format(new Date(), 'yyyy-MM-dd');
          }

          const suggested_category_id = this.suggestCategory(
            String(description),
            categories,
            type,
          );

          return {
            description,
            amount,
            date,
            type,
            suggested_category_id,
          };
        });

      // Detect duplicates
      const duplicates = this.detectDuplicates(
        parsedTransactions,
        (existingTransactions || []) as Transaction[],
      );

      return {
        total_transactions: parsedTransactions.length,
        transactions: parsedTransactions,
        duplicates,
      };
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        `Erro ao processar arquivo OFX: ${error.message}`,
      );
    }
  }

  private suggestCategory(
    description: string,
    categories: Category[],
    type: 'income' | 'expense',
  ): string | undefined {
    // Only suggest for expenses
    if (type === 'income') {
      // Try to find "Salário" or "Freelance" category for income
      const salaryCategory = categories.find(
        (c) => c.type === 'income' && c.name.toLowerCase().includes('salário'),
      );
      if (salaryCategory) return salaryCategory.id;

      // Return first income category as fallback
      const firstIncomeCategory = categories.find((c) => c.type === 'income');
      return firstIncomeCategory?.id;
    }

    const descLower = description.toLowerCase();

    // Try to match keywords
    for (const [categoryName, keywords] of Object.entries(
      this.categoryKeywords,
    )) {
      if (keywords.some((keyword) => descLower.includes(keyword))) {
        const category = categories.find(
          (c) => c.type === 'expense' && c.name === categoryName,
        );
        if (category) return category.id;
      }
    }

    // Return undefined if no match (user will need to select)
    return undefined;
  }

  private detectDuplicates(
    parsedTransactions: ParsedOfxTransactionDto[],
    existingTransactions: Transaction[],
  ): number[] {
    const duplicates: number[] = [];

    parsedTransactions.forEach((parsed, index) => {
      const isDuplicate = existingTransactions.some(
        (existing) =>
          Math.abs(existing.amount - parsed.amount) < 0.01 &&
          existing.date === parsed.date,
      );

      if (isDuplicate) {
        duplicates.push(index);
      }
    });

    return duplicates;
  }
}
