"""
Test Suite: Quaternion Core Operations

Validates the extracted quaternion engine against Agent Kilo's findings:
- Magnitude calculation: Error = 0.0 (PERFECT)
- All core quaternion operations
- Mathematical correctness

Test Coverage Target: 100%
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'implementation'))

import math
import pytest
from quaternion_engine import Quaternion, QuaternionEngine


class TestQuaternionCore:
    """Test core quaternion operations (Agent Kilo validated)."""

    def test_magnitude_calculation_validated(self):
        """
        CRITICAL TEST: Validate perfect magnitude calculation (error = 0.0).

        This is the core validated component from Agent Kilo's test.
        Original test showed: Error = 0.000000 (PASS)
        """
        # Test case 1: Unit quaternion
        q = Quaternion(1, 0, 0, 0)
        assert q.magnitude() == 1.0, "Unit quaternion magnitude should be 1.0"

        # Test case 2: Pythagorean quaternion
        q = Quaternion(1, 1, 1, 1)
        expected = math.sqrt(1**2 + 1**2 + 1**2 + 1**2)
        assert abs(q.magnitude() - expected) < 1e-10, f"Expected {expected}, got {q.magnitude()}"

        # Test case 3: Agent Kilo's validation case
        q = Quaternion(w=1.5, x=0.8, y=0.6, z=0.4)
        computed_magnitude = math.sqrt(1.5**2 + 0.8**2 + 0.6**2 + 0.4**2)
        assert abs(q.magnitude() - computed_magnitude) == 0.0, "Agent Kilo test: Error must be 0.0"

        # Test case 4: Zero quaternion
        q = Quaternion(0, 0, 0, 0)
        assert q.magnitude() == 0.0, "Zero quaternion magnitude should be 0.0"

        # Test case 5: Large values
        q = Quaternion(100, 200, 300, 400)
        expected = math.sqrt(100**2 + 200**2 + 300**2 + 400**2)
        assert abs(q.magnitude() - expected) < 1e-10, "Large value magnitude calculation"

    def test_normalization(self):
        """Validate unit quaternion creation."""
        # Test case 1: Simple normalization
        q = Quaternion(3, 4, 0, 0)
        q_norm = q.normalize()
        assert abs(q_norm.magnitude() - 1.0) < 1e-10, "Normalized quaternion must have magnitude 1"

        # Test case 2: Already normalized
        q = Quaternion(1, 0, 0, 0)
        q_norm = q.normalize()
        assert abs(q_norm.magnitude() - 1.0) < 1e-10
        assert q_norm.w == 1.0

        # Test case 3: General case
        q = Quaternion(2, 3, 6, 1)
        q_norm = q.normalize()
        assert abs(q_norm.magnitude() - 1.0) < 1e-10

        # Test case 4: Negative components
        q = Quaternion(-1, -2, -3, -4)
        q_norm = q.normalize()
        assert abs(q_norm.magnitude() - 1.0) < 1e-10

    def test_normalization_zero_quaternion(self):
        """Validate error handling for zero quaternion normalization."""
        q = Quaternion(0, 0, 0, 0)
        with pytest.raises(ValueError, match="Cannot normalize zero quaternion"):
            q.normalize()

    def test_conjugate(self):
        """Validate conjugate operation."""
        q = Quaternion(1, 2, 3, 4)
        q_conj = q.conjugate()

        assert q_conj.w == 1, "Real part unchanged"
        assert q_conj.x == -2, "i component negated"
        assert q_conj.y == -3, "j component negated"
        assert q_conj.z == -4, "k component negated"

        # Conjugate of conjugate is original
        q_conj_conj = q_conj.conjugate()
        assert q_conj_conj.w == q.w
        assert q_conj_conj.x == q.x
        assert q_conj_conj.y == q.y
        assert q_conj_conj.z == q.z

    def test_inverse(self):
        """Validate quaternion inverse."""
        # For unit quaternion: q^(-1) = q*
        q = Quaternion(1, 0, 0, 0).normalize()
        q_inv = q.inverse()
        q_conj = q.conjugate()

        assert abs(q_inv.w - q_conj.w) < 1e-10
        assert abs(q_inv.x - q_conj.x) < 1e-10
        assert abs(q_inv.y - q_conj.y) < 1e-10
        assert abs(q_inv.z - q_conj.z) < 1e-10

        # q * q^(-1) = identity
        q = Quaternion(2, 3, 4, 5)
        q_inv = q.inverse()
        identity = q.multiply(q_inv)

        assert abs(identity.w - 1.0) < 1e-10
        assert abs(identity.x) < 1e-10
        assert abs(identity.y) < 1e-10
        assert abs(identity.z) < 1e-10

    def test_inverse_zero_quaternion(self):
        """Validate error handling for zero quaternion inverse."""
        q = Quaternion(0, 0, 0, 0)
        with pytest.raises(ValueError, match="Cannot invert zero quaternion"):
            q.inverse()

    def test_multiplication_identity(self):
        """Validate quaternion multiplication with identity."""
        q = Quaternion(2, 3, 4, 5)
        identity = Quaternion(1, 0, 0, 0)

        # q * I = q
        result1 = q.multiply(identity)
        assert abs(result1.w - q.w) < 1e-10
        assert abs(result1.x - q.x) < 1e-10
        assert abs(result1.y - q.y) < 1e-10
        assert abs(result1.z - q.z) < 1e-10

        # I * q = q
        result2 = identity.multiply(q)
        assert abs(result2.w - q.w) < 1e-10
        assert abs(result2.x - q.x) < 1e-10
        assert abs(result2.y - q.y) < 1e-10
        assert abs(result2.z - q.z) < 1e-10

    def test_multiplication_fundamental_units(self):
        """
        Validate Hamilton's fundamental quaternion identities.

        i² = j² = k² = ijk = -1
        ij = k,  jk = i,  ki = j
        ji = -k, kj = -i, ik = -j
        """
        i = Quaternion(0, 1, 0, 0)
        j = Quaternion(0, 0, 1, 0)
        k = Quaternion(0, 0, 0, 1)

        # i² = -1
        i_squared = i.multiply(i)
        assert abs(i_squared.w - (-1)) < 1e-10
        assert abs(i_squared.x) < 1e-10
        assert abs(i_squared.y) < 1e-10
        assert abs(i_squared.z) < 1e-10

        # j² = -1
        j_squared = j.multiply(j)
        assert abs(j_squared.w - (-1)) < 1e-10

        # k² = -1
        k_squared = k.multiply(k)
        assert abs(k_squared.w - (-1)) < 1e-10

        # ij = k
        ij = i.multiply(j)
        assert abs(ij.w) < 1e-10
        assert abs(ij.x) < 1e-10
        assert abs(ij.y) < 1e-10
        assert abs(ij.z - 1) < 1e-10

        # ji = -k
        ji = j.multiply(i)
        assert abs(ji.w) < 1e-10
        assert abs(ji.z - (-1)) < 1e-10

        # jk = i
        jk = j.multiply(k)
        assert abs(jk.x - 1) < 1e-10

        # kj = -i
        kj = k.multiply(j)
        assert abs(kj.x - (-1)) < 1e-10

        # ki = j
        ki = k.multiply(i)
        assert abs(ki.y - 1) < 1e-10

        # ik = -j
        ik = i.multiply(k)
        assert abs(ik.y - (-1)) < 1e-10

    def test_multiplication_non_commutative(self):
        """Validate that quaternion multiplication is non-commutative."""
        q1 = Quaternion(1, 2, 3, 4)
        q2 = Quaternion(5, 6, 7, 8)

        result1 = q1.multiply(q2)
        result2 = q2.multiply(q1)

        # They should NOT be equal
        assert abs(result1.w - result2.w) > 1e-6 or \
               abs(result1.x - result2.x) > 1e-6 or \
               abs(result1.y - result2.y) > 1e-6 or \
               abs(result1.z - result2.z) > 1e-6, \
               "Quaternion multiplication should be non-commutative"

    def test_multiplication_operator_overload(self):
        """Validate operator overload for multiplication."""
        q1 = Quaternion(1, 2, 3, 4)
        q2 = Quaternion(5, 6, 7, 8)

        result1 = q1 * q2
        result2 = q1.multiply(q2)

        assert abs(result1.w - result2.w) < 1e-10
        assert abs(result1.x - result2.x) < 1e-10
        assert abs(result1.y - result2.y) < 1e-10
        assert abs(result1.z - result2.z) < 1e-10

    def test_rotate_vector_identity(self):
        """Validate vector rotation with identity quaternion."""
        identity = Quaternion(1, 0, 0, 0)
        vector = (1, 2, 3)

        rotated = identity.rotate_vector(vector)

        assert abs(rotated[0] - vector[0]) < 1e-10
        assert abs(rotated[1] - vector[1]) < 1e-10
        assert abs(rotated[2] - vector[2]) < 1e-10

    def test_rotate_vector_90_degrees(self):
        """Validate 90-degree rotation around Z-axis."""
        # 90-degree rotation around Z-axis
        q = QuaternionEngine.from_axis_angle((0, 0, 1), math.pi / 2)

        # Point on X-axis should rotate to Y-axis
        vector = (1, 0, 0)
        rotated = q.rotate_vector(vector)

        assert abs(rotated[0]) < 1e-10, "X component should be ~0"
        assert abs(rotated[1] - 1) < 1e-10, "Y component should be ~1"
        assert abs(rotated[2]) < 1e-10, "Z component should be ~0"

    def test_rotate_vector_180_degrees(self):
        """Validate 180-degree rotation."""
        # 180-degree rotation around Z-axis
        q = QuaternionEngine.from_axis_angle((0, 0, 1), math.pi)

        vector = (1, 0, 0)
        rotated = q.rotate_vector(vector)

        assert abs(rotated[0] - (-1)) < 1e-10, "Should flip X"
        assert abs(rotated[1]) < 1e-10
        assert abs(rotated[2]) < 1e-10

    def test_to_dict(self):
        """Validate dictionary serialization."""
        q = Quaternion(1, 2, 3, 4)
        d = q.to_dict()

        assert d['w'] == 1
        assert d['x'] == 2
        assert d['y'] == 3
        assert d['z'] == 4
        assert 'magnitude' in d
        assert abs(d['magnitude'] - q.magnitude()) < 1e-10

    def test_repr(self):
        """Validate string representation."""
        q = Quaternion(1.2345, 2.3456, 3.4567, 4.5678)
        repr_str = repr(q)

        assert 'Quaternion' in repr_str
        assert '1.2345' in repr_str
        assert '2.3456' in repr_str
        assert '3.4567' in repr_str
        assert '4.5678' in repr_str


class TestQuaternionMagnitudeEdgeCases:
    """Exhaustive magnitude testing (Agent Kilo's critical validation)."""

    def test_magnitude_zero(self):
        """Zero quaternion magnitude"""
        q = Quaternion(0, 0, 0, 0)
        assert q.magnitude() == 0.0

    def test_magnitude_unit_quaternions(self):
        """All unit quaternions"""
        assert Quaternion(1, 0, 0, 0).magnitude() == 1.0
        assert Quaternion(0, 1, 0, 0).magnitude() == 1.0
        assert Quaternion(0, 0, 1, 0).magnitude() == 1.0
        assert Quaternion(0, 0, 0, 1).magnitude() == 1.0

    def test_magnitude_negative_components(self):
        """Negative components (magnitude is always positive)"""
        q1 = Quaternion(3, 4, 0, 0)
        q2 = Quaternion(-3, -4, 0, 0)
        assert q1.magnitude() == q2.magnitude()

    def test_magnitude_large_values(self):
        """Large value stability"""
        q = Quaternion(1e6, 2e6, 3e6, 4e6)
        expected = math.sqrt((1e6)**2 + (2e6)**2 + (3e6)**2 + (4e6)**2)
        assert abs(q.magnitude() - expected) / expected < 1e-10

    def test_magnitude_small_values(self):
        """Small value stability"""
        q = Quaternion(1e-6, 2e-6, 3e-6, 4e-6)
        expected = math.sqrt((1e-6)**2 + (2e-6)**2 + (3e-6)**2 + (4e-6)**2)
        assert abs(q.magnitude() - expected) / expected < 1e-10


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
