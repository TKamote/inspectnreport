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

const getContentSpacing = (includeHeader: boolean, headerHeight: number): number => {
  if (!includeHeader) {
    // No header selected - use reduced spacing for default title
    return 20; // Changed from 15 to 10 (additional 5mm reduction)
  } else {
    // Full header selected - use normal spacing
    return 30; // Normal spacing when full header is displayed
  }
};

export const generateA4Portrait2x2 = (
  cards: CardData[],
  headerData: HeaderData,
  includeHeader: boolean = true
): jsPDF => {
  const doc = new jsPDF("portrait", "mm", "a4");

  // Page dimensions
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 15; // Keep for content positioning  
  const headerFooterMargin = 23; // Changed from 21 to 23 (+8mm for header/footer)
  const footerHeight = 15;

  // Grid setup for 2x2
  const cardsPerPage = 4;
  const cols = 2;
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
    const cardWidth = ((pageWidth - 2 * margin - 20) / cols) * 0.83; //

    // Image dimensions (3:4 ratio - tall images)
    const imageWidth = cardWidth; // Full width minus 1px padding each side
    const imageHeight = imageWidth * 1.33; // 3:4 ratio (taller images)

    // THEN use imageHeight in cardHeight:
    const cardHeight = imageHeight + 25; // Image-driven but minimal space

    // Get cards for this page
    const startIndex = pageIndex * cardsPerPage;
    const pageCards = cards.slice(startIndex, startIndex + cardsPerPage);

    // Draw cards in 2x2 grid
    pageCards.forEach((card, cardIndex) => {
      const col = cardIndex % cols;
      const row = Math.floor(cardIndex / cols);

      const totalUsedWidth = cols * cardWidth + (cols - 1) * 20; // Total width used by cards and gaps
      const horizontalOffset = (pageWidth - 2 * margin - totalUsedWidth) / 2; // Center horizontally
      const cardX = margin + horizontalOffset + col * (cardWidth + 20);
      const cardY = headerHeight + getContentSpacing(includeHeader, headerHeight) + row * (cardHeight + 5);

      // Image area (touches side borders)
      const imageX = cardX; // Start at card edge + 1px padding
      const imageY = cardY + 8;

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
      const obsY = imageY + imageHeight + 1;
      const obsHeight = cardY + cardHeight - obsY - 1;

      // Add observations section
      addObservationsSection(
        doc,
        cardX,
        obsY,
        cardWidth - 2,
        obsHeight,
        card.observations
      );

      // Add final card border (at the very end)
      addCardBorder(doc, cardX, cardY, cardWidth, cardHeight);
    });

    // Add footer using common function
    addFooterToDoc(doc, currentPage, totalPages, pageWidth, pageHeight, headerFooterMargin);
  }

  return doc;
};

// React Native compatible download function
export const downloadA4Portrait2x2PDF = async (
  cards: CardData[],
  headerData: HeaderData,
  includeHeader: boolean = true
): Promise<string | null> => {
  try {
    const doc = generateA4Portrait2x2(cards, headerData, includeHeader);

    const pdfDataUri = doc.output("datauristring");
    const base64Data = pdfDataUri.split(",")[1];

    return base64Data;
  } catch (error) {
    return null;
  }
};
