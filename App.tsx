import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Platform,
  StatusBar as RNStatusBar,
} from "react-native";
import { Audio } from "expo-av";
import { Asset } from "expo-asset";
import { Accelerometer, ThreeAxisMeasurement } from "expo-sensors";

const statusBarHeight = Platform.OS === "ios" ? 0 : RNStatusBar.currentHeight;

export default function App() {
  const [isRunning, setIsRunning] = useState(false);
  const [isReady, setIsReady] = useState(false);
  const [sound1, setSound1] = useState<Audio.Sound>();
  const [sound2, setSound2] = useState<Audio.Sound>();

  const initializeAsync = async () => {
    try {
      const newSound1 = new Audio.Sound();
      const sound1Asset = Asset.fromModule(
        require("./assets/light_saber1.mp3")
      );
      await newSound1.loadAsync(sound1Asset);
      setSound1(newSound1);

      const newSound2 = new Audio.Sound();
      const sound2Asset = Asset.fromModule(
        require("./assets/light_saber3.mp3")
      );
      await newSound2.loadAsync(sound2Asset);
      setSound2(newSound2);
      Accelerometer.setUpdateInterval(accInterval);
      setIsReady(true);
    } catch (error) {
      alert(error);
    }
  };

  useEffect(() => {
    initializeAsync();
  }, []);

  const onPressButton = () => {
    setIsRunning(!isRunning);

    if (!isRunning) {
      sound1?.replayAsync();
      Accelerometer.addListener(updateLightsaber);
    } else {
      Accelerometer.removeAllListeners();
    }
  };

  const accInterval = 100;
  const borderSpeed = 8;
  const updateLightsaber = (accData: ThreeAxisMeasurement) => {
    const x = accData.x;
    const y = accData.y;
    const z = accData.z;
    const synthetic = x * x + y * y + z * z;

    if (synthetic >= borderSpeed) {
      sound2?.replayAsync();
    }
  };

  const JediButton = () => {
    return (
      <TouchableOpacity style={styles.button} onPress={onPressButton}>
        <Text style={styles.buttonText}>
          {!isRunning ? "ジェダイになる" : "戻る"}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <JediButton />
      <StatusBar style="light" />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: statusBarHeight,
  },
  button: {
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "white",
    borderRadius: 30,
    borderWidth: 3,
    borderColor: "blue",
    width: "80%",
    height: 80,
  },
  buttonText: {
    fontSize: 35,
    textAlign: "center",
  },
  loadingText: {
    fontSize: 35,
    fontWeight: "bold",
    textAlign: "center",
    color: "white",
  },
});
