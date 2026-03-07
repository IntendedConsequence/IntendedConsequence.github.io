---
title: Chromaprint WebGPU
date: 2026-03-07
---

# Running Chromaprint in the Browser with WebGPU

### Reimplementing libchromaprint with NumPy and tinygrad

I recently worked on a project to **reimplement the Chromaprint algorithm in NumPy**, port it to **tinygrad**, and ultimately **export it to WebGPU so it can run directly in the browser**.

The goal was simple: generate **AcoustID-compatible audio fingerprints entirely client-side**, without any server-side compute. If a browser can decode the audio, it should be able to fingerprint it locally.

This turned out to be an interesting exercise in **DSP, vectorized programming, GPU export constraints, and bit-level compression algorithms**.

---

# Motivation

Chromaprint is the algorithm behind **AcoustID**, which powers music identification services. Normally it’s used through `libchromaprint`, often accessed through `ffmpeg`.

However, running this pipeline in the browser usually means one of two things:

- Sending audio to a server for fingerprinting
    
- Compiling the C++ library to WebAssembly
    

I wanted a third option:

- **Run the algorithm natively on the GPU in the browser using WebGPU**
    

To do that, I needed a **fully vectorized implementation** that could be exported as a compute graph.

That’s why the pipeline became:

```
libchromaprint reference
        ↓
NumPy reimplementation
        ↓
tinygrad port
        ↓
WebGPU export
        ↓
JavaScript runtime pipeline
```

---

# High-Level Pipeline

Chromaprint roughly works like this:

1. **STFT** on the audio
    
2. Convert spectral data into **chroma features**
    
3. Apply a series of **16 filters** over a **16×12 chroma window**
    
4. Each filter produces a **2-bit quantized value**
    
5. Combine those into a **32-bit fingerprint frame**
    
6. Apply **delta compression (int3 + int5)**
    

The end result is a compact fingerprint compatible with **AcoustID lookups**.

---

# Verifying Correctness

To validate my implementation I started with a simple process:

- Generate fingerprints using **ffmpeg’s libchromaprint wrapper**
    
- Compare both **raw and compressed fingerprints** with my implementation
    

Once those matched for a reference track, I verified compatibility by submitting fingerprints to the **AcoustID API**.

If AcoustID could identify arbitrary songs using my fingerprints, the implementation was correct.

---

# A Debugging Detour: Trusting the Reference Too Much

At one point my FFT results diverged significantly from the reference implementation.

I tried:

- swapping FFT implementations
    
- rechecking padding and frame offsets
    

Nothing helped.

Eventually I rebuilt the reference implementation and discovered something embarrassing:  
**my reference fingerprint data had been corrupted**.

Once I regenerated it, my results suddenly matched almost perfectly. Even different FFT algorithms only changed **1–2 bits out of ~30k**, which didn’t affect the final fingerprint.

---

# An Outdated Blog Post Caused a Major Bug

Chromaprint’s author wrote a blog post in 2011 describing the algorithm.

I relied on that post and the current source code. Unfortunately, **one key detail had changed**.

The blog described the filter output as:

```
difference = a - b
```

Where `a` and `b` are sums of two sets of masked chroma values.

But the actual implementation uses:

```
log((1 + a) / (1 + b))
```

Hidden inside a function named:

```
SubtractLog
```

Which I subconsciously interpreted as something related to debug logging.

The code looked like this:

```cpp
inline double Subtract(double a, double b) {
    return a - b;
}

inline double SubtractLog(double a, double b) {
    double r = log((1.0 + a) / (1.0 + b));
    assert(!IsNaN(r));
    return r;
}
```

Because the codebase is heavily fragmented across many small functions, this subtle difference took a while to notice.

---

# Vectorizing the Filter Stage

Each fingerprint frame comes from **16 filters applied to a 16×12 chroma window**.

Each filter:

1. Crops a sub-rectangle
    
2. Applies a binary mask
    
