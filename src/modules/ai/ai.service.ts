import { GoogleGenerativeAI } from '@google/generative-ai';
import { AppError } from '../../utils/errors';

const OPENROUTER_BASE = 'https://openrouter.ai/api/v1/chat/completions';
// Confirmed working free model on OpenRouter (tested 2026-03-26)
const OPENROUTER_MODEL = 'google/gemma-3-12b-it:free';

// ─── OpenRouter single-call helper ───────────────────────────────────────────
async function openRouterComplete(
  apiKey: string,
  systemPrompt: string,
  userMessage: string,
): Promise<string> {
  const res = await fetch(OPENROUTER_BASE, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: OPENROUTER_MODEL,
      messages: [
        { role: 'user', content: `${systemPrompt}\n\n${userMessage}` },
      ],
      temperature: 0.1, // low temp → more deterministic JSON
    }),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`OpenRouter ${res.status}: ${errText}`);
  }

  const json = (await res.json()) as any;
  const content = json.choices?.[0]?.message?.content ?? '';
  if (!content) throw new Error('OpenRouter returned empty content');
  return content.trim();
}

// ─── Regex fallback ───────────────────────────────────────────────────────────
function regexExtract(content: string): { education: any[]; experience: any[] } {
  const education: any[] = [];
  const experience: any[] = [];

  const eduSection = content.match(/##?\s*Education[\s\S]*?(?=\n##?\s|$)/i)?.[0] ?? '';
  for (const match of eduSection.matchAll(
    /(?:\*{1,2}|-)?\s*(.+?)(?:\*{0,2})\s*[-–|]\s*(.+?)(?:\s*[-–|]\s*(\d{4}[^\n]*))?(?:\n|$)/g,
  )) {
    education.push({
      school:       match[1]?.trim() ?? null,
      degree:       match[2]?.trim() ?? null,
      fieldOfStudy: null,
      startDate:    null,
      endDate:      match[3]?.trim() ?? null,
      description:  null,
    });
  }

  const expSection =
    content.match(/##?\s*(?:Experience|Work|Employment)[\s\S]*?(?=\n##?\s|$)/i)?.[0] ?? '';
  for (const match of expSection.matchAll(
    /(?:\*{1,2}|-)?\s*(.+?)(?:\*{0,2})\s*[-–|@]\s*(.+?)(?:\s*[-–|]\s*(\d{4}[^\n]*))?(?:\n|$)/g,
  )) {
    const dateStr = match[3]?.trim() ?? '';
    const isCurrent = /present|current/i.test(dateStr);
    experience.push({
      company:     match[2]?.trim() ?? null,
      position:    match[1]?.trim() ?? null,
      location:    null,
      startDate:   null,
      endDate:     isCurrent ? null : dateStr || null,
      description: null,
      isCurrent,
    });
  }

  return { education, experience };
}

// ─────────────────────────────────────────────────────────────────────────────
export class AiService {
  private genAI: GoogleGenerativeAI;

  constructor(
    private geminiKey: string,
    private openRouterKey: string,
  ) {
    this.genAI = new GoogleGenerativeAI(geminiKey || 'NO_KEY');
  }

  // ── Content enhancement (Gemini) ──────────────────────────────────────────
  async enhanceContent(prompt: string, context: { field: string; currentValue: string }) {
    try {
      const model = this.genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const aiPrompt = `
        You are an expert portfolio content enhancer.
        Request: ${prompt}
        Field to enhance: ${context.field}
        Current value: "${context.currentValue}"
        Provide only the enhanced text, without any additional comments or formatting.
      `;
      const result = await model.generateContent(aiPrompt);
      const enhanced = (await result.response).text().trim();
      return { enhanced, original: context.currentValue };
    } catch (err: any) {
      throw new AppError(`AI Enhancement failed: ${err.message}`, 500);
    }
  }

  /**
   * Extracts education + experience from resume / README text.
   * Primary  : OpenRouter → google/gemma-3-12b-it:free
   * Fallback : regex heuristics (no API required)
   */
  async extractPortfolioData(text: string): Promise<{ education: any[]; experience: any[] }> {
    // ── 1. OpenRouter (Gemma 3 12B) ──────────────────────────────────────────
    if (this.openRouterKey) {
      try {
        const systemPrompt = `You are an expert resume parser. Extract Education and Experience data from the given text.

Return ONLY a raw JSON object — no markdown, no code fences, no explanation — with exactly this structure:
{"education":[{"school":null,"degree":null,"fieldOfStudy":null,"startDate":null,"endDate":null,"description":null}],"experience":[{"company":null,"position":null,"location":null,"startDate":null,"endDate":null,"description":null,"isCurrent":false}]}

Rules:
- Dates: human-readable strings like "Jan 2020", "2022", "Present".
- Use null for any missing field.
- isCurrent: true only if the person still works there.
- Return empty arrays [] if a section is not found.
- Output ONLY the JSON. No other text whatsoever.`;

        const userMessage = `Parse this resume/profile and extract all education and work experience:\n\n${text.slice(0, 10000)}`;

        const raw = await openRouterComplete(this.openRouterKey, systemPrompt, userMessage);

        // Strip accidental markdown fences Gemma sometimes adds
        const cleaned = raw
          .replace(/^```(?:json)?\s*/i, '')
          .replace(/\s*```\s*$/, '')
          .trim();

        const parsed = JSON.parse(cleaned);

        if (parsed && (Array.isArray(parsed.education) || Array.isArray(parsed.experience))) {
          return {
            education:  Array.isArray(parsed.education)  ? parsed.education  : [],
            experience: Array.isArray(parsed.experience) ? parsed.experience : [],
          };
        }

        throw new Error('Unexpected JSON shape from model');
      } catch (err: any) {
        // Log and fall through — never surface a 500 just because the model misbehaved
        console.warn('[AiService] OpenRouter extraction failed, falling back to regex:', err.message);
      }
    }

    // ── 2. Regex fallback ────────────────────────────────────────────────────
    return regexExtract(text);
  }
}
