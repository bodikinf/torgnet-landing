// netlify/functions/generate.js

const { GoogleGenerativeAI } = require('@google/generative-ai');

// Функція-обробник, яку буде викликати Netlify
exports.handler = async function (event, context) {
  // Перевіряємо, що запит прийшов методом POST
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { topic } = JSON.parse(event.body);

    if (!topic) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Тема товару є обов\'язковою' }) };
    }

    // Ініціалізуємо модель ШІ, беручи ключ з налаштувань Netlify
    const genAI = new GoogleGenerativeAI(process.env.API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Ти — ШІ-помічник для українських підприємців-дропшиперів. Твоє завдання — згенерувати 3 креативні та практичні ідеї для контенту (Reels, TikTok, пости) для просування товару. Ідеї мають бути короткими, зрозумілими та орієнтованими на продаж. Відповідай українською мовою.
    
    Товар: "${topic}"
    
    Згенеруй 3 ідеї у форматі нумерованого списку. Кожну ідею починай з жирного заголовка (напр., **Відео-тест:**).`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Відправляємо успішну відповідь
    return {
      statusCode: 200,
      body: JSON.stringify({ ideas: text }),
    };
    
  } catch (error) {
    console.error('Помилка:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Виникла помилка на сервері при генерації ідей' }),
    };
  }
};