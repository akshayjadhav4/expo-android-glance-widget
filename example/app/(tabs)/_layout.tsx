import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { Tabs } from "expo-router";

export default function TabLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="index"
        options={{
          title: "Shared Preferences",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="storage" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="mmkv"
        options={{
          title: "MMKV",
          headerShown: true,
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="memory" size={24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="storage-test"
        options={{
          title: "Storage Test",
          tabBarIcon: ({ color }) => (
            <MaterialIcons name="code" size={24} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
