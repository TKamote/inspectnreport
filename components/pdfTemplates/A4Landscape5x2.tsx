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
function truncateText(text: string, maxLength: number = 100): string {
  if (!text) return "No observations";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

const getContentSpacing = (
  includeHeader: boolean,
  headerHeight: number
): number => {
  if (!includeHeader) {
    return 10; // Reduced spacing for default title
  } else {
    return 10; // Normal spacing when full header is displayed (already tight)
  }
};

export const generateA4Landscape5x2 = (
  cards: CardData[],
  headerData: HeaderData,
  includeHeader: boolean = true
): jsPDF => {
  const doc = new jsPDF("landscape", "mm", "a4");

  // Page dimensions (landscape)
  const pageWidth = 297;
  const pageHeight = 210;
  const margin = 15; // Keep for content positioning
  const headerFooterMargin = 23; // Changed from 17 to 23 (+8mm for header/footer)
  const footerHeight = 15;

  // Grid setup for 5x2
  const cardsPerPage = 10;
  const cols = 5;
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
    const cardWidth = ((pageWidth - 2 * margin - 32) / cols) * 0.9; // Changed from fixed calculation, reserve 32mm for 4×8mm gaps

    // Image dimensions (3:4 ratio - tall images)
    const imageWidth = cardWidth; // Remove the -2 padding
    const imageHeight = imageWidth * 1.33; // Keep 3:4 ratio (portrait images)
    const cardHeight = imageHeight + 24; // Changed from +25 to +24 (regain 1px)

    // Get cards for this page
    const startIndex = pageIndex * cardsPerPage;
    const pageCards = cards.slice(startIndex, startIndex + cardsPerPage);

    // Draw cards in 5x2 grid
    pageCards.forEach((card, cardIndex) => {
      const col = cardIndex % cols;
      const row = Math.floor(cardIndex / cols);

      const totalUsedWidth = cols * cardWidth + (cols - 1) * 8; // Use 8mm gaps (reduced from 10mm)
      const horizontalOffset = (pageWidth - 2 * margin - totalUsedWidth) / 2; // Center horizontally
      const cardX = margin + horizontalOffset + col * (cardWidth + 8); // Add horizontal offset with 8mm gaps;
      const cardY =
        headerHeight +
        getContentSpacing(includeHeader, headerHeight) +
        row * (cardHeight + 2); // Changed from +5 to +2 (regain 3px per row)

      // Image area (touches side borders)
      const imageX = cardX; // Remove the +1 padding
      const imageY = cardY + 8; // Change from 12 to 8

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
      const obsY = imageY + imageHeight + 2; // Change from +3 to +2
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
    addFooterToDoc(
      doc,
      currentPage,
      totalPages,
      pageWidth,
      pageHeight,
      headerFooterMargin
    );
  }

  return doc;
};

// React Native compatible download function
export const downloadA4Landscape5x2PDF = async (
  cards: CardData[],
  headerData: HeaderData,
  includeHeader: boolean = true
): Promise<string | null> => {
  try {
    const doc = generateA4Landscape5x2(cards, headerData, includeHeader);

    const pdfDataUri = doc.output("datauristring");
    const base64Data = pdfDataUri.split(",")[1];

    return base64Data;
  } catch (error) {
    return null;
  }
};
