
import { GoogleGenAI, Type, Modality, ThinkingLevel } from "@google/genai";

export interface ResearchResult {
  text: string;
  sources: { title: string; uri: string }[];
}

export class GeminiService {
  private static instance: GeminiService;

  private constructor() {}

  public static getInstance(): GeminiService {
    if (!GeminiService.instance) {
      GeminiService.instance = new GeminiService();
    }
    return GeminiService.instance;
  }

  async performDeepResearch(topic: string, instructions: string, context: string): Promise<ResearchResult> {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: `TOPIC: "${topic}"
        INSTRUCTIONS: "${instructions}"
        USER_CONTEXT: "${context.substring(0, 10000)}"
        
        Perform an industrial-grade analytical research report. 
        - Incorporate web search grounding for real-time accuracy.
        - Include figures, trends, and measurable outcomes.
        - Ensure data-backed reasoning.
        - Use professional Markdown headers.`,
        config: {
          tools: [{ googleSearch: {} }],
          thinkingConfig: { thinkingLevel: ThinkingLevel.HIGH }
        }
      });

      const text = response.text || "Research synthesis failed.";
      // Fix: Explicitly cast groundingChunks to any[] and map to the required source structure to resolve type mismatch errors.
      const groundingChunks = (response.candidates?.[0]?.groundingMetadata?.groundingChunks as any[]) || [];
      
      const sources: { title: string; uri: string }[] = groundingChunks
        .filter(chunk => chunk.web)
        .map(chunk => ({
          title: String(chunk.web?.title || "Search Reference"),
          uri: String(chunk.web?.uri || "")
        }))
        .filter(s => s.uri);

      // Deduplicate sources
      const uniqueSources = Array.from(new Map(sources.map(item => [item.uri, item])).values());

      return { text, sources: uniqueSources };
    } catch (error) {
      console.error("Deep research error:", error);
      return { text: "Critical failure in research matrix.", sources: [] };
    }
  }

  async generateAdCampaign(theme: string, category: string) {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Create a professional marketing campaign for a ${category} brand with the theme: "${theme}". Return a JSON object with headline, description, and an array of 2 short call-to-action strings (ctas).`,
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              headline: { type: Type.STRING },
              description: { type: Type.STRING },
              ctas: { type: Type.ARRAY, items: { type: Type.STRING } }
            },
            required: ["headline", "description", "ctas"]
          }
        }
      });
      return JSON.parse(response.text || "{}");
    } catch (error) {
      console.error("Ad campaign generation failed", error);
      return { headline: "Professional Brand Identity", description: "AI-Synthesized marketing asset.", ctas: ["Visit Now", "Contact Us"] };
    }
  }

  async refineText(text: string, style: string = 'formal') {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Refine the following text in a ${style} style: "${text}"`,
      });
      return response.text || text;
    } catch (error) {
      console.error("Text refinement failed", error);
      return text;
    }
  }

  async generateArtifact(sourceText: string, type: string) {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const promptMap: Record<string, { prompt: string, schema: any }> = {
        quiz: {
          prompt: "Create a multiple choice quiz based on the provided text.",
          schema: {
            type: Type.OBJECT,
            properties: {
              questions: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    question: { type: Type.STRING },
                    options: { type: Type.ARRAY, items: { type: Type.STRING } },
                    correctIndex: { type: Type.NUMBER }
                  },
                  required: ["question", "options", "correctIndex"]
                }
              }
            },
            required: ["questions"]
          }
        },
        flashcards: {
          prompt: "Generate study flashcards summarizing the key concepts.",
          schema: {
            type: Type.OBJECT,
            properties: {
              cards: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    front: { type: Type.STRING },
                    back: { type: Type.STRING }
                  },
                  required: ["front", "back"]
                }
              }
            },
            required: ["cards"]
          }
        },
        slides: {
          prompt: "Outline a professional slide deck presentation.",
          schema: {
            type: Type.OBJECT,
            properties: {
              slides: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    bullets: { type: Type.ARRAY, items: { type: Type.STRING } }
                  },
                  required: ["title", "bullets"]
                }
              }
            },
            required: ["slides"]
          }
        },
        mindmap: {
          prompt: "Structure a conceptual mind-map hierarchy.",
          schema: {
            type: Type.OBJECT,
            properties: {
              nodes: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    id: { type: Type.STRING },
                    label: { type: Type.STRING },
                    parentId: { type: Type.STRING }
                  },
                  required: ["id", "label"]
                }
              }
            },
            required: ["nodes"]
          }
        },
        datatable: {
          prompt: "Compare key data points in a structured table format.",
          schema: {
            type: Type.OBJECT,
            properties: {
              headers: { type: Type.ARRAY, items: { type: Type.STRING } },
              rows: { type: Type.ARRAY, items: { type: Type.ARRAY, items: { type: Type.STRING } } }
            },
            required: ["headers", "rows"]
          }
        },
        infographic: {
          prompt: "Summarize content for a visual infographic layout.",
          schema: {
            type: Type.OBJECT,
            properties: {
              sections: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    icon: { type: Type.STRING },
                    headline: { type: Type.STRING },
                    text: { type: Type.STRING }
                  },
                  required: ["icon", "headline", "text"]
                }
              }
            },
            required: ["sections"]
          }
        }
      };

      const entry = promptMap[type] || {
        prompt: "Summarize this content:",
        schema: { type: Type.OBJECT, properties: { summary: { type: Type.STRING } }, required: ["summary"] }
      };

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `${entry.prompt} Source: "${sourceText.substring(0, 8000)}"`,
        config: {
          responseMimeType: "application/json",
          responseSchema: entry.schema
        }
      });

      return JSON.parse(response.text || "{}");
    } catch (error) {
      console.error(`Artifact generation failed for ${type}`, error);
      return null;
    }
  }

  async askSource(sourceText: string, query: string) {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Context: "${sourceText.substring(0, 8000)}"\n\nQuestion: "${query}"\n\nProvide a detailed answer based strictly on the context.`,
      });
      return response.text || "I couldn't find an answer in your sources.";
    } catch (error) {
      console.error("Source chat failed", error);
      return "An error occurred while analyzing the sources.";
    }
  }

  async generateNotebookDeepDive(sourceText: string) {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const scriptResponse = await ai.models.generateContent({
        model: 'gemini-3.1-pro-preview',
        contents: `Create a podcast script between host Joe and guest Jane discussing this material: "${sourceText.substring(0, 4000)}". Make it insightful and conversational.`,
      });

      const script = scriptResponse.text || "Deep dive script generated.";
      const audioResponse = await ai.models.generateContent({
        model: "gemini-3.1-flash-tts-preview",
        contents: [{ parts: [{ text: `Deep Dive Session: ${script}` }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            multiSpeakerVoiceConfig: {
              speakerVoiceConfigs: [
                { speaker: 'Joe', voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
                { speaker: 'Jane', voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Puck' } } }
              ]
            }
          },
        },
      });

      const base64Audio = audioResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      return { script, audioUrl: base64Audio ? `data:audio/pcm;base64,${base64Audio}` : null };
    } catch (error) {
      console.error("Notebook deep dive failed", error);
      return null;
    }
  }

  async generateImage(prompt: string, aspectRatio: "1:1" | "16:9" | "9:16" = "1:1", qualityOrImage: boolean | string = false) {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const isHighQuality = typeof qualityOrImage === 'boolean' ? qualityOrImage : !!qualityOrImage;
      const imageData = typeof qualityOrImage === 'string' ? qualityOrImage : null;
      const model = isHighQuality ? 'gemini-3.1-flash-image-preview' : 'gemini-2.5-flash-image';
      
      const parts: any[] = [{ text: prompt }];
      if (imageData) {
        const matches = imageData.match(/^data:([^;]+);base64,(.+)$/);
        if (matches) parts.push({ inlineData: { mimeType: matches[1], data: matches[2] } });
      }

      const response = await ai.models.generateContent({
        model: model,
        contents: { parts },
        config: { imageConfig: { aspectRatio, imageSize: model === 'gemini-3.1-flash-image-preview' ? "1K" : undefined } }
      });

      const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
      return part ? `data:image/png;base64,${part.inlineData.data}` : null;
    } catch (error) {
      console.error("Image generation failed", error);
      return null;
    }
  }

  async editImage(base64Image: string, instruction: string) {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const matches = base64Image.match(/^data:([^;]+);base64,(.+)$/);
      if (!matches) return null;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            { inlineData: { mimeType: matches[1], data: matches[2] } },
            { text: instruction }
          ]
        }
      });

      const part = response.candidates?.[0]?.content?.parts.find(p => p.inlineData);
      return part ? `data:image/png;base64,${part.inlineData.data}` : null;
    } catch (error) {
      console.error("Image editing failed", error);
      return null;
    }
  }

  async generateSpeech(text: string, voice: string = 'Kore') {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const response = await ai.models.generateContent({
        model: "gemini-3.1-flash-tts-preview",
        contents: [{ parts: [{ text }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: voice } } },
        },
      });
      const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
      return base64Audio ? `data:audio/pcm;base64,${base64Audio}` : null;
    } catch (error) {
      return null;
    }
  }

  async generateVideo(prompt: string, aspectRatio: '16:9' | '9:16' = '16:9') {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-lite-generate-preview',
        prompt: prompt,
        config: {
          numberOfVideos: 1,
          resolution: '1080p',
          aspectRatio: aspectRatio
        }
      });

      while (!operation.done) {
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (!downloadLink) return null;

      const response = await fetch(`${downloadLink}&key=${process.env.GEMINI_API_KEY}`);
      const blob = await response.blob();
      return URL.createObjectURL(blob);
    } catch (error) {
      console.error("Video generation failed", error);
      return null;
    }
  }
}
