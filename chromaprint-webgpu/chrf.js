
const chrf = (() => {
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

const r_3_2_4_16_5 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_384:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1_432:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2_5:array<f32>;
@compute @workgroup_size(4,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 2 */
  var gidx1 = i32(gindex.y); /* 3 */
  var lidx0 = i32(lindex.x); /* 4 */
  var lidx1 = i32(lindex.y); /* 16 */
  var cast0 = bitcast<u32>(gidx1);
  var alu0 = (lidx0+bitcast<i32>((cast0<<2u))+(gidx0*192)+(lidx1*12));
  var val0 = data1_432[alu0];
  var val1 = data2_5[0];
  var val2 = data1_432[(alu0+12)];
  var val3 = data2_5[1];
  var val4 = data1_432[(alu0+24)];
  var val5 = data2_5[2];
  var val6 = data1_432[(alu0+36)];
  var val7 = data2_5[3];
  var val8 = data1_432[(alu0+48)];
  var val9 = data2_5[4];
  data0_384[(lidx1+bitcast<i32>((bitcast<u32>(gidx0)<<4u))+bitcast<i32>((cast0<<7u))+bitcast<i32>((bitcast<u32>(lidx0)<<5u)))] = ((val0*val1)+(val2*val3)+(val4*val5)+(val6*val7)+(val8*val9));
}`;

const r_32_12 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_32:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1_384:array<f32>;
@compute @workgroup_size(32) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var lidx0 = i32(lindex.x); /* 32 */
  var val0 = data1_384[lidx0];
  var val1 = data1_384[(lidx0+32)];
  var val2 = data1_384[(lidx0+64)];
  var val3 = data1_384[(lidx0+96)];
  var val4 = data1_384[(lidx0+128)];
  var val5 = data1_384[(lidx0+160)];
  var val6 = data1_384[(lidx0+192)];
  var val7 = data1_384[(lidx0+224)];
  var val8 = data1_384[(lidx0+256)];
  var val9 = data1_384[(lidx0+288)];
  var val10 = data1_384[(lidx0+320)];
  var val11 = data1_384[(lidx0+352)];
  data0_32[lidx0] = sqrt(((val0*val0)+(val1*val1)+(val2*val2)+(val3*val3)+(val4*val4)+(val5*val5)+(val6*val6)+(val7*val7)+(val8*val8)+(val9*val9)+(val10*val10)+(val11*val11)));
}`;

const E_32_3_4 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_384:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1_32:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2_384:array<f32>;
@compute @workgroup_size(32,3) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var lidx0 = i32(lindex.x); /* 32 */
  var val0 = data1_32[lidx0];
  var lidx1 = i32(lindex.y); /* 3 */
  var cast0 = bitcast<u32>(lidx1);
  var alu0 = (lidx0+bitcast<i32>((cast0<<7u)));
  var val1 = data2_384[alu0];
  var val2 = data2_384[(alu0+32)];
  var val3 = data2_384[(alu0+64)];
  var val4 = data2_384[(alu0+96)];
  var alu1 = ((lidx0*12)+bitcast<i32>((cast0<<2u)));
  var alu2 = (1/val0);
  var alu3 = (val0<0.01f);
  var alu4 = select((val1*alu2),0.0f,alu3);
  var alu5 = select((val2*alu2),0.0f,alu3);
  var alu6 = select((val3*alu2),0.0f,alu3);
  var alu7 = select((val4*alu2),0.0f,alu3);
  data0_384[(alu1+1)] = alu5;
  data0_384[(alu1+2)] = alu6;
  data0_384[(alu1+3)] = alu7;
  data0_384[alu1] = alu4;
}`;

const setupNet = async (device, safetensor) => {
    const metadata = getTensorMetadata(safetensor);
    const infinityBuf = createInfinityUniformBuf(device);

    const layouts=[device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]})]

    const buf_0 = createEmptyBuf(device, 1536);;
    const input0 = createEmptyBuf(device, 1728);;
    const buf_1 = createWeightBuf(device, 20, getTensorBuffer(safetensor, metadata['chroma_kernel']));
    const buf_2 = createEmptyBuf(device, 128);;
    const output0 = createEmptyBuf(device, 1536);;

    const gpuWriteBuffer0 = device.createBuffer({size:input0.size, usage: GPUBufferUsage.COPY_SRC | GPUBufferUsage.MAP_WRITE });

    const gpuReadBuffer0 = device.createBuffer({size:output0.size, usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ });

    const kernels = [r_3_2_4_16_5, r_32_12, E_32_3_4];
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
        addComputePass(device, commandEncoder, pipelines[0], layouts[0], infinityBuf, [buf_0, input0, buf_1], [2, 3, 1]);
        addComputePass(device, commandEncoder, pipelines[1], layouts[1], infinityBuf, [buf_2, buf_0], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[2], layouts[2], infinityBuf, [output0, buf_2, buf_0], [1, 1, 1]);
        commandEncoder.copyBufferToBuffer(output0, 0, gpuReadBuffer0, 0, output0.size);
        const gpuCommands = commandEncoder.finish();
        device.queue.submit([gpuCommands]);

        await gpuReadBuffer0.mapAsync(GPUMapMode.READ);
        const resultBuffer0 = new Float32Array(gpuReadBuffer0.size/4);
        resultBuffer0.set(new Float32Array(gpuReadBuffer0.getMappedRange()));
        gpuReadBuffer0.unmap();
        return [resultBuffer0];
    }
}
const load = async (device, weight_path) => { return await fetch(weight_path).then(x => x.arrayBuffer()).then(x => setupNet(device, new Uint8Array(x))); }
return { load, setupNet };
})();
export default chrf;
