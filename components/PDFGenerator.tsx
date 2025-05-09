import { Platform } from "react-native";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import * as ImageManipulator from "expo-image-manipulator";
import { HeaderData } from "../types/types";
import { CardData, PDFTemplate, PDFGenerationOptions } from "../types/pdfTypes";

// Import template generators
import { generateA4Portrait2x2 } from "./pdfTemplates/A4Portrait2x2";
import { generateA4Portrait2x3 } from "./pdfTemplates/A4Portrait2x3";
import { generateA4Landscape3x2 } from "./pdfTemplates/A4Landscape3x2";
import { generateA4Landscape4x2 } from "./pdfTemplates/A4Landscape4x2";
import { generateA4Landscape5x3 } from "./pdfTemplates/A4Landscape5x3";
import { generateA4Portrait4x6 } from "./pdfTemplates/A4Portrait4x6";

// Define progress types
export type ProgressStep =
  | "init"
  | "compressing"
  | "generating"
  | "creating"
  | "sharing"
  | "complete";

export type ProgressInfo = {
  step: ProgressStep;
  message: string;
  progress?: number; // 0-100 percentage for steps that can show progress
  total?: number; // Total items (e.g., total images)
  current?: number; // Current item being processed
};

// Compress image and convert to base64
const compressAndConvertToBase64 = async (uri: string): Promise<string> => {
  try {
    // First compress the image
    const compressedImage = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 600 } }], // Resize to max width of 600px
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
  cards: CardData[],
  onProgress?: (info: ProgressInfo) => void
): Promise<CardData[]> => {
  const processedCards = [...cards];
  const totalImages = processedCards.filter((card) => card.photo).length;
  let processedCount = 0;

  for (let i = 0; i < processedCards.length; i++) {
    if (processedCards[i].photo) {
      try {
        // Update progress
        if (onProgress) {
          onProgress({
            step: "compressing",
            message: `Processing image ${processedCount + 1} of ${totalImages}`,
            progress: Math.round((processedCount / totalImages) * 100),
            total: totalImages,
            current: processedCount + 1,
          });
        }

        const compressedBase64Image = await compressAndConvertToBase64(
          processedCards[i].photo!
        );
        processedCards[i] = {
          ...processedCards[i],
          photo: compressedBase64Image,
        };

        processedCount++;
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
    case "A4Portrait2x3":
      return generateA4Portrait2x3(cards, headerData, includeHeader);
    case "A4Landscape3x2":
      return generateA4Landscape3x2(cards, headerData, includeHeader);
    case "A4Landscape4x2":
      return generateA4Landscape4x2(cards, headerData, includeHeader);
    case "A4Landscape5x3":
      return generateA4Landscape5x3(cards, headerData, includeHeader);
    case "A4Portrait4x6":
      return generateA4Portrait4x6(cards, headerData, includeHeader);
    default:
      console.warn(`Unknown template: ${template}, falling back to default`);
      return generateA4Portrait2x2(cards, headerData, includeHeader);
  }
};

// Main function to generate and share PDF with progress updates
export const generatePDF = async (
  options: PDFGenerationOptions,
  onProgress?: (info: ProgressInfo) => void
): Promise<boolean> => {
  try {
    // Start generation process
    if (onProgress) {
      onProgress({
        step: "init",
        message: "Starting PDF generation process...",
      });
    }

    console.log("PDF generation started", options.template);
    console.log("Cards count:", options.cards.length);

    // Process cards to convert and compress image URIs to base64
    if (onProgress) {
      onProgress({
        step: "compressing",
        message: "Processing images...",
        progress: 0,
        total: options.cards.filter((card) => card.photo).length,
        current: 0,
      });
    }

    const processedCards = await processCardsWithCompressedImages(
      options.cards,
      onProgress
    );

    console.log("Images processed successfully:", processedCards.length);

    // Generate HTML content
    if (onProgress) {
      onProgress({
        step: "generating",
        message: "Generating PDF content...",
      });
    }

    console.log("Generating HTML with template:", options.template);
    const htmlContent = generateHTMLByTemplate({
      ...options,
      cards: processedCards,
    });

    console.log("HTML generated, length:", htmlContent.length);

    // Create PDF file
    if (onProgress) {
      onProgress({
        step: "creating",
        message: "Creating PDF file...",
      });
    }

    // Determine PDF dimensions based on template
    const isLandscape = options.template.includes("Landscape");
    const dimensions = isLandscape
      ? { width: 841.89, height: 595.28 } // A4 landscape
      : { width: 595.28, height: 841.89 }; // A4 portrait

    console.log("Using dimensions:", dimensions);

    // Generate the PDF file
    const { uri } = await Print.printToFileAsync({
      html: htmlContent,
      base64: false,
      ...dimensions,
    });

    console.log("PDF created successfully at:", uri);

    // Prepare for sharing
    if (onProgress) {
      onProgress({
        step: "sharing",
        message: "Preparing to share PDF...",
      });
    }

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

    // Complete generation process
    if (onProgress) {
      onProgress({
        step: "complete",
        message: "PDF generated successfully!",
      });
    }

    return true;
  } catch (error) {
    console.error("PDF Generation Error:", error);
    if (onProgress) {
      onProgress({
        step: "complete",
        message: `Error: ${
          error instanceof Error ? error.message : "Failed to generate PDF"
        }`,
      });
    }
    return false;
  }
};

// Test PDF generation with minimal content
export const generateTestPDF = async (
  onProgress?: (info: ProgressInfo) => void
): Promise<boolean> => {
  try {
    if (onProgress) {
      onProgress({
        step: "init",
        message: "Creating test PDF...",
      });
    }

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

    if (onProgress) {
      onProgress({
        step: "creating",
        message: "Creating PDF file...",
      });
    }

    // Generate the PDF file
    const { uri } = await Print.printToFileAsync({
      html: minimumHtml,
      base64: false,
    });

    if (onProgress) {
      onProgress({
        step: "sharing",
        message: "Preparing to share test PDF...",
      });
    }

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

    if (onProgress) {
      onProgress({
        step: "complete",
        message: "Test PDF created successfully!",
      });
    }

    return true;
  } catch (error) {
    console.error("Test PDF Error:", error);
    if (onProgress) {
      onProgress({
        step: "complete",
        message: `Error: ${
          error instanceof Error ? error.message : "Failed to create test PDF"
        }`,
      });
    }
    return false;
  }
};
