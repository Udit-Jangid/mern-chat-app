import { useChatState } from "@/Context/ChatProvider";
import {
  Avatar,
  Box,
  Button,
  Flex,
  Stack,
  Text,
  Tooltip,
  useToast,
} from "@chakra-ui/react";
import axios from "axios";
import React, { useCallback, useEffect, useState } from "react";
import ChatLoading from "./ChatLoading";
import { AddIcon } from "@chakra-ui/icons";
import { getSender, getSenderFull } from "@/utils/chatUtil";
import GroupChatModal from "./misc/GroupChatModal";

const MyChats = ({ fetchAgain }) => {
  const {
    user,
    chats,
    selectChatUser,
    setChats,
    setSelectChatUser,
    notification,
    setNotification,
  } = useChatState();
  const toast = useToast();
  const [loading, setLoading] = useState(false);

  const fetchChats = useCallback(async () => {
    try {
      // console.log("USER :::: ", user);
      setLoading(true);
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.get(`/api/chat`, config);
      // console.log(data);

      setChats(data);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      toast({
        title: "Error occcured !",
        description: `Failed to load the chats`,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  }, [setChats, toast, user]);

  useEffect(() => {
    if (user && user.token) {
      fetchChats();
    }
  }, [user, fetchChats, fetchAgain]);

  return (
    <Box
      display={{ base: selectChatUser?._id ? "none" : "flex", md: "flex" }}
      flexDir="column"
      alignItems="center"
      p={3}
      bg="white"
      borderRadius="lg"
      borderWidth="1px"
      w={{ base: "100%", md: "31%" }}
    >
      <Box
        pb={3}
        px={3}
        fontFamily="Work sans"
        display={"flex"}
        w={"100%"}
        justifyContent={"space-between"}
        alignItems={"center"}
        fontSize={{ base: "28px", md: "30px" }}
      >
        My Chats
        <GroupChatModal>
          <Button
            display={"flex"}
            fontSize={{ base: "17px", md: "10px", lg: "17px" }}
            rightIcon={<AddIcon />}
          >
            New Group Chat
          </Button>
        </GroupChatModal>
      </Box>
      <Box
        p={3}
        display={"flex"}
        w={"100%"}
        h={"100%"}
        flexDirection={"column"}
        borderRadius={"lg"}
        alignItems={"center"}
        bg="#F8F8F8"
        // overflowY={"hidden"}
      >
        {chats ? (
          <Stack width={"100%"}>
            {chats?.map((chat) => {
              return (
                <Box
                  onClick={() => {
                    setSelectChatUser(chat);
                    // console.log(chat);
                    const chatId = chat._id;
                    setNotification((prev) =>
                      prev.filter((n) => n.chat._id !== chatId)
                    );
                  }}
                  cursor={"pointer"}
                  bg={selectChatUser === chat ? "#38B2AC" : "#E8E8E8"}
                  color={selectChatUser === chat ? "white" : "black"}
                  px={3}
                  py={2}
                  borderRadius={"lg"}
                  key={chat._id}
                  display="flex"
                  alignItems={"center"}
                  gap={2}
                >
                  <Box>
                    {chat.isGroupChat ? (
                      <Tooltip
                        label={chat.chatName}
                        hasArrow
                        placement="bottom"
                      >
                        <Avatar
                          size="sm"
                          cursor="pointer"
                          name={chat.chatName}
                          src={chat.groupAdmin.pic}
                        />
                      </Tooltip>
                    ) : (
                      <Tooltip
                        label={getSenderFull(user, chat.users).name}
                        hasArrow
                        placement="bottom"
                      >
                        <Avatar
                          size="sm"
                          cursor="pointer"
                          name={getSenderFull(user, chat.users).name}
                          src={getSenderFull(user, chat.users).pic}
                        />
                      </Tooltip>
                    )}
                  </Box>
                  <Box flex="1">
                    <Box>
                      {chat.isGroupChat ? (
                        <Flex justify="space-between">
                          <Text>{chat.chatName}</Text>
                          <Text
                            borderRadius="base"
                            px={2}
                            style={{
                              fontSize: "12px",
                              fontStyle: "",
                              fontWeight: "normal",
                              backgroundColor: "whitesmoke",
                              border: "1px solid black",
                              height: "20px",
                              color: "black",
                            }}
                          >
                            Group
                          </Text>
                        </Flex>
                      ) : (
                        getSender(user, chat.users)
                      )}
                    </Box>
                    <Flex
                      justify="space-between"
                      fontSize="16px"
                      fontWeight="lighter"
                    >
                      {chat.latestMessage ? (
                        <>
                          <Text noOfLines={1}>
                            {chat?.latestMessage?.sender?.name !== user.name
                              ? chat?.latestMessage?.sender?.name
                              : `You`}{" "}
                            : {chat?.latestMessage?.content}
                          </Text>
                          <Text whiteSpace="nowrap">
                            {new Date(
                              chat?.latestMessage?.createdAt
                            ).toLocaleTimeString("en-IN", {
                              timeZone: "Asia/Kolkata",
                              hour: "2-digit",
                              minute: "2-digit",
                              hour12: true,
                            })}
                          </Text>
                        </>
                      ) : (
                        ``
                      )}
                    </Flex>
                  </Box>
                </Box>
              );
            })}
          </Stack>
        ) : (
          <ChatLoading />
        )}
      </Box>
    </Box>
  );
};

export default MyChats;
