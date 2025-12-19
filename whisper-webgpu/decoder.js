
const decoder = (() => {
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

const E_32_24_16_8_3 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_294912:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1_32:array<i32>;
@group(0) @binding(3)var<storage,read_write>data2_19915776:array<f32>;
@compute @workgroup_size(16,8) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx1 = i32(gindex.y); /* 32 */
  var val0 = data1_32[gidx1];
  var gidx0 = i32(gindex.x); /* 24 */
  var lidx0 = i32(lindex.x); /* 16 */
  var lidx1 = i32(lindex.y); /* 8 */
  var alu0 = (lidx0+bitcast<i32>((bitcast<u32>(gidx0)<<4u))+(val0*384));
  var alu1 = (lidx1*6483);
  var alu2 = (val0<(alu1+2161));
  var alu3 = (val0<(alu1+4322));
  var val1 = select(0.0f, data2_19915776[alu0], ((alu2!=true)&alu3));
  var val2 = select(0.0f, data2_19915776[alu0], ((alu3!=true)&(val0<(alu1+6483))));
  var val3 = select(0.0f, data2_19915776[alu0], (((val0<alu1)!=true)&alu2));
  var alu4 = ((gidx0*384)+(lidx0*24)+(lidx1*3)+(gidx1*9216));
  data0_294912[(alu4+1)] = val1;
  data0_294912[(alu4+2)] = val2;
  data0_294912[alu4] = val3;
}`;

const r_24_8_16_4_24 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_12288:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1_294912:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2_172032:array<f32>;
@group(0) @binding(4)var<uniform>ctx:i32;
@compute @workgroup_size(8,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 24 */
  var lidx0 = i32(lindex.x); /* 8 */
  var lidx1 = i32(lindex.y); /* 16 */
  var alu0 = ((gidx0*384)+(lidx1*24)+(lidx0*36864));
  var val0 = data1_294912[(alu0+1)];
  var val1 = data1_294912[(alu0+2)];
  var val2 = data1_294912[(alu0+3)];
  var val3 = data1_294912[(alu0+4)];
  var val4 = data1_294912[(alu0+5)];
  var val5 = data1_294912[(alu0+6)];
  var val6 = data1_294912[(alu0+7)];
  var val7 = data1_294912[(alu0+8)];
  var val8 = data1_294912[(alu0+9)];
  var val9 = data1_294912[(alu0+10)];
  var val10 = data1_294912[(alu0+11)];
  var val11 = data1_294912[(alu0+12)];
  var val12 = data1_294912[(alu0+13)];
  var val13 = data1_294912[(alu0+14)];
  var val14 = data1_294912[(alu0+15)];
  var val15 = data1_294912[(alu0+16)];
  var val16 = data1_294912[(alu0+17)];
  var val17 = data1_294912[(alu0+18)];
  var val18 = data1_294912[(alu0+19)];
  var val19 = data1_294912[(alu0+20)];
  var val20 = data1_294912[(alu0+21)];
  var val21 = data1_294912[(alu0+22)];
  var val22 = data1_294912[(alu0+23)];
  var val23 = data1_294912[alu0];
  var alu1 = (lidx1+bitcast<i32>((bitcast<u32>(gidx0)<<4u)));
  var val24 = data2_172032[(alu1+(ctx*384))];
  var val25 = data1_294912[(alu0+9216)];
  var val26 = data1_294912[(alu0+9217)];
  var val27 = data1_294912[(alu0+9218)];
  var val28 = data1_294912[(alu0+9219)];
  var val29 = data1_294912[(alu0+9220)];
  var val30 = data1_294912[(alu0+9221)];
  var val31 = data1_294912[(alu0+9222)];
  var val32 = data1_294912[(alu0+9223)];
  var val33 = data1_294912[(alu0+9224)];
  var val34 = data1_294912[(alu0+9225)];
  var val35 = data1_294912[(alu0+9226)];
  var val36 = data1_294912[(alu0+9227)];
  var val37 = data1_294912[(alu0+9228)];
  var val38 = data1_294912[(alu0+9229)];
  var val39 = data1_294912[(alu0+9230)];
  var val40 = data1_294912[(alu0+9231)];
  var val41 = data1_294912[(alu0+9232)];
  var val42 = data1_294912[(alu0+9233)];
  var val43 = data1_294912[(alu0+9234)];
  var val44 = data1_294912[(alu0+9235)];
  var val45 = data1_294912[(alu0+9236)];
  var val46 = data1_294912[(alu0+9237)];
  var val47 = data1_294912[(alu0+9238)];
  var val48 = data1_294912[(alu0+9239)];
  var val49 = data1_294912[(alu0+18432)];
  var val50 = data1_294912[(alu0+18433)];
  var val51 = data1_294912[(alu0+18434)];
  var val52 = data1_294912[(alu0+18435)];
  var val53 = data1_294912[(alu0+18436)];
  var val54 = data1_294912[(alu0+18437)];
  var val55 = data1_294912[(alu0+18438)];
  var val56 = data1_294912[(alu0+18439)];
  var val57 = data1_294912[(alu0+18440)];
  var val58 = data1_294912[(alu0+18441)];
  var val59 = data1_294912[(alu0+18442)];
  var val60 = data1_294912[(alu0+18443)];
  var val61 = data1_294912[(alu0+18444)];
  var val62 = data1_294912[(alu0+18445)];
  var val63 = data1_294912[(alu0+18446)];
  var val64 = data1_294912[(alu0+18447)];
  var val65 = data1_294912[(alu0+18448)];
  var val66 = data1_294912[(alu0+18449)];
  var val67 = data1_294912[(alu0+18450)];
  var val68 = data1_294912[(alu0+18451)];
  var val69 = data1_294912[(alu0+18452)];
  var val70 = data1_294912[(alu0+18453)];
  var val71 = data1_294912[(alu0+18454)];
  var val72 = data1_294912[(alu0+18455)];
  var val73 = data1_294912[(alu0+27648)];
  var val74 = data1_294912[(alu0+27649)];
  var val75 = data1_294912[(alu0+27650)];
  var val76 = data1_294912[(alu0+27651)];
  var val77 = data1_294912[(alu0+27652)];
  var val78 = data1_294912[(alu0+27653)];
  var val79 = data1_294912[(alu0+27654)];
  var val80 = data1_294912[(alu0+27655)];
  var val81 = data1_294912[(alu0+27656)];
  var val82 = data1_294912[(alu0+27657)];
  var val83 = data1_294912[(alu0+27658)];
  var val84 = data1_294912[(alu0+27659)];
  var val85 = data1_294912[(alu0+27660)];
  var val86 = data1_294912[(alu0+27661)];
  var val87 = data1_294912[(alu0+27662)];
  var val88 = data1_294912[(alu0+27663)];
  var val89 = data1_294912[(alu0+27664)];
  var val90 = data1_294912[(alu0+27665)];
  var val91 = data1_294912[(alu0+27666)];
  var val92 = data1_294912[(alu0+27667)];
  var val93 = data1_294912[(alu0+27668)];
  var val94 = data1_294912[(alu0+27669)];
  var val95 = data1_294912[(alu0+27670)];
  var val96 = data1_294912[(alu0+27671)];
  var alu2 = (alu1+(lidx0*1536));
  data0_12288[alu2] = (val23+val0+val1+val2+val3+val4+val5+val6+val7+val8+val9+val10+val11+val12+val13+val14+val15+val16+val17+val18+val19+val20+val21+val22+val24);
  data0_12288[(alu2+384)] = (val25+val26+val27+val28+val29+val30+val31+val32+val33+val34+val35+val36+val37+val38+val39+val40+val41+val42+val43+val44+val45+val46+val47+val48+val24);
  data0_12288[(alu2+768)] = (val49+val50+val51+val52+val53+val54+val55+val56+val57+val58+val59+val60+val61+val62+val63+val64+val65+val66+val67+val68+val69+val70+val71+val72+val24);
  data0_12288[(alu2+1152)] = (val73+val74+val75+val76+val77+val78+val79+val80+val81+val82+val83+val84+val85+val86+val87+val88+val89+val90+val91+val92+val93+val94+val95+val96+val24);
}`;

const r_32_16_24 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
var<workgroup> temp0: array<f32,16>;
@group(0) @binding(1)var<storage,read_write>data0_32:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1_12288:array<f32>;
@compute @workgroup_size(16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var acc0: array<f32,1>;
  var acc1: array<f32,1>;
  var gidx0 = i32(gindex.x); /* 32 */
  var lidx0 = i32(lindex.x); /* 16 */
  acc0[0] = 0.0f;
  for (var Ridx0 = 0; Ridx0 < 24; Ridx0++) {
    var val0 = data1_12288[((lidx0*24)+Ridx0+(gidx0*384))];
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
    data0_32[gidx0] = (acc1[0]*0.0026041666666666665f);
  }
}`;

const r_32_16_24n1 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
var<workgroup> temp0: array<f32,16>;
@group(0) @binding(1)var<storage,read_write>data0_32:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1_12288:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2_32:array<f32>;
@compute @workgroup_size(16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var acc0: array<f32,1>;
  var acc1: array<f32,1>;
  var gidx0 = i32(gindex.x); /* 32 */
  var val0 = data2_32[gidx0];
  var lidx0 = i32(lindex.x); /* 16 */
  acc0[0] = 0.0f;
  for (var Ridx0 = 0; Ridx0 < 24; Ridx0++) {
    var val1 = data1_12288[((lidx0*24)+Ridx0+(gidx0*384))];
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
    data0_32[gidx0] = (1/sqrt(((acc1[0]*0.0026041666666666665f)+1e-05f)));
  }
}`;

const E_8_8_16_3_4 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_12288:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1_12288:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2_32:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3_32:array<f32>;
@group(0) @binding(5)var<storage,read_write>data4_384:array<f32>;
@group(0) @binding(6)var<storage,read_write>data5_384:array<f32>;
@compute @workgroup_size(8,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 8 */
  var lidx0 = i32(lindex.x); /* 8 */
  var lidx1 = i32(lindex.y); /* 16 */
  var alu0 = ((gidx0*48)+(lidx1*3));
  var alu1 = (alu0+(lidx0*1536));
  var alu2 = (alu1+386);
  var val0 = data1_12288[alu2];
  var alu3 = (alu1+768);
  var val1 = data1_12288[alu3];
  var val2 = data1_12288[alu1];
  var cast0 = bitcast<i32>((bitcast<u32>(lidx0)<<2u));
  var val3 = data2_32[cast0];
  var alu4 = (cast0+2);
  var val4 = data2_32[alu4];
  var val5 = data3_32[cast0];
  var alu5 = (alu0+1);
  var val6 = data4_384[alu5];
  var alu6 = (alu0+2);
  var val7 = data4_384[alu6];
  var val8 = data4_384[alu0];
  var val9 = data5_384[alu5];
  var val10 = data5_384[alu0];
  var alu7 = (alu1+1);
  var val11 = data1_12288[alu7];
  var alu8 = (alu1+2);
  var val12 = data1_12288[alu8];
  var val13 = data5_384[alu6];
  var alu9 = (alu1+384);
  var val14 = data1_12288[alu9];
  var alu10 = (cast0+1);
  var val15 = data2_32[alu10];
  var val16 = data3_32[alu10];
  var alu11 = (alu1+385);
  var val17 = data1_12288[alu11];
  var val18 = data3_32[alu4];
  var alu12 = (alu1+769);
  var val19 = data1_12288[alu12];
  var alu13 = (alu1+770);
  var val20 = data1_12288[alu13];
  var alu14 = (alu1+1152);
  var val21 = data1_12288[alu14];
  var alu15 = (cast0+3);
  var val22 = data2_32[alu15];
  var val23 = data3_32[alu15];
  var alu16 = (alu1+1153);
  var val24 = data1_12288[alu16];
  var alu17 = (alu1+1154);
  var val25 = data1_12288[alu17];
  data0_12288[alu9] = (((val14-val15)*val16*val8)+val10);
  data0_12288[alu11] = (((val17-val15)*val16*val6)+val9);
  data0_12288[alu2] = (((val0-val15)*val16*val7)+val13);
  data0_12288[alu3] = (((val1-val4)*val18*val8)+val10);
  data0_12288[alu12] = (((val19-val4)*val18*val6)+val9);
  data0_12288[alu13] = (((val20-val4)*val18*val7)+val13);
  data0_12288[alu14] = (((val21-val22)*val23*val8)+val10);
  data0_12288[alu16] = (((val24-val22)*val23*val6)+val9);
  data0_12288[alu17] = (((val25-val22)*val23*val7)+val13);
  data0_12288[alu7] = (((val11-val3)*val5*val6)+val9);
  data0_12288[alu8] = (((val12-val3)*val5*val7)+val13);
  data0_12288[alu1] = (((val2-val3)*val5*val8)+val10);
}`;

const r_8_8_16_3_4_96_4 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_12288:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1_12288:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2_147456:array<f32>;
@compute @workgroup_size(8,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var acc0: array<f32,12>;
  var gidx0 = i32(gindex.x); /* 8 */
  var lidx0 = i32(lindex.x); /* 8 */
  var lidx1 = i32(lindex.y); /* 16 */
  var alu0 = (lidx0*1536);
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
  for (var Ridx0 = 0; Ridx0 < 96; Ridx0++) {
    var cast0 = bitcast<i32>((bitcast<u32>(Ridx0)<<2u));
    var alu13 = (alu0+cast0);
    var val0 = data1_12288[(alu13+1)];
    var val1 = data1_12288[alu13];
    var alu14 = ((gidx0*18432)+(lidx1*1152)+cast0);
    var val2 = data2_147456[(alu14+1)];
    var val3 = data2_147456[(alu14+2)];
    var val4 = data2_147456[alu14];
    var val5 = data1_12288[(alu13+2)];
    var val6 = data1_12288[(alu13+3)];
    var val7 = data2_147456[(alu14+3)];
    var val8 = data1_12288[(alu13+384)];
    var val9 = data1_12288[(alu13+385)];
    var val10 = data1_12288[(alu13+386)];
    var val11 = data1_12288[(alu13+387)];
    var val12 = data1_12288[(alu13+768)];
    var val13 = data1_12288[(alu13+769)];
    var val14 = data1_12288[(alu13+770)];
    var val15 = data1_12288[(alu13+771)];
    var val16 = data1_12288[(alu13+1152)];
    var val17 = data1_12288[(alu13+1153)];
    var val18 = data1_12288[(alu13+1154)];
    var val19 = data1_12288[(alu13+1155)];
    var val20 = data2_147456[(alu14+384)];
    var val21 = data2_147456[(alu14+385)];
    var val22 = data2_147456[(alu14+386)];
    var val23 = data2_147456[(alu14+387)];
    var val24 = data2_147456[(alu14+768)];
    var val25 = data2_147456[(alu14+769)];
    var val26 = data2_147456[(alu14+770)];
    var val27 = data2_147456[(alu14+771)];
    acc0[0] = (acc0[0]+(val1*val4)+(val0*val2)+(val5*val3)+(val6*val7));
    acc0[1] = (acc0[1]+(val8*val4)+(val9*val2)+(val10*val3)+(val11*val7));
    acc0[2] = (acc0[2]+(val12*val4)+(val13*val2)+(val14*val3)+(val15*val7));
    acc0[3] = (acc0[3]+(val16*val4)+(val17*val2)+(val18*val3)+(val19*val7));
    acc0[4] = (acc0[4]+(val1*val20)+(val0*val21)+(val5*val22)+(val6*val23));
    acc0[5] = (acc0[5]+(val8*val20)+(val9*val21)+(val10*val22)+(val11*val23));
    acc0[6] = (acc0[6]+(val12*val20)+(val13*val21)+(val14*val22)+(val15*val23));
    acc0[7] = (acc0[7]+(val16*val20)+(val17*val21)+(val18*val22)+(val19*val23));
    acc0[8] = (acc0[8]+(val1*val24)+(val0*val25)+(val5*val26)+(val6*val27));
    acc0[9] = (acc0[9]+(val8*val24)+(val9*val25)+(val10*val26)+(val11*val27));
    acc0[10] = (acc0[10]+(val12*val24)+(val13*val25)+(val14*val26)+(val15*val27));
    acc0[11] = (acc0[11]+(val16*val24)+(val17*val25)+(val18*val26)+(val19*val27));
  }
  var alu28 = ((gidx0*48)+(lidx1*3)+alu0);
  data0_12288[(alu28+384)] = acc0[1];
  data0_12288[(alu28+385)] = acc0[5];
  data0_12288[(alu28+386)] = acc0[9];
  data0_12288[(alu28+768)] = acc0[2];
  data0_12288[(alu28+769)] = acc0[6];
  data0_12288[(alu28+770)] = acc0[10];
  data0_12288[(alu28+1152)] = acc0[3];
  data0_12288[(alu28+1153)] = acc0[7];
  data0_12288[(alu28+1154)] = acc0[11];
  data0_12288[(alu28+1)] = acc0[4];
  data0_12288[(alu28+2)] = acc0[8];
  data0_12288[alu28] = acc0[0];
}`;

const E_32_7_48_16_8_4n1 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_5505024:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1_5505024:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2_12288:array<f32>;
@group(0) @binding(4)var<uniform>ctx:i32;
@compute @workgroup_size(16,8) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 48 */
  var gidx1 = i32(gindex.y); /* 7 */
  var gidx2 = i32(gindex.z); /* 32 */
  var lidx0 = i32(lindex.x); /* 16 */
  var lidx1 = i32(lindex.y); /* 8 */
  var alu0 = (lidx1+bitcast<i32>((bitcast<u32>(gidx0)<<3u)));
  var alu1 = (alu0+(gidx1*24576)+(lidx0*1536)+(gidx2*172032));
  var val0 = data1_5505024[alu1];
  var val1 = data2_12288[(alu0+(gidx2*384))];
  var alu2 = (alu1+384);
  var val2 = data1_5505024[alu2];
  var alu3 = (alu1+768);
  var val3 = data1_5505024[alu3];
  var alu4 = (alu1+1152);
  var val4 = data1_5505024[alu4];
  var alu5 = (bitcast<i32>((bitcast<u32>(gidx1)<<6u))+bitcast<i32>((bitcast<u32>(lidx0)<<2u)));
  var alu6 = select(val1,val0,(alu5<ctx));
  var alu7 = select(val1,val2,((alu5+1)<ctx));
  var alu8 = select(val1,val3,((alu5+2)<ctx));
  var alu9 = select(val1,val4,((alu5+3)<ctx));
  data0_5505024[alu1] = alu6;
  data0_5505024[alu2] = alu7;
  data0_5505024[alu3] = alu8;
  data0_5505024[alu4] = alu9;
}`;

const E_57344_32_3 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_5505024:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1_5505024:array<f32>;
@compute @workgroup_size(32) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 57344 */
  var lidx0 = i32(lindex.x); /* 32 */
  var alu0 = ((gidx0*96)+(lidx0*3));
  var alu1 = (alu0+1);
  var val0 = data1_5505024[alu1];
  var alu2 = (alu0+2);
  var val1 = data1_5505024[alu2];
  var val2 = data1_5505024[alu0];
  data0_5505024[alu1] = val0;
  data0_5505024[alu2] = val1;
  data0_5505024[alu0] = val2;
}`;

