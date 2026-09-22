# Corepolis repository rules

- Publish GitHub Pages directly from `main` and `/ (root)` without GitHub Actions.
- Keep public runtime paths relative to the repository root so `/Corepolis/` works.
- Do not retain superseded code, files, compatibility branches, fallback implementations, comments, or strings. Delete them in the same change that replaces them.
- Before deleting a replacement target, verify that no live import, reference, or runtime path still depends on it.
- Keep required third-party license and provenance notices even when the implementation that originally introduced an asset is replaced.
