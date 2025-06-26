import React, { useState, useLayoutEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../theme/theme";
import { FONTS } from "../theme/theme";

export default function HomeScreen() {
  const navigation = useNavigation<any>();

  // Update the useLayoutEffect hook
  useLayoutEffect(() => {
    navigation.setOptions({
      // Custom header title with logo
      headerTitle: () => (
        <View style={{ 
          flexDirection: 'row', 
          alignItems: 'center',
          marginLeft: -15, // Pull the entire title component slightly to the left
        }}>
          <Image 
            source={require('../assets/favicon.png')} 
            style={{ 
              width: 26, 
              height: 26, 
              marginRight: 2 // Space between icon and text
            }}
            resizeMode="contain"
          />
          <Text style={{ 
            color: '#fff', 
            fontSize: 18, 
            fontWeight: 'bold' 
          }}>
            PDF Report Maker
          </Text>
        </View>
      ),
      // Remove headerLeft as we're now including the icon directly in the title
      headerLeft: () => null
    });
  }, [navigation]);

  // Function to navigate to input screen
  const navigateToTemplate = (template: string) => {
    navigation.navigate("Input", { template });
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.description}>
        Choose a template to create your report:
      </Text>

      {/* Template options */}
      <TouchableOpacity
        style={styles.templateOption}
        onPress={() => navigateToTemplate("A4Portrait2x2")}
      >
        <Text style={styles.templateTitle}>A4 Portrait 2x2</Text>
        <Text style={styles.templateDescription}>
          4 sections per page, each with 2 field inputs and a photo
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.templateOption}
        onPress={() => navigateToTemplate("A4Portrait2x3")}
      >
        <Text style={styles.templateTitle}>A4 Portrait 2x3</Text>
        <Text style={styles.templateDescription}>
          6 sections per page, each with 2 field inputs and a photo
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.templateOption}
        onPress={() => navigateToTemplate("A4Landscape3x2")}
      >
        <Text style={styles.templateTitle}>A4 Landscape 3x2</Text>
        <Text style={styles.templateDescription}>
          6 sections per page, each with 2 field inputs and a photo
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.templateOption}
        onPress={() => navigateToTemplate("A4Landscape4x2")}
      >
        <Text style={styles.templateTitle}>A4 Landscape 4x2</Text>
        <Text style={styles.templateDescription}>
          8 sections per page, each with 2 field inputs and a photo
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.templateOption}
        onPress={() => navigateToTemplate("A4Landscape5x2")}
      >
        <Text style={styles.templateTitle}>A4 Landscape 5x2</Text>
        <Text style={styles.templateDescription}>
          10 sections per page, each with 2 field inputs and a photo
        </Text>
      </TouchableOpacity>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: "#fff",
  },
  description: {
    fontSize: 18,
    color: COLORS.MIDNIGHT,
    marginBottom: 20,
    textAlign: "center",
  },
  templateOption: {
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: 5,
    marginBottom: 12,
    backgroundColor: "#f9f9f9",
  },
  templateTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.MIDNIGHT,
    marginBottom: 5,
  },
  templateDescription: {
    fontSize: 12,
    color: COLORS.SPACE,
  },
});
