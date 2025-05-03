import { HeaderData } from "./types";

export interface CardData {
  location: string;
  observations: string;
  photo: string | null;
  timestamp: string | null;
}

export type PDFTemplate =
  | "A4Portrait2x2"
  | "A4Landscape5x2"
  | "A4Landscape4x2"
  | "A4Portrait3x3"
  | "A4Landscape3x3"
  | "A4Portrait1x1";

export interface PDFGenerationOptions {
  cards: CardData[];
  headerData: HeaderData;
  template: PDFTemplate;
  includeHeader: boolean;
}
