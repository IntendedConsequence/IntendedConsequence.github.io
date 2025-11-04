
const encoder = (() => {
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

const r_8_125_16_8_3_3_80_3 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_1152000:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1_240000:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2_92160:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3_384:array<f32>;
@compute @workgroup_size(16,8) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var acc0: array<f32,9>;
  var gidx1 = i32(gindex.y); /* 8 */
  var lidx1 = i32(lindex.y); /* 8 */
  var lidx0 = i32(lindex.x); /* 16 */
  var gidx0 = i32(gindex.x); /* 125 */
  var precast0 = gidx0;
  acc0[0] = 0.0f;
  acc0[1] = 0.0f;
  acc0[2] = 0.0f;
  acc0[3] = 0.0f;
  acc0[4] = 0.0f;
  acc0[5] = 0.0f;
  acc0[6] = 0.0f;
  acc0[7] = 0.0f;
  acc0[8] = 0.0f;
  var alu9 = ((gidx1*48)+(lidx0*3));
  var val0 = data3_384[alu9];
  var val1 = data3_384[(alu9+1)];
  var val2 = data3_384[(alu9+2)];
  var alu10 = ((gidx0*24)+(lidx1*3));
  var precast1 = (bitcast<u32>(precast0)<<3u);
  for (var Ridx0 = 0; Ridx0 < 80; Ridx0++) {
    var alu11 = ((gidx1*11520)+(lidx0*720)+(Ridx0*3));
    var val3 = data2_92160[alu11];
    var val4 = data2_92160[(alu11+1)];
    var val5 = data2_92160[(alu11+2)];
    var val6 = data2_92160[(alu11+240)];
    var val7 = data2_92160[(alu11+241)];
    var val8 = data2_92160[(alu11+242)];
    var val9 = data2_92160[(alu11+480)];
    var val10 = data2_92160[(alu11+481)];
    var val11 = data2_92160[(alu11+482)];
    var alu12 = (alu10+(Ridx0*3000));
    var val12 = data1_240000[alu12];
    var val13 = select(0.0f, data1_240000[(alu12+-1)], (0<(gidx0+lidx1)));
    var val14 = data1_240000[(alu12+1)];
    var val15 = data1_240000[(alu12+2)];
    var val16 = select(0.0f, data1_240000[(alu12+3)], ((lidx1+bitcast<i32>(precast1))<999));
    acc0[6] = (acc0[6]+(val14*val3)+(val15*val4)+(val16*val5));
    acc0[7] = (acc0[7]+(val14*val6)+(val15*val7)+(val16*val8));
    acc0[8] = (acc0[8]+(val14*val9)+(val15*val10)+(val16*val11));
    acc0[0] = (acc0[0]+(val13*val3)+(val12*val4)+(val14*val5));
    acc0[4] = (acc0[4]+(val12*val6)+(val14*val7)+(val15*val8));
    acc0[1] = (acc0[1]+(val13*val6)+(val12*val7)+(val14*val8));
    acc0[5] = (acc0[5]+(val12*val9)+(val14*val10)+(val15*val11));
    acc0[2] = (acc0[2]+(val13*val9)+(val12*val10)+(val14*val11));
    acc0[3] = (acc0[3]+(val12*val3)+(val14*val4)+(val15*val5));
  }
  var alu23 = (acc0[0]+val0);
  var alu24 = (acc0[1]+val1);
  var alu25 = (acc0[2]+val2);
  var alu26 = (acc0[3]+val0);
  var alu27 = (acc0[4]+val1);
  var alu28 = (acc0[5]+val2);
  var alu29 = (acc0[6]+val0);
  var alu30 = (acc0[7]+val1);
  var alu31 = (acc0[8]+val2);
  var alu32 = (alu10+(gidx1*144000)+(lidx0*9000));
  data0_1152000[alu32] = ((1/(1.0f+exp2(((alu23+(0.044715f*alu23*alu23*alu23))*-2.302208198144325f))))*alu23);
  data0_1152000[(alu32+3000)] = ((1/(1.0f+exp2(((alu24+(0.044715f*alu24*alu24*alu24))*-2.302208198144325f))))*alu24);
  data0_1152000[(alu32+6000)] = ((1/(1.0f+exp2(((alu25+(0.044715f*alu25*alu25*alu25))*-2.302208198144325f))))*alu25);
  data0_1152000[(alu32+1)] = ((1/(1.0f+exp2(((alu26+(0.044715f*alu26*alu26*alu26))*-2.302208198144325f))))*alu26);
  data0_1152000[(alu32+3001)] = ((1/(1.0f+exp2(((alu27+(0.044715f*alu27*alu27*alu27))*-2.302208198144325f))))*alu27);
  data0_1152000[(alu32+6001)] = ((1/(1.0f+exp2(((alu28+(0.044715f*alu28*alu28*alu28))*-2.302208198144325f))))*alu28);
  data0_1152000[(alu32+2)] = ((1/(1.0f+exp2(((alu29+(0.044715f*alu29*alu29*alu29))*-2.302208198144325f))))*alu29);
  data0_1152000[(alu32+3002)] = ((1/(1.0f+exp2(((alu30+(0.044715f*alu30*alu30*alu30))*-2.302208198144325f))))*alu30);
  data0_1152000[(alu32+6002)] = ((1/(1.0f+exp2(((alu31+(0.044715f*alu31*alu31*alu31))*-2.302208198144325f))))*alu31);
}`;

const r_125_8_4_16_3_3_384_3 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_576000:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1_1152000:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2_442368:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3_384:array<f32>;
@group(0) @binding(5)var<storage,read_write>data4_576000:array<f32>;
@compute @workgroup_size(4,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var acc0: array<f32,9>;
  var lidx0 = i32(lindex.x); /* 4 */
  var gidx0 = i32(gindex.x); /* 8 */
  var lidx1 = i32(lindex.y); /* 16 */
  var gidx1 = i32(gindex.y); /* 125 */
  acc0[0] = 0.0f;
  acc0[1] = 0.0f;
  acc0[2] = 0.0f;
  acc0[3] = 0.0f;
  acc0[4] = 0.0f;
  acc0[5] = 0.0f;
  acc0[6] = 0.0f;
  acc0[7] = 0.0f;
  acc0[8] = 0.0f;
  var alu9 = ((gidx0*48)+(lidx1*3));
  var val0 = data3_384[alu9];
  var alu10 = (alu9+(gidx1*4608)+(lidx0*1152));
  var val1 = data4_576000[alu10];
  var alu11 = (alu10+1);
  var val2 = data4_576000[alu11];
  var alu12 = (alu10+2);
  var val3 = data4_576000[alu12];
  var alu13 = (alu10+384);
  var val4 = data4_576000[alu13];
  var alu14 = (alu10+385);
  var val5 = data4_576000[alu14];
  var alu15 = (alu10+386);
  var val6 = data4_576000[alu15];
  var alu16 = (alu10+768);
  var val7 = data4_576000[alu16];
  var alu17 = (alu10+769);
  var val8 = data4_576000[alu17];
  var alu18 = (alu10+770);
  var val9 = data4_576000[alu18];
  var val10 = data3_384[(alu9+1)];
  var val11 = data3_384[(alu9+2)];
  for (var Ridx0 = 0; Ridx0 < 384; Ridx0++) {
    var alu19 = ((gidx0*55296)+(lidx1*3456)+(Ridx0*3));
    var val12 = data2_442368[alu19];
    var val13 = data2_442368[(alu19+1)];
    var val14 = data2_442368[(alu19+2)];
    var val15 = data2_442368[(alu19+1152)];
    var val16 = data2_442368[(alu19+1153)];
    var val17 = data2_442368[(alu19+1154)];
    var val18 = data2_442368[(alu19+2304)];
    var val19 = data2_442368[(alu19+2305)];
    var val20 = data2_442368[(alu19+2306)];
    var alu20 = ((gidx1*24)+(lidx0*6)+(Ridx0*3000));
    var val21 = data1_1152000[alu20];
    var val22 = select(0.0f, data1_1152000[(alu20+-1)], (0<(gidx1+lidx0)));
    var val23 = data1_1152000[(alu20+1)];
    var val24 = data1_1152000[(alu20+2)];
    var val25 = data1_1152000[(alu20+3)];
    var val26 = data1_1152000[(alu20+4)];
    var val27 = data1_1152000[(alu20+5)];
    acc0[3] = (acc0[3]+(val23*val12)+(val24*val13)+(val25*val14));
    acc0[4] = (acc0[4]+(val23*val15)+(val24*val16)+(val25*val17));
    acc0[5] = (acc0[5]+(val23*val18)+(val24*val19)+(val25*val20));
    acc0[6] = (acc0[6]+(val25*val12)+(val26*val13)+(val27*val14));
    acc0[7] = (acc0[7]+(val25*val15)+(val26*val16)+(val27*val17));
    acc0[8] = (acc0[8]+(val25*val18)+(val26*val19)+(val27*val20));
    acc0[0] = (acc0[0]+(val22*val12)+(val21*val13)+(val23*val14));
    acc0[1] = (acc0[1]+(val22*val15)+(val21*val16)+(val23*val17));
    acc0[2] = (acc0[2]+(val22*val18)+(val21*val19)+(val23*val20));
  }
  var alu31 = (acc0[0]+val0);
  var alu32 = (acc0[1]+val10);
  var alu33 = (acc0[2]+val11);
  var alu34 = (acc0[3]+val0);
  var alu35 = (acc0[4]+val10);
  var alu36 = (acc0[5]+val11);
  var alu37 = (acc0[6]+val0);
  var alu38 = (acc0[7]+val10);
  var alu39 = (acc0[8]+val11);
  data0_576000[alu10] = (((1/(1.0f+exp2(((alu31+(0.044715f*alu31*alu31*alu31))*-2.302208198144325f))))*alu31)+val1);
  data0_576000[alu11] = (((1/(1.0f+exp2(((alu32+(0.044715f*alu32*alu32*alu32))*-2.302208198144325f))))*alu32)+val2);
  data0_576000[alu12] = (((1/(1.0f+exp2(((alu33+(0.044715f*alu33*alu33*alu33))*-2.302208198144325f))))*alu33)+val3);
  data0_576000[alu13] = (((1/(1.0f+exp2(((alu34+(0.044715f*alu34*alu34*alu34))*-2.302208198144325f))))*alu34)+val4);
  data0_576000[alu14] = (((1/(1.0f+exp2(((alu35+(0.044715f*alu35*alu35*alu35))*-2.302208198144325f))))*alu35)+val5);
  data0_576000[alu15] = (((1/(1.0f+exp2(((alu36+(0.044715f*alu36*alu36*alu36))*-2.302208198144325f))))*alu36)+val6);
  data0_576000[alu16] = (((1/(1.0f+exp2(((alu37+(0.044715f*alu37*alu37*alu37))*-2.302208198144325f))))*alu37)+val7);
  data0_576000[alu17] = (((1/(1.0f+exp2(((alu38+(0.044715f*alu38*alu38*alu38))*-2.302208198144325f))))*alu38)+val8);
  data0_576000[alu18] = (((1/(1.0f+exp2(((alu39+(0.044715f*alu39*alu39*alu39))*-2.302208198144325f))))*alu39)+val9);
}`;

const r_1500_16_24 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
var<workgroup> temp0: array<f32,16>;
@group(0) @binding(1)var<storage,read_write>data0_1500:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1_576000:array<f32>;
@compute @workgroup_size(16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var acc0: array<f32,1>;
  var acc1: array<f32,1>;
  var lidx0 = i32(lindex.x); /* 16 */
  var gidx0 = i32(gindex.x); /* 1500 */
  acc0[0] = 0.0f;
  acc1[0] = 0.0f;
  for (var Ridx0 = 0; Ridx0 < 24; Ridx0++) {
    var val0 = data1_576000[((lidx0*24)+Ridx0+(gidx0*384))];
    acc0[0] = (acc0[0]+val0);
  }
  temp0[lidx0] = acc0[0];
  workgroupBarrier();
  for (var Ridx102 = 0; Ridx102 < 16; Ridx102++) {
    var val1 = temp0[Ridx102];
    acc1[0] = (acc1[0]+val1);
  }
  var alu8 = ((bool(lidx0))!=true);
  if (alu8) {
    data0_1500[gidx0] = (acc1[0]*0.0026041666666666665f);
  }
}`;

const r_1500_16_24n1 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
var<workgroup> temp0: array<f32,16>;
@group(0) @binding(1)var<storage,read_write>data0_1500:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1_576000:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2_1500:array<f32>;
@compute @workgroup_size(16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var acc0: array<f32,1>;
  var acc1: array<f32,1>;
  var lidx0 = i32(lindex.x); /* 16 */
  var gidx0 = i32(gindex.x); /* 1500 */
  acc0[0] = 0.0f;
  acc1[0] = 0.0f;
  var val0 = data2_1500[gidx0];
  for (var Ridx0 = 0; Ridx0 < 24; Ridx0++) {
    var val1 = data1_576000[((lidx0*24)+Ridx0+(gidx0*384))];
    var alu2 = (val1-val0);
    acc0[0] = (acc0[0]+(alu2*alu2));
  }
  temp0[lidx0] = acc0[0];
  workgroupBarrier();
  for (var Ridx102 = 0; Ridx102 < 16; Ridx102++) {
    var val2 = temp0[Ridx102];
    acc1[0] = (acc1[0]+val2);
  }
  var alu9 = ((bool(lidx0))!=true);
  if (alu9) {
    data0_1500[gidx0] = (1/sqrt(((acc1[0]*0.0026041666666666665f)+1e-05f)));
  }
}`;

const E_125_8_4_16_3_3 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_576000:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1_576000:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2_1500:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3_1500:array<f32>;
@group(0) @binding(5)var<storage,read_write>data4_384:array<f32>;
@group(0) @binding(6)var<storage,read_write>data5_384:array<f32>;
@compute @workgroup_size(4,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var lidx0 = i32(lindex.x); /* 4 */
  var gidx0 = i32(gindex.x); /* 8 */
  var lidx1 = i32(lindex.y); /* 16 */
  var gidx1 = i32(gindex.y); /* 125 */
  var alu0 = ((gidx1*12)+(lidx0*3));
  var val0 = data2_1500[alu0];
  var val1 = data3_1500[alu0];
  var alu1 = (alu0+1);
  var val2 = data2_1500[alu1];
  var val3 = data3_1500[alu1];
  var alu2 = (alu0+2);
  var val4 = data2_1500[alu2];
  var val5 = data3_1500[alu2];
  var alu3 = ((gidx0*48)+(lidx1*3));
  var val6 = data4_384[alu3];
  var val7 = data5_384[alu3];
  var alu4 = (alu3+(gidx1*4608)+(lidx0*1152));
  var val8 = data1_576000[alu4];
  var alu5 = (alu4+1);
  var val9 = data1_576000[alu5];
  var alu6 = (alu4+2);
  var val10 = data1_576000[alu6];
  var alu7 = (alu4+384);
  var val11 = data1_576000[alu7];
  var alu8 = (alu4+385);
  var val12 = data1_576000[alu8];
  var alu9 = (alu4+386);
  var val13 = data1_576000[alu9];
  var alu10 = (alu4+768);
  var val14 = data1_576000[alu10];
  var alu11 = (alu4+769);
  var val15 = data1_576000[alu11];
  var alu12 = (alu4+770);
  var val16 = data1_576000[alu12];
  var alu13 = (alu3+1);
  var val17 = data4_384[alu13];
  var val18 = data5_384[alu13];
  var alu14 = (alu3+2);
  var val19 = data4_384[alu14];
  var val20 = data5_384[alu14];
  data0_576000[alu5] = (((val9-val0)*val1*val17)+val18);
  data0_576000[alu6] = (((val10-val0)*val1*val19)+val20);
  data0_576000[alu7] = (((val11-val2)*val3*val6)+val7);
  data0_576000[alu8] = (((val12-val2)*val3*val17)+val18);
  data0_576000[alu9] = (((val13-val2)*val3*val19)+val20);
  data0_576000[alu10] = (((val14-val4)*val5*val6)+val7);
  data0_576000[alu11] = (((val15-val4)*val5*val17)+val18);
  data0_576000[alu12] = (((val16-val4)*val5*val19)+val20);
  data0_576000[alu4] = (((val8-val0)*val1*val6)+val7);
}`;

const r_125_8_4_16_3_3_96_4 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_576000:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1_576000:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2_147456:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3_384:array<f32>;
@compute @workgroup_size(4,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var acc0: array<f32,9>;
  var lidx0 = i32(lindex.x); /* 4 */
  var gidx0 = i32(gindex.x); /* 8 */
  var lidx1 = i32(lindex.y); /* 16 */
  var gidx1 = i32(gindex.y); /* 125 */
  acc0[0] = 0.0f;
  acc0[1] = 0.0f;
  acc0[2] = 0.0f;
  acc0[3] = 0.0f;
  acc0[4] = 0.0f;
  acc0[5] = 0.0f;
  acc0[6] = 0.0f;
  acc0[7] = 0.0f;
  acc0[8] = 0.0f;
  var alu9 = ((gidx1*4608)+(lidx0*1152));
  var alu10 = ((gidx0*48)+(lidx1*3));
  var val0 = data3_384[alu10];
  var val1 = data3_384[(alu10+1)];
  var val2 = data3_384[(alu10+2)];
  for (var Ridx0 = 0; Ridx0 < 96; Ridx0++) {
    var precast0 = Ridx0;
    var precast1 = (bitcast<u32>(precast0)<<2u);
    var cast0 = bitcast<i32>(precast1);
    var alu11 = ((gidx0*18432)+(lidx1*1152)+cast0);
    var val3 = data2_147456[alu11];
    var val4 = data2_147456[(alu11+1)];
    var val5 = data2_147456[(alu11+2)];
    var val6 = data2_147456[(alu11+3)];
    var val7 = data2_147456[(alu11+384)];
    var val8 = data2_147456[(alu11+385)];
    var val9 = data2_147456[(alu11+386)];
    var val10 = data2_147456[(alu11+387)];
    var val11 = data2_147456[(alu11+768)];
    var val12 = data2_147456[(alu11+769)];
    var val13 = data2_147456[(alu11+770)];
    var val14 = data2_147456[(alu11+771)];
    var alu12 = (alu9+cast0);
    var val15 = data1_576000[alu12];
    var val16 = data1_576000[(alu12+1)];
    var val17 = data1_576000[(alu12+2)];
    var val18 = data1_576000[(alu12+3)];
    var val19 = data1_576000[(alu12+384)];
    var val20 = data1_576000[(alu12+385)];
    var val21 = data1_576000[(alu12+386)];
    var val22 = data1_576000[(alu12+387)];
    var val23 = data1_576000[(alu12+768)];
    var val24 = data1_576000[(alu12+769)];
    var val25 = data1_576000[(alu12+770)];
    var val26 = data1_576000[(alu12+771)];
    acc0[1] = (acc0[1]+(val19*val3)+(val20*val4)+(val21*val5)+(val22*val6));
    acc0[4] = (acc0[4]+(val19*val7)+(val20*val8)+(val21*val9)+(val22*val10));
    acc0[7] = (acc0[7]+(val19*val11)+(val20*val12)+(val21*val13)+(val22*val14));
    acc0[2] = (acc0[2]+(val23*val3)+(val24*val4)+(val25*val5)+(val26*val6));
    acc0[5] = (acc0[5]+(val23*val7)+(val24*val8)+(val25*val9)+(val26*val10));
    acc0[8] = (acc0[8]+(val23*val11)+(val24*val12)+(val25*val13)+(val26*val14));
    acc0[3] = (acc0[3]+(val15*val7)+(val16*val8)+(val17*val9)+(val18*val10));
    acc0[6] = (acc0[6]+(val15*val11)+(val16*val12)+(val17*val13)+(val18*val14));
    acc0[0] = (acc0[0]+(val15*val3)+(val16*val4)+(val17*val5)+(val18*val6));
  }
  var alu23 = (alu10+alu9);
  data0_576000[alu23] = (acc0[0]+val0);
  data0_576000[(alu23+384)] = (acc0[1]+val0);
  data0_576000[(alu23+768)] = (acc0[2]+val0);
  data0_576000[(alu23+1)] = (acc0[3]+val1);
  data0_576000[(alu23+385)] = (acc0[4]+val1);
  data0_576000[(alu23+769)] = (acc0[5]+val1);
  data0_576000[(alu23+2)] = (acc0[6]+val2);
  data0_576000[(alu23+386)] = (acc0[7]+val2);
  data0_576000[(alu23+770)] = (acc0[8]+val2);
}`;

const r_125_8_4_16_3_3_96_4n1 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_576000:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1_576000:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2_147456:array<f32>;
@compute @workgroup_size(4,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var acc0: array<f32,9>;
  var lidx0 = i32(lindex.x); /* 4 */
  var gidx0 = i32(gindex.x); /* 8 */
  var lidx1 = i32(lindex.y); /* 16 */
  var gidx1 = i32(gindex.y); /* 125 */
  acc0[0] = 0.0f;
  acc0[1] = 0.0f;
  acc0[2] = 0.0f;
  acc0[3] = 0.0f;
  acc0[4] = 0.0f;
  acc0[5] = 0.0f;
  acc0[6] = 0.0f;
  acc0[7] = 0.0f;
  acc0[8] = 0.0f;
  var alu9 = ((gidx1*4608)+(lidx0*1152));
  for (var Ridx0 = 0; Ridx0 < 96; Ridx0++) {
    var precast0 = Ridx0;
    var precast1 = (bitcast<u32>(precast0)<<2u);
    var cast0 = bitcast<i32>(precast1);
    var alu10 = ((gidx0*18432)+(lidx1*1152)+cast0);
    var val0 = data2_147456[alu10];
    var val1 = data2_147456[(alu10+1)];
    var val2 = data2_147456[(alu10+2)];
    var val3 = data2_147456[(alu10+3)];
    var val4 = data2_147456[(alu10+384)];
    var val5 = data2_147456[(alu10+385)];
    var val6 = data2_147456[(alu10+386)];
    var val7 = data2_147456[(alu10+387)];
    var val8 = data2_147456[(alu10+768)];
    var val9 = data2_147456[(alu10+769)];
    var val10 = data2_147456[(alu10+770)];
    var val11 = data2_147456[(alu10+771)];
    var alu11 = (alu9+cast0);
    var val12 = data1_576000[alu11];
    var val13 = data1_576000[(alu11+1)];
    var val14 = data1_576000[(alu11+2)];
    var val15 = data1_576000[(alu11+3)];
    var val16 = data1_576000[(alu11+384)];
    var val17 = data1_576000[(alu11+385)];
    var val18 = data1_576000[(alu11+386)];
    var val19 = data1_576000[(alu11+387)];
    var val20 = data1_576000[(alu11+768)];
    var val21 = data1_576000[(alu11+769)];
    var val22 = data1_576000[(alu11+770)];
    var val23 = data1_576000[(alu11+771)];
    acc0[1] = (acc0[1]+(val16*val0)+(val17*val1)+(val18*val2)+(val19*val3));
    acc0[4] = (acc0[4]+(val16*val4)+(val17*val5)+(val18*val6)+(val19*val7));
    acc0[7] = (acc0[7]+(val16*val8)+(val17*val9)+(val18*val10)+(val19*val11));
    acc0[2] = (acc0[2]+(val20*val0)+(val21*val1)+(val22*val2)+(val23*val3));
    acc0[5] = (acc0[5]+(val20*val4)+(val21*val5)+(val22*val6)+(val23*val7));
    acc0[8] = (acc0[8]+(val20*val8)+(val21*val9)+(val22*val10)+(val23*val11));
    acc0[3] = (acc0[3]+(val12*val4)+(val13*val5)+(val14*val6)+(val15*val7));
    acc0[6] = (acc0[6]+(val12*val8)+(val13*val9)+(val14*val10)+(val15*val11));
    acc0[0] = (acc0[0]+(val12*val0)+(val13*val1)+(val14*val2)+(val15*val3));
  }
  var alu22 = ((gidx0*48)+(lidx1*3)+alu9);
  data0_576000[alu22] = acc0[0];
  data0_576000[(alu22+1)] = acc0[3];
  data0_576000[(alu22+2)] = acc0[6];
  data0_576000[(alu22+384)] = acc0[1];
  data0_576000[(alu22+385)] = acc0[4];
  data0_576000[(alu22+386)] = acc0[7];
  data0_576000[(alu22+768)] = acc0[2];
  data0_576000[(alu22+769)] = acc0[5];
  data0_576000[(alu22+770)] = acc0[8];
}`;

const r_2_125_125_3_4_4_3_3_16_4 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_13500000:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1_576000:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2_576000:array<f32>;
@compute @workgroup_size(3,4,4) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var acc0: array<f32,9>;
  var gidx2 = i32(gindex.z); /* 2 */
  var lidx0 = i32(lindex.x); /* 3 */
  var lidx1 = i32(lindex.y); /* 4 */
  var lidx2 = i32(lindex.z); /* 4 */
  var gidx0 = i32(gindex.x); /* 125 */
  var gidx1 = i32(gindex.y); /* 125 */
  var precast0 = lidx0;
  acc0[0] = 0.0f;
  acc0[1] = 0.0f;
  acc0[2] = 0.0f;
  acc0[3] = 0.0f;
  acc0[4] = 0.0f;
  acc0[5] = 0.0f;
  acc0[6] = 0.0f;
  acc0[7] = 0.0f;
  acc0[8] = 0.0f;
  var precast1 = (bitcast<u32>(precast0)<<6u);
  for (var Ridx0 = 0; Ridx0 < 16; Ridx0++) {
    var precast2 = Ridx0;
    var precast3 = (bitcast<u32>(precast2)<<2u);
    var alu9 = ((gidx2*192)+bitcast<i32>(precast1)+bitcast<i32>(precast3));
    var alu10 = (alu9+(gidx0*4608)+(lidx2*1152));
    var val0 = data2_576000[alu10];
    var val1 = data2_576000[(alu10+1)];
    var val2 = data2_576000[(alu10+2)];
    var val3 = data2_576000[(alu10+3)];
    var val4 = data2_576000[(alu10+384)];
    var val5 = data2_576000[(alu10+385)];
    var val6 = data2_576000[(alu10+386)];
    var val7 = data2_576000[(alu10+387)];
    var val8 = data2_576000[(alu10+768)];
    var val9 = data2_576000[(alu10+769)];
    var val10 = data2_576000[(alu10+770)];
    var val11 = data2_576000[(alu10+771)];
    var alu11 = (alu9+(gidx1*4608)+(lidx1*1152));
    var val12 = data1_576000[alu11];
    var val13 = data1_576000[(alu11+1)];
    var val14 = data1_576000[(alu11+2)];
    var val15 = data1_576000[(alu11+3)];
    var val16 = data1_576000[(alu11+384)];
    var val17 = data1_576000[(alu11+385)];
    var val18 = data1_576000[(alu11+386)];
    var val19 = data1_576000[(alu11+387)];
    var val20 = data1_576000[(alu11+768)];
    var val21 = data1_576000[(alu11+769)];
    var val22 = data1_576000[(alu11+770)];
    var val23 = data1_576000[(alu11+771)];
    acc0[1] = (acc0[1]+(val16*val0)+(val17*val1)+(val18*val2)+(val19*val3));
    acc0[4] = (acc0[4]+(val16*val4)+(val17*val5)+(val18*val6)+(val19*val7));
    acc0[7] = (acc0[7]+(val16*val8)+(val17*val9)+(val18*val10)+(val19*val11));
    acc0[2] = (acc0[2]+(val20*val0)+(val21*val1)+(val22*val2)+(val23*val3));
    acc0[5] = (acc0[5]+(val20*val4)+(val21*val5)+(val22*val6)+(val23*val7));
    acc0[8] = (acc0[8]+(val20*val8)+(val21*val9)+(val22*val10)+(val23*val11));
    acc0[3] = (acc0[3]+(val12*val4)+(val13*val5)+(val14*val6)+(val15*val7));
    acc0[6] = (acc0[6]+(val12*val8)+(val13*val9)+(val14*val10)+(val15*val11));
    acc0[0] = (acc0[0]+(val12*val0)+(val13*val1)+(val14*val2)+(val15*val3));
  }
  var alu22 = ((gidx0*12)+(lidx2*3)+(gidx1*18000)+(lidx1*4500)+(gidx2*6750000)+(lidx0*2250000));
  data0_13500000[alu22] = (acc0[0]*0.125f);
  data0_13500000[(alu22+1500)] = (acc0[1]*0.125f);
  data0_13500000[(alu22+3000)] = (acc0[2]*0.125f);
  data0_13500000[(alu22+1)] = (acc0[3]*0.125f);
  data0_13500000[(alu22+1501)] = (acc0[4]*0.125f);
  data0_13500000[(alu22+3001)] = (acc0[5]*0.125f);
  data0_13500000[(alu22+2)] = (acc0[6]*0.125f);
  data0_13500000[(alu22+1502)] = (acc0[7]*0.125f);
  data0_13500000[(alu22+3002)] = (acc0[8]*0.125f);
}`;

const r_375_8_3_375_4 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_9000:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1_13500000:array<f32>;
@compute @workgroup_size(8) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var acc0: array<f32,3>;
  var lidx0 = i32(lindex.x); /* 8 */
  var gidx0 = i32(gindex.x); /* 375 */
  acc0[0] = (f32(-INFINITY));
  acc0[1] = (f32(-INFINITY));
  acc0[2] = (f32(-INFINITY));
  for (var Ridx0 = 0; Ridx0 < 375; Ridx0++) {
    var precast0 = Ridx0;
    var precast1 = (bitcast<u32>(precast0)<<2u);
    var alu3 = ((gidx0*36000)+(lidx0*4500)+bitcast<i32>(precast1));
    var val0 = data1_13500000[alu3];
    var val1 = data1_13500000[(alu3+1)];
    var val2 = data1_13500000[(alu3+2)];
    var val3 = data1_13500000[(alu3+3)];
    var val4 = data1_13500000[(alu3+1500)];
    var val5 = data1_13500000[(alu3+1501)];
    var val6 = data1_13500000[(alu3+1502)];
    var val7 = data1_13500000[(alu3+1503)];
    var val8 = data1_13500000[(alu3+3000)];
    var val9 = data1_13500000[(alu3+3001)];
    var val10 = data1_13500000[(alu3+3002)];
    var val11 = data1_13500000[(alu3+3003)];
    var alu4 = select(acc0[0],val0,(acc0[0]<val0));
    var alu5 = select(acc0[1],val4,(acc0[1]<val4));
    var alu6 = select(acc0[2],val8,(acc0[2]<val8));
    var alu7 = select(alu4,val1,(alu4<val1));
    var alu8 = select(alu5,val5,(alu5<val5));
    var alu9 = select(alu6,val9,(alu6<val9));
    var alu10 = select(alu7,val2,(alu7<val2));
    var alu11 = select(alu8,val6,(alu8<val6));
    var alu12 = select(alu9,val10,(alu9<val10));
    var alu13 = select(alu10,val3,(alu10<val3));
    acc0[0] = alu13;
    var alu15 = select(alu11,val7,(alu11<val7));
    acc0[1] = alu15;
    var alu17 = select(alu12,val11,(alu12<val11));
    acc0[2] = alu17;
  }
  var alu20 = ((gidx0*24)+(lidx0*3));
  data0_9000[alu20] = acc0[0];
  data0_9000[(alu20+1)] = acc0[1];
  data0_9000[(alu20+2)] = acc0[2];
}`;

const r_375_8_3_375_4n1 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_9000:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1_13500000:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2_9000:array<f32>;
@compute @workgroup_size(8) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var acc0: array<f32,3>;
  var lidx0 = i32(lindex.x); /* 8 */
  var gidx0 = i32(gindex.x); /* 375 */
  acc0[0] = 0.0f;
  acc0[1] = 0.0f;
  acc0[2] = 0.0f;
  var alu3 = ((gidx0*24)+(lidx0*3));
  var val0 = data2_9000[alu3];
  var alu4 = (alu3+1);
  var val1 = data2_9000[alu4];
  var alu5 = (alu3+2);
  var val2 = data2_9000[alu5];
  for (var Ridx0 = 0; Ridx0 < 375; Ridx0++) {
    var precast0 = Ridx0;
    var precast1 = (bitcast<u32>(precast0)<<2u);
    var alu6 = ((gidx0*36000)+(lidx0*4500)+bitcast<i32>(precast1));
    var val3 = data1_13500000[alu6];
    var val4 = data1_13500000[(alu6+1)];
    var val5 = data1_13500000[(alu6+2)];
    var val6 = data1_13500000[(alu6+3)];
    var val7 = data1_13500000[(alu6+1500)];
    var val8 = data1_13500000[(alu6+1501)];
    var val9 = data1_13500000[(alu6+1502)];
    var val10 = data1_13500000[(alu6+1503)];
    var val11 = data1_13500000[(alu6+3000)];
    var val12 = data1_13500000[(alu6+3001)];
    var val13 = data1_13500000[(alu6+3002)];
    var val14 = data1_13500000[(alu6+3003)];
    acc0[1] = (acc0[1]+exp2(((val7-val1)*1.4426950408889634f))+exp2(((val8-val1)*1.4426950408889634f))+exp2(((val9-val1)*1.4426950408889634f))+exp2(((val10-val1)*1.4426950408889634f)));
    acc0[2] = (acc0[2]+exp2(((val11-val2)*1.4426950408889634f))+exp2(((val12-val2)*1.4426950408889634f))+exp2(((val13-val2)*1.4426950408889634f))+exp2(((val14-val2)*1.4426950408889634f)));
    acc0[0] = (acc0[0]+exp2(((val3-val0)*1.4426950408889634f))+exp2(((val4-val0)*1.4426950408889634f))+exp2(((val5-val0)*1.4426950408889634f))+exp2(((val6-val0)*1.4426950408889634f)));
  }
  data0_9000[alu4] = acc0[1];
  data0_9000[alu5] = acc0[2];
  data0_9000[alu3] = acc0[0];
}`;

