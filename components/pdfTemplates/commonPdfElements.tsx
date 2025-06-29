import jsPDF from "jspdf";
import { HeaderData } from "../../types/types";

// Standard colors used across all templates
export const PDF_COLORS = {
  blue: [0, 123, 255] as [number, number, number],
  gray: [204, 204, 204] as [number, number, number],
  lightGray: [224, 224, 224] as [number, number, number],
  darkGray: [136, 136, 136] as [number, number, number],
  black: [0, 0, 0] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
};

// Add header to jsPDF document
export const addHeaderToDoc = (
  doc: jsPDF,
  headerData: HeaderData,
  pageWidth: number,
  includeHeader: boolean,
  margin: number // Remove = 20 since templates always pass a value
): number => {
  if (!includeHeader) {
    // Minimal header - just title with reduced spacing
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...PDF_COLORS.black);
    const title = "Inspection Report";
    const titleWidth = doc.getTextWidth(title);
    doc.text(title, (pageWidth - titleWidth) / 2, 18);
    return 12; // Changed from 18 to 12 (additional 6mm reduction, total 13mm less than original 25)
  }

  // Full header with improved layout and reduced line heights
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...PDF_COLORS.black);

  // Row 1: Company and Created By on left with 20px spacing
  const companyText = `Company: ${headerData.company || "Company Name"}`;
  const createdByText = `Created By: ${headerData.createdBy || "Inspector"}`;

  doc.text(companyText, margin, 15);
  const companyWidth = doc.getTextWidth(companyText);
  doc.text(createdByText, margin + companyWidth + 10, 15);

  // Row 2: Report For on left, Date on right (space-between layout)
  const reportForText = `Report For: ${headerData.reportFor || "Client"}`;
  const dateText = `Date: ${
    headerData.date || new Date().toLocaleDateString()
  }`;

  doc.text(reportForText, margin, 21);
  const dateWidth = doc.getTextWidth(dateText);
  doc.text(dateText, pageWidth - margin - dateWidth, 21);

  // Title with reduced spacing
  doc.setFontSize(12); // Changed from 13 to 12
  doc.setFont("helvetica", "bold");
  const title = headerData.typeOfReport || "Inspection Report";
  const titleWidth = doc.getTextWidth(title);
  doc.text(title, (pageWidth - titleWidth) / 2, 31);

  return 10; // Content spacing as requested
};

// Add footer to jsPDF document
export const addFooterToDoc = (
  doc: jsPDF,
  currentPage: number,
  totalPages: number,
  pageWidth: number,
  pageHeight: number,
  margin: number // Remove = 20 since templates always pass a value
): void => {
  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...PDF_COLORS.darkGray);

  // Developer info on left
  doc.text("Developer: PDF Report Maker", margin, pageHeight - 8);

  // Page number on right
  const pageText = `Page ${currentPage} of ${totalPages}`;
  const pageTextWidth = doc.getTextWidth(pageText);
  doc.text(pageText, pageWidth - margin - pageTextWidth, pageHeight - 8);
};

// Add timestamp overlay to image
export const addTimestampToImage = (
  doc: jsPDF,
  timestamp: string,
  imageX: number,
  imageY: number,
  imageHeight: number
): void => {
  if (!timestamp) return;

  // Increase font size from 5 to 6
  doc.setFontSize(6);
  doc.setFont("helvetica", "bold"); // Changed to bold for better visibility

  // Remove background - delete these lines:
  // const timestampWidth = doc.getTextWidth(timestamp);
  // doc.setFillColor(0, 0, 0, 0.4);
  // doc.rect(imageX + 1, imageY + imageHeight - 5, timestampWidth + 2, 4, 'F');

  // Add text stroke/outline for visibility on white backgrounds
  doc.setTextColor(0, 0, 0); // Black text
  doc.setLineWidth(0.3);
  doc.setDrawColor(255, 255, 255); // White outline

  // Draw text with outline effect (multiple passes for stroke)
  const textX = imageX + 2;
  const textY = imageY + imageHeight - 2;

  // White outline (reduce offset from 0.1 to 0.05 for less obvious spacing):
  doc.setTextColor(255, 255, 255);
  doc.text(timestamp, textX - 0.05, textY); // Changed from 0.1 to 0.05
  doc.text(timestamp, textX + 0.05, textY); // Changed from 0.1 to 0.05
  doc.text(timestamp, textX, textY - 0.05); // Changed from 0.1 to 0.05
  doc.text(timestamp, textX, textY + 0.05); // Changed from 0.1 to 0.05

  // Black text on top (unchanged)
  doc.setTextColor(0, 0, 0);
  doc.text(timestamp, textX, textY);
};

