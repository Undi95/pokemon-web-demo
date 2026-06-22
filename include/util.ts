/**
 * include/util.ts — miroir 1:1 de `decomp/include/util.h`.
 * (Couplées-HW à ajouter quand portées : CreateInvisibleSpriteWithCallback,
 *  DoBgAffineSet, CopySpriteTiles, BlendPalette.)
 */
export {
  gBitTable,
  StoreWordInTwoHalfwords, LoadWordFromTwoHalfwords,
  CountTrailingZeroBits, CalcCRC16, CalcCRC16WithTable, CalcByteArraySum,
} from '../src/util';
