'use client'

import React, { useState } from 'react'

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0)

  const faqs = [
    {
      question: 'Нужно ли встраивать это в наш сайт?',
      answer: 'Нет. Диагностика работает через iframe или отдельную ссылку. Мы не трогаем ваш сайт вообще. У вас просто появляется кнопка "Онлайн диагностика", которая ведет на наш инструмент. Никаких зависимостей от вашего стека.',
    },
    {
      question: 'Сколько времени на внедрение?',
      answer: '10-14 дней от оплаты до запуска. Это включает настройку логики, адаптацию дизайна, интеграцию с вашей CRM и тестирование.',
    },
    {
      question: 'Как лиды попадают к нам?',
      answer: 'Лиды отправляются вам на email, в Telegram или через webhook в вашу CRM (AmoCRM, Битрикс24, или любую другую). Вы получаете: email клиента, результаты диагностики, дату и время прохождения.',
    },
    {
      question: 'А если нужна своя логика анализа?',
      answer: 'Обсуждаем на созвоне. Мы можем адаптировать логику под ваши требования — это входит в пакет "Профессиональный". Например, добавить специфические вопросы, учитывать дополнительные параметры или интегрировать ваши внутренние алгоритмы.',
    },
    {
      question: 'Это дорого. Как окупится?',
      answer: 'Если вы получите 10-20 клиентов с средним чеком 15-30k₽, инвестиция окупится за 1-2 месяца. Дальше — чистая прибыль. Плюс, это актив, который работает постоянно, в отличие от разовой рекламы.',
    },
    {
      question: 'У вас есть кейсы?',
      answer: 'Да, это наш флагманский проект, который демонстрирует все возможности технологии. Также начинаем работать с первыми B2B клиентами и скоро добавим их кейсы.',
    },
    {
      question: 'А если система ошибется в анализе?',
      answer: 'Система использует современные алгоритмы анализа с высокой точностью. Важно: мы не ставим медицинские диагнозы, а даем рекомендации. В результатах всегда есть дисклеймер: "Для точной диагностики обратитесь к специалисту". Цель — привести клиента к вам, а не заменить консультацию.',
    },
    {
      question: 'У нас мало трафика на сайте',
      answer: 'Даже лучше! Каждый посетитель на вес золота. Диагностика увеличит конверсию существующего трафика с 2-3% до 10-15%. Плюс, это контент для соцсетей: "Пройдите нашу бесплатную диагностику" — привлечет дополнительный трафик.',
    },
    {
      question: 'Какая поддержка после запуска?',
      answer: 'В пакет "Профессиональный" входит 1 месяц бесплатной поддержки (багфиксы, мелкие правки). Дальше можно подключить платную поддержку — 30k₽/мес: багфиксы, правки контента, обновления, консультации.',
    },
    {
      question: 'Можем ли мы получить исходный код?',
      answer: 'Исходный код остается нашей интеллектуальной собственностью. Вы получаете работающий продукт, доступ к админке и полный контроль над контентом. Если нужна полная независимость — можем обсудить выкуп кода за дополнительную плату.',
    },
  ]

  return (
    <section id="faq" className="py-20 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            ❓ Частые вопросы
          </h2>
          <p className="text-xl text-gray-600">
            Ответы на самые популярные вопросы
          </p>
        </div>

        {/* FAQ Accordion */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-gray-50 rounded-lg overflow-hidden border border-gray-200"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-100 transition-colors"
              >
                <span className="font-semibold text-gray-900 pr-4">
                  {faq.question}
                </span>
                <span className={`text-primary-600 text-2xl transition-transform ${openIndex === index ? 'rotate-180' : ''}`}>
                  ↓
                </span>
              </button>

              {openIndex === index && (
                <div className="px-6 pb-4">
                  <p className="text-gray-700 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-12 text-center">
          <p className="text-gray-700 mb-4">
            Не нашли ответ на свой вопрос?
          </p>
          <button
            onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
            className="text-primary-600 hover:text-primary-700 font-semibold underline"
          >
            Задайте его нам напрямую →
          </button>
        </div>
      </div>
    </section>
  )
}