3. Splits values into two sets: **A** and **B**
    
4. Computes `log((1+a)/(1+b))`
    
5. Quantizes the result into **2 bits**
    

In the vectorized version:

- chroma windows are shaped as
    

```
[batch, 1, 12, 16]
```

- masks are
    

```
[32, 12, 16]
```

(16 A masks + 16 B masks)

Applying them yields:

```
[batch, 32, 12, 16]
```

Then reshaped into:

```
[batch, 2, 16, ...]
```

From there:

- sum masked values
    
- compute the log ratio
    
- quantize
    

---

# Fusing Quantization and Gray Coding

The reference implementation:

1. quantizes values
    
2. converts them to **Gray code**
    

I fused both operations:

```python
def quantize(x, c):
    # quantize + fused grey code
    return (c[1] <= x) * 2 + ((x >= c[0]) & (x < c[2]))
```

The outputs are multiplied by powers of two so each filter occupies its own **2-bit position inside a uint32**.

---

# The Hardest Part: Delta Compression

The final fingerprint is compressed using **run-length encoding of zero bits**.

It uses two arrays:

- **int3 array** (values up to 7)
    
- **int5 array** (overflow values)
    

If a run length is:

```
< 7 → stored directly in int3
≥ 7 → int3 stores 7, int5 stores (n-7)
```

The reference implementation processes **each bit individually**, which is extremely serial.

But I needed something:

- parallelizable
    
- constant time
    
- bounded memory
    
- batch-friendly
    

---

# Parallelizing the Run-Length Encoding

The trick was **transposing the problem**.

Instead of processing one `uint32` at a time:

```
count all runs of element 1
then element 2
...
```

I processed **runs across the batch simultaneously**:

```
first run for all elements
second run for all elements
...
up to 32
```

This meant:

- a fixed **32 unrolled iterations**
    
- each iteration produced either a run length or zero
    
- results could be flattened and compacted using masked selection
    

Masked selection preserves ordering, so the run sequence remained correct.

After that:

- values were clipped to 7 for the `int3` stream
    
- overflow became the `int5` stream
    

---

# tinygrad and WebGPU Export Issues

The NumPy implementation was straightforward, but exporting to **tinygrad + WebGPU** introduced several constraints:

### Static batch sizes

WebGPU exports require **fixed batch sizes**.

My NumPy code used dynamic batching, so I exported models with **batch size = 1** (or window-sized pseudo-batches).

The JavaScript runtime then handles buffering between stages.

---

### Stage windowing

Different pipeline stages require different windows:

```
STFT        → 1 frame
Chroma      → 5 frames
Fingerprint → 12 frames
```

So the browser runtime accumulates frames until each stage has enough input.

---

### Transposes

In Python:

```
x.T
```

In WebGPU + JS:

- either manually transpose in JS
    
- or bake transposes into the model
    

I chose **pre/post transposes inside the exported model**, which made the runtime simpler.

---

### tinygrad limitations

One notable limitation:

tinygrad didn’t support **bit shifting by an array**.

I worked around this by using **division by powers of two**, which is mathematically equivalent to shifting.

---

# Metadata for the Runtime

Each exported stage includes a small JSON file containing:

```
{
  stft_batch,
  chroma_batch,
  fingerprint_batch,
  tinygrad_git_revision
}
```

The browser runtime uses this to configure batching automatically.

---

# Performance

Initial performance:

```
2 minutes of audio → ~20 seconds
```

After introducing **batch size 32**:

```
2 minutes → ~2 seconds
```

The compression stage currently runs in **raw JavaScript**, because WebGPU lacks **64-bit integer types**, which makes packing the `int5` array much easier on CPU.

I may move that stage to WebGPU later.

---

# Final Result

The final system can:

- decode audio in the browser
    
- generate **Chromaprint-compatible fingerprints**
    
- submit them directly to **AcoustID**
    
- do everything **without server-side compute**
    

And it runs in only a couple seconds for a typical song.

---
