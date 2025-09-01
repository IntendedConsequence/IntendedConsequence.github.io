
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

const r_56_16_3_2_16_4_3_4_4322_12966_4 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_4128768:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1_448:array<i32>;
@group(0) @binding(3)var<storage,read_write>data2_39831552:array<f32>;
@compute @workgroup_size(2,16,4) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 3 */
  var gidx1 = i32(gindex.y); /* 16 */
  var gidx2 = i32(gindex.z); /* 56 */
  var lidx0 = i32(lindex.x); /* 2 */
  var lidx1 = i32(lindex.y); /* 16 */
  var lidx2 = i32(lindex.z); /* 4 */
  var precast0 = gidx2;
  var precast1 = lidx0;
  var alu0 = ((gidx0*-13277184)+(lidx2*-3319296));
  var alu1 = ((gidx0*17288)+(lidx2*4322));
  var alu2 = (alu1+4322);
  var alu3 = ((gidx0*13277184)+(gidx1*48)+(lidx1*3)+(lidx2*3319296));
  var precast2 = (bitcast<u32>(precast0)<<3u);
  var precast3 = (bitcast<u32>(precast1)<<2u);
  var alu4 = (bitcast<i32>(precast2)+bitcast<i32>(precast3));
  var val0 = data1_448[alu4];
  var val1 = data1_448[(alu4+1)];
  var val2 = data1_448[(alu4+2)];
  var val3 = data1_448[(alu4+3)];
  var alu5 = (alu3+alu0+(val0*768));
  var alu6 = (alu3+alu0+(val1*768));
  var alu7 = (alu3+alu0+(val2*768));
  var alu8 = (alu3+alu0+(val3*768));
  var alu9 = (((val0<alu1)!=true)&(val0<alu2));
  var val4 = select(0.0f, data2_39831552[(alu5+1)], alu9);
  var val5 = select(0.0f, data2_39831552[(alu5+2)], alu9);
  var val6 = select(0.0f, data2_39831552[alu5], alu9);
  var alu10 = (((val1<alu1)!=true)&(val1<alu2));
  var val7 = select(0.0f, data2_39831552[(alu6+1)], alu10);
  var val8 = select(0.0f, data2_39831552[(alu6+2)], alu10);
  var val9 = select(0.0f, data2_39831552[alu6], alu10);
  var alu11 = (((val2<alu1)!=true)&(val2<alu2));
  var val10 = select(0.0f, data2_39831552[(alu7+1)], alu11);
  var val11 = select(0.0f, data2_39831552[(alu7+2)], alu11);
  var val12 = select(0.0f, data2_39831552[alu7], alu11);
  var alu12 = (((val3<alu1)!=true)&(val3<alu2));
  var val13 = select(0.0f, data2_39831552[(alu8+1)], alu12);
  var val14 = select(0.0f, data2_39831552[(alu8+2)], alu12);
  var val15 = select(0.0f, data2_39831552[alu8], alu12);
  var precast4 = gidx0;
  var precast5 = (bitcast<u32>(precast4)<<2u);
  var alu13 = (lidx2+(gidx1*576)+(gidx2*73728)+bitcast<i32>(precast5)+(lidx0*36864)+(lidx1*36));
  data0_4128768[alu13] = val6;
  data0_4128768[(alu13+12)] = val4;
  data0_4128768[(alu13+24)] = val5;
  data0_4128768[(alu13+9216)] = val9;
  data0_4128768[(alu13+9228)] = val7;
  data0_4128768[(alu13+9240)] = val8;
  data0_4128768[(alu13+18432)] = val12;
  data0_4128768[(alu13+18444)] = val10;
  data0_4128768[(alu13+18456)] = val11;
  data0_4128768[(alu13+27648)] = val15;
  data0_4128768[(alu13+27660)] = val13;
  data0_4128768[(alu13+27672)] = val14;
}`;

const r_3584_32_3_12 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_344064:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1_4128768:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2_344064:array<f32>;
@compute @workgroup_size(32) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 3584 */
  var lidx0 = i32(lindex.x); /* 32 */
  var alu0 = ((gidx0*96)+(lidx0*3));
  var val0 = data2_344064[alu0];
  var alu1 = (alu0+1);
  var val1 = data2_344064[alu1];
  var alu2 = (alu0+2);
  var val2 = data2_344064[alu2];
  var alu3 = ((gidx0*1152)+(lidx0*36));
  var val3 = data1_4128768[alu3];
  var val4 = data1_4128768[(alu3+1)];
  var val5 = data1_4128768[(alu3+2)];
  var val6 = data1_4128768[(alu3+3)];
  var val7 = data1_4128768[(alu3+4)];
  var val8 = data1_4128768[(alu3+5)];
  var val9 = data1_4128768[(alu3+6)];
  var val10 = data1_4128768[(alu3+7)];
  var val11 = data1_4128768[(alu3+8)];
  var val12 = data1_4128768[(alu3+9)];
  var val13 = data1_4128768[(alu3+10)];
  var val14 = data1_4128768[(alu3+11)];
  var val15 = data1_4128768[(alu3+12)];
  var val16 = data1_4128768[(alu3+13)];
  var val17 = data1_4128768[(alu3+14)];
  var val18 = data1_4128768[(alu3+15)];
  var val19 = data1_4128768[(alu3+16)];
  var val20 = data1_4128768[(alu3+17)];
  var val21 = data1_4128768[(alu3+18)];
  var val22 = data1_4128768[(alu3+19)];
  var val23 = data1_4128768[(alu3+20)];
  var val24 = data1_4128768[(alu3+21)];
  var val25 = data1_4128768[(alu3+22)];
  var val26 = data1_4128768[(alu3+23)];
  var val27 = data1_4128768[(alu3+24)];
  var val28 = data1_4128768[(alu3+25)];
  var val29 = data1_4128768[(alu3+26)];
  var val30 = data1_4128768[(alu3+27)];
  var val31 = data1_4128768[(alu3+28)];
  var val32 = data1_4128768[(alu3+29)];
  var val33 = data1_4128768[(alu3+30)];
  var val34 = data1_4128768[(alu3+31)];
  var val35 = data1_4128768[(alu3+32)];
  var val36 = data1_4128768[(alu3+33)];
  var val37 = data1_4128768[(alu3+34)];
  var val38 = data1_4128768[(alu3+35)];
  data0_344064[alu1] = (val15+val16+val17+val18+val19+val20+val21+val22+val23+val24+val25+val26+val1);
  data0_344064[alu2] = (val27+val28+val29+val30+val31+val32+val33+val34+val35+val36+val37+val38+val2);
  data0_344064[alu0] = (val3+val4+val5+val6+val7+val8+val9+val10+val11+val12+val13+val14+val0);
}`;

const r_448_16_48 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
var<workgroup> temp0: array<f32,16>;
@group(0) @binding(1)var<storage,read_write>data0_448:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1_344064:array<f32>;
@compute @workgroup_size(16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var acc0: array<f32,1>;
  var acc1: array<f32,1>;
  var gidx0 = i32(gindex.x); /* 448 */
  var lidx0 = i32(lindex.x); /* 16 */
  acc1[0] = 0.0f;
  acc0[0] = 0.0f;
  for (var ridx1002 = 0; ridx1002 < 48; ridx1002++) {
    var val0 = data1_344064[((gidx0*768)+(lidx0*48)+ridx1002)];
    acc0[0] = (acc0[0]+val0);
  }
  temp0[lidx0] = acc0[0];
  workgroupBarrier();
  if (((bool(lidx0))!=true)) {
    for (var ridx1101 = 0; ridx1101 < 16; ridx1101++) {
      var val1 = temp0[ridx1101];
      acc1[0] = (acc1[0]+val1);
    }
    data0_448[gidx0] = (acc1[0]*0.0013020833333333333f);
  }
}`;

const r_448_16_48n1 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
var<workgroup> temp0: array<f32,16>;
@group(0) @binding(1)var<storage,read_write>data0_448:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1_344064:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2_448:array<f32>;
@compute @workgroup_size(16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var acc0: array<f32,1>;
  var acc1: array<f32,1>;
  var gidx0 = i32(gindex.x); /* 448 */
  var lidx0 = i32(lindex.x); /* 16 */
  acc1[0] = 0.0f;
  acc0[0] = 0.0f;
  var val0 = data2_448[gidx0];
  for (var ridx1002 = 0; ridx1002 < 48; ridx1002++) {
    var val1 = data1_344064[((gidx0*768)+(lidx0*48)+ridx1002)];
    var alu2 = (val1-val0);
    acc0[0] = (acc0[0]+(alu2*alu2));
  }
  temp0[lidx0] = acc0[0];
  workgroupBarrier();
  if (((bool(lidx0))!=true)) {
    for (var ridx1101 = 0; ridx1101 < 16; ridx1101++) {
      var val2 = temp0[ridx1101];
      acc1[0] = (acc1[0]+val2);
    }
    data0_448[gidx0] = (1/sqrt(((acc1[0]*0.0013020833333333333f)+1e-05f)));
  }
}`;

const E_14_16_8_16_3_4 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_344064:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1_344064:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2_448:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3_448:array<f32>;
@group(0) @binding(5)var<storage,read_write>data4_768:array<f32>;
@group(0) @binding(6)var<storage,read_write>data5_768:array<f32>;
@compute @workgroup_size(8,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 16 */
  var gidx1 = i32(gindex.y); /* 14 */
  var lidx0 = i32(lindex.x); /* 8 */
  var lidx1 = i32(lindex.y); /* 16 */
  var precast0 = gidx1;
  var precast1 = lidx0;
  var alu0 = (gidx0*48);
  var alu1 = (lidx1*3);
  var alu2 = (alu0+(gidx1*24576)+(lidx0*3072)+alu1);
  var val0 = data1_344064[alu2];
  var alu3 = (alu2+1);
  var val1 = data1_344064[alu3];
  var alu4 = (alu2+2);
  var val2 = data1_344064[alu4];
  var alu5 = (alu2+768);
  var val3 = data1_344064[alu5];
  var alu6 = (alu2+769);
  var val4 = data1_344064[alu6];
  var alu7 = (alu2+770);
  var val5 = data1_344064[alu7];
  var alu8 = (alu2+1536);
  var val6 = data1_344064[alu8];
  var alu9 = (alu2+1537);
  var val7 = data1_344064[alu9];
  var alu10 = (alu2+1538);
  var val8 = data1_344064[alu10];
  var alu11 = (alu2+2304);
  var val9 = data1_344064[alu11];
  var alu12 = (alu2+2305);
  var val10 = data1_344064[alu12];
  var alu13 = (alu2+2306);
  var val11 = data1_344064[alu13];
  var alu14 = (alu0+alu1);
  var val12 = data4_768[alu14];
  var val13 = data5_768[alu14];
  var alu15 = (alu14+1);
  var val14 = data4_768[alu15];
  var val15 = data5_768[alu15];
  var alu16 = (alu14+2);
  var val16 = data4_768[alu16];
  var val17 = data5_768[alu16];
  var precast2 = (bitcast<u32>(precast0)<<5u);
  var precast3 = (bitcast<u32>(precast1)<<2u);
  var alu17 = (bitcast<i32>(precast2)+bitcast<i32>(precast3));
  var val18 = data2_448[alu17];
  var val19 = data3_448[alu17];
  var alu18 = (alu17+1);
  var val20 = data2_448[alu18];
  var val21 = data3_448[alu18];
  var alu19 = (alu17+2);
  var val22 = data2_448[alu19];
  var val23 = data3_448[alu19];
  var alu20 = (alu17+3);
  var val24 = data2_448[alu20];
  var val25 = data3_448[alu20];
  data0_344064[alu3] = (((val1-val18)*val19*val14)+val15);
  data0_344064[alu4] = (((val2-val18)*val19*val16)+val17);
  data0_344064[alu5] = (((val3-val20)*val21*val12)+val13);
  data0_344064[alu6] = (((val4-val20)*val21*val14)+val15);
  data0_344064[alu7] = (((val5-val20)*val21*val16)+val17);
  data0_344064[alu8] = (((val6-val22)*val23*val12)+val13);
  data0_344064[alu9] = (((val7-val22)*val23*val14)+val15);
  data0_344064[alu10] = (((val8-val22)*val23*val16)+val17);
  data0_344064[alu11] = (((val9-val24)*val25*val12)+val13);
  data0_344064[alu12] = (((val10-val24)*val25*val14)+val15);
  data0_344064[alu13] = (((val11-val24)*val25*val16)+val17);
  data0_344064[alu2] = (((val0-val18)*val19*val12)+val13);
}`;

const r_14_16_8_16_3_4_192_4 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_344064:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1_344064:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2_589824:array<f32>;
@compute @workgroup_size(8,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var acc0: array<f32,12>;
  var gidx0 = i32(gindex.x); /* 16 */
  var gidx1 = i32(gindex.y); /* 14 */
  var lidx0 = i32(lindex.x); /* 8 */
  var lidx1 = i32(lindex.y); /* 16 */
  var alu0 = (lidx0*3072);
  var alu1 = (gidx1*24576);
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
  for (var ridx1006 = 0; ridx1006 < 192; ridx1006++) {
    var precast0 = ridx1006;
    var precast1 = (bitcast<u32>(precast0)<<2u);
    var cast0 = bitcast<i32>(precast1);
    var alu14 = ((gidx0*36864)+(lidx1*2304)+cast0);
    var val0 = data2_589824[alu14];
    var val1 = data2_589824[(alu14+1)];
    var val2 = data2_589824[(alu14+2)];
    var val3 = data2_589824[(alu14+3)];
    var val4 = data2_589824[(alu14+768)];
    var val5 = data2_589824[(alu14+769)];
    var val6 = data2_589824[(alu14+770)];
    var val7 = data2_589824[(alu14+771)];
    var val8 = data2_589824[(alu14+1536)];
    var val9 = data2_589824[(alu14+1537)];
    var val10 = data2_589824[(alu14+1538)];
    var val11 = data2_589824[(alu14+1539)];
    var alu15 = (alu1+alu0+cast0);
    var val12 = data1_344064[alu15];
    var val13 = data1_344064[(alu15+1)];
    var val14 = data1_344064[(alu15+2)];
    var val15 = data1_344064[(alu15+3)];
    var val16 = data1_344064[(alu15+768)];
    var val17 = data1_344064[(alu15+769)];
    var val18 = data1_344064[(alu15+770)];
    var val19 = data1_344064[(alu15+771)];
    var val20 = data1_344064[(alu15+1536)];
    var val21 = data1_344064[(alu15+1537)];
    var val22 = data1_344064[(alu15+1538)];
    var val23 = data1_344064[(alu15+1539)];
    var val24 = data1_344064[(alu15+2304)];
    var val25 = data1_344064[(alu15+2305)];
    var val26 = data1_344064[(alu15+2306)];
    var val27 = data1_344064[(alu15+2307)];
    acc0[1] = (acc0[1]+(val16*val0)+(val17*val1)+(val18*val2)+(val19*val3));
    acc0[5] = (acc0[5]+(val16*val4)+(val17*val5)+(val18*val6)+(val19*val7));
    acc0[9] = (acc0[9]+(val16*val8)+(val17*val9)+(val18*val10)+(val19*val11));
    acc0[2] = (acc0[2]+(val20*val0)+(val21*val1)+(val22*val2)+(val23*val3));
    acc0[6] = (acc0[6]+(val20*val4)+(val21*val5)+(val22*val6)+(val23*val7));
    acc0[10] = (acc0[10]+(val20*val8)+(val21*val9)+(val22*val10)+(val23*val11));
    acc0[3] = (acc0[3]+(val24*val0)+(val25*val1)+(val26*val2)+(val27*val3));
    acc0[7] = (acc0[7]+(val24*val4)+(val25*val5)+(val26*val6)+(val27*val7));
    acc0[11] = (acc0[11]+(val24*val8)+(val25*val9)+(val26*val10)+(val27*val11));
    acc0[4] = (acc0[4]+(val12*val4)+(val13*val5)+(val14*val6)+(val15*val7));
    acc0[8] = (acc0[8]+(val12*val8)+(val13*val9)+(val14*val10)+(val15*val11));
    acc0[0] = (acc0[0]+(val12*val0)+(val13*val1)+(val14*val2)+(val15*val3));
  }
  var alu29 = ((gidx0*48)+alu1+alu0+(lidx1*3));
  data0_344064[alu29] = acc0[0];
  data0_344064[(alu29+1)] = acc0[4];
  data0_344064[(alu29+2)] = acc0[8];
  data0_344064[(alu29+768)] = acc0[1];
  data0_344064[(alu29+769)] = acc0[5];
  data0_344064[(alu29+770)] = acc0[9];
  data0_344064[(alu29+1536)] = acc0[2];
  data0_344064[(alu29+1537)] = acc0[6];
  data0_344064[(alu29+1538)] = acc0[10];
  data0_344064[(alu29+2304)] = acc0[3];
  data0_344064[(alu29+2305)] = acc0[7];
  data0_344064[(alu29+2306)] = acc0[11];
}`;

const E_3584_32_3n1 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_344064:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1_344064:array<f32>;
@compute @workgroup_size(32) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 3584 */
  var lidx0 = i32(lindex.x); /* 32 */
  var alu0 = ((gidx0*96)+(lidx0*3));
  var val0 = data1_344064[alu0];
  var alu1 = (alu0+1);
  var val1 = data1_344064[alu1];
  var alu2 = (alu0+2);
  var val2 = data1_344064[alu2];
  data0_344064[alu1] = val1;
  data0_344064[alu2] = val2;
  data0_344064[alu0] = val0;
}`;

const r_14_16_8_16_4_3_192_4 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_344064:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1_344064:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2_589824:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3_768:array<f32>;
@compute @workgroup_size(8,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var acc0: array<f32,12>;
  var gidx0 = i32(gindex.x); /* 16 */
  var gidx1 = i32(gindex.y); /* 14 */
  var lidx0 = i32(lindex.x); /* 8 */
  var lidx1 = i32(lindex.y); /* 16 */
  var alu0 = (lidx0*3072);
  var alu1 = (gidx1*24576);
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
  for (var ridx1006 = 0; ridx1006 < 192; ridx1006++) {
    var precast0 = ridx1006;
    var precast1 = (bitcast<u32>(precast0)<<2u);
    var cast0 = bitcast<i32>(precast1);
    var alu14 = ((gidx0*36864)+(lidx1*2304)+cast0);
    var val0 = data2_589824[alu14];
    var val1 = data2_589824[(alu14+1)];
    var val2 = data2_589824[(alu14+2)];
    var val3 = data2_589824[(alu14+3)];
    var val4 = data2_589824[(alu14+768)];
    var val5 = data2_589824[(alu14+769)];
    var val6 = data2_589824[(alu14+770)];
    var val7 = data2_589824[(alu14+771)];
    var val8 = data2_589824[(alu14+1536)];
    var val9 = data2_589824[(alu14+1537)];
    var val10 = data2_589824[(alu14+1538)];
    var val11 = data2_589824[(alu14+1539)];
    var alu15 = (alu1+alu0+cast0);
    var val12 = data1_344064[alu15];
    var val13 = data1_344064[(alu15+1)];
    var val14 = data1_344064[(alu15+2)];
    var val15 = data1_344064[(alu15+3)];
    var val16 = data1_344064[(alu15+768)];
    var val17 = data1_344064[(alu15+769)];
    var val18 = data1_344064[(alu15+770)];
    var val19 = data1_344064[(alu15+771)];
    var val20 = data1_344064[(alu15+1536)];
    var val21 = data1_344064[(alu15+1537)];
    var val22 = data1_344064[(alu15+1538)];
    var val23 = data1_344064[(alu15+1539)];
    var val24 = data1_344064[(alu15+2304)];
    var val25 = data1_344064[(alu15+2305)];
    var val26 = data1_344064[(alu15+2306)];
    var val27 = data1_344064[(alu15+2307)];
    acc0[3] = (acc0[3]+(val16*val0)+(val17*val1)+(val18*val2)+(val19*val3));
    acc0[4] = (acc0[4]+(val16*val4)+(val17*val5)+(val18*val6)+(val19*val7));
    acc0[5] = (acc0[5]+(val16*val8)+(val17*val9)+(val18*val10)+(val19*val11));
    acc0[6] = (acc0[6]+(val20*val0)+(val21*val1)+(val22*val2)+(val23*val3));
    acc0[7] = (acc0[7]+(val20*val4)+(val21*val5)+(val22*val6)+(val23*val7));
    acc0[8] = (acc0[8]+(val20*val8)+(val21*val9)+(val22*val10)+(val23*val11));
    acc0[9] = (acc0[9]+(val24*val0)+(val25*val1)+(val26*val2)+(val27*val3));
    acc0[10] = (acc0[10]+(val24*val4)+(val25*val5)+(val26*val6)+(val27*val7));
    acc0[11] = (acc0[11]+(val24*val8)+(val25*val9)+(val26*val10)+(val27*val11));
    acc0[1] = (acc0[1]+(val12*val4)+(val13*val5)+(val14*val6)+(val15*val7));
    acc0[2] = (acc0[2]+(val12*val8)+(val13*val9)+(val14*val10)+(val15*val11));
    acc0[0] = (acc0[0]+(val12*val0)+(val13*val1)+(val14*val2)+(val15*val3));
  }
  var alu29 = (gidx0*48);
  var alu30 = (lidx1*3);
  var alu31 = (alu29+alu30);
  var val28 = data3_768[alu31];
  var val29 = data3_768[(alu31+1)];
  var val30 = data3_768[(alu31+2)];
  var alu32 = (alu29+alu1+alu0+alu30);
  data0_344064[alu32] = (acc0[0]+val28);
  data0_344064[(alu32+1)] = (acc0[1]+val29);
  data0_344064[(alu32+2)] = (acc0[2]+val30);
  data0_344064[(alu32+768)] = (acc0[3]+val28);
  data0_344064[(alu32+769)] = (acc0[4]+val29);
  data0_344064[(alu32+770)] = (acc0[5]+val30);
  data0_344064[(alu32+1536)] = (acc0[6]+val28);
  data0_344064[(alu32+1537)] = (acc0[7]+val29);
  data0_344064[(alu32+1538)] = (acc0[8]+val30);
  data0_344064[(alu32+2304)] = (acc0[9]+val28);
  data0_344064[(alu32+2305)] = (acc0[10]+val29);
  data0_344064[(alu32+2306)] = (acc0[11]+val30);
}`;

