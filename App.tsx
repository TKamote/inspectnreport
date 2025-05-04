import React from "react";
import {
  StyleSheet,
  Text,
  View,
  FlatList,
  TouchableOpacity,
} from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import InputScreen from "./screens/InputScreen"; // Import the InputScreen
import * as Linking from "expo-linking"; // Import Linking to open the PDF

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
    { id: "1", name: "A4 Portrait (2x2)", value: "A4Portrait2x2" },
    { id: "2", name: "A4 Portrait (2x3)", value: "A4Portrait2x3" },
    { id: "3", name: "A4 Landscape (3x2)", value: "A4Landscape3x2" },
    { id: "4", name: "A4 Landscape (4x2)", value: "A4Landscape4x2" },
    { id: "5", name: "A4 Landscape (5x3)", value: "A4Landscape5x3" },
    { id: "6", name: "A4 Portrait (4x6)", value: "A4Portrait4x6" },
  ];

  const openSamplePDF = () => {
    const pdfUrl = "https://example.com/sample-templates.pdf"; // Replace with your actual PDF URL
    Linking.openURL(pdfUrl); // Open the PDF in the default browser
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select a Template</Text>
      <FlatList
        data={templates}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.templateButton}
            onPress={() =>
              navigation.navigate("Input", { template: item.value })
            }
          >
            <Text style={styles.templateText}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />

      {/* Sample PDF Button */}
      <TouchableOpacity style={styles.sampleButton} onPress={openSamplePDF}>
        <Text style={styles.sampleButtonText}>View Sample PDFs</Text>
      </TouchableOpacity>
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
    fontSize: 18,
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
    fontSize: 16,
    fontWeight: "500",
  },
  sampleButton: {
    marginTop: 20,
    padding: 15,
    backgroundColor: "#007BFF",
    borderRadius: 5,
    alignItems: "center",
    width: "100%",
  },
  sampleButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
