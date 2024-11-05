import { Box, Button, Flex, Spinner, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import useShowToast from "../hooks/useShowToast";
import Post from "../components/Post";
import { useRecoilState } from "recoil";
import postsAtom from "../atoms/postsAtom";
import SuggestedUsers from "../components/SuggestedUsers";
import { Link } from "react-router-dom";

const HomePage = () => {
  const [posts, setPosts] = useRecoilState(postsAtom);
  const [loading, setLoading] = useState(true);
  const showToast = useShowToast();

  useEffect(() => {
    const getOtherFeedPosts = async () => {
      try {
        setLoading(true);

        // Recupero dei post da "other-feeds"
        const res = await fetch("/api/posts/other-feeds", {
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

    getOtherFeedPosts();
  }, [showToast, setPosts]);

  return (
    <>
      <Flex gap="10" alignItems={"flex-start"}>
        <Box flex={70}>
          {loading && (
            <Flex justify="center">
              <Spinner size="xl" />
            </Flex>
          )}

          {!loading && posts.length === 0 && (
            <Text>Nessun post disponibile al momento.</Text>
          )}

          {/* Pulsanti per filtrare i post */}
          <Flex justifyContent={"center"} m={1}>
            {/* <Box mb={4} fontWeight={"bold"} marginRight={4}>
              <Button variant={"outline"}>
                <Link to="/feed">Seg</Link>
              </Button>
            </Box> */}
            <Box mb={4} fontWeight={"bold"}>
              <Button variant={"outline"}>
                <Link to="/followed-posts">Tracciati</Link>
              </Button>
            </Box>
          </Flex>
          {/* Fine dei pulsanti */}

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

export default HomePage;




// // IN THIS CODE I AM SHOWING THE OTHER FEEDS WHEN USERS FIRST ENTER WHEN HE STARTS FOLLOWING HE WILL SEE ONLY THE GOSSIPS FROM PEOPLE HE FOLLOWS
// import { Box, Button, Flex, Spinner, Text } from "@chakra-ui/react";
// import { useEffect, useState } from "react";
// import useShowToast from "../hooks/useShowToast";
// import Post from "../components/Post";
// import { useRecoilState } from "recoil";
// import postsAtom from "../atoms/postsAtom";
// import SuggestedUsers from "../components/SuggestedUsers";
// import { Link } from "react-router-dom";

// const HomePage = () => {
//   const [posts, setPosts] = useRecoilState(postsAtom);
//   const [loading, setLoading] = useState(true);
//   const showToast = useShowToast();

//   useEffect(() => {
//     const getFeedPosts = async () => {
//       try {
//         setLoading(true);

//         // Primo tentativo: recupero i post dal feed
//         let res = await fetch("/api/posts/feed");
//         let data = await res.json();

//         if (data.error) {
//           showToast("Error", data.error, "error");
//           return;
//         }

//         // Se non ci sono post nel feed dell'utente, recupero altri post
//         if (data.length === 0) {
//           res = await fetch("/api/posts/other-feeds", {
//             method: "GET", // Cambiato da POST a GET se la richiesta non deve includere dati
//             credentials: "include", // Invia i cookie per l'autenticazione
//             headers: {
//               "Content-Type": "application/json",
//             },
//           });
//           data = await res.json();

//           if (data.error) {
//             showToast("Error", data.error, "error");
//             return;
//           }
//         }

//         // Imposto i post recuperati dallo stato
//         setPosts(data);
//       } catch (error) {
//         showToast("Error", error.message, "error");
//       } finally {
//         setLoading(false);
//       }
//     };

//     getFeedPosts();
//   }, [showToast, setPosts]);

//   return (
//     <>
//       <Flex gap="10" alignItems={"flex-start"}>
//         <Box flex={70}>
//           {!loading && posts.length === 0 && (
//             <Text>Segui gli utenti per vedere i gossip oppure clicca qui</Text>
//           )}

//           {loading && (
//             <Flex justify="center">
//               <Spinner size="xl" />
//             </Flex>
//           )}

//           {/* Pulsanti per filtrare i post */}
//           <Flex justifyContent={"center"} m={1}>
//             <Box mb={4} fontWeight={"bold"} marginRight={4}>
//               <Button variant={"outline"}>
//                 <Link to="/other-feeds">Novità</Link>
//               </Button>
//             </Box>
//             <Box mb={4} fontWeight={"bold"}>
//               <Button variant={"outline"}>
//                 <Link to="/followed-posts">Tracciati</Link>
//               </Button>
//             </Box>
//           </Flex>
//           {/* Fine dei pulsanti */}

//           {posts.map((post) => (
//             <Post key={post._id} post={post} postedBy={post.postedBy} />
//           ))}
//         </Box>
//         <Box
//           flex={30}
//           display={{
//             base: "none",
//             md: "block",
//           }}
//         >
//           <SuggestedUsers />
//         </Box>
//       </Flex>
//     </>
//   );
// };

// export default HomePage;


// OLD CODE
// import { Box, Button, Flex, Spinner, Text } from "@chakra-ui/react";
// import { useEffect, useState } from "react";
// import useShowToast from "../hooks/useShowToast";
// import Post from "../components/Post";
// import { useRecoilState } from "recoil";
// import postsAtom from "../atoms/postsAtom";
// import SuggestedUsers from "../components/SuggestedUsers";
// import { Link, useNavigate } from "react-router-dom";

// const HomePage = () => {
//   const [posts, setPosts] = useRecoilState(postsAtom);
//   const [loading, setLoading] = useState(true);
//   const showToast = useShowToast();
//   const navigate = useNavigate(); // useNavigate hook for redirection
//   useEffect(() => {
//     const getFeedPosts = async () => {
//       setLoading(true);
//       setPosts([]);
//       try {
//         let res = await fetch("/api/posts/feed");
//         let data = await res.json();

//         if (data.error) {
//           showToast("Error", data.error, "error");
//           return;
//         }

//         // If there are no posts, fetch from other-feeds
//         if (data.length === 0) {
//           res = await fetch("/api/posts/other-feeds", {
//             method: "POST",
//             credentials: "include", // To send cookies for authentication
//             headers: {
//               "Content-Type": "application/json",
//             },
//           });
//           data = await res.json();

//           if (data.error) {
//             showToast("Error", data.error, "error");
//             return;
//           }
//         }

//         setPosts(data);
//       } catch (error) {
//         showToast("Error", error.message, "error");
//       } finally {
//         setLoading(false);
//       }
//     };

//     getFeedPosts();
//   }, [showToast, setPosts, navigate]);

//   return (
//     <>
//       <Flex gap="10" alignItems={"flex-start"}>
//         <Box flex={70}>
//           {!loading && posts.length === 0 && (
//             <Text>Segui gli utenti per vedere i gossip oppure clicca qui</Text>
//           )}

//           {loading && (
//             <Flex justify="center">
//               <Spinner size="xl" />
//             </Flex>
//           )}

//           {/* Center per 2 buttons uno per gossip per te e uno per post seguiti */}
//           <Flex justifyContent={"center"} m={1}>
//             <Box mb={4} fontWeight={"bold"} marginRight={4}>
//               <Button variant={"outline"}>
//                 <Link to="/other-feeds">Gossip Per te</Link>
//               </Button>
//             </Box>
//             <Box mb={4} fontWeight={"bold"}>
//               <Button variant={"outline"}>
//                 <Link to="/followed-posts">Gossip seguiti</Link>
//               </Button>
//             </Box>
//           </Flex>
//           {/* fine flex 2 buttons */}
//           {posts.map((post) => (
//             <Post key={post._id} post={post} postedBy={post.postedBy} />
//           ))}
//         </Box>
//         <Box
//           flex={30}
//           display={{
//             base: "none",
//             md: "block",
//           }}
//         >
//           <SuggestedUsers />
//         </Box>
//       </Flex>
//     </>
//   );
// };

// export default HomePage;
