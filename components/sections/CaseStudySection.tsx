import React from 'react'

export default function CaseStudySection() {
  return (
    <section id="cases" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            📊 Реальный кейс
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Как работает технология на живом проекте
          </p>
        </div>

        {/* Case Study Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-5xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left: Screenshot/Image */}
            <div className="bg-gradient-to-br from-primary-100 to-primary-200 p-8 flex items-center justify-center">
              <div className="text-center">
                <div className="text-6xl mb-4">🌐</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  CureScan.pro
                </h3>
                <p className="text-gray-700 mb-6">
                  Диагностика волос по фото
                </p>
                <a
                  href="https://CureScan.pro"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 bg-primary-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
                >
                  <span>Посмотреть проект</span>
                  <span>→</span>
                </a>
              </div>
            </div>

            {/* Right: Details */}
            <div className="p-8">
              <h4 className="text-xl font-bold text-gray-900 mb-6">
                Что было сделано:
              </h4>

              <ul className="space-y-4 mb-8">
                <li className="flex items-start space-x-3">
                  <span className="text-green-600 text-xl">✅</span>
                  <div>
                    <p className="font-semibold text-gray-900">Анализ волос по фото</p>
                    <p className="text-sm text-gray-600">Определение типа, пористости, состояния</p>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-green-600 text-xl">✅</span>
                  <div>
                    <p className="font-semibold text-gray-900">Персонализированные рекомендации</p>
                    <p className="text-sm text-gray-600">Рутина ухода, продукты (3 ценовых категории)</p>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-green-600 text-xl">✅</span>
                  <div>
                    <p className="font-semibold text-gray-900">Email-маркетинг</p>
                    <p className="text-sm text-gray-600">Автоматические welcome-письма с анализом</p>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-green-600 text-xl">✅</span>
                  <div>
                    <p className="font-semibold text-gray-900">Premium-гайды</p>
                    <p className="text-sm text-gray-600">Детальные планы на 30 дней под цель клиента</p>
                  </div>
                </li>
                <li className="flex items-start space-x-3">
                  <span className="text-green-600 text-xl">✅</span>
                  <div>
                    <p className="font-semibold text-gray-900">SEO-блог</p>
                    <p className="text-sm text-gray-600">Контент для привлечения органического трафика</p>
                  </div>
                </li>
              </ul>

              <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
                <p className="text-sm text-gray-700">
                  <span className="font-semibold">Срок разработки:</span> 3 недели
                  <br />
                  <span className="font-semibold">Технологии:</span> React, TypeScript, Next.js
                  <br />
                  <span className="font-semibold">Функционал:</span> Полный цикл от загрузки фото до монетизации
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Note */}
        <div className="mt-12 text-center">
          <p className="text-lg text-gray-700 max-w-2xl mx-auto">
            Этот проект — демонстрация технологии. Для вашего бизнеса мы создадим аналогичное решение,
            адаптированное под ваши услуги, продукты и аудиторию.
          </p>
        </div>
      </div>
    </section>
  )
}
