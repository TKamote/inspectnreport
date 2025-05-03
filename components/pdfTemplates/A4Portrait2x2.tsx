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

  // Loop through pages
  for (let page = 0; page < pageCount; page++) {
    const startIndex = page * cardsPerPage;
    const pageCards = cards.slice(startIndex, startIndex + cardsPerPage);

    // Skip if there are no cards for this page (fixes blank page issue)
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
                <div class="no-image">No Image</div>
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
        
        ${page < pageCount - 1 ? '<div class="page-break"></div>' : ""}
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
        
        /* Page structure */
        .page {
          position: relative;
          padding-top: 20px;
          padding-bottom: 60px;
          min-height: 700px;
          box-sizing: border-box;
        }
        
        .page-header {
          margin-bottom: 30px;
        }
        
        .page-content {
          margin-bottom: 40px;
        }
        
        .page-footer {
          position: absolute;
          bottom: 20px;
          left: 0;
          right: 0;
          width: 100%;
        }
        
        /* A4 Portrait 2x2 specific styles */
        .grid-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 30px;
          margin-bottom: 30px;
          width: 75%;
          margin-left: auto;
          margin-right: auto;
        }
        
        /* Special styling for a single row (1-2 cards) */
        .grid-container.single-row {
          margin-bottom: 60px;
        }
        
        .card-image {
          height: auto;
          position: relative;
          margin-bottom: 5px;
        }
        
        /* Card header styling */
        .card-header {
          background-color: #007BFF;
          color: white;
          padding: 8px 12px;
          font-weight: bold;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        /* Card number styling */
        .card-number {
          font-weight: bold;
          color: white;
        }
        
        /* Card location styling */
        .card-location {
          color: white;
        }
        
        /* Enhanced timestamp styling - FIX FOR TIMESTAMP OVER PHOTO */
        .timestamp {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          text-align: center;
          background-color: rgba(0, 0, 0, 0.5);
          color: #fff;
          font-size: 10px;
          padding: 2px 0;
          z-index: 100;
          font-family: 'Courier New', monospace;
          letter-spacing: 0.5px;
        }
        
        /* Ensure image container has proper positioning */
        .image-container {
          position: relative;
          width: 100%;
          height: auto;
          min-height: 150px;
        }
        
        .image-container img {
          width: 100%;
          object-fit: cover;
          display: block;
        }
        
        /* Properly handle page breaks */
        .page-break {
          page-break-after: always;
          height: 0;
          display: block;
        }
        
        /* Observations styling - MATCHING LOCATION TEXT COLOR */
        .card-observations {
          padding: 8px 10px 10px;
          max-height: 120px;
          overflow: hidden;
          background-color: #f9f9f9;
        }
        
        .observations-title {
          font-weight: bold;
          margin-bottom: 5px;
          color: #333; /* Matched with content color */
        }
        
        .observations-content {
          white-space: pre-wrap;
          font-size: 12px;
          line-height: 1.4;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-line-clamp: 6;
          -webkit-box-orient: vertical;
          color: #333; /* Explicit color setting */
        }
        
        /* No image styling */
        .no-image {
          display: flex;
          min-height: 150px;
          align-items: center;
          justify-content: center;
          color: #888;
          font-style: italic;
          background-color: #e0e0e0;
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