const r_3_125_2_4_16_4_3_375_4 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_576000:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1_13500000:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2_9000:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3_9000:array<f32>;
@group(0) @binding(5)var<storage,read_write>data4_576000:array<f32>;
@compute @workgroup_size(2,4,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var acc0: array<f32,12>;
  var lidx0 = i32(lindex.x); /* 2 */
  var gidx1 = i32(gindex.y); /* 3 */
  var lidx1 = i32(lindex.y); /* 4 */
  var lidx2 = i32(lindex.z); /* 16 */
  var gidx0 = i32(gindex.x); /* 125 */
  var precast0 = gidx1;
  var precast1 = lidx0;
  var precast2 = lidx2;
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
  var alu12 = ((gidx0*12)+(lidx1*3)+(gidx1*3000)+(lidx0*1500));
  var val0 = data2_9000[alu12];
  var val1 = data3_9000[alu12];
  var alu13 = (alu12+1);
  var val2 = data2_9000[alu13];
  var val3 = data3_9000[alu13];
  var alu14 = (alu12+2);
  var val4 = data2_9000[alu14];
  var val5 = data3_9000[alu14];
  var precast3 = (bitcast<u32>(precast0)<<7u);
  var precast4 = (bitcast<u32>(precast1)<<6u);
  var precast5 = (bitcast<u32>(precast2)<<2u);
  var cast0 = bitcast<i32>(precast5);
  for (var Ridx0 = 0; Ridx0 < 375; Ridx0++) {
    var precast6 = Ridx0;
    var alu15 = (bitcast<i32>(precast3)+bitcast<i32>(precast4)+cast0+(Ridx0*1536));
    var val6 = data4_576000[alu15];
    var val7 = data4_576000[(alu15+1)];
    var val8 = data4_576000[(alu15+2)];
    var val9 = data4_576000[(alu15+3)];
    var val10 = data4_576000[(alu15+384)];
    var val11 = data4_576000[(alu15+385)];
    var val12 = data4_576000[(alu15+386)];
    var val13 = data4_576000[(alu15+387)];
    var val14 = data4_576000[(alu15+768)];
    var val15 = data4_576000[(alu15+769)];
    var val16 = data4_576000[(alu15+770)];
    var val17 = data4_576000[(alu15+771)];
    var val18 = data4_576000[(alu15+1152)];
    var val19 = data4_576000[(alu15+1153)];
    var val20 = data4_576000[(alu15+1154)];
    var val21 = data4_576000[(alu15+1155)];
    var precast7 = (bitcast<u32>(precast6)<<2u);
    var alu16 = ((gidx0*18000)+(lidx1*4500)+bitcast<i32>(precast7)+(gidx1*4500000)+(lidx0*2250000));
    var val22 = data1_13500000[alu16];
    var val23 = data1_13500000[(alu16+1)];
    var val24 = data1_13500000[(alu16+2)];
    var val25 = data1_13500000[(alu16+3)];
    var val26 = data1_13500000[(alu16+1500)];
    var val27 = data1_13500000[(alu16+1501)];
    var val28 = data1_13500000[(alu16+1502)];
    var val29 = data1_13500000[(alu16+1503)];
    var val30 = data1_13500000[(alu16+3000)];
    var val31 = data1_13500000[(alu16+3001)];
    var val32 = data1_13500000[(alu16+3002)];
    var val33 = data1_13500000[(alu16+3003)];
    var alu17 = exp2(((val23-val0)*1.4426950408889634f));
    var alu18 = exp2(((val24-val0)*1.4426950408889634f));
    var alu19 = exp2(((val25-val0)*1.4426950408889634f));
    var alu20 = exp2(((val26-val2)*1.4426950408889634f));
    var alu21 = exp2(((val27-val2)*1.4426950408889634f));
    var alu22 = exp2(((val28-val2)*1.4426950408889634f));
    var alu23 = exp2(((val29-val2)*1.4426950408889634f));
    acc0[1] = (acc0[1]+(alu20*val6)+(alu21*val10)+(alu22*val14)+(alu23*val18));
    acc0[4] = (acc0[4]+(alu20*val7)+(alu21*val11)+(alu22*val15)+(alu23*val19));
    acc0[7] = (acc0[7]+(alu20*val8)+(alu21*val12)+(alu22*val16)+(alu23*val20));
    acc0[10] = (acc0[10]+(alu20*val9)+(alu21*val13)+(alu22*val17)+(alu23*val21));
    var alu28 = exp2(((val30-val4)*1.4426950408889634f));
    var alu29 = exp2(((val31-val4)*1.4426950408889634f));
    var alu30 = exp2(((val32-val4)*1.4426950408889634f));
    var alu31 = exp2(((val33-val4)*1.4426950408889634f));
    acc0[2] = (acc0[2]+(alu28*val6)+(alu29*val10)+(alu30*val14)+(alu31*val18));
    acc0[5] = (acc0[5]+(alu28*val7)+(alu29*val11)+(alu30*val15)+(alu31*val19));
    acc0[8] = (acc0[8]+(alu28*val8)+(alu29*val12)+(alu30*val16)+(alu31*val20));
    acc0[11] = (acc0[11]+(alu28*val9)+(alu29*val13)+(alu30*val17)+(alu31*val21));
    var alu36 = exp2(((val22-val0)*1.4426950408889634f));
    acc0[0] = (acc0[0]+(alu36*val6)+(alu17*val10)+(alu18*val14)+(alu19*val18));
    acc0[3] = (acc0[3]+(alu36*val7)+(alu17*val11)+(alu18*val15)+(alu19*val19));
    acc0[6] = (acc0[6]+(alu36*val8)+(alu17*val12)+(alu18*val16)+(alu19*val20));
    acc0[9] = (acc0[9]+(alu36*val9)+(alu17*val13)+(alu18*val17)+(alu19*val21));
  }
  var alu42 = (1/val3);
  var alu43 = (1/val5);
  var alu44 = (1/val1);
  var alu45 = ((gidx0*768)+(lidx1*192)+cast0+(gidx1*192000)+(lidx0*96000));
  data0_576000[alu45] = (acc0[0]*alu44);
  data0_576000[(alu45+64)] = (acc0[1]*alu42);
  data0_576000[(alu45+128)] = (acc0[2]*alu43);
  data0_576000[(alu45+1)] = (acc0[3]*alu44);
  data0_576000[(alu45+65)] = (acc0[4]*alu42);
  data0_576000[(alu45+129)] = (acc0[5]*alu43);
  data0_576000[(alu45+2)] = (acc0[6]*alu44);
  data0_576000[(alu45+66)] = (acc0[7]*alu42);
  data0_576000[(alu45+130)] = (acc0[8]*alu43);
  data0_576000[(alu45+3)] = (acc0[9]*alu44);
  data0_576000[(alu45+67)] = (acc0[10]*alu42);
  data0_576000[(alu45+131)] = (acc0[11]*alu43);
}`;

const r_125_8_4_16_3_3_6_16_4 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_576000:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1_576000:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2_576000:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3_147456:array<f32>;
@group(0) @binding(5)var<storage,read_write>data4_384:array<f32>;
@compute @workgroup_size(4,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var acc0: array<f32,9>;
  var lidx0 = i32(lindex.x); /* 4 */
  var gidx0 = i32(gindex.x); /* 8 */
  var lidx1 = i32(lindex.y); /* 16 */
  var gidx1 = i32(gindex.y); /* 125 */
  acc0[0] = 0.0f;
  acc0[1] = 0.0f;
  acc0[2] = 0.0f;
  acc0[3] = 0.0f;
  acc0[4] = 0.0f;
  acc0[5] = 0.0f;
  acc0[6] = 0.0f;
  acc0[7] = 0.0f;
  acc0[8] = 0.0f;
  var alu9 = ((gidx0*48)+(lidx1*3));
  var val0 = data4_384[alu9];
  var alu10 = (alu9+(gidx1*4608)+(lidx0*1152));
  var val1 = data1_576000[alu10];
  var alu11 = (alu10+1);
  var val2 = data1_576000[alu11];
  var alu12 = (alu10+2);
  var val3 = data1_576000[alu12];
  var alu13 = (alu10+384);
  var val4 = data1_576000[alu13];
  var alu14 = (alu10+385);
  var val5 = data1_576000[alu14];
  var alu15 = (alu10+386);
  var val6 = data1_576000[alu15];
  var alu16 = (alu10+768);
  var val7 = data1_576000[alu16];
  var alu17 = (alu10+769);
  var val8 = data1_576000[alu17];
  var alu18 = (alu10+770);
  var val9 = data1_576000[alu18];
  var val10 = data4_384[(alu9+1)];
  var val11 = data4_384[(alu9+2)];
  for (var Ridx0_0 = 0; Ridx0_0 < 6; Ridx0_0++) {
    var precast0 = Ridx0_0;
    var precast1 = (bitcast<u32>(precast0)<<6u);
    for (var Ridx0_1 = 0; Ridx0_1 < 16; Ridx0_1++) {
      var precast2 = Ridx0_1;
      var precast3 = (bitcast<u32>(precast2)<<2u);
      var cast0 = bitcast<i32>(precast3);
      var alu19 = ((gidx0*18432)+(lidx1*1152)+bitcast<i32>(precast1)+cast0);
      var val12 = data3_147456[alu19];
      var val13 = data3_147456[(alu19+1)];
      var val14 = data3_147456[(alu19+2)];
      var val15 = data3_147456[(alu19+3)];
      var val16 = data3_147456[(alu19+384)];
      var val17 = data3_147456[(alu19+385)];
      var val18 = data3_147456[(alu19+386)];
      var val19 = data3_147456[(alu19+387)];
      var val20 = data3_147456[(alu19+768)];
      var val21 = data3_147456[(alu19+769)];
      var val22 = data3_147456[(alu19+770)];
      var val23 = data3_147456[(alu19+771)];
      var alu20 = ((gidx1*768)+(lidx0*192)+cast0+(Ridx0_0*96000));
      var val24 = data2_576000[alu20];
      var val25 = data2_576000[(alu20+1)];
      var val26 = data2_576000[(alu20+2)];
      var val27 = data2_576000[(alu20+3)];
      var val28 = data2_576000[(alu20+64)];
      var val29 = data2_576000[(alu20+65)];
      var val30 = data2_576000[(alu20+66)];
      var val31 = data2_576000[(alu20+67)];
      var val32 = data2_576000[(alu20+128)];
      var val33 = data2_576000[(alu20+129)];
      var val34 = data2_576000[(alu20+130)];
      var val35 = data2_576000[(alu20+131)];
      acc0[1] = (acc0[1]+(val28*val12)+(val29*val13)+(val30*val14)+(val31*val15));
      acc0[4] = (acc0[4]+(val28*val16)+(val29*val17)+(val30*val18)+(val31*val19));
      acc0[7] = (acc0[7]+(val28*val20)+(val29*val21)+(val30*val22)+(val31*val23));
      acc0[2] = (acc0[2]+(val32*val12)+(val33*val13)+(val34*val14)+(val35*val15));
      acc0[5] = (acc0[5]+(val32*val16)+(val33*val17)+(val34*val18)+(val35*val19));
      acc0[8] = (acc0[8]+(val32*val20)+(val33*val21)+(val34*val22)+(val35*val23));
      acc0[3] = (acc0[3]+(val24*val16)+(val25*val17)+(val26*val18)+(val27*val19));
      acc0[6] = (acc0[6]+(val24*val20)+(val25*val21)+(val26*val22)+(val27*val23));
      acc0[0] = (acc0[0]+(val24*val12)+(val25*val13)+(val26*val14)+(val27*val15));
    }
  }
  data0_576000[alu10] = (val1+acc0[0]+val0);
  data0_576000[alu11] = (val2+acc0[3]+val10);
  data0_576000[alu12] = (val3+acc0[6]+val11);
  data0_576000[alu13] = (val4+acc0[1]+val0);
  data0_576000[alu14] = (val5+acc0[4]+val10);
  data0_576000[alu15] = (val6+acc0[7]+val11);
  data0_576000[alu16] = (val7+acc0[2]+val0);
  data0_576000[alu17] = (val8+acc0[5]+val10);
  data0_576000[alu18] = (val9+acc0[8]+val11);
}`;