const r_125_16_4_16_3_3_192_4n4 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_1152000:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1_1152000:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2_589824:array<f32>;
@compute @workgroup_size(4,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var acc0: array<f32,9>;
  var gidx0 = i32(gindex.x); /* 16 */
  var gidx1 = i32(gindex.y); /* 125 */
  var lidx0 = i32(lindex.x); /* 4 */
  var lidx1 = i32(lindex.y); /* 16 */
  var alu0 = (lidx0*2304);
  var alu1 = (gidx1*9216);
  acc0[0] = 0.0f;
  acc0[1] = 0.0f;
  acc0[2] = 0.0f;
  acc0[3] = 0.0f;
  acc0[4] = 0.0f;
  acc0[5] = 0.0f;
  acc0[6] = 0.0f;
  acc0[7] = 0.0f;
  acc0[8] = 0.0f;
  for (var ridx1006 = 0; ridx1006 < 192; ridx1006++) {
    var precast0 = ridx1006;
    var precast1 = (bitcast<u32>(precast0)<<2u);
    var cast0 = bitcast<i32>(precast1);
    var alu11 = ((gidx0*36864)+(lidx1*2304)+cast0);
    var val0 = data2_589824[alu11];
    var val1 = data2_589824[(alu11+1)];
    var val2 = data2_589824[(alu11+2)];
    var val3 = data2_589824[(alu11+3)];
    var val4 = data2_589824[(alu11+768)];
    var val5 = data2_589824[(alu11+769)];
    var val6 = data2_589824[(alu11+770)];
    var val7 = data2_589824[(alu11+771)];
    var val8 = data2_589824[(alu11+1536)];
    var val9 = data2_589824[(alu11+1537)];
    var val10 = data2_589824[(alu11+1538)];
    var val11 = data2_589824[(alu11+1539)];
    var alu12 = (alu1+alu0+cast0);
    var val12 = data1_1152000[alu12];
    var val13 = data1_1152000[(alu12+1)];
    var val14 = data1_1152000[(alu12+2)];
    var val15 = data1_1152000[(alu12+3)];
    var val16 = data1_1152000[(alu12+768)];
    var val17 = data1_1152000[(alu12+769)];
    var val18 = data1_1152000[(alu12+770)];
    var val19 = data1_1152000[(alu12+771)];
    var val20 = data1_1152000[(alu12+1536)];
    var val21 = data1_1152000[(alu12+1537)];
    var val22 = data1_1152000[(alu12+1538)];
    var val23 = data1_1152000[(alu12+1539)];
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
  var alu23 = ((gidx0*48)+alu1+alu0+(lidx1*3));
  data0_1152000[alu23] = acc0[0];
  data0_1152000[(alu23+1)] = acc0[3];
  data0_1152000[(alu23+2)] = acc0[6];
  data0_1152000[(alu23+768)] = acc0[1];
  data0_1152000[(alu23+769)] = acc0[4];
  data0_1152000[(alu23+770)] = acc0[7];
  data0_1152000[(alu23+1536)] = acc0[2];
  data0_1152000[(alu23+1537)] = acc0[5];
  data0_1152000[(alu23+1538)] = acc0[8];
}`;

const r_125_16_4_16_3_3_192_4 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_1152000:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1_1152000:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2_589824:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3_768:array<f32>;
@compute @workgroup_size(4,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var acc0: array<f32,9>;
  var gidx0 = i32(gindex.x); /* 16 */
  var gidx1 = i32(gindex.y); /* 125 */
  var lidx0 = i32(lindex.x); /* 4 */
  var lidx1 = i32(lindex.y); /* 16 */
  var alu0 = (lidx0*2304);
  var alu1 = (gidx1*9216);
  acc0[0] = 0.0f;
  acc0[1] = 0.0f;
  acc0[2] = 0.0f;
  acc0[3] = 0.0f;
  acc0[4] = 0.0f;
  acc0[5] = 0.0f;
  acc0[6] = 0.0f;
  acc0[7] = 0.0f;
  acc0[8] = 0.0f;
  for (var ridx1006 = 0; ridx1006 < 192; ridx1006++) {
    var precast0 = ridx1006;
    var precast1 = (bitcast<u32>(precast0)<<2u);
    var cast0 = bitcast<i32>(precast1);
    var alu11 = ((gidx0*36864)+(lidx1*2304)+cast0);
    var val0 = data2_589824[alu11];
    var val1 = data2_589824[(alu11+1)];
    var val2 = data2_589824[(alu11+2)];
    var val3 = data2_589824[(alu11+3)];
    var val4 = data2_589824[(alu11+768)];
    var val5 = data2_589824[(alu11+769)];
    var val6 = data2_589824[(alu11+770)];
    var val7 = data2_589824[(alu11+771)];
    var val8 = data2_589824[(alu11+1536)];
    var val9 = data2_589824[(alu11+1537)];
    var val10 = data2_589824[(alu11+1538)];
    var val11 = data2_589824[(alu11+1539)];
    var alu12 = (alu1+alu0+cast0);
    var val12 = data1_1152000[alu12];
    var val13 = data1_1152000[(alu12+1)];
    var val14 = data1_1152000[(alu12+2)];
    var val15 = data1_1152000[(alu12+3)];
    var val16 = data1_1152000[(alu12+768)];
    var val17 = data1_1152000[(alu12+769)];
    var val18 = data1_1152000[(alu12+770)];
    var val19 = data1_1152000[(alu12+771)];
    var val20 = data1_1152000[(alu12+1536)];
    var val21 = data1_1152000[(alu12+1537)];
    var val22 = data1_1152000[(alu12+1538)];
    var val23 = data1_1152000[(alu12+1539)];
    acc0[3] = (acc0[3]+(val16*val0)+(val17*val1)+(val18*val2)+(val19*val3));
    acc0[4] = (acc0[4]+(val16*val4)+(val17*val5)+(val18*val6)+(val19*val7));
    acc0[5] = (acc0[5]+(val16*val8)+(val17*val9)+(val18*val10)+(val19*val11));
    acc0[6] = (acc0[6]+(val20*val0)+(val21*val1)+(val22*val2)+(val23*val3));
    acc0[7] = (acc0[7]+(val20*val4)+(val21*val5)+(val22*val6)+(val23*val7));
    acc0[8] = (acc0[8]+(val20*val8)+(val21*val9)+(val22*val10)+(val23*val11));
    acc0[1] = (acc0[1]+(val12*val4)+(val13*val5)+(val14*val6)+(val15*val7));
    acc0[2] = (acc0[2]+(val12*val8)+(val13*val9)+(val14*val10)+(val15*val11));
    acc0[0] = (acc0[0]+(val12*val0)+(val13*val1)+(val14*val2)+(val15*val3));
  }
  var alu23 = (gidx0*48);
  var alu24 = (lidx1*3);
  var alu25 = (alu23+alu24);
  var val24 = data3_768[alu25];
  var val25 = data3_768[(alu25+1)];
  var val26 = data3_768[(alu25+2)];
  var alu26 = (alu23+alu1+alu0+alu24);
  data0_1152000[alu26] = (acc0[0]+val24);
  data0_1152000[(alu26+1)] = (acc0[1]+val25);
  data0_1152000[(alu26+2)] = (acc0[2]+val26);
  data0_1152000[(alu26+768)] = (acc0[3]+val24);
  data0_1152000[(alu26+769)] = (acc0[4]+val25);
  data0_1152000[(alu26+770)] = (acc0[5]+val26);
  data0_1152000[(alu26+1536)] = (acc0[6]+val24);
  data0_1152000[(alu26+1537)] = (acc0[7]+val25);
  data0_1152000[(alu26+1538)] = (acc0[8]+val26);
}`;

const r_14_16_8_16_3_4_192_4n1 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_344064:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1_344064:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2_589824:array<f32>;
@compute @workgroup_size(8,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var acc0: array<f32,12>;
  var gidx0 = i32(gindex.x); /* 16 */
  var gidx1 = i32(gindex.y); /* 14 */
  var lidx0 = i32(lindex.x); /* 8 */
  var lidx1 = i32(lindex.y); /* 16 */
  var alu0 = (lidx0*3072);
  var alu1 = (gidx1*24576);
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
  for (var ridx1006 = 0; ridx1006 < 192; ridx1006++) {
    var precast0 = ridx1006;
    var precast1 = (bitcast<u32>(precast0)<<2u);
    var cast0 = bitcast<i32>(precast1);
    var alu14 = ((gidx0*36864)+(lidx1*2304)+cast0);
    var val0 = data2_589824[alu14];
    var val1 = data2_589824[(alu14+1)];
    var val2 = data2_589824[(alu14+2)];
    var val3 = data2_589824[(alu14+3)];
    var val4 = data2_589824[(alu14+768)];
    var val5 = data2_589824[(alu14+769)];
    var val6 = data2_589824[(alu14+770)];
    var val7 = data2_589824[(alu14+771)];
    var val8 = data2_589824[(alu14+1536)];
    var val9 = data2_589824[(alu14+1537)];
    var val10 = data2_589824[(alu14+1538)];
    var val11 = data2_589824[(alu14+1539)];
    var alu15 = (alu1+alu0+cast0);
    var val12 = data1_344064[alu15];
    var val13 = data1_344064[(alu15+1)];
    var val14 = data1_344064[(alu15+2)];
    var val15 = data1_344064[(alu15+3)];
    var val16 = data1_344064[(alu15+768)];
    var val17 = data1_344064[(alu15+769)];
    var val18 = data1_344064[(alu15+770)];
    var val19 = data1_344064[(alu15+771)];
    var val20 = data1_344064[(alu15+1536)];
    var val21 = data1_344064[(alu15+1537)];
    var val22 = data1_344064[(alu15+1538)];
    var val23 = data1_344064[(alu15+1539)];
    var val24 = data1_344064[(alu15+2304)];
    var val25 = data1_344064[(alu15+2305)];
    var val26 = data1_344064[(alu15+2306)];
    var val27 = data1_344064[(alu15+2307)];
    acc0[1] = (acc0[1]+(val16*val0)+(val17*val1)+(val18*val2)+(val19*val3));
    acc0[5] = (acc0[5]+(val16*val4)+(val17*val5)+(val18*val6)+(val19*val7));
    acc0[9] = (acc0[9]+(val16*val8)+(val17*val9)+(val18*val10)+(val19*val11));
    acc0[2] = (acc0[2]+(val20*val0)+(val21*val1)+(val22*val2)+(val23*val3));
    acc0[6] = (acc0[6]+(val20*val4)+(val21*val5)+(val22*val6)+(val23*val7));
    acc0[10] = (acc0[10]+(val20*val8)+(val21*val9)+(val22*val10)+(val23*val11));
    acc0[3] = (acc0[3]+(val24*val0)+(val25*val1)+(val26*val2)+(val27*val3));
    acc0[7] = (acc0[7]+(val24*val4)+(val25*val5)+(val26*val6)+(val27*val7));
    acc0[11] = (acc0[11]+(val24*val8)+(val25*val9)+(val26*val10)+(val27*val11));
    acc0[4] = (acc0[4]+(val12*val4)+(val13*val5)+(val14*val6)+(val15*val7));
    acc0[8] = (acc0[8]+(val12*val8)+(val13*val9)+(val14*val10)+(val15*val11));
    acc0[0] = (acc0[0]+(val12*val0)+(val13*val1)+(val14*val2)+(val15*val3));
  }
  var alu29 = ((gidx0*48)+alu1+alu0+(lidx1*3));
  data0_344064[alu29] = acc0[0];
  data0_344064[(alu29+1)] = acc0[4];
  data0_344064[(alu29+2)] = acc0[8];
  data0_344064[(alu29+768)] = acc0[1];
  data0_344064[(alu29+769)] = acc0[5];
  data0_344064[(alu29+770)] = acc0[9];
  data0_344064[(alu29+1536)] = acc0[2];
  data0_344064[(alu29+1537)] = acc0[6];
  data0_344064[(alu29+1538)] = acc0[10];
  data0_344064[(alu29+2304)] = acc0[3];
  data0_344064[(alu29+2305)] = acc0[7];
  data0_344064[(alu29+2306)] = acc0[11];
}`;

const r_125_16_4_16_3_3_192_4n1 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_1152000:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1_1152000:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2_589824:array<f32>;
@compute @workgroup_size(4,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var acc0: array<f32,9>;
  var gidx0 = i32(gindex.x); /* 16 */
  var gidx1 = i32(gindex.y); /* 125 */
  var lidx0 = i32(lindex.x); /* 4 */
  var lidx1 = i32(lindex.y); /* 16 */
  var alu0 = (lidx0*2304);
  var alu1 = (gidx1*9216);
  acc0[0] = 0.0f;
  acc0[1] = 0.0f;
  acc0[2] = 0.0f;
  acc0[3] = 0.0f;
  acc0[4] = 0.0f;
  acc0[5] = 0.0f;
  acc0[6] = 0.0f;
  acc0[7] = 0.0f;
  acc0[8] = 0.0f;
  for (var ridx1006 = 0; ridx1006 < 192; ridx1006++) {
    var precast0 = ridx1006;
    var precast1 = (bitcast<u32>(precast0)<<2u);
    var cast0 = bitcast<i32>(precast1);
    var alu11 = ((gidx0*36864)+(lidx1*2304)+cast0);
    var val0 = data2_589824[alu11];
    var val1 = data2_589824[(alu11+1)];
    var val2 = data2_589824[(alu11+2)];
    var val3 = data2_589824[(alu11+3)];
    var val4 = data2_589824[(alu11+768)];
    var val5 = data2_589824[(alu11+769)];
    var val6 = data2_589824[(alu11+770)];
    var val7 = data2_589824[(alu11+771)];
    var val8 = data2_589824[(alu11+1536)];
    var val9 = data2_589824[(alu11+1537)];
    var val10 = data2_589824[(alu11+1538)];
    var val11 = data2_589824[(alu11+1539)];
    var alu12 = (alu1+alu0+cast0);
    var val12 = data1_1152000[alu12];
    var val13 = data1_1152000[(alu12+1)];
    var val14 = data1_1152000[(alu12+2)];
    var val15 = data1_1152000[(alu12+3)];
    var val16 = data1_1152000[(alu12+768)];
    var val17 = data1_1152000[(alu12+769)];
    var val18 = data1_1152000[(alu12+770)];
    var val19 = data1_1152000[(alu12+771)];
    var val20 = data1_1152000[(alu12+1536)];
    var val21 = data1_1152000[(alu12+1537)];
    var val22 = data1_1152000[(alu12+1538)];
    var val23 = data1_1152000[(alu12+1539)];
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
  var alu23 = ((gidx0*48)+alu1+alu0+(lidx1*3));
  data0_1152000[alu23] = acc0[0];
  data0_1152000[(alu23+1)] = acc0[3];
  data0_1152000[(alu23+2)] = acc0[6];
  data0_1152000[(alu23+768)] = acc0[1];
  data0_1152000[(alu23+769)] = acc0[4];
  data0_1152000[(alu23+770)] = acc0[7];
  data0_1152000[(alu23+1536)] = acc0[2];
  data0_1152000[(alu23+1537)] = acc0[5];
  data0_1152000[(alu23+1538)] = acc0[8];
}`;

const r_4_14_7_8_16_4_4_3_16_4 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_2408448:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1_344064:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2_344064:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3_200704:array<f32>;
@compute @workgroup_size(8,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var acc0: array<f32,48>;
  var gidx0 = i32(gindex.x); /* 7 */
  var gidx1 = i32(gindex.y); /* 14 */
  var gidx2 = i32(gindex.z); /* 4 */
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
  acc0[12] = 0.0f;
  acc0[13] = 0.0f;
  acc0[14] = 0.0f;
  acc0[15] = 0.0f;
  acc0[16] = 0.0f;
  acc0[17] = 0.0f;
  acc0[18] = 0.0f;
  acc0[19] = 0.0f;
  acc0[20] = 0.0f;
  acc0[21] = 0.0f;
  acc0[22] = 0.0f;
  acc0[23] = 0.0f;
  acc0[24] = 0.0f;
  acc0[25] = 0.0f;
  acc0[26] = 0.0f;
  acc0[27] = 0.0f;
  acc0[28] = 0.0f;
  acc0[29] = 0.0f;
  acc0[30] = 0.0f;
  acc0[31] = 0.0f;
  acc0[32] = 0.0f;
  acc0[33] = 0.0f;
  acc0[34] = 0.0f;
  acc0[35] = 0.0f;
  acc0[36] = 0.0f;
  acc0[37] = 0.0f;
  acc0[38] = 0.0f;
  acc0[39] = 0.0f;
  acc0[40] = 0.0f;
  acc0[41] = 0.0f;
  acc0[42] = 0.0f;
  acc0[43] = 0.0f;
  acc0[44] = 0.0f;
  acc0[45] = 0.0f;
  acc0[46] = 0.0f;
  acc0[47] = 0.0f;
  var alu48 = (gidx2*192);
  for (var ridx1008 = 0; ridx1008 < 16; ridx1008++) {
    var precast0 = ridx1008;
    var precast1 = (bitcast<u32>(precast0)<<2u);
    var cast0 = bitcast<i32>(precast1);
    var alu49 = ((gidx0*49152)+alu48+(lidx1*3072)+cast0);
    var val0 = data2_344064[alu49];
    var val1 = data2_344064[(alu49+1)];
    var val2 = data2_344064[(alu49+2)];
    var val3 = data2_344064[(alu49+3)];
    var val4 = data2_344064[(alu49+64)];
    var val5 = data2_344064[(alu49+65)];
    var val6 = data2_344064[(alu49+66)];
    var val7 = data2_344064[(alu49+67)];
    var val8 = data2_344064[(alu49+128)];
    var val9 = data2_344064[(alu49+129)];
    var val10 = data2_344064[(alu49+130)];
    var val11 = data2_344064[(alu49+131)];
    var val12 = data2_344064[(alu49+768)];
    var val13 = data2_344064[(alu49+769)];
    var val14 = data2_344064[(alu49+770)];
    var val15 = data2_344064[(alu49+771)];
    var val16 = data2_344064[(alu49+832)];
    var val17 = data2_344064[(alu49+833)];
    var val18 = data2_344064[(alu49+834)];
    var val19 = data2_344064[(alu49+835)];
    var val20 = data2_344064[(alu49+896)];
    var val21 = data2_344064[(alu49+897)];
    var val22 = data2_344064[(alu49+898)];
    var val23 = data2_344064[(alu49+899)];
    var val24 = data2_344064[(alu49+1536)];
    var val25 = data2_344064[(alu49+1537)];
    var val26 = data2_344064[(alu49+1538)];
    var val27 = data2_344064[(alu49+1539)];
    var val28 = data2_344064[(alu49+1600)];
    var val29 = data2_344064[(alu49+1601)];
    var val30 = data2_344064[(alu49+1602)];
    var val31 = data2_344064[(alu49+1603)];
    var val32 = data2_344064[(alu49+1664)];
    var val33 = data2_344064[(alu49+1665)];
    var val34 = data2_344064[(alu49+1666)];
    var val35 = data2_344064[(alu49+1667)];
    var val36 = data2_344064[(alu49+2304)];
    var val37 = data2_344064[(alu49+2305)];
    var val38 = data2_344064[(alu49+2306)];
    var val39 = data2_344064[(alu49+2307)];
    var val40 = data2_344064[(alu49+2368)];
    var val41 = data2_344064[(alu49+2369)];
    var val42 = data2_344064[(alu49+2370)];
    var val43 = data2_344064[(alu49+2371)];
    var val44 = data2_344064[(alu49+2432)];
    var val45 = data2_344064[(alu49+2433)];
    var val46 = data2_344064[(alu49+2434)];
    var val47 = data2_344064[(alu49+2435)];
    var alu50 = ((gidx1*24576)+alu48+(lidx0*3072)+cast0);
    var val48 = data1_344064[alu50];
    var val49 = data1_344064[(alu50+1)];
    var val50 = data1_344064[(alu50+2)];
    var val51 = data1_344064[(alu50+3)];
    var val52 = data1_344064[(alu50+64)];
    var val53 = data1_344064[(alu50+65)];
    var val54 = data1_344064[(alu50+66)];
    var val55 = data1_344064[(alu50+67)];
    var val56 = data1_344064[(alu50+128)];
    var val57 = data1_344064[(alu50+129)];
    var val58 = data1_344064[(alu50+130)];
    var val59 = data1_344064[(alu50+131)];
    var val60 = data1_344064[(alu50+768)];
    var val61 = data1_344064[(alu50+769)];
    var val62 = data1_344064[(alu50+770)];
    var val63 = data1_344064[(alu50+771)];
    var val64 = data1_344064[(alu50+832)];
    var val65 = data1_344064[(alu50+833)];
    var val66 = data1_344064[(alu50+834)];
    var val67 = data1_344064[(alu50+835)];
    var val68 = data1_344064[(alu50+896)];
    var val69 = data1_344064[(alu50+897)];
    var val70 = data1_344064[(alu50+898)];
    var val71 = data1_344064[(alu50+899)];
    var val72 = data1_344064[(alu50+1536)];
    var val73 = data1_344064[(alu50+1537)];
    var val74 = data1_344064[(alu50+1538)];
    var val75 = data1_344064[(alu50+1539)];
    var val76 = data1_344064[(alu50+1600)];
    var val77 = data1_344064[(alu50+1601)];
    var val78 = data1_344064[(alu50+1602)];
    var val79 = data1_344064[(alu50+1603)];
    var val80 = data1_344064[(alu50+1664)];
    var val81 = data1_344064[(alu50+1665)];
    var val82 = data1_344064[(alu50+1666)];
    var val83 = data1_344064[(alu50+1667)];
    var val84 = data1_344064[(alu50+2304)];
    var val85 = data1_344064[(alu50+2305)];
    var val86 = data1_344064[(alu50+2306)];
    var val87 = data1_344064[(alu50+2307)];
    var val88 = data1_344064[(alu50+2368)];
    var val89 = data1_344064[(alu50+2369)];
    var val90 = data1_344064[(alu50+2370)];
    var val91 = data1_344064[(alu50+2371)];
    var val92 = data1_344064[(alu50+2432)];
    var val93 = data1_344064[(alu50+2433)];
    var val94 = data1_344064[(alu50+2434)];
    var val95 = data1_344064[(alu50+2435)];
    acc0[1] = (acc0[1]+(val52*val4)+(val53*val5)+(val54*val6)+(val55*val7));
    acc0[13] = (acc0[13]+(val52*val16)+(val53*val17)+(val54*val18)+(val55*val19));
    acc0[25] = (acc0[25]+(val52*val28)+(val53*val29)+(val54*val30)+(val55*val31));
    acc0[37] = (acc0[37]+(val52*val40)+(val53*val41)+(val54*val42)+(val55*val43));
    acc0[2] = (acc0[2]+(val56*val8)+(val57*val9)+(val58*val10)+(val59*val11));
    acc0[14] = (acc0[14]+(val56*val20)+(val57*val21)+(val58*val22)+(val59*val23));
    acc0[26] = (acc0[26]+(val56*val32)+(val57*val33)+(val58*val34)+(val59*val35));
    acc0[38] = (acc0[38]+(val56*val44)+(val57*val45)+(val58*val46)+(val59*val47));
    acc0[3] = (acc0[3]+(val60*val0)+(val61*val1)+(val62*val2)+(val63*val3));
    acc0[15] = (acc0[15]+(val60*val12)+(val61*val13)+(val62*val14)+(val63*val15));
    acc0[27] = (acc0[27]+(val60*val24)+(val61*val25)+(val62*val26)+(val63*val27));
    acc0[39] = (acc0[39]+(val60*val36)+(val61*val37)+(val62*val38)+(val63*val39));
    acc0[4] = (acc0[4]+(val64*val4)+(val65*val5)+(val66*val6)+(val67*val7));
    acc0[16] = (acc0[16]+(val64*val16)+(val65*val17)+(val66*val18)+(val67*val19));
    acc0[28] = (acc0[28]+(val64*val28)+(val65*val29)+(val66*val30)+(val67*val31));
    acc0[40] = (acc0[40]+(val64*val40)+(val65*val41)+(val66*val42)+(val67*val43));
    acc0[5] = (acc0[5]+(val68*val8)+(val69*val9)+(val70*val10)+(val71*val11));
    acc0[17] = (acc0[17]+(val68*val20)+(val69*val21)+(val70*val22)+(val71*val23));
    acc0[29] = (acc0[29]+(val68*val32)+(val69*val33)+(val70*val34)+(val71*val35));
    acc0[41] = (acc0[41]+(val68*val44)+(val69*val45)+(val70*val46)+(val71*val47));
    acc0[6] = (acc0[6]+(val72*val0)+(val73*val1)+(val74*val2)+(val75*val3));
    acc0[18] = (acc0[18]+(val72*val12)+(val73*val13)+(val74*val14)+(val75*val15));
    acc0[30] = (acc0[30]+(val72*val24)+(val73*val25)+(val74*val26)+(val75*val27));
    acc0[42] = (acc0[42]+(val72*val36)+(val73*val37)+(val74*val38)+(val75*val39));
    acc0[7] = (acc0[7]+(val76*val4)+(val77*val5)+(val78*val6)+(val79*val7));
    acc0[19] = (acc0[19]+(val76*val16)+(val77*val17)+(val78*val18)+(val79*val19));
    acc0[31] = (acc0[31]+(val76*val28)+(val77*val29)+(val78*val30)+(val79*val31));
    acc0[43] = (acc0[43]+(val76*val40)+(val77*val41)+(val78*val42)+(val79*val43));
    acc0[8] = (acc0[8]+(val80*val8)+(val81*val9)+(val82*val10)+(val83*val11));
    acc0[20] = (acc0[20]+(val80*val20)+(val81*val21)+(val82*val22)+(val83*val23));
    acc0[32] = (acc0[32]+(val80*val32)+(val81*val33)+(val82*val34)+(val83*val35));
    acc0[44] = (acc0[44]+(val80*val44)+(val81*val45)+(val82*val46)+(val83*val47));
    acc0[9] = (acc0[9]+(val84*val0)+(val85*val1)+(val86*val2)+(val87*val3));
    acc0[21] = (acc0[21]+(val84*val12)+(val85*val13)+(val86*val14)+(val87*val15));
    acc0[33] = (acc0[33]+(val84*val24)+(val85*val25)+(val86*val26)+(val87*val27));
    acc0[45] = (acc0[45]+(val84*val36)+(val85*val37)+(val86*val38)+(val87*val39));
    acc0[10] = (acc0[10]+(val88*val4)+(val89*val5)+(val90*val6)+(val91*val7));
    acc0[22] = (acc0[22]+(val88*val16)+(val89*val17)+(val90*val18)+(val91*val19));
    acc0[34] = (acc0[34]+(val88*val28)+(val89*val29)+(val90*val30)+(val91*val31));
    acc0[46] = (acc0[46]+(val88*val40)+(val89*val41)+(val90*val42)+(val91*val43));
    acc0[11] = (acc0[11]+(val92*val8)+(val93*val9)+(val94*val10)+(val95*val11));
    acc0[23] = (acc0[23]+(val92*val20)+(val93*val21)+(val94*val22)+(val95*val23));
    acc0[35] = (acc0[35]+(val92*val32)+(val93*val33)+(val94*val34)+(val95*val35));
    acc0[47] = (acc0[47]+(val92*val44)+(val93*val45)+(val94*val46)+(val95*val47));
    acc0[12] = (acc0[12]+(val48*val12)+(val49*val13)+(val50*val14)+(val51*val15));
    acc0[24] = (acc0[24]+(val48*val24)+(val49*val25)+(val50*val26)+(val51*val27));
    acc0[36] = (acc0[36]+(val48*val36)+(val49*val37)+(val50*val38)+(val51*val39));
    acc0[0] = (acc0[0]+(val48*val0)+(val49*val1)+(val50*val2)+(val51*val3));
  }
  var precast2 = gidx0;
  var precast3 = lidx1;
  var alu100 = (gidx1*14336);
  var alu101 = (lidx0*1792);
  var precast4 = (bitcast<u32>(precast2)<<6u);
  var cast1 = bitcast<i32>(precast4);
  var precast5 = (bitcast<u32>(precast3)<<2u);
  var cast2 = bitcast<i32>(precast5);
  var alu102 = (cast1+alu100+alu101+cast2);
  var val96 = data3_200704[alu102];
  var val97 = data3_200704[(alu102+1)];
  var val98 = data3_200704[(alu102+2)];
  var val99 = data3_200704[(alu102+3)];
  var val100 = data3_200704[(alu102+448)];
  var val101 = data3_200704[(alu102+449)];
  var val102 = data3_200704[(alu102+450)];
  var val103 = data3_200704[(alu102+451)];
  var val104 = data3_200704[(alu102+896)];
  var val105 = data3_200704[(alu102+897)];
  var val106 = data3_200704[(alu102+898)];
  var val107 = data3_200704[(alu102+899)];
  var val108 = data3_200704[(alu102+1344)];
  var val109 = data3_200704[(alu102+1345)];
  var val110 = data3_200704[(alu102+1346)];
  var val111 = data3_200704[(alu102+1347)];
  var alu103 = (alu100+(gidx2*602112)+cast1+alu101+cast2);
  data0_2408448[alu103] = ((acc0[0]*0.125f)+val96);
  data0_2408448[(alu103+200704)] = ((acc0[1]*0.125f)+val96);
  data0_2408448[(alu103+401408)] = ((acc0[2]*0.125f)+val96);
  data0_2408448[(alu103+448)] = ((acc0[3]*0.125f)+val100);
  data0_2408448[(alu103+201152)] = ((acc0[4]*0.125f)+val100);
  data0_2408448[(alu103+401856)] = ((acc0[5]*0.125f)+val100);
  data0_2408448[(alu103+896)] = ((acc0[6]*0.125f)+val104);
  data0_2408448[(alu103+201600)] = ((acc0[7]*0.125f)+val104);
  data0_2408448[(alu103+402304)] = ((acc0[8]*0.125f)+val104);
  data0_2408448[(alu103+1344)] = ((acc0[9]*0.125f)+val108);
  data0_2408448[(alu103+202048)] = ((acc0[10]*0.125f)+val108);
  data0_2408448[(alu103+402752)] = ((acc0[11]*0.125f)+val108);
  data0_2408448[(alu103+1)] = ((acc0[12]*0.125f)+val97);
  data0_2408448[(alu103+200705)] = ((acc0[13]*0.125f)+val97);
  data0_2408448[(alu103+401409)] = ((acc0[14]*0.125f)+val97);
  data0_2408448[(alu103+449)] = ((acc0[15]*0.125f)+val101);
  data0_2408448[(alu103+201153)] = ((acc0[16]*0.125f)+val101);
  data0_2408448[(alu103+401857)] = ((acc0[17]*0.125f)+val101);
  data0_2408448[(alu103+897)] = ((acc0[18]*0.125f)+val105);
  data0_2408448[(alu103+201601)] = ((acc0[19]*0.125f)+val105);
  data0_2408448[(alu103+402305)] = ((acc0[20]*0.125f)+val105);
  data0_2408448[(alu103+1345)] = ((acc0[21]*0.125f)+val109);
  data0_2408448[(alu103+202049)] = ((acc0[22]*0.125f)+val109);
  data0_2408448[(alu103+402753)] = ((acc0[23]*0.125f)+val109);
  data0_2408448[(alu103+2)] = ((acc0[24]*0.125f)+val98);
  data0_2408448[(alu103+200706)] = ((acc0[25]*0.125f)+val98);
  data0_2408448[(alu103+401410)] = ((acc0[26]*0.125f)+val98);
  data0_2408448[(alu103+450)] = ((acc0[27]*0.125f)+val102);
  data0_2408448[(alu103+201154)] = ((acc0[28]*0.125f)+val102);
  data0_2408448[(alu103+401858)] = ((acc0[29]*0.125f)+val102);
  data0_2408448[(alu103+898)] = ((acc0[30]*0.125f)+val106);
  data0_2408448[(alu103+201602)] = ((acc0[31]*0.125f)+val106);
  data0_2408448[(alu103+402306)] = ((acc0[32]*0.125f)+val106);
  data0_2408448[(alu103+1346)] = ((acc0[33]*0.125f)+val110);
  data0_2408448[(alu103+202050)] = ((acc0[34]*0.125f)+val110);
  data0_2408448[(alu103+402754)] = ((acc0[35]*0.125f)+val110);
  data0_2408448[(alu103+3)] = ((acc0[36]*0.125f)+val99);
  data0_2408448[(alu103+200707)] = ((acc0[37]*0.125f)+val99);
  data0_2408448[(alu103+401411)] = ((acc0[38]*0.125f)+val99);
  data0_2408448[(alu103+451)] = ((acc0[39]*0.125f)+val103);
  data0_2408448[(alu103+201155)] = ((acc0[40]*0.125f)+val103);
  data0_2408448[(alu103+401859)] = ((acc0[41]*0.125f)+val103);
  data0_2408448[(alu103+899)] = ((acc0[42]*0.125f)+val107);
  data0_2408448[(alu103+201603)] = ((acc0[43]*0.125f)+val107);
  data0_2408448[(alu103+402307)] = ((acc0[44]*0.125f)+val107);
  data0_2408448[(alu103+1347)] = ((acc0[45]*0.125f)+val111);
  data0_2408448[(alu103+202051)] = ((acc0[46]*0.125f)+val111);
  data0_2408448[(alu103+402755)] = ((acc0[47]*0.125f)+val111);
}`;

const r_56_32_3_112_4 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_5376:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1_2408448:array<f32>;
@compute @workgroup_size(32) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var acc0: array<f32,3>;
  var gidx0 = i32(gindex.x); /* 56 */
  var lidx0 = i32(lindex.x); /* 32 */
  acc0[0] = (f32(-INFINITY));
  acc0[1] = (f32(-INFINITY));
  acc0[2] = (f32(-INFINITY));
  for (var ridx1003 = 0; ridx1003 < 112; ridx1003++) {
    var precast0 = ridx1003;
    var precast1 = (bitcast<u32>(precast0)<<2u);
    var alu3 = ((gidx0*43008)+(lidx0*1344)+bitcast<i32>(precast1));
    var val0 = data1_2408448[alu3];
    var val1 = data1_2408448[(alu3+1)];
    var val2 = data1_2408448[(alu3+2)];
    var val3 = data1_2408448[(alu3+3)];
    var val4 = data1_2408448[(alu3+448)];
    var val5 = data1_2408448[(alu3+449)];
    var val6 = data1_2408448[(alu3+450)];
    var val7 = data1_2408448[(alu3+451)];
    var val8 = data1_2408448[(alu3+896)];
    var val9 = data1_2408448[(alu3+897)];
    var val10 = data1_2408448[(alu3+898)];
    var val11 = data1_2408448[(alu3+899)];
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
  var alu20 = ((gidx0*96)+(lidx0*3));
  data0_5376[alu20] = acc0[0];
  data0_5376[(alu20+1)] = acc0[1];
  data0_5376[(alu20+2)] = acc0[2];
}`;

const r_56_32_3_112_4n1 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_5376:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1_2408448:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2_5376:array<f32>;
@compute @workgroup_size(32) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var acc0: array<f32,3>;
  var gidx0 = i32(gindex.x); /* 56 */
  var lidx0 = i32(lindex.x); /* 32 */
  var alu0 = ((gidx0*96)+(lidx0*3));
  var alu1 = (alu0+2);
  var alu2 = (alu0+1);
  var val0 = data2_5376[alu2];
  var val1 = data2_5376[alu1];
  var val2 = data2_5376[alu0];
  acc0[0] = 0.0f;
  acc0[1] = 0.0f;
  acc0[2] = 0.0f;
  for (var ridx1003 = 0; ridx1003 < 112; ridx1003++) {
    var precast0 = ridx1003;
    var precast1 = (bitcast<u32>(precast0)<<2u);
    var alu6 = ((gidx0*43008)+(lidx0*1344)+bitcast<i32>(precast1));
    var val3 = data1_2408448[alu6];
    var val4 = data1_2408448[(alu6+1)];
    var val5 = data1_2408448[(alu6+2)];
    var val6 = data1_2408448[(alu6+3)];
    var val7 = data1_2408448[(alu6+448)];
    var val8 = data1_2408448[(alu6+449)];
    var val9 = data1_2408448[(alu6+450)];
    var val10 = data1_2408448[(alu6+451)];
    var val11 = data1_2408448[(alu6+896)];
    var val12 = data1_2408448[(alu6+897)];
    var val13 = data1_2408448[(alu6+898)];
    var val14 = data1_2408448[(alu6+899)];
    acc0[1] = (acc0[1]+exp2(((val7-val0)*1.4426950408889634f))+exp2(((val8-val0)*1.4426950408889634f))+exp2(((val9-val0)*1.4426950408889634f))+exp2(((val10-val0)*1.4426950408889634f)));
    acc0[2] = (acc0[2]+exp2(((val11-val1)*1.4426950408889634f))+exp2(((val12-val1)*1.4426950408889634f))+exp2(((val13-val1)*1.4426950408889634f))+exp2(((val14-val1)*1.4426950408889634f)));
    acc0[0] = (acc0[0]+exp2(((val3-val2)*1.4426950408889634f))+exp2(((val4-val2)*1.4426950408889634f))+exp2(((val5-val2)*1.4426950408889634f))+exp2(((val6-val2)*1.4426950408889634f)));
  }
  data0_5376[alu2] = (1/acc0[1]);
  data0_5376[alu1] = (1/acc0[2]);
  data0_5376[alu0] = (1/acc0[0]);
}`;

const E_672_7_8_16_4 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_2408448:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1_2408448:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2_5376:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3_5376:array<f32>;
@compute @workgroup_size(8,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 7 */
  var gidx1 = i32(gindex.y); /* 672 */
  var lidx0 = i32(lindex.x); /* 8 */
  var lidx1 = i32(lindex.y); /* 16 */
  var precast0 = gidx0;
  var precast1 = gidx1;
  var precast2 = lidx1;
  var precast3 = (bitcast<u32>(precast0)<<6u);
  var precast4 = (bitcast<u32>(precast1)<<3u);
  var alu0 = (lidx0+bitcast<i32>(precast4));
  var val0 = data2_5376[alu0];
  var val1 = data3_5376[alu0];
  var precast5 = (bitcast<u32>(precast2)<<2u);
  var alu1 = (bitcast<i32>(precast3)+(gidx1*3584)+(lidx0*448)+bitcast<i32>(precast5));
  var val2 = data1_2408448[alu1];
  var alu2 = (alu1+1);
  var val3 = data1_2408448[alu2];
  var alu3 = (alu1+2);
  var val4 = data1_2408448[alu3];
  var alu4 = (alu1+3);
  var val5 = data1_2408448[alu4];
  data0_2408448[alu1] = (exp2(((val2-val0)*1.4426950408889634f))*val1);
  data0_2408448[alu2] = (exp2(((val3-val0)*1.4426950408889634f))*val1);
  data0_2408448[alu3] = (exp2(((val4-val0)*1.4426950408889634f))*val1);
  data0_2408448[alu4] = (exp2(((val5-val0)*1.4426950408889634f))*val1);
}`;

