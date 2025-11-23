import { useChatState } from "@/Context/ChatProvider";
import { getSender, getSenderFull } from "@/utils/chatUtil";
import { ArrowBackIcon } from "@chakra-ui/icons";
import {
  Box,
  FormControl,
  IconButton,
  Input,
  Spinner,
  Text,
  useToast,
} from "@chakra-ui/react";
import React, { useEffect, useRef, useState } from "react";
import ProfileModal from "./misc/ProfileModal";
import UpdateGroupChatModal from "./misc/UpdateGroupChatModal";
import Lottie from "react-lottie";
import axios from "axios";
import ScrollableChat from "./ScrollableChat";
import { io } from "socket.io-client";
import animationData from "../animations/typing.json";

// const END_POINT = "http://localhost:5000";
const END_POINT = "https://mern-chat-app-2x6j.onrender.com";
var selectedChatCompare;
export const socket = io(END_POINT);

const SingleChat = ({ setFetchAgain }) => {
  const {
    selectChatUser,
    user,
    setSelectChatUser,
    notification,
    setNotification,
  } = useChatState();
  // const chatId = selectChatUser._id;
  const [msgLoading, setMsgLoading] = useState(false);
  const [msgList, setMsgList] = useState([]);
  const [sendMsgLoading, setSendMsgLoading] = useState(false);
  const [newMsg, setNewMsg] = useState("");

  const [isSocketConnected, setSocketConnected] = useState(false);

  const [isTyping, setTyping] = useState(false);
  const [isShowType, setShowType] = useState(false);

  const msgRef = useRef(null);
  const toast = useToast();
  const typingTimeoutRef = useRef(null);

  useEffect(() => {
    if (selectChatUser?._id) getMessagesHandler();
    selectedChatCompare = selectChatUser;
  }, [selectChatUser, selectChatUser?._id]);

  useEffect(() => {
    // socket = io(END_POINT);
    socket.emit("setup", user);
    socket.on("connected", () => setSocketConnected(true));
    socket.on("typing", () => setShowType(true));
    socket.on("stop typing", () => setShowType(false));
  }, [user]);

  useEffect(() => {
    if (!selectChatUser?._id) return;

    socket.emit("join chatroom", selectChatUser._id);

    return () => {
      socket.off("joined chatroom");
    };
  }, [selectChatUser?._id]);

  // console.log(notification, "----------------");

  useEffect(() => {
    // socket.on("message recieved", (newMsgRecieved) => {
    //   if (
    //     !selectedChatCompare || // if chat is not selected or doesn't match current chat
    //     selectedChatCompare._id !== newMsgRecieved.chat._id
    //   ) {
    //     // show notification
    //   } else setMsgList((prevState) => [...prevState, newMsgRecieved]);
    // });
    if (!socket) return;

    const messageHandler = (newMsgRecieved) => {
      if (
        !selectedChatCompare ||
        selectedChatCompare._id !== newMsgRecieved.chat._id
      ) {
        // show notification
        if (!notification.includes(newMsgRecieved)) {
          setNotification((prev) => [newMsgRecieved, ...prev]);
          setFetchAgain((prev) => !prev);
        }
      } else {
        setMsgList((prev) => [...prev, newMsgRecieved]);
        setFetchAgain((prev) => !prev);
      }
    };

    socket.on("message recieved", messageHandler);

    // cleanup to prevent duplicates
    return () => {
      socket.off("message recieved", messageHandler);
    };
  }, [selectedChatCompare]);

  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msgList]);

  const getMessagesHandler = async () => {
    setMsgLoading(true);
    try {
      const config = {
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      };
      // console.log("TOKEN:", user?.token);

      const { data } = await axios.get(
        `/api/message/${selectChatUser?._id}`,
        config
      );
      // const { data } = await getChatMessages(chatId);
      setMsgList(data);
      // console.log(data);
    } catch (error) {
      toast({
        title: "Unable to fetch messages",
        status: "error",
        description: error,
        duration: 5000,
        isClosable: true,
      });
    }
    setMsgLoading(false);
    socket.emit("join chatroom", selectChatUser._id);
    socket.on("joined chatroom", () => console.log("user joined chat"));
  };

  const sendMessageHandler = async () => {
    setSendMsgLoading(true);
    try {
      const config = {
        headers: {
          "Content-type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      };
      const { data } = await axios.post(
        "/api/message",
        {
          content: newMsg,
          chatId: selectChatUser?._id,
        },
        config
      );
      // const { data } = await sendMessage(newMsg, chatId);
      // need to update chat
      socket.emit("stop typing", selectChatUser._id);
      setNewMsg("");
      // console.log(data);
      setMsgList((prevState) => {
        return [...prevState, data];
      });
      msgRef.current?.focus();
      socket.emit("new message", data);
      setFetchAgain((prev) => !prev);
    } catch (error) {
      toast({
        title: "Unable to send message",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
    setSendMsgLoading(false);
  };

  return (
    <>
      {selectChatUser?._id ? (
        <>
          <Text
            fontSize={{ base: "28px", md: "30px" }}
            pb={3}
            px={2}
            w={"100%"}
            fontFamily={"Work sans"}
            alignItems={"center"}
            display={"flex"}
            justifyContent={"space-between"}
          >
            <IconButton
              display={{ base: "flex", md: "none" }}
              aria-label=""
              icon={<ArrowBackIcon />}
              onClick={() => setSelectChatUser(null)}
            />
            {selectChatUser.isGroupChat ? (
              <>
                {selectChatUser.chatName.toUpperCase()}
                <UpdateGroupChatModal setFetchAgain={setFetchAgain} />
              </>
            ) : (
              <>
                {getSender(user, selectChatUser.users)}
                <ProfileModal
                  ProfileModal
                  user={getSenderFull(user, selectChatUser.users)}
                ></ProfileModal>
              </>
            )}
          </Text>
          <Box
            display="flex"
            flexDir="column"
            justifyContent="flex-end"
            p={3}
            bg="#E8E8E8"
            w="100%"
            h="100%"
            borderRadius="lg"
            overflowY="hidden"
            // p={3}
            // position={"relative"}
            // h={"38rem"}
            // w={"100%"}
            // borderRadius={"lg"}
            // overflowY={"scroll"}
            // bg={"#E8E8E8"}
          >
            <Box
              // flex="1"
              overflowY="auto"
              // display="flex"
              // flexDirection="column-reverse"
              p={3}
            >
              {msgLoading ? (
                <Spinner size="xl" alignSelf={"center"} margin={"auto"} />
              ) : (
                // <div>Messages</div>
                <>
                  <ScrollableChat msgList={msgList} />
                  <div ref={bottomRef}></div>
                </>
              )}
            </Box>
            <FormControl
              // className="udit"
              style={{ position: "relative" }}
              position={"sticky"}
              // bottom={3}
              w={"99%"}
              onKeyDown={(e) => {
                if (e.key === "Enter") sendMessageHandler();
              }}
              isDisabled={sendMsgLoading}
              isRequired
              mt={3}
            >
              {isShowType ? (
                <div
                  // className="jangid"
                  style={{
                    position: "absolute",
                    top: "-40px",
                  }}
                >
                  <Lottie
                    options={{
                      loop: true,
                      autoplay: true,
                      animationData: animationData,
                      rendererSettings: {
                        preserveAspectRatio: "xMidYMid slice",
                      },
                    }}
                    width={70}
                    style={{ marginBottom: 15, marginLeft: 0 }}
                  />
                </div>
              ) : (
                <></>
              )}
              <Input
                ref={msgRef}
                variant="filled"
                placeholder="Enter a message ..."
                value={newMsg}
                onChange={(e) => {
                  // setNewMsg(e.target.value);
                  // if (!isSocketConnected) return;
                  // if (!isTyping) {
                  //   setTyping(true);
                  //   socket.emit("typing", selectChatUser._id);
                  // }
                  // const lastTypeTime = new Date().getTime();
                  // const timerlength = 3000;
                  // setTimeout(() => {
                  //   const timeNow = new Date().getTime();
                  //   const diff = timeNow - lastTypeTime;
                  //   if (diff >= timerlength && isTyping) {
                  //     socket.emit("stop typing", selectChatUser._id);
                  //     setTyping(false);
                  //   }
                  // }, timerlength);
                  setNewMsg(e.target.value);
                  if (!isSocketConnected) return;
                  if (!isTyping) {
                    setTyping(true);
                    socket.emit("typing", selectChatUser._id);
                  }
                  if (typingTimeoutRef.current) {
                    clearTimeout(typingTimeoutRef.current);
                  }
                  typingTimeoutRef.current = setTimeout(() => {
                    socket.emit("stop typing", selectChatUser._id);
                    setTyping(false);
                  }, 3000);
                }}
              ></Input>
            </FormControl>
          </Box>
        </>
      ) : (
        <Box display={"flex"} alignItems={"center"} h={"100%"}>
          <Text fontSize={"3xl"} pb={3} fontStyle={"Work sans"}>
            Click on user to start chatting
          </Text>
        </Box>
      )}
    </>
  );
};

export default SingleChat;
