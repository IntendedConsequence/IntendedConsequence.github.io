
const mel = (() => {
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

const r_67_3001_2_100_3_4 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
@compute @workgroup_size(2) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 3001 */
  var gidx1 = i32(gindex.y); /* 67 */
  var lidx0 = i32(lindex.x); /* 2 */
  var acc0 = 0.0f;
  var acc1 = 0.0f;
  var acc2 = 0.0f;
  for (var ridx3 = 0; ridx3 < 100; ridx3++) {
    var precast0 = ridx3;
    var alu0 = ((gidx0*40)+ridx3);
    var precast1 = (bitcast<u32>(precast0)<<2u);
    var cast0 = bitcast<i32>(precast1);
    var alu1 = ((gidx1*2400)+(lidx0*1200)+cast0);
    var val0 = data2[alu1];
    var val1 = data2[(alu1+1)];
    var val2 = data2[(alu1+2)];
    var val3 = data2[(alu1+3)];
    var val4 = data2[(alu1+400)];
    var val5 = data2[(alu1+401)];
    var val6 = data2[(alu1+402)];
    var val7 = data2[(alu1+403)];
    var val8 = data2[(alu1+800)];
    var val9 = data2[(alu1+801)];
    var val10 = data2[(alu1+802)];
    var val11 = data2[(alu1+803)];
    var alu2 = ((gidx0*160)+cast0);
    var alu3 = (((alu0<50)!=true)&(alu0<120050));
    var val12 = select(0.0f, data1[(alu2+-200)], alu3);
    var val13 = select(0.0f, data1[(alu2+-199)], alu3);
    var val14 = select(0.0f, data1[(alu2+-198)], alu3);
    var val15 = select(0.0f, data1[(alu2+-197)], alu3);
    acc0 = (acc0+(val12*val0)+(val13*val1)+(val14*val2)+(val15*val3));
    acc1 = (acc1+(val12*val4)+(val13*val5)+(val14*val6)+(val15*val7));
    acc2 = (acc2+(val12*val8)+(val13*val9)+(val14*val10)+(val15*val11));
  }
  var alu8 = (gidx0+(gidx1*18006)+(lidx0*9003));
  data0[alu8] = acc0;
  data0[(alu8+3001)] = acc1;
  data0[(alu8+6002)] = acc2;
}`;

const E_67_125_3_8_3 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@compute @workgroup_size(3,8) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 125 */
  var gidx1 = i32(gindex.y); /* 67 */
  var lidx0 = i32(lindex.x); /* 3 */
  var lidx1 = i32(lindex.y); /* 8 */
  var alu0 = (gidx0*24);
  var alu1 = (lidx1*3);
  var alu2 = (alu0+(gidx1*9003)+(lidx0*3001)+alu1);
  var val0 = data1[alu2];
  var val1 = data1[(alu2+1)];
  var val2 = data1[(alu2+2)];
  var val3 = data1[(alu2+603201)];
  var val4 = data1[(alu2+603202)];
  var val5 = data1[(alu2+603203)];
  var alu3 = (alu0+(gidx1*9000)+(lidx0*3000)+alu1);
  var alu4 = sqrt(((val1*val1)+(val4*val4)));
  data0[(alu3+1)] = (alu4*alu4);
  var alu6 = sqrt(((val2*val2)+(val5*val5)));
  data0[(alu3+2)] = (alu6*alu6);
  var alu8 = sqrt(((val0*val0)+(val3*val3)));
  data0[alu3] = (alu8*alu8);
}`;

const r_5_125_4_8_201_3_4 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
@compute @workgroup_size(4,8) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 125 */
  var gidx1 = i32(gindex.y); /* 5 */
  var lidx0 = i32(lindex.x); /* 4 */
  var lidx1 = i32(lindex.y); /* 8 */
  var alu0 = (lidx1*3);
  var alu1 = (gidx0*24);
  var acc0 = 0.0f;
  var acc1 = 0.0f;
  var acc2 = 0.0f;
  var acc3 = 0.0f;
  var acc4 = 0.0f;
  var acc5 = 0.0f;
  var acc6 = 0.0f;
  var acc7 = 0.0f;
  var acc8 = 0.0f;
  var acc9 = 0.0f;
  var acc10 = 0.0f;
  var acc11 = 0.0f;
  for (var ridx4 = 0; ridx4 < 201; ridx4++) {
    var alu2 = ((gidx1*3216)+(lidx0*804)+ridx4);
    var val0 = data1[alu2];
    var val1 = data1[(alu2+201)];
    var val2 = data1[(alu2+402)];
    var val3 = data1[(alu2+603)];
    var alu3 = (alu1+alu0+(ridx4*3000));
    var val4 = data2[alu3];
    var val5 = data2[(alu3+1)];
    var val6 = data2[(alu3+2)];
    acc5 = (acc5+(val1*val5));
    acc9 = (acc9+(val1*val6));
    acc1 = (acc1+(val1*val4));
    acc6 = (acc6+(val2*val5));
    acc10 = (acc10+(val2*val6));
    acc2 = (acc2+(val2*val4));
    acc7 = (acc7+(val3*val5));
    acc11 = (acc11+(val3*val6));
    acc3 = (acc3+(val3*val4));
    acc4 = (acc4+(val0*val5));
    acc8 = (acc8+(val0*val6));
    acc0 = (acc0+(val0*val4));
  }
  var alu17 = (alu1+(gidx1*48000)+(lidx0*12000)+alu0);
  var alu18 = select(acc0,1e-10f,(acc0<1e-10f));
  data0[alu17] = (log2(alu18)*0.30102999566398114f);
  var alu20 = select(acc1,1e-10f,(acc1<1e-10f));
  data0[(alu17+3000)] = (log2(alu20)*0.30102999566398114f);
  var alu22 = select(acc2,1e-10f,(acc2<1e-10f));
  data0[(alu17+6000)] = (log2(alu22)*0.30102999566398114f);
  var alu24 = select(acc3,1e-10f,(acc3<1e-10f));
  data0[(alu17+9000)] = (log2(alu24)*0.30102999566398114f);
  var alu26 = select(acc4,1e-10f,(acc4<1e-10f));
  data0[(alu17+1)] = (log2(alu26)*0.30102999566398114f);
  var alu28 = select(acc5,1e-10f,(acc5<1e-10f));
  data0[(alu17+3001)] = (log2(alu28)*0.30102999566398114f);
  var alu30 = select(acc6,1e-10f,(acc6<1e-10f));
  data0[(alu17+6001)] = (log2(alu30)*0.30102999566398114f);
  var alu32 = select(acc7,1e-10f,(acc7<1e-10f));
  data0[(alu17+9001)] = (log2(alu32)*0.30102999566398114f);
  var alu34 = select(acc8,1e-10f,(acc8<1e-10f));
  data0[(alu17+2)] = (log2(alu34)*0.30102999566398114f);
  var alu36 = select(acc9,1e-10f,(acc9<1e-10f));
  data0[(alu17+3002)] = (log2(alu36)*0.30102999566398114f);
  var alu38 = select(acc10,1e-10f,(acc10<1e-10f));
  data0[(alu17+6002)] = (log2(alu38)*0.30102999566398114f);
  var alu40 = select(acc11,1e-10f,(acc11<1e-10f));
  data0[(alu17+9002)] = (log2(alu40)*0.30102999566398114f);
}`;

const r_5_16_750_4 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@compute @workgroup_size(16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 5 */
  var lidx0 = i32(lindex.x); /* 16 */
  var acc0 = (f32(-INFINITY));
  for (var ridx2 = 0; ridx2 < 750; ridx2++) {
    var precast0 = ridx2;
    var precast1 = (bitcast<u32>(precast0)<<2u);
    var alu0 = ((gidx0*48000)+(lidx0*3000)+bitcast<i32>(precast1));
    var val0 = data1[alu0];
    var val1 = data1[(alu0+1)];
    var val2 = data1[(alu0+2)];
    var val3 = data1[(alu0+3)];
    var alu1 = select(acc0,val0,(acc0<val0));
    var alu2 = select(alu1,val1,(alu1<val1));
    var alu3 = select(alu2,val2,(alu2<val2));
    var alu4 = select(alu3,val3,(alu3<val3));
    acc0 = alu4;
  }
  var precast2 = gidx0;
  var precast3 = (bitcast<u32>(precast2)<<4u);
  data0[(lidx0+bitcast<i32>(precast3))] = acc0;
}`;

