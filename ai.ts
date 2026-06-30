"use node";

import { v } from "convex/values";
import OpenAI from "openai";
import { action } from "./_generated/server";

const openai = new OpenAI({
  baseURL: "https://ai-gateway.hercules.app/v1",
  apiKey: process.env.HERCULES_API_KEY,
});

export const generateDescription = action({
  args: {
    productName: v.string(),
    category: v.string(),
    keywords: v.optional(v.string()),
  },
  handler: async (_, args): Promise<{ text: string }> => {
    try {
      const response = await openai.chat.completions.create({
        model: "anthropic/claude-sonnet-4-5-20250929",
        messages: [
          {
            role: "system",
            content: `Ești copywriter-ul pentru Metanoia, o băcănie-butic de pe DN 68, Totești, Țara Hațegului. Scrii descrieri de produse scurte, calde, naturale — ca și cum ai povesti unui prieten. Tonul este: artizanal, local, sincer, fără buzzwords corporate. Scrie DOAR în limba română. Maxim 2-3 propoziții.`,
          },
          {
            role: "user",
            content: `Generează o descriere pentru produsul "${args.productName}" din categoria "${args.category}".${args.keywords ? ` Cuvinte cheie: ${args.keywords}` : ""}`,
          },
        ],
      });

      return { text: response.choices[0]?.message?.content ?? "" };
    } catch (error) {
      if (error instanceof OpenAI.APIError) {
        throw new Error(`AI Error: ${error.message}`);
      }
      throw new Error("Nu s-a putut genera descrierea. Încearcă din nou.");
    }
  },
});

export const generateBlogPost = action({
  args: {
    topic: v.string(),
    style: v.optional(v.string()),
  },
  handler: async (_, args): Promise<{ title: string; excerpt: string; content: string }> => {
    try {
      const response = await openai.chat.completions.create({
        model: "anthropic/claude-sonnet-4-5-20250929",
        messages: [
          {
            role: "system",
            content: `Ești blog writer-ul pentru Metanoia, o băcănie-butic artizanală din Țara Hațegului. Scrii articole de blog calde, informative, cu arome locale. Tonul: prietenos, autentic, ca o conversație cu un vecin. Scrie DOAR în limba română. Returnează JSON cu: {"title": "...", "excerpt": "...(max 150 caractere)", "content": "...(HTML cu <h2>, <p>, <ul>, <li> — maxim 500 cuvinte)"}`,
          },
          {
            role: "user",
            content: `Scrie un articol de blog despre: "${args.topic}".${args.style ? ` Stil: ${args.style}` : ""}`,
          },
        ],
      });

      const raw = response.choices[0]?.message?.content ?? "";
      // Try to parse JSON from the response
      const jsonMatch = raw.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]) as { title: string; excerpt: string; content: string };
        return { title: parsed.title, excerpt: parsed.excerpt, content: parsed.content };
      }
      return { title: args.topic, excerpt: raw.slice(0, 150), content: `<p>${raw}</p>` };
    } catch (error) {
      if (error instanceof OpenAI.APIError) {
        throw new Error(`AI Error: ${error.message}`);
      }
      throw new Error("Nu s-a putut genera articolul. Încearcă din nou.");
    }
  },
});

export const generateReply = action({
  args: {
    context: v.string(),
    tone: v.optional(v.string()),
  },
  handler: async (_, args): Promise<{ text: string }> => {
    try {
      const response = await openai.chat.completions.create({
        model: "anthropic/claude-sonnet-4-5-20250929",
        messages: [
          {
            role: "system",
            content: `Ești asistentul Metanoia — o băcănie-butic din Țara Hațegului. Generezi răspunsuri scurte, prietenoase și profesionale pentru clienți. Tonul: ${args.tone ?? "cald, profesional, scurt"}. Scrie DOAR în limba română. Maxim 3-4 propoziții.`,
          },
          {
            role: "user",
            content: args.context,
          },
        ],
      });

      return { text: response.choices[0]?.message?.content ?? "" };
    } catch (error) {
      if (error instanceof OpenAI.APIError) {
        throw new Error(`AI Error: ${error.message}`);
      }
      throw new Error("Nu s-a putut genera răspunsul. Încearcă din nou.");
    }
  },
});
