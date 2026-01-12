import { GoogleGenAI, Type } from "@google/genai";
import { ThumbnailSettings, GeneratedImage, AnalysisResult, YouTuberStyle } from "../types";

export interface TextTemplate {
  name: string;
  style: {
    fill: string;
    stroke: string;
    strokeWidth: number;
    fontFamily: string;
    shadow: {
      color: string;
      blur: number;
      offsetX: number;
      offsetY: number;
    };
  };
}

const getAiInstance = () => {
    // Prioritize user-provided key from sessionStorage, as requested by the user.
    // Fallback to environment variable if not present.
    const userApiKey = sessionStorage.getItem('user_provided_api_key');
    const apiKey = userApiKey || process.env.API_KEY;

    if (!apiKey) {
      // This error should ideally not be user-facing, as the UI should prevent calls without a key.
      // It serves as a safeguard.
      throw new Error("מפתח ה-API אינו זמין. אנא ספק מפתח כדי להמשיך.");
    }
    return new GoogleGenAI({ apiKey: apiKey });
};

export class GenerationService {
  private static async withRetry<T>(fn: () => Promise<T>, retries = 2, delay = 1500): Promise<T> {
    try {
      return await fn();
    } catch (error: any) {
      const errorMsg = error.message || "";
      const isQuotaError = errorMsg.includes("429") || errorMsg.includes("RESOURCE_EXHAUSTED");
      if (retries > 0 && isQuotaError) {
        await new Promise(resolve => setTimeout(resolve, delay));
        return this.withRetry(fn, retries - 1, delay * 2);
      }
      throw error;
    }
  }

