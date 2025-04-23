import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Profile from '../models/Profile.js';
import Friendship from '../models/Friendship.js';
import Post from '../models/Post.js';

dotenv.config();

const testDatabase = async () => {
    try {
        // Connect to database
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB');

        // Test User creation
        const testUser = new User({
            name: 'Test User',
            email: 'test@example.com',
            password: 'test123'
        });
        await testUser.save();
        console.log('✅ Test user created:', testUser);

        // Test Profile creation
        const testProfile = new Profile({
            userId: testUser._id,
            bio: 'This is a test profile',
            socialLinks: {
                twitter: 'https://twitter.com/test',
                instagram: 'https://instagram.com/test'
            }
        });
        await testProfile.save();
        console.log('✅ Test profile created:', testProfile);

        // Test Friendship creation
        const testUser2 = new User({
            name: 'Test Friend',
            email: 'friend@example.com',
            password: 'test123'
        });
        await testUser2.save();

        const testFriendship = new Friendship({
            requester: testUser._id,
            recipient: testUser2._id,
            status: 'accepted'
        });
        await testFriendship.save();
        console.log('✅ Test friendship created:', testFriendship);

        // Test Post creation
        const testPost = new Post({
            author: testUser._id,
            content: 'This is a test post',
            visibility: 'public'
        });
        await testPost.save();
        console.log('✅ Test post created:', testPost);

        // Clean up test data
        await User.deleteMany({ email: { $in: ['test@example.com', 'friend@example.com'] } });
        await Profile.deleteMany({ userId: testUser._id });
        await Friendship.deleteMany({ $or: [{ requester: testUser._id }, { recipient: testUser._id }] });
        await Post.deleteMany({ author: testUser._id });
        console.log('✅ Test data cleaned up');

        // Close connection
        await mongoose.connection.close();
        console.log('✅ Database connection closed');

    } catch (error) {
        console.error('❌ Error during testing:', error);
        process.exit(1);
    }
};

testDatabase();