const r_8_8_16_3_4_96_4n1 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_12288:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1_12288:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2_147456:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3_384:array<f32>;
@compute @workgroup_size(8,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var acc0: array<f32,12>;
  var gidx0 = i32(gindex.x); /* 8 */
  var lidx0 = i32(lindex.x); /* 8 */
  var lidx1 = i32(lindex.y); /* 16 */
  var alu0 = (lidx0*1536);
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
  for (var Ridx0 = 0; Ridx0 < 96; Ridx0++) {
    var cast0 = bitcast<i32>((bitcast<u32>(Ridx0)<<2u));
    var alu13 = (alu0+cast0);
    var val0 = data1_12288[alu13];
    var alu14 = ((gidx0*18432)+(lidx1*1152)+cast0);
    var val1 = data2_147456[(alu14+1)];
    var val2 = data2_147456[(alu14+2)];
    var val3 = data2_147456[alu14];
    var val4 = data1_12288[(alu13+1)];
    var val5 = data1_12288[(alu13+2)];
    var val6 = data1_12288[(alu13+3)];
    var val7 = data2_147456[(alu14+3)];
    var val8 = data1_12288[(alu13+384)];
    var val9 = data1_12288[(alu13+385)];
    var val10 = data1_12288[(alu13+386)];
    var val11 = data1_12288[(alu13+387)];
    var val12 = data1_12288[(alu13+768)];
    var val13 = data1_12288[(alu13+769)];
    var val14 = data1_12288[(alu13+770)];
    var val15 = data1_12288[(alu13+771)];
    var val16 = data1_12288[(alu13+1152)];
    var val17 = data1_12288[(alu13+1153)];
    var val18 = data1_12288[(alu13+1154)];
    var val19 = data1_12288[(alu13+1155)];
    var val20 = data2_147456[(alu14+384)];
    var val21 = data2_147456[(alu14+385)];
    var val22 = data2_147456[(alu14+386)];
    var val23 = data2_147456[(alu14+387)];
    var val24 = data2_147456[(alu14+768)];
    var val25 = data2_147456[(alu14+769)];
    var val26 = data2_147456[(alu14+770)];
    var val27 = data2_147456[(alu14+771)];
    acc0[0] = (acc0[0]+(val0*val3)+(val4*val1)+(val5*val2)+(val6*val7));
    acc0[1] = (acc0[1]+(val8*val3)+(val9*val1)+(val10*val2)+(val11*val7));
    acc0[2] = (acc0[2]+(val12*val3)+(val13*val1)+(val14*val2)+(val15*val7));
    acc0[3] = (acc0[3]+(val16*val3)+(val17*val1)+(val18*val2)+(val19*val7));
    acc0[4] = (acc0[4]+(val0*val20)+(val4*val21)+(val5*val22)+(val6*val23));
    acc0[5] = (acc0[5]+(val8*val20)+(val9*val21)+(val10*val22)+(val11*val23));
    acc0[6] = (acc0[6]+(val12*val20)+(val13*val21)+(val14*val22)+(val15*val23));
    acc0[7] = (acc0[7]+(val16*val20)+(val17*val21)+(val18*val22)+(val19*val23));
    acc0[8] = (acc0[8]+(val0*val24)+(val4*val25)+(val5*val26)+(val6*val27));
    acc0[9] = (acc0[9]+(val8*val24)+(val9*val25)+(val10*val26)+(val11*val27));
    acc0[10] = (acc0[10]+(val12*val24)+(val13*val25)+(val14*val26)+(val15*val27));
    acc0[11] = (acc0[11]+(val16*val24)+(val17*val25)+(val18*val26)+(val19*val27));
  }
  var alu28 = ((gidx0*48)+(lidx1*3));
  var val28 = data3_384[(alu28+2)];
  var val29 = data3_384[alu28];
  var val30 = data3_384[(alu28+1)];
  var alu29 = (alu28+alu0);
  data0_12288[(alu29+384)] = (acc0[1]+val29);
  data0_12288[(alu29+385)] = (acc0[5]+val30);
  data0_12288[(alu29+386)] = (acc0[9]+val28);
  data0_12288[(alu29+768)] = (acc0[2]+val29);
  data0_12288[(alu29+769)] = (acc0[6]+val30);
  data0_12288[(alu29+770)] = (acc0[10]+val28);
  data0_12288[(alu29+1152)] = (acc0[3]+val29);
  data0_12288[(alu29+1153)] = (acc0[7]+val30);
  data0_12288[(alu29+1154)] = (acc0[11]+val28);
  data0_12288[(alu29+1)] = (acc0[4]+val30);
  data0_12288[(alu29+2)] = (acc0[8]+val28);
  data0_12288[alu29] = (acc0[0]+val29);
}`;

const r_4_375_24_2_4_16_4_96_4n2 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_18432000:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1_18432000:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2_576000:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3_147456:array<f32>;
@group(0) @binding(5)var<uniform>off:i32;
@group(0) @binding(6)var<uniform>update_cache:i32;
@compute @workgroup_size(2,4,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var acc0: array<f32,1>;
  var gidx0 = i32(gindex.x); /* 24 */
  var gidx1 = i32(gindex.y); /* 375 */
  var lidx1 = i32(lindex.y); /* 4 */
  var lidx2 = i32(lindex.z); /* 16 */
  var alu0 = ((gidx1*1536)+(lidx1*384));
  acc0[0] = 0.0f;
  for (var Ridx0 = 0; Ridx0 < 96; Ridx0++) {
    var cast0 = bitcast<i32>((bitcast<u32>(Ridx0)<<2u));
    var alu2 = (alu0+cast0);
    var val0 = data2_576000[(alu2+3)];
    var val1 = data2_576000[alu2];
    var alu3 = ((gidx0*6144)+(lidx2*384)+cast0);
    var val2 = data3_147456[(alu3+2)];
    var val3 = data3_147456[(alu3+3)];
    var val4 = data3_147456[alu3];
    var val5 = data2_576000[(alu2+1)];
    var val6 = data3_147456[(alu3+1)];
    var val7 = data2_576000[(alu2+2)];
    acc0[0] = (acc0[0]+(val1*val4)+(val5*val6)+(val7*val2)+(val0*val3));
  }
  var gidx2 = i32(gindex.z); /* 4 */
  var lidx0 = i32(lindex.x); /* 2 */
  var cast1 = bitcast<i32>((bitcast<u32>(update_cache)<<5u));
  var alu6 = (bitcast<i32>((bitcast<u32>(gidx2)<<3u))+bitcast<i32>((bitcast<u32>(lidx0)<<2u)));
  var alu7 = (lidx2+bitcast<i32>((bitcast<u32>(gidx0)<<4u))+alu0);
  var alu8 = (alu6+(update_cache*-32));
  var alu9 = ((gidx2*4608000)+(lidx0*2304000));
  var alu10 = (alu7+alu9+(update_cache*-18432000));
  var alu11 = (alu6<cast1);
  var alu12 = (alu8<off);
  var val8 = select(0.0f, data1_18432000[alu10], ((-1<alu8)&alu12&(alu11!=true)));
  var alu13 = (alu7+alu9);
  var val9 = select(0.0f, data1_18432000[alu13], alu11);
  var alu14 = (off+1);
  var alu15 = (alu8<alu14);
  var val10 = select(0.0f, data1_18432000[alu10], ((alu15|alu11)!=true));
  var alu16 = (alu8+1);
  var alu17 = (alu10+576000);
  var alu18 = ((alu6+1)<cast1);
  var alu19 = (alu16<alu14);
  var val11 = select(0.0f, data1_18432000[alu17], ((alu19|alu18)!=true));
  var alu20 = (alu16<off);
  var val12 = select(0.0f, data1_18432000[alu17], ((-2<alu8)&alu20&(alu18!=true)));
  var alu21 = (alu8+2);
  var alu22 = (alu10+1152000);
  var alu23 = ((alu6+2)<cast1);
  var alu24 = (alu21<alu14);
  var val13 = select(0.0f, data1_18432000[alu22], ((alu24|alu23)!=true));
  var alu25 = (alu21<off);
  var val14 = select(0.0f, data1_18432000[alu22], ((-3<alu8)&alu25&(alu23!=true)));
  var alu26 = (alu8+3);
  var alu27 = (alu10+1728000);
  var alu28 = ((alu6+3)<cast1);
  var alu29 = (alu26<alu14);
  var val15 = select(0.0f, data1_18432000[alu27], ((alu29|alu28)!=true));
  var alu30 = (alu26<off);
  var val16 = select(0.0f, data1_18432000[alu27], ((-4<alu8)&alu30&(alu28!=true)));
  var alu31 = (alu13+576000);
  var val17 = select(0.0f, data1_18432000[alu31], alu18);
  var alu32 = (alu13+1152000);
  var val18 = select(0.0f, data1_18432000[alu32], alu23);
  var alu33 = (alu13+1728000);
  var val19 = select(0.0f, data1_18432000[alu33], alu28);
  var alu34 = select(0.0f,acc0[0],((alu12!=true)&alu15));
  var alu35 = select((val8+alu34+val10),0.0f,alu11);
  var alu36 = select(0.0f,acc0[0],((alu20!=true)&alu19));
  var alu37 = select(0.0f,acc0[0],((alu25!=true)&alu24));
  var alu38 = select(0.0f,acc0[0],((alu30!=true)&alu29));
  var alu39 = select((val12+alu36+val11),0.0f,alu18);
  var alu40 = select((val14+alu37+val13),0.0f,alu23);
  var alu41 = select((val16+alu38+val15),0.0f,alu28);
  data0_18432000[alu13] = (val9+alu35);
  data0_18432000[alu31] = (val17+alu39);
  data0_18432000[alu32] = (val18+alu40);
  data0_18432000[alu33] = (val19+alu41);
}`;

const r_4_375_24_2_4_16_4_96_4n3 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_18432000:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1_18432000:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2_576000:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3_147456:array<f32>;
@group(0) @binding(5)var<storage,read_write>data4_384:array<f32>;
@group(0) @binding(6)var<uniform>off:i32;
@group(0) @binding(7)var<uniform>update_cache:i32;
@compute @workgroup_size(2,4,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var acc0: array<f32,1>;
  var gidx0 = i32(gindex.x); /* 24 */
  var gidx1 = i32(gindex.y); /* 375 */
  var lidx1 = i32(lindex.y); /* 4 */
  var lidx2 = i32(lindex.z); /* 16 */
  var alu0 = ((gidx1*1536)+(lidx1*384));
  acc0[0] = 0.0f;
  for (var Ridx0 = 0; Ridx0 < 96; Ridx0++) {
    var cast0 = bitcast<i32>((bitcast<u32>(Ridx0)<<2u));
    var alu2 = (alu0+cast0);
    var val0 = data2_576000[(alu2+2)];
    var val1 = data2_576000[alu2];
    var alu3 = ((gidx0*6144)+(lidx2*384)+cast0);
    var val2 = data3_147456[(alu3+3)];
    var val3 = data3_147456[alu3];
    var val4 = data2_576000[(alu2+1)];
    var val5 = data3_147456[(alu3+1)];
    var val6 = data3_147456[(alu3+2)];
    var val7 = data2_576000[(alu2+3)];
    acc0[0] = (acc0[0]+(val1*val3)+(val4*val5)+(val0*val6)+(val7*val2));
  }
  var gidx2 = i32(gindex.z); /* 4 */
  var lidx0 = i32(lindex.x); /* 2 */
  var cast1 = bitcast<i32>((bitcast<u32>(update_cache)<<5u));
  var alu6 = (lidx2+bitcast<i32>((bitcast<u32>(gidx0)<<4u)));
  var alu7 = (bitcast<i32>((bitcast<u32>(gidx2)<<3u))+bitcast<i32>((bitcast<u32>(lidx0)<<2u)));
  var alu8 = (alu6+alu0);
  var alu9 = (alu7+(update_cache*-32));
  var alu10 = ((gidx2*4608000)+(lidx0*2304000));
  var alu11 = (alu8+alu10+(update_cache*-18432000));
  var alu12 = (alu7<cast1);
  var alu13 = (alu9<off);
  var val8 = select(0.0f, data1_18432000[alu11], ((-1<alu9)&alu13&(alu12!=true)));
  var alu14 = (alu8+alu10);
  var val9 = select(0.0f, data1_18432000[alu14], alu12);
  var val10 = data4_384[alu6];
  var alu15 = (off+1);
  var alu16 = (alu9<alu15);
  var val11 = select(0.0f, data1_18432000[alu11], ((alu16|alu12)!=true));
  var alu17 = (alu9+1);
  var alu18 = (alu11+576000);
  var alu19 = ((alu7+1)<cast1);
  var alu20 = (alu17<alu15);
  var val12 = select(0.0f, data1_18432000[alu18], ((alu20|alu19)!=true));
  var alu21 = (alu17<off);
  var val13 = select(0.0f, data1_18432000[alu18], ((-2<alu9)&alu21&(alu19!=true)));
  var alu22 = (alu9+2);
  var alu23 = (alu11+1152000);
  var alu24 = ((alu7+2)<cast1);
  var alu25 = (alu22<alu15);
  var val14 = select(0.0f, data1_18432000[alu23], ((alu25|alu24)!=true));
  var alu26 = (alu22<off);
  var val15 = select(0.0f, data1_18432000[alu23], ((-3<alu9)&alu26&(alu24!=true)));
  var alu27 = (alu9+3);
  var alu28 = (alu11+1728000);
  var alu29 = ((alu7+3)<cast1);
  var alu30 = (alu27<alu15);
  var val16 = select(0.0f, data1_18432000[alu28], ((alu30|alu29)!=true));
  var alu31 = (alu27<off);
  var val17 = select(0.0f, data1_18432000[alu28], ((-4<alu9)&alu31&(alu29!=true)));
  var alu32 = (alu14+576000);
  var val18 = select(0.0f, data1_18432000[alu32], alu19);
  var alu33 = (alu14+1152000);
  var val19 = select(0.0f, data1_18432000[alu33], alu24);
  var alu34 = (alu14+1728000);
  var val20 = select(0.0f, data1_18432000[alu34], alu29);
  var alu35 = (acc0[0]+val10);
  var alu36 = select(0.0f,alu35,((alu13!=true)&alu16));
  var alu37 = select((val8+alu36+val11),0.0f,alu12);
  var alu38 = select(0.0f,alu35,((alu21!=true)&alu20));
  var alu39 = select(0.0f,alu35,((alu26!=true)&alu25));
  var alu40 = select(0.0f,alu35,((alu31!=true)&alu30));
  var alu41 = select((val13+alu38+val12),0.0f,alu19);
  var alu42 = select((val15+alu39+val14),0.0f,alu24);
  var alu43 = select((val17+alu40+val16),0.0f,alu29);
  data0_18432000[alu14] = (val9+alu37);
  data0_18432000[alu32] = (val18+alu41);
  data0_18432000[alu33] = (val19+alu42);
  data0_18432000[alu34] = (val20+alu43);
}`;

const E_192000_32_3 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_18432000:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1_18432000:array<f32>;
@compute @workgroup_size(32) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 48000 */
  var gidx1 = i32(gindex.y); /* 4 */
  var lidx0 = i32(lindex.x); /* 32 */
  var alu0 = ((gidx0*384)+(gidx1*96)+(lidx0*3));
  var alu1 = (alu0+1);
  var val0 = data1_18432000[alu1];
  var alu2 = (alu0+2);
  var val1 = data1_18432000[alu2];
  var val2 = data1_18432000[alu0];
  data0_18432000[alu1] = val0;
  data0_18432000[alu2] = val1;
  data0_18432000[alu0] = val2;
}`;

const r_2_6_28ctx2B129_8_4_4_8 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
var<workgroup> temp0: array<f32,128>;
@group(0) @binding(1)var<storage,read_write>data0_86016:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1_12288:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2_5505024:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3_200704:array<f32>;
@group(0) @binding(5)var<uniform>ctx:i32;
@compute @workgroup_size(8,4) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var acc0: array<f32,4>;
  var acc1: array<f32,4>;
  var alu0 = (ctx+1);
  var gidx0 = i32(gindex.x); /* (ctx+1) */
  var gidx1 = i32(gindex.y); /* 6 */
  var gidx2 = i32(gindex.z); /* 2 */
  var lidx0 = i32(lindex.x); /* 8 */
  var lidx1 = i32(lindex.y); /* 4 */
  var alu1 = (lidx1+bitcast<i32>((bitcast<u32>(gidx2)<<4u)));
  var alu2 = ((ctx*6)+6);
  var alu3 = (gidx0+(alu1*alu2));
  var alu4 = (alu3/alu0);
  var alu5 = (gidx1+alu4);
  var alu6 = (((alu5>>1u)*10923)>>15u);
  var alu7 = (alu5-(6*alu6));
  var alu8 = (gidx0+((alu1+4)*alu2));
  var alu9 = (alu8/alu0);
  var alu10 = (gidx1+alu9);
  var alu11 = (((alu10>>1u)*10923)>>15u);
  var alu12 = (alu10-(6*alu11));
  var alu13 = (gidx0+((alu1+8)*alu2));
  var alu14 = (alu13/alu0);
  var alu15 = (gidx1+alu14);
  var alu16 = (((alu15>>1u)*43691)>>17u);
  var alu17 = (alu15-(6*alu16));
  var alu18 = (gidx0+((alu1+12)*alu2));
  var alu19 = (alu18/alu0);
  var alu20 = (gidx1+alu19);
  var alu21 = (((alu20>>1u)*43691)>>17u);
  var alu22 = (alu20-(6*alu21));
  var alu23 = (bitcast<i32>((bitcast<u32>(ctx)<<6u))+64);
  var alu24 = ((ctx*384)+384);
  var alu25 = (alu6&31);
  var alu26 = ((alu23*alu7)+(alu3-(alu0*alu4))+(alu24*alu25));
  var alu27 = (alu26/alu0);
  var alu28 = (lidx0+alu27);
  var alu29 = (alu11&31);
  var alu30 = ((alu23*alu12)+(alu8-(alu0*alu9))+(alu24*alu29));
  var alu31 = (alu30/alu0);
  var alu32 = (lidx0+alu31);
  var alu33 = (alu16&31);
  var alu34 = ((alu23*alu17)+(alu13-(alu0*alu14))+(alu24*alu33));
  var alu35 = (alu34/alu0);
  var alu36 = (lidx0+alu35);
  var alu37 = (alu21&31);
  var alu38 = ((alu23*alu22)+(alu18-(alu0*alu19))+(alu24*alu37));
  var alu39 = (alu38/alu0);
  var alu40 = (lidx0+alu39);
  var alu41 = select(0,7,(alu28<0));
  var alu42 = select(0,7,(alu32<0));
  var alu43 = select(0,7,(alu36<0));
  var alu44 = select(0,7,(alu40<0));
  var alu45 = (alu26-(alu0*alu27));
  var alu46 = (alu30-(alu0*alu31));
  var alu47 = (alu34-(alu0*alu35));
  var alu48 = (alu38-(alu0*alu39));
  acc0[0] = 0.0f;
  acc0[1] = 0.0f;
  acc0[2] = 0.0f;
  acc0[3] = 0.0f;
  for (var Ridx0 = 0; Ridx0 < 8; Ridx0++) {
    var alu53 = (lidx0+bitcast<i32>((bitcast<u32>(Ridx0)<<3u)));
    var val0 = data1_12288[(alu53+bitcast<i32>((bitcast<u32>(alu7)<<6u))+(alu25*384))];
    var alu54 = (((alu28+alu41)>>3u)+Ridx0);
    var alu55 = select(0,7,(alu54<0));
    var alu56 = ((alu54+alu55)>>3u);
    var val1 = data2_5505024[(bitcast<i32>((bitcast<u32>((alu56-(6*(alu56/6))))<<6u))+((alu53+alu27)&63)+(alu45*384)+((((alu54/48)+(alu45/alu0))&31)*172032))];
    var val2 = data1_12288[(alu53+bitcast<i32>((bitcast<u32>(alu12)<<6u))+(alu29*384))];
    var alu57 = (((alu32+alu42)>>3u)+Ridx0);
    var alu58 = select(0,7,(alu57<0));
    var alu59 = ((alu57+alu58)>>3u);
    var val3 = data2_5505024[(bitcast<i32>((bitcast<u32>((alu59-(6*(alu59/6))))<<6u))+((alu53+alu31)&63)+(alu46*384)+((((alu57/48)+(alu46/alu0))&31)*172032))];
    var val4 = data1_12288[(alu53+bitcast<i32>((bitcast<u32>(alu17)<<6u))+(alu33*384))];
    var alu60 = (((alu36+alu43)>>3u)+Ridx0);
    var alu61 = select(0,7,(alu60<0));
    var alu62 = ((alu60+alu61)>>3u);
    var val5 = data2_5505024[(bitcast<i32>((bitcast<u32>((alu62-(6*(alu62/6))))<<6u))+((alu53+alu35)&63)+(alu47*384)+((((alu60/48)+(alu47/alu0))&31)*172032))];
    var val6 = data1_12288[(alu53+bitcast<i32>((bitcast<u32>(alu22)<<6u))+(alu37*384))];
    var alu63 = (((alu40+alu44)>>3u)+Ridx0);
    var alu64 = select(0,7,(alu63<0));
    var alu65 = ((alu63+alu64)>>3u);
    var val7 = data2_5505024[(bitcast<i32>((bitcast<u32>((alu65-(6*(alu65/6))))<<6u))+((alu53+alu39)&63)+(alu48*384)+((((alu63/48)+(alu48/alu0))&31)*172032))];
    acc0[0] = (acc0[0]+(val0*val1));
    acc0[1] = (acc0[1]+(val2*val3));
    acc0[2] = (acc0[2]+(val4*val5));
    acc0[3] = (acc0[3]+(val6*val7));
  }
  var cast0 = bitcast<i32>((bitcast<u32>(lidx1)<<5u));
  var alu71 = (bitcast<i32>((bitcast<u32>(lidx0)<<2u))+cast0);
  temp0[alu71] = acc0[0];
  temp0[(alu71+1)] = acc0[1];
  temp0[(alu71+2)] = acc0[2];
  temp0[(alu71+3)] = acc0[3];
  workgroupBarrier();
  acc1[0] = 0.0f;
  acc1[1] = 0.0f;
  acc1[2] = 0.0f;
  acc1[3] = 0.0f;
  for (var Ridx104 = 0; Ridx104 < 8; Ridx104++) {
    var alu81 = (cast0+bitcast<i32>((bitcast<u32>(Ridx104)<<2u)));
    var val8 = temp0[alu81];
    var val9 = temp0[(alu81+1)];
    var val10 = temp0[(alu81+2)];
    var val11 = temp0[(alu81+3)];
    acc1[0] = (acc1[0]+val8);
    acc1[1] = (acc1[1]+val9);
    acc1[2] = (acc1[2]+val10);
    acc1[3] = (acc1[3]+val11);
  }
  var val12 = data3_200704[0];
  var alu87 = (gidx0+(gidx1*448)+(gidx2*43008)+(lidx1*2688));
  var alu88 = ((bool(lidx0))!=true);
  if (alu88) {
    data0_86016[alu87] = ((acc1[0]*0.125f)+val12);
  }
  if (alu88) {
    data0_86016[(alu87+10752)] = ((acc1[1]*0.125f)+val12);
  }
  if (alu88) {
    data0_86016[(alu87+21504)] = ((acc1[2]*0.125f)+val12);
  }
  if (alu88) {
    data0_86016[(alu87+32256)] = ((acc1[3]*0.125f)+val12);
  }
}`;

const r_3_16_4_28ctx2B129 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_192:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1_86016:array<f32>;
@group(0) @binding(3)var<uniform>ctx:i32;
@compute @workgroup_size(16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var acc0: array<f32,4>;
  var gidx0 = i32(gindex.x); /* 3 */
  var lidx0 = i32(lindex.x); /* 16 */
  acc0[0] = (f32(-INFINITY));
  acc0[1] = (f32(-INFINITY));
  acc0[2] = (f32(-INFINITY));
  acc0[3] = (f32(-INFINITY));
  for (var Ridx0 = 0; Ridx0 < (ctx+1); Ridx0++) {
    var alu4 = ((gidx0*28672)+(lidx0*1792)+Ridx0);
    var val0 = data1_86016[(alu4+448)];
    var val1 = data1_86016[alu4];
    var val2 = data1_86016[(alu4+896)];
    var val3 = data1_86016[(alu4+1344)];
    var alu5 = select(acc0[0],val1,(acc0[0]<val1));
    var alu6 = select(acc0[1],val0,(acc0[1]<val0));
    var alu7 = select(acc0[2],val2,(acc0[2]<val2));
    var alu8 = select(acc0[3],val3,(acc0[3]<val3));
    acc0[0] = alu5;
    acc0[1] = alu6;
    acc0[2] = alu7;
    acc0[3] = alu8;
  }
  var alu14 = (bitcast<i32>((bitcast<u32>(gidx0)<<6u))+bitcast<i32>((bitcast<u32>(lidx0)<<2u)));
  data0_192[alu14] = acc0[0];
  data0_192[(alu14+1)] = acc0[1];
  data0_192[(alu14+2)] = acc0[2];
  data0_192[(alu14+3)] = acc0[3];
}`;