const r_12_14_8_16_4_4_112_4 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_344064:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1_2408448:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2_344064:array<f32>;
@compute @workgroup_size(8,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var acc0: array<f32,16>;
  var gidx0 = i32(gindex.x); /* 14 */
  var gidx1 = i32(gindex.y); /* 12 */
  var lidx0 = i32(lindex.x); /* 8 */
  var lidx1 = i32(lindex.y); /* 16 */
  var precast0 = lidx1;
  var precast1 = (bitcast<u32>(precast0)<<2u);
  var cast0 = bitcast<i32>(precast1);
  var precast2 = gidx1;
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
  var precast3 = (bitcast<u32>(precast2)<<6u);
  for (var ridx1006 = 0; ridx1006 < 112; ridx1006++) {
    var precast4 = ridx1006;
    var alu16 = (bitcast<i32>(precast3)+cast0+(ridx1006*3072));
    var val0 = data2_344064[alu16];
    var val1 = data2_344064[(alu16+1)];
    var val2 = data2_344064[(alu16+2)];
    var val3 = data2_344064[(alu16+3)];
    var val4 = data2_344064[(alu16+768)];
    var val5 = data2_344064[(alu16+769)];
    var val6 = data2_344064[(alu16+770)];
    var val7 = data2_344064[(alu16+771)];
    var val8 = data2_344064[(alu16+1536)];
    var val9 = data2_344064[(alu16+1537)];
    var val10 = data2_344064[(alu16+1538)];
    var val11 = data2_344064[(alu16+1539)];
    var val12 = data2_344064[(alu16+2304)];
    var val13 = data2_344064[(alu16+2305)];
    var val14 = data2_344064[(alu16+2306)];
    var val15 = data2_344064[(alu16+2307)];
    var precast5 = (bitcast<u32>(precast4)<<2u);
    var alu17 = ((gidx0*14336)+(gidx1*200704)+(lidx0*1792)+bitcast<i32>(precast5));
    var val16 = data1_2408448[alu17];
    var val17 = data1_2408448[(alu17+1)];
    var val18 = data1_2408448[(alu17+2)];
    var val19 = data1_2408448[(alu17+3)];
    var val20 = data1_2408448[(alu17+448)];
    var val21 = data1_2408448[(alu17+449)];
    var val22 = data1_2408448[(alu17+450)];
    var val23 = data1_2408448[(alu17+451)];
    var val24 = data1_2408448[(alu17+896)];
    var val25 = data1_2408448[(alu17+897)];
    var val26 = data1_2408448[(alu17+898)];
    var val27 = data1_2408448[(alu17+899)];
    var val28 = data1_2408448[(alu17+1344)];
    var val29 = data1_2408448[(alu17+1345)];
    var val30 = data1_2408448[(alu17+1346)];
    var val31 = data1_2408448[(alu17+1347)];
    acc0[1] = (acc0[1]+(val20*val0)+(val21*val4)+(val22*val8)+(val23*val12));
    acc0[5] = (acc0[5]+(val20*val1)+(val21*val5)+(val22*val9)+(val23*val13));
    acc0[9] = (acc0[9]+(val20*val2)+(val21*val6)+(val22*val10)+(val23*val14));
    acc0[13] = (acc0[13]+(val20*val3)+(val21*val7)+(val22*val11)+(val23*val15));
    acc0[2] = (acc0[2]+(val24*val0)+(val25*val4)+(val26*val8)+(val27*val12));
    acc0[6] = (acc0[6]+(val24*val1)+(val25*val5)+(val26*val9)+(val27*val13));
    acc0[10] = (acc0[10]+(val24*val2)+(val25*val6)+(val26*val10)+(val27*val14));
    acc0[14] = (acc0[14]+(val24*val3)+(val25*val7)+(val26*val11)+(val27*val15));
    acc0[3] = (acc0[3]+(val28*val0)+(val29*val4)+(val30*val8)+(val31*val12));
    acc0[7] = (acc0[7]+(val28*val1)+(val29*val5)+(val30*val9)+(val31*val13));
    acc0[11] = (acc0[11]+(val28*val2)+(val29*val6)+(val30*val10)+(val31*val14));
    acc0[15] = (acc0[15]+(val28*val3)+(val29*val7)+(val30*val11)+(val31*val15));
    acc0[0] = (acc0[0]+(val16*val0)+(val17*val4)+(val18*val8)+(val19*val12));
    acc0[4] = (acc0[4]+(val16*val1)+(val17*val5)+(val18*val9)+(val19*val13));
    acc0[8] = (acc0[8]+(val16*val2)+(val17*val6)+(val18*val10)+(val19*val14));
    acc0[12] = (acc0[12]+(val16*val3)+(val17*val7)+(val18*val11)+(val19*val15));
  }
  var precast6 = gidx0;
  var precast7 = lidx0;
  var precast8 = (bitcast<u32>(precast6)<<11u);
  var precast9 = (bitcast<u32>(precast7)<<8u);
  var alu35 = (bitcast<i32>(precast8)+(gidx1*28672)+bitcast<i32>(precast9)+cast0);
  data0_344064[alu35] = acc0[0];
  data0_344064[(alu35+1)] = acc0[4];
  data0_344064[(alu35+2)] = acc0[8];
  data0_344064[(alu35+3)] = acc0[12];
  data0_344064[(alu35+64)] = acc0[1];
  data0_344064[(alu35+65)] = acc0[5];
  data0_344064[(alu35+66)] = acc0[9];
  data0_344064[(alu35+67)] = acc0[13];
  data0_344064[(alu35+128)] = acc0[2];
  data0_344064[(alu35+129)] = acc0[6];
  data0_344064[(alu35+130)] = acc0[10];
  data0_344064[(alu35+131)] = acc0[14];
  data0_344064[(alu35+192)] = acc0[3];
  data0_344064[(alu35+193)] = acc0[7];
  data0_344064[(alu35+194)] = acc0[11];
  data0_344064[(alu35+195)] = acc0[15];
}`;

const r_14_16_8_16_4_3_192_4n1 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_344064:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1_344064:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2_344064:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3_589824:array<f32>;
@group(0) @binding(5)var<storage,read_write>data4_768:array<f32>;
@compute @workgroup_size(8,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var acc0: array<f32,12>;
  var gidx0 = i32(gindex.x); /* 16 */
  var gidx1 = i32(gindex.y); /* 14 */
  var lidx0 = i32(lindex.x); /* 8 */
  var lidx1 = i32(lindex.y); /* 16 */
  var precast0 = gidx1;
  var precast1 = lidx0;
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
  var precast2 = (bitcast<u32>(precast0)<<11u);
  var precast3 = (bitcast<u32>(precast1)<<8u);
  for (var ridx1006 = 0; ridx1006 < 192; ridx1006++) {
    var precast4 = ridx1006;
    var precast5 = (bitcast<u32>(precast4)<<2u);
    var alu12 = ((gidx0*36864)+(lidx1*2304)+bitcast<i32>(precast5));
    var val0 = data3_589824[alu12];
    var val1 = data3_589824[(alu12+1)];
    var val2 = data3_589824[(alu12+2)];
    var val3 = data3_589824[(alu12+3)];
    var val4 = data3_589824[(alu12+768)];
    var val5 = data3_589824[(alu12+769)];
    var val6 = data3_589824[(alu12+770)];
    var val7 = data3_589824[(alu12+771)];
    var val8 = data3_589824[(alu12+1536)];
    var val9 = data3_589824[(alu12+1537)];
    var val10 = data3_589824[(alu12+1538)];
    var val11 = data3_589824[(alu12+1539)];
    var precast6 = (ridx1006&15);
    var precast7 = (bitcast<u32>(precast6)<<2u);
    var alu13 = (bitcast<i32>(precast2)+bitcast<i32>(precast3)+((ridx1006>>4u)*28672)+bitcast<i32>(precast7));
    var val12 = data2_344064[alu13];
    var val13 = data2_344064[(alu13+1)];
    var val14 = data2_344064[(alu13+2)];
    var val15 = data2_344064[(alu13+3)];
    var val16 = data2_344064[(alu13+64)];
    var val17 = data2_344064[(alu13+65)];
    var val18 = data2_344064[(alu13+66)];
    var val19 = data2_344064[(alu13+67)];
    var val20 = data2_344064[(alu13+128)];
    var val21 = data2_344064[(alu13+129)];
    var val22 = data2_344064[(alu13+130)];
    var val23 = data2_344064[(alu13+131)];
    var val24 = data2_344064[(alu13+192)];
    var val25 = data2_344064[(alu13+193)];
    var val26 = data2_344064[(alu13+194)];
    var val27 = data2_344064[(alu13+195)];
    acc0[0] = (acc0[0]+(val12*val0)+(val13*val1)+(val14*val2)+(val15*val3));
    acc0[1] = (acc0[1]+(val12*val4)+(val13*val5)+(val14*val6)+(val15*val7));
    acc0[2] = (acc0[2]+(val12*val8)+(val13*val9)+(val14*val10)+(val15*val11));
    acc0[3] = (acc0[3]+(val16*val0)+(val17*val1)+(val18*val2)+(val19*val3));
    acc0[4] = (acc0[4]+(val16*val4)+(val17*val5)+(val18*val6)+(val19*val7));
    acc0[5] = (acc0[5]+(val16*val8)+(val17*val9)+(val18*val10)+(val19*val11));
    acc0[6] = (acc0[6]+(val20*val0)+(val21*val1)+(val22*val2)+(val23*val3));
    acc0[7] = (acc0[7]+(val20*val4)+(val21*val5)+(val22*val6)+(val23*val7));
    acc0[8] = (acc0[8]+(val20*val8)+(val21*val9)+(val22*val10)+(val23*val11));
    acc0[9] = (acc0[9]+(val24*val0)+(val25*val1)+(val26*val2)+(val27*val3));
    acc0[10] = (acc0[10]+(val24*val4)+(val25*val5)+(val26*val6)+(val27*val7));
    acc0[11] = (acc0[11]+(val24*val8)+(val25*val9)+(val26*val10)+(val27*val11));
  }
  var alu27 = (gidx0*48);
  var alu28 = (lidx1*3);
  var alu29 = (alu27+(gidx1*24576)+(lidx0*3072)+alu28);
  var val28 = data1_344064[alu29];
  var alu30 = (alu29+1);
  var val29 = data1_344064[alu30];
  var alu31 = (alu29+2);
  var val30 = data1_344064[alu31];
  var alu32 = (alu29+768);
  var val31 = data1_344064[alu32];
  var alu33 = (alu29+769);
  var val32 = data1_344064[alu33];
  var alu34 = (alu29+770);
  var val33 = data1_344064[alu34];
  var alu35 = (alu29+1536);
  var val34 = data1_344064[alu35];
  var alu36 = (alu29+1537);
  var val35 = data1_344064[alu36];
  var alu37 = (alu29+1538);
  var val36 = data1_344064[alu37];
  var alu38 = (alu29+2304);
  var val37 = data1_344064[alu38];
  var alu39 = (alu29+2305);
  var val38 = data1_344064[alu39];
  var alu40 = (alu29+2306);
  var val39 = data1_344064[alu40];
  var alu41 = (alu27+alu28);
  var val40 = data4_768[alu41];
  var val41 = data4_768[(alu41+1)];
  var val42 = data4_768[(alu41+2)];
  data0_344064[alu30] = (val29+acc0[1]+val41);
  data0_344064[alu31] = (val30+acc0[2]+val42);
  data0_344064[alu32] = (val31+acc0[3]+val40);
  data0_344064[alu33] = (val32+acc0[4]+val41);
  data0_344064[alu34] = (val33+acc0[5]+val42);
  data0_344064[alu35] = (val34+acc0[6]+val40);
  data0_344064[alu36] = (val35+acc0[7]+val41);
  data0_344064[alu37] = (val36+acc0[8]+val42);
  data0_344064[alu38] = (val37+acc0[9]+val40);
  data0_344064[alu39] = (val38+acc0[10]+val41);
  data0_344064[alu40] = (val39+acc0[11]+val42);
  data0_344064[alu29] = (val28+acc0[0]+val40);
}`;

