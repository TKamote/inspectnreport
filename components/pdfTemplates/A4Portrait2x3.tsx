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

export const generateA4Portrait2x3 = (
  cards: CardData[],
  headerData: HeaderData,
  includeHeader: boolean = true
): jsPDF => {
  const doc = new jsPDF("portrait", "mm", "a4");

  // Page dimensions
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 15;
  const footerHeight = 15;

  // Grid setup for 2x3
  const cardsPerPage = 6;
  const cols = 2;
  const rows = 3;

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
      margin
    );

    // Calculate available space for cards
    const availableHeight = pageHeight - headerHeight - footerHeight - margin;
    const cardWidth = ((pageWidth - 2 * margin - 10) / cols) * 0.82;

    // Image dimensions (4:3 ratio - wide images)
    const imageWidth = cardWidth; // Remove the -2
    const imageHeight = imageWidth * 0.75; // 4:3 ratio (wider images)
    const cardHeight = imageHeight + 25;

    // Get cards for this page
    const startIndex = pageIndex * cardsPerPage;
    const pageCards = cards.slice(startIndex, startIndex + cardsPerPage);

    // Draw cards in 2x3 grid
    pageCards.forEach((card, cardIndex) => {
      const col = cardIndex % cols;
      const row = Math.floor(cardIndex / cols);

      const totalUsedWidth = cols * cardWidth + (cols - 1) * 13; // Changed from 5 to 15 (larger gap)
      const horizontalOffset = (pageWidth - 2 * margin - totalUsedWidth) / 2;
      const cardX = margin + horizontalOffset + col * (cardWidth + 13); // Changed from 5 to 15
      const cardY = headerHeight + margin + 15 + row * (cardHeight + 4); // Add +10 for extra spacing

      // Image area (touches side borders)
      const imageX = cardX; // Remove the +1
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
      const obsY = imageY + imageHeight + 2; // Add 2px gap between image and observations
      const obsHeight = cardY + cardHeight - obsY - 1;

      // Add observations section
      addObservationsSection(
        doc,
        cardX,
        obsY,
        cardWidth - 2, // Changed from cardWidth - 4 to cardWidth - 2
        obsHeight,
        card.observations
      );

      // Add final card border (at the very end)
      addCardBorder(doc, cardX, cardY, cardWidth, cardHeight);
    });

    // Add footer using common function
    addFooterToDoc(doc, currentPage, totalPages, pageWidth, pageHeight, margin);
  }

  return doc;
};

// React Native compatible download function
export const downloadA4Portrait2x3PDF = async (
  cards: CardData[],
  headerData: HeaderData,
  includeHeader: boolean = true
): Promise<string | null> => {
  try {
    console.log("Starting A4Portrait2x3 PDF generation...");

    const doc = generateA4Portrait2x3(cards, headerData, includeHeader);

    console.log("PDF document created, converting to base64...");

    const pdfDataUri = doc.output("datauristring");
    const base64Data = pdfDataUri.split(",")[1];

    console.log("Base64 conversion complete, length:", base64Data.length);

    return base64Data;
  } catch (error) {
    console.error("Error in downloadA4Portrait2x3PDF:", error);
    return null;
  }
};
