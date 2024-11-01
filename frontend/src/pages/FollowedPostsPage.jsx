import { useEffect, useState } from "react";
import { Box, Heading, Spinner, VStack, Container, Text } from "@chakra-ui/react";
import Post from "../components/Post";

const FollowedPostsPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch followed posts from backend
  useEffect(() => {
    const fetchFollowedPosts = async () => {
      try {
        const response = await fetch("/api/posts/followed-posts", {
          method: "POST",
          credentials: "include", // To send cookies for authentication
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Impossibile recuperare i gossip seguiti");
        }

        const data = await response.json();
        setPosts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFollowedPosts();
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

  // Render followed posts
  return (
    <Container maxW="container.md" mt={10}>
      <Heading mb={6}>Gossip Seguiti</Heading>
      {
        posts.length === 0 ? (
          <Text>Nessun gossip seguito</Text>
        ) : (
          <VStack spacing={6} align="stretch">
        {posts.map((post) => (
          <Post key={post._id} post={post} postedBy={post.postedBy} />
        ))}
      </VStack>
        )
      }
      
    </Container>
  );
};

export default FollowedPostsPage;
