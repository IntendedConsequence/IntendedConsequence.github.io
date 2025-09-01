
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

const E_30025_4_4 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_480400:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1_480000:array<f32>;
@compute @workgroup_size(4) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 30025 */
  var lidx0 = i32(lindex.x); /* 4 */
  var precast0 = gidx0;
  var precast1 = lidx0;
  var cast0 = bitcast<u32>(precast0);
  var alu0 = ((gidx0*-16)+(lidx0*-4));
  var precast2 = (cast0<<2u);
  var alu1 = (lidx0+bitcast<i32>(precast2));
  var precast3 = (cast0<<4u);
  var precast4 = (bitcast<u32>(precast1)<<2u);
  var alu2 = (bitcast<i32>(precast3)+bitcast<i32>(precast4));
  var alu3 = (alu1<50);
  var val0 = select(0.0f, data1_480000[(alu0+197)], alu3);
  var val1 = select(0.0f, data1_480000[(alu0+198)], alu3);
  var val2 = select(0.0f, data1_480000[(alu0+199)], alu3);
  var val3 = select(0.0f, data1_480000[(alu0+200)], alu3);
  var alu4 = (120049<alu1);
  var val4 = select(0.0f, data1_480000[(alu0+960195)], alu4);
  var val5 = select(0.0f, data1_480000[(alu0+960196)], alu4);
  var val6 = select(0.0f, data1_480000[(alu0+960197)], alu4);
  var val7 = select(0.0f, data1_480000[(alu0+960198)], alu4);
  var alu5 = ((49<alu1)&(alu1<120050));
  var val8 = select(0.0f, data1_480000[(alu2+-200)], alu5);
  var val9 = select(0.0f, data1_480000[(alu2+-199)], alu5);
  var val10 = select(0.0f, data1_480000[(alu2+-198)], alu5);
  var val11 = select(0.0f, data1_480000[(alu2+-197)], alu5);
  data0_480400[(alu2+3)] = (val0+val11+val4);
  data0_480400[(alu2+2)] = (val1+val10+val5);
  data0_480400[(alu2+1)] = (val2+val9+val6);
  data0_480400[alu2] = (val3+val8+val7);
}`;

const r_67_3001_2_3_100_4 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_1206402:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1_480400:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2_160800:array<f32>;
@compute @workgroup_size(2) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var acc0: array<f32,3>;
  var gidx0 = i32(gindex.x); /* 3001 */
  var gidx1 = i32(gindex.y); /* 67 */
  var lidx0 = i32(lindex.x); /* 2 */
  acc0[0] = 0.0f;
  acc0[1] = 0.0f;
  acc0[2] = 0.0f;
  for (var ridx1004 = 0; ridx1004 < 100; ridx1004++) {
    var precast0 = ridx1004;
    var precast1 = (bitcast<u32>(precast0)<<2u);
    var cast0 = bitcast<i32>(precast1);
    var alu3 = ((gidx1*2400)+(lidx0*1200)+cast0);
    var val0 = data2_160800[alu3];
    var val1 = data2_160800[(alu3+1)];
    var val2 = data2_160800[(alu3+2)];
    var val3 = data2_160800[(alu3+3)];
    var val4 = data2_160800[(alu3+400)];
    var val5 = data2_160800[(alu3+401)];
    var val6 = data2_160800[(alu3+402)];
    var val7 = data2_160800[(alu3+403)];
    var val8 = data2_160800[(alu3+800)];
    var val9 = data2_160800[(alu3+801)];
    var val10 = data2_160800[(alu3+802)];
    var val11 = data2_160800[(alu3+803)];
    var alu4 = ((gidx0*160)+cast0);
    var val12 = data1_480400[alu4];
    var val13 = data1_480400[(alu4+1)];
    var val14 = data1_480400[(alu4+2)];
    var val15 = data1_480400[(alu4+3)];
    acc0[1] = (acc0[1]+(val12*val4)+(val13*val5)+(val14*val6)+(val15*val7));
    acc0[2] = (acc0[2]+(val12*val8)+(val13*val9)+(val14*val10)+(val15*val11));
    acc0[0] = (acc0[0]+(val12*val0)+(val13*val1)+(val14*val2)+(val15*val3));
  }
  var alu9 = (gidx0+(gidx1*18006)+(lidx0*9003));
  data0_1206402[alu9] = acc0[0];
  data0_1206402[(alu9+3001)] = acc0[1];
  data0_1206402[(alu9+6002)] = acc0[2];
}`;

