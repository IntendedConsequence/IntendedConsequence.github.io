
// #region constants

const SAMPLE_RATE = 11025;
const FRAME_SIZE = 4096;
const STRIDE = Math.floor(FRAME_SIZE / 3);
// const BS = 4;
// const STFT_BATCH_SIZE = BS;
const BS2 = 5;
// const BATCHED_ADVANCE = STRIDE * STFT_BATCH_SIZE;
// const BATCHED_WINDOW = FRAME_SIZE + STRIDE * (STFT_BATCH_SIZE - 1);
// const BINS_COUNT = 1298;
const BINS_COUNT = 12;
const NUM_BANDS = 12;
const CHROMA_WINDOW_LEN = 16;
// const STFT_SPEC_CHUNK_LENGTH = BINS_COUNT * STFT_BATCH_SIZE;

// #endregion constants

// #region audio
async function fetchMonoFloat32Array(url, sampleRate, AudioContextImplementation = globalThis.AudioContext) {
    const response = await fetch(url);
    return await fetchMonoFloat32ArrayFile(response, sampleRate, AudioContextImplementation);
}

async function fetchMonoFloat32ArrayFile(response, sampleRate, AudioContextImplementation = globalThis.AudioContext) {
    const arrayBuffer = await response.arrayBuffer();
    const audioCtx = new AudioContextImplementation({ sampleRate, sinkId: 'none', numberOfChannels: 1, length: sampleRate });
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
    await audioCtx.close?.();
    const mono = new Float32Array(audioBuffer.length);
    for (let c = 0; c < audioBuffer.numberOfChannels; c++) {
        const data = new Float32Array(audioBuffer.length);
        audioBuffer.copyFromChannel(data, c);
        for (let i = 0; i < data.length; i++) mono[i] += data[i] / audioBuffer.numberOfChannels;
    }
    return { sampleRate: audioBuffer.sampleRate, samples: mono };
}
// #endregion audio

const getProgressDlForPart = async (part, progressCallback, lastModified) => {
    const serverLastModified = await fetch(part + '.version', {cache: 'no-cache'}).then(r => r.ok ? r.text() : '');
    if (lastModified) {
        if (serverLastModified === lastModified) return null; // not modified
    }
    const response = await fetch(part);

    const total = parseInt(response.headers.get('content-length'), 10);
    const newLastModified = serverLastModified;

    const res = new Response(new ReadableStream({
        async start(controller) {
            const reader = response.body.getReader();
            for (; ;) {
                const { done, value } = await reader.read();
                if (done) break;
                progressCallback(part, value.byteLength, total);
                controller.enqueue(value);
            }
            controller.close();
        },
    }));
    return { buffer: await res.arrayBuffer(), lastModified: newLastModified };
};

const tensorStore = (db) => ({
    get: (id) => new Promise(r => {
        const req = db.transaction('tensors').objectStore('tensors').get(id);
        req.onsuccess = () => r(req.result || null);
        req.onerror = () => r(null);
    }),
    put: (id, content, lastModified) => new Promise(r => {
        const req = db.transaction('tensors', 'readwrite')
            .objectStore('tensors').put({ id, content, lastModified });
        req.onsuccess = () => r();
        req.onerror = () => r(null);
    })
});

function initDb(indexedDB) {
    return new Promise((resolve, reject) => {
        let db;
        const request = indexedDB.open('tinychromaprintdb', 2);
        request.onerror = (event) => {
            console.error('Database error:', event.target.error);
            resolve(null);
        };

        request.onsuccess = (event) => {
            db = event.target.result;
            console.log("Db initialized.");
            resolve(db);
        };

        request.onupgradeneeded = (event) => {
            db = event.target.result;
            if (event.oldVersion < 2 && db.objectStoreNames.contains("tensors")) db.deleteObjectStore?.('tensors');
            if (!db.objectStoreNames.contains('tensors')) {
                db.createObjectStore('tensors', { keyPath: 'id' });
            }
        };
    });
}

