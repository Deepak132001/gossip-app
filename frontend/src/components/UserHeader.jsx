
import { Avatar } from "@chakra-ui/avatar";
import { Box, Flex, Link, Text, VStack } from "@chakra-ui/layout";
import { Menu, MenuButton, MenuItem, MenuList } from "@chakra-ui/menu";
import { Portal } from "@chakra-ui/portal";
import { Button, useToast, Spinner, useColorModeValue } from "@chakra-ui/react";
import { CgMoreO } from "react-icons/cg";
import { useRecoilState, useRecoilValue } from "recoil";
import userAtom from "../atoms/userAtom";
import { Link as RouterLink } from "react-router-dom";
import useFollowUnfollow from "../hooks/useFollowUnfollow";
import { useState, useEffect } from "react";
import Post from "../components/Post";
import postsAtom from "../atoms/postsAtom";

const UserHeader = ({ user }) => {
  const toast = useToast();
  const currentUser = useRecoilValue(userAtom); // logged in user
  const { handleFollowUnfollow, following, updating } = useFollowUnfollow(user);
  const [posts] = useRecoilState(postsAtom);

  const [selectedTab, setSelectedTab] = useState("iTuoiGossip");
  const [followedPosts, setFollowedPosts] = useState([]);
  const [loadingFollowedPosts, setLoadingFollowedPosts] = useState(false);

  const copyURL = () => {
    const currentURL = window.location.href;
    navigator.clipboard.writeText(currentURL).then(() => {
      toast({
        title: "Success.",
        status: "success",
        description: "Link del profilo copiato",
        duration: 3000,
        isClosable: true,
      });
    });
  };

  useEffect(() => {
    if (selectedTab === "gossipSeguiti") {
      setLoadingFollowedPosts(true);
      // Fetch followed posts from the API
      fetch(`/api/posts/followed-posts`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.error) {
            toast({
              title: "Error",
              description: data.error,
              status: "error",
              duration: 3000,
              isClosable: true,
            });
          } else {
            setFollowedPosts(data);
          }
        })
        .catch((error) => {
          toast({
            title: "Error",
            description: error.message,
            status: "error",
            duration: 3000,
            isClosable: true,
          });
        })
        .finally(() => {
          setLoadingFollowedPosts(false);
        });
    }
  }, [selectedTab, toast]);

  return (
    <VStack gap={4} alignItems={"start"}>
      <Flex justifyContent={"space-between"} w={"full"}>
        <Box>
          <Text fontSize={"2xl"} fontWeight={"bold"}>
            {user.name}
          </Text>
          <Flex gap={2} alignItems={"center"}>
            <Text fontSize={"sm"}>{user.username}</Text>
            <Text
              fontSize={"xs"}
              bg={"gray.dark"}
              color={"gray.light"}
              p={1}
              borderRadius={"full"}
            >
              gossip.com
            </Text>
          </Flex>
        </Box>
        <Box>
          {user.profilePic && (
            <Avatar
              name={user.name}
              src={user.profilePic}
              size={{
                base: "md",
                md: "xl",
              }}
            />
          )}
          {!user.profilePic && (
            <Avatar
              name={user.name}
              src="https://bit.ly/broken-link"
              size={{
                base: "md",
                md: "xl",
              }}
            />
          )}
        </Box>
      </Flex>

      <Text>{user.bio}</Text>

      {currentUser?._id === user._id && (
        <Link as={RouterLink} to="/update">
          <Button size={"sm"}>Aggiorna Profilo</Button>
        </Link>
      )}
      {currentUser?._id !== user._id && (
        <Button size={"sm"} onClick={handleFollowUnfollow} isLoading={updating}>
          {following ? "Non seguire" : "Segui"}
        </Button>
      )}
      <Flex w={"full"} justifyContent={"space-between"}>
        <Flex gap={2} alignItems={"center"}>
          <Text>{user.followers.length} Follower</Text>
        </Flex>
        <Flex>
          <Box className="icon-container">
            <Menu>
              <MenuButton>
                <CgMoreO size={24} cursor={"pointer"} />
              </MenuButton>
              <Portal>
                <MenuList bg={"gray.dark"}>
                  <MenuItem bg={"gray.dark"} onClick={copyURL}>
                    Copia profilo
                  </MenuItem>
                </MenuList>
              </Portal>
            </Menu>
          </Box>
        </Flex>
      </Flex>

      <Flex w={"full"}>

        <Flex
          flex={1}
          borderBottom={
            selectedTab === "iTuoiGossip"
              ? "1.5px solid white"
              : "1px solid gray"
          }
          justifyContent={"center"}
          pb="3"
          cursor={"pointer"}
          onClick={() => setSelectedTab("iTuoiGossip")}
          color={selectedTab === "iTuoiGossip" ? "white" : "gray.light"}
        >
          <Text fontWeight={"bold"} color={useColorModeValue("black", "white")}>
            Gossip
          </Text>
        </Flex>
        <Flex
          flex={1}
          borderBottom={
            selectedTab === "gossipSeguiti"
              ? "1.5px solid white"
              : "1px solid gray"
          }
          justifyContent={"center"}
          pb="3"
          cursor={"pointer"}
          onClick={() => setSelectedTab("gossipSeguiti")}
          color={selectedTab === "gossipSeguiti" ? "white" : "gray.light"}
        >
          <Text fontWeight={"bold"} color={useColorModeValue("black", "white")}>
            Gossip tracciati
          </Text>
        </Flex>
      </Flex>

      {/* Add content based on the selected tab */}
      {selectedTab === "iTuoiGossip" && (
        <Box w={"full"}>
          {posts.map((post) => (
            <Post key={post._id} post={post} postedBy={post.postedBy} />
          ))}
        </Box>
      )}
      {selectedTab === "gossipSeguiti" && (
        <Box w={"full"}>
          {loadingFollowedPosts ? (
            <Spinner />
          ) : followedPosts.length > 0 ? (
            followedPosts.map((post) => (
              <Post key={post._id} post={post} postedBy={post.postedBy} />
            ))
          ) : (
            <Text></Text>
          )}
        </Box>
      )}
    </VStack>
  );
};

