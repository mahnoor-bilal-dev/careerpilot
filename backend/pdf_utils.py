"""
CareerPilot — PDF text extraction (Milestone 4)

Small, focused module: given raw PDF bytes, return the extracted text
(or raise a clear error if there's no usable text). Kept separate from
main.py so the extraction logic can be tested and swapped independently
of the API layer.

Only text-based PDFs are supported in this milestone. Scanned/image-only
PDFs (no embedded text layer) will raise ValueError rather than silently
returning nothing.
"""

import io

from pypdf import PdfReader
from pypdf.errors import PdfReadError


def extract_text_from_pdf(pdf_bytes: bytes) -> str:
    """
    Extracts and returns all text from a PDF's bytes.

    Raises:
        ValueError: if the PDF can't be parsed at all, or parses fine
            but contains no extractable text (e.g. a scanned resume).
    """
    try:
        reader = PdfReader(io.BytesIO(pdf_bytes))
    except PdfReadError as error:
        raise ValueError(f"Could not read this file as a PDF: {error}")

    if reader.is_encrypted:
        raise ValueError(
            "This PDF is password-protected. Please upload an "
            "unprotected PDF."
        )

    text_parts = []
    for page in reader.pages:
        page_text = page.extract_text()
        if page_text:
            text_parts.append(page_text)

    full_text = "\n".join(text_parts).strip()

    if not full_text:
        raise ValueError(
            "No readable text was found in this PDF. It may be a "
            "scanned or image-only document, which isn't supported yet — "
            "please upload a text-based PDF resume."
        )

    return full_text