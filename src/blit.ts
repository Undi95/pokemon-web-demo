/**
 * blit.ts — miroir 1:1 de `D:/Projet 1/decomps/pokeemeraude/src/blit.c` (transpilé).
 *
 * Généré par scripts/transpile-c.cjs — revue humaine OBLIGATOIRE avant commit :
 * rapport des flags dans audit-reports/transpile/blit.md.
 * Politique préproc : build vanilla FR (NDEBUG/FRENCH définis, BUGFIX/UBFIX absents).
 */



/** 1:1 `void BlitBitmapRect4BitWithoutColorKey(const struct Bitmap *src, struct Bitmap *dst, u16 srcX, u16 srcY, u16 dstX, u16 dstY, u16 width, u16 height)` (blit.c:4-7). */
export function BlitBitmapRect4BitWithoutColorKey(src: any, dst: any, srcX: number, srcY: number, dstX: number, dstY: number, width: number, height: number): void {
  BlitBitmapRect4Bit(src, dst, srcX, srcY, dstX, dstY, width, height, 0xFF);
}

/** 1:1 `void BlitBitmapRect4Bit(const struct Bitmap *src, struct Bitmap *dst, u16 srcX, u16 srcY, u16 dstX, u16 dstY, u16 width, u16 height, u8 colorKey)` (blit.c:9-71). */
export function BlitBitmapRect4Bit(src: any, dst: any, srcX: number, srcY: number, dstX: number, dstY: number, width: number, height: number, colorKey: number): void {
  let xEnd = 0;
  let yEnd = 0;
  let multiplierSrcY = 0;
  let multiplierDstY = 0;
  let loopSrcY = 0;
  let loopDstY = 0;
  let loopSrcX = 0;
  let loopDstX = 0;
  let pixelsSrc: any = null;
  let pixelsDst: any = null;
  let toOrr = 0;
  let toAnd = 0;
  let toShift = 0;
  if (dst.width - dstX < width)
    xEnd = (dst.width - dstX) + srcX;
  else
    xEnd = srcX + width;
  if (dst.height - dstY < height)
    yEnd = (dst.height - dstY) + srcY;
  else
    yEnd = height + srcY;
  multiplierSrcY = (src.width + (src.width & 7)) >> 3;
  multiplierDstY = (dst.width + (dst.width & 7)) >> 3;
  if (colorKey == 0xFF)
  {
    for ((loopSrcY = srcY, loopDstY = dstY); loopSrcY < yEnd; (loopSrcY++, loopDstY++))
    {
      for ((loopSrcX = srcX, loopDstX = dstX); loopSrcX < xEnd; (loopSrcX++, loopDstX++))
      {
        pixelsSrc = src.pixels + ((loopSrcX >> 1) & 3) + ((loopSrcX >> 3) << 5) + (((loopSrcY >> 3) * multiplierSrcY) << 5) + (((loopSrcY << 0x1d) >>> 0) >> 0x1B);
        pixelsDst = dst.pixels + ((loopDstX >> 1) & 3) + ((loopDstX >> 3) << 5) + (((loopDstY >> 3) * multiplierDstY) << 5) + (((loopDstY << 0x1d) >>> 0) >> 0x1B);
        toOrr = ((pixelsSrc[0] /* *ptr */ >> ((loopSrcX & 1) << 2)) & 0xF);
        toShift = ((loopDstX & 1) << 2);
        toOrr <<= toShift;
        toAnd = 0xF0 >> (toShift);
        pixelsDst[0] /* *ptr */ = toOrr | (pixelsDst[0] /* *ptr */ & toAnd);
      }
    }
  }
  else
  {
    for ((loopSrcY = srcY, loopDstY = dstY); loopSrcY < yEnd; (loopSrcY++, loopDstY++))
    {
      for ((loopSrcX = srcX, loopDstX = dstX); loopSrcX < xEnd; (loopSrcX++, loopDstX++))
      {
        pixelsSrc = src.pixels + ((loopSrcX >> 1) & 3) + ((loopSrcX >> 3) << 5) + (((loopSrcY >> 3) * multiplierSrcY) << 5) + (((loopSrcY << 0x1d) >>> 0) >> 0x1B);
        pixelsDst = dst.pixels + ((loopDstX >> 1) & 3) + ((loopDstX >> 3) << 5) + (((loopDstY >> 3) * multiplierDstY) << 5) + (((loopDstY << 0x1d) >>> 0) >> 0x1B);
        toOrr = ((pixelsSrc[0] /* *ptr */ >> ((loopSrcX & 1) << 2)) & 0xF);
        if (toOrr != colorKey)
        {
          toShift = ((loopDstX & 1) << 2);
          toOrr <<= toShift;
          toAnd = 0xF0 >> (toShift);
          pixelsDst[0] /* *ptr */ = toOrr | (pixelsDst[0] /* *ptr */ & toAnd);
        }
      }
    }
  }
}

