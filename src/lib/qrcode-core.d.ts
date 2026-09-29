// Type du noyau de qrcode (non exposé par @types/qrcode).
declare module 'qrcode/lib/core/qrcode' {
  export function create(
    texte: string,
    options?: { errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H' },
  ): { modules: { size: number; get(x: number, y: number): number | boolean } };
}
