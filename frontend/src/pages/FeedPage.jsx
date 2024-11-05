import { Box, Flex, Spinner, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import useShowToast from "../hooks/useShowToast";
import Post from "../components/Post";
import { useRecoilState } from "recoil";
import postsAtom from "../atoms/postsAtom";
import SuggestedUsers from "../components/SuggestedUsers";

const FeedPage = () => {
  const [posts, setPosts] = useRecoilState(postsAtom);
  const [loading, setLoading] = useState(true);
  const showToast = useShowToast();

  useEffect(() => {
    const getFeedPosts = async () => {
      try {
        setLoading(true);

        // Recupero dei post dal feed
        const res = await fetch("/api/posts/feed", {
          method: "GET",
          credentials: "include", // Invia i cookie per l'autenticazione
          headers: {
            "Content-Type": "application/json",
          },
        });
        const data = await res.json();

        if (data.error) {
          showToast("Error", data.error, "error");
          return;
        }

        // Imposto i post recuperati dallo stato
        setPosts(data);
      } catch (error) {
        showToast("Error", error.message, "error");
      } finally {
        setLoading(false);
      }
    };

    getFeedPosts();
  }, [showToast, setPosts]);

  return (
    <>
      <Flex gap="10" alignItems={"flex-start"}>
        <Box>
          {loading && (
            <Flex justify="center">
              <Spinner size="xl" />
            </Flex>
          )}

          {!loading && posts.length === 0 && (
            <Text>Nessun post disponibile al momento.</Text>
          )}

          {!loading && posts.map((post) => (
            <Post key={post._id} post={post} postedBy={post.postedBy} />
          ))}
        </Box>
        <Box
          flex={30}
          display={{
            base: "none",
            md: "block",
          }}
        >
          <SuggestedUsers />
        </Box>
      </Flex>
    </>
  );
};

export default FeedPage;
