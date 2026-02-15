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

    const response = await fetch(
      'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: `<s>[INST] ${systemPrompt}

Student: ${message}

Respond as ${character} in 2-3 sentences for Grade 8 students. [/INST]`,
          parameters: {
            max_new_tokens: 150,
            temperature: 0.7,
            return_full_text: false
          }
        }),
      }
    );

    const data = await response.json();
    const reply = Array.isArray(data) ? data[0].generated_text : data.generated_text;
    
    const cleanReply = reply
      .replace(/<s>|\[INST\]|\[\/INST\]/g, '')
      .replace(/Student:.*$/s, '')
      .trim();

    res.status(200).json({ reply: cleanReply });

  } catch (error) {
    res.status(500).json({ 
      error: 'Sorry, I had trouble responding. Please try again!' 
    });
  }
}
