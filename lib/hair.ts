import { getSceneById, getStyleById } from './data'
import {
  AgeTarget,
  HairEnhancementStrength,
  buildAgeTargetPrompt,
  buildHairStrengthPrompt,
} from './retouch'

const moodHairDirection: Record<
  string,
  {
    hairstyle: string
    finish: string
  }
> = {
  casual: {
    hairstyle:
      'soft natural texture with light volume, clean temple area, and an easy everyday silhouette',
    finish: 'fresh, relaxed, approachable, and youthful',
  },
  professional: {
    hairstyle:
      'neat structured hair with a refined side part or tidy lifted top, controlled edges, and premium grooming',
    finish: 'polished, confident, mature, and younger-looking without exaggeration',
  },
  romantic: {
    hairstyle:
      'cinematic layered texture with soft movement around the forehead and temples, slightly styled but still realistic',
    finish: 'moody, attractive, refined, and naturally youthful',
  },
  adventurous: {
    hairstyle:
      'clean sporty volume with healthy density, breathable texture, and a lively silhouette that works in motion',
    finish: 'energetic, healthy, fit, and youthful',
  },
  luxury: {
    hairstyle:
      'luxury editorial grooming with controlled volume, sharp outline, and expensive-looking healthy texture',
    finish: 'high-end, charismatic, composed, and younger-looking',
  },
}

const styleHairDirection: Record<
  string,
  {
    hairstyle: string
    finish: string
  }
> = {
  cold: {
    hairstyle:
      'cool clean shape with subtle top texture, lightly separated strands, and a restrained hairline design',
    finish: 'sharp, mysterious, minimal, and youthful',
  },
  relaxed: {
    hairstyle:
      'natural fluffy texture with soft forehead framing and casual volume that never looks overstyled',
    finish: 'gentle, easygoing, approachable, and younger-looking',
  },
  elite: {
    hairstyle:
      'executive grooming with a controlled side part or smart brushed-back texture, denser at the frontal hairline',
    finish: 'professional, premium, trustworthy, and refreshed',
  },
  rebel: {
    hairstyle:
      'textured modern style with sharper definition, slightly bolder volume, and clean temple transitions',
    finish: 'confident, edgy, attractive, and youthful',
  },
  sunny: {
    hairstyle:
      'light airy volume with bright healthy texture and a playful, age-reducing silhouette',
    finish: 'energetic, warm, lively, and young',
  },
  korean: {
    hairstyle:
      'soft Korean-inspired texture, gentle fringe or airy parting, smooth top density, and elegant face framing',
    finish: 'clean, soft, flattering, and youthful',
  },
}

const faceShapeDirection = [
  'If the face looks round, avoid heavy width on the sides; keep the sides cleaner and create slightly more height and vertical structure on top for a sharper silhouette.',
  'If the face looks long or narrow, avoid excessive height on top; use balanced volume, softer side fullness, and a more proportional forehead framing.',
  'If the face looks square, soften hard edges with texture, gentle separation, and a slightly more relaxed outline around the temples and forehead.',
  'If the face looks heart-shaped or has a wider forehead with a narrower jaw, use controlled forehead framing and balanced texture so the top does not feel too wide.',
  'If the face looks oval, keep the hairstyle balanced and elegant without over-correcting proportions.',
]

export function buildHairEnhancementPrompt(
  styleId?: string,
  sceneId?: string,
  strength: HairEnhancementStrength = 'natural',
  ageTarget: AgeTarget = 'slightly-younger'
) {
  const style = styleId ? getStyleById(styleId) : undefined
  const scene = sceneId ? getSceneById(sceneId) : undefined

  const moodPlan = scene ? moodHairDirection[scene.mood] : undefined
  const stylePlan = style ? styleHairDirection[style.id] : undefined

  const hairstyleNotes = [moodPlan?.hairstyle, stylePlan?.hairstyle]
    .filter(Boolean)
    .join('; ')
  const finishNotes = [moodPlan?.finish, stylePlan?.finish]
    .filter(Boolean)
    .join('; ')

  return [
    buildAgeTargetPrompt(ageTarget),
    'Before finalizing the portrait, analyze the real person in the reference image for hairline height, temple recession, thinning, crown density, face shape, and age impression.',
    'Determine the most likely face shape from the real person before deciding the hairstyle silhouette.',
    'If the hairline looks too high, the temples are too empty, or the hair looks noticeably sparse, make a subtle and realistic improvement only.',
    'Keep the same person and recognizability. Preserve facial structure, forehead proportions, and natural grooming habits.',
    'Slightly lower an overly high hairline, softly fill temple recession, and add believable density only where needed so the result feels younger and healthier.',
    'Do not create fake wig volume, unnatural bangs, helmet hair, or a dramatically different haircut. If the original hair already looks good, keep it mostly unchanged.',
    buildHairStrengthPrompt(strength),
    ...faceShapeDirection,
    hairstyleNotes
      ? `Design the final hairstyle to match the selected vibe: ${hairstyleNotes}.`
      : 'Design the final hairstyle to feel natural, flattering, modern, and age-appropriate.',
    finishNotes
      ? `The finished hair should feel ${finishNotes}.`
      : 'The finished hair should feel natural, realistic, premium, and youthful.',
  ].join(' ')
}
