// @ts-nocheck
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateExpenseDto, ListExpensesQueryDto } from './dto/expense.dto';

@Injectable()
export class ExpensesService {
  constructor(private prisma: PrismaService) {}

  async create(loggedByUserId: string, dto: CreateExpenseDto) {
    return this.prisma.expense.create({
      data: {
        propertyId: dto.propertyId,
        category: dto.category,
        description: dto.description,
        amount: dto.amount,
        expenseDate: new Date(dto.expenseDate),
        vendorName: dto.vendorName,
        invoiceUrl: dto.invoiceUrl,
        isRecurring: dto.isRecurring,
        loggedByUserId,
      },
    });
  }

  async findByProperty(propertyId: string, query: ListExpensesQueryDto) {
    const { page = 1, limit = 20, category, fromDate, toDate } = query;
    const skip = (page - 1) * limit;

    const where: any = { propertyId };
    if (category) where.category = category;
    if (fromDate || toDate) {
      where.expenseDate = {
        ...(fromDate && { gte: new Date(fromDate) }),
        ...(toDate && { lte: new Date(toDate) }),
      };
    }

    const [expenses, total] = await Promise.all([
      this.prisma.expense.findMany({
        where,
        skip,
        take: limit,
        orderBy: { expenseDate: 'desc' },
      }),
      this.prisma.expense.count({ where }),
    ]);

    const totalAmount = expenses.reduce((s, e) => s + e.amount, 0);

    return {
      data: expenses,
      totalAmount,
      _meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    };
  }

  async getExpenseSummary(propertyId: string, year: number) {
    const expenses = await this.prisma.expense.findMany({
      where: {
        propertyId,
        expenseDate: {
          gte: new Date(year, 0, 1),
          lte: new Date(year, 11, 31),
        },
      },
    });

    const byCategory: Record<string, number> = {};
    let total = 0;

    for (const e of expenses) {
      byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
      total += e.amount;
    }

    return { total, byCategory, year };
  }

  async delete(id: string, userId: string) {
    const expense = await this.prisma.expense.findUnique({ where: { id } });
    if (!expense) throw new NotFoundException('Expense not found');
    return this.prisma.expense.delete({ where: { id } });
  }
}
