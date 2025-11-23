import { useChatState } from "@/Context/ChatProvider";
import {
  Box,
  Button,
  FormControl,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import axios from "axios";
import React, { useState } from "react";
import ChatLoading from "../ChatLoading";
import { UserListItem } from "./SideDrawer";
import { CloseIcon } from "@chakra-ui/icons";
import { wrap } from "framer-motion";

const GroupChatModal = ({ children }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { user, setChats, chats } = useChatState();
  const [groupChatInfo, setGroupChatInfo] = useState({
    name: "",
    searchText: "",
    searchResult: [],
    selectedUsers: [],
  });
  const [loading, setLoading] = useState(false);
  const [ButtonLoading, setButtonLoading] = useState(false);
  const { name, searchText, searchResult, selectedUsers } = groupChatInfo;
  const toast = useToast();

  const resetAndClose = () => {
    setGroupChatInfo({
      name: "",
      searchText: "",
      searchResult: [],
      selectedUsers: [],
    });
    onClose();
  };

  const handleSubmit = async () => {
    try {
      setButtonLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.post(
        "/api/chat/group",
        { name, users: selectedUsers.map((u) => u._id) },
        config
      );
      setChats([data, ...chats]);
      setButtonLoading(false);
      resetAndClose();
      toast({
        title: "Group Chat Created !",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
    } catch (error) {
      setButtonLoading(false);
      toast({
        title: "Error occured while creating Group Chat !",
        description: `Not able to create chat due to this error ${error}`,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleSearch = async (e) => {
    const value = e.target.value;
    // console.log(value);

    setGroupChatInfo((prevState) => {
      return {
        ...prevState,
        searchText: value,
      };
    });

    if (!value.trim()) {
      // skip empty searches
      // ✅ Clear old results when input is empty or only spaces
      setGroupChatInfo((prevState) => ({
        ...prevState,
        searchResult: [],
      }));
      return;
    }

    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };

      const { data } = await axios.get(
        `/api/user?search=${value.trim()}`,
        config
      );
      // console.log(data);
      // console.log(searchText);

      setGroupChatInfo((prevState) => {
        return {
          ...prevState,
          searchResult: data,
        };
      });
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast({
        title: "Error occcured !",
        description: `Failed to load the search results`,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleSelection = (selectedUser) => {
    if (selectedUsers.some((u) => u._id === selectedUser._id)) {
      toast({
        title: "User already added !",
        description: ``,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    setGroupChatInfo({
      ...groupChatInfo,
      selectedUsers: [...selectedUsers, selectedUser],
    });
  };

  return (
    <>
      <span onClick={onOpen}>{children}</span>

      <Modal isCentered isOpen={isOpen} onClose={resetAndClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader
            fontSize="35px"
            fontFamily="Work sans"
            display={"flex"}
            justifyContent={"center"}
          >
            Create Group Chat
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody
            display={"flex"}
            flexDirection={"column"}
            alignItems={"center"}
          >
            <FormControl>
              <Input
                value={name}
                onChange={(e) =>
                  setGroupChatInfo({ ...groupChatInfo, name: e.target.value })
                }
                placeholder="Chat Name"
                mb={3}
              />
            </FormControl>
            <FormControl>
              <Input
                value={searchText}
                onChange={handleSearch}
                placeholder="Add users"
                mb={1}
              />
            </FormControl>
            <Box w={"100%"} display={"flex"} flexWrap={"wrap"}>
              {selectedUsers?.map((user) => (
                <UserBadgeItem
                  key={user._id}
                  user={user}
                  handleFunction={() => {
                    setGroupChatInfo({
                      ...groupChatInfo,
                      selectedUsers: selectedUsers?.filter(
                        (u) => u._id !== user._id
                      ),
                    });
                  }}
                />
              ))}
            </Box>
            {loading ? (
              <ChatLoading />
            ) : (
              searchResult
                ?.slice(0, 5)
                ?.map((u) => (
                  <UserListItem
                    key={u._id}
                    user={u}
                    handleFunction={() => handleSelection(u)}
                  />
                ))
            )}
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="blue"
              onClick={handleSubmit}
              // isLoading={ButtonLoading}
              isDisabled={!name.length || !(selectedUsers.length > 1)}
            >
              Create Chat
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export const UserBadgeItem = ({
  handleFunction,
  user,
  isGroupAdmin = false,
}) => {
  return !isGroupAdmin ? (
    <Box
      px={2}
      py={1}
      borderRadius={"lg"}
      m={1}
      mb={2}
      color={"white"}
      fontSize={14}
      cursor={"default"}
      backgroundColor="purple"
      display="flex"
      alignItems="center"
      gap={2}
    >
      {user.name}
      <Box
        as="span"
        onClick={handleFunction}
        display="flex"
        alignItems="center"
        justifyContent="center"
        w="16px"
        h="16px"
        borderRadius={"base"}
        bg="red.500"
        _hover={{ bg: "red.600" }}
        cursor="pointer"
      >
        <CloseIcon boxSize={2.5} color="white" />
      </Box>
    </Box>
  ) : (
    <Box
      px={2}
      py={1}
      borderRadius={"lg"}
      m={1}
      mb={2}
      color={"white"}
      fontSize={14}
      cursor={"default"}
      backgroundColor="forestgreen"
      display="flex"
      alignItems="center"
      gap={2}
    >
      {user.name}
      {/* <Box
        as="span"
        onClick={handleFunction}
        display="flex"
        alignItems="center"
        justifyContent="center"
        w="16px"
        h="16px"
        borderRadius={"base"}
        bg="red.500"
        _hover={{ bg: "red.600" }}
        cursor="pointer"
      >
        <CloseIcon boxSize={2.5} color="white" />
      </Box> */}
    </Box>
  );
};

export default GroupChatModal;
