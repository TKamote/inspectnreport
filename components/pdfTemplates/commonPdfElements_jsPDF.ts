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
  margin: number = 15
): number => {
  if (!includeHeader) {
    // Minimal header - just title
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...PDF_COLORS.black);
    const title = "Inspection Report";
    const titleWidth = doc.getTextWidth(title);
    doc.text(title, (pageWidth - titleWidth) / 2, 25);
    return 35; // Return height used
  }

  // Full header
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...PDF_COLORS.black);

  // Company and Created By on first row
  doc.text(`Company: ${headerData.company || "Company Name"}`, margin, 15);
  doc.text(`Created By: ${headerData.createdBy || "Inspector"}`, margin, 25);

  // Report For and Date on second row
  doc.text(`Report For: ${headerData.reportFor || "Client"}`, margin, 35);
  const dateText = `Date: ${
    headerData.date || new Date().toLocaleDateString()
  }`;
  const dateWidth = doc.getTextWidth(dateText);
  doc.text(dateText, pageWidth - margin - dateWidth, 35);

  // Title
  doc.setFontSize(16);
  const title = headerData.typeOfReport || "Inspection Report";
  const titleWidth = doc.getTextWidth(title);
  doc.text(title, (pageWidth - titleWidth) / 2, 50);

  // Header line
  doc.setLineWidth(0.5);
  doc.setDrawColor(...PDF_COLORS.gray);
  doc.line(margin, 55, pageWidth - margin, 55);

  return 65; // Return height used
};

// Add footer to jsPDF document
export const addFooterToDoc = (
  doc: jsPDF,
  currentPage: number,
  totalPages: number,
  pageWidth: number,
  pageHeight: number,
  margin: number = 15
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
