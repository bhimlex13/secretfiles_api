const Post = require('../models/Post');

// Get all posts for the feed
exports.getPosts = async (req, res) => {
    try {
        const posts = await Post.find()
            .populate('author', 'username')
            .populate('comments.user', 'username')
            .sort({ createdAt: -1 });
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get a single post by ID
exports.getPostById = async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate('author', 'username')
            .populate('comments.user', 'username');
            
        if (!post) {
            return res.status(404).json({ message: 'Entry not found' });
        }
        res.status(200).json(post);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Create a new post
exports.createPost = async (req, res) => {
    try {
        const { title, content, isAnonymous, tags } = req.body;
        
        const newPost = await Post.create({
            title,
            content,
            author: req.user._id,
            isAnonymous: isAnonymous !== undefined ? isAnonymous : true,
            tags: tags || []
        });

        res.status(201).json(newPost);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Toggle a reaction (Add or Remove)
exports.toggleReaction = async (req, res) => {
    try {
        const { reactionType } = req.body; 
        const postId = req.params.id;
        const userId = req.user._id;

        const validReactions = ['support', 'relate', 'happy', 'sad', 'angry', 'insightful'];
        if (!validReactions.includes(reactionType)) {
            return res.status(400).json({ message: 'Invalid reaction type' });
        }

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const reactionArray = post.reactions[reactionType];
        const hasReacted = reactionArray.includes(userId);

        if (hasReacted) {
            // Remove the reaction if they click it again
            post.reactions[reactionType] = reactionArray.filter(id => id.toString() !== userId.toString());
        } else {
            // Add the reaction
            post.reactions[reactionType].push(userId);
        }

        await post.save();
        res.status(200).json(post.reactions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Add a comment
exports.addComment = async (req, res) => {
    try {
        const { text } = req.body;
        const postId = req.params.id;

        if (!text) {
            return res.status(400).json({ message: 'Comment text is required' });
        }

        const post = await Post.findById(postId);
        if (!post) {
            return res.status(404).json({ message: 'Post not found' });
        }

        const newComment = {
            user: req.user._id,
            text
        };

        post.comments.push(newComment);
        await post.save();

        // We populate the user so the frontend knows the username of the commenter immediately
        await post.populate('comments.user', 'username');

        res.status(201).json(post.comments);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};