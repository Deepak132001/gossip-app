// New modifications
import { Avatar, Divider, Flex, Text, IconButton } from "@chakra-ui/react";
import { DeleteIcon } from "@chakra-ui/icons";
import { useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import useShowToast from "../hooks/useShowToast";


const Comment = ({ reply, lastReply, postId, onReplyDeleted }) => {
  const currentUser = useRecoilValue(userAtom);
  const showToast = useShowToast();

  const handleDeleteReply = async () => {
    if (!window.confirm("Sei sicuro di voler eliminare questa risposta?")) return;

    try {
      const response = await fetch(`/api/posts/${postId}/replies/${reply._id}`, {
        method: "DELETE",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error("Failed to delete reply");
      }

      showToast("Success", "Risposta eliminata", "success");
      if (onReplyDeleted) {
        onReplyDeleted(reply._id);
      }
    } catch (error) {
      showToast("Error", error.message, "error");
    }
  };

  return (
    <>
      <Flex gap={4} py={2} my={2} w={"full"}>
        <Avatar src={reply.userProfilePic} size={"sm"} />
        <Flex gap={1} w={"full"} flexDirection={"column"}>
          <Flex w={"full"} justifyContent={"space-between"} alignItems={"center"}>
            <Text fontSize='sm' fontWeight='bold'>
              {reply.username}
            </Text>
            {currentUser._id === reply.userId && (
              <IconButton
                size="sm"
                icon={<DeleteIcon />}
                aria-label="Delete Reply"
                onClick={handleDeleteReply}
                variant="ghost"
                // colorScheme="red"
              />
            )}
          </Flex>
          <Text>{reply.text}</Text>
        </Flex>
      </Flex>
      {!lastReply ? <Divider /> : null}
    </>
  );
};

export default Comment;


// Old code
// import { Avatar, Divider, Flex, Text } from "@chakra-ui/react";

// const Comment = ({ reply, lastReply }) => {
// 	return (
// 		<>
// 			<Flex gap={4} py={2} my={2} w={"full"}>
// 				<Avatar src={reply.userProfilePic} size={"sm"} />
// 				<Flex gap={1} w={"full"} flexDirection={"column"}>
// 					<Flex w={"full"} justifyContent={"space-between"} alignItems={"center"}>
// 						<Text fontSize='sm' fontWeight='bold'>
// 							{reply.username}
// 						</Text>
// 					</Flex>
// 					<Text>{reply.text}</Text>
// 				</Flex>
// 			</Flex>
// 			{!lastReply ? <Divider /> : null}
// 		</>
// 	);
// };

// export default Comment;
