import { useChatState } from "@/Context/ChatProvider";
import { ViewIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  FormControl,
  IconButton,
  Image,
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
import React, { useState } from "react";
import { UserBadgeItem } from "./GroupChatModal";
import ChatLoading from "../ChatLoading";
import { UserListItem } from "./SideDrawer";
import axios from "axios";

const UpdateGroupChatModal = ({ setFetchAgain }) => {
  const { selectChatUser, setSelectChatUser, user } = useChatState();
  const { users, groupAdmin } = selectChatUser;
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [groupChatInfo, setGroupChatInfo] = useState({
    name: "",
    searchText: "",
    searchResult: [],
  });
  const { name, searchText, searchResult } = groupChatInfo;
  const toast = useToast();

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
      setSearchLoading(true);
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
      const users = selectChatUser.users?.map((u) => u._id);
      const filteredData = data?.filter((u) => !users.includes(u._id));
      setGroupChatInfo((prevState) => {
        return {
          ...prevState,
          searchResult: filteredData,
        };
      });
      setSearchLoading(false);
    } catch (error) {
      setSearchLoading(false);
      toast({
        title: "Error occcured !",
        description: `Failed to load the search results`,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleRename = async () => {
    try {
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.put(
        "/api/chat/renameGroup",
        {
          name,
          chatId: selectChatUser._id,
        },
        config
      );
      setSelectChatUser(data);
      setFetchAgain((prev) => !prev);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast({
        title: "Error occcured !",
        description: `Failed to rename chat due to : ${error}`,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const removeAddUserHandler = async (userId, isAdd = false) => {
    if (selectChatUser.groupAdmin._id !== user._id && user._id !== userId) {
      toast({
        title: "Only group admin can add or remove user !",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
      return;
    }
    try {
      setSearchLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await (isAdd
        ? axios.put(
            "/api/chat/addToGroup",
            {
              chatId: selectChatUser._id,
              userId,
            },
            config
          )
        : axios.put(
            "/api/chat/removeFromGroup",
            {
              chatId: selectChatUser._id,
              userId,
            },
            config
          ));
      setSelectChatUser(data);
      setFetchAgain((prev) => !prev);
      if (!data.users.map((u) => u._id).includes(user._id)) {
        setSelectChatUser(null);
      }
      setSearchLoading(false);
    } catch (error) {
      setSearchLoading(false);
      toast({
        title: "Error occcured !",
        description: `Failed to ${
          isAdd ? "add" : "remove"
        } user due to : ${error}`,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  };

  return (
    <>
      <IconButton onClick={onOpen} icon={<ViewIcon />} aria-label="" />

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader
            fontSize={"35px"}
            fontFamily="Work sans"
            textAlign="center"
          >
            {selectChatUser.chatName}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody
            display="flex"
            flexDir="column"
            alignItems="center"
            gap="0.5rem"
          >
            <Image
              borderRadius="full"
              boxSize="150px"
              src={selectChatUser.groupAdmin.pic}
              alt={selectChatUser.groupAdmin.name}
            />
            <Box
              fontWeight={"bold"}
              fontSize={"25px"}
              fontFamily="Work sans"
              textAlign="center"
            >
              Members
            </Box>
            <Box w={"100%"} display={"flex"} flexWrap={"wrap"}>
              {users?.map((user) =>
                groupAdmin._id !== user._id ? (
                  <UserBadgeItem
                    key={user._id}
                    user={user}
                    handleFunction={() => removeAddUserHandler(user._id)}
                  />
                ) : (
                  <UserBadgeItem
                    key={user._id}
                    user={user}
                    isGroupAdmin={true}
                    handleFunction={() => removeAddUserHandler(user._id)}
                  />
                )
              )}
            </Box>
            <FormControl display={"flex"} gap={"0.5rem"}>
              <Input
                value={name}
                onChange={(e) =>
                  setGroupChatInfo({ ...groupChatInfo, name: e.target.value })
                }
                placeholder="Chat Name"
                mb={3}
              />
              <Button
                colorScheme="blue"
                isDisabled={!name.length}
                isLoading={loading}
                onClick={handleRename}
              >
                Update
              </Button>
            </FormControl>
            <FormControl>
              <Input
                value={searchText}
                onChange={handleSearch}
                placeholder="Add user to group"
                mb={1}
              />
            </FormControl>
            {searchLoading ? (
              <ChatLoading />
            ) : (
              searchResult
                ?.slice(0, 5)
                ?.map((u) => (
                  <UserListItem
                    key={u._id}
                    user={u}
                    handleFunction={() => removeAddUserHandler(u._id, true)}
                  />
                ))
            )}
          </ModalBody>

          <ModalFooter>
            <Button
              onClick={() => {
                removeAddUserHandler(user._id);
                onClose();
              }}
              colorScheme="red"
            >
              Leave Group
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default UpdateGroupChatModal;