const r_16_5 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
var<workgroup> temp0: array<f32,16>;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@compute @workgroup_size(16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var lidx0 = i32(lindex.x); /* 16 */
  var acc0 = (f32(-INFINITY));
  for (var ridx1 = 0; ridx1 < 5; ridx1++) {
    var val0 = data1[((lidx0*5)+ridx1)];
    var alu0 = select(acc0,val0,(acc0<val0));
    acc0 = alu0;
  }
  temp0[lidx0] = acc0;
  workgroupBarrier();
  if (((bool(lidx0))!=true)) {
    var acc1 = (f32(-INFINITY));
    for (var ridx1000 = 0; ridx1000 < 16; ridx1000++) {
      var val1 = temp0[ridx1000];
      var alu6 = select(acc1,val1,(acc1<val1));
      acc1 = alu6;
    }
    data0[0] = (acc1+-8.0f);
  }
}`;

const E_2500_32_3 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
@compute @workgroup_size(32) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 2500 */
  var lidx0 = i32(lindex.x); /* 32 */
  var val0 = data2[0];
  var alu0 = ((gidx0*96)+(lidx0*3));
  var val1 = data1[alu0];
  var alu1 = (alu0+1);
  var val2 = data1[alu1];
  var alu2 = (alu0+2);
  var val3 = data1[alu2];
  var alu3 = select(val2,val0,(val2<val0));
  data0[alu1] = ((alu3+4.0f)*0.25f);
  var alu5 = select(val3,val0,(val3<val0));
  data0[alu2] = ((alu5+4.0f)*0.25f);
  var alu7 = select(val1,val0,(val1<val0));
  data0[alu0] = ((alu7+4.0f)*0.25f);
}`;

