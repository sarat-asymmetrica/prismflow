"""
Quaternion 4D Engine - Production-Ready Package

Exports:
- Quaternion: Core quaternion class
- QuaternionEngine: High-level operations
- Convenience functions for common operations
"""

from .quaternion_engine import (
    Quaternion,
    QuaternionEngine,
    quat_multiply,
    quat_rotate,
    quat_from_axis_angle,
    quat_slerp
)

__version__ = "1.0.0"
__all__ = [
    "Quaternion",
    "QuaternionEngine",
    "quat_multiply",
    "quat_rotate",
    "quat_from_axis_angle",
    "quat_slerp"
]
