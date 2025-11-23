import { Route, Routes } from "react-router-dom";
import "./App.css";
import { Button, HStack } from "@chakra-ui/react";
import Homepage from "./Pages/HomePage";
import Chatpage from "./Pages/ChatPage";

function App() {
  return (
    <>
      <div className="App">
        <Routes>
          <Route path="/" Component={Homepage} exact />
          <Route path="/chats" Component={Chatpage} />
        </Routes>
      </div>
    </>
  );
}

export default App;
