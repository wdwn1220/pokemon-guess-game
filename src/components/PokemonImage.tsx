import { useState } from 'react';
import { Sprites } from '@pkmn/img';

interface PokemonImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  species: string;
  isBack?: boolean;
}

export default function PokemonImage({ species, isBack = false, alt, style, ...props }: PokemonImageProps) {
  const [fallbackIndex, setFallbackIndex] = useState(0);

  // Get animated sprite URL from @pkmn/img (ani/ directory for animated GIFs)
  const aniInfo = Sprites.getPokemon(species, { side: isBack ? 'p1' : 'p2' });
  // Get static gen5 as fallback
  const staticInfo = Sprites.getPokemon(species, { gen: 'gen5', side: isBack ? 'p1' : 'p2' });

  // Derive dex ID from the static url path filename
  const dexId = staticInfo.url.split('/').pop()?.replace('.png', '').replace('.gif', '') || '';

  const urls = [
    aniInfo.url,                                                                      // 1. Animated GIF (ani/ or ani-back/)
    staticInfo.url,                                                                   // 2. Gen5 static PNG
    `https://play.pokemonshowdown.com/sprites/dex/${dexId}.png`,                     // 3. Dex static
    `https://play.pokemonshowdown.com/sprites/gen5/substitute.png`,                  // 4. Substitute placeholder
  ];

  const src = urls[Math.min(fallbackIndex, urls.length - 1)];

  return (
    <img
      {...props}
      src={src}
      alt={alt || species}
      style={style}
      onError={() => {
        setFallbackIndex(i => Math.min(i + 1, urls.length - 1));
      }}
    />
  );
}
