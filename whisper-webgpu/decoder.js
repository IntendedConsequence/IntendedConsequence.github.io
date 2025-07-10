
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

const r_112_8_3_16_8_2161_3_4 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<i32>;
@group(0) @binding(3)var<storage,read_write>data2:array<i32>;
@group(0) @binding(4)var<storage,read_write>data3:array<f32>;
@compute @workgroup_size(16,8) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 3 */
  var gidx1 = i32(gindex.y); /* 8 */
  var gidx2 = i32(gindex.z); /* 112 */
  var lidx0 = i32(lindex.x); /* 16 */
  var lidx1 = i32(lindex.y); /* 8 */
  var precast0 = gidx2;
  var precast1 = (bitcast<u32>(precast0)<<2u);
  var cast0 = bitcast<i32>(precast1);
  var val0 = data2[cast0];
  var val1 = data2[(cast0+1)];
  var val2 = data2[(cast0+2)];
  var val3 = data2[(cast0+3)];
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
  for (var ridx5 = 0; ridx5 < 2161; ridx5++) {
    var val4 = data1[((gidx0*17288)+(lidx1*2161)+ridx5)];
    var alu0 = ((gidx0*6638592)+(gidx1*48)+(lidx0*3)+(lidx1*829824)+(ridx5*384));
    var val5 = data3[alu0];
    var val6 = data3[(alu0+1)];
    var val7 = data3[(alu0+2)];
    var cast1 = (f32(((val4!=val0)!=true)));
    acc4 = (acc4+(cast1*val6));
    acc8 = (acc8+(cast1*val7));
    acc0 = (acc0+(cast1*val5));
    var cast2 = (f32(((val4!=val1)!=true)));
    acc5 = (acc5+(cast2*val6));
    acc9 = (acc9+(cast2*val7));
    acc1 = (acc1+(cast2*val5));
    var cast3 = (f32(((val4!=val2)!=true)));
    acc6 = (acc6+(cast3*val6));
    acc10 = (acc10+(cast3*val7));
    acc2 = (acc2+(cast3*val5));
    var cast4 = (f32(((val4!=val3)!=true)));
    acc7 = (acc7+(cast4*val6));
    acc11 = (acc11+(cast4*val7));
    acc3 = (acc3+(cast4*val5));
  }
  var precast2 = gidx0;
  var precast3 = (bitcast<u32>(precast2)<<3u);
  var alu14 = (lidx1+(gidx1*1152)+(gidx2*36864)+bitcast<i32>(precast3)+(lidx0*72));
  data0[alu14] = acc0;
  data0[(alu14+24)] = acc4;
  data0[(alu14+48)] = acc8;
  data0[(alu14+9216)] = acc1;
  data0[(alu14+9240)] = acc5;
  data0[(alu14+9264)] = acc9;
  data0[(alu14+18432)] = acc2;
  data0[(alu14+18456)] = acc6;
  data0[(alu14+18480)] = acc10;
  data0[(alu14+27648)] = acc3;
  data0[(alu14+27672)] = acc7;
  data0[(alu14+27696)] = acc11;
}`;

const r_1792_32_3_24 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
@compute @workgroup_size(32) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 1792 */
  var lidx0 = i32(lindex.x); /* 32 */
  var alu0 = ((gidx0*96)+(lidx0*3));
  var val0 = data2[alu0];
  var alu1 = (alu0+1);
  var val1 = data2[alu1];
  var alu2 = (alu0+2);
  var val2 = data2[alu2];
  var alu3 = ((gidx0*2304)+(lidx0*72));
  var val3 = data1[alu3];
  var val4 = data1[(alu3+1)];
  var val5 = data1[(alu3+2)];
  var val6 = data1[(alu3+3)];
  var val7 = data1[(alu3+4)];
  var val8 = data1[(alu3+5)];
  var val9 = data1[(alu3+6)];
  var val10 = data1[(alu3+7)];
  var val11 = data1[(alu3+8)];
  var val12 = data1[(alu3+9)];
  var val13 = data1[(alu3+10)];
  var val14 = data1[(alu3+11)];
  var val15 = data1[(alu3+12)];
  var val16 = data1[(alu3+13)];
  var val17 = data1[(alu3+14)];
  var val18 = data1[(alu3+15)];
  var val19 = data1[(alu3+16)];
  var val20 = data1[(alu3+17)];
  var val21 = data1[(alu3+18)];
  var val22 = data1[(alu3+19)];
  var val23 = data1[(alu3+20)];
  var val24 = data1[(alu3+21)];
  var val25 = data1[(alu3+22)];
  var val26 = data1[(alu3+23)];
  var val27 = data1[(alu3+24)];
  var val28 = data1[(alu3+25)];
  var val29 = data1[(alu3+26)];
  var val30 = data1[(alu3+27)];
  var val31 = data1[(alu3+28)];
  var val32 = data1[(alu3+29)];
  var val33 = data1[(alu3+30)];
  var val34 = data1[(alu3+31)];
  var val35 = data1[(alu3+32)];
  var val36 = data1[(alu3+33)];
  var val37 = data1[(alu3+34)];
  var val38 = data1[(alu3+35)];
  var val39 = data1[(alu3+36)];
  var val40 = data1[(alu3+37)];
  var val41 = data1[(alu3+38)];
  var val42 = data1[(alu3+39)];
  var val43 = data1[(alu3+40)];
  var val44 = data1[(alu3+41)];
  var val45 = data1[(alu3+42)];
  var val46 = data1[(alu3+43)];
  var val47 = data1[(alu3+44)];
  var val48 = data1[(alu3+45)];
  var val49 = data1[(alu3+46)];
  var val50 = data1[(alu3+47)];
  var val51 = data1[(alu3+48)];
  var val52 = data1[(alu3+49)];
  var val53 = data1[(alu3+50)];
  var val54 = data1[(alu3+51)];
  var val55 = data1[(alu3+52)];
  var val56 = data1[(alu3+53)];
  var val57 = data1[(alu3+54)];
  var val58 = data1[(alu3+55)];
  var val59 = data1[(alu3+56)];
  var val60 = data1[(alu3+57)];
  var val61 = data1[(alu3+58)];
  var val62 = data1[(alu3+59)];
  var val63 = data1[(alu3+60)];
  var val64 = data1[(alu3+61)];
  var val65 = data1[(alu3+62)];
  var val66 = data1[(alu3+63)];
  var val67 = data1[(alu3+64)];
  var val68 = data1[(alu3+65)];
  var val69 = data1[(alu3+66)];
  var val70 = data1[(alu3+67)];
  var val71 = data1[(alu3+68)];
  var val72 = data1[(alu3+69)];
  var val73 = data1[(alu3+70)];
  var val74 = data1[(alu3+71)];
  data0[alu1] = (val27+val28+val29+val30+val31+val32+val33+val34+val35+val36+val37+val38+val39+val40+val41+val42+val43+val44+val45+val46+val47+val48+val49+val50+val1);
  data0[alu2] = (val51+val52+val53+val54+val55+val56+val57+val58+val59+val60+val61+val62+val63+val64+val65+val66+val67+val68+val69+val70+val71+val72+val73+val74+val2);
  data0[alu0] = (val3+val4+val5+val6+val7+val8+val9+val10+val11+val12+val13+val14+val15+val16+val17+val18+val19+val20+val21+val22+val23+val24+val25+val26+val0);
}`;

const r_448_16_24 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
var<workgroup> temp0: array<f32,16>;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@compute @workgroup_size(16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 448 */
  var lidx0 = i32(lindex.x); /* 16 */
  var acc0 = 0.0f;
  for (var ridx2 = 0; ridx2 < 24; ridx2++) {
    var val0 = data1[((gidx0*384)+(lidx0*24)+ridx2)];
    acc0 = (acc0+val0);
  }
  temp0[lidx0] = acc0;
  workgroupBarrier();
  if (((bool(lidx0))!=true)) {
    var acc1 = 0.0f;
    for (var ridx1001 = 0; ridx1001 < 16; ridx1001++) {
      var val1 = temp0[ridx1001];
      acc1 = (acc1+val1);
    }
    data0[gidx0] = (acc1*0.0026041666666666665f);
  }
}`;

const r_448_16_24n1 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
var<workgroup> temp0: array<f32,16>;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
@compute @workgroup_size(16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 448 */
  var lidx0 = i32(lindex.x); /* 16 */
  var val0 = data2[gidx0];
  var acc0 = 0.0f;
  for (var ridx2 = 0; ridx2 < 24; ridx2++) {
    var val1 = data1[((gidx0*384)+(lidx0*24)+ridx2)];
    var alu0 = (val1-val0);
    acc0 = (acc0+(alu0*alu0));
  }
  temp0[lidx0] = acc0;
  workgroupBarrier();
  if (((bool(lidx0))!=true)) {
    var acc1 = 0.0f;
    for (var ridx1001 = 0; ridx1001 < 16; ridx1001++) {
      var val2 = temp0[ridx1001];
      acc1 = (acc1+val2);
    }
    data0[gidx0] = (1/sqrt(((acc1*0.0026041666666666665f)+1e-05f)));
  }
}`;

const E_14_8_8_16_3_4 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3:array<f32>;
@group(0) @binding(5)var<storage,read_write>data4:array<f32>;
@group(0) @binding(6)var<storage,read_write>data5:array<f32>;
@compute @workgroup_size(8,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 8 */
  var gidx1 = i32(gindex.y); /* 14 */
  var lidx0 = i32(lindex.x); /* 8 */
  var lidx1 = i32(lindex.y); /* 16 */
  var precast0 = gidx1;
  var precast1 = lidx0;
  var alu0 = (gidx0*48);
  var alu1 = (lidx1*3);
  var alu2 = (alu0+(gidx1*12288)+(lidx0*1536)+alu1);
  var val0 = data1[alu2];
  var alu3 = (alu2+1);
  var val1 = data1[alu3];
  var alu4 = (alu2+2);
  var val2 = data1[alu4];
  var alu5 = (alu2+384);
  var val3 = data1[alu5];
  var alu6 = (alu2+385);
  var val4 = data1[alu6];
  var alu7 = (alu2+386);
  var val5 = data1[alu7];
  var alu8 = (alu2+768);
  var val6 = data1[alu8];
  var alu9 = (alu2+769);
  var val7 = data1[alu9];
  var alu10 = (alu2+770);
  var val8 = data1[alu10];
  var alu11 = (alu2+1152);
  var val9 = data1[alu11];
  var alu12 = (alu2+1153);
  var val10 = data1[alu12];
  var alu13 = (alu2+1154);
  var val11 = data1[alu13];
  var alu14 = (alu0+alu1);
  var val12 = data4[alu14];
  var val13 = data5[alu14];
  var alu15 = (alu14+1);
  var val14 = data4[alu15];
  var val15 = data5[alu15];
  var alu16 = (alu14+2);
  var val16 = data4[alu16];
  var val17 = data5[alu16];
  var precast2 = (bitcast<u32>(precast0)<<5u);
  var precast3 = (bitcast<u32>(precast1)<<2u);
  var alu17 = (bitcast<i32>(precast2)+bitcast<i32>(precast3));
  var val18 = data2[alu17];
  var val19 = data3[alu17];
  var alu18 = (alu17+1);
  var val20 = data2[alu18];
  var val21 = data3[alu18];
  var alu19 = (alu17+2);
  var val22 = data2[alu19];
  var val23 = data3[alu19];
  var alu20 = (alu17+3);
  var val24 = data2[alu20];
  var val25 = data3[alu20];
  data0[alu3] = (((val1-val18)*val19*val14)+val15);
  data0[alu4] = (((val2-val18)*val19*val16)+val17);
  data0[alu5] = (((val3-val20)*val21*val12)+val13);
  data0[alu6] = (((val4-val20)*val21*val14)+val15);
  data0[alu7] = (((val5-val20)*val21*val16)+val17);
  data0[alu8] = (((val6-val22)*val23*val12)+val13);
  data0[alu9] = (((val7-val22)*val23*val14)+val15);
  data0[alu10] = (((val8-val22)*val23*val16)+val17);
  data0[alu11] = (((val9-val24)*val25*val12)+val13);
  data0[alu12] = (((val10-val24)*val25*val14)+val15);
  data0[alu13] = (((val11-val24)*val25*val16)+val17);
  data0[alu2] = (((val0-val18)*val19*val12)+val13);
}`;

const r_14_8_8_16_96_3_4_4 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
@compute @workgroup_size(8,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 8 */
  var gidx1 = i32(gindex.y); /* 14 */
  var lidx0 = i32(lindex.x); /* 8 */
  var lidx1 = i32(lindex.y); /* 16 */
  var alu0 = (lidx0*1536);
  var alu1 = (gidx1*12288);
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
  for (var ridx4 = 0; ridx4 < 96; ridx4++) {
    var precast0 = ridx4;
    var precast1 = (bitcast<u32>(precast0)<<2u);
    var cast0 = bitcast<i32>(precast1);
    var alu2 = ((gidx0*18432)+(lidx1*1152)+cast0);
    var val0 = data2[alu2];
    var val1 = data2[(alu2+1)];
    var val2 = data2[(alu2+2)];
    var val3 = data2[(alu2+3)];
    var val4 = data2[(alu2+384)];
    var val5 = data2[(alu2+385)];
    var val6 = data2[(alu2+386)];
    var val7 = data2[(alu2+387)];
    var val8 = data2[(alu2+768)];
    var val9 = data2[(alu2+769)];
    var val10 = data2[(alu2+770)];
    var val11 = data2[(alu2+771)];
    var alu3 = (alu1+alu0+cast0);
    var val12 = data1[alu3];
    var val13 = data1[(alu3+1)];
    var val14 = data1[(alu3+2)];
    var val15 = data1[(alu3+3)];
    var val16 = data1[(alu3+384)];
    var val17 = data1[(alu3+385)];
    var val18 = data1[(alu3+386)];
    var val19 = data1[(alu3+387)];
    var val20 = data1[(alu3+768)];
    var val21 = data1[(alu3+769)];
    var val22 = data1[(alu3+770)];
    var val23 = data1[(alu3+771)];
    var val24 = data1[(alu3+1152)];
    var val25 = data1[(alu3+1153)];
    var val26 = data1[(alu3+1154)];
    var val27 = data1[(alu3+1155)];
    acc1 = (acc1+(val16*val0)+(val17*val1)+(val18*val2)+(val19*val3));
    acc5 = (acc5+(val16*val4)+(val17*val5)+(val18*val6)+(val19*val7));
    acc9 = (acc9+(val16*val8)+(val17*val9)+(val18*val10)+(val19*val11));
    acc2 = (acc2+(val20*val0)+(val21*val1)+(val22*val2)+(val23*val3));
    acc6 = (acc6+(val20*val4)+(val21*val5)+(val22*val6)+(val23*val7));
    acc10 = (acc10+(val20*val8)+(val21*val9)+(val22*val10)+(val23*val11));
    acc3 = (acc3+(val24*val0)+(val25*val1)+(val26*val2)+(val27*val3));
    acc7 = (acc7+(val24*val4)+(val25*val5)+(val26*val6)+(val27*val7));
    acc11 = (acc11+(val24*val8)+(val25*val9)+(val26*val10)+(val27*val11));
    acc4 = (acc4+(val12*val4)+(val13*val5)+(val14*val6)+(val15*val7));
    acc8 = (acc8+(val12*val8)+(val13*val9)+(val14*val10)+(val15*val11));
    acc0 = (acc0+(val12*val0)+(val13*val1)+(val14*val2)+(val15*val3));
  }
  var alu17 = ((gidx0*48)+alu1+alu0+(lidx1*3));
  data0[alu17] = acc0;
  data0[(alu17+1)] = acc4;
  data0[(alu17+2)] = acc8;
  data0[(alu17+384)] = acc1;
  data0[(alu17+385)] = acc5;
  data0[(alu17+386)] = acc9;
  data0[(alu17+768)] = acc2;
  data0[(alu17+769)] = acc6;
  data0[(alu17+770)] = acc10;
  data0[(alu17+1152)] = acc3;
  data0[(alu17+1153)] = acc7;
  data0[(alu17+1154)] = acc11;
}`;

const E_1792_32_3 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@compute @workgroup_size(32) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 1792 */
  var lidx0 = i32(lindex.x); /* 32 */
  var alu0 = ((gidx0*96)+(lidx0*3));
  var val0 = data1[alu0];
  var alu1 = (alu0+1);
  var val1 = data1[alu1];
  var alu2 = (alu0+2);
  var val2 = data1[alu2];
  data0[alu1] = val1;
  data0[alu2] = val2;
  data0[alu0] = val0;
}`;

const r_14_8_8_16_96_4_3_4 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3:array<f32>;
@compute @workgroup_size(8,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 8 */
  var gidx1 = i32(gindex.y); /* 14 */
  var lidx0 = i32(lindex.x); /* 8 */
  var lidx1 = i32(lindex.y); /* 16 */
  var alu0 = (lidx0*1536);
  var alu1 = (gidx1*12288);
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
  for (var ridx4 = 0; ridx4 < 96; ridx4++) {
    var precast0 = ridx4;
    var precast1 = (bitcast<u32>(precast0)<<2u);
    var cast0 = bitcast<i32>(precast1);
    var alu2 = ((gidx0*18432)+(lidx1*1152)+cast0);
    var val0 = data2[alu2];
    var val1 = data2[(alu2+1)];
    var val2 = data2[(alu2+2)];
    var val3 = data2[(alu2+3)];
    var val4 = data2[(alu2+384)];
    var val5 = data2[(alu2+385)];
    var val6 = data2[(alu2+386)];
    var val7 = data2[(alu2+387)];
    var val8 = data2[(alu2+768)];
    var val9 = data2[(alu2+769)];
    var val10 = data2[(alu2+770)];
    var val11 = data2[(alu2+771)];
    var alu3 = (alu1+alu0+cast0);
    var val12 = data1[alu3];
    var val13 = data1[(alu3+1)];
    var val14 = data1[(alu3+2)];
    var val15 = data1[(alu3+3)];
    var val16 = data1[(alu3+384)];
    var val17 = data1[(alu3+385)];
    var val18 = data1[(alu3+386)];
    var val19 = data1[(alu3+387)];
    var val20 = data1[(alu3+768)];
    var val21 = data1[(alu3+769)];
    var val22 = data1[(alu3+770)];
    var val23 = data1[(alu3+771)];
    var val24 = data1[(alu3+1152)];
    var val25 = data1[(alu3+1153)];
    var val26 = data1[(alu3+1154)];
    var val27 = data1[(alu3+1155)];
    acc3 = (acc3+(val16*val0)+(val17*val1)+(val18*val2)+(val19*val3));
    acc4 = (acc4+(val16*val4)+(val17*val5)+(val18*val6)+(val19*val7));
    acc5 = (acc5+(val16*val8)+(val17*val9)+(val18*val10)+(val19*val11));
    acc6 = (acc6+(val20*val0)+(val21*val1)+(val22*val2)+(val23*val3));
    acc7 = (acc7+(val20*val4)+(val21*val5)+(val22*val6)+(val23*val7));
    acc8 = (acc8+(val20*val8)+(val21*val9)+(val22*val10)+(val23*val11));
    acc9 = (acc9+(val24*val0)+(val25*val1)+(val26*val2)+(val27*val3));
    acc10 = (acc10+(val24*val4)+(val25*val5)+(val26*val6)+(val27*val7));
    acc11 = (acc11+(val24*val8)+(val25*val9)+(val26*val10)+(val27*val11));
    acc1 = (acc1+(val12*val4)+(val13*val5)+(val14*val6)+(val15*val7));
    acc2 = (acc2+(val12*val8)+(val13*val9)+(val14*val10)+(val15*val11));
    acc0 = (acc0+(val12*val0)+(val13*val1)+(val14*val2)+(val15*val3));
  }
  var alu17 = (gidx0*48);
  var alu18 = (lidx1*3);
  var alu19 = (alu17+alu18);
  var val28 = data3[alu19];
  var val29 = data3[(alu19+1)];
  var val30 = data3[(alu19+2)];
  var alu20 = (alu17+alu1+alu0+alu18);
  data0[alu20] = (acc0+val28);
  data0[(alu20+1)] = (acc1+val29);
  data0[(alu20+2)] = (acc2+val30);
  data0[(alu20+384)] = (acc3+val28);
  data0[(alu20+385)] = (acc4+val29);
  data0[(alu20+386)] = (acc5+val30);
  data0[(alu20+768)] = (acc6+val28);
  data0[(alu20+769)] = (acc7+val29);
  data0[(alu20+770)] = (acc8+val30);
  data0[(alu20+1152)] = (acc9+val28);
  data0[(alu20+1153)] = (acc10+val29);
  data0[(alu20+1154)] = (acc11+val30);
}`;

const r_125_8_4_16_96_3_3_4n1 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
@compute @workgroup_size(4,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 8 */
  var gidx1 = i32(gindex.y); /* 125 */
  var lidx0 = i32(lindex.x); /* 4 */
  var lidx1 = i32(lindex.y); /* 16 */
  var alu0 = (lidx0*1152);
  var alu1 = (gidx1*4608);
  var acc0 = 0.0f;
  var acc1 = 0.0f;
  var acc2 = 0.0f;
  var acc3 = 0.0f;
  var acc4 = 0.0f;
  var acc5 = 0.0f;
  var acc6 = 0.0f;
  var acc7 = 0.0f;
  var acc8 = 0.0f;
  for (var ridx4 = 0; ridx4 < 96; ridx4++) {
    var precast0 = ridx4;
    var precast1 = (bitcast<u32>(precast0)<<2u);
    var cast0 = bitcast<i32>(precast1);
    var alu2 = ((gidx0*18432)+(lidx1*1152)+cast0);
    var val0 = data2[alu2];
    var val1 = data2[(alu2+1)];
    var val2 = data2[(alu2+2)];
    var val3 = data2[(alu2+3)];
    var val4 = data2[(alu2+384)];
    var val5 = data2[(alu2+385)];
    var val6 = data2[(alu2+386)];
    var val7 = data2[(alu2+387)];
    var val8 = data2[(alu2+768)];
    var val9 = data2[(alu2+769)];
    var val10 = data2[(alu2+770)];
    var val11 = data2[(alu2+771)];
    var alu3 = (alu1+alu0+cast0);
    var val12 = data1[alu3];
    var val13 = data1[(alu3+1)];
    var val14 = data1[(alu3+2)];
    var val15 = data1[(alu3+3)];
    var val16 = data1[(alu3+384)];
    var val17 = data1[(alu3+385)];
    var val18 = data1[(alu3+386)];
    var val19 = data1[(alu3+387)];
    var val20 = data1[(alu3+768)];
    var val21 = data1[(alu3+769)];
    var val22 = data1[(alu3+770)];
    var val23 = data1[(alu3+771)];
    acc1 = (acc1+(val16*val0)+(val17*val1)+(val18*val2)+(val19*val3));
    acc4 = (acc4+(val16*val4)+(val17*val5)+(val18*val6)+(val19*val7));
    acc7 = (acc7+(val16*val8)+(val17*val9)+(val18*val10)+(val19*val11));
    acc2 = (acc2+(val20*val0)+(val21*val1)+(val22*val2)+(val23*val3));
    acc5 = (acc5+(val20*val4)+(val21*val5)+(val22*val6)+(val23*val7));
    acc8 = (acc8+(val20*val8)+(val21*val9)+(val22*val10)+(val23*val11));
    acc3 = (acc3+(val12*val4)+(val13*val5)+(val14*val6)+(val15*val7));
    acc6 = (acc6+(val12*val8)+(val13*val9)+(val14*val10)+(val15*val11));
    acc0 = (acc0+(val12*val0)+(val13*val1)+(val14*val2)+(val15*val3));
  }
  var alu14 = ((gidx0*48)+alu1+alu0+(lidx1*3));
  data0[alu14] = acc0;
  data0[(alu14+1)] = acc3;
  data0[(alu14+2)] = acc6;
  data0[(alu14+384)] = acc1;
  data0[(alu14+385)] = acc4;
  data0[(alu14+386)] = acc7;
  data0[(alu14+768)] = acc2;
  data0[(alu14+769)] = acc5;
  data0[(alu14+770)] = acc8;
}`;

const r_125_8_4_16_96_3_3_4 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3:array<f32>;
@compute @workgroup_size(4,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 8 */
  var gidx1 = i32(gindex.y); /* 125 */
  var lidx0 = i32(lindex.x); /* 4 */
  var lidx1 = i32(lindex.y); /* 16 */
  var alu0 = (lidx0*1152);
  var alu1 = (gidx1*4608);
  var acc0 = 0.0f;
  var acc1 = 0.0f;
  var acc2 = 0.0f;
  var acc3 = 0.0f;
  var acc4 = 0.0f;
  var acc5 = 0.0f;
  var acc6 = 0.0f;
  var acc7 = 0.0f;
  var acc8 = 0.0f;
  for (var ridx4 = 0; ridx4 < 96; ridx4++) {
    var precast0 = ridx4;
    var precast1 = (bitcast<u32>(precast0)<<2u);
    var cast0 = bitcast<i32>(precast1);
    var alu2 = ((gidx0*18432)+(lidx1*1152)+cast0);
    var val0 = data2[alu2];
    var val1 = data2[(alu2+1)];
    var val2 = data2[(alu2+2)];
    var val3 = data2[(alu2+3)];
    var val4 = data2[(alu2+384)];
    var val5 = data2[(alu2+385)];
    var val6 = data2[(alu2+386)];
    var val7 = data2[(alu2+387)];
    var val8 = data2[(alu2+768)];
    var val9 = data2[(alu2+769)];
    var val10 = data2[(alu2+770)];
    var val11 = data2[(alu2+771)];
    var alu3 = (alu1+alu0+cast0);
    var val12 = data1[alu3];
    var val13 = data1[(alu3+1)];
    var val14 = data1[(alu3+2)];
    var val15 = data1[(alu3+3)];
    var val16 = data1[(alu3+384)];
    var val17 = data1[(alu3+385)];
    var val18 = data1[(alu3+386)];
    var val19 = data1[(alu3+387)];
    var val20 = data1[(alu3+768)];
    var val21 = data1[(alu3+769)];
    var val22 = data1[(alu3+770)];
    var val23 = data1[(alu3+771)];
    acc3 = (acc3+(val16*val0)+(val17*val1)+(val18*val2)+(val19*val3));
    acc4 = (acc4+(val16*val4)+(val17*val5)+(val18*val6)+(val19*val7));
    acc5 = (acc5+(val16*val8)+(val17*val9)+(val18*val10)+(val19*val11));
    acc6 = (acc6+(val20*val0)+(val21*val1)+(val22*val2)+(val23*val3));
    acc7 = (acc7+(val20*val4)+(val21*val5)+(val22*val6)+(val23*val7));
    acc8 = (acc8+(val20*val8)+(val21*val9)+(val22*val10)+(val23*val11));
    acc1 = (acc1+(val12*val4)+(val13*val5)+(val14*val6)+(val15*val7));
    acc2 = (acc2+(val12*val8)+(val13*val9)+(val14*val10)+(val15*val11));
    acc0 = (acc0+(val12*val0)+(val13*val1)+(val14*val2)+(val15*val3));
  }
  var alu14 = (gidx0*48);
  var alu15 = (lidx1*3);
  var alu16 = (alu14+alu15);
  var val24 = data3[alu16];
  var val25 = data3[(alu16+1)];
  var val26 = data3[(alu16+2)];
  var alu17 = (alu14+alu1+alu0+alu15);
  data0[alu17] = (acc0+val24);
  data0[(alu17+1)] = (acc1+val25);
  data0[(alu17+2)] = (acc2+val26);
  data0[(alu17+384)] = (acc3+val24);
  data0[(alu17+385)] = (acc4+val25);
  data0[(alu17+386)] = (acc5+val26);
  data0[(alu17+768)] = (acc6+val24);
  data0[(alu17+769)] = (acc7+val25);
  data0[(alu17+770)] = (acc8+val26);
}`;