const getDevice = async (GPU) => {
    if (!GPU) return false;
    const adapter = await GPU.requestAdapter();
    if (!adapter) return false;
    let maxStorageBufferBindingSize = adapter.limits.maxStorageBufferBindingSize;

    const _2GB = 2 ** 31; // 2GB
    // safeguard against webgpu reporting nonsense value. some anti-fingerprinting measures?
    // TODO(irwin): use max_size_per_tensor_in_bytes to get actual required limit
    let maxBufferSize = Math.min(adapter.limits.maxBufferSize, _2GB);
    let maxComputeWorkgroupStorageSize = adapter.limits.maxComputeWorkgroupStorageSize;
    const params = {
        // requiredFeatures: ["shader-f16"],
        requiredLimits: { "maxStorageBufferBindingSize": maxStorageBufferBindingSize, "maxBufferSize": maxBufferSize, "maxComputeWorkgroupStorageSize": maxComputeWorkgroupStorageSize },
        powerPreference: "high-performance"
    };
    /** @type {GPUDevice} */
    const device = await adapter.requestDevice(params);
    return device;
};


// #region chromaprint

function compute_window_offsets(batch_size, window_size, stride, samples_numel) {
    let batched_advance = stride * batch_size;
    let batched_window = window_size + stride * (batch_size - 1);
    let iters = Math.ceil(samples_numel / batched_advance);
    let total_frames = iters * batch_size;
    let total_frames_if_bs_1 = Math.ceil((samples_numel - window_size) / stride) + 1;
    return {
        batched_advance,
        batched_window,
        iters,
        total_frames,
        total_frames_if_bs_1
    };
}

function padded_subarray(source_array, offset, count) {
    let chunk = source_array.subarray(offset, offset + count);
    if (chunk.length < count) {
        const padded = new Float32Array(count);
        const pad_length = count - chunk.length;
        console.log(`padding last chunk by ${pad_length} samples (${Math.round(pad_length / count * 100)}%)`);
        padded.set(chunk);
        chunk = padded;
    }
    return chunk;
}

function u8ToBase64(u8) {
    let s = '';
    const chunk = 0x8000; // avoid stack blowups
    for (let i = 0; i < u8.length; i += chunk)
        s += String.fromCharCode(...u8.subarray(i, i + chunk));
    return btoa(s);
}

