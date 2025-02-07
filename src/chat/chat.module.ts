import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ConfigService } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaService } from '../prisma/prisma.service';

@Module({
  imports: [PrismaModule],
  controllers: [ChatController],
  providers: [ChatService, ConfigService, PrismaService]
})
export class ChatModule {}
