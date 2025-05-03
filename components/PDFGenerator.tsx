import { Platform, Alert } from "react-native";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import * as ImageManipulator from "expo-image-manipulator";
import { HeaderData } from "../types/types";
import { CardData, PDFTemplate, PDFGenerationOptions } from "../types/pdfTypes";

// Import template generators
import { generateA4Portrait2x2 } from "./pdfTemplates/A4Portrait2x2";

// Compress image and convert to base64
const compressAndConvertToBase64 = async (uri: string): Promise<string> => {
  try {
    // First compress the image
    const compressedImage = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 600 } }], // Resize to max width of 600px (height auto-adjusted)
      { compress: 0.6, format: ImageManipulator.SaveFormat.JPEG } // 60% quality JPEG
    );

    // Then convert to base64
    const base64 = await FileSystem.readAsStringAsync(compressedImage.uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    return `data:image/jpeg;base64,${base64}`;
  } catch (error) {
    console.error("Error compressing and converting image:", error);
    return "";
  }
};

// Process cards to convert image URIs to compressed base64
const processCardsWithCompressedImages = async (
  cards: CardData[]
): Promise<CardData[]> => {
  const processedCards = [...cards];

  for (let i = 0; i < processedCards.length; i++) {
    if (processedCards[i].photo) {
      try {
        // Show progress in the console
        console.log(
          `Compressing image ${i + 1} of ${processedCards.length}...`
        );

        const compressedBase64Image = await compressAndConvertToBase64(
          processedCards[i].photo!
        );
        processedCards[i] = {
          ...processedCards[i],
          photo: compressedBase64Image,
        };
      } catch (error) {
        console.error(`Error processing image for card ${i}:`, error);
      }
    }
  }

  return processedCards;
};

// Main generator function that selects the appropriate template
const generateHTMLByTemplate = (options: PDFGenerationOptions): string => {
  const { cards, headerData, template, includeHeader } = options;

  switch (template) {
    case "A4Portrait2x2":
      return generateA4Portrait2x2(cards, headerData, includeHeader);
    // Add cases for other templates as you implement them
    default:
      return generateA4Portrait2x2(cards, headerData, includeHeader);
  }
};

// Main function to generate and share PDF
export const generatePDF = async (
  options: PDFGenerationOptions
): Promise<void> => {
  try {
    // Show an initial alert
    Alert.alert(
      "Generating PDF",
      "Please wait while your PDF is being generated..."
    );

    // Process cards to convert and compress image URIs to base64
    const processedCards = await processCardsWithCompressedImages(
      options.cards
    );

    // Generate HTML content based on template
    const htmlContent = generateHTMLByTemplate({
      ...options,
      cards: processedCards,
    });

    // Determine PDF dimensions based on template (landscape vs portrait)
    const isLandscape = options.template.includes("Landscape");
    const dimensions = isLandscape
      ? { width: 841.89, height: 595.28 } // A4 Landscape dimensions
      : { width: 595.28, height: 841.89 }; // A4 Portrait dimensions

    // Generate the PDF file
    const { uri } = await Print.printToFileAsync({
      html: htmlContent,
      base64: false,
      ...dimensions,
    });

    // Create a filename with date and time
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const fileName = `inspection_report_${timestamp}.pdf`;

    // Handle PDF sharing based on platform
    if (Platform.OS === "ios") {
      // On iOS, use the Sharing API
      await Sharing.shareAsync(uri, {
        UTI: ".pdf",
        mimeType: "application/pdf",
      });
    } else {
      // On Android, save to downloads folder and share
      const downloadPath = FileSystem.documentDirectory + fileName;
      await FileSystem.copyAsync({
        from: uri,
        to: downloadPath,
      });

      await Sharing.shareAsync(downloadPath, {
        mimeType: "application/pdf",
        dialogTitle: "Save or Share PDF Report",
      });
    }

    // Show success alert
    Alert.alert("PDF Generated", "Your PDF has been generated successfully!", [
      { text: "OK" },
    ]);
  } catch (error) {
    Alert.alert(
      "Error",
      "Failed to generate PDF: " +
        (error instanceof Error ? error.message : "Unknown error"),
      [{ text: "OK" }]
    );
  }
};