function u8ToBase64UrlSafe(u8) {
    return u8ToBase64(u8).replace(/\+/g, '-').replace(/\//g, '_');
}

async function compute_fingerprint(nets, audioFetcher, cancelToken) {
    let before = performance.now();
    const { sampleRate, samples } = await audioFetcher();
    // fs.writeFileSync("samples.f32", samples);
    // const samples_buffer = fs.readFileSync("samples_ref.f32", {flags: "rb"});
    // const samples = new Float32Array(samples_buffer.buffer);


    const STFT_BATCH_SIZE = nets.model_metadata.stft_batch_size;
    const BATCHED_ADVANCE = STRIDE * STFT_BATCH_SIZE;
    const stft_chroma_offsets = compute_window_offsets(STFT_BATCH_SIZE, FRAME_SIZE, STRIDE, samples.length);

    const iters = Math.ceil(samples.length / BATCHED_ADVANCE);
    const totalFrames = iters * STFT_BATCH_SIZE;
    const totalFrames_unpadded = Math.ceil((samples.length - FRAME_SIZE) / STRIDE) + 1;
    const specs_full = new Float32Array(totalFrames * BINS_COUNT);

    // let specs_full = new Float32Array((Math.ceil((samples.length - BATCHED_WINDOW) / BATCHED_ADVANCE) + 1) * BS * BINS_COUNT);
    let frame = 0;
    let is_zero = 0;
    console.log(samples.length);
    console.log(`before stft ${performance.now() - before}`);
    before = performance.now();
    for (let i = 0; i < samples.length; i += stft_chroma_offsets.batched_advance) {
        console.log(`specs_full.length: ${specs_full.length}, offset: ${BINS_COUNT * frame}, i: ${i}, frame: ${frame}`)
        let chunk = padded_subarray(samples, i, stft_chroma_offsets.batched_window);
        let [stft_spec] = await nets.stft(chunk, is_zero);
        specs_full.set(stft_spec, BINS_COUNT * frame);

        frame += STFT_BATCH_SIZE;
        is_zero = 1;
    }
    console.log(`stft ${performance.now() - before}`);
    before = performance.now();
    // fs.writeFileSync("chroma_full.f32", specs_full.subarray(0, totalFrames_unpadded * BINS_COUNT));

    const CHRF_BATCH_SIZE = nets.model_metadata.chrf_batch_size;
    const chroma_normed_offsets = compute_window_offsets(CHRF_BATCH_SIZE, 5*NUM_BANDS, NUM_BANDS, stft_chroma_offsets.total_frames_if_bs_1 * BINS_COUNT);
    console.log(chroma_normed_offsets);

    const chroma_normed_full = new Float32Array(chroma_normed_offsets.total_frames * NUM_BANDS);
    let chroma_frame = 0;
    for (let i = 0; i < stft_chroma_offsets.total_frames_if_bs_1 * BINS_COUNT; i += chroma_normed_offsets.batched_advance) {
        let chroma_chunk = padded_subarray(specs_full, i, chroma_normed_offsets.batched_window);
        let [chroma_normed] = await nets.chrf(chroma_chunk);
        // console.log(chroma_normed);
        // chroma_normed_full.set(chroma_normed, i);
        chroma_normed_full.set(chroma_normed, NUM_BANDS * chroma_frame);
        chroma_frame += CHRF_BATCH_SIZE;
    }
    console.log(`chrf ${performance.now() - before}`);
    before = performance.now();

    // fs.writeFileSync("chroma_normed.f32", chroma_normed_full.subarray(0, chroma_normed_offsets.total_frames_if_bs_1 * NUM_BANDS));

    const FP_BATCH_SIZE = nets.model_metadata.fp_batch_size;
    const fingerprint_offsets = compute_window_offsets(FP_BATCH_SIZE, NUM_BANDS*CHROMA_WINDOW_LEN, NUM_BANDS, chroma_normed_offsets.total_frames_if_bs_1 * NUM_BANDS);
    console.log(fingerprint_offsets);

    // let chroma_normed_full_t = transpose(chroma_normed_full, chroma_normed_full.length / 12, 12);
    let chroma_normed_full_t = chroma_normed_full
    let fingerprint_full = new Uint32Array(fingerprint_offsets.total_frames);
    let fp_frame = 0;
    for (let i = 0; i < chroma_normed_offsets.total_frames_if_bs_1 * NUM_BANDS; i+= fingerprint_offsets.batched_advance) {
        let chroma_normed_chunk = padded_subarray(chroma_normed_full_t, i, fingerprint_offsets.batched_window);
        // chroma_normed_chunk = transpose(chroma_normed_chunk, 12, 16);
        let [fp_row] = await nets.fingerprinter(chroma_normed_chunk);
        if (i / fingerprint_offsets.batched_advance < 16) {
            console.log(fp_row, (fp_row[0] >>> 0).toString(16));
            // console.log(chroma_normed_chunk);
        }
        // console.log(dec2bin(fp_row[0]));
        fingerprint_full.set(fp_row, fp_frame);
        fp_frame += FP_BATCH_SIZE;
    }
    let fp = fingerprint_full.subarray(0, fingerprint_offsets.total_frames_if_bs_1);
    console.log(`fp ${performance.now() - before}`);
    before = performance.now();

    // fs.writeFileSync("fingerprint.bin", fp);

    // let file_array = compress_fingerprint(fp);
    // fs.writeFileSync("fp_comp.bin", file_array);
    // let base64encoded = u8ToBase64UrlSafe(file_array);

    // console.log(base64encoded);
    // fs.writeFileSync("fp_comp_base64.txt", base64encoded);
    return fp;
}

function shl(x, n) {
    // NOTE: work around javascript n modulo 32 and signedness shit
    return ((x << (n & 31)) >>> 0) & -(n < 32);
}
function shr(x, n) {
    // NOTE: work around javascript n modulo 32 and signedness shit
    return (x >>> (n & 31)) & -(n < 32);
}
function popcount_uint32(x) {
    x = x >>> 0;
    x = (x & 0x55555555) + (shr(x, 1) & 0x55555555);
    x = (x & 0x33333333) + (shr(x, 2) & 0x33333333);
    x = (x & 0x0F0F0F0F) + (shr(x, 4) & 0x0F0F0F0F);
    x = (x & 0x00FF00FF) + (shr(x, 8) & 0x00FF00FF);
    x = (x & 0x0000FFFF) + (shr(x, 16) & 0x0000FFFF);
    return x;
}
function bitscan_forward(x) {
    return popcount_uint32((x&-x)-1);
}

function compress_fingerprint(fp) {
    let fpx = new Uint32Array(fp.length);
    fpx[0] = fp[0];
    for (let i = 1; i < fp.length; ++i) {
        fpx[i] = fp[i] ^ fp[i-1];
    }

    let int3 = [];
    let int5 = [];
    for (let i = 0; i < fpx.length; ++i) {
        let cur = fpx[i];
        while (cur > 0) {
            let bits = bitscan_forward(cur) + 1;
            if (bits >= 7) {
                int3.push(7);
                int5.push(bits - 7);
            } else {
                int3.push(bits);
            }
            cur = shr(cur, bits);
        }
        int3.push(0);
    }
    // NOTE: spread each group of 8 3-bit values over 24 bits
    for (let i = 0; i < int3.length; ++i) {
        int3[i] = shl(int3[i], (i%8)*3);
    }
    // NOTE: spread each group of 4 5-bit values over 20 bits
    for (let i = 0; i < int5.length; ++i) {
        int5[i] = shl(int5[i], (i%4)*5);
    }
    let int3x = new Uint32Array(Math.ceil(int3.length / 8));
    let int5x = new Uint32Array(Math.ceil(int5.length / 4));
    // NOTE: sum each group of 8 shifted 3-bit values into its own single Uint32
    for (let i = 0; i < int3.length; ++i) {
        int3x[Math.floor(i / 8)] += int3[i];
    }
    // NOTE: sum each group of 4 shifted 5-bit values into its own single Uint32
    for (let i = 0; i < int5.length; ++i) {
        int5x[Math.floor(i / 4)] += int5[i];
    }
    // NOTE: put 12 lower bits of the second Uint32 into the upper bits of the first Uint32
    // NOTE: leaving only 8 bits in second Uint32
    for (let i = 0; i < int5.length; i+=2) {
        int5x[i] = int5x[i] | shl(int5x[i+1], 20);
        int5x[i+1] = shr(int5x[i+1], 12);
    }
    let int3_len = Math.ceil((int3.length * 3) / 8);
    let int5_len = Math.ceil((int5.length * 5) / 8);
    let total_len = 4 + int3_len + int5_len;
    let file_buffer = new ArrayBuffer(total_len);
    // NOTE: chromaprint header is 4 bytes, 1 byte for algorithm version, followed by 24bit size (row count) BIG ENDIAN
    new DataView(file_buffer).setUint32(0, fpx.length, false);
    new DataView(file_buffer).setUint8(0, 1, true);

    let int3x8 = new Uint8Array(int3x.buffer);
    let int3x8_2 = new Uint8Array(file_buffer, 4, int3_len);
    // NOTE: each int3x8 packs 8 int3 values in 24 bits of the Uint32. so we copy each 3 out of 4 bytes
    for (let [i, j] = [0, 0]; i < int3x8_2.length; i+=3) {
        int3x8_2[i] = int3x8[j];
        int3x8_2[i+1] = int3x8[j+1];
        int3x8_2[i+2] = int3x8[j+2];
        j+=4;
    }
    let int5x8 = new Uint8Array(int5x.buffer);
    let int5x8_2 = new Uint8Array(file_buffer, 4+int3_len, int5_len);
    // NOTE: each int5x8 packs 8 int5 values in 40 bits of two Uint32. so we copy each 5 out of 8 bytes
    // NOTE: webgpu doesn't have 64 bit values so we stick to Uint32's to simplify debugging/comparison
    for (let [i, j] = [0, 0]; i < int5x8_2.length; i+=5) {
        int5x8_2[i] = int5x8[j];
        int5x8_2[i+1] = int5x8[j+1];
        int5x8_2[i+2] = int5x8[j+2];
        int5x8_2[i+3] = int5x8[j+3];
        int5x8_2[i+4] = int5x8[j+4];
        j+=8;
    }

    let file_array = new Uint8Array(file_buffer);
    return file_array;
}

// #endregion chromaprint

export {
    SAMPLE_RATE,

    tensorStore,
    initDb,

    getDevice,

    fetchMonoFloat32Array,
    fetchMonoFloat32ArrayFile,
    getProgressDlForPart,

    u8ToBase64,
    u8ToBase64UrlSafe,

    compute_fingerprint,
    compress_fingerprint
};