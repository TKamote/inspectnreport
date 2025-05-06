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

export const generateA4Landscape3x2 = (
  cards: CardData[],
  headerData: HeaderData,
  includeHeader: boolean
): string => {
  // Define cards per page (3x2 grid = 6 cards)
  const cardsPerPage = 6;
  const pageCount = Math.max(1, Math.ceil(cards.length / cardsPerPage));

  // Generate the header HTML once to reuse
  const headerHTML = includeHeader
    ? generateHeaderHTML(headerData)
    : '<div class="minimal-header"><div class="report-title">Inspection Report</div></div>';

  // Generate HTML for all pages with page breaks
  let pagesHTML = "";

  for (let page = 0; page < pageCount; page++) {
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

    pagesHTML += `
      <div class="page">
        <div class="page-header">
          ${headerHTML}
        </div>
        
        <div class="page-content">
          <div class="grid-container${
            pageCards.length <= 3 ? " single-row" : ""
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
          top: 30mm;
          bottom: 20mm;
          left: 0;
          right: 0;
          width: 90%;
          height: 163mm; /* Try slightly reducing height */
          margin: 0 auto;
          overflow: visible; /* Change from hidden to visible */
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
          /* Comment out the border */
          /* border-top: 1px dotted #eee; */
          background-color: white; /* Ensure visibility */
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
          z-index: 10;
          position: relative;
        }

        /* Ensure all card header content is visible */
        .card-location, .card-number {
          display: inline-block; 
          position: relative; /* Add position to ensure stacking context */
          z-index: 2; /* Add z-index to ensure visibility */
          opacity: 1 !important; /* Force visibility */
        }

        /* Fix for first row cards to ensure header visibility */
        .grid-container > .card:nth-child(-n+3) .card-header {
          position: relative;
          z-index: 15; /* Higher z-index for first three cards */
        }

        /* Ensure second row cards are fully visible */
        .grid-container > .card:nth-child(n+4) {
          position: relative;
          z-index: 5; /* Ensure second row has good z-index */
        }

        /* Ensure second row observations are fully visible */
        .grid-container > .card:nth-child(n+4) .card-observations {
          position: relative;
          z-index: 6;
        }
        
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
        
        /* A4 Landscape 3x2 specific styles */
        .grid-container {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr; /* 3 columns */
          grid-template-rows: 1fr 1fr; /* 2 rows */
          gap: 5px 30px; /* Reduced vertical gap from 15px to 5px */
          margin-bottom: 2px;
          width: 85%; /* Reduced from 95% to create more vertical space */
          margin-left: auto;
          margin-right: auto;
        }
        
        /* Special styling for a single row (1-3 cards) */
        .grid-container.single-row {
          margin-bottom: 60px;
        }
        
        /* Image container with 4:3 aspect ratio */
        .image-container {
          position: relative;
          width: 100%;
          padding-top: 75%; /* 4:3 ratio = 75% (3/4 = 0.75) */
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
          max-height: 80mm; /* Reduced from 90mm for landscape layout */
          border: 1px solid #ccc; /* Add outer border to entire card */
        }
        
        /* Add this to the last page */
        .page:last-of-type {
          page-break-after: avoid;
        }
        
        /* Observations styling - limit height to save space */
        .card-observations {
          padding: 8px 10px 6px;
          max-height: 120px; /* Slightly reduced from 140px */
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