const r_125_32_4_16_3_3_96_4 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_2304000:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1_576000:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2_589824:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3_1536:array<f32>;
@compute @workgroup_size(4,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var acc0: array<f32,9>;
  var lidx0 = i32(lindex.x); /* 4 */
  var lidx1 = i32(lindex.y); /* 16 */
  var gidx0 = i32(gindex.x); /* 32 */
  var gidx1 = i32(gindex.y); /* 125 */
  acc0[0] = 0.0f;
  acc0[1] = 0.0f;
  acc0[2] = 0.0f;
  acc0[3] = 0.0f;
  acc0[4] = 0.0f;
  acc0[5] = 0.0f;
  acc0[6] = 0.0f;
  acc0[7] = 0.0f;
  acc0[8] = 0.0f;
  var alu9 = ((gidx0*48)+(lidx1*3));
  var val0 = data3_1536[alu9];
  var val1 = data3_1536[(alu9+1)];
  var val2 = data3_1536[(alu9+2)];
  for (var Ridx0 = 0; Ridx0 < 96; Ridx0++) {
    var precast0 = Ridx0;
    var precast1 = (bitcast<u32>(precast0)<<2u);
    var cast0 = bitcast<i32>(precast1);
    var alu10 = ((gidx0*18432)+(lidx1*1152)+cast0);
    var val3 = data2_589824[alu10];
    var val4 = data2_589824[(alu10+1)];
    var val5 = data2_589824[(alu10+2)];
    var val6 = data2_589824[(alu10+3)];
    var val7 = data2_589824[(alu10+384)];
    var val8 = data2_589824[(alu10+385)];
    var val9 = data2_589824[(alu10+386)];
    var val10 = data2_589824[(alu10+387)];
    var val11 = data2_589824[(alu10+768)];
    var val12 = data2_589824[(alu10+769)];
    var val13 = data2_589824[(alu10+770)];
    var val14 = data2_589824[(alu10+771)];
    var alu11 = ((gidx1*4608)+(lidx0*1152)+cast0);
    var val15 = data1_576000[alu11];
    var val16 = data1_576000[(alu11+1)];
    var val17 = data1_576000[(alu11+2)];
    var val18 = data1_576000[(alu11+3)];
    var val19 = data1_576000[(alu11+384)];
    var val20 = data1_576000[(alu11+385)];
    var val21 = data1_576000[(alu11+386)];
    var val22 = data1_576000[(alu11+387)];
    var val23 = data1_576000[(alu11+768)];
    var val24 = data1_576000[(alu11+769)];
    var val25 = data1_576000[(alu11+770)];
    var val26 = data1_576000[(alu11+771)];
    acc0[1] = (acc0[1]+(val19*val3)+(val20*val4)+(val21*val5)+(val22*val6));
    acc0[4] = (acc0[4]+(val19*val7)+(val20*val8)+(val21*val9)+(val22*val10));
    acc0[7] = (acc0[7]+(val19*val11)+(val20*val12)+(val21*val13)+(val22*val14));
    acc0[2] = (acc0[2]+(val23*val3)+(val24*val4)+(val25*val5)+(val26*val6));
    acc0[5] = (acc0[5]+(val23*val7)+(val24*val8)+(val25*val9)+(val26*val10));
    acc0[8] = (acc0[8]+(val23*val11)+(val24*val12)+(val25*val13)+(val26*val14));
    acc0[3] = (acc0[3]+(val15*val7)+(val16*val8)+(val17*val9)+(val18*val10));
    acc0[6] = (acc0[6]+(val15*val11)+(val16*val12)+(val17*val13)+(val18*val14));
    acc0[0] = (acc0[0]+(val15*val3)+(val16*val4)+(val17*val5)+(val18*val6));
  }
  var alu22 = (acc0[0]+val0);
  var alu23 = (acc0[1]+val0);
  var alu24 = (acc0[2]+val0);
  var alu25 = (acc0[3]+val1);
  var alu26 = (acc0[4]+val1);
  var alu27 = (acc0[5]+val1);
  var alu28 = (acc0[6]+val2);
  var alu29 = (acc0[7]+val2);
  var alu30 = (acc0[8]+val2);
  var alu31 = (alu9+(gidx1*18432)+(lidx0*4608));
  data0_2304000[alu31] = ((1/(1.0f+exp2(((alu22+(0.044715f*alu22*alu22*alu22))*-2.302208198144325f))))*alu22);
  data0_2304000[(alu31+1536)] = ((1/(1.0f+exp2(((alu23+(0.044715f*alu23*alu23*alu23))*-2.302208198144325f))))*alu23);
  data0_2304000[(alu31+3072)] = ((1/(1.0f+exp2(((alu24+(0.044715f*alu24*alu24*alu24))*-2.302208198144325f))))*alu24);
  data0_2304000[(alu31+1)] = ((1/(1.0f+exp2(((alu25+(0.044715f*alu25*alu25*alu25))*-2.302208198144325f))))*alu25);
  data0_2304000[(alu31+1537)] = ((1/(1.0f+exp2(((alu26+(0.044715f*alu26*alu26*alu26))*-2.302208198144325f))))*alu26);
  data0_2304000[(alu31+3073)] = ((1/(1.0f+exp2(((alu27+(0.044715f*alu27*alu27*alu27))*-2.302208198144325f))))*alu27);
  data0_2304000[(alu31+2)] = ((1/(1.0f+exp2(((alu28+(0.044715f*alu28*alu28*alu28))*-2.302208198144325f))))*alu28);
  data0_2304000[(alu31+1538)] = ((1/(1.0f+exp2(((alu29+(0.044715f*alu29*alu29*alu29))*-2.302208198144325f))))*alu29);
  data0_2304000[(alu31+3074)] = ((1/(1.0f+exp2(((alu30+(0.044715f*alu30*alu30*alu30))*-2.302208198144325f))))*alu30);
}`;

const r_125_8_4_16_3_3_384_4 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_576000:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1_576000:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2_2304000:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3_589824:array<f32>;
@group(0) @binding(5)var<storage,read_write>data4_384:array<f32>;
@compute @workgroup_size(4,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var acc0: array<f32,9>;
  var lidx0 = i32(lindex.x); /* 4 */
  var gidx0 = i32(gindex.x); /* 8 */
  var lidx1 = i32(lindex.y); /* 16 */
  var gidx1 = i32(gindex.y); /* 125 */
  acc0[0] = 0.0f;
  acc0[1] = 0.0f;
  acc0[2] = 0.0f;
  acc0[3] = 0.0f;
  acc0[4] = 0.0f;
  acc0[5] = 0.0f;
  acc0[6] = 0.0f;
  acc0[7] = 0.0f;
  acc0[8] = 0.0f;
  var alu9 = ((gidx0*48)+(lidx1*3));
  var val0 = data4_384[alu9];
  var alu10 = (alu9+(gidx1*4608)+(lidx0*1152));
  var val1 = data1_576000[alu10];
  var alu11 = (alu10+1);
  var val2 = data1_576000[alu11];
  var alu12 = (alu10+2);
  var val3 = data1_576000[alu12];
  var alu13 = (alu10+384);
  var val4 = data1_576000[alu13];
  var alu14 = (alu10+385);
  var val5 = data1_576000[alu14];
  var alu15 = (alu10+386);
  var val6 = data1_576000[alu15];
  var alu16 = (alu10+768);
  var val7 = data1_576000[alu16];
  var alu17 = (alu10+769);
  var val8 = data1_576000[alu17];
  var alu18 = (alu10+770);
  var val9 = data1_576000[alu18];
  var val10 = data4_384[(alu9+1)];
  var val11 = data4_384[(alu9+2)];
  for (var Ridx0 = 0; Ridx0 < 384; Ridx0++) {
    var precast0 = Ridx0;
    var precast1 = (bitcast<u32>(precast0)<<2u);
    var cast0 = bitcast<i32>(precast1);
    var alu19 = ((gidx0*73728)+(lidx1*4608)+cast0);
    var val12 = data3_589824[alu19];
    var val13 = data3_589824[(alu19+1)];
    var val14 = data3_589824[(alu19+2)];
    var val15 = data3_589824[(alu19+3)];
    var val16 = data3_589824[(alu19+1536)];
    var val17 = data3_589824[(alu19+1537)];
    var val18 = data3_589824[(alu19+1538)];
    var val19 = data3_589824[(alu19+1539)];
    var val20 = data3_589824[(alu19+3072)];
    var val21 = data3_589824[(alu19+3073)];
    var val22 = data3_589824[(alu19+3074)];
    var val23 = data3_589824[(alu19+3075)];
    var alu20 = ((gidx1*18432)+(lidx0*4608)+cast0);
    var val24 = data2_2304000[alu20];
    var val25 = data2_2304000[(alu20+1)];
    var val26 = data2_2304000[(alu20+2)];
    var val27 = data2_2304000[(alu20+3)];
    var val28 = data2_2304000[(alu20+1536)];
    var val29 = data2_2304000[(alu20+1537)];
    var val30 = data2_2304000[(alu20+1538)];
    var val31 = data2_2304000[(alu20+1539)];
    var val32 = data2_2304000[(alu20+3072)];
    var val33 = data2_2304000[(alu20+3073)];
    var val34 = data2_2304000[(alu20+3074)];
    var val35 = data2_2304000[(alu20+3075)];
    acc0[1] = (acc0[1]+(val28*val12)+(val29*val13)+(val30*val14)+(val31*val15));
    acc0[4] = (acc0[4]+(val28*val16)+(val29*val17)+(val30*val18)+(val31*val19));
    acc0[7] = (acc0[7]+(val28*val20)+(val29*val21)+(val30*val22)+(val31*val23));
    acc0[2] = (acc0[2]+(val32*val12)+(val33*val13)+(val34*val14)+(val35*val15));
    acc0[5] = (acc0[5]+(val32*val16)+(val33*val17)+(val34*val18)+(val35*val19));
    acc0[8] = (acc0[8]+(val32*val20)+(val33*val21)+(val34*val22)+(val35*val23));
    acc0[3] = (acc0[3]+(val24*val16)+(val25*val17)+(val26*val18)+(val27*val19));
    acc0[6] = (acc0[6]+(val24*val20)+(val25*val21)+(val26*val22)+(val27*val23));
    acc0[0] = (acc0[0]+(val24*val12)+(val25*val13)+(val26*val14)+(val27*val15));
  }
  data0_576000[alu11] = (val2+acc0[3]+val10);
  data0_576000[alu12] = (val3+acc0[6]+val11);
  data0_576000[alu13] = (val4+acc0[1]+val0);
  data0_576000[alu14] = (val5+acc0[4]+val10);
  data0_576000[alu15] = (val6+acc0[7]+val11);
  data0_576000[alu16] = (val7+acc0[2]+val0);
  data0_576000[alu17] = (val8+acc0[5]+val10);
  data0_576000[alu18] = (val9+acc0[8]+val11);
  data0_576000[alu10] = (val1+acc0[0]+val0);
}`;

