import { CardData } from "../../types/pdfTypes";
import { HeaderData } from "../../types/types";
import {
  generateCommonStyles,
  generateHeaderHTML,
  generateFooterHTML,
} from "./commonPdfElements";

export const generateA4Portrait2x2 = (
  cards: CardData[],
  headerData: HeaderData,
  includeHeader: boolean
): string => {
  // Create card items HTML
  const cardItems = cards
    .map((card, index) => {
      return `
      <div class="card">
        <div class="card-header">${card.location || "No Location"}</div>
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
          <div class="observations-content">${
            card.observations || "No observations"
          }</div>
        </div>
      </div>
    `;
    })
    .join("");

  // Build the complete HTML document with 2x2 grid layout
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${headerData.typeOfReport || "Inspection Report"}</title>
      <style>
        ${generateCommonStyles()}
        
        /* A4 Portrait 2x2 specific styles */
        .grid-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 20px;
          margin-bottom: 30px;
        }
        
        .card-image {
          height: 150px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        ${
          includeHeader
            ? generateHeaderHTML(headerData)
            : '<div class="minimal-header"><div class="report-title">Inspection Report</div></div>'
        }
        
        <div class="grid-container">
          ${cardItems}
        </div>
        
        ${generateFooterHTML(headerData.typeOfReport || "Inspection Report")}
      </div>
    </body>
    </html>
  `;
};
