import jsPDF from 'jspdf';
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
} from './commonPdfElements';

// Helper function to truncate text
function truncateText(text: string, maxLength: number = 150): string {
  if (!text) return "No observations";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

export const generateA4Landscape4x2 = (
  cards: CardData[],
  headerData: HeaderData,
  includeHeader: boolean = true
): jsPDF => {
  const doc = new jsPDF('landscape', 'mm', 'a4');
  
  // Page dimensions (landscape)
  const pageWidth = 297;
  const pageHeight = 210;
  const margin = 15;
  const footerHeight = 15;
  
  // Grid setup for 4x2
  const cardsPerPage = 8;
  const cols = 4;
  const rows = 2;
  
  let currentPage = 1;
  const totalPages = Math.ceil(cards.length / cardsPerPage);
  
  for (let pageIndex = 0; pageIndex < totalPages; pageIndex++) {
    if (pageIndex > 0) {
      doc.addPage();
      currentPage++;
    }
    
    // Add header using common function
    const headerHeight = addHeaderToDoc(doc, headerData, pageWidth, includeHeader, margin);
    
    // Calculate available space for cards
    const availableHeight = pageHeight - headerHeight - footerHeight - margin;
    const cardWidth = (pageWidth - (2 * margin) - 30) / cols; // 30mm gap between columns
    const cardHeight = (availableHeight - 10) / rows; // 10mm gap between rows
    
    // Image dimensions (4:3 ratio - wide images)
    const imageWidth = cardWidth - 2; // Full width minus 1px padding each side
    const imageHeight = imageWidth * 0.75; // 4:3 ratio (wider images)
    
    // Get cards for this page
    const startIndex = pageIndex * cardsPerPage;
    const pageCards = cards.slice(startIndex, startIndex + cardsPerPage);
    
    // Draw cards in 4x2 grid
    pageCards.forEach((card, cardIndex) => {
      const col = cardIndex % cols;
      const row = Math.floor(cardIndex / cols);
      
      const cardX = margin + col * (cardWidth + 10);
      const cardY = headerHeight + margin + row * (cardHeight + 5);
      
      // Image area (touches side borders)
      const imageX = cardX + 1; // Start at card edge + 1px padding
      const imageY = cardY + 12;
      
      // Add card header
      addCardHeader(doc, cardX, cardY, cardWidth, card.location, startIndex + cardIndex + 1);
      
      // Add image with automatic fallback
      addImageToCard(doc, card.photo, imageX, imageY, imageWidth, imageHeight, cardIndex);
      
      // Add timestamp if exists
      if (card.timestamp && card.photo) {
        addTimestampToImage(doc, card.timestamp, imageX, imageY, imageHeight);
      }
      
      // Observations section
      const obsY = imageY + imageHeight + 3;
      const obsHeight = cardY + cardHeight - obsY - 2;
      
      // Add observations section
      addObservationsSection(doc, cardX, obsY, cardWidth, obsHeight, card.observations);
      
      // Add final card border (at the very end)
      addCardBorder(doc, cardX, cardY, cardWidth, cardHeight);
    });
    
    // Add footer using common function
    addFooterToDoc(doc, currentPage, totalPages, pageWidth, pageHeight, margin);
  }
  
  return doc;
};

// React Native compatible download function
export const downloadA4Landscape4x2PDF = async (
  cards: CardData[],
  headerData: HeaderData,
  includeHeader: boolean = true
): Promise<string | null> => {
  try {
    console.log('Starting A4Landscape4x2 PDF generation...');
    
    const doc = generateA4Landscape4x2(cards, headerData, includeHeader);
    
    console.log('PDF document created, converting to base64...');
    
    const pdfDataUri = doc.output('datauristring');
    const base64Data = pdfDataUri.split(',')[1];
    
    console.log('Base64 conversion complete, length:', base64Data.length);
    
    return base64Data;
    
  } catch (error) {
    console.error('Error in downloadA4Landscape4x2PDF:', error);
    return null;
  }
};