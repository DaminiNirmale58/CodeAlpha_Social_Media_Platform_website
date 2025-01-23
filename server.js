const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
app.use(bodyParser.json());
app.use(express.static('public'));
app.use(cors());

// Database connection
mongoose.connect('mongodb://localhost/social_media')
    .then(() => {
        console.log('Connected to MongoDB');
    })
    .catch(err => {
        console.error('Failed to connect to MongoDB:', err);
    });

const postSchema = new mongoose.Schema({
    content: String,
    likes: { type: Number, default: 0 },
    comments: { type: [String], default: [] },
});

const Post = mongoose.model('Post', postSchema);

// Middleware to ensure valid "likes" field
async function validatePostLikes(req, res, next) {
    try {
        const post = await Post.findById(req.params.id);
        if (post && typeof post.likes !== 'number') {
            await Post.findByIdAndUpdate(req.params.id, { likes: 0 });
            console.log(`Fixed non-numeric likes field for post ID ${req.params.id}`);
        }
        next();
    } catch (error) {
        console.error('Error validating post likes:', error);
        res.status(500).json({ message: 'Failed to validate post' });
    }
}

// Create a new post
app.post('/api/posts', async (req, res) => {
    console.log('POST request to /api/posts:', req.body);
    try {
        const post = new Post(req.body);
        const savedPost = await post.save();
        console.log('Post created:', savedPost);
        res.status(201).json(savedPost);
    } catch (error) {
        console.error('Error creating post:', error);
        res.status(500).json({ message: 'Failed to create post' });
    }
});

// Fetch all posts
app.get('/api/posts', async (req, res) => {
    console.log('GET request to /api/posts');
    try {
        const posts = await Post.find();
        console.log('Posts retrieved:');
        posts.forEach(post => {
            console.log(`Post ID: ${post._id}`);
            console.log(`Content: ${post.content}`);
            console.log(`Likes: ${post.likes || 0}`);
            const comments = post.comments || []; // Handle undefined comments
            console.log(`Comments: ${comments.length > 0 ? comments.join(', ') : 'No comments'}`);
            console.log('----------------------------');
        });
        res.json(posts);
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ message: 'Failed to fetch posts' });
    }
});



// Like a post
app.patch('/api/posts/:id/like', validatePostLikes, async (req, res) => {
    console.log(`PATCH request to /api/posts/${req.params.id}/like`);
    try {
        const post = await Post.findByIdAndUpdate(
            req.params.id,
            { $inc: { likes: 1 } },
            { new: true }
        );
        console.log('Post liked:', post);
        res.json(post);
    } catch (error) {
        console.error('Error liking post:', error);
        res.status(500).json({ message: 'Failed to like post' });
    }
});

// Add a comment to a post
app.post('/api/posts/:id/comment', async (req, res) => {
    console.log(`POST request to /api/posts/${req.params.id}/comment`, req.body);
    try {
        const post = await Post.findByIdAndUpdate(
            req.params.id,
            { $push: { comments: req.body.content } },
            { new: true }
        );
        console.log('Comment added:', post);
        res.json(post);
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ message: 'Failed to add comment' });
    }
});

// Root Route
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/public/index.html'); // Adjust the path if necessary
});

app.listen(3000, () => {
    console.log('Server is running on http://localhost:3000');
});
