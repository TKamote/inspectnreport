import React from "react";
import { StyleSheet, Text, View, FlatList, TouchableOpacity } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import InputScreen from "./InputScreen"; // Import the InputScreen

const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="Input" component={InputScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const HomeScreen = ({ navigation }: { navigation: any }) => {
  const templates = [
    { id: "1", name: "A4 Portrait (2x2)" },
    { id: "2", name: "A4 Portrait (2x3)" },
    { id: "3", name: "A4 Landscape (3x2)" },
    { id: "4", name: "A4 Landscape (4x2)" },
    { id: "5", name: "A4 Landscape (5x3)" },
    { id: "6", name: "A4 Portrait (4x6)" },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select a Template</Text>
      <FlatList
        data={templates}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.templateButton}
            onPress={() => navigation.navigate("Input", { template: item.name })}
          >
            <Text style={styles.templateText}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
  },
  templateButton: {
    width: "100%",
    padding: 15,
    backgroundColor: "#f0f0f0",
    borderRadius: 5,
    marginBottom: 10,
    alignItems: "center",
  },
  templateText: {
    fontSize: 18,
    fontWeight: "500",
  },
});