const r_2_14_7_8_16_16_4_4_3_4 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3:array<f32>;
@compute @workgroup_size(8,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 7 */
  var gidx1 = i32(gindex.y); /* 14 */
  var gidx2 = i32(gindex.z); /* 2 */
  var lidx0 = i32(lindex.x); /* 8 */
  var lidx1 = i32(lindex.y); /* 16 */
  var alu0 = (gidx2*192);
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
  var acc12 = 0.0f;
  var acc13 = 0.0f;
  var acc14 = 0.0f;
  var acc15 = 0.0f;
  var acc16 = 0.0f;
  var acc17 = 0.0f;
  var acc18 = 0.0f;
  var acc19 = 0.0f;
  var acc20 = 0.0f;
  var acc21 = 0.0f;
  var acc22 = 0.0f;
  var acc23 = 0.0f;
  var acc24 = 0.0f;
  var acc25 = 0.0f;
  var acc26 = 0.0f;
  var acc27 = 0.0f;
  var acc28 = 0.0f;
  var acc29 = 0.0f;
  var acc30 = 0.0f;
  var acc31 = 0.0f;
  var acc32 = 0.0f;
  var acc33 = 0.0f;
  var acc34 = 0.0f;
  var acc35 = 0.0f;
  var acc36 = 0.0f;
  var acc37 = 0.0f;
  var acc38 = 0.0f;
  var acc39 = 0.0f;
  var acc40 = 0.0f;
  var acc41 = 0.0f;
  var acc42 = 0.0f;
  var acc43 = 0.0f;
  var acc44 = 0.0f;
  var acc45 = 0.0f;
  var acc46 = 0.0f;
  var acc47 = 0.0f;
  for (var ridx5 = 0; ridx5 < 16; ridx5++) {
    var precast0 = ridx5;
    var precast1 = (bitcast<u32>(precast0)<<2u);
    var cast0 = bitcast<i32>(precast1);
    var alu1 = ((gidx0*24576)+alu0+(lidx1*1536)+cast0);
    var val0 = data2[alu1];
    var val1 = data2[(alu1+1)];
    var val2 = data2[(alu1+2)];
    var val3 = data2[(alu1+3)];
    var val4 = data2[(alu1+64)];
    var val5 = data2[(alu1+65)];
    var val6 = data2[(alu1+66)];
    var val7 = data2[(alu1+67)];
    var val8 = data2[(alu1+128)];
    var val9 = data2[(alu1+129)];
    var val10 = data2[(alu1+130)];
    var val11 = data2[(alu1+131)];
    var val12 = data2[(alu1+384)];
    var val13 = data2[(alu1+385)];
    var val14 = data2[(alu1+386)];
    var val15 = data2[(alu1+387)];
    var val16 = data2[(alu1+448)];
    var val17 = data2[(alu1+449)];
    var val18 = data2[(alu1+450)];
    var val19 = data2[(alu1+451)];
    var val20 = data2[(alu1+512)];
    var val21 = data2[(alu1+513)];
    var val22 = data2[(alu1+514)];
    var val23 = data2[(alu1+515)];
    var val24 = data2[(alu1+768)];
    var val25 = data2[(alu1+769)];
    var val26 = data2[(alu1+770)];
    var val27 = data2[(alu1+771)];
    var val28 = data2[(alu1+832)];
    var val29 = data2[(alu1+833)];
    var val30 = data2[(alu1+834)];
    var val31 = data2[(alu1+835)];
    var val32 = data2[(alu1+896)];
    var val33 = data2[(alu1+897)];
    var val34 = data2[(alu1+898)];
    var val35 = data2[(alu1+899)];
    var val36 = data2[(alu1+1152)];
    var val37 = data2[(alu1+1153)];
    var val38 = data2[(alu1+1154)];
    var val39 = data2[(alu1+1155)];
    var val40 = data2[(alu1+1216)];
    var val41 = data2[(alu1+1217)];
    var val42 = data2[(alu1+1218)];
    var val43 = data2[(alu1+1219)];
    var val44 = data2[(alu1+1280)];
    var val45 = data2[(alu1+1281)];
    var val46 = data2[(alu1+1282)];
    var val47 = data2[(alu1+1283)];
    var alu2 = ((gidx1*12288)+alu0+(lidx0*1536)+cast0);
    var val48 = data1[alu2];
    var val49 = data1[(alu2+1)];
    var val50 = data1[(alu2+2)];
    var val51 = data1[(alu2+3)];
    var val52 = data1[(alu2+64)];
    var val53 = data1[(alu2+65)];
    var val54 = data1[(alu2+66)];
    var val55 = data1[(alu2+67)];
    var val56 = data1[(alu2+128)];
    var val57 = data1[(alu2+129)];
    var val58 = data1[(alu2+130)];
    var val59 = data1[(alu2+131)];
    var val60 = data1[(alu2+384)];
    var val61 = data1[(alu2+385)];
    var val62 = data1[(alu2+386)];
    var val63 = data1[(alu2+387)];
    var val64 = data1[(alu2+448)];
    var val65 = data1[(alu2+449)];
    var val66 = data1[(alu2+450)];
    var val67 = data1[(alu2+451)];
    var val68 = data1[(alu2+512)];
    var val69 = data1[(alu2+513)];
    var val70 = data1[(alu2+514)];
    var val71 = data1[(alu2+515)];
    var val72 = data1[(alu2+768)];
    var val73 = data1[(alu2+769)];
    var val74 = data1[(alu2+770)];
    var val75 = data1[(alu2+771)];
    var val76 = data1[(alu2+832)];
    var val77 = data1[(alu2+833)];
    var val78 = data1[(alu2+834)];
    var val79 = data1[(alu2+835)];
    var val80 = data1[(alu2+896)];
    var val81 = data1[(alu2+897)];
    var val82 = data1[(alu2+898)];
    var val83 = data1[(alu2+899)];
    var val84 = data1[(alu2+1152)];
    var val85 = data1[(alu2+1153)];
    var val86 = data1[(alu2+1154)];
    var val87 = data1[(alu2+1155)];
    var val88 = data1[(alu2+1216)];
    var val89 = data1[(alu2+1217)];
    var val90 = data1[(alu2+1218)];
    var val91 = data1[(alu2+1219)];
    var val92 = data1[(alu2+1280)];
    var val93 = data1[(alu2+1281)];
    var val94 = data1[(alu2+1282)];
    var val95 = data1[(alu2+1283)];
    acc1 = (acc1+(val52*val4)+(val53*val5)+(val54*val6)+(val55*val7));
    acc13 = (acc13+(val52*val16)+(val53*val17)+(val54*val18)+(val55*val19));
    acc25 = (acc25+(val52*val28)+(val53*val29)+(val54*val30)+(val55*val31));
    acc37 = (acc37+(val52*val40)+(val53*val41)+(val54*val42)+(val55*val43));
    acc2 = (acc2+(val56*val8)+(val57*val9)+(val58*val10)+(val59*val11));
    acc14 = (acc14+(val56*val20)+(val57*val21)+(val58*val22)+(val59*val23));
    acc26 = (acc26+(val56*val32)+(val57*val33)+(val58*val34)+(val59*val35));
    acc38 = (acc38+(val56*val44)+(val57*val45)+(val58*val46)+(val59*val47));
    acc3 = (acc3+(val60*val0)+(val61*val1)+(val62*val2)+(val63*val3));
    acc15 = (acc15+(val60*val12)+(val61*val13)+(val62*val14)+(val63*val15));
    acc27 = (acc27+(val60*val24)+(val61*val25)+(val62*val26)+(val63*val27));
    acc39 = (acc39+(val60*val36)+(val61*val37)+(val62*val38)+(val63*val39));
    acc4 = (acc4+(val64*val4)+(val65*val5)+(val66*val6)+(val67*val7));
    acc16 = (acc16+(val64*val16)+(val65*val17)+(val66*val18)+(val67*val19));
    acc28 = (acc28+(val64*val28)+(val65*val29)+(val66*val30)+(val67*val31));
    acc40 = (acc40+(val64*val40)+(val65*val41)+(val66*val42)+(val67*val43));
    acc5 = (acc5+(val68*val8)+(val69*val9)+(val70*val10)+(val71*val11));
    acc17 = (acc17+(val68*val20)+(val69*val21)+(val70*val22)+(val71*val23));
    acc29 = (acc29+(val68*val32)+(val69*val33)+(val70*val34)+(val71*val35));
    acc41 = (acc41+(val68*val44)+(val69*val45)+(val70*val46)+(val71*val47));
    acc6 = (acc6+(val72*val0)+(val73*val1)+(val74*val2)+(val75*val3));
    acc18 = (acc18+(val72*val12)+(val73*val13)+(val74*val14)+(val75*val15));
    acc30 = (acc30+(val72*val24)+(val73*val25)+(val74*val26)+(val75*val27));
    acc42 = (acc42+(val72*val36)+(val73*val37)+(val74*val38)+(val75*val39));
    acc7 = (acc7+(val76*val4)+(val77*val5)+(val78*val6)+(val79*val7));
    acc19 = (acc19+(val76*val16)+(val77*val17)+(val78*val18)+(val79*val19));
    acc31 = (acc31+(val76*val28)+(val77*val29)+(val78*val30)+(val79*val31));
    acc43 = (acc43+(val76*val40)+(val77*val41)+(val78*val42)+(val79*val43));
    acc8 = (acc8+(val80*val8)+(val81*val9)+(val82*val10)+(val83*val11));
    acc20 = (acc20+(val80*val20)+(val81*val21)+(val82*val22)+(val83*val23));
    acc32 = (acc32+(val80*val32)+(val81*val33)+(val82*val34)+(val83*val35));
    acc44 = (acc44+(val80*val44)+(val81*val45)+(val82*val46)+(val83*val47));
    acc9 = (acc9+(val84*val0)+(val85*val1)+(val86*val2)+(val87*val3));
    acc21 = (acc21+(val84*val12)+(val85*val13)+(val86*val14)+(val87*val15));
    acc33 = (acc33+(val84*val24)+(val85*val25)+(val86*val26)+(val87*val27));
    acc45 = (acc45+(val84*val36)+(val85*val37)+(val86*val38)+(val87*val39));
    acc10 = (acc10+(val88*val4)+(val89*val5)+(val90*val6)+(val91*val7));
    acc22 = (acc22+(val88*val16)+(val89*val17)+(val90*val18)+(val91*val19));
    acc34 = (acc34+(val88*val28)+(val89*val29)+(val90*val30)+(val91*val31));
    acc46 = (acc46+(val88*val40)+(val89*val41)+(val90*val42)+(val91*val43));
    acc11 = (acc11+(val92*val8)+(val93*val9)+(val94*val10)+(val95*val11));
    acc23 = (acc23+(val92*val20)+(val93*val21)+(val94*val22)+(val95*val23));
    acc35 = (acc35+(val92*val32)+(val93*val33)+(val94*val34)+(val95*val35));
    acc47 = (acc47+(val92*val44)+(val93*val45)+(val94*val46)+(val95*val47));
    acc12 = (acc12+(val48*val12)+(val49*val13)+(val50*val14)+(val51*val15));
    acc24 = (acc24+(val48*val24)+(val49*val25)+(val50*val26)+(val51*val27));
    acc36 = (acc36+(val48*val36)+(val49*val37)+(val50*val38)+(val51*val39));
    acc0 = (acc0+(val48*val0)+(val49*val1)+(val50*val2)+(val51*val3));
  }
  var precast2 = gidx0;
  var precast3 = lidx1;
  var alu52 = (gidx1*14336);
  var alu53 = (lidx0*1792);
  var precast4 = (bitcast<u32>(precast2)<<6u);
  var cast1 = bitcast<i32>(precast4);
  var precast5 = (bitcast<u32>(precast3)<<2u);
  var cast2 = bitcast<i32>(precast5);
  var alu54 = (cast1+alu52+alu53+cast2);
  var val96 = data3[alu54];
  var val97 = data3[(alu54+1)];
  var val98 = data3[(alu54+2)];
  var val99 = data3[(alu54+3)];
  var val100 = data3[(alu54+448)];
  var val101 = data3[(alu54+449)];
  var val102 = data3[(alu54+450)];
  var val103 = data3[(alu54+451)];
  var val104 = data3[(alu54+896)];
  var val105 = data3[(alu54+897)];
  var val106 = data3[(alu54+898)];
  var val107 = data3[(alu54+899)];
  var val108 = data3[(alu54+1344)];
  var val109 = data3[(alu54+1345)];
  var val110 = data3[(alu54+1346)];
  var val111 = data3[(alu54+1347)];
  var alu55 = (alu52+(gidx2*602112)+cast1+alu53+cast2);
  data0[alu55] = ((acc0*0.125f)+val96);
  data0[(alu55+200704)] = ((acc1*0.125f)+val96);
  data0[(alu55+401408)] = ((acc2*0.125f)+val96);
  data0[(alu55+448)] = ((acc3*0.125f)+val100);
  data0[(alu55+201152)] = ((acc4*0.125f)+val100);
  data0[(alu55+401856)] = ((acc5*0.125f)+val100);
  data0[(alu55+896)] = ((acc6*0.125f)+val104);
  data0[(alu55+201600)] = ((acc7*0.125f)+val104);
  data0[(alu55+402304)] = ((acc8*0.125f)+val104);
  data0[(alu55+1344)] = ((acc9*0.125f)+val108);
  data0[(alu55+202048)] = ((acc10*0.125f)+val108);
  data0[(alu55+402752)] = ((acc11*0.125f)+val108);
  data0[(alu55+1)] = ((acc12*0.125f)+val97);
  data0[(alu55+200705)] = ((acc13*0.125f)+val97);
  data0[(alu55+401409)] = ((acc14*0.125f)+val97);
  data0[(alu55+449)] = ((acc15*0.125f)+val101);
  data0[(alu55+201153)] = ((acc16*0.125f)+val101);
  data0[(alu55+401857)] = ((acc17*0.125f)+val101);
  data0[(alu55+897)] = ((acc18*0.125f)+val105);
  data0[(alu55+201601)] = ((acc19*0.125f)+val105);
  data0[(alu55+402305)] = ((acc20*0.125f)+val105);
  data0[(alu55+1345)] = ((acc21*0.125f)+val109);
  data0[(alu55+202049)] = ((acc22*0.125f)+val109);
  data0[(alu55+402753)] = ((acc23*0.125f)+val109);
  data0[(alu55+2)] = ((acc24*0.125f)+val98);
  data0[(alu55+200706)] = ((acc25*0.125f)+val98);
  data0[(alu55+401410)] = ((acc26*0.125f)+val98);
  data0[(alu55+450)] = ((acc27*0.125f)+val102);
  data0[(alu55+201154)] = ((acc28*0.125f)+val102);
  data0[(alu55+401858)] = ((acc29*0.125f)+val102);
  data0[(alu55+898)] = ((acc30*0.125f)+val106);
  data0[(alu55+201602)] = ((acc31*0.125f)+val106);
  data0[(alu55+402306)] = ((acc32*0.125f)+val106);
  data0[(alu55+1346)] = ((acc33*0.125f)+val110);
  data0[(alu55+202050)] = ((acc34*0.125f)+val110);
  data0[(alu55+402754)] = ((acc35*0.125f)+val110);
  data0[(alu55+3)] = ((acc36*0.125f)+val99);
  data0[(alu55+200707)] = ((acc37*0.125f)+val99);
  data0[(alu55+401411)] = ((acc38*0.125f)+val99);
  data0[(alu55+451)] = ((acc39*0.125f)+val103);
  data0[(alu55+201155)] = ((acc40*0.125f)+val103);
  data0[(alu55+401859)] = ((acc41*0.125f)+val103);
  data0[(alu55+899)] = ((acc42*0.125f)+val107);
  data0[(alu55+201603)] = ((acc43*0.125f)+val107);
  data0[(alu55+402307)] = ((acc44*0.125f)+val107);
  data0[(alu55+1347)] = ((acc45*0.125f)+val111);
  data0[(alu55+202051)] = ((acc46*0.125f)+val111);
  data0[(alu55+402755)] = ((acc47*0.125f)+val111);
}`;

const r_28_32_112_3_4 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@compute @workgroup_size(32) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 28 */
  var lidx0 = i32(lindex.x); /* 32 */
  var acc0 = (f32(-INFINITY));
  var acc1 = (f32(-INFINITY));
  var acc2 = (f32(-INFINITY));
  for (var ridx2 = 0; ridx2 < 112; ridx2++) {
    var precast0 = ridx2;
    var precast1 = (bitcast<u32>(precast0)<<2u);
    var alu0 = ((gidx0*43008)+(lidx0*1344)+bitcast<i32>(precast1));
    var val0 = data1[alu0];
    var val1 = data1[(alu0+1)];
    var val2 = data1[(alu0+2)];
    var val3 = data1[(alu0+3)];
    var val4 = data1[(alu0+448)];
    var val5 = data1[(alu0+449)];
    var val6 = data1[(alu0+450)];
    var val7 = data1[(alu0+451)];
    var val8 = data1[(alu0+896)];
    var val9 = data1[(alu0+897)];
    var val10 = data1[(alu0+898)];
    var val11 = data1[(alu0+899)];
    var alu1 = select(acc0,val0,(acc0<val0));
    var alu2 = select(acc1,val4,(acc1<val4));
    var alu3 = select(acc2,val8,(acc2<val8));
    var alu4 = select(alu1,val1,(alu1<val1));
    var alu5 = select(alu2,val5,(alu2<val5));
    var alu6 = select(alu3,val9,(alu3<val9));
    var alu7 = select(alu4,val2,(alu4<val2));
    var alu8 = select(alu5,val6,(alu5<val6));
    var alu9 = select(alu6,val10,(alu6<val10));
    var alu10 = select(alu7,val3,(alu7<val3));
    acc0 = alu10;
    var alu12 = select(alu8,val7,(alu8<val7));
    acc1 = alu12;
    var alu14 = select(alu9,val11,(alu9<val11));
    acc2 = alu14;
  }
  var alu17 = ((gidx0*96)+(lidx0*3));
  data0[alu17] = acc0;
  data0[(alu17+1)] = acc1;
  data0[(alu17+2)] = acc2;
}`;

const r_28_32_112_3_4n1 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
@compute @workgroup_size(32) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 28 */
  var lidx0 = i32(lindex.x); /* 32 */
  var alu0 = ((gidx0*96)+(lidx0*3));
  var alu1 = (alu0+2);
  var alu2 = (alu0+1);
  var val0 = data2[alu2];
  var val1 = data2[alu1];
  var val2 = data2[alu0];
  var acc0 = 0.0f;
  var acc1 = 0.0f;
  var acc2 = 0.0f;
  for (var ridx2 = 0; ridx2 < 112; ridx2++) {
    var precast0 = ridx2;
    var precast1 = (bitcast<u32>(precast0)<<2u);
    var alu3 = ((gidx0*43008)+(lidx0*1344)+bitcast<i32>(precast1));
    var val3 = data1[alu3];
    var val4 = data1[(alu3+1)];
    var val5 = data1[(alu3+2)];
    var val6 = data1[(alu3+3)];
    var val7 = data1[(alu3+448)];
    var val8 = data1[(alu3+449)];
    var val9 = data1[(alu3+450)];
    var val10 = data1[(alu3+451)];
    var val11 = data1[(alu3+896)];
    var val12 = data1[(alu3+897)];
    var val13 = data1[(alu3+898)];
    var val14 = data1[(alu3+899)];
    acc1 = (acc1+exp2(((val7-val0)*1.4426950408889634f))+exp2(((val8-val0)*1.4426950408889634f))+exp2(((val9-val0)*1.4426950408889634f))+exp2(((val10-val0)*1.4426950408889634f)));
    acc2 = (acc2+exp2(((val11-val1)*1.4426950408889634f))+exp2(((val12-val1)*1.4426950408889634f))+exp2(((val13-val1)*1.4426950408889634f))+exp2(((val14-val1)*1.4426950408889634f)));
    acc0 = (acc0+exp2(((val3-val2)*1.4426950408889634f))+exp2(((val4-val2)*1.4426950408889634f))+exp2(((val5-val2)*1.4426950408889634f))+exp2(((val6-val2)*1.4426950408889634f)));
  }
  data0[alu2] = (1/acc1);
  data0[alu1] = (1/acc2);
  data0[alu0] = (1/acc0);
}`;

const E_336_7_8_16_4 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3:array<f32>;
@compute @workgroup_size(8,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 7 */
  var gidx1 = i32(gindex.y); /* 336 */
  var lidx0 = i32(lindex.x); /* 8 */
  var lidx1 = i32(lindex.y); /* 16 */
  var precast0 = gidx0;
  var precast1 = gidx1;
  var precast2 = lidx1;
  var precast3 = (bitcast<u32>(precast0)<<6u);
  var precast4 = (bitcast<u32>(precast1)<<3u);
  var alu0 = (lidx0+bitcast<i32>(precast4));
  var val0 = data2[alu0];
  var val1 = data3[alu0];
  var precast5 = (bitcast<u32>(precast2)<<2u);
  var alu1 = (bitcast<i32>(precast3)+(gidx1*3584)+(lidx0*448)+bitcast<i32>(precast5));
  var val2 = data1[alu1];
  var alu2 = (alu1+1);
  var val3 = data1[alu2];
  var alu3 = (alu1+2);
  var val4 = data1[alu3];
  var alu4 = (alu1+3);
  var val5 = data1[alu4];
  data0[alu1] = (exp2(((val2-val0)*1.4426950408889634f))*val1);
  data0[alu2] = (exp2(((val3-val0)*1.4426950408889634f))*val1);
  data0[alu3] = (exp2(((val4-val0)*1.4426950408889634f))*val1);
  data0[alu4] = (exp2(((val5-val0)*1.4426950408889634f))*val1);
}`;

