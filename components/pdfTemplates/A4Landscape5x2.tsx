import { CardData } from "../../types/pdfTypes";
import { HeaderData } from "../../types/types";
import {
  generateCommonStyles,
  generateHeaderHTML,
  generateFooterHTML,
} from "./commonPdfElements";

// Helper function to truncate text
function truncateText(text: string, maxLength: number = 100): string {
  if (!text) return "No observations";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}

export const generateA4Landscape5x2 = (
  cards: CardData[],
  headerData: HeaderData,
  includeHeader: boolean
): string => {
  const commonStyles = generateCommonStyles("A4Landscape5x2");

  // Define cards per page (5x2 grid = 10 cards per page)
  const cardsPerPage = 10;
  const pageCount = Math.ceil(cards.length / cardsPerPage);

  // Generate the header HTML once to reuse
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
          <div class="card-observations">
            <div class="observations-title">Observations:</div>
            <div class="observations-content">${truncateText(
              card.observations || "No observations",
              100 // Short text limit for 5-column layout
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
        ${commonStyles}
        
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
          font-size: 9px;
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
          height: 210mm;
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          overflow: hidden;
          page-break-after: avoid;
          page-break-inside: avoid;
        }

        /* Header fixed at top of page */
        .page-header {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          width: 100%;
          padding: 4mm 15mm;
        }

        /* Page content positioning - adjust spacing with explicit height */
        .page-content {
          position: absolute;
          top: 20mm;
          bottom: 15mm;
          left: 0;
          right: 0;
          width: 95%;
          height: 173mm;
          margin: 0 auto;
          overflow: visible;
          padding-top: 3mm;
        }

        /* Footer fixed at bottom of page */
        .page-footer {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          width: 100%;
          padding: 4mm 15mm;
          text-align: center;
          background-color: white;
        }

        /* Grid container for 5x2 layout */
        .grid-container {
          display: grid;
          grid-template-columns: repeat(5, 1fr); /* 5 equal columns */
          grid-template-rows: repeat(2, 1fr); /* 2 equal rows - changed from auto to 1fr */
          gap: 8px;
          margin-bottom: 2px;
          width: 100%;
          height: 100%; /* Ensure grid takes full height */
          margin-left: auto;
          margin-right: auto;
        }

        /* Card styling for 5x2 layout */
        .card {
          page-break-inside: avoid;
          display: flex;
          flex-direction: column;
          position: relative;
          margin-bottom: 2px;
          height: 100%; /* Let card fill grid cell */
          border: 1px solid #ddd;
          border-radius: 3px;
        }

        /* Card header (location and card number) */
        .card-header {
          background-color: #007BFF;
          color: #000;
          padding: 4px 6px;
          font-weight: bold;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 8px;
          height: 6mm; /* Reduced height */
        }

        /* Image container with 3:4 aspect ratio */
        .image-container {
          position: relative;
          width: 100%;
          padding-top: 37.5%; /* Reduced from 75% to 37.5% (50% smaller) */
          overflow: hidden;
        }

        /* Observations section */
        .card-observations {
          padding: 4px 6px 3px;
          max-height: 12mm; /* Increased height */
          overflow: hidden;
          background-color: #f9f9f9;
        }

        .observations-title {
          font-weight: bold;
          margin-bottom: 1px;
          color: #333;
          font-size: 8px;
          display: inline-block;
        }

        .observations-content {
          white-space: pre-wrap;
          font-size: 7px;
          line-height: 1.1;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 4;
          -webkit-box-orient: vertical;
          color: #333;
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
