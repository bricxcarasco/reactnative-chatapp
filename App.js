// @refresh reset
import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  LogBox,
  TextInput,
  Button,
} from "react-native";
import { GiftedChat } from "react-native-gifted-chat";
import AsyncStorage from "@react-native-community/async-storage";
import * as firebase from "firebase";
import "firebase/firestore";

import Config from "./app/config/keys";

const firebaseConfig = {
  apiKey: Config.FIREBASE_API_KEY,
  authDomain: Config.FIREBASE_AUTH_DOMAIN,
  databaseURL: Config.FIREBASE_DATABASE_URL,
  projectId: Config.FIREBASE_PROJECT_ID,
  storageBucket: Config.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: Config.FIREBASE_MESSAGING_SENDER_ID,
  appId: Config.FIREBASE_APP_ID,
};

if (firebase.apps.length === 0) {
  firebase.initializeApp(firebaseConfig);
}

LogBox.ignoreLogs(["Setting a timer for a long period of time"]);

const db = firebase.firestore();
const chatsRef = db.collection("chats");

export default function App() {
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");
  const [messages, setMessages] = useState([]);

  const readUserFunction = async () => {
    const user = await AsyncStorage.getItem("user");
    if (user) {
      setUser(JSON.parse(user));
    }
  };

  const enterChatHandler = async () => {
    const _id = Math.random().toString(36).substring(7);
    const user = {
      _id,
      name,
    };
    await AsyncStorage.setItem("user", JSON.stringify(user));
    setUser(user);
  };

  const sendMessageHandler = async (messages) => {
    const writes = messages.map((message) => chatsRef.add(message));
    await Promise.all(writes);
  };

  const appendMessages = useCallback(
    (messages) => {
      setMessages((previousMessages) =>
        GiftedChat.append(previousMessages, messages)
      );
    },
    [messages]
  );

  useEffect(() => {
    readUserFunction();
    const unsubscribe = chatsRef.onSnapshot((querySnapshot) => {
      const messageFirestore = querySnapshot
        .docChanges()
        .filter(({ type }) => type === "added")
        .map(({ doc }) => {
          const message = doc.data();
          return { ...message, createdAt: message.createdAt.toDate() };
        })
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      appendMessages(messageFirestore);
    });
    return () => unsubscribe();
  }, []);

  if (!user) {
    return (
      <View style={styles.startingScreen}>
        <TextInput
          style={styles.inputName}
          placeholder="Enter your name..."
          value={name}
          onChangeText={setName}
        />
        <Button title="Enter the chat" onPress={enterChatHandler} />
      </View>
    );
  }

  return (
    <GiftedChat messages={messages} user={user} onSend={sendMessageHandler} />
  );
}

const styles = StyleSheet.create({
  startingScreen: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    padding: 30,
  },
  inputName: {
    height: 50,
    width: "100%",
    borderWidth: 1,
    padding: 15,
    marginBottom: 20,
    borderColor: "gray",
  },
});
