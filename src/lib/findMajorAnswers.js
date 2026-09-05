const STORAGE_KEY = 'findMajorAnswers'

export const getFindMajorAnswers = () => {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY)) || {}
  } catch {
    return {}
  }
}

export const saveFindMajorAnswers = (partial) => {
  const next = { ...getFindMajorAnswers(), ...partial }
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(next))
  return next
}

export const clearFindMajorAnswers = () => {
  sessionStorage.removeItem(STORAGE_KEY)
}
