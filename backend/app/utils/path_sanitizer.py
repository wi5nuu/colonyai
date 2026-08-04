"""
Path Sanitization Utilities for ColonyAI

FIX BUG-CRITICAL-004: Implements comprehensive path traversal protection
and filename sanitization to prevent directory traversal attacks.

Security Features:
- Remove path separators and null bytes
- Whitelist only safe characters
- Validate file extensions
- Prevent hidden files (starting with .)
- Generate safe unique filenames
"""

import os
import re
import uuid
from pathlib import Path
from typing import Optional


# Whitelist of allowed file extensions for uploads
ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp', '.tiff'}


def sanitize_filename(filename: str, allowed_extensions: Optional[set] = None) -> str:
    """
    Sanitize a filename to prevent path traversal and other attacks.
    
    Args:
        filename: The original filename to sanitize
        allowed_extensions: Set of allowed file extensions (default: ALLOWED_EXTENSIONS)
    
    Returns:
        A safe filename with only alphanumeric characters, dots, dashes, and underscores
    
    Raises:
        ValueError: If filename is empty, contains no extension, or has invalid extension
    
    Examples:
        >>> sanitize_filename("../../etc/passwd")
        ValueError: Invalid filename
        
        >>> sanitize_filename("image.jpg")
        'image.jpg'
        
        >>> sanitize_filename("my photo (1).jpg")
        'my_photo__1_.jpg'
    """
    if not filename or not isinstance(filename, str):
        raise ValueError("Filename must be a non-empty string")
    
    if allowed_extensions is None:
        allowed_extensions = ALLOWED_EXTENSIONS
    
    # Remove path components (handles both forward and backslash)
    filename = os.path.basename(filename)
    
    # Remove null bytes (common in path traversal attacks)
    filename = filename.replace('\x00', '')
    
    # Prevent hidden files
    if filename.startswith('.'):
        raise ValueError("Hidden files not allowed")
    
    # Split into name and extension
    if '.' not in filename:
        raise ValueError("Filename must have an extension")
    
    parts = filename.rsplit('.', 1)
    if len(parts) != 2:
        raise ValueError("Invalid filename format")
    
    name, ext = parts
    ext = f".{ext.lower()}"
    
    # Validate extension
    if ext not in allowed_extensions:
        raise ValueError(f"File extension {ext} not allowed. Allowed: {', '.join(allowed_extensions)}")
    
    # Sanitize name: keep only alphanumeric, dash, underscore
    # Replace other characters with underscore
    name = re.sub(r'[^a-zA-Z0-9._-]', '_', name)
    
    # Prevent empty name after sanitization
    if not name or name == '_':
        raise ValueError("Filename resulted in empty name after sanitization")
    
    # Limit length (255 is common filesystem limit, leave room for extension)
    max_name_length = 200
    if len(name) > max_name_length:
        name = name[:max_name_length]
    
    return f"{name}{ext}"


def generate_safe_filename(original_filename: str, use_uuid: bool = True) -> str:
    """
    Generate a safe filename, optionally using UUID for uniqueness.
    
    Args:
        original_filename: The original filename
        use_uuid: If True, prepend a UUID to ensure uniqueness (recommended)
    
    Returns:
        A safe, unique filename
    
    Examples:
        >>> generate_safe_filename("photo.jpg", use_uuid=True)
        'a1b2c3d4-e5f6-7890-abcd-ef1234567890_photo.jpg'
        
        >>> generate_safe_filename("photo.jpg", use_uuid=False)
        'photo.jpg'
    """
    # First sanitize the original filename
    safe_name = sanitize_filename(original_filename)
    
    if use_uuid:
        # Split into name and extension
        name, ext = safe_name.rsplit('.', 1)
        # Prepend UUID
        unique_id = uuid.uuid4()
        return f"{unique_id}_{name}.{ext}"
    
    return safe_name


def validate_path_in_directory(file_path: str, base_directory: str) -> bool:
    """
    Validate that a file path is within a base directory (no path traversal).
    
    Args:
        file_path: The file path to validate
        base_directory: The base directory that should contain the file
    
    Returns:
        True if path is safe (within base_directory), False otherwise
    
    Examples:
        >>> validate_path_in_directory("/uploads/image.jpg", "/uploads")
        True
        
        >>> validate_path_in_directory("/uploads/../etc/passwd", "/uploads")
        False
    """
    try:
        # Resolve both paths to absolute, normalized paths
        base = Path(base_directory).resolve()
        target = Path(file_path).resolve()
        
        # Check if target is relative to base
        # This will raise ValueError if not relative
        target.relative_to(base)
        return True
    except (ValueError, RuntimeError):
        # ValueError: target is not relative to base
        # RuntimeError: infinite loop in path resolution (symlink attack)
        return False


def safe_join_path(base_directory: str, *paths: str) -> str:
    """
    Safely join paths while preventing directory traversal.
    
    Args:
        base_directory: The base directory
        *paths: Path components to join
    
    Returns:
        A safe, absolute path within base_directory
    
    Raises:
        ValueError: If resulting path would be outside base_directory
    
    Examples:
        >>> safe_join_path("/uploads", "images", "photo.jpg")
        '/uploads/images/photo.jpg'
        
        >>> safe_join_path("/uploads", "..", "etc", "passwd")
        ValueError: Path traversal detected
    """
    # Join all paths
    full_path = os.path.join(base_directory, *paths)
    
    # Validate the result is within base_directory
    if not validate_path_in_directory(full_path, base_directory):
        raise ValueError(
            f"Path traversal detected: {full_path} is not within {base_directory}"
        )
    
    return full_path


def extract_safe_extension(filename: str) -> str:
    """
    Extract and validate file extension.
    
    Args:
        filename: The filename to extract extension from
    
    Returns:
        Lowercase extension with dot (e.g., '.jpg')
    
    Raises:
        ValueError: If extension is invalid or not allowed
    """
    if not filename or '.' not in filename:
        raise ValueError("No file extension found")
    
    ext = filename.rsplit('.', 1)[-1].lower()
    ext_with_dot = f".{ext}"
    
    if ext_with_dot not in ALLOWED_EXTENSIONS:
        raise ValueError(f"Extension {ext_with_dot} not allowed")
    
    return ext_with_dot
