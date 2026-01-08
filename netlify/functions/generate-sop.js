import Groq from "groq-sdk";

export const handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: "Method Not Allowed" }),
    };
  }

  try {
    const body = JSON.parse(event.body);
    const userPrompt = body.prompt;

    if (!userPrompt) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Prompt is required" }),
      };
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
      console.error("GROQ_API_KEY is missing in environment variables.");
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Server configuration error (API Key missing)" }),
      };
    }

    // Initialize Groq
    const groq = new Groq({ apiKey });

    // Construct the prompt
    // Note: We use the 'system' role for the instruction and 'user' for the raw notes.
    const systemInstruction = `You are an expert Operations Manager. Convert the raw process description into a professional Standard Operating Procedure (SOP).
    
    Structure your response using ONLY the following HTML tags (no markdown, no \`\`\`html wrapper):
    - <h2>Objective</h2>
    - <ul>Prerequisites</ul>
    - <ol>Step-by-Step Instructions</ol>
    - <div class='warning'>Safety/Troubleshooting</div>
    
    Keep the tone professional, concise, and actionable.`;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: "system", content: systemInstruction },
        { role: "user", content: `Raw Description:\n${userPrompt}` }
      ],
      model: "llama3-70b-8192", // Using Llama 3 70B for high quality
      temperature: 0.5,
      max_tokens: 1024,
    });

    const text = chatCompletion.choices[0]?.message?.content || "No content generated.";

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
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