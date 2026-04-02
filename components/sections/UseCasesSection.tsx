import React from 'react'

export default function UseCasesSection() {
  const useCases = [
    {
      icon: '🏥',
      title: 'Клиники и медицинские центры',
      examples: [
        'Профилирование клиента до консультации',
        'Понимание реальной проблемы и запроса',
        'Выше конверсия записи на процедуры',
        'Экономия времени врача на первичном приёме',
      ],
      color: 'blue',
    },
    {
      icon: '👨‍⚕️',
      title: 'Эксперты и практики',
      examples: [
        'Выстраивание экспертности на первом касании',
        'Сегментация аудитории по проблемам',
        'Персонализированные рекомендации услуг',
        'Увеличение среднего чека консультаций',
      ],
      color: 'purple',
    },
    {
      icon: '💅',
      title: 'Салоны и сервисы',
      examples: [
        'Привлечение входящего трафика',
        'Вовлечение клиентов через ценность',
        'Подбор пакетов услуг под конкретный запрос',
        'Работает 24/7 как автоматический консультант',
      ],
      color: 'pink',
    },
    {
      icon: '💄',
      title: 'Бьюти-бренды и косметика',
      examples: [
        'Персональные подборки косметики по AI-анализу фото',
        'Увеличение среднего чека через персонализацию',
        'Интеграция с каталогом продуктов',
        'Автоматическая генерация продуктовых рекомендаций',
      ],
      color: 'pink',
    },
    {
      icon: '💪',
      title: 'Фитнес-центры и тренеры',
      examples: [
        'Персональный план тренировок по фото клиента',
        'Индивидуальные рекомендации по питанию',
        'Определение проблемных зон и целей',
        'Повышение мотивации через визуальный анализ',
      ],
      color: 'green',
    },
    {
      icon: '🤝',
      title: 'Ваша ниша',
      examples: [
        'Готов обсудить интеграцию AI-анализа в ваш бизнес',
        'Адаптируем под любую нишу с персонализацией',
        'Whitelabel решение под ваш бренд',
        'Запуск пилота за 2-3 недели',
      ],
      color: 'gray',
    },
  ]

  const colorClasses = {
    blue: 'bg-blue-50 border-blue-200 hover:border-blue-400',
    purple: 'bg-purple-50 border-purple-200 hover:border-purple-400',
    pink: 'bg-pink-50 border-pink-200 hover:border-pink-400',
    green: 'bg-green-50 border-green-200 hover:border-green-400',
    orange: 'bg-orange-50 border-orange-200 hover:border-orange-400',
    gray: 'bg-gray-50 border-gray-200 hover:border-gray-400',
  }

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Для кого это решение
          </h2>
        </div>

        {/* Use Cases Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {useCases.map((useCase, index) => (
            <div
              key={index}
              className={`border-2 rounded-xl p-6 transition-all hover:shadow-lg ${
                colorClasses[useCase.color as keyof typeof colorClasses]
              }`}
            >
              {/* Icon & Title */}
              <div className="flex items-center space-x-3 mb-4">
                <div className="text-4xl">{useCase.icon}</div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {useCase.title}
                </h3>
              </div>

              {/* Examples List */}
              <ul className="space-y-2">
                {useCase.examples.map((example, idx) => (
                  <li key={idx} className="flex items-start space-x-2 text-sm text-gray-700">
                    <span className="text-primary-600 mt-0.5">•</span>
                    <span>{example}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-8 max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold text-slate-900 mb-3">
              Не нашли свою нишу?
            </h3>
            <p className="text-slate-700 mb-6">
              Мы адаптируем онлайн-диагностику под любой тип бизнеса, где нужна персонализация и квалификация лидов
            </p>
            <button
              onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
              className="inline-flex items-center space-x-2 bg-slate-900 text-white px-8 py-4 rounded-lg font-semibold hover:bg-slate-800 transition-colors text-lg border border-slate-700"
            >
              <span>Показать, как это будет работать у вас</span>
              <span>→</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}
