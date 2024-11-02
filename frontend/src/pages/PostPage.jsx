// PostPage.jsx (Updated)
import {
  Avatar,
  Box,
  Button,
  Divider,
  Flex,
  Image,
  Spinner,
  Text,
  useColorModeValue,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import Comment from "../components/Comment";
import useGetUserProfile from "../hooks/useGetUserProfile";
import useShowToast from "../hooks/useShowToast";
import { useNavigate, useParams } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { useRecoilState, useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import { DeleteIcon } from "@chakra-ui/icons";
import postsAtom from "../atoms/postsAtom";
import Actions2 from "../components/Actions2";
import { it } from "date-fns/locale";

const PostPage = () => {
  const { user, loading } = useGetUserProfile();
  const [posts, setPosts] = useRecoilState(postsAtom);
  const showToast = useShowToast();
  const { pid } = useParams();
  const currentUser = useRecoilValue(userAtom);
  const navigate = useNavigate();

  // State to manage follow/unfollow status
  const [isFollowing, setIsFollowing] = useState(false);

  const buttonColor = useColorModeValue("teal", "orange")

  // Get the current post
  const currentPost =
    posts.length > 0 ? posts.find((p) => p._id === pid) : null;

  // Fetch the post based on pid
  useEffect(() => {
    const getPost = async () => {
      try {
        const res = await fetch(`/api/posts/${pid}`);
        const data = await res.json();
        if (data.error) {
          showToast("Error", data.error, "error");
          return;
        }
        setPosts((prevPosts) => [
          ...prevPosts.filter((p) => p._id !== pid),
          data,
        ]);
      } catch (error) {
        showToast("Error", error.message, "error");
      }
    };
    getPost();
  }, [pid, setPosts, showToast]);

  // Set follow status once post and user data is available
  useEffect(() => {
    if (currentPost && currentPost.followers && currentUser) {
      if (currentPost.followers.includes(currentUser._id)) {
        setIsFollowing(true);
      }
    }
  }, [currentPost, currentUser]);

  // Handle follow/unfollow
  const handleFollowToggle = async () => {
    if (!currentPost) return;

    try {
      const action = isFollowing ? "unfollow" : "follow";
      const response = await fetch(`/api/posts/${currentPost._id}/${action}`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Impossibile aggiornare lo stato di seguire");
      }

      setIsFollowing(!isFollowing);
    } catch (error) {
      showToast("Error", error.message, "error");
    }
  };

  // Handle delete post
  const handleDeletePost = async () => {
    if (!currentPost) return;

    try {
      if (!window.confirm("Sei sicuro di voler eliminare questo gossip?"))
        return;

      const res = await fetch(`/api/posts/${currentPost._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.error) {
        showToast("Error", data.error, "error");
        return;
      }
      showToast("Success", "Gossip eliminato", "success");
      navigate(`/${user.username}`);
    } catch (error) {
      showToast("Error", error.message, "error");
    }
  };

  // Delete reply
  const handleReplyDeleted = (replyId) => {
    setPosts((prevPosts) =>
      prevPosts.map((p) =>
        p._id === currentPost._id
          ? {
              ...p,
              replies: p.replies.filter((reply) => reply._id !== replyId),
            }
          : p
      )
    );
  };

  // Render loading state
  if (!user && loading) {
    return (
      <Flex justifyContent={"center"}>
        <Spinner size={"xl"} />
      </Flex>
    );
  }

  // Render if post is not available
  if (!currentPost) return null;

  return (
    <Box mb={"80px"}>
      <Flex>
        <Flex w={"full"} alignItems={"center"} gap={3}>
          <Avatar src={user.profilePic} size={"md"} name={user.username} />
          <Flex>
            <Text fontSize={"sm"} fontWeight={"bold"}>
              {user.username}
            </Text>
          </Flex>
        </Flex>
        <Flex gap={4} alignItems={"center"}>
          <Text fontSize={"xs"} width={36} textAlign={"right"}>
            {formatDistanceToNow(new Date(currentPost.createdAt), {
              locale: it,
            })}{" "}
            fa
          </Text>

          {currentUser?._id === user._id && (
            <DeleteIcon
              size={20}
              cursor={"pointer"}
              onClick={handleDeletePost}
            />
          )}
        </Flex>
      </Flex>

      <Flex justifyContent="space-between" alignItems="center" my={3}>
        <Text my={3}>{currentPost.text}</Text>
        <Button
          onClick={handleFollowToggle}
          size="sm"
          width="100px"
          ml={4}
          p={3}
          colorScheme={buttonColor}
        >
          {isFollowing ? "Trascura" : `Traccia`}
          {/* Traccia è seguire, Trascura è non seguire */}
        </Button>
      </Flex>

      {/* <Text my={3}>{currentPost.text}</Text> */}

      {currentPost.img && (
        <Box
          borderRadius={6}
          overflow={"hidden"}
          border={"1px solid"}
          borderColor={"gray.light"}
        >
          <Image
            src={currentPost.img}
            w={"full"}
            h={"300px"}
            objectFit={"contain"}
          />
        </Box>
      )}
      {/* Button for follow and unfollow */}
      {/* <Button
        onClick={handleFollowToggle}
        size="sm"
        w={"full"}
        variant="outline"
        mt={"10px"}
        ml={"7px"}
      >
        {isFollowing ? "Non Seguire" : `Segui Gossip`}
      </Button> */}
      {/* End of follow button */}

      <Flex gap={3} my={3}>
        <Actions2 post={currentPost} />
      </Flex>

      <Divider my={4} />
      {currentPost.replies.map((reply, index) => (
        <Comment
          key={reply._id ? reply._id : index}
          reply={reply}
          lastReply={index === currentPost.replies.length - 1}
          postId={currentPost._id}
          onReplyDeleted={handleReplyDeleted}
        />
      ))}

      <Divider my={4} />

      <Flex justifyContent={"space-between"}>
        <Flex gap={2} alignItems={"center"}>
          <Text fontSize={"2xl"}>😉</Text>
          <Text color={"gray.400"}>
            &quot;Siete liberi di parlare di qualsiasi persona pubblica o
            privata, ma ricordate di non menzionare il nome di persone private
            che conoscete personalmente. Grazie! Sentitevi liberi di raccontare
            storie su amici o colleghi.&quot;
          </Text>
        </Flex>
      </Flex>
    </Box>
  );
};

export default PostPage;

// // PostPage.jsx (Updated)
// import {
//   Avatar,
//   Box,
//   Button,
//   Divider,
//   Flex,
//   Image,
//   Spinner,
//   Text,
// } from "@chakra-ui/react";
// import { useEffect, useState } from "react";
// import Comment from "../components/Comment";
// import useGetUserProfile from "../hooks/useGetUserProfile";
// import useShowToast from "../hooks/useShowToast";
// import { useNavigate, useParams } from "react-router-dom";
// import { formatDistanceToNow } from "date-fns";
// import { useRecoilState, useRecoilValue } from "recoil";
// import userAtom from "../atoms/userAtom";
// import { DeleteIcon } from "@chakra-ui/icons";
// import postsAtom from "../atoms/postsAtom";
// import Actions2 from "../components/Actions2";

// const PostPage = () => {
//   const { user, loading } = useGetUserProfile();
//   const [posts, setPosts] = useRecoilState(postsAtom);
//   const showToast = useShowToast();
//   const { pid } = useParams();
//   const currentUser = useRecoilValue(userAtom);
//   const navigate = useNavigate();

//   // State to manage follow/unfollow status
//   const [isFollowing, setIsFollowing] = useState(false);

//   // Get the current post
//   const currentPost = posts.length > 0 ? posts.find((p) => p._id === pid) : null;

//   // Fetch the post based on pid
//   useEffect(() => {
//     const getPost = async () => {
//       try {
//         const res = await fetch(`/api/posts/${pid}`);
//         const data = await res.json();
//         if (data.error) {
//           showToast("Error", data.error, "error");
//           return;
//         }
//         setPosts((prevPosts) => [...prevPosts.filter((p) => p._id !== pid), data]);
//       } catch (error) {
//         showToast("Error", error.message, "error");
//       }
//     };
//     getPost();
//   }, [pid, setPosts, showToast]);

//   // Set follow status once post and user data is available
//   useEffect(() => {
//     if (currentPost && currentPost.followers && currentUser) {
//       if (currentPost.followers.includes(currentUser._id)) {
//         setIsFollowing(true);
//       }
//     }
//   }, [currentPost, currentUser]);

//   // Handle follow/unfollow
//   const handleFollowToggle = async () => {
//     if (!currentPost) return;

//     try {
//       const action = isFollowing ? "unfollow" : "follow";
//       const response = await fetch(`/api/posts/${currentPost._id}/${action}`, {
//         method: "POST",
//         credentials: "include",
//         headers: {
//           "Content-Type": "application/json",
//         },
//       });

//       if (!response.ok) {
//         throw new Error("Failed to update follow status");
//       }

//       setIsFollowing(!isFollowing);
//     } catch (error) {
//       showToast("Error", error.message, "error");
//     }
//   };

//   // Handle delete post
//   const handleDeletePost = async () => {
//     if (!currentPost) return;

//     try {
//       if (!window.confirm("Are you sure you want to delete this post?")) return;

//       const res = await fetch(`/api/posts/${currentPost._id}`, {
//         method: "DELETE",
//       });
//       const data = await res.json();
//       if (data.error) {
//         showToast("Error", data.error, "error");
//         return;
//       }
//       showToast("Success", "Post deleted", "success");
//       navigate(`/${user.username}`);
//     } catch (error) {
//       showToast("Error", error.message, "error");
//     }
//   };

//   // Delete reply
//   const handleReplyDeleted = (replyId) => {
//     setPosts((prevPosts) =>
//       prevPosts.map((p) =>
//         p._id === currentPost._id
//           ? { ...p, replies: p.replies.filter((reply) => reply._id !== replyId) }
//           : p
//       )
//     );
//   };

//   // Render loading state
//   if (!user && loading) {
//     return (
//       <Flex justifyContent={"center"}>
//         <Spinner size={"xl"} />
//       </Flex>
//     );
//   }

//   // Render if post is not available
//   if (!currentPost) return null;

//   return (
//     <Box mb={"80px"}>
//       <Flex>
//         <Flex w={"full"} alignItems={"center"} gap={3}>
//           <Avatar src={user.profilePic} size={"md"} name={user.username} />
//           <Flex>
//             <Text fontSize={"sm"} fontWeight={"bold"}>
//               {user.username}
//             </Text>
//           </Flex>
//         </Flex>
//         <Flex gap={4} alignItems={"center"}>
//           <Text
//             fontSize={"xs"}
//             width={36}
//             textAlign={"right"}
//             color={"gray.light"}
//           >
//             {formatDistanceToNow(new Date(currentPost.createdAt))} ago
//           </Text>

//           {currentUser?._id === user._id && (
//             <DeleteIcon
//               size={20}
//               cursor={"pointer"}
//               onClick={handleDeletePost}
//             />
//           )}
//         </Flex>
//         {/* Button for follow and unfollow */}
//         <Button
//           onClick={handleFollowToggle}
//           size="sm"
//           w={"50%"}
//           color={"gray"}
//           variant="outline"
//         >
//           {isFollowing ? "Non Seguire" : `Segui Gossip`}
//         </Button>
//         {/* End of follow button */}
//       </Flex>

//       <Text my={3}>{currentPost.text}</Text>

//       {currentPost.img && (
//         <Box
//           borderRadius={6}
//           overflow={"hidden"}
//           border={"1px solid"}
//           borderColor={"gray.light"}
//         >
//           <Image src={currentPost.img} w={"full"} />
//         </Box>
//       )}

//       <Flex gap={3} my={3}>
//         <Actions2 post={currentPost} />
//       </Flex>

//       <Divider my={4} />

//       <Flex justifyContent={"space-between"}>
//         <Flex gap={2} alignItems={"center"}>
//           <Text fontSize={"2xl"}>😉</Text>
//           <Text color={"gray.light"}>
//             Potete parlare di qualsiasi persona pubblica o privata ma
//             assicuratevi di non menzionare il nome di nessuna persona privata che
//             conoscete, Grazie! Sentitevi liberi di chiacchierare dei tuoi
//             compagni o colleghi
//           </Text>
//         </Flex>
//       </Flex>

//       <Divider my={4} />
//       {currentPost.replies.map((reply, index) => (
//         <Comment
//           key={reply._id}
//           reply={reply}
//           lastReply={index === currentPost.replies.length - 1}
//           postId={currentPost._id}
//           onReplyDeleted={handleReplyDeleted}
//         />
//       ))}
//     </Box>
//   );
// };

// export default PostPage;

// import {
//   Avatar,
//   Box,
//   Button,
//   Divider,
//   Flex,
//   Image,
//   Spinner,
//   Text,
// } from "@chakra-ui/react";
// import { useEffect, useState } from "react";
// import Comment from "../components/Comment";
// import useGetUserProfile from "../hooks/useGetUserProfile";
// import useShowToast from "../hooks/useShowToast";
// import { useNavigate, useParams } from "react-router-dom";
// import { formatDistanceToNow } from "date-fns";
// import { useRecoilState, useRecoilValue } from "recoil";
// import userAtom from "../atoms/userAtom";
// import { DeleteIcon } from "@chakra-ui/icons";
// import postsAtom from "../atoms/postsAtom";
// import Actions2 from "../components/Actions2";

// const PostPage = ({ post }) => {
//   const { user, loading } = useGetUserProfile();
//   const [posts, setPosts] = useRecoilState(postsAtom);
//   const showToast = useShowToast();
//   const { pid } = useParams();
//   const currentUser = useRecoilValue(userAtom);

//   const navigate = useNavigate();
//   //Prova per seguire i post
//   const [isFollowing, setIsFollowing] = useState(false);
//   // fine

//   const currentPost = posts[0];

//   // useffect to get the follow and unfollow post

//   useEffect(() => {
//     if (post && post.followers && currentUser) {
//       if (post.followers.includes(currentUser._id)) {
//         setIsFollowing(true);
//       }
//     }
//   }, [post, currentUser]);

//   const handleFollowToggle = async () => {
//     try {
//       const action = isFollowing ? "unfollow" : "follow";
//       const response = await fetch(`/api/posts/${post._id}/${action}`, {
//         method: "POST",
//         credentials: "include",
//         headers: {
//           "Content-Type": "application/json",
//         },
//       });

//       if (!response.ok) {
//         throw new Error("Failed to update follow status");
//       }

//       setIsFollowing(!isFollowing);
//     } catch (error) {
//       showToast("Error", error.message, "error");
//     }
//   };

//   // fine useeffect

//   useEffect(() => {
//     const getPost = async () => {
//       setPosts([]);
//       try {
//         const res = await fetch(`/api/posts/${pid}`);
//         const data = await res.json();
//         if (data.error) {
//           showToast("Error", data.error, "error");
//           return;
//         }
//         setPosts([data]);
//       } catch (error) {
//         showToast("Error", error.message, "error");
//       }
//     };
//     getPost();
//   }, [showToast, pid, setPosts]);

//   const handleDeletePost = async () => {
//     try {
//       if (!window.confirm("Are you sure you want to delete this post?")) return;

//       const res = await fetch(`/api/posts/${currentPost._id}`, {
//         method: "DELETE",
//       });
//       const data = await res.json();
//       if (data.error) {
//         showToast("Error", data.error, "error");
//         return;
//       }
//       showToast("Success", "Post deleted", "success");
//       navigate(`/${user.username}`);
//     } catch (error) {
//       showToast("Error", error.message, "error");
//     }
//   };

//   if (!user && loading) {
//     return (
//       <Flex justifyContent={"center"}>
//         <Spinner size={"xl"} />
//       </Flex>
//     );
//   }

//   if (!currentPost) return null;
//   console.log("currentPost", currentPost);

//   return (
//     <Box
//       mb={"80px"}
//     >
//       <Flex>
//         <Flex w={"full"} alignItems={"center"} gap={3}>
//           <Avatar src={user.profilePic} size={"md"} name="Mark Zuckerberg" />
//           <Flex>
//             <Text fontSize={"sm"} fontWeight={"bold"}>
//               {user.username}
//             </Text>
//             {/* <Image src='/verified.png' w='4' h={4} ml={4} /> */}
//           </Flex>
//         </Flex>
//         <Flex gap={4} alignItems={"center"}>
//           <Text
//             fontSize={"xs"}
//             width={36}
//             textAlign={"right"}
//             color={"gray.light"}
//           >
//             {formatDistanceToNow(new Date(currentPost.createdAt))} ago
//           </Text>

//           {currentUser?._id === user._id && (
//             <DeleteIcon
//               size={20}
//               cursor={"pointer"}
//               onClick={handleDeletePost}
//             />
//           )}
//         </Flex>
// 		{/* Button for follow and unfollow */}
// 		<Button
//         onClick={handleFollowToggle}
//         size="sm"
//         w={"50%"}
//         color={"gray"}
//         variant="outline"
//       >
//         {isFollowing ? "Non Seguire" : `Segui Gossip`}
//       </Button>
//       {/* fine buttons */}
//       </Flex>

//       <Text my={3}>{currentPost.text}</Text>

//       {currentPost.img && (
//         <Box
//           borderRadius={6}
//           overflow={"hidden"}
//           border={"1px solid"}
//           borderColor={"gray.light"}
//         >
//           <Image src={currentPost.img} w={"full"} />
//         </Box>
//       )}

//       <Flex gap={3} my={3}>
//         {/* <Actions post={currentPost} /> */}
//         <Actions2 post={currentPost} />
//       </Flex>

//       <Divider my={4} />

//       <Flex justifyContent={"space-between"}>
//         <Flex gap={2} alignItems={"center"}>
//           <Text fontSize={"2xl"}>😉</Text>
//           <Text color={"gray.light"}>
//             Potete parlare di qualsiasi persona pubblica o privata ma
//             assicuratevi di non menzionare il nome di nessua persona privata che
//             conoscete, Grazie! sentitevi liberi di chiacchierare dei tuoi
//             compagni o colleghi
//           </Text>
//         </Flex>
//       </Flex>

//       <Divider my={4} />
//       {currentPost.replies.map((reply) => (
//         <Comment
//           key={reply._id}
//           reply={reply}
//           lastReply={
//             reply._id ===
//             currentPost.replies[currentPost.replies.length - 1]._id
//           }
//         />
//       ))}
//     </Box>
//   );
// };

// export default PostPage;
