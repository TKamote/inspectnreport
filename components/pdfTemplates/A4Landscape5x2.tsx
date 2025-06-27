import jsPDF from 'jspdf';
import { CardData } from "../../types/pdfTypes";
import { HeaderData } from "../../types/types";
import { addHeaderToDoc, addFooterToDoc, PDF_COLORS } from './commonPdfElements';

// Helper function to truncate text
function truncateText(text: string, maxLength: number = 100): string {
  if (!text) return "No observations";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

export const generateA4Landscape5x2 = (
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
    const headerHeight = addHeaderToDoc(doc, headerData, pageWidth, includeHeader, margin);
    
    // Calculate available space for cards
    const availableHeight = pageHeight - headerHeight - footerHeight - margin;
    const cardWidth = (pageWidth - (2 * margin) - 40) / cols; // 40mm gap between columns
    const cardHeight = (availableHeight - 10) / rows; // 10mm gap between rows
    
    // Image dimensions (80% of card width, 3:4 ratio)
    const imageWidth = cardWidth * 0.8;
    const imageHeight = imageWidth * 0.75; // 3:4 ratio
    
    // Get cards for this page
    const startIndex = pageIndex * cardsPerPage;
    const pageCards = cards.slice(startIndex, startIndex + cardsPerPage);
    
    // Draw cards in 5x2 grid
    pageCards.forEach((card, cardIndex) => {
      const col = cardIndex % cols;
      const row = Math.floor(cardIndex / cols);
      
      const cardX = margin + col * (cardWidth + 10);
      const cardY = headerHeight + margin + row * (cardHeight + 5);
      
      // Draw card border
      doc.setLineWidth(0.3);
      doc.setDrawColor(...PDF_COLORS.gray);
      doc.rect(cardX, cardY, cardWidth, cardHeight);
      
      // Card header (blue background)
      doc.setFillColor(...PDF_COLORS.blue);
      doc.rect(cardX, cardY, cardWidth, 6, 'F');
      
      // Card header text
      doc.setTextColor(...PDF_COLORS.black);
      doc.setFontSize(6);
      doc.setFont('helvetica', 'bold');
      doc.text(card.location || 'No Location', cardX + 1, cardY + 4);
      
      // Card number on right
      const cardNumber = `[${startIndex + cardIndex + 1}]`;
      const numberWidth = doc.getTextWidth(cardNumber);
      doc.text(cardNumber, cardX + cardWidth - numberWidth - 1, cardY + 4);
      
      // Image area (centered, 80% width)
      const imageX = cardX + (cardWidth - imageWidth) / 2;
      const imageY = cardY + 12; // Adjust this value based on each template's layout
      
      if (card.photo) {
        try {
          // Check if photo is valid base64
          if (card.photo.startsWith('data:image/')) {
            doc.addImage(card.photo, 'JPEG', imageX, imageY, imageWidth, imageHeight);
          } else {
            throw new Error('Invalid image format');
          }
        } catch (error) {
          // Fallback: draw placeholder
          doc.setFillColor(...PDF_COLORS.lightGray);
          doc.rect(imageX, imageY, imageWidth, imageHeight, 'F');
          doc.setTextColor(...PDF_COLORS.darkGray);
          doc.setFontSize(8);
          doc.setFont('helvetica', 'italic');
          const noImageText = 'Image Error';
          const textWidth = doc.getTextWidth(noImageText);
          doc.text(noImageText, imageX + (imageWidth - textWidth) / 2, imageY + imageHeight / 2);
        }
      } else {
        // No image placeholder
        doc.setFillColor(...PDF_COLORS.lightGray);
        doc.rect(imageX, imageY, imageWidth, imageHeight, 'F');
        doc.setTextColor(...PDF_COLORS.darkGray);
        doc.setFontSize(8);
        doc.setFont('helvetica', 'italic');
        const noImageText = 'No Image';
        const textWidth = doc.getTextWidth(noImageText);
        doc.text(noImageText, imageX + (imageWidth - textWidth) / 2, imageY + imageHeight / 2);
      }
      
      // Timestamp overlay (if exists)
      if (card.timestamp && card.photo) {
        doc.setFillColor(0, 0, 0, 0.7);
        doc.rect(imageX, imageY + imageHeight - 5, imageWidth, 5, 'F');
        doc.setTextColor(...PDF_COLORS.white);
        doc.setFontSize(4);
        doc.setFont('helvetica', 'normal');
        doc.text(card.timestamp, imageX + 1, imageY + imageHeight - 1.5);
      }
      
      // Observations section
      const obsY = imageY + imageHeight + 2;
      const obsHeight = cardY + cardHeight - obsY - 1;
      
      // Observations background
      doc.setFillColor(249, 249, 249);
      doc.rect(cardX + 0.5, obsY, cardWidth - 1, obsHeight, 'F');
      
      // Observations title
      doc.setTextColor(...PDF_COLORS.black);
      doc.setFontSize(6);
      doc.setFont('helvetica', 'bold');
      doc.text('Observations:', cardX + 2, obsY + 3);
      
      // Observations content
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(5);
      const observations = truncateText(card.observations || 'No observations');
      const maxWidth = cardWidth - 4;
      const lines = doc.splitTextToSize(observations, maxWidth);
      
      // Limit to available space
      const maxLines = Math.floor((obsHeight - 6) / 1.5);
      const displayLines = lines.slice(0, maxLines);
      
      displayLines.forEach((line: string, lineIndex: number) => {
        doc.text(line, cardX + 2, obsY + 6 + lineIndex * 1.5);
      });
    });
    
    // Add footer using common function
    addFooterToDoc(doc, currentPage, totalPages, pageWidth, pageHeight, margin);
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
    console.log('Starting A4Landscape5x2 PDF generation...');
    
    const doc = generateA4Landscape5x2(cards, headerData, includeHeader);
    
    console.log('PDF document created, converting to base64...');
    
    // Get base64 data (React Native compatible)
    const pdfDataUri = doc.output('datauristring');
    const base64Data = pdfDataUri.split(',')[1];
    
    console.log('Base64 conversion complete, length:', base64Data.length);
    
    return base64Data;
    
  } catch (error) {
    console.error('Error in downloadA4Landscape5x2PDF:', error);
    return null;
  }
};