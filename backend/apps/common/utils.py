"""Backward-compatible imports for common queryset helpers."""

from apps.common.ownership import filter_by_tenant

__all__ = ["filter_by_tenant"]
