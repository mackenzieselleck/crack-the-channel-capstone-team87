import pytest

from app.postprocessing import (
    bits_to_hex_preview,
    binary_entropy,
    cascade_reconcile,
    privacy_amplification,
    secure_key_length,
)


def test_cascade_reconcile_fixes_one_error_and_reports_leakage():
    corrected, leaked_bits, corrected_errors = cascade_reconcile(
        [1, 0, 1, 1],
        [1, 0, 0, 1],
        block_size=4,
    )

    assert corrected == [1, 0, 1, 1]
    assert leaked_bits == 3
    assert corrected_errors == 1


def test_cascade_reconcile_rejects_invalid_inputs():
    with pytest.raises(ValueError, match="block_size"):
        cascade_reconcile([0], [0], block_size=0)

    with pytest.raises(ValueError, match="same length"):
        cascade_reconcile([0], [], block_size=1)


def test_binary_entropy_handles_boundaries_and_is_maximal_at_half():
    assert binary_entropy(0.0) == 0.0
    assert binary_entropy(1.0) == 0.0
    assert binary_entropy(0.5) == pytest.approx(1.0)


def test_secure_key_length_is_bounded_and_accounts_for_leaked_bits():
    assert secure_key_length(100, 0.0, 0, security_parameter=0) == 100
    assert secure_key_length(100, 0.0, 10, security_parameter=5) == 85
    assert secure_key_length(10, 0.5, 0, security_parameter=0) == 0
    assert secure_key_length(0, 0.0, 0) == 0


def test_privacy_amplification_is_reproducible_with_a_seed():
    key = [1, 0, 1, 1] * 30

    first, first_length = privacy_amplification(key, 0.0, 0, security_parameter=0, seed=7)
    second, second_length = privacy_amplification(key, 0.0, 0, security_parameter=0, seed=7)

    assert first == second
    assert first_length == second_length
    assert len(first) == first_length


def test_bits_to_hex_preview_formats_and_limits_output():
    assert bits_to_hex_preview([]) == ""
    assert bits_to_hex_preview([1, 0, 1, 1]) == "b"
    assert len(bits_to_hex_preview([1] * 100)) == 16
