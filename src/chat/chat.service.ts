import { Injectable } from '@nestjs/common';
import { AzureChatOpenAI } from '@langchain/openai';
import { ConfigService } from '@nestjs/config';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ChatService {
  textSplitter
  constructor(private configService: ConfigService,
              private prismaService: PrismaService) {
    this.textSplitter= new RecursiveCharacterTextSplitter();
  }
  async getResponse(query: string) {
    const model = new AzureChatOpenAI({
      model: "gpt-4o",
      temperature: 0,
      maxTokens: undefined,
      maxRetries: 2,
      azureOpenAIApiKey: this.configService.get<string>("OPEN_AI_API_KEY"), // In Node.js defaults to process.env.AZURE_OPENAI_API_KEY
      azureOpenAIApiInstanceName: this.configService.get<string>("INSTANCE_NAME"), // In Node.js defaults to process.env.AZURE_OPENAI_API_INSTANCE_NAME
      azureOpenAIApiDeploymentName: this.configService.get<string>("DEPLOYMENT_NAME"), // In Node.js defaults to process.env.AZURE_OPENAI_API_DEPLOYMENT_NAME
      azureOpenAIApiVersion: this.configService.get<string>("API_VERSION"), // In Node.js defaults to process.env.AZURE_OPENAI_API_VERSION
    });
    const response = await model.invoke("Hi");
    return `Hello ${query} ${response.content}`;
  }
  async fileUpload(file: Express.Multer.File ){
    const loader = new PDFLoader(file.path);
    const chunks = await this.textSplitter.splitDocuments(await loader.load());
    const embeddings = await Promise.all(
      chunks.map((doc) => {
        return this.prismaService.documentEmbedding.create({
          data: {
            content: doc.pageContent,
            documentName: file.originalname,
          },
        });
      }),
    );
  }
}
