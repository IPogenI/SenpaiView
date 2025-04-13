import { Groq } from 'groq-sdk';
import Chat from '../models/Chat.js';

// Initialize Groq client
const client = new Groq({
  apiKey: process.env.GROQ_API_KEY
});

// Latest Groq model
const GROQ_MODEL = 'llama-3.3-70b-versatile';

export const createChatMessage = async (req, res) => {
  try {
    const { userId, message, context } = req.body;

    let chat = await Chat.findOne({ userId });
    
    if (!chat) {
      chat = new Chat({
        userId,
        messages: [],
        context
      });
    }

    // Add user message
    chat.messages.push({
      role: 'user',
      content: message
    });

    // Get response from Groq
    const completion = await client.chat.completions.create({
      model: GROQ_MODEL,
      messages: [
        {
          role: "system",
          content: `You are a helpful assistant for an anime website called SenpaiView. You provide information about anime shows, answer questions about anime, and help users navigate the website. Current page context: ${context}`
        },
        ...chat.messages.map(msg => ({
          role: msg.role,
          content: msg.content
        }))
      ],
      temperature: 0.7,
      max_tokens: 1000
    });

    // Add assistant response
    const assistantMessage = completion.choices[0].message.content;
    chat.messages.push({
      role: 'assistant',
      content: assistantMessage
    });

    await chat.save();

    res.json({
      success: true,
      message: assistantMessage
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'I apologize, but I encountered an error. Please try again in a moment.'
    });
  }
};

export const getChatHistory = async (req, res) => {
  try {
    const { userId } = req.params;
    const chat = await Chat.findOne({ userId });
    
    res.json({
      success: true,
      messages: chat ? chat.messages : []
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching chat history'
    });
  }
};
