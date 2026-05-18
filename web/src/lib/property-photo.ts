/** Номер папки в public/apartment-photos/<n>/ по internalCode (как в seed). */
export const INTERNAL_CODE_PHOTO_FOLDER: Record<string, number> = {
  "NKR-01": 1,
  "NKR-02": 2,
  "NKR-03": 3,
  "NKR-04": 4,
  "NKR-05": 5,
  "PES-01": 6,
  "PES-02": 7,
  "PES-03": 8,
  "PES-04": 9,
  "PES-05": 10,
  "PES-06": 11,
  "PES-07": 12,
  "PES-08": 13,
  "NEV-01": 14,
  "NEV-02": 15,
  "NEV-03": 16,
  "NEV-04": 17,
  "VAS-01": 18,
  "VAS-02": 19,
};

export function photoFolderFromFilePath(filePath: string | null | undefined): number | null {
  if (!filePath) return null;
  const m = filePath.match(/\/apartment-photos\/(\d+)\//);
  return m ? Number(m[1]) : null;
}

export function resolvePropertyPhotoFolder(
  internalCode: string,
  media: { filePath: string | null }[],
): number {
  for (const m of media) {
    const fromPath = photoFolderFromFilePath(m.filePath);
    if (fromPath) return fromPath;
  }
  const mapped = INTERNAL_CODE_PHOTO_FOLDER[internalCode];
  if (mapped) return mapped;
  return 99;
}

export function photoPublicPath(folder: number, filename: string): string {
  return `/apartment-photos/${folder}/${encodeURIComponent(filename)}`;
}
