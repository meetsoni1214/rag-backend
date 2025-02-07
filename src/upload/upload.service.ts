import { Injectable } from '@nestjs/common';
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { PrismaService } from '../prisma/prisma.service';
import { PrismaVectorStore } from '@langchain/community/vectorstores/prisma';
import { DocumentEmbedding } from '@prisma/client';

@Injectable()
export class UploadService {
  textSplitter
  constructor(
    private readonly prismaService: PrismaService,
    private readonly prismaVectorStore: PrismaVectorStore<DocumentEmbedding, any, any, any>
  ) {
    this.textSplitter= new RecursiveCharacterTextSplitter();
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
    await this.prismaVectorStore.addModels(embeddings);
  }
}
