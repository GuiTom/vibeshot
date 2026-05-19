export type HairEnhancementStrength = 'natural' | 'noticeable'
export type AgeTarget = 'realistic' | 'slightly-younger' | 'younger'

export function buildAgeTargetPrompt(ageTarget: AgeTarget = 'slightly-younger') {
  if (ageTarget === 'younger') {
    return [
      'Aim for a clearly younger-looking result while keeping the same real person recognizable and believable.',
      'Reduce visible fatigue and aging cues more proactively, but do not make the subject look artificial, baby-faced, or like a different age group.',
    ].join(' ')
  }

  if (ageTarget === 'realistic') {
    return [
      'Prioritize realism over rejuvenation.',
      'Keep the current age impression largely intact and only remove distracting fatigue or unflattering temporary aging cues.',
    ].join(' ')
  }

  return [
    'Make the subject look slightly younger, fresher, and more rested while preserving realism.',
    'Reduce aging cues gently so the person looks upgraded rather than transformed.',
  ].join(' ')
}

export function buildFaceRetouchPrompt(
  ageTarget: AgeTarget = 'slightly-younger'
) {
  return [
    buildAgeTargetPrompt(ageTarget),
    'Perform subtle portrait grooming only if needed after analyzing the real person in the reference image.',
    'If there are visible under-eye bags, dark circles, nasolabial folds, uneven skin tone, or dull complexion, improve them gently while preserving realism, skin texture, pores, and age credibility.',
    'Make the person look more rested, healthier, and slightly younger, but never plastic, airbrushed, or fake.',
    'Do not erase all texture, do not over-whiten skin, do not reshape facial structure, and do not create beauty-filter artifacts.',
    'Keep masculine natural skin detail, preserve expression lines that define identity, and only soften fatigue-related shadows or harsh aging cues.',
  ].join(' ')
}

export function buildHairStrengthPrompt(
  strength: HairEnhancementStrength = 'natural'
) {
  if (strength === 'noticeable') {
    return [
      'Apply a clearly visible but still realistic hair improvement.',
      'Make the frontal hairline, temple density, and overall top fullness noticeably better while remaining believable for the same real person.',
      'The result should look younger, healthier, and better groomed, but still plausible in real life.',
    ].join(' ')
  }

  return [
    'Apply only a subtle hair improvement.',
    'Keep changes conservative and realistic so the person mainly looks like a better-rested, better-groomed version of himself.',
  ].join(' ')
}
