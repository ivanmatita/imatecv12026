import { Invoice, InvoiceType } from "./types";
import * as XLSX from 'xlsx';

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-AO', {
    style: 'currency',
    currency: 'AOA',
  }).format(value);
};

export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('pt-PT', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

// Replaced short ID with UUID to ensure database compatibility
export const generateId = (): string => {
  return generateUUID();
};

// UUID Helper for Supabase (Critical Fix)
export const isValidUUID = (uuid: string): boolean => {
  if (!uuid) return false;
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

export const ensureUUID = (id: string | undefined | null): string => {
  if (!id || id === 'CONSUMIDOR_FINAL' || id === '') return '00000000-0000-0000-0000-000000000000';
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (uuidRegex.test(id)) return id;
  // Deterministic fallback for legacy IDs
  const hex = id.split('').map(c => c.charCodeAt(0).toString(16)).join('').padEnd(32, '0').substring(0, 32);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-4${hex.slice(12, 15)}-a${hex.slice(15, 18)}-${hex.slice(18, 30)}`;
};

export const generateUUID = (): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  // Simple fallback for older environments
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

// Simulate Angolan Certification Hash (Short version for UI)
export const generateInvoiceHash = (invoice: Invoice): string => {
  // In a real scenario, this involves RSA-SHA1 signing of data
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let hash = "";
  for (let i = 0; i < 4; i++) {
    hash += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return hash;
};

export const generateQrCodeUrl = (data: string): string => {
  // Uses a public API to generate QR code images for the print view
  return `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(data)}`;
};

export const generateWhatsAppLink = (phone: string, message: string): string => {
  const cleanPhone = phone.replace(/\D/g, '');
  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
};

export const exportToExcel = (data: any[], fileName: string) => {
  if (!data || data.length === 0) return;

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Mapa Salarial");

  // Write to binary string and trigger download
  XLSX.writeFile(workbook, `${fileName}.xlsx`);
};

// --- Helper for Document Prefixes ---
export const getDocumentPrefix = (type: InvoiceType): string => {
  switch (type) {
    case InvoiceType.FT: return 'FT';
    case InvoiceType.FR: return 'FR';
    case InvoiceType.RG: return 'RC'; // Recibo
    case InvoiceType.NC: return 'NC';
    case InvoiceType.ND: return 'ND';
    case InvoiceType.PP: return 'PP';
    case InvoiceType.OR: return 'OR';
    case InvoiceType.GT: return 'GT';
    case InvoiceType.GR: return 'GR';
    case InvoiceType.VD: return 'VD';
    default: return 'DOC';
  }
};

// --- Number to Words (Extenso) Logic ---

const unidades = ["", "um", "dois", "três", "quatro", "cinco", "seis", "sete", "oito", "nove", "dez", "onze", "doze", "treze", "catorze", "quinze", "dezasseis", "dezassete", "dezoito", "dezanove"];
const dezenas = ["", "", "vinte", "trinta", "quarenta", "cinquenta", "sessenta", "setenta", "oitenta", "noventa"];
const centenas = ["", "cento", "duzentos", "trezentos", "quatrocentos", "quinhentos", "seiscentos", "setecentos", "oitocentos", "novecentos"];

const converteGrupo = (n: number): string => {
  if (n === 0) return "";
  if (n === 100) return "cem";

  let extenso = "";

  const c = Math.floor(n / 100);
  const d = Math.floor((n % 100) / 10);
  const u = n % 10;

  if (c > 0) {
    extenso += centenas[c];
    if (d > 0 || u > 0) extenso += " e ";
  }

  if (d >= 2) {
    extenso += dezenas[d];
    if (u > 0) extenso += " e " + unidades[u];
  } else if (n % 100 > 0) {
    // Caso 0-19 (tratado pelo resto da divisão por 100)
    extenso += unidades[n % 100];
  }

  return extenso;
};

export const numberToExtenso = (valor: number, moedaPlural: string = "Kwanzas", moedaSingular: string = "Kwanza"): string => {
  if (valor === 0) return "Zero " + moedaPlural;

  const inteiro = Math.floor(valor);
  const decimal = Math.round((valor - inteiro) * 100);

  let extenso = "";
  let resto = inteiro;
  let contador = 0;

  const qualificadores = [
    ["", ""],
    ["mil", "mil"],
    ["milhão", "milhões"],
    ["mil milhões", "mil milhões"], // ou bilião/biliões
    ["bilião", "biliões"],
    ["bilião", "biliões"] // Simplificado para escalas maiores
  ];

  while (resto > 0) {
    const grupo = resto % 1000;

    if (grupo > 0) {
      let grupoExtenso = converteGrupo(grupo);

      // Tratamento especial para "um mil" -> "mil"
      if (contador === 1 && grupo === 1) {
        grupoExtenso = "";
      }

      const qualificador = grupo === 1 ? qualificadores[contador][0] : qualificadores[contador][1];

      // Concatenação
      const prefixo = extenso ? (contador > 0 && grupo < 100 ? " e " : " ") : ""; // simplificação de conectivos

      extenso = `${grupoExtenso} ${qualificador}${prefixo}${extenso}`;
    }

    resto = Math.floor(resto / 1000);
    contador++;
  }

  extenso = extenso.trim();

  // Adicionar nome da moeda
  if (inteiro === 1) extenso += " " + moedaSingular;
  else if (inteiro > 0) {
    // Se termina em milhão/milhões/etc, adiciona "de"
    if (extenso.endsWith("ilhões") || extenso.endsWith("ilhão")) {
      extenso += " de " + moedaPlural;
    } else {
      extenso += " " + moedaPlural;
    }
  }

  // Tratamento de decimais (Cêntimos)
  if (decimal > 0) {
    if (inteiro > 0) extenso += " e ";
    extenso += converteGrupo(decimal);
    extenso += decimal === 1 ? " Cêntimo" : " Cêntimos";
  }

  return extenso;
};


// --- Payroll Calculations (Angola AGT) ---

/**
 * INSS - Instituto Nacional de Segurança Social
 * Trabalhador: 3%
 * Empregador: 8%
 * Base: Salário Base + Subsídios regulares
 */
export const calculateINSS = (baseAmount: number, foodSubsidy: number = 0, transportSubsidy: number = 0): number => {
  // 3% Employee Share
  const baseINSS = baseAmount + foodSubsidy + transportSubsidy;
  return baseINSS * 0.03;
};

export const calculateINSSEntity = (baseAmount: number, foodSubsidy: number = 0, transportSubsidy: number = 0): number => {
  // 8% Employer Share
  const baseINSS = baseAmount + foodSubsidy + transportSubsidy;
  return baseINSS * 0.08;
};

/**
 * IRT - Imposto sobre Rendimento do Trabalho
 * Base tributável = Salário Bruto - INSS do Trabalhador
 * Tabela progressiva por escalões
 */
export interface IRTBracket {
  minValue: number;
  maxValue: number | null;
  rate: number;
}

// Tabela IRT padrão 2026 (configurável)
export const DEFAULT_IRT_BRACKETS: IRTBracket[] = [
  { minValue: 0, maxValue: 70000, rate: 0 },
  { minValue: 70001, maxValue: 100000, rate: 10 },
  { minValue: 100001, maxValue: 150000, rate: 13 },
  { minValue: 150001, maxValue: 200000, rate: 16 },
  { minValue: 200001, maxValue: 300000, rate: 18 },
  { minValue: 300001, maxValue: 500000, rate: 19 },
  { minValue: 500001, maxValue: null, rate: 20 }
];

export const calculateIRT = (
  baseAmount: number,
  inss: number,
  foodSubsidy: number = 0,
  transportSubsidy: number = 0,
  customBrackets?: IRTBracket[]
): number => {
  // Base tributável = Salário Bruto - INSS
  const taxableBase = baseAmount + foodSubsidy + transportSubsidy - inss;

  const brackets = customBrackets || DEFAULT_IRT_BRACKETS;

  // Encontrar o escalão correspondente
  const bracket = brackets.find(b => {
    if (b.maxValue === null) {
      return taxableBase >= b.minValue;
    }
    return taxableBase >= b.minValue && taxableBase <= b.maxValue;
  });

  if (!bracket || bracket.rate === 0) return 0;

  return (taxableBase * bracket.rate) / 100;
};

/**
 * Cálculo de Faltas Injustificadas
 * Salário Diário = Salário Base / 22 dias úteis
 */
export const calculateAbsenceDeduction = (baseSalary: number, absenceDays: number): number => {
  const dailySalary = baseSalary / 22;
  return dailySalary * absenceDays;
};

/**
 * Cálculo de Horas Extras
 * Hora Normal = Salário Base / 22 / 8
 * Hora Extra Normal: +50%
 * Hora Extra Domingo/Feriado: +100%
 */
export const calculateOvertimePay = (
  baseSalary: number,
  normalHours: number = 0,
  holidayHours: number = 0
): number => {
  const hourlyRate = baseSalary / 22 / 8;
  const normalOvertimePay = hourlyRate * 1.5 * normalHours;
  const holidayOvertimePay = hourlyRate * 2 * holidayHours;
  return normalOvertimePay + holidayOvertimePay;
};

/**
 * Cálculo de Horas Perdidas
 */
export const calculateLostHoursPenalty = (baseSalary: number, lostHours: number): number => {
  const hourlyRate = baseSalary / 22 / 8;
  return hourlyRate * lostHours;
};

/**
 * Subsídio de Férias
 * Valor = Salário Base (pago antes do gozo de férias)
 */
export const calculateVacationSubsidy = (baseSalary: number): number => {
  return baseSalary;
};

/**
 * Abono de Família
 * Valor configurável por filho
 */
export const calculateFamilyAllowance = (numberOfChildren: number, valuePerChild: number = 5000): number => {
  return numberOfChildren * valuePerChild;
};

/**
 * Cálculo Completo do Salário
 */
export interface SalaryCalculationInput {
  baseSalary: number;
  subsidyTransport: number;
  subsidyFood: number;
  subsidyHousing: number;
  subsidyChristmas: number;
  subsidyVacation: number;
  otherSubsidies: number;
  bonuses: number;
  gratifications: number;
  absenceDays: number;
  overtimeNormalHours: number;
  overtimeHolidayHours: number;
  lostHours: number;
  advances: number;
  penalties: number;
  fines: number;
  irtBrackets?: IRTBracket[];
}

export interface SalaryCalculationResult {
  // Proventos
  baseSalary: number;
  subsidies: number;
  bonuses: number;
  overtimePay: number;
  grossTotal: number;

  // Descontos
  inssEmployee: number;
  inssEmployer: number;
  irt: number;
  absenceDeduction: number;
  lostHoursPenalty: number;
  advances: number;
  penalties: number;
  fines: number;
  totalDeductions: number;

  // Líquido
  netTotal: number;
}

export const calculateCompleteSalary = (input: SalaryCalculationInput): SalaryCalculationResult => {
  // 1. Proventos
  const subsidies = input.subsidyTransport + input.subsidyFood + input.subsidyHousing +
    input.subsidyChristmas + input.subsidyVacation + input.otherSubsidies;

  const overtimePay = calculateOvertimePay(
    input.baseSalary,
    input.overtimeNormalHours,
    input.overtimeHolidayHours
  );

  const bonuses = input.bonuses + input.gratifications;

  const grossTotal = input.baseSalary + subsidies + bonuses + overtimePay;

  // 2. Descontos
  const inssEmployee = calculateINSS(input.baseSalary, input.subsidyFood, input.subsidyTransport);
  const inssEmployer = calculateINSSEntity(input.baseSalary, input.subsidyFood, input.subsidyTransport);

  const irt = calculateIRT(
    input.baseSalary,
    inssEmployee,
    input.subsidyFood,
    input.subsidyTransport,
    input.irtBrackets
  );

  const absenceDeduction = calculateAbsenceDeduction(input.baseSalary, input.absenceDays);
  const lostHoursPenalty = calculateLostHoursPenalty(input.baseSalary, input.lostHours);

  const totalDeductions = inssEmployee + irt + absenceDeduction + lostHoursPenalty +
    input.advances + input.penalties + input.fines;

  // 3. Líquido
  const netTotal = grossTotal - totalDeductions;

  return {
    baseSalary: input.baseSalary,
    subsidies,
    bonuses,
    overtimePay,
    grossTotal,
    inssEmployee,
    inssEmployer,
    irt,
    absenceDeduction,
    lostHoursPenalty,
    advances: input.advances,
    penalties: input.penalties,
    fines: input.fines,
    totalDeductions,
    netTotal
  };
};

export const roundToNearestBank = (value: number): number => {
  // Arredondamento para as centenas conforme imagem de referência (Magic)
  return Math.floor(value / 100) * 100;
};
