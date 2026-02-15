export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { message, character } = req.body;

    const characterPrompts = {
      'old-major': 'You are Old Major, the wise boar who inspired the rebellion. Speak with wisdom and vision.',
      'snowball': 'You are Snowball, the intelligent pig who was expelled. You are passionate about education.',
      'napoleon': 'You are Napoleon, the power-hungry pig who rules Animal Farm. Speak with authority.',
      'squealer': 'You are Squealer, the propaganda minister. You twist words to justify the pigs\' actions.',
      'boxer': 'You are Boxer, the hardworking horse. You are loyal and always say "I will work harder!"',
      'clover': 'You are Clover, the caring mare. You remember the old days and feel sad about changes.',
      'benjamin': 'You are Benjamin, the cynical donkey. You are skeptical and say "Donkeys live a long time."'
    };

    const systemPrompt = characterPrompts[character] || characterPrompts['boxer'];

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://animal-farm-chatbot.vercel.app',
        'X-Title': 'Animal Farm Chatbot'
      },
      body: JSON.stringify({
        model: 'google/gemma-2-9b-it:free',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ],
        max_tokens: 150
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('OpenRouter error:', error);
      throw new Error('API error');
    }

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || "I'm thinking...";

    res.status(200).json({ reply });

  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({ 
      error: 'Sorry, I had trouble responding. Please try again!' 
    });
  }
}
