import jsPDF from "jspdf";
import { CardData } from "../../types/pdfTypes";
import { HeaderData } from "../../types/types";
import {
  addHeaderToDoc,
  addFooterToDoc,
  addCardHeader,
  addImageToCard,
  addTimestampToImage,
  addObservationsSection,
  addCardBorder,
  PDF_COLORS,
} from "./commonPdfElements";

// Helper function to truncate text
function truncateText(text: string, maxLength: number = 300): string {
  if (!text) return "No observations";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

const getContentSpacing = (includeHeader: boolean, headerHeight: number): number => {
  if (!includeHeader) {
    return 12; // Reduced spacing for default title
  } else {
    return 15; // Normal spacing when full header is displayed
  }
};

export const generateA4Landscape3x2 = (
  cards: CardData[],
  headerData: HeaderData,
  includeHeader: boolean = true
): jsPDF => {
  const doc = new jsPDF("landscape", "mm", "a4");

  // Page dimensions (landscape)
  const pageWidth = 297;
  const pageHeight = 210;
  const margin = 15; // Keep for content positioning
  const headerFooterMargin = 23; // Changed from 20 to 23 (+8mm for header/footer)
  const footerHeight = 15;

  // Grid setup for 3x2
  const cardsPerPage = 6;
  const cols = 3;
  const rows = 2;

  let currentPage = 1;
  const totalPages = Math.ceil(cards.length / cardsPerPage);

  for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
    if (pageIndex > 0) {
      doc.addPage();
      currentPage++;
    }

    // Add header using common function
    const headerHeight = addHeaderToDoc(
      doc,
      headerData,
      pageWidth,
      includeHeader,
      headerFooterMargin
    );

    // Calculate available space for cards
    const availableHeight = pageHeight - headerHeight - footerHeight - margin;
    const cardWidth = ((pageWidth - 2 * margin - 20) / cols) * 0.85; // Add 0.85 multiplier for centering

    // Image dimensions (4:3 ratio - wide images)
    const imageWidth = cardWidth; // Declare imageWidth first
    const imageHeight = imageWidth * 0.75; // Then declare imageHeight
    const cardHeight = imageHeight + 25; // Then use imageHeight in cardHeight

    // Get cards for this page
    const startIndex = pageIndex * cardsPerPage;
    const pageCards = cards.slice(startIndex, startIndex + cardsPerPage);

    // Draw cards in 3x2 grid
    pageCards.forEach((card, cardIndex) => {
      const col = cardIndex % cols;
      const row = Math.floor(cardIndex / cols);

      const totalUsedWidth = cols * cardWidth + (cols - 1) * 15; // Change from 10 to 15
      const horizontalOffset = (pageWidth - 2 * margin - totalUsedWidth) / 2; // Center horizontally
      const cardX = margin + horizontalOffset + col * (cardWidth + 15); // Changed from +10 to +15
      const cardY = headerHeight + getContentSpacing(includeHeader, headerHeight) + row * (cardHeight + 5); // Add +10

      // Image area (touches side borders)
      const imageX = cardX; // Changed from cardX + 1
      const imageY = cardY + 8; // Changed from 12 to 8

      // Add card header
      addCardHeader(
        doc,
        cardX,
        cardY,
        cardWidth,
        card.location,
        startIndex + cardIndex + 1
      );

      // Add image with automatic fallback
      addImageToCard(
        doc,
        card.photo,
        imageX,
        imageY,
        imageWidth,
        imageHeight,
        cardIndex
      );

      // Add timestamp if exists
      if (card.timestamp && card.photo) {
        addTimestampToImage(doc, card.timestamp, imageX, imageY, imageHeight);
      }

      // Observations section
      const obsY = imageY + imageHeight + 2; // Changed from +3 to +2
      const obsHeight = cardY + cardHeight - obsY; // Remove the -2

      // Add observations section
      addObservationsSection(
        doc,
        cardX,
        obsY,
        cardWidth - 2,
        obsHeight,
        card.observations
      ); // Add -2 to cardWidth

      // Add final card border (at the very end)
      addCardBorder(doc, cardX, cardY, cardWidth, cardHeight);
    });

    // Add footer using common function
    addFooterToDoc(doc, currentPage, totalPages, pageWidth, pageHeight, headerFooterMargin);
  }

  return doc;
};

// React Native compatible download function
export const downloadA4Landscape3x2PDF = async (
  cards: CardData[],
  headerData: HeaderData,
  includeHeader: boolean = true
): Promise<string | null> => {
  try {
    console.log("Starting A4Landscape3x2 PDF generation...");

    const doc = generateA4Landscape3x2(cards, headerData, includeHeader);

    console.log("PDF document created, converting to base64...");

    const pdfDataUri = doc.output("datauristring");
    const base64Data = pdfDataUri.split(",")[1];

    console.log("Base64 conversion complete, length:", base64Data.length);

    return base64Data;
  } catch (error) {
    console.error("Error in downloadA4Landscape3x2PDF:", error);
    return null;
  }
};
