export default async function handler(req, res) {

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ reply: "Método inválido" });
  }

  try {

    let body = "";

    await new Promise((resolve) => {
      req.on("data", chunk => {
        body += chunk;
      });

      req.on("end", resolve);
    });

    const dataBody = JSON.parse(body);

    const message = dataBody.message;

    const GEMINI_KEY = process.env.GEMINI_KEY;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `Eres un asistente contable experto en Paraguay. Responde sobre DNIT, IVA, IRP, IRE y RUC.

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

    console.log(error);

    res.status(500).json({
      reply: "Error del servidor."
    });

  }
}
