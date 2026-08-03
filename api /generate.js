export default async function handler(req, res) {
  // 1. Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userPrompt, roleTitle } = req.body;
  const API_KEY = process.env.GEMINI_API_KEY;

  if (!API_KEY) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is not configured on Vercel.' });
  }

  // 2. System prompt to guide Gemini's tone and output format
  const systemContext = `You are the Path Forge AI Career Advisor. 
Provide clear, actionable, high-impact career advice. 
Keep your response concise, bulleted, and structured with HTML tags (like <strong>, <ul>, <li>, <p>) so it renders cleanly in the UI.`;

  const promptText = roleTitle 
    ? `${systemContext}\n\nThe user wants advice for becoming a "${roleTitle}". Specifically: ${userPrompt}`
    : `${systemContext}\n\nUser Question: ${userPrompt}`;

  try {
    // 3. Call Google Gemini REST API
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }]
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Gemini API Error');
    }

    const aiText = data.candidates[0].content.parts[0].text;
    return res.status(200).json({ result: aiText });

  } catch (error) {
    return res.status(500).json({ error: error.message || 'Failed to fetch AI response' });
  }
}