const r_6_7_125_2_16_4_3_4_16_4 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_8064000:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1_344064:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2_1152000:array<f32>;
@compute @workgroup_size(2,16,4) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var acc0: array<f32,12>;
  var gidx0 = i32(gindex.x); /* 125 */
  var gidx1 = i32(gindex.y); /* 7 */
  var gidx2 = i32(gindex.z); /* 6 */
  var lidx0 = i32(lindex.x); /* 2 */
  var lidx1 = i32(lindex.y); /* 16 */
  var lidx2 = i32(lindex.z); /* 4 */
  var precast0 = gidx2;
  var precast1 = lidx0;
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
  var precast2 = (bitcast<u32>(precast0)<<7u);
  var cast0 = bitcast<i32>(precast2);
  var precast3 = (bitcast<u32>(precast1)<<6u);
  var cast1 = bitcast<i32>(precast3);
  for (var ridx1008 = 0; ridx1008 < 16; ridx1008++) {
    var precast4 = ridx1008;
    var precast5 = (bitcast<u32>(precast4)<<2u);
    var cast2 = bitcast<i32>(precast5);
    var alu12 = ((gidx0*9216)+cast0+cast1+(lidx2*2304)+cast2);
    var val0 = data2_1152000[alu12];
    var val1 = data2_1152000[(alu12+1)];
    var val2 = data2_1152000[(alu12+2)];
    var val3 = data2_1152000[(alu12+3)];
    var val4 = data2_1152000[(alu12+768)];
    var val5 = data2_1152000[(alu12+769)];
    var val6 = data2_1152000[(alu12+770)];
    var val7 = data2_1152000[(alu12+771)];
    var val8 = data2_1152000[(alu12+1536)];
    var val9 = data2_1152000[(alu12+1537)];
    var val10 = data2_1152000[(alu12+1538)];
    var val11 = data2_1152000[(alu12+1539)];
    var alu13 = ((gidx1*49152)+cast0+cast1+(lidx1*3072)+cast2);
    var val12 = data1_344064[alu13];
    var val13 = data1_344064[(alu13+1)];
    var val14 = data1_344064[(alu13+2)];
    var val15 = data1_344064[(alu13+3)];
    var val16 = data1_344064[(alu13+768)];
    var val17 = data1_344064[(alu13+769)];
    var val18 = data1_344064[(alu13+770)];
    var val19 = data1_344064[(alu13+771)];
    var val20 = data1_344064[(alu13+1536)];
    var val21 = data1_344064[(alu13+1537)];
    var val22 = data1_344064[(alu13+1538)];
    var val23 = data1_344064[(alu13+1539)];
    var val24 = data1_344064[(alu13+2304)];
    var val25 = data1_344064[(alu13+2305)];
    var val26 = data1_344064[(alu13+2306)];
    var val27 = data1_344064[(alu13+2307)];
    acc0[1] = (acc0[1]+(val16*val0)+(val17*val1)+(val18*val2)+(val19*val3));
    acc0[5] = (acc0[5]+(val16*val4)+(val17*val5)+(val18*val6)+(val19*val7));
    acc0[9] = (acc0[9]+(val16*val8)+(val17*val9)+(val18*val10)+(val19*val11));
    acc0[2] = (acc0[2]+(val20*val0)+(val21*val1)+(val22*val2)+(val23*val3));
    acc0[6] = (acc0[6]+(val20*val4)+(val21*val5)+(val22*val6)+(val23*val7));
    acc0[10] = (acc0[10]+(val20*val8)+(val21*val9)+(val22*val10)+(val23*val11));
    acc0[3] = (acc0[3]+(val24*val0)+(val25*val1)+(val26*val2)+(val27*val3));
    acc0[7] = (acc0[7]+(val24*val4)+(val25*val5)+(val26*val6)+(val27*val7));
    acc0[11] = (acc0[11]+(val24*val8)+(val25*val9)+(val26*val10)+(val27*val11));
    acc0[4] = (acc0[4]+(val12*val4)+(val13*val5)+(val14*val6)+(val15*val7));
    acc0[8] = (acc0[8]+(val12*val8)+(val13*val9)+(val14*val10)+(val15*val11));
    acc0[0] = (acc0[0]+(val12*val0)+(val13*val1)+(val14*val2)+(val15*val3));
  }
  var alu27 = ((gidx1*96000)+(gidx2*1344000)+(gidx0*12)+(lidx0*672000)+(lidx1*6000)+(lidx2*3));
  data0_8064000[alu27] = (acc0[0]*0.125f);
  data0_8064000[(alu27+1500)] = (acc0[1]*0.125f);
  data0_8064000[(alu27+3000)] = (acc0[2]*0.125f);
  data0_8064000[(alu27+4500)] = (acc0[3]*0.125f);
  data0_8064000[(alu27+1)] = (acc0[4]*0.125f);
  data0_8064000[(alu27+1501)] = (acc0[5]*0.125f);
  data0_8064000[(alu27+3001)] = (acc0[6]*0.125f);
  data0_8064000[(alu27+4501)] = (acc0[7]*0.125f);
  data0_8064000[(alu27+2)] = (acc0[8]*0.125f);
  data0_8064000[(alu27+1502)] = (acc0[9]*0.125f);
  data0_8064000[(alu27+3002)] = (acc0[10]*0.125f);
  data0_8064000[(alu27+4502)] = (acc0[11]*0.125f);
}`;

const r_56_32_3_375_4 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_5376:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1_8064000:array<f32>;
@compute @workgroup_size(32) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var acc0: array<f32,3>;
  var gidx0 = i32(gindex.x); /* 56 */
  var lidx0 = i32(lindex.x); /* 32 */
  acc0[0] = (f32(-INFINITY));
  acc0[1] = (f32(-INFINITY));
  acc0[2] = (f32(-INFINITY));
  for (var ridx1003 = 0; ridx1003 < 375; ridx1003++) {
    var precast0 = ridx1003;
    var precast1 = (bitcast<u32>(precast0)<<2u);
    var alu3 = ((gidx0*144000)+(lidx0*4500)+bitcast<i32>(precast1));
    var val0 = data1_8064000[alu3];
    var val1 = data1_8064000[(alu3+1)];
    var val2 = data1_8064000[(alu3+2)];
    var val3 = data1_8064000[(alu3+3)];
    var val4 = data1_8064000[(alu3+1500)];
    var val5 = data1_8064000[(alu3+1501)];
    var val6 = data1_8064000[(alu3+1502)];
    var val7 = data1_8064000[(alu3+1503)];
    var val8 = data1_8064000[(alu3+3000)];
    var val9 = data1_8064000[(alu3+3001)];
    var val10 = data1_8064000[(alu3+3002)];
    var val11 = data1_8064000[(alu3+3003)];
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
  var alu20 = ((gidx0*96)+(lidx0*3));
  data0_5376[alu20] = acc0[0];
  data0_5376[(alu20+1)] = acc0[1];
  data0_5376[(alu20+2)] = acc0[2];
}`;

const r_56_32_3_375_4n1 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_5376:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1_8064000:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2_5376:array<f32>;
@compute @workgroup_size(32) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var acc0: array<f32,3>;
  var gidx0 = i32(gindex.x); /* 56 */
  var lidx0 = i32(lindex.x); /* 32 */
  var alu0 = ((gidx0*96)+(lidx0*3));
  var alu1 = (alu0+2);
  var alu2 = (alu0+1);
  var val0 = data2_5376[alu2];
  var val1 = data2_5376[alu1];
  var val2 = data2_5376[alu0];
  acc0[0] = 0.0f;
  acc0[1] = 0.0f;
  acc0[2] = 0.0f;
  for (var ridx1003 = 0; ridx1003 < 375; ridx1003++) {
    var precast0 = ridx1003;
    var precast1 = (bitcast<u32>(precast0)<<2u);
    var alu6 = ((gidx0*144000)+(lidx0*4500)+bitcast<i32>(precast1));
    var val3 = data1_8064000[alu6];
    var val4 = data1_8064000[(alu6+1)];
    var val5 = data1_8064000[(alu6+2)];
    var val6 = data1_8064000[(alu6+3)];
    var val7 = data1_8064000[(alu6+1500)];
    var val8 = data1_8064000[(alu6+1501)];
    var val9 = data1_8064000[(alu6+1502)];
    var val10 = data1_8064000[(alu6+1503)];
    var val11 = data1_8064000[(alu6+3000)];
    var val12 = data1_8064000[(alu6+3001)];
    var val13 = data1_8064000[(alu6+3002)];
    var val14 = data1_8064000[(alu6+3003)];
    acc0[1] = (acc0[1]+exp2(((val7-val0)*1.4426950408889634f))+exp2(((val8-val0)*1.4426950408889634f))+exp2(((val9-val0)*1.4426950408889634f))+exp2(((val10-val0)*1.4426950408889634f)));
    acc0[2] = (acc0[2]+exp2(((val11-val1)*1.4426950408889634f))+exp2(((val12-val1)*1.4426950408889634f))+exp2(((val13-val1)*1.4426950408889634f))+exp2(((val14-val1)*1.4426950408889634f)));
    acc0[0] = (acc0[0]+exp2(((val3-val2)*1.4426950408889634f))+exp2(((val4-val2)*1.4426950408889634f))+exp2(((val5-val2)*1.4426950408889634f))+exp2(((val6-val2)*1.4426950408889634f)));
  }
  data0_5376[alu2] = (1/acc0[1]);
  data0_5376[alu1] = (1/acc0[2]);
  data0_5376[alu0] = (1/acc0[0]);
}`;

const E_168_125_32_4_3 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_8064000:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1_8064000:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2_5376:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3_5376:array<f32>;
@compute @workgroup_size(32,4) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 125 */
  var gidx1 = i32(gindex.y); /* 168 */
  var lidx0 = i32(lindex.x); /* 32 */
  var lidx1 = i32(lindex.y); /* 4 */
  var precast0 = gidx1;
  var alu0 = ((gidx0*12)+(gidx1*48000)+(lidx0*1500)+(lidx1*3));
  var val0 = data1_8064000[alu0];
  var alu1 = (alu0+1);
  var val1 = data1_8064000[alu1];
  var alu2 = (alu0+2);
  var val2 = data1_8064000[alu2];
  var precast1 = (bitcast<u32>(precast0)<<5u);
  var alu3 = (lidx0+bitcast<i32>(precast1));
  var val3 = data2_5376[alu3];
  var val4 = data3_5376[alu3];
  data0_8064000[alu1] = (exp2(((val1-val3)*1.4426950408889634f))*val4);
  data0_8064000[alu2] = (exp2(((val2-val3)*1.4426950408889634f))*val4);
  data0_8064000[alu0] = (exp2(((val0-val3)*1.4426950408889634f))*val4);
}`;

const r_12_14_8_16_4_4_375_4 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_344064:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1_8064000:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2_1152000:array<f32>;
@compute @workgroup_size(8,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var acc0: array<f32,16>;
  var gidx0 = i32(gindex.x); /* 14 */
  var gidx1 = i32(gindex.y); /* 12 */
  var lidx0 = i32(lindex.x); /* 8 */
  var lidx1 = i32(lindex.y); /* 16 */
  var precast0 = lidx1;
  var precast1 = (bitcast<u32>(precast0)<<2u);
  var cast0 = bitcast<i32>(precast1);
  var precast2 = gidx1;
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
  var precast3 = (bitcast<u32>(precast2)<<6u);
  for (var ridx1006 = 0; ridx1006 < 375; ridx1006++) {
    var precast4 = ridx1006;
    var alu16 = (bitcast<i32>(precast3)+cast0+(ridx1006*3072));
    var val0 = data2_1152000[alu16];
    var val1 = data2_1152000[(alu16+1)];
    var val2 = data2_1152000[(alu16+2)];
    var val3 = data2_1152000[(alu16+3)];
    var val4 = data2_1152000[(alu16+768)];
    var val5 = data2_1152000[(alu16+769)];
    var val6 = data2_1152000[(alu16+770)];
    var val7 = data2_1152000[(alu16+771)];
    var val8 = data2_1152000[(alu16+1536)];
    var val9 = data2_1152000[(alu16+1537)];
    var val10 = data2_1152000[(alu16+1538)];
    var val11 = data2_1152000[(alu16+1539)];
    var val12 = data2_1152000[(alu16+2304)];
    var val13 = data2_1152000[(alu16+2305)];
    var val14 = data2_1152000[(alu16+2306)];
    var val15 = data2_1152000[(alu16+2307)];
    var precast5 = (bitcast<u32>(precast4)<<2u);
    var alu17 = ((gidx0*48000)+(gidx1*672000)+(lidx0*6000)+bitcast<i32>(precast5));
    var val16 = data1_8064000[alu17];
    var val17 = data1_8064000[(alu17+1)];
    var val18 = data1_8064000[(alu17+2)];
    var val19 = data1_8064000[(alu17+3)];
    var val20 = data1_8064000[(alu17+1500)];
    var val21 = data1_8064000[(alu17+1501)];
    var val22 = data1_8064000[(alu17+1502)];
    var val23 = data1_8064000[(alu17+1503)];
    var val24 = data1_8064000[(alu17+3000)];
    var val25 = data1_8064000[(alu17+3001)];
    var val26 = data1_8064000[(alu17+3002)];
    var val27 = data1_8064000[(alu17+3003)];
    var val28 = data1_8064000[(alu17+4500)];
    var val29 = data1_8064000[(alu17+4501)];
    var val30 = data1_8064000[(alu17+4502)];
    var val31 = data1_8064000[(alu17+4503)];
    acc0[1] = (acc0[1]+(val20*val0)+(val21*val4)+(val22*val8)+(val23*val12));
    acc0[5] = (acc0[5]+(val20*val1)+(val21*val5)+(val22*val9)+(val23*val13));
    acc0[9] = (acc0[9]+(val20*val2)+(val21*val6)+(val22*val10)+(val23*val14));
    acc0[13] = (acc0[13]+(val20*val3)+(val21*val7)+(val22*val11)+(val23*val15));
    acc0[2] = (acc0[2]+(val24*val0)+(val25*val4)+(val26*val8)+(val27*val12));
    acc0[6] = (acc0[6]+(val24*val1)+(val25*val5)+(val26*val9)+(val27*val13));
    acc0[10] = (acc0[10]+(val24*val2)+(val25*val6)+(val26*val10)+(val27*val14));
    acc0[14] = (acc0[14]+(val24*val3)+(val25*val7)+(val26*val11)+(val27*val15));
    acc0[3] = (acc0[3]+(val28*val0)+(val29*val4)+(val30*val8)+(val31*val12));
    acc0[7] = (acc0[7]+(val28*val1)+(val29*val5)+(val30*val9)+(val31*val13));
    acc0[11] = (acc0[11]+(val28*val2)+(val29*val6)+(val30*val10)+(val31*val14));
    acc0[15] = (acc0[15]+(val28*val3)+(val29*val7)+(val30*val11)+(val31*val15));
    acc0[0] = (acc0[0]+(val16*val0)+(val17*val4)+(val18*val8)+(val19*val12));
    acc0[4] = (acc0[4]+(val16*val1)+(val17*val5)+(val18*val9)+(val19*val13));
    acc0[8] = (acc0[8]+(val16*val2)+(val17*val6)+(val18*val10)+(val19*val14));
    acc0[12] = (acc0[12]+(val16*val3)+(val17*val7)+(val18*val11)+(val19*val15));
  }
  var precast6 = gidx0;
  var precast7 = lidx0;
  var precast8 = (bitcast<u32>(precast6)<<11u);
  var precast9 = (bitcast<u32>(precast7)<<8u);
  var alu35 = (bitcast<i32>(precast8)+(gidx1*28672)+bitcast<i32>(precast9)+cast0);
  data0_344064[alu35] = acc0[0];
  data0_344064[(alu35+1)] = acc0[4];
  data0_344064[(alu35+2)] = acc0[8];
  data0_344064[(alu35+3)] = acc0[12];
  data0_344064[(alu35+64)] = acc0[1];
  data0_344064[(alu35+65)] = acc0[5];
  data0_344064[(alu35+66)] = acc0[9];
  data0_344064[(alu35+67)] = acc0[13];
  data0_344064[(alu35+128)] = acc0[2];
  data0_344064[(alu35+129)] = acc0[6];
  data0_344064[(alu35+130)] = acc0[10];
  data0_344064[(alu35+131)] = acc0[14];
  data0_344064[(alu35+192)] = acc0[3];
  data0_344064[(alu35+193)] = acc0[7];
  data0_344064[(alu35+194)] = acc0[11];
  data0_344064[(alu35+195)] = acc0[15];
}`;

const r_14_64_8_16_4_3_192_4 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_1376256:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1_344064:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2_2359296:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3_3072:array<f32>;
@compute @workgroup_size(8,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var acc0: array<f32,12>;
  var gidx0 = i32(gindex.x); /* 64 */
  var gidx1 = i32(gindex.y); /* 14 */
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
  for (var ridx1006 = 0; ridx1006 < 192; ridx1006++) {
    var precast0 = ridx1006;
    var precast1 = (bitcast<u32>(precast0)<<2u);
    var cast0 = bitcast<i32>(precast1);
    var alu12 = ((gidx0*36864)+(lidx1*2304)+cast0);
    var val0 = data2_2359296[alu12];
    var val1 = data2_2359296[(alu12+1)];
    var val2 = data2_2359296[(alu12+2)];
    var val3 = data2_2359296[(alu12+3)];
    var val4 = data2_2359296[(alu12+768)];
    var val5 = data2_2359296[(alu12+769)];
    var val6 = data2_2359296[(alu12+770)];
    var val7 = data2_2359296[(alu12+771)];
    var val8 = data2_2359296[(alu12+1536)];
    var val9 = data2_2359296[(alu12+1537)];
    var val10 = data2_2359296[(alu12+1538)];
    var val11 = data2_2359296[(alu12+1539)];
    var alu13 = ((gidx1*24576)+(lidx0*3072)+cast0);
    var val12 = data1_344064[alu13];
    var val13 = data1_344064[(alu13+1)];
    var val14 = data1_344064[(alu13+2)];
    var val15 = data1_344064[(alu13+3)];
    var val16 = data1_344064[(alu13+768)];
    var val17 = data1_344064[(alu13+769)];
    var val18 = data1_344064[(alu13+770)];
    var val19 = data1_344064[(alu13+771)];
    var val20 = data1_344064[(alu13+1536)];
    var val21 = data1_344064[(alu13+1537)];
    var val22 = data1_344064[(alu13+1538)];
    var val23 = data1_344064[(alu13+1539)];
    var val24 = data1_344064[(alu13+2304)];
    var val25 = data1_344064[(alu13+2305)];
    var val26 = data1_344064[(alu13+2306)];
    var val27 = data1_344064[(alu13+2307)];
    acc0[3] = (acc0[3]+(val16*val0)+(val17*val1)+(val18*val2)+(val19*val3));
    acc0[4] = (acc0[4]+(val16*val4)+(val17*val5)+(val18*val6)+(val19*val7));
    acc0[5] = (acc0[5]+(val16*val8)+(val17*val9)+(val18*val10)+(val19*val11));
    acc0[6] = (acc0[6]+(val20*val0)+(val21*val1)+(val22*val2)+(val23*val3));
    acc0[7] = (acc0[7]+(val20*val4)+(val21*val5)+(val22*val6)+(val23*val7));
    acc0[8] = (acc0[8]+(val20*val8)+(val21*val9)+(val22*val10)+(val23*val11));
    acc0[9] = (acc0[9]+(val24*val0)+(val25*val1)+(val26*val2)+(val27*val3));
    acc0[10] = (acc0[10]+(val24*val4)+(val25*val5)+(val26*val6)+(val27*val7));
    acc0[11] = (acc0[11]+(val24*val8)+(val25*val9)+(val26*val10)+(val27*val11));
    acc0[1] = (acc0[1]+(val12*val4)+(val13*val5)+(val14*val6)+(val15*val7));
    acc0[2] = (acc0[2]+(val12*val8)+(val13*val9)+(val14*val10)+(val15*val11));
    acc0[0] = (acc0[0]+(val12*val0)+(val13*val1)+(val14*val2)+(val15*val3));
  }
  var alu27 = (gidx0*48);
  var alu28 = (lidx1*3);
  var alu29 = (alu27+alu28);
  var val28 = data3_3072[alu29];
  var val29 = data3_3072[(alu29+1)];
  var val30 = data3_3072[(alu29+2)];
  var alu30 = (acc0[0]+val28);
  var alu31 = (acc0[1]+val29);
  var alu32 = (acc0[2]+val30);
  var alu33 = (acc0[3]+val28);
  var alu34 = (acc0[4]+val29);
  var alu35 = (acc0[5]+val30);
  var alu36 = (acc0[6]+val28);
  var alu37 = (acc0[7]+val29);
  var alu38 = (acc0[8]+val30);
  var alu39 = (acc0[9]+val28);
  var alu40 = (acc0[10]+val29);
  var alu41 = (acc0[11]+val30);
  var alu42 = (alu27+(gidx1*98304)+(lidx0*12288)+alu28);
  data0_1376256[alu42] = ((1/(1.0f+exp2(((alu30+(0.044715f*alu30*alu30*alu30))*-2.302208198144325f))))*alu30);
  data0_1376256[(alu42+1)] = ((1/(1.0f+exp2(((alu31+(0.044715f*alu31*alu31*alu31))*-2.302208198144325f))))*alu31);
  data0_1376256[(alu42+2)] = ((1/(1.0f+exp2(((alu32+(0.044715f*alu32*alu32*alu32))*-2.302208198144325f))))*alu32);
  data0_1376256[(alu42+3072)] = ((1/(1.0f+exp2(((alu33+(0.044715f*alu33*alu33*alu33))*-2.302208198144325f))))*alu33);
  data0_1376256[(alu42+3073)] = ((1/(1.0f+exp2(((alu34+(0.044715f*alu34*alu34*alu34))*-2.302208198144325f))))*alu34);
  data0_1376256[(alu42+3074)] = ((1/(1.0f+exp2(((alu35+(0.044715f*alu35*alu35*alu35))*-2.302208198144325f))))*alu35);
  data0_1376256[(alu42+6144)] = ((1/(1.0f+exp2(((alu36+(0.044715f*alu36*alu36*alu36))*-2.302208198144325f))))*alu36);
  data0_1376256[(alu42+6145)] = ((1/(1.0f+exp2(((alu37+(0.044715f*alu37*alu37*alu37))*-2.302208198144325f))))*alu37);
  data0_1376256[(alu42+6146)] = ((1/(1.0f+exp2(((alu38+(0.044715f*alu38*alu38*alu38))*-2.302208198144325f))))*alu38);
  data0_1376256[(alu42+9216)] = ((1/(1.0f+exp2(((alu39+(0.044715f*alu39*alu39*alu39))*-2.302208198144325f))))*alu39);
  data0_1376256[(alu42+9217)] = ((1/(1.0f+exp2(((alu40+(0.044715f*alu40*alu40*alu40))*-2.302208198144325f))))*alu40);
  data0_1376256[(alu42+9218)] = ((1/(1.0f+exp2(((alu41+(0.044715f*alu41*alu41*alu41))*-2.302208198144325f))))*alu41);
}`;

