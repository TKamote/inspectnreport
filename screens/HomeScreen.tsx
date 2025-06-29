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
    padding: 20, // Increased from 15 to 20
    paddingTop: 40, // Added extra top padding
    backgroundColor: "#fff",
  },
  description: {
    fontSize: 19, // Increased from 18 to 19
    color: COLORS.MIDNIGHT,
    marginBottom: 25, // Increased from 20 to 25
    textAlign: "center",
  },
  templateOption: {
    padding: 16, // Increased from 12 to 16
    borderWidth: 1,
    borderColor: COLORS.BORDER,
    borderRadius: 5,
    marginBottom: 16, // Increased from 12 to 16
    backgroundColor: "#f9f9f9",
  },
  templateTitle: {
    fontSize: 17, // Increased from 16 to 17
    fontWeight: "bold",
    color: COLORS.MIDNIGHT,
    marginBottom: 8, // Increased from 5 to 8
  },
  templateDescription: {
    fontSize: 13, // Increased from 12 to 13
    color: COLORS.SPACE,
    lineHeight: 18, // Added line height for better readability
  },
});
