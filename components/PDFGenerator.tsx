import { Platform, Alert } from "react-native";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import { HeaderData } from "../types/types";
import { CardData, PDFTemplate, PDFGenerationOptions } from "../types/pdfTypes";

// Import template generators
import { generateA4Portrait2x2 } from "./pdfTemplates/A4Portrait2x2";

// Main generator function that selects the appropriate template
const generateHTMLByTemplate = (options: PDFGenerationOptions): string => {
  const { cards, headerData, template, includeHeader } = options;

  switch (template) {
    case "A4Portrait2x2":
      return generateA4Portrait2x2(cards, headerData, includeHeader);
    // Add cases for other templates as you implement them
    // case 'A4Landscape5x2':
    //   return generateA4Landscape5x2(cards, headerData, includeHeader);
    default:
      // Default to A4Portrait2x2 if template not found
      return generateA4Portrait2x2(cards, headerData, includeHeader);
  }
};

// Main function to generate and share PDF
export const generatePDF = async (
  options: PDFGenerationOptions
): Promise<void> => {
  try {
    // Generate HTML content based on template
    const htmlContent = generateHTMLByTemplate(options);

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
  } catch (error) {
    Alert.alert(
      "Error",
      "Failed to generate PDF: " +
        (error instanceof Error ? error.message : "Unknown error"),
      [{ text: "OK" }]
    );
  }
};
