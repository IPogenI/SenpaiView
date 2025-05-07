import dbConnect from '../server/db/db.js';
import Chat from '../server/models/Chat.js';
import { Groq } from 'groq-sdk';

const client = new Groq({ apiKey: process.env.GROQ_API_KEY });
const GROQ_MODEL = 'llama-3.3-70b-versatile';

export default async function handler(req, res) {
  await dbConnect();
  const { method, body, query } = req;

  // POST /api/chat (createChatMessage)
  if (method === 'POST') {
    try {
      const { userId, message, context } = body;
      let chat = await Chat.findOne({ userId });
      if (!chat) {
        chat = new Chat({ userId, messages: [], context });
      }
      chat.messages.push({ role: 'user', content: message });
      const completion = await client.chat.completions.create({
        model: GROQ_MODEL,
        messages: [
          {
            role: 'system',
            content: `You are a helpful assistant for an anime website called SenpaiView. You provide information about anime shows, answer questions about anime, and help users navigate the website. Current page context: ${context}`
          },
          ...chat.messages.map(msg => ({ role: msg.role, content: msg.content }))
        ],
        temperature: 0.7,
        max_tokens: 1000
      });
      const assistantMessage = completion.choices[0].message.content;
      chat.messages.push({ role: 'assistant', content: assistantMessage });
      await chat.save();
      return res.status(200).json({ success: true, message: assistantMessage });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'I apologize, but I encountered an error. Please try again in a moment.' });
    }
  }

  // GET /api/chat?userId=... (getChatHistory)
  if (method === 'GET' && query.userId) {
    try {
      const chat = await Chat.findOne({ userId: query.userId });
      return res.status(200).json({ success: true, messages: chat ? chat.messages : [] });
    } catch (error) {
      return res.status(500).json({ success: false, message: 'Error fetching chat history' });
    }
  }

  // Method not allowed
  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${method} Not Allowed`);
} 