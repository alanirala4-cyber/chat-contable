export default async function handler(req, res) {

  // Permitir CORS
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
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ reply: 'Escribe una consulta' });
    }

    const GEMINI_KEY = process.env.GEMINI_KEY;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Eres un asistente contable experto en Paraguay. Responde solo sobre DNIT, IVA, IRP, IRE, RUC y temas contables paraguayos.

Pregunta: ${message}`
                }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();

    const reply =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No pude generar respuesta.";

    res.status(200).json({ reply });

  } catch (error) {
    res.status(500).json({ reply: "Error del servidor." });
  }
}