// Add image with fallback placeholder
export const addImageToCard = (
  doc: jsPDF,
  photo: string | null | undefined,
  imageX: number,
  imageY: number,
  imageWidth: number,
  imageHeight: number,
  cardIndex: number
): void => {
  if (photo) {
    try {
      // Check if photo is valid base64
      if (photo.startsWith("data:image/")) {
        doc.addImage(photo, "JPEG", imageX, imageY, imageWidth, imageHeight);
      } else {
        throw new Error("Invalid image format");
      }
    } catch (error) {
      // Fallback: draw placeholder
      addImagePlaceholder(
        doc,
        imageX,
        imageY,
        imageWidth,
        imageHeight,
        "Image Error"
      );
    }
  } else {
    addImagePlaceholder(
      doc,
      imageX,
      imageY,
      imageWidth,
      imageHeight,
      "No Image"
    );
  }
};

// Add image placeholder
export const addImagePlaceholder = (
  doc: jsPDF,
  imageX: number,
  imageY: number,
  imageWidth: number,
  imageHeight: number,
  text: string
): void => {
  doc.setFillColor(...PDF_COLORS.lightGray);
  doc.rect(imageX, imageY, imageWidth, imageHeight, "F");
  doc.setTextColor(...PDF_COLORS.darkGray);
  doc.setFontSize(8);
  doc.setFont("helvetica", "italic");
  const textWidth = doc.getTextWidth(text);
  doc.text(
    text,
    imageX + (imageWidth - textWidth) / 2,
    imageY + imageHeight / 2
  );
};

// Add card header (location and serial number)
export const addCardHeader = (
  doc: jsPDF,
  cardX: number,
  cardY: number,
  cardWidth: number,
  location: string | null | undefined,
  cardNumber: number
): void => {
  // Card header (white background with border)
  doc.setFillColor(...PDF_COLORS.white);
  doc.rect(cardX, cardY, cardWidth, 8, "F");

  // Add border for the white header
  doc.setLineWidth(0.2);
  doc.setDrawColor(...PDF_COLORS.gray);
  doc.rect(cardX, cardY, cardWidth, 8);

  // Card header text
  doc.setTextColor(...PDF_COLORS.black);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text(location || "No Location", cardX + 2, cardY + 5.5);

  // Card number on right
  const cardNumberText = `[${cardNumber}]`;
  const numberWidth = doc.getTextWidth(cardNumberText);
  doc.text(cardNumberText, cardX + cardWidth - numberWidth - 2, cardY + 5.5);
};

// Add observations section
export const addObservationsSection = (
  doc: jsPDF,
  cardX: number,
  obsY: number,
  cardWidth: number,
  obsHeight: number,
  observations: string | null | undefined
): void => {
  // Observations background
  doc.setFillColor(249, 249, 249);
  doc.rect(cardX + 1, obsY, cardWidth - 2, obsHeight, "F");

  // Observations title
  doc.setTextColor(...PDF_COLORS.black);
  doc.setFontSize(8);
  doc.setFont("helvetica", "bold");
  doc.text("Observations:", cardX + 1.5, obsY + 2); // Changed from +3 to +1.5

  // Observations content
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7);
  const truncatedObs = observations || "No observations";
  const maxWidth = cardWidth - 2;
  const lines = doc.splitTextToSize(truncatedObs, maxWidth);

  // Limit to available space
  const maxLines = Math.floor((obsHeight - 6) / 2.5);
  const displayLines = lines.slice(0, maxLines);

  displayLines.forEach((line: string, lineIndex: number) => {
    doc.text(line, cardX + 1.5, obsY + 6 + lineIndex * 2.5); // Changed from +3 to +1.5
  });
};

// Add final card border (encompassing all sections)
export const addCardBorder = (
  doc: jsPDF,
  cardX: number,
  cardY: number,
  cardWidth: number,
  cardHeight: number
): void => {
  doc.setLineWidth(0.2);
  doc.setDrawColor(...PDF_COLORS.gray);
  doc.rect(cardX, cardY, cardWidth, cardHeight);
};
