import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Platform,
  StatusBar as RNStatusBar, //ExpoのStatusBarと名前がかぶるのでリネーム
} from "react-native";
// サウンド再生のモジュールをimport
import { Audio } from "expo-av";
// ファイルをアセットとして読み込むモジュールをimport
import { Asset } from "expo-asset";
// 加速度検出のモジュールをimport
import { Accelerometer, ThreeAxisMeasurement } from "expo-sensors";

// androidのステータスバーの高さを取る
// iosだとcurrentHeightがnullになる
const statusBarHeight = Platform.OS === "ios" ? 0 : RNStatusBar.currentHeight;

export default function App() {
  // ジェダイになる ⇔ 戻る の切り替えのstate
  const [isRunning, setIsRunning] = useState(false);
  // 準備状態のstate
  const [isReady, setIsReady] = useState(false);
  // サウンドを保存するstate
  const [sound1, setSound1] = useState<Audio.Sound>();
  const [sound2, setSound2] = useState<Audio.Sound>();

  const initializeAsync = async () => {
    try {
      // サウンドを読み込む
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

      // 加速度センサーの読み取り間隔を設定する
      Accelerometer.setUpdateInterval(accInterval);

      // 準備完了
      setIsReady(true);
    } catch (error) {
      alert(error);
    }
  };

  // 画面表示時に実行する
  // 第2引数に空の配列を指定すると最初に1回だけ実行される。
  useEffect(() => {
    initializeAsync();
  }, []);

  // ボタンの処理にサウンド再生を追加
  const onPressButton = () => {
    setIsRunning(!isRunning);

    // 起動の時にサウンド1を再生
    if (!isRunning) {
      sound1?.replayAsync();
      // 加速度検出を有効にする
      Accelerometer.addListener(updateLightsaber);
    } else {
      // 加速度検出を無効にする
      Accelerometer.removeAllListeners();
    }
  };

  const accInterval = 100; //センサーの読み取り間隔(ms)
  const borderSpeed = 8; //スピードがこれを超えたら音を鳴らす
  // センサーを読み取ったときに行う処理
  const updateLightsaber = (accData: ThreeAxisMeasurement) => {
    // 各角度への合計速度を取得
    const x = accData.x;
    const y = accData.y;
    const z = accData.z;

    // 検出した値をすべてプラスにして合計する
    const synthetic = x * x + y * y + z * z;

    // 一定以上の速度になったら音を鳴らす
    if (synthetic >= borderSpeed) {
      sound2?.replayAsync();
    }
  };

  const JediButton = () => {
    return (
      <TouchableOpacity style={styles.button} onPress={onPressButton}>
        <Text style={styles.buttonText}>
          {/* ture=戻る false=ジェダイになる  falseが初期値なのでこう書いているが、!付けずに?で false=戻るで作っても良い*/}
          {!isRunning ? "ジェダイになる" : "戻る"}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <JediButton />
      {/* 背景が黒いのでステータスバーを明るくする */}
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
