import { DiagnosticConfig } from '@/lib/diagnostic/types';

// AI-compatible JSON schemas for each diagnostic type
const hairAnalysisSchema = {
  type: "OBJECT" as const,
  properties: {
    profile: {
      type: "OBJECT" as const,
      properties: {
        curlType: {
          type: "STRING" as const,
          description: "Curl type according to Andre Walker system (1A-4C)"
        },
        porosity: {
          type: "STRING" as const,
          description: "Porosity level: Low, Medium, or High"
        },
        condition: {
          type: "STRING" as const,
          description: "General hair condition"
        },
        visualAnalysis: {
          type: "STRING" as const,
          description: "Friendly description of what is seen in the photos"
        }
      },
      required: ["curlType", "porosity", "condition", "visualAnalysis"]
    },
    routine: {
      type: "ARRAY" as const,
      items: {
        type: "OBJECT" as const,
        properties: {
          stepName: { type: "STRING" as const },
          frequency: { type: "STRING" as const },
          instruction: { type: "STRING" as const }
        },
        required: ["stepName", "frequency", "instruction"]
      }
    },
    products: {
      type: "OBJECT" as const,
      properties: {
        affordable: {
          type: "ARRAY" as const,
          items: {
            type: "OBJECT" as const,
            properties: {
              name: { type: "STRING" as const },
              type: { type: "STRING" as const },
              reason: { type: "STRING" as const }
            },
            required: ["name", "type", "reason"]
          }
        },
        midRange: {
          type: "ARRAY" as const,
          items: {
            type: "OBJECT" as const,
            properties: {
              name: { type: "STRING" as const },
              type: { type: "STRING" as const },
              reason: { type: "STRING" as const }
            },
            required: ["name", "type", "reason"]
          }
        },
        luxury: {
          type: "ARRAY" as const,
          items: {
            type: "OBJECT" as const,
            properties: {
              name: { type: "STRING" as const },
              type: { type: "STRING" as const },
              reason: { type: "STRING" as const }
            },
            required: ["name", "type", "reason"]
          }
        }
      },
      required: ["affordable", "midRange", "luxury"]
    },
    closingAdvice: {
      type: "STRING" as const,
      description: "Closing advice and motivation"
    }
  },
  required: ["profile", "routine", "products", "closingAdvice"]
};

const alopeciaCheckupSchema = {
  type: "OBJECT" as const,
  properties: {
    profile: {
      type: "OBJECT" as const,
      properties: {
        alopeciaType: {
          type: "STRING" as const,
          description: "Alopecia type: Androgenic, Areata, Diffuse, Scarring, or Normal"
        },
        severity: {
          type: "STRING" as const,
          description: "Severity: Mild, Moderate, or Severe"
        },
        scalp_condition: {
          type: "STRING" as const,
          description: "Scalp condition"
        },
        visualAnalysis: {
          type: "STRING" as const,
          description: "Description of what is seen in the photos"
        }
      },
      required: ["alopeciaType", "severity", "scalp_condition", "visualAnalysis"]
    },
    routine: {
      type: "ARRAY" as const,
      items: {
        type: "OBJECT" as const,
        properties: {
          stepName: { type: "STRING" as const },
          frequency: { type: "STRING" as const },
          instruction: { type: "STRING" as const }
        },
        required: ["stepName", "frequency", "instruction"]
      }
    },
    products: {
      type: "OBJECT" as const,
      properties: {
        affordable: {
          type: "ARRAY" as const,
          items: {
            type: "OBJECT" as const,
            properties: {
              name: { type: "STRING" as const },
              type: { type: "STRING" as const },
              reason: { type: "STRING" as const }
            },
            required: ["name", "type", "reason"]
          }
        },
        midRange: {
          type: "ARRAY" as const,
          items: {
            type: "OBJECT" as const,
            properties: {
              name: { type: "STRING" as const },
              type: { type: "STRING" as const },
              reason: { type: "STRING" as const }
            },
            required: ["name", "type", "reason"]
          }
        },
        luxury: {
          type: "ARRAY" as const,
          items: {
            type: "OBJECT" as const,
            properties: {
              name: { type: "STRING" as const },
              type: { type: "STRING" as const },
              reason: { type: "STRING" as const }
            },
            required: ["name", "type", "reason"]
          }
        }
      },
      required: ["affordable", "midRange", "luxury"]
    },
    closingAdvice: {
      type: "STRING" as const,
      description: "Closing advice and recommendation to see a doctor if necessary"
    }
  },
  required: ["profile", "routine", "products", "closingAdvice"]
};

