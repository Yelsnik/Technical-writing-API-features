# HOW TO ADD FILTERING, SORTING, LIMITING AND PAGINATION IN YOUR NESTJS APP

## Table of contents

- [Introduction](#introduction)
- [What are APIs?](#what-are-apis)
- [Setting up a nestjs app](#setting-up-a-nestjs-app)
- [Configuring MongoDB](#configuring-mongodb)
- [Setting up the expense endpoints](#settting-up-the-expense-endpoints)
- [Implementing filtering and sorting](#implementing-filtering-and-sorting)
- [Implementing limiting and pagination](#implementing-limiting-and-pagination)
- [Conclusion](#conclusion)

### Introduction

If you are reading this article, you are a developer who has used an API maybe more than once to call data for your application. You may have also utilised features such as filtering and pagination to limit the amount of data you want to receive. These API features are important when building your own API. This is to ensure an API is fast, secure and easily understandable by those using it.

In this article, you will build a simple expense API with nestjs and MongoDB as database. You will then implement filtering, sorting, limiting and pagination to make your API faster and easy to use. Let's begin!

### What are APIs?

APIs are the backbone of modern software development. An API stands for application programming interface. It is a way for a piece of software to communicate with another piece of software. Web APIs use the HTTP communication protocols to communicate with computers. There are of course different types of APIs but that is a subject for another article.

These days, it is common for web APIs to have design features such as filtering, sorting, limiting and pagination to make the API faster, easy to use and secure. You will learn how to implement these features to make a better API in this article.

### Setting up a Nestjs app

First of all, you will be building a simple expense CRUD API in Nestjs. Nestjs is a progressive nodejs framework for building modern APIs. It is easy to use.

To get started, open your command line and type out the following commands:

```
$ npm i -g @nestjs/cli
$ nest new expense-app
```

Follow the installation guide and this will generate a few boilerplate files for you. Open your Nestjs app in an IDE of your choice.

### Configuring MongoDB

Since MongoDB is our preferred database, it is important to configure so you can use it in your app.
First install the `@nestjs/mongoose` package:

```
$ npm i @nestjs/mongoose mongoose
```

Once the installation is complete, go into your app module file and import the `MongooseModule`:

```
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [MongooseModule.forRoot(`mongodb+srv://*******:*******@cluster0.30vt0jd.mongodb.net/expense-test-app`)],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
```

If you do not want to expose your string that way, you can create a `.env` file and store your database connection string. You will then need to install the `@nestjs/config` package which uses dotenv internally.
Inside your app module file, import the `ConfigModule`:

```
@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: '.env', isGlobal: true }),
    MongooseModule.forRoot(process.env.DATABASE),
  ],
  controllers: [AppController],
  providers: [AppService],
})
```

`isGlobal: true` is to make the module available everywhere in your application. `envFilePath` specifies the path to your `.env` file.

### Settting up the expense endpoints

You have configured MongoDB. Now it's time to set up the expense endpoints. You can create a module in nestjs by typing the following into the terminal: `nest generate module expenses`. You can also generate the controller: `nest generate controller expenses` and the service: `nest generate service expenses`. All these should be done in the src folder. Go ahead and generate an expenses.schema.ts file.

Inside the expenses.schema.ts file, create an expense schema with some validation.

```
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
```

The properties in this schema includes; title, amount, category, notes, slug.
After doing this, you want to register the expense model in the expenses.module.ts file:

```
import { Module } from '@nestjs/common';
import { ExpensesController } from './expenses.controller';
import { ExpensesService } from './expenses.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Expense, ExpenseSchema } from './expenses.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Expense.name, schema: ExpenseSchema }]),
  ],
  controllers: [ExpensesController],
  providers: [ExpensesService],
})
export class ExpensesModule {}
```

Once you've registered the schema, you can then inject the `Expense` model into the `ExpensesService` by using an `@InjectModel()` decorator.

```
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Expense } from './expenses.schema';
import { Model } from 'mongoose';
import { ExpenseDto } from './dto/expense.dto';

@Injectable()
export class ExpensesService {
  constructor(
    @InjectModel(Expense.name) private expenseModel: Model<Expense>,
  ) {}

  async createExpense(data: ExpenseDto) {
    const expense = this.expenseModel.create(data);

    return expense;
  }