const r_6_14_8_16_112_4_4_4 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
@compute @workgroup_size(8,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 14 */
  var gidx1 = i32(gindex.y); /* 6 */
  var lidx0 = i32(lindex.x); /* 8 */
  var lidx1 = i32(lindex.y); /* 16 */
  var precast0 = lidx1;
  var precast1 = (bitcast<u32>(precast0)<<2u);
  var cast0 = bitcast<i32>(precast1);
  var precast2 = gidx1;
  var precast3 = (bitcast<u32>(precast2)<<6u);
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
  var acc12 = 0.0f;
  var acc13 = 0.0f;
  var acc14 = 0.0f;
  var acc15 = 0.0f;
  for (var ridx4 = 0; ridx4 < 112; ridx4++) {
    var precast4 = ridx4;
    var alu0 = (bitcast<i32>(precast3)+cast0+(ridx4*1536));
    var val0 = data2[alu0];
    var val1 = data2[(alu0+1)];
    var val2 = data2[(alu0+2)];
    var val3 = data2[(alu0+3)];
    var val4 = data2[(alu0+384)];
    var val5 = data2[(alu0+385)];
    var val6 = data2[(alu0+386)];
    var val7 = data2[(alu0+387)];
    var val8 = data2[(alu0+768)];
    var val9 = data2[(alu0+769)];
    var val10 = data2[(alu0+770)];
    var val11 = data2[(alu0+771)];
    var val12 = data2[(alu0+1152)];
    var val13 = data2[(alu0+1153)];
    var val14 = data2[(alu0+1154)];
    var val15 = data2[(alu0+1155)];
    var precast5 = (bitcast<u32>(precast4)<<2u);
    var alu1 = ((gidx0*14336)+(gidx1*200704)+(lidx0*1792)+bitcast<i32>(precast5));
    var val16 = data1[alu1];
    var val17 = data1[(alu1+1)];
    var val18 = data1[(alu1+2)];
    var val19 = data1[(alu1+3)];
    var val20 = data1[(alu1+448)];
    var val21 = data1[(alu1+449)];
    var val22 = data1[(alu1+450)];
    var val23 = data1[(alu1+451)];
    var val24 = data1[(alu1+896)];
    var val25 = data1[(alu1+897)];
    var val26 = data1[(alu1+898)];
    var val27 = data1[(alu1+899)];
    var val28 = data1[(alu1+1344)];
    var val29 = data1[(alu1+1345)];
    var val30 = data1[(alu1+1346)];
    var val31 = data1[(alu1+1347)];
    acc1 = (acc1+(val20*val0)+(val21*val4)+(val22*val8)+(val23*val12));
    acc5 = (acc5+(val20*val1)+(val21*val5)+(val22*val9)+(val23*val13));
    acc9 = (acc9+(val20*val2)+(val21*val6)+(val22*val10)+(val23*val14));
    acc13 = (acc13+(val20*val3)+(val21*val7)+(val22*val11)+(val23*val15));
    acc2 = (acc2+(val24*val0)+(val25*val4)+(val26*val8)+(val27*val12));
    acc6 = (acc6+(val24*val1)+(val25*val5)+(val26*val9)+(val27*val13));
    acc10 = (acc10+(val24*val2)+(val25*val6)+(val26*val10)+(val27*val14));
    acc14 = (acc14+(val24*val3)+(val25*val7)+(val26*val11)+(val27*val15));
    acc3 = (acc3+(val28*val0)+(val29*val4)+(val30*val8)+(val31*val12));
    acc7 = (acc7+(val28*val1)+(val29*val5)+(val30*val9)+(val31*val13));
    acc11 = (acc11+(val28*val2)+(val29*val6)+(val30*val10)+(val31*val14));
    acc15 = (acc15+(val28*val3)+(val29*val7)+(val30*val11)+(val31*val15));
    acc0 = (acc0+(val16*val0)+(val17*val4)+(val18*val8)+(val19*val12));
    acc4 = (acc4+(val16*val1)+(val17*val5)+(val18*val9)+(val19*val13));
    acc8 = (acc8+(val16*val2)+(val17*val6)+(val18*val10)+(val19*val14));
    acc12 = (acc12+(val16*val3)+(val17*val7)+(val18*val11)+(val19*val15));
  }
  var precast6 = gidx0;
  var precast7 = lidx0;
  var precast8 = (bitcast<u32>(precast6)<<11u);
  var precast9 = (bitcast<u32>(precast7)<<8u);
  var alu19 = (bitcast<i32>(precast8)+(gidx1*28672)+bitcast<i32>(precast9)+cast0);
  data0[alu19] = acc0;
  data0[(alu19+1)] = acc4;
  data0[(alu19+2)] = acc8;
  data0[(alu19+3)] = acc12;
  data0[(alu19+64)] = acc1;
  data0[(alu19+65)] = acc5;
  data0[(alu19+66)] = acc9;
  data0[(alu19+67)] = acc13;
  data0[(alu19+128)] = acc2;
  data0[(alu19+129)] = acc6;
  data0[(alu19+130)] = acc10;
  data0[(alu19+131)] = acc14;
  data0[(alu19+192)] = acc3;
  data0[(alu19+193)] = acc7;
  data0[(alu19+194)] = acc11;
  data0[(alu19+195)] = acc15;
}`;

const r_14_8_8_16_96_4_3_4n1 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3:array<f32>;
@group(0) @binding(5)var<storage,read_write>data4:array<f32>;
@compute @workgroup_size(8,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 8 */
  var gidx1 = i32(gindex.y); /* 14 */
  var lidx0 = i32(lindex.x); /* 8 */
  var lidx1 = i32(lindex.y); /* 16 */
  var precast0 = gidx1;
  var precast1 = lidx0;
  var precast2 = (bitcast<u32>(precast0)<<11u);
  var precast3 = (bitcast<u32>(precast1)<<8u);
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
  for (var ridx4 = 0; ridx4 < 96; ridx4++) {
    var precast4 = ridx4;
    var precast5 = (bitcast<u32>(precast4)<<2u);
    var alu0 = ((gidx0*18432)+(lidx1*1152)+bitcast<i32>(precast5));
    var val0 = data3[alu0];
    var val1 = data3[(alu0+1)];
    var val2 = data3[(alu0+2)];
    var val3 = data3[(alu0+3)];
    var val4 = data3[(alu0+384)];
    var val5 = data3[(alu0+385)];
    var val6 = data3[(alu0+386)];
    var val7 = data3[(alu0+387)];
    var val8 = data3[(alu0+768)];
    var val9 = data3[(alu0+769)];
    var val10 = data3[(alu0+770)];
    var val11 = data3[(alu0+771)];
    var precast6 = (ridx4&15);
    var precast7 = (bitcast<u32>(precast6)<<2u);
    var alu1 = (bitcast<i32>(precast2)+bitcast<i32>(precast3)+((ridx4>>4u)*28672)+bitcast<i32>(precast7));
    var val12 = data2[alu1];
    var val13 = data2[(alu1+1)];
    var val14 = data2[(alu1+2)];
    var val15 = data2[(alu1+3)];
    var val16 = data2[(alu1+64)];
    var val17 = data2[(alu1+65)];
    var val18 = data2[(alu1+66)];
    var val19 = data2[(alu1+67)];
    var val20 = data2[(alu1+128)];
    var val21 = data2[(alu1+129)];
    var val22 = data2[(alu1+130)];
    var val23 = data2[(alu1+131)];
    var val24 = data2[(alu1+192)];
    var val25 = data2[(alu1+193)];
    var val26 = data2[(alu1+194)];
    var val27 = data2[(alu1+195)];
    acc0 = (acc0+(val12*val0)+(val13*val1)+(val14*val2)+(val15*val3));
    acc1 = (acc1+(val12*val4)+(val13*val5)+(val14*val6)+(val15*val7));
    acc2 = (acc2+(val12*val8)+(val13*val9)+(val14*val10)+(val15*val11));
    acc3 = (acc3+(val16*val0)+(val17*val1)+(val18*val2)+(val19*val3));
    acc4 = (acc4+(val16*val4)+(val17*val5)+(val18*val6)+(val19*val7));
    acc5 = (acc5+(val16*val8)+(val17*val9)+(val18*val10)+(val19*val11));
    acc6 = (acc6+(val20*val0)+(val21*val1)+(val22*val2)+(val23*val3));
    acc7 = (acc7+(val20*val4)+(val21*val5)+(val22*val6)+(val23*val7));
    acc8 = (acc8+(val20*val8)+(val21*val9)+(val22*val10)+(val23*val11));
    acc9 = (acc9+(val24*val0)+(val25*val1)+(val26*val2)+(val27*val3));
    acc10 = (acc10+(val24*val4)+(val25*val5)+(val26*val6)+(val27*val7));
    acc11 = (acc11+(val24*val8)+(val25*val9)+(val26*val10)+(val27*val11));
  }
  var alu15 = (gidx0*48);
  var alu16 = (lidx1*3);
  var alu17 = (alu15+(gidx1*12288)+(lidx0*1536)+alu16);
  var val28 = data1[alu17];
  var alu18 = (alu17+1);
  var val29 = data1[alu18];
  var alu19 = (alu17+2);
  var val30 = data1[alu19];
  var alu20 = (alu17+384);
  var val31 = data1[alu20];
  var alu21 = (alu17+385);
  var val32 = data1[alu21];
  var alu22 = (alu17+386);
  var val33 = data1[alu22];
  var alu23 = (alu17+768);
  var val34 = data1[alu23];
  var alu24 = (alu17+769);
  var val35 = data1[alu24];
  var alu25 = (alu17+770);
  var val36 = data1[alu25];
  var alu26 = (alu17+1152);
  var val37 = data1[alu26];
  var alu27 = (alu17+1153);
  var val38 = data1[alu27];
  var alu28 = (alu17+1154);
  var val39 = data1[alu28];
  var alu29 = (alu15+alu16);
  var val40 = data4[alu29];
  var val41 = data4[(alu29+1)];
  var val42 = data4[(alu29+2)];
  data0[alu17] = (val28+acc0+val40);
  data0[alu18] = (val29+acc1+val41);
  data0[alu19] = (val30+acc2+val42);
  data0[alu20] = (val31+acc3+val40);
  data0[alu21] = (val32+acc4+val41);
  data0[alu22] = (val33+acc5+val42);
  data0[alu23] = (val34+acc6+val40);
  data0[alu24] = (val35+acc7+val41);
  data0[alu25] = (val36+acc8+val42);
  data0[alu26] = (val37+acc9+val40);
  data0[alu27] = (val38+acc10+val41);
  data0[alu28] = (val39+acc11+val42);
}`;

const r_3_7_125_2_16_4_16_3_4_4 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
@compute @workgroup_size(2,16,4) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 125 */
  var gidx1 = i32(gindex.y); /* 7 */
  var gidx2 = i32(gindex.z); /* 3 */
  var lidx0 = i32(lindex.x); /* 2 */
  var lidx1 = i32(lindex.y); /* 16 */
  var lidx2 = i32(lindex.z); /* 4 */
  var precast0 = gidx2;
  var precast1 = lidx0;
  var precast2 = (bitcast<u32>(precast0)<<7u);
  var cast0 = bitcast<i32>(precast2);
  var precast3 = (bitcast<u32>(precast1)<<6u);
  var cast1 = bitcast<i32>(precast3);
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
  for (var ridx6 = 0; ridx6 < 16; ridx6++) {
    var precast4 = ridx6;
    var precast5 = (bitcast<u32>(precast4)<<2u);
    var cast2 = bitcast<i32>(precast5);
    var alu0 = ((gidx0*4608)+cast0+cast1+(lidx2*1152)+cast2);
    var val0 = data2[alu0];
    var val1 = data2[(alu0+1)];
    var val2 = data2[(alu0+2)];
    var val3 = data2[(alu0+3)];
    var val4 = data2[(alu0+384)];
    var val5 = data2[(alu0+385)];
    var val6 = data2[(alu0+386)];
    var val7 = data2[(alu0+387)];
    var val8 = data2[(alu0+768)];
    var val9 = data2[(alu0+769)];
    var val10 = data2[(alu0+770)];
    var val11 = data2[(alu0+771)];
    var alu1 = ((gidx1*24576)+cast0+cast1+(lidx1*1536)+cast2);
    var val12 = data1[alu1];
    var val13 = data1[(alu1+1)];
    var val14 = data1[(alu1+2)];
    var val15 = data1[(alu1+3)];
    var val16 = data1[(alu1+384)];
    var val17 = data1[(alu1+385)];
    var val18 = data1[(alu1+386)];
    var val19 = data1[(alu1+387)];
    var val20 = data1[(alu1+768)];
    var val21 = data1[(alu1+769)];
    var val22 = data1[(alu1+770)];
    var val23 = data1[(alu1+771)];
    var val24 = data1[(alu1+1152)];
    var val25 = data1[(alu1+1153)];
    var val26 = data1[(alu1+1154)];
    var val27 = data1[(alu1+1155)];
    acc1 = (acc1+(val16*val0)+(val17*val1)+(val18*val2)+(val19*val3));
    acc5 = (acc5+(val16*val4)+(val17*val5)+(val18*val6)+(val19*val7));
    acc9 = (acc9+(val16*val8)+(val17*val9)+(val18*val10)+(val19*val11));
    acc2 = (acc2+(val20*val0)+(val21*val1)+(val22*val2)+(val23*val3));
    acc6 = (acc6+(val20*val4)+(val21*val5)+(val22*val6)+(val23*val7));
    acc10 = (acc10+(val20*val8)+(val21*val9)+(val22*val10)+(val23*val11));
    acc3 = (acc3+(val24*val0)+(val25*val1)+(val26*val2)+(val27*val3));
    acc7 = (acc7+(val24*val4)+(val25*val5)+(val26*val6)+(val27*val7));
    acc11 = (acc11+(val24*val8)+(val25*val9)+(val26*val10)+(val27*val11));
    acc4 = (acc4+(val12*val4)+(val13*val5)+(val14*val6)+(val15*val7));
    acc8 = (acc8+(val12*val8)+(val13*val9)+(val14*val10)+(val15*val11));
    acc0 = (acc0+(val12*val0)+(val13*val1)+(val14*val2)+(val15*val3));
  }
  var alu15 = ((gidx1*96000)+(gidx2*1344000)+(gidx0*12)+(lidx0*672000)+(lidx1*6000)+(lidx2*3));
  data0[alu15] = (acc0*0.125f);
  data0[(alu15+1500)] = (acc1*0.125f);
  data0[(alu15+3000)] = (acc2*0.125f);
  data0[(alu15+4500)] = (acc3*0.125f);
  data0[(alu15+1)] = (acc4*0.125f);
  data0[(alu15+1501)] = (acc5*0.125f);
  data0[(alu15+3001)] = (acc6*0.125f);
  data0[(alu15+4501)] = (acc7*0.125f);
  data0[(alu15+2)] = (acc8*0.125f);
  data0[(alu15+1502)] = (acc9*0.125f);
  data0[(alu15+3002)] = (acc10*0.125f);
  data0[(alu15+4502)] = (acc11*0.125f);
}`;

const r_28_32_375_3_4 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@compute @workgroup_size(32) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 28 */
  var lidx0 = i32(lindex.x); /* 32 */
  var acc0 = (f32(-INFINITY));
  var acc1 = (f32(-INFINITY));
  var acc2 = (f32(-INFINITY));
  for (var ridx2 = 0; ridx2 < 375; ridx2++) {
    var precast0 = ridx2;
    var precast1 = (bitcast<u32>(precast0)<<2u);
    var alu0 = ((gidx0*144000)+(lidx0*4500)+bitcast<i32>(precast1));
    var val0 = data1[alu0];
    var val1 = data1[(alu0+1)];
    var val2 = data1[(alu0+2)];
    var val3 = data1[(alu0+3)];
    var val4 = data1[(alu0+1500)];
    var val5 = data1[(alu0+1501)];
    var val6 = data1[(alu0+1502)];
    var val7 = data1[(alu0+1503)];
    var val8 = data1[(alu0+3000)];
    var val9 = data1[(alu0+3001)];
    var val10 = data1[(alu0+3002)];
    var val11 = data1[(alu0+3003)];
    var alu1 = select(acc0,val0,(acc0<val0));
    var alu2 = select(acc1,val4,(acc1<val4));
    var alu3 = select(acc2,val8,(acc2<val8));
    var alu4 = select(alu1,val1,(alu1<val1));
    var alu5 = select(alu2,val5,(alu2<val5));
    var alu6 = select(alu3,val9,(alu3<val9));
    var alu7 = select(alu4,val2,(alu4<val2));
    var alu8 = select(alu5,val6,(alu5<val6));
    var alu9 = select(alu6,val10,(alu6<val10));
    var alu10 = select(alu7,val3,(alu7<val3));
    acc0 = alu10;
    var alu12 = select(alu8,val7,(alu8<val7));
    acc1 = alu12;
    var alu14 = select(alu9,val11,(alu9<val11));
    acc2 = alu14;
  }
  var alu17 = ((gidx0*96)+(lidx0*3));
  data0[alu17] = acc0;
  data0[(alu17+1)] = acc1;
  data0[(alu17+2)] = acc2;
}`;

const r_28_32_375_3_4n1 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
@compute @workgroup_size(32) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 28 */
  var lidx0 = i32(lindex.x); /* 32 */
  var alu0 = ((gidx0*96)+(lidx0*3));
  var alu1 = (alu0+2);
  var alu2 = (alu0+1);
  var val0 = data2[alu2];
  var val1 = data2[alu1];
  var val2 = data2[alu0];
  var acc0 = 0.0f;
  var acc1 = 0.0f;
  var acc2 = 0.0f;
  for (var ridx2 = 0; ridx2 < 375; ridx2++) {
    var precast0 = ridx2;
    var precast1 = (bitcast<u32>(precast0)<<2u);
    var alu3 = ((gidx0*144000)+(lidx0*4500)+bitcast<i32>(precast1));
    var val3 = data1[alu3];
    var val4 = data1[(alu3+1)];
    var val5 = data1[(alu3+2)];
    var val6 = data1[(alu3+3)];
    var val7 = data1[(alu3+1500)];
    var val8 = data1[(alu3+1501)];
    var val9 = data1[(alu3+1502)];
    var val10 = data1[(alu3+1503)];
    var val11 = data1[(alu3+3000)];
    var val12 = data1[(alu3+3001)];
    var val13 = data1[(alu3+3002)];
    var val14 = data1[(alu3+3003)];
    acc1 = (acc1+exp2(((val7-val0)*1.4426950408889634f))+exp2(((val8-val0)*1.4426950408889634f))+exp2(((val9-val0)*1.4426950408889634f))+exp2(((val10-val0)*1.4426950408889634f)));
    acc2 = (acc2+exp2(((val11-val1)*1.4426950408889634f))+exp2(((val12-val1)*1.4426950408889634f))+exp2(((val13-val1)*1.4426950408889634f))+exp2(((val14-val1)*1.4426950408889634f)));
    acc0 = (acc0+exp2(((val3-val2)*1.4426950408889634f))+exp2(((val4-val2)*1.4426950408889634f))+exp2(((val5-val2)*1.4426950408889634f))+exp2(((val6-val2)*1.4426950408889634f)));
  }
  data0[alu2] = (1/acc1);
  data0[alu1] = (1/acc2);
  data0[alu0] = (1/acc0);
}`;

const E_84_125_32_4_3 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3:array<f32>;
@compute @workgroup_size(32,4) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 125 */
  var gidx1 = i32(gindex.y); /* 84 */
  var lidx0 = i32(lindex.x); /* 32 */
  var lidx1 = i32(lindex.y); /* 4 */
  var precast0 = gidx1;
  var alu0 = ((gidx0*12)+(gidx1*48000)+(lidx0*1500)+(lidx1*3));
  var val0 = data1[alu0];
  var alu1 = (alu0+1);
  var val1 = data1[alu1];
  var alu2 = (alu0+2);
  var val2 = data1[alu2];
  var precast1 = (bitcast<u32>(precast0)<<5u);
  var alu3 = (lidx0+bitcast<i32>(precast1));
  var val3 = data2[alu3];
  var val4 = data3[alu3];
  data0[alu1] = (exp2(((val1-val3)*1.4426950408889634f))*val4);
  data0[alu2] = (exp2(((val2-val3)*1.4426950408889634f))*val4);
  data0[alu0] = (exp2(((val0-val3)*1.4426950408889634f))*val4);
}`;

const r_6_14_8_16_375_4_4_4 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
@compute @workgroup_size(8,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 14 */
  var gidx1 = i32(gindex.y); /* 6 */
  var lidx0 = i32(lindex.x); /* 8 */
  var lidx1 = i32(lindex.y); /* 16 */
  var precast0 = lidx1;
  var precast1 = (bitcast<u32>(precast0)<<2u);
  var cast0 = bitcast<i32>(precast1);
  var precast2 = gidx1;
  var precast3 = (bitcast<u32>(precast2)<<6u);
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
  var acc12 = 0.0f;
  var acc13 = 0.0f;
  var acc14 = 0.0f;
  var acc15 = 0.0f;
  for (var ridx4 = 0; ridx4 < 375; ridx4++) {
    var precast4 = ridx4;
    var alu0 = (bitcast<i32>(precast3)+cast0+(ridx4*1536));
    var val0 = data2[alu0];
    var val1 = data2[(alu0+1)];
    var val2 = data2[(alu0+2)];
    var val3 = data2[(alu0+3)];
    var val4 = data2[(alu0+384)];
    var val5 = data2[(alu0+385)];
    var val6 = data2[(alu0+386)];
    var val7 = data2[(alu0+387)];
    var val8 = data2[(alu0+768)];
    var val9 = data2[(alu0+769)];
    var val10 = data2[(alu0+770)];
    var val11 = data2[(alu0+771)];
    var val12 = data2[(alu0+1152)];
    var val13 = data2[(alu0+1153)];
    var val14 = data2[(alu0+1154)];
    var val15 = data2[(alu0+1155)];
    var precast5 = (bitcast<u32>(precast4)<<2u);
    var alu1 = ((gidx0*48000)+(gidx1*672000)+(lidx0*6000)+bitcast<i32>(precast5));
    var val16 = data1[alu1];
    var val17 = data1[(alu1+1)];
    var val18 = data1[(alu1+2)];
    var val19 = data1[(alu1+3)];
    var val20 = data1[(alu1+1500)];
    var val21 = data1[(alu1+1501)];
    var val22 = data1[(alu1+1502)];
    var val23 = data1[(alu1+1503)];
    var val24 = data1[(alu1+3000)];
    var val25 = data1[(alu1+3001)];
    var val26 = data1[(alu1+3002)];
    var val27 = data1[(alu1+3003)];
    var val28 = data1[(alu1+4500)];
    var val29 = data1[(alu1+4501)];
    var val30 = data1[(alu1+4502)];
    var val31 = data1[(alu1+4503)];
    acc1 = (acc1+(val20*val0)+(val21*val4)+(val22*val8)+(val23*val12));
    acc5 = (acc5+(val20*val1)+(val21*val5)+(val22*val9)+(val23*val13));
    acc9 = (acc9+(val20*val2)+(val21*val6)+(val22*val10)+(val23*val14));
    acc13 = (acc13+(val20*val3)+(val21*val7)+(val22*val11)+(val23*val15));
    acc2 = (acc2+(val24*val0)+(val25*val4)+(val26*val8)+(val27*val12));
    acc6 = (acc6+(val24*val1)+(val25*val5)+(val26*val9)+(val27*val13));
    acc10 = (acc10+(val24*val2)+(val25*val6)+(val26*val10)+(val27*val14));
    acc14 = (acc14+(val24*val3)+(val25*val7)+(val26*val11)+(val27*val15));
    acc3 = (acc3+(val28*val0)+(val29*val4)+(val30*val8)+(val31*val12));
    acc7 = (acc7+(val28*val1)+(val29*val5)+(val30*val9)+(val31*val13));
    acc11 = (acc11+(val28*val2)+(val29*val6)+(val30*val10)+(val31*val14));
    acc15 = (acc15+(val28*val3)+(val29*val7)+(val30*val11)+(val31*val15));
    acc0 = (acc0+(val16*val0)+(val17*val4)+(val18*val8)+(val19*val12));
    acc4 = (acc4+(val16*val1)+(val17*val5)+(val18*val9)+(val19*val13));
    acc8 = (acc8+(val16*val2)+(val17*val6)+(val18*val10)+(val19*val14));
    acc12 = (acc12+(val16*val3)+(val17*val7)+(val18*val11)+(val19*val15));
  }
  var precast6 = gidx0;
  var precast7 = lidx0;
  var precast8 = (bitcast<u32>(precast6)<<11u);
  var precast9 = (bitcast<u32>(precast7)<<8u);
  var alu19 = (bitcast<i32>(precast8)+(gidx1*28672)+bitcast<i32>(precast9)+cast0);
  data0[alu19] = acc0;
  data0[(alu19+1)] = acc4;
  data0[(alu19+2)] = acc8;
  data0[(alu19+3)] = acc12;
  data0[(alu19+64)] = acc1;
  data0[(alu19+65)] = acc5;
  data0[(alu19+66)] = acc9;
  data0[(alu19+67)] = acc13;
  data0[(alu19+128)] = acc2;
  data0[(alu19+129)] = acc6;
  data0[(alu19+130)] = acc10;
  data0[(alu19+131)] = acc14;
  data0[(alu19+192)] = acc3;
  data0[(alu19+193)] = acc7;
  data0[(alu19+194)] = acc11;
  data0[(alu19+195)] = acc15;
}`;

const r_14_32_8_16_96_4_3_4 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3:array<f32>;
@compute @workgroup_size(8,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 32 */
  var gidx1 = i32(gindex.y); /* 14 */
  var lidx0 = i32(lindex.x); /* 8 */
  var lidx1 = i32(lindex.y); /* 16 */
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
  for (var ridx4 = 0; ridx4 < 96; ridx4++) {
    var precast0 = ridx4;
    var precast1 = (bitcast<u32>(precast0)<<2u);
    var cast0 = bitcast<i32>(precast1);
    var alu0 = ((gidx0*18432)+(lidx1*1152)+cast0);
    var val0 = data2[alu0];
    var val1 = data2[(alu0+1)];
    var val2 = data2[(alu0+2)];
    var val3 = data2[(alu0+3)];
    var val4 = data2[(alu0+384)];
    var val5 = data2[(alu0+385)];
    var val6 = data2[(alu0+386)];
    var val7 = data2[(alu0+387)];
    var val8 = data2[(alu0+768)];
    var val9 = data2[(alu0+769)];
    var val10 = data2[(alu0+770)];
    var val11 = data2[(alu0+771)];
    var alu1 = ((gidx1*12288)+(lidx0*1536)+cast0);
    var val12 = data1[alu1];
    var val13 = data1[(alu1+1)];
    var val14 = data1[(alu1+2)];
    var val15 = data1[(alu1+3)];
    var val16 = data1[(alu1+384)];
    var val17 = data1[(alu1+385)];
    var val18 = data1[(alu1+386)];
    var val19 = data1[(alu1+387)];
    var val20 = data1[(alu1+768)];
    var val21 = data1[(alu1+769)];
    var val22 = data1[(alu1+770)];
    var val23 = data1[(alu1+771)];
    var val24 = data1[(alu1+1152)];
    var val25 = data1[(alu1+1153)];
    var val26 = data1[(alu1+1154)];
    var val27 = data1[(alu1+1155)];
    acc3 = (acc3+(val16*val0)+(val17*val1)+(val18*val2)+(val19*val3));
    acc4 = (acc4+(val16*val4)+(val17*val5)+(val18*val6)+(val19*val7));
    acc5 = (acc5+(val16*val8)+(val17*val9)+(val18*val10)+(val19*val11));
    acc6 = (acc6+(val20*val0)+(val21*val1)+(val22*val2)+(val23*val3));
    acc7 = (acc7+(val20*val4)+(val21*val5)+(val22*val6)+(val23*val7));
    acc8 = (acc8+(val20*val8)+(val21*val9)+(val22*val10)+(val23*val11));
    acc9 = (acc9+(val24*val0)+(val25*val1)+(val26*val2)+(val27*val3));
    acc10 = (acc10+(val24*val4)+(val25*val5)+(val26*val6)+(val27*val7));
    acc11 = (acc11+(val24*val8)+(val25*val9)+(val26*val10)+(val27*val11));
    acc1 = (acc1+(val12*val4)+(val13*val5)+(val14*val6)+(val15*val7));
    acc2 = (acc2+(val12*val8)+(val13*val9)+(val14*val10)+(val15*val11));
    acc0 = (acc0+(val12*val0)+(val13*val1)+(val14*val2)+(val15*val3));
  }
  var alu15 = (gidx0*48);
  var alu16 = (lidx1*3);
  var alu17 = (alu15+alu16);
  var val28 = data3[alu17];
  var val29 = data3[(alu17+1)];
  var val30 = data3[(alu17+2)];
  var alu18 = (acc0+val28);
  var alu19 = (acc1+val29);
  var alu20 = (acc2+val30);
  var alu21 = (acc3+val28);
  var alu22 = (acc4+val29);
  var alu23 = (acc5+val30);
  var alu24 = (acc6+val28);
  var alu25 = (acc7+val29);
  var alu26 = (acc8+val30);
  var alu27 = (acc9+val28);
  var alu28 = (acc10+val29);
  var alu29 = (acc11+val30);
  var alu30 = (alu15+(gidx1*49152)+(lidx0*6144)+alu16);
  data0[alu30] = ((1/(1.0f+exp2(((alu18+(0.044715f*alu18*alu18*alu18))*-2.302208198144325f))))*alu18);
  data0[(alu30+1)] = ((1/(1.0f+exp2(((alu19+(0.044715f*alu19*alu19*alu19))*-2.302208198144325f))))*alu19);
  data0[(alu30+2)] = ((1/(1.0f+exp2(((alu20+(0.044715f*alu20*alu20*alu20))*-2.302208198144325f))))*alu20);
  data0[(alu30+1536)] = ((1/(1.0f+exp2(((alu21+(0.044715f*alu21*alu21*alu21))*-2.302208198144325f))))*alu21);
  data0[(alu30+1537)] = ((1/(1.0f+exp2(((alu22+(0.044715f*alu22*alu22*alu22))*-2.302208198144325f))))*alu22);
  data0[(alu30+1538)] = ((1/(1.0f+exp2(((alu23+(0.044715f*alu23*alu23*alu23))*-2.302208198144325f))))*alu23);
  data0[(alu30+3072)] = ((1/(1.0f+exp2(((alu24+(0.044715f*alu24*alu24*alu24))*-2.302208198144325f))))*alu24);
  data0[(alu30+3073)] = ((1/(1.0f+exp2(((alu25+(0.044715f*alu25*alu25*alu25))*-2.302208198144325f))))*alu25);
  data0[(alu30+3074)] = ((1/(1.0f+exp2(((alu26+(0.044715f*alu26*alu26*alu26))*-2.302208198144325f))))*alu26);
  data0[(alu30+4608)] = ((1/(1.0f+exp2(((alu27+(0.044715f*alu27*alu27*alu27))*-2.302208198144325f))))*alu27);
  data0[(alu30+4609)] = ((1/(1.0f+exp2(((alu28+(0.044715f*alu28*alu28*alu28))*-2.302208198144325f))))*alu28);
  data0[(alu30+4610)] = ((1/(1.0f+exp2(((alu29+(0.044715f*alu29*alu29*alu29))*-2.302208198144325f))))*alu29);
}`;

