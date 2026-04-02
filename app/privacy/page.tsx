'use client'

import React from 'react'

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12 md:py-24 font-sans text-slate-700 leading-relaxed">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Политика обработки персональных данных</h1>
      
      <section className="mb-8">
        <h2 className="text-xl font-bold text-slate-800 mb-4">1. Общие положения</h2>
        <p className="mb-4">
          Настоящая политика обработки персональных данных составлена в соответствии с требованиями Федерального закона от 27.07.2006. №152-ФЗ «О персональных данных» и определяет порядок обработки персональных данных и меры по обеспечению безопасности персональных данных, предпринимаемые CureScan.pro (далее — Оператор).
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold text-slate-800 mb-4">2. Какие данные мы собираем</h2>
        <ul className="list-disc pl-6 space-y-2">
            <li>Номер телефона (для связи и предоставления результатов анализа).</li>
            <li>Фотографии лица (исключительно для проведения автоматизированного AI-анализа).</li>
            <li>Технические данные: UTM-метки, тип устройства, файлы cookies.</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold text-slate-800 mb-4">3. Цели обработки</h2>
        <p>
          Основная цель — предоставление пользователю интерактивного отчета о состоянии кожи/волос и подбор релевантных процедур в выбранной клинике.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-xl font-bold text-slate-800 mb-4">4. Безопасность</h2>
        <p>
          Оператор обеспечивает сохранность персональных данных и принимает все возможные меры, исключающие доступ к персональным данным неуполномоченных лиц. Фотографии пользователей используются только в момент анализа и не передаются третьим лицам вне рамок оказания услуги.
        </p>
      </section>

      <div className="mt-12 pt-8 border-t border-slate-200 text-sm text-slate-500">
        Последнее обновление: 26 декабря 2025 г.
      </div>
      
      <div className="mt-8">
        <a href="/" className="text-blue-600 font-bold hover:underline">← Вернуться на главную</a>
      </div>
    </div>
  )
}
