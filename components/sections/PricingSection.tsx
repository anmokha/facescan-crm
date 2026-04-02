import React from 'react'
import Button from '@/components/ui/Button'

export default function PricingSection() {
  const packages = [
    {
      name: 'Стартовый',
      price: '200 000',
      description: 'Быстрый старт для валидации идеи',
      features: [
        { text: 'MVP-версия диагностики', included: true },
        { text: '1 тип анализа', included: true },
        { text: 'Базовый дизайн', included: true },
        { text: 'Email сбор + автописьмо', included: true },
        { text: 'Webhook в CRM/Telegram', included: true },
        { text: '10-14 дней запуск', included: true },
        { text: 'Фирменный дизайн', included: false },
        { text: 'Поддержка', included: false },
      ],
      popular: false,
    },
    {
      name: 'Профессиональный',
      price: '400 000',
      description: 'Полнофункциональное решение',
      features: [
        { text: 'Полная версия диагностики', included: true },
        { text: 'Кастомная логика анализа', included: true },
        { text: 'Фирменный дизайн', included: true },
        { text: 'CRM интеграция (AmoCRM/Битрикс)', included: true },
        { text: 'Email автоматизация (серия писем)', included: true },
        { text: 'Аналитика и дашборд', included: true },
        { text: '1 месяц поддержки', included: true },
        { text: 'Обучение команды', included: true },
      ],
      popular: true,
    },
  ]

  return (
    <section id="pricing" className="py-20 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            💰 Прозрачные цены
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Фиксированная стоимость без скрытых платежей
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-5xl mx-auto mb-12">
          {packages.map((pkg, index) => (
            <div
              key={index}
              className={`relative bg-white rounded-2xl p-8 shadow-lg ${
                pkg.popular ? 'ring-4 ring-primary-500' : ''
              }`}
            >
              {pkg.popular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="bg-primary-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Популярный
                  </span>
                </div>
              )}

              {/* Package Header */}
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {pkg.name}
                </h3>
                <p className="text-gray-600 text-sm mb-4">{pkg.description}</p>
                <div className="flex items-baseline justify-center">
                  <span className="text-5xl font-bold text-gray-900">
                    {pkg.price}
                  </span>
                  <span className="text-xl text-gray-600 ml-2">₽</span>
                </div>
              </div>

              {/* Features List */}
              <ul className="space-y-3 mb-8">
                {pkg.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start space-x-3">
                    <span className={`mt-0.5 ${feature.included ? 'text-green-600' : 'text-gray-300'}`}>
                      {feature.included ? '✅' : '❌'}
                    </span>
                    <span className={`text-sm ${feature.included ? 'text-gray-700' : 'text-gray-400'}`}>
                      {feature.text}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA Button */}
              <Button
                size="lg"
                variant={pkg.popular ? 'primary' : 'outline'}
                className="w-full"
                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Заказать
              </Button>
            </div>
          ))}
        </div>

        {/* Additional Services */}
        <div className="bg-white rounded-xl p-8 max-w-3xl mx-auto">
          <h3 className="text-xl font-bold text-gray-900 mb-6 text-center">
            Дополнительные услуги
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-900">🔧 Поддержка</span>
                <span className="text-primary-600 font-bold">30 000 ₽/мес</span>
              </div>
              <p className="text-sm text-gray-600">
                Багфиксы, правки контента, обновление промптов, консультации
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-900">📊 Аналитика</span>
                <span className="text-primary-600 font-bold">50 000 ₽/мес</span>
              </div>
              <p className="text-sm text-gray-600">
                Еженедельные отчеты, A/B тесты, оптимизация конверсии
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-900">🎨 Редизайн</span>
                <span className="text-primary-600 font-bold">80 000 ₽</span>
              </div>
              <p className="text-sm text-gray-600">
                Полное обновление дизайна, новый брендинг, улучшенный UX
              </p>
            </div>

            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-semibold text-gray-900">➕ Доп. тип</span>
                <span className="text-primary-600 font-bold">100 000 ₽</span>
              </div>
              <p className="text-sm text-gray-600">
                Дополнительный тип диагностики (например, кожа + волосы)
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