const setupNet = async (device, safetensor) => {
    const metadata = getTensorMetadata(safetensor);
    const infinityBuf = createInfinityUniformBuf(device);

    const layouts=[device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]})]

    const buf_0 = createEmptyBuf(device, 4608000);;
    const input0 = createEmptyBuf(device, 960000);;
    const buf_1 = createWeightBuf(device, 368640, getTensorBuffer(safetensor, metadata['conv1.weight']));
    const buf_2 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['conv1.bias']));
    const buf_3 = createEmptyBuf(device, 2304000);;
    const buf_4 = createWeightBuf(device, 1769472, getTensorBuffer(safetensor, metadata['conv2.weight']));
    const buf_5 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['conv2.bias']));
    const buf_6 = createWeightBuf(device, 2304000, getTensorBuffer(safetensor, metadata['positional_embedding']));
    const buf_7 = createEmptyBuf(device, 6000);;
    const buf_8 = createEmptyBuf(device, 6000);;
    const buf_9 = createEmptyBuf(device, 2304000);;
    const buf_10 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.0.attn_ln.weight']));
    const buf_11 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.0.attn_ln.bias']));
    const buf_12 = createEmptyBuf(device, 2304000);;
    const buf_13 = createWeightBuf(device, 589824, getTensorBuffer(safetensor, metadata['blocks.0.attn.query.weight']));
    const buf_14 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.0.attn.query.bias']));
    const buf_15 = createEmptyBuf(device, 2304000);;
    const buf_16 = createWeightBuf(device, 589824, getTensorBuffer(safetensor, metadata['blocks.0.attn.key.weight']));
    const buf_17 = createEmptyBuf(device, 2304000);;
    const buf_18 = createWeightBuf(device, 589824, getTensorBuffer(safetensor, metadata['blocks.0.attn.value.weight']));
    const buf_19 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.0.attn.value.bias']));
    const buf_20 = createEmptyBuf(device, 54000000);;
    const buf_21 = createEmptyBuf(device, 36000);;
    const buf_22 = createEmptyBuf(device, 36000);;
    const buf_23 = createWeightBuf(device, 589824, getTensorBuffer(safetensor, metadata['blocks.0.attn.out.weight']));
    const buf_24 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.0.attn.out.bias']));
    const buf_25 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.0.mlp_ln.weight']));
    const buf_26 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.0.mlp_ln.bias']));
    const buf_27 = createEmptyBuf(device, 9216000);;
    const buf_28 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.0.mlp.0.weight']));
    const buf_29 = createWeightBuf(device, 6144, getTensorBuffer(safetensor, metadata['blocks.0.mlp.0.bias']));
    const buf_30 = createEmptyBuf(device, 2304000);;
    const buf_31 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.0.mlp.2.weight']));
    const buf_32 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.0.mlp.2.bias']));
    const buf_33 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.1.attn_ln.weight']));
    const buf_34 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.1.attn_ln.bias']));
    const buf_35 = createWeightBuf(device, 589824, getTensorBuffer(safetensor, metadata['blocks.1.attn.query.weight']));
    const buf_36 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.1.attn.query.bias']));
    const buf_37 = createWeightBuf(device, 589824, getTensorBuffer(safetensor, metadata['blocks.1.attn.key.weight']));
    const buf_38 = createWeightBuf(device, 589824, getTensorBuffer(safetensor, metadata['blocks.1.attn.value.weight']));
    const buf_39 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.1.attn.value.bias']));
    const buf_40 = createWeightBuf(device, 589824, getTensorBuffer(safetensor, metadata['blocks.1.attn.out.weight']));
    const buf_41 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.1.attn.out.bias']));
    const buf_42 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.1.mlp_ln.weight']));
    const buf_43 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.1.mlp_ln.bias']));
    const buf_44 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.1.mlp.0.weight']));
    const buf_45 = createWeightBuf(device, 6144, getTensorBuffer(safetensor, metadata['blocks.1.mlp.0.bias']));
    const buf_46 = createEmptyBuf(device, 2304000);;
    const buf_47 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.1.mlp.2.weight']));
    const buf_48 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.1.mlp.2.bias']));
    const buf_49 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.2.attn_ln.weight']));
    const buf_50 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.2.attn_ln.bias']));
    const buf_51 = createWeightBuf(device, 589824, getTensorBuffer(safetensor, metadata['blocks.2.attn.query.weight']));
    const buf_52 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.2.attn.query.bias']));
    const buf_53 = createWeightBuf(device, 589824, getTensorBuffer(safetensor, metadata['blocks.2.attn.key.weight']));
    const buf_54 = createWeightBuf(device, 589824, getTensorBuffer(safetensor, metadata['blocks.2.attn.value.weight']));
    const buf_55 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.2.attn.value.bias']));
    const buf_56 = createWeightBuf(device, 589824, getTensorBuffer(safetensor, metadata['blocks.2.attn.out.weight']));
    const buf_57 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.2.attn.out.bias']));
    const buf_58 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.2.mlp_ln.weight']));
    const buf_59 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.2.mlp_ln.bias']));
    const buf_60 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.2.mlp.0.weight']));
    const buf_61 = createWeightBuf(device, 6144, getTensorBuffer(safetensor, metadata['blocks.2.mlp.0.bias']));
    const buf_62 = createEmptyBuf(device, 2304000);;
    const buf_63 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.2.mlp.2.weight']));
    const buf_64 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.2.mlp.2.bias']));
    const buf_65 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.3.attn_ln.weight']));
    const buf_66 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.3.attn_ln.bias']));
    const buf_67 = createWeightBuf(device, 589824, getTensorBuffer(safetensor, metadata['blocks.3.attn.query.weight']));
    const buf_68 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.3.attn.query.bias']));
    const buf_69 = createWeightBuf(device, 589824, getTensorBuffer(safetensor, metadata['blocks.3.attn.key.weight']));
    const buf_70 = createWeightBuf(device, 589824, getTensorBuffer(safetensor, metadata['blocks.3.attn.value.weight']));
    const buf_71 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.3.attn.value.bias']));
    const buf_72 = createWeightBuf(device, 589824, getTensorBuffer(safetensor, metadata['blocks.3.attn.out.weight']));
    const buf_73 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.3.attn.out.bias']));
    const buf_74 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.3.mlp_ln.weight']));
    const buf_75 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.3.mlp_ln.bias']));
    const buf_76 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.3.mlp.0.weight']));
    const buf_77 = createWeightBuf(device, 6144, getTensorBuffer(safetensor, metadata['blocks.3.mlp.0.bias']));
    const buf_78 = createEmptyBuf(device, 2304000);;
    const buf_79 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.3.mlp.2.weight']));
    const buf_80 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.3.mlp.2.bias']));
    const output0 = createEmptyBuf(device, 2304000);;
    const buf_81 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['ln_post.weight']));
    const buf_82 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['ln_post.bias']));

    const gpuWriteBuffer0 = device.createBuffer({size:input0.size, usage: GPUBufferUsage.COPY_SRC | GPUBufferUsage.MAP_WRITE });

    const gpuReadBuffer0 = device.createBuffer({size:output0.size, usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ });

    const kernels = [r_8_125_16_8_3_3_80_3, r_125_8_4_16_3_3_384_3, r_1500_16_24, r_1500_16_24n1, E_125_8_4_16_3_3, r_125_8_4_16_3_3_96_4, r_125_8_4_16_3_3_96_4n1, r_125_8_4_16_3_3_96_4, r_2_125_125_3_4_4_3_3_16_4, r_375_8_3_375_4, r_375_8_3_375_4n1, r_3_125_2_4_16_4_3_375_4, r_125_8_4_16_3_3_6_16_4, r_1500_16_24, r_1500_16_24n1, E_125_8_4_16_3_3, r_125_32_4_16_3_3_96_4, r_125_8_4_16_3_3_384_4, r_1500_16_24, r_1500_16_24n1, E_125_8_4_16_3_3, r_125_8_4_16_3_3_96_4, r_125_8_4_16_3_3_96_4n1, r_125_8_4_16_3_3_96_4, r_2_125_125_3_4_4_3_3_16_4, r_375_8_3_375_4, r_375_8_3_375_4n1, r_3_125_2_4_16_4_3_375_4, r_125_8_4_16_3_3_6_16_4, r_1500_16_24, r_1500_16_24n1, E_125_8_4_16_3_3, r_125_32_4_16_3_3_96_4, r_125_8_4_16_3_3_384_4, r_1500_16_24, r_1500_16_24n1, E_125_8_4_16_3_3, r_125_8_4_16_3_3_96_4, r_125_8_4_16_3_3_96_4n1, r_125_8_4_16_3_3_96_4, r_2_125_125_3_4_4_3_3_16_4, r_375_8_3_375_4, r_375_8_3_375_4n1, r_3_125_2_4_16_4_3_375_4, r_125_8_4_16_3_3_6_16_4, r_1500_16_24, r_1500_16_24n1, E_125_8_4_16_3_3, r_125_32_4_16_3_3_96_4, r_125_8_4_16_3_3_384_4, r_1500_16_24, r_1500_16_24n1, E_125_8_4_16_3_3, r_125_8_4_16_3_3_96_4, r_125_8_4_16_3_3_96_4n1, r_125_8_4_16_3_3_96_4, r_2_125_125_3_4_4_3_3_16_4, r_375_8_3_375_4, r_375_8_3_375_4n1, r_3_125_2_4_16_4_3_375_4, r_125_8_4_16_3_3_6_16_4, r_1500_16_24, r_1500_16_24n1, E_125_8_4_16_3_3, r_125_32_4_16_3_3_96_4, r_125_8_4_16_3_3_384_4, r_1500_16_24, r_1500_16_24n1, E_125_8_4_16_3_3];
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
        addComputePass(device, commandEncoder, pipelines[0], layouts[0], infinityBuf, [buf_0, input0, buf_1, buf_2], [125, 8, 1]);
        addComputePass(device, commandEncoder, pipelines[1], layouts[1], infinityBuf, [buf_3, buf_0, buf_4, buf_5, buf_6], [8, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[2], layouts[2], infinityBuf, [buf_7, buf_3], [1500, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[3], layouts[3], infinityBuf, [buf_8, buf_3, buf_7], [1500, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[4], layouts[4], infinityBuf, [buf_9, buf_3, buf_7, buf_8, buf_10, buf_11], [8, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[5], layouts[5], infinityBuf, [buf_12, buf_9, buf_13, buf_14], [8, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[6], layouts[6], infinityBuf, [buf_15, buf_9, buf_16], [8, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[7], layouts[7], infinityBuf, [buf_17, buf_9, buf_18, buf_19], [8, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[8], layouts[8], infinityBuf, [buf_20, buf_12, buf_15], [125, 125, 2]);
        addComputePass(device, commandEncoder, pipelines[9], layouts[9], infinityBuf, [buf_21, buf_20], [375, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[10], layouts[10], infinityBuf, [buf_22, buf_20, buf_21], [375, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[11], layouts[11], infinityBuf, [buf_15, buf_20, buf_21, buf_22, buf_17], [125, 3, 1]);
        addComputePass(device, commandEncoder, pipelines[12], layouts[12], infinityBuf, [buf_17, buf_3, buf_15, buf_23, buf_24], [8, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[13], layouts[13], infinityBuf, [buf_8, buf_17], [1500, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[14], layouts[14], infinityBuf, [buf_7, buf_17, buf_8], [1500, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[15], layouts[15], infinityBuf, [buf_15, buf_17, buf_8, buf_7, buf_25, buf_26], [8, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[16], layouts[16], infinityBuf, [buf_27, buf_15, buf_28, buf_29], [32, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[17], layouts[17], infinityBuf, [buf_30, buf_17, buf_27, buf_31, buf_32], [8, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[18], layouts[18], infinityBuf, [buf_7, buf_30], [1500, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[19], layouts[19], infinityBuf, [buf_8, buf_30, buf_7], [1500, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[20], layouts[20], infinityBuf, [buf_17, buf_30, buf_7, buf_8, buf_33, buf_34], [8, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[21], layouts[21], infinityBuf, [buf_15, buf_17, buf_35, buf_36], [8, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[22], layouts[22], infinityBuf, [buf_3, buf_17, buf_37], [8, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[23], layouts[23], infinityBuf, [buf_12, buf_17, buf_38, buf_39], [8, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[24], layouts[24], infinityBuf, [buf_20, buf_15, buf_3], [125, 125, 2]);
        addComputePass(device, commandEncoder, pipelines[25], layouts[25], infinityBuf, [buf_22, buf_20], [375, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[26], layouts[26], infinityBuf, [buf_21, buf_20, buf_22], [375, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[27], layouts[27], infinityBuf, [buf_3, buf_20, buf_22, buf_21, buf_12], [125, 3, 1]);
        addComputePass(device, commandEncoder, pipelines[28], layouts[28], infinityBuf, [buf_12, buf_30, buf_3, buf_40, buf_41], [8, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[29], layouts[29], infinityBuf, [buf_8, buf_12], [1500, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[30], layouts[30], infinityBuf, [buf_7, buf_12, buf_8], [1500, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[31], layouts[31], infinityBuf, [buf_3, buf_12, buf_8, buf_7, buf_42, buf_43], [8, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[32], layouts[32], infinityBuf, [buf_27, buf_3, buf_44, buf_45], [32, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[33], layouts[33], infinityBuf, [buf_46, buf_12, buf_27, buf_47, buf_48], [8, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[34], layouts[34], infinityBuf, [buf_7, buf_46], [1500, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[35], layouts[35], infinityBuf, [buf_8, buf_46, buf_7], [1500, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[36], layouts[36], infinityBuf, [buf_12, buf_46, buf_7, buf_8, buf_49, buf_50], [8, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[37], layouts[37], infinityBuf, [buf_3, buf_12, buf_51, buf_52], [8, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[38], layouts[38], infinityBuf, [buf_15, buf_12, buf_53], [8, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[39], layouts[39], infinityBuf, [buf_17, buf_12, buf_54, buf_55], [8, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[40], layouts[40], infinityBuf, [buf_20, buf_3, buf_15], [125, 125, 2]);
        addComputePass(device, commandEncoder, pipelines[41], layouts[41], infinityBuf, [buf_21, buf_20], [375, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[42], layouts[42], infinityBuf, [buf_22, buf_20, buf_21], [375, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[43], layouts[43], infinityBuf, [buf_15, buf_20, buf_21, buf_22, buf_17], [125, 3, 1]);
        addComputePass(device, commandEncoder, pipelines[44], layouts[44], infinityBuf, [buf_17, buf_46, buf_15, buf_56, buf_57], [8, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[45], layouts[45], infinityBuf, [buf_8, buf_17], [1500, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[46], layouts[46], infinityBuf, [buf_7, buf_17, buf_8], [1500, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[47], layouts[47], infinityBuf, [buf_15, buf_17, buf_8, buf_7, buf_58, buf_59], [8, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[48], layouts[48], infinityBuf, [buf_27, buf_15, buf_60, buf_61], [32, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[49], layouts[49], infinityBuf, [buf_62, buf_17, buf_27, buf_63, buf_64], [8, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[50], layouts[50], infinityBuf, [buf_7, buf_62], [1500, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[51], layouts[51], infinityBuf, [buf_8, buf_62, buf_7], [1500, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[52], layouts[52], infinityBuf, [buf_17, buf_62, buf_7, buf_8, buf_65, buf_66], [8, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[53], layouts[53], infinityBuf, [buf_15, buf_17, buf_67, buf_68], [8, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[54], layouts[54], infinityBuf, [buf_3, buf_17, buf_69], [8, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[55], layouts[55], infinityBuf, [buf_12, buf_17, buf_70, buf_71], [8, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[56], layouts[56], infinityBuf, [buf_20, buf_15, buf_3], [125, 125, 2]);
        addComputePass(device, commandEncoder, pipelines[57], layouts[57], infinityBuf, [buf_22, buf_20], [375, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[58], layouts[58], infinityBuf, [buf_21, buf_20, buf_22], [375, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[59], layouts[59], infinityBuf, [buf_3, buf_20, buf_22, buf_21, buf_12], [125, 3, 1]);
        addComputePass(device, commandEncoder, pipelines[60], layouts[60], infinityBuf, [buf_12, buf_62, buf_3, buf_72, buf_73], [8, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[61], layouts[61], infinityBuf, [buf_8, buf_12], [1500, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[62], layouts[62], infinityBuf, [buf_7, buf_12, buf_8], [1500, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[63], layouts[63], infinityBuf, [buf_3, buf_12, buf_8, buf_7, buf_74, buf_75], [8, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[64], layouts[64], infinityBuf, [buf_27, buf_3, buf_76, buf_77], [32, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[65], layouts[65], infinityBuf, [buf_78, buf_12, buf_27, buf_79, buf_80], [8, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[66], layouts[66], infinityBuf, [buf_7, buf_78], [1500, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[67], layouts[67], infinityBuf, [buf_8, buf_78, buf_7], [1500, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[68], layouts[68], infinityBuf, [output0, buf_78, buf_7, buf_8, buf_81, buf_82], [8, 125, 1]);
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
export default encoder;