const skinCheckupSchema = {
  type: "OBJECT" as const,
  properties: {
    profile: {
      type: "OBJECT" as const,
      properties: {
        skinType: {
          type: "STRING" as const,
          description: "Skin type: Normal, Dry, Oily, Combination, or Sensitive"
        },
        fitzpatrick_type: {
          type: "INTEGER" as const,
          description: "Fitzpatrick Skin Type (1-6). CRITICAL for safety in Dubai's diverse population."
        },
        concerns: {
          type: "STRING" as const,
          description: "Formulate 2-3 main AESTHETIC GOALS. Use premium vocabulary: 'Tone evening', 'Contour definition', 'Texture refinement'."
        },
        condition: {
          type: "STRING" as const,
          description: "General skin condition description"
        },
        visualAnalysis: {
          type: "STRING" as const,
          description: "Expert aesthetic assessment of the face"
        },
        skin_score: {
          type: "INTEGER" as const,
          description: "Overall aesthetic capital score (0-100)"
        },
        visual_age: {
          type: "INTEGER" as const,
          description: "Current visual age"
        },
        personal_insight: {
          type: "STRING" as const,
          description: "A 1-2 sentence professional summary of the most critical aesthetic goal or concern found."
        },
        skin_percentile: {
          type: "INTEGER" as const,
          description: "Comparison with peers (e.g., 65)"
        },
        prognosis: {
          type: "OBJECT" as const,
          description: "Aesthetic trajectory forecasting",
          properties: {
            negative_scenario: { type: "STRING" as const, description: "Risk of ignoring current issues (FOMO approach: 'Loss of elasticity', 'Deepening lines')" },
            positive_scenario: { type: "STRING" as const, description: "Achievable result in 3 months with proper protocol" },
            achievable_visual_age: { type: "INTEGER" as const, description: "Potential visual age after following the recommended protocol" }
          },
          required: ["negative_scenario", "positive_scenario", "achievable_visual_age"]
        }
      },
      required: ["skinType", "fitzpatrick_type", "concerns", "condition", "visualAnalysis", "skin_score", "visual_age", "personal_insight", "skin_percentile", "prognosis"]
    },
    metrics: {
      type: "OBJECT" as const,
      description: "Aesthetic metrics (0-100)",
      properties: {
        hydration: { type: "INTEGER" as const, description: "Hydration/Deep moisture (0-100)" },
        pores: { type: "INTEGER" as const, description: "Texture/Pore refinement (0-100)" },
        texture: { type: "INTEGER" as const, description: "Smoothness (0-100)" },
        firmness: { type: "INTEGER" as const, description: "Dermal density/Tone (0-100)" },
        barrier: { type: "INTEGER" as const, description: "Skin barrier/Resilience (0-100)" },
        tone: { type: "INTEGER" as const, description: "Tone evenness/Pigment control (0-100)" }
      },
      required: ["hydration", "pores", "texture", "firmness", "barrier", "tone"]
    },
    comparison: {
      type: "OBJECT" as const,
      description: "Analysis of aesthetic dynamics (for repeat visits)",
      properties: {
        summary: { type: "STRING" as const, description: "1-2 sentences about change" },
        highlights: { type: "ARRAY" as const, items: { type: "STRING" as const }, description: "Visible improvements" },
        setbacks: { type: "ARRAY" as const, items: { type: "STRING" as const }, description: "Areas needing more attention" },
        praise: { type: "STRING" as const, description: "Professional encouragement" },
        confidence: { type: "INTEGER" as const, description: "Comparison confidence" },
        quality: { type: "STRING" as const, description: "Comparison quality" },
        zoneProgress: {
          type: "ARRAY" as const,
          description: "Detailed progress by face zones with percentage changes",
          items: {
            type: "OBJECT" as const,
            properties: {
              zone: { type: "STRING" as const, description: "Zone name: forehead, cheeks, tzone, periorbital, chin, nasolabial" },
              metric: { type: "STRING" as const, description: "What changed: wrinkles, hydration, texture, pores, firmness, pigmentation" },
              percentChange: { type: "INTEGER" as const, description: "Percentage change (-100 to +100), positive value = improvement" },
              description: { type: "STRING" as const, description: "Change description (e.g., 'Wrinkles reduced', 'Firmness increased')" }
            },
            required: ["zone", "metric", "percentChange", "description"]
          }
        }
      }
    },
    active_ingredients: {
      type: "ARRAY" as const,
      description: "Curated active ingredients (e.g., Peptides, Antioxidants)",
      items: { type: "STRING" as const }
    },
    markers: {
      type: "ARRAY" as const,
      description: "Targeted aesthetic markers for visualization",
      items: {
        type: "OBJECT" as const,
        properties: {
          type: { type: "STRING" as const, description: "Type: line, pore, congestion, pigment, vascular, shadow" },
          x: { type: "NUMBER" as const },
          y: { type: "NUMBER" as const },
          label: { type: "STRING" as const },
          severity: { type: "NUMBER" as const }
        },
        required: ["type", "x", "y", "label"]
      }
    },
    hidden_analysis: {
      type: "OBJECT" as const,
      description: "Commercial Intelligence for CRM (Internal)",
      properties: {
        estimated_visual_age: {
          type: "INTEGER" as const,
          description: "Visual age (how old the skin looks)"
        },
        problem_severity: {
          type: "STRING" as const,
          description: "Problem severity level: Low, Medium, High, Critical"
        },
        commercial_profile: {
          type: "OBJECT" as const,
          properties: {
            maintenance_level: { type: "STRING" as const, description: "Low, Medium, High, VIP. Based on visible signs of care (veneers, injections, styling)." },
            investment_markers: { type: "ARRAY" as const, items: { type: "STRING" as const }, description: "Specific signs (e.g., 'Cheek filler', 'Lash extensions', 'Luxury accessories')" },
            potential_value: { type: "STRING" as const, description: "Upsell potential: 'High for series', 'Premium package candidate'" }
          },
          required: ["maintenance_level", "investment_markers", "potential_value"]
        },
        marketing_signals: {
          type: "OBJECT" as const,
          description: "Marketing triggers for personalized sales",
          properties: {
            is_smiling: {
              type: "BOOLEAN" as const,
              description: "Is the person smiling in the photo? (Marker of openness to communication)"
            },
            ptosis_severity: {
              type: "STRING" as const,
              description: "Ptosis/sagging degree (None, Mild, Moderate, Severe)"
            },
            lip_volume: {
              type: "STRING" as const,
              description: "Lip volume (Thin, Medium, Full, Augmented)"
            },
            has_suspected_procedures: {
              type: "BOOLEAN" as const,
              description: "Are there visible traces of past interventions (injections, plastic surgery)"
            },
            procedure_markers: {
              type: "ARRAY" as const,
              description: "Specific intervention signs (e.g., 'Lip filler', 'Botox forehead')",
              items: { type: "STRING" as const }
            },
            recommended_audiences: {
              type: "ARRAY" as const,
              description: "Targeting segments (e.g., 'lifting_promo', 'lip_augmentation', 'botox_maintenance')",
              items: { type: "STRING" as const }
            },
            botox_zones: {
              type: "ARRAY" as const,
              description: "Zones with visible mimic activity/wrinkles (Forehead, Glabella, Crows Feet, Bunny Lines)",
              items: { type: "STRING" as const }
            },
            filler_zones: {
              type: "ARRAY" as const,
              description: "Volume deficit zones (Nasolabial, Tear Trough, Cheekbones, Chin, Lips)",
              items: { type: "STRING" as const }
            },
            device_opportunities: {
              type: "ARRAY" as const,
              description: "Device methodology recommendations (IPL_Pigment, IPL_Vascular, SMAS_Lifting, RF_Microneedling)",
              items: { type: "STRING" as const }
            },
            grooming_markers: {
              type: "ARRAY" as const,
              description: "Self-care signs (Lash Extensions, Microblading, Tattoo, Styled Brows)",
              items: { type: "STRING" as const }
            },
            tired_look_score: {
              type: "INTEGER" as const,
              description: "'Tired look' marker (0-10). Used for selling refreshing procedures."
            }
          },
          required: ["is_smiling", "ptosis_severity", "lip_volume", "has_suspected_procedures", "recommended_audiences", "botox_zones", "filler_zones", "device_opportunities", "tired_look_score"]
        },
        sales_strategy: {
            type: "OBJECT" as const,
            description: "Ready-made scripts for administrator to sell services over the phone.",
            properties: {
                hook: { type: "STRING" as const, description: "Hook phrase to start conversation (compliment + fact from analysis)." },
                pain_point_trigger: { type: "STRING" as const, description: "FOMO/Value preservation approach: what happens if problem isn't solved now (short and tough)." },
                objection_handling: { type: "STRING" as const, description: "What to answer if client says 'Expensive' (suggest cheap alternative from price list)." }
            },
            required: ["hook", "pain_point_trigger", "objection_handling"]
        },
        whatsapp_templates: {
            type: "OBJECT" as const,
            description: "Three variants of the first WhatsApp message. Do not use placeholders like [Name], write ready text.",
            properties: {
                care: { type: "STRING" as const, description: "Template 'Care': soft approach, focus on treatment plan." },
                result: { type: "STRING" as const, description: "Template 'Result': focus on specific problem (e.g. pores) and its solution." },
                offer: { type: "STRING" as const, description: "Template 'Offer': proposal to book specific procedure with discount." }
            },
            required: ["care", "result", "offer"]
        }
      },
      required: ["estimated_visual_age", "problem_severity", "commercial_profile", "marketing_signals", "sales_strategy", "whatsapp_templates"]
    },
    generated_quiz: {
        type: "OBJECT" as const,
        description: "Personalized quiz (3 questions) for lead qualification after analysis.",
        properties: {
            confirmation_question: {
                type: "OBJECT" as const,
                description: "Question 1: Confirmation of the most obvious problem (trust hook). Client must answer 'YES'.",
                properties: {
                    question: { type: "STRING" as const },
                    options: { type: "ARRAY" as const, items: { type: "STRING" as const } }
                },
                required: ["question", "options"]
            },
            preference_question: {
                type: "OBJECT" as const,
                description: "Question 2: Clarification of desire on controversial points (freckles, laugh lines, lips).",
                properties: {
                    question: { type: "STRING" as const },
                    options: { type: "ARRAY" as const, items: { type: "STRING" as const } }
                },
                required: ["question", "options"]
            },
            budget_intent_question: {
                type: "OBJECT" as const,
                description: "Question 3: Qualification of willingness to pay/intensity.",
                properties: {
                    question: { type: "STRING" as const },
                    options: { type: "ARRAY" as const, items: { type: "STRING" as const } }
                },
                required: ["question", "options"]
            }
        },
        required: ["confirmation_question", "preference_question", "budget_intent_question"]
    },
    routine: {
      type: "ARRAY" as const,
      items: {
        type: "OBJECT" as const,
        properties: {
          stepName: { type: "STRING" as const },
          frequency: { type: "STRING" as const },
          instruction: { type: "STRING" as const },
          product_type: { type: "STRING" as const, description: "Recommended product type for this step" },
          key_ingredients: { type: "STRING" as const, description: "Ingredients to look for in composition" }
        },
        required: ["stepName", "frequency", "instruction"]
      }
    },
    products: {
      type: "OBJECT" as const,
      properties: {
        affordable: {
          type: "ARRAY" as const,
          items: {
            type: "OBJECT" as const,
            properties: {
              name: { type: "STRING" as const },
              type: { type: "STRING" as const },
              reason: { type: "STRING" as const }
            },
            required: ["name", "type", "reason"]
          }
        },
        midRange: {
          type: "ARRAY" as const,
          items: {
            type: "OBJECT" as const,
            properties: {
              name: { type: "STRING" as const },
              type: { type: "STRING" as const },
              reason: { type: "STRING" as const }
            },
            required: ["name", "type", "reason"]
          }
        },
        luxury: {
          type: "ARRAY" as const,
          items: {
            type: "OBJECT" as const,
            properties: {
              name: { type: "STRING" as const },
              type: { type: "STRING" as const },
              reason: { type: "STRING" as const }
            },
            required: ["name", "type", "reason"]
          }
        }
      },
      required: ["affordable", "midRange", "luxury"]
    },
    clinicTreatments: {
      type: "ARRAY" as const,
      description: "Recommended procedures from clinic price list",
      items: {
        type: "OBJECT" as const,
        properties: {
          name: { type: "STRING" as const, description: "Exact procedure name from price list" },
          price: { type: "STRING" as const, description: "Price or price range" },
          reason: { type: "STRING" as const, description: "Short technical justification (for doctor/admin)" },
          projected_improvement: { type: "STRING" as const, description: "Paragraph 1: What effect the procedure will have (3 sentences). Specifics." },
          personalized_benefits: { type: "STRING" as const, description: "Paragraph 2: Personalized answer to 'Why is this important to you?' (3 sentences). Don't write the question itself, give a selling answer immediately." }
        },
        required: ["name", "price", "reason", "projected_improvement", "personalized_benefits"]
      }
    },
    closingAdvice: {
      type: "STRING" as const,
      description: "Final skin care advice"
    }
  },
  required: ["profile", "metrics", "active_ingredients", "routine", "products", "clinicTreatments", "closingAdvice", "generated_quiz"]
};