const r_14_8_8_16_384_4_3_4 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3:array<f32>;
@group(0) @binding(5)var<storage,read_write>data4:array<f32>;
@compute @workgroup_size(8,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 8 */
  var gidx1 = i32(gindex.y); /* 14 */
  var lidx0 = i32(lindex.x); /* 8 */
  var lidx1 = i32(lindex.y); /* 16 */
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
  for (var ridx4 = 0; ridx4 < 384; ridx4++) {
    var precast0 = ridx4;
    var precast1 = (bitcast<u32>(precast0)<<2u);
    var cast0 = bitcast<i32>(precast1);
    var alu0 = ((gidx0*73728)+(lidx1*4608)+cast0);
    var val0 = data3[alu0];
    var val1 = data3[(alu0+1)];
    var val2 = data3[(alu0+2)];
    var val3 = data3[(alu0+3)];
    var val4 = data3[(alu0+1536)];
    var val5 = data3[(alu0+1537)];
    var val6 = data3[(alu0+1538)];
    var val7 = data3[(alu0+1539)];
    var val8 = data3[(alu0+3072)];
    var val9 = data3[(alu0+3073)];
    var val10 = data3[(alu0+3074)];
    var val11 = data3[(alu0+3075)];
    var alu1 = ((gidx1*49152)+(lidx0*6144)+cast0);
    var val12 = data2[alu1];
    var val13 = data2[(alu1+1)];
    var val14 = data2[(alu1+2)];
    var val15 = data2[(alu1+3)];
    var val16 = data2[(alu1+1536)];
    var val17 = data2[(alu1+1537)];
    var val18 = data2[(alu1+1538)];
    var val19 = data2[(alu1+1539)];
    var val20 = data2[(alu1+3072)];
    var val21 = data2[(alu1+3073)];
    var val22 = data2[(alu1+3074)];
    var val23 = data2[(alu1+3075)];
    var val24 = data2[(alu1+4608)];
    var val25 = data2[(alu1+4609)];
    var val26 = data2[(alu1+4610)];
    var val27 = data2[(alu1+4611)];
    acc3 = (acc3+(val16*val0)+(val17*val1)+(val18*val2)+(val19*val3));
    acc4 = (acc4+(val16*val4)+(val17*val5)+(val18*val6)+(val19*val7));
    acc5 = (acc5+(val16*val8)+(val17*val9)+(val18*val10)+(val19*val11));
    acc6 = (acc6+(val20*val0)+(val21*val1)+(val22*val2)+(val23*val3));
    acc7 = (acc7+(val20*val4)+(val21*val5)+(val22*val6)+(val23*val7));
    acc8 = (acc8+(val20*val8)+(val21*val9)+(val22*val10)+(val23*val11));
    acc9 = (acc9+(val24*val0)+(val25*val1)+(val26*val2)+(val27*val3));
    acc10 = (acc10+(val24*val4)+(val25*val5)+(val26*val6)+(val27*val7));
    acc11 = (acc11+(val24*val8)+(val25*val9)+(val26*val10)+(val27*val11));
    acc1 = (acc1+(val12*val4)+(val13*val5)+(val14*val6)+(val15*val7));
    acc2 = (acc2+(val12*val8)+(val13*val9)+(val14*val10)+(val15*val11));
    acc0 = (acc0+(val12*val0)+(val13*val1)+(val14*val2)+(val15*val3));
  }
  var alu15 = (gidx0*48);
  var alu16 = (lidx1*3);
  var alu17 = (alu15+(gidx1*12288)+(lidx0*1536)+alu16);
  var val28 = data1[alu17];
  var alu18 = (alu17+1);
  var val29 = data1[alu18];
  var alu19 = (alu17+2);
  var val30 = data1[alu19];
  var alu20 = (alu17+384);
  var val31 = data1[alu20];
  var alu21 = (alu17+385);
  var val32 = data1[alu21];
  var alu22 = (alu17+386);
  var val33 = data1[alu22];
  var alu23 = (alu17+768);
  var val34 = data1[alu23];
  var alu24 = (alu17+769);
  var val35 = data1[alu24];
  var alu25 = (alu17+770);
  var val36 = data1[alu25];
  var alu26 = (alu17+1152);
  var val37 = data1[alu26];
  var alu27 = (alu17+1153);
  var val38 = data1[alu27];
  var alu28 = (alu17+1154);
  var val39 = data1[alu28];
  var alu29 = (alu15+alu16);
  var val40 = data4[alu29];
  var val41 = data4[(alu29+1)];
  var val42 = data4[(alu29+2)];
  data0[alu17] = (val28+acc0+val40);
  data0[alu18] = (val29+acc1+val41);
  data0[alu19] = (val30+acc2+val42);
  data0[alu20] = (val31+acc3+val40);
  data0[alu21] = (val32+acc4+val41);
  data0[alu22] = (val33+acc5+val42);
  data0[alu23] = (val34+acc6+val40);
  data0[alu24] = (val35+acc7+val41);
  data0[alu25] = (val36+acc8+val42);
  data0[alu26] = (val37+acc9+val40);
  data0[alu27] = (val38+acc10+val41);
  data0[alu28] = (val39+acc11+val42);
}`;

const r_7_2161_16_8_96_3_4_4 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
@compute @workgroup_size(16,8) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 2161 */
  var gidx1 = i32(gindex.y); /* 7 */
  var lidx0 = i32(lindex.x); /* 16 */
  var lidx1 = i32(lindex.y); /* 8 */
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
  for (var ridx4 = 0; ridx4 < 96; ridx4++) {
    var precast0 = ridx4;
    var precast1 = (bitcast<u32>(precast0)<<2u);
    var cast0 = bitcast<i32>(precast1);
    var alu0 = ((gidx0*9216)+(lidx1*1152)+cast0);
    var val0 = data2[alu0];
    var val1 = data2[(alu0+1)];
    var val2 = data2[(alu0+2)];
    var val3 = data2[(alu0+3)];
    var val4 = data2[(alu0+384)];
    var val5 = data2[(alu0+385)];
    var val6 = data2[(alu0+386)];
    var val7 = data2[(alu0+387)];
    var val8 = data2[(alu0+768)];
    var val9 = data2[(alu0+769)];
    var val10 = data2[(alu0+770)];
    var val11 = data2[(alu0+771)];
    var alu1 = ((gidx1*24576)+(lidx0*1536)+cast0);
    var val12 = data1[alu1];
    var val13 = data1[(alu1+1)];
    var val14 = data1[(alu1+2)];
    var val15 = data1[(alu1+3)];
    var val16 = data1[(alu1+384)];
    var val17 = data1[(alu1+385)];
    var val18 = data1[(alu1+386)];
    var val19 = data1[(alu1+387)];
    var val20 = data1[(alu1+768)];
    var val21 = data1[(alu1+769)];
    var val22 = data1[(alu1+770)];
    var val23 = data1[(alu1+771)];
    var val24 = data1[(alu1+1152)];
    var val25 = data1[(alu1+1153)];
    var val26 = data1[(alu1+1154)];
    var val27 = data1[(alu1+1155)];
    acc1 = (acc1+(val16*val0)+(val17*val1)+(val18*val2)+(val19*val3));
    acc5 = (acc5+(val16*val4)+(val17*val5)+(val18*val6)+(val19*val7));
    acc9 = (acc9+(val16*val8)+(val17*val9)+(val18*val10)+(val19*val11));
    acc2 = (acc2+(val20*val0)+(val21*val1)+(val22*val2)+(val23*val3));
    acc6 = (acc6+(val20*val4)+(val21*val5)+(val22*val6)+(val23*val7));
    acc10 = (acc10+(val20*val8)+(val21*val9)+(val22*val10)+(val23*val11));
    acc3 = (acc3+(val24*val0)+(val25*val1)+(val26*val2)+(val27*val3));
    acc7 = (acc7+(val24*val4)+(val25*val5)+(val26*val6)+(val27*val7));
    acc11 = (acc11+(val24*val8)+(val25*val9)+(val26*val10)+(val27*val11));
    acc4 = (acc4+(val12*val4)+(val13*val5)+(val14*val6)+(val15*val7));
    acc8 = (acc8+(val12*val8)+(val13*val9)+(val14*val10)+(val15*val11));
    acc0 = (acc0+(val12*val0)+(val13*val1)+(val14*val2)+(val15*val3));
  }
  var alu15 = ((gidx0*24)+(gidx1*3319296)+(lidx0*207456)+(lidx1*3));
  data0[alu15] = acc0;
  data0[(alu15+1)] = acc4;
  data0[(alu15+2)] = acc8;
  data0[(alu15+51864)] = acc1;
  data0[(alu15+51865)] = acc5;
  data0[(alu15+51866)] = acc9;
  data0[(alu15+103728)] = acc2;
  data0[(alu15+103729)] = acc6;
  data0[(alu15+103730)] = acc10;
  data0[(alu15+155592)] = acc3;
  data0[(alu15+155593)] = acc7;
  data0[(alu15+155594)] = acc11;
}`;

const r_3_8_2161 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<uniform>ctx:i32;
@compute @workgroup_size(8) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 3 */
  var lidx0 = i32(lindex.x); /* 8 */
  var acc0 = (f32(-INFINITY));
  for (var ridx2 = 0; ridx2 < 2161; ridx2++) {
    var val0 = data1[((ctx*51864)+(gidx0*17288)+(lidx0*2161)+ridx2+-51864)];
    var alu0 = select(acc0,val0,(acc0<val0));
    acc0 = alu0;
  }
  var precast0 = gidx0;
  var precast1 = (bitcast<u32>(precast0)<<3u);
  data0[(lidx0+bitcast<i32>(precast1))] = acc0;
}`;

const r_2161_8_12966_3_4 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<i32>;
@compute @workgroup_size(8) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 2161 */
  var lidx0 = i32(lindex.x); /* 8 */
  var alu0 = ((gidx0*24)+(lidx0*3));
  data0[alu0] = alu0;
  var alu2 = (alu0+1);
  data0[alu2] = alu2;
  var alu4 = (alu0+2);
  data0[alu4] = alu4;
}`;

const r_24 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@compute @workgroup_size(1) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var val0 = data1[0];
  var val1 = data1[1];
  var val2 = data1[2];
  var val3 = data1[3];
  var val4 = data1[4];
  var val5 = data1[5];
  var val6 = data1[6];
  var val7 = data1[7];
  var val8 = data1[8];
  var val9 = data1[9];
  var val10 = data1[10];
  var val11 = data1[11];
  var val12 = data1[12];
  var val13 = data1[13];
  var val14 = data1[14];
  var val15 = data1[15];
  var val16 = data1[16];
  var val17 = data1[17];
  var val18 = data1[18];
  var val19 = data1[19];
  var val20 = data1[20];
  var val21 = data1[21];
  var val22 = data1[22];
  var val23 = data1[23];
  var alu0 = select(val0,val1,(val0<val1));
  var alu1 = select(alu0,val2,(alu0<val2));
  var alu2 = select(alu1,val3,(alu1<val3));
  var alu3 = select(alu2,val4,(alu2<val4));
  var alu4 = select(alu3,val5,(alu3<val5));
  var alu5 = select(alu4,val6,(alu4<val6));
  var alu6 = select(alu5,val7,(alu5<val7));
  var alu7 = select(alu6,val8,(alu6<val8));
  var alu8 = select(alu7,val9,(alu7<val9));
  var alu9 = select(alu8,val10,(alu8<val10));
  var alu10 = select(alu9,val11,(alu9<val11));
  var alu11 = select(alu10,val12,(alu10<val12));
  var alu12 = select(alu11,val13,(alu11<val13));
  var alu13 = select(alu12,val14,(alu12<val14));
  var alu14 = select(alu13,val15,(alu13<val15));
  var alu15 = select(alu14,val16,(alu14<val16));
  var alu16 = select(alu15,val17,(alu15<val17));
  var alu17 = select(alu16,val18,(alu16<val18));
  var alu18 = select(alu17,val19,(alu17<val19));
  var alu19 = select(alu18,val20,(alu18<val20));
  var alu20 = select(alu19,val21,(alu19<val21));
  var alu21 = select(alu20,val22,(alu20<val22));
  var alu22 = select(alu21,val23,(alu21<val23));
  data0[0] = alu22;
}`;

const r_3_8_2161n1 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
@group(0) @binding(4)var<uniform>ctx:i32;
@compute @workgroup_size(8) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 3 */
  var lidx0 = i32(lindex.x); /* 8 */
  var val0 = data2[0];
  var acc0 = 0.0f;
  for (var ridx2 = 0; ridx2 < 2161; ridx2++) {
    var val1 = data1[((ctx*51864)+(gidx0*17288)+(lidx0*2161)+ridx2+-51864)];
    acc0 = (acc0+exp2(((val1-val0)*1.4426950408889634f)));
  }
  var precast0 = gidx0;
  var precast1 = (bitcast<u32>(precast0)<<3u);
  data0[(lidx0+bitcast<i32>(precast1))] = acc0;
}`;

const r_24n1 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@compute @workgroup_size(1) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var val0 = data1[0];
  var val1 = data1[1];
  var val2 = data1[2];
  var val3 = data1[3];
  var val4 = data1[4];
  var val5 = data1[5];
  var val6 = data1[6];
  var val7 = data1[7];
  var val8 = data1[8];
  var val9 = data1[9];
  var val10 = data1[10];
  var val11 = data1[11];
  var val12 = data1[12];
  var val13 = data1[13];
  var val14 = data1[14];
  var val15 = data1[15];
  var val16 = data1[16];
  var val17 = data1[17];
  var val18 = data1[18];
  var val19 = data1[19];
  var val20 = data1[20];
  var val21 = data1[21];
  var val22 = data1[22];
  var val23 = data1[23];
  data0[0] = (1/(val0+val1+val2+val3+val4+val5+val6+val7+val8+val9+val10+val11+val12+val13+val14+val15+val16+val17+val18+val19+val20+val21+val22+val23));
}`;

const E_2161_8_3 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3:array<f32>;
@group(0) @binding(5)var<uniform>ctx:i32;
@compute @workgroup_size(8) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 2161 */
  var lidx0 = i32(lindex.x); /* 8 */
  var val0 = data2[0];
  var val1 = data3[0];
  var alu0 = (gidx0*24);
  var alu1 = (lidx0*3);
  var alu2 = ((ctx*51864)+alu0+alu1);
  var val2 = data1[(alu2+-51864)];
  var val3 = data1[(alu2+-51863)];
  var val4 = data1[(alu2+-51862)];
  var alu3 = (alu0+alu1);
  data0[alu3] = (exp2(((val2-val0)*1.4426950408889634f))*val1);
  data0[(alu3+1)] = (exp2(((val3-val0)*1.4426950408889634f))*val1);
  data0[(alu3+2)] = (exp2(((val4-val0)*1.4426950408889634f))*val1);
}`;

