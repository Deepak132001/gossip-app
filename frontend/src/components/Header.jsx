import {
  Flex,
  Image,
  Link,
  useColorMode,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  IconButton,
  useColorModeValue,
  Box,
} from "@chakra-ui/react";
import { useRecoilValue, useSetRecoilState } from "recoil";
import userAtom from "../atoms/userAtom";
import { AiFillHome, AiOutlineSearch } from "react-icons/ai";
import { RxAvatar } from "react-icons/rx";
import { Link as RouterLink } from "react-router-dom";
import { FiLogOut } from "react-icons/fi";
import useLogout from "../hooks/useLogout";
import authScreenAtom from "../atoms/authAtom";
import { BsFillChatQuoteFill } from "react-icons/bs";
import { FiMenu } from "react-icons/fi";

const Header = () => {
  const { colorMode, toggleColorMode } = useColorMode();
  const user = useRecoilValue(userAtom);
  const logout = useLogout();
  const setAuthScreen = useSetRecoilState(authScreenAtom);

  const menuTextColor = useColorModeValue("black", "white");
  const iconButtonColor = useColorModeValue("gray.600", "gray.300");

  return (
    <Flex justifyContent={"space-between"} mt={6} mb="12">
      {user && (
        <Link as={RouterLink} to="/">
          <AiFillHome size={24} color={iconButtonColor} />
        </Link>
      )}
      {!user && (
        <Link
          as={RouterLink}
          to={"/auth"}
          onClick={() => setAuthScreen("login")}
          color={menuTextColor}
        >
          Login
        </Link>
      )}

      <Image
        cursor={"pointer"}
        alt="logo"
        w={12}
        src={colorMode === "dark" ? "/light-logo.png" : "/dark-logo.png"}
        onClick={toggleColorMode}
        ml={"41px"}
      />

      {/* Search bar icon */}
      {/* {user && (
        
      )} */}
      {/* finish search bar icon */}

      {user && (
        <Flex>
          <Link mt={"8px"} mr={"5px"} as={RouterLink} to="/search">
          <AiOutlineSearch size={24} color={iconButtonColor} />
        </Link>
        <Menu>
          <MenuButton
            as={IconButton}
            aria-label="Options"
            icon={<FiMenu color={menuTextColor} size={"25px"} />}
            variant="none"
            color={iconButtonColor}
          />
          <MenuList bg="none" color={menuTextColor}>
            <MenuItem
              as={RouterLink}
              to={`/${user.username}`}
              icon={<RxAvatar size={20} color={iconButtonColor} />}
            >
              Profilo
            </MenuItem>
            <MenuItem
              as={RouterLink}
              to={`/chat`}
              icon={<BsFillChatQuoteFill size={20} color={iconButtonColor} />}
            >
              Chat
            </MenuItem>
            {/*
						<MenuItem as={RouterLink} to={`/settings`} icon={<MdOutlineSettings size={20} color={iconButtonColor} />}
							_hover={{ bg: useColorModeValue("gray.100", "gray.700") }}>
							Settings
						</MenuItem>
						*/}
            <MenuItem
              onClick={logout}
              icon={<FiLogOut size={20} color={iconButtonColor} />}
            >
              Esci
            </MenuItem>
          </MenuList>
        </Menu>
        </Flex>
      )}

      {!user && (
        <Link
          as={RouterLink}
          to={"/auth"}
          onClick={() => setAuthScreen("signup")}
          color={menuTextColor}
        >
          Registrati
        </Link>
      )}
    </Flex>
  );
};

export default Header;

// old
// import { Button, Flex, Image, Link, useColorMode } from "@chakra-ui/react";
// import { useRecoilValue, useSetRecoilState } from "recoil";
// import userAtom from "../atoms/userAtom";
// import { AiFillHome } from "react-icons/ai";
// import { RxAvatar } from "react-icons/rx";
// import { Link as RouterLink } from "react-router-dom";
// import { FiLogOut } from "react-icons/fi";
// import useLogout from "../hooks/useLogout";
// import authScreenAtom from "../atoms/authAtom";
// import { BsFillChatQuoteFill } from "react-icons/bs";
// // import { MdOutlineSettings } from "react-icons/md";

// const Header = () => {
// 	const { colorMode, toggleColorMode } = useColorMode();
// 	const user = useRecoilValue(userAtom);
// 	const logout = useLogout();
// 	const setAuthScreen = useSetRecoilState(authScreenAtom);

// 	return (
// 		<Flex justifyContent={"space-between"} mt={6} mb='12'>
// 			{user && (
// 				<Link as={RouterLink} to='/'>
// 					<AiFillHome size={24} />
// 				</Link>
// 			)}
// 			{!user && (
// 				<Link as={RouterLink} to={"/auth"} onClick={() => setAuthScreen("login")}>
// 					Login
// 				</Link>
// 			)}

// 			<Image
// 				cursor={"pointer"}
// 				alt='logo'
// 				w={6}
// 				src={colorMode === "dark" ? "/light-logo.svg" : "/dark-logo.svg"}
// 				onClick={toggleColorMode}
// 			/>

// 			{user && (
// 				<Flex alignItems={"center"} gap={4}>
// 					<Link as={RouterLink} to={`/${user.username}`}>
// 						<RxAvatar size={24} />
// 					</Link>
// 					<Link as={RouterLink} to={`/chat`}>
// 						<BsFillChatQuoteFill size={20} />
// 					</Link>
// 					{/* <Link as={RouterLink} to={`/settings`}>
// 						<MdOutlineSettings size={20} />
// 					</Link> */}
// 					<Button size={"xs"} onClick={logout}>
// 						<FiLogOut size={20} />
// 					</Button>
// 				</Flex>
// 			)}

// 			{!user && (
// 				<Link as={RouterLink} to={"/auth"} onClick={() => setAuthScreen("signup")}>
// 					Sign up
// 				</Link>
// 			)}
// 		</Flex>
// 	);
// };

// export default Header;
