# Future improvements

Rough notes: ideas that are NOT relevant yet but that we should not forget. They are not a plan, and they are
not kept in sync with any particular version. Each one needs to be weighed (pros and cons) when we get there.

## Performance

- **Web Worker (+ OffscreenCanvas)**: move the per-pixel work off the main thread, so the UI never freezes and
  progress can be real. More complex; canvas filters and image decoding need care inside a worker.
- **WebGL / WebGPU port of the per-pixel engine**: by far the biggest speed-up. Big rewrite, and the look could
  change subtly (noise, blur), so it must be checked against the current output.
- **Lookup-table noise** (instead of the hash-based noise): faster, but it changes the look, so rejected for now.
  Only if a change of look is ever acceptable.
- **Chunked / progressive drawing**: keeps the UI responsive and allows a real percentage. Decision point planned
  right after the status indicator.
- **ONNX Runtime Web with WebGPU, and the fp16 MODNet file (12.4 MiB)**: faster / smaller person detection.
  Untested; fp16 on the WebAssembly backend is unverified.

## Person / subject detection

- **Better, slower models** (the user prefers quality over speed): ISNet (good on non-humans, but AGPL-3.0 per its
  source page), BiRefNet (MIT, about 490 MB in fp16, 973 MB full), U2-Net (.tflite, Apache-2.0, needs LiteRT.js),
  CorridorKey (https://github.com/nikopueringer/CorridorKey, very accurate matting, large).
- **"Fast / Better" model dropdown** in the panel.
- **DeepLab-v3** to also handle animals and objects (the sample cat photos are not "people").
- **MediaPipe hair segmenter and multiclass selfie model** (already in `models/`): could drive other filters, for
  example a hair recolour.
- **Several people in one photo** (group photos); the person-only models are weaker there.

## Other filters to reimplement (from the user's Polarr previews)

- "Matrix": fake code lines on the background, the person processed separately.
- "web checkers": distorted black and white checker background, brighter person, vertical stripes overall.
- "OMG#": black and white concentric lines on the background only.
- A holographic, rainbow wave pattern background behind a black and white person.

## Tool and template

- Derive a reusable **template** from Cyber Pop once v2 is approved: shared shell (image loading, upload, samples,
  reset, export, placement, wheel stepping, draft/full drawing, layer cache, status indicator) kept apart from the
  filter-specific code.
- **Final fidelity test** of Cyber Pop against the user's "original-ish" ChatGPT image of the Polarr preview photo
  (file name starts with `cyber-pop_polarr_filter_-_original-ish_image`).