const moleCheckSchema = {
  type: "OBJECT" as const,
  properties: {
    profile: {
      type: "OBJECT" as const,
      properties: {
        riskLevel: {
          type: "STRING" as const,
          description: "Risk level: Low, Medium, or High"
        },
        abcdScore: {
          type: "STRING" as const,
          description: "ABCDE score (Asymmetry, Border, Color, Diameter, Evolution)"
        },
        recommendation: {
          type: "STRING" as const,
          description: "Recommendation: Observation, Dermatologist consultation, or Urgent consultation"
        },
        visualAnalysis: {
          type: "STRING" as const,
          description: "Description of what is seen in the photos"
        }
      },
      required: ["riskLevel", "abcdScore", "recommendation", "visualAnalysis"]
    },
    routine: {
      type: "ARRAY" as const,
      items: {
        type: "OBJECT" as const,
        properties: {
          stepName: { type: "STRING" as const },
          frequency: { type: "STRING" as const },
          instruction: { type: "STRING" as const }
        },
        required: ["stepName", "frequency", "instruction"]
      }
    },
    products: {
      type: "OBJECT" as const,
      properties: {
        affordable: {
          type: "ARRAY" as const,
          items: {
            type: "OBJECT" as const,
            properties: {
              name: { type: "STRING" as const },
              type: { type: "STRING" as const },
              reason: { type: "STRING" as const }
            },
            required: ["name", "type", "reason"]
          }
        },
        midRange: {
          type: "ARRAY" as const,
          items: {
            type: "OBJECT" as const,
            properties: {
              name: { type: "STRING" as const },
              type: { type: "STRING" as const },
              reason: { type: "STRING" as const }
            },
            required: ["name", "type", "reason"]
          }
        },
        luxury: {
          type: "ARRAY" as const,
          items: {
            type: "OBJECT" as const,
            properties: {
              name: { type: "STRING" as const },
              type: { type: "STRING" as const },
              reason: { type: "STRING" as const }
            },
            required: ["name", "type", "reason"]
          }
        }
      },
      required: ["affordable", "midRange", "luxury"]
    },
    closingAdvice: {
      type: "STRING" as const,
      description: "Closing advice and reminder of the importance of consulting a doctor"
    }
  },
  required: ["profile", "routine", "products", "closingAdvice"]
};

