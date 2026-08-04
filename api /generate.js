export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { userPrompt } = req.body || {};
  const API_KEY = process.env.GEMINI_API_KEY;

  if (!API_KEY) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is not set in Vercel Environment Variables.' });
  }

  if (!userPrompt) {
    return res.status(400).json({ error: 'User prompt is required.' });
  }

  try {
    const promptText = `You are the Path Forge AI Career Advisor. Provide clear, encouraging, actionable career advice. Format your output with HTML tags (like <strong>, <ul>, <li>, <p>).\n\nUser Question: ${userPrompt}`;

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
      return res.status(response.status).json({ error: data.error?.message || 'Gemini API Error' });
    }

    const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated.';
    return res.status(200).json({ result: aiText });

  } catch (error) {
    return res.status(500).json({ error: error.message || 'Server error' });
  }
}
