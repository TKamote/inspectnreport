import { HeaderData } from "../../types/types";

// Generate common CSS styles for all templates
export const generateCommonStyles = (): string => {
  return `
    body {
      font-family: 'Helvetica Neue', Arial, sans-serif;
      margin: 0;
      padding: 0;
      color: #333;
    }
    .container {
      padding: 40px 30px;
    }
    .header {
      margin-bottom: 30px;
      border-bottom: 1px solid #ddd;
      padding-bottom: 20px;
    }
    .minimal-header {
      margin-bottom: 30px;
      text-align: center;
    }
    .company-info {
      float: left;
      width: 60%;
    }
    .report-info {
      float: right;
      width: 40%;
      text-align: right;
    }
    .company-name {
      font-size: 18px;
      font-weight: bold;
      margin-bottom: 5px;
    }
    .report-title {
      font-size: 22px;
      font-weight: bold;
      margin-top: 10px;
      margin-bottom: 20px;
      clear: both;
      text-align: center;
      padding-top: 10px;
    }
    .card {
      border: 1px solid #ccc;
      border-radius: 5px;
      overflow: hidden;
      background-color: #f9f9f9;
    }
    .card-header {
      background-color: #007BFF;
      color: white;
      padding: 8px 12px;
      font-weight: bold;
    }
    .card-image {
      text-align: center;
      background-color: #e0e0e0;
      position: relative;
    }
    .image-container {
      width: 100%;
      height: 100%;
      position: relative;
    }
    .image-container img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    .timestamp {
      position: absolute;
      bottom: 0;
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
    .page-number {
      text-align: center;
      margin-top: 10px;
      font-size: 10px;
      color: #999;
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
      <div class="company-info">
        <div class="company-name">${headerData.company || "Company Name"}</div>
        <div>Created By: ${headerData.createdBy || "Inspector"}</div>
        <div>Contact: ${headerData.contact || "Contact Information"}</div>
      </div>
      <div class="report-info">
        <div>Report For: ${headerData.reportFor || "Client"}</div>
        <div>Date: ${reportDate}</div>
      </div>
    </div>
    
    <div class="report-title">${
      headerData.typeOfReport || "Inspection Report"
    }</div>
  `;
};

// Generate footer HTML
export const generateFooterHTML = (reportType: string): string => {
  return `
    <div class="footer">
      <div>Generated on: ${new Date().toLocaleString()}</div>
      <div>Report Type: ${reportType}</div>
    </div>
    
    <div class="page-number">Page 1</div>
  `;
};
