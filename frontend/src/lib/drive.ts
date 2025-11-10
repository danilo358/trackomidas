export function extractDriveId(input: string): string | null {
  if (!input) return null
  // https://drive.google.com/file/d/<ID>/view...
  const byD = input.match(/\/d\/([A-Za-z0-9_-]+)/)
  if (byD?.[1]) return byD[1]
  // https://drive.google.com/uc?id=<ID>
  const byParam = input.match(/[?&]id=([A-Za-z0-9_-]+)/)
  if (byParam?.[1]) return byParam[1]
  // ID puro
  if (/^[A-Za-z0-9_-]{10,}$/.test(input)) return input
  return null
}

export function toDrivePreview(input: string): string {
  const id = extractDriveId(input)
  return id ? `https://drive.google.com/file/d/${id}/preview` : ''
}