export default UserHeader;

// import { Avatar } from "@chakra-ui/avatar";
// import { Box, Flex, Link, Text, VStack } from "@chakra-ui/layout";
// import { Menu, MenuButton, MenuItem, MenuList } from "@chakra-ui/menu";
// import { Portal } from "@chakra-ui/portal";
// import { Button, useToast } from "@chakra-ui/react";
// import { CgMoreO } from "react-icons/cg";
// import { useRecoilValue } from "recoil";
// import userAtom from "../atoms/userAtom";
// import { Link as RouterLink } from "react-router-dom";
// import useFollowUnfollow from "../hooks/useFollowUnfollow";

// const UserHeader = ({ user }) => {
// 	const toast = useToast();
// 	const currentUser = useRecoilValue(userAtom); // logged in user
// 	const { handleFollowUnfollow, following, updating } = useFollowUnfollow(user);

// 	const copyURL = () => {
// 		const currentURL = window.location.href;
// 		navigator.clipboard.writeText(currentURL).then(() => {
// 			toast({
// 				title: "Success.",
// 				status: "success",
// 				description: "Profile link copied.",
// 				duration: 3000,
// 				isClosable: true,
// 			});
// 		});
// 	};

// 	return (
// 		<VStack gap={4} alignItems={"start"}>
// 			<Flex justifyContent={"space-between"} w={"full"}>
// 				<Box>
// 					<Text fontSize={"2xl"} fontWeight={"bold"}>
// 						{user.name}
// 					</Text>
// 					<Flex gap={2} alignItems={"center"}>
// 						<Text fontSize={"sm"}>{user.username}</Text>
// 						<Text fontSize={"xs"} bg={"gray.dark"} color={"gray.light"} p={1} borderRadius={"full"}>
// 							gossip.com
// 						</Text>
// 					</Flex>
// 				</Box>
// 				<Box>
// 					{user.profilePic && (
// 						<Avatar
// 							name={user.name}
// 							src={user.profilePic}
// 							size={{
// 								base: "md",
// 								md: "xl",
// 							}}
// 						/>
// 					)}
// 					{!user.profilePic && (
// 						<Avatar
// 							name={user.name}
// 							src='https://bit.ly/broken-link'
// 							size={{
// 								base: "md",
// 								md: "xl",
// 							}}
// 						/>
// 					)}
// 				</Box>
// 			</Flex>

// 			<Text>{user.bio}</Text>

// 			{currentUser?._id === user._id && (
// 				<Link as={RouterLink} to='/update'>
// 					<Button size={"sm"}>Update Profile</Button>
// 				</Link>
// 			)}
// 			{currentUser?._id !== user._id && (
// 				<Button size={"sm"} onClick={handleFollowUnfollow} isLoading={updating}>
// 					{following ? "Unfollow" : "Follow"}
// 				</Button>
// 			)}
// 			<Flex w={"full"} justifyContent={"space-between"}>
// 				<Flex gap={2} alignItems={"center"}>
// 					<Text color={"gray.light"}>{user.followers.length} followers</Text>
// 					{/* <Box w='1' h='1' bg={"gray.light"} borderRadius={"full"}></Box> */}
// 				</Flex>
// 				<Flex>
// 					{/* <Box className='icon-container'>
// 						<BsInstagram size={24} cursor={"pointer"} />
// 					</Box> */}
// 					<Box className='icon-container'>
// 						<Menu>
// 							<MenuButton>
// 								<CgMoreO size={24} cursor={"pointer"} />
// 							</MenuButton>
// 							<Portal>
// 								<MenuList bg={"gray.dark"}>
// 									<MenuItem bg={"gray.dark"} onClick={copyURL}>
// 										Copia
// 									</MenuItem>
// 								</MenuList>
// 							</Portal>
// 						</Menu>
// 					</Box>
// 				</Flex>
// 			</Flex>

// 			<Flex w={"full"}>
// 				<Flex flex={1} borderBottom={"1.5px solid white"} justifyContent={"center"} pb='3' cursor={"pointer"}>
// 					<Text fontWeight={"bold"}> I tuoi Gossip</Text>
// 				</Flex>
// 				<Flex
// 					flex={1}
// 					borderBottom={"1px solid gray"}
// 					justifyContent={"center"}
// 					color={"gray.light"}
// 					pb='3'
// 					cursor={"pointer"}
// 				>
// 					<Text fontWeight={"bold"}>Gossip seguiti</Text>
// 				</Flex>
// 			</Flex>
// 		</VStack>
// 	);
// };

// export default UserHeader;
