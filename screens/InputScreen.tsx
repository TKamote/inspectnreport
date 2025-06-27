import React, { useState, useEffect } from "react";
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
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons"; // Import Ionicons for icons
import * as ImagePicker from "expo-image-picker"; // Import ImagePicker
import HeaderFooter from "../components/HeaderFooter";
import { HeaderData, SetHeaderData } from "../types/types"; // Import the types
import { generatePDF, ProgressInfo } from "../components/PDFGenerator"; // Import generatePDF
import { PDFTemplate } from "../types/pdfTypes";
import { COLORS, FONTS } from "../theme/theme";

const getTemplateDisplayName = (templateCode: string): string => {
  const displayNames: Record<string, string> = {
    A4Portrait2x2: "A4 Portrait: 2-Col x 2-Row Grid",
    A4Portrait2x3: "A4 Portrait: 2-Col x 3-Row Grid",
    A4Landscape3x2: "A4 Landscape: 3-Col x 2-Row Grid",
    A4Landscape4x2: "A4 Landscape: 4-Col x 2-Row Grid",
    A4Landscape5x2: "A4 Landscape: 5-Col x 2-Row Grid",
  };

  return displayNames[templateCode] || templateCode;
};

// Add this function at the top of your component, after the imports
const getImageDimensions = (template: string) => {
  // Define photo orientations for each template explicitly
  const photoOrientations: Record<string, "portrait" | "landscape"> = {
    A4Portrait2x2: "portrait", // photo is portrait
    A4Portrait2x3: "landscape", // photo is landscape
    A4Landscape3x2: "landscape", // photo is landscape
    A4Landscape4x2: "landscape", // photo is landscape
    A4Landscape5x2: "portrait", // photo is portrait
  };

  const orientation = photoOrientations[template] || "landscape"; // default to landscape

  if (orientation === "portrait") {
    return { width: 200, height: 267 }; // 3:4 ratio for portrait photos
  } else {
    return { width: 200, height: 150 }; // 4:3 ratio for landscape photos
  }
};

