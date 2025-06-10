import { View, Text, Button } from "react-native";
import { WidgetStorage } from "expo-android-glance-widget";
export default function App() {
  const data = WidgetStorage.get("home_widget");

  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "white",
      }}
    >
      <Text>Hello World</Text>
      <Button
        title="Set Widget Data"
        onPress={() => {
          WidgetStorage.set("home_widget", "Hello World");
        }}
      />
      <Button
        title="Remove Widget Data"
        onPress={() => {
          WidgetStorage.remove("home_widget");
        }}
      />
      <Text>{data}</Text>
    </View>
  );
}
