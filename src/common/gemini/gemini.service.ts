import {
  Content,
  ContentEmbedding,
  EmbedContentResponse,
  GoogleGenerativeAI,
} from '@google/generative-ai';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GeminiService {
  ai: GoogleGenerativeAI;
  model: string = 'gemini-flash-latest';
  embeddingModel: string = 'gemini-embedding-001';

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) throw new Error('GEMINI_API_KEY is missing');
    this.ai = new GoogleGenerativeAI(apiKey);
  }

  async askGemini(question: string, history: Content[] = []) {
    const model = this.ai.getGenerativeModel({
      model: this.model,
    });

    const contents: Content[] = history;
    contents.push({ role: 'user', parts: [{ text: question }] });

    return await model.generateContentStream({ contents });
  }

  async embedding(text: string): Promise<ContentEmbedding> {
    const model = this.ai.getGenerativeModel({
      model: this.embeddingModel,
    });
    const response: EmbedContentResponse = await model.embedContent(text);
    if (!response.embedding) throw new Error('Embeddings not found');
    return response.embedding;
  }
}
