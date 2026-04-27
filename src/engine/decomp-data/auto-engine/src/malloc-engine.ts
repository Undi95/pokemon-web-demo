// AUTO-GENERATED from src/malloc.c by extract-engine-helpers.mjs
// Do not edit — re-run `node scripts/extract-engine-helpers.mjs` to refresh.
//
// Generated: 2026-04-27
// Functions: 12

export const ENGINE_FUNCTIONS = {
  "Alloc": {
    returnType: "void *",
    params: "u32 size",
    callsTo: ["AllocInternal"],
    lineCount: 1,
    bodyC: "return AllocInternal(sHeapStart, size);",
  },
  "AllocInternal": {
    returnType: "void *",
    params: "void *heapStart, u32 size",
    callsTo: ["PutMemBlockHeader"],
    lineCount: 36,
    bodyC: "struct MemBlock *pos = (struct MemBlock *)heapStart;\n    struct MemBlock *head = pos;\n    struct MemBlock *splitBlock;\n    u32 foundBlockSize;\n\n     \n    if (size & 3)\n        size = 4 * ((size / 4) + 1);\n\n    for (;;)\n    {\n         \n\n        if (!pos->flag)\n        {\n            foundBlockSize = pos->size;\n\n            if (foundBlockSize >= size)\n            {\n                if (foundBlockSize - size < 2 * sizeof(struct MemBlock))\n                {\n                     \n                     \n                    pos->flag = TRUE;\n                }\n                else\n                {\n                     \n                     \n                    foundBlockSize -= sizeof(struct MemBlock);\n                    foundBlockSize -= size;\n\n                    splitBlock = (struct MemBlock *)(pos->data + size);\n\n                    pos->flag = TRUE;\n                    pos->size = size;\n\n                    PutMemBlockHeader(splitBlock, pos, pos->next, foundBlockSize);\n\n                    pos->next = splitBlock;\n\n                    if (splitBlock->next != head)\n                        splitBlock->next->prev = splitBlock;\n                }\n\n                return pos->data;\n            }\n        }\n\n        if (pos->next == head)\n            return NULL;\n\n        pos = pos->next;\n    }",
  },
  "AllocZeroed": {
    returnType: "void *",
    params: "u32 size",
    callsTo: ["AllocZeroedInternal"],
    lineCount: 1,
    bodyC: "return AllocZeroedInternal(sHeapStart, size);",
  },
  "AllocZeroedInternal": {
    returnType: "void *",
    params: "void *heapStart, u32 size",
    callsTo: ["AllocInternal","CpuFill32"],
    lineCount: 8,
    bodyC: "void *mem = AllocInternal(heapStart, size);\n\n    if (mem != NULL)\n    {\n        if (size & 3)\n            size = 4 * ((size / 4) + 1);\n\n        CpuFill32(0, mem, size);\n    }\n\n    return mem;",
  },
  "CheckHeap": {
    returnType: "bool32",
    params: "",
    callsTo: ["CheckMemBlockInternal"],
    lineCount: 7,
    bodyC: "struct MemBlock *pos = (struct MemBlock *)sHeapStart;\n\n    do {\n        if (!CheckMemBlockInternal(sHeapStart, pos->data))\n            return FALSE;\n        pos = pos->next;\n    } while (pos != (struct MemBlock *)sHeapStart);\n\n    return TRUE;",
  },
  "CheckMemBlock": {
    returnType: "bool32",
    params: "void *pointer",
    callsTo: ["CheckMemBlockInternal"],
    lineCount: 1,
    bodyC: "return CheckMemBlockInternal(sHeapStart, pointer);",
  },
  "CheckMemBlockInternal": {
    returnType: "bool32",
    params: "void *heapStart, void *pointer",
    lineCount: 15,
    bodyC: "struct MemBlock *head = (struct MemBlock *)heapStart;\n    struct MemBlock *block = (struct MemBlock *)((u8 *)pointer - sizeof(struct MemBlock));\n\n    if (block->magic != MALLOC_SYSTEM_ID)\n        return FALSE;\n\n    if (block->next->magic != MALLOC_SYSTEM_ID)\n        return FALSE;\n\n    if (block->next != head && block->next->prev != block)\n        return FALSE;\n\n    if (block->prev->magic != MALLOC_SYSTEM_ID)\n        return FALSE;\n\n    if (block->prev != head && block->prev->next != block)\n        return FALSE;\n\n    if (block->next != head && block->next != (struct MemBlock *)(block->data + block->size))\n        return FALSE;\n\n    return TRUE;",
  },
  "Free": {
    returnType: "void",
    params: "void *pointer",
    callsTo: ["FreeInternal"],
    lineCount: 1,
    bodyC: "FreeInternal(sHeapStart, pointer);",
  },
  "FreeInternal": {
    returnType: "void",
    params: "void *heapStart, void *pointer",
    lineCount: 28,
    bodyC: "if (pointer)\n    {\n        struct MemBlock *head = (struct MemBlock *)heapStart;\n        struct MemBlock *block = (struct MemBlock *)((u8 *)pointer - sizeof(struct MemBlock));\n        block->flag = FALSE;\n\n         \n         \n        if (block->next != head)\n        {\n            if (!block->next->flag)\n            {\n                block->size += sizeof(struct MemBlock) + block->next->size;\n                block->next->magic = 0;\n                block->next = block->next->next;\n                if (block->next != head)\n                    block->next->prev = block;\n            }\n        }\n\n         \n         \n        if (block != head)\n        {\n            if (!block->prev->flag)\n            {\n                block->prev->next = block->next;\n\n                if (block->next != head)\n                    block->next->prev = block->prev;\n\n                block->magic = 0;\n                block->prev->size += sizeof(struct MemBlock) + block->size;\n            }\n        }\n    }",
  },
  "InitHeap": {
    returnType: "void",
    params: "void *heapStart, u32 heapSize",
    callsTo: ["PutFirstMemBlockHeader"],
    lineCount: 3,
    bodyC: "sHeapStart = heapStart;\n    sHeapSize = heapSize;\n    PutFirstMemBlockHeader(heapStart, heapSize);",
  },
  "PutFirstMemBlockHeader": {
    returnType: "void",
    params: "void *block, u32 size",
    callsTo: ["PutMemBlockHeader"],
    lineCount: 1,
    bodyC: "PutMemBlockHeader(block, (struct MemBlock *)block, (struct MemBlock *)block, size - sizeof(struct MemBlock));",
  },
  "PutMemBlockHeader": {
    returnType: "void",
    params: "void *block, struct MemBlock *prev, struct MemBlock *next, u32 size",
    lineCount: 6,
    bodyC: "struct MemBlock *header = (struct MemBlock *)block;\n\n    header->flag = FALSE;\n    header->magic = MALLOC_SYSTEM_ID;\n    header->size = size;\n    header->prev = prev;\n    header->next = next;",
  },
} as const;
