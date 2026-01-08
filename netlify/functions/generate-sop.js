import { GoogleGenerativeAI } from "@google/generative-ai";

export const handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  try {
    // 1. Parse the request body
    const body = JSON.parse(event.body);
    const userPrompt = body.prompt;

    if (!userPrompt) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Prompt is required" }),
      };
    }

    // 2. Initialize Gemini API
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.error("GEMINI_API_KEY is missing in environment variables.");
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Server configuration error (API Key missing)" }),
      };
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // 3. Construct the prompt
    const systemInstruction = `You are an expert Operations Manager. Convert the following raw process description into a professional Standard Operating Procedure (SOP). Use HTML formatting. Structure it with these sections: <h2>Objective</h2>, <ul>Prerequisites</ul>, <ol>Step-by-Step Instructions</ol>, and <div class='warning'>Safety/Troubleshooting</div>. Keep the tone professional and actionable. Do not include markdown code blocks (like \`\`\`html), just return the raw HTML content suitable for embedding inside a div.`;
    
    const fullPrompt = `${systemInstruction}\n\nRaw Description:\n${userPrompt}`;

    // 4. Generate Content
    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const text = response.text();

    // 5. Return success
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ content: text }),
    };

  } catch (error) {
    console.error("Error generating SOP:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to generate SOP", details: error.message }),
    };
  }
};
