
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
  var gidx0 = i32(gindex.x); /* 125 */
  var gidx1 = i32(gindex.y); /* 8 */
  var lidx0 = i32(lindex.x); /* 16 */
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
  for (var Ridx0 = 0; Ridx0 < 80; Ridx0++) {
    var alu10 = (alu0+(Ridx0*3000));
    var val0 = select(0.0f, data1_240000[(alu10+-1)], (0<(gidx0+lidx1)));
    var alu11 = ((gidx1*11520)+(lidx0*720)+(Ridx0*3));
    var val1 = data2_92160[(alu11+1)];
    var val2 = data2_92160[alu11];
    var val3 = data1_240000[(alu10+1)];
    var val4 = data1_240000[alu10];
    var val5 = data2_92160[(alu11+2)];
    var val6 = data2_92160[(alu11+240)];
    var val7 = data2_92160[(alu11+241)];
    var val8 = data2_92160[(alu11+242)];
    var val9 = data2_92160[(alu11+480)];
    var val10 = data2_92160[(alu11+481)];
    var val11 = data2_92160[(alu11+482)];
    var val12 = data1_240000[(alu10+2)];
    var val13 = select(0.0f, data1_240000[(alu10+3)], ((lidx1+bitcast<i32>((bitcast<u32>(gidx0)<<3u)))<999));
    acc0[0] = (acc0[0]+(val0*val2)+(val4*val1)+(val3*val5));
    acc0[1] = (acc0[1]+(val0*val6)+(val4*val7)+(val3*val8));
    acc0[2] = (acc0[2]+(val0*val9)+(val4*val10)+(val3*val11));
    acc0[3] = (acc0[3]+(val4*val2)+(val3*val1)+(val12*val5));
    acc0[4] = (acc0[4]+(val4*val6)+(val3*val7)+(val12*val8));
    acc0[5] = (acc0[5]+(val4*val9)+(val3*val10)+(val12*val11));
    acc0[6] = (acc0[6]+(val3*val2)+(val12*val1)+(val13*val5));
    acc0[7] = (acc0[7]+(val3*val6)+(val12*val7)+(val13*val8));
    acc0[8] = (acc0[8]+(val3*val9)+(val12*val10)+(val13*val11));
  }
  var alu22 = ((gidx1*48)+(lidx0*3));
  var val14 = data3_384[alu22];
  var val15 = data3_384[(alu22+1)];
  var val16 = data3_384[(alu22+2)];
  var alu23 = (alu0+(gidx1*144000)+(lidx0*9000));
  var alu24 = (acc0[1]+val15);
  var alu25 = (acc0[4]+val15);
  var alu26 = (acc0[7]+val15);
  data0_1152000[(alu23+3000)] = ((1/(1.0f+exp2(((alu24+(0.044715f*alu24*alu24*alu24))*-2.302208198144325f))))*alu24);
  data0_1152000[(alu23+3001)] = ((1/(1.0f+exp2(((alu25+(0.044715f*alu25*alu25*alu25))*-2.302208198144325f))))*alu25);
  data0_1152000[(alu23+3002)] = ((1/(1.0f+exp2(((alu26+(0.044715f*alu26*alu26*alu26))*-2.302208198144325f))))*alu26);
  var alu30 = (acc0[2]+val16);
  var alu31 = (acc0[5]+val16);
  var alu32 = (acc0[8]+val16);
  data0_1152000[(alu23+6000)] = ((1/(1.0f+exp2(((alu30+(0.044715f*alu30*alu30*alu30))*-2.302208198144325f))))*alu30);
  data0_1152000[(alu23+6001)] = ((1/(1.0f+exp2(((alu31+(0.044715f*alu31*alu31*alu31))*-2.302208198144325f))))*alu31);
  data0_1152000[(alu23+6002)] = ((1/(1.0f+exp2(((alu32+(0.044715f*alu32*alu32*alu32))*-2.302208198144325f))))*alu32);
  var alu36 = (acc0[0]+val14);
  var alu37 = (acc0[3]+val14);
  var alu38 = (acc0[6]+val14);
  data0_1152000[(alu23+1)] = ((1/(1.0f+exp2(((alu37+(0.044715f*alu37*alu37*alu37))*-2.302208198144325f))))*alu37);
  data0_1152000[(alu23+2)] = ((1/(1.0f+exp2(((alu38+(0.044715f*alu38*alu38*alu38))*-2.302208198144325f))))*alu38);
  data0_1152000[alu23] = ((1/(1.0f+exp2(((alu36+(0.044715f*alu36*alu36*alu36))*-2.302208198144325f))))*alu36);
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
  var gidx0 = i32(gindex.x); /* 8 */
  var gidx1 = i32(gindex.y); /* 125 */
  var lidx0 = i32(lindex.x); /* 4 */
  var lidx1 = i32(lindex.y); /* 16 */
  acc0[0] = 0.0f;
  acc0[1] = 0.0f;
  acc0[2] = 0.0f;
  acc0[3] = 0.0f;
  acc0[4] = 0.0f;
  acc0[5] = 0.0f;
  acc0[6] = 0.0f;
  acc0[7] = 0.0f;
  acc0[8] = 0.0f;
  for (var Ridx0 = 0; Ridx0 < 384; Ridx0++) {
    var alu9 = ((gidx1*24)+(lidx0*6)+(Ridx0*3000));
    var val0 = select(0.0f, data1_1152000[(alu9+-1)], (0<(gidx1+lidx0)));
    var alu10 = ((gidx0*55296)+(lidx1*3456)+(Ridx0*3));
    var val1 = data2_442368[(alu10+1)];
    var val2 = data2_442368[alu10];
    var val3 = data1_1152000[(alu9+1)];
    var val4 = data1_1152000[alu9];
    var val5 = data2_442368[(alu10+2)];
    var val6 = data2_442368[(alu10+1152)];
    var val7 = data2_442368[(alu10+1153)];
    var val8 = data2_442368[(alu10+1154)];
    var val9 = data2_442368[(alu10+2304)];
    var val10 = data2_442368[(alu10+2305)];
    var val11 = data2_442368[(alu10+2306)];
    var val12 = data1_1152000[(alu9+2)];
    var val13 = data1_1152000[(alu9+3)];
    var val14 = data1_1152000[(alu9+4)];
    var val15 = data1_1152000[(alu9+5)];
    acc0[0] = (acc0[0]+(val0*val2)+(val4*val1)+(val3*val5));
    acc0[1] = (acc0[1]+(val0*val6)+(val4*val7)+(val3*val8));
    acc0[2] = (acc0[2]+(val0*val9)+(val4*val10)+(val3*val11));
    acc0[3] = (acc0[3]+(val3*val2)+(val12*val1)+(val13*val5));
    acc0[4] = (acc0[4]+(val3*val6)+(val12*val7)+(val13*val8));
    acc0[5] = (acc0[5]+(val3*val9)+(val12*val10)+(val13*val11));
    acc0[6] = (acc0[6]+(val13*val2)+(val14*val1)+(val15*val5));
    acc0[7] = (acc0[7]+(val13*val6)+(val14*val7)+(val15*val8));
    acc0[8] = (acc0[8]+(val13*val9)+(val14*val10)+(val15*val11));
  }
  var alu21 = ((gidx0*48)+(lidx1*3));
  var val16 = data3_384[alu21];
  var alu22 = (alu21+(gidx1*4608)+(lidx0*1152));
  var alu23 = (alu22+1);
  var val17 = data4_576000[alu23];
  var alu24 = (alu22+385);
  var val18 = data4_576000[alu24];
  var val19 = data4_576000[alu22];
  var val20 = data3_384[(alu21+1)];
  var val21 = data3_384[(alu21+2)];
  var alu25 = (alu22+2);
  var val22 = data4_576000[alu25];
  var alu26 = (alu22+384);
  var val23 = data4_576000[alu26];
  var alu27 = (alu22+386);
  var val24 = data4_576000[alu27];
  var alu28 = (alu22+768);
  var val25 = data4_576000[alu28];
  var alu29 = (alu22+769);
  var val26 = data4_576000[alu29];
  var alu30 = (alu22+770);
  var val27 = data4_576000[alu30];
  var alu31 = (acc0[3]+val16);
  var alu32 = (acc0[4]+val20);
  var alu33 = (acc0[5]+val21);
  data0_576000[alu26] = (((1/(1.0f+exp2(((alu31+(0.044715f*alu31*alu31*alu31))*-2.302208198144325f))))*alu31)+val23);
  data0_576000[alu24] = (((1/(1.0f+exp2(((alu32+(0.044715f*alu32*alu32*alu32))*-2.302208198144325f))))*alu32)+val18);
  data0_576000[alu27] = (((1/(1.0f+exp2(((alu33+(0.044715f*alu33*alu33*alu33))*-2.302208198144325f))))*alu33)+val24);
  var alu37 = (acc0[6]+val16);
  var alu38 = (acc0[7]+val20);
  var alu39 = (acc0[8]+val21);
  data0_576000[alu28] = (((1/(1.0f+exp2(((alu37+(0.044715f*alu37*alu37*alu37))*-2.302208198144325f))))*alu37)+val25);
  data0_576000[alu29] = (((1/(1.0f+exp2(((alu38+(0.044715f*alu38*alu38*alu38))*-2.302208198144325f))))*alu38)+val26);
  data0_576000[alu30] = (((1/(1.0f+exp2(((alu39+(0.044715f*alu39*alu39*alu39))*-2.302208198144325f))))*alu39)+val27);
  var alu43 = (acc0[0]+val16);
  var alu44 = (acc0[1]+val20);
  var alu45 = (acc0[2]+val21);
  data0_576000[alu23] = (((1/(1.0f+exp2(((alu44+(0.044715f*alu44*alu44*alu44))*-2.302208198144325f))))*alu44)+val17);
  data0_576000[alu25] = (((1/(1.0f+exp2(((alu45+(0.044715f*alu45*alu45*alu45))*-2.302208198144325f))))*alu45)+val22);
  data0_576000[alu22] = (((1/(1.0f+exp2(((alu43+(0.044715f*alu43*alu43*alu43))*-2.302208198144325f))))*alu43)+val19);
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
  var gidx0 = i32(gindex.x); /* 1500 */
  var lidx0 = i32(lindex.x); /* 16 */
  acc0[0] = 0.0f;
  for (var Ridx0 = 0; Ridx0 < 24; Ridx0++) {
    var val0 = data1_576000[((lidx0*24)+Ridx0+(gidx0*384))];
    acc0[0] = (acc0[0]+val0);
  }
  temp0[lidx0] = acc0[0];
  workgroupBarrier();
  acc1[0] = 0.0f;
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
  var gidx0 = i32(gindex.x); /* 1500 */
  var val0 = data2_1500[gidx0];
  var lidx0 = i32(lindex.x); /* 16 */
  acc0[0] = 0.0f;
  for (var Ridx0 = 0; Ridx0 < 24; Ridx0++) {
    var val1 = data1_576000[((lidx0*24)+Ridx0+(gidx0*384))];
    var alu1 = (val1-val0);
    acc0[0] = (acc0[0]+(alu1*alu1));
  }
  temp0[lidx0] = acc0[0];
  workgroupBarrier();
  acc1[0] = 0.0f;
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
  var gidx0 = i32(gindex.x); /* 8 */
  var gidx1 = i32(gindex.y); /* 125 */
  var lidx0 = i32(lindex.x); /* 4 */
  var lidx1 = i32(lindex.y); /* 16 */
  var alu0 = ((gidx0*48)+(lidx1*3));
  var alu1 = (alu0+(gidx1*4608)+(lidx0*1152));
  var alu2 = (alu1+384);
  var val0 = data1_576000[alu2];
  var val1 = data1_576000[alu1];
  var alu3 = ((gidx1*12)+(lidx0*3));
  var alu4 = (alu3+1);
  var val2 = data2_1500[alu4];
  var val3 = data2_1500[alu3];
  var val4 = data3_1500[alu4];
  var val5 = data3_1500[alu3];
  var alu5 = (alu0+2);
  var val6 = data4_384[alu5];
  var val7 = data4_384[alu0];
  var val8 = data5_384[alu0];
  var alu6 = (alu1+1);
  var val9 = data1_576000[alu6];
  var alu7 = (alu0+1);
  var val10 = data4_384[alu7];
  var val11 = data5_384[alu7];
  var alu8 = (alu1+2);
  var val12 = data1_576000[alu8];
  var val13 = data5_384[alu5];
  var alu9 = (alu1+385);
  var val14 = data1_576000[alu9];
  var alu10 = (alu1+386);
  var val15 = data1_576000[alu10];
  var alu11 = (alu1+768);
  var val16 = data1_576000[alu11];
  var alu12 = (alu3+2);
  var val17 = data2_1500[alu12];
  var val18 = data3_1500[alu12];
  var alu13 = (alu1+769);
  var val19 = data1_576000[alu13];
  var alu14 = (alu1+770);
  var val20 = data1_576000[alu14];
  data0_576000[alu2] = (((val0-val2)*val4*val7)+val8);
  data0_576000[alu9] = (((val14-val2)*val4*val10)+val11);
  data0_576000[alu10] = (((val15-val2)*val4*val6)+val13);
  data0_576000[alu11] = (((val16-val17)*val18*val7)+val8);
  data0_576000[alu13] = (((val19-val17)*val18*val10)+val11);
  data0_576000[alu14] = (((val20-val17)*val18*val6)+val13);
  data0_576000[alu6] = (((val9-val3)*val5*val10)+val11);
  data0_576000[alu8] = (((val12-val3)*val5*val6)+val13);
  data0_576000[alu1] = (((val1-val3)*val5*val7)+val8);
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
  var gidx0 = i32(gindex.x); /* 8 */
  var gidx1 = i32(gindex.y); /* 125 */
  var lidx0 = i32(lindex.x); /* 4 */
  var lidx1 = i32(lindex.y); /* 16 */
  var alu0 = ((gidx1*4608)+(lidx0*1152));
  acc0[0] = 0.0f;
  acc0[1] = 0.0f;
  acc0[2] = 0.0f;
  acc0[3] = 0.0f;
  acc0[4] = 0.0f;
  acc0[5] = 0.0f;
  acc0[6] = 0.0f;
  acc0[7] = 0.0f;
  acc0[8] = 0.0f;
  for (var Ridx0 = 0; Ridx0 < 96; Ridx0++) {
    var cast0 = bitcast<i32>((bitcast<u32>(Ridx0)<<2u));
    var alu10 = (alu0+cast0);
    var val0 = data1_576000[alu10];
    var alu11 = ((gidx0*18432)+(lidx1*1152)+cast0);
    var val1 = data2_147456[(alu11+1)];
    var val2 = data2_147456[alu11];
    var val3 = data1_576000[(alu10+1)];
    var val4 = data1_576000[(alu10+2)];
    var val5 = data2_147456[(alu11+2)];
    var val6 = data1_576000[(alu10+3)];
    var val7 = data2_147456[(alu11+3)];
    var val8 = data1_576000[(alu10+384)];
    var val9 = data1_576000[(alu10+385)];
    var val10 = data1_576000[(alu10+386)];
    var val11 = data1_576000[(alu10+387)];
    var val12 = data1_576000[(alu10+768)];
    var val13 = data1_576000[(alu10+769)];
    var val14 = data1_576000[(alu10+770)];
    var val15 = data1_576000[(alu10+771)];
    var val16 = data2_147456[(alu11+384)];
    var val17 = data2_147456[(alu11+385)];
    var val18 = data2_147456[(alu11+386)];
    var val19 = data2_147456[(alu11+387)];
    var val20 = data2_147456[(alu11+768)];
    var val21 = data2_147456[(alu11+769)];
    var val22 = data2_147456[(alu11+770)];
    var val23 = data2_147456[(alu11+771)];
    acc0[0] = (acc0[0]+(val0*val2)+(val3*val1)+(val4*val5)+(val6*val7));
    acc0[1] = (acc0[1]+(val8*val2)+(val9*val1)+(val10*val5)+(val11*val7));
    acc0[2] = (acc0[2]+(val12*val2)+(val13*val1)+(val14*val5)+(val15*val7));
    acc0[3] = (acc0[3]+(val0*val16)+(val3*val17)+(val4*val18)+(val6*val19));
    acc0[4] = (acc0[4]+(val8*val16)+(val9*val17)+(val10*val18)+(val11*val19));
    acc0[5] = (acc0[5]+(val12*val16)+(val13*val17)+(val14*val18)+(val15*val19));
    acc0[6] = (acc0[6]+(val0*val20)+(val3*val21)+(val4*val22)+(val6*val23));
    acc0[7] = (acc0[7]+(val8*val20)+(val9*val21)+(val10*val22)+(val11*val23));
    acc0[8] = (acc0[8]+(val12*val20)+(val13*val21)+(val14*val22)+(val15*val23));
  }
  var alu22 = ((gidx0*48)+(lidx1*3));
  var val24 = data3_384[(alu22+2)];
  var val25 = data3_384[alu22];
  var val26 = data3_384[(alu22+1)];
  var alu23 = (alu22+alu0);
  data0_576000[(alu23+384)] = (acc0[1]+val25);
  data0_576000[(alu23+385)] = (acc0[4]+val26);
  data0_576000[(alu23+386)] = (acc0[7]+val24);
  data0_576000[(alu23+768)] = (acc0[2]+val25);
  data0_576000[(alu23+769)] = (acc0[5]+val26);
  data0_576000[(alu23+770)] = (acc0[8]+val24);
  data0_576000[(alu23+1)] = (acc0[3]+val26);
  data0_576000[(alu23+2)] = (acc0[6]+val24);
  data0_576000[alu23] = (acc0[0]+val25);
}`;

const r_125_8_4_16_3_3_96_4n1 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_576000:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1_576000:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2_147456:array<f32>;
@compute @workgroup_size(4,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var acc0: array<f32,9>;
  var gidx0 = i32(gindex.x); /* 8 */
  var gidx1 = i32(gindex.y); /* 125 */
  var lidx0 = i32(lindex.x); /* 4 */
  var lidx1 = i32(lindex.y); /* 16 */
  var alu0 = ((gidx1*4608)+(lidx0*1152));
  acc0[0] = 0.0f;
  acc0[1] = 0.0f;
  acc0[2] = 0.0f;
  acc0[3] = 0.0f;
  acc0[4] = 0.0f;
  acc0[5] = 0.0f;
  acc0[6] = 0.0f;
  acc0[7] = 0.0f;
  acc0[8] = 0.0f;
  for (var Ridx0 = 0; Ridx0 < 96; Ridx0++) {
    var cast0 = bitcast<i32>((bitcast<u32>(Ridx0)<<2u));
    var alu10 = (alu0+cast0);
    var val0 = data1_576000[alu10];
    var alu11 = ((gidx0*18432)+(lidx1*1152)+cast0);
    var val1 = data2_147456[(alu11+1)];
    var val2 = data2_147456[alu11];
    var val3 = data1_576000[(alu10+1)];
    var val4 = data1_576000[(alu10+2)];
    var val5 = data2_147456[(alu11+2)];
    var val6 = data1_576000[(alu10+3)];
    var val7 = data2_147456[(alu11+3)];
    var val8 = data1_576000[(alu10+384)];
    var val9 = data1_576000[(alu10+385)];
    var val10 = data1_576000[(alu10+386)];
    var val11 = data1_576000[(alu10+387)];
    var val12 = data1_576000[(alu10+768)];
    var val13 = data1_576000[(alu10+769)];
    var val14 = data1_576000[(alu10+770)];
    var val15 = data1_576000[(alu10+771)];
    var val16 = data2_147456[(alu11+384)];
    var val17 = data2_147456[(alu11+385)];
    var val18 = data2_147456[(alu11+386)];
    var val19 = data2_147456[(alu11+387)];
    var val20 = data2_147456[(alu11+768)];
    var val21 = data2_147456[(alu11+769)];
    var val22 = data2_147456[(alu11+770)];
    var val23 = data2_147456[(alu11+771)];
    acc0[0] = (acc0[0]+(val0*val2)+(val3*val1)+(val4*val5)+(val6*val7));
    acc0[1] = (acc0[1]+(val8*val2)+(val9*val1)+(val10*val5)+(val11*val7));
    acc0[2] = (acc0[2]+(val12*val2)+(val13*val1)+(val14*val5)+(val15*val7));
    acc0[3] = (acc0[3]+(val0*val16)+(val3*val17)+(val4*val18)+(val6*val19));
    acc0[4] = (acc0[4]+(val8*val16)+(val9*val17)+(val10*val18)+(val11*val19));
    acc0[5] = (acc0[5]+(val12*val16)+(val13*val17)+(val14*val18)+(val15*val19));
    acc0[6] = (acc0[6]+(val0*val20)+(val3*val21)+(val4*val22)+(val6*val23));
    acc0[7] = (acc0[7]+(val8*val20)+(val9*val21)+(val10*val22)+(val11*val23));
    acc0[8] = (acc0[8]+(val12*val20)+(val13*val21)+(val14*val22)+(val15*val23));
  }
  var alu22 = ((gidx0*48)+(lidx1*3)+alu0);
  data0_576000[(alu22+384)] = acc0[1];
  data0_576000[(alu22+385)] = acc0[4];
  data0_576000[(alu22+386)] = acc0[7];
  data0_576000[(alu22+768)] = acc0[2];
  data0_576000[(alu22+769)] = acc0[5];
  data0_576000[(alu22+770)] = acc0[8];
  data0_576000[(alu22+1)] = acc0[3];
  data0_576000[(alu22+2)] = acc0[6];
  data0_576000[alu22] = acc0[0];
}`;

