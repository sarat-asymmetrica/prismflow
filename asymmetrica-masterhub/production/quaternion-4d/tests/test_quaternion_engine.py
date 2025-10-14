"""
Test Suite: Quaternion Engine High-Level Operations

Tests quaternion conversion, interpolation, and batch operations.
"""

import sys
import os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'implementation'))

import math
import pytest
from quaternion_engine import Quaternion, QuaternionEngine


class TestQuaternionEngine:
    """Test high-level engine operations."""

    def test_from_axis_angle_z_axis(self):
        """Validate axis-angle to quaternion conversion (Z-axis)."""
        # 90-degree rotation around Z-axis
        q = QuaternionEngine.from_axis_angle((0, 0, 1), math.pi / 2)

        # Should be: cos(45°) + sin(45°)k
        expected_w = math.cos(math.pi / 4)
        expected_z = math.sin(math.pi / 4)

        assert abs(q.w - expected_w) < 1e-10
        assert abs(q.x) < 1e-10
        assert abs(q.y) < 1e-10
        assert abs(q.z - expected_z) < 1e-10
        assert abs(q.magnitude() - 1.0) < 1e-10

    def test_from_axis_angle_x_axis(self):
        """Validate axis-angle to quaternion conversion (X-axis)."""
        q = QuaternionEngine.from_axis_angle((1, 0, 0), math.pi / 3)

        expected_w = math.cos(math.pi / 6)
        expected_x = math.sin(math.pi / 6)

        assert abs(q.w - expected_w) < 1e-10
        assert abs(q.x - expected_x) < 1e-10
        assert abs(q.y) < 1e-10
        assert abs(q.z) < 1e-10

    def test_from_axis_angle_arbitrary_axis(self):
        """Validate axis-angle with arbitrary (non-unit) axis."""
        # Non-normalized axis
        q = QuaternionEngine.from_axis_angle((2, 0, 0), math.pi / 2)

        # Should normalize axis internally
        assert abs(q.magnitude() - 1.0) < 1e-10

    def test_from_axis_angle_zero_axis(self):
        """Validate zero axis returns identity."""
        q = QuaternionEngine.from_axis_angle((0, 0, 0), math.pi)

        # Should be identity quaternion
        assert q.w == 1
        assert q.x == 0
        assert q.y == 0
        assert q.z == 0

    def test_to_rotation_matrix_identity(self):
        """Validate identity quaternion to matrix."""
        q = Quaternion(1, 0, 0, 0)
        matrix = QuaternionEngine.to_rotation_matrix(q)

        # Should be 3x3 identity matrix
        expected = [[1, 0, 0], [0, 1, 0], [0, 0, 1]]

        for i in range(3):
            for j in range(3):
                assert abs(matrix[i][j] - expected[i][j]) < 1e-10

    def test_to_rotation_matrix_90_degrees(self):
        """Validate 90-degree rotation to matrix."""
        # 90-degree rotation around Z-axis
        q = QuaternionEngine.from_axis_angle((0, 0, 1), math.pi / 2)
        matrix = QuaternionEngine.to_rotation_matrix(q)

        # Expected matrix for 90° Z-rotation:
        # [[ 0, -1,  0],
        #  [ 1,  0,  0],
        #  [ 0,  0,  1]]

        assert abs(matrix[0][0]) < 1e-10
        assert abs(matrix[0][1] - (-1)) < 1e-10
        assert abs(matrix[0][2]) < 1e-10
        assert abs(matrix[1][0] - 1) < 1e-10
        assert abs(matrix[1][1]) < 1e-10
        assert abs(matrix[1][2]) < 1e-10
        assert abs(matrix[2][0]) < 1e-10
        assert abs(matrix[2][1]) < 1e-10
        assert abs(matrix[2][2] - 1) < 1e-10

    def test_slerp_endpoints(self):
        """Validate SLERP at endpoints."""
        q1 = QuaternionEngine.from_axis_angle((0, 0, 1), 0)
        q2 = QuaternionEngine.from_axis_angle((0, 0, 1), math.pi / 2)

        # t=0 should return q1
        result_0 = QuaternionEngine.slerp(q1, q2, 0)
        assert abs(result_0.w - q1.w) < 1e-10
        assert abs(result_0.x - q1.x) < 1e-10
        assert abs(result_0.y - q1.y) < 1e-10
        assert abs(result_0.z - q1.z) < 1e-10

        # t=1 should return q2
        result_1 = QuaternionEngine.slerp(q1, q2, 1)
        assert abs(result_1.w - q2.w) < 1e-10
        assert abs(result_1.x - q2.x) < 1e-10
        assert abs(result_1.y - q2.y) < 1e-10
        assert abs(result_1.z - q2.z) < 1e-10

    def test_slerp_midpoint(self):
        """Validate SLERP midpoint interpolation."""
        # 0° to 90° rotation
        q1 = QuaternionEngine.from_axis_angle((0, 0, 1), 0)
        q2 = QuaternionEngine.from_axis_angle((0, 0, 1), math.pi / 2)

        # t=0.5 should be 45° rotation
        result = QuaternionEngine.slerp(q1, q2, 0.5)
        expected = QuaternionEngine.from_axis_angle((0, 0, 1), math.pi / 4)

        assert abs(result.w - expected.w) < 1e-6
        assert abs(result.x - expected.x) < 1e-6
        assert abs(result.y - expected.y) < 1e-6
        assert abs(result.z - expected.z) < 1e-6

    def test_slerp_unit_magnitude(self):
        """Validate SLERP always produces unit quaternions."""
        q1 = Quaternion(1, 2, 3, 4).normalize()
        q2 = Quaternion(5, 6, 7, 8).normalize()

        for t in [0, 0.25, 0.5, 0.75, 1.0]:
            result = QuaternionEngine.slerp(q1, q2, t)
            assert abs(result.magnitude() - 1.0) < 1e-10

    def test_from_euler_identity(self):
        """Validate Euler angles (0,0,0) to quaternion."""
        q = QuaternionEngine.from_euler(0, 0, 0)

        assert abs(q.w - 1) < 1e-10
        assert abs(q.x) < 1e-10
        assert abs(q.y) < 1e-10
        assert abs(q.z) < 1e-10

    def test_from_euler_90_degrees(self):
        """Validate Euler angles to quaternion."""
        # 90-degree yaw (Z-rotation)
        q = QuaternionEngine.from_euler(0, 0, math.pi / 2)

        # Should match axis-angle result
        expected = QuaternionEngine.from_axis_angle((0, 0, 1), math.pi / 2)

        assert abs(q.w - expected.w) < 1e-10
        assert abs(q.x - expected.x) < 1e-10
        assert abs(q.y - expected.y) < 1e-10
        assert abs(q.z - expected.z) < 1e-10

    def test_to_euler_identity(self):
        """Validate quaternion to Euler angles (identity)."""
        q = Quaternion(1, 0, 0, 0)
        roll, pitch, yaw = QuaternionEngine.to_euler(q)

        assert abs(roll) < 1e-10
        assert abs(pitch) < 1e-10
        assert abs(yaw) < 1e-10

    def test_euler_round_trip(self):
        """Validate Euler → Quaternion → Euler round trip."""
        original_roll = 0.5
        original_pitch = 0.3
        original_yaw = 0.7

        # Convert to quaternion and back
        q = QuaternionEngine.from_euler(original_roll, original_pitch, original_yaw)
        roll, pitch, yaw = QuaternionEngine.to_euler(q)

        assert abs(roll - original_roll) < 1e-10
        assert abs(pitch - original_pitch) < 1e-10
        assert abs(yaw - original_yaw) < 1e-10

    def test_batch_rotate_single(self):
        """Validate batch rotation with single quaternion."""
        q = QuaternionEngine.from_axis_angle((0, 0, 1), math.pi / 2)
        vector = (1, 0, 0)

        results = QuaternionEngine.batch_rotate([q], vector)

        assert len(results) == 1
        assert abs(results[0][0]) < 1e-10
        assert abs(results[0][1] - 1) < 1e-10
        assert abs(results[0][2]) < 1e-10

    def test_batch_rotate_multiple(self):
        """Validate batch rotation with multiple quaternions."""
        quaternions = [
            QuaternionEngine.from_axis_angle((0, 0, 1), 0),
            QuaternionEngine.from_axis_angle((0, 0, 1), math.pi / 4),
            QuaternionEngine.from_axis_angle((0, 0, 1), math.pi / 2),
            QuaternionEngine.from_axis_angle((0, 0, 1), math.pi),
        ]

        vector = (1, 0, 0)
        results = QuaternionEngine.batch_rotate(quaternions, vector)

        assert len(results) == 4

        # First should be unchanged
        assert abs(results[0][0] - 1) < 1e-10
        assert abs(results[0][1]) < 1e-10

        # Last should be flipped
        assert abs(results[3][0] - (-1)) < 1e-10
        assert abs(results[3][1]) < 1e-10

    def test_identity_quaternion(self):
        """Validate identity quaternion creation."""
        q = QuaternionEngine.identity()

        assert q.w == 1
        assert q.x == 0
        assert q.y == 0
        assert q.z == 0


