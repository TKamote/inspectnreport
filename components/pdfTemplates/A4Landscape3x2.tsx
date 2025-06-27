import jsPDF from 'jspdf';
import { CardData } from "../../types/pdfTypes";
import { HeaderData } from "../../types/types";
import { addHeaderToDoc, addFooterToDoc, PDF_COLORS } from './commonPdfElements';

// Helper function to truncate text
function truncateText(text: string, maxLength: number = 300): string {
  if (!text) return "No observations";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

export const generateA4Landscape3x2 = (
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
    const headerHeight = addHeaderToDoc(doc, headerData, pageWidth, includeHeader, margin);
    
    // Calculate available space for cards
    const availableHeight = pageHeight - headerHeight - footerHeight - margin;
    const cardWidth = (pageWidth - (2 * margin) - 20) / cols; // 20mm gap between columns
    const cardHeight = (availableHeight - 10) / rows; // 10mm gap between rows
    
    // Image dimensions (80% of card width, 3:4 ratio)
    const imageWidth = cardWidth * 0.8;
    const imageHeight = imageWidth * 0.75; // 3:4 ratio
    
    // Get cards for this page
    const startIndex = pageIndex * cardsPerPage;
    const pageCards = cards.slice(startIndex, startIndex + cardsPerPage);
    
    // Draw cards in 3x2 grid
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
      doc.rect(cardX, cardY, cardWidth, 8, 'F');
      
      // Card header text
      doc.setTextColor(...PDF_COLORS.black);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text(card.location || 'No Location', cardX + 2, cardY + 5.5);
      
      // Card number on right
      const cardNumber = `[${startIndex + cardIndex + 1}]`;
      const numberWidth = doc.getTextWidth(cardNumber);
      doc.text(cardNumber, cardX + cardWidth - numberWidth - 2, cardY + 5.5);
      
      // Image area (centered, 80% width)
      const imageX = cardX + (cardWidth - imageWidth) / 2;
      const imageY = cardY + 12;
      
      if (card.photo) {
        try {
          doc.addImage(card.photo, 'JPEG', imageX, imageY, imageWidth, imageHeight);
        } catch (error) {
          console.error('Error adding image:', error);
          // Fallback: draw placeholder
          doc.setFillColor(...PDF_COLORS.lightGray);
          doc.rect(imageX, imageY, imageWidth, imageHeight, 'F');
          doc.setTextColor(...PDF_COLORS.darkGray);
          doc.setFontSize(8);
          doc.setFont('helvetica', 'italic');
          const noImageText = 'No Image';
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
        doc.rect(imageX, imageY + imageHeight - 6, imageWidth, 6, 'F');
        doc.setTextColor(...PDF_COLORS.white);
        doc.setFontSize(6);
        doc.setFont('helvetica', 'normal');
        doc.text(card.timestamp, imageX + 2, imageY + imageHeight - 2);
      }
      
      // Observations section
      const obsY = imageY + imageHeight + 3;
      const obsHeight = cardY + cardHeight - obsY - 2;
      
      // Observations background
      doc.setFillColor(249, 249, 249);
      doc.rect(cardX + 1, obsY, cardWidth - 2, obsHeight, 'F');
      
      // Observations title
      doc.setTextColor(...PDF_COLORS.black);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('Observations:', cardX + 3, obsY + 5);
      
      // Observations content
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      const observations = truncateText(card.observations || 'No observations');
      const maxWidth = cardWidth - 6;
      const lines = doc.splitTextToSize(observations, maxWidth);
      
      // Limit to available space
      const maxLines = Math.floor((obsHeight - 8) / 2.5);
      const displayLines = lines.slice(0, maxLines);
      
      displayLines.forEach((line: string, lineIndex: number) => {
        doc.text(line, cardX + 3, obsY + 10 + lineIndex * 2.5);
      });
    });
    
    // Add footer using common function
    addFooterToDoc(doc, currentPage, totalPages, pageWidth, pageHeight, margin);
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
    console.log('Starting A4Landscape3x2 PDF generation...');
    
    const doc = generateA4Landscape3x2(cards, headerData, includeHeader);
    
    console.log('PDF document created, converting to base64...');
    
    // Get base64 data (React Native compatible)
    const pdfDataUri = doc.output('datauristring');
    const base64Data = pdfDataUri.split(',')[1];
    
    console.log('Base64 conversion complete, length:', base64Data.length);
    
    return base64Data;
    
  } catch (error) {
    console.error('Error in downloadA4Landscape3x2PDF:', error);
    return null;
  }
};