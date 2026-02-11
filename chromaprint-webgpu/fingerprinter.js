
const fingerprinter = (() => {
const getTensorBuffer = (safetensorBuffer, tensorMetadata) => {
  return safetensorBuffer.subarray(...tensorMetadata.data_offsets);
};

const getTensorMetadata = (safetensorBuffer) => {
    const metadataLength = Number(new DataView(safetensorBuffer.buffer).getBigUint64(0, true));
    const metadata = JSON.parse(new TextDecoder("utf8").decode(safetensorBuffer.subarray(8, 8 + metadataLength)));
    return Object.fromEntries(Object.entries(metadata).filter(([k, v]) => k !== "__metadata__").map(([k, v]) => [k, {...v, data_offsets: v.data_offsets.map(x => 8 + metadataLength + x)}]));
};

const createEmptyBuf = (device, size) => {
    return device.createBuffer({size, usage: GPUBufferUsage.STORAGE | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST });
};

const createUniformBuf = (device, size) => {
  return device.createBuffer({size, usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST})
}

const createInfinityUniformBuf = (device) => {
  const size = 4;
  const buf = device.createBuffer({
    mappedAtCreation: true,
    size,
    usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_SRC | GPUBufferUsage.COPY_DST
  });
  new Float32Array(buf.getMappedRange())[0] = Infinity;
  buf.unmap();
  return buf;
};

const createWeightBuf = (device, size, data) => {
  const buf = device.createBuffer({ size, usage: GPUBufferUsage.STORAGE, mappedAtCreation: true });
  new Uint8Array(buf.getMappedRange()).set(data); buf.unmap();
  return buf;
};

const addComputePass = (device, commandEncoder, pipeline, layout, infinityUniformBuf, bufs, workgroup) => {
  const bindGroup = device.createBindGroup({
    layout: layout,
    entries: [
      { binding: 0, resource: { buffer: infinityUniformBuf } },
      ...bufs.map((buffer, index) => ({ binding: index + 1, resource: { buffer } }))
    ]
  });

  const passEncoder = commandEncoder.beginComputePass();
  passEncoder.setPipeline(pipeline);
  passEncoder.setBindGroup(0, bindGroup);
  passEncoder.dispatchWorkgroups(...workgroup);
  passEncoder.end();
};

const r_32_16_12n1 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
var<workgroup> temp0: array<f32,16>;
@group(0) @binding(1)var<storage,read_write>data0_32:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1_192:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2_6144:array<atomic<u32>>;
@compute @workgroup_size(16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var acc0: array<f32,1>;
  var acc1: array<f32,1>;
  var gidx0 = i32(gindex.x); /* 32 */
  var lidx0 = i32(lindex.x); /* 16 */
  acc0[0] = 0.0f;
  for (var Ridx0_0 = 0; Ridx0_0 < 12; Ridx0_0++) {
    var alu1 = (lidx0+bitcast<i32>((bitcast<u32>(Ridx0_0)<<4u))+(gidx0*192));
    var alu2 = select(0,3,(alu1<0));
    var val0 = atomicLoad(&data2_6144[((alu1+alu2)>>2u)]);
    var val1 = data1_192[((lidx0*12)+Ridx0_0)];
    acc0[0] = (acc0[0]+(val1*(f32((bool(((val0>>(((u32(alu1))&3u)<<3u))&255u)))))));
  }
  temp0[lidx0] = acc0[0];
  workgroupBarrier();
  acc1[0] = 0.0f;
  for (var Ridx102 = 0; Ridx102 < 16; Ridx102++) {
    var val2 = temp0[Ridx102];
    acc1[0] = (acc1[0]+val2);
  }
  var alu10 = ((bool(lidx0))!=true);
  if (alu10) {
    data0_32[gidx0] = (acc1[0]+1.0f);
  }
}`;

const r_16n3 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
var<workgroup> temp0: array<i32,16>;
@group(0) @binding(1)var<storage,read_write>data0_1:array<i32>;
@group(0) @binding(2)var<storage,read_write>data1_32:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2_48:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3_16:array<i32>;
@compute @workgroup_size(16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var acc0: array<i32,1>;
  var lidx0 = i32(lindex.x); /* 16 */
  var val0 = data3_16[lidx0];
  var val1 = data1_32[lidx0];
  var alu0 = (lidx0+16);
  var val2 = data1_32[alu0];
  var val3 = data2_48[lidx0];
  var val4 = data2_48[alu0];
  var val5 = data2_48[(lidx0+32)];
  var alu1 = (log2((val1*(1/val2)))*0.6931471805599453f);
  temp0[lidx0] = ((bitcast<i32>((bitcast<u32>((i32(((alu1<val4)!=true))))<<1u))+(i32((((alu1<val3)!=true)&(alu1<val5)))))*val0);
  workgroupBarrier();
  acc0[0] = 0;
  for (var Ridx101 = 0; Ridx101 < 16; Ridx101++) {
    var val6 = temp0[Ridx101];
    acc0[0] = (acc0[0]+val6);
  }
  var alu7 = ((bool(lidx0))!=true);
  if (alu7) {
    data0_1[0] = acc0[0];
  }
}`;

const setupNet = async (device, safetensor) => {
    const metadata = getTensorMetadata(safetensor);
    const infinityBuf = createInfinityUniformBuf(device);

    const layouts=[device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]})]

    const buf_0 = createEmptyBuf(device, 128);;
    const input0 = createEmptyBuf(device, 768);;
    const buf_1 = createWeightBuf(device, 6144, getTensorBuffer(safetensor, metadata['masks']));
    const output0 = createEmptyBuf(device, 4);;
    const buf_2 = createWeightBuf(device, 192, getTensorBuffer(safetensor, metadata['quants']));
    const buf_3 = createWeightBuf(device, 64, getTensorBuffer(safetensor, metadata['bitshifts']));

    const gpuWriteBuffer0 = device.createBuffer({size:input0.size, usage: GPUBufferUsage.COPY_SRC | GPUBufferUsage.MAP_WRITE });

    const gpuReadBuffer0 = device.createBuffer({size:output0.size, usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ });

    const kernels = [r_32_16_12n1, r_16n3];
    const pipelines = await Promise.all(kernels.map(async (name, i) => {
      return await device.createComputePipelineAsync({
          layout: device.createPipelineLayout({
              bindGroupLayouts: [layouts[i]],
          }),
          compute: {
              module: device.createShaderModule({
                  code: name,
              }),
              entryPoint: "main",
          },
      });
  }))

    return async (_input0) => {
        const commandEncoder = device.createCommandEncoder();
        await gpuWriteBuffer0.mapAsync(GPUMapMode.WRITE);
        new Float32Array(gpuWriteBuffer0.getMappedRange()).set(_input0);
        gpuWriteBuffer0.unmap();
        commandEncoder.copyBufferToBuffer(gpuWriteBuffer0, 0, input0, 0, gpuWriteBuffer0.size);
        addComputePass(device, commandEncoder, pipelines[0], layouts[0], infinityBuf, [buf_0, input0, buf_1], [32, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[1], layouts[1], infinityBuf, [output0, buf_0, buf_2, buf_3], [1, 1, 1]);
        commandEncoder.copyBufferToBuffer(output0, 0, gpuReadBuffer0, 0, output0.size);
        const gpuCommands = commandEncoder.finish();
        device.queue.submit([gpuCommands]);

        await gpuReadBuffer0.mapAsync(GPUMapMode.READ);
        const resultBuffer0 = new Int32Array(gpuReadBuffer0.size/4);
        resultBuffer0.set(new Int32Array(gpuReadBuffer0.getMappedRange()));
        gpuReadBuffer0.unmap();
        return [resultBuffer0];
    }
}
const load = async (device, weight_path) => { return await fetch(weight_path).then(x => x.arrayBuffer()).then(x => setupNet(device, new Uint8Array(x))); }
return { load, setupNet };
})();
export default fingerprinter;
