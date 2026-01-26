
export function calculateCPM(price: number, views: number): number {
  if (views === 0) return 0;
  // CPM = (Cost / Views) * 1000
  return (price / views) * 1000;
}

export function calculateAverage(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  const sum = numbers.reduce((a, b) => a + b, 0);
  return sum / numbers.length;
}

export function calculateMedian(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  const sorted = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

export interface Verdict {
  label: string;
  color: string;
  textColor: string;
  description: string;
}

export function getVerdict(cpm: number): Verdict {
  // Logic Updated:
  // < 1,000: SUPER WORTH IT (Green)
  // < 5,000: GOOD (Blue)
  // < 15,000: STANDARD (Yellow)
  // < 25,000: NEEDS IMPROVEMENT (Orange)
  // >= 25,000: OVERPRICED (Red)

  if (cpm < 1000) {
    return {
      label: "SUPER WORTH IT",
      color: "bg-[#A3E635]", // Lime
      textColor: "text-black",
      description: "Incredible value! This is a steal.",
    };
  }
  if (cpm < 5000) {
    return {
      label: "GOOD",
      color: "bg-[#60A5FA]", // Blue
      textColor: "text-black",
      description: "Solid performance for the price.",
    };
  }
  if (cpm < 15000) {
    return {
      label: "STANDARD",
      color: "bg-[#FACC15]", // Yellow
      textColor: "text-black",
      description: "Fair market rate.",
    };
  }
  if (cpm < 25000) {
    return {
      label: "NEEDS IMPROVEMENT",
      color: "bg-[#FB923C]", // Orange
      textColor: "text-black",
      description: "Slightly expensive, try to negotiate.",
    };
  }
  return {
    label: "OVERPRICED",
    color: "bg-[#F87171]", // Red
    textColor: "text-black",
    description: "Way above market norms. Not recommended.",
  };
}

// Format currency helper (IDR default for this project context)
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Format number helper
export function formatNumber(num: number): string {
  return new Intl.NumberFormat("id-ID").format(num);
}
