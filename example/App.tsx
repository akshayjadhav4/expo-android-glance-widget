import { View, Text, Button, ScrollView, StyleSheet } from "react-native";
import { WidgetStorage } from "expo-android-glance-widget";
import { useState } from "react";

export default function App() {
  const [refreshKey, setRefreshKey] = useState(0);

  // Force re-render to show updated data
  const refresh = () => setRefreshKey((prev) => prev + 1);

  // Get all stored data
  const stringData = WidgetStorage.get("test_string");
  const booleanData = WidgetStorage.get("test_boolean");
  const numberData = WidgetStorage.get("test_number");
  const floatData = WidgetStorage.get("test_float");
  const arrayData = WidgetStorage.get("test_array");
  const objectData = WidgetStorage.get("test_object");
  const objectArrayData = WidgetStorage.get("test_object_array");

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>WidgetStorage Testing</Text>

      {/* String Tests */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>String</Text>
        <Button
          title="Set String"
          onPress={() => {
            WidgetStorage.set("test_string", "Hello World!");
            refresh();
          }}
        />
        <Text style={styles.result}>Value: {JSON.stringify(stringData)}</Text>
      </View>

      {/* Boolean Tests */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Boolean</Text>
        <Button
          title="Set Boolean (true)"
          onPress={() => {
            WidgetStorage.set("test_boolean", true);
            refresh();
          }}
        />
        <Text style={styles.result}>Value: {JSON.stringify(booleanData)}</Text>
      </View>

      {/* Number Tests */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Number (Integer)</Text>
        <Button
          title="Set Number (42)"
          onPress={() => {
            WidgetStorage.set("test_number", 42);
            refresh();
          }}
        />
        <Text style={styles.result}>Value: {JSON.stringify(numberData)}</Text>
      </View>

      {/* Float Tests */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Number (Float)</Text>
        <Button
          title="Set Float (3.14)"
          onPress={() => {
            WidgetStorage.set("test_float", 3.14);
            refresh();
          }}
        />
        <Text style={styles.result}>Value: {JSON.stringify(floatData)}</Text>
      </View>

      {/* Array Tests */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>String Array</Text>
        <Button
          title="Set String Array"
          onPress={() => {
            WidgetStorage.set("test_array", ["red", "green", "blue"]);
            refresh();
          }}
        />
        <Text style={styles.result}>Value: {JSON.stringify(arrayData)}</Text>
      </View>

      {/* Object Tests */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Object</Text>
        <Button
          title="Set Object"
          onPress={() => {
            WidgetStorage.set("test_object", {
              name: "John",
              age: 30,
              score: 1250,
            });
            refresh();
          }}
        />
        <Text style={styles.result}>Value: {JSON.stringify(objectData)}</Text>
      </View>

      {/* Object Array Tests */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Object Array</Text>
        <Button
          title="Set Object Array"
          onPress={() => {
            WidgetStorage.set("test_object_array", [
              { name: "John", age: 30, score: 1000 },
              { name: "Jane", age: 25, score: 1500 },
              { name: "Bob", age: 35, score: 800 },
            ]);
            refresh();
          }}
        />
        <Text style={styles.result}>
          Value: {JSON.stringify(objectArrayData, null, 2)}
        </Text>
      </View>

      {/* Utility Tests */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Utility Functions</Text>
        <Button
          title="Get All Keys"
          onPress={() => {
            const keys = WidgetStorage.getAllKeys();
            console.log("All keys:", keys);
            alert(`All keys: ${JSON.stringify(keys)}`);
          }}
        />
        <Button
          title="Check if 'test_string' exists"
          onPress={() => {
            const exists = WidgetStorage.has("test_string");
            alert(`Key exists: ${exists}`);
          }}
        />
        <Button
          title="Clear All Data"
          color="red"
          onPress={() => {
            WidgetStorage.clear();
            refresh();
          }}
        />
      </View>

      {/* Remove Tests */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Remove Tests</Text>
        <Button
          title="Remove String"
          color="orange"
          onPress={() => {
            WidgetStorage.remove("test_string");
            refresh();
          }}
        />
        <Button
          title="Remove Object Array"
          color="orange"
          onPress={() => {
            WidgetStorage.remove("test_object_array");
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
  section: {
    marginBottom: 20,
    padding: 15,
    backgroundColor: "#f5f5f5",
    borderRadius: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#333",
  },
  result: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#e8e8e8",
    borderRadius: 4,
    fontFamily: "monospace",
    fontSize: 12,
  },
});