const E_2_2_2_2_2_2_2_2_2_2_2_2_2_2_2_2 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@compute @workgroup_size(2,2,2) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 64 */
  var gidx1 = i32(gindex.y); /* 2 */
  var gidx2 = i32(gindex.z); /* 2 */
  var lidx0 = i32(lindex.x); /* 2 */
  var lidx1 = i32(lindex.y); /* 2 */
  var lidx2 = i32(lindex.z); /* 2 */
  var precast0 = gidx1;
  var precast1 = gidx2;
  var precast2 = lidx0;
  var cast0 = bitcast<u32>(precast0);
  var cast1 = bitcast<u32>(precast1);
  var precast3 = (cast0<<6u);
  var precast4 = (cast0<<9u);
  var precast5 = (cast1<<7u);
  var precast6 = (cast1<<10u);
  var precast7 = (bitcast<u32>(precast2)<<2u);
  var precast8 = (gidx0>>5u);
  var cast2 = bitcast<u32>(precast8);
  var precast9 = (cast2<<5u);
  var precast10 = (cast2<<8u);
  var alu0 = (lidx1<1);
  var alu1 = (alu0!=true);
  var alu2 = (gidx0&1);
  var precast11 = alu2;
  var precast12 = (bitcast<u32>(precast11)<<3u);
  var precast13 = ((gidx0>>1u)&1);
  var cast3 = bitcast<u32>(precast13);
  var precast14 = (cast3<<1u);
  var precast15 = (cast3<<4u);
  var precast16 = ((gidx0>>2u)&1);
  var cast4 = bitcast<u32>(precast16);
  var precast17 = (cast4<<2u);
  var precast18 = (cast4<<5u);
  var precast19 = ((gidx0>>3u)&1);
  var cast5 = bitcast<u32>(precast19);
  var precast20 = (cast5<<3u);
  var precast21 = (cast5<<6u);
  var precast22 = ((gidx0>>4u)&1);
  var cast6 = bitcast<u32>(precast22);
  var precast23 = (cast6<<4u);
  var precast24 = (cast6<<7u);
  var alu3 = (bitcast<i32>(precast4)+bitcast<i32>(precast6)+bitcast<i32>(precast10)+bitcast<i32>(precast24)+bitcast<i32>(precast21)+bitcast<i32>(precast18)+bitcast<i32>(precast15)+bitcast<i32>(precast12)+bitcast<i32>(precast7));
  var alu4 = (lidx2+alu3);
  var val0 = select(0.0f, data1[alu4], alu0);
  var val1 = select(0.0f, data1[(alu4+2048)], alu0);
  var val2 = select(0.0f, data1[(alu4+4096)], alu0);
  var val3 = select(0.0f, data1[(alu4+6144)], alu0);
  var val4 = select(0.0f, data1[(alu4+8192)], alu0);
  var val5 = select(0.0f, data1[(alu4+10240)], alu0);
  var val6 = select(0.0f, data1[(alu4+12288)], alu0);
  var val7 = select(0.0f, data1[(alu4+14336)], alu0);
  var val8 = select(0.0f, data1[(alu4+16384)], alu0);
  var val9 = select(0.0f, data1[(alu4+18432)], alu0);
  var val10 = select(0.0f, data1[(alu4+20480)], alu0);
  var val11 = select(0.0f, data1[(alu4+22528)], alu0);
  var val12 = select(0.0f, data1[(alu4+24576)], alu0);
  var val13 = select(0.0f, data1[(alu4+26624)], alu0);
  var val14 = select(0.0f, data1[(alu4+28672)], alu0);
  var val15 = select(0.0f, data1[(alu4+30720)], alu0);
  var val16 = select(0.0f, data1[(alu4+32768)], alu0);
  var val17 = select(0.0f, data1[(alu4+34816)], alu0);
  var val18 = select(0.0f, data1[(alu4+36864)], alu0);
  var val19 = select(0.0f, data1[(alu4+38912)], alu0);
  var val20 = select(0.0f, data1[(alu4+40960)], alu0);
  var val21 = select(0.0f, data1[(alu4+43008)], alu0);
  var val22 = select(0.0f, data1[(alu4+45056)], alu0);
  var val23 = select(0.0f, data1[(alu4+47104)], alu0);
  var val24 = select(0.0f, data1[(alu4+49152)], alu0);
  var alu5 = (alu0&((bitcast<i32>(precast3)+bitcast<i32>(precast5)+bitcast<i32>(precast9)+bitcast<i32>(precast23)+bitcast<i32>(precast20)+bitcast<i32>(precast17)+bitcast<i32>(precast14)+alu2)<83));
  var val25 = select(0.0f, data1[(alu4+51200)], alu5);
  var alu6 = (alu3-lidx2);
  var val26 = select(0.0f, data1[(alu6+3)], alu1);
  var val27 = select(0.0f, data1[(alu6+2051)], alu1);
  var val28 = select(0.0f, data1[(alu6+4099)], alu1);
  var val29 = select(0.0f, data1[(alu6+6147)], alu1);
  var val30 = select(0.0f, data1[(alu6+8195)], alu1);
  var val31 = select(0.0f, data1[(alu6+10243)], alu1);
  var val32 = select(0.0f, data1[(alu6+12291)], alu1);
  var val33 = select(0.0f, data1[(alu6+14339)], alu1);
  var val34 = select(0.0f, data1[(alu6+16387)], alu1);
  var val35 = select(0.0f, data1[(alu6+18435)], alu1);
  var val36 = select(0.0f, data1[(alu6+20483)], alu1);
  var val37 = select(0.0f, data1[(alu6+22531)], alu1);
  var val38 = select(0.0f, data1[(alu6+24579)], alu1);
  var val39 = select(0.0f, data1[(alu6+26627)], alu1);
  var val40 = select(0.0f, data1[(alu6+28675)], alu1);
  var val41 = select(0.0f, data1[(alu6+30723)], alu1);
  var val42 = select(0.0f, data1[(alu6+32771)], alu1);
  var val43 = select(0.0f, data1[(alu6+34819)], alu1);
  var val44 = select(0.0f, data1[(alu6+36867)], alu1);
  var val45 = select(0.0f, data1[(alu6+38915)], alu1);
  var val46 = select(0.0f, data1[(alu6+40963)], alu1);
  var val47 = select(0.0f, data1[(alu6+43011)], alu1);
  var val48 = select(0.0f, data1[(alu6+45059)], alu1);
  var val49 = select(0.0f, data1[(alu6+47107)], alu1);
  var val50 = select(0.0f, data1[(alu6+49155)], alu1);
  var alu7 = (alu1&(alu6<661));
  var val51 = select(0.0f, data1[(alu6+51203)], alu7);
  var precast25 = lidx1;
  var precast26 = (bitcast<u32>(precast25)<<1u);
  var alu8 = (lidx2+alu3+bitcast<i32>(precast26));
  data0[(alu8+53248)] = (f32(-INFINITY));
  data0[(alu8+55296)] = (f32(-INFINITY));
  data0[(alu8+57344)] = (f32(-INFINITY));
  data0[(alu8+59392)] = (f32(-INFINITY));
  data0[(alu8+61440)] = (f32(-INFINITY));
  data0[(alu8+63488)] = (f32(-INFINITY));
  var alu15 = select(0.0f,(f32(-INFINITY)),alu0);
  var alu16 = select(alu15,0.0f,alu0);
  var alu17 = select((f32(-INFINITY)),0.0f,alu0);
  var alu18 = select(0.0f,alu17,alu0);
  data0[alu8] = (val0+alu16+val26+alu18);
  data0[(alu8+2048)] = (val1+alu16+val27+alu18);
  data0[(alu8+4096)] = (val2+alu16+val28+alu18);
  data0[(alu8+6144)] = (val3+alu16+val29+alu18);
  data0[(alu8+8192)] = (val4+alu16+val30+alu18);
  data0[(alu8+10240)] = (val5+alu16+val31+alu18);
  data0[(alu8+12288)] = (val6+alu16+val32+alu18);
  data0[(alu8+14336)] = (val7+alu16+val33+alu18);
  data0[(alu8+16384)] = (val8+alu16+val34+alu18);
  data0[(alu8+18432)] = (val9+alu16+val35+alu18);
  data0[(alu8+20480)] = (val10+alu16+val36+alu18);
  data0[(alu8+22528)] = (val11+alu16+val37+alu18);
  data0[(alu8+24576)] = (val12+alu16+val38+alu18);
  data0[(alu8+26624)] = (val13+alu16+val39+alu18);
  data0[(alu8+28672)] = (val14+alu16+val40+alu18);
  data0[(alu8+30720)] = (val15+alu16+val41+alu18);
  data0[(alu8+32768)] = (val16+alu16+val42+alu18);
  data0[(alu8+34816)] = (val17+alu16+val43+alu18);
  data0[(alu8+36864)] = (val18+alu16+val44+alu18);
  data0[(alu8+38912)] = (val19+alu16+val45+alu18);
  data0[(alu8+40960)] = (val20+alu16+val46+alu18);
  data0[(alu8+43008)] = (val21+alu16+val47+alu18);
  data0[(alu8+45056)] = (val22+alu16+val48+alu18);
  data0[(alu8+47104)] = (val23+alu16+val49+alu18);
  data0[(alu8+49152)] = (val24+alu16+val50+alu18);
  var alu44 = select(alu15,0.0f,alu5);
  var alu45 = select(alu17,0.0f,alu7);
  data0[(alu8+51200)] = (val25+alu44+val51+alu45);
}`;

const r_2161_8_8_2161_3_3 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<i32>;
@group(0) @binding(2)var<storage,read_write>data1:array<i32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
@compute @workgroup_size(8,8) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 2161 */
  var lidx0 = i32(lindex.x); /* 8 */
  var lidx1 = i32(lindex.y); /* 8 */
  var alu0 = ((gidx0*24)+(lidx0*3));
  var val0 = data1[alu0];
  var val1 = data2[alu0];
  var alu1 = (alu0+1);
  var val2 = data1[alu1];
  var val3 = data2[alu1];
  var alu2 = (alu0+2);
  var val4 = data1[alu2];
  var val5 = data2[alu2];
  var acc0 = 0;
  var acc1 = 0;
  var acc2 = 0;
  var acc3 = 0;
  var acc4 = 0;
  var acc5 = 0;
  var acc6 = 0;
  var acc7 = 0;
  var acc8 = 0;
  for (var ridx3 = 0; ridx3 < 2161; ridx3++) {
    var alu3 = ((lidx1*6483)+ridx3);
    var val6 = data1[alu3];
    var val7 = data2[alu3];
    var alu4 = (alu3+2161);
    var val8 = data1[alu4];
    var val9 = data2[alu4];
    var alu5 = (alu3+4322);
    var val10 = data1[alu5];
    var val11 = data2[alu5];
    acc4 = (acc4+(i32((((val2<val8)!=true)&((val9!=val3)!=true)))));
    acc7 = (acc7+(i32((((val2<val10)!=true)&((val11!=val3)!=true)))));
    acc1 = (acc1+(i32((((val2<val6)!=true)&((val7!=val3)!=true)))));
    acc5 = (acc5+(i32((((val4<val8)!=true)&((val9!=val5)!=true)))));
    acc8 = (acc8+(i32((((val4<val10)!=true)&((val11!=val5)!=true)))));
    acc2 = (acc2+(i32((((val4<val6)!=true)&((val7!=val5)!=true)))));
    acc3 = (acc3+(i32((((val0<val8)!=true)&((val9!=val1)!=true)))));
    acc6 = (acc6+(i32((((val0<val10)!=true)&((val11!=val1)!=true)))));
    acc0 = (acc0+(i32((((val0<val6)!=true)&((val7!=val1)!=true)))));
  }
  var alu16 = ((gidx0*576)+(lidx0*72)+(lidx1*3));
  data0[alu16] = acc0;
  data0[(alu16+1)] = acc3;
  data0[(alu16+2)] = acc6;
  data0[(alu16+24)] = acc1;
  data0[(alu16+25)] = acc4;
  data0[(alu16+26)] = acc7;
  data0[(alu16+48)] = acc2;
  data0[(alu16+49)] = acc5;
  data0[(alu16+50)] = acc8;
}`;

const E_1024_32_2 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@compute @workgroup_size(32) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 1024 */
  var lidx0 = i32(lindex.x); /* 32 */
  var precast0 = gidx0;
  var precast1 = lidx0;
  var precast2 = (bitcast<u32>(precast0)<<6u);
  var precast3 = (bitcast<u32>(precast1)<<1u);
  var alu0 = (bitcast<i32>(precast2)+bitcast<i32>(precast3));
  var val0 = data1[alu0];
  var alu1 = (alu0+1);
  var val1 = data1[alu1];
  var alu2 = -val0;
  var alu3 = -val1;
  var alu4 = select(alu2,alu3,(alu2<alu3));
  data0[alu1] = -alu4;
  var alu6 = select(val0,val1,(val0<val1));
  data0[alu0] = alu6;
}`;

const r_2161_8_3_24 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<i32>;
@group(0) @binding(2)var<storage,read_write>data1:array<i32>;
@compute @workgroup_size(8) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 2161 */
  var lidx0 = i32(lindex.x); /* 8 */
  var alu0 = ((gidx0*576)+(lidx0*72));
  var val0 = data1[alu0];
  var val1 = data1[(alu0+1)];
  var val2 = data1[(alu0+2)];
  var val3 = data1[(alu0+3)];
  var val4 = data1[(alu0+4)];
  var val5 = data1[(alu0+5)];
  var val6 = data1[(alu0+6)];
  var val7 = data1[(alu0+7)];
  var val8 = data1[(alu0+8)];
  var val9 = data1[(alu0+9)];
  var val10 = data1[(alu0+10)];
  var val11 = data1[(alu0+11)];
  var val12 = data1[(alu0+12)];
  var val13 = data1[(alu0+13)];
  var val14 = data1[(alu0+14)];
  var val15 = data1[(alu0+15)];
  var val16 = data1[(alu0+16)];
  var val17 = data1[(alu0+17)];
  var val18 = data1[(alu0+18)];
  var val19 = data1[(alu0+19)];
  var val20 = data1[(alu0+20)];
  var val21 = data1[(alu0+21)];
  var val22 = data1[(alu0+22)];
  var val23 = data1[(alu0+23)];
  var val24 = data1[(alu0+24)];
  var val25 = data1[(alu0+25)];
  var val26 = data1[(alu0+26)];
  var val27 = data1[(alu0+27)];
  var val28 = data1[(alu0+28)];
  var val29 = data1[(alu0+29)];
  var val30 = data1[(alu0+30)];
  var val31 = data1[(alu0+31)];
  var val32 = data1[(alu0+32)];
  var val33 = data1[(alu0+33)];
  var val34 = data1[(alu0+34)];
  var val35 = data1[(alu0+35)];
  var val36 = data1[(alu0+36)];
  var val37 = data1[(alu0+37)];
  var val38 = data1[(alu0+38)];
  var val39 = data1[(alu0+39)];
  var val40 = data1[(alu0+40)];
  var val41 = data1[(alu0+41)];
  var val42 = data1[(alu0+42)];
  var val43 = data1[(alu0+43)];
  var val44 = data1[(alu0+44)];
  var val45 = data1[(alu0+45)];
  var val46 = data1[(alu0+46)];
  var val47 = data1[(alu0+47)];
  var val48 = data1[(alu0+48)];
  var val49 = data1[(alu0+49)];
  var val50 = data1[(alu0+50)];
  var val51 = data1[(alu0+51)];
  var val52 = data1[(alu0+52)];
  var val53 = data1[(alu0+53)];
  var val54 = data1[(alu0+54)];
  var val55 = data1[(alu0+55)];
  var val56 = data1[(alu0+56)];
  var val57 = data1[(alu0+57)];
  var val58 = data1[(alu0+58)];
  var val59 = data1[(alu0+59)];
  var val60 = data1[(alu0+60)];
  var val61 = data1[(alu0+61)];
  var val62 = data1[(alu0+62)];
  var val63 = data1[(alu0+63)];
  var val64 = data1[(alu0+64)];
  var val65 = data1[(alu0+65)];
  var val66 = data1[(alu0+66)];
  var val67 = data1[(alu0+67)];
  var val68 = data1[(alu0+68)];
  var val69 = data1[(alu0+69)];
  var val70 = data1[(alu0+70)];
  var val71 = data1[(alu0+71)];
  var alu1 = ((gidx0*24)+(lidx0*3));
  data0[alu1] = (val23+val22+val21+val20+val19+val18+val17+val16+val15+val14+val13+val12+val11+val10+val9+val8+val7+val6+val5+val4+val3+val2+val1+val0);
  data0[(alu1+1)] = (val47+val46+val45+val44+val43+val42+val41+val40+val39+val38+val37+val36+val35+val34+val33+val32+val31+val30+val29+val28+val27+val26+val24+val25);
  data0[(alu1+2)] = (val71+val70+val69+val68+val67+val66+val65+val64+val63+val62+val61+val60+val59+val58+val57+val56+val55+val54+val53+val52+val51+val50+val48+val49);
}`;

const E_256_32_2_2_2 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@compute @workgroup_size(32,2) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 256 */
  var lidx0 = i32(lindex.x); /* 32 */
  var lidx1 = i32(lindex.y); /* 2 */
  var precast0 = gidx0;
  var precast1 = lidx0;
  var precast2 = (bitcast<u32>(precast0)<<8u);
  var precast3 = (bitcast<u32>(precast1)<<3u);
  var alu0 = (bitcast<i32>(precast2)+bitcast<i32>(precast3));
  var alu1 = (lidx1+alu0);
  var val0 = data1[alu1];
  var alu2 = (alu1+6);
  var val1 = data1[alu2];
  var alu3 = (alu0-lidx1);
  var val2 = data1[(alu3+3)];
  var val3 = data1[(alu3+5)];
  data0[alu1] = val0;
  data0[alu2] = val3;
  data0[(alu1+2)] = val2;
  data0[(alu1+4)] = val1;
}`;

const E_512_32_2_2 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@compute @workgroup_size(32,2) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 512 */
  var lidx0 = i32(lindex.x); /* 32 */
  var lidx1 = i32(lindex.y); /* 2 */
  var precast0 = gidx0;
  var precast1 = lidx0;
  var precast2 = (bitcast<u32>(precast0)<<7u);
  var precast3 = (bitcast<u32>(precast1)<<2u);
  var alu0 = (lidx1+bitcast<i32>(precast2)+bitcast<i32>(precast3));
  var val0 = data1[alu0];
  var alu1 = (alu0+2);
  var val1 = data1[alu1];
  var alu2 = -val0;
  var alu3 = -val1;
  var alu4 = select(alu2,alu3,(alu2<alu3));
  data0[alu1] = -alu4;
  var alu6 = select(val0,val1,(val0<val1));
  data0[alu0] = alu6;
}`;

const E_128_32_4_2_2 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@compute @workgroup_size(32,4) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 128 */
  var lidx0 = i32(lindex.x); /* 32 */
  var lidx1 = i32(lindex.y); /* 4 */
  var precast0 = gidx0;
  var precast1 = lidx0;
  var precast2 = (bitcast<u32>(precast0)<<9u);
  var precast3 = (bitcast<u32>(precast1)<<4u);
  var alu0 = (bitcast<i32>(precast2)+bitcast<i32>(precast3));
  var alu1 = (lidx1+alu0);
  var val0 = data1[alu1];
  var alu2 = (alu1+12);
  var val1 = data1[alu2];
  var alu3 = (alu0-lidx1);
  var val2 = data1[(alu3+7)];
  var val3 = data1[(alu3+11)];
  data0[alu1] = val0;
  data0[alu2] = val3;
  data0[(alu1+4)] = val2;
  data0[(alu1+8)] = val1;
}`;

const E_256_32_4_2 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@compute @workgroup_size(32,4) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 256 */
  var lidx0 = i32(lindex.x); /* 32 */
  var lidx1 = i32(lindex.y); /* 4 */
  var precast0 = gidx0;
  var precast1 = lidx0;
  var precast2 = (bitcast<u32>(precast0)<<8u);
  var precast3 = (bitcast<u32>(precast1)<<3u);
  var alu0 = (lidx1+bitcast<i32>(precast2)+bitcast<i32>(precast3));
  var val0 = data1[alu0];
  var alu1 = (alu0+4);
  var val1 = data1[alu1];
  var alu2 = -val0;
  var alu3 = -val1;
  var alu4 = select(alu2,alu3,(alu2<alu3));
  data0[alu1] = -alu4;
  var alu6 = select(val0,val1,(val0<val1));
  data0[alu0] = alu6;
}`;

const E_128_16_8_2_2 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@compute @workgroup_size(16,8) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 128 */
  var lidx0 = i32(lindex.x); /* 16 */
  var lidx1 = i32(lindex.y); /* 8 */
  var precast0 = gidx0;
  var precast1 = lidx0;
  var precast2 = (bitcast<u32>(precast0)<<9u);
  var precast3 = (bitcast<u32>(precast1)<<5u);
  var alu0 = (bitcast<i32>(precast2)+bitcast<i32>(precast3));
  var alu1 = (lidx1+alu0);
  var val0 = data1[alu1];
  var alu2 = (alu1+24);
  var val1 = data1[alu2];
  var alu3 = (alu0-lidx1);
  var val2 = data1[(alu3+15)];
  var val3 = data1[(alu3+23)];
  data0[alu1] = val0;
  data0[alu2] = val3;
  data0[(alu1+8)] = val2;
  data0[(alu1+16)] = val1;
}`;

const E_256_16_8_2 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@compute @workgroup_size(16,8) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 256 */
  var lidx0 = i32(lindex.x); /* 16 */
  var lidx1 = i32(lindex.y); /* 8 */
  var precast0 = gidx0;
  var precast1 = lidx0;
  var precast2 = (bitcast<u32>(precast0)<<8u);
  var precast3 = (bitcast<u32>(precast1)<<4u);
  var alu0 = (lidx1+bitcast<i32>(precast2)+bitcast<i32>(precast3));
  var val0 = data1[alu0];
  var alu1 = (alu0+8);
  var val1 = data1[alu1];
  var alu2 = -val0;
  var alu3 = -val1;
  var alu4 = select(alu2,alu3,(alu2<alu3));
  data0[alu1] = -alu4;
  var alu6 = select(val0,val1,(val0<val1));
  data0[alu0] = alu6;
}`;

const E_128_8_16_2_2 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@compute @workgroup_size(8,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 128 */
  var lidx0 = i32(lindex.x); /* 8 */
  var lidx1 = i32(lindex.y); /* 16 */
  var precast0 = gidx0;
  var precast1 = lidx0;
  var precast2 = (bitcast<u32>(precast0)<<9u);
  var precast3 = (bitcast<u32>(precast1)<<6u);
  var alu0 = (bitcast<i32>(precast2)+bitcast<i32>(precast3));
  var alu1 = (lidx1+alu0);
  var val0 = data1[alu1];
  var alu2 = (alu1+48);
  var val1 = data1[alu2];
  var alu3 = (alu0-lidx1);
  var val2 = data1[(alu3+31)];
  var val3 = data1[(alu3+47)];
  data0[alu1] = val0;
  data0[alu2] = val3;
  data0[(alu1+16)] = val2;
  data0[(alu1+32)] = val1;
}`;

const E_256_8_16_2 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@compute @workgroup_size(8,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 256 */
  var lidx0 = i32(lindex.x); /* 8 */
  var lidx1 = i32(lindex.y); /* 16 */
  var precast0 = gidx0;
  var precast1 = lidx0;
  var precast2 = (bitcast<u32>(precast0)<<8u);
  var precast3 = (bitcast<u32>(precast1)<<5u);
  var alu0 = (lidx1+bitcast<i32>(precast2)+bitcast<i32>(precast3));
  var val0 = data1[alu0];
  var alu1 = (alu0+16);
  var val1 = data1[alu1];
  var alu2 = -val0;
  var alu3 = -val1;
  var alu4 = select(alu2,alu3,(alu2<alu3));
  data0[alu1] = -alu4;
  var alu6 = select(val0,val1,(val0<val1));
  data0[alu0] = alu6;
}`;

const E_64_2_8_16_2_2 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@compute @workgroup_size(8,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 2 */
  var gidx1 = i32(gindex.y); /* 64 */
  var lidx0 = i32(lindex.x); /* 8 */
  var lidx1 = i32(lindex.y); /* 16 */
  var precast0 = gidx0;
  var precast1 = gidx1;
  var precast2 = lidx0;
  var precast3 = (bitcast<u32>(precast0)<<4u);
  var precast4 = (bitcast<u32>(precast1)<<10u);
  var cast0 = bitcast<i32>(precast4);
  var precast5 = (bitcast<u32>(precast2)<<7u);
  var cast1 = bitcast<i32>(precast5);
  var alu0 = (lidx1+bitcast<i32>(precast3)+cast0+cast1);
  var val0 = data1[alu0];
  var alu1 = (alu0+96);
  var val1 = data1[alu1];
  var alu2 = (((gidx0*-16)+cast0+cast1)-lidx1);
  var val2 = data1[(alu2+63)];
  var val3 = data1[(alu2+95)];
  data0[alu0] = val0;
  data0[alu1] = val3;
  data0[(alu0+32)] = val2;
  data0[(alu0+64)] = val1;
}`;

const E_128_2_8_16_2 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@compute @workgroup_size(8,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 2 */
  var gidx1 = i32(gindex.y); /* 128 */
  var lidx0 = i32(lindex.x); /* 8 */
  var lidx1 = i32(lindex.y); /* 16 */
  var precast0 = gidx0;
  var precast1 = gidx1;
  var precast2 = lidx0;
  var precast3 = (bitcast<u32>(precast0)<<4u);
  var precast4 = (bitcast<u32>(precast1)<<9u);
  var precast5 = (bitcast<u32>(precast2)<<6u);
  var alu0 = (lidx1+bitcast<i32>(precast3)+bitcast<i32>(precast4)+bitcast<i32>(precast5));
  var val0 = data1[alu0];
  var alu1 = (alu0+32);
  var val1 = data1[alu1];
  var alu2 = -val0;
  var alu3 = -val1;
  var alu4 = select(alu2,alu3,(alu2<alu3));
  data0[alu1] = -alu4;
  var alu6 = select(val0,val1,(val0<val1));
  data0[alu0] = alu6;
}`;

const E_32_4_8_16_2_2 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@compute @workgroup_size(8,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 4 */
  var gidx1 = i32(gindex.y); /* 32 */
  var lidx0 = i32(lindex.x); /* 8 */
  var lidx1 = i32(lindex.y); /* 16 */
  var precast0 = gidx0;
  var precast1 = gidx1;
  var precast2 = lidx0;
  var precast3 = (bitcast<u32>(precast0)<<4u);
  var precast4 = (bitcast<u32>(precast1)<<11u);
  var cast0 = bitcast<i32>(precast4);
  var precast5 = (bitcast<u32>(precast2)<<8u);
  var cast1 = bitcast<i32>(precast5);
  var alu0 = (lidx1+bitcast<i32>(precast3)+cast0+cast1);
  var val0 = data1[alu0];
  var alu1 = (alu0+192);
  var val1 = data1[alu1];
  var alu2 = (((gidx0*-16)+cast0+cast1)-lidx1);
  var val2 = data1[(alu2+127)];
  var val3 = data1[(alu2+191)];
  data0[alu0] = val0;
  data0[alu1] = val3;
  data0[(alu0+64)] = val2;
  data0[(alu0+128)] = val1;
}`;

const E_64_4_8_16_2 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@compute @workgroup_size(8,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 4 */
  var gidx1 = i32(gindex.y); /* 64 */
  var lidx0 = i32(lindex.x); /* 8 */
  var lidx1 = i32(lindex.y); /* 16 */
  var precast0 = gidx0;
  var precast1 = gidx1;
  var precast2 = lidx0;
  var precast3 = (bitcast<u32>(precast0)<<4u);
  var precast4 = (bitcast<u32>(precast1)<<10u);
  var precast5 = (bitcast<u32>(precast2)<<7u);
  var alu0 = (lidx1+bitcast<i32>(precast3)+bitcast<i32>(precast4)+bitcast<i32>(precast5));
  var val0 = data1[alu0];
  var alu1 = (alu0+64);
  var val1 = data1[alu1];
  var alu2 = -val0;
  var alu3 = -val1;
  var alu4 = select(alu2,alu3,(alu2<alu3));
  data0[alu1] = -alu4;
  var alu6 = select(val0,val1,(val0<val1));
  data0[alu0] = alu6;
}`;

const E_16_8_8_16_2_2 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@compute @workgroup_size(8,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 8 */
  var gidx1 = i32(gindex.y); /* 16 */
  var lidx0 = i32(lindex.x); /* 8 */
  var lidx1 = i32(lindex.y); /* 16 */
  var precast0 = gidx0;
  var precast1 = gidx1;
  var precast2 = lidx0;
  var precast3 = (bitcast<u32>(precast0)<<4u);
  var precast4 = (bitcast<u32>(precast1)<<12u);
  var cast0 = bitcast<i32>(precast4);
  var precast5 = (bitcast<u32>(precast2)<<9u);
  var cast1 = bitcast<i32>(precast5);
  var alu0 = (lidx1+bitcast<i32>(precast3)+cast0+cast1);
  var val0 = data1[alu0];
  var alu1 = (alu0+384);
  var val1 = data1[alu1];
  var alu2 = (((gidx0*-16)+cast0+cast1)-lidx1);
  var val2 = data1[(alu2+255)];
  var val3 = data1[(alu2+383)];
  data0[alu0] = val0;
  data0[alu1] = val3;
  data0[(alu0+128)] = val2;
  data0[(alu0+256)] = val1;
}`;

const E_32_8_8_16_2 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@compute @workgroup_size(8,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 8 */
  var gidx1 = i32(gindex.y); /* 32 */
  var lidx0 = i32(lindex.x); /* 8 */
  var lidx1 = i32(lindex.y); /* 16 */
  var precast0 = gidx0;
  var precast1 = gidx1;
  var precast2 = lidx0;
  var precast3 = (bitcast<u32>(precast0)<<4u);
  var precast4 = (bitcast<u32>(precast1)<<11u);
  var precast5 = (bitcast<u32>(precast2)<<8u);
  var alu0 = (lidx1+bitcast<i32>(precast3)+bitcast<i32>(precast4)+bitcast<i32>(precast5));
  var val0 = data1[alu0];
  var alu1 = (alu0+128);
  var val1 = data1[alu1];
  var alu2 = -val0;
  var alu3 = -val1;
  var alu4 = select(alu2,alu3,(alu2<alu3));
  data0[alu1] = -alu4;
  var alu6 = select(val0,val1,(val0<val1));
  data0[alu0] = alu6;
}`;

