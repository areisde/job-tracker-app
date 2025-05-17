import dayjs from "dayjs"

export const normalizeDate = (input: string): string | null => {
  const formats = ["DD-MM-YYYY", "YYYY-MM-DD"]
  for (const fmt of formats) {
    const d = dayjs(input, fmt)
    if (d.isValid()) return d.format("YYYY-MM-DD")
  }
  return null
}