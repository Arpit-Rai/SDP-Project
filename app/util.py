def save_uploaded_file(upload_file):
    import os
    from tempfile import NamedTemporaryFile
    try:
        suffix = os.path.splitext(upload_file.filename)[1]
        with NamedTemporaryFile(delete=False, suffix=suffix) as temp_file:
            temp_file.write(upload_file.file.read())
            temp_path = temp_file.name
        return temp_path
    except Exception as e:
        raise RuntimeError(f"Failed to save uploaded file: {e}")