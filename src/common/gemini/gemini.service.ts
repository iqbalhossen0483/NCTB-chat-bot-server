import {
  ContentEmbedding,
  ContentListUnion,
  GenerateContentConfig,
  GoogleGenAI,
} from '@google/genai';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GeminiService {
  ai: GoogleGenAI;
  config: GenerateContentConfig;
  model: string = 'gemini-flash-latest';
  embeddingModel: string = 'gemini-embedding-001';

  constructor(private readonly configService: ConfigService) {
    this.ai = new GoogleGenAI({
      apiKey: configService.get<string>('GEMINI_API_KEY', 'api_key'),
    });
  }

  async askGemini(question: string) {
    const contents: ContentListUnion = {
      role: 'user',
      text: question,
    };

    const response = await this.ai.models.generateContent({
      config: this.config,
      model: this.model,
      contents,
    });

    return response;
  }

  async embedding(text: string): Promise<ContentEmbedding[]> {
    const response = await this.ai.models.embedContent({
      model: this.embeddingModel,
      contents: {
        parts: [
          {
            text,
          },
        ],
      },
    });
    if (!response.embeddings) throw new Error('Embeddings not found');
    return response.embeddings;
  }
}
