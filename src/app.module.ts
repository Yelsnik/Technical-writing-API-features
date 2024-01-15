import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { ExpensesController } from './expenses/expenses.controller';
import { ExpensesModule } from './expenses/expenses.module';
import { ExpensesService } from './expenses/expenses.service';

@Module({
  imports: [
    ExpensesModule,
    ConfigModule.forRoot({ envFilePath: '.env', isGlobal: true }),
    MongooseModule.forRoot(process.env.DATABASE),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
