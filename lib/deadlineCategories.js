/** Allineato a DeadlineCategory nel backend Prisma */
export const DEADLINE_CATEGORIES = [
  { value: 'BOLLETTE', label: 'Bolletta', color: 'bg-blue-500', textColor: 'text-blue-700', bgLight: 'bg-blue-50' },
  { value: 'TASSE', label: 'Tassa', color: 'bg-red-500', textColor: 'text-red-700', bgLight: 'bg-red-50' },
  { value: 'BOLLO_AUTO', label: 'Bollo auto', color: 'bg-orange-500', textColor: 'text-orange-800', bgLight: 'bg-orange-50' },
  { value: 'ASSICURAZIONI', label: 'Assicurazione', color: 'bg-green-500', textColor: 'text-green-700', bgLight: 'bg-green-50' },
  { value: 'ABBONAMENTI', label: 'Abbonamento', color: 'bg-purple-500', textColor: 'text-purple-700', bgLight: 'bg-purple-50' },
  { value: 'AFFITTO', label: 'Affitto', color: 'bg-yellow-500', textColor: 'text-yellow-700', bgLight: 'bg-yellow-50' },
  { value: 'ALTRO', label: 'Altro', color: 'bg-muted-foreground', textColor: 'text-foreground', bgLight: 'bg-muted' },
]

export function categoryMeta(value) {
  return DEADLINE_CATEGORIES.find((c) => c.value === value) || DEADLINE_CATEGORIES[DEADLINE_CATEGORIES.length - 1]
}
