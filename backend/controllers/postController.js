import Post from "../models/postModel.js";
import User from "../models/userModel.js";
import { v2 as cloudinary } from "cloudinary";
import mongoose from "mongoose";
// import { createHash } from "crypto";

// Import base url frmo sharing feature .env
// const generatePostLink = (postId) => {
// 	const uniqueHash = createHash('md5').update(postId.toString()).digest('hex');
// 	return `${process.env.BASE_URL}posts/share/${uniqueHash}`;
// };

const createPost = async (req, res) => {
	try {
		const { postedBy, text } = req.body;
		let { img } = req.body;

		if (!postedBy || !text) {
			return res.status(400).json({ error: "Postedby and text fields are required" });
		}

		const user = await User.findById(postedBy);
		if (!user) {
			return res.status(404).json({ error: "Utente non trovato" });
		}

		if (user._id.toString() !== req.user._id.toString()) {
			return res.status(401).json({ error: "Non autorizzato a creare Gossip" });
		}

		const maxLength = 500;
		if (text.length > maxLength) {
			return res.status(400).json({ error: `Il testo deve contenere meno di ${maxLength} caratteri` });
		}

		if (img) {
			const uploadedResponse = await cloudinary.uploader.upload(img);
			img = uploadedResponse.secure_url;
		}

		const newPost = new Post({ postedBy, text, img });
		await newPost.save();

		res.status(201).json(newPost);
	} catch (err) {
		res.status(500).json({ error: err.message });
		console.log(err);
	}
};

