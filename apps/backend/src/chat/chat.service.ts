import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class ChatService {
  private groq = new OpenAI({
    apiKey: process.env.GROQ_API_KEY,
    baseURL: "https://api.groq.com/openai/v1",
  });

  async askSage(userMessage: string, userData: any) {
    const completion = await this.groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: `You are Sage, the ReLive Botanical Archivist. 
          The user is ${userData.name}, a ${userData.fitnessLevel}. 
          Their goal is ${userData.primaryGoal}. 
          Speak with intellectual elegance.`
        },
        { role: "user", content: userMessage }
      ],
    });
    return completion.choices[0].message;
  }
}