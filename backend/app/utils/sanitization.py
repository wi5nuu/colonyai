import html
from typing import TypeVar

T = TypeVar("T")


def sanitize_string(value: str | None) -> str | None:
    """
    Escape HTML characters in a string to prevent XSS.
    """
    if value is None:
        return None
    if not isinstance(value, str):
        return str(value)
    return html.escape(value)


def sanitize_recursive(data: T) -> T:
    """
    Recursively sanitize strings in dicts, lists, and other structures.
    """
    if isinstance(data, str):
        return sanitize_string(data)
    elif isinstance(data, list):
        return [sanitize_recursive(item) for item in data]
    elif isinstance(data, dict):
        return {key: sanitize_recursive(val) for key, val in data.items()}
    return data
