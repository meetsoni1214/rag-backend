import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { ConfigService } from '@nestjs/config';
import { PrismaModule } from '../prisma/prisma.module';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaVectorStore } from '@langchain/community/vectorstores/prisma';
import { AzureOpenAIEmbeddings } from '@langchain/openai';
import { Prisma, DocumentEmbedding } from '@prisma/client';

@Module({
  imports: [PrismaModule],
  controllers: [ChatController],
  providers: [ChatService, ConfigService, PrismaService, {
      provide: PrismaVectorStore,
      useFactory: (prismaService: PrismaService, configService: ConfigService) => {
        return PrismaVectorStore.withModel<DocumentEmbedding>(
          prismaService,
        ).create(new AzureOpenAIEmbeddings({
          model: "gpt-4o",
          azureOpenAIApiKey: configService.get<string>("OPEN_AI_API_KEY"), // In Node.js defaults to process.env.AZURE_OPENAI_API_KEY
          azureOpenAIApiInstanceName: configService.get<string>("INSTANCE_NAME"), // In Node.js defaults to process.env.AZURE_OPENAI_API_INSTANCE_NAME
          azureOpenAIApiDeploymentName: configService.get<string>("DEPLOYMENT_NAME"), // In Node.js defaults to process.env.AZURE_OPENAI_API_DEPLOYMENT_NAME
          azureOpenAIApiVersion: configService.get<string>("API_VERSION"), // In Node.js defaults to process.env.AZURE_OPENAI_API_VERSION
        }), {
          prisma: Prisma,
          tableName: "document_embeddings" as any,
          vectorColumnName: "vector",
          columns: {
            id: PrismaVectorStore.IdColumn,
            content: PrismaVectorStore.ContentColumn,
            documentName: true,
          },
        });
      },
      inject: [PrismaService, ConfigService]
  }]
})
export class ChatModule {}
