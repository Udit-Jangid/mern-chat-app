import { useChatState } from "@/Context/ChatProvider";
import { BellIcon, ChevronDownIcon } from "@chakra-ui/icons";
import {
  Avatar,
  Badge,
  Box,
  Button,
  Drawer,
  DrawerBody,
  DrawerContent,
  DrawerHeader,
  DrawerOverlay,
  Input,
  Menu,
  MenuButton,
  MenuDivider,
  MenuItem,
  MenuList,
  Spinner,
  Text,
  Tooltip,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import React, { useState } from "react";
import ProfileModal from "./ProfileModal";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ChatLoading from "../ChatLoading";
import { getSender } from "@/utils/chatUtil";

const SideDrawer = () => {
  const [search, setSearch] = useState("");
  const [searchResult, setSearchResult] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadingChat, setLoadingChat] = useState();

  const {
    user,
    setUser,
    setSelectChatUser,
    chats,
    setChats,
    notification,
    setNotification,
  } = useChatState();

  const navigate = useNavigate();

  const { isOpen, onOpen, onClose } = useDisclosure();

  const logoutHandler = () => {
    localStorage.removeItem("userInfo");
    setUser(null);
    setSelectChatUser(null);
    navigate("/", { replace: true });
  };

  const toast = useToast();

  const searchUserHandler = async () => {
    try {
      setLoading(true);

      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get(`/api/user?search=${search}`, config);
      setLoading(false);
      setSearchResult(data);
    } catch (error) {
      setLoading(false);
      toast({
        title: "Error occcured !",
        description: `Failed to load search results`,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const accessChatHandler = async (userId) => {
    try {
      setLoadingChat(true);

      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.post("/api/chat", { userId }, config);

      setSelectChatUser(data);
      // need to check
      if (!chats?.find((c) => c._id === data._id)) setChats([data, ...chats]);
      setLoadingChat(false);
      onClose();
    } catch (error) {
      setLoadingChat(false);
      toast({
        title: "Error occcured !",
        description: `Failed to load chat`,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        bg="white"
        w="100%"
        p="5px 10px 5px 10px"
        borderWidth="5px"
      >
        <Tooltip label="Search Users to chat" hasArrow placement="bottom-end">
          <Button variant="ghost" onClick={onOpen}>
            <i className="fas fa-search"></i>
            <Text display={{ base: "none", md: "flex" }} px="4">
              Search User
            </Text>
          </Button>
        </Tooltip>
        <Text fontSize="2xl" fontFamily="Work sans" textAlign="center">
          Chat App
        </Text>
        <div>
          <Menu>
            <MenuButton p="1" pr="3" position="relative" display="inline-block">
              <BellIcon fontSize="2xl" m={1} />
              <Badge
                position="absolute"
                top="0"
                right="2"
                color="white"
                borderRadius="full"
                px={1.5}
                fontSize="0.85em"
                bg="red.400"
                w="5"
                h="5"
                display={notification.length > 0 ? "flex" : "none"}
              >
                {notification.length}
              </Badge>
            </MenuButton>
            <MenuList pl={2}>
              {!notification.length && "No New Messages"}
              {notification.map((notif) => (
                <MenuItem
                  key={notif._id}
                  onClick={() => {
                    setSelectChatUser(notif.chat);
                    setNotification(
                      notification.filter((n) =>
                        n.chat.isGroupChat
                          ? n.chat.chatName !== notif.chat.chatName
                          : getSender(user, n.chat.users) !==
                            getSender(user, notif.chat.users)
                      )
                    );
                  }}
                >
                  {notif.chat.isGroupChat
                    ? `New Message in ${notif.chat.chatName}`
                    : `New Message from ${getSender(user, notif.chat.users)}`}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>
          <Menu size="sm">
            <MenuButton as={Button} rightIcon={<ChevronDownIcon />}>
              <Avatar
                size="sm"
                cursor="pointer"
                name={user.name}
                src={user.pic}
              />
            </MenuButton>
            <MenuList>
              <ProfileModal user={user}>
                <MenuItem>My Profile</MenuItem>
              </ProfileModal>
              <MenuDivider />
              <MenuItem onClick={logoutHandler}>Logout</MenuItem>
            </MenuList>
          </Menu>
        </div>
      </Box>

      {/* Side Drawer */}
      <Drawer
        isOpen={isOpen}
        placement="left"
        onClose={onClose}
        // finalFocusRef={btnRef}
      >
        <DrawerOverlay />
        <DrawerContent>
          <DrawerHeader borderBottomWidth="1px">Search Users</DrawerHeader>
          <DrawerBody>
            <Box display="flex" gap="8px" mb={2}>
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyUp={(e) => {
                  if (e.key === "Enter") searchUserHandler();
                }}
                placeholder="Search by Name or Email"
              />
              <Button
                isDisabled={!search.length}
                onClick={searchUserHandler}
                isLoading={loading}
              >
                Go
              </Button>
            </Box>
            {loading ? (
              <ChatLoading />
            ) : (
              searchResult?.map((user) => (
                <UserListItem
                  key={user._id}
                  user={user}
                  handleFunction={() => accessChatHandler(user._id)}
                />
              ))
            )}
            {loadingChat ? (
              <Box display="flex" flexDirection="column" alignItems="center">
                <Spinner
                  thickness="4px"
                  speed="0.65s"
                  emptyColor="gray.200"
                  color="blue.500"
                  size="xl"
                />
              </Box>
            ) : (
              <></>
            )}
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export const UserListItem = ({ user, handleFunction }) => {
  return (
    <Box
      onClick={handleFunction}
      cursor="pointer"
      borderRadius="lg"
      color="black"
      bgColor="#E8E8E8"
      display="flex"
      alignItems="center"
      _hover={{ background: "#38B2AC", color: "white" }}
      px={3}
      py={2}
      mb={2}
      width="100%"
    >
      <Avatar
        mr={2}
        size="sm"
        cursor="pointer"
        name={user.name}
        src={user.pic}
      />
      <Box>
        <Text>{user.name}</Text>{" "}
        <Text fontSize="xs">
          <b>Email : </b> {user.email}
        </Text>
      </Box>
    </Box>
  );
};

export default SideDrawer;
