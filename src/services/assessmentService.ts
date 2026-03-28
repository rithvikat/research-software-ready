import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export interface AssessmentResult {
  score: number;
  checks: {
    id: string;
    label: string;
    passed: boolean;
    score: number;
    maxScore: number;
    rationale: string;
    impact: "high" | "medium" | "low";
  }[];
  summary: string;
  fixChecklist: {
    task: string;
    impact: string;
    priority: number;
  }[];
}

export async function assessRepository(repoData: {
  owner: string;
  repo: string;
  files: string[];
  readmeContent: string;
  hasLicense: boolean;
  hasCitation: boolean;
  hasCI: boolean;
  hasTests: boolean;
  tags: string[];
  language: string;
  type: string;
  hasFormatting: boolean;
}): Promise<AssessmentResult> {
  const prompt = `
    Assess the following GitHub repository for "research-software-readiness".
    
    Repository: ${repoData.owner}/${repoData.repo}
    Detected Language: ${repoData.language}
    Detected Project Type: ${repoData.type}
    Files: ${repoData.files.slice(0, 100).join(", ")}
    Has License: ${repoData.hasLicense}
    Has Citation (CITATION.cff): ${repoData.hasCitation}
    Has CI (GitHub Actions/GitLab CI): ${repoData.hasCI}
    Has Tests: ${repoData.hasTests}
    Has Formatting Config (Prettier/Black/etc): ${repoData.hasFormatting}
    Release Tags: ${repoData.tags.join(", ")}
    
    README Content (First 2000 chars):
    ${repoData.readmeContent.substring(0, 2000)}

    Evaluate based on these criteria. Adjust weights dynamically based on Project Type (${repoData.type}):
    
    1. README Quality (30 pts): Check for install/run instructions, and documentation clarity.
    2. License (15 pts): Must have a LICENSE file.
    3. Tests (20 pts): Check for test directories/files. (Higher priority for Libraries).
    4. CI Config (10 pts): Check for .github/workflows or .gitlab-ci.yml.
    5. Versioning & Citation (10 pts): Check for release tags and CITATION.cff.
    6. Code Quality & Formatting (15 pts): Check for formatting configs and documentation quality (docstrings, comments).

    For Data Science projects: Prioritize README documentation of data sources and environment setup.
    For Libraries: Prioritize Testing and Versioning.
    For Applications: Prioritize CI/CD and README run instructions.

    Generate a "Fix Checklist" for the repository owner. 
    - Only include items that failed or partially passed.
    - Each task should start with an icon: ❌ for critical failures (High impact), ⚠️ for warnings/partial passes (Medium/Low impact).
    - Priority should be: High (3), Medium (2), Low (1).

    Return a JSON object matching this schema:
    {
      "score": number,
      "checks": [
        {
          "id": string,
          "label": string,
          "passed": boolean,
          "score": number,
          "maxScore": number,
          "rationale": string,
          "impact": "high" | "medium" | "low"
        }
      ],
      "summary": string,
      "fixChecklist": [
        { "task": string, "impact": string, "priority": number }
      ]
    }
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER },
          summary: { type: Type.STRING },
          checks: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                label: { type: Type.STRING },
                passed: { type: Type.BOOLEAN },
                score: { type: Type.NUMBER },
                maxScore: { type: Type.NUMBER },
                rationale: { type: Type.STRING },
                impact: { type: Type.STRING },
              },
              required: ["id", "label", "passed", "score", "maxScore", "rationale", "impact"],
            },
          },
          fixChecklist: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                task: { type: Type.STRING },
                impact: { type: Type.STRING },
                priority: { type: Type.NUMBER },
              },
              required: ["task", "impact", "priority"],
            },
          },
        },
        required: ["score", "summary", "checks", "fixChecklist"],
      },
    },
  });

  return JSON.parse(response.text);
}