const r_3_16_4_28ctx2B129n1 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_192:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1_86016:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2_192:array<f32>;
@group(0) @binding(4)var<uniform>ctx:i32;
@compute @workgroup_size(16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var acc0: array<f32,4>;
  var gidx0 = i32(gindex.x); /* 3 */
  var lidx0 = i32(lindex.x); /* 16 */
  var alu0 = (bitcast<i32>((bitcast<u32>(gidx0)<<6u))+bitcast<i32>((bitcast<u32>(lidx0)<<2u)));
  var val0 = data2_192[alu0];
  var alu1 = (alu0+1);
  var val1 = data2_192[alu1];
  var alu2 = (alu0+2);
  var val2 = data2_192[alu2];
  var alu3 = (alu0+3);
  var val3 = data2_192[alu3];
  acc0[0] = 0.0f;
  acc0[1] = 0.0f;
  acc0[2] = 0.0f;
  acc0[3] = 0.0f;
  for (var Ridx0 = 0; Ridx0 < (ctx+1); Ridx0++) {
    var alu8 = ((gidx0*28672)+(lidx0*1792)+Ridx0);
    var val4 = data1_86016[(alu8+448)];
    var val5 = data1_86016[alu8];
    var val6 = data1_86016[(alu8+896)];
    var val7 = data1_86016[(alu8+1344)];
    acc0[0] = (acc0[0]+exp2(((val5-val0)*1.4426950408889634f)));
    acc0[1] = (acc0[1]+exp2(((val4-val1)*1.4426950408889634f)));
    acc0[2] = (acc0[2]+exp2(((val6-val2)*1.4426950408889634f)));
    acc0[3] = (acc0[3]+exp2(((val7-val3)*1.4426950408889634f)));
  }
  data0_192[alu0] = acc0[0];
  data0_192[alu1] = acc0[1];
  data0_192[alu2] = acc0[2];
  data0_192[alu3] = acc0[3];
}`;

const r_16_2_2_3_16_4_28ctx2B129 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_12288:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1_86016:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2_192:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3_192:array<f32>;
@group(0) @binding(5)var<storage,read_write>data4_5505024:array<f32>;
@group(0) @binding(6)var<uniform>ctx:i32;
@compute @workgroup_size(2,3,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var acc0: array<f32,4>;
  var gidx0 = i32(gindex.x); /* 2 */
  var gidx1 = i32(gindex.y); /* 16 */
  var lidx0 = i32(lindex.x); /* 2 */
  var lidx1 = i32(lindex.y); /* 3 */
  var lidx2 = i32(lindex.z); /* 16 */
  var cast0 = bitcast<i32>((bitcast<u32>(lidx2)<<2u));
  var alu0 = (ctx+1);
  acc0[0] = 0.0f;
  acc0[1] = 0.0f;
  acc0[2] = 0.0f;
  acc0[3] = 0.0f;
  for (var Ridx0 = 0; Ridx0 < alu0; Ridx0++) {
    var alu5 = (((lidx0+bitcast<i32>((bitcast<u32>(gidx1)<<1u)))*((ctx*6)+6))+Ridx0);
    var alu6 = (alu5/alu0);
    var alu7 = (lidx1+(gidx0*3)+alu6);
    var alu8 = (alu7-(6*(((alu7>>1u)*43691)>>17u)));
    var alu9 = (alu5-(alu0*alu6));
    var alu10 = ((gidx0+((lidx1+alu6)/3))>>1u);
    var alu11 = (alu10&31);
    var val0 = data1_86016[((alu8*448)+alu9+(alu11*2688))];
    var alu12 = ((alu11*6)+alu8);
    var val1 = data2_192[alu12];
    var val2 = data3_192[alu12];
    var alu13 = (cast0+bitcast<i32>((bitcast<u32>(alu8)<<6u))+(alu9*384)+(((alu10+(alu9/alu0))&31)*172032));
    var val3 = data4_5505024[alu13];
    var val4 = data4_5505024[(alu13+1)];
    var val5 = data4_5505024[(alu13+2)];
    var val6 = data4_5505024[(alu13+3)];
    var alu14 = (exp2(((val0-val1)*1.4426950408889634f))*(1/val2));
    acc0[0] = (acc0[0]+(alu14*val3));
    acc0[1] = (acc0[1]+(alu14*val4));
    acc0[2] = (acc0[2]+(alu14*val5));
    acc0[3] = (acc0[3]+(alu14*val6));
  }
  var alu20 = ((gidx0*192)+bitcast<i32>((bitcast<u32>(lidx1)<<6u))+cast0+(gidx1*768)+(lidx0*384));
  data0_12288[(alu20+1)] = acc0[1];
  data0_12288[(alu20+2)] = acc0[2];
  data0_12288[(alu20+3)] = acc0[3];
  data0_12288[alu20] = acc0[0];
}`;

const r_8_8_16_3_4_96_4n2 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_12288:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1_12288:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2_12288:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3_147456:array<f32>;
@group(0) @binding(5)var<storage,read_write>data4_384:array<f32>;
@compute @workgroup_size(8,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var acc0: array<f32,12>;
  var gidx0 = i32(gindex.x); /* 8 */
  var lidx0 = i32(lindex.x); /* 8 */
  var lidx1 = i32(lindex.y); /* 16 */
  var alu0 = (lidx0*1536);
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
  for (var Ridx0 = 0; Ridx0 < 96; Ridx0++) {
    var cast0 = bitcast<i32>((bitcast<u32>(Ridx0)<<2u));
    var alu13 = (alu0+cast0);
    var val0 = data2_12288[alu13];
    var alu14 = ((gidx0*18432)+(lidx1*1152)+cast0);
    var val1 = data3_147456[alu14];
    var val2 = data2_12288[(alu13+1)];
    var val3 = data3_147456[(alu14+1)];
    var val4 = data2_12288[(alu13+2)];
    var val5 = data3_147456[(alu14+2)];
    var val6 = data2_12288[(alu13+3)];
    var val7 = data3_147456[(alu14+3)];
    var val8 = data2_12288[(alu13+384)];
    var val9 = data2_12288[(alu13+385)];
    var val10 = data2_12288[(alu13+386)];
    var val11 = data2_12288[(alu13+387)];
    var val12 = data2_12288[(alu13+768)];
    var val13 = data2_12288[(alu13+769)];
    var val14 = data2_12288[(alu13+770)];
    var val15 = data2_12288[(alu13+771)];
    var val16 = data2_12288[(alu13+1152)];
    var val17 = data2_12288[(alu13+1153)];
    var val18 = data2_12288[(alu13+1154)];
    var val19 = data2_12288[(alu13+1155)];
    var val20 = data3_147456[(alu14+384)];
    var val21 = data3_147456[(alu14+385)];
    var val22 = data3_147456[(alu14+386)];
    var val23 = data3_147456[(alu14+387)];
    var val24 = data3_147456[(alu14+768)];
    var val25 = data3_147456[(alu14+769)];
    var val26 = data3_147456[(alu14+770)];
    var val27 = data3_147456[(alu14+771)];
    acc0[0] = (acc0[0]+(val0*val1)+(val2*val3)+(val4*val5)+(val6*val7));
    acc0[1] = (acc0[1]+(val8*val1)+(val9*val3)+(val10*val5)+(val11*val7));
    acc0[2] = (acc0[2]+(val12*val1)+(val13*val3)+(val14*val5)+(val15*val7));
    acc0[3] = (acc0[3]+(val16*val1)+(val17*val3)+(val18*val5)+(val19*val7));
    acc0[4] = (acc0[4]+(val0*val20)+(val2*val21)+(val4*val22)+(val6*val23));
    acc0[5] = (acc0[5]+(val8*val20)+(val9*val21)+(val10*val22)+(val11*val23));
    acc0[6] = (acc0[6]+(val12*val20)+(val13*val21)+(val14*val22)+(val15*val23));
    acc0[7] = (acc0[7]+(val16*val20)+(val17*val21)+(val18*val22)+(val19*val23));
    acc0[8] = (acc0[8]+(val0*val24)+(val2*val25)+(val4*val26)+(val6*val27));
    acc0[9] = (acc0[9]+(val8*val24)+(val9*val25)+(val10*val26)+(val11*val27));
    acc0[10] = (acc0[10]+(val12*val24)+(val13*val25)+(val14*val26)+(val15*val27));
    acc0[11] = (acc0[11]+(val16*val24)+(val17*val25)+(val18*val26)+(val19*val27));
  }
  var alu28 = ((gidx0*48)+(lidx1*3));
  var val28 = data4_384[(alu28+1)];
  var val29 = data4_384[alu28];
  var alu29 = (alu28+alu0);
  var alu30 = (alu29+1);
  var val30 = data1_12288[alu30];
  var alu31 = (alu29+2);
  var val31 = data1_12288[alu31];
  var val32 = data4_384[(alu28+2)];
  var alu32 = (alu29+384);
  var val33 = data1_12288[alu32];
  var alu33 = (alu29+385);
  var val34 = data1_12288[alu33];
  var alu34 = (alu29+386);
  var val35 = data1_12288[alu34];
  var alu35 = (alu29+768);
  var val36 = data1_12288[alu35];
  var alu36 = (alu29+769);
  var val37 = data1_12288[alu36];
  var alu37 = (alu29+770);
  var val38 = data1_12288[alu37];
  var alu38 = (alu29+1152);
  var val39 = data1_12288[alu38];
  var alu39 = (alu29+1153);
  var val40 = data1_12288[alu39];
  var alu40 = (alu29+1154);
  var val41 = data1_12288[alu40];
  var val42 = data1_12288[alu29];
  data0_12288[alu32] = (val33+acc0[1]+val29);
  data0_12288[alu33] = (val34+acc0[5]+val28);
  data0_12288[alu34] = (val35+acc0[9]+val32);
  data0_12288[alu35] = (val36+acc0[2]+val29);
  data0_12288[alu36] = (val37+acc0[6]+val28);
  data0_12288[alu37] = (val38+acc0[10]+val32);
  data0_12288[alu38] = (val39+acc0[3]+val29);
  data0_12288[alu39] = (val40+acc0[7]+val28);
  data0_12288[alu40] = (val41+acc0[11]+val32);
  data0_12288[alu30] = (val30+acc0[4]+val28);
  data0_12288[alu31] = (val31+acc0[8]+val32);
  data0_12288[alu29] = (val42+acc0[0]+val29);
}`;

const r_2_6_1500_8_4_4_8 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
var<workgroup> temp0: array<f32,128>;
@group(0) @binding(1)var<storage,read_write>data0_288000:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1_12288:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2_18432000:array<f32>;
@compute @workgroup_size(8,4) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var acc0: array<f32,4>;
  var acc1: array<f32,4>;
  var gidx0 = i32(gindex.x); /* 1500 */
  var gidx1 = i32(gindex.y); /* 6 */
  var gidx2 = i32(gindex.z); /* 2 */
  var lidx0 = i32(lindex.x); /* 8 */
  var lidx1 = i32(lindex.y); /* 4 */
  acc0[0] = 0.0f;
  acc0[1] = 0.0f;
  acc0[2] = 0.0f;
  acc0[3] = 0.0f;
  for (var Ridx0 = 0; Ridx0 < 8; Ridx0++) {
    var alu4 = (lidx0+bitcast<i32>((bitcast<u32>(Ridx0)<<3u))+bitcast<i32>((bitcast<u32>(gidx1)<<6u)));
    var alu5 = (alu4+(gidx2*6144)+(lidx1*384));
    var val0 = data1_12288[alu5];
    var alu6 = (alu4+(gidx0*384)+(gidx2*9216000)+(lidx1*576000));
    var val1 = data2_18432000[alu6];
    var val2 = data1_12288[(alu5+1536)];
    var val3 = data2_18432000[(alu6+2304000)];
    var val4 = data1_12288[(alu5+3072)];
    var val5 = data2_18432000[(alu6+4608000)];
    var val6 = data1_12288[(alu5+4608)];
    var val7 = data2_18432000[(alu6+6912000)];
    acc0[0] = (acc0[0]+(val0*val1));
    acc0[1] = (acc0[1]+(val2*val3));
    acc0[2] = (acc0[2]+(val4*val5));
    acc0[3] = (acc0[3]+(val6*val7));
  }
  var cast0 = bitcast<i32>((bitcast<u32>(lidx1)<<5u));
  var alu12 = (bitcast<i32>((bitcast<u32>(lidx0)<<2u))+cast0);
  temp0[alu12] = acc0[0];
  temp0[(alu12+1)] = acc0[1];
  temp0[(alu12+2)] = acc0[2];
  temp0[(alu12+3)] = acc0[3];
  workgroupBarrier();
  acc1[0] = 0.0f;
  acc1[1] = 0.0f;
  acc1[2] = 0.0f;
  acc1[3] = 0.0f;
  for (var Ridx104 = 0; Ridx104 < 8; Ridx104++) {
    var alu22 = (cast0+bitcast<i32>((bitcast<u32>(Ridx104)<<2u)));
    var val8 = temp0[alu22];
    var val9 = temp0[(alu22+1)];
    var val10 = temp0[(alu22+2)];
    var val11 = temp0[(alu22+3)];
    acc1[0] = (acc1[0]+val8);
    acc1[1] = (acc1[1]+val9);
    acc1[2] = (acc1[2]+val10);
    acc1[3] = (acc1[3]+val11);
  }
  var alu28 = (gidx0+(gidx1*1500)+(gidx2*144000)+(lidx1*9000));
  var alu29 = ((bool(lidx0))!=true);
  if (alu29) {
    data0_288000[alu28] = (acc1[0]*0.125f);
  }
  if (alu29) {
    data0_288000[(alu28+36000)] = (acc1[1]*0.125f);
  }
  if (alu29) {
    data0_288000[(alu28+72000)] = (acc1[2]*0.125f);
  }
  if (alu29) {
    data0_288000[(alu28+108000)] = (acc1[3]*0.125f);
  }
}`;

const r_6_32_375_4 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_192:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1_288000:array<f32>;
@compute @workgroup_size(32) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var acc0: array<f32,1>;
  var gidx0 = i32(gindex.x); /* 6 */
  var lidx0 = i32(lindex.x); /* 32 */
  acc0[0] = (f32(-INFINITY));
  for (var Ridx0 = 0; Ridx0 < 375; Ridx0++) {
    var alu1 = ((gidx0*48000)+(lidx0*1500)+bitcast<i32>((bitcast<u32>(Ridx0)<<2u)));
    var val0 = data1_288000[(alu1+1)];
    var val1 = data1_288000[(alu1+2)];
    var val2 = data1_288000[(alu1+3)];
    var val3 = data1_288000[alu1];
    var alu2 = select(acc0[0],val3,(acc0[0]<val3));
    var alu3 = select(alu2,val0,(alu2<val0));
    var alu4 = select(alu3,val1,(alu3<val1));
    var alu5 = select(alu4,val2,(alu4<val2));
    acc0[0] = alu5;
  }
  data0_192[(lidx0+bitcast<i32>((bitcast<u32>(gidx0)<<5u)))] = acc0[0];
}`;

const r_6_32_375_4n1 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_192:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1_288000:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2_192:array<f32>;
@compute @workgroup_size(32) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var acc0: array<f32,1>;
  var gidx0 = i32(gindex.x); /* 6 */
  var lidx0 = i32(lindex.x); /* 32 */
  var alu0 = (lidx0+bitcast<i32>((bitcast<u32>(gidx0)<<5u)));
  var val0 = data2_192[alu0];
  acc0[0] = 0.0f;
  for (var Ridx0 = 0; Ridx0 < 375; Ridx0++) {
    var alu2 = ((gidx0*48000)+(lidx0*1500)+bitcast<i32>((bitcast<u32>(Ridx0)<<2u)));
    var val1 = data1_288000[(alu2+1)];
    var val2 = data1_288000[(alu2+2)];
    var val3 = data1_288000[(alu2+3)];
    var val4 = data1_288000[alu2];
    acc0[0] = (acc0[0]+exp2(((val4-val0)*1.4426950408889634f))+exp2(((val1-val0)*1.4426950408889634f))+exp2(((val2-val0)*1.4426950408889634f))+exp2(((val3-val0)*1.4426950408889634f)));
  }
  data0_192[alu0] = acc0[0];
}`;

const r_16_2_2_3_16_4_375_4 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_12288:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1_288000:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2_192:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3_192:array<f32>;
@group(0) @binding(5)var<storage,read_write>data4_18432000:array<f32>;
@compute @workgroup_size(2,3,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var acc0: array<f32,4>;
  var gidx0 = i32(gindex.x); /* 2 */
  var gidx1 = i32(gindex.y); /* 16 */
  var lidx0 = i32(lindex.x); /* 2 */
  var lidx1 = i32(lindex.y); /* 3 */
  var alu0 = (lidx1+(gidx0*3)+(gidx1*12)+(lidx0*6));
  var val0 = data2_192[alu0];
  var lidx2 = i32(lindex.z); /* 16 */
  var alu1 = ((gidx0*192)+bitcast<i32>((bitcast<u32>(lidx1)<<6u))+bitcast<i32>((bitcast<u32>(lidx2)<<2u)));
  acc0[0] = 0.0f;
  acc0[1] = 0.0f;
  acc0[2] = 0.0f;
  acc0[3] = 0.0f;
  for (var Ridx0 = 0; Ridx0 < 375; Ridx0++) {
    var alu6 = ((gidx0*4500)+(lidx1*1500)+bitcast<i32>((bitcast<u32>(Ridx0)<<2u))+(gidx1*18000)+(lidx0*9000));
    var val1 = data1_288000[(alu6+1)];
    var val2 = data1_288000[(alu6+3)];
    var val3 = data1_288000[alu6];
    var alu7 = (alu1+(Ridx0*1536)+(gidx1*1152000)+(lidx0*576000));
    var val4 = data4_18432000[(alu7+1)];
    var val5 = data4_18432000[(alu7+384)];
    var val6 = data4_18432000[(alu7+768)];
    var val7 = data4_18432000[(alu7+1152)];
    var val8 = data4_18432000[alu7];
    var val9 = data1_288000[(alu6+2)];
    var val10 = data4_18432000[(alu7+2)];
    var val11 = data4_18432000[(alu7+385)];
    var val12 = data4_18432000[(alu7+386)];
    var val13 = data4_18432000[(alu7+769)];
    var val14 = data4_18432000[(alu7+1153)];
    var val15 = data4_18432000[(alu7+3)];
    var val16 = data4_18432000[(alu7+387)];
    var val17 = data4_18432000[(alu7+770)];
    var val18 = data4_18432000[(alu7+771)];
    var val19 = data4_18432000[(alu7+1154)];
    var val20 = data4_18432000[(alu7+1155)];
    var alu8 = exp2(((val1-val0)*1.4426950408889634f));
    var alu9 = exp2(((val9-val0)*1.4426950408889634f));
    var alu10 = exp2(((val2-val0)*1.4426950408889634f));
    var alu11 = exp2(((val3-val0)*1.4426950408889634f));
    acc0[0] = (acc0[0]+(alu11*val8)+(alu8*val5)+(alu9*val6)+(alu10*val7));
    acc0[1] = (acc0[1]+(alu11*val4)+(alu8*val11)+(alu9*val13)+(alu10*val14));
    acc0[2] = (acc0[2]+(alu11*val10)+(alu8*val12)+(alu9*val17)+(alu10*val19));
    acc0[3] = (acc0[3]+(alu11*val15)+(alu8*val16)+(alu9*val18)+(alu10*val20));
  }
  var val21 = data3_192[alu0];
  var alu17 = (alu1+(gidx1*768)+(lidx0*384));
  var alu18 = (1/val21);
  data0_12288[(alu17+1)] = (acc0[1]*alu18);
  data0_12288[(alu17+2)] = (acc0[2]*alu18);
  data0_12288[(alu17+3)] = (acc0[3]*alu18);
  data0_12288[alu17] = (acc0[0]*alu18);
}`;

const r_32_8_16_3_4_96_4 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_49152:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1_12288:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2_589824:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3_1536:array<f32>;
@compute @workgroup_size(8,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var acc0: array<f32,12>;
  var gidx0 = i32(gindex.x); /* 32 */
  var lidx0 = i32(lindex.x); /* 8 */
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
  acc0[9] = 0.0f;
  acc0[10] = 0.0f;
  acc0[11] = 0.0f;
  for (var Ridx0 = 0; Ridx0 < 96; Ridx0++) {
    var cast0 = bitcast<i32>((bitcast<u32>(Ridx0)<<2u));
    var alu12 = ((lidx0*1536)+cast0);
    var val0 = data1_12288[(alu12+2)];
    var val1 = data1_12288[alu12];
    var alu13 = ((gidx0*18432)+(lidx1*1152)+cast0);
    var val2 = data2_589824[alu13];
    var val3 = data1_12288[(alu12+1)];
    var val4 = data2_589824[(alu13+1)];
    var val5 = data2_589824[(alu13+2)];
    var val6 = data1_12288[(alu12+3)];
    var val7 = data2_589824[(alu13+3)];
    var val8 = data1_12288[(alu12+384)];
    var val9 = data1_12288[(alu12+385)];
    var val10 = data1_12288[(alu12+386)];
    var val11 = data1_12288[(alu12+387)];
    var val12 = data1_12288[(alu12+768)];
    var val13 = data1_12288[(alu12+769)];
    var val14 = data1_12288[(alu12+770)];
    var val15 = data1_12288[(alu12+771)];
    var val16 = data1_12288[(alu12+1152)];
    var val17 = data1_12288[(alu12+1153)];
    var val18 = data1_12288[(alu12+1154)];
    var val19 = data1_12288[(alu12+1155)];
    var val20 = data2_589824[(alu13+384)];
    var val21 = data2_589824[(alu13+385)];
    var val22 = data2_589824[(alu13+386)];
    var val23 = data2_589824[(alu13+387)];
    var val24 = data2_589824[(alu13+768)];
    var val25 = data2_589824[(alu13+769)];
    var val26 = data2_589824[(alu13+770)];
    var val27 = data2_589824[(alu13+771)];
    acc0[0] = (acc0[0]+(val1*val2)+(val3*val4)+(val0*val5)+(val6*val7));
    acc0[1] = (acc0[1]+(val8*val2)+(val9*val4)+(val10*val5)+(val11*val7));
    acc0[2] = (acc0[2]+(val12*val2)+(val13*val4)+(val14*val5)+(val15*val7));
    acc0[3] = (acc0[3]+(val16*val2)+(val17*val4)+(val18*val5)+(val19*val7));
    acc0[4] = (acc0[4]+(val1*val20)+(val3*val21)+(val0*val22)+(val6*val23));
    acc0[5] = (acc0[5]+(val8*val20)+(val9*val21)+(val10*val22)+(val11*val23));
    acc0[6] = (acc0[6]+(val12*val20)+(val13*val21)+(val14*val22)+(val15*val23));
    acc0[7] = (acc0[7]+(val16*val20)+(val17*val21)+(val18*val22)+(val19*val23));
    acc0[8] = (acc0[8]+(val1*val24)+(val3*val25)+(val0*val26)+(val6*val27));
    acc0[9] = (acc0[9]+(val8*val24)+(val9*val25)+(val10*val26)+(val11*val27));
    acc0[10] = (acc0[10]+(val12*val24)+(val13*val25)+(val14*val26)+(val15*val27));
    acc0[11] = (acc0[11]+(val16*val24)+(val17*val25)+(val18*val26)+(val19*val27));
  }
  var alu27 = ((gidx0*48)+(lidx1*3));
  var val28 = data3_1536[alu27];
  var val29 = data3_1536[(alu27+1)];
  var val30 = data3_1536[(alu27+2)];
  var alu28 = (alu27+(lidx0*6144));
  var alu29 = (acc0[1]+val28);
  var alu30 = (acc0[5]+val29);
  var alu31 = (acc0[9]+val30);
  data0_49152[(alu28+1536)] = ((1/(1.0f+exp2(((alu29+(0.044715f*alu29*alu29*alu29))*-2.302208198144325f))))*alu29);
  data0_49152[(alu28+1537)] = ((1/(1.0f+exp2(((alu30+(0.044715f*alu30*alu30*alu30))*-2.302208198144325f))))*alu30);
  data0_49152[(alu28+1538)] = ((1/(1.0f+exp2(((alu31+(0.044715f*alu31*alu31*alu31))*-2.302208198144325f))))*alu31);
  var alu35 = (acc0[2]+val28);
  var alu36 = (acc0[6]+val29);
  var alu37 = (acc0[10]+val30);
  data0_49152[(alu28+3072)] = ((1/(1.0f+exp2(((alu35+(0.044715f*alu35*alu35*alu35))*-2.302208198144325f))))*alu35);
  data0_49152[(alu28+3073)] = ((1/(1.0f+exp2(((alu36+(0.044715f*alu36*alu36*alu36))*-2.302208198144325f))))*alu36);
  data0_49152[(alu28+3074)] = ((1/(1.0f+exp2(((alu37+(0.044715f*alu37*alu37*alu37))*-2.302208198144325f))))*alu37);
  var alu41 = (acc0[3]+val28);
  var alu42 = (acc0[7]+val29);
  var alu43 = (acc0[11]+val30);
  data0_49152[(alu28+4608)] = ((1/(1.0f+exp2(((alu41+(0.044715f*alu41*alu41*alu41))*-2.302208198144325f))))*alu41);
  data0_49152[(alu28+4609)] = ((1/(1.0f+exp2(((alu42+(0.044715f*alu42*alu42*alu42))*-2.302208198144325f))))*alu42);
  data0_49152[(alu28+4610)] = ((1/(1.0f+exp2(((alu43+(0.044715f*alu43*alu43*alu43))*-2.302208198144325f))))*alu43);
  var alu47 = (acc0[0]+val28);
  var alu48 = (acc0[4]+val29);
  var alu49 = (acc0[8]+val30);
  data0_49152[(alu28+1)] = ((1/(1.0f+exp2(((alu48+(0.044715f*alu48*alu48*alu48))*-2.302208198144325f))))*alu48);
  data0_49152[(alu28+2)] = ((1/(1.0f+exp2(((alu49+(0.044715f*alu49*alu49*alu49))*-2.302208198144325f))))*alu49);
  data0_49152[alu28] = ((1/(1.0f+exp2(((alu47+(0.044715f*alu47*alu47*alu47))*-2.302208198144325f))))*alu47);
}`;

