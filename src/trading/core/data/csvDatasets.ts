export interface CsvDataset {
  label: string;
  path: string; // đường dẫn public, Next.js serve trực tiếp qua URL
}

export const CSV_DATASETS: CsvDataset[] = [
  { label: "XAUUSD - 15M", path: "/data/XAU_15m_data.csv" },
  { label: "XAUUSD - 30M", path: "/data/XAU_30m_data.csv" },
  { label: "XAUUSD - 1H", path: "/data/XAU_1h_data.csv" },
  { label: "XAUUSD - 4H", path: "/data/XAU_4h_data.csv" },
  { label: "XAUUSD - 1D", path: "/data/XAU_1d_data.csv" },
  { label: "XAUUSD - 1Week", path: "/data/XAU_1w_data.csv" },
  { label: "XAUUSD - 1Month", path: "/data/XAU_1Month_data.csv" },
];
