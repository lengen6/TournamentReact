export const parseCompetitorId = (routeId: string | undefined): number | null => {
  if (!routeId) {
    return null
  }

  const parsedId = Number(routeId)
  if (!Number.isInteger(parsedId) || parsedId < 1) {
    return null
  }

  return parsedId
}
