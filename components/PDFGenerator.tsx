import { Platform, Alert } from "react-native";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import * as ImageManipulator from "expo-image-manipulator";
import { HeaderData } from "../types/types";
import { CardData, PDFTemplate, PDFGenerationOptions } from "../types/pdfTypes";

// Import template generators
import { generateA4Portrait2x2 } from "./pdfTemplates/A4Portrait2x2";
import { generateA4Portrait2x3 } from "./pdfTemplates/A4Portrait2x3";

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
      console.log("Using A4Portrait2x2 template");
      return generateA4Portrait2x2(cards, headerData, includeHeader);
    case "A4Portrait2x3":
      console.log("Using A4Portrait2x3 template");
      return generateA4Portrait2x3(cards, headerData, includeHeader);
    // Add cases for other templates as you implement them
    default:
      Alert.alert(
        "Template Warning",
        `Unknown template: ${template}, using default template`
      );
      console.warn(`Unknown template: ${template}, falling back to default`);
      return generateA4Portrait2x2(cards, headerData, includeHeader);
  }
};

// Main function to generate and share PDF
export const generatePDF = async (
  options: PDFGenerationOptions
): Promise<void> => {
  try {
    // Show an initial alert
    Alert.alert("Generating PDF", "Step 1: Starting PDF generation process...");

    console.log("PDF generation started", options.template);
    console.log("Cards count:", options.cards.length);

    // Process cards to convert and compress image URIs to base64
    console.log("Starting image compression...");
    Alert.alert(
      "Generating PDF",
      "Step 2: Processing images (this may take a while)..."
    );

    const processedCards = await processCardsWithCompressedImages(
      options.cards
    );

    console.log("Images processed successfully:", processedCards.length);
    Alert.alert("Generating PDF", "Step 3: Generating HTML content...");

    // Generate HTML content based on template
    console.log("Generating HTML with template:", options.template);
    const htmlContent = generateHTMLByTemplate({
      ...options,
      cards: processedCards,
    });

    console.log("HTML generated, length:", htmlContent.length);
    Alert.alert("Generating PDF", "Step 4: Creating PDF file...");

    // Determine PDF dimensions based on template
    const isLandscape = options.template.includes("Landscape");
    const dimensions = isLandscape
      ? { width: 841.89, height: 595.28 }
      : { width: 595.28, height: 841.89 };

    console.log("Using dimensions:", dimensions);

    // Generate the PDF file
    console.log("Calling Print.printToFileAsync...");
    const { uri } = await Print.printToFileAsync({
      html: htmlContent,
      base64: false,
      ...dimensions,
    });

    console.log("PDF created successfully at:", uri);
    Alert.alert("Generating PDF", "Step 5: Preparing to share PDF...");

    // Handle PDF sharing based on platform
    const fileName = `report_${new Date().toISOString().split("T")[0]}.pdf`;

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
    console.error("PDF Generation Error:", error);
    Alert.alert(
      "Error",
      "Failed to generate PDF: " +
        (error instanceof Error ? error.message : "Unknown error"),
      [{ text: "OK" }]
    );
  }
};

// Add this function at the end of the file
export const generateTestPDF = async (): Promise<void> => {
  try {
    Alert.alert("Test", "Creating minimal PDF...");

    // Generate a very simple HTML content
    const minimumHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Test PDF</title>
      </head>
      <body>
        <h1>Test PDF</h1>
        <p>This is a test PDF with minimal content.</p>
      </body>
      </html>
    `;

    // Generate the PDF file
    const { uri } = await Print.printToFileAsync({
      html: minimumHtml,
      base64: false,
    });

    Alert.alert("Success", "Minimal PDF created!");

    // Generate filename for Android
    const fileName = `test_${new Date().toISOString().split("T")[0]}.pdf`;

    // Share the PDF
    if (Platform.OS === "ios") {
      await Sharing.shareAsync(uri, {
        UTI: ".pdf",
        mimeType: "application/pdf",
      });
    } else {
      const downloadPath = FileSystem.documentDirectory + fileName;
      await FileSystem.copyAsync({
        from: uri,
        to: downloadPath,
      });

      await Sharing.shareAsync(downloadPath, {
        mimeType: "application/pdf",
        dialogTitle: "Save or Share Test PDF",
      });
    }
  } catch (error) {
    console.error("Test PDF Error:", error);
    Alert.alert(
      "Error",
      "Failed to create test PDF: " +
        (error instanceof Error ? error.message : "Unknown error")
    );
  }
};
