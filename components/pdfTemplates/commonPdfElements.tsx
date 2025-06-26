import { HeaderData } from "../../types/types";

// Generate common CSS styles for all templates
export const generateCommonStyles = (template?: string): string => {
  // Determine image container height based on template
  const imageHeight = template?.includes("Portrait") ? "180px" : "120px";

  return `
    html {
      background-color: white !important;
    }
    body {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      margin: 0;
      padding: 0;
      color: #333;
      background-color: white !important;
    }
    .container {
      padding: 40px 30px;
      background-color: white !important;
    }
    .header {
      margin-bottom: 20px;
      border-bottom: 1px solid #ddd;
      padding-bottom: 15px;
      background-color: white !important;
    }
    
    /* Add these header row styles */
    .header-top-row, .header-bottom-row {
      display: flex;
      margin-bottom: 8px; /* Reduced margin */
      width: 100%;
    }
    
    .header-bottom-row {
      justify-content: space-between;
      align-items: center;
    }
    
    .company-section {
      display: flex;
      align-items: center;
    }
    
    .report-for-section {
      display: flex;
      align-items: center;
    }
    
    .date-section {
      display: flex;
      align-items: center;
    }
    
    .header-label {
      font-weight: bold;
      margin-right: 5px;
    }
    
    .header-value {
      margin-right: 15px;
    }
    
    .spacer {
      display: inline-block;
      width: 20px; /* Reduced from 30px */
    }
    
    .minimal-header {
      margin-bottom: 20px; /* Reduced from 30px */
      text-align: center;
    }
    
    .report-title {
      font-size: 20px; /* Reduced from 22px */
      font-weight: bold;
      margin-top: 5px;
      margin-bottom: 8px; /* Reduced from 10px */
      clear: both;
      text-align: center;
      padding-top: 3px; /* Reduced from 5px */
    }
    .card {
      border: 1px solid #ccc;
      border-radius: 5px;
      overflow: hidden;
      background-color: white !important;
    }
    .card-header {
      background-color: #007BFF;
      color: white;
      padding: 8px 12px;
      font-weight: bold;
    }
    .card-image {
      text-align: center;
      background-color: white !important;
      position: relative;
    }
    .image-container {
      width: 100%;
      height: ${imageHeight};  /* Dynamic height based on template */
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: white !important;
    }
    .image-container img {
      max-width: 100%;
      max-height: 100%;
      width: auto;
      height: auto;
      object-fit: contain;  /* Show full image without cropping */
      object-position: center;
      display: block;
    }
    .timestamp {
      position: absolute;
      bottom: 2px; // Changed from bottom: 0
      width: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      color: white;
      font-size: 10px;
      padding: 2px 0;
      text-align: center;
    }
    .no-image {
      display: flex;
      height: 100%;
      align-items: center;
      justify-content: center;
      color: #888;
      font-style: italic;
    }
    .card-observations {
      padding: 10px;
    }
    .observations-title {
      font-weight: bold;
      margin-bottom: 5px;
    }
    .observations-content {
      white-space: pre-wrap;
      font-size: 12px;
      line-height: 1.4;
    }
    .footer {
      margin-top: 30px;
      border-top: 1px solid #ddd;
      padding-top: 20px;
      font-size: 12px;
      color: #666;
    }
      .developer {
      font-size: 10px;
      color: #666;
      float: left;
      }
    .page-number {
      font-size: 10px;
      color: #666;
      float: right;
    }
    @media print {
      .page-break {
        page-break-after: always;
      }
    }
  `;
};

// Generate header HTML
export const generateHeaderHTML = (headerData: HeaderData): string => {
  const reportDate = headerData.date || new Date().toLocaleDateString();

  return `
    <div class="header">
      <div class="header-top-row">
        <div class="company-section">
          <span class="header-label">Company:</span> 
          <span class="header-value">${
            headerData.company || "Company Name"
          }</span>
          <span class="spacer"></span>
          <span class="header-label">Created By:</span> 
          <span class="header-value">${
            headerData.createdBy || "Inspector"
          }</span>
        </div>
      </div>
      
      <div class="header-bottom-row">
        <div class="report-for-section">
          <span class="header-label">Report For:</span> 
          <span class="header-value">${headerData.reportFor || "Client"}</span>
        </div>
        <div class="date-section">
          <span class="header-label">Date:</span> 
          <span class="header-value">${reportDate}</span>
        </div>
      </div>
      
      <div class="report-title">${
        headerData.typeOfReport || "Inspection Report"
      }</div>
    </div>
  `;
};

// Generate footer HTML
export const generateFooterHTML = (
  reportType: string,
  currentPage: number = 1,
  totalPages: number = 1
): string => {
  return `
    <div class="footer">
      <div class="developer">Developer: PDF Report Maker</div>
      <div class="page-number">
        Page ${currentPage} of ${totalPages}
      </div>
      <div style="clear: both;"></div>
    </div>
  `;
};