  async getExpenses() {
    const expenses = await this.expenseModel.find();

    return expenses;
  }
}
```

In the `ExpensesService` file, the `Expense` model was injected as a dependency using the `@InjectModel()` decorator. Once this is done, you then go ahead and define a function that creates an expense and a function that gets all expenses.

In your controller, you will add the following code:

```
import { Body, Controller, Get, Post, Res } from '@nestjs/common';
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
  async getExpenses(@Res() response: any) {
    const expenses = await this.expenseService.getExpenses();

    return response.status(200).json({
      message: 'success',
      data: expenses,
    });
  }
}
```

If you are getting a dependency error, navigate to your `app.module.ts` file and remove `ExpenseController` from the `controllers` array.

You can test the endpoint on Postman.

### Implementing filtering and sorting

Now that you have successfully set up the expense endpoints, it's time to implement filtering and sorting features in the API.

- Filtering

Filtering is essentially done in the same way it is done in nodejs.

Inside your src directory, create a new folder called `Utils` and inside that folder create a new file called `apiFeatures.ts`.

Inside this file, you will define a class called `APIFeatures`. This class will contain methods that will house the API features you will implement.

```
export class APIFeatures {
  mongooseQuery: any;
  queryString: any;

  constructor(mongooseQuery: any, queryString: any) {
    this.mongooseQuery = mongooseQuery;
    this.queryString = queryString;
  }

  filter() {
    // 1) Filtering
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((fields) => {
      delete queryObj[fields];
    });
    // console.log(queryObj);

    //2) Advanced filtering
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
    //console.log(JSON.parse(queryStr));

    this.mongooseQuery = this.mongooseQuery.find(JSON.parse(queryStr));

    return this;
  }
}
```

In the filter method, you created a hard copy of the `req.query`. It is passed as an argument in the form of `queryString`. Before filtering, you want to exclude certain special fileds such as `page`, `sort`, `limits` and `fields`. These fields are deleted from the hard copy of the object which is stored in the variable `queryObj`. You also want to use MongoDB operators such as `gt` or `gte`.

For example, on Postman this is how you type in the query: `?amount[gt]=100`
In MongoDB, It'll look like this: `{ amount: { $gt: 100 } }`. In the filter method, a `$` sign was added to the operators using a regular expression.
After that is done, the object is parsed using `JSON.parse()` method and it is then passed into the Mongoose query function. Make sure you return the whole class itself by typing `return this`.

- Sorting
  As you can see, implementing fitering is quite easy in nestjs as it is in nodejs.
  It's time to implement sorting. Inside the `APIFeatures` class, define another function called sorting.

```
  sorting() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort.split(',').join(' ');
      // console.log(sortBy);
      this.mongooseQuery = this.mongooseQuery.sort(sortBy);
    } else {
      this.mongooseQuery = this.mongooseQuery.sort('-created');
    }

    return this;
  }
```

The above method checks if a sort property exists on the query object and if it does, you split the string by by a `,` in case there are multiple sort queries and then join it by a `' '`. Once this is done, you chain it to the mongoose query with a sort method which exists on all documents. The else block sorts the document by the date it was created in case the user does not specify any sort query.

### Implementing limiting and pagination

Congrats! you have implemented filtering and sorting. Now it's time to implement pagination and limiting.

- Limiting

To limit fields, you can call the `select()` method on the Mongoose query.

You define another method in the class:

```
 limit() {
    if (this.queryString.fields) {
      const fields = this.queryString.fields.split(',').join(' ');

      this.mongooseQuery = this.mongooseQuery.select(fields);
    } else {
      this.mongooseQuery = this.mongooseQuery.select('-__v');
    }

    return this;
  }
```

- Pagination

To implement pagination, you want to get the `page` and `limit` from the query object. You then want to skip certain number of documents to get to the page you want. There is a `skip()` method and a `limit()` method on the Mongoose query.

```
  pagination() {
    // get the page and convert it to a number. If no page set default to 1
    const page = this.queryString.page * 1 || 1;

    // get limit and if no limit, set limit to 100
    const limit = this.queryString.limit * 1 || 100;

    // calculate skip value
    const skip = (page - 1) * limit;

    // chain it to the mongoose query.
    this.mongooseQuery = this.mongooseQuery.skip(skip).limit(limit);

    // return the object
    return this;
  }
```

Once this is done, you want to call the `APIfeatures` class in your `ExpensesService` class in your expenses.service.ts file.
Replace your `getExpenses` function with this code

```
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
```

In the function, it is possible to chain all these methods in the `APIFeatures` class because each method returns the object.

In your expenses.controller.ts file, your `getExpenses` function should look like this:

```
  @Get()
  async getExpenses(@Res() response: any, @Req() request: any) {
    const expenses = await this.expenseService.getExpenses(request.query);

    return response.status(200).json({
      message: 'success',
      data: expenses,
    });
  }
```

Now run the application with `npm start:dev` and test your API features in Postman.

### Conclusion

In summary, you have learnt how to implement sorting, filtering, limiting and pagination in the context of a Nestjs application. With this knowledge, you can go ahead and implement these features in your personal projects built using Nestjs.
