"""
BB84 key post-processing: error correction (reconciliation) and privacy
amplification.

The POC (docs/sprint-1/bb84-poc/bb84_poc.py) stops after QBER
estimation: its "final key" is just the leftover sifted bits, 
which is not a secure key (see TECHNICAL-NOTES.md section 3,
"No post-processing"). This code implements the two missing steps of real
BB84 so the service produces an actual shared secret key:

1. Error correction (reconciliation) - Alice and Bob split their (still 
   possibly-mismatched) keys into 4-bit blocks and publicly compare block parities. 
   Parities must match, if not, one bit in the block is wrong, and is found by repeatedly
   halving the block and comparing parity of the left half until one bit is left.
   Every parity bit announced is public info, the code counts these as leaked_bits 
   because Eve can learn from them. They are subtracted from the secure key length.

(Limitation: if a block has two errors, the parity still matches and they slip through. Real systems run multiple passes with shuffling to catch these.)

2. Privacy amplification - universal hashing via a random Toeplitz matrix
   (GF(2) matrix-vector product). The corrected key is compressed to a
   shorter output whose length accounts for both the bits leaked during error
   correction and whatever bits Eve may know, from the measured QBER, plus 
   a fixed security margin (32 bits).


Result: a shorter key that Alice and Bob share and Eve can't guess. This is a simplified teaching version.
"""

import math
import random
from typing import List, Tuple

Bits = List[int]

""" Parity: count the 1s in a group of bits and see if the count is even or odd. 
Even gives 0 and odd gives 1, e.g. block 1 0 1 1 has three 1s, which is odd, 
so its parity is 1. If Alice's block is 1 0 1 1 and Bob's is 1 0 0 1, their 
parities differ, so they know at least one bit is wrong. They only need to
announce one bit (the parity) instead of the whole block. Then they narrow it 
down until they've found the single wrong bit. 
"""
def _parity(bits: Bits) -> int: 
    p = 0   #starts at 0
    for b in bits:
        p ^= b  #flips (XOR) for every 1 seen, ends on 0 if even number of 1s and 1 if odd number of 1s 
    return p


def _locate_and_fix(alice_block: Bits, bob_block: Bits, start: int) -> Tuple[Bits, int]:
    """
    Binary search a mismatched block down to the single differing bit and
    flip it on Bob's side. Returns the final block and how many parities leaked."""

    bob_block = list(bob_block)     # Make a copy so original list is unchanged
    leaked = 0                      # Leaked bits - comparing a parity is public
    lo, hi = 0, len(alice_block)    # The search range. The wrong bit is somewhere from lo up to (not including) hi,
                                    # at the start, that's the whole block.

    while hi - lo > 1:              # Keep going until only one bit is left in the range.
        mid = (lo + hi) // 2        # Find the middle of the range.
        leaked += 1
        if _parity(alice_block[lo:mid]) != _parity(bob_block[lo:mid]):  # Check if left halves disagree
            hi = mid                                                    # Yes: the error is in the left half, so ignore the right.
        else:
            lo = mid                                                    # No: the error must be in the right half, so ignore the left.

    bob_block[lo] ^= 1  # flip the final remaining bit 

    return bob_block, leaked

"""
example: Alice has 1 0 1 1 and Bob has 1 0 0 1.

The range is the whole block. The first half (1 0 vs 1 0) matches, so the error is in the right half.
Now they check the third bit: Alice has 1 and Bob has 0. These differ, so the error is at position 2.
Bob flips that bit and now has 1 0 1 1, matching Alice. Two parities were leaked."""


def cascade_reconcile(alice_key: Bits, bob_key: Bits, block_size: int = 4) -> Tuple[Bits, int, int]: #block size is 4 bits by default 
    """
    Reconcile Bob's key to match Alice's using one pass of block-parity
    comparison (a single-round, simplified Cascade).

    Returns Bob's corrected key, how many bits were leaked, and how many errors were fixed.

    Notes:
    - Blocks with an even number of errors keep matching parity and are not
      caught by a single pass. This is a known limitation of one-round
      Cascade and is why real implementations run multiple passes with
      shuffled block orderings. It is acceptable here since the platform's
      QBER range keeps errors sparse.
    - block_size must be >= 1.
    """
    if block_size < 1:  
        raise ValueError("block_size must be >= 1")
    if len(alice_key) != len(bob_key):
        raise ValueError("alice_key and bob_key must be the same length")

    corrected = list(bob_key) # copy of Bob's key that is worked on
    leaked_bits = 0
    corrected_errors = 0

    for start in range(0, len(alice_key), block_size):  # Loop through the key one block at a time: positions 0, 4, 8, 12, ...
        end = min(start + block_size, len(alice_key))   # min() stops the last block going past the key's end.
        a_block = alice_key[start:end]                  # Cut out this block from Alice's key and from Bob's key.
        b_block = corrected[start:end]

        leaked_bits += 1  # one parity bit publicly compared per block
        if _parity(a_block) == _parity(b_block):
            continue

        fixed_block, extra_leaked = _locate_and_fix(a_block, b_block, start)    # if parities differ find the wrong bit and flip it.
                                                                                # Also get back how many extra parities that search leaked.
        corrected[start:end] = fixed_block
        # Put the fixed block back into Bob's key
        leaked_bits += extra_leaked
        corrected_errors += 1

    return corrected, leaked_bits, corrected_errors


