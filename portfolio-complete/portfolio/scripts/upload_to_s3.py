#!/usr/bin/env python3
"""
Utility to bulk-upload local portfolio images/PDFs to S3.
Usage: python scripts/upload_to_s3.py --folder ./media --bucket your-bucket-name
"""
import argparse
import boto3
from pathlib import Path


def upload_folder(folder: str, bucket: str, prefix: str = ''):
    s3 = boto3.client('s3')
    root = Path(folder)
    files = list(root.rglob('*'))
    uploaded = 0

    for f in files:
        if f.is_file():
            key = f'{prefix}/{f.relative_to(root)}' if prefix else str(f.relative_to(root))
            content_type = get_content_type(f.suffix)
            print(f'Uploading {f.name} → s3://{bucket}/{key}')
            s3.upload_file(
                str(f),
                bucket,
                key,
                ExtraArgs={
                    'ContentType': content_type,
                    'ACL': 'public-read',
                    'CacheControl': 'max-age=86400',
                },
            )
            uploaded += 1

    print(f'\n✓ Uploaded {uploaded} files to s3://{bucket}/')


def get_content_type(suffix: str) -> str:
    types = {
        '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
        '.png': 'image/png', '.gif': 'image/gif',
        '.webp': 'image/webp', '.svg': 'image/svg+xml',
        '.pdf': 'application/pdf', '.mp4': 'video/mp4',
        '.webm': 'video/webm',
    }
    return types.get(suffix.lower(), 'application/octet-stream')


if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--folder', required=True)
    parser.add_argument('--bucket', required=True)
    parser.add_argument('--prefix', default='')
    args = parser.parse_args()
    upload_folder(args.folder, args.bucket, args.prefix)
