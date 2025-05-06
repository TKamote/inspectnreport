import { CardData } from "../../types/pdfTypes";
import { HeaderData } from "../../types/types";
import {
  generateCommonStyles,
  generateHeaderHTML,
  generateFooterHTML,
} from "./commonPdfElements";

export const generateA4Portrait4x6 = (
  cards: CardData[],
  headerData: HeaderData,
  includeHeader: boolean
): string => {
  // Define cards per page (4x6 grid = 24 cards)
  const cardsPerPage = 24;
  const pageCount = Math.ceil(cards.length / cardsPerPage);

  // Modify how the header is included
  const headerHTML = includeHeader
    ? `<div class="standard-header">${generateHeaderHTML(headerData)}</div>`
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
          <!-- Observations deliberately removed as requested -->
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
          <div class="grid-container">
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
          font-size: 8px;
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

        /* Page structure with reduced height */
        .page {
          position: relative;
          width: 210mm;
          height: 295mm;
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          overflow: hidden;
          page-break-after: avoid;
          page-break-inside: avoid;
          /* z-index: 1;  Set base z-index */
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
          padding: 3mm 10mm 5mm;
         overflow: hidden; /* Prevent potential header overflow */
        }

        /* Safe header styling to prevent PDF generation issues */
        .standard-header {
          max-width: 100%;
          max-height: 20mm;
          overflow: hidden;
        }

        /* Ensure better spacing when header is present */
        .page-content {
          position: absolute;
          top: 28mm; /* Increased from 22mm to handle header better */
          bottom: 12mm;
          left: 0;
          right: 0;
          width: 96%;
          height: 257mm; /* Adjusted for increased top spacing */
          margin: 0 auto;
          overflow: visible;
          padding-top: 3mm;
          box-sizing: border-box;
        }

        /* Footer with reduced padding */
        .page-footer {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          width: 100%;
          padding: 3mm 10mm;
          text-align: center;
          z-index: 20;
        }

        /* Improved header layout */
        .header-row {
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          margin-bottom: 2px;
        }

        /* Fix the date field visibility */
        .header-value {
          margin-right: 10px;
          font-size: 8px;
          max-width: 180px;
          white-space: normal;
        }

        /* Date section - ensure visibility */
        .date-section {
          display: flex;
          align-items: center;
          min-width: 100px;
          max-width: 150px;
          margin-left: auto;
        }

        /* Report title - with margins and padding removed */
        .report-title {
          font-size: 12px;
          font-weight: bold;
          margin-top: 0;
          margin-bottom: 0;
          padding-top: 0;
        }
        
        /* Header labels - reduced to 8px */
        .header-label {
          font-weight: bold;
          margin-right: 3px;
          font-size: 8px;
        }
        
        /* Card header - fixed with black border and consistent spacing */
        .card-header {
          background-color: #007BFF;
          color: #000;
          padding: 4px 5px;
          font-weight: bold;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 7px;
          position: relative;
          margin: 0; /* Ensure no margin */
          z-index: 5 !important; /* Force higher z-index with !important */
        }

        /* Make sure location and number text are always visible */
        .card-location, .card-number {
          color: #000 !important;
          opacity: 1 !important;
          font-weight: bold !important;
          text-shadow: 0 0 1px white; /* Add text shadow for better visibility */
        }

        /* Override z-index for all rows to have the same behavior */
        .grid-container > .card:nth-child(-n+4) .card-header {
          z-index: 10 !important; /* Even higher z-index for first row */
          position: relative !important;
          top: 0 !important;
        }

        .grid-container > .card:nth-child(n+5):nth-child(-n+8) .card-header,
        .grid-container > .card:nth-child(n+9):nth-child(-n+12) .card-header,
        .grid-container > .card:nth-child(n+13):nth-child(-n+16) .card-header,
        .grid-container > .card:nth-child(n+17):nth-child(-n+20) .card-header,
        .grid-container > .card:nth-child(n+21) .card-header {
          z-index: 2;
        }

        /* Remove all the card z-index rules that were causing uneven spacing */
        .grid-container > .card:nth-child(-n+4),
        .grid-container > .card:nth-child(n+5):nth-child(-n+8),
        .grid-container > .card:nth-child(n+9):nth-child(-n+12),
        .grid-container > .card:nth-child(n+13):nth-child(-n+16),
        .grid-container > .card:nth-child(n+17):nth-child(-n+20),
        .grid-container > .card:nth-child(n+21) {
          z-index: 1;
          position: relative;
        }

        /* Target the second column cards specifically (cards 2, 6, 10, 14, 18, 22) */
        .grid-container > .card:nth-child(4n+2) {
          position: relative;
          z-index: 3; /* Ensure these cards are above background */
          border-right: .5px solid #000 !important; /* Reinforce right border */
        }

        /* Grid container with width reduced to 95% */
        .grid-container {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          grid-template-rows: repeat(6, auto);
          gap: 8px;
          margin: 0;
          width: 96%; /* Reduced from 100% to 95% to add horizontal margins */
          margin-left: auto;
          margin-right: auto;
          margin-top: 0;
          padding-top: 0;
        }
        
        /* Image container with slightly reduced height */
        .image-container, .no-image {
          position: relative;
          width: 100%;
          padding-top: 72%; /* Reduced from 75% to prevent cutoff */
          overflow: hidden;
          margin-top: 0;
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
          margin: 0; /* Remove all margins */
          padding: 0; /* Remove all padding */
        }

        /* No image container - match the aspect ratio */
        .no-image {
          display: flex;
          width: 100%;
          position: relative;
          margin-top: 0; /* Ensure no gap */
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
          font-size: 7px;
        }
        
        /* Clean, minimal timestamp styling */
        .timestamp {
          position: absolute;
          bottom: 2px;
          right: 2px; 
          width: auto;
          text-align: right;
          background-color: rgba(0, 0, 0, 0.5);
          color: #ddd;
          font-size: 5px;
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
        
        /* Card styling with reduced max-height */
        .card {
          page-break-inside: avoid;
          display: flex;
          flex-direction: column;
          position: relative;
          margin: 0;
          padding: 0;
          max-height: 40mm; /* Reduced from 42mm to help with vertical fit */
          border: .5px solid #000 !important; /* Thicker black border with !important */
          box-shadow: none;
          box-sizing: border-box; /* Add this to ensure border is included in width calculations */
        }
        
        /* Add this to the last page */
        .page:last-of-type {
          page-break-after: avoid;
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
