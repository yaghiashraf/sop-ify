import { HfInference } from "@huggingface/inference";

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

    const apiKey = process.env.HF_API_TOKEN;
    if (!apiKey) {
      console.error("HF_API_TOKEN is missing in environment variables.");
      return {
        statusCode: 500,
        body: JSON.stringify({ error: "Server configuration error (API Key missing)" }),
      };
    }

    const hf = new HfInference(apiKey);

    const systemInstruction = `You are an expert Operations Manager. Convert the raw process description into a professional Standard Operating Procedure (SOP).
    
    Structure your response using ONLY the following HTML tags (no markdown, no 
    wrapper):
    - <h2>Objective</h2>
    - <ul>Prerequisites</ul>
    - <ol>Step-by-Step Instructions</ol>
    - <div class='warning'>Safety/Troubleshooting</div>
    
    Keep the tone professional, concise, and actionable.`;

    const response = await hf.chatCompletion({
      model: "mistralai/Mistral-7B-Instruct-v0.3",
      messages: [
        { role: "system", content: systemInstruction },
        { role: "user", content: `Raw Description:
${userPrompt}` }
      ],
      max_tokens: 1500,
      temperature: 0.5
    });

    const text = response.choices[0].message.content;

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