const r_2_125_125_3_4_4_3_3_16_4 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_13500000:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1_576000:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2_576000:array<f32>;
@compute @workgroup_size(3,4,4) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var acc0: array<f32,9>;
  var gidx0 = i32(gindex.x); /* 125 */
  var gidx1 = i32(gindex.y); /* 125 */
  var gidx2 = i32(gindex.z); /* 2 */
  var lidx0 = i32(lindex.x); /* 3 */
  var lidx1 = i32(lindex.y); /* 4 */
  var lidx2 = i32(lindex.z); /* 4 */
  acc0[0] = 0.0f;
  acc0[1] = 0.0f;
  acc0[2] = 0.0f;
  acc0[3] = 0.0f;
  acc0[4] = 0.0f;
  acc0[5] = 0.0f;
  acc0[6] = 0.0f;
  acc0[7] = 0.0f;
  acc0[8] = 0.0f;
  for (var Ridx0 = 0; Ridx0 < 16; Ridx0++) {
    var alu9 = ((gidx2*192)+bitcast<i32>((bitcast<u32>(lidx0)<<6u))+bitcast<i32>((bitcast<u32>(Ridx0)<<2u)));
    var alu10 = (alu9+(gidx1*4608)+(lidx1*1152));
    var val0 = data1_576000[(alu10+1)];
    var val1 = data1_576000[(alu10+2)];
    var val2 = data1_576000[(alu10+3)];
    var val3 = data1_576000[(alu10+384)];
    var val4 = data1_576000[(alu10+385)];
    var val5 = data1_576000[(alu10+386)];
    var val6 = data1_576000[(alu10+387)];
    var val7 = data1_576000[(alu10+771)];
    var val8 = data1_576000[alu10];
    var alu11 = (alu9+(gidx0*4608)+(lidx2*1152));
    var val9 = data2_576000[(alu11+1)];
    var val10 = data2_576000[(alu11+2)];
    var val11 = data2_576000[(alu11+3)];
    var val12 = data2_576000[alu11];
    var val13 = data1_576000[(alu10+768)];
    var val14 = data1_576000[(alu10+769)];
    var val15 = data1_576000[(alu10+770)];
    var val16 = data2_576000[(alu11+384)];
    var val17 = data2_576000[(alu11+385)];
    var val18 = data2_576000[(alu11+386)];
    var val19 = data2_576000[(alu11+387)];
    var val20 = data2_576000[(alu11+768)];
    var val21 = data2_576000[(alu11+769)];
    var val22 = data2_576000[(alu11+770)];
    var val23 = data2_576000[(alu11+771)];
    acc0[0] = (acc0[0]+(val8*val12)+(val0*val9)+(val1*val10)+(val2*val11));
    acc0[1] = (acc0[1]+(val3*val12)+(val4*val9)+(val5*val10)+(val6*val11));
    acc0[2] = (acc0[2]+(val13*val12)+(val14*val9)+(val15*val10)+(val7*val11));
    acc0[3] = (acc0[3]+(val8*val16)+(val0*val17)+(val1*val18)+(val2*val19));
    acc0[4] = (acc0[4]+(val3*val16)+(val4*val17)+(val5*val18)+(val6*val19));
    acc0[5] = (acc0[5]+(val13*val16)+(val14*val17)+(val15*val18)+(val7*val19));
    acc0[6] = (acc0[6]+(val8*val20)+(val0*val21)+(val1*val22)+(val2*val23));
    acc0[7] = (acc0[7]+(val3*val20)+(val4*val21)+(val5*val22)+(val6*val23));
    acc0[8] = (acc0[8]+(val13*val20)+(val14*val21)+(val15*val22)+(val7*val23));
  }
  var alu22 = ((gidx0*12)+(lidx2*3)+(gidx1*18000)+(lidx1*4500)+(gidx2*6750000)+(lidx0*2250000));
  data0_13500000[(alu22+1500)] = (acc0[1]*0.125f);
  data0_13500000[(alu22+1501)] = (acc0[4]*0.125f);
  data0_13500000[(alu22+1502)] = (acc0[7]*0.125f);
  data0_13500000[(alu22+3000)] = (acc0[2]*0.125f);
  data0_13500000[(alu22+3001)] = (acc0[5]*0.125f);
  data0_13500000[(alu22+3002)] = (acc0[8]*0.125f);
  data0_13500000[(alu22+1)] = (acc0[3]*0.125f);
  data0_13500000[(alu22+2)] = (acc0[6]*0.125f);
  data0_13500000[alu22] = (acc0[0]*0.125f);
}`;

const r_375_8_3_375_4 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_9000:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1_13500000:array<f32>;
@compute @workgroup_size(8) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var acc0: array<f32,3>;
  var gidx0 = i32(gindex.x); /* 375 */
  var lidx0 = i32(lindex.x); /* 8 */
  acc0[0] = (f32(-INFINITY));
  acc0[1] = (f32(-INFINITY));
  acc0[2] = (f32(-INFINITY));
  for (var Ridx0 = 0; Ridx0 < 375; Ridx0++) {
    var alu3 = ((gidx0*36000)+(lidx0*4500)+bitcast<i32>((bitcast<u32>(Ridx0)<<2u)));
    var val0 = data1_13500000[(alu3+1)];
    var val1 = data1_13500000[(alu3+2)];
    var val2 = data1_13500000[(alu3+3)];
    var val3 = data1_13500000[(alu3+1500)];
    var val4 = data1_13500000[(alu3+1501)];
    var val5 = data1_13500000[(alu3+1502)];
    var val6 = data1_13500000[(alu3+1503)];
    var val7 = data1_13500000[alu3];
    var val8 = data1_13500000[(alu3+3000)];
    var val9 = data1_13500000[(alu3+3001)];
    var val10 = data1_13500000[(alu3+3002)];
    var val11 = data1_13500000[(alu3+3003)];
    var alu4 = select(acc0[0],val7,(acc0[0]<val7));
    var alu5 = select(acc0[1],val3,(acc0[1]<val3));
    var alu6 = select(acc0[2],val8,(acc0[2]<val8));
    var alu7 = select(alu4,val0,(alu4<val0));
    var alu8 = select(alu5,val4,(alu5<val4));
    var alu9 = select(alu6,val9,(alu6<val9));
    var alu10 = select(alu7,val1,(alu7<val1));
    var alu11 = select(alu8,val5,(alu8<val5));
    var alu12 = select(alu9,val10,(alu9<val10));
    var alu13 = select(alu10,val2,(alu10<val2));
    var alu14 = select(alu11,val6,(alu11<val6));
    var alu15 = select(alu12,val11,(alu12<val11));
    acc0[0] = alu13;
    acc0[1] = alu14;
    acc0[2] = alu15;
  }
  var alu20 = ((gidx0*24)+(lidx0*3));
  data0_9000[(alu20+1)] = acc0[1];
  data0_9000[(alu20+2)] = acc0[2];
  data0_9000[alu20] = acc0[0];
}`;

