import { useEffect, useState } from "react";
import { Box, Heading, Spinner, VStack, Container, Text } from "@chakra-ui/react";
import Post from "../components/Post";

const FeedPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch posts from backend
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

        if (!res.ok) {
          throw new Error("Failed to fetch posts");
        }

        const data = await res.json();
        setPosts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    getFeedPosts();
  }, []);

  // Render loading state
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Spinner size="xl" />
      </Box>
    );
  }

  // Render error state
  if (error) {
    return (
      <Box textAlign="center" mt={10}>
        <Heading size="lg">Error</Heading>
        <Text>{error}</Text>
      </Box>
    );
  }

  // Render posts
  return (
    <Container maxW="container.md" mt={10}>
      <Text fontSize={"20px"} textAlign={"center"} mb={6}>Feed</Text>
      <VStack spacing={6} align="stretch">
        {posts.map((post) => (
          <Post key={post._id} post={post} postedBy={post.postedBy} />
        ))}
      </VStack>
    </Container>
  );
};

export default FeedPage;