/** 1:1 `void FillBitmapRect4Bit(struct Bitmap *surface, u16 x, u16 y, u16 width, u16 height, u8 fillValue)` (blit.c:73-104). */
export function FillBitmapRect4Bit(surface: any, x: number, y: number, width: number, height: number, fillValue: number): void {
  let xEnd = 0;
  let yEnd = 0;
  let multiplierY = 0;
  let loopX = 0;
  let loopY = 0;
  let toOrr1 = 0;
  let toOrr2 = 0;
  xEnd = x + width;
  if (xEnd > surface.width)
    xEnd = surface.width;
  yEnd = y + height;
  if (yEnd > surface.height)
    yEnd = surface.height;
  multiplierY = (surface.width + (surface.width & 7)) >> 3;
  toOrr1 = fillValue << 4;
  toOrr2 = fillValue & 0xF;
  for (loopY = y; loopY < yEnd; loopY++)
  {
    for (loopX = x; loopX < xEnd; loopX++)
    {
      let pixels = surface.pixels + ((loopX >> 1) & 3) + ((loopX >> 3) << 5) + (((loopY >> 3) * multiplierY) << 5) + (((loopY << 0x1d) >>> 0) >> 0x1B);
      if ((loopX << 0x1F) != 0)
        pixels[0] /* *ptr */ = toOrr1 | (pixels[0] /* *ptr */ & 0xF);
      else
        pixels[0] /* *ptr */ = toOrr2 | (pixels[0] /* *ptr */ & 0xF0);
    }
  }
}