const r_375_8_3_375_4n1 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_9000:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1_13500000:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2_9000:array<f32>;
@compute @workgroup_size(8) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var acc0: array<f32,3>;
  var gidx0 = i32(gindex.x); /* 375 */
  var lidx0 = i32(lindex.x); /* 8 */
  var alu0 = ((gidx0*24)+(lidx0*3));
  var alu1 = (alu0+1);
  var val0 = data2_9000[alu1];
  var alu2 = (alu0+2);
  var val1 = data2_9000[alu2];
  var val2 = data2_9000[alu0];
  acc0[0] = 0.0f;
  acc0[1] = 0.0f;
  acc0[2] = 0.0f;
  for (var Ridx0 = 0; Ridx0 < 375; Ridx0++) {
    var alu6 = ((gidx0*36000)+(lidx0*4500)+bitcast<i32>((bitcast<u32>(Ridx0)<<2u)));
    var val3 = data1_13500000[(alu6+1)];
    var val4 = data1_13500000[(alu6+2)];
    var val5 = data1_13500000[(alu6+3)];
    var val6 = data1_13500000[(alu6+1500)];
    var val7 = data1_13500000[(alu6+1501)];
    var val8 = data1_13500000[(alu6+1502)];
    var val9 = data1_13500000[(alu6+1503)];
    var val10 = data1_13500000[alu6];
    var val11 = data1_13500000[(alu6+3000)];
    var val12 = data1_13500000[(alu6+3001)];
    var val13 = data1_13500000[(alu6+3002)];
    var val14 = data1_13500000[(alu6+3003)];
    acc0[0] = (acc0[0]+exp2(((val10-val2)*1.4426950408889634f))+exp2(((val3-val2)*1.4426950408889634f))+exp2(((val4-val2)*1.4426950408889634f))+exp2(((val5-val2)*1.4426950408889634f)));
    acc0[1] = (acc0[1]+exp2(((val6-val0)*1.4426950408889634f))+exp2(((val7-val0)*1.4426950408889634f))+exp2(((val8-val0)*1.4426950408889634f))+exp2(((val9-val0)*1.4426950408889634f)));
    acc0[2] = (acc0[2]+exp2(((val11-val1)*1.4426950408889634f))+exp2(((val12-val1)*1.4426950408889634f))+exp2(((val13-val1)*1.4426950408889634f))+exp2(((val14-val1)*1.4426950408889634f)));
  }
  data0_9000[alu1] = acc0[1];
  data0_9000[alu2] = acc0[2];
  data0_9000[alu0] = acc0[0];
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
  var gidx0 = i32(gindex.x); /* 125 */
  var gidx1 = i32(gindex.y); /* 3 */
  var lidx0 = i32(lindex.x); /* 2 */
  var lidx1 = i32(lindex.y); /* 4 */
  var alu0 = ((gidx0*12)+(lidx1*3)+(gidx1*3000)+(lidx0*1500));
  var alu1 = (alu0+1);
  var val0 = data2_9000[alu1];
  var alu2 = (alu0+2);
  var val1 = data2_9000[alu2];
  var val2 = data2_9000[alu0];
  var lidx2 = i32(lindex.z); /* 16 */
  var cast0 = bitcast<i32>((bitcast<u32>(lidx2)<<2u));
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
  for (var Ridx0 = 0; Ridx0 < 375; Ridx0++) {
    var alu15 = ((gidx0*18000)+(lidx1*4500)+bitcast<i32>((bitcast<u32>(Ridx0)<<2u))+(gidx1*4500000)+(lidx0*2250000));
    var val3 = data1_13500000[alu15];
    var alu16 = (bitcast<i32>((bitcast<u32>(gidx1)<<7u))+bitcast<i32>((bitcast<u32>(lidx0)<<6u))+cast0+(Ridx0*1536));
    var val4 = data4_576000[alu16];
    var val5 = data1_13500000[(alu15+1)];
    var val6 = data4_576000[(alu16+384)];
    var val7 = data1_13500000[(alu15+2)];
    var val8 = data4_576000[(alu16+768)];
    var val9 = data1_13500000[(alu15+3)];
    var val10 = data4_576000[(alu16+1152)];
    var val11 = data1_13500000[(alu15+1500)];
    var val12 = data1_13500000[(alu15+1501)];
    var val13 = data1_13500000[(alu15+1502)];
    var val14 = data1_13500000[(alu15+1503)];
    var val15 = data1_13500000[(alu15+3000)];
    var val16 = data1_13500000[(alu15+3001)];
    var val17 = data1_13500000[(alu15+3002)];
    var val18 = data1_13500000[(alu15+3003)];
    var val19 = data4_576000[(alu16+1)];
    var val20 = data4_576000[(alu16+2)];
    var val21 = data4_576000[(alu16+385)];
    var val22 = data4_576000[(alu16+769)];
    var val23 = data4_576000[(alu16+1153)];
    var val24 = data4_576000[(alu16+386)];
    var val25 = data4_576000[(alu16+770)];
    var val26 = data4_576000[(alu16+1154)];
    var val27 = data4_576000[(alu16+3)];
    var val28 = data4_576000[(alu16+387)];
    var val29 = data4_576000[(alu16+771)];
    var val30 = data4_576000[(alu16+1155)];
    var alu17 = exp2(((val5-val2)*1.4426950408889634f));
    var alu18 = exp2(((val7-val2)*1.4426950408889634f));
    var alu19 = exp2(((val9-val2)*1.4426950408889634f));
    var alu20 = exp2(((val11-val0)*1.4426950408889634f));
    var alu21 = exp2(((val12-val0)*1.4426950408889634f));
    var alu22 = exp2(((val13-val0)*1.4426950408889634f));
    var alu23 = exp2(((val14-val0)*1.4426950408889634f));
    var alu24 = exp2(((val15-val1)*1.4426950408889634f));
    var alu25 = exp2(((val16-val1)*1.4426950408889634f));
    var alu26 = exp2(((val17-val1)*1.4426950408889634f));
    var alu27 = exp2(((val18-val1)*1.4426950408889634f));
    var alu28 = exp2(((val3-val2)*1.4426950408889634f));
    acc0[0] = (acc0[0]+(alu28*val4)+(alu17*val6)+(alu18*val8)+(alu19*val10));
    acc0[1] = (acc0[1]+(alu20*val4)+(alu21*val6)+(alu22*val8)+(alu23*val10));
    acc0[2] = (acc0[2]+(alu24*val4)+(alu25*val6)+(alu26*val8)+(alu27*val10));
    acc0[3] = (acc0[3]+(alu28*val19)+(alu17*val21)+(alu18*val22)+(alu19*val23));
    acc0[4] = (acc0[4]+(alu20*val19)+(alu21*val21)+(alu22*val22)+(alu23*val23));
    acc0[5] = (acc0[5]+(alu24*val19)+(alu25*val21)+(alu26*val22)+(alu27*val23));
    acc0[6] = (acc0[6]+(alu28*val20)+(alu17*val24)+(alu18*val25)+(alu19*val26));
    acc0[7] = (acc0[7]+(alu20*val20)+(alu21*val24)+(alu22*val25)+(alu23*val26));
    acc0[8] = (acc0[8]+(alu24*val20)+(alu25*val24)+(alu26*val25)+(alu27*val26));
    acc0[9] = (acc0[9]+(alu28*val27)+(alu17*val28)+(alu18*val29)+(alu19*val30));
    acc0[10] = (acc0[10]+(alu20*val27)+(alu21*val28)+(alu22*val29)+(alu23*val30));
    acc0[11] = (acc0[11]+(alu24*val27)+(alu25*val28)+(alu26*val29)+(alu27*val30));
  }
  var val31 = data3_9000[alu0];
  var val32 = data3_9000[alu1];
  var val33 = data3_9000[alu2];
  var alu42 = ((gidx0*768)+(lidx1*192)+cast0+(gidx1*192000)+(lidx0*96000));
  var alu43 = (1/val32);
  data0_576000[(alu42+64)] = (acc0[1]*alu43);
  data0_576000[(alu42+65)] = (acc0[4]*alu43);
  data0_576000[(alu42+66)] = (acc0[7]*alu43);
  data0_576000[(alu42+67)] = (acc0[10]*alu43);
  var alu48 = (1/val33);
  data0_576000[(alu42+128)] = (acc0[2]*alu48);
  data0_576000[(alu42+129)] = (acc0[5]*alu48);
  data0_576000[(alu42+130)] = (acc0[8]*alu48);
  data0_576000[(alu42+131)] = (acc0[11]*alu48);
  var alu53 = (1/val31);
  data0_576000[(alu42+1)] = (acc0[3]*alu53);
  data0_576000[(alu42+2)] = (acc0[6]*alu53);
  data0_576000[(alu42+3)] = (acc0[9]*alu53);
  data0_576000[alu42] = (acc0[0]*alu53);
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
  var gidx0 = i32(gindex.x); /* 8 */
  var gidx1 = i32(gindex.y); /* 125 */
  var lidx0 = i32(lindex.x); /* 4 */
  var lidx1 = i32(lindex.y); /* 16 */
  acc0[0] = 0.0f;
  acc0[1] = 0.0f;
  acc0[2] = 0.0f;
  acc0[3] = 0.0f;
  acc0[4] = 0.0f;
  acc0[5] = 0.0f;
  acc0[6] = 0.0f;
  acc0[7] = 0.0f;
  acc0[8] = 0.0f;
  for (var Ridx0_0 = 0; Ridx0_0 < 6; Ridx0_0++) {
    for (var Ridx0_1 = 0; Ridx0_1 < 16; Ridx0_1++) {
      var cast0 = bitcast<i32>((bitcast<u32>(Ridx0_1)<<2u));
      var alu9 = ((gidx1*768)+(lidx0*192)+cast0+(Ridx0_0*96000));
      var val0 = data2_576000[alu9];
      var alu10 = ((gidx0*18432)+(lidx1*1152)+bitcast<i32>((bitcast<u32>(Ridx0_0)<<6u))+cast0);
      var val1 = data3_147456[alu10];
      var val2 = data2_576000[(alu9+1)];
      var val3 = data3_147456[(alu10+1)];
      var val4 = data2_576000[(alu9+2)];
      var val5 = data3_147456[(alu10+2)];
      var val6 = data2_576000[(alu9+3)];
      var val7 = data3_147456[(alu10+3)];
      var val8 = data2_576000[(alu9+64)];
      var val9 = data2_576000[(alu9+65)];
      var val10 = data2_576000[(alu9+66)];
      var val11 = data2_576000[(alu9+67)];
      var val12 = data2_576000[(alu9+128)];
      var val13 = data2_576000[(alu9+129)];
      var val14 = data2_576000[(alu9+130)];
      var val15 = data2_576000[(alu9+131)];
      var val16 = data3_147456[(alu10+384)];
      var val17 = data3_147456[(alu10+385)];
      var val18 = data3_147456[(alu10+386)];
      var val19 = data3_147456[(alu10+387)];
      var val20 = data3_147456[(alu10+768)];
      var val21 = data3_147456[(alu10+769)];
      var val22 = data3_147456[(alu10+770)];
      var val23 = data3_147456[(alu10+771)];
      acc0[0] = (acc0[0]+(val0*val1)+(val2*val3)+(val4*val5)+(val6*val7));
      acc0[1] = (acc0[1]+(val8*val1)+(val9*val3)+(val10*val5)+(val11*val7));
      acc0[2] = (acc0[2]+(val12*val1)+(val13*val3)+(val14*val5)+(val15*val7));
      acc0[3] = (acc0[3]+(val0*val16)+(val2*val17)+(val4*val18)+(val6*val19));
      acc0[4] = (acc0[4]+(val8*val16)+(val9*val17)+(val10*val18)+(val11*val19));
      acc0[5] = (acc0[5]+(val12*val16)+(val13*val17)+(val14*val18)+(val15*val19));
      acc0[6] = (acc0[6]+(val0*val20)+(val2*val21)+(val4*val22)+(val6*val23));
      acc0[7] = (acc0[7]+(val8*val20)+(val9*val21)+(val10*val22)+(val11*val23));
      acc0[8] = (acc0[8]+(val12*val20)+(val13*val21)+(val14*val22)+(val15*val23));
    }
  }
  var alu22 = ((gidx0*48)+(lidx1*3));
  var alu23 = (alu22+(gidx1*4608)+(lidx0*1152));
  var val24 = data1_576000[alu23];
  var val25 = data4_384[alu22];
  var alu24 = (alu23+1);
  var val26 = data1_576000[alu24];
  var val27 = data4_384[(alu22+1)];
  var alu25 = (alu23+2);
  var val28 = data1_576000[alu25];
  var val29 = data4_384[(alu22+2)];
  var alu26 = (alu23+384);
  var val30 = data1_576000[alu26];
  var alu27 = (alu23+385);
  var val31 = data1_576000[alu27];
  var alu28 = (alu23+386);
  var val32 = data1_576000[alu28];
  var alu29 = (alu23+768);
  var val33 = data1_576000[alu29];
  var alu30 = (alu23+769);
  var val34 = data1_576000[alu30];
  var alu31 = (alu23+770);
  var val35 = data1_576000[alu31];
  data0_576000[alu26] = (val30+acc0[1]+val25);
  data0_576000[alu27] = (val31+acc0[4]+val27);
  data0_576000[alu28] = (val32+acc0[7]+val29);
  data0_576000[alu29] = (val33+acc0[2]+val25);
  data0_576000[alu30] = (val34+acc0[5]+val27);
  data0_576000[alu31] = (val35+acc0[8]+val29);
  data0_576000[alu24] = (val26+acc0[3]+val27);
  data0_576000[alu25] = (val28+acc0[6]+val29);
  data0_576000[alu23] = (val24+acc0[0]+val25);
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
  var gidx0 = i32(gindex.x); /* 32 */
  var gidx1 = i32(gindex.y); /* 125 */
  var lidx0 = i32(lindex.x); /* 4 */
  var lidx1 = i32(lindex.y); /* 16 */
  acc0[0] = 0.0f;
  acc0[1] = 0.0f;
  acc0[2] = 0.0f;
  acc0[3] = 0.0f;
  acc0[4] = 0.0f;
  acc0[5] = 0.0f;
  acc0[6] = 0.0f;
  acc0[7] = 0.0f;
  acc0[8] = 0.0f;
  for (var Ridx0 = 0; Ridx0 < 96; Ridx0++) {
    var cast0 = bitcast<i32>((bitcast<u32>(Ridx0)<<2u));
    var alu9 = ((gidx1*4608)+(lidx0*1152)+cast0);
    var val0 = data1_576000[alu9];
    var alu10 = ((gidx0*18432)+(lidx1*1152)+cast0);
    var val1 = data2_589824[alu10];
    var val2 = data1_576000[(alu9+1)];
    var val3 = data2_589824[(alu10+1)];
    var val4 = data1_576000[(alu9+2)];
    var val5 = data2_589824[(alu10+2)];
    var val6 = data1_576000[(alu9+3)];
    var val7 = data2_589824[(alu10+3)];
    var val8 = data1_576000[(alu9+384)];
    var val9 = data1_576000[(alu9+385)];
    var val10 = data1_576000[(alu9+386)];
    var val11 = data1_576000[(alu9+387)];
    var val12 = data1_576000[(alu9+768)];
    var val13 = data1_576000[(alu9+769)];
    var val14 = data1_576000[(alu9+770)];
    var val15 = data1_576000[(alu9+771)];
    var val16 = data2_589824[(alu10+384)];
    var val17 = data2_589824[(alu10+385)];
    var val18 = data2_589824[(alu10+386)];
    var val19 = data2_589824[(alu10+387)];
    var val20 = data2_589824[(alu10+768)];
    var val21 = data2_589824[(alu10+769)];
    var val22 = data2_589824[(alu10+770)];
    var val23 = data2_589824[(alu10+771)];
    acc0[0] = (acc0[0]+(val0*val1)+(val2*val3)+(val4*val5)+(val6*val7));
    acc0[1] = (acc0[1]+(val8*val1)+(val9*val3)+(val10*val5)+(val11*val7));
    acc0[2] = (acc0[2]+(val12*val1)+(val13*val3)+(val14*val5)+(val15*val7));
    acc0[3] = (acc0[3]+(val0*val16)+(val2*val17)+(val4*val18)+(val6*val19));
    acc0[4] = (acc0[4]+(val8*val16)+(val9*val17)+(val10*val18)+(val11*val19));
    acc0[5] = (acc0[5]+(val12*val16)+(val13*val17)+(val14*val18)+(val15*val19));
    acc0[6] = (acc0[6]+(val0*val20)+(val2*val21)+(val4*val22)+(val6*val23));
    acc0[7] = (acc0[7]+(val8*val20)+(val9*val21)+(val10*val22)+(val11*val23));
    acc0[8] = (acc0[8]+(val12*val20)+(val13*val21)+(val14*val22)+(val15*val23));
  }
  var alu21 = ((gidx0*48)+(lidx1*3));
  var val24 = data3_1536[alu21];
  var val25 = data3_1536[(alu21+1)];
  var val26 = data3_1536[(alu21+2)];
  var alu22 = (alu21+(gidx1*18432)+(lidx0*4608));
  var alu23 = (acc0[1]+val24);
  var alu24 = (acc0[4]+val25);
  var alu25 = (acc0[7]+val26);
  data0_2304000[(alu22+1536)] = ((1/(1.0f+exp2(((alu23+(0.044715f*alu23*alu23*alu23))*-2.302208198144325f))))*alu23);
  data0_2304000[(alu22+1537)] = ((1/(1.0f+exp2(((alu24+(0.044715f*alu24*alu24*alu24))*-2.302208198144325f))))*alu24);
  data0_2304000[(alu22+1538)] = ((1/(1.0f+exp2(((alu25+(0.044715f*alu25*alu25*alu25))*-2.302208198144325f))))*alu25);
  var alu29 = (acc0[2]+val24);
  var alu30 = (acc0[5]+val25);
  var alu31 = (acc0[8]+val26);
  data0_2304000[(alu22+3072)] = ((1/(1.0f+exp2(((alu29+(0.044715f*alu29*alu29*alu29))*-2.302208198144325f))))*alu29);
  data0_2304000[(alu22+3073)] = ((1/(1.0f+exp2(((alu30+(0.044715f*alu30*alu30*alu30))*-2.302208198144325f))))*alu30);
  data0_2304000[(alu22+3074)] = ((1/(1.0f+exp2(((alu31+(0.044715f*alu31*alu31*alu31))*-2.302208198144325f))))*alu31);
  var alu35 = (acc0[0]+val24);
  var alu36 = (acc0[3]+val25);
  var alu37 = (acc0[6]+val26);
  data0_2304000[(alu22+1)] = ((1/(1.0f+exp2(((alu36+(0.044715f*alu36*alu36*alu36))*-2.302208198144325f))))*alu36);
  data0_2304000[(alu22+2)] = ((1/(1.0f+exp2(((alu37+(0.044715f*alu37*alu37*alu37))*-2.302208198144325f))))*alu37);
  data0_2304000[alu22] = ((1/(1.0f+exp2(((alu35+(0.044715f*alu35*alu35*alu35))*-2.302208198144325f))))*alu35);
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
  var gidx0 = i32(gindex.x); /* 8 */
  var gidx1 = i32(gindex.y); /* 125 */
  var lidx0 = i32(lindex.x); /* 4 */
  var lidx1 = i32(lindex.y); /* 16 */
  acc0[0] = 0.0f;
  acc0[1] = 0.0f;
  acc0[2] = 0.0f;
  acc0[3] = 0.0f;
  acc0[4] = 0.0f;
  acc0[5] = 0.0f;
  acc0[6] = 0.0f;
  acc0[7] = 0.0f;
  acc0[8] = 0.0f;
  for (var Ridx0 = 0; Ridx0 < 384; Ridx0++) {
    var cast0 = bitcast<i32>((bitcast<u32>(Ridx0)<<2u));
    var alu9 = ((gidx1*18432)+(lidx0*4608)+cast0);
    var val0 = data2_2304000[alu9];
    var alu10 = ((gidx0*73728)+(lidx1*4608)+cast0);
    var val1 = data3_589824[alu10];
    var val2 = data2_2304000[(alu9+1)];
    var val3 = data3_589824[(alu10+1)];
    var val4 = data2_2304000[(alu9+2)];
    var val5 = data3_589824[(alu10+2)];
    var val6 = data2_2304000[(alu9+3)];
    var val7 = data3_589824[(alu10+3)];
    var val8 = data2_2304000[(alu9+1536)];
    var val9 = data2_2304000[(alu9+1537)];
    var val10 = data2_2304000[(alu9+1538)];
    var val11 = data2_2304000[(alu9+1539)];
    var val12 = data2_2304000[(alu9+3072)];
    var val13 = data2_2304000[(alu9+3073)];
    var val14 = data2_2304000[(alu9+3074)];
    var val15 = data2_2304000[(alu9+3075)];
    var val16 = data3_589824[(alu10+1536)];
    var val17 = data3_589824[(alu10+1537)];
    var val18 = data3_589824[(alu10+1538)];
    var val19 = data3_589824[(alu10+1539)];
    var val20 = data3_589824[(alu10+3072)];
    var val21 = data3_589824[(alu10+3073)];
    var val22 = data3_589824[(alu10+3074)];
    var val23 = data3_589824[(alu10+3075)];
    acc0[0] = (acc0[0]+(val0*val1)+(val2*val3)+(val4*val5)+(val6*val7));
    acc0[1] = (acc0[1]+(val8*val1)+(val9*val3)+(val10*val5)+(val11*val7));
    acc0[2] = (acc0[2]+(val12*val1)+(val13*val3)+(val14*val5)+(val15*val7));
    acc0[3] = (acc0[3]+(val0*val16)+(val2*val17)+(val4*val18)+(val6*val19));
    acc0[4] = (acc0[4]+(val8*val16)+(val9*val17)+(val10*val18)+(val11*val19));
    acc0[5] = (acc0[5]+(val12*val16)+(val13*val17)+(val14*val18)+(val15*val19));
    acc0[6] = (acc0[6]+(val0*val20)+(val2*val21)+(val4*val22)+(val6*val23));
    acc0[7] = (acc0[7]+(val8*val20)+(val9*val21)+(val10*val22)+(val11*val23));
    acc0[8] = (acc0[8]+(val12*val20)+(val13*val21)+(val14*val22)+(val15*val23));
  }
  var alu21 = ((gidx0*48)+(lidx1*3));
  var val24 = data4_384[alu21];
  var alu22 = (alu21+(gidx1*4608)+(lidx0*1152));
  var alu23 = (alu22+1);
  var val25 = data1_576000[alu23];
  var val26 = data4_384[(alu21+1)];
  var alu24 = (alu22+2);
  var val27 = data1_576000[alu24];
  var val28 = data4_384[(alu21+2)];
  var alu25 = (alu22+384);
  var val29 = data1_576000[alu25];
  var alu26 = (alu22+385);
  var val30 = data1_576000[alu26];
  var alu27 = (alu22+386);
  var val31 = data1_576000[alu27];
  var alu28 = (alu22+768);
  var val32 = data1_576000[alu28];
  var alu29 = (alu22+769);
  var val33 = data1_576000[alu29];
  var alu30 = (alu22+770);
  var val34 = data1_576000[alu30];
  var val35 = data1_576000[alu22];
  data0_576000[alu25] = (val29+acc0[1]+val24);
  data0_576000[alu26] = (val30+acc0[4]+val26);
  data0_576000[alu27] = (val31+acc0[7]+val28);
  data0_576000[alu28] = (val32+acc0[2]+val24);
  data0_576000[alu29] = (val33+acc0[5]+val26);
  data0_576000[alu30] = (val34+acc0[8]+val28);
  data0_576000[alu23] = (val25+acc0[3]+val26);
  data0_576000[alu24] = (val27+acc0[6]+val28);
  data0_576000[alu22] = (val35+acc0[0]+val24);
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
