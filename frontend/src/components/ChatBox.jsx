import { useChatState } from "@/Context/ChatProvider";
import { Box } from "@chakra-ui/react";
import React from "react";
import SingleChat from "./SingleChat";

const ChatBox = ({ setFetchAgain }) => {
  const { selectChatUser } = useChatState();
  return (
    <Box
      display={{ base: selectChatUser?._id ? "flex" : "none", md: "flex" }}
      flexDirection={"column"}
      alignItems={"center"}
      p={3}
      bg={"white"}
      borderRadius={"lg"}
      borderWidth={"1px"}
      width={{ base: "100%", md: "68%" }}
    >
      <SingleChat setFetchAgain={setFetchAgain} />
    </Box>
  );
};

export default ChatBox;
