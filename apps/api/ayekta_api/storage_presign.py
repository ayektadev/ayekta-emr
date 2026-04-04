"""Pluggable object storage: S3-compatible presigned URLs or dev server PUT."""

from __future__ import annotations

from dataclasses import dataclass
from typing import Any
from uuid import UUID

from ayekta_api.config import get_settings


@dataclass(frozen=True)
class PutPresignResult:
    upload_url: str
    method: str
    headers: dict[str, str]
    requires_authorization: bool
    storage_key: str | None


@dataclass(frozen=True)
class GetPresignResult:
    url: str


def _s3_client() -> Any | None:
    try:
        import boto3  # type: ignore[import-untyped]
        from botocore.config import Config  # type: ignore[import-untyped]
    except ImportError:
        return None
    s = get_settings()
    if not s.s3_bucket:
        return None
    kwargs: dict[str, Any] = {
        "service_name": "s3",
        "region_name": s.s3_region or "us-east-1",
        "aws_access_key_id": s.aws_access_key_id or None,
        "aws_secret_access_key": s.aws_secret_access_key or None,
        "config": Config(signature_version="s3v4"),
    }
    if s.s3_endpoint_url:
        kwargs["endpoint_url"] = s.s3_endpoint_url
    return boto3.client(**kwargs)


def s3_put_presign(*, storage_key: str, content_type: str, expires_seconds: int = 3600) -> PutPresignResult | None:
    client = _s3_client()
    if client is None:
        return None
    bucket = get_settings().s3_bucket
    url = client.generate_presigned_url(
        "put_object",
        Params={"Bucket": bucket, "Key": storage_key, "ContentType": content_type},
        ExpiresIn=expires_seconds,
        HttpMethod="PUT",
    )
    return PutPresignResult(
        upload_url=url,
        method="PUT",
        headers={"Content-Type": content_type},
        requires_authorization=False,
        storage_key=storage_key,
    )


def s3_get_presign(*, storage_key: str, expires_seconds: int = 300) -> GetPresignResult | None:
    client = _s3_client()
    if client is None:
        return None
    bucket = get_settings().s3_bucket
    url = client.generate_presigned_url(
        "get_object",
        Params={"Bucket": bucket, "Key": storage_key},
        ExpiresIn=expires_seconds,
        HttpMethod="GET",
    )
    return GetPresignResult(url=url)


def dev_server_put_presign(*, attachment_id: UUID, public_base_url: str, content_type: str) -> PutPresignResult:
    base = public_base_url.rstrip("/")
    return PutPresignResult(
        upload_url=f"{base}/attachments/blob/{attachment_id}",
        method="PUT",
        headers={"Content-Type": content_type},
        requires_authorization=True,
        storage_key=None,
    )
