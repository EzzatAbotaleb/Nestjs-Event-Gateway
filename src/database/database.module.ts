import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { EventSchema } from './schemas/event.schema';
import { OrderSchema } from './schemas/order.schema';
import { ShipmentSchema } from './schemas/shipment.schema';
import { EventRepository } from './event.repository';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('MONGODB_URI', 'mongodb://mongo:27017/event-gateway'),
        useNewUrlParser: true,
        useUnifiedTopology: true,
        retryAttempts: 5,
        retryDelay: 2000, //
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: 'Event', schema: EventSchema },
      { name: 'Order', schema: OrderSchema },
      { name: 'Shipment', schema: ShipmentSchema },
    ]),
  ],
  providers: [EventRepository],
  exports: [MongooseModule, EventRepository],
})
export class DatabaseModule {}
