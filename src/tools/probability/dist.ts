/** Exact distribution of the sum of k fair dice (by convolution). */
export function diceSumDistribution(k: number): number[] {
  let dist = [1] // sum 0 with probability 1
  for (let d = 0; d < k; d++) {
    const next = Array.from({ length: dist.length + 6 }, () => 0)
    dist.forEach((pr, s) => {
      for (let face = 1; face <= 6; face++) next[s + face] += pr / 6
    })
    dist = next
  }
  return dist
}
