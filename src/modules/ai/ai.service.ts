import { GoogleGenerativeAI } from '@google/generative-ai';
import nlp from 'compromise';
// @ts-ignore – compromise-dates has no bundled types
import compromiseDates from 'compromise-dates';
import { AppError } from '../../utils/errors';

// Extend compromise with date-awareness
nlp.extend(compromiseDates);

// ─── Section heading keywords ───────────────────────────────────────────────
const EDU_HEADERS  = /\b(education|academic|qualification|degree|university|college|school)\b/i;
const EXP_HEADERS  = /\b(experience|employment|work history|career|professional|internship|position)\b/i;
const SKIP_HEADERS = /\b(skill|project|certification|award|publication|language|volunteer|interest|summary|objective|reference)\b/i;

// ─── Date normaliser (returns a human-readable string or null) ───────────────
function normaliseDate(raw: string | undefined | null): string | null {
  if (!raw) return null;
  const s = raw.trim();
  if (!s) return null;
  if (/present|current|now/i.test(s)) return 'Present';
  // already looks like a real date string — just return it
  return s;
}

// ─── Split raw text into labelled sections ───────────────────────────────────
function splitSections(text: string): { type: 'education' | 'experience' | 'other'; lines: string[] }[] {
  const lines = text.split(/\r?\n/);
  const sections: { type: 'education' | 'experience' | 'other'; lines: string[] }[] = [];
  let current: { type: 'education' | 'experience' | 'other'; lines: string[] } = { type: 'other', lines: [] };

  for (const line of lines) {
    const clean = line.trim();
    // Heading detection: short line that matches a known section keyword
    if (clean.length < 60 && clean.length > 1) {
      if (EDU_HEADERS.test(clean) && !SKIP_HEADERS.test(clean)) {
        sections.push(current);
        current = { type: 'education', lines: [] };
        continue;
      }
      if (EXP_HEADERS.test(clean) && !SKIP_HEADERS.test(clean)) {
        sections.push(current);
        current = { type: 'experience', lines: [] };
        continue;
      }
      if (SKIP_HEADERS.test(clean) && (current.type === 'education' || current.type === 'experience')) {
        sections.push(current);
        current = { type: 'other', lines: [] };
        continue;
      }
    }
    current.lines.push(line);
  }
  sections.push(current);
  return sections.filter(s => s.lines.join('').trim().length > 0);
}

// ─── Education parser ────────────────────────────────────────────────────────
function parseEducationSection(lines: string[]): any[] {
  const text = lines.join('\n');
  const entries: any[] = [];

  // Strategy: chunk by blank lines or bullet boundaries
  const chunks = text.split(/\n{2,}|(?=\n[-•*▪])/).map(c => c.trim()).filter(Boolean);

  for (const chunk of chunks) {
    const doc = nlp(chunk) as any;

    // Extract organisations (universities/colleges)
    const orgs: string[] = doc.organizations?.().out('array') ?? [];
    const places: string[] = doc.places?.().out('array') ?? [];

    // Try to find a degree keyword
    const degreeMatch = chunk.match(
      /\b(bachelor|master|b\.?sc|m\.?sc|b\.?e|m\.?e|b\.?tech|m\.?tech|ph\.?d|doctorate|diploma|associate|mba|b\.?a|m\.?a|llb|bca|mca)\b[^,\n]*/i
    );
    const fieldMatch = chunk.match(/\b(?:in|of)\s+([A-Za-z\s&]+?)(?=,|\n|$)/i);

    // Date range: "2018 - 2022", "Jan 2019 – Present"
    const dateRange = chunk.match(
      /(\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)?\.?\s*\d{4})\s*[-–—to]+\s*(\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)?\.?\s*\d{4}|present|current)/i
    );

    const school = orgs[0] ?? places[0] ?? extractFirstMeaningfulLine(chunk);
    if (!school) continue;

    entries.push({
      school,
      degree:       degreeMatch ? degreeMatch[0].replace(/\s+/g, ' ').trim() : null,
      fieldOfStudy: fieldMatch   ? fieldMatch[1].trim()                        : null,
      startDate:    normaliseDate(dateRange?.[1]),
      endDate:      normaliseDate(dateRange?.[2]),
      description:  null,
    });
  }

  return entries;
}

