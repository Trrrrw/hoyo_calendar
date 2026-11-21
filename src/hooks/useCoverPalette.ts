import { useEffect, useState } from 'react'

export interface CoverPalette {
  backgroundColor: string
  textColor: string
}

const paletteCache = new Map<string, Promise<CoverPalette | null>>()

export function useCoverPalette(
  coverUrl: string | undefined,
  fallbackColor: string,
): CoverPalette {
  const [resolved, setResolved] = useState<{
    coverUrl: string
    palette: CoverPalette
  } | null>(null)

  useEffect(() => {
    if (!coverUrl) return
    let active = true

    extractPalette(coverUrl).then((result) => {
      if (active && result) {
        setResolved({ coverUrl, palette: result })
      }
    })

    return () => {
      active = false
    }
  }, [coverUrl])

  if (coverUrl && resolved?.coverUrl === coverUrl) {
    return resolved.palette
  }
  return getFallbackPalette(fallbackColor)
}

function extractPalette(coverUrl: string): Promise<CoverPalette | null> {
  const cached = paletteCache.get(coverUrl)
  if (cached) return cached

  const pending = import('../services/coverPalette')
    .then(({ Vibrant }) => Vibrant.from(coverUrl).getPalette())
    .then((palette) => {
      const swatch =
        palette.Vibrant ??
        palette.DarkVibrant ??
        palette.Muted ??
        palette.DarkMuted

      if (!swatch) return null

      return {
        backgroundColor: swatch.hex,
        textColor: swatch.bodyTextColor,
      }
    })
    .catch(() => null)

  paletteCache.set(coverUrl, pending)
  return pending
}

function getFallbackPalette(backgroundColor: string): CoverPalette {
  return { backgroundColor, textColor: '#ffffff' }
}
