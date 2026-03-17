const User = require('../models/User');
const Post = require('../models/Post');

// Get a user's profile and their public posts
exports.getUserProfile = async (req, res) => {
    try {
        const username = req.params.username;
        
        // Find the user and get their follower/following counts
        const user = await User.findOne({ username })
            .select('-password -verificationToken -resetPasswordToken -resetPasswordExpire')
            .populate('followers', 'username')
            .populate('following', 'username');

        if (!user) {
            return res.status(404).json({ message: 'Author not found' });
        }

        // Fetch only the posts where isAnonymous is false
        const posts = await Post.find({ author: user._id, isAnonymous: false })
            .populate('author', 'username')
            .sort({ createdAt: -1 });

        res.status(200).json({ user, posts });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Toggle Follow/Unfollow
exports.toggleFollow = async (req, res) => {
    try {
        const targetUsername = req.params.username;
        const currentUserId = req.user._id;

        const targetUser = await User.findOne({ username: targetUsername });
        const currentUser = await User.findById(currentUserId);

        if (!targetUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Prevent users from following themselves
        if (targetUser._id.toString() === currentUser._id.toString()) {
            return res.status(400).json({ message: 'You cannot follow yourself' });
        }

        const isFollowing = currentUser.following.includes(targetUser._id);

        if (isFollowing) {
            // Unfollow logic
            currentUser.following = currentUser.following.filter(id => id.toString() !== targetUser._id.toString());
            targetUser.followers = targetUser.followers.filter(id => id.toString() !== currentUser._id.toString());
        } else {
            // Follow logic
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

// Toggle Bookmark (Add or Remove a post from saved list)
exports.toggleBookmark = async (req, res) => {
    try {
        const postId = req.params.postId;
        const user = await User.findById(req.user._id);

        const isBookmarked = user.bookmarks.includes(postId);

        if (isBookmarked) {
            // Remove from bookmarks
            user.bookmarks = user.bookmarks.filter(id => id.toString() !== postId.toString());
        } else {
            // Add to bookmarks
            user.bookmarks.push(postId);
        }

        await user.save();
        res.status(200).json({ bookmarks: user.bookmarks });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Get Logged-in User's Bookmarks
exports.getBookmarks = async (req, res) => {
    try {
        // Find the user and populate the actual post data inside the bookmarks array
        const user = await User.findById(req.user._id).populate({
            path: 'bookmarks',
            populate: { path: 'author', select: 'username' }
        });

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Sort them so the most recently added bookmarks could appear first, 
        // but here we just return the populated array in order.
        res.status(200).json(user.bookmarks.reverse());
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};