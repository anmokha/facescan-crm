type ComparisonInput = {
  praise?: string
  quality?: string
}

type ProgressInput = {
  deltaScore?: number
  label?: string
  quality?: string
}

export const getCoachPraise = (input: {
  comparison?: ComparisonInput | null
  progress?: ProgressInput | null
}): string => {
  const comparison = input.comparison || undefined
  const progress = input.progress || undefined

  if (comparison?.praise && comparison.praise.trim()) {
    return comparison.praise
  }

  const quality = comparison?.quality || progress?.quality
  if (quality === 'bad') {
    return 'Фото лучше сравнивать при одинаковом свете и ракурсе, тогда прогресс будет честнее.'
  }

  const deltaScore = typeof progress?.deltaScore === 'number' ? progress.deltaScore : null
  if (deltaScore !== null) {
    if (deltaScore >= 5) {
      return 'Отличный прогресс! Видно, что уход работает — продолжайте в том же темпе.'
    }
    if (deltaScore >= 1) {
      return 'Есть позитивная динамика. Дайте коже еще немного времени — результат усилится.'
    }
    if (deltaScore <= -1) {
      return 'Прогресс бывает волнообразным. Стабильный уход вернет динамику.'
    }
  }

  return 'Сохраняйте регулярный уход — это лучший способ увидеть устойчивый результат.'
}
