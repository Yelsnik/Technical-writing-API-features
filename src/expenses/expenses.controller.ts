import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { ExpensesService } from './expenses.service';
import { ExpenseDto } from './dto/expense.dto';

@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expenseService: ExpensesService) {}

  @Post()
  async createExpense(@Body() data: ExpenseDto, @Res() response: any) {
    const expense = await this.expenseService.createExpense(data);
    console.log(expense);

    return response.status(201).json({
      message: 'success',
      data: expense,
    });
  }

  @Get()
  async getExpenses(@Res() response: any, @Req() request: any) {
    const expenses = await this.expenseService.getExpenses(request.query);

    return response.status(200).json({
      message: 'success',
      data: expenses,
    });
  }
}