def binary_entropy(p: float) -> float:  # Takes an error rate p (like 0.05 for 5%) and returns a score from 0 to 1 based on how uncertain it is.

    """Shannon binary entropy h2(p), used to estimate an eavesdropper's
    information from the observed QBER. h2(0) = h2(1) = 0."""
    
    if p <= 0.0 or p >= 1.0:    # At 0% or 100% errors there's no uncertainty, and log2(0) would crash, so return 0.
        return 0.0
    return -p * math.log2(p) - (1 - p) * math.log2(1 - p)  # The Shannon entropy formula. 0 at no errors, peaks at 1 when p = 0.5, 
                                                           # and is small for small p.


def secure_key_length(input_length: int, qber: float, leaked_bits: int, security_parameter: int = 32) -> int:
    """
    Estimate how many bits of the reconciled key can safely be kept after
    privacy amplification, keep roughly the fraction of bits Eve does not know about
    (1 - h2(qber)) from the incompressibility bound, minus bits already
    leaked during error correction, minus a fixed security margin.
    """

    if input_length <= 0:   
        return 0           # An empty key gives an empty result.

    raw = math.floor(input_length * (1 - binary_entropy(qber)))  # Keep only the fraction Eve doesn't know about. More errors = smaller fraction.
    length = raw - leaked_bits - security_parameter
    return max(0, min(input_length, length))


def _toeplitz_hash(key: Bits, output_length: int, seed: int) -> Bits: 
    # Shrinks key by multipliplying it by a random grid of 0s and 1s (a Toeplitz matrix),
    # which scrambles the bits so that partial knowledge of the input tells Eve almost nothing about the output.
    """
    Universal hash of `key` down to `output_length` bits using a random
    Toeplitz matrix over GF(2): output[i] = XOR of key[j] for j where the
    Toeplitz matrix has a 1 in row i, column j.

    """
    if output_length <= 0:
        return []

    n = len(key)                # Number of bits in the input key.
    rng = random.Random(seed)   # The same seed always gives the same "random" numbers.
    diagonal = [rng.randint(0, 1) for _ in range(n + output_length - 1)]  # Generate the random bits that define the grid.
                                                                          # A Toeplitz grid repeats along its diagonals, so it 
                                                                          # needs only n + output_length - 1 bits.
    output = []
    for i in range(output_length):  # Build one output bit per grid row
        bit = 0
        for j in range(n):          # Go through every input key bit.
            bit ^= diagonal[j - i + output_length - 1] & key[j]     # Look up the grid value for row i, column j.
                                                                    # AND it with the key bit (so only 1s in the grid pick key bits), then XOR it into the result.
        output.append(bit)
    return output


def privacy_amplification(
    key: Bits,
    qber: float,
    leaked_bits: int,
    security_parameter: int = 32,
    seed: int | None = None,
) -> Tuple[Bits, int]:
    """
    Compress key via Toeplitz universal hashing to the length computed by
    `secure_key_length`. Returns a secure key with its length.

    `seed` fixes the Toeplitz matrix for reproducible/testable output; when
    omitted, a fresh random seed is drawn per call (as real privacy
    amplification requires)
    """
    output_length = secure_key_length(len(key), qber, leaked_bits, security_parameter)  #work out how many bits can be safely kept
    if seed is None:
        seed = random.SystemRandom().randrange(2**32)                                   # if no seed given, get one from the OS's secure random source.
    return _toeplitz_hash(key, output_length, seed), output_length                      # Shrink the key with the hash and return it, along with its length.


def bits_to_hex_preview(bits: Bits, max_bits: int = 64) -> str:
    """Render up to `max_bits` of a bit list as a hex string, for safe
    display/logging without printing the full key."""

    preview = bits[:max_bits]   # Take only the first 64 bits (or fewer if the key is shorter).
    if not preview:             # Empty key = empty string.
        return ""
    as_str = "".join(str(b) for b in preview)   # Turn the list [1, 0, 1, 1] into the text "1011".
    value = int(as_str, 2)                      # Read that text as a binary number ("1011" becomes 11).
    hex_digits = (len(preview) + 3) // 4        # Each hex digit covers 4 bits, so this works out how many hex digits are needed (rounding up).
    return format(value, f"0{hex_digits}x")     # Write the number in hex, padded with leading zeros to the right width.
