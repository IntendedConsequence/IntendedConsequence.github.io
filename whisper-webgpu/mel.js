
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

const r_67_3001_2_3_100_4 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_1206402:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1_480000:array<f32>;
@compute @workgroup_size(2) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var acc0: array<f32,3>;
  var gidx0 = i32(gindex.x); /* 3001 */
  var gidx1 = i32(gindex.y); /* 67 */
  var lidx0 = i32(lindex.x); /* 2 */
  var alu0 = ((gidx1*6)+(lidx0*3));
  var cast0 = (f32((alu0+-201)));
  var cast1 = (f32((alu0+-200)));
  var cast2 = (f32((alu0+-199)));
  var cast3 = (f32((alu0+1)));
  var cast4 = (f32((alu0+2)));
  var cast5 = (f32(alu0));
  var alu1 = ((lidx0+bitcast<i32>((bitcast<u32>(gidx1)<<1u)))<67);
  acc0[0] = 0.0f;
  acc0[1] = 0.0f;
  acc0[2] = 0.0f;
  for (var Ridx0 = 0; Ridx0 < 100; Ridx0++) {
    var alu5 = ((gidx0*-160)+(Ridx0*-4));
    var alu6 = ((gidx0*40)+Ridx0);
    var alu7 = (alu6<50);
    var val0 = select(0.0f, data1_480000[(alu5+197)], alu7);
    var val1 = select(0.0f, data1_480000[(alu5+198)], alu7);
    var val2 = select(0.0f, data1_480000[(alu5+199)], alu7);
    var val3 = select(0.0f, data1_480000[(alu5+200)], alu7);
    var alu8 = (120049<alu6);
    var val4 = select(0.0f, data1_480000[(alu5+960195)], alu8);
    var val5 = select(0.0f, data1_480000[(alu5+960196)], alu8);
    var val6 = select(0.0f, data1_480000[(alu5+960197)], alu8);
    var val7 = select(0.0f, data1_480000[(alu5+960198)], alu8);
    var cast6 = bitcast<i32>((bitcast<u32>(Ridx0)<<2u));
    var alu9 = ((gidx0*160)+cast6);
    var alu10 = ((49<alu6)&(alu6<120050));
    var val8 = select(0.0f, data1_480000[(alu9+-200)], alu10);
    var val9 = select(0.0f, data1_480000[(alu9+-199)], alu10);
    var val10 = select(0.0f, data1_480000[(alu9+-198)], alu10);
    var val11 = select(0.0f, data1_480000[(alu9+-197)], alu10);
    var cast7 = (f32(cast6));
    var cast8 = (f32((cast6+1)));
    var cast9 = (f32((cast6+2)));
    var cast10 = (f32((cast6+3)));
    var alu11 = (val3+val8+val7);
    var alu12 = (1.0f-sin((1.5707963267948966f+(cast7*-0.015707963267948967f))));
    var alu13 = select(0.0f,(alu12*sin((1.5707963267948966f+(cast5*cast7*-0.015707963267948967f)))*0.5f),alu1);
    var alu14 = select((sin((cast0*cast7*0.015707963267948967f))*alu12*-0.5f),0.0f,alu1);
    var alu15 = select(0.0f,(alu12*sin((1.5707963267948966f+(cast3*cast7*-0.015707963267948967f)))*0.5f),alu1);
    var alu16 = select((sin((cast1*cast7*0.015707963267948967f))*alu12*-0.5f),0.0f,alu1);
    var alu17 = select(0.0f,(alu12*sin((1.5707963267948966f+(cast4*cast7*-0.015707963267948967f)))*0.5f),alu1);
    var alu18 = select((sin((cast2*cast7*0.015707963267948967f))*alu12*-0.5f),0.0f,alu1);
    var alu19 = (val0+val11+val4);
    var alu20 = (val2+val9+val6);
    var alu21 = (1.0f-sin((1.5707963267948966f+(cast8*-0.015707963267948967f))));
    var alu22 = select(0.0f,(alu21*sin((1.5707963267948966f+(cast5*cast8*-0.015707963267948967f)))*0.5f),alu1);
    var alu23 = select((sin((cast0*cast8*0.015707963267948967f))*alu21*-0.5f),0.0f,alu1);
    var alu24 = (val1+val10+val5);
    var alu25 = select(0.0f,(alu21*sin((1.5707963267948966f+(cast3*cast8*-0.015707963267948967f)))*0.5f),alu1);
    var alu26 = select((sin((cast1*cast8*0.015707963267948967f))*alu21*-0.5f),0.0f,alu1);
    var alu27 = select(0.0f,(alu21*sin((1.5707963267948966f+(cast4*cast8*-0.015707963267948967f)))*0.5f),alu1);
    var alu28 = select((sin((cast2*cast8*0.015707963267948967f))*alu21*-0.5f),0.0f,alu1);
    var alu29 = (1.0f-sin((1.5707963267948966f+(cast9*-0.015707963267948967f))));
    var alu30 = select(0.0f,(alu29*sin((1.5707963267948966f+(cast5*cast9*-0.015707963267948967f)))*0.5f),alu1);
    var alu31 = select((sin((cast0*cast9*0.015707963267948967f))*alu29*-0.5f),0.0f,alu1);
    var alu32 = select(0.0f,(alu29*sin((1.5707963267948966f+(cast3*cast9*-0.015707963267948967f)))*0.5f),alu1);
    var alu33 = select((sin((cast1*cast9*0.015707963267948967f))*alu29*-0.5f),0.0f,alu1);
    var alu34 = select(0.0f,(alu29*sin((1.5707963267948966f+(cast4*cast9*-0.015707963267948967f)))*0.5f),alu1);
    var alu35 = select((sin((cast2*cast9*0.015707963267948967f))*alu29*-0.5f),0.0f,alu1);
    var alu36 = (1.0f-sin((1.5707963267948966f+(cast10*-0.015707963267948967f))));
    var alu37 = select(0.0f,(alu36*sin((1.5707963267948966f+(cast5*cast10*-0.015707963267948967f)))*0.5f),alu1);
    var alu38 = select((sin((cast0*cast10*0.015707963267948967f))*alu36*-0.5f),0.0f,alu1);
    var alu39 = select(0.0f,(alu36*sin((1.5707963267948966f+(cast3*cast10*-0.015707963267948967f)))*0.5f),alu1);
    var alu40 = select((sin((cast1*cast10*0.015707963267948967f))*alu36*-0.5f),0.0f,alu1);
    var alu41 = select(0.0f,(alu36*sin((1.5707963267948966f+(cast4*cast10*-0.015707963267948967f)))*0.5f),alu1);
    var alu42 = select((sin((cast2*cast10*0.015707963267948967f))*alu36*-0.5f),0.0f,alu1);
    acc0[0] = (acc0[0]+(alu11*(alu13+alu14))+(alu20*(alu22+alu23))+(alu24*(alu30+alu31))+(alu19*(alu37+alu38)));
    acc0[1] = (acc0[1]+(alu11*(alu15+alu16))+(alu20*(alu25+alu26))+(alu24*(alu32+alu33))+(alu19*(alu39+alu40)));
    acc0[2] = (acc0[2]+(alu11*(alu17+alu18))+(alu20*(alu27+alu28))+(alu24*(alu34+alu35))+(alu19*(alu41+alu42)));
  }
  var alu47 = (gidx0+(gidx1*18006)+(lidx0*9003));
  data0_1206402[alu47] = acc0[0];
  data0_1206402[(alu47+3001)] = acc0[1];
  data0_1206402[(alu47+6002)] = acc0[2];
}`;

const r_5_125_4_8_4_3_201 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_240000:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1_16080:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2_1206402:array<f32>;
@compute @workgroup_size(4,8) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var acc0: array<f32,12>;
  var gidx0 = i32(gindex.x); /* 125 */
  var gidx1 = i32(gindex.y); /* 5 */
  var lidx0 = i32(lindex.x); /* 4 */
  var lidx1 = i32(lindex.y); /* 8 */
  var alu0 = ((gidx0*24)+(lidx1*3));
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
  for (var Ridx0 = 0; Ridx0 < 201; Ridx0++) {
    var alu13 = ((gidx1*3216)+(lidx0*804)+Ridx0);
    var val0 = data1_16080[alu13];
    var alu14 = (alu0+(Ridx0*3001));
    var val1 = data2_1206402[(alu14+1)];
    var val2 = data2_1206402[(alu14+603201)];
    var val3 = data2_1206402[alu14];
    var val4 = data2_1206402[(alu14+603202)];
    var val5 = data2_1206402[(alu14+2)];
    var val6 = data2_1206402[(alu14+603203)];
    var val7 = data1_16080[(alu13+201)];
    var val8 = data1_16080[(alu13+402)];
    var val9 = data1_16080[(alu13+603)];
    var alu15 = sqrt(((val1*val1)+(val4*val4)));
    var alu16 = sqrt(((val5*val5)+(val6*val6)));
    var alu17 = sqrt(((val3*val3)+(val2*val2)));
    var alu18 = (alu17*alu17);
    var alu19 = (alu15*alu15);
    var alu20 = (alu16*alu16);
    acc0[0] = (acc0[0]+(val0*alu18));
    acc0[1] = (acc0[1]+(val0*alu19));
    acc0[2] = (acc0[2]+(val0*alu20));
    acc0[3] = (acc0[3]+(val7*alu18));
    acc0[4] = (acc0[4]+(val7*alu19));
    acc0[5] = (acc0[5]+(val7*alu20));
    acc0[6] = (acc0[6]+(val8*alu18));
    acc0[7] = (acc0[7]+(val8*alu19));
    acc0[8] = (acc0[8]+(val8*alu20));
    acc0[9] = (acc0[9]+(val9*alu18));
    acc0[10] = (acc0[10]+(val9*alu19));
    acc0[11] = (acc0[11]+(val9*alu20));
  }
  var alu34 = (alu0+(gidx1*48000)+(lidx0*12000));
  var alu35 = select(acc0[3],1e-10f,(acc0[3]<1e-10f));
  var alu36 = select(acc0[4],1e-10f,(acc0[4]<1e-10f));
  var alu37 = select(acc0[5],1e-10f,(acc0[5]<1e-10f));
  data0_240000[(alu34+3000)] = (log2(alu35)*0.30102999566398114f);
  data0_240000[(alu34+3001)] = (log2(alu36)*0.30102999566398114f);
  data0_240000[(alu34+3002)] = (log2(alu37)*0.30102999566398114f);
  var alu41 = select(acc0[6],1e-10f,(acc0[6]<1e-10f));
  var alu42 = select(acc0[7],1e-10f,(acc0[7]<1e-10f));
  var alu43 = select(acc0[8],1e-10f,(acc0[8]<1e-10f));
  data0_240000[(alu34+6000)] = (log2(alu41)*0.30102999566398114f);
  data0_240000[(alu34+6001)] = (log2(alu42)*0.30102999566398114f);
  data0_240000[(alu34+6002)] = (log2(alu43)*0.30102999566398114f);
  var alu47 = select(acc0[9],1e-10f,(acc0[9]<1e-10f));
  var alu48 = select(acc0[10],1e-10f,(acc0[10]<1e-10f));
  var alu49 = select(acc0[11],1e-10f,(acc0[11]<1e-10f));
  data0_240000[(alu34+9000)] = (log2(alu47)*0.30102999566398114f);
  data0_240000[(alu34+9001)] = (log2(alu48)*0.30102999566398114f);
  data0_240000[(alu34+9002)] = (log2(alu49)*0.30102999566398114f);
  var alu53 = select(acc0[0],1e-10f,(acc0[0]<1e-10f));
  var alu54 = select(acc0[1],1e-10f,(acc0[1]<1e-10f));
  var alu55 = select(acc0[2],1e-10f,(acc0[2]<1e-10f));
  data0_240000[(alu34+1)] = (log2(alu54)*0.30102999566398114f);
  data0_240000[(alu34+2)] = (log2(alu55)*0.30102999566398114f);
  data0_240000[alu34] = (log2(alu53)*0.30102999566398114f);
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
  for (var Ridx0 = 0; Ridx0 < 750; Ridx0++) {
    var alu1 = ((gidx0*48000)+(lidx0*3000)+bitcast<i32>((bitcast<u32>(Ridx0)<<2u)));
    var val0 = data1_240000[(alu1+1)];
    var val1 = data1_240000[(alu1+2)];
    var val2 = data1_240000[(alu1+3)];
    var val3 = data1_240000[alu1];
    var alu2 = select(acc0[0],val3,(acc0[0]<val3));
    var alu3 = select(alu2,val0,(alu2<val0));
    var alu4 = select(alu3,val1,(alu3<val1));
    var alu5 = select(alu4,val2,(alu4<val2));
    acc0[0] = alu5;
  }
  data0_80[(lidx0+bitcast<i32>((bitcast<u32>(gidx0)<<4u)))] = acc0[0];
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
  acc0[0] = (f32(-INFINITY));
  for (var Ridx0 = 0; Ridx0 < 5; Ridx0++) {
    var val0 = data1_80[((lidx0*5)+Ridx0)];
    var alu1 = select(acc0[0],val0,(acc0[0]<val0));
    acc0[0] = alu1;
  }
  temp0[lidx0] = acc0[0];
  workgroupBarrier();
  acc1[0] = (f32(-INFINITY));
  for (var Ridx101 = 0; Ridx101 < 16; Ridx101++) {
    var val1 = temp0[Ridx101];
    var alu7 = select(acc1[0],val1,(acc1[0]<val1));
    acc1[0] = alu7;
  }
  var alu10 = ((bool(lidx0))!=true);
  if (alu10) {
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
  var alu0 = ((gidx0*96)+(lidx0*3));
  var alu1 = (alu0+1);
  var val0 = data1_240000[alu1];
  var val1 = data1_240000[alu0];
  var val2 = data2_1[0];
  var alu2 = (alu0+2);
  var val3 = data1_240000[alu2];
  var alu3 = select(val0,val2,(val0<val2));
  var alu4 = select(val3,val2,(val3<val2));
  var alu5 = select(val1,val2,(val1<val2));
  data0_240000[alu1] = ((alu3+4.0f)*0.25f);
  data0_240000[alu2] = ((alu4+4.0f)*0.25f);
  data0_240000[alu0] = ((alu5+4.0f)*0.25f);
}`;