const E_67_125_3_8_3 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_603000:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1_1206402:array<f32>;
@compute @workgroup_size(3,8) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 125 */
  var gidx1 = i32(gindex.y); /* 67 */
  var lidx0 = i32(lindex.x); /* 3 */
  var lidx1 = i32(lindex.y); /* 8 */
  var alu0 = (gidx0*24);
  var alu1 = (lidx1*3);
  var alu2 = (alu0+(gidx1*9003)+(lidx0*3001)+alu1);
  var val0 = data1_1206402[alu2];
  var val1 = data1_1206402[(alu2+1)];
  var val2 = data1_1206402[(alu2+2)];
  var val3 = data1_1206402[(alu2+603201)];
  var val4 = data1_1206402[(alu2+603202)];
  var val5 = data1_1206402[(alu2+603203)];
  var alu3 = (alu0+(gidx1*9000)+(lidx0*3000)+alu1);
  var alu4 = sqrt(((val1*val1)+(val4*val4)));
  data0_603000[(alu3+1)] = (alu4*alu4);
  var alu6 = sqrt(((val2*val2)+(val5*val5)));
  data0_603000[(alu3+2)] = (alu6*alu6);
  var alu8 = sqrt(((val0*val0)+(val3*val3)));
  data0_603000[alu3] = (alu8*alu8);
}`;

const r_5_125_4_8_3_4_201 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_240000:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1_16080:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2_603000:array<f32>;
@compute @workgroup_size(4,8) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var acc0: array<f32,12>;
  var gidx0 = i32(gindex.x); /* 125 */
  var gidx1 = i32(gindex.y); /* 5 */
  var lidx0 = i32(lindex.x); /* 4 */
  var lidx1 = i32(lindex.y); /* 8 */
  var alu0 = (lidx1*3);
  var alu1 = (gidx0*24);
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
  for (var ridx1006 = 0; ridx1006 < 201; ridx1006++) {
    var alu14 = ((gidx1*3216)+(lidx0*804)+ridx1006);
    var val0 = data1_16080[alu14];
    var val1 = data1_16080[(alu14+201)];
    var val2 = data1_16080[(alu14+402)];
    var val3 = data1_16080[(alu14+603)];
    var alu15 = (alu1+alu0+(ridx1006*3000));
    var val4 = data2_603000[alu15];
    var val5 = data2_603000[(alu15+1)];
    var val6 = data2_603000[(alu15+2)];
    acc0[5] = (acc0[5]+(val1*val5));
    acc0[9] = (acc0[9]+(val1*val6));
    acc0[1] = (acc0[1]+(val1*val4));
    acc0[6] = (acc0[6]+(val2*val5));
    acc0[10] = (acc0[10]+(val2*val6));
    acc0[2] = (acc0[2]+(val2*val4));
    acc0[7] = (acc0[7]+(val3*val5));
    acc0[11] = (acc0[11]+(val3*val6));
    acc0[3] = (acc0[3]+(val3*val4));
    acc0[4] = (acc0[4]+(val0*val5));
    acc0[8] = (acc0[8]+(val0*val6));
    acc0[0] = (acc0[0]+(val0*val4));
  }
  var alu29 = (alu1+(gidx1*48000)+(lidx0*12000)+alu0);
  var alu30 = select(acc0[0],1e-10f,(acc0[0]<1e-10f));
  data0_240000[alu29] = (log2(alu30)*0.30102999566398114f);
  var alu32 = select(acc0[1],1e-10f,(acc0[1]<1e-10f));
  data0_240000[(alu29+3000)] = (log2(alu32)*0.30102999566398114f);
  var alu34 = select(acc0[2],1e-10f,(acc0[2]<1e-10f));
  data0_240000[(alu29+6000)] = (log2(alu34)*0.30102999566398114f);
  var alu36 = select(acc0[3],1e-10f,(acc0[3]<1e-10f));
  data0_240000[(alu29+9000)] = (log2(alu36)*0.30102999566398114f);
  var alu38 = select(acc0[4],1e-10f,(acc0[4]<1e-10f));
  data0_240000[(alu29+1)] = (log2(alu38)*0.30102999566398114f);
  var alu40 = select(acc0[5],1e-10f,(acc0[5]<1e-10f));
  data0_240000[(alu29+3001)] = (log2(alu40)*0.30102999566398114f);
  var alu42 = select(acc0[6],1e-10f,(acc0[6]<1e-10f));
  data0_240000[(alu29+6001)] = (log2(alu42)*0.30102999566398114f);
  var alu44 = select(acc0[7],1e-10f,(acc0[7]<1e-10f));
  data0_240000[(alu29+9001)] = (log2(alu44)*0.30102999566398114f);
  var alu46 = select(acc0[8],1e-10f,(acc0[8]<1e-10f));
  data0_240000[(alu29+2)] = (log2(alu46)*0.30102999566398114f);
  var alu48 = select(acc0[9],1e-10f,(acc0[9]<1e-10f));
  data0_240000[(alu29+3002)] = (log2(alu48)*0.30102999566398114f);
  var alu50 = select(acc0[10],1e-10f,(acc0[10]<1e-10f));
  data0_240000[(alu29+6002)] = (log2(alu50)*0.30102999566398114f);
  var alu52 = select(acc0[11],1e-10f,(acc0[11]<1e-10f));
  data0_240000[(alu29+9002)] = (log2(alu52)*0.30102999566398114f);
}`;