const getPost = async (req, res) => {
	try {
		const post = await Post.findById(req.params.id);

		if (!post) {
			return res.status(404).json({ error: "Gossip non trovato" });
		}

		res.status(200).json(post);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

const deletePost = async (req, res) => {
	try {
		const post = await Post.findById(req.params.id);
		if (!post) {
			return res.status(404).json({ error: "Gossip non trovato" });
		}

		if (post.postedBy.toString() !== req.user._id.toString()) {
			return res.status(401).json({ error: "Non autorizzato" });
		}

		if (post.img) {
			const imgId = post.img.split("/").pop().split(".")[0];
			await cloudinary.uploader.destroy(imgId);
		}

		await Post.findByIdAndDelete(req.params.id);

		res.status(200).json({ message: "Gossip rimosso" });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

const likeUnlikePost = async (req, res) => {
	try {
		const { id: postId } = req.params;
		const userId = req.user._id;

		const post = await Post.findById(postId);

		if (!post) {
			return res.status(404).json({ error: "Gossip non trovato" });
		}

		const userLikedPost = post.likes.includes(userId);

		if (userLikedPost) {
			// Unlike post
			await Post.updateOne({ _id: postId }, { $pull: { likes: userId } });
			res.status(200).json({ message: "Non mui piace" });
		} else {
			// Like post
			post.likes.push(userId);
			await post.save();
			res.status(200).json({ message: "Mi piace" });
		}
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

const replyToPost = async (req, res) => {
	try {
		const { text } = req.body;
		const postId = req.params.id;
		const userId = req.user._id;
		const userProfilePic = req.user.profilePic;
		const username = req.user.username;

		if (!text) {
			return res.status(400).json({ error: "Il testo è obbligatorio" });
		}

		const post = await Post.findById(postId);
		if (!post) {
			return res.status(404).json({ error: "Gossip non trovato" });
		}

		const reply = { userId, text, userProfilePic, username };

		post.replies.push(reply);
		await post.save();

		res.status(200).json(reply);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

const getFeedPosts = async (req, res) => {
	try {
		const userId = req.user._id;
		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({ error: "Utente non trovato" });
		}

		const following = user.following;

		const feedPosts = await Post.find({ postedBy: { $in: following } }).sort({ createdAt: -1 });

		res.status(200).json(feedPosts);
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};

const getUserPosts = async (req, res) => {
	const { username } = req.params;
	try {
		const user = await User.findOne({ username });
		if (!user) {
			return res.status(404).json({ error: "Utente non trovato" });
		}

		const posts = await Post.find({ postedBy: user._id }).sort({ createdAt: -1 });

		res.status(200).json(posts);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

// get all posts from any user
const getOtherPosts = async (req, res) => {
	try {
		if (!req.user || !req.user._id) {
			return res.status(401).json({ error: "Utente non autenticato" });
		}

		const userId = req.user._id;

		// Recupera i post di altri utenti (non quelli dell'utente corrente)
		const otherPosts = await Post.find({ postedBy: { $ne: userId } })
			.sort({ createdAt: -1 })
			.limit(20);

		res.status(200).json(otherPosts);
	} catch (err) {
		console.error(err);
		res.status(500).json({ error: "Errore nel recupero dei post" });
	}
};

  // Follow a post
const followPost = async (req, res) => {
	try {
	  const userId = req.user._id;
	  const { postId } = req.params;
  
	  const post = await Post.findById(postId);
	  if (!post) {
		return res.status(404).json({ error: "Gossip non trovato" });
	  }
  
	  if (post.followers.includes(userId)) {
		return res.status(400).json({ error: "Stai già seguendo questo Gossip" });
	  }
  
	  post.followers.push(userId);
	  await post.save();
  
	  res.status(200).json({ message: "Gossip seguito" });
	} catch (err) {
	  res.status(500).json({ error: err.message });
	}
  };
  
  // Unfollow a post
  const unfollowPost = async (req, res) => {
	try {
	  const userId = req.user._id;
	  const { postId } = req.params;
  
	  const post = await Post.findById(postId);
	  if (!post) {
		return res.status(404).json({ error: "Gossip non trovato" });
	  }
  
	  if (!post.followers.includes(userId)) {
		return res.status(400).json({ error: "Non stai seguendo questo Gossip" });
	  }
  
	  post.followers = post.followers.filter((followerId) => !followerId.equals(userId));
	  await post.save();
  
	  res.status(200).json({ message: "Gossip rimosso" });
	} catch (err) {
	  res.status(500).json({ error: err.message });
	}
  };
  
  // Get posts followed by the current user
  const getFollowedPosts = async (req, res) => {
	try {
	  const userId = req.user._id;
  
	  const followedPosts = await Post.find({ followers: userId }).sort({ createdAt: -1 });
  
	  res.status(200).json(followedPosts);
	} catch (err) {
	  res.status(500).json({ error: err.message });
	}
  };
  
  // Delete reply functions
  const deleteReply = async (req, res) => {
	try {
	  const { postId, replyId } = req.params;
  
	  if (!mongoose.Types.ObjectId.isValid(postId) || !mongoose.Types.ObjectId.isValid(replyId)) {
		return res.status(400).json({ error: "Non valido" });
	  }
  
	  // Find the post
	  const post = await Post.findById(postId);
	  if (!post) {
		return res.status(404).json({ error: "Gossip non trovato" });
	  }
  
	  // Find the reply index
	  const replyIndex = post.replies.findIndex((reply) => reply._id.toString() === replyId);
	  if (replyIndex === -1) {
		return res.status(404).json({ error: "Risposta non trovata" });
	  }
  
	  // Check if the user is authorized to delete the reply
	  if (post.replies[replyIndex].userId.toString() !== req.user._id.toString()) {
		return res.status(401).json({ error: "Non autorizzato" });
	  }
  
	  // Remove the reply from the array
	  post.replies.splice(replyIndex, 1);
	  await post.save();
  
	  res.status(200).json({ message: "Risposta rimossa" });
	} catch (err) {
	  console.error("Error deleting reply:", err);
	  res.status(500).json({ error: "Si è verificato un errore interno del server" });
	}
  };
  
  // Share post
  const sharePost = async (req, res) => {
	try {
		const postId = req.params.id;
		if (!mongoose.Types.ObjectId.isValid(postId)) {
			return res.status(400).json({ error: "Non valido" });
		}

		const post = await Post.findById(postId).populate('postedBy', 'username');
		if (!post) {
			return res.status(404).json({ error: "Gossip non trovato" });
		}

		// Generate link for sharing
		const shareLink = `${process.env.BASE_URL}${post.postedBy.username}/post/${post._id}`;

		// Provide options to share on different social apps
		const shareOptions = {
			facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareLink)}`,
			twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareLink)}&text=${encodeURIComponent(post.text)}`,
			whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(shareLink)}`,
			linkedin: `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(shareLink)}&title=${encodeURIComponent(post.text)}`
		};

		res.status(200).json({ shareLink, shareOptions });
	} catch (err) {
		res.status(500).json({ error: err.message });
	}
};
//   const sharePost = async (req, res) => {
// 	try {
// 		const postId = req.params.id;
// 		if (!mongoose.Types.ObjectId.isValid(postId)) {
// 			return res.status(400).json({ error: "Invalid post ID" });
// 		}

// 		const post = await Post.findById(postId).populate('postedBy', 'username');
// 		if (!post) {
// 			return res.status(404).json({ error: "Post not found" });
// 		}

// 		// Generate link for sharing
// 		const shareLink = `${process.env.BASE_URL}${post.postedBy.username}/post/${post._id}`;

// 		res.status(200).json({ shareLink });
// 	} catch (err) {
// 		res.status(500).json({ error: err.message });
// 	}
// };

export { createPost, getPost, deletePost, likeUnlikePost, replyToPost, getFeedPosts, getUserPosts, getOtherPosts, followPost, unfollowPost, getFollowedPosts, deleteReply, sharePost };
