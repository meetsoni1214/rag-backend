import { Injectable } from '@nestjs/common';
import { AzureChatOpenAI } from '@langchain/openai';
import { ConfigService } from '@nestjs/config';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { PrismaVectorStore } from '@langchain/community/vectorstores/prisma';
import { DocumentEmbedding } from '@prisma/client';
import { MessageContent } from '@langchain/core/messages';

@Injectable()
export class ChatService {
  model = new AzureChatOpenAI({
    model: "gpt-4o",
    temperature: 0.4,
    maxTokens: undefined,
    maxRetries: 2,
    azureOpenAIApiKey: this.configService.get<string>("OPEN_AI_API_KEY"), // In Node.js defaults to process.env.AZURE_OPENAI_API_KEY
    azureOpenAIApiInstanceName: this.configService.get<string>("INSTANCE_NAME"), // In Node.js defaults to process.env.AZURE_OPENAI_API_INSTANCE_NAME
    azureOpenAIApiDeploymentName: this.configService.get<string>("CHAT_MODEL_DEPLOYMENT_NAME"), // In Node.js defaults to process.env.AZURE_OPENAI_API_DEPLOYMENT_NAME
    azureOpenAIApiVersion: this.configService.get<string>("CHAT_MODEL_API_VERSION"), // In Node.js defaults to process.env.AZURE_OPENAI_API_VERSION
  });
  textSplitter
  constructor(private configService: ConfigService, private prismaVectorStore: PrismaVectorStore<DocumentEmbedding, any, any, any>
              ) {
    this.textSplitter= new RecursiveCharacterTextSplitter();
  }
  async getResponse(query: string) {

    const response = await this.model.invoke("Hi");
    return `Hello ${query} ${response.content}`;
  }


  async chatWithPdf(query: string): Promise<MessageContent> {
    const context = await this.prismaVectorStore.similaritySearch(query, 1);
    const response = await this.model.invoke([
      [
        "system",
        `Consider the context: ${context[0].pageContent}. And now answer the questions.`
      ],
      [
        "human",
        query
      ]
    ]);
    return response.content;
  }
}