/** 1:1 `void BlitBitmapRect4BitTo8Bit(const struct Bitmap *src, struct Bitmap *dst, u16 srcX, u16 srcY, u16 dstX, u16 dstY, u16 width, u16 height, u8 colorKey, u8 paletteOffset)` (blit.c:106-182). */
export function BlitBitmapRect4BitTo8Bit(src: any, dst: any, srcX: number, srcY: number, dstX: number, dstY: number, width: number, height: number, colorKey: number, paletteOffset: number): void {
  let palOffsetBits = 0;
  let xEnd = 0;
  let yEnd = 0;
  let multiplierSrcY = 0;
  let multiplierDstY = 0;
  let loopSrcY = 0;
  let loopDstY = 0;
  let loopSrcX = 0;
  let loopDstX = 0;
  let pixelsSrc: any = null;
  let pixelsDst: any = null;
  let colorKeyBits = 0;
  palOffsetBits = ((paletteOffset << 0x1C) >>> 0) >> 0x18;
  colorKeyBits = ((colorKey << 0x1C) >>> 0) >> 0x18;
  if (dst.width - dstX < width)
    xEnd = (dst.width - dstX) + srcX;
  else
    xEnd = width + srcX;
  if (dst.height - dstY < height)
    yEnd = (srcY + dst.height) - dstY;
  else
    yEnd = srcY + height;
  multiplierSrcY = (src.width + (src.width & 7)) >> 3;
  multiplierDstY = (dst.width + (dst.width & 7)) >> 3;
  if (colorKey == 0xFF)
  {
    for ((loopSrcY = srcY, loopDstY = dstY); loopSrcY < yEnd; (loopSrcY++, loopDstY++))
    {
      pixelsSrc = src.pixels + ((srcX >> 1) & 3) + ((srcX >> 3) << 5) + (((loopSrcY >> 3) * multiplierSrcY) << 5) + (((loopSrcY << 0x1d) >>> 0) >> 0x1b);
      for ((loopSrcX = srcX, loopDstX = dstX); loopSrcX < xEnd; (loopSrcX++, loopDstX++))
      {
        pixelsDst = dst.pixels + (loopDstX & 7) + ((loopDstX >> 3) << 6) + (((loopDstY >> 3) * multiplierDstY) << 6) + (((loopDstY << 0x1d) >>> 0) >> 0x1a);
        if (loopSrcX & 1)
        {
          pixelsDst[0] /* *ptr */ = palOffsetBits + (pixelsSrc[0] /* *ptr */ >> 4);
        }
        else
        {
          pixelsSrc = src.pixels + ((loopSrcX >> 1) & 3) + ((loopSrcX >> 3) << 5) + (((loopSrcY >> 3) * multiplierSrcY) << 5) + (((loopSrcY << 0x1d) >>> 0) >> 0x1b);
          pixelsDst[0] /* *ptr */ = palOffsetBits + (pixelsSrc[0] /* *ptr */ & 0xF);
        }
      }
    }
  }
  else
  {
    for ((loopSrcY = srcY, loopDstY = dstY); loopSrcY < yEnd; (loopSrcY++, loopDstY++))
    {
      pixelsSrc = src.pixels + ((srcX >> 1) & 3) + ((srcX >> 3) << 5) + (((loopSrcY >> 3) * multiplierSrcY) << 5) + (((loopSrcY << 0x1d) >>> 0) >> 0x1b);
      for ((loopSrcX = srcX, loopDstX = dstX); loopSrcX < xEnd; (loopSrcX++, loopDstX++))
      {
        if (loopSrcX & 1)
        {
          if ((pixelsSrc[0] /* *ptr */ & 0xF0) != colorKeyBits)
          {
            pixelsDst = dst.pixels + (loopDstX & 7) + ((loopDstX >> 3) << 6) + (((loopDstY >> 3) * multiplierDstY) << 6) + (((loopDstY << 0x1d) >>> 0) >> 0x1a);
            pixelsDst[0] /* *ptr */ = palOffsetBits + (pixelsSrc[0] /* *ptr */ >> 4);
          }
        }
        else
        {
          pixelsSrc = src.pixels + ((loopSrcX >> 1) & 3) + ((loopSrcX >> 3) << 5) + (((loopSrcY >> 3) * multiplierSrcY) << 5) + (((loopSrcY << 0x1d) >>> 0) >> 0x1b);
          if ((pixelsSrc[0] /* *ptr */ & 0xF) != colorKey)
          {
            pixelsDst = dst.pixels + (loopDstX & 7) + ((loopDstX >> 3) << 6) + (((loopDstY >> 3) * multiplierDstY) << 6) + (((loopDstY << 0x1d) >>> 0) >> 0x1a);
            pixelsDst[0] /* *ptr */ = palOffsetBits + (pixelsSrc[0] /* *ptr */ & 0xF);
          }
        }
      }
    }
  }
}

/** 1:1 `void FillBitmapRect8Bit(struct Bitmap *surface, u16 x, u16 y, u16 width, u16 height, u8 fillValue)` (blit.c:184-209). */
export function FillBitmapRect8Bit(surface: any, x: number, y: number, width: number, height: number, fillValue: number): void {
  let xEnd = 0;
  let yEnd = 0;
  let multiplierY = 0;
  let loopX = 0;
  let loopY = 0;
  xEnd = x + width;
  if (xEnd > surface.width)
    xEnd = surface.width;
  yEnd = y + height;
  if (yEnd > surface.height)
    yEnd = surface.height;
  multiplierY = (surface.width + (surface.width & 7)) >> 3;
  for (loopY = y; loopY < yEnd; loopY++)
  {
    for (loopX = x; loopX < xEnd; loopX++)
    {
      let pixels = surface.pixels + (loopX & 7) + ((loopX >> 3) << 6) + (((loopY >> 3) * multiplierY) << 6) + (((loopY << 0x1d) >>> 0) >> 0x1a);
      pixels[0] /* *ptr */ = fillValue;
    }
  }
}
