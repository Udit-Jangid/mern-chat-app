export const getSender = (user, users) => {
  return users?.find((u) => u._id !== user._id)?.name;
};

export const getSenderFull = (user, users) => {
  return users?.find((u) => u._id !== user._id);
};

export const isSameSenderMsg = (msgList, index) => {
  if (
    index + 1 < msgList.length &&
    msgList[index].sender.email === msgList[index + 1].sender.email
  )
    return true;
  return false;
};

export const getToken = () => {
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  return userInfo.token;
};