const E_8_16_8_16_2_2 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@compute @workgroup_size(8,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 16 */
  var gidx1 = i32(gindex.y); /* 8 */
  var lidx0 = i32(lindex.x); /* 8 */
  var lidx1 = i32(lindex.y); /* 16 */
  var precast0 = gidx0;
  var precast1 = gidx1;
  var precast2 = lidx0;
  var precast3 = (bitcast<u32>(precast0)<<4u);
  var precast4 = (bitcast<u32>(precast1)<<13u);
  var cast0 = bitcast<i32>(precast4);
  var precast5 = (bitcast<u32>(precast2)<<10u);
  var cast1 = bitcast<i32>(precast5);
  var alu0 = (lidx1+bitcast<i32>(precast3)+cast0+cast1);
  var val0 = data1[alu0];
  var alu1 = (alu0+768);
  var val1 = data1[alu1];
  var alu2 = (((gidx0*-16)+cast0+cast1)-lidx1);
  var val2 = data1[(alu2+511)];
  var val3 = data1[(alu2+767)];
  data0[alu0] = val0;
  data0[alu1] = val3;
  data0[(alu0+256)] = val2;
  data0[(alu0+512)] = val1;
}`;

const E_16_16_8_16_2 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@compute @workgroup_size(8,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 16 */
  var gidx1 = i32(gindex.y); /* 16 */
  var lidx0 = i32(lindex.x); /* 8 */
  var lidx1 = i32(lindex.y); /* 16 */
  var precast0 = gidx0;
  var precast1 = gidx1;
  var precast2 = lidx0;
  var precast3 = (bitcast<u32>(precast0)<<4u);
  var precast4 = (bitcast<u32>(precast1)<<12u);
  var precast5 = (bitcast<u32>(precast2)<<9u);
  var alu0 = (lidx1+bitcast<i32>(precast3)+bitcast<i32>(precast4)+bitcast<i32>(precast5));
  var val0 = data1[alu0];
  var alu1 = (alu0+256);
  var val1 = data1[alu1];
  var alu2 = -val0;
  var alu3 = -val1;
  var alu4 = select(alu2,alu3,(alu2<alu3));
  data0[alu1] = -alu4;
  var alu6 = select(val0,val1,(val0<val1));
  data0[alu0] = alu6;
}`;

const E_4_32_8_16_2_2 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@compute @workgroup_size(8,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 32 */
  var gidx1 = i32(gindex.y); /* 4 */
  var lidx0 = i32(lindex.x); /* 8 */
  var lidx1 = i32(lindex.y); /* 16 */
  var precast0 = gidx0;
  var precast1 = gidx1;
  var precast2 = lidx0;
  var precast3 = (bitcast<u32>(precast0)<<4u);
  var precast4 = (bitcast<u32>(precast1)<<14u);
  var cast0 = bitcast<i32>(precast4);
  var precast5 = (bitcast<u32>(precast2)<<11u);
  var cast1 = bitcast<i32>(precast5);
  var alu0 = (lidx1+bitcast<i32>(precast3)+cast0+cast1);
  var val0 = data1[alu0];
  var alu1 = (alu0+1536);
  var val1 = data1[alu1];
  var alu2 = (((gidx0*-16)+cast0+cast1)-lidx1);
  var val2 = data1[(alu2+1023)];
  var val3 = data1[(alu2+1535)];
  data0[alu0] = val0;
  data0[alu1] = val3;
  data0[(alu0+512)] = val2;
  data0[(alu0+1024)] = val1;
}`;

const E_8_32_8_16_2 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@compute @workgroup_size(8,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 32 */
  var gidx1 = i32(gindex.y); /* 8 */
  var lidx0 = i32(lindex.x); /* 8 */
  var lidx1 = i32(lindex.y); /* 16 */
  var precast0 = gidx0;
  var precast1 = gidx1;
  var precast2 = lidx0;
  var precast3 = (bitcast<u32>(precast0)<<4u);
  var precast4 = (bitcast<u32>(precast1)<<13u);
  var precast5 = (bitcast<u32>(precast2)<<10u);
  var alu0 = (lidx1+bitcast<i32>(precast3)+bitcast<i32>(precast4)+bitcast<i32>(precast5));
  var val0 = data1[alu0];
  var alu1 = (alu0+512);
  var val1 = data1[alu1];
  var alu2 = -val0;
  var alu3 = -val1;
  var alu4 = select(alu2,alu3,(alu2<alu3));
  data0[alu1] = -alu4;
  var alu6 = select(val0,val1,(val0<val1));
  data0[alu0] = alu6;
}`;

const E_2_64_8_16_2_2 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@compute @workgroup_size(8,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 64 */
  var gidx1 = i32(gindex.y); /* 2 */
  var lidx0 = i32(lindex.x); /* 8 */
  var lidx1 = i32(lindex.y); /* 16 */
  var precast0 = gidx0;
  var precast1 = gidx1;
  var precast2 = lidx0;
  var precast3 = (bitcast<u32>(precast0)<<4u);
  var precast4 = (bitcast<u32>(precast1)<<15u);
  var cast0 = bitcast<i32>(precast4);
  var precast5 = (bitcast<u32>(precast2)<<12u);
  var cast1 = bitcast<i32>(precast5);
  var alu0 = (lidx1+bitcast<i32>(precast3)+cast0+cast1);
  var val0 = data1[alu0];
  var alu1 = (alu0+3072);
  var val1 = data1[alu1];
  var alu2 = (((gidx0*-16)+cast0+cast1)-lidx1);
  var val2 = data1[(alu2+2047)];
  var val3 = data1[(alu2+3071)];
  data0[alu0] = val0;
  data0[alu1] = val3;
  data0[(alu0+1024)] = val2;
  data0[(alu0+2048)] = val1;
}`;

const E_4_64_8_16_2 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@compute @workgroup_size(8,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 64 */
  var gidx1 = i32(gindex.y); /* 4 */
  var lidx0 = i32(lindex.x); /* 8 */
  var lidx1 = i32(lindex.y); /* 16 */
  var precast0 = gidx0;
  var precast1 = gidx1;
  var precast2 = lidx0;
  var precast3 = (bitcast<u32>(precast0)<<4u);
  var precast4 = (bitcast<u32>(precast1)<<14u);
  var precast5 = (bitcast<u32>(precast2)<<11u);
  var alu0 = (lidx1+bitcast<i32>(precast3)+bitcast<i32>(precast4)+bitcast<i32>(precast5));
  var val0 = data1[alu0];
  var alu1 = (alu0+1024);
  var val1 = data1[alu1];
  var alu2 = -val0;
  var alu3 = -val1;
  var alu4 = select(alu2,alu3,(alu2<alu3));
  data0[alu1] = -alu4;
  var alu6 = select(val0,val1,(val0<val1));
  data0[alu0] = alu6;
}`;

const E_128_8_16_2_2n1 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@compute @workgroup_size(8,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 128 */
  var lidx0 = i32(lindex.x); /* 8 */
  var lidx1 = i32(lindex.y); /* 16 */
  var precast0 = gidx0;
  var precast1 = lidx0;
  var precast2 = (bitcast<u32>(precast0)<<4u);
  var precast3 = (bitcast<u32>(precast1)<<13u);
  var cast0 = bitcast<i32>(precast3);
  var alu0 = (lidx1+bitcast<i32>(precast2)+cast0);
  var val0 = data1[alu0];
  var alu1 = (alu0+6144);
  var val1 = data1[alu1];
  var alu2 = (((gidx0*-16)+cast0)-lidx1);
  var val2 = data1[(alu2+4095)];
  var val3 = data1[(alu2+6143)];
  data0[alu0] = val0;
  data0[alu1] = val3;
  data0[(alu0+2048)] = val2;
  data0[(alu0+4096)] = val1;
}`;

const E_2_128_8_16_2 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@compute @workgroup_size(8,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 128 */
  var gidx1 = i32(gindex.y); /* 2 */
  var lidx0 = i32(lindex.x); /* 8 */
  var lidx1 = i32(lindex.y); /* 16 */
  var precast0 = gidx0;
  var precast1 = gidx1;
  var precast2 = lidx0;
  var precast3 = (bitcast<u32>(precast0)<<4u);
  var precast4 = (bitcast<u32>(precast1)<<15u);
  var precast5 = (bitcast<u32>(precast2)<<12u);
  var alu0 = (lidx1+bitcast<i32>(precast3)+bitcast<i32>(precast4)+bitcast<i32>(precast5));
  var val0 = data1[alu0];
  var alu1 = (alu0+2048);
  var val1 = data1[alu1];
  var alu2 = -val0;
  var alu3 = -val1;
  var alu4 = select(alu2,alu3,(alu2<alu3));
  data0[alu1] = -alu4;
  var alu6 = select(val0,val1,(val0<val1));
  data0[alu0] = alu6;
}`;

const E_256_4_16_2_2 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@compute @workgroup_size(4,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 256 */
  var lidx0 = i32(lindex.x); /* 4 */
  var lidx1 = i32(lindex.y); /* 16 */
  var precast0 = gidx0;
  var precast1 = lidx0;
  var precast2 = (bitcast<u32>(precast0)<<4u);
  var precast3 = (bitcast<u32>(precast1)<<14u);
  var cast0 = bitcast<i32>(precast3);
  var alu0 = (lidx1+bitcast<i32>(precast2)+cast0);
  var val0 = data1[alu0];
  var alu1 = (alu0+12288);
  var val1 = data1[alu1];
  var alu2 = (((gidx0*-16)+cast0)-lidx1);
  var val2 = data1[(alu2+8191)];
  var val3 = data1[(alu2+12287)];
  data0[alu0] = val0;
  data0[alu1] = val3;
  data0[(alu0+4096)] = val2;
  data0[(alu0+8192)] = val1;
}`;

const E_256_8_16_2n1 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@compute @workgroup_size(8,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 256 */
  var lidx0 = i32(lindex.x); /* 8 */
  var lidx1 = i32(lindex.y); /* 16 */
  var precast0 = gidx0;
  var precast1 = lidx0;
  var precast2 = (bitcast<u32>(precast0)<<4u);
  var precast3 = (bitcast<u32>(precast1)<<13u);
  var alu0 = (lidx1+bitcast<i32>(precast2)+bitcast<i32>(precast3));
  var val0 = data1[alu0];
  var alu1 = (alu0+4096);
  var val1 = data1[alu1];
  var alu2 = -val0;
  var alu3 = -val1;
  var alu4 = select(alu2,alu3,(alu2<alu3));
  data0[alu1] = -alu4;
  var alu6 = select(val0,val1,(val0<val1));
  data0[alu0] = alu6;
}`;

const E_512_2_16_2_2 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@compute @workgroup_size(2,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 512 */
  var lidx0 = i32(lindex.x); /* 2 */
  var lidx1 = i32(lindex.y); /* 16 */
  var precast0 = gidx0;
  var precast1 = lidx0;
  var precast2 = (bitcast<u32>(precast0)<<4u);
  var precast3 = (bitcast<u32>(precast1)<<15u);
  var cast0 = bitcast<i32>(precast3);
  var alu0 = (lidx1+bitcast<i32>(precast2)+cast0);
  var val0 = data1[alu0];
  var alu1 = (alu0+24576);
  var val1 = data1[alu1];
  var alu2 = (((gidx0*-16)+cast0)-lidx1);
  var val2 = data1[(alu2+16383)];
  var val3 = data1[(alu2+24575)];
  data0[alu0] = val0;
  data0[alu1] = val3;
  data0[(alu0+8192)] = val2;
  data0[(alu0+16384)] = val1;
}`;

const E_512_4_16_2 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@compute @workgroup_size(4,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 512 */
  var lidx0 = i32(lindex.x); /* 4 */
  var lidx1 = i32(lindex.y); /* 16 */
  var precast0 = gidx0;
  var precast1 = lidx0;
  var precast2 = (bitcast<u32>(precast0)<<4u);
  var precast3 = (bitcast<u32>(precast1)<<14u);
  var alu0 = (lidx1+bitcast<i32>(precast2)+bitcast<i32>(precast3));
  var val0 = data1[alu0];
  var alu1 = (alu0+8192);
  var val1 = data1[alu1];
  var alu2 = -val0;
  var alu3 = -val1;
  var alu4 = select(alu2,alu3,(alu2<alu3));
  data0[alu1] = -alu4;
  var alu6 = select(val0,val1,(val0<val1));
  data0[alu0] = alu6;
}`;

const E_512_32_2_2n1 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@compute @workgroup_size(32) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 512 */
  var lidx0 = i32(lindex.x); /* 32 */
  var precast0 = gidx0;
  var precast1 = (bitcast<u32>(precast0)<<5u);
  var alu0 = (lidx0+bitcast<i32>(precast1));
  var val0 = data1[alu0];
  var alu1 = (alu0+49152);
  var val1 = data1[alu1];
  var alu2 = ((gidx0*-32)-lidx0);
  var val2 = data1[(alu2+32767)];
  var val3 = data1[(alu2+49151)];
  data0[alu0] = val0;
  data0[alu1] = val3;
  data0[(alu0+16384)] = val2;
  data0[(alu0+32768)] = val1;
}`;

const E_1024_2_16_2 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@compute @workgroup_size(2,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 1024 */
  var lidx0 = i32(lindex.x); /* 2 */
  var lidx1 = i32(lindex.y); /* 16 */
  var precast0 = gidx0;
  var precast1 = lidx0;
  var precast2 = (bitcast<u32>(precast0)<<4u);
  var precast3 = (bitcast<u32>(precast1)<<15u);
  var alu0 = (lidx1+bitcast<i32>(precast2)+bitcast<i32>(precast3));
  var val0 = data1[alu0];
  var alu1 = (alu0+16384);
  var val1 = data1[alu1];
  var alu2 = -val0;
  var alu3 = -val1;
  var alu4 = select(alu2,alu3,(alu2<alu3));
  data0[alu1] = -alu4;
  var alu6 = select(val0,val1,(val0<val1));
  data0[alu0] = alu6;
}`;

const E_1024_32_2n1 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@compute @workgroup_size(32) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 1024 */
  var lidx0 = i32(lindex.x); /* 32 */
  var precast0 = gidx0;
  var precast1 = (bitcast<u32>(precast0)<<5u);
  var alu0 = (lidx0+bitcast<i32>(precast1));
  var val0 = data1[alu0];
  var val1 = data1[(((gidx0*-32)-lidx0)+65535)];
  var alu1 = -val0;
  var alu2 = -val1;
  var alu3 = select(alu1,alu2,(alu1<alu2));
  data0[(alu0+32768)] = -alu3;
  var alu5 = select(val0,val1,(val0<val1));
  data0[alu0] = alu5;
}`;

const r_2161_8_8_2161_3_3n1 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<i32>;
@group(0) @binding(2)var<storage,read_write>data1:array<i32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
@compute @workgroup_size(8,8) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 2161 */
  var lidx0 = i32(lindex.x); /* 8 */
  var lidx1 = i32(lindex.y); /* 8 */
  var alu0 = ((gidx0*24)+(lidx0*3));
  var val0 = data1[alu0];
  var val1 = data2[alu0];
  var alu1 = (alu0+1);
  var val2 = data1[alu1];
  var val3 = data2[alu1];
  var alu2 = (alu0+2);
  var val4 = data1[alu2];
  var val5 = data2[alu2];
  var acc0 = 0;
  var acc1 = 0;
  var acc2 = 0;
  var acc3 = 0;
  var acc4 = 0;
  var acc5 = 0;
  var acc6 = 0;
  var acc7 = 0;
  var acc8 = 0;
  for (var ridx3 = 0; ridx3 < 2161; ridx3++) {
    var alu3 = ((lidx1*6483)+ridx3);
    var val6 = data1[alu3];
    var val7 = data2[alu3];
    var alu4 = (alu3+2161);
    var val8 = data1[alu4];
    var val9 = data2[alu4];
    var alu5 = (alu3+4322);
    var val10 = data1[alu5];
    var val11 = data2[alu5];
    acc4 = (acc4+(i32((((val2<val8)!=true)&((val9!=val3)!=true)))));
    acc7 = (acc7+(i32((((val2<val10)!=true)&((val11!=val3)!=true)))));
    acc1 = (acc1+(i32((((val2<val6)!=true)&((val7!=val3)!=true)))));
    acc5 = (acc5+(i32((((val4<val8)!=true)&((val9!=val5)!=true)))));
    acc8 = (acc8+(i32((((val4<val10)!=true)&((val11!=val5)!=true)))));
    acc2 = (acc2+(i32((((val4<val6)!=true)&((val7!=val5)!=true)))));
    acc3 = (acc3+(i32((((val0<val8)!=true)&((val9!=val1)!=true)))));
    acc6 = (acc6+(i32((((val0<val10)!=true)&((val11!=val1)!=true)))));
    acc0 = (acc0+(i32((((val0<val6)!=true)&((val7!=val1)!=true)))));
  }
  var alu16 = ((gidx0*576)+(lidx0*72)+(lidx1*3));
  data0[alu16] = acc0;
  data0[(alu16+1)] = acc3;
  data0[(alu16+2)] = acc6;
  data0[(alu16+24)] = acc1;
  data0[(alu16+25)] = acc4;
  data0[(alu16+26)] = acc7;
  data0[(alu16+48)] = acc2;
  data0[(alu16+49)] = acc5;
  data0[(alu16+50)] = acc8;
}`;

