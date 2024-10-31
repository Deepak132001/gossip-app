import {
    Box,
    Button,
    Flex,
    Input,
    InputGroup,
    InputRightElement,
    Text,
    Image,
    IconButton,
    useColorModeValue,
  } from "@chakra-ui/react";
  import { useState , useCallback } from "react";
  import { Link } from "react-router-dom";
  import { AiOutlineClose } from "react-icons/ai";
  import useShowToast from "../hooks/useShowToast";
  import SuggestedUsers from "../components/SuggestedUsers";
  
  const SearchPage = () => {
    const [searchQuery, setSearchQuery] = useState(
      localStorage.getItem("searchQuery") || ""
    );
    const [searchResults, setSearchResults] = useState(
      JSON.parse(localStorage.getItem("searchResults")) || []
    );
    const showToast = useShowToast();
  
    // Memoize handleSearch using useCallback
    const handleSearch = useCallback(async () => {
      if (searchQuery.trim() === "") {
        return;
      }
      try {
        const res = await fetch(`/api/users/search?query=${searchQuery}`);
        const data = await res.json();
        if (data.error) {
          showToast("Error", data.error, "error");
          return;
        }
  
        // Add new search results to the existing list and filter out any duplicate entries
        const updatedResults = [...searchResults, ...data].filter(
          (value, index, self) =>
            index === self.findIndex((u) => u._id === value._id)
        );
        setSearchResults(updatedResults);
        localStorage.setItem("searchQuery", searchQuery); // Store search query in localStorage
        localStorage.setItem("searchResults", JSON.stringify(updatedResults)); // Store search results in localStorage
      } catch (error) {
        showToast("Error", error.message, "error");
      }
    }, [searchQuery, searchResults, showToast]);
  
    // Clear the search query and results
    const handleClearSearch = () => {
      setSearchQuery("");
      setSearchResults([]);
      localStorage.removeItem("searchQuery");
      localStorage.removeItem("searchResults");
    };

    // color more 
    const colorMode = useColorModeValue("blackAlpha.800", "whiteAlpha.800")
  
    return (
      <Flex direction="column" alignItems="center" mt={6}>
        <Box width="100%" mb={4}>
          <InputGroup>
            <Input
              placeholder="Cerca il profilo..."
              _placeholder={{ color: useColorModeValue("#6c757d", "#e5e5e5") }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              color={useColorModeValue("black", "white")}
              bg={useColorModeValue("white", "#495057")}
            />
            <InputRightElement width="6rem">
              <Button
                variant={"outline"}
                h="1.75rem"
                size="sm"
                onClick={handleSearch}
              >
                Cerca
              </Button>
            </InputRightElement>
          </InputGroup>
          {searchQuery && (
            <Flex justifyContent="flex-end" mt={2}>
              <Button
                size="sm"
                variant="ghost"
                onClick={handleClearSearch}
                leftIcon={<AiOutlineClose />}
              >
                Elimina
              </Button>
            </Flex>
          )}
        </Box>
  
        <Box width="100%" gap={6} mt={4}>
          <Box flex={1}>
            <Text
              fontSize="lg"
              fontWeight="bold"
              mb={4}
              color={colorMode}
            >
              Risultati della Ricerca
            </Text>
            {searchResults.length > 0 ? (
              searchResults.map((user) => (
                <Flex
                  key={user._id}
                  p={2}
                  border="1px solid #e2e2e2"
                  borderRadius="md"
                  mb={2}
                  alignItems="center"
                >
                  <Image
                    boxSize="40px"
                    borderRadius="full"
                    src={user.profilePic || "/default-profile.png"}
                    alt={user.username}
                    mr={4}
                  />
                  <Link to={`/${user.username}`}>
                    <Text fontWeight="bold">{user.username}</Text>
                  </Link>
                  <IconButton
                    icon={<AiOutlineClose />}
                    variant="ghost"
                    aria-label="Remove user"
                    ml="auto"
                    onClick={() =>
                      setSearchResults((prevResults) => {
                        const updatedResults = prevResults.filter(
                          (u) => u._id !== user._id
                        );
                        localStorage.setItem(
                          "searchResults",
                          JSON.stringify(updatedResults)
                        );
                        return updatedResults;
                      })
                    }
                  />
                </Flex>
              ))
            ) : (
              <Text color={useColorModeValue("blackAlpha.600", "whiteAlpha.600")}>
                Nessun utente trovato, prova a verificare.
              </Text>
            )}
          </Box>
  
          <Box flex={1} mt={"20px"}>
            <SuggestedUsers />
          </Box>
        </Box>
      </Flex>
    );
  };
  
  export default SearchPage;
  