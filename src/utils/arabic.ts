/**
 * Arabic string normalization and fuzzy matching for TikTok live comments.
 */

export function normalizeArabic(text: string): string {
  if (!text) return '';

  return text
    // Remove diacritics / tashkeel
    .replace(/[\u064B-\u065F\u0670]/g, '')
    // Normalize Alefs: أ, إ, آ, ٱ -> ا
    .replace(/[أإآٱ]/g, 'ا')
    // Normalize Taa Marbuta: ة -> ه
    .replace(/ة/g, 'ه')
    // Normalize Yaa: ى -> ي
    .replace(/ى/g, 'ي')
    // Normalize Hamza on Waw / Yaa: ؤ -> و, ئ -> ي
    .replace(/ؤ/g, 'و')
    .replace(/ئ/g, 'ي')
    // Remove tatweel / kashida (ـ)
    .replace(/ـ/g, '')
    // Remove common punctuation and emojis
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()؟?،؛]/g, ' ')
    // Normalize whitespace
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function isSingleTargetMatch(normComment: string, commentWords: string[], normTarget: string): boolean {
  if (!normComment || !normTarget) return false;

  // Exact match
  if (normComment === normTarget) return true;

  // Check if the normalized comment contains the target as a distinct phrase (if target has 2+ words)
  if (normTarget.includes(' ') && normComment.includes(normTarget)) {
    return true;
  }

  // Single word token match
  if (commentWords.includes(normTarget)) {
    return true;
  }

  // Also allow with or without definite article "ال"
  const targetWithoutAl = normTarget.startsWith('ال') ? normTarget.slice(2) : normTarget;
  const targetWithAl = normTarget.startsWith('ال') ? normTarget : 'ال' + normTarget;

  if (
    (targetWithoutAl && commentWords.includes(targetWithoutAl)) ||
    (targetWithAl && commentWords.includes(targetWithAl))
  ) {
    return true;
  }

  return false;
}

/**
 * Checks if commentText matches the expected answer or any of its variations
 */
export function checkAnswerMatch(commentText: string, expectedAnswer: string, alternatives: string[] = []): boolean {
  const normComment = normalizeArabic(commentText);
  if (!normComment) return false;

  const commentWords = normComment.split(' ');
  const normTarget = normalizeArabic(expectedAnswer);

  if (isSingleTargetMatch(normComment, commentWords, normTarget)) {
    return true;
  }

  for (const alt of alternatives) {
    const normAlt = normalizeArabic(alt);
    if (isSingleTargetMatch(normComment, commentWords, normAlt)) {
      return true;
    }
  }

  return false;
}
