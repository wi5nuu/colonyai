"""AWS S3 storage utilities with graceful fallback when boto3 is unavailable."""

try:
    import boto3
    from botocore.exceptions import ClientError
    BOTO3_AVAILABLE = True
except ImportError:
    boto3 = None
    ClientError = Exception
    BOTO3_AVAILABLE = False

from app.core.config import settings
from typing import Optional


def get_s3_client():
    """Return a boto3 S3 client configured with project credentials.

    Returns None when boto3 is not installed or AWS credentials are not set.
    """
    if not BOTO3_AVAILABLE:
        return None
    if not settings.AWS_ACCESS_KEY_ID:
        return None

    return boto3.client(
        "s3",
        aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
        aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
        region_name=settings.AWS_REGION,
    )


def s3_is_configured() -> bool:
    """Check whether S3 storage is available (credentials set and boto3 installed)."""
    return BOTO3_AVAILABLE and bool(settings.AWS_ACCESS_KEY_ID)


def upload_to_s3(file_bytes: bytes, s3_key: str, content_type: str = "application/octet-stream") -> Optional[str]:
    """Upload raw bytes to S3.

    Args:
        file_bytes: The file content as bytes.
        s3_key: The destination key (path) inside the S3 bucket.
        content_type: MIME type of the file.

    Returns:
        The s3_key on success, or None when S3 is not configured.

    Raises:
        RuntimeError on upload failure when S3 *is* configured.
    """
    client = get_s3_client()
    if client is None:
        return None

    try:
        client.put_object(
            Bucket=settings.AWS_S3_BUCKET,
            Key=s3_key,
            Body=file_bytes,
            ContentType=content_type,
        )
        return s3_key
    except ClientError as exc:
        raise RuntimeError(f"S3 upload failed for key '{s3_key}': {exc}") from exc


def get_presigned_url(s3_key: str, expiry_seconds: Optional[int] = None) -> Optional[str]:
    """Generate a time-limited presigned download URL for an S3 object.

    Args:
        s3_key: The object key in S3.
        expiry_seconds: URL validity in seconds (defaults to AWS_S3_URL_EXPIRY).

    Returns:
        A presigned URL string, or None when S3 is not configured.
    """
    client = get_s3_client()
    if client is None:
        return None

    if expiry_seconds is None:
        expiry_seconds = settings.AWS_S3_URL_EXPIRY

    try:
        url = client.generate_presigned_url(
            "get_object",
            Params={"Bucket": settings.AWS_S3_BUCKET, "Key": s3_key},
            ExpiresIn=expiry_seconds,
        )
        return url
    except ClientError as exc:
        raise RuntimeError(f"Failed to generate presigned URL for key '{s3_key}': {exc}") from exc


def delete_from_s3(s3_key: str) -> bool:
    """Delete an object from S3.

    Args:
        s3_key: The object key to delete.

    Returns:
        True if deleted, False when S3 is not configured.

    Raises:
        RuntimeError on deletion failure when S3 *is* configured.
    """
    client = get_s3_client()
    if client is None:
        return False

    try:
        client.delete_object(Bucket=settings.AWS_S3_BUCKET, Key=s3_key)
        return True
    except ClientError as exc:
        raise RuntimeError(f"S3 delete failed for key '{s3_key}': {exc}") from exc