const r_14_16_8_16_4_3_768_4 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_344064:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1_344064:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2_1376256:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3_2359296:array<f32>;
@group(0) @binding(5)var<storage,read_write>data4_768:array<f32>;
@compute @workgroup_size(8,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var acc0: array<f32,12>;
  var gidx0 = i32(gindex.x); /* 16 */
  var gidx1 = i32(gindex.y); /* 14 */
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
  for (var ridx1006 = 0; ridx1006 < 768; ridx1006++) {
    var precast0 = ridx1006;
    var precast1 = (bitcast<u32>(precast0)<<2u);
    var cast0 = bitcast<i32>(precast1);
    var alu12 = ((gidx0*147456)+(lidx1*9216)+cast0);
    var val0 = data3_2359296[alu12];
    var val1 = data3_2359296[(alu12+1)];
    var val2 = data3_2359296[(alu12+2)];
    var val3 = data3_2359296[(alu12+3)];
    var val4 = data3_2359296[(alu12+3072)];
    var val5 = data3_2359296[(alu12+3073)];
    var val6 = data3_2359296[(alu12+3074)];
    var val7 = data3_2359296[(alu12+3075)];
    var val8 = data3_2359296[(alu12+6144)];
    var val9 = data3_2359296[(alu12+6145)];
    var val10 = data3_2359296[(alu12+6146)];
    var val11 = data3_2359296[(alu12+6147)];
    var alu13 = ((gidx1*98304)+(lidx0*12288)+cast0);
    var val12 = data2_1376256[alu13];
    var val13 = data2_1376256[(alu13+1)];
    var val14 = data2_1376256[(alu13+2)];
    var val15 = data2_1376256[(alu13+3)];
    var val16 = data2_1376256[(alu13+3072)];
    var val17 = data2_1376256[(alu13+3073)];
    var val18 = data2_1376256[(alu13+3074)];
    var val19 = data2_1376256[(alu13+3075)];
    var val20 = data2_1376256[(alu13+6144)];
    var val21 = data2_1376256[(alu13+6145)];
    var val22 = data2_1376256[(alu13+6146)];
    var val23 = data2_1376256[(alu13+6147)];
    var val24 = data2_1376256[(alu13+9216)];
    var val25 = data2_1376256[(alu13+9217)];
    var val26 = data2_1376256[(alu13+9218)];
    var val27 = data2_1376256[(alu13+9219)];
    acc0[3] = (acc0[3]+(val16*val0)+(val17*val1)+(val18*val2)+(val19*val3));
    acc0[4] = (acc0[4]+(val16*val4)+(val17*val5)+(val18*val6)+(val19*val7));
    acc0[5] = (acc0[5]+(val16*val8)+(val17*val9)+(val18*val10)+(val19*val11));
    acc0[6] = (acc0[6]+(val20*val0)+(val21*val1)+(val22*val2)+(val23*val3));
    acc0[7] = (acc0[7]+(val20*val4)+(val21*val5)+(val22*val6)+(val23*val7));
    acc0[8] = (acc0[8]+(val20*val8)+(val21*val9)+(val22*val10)+(val23*val11));
    acc0[9] = (acc0[9]+(val24*val0)+(val25*val1)+(val26*val2)+(val27*val3));
    acc0[10] = (acc0[10]+(val24*val4)+(val25*val5)+(val26*val6)+(val27*val7));
    acc0[11] = (acc0[11]+(val24*val8)+(val25*val9)+(val26*val10)+(val27*val11));
    acc0[1] = (acc0[1]+(val12*val4)+(val13*val5)+(val14*val6)+(val15*val7));
    acc0[2] = (acc0[2]+(val12*val8)+(val13*val9)+(val14*val10)+(val15*val11));
    acc0[0] = (acc0[0]+(val12*val0)+(val13*val1)+(val14*val2)+(val15*val3));
  }
  var alu27 = (gidx0*48);
  var alu28 = (lidx1*3);
  var alu29 = (alu27+(gidx1*24576)+(lidx0*3072)+alu28);
  var val28 = data1_344064[alu29];
  var alu30 = (alu29+1);
  var val29 = data1_344064[alu30];
  var alu31 = (alu29+2);
  var val30 = data1_344064[alu31];
  var alu32 = (alu29+768);
  var val31 = data1_344064[alu32];
  var alu33 = (alu29+769);
  var val32 = data1_344064[alu33];
  var alu34 = (alu29+770);
  var val33 = data1_344064[alu34];
  var alu35 = (alu29+1536);
  var val34 = data1_344064[alu35];
  var alu36 = (alu29+1537);
  var val35 = data1_344064[alu36];
  var alu37 = (alu29+1538);
  var val36 = data1_344064[alu37];
  var alu38 = (alu29+2304);
  var val37 = data1_344064[alu38];
  var alu39 = (alu29+2305);
  var val38 = data1_344064[alu39];
  var alu40 = (alu29+2306);
  var val39 = data1_344064[alu40];
  var alu41 = (alu27+alu28);
  var val40 = data4_768[alu41];
  var val41 = data4_768[(alu41+1)];
  var val42 = data4_768[(alu41+2)];
  data0_344064[alu30] = (val29+acc0[1]+val41);
  data0_344064[alu31] = (val30+acc0[2]+val42);
  data0_344064[alu32] = (val31+acc0[3]+val40);
  data0_344064[alu33] = (val32+acc0[4]+val41);
  data0_344064[alu34] = (val33+acc0[5]+val42);
  data0_344064[alu35] = (val34+acc0[6]+val40);
  data0_344064[alu36] = (val35+acc0[7]+val41);
  data0_344064[alu37] = (val36+acc0[8]+val42);
  data0_344064[alu38] = (val37+acc0[9]+val40);
  data0_344064[alu39] = (val38+acc0[10]+val41);
  data0_344064[alu40] = (val39+acc0[11]+val42);
  data0_344064[alu29] = (val28+acc0[0]+val40);
}`;

const r_7_2161_16_8_3_4_192_4 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_23235072:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1_344064:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2_39831552:array<f32>;
@compute @workgroup_size(16,8) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var acc0: array<f32,12>;
  var gidx0 = i32(gindex.x); /* 2161 */
  var gidx1 = i32(gindex.y); /* 7 */
  var lidx0 = i32(lindex.x); /* 16 */
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
  for (var ridx1006 = 0; ridx1006 < 192; ridx1006++) {
    var precast0 = ridx1006;
    var precast1 = (bitcast<u32>(precast0)<<2u);
    var cast0 = bitcast<i32>(precast1);
    var alu12 = ((gidx0*18432)+(lidx1*2304)+cast0);
    var val0 = data2_39831552[alu12];
    var val1 = data2_39831552[(alu12+1)];
    var val2 = data2_39831552[(alu12+2)];
    var val3 = data2_39831552[(alu12+3)];
    var val4 = data2_39831552[(alu12+768)];
    var val5 = data2_39831552[(alu12+769)];
    var val6 = data2_39831552[(alu12+770)];
    var val7 = data2_39831552[(alu12+771)];
    var val8 = data2_39831552[(alu12+1536)];
    var val9 = data2_39831552[(alu12+1537)];
    var val10 = data2_39831552[(alu12+1538)];
    var val11 = data2_39831552[(alu12+1539)];
    var alu13 = ((gidx1*49152)+(lidx0*3072)+cast0);
    var val12 = data1_344064[alu13];
    var val13 = data1_344064[(alu13+1)];
    var val14 = data1_344064[(alu13+2)];
    var val15 = data1_344064[(alu13+3)];
    var val16 = data1_344064[(alu13+768)];
    var val17 = data1_344064[(alu13+769)];
    var val18 = data1_344064[(alu13+770)];
    var val19 = data1_344064[(alu13+771)];
    var val20 = data1_344064[(alu13+1536)];
    var val21 = data1_344064[(alu13+1537)];
    var val22 = data1_344064[(alu13+1538)];
    var val23 = data1_344064[(alu13+1539)];
    var val24 = data1_344064[(alu13+2304)];
    var val25 = data1_344064[(alu13+2305)];
    var val26 = data1_344064[(alu13+2306)];
    var val27 = data1_344064[(alu13+2307)];
    acc0[1] = (acc0[1]+(val16*val0)+(val17*val1)+(val18*val2)+(val19*val3));
    acc0[5] = (acc0[5]+(val16*val4)+(val17*val5)+(val18*val6)+(val19*val7));
    acc0[9] = (acc0[9]+(val16*val8)+(val17*val9)+(val18*val10)+(val19*val11));
    acc0[2] = (acc0[2]+(val20*val0)+(val21*val1)+(val22*val2)+(val23*val3));
    acc0[6] = (acc0[6]+(val20*val4)+(val21*val5)+(val22*val6)+(val23*val7));
    acc0[10] = (acc0[10]+(val20*val8)+(val21*val9)+(val22*val10)+(val23*val11));
    acc0[3] = (acc0[3]+(val24*val0)+(val25*val1)+(val26*val2)+(val27*val3));
    acc0[7] = (acc0[7]+(val24*val4)+(val25*val5)+(val26*val6)+(val27*val7));
    acc0[11] = (acc0[11]+(val24*val8)+(val25*val9)+(val26*val10)+(val27*val11));
    acc0[4] = (acc0[4]+(val12*val4)+(val13*val5)+(val14*val6)+(val15*val7));
    acc0[8] = (acc0[8]+(val12*val8)+(val13*val9)+(val14*val10)+(val15*val11));
    acc0[0] = (acc0[0]+(val12*val0)+(val13*val1)+(val14*val2)+(val15*val3));
  }
  var alu27 = ((gidx0*24)+(gidx1*3319296)+(lidx0*207456)+(lidx1*3));
  data0_23235072[alu27] = acc0[0];
  data0_23235072[(alu27+1)] = acc0[4];
  data0_23235072[(alu27+2)] = acc0[8];
  data0_23235072[(alu27+51864)] = acc0[1];
  data0_23235072[(alu27+51865)] = acc0[5];
  data0_23235072[(alu27+51866)] = acc0[9];
  data0_23235072[(alu27+103728)] = acc0[2];
  data0_23235072[(alu27+103729)] = acc0[6];
  data0_23235072[(alu27+103730)] = acc0[10];
  data0_23235072[(alu27+155592)] = acc0[3];
  data0_23235072[(alu27+155593)] = acc0[7];
  data0_23235072[(alu27+155594)] = acc0[11];
}`;

