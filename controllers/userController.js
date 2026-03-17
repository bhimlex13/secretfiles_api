const User = require('../models/User');
const Post = require('../models/Post');

exports.getUserProfile = async (req, res) => {
    try {
        const username = req.params.username;
        
        const user = await User.findOne({ username })
            .select('-password -verificationToken -resetPasswordToken -resetPasswordExpire')
            .populate('followers', 'username')
            .populate('following', 'username');

        if (!user) {
            return res.status(404).json({ message: 'Author not found' });
        }

        const posts = await Post.find({ author: user._id, isAnonymous: false })
            .populate('author', 'username')
            .sort({ createdAt: -1 });

        res.status(200).json({ user, posts });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.toggleFollow = async (req, res) => {
    try {
        const targetUsername = req.params.username;
        const currentUserId = req.user._id;

        const targetUser = await User.findOne({ username: targetUsername });
        const currentUser = await User.findById(currentUserId);

        if (!targetUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (targetUser._id.toString() === currentUser._id.toString()) {
            return res.status(400).json({ message: 'You cannot follow yourself' });
        }

        const isFollowing = currentUser.following.includes(targetUser._id);

        if (isFollowing) {
            currentUser.following = currentUser.following.filter(id => id.toString() !== targetUser._id.toString());
            targetUser.followers = targetUser.followers.filter(id => id.toString() !== currentUser._id.toString());
        } else {
            currentUser.following.push(targetUser._id);
            targetUser.followers.push(currentUser._id);
        }

        await currentUser.save();
        await targetUser.save();

        res.status(200).json({ 
            message: isFollowing ? 'Unfollowed successfully' : 'Followed successfully',
            isFollowing: !isFollowing,
            followersCount: targetUser.followers.length
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.toggleBookmark = async (req, res) => {
    try {
        const postId = req.params.postId;
        const user = await User.findById(req.user._id);

        const isBookmarked = user.bookmarks.includes(postId);

        if (isBookmarked) {
            user.bookmarks = user.bookmarks.filter(id => id.toString() !== postId.toString());
        } else {
            user.bookmarks.push(postId);
        }

        await user.save();
        res.status(200).json({ bookmarks: user.bookmarks });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.getBookmarks = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).populate({
            path: 'bookmarks',
            populate: { path: 'author', select: 'username' }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user.bookmarks.reverse());
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get Logged-in User's Private Library (All posts)
exports.getMyPosts = async (req, res) => {
    try {
        const posts = await Post.find({ author: req.user._id })
            .populate('author', 'username')
            .sort({ createdAt: -1 });
        res.status(200).json(posts);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};