import dbConnect from '../server/db/db.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../server/models/User.js';

function generateToken(id) {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
}

export default async function handler(req, res) {
  await dbConnect();
  const { method, body, query } = req;

  // POST /api/users (register)
  if (method === 'POST' && !query.login) {
    try {
      const { name, email, password } = body;
      if (!name || !email || !password) {
        return res.status(400).json({ message: 'Please add all fields' });
      }
      const userExists = await User.findOne({ email });
      if (userExists) {
        return res.status(400).json({ message: 'User already exists' });
      }
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      const user = await User.create({ name, email, password: hashedPassword });
      if (user) {
        return res.status(200).json({
          _id: user._id,
          name: user.name,
          email: user.email,
          token: generateToken(user._id)
        });
      } else {
        return res.status(400).json({ message: 'Invalid User Data' });
      }
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  // POST /api/users?login=true (login)
  if (method === 'POST' && query.login) {
    try {
      const { email, password } = body;
      const user = await User.findOne({ email });
      if (user && (await bcrypt.compare(password, user.password))) {
        return res.status(200).json({
          _id: user._id,
          name: user.name,
          email: user.email,
          isAdmin: user.isAdmin,
          token: generateToken(user._id)
        });
      } else {
        return res.status(400).json({ message: 'Invalid User Credentials' });
      }
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  // GET /api/users?userId=... (get user)
  if (method === 'GET' && query.userId) {
    try {
      const user = await User.findOne({ _id: query.userId });
      if (!user) return res.status(404).json({ message: 'User not found' });
      const { _id, name, email, isAdmin } = user;
      return res.status(200).json({ _id, name, email, isAdmin });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  // GET /api/users?all=true (get all users, admin only, skip auth for now)
  if (method === 'GET' && query.all) {
    try {
      const users = await User.find().select('-password');
      return res.status(200).json(users);
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  // DELETE /api/users?id=... (admin only, skip auth for now)
  if (method === 'DELETE' && query.id) {
    try {
      const user = await User.findById(query.id);
      if (!user) return res.status(404).json({ message: 'User not found' });
      await User.deleteOne({ _id: query.id });
      return res.status(200).json({ message: 'User removed' });
    } catch (error) {
      return res.status(500).json({ message: error.message });
    }
  }

  // Method not allowed
  res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
  res.status(405).end(`Method ${method} Not Allowed`);
} 