import { View, Text, Button, ScrollView, StyleSheet } from "react-native";
import { WidgetStorage } from "expo-android-glance-widget";
import { useState } from "react";

export default function App() {
  const [refreshKey, setRefreshKey] = useState(0);

  // Force re-render to show updated data
  const refresh = () => {
    setRefreshKey((prev) => prev + 1);
    WidgetStorage.updateWidget("HomeReceiver");
  };

  const widgetMessage: string = WidgetStorage.get("widgetMessage") as string;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Widget Testing</Text>

      <Text style={styles.text}>{widgetMessage}</Text>
      <View style={styles.buttonContainer}>
        <Button
          title="Set Message"
          onPress={() => {
            WidgetStorage.set("widgetMessage", "Hello from the app!");
            refresh();
          }}
        />
        <Button
          title="Clear Message"
          onPress={() => {
            WidgetStorage.remove("widgetMessage");
            refresh();
          }}
        />
        <Button
          title="Refresh"
          onPress={() => {
            refresh();
          }}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
    marginTop: 40,
  },
  text: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
  },
  buttonContainer: {
    gap: 10,
  },
});