const r_5_16_750_4 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_80:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1_240000:array<f32>;
@compute @workgroup_size(16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var acc0: array<f32,1>;
  var gidx0 = i32(gindex.x); /* 5 */
  var lidx0 = i32(lindex.x); /* 16 */
  acc0[0] = (f32(-INFINITY));
  for (var ridx1002 = 0; ridx1002 < 750; ridx1002++) {
    var precast0 = ridx1002;
    var precast1 = (bitcast<u32>(precast0)<<2u);
    var alu1 = ((gidx0*48000)+(lidx0*3000)+bitcast<i32>(precast1));
    var val0 = data1_240000[alu1];
    var val1 = data1_240000[(alu1+1)];
    var val2 = data1_240000[(alu1+2)];
    var val3 = data1_240000[(alu1+3)];
    var alu2 = select(acc0[0],val0,(acc0[0]<val0));
    var alu3 = select(alu2,val1,(alu2<val1));
    var alu4 = select(alu3,val2,(alu3<val2));
    var alu5 = select(alu4,val3,(alu4<val3));
    acc0[0] = alu5;
  }
  var precast2 = gidx0;
  var precast3 = (bitcast<u32>(precast2)<<4u);
  data0_80[(lidx0+bitcast<i32>(precast3))] = acc0[0];
}`;

const r_16_5 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
var<workgroup> temp0: array<f32,16>;
@group(0) @binding(1)var<storage,read_write>data0_1:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1_80:array<f32>;
@compute @workgroup_size(16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var acc0: array<f32,1>;
  var acc1: array<f32,1>;
  var lidx0 = i32(lindex.x); /* 16 */
  acc1[0] = (f32(-INFINITY));
  acc0[0] = (f32(-INFINITY));
  for (var ridx1001 = 0; ridx1001 < 5; ridx1001++) {
    var val0 = data1_80[((lidx0*5)+ridx1001)];
    var alu2 = select(acc0[0],val0,(acc0[0]<val0));
    acc0[0] = alu2;
  }
  temp0[lidx0] = acc0[0];
  workgroupBarrier();
  if (((bool(lidx0))!=true)) {
    for (var ridx1100 = 0; ridx1100 < 16; ridx1100++) {
      var val1 = temp0[ridx1100];
      var alu8 = select(acc1[0],val1,(acc1[0]<val1));
      acc1[0] = alu8;
    }
    data0_1[0] = (acc1[0]+-8.0f);
  }
}`;

