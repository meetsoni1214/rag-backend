import { Controller, Get, Post, Query, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ChatService } from './chat.service';
import { FileInterceptor} from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {
  }
  @Get("/")
  async getResponse(@Query('query') query: string) {
    return this.chatService.getResponse(query);
  }

  @Get("/chatWithPdf")
  async chatWithPdf(@Query('query') query: string) {
    return this.chatService.chatWithPdf(query);
  }

  @Post("/upload")
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: "/temp"
    }),
  }))
  uploadFile(@UploadedFile() file: Express.Multer.File ) {
    return this.chatService.fileUpload(file)
  }

}
