import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type ExpenseDocument = HydratedDocument<Expense>;

@Schema()
export class Expense {
  @Prop({
    trim: true,
    required: [true, 'Title is required'],
  })
  title: string;

  @Prop({
    min: 0,
    required: [true, 'Amount is required'],
  })
  amount: number;

  @Prop({
    type: String,
    trim: true,
    required: [true, 'Category is required'],
  })
  category: string;

  @Prop({
    type: Date,
    default: Date.now,
  })
  incurred: Date;

  @Prop({ type: String, trim: true })
  notes: string;

  @Prop()
  slug: string;

  @Prop()
  updated: Date;

  @Prop({
    type: Date,
    default: Date.now,
  })
  created: Date;
}

export const ExpenseSchema = SchemaFactory.createForClass(Expense);