const r_8_8_16_3_4_384_4 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_12288:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1_12288:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2_49152:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3_589824:array<f32>;
@group(0) @binding(5)var<storage,read_write>data4_384:array<f32>;
@compute @workgroup_size(8,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var acc0: array<f32,12>;
  var gidx0 = i32(gindex.x); /* 8 */
  var lidx0 = i32(lindex.x); /* 8 */
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
  acc0[9] = 0.0f;
  acc0[10] = 0.0f;
  acc0[11] = 0.0f;
  for (var Ridx0 = 0; Ridx0 < 384; Ridx0++) {
    var cast0 = bitcast<i32>((bitcast<u32>(Ridx0)<<2u));
    var alu12 = ((lidx0*6144)+cast0);
    var val0 = data2_49152[alu12];
    var alu13 = ((gidx0*73728)+(lidx1*4608)+cast0);
    var val1 = data3_589824[(alu13+1)];
    var val2 = data3_589824[(alu13+2)];
    var val3 = data3_589824[alu13];
    var val4 = data2_49152[(alu12+1)];
    var val5 = data2_49152[(alu12+2)];
    var val6 = data2_49152[(alu12+3)];
    var val7 = data3_589824[(alu13+3)];
    var val8 = data2_49152[(alu12+1536)];
    var val9 = data2_49152[(alu12+1537)];
    var val10 = data2_49152[(alu12+1538)];
    var val11 = data2_49152[(alu12+1539)];
    var val12 = data2_49152[(alu12+3072)];
    var val13 = data2_49152[(alu12+3073)];
    var val14 = data2_49152[(alu12+3074)];
    var val15 = data2_49152[(alu12+3075)];
    var val16 = data2_49152[(alu12+4608)];
    var val17 = data2_49152[(alu12+4609)];
    var val18 = data2_49152[(alu12+4610)];
    var val19 = data2_49152[(alu12+4611)];
    var val20 = data3_589824[(alu13+1536)];
    var val21 = data3_589824[(alu13+1537)];
    var val22 = data3_589824[(alu13+1538)];
    var val23 = data3_589824[(alu13+1539)];
    var val24 = data3_589824[(alu13+3072)];
    var val25 = data3_589824[(alu13+3073)];
    var val26 = data3_589824[(alu13+3074)];
    var val27 = data3_589824[(alu13+3075)];
    acc0[0] = (acc0[0]+(val0*val3)+(val4*val1)+(val5*val2)+(val6*val7));
    acc0[1] = (acc0[1]+(val8*val3)+(val9*val1)+(val10*val2)+(val11*val7));
    acc0[2] = (acc0[2]+(val12*val3)+(val13*val1)+(val14*val2)+(val15*val7));
    acc0[3] = (acc0[3]+(val16*val3)+(val17*val1)+(val18*val2)+(val19*val7));
    acc0[4] = (acc0[4]+(val0*val20)+(val4*val21)+(val5*val22)+(val6*val23));
    acc0[5] = (acc0[5]+(val8*val20)+(val9*val21)+(val10*val22)+(val11*val23));
    acc0[6] = (acc0[6]+(val12*val20)+(val13*val21)+(val14*val22)+(val15*val23));
    acc0[7] = (acc0[7]+(val16*val20)+(val17*val21)+(val18*val22)+(val19*val23));
    acc0[8] = (acc0[8]+(val0*val24)+(val4*val25)+(val5*val26)+(val6*val27));
    acc0[9] = (acc0[9]+(val8*val24)+(val9*val25)+(val10*val26)+(val11*val27));
    acc0[10] = (acc0[10]+(val12*val24)+(val13*val25)+(val14*val26)+(val15*val27));
    acc0[11] = (acc0[11]+(val16*val24)+(val17*val25)+(val18*val26)+(val19*val27));
  }
  var alu27 = ((gidx0*48)+(lidx1*3));
  var val28 = data4_384[alu27];
  var alu28 = (alu27+(lidx0*1536));
  var alu29 = (alu28+1);
  var val29 = data1_12288[alu29];
  var val30 = data4_384[(alu27+1)];
  var alu30 = (alu28+2);
  var val31 = data1_12288[alu30];
  var val32 = data4_384[(alu27+2)];
  var alu31 = (alu28+384);
  var val33 = data1_12288[alu31];
  var alu32 = (alu28+385);
  var val34 = data1_12288[alu32];
  var alu33 = (alu28+386);
  var val35 = data1_12288[alu33];
  var alu34 = (alu28+768);
  var val36 = data1_12288[alu34];
  var alu35 = (alu28+769);
  var val37 = data1_12288[alu35];
  var alu36 = (alu28+770);
  var val38 = data1_12288[alu36];
  var alu37 = (alu28+1152);
  var val39 = data1_12288[alu37];
  var alu38 = (alu28+1153);
  var val40 = data1_12288[alu38];
  var alu39 = (alu28+1154);
  var val41 = data1_12288[alu39];
  var val42 = data1_12288[alu28];
  data0_12288[alu31] = (val33+acc0[1]+val28);
  data0_12288[alu32] = (val34+acc0[5]+val30);
  data0_12288[alu33] = (val35+acc0[9]+val32);
  data0_12288[alu34] = (val36+acc0[2]+val28);
  data0_12288[alu35] = (val37+acc0[6]+val30);
  data0_12288[alu36] = (val38+acc0[10]+val32);
  data0_12288[alu37] = (val39+acc0[3]+val28);
  data0_12288[alu38] = (val40+acc0[7]+val30);
  data0_12288[alu39] = (val41+acc0[11]+val32);
  data0_12288[alu29] = (val29+acc0[4]+val30);
  data0_12288[alu30] = (val31+acc0[8]+val32);
  data0_12288[alu28] = (val42+acc0[0]+val28);
}`;

const r_2161_8_8_3_4_96_4 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_1659648:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1_12288:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2_19915776:array<f32>;
@compute @workgroup_size(8,8) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var acc0: array<f32,12>;
  var gidx0 = i32(gindex.x); /* 2161 */
  var lidx0 = i32(lindex.x); /* 8 */
  var lidx1 = i32(lindex.y); /* 8 */
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
  for (var Ridx0 = 0; Ridx0 < 96; Ridx0++) {
    var cast0 = bitcast<i32>((bitcast<u32>(Ridx0)<<2u));
    var alu12 = ((lidx0*1536)+cast0);
    var val0 = data1_12288[(alu12+1)];
    var val1 = data1_12288[alu12];
    var alu13 = ((gidx0*9216)+(lidx1*1152)+cast0);
    var val2 = data2_19915776[(alu13+1)];
    var val3 = data2_19915776[(alu13+2)];
    var val4 = data2_19915776[alu13];
    var val5 = data1_12288[(alu12+2)];
    var val6 = data1_12288[(alu12+3)];
    var val7 = data2_19915776[(alu13+3)];
    var val8 = data1_12288[(alu12+384)];
    var val9 = data1_12288[(alu12+385)];
    var val10 = data1_12288[(alu12+386)];
    var val11 = data1_12288[(alu12+387)];
    var val12 = data1_12288[(alu12+768)];
    var val13 = data1_12288[(alu12+769)];
    var val14 = data1_12288[(alu12+770)];
    var val15 = data1_12288[(alu12+771)];
    var val16 = data1_12288[(alu12+1152)];
    var val17 = data1_12288[(alu12+1153)];
    var val18 = data1_12288[(alu12+1154)];
    var val19 = data1_12288[(alu12+1155)];
    var val20 = data2_19915776[(alu13+384)];
    var val21 = data2_19915776[(alu13+385)];
    var val22 = data2_19915776[(alu13+386)];
    var val23 = data2_19915776[(alu13+387)];
    var val24 = data2_19915776[(alu13+768)];
    var val25 = data2_19915776[(alu13+769)];
    var val26 = data2_19915776[(alu13+770)];
    var val27 = data2_19915776[(alu13+771)];
    acc0[0] = (acc0[0]+(val1*val4)+(val0*val2)+(val5*val3)+(val6*val7));
    acc0[1] = (acc0[1]+(val8*val4)+(val9*val2)+(val10*val3)+(val11*val7));
    acc0[2] = (acc0[2]+(val12*val4)+(val13*val2)+(val14*val3)+(val15*val7));
    acc0[3] = (acc0[3]+(val16*val4)+(val17*val2)+(val18*val3)+(val19*val7));
    acc0[4] = (acc0[4]+(val1*val20)+(val0*val21)+(val5*val22)+(val6*val23));
    acc0[5] = (acc0[5]+(val8*val20)+(val9*val21)+(val10*val22)+(val11*val23));
    acc0[6] = (acc0[6]+(val12*val20)+(val13*val21)+(val14*val22)+(val15*val23));
    acc0[7] = (acc0[7]+(val16*val20)+(val17*val21)+(val18*val22)+(val19*val23));
    acc0[8] = (acc0[8]+(val1*val24)+(val0*val25)+(val5*val26)+(val6*val27));
    acc0[9] = (acc0[9]+(val8*val24)+(val9*val25)+(val10*val26)+(val11*val27));
    acc0[10] = (acc0[10]+(val12*val24)+(val13*val25)+(val14*val26)+(val15*val27));
    acc0[11] = (acc0[11]+(val16*val24)+(val17*val25)+(val18*val26)+(val19*val27));
  }
  var alu27 = ((gidx0*24)+(lidx1*3)+(lidx0*207456));
  data0_1659648[(alu27+51864)] = acc0[1];
  data0_1659648[(alu27+51865)] = acc0[5];
  data0_1659648[(alu27+51866)] = acc0[9];
  data0_1659648[(alu27+103728)] = acc0[2];
  data0_1659648[(alu27+103729)] = acc0[6];
  data0_1659648[(alu27+103730)] = acc0[10];
  data0_1659648[(alu27+155592)] = acc0[3];
  data0_1659648[(alu27+155593)] = acc0[7];
  data0_1659648[(alu27+155594)] = acc0[11];
  data0_1659648[(alu27+1)] = acc0[4];
  data0_1659648[(alu27+2)] = acc0[8];
  data0_1659648[alu27] = acc0[0];
}`;

const r_6_32_4_2161 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_768:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1_1659648:array<f32>;
@compute @workgroup_size(32) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var acc0: array<f32,4>;
  var gidx0 = i32(gindex.x); /* 6 */
  var lidx0 = i32(lindex.x); /* 32 */
  acc0[0] = (f32(-INFINITY));
  acc0[1] = (f32(-INFINITY));
  acc0[2] = (f32(-INFINITY));
  acc0[3] = (f32(-INFINITY));
  for (var Ridx0 = 0; Ridx0 < 2161; Ridx0++) {
    var alu4 = ((gidx0*276608)+(lidx0*8644)+Ridx0);
    var val0 = data1_1659648[alu4];
    var val1 = data1_1659648[(alu4+2161)];
    var val2 = data1_1659648[(alu4+4322)];
    var val3 = data1_1659648[(alu4+6483)];
    var alu5 = select(1.0f,-1.0f,(val1<0.0f));
    var alu6 = select(0.0f,alu5,(bool(val1)));
    var alu7 = (val1*alu6);
    var alu8 = select(1.0f,-1.0f,(val2<0.0f));
    var alu9 = select(0.0f,alu8,(bool(val2)));
    var alu10 = (val2*alu9);
    var alu11 = select(1.0f,-1.0f,(val3<0.0f));
    var alu12 = select(0.0f,alu11,(bool(val3)));
    var alu13 = (val3*alu12);
    var alu14 = select(1.0f,-1.0f,(val0<0.0f));
    var alu15 = select(0.0f,alu14,(bool(val0)));
    var alu16 = (val0*alu15);
    var alu17 = select(acc0[0],alu16,(acc0[0]<alu16));
    var alu18 = select(acc0[1],alu7,(acc0[1]<alu7));
    var alu19 = select(acc0[2],alu10,(acc0[2]<alu10));
    var alu20 = select(acc0[3],alu13,(acc0[3]<alu13));
    acc0[0] = alu17;
    acc0[1] = alu18;
    acc0[2] = alu19;
    acc0[3] = alu20;
  }
  var alu26 = (bitcast<i32>((bitcast<u32>(gidx0)<<7u))+bitcast<i32>((bitcast<u32>(lidx0)<<2u)));
  data0_768[alu26] = acc0[0];
  data0_768[(alu26+1)] = acc0[1];
  data0_768[(alu26+2)] = acc0[2];
  data0_768[(alu26+3)] = acc0[3];
}`;

const r_32_24 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_32:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1_768:array<f32>;
@compute @workgroup_size(32) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var lidx0 = i32(lindex.x); /* 32 */
  var alu0 = (lidx0*24);
  var val0 = data1_768[(alu0+1)];
  var val1 = data1_768[(alu0+2)];
  var val2 = data1_768[(alu0+3)];
  var val3 = data1_768[(alu0+4)];
  var val4 = data1_768[(alu0+5)];
  var val5 = data1_768[(alu0+6)];
  var val6 = data1_768[(alu0+7)];
  var val7 = data1_768[(alu0+8)];
  var val8 = data1_768[(alu0+9)];
  var val9 = data1_768[(alu0+10)];
  var val10 = data1_768[(alu0+11)];
  var val11 = data1_768[(alu0+12)];
  var val12 = data1_768[(alu0+13)];
  var val13 = data1_768[(alu0+14)];
  var val14 = data1_768[(alu0+15)];
  var val15 = data1_768[(alu0+16)];
  var val16 = data1_768[(alu0+17)];
  var val17 = data1_768[(alu0+18)];
  var val18 = data1_768[(alu0+19)];
  var val19 = data1_768[(alu0+20)];
  var val20 = data1_768[(alu0+21)];
  var val21 = data1_768[(alu0+22)];
  var val22 = data1_768[(alu0+23)];
  var val23 = data1_768[alu0];
  var alu1 = select(val23,val0,(val23<val0));
  var alu2 = select(alu1,val1,(alu1<val1));
  var alu3 = select(alu2,val2,(alu2<val2));
  var alu4 = select(alu3,val3,(alu3<val3));
  var alu5 = select(alu4,val4,(alu4<val4));
  var alu6 = select(alu5,val5,(alu5<val5));
  var alu7 = select(alu6,val6,(alu6<val6));
  var alu8 = select(alu7,val7,(alu7<val7));
  var alu9 = select(alu8,val8,(alu8<val8));
  var alu10 = select(alu9,val9,(alu9<val9));
  var alu11 = select(alu10,val10,(alu10<val10));
  var alu12 = select(alu11,val11,(alu11<val11));
  var alu13 = select(alu12,val12,(alu12<val12));
  var alu14 = select(alu13,val13,(alu13<val13));
  var alu15 = select(alu14,val14,(alu14<val14));
  var alu16 = select(alu15,val15,(alu15<val15));
  var alu17 = select(alu16,val16,(alu16<val16));
  var alu18 = select(alu17,val17,(alu17<val17));
  var alu19 = select(alu18,val18,(alu18<val18));
  var alu20 = select(alu19,val19,(alu19<val19));
  var alu21 = select(alu20,val20,(alu20<val20));
  var alu22 = select(alu21,val21,(alu21<val21));
  var alu23 = select(alu22,val22,(alu22<val22));
  data0_32[lidx0] = alu23;
}`;

const E_8_1024_4_16_2_2 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_2097152:array<i32>;
@group(0) @binding(2)var<storage,read_write>data1_1659648:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2_32:array<f32>;
@compute @workgroup_size(4,16,2) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 1024 */
  var gidx1 = i32(gindex.y); /* 8 */
  var lidx0 = i32(lindex.x); /* 4 */
  var lidx1 = i32(lindex.y); /* 16 */
  var lidx2 = i32(lindex.z); /* 2 */
  var cast0 = bitcast<u32>(gidx0);
  var alu0 = (bitcast<i32>((cast0<<6u))+bitcast<i32>((bitcast<u32>(lidx1)<<2u)));
  var alu1 = (lidx2+alu0);
  var alu2 = ((gidx1*207456)+(lidx0*51864));
  var alu3 = (alu1-(51864*(((alu1>>3u)*647)>>22u)));
  var alu4 = ((lidx1+bitcast<i32>((cast0<<4u)))<12966);
  var val0 = select(0.0f, data1_1659648[(alu2+alu3)], alu4);
  var cast1 = bitcast<u32>(gidx1);
  var val1 = data2_32[(lidx0+bitcast<i32>((cast1<<2u)))];
  var alu5 = (alu0+(lidx2*51863)+3);
  var alu6 = (alu5-(51864*(((alu5>>3u)*647)>>22u)));
  var val2 = select(0.0f, data1_1659648[(alu2+alu6)], alu4);
  var alu7 = (alu1+bitcast<i32>((cast1<<18u))+bitcast<i32>((bitcast<u32>(lidx0)<<16u)));
  var alu8 = (1/val1);
  var alu9 = select(-2147483648,((i32(((u32(((val0*alu8*255.0f)+256.0f)))<<16u)))+alu3),alu4);
  var alu10 = select(-2147483648,((i32(((u32(((val2*alu8*255.0f)+256.0f)))<<16u)))+alu6),alu4);
  data0_2097152[alu7] = alu9;
  data0_2097152[(alu7+2)] = alu10;
}`;

const E_32768_32_2 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_2097152:array<i32>;
@group(0) @binding(2)var<storage,read_write>data1_2097152:array<i32>;
@compute @workgroup_size(32) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 32768 */
  var lidx0 = i32(lindex.x); /* 32 */
  var alu0 = (bitcast<i32>((bitcast<u32>(gidx0)<<6u))+bitcast<i32>((bitcast<u32>(lidx0)<<1u)));
  var val0 = data1_2097152[alu0];
  var alu1 = (alu0+1);
  var val1 = data1_2097152[alu1];
  var alu2 = (val0^-1);
  var alu3 = (val1^-1);
  var alu4 = select(alu2,alu3,(alu2<alu3));
  var alu5 = select(val0,val1,(val0<val1));
  data0_2097152[alu0] = alu5;
  data0_2097152[alu1] = (alu4^-1);
}`;

const E_8192_32_2_2_2 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_2097152:array<i32>;
@group(0) @binding(2)var<storage,read_write>data1_2097152:array<i32>;
@compute @workgroup_size(32,2) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 8192 */
  var lidx0 = i32(lindex.x); /* 32 */
  var lidx1 = i32(lindex.y); /* 2 */
  var alu0 = (bitcast<i32>((bitcast<u32>(gidx0)<<8u))+bitcast<i32>((bitcast<u32>(lidx0)<<3u)));
  var alu1 = (lidx1+alu0);
  var val0 = data1_2097152[alu1];
  var alu2 = (alu1+6);
  var val1 = data1_2097152[alu2];
  var alu3 = (alu0-lidx1);
  var val2 = data1_2097152[(alu3+3)];
  var val3 = data1_2097152[(alu3+5)];
  data0_2097152[alu1] = val0;
  data0_2097152[(alu1+2)] = val2;
  data0_2097152[(alu1+4)] = val1;
  data0_2097152[alu2] = val3;
}`;

const E_16384_32_2_2 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_2097152:array<i32>;
@group(0) @binding(2)var<storage,read_write>data1_2097152:array<i32>;
@compute @workgroup_size(32,2) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 16384 */
  var lidx0 = i32(lindex.x); /* 32 */
  var lidx1 = i32(lindex.y); /* 2 */
  var alu0 = (lidx1+bitcast<i32>((bitcast<u32>(gidx0)<<7u))+bitcast<i32>((bitcast<u32>(lidx0)<<2u)));
  var val0 = data1_2097152[alu0];
  var alu1 = (alu0+2);
  var val1 = data1_2097152[alu1];
  var alu2 = (val0^-1);
  var alu3 = (val1^-1);
  var alu4 = select(alu2,alu3,(alu2<alu3));
  var alu5 = select(val0,val1,(val0<val1));
  data0_2097152[alu0] = alu5;
  data0_2097152[alu1] = (alu4^-1);
}`;

