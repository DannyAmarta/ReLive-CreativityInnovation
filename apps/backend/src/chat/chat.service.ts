import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI from 'openai';

@Injectable()
export class ChatService {
  private readonly groq: OpenAI;

  // Fix #10: Use ConfigService instead of process.env directly.
  // ConfigService.getOrThrow() validates the key at startup — if GROQ_API_KEY is
  // missing the app won't start, giving a clear error instead of a silent runtime failure.
  constructor(private readonly configService: ConfigService) {
    this.groq = new OpenAI({
      apiKey: configService.getOrThrow<string>('GROQ_API_KEY'),
      baseURL: 'https://api.groq.com/openai/v1',
    });
  }

  async askSage(userMessage: string, userData: any) {
    const completion = await this.groq.chat.completions.create({
      model: 'llama-3.1-8b-instant',
      messages: [
        {
          role: 'system',
          content: `You are Sage, the ReLive Botanical Archivist. 
          The user is ${userData.name}, a ${userData.fitnessLevel}. 
          Their goal is ${userData.primaryGoal}. 
          Speak with intellectual elegance.`,
        },
        { role: 'user', content: userMessage },
      ],
    });
    return completion.choices[0].message;
  }
}