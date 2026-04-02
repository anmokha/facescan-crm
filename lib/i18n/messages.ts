import type { Locale } from './index'

export type Messages = {
  portalButton: string
  languageLabel: string

  // Dashboard Navigation
  dashboardOverview: string
  dashboardSources: string
  dashboardLeads: string
  dashboardCustomers: string
  dashboardAnalytics: string
  dashboardAcademy: string
  dashboardIntegrations: string
  dashboardSettings: string
  dashboardLogout: string
  dashboardUsage: string
  dashboardLimitReached: string
  dashboardProPlan: string
  dashboardOverviewLoading: string

  checkupUploadSubtitle: string
  checkupSkinTitle: string
  checkupSkinSubtitle: string
  checkupSkinFeatureSkinType: string
  checkupSkinFeatureSkinScore: string
  checkupSkinFeatureVisualAge: string
  checkupSkinFeaturePlan: string
  checkupAnalyzeFailed: string
  checkupReset: string
  checkupLoading: string

  unlockTitle: string
  unlockSubtitle: string
  unlockButton: string
  unlockConsent: string

  phoneLabel: string
  passwordLabel: string

  portalLoginTitle: string
  portalLoginSubtitle: string
  otpUnlockTitle: string
  otpUnlockSubtitle: string

  passwordTitle: string
  passwordSubtitle: string

  loginButton: string
  requestCodeButton: string
  sendingCode: string
  codeTitle: string
  codeSubtitle: (phone: string) => string
  resendInSeconds: (seconds: number) => string
  resendCodeButton: string
  changePhoneButton: string
  forgotPasswordButton: string
  forgotPasswordSent: string
  loggingIn: string
  connectionError: string
  enterPasswordError: string
  invalidPassword: string
  invalidCode: string
  invalidPhone: string

  analysisProcessing: string
  analysisStatusNeedsAttention: string
  analysisStatusHasNuances: string
  analysisStatusExcellent: string
  analysisBetterThan: (percent: number) => string
  analysisSkinMapTitle: string
  analysisSkinTypeLabel: string
  analysisVisualAgeLabel: string
  analysisPhotosNotComparable: string
  analysisDetailedMetricsTitle: string
  analysisMetricHydration: string
  analysisMetricPores: string
  analysisMetricTexture: string
  analysisMetricFirmness: string
  analysisMetricBarrier: string
  analysisMetricTone: string
  analysisMetricDescriptionHydration: string
  analysisMetricDescriptionPores: string
  analysisMetricDescriptionTexture: string
  analysisMetricDescriptionFirmness: string
  analysisMetricDescriptionBarrier: string
  analysisMetricDescriptionTone: string
  analysisWithoutCare: string
  analysisWithCare: string
  followupTitle: string
  followupSubtitle: string
  analysisActiveIngredientsTitle: string
  analysisHowToSearchTitle: string
  analysisHowToSearchBody: string
  analysisProfessionalCareTitle: string
  analysisProfessionalCareSubtitle: string
  analysisRecommendedTreatmentsTitle: string
  analysisTopPriorityBadge: string
  analysisMoreDetails: string
  analysisLessDetails: string
  analysisEffectTitle: string
  analysisWhyYouTitle: string
  analysisBookTreatment: string
  analysisBookOnWhatsApp: string
  analysisExpertSummaryTitle: string
  analysisSaveResultTitle: string
  analysisSaveResultSubtitle: string
  analysisTrackProgressButton: string
  analysisStartNewAnalysis: string
  analysisLeadSaveError: string
  whatsappFallbackMessage: (leadId?: string | null) => string

  // WhatsApp Opt-in & CTA (Dubai Pilot)
  whatsappOptInLabel: string
  whatsappOptInBenefit: string
  whatsappOptInDisclaimer: string
  analysisSendToWhatsApp: string
  analysisSendToWhatsAppSubtitle: string
  analysisWhatsAppOpened: string
  analysisWhatsAppOpenedSubtitle: string
  analysisRequestCallback: string
  analysisRequestCallbackSubtitle: string
  analysisCallbackRequested: string
  analysisGetPersonalOffer: string
  analysisGetPersonalOfferSubtitle: string
  analysisWeWillContactYou: string
  analysisBestChoiceBadge: string
  analysisPersonalInsightTitle: string
  analysisTrustWhyTitle: string
  analysisTrustSafe: string
  analysisTrustDermatologist: string
  analysisTrustTech: string

  uploadDragHint: string
  uploadTitle: string
  uploadSelectButton: string
  uploadAddMore: string
  uploadProcessing: string
  uploadErrorNoFace: string
  uploadErrorFileSize: string
  uploadErrorGeneric: string
  uploadConsent: string
  uploadAnalyzeButton: string
  uploadAnalyzing: string

  // Sources Page
  sourcesDigitalAdsGroup: string
  sourcesSocialGroup: string
  sourcesLocalGroup: string
  sourcesOfflineGroup: string
  sourcesOtherGroup: string
  sourcesPageTitle: string
  sourcesPageSubtitle: string
  sourcesCreateButton: string
  sourcesLoading: string
  sourcesNameRequired: string
  sourcesCreateError: string
  sourcesArchiveConfirm: string
  sourcesOptionInfluencer: string
  sourcesOptionQrReception: string
  sourcesOptionQrOutdoor: string
  sourcesOptionPrint: string
  sourcesOptionPartner: string
  sourcesOptionWebsite: string
  sourcesOptionOther: string
  sourcesModalTitle: string
  sourcesModalChannelLabel: string
  sourcesModalCampaignLabel: string
  sourcesModalCampaignPlaceholder: string
  sourcesModalCampaignHint: string
  sourcesModalContentLabel: string
  sourcesModalContentPlaceholder: string
  sourcesModalCreateButton: string
  sourcesCardArchiveTitle: string
  sourcesCardQrDownloadTitle: string
  sourcesCardCopyButton: string
  sourcesCardCopiedButton: string
  sourcesCardCreatedLabel: string

  // Customers Page
  customersPageTitle: string
  customersPageTotalLabel: string
  customersSearchPlaceholder: string
  customersFilterButton: string
  customersLoading: string
  customersCreateButton: string
  customersTableClient: string
  customersTableLastVisit: string
  customersTableCheckups: string
  customersNoName: string
  customersRepeatNeeded: string
  customersRepeatLabel: string
  customersEmptyState: string

  // Customer Profile Page
  customerBackButton: string
  customerNamePlaceholder: string
  customerNameInputPlaceholder: string
  customerSaveTitle: string
  customerCancelTitle: string
  customerEditTitle: string
  customerSaveNameError: string
  customerFirstSeenLabel: string
  customerCheckupsLabel: string
  customerPortalButton: string
  customerPortalCopied: string
  customerPortalLinkUnavailable: string
  customerRetentionButton: string
  customerRetentionCopied: string
  customerSendEmailButton: string
  customerSendingEmail: string
  customerEmailMissing: string
  customerInviteNoAccess: string
  customerInviteSendFailed: string
  customerInviteSent: string
  customerWhatsAppButton: string
  customerLoading: string
  customerNotFound: string
  customerTreatmentHistoryTitle: string
  customerTreatmentSessionsLabel: string
  customerTreatmentSessionsText: string
  customerTreatmentLastVisit: string
  customerTreatmentCompleted: string
  customerTreatmentInProgress: string
  customerChartTitle: string
  customerChartNoData: string
  customerHistoryTitle: string
  customerHistoryUnknownDate: string
  customerDiagnosticTypeSkin: string
  customerStatusTitle: string
  customerLastScoreLabel: string
  customerSkinTypeLabel: string
  customerSkinTypeUnknown: string
  customerActivityLabel: string
  customerVisitsLabel: string
  customerRetentionStrategyTitle: string
  customerRetentionDueText: string
  customerRetentionNextText: (date: string) => string
  customerRetentionDefaultText: string

  // Lead Details Modal
  leadModalSaveError: string
  leadModalMarkerThinLips: string
  leadModalMarkerPtosis: string
  leadModalMarkerExperienced: string
  leadModalNoIssues: string
  leadModalTreatmentReasonFallback: string
  leadModalNoPriceRecommendations: string
  leadModalVisitResultTitle: string
  leadModalPaidBadge: string
  leadModalMarkSale: string
  leadModalServiceLabel: string
  leadModalServicePlaceholder: string
  leadModalAmountLabel: string
  leadModalSaveButton: string
  leadModalScriptHookFallback: string
  leadModalScriptPainFallback: string
  leadModalScriptObjectionFallback: string
  leadModalWaCare: string
  leadModalWaResult: string
  leadModalWaOffer: string

  // Clinic Settings Form
  clinicSettingsBackToClinics: string
  clinicSettingsEditingTitle: (name: string) => string
  clinicSettingsTitle: string
  clinicSettingsLoading: string
  clinicSettingsSlugReserveError: string
  clinicSettingsDomainAutoRegisterFailed: string
  clinicSettingsSaved: string
  clinicSettingsSaveError: string
  clinicSettingsServicesImported: string
  clinicSettingsServicesNotFound: string
  clinicSettingsParseError: string
  clinicSettingsSectionGeneral: string
  clinicSettingsLabelClinicName: string
  clinicSettingsLabelClinicSlug: string
  clinicSettingsSectionAiServices: string
  clinicSettingsLabelCustomPrompt: string
  clinicSettingsPlaceholderCustomPrompt: string
  clinicSettingsLabelPriceList: string
  clinicSettingsImportFromText: string
  clinicSettingsPlaceholderServiceName: string
  clinicSettingsPlaceholderServicePrice: string
  clinicSettingsServicesEmpty: string
  clinicSettingsSectionBranding: string
  clinicSettingsLabelPrimaryColor: string
  clinicSettingsSectionEntryPoint: string
  clinicSettingsQrTitle: string
  clinicSettingsQrDescription: string
  clinicSettingsDownloadPng: string
  clinicSettingsOpenLink: string
  clinicSettingsImportModalTitle: string
  clinicSettingsImportModalPlaceholder: string
  clinicSettingsCancel: string
  clinicSettingsDetectPrices: string
  clinicSettingsUnsavedChanges: string
  clinicSettingsSave: string

  // Analytics Page
  analyticsPageTitle: string
  analyticsPageSubtitle: string
  analyticsLoading: string
  analyticsDateToday: string
  analyticsDateYesterday: string
  analyticsDateWeek: string
  analyticsDateAll: string
  analyticsDateCustom: string
  analyticsDateFromLabel: string
  analyticsDateToLabel: string
  analyticsCardTotalLeads: string
  analyticsCardConversion: string
  analyticsCardClients: string
  analyticsCardRevenue: string
  analyticsSourcesTitle: string
  analyticsLeadShareLabel: string
  analyticsTableSource: string
  analyticsTableLeads: string
  analyticsTableConversion: string
  analyticsTableRevenue: string
  analyticsTableNoData: string
  analyticsCampaignsTitle: string
  analyticsCampaignsCampaign: string
  analyticsContentTitle: string
  analyticsContentVariant: string
  analyticsContentCampaign: string

  // Integrations Page
  integrationsPageTitle: string
  integrationsPageSubtitle: string
  integrationsSaveButton: string
  integrationsSuccessMessage: string
  integrationsLoading: string
  integrationsSaveError: string
  integrationsWebhookDescription: string
  integrationsWebhookLabel: string
  integrationsWebhookPlaceholder: string
  integrationsYclientsCompanyLabel: string
  integrationsYclientsCompanyPlaceholder: string
  integrationsYclientsTokenLabel: string
  integrationsYclientsTokenPlaceholder: string
  integrationsHubspotTokenLabel: string
  integrationsHubspotTokenPlaceholder: string
  integrationsHubspotTokenHint: string
}