const r_2161_8_8_2161_3_3n2 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<i32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3:array<i32>;
@group(0) @binding(5)var<storage,read_write>data4:array<i32>;
@group(0) @binding(6)var<storage,read_write>data5:array<i32>;
@compute @workgroup_size(8,8) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 2161 */
  var lidx0 = i32(lindex.x); /* 8 */
  var lidx1 = i32(lindex.y); /* 8 */
  var alu0 = ((gidx0*24)+(lidx0*3));
  var val0 = data4[alu0];
  var val1 = data2[alu0];
  var alu1 = (alu0+1);
  var val2 = data4[alu1];
  var val3 = data2[alu1];
  var alu2 = (alu0+2);
  var val4 = data4[alu2];
  var val5 = data2[alu2];
  var acc0 = 0;
  var acc1 = 0;
  var acc2 = 0;
  var acc3 = 0;
  var acc4 = 0;
  var acc5 = 0;
  var acc6 = 0;
  var acc7 = 0;
  var acc8 = 0;
  for (var ridx3 = 0; ridx3 < 2161; ridx3++) {
    var alu3 = ((lidx1*6483)+ridx3);
    var val6 = data3[alu3];
    var val7 = data5[alu3];
    var val8 = data1[alu3];
    var alu4 = (alu3+2161);
    var val9 = data3[alu4];
    var val10 = data5[alu4];
    var val11 = data1[alu4];
    var alu5 = (alu3+4322);
    var val12 = data3[alu5];
    var val13 = data5[alu5];
    var val14 = data1[alu5];
    acc4 = (acc4+((i32((((val11!=val3)!=true)&((val9!=val2)!=true))))*val10));
    acc7 = (acc7+((i32((((val11!=val5)!=true)&((val9!=val4)!=true))))*val10));
    acc1 = (acc1+((i32((((val11!=val1)!=true)&((val9!=val0)!=true))))*val10));
    acc5 = (acc5+((i32((((val14!=val3)!=true)&((val12!=val2)!=true))))*val13));
    acc8 = (acc8+((i32((((val14!=val5)!=true)&((val12!=val4)!=true))))*val13));
    acc2 = (acc2+((i32((((val14!=val1)!=true)&((val12!=val0)!=true))))*val13));
    acc3 = (acc3+((i32((((val8!=val3)!=true)&((val6!=val2)!=true))))*val7));
    acc6 = (acc6+((i32((((val8!=val5)!=true)&((val6!=val4)!=true))))*val7));
    acc0 = (acc0+((i32((((val8!=val1)!=true)&((val6!=val0)!=true))))*val7));
  }
  var alu16 = ((gidx0*576)+(lidx0*72)+(lidx1*3));
  data0[alu16] = acc0;
  data0[(alu16+1)] = acc1;
  data0[(alu16+2)] = acc2;
  data0[(alu16+24)] = acc3;
  data0[(alu16+25)] = acc4;
  data0[(alu16+26)] = acc5;
  data0[(alu16+48)] = acc6;
  data0[(alu16+49)] = acc7;
  data0[(alu16+50)] = acc8;
}`;

const setupNet = async (device, safetensor) => {
    const metadata = getTensorMetadata(safetensor);
    const infinityBuf = createInfinityUniformBuf(device);

    const layouts=[device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]})]

    const buf_0 = createEmptyBuf(device, 16515072);;
    const buf_1 = createWeightBuf(device, 207456, getTensorBuffer(safetensor, metadata['token_embedding.arange']));
    const input0 = createEmptyBuf(device, 1792);;
    const buf_2 = createWeightBuf(device, 79663104, getTensorBuffer(safetensor, metadata['token_embedding.weight']));
    const buf_3 = createEmptyBuf(device, 688128);;
    const buf_4 = createWeightBuf(device, 688128, getTensorBuffer(safetensor, metadata['positional_embedding']));
    const buf_5 = createEmptyBuf(device, 1792);;
    const buf_6 = createEmptyBuf(device, 1792);;
    const buf_7 = createEmptyBuf(device, 688128);;
    const buf_8 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.0.attn_ln.weight']));
    const buf_9 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.0.attn_ln.bias']));
    const buf_10 = createEmptyBuf(device, 688128);;
    const buf_11 = createWeightBuf(device, 589824, getTensorBuffer(safetensor, metadata['blocks.0.attn.key.weight']));
    const buf_12 = createWeightBuf(device, 688128, getTensorBuffer(safetensor, metadata['blocks.0.attn.cache_k']));
    const buf_13 = createWeightBuf(device, 589824, getTensorBuffer(safetensor, metadata['blocks.0.attn.value.weight']));
    const buf_14 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.0.attn.value.bias']));
    const buf_15 = createWeightBuf(device, 688128, getTensorBuffer(safetensor, metadata['blocks.0.attn.cache_v']));
    const buf_16 = createWeightBuf(device, 2304000, getTensorBuffer(safetensor, metadata['blocks.0.cross_attn.cache_k']));
    const input1 = createEmptyBuf(device, 2304000);;
    const buf_17 = createWeightBuf(device, 589824, getTensorBuffer(safetensor, metadata['blocks.0.cross_attn.key.weight']));
    const buf_18 = createWeightBuf(device, 2304000, getTensorBuffer(safetensor, metadata['blocks.0.cross_attn.cache_v']));
    const buf_19 = createWeightBuf(device, 589824, getTensorBuffer(safetensor, metadata['blocks.0.cross_attn.value.weight']));
    const buf_20 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.0.cross_attn.value.bias']));
    const buf_21 = createWeightBuf(device, 589824, getTensorBuffer(safetensor, metadata['blocks.0.attn.query.weight']));
    const buf_22 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.0.attn.query.bias']));
    const buf_23 = createEmptyBuf(device, 688128);;
    const buf_24 = createEmptyBuf(device, 688128);;
    const buf_25 = createEmptyBuf(device, 2304000);;
    const buf_26 = createEmptyBuf(device, 2304000);;
    const buf_27 = createEmptyBuf(device, 4816896);;
    const buf_28 = createWeightBuf(device, 802816, getTensorBuffer(safetensor, metadata['mask']));
    const buf_29 = createEmptyBuf(device, 10752);;
    const buf_30 = createEmptyBuf(device, 10752);;
    const buf_31 = createEmptyBuf(device, 4816896);;
    const buf_32 = createWeightBuf(device, 589824, getTensorBuffer(safetensor, metadata['blocks.0.attn.out.weight']));
    const buf_33 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.0.attn.out.bias']));
    const buf_34 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.0.cross_attn_ln.weight']));
    const buf_35 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.0.cross_attn_ln.bias']));
    const buf_36 = createWeightBuf(device, 589824, getTensorBuffer(safetensor, metadata['blocks.0.cross_attn.query.weight']));
    const buf_37 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.0.cross_attn.query.bias']));
    const buf_38 = createEmptyBuf(device, 16128000);;
    const buf_39 = createEmptyBuf(device, 16128000);;
    const buf_40 = createWeightBuf(device, 589824, getTensorBuffer(safetensor, metadata['blocks.0.cross_attn.out.weight']));
    const buf_41 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.0.cross_attn.out.bias']));
    const buf_42 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.0.mlp_ln.weight']));
    const buf_43 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.0.mlp_ln.bias']));
    const buf_44 = createEmptyBuf(device, 2752512);;
    const buf_45 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.0.mlp.0.weight']));
    const buf_46 = createWeightBuf(device, 6144, getTensorBuffer(safetensor, metadata['blocks.0.mlp.0.bias']));
    const buf_47 = createEmptyBuf(device, 688128);;
    const buf_48 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.0.mlp.2.weight']));
    const buf_49 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.0.mlp.2.bias']));
    const buf_50 = createEmptyBuf(device, 688128);;
    const buf_51 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.1.attn_ln.weight']));
    const buf_52 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.1.attn_ln.bias']));
    const buf_53 = createWeightBuf(device, 589824, getTensorBuffer(safetensor, metadata['blocks.1.attn.key.weight']));
    const buf_54 = createWeightBuf(device, 688128, getTensorBuffer(safetensor, metadata['blocks.1.attn.cache_k']));
    const buf_55 = createWeightBuf(device, 589824, getTensorBuffer(safetensor, metadata['blocks.1.attn.value.weight']));
    const buf_56 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.1.attn.value.bias']));
    const buf_57 = createWeightBuf(device, 688128, getTensorBuffer(safetensor, metadata['blocks.1.attn.cache_v']));
    const buf_58 = createWeightBuf(device, 2304000, getTensorBuffer(safetensor, metadata['blocks.1.cross_attn.cache_k']));
    const buf_59 = createWeightBuf(device, 589824, getTensorBuffer(safetensor, metadata['blocks.1.cross_attn.key.weight']));
    const buf_60 = createWeightBuf(device, 2304000, getTensorBuffer(safetensor, metadata['blocks.1.cross_attn.cache_v']));
    const buf_61 = createWeightBuf(device, 589824, getTensorBuffer(safetensor, metadata['blocks.1.cross_attn.value.weight']));
    const buf_62 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.1.cross_attn.value.bias']));
    const buf_63 = createWeightBuf(device, 589824, getTensorBuffer(safetensor, metadata['blocks.1.attn.query.weight']));
    const buf_64 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.1.attn.query.bias']));
    const buf_65 = createWeightBuf(device, 589824, getTensorBuffer(safetensor, metadata['blocks.1.attn.out.weight']));
    const buf_66 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.1.attn.out.bias']));
    const buf_67 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.1.cross_attn_ln.weight']));
    const buf_68 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.1.cross_attn_ln.bias']));
    const buf_69 = createWeightBuf(device, 589824, getTensorBuffer(safetensor, metadata['blocks.1.cross_attn.query.weight']));
    const buf_70 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.1.cross_attn.query.bias']));
    const buf_71 = createWeightBuf(device, 589824, getTensorBuffer(safetensor, metadata['blocks.1.cross_attn.out.weight']));
    const buf_72 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.1.cross_attn.out.bias']));
    const buf_73 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.1.mlp_ln.weight']));
    const buf_74 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.1.mlp_ln.bias']));
    const buf_75 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.1.mlp.0.weight']));
    const buf_76 = createWeightBuf(device, 6144, getTensorBuffer(safetensor, metadata['blocks.1.mlp.0.bias']));
    const buf_77 = createEmptyBuf(device, 688128);;
    const buf_78 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.1.mlp.2.weight']));
    const buf_79 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.1.mlp.2.bias']));
    const buf_80 = createEmptyBuf(device, 688128);;
    const buf_81 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.2.attn_ln.weight']));
    const buf_82 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.2.attn_ln.bias']));
    const buf_83 = createWeightBuf(device, 589824, getTensorBuffer(safetensor, metadata['blocks.2.attn.key.weight']));
    const buf_84 = createWeightBuf(device, 688128, getTensorBuffer(safetensor, metadata['blocks.2.attn.cache_k']));
    const buf_85 = createWeightBuf(device, 589824, getTensorBuffer(safetensor, metadata['blocks.2.attn.value.weight']));
    const buf_86 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.2.attn.value.bias']));
    const buf_87 = createWeightBuf(device, 688128, getTensorBuffer(safetensor, metadata['blocks.2.attn.cache_v']));
    const buf_88 = createWeightBuf(device, 2304000, getTensorBuffer(safetensor, metadata['blocks.2.cross_attn.cache_k']));
    const buf_89 = createWeightBuf(device, 589824, getTensorBuffer(safetensor, metadata['blocks.2.cross_attn.key.weight']));
    const buf_90 = createWeightBuf(device, 2304000, getTensorBuffer(safetensor, metadata['blocks.2.cross_attn.cache_v']));
    const buf_91 = createWeightBuf(device, 589824, getTensorBuffer(safetensor, metadata['blocks.2.cross_attn.value.weight']));
    const buf_92 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.2.cross_attn.value.bias']));
    const buf_93 = createWeightBuf(device, 589824, getTensorBuffer(safetensor, metadata['blocks.2.attn.query.weight']));
    const buf_94 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.2.attn.query.bias']));
    const buf_95 = createWeightBuf(device, 589824, getTensorBuffer(safetensor, metadata['blocks.2.attn.out.weight']));
    const buf_96 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.2.attn.out.bias']));
    const buf_97 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.2.cross_attn_ln.weight']));
    const buf_98 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.2.cross_attn_ln.bias']));
    const buf_99 = createWeightBuf(device, 589824, getTensorBuffer(safetensor, metadata['blocks.2.cross_attn.query.weight']));
    const buf_100 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.2.cross_attn.query.bias']));
    const buf_101 = createWeightBuf(device, 589824, getTensorBuffer(safetensor, metadata['blocks.2.cross_attn.out.weight']));
    const buf_102 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.2.cross_attn.out.bias']));
    const buf_103 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.2.mlp_ln.weight']));
    const buf_104 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.2.mlp_ln.bias']));
    const buf_105 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.2.mlp.0.weight']));
    const buf_106 = createWeightBuf(device, 6144, getTensorBuffer(safetensor, metadata['blocks.2.mlp.0.bias']));
    const buf_107 = createEmptyBuf(device, 688128);;
    const buf_108 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.2.mlp.2.weight']));
    const buf_109 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.2.mlp.2.bias']));
    const buf_110 = createEmptyBuf(device, 688128);;
    const buf_111 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.3.attn_ln.weight']));
    const buf_112 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.3.attn_ln.bias']));
    const buf_113 = createWeightBuf(device, 589824, getTensorBuffer(safetensor, metadata['blocks.3.attn.key.weight']));
    const buf_114 = createWeightBuf(device, 688128, getTensorBuffer(safetensor, metadata['blocks.3.attn.cache_k']));
    const buf_115 = createWeightBuf(device, 589824, getTensorBuffer(safetensor, metadata['blocks.3.attn.value.weight']));
    const buf_116 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.3.attn.value.bias']));
    const buf_117 = createWeightBuf(device, 688128, getTensorBuffer(safetensor, metadata['blocks.3.attn.cache_v']));
    const buf_118 = createWeightBuf(device, 2304000, getTensorBuffer(safetensor, metadata['blocks.3.cross_attn.cache_k']));
    const buf_119 = createWeightBuf(device, 589824, getTensorBuffer(safetensor, metadata['blocks.3.cross_attn.key.weight']));
    const buf_120 = createWeightBuf(device, 2304000, getTensorBuffer(safetensor, metadata['blocks.3.cross_attn.cache_v']));
    const buf_121 = createWeightBuf(device, 589824, getTensorBuffer(safetensor, metadata['blocks.3.cross_attn.value.weight']));
    const buf_122 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.3.cross_attn.value.bias']));
    const buf_123 = createWeightBuf(device, 589824, getTensorBuffer(safetensor, metadata['blocks.3.attn.query.weight']));
    const buf_124 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.3.attn.query.bias']));
    const buf_125 = createWeightBuf(device, 589824, getTensorBuffer(safetensor, metadata['blocks.3.attn.out.weight']));
    const buf_126 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.3.attn.out.bias']));
    const buf_127 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.3.cross_attn_ln.weight']));
    const buf_128 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.3.cross_attn_ln.bias']));
    const buf_129 = createWeightBuf(device, 589824, getTensorBuffer(safetensor, metadata['blocks.3.cross_attn.query.weight']));
    const buf_130 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.3.cross_attn.query.bias']));
    const buf_131 = createWeightBuf(device, 589824, getTensorBuffer(safetensor, metadata['blocks.3.cross_attn.out.weight']));
    const buf_132 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.3.cross_attn.out.bias']));
    const buf_133 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.3.mlp_ln.weight']));
    const buf_134 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.3.mlp_ln.bias']));
    const buf_135 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.3.mlp.0.weight']));
    const buf_136 = createWeightBuf(device, 6144, getTensorBuffer(safetensor, metadata['blocks.3.mlp.0.bias']));
    const buf_137 = createEmptyBuf(device, 688128);;
    const buf_138 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.3.mlp.2.weight']));
    const buf_139 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.3.mlp.2.bias']));
    const buf_140 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['ln.weight']));
    const buf_141 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['ln.bias']));
    const buf_142 = createEmptyBuf(device, 92940288);;
    const buf_143 = createEmptyBuf(device, 96);;
    const buf_144 = createEmptyBuf(device, 207456);;
    const buf_145 = createEmptyBuf(device, 4);;
    const buf_146 = createEmptyBuf(device, 4);;
    const buf_147 = createEmptyBuf(device, 207456);;
    const buf_148 = createEmptyBuf(device, 262144);;
    const buf_149 = createEmptyBuf(device, 4978944);;
    const buf_150 = createEmptyBuf(device, 262144);;
    const buf_151 = createEmptyBuf(device, 207456);;
    const buf_152 = createEmptyBuf(device, 207456);;
    const output0 = createEmptyBuf(device, 207456);;
    const ctx = createUniformBuf(device, 4);;

    const gpuWriteBuffer0 = device.createBuffer({size:input0.size, usage: GPUBufferUsage.COPY_SRC | GPUBufferUsage.MAP_WRITE });
    const gpuWriteBuffer1 = device.createBuffer({size:input1.size, usage: GPUBufferUsage.COPY_SRC | GPUBufferUsage.MAP_WRITE });
    const gpuWriteBuffer2 = device.createBuffer({size:ctx.size, usage: GPUBufferUsage.COPY_SRC | GPUBufferUsage.MAP_WRITE });

    const gpuReadBuffer0 = device.createBuffer({size:output0.size, usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ });

    const kernels = [r_112_8_3_16_8_2161_3_4, r_1792_32_3_24, r_448_16_24, r_448_16_24n1, E_14_8_8_16_3_4, r_14_8_8_16_96_3_4_4, E_1792_32_3, r_14_8_8_16_96_4_3_4, E_1792_32_3, r_125_8_4_16_96_3_3_4n1, r_125_8_4_16_96_3_3_4, r_14_8_8_16_96_4_3_4, r_14_8_8_16_96_3_4_4, r_14_8_8_16_96_4_3_4, r_125_8_4_16_96_3_3_4n1, r_125_8_4_16_96_3_3_4, r_2_14_7_8_16_16_4_4_3_4, r_28_32_112_3_4, r_28_32_112_3_4n1, E_336_7_8_16_4, r_6_14_8_16_112_4_4_4, r_14_8_8_16_96_4_3_4n1, r_448_16_24, r_448_16_24n1, E_14_8_8_16_3_4, r_14_8_8_16_96_4_3_4, r_3_7_125_2_16_4_16_3_4_4, r_28_32_375_3_4, r_28_32_375_3_4n1, E_84_125_32_4_3, r_6_14_8_16_375_4_4_4, r_14_8_8_16_96_4_3_4n1, r_448_16_24, r_448_16_24n1, E_14_8_8_16_3_4, r_14_32_8_16_96_4_3_4, r_14_8_8_16_384_4_3_4, r_448_16_24, r_448_16_24n1, E_14_8_8_16_3_4, r_14_8_8_16_96_3_4_4, E_1792_32_3, r_14_8_8_16_96_4_3_4, E_1792_32_3, r_125_8_4_16_96_3_3_4n1, r_125_8_4_16_96_3_3_4, r_14_8_8_16_96_4_3_4, r_14_8_8_16_96_3_4_4, r_14_8_8_16_96_4_3_4, r_125_8_4_16_96_3_3_4n1, r_125_8_4_16_96_3_3_4, r_2_14_7_8_16_16_4_4_3_4, r_28_32_112_3_4, r_28_32_112_3_4n1, E_336_7_8_16_4, r_6_14_8_16_112_4_4_4, r_14_8_8_16_96_4_3_4n1, r_448_16_24, r_448_16_24n1, E_14_8_8_16_3_4, r_14_8_8_16_96_4_3_4, r_3_7_125_2_16_4_16_3_4_4, r_28_32_375_3_4, r_28_32_375_3_4n1, E_84_125_32_4_3, r_6_14_8_16_375_4_4_4, r_14_8_8_16_96_4_3_4n1, r_448_16_24, r_448_16_24n1, E_14_8_8_16_3_4, r_14_32_8_16_96_4_3_4, r_14_8_8_16_384_4_3_4, r_448_16_24, r_448_16_24n1, E_14_8_8_16_3_4, r_14_8_8_16_96_3_4_4, E_1792_32_3, r_14_8_8_16_96_4_3_4, E_1792_32_3, r_125_8_4_16_96_3_3_4n1, r_125_8_4_16_96_3_3_4, r_14_8_8_16_96_4_3_4, r_14_8_8_16_96_3_4_4, r_14_8_8_16_96_4_3_4, r_125_8_4_16_96_3_3_4n1, r_125_8_4_16_96_3_3_4, r_2_14_7_8_16_16_4_4_3_4, r_28_32_112_3_4, r_28_32_112_3_4n1, E_336_7_8_16_4, r_6_14_8_16_112_4_4_4, r_14_8_8_16_96_4_3_4n1, r_448_16_24, r_448_16_24n1, E_14_8_8_16_3_4, r_14_8_8_16_96_4_3_4, r_3_7_125_2_16_4_16_3_4_4, r_28_32_375_3_4, r_28_32_375_3_4n1, E_84_125_32_4_3, r_6_14_8_16_375_4_4_4, r_14_8_8_16_96_4_3_4n1, r_448_16_24, r_448_16_24n1, E_14_8_8_16_3_4, r_14_32_8_16_96_4_3_4, r_14_8_8_16_384_4_3_4, r_448_16_24, r_448_16_24n1, E_14_8_8_16_3_4, r_14_8_8_16_96_3_4_4, E_1792_32_3, r_14_8_8_16_96_4_3_4, E_1792_32_3, r_125_8_4_16_96_3_3_4n1, r_125_8_4_16_96_3_3_4, r_14_8_8_16_96_4_3_4, r_14_8_8_16_96_3_4_4, r_14_8_8_16_96_4_3_4, r_125_8_4_16_96_3_3_4n1, r_125_8_4_16_96_3_3_4, r_2_14_7_8_16_16_4_4_3_4, r_28_32_112_3_4, r_28_32_112_3_4n1, E_336_7_8_16_4, r_6_14_8_16_112_4_4_4, r_14_8_8_16_96_4_3_4n1, r_448_16_24, r_448_16_24n1, E_14_8_8_16_3_4, r_14_8_8_16_96_4_3_4, r_3_7_125_2_16_4_16_3_4_4, r_28_32_375_3_4, r_28_32_375_3_4n1, E_84_125_32_4_3, r_6_14_8_16_375_4_4_4, r_14_8_8_16_96_4_3_4n1, r_448_16_24, r_448_16_24n1, E_14_8_8_16_3_4, r_14_32_8_16_96_4_3_4, r_14_8_8_16_384_4_3_4, r_448_16_24, r_448_16_24n1, E_14_8_8_16_3_4, r_7_2161_16_8_96_3_4_4, r_3_8_2161, r_2161_8_12966_3_4, r_24, r_3_8_2161n1, r_24n1, E_2161_8_3, E_2_2_2_2_2_2_2_2_2_2_2_2_2_2_2_2, r_2161_8_8_2161_3_3, E_1024_32_2, r_2161_8_3_24, E_256_32_2_2_2, E_512_32_2_2, E_1024_32_2, E_128_32_4_2_2, E_256_32_4_2, E_512_32_2_2, E_1024_32_2, E_128_16_8_2_2, E_256_16_8_2, E_256_32_4_2, E_512_32_2_2, E_1024_32_2, E_128_8_16_2_2, E_256_8_16_2, E_256_16_8_2, E_256_32_4_2, E_512_32_2_2, E_1024_32_2, E_64_2_8_16_2_2, E_128_2_8_16_2, E_256_8_16_2, E_256_16_8_2, E_256_32_4_2, E_512_32_2_2, E_1024_32_2, E_32_4_8_16_2_2, E_64_4_8_16_2, E_128_2_8_16_2, E_256_8_16_2, E_256_16_8_2, E_256_32_4_2, E_512_32_2_2, E_1024_32_2, E_16_8_8_16_2_2, E_32_8_8_16_2, E_64_4_8_16_2, E_128_2_8_16_2, E_256_8_16_2, E_256_16_8_2, E_256_32_4_2, E_512_32_2_2, E_1024_32_2, E_8_16_8_16_2_2, E_16_16_8_16_2, E_32_8_8_16_2, E_64_4_8_16_2, E_128_2_8_16_2, E_256_8_16_2, E_256_16_8_2, E_256_32_4_2, E_512_32_2_2, E_1024_32_2, E_4_32_8_16_2_2, E_8_32_8_16_2, E_16_16_8_16_2, E_32_8_8_16_2, E_64_4_8_16_2, E_128_2_8_16_2, E_256_8_16_2, E_256_16_8_2, E_256_32_4_2, E_512_32_2_2, E_1024_32_2, E_2_64_8_16_2_2, E_4_64_8_16_2, E_8_32_8_16_2, E_16_16_8_16_2, E_32_8_8_16_2, E_64_4_8_16_2, E_128_2_8_16_2, E_256_8_16_2, E_256_16_8_2, E_256_32_4_2, E_512_32_2_2, E_1024_32_2, E_128_8_16_2_2n1, E_2_128_8_16_2, E_4_64_8_16_2, E_8_32_8_16_2, E_16_16_8_16_2, E_32_8_8_16_2, E_64_4_8_16_2, E_128_2_8_16_2, E_256_8_16_2, E_256_16_8_2, E_256_32_4_2, E_512_32_2_2, E_1024_32_2, E_256_4_16_2_2, E_256_8_16_2n1, E_2_128_8_16_2, E_4_64_8_16_2, E_8_32_8_16_2, E_16_16_8_16_2, E_32_8_8_16_2, E_64_4_8_16_2, E_128_2_8_16_2, E_256_8_16_2, E_256_16_8_2, E_256_32_4_2, E_512_32_2_2, E_1024_32_2, E_512_2_16_2_2, E_512_4_16_2, E_256_8_16_2n1, E_2_128_8_16_2, E_4_64_8_16_2, E_8_32_8_16_2, E_16_16_8_16_2, E_32_8_8_16_2, E_64_4_8_16_2, E_128_2_8_16_2, E_256_8_16_2, E_256_16_8_2, E_256_32_4_2, E_512_32_2_2, E_1024_32_2, E_512_32_2_2n1, E_1024_2_16_2, E_512_4_16_2, E_256_8_16_2n1, E_2_128_8_16_2, E_4_64_8_16_2, E_8_32_8_16_2, E_16_16_8_16_2, E_32_8_8_16_2, E_64_4_8_16_2, E_128_2_8_16_2, E_256_8_16_2, E_256_16_8_2, E_256_32_4_2, E_512_32_2_2, E_1024_32_2, E_1024_32_2n1, E_1024_2_16_2, E_512_4_16_2, E_256_8_16_2n1, E_2_128_8_16_2, E_4_64_8_16_2, E_8_32_8_16_2, E_16_16_8_16_2, E_32_8_8_16_2, E_64_4_8_16_2, E_128_2_8_16_2, E_256_8_16_2, E_256_16_8_2, E_256_32_4_2, E_512_32_2_2, E_1024_32_2, r_2161_8_8_2161_3_3n1, r_2161_8_3_24, r_2161_8_8_2161_3_3n2, r_2161_8_3_24];
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

    return async (_input0,_input1,_ctx) => {
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
        addComputePass(device, commandEncoder, pipelines[0], layouts[0], infinityBuf, [buf_0, buf_1, input0, buf_2], [3, 8, 112]);
        addComputePass(device, commandEncoder, pipelines[1], layouts[1], infinityBuf, [buf_3, buf_0, buf_4], [1792, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[2], layouts[2], infinityBuf, [buf_5, buf_3], [448, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[3], layouts[3], infinityBuf, [buf_6, buf_3, buf_5], [448, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[4], layouts[4], infinityBuf, [buf_7, buf_3, buf_5, buf_6, buf_8, buf_9], [8, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[5], layouts[5], infinityBuf, [buf_10, buf_7, buf_11], [8, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[6], layouts[6], infinityBuf, [buf_12, buf_10], [1792, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[7], layouts[7], infinityBuf, [buf_10, buf_7, buf_13, buf_14], [8, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[8], layouts[8], infinityBuf, [buf_15, buf_10], [1792, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[9], layouts[9], infinityBuf, [buf_16, input1, buf_17], [8, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[10], layouts[10], infinityBuf, [buf_18, input1, buf_19, buf_20], [8, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[11], layouts[11], infinityBuf, [buf_10, buf_7, buf_21, buf_22], [8, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[12], layouts[12], infinityBuf, [buf_23, buf_7, buf_11], [8, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[13], layouts[13], infinityBuf, [buf_24, buf_7, buf_13, buf_14], [8, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[14], layouts[14], infinityBuf, [buf_25, input1, buf_17], [8, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[15], layouts[15], infinityBuf, [buf_26, input1, buf_19, buf_20], [8, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[16], layouts[16], infinityBuf, [buf_27, buf_10, buf_23, buf_28], [7, 14, 2]);
        addComputePass(device, commandEncoder, pipelines[17], layouts[17], infinityBuf, [buf_29, buf_27], [28, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[18], layouts[18], infinityBuf, [buf_30, buf_27, buf_29], [28, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[19], layouts[19], infinityBuf, [buf_31, buf_27, buf_29, buf_30], [7, 336, 1]);
        addComputePass(device, commandEncoder, pipelines[20], layouts[20], infinityBuf, [buf_23, buf_31, buf_24], [14, 6, 1]);
        addComputePass(device, commandEncoder, pipelines[21], layouts[21], infinityBuf, [buf_24, buf_3, buf_23, buf_32, buf_33], [8, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[22], layouts[22], infinityBuf, [buf_6, buf_24], [448, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[23], layouts[23], infinityBuf, [buf_5, buf_24, buf_6], [448, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[24], layouts[24], infinityBuf, [buf_23, buf_24, buf_6, buf_5, buf_34, buf_35], [8, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[25], layouts[25], infinityBuf, [buf_10, buf_23, buf_36, buf_37], [8, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[26], layouts[26], infinityBuf, [buf_38, buf_10, buf_25], [125, 7, 3]);
        addComputePass(device, commandEncoder, pipelines[27], layouts[27], infinityBuf, [buf_30, buf_38], [28, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[28], layouts[28], infinityBuf, [buf_29, buf_38, buf_30], [28, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[29], layouts[29], infinityBuf, [buf_39, buf_38, buf_30, buf_29], [125, 84, 1]);
        addComputePass(device, commandEncoder, pipelines[30], layouts[30], infinityBuf, [buf_10, buf_39, buf_26], [14, 6, 1]);
        addComputePass(device, commandEncoder, pipelines[31], layouts[31], infinityBuf, [buf_23, buf_24, buf_10, buf_40, buf_41], [8, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[32], layouts[32], infinityBuf, [buf_5, buf_23], [448, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[33], layouts[33], infinityBuf, [buf_6, buf_23, buf_5], [448, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[34], layouts[34], infinityBuf, [buf_10, buf_23, buf_5, buf_6, buf_42, buf_43], [8, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[35], layouts[35], infinityBuf, [buf_44, buf_10, buf_45, buf_46], [32, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[36], layouts[36], infinityBuf, [buf_47, buf_23, buf_44, buf_48, buf_49], [8, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[37], layouts[37], infinityBuf, [buf_6, buf_47], [448, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[38], layouts[38], infinityBuf, [buf_5, buf_47, buf_6], [448, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[39], layouts[39], infinityBuf, [buf_50, buf_47, buf_6, buf_5, buf_51, buf_52], [8, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[40], layouts[40], infinityBuf, [buf_23, buf_50, buf_53], [8, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[41], layouts[41], infinityBuf, [buf_54, buf_23], [1792, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[42], layouts[42], infinityBuf, [buf_23, buf_50, buf_55, buf_56], [8, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[43], layouts[43], infinityBuf, [buf_57, buf_23], [1792, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[44], layouts[44], infinityBuf, [buf_58, input1, buf_59], [8, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[45], layouts[45], infinityBuf, [buf_60, input1, buf_61, buf_62], [8, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[46], layouts[46], infinityBuf, [buf_23, buf_50, buf_63, buf_64], [8, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[47], layouts[47], infinityBuf, [buf_10, buf_50, buf_53], [8, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[48], layouts[48], infinityBuf, [buf_24, buf_50, buf_55, buf_56], [8, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[49], layouts[49], infinityBuf, [buf_26, input1, buf_59], [8, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[50], layouts[50], infinityBuf, [buf_25, input1, buf_61, buf_62], [8, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[51], layouts[51], infinityBuf, [buf_31, buf_23, buf_10, buf_28], [7, 14, 2]);
        addComputePass(device, commandEncoder, pipelines[52], layouts[52], infinityBuf, [buf_29, buf_31], [28, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[53], layouts[53], infinityBuf, [buf_30, buf_31, buf_29], [28, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[54], layouts[54], infinityBuf, [buf_27, buf_31, buf_29, buf_30], [7, 336, 1]);
        addComputePass(device, commandEncoder, pipelines[55], layouts[55], infinityBuf, [buf_10, buf_27, buf_24], [14, 6, 1]);
        addComputePass(device, commandEncoder, pipelines[56], layouts[56], infinityBuf, [buf_24, buf_47, buf_10, buf_65, buf_66], [8, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[57], layouts[57], infinityBuf, [buf_5, buf_24], [448, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[58], layouts[58], infinityBuf, [buf_6, buf_24, buf_5], [448, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[59], layouts[59], infinityBuf, [buf_10, buf_24, buf_5, buf_6, buf_67, buf_68], [8, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[60], layouts[60], infinityBuf, [buf_23, buf_10, buf_69, buf_70], [8, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[61], layouts[61], infinityBuf, [buf_39, buf_23, buf_26], [125, 7, 3]);
        addComputePass(device, commandEncoder, pipelines[62], layouts[62], infinityBuf, [buf_30, buf_39], [28, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[63], layouts[63], infinityBuf, [buf_29, buf_39, buf_30], [28, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[64], layouts[64], infinityBuf, [buf_38, buf_39, buf_30, buf_29], [125, 84, 1]);
        addComputePass(device, commandEncoder, pipelines[65], layouts[65], infinityBuf, [buf_23, buf_38, buf_25], [14, 6, 1]);
        addComputePass(device, commandEncoder, pipelines[66], layouts[66], infinityBuf, [buf_10, buf_24, buf_23, buf_71, buf_72], [8, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[67], layouts[67], infinityBuf, [buf_6, buf_10], [448, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[68], layouts[68], infinityBuf, [buf_5, buf_10, buf_6], [448, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[69], layouts[69], infinityBuf, [buf_23, buf_10, buf_6, buf_5, buf_73, buf_74], [8, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[70], layouts[70], infinityBuf, [buf_44, buf_23, buf_75, buf_76], [32, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[71], layouts[71], infinityBuf, [buf_77, buf_10, buf_44, buf_78, buf_79], [8, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[72], layouts[72], infinityBuf, [buf_5, buf_77], [448, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[73], layouts[73], infinityBuf, [buf_6, buf_77, buf_5], [448, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[74], layouts[74], infinityBuf, [buf_80, buf_77, buf_5, buf_6, buf_81, buf_82], [8, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[75], layouts[75], infinityBuf, [buf_10, buf_80, buf_83], [8, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[76], layouts[76], infinityBuf, [buf_84, buf_10], [1792, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[77], layouts[77], infinityBuf, [buf_10, buf_80, buf_85, buf_86], [8, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[78], layouts[78], infinityBuf, [buf_87, buf_10], [1792, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[79], layouts[79], infinityBuf, [buf_88, input1, buf_89], [8, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[80], layouts[80], infinityBuf, [buf_90, input1, buf_91, buf_92], [8, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[81], layouts[81], infinityBuf, [buf_10, buf_80, buf_93, buf_94], [8, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[82], layouts[82], infinityBuf, [buf_23, buf_80, buf_83], [8, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[83], layouts[83], infinityBuf, [buf_24, buf_80, buf_85, buf_86], [8, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[84], layouts[84], infinityBuf, [buf_25, input1, buf_89], [8, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[85], layouts[85], infinityBuf, [buf_26, input1, buf_91, buf_92], [8, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[86], layouts[86], infinityBuf, [buf_27, buf_10, buf_23, buf_28], [7, 14, 2]);
        addComputePass(device, commandEncoder, pipelines[87], layouts[87], infinityBuf, [buf_29, buf_27], [28, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[88], layouts[88], infinityBuf, [buf_30, buf_27, buf_29], [28, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[89], layouts[89], infinityBuf, [buf_31, buf_27, buf_29, buf_30], [7, 336, 1]);
        addComputePass(device, commandEncoder, pipelines[90], layouts[90], infinityBuf, [buf_23, buf_31, buf_24], [14, 6, 1]);
        addComputePass(device, commandEncoder, pipelines[91], layouts[91], infinityBuf, [buf_24, buf_77, buf_23, buf_95, buf_96], [8, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[92], layouts[92], infinityBuf, [buf_6, buf_24], [448, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[93], layouts[93], infinityBuf, [buf_5, buf_24, buf_6], [448, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[94], layouts[94], infinityBuf, [buf_23, buf_24, buf_6, buf_5, buf_97, buf_98], [8, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[95], layouts[95], infinityBuf, [buf_10, buf_23, buf_99, buf_100], [8, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[96], layouts[96], infinityBuf, [buf_38, buf_10, buf_25], [125, 7, 3]);
        addComputePass(device, commandEncoder, pipelines[97], layouts[97], infinityBuf, [buf_30, buf_38], [28, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[98], layouts[98], infinityBuf, [buf_29, buf_38, buf_30], [28, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[99], layouts[99], infinityBuf, [buf_39, buf_38, buf_30, buf_29], [125, 84, 1]);
        addComputePass(device, commandEncoder, pipelines[100], layouts[100], infinityBuf, [buf_10, buf_39, buf_26], [14, 6, 1]);
        addComputePass(device, commandEncoder, pipelines[101], layouts[101], infinityBuf, [buf_23, buf_24, buf_10, buf_101, buf_102], [8, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[102], layouts[102], infinityBuf, [buf_5, buf_23], [448, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[103], layouts[103], infinityBuf, [buf_6, buf_23, buf_5], [448, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[104], layouts[104], infinityBuf, [buf_10, buf_23, buf_5, buf_6, buf_103, buf_104], [8, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[105], layouts[105], infinityBuf, [buf_44, buf_10, buf_105, buf_106], [32, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[106], layouts[106], infinityBuf, [buf_107, buf_23, buf_44, buf_108, buf_109], [8, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[107], layouts[107], infinityBuf, [buf_6, buf_107], [448, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[108], layouts[108], infinityBuf, [buf_5, buf_107, buf_6], [448, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[109], layouts[109], infinityBuf, [buf_110, buf_107, buf_6, buf_5, buf_111, buf_112], [8, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[110], layouts[110], infinityBuf, [buf_23, buf_110, buf_113], [8, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[111], layouts[111], infinityBuf, [buf_114, buf_23], [1792, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[112], layouts[112], infinityBuf, [buf_23, buf_110, buf_115, buf_116], [8, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[113], layouts[113], infinityBuf, [buf_117, buf_23], [1792, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[114], layouts[114], infinityBuf, [buf_118, input1, buf_119], [8, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[115], layouts[115], infinityBuf, [buf_120, input1, buf_121, buf_122], [8, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[116], layouts[116], infinityBuf, [buf_23, buf_110, buf_123, buf_124], [8, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[117], layouts[117], infinityBuf, [buf_10, buf_110, buf_113], [8, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[118], layouts[118], infinityBuf, [buf_24, buf_110, buf_115, buf_116], [8, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[119], layouts[119], infinityBuf, [buf_26, input1, buf_119], [8, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[120], layouts[120], infinityBuf, [buf_25, input1, buf_121, buf_122], [8, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[121], layouts[121], infinityBuf, [buf_31, buf_23, buf_10, buf_28], [7, 14, 2]);
        addComputePass(device, commandEncoder, pipelines[122], layouts[122], infinityBuf, [buf_29, buf_31], [28, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[123], layouts[123], infinityBuf, [buf_30, buf_31, buf_29], [28, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[124], layouts[124], infinityBuf, [buf_27, buf_31, buf_29, buf_30], [7, 336, 1]);
        addComputePass(device, commandEncoder, pipelines[125], layouts[125], infinityBuf, [buf_10, buf_27, buf_24], [14, 6, 1]);
        addComputePass(device, commandEncoder, pipelines[126], layouts[126], infinityBuf, [buf_24, buf_107, buf_10, buf_125, buf_126], [8, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[127], layouts[127], infinityBuf, [buf_5, buf_24], [448, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[128], layouts[128], infinityBuf, [buf_6, buf_24, buf_5], [448, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[129], layouts[129], infinityBuf, [buf_10, buf_24, buf_5, buf_6, buf_127, buf_128], [8, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[130], layouts[130], infinityBuf, [buf_23, buf_10, buf_129, buf_130], [8, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[131], layouts[131], infinityBuf, [buf_39, buf_23, buf_26], [125, 7, 3]);
        addComputePass(device, commandEncoder, pipelines[132], layouts[132], infinityBuf, [buf_30, buf_39], [28, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[133], layouts[133], infinityBuf, [buf_29, buf_39, buf_30], [28, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[134], layouts[134], infinityBuf, [buf_38, buf_39, buf_30, buf_29], [125, 84, 1]);
        addComputePass(device, commandEncoder, pipelines[135], layouts[135], infinityBuf, [buf_23, buf_38, buf_25], [14, 6, 1]);
        addComputePass(device, commandEncoder, pipelines[136], layouts[136], infinityBuf, [buf_10, buf_24, buf_23, buf_131, buf_132], [8, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[137], layouts[137], infinityBuf, [buf_6, buf_10], [448, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[138], layouts[138], infinityBuf, [buf_5, buf_10, buf_6], [448, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[139], layouts[139], infinityBuf, [buf_23, buf_10, buf_6, buf_5, buf_133, buf_134], [8, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[140], layouts[140], infinityBuf, [buf_44, buf_23, buf_135, buf_136], [32, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[141], layouts[141], infinityBuf, [buf_137, buf_10, buf_44, buf_138, buf_139], [8, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[142], layouts[142], infinityBuf, [buf_5, buf_137], [448, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[143], layouts[143], infinityBuf, [buf_6, buf_137, buf_5], [448, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[144], layouts[144], infinityBuf, [buf_10, buf_137, buf_5, buf_6, buf_140, buf_141], [8, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[145], layouts[145], infinityBuf, [buf_142, buf_10, buf_2], [2161, 7, 1]);
        addComputePass(device, commandEncoder, pipelines[146], layouts[146], infinityBuf, [buf_143, buf_142, ctx], [3, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[147], layouts[147], infinityBuf, [buf_144], [2161, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[148], layouts[148], infinityBuf, [buf_145, buf_143], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[149], layouts[149], infinityBuf, [buf_143, buf_142, buf_145, ctx], [3, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[150], layouts[150], infinityBuf, [buf_146, buf_143], [1, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[151], layouts[151], infinityBuf, [buf_147, buf_142, buf_145, buf_146, ctx], [2161, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[152], layouts[152], infinityBuf, [buf_148, buf_147], [64, 2, 2]);
        addComputePass(device, commandEncoder, pipelines[153], layouts[153], infinityBuf, [buf_149, buf_144, buf_147], [2161, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[154], layouts[154], infinityBuf, [buf_150, buf_148], [1024, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[155], layouts[155], infinityBuf, [buf_151, buf_149], [2161, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[156], layouts[156], infinityBuf, [buf_148, buf_150], [256, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[157], layouts[157], infinityBuf, [buf_150, buf_148], [512, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[158], layouts[158], infinityBuf, [buf_148, buf_150], [1024, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[159], layouts[159], infinityBuf, [buf_150, buf_148], [128, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[160], layouts[160], infinityBuf, [buf_148, buf_150], [256, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[161], layouts[161], infinityBuf, [buf_150, buf_148], [512, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[162], layouts[162], infinityBuf, [buf_148, buf_150], [1024, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[163], layouts[163], infinityBuf, [buf_150, buf_148], [128, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[164], layouts[164], infinityBuf, [buf_148, buf_150], [256, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[165], layouts[165], infinityBuf, [buf_150, buf_148], [256, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[166], layouts[166], infinityBuf, [buf_148, buf_150], [512, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[167], layouts[167], infinityBuf, [buf_150, buf_148], [1024, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[168], layouts[168], infinityBuf, [buf_148, buf_150], [128, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[169], layouts[169], infinityBuf, [buf_150, buf_148], [256, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[170], layouts[170], infinityBuf, [buf_148, buf_150], [256, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[171], layouts[171], infinityBuf, [buf_150, buf_148], [256, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[172], layouts[172], infinityBuf, [buf_148, buf_150], [512, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[173], layouts[173], infinityBuf, [buf_150, buf_148], [1024, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[174], layouts[174], infinityBuf, [buf_148, buf_150], [2, 64, 1]);
        addComputePass(device, commandEncoder, pipelines[175], layouts[175], infinityBuf, [buf_150, buf_148], [2, 128, 1]);
        addComputePass(device, commandEncoder, pipelines[176], layouts[176], infinityBuf, [buf_148, buf_150], [256, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[177], layouts[177], infinityBuf, [buf_150, buf_148], [256, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[178], layouts[178], infinityBuf, [buf_148, buf_150], [256, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[179], layouts[179], infinityBuf, [buf_150, buf_148], [512, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[180], layouts[180], infinityBuf, [buf_148, buf_150], [1024, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[181], layouts[181], infinityBuf, [buf_150, buf_148], [4, 32, 1]);
        addComputePass(device, commandEncoder, pipelines[182], layouts[182], infinityBuf, [buf_148, buf_150], [4, 64, 1]);
        addComputePass(device, commandEncoder, pipelines[183], layouts[183], infinityBuf, [buf_150, buf_148], [2, 128, 1]);
        addComputePass(device, commandEncoder, pipelines[184], layouts[184], infinityBuf, [buf_148, buf_150], [256, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[185], layouts[185], infinityBuf, [buf_150, buf_148], [256, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[186], layouts[186], infinityBuf, [buf_148, buf_150], [256, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[187], layouts[187], infinityBuf, [buf_150, buf_148], [512, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[188], layouts[188], infinityBuf, [buf_148, buf_150], [1024, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[189], layouts[189], infinityBuf, [buf_150, buf_148], [8, 16, 1]);
        addComputePass(device, commandEncoder, pipelines[190], layouts[190], infinityBuf, [buf_148, buf_150], [8, 32, 1]);
        addComputePass(device, commandEncoder, pipelines[191], layouts[191], infinityBuf, [buf_150, buf_148], [4, 64, 1]);
        addComputePass(device, commandEncoder, pipelines[192], layouts[192], infinityBuf, [buf_148, buf_150], [2, 128, 1]);
        addComputePass(device, commandEncoder, pipelines[193], layouts[193], infinityBuf, [buf_150, buf_148], [256, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[194], layouts[194], infinityBuf, [buf_148, buf_150], [256, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[195], layouts[195], infinityBuf, [buf_150, buf_148], [256, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[196], layouts[196], infinityBuf, [buf_148, buf_150], [512, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[197], layouts[197], infinityBuf, [buf_150, buf_148], [1024, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[198], layouts[198], infinityBuf, [buf_148, buf_150], [16, 8, 1]);
        addComputePass(device, commandEncoder, pipelines[199], layouts[199], infinityBuf, [buf_150, buf_148], [16, 16, 1]);
        addComputePass(device, commandEncoder, pipelines[200], layouts[200], infinityBuf, [buf_148, buf_150], [8, 32, 1]);
        addComputePass(device, commandEncoder, pipelines[201], layouts[201], infinityBuf, [buf_150, buf_148], [4, 64, 1]);
        addComputePass(device, commandEncoder, pipelines[202], layouts[202], infinityBuf, [buf_148, buf_150], [2, 128, 1]);
        addComputePass(device, commandEncoder, pipelines[203], layouts[203], infinityBuf, [buf_150, buf_148], [256, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[204], layouts[204], infinityBuf, [buf_148, buf_150], [256, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[205], layouts[205], infinityBuf, [buf_150, buf_148], [256, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[206], layouts[206], infinityBuf, [buf_148, buf_150], [512, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[207], layouts[207], infinityBuf, [buf_150, buf_148], [1024, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[208], layouts[208], infinityBuf, [buf_148, buf_150], [32, 4, 1]);
        addComputePass(device, commandEncoder, pipelines[209], layouts[209], infinityBuf, [buf_150, buf_148], [32, 8, 1]);
        addComputePass(device, commandEncoder, pipelines[210], layouts[210], infinityBuf, [buf_148, buf_150], [16, 16, 1]);
        addComputePass(device, commandEncoder, pipelines[211], layouts[211], infinityBuf, [buf_150, buf_148], [8, 32, 1]);
        addComputePass(device, commandEncoder, pipelines[212], layouts[212], infinityBuf, [buf_148, buf_150], [4, 64, 1]);
        addComputePass(device, commandEncoder, pipelines[213], layouts[213], infinityBuf, [buf_150, buf_148], [2, 128, 1]);
        addComputePass(device, commandEncoder, pipelines[214], layouts[214], infinityBuf, [buf_148, buf_150], [256, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[215], layouts[215], infinityBuf, [buf_150, buf_148], [256, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[216], layouts[216], infinityBuf, [buf_148, buf_150], [256, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[217], layouts[217], infinityBuf, [buf_150, buf_148], [512, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[218], layouts[218], infinityBuf, [buf_148, buf_150], [1024, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[219], layouts[219], infinityBuf, [buf_150, buf_148], [64, 2, 1]);
        addComputePass(device, commandEncoder, pipelines[220], layouts[220], infinityBuf, [buf_148, buf_150], [64, 4, 1]);
        addComputePass(device, commandEncoder, pipelines[221], layouts[221], infinityBuf, [buf_150, buf_148], [32, 8, 1]);
        addComputePass(device, commandEncoder, pipelines[222], layouts[222], infinityBuf, [buf_148, buf_150], [16, 16, 1]);
        addComputePass(device, commandEncoder, pipelines[223], layouts[223], infinityBuf, [buf_150, buf_148], [8, 32, 1]);
        addComputePass(device, commandEncoder, pipelines[224], layouts[224], infinityBuf, [buf_148, buf_150], [4, 64, 1]);
        addComputePass(device, commandEncoder, pipelines[225], layouts[225], infinityBuf, [buf_150, buf_148], [2, 128, 1]);
        addComputePass(device, commandEncoder, pipelines[226], layouts[226], infinityBuf, [buf_148, buf_150], [256, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[227], layouts[227], infinityBuf, [buf_150, buf_148], [256, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[228], layouts[228], infinityBuf, [buf_148, buf_150], [256, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[229], layouts[229], infinityBuf, [buf_150, buf_148], [512, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[230], layouts[230], infinityBuf, [buf_148, buf_150], [1024, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[231], layouts[231], infinityBuf, [buf_150, buf_148], [128, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[232], layouts[232], infinityBuf, [buf_148, buf_150], [128, 2, 1]);
        addComputePass(device, commandEncoder, pipelines[233], layouts[233], infinityBuf, [buf_150, buf_148], [64, 4, 1]);
        addComputePass(device, commandEncoder, pipelines[234], layouts[234], infinityBuf, [buf_148, buf_150], [32, 8, 1]);
        addComputePass(device, commandEncoder, pipelines[235], layouts[235], infinityBuf, [buf_150, buf_148], [16, 16, 1]);
        addComputePass(device, commandEncoder, pipelines[236], layouts[236], infinityBuf, [buf_148, buf_150], [8, 32, 1]);
        addComputePass(device, commandEncoder, pipelines[237], layouts[237], infinityBuf, [buf_150, buf_148], [4, 64, 1]);
        addComputePass(device, commandEncoder, pipelines[238], layouts[238], infinityBuf, [buf_148, buf_150], [2, 128, 1]);
        addComputePass(device, commandEncoder, pipelines[239], layouts[239], infinityBuf, [buf_150, buf_148], [256, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[240], layouts[240], infinityBuf, [buf_148, buf_150], [256, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[241], layouts[241], infinityBuf, [buf_150, buf_148], [256, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[242], layouts[242], infinityBuf, [buf_148, buf_150], [512, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[243], layouts[243], infinityBuf, [buf_150, buf_148], [1024, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[244], layouts[244], infinityBuf, [buf_148, buf_150], [256, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[245], layouts[245], infinityBuf, [buf_150, buf_148], [256, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[246], layouts[246], infinityBuf, [buf_148, buf_150], [128, 2, 1]);
        addComputePass(device, commandEncoder, pipelines[247], layouts[247], infinityBuf, [buf_150, buf_148], [64, 4, 1]);
        addComputePass(device, commandEncoder, pipelines[248], layouts[248], infinityBuf, [buf_148, buf_150], [32, 8, 1]);
        addComputePass(device, commandEncoder, pipelines[249], layouts[249], infinityBuf, [buf_150, buf_148], [16, 16, 1]);
        addComputePass(device, commandEncoder, pipelines[250], layouts[250], infinityBuf, [buf_148, buf_150], [8, 32, 1]);
        addComputePass(device, commandEncoder, pipelines[251], layouts[251], infinityBuf, [buf_150, buf_148], [4, 64, 1]);
        addComputePass(device, commandEncoder, pipelines[252], layouts[252], infinityBuf, [buf_148, buf_150], [2, 128, 1]);
        addComputePass(device, commandEncoder, pipelines[253], layouts[253], infinityBuf, [buf_150, buf_148], [256, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[254], layouts[254], infinityBuf, [buf_148, buf_150], [256, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[255], layouts[255], infinityBuf, [buf_150, buf_148], [256, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[256], layouts[256], infinityBuf, [buf_148, buf_150], [512, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[257], layouts[257], infinityBuf, [buf_150, buf_148], [1024, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[258], layouts[258], infinityBuf, [buf_148, buf_150], [512, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[259], layouts[259], infinityBuf, [buf_150, buf_148], [512, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[260], layouts[260], infinityBuf, [buf_148, buf_150], [256, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[261], layouts[261], infinityBuf, [buf_150, buf_148], [128, 2, 1]);
        addComputePass(device, commandEncoder, pipelines[262], layouts[262], infinityBuf, [buf_148, buf_150], [64, 4, 1]);
        addComputePass(device, commandEncoder, pipelines[263], layouts[263], infinityBuf, [buf_150, buf_148], [32, 8, 1]);
        addComputePass(device, commandEncoder, pipelines[264], layouts[264], infinityBuf, [buf_148, buf_150], [16, 16, 1]);
        addComputePass(device, commandEncoder, pipelines[265], layouts[265], infinityBuf, [buf_150, buf_148], [8, 32, 1]);
        addComputePass(device, commandEncoder, pipelines[266], layouts[266], infinityBuf, [buf_148, buf_150], [4, 64, 1]);
        addComputePass(device, commandEncoder, pipelines[267], layouts[267], infinityBuf, [buf_150, buf_148], [2, 128, 1]);
        addComputePass(device, commandEncoder, pipelines[268], layouts[268], infinityBuf, [buf_148, buf_150], [256, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[269], layouts[269], infinityBuf, [buf_150, buf_148], [256, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[270], layouts[270], infinityBuf, [buf_148, buf_150], [256, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[271], layouts[271], infinityBuf, [buf_150, buf_148], [512, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[272], layouts[272], infinityBuf, [buf_148, buf_150], [1024, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[273], layouts[273], infinityBuf, [buf_150, buf_148], [512, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[274], layouts[274], infinityBuf, [buf_148, buf_150], [1024, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[275], layouts[275], infinityBuf, [buf_150, buf_148], [512, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[276], layouts[276], infinityBuf, [buf_148, buf_150], [256, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[277], layouts[277], infinityBuf, [buf_150, buf_148], [128, 2, 1]);
        addComputePass(device, commandEncoder, pipelines[278], layouts[278], infinityBuf, [buf_148, buf_150], [64, 4, 1]);
        addComputePass(device, commandEncoder, pipelines[279], layouts[279], infinityBuf, [buf_150, buf_148], [32, 8, 1]);
        addComputePass(device, commandEncoder, pipelines[280], layouts[280], infinityBuf, [buf_148, buf_150], [16, 16, 1]);
        addComputePass(device, commandEncoder, pipelines[281], layouts[281], infinityBuf, [buf_150, buf_148], [8, 32, 1]);
        addComputePass(device, commandEncoder, pipelines[282], layouts[282], infinityBuf, [buf_148, buf_150], [4, 64, 1]);
        addComputePass(device, commandEncoder, pipelines[283], layouts[283], infinityBuf, [buf_150, buf_148], [2, 128, 1]);
        addComputePass(device, commandEncoder, pipelines[284], layouts[284], infinityBuf, [buf_148, buf_150], [256, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[285], layouts[285], infinityBuf, [buf_150, buf_148], [256, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[286], layouts[286], infinityBuf, [buf_148, buf_150], [256, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[287], layouts[287], infinityBuf, [buf_150, buf_148], [512, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[288], layouts[288], infinityBuf, [buf_148, buf_150], [1024, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[289], layouts[289], infinityBuf, [buf_150, buf_148], [1024, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[290], layouts[290], infinityBuf, [buf_148, buf_150], [1024, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[291], layouts[291], infinityBuf, [buf_150, buf_148], [512, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[292], layouts[292], infinityBuf, [buf_148, buf_150], [256, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[293], layouts[293], infinityBuf, [buf_150, buf_148], [128, 2, 1]);
        addComputePass(device, commandEncoder, pipelines[294], layouts[294], infinityBuf, [buf_148, buf_150], [64, 4, 1]);
        addComputePass(device, commandEncoder, pipelines[295], layouts[295], infinityBuf, [buf_150, buf_148], [32, 8, 1]);
        addComputePass(device, commandEncoder, pipelines[296], layouts[296], infinityBuf, [buf_148, buf_150], [16, 16, 1]);
        addComputePass(device, commandEncoder, pipelines[297], layouts[297], infinityBuf, [buf_150, buf_148], [8, 32, 1]);
        addComputePass(device, commandEncoder, pipelines[298], layouts[298], infinityBuf, [buf_148, buf_150], [4, 64, 1]);
        addComputePass(device, commandEncoder, pipelines[299], layouts[299], infinityBuf, [buf_150, buf_148], [2, 128, 1]);
        addComputePass(device, commandEncoder, pipelines[300], layouts[300], infinityBuf, [buf_148, buf_150], [256, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[301], layouts[301], infinityBuf, [buf_150, buf_148], [256, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[302], layouts[302], infinityBuf, [buf_148, buf_150], [256, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[303], layouts[303], infinityBuf, [buf_150, buf_148], [512, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[304], layouts[304], infinityBuf, [buf_148, buf_150], [1024, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[305], layouts[305], infinityBuf, [buf_149, buf_144, buf_148], [2161, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[306], layouts[306], infinityBuf, [buf_152, buf_149], [2161, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[307], layouts[307], infinityBuf, [buf_149, buf_147, buf_148, buf_151, buf_152, buf_144], [2161, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[308], layouts[308], infinityBuf, [output0, buf_149], [2161, 1, 1]);
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
