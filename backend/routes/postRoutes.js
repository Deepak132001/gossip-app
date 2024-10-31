import express from "express";
import {
	createPost,
	deletePost,
	getPost,
	likeUnlikePost,
	replyToPost,
	getFeedPosts,
	getUserPosts,
	getOtherPosts,
	followPost,
	unfollowPost,
	getFollowedPosts,
	deleteReply,
	sharePost,
} from "../controllers/postController.js";
import protectRoute from "../middlewares/protectRoute.js";

const router = express.Router();

// old functions
router.get("/feed", protectRoute, getFeedPosts);
router.get("/other-feeds", protectRoute, getOtherPosts);
router.get("/:id", getPost);
router.get("/user/:username", getUserPosts);
router.post("/create", protectRoute, createPost);
router.delete("/:id", protectRoute, deletePost);
router.put("/like/:id", protectRoute, likeUnlikePost);
router.put("/reply/:id", protectRoute, replyToPost);

// New functions

router.post("/:postId/follow", protectRoute, followPost);
router.post("/:postId/unfollow", protectRoute, unfollowPost);
router.post("/followed-posts", protectRoute, getFollowedPosts);
router.delete("/:postId/replies/:replyId", protectRoute, deleteReply);
router.get("/share/:id", sharePost);


export default router;
