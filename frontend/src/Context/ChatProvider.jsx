import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCookies } from "react-cookie";

const ChatContext = createContext({
  user: { name: "", email: "", pic: "" },
  setUser: null,
  selectChatUser: {
    _id: "",
    chatName: "",
    isGroupChat: false,
    users: [],
    groupAdmin: {
      email: "",
      name: "",
      _id: "",
    },
  },
  setSelectChatUser: null,
  chats: [],
  setChats: null,
});

const ChatProvider = ({ children }) => {
  const [user, setUser] = useState();
  const [selectChatUser, setSelectChatUser] = useState({
    _id: "",
    chatName: "",
    isGroupChat: false,
    users: [],
    groupAdmin: {
      email: "",
      name: "",
      _id: "",
    },
  });
  const [chats, setChats] = useState([]);
  const [notification, setNotification] = useState([]);

  const [cookie] = useCookies(["verify_token"]);

  const navigate = useNavigate();

  useEffect(() => {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));
    // setUser(userInfo);
    if (userInfo) {
      setUser(userInfo);
      // console.log("UserInfo ::::: ", userInfo);

      const { verify_token } = cookie;
    } else {
      navigate("/");
    }
    // if (!userInfo) {
    //   navigate("/");
    // }
  }, [cookie, navigate]);

  return (
    <ChatContext.Provider
      value={{
        user,
        setUser,
        selectChatUser,
        setSelectChatUser,
        chats,
        setChats,
        notification,
        setNotification,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChatState = () => {
  return useContext(ChatContext);
};

export default ChatProvider;
