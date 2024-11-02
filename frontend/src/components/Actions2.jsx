import {
  Box,
  Button,
  Flex,
  FormControl,
  Input,
  Text,
  useDisclosure,
  useColorModeValue,
} from "@chakra-ui/react";

import { useState } from "react";
import { useRecoilState, useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import useShowToast from "../hooks/useShowToast";
import postsAtom from "../atoms/postsAtom";
import { FiSend } from "react-icons/fi";

// ACTIONS FOR ONLY POST PAGE WHERE THE REPLY BAR IS FIXED UNDER LIKE AND REPLY FEATURE
const Actions2 = ({ post }) => {
  const user = useRecoilValue(userAtom);

  const [isReplying, setIsReplying] = useState(false);
  const [reply, setReply] = useState("");
  const [posts, setPosts] = useRecoilState(postsAtom);
  const [liked, setLiked] = useState(post.likes.includes(user?._id));
  const [isLiking, setIsLiking] = useState(false);
  const [shareLink, setShareLink] = useState("");

  const showToast = useShowToast();
  const { onClose } = useDisclosure();

  const handleLikeAndUnlike = async () => {
    if (!user)
      return showToast(
        "Error",
        "Devi essere loggato per mettere mi piace a un gossip",
        "error"
      );
    if (isLiking) return;
    setIsLiking(true);
    try {
      const res = await fetch("/api/posts/like/" + post._id, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await res.json();
      if (data.error) return showToast("Error", data.error, "error");

      if (!liked) {
        // add the id of the current user to post.likes array
        const updatedPosts = posts.map((p) => {
          if (p._id === post._id) {
            return { ...p, likes: [...p.likes, user._id] };
          }
          return p;
        });
        setPosts(updatedPosts);
      } else {
        // remove the id of the current user from post.likes array
        const updatedPosts = posts.map((p) => {
          if (p._id === post._id) {
            return { ...p, likes: p.likes.filter((id) => id !== user._id) };
          }
          return p;
        });
        setPosts(updatedPosts);
      }

      setLiked(!liked);
    } catch (error) {
      showToast("Error", error.message, "error");
    } finally {
      setIsLiking(false);
    }
  };

  const handleReply = async () => {
    if (!user) {
      return showToast(
        "Error",
        "Devi essere loggato per rispondere ad un gossip",
        "error"
      );
    }
    if (isReplying) return;

    setIsReplying(true);
    try {
      const res = await fetch("/api/posts/reply/" + post._id, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ text: reply }),
      });

      const data = await res.json();
      if (data.error) {
        showToast("Error", data.error, "error");
        return;
      }

      // Update state with new reply optimistically
      const updatedReply = data.reply || data;
      if (updatedReply && updatedReply._id) {
        setPosts((prevPosts) =>
          prevPosts.map((p) =>
            p._id === post._id
              ? { ...p, replies: [...p.replies, updatedReply] }
              : p
          )
        );

        showToast("Success", "Risposta pubblicata", "success");
      }

      // Refetch post to ensure full sync
      await refetchPost(post._id);
      onClose();
      setReply("");
    } catch (error) {
      showToast("Error", error.message, "error");
    } finally {
      setIsReplying(false);
    }
  };

  // Function to refetch the post data
  const refetchPost = async (postId) => {
    try {
      const res = await fetch(`/api/posts/${postId}`);
      const updatedPost = await res.json();

      if (updatedPost.error) {
        showToast("Error", updatedPost.error, "error");
        return;
      }

      setPosts((prevPosts) =>
        prevPosts.map((p) => (p._id === postId ? updatedPost : p))
      );
    } catch (error) {
      showToast("Error", error.message, "error");
    }
  };

  // handle share link
  const handleShare = async () => {
    try {
      const res = await fetch(`/api/posts/share/${post._id}`);
      const data = await res.json();
      if (data.error) {
        return showToast("Error", data.error, "error");
      }
      setShareLink(data.shareLink);
      showToast("Success", "Link copiato!", "success");
      navigator.clipboard.writeText(data.shareLink);
    } catch (error) {
      showToast("Error", error.message, "error");
    }
  };

  // const handleReply = async () => {
  //   if (!user)
  //     return showToast(
  //       "Error",
  //       "You must be logged in to reply to a post",
  //       "error"
  //     );
  //   if (isReplying) return;
  //   setIsReplying(true);
  //   try {
  //     const res = await fetch("/api/posts/reply/" + post._id, {
  //       method: "PUT",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({ text: reply }),
  //     });
  //     const data = await res.json();
  //     if (data.error) return showToast("Error", data.error, "error");

  //     const updatedPosts = posts.map((p) => {
  //       if (p._id === post._id) {
  //         return { ...p, replies: [...p.replies, data] };
  //       }
  //       return p;
  //     });
  //     setPosts(updatedPosts);
  //     showToast("Success", "Reply posted successfully", "success");
  //     onClose();
  //     setReply("");
  //   } catch (error) {
  //     showToast("Error", error.message, "error");
  //   } finally {
  //     setIsReplying(false);
  //   }
  // };

  return (
    <Flex flexDirection="column">
      <Flex gap={3} my={2} onClick={(e) => e.preventDefault()}>
        <svg
          aria-label="Like"
          color={liked ? "rgb(237, 73, 86)" : ""}
          fill={liked ? "black" : "transparent"}
          height="19"
          role="img"
          viewBox="0 0 24 22"
          width="20"
          cursor={"pointer"}
          onClick={handleLikeAndUnlike}
          stroke={liked ? "none" : "currentColor"} // Aggiungi questa riga per gestire lo stroke
          strokeWidth="2"
        >
          <path d="M1 7.66c0 4.575 3.899 9.086 9.987 12.934.338.203.74.406 1.013.406.283 0 .686-.203 1.013-.406C19.1 16.746 23 12.234 23 7.66 23 3.736 20.245 1 16.672 1 14.603 1 12.98 1.94 12 3.352 11.042 1.952 9.408 1 7.328 1 3.766 1 1 3.736 1 7.66Z"></path>
        </svg>
        <ShareSVG onClick={handleShare} />
      </Flex>

      <Flex gap={2} alignItems={"center"}>
        <Text fontSize="sm">{post.likes.length} like</Text>
        <Box w={0.5} h={0.5} borderRadius={"full"} bg={"gray.light"}></Box>
        <Text fontSize="sm">{post.replies.length} {post.replies.length === 1 ? 'risposta' : 'risposte'}</Text>
      </Flex>

      {/* Commenta sotto il Post */}
      <Box
        position="fixed"
        bottom="0"
        left={"50%"}
        transform="translateX(-50%)"
        width="620px"
        maxWidth="100%"
        p={1}
        boxShadow="0 -2px 5px rgba(0,0,0,0.1)"
        color={useColorModeValue("black", "white")}
        bg={useColorModeValue("gray.100", "#4e148c")}
        zIndex="1000"
      >
        <FormControl display="flex" alignItems="center">
          <Input
            placeholder="La risposta va qui..."
            _placeholder={{ color: useColorModeValue("#6c757d", "#e5e5e5") }}
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            color={useColorModeValue("black", "white")}
            bg={useColorModeValue("white", "#4e148c")}
          />
          <Button
            colorScheme="blue"
            size={"sm"}
            ml={3}
            isLoading={isReplying}
            onClick={handleReply}
          >
            <FiSend size={25} />
          </Button>
        </FormControl>
      </Box>
    </Flex>
  );
};

export default Actions2;

const ShareSVG = ({ onClick }) => {
  return (
    <svg
      aria-label="Share"
      color=""
      fill="rgb(243, 245, 247)"
      height="20"
      role="img"
      viewBox="0 0 24 24"
      width="20"
      cursor="pointer"
      onClick={onClick}
    >
      <title>Share</title>
      <line
        fill="none"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="2"
        x1="22"
        x2="9.218"
        y1="3"
        y2="10.083"
      ></line>
      <polygon
        fill="none"
        points="11.698 20.334 22 3.001 2 3.001 9.218 10.084 11.698 20.334"
        stroke="currentColor"
        strokeLinejoin="round"
        strokeWidth="2"
      ></polygon>
    </svg>
  );
};