const E_2500_32_3 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_240000:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1_240000:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2_1:array<f32>;
@compute @workgroup_size(32) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 2500 */
  var lidx0 = i32(lindex.x); /* 32 */
  var val0 = data2_1[0];
  var alu0 = ((gidx0*96)+(lidx0*3));
  var val1 = data1_240000[alu0];
  var alu1 = (alu0+1);
  var val2 = data1_240000[alu1];
  var alu2 = (alu0+2);
  var val3 = data1_240000[alu2];
  var alu3 = select(val2,val0,(val2<val0));
  data0_240000[alu1] = ((alu3+4.0f)*0.25f);
  var alu5 = select(val3,val0,(val3<val0));
  data0_240000[alu2] = ((alu5+4.0f)*0.25f);
  var alu7 = select(val1,val0,(val1<val0));
  data0_240000[alu0] = ((alu7+4.0f)*0.25f);
}`;

const setupNet = async (device, safetensor) => {
    const metadata = getTensorMetadata(safetensor);
    const infinityBuf = createInfinityUniformBuf(device);

    const layouts=[device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]})]

    const buf_0 = createEmptyBuf(device, 1921600);;
    const input0 = createEmptyBuf(device, 1920000);;
    const buf_1 = createEmptyBuf(device, 4825608);;
    const buf_2 = createWeightBuf(device, 643200, getTensorBuffer(safetensor, metadata['forward_basis_buffers']));
    const buf_3 = createEmptyBuf(device, 2412000);;
    const buf_4 = createEmptyBuf(device, 960000);;
    const buf_5 = createWeightBuf(device, 64320, getTensorBuffer(safetensor, metadata['mel']));
    const buf_6 = createEmptyBuf(device, 320);;
    const buf_7 = createEmptyBuf(device, 4);;
    const output0 = createEmptyBuf(device, 960000);;

    const gpuWriteBuffer0 = device.createBuffer({size:input0.size, usage: GPUBufferUsage.COPY_SRC | GPUBufferUsage.MAP_WRITE });

    const gpuReadBuffer0 = device.createBuffer({size:output0.size, usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ });

    const kernels = [E_30025_4_4, r_67_3001_2_3_100_4, E_67_125_3_8_3, r_5_125_4_8_3_4_201, r_5_16_750_4, r_16_5, E_2500_32_3];
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
        addComputePass(device, commandEncoder, pipelines[0], layouts[0], infinityBuf, [buf_0, input0], [30025, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[1], layouts[1], infinityBuf, [buf_1, buf_0, buf_2], [3001, 67, 1]);
        addComputePass(device, commandEncoder, pipelines[2], layouts[2], infinityBuf, [buf_3, buf_1], [125, 67, 1]);
        addComputePass(device, commandEncoder, pipelines[3], layouts[3], infinityBuf, [buf_4, buf_5, buf_3], [125, 5, 1]);
        addComputePass(device, commandEncoder, pipelines[4], layouts[4], infinityBuf, [buf_6, buf_4], [5, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[5], layouts[5], infinityBuf, [buf_7, buf_6], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[6], layouts[6], infinityBuf, [output0, buf_4, buf_7], [2500, 1, 1]);
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
