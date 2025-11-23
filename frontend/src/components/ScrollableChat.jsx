import { useChatState } from "@/Context/ChatProvider";
import { isSameSenderMsg } from "@/utils/chatUtil";
import { Avatar, Box, Text, Tooltip } from "@chakra-ui/react";
import React from "react";

export const Message = ({
  msg,
  isSender = false,
  padding,
  ml = "",
  createdAt,
}) => {
  return (
    <Box
      display="flex"
      p={padding}
      ml={ml}
      justifyContent={isSender ? "flex-end" : "flex-start"}
      borderRadius="lg"
      borderWidth="1px"
    >
      <Box
        fontSize="1xl"
        fontFamily="Work sans"
        p={"5px"}
        borderRadius={isSender ? "10px 0px 5px 10px" : "0px 10px 10px 5px"}
        bg={isSender ? "lightblue" : "lightgreen"}
        style={{ position: "relative", minWidth: "60px", minHeight: "40px" }}
      >
        {msg}
        <Text
          style={{
            fontSize: "10px",
            position: "absolute",
            bottom: "0px",
            right: "4px",
            fontWeight: "lighter",
          }}
        >
          {new Date(createdAt).toLocaleTimeString("en-IN", {
            timeZone: "Asia/Kolkata",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })}
        </Text>
      </Box>
    </Box>
  );
};

const ScrollableChat = ({ msgList }) => {
  const { user } = useChatState();
  return (
    <>
      {msgList.map(({ content, updatedAt, createdAt, sender, _id }, index) => {
        const isSender = sender?.email === user.email;
        const isMsgGroup = isSameSenderMsg(msgList, index);
        if (isMsgGroup || isSender)
          return (
            <Message
              ml={isSender ? "0" : "2rem"}
              key={_id}
              msg={content}
              isSender={isSender}
              createdAt={createdAt}
              padding={isMsgGroup ? "0px 10px 5px 10px" : "0px 10px 10px 10px"}
            />
          );
        return (
          <Box display="flex" w="fit-content" key={_id}>
            <Tooltip label={sender.name} hasArrow placement="bottom">
              <Avatar
                size="sm"
                cursor="pointer"
                name={sender.name}
                src={sender.pic}
              />
            </Tooltip>
            <Message
              // key={_id}
              msg={content}
              isSender={isSender}
              createdAt={createdAt}
              padding={isMsgGroup ? "0px 10px 5px 10px" : "0px 10px 10px 10px"}
            />
          </Box>
        );
      })}
    </>
  );
};

export default ScrollableChat;
