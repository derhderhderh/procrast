import { GoogleGenAI } from "@google/genai"

if (!process.env.GEMINI_API_KEY) {
  console.warn("GEMINI_API_KEY not set - AI analysis will not work")
}

export const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" })

export const ANALYSIS_MODEL = "gemini-2.0-flash"
