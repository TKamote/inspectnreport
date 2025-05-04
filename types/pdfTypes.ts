import { HeaderData } from "./types";

export interface CardData {
  location: string;
  observations: string;
  photo: string | null;
  timestamp: string | null;
}

export type PDFTemplate =
  | "A4Portrait2x2"
  | "A4Portrait2x3"
  | "A4Landscape3x2"
  | "A4Landscape4x2"
  | "A4Landscape5x3"
  | "A4Portrait4x6";

export interface PDFGenerationOptions {
  cards: CardData[];
  headerData: HeaderData;
  template: PDFTemplate;
  includeHeader: boolean;
}