export default function InputScreen({ route }: { route: any }) {
  const { template } = route.params;

  // Get dynamic dimensions for the selected template
  const imageDimensions = getImageDimensions(template);

  // Create styles dynamically based on the image dimensions
  const styles = createStyles(imageDimensions);

  const [headerData, setHeaderData] = useState<HeaderData>({
    company: "",
    createdBy: "",
    reportFor: "",
    typeOfReport: "",
    date: "",
  });

  const [cards, setCards] = useState<any[]>([
    { location: "", observations: "", photo: null, timestamp: null },
  ]);

  const [isModalVisible, setModalVisible] = useState(false); // State for modal visibility
  const [isGenerating, setIsGenerating] = useState(false); // State for PDF generation
  const [progressInfo, setProgressInfo] = useState<ProgressInfo>({
    step: "init",
    message: "Preparing...",
  });

  const [headerChoiceModalVisible, setHeaderChoiceModalVisible] =
    useState(false); // State for header choice modal visibility

  const updateHeaderData: SetHeaderData = (field, value) => {
    setHeaderData((prev) => ({ ...prev, [field]: value }));
  };

  const addCard = () => {
    setCards([
      ...cards,
      { location: "", observations: "", photo: null, timestamp: null },
    ]);
  };

  const updateCard = (index: number, updatedCard: any) => {
    const updatedCards = [...cards];
    updatedCards[index] = updatedCard;
    setCards(updatedCards);
  };

  const removeCard = (index: number) => {
    const updatedCards = cards.filter((_, cardIndex) => cardIndex !== index);
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
              mediaTypes: "images",
              allowsEditing: false,
              quality: 1,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
              const timestamp = new Date().toLocaleString(undefined, {
                year: "numeric",
                month: "numeric",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              });
              updateCard(index, {
                ...cards[index],
                photo: result.assets[0].uri,
                timestamp: timestamp,
              });
            }
          },
        },
        {
          text: "Choose from Gallery",
          onPress: async () => {
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: "images",
              allowsEditing: false,
              quality: 1,
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
              updateCard(index, {
                ...cards[index],
                photo: result.assets[0].uri,
                timestamp: null,
              });
            }
          },
        },
        { text: "Cancel", style: "cancel" },
      ],
      { cancelable: true }
    );
  };

  const handleGeneratePDF = () => {
    // Show modal instead of alert
    setHeaderChoiceModalVisible(true);
  };

  const closeModalAndGeneratePDF = () => {
    setModalVisible(false);
    // Start generating PDF with header
    setIsGenerating(true);

    generatePDF(
      {
        cards,
        headerData, // Use the header data that was entered in the modal
        template: template as PDFTemplate,
        includeHeader: true, // Include header since they filled it out
      },
      (info) => {
        // Update progress info for the loading indicator
        setProgressInfo(info);

        // When complete, hide the loading indicator
        if (info.step === "complete") {
          setTimeout(() => setIsGenerating(false), 1000);
        }
      }
    );
  };

  const generateWithHeader = () => {
    setHeaderChoiceModalVisible(false);
    setModalVisible(true); // Show the header input modal
  };

  const generateWithoutHeader = () => {
    setHeaderChoiceModalVisible(false);
    // Start generating PDF without header
    setIsGenerating(true);

    generatePDF(
      {
        cards,
        headerData: {
          company: "",
          createdBy: "",
          reportFor: "",
          typeOfReport: "",
          date: "",
        },
        template: template as PDFTemplate,
        includeHeader: false,
      },
      (info) => {
        setProgressInfo(info);
        if (info.step === "complete") {
          setTimeout(() => setIsGenerating(false), 1000);
        }
      }
    );
  };

  const hideObservations = template === "A4Portrait4x6";

  const hasValidContent = () => {
    // Consider a card valid if it has either a location, observations, or a photo
    return cards.some(
      (card) =>
        card.location.trim() !== "" ||
        card.observations?.trim() !== "" ||
        card.photo !== null
    );
  };

  useEffect(() => {
    const checkPermissions = async () => {
      const { status: existingStatus } =
        await ImagePicker.getCameraPermissionsAsync();

      if (existingStatus !== "granted") {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
      }
    };

    checkPermissions();
  }, []);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>{getTemplateDisplayName(template)}</Text>

        {/* Moved PDF Button to top */}
        <TouchableOpacity
          style={[
            styles.pdfButton,
            !hasValidContent() && styles.pdfDisabledButton, // Use specific style for PDF button
          ]}
          onPress={handleGeneratePDF}
          disabled={!hasValidContent()}
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Ionicons
              name="download-outline"
              size={20}
              color="#fff"
              style={{ marginRight: 8 }}
            />
            <Text style={styles.modalButtonText}>PDF</Text>
          </View>
        </TouchableOpacity>

        {template === "A4Portrait4x6" && (
          <Text style={styles.infoText}>
            Note: The 4x6 template shows only images and locations (no
            observations)
          </Text>
        )}

        {/* Render Cards */}
        {cards.map((card, index) => (
          <View key={index} style={styles.cardContainer}>
            <TextInput
              style={styles.input}
              placeholder="Location"
              value={card.location}
              onChangeText={(text) =>
                updateCard(index, { ...card, location: text })
              }
            />

            {/* Hide observations input for A4Portrait4x6 template */}
            {!hideObservations && (
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Observations"
                multiline
                value={card.observations}
                onChangeText={(text) =>
                  updateCard(index, { ...card, observations: text })
                }
              />
            )}

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

            {/* Add new card footer here */}
            <View style={styles.cardFooter}>
              <Text style={styles.cardNumber}>#{index + 1}</Text>
              <TouchableOpacity
                style={styles.deleteButton}
                onPress={() => removeCard(index)}
              >
                <Ionicons name="trash-outline" size={18} color="#999" />
              </TouchableOpacity>
            </View>
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

        {/* Modal for Header/Footer */}
        <Modal
          visible={isModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <ScrollView contentContainerStyle={styles.modalScrollContent}>
              <View style={styles.modalContent}>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>
                    Fill in Header Information
                  </Text>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setModalVisible(false)}
                  >
                    <Ionicons name="close" size={22} color="#003E51" />
                  </TouchableOpacity>
                </View>
                <HeaderFooter
                  headerData={headerData}
                  setHeaderData={updateHeaderData}
                />
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={closeModalAndGeneratePDF}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Ionicons
                      name="download-outline"
                      size={20}
                      color="#fff"
                      style={{ marginRight: 8 }}
                    />
                    <Text style={styles.modalButtonText}>PDF</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </Modal>

        {/* Header Choice Modal */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={headerChoiceModalVisible}
          onRequestClose={() => setHeaderChoiceModalVisible(false)}
        >
          <View style={styles.centeredView}>
            <View style={styles.modalView}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>PDF Options</Text>
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => setHeaderChoiceModalVisible(false)}
                >
                  <Ionicons name="close" size={22} color="#003E51" />
                </TouchableOpacity>
              </View>

              <Text style={styles.modalText}>
                Would you like to include a header with company and report
                information?
              </Text>

              <View style={styles.modalButtonContainer}>
                <TouchableOpacity
                  style={[
                    styles.modalChoiceButton,
                    { backgroundColor: COLORS.SPACE },
                  ]}
                  onPress={() => generateWithoutHeader()}
                >
                  <Text style={styles.modalButtonText}>No</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.modalChoiceButton}
                  onPress={() => generateWithHeader()}
                >
                  <Text style={styles.modalButtonText}>Yes</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

        {/* Loading Modal */}
        <Modal transparent={true} visible={isGenerating} animationType="fade">
          <View style={styles.modalBackground}>
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.RED} />
              <Text style={styles.loadingText}>{progressInfo.message}</Text>

              {progressInfo.progress !== undefined && (
                <View style={styles.progressBar}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${progressInfo.progress}%` },
                    ]}
                  />
                </View>
              )}
            </View>
          </View>
        </Modal>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// Dynamically create styles based on image dimensions
const createStyles = (imageDimensions: { width: number; height: number }) =>
  StyleSheet.create({
    container: {
      flexGrow: 1,
      backgroundColor: "#fff",
      padding: 20,
    },
    title: {
      fontSize: 14,
      fontWeight: FONTS.WEIGHTS.BOLD,
      marginBottom: 20,
      textAlign: "center",
      color: COLORS.MIDNIGHT,
    },
    infoText: {
      color: COLORS.MIDNIGHT,
      fontSize: 14,
      textAlign: "center",
      marginBottom: 15,
      fontStyle: "italic",
    },
    cardContainer: {
      marginBottom: 20,
      padding: 15,
      borderWidth: 1,
      borderColor: COLORS.BORDER,
      borderRadius: 5,
      backgroundColor: "#f9f9f9",
    },
    input: {
      width: "100%",
      height: 40,
      borderWidth: 1,
      borderColor: COLORS.BORDER,
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
      backgroundColor: COLORS.SPACE,
      padding: 10,
      borderRadius: 5,
      marginTop: 10,
      width: imageDimensions.width,
      alignSelf: "center",
    },
    photoButtonText: {
      color: COLORS.WHITE,
      fontSize: 14,
      fontWeight: FONTS.WEIGHTS.BOLD,
      marginLeft: 8,
    },
    photoIcon: {
      marginRight: 5,
    },
    image: {
      width: "100%",
      height: "100%",
      borderRadius: 10,
      resizeMode: "cover",
    },
    imagePlaceholder: {
      width: imageDimensions.width,
      height: imageDimensions.height,
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
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      color: COLORS.WHITE,
      fontSize: 12,
      paddingVertical: 2,
      zIndex: 100,
      borderBottomLeftRadius: 10,
      borderBottomRightRadius: 10,
    },
    photoContainer: {
      position: "relative",
      width: imageDimensions.width,
      height: imageDimensions.height,
      alignSelf: "center",
    },
    cardFooter: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginTop: 15,
      paddingTop: 10,
      borderTopWidth: 1,
      borderTopColor: "#eee",
    },
    cardNumber: {
      fontSize: 14,
      color: "#999",
      fontWeight: FONTS.WEIGHTS.MEDIUM,
    },
    deleteButton: {
      padding: 5,
    },
    addButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: COLORS.SPACE,
      padding: 12,
      borderRadius: 5,
      alignSelf: "center",
      marginBottom: 10,
      width: "100%",
    },
    addButtonText: {
      color: COLORS.WHITE,
      fontSize: 14,
      fontWeight: FONTS.WEIGHTS.BOLD,
      marginLeft: 8,
    },
    addIcon: {
      marginRight: 5,
    },
    pdfButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: COLORS.RED,
      padding: 12,
      borderRadius: 5,
      alignSelf: "center",
      marginBottom: 20,
      width: "100%",
    },
    disabledButton: {
      backgroundColor: COLORS.BORDER,
    },
    pdfDisabledButton: {
      backgroundColor: "rgba(227, 6, 19, 0.3)",
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
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "flex-start",
    },
    modalScrollContent: {
      flexGrow: 1,
      justifyContent: "flex-start",
      alignItems: "center",
      width: "100%",
      paddingTop: 50,
      paddingBottom: 5,
    },
    modalContent: {
      width: "85%",
      backgroundColor: "#fff",
      borderRadius: 10,
      padding: 15,
      maxHeight: "85%",
    },
    modalHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: 10,
      width: "100%",
    },
    closeButton: {
      padding: 5,
    },
    modalTitle: {
      fontSize: 16,
      fontWeight: "bold",
      marginBottom: 5,
    },
    modalButton: {
      backgroundColor: "#E30613",
      padding: 15,
      borderRadius: 5,
      alignItems: "center",
      marginTop: 5,
      width: "100%",
    },
    modalButtonText: {
      color: "#fff",
      fontSize: 16,
      fontWeight: "bold",
    },
    modalBackground: {
      flex: 1,
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      justifyContent: "center",
      alignItems: "center",
    },
    loadingContainer: {
      backgroundColor: "white",
      padding: 20,
      borderRadius: 10,
      alignItems: "center",
      width: "80%",
    },
    loadingText: {
      marginTop: 15,
      fontSize: 16,
      textAlign: "center",
    },
    progressBar: {
      height: 6,
      width: "100%",
      backgroundColor: "#f0f0f0",
      borderRadius: 3,
      marginTop: 15,
      overflow: "hidden",
    },
    progressFill: {
      height: "100%",
      backgroundColor: COLORS.RED,
    },
    centeredView: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
    },
    modalView: {
      width: "85%",
      backgroundColor: "#fff",
      borderRadius: 10,
      padding: 20,
      alignItems: "center",
      shadowColor: "#000",
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    modalText: {
      marginBottom: 15,
      textAlign: "center",
      color: COLORS.MIDNIGHT,
      fontSize: 16,
    },
    modalButtonContainer: {
      flexDirection: "row",
      justifyContent: "space-around",
      width: "100%",
      marginTop: 15,
      paddingHorizontal: 10,
    },
    modalChoiceButton: {
      backgroundColor: COLORS.RED,
      padding: 5,
      borderRadius: 5,
      alignItems: "center",
      justifyContent: "center",
      minWidth: 80,
    },
  });
