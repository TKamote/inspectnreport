import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  View,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons"; // Import Ionicons for icons
import * as ImagePicker from "expo-image-picker"; // Import ImagePicker
import HeaderFooter from "../components/HeaderFooter";
import { HeaderData, SetHeaderData } from "../types/types"; // Import the types

export default function InputScreen({ route }: { route: any }) {
  const { template } = route.params;

  const [headerData, setHeaderData] = useState<HeaderData>({
    company: "",
    createdBy: "",
    contact: "",
    reportFor: "",
    typeOfReport: "",
    date: "",
  });

  const [cards, setCards] = useState<any[]>([
    { location: "", observations: "", photo: null, timestamp: null },
  ]);

  const [isModalVisible, setModalVisible] = useState(false); // State for modal visibility

  const updateHeaderData: SetHeaderData = (field, value) => {
    setHeaderData((prev) => ({ ...prev, [field]: value }));
  };

  const addCard = () => {
    setCards([
      ...cards,
      { location: "", observations: "", photo: null, timestamp: null },
    ]);
  };

  const updateCard = (index: number, field: string, value: string | null) => {
    const updatedCards = [...cards];
    updatedCards[index][field] = value;
    setCards(updatedCards);
  };

  const handlePhotoSelection = async (index: number) => {
    Alert.alert(
      "Add Photo",
      "Choose an option",
      [
        {
          text: "Take Photo",
          onPress: async () => {
            const result = await ImagePicker.launchCameraAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              quality: 1,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
              const timestamp = new Date().toLocaleString(); // Generate timestamp
              updateCard(index, "photo", result.assets[0].uri);
              updateCard(index, "timestamp", timestamp);
            }
          },
        },
        {
          text: "Choose from Gallery",
          onPress: async () => {
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              quality: 1,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
              const timestamp = new Date().toLocaleString(); // Generate timestamp
              updateCard(index, "photo", result.assets[0].uri);
              updateCard(index, "timestamp", timestamp);
            }
          },
        },
        { text: "Cancel", style: "cancel" },
      ],
      { cancelable: true }
    );
  };

  const handleGeneratePDF = () => {
    Alert.alert(
      "Add Header and Footer?",
      "Do you want to fill in the header and footer before generating the PDF?",
      [
        {
          text: "Yes",
          onPress: () => setModalVisible(true), // Show the modal
        },
        {
          text: "No",
          onPress: () => {
            // Proceed to generate the PDF with default or empty header/footer
            alert("Generate PDF with default header/footer");
          },
        },
      ]
    );
  };

  const closeModalAndGeneratePDF = () => {
    setModalVisible(false);
    alert(`Generating PDF with header: ${JSON.stringify(headerData)}`);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
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
              <Ionicons
                name="camera-outline"
                size={20}
                color="#fff"
                style={styles.photoIcon}
              />
              <Text style={styles.photoButtonText}>Photo</Text>
            </TouchableOpacity>
            {card.photo ? (
              <View style={styles.photoContainer}>
                <Image source={{ uri: card.photo }} style={styles.image} />
                <Text style={styles.timestamp}>{card.timestamp}</Text>
              </View>
            ) : (
              <View style={styles.imagePlaceholder}>
                <Text style={styles.imagePlaceholderText}>Image Preview</Text>
              </View>
            )}
          </View>
        ))}

        {/* Add Card Button */}
        <TouchableOpacity style={styles.addButton} onPress={addCard}>
          <Ionicons
            name="add-circle-outline"
            size={20}
            color="#fff"
            style={styles.addIcon}
          />
          <Text style={styles.addButtonText}>ADD</Text>
        </TouchableOpacity>

        {/* Generate PDF Button */}
        <TouchableOpacity style={styles.pdfButton} onPress={handleGeneratePDF}>
          <Ionicons
            name="download-outline"
            size={20}
            color="#fff"
            style={styles.pdfIcon}
          />
          <Text style={styles.pdfButtonText}>PDF</Text>
        </TouchableOpacity>

        {/* Modal for Header/Footer */}
        <Modal
          visible={isModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Fill in Header and Footer</Text>
              <HeaderFooter
                headerData={headerData} // Pass the correct props
                setHeaderData={updateHeaderData} // Pass the correct props
              />
              <TouchableOpacity
                style={styles.modalButton}
                onPress={closeModalAndGeneratePDF}
              >
                <Text style={styles.modalButtonText}>Generate PDF</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  title: {
    fontSize: 16,
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
    height: 70,
  },
  photoButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    width: 200, // Match the image preview width
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
  image: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
  },
  imagePlaceholder: {
    width: 200,
    height: 200,
    marginTop: 10,
    borderRadius: 10,
    backgroundColor: "#e0e0e0",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
  },
  imagePlaceholderText: {
    color: "#888",
    fontSize: 14,
  },
  timestamp: {
    position: "absolute",
    bottom: 0,
    width: "100%",
    textAlign: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)", // Semi-transparent background
    color: "#fff",
    fontSize: 12,
    paddingVertical: 2,
    zIndex: 100, // Ensure the timestamp is on top
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  photoContainer: {
    position: "relative", // Enable absolute positioning for child elements
    width: 200,
    height: 200,
    alignSelf: "center",
  },
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#007BFF",
    padding: 12,
    borderRadius: 5,
    alignSelf: "center",
    marginBottom: 10,
    width: "100%", // Match the card width
  },
  addButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 8,
  },
  addIcon: {
    marginRight: 5,
  },
  pdfButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#28a745",
    padding: 12,
    borderRadius: 5,
    alignSelf: "center",
    marginTop: 10,
    width: "100%", // Match the card width
  },
  pdfButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 10,
  },
  pdfIcon: {
    marginRight: 5,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 20,
  },
  modalButton: {
    backgroundColor: "#007BFF",
    padding: 15,
    borderRadius: 5,
    alignItems: "center",
    marginTop: 20,
    width: "100%",
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
});
