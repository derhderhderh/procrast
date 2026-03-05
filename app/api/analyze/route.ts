import { NextRequest, NextResponse } from "next/server"
import { genAI, ANALYSIS_MODEL } from "@/lib/gemini"
import { calculatePoints } from "@/lib/points"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      type,
      content,
      taskTitle,
      taskDescription,
      estimatedEffort,
      userId,
    } = body

    if (!content && type === "text") {
      return NextResponse.json({ error: "No content provided" }, { status: 400 })
    }

    const prompt = `You are an educational AI assistant that analyzes student homework submissions. Analyze the following submission and return a JSON response.

Task Title: ${taskTitle}
Task Description: ${taskDescription}
Estimated Effort Level: ${estimatedEffort}
Submission Type: ${type}

${type === "text" ? `Student's Submission Text:\n${content}` : `The student submitted an image of their work. The image URL is: ${content}\nPlease analyze based on the context of the task description.`}

Analyze the submission and return ONLY a valid JSON object (no markdown, no code fences) with these exact fields:
{
  "isAiGenerated": boolean (true if the work appears to be AI-generated, false if it appears human-written),
  "aiConfidence": number (0-100, how confident you are in your AI detection assessment),
  "effortScore": number (1-10, how much genuine effort the student put in based on the task difficulty and submission quality),
  "feedback": string (2-3 sentences of constructive feedback for the student about their work quality and effort)
}

Scoring guidelines:
- isAiGenerated: Look for patterns like overly polished language, generic structure, lack of personal voice, perfect grammar in contexts where minor errors would be expected.
- effortScore: Consider the estimated effort level. A "high" effort task should show more depth. Score based on completeness, quality, and genuine understanding demonstrated.
- For image submissions, be more lenient on AI detection since handwritten/photographed work is typically genuine.
- Be encouraging but honest in feedback.`

    let analysisText: string

    if (type === "image" && content.startsWith("http")) {
      // For image submissions, fetch the image and send as multimodal
      try {
        const imageResponse = await fetch(content)
        const imageBuffer = await imageResponse.arrayBuffer()
        const base64Image = Buffer.from(imageBuffer).toString("base64")
        const mimeType = imageResponse.headers.get("content-type") || "image/jpeg"

        const response = await genAI.models.generateContent({
          model: ANALYSIS_MODEL,
          contents: [
            {
              role: "user",
              parts: [
                { text: prompt },
                {
                  inlineData: {
                    mimeType,
                    data: base64Image,
                  },
                },
              ],
            },
          ],
        })
        analysisText = response.text || ""
      } catch {
        // If image fetch fails, analyze based on text context only
        const response = await genAI.models.generateContent({
          model: ANALYSIS_MODEL,
          contents: prompt,
        })
        analysisText = response.text || ""
      }
    } else {
      const response = await genAI.models.generateContent({
        model: ANALYSIS_MODEL,
        contents: prompt,
      })
      analysisText = response.text || ""
    }

    // Parse the JSON from Gemini response
    let analysis
    try {
      // Remove potential markdown code fences
      const cleaned = analysisText
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim()
      analysis = JSON.parse(cleaned)
    } catch {
      // Fallback analysis if parsing fails
      analysis = {
        isAiGenerated: false,
        aiConfidence: 50,
        effortScore: 5,
        feedback: "Analysis could not be completed. Default score assigned.",
      }
    }

    // Ensure valid types
    analysis.isAiGenerated = Boolean(analysis.isAiGenerated)
    analysis.aiConfidence = Math.min(100, Math.max(0, Number(analysis.aiConfidence) || 50))
    analysis.effortScore = Math.min(10, Math.max(1, Number(analysis.effortScore) || 5))
    analysis.feedback = String(analysis.feedback || "No feedback available.")

    // Reduce points if AI-generated
    let effectiveScore = analysis.effortScore
    if (analysis.isAiGenerated && analysis.aiConfidence > 70) {
      effectiveScore = Math.max(1, Math.floor(effectiveScore * 0.3))
    }

    // Calculate points (streak will be passed from client, default to 0 here)
    const pointsAwarded = calculatePoints(effectiveScore, estimatedEffort, 0)
    analysis.pointsAwarded = pointsAwarded

    return NextResponse.json({ analysis })
  } catch (error) {
    console.error("Analysis error:", error)
    return NextResponse.json(
      { error: "Failed to analyze submission" },
      { status: 500 }
    )
  }
}
