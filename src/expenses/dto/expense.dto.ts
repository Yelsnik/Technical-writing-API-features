export class ExpenseDto {
  private readonly title: string;
  private readonly amount: number;
  private readonly category: string;
  private readonly incurred?: Date;
  private readonly notes?: string;
}