  static async generateViralTitles(topic: string): Promise<string[]> {
    return this.withRetry(async () => {
      const ai = getAiInstance();
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Act as a Viral YouTube Strategist. Generate 5 viral titles in Hebrew for: "${topic}".
        Use:
        - Paradoxical Contrasts (e.g., 'Wealthy but Homeless').
        - Urgency and Mystery.
        - High Emotional Triggers.
        Return ONLY a JSON array of strings.`,
        config: { responseMimeType: "application/json" }
      });
      return JSON.parse(response.text || '[]');
    });
  }

  static async expandPrompt(prompt: string): Promise<string> {
    return this.withRetry(async () => {
      const ai = getAiInstance();
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `You are an expert AI Prompt Engineer for Image Generation. 
        Your task is to take a simple description and transform it into ONE high-detail, technical, and cinematic English prompt.
        
        INPUT: "${prompt}"
        
        STRICT RULES:
        - Return ONLY the final prompt text.
        - Do NOT provide choices, lists, or multiple versions.
        - Do NOT add explanations or introductory text.
        - Include technical keywords like: "8k resolution", "cinematic lighting", "photorealistic textures", "depth of field", "volumetric shadows".
        - Ensure the output is a single, cohesive paragraph.`,
      });
      const result = response.text?.trim() || prompt;
      // Clean potential quotes or labels the model might add
      return result.replace(/^"|"$/g, '').replace(/^Prompt: /i, '').trim();
    });
  }

  static async generateThumbnail(settings: ThumbnailSettings): Promise<GeneratedImage> {
    return this.withRetry(async () => {
      const ai = getAiInstance();
      const youTuberTrait = this.getYouTuberTrait(settings.youTuberStyle);
      const expressionTrait = this.getExpressionTrait(settings.expression);
      const styleDescription = this.getStylePrompt(settings.style);

      let parts: any[] = [];
      
      const identityPrompt = `
        MANDATORY VISUAL RULES:
        - Hyper-realistic skin textures (pores, imperfections).
        - Intense rim lighting to separate subject from background.
        - High-impact contrast and vibrant color grading.
        - No plastic-like AI smoothing.
        - Subject must have a clear "Pattern Interrupt" quality.
        - EXCLUSIONS (Do not include): ${settings.negativePrompt || 'None'}
      `;

      if (settings.userPhotos && settings.userPhotos.length > 0) {
        settings.userPhotos.forEach((photo) => {
          const base64Data = photo.split(',')[1];
          const mimeType = photo.split(';')[0].split(':')[1];
          parts.push({ inlineData: { data: base64Data, mimeType } });
        });
        parts.push({ text: identityPrompt });
      }

      const mainPrompt = `YouTube Viral Thumbnail Concept. SCENE: ${settings.prompt}. STYLE: ${styleDescription}. VIBE: ${youTuberTrait}. FACE: ${expressionTrait}. High CTR potential, no text on image.`;
      parts.push({ text: mainPrompt });

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: { parts },
        config: { imageConfig: { aspectRatio: settings.aspectRatio } }
      });

      const part = response.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData);
      if (!part) throw new Error("No image returned.");

      return { 
        id: Math.random().toString(36).substr(2, 9),
        url: `data:image/png;base64,${part.inlineData.data}`, 
        timestamp: Date.now()
      };
    });
  }
  
  static async autoDesignThumbnail(base64Image: string, prompt: string): Promise<any> {
    return this.withRetry(async () => {
      const ai = getAiInstance();
      const base64Data = base64Image.split(',')[1];
      const mimeType = base64Image.split(';')[0].split(':')[1];

      const designPrompt = `
        You are a world-class YouTube thumbnail designer.
        The user has provided a video topic in Hebrew: "${prompt}".
        1. Create a powerful clickbait headline in ENGLISH (max 4 words, ALL CAPS).
        2. analyze image for placement.
        Return ONLY JSON elements.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: { parts: [
          { inlineData: { data: base64Data, mimeType } },
          { text: designPrompt }
        ]},
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              elements: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    type: { type: Type.STRING },
                    content: { type: Type.STRING },
                    position: {
                      type: Type.OBJECT,
                      properties: {
                        x_percent: { type: Type.NUMBER },
                        y_percent: { type: Type.NUMBER }
                      },
                      required: ["x_percent", "y_percent"]
                    },
                    style: { type: Type.OBJECT, properties: { fontSize_percent_of_height: { type: Type.NUMBER }, fill: { type: Type.STRING } } }
                  },
                  required: ["type", "content", "position", "style"]
                }
              }
            },
            required: ["elements"]
          }
        }
      });
      return JSON.parse(response.text || '{}');
    });
  }

  static async analyzeThumbnail(image64: string, type: 'youtube' | 'canvas'): Promise<AnalysisResult> {
    return this.withRetry(async () => {
      const ai = getAiInstance();
      const base64Data = image64.split(',')[1];
      const mimeType = image64.split(';')[0].split(':')[1];

      let analysisPromptText = `Analyze this YouTube thumbnail for Virality (0-100). Hebrew reasoning. Technical English optimizedViralPrompt for a 98% score. For 'suggestedTextStyles', provide 4 templates with a name and a full style object (fill, stroke, shadow, etc.). Return JSON.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: { parts: [
          { inlineData: { data: base64Data, mimeType } },
          { text: analysisPromptText }
        ]},
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.NUMBER },
              rating: { type: Type.STRING },
              styleDetected: { type: Type.STRING },
              colorPalette: { type: Type.ARRAY, items: { type: Type.STRING } },
              elements: { type: Type.ARRAY, items: { type: Type.STRING } },
              suggestions: { type: Type.ARRAY, items: { type: Type.STRING } },
              reasoning: { type: Type.STRING },
              recreationPrompt: { type: Type.STRING },
              optimizedViralPrompt: { type: Type.STRING },
              suggestedTextStyles: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    style: {
                      type: Type.OBJECT,
                      properties: {
                        fill: { type: Type.STRING },
                        stroke: { type: Type.STRING },
                        strokeWidth: { type: Type.NUMBER },
                        fontFamily: { type: Type.STRING },
                        shadow: {
                          type: Type.OBJECT,
                          properties: {
                            color: { type: Type.STRING },
                            blur: { type: Type.NUMBER },
                            offsetX: { type: Type.NUMBER },
                            offsetY: { type: Type.NUMBER },
                          },
                        },
                      },
                    },
                  },
                },
              },
            },
            required: ["score", "rating", "styleDetected", "colorPalette", "elements", "suggestions", "reasoning", "recreationPrompt", "optimizedViralPrompt", "suggestedTextStyles"]
          }
        }
      });
      return JSON.parse(response.text || '{}');
    });
  }

  static async analyzeYouTubeThumbnail(url: string): Promise<AnalysisResult> {
    const videoId = this._getYoutubeVideoId(url);
    if (!videoId) {
      throw new Error("Invalid YouTube URL");
    }
  
    // Note: Fetching images cross-origin from the client-side can be blocked by CORS.
    // This implementation uses a CORS proxy as a workaround.
    // A robust production solution would involve a dedicated backend service to fetch the image.
    const thumbnailUrl = `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`;
    const proxyUrl = `https://corsproxy.io/?${encodeURIComponent(thumbnailUrl)}`;
  
    const response = await fetch(proxyUrl);
    if (!response.ok) {
      throw new Error("Failed to fetch YouTube thumbnail.");
    }
  
    const blob = await response.blob();
    const base64Data = await this._blobToBase64(blob);
    return await this.analyzeThumbnail(base64Data as string, 'youtube');
  }

  private static _getYoutubeVideoId(url: string): string | null {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  }
  
  private static _blobToBase64(blob: Blob): Promise<string | ArrayBuffer | null> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  static async suggestTextStyles(image64: string): Promise<TextTemplate[]> {
    return this.withRetry(async () => {
      const ai = getAiInstance();
      const base64Data = image64.split(',')[1];
      const mimeType = image64.split(';')[0].split(':')[1];
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: { parts: [
          { inlineData: { data: base64Data, mimeType } },
          { text: "Suggest 4 high-impact text templates for this thumbnail. Each template must include a 'name' (string) and a 'style' object containing: fill (string), stroke (string), strokeWidth (number), fontFamily (string), and a shadow object with color, blur, offsetX, and offsetY. Return ONLY JSON." }
        ]},
        config: { 
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                name: { type: Type.STRING },
                style: {
                  type: Type.OBJECT,
                  properties: {
                    fill: { type: Type.STRING },
                    stroke: { type: Type.STRING },
                    strokeWidth: { type: Type.NUMBER },
                    fontFamily: { type: Type.STRING },
                    shadow: {
                      type: Type.OBJECT,
                      properties: {
                        color: { type: Type.STRING },
                        blur: { type: Type.NUMBER },
                        offsetX: { type: Type.NUMBER },
                        offsetY: { type: Type.NUMBER },
                      },
                    },
                  },
                },
              },
            },
          },
        }
      });
      return JSON.parse(response.text || '[]');
    });
  }

  private static getYouTuberTrait(style: YouTuberStyle): string {
    switch(style) {
      case 'mrbeast': return "Extreme high-saturation, vibrant colors, epic scale background";
      case 'mkbhd': return "Minimalist, professional bokeh, sharp clean tech focus";
      default: return "Modern high-impact candidate photo, sharp focus";
    }
  }

  private static getExpressionTrait(expr: string): string {
    switch(expr) {
      case 'shocked': return "Extreme wide-mouthed shocked expression, popping eyes";
      case 'happy': return "Wide infectious joyful smile";
      case 'laughing': return "Loud laughing face, intense emotion";
      case 'angry': return "Fierce angry determined look";
      default: return "Natural engaging face";
    }
  }

  private static getStylePrompt(style: string): string {
    switch (style) {
      case 'cinematic': return "High-end cinematic photography, 35mm lens, golden hour rim lighting";
      case '3d-render': return "Professional Octane 3D render, sharp vibrant textures";
      default: return "Hyper-realistic studio portrait, sharp eye focus, professional lighting";
    }
  }
}