const E_2161_8_3 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_51864:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1_23235072:array<f32>;
@group(0) @binding(3)var<uniform>ctx:i32;
@compute @workgroup_size(8) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 2161 */
  var lidx0 = i32(lindex.x); /* 8 */
  var alu0 = (gidx0*24);
  var alu1 = (lidx0*3);
  var alu2 = ((ctx*51864)+alu0+alu1);
  var val0 = data1_23235072[(alu2+-51864)];
  var val1 = data1_23235072[(alu2+-51863)];
  var val2 = data1_23235072[(alu2+-51862)];
  var alu3 = (alu0+alu1);
  data0_51864[alu3] = val0;
  data0_51864[(alu3+1)] = val1;
  data0_51864[(alu3+2)] = val2;
}`;

const setupNet = async (device, safetensor) => {
    const metadata = getTensorMetadata(safetensor);
    const infinityBuf = createInfinityUniformBuf(device);

    const layouts=[device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' } }]})]

    const buf_0 = createEmptyBuf(device, 16515072);;
    const input0 = createEmptyBuf(device, 1792);;
    const buf_1 = createWeightBuf(device, 159326208, getTensorBuffer(safetensor, metadata['token_embedding.weight']));
    const buf_2 = createEmptyBuf(device, 1376256);;
    const buf_3 = createWeightBuf(device, 1376256, getTensorBuffer(safetensor, metadata['positional_embedding']));
    const buf_4 = createEmptyBuf(device, 1792);;
    const buf_5 = createEmptyBuf(device, 1792);;
    const buf_6 = createEmptyBuf(device, 1376256);;
    const buf_7 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.0.attn_ln.weight']));
    const buf_8 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.0.attn_ln.bias']));
    const buf_9 = createEmptyBuf(device, 1376256);;
    const buf_10 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.0.attn.key.weight']));
    const buf_11 = createWeightBuf(device, 1376256, getTensorBuffer(safetensor, metadata['blocks.0.attn.cache_k']));
    const buf_12 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.0.attn.value.weight']));
    const buf_13 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.0.attn.value.bias']));
    const buf_14 = createWeightBuf(device, 1376256, getTensorBuffer(safetensor, metadata['blocks.0.attn.cache_v']));
    const buf_15 = createWeightBuf(device, 4608000, getTensorBuffer(safetensor, metadata['blocks.0.cross_attn.cache_k']));
    const input1 = createEmptyBuf(device, 4608000);;
    const buf_16 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.0.cross_attn.key.weight']));
    const buf_17 = createWeightBuf(device, 4608000, getTensorBuffer(safetensor, metadata['blocks.0.cross_attn.cache_v']));
    const buf_18 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.0.cross_attn.value.weight']));
    const buf_19 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.0.cross_attn.value.bias']));
    const buf_20 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.0.attn.query.weight']));
    const buf_21 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.0.attn.query.bias']));
    const buf_22 = createEmptyBuf(device, 1376256);;
    const buf_23 = createEmptyBuf(device, 1376256);;
    const buf_24 = createEmptyBuf(device, 4608000);;
    const buf_25 = createEmptyBuf(device, 4608000);;
    const buf_26 = createEmptyBuf(device, 9633792);;
    const buf_27 = createWeightBuf(device, 802816, getTensorBuffer(safetensor, metadata['mask']));
    const buf_28 = createEmptyBuf(device, 21504);;
    const buf_29 = createEmptyBuf(device, 21504);;
    const buf_30 = createEmptyBuf(device, 9633792);;
    const buf_31 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.0.attn.out.weight']));
    const buf_32 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.0.attn.out.bias']));
    const buf_33 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.0.cross_attn_ln.weight']));
    const buf_34 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.0.cross_attn_ln.bias']));
    const buf_35 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.0.cross_attn.query.weight']));
    const buf_36 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.0.cross_attn.query.bias']));
    const buf_37 = createEmptyBuf(device, 32256000);;
    const buf_38 = createEmptyBuf(device, 32256000);;
    const buf_39 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.0.cross_attn.out.weight']));
    const buf_40 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.0.cross_attn.out.bias']));
    const buf_41 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.0.mlp_ln.weight']));
    const buf_42 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.0.mlp_ln.bias']));
    const buf_43 = createEmptyBuf(device, 5505024);;
    const buf_44 = createWeightBuf(device, 9437184, getTensorBuffer(safetensor, metadata['blocks.0.mlp.0.weight']));
    const buf_45 = createWeightBuf(device, 12288, getTensorBuffer(safetensor, metadata['blocks.0.mlp.0.bias']));
    const buf_46 = createEmptyBuf(device, 1376256);;
    const buf_47 = createWeightBuf(device, 9437184, getTensorBuffer(safetensor, metadata['blocks.0.mlp.2.weight']));
    const buf_48 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.0.mlp.2.bias']));
    const buf_49 = createEmptyBuf(device, 1376256);;
    const buf_50 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.1.attn_ln.weight']));
    const buf_51 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.1.attn_ln.bias']));
    const buf_52 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.1.attn.key.weight']));
    const buf_53 = createWeightBuf(device, 1376256, getTensorBuffer(safetensor, metadata['blocks.1.attn.cache_k']));
    const buf_54 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.1.attn.value.weight']));
    const buf_55 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.1.attn.value.bias']));
    const buf_56 = createWeightBuf(device, 1376256, getTensorBuffer(safetensor, metadata['blocks.1.attn.cache_v']));
    const buf_57 = createWeightBuf(device, 4608000, getTensorBuffer(safetensor, metadata['blocks.1.cross_attn.cache_k']));
    const buf_58 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.1.cross_attn.key.weight']));
    const buf_59 = createWeightBuf(device, 4608000, getTensorBuffer(safetensor, metadata['blocks.1.cross_attn.cache_v']));
    const buf_60 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.1.cross_attn.value.weight']));
    const buf_61 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.1.cross_attn.value.bias']));
    const buf_62 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.1.attn.query.weight']));
    const buf_63 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.1.attn.query.bias']));
    const buf_64 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.1.attn.out.weight']));
    const buf_65 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.1.attn.out.bias']));
    const buf_66 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.1.cross_attn_ln.weight']));
    const buf_67 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.1.cross_attn_ln.bias']));
    const buf_68 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.1.cross_attn.query.weight']));
    const buf_69 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.1.cross_attn.query.bias']));
    const buf_70 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.1.cross_attn.out.weight']));
    const buf_71 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.1.cross_attn.out.bias']));
    const buf_72 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.1.mlp_ln.weight']));
    const buf_73 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.1.mlp_ln.bias']));
    const buf_74 = createWeightBuf(device, 9437184, getTensorBuffer(safetensor, metadata['blocks.1.mlp.0.weight']));
    const buf_75 = createWeightBuf(device, 12288, getTensorBuffer(safetensor, metadata['blocks.1.mlp.0.bias']));
    const buf_76 = createEmptyBuf(device, 1376256);;
    const buf_77 = createWeightBuf(device, 9437184, getTensorBuffer(safetensor, metadata['blocks.1.mlp.2.weight']));
    const buf_78 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.1.mlp.2.bias']));
    const buf_79 = createEmptyBuf(device, 1376256);;
    const buf_80 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.2.attn_ln.weight']));
    const buf_81 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.2.attn_ln.bias']));
    const buf_82 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.2.attn.key.weight']));
    const buf_83 = createWeightBuf(device, 1376256, getTensorBuffer(safetensor, metadata['blocks.2.attn.cache_k']));
    const buf_84 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.2.attn.value.weight']));
    const buf_85 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.2.attn.value.bias']));
    const buf_86 = createWeightBuf(device, 1376256, getTensorBuffer(safetensor, metadata['blocks.2.attn.cache_v']));
    const buf_87 = createWeightBuf(device, 4608000, getTensorBuffer(safetensor, metadata['blocks.2.cross_attn.cache_k']));
    const buf_88 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.2.cross_attn.key.weight']));
    const buf_89 = createWeightBuf(device, 4608000, getTensorBuffer(safetensor, metadata['blocks.2.cross_attn.cache_v']));
    const buf_90 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.2.cross_attn.value.weight']));
    const buf_91 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.2.cross_attn.value.bias']));
    const buf_92 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.2.attn.query.weight']));
    const buf_93 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.2.attn.query.bias']));
    const buf_94 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.2.attn.out.weight']));
    const buf_95 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.2.attn.out.bias']));
    const buf_96 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.2.cross_attn_ln.weight']));
    const buf_97 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.2.cross_attn_ln.bias']));
    const buf_98 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.2.cross_attn.query.weight']));
    const buf_99 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.2.cross_attn.query.bias']));
    const buf_100 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.2.cross_attn.out.weight']));
    const buf_101 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.2.cross_attn.out.bias']));
    const buf_102 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.2.mlp_ln.weight']));
    const buf_103 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.2.mlp_ln.bias']));
    const buf_104 = createWeightBuf(device, 9437184, getTensorBuffer(safetensor, metadata['blocks.2.mlp.0.weight']));
    const buf_105 = createWeightBuf(device, 12288, getTensorBuffer(safetensor, metadata['blocks.2.mlp.0.bias']));
    const buf_106 = createEmptyBuf(device, 1376256);;
    const buf_107 = createWeightBuf(device, 9437184, getTensorBuffer(safetensor, metadata['blocks.2.mlp.2.weight']));
    const buf_108 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.2.mlp.2.bias']));
    const buf_109 = createEmptyBuf(device, 1376256);;
    const buf_110 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.3.attn_ln.weight']));
    const buf_111 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.3.attn_ln.bias']));
    const buf_112 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.3.attn.key.weight']));
    const buf_113 = createWeightBuf(device, 1376256, getTensorBuffer(safetensor, metadata['blocks.3.attn.cache_k']));
    const buf_114 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.3.attn.value.weight']));
    const buf_115 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.3.attn.value.bias']));
    const buf_116 = createWeightBuf(device, 1376256, getTensorBuffer(safetensor, metadata['blocks.3.attn.cache_v']));
    const buf_117 = createWeightBuf(device, 4608000, getTensorBuffer(safetensor, metadata['blocks.3.cross_attn.cache_k']));
    const buf_118 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.3.cross_attn.key.weight']));
    const buf_119 = createWeightBuf(device, 4608000, getTensorBuffer(safetensor, metadata['blocks.3.cross_attn.cache_v']));
    const buf_120 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.3.cross_attn.value.weight']));
    const buf_121 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.3.cross_attn.value.bias']));
    const buf_122 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.3.attn.query.weight']));
    const buf_123 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.3.attn.query.bias']));
    const buf_124 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.3.attn.out.weight']));
    const buf_125 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.3.attn.out.bias']));
    const buf_126 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.3.cross_attn_ln.weight']));
    const buf_127 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.3.cross_attn_ln.bias']));
    const buf_128 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.3.cross_attn.query.weight']));
    const buf_129 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.3.cross_attn.query.bias']));
    const buf_130 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.3.cross_attn.out.weight']));
    const buf_131 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.3.cross_attn.out.bias']));
    const buf_132 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.3.mlp_ln.weight']));
    const buf_133 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.3.mlp_ln.bias']));
    const buf_134 = createWeightBuf(device, 9437184, getTensorBuffer(safetensor, metadata['blocks.3.mlp.0.weight']));
    const buf_135 = createWeightBuf(device, 12288, getTensorBuffer(safetensor, metadata['blocks.3.mlp.0.bias']));
    const buf_136 = createEmptyBuf(device, 1376256);;
    const buf_137 = createWeightBuf(device, 9437184, getTensorBuffer(safetensor, metadata['blocks.3.mlp.2.weight']));
    const buf_138 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.3.mlp.2.bias']));
    const buf_139 = createEmptyBuf(device, 1376256);;
    const buf_140 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.4.attn_ln.weight']));
    const buf_141 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.4.attn_ln.bias']));
    const buf_142 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.4.attn.key.weight']));
    const buf_143 = createWeightBuf(device, 1376256, getTensorBuffer(safetensor, metadata['blocks.4.attn.cache_k']));
    const buf_144 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.4.attn.value.weight']));
    const buf_145 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.4.attn.value.bias']));
    const buf_146 = createWeightBuf(device, 1376256, getTensorBuffer(safetensor, metadata['blocks.4.attn.cache_v']));
    const buf_147 = createWeightBuf(device, 4608000, getTensorBuffer(safetensor, metadata['blocks.4.cross_attn.cache_k']));
    const buf_148 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.4.cross_attn.key.weight']));
    const buf_149 = createWeightBuf(device, 4608000, getTensorBuffer(safetensor, metadata['blocks.4.cross_attn.cache_v']));
    const buf_150 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.4.cross_attn.value.weight']));
    const buf_151 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.4.cross_attn.value.bias']));
    const buf_152 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.4.attn.query.weight']));
    const buf_153 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.4.attn.query.bias']));
    const buf_154 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.4.attn.out.weight']));
    const buf_155 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.4.attn.out.bias']));
    const buf_156 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.4.cross_attn_ln.weight']));
    const buf_157 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.4.cross_attn_ln.bias']));
    const buf_158 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.4.cross_attn.query.weight']));
    const buf_159 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.4.cross_attn.query.bias']));
    const buf_160 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.4.cross_attn.out.weight']));
    const buf_161 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.4.cross_attn.out.bias']));
    const buf_162 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.4.mlp_ln.weight']));
    const buf_163 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.4.mlp_ln.bias']));
    const buf_164 = createWeightBuf(device, 9437184, getTensorBuffer(safetensor, metadata['blocks.4.mlp.0.weight']));
    const buf_165 = createWeightBuf(device, 12288, getTensorBuffer(safetensor, metadata['blocks.4.mlp.0.bias']));
    const buf_166 = createEmptyBuf(device, 1376256);;
    const buf_167 = createWeightBuf(device, 9437184, getTensorBuffer(safetensor, metadata['blocks.4.mlp.2.weight']));
    const buf_168 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.4.mlp.2.bias']));
    const buf_169 = createEmptyBuf(device, 1376256);;
    const buf_170 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.5.attn_ln.weight']));
    const buf_171 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.5.attn_ln.bias']));
    const buf_172 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.5.attn.key.weight']));
    const buf_173 = createWeightBuf(device, 1376256, getTensorBuffer(safetensor, metadata['blocks.5.attn.cache_k']));
    const buf_174 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.5.attn.value.weight']));
    const buf_175 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.5.attn.value.bias']));
    const buf_176 = createWeightBuf(device, 1376256, getTensorBuffer(safetensor, metadata['blocks.5.attn.cache_v']));
    const buf_177 = createWeightBuf(device, 4608000, getTensorBuffer(safetensor, metadata['blocks.5.cross_attn.cache_k']));
    const buf_178 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.5.cross_attn.key.weight']));
    const buf_179 = createWeightBuf(device, 4608000, getTensorBuffer(safetensor, metadata['blocks.5.cross_attn.cache_v']));
    const buf_180 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.5.cross_attn.value.weight']));
    const buf_181 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.5.cross_attn.value.bias']));
    const buf_182 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.5.attn.query.weight']));
    const buf_183 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.5.attn.query.bias']));
    const buf_184 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.5.attn.out.weight']));
    const buf_185 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.5.attn.out.bias']));
    const buf_186 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.5.cross_attn_ln.weight']));
    const buf_187 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.5.cross_attn_ln.bias']));
    const buf_188 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.5.cross_attn.query.weight']));
    const buf_189 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.5.cross_attn.query.bias']));
    const buf_190 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.5.cross_attn.out.weight']));
    const buf_191 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.5.cross_attn.out.bias']));
    const buf_192 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.5.mlp_ln.weight']));
    const buf_193 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.5.mlp_ln.bias']));
    const buf_194 = createWeightBuf(device, 9437184, getTensorBuffer(safetensor, metadata['blocks.5.mlp.0.weight']));
    const buf_195 = createWeightBuf(device, 12288, getTensorBuffer(safetensor, metadata['blocks.5.mlp.0.bias']));
    const buf_196 = createEmptyBuf(device, 1376256);;
    const buf_197 = createWeightBuf(device, 9437184, getTensorBuffer(safetensor, metadata['blocks.5.mlp.2.weight']));
    const buf_198 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.5.mlp.2.bias']));
    const buf_199 = createEmptyBuf(device, 1376256);;
    const buf_200 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.6.attn_ln.weight']));
    const buf_201 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.6.attn_ln.bias']));
    const buf_202 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.6.attn.key.weight']));
    const buf_203 = createWeightBuf(device, 1376256, getTensorBuffer(safetensor, metadata['blocks.6.attn.cache_k']));
    const buf_204 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.6.attn.value.weight']));
    const buf_205 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.6.attn.value.bias']));
    const buf_206 = createWeightBuf(device, 1376256, getTensorBuffer(safetensor, metadata['blocks.6.attn.cache_v']));
    const buf_207 = createWeightBuf(device, 4608000, getTensorBuffer(safetensor, metadata['blocks.6.cross_attn.cache_k']));
    const buf_208 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.6.cross_attn.key.weight']));
    const buf_209 = createWeightBuf(device, 4608000, getTensorBuffer(safetensor, metadata['blocks.6.cross_attn.cache_v']));
    const buf_210 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.6.cross_attn.value.weight']));
    const buf_211 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.6.cross_attn.value.bias']));
    const buf_212 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.6.attn.query.weight']));
    const buf_213 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.6.attn.query.bias']));
    const buf_214 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.6.attn.out.weight']));
    const buf_215 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.6.attn.out.bias']));
    const buf_216 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.6.cross_attn_ln.weight']));
    const buf_217 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.6.cross_attn_ln.bias']));
    const buf_218 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.6.cross_attn.query.weight']));
    const buf_219 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.6.cross_attn.query.bias']));
    const buf_220 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.6.cross_attn.out.weight']));
    const buf_221 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.6.cross_attn.out.bias']));
    const buf_222 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.6.mlp_ln.weight']));
    const buf_223 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.6.mlp_ln.bias']));
    const buf_224 = createWeightBuf(device, 9437184, getTensorBuffer(safetensor, metadata['blocks.6.mlp.0.weight']));
    const buf_225 = createWeightBuf(device, 12288, getTensorBuffer(safetensor, metadata['blocks.6.mlp.0.bias']));
    const buf_226 = createEmptyBuf(device, 1376256);;
    const buf_227 = createWeightBuf(device, 9437184, getTensorBuffer(safetensor, metadata['blocks.6.mlp.2.weight']));
    const buf_228 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.6.mlp.2.bias']));
    const buf_229 = createEmptyBuf(device, 1376256);;
    const buf_230 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.7.attn_ln.weight']));
    const buf_231 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.7.attn_ln.bias']));
    const buf_232 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.7.attn.key.weight']));
    const buf_233 = createWeightBuf(device, 1376256, getTensorBuffer(safetensor, metadata['blocks.7.attn.cache_k']));
    const buf_234 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.7.attn.value.weight']));
    const buf_235 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.7.attn.value.bias']));
    const buf_236 = createWeightBuf(device, 1376256, getTensorBuffer(safetensor, metadata['blocks.7.attn.cache_v']));
    const buf_237 = createWeightBuf(device, 4608000, getTensorBuffer(safetensor, metadata['blocks.7.cross_attn.cache_k']));
    const buf_238 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.7.cross_attn.key.weight']));
    const buf_239 = createWeightBuf(device, 4608000, getTensorBuffer(safetensor, metadata['blocks.7.cross_attn.cache_v']));
    const buf_240 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.7.cross_attn.value.weight']));
    const buf_241 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.7.cross_attn.value.bias']));
    const buf_242 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.7.attn.query.weight']));
    const buf_243 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.7.attn.query.bias']));
    const buf_244 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.7.attn.out.weight']));
    const buf_245 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.7.attn.out.bias']));
    const buf_246 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.7.cross_attn_ln.weight']));
    const buf_247 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.7.cross_attn_ln.bias']));
    const buf_248 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.7.cross_attn.query.weight']));
    const buf_249 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.7.cross_attn.query.bias']));
    const buf_250 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.7.cross_attn.out.weight']));
    const buf_251 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.7.cross_attn.out.bias']));
    const buf_252 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.7.mlp_ln.weight']));
    const buf_253 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.7.mlp_ln.bias']));
    const buf_254 = createWeightBuf(device, 9437184, getTensorBuffer(safetensor, metadata['blocks.7.mlp.0.weight']));
    const buf_255 = createWeightBuf(device, 12288, getTensorBuffer(safetensor, metadata['blocks.7.mlp.0.bias']));
    const buf_256 = createEmptyBuf(device, 1376256);;
    const buf_257 = createWeightBuf(device, 9437184, getTensorBuffer(safetensor, metadata['blocks.7.mlp.2.weight']));
    const buf_258 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.7.mlp.2.bias']));
    const buf_259 = createEmptyBuf(device, 1376256);;
    const buf_260 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.8.attn_ln.weight']));
    const buf_261 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.8.attn_ln.bias']));
    const buf_262 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.8.attn.key.weight']));
    const buf_263 = createWeightBuf(device, 1376256, getTensorBuffer(safetensor, metadata['blocks.8.attn.cache_k']));
    const buf_264 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.8.attn.value.weight']));
    const buf_265 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.8.attn.value.bias']));
    const buf_266 = createWeightBuf(device, 1376256, getTensorBuffer(safetensor, metadata['blocks.8.attn.cache_v']));
    const buf_267 = createWeightBuf(device, 4608000, getTensorBuffer(safetensor, metadata['blocks.8.cross_attn.cache_k']));
    const buf_268 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.8.cross_attn.key.weight']));
    const buf_269 = createWeightBuf(device, 4608000, getTensorBuffer(safetensor, metadata['blocks.8.cross_attn.cache_v']));
    const buf_270 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.8.cross_attn.value.weight']));
    const buf_271 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.8.cross_attn.value.bias']));
    const buf_272 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.8.attn.query.weight']));
    const buf_273 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.8.attn.query.bias']));
    const buf_274 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.8.attn.out.weight']));
    const buf_275 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.8.attn.out.bias']));
    const buf_276 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.8.cross_attn_ln.weight']));
    const buf_277 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.8.cross_attn_ln.bias']));
    const buf_278 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.8.cross_attn.query.weight']));
    const buf_279 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.8.cross_attn.query.bias']));
    const buf_280 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.8.cross_attn.out.weight']));
    const buf_281 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.8.cross_attn.out.bias']));
    const buf_282 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.8.mlp_ln.weight']));
    const buf_283 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.8.mlp_ln.bias']));
    const buf_284 = createWeightBuf(device, 9437184, getTensorBuffer(safetensor, metadata['blocks.8.mlp.0.weight']));
    const buf_285 = createWeightBuf(device, 12288, getTensorBuffer(safetensor, metadata['blocks.8.mlp.0.bias']));
    const buf_286 = createEmptyBuf(device, 1376256);;
    const buf_287 = createWeightBuf(device, 9437184, getTensorBuffer(safetensor, metadata['blocks.8.mlp.2.weight']));
    const buf_288 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.8.mlp.2.bias']));
    const buf_289 = createEmptyBuf(device, 1376256);;
    const buf_290 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.9.attn_ln.weight']));
    const buf_291 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.9.attn_ln.bias']));
    const buf_292 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.9.attn.key.weight']));
    const buf_293 = createWeightBuf(device, 1376256, getTensorBuffer(safetensor, metadata['blocks.9.attn.cache_k']));
    const buf_294 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.9.attn.value.weight']));
    const buf_295 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.9.attn.value.bias']));
    const buf_296 = createWeightBuf(device, 1376256, getTensorBuffer(safetensor, metadata['blocks.9.attn.cache_v']));
    const buf_297 = createWeightBuf(device, 4608000, getTensorBuffer(safetensor, metadata['blocks.9.cross_attn.cache_k']));
    const buf_298 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.9.cross_attn.key.weight']));
    const buf_299 = createWeightBuf(device, 4608000, getTensorBuffer(safetensor, metadata['blocks.9.cross_attn.cache_v']));
    const buf_300 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.9.cross_attn.value.weight']));
    const buf_301 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.9.cross_attn.value.bias']));
    const buf_302 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.9.attn.query.weight']));
    const buf_303 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.9.attn.query.bias']));
    const buf_304 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.9.attn.out.weight']));
    const buf_305 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.9.attn.out.bias']));
    const buf_306 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.9.cross_attn_ln.weight']));
    const buf_307 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.9.cross_attn_ln.bias']));
    const buf_308 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.9.cross_attn.query.weight']));
    const buf_309 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.9.cross_attn.query.bias']));
    const buf_310 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.9.cross_attn.out.weight']));
    const buf_311 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.9.cross_attn.out.bias']));
    const buf_312 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.9.mlp_ln.weight']));
    const buf_313 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.9.mlp_ln.bias']));
    const buf_314 = createWeightBuf(device, 9437184, getTensorBuffer(safetensor, metadata['blocks.9.mlp.0.weight']));
    const buf_315 = createWeightBuf(device, 12288, getTensorBuffer(safetensor, metadata['blocks.9.mlp.0.bias']));
    const buf_316 = createEmptyBuf(device, 1376256);;
    const buf_317 = createWeightBuf(device, 9437184, getTensorBuffer(safetensor, metadata['blocks.9.mlp.2.weight']));
    const buf_318 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.9.mlp.2.bias']));
    const buf_319 = createEmptyBuf(device, 1376256);;
    const buf_320 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.10.attn_ln.weight']));
    const buf_321 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.10.attn_ln.bias']));
    const buf_322 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.10.attn.key.weight']));
    const buf_323 = createWeightBuf(device, 1376256, getTensorBuffer(safetensor, metadata['blocks.10.attn.cache_k']));
    const buf_324 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.10.attn.value.weight']));
    const buf_325 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.10.attn.value.bias']));
    const buf_326 = createWeightBuf(device, 1376256, getTensorBuffer(safetensor, metadata['blocks.10.attn.cache_v']));
    const buf_327 = createWeightBuf(device, 4608000, getTensorBuffer(safetensor, metadata['blocks.10.cross_attn.cache_k']));
    const buf_328 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.10.cross_attn.key.weight']));
    const buf_329 = createWeightBuf(device, 4608000, getTensorBuffer(safetensor, metadata['blocks.10.cross_attn.cache_v']));
    const buf_330 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.10.cross_attn.value.weight']));
    const buf_331 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.10.cross_attn.value.bias']));
    const buf_332 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.10.attn.query.weight']));
    const buf_333 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.10.attn.query.bias']));
    const buf_334 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.10.attn.out.weight']));
    const buf_335 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.10.attn.out.bias']));
    const buf_336 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.10.cross_attn_ln.weight']));
    const buf_337 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.10.cross_attn_ln.bias']));
    const buf_338 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.10.cross_attn.query.weight']));
    const buf_339 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.10.cross_attn.query.bias']));
    const buf_340 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.10.cross_attn.out.weight']));
    const buf_341 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.10.cross_attn.out.bias']));
    const buf_342 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.10.mlp_ln.weight']));
    const buf_343 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.10.mlp_ln.bias']));
    const buf_344 = createWeightBuf(device, 9437184, getTensorBuffer(safetensor, metadata['blocks.10.mlp.0.weight']));
    const buf_345 = createWeightBuf(device, 12288, getTensorBuffer(safetensor, metadata['blocks.10.mlp.0.bias']));
    const buf_346 = createEmptyBuf(device, 1376256);;
    const buf_347 = createWeightBuf(device, 9437184, getTensorBuffer(safetensor, metadata['blocks.10.mlp.2.weight']));
    const buf_348 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.10.mlp.2.bias']));
    const buf_349 = createEmptyBuf(device, 1376256);;
    const buf_350 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.11.attn_ln.weight']));
    const buf_351 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.11.attn_ln.bias']));
    const buf_352 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.11.attn.key.weight']));
    const buf_353 = createWeightBuf(device, 1376256, getTensorBuffer(safetensor, metadata['blocks.11.attn.cache_k']));
    const buf_354 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.11.attn.value.weight']));
    const buf_355 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.11.attn.value.bias']));
    const buf_356 = createWeightBuf(device, 1376256, getTensorBuffer(safetensor, metadata['blocks.11.attn.cache_v']));
    const buf_357 = createWeightBuf(device, 4608000, getTensorBuffer(safetensor, metadata['blocks.11.cross_attn.cache_k']));
    const buf_358 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.11.cross_attn.key.weight']));
    const buf_359 = createWeightBuf(device, 4608000, getTensorBuffer(safetensor, metadata['blocks.11.cross_attn.cache_v']));
    const buf_360 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.11.cross_attn.value.weight']));
    const buf_361 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.11.cross_attn.value.bias']));
    const buf_362 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.11.attn.query.weight']));
    const buf_363 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.11.attn.query.bias']));
    const buf_364 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.11.attn.out.weight']));
    const buf_365 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.11.attn.out.bias']));
    const buf_366 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.11.cross_attn_ln.weight']));
    const buf_367 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.11.cross_attn_ln.bias']));
    const buf_368 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.11.cross_attn.query.weight']));
    const buf_369 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.11.cross_attn.query.bias']));
    const buf_370 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.11.cross_attn.out.weight']));
    const buf_371 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.11.cross_attn.out.bias']));
    const buf_372 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.11.mlp_ln.weight']));
    const buf_373 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.11.mlp_ln.bias']));
    const buf_374 = createWeightBuf(device, 9437184, getTensorBuffer(safetensor, metadata['blocks.11.mlp.0.weight']));
    const buf_375 = createWeightBuf(device, 12288, getTensorBuffer(safetensor, metadata['blocks.11.mlp.0.bias']));
    const buf_376 = createEmptyBuf(device, 1376256);;
    const buf_377 = createWeightBuf(device, 9437184, getTensorBuffer(safetensor, metadata['blocks.11.mlp.2.weight']));
    const buf_378 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.11.mlp.2.bias']));
    const buf_379 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['ln.weight']));
    const buf_380 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['ln.bias']));
    const buf_381 = createEmptyBuf(device, 92940288);;
    const output0 = createEmptyBuf(device, 207456);;
    const ctx = createUniformBuf(device, 4);;

    const gpuWriteBuffer0 = device.createBuffer({size:input0.size, usage: GPUBufferUsage.COPY_SRC | GPUBufferUsage.MAP_WRITE });
    const gpuWriteBuffer1 = device.createBuffer({size:input1.size, usage: GPUBufferUsage.COPY_SRC | GPUBufferUsage.MAP_WRITE });
    const gpuWriteBuffer2 = device.createBuffer({size:ctx.size, usage: GPUBufferUsage.COPY_SRC | GPUBufferUsage.MAP_WRITE });

    const gpuReadBuffer0 = device.createBuffer({size:output0.size, usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ });

    const kernels = [r_56_16_3_2_16_4_3_4_4322_12966_4, r_3584_32_3_12, r_448_16_48, r_448_16_48n1, E_14_16_8_16_3_4, r_14_16_8_16_3_4_192_4, E_3584_32_3n1, r_14_16_8_16_4_3_192_4, E_3584_32_3n1, r_125_16_4_16_3_3_192_4n4, r_125_16_4_16_3_3_192_4, r_14_16_8_16_4_3_192_4, r_14_16_8_16_3_4_192_4n1, r_14_16_8_16_4_3_192_4, r_125_16_4_16_3_3_192_4n1, r_125_16_4_16_3_3_192_4, r_4_14_7_8_16_4_4_3_16_4, r_56_32_3_112_4, r_56_32_3_112_4n1, E_672_7_8_16_4, r_12_14_8_16_4_4_112_4, r_14_16_8_16_4_3_192_4n1, r_448_16_48, r_448_16_48n1, E_14_16_8_16_3_4, r_14_16_8_16_4_3_192_4, r_6_7_125_2_16_4_3_4_16_4, r_56_32_3_375_4, r_56_32_3_375_4n1, E_168_125_32_4_3, r_12_14_8_16_4_4_375_4, r_14_16_8_16_4_3_192_4n1, r_448_16_48, r_448_16_48n1, E_14_16_8_16_3_4, r_14_64_8_16_4_3_192_4, r_14_16_8_16_4_3_768_4, r_448_16_48, r_448_16_48n1, E_14_16_8_16_3_4, r_14_16_8_16_3_4_192_4, E_3584_32_3n1, r_14_16_8_16_4_3_192_4, E_3584_32_3n1, r_125_16_4_16_3_3_192_4n4, r_125_16_4_16_3_3_192_4, r_14_16_8_16_4_3_192_4, r_14_16_8_16_3_4_192_4n1, r_14_16_8_16_4_3_192_4, r_125_16_4_16_3_3_192_4n1, r_125_16_4_16_3_3_192_4, r_4_14_7_8_16_4_4_3_16_4, r_56_32_3_112_4, r_56_32_3_112_4n1, E_672_7_8_16_4, r_12_14_8_16_4_4_112_4, r_14_16_8_16_4_3_192_4n1, r_448_16_48, r_448_16_48n1, E_14_16_8_16_3_4, r_14_16_8_16_4_3_192_4, r_6_7_125_2_16_4_3_4_16_4, r_56_32_3_375_4, r_56_32_3_375_4n1, E_168_125_32_4_3, r_12_14_8_16_4_4_375_4, r_14_16_8_16_4_3_192_4n1, r_448_16_48, r_448_16_48n1, E_14_16_8_16_3_4, r_14_64_8_16_4_3_192_4, r_14_16_8_16_4_3_768_4, r_448_16_48, r_448_16_48n1, E_14_16_8_16_3_4, r_14_16_8_16_3_4_192_4, E_3584_32_3n1, r_14_16_8_16_4_3_192_4, E_3584_32_3n1, r_125_16_4_16_3_3_192_4n4, r_125_16_4_16_3_3_192_4, r_14_16_8_16_4_3_192_4, r_14_16_8_16_3_4_192_4n1, r_14_16_8_16_4_3_192_4, r_125_16_4_16_3_3_192_4n1, r_125_16_4_16_3_3_192_4, r_4_14_7_8_16_4_4_3_16_4, r_56_32_3_112_4, r_56_32_3_112_4n1, E_672_7_8_16_4, r_12_14_8_16_4_4_112_4, r_14_16_8_16_4_3_192_4n1, r_448_16_48, r_448_16_48n1, E_14_16_8_16_3_4, r_14_16_8_16_4_3_192_4, r_6_7_125_2_16_4_3_4_16_4, r_56_32_3_375_4, r_56_32_3_375_4n1, E_168_125_32_4_3, r_12_14_8_16_4_4_375_4, r_14_16_8_16_4_3_192_4n1, r_448_16_48, r_448_16_48n1, E_14_16_8_16_3_4, r_14_64_8_16_4_3_192_4, r_14_16_8_16_4_3_768_4, r_448_16_48, r_448_16_48n1, E_14_16_8_16_3_4, r_14_16_8_16_3_4_192_4, E_3584_32_3n1, r_14_16_8_16_4_3_192_4, E_3584_32_3n1, r_125_16_4_16_3_3_192_4n4, r_125_16_4_16_3_3_192_4, r_14_16_8_16_4_3_192_4, r_14_16_8_16_3_4_192_4n1, r_14_16_8_16_4_3_192_4, r_125_16_4_16_3_3_192_4n1, r_125_16_4_16_3_3_192_4, r_4_14_7_8_16_4_4_3_16_4, r_56_32_3_112_4, r_56_32_3_112_4n1, E_672_7_8_16_4, r_12_14_8_16_4_4_112_4, r_14_16_8_16_4_3_192_4n1, r_448_16_48, r_448_16_48n1, E_14_16_8_16_3_4, r_14_16_8_16_4_3_192_4, r_6_7_125_2_16_4_3_4_16_4, r_56_32_3_375_4, r_56_32_3_375_4n1, E_168_125_32_4_3, r_12_14_8_16_4_4_375_4, r_14_16_8_16_4_3_192_4n1, r_448_16_48, r_448_16_48n1, E_14_16_8_16_3_4, r_14_64_8_16_4_3_192_4, r_14_16_8_16_4_3_768_4, r_448_16_48, r_448_16_48n1, E_14_16_8_16_3_4, r_14_16_8_16_3_4_192_4, E_3584_32_3n1, r_14_16_8_16_4_3_192_4, E_3584_32_3n1, r_125_16_4_16_3_3_192_4n4, r_125_16_4_16_3_3_192_4, r_14_16_8_16_4_3_192_4, r_14_16_8_16_3_4_192_4n1, r_14_16_8_16_4_3_192_4, r_125_16_4_16_3_3_192_4n1, r_125_16_4_16_3_3_192_4, r_4_14_7_8_16_4_4_3_16_4, r_56_32_3_112_4, r_56_32_3_112_4n1, E_672_7_8_16_4, r_12_14_8_16_4_4_112_4, r_14_16_8_16_4_3_192_4n1, r_448_16_48, r_448_16_48n1, E_14_16_8_16_3_4, r_14_16_8_16_4_3_192_4, r_6_7_125_2_16_4_3_4_16_4, r_56_32_3_375_4, r_56_32_3_375_4n1, E_168_125_32_4_3, r_12_14_8_16_4_4_375_4, r_14_16_8_16_4_3_192_4n1, r_448_16_48, r_448_16_48n1, E_14_16_8_16_3_4, r_14_64_8_16_4_3_192_4, r_14_16_8_16_4_3_768_4, r_448_16_48, r_448_16_48n1, E_14_16_8_16_3_4, r_14_16_8_16_3_4_192_4, E_3584_32_3n1, r_14_16_8_16_4_3_192_4, E_3584_32_3n1, r_125_16_4_16_3_3_192_4n4, r_125_16_4_16_3_3_192_4, r_14_16_8_16_4_3_192_4, r_14_16_8_16_3_4_192_4n1, r_14_16_8_16_4_3_192_4, r_125_16_4_16_3_3_192_4n1, r_125_16_4_16_3_3_192_4, r_4_14_7_8_16_4_4_3_16_4, r_56_32_3_112_4, r_56_32_3_112_4n1, E_672_7_8_16_4, r_12_14_8_16_4_4_112_4, r_14_16_8_16_4_3_192_4n1, r_448_16_48, r_448_16_48n1, E_14_16_8_16_3_4, r_14_16_8_16_4_3_192_4, r_6_7_125_2_16_4_3_4_16_4, r_56_32_3_375_4, r_56_32_3_375_4n1, E_168_125_32_4_3, r_12_14_8_16_4_4_375_4, r_14_16_8_16_4_3_192_4n1, r_448_16_48, r_448_16_48n1, E_14_16_8_16_3_4, r_14_64_8_16_4_3_192_4, r_14_16_8_16_4_3_768_4, r_448_16_48, r_448_16_48n1, E_14_16_8_16_3_4, r_14_16_8_16_3_4_192_4, E_3584_32_3n1, r_14_16_8_16_4_3_192_4, E_3584_32_3n1, r_125_16_4_16_3_3_192_4n4, r_125_16_4_16_3_3_192_4, r_14_16_8_16_4_3_192_4, r_14_16_8_16_3_4_192_4n1, r_14_16_8_16_4_3_192_4, r_125_16_4_16_3_3_192_4n1, r_125_16_4_16_3_3_192_4, r_4_14_7_8_16_4_4_3_16_4, r_56_32_3_112_4, r_56_32_3_112_4n1, E_672_7_8_16_4, r_12_14_8_16_4_4_112_4, r_14_16_8_16_4_3_192_4n1, r_448_16_48, r_448_16_48n1, E_14_16_8_16_3_4, r_14_16_8_16_4_3_192_4, r_6_7_125_2_16_4_3_4_16_4, r_56_32_3_375_4, r_56_32_3_375_4n1, E_168_125_32_4_3, r_12_14_8_16_4_4_375_4, r_14_16_8_16_4_3_192_4n1, r_448_16_48, r_448_16_48n1, E_14_16_8_16_3_4, r_14_64_8_16_4_3_192_4, r_14_16_8_16_4_3_768_4, r_448_16_48, r_448_16_48n1, E_14_16_8_16_3_4, r_14_16_8_16_3_4_192_4, E_3584_32_3n1, r_14_16_8_16_4_3_192_4, E_3584_32_3n1, r_125_16_4_16_3_3_192_4n4, r_125_16_4_16_3_3_192_4, r_14_16_8_16_4_3_192_4, r_14_16_8_16_3_4_192_4n1, r_14_16_8_16_4_3_192_4, r_125_16_4_16_3_3_192_4n1, r_125_16_4_16_3_3_192_4, r_4_14_7_8_16_4_4_3_16_4, r_56_32_3_112_4, r_56_32_3_112_4n1, E_672_7_8_16_4, r_12_14_8_16_4_4_112_4, r_14_16_8_16_4_3_192_4n1, r_448_16_48, r_448_16_48n1, E_14_16_8_16_3_4, r_14_16_8_16_4_3_192_4, r_6_7_125_2_16_4_3_4_16_4, r_56_32_3_375_4, r_56_32_3_375_4n1, E_168_125_32_4_3, r_12_14_8_16_4_4_375_4, r_14_16_8_16_4_3_192_4n1, r_448_16_48, r_448_16_48n1, E_14_16_8_16_3_4, r_14_64_8_16_4_3_192_4, r_14_16_8_16_4_3_768_4, r_448_16_48, r_448_16_48n1, E_14_16_8_16_3_4, r_14_16_8_16_3_4_192_4, E_3584_32_3n1, r_14_16_8_16_4_3_192_4, E_3584_32_3n1, r_125_16_4_16_3_3_192_4n4, r_125_16_4_16_3_3_192_4, r_14_16_8_16_4_3_192_4, r_14_16_8_16_3_4_192_4n1, r_14_16_8_16_4_3_192_4, r_125_16_4_16_3_3_192_4n1, r_125_16_4_16_3_3_192_4, r_4_14_7_8_16_4_4_3_16_4, r_56_32_3_112_4, r_56_32_3_112_4n1, E_672_7_8_16_4, r_12_14_8_16_4_4_112_4, r_14_16_8_16_4_3_192_4n1, r_448_16_48, r_448_16_48n1, E_14_16_8_16_3_4, r_14_16_8_16_4_3_192_4, r_6_7_125_2_16_4_3_4_16_4, r_56_32_3_375_4, r_56_32_3_375_4n1, E_168_125_32_4_3, r_12_14_8_16_4_4_375_4, r_14_16_8_16_4_3_192_4n1, r_448_16_48, r_448_16_48n1, E_14_16_8_16_3_4, r_14_64_8_16_4_3_192_4, r_14_16_8_16_4_3_768_4, r_448_16_48, r_448_16_48n1, E_14_16_8_16_3_4, r_14_16_8_16_3_4_192_4, E_3584_32_3n1, r_14_16_8_16_4_3_192_4, E_3584_32_3n1, r_125_16_4_16_3_3_192_4n4, r_125_16_4_16_3_3_192_4, r_14_16_8_16_4_3_192_4, r_14_16_8_16_3_4_192_4n1, r_14_16_8_16_4_3_192_4, r_125_16_4_16_3_3_192_4n1, r_125_16_4_16_3_3_192_4, r_4_14_7_8_16_4_4_3_16_4, r_56_32_3_112_4, r_56_32_3_112_4n1, E_672_7_8_16_4, r_12_14_8_16_4_4_112_4, r_14_16_8_16_4_3_192_4n1, r_448_16_48, r_448_16_48n1, E_14_16_8_16_3_4, r_14_16_8_16_4_3_192_4, r_6_7_125_2_16_4_3_4_16_4, r_56_32_3_375_4, r_56_32_3_375_4n1, E_168_125_32_4_3, r_12_14_8_16_4_4_375_4, r_14_16_8_16_4_3_192_4n1, r_448_16_48, r_448_16_48n1, E_14_16_8_16_3_4, r_14_64_8_16_4_3_192_4, r_14_16_8_16_4_3_768_4, r_448_16_48, r_448_16_48n1, E_14_16_8_16_3_4, r_14_16_8_16_3_4_192_4, E_3584_32_3n1, r_14_16_8_16_4_3_192_4, E_3584_32_3n1, r_125_16_4_16_3_3_192_4n4, r_125_16_4_16_3_3_192_4, r_14_16_8_16_4_3_192_4, r_14_16_8_16_3_4_192_4n1, r_14_16_8_16_4_3_192_4, r_125_16_4_16_3_3_192_4n1, r_125_16_4_16_3_3_192_4, r_4_14_7_8_16_4_4_3_16_4, r_56_32_3_112_4, r_56_32_3_112_4n1, E_672_7_8_16_4, r_12_14_8_16_4_4_112_4, r_14_16_8_16_4_3_192_4n1, r_448_16_48, r_448_16_48n1, E_14_16_8_16_3_4, r_14_16_8_16_4_3_192_4, r_6_7_125_2_16_4_3_4_16_4, r_56_32_3_375_4, r_56_32_3_375_4n1, E_168_125_32_4_3, r_12_14_8_16_4_4_375_4, r_14_16_8_16_4_3_192_4n1, r_448_16_48, r_448_16_48n1, E_14_16_8_16_3_4, r_14_64_8_16_4_3_192_4, r_14_16_8_16_4_3_768_4, r_448_16_48, r_448_16_48n1, E_14_16_8_16_3_4, r_14_16_8_16_3_4_192_4, E_3584_32_3n1, r_14_16_8_16_4_3_192_4, E_3584_32_3n1, r_125_16_4_16_3_3_192_4n4, r_125_16_4_16_3_3_192_4, r_14_16_8_16_4_3_192_4, r_14_16_8_16_3_4_192_4n1, r_14_16_8_16_4_3_192_4, r_125_16_4_16_3_3_192_4n1, r_125_16_4_16_3_3_192_4, r_4_14_7_8_16_4_4_3_16_4, r_56_32_3_112_4, r_56_32_3_112_4n1, E_672_7_8_16_4, r_12_14_8_16_4_4_112_4, r_14_16_8_16_4_3_192_4n1, r_448_16_48, r_448_16_48n1, E_14_16_8_16_3_4, r_14_16_8_16_4_3_192_4, r_6_7_125_2_16_4_3_4_16_4, r_56_32_3_375_4, r_56_32_3_375_4n1, E_168_125_32_4_3, r_12_14_8_16_4_4_375_4, r_14_16_8_16_4_3_192_4n1, r_448_16_48, r_448_16_48n1, E_14_16_8_16_3_4, r_14_64_8_16_4_3_192_4, r_14_16_8_16_4_3_768_4, r_448_16_48, r_448_16_48n1, E_14_16_8_16_3_4, r_7_2161_16_8_3_4_192_4, E_2161_8_3];
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
        addComputePass(device, commandEncoder, pipelines[0], layouts[0], infinityBuf, [buf_0, input0, buf_1], [3, 16, 56]);
        addComputePass(device, commandEncoder, pipelines[1], layouts[1], infinityBuf, [buf_2, buf_0, buf_3], [3584, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[2], layouts[2], infinityBuf, [buf_4, buf_2], [448, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[3], layouts[3], infinityBuf, [buf_5, buf_2, buf_4], [448, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[4], layouts[4], infinityBuf, [buf_6, buf_2, buf_4, buf_5, buf_7, buf_8], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[5], layouts[5], infinityBuf, [buf_9, buf_6, buf_10], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[6], layouts[6], infinityBuf, [buf_11, buf_9], [3584, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[7], layouts[7], infinityBuf, [buf_9, buf_6, buf_12, buf_13], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[8], layouts[8], infinityBuf, [buf_14, buf_9], [3584, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[9], layouts[9], infinityBuf, [buf_15, input1, buf_16], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[10], layouts[10], infinityBuf, [buf_17, input1, buf_18, buf_19], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[11], layouts[11], infinityBuf, [buf_9, buf_6, buf_20, buf_21], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[12], layouts[12], infinityBuf, [buf_22, buf_6, buf_10], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[13], layouts[13], infinityBuf, [buf_23, buf_6, buf_12, buf_13], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[14], layouts[14], infinityBuf, [buf_24, input1, buf_16], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[15], layouts[15], infinityBuf, [buf_25, input1, buf_18, buf_19], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[16], layouts[16], infinityBuf, [buf_26, buf_9, buf_22, buf_27], [7, 14, 4]);
        addComputePass(device, commandEncoder, pipelines[17], layouts[17], infinityBuf, [buf_28, buf_26], [56, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[18], layouts[18], infinityBuf, [buf_29, buf_26, buf_28], [56, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[19], layouts[19], infinityBuf, [buf_30, buf_26, buf_28, buf_29], [7, 672, 1]);
        addComputePass(device, commandEncoder, pipelines[20], layouts[20], infinityBuf, [buf_22, buf_30, buf_23], [14, 12, 1]);
        addComputePass(device, commandEncoder, pipelines[21], layouts[21], infinityBuf, [buf_23, buf_2, buf_22, buf_31, buf_32], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[22], layouts[22], infinityBuf, [buf_5, buf_23], [448, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[23], layouts[23], infinityBuf, [buf_4, buf_23, buf_5], [448, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[24], layouts[24], infinityBuf, [buf_22, buf_23, buf_5, buf_4, buf_33, buf_34], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[25], layouts[25], infinityBuf, [buf_9, buf_22, buf_35, buf_36], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[26], layouts[26], infinityBuf, [buf_37, buf_9, buf_24], [125, 7, 6]);
        addComputePass(device, commandEncoder, pipelines[27], layouts[27], infinityBuf, [buf_29, buf_37], [56, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[28], layouts[28], infinityBuf, [buf_28, buf_37, buf_29], [56, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[29], layouts[29], infinityBuf, [buf_38, buf_37, buf_29, buf_28], [125, 168, 1]);
        addComputePass(device, commandEncoder, pipelines[30], layouts[30], infinityBuf, [buf_9, buf_38, buf_25], [14, 12, 1]);
        addComputePass(device, commandEncoder, pipelines[31], layouts[31], infinityBuf, [buf_22, buf_23, buf_9, buf_39, buf_40], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[32], layouts[32], infinityBuf, [buf_4, buf_22], [448, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[33], layouts[33], infinityBuf, [buf_5, buf_22, buf_4], [448, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[34], layouts[34], infinityBuf, [buf_9, buf_22, buf_4, buf_5, buf_41, buf_42], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[35], layouts[35], infinityBuf, [buf_43, buf_9, buf_44, buf_45], [64, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[36], layouts[36], infinityBuf, [buf_46, buf_22, buf_43, buf_47, buf_48], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[37], layouts[37], infinityBuf, [buf_5, buf_46], [448, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[38], layouts[38], infinityBuf, [buf_4, buf_46, buf_5], [448, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[39], layouts[39], infinityBuf, [buf_49, buf_46, buf_5, buf_4, buf_50, buf_51], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[40], layouts[40], infinityBuf, [buf_22, buf_49, buf_52], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[41], layouts[41], infinityBuf, [buf_53, buf_22], [3584, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[42], layouts[42], infinityBuf, [buf_22, buf_49, buf_54, buf_55], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[43], layouts[43], infinityBuf, [buf_56, buf_22], [3584, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[44], layouts[44], infinityBuf, [buf_57, input1, buf_58], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[45], layouts[45], infinityBuf, [buf_59, input1, buf_60, buf_61], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[46], layouts[46], infinityBuf, [buf_22, buf_49, buf_62, buf_63], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[47], layouts[47], infinityBuf, [buf_9, buf_49, buf_52], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[48], layouts[48], infinityBuf, [buf_23, buf_49, buf_54, buf_55], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[49], layouts[49], infinityBuf, [buf_25, input1, buf_58], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[50], layouts[50], infinityBuf, [buf_24, input1, buf_60, buf_61], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[51], layouts[51], infinityBuf, [buf_30, buf_22, buf_9, buf_27], [7, 14, 4]);
        addComputePass(device, commandEncoder, pipelines[52], layouts[52], infinityBuf, [buf_28, buf_30], [56, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[53], layouts[53], infinityBuf, [buf_29, buf_30, buf_28], [56, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[54], layouts[54], infinityBuf, [buf_26, buf_30, buf_28, buf_29], [7, 672, 1]);
        addComputePass(device, commandEncoder, pipelines[55], layouts[55], infinityBuf, [buf_9, buf_26, buf_23], [14, 12, 1]);
        addComputePass(device, commandEncoder, pipelines[56], layouts[56], infinityBuf, [buf_23, buf_46, buf_9, buf_64, buf_65], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[57], layouts[57], infinityBuf, [buf_4, buf_23], [448, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[58], layouts[58], infinityBuf, [buf_5, buf_23, buf_4], [448, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[59], layouts[59], infinityBuf, [buf_9, buf_23, buf_4, buf_5, buf_66, buf_67], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[60], layouts[60], infinityBuf, [buf_22, buf_9, buf_68, buf_69], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[61], layouts[61], infinityBuf, [buf_38, buf_22, buf_25], [125, 7, 6]);
        addComputePass(device, commandEncoder, pipelines[62], layouts[62], infinityBuf, [buf_29, buf_38], [56, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[63], layouts[63], infinityBuf, [buf_28, buf_38, buf_29], [56, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[64], layouts[64], infinityBuf, [buf_37, buf_38, buf_29, buf_28], [125, 168, 1]);
        addComputePass(device, commandEncoder, pipelines[65], layouts[65], infinityBuf, [buf_22, buf_37, buf_24], [14, 12, 1]);
        addComputePass(device, commandEncoder, pipelines[66], layouts[66], infinityBuf, [buf_9, buf_23, buf_22, buf_70, buf_71], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[67], layouts[67], infinityBuf, [buf_5, buf_9], [448, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[68], layouts[68], infinityBuf, [buf_4, buf_9, buf_5], [448, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[69], layouts[69], infinityBuf, [buf_22, buf_9, buf_5, buf_4, buf_72, buf_73], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[70], layouts[70], infinityBuf, [buf_43, buf_22, buf_74, buf_75], [64, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[71], layouts[71], infinityBuf, [buf_76, buf_9, buf_43, buf_77, buf_78], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[72], layouts[72], infinityBuf, [buf_4, buf_76], [448, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[73], layouts[73], infinityBuf, [buf_5, buf_76, buf_4], [448, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[74], layouts[74], infinityBuf, [buf_79, buf_76, buf_4, buf_5, buf_80, buf_81], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[75], layouts[75], infinityBuf, [buf_9, buf_79, buf_82], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[76], layouts[76], infinityBuf, [buf_83, buf_9], [3584, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[77], layouts[77], infinityBuf, [buf_9, buf_79, buf_84, buf_85], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[78], layouts[78], infinityBuf, [buf_86, buf_9], [3584, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[79], layouts[79], infinityBuf, [buf_87, input1, buf_88], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[80], layouts[80], infinityBuf, [buf_89, input1, buf_90, buf_91], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[81], layouts[81], infinityBuf, [buf_9, buf_79, buf_92, buf_93], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[82], layouts[82], infinityBuf, [buf_22, buf_79, buf_82], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[83], layouts[83], infinityBuf, [buf_23, buf_79, buf_84, buf_85], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[84], layouts[84], infinityBuf, [buf_24, input1, buf_88], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[85], layouts[85], infinityBuf, [buf_25, input1, buf_90, buf_91], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[86], layouts[86], infinityBuf, [buf_26, buf_9, buf_22, buf_27], [7, 14, 4]);
        addComputePass(device, commandEncoder, pipelines[87], layouts[87], infinityBuf, [buf_28, buf_26], [56, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[88], layouts[88], infinityBuf, [buf_29, buf_26, buf_28], [56, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[89], layouts[89], infinityBuf, [buf_30, buf_26, buf_28, buf_29], [7, 672, 1]);
        addComputePass(device, commandEncoder, pipelines[90], layouts[90], infinityBuf, [buf_22, buf_30, buf_23], [14, 12, 1]);
        addComputePass(device, commandEncoder, pipelines[91], layouts[91], infinityBuf, [buf_23, buf_76, buf_22, buf_94, buf_95], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[92], layouts[92], infinityBuf, [buf_5, buf_23], [448, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[93], layouts[93], infinityBuf, [buf_4, buf_23, buf_5], [448, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[94], layouts[94], infinityBuf, [buf_22, buf_23, buf_5, buf_4, buf_96, buf_97], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[95], layouts[95], infinityBuf, [buf_9, buf_22, buf_98, buf_99], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[96], layouts[96], infinityBuf, [buf_37, buf_9, buf_24], [125, 7, 6]);
        addComputePass(device, commandEncoder, pipelines[97], layouts[97], infinityBuf, [buf_29, buf_37], [56, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[98], layouts[98], infinityBuf, [buf_28, buf_37, buf_29], [56, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[99], layouts[99], infinityBuf, [buf_38, buf_37, buf_29, buf_28], [125, 168, 1]);
        addComputePass(device, commandEncoder, pipelines[100], layouts[100], infinityBuf, [buf_9, buf_38, buf_25], [14, 12, 1]);
        addComputePass(device, commandEncoder, pipelines[101], layouts[101], infinityBuf, [buf_22, buf_23, buf_9, buf_100, buf_101], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[102], layouts[102], infinityBuf, [buf_4, buf_22], [448, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[103], layouts[103], infinityBuf, [buf_5, buf_22, buf_4], [448, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[104], layouts[104], infinityBuf, [buf_9, buf_22, buf_4, buf_5, buf_102, buf_103], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[105], layouts[105], infinityBuf, [buf_43, buf_9, buf_104, buf_105], [64, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[106], layouts[106], infinityBuf, [buf_106, buf_22, buf_43, buf_107, buf_108], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[107], layouts[107], infinityBuf, [buf_5, buf_106], [448, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[108], layouts[108], infinityBuf, [buf_4, buf_106, buf_5], [448, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[109], layouts[109], infinityBuf, [buf_109, buf_106, buf_5, buf_4, buf_110, buf_111], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[110], layouts[110], infinityBuf, [buf_22, buf_109, buf_112], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[111], layouts[111], infinityBuf, [buf_113, buf_22], [3584, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[112], layouts[112], infinityBuf, [buf_22, buf_109, buf_114, buf_115], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[113], layouts[113], infinityBuf, [buf_116, buf_22], [3584, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[114], layouts[114], infinityBuf, [buf_117, input1, buf_118], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[115], layouts[115], infinityBuf, [buf_119, input1, buf_120, buf_121], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[116], layouts[116], infinityBuf, [buf_22, buf_109, buf_122, buf_123], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[117], layouts[117], infinityBuf, [buf_9, buf_109, buf_112], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[118], layouts[118], infinityBuf, [buf_23, buf_109, buf_114, buf_115], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[119], layouts[119], infinityBuf, [buf_25, input1, buf_118], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[120], layouts[120], infinityBuf, [buf_24, input1, buf_120, buf_121], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[121], layouts[121], infinityBuf, [buf_30, buf_22, buf_9, buf_27], [7, 14, 4]);
        addComputePass(device, commandEncoder, pipelines[122], layouts[122], infinityBuf, [buf_28, buf_30], [56, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[123], layouts[123], infinityBuf, [buf_29, buf_30, buf_28], [56, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[124], layouts[124], infinityBuf, [buf_26, buf_30, buf_28, buf_29], [7, 672, 1]);
        addComputePass(device, commandEncoder, pipelines[125], layouts[125], infinityBuf, [buf_9, buf_26, buf_23], [14, 12, 1]);
        addComputePass(device, commandEncoder, pipelines[126], layouts[126], infinityBuf, [buf_23, buf_106, buf_9, buf_124, buf_125], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[127], layouts[127], infinityBuf, [buf_4, buf_23], [448, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[128], layouts[128], infinityBuf, [buf_5, buf_23, buf_4], [448, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[129], layouts[129], infinityBuf, [buf_9, buf_23, buf_4, buf_5, buf_126, buf_127], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[130], layouts[130], infinityBuf, [buf_22, buf_9, buf_128, buf_129], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[131], layouts[131], infinityBuf, [buf_38, buf_22, buf_25], [125, 7, 6]);
        addComputePass(device, commandEncoder, pipelines[132], layouts[132], infinityBuf, [buf_29, buf_38], [56, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[133], layouts[133], infinityBuf, [buf_28, buf_38, buf_29], [56, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[134], layouts[134], infinityBuf, [buf_37, buf_38, buf_29, buf_28], [125, 168, 1]);
        addComputePass(device, commandEncoder, pipelines[135], layouts[135], infinityBuf, [buf_22, buf_37, buf_24], [14, 12, 1]);
        addComputePass(device, commandEncoder, pipelines[136], layouts[136], infinityBuf, [buf_9, buf_23, buf_22, buf_130, buf_131], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[137], layouts[137], infinityBuf, [buf_5, buf_9], [448, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[138], layouts[138], infinityBuf, [buf_4, buf_9, buf_5], [448, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[139], layouts[139], infinityBuf, [buf_22, buf_9, buf_5, buf_4, buf_132, buf_133], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[140], layouts[140], infinityBuf, [buf_43, buf_22, buf_134, buf_135], [64, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[141], layouts[141], infinityBuf, [buf_136, buf_9, buf_43, buf_137, buf_138], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[142], layouts[142], infinityBuf, [buf_4, buf_136], [448, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[143], layouts[143], infinityBuf, [buf_5, buf_136, buf_4], [448, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[144], layouts[144], infinityBuf, [buf_139, buf_136, buf_4, buf_5, buf_140, buf_141], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[145], layouts[145], infinityBuf, [buf_9, buf_139, buf_142], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[146], layouts[146], infinityBuf, [buf_143, buf_9], [3584, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[147], layouts[147], infinityBuf, [buf_9, buf_139, buf_144, buf_145], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[148], layouts[148], infinityBuf, [buf_146, buf_9], [3584, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[149], layouts[149], infinityBuf, [buf_147, input1, buf_148], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[150], layouts[150], infinityBuf, [buf_149, input1, buf_150, buf_151], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[151], layouts[151], infinityBuf, [buf_9, buf_139, buf_152, buf_153], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[152], layouts[152], infinityBuf, [buf_22, buf_139, buf_142], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[153], layouts[153], infinityBuf, [buf_23, buf_139, buf_144, buf_145], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[154], layouts[154], infinityBuf, [buf_24, input1, buf_148], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[155], layouts[155], infinityBuf, [buf_25, input1, buf_150, buf_151], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[156], layouts[156], infinityBuf, [buf_26, buf_9, buf_22, buf_27], [7, 14, 4]);
        addComputePass(device, commandEncoder, pipelines[157], layouts[157], infinityBuf, [buf_28, buf_26], [56, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[158], layouts[158], infinityBuf, [buf_29, buf_26, buf_28], [56, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[159], layouts[159], infinityBuf, [buf_30, buf_26, buf_28, buf_29], [7, 672, 1]);
        addComputePass(device, commandEncoder, pipelines[160], layouts[160], infinityBuf, [buf_22, buf_30, buf_23], [14, 12, 1]);
        addComputePass(device, commandEncoder, pipelines[161], layouts[161], infinityBuf, [buf_23, buf_136, buf_22, buf_154, buf_155], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[162], layouts[162], infinityBuf, [buf_5, buf_23], [448, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[163], layouts[163], infinityBuf, [buf_4, buf_23, buf_5], [448, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[164], layouts[164], infinityBuf, [buf_22, buf_23, buf_5, buf_4, buf_156, buf_157], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[165], layouts[165], infinityBuf, [buf_9, buf_22, buf_158, buf_159], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[166], layouts[166], infinityBuf, [buf_37, buf_9, buf_24], [125, 7, 6]);
        addComputePass(device, commandEncoder, pipelines[167], layouts[167], infinityBuf, [buf_29, buf_37], [56, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[168], layouts[168], infinityBuf, [buf_28, buf_37, buf_29], [56, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[169], layouts[169], infinityBuf, [buf_38, buf_37, buf_29, buf_28], [125, 168, 1]);
        addComputePass(device, commandEncoder, pipelines[170], layouts[170], infinityBuf, [buf_9, buf_38, buf_25], [14, 12, 1]);
        addComputePass(device, commandEncoder, pipelines[171], layouts[171], infinityBuf, [buf_22, buf_23, buf_9, buf_160, buf_161], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[172], layouts[172], infinityBuf, [buf_4, buf_22], [448, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[173], layouts[173], infinityBuf, [buf_5, buf_22, buf_4], [448, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[174], layouts[174], infinityBuf, [buf_9, buf_22, buf_4, buf_5, buf_162, buf_163], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[175], layouts[175], infinityBuf, [buf_43, buf_9, buf_164, buf_165], [64, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[176], layouts[176], infinityBuf, [buf_166, buf_22, buf_43, buf_167, buf_168], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[177], layouts[177], infinityBuf, [buf_5, buf_166], [448, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[178], layouts[178], infinityBuf, [buf_4, buf_166, buf_5], [448, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[179], layouts[179], infinityBuf, [buf_169, buf_166, buf_5, buf_4, buf_170, buf_171], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[180], layouts[180], infinityBuf, [buf_22, buf_169, buf_172], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[181], layouts[181], infinityBuf, [buf_173, buf_22], [3584, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[182], layouts[182], infinityBuf, [buf_22, buf_169, buf_174, buf_175], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[183], layouts[183], infinityBuf, [buf_176, buf_22], [3584, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[184], layouts[184], infinityBuf, [buf_177, input1, buf_178], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[185], layouts[185], infinityBuf, [buf_179, input1, buf_180, buf_181], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[186], layouts[186], infinityBuf, [buf_22, buf_169, buf_182, buf_183], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[187], layouts[187], infinityBuf, [buf_9, buf_169, buf_172], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[188], layouts[188], infinityBuf, [buf_23, buf_169, buf_174, buf_175], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[189], layouts[189], infinityBuf, [buf_25, input1, buf_178], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[190], layouts[190], infinityBuf, [buf_24, input1, buf_180, buf_181], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[191], layouts[191], infinityBuf, [buf_30, buf_22, buf_9, buf_27], [7, 14, 4]);
        addComputePass(device, commandEncoder, pipelines[192], layouts[192], infinityBuf, [buf_28, buf_30], [56, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[193], layouts[193], infinityBuf, [buf_29, buf_30, buf_28], [56, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[194], layouts[194], infinityBuf, [buf_26, buf_30, buf_28, buf_29], [7, 672, 1]);
        addComputePass(device, commandEncoder, pipelines[195], layouts[195], infinityBuf, [buf_9, buf_26, buf_23], [14, 12, 1]);
        addComputePass(device, commandEncoder, pipelines[196], layouts[196], infinityBuf, [buf_23, buf_166, buf_9, buf_184, buf_185], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[197], layouts[197], infinityBuf, [buf_4, buf_23], [448, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[198], layouts[198], infinityBuf, [buf_5, buf_23, buf_4], [448, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[199], layouts[199], infinityBuf, [buf_9, buf_23, buf_4, buf_5, buf_186, buf_187], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[200], layouts[200], infinityBuf, [buf_22, buf_9, buf_188, buf_189], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[201], layouts[201], infinityBuf, [buf_38, buf_22, buf_25], [125, 7, 6]);
        addComputePass(device, commandEncoder, pipelines[202], layouts[202], infinityBuf, [buf_29, buf_38], [56, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[203], layouts[203], infinityBuf, [buf_28, buf_38, buf_29], [56, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[204], layouts[204], infinityBuf, [buf_37, buf_38, buf_29, buf_28], [125, 168, 1]);
        addComputePass(device, commandEncoder, pipelines[205], layouts[205], infinityBuf, [buf_22, buf_37, buf_24], [14, 12, 1]);
        addComputePass(device, commandEncoder, pipelines[206], layouts[206], infinityBuf, [buf_9, buf_23, buf_22, buf_190, buf_191], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[207], layouts[207], infinityBuf, [buf_5, buf_9], [448, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[208], layouts[208], infinityBuf, [buf_4, buf_9, buf_5], [448, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[209], layouts[209], infinityBuf, [buf_22, buf_9, buf_5, buf_4, buf_192, buf_193], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[210], layouts[210], infinityBuf, [buf_43, buf_22, buf_194, buf_195], [64, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[211], layouts[211], infinityBuf, [buf_196, buf_9, buf_43, buf_197, buf_198], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[212], layouts[212], infinityBuf, [buf_4, buf_196], [448, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[213], layouts[213], infinityBuf, [buf_5, buf_196, buf_4], [448, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[214], layouts[214], infinityBuf, [buf_199, buf_196, buf_4, buf_5, buf_200, buf_201], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[215], layouts[215], infinityBuf, [buf_9, buf_199, buf_202], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[216], layouts[216], infinityBuf, [buf_203, buf_9], [3584, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[217], layouts[217], infinityBuf, [buf_9, buf_199, buf_204, buf_205], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[218], layouts[218], infinityBuf, [buf_206, buf_9], [3584, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[219], layouts[219], infinityBuf, [buf_207, input1, buf_208], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[220], layouts[220], infinityBuf, [buf_209, input1, buf_210, buf_211], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[221], layouts[221], infinityBuf, [buf_9, buf_199, buf_212, buf_213], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[222], layouts[222], infinityBuf, [buf_22, buf_199, buf_202], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[223], layouts[223], infinityBuf, [buf_23, buf_199, buf_204, buf_205], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[224], layouts[224], infinityBuf, [buf_24, input1, buf_208], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[225], layouts[225], infinityBuf, [buf_25, input1, buf_210, buf_211], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[226], layouts[226], infinityBuf, [buf_26, buf_9, buf_22, buf_27], [7, 14, 4]);
        addComputePass(device, commandEncoder, pipelines[227], layouts[227], infinityBuf, [buf_28, buf_26], [56, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[228], layouts[228], infinityBuf, [buf_29, buf_26, buf_28], [56, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[229], layouts[229], infinityBuf, [buf_30, buf_26, buf_28, buf_29], [7, 672, 1]);
        addComputePass(device, commandEncoder, pipelines[230], layouts[230], infinityBuf, [buf_22, buf_30, buf_23], [14, 12, 1]);
        addComputePass(device, commandEncoder, pipelines[231], layouts[231], infinityBuf, [buf_23, buf_196, buf_22, buf_214, buf_215], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[232], layouts[232], infinityBuf, [buf_5, buf_23], [448, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[233], layouts[233], infinityBuf, [buf_4, buf_23, buf_5], [448, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[234], layouts[234], infinityBuf, [buf_22, buf_23, buf_5, buf_4, buf_216, buf_217], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[235], layouts[235], infinityBuf, [buf_9, buf_22, buf_218, buf_219], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[236], layouts[236], infinityBuf, [buf_37, buf_9, buf_24], [125, 7, 6]);
        addComputePass(device, commandEncoder, pipelines[237], layouts[237], infinityBuf, [buf_29, buf_37], [56, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[238], layouts[238], infinityBuf, [buf_28, buf_37, buf_29], [56, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[239], layouts[239], infinityBuf, [buf_38, buf_37, buf_29, buf_28], [125, 168, 1]);
        addComputePass(device, commandEncoder, pipelines[240], layouts[240], infinityBuf, [buf_9, buf_38, buf_25], [14, 12, 1]);
        addComputePass(device, commandEncoder, pipelines[241], layouts[241], infinityBuf, [buf_22, buf_23, buf_9, buf_220, buf_221], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[242], layouts[242], infinityBuf, [buf_4, buf_22], [448, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[243], layouts[243], infinityBuf, [buf_5, buf_22, buf_4], [448, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[244], layouts[244], infinityBuf, [buf_9, buf_22, buf_4, buf_5, buf_222, buf_223], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[245], layouts[245], infinityBuf, [buf_43, buf_9, buf_224, buf_225], [64, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[246], layouts[246], infinityBuf, [buf_226, buf_22, buf_43, buf_227, buf_228], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[247], layouts[247], infinityBuf, [buf_5, buf_226], [448, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[248], layouts[248], infinityBuf, [buf_4, buf_226, buf_5], [448, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[249], layouts[249], infinityBuf, [buf_229, buf_226, buf_5, buf_4, buf_230, buf_231], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[250], layouts[250], infinityBuf, [buf_22, buf_229, buf_232], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[251], layouts[251], infinityBuf, [buf_233, buf_22], [3584, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[252], layouts[252], infinityBuf, [buf_22, buf_229, buf_234, buf_235], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[253], layouts[253], infinityBuf, [buf_236, buf_22], [3584, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[254], layouts[254], infinityBuf, [buf_237, input1, buf_238], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[255], layouts[255], infinityBuf, [buf_239, input1, buf_240, buf_241], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[256], layouts[256], infinityBuf, [buf_22, buf_229, buf_242, buf_243], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[257], layouts[257], infinityBuf, [buf_9, buf_229, buf_232], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[258], layouts[258], infinityBuf, [buf_23, buf_229, buf_234, buf_235], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[259], layouts[259], infinityBuf, [buf_25, input1, buf_238], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[260], layouts[260], infinityBuf, [buf_24, input1, buf_240, buf_241], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[261], layouts[261], infinityBuf, [buf_30, buf_22, buf_9, buf_27], [7, 14, 4]);
        addComputePass(device, commandEncoder, pipelines[262], layouts[262], infinityBuf, [buf_28, buf_30], [56, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[263], layouts[263], infinityBuf, [buf_29, buf_30, buf_28], [56, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[264], layouts[264], infinityBuf, [buf_26, buf_30, buf_28, buf_29], [7, 672, 1]);
        addComputePass(device, commandEncoder, pipelines[265], layouts[265], infinityBuf, [buf_9, buf_26, buf_23], [14, 12, 1]);
        addComputePass(device, commandEncoder, pipelines[266], layouts[266], infinityBuf, [buf_23, buf_226, buf_9, buf_244, buf_245], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[267], layouts[267], infinityBuf, [buf_4, buf_23], [448, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[268], layouts[268], infinityBuf, [buf_5, buf_23, buf_4], [448, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[269], layouts[269], infinityBuf, [buf_9, buf_23, buf_4, buf_5, buf_246, buf_247], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[270], layouts[270], infinityBuf, [buf_22, buf_9, buf_248, buf_249], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[271], layouts[271], infinityBuf, [buf_38, buf_22, buf_25], [125, 7, 6]);
        addComputePass(device, commandEncoder, pipelines[272], layouts[272], infinityBuf, [buf_29, buf_38], [56, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[273], layouts[273], infinityBuf, [buf_28, buf_38, buf_29], [56, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[274], layouts[274], infinityBuf, [buf_37, buf_38, buf_29, buf_28], [125, 168, 1]);
        addComputePass(device, commandEncoder, pipelines[275], layouts[275], infinityBuf, [buf_22, buf_37, buf_24], [14, 12, 1]);
        addComputePass(device, commandEncoder, pipelines[276], layouts[276], infinityBuf, [buf_9, buf_23, buf_22, buf_250, buf_251], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[277], layouts[277], infinityBuf, [buf_5, buf_9], [448, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[278], layouts[278], infinityBuf, [buf_4, buf_9, buf_5], [448, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[279], layouts[279], infinityBuf, [buf_22, buf_9, buf_5, buf_4, buf_252, buf_253], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[280], layouts[280], infinityBuf, [buf_43, buf_22, buf_254, buf_255], [64, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[281], layouts[281], infinityBuf, [buf_256, buf_9, buf_43, buf_257, buf_258], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[282], layouts[282], infinityBuf, [buf_4, buf_256], [448, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[283], layouts[283], infinityBuf, [buf_5, buf_256, buf_4], [448, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[284], layouts[284], infinityBuf, [buf_259, buf_256, buf_4, buf_5, buf_260, buf_261], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[285], layouts[285], infinityBuf, [buf_9, buf_259, buf_262], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[286], layouts[286], infinityBuf, [buf_263, buf_9], [3584, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[287], layouts[287], infinityBuf, [buf_9, buf_259, buf_264, buf_265], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[288], layouts[288], infinityBuf, [buf_266, buf_9], [3584, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[289], layouts[289], infinityBuf, [buf_267, input1, buf_268], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[290], layouts[290], infinityBuf, [buf_269, input1, buf_270, buf_271], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[291], layouts[291], infinityBuf, [buf_9, buf_259, buf_272, buf_273], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[292], layouts[292], infinityBuf, [buf_22, buf_259, buf_262], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[293], layouts[293], infinityBuf, [buf_23, buf_259, buf_264, buf_265], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[294], layouts[294], infinityBuf, [buf_24, input1, buf_268], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[295], layouts[295], infinityBuf, [buf_25, input1, buf_270, buf_271], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[296], layouts[296], infinityBuf, [buf_26, buf_9, buf_22, buf_27], [7, 14, 4]);
        addComputePass(device, commandEncoder, pipelines[297], layouts[297], infinityBuf, [buf_28, buf_26], [56, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[298], layouts[298], infinityBuf, [buf_29, buf_26, buf_28], [56, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[299], layouts[299], infinityBuf, [buf_30, buf_26, buf_28, buf_29], [7, 672, 1]);
        addComputePass(device, commandEncoder, pipelines[300], layouts[300], infinityBuf, [buf_22, buf_30, buf_23], [14, 12, 1]);
        addComputePass(device, commandEncoder, pipelines[301], layouts[301], infinityBuf, [buf_23, buf_256, buf_22, buf_274, buf_275], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[302], layouts[302], infinityBuf, [buf_5, buf_23], [448, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[303], layouts[303], infinityBuf, [buf_4, buf_23, buf_5], [448, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[304], layouts[304], infinityBuf, [buf_22, buf_23, buf_5, buf_4, buf_276, buf_277], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[305], layouts[305], infinityBuf, [buf_9, buf_22, buf_278, buf_279], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[306], layouts[306], infinityBuf, [buf_37, buf_9, buf_24], [125, 7, 6]);
        addComputePass(device, commandEncoder, pipelines[307], layouts[307], infinityBuf, [buf_29, buf_37], [56, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[308], layouts[308], infinityBuf, [buf_28, buf_37, buf_29], [56, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[309], layouts[309], infinityBuf, [buf_38, buf_37, buf_29, buf_28], [125, 168, 1]);
        addComputePass(device, commandEncoder, pipelines[310], layouts[310], infinityBuf, [buf_9, buf_38, buf_25], [14, 12, 1]);
        addComputePass(device, commandEncoder, pipelines[311], layouts[311], infinityBuf, [buf_22, buf_23, buf_9, buf_280, buf_281], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[312], layouts[312], infinityBuf, [buf_4, buf_22], [448, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[313], layouts[313], infinityBuf, [buf_5, buf_22, buf_4], [448, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[314], layouts[314], infinityBuf, [buf_9, buf_22, buf_4, buf_5, buf_282, buf_283], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[315], layouts[315], infinityBuf, [buf_43, buf_9, buf_284, buf_285], [64, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[316], layouts[316], infinityBuf, [buf_286, buf_22, buf_43, buf_287, buf_288], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[317], layouts[317], infinityBuf, [buf_5, buf_286], [448, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[318], layouts[318], infinityBuf, [buf_4, buf_286, buf_5], [448, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[319], layouts[319], infinityBuf, [buf_289, buf_286, buf_5, buf_4, buf_290, buf_291], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[320], layouts[320], infinityBuf, [buf_22, buf_289, buf_292], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[321], layouts[321], infinityBuf, [buf_293, buf_22], [3584, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[322], layouts[322], infinityBuf, [buf_22, buf_289, buf_294, buf_295], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[323], layouts[323], infinityBuf, [buf_296, buf_22], [3584, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[324], layouts[324], infinityBuf, [buf_297, input1, buf_298], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[325], layouts[325], infinityBuf, [buf_299, input1, buf_300, buf_301], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[326], layouts[326], infinityBuf, [buf_22, buf_289, buf_302, buf_303], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[327], layouts[327], infinityBuf, [buf_9, buf_289, buf_292], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[328], layouts[328], infinityBuf, [buf_23, buf_289, buf_294, buf_295], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[329], layouts[329], infinityBuf, [buf_25, input1, buf_298], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[330], layouts[330], infinityBuf, [buf_24, input1, buf_300, buf_301], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[331], layouts[331], infinityBuf, [buf_30, buf_22, buf_9, buf_27], [7, 14, 4]);
        addComputePass(device, commandEncoder, pipelines[332], layouts[332], infinityBuf, [buf_28, buf_30], [56, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[333], layouts[333], infinityBuf, [buf_29, buf_30, buf_28], [56, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[334], layouts[334], infinityBuf, [buf_26, buf_30, buf_28, buf_29], [7, 672, 1]);
        addComputePass(device, commandEncoder, pipelines[335], layouts[335], infinityBuf, [buf_9, buf_26, buf_23], [14, 12, 1]);
        addComputePass(device, commandEncoder, pipelines[336], layouts[336], infinityBuf, [buf_23, buf_286, buf_9, buf_304, buf_305], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[337], layouts[337], infinityBuf, [buf_4, buf_23], [448, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[338], layouts[338], infinityBuf, [buf_5, buf_23, buf_4], [448, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[339], layouts[339], infinityBuf, [buf_9, buf_23, buf_4, buf_5, buf_306, buf_307], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[340], layouts[340], infinityBuf, [buf_22, buf_9, buf_308, buf_309], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[341], layouts[341], infinityBuf, [buf_38, buf_22, buf_25], [125, 7, 6]);
        addComputePass(device, commandEncoder, pipelines[342], layouts[342], infinityBuf, [buf_29, buf_38], [56, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[343], layouts[343], infinityBuf, [buf_28, buf_38, buf_29], [56, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[344], layouts[344], infinityBuf, [buf_37, buf_38, buf_29, buf_28], [125, 168, 1]);
        addComputePass(device, commandEncoder, pipelines[345], layouts[345], infinityBuf, [buf_22, buf_37, buf_24], [14, 12, 1]);
        addComputePass(device, commandEncoder, pipelines[346], layouts[346], infinityBuf, [buf_9, buf_23, buf_22, buf_310, buf_311], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[347], layouts[347], infinityBuf, [buf_5, buf_9], [448, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[348], layouts[348], infinityBuf, [buf_4, buf_9, buf_5], [448, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[349], layouts[349], infinityBuf, [buf_22, buf_9, buf_5, buf_4, buf_312, buf_313], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[350], layouts[350], infinityBuf, [buf_43, buf_22, buf_314, buf_315], [64, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[351], layouts[351], infinityBuf, [buf_316, buf_9, buf_43, buf_317, buf_318], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[352], layouts[352], infinityBuf, [buf_4, buf_316], [448, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[353], layouts[353], infinityBuf, [buf_5, buf_316, buf_4], [448, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[354], layouts[354], infinityBuf, [buf_319, buf_316, buf_4, buf_5, buf_320, buf_321], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[355], layouts[355], infinityBuf, [buf_9, buf_319, buf_322], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[356], layouts[356], infinityBuf, [buf_323, buf_9], [3584, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[357], layouts[357], infinityBuf, [buf_9, buf_319, buf_324, buf_325], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[358], layouts[358], infinityBuf, [buf_326, buf_9], [3584, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[359], layouts[359], infinityBuf, [buf_327, input1, buf_328], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[360], layouts[360], infinityBuf, [buf_329, input1, buf_330, buf_331], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[361], layouts[361], infinityBuf, [buf_9, buf_319, buf_332, buf_333], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[362], layouts[362], infinityBuf, [buf_22, buf_319, buf_322], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[363], layouts[363], infinityBuf, [buf_23, buf_319, buf_324, buf_325], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[364], layouts[364], infinityBuf, [buf_24, input1, buf_328], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[365], layouts[365], infinityBuf, [buf_25, input1, buf_330, buf_331], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[366], layouts[366], infinityBuf, [buf_26, buf_9, buf_22, buf_27], [7, 14, 4]);
        addComputePass(device, commandEncoder, pipelines[367], layouts[367], infinityBuf, [buf_28, buf_26], [56, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[368], layouts[368], infinityBuf, [buf_29, buf_26, buf_28], [56, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[369], layouts[369], infinityBuf, [buf_30, buf_26, buf_28, buf_29], [7, 672, 1]);
        addComputePass(device, commandEncoder, pipelines[370], layouts[370], infinityBuf, [buf_22, buf_30, buf_23], [14, 12, 1]);
        addComputePass(device, commandEncoder, pipelines[371], layouts[371], infinityBuf, [buf_23, buf_316, buf_22, buf_334, buf_335], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[372], layouts[372], infinityBuf, [buf_5, buf_23], [448, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[373], layouts[373], infinityBuf, [buf_4, buf_23, buf_5], [448, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[374], layouts[374], infinityBuf, [buf_22, buf_23, buf_5, buf_4, buf_336, buf_337], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[375], layouts[375], infinityBuf, [buf_9, buf_22, buf_338, buf_339], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[376], layouts[376], infinityBuf, [buf_37, buf_9, buf_24], [125, 7, 6]);
        addComputePass(device, commandEncoder, pipelines[377], layouts[377], infinityBuf, [buf_29, buf_37], [56, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[378], layouts[378], infinityBuf, [buf_28, buf_37, buf_29], [56, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[379], layouts[379], infinityBuf, [buf_38, buf_37, buf_29, buf_28], [125, 168, 1]);
        addComputePass(device, commandEncoder, pipelines[380], layouts[380], infinityBuf, [buf_9, buf_38, buf_25], [14, 12, 1]);
        addComputePass(device, commandEncoder, pipelines[381], layouts[381], infinityBuf, [buf_22, buf_23, buf_9, buf_340, buf_341], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[382], layouts[382], infinityBuf, [buf_4, buf_22], [448, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[383], layouts[383], infinityBuf, [buf_5, buf_22, buf_4], [448, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[384], layouts[384], infinityBuf, [buf_9, buf_22, buf_4, buf_5, buf_342, buf_343], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[385], layouts[385], infinityBuf, [buf_43, buf_9, buf_344, buf_345], [64, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[386], layouts[386], infinityBuf, [buf_346, buf_22, buf_43, buf_347, buf_348], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[387], layouts[387], infinityBuf, [buf_5, buf_346], [448, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[388], layouts[388], infinityBuf, [buf_4, buf_346, buf_5], [448, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[389], layouts[389], infinityBuf, [buf_349, buf_346, buf_5, buf_4, buf_350, buf_351], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[390], layouts[390], infinityBuf, [buf_22, buf_349, buf_352], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[391], layouts[391], infinityBuf, [buf_353, buf_22], [3584, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[392], layouts[392], infinityBuf, [buf_22, buf_349, buf_354, buf_355], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[393], layouts[393], infinityBuf, [buf_356, buf_22], [3584, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[394], layouts[394], infinityBuf, [buf_357, input1, buf_358], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[395], layouts[395], infinityBuf, [buf_359, input1, buf_360, buf_361], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[396], layouts[396], infinityBuf, [buf_22, buf_349, buf_362, buf_363], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[397], layouts[397], infinityBuf, [buf_9, buf_349, buf_352], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[398], layouts[398], infinityBuf, [buf_23, buf_349, buf_354, buf_355], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[399], layouts[399], infinityBuf, [buf_25, input1, buf_358], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[400], layouts[400], infinityBuf, [buf_24, input1, buf_360, buf_361], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[401], layouts[401], infinityBuf, [buf_30, buf_22, buf_9, buf_27], [7, 14, 4]);
        addComputePass(device, commandEncoder, pipelines[402], layouts[402], infinityBuf, [buf_28, buf_30], [56, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[403], layouts[403], infinityBuf, [buf_29, buf_30, buf_28], [56, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[404], layouts[404], infinityBuf, [buf_26, buf_30, buf_28, buf_29], [7, 672, 1]);
        addComputePass(device, commandEncoder, pipelines[405], layouts[405], infinityBuf, [buf_9, buf_26, buf_23], [14, 12, 1]);
        addComputePass(device, commandEncoder, pipelines[406], layouts[406], infinityBuf, [buf_23, buf_346, buf_9, buf_364, buf_365], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[407], layouts[407], infinityBuf, [buf_4, buf_23], [448, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[408], layouts[408], infinityBuf, [buf_5, buf_23, buf_4], [448, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[409], layouts[409], infinityBuf, [buf_9, buf_23, buf_4, buf_5, buf_366, buf_367], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[410], layouts[410], infinityBuf, [buf_22, buf_9, buf_368, buf_369], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[411], layouts[411], infinityBuf, [buf_38, buf_22, buf_25], [125, 7, 6]);
        addComputePass(device, commandEncoder, pipelines[412], layouts[412], infinityBuf, [buf_29, buf_38], [56, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[413], layouts[413], infinityBuf, [buf_28, buf_38, buf_29], [56, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[414], layouts[414], infinityBuf, [buf_37, buf_38, buf_29, buf_28], [125, 168, 1]);
        addComputePass(device, commandEncoder, pipelines[415], layouts[415], infinityBuf, [buf_22, buf_37, buf_24], [14, 12, 1]);
        addComputePass(device, commandEncoder, pipelines[416], layouts[416], infinityBuf, [buf_9, buf_23, buf_22, buf_370, buf_371], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[417], layouts[417], infinityBuf, [buf_5, buf_9], [448, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[418], layouts[418], infinityBuf, [buf_4, buf_9, buf_5], [448, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[419], layouts[419], infinityBuf, [buf_22, buf_9, buf_5, buf_4, buf_372, buf_373], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[420], layouts[420], infinityBuf, [buf_43, buf_22, buf_374, buf_375], [64, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[421], layouts[421], infinityBuf, [buf_376, buf_9, buf_43, buf_377, buf_378], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[422], layouts[422], infinityBuf, [buf_4, buf_376], [448, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[423], layouts[423], infinityBuf, [buf_5, buf_376, buf_4], [448, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[424], layouts[424], infinityBuf, [buf_9, buf_376, buf_4, buf_5, buf_379, buf_380], [16, 14, 1]);
        addComputePass(device, commandEncoder, pipelines[425], layouts[425], infinityBuf, [buf_381, buf_9, buf_1], [2161, 7, 1]);
        addComputePass(device, commandEncoder, pipelines[426], layouts[426], infinityBuf, [output0, buf_381, ctx], [2161, 1, 1]);
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
export default decoder;
