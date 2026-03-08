export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ reply: 'Método inválido' });
  }

  try {
    const { message } = req.body || {};

    if (!message || !message.trim()) {
      return res.status(400).json({ reply: 'Escribe una consulta' });
    }

    const GEMINI_KEY = process.env.GEMINI_KEY;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Eres un asistente contable experto en Paraguay. Responde solo temas de DNIT, IVA, IRP, IRE, RUC y contabilidad paraguaya.

Pregunta: ${message}`
                }
              ]
            }
          ],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 400
          }
        })
      }
    );

    const data = await response.json();

    if (!response.ok) {
      const errMsg = data?.error?.message || 'Error de Gemini';
      return res.status(500).json({ reply: `Error Gemini: ${errMsg}` });
    }

    const reply = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!reply) {
      return res.status(500).json({
        reply: `Sin texto de respuesta. Respuesta Gemini: ${JSON.stringify(data)}`
      });
    }

    return res.status(200).json({ reply });
  } catch (error) {
    return res.status(500).json({
      reply: `Error del servidor: ${error.message}`
    });
  }
}
