import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { prisma } from '@/lib/prisma';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { imageBase64, patientId } = body;

        if (!imageBase64 || !patientId) {
            return NextResponse.json({ error: "Missing image or patient ID" }, { status: 400 });
        }

        // Strip the "data:image/jpeg;base64," prefix for the Gemini API
        const base64Data = imageBase64.split(',')[1];
        const mimeType = imageBase64.split(';')[0].split(':')[1];

        // Initialize the Gemini 1.5 Flash model (Fast & excellent at vision)
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `
      You are A.M.E.L.I.A., a highly advanced clinical AI assistant. 
      Analyze this medical lab report or prescription.
      
      Extract the data and respond ONLY with a valid JSON object in this exact format:
      {
        "summary": "A 2-3 sentence professional summary of the lab results.",
        "abnormalities": ["List any abnormal levels, e.g., 'High Cholesterol (240 mg/dL)'", "Low Iron"],
        "recommendation": "One suggested next step for the doctor."
      }
      If there are no abnormalities, return an empty array for "abnormalities".
      Do not include any markdown formatting like \`\`\`json. Return pure JSON.
    `;

        const imagePart = {
            inlineData: {
                data: base64Data,
                mimeType: mimeType
            }
        };

        // Call Gemini Vision
        const result = await model.generateContent([prompt, imagePart]);
        const responseText = result.response.text().trim();

        // Parse the JSON string returned by Gemini
        const analysis = JSON.parse(responseText.replace(/```json/g, '').replace(/```/g, ''));

        // --- SAVE TO PRISMA MEMORY ---
        // Automatically log any abnormal findings to the Patient's Medical Memory
        if (analysis.abnormalities && analysis.abnormalities.length > 0) {
            for (const anomaly of analysis.abnormalities) {
                await prisma.medicalMemory.create({
                    data: {
                        patientId: patientId,
                        observation: `Lab Anomaly: ${anomaly}`,
                        type: "VITALS"
                    }
                });
            }
        }

        // Format the response for the Amelia Chat interface
        const chatMessage = `**Lab Analysis Complete**\n\n${analysis.summary}\n\n**Abnormal Findings:**\n${analysis.abnormalities.length > 0 ? analysis.abnormalities.map((a: string) => `• ${a}`).join('\n') : "None detected."
            }\n\n**Recommendation:** ${analysis.recommendation}`;

        return NextResponse.json({ reply: chatMessage }, { status: 200 });

    } catch (error) {
        console.error("Gemini Vision Error:", error);
        return NextResponse.json({ error: "Failed to analyze lab report" }, { status: 500 });
    }
}