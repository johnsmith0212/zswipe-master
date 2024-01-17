import {
    Button,
    Input,
  } from "@chakra-ui/react";
  import React from "react";
  import ChatContent from "./ChatContent";
  import {
    AiOutlinePicture,
    AiOutlinePaperClip,
    AiOutlineEye,
    AiOutlineClockCircle,
  } from "react-icons/ai";
  import { BsEmojiSmile } from "react-icons/bs";
  import { IoSend } from "react-icons/io5";
  import { Client } from "@xmtp/xmtp-js";
  import { ethers } from "ethers";
  import { useEffect } from "react";
  import { useState } from "react";
  import abi from "./abi/SuperliveAbi.json";
  import Stats from "./Stats";
  import moment from 'moment';
  
  window.Buffer =
    window.Buffer ||
    require("buffer").Buffer;
  
  function Chats({
    streamId,
    streamData,
    walletAddress
  }) {
    const [messages, setMessages] =
      useState("");
    const [chats, setChats] = useState(
      []
    );
  
    const Provider =
      new ethers.providers.Web3Provider(
        window.ethereum
      );
  
    const signer = Provider.getSigner();
  
    const SuperLiveContract =
      new ethers.Contract(
        process.env.REACT_APP_F5LABS_LIVE_PEER_SMART_CONTRACT_ADDRESS,
        abi,
        signer
      );
  
    useEffect(() => {
      setInterval(() => {
        getExistingMessages(streamId);
        getNumbersOfJoinees(
          streamId,
          SuperLiveContract,
          walletAddress
        );
      }, 1000);
    }, [streamId]);
  
    async function getChatroomClient(
      stream_id
    ) {
      const pk = ethers.utils.keccak256(
        ethers.utils.toUtf8Bytes(
          stream_id
        )
      );
      const wallet = new ethers.Wallet(
        pk
      );
      const client = await Client.create(
        wallet
      );
      return client;
    }
    async function getUserChatClient(
      provider
    ) {
      // provider is the web3 metamask provider of the user
      const signer = provider.getSigner();
      const client = await Client.create(
        signer
      );
      return client;
    }
    const [views, setViews] =
      useState("0");
  
    const [expenses, setExpenses] = 
      useState("0.00");
  
    const [earnings, setEarnings] = 
      useState("0.00");
    
    const [startEpoch, setStartEpoch] = 
      useState("00:00");
  
    async function getNumbersOfJoinees(
      streamid,
      contract,
      walletAddress
    ) {
      let getnumbersOfJoinees =
        await contract.numJoinees(
          streamid
        );
      
      let providerSigner = await Provider.getSigner();
      let address = await providerSigner.getAddress();
      
      if (streamid) {
        let streamData = await contract.getStreamData(streamid);
        let ts = streamData.start_time.toNumber();
        let current = moment().format("X");
        let secondsElapsed = current - ts;
        setStartEpoch(moment.duration(secondsElapsed, "seconds").format("hh:mm:ss"));
  
        let moneyStat = "0.0";
        if (address) {
          let expenses = await contract.expenditureSoFar(streamid, address);
          expenses = ethers.utils.formatEther(expenses);
          let earnings = await contract.earningSoFar(streamid);
          earnings = ethers.utils.formatEther(earnings);
          {
            if (address == streamData.owner) {
              moneyStat = earnings;
            } else {
              moneyStat = expenses;
            }
          // console.log("Expenses are:", expenses);
          setExpenses(moneyStat.slice(0, 5));
        }}
        // console.log(
        //   getnumbersOfJoinees?.toString()
        // );
        setViews(
          getnumbersOfJoinees?.toString()
        );
            
        
      }
    }
  
    const getExistingMessages = async (
      stream_id
    ) => {
      const chatroomClient =
        await getChatroomClient(
          stream_id
        );
      let existingConversations =
        await chatroomClient.conversations.list();
      let allMessages = [];
      for (const conversation of existingConversations) {
        const messagesInConversation =
          await conversation.messages();
        allMessages = allMessages.concat(
          messagesInConversation
        );
      }
      allMessages.sort((a, b) =>
        a.sent.getTime() >
        b.sent.getTime()
          ? 1
          : -1
      );
  
      let messages = [];
  
      // This all messages is the thing, the info we need are stored in .sent, .senderAddress, and .content fields
      for (let message of allMessages) {
        //let messageString = `${message.sent} : ${message.senderAddress} : ${message.content}`;
        let conversation = {
          timestamp: `${message.sent}`,
          senderAddress:
            message.senderAddress,
          content: message.content,
        };
        messages.push(conversation);
        setChats(messages);
      }
      existingConversations =
        await chatroomClient.conversations.list();
    };
  
    const sendMessage = async (
      provider,
      stream_id
    ) => {
      const chatroomClient =
        await getChatroomClient(
          stream_id
        );
      const chatRoomAddress =
        chatroomClient.address;
      const userClient =
        await getUserChatClient(provider);
      const conversation =
        await userClient.conversations.newConversation(
          chatRoomAddress
        );
      let message = `${messages}`;
      await conversation.send(message);
    };
  
    return (
      <div className="flex-[0.3]">
        <Stats views={views} expenses={expenses} startEpoch={startEpoch} earnings={earnings}/>
        <div className="overflow-y-scroll h-[51%] bg-[#333333] rounded-lg p-2 no-scrollbar space-y-3 fixed top-48 mr-4 w-[29.5%]">
          {chats?.length === 0 ? (
            <div className="mx-auto flex justify-center items-center h-full max-w-full text-white font-extrabold text-xl">
              No Chat
            </div>
          ) : (
            <>
              {chats?.map((chat, i) => (
                <ChatContent
                  key={i}
                  message={chat?.content}
                  id={i}
                  send={chat?.timestamp}
                  senderAddress={
                    chat?.senderAddress
                  }
                  ownerAddress={
                    streamData?.owner
                  }
                />
              ))}
            </>
          )}
        </div>
        <div className="z-[9999] bg-[#333333] p-2 fixed bottom-0 w-[29.3%] rounded-t-lg">
          <Input
            size="lg"
            variant="filled"
            placeholder="Type message..."
            className="mt-2"
            type="text"
            onChange={(e) => {
              setMessages(e.target.value);
            }}
          />
          <div className="flex items-center justify-between mb-2 mt-2">
            <div className="flex space-x-5 text-xl text-white">
              <div className="flex space-x-2">
                <AiOutlinePicture className="transition-all duration-300 ease-linear hover:text-pink-400 hover:cursor-pointer" />
                <AiOutlinePaperClip className="transition-all duration-300 ease-linear hover:text-green-500 hover:cursor-pointer" />
              </div>
              <BsEmojiSmile className="transition-all duration-300 ease-linear hover:text-yellow-600 hover:cursor-pointer" />
            </div>
            <Button
              rightIcon={<IoSend />}
              bg="#246BFD"
              color="#ffffff"
              className="hover:text-black disabled:cursor-not-allowed"
              disabled={messages === ""}
              onClick={() => {
                sendMessage(
                  Provider,
                  streamId
                );
              }}
            >
              Send
            </Button>
          </div>
        </div>
      </div>
    );
  }
  
  export default Chats;
  