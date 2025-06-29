import { Platform } from "react-native";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system";
import * as ImageManipulator from "expo-image-manipulator";

// Import types
import { CardData } from "../types/pdfTypes";
import { HeaderData } from "../types/types";

// Import template generators (they now return jsPDF objects)
import { downloadA4Portrait2x2PDF } from "./pdfTemplates/A4Portrait2x2";
import { downloadA4Portrait2x3PDF } from "./pdfTemplates/A4Portrait2x3";
import { downloadA4Landscape3x2PDF } from "./pdfTemplates/A4Landscape3x2";
import { downloadA4Landscape4x2PDF } from "./pdfTemplates/A4Landscape4x2";
import { downloadA4Landscape5x2PDF } from "./pdfTemplates/A4Landscape5x2";

// Define types
export type PDFGenerationOptions = {
  cards: CardData[];
  headerData: HeaderData;
  template: string;
  includeHeader: boolean;
};

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

// Helper function to pad numbers for timestamp
const pad = (num: number): string => num.toString().padStart(2, "0");

// Compress image and convert to base64
const compressAndConvertToBase64 = async (uri: string): Promise<string> => {
  try {
    // Better balance between quality and file size
    const compressedImage = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 700 } }], // Moderate increase from original 600px
      { compress: 0.75, format: ImageManipulator.SaveFormat.JPEG } // Moderate increase from original 0.6
    );

    const base64 = await FileSystem.readAsStringAsync(compressedImage.uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    return `data:image/jpeg;base64,${base64}`;
  } catch (error) {
    return "";
  }
};

