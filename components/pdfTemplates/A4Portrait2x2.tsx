import { CardData } from "../../types/pdfTypes";
import { HeaderData } from "../../types/types";
import {
  generateCommonStyles,
  generateHeaderHTML,
  generateFooterHTML,
} from "./commonPdfElements";

// Helper function to truncate text
function truncateText(text: string, maxLength: number = 300): string {
  if (!text) return "No observations";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

export const generateA4Portrait2x2 = (
  cards: CardData[],
  headerData: HeaderData,
  includeHeader: boolean
): string => {
  // Define cards per page (2x2 grid = 4 cards)
  const cardsPerPage = 4;
  const pageCount = Math.ceil(cards.length / cardsPerPage);

  // Generate the header HTML once to reuse
  const headerHTML = includeHeader
    ? generateHeaderHTML(headerData)
    : '<div class="minimal-header"><div class="report-title">Inspection Report</div></div>';

  // Generate HTML for all pages with page breaks
  let pagesHTML = "";

  // Loop through pages with proper termination condition
  for (let page = 0; page < pageCount; page++) {
    const startIndex = page * cardsPerPage;
    const pageCards = cards.slice(startIndex, startIndex + cardsPerPage);

    // Skip if there are no cards for this page
    if (pageCards.length === 0) continue;

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
              card.observations || "No observations"
            )}</div>
          </div>
        </div>
      `;
      })
      .join("");

    // Only add page break if this is NOT the last page AND there are more cards coming
    const isLastPage = page === pageCount - 1;
    const needsPageBreak = !isLastPage;

    // Explicitly add header and footer to EVERY page with proper content area
    pagesHTML += `
      <div class="page">
        <div class="page-header">
          ${headerHTML}
        </div>
        
        <div class="page-content">
          <div class="grid-container${
            pageCards.length <= 2 ? " single-row" : ""
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

  // Build the complete HTML document
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${headerData.typeOfReport || "Inspection Report"}</title>
      <style>
        ${generateCommonStyles()}
        
        /* Define A4 page size explicitly and remove ALL margins */
        @page {
          size: A4 portrait;
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
          font-size: 11px;
          margin: 0;
          padding: 0;
          color: #333;
          
        }

        /* Container should also have no margins */
        .container {
          margin: 0;
          padding: 0;
          page-break-after: avoid !important;
           background-color: yellow;
        }

        /* Page structure with reduced height */
        .page {
          position: relative;
          width: 210mm;
          height: 295mm; /* Reduced from 297mm to 295mm */
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
          top: 30mm;
          bottom: 20mm;
          left: 0;
          right: 0;
          width: 90%;
          height: 260mm; /* Explicitly set height to control content area */
          margin: 0 auto;
          overflow: hidden; /* Keep this to prevent content spilling */
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
          white-space: normal; /* Allow text to wrap */
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
          margin-top: 0; /* Removed 3px margin */
          margin-bottom: 0; /* Removed 5px margin */
          padding-top: 0; /* Removed 2px padding */
        }
        
        /* Header labels - reduced to 10px as requested */
        .header-label {
          font-weight: bold;
          margin-right: 5px;
          font-size: 10px;
        }
        
        /* Ensure card headers are always visible */
        .card-header {
          background-color: #007BFF;  /* Blue background */
          color: #000;               /* black color */
          padding: 6px 10px;
          font-weight: bold;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 10px;
        }

        /* Ensure all card header content is visible 
        .card-location, .card-number {
          display: inline-block; 
          position: relative; /* Add position to ensure stacking context */
        }*/
        
        /* Other elements should keep consistent proportions */
        .observations-title {
          font-weight: bold;
          margin-bottom: 2px; /* Reduced from 4px */
          color: #333;
          font-size: 10px;
          display: inline-block; /* Make it inline to save vertical space */
        }
        
        .observations-content {
          white-space: pre-wrap;
          font-size: 9px;
          line-height: 1.2;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 10; /* Increased from 8 */
          -webkit-box-orient: vertical;
          color: #333;
        }
        
        /* A4 Portrait 2x2 specific styles */
        .grid-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px 50px;
          margin-bottom: 2px; /* Reduce from 15px to 2px */
          width: 82%; 
          margin-left: auto;
          margin-right: auto;
          
        }
        
        /* Special styling for a single row (1-2 cards) */
        .grid-container.single-row {
          margin-bottom: 60px;
        }
        
        /* Image container with 3:4 aspect ratio */
        .image-container {
          position: relative;
          width: 100%;
          padding-top: 133.33%; /* 3:4 ratio = 133.33% */
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
          margin-bottom: 3px; /* Reduced from 5px */
        }

        /* No image container - match the aspect ratio */
        .no-image {
          display: flex;
          width: 100%;
          padding-top: 133.33%; /* Match the same ratio */
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
        }
        
        /* Clean, minimal timestamp styling */
        .timestamp {
          position: absolute;
          bottom: 5px; /* Move to bottom instead of top */
          right: 5px; 
          width: auto;
          text-align: right;
          background-color: rgba(0, 0, 0, 0.5); /* Slightly transparent */
          color: #ddd;
          font-size: 8px; /* Even smaller text */
          padding: 2px 3px; /* Minimal padding */
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
        
        /* Add this to prevent breaking inside of elements with max height */
        .card {
          page-break-inside: avoid;
          display: flex;
          flex-direction: column;
          position: relative;
          margin-bottom: 8px; /* Reduce from 10px to 8px */
          max-height: 120mm; /* Set explicit maximum height for each card */ 
        }
        
        /* Add this to the last page */
        .page:last-of-type {
          page-break-after: avoid;
        }
        
        /* Observations styling - limit height to save space */
        .card-observations {
          padding: 8px 10px 6px;
          max-height: 140px; /* Control the height */
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
