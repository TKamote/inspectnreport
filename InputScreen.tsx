import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, TextInput, Image, ScrollView, TouchableOpacity } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { ActionSheetIOS } from "react-native";

export default function InputScreen({ route }: { route: any }) {
  const { template } = route.params; // Get the selected template
  const [cards, setCards] = useState<any[]>([]); // Array to store card data

  // Request permissions on component mount
  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== "granted") {
        alert("Sorry, we need camera permissions to make this work!");
      }
    })();
  }, []);

  // Function to add a new card
  const addCard = () => {
    setCards([...cards, { location: "", observations: "", photo: null }]);
  };

  // Function to update card data
  const updateCard = (index: number, field: string, value: string | null) => {
    const updatedCards = [...cards];
    updatedCards[index][field] = value;
    setCards(updatedCards);
  };

  // Function to handle photo selection
  const handlePhotoSelection = async (index: number) => {
    ActionSheetIOS.showActionSheetWithOptions(
      {
        options: ["Take Photo", "Choose from Gallery", "Cancel"],
        cancelButtonIndex: 2,
      },
      async (buttonIndex) => {
        if (buttonIndex === 0) {
          // Take a photo
          const cameraResult = await ImagePicker.launchCameraAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images, // Use MediaTypeOptions.Images
            allowsEditing: true,
            quality: 1,
          });

          if (!cameraResult.canceled && cameraResult.assets && cameraResult.assets.length > 0) {
            updateCard(index, "photo", cameraResult.assets[0].uri);
          } else {
            alert("No photo was taken.");
          }
        } else if (buttonIndex === 1) {
          // Choose from gallery
          const galleryResult = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ImagePicker.MediaTypeOptions.Images, // Use MediaTypeOptions.Images
            allowsEditing: true,
            quality: 1,
          });

          if (!galleryResult.canceled && galleryResult.assets && galleryResult.assets.length > 0) {
            updateCard(index, "photo", galleryResult.assets[0].uri);
          } else {
            alert("No photo was selected.");
          }
        }
      }
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Template: {template}</Text>

      {/* Render Cards */}
      {cards.map((card, index) => (
        <View key={index} style={styles.card}>
          <TextInput
            style={styles.input}
            placeholder="Location"
            value={card.location}
            onChangeText={(text) => updateCard(index, "location", text)}
          />
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Observations"
            value={card.observations}
            onChangeText={(text) => updateCard(index, "observations", text)}
            multiline
          />
          <TouchableOpacity
            style={styles.photoButton}
            onPress={() => handlePhotoSelection(index)}
          >
            <Ionicons name="camera-outline" size={20} color="#fff" style={styles.photoIcon} />
            <Text style={styles.photoButtonText}>Photo</Text>
          </TouchableOpacity>
          {card.photo && (
            <View style={styles.imageContainer}>
              <Image source={{ uri: card.photo }} style={styles.image} />
            </View>
          )}
        </View>
      ))}

      {/* Add Card Button */}
      <TouchableOpacity style={styles.addButton} onPress={addCard}>
        <Ionicons name="add-circle-outline" size={20} color="#fff" style={styles.addIcon} />
        <Text style={styles.addButtonText}>ADD</Text>
      </TouchableOpacity>

      {/* Generate PDF Button */}
      <TouchableOpacity style={styles.pdfButton} onPress={() => alert("PDF generation coming soon!")}>
        <Ionicons name="download-outline" size={20} color="#fff" style={styles.pdfIcon} />
        <Text style={styles.pdfButtonText}>PDF</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  card: {
    marginBottom: 20,
    padding: 15,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    backgroundColor: "#f9f9f9",
  },
  input: {
    width: "100%",
    height: 40,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  textArea: {
    height: 80,
  },
  imageContainer: {
    justifyContent: "center", // Center vertically
    alignItems: "center", // Center horizontally
    marginTop: 10,
  },
  image: {
    width: 200, // Set a fixed width
    height: 200, // Set a fixed height
    borderRadius: 10,
  },
  photoButton: {
    flexDirection: "row",
    alignItems: "center", // Center content vertically
    justifyContent: "center", // Center content horizontally
    backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    width: 200, // Match the width of the photo
    alignSelf: "center", // Center the button horizontally
  },
  photoButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 8,
  },
  photoIcon: {
    marginRight: 5,
  },
  addButton: {
    backgroundColor: "#007BFF",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "center",
  },
  addButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 8,
  },
  addIcon: {
    marginRight: 5,
    fontWeight: "bold",
    color: "#fff",
  },
  pdfButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#28a745",
    padding: 15,
    borderRadius: 5,
    marginBottom: 20,
  },
  pdfButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    marginLeft: 10,
  },
  pdfIcon: {
    marginRight: 5,
    fontWeight: "bold",
    color: "#fff",
  },
});