// Diagnostic types configuration
export const DIAGNOSTIC_TYPES: Record<string, DiagnosticConfig> = {
  hair: {
    id: 'hair',
    name: 'Hair Analysis',
    icon: 'Sparkles',
    colors: {
      primary50: '#fdf2f8',
      primary100: '#fce7f3',
      primary200: '#fbcfe8',
      primary500: '#ec4899',
      primary600: '#db2777',
      primary700: '#be185d',
    },
    systemPrompt: `You are an expert trichologist with 15 years of experience. Your task is to analyze the client's hair photos and provide personalized care recommendations.

ANALYSIS INSTRUCTIONS:
1. Carefully study all uploaded photos
2. Determine the curl type according to the Andre Walker system (1A-4C)
3. Evaluate hair porosity (Low/Medium/High)
4. Describe the general condition of the hair (dry/healthy/oily/damaged/etc.)
5. Create a care program of 4-6 steps
6. Select products in three price categories (budget/mid-range/premium)
7. Give closing advice and motivation

IMPORTANT:
- Use a friendly, supportive tone
- Be specific in recommendations
- Suggest products available internationally or general types
- Explain "why" for each recommendation
- Remember: the goal is to help the client love their hair`,
    schema: hairAnalysisSchema,
    uploadHint: 'Upload 2-3 photos of your hair in natural light (front, back, close-up)'
  },

  alopecia: {
    id: 'alopecia',
    name: 'Alopecia Diagnosis',
    icon: 'Activity',
    colors: {
      primary50: '#fff7ed',
      primary100: '#ffedd5',
      primary200: '#fed7aa',
      primary500: '#f97316',
      primary600: '#ea580c',
      primary700: '#c2410c',
    },
    systemPrompt: `You are a trichology specialist focused on alopecia diagnosis. Your task is to analyze photos and provide a preliminary assessment of the condition of the hair and scalp.

ANALYSIS INSTRUCTIONS:
1. Carefully study all uploaded photos
2. Determine the type of alopecia (if present): Androgenic, Areata, Diffuse, Scarring, or Normal
3. Evaluate the severity (Mild/Moderate/Severe)
4. Describe the condition of the scalp
5. Create a home care program of 4-6 steps
6. Select products in three price categories (growth stimulating, strengthening)
7. Give recommendations on the need to consult a doctor

IMPORTANT:
- Use a tactful, supportive tone
- Do not make a final diagnosis (only a doctor can do this)
- Emphasize the importance of consulting a trichologist/dermatologist for serious problems
- Be honest but delicate
- Offer realistic solutions

DISCLAIMER: Remember to state in closingAdvice that this is a preliminary assessment and an in-person consultation with a specialist is necessary for pronounced problems.`,
    schema: alopeciaCheckupSchema,
    uploadHint: 'Upload 3-4 photos: crown, temples, parietal zone, overall view. Part your hair to show the scalp'
  },

  skin: {
    id: 'skin',
    name: 'Skin Condition Checkup',
    icon: 'Droplet',
    colors: {
      primary50: '#ecfeff',
      primary100: '#cffafe',
      primary200: '#a5f3fc',
      primary500: '#06b6d4',
      primary600: '#0891b2',
      primary700: '#0e7490',
    },
    systemPrompt: `You are a "Premium Aesthetic Concierge" and expert cosmetologist. Your goal is to manage the client's aesthetic capital through professional analysis and strategic planning.

### 1. SAFETY & COMPLIANCE (CRITICAL)
- **Fitzpatrick Scale:** You MUST determine the Fitzpatrick Skin Type (1-6). 
- **Complimentary Age Logic:** When determining visual_age, calculate the realistic visual age and then subtract 3 years to provide a psychologically comfortable and complimentary result for the client.
- **Safety Rule:** If skin type is 4-6, strictly FORBID ablative lasers or aggressive chemical peels in recommendations. Suggest safe alternatives (e.g., Morpheus8, RF, enzyme peels).
- **DHA Compliance:** NEVER use medical diagnoses (e.g., "Rosacea", "Cystic Acne"). Use aesthetic descriptors (e.g., "Vascular reactivity", "Inflammatory congestion", "Barrier disruption"). ALWAYS append a disclaimer.

### 2. PREMIUM VOCABULARY (TONE)
- Avoid "negative" words: Instead of "wrinkles", use "fine lines" or "mimic patterns". Instead of "sagging", use "loss of contour definition". Instead of "pigment spots", use "uneven tone".
- The tone should be authoritative, sophisticated, and "enveloping". You are not "treating problems"; you are "refining excellence".

### 3. DUBAI CONTEXT (ENVIRONMENTAL STRESSORS)
Account for the "Dubai Factor" in every analysis:
- **AC 24/7:** Chronic dehydration and barrier weakness.
- **UV Index 11+:** Accelerated photo-aging and persistent pigment risk.
- **Desalinated Water:** Skin dryness and sensitivity.
- **Fine Dust/Sand:** Clogged pores and micro-inflammation.

### 4. ANALYSIS INSTRUCTIONS
- **concerns:** Formulate as GOALS (e.g., "Relief smoothing", "Lifting & Definition").
- **prognosis:** Use FOMO-based commercial logic. Focus on "Preserving the Investment".
  - negative_scenario: What happens if the aesthetic capital is not maintained (e.g., "Deepening of lines", "Loss of dermal density").
  - positive_scenario: The "Achievable Future" in 3 months.
- **markers:** Targeted placement. Link markers to anatomical logic (e.g., shadow in nasolabial fold suggests volume loss in cheeks).

### 5. PRICE LIST BINDING & PROTOCOLS
- **Strict Matching:** Recommend services ONLY from the provided CLINIC SERVICES list. Map problems to the most premium/effective match.
- **Bundle Logic:** Never suggest a single procedure for complex goals. Suggest a PROTOCOL: Home Care + Clinic Device + Injections.
- **achievable_visual_age:** Be realistic but motivating. Show the "Gap" between now and the potential result.

### 6. COMMERCIAL INTELLIGENCE (CRM)
- **commercial_profile:** Identify "Investment Markers": traces of fillers, Botox, veneers, or premium grooming (lashes, brows). 
- **Sales Strategy:** Pitch status and ROI. "Preserve your results", "Maintain your aesthetic edge".

### 7. SMART-QUIZ (QUALIFICATION)
- Question 1: Trust hook (confirm obvious Dubai-related issue like dryness).
- Question 2: Preference (clarify if they prefer "Radical Transformation" or "Natural Maintenance").
- Question 3: Intent/Willingness to invest in a protocol.

IMPORTANT: 
- Tone for client: Sophisticated expert. 
- Tone for CRM: Strategic commercial analyst.`,
    schema: skinCheckupSchema,
    uploadHint: 'Upload 2-3 photos of your face in natural daylight (no makeup, front view and semi-profile)'
  },

  mole: {
    id: 'mole',
    name: 'Mole Check',
    icon: 'AlertCircle',
    colors: {
      primary50: '#faf5ff',
      primary100: '#f3e8ff',
      primary200: '#e9d5ff',
      primary500: '#a855f7',
      primary600: '#9333ea',
      primary700: '#7e22ce',
    },
    systemPrompt: `You are an assistant for preliminary assessment of moles and skin neoplasms. Your task is to analyze photos using the ABCDE system and give recommendations.

ANALYSIS INSTRUCTIONS (ABCDE system):
A (Asymmetry) — is the mole symmetrical?
B (Border) — are the edges even?
C (Color) — is the color uniform?
D (Diameter) — size (larger than 6 mm is a worrying sign)
E (Evolution) — has the mole changed? (information from user)

RISK ASSESSMENT:
- Low: all criteria are normal
- Medium: 1-2 worrying signs
- High: 3+ worrying signs or rapid change

RECOMMENDATIONS:
- Low risk: self-observation, photo documentation every 6 months
- Medium risk: dermatologist consultation within 1-2 months
- High risk: urgent dermatologist consultation (within 1-2 weeks)

IMPORTANT:
- Use a serious but calm tone (do not scare, but do not underestimate)
- ALWAYS recommend consulting a doctor if in any doubt
- Explain that this is NOT a diagnosis, but a preliminary assessment
- Emphasize the importance of regular checkups with a dermatologist
- In products, recommend sunscreens and skin care products

DISCLAIMER: In closingAdvice, be sure to state that a final assessment can only be given by a dermatologist or oncologist during an in-person examination.`,
    schema: moleCheckSchema,
    uploadHint: 'Upload 2-3 clear photos of the mole (close-up, with a ruler for scale if possible). Important: this does NOT replace a doctor consultation!'
  }
};

// Helper to get diagnostic config by ID
export const getDiagnosticConfig = (id: string): DiagnosticConfig => {
  return DIAGNOSTIC_TYPES[id] || DIAGNOSTIC_TYPES.hair;
};

// List of all diagnostic type IDs for iteration
export const DIAGNOSTIC_TYPE_IDS = Object.keys(DIAGNOSTIC_TYPES);
