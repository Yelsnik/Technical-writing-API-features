import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Expense } from './expenses.schema';
import { Model } from 'mongoose';
import { ExpenseDto } from './dto/expense.dto';
import { APIFeatures } from 'src/Utils/apiFeatures';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectModel(Expense.name) private expenseModel: Model<Expense>,
  ) {}

  async createExpense(data: ExpenseDto) {
    const expense = this.expenseModel.create(data);

    return expense;
  }

  async getExpenses(query?: any) {
    const features = new APIFeatures(this.expenseModel.find(), query)
      .filter()
      .sort()
      .limit()
      .pagination();
    //Execute the query
    const expenses = await features.mongooseQuery;

    return expenses;
  }
}
