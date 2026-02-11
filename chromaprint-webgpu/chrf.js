
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

const r_3_4_5 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_12:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1_60:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2_5:array<f32>;
@compute @workgroup_size(4) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 3 */
  var lidx0 = i32(lindex.x); /* 4 */
  var alu0 = (lidx0+bitcast<i32>((bitcast<u32>(gidx0)<<2u)));
  var val0 = data1_60[alu0];
  var val1 = data2_5[0];
  var val2 = data1_60[(alu0+12)];
  var val3 = data2_5[1];
  var val4 = data1_60[(alu0+24)];
  var val5 = data2_5[2];
  var val6 = data1_60[(alu0+36)];
  var val7 = data2_5[3];
  var val8 = data1_60[(alu0+48)];
  var val9 = data2_5[4];
  data0_12[alu0] = ((val0*val1)+(val2*val3)+(val4*val5)+(val6*val7)+(val8*val9));
}`;

const r_12 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_1:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1_12:array<f32>;
@compute @workgroup_size(1) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var val0 = data1_12[0];
  var val1 = data1_12[1];
  var val2 = data1_12[2];
  var val3 = data1_12[3];
  var val4 = data1_12[4];
  var val5 = data1_12[5];
  var val6 = data1_12[6];
  var val7 = data1_12[7];
  var val8 = data1_12[8];
  var val9 = data1_12[9];
  var val10 = data1_12[10];
  var val11 = data1_12[11];
  data0_1[0] = sqrt(((val0*val0)+(val1*val1)+(val2*val2)+(val3*val3)+(val4*val4)+(val5*val5)+(val6*val6)+(val7*val7)+(val8*val8)+(val9*val9)+(val10*val10)+(val11*val11)));
}`;

const E_3_4n8 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_12:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1_1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2_12:array<f32>;
@compute @workgroup_size(3) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var val0 = data1_1[0];
  var lidx0 = i32(lindex.x); /* 3 */
  var cast0 = bitcast<i32>((bitcast<u32>(lidx0)<<2u));
  var val1 = data2_12[cast0];
  var alu0 = (cast0+1);
  var val2 = data2_12[alu0];
  var alu1 = (cast0+2);
  var val3 = data2_12[alu1];
  var alu2 = (cast0+3);
  var val4 = data2_12[alu2];
  var alu3 = (1/val0);
  var alu4 = (val0<0.01f);
  var alu5 = select((val1*alu3),0.0f,alu4);
  var alu6 = select((val2*alu3),0.0f,alu4);
  var alu7 = select((val3*alu3),0.0f,alu4);
  var alu8 = select((val4*alu3),0.0f,alu4);
  data0_12[cast0] = alu5;
  data0_12[alu0] = alu6;
  data0_12[alu1] = alu7;
  data0_12[alu2] = alu8;
}`;

const setupNet = async (device, safetensor) => {
    const metadata = getTensorMetadata(safetensor);
    const infinityBuf = createInfinityUniformBuf(device);

    const layouts=[device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]})]

    const buf_0 = createEmptyBuf(device, 48);;
    const input0 = createEmptyBuf(device, 240);;
    const buf_1 = createWeightBuf(device, 20, getTensorBuffer(safetensor, metadata['chroma_kernel']));
    const buf_2 = createEmptyBuf(device, 4);;
    const output0 = createEmptyBuf(device, 48);;

    const gpuWriteBuffer0 = device.createBuffer({size:input0.size, usage: GPUBufferUsage.COPY_SRC | GPUBufferUsage.MAP_WRITE });

    const gpuReadBuffer0 = device.createBuffer({size:output0.size, usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ });

    const kernels = [r_3_4_5, r_12, E_3_4n8];
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
        addComputePass(device, commandEncoder, pipelines[0], layouts[0], infinityBuf, [buf_0, input0, buf_1], [3, 1, 1]);
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
