// @refresh reset
import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  LogBox,
  TextInput,
  Button,
} from "react-native";
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

export default function App() {
  const [user, setUser] = useState(null);
  const [name, setName] = useState("");

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

  useEffect(() => {
    readUserFunction();
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
    <View style={styles.startingScreen}>
      <Text>Welcome {user.name}</Text>
      <StatusBar style="auto" />
    </View>
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
