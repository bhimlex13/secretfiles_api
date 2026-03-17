const mongoose = require('mongoose');

// We define the comment structure first so we can embed it inside the post
const commentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    text: {
        type: String,
        required: true
    },
    // Allows users to favorite specific comments as requested
    favorites: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
}, { timestamps: true });

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    content: {
        type: String,
        required: true
    },
    author: {
        // We now link the post directly to the registered user's ID
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    isAnonymous: {
        type: Boolean,
        default: true
    },
    tags: [{
        type: String,
        trim: true
    }],
    // The new 6-reaction system. Storing User IDs prevents duplicate votes.
    reactions: {
        support: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        relate: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        happy: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        sad: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        angry: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
        insightful: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
    },
    comments: [commentSchema]
}, { timestamps: true });

module.exports = mongoose.model('Post', postSchema);