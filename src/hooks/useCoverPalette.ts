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
  const fallbackPalette = getFallbackPalette(fallbackColor)
  const [palette, setPalette] = useState<CoverPalette>(fallbackPalette)

  useEffect(() => {
    let active = true

    if (!coverUrl) {
      setPalette(getFallbackPalette(fallbackColor))
      return () => {
        active = false
      }
    }

    setPalette(getFallbackPalette(fallbackColor))
    extractPalette(coverUrl).then((result) => {
      if (active && result) setPalette(result)
    })

    return () => {
      active = false
    }
  }, [coverUrl, fallbackColor])

  return palette
}

function extractPalette(coverUrl: string): Promise<CoverPalette | null> {
  const cached = paletteCache.get(coverUrl)
  if (cached) return cached

  const pending = import('node-vibrant/browser')
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