const E_4096_32_4_2_2 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_2097152:array<i32>;
@group(0) @binding(2)var<storage,read_write>data1_2097152:array<i32>;
@compute @workgroup_size(32,4) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 4096 */
  var lidx0 = i32(lindex.x); /* 32 */
  var lidx1 = i32(lindex.y); /* 4 */
  var alu0 = (bitcast<i32>((bitcast<u32>(gidx0)<<9u))+bitcast<i32>((bitcast<u32>(lidx0)<<4u)));
  var alu1 = (lidx1+alu0);
  var val0 = data1_2097152[alu1];
  var alu2 = (alu1+12);
  var val1 = data1_2097152[alu2];
  var alu3 = (alu0-lidx1);
  var val2 = data1_2097152[(alu3+7)];
  var val3 = data1_2097152[(alu3+11)];
  data0_2097152[alu1] = val0;
  data0_2097152[(alu1+4)] = val2;
  data0_2097152[(alu1+8)] = val1;
  data0_2097152[alu2] = val3;
}`;

const E_8192_32_4_2 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_2097152:array<i32>;
@group(0) @binding(2)var<storage,read_write>data1_2097152:array<i32>;
@compute @workgroup_size(32,4) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 8192 */
  var lidx0 = i32(lindex.x); /* 32 */
  var lidx1 = i32(lindex.y); /* 4 */
  var alu0 = (lidx1+bitcast<i32>((bitcast<u32>(gidx0)<<8u))+bitcast<i32>((bitcast<u32>(lidx0)<<3u)));
  var val0 = data1_2097152[alu0];
  var alu1 = (alu0+4);
  var val1 = data1_2097152[alu1];
  var alu2 = (val0^-1);
  var alu3 = (val1^-1);
  var alu4 = select(alu2,alu3,(alu2<alu3));
  var alu5 = select(val0,val1,(val0<val1));
  data0_2097152[alu0] = alu5;
  data0_2097152[alu1] = (alu4^-1);
}`;

const E_4096_16_8_2_2 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_2097152:array<i32>;
@group(0) @binding(2)var<storage,read_write>data1_2097152:array<i32>;
@compute @workgroup_size(16,8) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 4096 */
  var lidx0 = i32(lindex.x); /* 16 */
  var lidx1 = i32(lindex.y); /* 8 */
  var alu0 = (bitcast<i32>((bitcast<u32>(gidx0)<<9u))+bitcast<i32>((bitcast<u32>(lidx0)<<5u)));
  var alu1 = (lidx1+alu0);
  var val0 = data1_2097152[alu1];
  var alu2 = (alu1+24);
  var val1 = data1_2097152[alu2];
  var alu3 = (alu0-lidx1);
  var val2 = data1_2097152[(alu3+15)];
  var val3 = data1_2097152[(alu3+23)];
  data0_2097152[alu1] = val0;
  data0_2097152[(alu1+8)] = val2;
  data0_2097152[(alu1+16)] = val1;
  data0_2097152[alu2] = val3;
}`;

const E_8192_16_8_2 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_2097152:array<i32>;
@group(0) @binding(2)var<storage,read_write>data1_2097152:array<i32>;
@compute @workgroup_size(16,8) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 8192 */
  var lidx0 = i32(lindex.x); /* 16 */
  var lidx1 = i32(lindex.y); /* 8 */
  var alu0 = (lidx1+bitcast<i32>((bitcast<u32>(gidx0)<<8u))+bitcast<i32>((bitcast<u32>(lidx0)<<4u)));
  var val0 = data1_2097152[alu0];
  var alu1 = (alu0+8);
  var val1 = data1_2097152[alu1];
  var alu2 = (val0^-1);
  var alu3 = (val1^-1);
  var alu4 = select(alu2,alu3,(alu2<alu3));
  var alu5 = select(val0,val1,(val0<val1));
  data0_2097152[alu0] = alu5;
  data0_2097152[alu1] = (alu4^-1);
}`;

const E_4096_8_16_2_2 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_2097152:array<i32>;
@group(0) @binding(2)var<storage,read_write>data1_2097152:array<i32>;
@compute @workgroup_size(8,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 4096 */
  var lidx0 = i32(lindex.x); /* 8 */
  var lidx1 = i32(lindex.y); /* 16 */
  var alu0 = (bitcast<i32>((bitcast<u32>(gidx0)<<9u))+bitcast<i32>((bitcast<u32>(lidx0)<<6u)));
  var alu1 = (lidx1+alu0);
  var val0 = data1_2097152[alu1];
  var alu2 = (alu1+48);
  var val1 = data1_2097152[alu2];
  var alu3 = (alu0-lidx1);
  var val2 = data1_2097152[(alu3+31)];
  var val3 = data1_2097152[(alu3+47)];
  data0_2097152[alu1] = val0;
  data0_2097152[(alu1+16)] = val2;
  data0_2097152[(alu1+32)] = val1;
  data0_2097152[alu2] = val3;
}`;

const E_8192_8_16_2 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_2097152:array<i32>;
@group(0) @binding(2)var<storage,read_write>data1_2097152:array<i32>;
@compute @workgroup_size(8,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 8192 */
  var lidx0 = i32(lindex.x); /* 8 */
  var lidx1 = i32(lindex.y); /* 16 */
  var alu0 = (lidx1+bitcast<i32>((bitcast<u32>(gidx0)<<8u))+bitcast<i32>((bitcast<u32>(lidx0)<<5u)));
  var val0 = data1_2097152[alu0];
  var alu1 = (alu0+16);
  var val1 = data1_2097152[alu1];
  var alu2 = (val0^-1);
  var alu3 = (val1^-1);
  var alu4 = select(alu2,alu3,(alu2<alu3));
  var alu5 = select(val0,val1,(val0<val1));
  data0_2097152[alu0] = alu5;
  data0_2097152[alu1] = (alu4^-1);
}`;

const E_2048_2_8_16_2_2 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_2097152:array<i32>;
@group(0) @binding(2)var<storage,read_write>data1_2097152:array<i32>;
@compute @workgroup_size(8,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 2 */
  var gidx1 = i32(gindex.y); /* 2048 */
  var lidx0 = i32(lindex.x); /* 8 */
  var lidx1 = i32(lindex.y); /* 16 */
  var alu0 = (bitcast<i32>((bitcast<u32>(gidx1)<<10u))+bitcast<i32>((bitcast<u32>(lidx0)<<7u)));
  var alu1 = (lidx1+bitcast<i32>((bitcast<u32>(gidx0)<<4u))+alu0);
  var val0 = data1_2097152[alu1];
  var alu2 = (alu1+96);
  var val1 = data1_2097152[alu2];
  var alu3 = (((gidx0*-16)-lidx1)+alu0);
  var val2 = data1_2097152[(alu3+63)];
  var val3 = data1_2097152[(alu3+95)];
  data0_2097152[alu1] = val0;
  data0_2097152[(alu1+32)] = val2;
  data0_2097152[(alu1+64)] = val1;
  data0_2097152[alu2] = val3;
}`;

const E_4096_2_8_16_2 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_2097152:array<i32>;
@group(0) @binding(2)var<storage,read_write>data1_2097152:array<i32>;
@compute @workgroup_size(8,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 2 */
  var gidx1 = i32(gindex.y); /* 4096 */
  var lidx0 = i32(lindex.x); /* 8 */
  var lidx1 = i32(lindex.y); /* 16 */
  var alu0 = (lidx1+bitcast<i32>((bitcast<u32>(gidx0)<<4u))+bitcast<i32>((bitcast<u32>(gidx1)<<9u))+bitcast<i32>((bitcast<u32>(lidx0)<<6u)));
  var val0 = data1_2097152[alu0];
  var alu1 = (alu0+32);
  var val1 = data1_2097152[alu1];
  var alu2 = (val0^-1);
  var alu3 = (val1^-1);
  var alu4 = select(alu2,alu3,(alu2<alu3));
  var alu5 = select(val0,val1,(val0<val1));
  data0_2097152[alu0] = alu5;
  data0_2097152[alu1] = (alu4^-1);
}`;

const E_1024_4_8_16_2_2 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_2097152:array<i32>;
@group(0) @binding(2)var<storage,read_write>data1_2097152:array<i32>;
@compute @workgroup_size(8,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 4 */
  var gidx1 = i32(gindex.y); /* 1024 */
  var lidx0 = i32(lindex.x); /* 8 */
  var lidx1 = i32(lindex.y); /* 16 */
  var alu0 = (bitcast<i32>((bitcast<u32>(gidx1)<<11u))+bitcast<i32>((bitcast<u32>(lidx0)<<8u)));
  var alu1 = (lidx1+bitcast<i32>((bitcast<u32>(gidx0)<<4u))+alu0);
  var val0 = data1_2097152[alu1];
  var alu2 = (alu1+192);
  var val1 = data1_2097152[alu2];
  var alu3 = (((gidx0*-16)-lidx1)+alu0);
  var val2 = data1_2097152[(alu3+127)];
  var val3 = data1_2097152[(alu3+191)];
  data0_2097152[alu1] = val0;
  data0_2097152[(alu1+64)] = val2;
  data0_2097152[(alu1+128)] = val1;
  data0_2097152[alu2] = val3;
}`;

const E_2048_4_8_16_2 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_2097152:array<i32>;
@group(0) @binding(2)var<storage,read_write>data1_2097152:array<i32>;
@compute @workgroup_size(8,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 4 */
  var gidx1 = i32(gindex.y); /* 2048 */
  var lidx0 = i32(lindex.x); /* 8 */
  var lidx1 = i32(lindex.y); /* 16 */
  var alu0 = (lidx1+bitcast<i32>((bitcast<u32>(gidx0)<<4u))+bitcast<i32>((bitcast<u32>(gidx1)<<10u))+bitcast<i32>((bitcast<u32>(lidx0)<<7u)));
  var val0 = data1_2097152[alu0];
  var alu1 = (alu0+64);
  var val1 = data1_2097152[alu1];
  var alu2 = (val0^-1);
  var alu3 = (val1^-1);
  var alu4 = select(alu2,alu3,(alu2<alu3));
  var alu5 = select(val0,val1,(val0<val1));
  data0_2097152[alu0] = alu5;
  data0_2097152[alu1] = (alu4^-1);
}`;

const E_512_8_8_16_2_2 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_2097152:array<i32>;
@group(0) @binding(2)var<storage,read_write>data1_2097152:array<i32>;
@compute @workgroup_size(8,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 8 */
  var gidx1 = i32(gindex.y); /* 512 */
  var lidx0 = i32(lindex.x); /* 8 */
  var lidx1 = i32(lindex.y); /* 16 */
  var alu0 = (bitcast<i32>((bitcast<u32>(gidx1)<<12u))+bitcast<i32>((bitcast<u32>(lidx0)<<9u)));
  var alu1 = (lidx1+bitcast<i32>((bitcast<u32>(gidx0)<<4u))+alu0);
  var val0 = data1_2097152[alu1];
  var alu2 = (alu1+384);
  var val1 = data1_2097152[alu2];
  var alu3 = (((gidx0*-16)-lidx1)+alu0);
  var val2 = data1_2097152[(alu3+255)];
  var val3 = data1_2097152[(alu3+383)];
  data0_2097152[alu1] = val0;
  data0_2097152[(alu1+128)] = val2;
  data0_2097152[(alu1+256)] = val1;
  data0_2097152[alu2] = val3;
}`;

const E_1024_8_8_16_2 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_2097152:array<i32>;
@group(0) @binding(2)var<storage,read_write>data1_2097152:array<i32>;
@compute @workgroup_size(8,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 8 */
  var gidx1 = i32(gindex.y); /* 1024 */
  var lidx0 = i32(lindex.x); /* 8 */
  var lidx1 = i32(lindex.y); /* 16 */
  var alu0 = (lidx1+bitcast<i32>((bitcast<u32>(gidx0)<<4u))+bitcast<i32>((bitcast<u32>(gidx1)<<11u))+bitcast<i32>((bitcast<u32>(lidx0)<<8u)));
  var val0 = data1_2097152[alu0];
  var alu1 = (alu0+128);
  var val1 = data1_2097152[alu1];
  var alu2 = (val0^-1);
  var alu3 = (val1^-1);
  var alu4 = select(alu2,alu3,(alu2<alu3));
  var alu5 = select(val0,val1,(val0<val1));
  data0_2097152[alu0] = alu5;
  data0_2097152[alu1] = (alu4^-1);
}`;

const E_256_16_8_16_2_2 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_2097152:array<i32>;
@group(0) @binding(2)var<storage,read_write>data1_2097152:array<i32>;
@compute @workgroup_size(8,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 16 */
  var gidx1 = i32(gindex.y); /* 256 */
  var lidx0 = i32(lindex.x); /* 8 */
  var lidx1 = i32(lindex.y); /* 16 */
  var alu0 = (bitcast<i32>((bitcast<u32>(gidx1)<<13u))+bitcast<i32>((bitcast<u32>(lidx0)<<10u)));
  var alu1 = (lidx1+bitcast<i32>((bitcast<u32>(gidx0)<<4u))+alu0);
  var val0 = data1_2097152[alu1];
  var alu2 = (alu1+768);
  var val1 = data1_2097152[alu2];
  var alu3 = (((gidx0*-16)-lidx1)+alu0);
  var val2 = data1_2097152[(alu3+511)];
  var val3 = data1_2097152[(alu3+767)];
  data0_2097152[alu1] = val0;
  data0_2097152[(alu1+256)] = val2;
  data0_2097152[(alu1+512)] = val1;
  data0_2097152[alu2] = val3;
}`;

const E_512_16_8_16_2 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_2097152:array<i32>;
@group(0) @binding(2)var<storage,read_write>data1_2097152:array<i32>;
@compute @workgroup_size(8,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 16 */
  var gidx1 = i32(gindex.y); /* 512 */
  var lidx0 = i32(lindex.x); /* 8 */
  var lidx1 = i32(lindex.y); /* 16 */
  var alu0 = (lidx1+bitcast<i32>((bitcast<u32>(gidx0)<<4u))+bitcast<i32>((bitcast<u32>(gidx1)<<12u))+bitcast<i32>((bitcast<u32>(lidx0)<<9u)));
  var val0 = data1_2097152[alu0];
  var alu1 = (alu0+256);
  var val1 = data1_2097152[alu1];
  var alu2 = (val0^-1);
  var alu3 = (val1^-1);
  var alu4 = select(alu2,alu3,(alu2<alu3));
  var alu5 = select(val0,val1,(val0<val1));
  data0_2097152[alu0] = alu5;
  data0_2097152[alu1] = (alu4^-1);
}`;

const E_128_32_8_16_2_2 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_2097152:array<i32>;
@group(0) @binding(2)var<storage,read_write>data1_2097152:array<i32>;
@compute @workgroup_size(8,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 32 */
  var gidx1 = i32(gindex.y); /* 128 */
  var lidx0 = i32(lindex.x); /* 8 */
  var lidx1 = i32(lindex.y); /* 16 */
  var alu0 = (bitcast<i32>((bitcast<u32>(gidx1)<<14u))+bitcast<i32>((bitcast<u32>(lidx0)<<11u)));
  var alu1 = (lidx1+bitcast<i32>((bitcast<u32>(gidx0)<<4u))+alu0);
  var val0 = data1_2097152[alu1];
  var alu2 = (alu1+1536);
  var val1 = data1_2097152[alu2];
  var alu3 = (((gidx0*-16)-lidx1)+alu0);
  var val2 = data1_2097152[(alu3+1023)];
  var val3 = data1_2097152[(alu3+1535)];
  data0_2097152[alu1] = val0;
  data0_2097152[(alu1+512)] = val2;
  data0_2097152[(alu1+1024)] = val1;
  data0_2097152[alu2] = val3;
}`;

const E_256_32_8_16_2 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_2097152:array<i32>;
@group(0) @binding(2)var<storage,read_write>data1_2097152:array<i32>;
@compute @workgroup_size(8,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 32 */
  var gidx1 = i32(gindex.y); /* 256 */
  var lidx0 = i32(lindex.x); /* 8 */
  var lidx1 = i32(lindex.y); /* 16 */
  var alu0 = (lidx1+bitcast<i32>((bitcast<u32>(gidx0)<<4u))+bitcast<i32>((bitcast<u32>(gidx1)<<13u))+bitcast<i32>((bitcast<u32>(lidx0)<<10u)));
  var val0 = data1_2097152[alu0];
  var alu1 = (alu0+512);
  var val1 = data1_2097152[alu1];
  var alu2 = (val0^-1);
  var alu3 = (val1^-1);
  var alu4 = select(alu2,alu3,(alu2<alu3));
  var alu5 = select(val0,val1,(val0<val1));
  data0_2097152[alu0] = alu5;
  data0_2097152[alu1] = (alu4^-1);
}`;

const E_64_64_8_16_2_2 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_2097152:array<i32>;
@group(0) @binding(2)var<storage,read_write>data1_2097152:array<i32>;
@compute @workgroup_size(8,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 64 */
  var gidx1 = i32(gindex.y); /* 64 */
  var lidx0 = i32(lindex.x); /* 8 */
  var lidx1 = i32(lindex.y); /* 16 */
  var alu0 = (bitcast<i32>((bitcast<u32>(gidx1)<<15u))+bitcast<i32>((bitcast<u32>(lidx0)<<12u)));
  var alu1 = (lidx1+bitcast<i32>((bitcast<u32>(gidx0)<<4u))+alu0);
  var val0 = data1_2097152[alu1];
  var alu2 = (alu1+3072);
  var val1 = data1_2097152[alu2];
  var alu3 = (((gidx0*-16)-lidx1)+alu0);
  var val2 = data1_2097152[(alu3+2047)];
  var val3 = data1_2097152[(alu3+3071)];
  data0_2097152[alu1] = val0;
  data0_2097152[(alu1+1024)] = val2;
  data0_2097152[(alu1+2048)] = val1;
  data0_2097152[alu2] = val3;
}`;

const E_128_64_8_16_2 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_2097152:array<i32>;
@group(0) @binding(2)var<storage,read_write>data1_2097152:array<i32>;
@compute @workgroup_size(8,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 64 */
  var gidx1 = i32(gindex.y); /* 128 */
  var lidx0 = i32(lindex.x); /* 8 */
  var lidx1 = i32(lindex.y); /* 16 */
  var alu0 = (lidx1+bitcast<i32>((bitcast<u32>(gidx0)<<4u))+bitcast<i32>((bitcast<u32>(gidx1)<<14u))+bitcast<i32>((bitcast<u32>(lidx0)<<11u)));
  var val0 = data1_2097152[alu0];
  var alu1 = (alu0+1024);
  var val1 = data1_2097152[alu1];
  var alu2 = (val0^-1);
  var alu3 = (val1^-1);
  var alu4 = select(alu2,alu3,(alu2<alu3));
  var alu5 = select(val0,val1,(val0<val1));
  data0_2097152[alu0] = alu5;
  data0_2097152[alu1] = (alu4^-1);
}`;

const E_32_128_8_16_2_2 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_2097152:array<i32>;
@group(0) @binding(2)var<storage,read_write>data1_2097152:array<i32>;
@compute @workgroup_size(8,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 128 */
  var gidx1 = i32(gindex.y); /* 32 */
  var lidx0 = i32(lindex.x); /* 8 */
  var lidx1 = i32(lindex.y); /* 16 */
  var alu0 = (bitcast<i32>((bitcast<u32>(gidx1)<<16u))+bitcast<i32>((bitcast<u32>(lidx0)<<13u)));
  var alu1 = (lidx1+bitcast<i32>((bitcast<u32>(gidx0)<<4u))+alu0);
  var val0 = data1_2097152[alu1];
  var alu2 = (alu1+6144);
  var val1 = data1_2097152[alu2];
  var alu3 = (((gidx0*-16)-lidx1)+alu0);
  var val2 = data1_2097152[(alu3+4095)];
  var val3 = data1_2097152[(alu3+6143)];
  data0_2097152[alu1] = val0;
  data0_2097152[(alu1+2048)] = val2;
  data0_2097152[(alu1+4096)] = val1;
  data0_2097152[alu2] = val3;
}`;

const E_64_128_8_16_2 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_2097152:array<i32>;
@group(0) @binding(2)var<storage,read_write>data1_2097152:array<i32>;
@compute @workgroup_size(8,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 128 */
  var gidx1 = i32(gindex.y); /* 64 */
  var lidx0 = i32(lindex.x); /* 8 */
  var lidx1 = i32(lindex.y); /* 16 */
  var alu0 = (lidx1+bitcast<i32>((bitcast<u32>(gidx0)<<4u))+bitcast<i32>((bitcast<u32>(gidx1)<<15u))+bitcast<i32>((bitcast<u32>(lidx0)<<12u)));
  var val0 = data1_2097152[alu0];
  var alu1 = (alu0+2048);
  var val1 = data1_2097152[alu1];
  var alu2 = (val0^-1);
  var alu3 = (val1^-1);
  var alu4 = select(alu2,alu3,(alu2<alu3));
  var alu5 = select(val0,val1,(val0<val1));
  data0_2097152[alu0] = alu5;
  data0_2097152[alu1] = (alu4^-1);
}`;

const E_16_256_8_16_2_2 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_2097152:array<i32>;
@group(0) @binding(2)var<storage,read_write>data1_2097152:array<i32>;
@compute @workgroup_size(8,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 256 */
  var gidx1 = i32(gindex.y); /* 16 */
  var lidx0 = i32(lindex.x); /* 8 */
  var lidx1 = i32(lindex.y); /* 16 */
  var alu0 = (bitcast<i32>((bitcast<u32>(gidx1)<<17u))+bitcast<i32>((bitcast<u32>(lidx0)<<14u)));
  var alu1 = (lidx1+bitcast<i32>((bitcast<u32>(gidx0)<<4u))+alu0);
  var val0 = data1_2097152[alu1];
  var alu2 = (alu1+12288);
  var val1 = data1_2097152[alu2];
  var alu3 = (((gidx0*-16)-lidx1)+alu0);
  var val2 = data1_2097152[(alu3+8191)];
  var val3 = data1_2097152[(alu3+12287)];
  data0_2097152[alu1] = val0;
  data0_2097152[(alu1+4096)] = val2;
  data0_2097152[(alu1+8192)] = val1;
  data0_2097152[alu2] = val3;
}`;

const E_32_256_8_16_2 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_2097152:array<i32>;
@group(0) @binding(2)var<storage,read_write>data1_2097152:array<i32>;
@compute @workgroup_size(8,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 256 */
  var gidx1 = i32(gindex.y); /* 32 */
  var lidx0 = i32(lindex.x); /* 8 */
  var lidx1 = i32(lindex.y); /* 16 */
  var alu0 = (lidx1+bitcast<i32>((bitcast<u32>(gidx0)<<4u))+bitcast<i32>((bitcast<u32>(gidx1)<<16u))+bitcast<i32>((bitcast<u32>(lidx0)<<13u)));
  var val0 = data1_2097152[alu0];
  var alu1 = (alu0+4096);
  var val1 = data1_2097152[alu1];
  var alu2 = (val0^-1);
  var alu3 = (val1^-1);
  var alu4 = select(alu2,alu3,(alu2<alu3));
  var alu5 = select(val0,val1,(val0<val1));
  data0_2097152[alu0] = alu5;
  data0_2097152[alu1] = (alu4^-1);
}`;