// ─── Experience parser ───────────────────────────────────────────────────────
function parseExperienceSection(lines: string[]): any[] {
  const text = lines.join('\n');
  const entries: any[] = [];

  const chunks = text.split(/\n{2,}|(?=\n[-•*▪])/).map(c => c.trim()).filter(Boolean);

  for (const chunk of chunks) {
    const doc = nlp(chunk) as any;

    const orgs: string[] = doc.organizations?.().out('array') ?? [];

    // Position: title-like phrase on first line (before pipe/dash/at)
    const firstLine = chunk.split('\n')[0] ?? '';
    const positionMatch = firstLine.match(/^([^|\-–@\n]+?)(?:\s*[|\-–@]|$)/);
    const companyFromLine = firstLine.match(/[|\-–@]\s*([^|\-–@\n]+)/);

    const dateRange = chunk.match(
      /(\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)?\.?\s*\d{4})\s*[-–—to]+\s*(\b(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)?\.?\s*\d{4}|present|current)/i
    );

    const locationMatch = chunk.match(/\b([A-Z][a-z]+(?:\s[A-Z][a-z]+)?,\s*[A-Z]{2,})\b/);

    const company  = orgs[0] ?? companyFromLine?.[1]?.trim() ?? null;
    const position = positionMatch?.[1]?.trim() ?? null;

    if (!company && !position) continue;

    const endDateRaw = normaliseDate(dateRange?.[2]);
    const isCurrent  = endDateRaw === 'Present';

    // Collect bullet-point description lines
    const descLines = chunk
      .split('\n')
      .slice(1)
      .filter(l => /^\s*[-•*▪]/.test(l))
      .map(l => l.replace(/^\s*[-•*▪]\s*/, '').trim());

    entries.push({
      company,
      position,
      location:    locationMatch?.[1] ?? null,
      startDate:   normaliseDate(dateRange?.[1]),
      endDate:     isCurrent ? null : endDateRaw,
      description: descLines.length ? descLines.join(' | ') : null,
      isCurrent,
    });
  }

  return entries;
}

// ─── Helper: first non-empty, non-symbol line ────────────────────────────────
function extractFirstMeaningfulLine(text: string): string | null {
  for (const l of text.split('\n')) {
    const c = l.replace(/[-•*▪|]/g, '').trim();
    if (c.length > 3) return c;
  }
  return null;
}

// ─── Main extraction entry-point (NLP + regex, zero external API) ─────────────
function extractWithNLP(text: string): { education: any[]; experience: any[] } {
  const sections = splitSections(text);

  const education: any[] = [];
  const experience: any[] = [];

  for (const sec of sections) {
    if (sec.type === 'education') {
      education.push(...parseEducationSection(sec.lines));
    } else if (sec.type === 'experience') {
      experience.push(...parseExperienceSection(sec.lines));
    }
  }

  return { education, experience };
}

// ────────────────────────────────────────────────────────────────────────────
export class AiService {
  private genAI: GoogleGenerativeAI;

  constructor(apiKey: string) {
    // apiKey may be empty — only used by enhanceContent now
    this.genAI = new GoogleGenerativeAI(apiKey || 'NO_KEY');
  }

  // ── Content enhancement still uses Gemini (user-triggered, not bulk) ──────
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
      const response = await result.response;
      const enhanced = response.text().trim();

      return { enhanced, original: context.currentValue };
    } catch (err: any) {
      throw new AppError(`AI Enhancement failed: ${err.message}`, 500);
    }
  }

  /**
   * Extracts education + experience from resume/README text.
   * Uses compromise (local NLP) + regex — NO external API, NO quota limits.
   */
  async extractPortfolioData(text: string): Promise<{ education: any[]; experience: any[] }> {
    try {
      // 1. Try section-aware NLP extraction
      const nlpResult = extractWithNLP(text);

      // 2. If NLP found data, return it
      if (nlpResult.education.length > 0 || nlpResult.experience.length > 0) {
        return nlpResult;
      }

      // 3. Last-resort: legacy regex (handles structured markdown resumes)
      return this.regexExtract(text);
    } catch (err: any) {
      throw new AppError(`Extraction failed: ${err.message}`, 500);
    }
  }

  /** Legacy heuristic regex — kept as final fallback */
  private regexExtract(content: string): { education: any[]; experience: any[] } {
    const education: any[] = [];
    const experience: any[] = [];

    const eduSection = content.match(/##?\s*Education[\s\S]*?(?=\n##?\s|$)/i)?.[0] || '';
    const eduEntries = eduSection.matchAll(
      /(?:\*{1,2}|-)?\s*(.+?)(?:\*{0,2})\s*[-–|]\s*(.+?)(?:\s*[-–|]\s*(\d{4}[^\n]*))?(?:\n|$)/g
    );
    for (const match of eduEntries) {
      education.push({
        school:       match[1]?.trim() ?? null,
        degree:       match[2]?.trim() ?? null,
        fieldOfStudy: null,
        startDate:    null,
        endDate:      match[3]?.trim() ?? null,
        description:  null,
      });
    }

    const expSection = content.match(/##?\s*(?:Experience|Work|Employment)[\s\S]*?(?=\n##?\s|$)/i)?.[0] || '';
    const expEntries = expSection.matchAll(
      /(?:\*{1,2}|-)?\s*(.+?)(?:\*{0,2})\s*[-–|@]\s*(.+?)(?:\s*[-–|]\s*(\d{4}[^\n]*))?(?:\n|$)/g
    );
    for (const match of expEntries) {
      const dateStr  = match[3]?.trim() ?? '';
      const isCurrent = /present|current/i.test(dateStr);
      experience.push({
        company:     match[2]?.trim() ?? null,
        position:    match[1]?.trim() ?? null,
        location:    null,
        startDate:   null,
        endDate:     isCurrent ? null : (dateStr || null),
        description: null,
        isCurrent,
      });
    }

    return { education, experience };
  }
}
