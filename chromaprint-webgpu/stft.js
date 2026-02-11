
const stft = (() => {
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

const E_649_64_4_16_4n4 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_10633216:array<f32>;
@group(0) @binding(2)var<uniform>is_zero:i32;
@compute @workgroup_size(4,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 64 */
  var gidx1 = i32(gindex.y); /* 649 */
  var lidx0 = i32(lindex.x); /* 4 */
  var lidx1 = i32(lindex.y); /* 16 */
  var cast0 = bitcast<u32>(gidx1);
  var alu0 = (lidx0+bitcast<i32>((cast0<<2u)));
  var alu1 = (bitcast<i32>((bitcast<u32>(gidx0)<<6u))+bitcast<i32>((bitcast<u32>(lidx1)<<2u)));
  var alu2 = (alu1+bitcast<i32>((cast0<<14u))+bitcast<i32>((bitcast<u32>(lidx0)<<12u)));
  var alu3 = (alu0<(is_zero*2596));
  var val0 = select(0.0f, data0_10633216[alu2], alu3);
  var alu4 = (alu2+1);
  var val1 = select(0.0f, data0_10633216[alu4], alu3);
  var alu5 = (alu2+2);
  var val2 = select(0.0f, data0_10633216[alu5], alu3);
  var alu6 = (alu2+3);
  var val3 = select(0.0f, data0_10633216[alu6], alu3);
  var cast1 = (f32(alu1));
  var cast2 = (f32((alu0+-1288)));
  var cast3 = (f32((alu0+10)));
  var cast4 = (f32((alu1+1)));
  var cast5 = (f32((alu1+2)));
  var cast6 = (f32((alu1+3)));
  var alu7 = (0.54f+(sin((1.5707963267948966f+(cast1*-0.0015339807878856412f)))*-0.46f));
  var alu8 = (0.54f+(sin((1.5707963267948966f+(cast4*-0.0015339807878856412f)))*-0.46f));
  var alu9 = (0.54f+(sin((1.5707963267948966f+(cast5*-0.0015339807878856412f)))*-0.46f));
  var alu10 = (0.54f+(sin((1.5707963267948966f+(cast6*-0.0015339807878856412f)))*-0.46f));
  var alu11 = (alu0<1298);
  var alu12 = select(0.0f,(alu7*sin((1.5707963267948966f+(cast3*cast1*-0.0015339807878856412f)))),alu11);
  var alu13 = select(-(sin((cast2*cast1*0.0015339807878856412f))*alu7),0.0f,alu11);
  var alu14 = select((alu12+alu13),0.0f,alu3);
  var alu15 = select(0.0f,(alu8*sin((1.5707963267948966f+(cast3*cast4*-0.0015339807878856412f)))),alu11);
  var alu16 = select(-(sin((cast2*cast4*0.0015339807878856412f))*alu8),0.0f,alu11);
  var alu17 = select((alu15+alu16),0.0f,alu3);
  var alu18 = select(0.0f,(alu9*sin((1.5707963267948966f+(cast3*cast5*-0.0015339807878856412f)))),alu11);
  var alu19 = select(-(sin((cast2*cast5*0.0015339807878856412f))*alu9),0.0f,alu11);
  var alu20 = select((alu18+alu19),0.0f,alu3);
  var alu21 = select(0.0f,(alu10*sin((1.5707963267948966f+(cast3*cast6*-0.0015339807878856412f)))),alu11);
  var alu22 = select(-(sin((cast2*cast6*0.0015339807878856412f))*alu10),0.0f,alu11);
  var alu23 = select((alu21+alu22),0.0f,alu3);
  data0_10633216[alu2] = (val0+alu14);
  data0_10633216[alu4] = (val1+alu17);
  data0_10633216[alu5] = (val2+alu20);
  data0_10633216[alu6] = (val3+alu23);
}`;

const r_649_4_4_1024_4 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_10384:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1_8191:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2_10633216:array<f32>;
@compute @workgroup_size(1) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var acc0: array<f32,16>;
  var gidx0 = i32(gindex.x); /* 649 */
  var cast0 = bitcast<u32>(gidx0);
  acc0[0] = 0.0f;
  acc0[1] = 0.0f;
  acc0[2] = 0.0f;
  acc0[3] = 0.0f;
  acc0[4] = 0.0f;
  acc0[5] = 0.0f;
  acc0[6] = 0.0f;
  acc0[7] = 0.0f;
  acc0[8] = 0.0f;
  acc0[9] = 0.0f;
  acc0[10] = 0.0f;
  acc0[11] = 0.0f;
  acc0[12] = 0.0f;
  acc0[13] = 0.0f;
  acc0[14] = 0.0f;
  acc0[15] = 0.0f;
  for (var Ridx0 = 0; Ridx0 < 1024; Ridx0++) {
    var cast1 = bitcast<i32>((bitcast<u32>(Ridx0)<<2u));
    var val0 = data1_8191[cast1];
    var alu16 = (bitcast<i32>((cast0<<14u))+cast1);
    var val1 = data2_10633216[alu16];
    var val2 = data1_8191[(cast1+1)];
    var val3 = data2_10633216[(alu16+1)];
    var val4 = data1_8191[(cast1+2)];
    var val5 = data2_10633216[(alu16+2)];
    var val6 = data1_8191[(cast1+3)];
    var val7 = data2_10633216[(alu16+3)];
    var val8 = data2_10633216[(alu16+4096)];
    var val9 = data2_10633216[(alu16+4097)];
    var val10 = data2_10633216[(alu16+4098)];
    var val11 = data2_10633216[(alu16+4099)];
    var val12 = data2_10633216[(alu16+8192)];
    var val13 = data2_10633216[(alu16+8193)];
    var val14 = data2_10633216[(alu16+8194)];
    var val15 = data2_10633216[(alu16+8195)];
    var val16 = data2_10633216[(alu16+12288)];
    var val17 = data2_10633216[(alu16+12289)];
    var val18 = data2_10633216[(alu16+12290)];
    var val19 = data2_10633216[(alu16+12291)];
    var val20 = data1_8191[(cast1+1365)];
    var val21 = data1_8191[(cast1+1366)];
    var val22 = data1_8191[(cast1+1367)];
    var val23 = data1_8191[(cast1+1368)];
    var val24 = data1_8191[(cast1+2730)];
    var val25 = data1_8191[(cast1+2731)];
    var val26 = data1_8191[(cast1+2732)];
    var val27 = data1_8191[(cast1+2733)];
    var val28 = data1_8191[(cast1+4095)];
    var val29 = data1_8191[(cast1+4096)];
    var val30 = data1_8191[(cast1+4097)];
    var val31 = data1_8191[(cast1+4098)];
    acc0[0] = (acc0[0]+(val0*val1)+(val2*val3)+(val4*val5)+(val6*val7));
    acc0[1] = (acc0[1]+(val0*val8)+(val2*val9)+(val4*val10)+(val6*val11));
    acc0[2] = (acc0[2]+(val0*val12)+(val2*val13)+(val4*val14)+(val6*val15));
    acc0[3] = (acc0[3]+(val0*val16)+(val2*val17)+(val4*val18)+(val6*val19));
    acc0[4] = (acc0[4]+(val20*val1)+(val21*val3)+(val22*val5)+(val23*val7));
    acc0[5] = (acc0[5]+(val20*val8)+(val21*val9)+(val22*val10)+(val23*val11));
    acc0[6] = (acc0[6]+(val20*val12)+(val21*val13)+(val22*val14)+(val23*val15));
    acc0[7] = (acc0[7]+(val20*val16)+(val21*val17)+(val22*val18)+(val23*val19));
    acc0[8] = (acc0[8]+(val24*val1)+(val25*val3)+(val26*val5)+(val27*val7));
    acc0[9] = (acc0[9]+(val24*val8)+(val25*val9)+(val26*val10)+(val27*val11));
    acc0[10] = (acc0[10]+(val24*val12)+(val25*val13)+(val26*val14)+(val27*val15));
    acc0[11] = (acc0[11]+(val24*val16)+(val25*val17)+(val26*val18)+(val27*val19));
    acc0[12] = (acc0[12]+(val28*val1)+(val29*val3)+(val30*val5)+(val31*val7));
    acc0[13] = (acc0[13]+(val28*val8)+(val29*val9)+(val30*val10)+(val31*val11));
    acc0[14] = (acc0[14]+(val28*val12)+(val29*val13)+(val30*val14)+(val31*val15));
    acc0[15] = (acc0[15]+(val28*val16)+(val29*val17)+(val30*val18)+(val31*val19));
  }
  var cast2 = bitcast<i32>((cast0<<4u));
  data0_10384[cast2] = acc0[0];
  data0_10384[(cast2+1)] = acc0[4];
  data0_10384[(cast2+2)] = acc0[8];
  data0_10384[(cast2+3)] = acc0[12];
  data0_10384[(cast2+4)] = acc0[1];
  data0_10384[(cast2+5)] = acc0[5];
  data0_10384[(cast2+6)] = acc0[9];
  data0_10384[(cast2+7)] = acc0[13];
  data0_10384[(cast2+8)] = acc0[2];
  data0_10384[(cast2+9)] = acc0[6];
  data0_10384[(cast2+10)] = acc0[10];
  data0_10384[(cast2+11)] = acc0[14];
  data0_10384[(cast2+12)] = acc0[3];
  data0_10384[(cast2+13)] = acc0[7];
  data0_10384[(cast2+14)] = acc0[11];
  data0_10384[(cast2+15)] = acc0[15];
}`;

const r_4_3_4_1298 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_48:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1_10384:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2_15576:array<f32>;
@compute @workgroup_size(4,3) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var acc0: array<f32,4>;
  var lidx0 = i32(lindex.x); /* 4 */
  var lidx1 = i32(lindex.y); /* 3 */
  var cast0 = bitcast<i32>((bitcast<u32>(lidx1)<<2u));
  acc0[0] = 0.0f;
  acc0[1] = 0.0f;
  acc0[2] = 0.0f;
  acc0[3] = 0.0f;
  for (var Ridx0 = 0; Ridx0 < 1298; Ridx0++) {
    var alu4 = (lidx0+bitcast<i32>((bitcast<u32>(Ridx0)<<2u)));
    var val0 = data1_10384[alu4];
    var val1 = data1_10384[(alu4+5192)];
    var alu5 = (cast0+(Ridx0*12));
    var val2 = data2_15576[alu5];
    var val3 = data2_15576[(alu5+1)];
    var val4 = data2_15576[(alu5+2)];
    var val5 = data2_15576[(alu5+3)];
    var alu6 = ((val0*val0)+(val1*val1));
    acc0[0] = (acc0[0]+(alu6*val2));
    acc0[1] = (acc0[1]+(alu6*val3));
    acc0[2] = (acc0[2]+(alu6*val4));
    acc0[3] = (acc0[3]+(alu6*val5));
  }
  var alu12 = ((lidx0*12)+cast0);
  data0_48[(alu12+1)] = acc0[1];
  data0_48[(alu12+2)] = acc0[2];
  data0_48[(alu12+3)] = acc0[3];
  data0_48[alu12] = acc0[0];
}`;

const setupNet = async (device, safetensor) => {
    const metadata = getTensorMetadata(safetensor);
    const infinityBuf = createInfinityUniformBuf(device);

    const layouts=[device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]})]

    const buf_0 = createWeightBuf(device, 42532864, getTensorBuffer(safetensor, metadata['stft.stft_basis_buffers']));
    const buf_1 = createEmptyBuf(device, 41536);;
    const input0 = createEmptyBuf(device, 32764);;
    const output0 = createEmptyBuf(device, 192);;
    const buf_2 = createWeightBuf(device, 62304, getTensorBuffer(safetensor, metadata['chroma.notes_project']));
    const is_zero = createUniformBuf(device, 4);;

    const gpuWriteBuffer0 = device.createBuffer({size:input0.size, usage: GPUBufferUsage.COPY_SRC | GPUBufferUsage.MAP_WRITE });
    const gpuWriteBuffer1 = device.createBuffer({size:is_zero.size, usage: GPUBufferUsage.COPY_SRC | GPUBufferUsage.MAP_WRITE });

    const gpuReadBuffer0 = device.createBuffer({size:output0.size, usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ });

    const kernels = [E_649_64_4_16_4n4, r_649_4_4_1024_4, r_4_3_4_1298];
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

    return async (_input0,_is_zero) => {
        const commandEncoder = device.createCommandEncoder();
        await gpuWriteBuffer0.mapAsync(GPUMapMode.WRITE);
        new Float32Array(gpuWriteBuffer0.getMappedRange()).set(_input0);
        gpuWriteBuffer0.unmap();
        commandEncoder.copyBufferToBuffer(gpuWriteBuffer0, 0, input0, 0, gpuWriteBuffer0.size);
    await gpuWriteBuffer1.mapAsync(GPUMapMode.WRITE);
        new Int32Array(gpuWriteBuffer1.getMappedRange()).set(_is_zero);
        gpuWriteBuffer1.unmap();
        commandEncoder.copyBufferToBuffer(gpuWriteBuffer1, 0, is_zero, 0, gpuWriteBuffer1.size);
        addComputePass(device, commandEncoder, pipelines[0], layouts[0], infinityBuf, [buf_0, is_zero], [64, 649, 1]);
        addComputePass(device, commandEncoder, pipelines[1], layouts[1], infinityBuf, [buf_1, input0, buf_0], [649, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[2], layouts[2], infinityBuf, [output0, buf_1, buf_2], [1, 1, 1]);
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
export default stft;