const E_8_512_8_16_2_2 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_2097152:array<i32>;
@group(0) @binding(2)var<storage,read_write>data1_2097152:array<i32>;
@compute @workgroup_size(8,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 512 */
  var gidx1 = i32(gindex.y); /* 8 */
  var lidx0 = i32(lindex.x); /* 8 */
  var lidx1 = i32(lindex.y); /* 16 */
  var alu0 = (bitcast<i32>((bitcast<u32>(gidx1)<<18u))+bitcast<i32>((bitcast<u32>(lidx0)<<15u)));
  var alu1 = (lidx1+bitcast<i32>((bitcast<u32>(gidx0)<<4u))+alu0);
  var val0 = data1_2097152[alu1];
  var alu2 = (alu1+24576);
  var val1 = data1_2097152[alu2];
  var alu3 = (((gidx0*-16)-lidx1)+alu0);
  var val2 = data1_2097152[(alu3+16383)];
  var val3 = data1_2097152[(alu3+24575)];
  data0_2097152[alu1] = val0;
  data0_2097152[(alu1+8192)] = val2;
  data0_2097152[(alu1+16384)] = val1;
  data0_2097152[alu2] = val3;
}`;

const E_16_512_8_16_2 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_2097152:array<i32>;
@group(0) @binding(2)var<storage,read_write>data1_2097152:array<i32>;
@compute @workgroup_size(8,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 512 */
  var gidx1 = i32(gindex.y); /* 16 */
  var lidx0 = i32(lindex.x); /* 8 */
  var lidx1 = i32(lindex.y); /* 16 */
  var alu0 = (lidx1+bitcast<i32>((bitcast<u32>(gidx0)<<4u))+bitcast<i32>((bitcast<u32>(gidx1)<<17u))+bitcast<i32>((bitcast<u32>(lidx0)<<14u)));
  var val0 = data1_2097152[alu0];
  var alu1 = (alu0+8192);
  var val1 = data1_2097152[alu1];
  var alu2 = (val0^-1);
  var alu3 = (val1^-1);
  var alu4 = select(alu2,alu3,(alu2<alu3));
  var alu5 = select(val0,val1,(val0<val1));
  data0_2097152[alu0] = alu5;
  data0_2097152[alu1] = (alu4^-1);
}`;

const E_4_1024_8_16_2_2 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_2097152:array<i32>;
@group(0) @binding(2)var<storage,read_write>data1_2097152:array<i32>;
@compute @workgroup_size(8,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 1024 */
  var gidx1 = i32(gindex.y); /* 4 */
  var lidx0 = i32(lindex.x); /* 8 */
  var lidx1 = i32(lindex.y); /* 16 */
  var alu0 = (bitcast<i32>((bitcast<u32>(gidx1)<<19u))+bitcast<i32>((bitcast<u32>(lidx0)<<16u)));
  var alu1 = (lidx1+bitcast<i32>((bitcast<u32>(gidx0)<<4u))+alu0);
  var val0 = data1_2097152[alu1];
  var alu2 = (alu1+49152);
  var val1 = data1_2097152[alu2];
  var alu3 = (((gidx0*-16)-lidx1)+alu0);
  var val2 = data1_2097152[(alu3+32767)];
  var val3 = data1_2097152[(alu3+49151)];
  data0_2097152[alu1] = val0;
  data0_2097152[(alu1+16384)] = val2;
  data0_2097152[(alu1+32768)] = val1;
  data0_2097152[alu2] = val3;
}`;

const E_8_1024_8_16_2 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_2097152:array<i32>;
@group(0) @binding(2)var<storage,read_write>data1_2097152:array<i32>;
@compute @workgroup_size(8,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 1024 */
  var gidx1 = i32(gindex.y); /* 8 */
  var lidx0 = i32(lindex.x); /* 8 */
  var lidx1 = i32(lindex.y); /* 16 */
  var alu0 = (lidx1+bitcast<i32>((bitcast<u32>(gidx0)<<4u))+bitcast<i32>((bitcast<u32>(gidx1)<<18u))+bitcast<i32>((bitcast<u32>(lidx0)<<15u)));
  var val0 = data1_2097152[alu0];
  var alu1 = (alu0+16384);
  var val1 = data1_2097152[alu1];
  var alu2 = (val0^-1);
  var alu3 = (val1^-1);
  var alu4 = select(alu2,alu3,(alu2<alu3));
  var alu5 = select(val0,val1,(val0<val1));
  data0_2097152[alu0] = alu5;
  data0_2097152[alu1] = (alu4^-1);
}`;

const E_4_2048_8_16_2 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_2097152:array<i32>;
@group(0) @binding(2)var<storage,read_write>data1_2097152:array<i32>;
@compute @workgroup_size(8,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 2048 */
  var gidx1 = i32(gindex.y); /* 4 */
  var lidx0 = i32(lindex.x); /* 8 */
  var lidx1 = i32(lindex.y); /* 16 */
  var alu0 = (bitcast<i32>((bitcast<u32>(gidx1)<<19u))+bitcast<i32>((bitcast<u32>(lidx0)<<16u)));
  var alu1 = (lidx1+bitcast<i32>((bitcast<u32>(gidx0)<<4u))+alu0);
  var val0 = data1_2097152[alu1];
  var val1 = data1_2097152[(((gidx0*-16)-lidx1)+alu0+65535)];
  var alu2 = (val0^-1);
  var alu3 = (val1^-1);
  var alu4 = select(alu2,alu3,(alu2<alu3));
  var alu5 = select(val0,val1,(val0<val1));
  data0_2097152[alu1] = alu5;
  data0_2097152[(alu1+32768)] = (alu4^-1);
}`;

const E_5_32_2 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_320:array<i32>;
@group(0) @binding(2)var<storage,read_write>data1_2097152:array<i32>;
@compute @workgroup_size(32,2) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 5 */
  var lidx0 = i32(lindex.x); /* 32 */
  var lidx1 = i32(lindex.y); /* 2 */
  var val0 = data1_2097152[(lidx1+bitcast<i32>((bitcast<u32>((gidx0&1))<<1u))+bitcast<i32>((bitcast<u32>(((gidx0>>1u)&1))<<2u))+bitcast<i32>((bitcast<u32>((gidx0>>2u))<<3u))+bitcast<i32>((bitcast<u32>(lidx0)<<16u)))];
  data0_320[(lidx1+bitcast<i32>((bitcast<u32>(gidx0)<<1u))+(lidx0*10))] = (val0&65535);
}`;