class TestConvenienceFunctions:
    """Test convenience wrapper functions."""

    def test_quat_multiply(self):
        """Test quat_multiply convenience function."""
        from quaternion_engine import quat_multiply

        q1 = Quaternion(1, 2, 3, 4)
        q2 = Quaternion(5, 6, 7, 8)

        result1 = quat_multiply(q1, q2)
        result2 = q1.multiply(q2)

        assert abs(result1.w - result2.w) < 1e-10
        assert abs(result1.x - result2.x) < 1e-10
        assert abs(result1.y - result2.y) < 1e-10
        assert abs(result1.z - result2.z) < 1e-10

    def test_quat_rotate(self):
        """Test quat_rotate convenience function."""
        from quaternion_engine import quat_rotate

        q = QuaternionEngine.from_axis_angle((0, 0, 1), math.pi / 2)
        vector = (1, 0, 0)

        result1 = quat_rotate(q, vector)
        result2 = q.rotate_vector(vector)

        assert abs(result1[0] - result2[0]) < 1e-10
        assert abs(result1[1] - result2[1]) < 1e-10
        assert abs(result1[2] - result2[2]) < 1e-10

    def test_quat_from_axis_angle(self):
        """Test quat_from_axis_angle convenience function."""
        from quaternion_engine import quat_from_axis_angle

        q1 = quat_from_axis_angle((0, 0, 1), math.pi / 2)
        q2 = QuaternionEngine.from_axis_angle((0, 0, 1), math.pi / 2)

        assert abs(q1.w - q2.w) < 1e-10
        assert abs(q1.x - q2.x) < 1e-10
        assert abs(q1.y - q2.y) < 1e-10
        assert abs(q1.z - q2.z) < 1e-10

    def test_quat_slerp(self):
        """Test quat_slerp convenience function."""
        from quaternion_engine import quat_slerp

        q1 = QuaternionEngine.from_axis_angle((0, 0, 1), 0)
        q2 = QuaternionEngine.from_axis_angle((0, 0, 1), math.pi / 2)

        result1 = quat_slerp(q1, q2, 0.5)
        result2 = QuaternionEngine.slerp(q1, q2, 0.5)

        assert abs(result1.w - result2.w) < 1e-10
        assert abs(result1.x - result2.x) < 1e-10
        assert abs(result1.y - result2.y) < 1e-10
        assert abs(result1.z - result2.z) < 1e-10


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
