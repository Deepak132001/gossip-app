import { Avatar } from "@chakra-ui/avatar";
import { Image } from "@chakra-ui/image";
import { Box, Flex, Text } from "@chakra-ui/layout";
import { Link, useNavigate } from "react-router-dom";
import Actions from "./Actions";
import { useEffect, useState } from "react";
import useShowToast from "../hooks/useShowToast";
import { formatDistanceToNow } from "date-fns";
import { DeleteIcon } from "@chakra-ui/icons";
import { useRecoilState, useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import postsAtom from "../atoms/postsAtom";
import { Button, useColorModeValue } from "@chakra-ui/react";
import { it } from "date-fns/locale";

const Post = ({ post, postedBy }) => {
  const [user, setUser] = useState(null);
  const showToast = useShowToast();

  //Prova per seguire i post
  const [isFollowing, setIsFollowing] = useState(false);
  // fine

  const currentUser = useRecoilValue(userAtom);
  const [posts, setPosts] = useRecoilState(postsAtom);
  const navigate = useNavigate();

  // useffect to get the follow and unfollow post
  useEffect(() => {
    if (post.followers.includes(currentUser._id)) {
      setIsFollowing(true);
    }
  }, [post, currentUser]);

  const handleFollowToggle = async () => {
    try {
      const action = isFollowing ? "unfollow" : "follow";
      const response = await fetch(`/api/posts/${post._id}/${action}`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Impossibile aggiornare lo stato di follow");
      }

      setIsFollowing(!isFollowing);
    } catch (error) {
      showToast("Error", error.message, "error");
    }
  };

  // fine useeffect
  useEffect(() => {
    const getUser = async () => {
      try {
        const res = await fetch("/api/users/profile/" + postedBy);
        const data = await res.json();
        if (data.error) {
          showToast("Error", data.error, "error");
          return;
        }
        setUser(data);
      } catch (error) {
        showToast("Error", error.message, "error");
        setUser(null);
      }
    };

    getUser();
  }, [postedBy, showToast]);

  const handleDeletePost = async (e) => {
    try {
      e.preventDefault();
      if (!window.confirm("Sei sicuro di voler eliminare questo gossip?"))
        return;

      const res = await fetch(`/api/posts/${post._id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.error) {
        showToast("Error", data.error, "error");
        return;
      }
      showToast("Success", "Gossip eliminato", "success");
      setPosts(posts.filter((p) => p._id !== post._id));
    } catch (error) {
      showToast("Error", error.message, "error");
    }
  };

  const switchColor = useColorModeValue("black", "white");

  if (!user) return null;
  return (
    <Box>
      <Link to={`/${user.username}/post/${post._id}`} style={{ flex: 1 }}>
        <Flex gap={3} mb={3} py={5}>
          <Flex flexDirection={"column"} alignItems={"center"}>
            <Avatar
              size="md"
              name={user.name}
              src={user?.profilePic}
              onClick={(e) => {
                e.preventDefault();
                navigate(`/${user.username}`);
              }}
            />
            <Box w="1px" h={"full"} bg={switchColor} my={2}></Box>
            {/* New BOX for dynamic */}
            <Box position={"relative"} w={"full"}>
              {post.replies.length === 0 && (
                <Text textAlign={"center"}>🥱</Text>
              )}
              {post.replies.slice(0, 3).map((reply, index) => (
                <Avatar
                  key={reply._id || index}
                  size="xs"
                  name={reply.userName}
                  src={reply.userProfilePic}
                  position={"absolute"}
                  top={index === 0 ? "0px" : "auto"}
                  bottom={index > 0 ? "0px" : "auto"}
                  left={index === 0 ? "15px" : index === 2 ? "4px" : "auto"}
                  right={index === 1 ? "-5px" : "auto"}
                  padding={"2px"}
                />
              ))}
            </Box>
            {/* Hanrdcorded  */}
            {/* <Box position={"relative"} w={"full"}>
              {post.replies.length === 0 && (
                <Text textAlign={"center"}>🥱</Text>
              )}
              {post.replies[0] && (
                <Avatar
                  size="xs"
                  name="John doe"
                  src={post.replies[0].userProfilePic}
                  position={"absolute"}
                  top={"0px"}
                  left="15px"
                  padding={"2px"}
                />
              )}

              {post.replies[1] && (
                <Avatar
                  size="xs"
                  name="John doe"
                  src={post.replies[1].userProfilePic}
                  position={"absolute"}
                  bottom={"0px"}
                  right="-5px"
                  padding={"2px"}
                />
              )}

              {post.replies[2] && (
                <Avatar
                  size="xs"
                  name="John doe"
                  src={post.replies[2].userProfilePic}
                  position={"absolute"}
                  bottom={"0px"}
                  left="4px"
                  padding={"2px"}
                />
              )}
            </Box> */}
          </Flex>
          <Flex flex={1} flexDirection={"column"} gap={2}>
            <Flex justifyContent={"space-between"} w={"full"}>
              <Flex w={"full"} alignItems={"center"}>
                <Text
                  fontSize={"sm"}
                  fontWeight={"bold"}
                  onClick={(e) => {
                    e.preventDefault();
                    navigate(`/${user.username}`);
                  }}
                >
                  {user?.username}
                </Text>
                {/* <Image src='/verified.png' w={4} h={4} ml={1} /> */}
              </Flex>
              <Flex gap={4} alignItems={"center"}>
                <Text fontSize={"xs"} width={36} textAlign={"right"}>
                  {formatDistanceToNow(new Date(post.createdAt), {
                    locale: it,
                  })}{" "}
                  fa
                </Text>

                {currentUser?._id === user._id && (
                  <DeleteIcon size={20} onClick={handleDeletePost} />
                )}
              </Flex>
            </Flex>

            <Flex justifyContent="space-between" alignItems="center" my={3}>
              <Text fontSize={"sm"}>{post.text}</Text>
              <Button
                onClick={(e) => {
                  e.preventDefault(); // Evita la navigazione
                  e.stopPropagation(); // Previene la propagazione dell'evento di clic verso il Link
                  handleFollowToggle();
                }}
                size="sm"
                maxWidth="150px"
                whiteSpace="nowrap"
                overflow="hidden"
                textOverflow="ellipsis"
                colorScheme={useColorModeValue("teal", "orange")}
              >
                {isFollowing ? "Trascura" : `Traccia`}
              </Button>
            </Flex>

            {/* <Text fontSize={"sm"}>{post.text}</Text> */}
            {post.img && (
              <Box
                borderRadius={6}
                overflow={"hidden"}
                border={"1px solid"}
                borderColor={"white"}
              >
                <Image
                  src={post.img}
                  w={"full"}
                  h={"250px"}
                  objectFit={"cover"}
                />
              </Box>
            )}

            <Flex gap={3} my={1}>
              <Actions post={post} />
            </Flex>
          </Flex>
        </Flex>
      </Link>
      {/* Button for follow and unfollow */}
      {/* <Button
        onClick={handleFollowToggle}
        mt={0}
        mb={3}
        size="sm"
        w={"30%"}
        variant="outline"
      >
        {isFollowing ? "Non Seguire" : `Segui Gossip`}
      </Button> */}
      {/* fine buttons */}
    </Box>
  );
};

export default Post;