const setupNet = async (device, safetensor) => {
    const metadata = getTensorMetadata(safetensor);
    const infinityBuf = createInfinityUniformBuf(device);

    const layouts=[device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' } },{binding: 7, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' } },{binding: 7, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' } },{binding: 7, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' } },{binding: 7, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]})]

    const buf_0 = createEmptyBuf(device, 1179648);;
    const input0 = createEmptyBuf(device, 128);;
    const buf_1 = createWeightBuf(device, 79663104, getTensorBuffer(safetensor, metadata['token_embedding.weight']));
    const buf_2 = createEmptyBuf(device, 49152);;
    const buf_3 = createWeightBuf(device, 688128, getTensorBuffer(safetensor, metadata['positional_embedding']));
    const buf_4 = createEmptyBuf(device, 128);;
    const buf_5 = createEmptyBuf(device, 128);;
    const buf_6 = createEmptyBuf(device, 49152);;
    const buf_7 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.0.attn_ln.weight']));
    const buf_8 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.0.attn_ln.bias']));
    const buf_9 = createEmptyBuf(device, 49152);;
    const buf_10 = createWeightBuf(device, 589824, getTensorBuffer(safetensor, metadata['blocks.0.attn.key.weight']));
    const buf_11 = createEmptyBuf(device, 22020096);;
    const buf_12 = createWeightBuf(device, 22020096, getTensorBuffer(safetensor, metadata['blocks.0.attn.cache_k']));
    const buf_13 = createWeightBuf(device, 589824, getTensorBuffer(safetensor, metadata['blocks.0.attn.value.weight']));
    const buf_14 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.0.attn.value.bias']));
    const buf_15 = createWeightBuf(device, 22020096, getTensorBuffer(safetensor, metadata['blocks.0.attn.cache_v']));
    const buf_16 = createEmptyBuf(device, 73728000);;
    const buf_17 = createWeightBuf(device, 73728000, getTensorBuffer(safetensor, metadata['blocks.0.cross_attn.cache_k']));
    const input1 = createEmptyBuf(device, 2304000);;
    const buf_18 = createWeightBuf(device, 589824, getTensorBuffer(safetensor, metadata['blocks.0.cross_attn.key.weight']));
    const buf_19 = createEmptyBuf(device, 73728000);;
    const buf_20 = createWeightBuf(device, 73728000, getTensorBuffer(safetensor, metadata['blocks.0.cross_attn.cache_v']));
    const buf_21 = createWeightBuf(device, 589824, getTensorBuffer(safetensor, metadata['blocks.0.cross_attn.value.weight']));
    const buf_22 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.0.cross_attn.value.bias']));
    const buf_23 = createWeightBuf(device, 589824, getTensorBuffer(safetensor, metadata['blocks.0.attn.query.weight']));
    const buf_24 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.0.attn.query.bias']));
    const buf_25 = createEmptyBuf(device, 344064);;
    const buf_26 = createWeightBuf(device, 802816, getTensorBuffer(safetensor, metadata['mask']));
    const buf_27 = createEmptyBuf(device, 768);;
    const buf_28 = createEmptyBuf(device, 768);;
    const buf_29 = createWeightBuf(device, 589824, getTensorBuffer(safetensor, metadata['blocks.0.attn.out.weight']));
    const buf_30 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.0.attn.out.bias']));
    const buf_31 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.0.cross_attn_ln.weight']));
    const buf_32 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.0.cross_attn_ln.bias']));
    const buf_33 = createEmptyBuf(device, 49152);;
    const buf_34 = createWeightBuf(device, 589824, getTensorBuffer(safetensor, metadata['blocks.0.cross_attn.query.weight']));
    const buf_35 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.0.cross_attn.query.bias']));
    const buf_36 = createEmptyBuf(device, 1152000);;
    const buf_37 = createWeightBuf(device, 589824, getTensorBuffer(safetensor, metadata['blocks.0.cross_attn.out.weight']));
    const buf_38 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.0.cross_attn.out.bias']));
    const buf_39 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.0.mlp_ln.weight']));
    const buf_40 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.0.mlp_ln.bias']));
    const buf_41 = createEmptyBuf(device, 196608);;
    const buf_42 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.0.mlp.0.weight']));
    const buf_43 = createWeightBuf(device, 6144, getTensorBuffer(safetensor, metadata['blocks.0.mlp.0.bias']));
    const buf_44 = createEmptyBuf(device, 49152);;
    const buf_45 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.0.mlp.2.weight']));
    const buf_46 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.0.mlp.2.bias']));
    const buf_47 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.1.attn_ln.weight']));
    const buf_48 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.1.attn_ln.bias']));
    const buf_49 = createWeightBuf(device, 589824, getTensorBuffer(safetensor, metadata['blocks.1.attn.key.weight']));
    const buf_50 = createWeightBuf(device, 22020096, getTensorBuffer(safetensor, metadata['blocks.1.attn.cache_k']));
    const buf_51 = createWeightBuf(device, 589824, getTensorBuffer(safetensor, metadata['blocks.1.attn.value.weight']));
    const buf_52 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.1.attn.value.bias']));
    const buf_53 = createWeightBuf(device, 22020096, getTensorBuffer(safetensor, metadata['blocks.1.attn.cache_v']));
    const buf_54 = createWeightBuf(device, 73728000, getTensorBuffer(safetensor, metadata['blocks.1.cross_attn.cache_k']));
    const buf_55 = createWeightBuf(device, 589824, getTensorBuffer(safetensor, metadata['blocks.1.cross_attn.key.weight']));
    const buf_56 = createWeightBuf(device, 73728000, getTensorBuffer(safetensor, metadata['blocks.1.cross_attn.cache_v']));
    const buf_57 = createWeightBuf(device, 589824, getTensorBuffer(safetensor, metadata['blocks.1.cross_attn.value.weight']));
    const buf_58 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.1.cross_attn.value.bias']));
    const buf_59 = createWeightBuf(device, 589824, getTensorBuffer(safetensor, metadata['blocks.1.attn.query.weight']));
    const buf_60 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.1.attn.query.bias']));
    const buf_61 = createWeightBuf(device, 589824, getTensorBuffer(safetensor, metadata['blocks.1.attn.out.weight']));
    const buf_62 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.1.attn.out.bias']));
    const buf_63 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.1.cross_attn_ln.weight']));
    const buf_64 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.1.cross_attn_ln.bias']));
    const buf_65 = createWeightBuf(device, 589824, getTensorBuffer(safetensor, metadata['blocks.1.cross_attn.query.weight']));
    const buf_66 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.1.cross_attn.query.bias']));
    const buf_67 = createWeightBuf(device, 589824, getTensorBuffer(safetensor, metadata['blocks.1.cross_attn.out.weight']));
    const buf_68 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.1.cross_attn.out.bias']));
    const buf_69 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.1.mlp_ln.weight']));
    const buf_70 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.1.mlp_ln.bias']));
    const buf_71 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.1.mlp.0.weight']));
    const buf_72 = createWeightBuf(device, 6144, getTensorBuffer(safetensor, metadata['blocks.1.mlp.0.bias']));
    const buf_73 = createEmptyBuf(device, 49152);;
    const buf_74 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.1.mlp.2.weight']));
    const buf_75 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.1.mlp.2.bias']));
    const buf_76 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.2.attn_ln.weight']));
    const buf_77 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.2.attn_ln.bias']));
    const buf_78 = createWeightBuf(device, 589824, getTensorBuffer(safetensor, metadata['blocks.2.attn.key.weight']));
    const buf_79 = createWeightBuf(device, 22020096, getTensorBuffer(safetensor, metadata['blocks.2.attn.cache_k']));
    const buf_80 = createWeightBuf(device, 589824, getTensorBuffer(safetensor, metadata['blocks.2.attn.value.weight']));
    const buf_81 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.2.attn.value.bias']));
    const buf_82 = createWeightBuf(device, 22020096, getTensorBuffer(safetensor, metadata['blocks.2.attn.cache_v']));
    const buf_83 = createWeightBuf(device, 73728000, getTensorBuffer(safetensor, metadata['blocks.2.cross_attn.cache_k']));
    const buf_84 = createWeightBuf(device, 589824, getTensorBuffer(safetensor, metadata['blocks.2.cross_attn.key.weight']));
    const buf_85 = createWeightBuf(device, 73728000, getTensorBuffer(safetensor, metadata['blocks.2.cross_attn.cache_v']));
    const buf_86 = createWeightBuf(device, 589824, getTensorBuffer(safetensor, metadata['blocks.2.cross_attn.value.weight']));
    const buf_87 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.2.cross_attn.value.bias']));
    const buf_88 = createWeightBuf(device, 589824, getTensorBuffer(safetensor, metadata['blocks.2.attn.query.weight']));
    const buf_89 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.2.attn.query.bias']));
    const buf_90 = createWeightBuf(device, 589824, getTensorBuffer(safetensor, metadata['blocks.2.attn.out.weight']));
    const buf_91 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.2.attn.out.bias']));
    const buf_92 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.2.cross_attn_ln.weight']));
    const buf_93 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.2.cross_attn_ln.bias']));
    const buf_94 = createWeightBuf(device, 589824, getTensorBuffer(safetensor, metadata['blocks.2.cross_attn.query.weight']));
    const buf_95 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.2.cross_attn.query.bias']));
    const buf_96 = createWeightBuf(device, 589824, getTensorBuffer(safetensor, metadata['blocks.2.cross_attn.out.weight']));
    const buf_97 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.2.cross_attn.out.bias']));
    const buf_98 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.2.mlp_ln.weight']));
    const buf_99 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.2.mlp_ln.bias']));
    const buf_100 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.2.mlp.0.weight']));
    const buf_101 = createWeightBuf(device, 6144, getTensorBuffer(safetensor, metadata['blocks.2.mlp.0.bias']));
    const buf_102 = createEmptyBuf(device, 49152);;
    const buf_103 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.2.mlp.2.weight']));
    const buf_104 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.2.mlp.2.bias']));
    const buf_105 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.3.attn_ln.weight']));
    const buf_106 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.3.attn_ln.bias']));
    const buf_107 = createWeightBuf(device, 589824, getTensorBuffer(safetensor, metadata['blocks.3.attn.key.weight']));
    const buf_108 = createWeightBuf(device, 22020096, getTensorBuffer(safetensor, metadata['blocks.3.attn.cache_k']));
    const buf_109 = createWeightBuf(device, 589824, getTensorBuffer(safetensor, metadata['blocks.3.attn.value.weight']));
    const buf_110 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.3.attn.value.bias']));
    const buf_111 = createWeightBuf(device, 22020096, getTensorBuffer(safetensor, metadata['blocks.3.attn.cache_v']));
    const buf_112 = createWeightBuf(device, 73728000, getTensorBuffer(safetensor, metadata['blocks.3.cross_attn.cache_k']));
    const buf_113 = createWeightBuf(device, 589824, getTensorBuffer(safetensor, metadata['blocks.3.cross_attn.key.weight']));
    const buf_114 = createWeightBuf(device, 73728000, getTensorBuffer(safetensor, metadata['blocks.3.cross_attn.cache_v']));
    const buf_115 = createWeightBuf(device, 589824, getTensorBuffer(safetensor, metadata['blocks.3.cross_attn.value.weight']));
    const buf_116 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.3.cross_attn.value.bias']));
    const buf_117 = createWeightBuf(device, 589824, getTensorBuffer(safetensor, metadata['blocks.3.attn.query.weight']));
    const buf_118 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.3.attn.query.bias']));
    const buf_119 = createWeightBuf(device, 589824, getTensorBuffer(safetensor, metadata['blocks.3.attn.out.weight']));
    const buf_120 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.3.attn.out.bias']));
    const buf_121 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.3.cross_attn_ln.weight']));
    const buf_122 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.3.cross_attn_ln.bias']));
    const buf_123 = createWeightBuf(device, 589824, getTensorBuffer(safetensor, metadata['blocks.3.cross_attn.query.weight']));
    const buf_124 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.3.cross_attn.query.bias']));
    const buf_125 = createWeightBuf(device, 589824, getTensorBuffer(safetensor, metadata['blocks.3.cross_attn.out.weight']));
    const buf_126 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.3.cross_attn.out.bias']));
    const buf_127 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.3.mlp_ln.weight']));
    const buf_128 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.3.mlp_ln.bias']));
    const buf_129 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.3.mlp.0.weight']));
    const buf_130 = createWeightBuf(device, 6144, getTensorBuffer(safetensor, metadata['blocks.3.mlp.0.bias']));
    const buf_131 = createEmptyBuf(device, 49152);;
    const buf_132 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.3.mlp.2.weight']));
    const buf_133 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.3.mlp.2.bias']));
    const buf_134 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['ln.weight']));
    const buf_135 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['ln.bias']));
    const buf_136 = createEmptyBuf(device, 6638592);;
    const buf_137 = createEmptyBuf(device, 3072);;
    const buf_138 = createEmptyBuf(device, 8388608);;
    const buf_139 = createEmptyBuf(device, 8388608);;
    const output0 = createEmptyBuf(device, 1280);;
    const ctx = createUniformBuf(device, 4);;
    const off = createUniformBuf(device, 4);;
    const update_cache = createUniformBuf(device, 4);;

    const gpuWriteBuffer0 = device.createBuffer({size:input0.size, usage: GPUBufferUsage.COPY_SRC | GPUBufferUsage.MAP_WRITE });
    const gpuWriteBuffer1 = device.createBuffer({size:input1.size, usage: GPUBufferUsage.COPY_SRC | GPUBufferUsage.MAP_WRITE });
    const gpuWriteBuffer2 = device.createBuffer({size:ctx.size, usage: GPUBufferUsage.COPY_SRC | GPUBufferUsage.MAP_WRITE });
    const gpuWriteBuffer3 = device.createBuffer({size:off.size, usage: GPUBufferUsage.COPY_SRC | GPUBufferUsage.MAP_WRITE });
    const gpuWriteBuffer4 = device.createBuffer({size:update_cache.size, usage: GPUBufferUsage.COPY_SRC | GPUBufferUsage.MAP_WRITE });

    const gpuReadBuffer0 = device.createBuffer({size:output0.size, usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ });

    const kernels = [E_32_24_16_8_3, r_24_8_16_4_24, r_32_16_24, r_32_16_24n1, E_8_8_16_3_4, r_8_8_16_3_4_96_4, E_32_7_48_16_8_4n1, E_57344_32_3, r_32_16_24, r_32_16_24n1, E_8_8_16_3_4, r_8_8_16_3_4_96_4n1, E_32_7_48_16_8_4n1, E_57344_32_3, r_32_16_24, r_4_375_24_2_4_16_4_96_4n2, r_4_375_24_2_4_16_4_96_4n3, r_32_16_24n1, E_192000_32_3, E_192000_32_3, E_8_8_16_3_4, r_8_8_16_3_4_96_4n1, r_2_6_28ctx2B129_8_4_4_8, r_3_16_4_28ctx2B129, r_3_16_4_28ctx2B129n1, r_16_2_2_3_16_4_28ctx2B129, r_8_8_16_3_4_96_4n2, r_32_16_24, r_32_16_24n1, E_8_8_16_3_4, r_8_8_16_3_4_96_4n1, r_2_6_1500_8_4_4_8, r_6_32_375_4, r_6_32_375_4n1, r_16_2_2_3_16_4_375_4, r_8_8_16_3_4_96_4n2, r_32_16_24, r_32_16_24n1, E_8_8_16_3_4, r_32_8_16_3_4_96_4, r_8_8_16_3_4_384_4, r_32_16_24, r_32_16_24n1, E_8_8_16_3_4, r_8_8_16_3_4_96_4, E_32_7_48_16_8_4n1, E_57344_32_3, r_32_16_24, r_32_16_24n1, E_8_8_16_3_4, r_8_8_16_3_4_96_4n1, E_32_7_48_16_8_4n1, E_57344_32_3, r_32_16_24, r_4_375_24_2_4_16_4_96_4n2, r_4_375_24_2_4_16_4_96_4n3, r_32_16_24n1, E_192000_32_3, E_192000_32_3, E_8_8_16_3_4, r_8_8_16_3_4_96_4n1, r_2_6_28ctx2B129_8_4_4_8, r_3_16_4_28ctx2B129, r_3_16_4_28ctx2B129n1, r_16_2_2_3_16_4_28ctx2B129, r_8_8_16_3_4_96_4n2, r_32_16_24, r_32_16_24n1, E_8_8_16_3_4, r_8_8_16_3_4_96_4n1, r_2_6_1500_8_4_4_8, r_6_32_375_4, r_6_32_375_4n1, r_16_2_2_3_16_4_375_4, r_8_8_16_3_4_96_4n2, r_32_16_24, r_32_16_24n1, E_8_8_16_3_4, r_32_8_16_3_4_96_4, r_8_8_16_3_4_384_4, r_32_16_24, r_32_16_24n1, E_8_8_16_3_4, r_8_8_16_3_4_96_4, E_32_7_48_16_8_4n1, E_57344_32_3, r_32_16_24, r_32_16_24n1, E_8_8_16_3_4, r_8_8_16_3_4_96_4n1, E_32_7_48_16_8_4n1, E_57344_32_3, r_32_16_24, r_4_375_24_2_4_16_4_96_4n2, r_4_375_24_2_4_16_4_96_4n3, r_32_16_24n1, E_192000_32_3, E_192000_32_3, E_8_8_16_3_4, r_8_8_16_3_4_96_4n1, r_2_6_28ctx2B129_8_4_4_8, r_3_16_4_28ctx2B129, r_3_16_4_28ctx2B129n1, r_16_2_2_3_16_4_28ctx2B129, r_8_8_16_3_4_96_4n2, r_32_16_24, r_32_16_24n1, E_8_8_16_3_4, r_8_8_16_3_4_96_4n1, r_2_6_1500_8_4_4_8, r_6_32_375_4, r_6_32_375_4n1, r_16_2_2_3_16_4_375_4, r_8_8_16_3_4_96_4n2, r_32_16_24, r_32_16_24n1, E_8_8_16_3_4, r_32_8_16_3_4_96_4, r_8_8_16_3_4_384_4, r_32_16_24, r_32_16_24n1, E_8_8_16_3_4, r_8_8_16_3_4_96_4, E_32_7_48_16_8_4n1, E_57344_32_3, r_32_16_24, r_32_16_24n1, E_8_8_16_3_4, r_8_8_16_3_4_96_4n1, E_32_7_48_16_8_4n1, E_57344_32_3, r_32_16_24, r_4_375_24_2_4_16_4_96_4n2, r_4_375_24_2_4_16_4_96_4n3, r_32_16_24n1, E_192000_32_3, E_192000_32_3, E_8_8_16_3_4, r_8_8_16_3_4_96_4n1, r_2_6_28ctx2B129_8_4_4_8, r_3_16_4_28ctx2B129, r_3_16_4_28ctx2B129n1, r_16_2_2_3_16_4_28ctx2B129, r_8_8_16_3_4_96_4n2, r_32_16_24, r_32_16_24n1, E_8_8_16_3_4, r_8_8_16_3_4_96_4n1, r_2_6_1500_8_4_4_8, r_6_32_375_4, r_6_32_375_4n1, r_16_2_2_3_16_4_375_4, r_8_8_16_3_4_96_4n2, r_32_16_24, r_32_16_24n1, E_8_8_16_3_4, r_32_8_16_3_4_96_4, r_8_8_16_3_4_384_4, r_32_16_24, r_32_16_24n1, E_8_8_16_3_4, r_2161_8_8_3_4_96_4, r_6_32_4_2161, r_32_24, E_8_1024_4_16_2_2, E_32768_32_2, E_8192_32_2_2_2, E_16384_32_2_2, E_32768_32_2, E_4096_32_4_2_2, E_8192_32_4_2, E_16384_32_2_2, E_32768_32_2, E_4096_16_8_2_2, E_8192_16_8_2, E_8192_32_4_2, E_16384_32_2_2, E_32768_32_2, E_4096_8_16_2_2, E_8192_8_16_2, E_8192_16_8_2, E_8192_32_4_2, E_16384_32_2_2, E_32768_32_2, E_2048_2_8_16_2_2, E_4096_2_8_16_2, E_8192_8_16_2, E_8192_16_8_2, E_8192_32_4_2, E_16384_32_2_2, E_32768_32_2, E_1024_4_8_16_2_2, E_2048_4_8_16_2, E_4096_2_8_16_2, E_8192_8_16_2, E_8192_16_8_2, E_8192_32_4_2, E_16384_32_2_2, E_32768_32_2, E_512_8_8_16_2_2, E_1024_8_8_16_2, E_2048_4_8_16_2, E_4096_2_8_16_2, E_8192_8_16_2, E_8192_16_8_2, E_8192_32_4_2, E_16384_32_2_2, E_32768_32_2, E_256_16_8_16_2_2, E_512_16_8_16_2, E_1024_8_8_16_2, E_2048_4_8_16_2, E_4096_2_8_16_2, E_8192_8_16_2, E_8192_16_8_2, E_8192_32_4_2, E_16384_32_2_2, E_32768_32_2, E_128_32_8_16_2_2, E_256_32_8_16_2, E_512_16_8_16_2, E_1024_8_8_16_2, E_2048_4_8_16_2, E_4096_2_8_16_2, E_8192_8_16_2, E_8192_16_8_2, E_8192_32_4_2, E_16384_32_2_2, E_32768_32_2, E_64_64_8_16_2_2, E_128_64_8_16_2, E_256_32_8_16_2, E_512_16_8_16_2, E_1024_8_8_16_2, E_2048_4_8_16_2, E_4096_2_8_16_2, E_8192_8_16_2, E_8192_16_8_2, E_8192_32_4_2, E_16384_32_2_2, E_32768_32_2, E_32_128_8_16_2_2, E_64_128_8_16_2, E_128_64_8_16_2, E_256_32_8_16_2, E_512_16_8_16_2, E_1024_8_8_16_2, E_2048_4_8_16_2, E_4096_2_8_16_2, E_8192_8_16_2, E_8192_16_8_2, E_8192_32_4_2, E_16384_32_2_2, E_32768_32_2, E_16_256_8_16_2_2, E_32_256_8_16_2, E_64_128_8_16_2, E_128_64_8_16_2, E_256_32_8_16_2, E_512_16_8_16_2, E_1024_8_8_16_2, E_2048_4_8_16_2, E_4096_2_8_16_2, E_8192_8_16_2, E_8192_16_8_2, E_8192_32_4_2, E_16384_32_2_2, E_32768_32_2, E_8_512_8_16_2_2, E_16_512_8_16_2, E_32_256_8_16_2, E_64_128_8_16_2, E_128_64_8_16_2, E_256_32_8_16_2, E_512_16_8_16_2, E_1024_8_8_16_2, E_2048_4_8_16_2, E_4096_2_8_16_2, E_8192_8_16_2, E_8192_16_8_2, E_8192_32_4_2, E_16384_32_2_2, E_32768_32_2, E_4_1024_8_16_2_2, E_8_1024_8_16_2, E_16_512_8_16_2, E_32_256_8_16_2, E_64_128_8_16_2, E_128_64_8_16_2, E_256_32_8_16_2, E_512_16_8_16_2, E_1024_8_8_16_2, E_2048_4_8_16_2, E_4096_2_8_16_2, E_8192_8_16_2, E_8192_16_8_2, E_8192_32_4_2, E_16384_32_2_2, E_32768_32_2, E_4_2048_8_16_2, E_8_1024_8_16_2, E_16_512_8_16_2, E_32_256_8_16_2, E_64_128_8_16_2, E_128_64_8_16_2, E_256_32_8_16_2, E_512_16_8_16_2, E_1024_8_8_16_2, E_2048_4_8_16_2, E_4096_2_8_16_2, E_8192_8_16_2, E_8192_16_8_2, E_8192_32_4_2, E_16384_32_2_2, E_32768_32_2, E_5_32_2];
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

    return async (_input0,_input1,_ctx,_off,_update_cache) => {
        const commandEncoder = device.createCommandEncoder();
        await gpuWriteBuffer0.mapAsync(GPUMapMode.WRITE);
        new Int32Array(gpuWriteBuffer0.getMappedRange()).set(_input0);
        gpuWriteBuffer0.unmap();
        commandEncoder.copyBufferToBuffer(gpuWriteBuffer0, 0, input0, 0, gpuWriteBuffer0.size);
    await gpuWriteBuffer1.mapAsync(GPUMapMode.WRITE);
        new Float32Array(gpuWriteBuffer1.getMappedRange()).set(_input1);
        gpuWriteBuffer1.unmap();
        commandEncoder.copyBufferToBuffer(gpuWriteBuffer1, 0, input1, 0, gpuWriteBuffer1.size);
    await gpuWriteBuffer2.mapAsync(GPUMapMode.WRITE);
        new Int32Array(gpuWriteBuffer2.getMappedRange()).set(_ctx);
        gpuWriteBuffer2.unmap();
        commandEncoder.copyBufferToBuffer(gpuWriteBuffer2, 0, ctx, 0, gpuWriteBuffer2.size);
    await gpuWriteBuffer3.mapAsync(GPUMapMode.WRITE);
        new Int32Array(gpuWriteBuffer3.getMappedRange()).set(_off);
        gpuWriteBuffer3.unmap();
        commandEncoder.copyBufferToBuffer(gpuWriteBuffer3, 0, off, 0, gpuWriteBuffer3.size);
    await gpuWriteBuffer4.mapAsync(GPUMapMode.WRITE);
        new Int32Array(gpuWriteBuffer4.getMappedRange()).set(_update_cache);
        gpuWriteBuffer4.unmap();
        commandEncoder.copyBufferToBuffer(gpuWriteBuffer4, 0, update_cache, 0, gpuWriteBuffer4.size);
        addComputePass(device, commandEncoder, pipelines[0], layouts[0], infinityBuf, [buf_0, input0, buf_1], [24, 32, 1]);
        addComputePass(device, commandEncoder, pipelines[1], layouts[1], infinityBuf, [buf_2, buf_0, buf_3, ctx], [24, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[2], layouts[2], infinityBuf, [buf_4, buf_2], [32, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[3], layouts[3], infinityBuf, [buf_5, buf_2, buf_4], [32, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[4], layouts[4], infinityBuf, [buf_6, buf_2, buf_4, buf_5, buf_7, buf_8], [8, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[5], layouts[5], infinityBuf, [buf_9, buf_6, buf_10], [8, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[6], layouts[6], infinityBuf, [buf_11, buf_12, buf_9, ctx], [48, 7, 32]);
        addComputePass(device, commandEncoder, pipelines[7], layouts[7], infinityBuf, [buf_12, buf_11], [57344, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[8], layouts[8], infinityBuf, [buf_5, buf_2], [32, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[9], layouts[9], infinityBuf, [buf_4, buf_2, buf_5], [32, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[10], layouts[10], infinityBuf, [buf_9, buf_2, buf_5, buf_4, buf_7, buf_8], [8, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[11], layouts[11], infinityBuf, [buf_6, buf_9, buf_13, buf_14], [8, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[12], layouts[12], infinityBuf, [buf_11, buf_15, buf_6, ctx], [48, 7, 32]);
        addComputePass(device, commandEncoder, pipelines[13], layouts[13], infinityBuf, [buf_15, buf_11], [57344, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[14], layouts[14], infinityBuf, [buf_4, buf_2], [32, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[15], layouts[15], infinityBuf, [buf_16, buf_17, input1, buf_18, off, update_cache], [24, 375, 4]);
        addComputePass(device, commandEncoder, pipelines[16], layouts[16], infinityBuf, [buf_19, buf_20, input1, buf_21, buf_22, off, update_cache], [24, 375, 4]);
        addComputePass(device, commandEncoder, pipelines[17], layouts[17], infinityBuf, [buf_5, buf_2, buf_4], [32, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[18], layouts[18], infinityBuf, [buf_17, buf_16], [48000, 4, 1]);
        addComputePass(device, commandEncoder, pipelines[19], layouts[19], infinityBuf, [buf_20, buf_19], [48000, 4, 1]);
        addComputePass(device, commandEncoder, pipelines[20], layouts[20], infinityBuf, [buf_6, buf_2, buf_4, buf_5, buf_7, buf_8], [8, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[21], layouts[21], infinityBuf, [buf_9, buf_6, buf_23, buf_24], [8, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[22], layouts[22], infinityBuf, [buf_25, buf_9, buf_12, buf_26, ctx], [_ctx[0] + 1, 6, 2]);
        addComputePass(device, commandEncoder, pipelines[23], layouts[23], infinityBuf, [buf_27, buf_25, ctx], [3, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[24], layouts[24], infinityBuf, [buf_28, buf_25, buf_27, ctx], [3, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[25], layouts[25], infinityBuf, [buf_9, buf_25, buf_27, buf_28, buf_15, ctx], [2, 16, 1]);
        addComputePass(device, commandEncoder, pipelines[26], layouts[26], infinityBuf, [buf_6, buf_2, buf_9, buf_29, buf_30], [8, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[27], layouts[27], infinityBuf, [buf_5, buf_6], [32, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[28], layouts[28], infinityBuf, [buf_4, buf_6, buf_5], [32, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[29], layouts[29], infinityBuf, [buf_9, buf_6, buf_5, buf_4, buf_31, buf_32], [8, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[30], layouts[30], infinityBuf, [buf_33, buf_9, buf_34, buf_35], [8, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[31], layouts[31], infinityBuf, [buf_36, buf_33, buf_17], [1500, 6, 2]);
        addComputePass(device, commandEncoder, pipelines[32], layouts[32], infinityBuf, [buf_28, buf_36], [6, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[33], layouts[33], infinityBuf, [buf_27, buf_36, buf_28], [6, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[34], layouts[34], infinityBuf, [buf_33, buf_36, buf_28, buf_27, buf_20], [2, 16, 1]);
        addComputePass(device, commandEncoder, pipelines[35], layouts[35], infinityBuf, [buf_9, buf_6, buf_33, buf_37, buf_38], [8, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[36], layouts[36], infinityBuf, [buf_4, buf_9], [32, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[37], layouts[37], infinityBuf, [buf_5, buf_9, buf_4], [32, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[38], layouts[38], infinityBuf, [buf_33, buf_9, buf_4, buf_5, buf_39, buf_40], [8, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[39], layouts[39], infinityBuf, [buf_41, buf_33, buf_42, buf_43], [32, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[40], layouts[40], infinityBuf, [buf_44, buf_9, buf_41, buf_45, buf_46], [8, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[41], layouts[41], infinityBuf, [buf_5, buf_44], [32, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[42], layouts[42], infinityBuf, [buf_4, buf_44, buf_5], [32, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[43], layouts[43], infinityBuf, [buf_9, buf_44, buf_5, buf_4, buf_47, buf_48], [8, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[44], layouts[44], infinityBuf, [buf_33, buf_9, buf_49], [8, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[45], layouts[45], infinityBuf, [buf_11, buf_50, buf_33, ctx], [48, 7, 32]);
        addComputePass(device, commandEncoder, pipelines[46], layouts[46], infinityBuf, [buf_50, buf_11], [57344, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[47], layouts[47], infinityBuf, [buf_4, buf_44], [32, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[48], layouts[48], infinityBuf, [buf_5, buf_44, buf_4], [32, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[49], layouts[49], infinityBuf, [buf_33, buf_44, buf_4, buf_5, buf_47, buf_48], [8, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[50], layouts[50], infinityBuf, [buf_9, buf_33, buf_51, buf_52], [8, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[51], layouts[51], infinityBuf, [buf_11, buf_53, buf_9, ctx], [48, 7, 32]);
        addComputePass(device, commandEncoder, pipelines[52], layouts[52], infinityBuf, [buf_53, buf_11], [57344, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[53], layouts[53], infinityBuf, [buf_5, buf_44], [32, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[54], layouts[54], infinityBuf, [buf_19, buf_54, input1, buf_55, off, update_cache], [24, 375, 4]);
        addComputePass(device, commandEncoder, pipelines[55], layouts[55], infinityBuf, [buf_16, buf_56, input1, buf_57, buf_58, off, update_cache], [24, 375, 4]);
        addComputePass(device, commandEncoder, pipelines[56], layouts[56], infinityBuf, [buf_4, buf_44, buf_5], [32, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[57], layouts[57], infinityBuf, [buf_54, buf_19], [48000, 4, 1]);
        addComputePass(device, commandEncoder, pipelines[58], layouts[58], infinityBuf, [buf_56, buf_16], [48000, 4, 1]);
        addComputePass(device, commandEncoder, pipelines[59], layouts[59], infinityBuf, [buf_9, buf_44, buf_5, buf_4, buf_47, buf_48], [8, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[60], layouts[60], infinityBuf, [buf_33, buf_9, buf_59, buf_60], [8, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[61], layouts[61], infinityBuf, [buf_25, buf_33, buf_50, buf_26, ctx], [_ctx[0] + 1, 6, 2]);
        addComputePass(device, commandEncoder, pipelines[62], layouts[62], infinityBuf, [buf_27, buf_25, ctx], [3, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[63], layouts[63], infinityBuf, [buf_28, buf_25, buf_27, ctx], [3, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[64], layouts[64], infinityBuf, [buf_33, buf_25, buf_27, buf_28, buf_53, ctx], [2, 16, 1]);
        addComputePass(device, commandEncoder, pipelines[65], layouts[65], infinityBuf, [buf_9, buf_44, buf_33, buf_61, buf_62], [8, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[66], layouts[66], infinityBuf, [buf_4, buf_9], [32, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[67], layouts[67], infinityBuf, [buf_5, buf_9, buf_4], [32, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[68], layouts[68], infinityBuf, [buf_33, buf_9, buf_4, buf_5, buf_63, buf_64], [8, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[69], layouts[69], infinityBuf, [buf_6, buf_33, buf_65, buf_66], [8, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[70], layouts[70], infinityBuf, [buf_36, buf_6, buf_54], [1500, 6, 2]);
        addComputePass(device, commandEncoder, pipelines[71], layouts[71], infinityBuf, [buf_28, buf_36], [6, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[72], layouts[72], infinityBuf, [buf_27, buf_36, buf_28], [6, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[73], layouts[73], infinityBuf, [buf_6, buf_36, buf_28, buf_27, buf_56], [2, 16, 1]);
        addComputePass(device, commandEncoder, pipelines[74], layouts[74], infinityBuf, [buf_33, buf_9, buf_6, buf_67, buf_68], [8, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[75], layouts[75], infinityBuf, [buf_5, buf_33], [32, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[76], layouts[76], infinityBuf, [buf_4, buf_33, buf_5], [32, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[77], layouts[77], infinityBuf, [buf_6, buf_33, buf_5, buf_4, buf_69, buf_70], [8, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[78], layouts[78], infinityBuf, [buf_41, buf_6, buf_71, buf_72], [32, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[79], layouts[79], infinityBuf, [buf_73, buf_33, buf_41, buf_74, buf_75], [8, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[80], layouts[80], infinityBuf, [buf_4, buf_73], [32, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[81], layouts[81], infinityBuf, [buf_5, buf_73, buf_4], [32, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[82], layouts[82], infinityBuf, [buf_33, buf_73, buf_4, buf_5, buf_76, buf_77], [8, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[83], layouts[83], infinityBuf, [buf_6, buf_33, buf_78], [8, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[84], layouts[84], infinityBuf, [buf_11, buf_79, buf_6, ctx], [48, 7, 32]);
        addComputePass(device, commandEncoder, pipelines[85], layouts[85], infinityBuf, [buf_79, buf_11], [57344, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[86], layouts[86], infinityBuf, [buf_5, buf_73], [32, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[87], layouts[87], infinityBuf, [buf_4, buf_73, buf_5], [32, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[88], layouts[88], infinityBuf, [buf_6, buf_73, buf_5, buf_4, buf_76, buf_77], [8, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[89], layouts[89], infinityBuf, [buf_33, buf_6, buf_80, buf_81], [8, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[90], layouts[90], infinityBuf, [buf_11, buf_82, buf_33, ctx], [48, 7, 32]);
        addComputePass(device, commandEncoder, pipelines[91], layouts[91], infinityBuf, [buf_82, buf_11], [57344, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[92], layouts[92], infinityBuf, [buf_4, buf_73], [32, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[93], layouts[93], infinityBuf, [buf_16, buf_83, input1, buf_84, off, update_cache], [24, 375, 4]);
        addComputePass(device, commandEncoder, pipelines[94], layouts[94], infinityBuf, [buf_19, buf_85, input1, buf_86, buf_87, off, update_cache], [24, 375, 4]);
        addComputePass(device, commandEncoder, pipelines[95], layouts[95], infinityBuf, [buf_5, buf_73, buf_4], [32, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[96], layouts[96], infinityBuf, [buf_83, buf_16], [48000, 4, 1]);
        addComputePass(device, commandEncoder, pipelines[97], layouts[97], infinityBuf, [buf_85, buf_19], [48000, 4, 1]);
        addComputePass(device, commandEncoder, pipelines[98], layouts[98], infinityBuf, [buf_33, buf_73, buf_4, buf_5, buf_76, buf_77], [8, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[99], layouts[99], infinityBuf, [buf_6, buf_33, buf_88, buf_89], [8, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[100], layouts[100], infinityBuf, [buf_25, buf_6, buf_79, buf_26, ctx], [_ctx[0] + 1, 6, 2]);
        addComputePass(device, commandEncoder, pipelines[101], layouts[101], infinityBuf, [buf_27, buf_25, ctx], [3, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[102], layouts[102], infinityBuf, [buf_28, buf_25, buf_27, ctx], [3, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[103], layouts[103], infinityBuf, [buf_6, buf_25, buf_27, buf_28, buf_82, ctx], [2, 16, 1]);
        addComputePass(device, commandEncoder, pipelines[104], layouts[104], infinityBuf, [buf_33, buf_73, buf_6, buf_90, buf_91], [8, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[105], layouts[105], infinityBuf, [buf_5, buf_33], [32, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[106], layouts[106], infinityBuf, [buf_4, buf_33, buf_5], [32, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[107], layouts[107], infinityBuf, [buf_6, buf_33, buf_5, buf_4, buf_92, buf_93], [8, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[108], layouts[108], infinityBuf, [buf_9, buf_6, buf_94, buf_95], [8, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[109], layouts[109], infinityBuf, [buf_36, buf_9, buf_83], [1500, 6, 2]);
        addComputePass(device, commandEncoder, pipelines[110], layouts[110], infinityBuf, [buf_28, buf_36], [6, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[111], layouts[111], infinityBuf, [buf_27, buf_36, buf_28], [6, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[112], layouts[112], infinityBuf, [buf_9, buf_36, buf_28, buf_27, buf_85], [2, 16, 1]);
        addComputePass(device, commandEncoder, pipelines[113], layouts[113], infinityBuf, [buf_6, buf_33, buf_9, buf_96, buf_97], [8, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[114], layouts[114], infinityBuf, [buf_4, buf_6], [32, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[115], layouts[115], infinityBuf, [buf_5, buf_6, buf_4], [32, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[116], layouts[116], infinityBuf, [buf_9, buf_6, buf_4, buf_5, buf_98, buf_99], [8, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[117], layouts[117], infinityBuf, [buf_41, buf_9, buf_100, buf_101], [32, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[118], layouts[118], infinityBuf, [buf_102, buf_6, buf_41, buf_103, buf_104], [8, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[119], layouts[119], infinityBuf, [buf_5, buf_102], [32, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[120], layouts[120], infinityBuf, [buf_4, buf_102, buf_5], [32, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[121], layouts[121], infinityBuf, [buf_6, buf_102, buf_5, buf_4, buf_105, buf_106], [8, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[122], layouts[122], infinityBuf, [buf_9, buf_6, buf_107], [8, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[123], layouts[123], infinityBuf, [buf_11, buf_108, buf_9, ctx], [48, 7, 32]);
        addComputePass(device, commandEncoder, pipelines[124], layouts[124], infinityBuf, [buf_108, buf_11], [57344, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[125], layouts[125], infinityBuf, [buf_4, buf_102], [32, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[126], layouts[126], infinityBuf, [buf_5, buf_102, buf_4], [32, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[127], layouts[127], infinityBuf, [buf_9, buf_102, buf_4, buf_5, buf_105, buf_106], [8, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[128], layouts[128], infinityBuf, [buf_6, buf_9, buf_109, buf_110], [8, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[129], layouts[129], infinityBuf, [buf_11, buf_111, buf_6, ctx], [48, 7, 32]);
        addComputePass(device, commandEncoder, pipelines[130], layouts[130], infinityBuf, [buf_111, buf_11], [57344, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[131], layouts[131], infinityBuf, [buf_5, buf_102], [32, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[132], layouts[132], infinityBuf, [buf_19, buf_112, input1, buf_113, off, update_cache], [24, 375, 4]);
        addComputePass(device, commandEncoder, pipelines[133], layouts[133], infinityBuf, [buf_16, buf_114, input1, buf_115, buf_116, off, update_cache], [24, 375, 4]);
        addComputePass(device, commandEncoder, pipelines[134], layouts[134], infinityBuf, [buf_4, buf_102, buf_5], [32, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[135], layouts[135], infinityBuf, [buf_112, buf_19], [48000, 4, 1]);
        addComputePass(device, commandEncoder, pipelines[136], layouts[136], infinityBuf, [buf_114, buf_16], [48000, 4, 1]);
        addComputePass(device, commandEncoder, pipelines[137], layouts[137], infinityBuf, [buf_6, buf_102, buf_5, buf_4, buf_105, buf_106], [8, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[138], layouts[138], infinityBuf, [buf_9, buf_6, buf_117, buf_118], [8, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[139], layouts[139], infinityBuf, [buf_25, buf_9, buf_108, buf_26, ctx], [_ctx[0] + 1, 6, 2]);
        addComputePass(device, commandEncoder, pipelines[140], layouts[140], infinityBuf, [buf_27, buf_25, ctx], [3, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[141], layouts[141], infinityBuf, [buf_28, buf_25, buf_27, ctx], [3, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[142], layouts[142], infinityBuf, [buf_9, buf_25, buf_27, buf_28, buf_111, ctx], [2, 16, 1]);
        addComputePass(device, commandEncoder, pipelines[143], layouts[143], infinityBuf, [buf_6, buf_102, buf_9, buf_119, buf_120], [8, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[144], layouts[144], infinityBuf, [buf_4, buf_6], [32, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[145], layouts[145], infinityBuf, [buf_5, buf_6, buf_4], [32, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[146], layouts[146], infinityBuf, [buf_9, buf_6, buf_4, buf_5, buf_121, buf_122], [8, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[147], layouts[147], infinityBuf, [buf_33, buf_9, buf_123, buf_124], [8, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[148], layouts[148], infinityBuf, [buf_36, buf_33, buf_112], [1500, 6, 2]);
        addComputePass(device, commandEncoder, pipelines[149], layouts[149], infinityBuf, [buf_28, buf_36], [6, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[150], layouts[150], infinityBuf, [buf_27, buf_36, buf_28], [6, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[151], layouts[151], infinityBuf, [buf_33, buf_36, buf_28, buf_27, buf_114], [2, 16, 1]);
        addComputePass(device, commandEncoder, pipelines[152], layouts[152], infinityBuf, [buf_9, buf_6, buf_33, buf_125, buf_126], [8, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[153], layouts[153], infinityBuf, [buf_5, buf_9], [32, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[154], layouts[154], infinityBuf, [buf_4, buf_9, buf_5], [32, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[155], layouts[155], infinityBuf, [buf_33, buf_9, buf_5, buf_4, buf_127, buf_128], [8, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[156], layouts[156], infinityBuf, [buf_41, buf_33, buf_129, buf_130], [32, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[157], layouts[157], infinityBuf, [buf_131, buf_9, buf_41, buf_132, buf_133], [8, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[158], layouts[158], infinityBuf, [buf_4, buf_131], [32, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[159], layouts[159], infinityBuf, [buf_5, buf_131, buf_4], [32, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[160], layouts[160], infinityBuf, [buf_9, buf_131, buf_4, buf_5, buf_134, buf_135], [8, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[161], layouts[161], infinityBuf, [buf_136, buf_9, buf_1], [2161, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[162], layouts[162], infinityBuf, [buf_137, buf_136], [6, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[163], layouts[163], infinityBuf, [buf_5, buf_137], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[164], layouts[164], infinityBuf, [buf_138, buf_136, buf_5], [1024, 8, 1]);
        addComputePass(device, commandEncoder, pipelines[165], layouts[165], infinityBuf, [buf_139, buf_138], [32768, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[166], layouts[166], infinityBuf, [buf_138, buf_139], [8192, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[167], layouts[167], infinityBuf, [buf_139, buf_138], [16384, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[168], layouts[168], infinityBuf, [buf_138, buf_139], [32768, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[169], layouts[169], infinityBuf, [buf_139, buf_138], [4096, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[170], layouts[170], infinityBuf, [buf_138, buf_139], [8192, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[171], layouts[171], infinityBuf, [buf_139, buf_138], [16384, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[172], layouts[172], infinityBuf, [buf_138, buf_139], [32768, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[173], layouts[173], infinityBuf, [buf_139, buf_138], [4096, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[174], layouts[174], infinityBuf, [buf_138, buf_139], [8192, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[175], layouts[175], infinityBuf, [buf_139, buf_138], [8192, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[176], layouts[176], infinityBuf, [buf_138, buf_139], [16384, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[177], layouts[177], infinityBuf, [buf_139, buf_138], [32768, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[178], layouts[178], infinityBuf, [buf_138, buf_139], [4096, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[179], layouts[179], infinityBuf, [buf_139, buf_138], [8192, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[180], layouts[180], infinityBuf, [buf_138, buf_139], [8192, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[181], layouts[181], infinityBuf, [buf_139, buf_138], [8192, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[182], layouts[182], infinityBuf, [buf_138, buf_139], [16384, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[183], layouts[183], infinityBuf, [buf_139, buf_138], [32768, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[184], layouts[184], infinityBuf, [buf_138, buf_139], [2, 2048, 1]);
        addComputePass(device, commandEncoder, pipelines[185], layouts[185], infinityBuf, [buf_139, buf_138], [2, 4096, 1]);
        addComputePass(device, commandEncoder, pipelines[186], layouts[186], infinityBuf, [buf_138, buf_139], [8192, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[187], layouts[187], infinityBuf, [buf_139, buf_138], [8192, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[188], layouts[188], infinityBuf, [buf_138, buf_139], [8192, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[189], layouts[189], infinityBuf, [buf_139, buf_138], [16384, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[190], layouts[190], infinityBuf, [buf_138, buf_139], [32768, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[191], layouts[191], infinityBuf, [buf_139, buf_138], [4, 1024, 1]);
        addComputePass(device, commandEncoder, pipelines[192], layouts[192], infinityBuf, [buf_138, buf_139], [4, 2048, 1]);
        addComputePass(device, commandEncoder, pipelines[193], layouts[193], infinityBuf, [buf_139, buf_138], [2, 4096, 1]);
        addComputePass(device, commandEncoder, pipelines[194], layouts[194], infinityBuf, [buf_138, buf_139], [8192, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[195], layouts[195], infinityBuf, [buf_139, buf_138], [8192, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[196], layouts[196], infinityBuf, [buf_138, buf_139], [8192, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[197], layouts[197], infinityBuf, [buf_139, buf_138], [16384, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[198], layouts[198], infinityBuf, [buf_138, buf_139], [32768, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[199], layouts[199], infinityBuf, [buf_139, buf_138], [8, 512, 1]);
        addComputePass(device, commandEncoder, pipelines[200], layouts[200], infinityBuf, [buf_138, buf_139], [8, 1024, 1]);
        addComputePass(device, commandEncoder, pipelines[201], layouts[201], infinityBuf, [buf_139, buf_138], [4, 2048, 1]);
        addComputePass(device, commandEncoder, pipelines[202], layouts[202], infinityBuf, [buf_138, buf_139], [2, 4096, 1]);
        addComputePass(device, commandEncoder, pipelines[203], layouts[203], infinityBuf, [buf_139, buf_138], [8192, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[204], layouts[204], infinityBuf, [buf_138, buf_139], [8192, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[205], layouts[205], infinityBuf, [buf_139, buf_138], [8192, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[206], layouts[206], infinityBuf, [buf_138, buf_139], [16384, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[207], layouts[207], infinityBuf, [buf_139, buf_138], [32768, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[208], layouts[208], infinityBuf, [buf_138, buf_139], [16, 256, 1]);
        addComputePass(device, commandEncoder, pipelines[209], layouts[209], infinityBuf, [buf_139, buf_138], [16, 512, 1]);
        addComputePass(device, commandEncoder, pipelines[210], layouts[210], infinityBuf, [buf_138, buf_139], [8, 1024, 1]);
        addComputePass(device, commandEncoder, pipelines[211], layouts[211], infinityBuf, [buf_139, buf_138], [4, 2048, 1]);
        addComputePass(device, commandEncoder, pipelines[212], layouts[212], infinityBuf, [buf_138, buf_139], [2, 4096, 1]);
        addComputePass(device, commandEncoder, pipelines[213], layouts[213], infinityBuf, [buf_139, buf_138], [8192, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[214], layouts[214], infinityBuf, [buf_138, buf_139], [8192, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[215], layouts[215], infinityBuf, [buf_139, buf_138], [8192, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[216], layouts[216], infinityBuf, [buf_138, buf_139], [16384, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[217], layouts[217], infinityBuf, [buf_139, buf_138], [32768, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[218], layouts[218], infinityBuf, [buf_138, buf_139], [32, 128, 1]);
        addComputePass(device, commandEncoder, pipelines[219], layouts[219], infinityBuf, [buf_139, buf_138], [32, 256, 1]);
        addComputePass(device, commandEncoder, pipelines[220], layouts[220], infinityBuf, [buf_138, buf_139], [16, 512, 1]);
        addComputePass(device, commandEncoder, pipelines[221], layouts[221], infinityBuf, [buf_139, buf_138], [8, 1024, 1]);
        addComputePass(device, commandEncoder, pipelines[222], layouts[222], infinityBuf, [buf_138, buf_139], [4, 2048, 1]);
        addComputePass(device, commandEncoder, pipelines[223], layouts[223], infinityBuf, [buf_139, buf_138], [2, 4096, 1]);
        addComputePass(device, commandEncoder, pipelines[224], layouts[224], infinityBuf, [buf_138, buf_139], [8192, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[225], layouts[225], infinityBuf, [buf_139, buf_138], [8192, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[226], layouts[226], infinityBuf, [buf_138, buf_139], [8192, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[227], layouts[227], infinityBuf, [buf_139, buf_138], [16384, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[228], layouts[228], infinityBuf, [buf_138, buf_139], [32768, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[229], layouts[229], infinityBuf, [buf_139, buf_138], [64, 64, 1]);
        addComputePass(device, commandEncoder, pipelines[230], layouts[230], infinityBuf, [buf_138, buf_139], [64, 128, 1]);
        addComputePass(device, commandEncoder, pipelines[231], layouts[231], infinityBuf, [buf_139, buf_138], [32, 256, 1]);
        addComputePass(device, commandEncoder, pipelines[232], layouts[232], infinityBuf, [buf_138, buf_139], [16, 512, 1]);
        addComputePass(device, commandEncoder, pipelines[233], layouts[233], infinityBuf, [buf_139, buf_138], [8, 1024, 1]);
        addComputePass(device, commandEncoder, pipelines[234], layouts[234], infinityBuf, [buf_138, buf_139], [4, 2048, 1]);
        addComputePass(device, commandEncoder, pipelines[235], layouts[235], infinityBuf, [buf_139, buf_138], [2, 4096, 1]);
        addComputePass(device, commandEncoder, pipelines[236], layouts[236], infinityBuf, [buf_138, buf_139], [8192, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[237], layouts[237], infinityBuf, [buf_139, buf_138], [8192, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[238], layouts[238], infinityBuf, [buf_138, buf_139], [8192, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[239], layouts[239], infinityBuf, [buf_139, buf_138], [16384, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[240], layouts[240], infinityBuf, [buf_138, buf_139], [32768, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[241], layouts[241], infinityBuf, [buf_139, buf_138], [128, 32, 1]);
        addComputePass(device, commandEncoder, pipelines[242], layouts[242], infinityBuf, [buf_138, buf_139], [128, 64, 1]);
        addComputePass(device, commandEncoder, pipelines[243], layouts[243], infinityBuf, [buf_139, buf_138], [64, 128, 1]);
        addComputePass(device, commandEncoder, pipelines[244], layouts[244], infinityBuf, [buf_138, buf_139], [32, 256, 1]);
        addComputePass(device, commandEncoder, pipelines[245], layouts[245], infinityBuf, [buf_139, buf_138], [16, 512, 1]);
        addComputePass(device, commandEncoder, pipelines[246], layouts[246], infinityBuf, [buf_138, buf_139], [8, 1024, 1]);
        addComputePass(device, commandEncoder, pipelines[247], layouts[247], infinityBuf, [buf_139, buf_138], [4, 2048, 1]);
        addComputePass(device, commandEncoder, pipelines[248], layouts[248], infinityBuf, [buf_138, buf_139], [2, 4096, 1]);
        addComputePass(device, commandEncoder, pipelines[249], layouts[249], infinityBuf, [buf_139, buf_138], [8192, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[250], layouts[250], infinityBuf, [buf_138, buf_139], [8192, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[251], layouts[251], infinityBuf, [buf_139, buf_138], [8192, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[252], layouts[252], infinityBuf, [buf_138, buf_139], [16384, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[253], layouts[253], infinityBuf, [buf_139, buf_138], [32768, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[254], layouts[254], infinityBuf, [buf_138, buf_139], [256, 16, 1]);
        addComputePass(device, commandEncoder, pipelines[255], layouts[255], infinityBuf, [buf_139, buf_138], [256, 32, 1]);
        addComputePass(device, commandEncoder, pipelines[256], layouts[256], infinityBuf, [buf_138, buf_139], [128, 64, 1]);
        addComputePass(device, commandEncoder, pipelines[257], layouts[257], infinityBuf, [buf_139, buf_138], [64, 128, 1]);
        addComputePass(device, commandEncoder, pipelines[258], layouts[258], infinityBuf, [buf_138, buf_139], [32, 256, 1]);
        addComputePass(device, commandEncoder, pipelines[259], layouts[259], infinityBuf, [buf_139, buf_138], [16, 512, 1]);
        addComputePass(device, commandEncoder, pipelines[260], layouts[260], infinityBuf, [buf_138, buf_139], [8, 1024, 1]);
        addComputePass(device, commandEncoder, pipelines[261], layouts[261], infinityBuf, [buf_139, buf_138], [4, 2048, 1]);
        addComputePass(device, commandEncoder, pipelines[262], layouts[262], infinityBuf, [buf_138, buf_139], [2, 4096, 1]);
        addComputePass(device, commandEncoder, pipelines[263], layouts[263], infinityBuf, [buf_139, buf_138], [8192, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[264], layouts[264], infinityBuf, [buf_138, buf_139], [8192, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[265], layouts[265], infinityBuf, [buf_139, buf_138], [8192, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[266], layouts[266], infinityBuf, [buf_138, buf_139], [16384, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[267], layouts[267], infinityBuf, [buf_139, buf_138], [32768, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[268], layouts[268], infinityBuf, [buf_138, buf_139], [512, 8, 1]);
        addComputePass(device, commandEncoder, pipelines[269], layouts[269], infinityBuf, [buf_139, buf_138], [512, 16, 1]);
        addComputePass(device, commandEncoder, pipelines[270], layouts[270], infinityBuf, [buf_138, buf_139], [256, 32, 1]);
        addComputePass(device, commandEncoder, pipelines[271], layouts[271], infinityBuf, [buf_139, buf_138], [128, 64, 1]);
        addComputePass(device, commandEncoder, pipelines[272], layouts[272], infinityBuf, [buf_138, buf_139], [64, 128, 1]);
        addComputePass(device, commandEncoder, pipelines[273], layouts[273], infinityBuf, [buf_139, buf_138], [32, 256, 1]);
        addComputePass(device, commandEncoder, pipelines[274], layouts[274], infinityBuf, [buf_138, buf_139], [16, 512, 1]);
        addComputePass(device, commandEncoder, pipelines[275], layouts[275], infinityBuf, [buf_139, buf_138], [8, 1024, 1]);
        addComputePass(device, commandEncoder, pipelines[276], layouts[276], infinityBuf, [buf_138, buf_139], [4, 2048, 1]);
        addComputePass(device, commandEncoder, pipelines[277], layouts[277], infinityBuf, [buf_139, buf_138], [2, 4096, 1]);
        addComputePass(device, commandEncoder, pipelines[278], layouts[278], infinityBuf, [buf_138, buf_139], [8192, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[279], layouts[279], infinityBuf, [buf_139, buf_138], [8192, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[280], layouts[280], infinityBuf, [buf_138, buf_139], [8192, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[281], layouts[281], infinityBuf, [buf_139, buf_138], [16384, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[282], layouts[282], infinityBuf, [buf_138, buf_139], [32768, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[283], layouts[283], infinityBuf, [buf_139, buf_138], [1024, 4, 1]);
        addComputePass(device, commandEncoder, pipelines[284], layouts[284], infinityBuf, [buf_138, buf_139], [1024, 8, 1]);
        addComputePass(device, commandEncoder, pipelines[285], layouts[285], infinityBuf, [buf_139, buf_138], [512, 16, 1]);
        addComputePass(device, commandEncoder, pipelines[286], layouts[286], infinityBuf, [buf_138, buf_139], [256, 32, 1]);
        addComputePass(device, commandEncoder, pipelines[287], layouts[287], infinityBuf, [buf_139, buf_138], [128, 64, 1]);
        addComputePass(device, commandEncoder, pipelines[288], layouts[288], infinityBuf, [buf_138, buf_139], [64, 128, 1]);
        addComputePass(device, commandEncoder, pipelines[289], layouts[289], infinityBuf, [buf_139, buf_138], [32, 256, 1]);
        addComputePass(device, commandEncoder, pipelines[290], layouts[290], infinityBuf, [buf_138, buf_139], [16, 512, 1]);
        addComputePass(device, commandEncoder, pipelines[291], layouts[291], infinityBuf, [buf_139, buf_138], [8, 1024, 1]);
        addComputePass(device, commandEncoder, pipelines[292], layouts[292], infinityBuf, [buf_138, buf_139], [4, 2048, 1]);
        addComputePass(device, commandEncoder, pipelines[293], layouts[293], infinityBuf, [buf_139, buf_138], [2, 4096, 1]);
        addComputePass(device, commandEncoder, pipelines[294], layouts[294], infinityBuf, [buf_138, buf_139], [8192, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[295], layouts[295], infinityBuf, [buf_139, buf_138], [8192, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[296], layouts[296], infinityBuf, [buf_138, buf_139], [8192, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[297], layouts[297], infinityBuf, [buf_139, buf_138], [16384, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[298], layouts[298], infinityBuf, [buf_138, buf_139], [32768, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[299], layouts[299], infinityBuf, [buf_139, buf_138], [2048, 4, 1]);
        addComputePass(device, commandEncoder, pipelines[300], layouts[300], infinityBuf, [buf_138, buf_139], [1024, 8, 1]);
        addComputePass(device, commandEncoder, pipelines[301], layouts[301], infinityBuf, [buf_139, buf_138], [512, 16, 1]);
        addComputePass(device, commandEncoder, pipelines[302], layouts[302], infinityBuf, [buf_138, buf_139], [256, 32, 1]);
        addComputePass(device, commandEncoder, pipelines[303], layouts[303], infinityBuf, [buf_139, buf_138], [128, 64, 1]);
        addComputePass(device, commandEncoder, pipelines[304], layouts[304], infinityBuf, [buf_138, buf_139], [64, 128, 1]);
        addComputePass(device, commandEncoder, pipelines[305], layouts[305], infinityBuf, [buf_139, buf_138], [32, 256, 1]);
        addComputePass(device, commandEncoder, pipelines[306], layouts[306], infinityBuf, [buf_138, buf_139], [16, 512, 1]);
        addComputePass(device, commandEncoder, pipelines[307], layouts[307], infinityBuf, [buf_139, buf_138], [8, 1024, 1]);
        addComputePass(device, commandEncoder, pipelines[308], layouts[308], infinityBuf, [buf_138, buf_139], [4, 2048, 1]);
        addComputePass(device, commandEncoder, pipelines[309], layouts[309], infinityBuf, [buf_139, buf_138], [2, 4096, 1]);
        addComputePass(device, commandEncoder, pipelines[310], layouts[310], infinityBuf, [buf_138, buf_139], [8192, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[311], layouts[311], infinityBuf, [buf_139, buf_138], [8192, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[312], layouts[312], infinityBuf, [buf_138, buf_139], [8192, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[313], layouts[313], infinityBuf, [buf_139, buf_138], [16384, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[314], layouts[314], infinityBuf, [buf_138, buf_139], [32768, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[315], layouts[315], infinityBuf, [output0, buf_138], [5, 1, 1]);
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
export default decoder;
