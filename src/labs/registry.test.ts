import { describe, expect, it } from 'vitest'
import { conceptById } from '@/curriculum'
import { DEEP_LAB_IDS } from './registry'

describe('deep lab registry', () => {
  it('only has labs for real concepts', () => {
    for (const id of DEEP_LAB_IDS) expect(conceptById.has(id), id).toBe(true)
  })
})