// Process cards to convert image URIs to compressed base64
const processCardsWithCompressedImages = async (
  cards: CardData[],
  onProgress?: (info: ProgressInfo) => void
): Promise<CardData[]> => {
  const processedCards = [...cards];
  const imagesToProcess = processedCards.filter((card) => card.photo);
  const totalImages = imagesToProcess.length;
  let processedCount = 0;

  if (totalImages === 0 && onProgress) {
    // If no images, briefly show compressing step as complete
    onProgress({
      step: "compressing",
      message: "No images to process.",
      progress: 100,
      total: 0,
      current: 0,
    });
  }

  for (let i = 0; i < processedCards.length; i++) {
    if (processedCards[i].photo) {
      try {
        if (onProgress) {
          onProgress({
            step: "compressing",
            message: `Processing image ${processedCount + 1} of ${totalImages}`,
            progress: Math.round(((processedCount + 1) / totalImages) * 100), // Progress based on completion
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
      } catch (error) {}
    }
  }
  return processedCards;
};

// UPDATED: Main generator function now returns jsPDF objects
const generatePDFByTemplate = async (
  options: PDFGenerationOptions
): Promise<string | null> => {
  const { cards, headerData, template, includeHeader } = options;

  try {
    switch (template) {
      case "A4Portrait2x2":
        return await downloadA4Portrait2x2PDF(cards, headerData, includeHeader);
      case "A4Portrait2x3":
        return await downloadA4Portrait2x3PDF(cards, headerData, includeHeader);
      case "A4Landscape3x2":
        return await downloadA4Landscape3x2PDF(
          cards,
          headerData,
          includeHeader
        );
      case "A4Landscape4x2":
        return await downloadA4Landscape4x2PDF(
          cards,
          headerData,
          includeHeader
        );
      case "A4Landscape5x2":
        return await downloadA4Landscape5x2PDF(
          cards,
          headerData,
          includeHeader
        );
      default:
        return await downloadA4Portrait2x2PDF(cards, headerData, includeHeader);
    }
  } catch (error) {
    return null;
  }
};

// UPDATED: Main function now uses jsPDF instead of HTML
export const generatePDF = async (
  options: PDFGenerationOptions,
  onProgress?: (info: ProgressInfo) => void
): Promise<boolean> => {
  try {
    if (onProgress)
      onProgress({ step: "init", message: "Starting PDF generation..." });

    const imagesToProcessCount = options.cards.filter(
      (card: CardData) => card.photo
    ).length;

    if (onProgress) {
      onProgress({
        step: "compressing",
        message:
          imagesToProcessCount > 0
            ? "Processing images..."
            : "No images to process.",
        progress: 0,
        total: imagesToProcessCount,
        current: 0,
      });
    }

    const processedCards = await processCardsWithCompressedImages(
      options.cards,
      onProgress
    );

    if (imagesToProcessCount > 0 && onProgress) {
      onProgress({
        step: "compressing",
        message: "Image processing complete.",
        progress: 100,
        total: imagesToProcessCount,
        current: imagesToProcessCount,
      });
    }

    if (onProgress)
      onProgress({ step: "generating", message: "Generating PDF content..." });

    // Generate base64 data instead of jsPDF object
    const base64Data = await generatePDFByTemplate({
      ...options,
      cards: processedCards,
    });

    if (!base64Data) {
      throw new Error("Failed to generate PDF data");
    }

    if (onProgress)
      onProgress({ step: "creating", message: "Creating PDF file..." });

    // Create file from base64
    const now = new Date();
    const timestamp = `${pad(now.getFullYear())}${pad(now.getMonth() + 1)}${pad(
      now.getDate()
    )}_${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
    const fileName = `PDF_${timestamp}.pdf`;
    const newFilePath = `${FileSystem.documentDirectory}${fileName}`;

    // Write base64 data directly to file
    await FileSystem.writeAsStringAsync(newFilePath, base64Data, {
      encoding: FileSystem.EncodingType.Base64,
    });

    if (onProgress)
      onProgress({ step: "sharing", message: "Preparing to share PDF..." });

    const shareOptions: Sharing.SharingOptions = {
      mimeType: "application/pdf",
      dialogTitle:
        Platform.OS === "ios" ? fileName : "Save or Share PDF Report",
    };

    if (Platform.OS === "ios") {
      shareOptions.UTI = ".pdf";
    }

    await Sharing.shareAsync(newFilePath, shareOptions);

    if (onProgress)
      onProgress({ step: "complete", message: "PDF shared successfully!" });
    return true;
  } catch (error) {
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

// Test function remains mostly the same
export const generateTestPDF = async (
  onProgress?: (info: ProgressInfo) => void
): Promise<boolean> => {
  try {
    if (onProgress)
      onProgress({ step: "init", message: "Creating test PDF..." });

    const minimumHtml = `
      <!DOCTYPE html><html><head><meta charset="utf-8"><title>Test PDF</title></head>
      <body><h1>Test PDF</h1><p>This is a test PDF with minimal content.</p></body></html>`;

    if (onProgress)
      onProgress({ step: "creating", message: "Creating PDF file..." });

    const { uri: temporaryPdfUri } = await Print.printToFileAsync({
      html: minimumHtml,
      base64: false,
    });

    const now = new Date();
    const timestamp = `${pad(now.getMonth() + 1)}${pad(now.getDate())}_${pad(
      now.getHours()
    )}${pad(now.getMinutes())}`;
    const fileName = `PDF_${timestamp}.pdf`;
    const newFilePath = `${FileSystem.documentDirectory}${fileName}`;

    await FileSystem.moveAsync({
      from: temporaryPdfUri,
      to: newFilePath,
    });

    if (onProgress)
      onProgress({
        step: "sharing",
        message: "Preparing to share test PDF...",
      });

    const shareOptions: Sharing.SharingOptions = {
      mimeType: "application/pdf",
      dialogTitle: Platform.OS === "ios" ? fileName : "Save or Share Test PDF",
    };
    if (Platform.OS === "ios") {
      shareOptions.UTI = ".pdf";
    }

    await Sharing.shareAsync(newFilePath, shareOptions);

    if (onProgress)
      onProgress({
        step: "complete",
        message: "Test PDF shared successfully!",
      });
    return true;
  } catch (error) {
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
