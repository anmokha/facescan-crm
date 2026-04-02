import React from 'react'

export default function ValuePropositionSection() {
  return (
    <section className="py-20 bg-white border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-3xl mb-16">
          <div className="inline-block px-3 py-1 bg-green-100 text-green-700 rounded-lg text-sm font-semibold mb-4 border border-green-200">
            Ценность
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
            Как DiagVis повышает ROI клиники
          </h2>
          <p className="text-xl text-slate-600 leading-relaxed">
            Превращаем каждую заявку в профилированный лид с готовым запросом и высокой готовностью к покупке.
          </p>
        </div>

        {/* Value Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <div className="relative">
            <div className="absolute -top-4 -left-4 w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center text-white font-bold text-xl border-4 border-white shadow-lg">
              1
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-8 pt-10">
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Вовлечённость</h3>
              <p className="text-slate-600 mb-4">
                Визуальный чекап за 3 минуты прогревает лид и повышает лояльность.
              </p>
              <div className="bg-white border border-slate-200 rounded-lg p-4">
                <div className="text-3xl font-bold text-blue-600 mb-1">+40%</div>
                <div className="text-sm text-slate-600">доходимость до консультации</div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -top-4 -left-4 w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center text-white font-bold text-xl border-4 border-white shadow-lg">
              2
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-8 pt-10">
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Сегментация</h3>
              <p className="text-slate-600 mb-4">
                Структурированные данные о запросе: тип проблемы, выраженность, осведомлённость — до первого контакта.
              </p>
              <div className="bg-white border border-slate-200 rounded-lg p-4">
                <div className="text-3xl font-bold text-purple-600 mb-1">100%</div>
                <div className="text-sm text-slate-600">лидов с контекстом проблемы</div>
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="absolute -top-4 -left-4 w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center text-white font-bold text-xl border-4 border-white shadow-lg">
              3
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-8 pt-10">
              <h3 className="text-2xl font-bold text-slate-900 mb-3">Персональный оффер</h3>
              <p className="text-slate-600 mb-4">
                Результаты AI-анализа позволяют сразу предложить релевантную процедуру.
              </p>
              <div className="bg-white border border-slate-200 rounded-lg p-4">
                <div className="text-3xl font-bold text-green-600 mb-1">+25%</div>
                <div className="text-sm text-slate-600">к среднему чеку продаж</div>
              </div>
            </div>
          </div>
        </div>

        {/* Compact 3-Step Flow */}
        <div className="bg-slate-900 rounded-lg p-8 md:p-12 border border-slate-700 mb-16">
          <h3 className="text-2xl font-bold text-white mb-8 text-center">Как это работает: 3 шага</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Загрузил фото', desc: 'Пациент загружает фото через любой канал' },
              { step: '2', title: 'AI анализ 30 сек', desc: 'Мгновенный персональный результат' },
              { step: '3', title: 'Лид с профилем', desc: 'Контакт + контекст попадает в CRM' },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-slate-700 rounded-lg flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4 border border-slate-600">
                  {item.step}
                </div>
                <div className="text-white font-bold text-lg mb-2">{item.title}</div>
                <div className="text-slate-400">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Old Way vs New Way */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-slate-900 mb-8 text-center">
            Сравнение подходов
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Old Way */}
            <div className="bg-red-50 border-2 border-red-200 rounded-lg p-8">
              <h4 className="text-xl font-bold text-red-900 mb-6 text-center">
                ❌ Стандартная воронка
              </h4>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <span className="text-red-600 mt-1 flex-shrink-0">•</span>
                  <p className="text-slate-700">Клиент оставляет номер вслепую</p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-red-600 mt-1 flex-shrink-0">•</span>
                  <p className="text-slate-700">Менеджер не знает контекста проблемы</p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-red-600 mt-1 flex-shrink-0">•</span>
                  <p className="text-slate-700">Низкая конверсия в запись</p>
                </div>
              </div>
            </div>

            {/* New Way */}
            <div className="bg-green-50 border-2 border-green-200 rounded-lg p-8">
              <h4 className="text-xl font-bold text-green-900 mb-6 text-center">
                ✅ Диагностика-воронка
              </h4>
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <span className="text-green-600 mt-1 flex-shrink-0">•</span>
                  <p className="text-slate-700">Клиент загружает фото, получает результат</p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-green-600 mt-1 flex-shrink-0">•</span>
                  <p className="text-slate-700">Чувствует индивидуальный подход до общения</p>
                </div>
                <div className="flex items-start space-x-3">
                  <span className="text-green-600 mt-1 flex-shrink-0">•</span>
                  <p className="text-slate-700">Вы знаете проблему и готовность к покупке</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
