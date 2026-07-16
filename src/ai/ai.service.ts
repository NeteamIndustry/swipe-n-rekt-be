import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';
import { configService } from 'src/app.config';
import {
  GeneratePropositionDto,
  GeneratedPropositionText,
} from './dtos/generate-question.dto';

@Injectable()
export class AiService {
  private client: OpenAI;
  private model: string;

  constructor() {
    const aiConfig = configService.getAiConfig();
    this.model = aiConfig.model || '';

    this.client = new OpenAI({
      baseURL: aiConfig.apiUrl,
      apiKey: aiConfig.apiKey,
    });
  }

  async generateProposition(
    payload: GeneratePropositionDto,
  ): Promise<GeneratedPropositionText> {
    const prompt = `You are writing a YES/NO prediction question for a live sports betting product. The question must ask exactly whether this will happen: "${payload.outcomeLabel}". YES means it happens, NO means it doesn't — that split is already decided, you are only writing the question text.

    ## Input data
    - SuperOddsType: ${payload.superOddsType}
    - MarketPeriod: ${payload.marketPeriod}
    - Outcome: ${payload.outcomeLabel}

    ## Task
    1. Write a short, punchy question (max 8 words, all caps) phrased how a fan would say it, asking exactly whether "${payload.outcomeLabel}" happens.
    2. Classify it into ONE category from this exact list: GOALS, CARDS, CORNERS, SET_PIECE, POSSESSION, SAVES, OTHER.
    3. Write a one-sentence contextText (max 15 words) explaining why this is relevant right now, grounded only in the data given. Do not invent facts not implied by the input.

    ## Output rules
    - Return ONLY valid JSON. No markdown code fences, no explanation, no extra text before or after.
    - All keys must be present. Do not add extra keys.
    - Do NOT output any price, odds, or probability — pricing is computed separately from the raw market data, not by you.

    ## Output format
    {
      "question": string,
      "category": "GOALS" | "CARDS" | "CORNERS" | "SET_PIECE" | "POSSESSION" | "SAVES" | "OTHER",
      "contextText": string
    }

    ## Example
    Input: SuperOddsType: "next_goal", MarketPeriod: "5min", Outcome: "a goal in the next 5 minutes"
    Output:
    {"question":"GOAL IN THE NEXT 5 MINUTES?","category":"GOALS","contextText":"Team pressing hard with sustained possession in the final third."}

    Now generate the JSON for the input data above.`;

    const completion = await this.client.chat.completions.create({
      model: this.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.4,
      max_tokens: 10000,
      response_format: { type: 'json_object' },
    });

    const content = completion.choices[0]?.message?.content ?? '';

    try {
      return JSON.parse(content) as GeneratedPropositionText;
    } catch {
      throw new Error(`AI returned invalid JSON for proposition: ${content}`);
    }
  }
}