const setupNet = async (device, safetensor) => {
    const metadata = getTensorMetadata(safetensor);
    const infinityBuf = createInfinityUniformBuf(device);

    const layouts=[device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]})]

    const buf_0 = createEmptyBuf(device, 4825608);;
    const input0 = createEmptyBuf(device, 1920000);;
    const buf_1 = createWeightBuf(device, 643200, getTensorBuffer(safetensor, metadata['forward_basis_buffers']));
    const buf_2 = createEmptyBuf(device, 2412000);;
    const buf_3 = createEmptyBuf(device, 960000);;
    const buf_4 = createWeightBuf(device, 64320, getTensorBuffer(safetensor, metadata['mel']));
    const buf_5 = createEmptyBuf(device, 320);;
    const buf_6 = createEmptyBuf(device, 4);;
    const output0 = createEmptyBuf(device, 960000);;

    const gpuWriteBuffer0 = device.createBuffer({size:input0.size, usage: GPUBufferUsage.COPY_SRC | GPUBufferUsage.MAP_WRITE });

    const gpuReadBuffer0 = device.createBuffer({size:output0.size, usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ });

    const kernels = [r_67_3001_2_100_3_4, E_67_125_3_8_3, r_5_125_4_8_201_3_4, r_5_16_750_4, r_16_5, E_2500_32_3];
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
        addComputePass(device, commandEncoder, pipelines[0], layouts[0], infinityBuf, [buf_0, input0, buf_1], [3001, 67, 1]);
        addComputePass(device, commandEncoder, pipelines[1], layouts[1], infinityBuf, [buf_2, buf_0], [125, 67, 1]);
        addComputePass(device, commandEncoder, pipelines[2], layouts[2], infinityBuf, [buf_3, buf_4, buf_2], [125, 5, 1]);
        addComputePass(device, commandEncoder, pipelines[3], layouts[3], infinityBuf, [buf_5, buf_3], [5, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[4], layouts[4], infinityBuf, [buf_6, buf_5], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[5], layouts[5], infinityBuf, [output0, buf_3, buf_6], [2500, 1, 1]);
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
export default mel;
