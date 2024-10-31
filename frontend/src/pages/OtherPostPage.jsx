// Assuming you have already set up your project with React, Vite, and Chakra UI.
// Let's create a new page to display posts from users you do not follow.

import { useEffect, useState } from "react";
import { Box, Heading, Spinner, VStack, Container, Text } from "@chakra-ui/react";
import Post from "../components/Post";

const OtherPostsPage = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch posts from backend
  useEffect(() => {
    const fetchOtherPosts = async () => {
      try {
        const response = await fetch("/api/posts/other-feeds", {
          method: "GET",
          credentials: "include", // To send cookies for authentication
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch posts");
        }

        const data = await response.json();
        setPosts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchOtherPosts();
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
      <Text fontSize={"20px"} textAlign={"center"} mb={6}>Rumors</Text>
      <VStack spacing={6} align="stretch">
        {posts.map((post) => (
          <Post key={post._id} post={post} postedBy={post.postedBy} />
        ))}
      </VStack>
    </Container>
  );
};

export default OtherPostsPage;

// Notes:
// - This page fetches posts from the "/api/other-feeds" endpoint created earlier.
// - `credentials: "include"` is set to ensure cookies (e.g., the JWT) are sent with the request for authentication.
// - It uses Chakra UI components to create a clean and responsive UI for displaying posts.