const setupNet = async (device, safetensor) => {
    const metadata = getTensorMetadata(safetensor);
    const infinityBuf = createInfinityUniformBuf(device);

    const layouts=[device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]})]

    const buf_0 = createEmptyBuf(device, 4825608);;
    const input0 = createEmptyBuf(device, 1920000);;
    const buf_1 = createEmptyBuf(device, 960000);;
    const buf_2 = createWeightBuf(device, 64320, getTensorBuffer(safetensor, metadata['mel']));
    const buf_3 = createEmptyBuf(device, 320);;
    const buf_4 = createEmptyBuf(device, 4);;
    const output0 = createEmptyBuf(device, 960000);;

    const gpuWriteBuffer0 = device.createBuffer({size:input0.size, usage: GPUBufferUsage.COPY_SRC | GPUBufferUsage.MAP_WRITE });

    const gpuReadBuffer0 = device.createBuffer({size:output0.size, usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ });

    const kernels = [r_67_3001_2_3_100_4, r_5_125_4_8_4_3_201, r_5_16_750_4, r_16_5, E_2500_32_3];
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
        addComputePass(device, commandEncoder, pipelines[0], layouts[0], infinityBuf, [buf_0, input0], [3001, 67, 1]);
        addComputePass(device, commandEncoder, pipelines[1], layouts[1], infinityBuf, [buf_1, buf_2, buf_0], [125, 5, 1]);
        addComputePass(device, commandEncoder, pipelines[2], layouts[2], infinityBuf, [buf_3, buf_1], [5, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[3], layouts[3], infinityBuf, [buf_4, buf_3], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[4], layouts[4], infinityBuf, [output0, buf_1, buf_4], [2500, 1, 1]);
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
