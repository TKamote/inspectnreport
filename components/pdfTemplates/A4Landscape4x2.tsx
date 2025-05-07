import { CardData } from "../../types/pdfTypes";
import { HeaderData } from "../../types/types";
import {
  generateCommonStyles,
  generateHeaderHTML,
  generateFooterHTML,
} from "./commonPdfElements";

// Helper function to truncate text
function truncateText(text: string, maxLength: number = 150): string {
  if (!text) return "No observations";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

export const generateA4Landscape4x2 = (
  cards: CardData[],
  headerData: HeaderData,
  includeHeader: boolean
): string => {
  // Define cards per page (4x2 grid = 8 cards)
  const cardsPerPage = 8;
  const pageCount = Math.ceil(cards.length / cardsPerPage);

  // Generate the header HTML once to reuse
  const headerHTML = includeHeader
    ? generateHeaderHTML(headerData)
    : '<div class="minimal-header"><div class="report-title">Inspection Report</div></div>';

  // Generate HTML for all pages with page breaks
  let pagesHTML = "";
    for (let page = 0; pageCount > page; page++) {
      // Get the cards for this page
      const startIndex = page * cardsPerPage;
      const pageCards = cards.slice(startIndex, startIndex + cardsPerPage);
    
    // Generate HTML for each card
    const pageCardItems = pageCards
      .map((card, index) => {
        const globalIndex = startIndex + index; // Calculate the global index for numbering
        return `
        <div class="card">
          <div class="card-header">
            <span class="card-location">${card.location || "No Location"}</span>
            <span class="card-number">[${globalIndex + 1}]</span>
          </div>
          <div class="card-image">
            ${
              card.photo
                ? `
                <div class="image-container">
                  <img src="${card.photo}" alt="Photo" />
                  <div class="timestamp">${card.timestamp || ""}</div>
                </div>
              `
                : `
                <div class="no-image">
                  <span>No Image</span>
                </div>
              `
            }
          </div>
          <div class="card-observations">
            <div class="observations-title">Observations:</div>
            <div class="observations-content">${truncateText(
              card.observations || "No observations",
              150 // Shorter text limit for 4 columns
            )}</div>
          </div>
        </div>
      `;
      })
      .join("");

    // Only add page break if this is NOT the last page AND there are more cards coming
    const isLastPage = page === pageCount - 1;
    const needsPageBreak = !isLastPage;

    pagesHTML += `
      <div class="page">
        <div class="page-header">
          ${headerHTML}
        </div>
        
        <div class="page-content">
          <div class="grid-container${
            pageCards.length <= 4 ? " single-row" : ""
          }">
            ${pageCardItems}
          </div>
        </div>
        
        <div class="page-footer">
          ${generateFooterHTML(
            headerData.typeOfReport || "Inspection Report",
            page + 1,
            pageCount
          )}
        </div>
        
        ${needsPageBreak ? '<div class="page-break"></div>' : ""}
      </div>
    `;
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${headerData.typeOfReport || "Inspection Report"}</title>
      <style>
        ${generateCommonStyles()}
        
        /* Define A4 page size explicitly as LANDSCAPE and remove ALL margins */
        @page {
          size: A4 landscape;
          margin: 0;
          orphans: 0;
          widows: 0;
        }

        /* Reset all browser default margins and padding */
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        /* Make sure the body has no margins */
        body {
          font-family: 'Helvetica Neue', Arial, sans-serif;
          font-size: 10px;
          margin: 0;
          padding: 0;
          color: #333;
        }

        /* Container should also have no margins */
        .container {
          margin: 0;
          padding: 0;
          page-break-after: avoid !important;
        }

        /* Page structure with landscape dimensions */
        .page {
          position: relative;
          width: 297mm;
          height: 208mm; /* Reduced from 210mm to 208mm to prevent extra page */
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          overflow: hidden;
          page-break-after: avoid;
          page-break-inside: avoid;
        }

        /* Fix for the last page specifically */
        .page:last-child {
          page-break-after: avoid !important;
          page-break-inside: avoid !important;
        }

        /* Header fixed at top of page */
        .page-header {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          width: 100%;
          padding: 5mm 15mm;
        }

        /* Page content positioning - adjust spacing with explicit height */
        .page-content {
          position: absolute;
          top: 33mm; /* add from 22mm to move content down */
          bottom: 15mm;
          left: 0;
          right: 0;
          width: 91%;
          height: 171mm; /* Increased from 168mm to use more vertical space */
          margin: 0 auto;
          overflow: visible;
          padding-top: 5mm;
        }

        /* Footer fixed at bottom of page */
        .page-footer {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          width: 100%;
          padding: 5mm 15mm;
          text-align: center;
          background-color: white;
        }

        /* Improved header layout */
        .header-row {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          margin-bottom: 5px;
        }

        /* Fix the date field visibility */
        .header-value {
          margin-right: 15px;
          font-size: 10px;
          max-width: 180px;
          white-space: normal;
        }

        /* Date section - ensure visibility */
        .date-section {
          display: flex;
          align-items: center;
          min-width: 120px;
          max-width: 180px;
          margin-left: auto;
        }

        /* Report title - with margins and padding removed */
        .report-title {
          font-size: 16px;
          font-weight: bold;
          margin-top: 0;
          margin-bottom: 0;
          padding-top: 0;
        }
        
        /* Header labels - reduced to 10px as requested */
        .header-label {
          font-weight: bold;
          margin-right: 5px;
          font-size: 10px;
        }
        
        /* Ensure card headers are always visible */
        .card-header {
          background-color: #007BFF;
          color: #000;
          padding: 5px 8px;
          font-weight: bold;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 9px;
          z-index: 10;
          position: relative;
        }

        /* Ensure all card header content is visible */
        .card-location, .card-number {
          display: inline-block; 
          position: relative;
          z-index: 2;
          opacity: 1 !important;
        }

        /* Fix for first row cards to ensure header visibility */
        .grid-container > .card:nth-child(-n+4) .card-header {
          position: relative;
          z-index: 15;
        }

        /* Ensure second row cards are fully visible */
        .grid-container > .card:nth-child(n+5) {
          position: relative;
          z-index: 5;
        }

        /* Ensure second row observations are fully visible */
        .grid-container > .card:nth-child(n+5) .card-observations {
          position: relative;
          z-index: 6;
        }
        
        /* Other elements should keep consistent proportions */
        .observations-title {
          font-weight: bold;
          margin-bottom: 2px;
          color: #333;
          font-size: 9px;
          display: inline-block;
        }
        
        .observations-content {
          white-space: pre-wrap;
          font-size: 8px;
          line-height: 1.2;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 6;
          -webkit-box-orient: vertical;
          color: #333;
        }
        
        /* A4 Landscape 4x2 specific styles */
        .grid-container {
          display: grid;
          grid-template-columns: repeat(4, 1fr); /* 4 equal columns */
          grid-template-rows: repeat(2, auto); /* 2 auto-sized rows */
          gap: 25px 10px; /* Increased vertical gap to 15px */
          margin-bottom: 2px;
          width: 100%; /* Keeping this at 100% as requested */
          margin-left: auto;
          margin-right: auto;
        }
        
        /* Special styling for a single row (1-4 cards) */
        .grid-container.single-row {
          margin-bottom: 30px;
        }
        
        /* Image container with 4:3 aspect ratio */
        .image-container {
          position: relative;
          width: 100%;
          padding-top: 75%; /* 4:3 ratio = 75% */
          overflow: hidden;
        }

        /* Position image absolutely within container */
        .image-container img {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          display: block;
        }

        /* Card image wrapper to hold the container */
        .card-image {
          position: relative;
          margin-bottom: 2px;
        }

        /* No image container - match the aspect ratio */
        .no-image {
          display: flex;
          width: 100%;
          padding-top: 75%; /* Match the 4:3 ratio */
          position: relative;
        }

        /* No image text - center it properly */
        .no-image span {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #888;
          font-style: italic;
          background-color: #e0e0e0;
          font-size: 9px;
        }
        
        /* Clean, minimal timestamp styling */
        .timestamp {
          position: absolute;
          bottom: 5px;
          right: 5px; 
          width: auto;
          text-align: right;
          background-color: rgba(0, 0, 0, 0.5);
          color: #ddd;
          font-size: 7px;
          padding: 1px 2px;
          line-height: 1;
          z-index: 100;
          font-family: monospace;
          border-radius: 2px;
          margin: 0;
        }
        
        /* Properly handle page breaks */
        .page-break {
          page-break-after: always !important;
          page-break-before: auto !important;
          height: 0;
          visibility: hidden;
          display: block;
          margin: 0;
          padding: 0;
        }
        
        /* Card styling - adjust height for better vertical distribution */
        .card {
          page-break-inside: avoid;
          display: flex;
          flex-direction: column;
          position: relative;
          margin-bottom: 5px;
          max-height: 70mm; /* Increased from 65mm to use more vertical space */
          border: 1px solid #ccc; /* Add outer border to entire card */
        }
        
        /* Add this to the last page */
        .page:last-of-type {
          page-break-after: avoid;
        }
        
        /* Observations styling - increase height */
        .card-observations {
          padding: 6px 8px 5px;
          max-height: 80px; /* Increased from 70px */
          overflow: hidden;
          background-color: #f9f9f9;
        }

        /* Force proper page breaks in PDF output */
        html, body {
          height: auto !important;
          overflow: visible !important;
        }
      </style>
    </head>
    <body>
      <div class="container">
        ${pagesHTML}
      </div>
    </body>
    </html>
  `;
};