export const MESSAGES: Record<Locale, Messages> = {
  'ru-RU': {
    portalButton: 'Мой портал',
    languageLabel: 'Язык',

    // Dashboard Navigation
    dashboardOverview: 'Обзор',
    dashboardSources: 'Источники',
    dashboardLeads: 'Лиды',
    dashboardCustomers: 'Клиенты',
    dashboardAnalytics: 'Аналитика',
    dashboardAcademy: 'Обучение',
    dashboardIntegrations: 'Интеграции',
    dashboardSettings: 'Настройки',
    dashboardLogout: 'Выйти',
    dashboardUsage: 'Usage',
    dashboardLimitReached: 'Лимит достигнут. Обновите план.',
    dashboardProPlan: 'Pro план',
    dashboardOverviewLoading: 'Загрузка...',

    // Sources Page
    sourcesDigitalAdsGroup: 'Платная реклама',
    sourcesSocialGroup: 'Соцсети',
    sourcesLocalGroup: 'Карты',
    sourcesOfflineGroup: 'Офлайн',
    sourcesOtherGroup: 'Другое',
    sourcesPageTitle: 'Источники трафика',
    sourcesPageSubtitle: 'Создавайте уникальные ссылки и QR-коды для отслеживания рекламы.',
    sourcesCreateButton: 'Создать источник',
    sourcesLoading: 'Загрузка источников...',
    sourcesNameRequired: 'Введите название кампании',
    sourcesCreateError: 'Ошибка создания источника',
    sourcesArchiveConfirm: 'Архивировать этот источник?',
    sourcesOptionInfluencer: 'Блогер / Инфлюенсер',
    sourcesOptionQrReception: 'QR: Ресепшн / Клиника',
    sourcesOptionQrOutdoor: 'QR: Наружная реклама',
    sourcesOptionPrint: 'Листовки / Пресса',
    sourcesOptionPartner: 'Партнерская сеть',
    sourcesOptionWebsite: 'Виджет на сайте',
    sourcesOptionOther: 'Другое',
    sourcesModalTitle: 'Новый источник',
    sourcesModalChannelLabel: 'Тип канала',
    sourcesModalCampaignLabel: 'Название кампании (Campaign Name)',
    sourcesModalCampaignPlaceholder: 'Например: promo_leto_2025 или blogger_anna',
    sourcesModalCampaignHint: 'Это название будет отображаться в Sankey Chart.',
    sourcesModalContentLabel: 'Контент / Вариант (Опционально)',
    sourcesModalContentPlaceholder: 'Например: video_1, banner_red',
    sourcesModalCreateButton: 'Создать ссылку',
    sourcesCardArchiveTitle: 'В архив',
    sourcesCardQrDownloadTitle: 'Скачать QR-код',
    sourcesCardCopyButton: 'Копировать',
    sourcesCardCopiedButton: 'Скопировано',
    sourcesCardCreatedLabel: 'Создан:',

    // Customers Page
    customersPageTitle: 'База клиентов',
    customersPageTotalLabel: 'Всего клиентов:',
    customersSearchPlaceholder: 'Поиск по телефону или имени...',
    customersFilterButton: 'Нужен повтор',
    customersLoading: 'Загрузка базы клиентов...',
    customersCreateButton: 'Создать клиента',
    customersTableClient: 'Клиент',
    customersTableLastVisit: 'Последний визит',
    customersTableCheckups: 'Чекапов',
    customersNoName: 'Без имени',
    customersRepeatNeeded: 'Нужен повтор',
    customersRepeatLabel: 'Повтор:',
    customersEmptyState: 'Клиентов не найдено',

    // Customer Profile Page
    customerBackButton: 'Назад к списку',
    customerNamePlaceholder: 'Укажите имя',
    customerNameInputPlaceholder: 'Введите имя клиента',
    customerSaveTitle: 'Сохранить',
    customerCancelTitle: 'Отмена',
    customerEditTitle: 'Изменить имя',
    customerSaveNameError: 'Ошибка сохранения имени',
    customerFirstSeenLabel: 'Впервые:',
    customerCheckupsLabel: 'Чекапов:',
    customerPortalButton: 'Портал клиента',
    customerPortalCopied: 'Скопировано!',
    customerPortalLinkUnavailable: 'Ссылка на портал недоступна. Нужен новый чекап для генерации токена.',
    customerRetentionButton: 'Ссылка на повтор',
    customerRetentionCopied: 'Скопировано!',
    customerSendEmailButton: 'Отправить письмо',
    customerSendingEmail: 'Отправляем...',
    customerEmailMissing: 'У клиента не указан email',
    customerInviteNoAccess: 'Нет доступа к отправке',
    customerInviteSendFailed: 'Не удалось отправить письмо',
    customerInviteSent: 'Приглашение отправлено',
    customerWhatsAppButton: 'WhatsApp',
    customerLoading: 'Загрузка профиля...',
    customerNotFound: 'Клиент не найден',
    customerTreatmentHistoryTitle: 'История процедур',
    customerTreatmentSessionsLabel: 'из',
    customerTreatmentSessionsText: 'сеансов',
    customerTreatmentLastVisit: 'Последний визит:',
    customerTreatmentCompleted: 'Завершён',
    customerTreatmentInProgress: 'В процессе',
    customerChartTitle: 'Динамика Skin Score',
    customerChartNoData: 'Недостаточно данных для графика',
    customerHistoryTitle: 'История чекапов',
    customerHistoryUnknownDate: 'Неизвестная дата',
    customerDiagnosticTypeSkin: 'Косметология',
    customerStatusTitle: 'Текущий статус',
    customerLastScoreLabel: 'Последний Skin Score',
    customerSkinTypeLabel: 'Тип кожи',
    customerSkinTypeUnknown: 'Не определен',
    customerActivityLabel: 'Активность',
    customerVisitsLabel: 'визитов',
    customerRetentionStrategyTitle: 'Стратегия удержания',
    customerRetentionDueText: 'Клиенту пора на повторный чекап. Отправьте приглашение, чтобы увидеть динамику.',
    customerRetentionNextText: (date) => `Следующий чекап рекомендуем ${date}.`,
    customerRetentionDefaultText: 'Рекомендуется повторить чекап через 3 недели после последней процедуры.',

    // Lead Details Modal
    leadModalSaveError: 'Ошибка сохранения',
    leadModalMarkerThinLips: 'Тонкие губы (Thin)',
    leadModalMarkerPtosis: 'Птоз (Sagging)',
    leadModalMarkerExperienced: 'Опытный (Injections)',
    leadModalNoIssues: 'Без явных проблем',
    leadModalTreatmentReasonFallback: 'Рекомендовано ИИ на основе анализа кожи.',
    leadModalNoPriceRecommendations: 'Нет прямых рекомендаций из прайс-листа.',
    leadModalVisitResultTitle: 'Результат визита',
    leadModalPaidBadge: 'Оплачено',
    leadModalMarkSale: 'Отметить продажу',
    leadModalServiceLabel: 'Услуга / Процедура',
    leadModalServicePlaceholder: 'Например: Биоревитализация',
    leadModalAmountLabel: 'Сумма',
    leadModalSaveButton: 'Сохранить',
    leadModalScriptHookFallback: 'Добрый день! Врач изучил вашу анкету...',
    leadModalScriptPainFallback: 'Без процедур состояние может ухудшиться...',
    leadModalScriptObjectionFallback: 'У нас есть более доступные альтернативы...',
    leadModalWaCare: 'Забота (Care)',
    leadModalWaResult: 'Результат (Result)',
    leadModalWaOffer: 'Оффер (Discount)',

    // Clinic Settings Form
    clinicSettingsBackToClinics: 'Назад к клиникам',
    clinicSettingsEditingTitle: (name) => `Редактирование: ${name}`,
    clinicSettingsTitle: 'Настройки клиники',
    clinicSettingsLoading: 'Загрузка настроек...',
    clinicSettingsSlugReserveError: 'Не удалось занять этот адрес',
    clinicSettingsDomainAutoRegisterFailed:
      'Настройки сохранены, но авто-регистрация домена не удалась. Настройте вручную.',
    clinicSettingsSaved: 'Настройки сохранены!',
    clinicSettingsSaveError: 'Ошибка сохранения',
    clinicSettingsServicesImported: 'Услуги успешно импортированы',
    clinicSettingsServicesNotFound: 'Не удалось найти услуги в тексте',
    clinicSettingsParseError: 'Ошибка обработки',
    clinicSettingsSectionGeneral: 'Основные данные',
    clinicSettingsLabelClinicName: 'Название клиники',
    clinicSettingsLabelClinicSlug: 'Ваш ID (субдомен)',
    clinicSettingsSectionAiServices: 'AI и Услуги',
    clinicSettingsLabelCustomPrompt: 'Кастомный Промпт (Инструкция для ИИ)',
    clinicSettingsPlaceholderCustomPrompt:
      "Например: 'В этом месяце у нас акция на биоревитализацию, предлагай её всем клиентам старше 30 лет...'",
    clinicSettingsLabelPriceList: 'Прайс-лист услуг',
    clinicSettingsImportFromText: 'Импорт из текста/URL',
    clinicSettingsPlaceholderServiceName: 'Название процедуры',
    clinicSettingsPlaceholderServicePrice: 'Цена',
    clinicSettingsServicesEmpty: 'Список услуг пуст.',
    clinicSettingsSectionBranding: 'Брендинг',
    clinicSettingsLabelPrimaryColor: 'Основной цвет',
    clinicSettingsSectionEntryPoint: 'Точка входа (QR Code)',
    clinicSettingsQrTitle: 'Ваш персональный QR-код',
    clinicSettingsQrDescription:
      'Разместите этот код на стойке регистрации, в меню или на визитке. Клиенты смогут отсканировать его и пройти диагностику самостоятельно.',
    clinicSettingsDownloadPng: 'Скачать PNG',
    clinicSettingsOpenLink: 'Открыть ссылку',
    clinicSettingsImportModalTitle: 'Импорт прайс-листа',
    clinicSettingsImportModalPlaceholder: 'Вставьте текст прайс-листа сюда...',
    clinicSettingsCancel: 'Отмена',
    clinicSettingsDetectPrices: 'Распознать цены',
    clinicSettingsUnsavedChanges: 'Есть несохраненные изменения',
    clinicSettingsSave: 'Сохранить',

    // Analytics Page
    analyticsPageTitle: 'Аналитика Маркетинга',
    analyticsPageSubtitle: 'Эффективность ваших рекламных каналов и кампаний.',
    analyticsLoading: 'Формируем отчет...',
    analyticsDateToday: 'Сегодня',
    analyticsDateYesterday: 'Вчера',
    analyticsDateWeek: '7 дней',
    analyticsDateAll: 'Все время',
    analyticsDateCustom: 'Период',
    analyticsDateFromLabel: 'ОТ',
    analyticsDateToLabel: 'ДО',
    analyticsCardTotalLeads: 'Всего Лидов',
    analyticsCardConversion: 'Конверсия в оплату',
    analyticsCardClients: 'Клиентов (ROI)',
    analyticsCardRevenue: 'Выручка (через ИИ)',
    analyticsSourcesTitle: 'Источники трафика (Source)',
    analyticsLeadShareLabel: 'Доля лидов',
    analyticsTableSource: 'Источник',
    analyticsTableLeads: 'Лиды',
    analyticsTableConversion: 'Конв.',
    analyticsTableRevenue: 'Выручка',
    analyticsTableNoData: 'За выбранный период данных нет',
    analyticsCampaignsTitle: 'Активные кампании (Campaign)',
    analyticsCampaignsCampaign: 'Кампания',
    analyticsContentTitle: 'Эффективность объявлений / блогеров (Content)',
    analyticsContentVariant: 'Вариант (Content)',
    analyticsContentCampaign: 'В рамках кампании',

    // Integrations Page
    integrationsPageTitle: 'Интеграции',
    integrationsPageSubtitle: 'Подключите CureScan к вашей CRM, мессенджерам или Zapier.',
    integrationsSaveButton: 'Сохранить изменения',
    integrationsSuccessMessage: 'Настройки сохранены!',
    integrationsLoading: 'Загрузка настроек...',
    integrationsSaveError: 'Ошибка сохранения',
    integrationsWebhookDescription: 'Отправляйте данные о новых лидах в любую систему (CRM, Google Sheets, Slack) через HTTP POST запрос.',
    integrationsWebhookLabel: 'Webhook URL',
    integrationsWebhookPlaceholder: 'https://hooks.zapier.com/hooks/catch/...',
    integrationsYclientsCompanyLabel: 'Company ID',
    integrationsYclientsCompanyPlaceholder: '123456',
    integrationsYclientsTokenLabel: 'API Token (Bearer)',
    integrationsYclientsTokenPlaceholder: 'Ваш токен...',
    integrationsHubspotTokenLabel: 'Private App Access Token',
    integrationsHubspotTokenPlaceholder: 'pat-na1-...',
    integrationsHubspotTokenHint: 'Создайте Private App с правами crm.objects.contacts.write',

    checkupUploadSubtitle: 'Загрузите фото для мгновенного AI-анализа',
    checkupSkinTitle: 'Чекап состояния кожи',
    checkupSkinSubtitle: 'Быстрый анализ по фото и персональный план рекомендаций.',
    checkupSkinFeatureSkinType: 'Тип кожи',
    checkupSkinFeatureSkinScore: 'Skin Score',
    checkupSkinFeatureVisualAge: 'Визуальный возраст',
    checkupSkinFeaturePlan: 'Персональный план рекомендаций',
    checkupAnalyzeFailed: 'Анализ не удался.',
    checkupReset: 'Сбросить',
    checkupLoading: 'Загрузка...',

    unlockTitle: 'Разблокировать результат',
    unlockSubtitle: 'Введите номер телефона, чтобы увидеть свой Skin Score и план ухода.',
    unlockButton: 'Открыть результат',
    unlockConsent: 'Нажимая кнопку, вы соглашаетесь на обработку персональных данных',

    phoneLabel: 'Номер телефона',
    passwordLabel: 'Пароль',

    portalLoginTitle: 'Вход в личный кабинет',
    portalLoginSubtitle: 'Мы отправим код подтверждения на ваш номер',
    otpUnlockTitle: 'Откройте результат',
    otpUnlockSubtitle: 'Введите номер телефона, чтобы увидеть результат.',

    passwordTitle: 'Введите пароль',
    passwordSubtitle: 'У вас уже есть аккаунт. Введите пароль из SMS.',

    loginButton: 'Войти',
    requestCodeButton: 'Отправить код',
    sendingCode: 'Отправка...',
    codeTitle: 'Введите код из SMS',
    codeSubtitle: (phone) => `Отправлен на ${phone}`,
    resendInSeconds: (seconds) => `Повторная отправка через ${seconds} сек`,
    resendCodeButton: 'Отправить код повторно',
    changePhoneButton: 'Изменить номер телефона',
    forgotPasswordButton: 'Забыли пароль? Получить новый',
    forgotPasswordSent: 'Новый пароль отправлен в SMS',
    loggingIn: 'Вход...',
    connectionError: 'Ошибка соединения с сервером',
    enterPasswordError: 'Введите пароль',
    invalidPassword: 'Неверный пароль',
    invalidCode: 'Неверный код',
    invalidPhone: 'Введите корректный номер телефона',

    analysisProcessing: 'Анализируем состояние...',
    analysisStatusNeedsAttention: 'Требует внимания',
    analysisStatusHasNuances: 'Есть нюансы',
    analysisStatusExcellent: 'Отличное состояние',
    analysisBetterThan: (percent) => `Лучше, чем у ${percent}% людей вашего возраста`,
    analysisSkinMapTitle: 'Карта состояния вашей кожи',
    analysisSkinTypeLabel: 'Тип кожи',
    analysisVisualAgeLabel: 'Визуальный возраст',
    analysisPhotosNotComparable:
      'Фото плохо сопоставимы по свету или ракурсу. Чтобы увидеть честную динамику, сделайте повторный чекап при схожих условиях.',
    analysisDetailedMetricsTitle: 'Детальные метрики',
    analysisMetricHydration: 'Увлажнение',
    analysisMetricPores: 'Поры',
    analysisMetricTexture: 'Текстура',
    analysisMetricFirmness: 'Упругость',
    analysisMetricBarrier: 'Барьер',
    analysisMetricTone: 'Ровный тон',
    analysisMetricDescriptionHydration: 'Уровень глубокого увлажнения. Критически важен в сухом климате Дубая.',
    analysisMetricDescriptionPores: 'Чистота и размер пор. Отражает общую чистоту и свежесть кожи.',
    analysisMetricDescriptionTexture: 'Гладкость рельефа. Низкий балл указывает на необходимость шлифовки.',
    analysisMetricDescriptionFirmness: 'Плотность и эластичность дермы. Главный показатель для лифтинга.',
    analysisMetricDescriptionBarrier: 'Способность кожи сопротивляться стрессу и удерживать влагу.',
    analysisMetricDescriptionTone: 'Равномерность пигментации. Важно для борьбы с фотостарением.',
    analysisWithoutCare: 'Без ухода (через 1 год)',
    analysisWithCare: 'С уходом (через 3 месяца)',
    followupTitle: 'С возвращением!',
    followupSubtitle: 'Загрузите свежие фото для оценки прогресса',
    analysisActiveIngredientsTitle: 'Подходящие ингредиенты',
    analysisHowToSearchTitle: 'Как искать средства',
    analysisHowToSearchBody:
      'На маркетплейсах и в магазинах косметики ищите продукты с этими ингредиентами в составе. Обращайте внимание на первые 5–7 компонентов: чем выше в списке, тем больше концентрация.',
    analysisProfessionalCareTitle: 'Профессиональный уход',
    analysisProfessionalCareSubtitle: 'Процедуры для быстрого результата.',
    analysisRecommendedTreatmentsTitle: 'Подходящие процедуры',
    analysisTopPriorityBadge: 'Приоритет',
    analysisMoreDetails: 'Подробнее',
    analysisLessDetails: 'Скрыть',
    analysisEffectTitle: 'Какой эффект?',
    analysisWhyYouTitle: 'Почему это важно вам?',
    analysisBookTreatment: 'Записаться на процедуру',
    analysisBookOnWhatsApp: 'Записаться в WhatsApp',
    analysisExpertSummaryTitle: 'Резюме эксперта',
    analysisSaveResultTitle: 'Сохраните результат',
    analysisSaveResultSubtitle:
      'Отслеживайте динамику состояния кожи, сравнивайте результаты "До/После" и получайте персональные рекомендации в личном кабинете.',
    analysisTrackProgressButton: 'Отслеживать прогресс',
    analysisStartNewAnalysis: 'Начать новый анализ',
    analysisLeadSaveError: 'Произошла ошибка при сохранении данных.',
    whatsappFallbackMessage: (leadId) =>
      `Здравствуйте! Я прошёл(а) AI checkup. ${leadId ? `Мой ID: ${leadId}. ` : ''}Хочу записаться на консультацию.`,

    // WhatsApp Opt-in & CTA
    whatsappOptInLabel: 'Я согласен(а) на контакт по WhatsApp для обсуждения результатов и записи.',
    whatsappOptInBenefit: '→ Чтобы мы могли отправить вам результаты и доступное время.',
    whatsappOptInDisclaimer: '→ Никакого спама. Отпишитесь в любой момент.',
    analysisSendToWhatsApp: 'Отправить результаты в WhatsApp',
    analysisSendToWhatsAppSubtitle: 'Продолжите общение и запишитесь мгновенно',
    analysisWhatsAppOpened: 'WhatsApp открыт!',
    analysisWhatsAppOpenedSubtitle: 'Клиника скоро ответит вам со свободным временем.',
    analysisRequestCallback: 'Заказать обратный звонок',
    analysisRequestCallbackSubtitle: 'Мы перезвоним вам в течение 15 минут',
    analysisCallbackRequested: 'Заказан обратный звонок! Мы позвоним вам в течение 15 минут.',
    analysisGetPersonalOffer: 'Получить персональное предложение',
    analysisGetPersonalOfferSubtitle: 'Клиника свяжется с вами и предложит лучший вариант.',
    analysisWeWillContactYou: 'Мы с вами свяжемся.',
    analysisBestChoiceBadge: 'Лучший выбор для вас',
    analysisPersonalInsightTitle: 'Персональный инсайт',
    analysisTrustWhyTitle: 'Почему это работает именно для вас',
    analysisTrustSafe: 'Безопасно для вашего типа кожи',
    analysisTrustDermatologist: 'Одобрено дерматологами',
    analysisTrustTech: 'Передовой AI-анализ',

    uploadDragHint: 'Перетащите файлы или нажмите для загрузки',
    uploadTitle: 'Загрузите фотографии',
    uploadSelectButton: 'Выбрать фото',
    uploadAddMore: 'Добавить',
    uploadProcessing: 'Обработка...',
    uploadErrorNoFace: 'На фото не обнаружено лицо. Пожалуйста, используйте более четкий снимок анфас.',
    uploadErrorFileSize: 'Файл слишком большой или формат не поддерживается',
    uploadErrorGeneric: 'Не удалось обработать фото',
    uploadConsent: 'Я даю согласие на обработку персональных данных и сохранение фотографий для проведения анализа.',
    uploadAnalyzeButton: 'Анализировать',
    uploadAnalyzing: 'Анализируем...'
  },
  'en-US': {
    portalButton: 'My portal',
    languageLabel: 'Language',

    // Dashboard Navigation
    dashboardOverview: 'Overview',
    dashboardSources: 'Sources',
    dashboardLeads: 'Leads',
    dashboardCustomers: 'Customers',
    dashboardAnalytics: 'Analytics',
    dashboardAcademy: 'Academy',
    dashboardIntegrations: 'Integrations',
    dashboardSettings: 'Settings',
    dashboardLogout: 'Logout',
    dashboardUsage: 'Usage',
    dashboardLimitReached: 'Limit reached. Upgrade plan.',
    dashboardProPlan: 'Pro Plan',
    dashboardOverviewLoading: 'Loading...',

    // Sources Page
    sourcesDigitalAdsGroup: 'Paid Ads',
    sourcesSocialGroup: 'Social Media',
    sourcesLocalGroup: 'Maps',
    sourcesOfflineGroup: 'Offline',
    sourcesOtherGroup: 'Other',
    sourcesPageTitle: 'Traffic Sources',
    sourcesPageSubtitle: 'Create unique links and QR codes to track your advertising.',
    sourcesCreateButton: 'Create Source',
    sourcesLoading: 'Loading sources...',
    sourcesNameRequired: 'Please enter a campaign name',
    sourcesCreateError: 'Error creating source',
    sourcesArchiveConfirm: 'Archive this source?',
    sourcesOptionInfluencer: 'Influencer / Blogger',
    sourcesOptionQrReception: 'QR: Reception / Clinic',
    sourcesOptionQrOutdoor: 'QR: Outdoor Ads',
    sourcesOptionPrint: 'Flyers / Press',
    sourcesOptionPartner: 'Partner Network',
    sourcesOptionWebsite: 'Website Widget',
    sourcesOptionOther: 'Other',
    sourcesModalTitle: 'New Source',
    sourcesModalChannelLabel: 'Channel Type',
    sourcesModalCampaignLabel: 'Campaign Name',
    sourcesModalCampaignPlaceholder: 'Example: promo_summer_2025 or blogger_anna',
    sourcesModalCampaignHint: 'This name will be displayed in the Funnel Chart.',
    sourcesModalContentLabel: 'Content / Variant (Optional)',
    sourcesModalContentPlaceholder: 'Example: video_1, banner_red',
    sourcesModalCreateButton: 'Create Link',
    sourcesCardArchiveTitle: 'Archive',
    sourcesCardQrDownloadTitle: 'Download QR Code',
    sourcesCardCopyButton: 'Copy',
    sourcesCardCopiedButton: 'Copied',
    sourcesCardCreatedLabel: 'Created:',

    // Customers Page
    customersPageTitle: 'Customer Database',
    customersPageTotalLabel: 'Total Customers:',
    customersSearchPlaceholder: 'Search by phone or name...',
    customersFilterButton: 'Needs Repeat',
    customersLoading: 'Loading customer database...',
    customersCreateButton: 'Create Customer',
    customersTableClient: 'Client',
    customersTableLastVisit: 'Last Visit',
    customersTableCheckups: 'Checkups',
    customersNoName: 'No Name',
    customersRepeatNeeded: 'Needs Repeat',
    customersRepeatLabel: 'Repeat:',
    customersEmptyState: 'No customers found',

    // Customer Profile Page
    customerBackButton: 'Back to List',
    customerNamePlaceholder: 'Specify Name',
    customerNameInputPlaceholder: 'Enter customer name',
    customerSaveTitle: 'Save',
    customerCancelTitle: 'Cancel',
    customerEditTitle: 'Edit Name',
    customerSaveNameError: 'Failed to save name',
    customerFirstSeenLabel: 'First Seen:',
    customerCheckupsLabel: 'Checkups:',
    customerPortalButton: 'Customer Portal',
    customerPortalCopied: 'Copied!',
    customerPortalLinkUnavailable: 'Portal link is unavailable. A new checkup is required to generate a token.',
    customerRetentionButton: 'Retention Link',
    customerRetentionCopied: 'Copied!',
    customerSendEmailButton: 'Send Email',
    customerSendingEmail: 'Sending...',
    customerEmailMissing: 'Customer email is missing',
    customerInviteNoAccess: 'No permission to send',
    customerInviteSendFailed: 'Failed to send email',
    customerInviteSent: 'Invite sent',
    customerWhatsAppButton: 'WhatsApp',
    customerLoading: 'Loading profile...',
    customerNotFound: 'Customer not found',
    customerTreatmentHistoryTitle: 'Treatment History',
    customerTreatmentSessionsLabel: 'of',
    customerTreatmentSessionsText: 'sessions',
    customerTreatmentLastVisit: 'Last Visit:',
    customerTreatmentCompleted: 'Completed',
    customerTreatmentInProgress: 'In Progress',
    customerChartTitle: 'Skin Score Progress',
    customerChartNoData: 'Not enough data for chart',
    customerHistoryTitle: 'Checkup History',
    customerHistoryUnknownDate: 'Unknown Date',
    customerDiagnosticTypeSkin: 'Cosmetology',
    customerStatusTitle: 'Current Status',
    customerLastScoreLabel: 'Last Skin Score',
    customerSkinTypeLabel: 'Skin Type',
    customerSkinTypeUnknown: 'Not Determined',
    customerActivityLabel: 'Activity',
    customerVisitsLabel: 'visits',
    customerRetentionStrategyTitle: 'Retention Strategy',
    customerRetentionDueText: 'It’s time for a repeat checkup. Send an invite to track progress.',
    customerRetentionNextText: (date) => `Next checkup recommended: ${date}.`,
    customerRetentionDefaultText: 'We recommend repeating the checkup ~3 weeks after the last procedure.',

    // Lead Details Modal
    leadModalSaveError: 'Failed to save',
    leadModalMarkerThinLips: 'Thin lips (Thin)',
    leadModalMarkerPtosis: 'Ptosis (Sagging)',
    leadModalMarkerExperienced: 'Experienced (Injections)',
    leadModalNoIssues: 'No clear issues',
    leadModalTreatmentReasonFallback: 'Recommended by AI based on skin analysis.',
    leadModalNoPriceRecommendations: 'No direct recommendations from your price list.',
    leadModalVisitResultTitle: 'Visit Outcome',
    leadModalPaidBadge: 'Paid',
    leadModalMarkSale: 'Mark Sale',
    leadModalServiceLabel: 'Service / Treatment',
    leadModalServicePlaceholder: 'Example: Biorevitalization',
    leadModalAmountLabel: 'Amount',
    leadModalSaveButton: 'Save',
    leadModalScriptHookFallback: 'Hello! The doctor reviewed your AI checkup...',
    leadModalScriptPainFallback: 'Without treatment, the condition may worsen...',
    leadModalScriptObjectionFallback: 'We have more affordable alternatives...',
    leadModalWaCare: 'Care',
    leadModalWaResult: 'Result',
    leadModalWaOffer: 'Offer (Discount)',

    // Clinic Settings Form
    clinicSettingsBackToClinics: 'Back to Clinics',
    clinicSettingsEditingTitle: (name) => `Editing: ${name}`,
    clinicSettingsTitle: 'Clinic Settings',
    clinicSettingsLoading: 'Loading settings...',
    clinicSettingsSlugReserveError: 'Failed to reserve this address',
    clinicSettingsDomainAutoRegisterFailed:
      'Settings saved, but domain auto-registration failed. Please configure it manually.',
    clinicSettingsSaved: 'Settings saved!',
    clinicSettingsSaveError: 'Failed to save settings',
    clinicSettingsServicesImported: 'Services imported successfully',
    clinicSettingsServicesNotFound: 'No services found in the text',
    clinicSettingsParseError: 'Parsing failed',
    clinicSettingsSectionGeneral: 'General',
    clinicSettingsLabelClinicName: 'Clinic name',
    clinicSettingsLabelClinicSlug: 'Your ID (subdomain)',
    clinicSettingsSectionAiServices: 'AI & Services',
    clinicSettingsLabelCustomPrompt: 'Custom prompt (AI instructions)',
    clinicSettingsPlaceholderCustomPrompt:
      "Example: 'This month we have a biorevitalization promo; offer it to all clients over 30...'",
    clinicSettingsLabelPriceList: 'Service price list',
    clinicSettingsImportFromText: 'Import from text/URL',
    clinicSettingsPlaceholderServiceName: 'Service name',
    clinicSettingsPlaceholderServicePrice: 'Price',
    clinicSettingsServicesEmpty: 'No services yet.',
    clinicSettingsSectionBranding: 'Branding',
    clinicSettingsLabelPrimaryColor: 'Primary color',
    clinicSettingsSectionEntryPoint: 'Entry point (QR code)',
    clinicSettingsQrTitle: 'Your personal QR code',
    clinicSettingsQrDescription:
      'Place this code at reception, in a menu, or on a business card. Clients can scan it and complete the diagnostic on their own.',
    clinicSettingsDownloadPng: 'Download PNG',
    clinicSettingsOpenLink: 'Open link',
    clinicSettingsImportModalTitle: 'Import price list',
    clinicSettingsImportModalPlaceholder: 'Paste your price list text here...',
    clinicSettingsCancel: 'Cancel',
    clinicSettingsDetectPrices: 'Detect prices',
    clinicSettingsUnsavedChanges: 'You have unsaved changes',
    clinicSettingsSave: 'Save',

    // Analytics Page
    analyticsPageTitle: 'Marketing Analytics',
    analyticsPageSubtitle: 'Performance of your advertising channels and campaigns.',
    analyticsLoading: 'Generating report...',
    analyticsDateToday: 'Today',
    analyticsDateYesterday: 'Yesterday',
    analyticsDateWeek: '7 Days',
    analyticsDateAll: 'All Time',
    analyticsDateCustom: 'Period',
    analyticsDateFromLabel: 'FROM',
    analyticsDateToLabel: 'TO',
    analyticsCardTotalLeads: 'Total Leads',
    analyticsCardConversion: 'Conversion to Payment',
    analyticsCardClients: 'Clients (ROI)',
    analyticsCardRevenue: 'Revenue (AI-tracked)',
    analyticsSourcesTitle: 'Traffic Sources (Source)',
    analyticsLeadShareLabel: 'Lead share',
    analyticsTableSource: 'Source',
    analyticsTableLeads: 'Leads',
    analyticsTableConversion: 'Conv.',
    analyticsTableRevenue: 'Revenue',
    analyticsTableNoData: 'No data for selected period',
    analyticsCampaignsTitle: 'Active Campaigns (Campaign)',
    analyticsCampaignsCampaign: 'Campaign',
    analyticsContentTitle: 'Ad / Influencer Performance (Content)',
    analyticsContentVariant: 'Variant (Content)',
    analyticsContentCampaign: 'Within Campaign',

    // Integrations Page
    integrationsPageTitle: 'Integrations',
    integrationsPageSubtitle: 'Connect CureScan to your CRM, messengers, or Zapier.',
    integrationsSaveButton: 'Save Changes',
    integrationsSuccessMessage: 'Settings saved!',
    integrationsLoading: 'Loading settings...',
    integrationsSaveError: 'Failed to save settings',
    integrationsWebhookDescription: 'Send new lead data to any system (CRM, Google Sheets, Slack) via HTTP POST request.',
    integrationsWebhookLabel: 'Webhook URL',
    integrationsWebhookPlaceholder: 'https://hooks.zapier.com/hooks/catch/...',
    integrationsYclientsCompanyLabel: 'Company ID',
    integrationsYclientsCompanyPlaceholder: '123456',
    integrationsYclientsTokenLabel: 'API Token (Bearer)',
    integrationsYclientsTokenPlaceholder: 'Your token...',
    integrationsHubspotTokenLabel: 'Private App Access Token',
    integrationsHubspotTokenPlaceholder: 'pat-na1-...',
    integrationsHubspotTokenHint: 'Create Private App with crm.objects.contacts.write permissions',

    checkupUploadSubtitle: 'Upload photos for an instant AI analysis',
    checkupSkinTitle: 'Skin Condition Checkup',
    checkupSkinSubtitle: 'Fast photo-based analysis with a personalized plan.',
    checkupSkinFeatureSkinType: 'Skin type',
    checkupSkinFeatureSkinScore: 'Skin Score',
    checkupSkinFeatureVisualAge: 'Visual age',
    checkupSkinFeaturePlan: 'Personalized recommendation plan',
    checkupAnalyzeFailed: 'Analysis failed.',
    checkupReset: 'Reset',
    checkupLoading: 'Loading...',

    unlockTitle: 'Unlock your result',
    unlockSubtitle: 'Enter your phone number to see your Skin Score and personalized plan.',
    unlockButton: 'Unlock result',
    unlockConsent: 'By clicking the button, you consent to personal data processing',

    phoneLabel: 'Phone number',
    passwordLabel: 'Password',

    portalLoginTitle: 'Log in to your portal',
    portalLoginSubtitle: 'We’ll send a verification code to your phone',
    otpUnlockTitle: 'Unlock your result',
    otpUnlockSubtitle: 'Enter your phone number to view your result.',

    passwordTitle: 'Enter your password',
    passwordSubtitle: 'You already have an account. Enter the password from SMS.',

    loginButton: 'Log in',
    requestCodeButton: 'Send code',
    sendingCode: 'Sending...',
    codeTitle: 'Enter the SMS code',
    codeSubtitle: (phone) => `Sent to ${phone}`,
    resendInSeconds: (seconds) => `Resend available in ${seconds}s`,
    resendCodeButton: 'Resend code',
    changePhoneButton: 'Change phone number',
    forgotPasswordButton: 'Forgot password? Get a new one',
    forgotPasswordSent: 'A new password was sent by SMS',
    loggingIn: 'Logging in...',
    connectionError: 'Connection error',
    enterPasswordError: 'Enter your password',
    invalidPassword: 'Incorrect password',
    invalidCode: 'Invalid code',
    invalidPhone: 'Enter a valid phone number',

    analysisProcessing: 'Analyzing...',
    analysisStatusNeedsAttention: 'Needs attention',
    analysisStatusHasNuances: 'Some concerns',
    analysisStatusExcellent: 'Excellent condition',
    analysisBetterThan: (percent) => `Better than ${percent}% of people your age`,
    analysisSkinMapTitle: 'Your skin condition map',
    analysisSkinTypeLabel: 'Skin type',
    analysisVisualAgeLabel: 'Visual age',
    analysisPhotosNotComparable:
      'Photos are not comparable due to lighting or angle. For an honest progress check, retake under similar conditions.',
    analysisDetailedMetricsTitle: 'Detailed metrics',
    analysisMetricHydration: 'Hydration',
    analysisMetricPores: 'Pores',
    analysisMetricTexture: 'Texture',
    analysisMetricFirmness: 'Firmness',
    analysisMetricBarrier: 'Barrier',
    analysisMetricTone: 'Tone',
    analysisMetricDescriptionHydration: 'Measures deep moisture levels. Crucial for Dubai\'s dry AC environment.',
    analysisMetricDescriptionPores: 'Evaluates pore refinement and congestion. Reflects skin clarity.',
    analysisMetricDescriptionTexture: 'Assesses smoothness and mimic patterns. Lower score suggests need for resurfacing.',
    analysisMetricDescriptionFirmness: 'Dermal density and elasticity. Primary indicator for lifting needs.',
    analysisMetricDescriptionBarrier: 'Skin\'s resilience against stress. Essential for sensitive or reactive skin.',
    analysisMetricDescriptionTone: 'Evenness of pigment distribution. Key for managing sun-induced damage.',
    analysisWithoutCare: 'Without care (in 1 year)',
    analysisWithCare: 'With care (in 3 months)',
    followupTitle: 'Welcome back!',
    followupSubtitle: 'Upload new photos to assess your progress',
    analysisActiveIngredientsTitle: 'Active ingredients',
    analysisHowToSearchTitle: 'How to shop',
    analysisHowToSearchBody:
      'On marketplaces and in stores, look for products that include these ingredients. Focus on the first 5–7 items: the higher the ingredient is listed, the higher its concentration.',
    analysisProfessionalCareTitle: 'Professional care',
    analysisProfessionalCareSubtitle: 'Treatments for faster results.',
    analysisRecommendedTreatmentsTitle: 'Recommended treatments',
    analysisTopPriorityBadge: 'Priority',
    analysisMoreDetails: 'Details',
    analysisLessDetails: 'Hide',
    analysisEffectTitle: 'What effect to expect?',
    analysisWhyYouTitle: 'Why it matters for you',
    analysisBookTreatment: 'Book a treatment',
    analysisBookOnWhatsApp: 'Book via WhatsApp',
    analysisExpertSummaryTitle: 'Expert summary',
    analysisSaveResultTitle: 'Save your result',
    analysisSaveResultSubtitle:
      'Track your progress, compare before/after, and get personalized recommendations in your portal.',
    analysisTrackProgressButton: 'Track progress',
    analysisStartNewAnalysis: 'Start a new analysis',
    analysisLeadSaveError: 'Failed to save your details.',
    whatsappFallbackMessage: (leadId) =>
      `Hi! I completed an AI checkup. ${leadId ? `My ID: ${leadId}. ` : ''}I'd like to book a consultation.`,

    // WhatsApp Opt-in & CTA
    whatsappOptInLabel: 'I agree to be contacted on WhatsApp regarding my results and booking.',
    whatsappOptInBenefit: '→ So we can send your summary & available slots on WhatsApp.',
    whatsappOptInDisclaimer: '→ No spam. Opt out anytime.',
    analysisSendToWhatsApp: 'Send my results to WhatsApp',
    analysisSendToWhatsAppSubtitle: 'Continue the conversation and book instantly',
    analysisWhatsAppOpened: 'WhatsApp opened!',
    analysisWhatsAppOpenedSubtitle: 'The clinic will respond shortly with available times.',
    analysisRequestCallback: 'Request a callback',
    analysisRequestCallbackSubtitle: "We'll call you within 15 minutes",
    analysisCallbackRequested: 'Callback requested! We will call you within 15 minutes.',
    analysisGetPersonalOffer: 'Get a personalized offer',
    analysisGetPersonalOfferSubtitle: 'The clinic will contact you with the best option.',
    analysisWeWillContactYou: 'We will contact you.',
    analysisBestChoiceBadge: 'Best Choice for You',
    analysisPersonalInsightTitle: 'Personal Insight',
    analysisTrustWhyTitle: 'Why this works for you',
    analysisTrustSafe: 'Safe for your skin type',
    analysisTrustDermatologist: 'Dermatologist approved',
    analysisTrustTech: 'Advanced AI analysis',

    uploadDragHint: 'Drag and drop files or click to upload',
    uploadTitle: 'Upload photos',
    uploadSelectButton: 'Select photos',
    uploadAddMore: 'Add more',
    uploadProcessing: 'Processing...',
    uploadErrorNoFace: 'No face detected in the photo. Please use a clearer front-facing image.',
    uploadErrorFileSize: 'File is too large or format is not supported',
    uploadErrorGeneric: 'Failed to process photo',
    uploadConsent: 'I consent to the processing of personal data and storage of photos for analysis.',
    uploadAnalyzeButton: 'Analyze',
    uploadAnalyzing: 'Analyzing...'
  },
  'ar-AE': {
    portalButton: 'بوابتي',
    languageLabel: 'اللغة',

    // Dashboard Navigation
    dashboardOverview: 'نظرة عامة',
    dashboardSources: 'المصادر',
    dashboardLeads: 'العملاء المحتملون',
    dashboardCustomers: 'العملاء',
    dashboardAnalytics: 'التحليلات',
    dashboardAcademy: 'الأكاديمية',
    dashboardIntegrations: 'التكاملات',
    dashboardSettings: 'الإعدادات',
    dashboardLogout: 'تسجيل الخروج',
    dashboardUsage: 'الاستخدام',
    dashboardLimitReached: 'تم الوصول إلى الحد. قم بالترقية.',
    dashboardProPlan: 'خطة برو',
    dashboardOverviewLoading: 'جارٍ التحميل...',

    // Sources Page
    sourcesDigitalAdsGroup: 'الإعلانات المدفوعة',
    sourcesSocialGroup: 'وسائل التواصل الاجتماعي',
    sourcesLocalGroup: 'الخرائط',
    sourcesOfflineGroup: 'غير متصل',
    sourcesOtherGroup: 'أخرى',
    sourcesPageTitle: 'مصادر الزيارات',
    sourcesPageSubtitle: 'أنشئ روابط فريدة ورموز QR لتتبع إعلاناتك.',
    sourcesCreateButton: 'إنشاء مصدر',
    sourcesLoading: 'جارٍ تحميل المصادر...',
    sourcesNameRequired: 'يرجى إدخال اسم الحملة',
    sourcesCreateError: 'تعذر إنشاء المصدر',
    sourcesArchiveConfirm: 'أرشفة هذا المصدر؟',
    sourcesOptionInfluencer: 'مؤثر / مدوّن',
    sourcesOptionQrReception: 'QR: الاستقبال / العيادة',
    sourcesOptionQrOutdoor: 'QR: إعلانات خارجية',
    sourcesOptionPrint: 'منشورات / صحافة',
    sourcesOptionPartner: 'شبكة شركاء',
    sourcesOptionWebsite: 'ودجت الموقع',
    sourcesOptionOther: 'أخرى',
    sourcesModalTitle: 'مصدر جديد',
    sourcesModalChannelLabel: 'نوع القناة',
    sourcesModalCampaignLabel: 'اسم الحملة',
    sourcesModalCampaignPlaceholder: 'مثال: promo_summer_2025 أو blogger_anna',
    sourcesModalCampaignHint: 'سيظهر هذا الاسم في مخطط التحويل.',
    sourcesModalContentLabel: 'المحتوى / البديل (اختياري)',
    sourcesModalContentPlaceholder: 'مثال: video_1, banner_red',
    sourcesModalCreateButton: 'إنشاء رابط',
    sourcesCardArchiveTitle: 'أرشفة',
    sourcesCardQrDownloadTitle: 'تنزيل رمز QR',
    sourcesCardCopyButton: 'نسخ',
    sourcesCardCopiedButton: 'تم النسخ',
    sourcesCardCreatedLabel: 'تم الإنشاء:',

    // Customers Page
    customersPageTitle: 'قاعدة بيانات العملاء',
    customersPageTotalLabel: 'إجمالي العملاء:',
    customersSearchPlaceholder: 'البحث بالهاتف أو الاسم...',
    customersFilterButton: 'يحتاج إلى تكرار',
    customersLoading: 'جارٍ تحميل قاعدة بيانات العملاء...',
    customersCreateButton: 'إنشاء عميل',
    customersTableClient: 'العميل',
    customersTableLastVisit: 'آخر زيارة',
    customersTableCheckups: 'الفحوصات',
    customersNoName: 'بدون اسم',
    customersRepeatNeeded: 'يحتاج إلى تكرار',
    customersRepeatLabel: 'تكرار:',
    customersEmptyState: 'لم يتم العثور على عملاء',

    // Customer Profile Page
    customerBackButton: 'العودة إلى القائمة',
    customerNamePlaceholder: 'حدد الاسم',
    customerNameInputPlaceholder: 'أدخل اسم العميل',
    customerSaveTitle: 'حفظ',
    customerCancelTitle: 'إلغاء',
    customerEditTitle: 'تعديل الاسم',
    customerSaveNameError: 'تعذر حفظ الاسم',
    customerFirstSeenLabel: 'أول مشاهدة:',
    customerCheckupsLabel: 'الفحوصات:',
    customerPortalButton: 'بوابة العميل',
    customerPortalCopied: 'تم النسخ!',
    customerPortalLinkUnavailable: 'رابط البوابة غير متاح. يلزم إجراء فحص جديد لإنشاء رمز.',
    customerRetentionButton: 'رابط الاحتفاظ',
    customerRetentionCopied: 'تم النسخ!',
    customerSendEmailButton: 'إرسال بريد إلكتروني',
    customerSendingEmail: 'جارٍ الإرسال...',
    customerEmailMissing: 'البريد الإلكتروني غير موجود',
    customerInviteNoAccess: 'لا توجد صلاحية للإرسال',
    customerInviteSendFailed: 'فشل إرسال البريد',
    customerInviteSent: 'تم إرسال الدعوة',
    customerWhatsAppButton: 'واتساب',
    customerLoading: 'جارٍ تحميل الملف الشخصي...',
    customerNotFound: 'لم يتم العثور على العميل',
    customerTreatmentHistoryTitle: 'تاريخ العلاج',
    customerTreatmentSessionsLabel: 'من',
    customerTreatmentSessionsText: 'جلسات',
    customerTreatmentLastVisit: 'آخر زيارة:',
    customerTreatmentCompleted: 'مكتمل',
    customerTreatmentInProgress: 'قيد التنفيذ',
    customerChartTitle: 'تقدم نتيجة البشرة',
    customerChartNoData: 'بيانات غير كافية للرسم البياني',
    customerHistoryTitle: 'سجل الفحوصات',
    customerHistoryUnknownDate: 'تاريخ غير معروف',
    customerDiagnosticTypeSkin: 'تجميل',
    customerStatusTitle: 'الحالة الحالية',
    customerLastScoreLabel: 'آخر نتيجة البشرة',
    customerSkinTypeLabel: 'نوع البشرة',
    customerSkinTypeUnknown: 'غير محدد',
    customerActivityLabel: 'النشاط',
    customerVisitsLabel: 'زيارات',
    customerRetentionStrategyTitle: 'استراتيجية الاحتفاظ',
    customerRetentionDueText: 'حان وقت فحص متابعة. أرسل دعوة لمتابعة التقدم.',
    customerRetentionNextText: (date) => `الفحص التالي الموصى به: ${date}.`,
    customerRetentionDefaultText: 'نوصي بإعادة الفحص بعد حوالي 3 أسابيع من آخر إجراء.',

    // Lead Details Modal
    leadModalSaveError: 'تعذر الحفظ',
    leadModalMarkerThinLips: 'شفاه رقيقة (Thin)',
    leadModalMarkerPtosis: 'ترهل (Sagging)',
    leadModalMarkerExperienced: 'خبير (Injections)',
    leadModalNoIssues: 'لا توجد مشاكل واضحة',
    leadModalTreatmentReasonFallback: 'موصى به بالذكاء الاصطناعي بناءً على تحليل البشرة.',
    leadModalNoPriceRecommendations: 'لا توجد توصيات مباشرة من قائمة الأسعار.',
    leadModalVisitResultTitle: 'نتيجة الزيارة',
    leadModalPaidBadge: 'تم الدفع',
    leadModalMarkSale: 'تسجيل عملية بيع',
    leadModalServiceLabel: 'الخدمة / الإجراء',
    leadModalServicePlaceholder: 'مثال: Biorevitalization',
    leadModalAmountLabel: 'المبلغ',
    leadModalSaveButton: 'حفظ',
    leadModalScriptHookFallback: 'Hello! The doctor reviewed your AI checkup...',
    leadModalScriptPainFallback: 'Without treatment, the condition may worsen...',
    leadModalScriptObjectionFallback: 'We have more affordable alternatives...',
    leadModalWaCare: 'عناية (Care)',
    leadModalWaResult: 'نتيجة (Result)',
    leadModalWaOffer: 'عرض (Discount)',

    // Clinic Settings Form
    clinicSettingsBackToClinics: 'العودة إلى العيادات',
    clinicSettingsEditingTitle: (name) => `تحرير: ${name}`,
    clinicSettingsTitle: 'إعدادات العيادة',
    clinicSettingsLoading: 'جارٍ تحميل الإعدادات...',
    clinicSettingsSlugReserveError: 'تعذر حجز هذا العنوان',
    clinicSettingsDomainAutoRegisterFailed: 'تم حفظ الإعدادات ولكن فشل ربط النطاق تلقائيًا. يرجى الإعداد يدويًا.',
    clinicSettingsSaved: 'تم حفظ الإعدادات!',
    clinicSettingsSaveError: 'تعذر حفظ الإعدادات',
    clinicSettingsServicesImported: 'تم استيراد الخدمات بنجاح',
    clinicSettingsServicesNotFound: 'لم يتم العثور على خدمات في النص',
    clinicSettingsParseError: 'فشل المعالجة',
    clinicSettingsSectionGeneral: 'البيانات الأساسية',
    clinicSettingsLabelClinicName: 'اسم العيادة',
    clinicSettingsLabelClinicSlug: 'معرّفك (النطاق الفرعي)',
    clinicSettingsSectionAiServices: 'الذكاء الاصطناعي والخدمات',
    clinicSettingsLabelCustomPrompt: 'نص مخصص (تعليمات الذكاء الاصطناعي)',
    clinicSettingsPlaceholderCustomPrompt:
      "مثال: 'هذا الشهر لدينا عرض على biorevitalization؛ اقترحه على العملاء فوق 30...'",
    clinicSettingsLabelPriceList: 'قائمة الأسعار',
    clinicSettingsImportFromText: 'استيراد من نص/رابط',
    clinicSettingsPlaceholderServiceName: 'اسم الخدمة',
    clinicSettingsPlaceholderServicePrice: 'السعر',
    clinicSettingsServicesEmpty: 'لا توجد خدمات بعد.',
    clinicSettingsSectionBranding: 'الهوية',
    clinicSettingsLabelPrimaryColor: 'اللون الأساسي',
    clinicSettingsSectionEntryPoint: 'نقطة الدخول (QR)',
    clinicSettingsQrTitle: 'رمز QR الخاص بك',
    clinicSettingsQrDescription:
      'ضع هذا الرمز عند الاستقبال أو في القائمة أو على بطاقة عمل. يمكن للعملاء مسحه وإكمال التشخيص بأنفسهم.',
    clinicSettingsDownloadPng: 'تنزيل PNG',
    clinicSettingsOpenLink: 'فتح الرابط',
    clinicSettingsImportModalTitle: 'استيراد قائمة الأسعار',
    clinicSettingsImportModalPlaceholder: 'الصق نص قائمة الأسعار هنا...',
    clinicSettingsCancel: 'إلغاء',
    clinicSettingsDetectPrices: 'اكتشاف الأسعار',
    clinicSettingsUnsavedChanges: 'لديك تغييرات غير محفوظة',
    clinicSettingsSave: 'حفظ',

    // Analytics Page
    analyticsPageTitle: 'تحليلات التسويق',
    analyticsPageSubtitle: 'أداء قنوات الإعلان والحملات الخاصة بك.',
    analyticsLoading: 'جارٍ إنشاء التقرير...',
    analyticsDateToday: 'اليوم',
    analyticsDateYesterday: 'أمس',
    analyticsDateWeek: '7 أيام',
    analyticsDateAll: 'كل الوقت',
    analyticsDateCustom: 'الفترة',
    analyticsDateFromLabel: 'من',
    analyticsDateToLabel: 'إلى',
    analyticsCardTotalLeads: 'إجمالي العملاء المحتملين',
    analyticsCardConversion: 'التحويل إلى دفع',
    analyticsCardClients: 'العملاء (ROI)',
    analyticsCardRevenue: 'الإيرادات (تتبع بالذكاء الاصطناعي)',
    analyticsSourcesTitle: 'مصادر الزيارات (Source)',
    analyticsLeadShareLabel: 'حصة العملاء المحتملين',
    analyticsTableSource: 'المصدر',
    analyticsTableLeads: 'العملاء المحتملون',
    analyticsTableConversion: 'التحويل',
    analyticsTableRevenue: 'الإيرادات',
    analyticsTableNoData: 'لا توجد بيانات للفترة المحددة',
    analyticsCampaignsTitle: 'الحملات النشطة (Campaign)',
    analyticsCampaignsCampaign: 'الحملة',
    analyticsContentTitle: 'أداء الإعلانات / المؤثرين (Content)',
    analyticsContentVariant: 'البديل (Content)',
    analyticsContentCampaign: 'ضمن الحملة',

    // Integrations Page
    integrationsPageTitle: 'التكاملات',
    integrationsPageSubtitle: 'اربط CureScan بـ CRM أو المراسلة أو Zapier.',
    integrationsSaveButton: 'حفظ التغييرات',
    integrationsSuccessMessage: 'تم حفظ الإعدادات!',
    integrationsLoading: 'جارٍ تحميل الإعدادات...',
    integrationsSaveError: 'تعذر حفظ الإعدادات',
    integrationsWebhookDescription: 'أرسل بيانات العملاء المحتملين الجدد إلى أي نظام (CRM، Google Sheets، Slack) عبر طلب HTTP POST.',
    integrationsWebhookLabel: 'عنوان Webhook',
    integrationsWebhookPlaceholder: 'https://hooks.zapier.com/hooks/catch/...',
    integrationsYclientsCompanyLabel: 'معرف الشركة',
    integrationsYclientsCompanyPlaceholder: '123456',
    integrationsYclientsTokenLabel: 'رمز API (Bearer)',
    integrationsYclientsTokenPlaceholder: 'رمزك...',
    integrationsHubspotTokenLabel: 'رمز الوصول للتطبيق الخاص',
    integrationsHubspotTokenPlaceholder: 'pat-na1-...',
    integrationsHubspotTokenHint: 'أنشئ تطبيقًا خاصًا بأذونات crm.objects.contacts.write',

    checkupUploadSubtitle: 'حمّل الصور للحصول على تحليل فوري بالذكاء الاصطناعي',
    checkupSkinTitle: 'فحص حالة البشرة',
    checkupSkinSubtitle: 'تحليل سريع بالصور وخطة توصيات شخصية.',
    checkupSkinFeatureSkinType: 'نوع البشرة',
    checkupSkinFeatureSkinScore: 'Skin Score',
    checkupSkinFeatureVisualAge: 'العمر البصري',
    checkupSkinFeaturePlan: 'خطة توصيات شخصية',
    checkupAnalyzeFailed: 'فشل التحليل.',
    checkupReset: 'إعادة ضبط',
    checkupLoading: 'جارٍ التحميل...',

    unlockTitle: 'افتح نتيجتك',
    unlockSubtitle: 'أدخل رقم هاتفك — ستتواصل العيادة معك عبر واتساب.',
    unlockButton: 'فتح النتيجة',
    unlockConsent: 'بالنقر على الزر، أنت توافق على معالجة البيانات الشخصية',

    phoneLabel: 'رقم الهاتف',
    passwordLabel: 'كلمة المرور',

    portalLoginTitle: 'تسجيل الدخول إلى البوابة',
    portalLoginSubtitle: 'سنرسل رمز تحقق إلى رقم هاتفك',
    otpUnlockTitle: 'افتح نتيجتك',
    otpUnlockSubtitle: 'أدخل رقم هاتفك لعرض النتيجة.',

    passwordTitle: 'أدخل كلمة المرور',
    passwordSubtitle: 'لديك حساب بالفعل. أدخل كلمة المرور من الرسالة النصية.',

    loginButton: 'تسجيل الدخول',
    requestCodeButton: 'إرسال الرمز',
    sendingCode: 'جارٍ الإرسال...',
    codeTitle: 'أدخل رمز الرسالة',
    codeSubtitle: (phone) => `تم الإرسال إلى ${phone}`,
    resendInSeconds: (seconds) => `إعادة الإرسال خلال ${seconds} ثانية`,
    resendCodeButton: 'إعادة إرسال الرمز',
    changePhoneButton: 'تغيير رقم الهاتف',
    forgotPasswordButton: 'نسيت كلمة المرور؟ احصل على واحدة جديدة',
    forgotPasswordSent: 'تم إرسال كلمة مرور جديدة عبر الرسائل النصية',
    loggingIn: 'جارٍ تسجيل الدخول...',
    connectionError: 'خطأ في الاتصال',
    enterPasswordError: 'أدخل كلمة المرور',
    invalidPassword: 'كلمة المرور غير صحيحة',
    invalidCode: 'رمز غير صحيح',
    invalidPhone: 'أدخل رقم هاتف صحيح',

    analysisProcessing: 'جارٍ التحليل...',
    analysisStatusNeedsAttention: 'يحتاج إلى اهتمام',
    analysisStatusHasNuances: 'هناك بعض الملاحظات',
    analysisStatusExcellent: 'حالة ممتازة',
    analysisBetterThan: (percent) => `أفضل من ${percent}% من الأشخاص في عمرك`,
    analysisSkinMapTitle: 'خريطة حالة بشرتك',
    analysisSkinTypeLabel: 'نوع البشرة',
    analysisVisualAgeLabel: 'العمر الظاهري',
    analysisPhotosNotComparable:
      'الصور غير قابلة للمقارنة بسبب الإضاءة أو الزاوية. للحصول على تقييم دقيق للتقدم، أعد التصوير في ظروف مشابهة.',
    analysisDetailedMetricsTitle: 'مقاييس تفصيلية',
    analysisMetricHydration: 'الترطيب',
    analysisMetricPores: 'نظافة المسام',
    analysisMetricTexture: 'الملمس',
    analysisMetricFirmness: 'الشد والمرونة',
    analysisMetricBarrier: 'الحاجز الواقي',
    analysisMetricTone: 'توحيد اللون',
    analysisMetricDescriptionHydration: 'يقيس مستويات الترطيب العميق. ضروري لبيئة دبي الجافة.',
    analysisMetricDescriptionPores: 'يقيم صفاء المسام واحتقانها. يعكس نقاء البشرة.',
    analysisMetricDescriptionTexture: 'يقيم النعومة والأنماط التعبيرية. يشير إلى الحاجة للتقشير.',
    analysisMetricDescriptionFirmness: 'كثافة الجلد ومرونته. المؤشر الأساسي لاحتياجات الشد.',
    analysisMetricDescriptionBarrier: 'مرونة الجلد ضد الإجهاد. ضروري للبشرة الحساسة أو التفاعلية.',
    analysisMetricDescriptionTone: 'تساوي توزيع الصبغة. أساسي لإدارة أضرار أشعة الشمس.',
    analysisWithoutCare: 'بدون عناية (خلال سنة)',
    analysisWithCare: 'مع العناية (خلال 3 أشهر)',
    followupTitle: 'مرحباً بعودتك!',
    followupSubtitle: 'حمّل صوراً جديدة لتقييم تقدمك',
    analysisActiveIngredientsTitle: 'المكونات الفعالة',
    analysisHowToSearchTitle: 'كيفية اختيار المنتجات',
    analysisHowToSearchBody:
      'ابحث في المتاجر أو المنصات عن منتجات تحتوي على هذه المكونات. ركّز على أول 5–7 مكونات: كلما كان المكوّن أعلى في القائمة كانت نسبته أعلى.',
    analysisProfessionalCareTitle: 'عناية احترافية',
    analysisProfessionalCareSubtitle: 'جلسات لنتائج أسرع.',
    analysisRecommendedTreatmentsTitle: 'العلاجات المقترحة',
    analysisTopPriorityBadge: 'أولوية',
    analysisMoreDetails: 'المزيد',
    analysisLessDetails: 'إخفاء',
    analysisEffectTitle: 'ما التأثير المتوقع؟',
    analysisWhyYouTitle: 'لماذا هذا مهم لك؟',
    analysisBookTreatment: 'احجز جلسة',
    analysisBookOnWhatsApp: 'احجز عبر واتساب',
    analysisExpertSummaryTitle: 'ملخص الخبير',
    analysisSaveResultTitle: 'احفظ نتيجتك',
    analysisSaveResultSubtitle: 'تابع تقدمك وقارن قبل/بعد واحصل على توصيات مخصصة в بوابتك.',
    analysisTrackProgressButton: 'تابع التقدم',
    analysisStartNewAnalysis: 'ابدأ تحليلًا جديدًا',
    analysisLeadSaveError: 'تعذر حفظ بياناتك.',
    whatsappFallbackMessage: (leadId) =>
      `مرحبًا! أكملت فحصًا بالذكاء الاصطناعي. ${leadId ? `رقم التعريف: ${leadId}. ` : ''}أود حجز استشارة.`,

    // WhatsApp Opt-in & CTA
    whatsappOptInLabel: 'أوافق على التواصل عبر واتساب بخصوص نتائجي والحجز.',
    whatsappOptInBenefit: '→ حتى نتمكن من إرسال ملخصك والمواعيد المتاحة عبر واتساب.',
    whatsappOptInDisclaimer: '→ بدون إزعاج. إلغاء الاشتراك في أي وقت.',
    analysisSendToWhatsApp: 'إرسال نتائجي إلى واتساب',
    analysisSendToWhatsAppSubtitle: 'تابع المحادثة واحجز على الفور',
    analysisWhatsAppOpened: 'تم فتح واتساب!',
    analysisWhatsAppOpenedSubtitle: 'ستجيب العيادة قريبًا بالأوقات المتاحة.',
    analysisRequestCallback: 'طلب معاودة الاتصال',
    analysisRequestCallbackSubtitle: 'سنتصل بك خلال 15 دقيقة',
    analysisCallbackRequested: 'تم طلب معاودة الاتصال! سنتصل بك خلال 15 دقيقة.',
    analysisGetPersonalOffer: 'احصل على عرض شخصي',
    analysisGetPersonalOfferSubtitle: 'ستتواصل العيادة معك بأفضل خيار.',
    analysisWeWillContactYou: 'سوف نتواصل معك.',
    analysisBestChoiceBadge: 'أفضل خيار لك',
    analysisPersonalInsightTitle: 'رؤية شخصية',
    analysisTrustWhyTitle: 'لماذا يعمل هذا من أجلك',
    analysisTrustSafe: 'آمن لنوع بشرتك',
    analysisTrustDermatologist: 'معتمد من قبل أطباء الجلدية',
    analysisTrustTech: 'تحليل متطور بالذكاء الاصطناعي',

    uploadDragHint: 'اسحب الملفات أو انقر للتحميل',
    uploadTitle: 'حمّل الصور',
    uploadSelectButton: 'اختر الصور',
    uploadAddMore: 'أضف المزيد',
    uploadProcessing: 'جارٍ المعالجة...',
    uploadErrorNoFace: 'لم يتم اكتشاف وجه في الصورة. يرجى استخدام صورة أمامية أوضح.',
    uploadErrorFileSize: 'الملف كبير جدًا أو التنسيق غير مدعوم',
    uploadErrorGeneric: 'فشلت معالجة الصورة',
    uploadConsent: 'أوافق على معالجة البيانات الشخصية وتخزين الصور للتحليل.',
    uploadAnalyzeButton: 'تحليل',
    uploadAnalyzing: 'جارٍ التحليل...'
  }
}

export function getMessages(locale: Locale): Messages {
  return MESSAGES[locale] || MESSAGES['en-US']
}
