
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

const r_8_125_16_8_80_3_3_3 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3:array<f32>;
@compute @workgroup_size(16,8) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 125 */
  var gidx1 = i32(gindex.y); /* 8 */
  var lidx0 = i32(lindex.x); /* 16 */
  var lidx1 = i32(lindex.y); /* 8 */
  var alu0 = (lidx1*3);
  var alu1 = (gidx0*24);
  var precast0 = gidx0;
  var precast1 = (bitcast<u32>(precast0)<<3u);
  var acc0 = 0.0f;
  var acc1 = 0.0f;
  var acc2 = 0.0f;
  var acc3 = 0.0f;
  var acc4 = 0.0f;
  var acc5 = 0.0f;
  var acc6 = 0.0f;
  var acc7 = 0.0f;
  var acc8 = 0.0f;
  for (var ridx4 = 0; ridx4 < 80; ridx4++) {
    var alu2 = ((gidx1*11520)+(lidx0*720)+(ridx4*3));
    var val0 = data2[alu2];
    var val1 = data2[(alu2+1)];
    var val2 = data2[(alu2+2)];
    var val3 = data2[(alu2+240)];
    var val4 = data2[(alu2+241)];
    var val5 = data2[(alu2+242)];
    var val6 = data2[(alu2+480)];
    var val7 = data2[(alu2+481)];
    var val8 = data2[(alu2+482)];
    var alu3 = (alu1+alu0+(ridx4*3000));
    var val9 = data1[alu3];
    var val10 = select(0.0f, data1[(alu3+-1)], (((gidx0+lidx1)<1)!=true));
    var val11 = data1[(alu3+1)];
    var val12 = data1[(alu3+2)];
    var val13 = select(0.0f, data1[(alu3+3)], ((lidx1+bitcast<i32>(precast1))<999));
    acc0 = (acc0+(val10*val0)+(val9*val1)+(val11*val2));
    acc1 = (acc1+(val10*val3)+(val9*val4)+(val11*val5));
    acc2 = (acc2+(val10*val6)+(val9*val7)+(val11*val8));
    acc3 = (acc3+(val9*val0)+(val11*val1)+(val12*val2));
    acc4 = (acc4+(val9*val3)+(val11*val4)+(val12*val5));
    acc5 = (acc5+(val9*val6)+(val11*val7)+(val12*val8));
    acc6 = (acc6+(val11*val0)+(val12*val1)+(val13*val2));
    acc7 = (acc7+(val11*val3)+(val12*val4)+(val13*val5));
    acc8 = (acc8+(val11*val6)+(val12*val7)+(val13*val8));
  }
  var alu14 = ((gidx1*48)+(lidx0*3));
  var val14 = data3[alu14];
  var val15 = data3[(alu14+1)];
  var val16 = data3[(alu14+2)];
  var alu15 = (acc0+val14);
  var alu16 = (acc1+val15);
  var alu17 = (acc2+val16);
  var alu18 = (acc3+val14);
  var alu19 = (acc4+val15);
  var alu20 = (acc5+val16);
  var alu21 = (acc6+val14);
  var alu22 = (acc7+val15);
  var alu23 = (acc8+val16);
  var alu24 = (alu1+(gidx1*144000)+(lidx0*9000)+alu0);
  data0[alu24] = ((1/(1.0f+exp2(((alu15+(0.044715f*alu15*alu15*alu15))*-2.302208198144325f))))*alu15);
  data0[(alu24+3000)] = ((1/(1.0f+exp2(((alu16+(0.044715f*alu16*alu16*alu16))*-2.302208198144325f))))*alu16);
  data0[(alu24+6000)] = ((1/(1.0f+exp2(((alu17+(0.044715f*alu17*alu17*alu17))*-2.302208198144325f))))*alu17);
  data0[(alu24+1)] = ((1/(1.0f+exp2(((alu18+(0.044715f*alu18*alu18*alu18))*-2.302208198144325f))))*alu18);
  data0[(alu24+3001)] = ((1/(1.0f+exp2(((alu19+(0.044715f*alu19*alu19*alu19))*-2.302208198144325f))))*alu19);
  data0[(alu24+6001)] = ((1/(1.0f+exp2(((alu20+(0.044715f*alu20*alu20*alu20))*-2.302208198144325f))))*alu20);
  data0[(alu24+2)] = ((1/(1.0f+exp2(((alu21+(0.044715f*alu21*alu21*alu21))*-2.302208198144325f))))*alu21);
  data0[(alu24+3002)] = ((1/(1.0f+exp2(((alu22+(0.044715f*alu22*alu22*alu22))*-2.302208198144325f))))*alu22);
  data0[(alu24+6002)] = ((1/(1.0f+exp2(((alu23+(0.044715f*alu23*alu23*alu23))*-2.302208198144325f))))*alu23);
}`;

const r_4_125_32_4_384_3_3_3 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3:array<f32>;
@compute @workgroup_size(32,4) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 125 */
  var gidx1 = i32(gindex.y); /* 4 */
  var lidx0 = i32(lindex.x); /* 32 */
  var lidx1 = i32(lindex.y); /* 4 */
  var acc0 = 0.0f;
  var acc1 = 0.0f;
  var acc2 = 0.0f;
  var acc3 = 0.0f;
  var acc4 = 0.0f;
  var acc5 = 0.0f;
  var acc6 = 0.0f;
  var acc7 = 0.0f;
  var acc8 = 0.0f;
  for (var ridx4 = 0; ridx4 < 384; ridx4++) {
    var alu0 = ((gidx1*110592)+(lidx0*3456)+(ridx4*3));
    var val0 = data2[alu0];
    var val1 = data2[(alu0+1)];
    var val2 = data2[(alu0+2)];
    var val3 = data2[(alu0+1152)];
    var val4 = data2[(alu0+1153)];
    var val5 = data2[(alu0+1154)];
    var val6 = data2[(alu0+2304)];
    var val7 = data2[(alu0+2305)];
    var val8 = data2[(alu0+2306)];
    var alu1 = ((gidx0*24)+(lidx1*6)+(ridx4*3000));
    var val9 = data1[alu1];
    var val10 = select(0.0f, data1[(alu1+-1)], (((gidx0+lidx1)<1)!=true));
    var val11 = data1[(alu1+1)];
    var val12 = data1[(alu1+2)];
    var val13 = data1[(alu1+3)];
    var val14 = data1[(alu1+4)];
    var val15 = data1[(alu1+5)];
    acc0 = (acc0+(val10*val0)+(val9*val1)+(val11*val2));
    acc1 = (acc1+(val10*val3)+(val9*val4)+(val11*val5));
    acc2 = (acc2+(val10*val6)+(val9*val7)+(val11*val8));
    acc3 = (acc3+(val11*val0)+(val12*val1)+(val13*val2));
    acc4 = (acc4+(val11*val3)+(val12*val4)+(val13*val5));
    acc5 = (acc5+(val11*val6)+(val12*val7)+(val13*val8));
    acc6 = (acc6+(val13*val0)+(val14*val1)+(val15*val2));
    acc7 = (acc7+(val13*val3)+(val14*val4)+(val15*val5));
    acc8 = (acc8+(val13*val6)+(val14*val7)+(val15*val8));
  }
  var alu12 = ((gidx1*96)+(lidx0*3));
  var val16 = data3[alu12];
  var val17 = data3[(alu12+1)];
  var val18 = data3[(alu12+2)];
  var alu13 = ((gidx0*12)+(gidx1*144000)+(lidx0*4500)+(lidx1*3));
  data0[alu13] = (acc0+val16);
  data0[(alu13+1)] = (acc3+val16);
  data0[(alu13+2)] = (acc6+val16);
  data0[(alu13+1500)] = (acc1+val17);
  data0[(alu13+1501)] = (acc4+val17);
  data0[(alu13+1502)] = (acc7+val17);
  data0[(alu13+3000)] = (acc2+val18);
  data0[(alu13+3001)] = (acc5+val18);
  data0[(alu13+3002)] = (acc8+val18);
}`;

const r_1500_16_24 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
var<workgroup> temp0: array<f32,16>;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
@compute @workgroup_size(16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 1500 */
  var lidx0 = i32(lindex.x); /* 16 */
  var acc0 = 0.0f;
  for (var ridx2 = 0; ridx2 < 24; ridx2++) {
    var val0 = data2[((gidx0*384)+(lidx0*24)+ridx2)];
    var val1 = data1[(gidx0+(lidx0*36000)+(ridx2*1500))];
    acc0 = (acc0+((1/(1.0f+exp2(((val1+(0.044715f*val1*val1*val1))*-2.302208198144325f))))*val1)+val0);
  }
  temp0[lidx0] = acc0;
  workgroupBarrier();
  if (((bool(lidx0))!=true)) {
    var acc1 = 0.0f;
    for (var ridx1001 = 0; ridx1001 < 16; ridx1001++) {
      var val2 = temp0[ridx1001];
      acc1 = (acc1+val2);
    }
    data0[gidx0] = (acc1*0.0026041666666666665f);
  }
}`;

const r_1500_16_24n1 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
var<workgroup> temp0: array<f32,16>;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3:array<f32>;
@compute @workgroup_size(16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 1500 */
  var lidx0 = i32(lindex.x); /* 16 */
  var val0 = data3[gidx0];
  var acc0 = 0.0f;
  for (var ridx2 = 0; ridx2 < 24; ridx2++) {
    var val1 = data2[((gidx0*384)+(lidx0*24)+ridx2)];
    var val2 = data1[(gidx0+(lidx0*36000)+(ridx2*1500))];
    var alu0 = ((((1/(1.0f+exp2(((val2+(0.044715f*val2*val2*val2))*-2.302208198144325f))))*val2)+val1)-val0);
    acc0 = (acc0+(alu0*alu0));
  }
  temp0[lidx0] = acc0;
  workgroupBarrier();
  if (((bool(lidx0))!=true)) {
    var acc1 = 0.0f;
    for (var ridx1001 = 0; ridx1001 < 16; ridx1001++) {
      var val3 = temp0[ridx1001];
      acc1 = (acc1+val3);
    }
    data0[gidx0] = (1/sqrt(((acc1*0.0026041666666666665f)+1e-05f)));
  }
}`;

const E_125_8_4_16_3_3 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3:array<f32>;
@group(0) @binding(5)var<storage,read_write>data4:array<f32>;
@group(0) @binding(6)var<storage,read_write>data5:array<f32>;
@group(0) @binding(7)var<storage,read_write>data6:array<f32>;
@compute @workgroup_size(4,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 8 */
  var gidx1 = i32(gindex.y); /* 125 */
  var lidx0 = i32(lindex.x); /* 4 */
  var lidx1 = i32(lindex.y); /* 16 */
  var alu0 = (gidx0*48);
  var alu1 = (gidx1*12);
  var alu2 = (lidx0*3);
  var alu3 = (alu1+alu2);
  var val0 = data3[alu3];
  var val1 = data4[alu3];
  var alu4 = (alu3+1);
  var val2 = data3[alu4];
  var val3 = data4[alu4];
  var alu5 = (alu3+2);
  var val4 = data3[alu5];
  var val5 = data4[alu5];
  var alu6 = (lidx1*3);
  var alu7 = (alu0+(gidx1*4608)+(lidx0*1152)+alu6);
  var val6 = data2[alu7];
  var alu8 = (alu7+1);
  var val7 = data2[alu8];
  var alu9 = (alu7+2);
  var val8 = data2[alu9];
  var alu10 = (alu7+384);
  var val9 = data2[alu10];
  var alu11 = (alu7+385);
  var val10 = data2[alu11];
  var alu12 = (alu7+386);
  var val11 = data2[alu12];
  var alu13 = (alu7+768);
  var val12 = data2[alu13];
  var alu14 = (alu7+769);
  var val13 = data2[alu14];
  var alu15 = (alu7+770);
  var val14 = data2[alu15];
  var alu16 = (alu0+alu6);
  var val15 = data5[alu16];
  var val16 = data6[alu16];
  var alu17 = (alu16+1);
  var val17 = data5[alu17];
  var val18 = data6[alu17];
  var alu18 = (alu16+2);
  var val19 = data5[alu18];
  var val20 = data6[alu18];
  var alu19 = ((gidx0*72000)+alu1+alu2+(lidx1*4500));
  var val21 = data1[alu19];
  var val22 = data1[(alu19+1)];
  var val23 = data1[(alu19+2)];
  var val24 = data1[(alu19+1500)];
  var val25 = data1[(alu19+1501)];
  var val26 = data1[(alu19+1502)];
  var val27 = data1[(alu19+3000)];
  var val28 = data1[(alu19+3001)];
  var val29 = data1[(alu19+3002)];
  data0[alu10] = ((((((1/(1.0f+exp2(((val22+(0.044715f*val22*val22*val22))*-2.302208198144325f))))*val22)+val9)-val2)*val3*val15)+val16);
  data0[alu13] = ((((((1/(1.0f+exp2(((val23+(0.044715f*val23*val23*val23))*-2.302208198144325f))))*val23)+val12)-val4)*val5*val15)+val16);
  data0[alu8] = ((((((1/(1.0f+exp2(((val24+(0.044715f*val24*val24*val24))*-2.302208198144325f))))*val24)+val7)-val0)*val1*val17)+val18);
  data0[alu11] = ((((((1/(1.0f+exp2(((val25+(0.044715f*val25*val25*val25))*-2.302208198144325f))))*val25)+val10)-val2)*val3*val17)+val18);
  data0[alu14] = ((((((1/(1.0f+exp2(((val26+(0.044715f*val26*val26*val26))*-2.302208198144325f))))*val26)+val13)-val4)*val5*val17)+val18);
  data0[alu9] = ((((((1/(1.0f+exp2(((val27+(0.044715f*val27*val27*val27))*-2.302208198144325f))))*val27)+val8)-val0)*val1*val19)+val20);
  data0[alu12] = ((((((1/(1.0f+exp2(((val28+(0.044715f*val28*val28*val28))*-2.302208198144325f))))*val28)+val11)-val2)*val3*val19)+val20);
  data0[alu15] = ((((((1/(1.0f+exp2(((val29+(0.044715f*val29*val29*val29))*-2.302208198144325f))))*val29)+val14)-val4)*val5*val19)+val20);
  data0[alu7] = ((((((1/(1.0f+exp2(((val21+(0.044715f*val21*val21*val21))*-2.302208198144325f))))*val21)+val6)-val0)*val1*val15)+val16);
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
    acc0 = (acc0+(val12*val0)+(val13*val1)+(val14*val2)+(val15*val3));
    acc1 = (acc1+(val12*val4)+(val13*val5)+(val14*val6)+(val15*val7));
    acc2 = (acc2+(val12*val8)+(val13*val9)+(val14*val10)+(val15*val11));
    acc3 = (acc3+(val16*val0)+(val17*val1)+(val18*val2)+(val19*val3));
    acc4 = (acc4+(val16*val4)+(val17*val5)+(val18*val6)+(val19*val7));
    acc5 = (acc5+(val16*val8)+(val17*val9)+(val18*val10)+(val19*val11));
    acc6 = (acc6+(val20*val0)+(val21*val1)+(val22*val2)+(val23*val3));
    acc7 = (acc7+(val20*val4)+(val21*val5)+(val22*val6)+(val23*val7));
    acc8 = (acc8+(val20*val8)+(val21*val9)+(val22*val10)+(val23*val11));
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
    acc0 = (acc0+(val12*val0)+(val13*val1)+(val14*val2)+(val15*val3));
    acc1 = (acc1+(val16*val0)+(val17*val1)+(val18*val2)+(val19*val3));
    acc2 = (acc2+(val20*val0)+(val21*val1)+(val22*val2)+(val23*val3));
    acc3 = (acc3+(val12*val4)+(val13*val5)+(val14*val6)+(val15*val7));
    acc4 = (acc4+(val16*val4)+(val17*val5)+(val18*val6)+(val19*val7));
    acc5 = (acc5+(val20*val4)+(val21*val5)+(val22*val6)+(val23*val7));
    acc6 = (acc6+(val12*val8)+(val13*val9)+(val14*val10)+(val15*val11));
    acc7 = (acc7+(val16*val8)+(val17*val9)+(val18*val10)+(val19*val11));
    acc8 = (acc8+(val20*val8)+(val21*val9)+(val22*val10)+(val23*val11));
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

const r_2_125_125_3_4_4_16_3_3_4 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
@compute @workgroup_size(3,4,4) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 125 */
  var gidx1 = i32(gindex.y); /* 125 */
  var gidx2 = i32(gindex.z); /* 2 */
  var lidx0 = i32(lindex.x); /* 3 */
  var lidx1 = i32(lindex.y); /* 4 */
  var lidx2 = i32(lindex.z); /* 4 */
  var precast0 = lidx0;
  var alu0 = (gidx2*192);
  var precast1 = (bitcast<u32>(precast0)<<6u);
  var cast0 = bitcast<i32>(precast1);
  var acc0 = 0.0f;
  var acc1 = 0.0f;
  var acc2 = 0.0f;
  var acc3 = 0.0f;
  var acc4 = 0.0f;
  var acc5 = 0.0f;
  var acc6 = 0.0f;
  var acc7 = 0.0f;
  var acc8 = 0.0f;
  for (var ridx6 = 0; ridx6 < 16; ridx6++) {
    var precast2 = ridx6;
    var precast3 = (bitcast<u32>(precast2)<<2u);
    var cast1 = bitcast<i32>(precast3);
    var alu1 = ((gidx0*4608)+alu0+cast0+(lidx2*1152)+cast1);
    var val0 = data2[alu1];
    var val1 = data2[(alu1+1)];
    var val2 = data2[(alu1+2)];
    var val3 = data2[(alu1+3)];
    var val4 = data2[(alu1+384)];
    var val5 = data2[(alu1+385)];
    var val6 = data2[(alu1+386)];
    var val7 = data2[(alu1+387)];
    var val8 = data2[(alu1+768)];
    var val9 = data2[(alu1+769)];
    var val10 = data2[(alu1+770)];
    var val11 = data2[(alu1+771)];
    var alu2 = ((gidx1*4608)+alu0+cast0+(lidx1*1152)+cast1);
    var val12 = data1[alu2];
    var val13 = data1[(alu2+1)];
    var val14 = data1[(alu2+2)];
    var val15 = data1[(alu2+3)];
    var val16 = data1[(alu2+384)];
    var val17 = data1[(alu2+385)];
    var val18 = data1[(alu2+386)];
    var val19 = data1[(alu2+387)];
    var val20 = data1[(alu2+768)];
    var val21 = data1[(alu2+769)];
    var val22 = data1[(alu2+770)];
    var val23 = data1[(alu2+771)];
    acc0 = (acc0+(val12*val0)+(val13*val1)+(val14*val2)+(val15*val3));
    acc1 = (acc1+(val16*val0)+(val17*val1)+(val18*val2)+(val19*val3));
    acc2 = (acc2+(val20*val0)+(val21*val1)+(val22*val2)+(val23*val3));
    acc3 = (acc3+(val12*val4)+(val13*val5)+(val14*val6)+(val15*val7));
    acc4 = (acc4+(val16*val4)+(val17*val5)+(val18*val6)+(val19*val7));
    acc5 = (acc5+(val20*val4)+(val21*val5)+(val22*val6)+(val23*val7));
    acc6 = (acc6+(val12*val8)+(val13*val9)+(val14*val10)+(val15*val11));
    acc7 = (acc7+(val16*val8)+(val17*val9)+(val18*val10)+(val19*val11));
    acc8 = (acc8+(val20*val8)+(val21*val9)+(val22*val10)+(val23*val11));
  }
  var alu13 = ((gidx1*18000)+(gidx2*6750000)+(gidx0*12)+(lidx0*2250000)+(lidx1*4500)+(lidx2*3));
  data0[alu13] = (acc0*0.125f);
  data0[(alu13+1500)] = (acc1*0.125f);
  data0[(alu13+3000)] = (acc2*0.125f);
  data0[(alu13+1)] = (acc3*0.125f);
  data0[(alu13+1501)] = (acc4*0.125f);
  data0[(alu13+3001)] = (acc5*0.125f);
  data0[(alu13+2)] = (acc6*0.125f);
  data0[(alu13+1502)] = (acc7*0.125f);
  data0[(alu13+3002)] = (acc8*0.125f);
}`;

const r_375_8_375_3_4 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@compute @workgroup_size(8) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 375 */
  var lidx0 = i32(lindex.x); /* 8 */
  var acc0 = (f32(-INFINITY));
  var acc1 = (f32(-INFINITY));
  var acc2 = (f32(-INFINITY));
  for (var ridx2 = 0; ridx2 < 375; ridx2++) {
    var precast0 = ridx2;
    var precast1 = (bitcast<u32>(precast0)<<2u);
    var alu0 = ((gidx0*36000)+(lidx0*4500)+bitcast<i32>(precast1));
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
    var alu11 = select(alu8,val7,(alu8<val7));
    var alu12 = select(alu9,val11,(alu9<val11));
    acc0 = alu10;
    acc1 = alu11;
    acc2 = alu12;
  }
  var alu17 = ((gidx0*24)+(lidx0*3));
  data0[alu17] = acc0;
  data0[(alu17+1)] = acc1;
  data0[(alu17+2)] = acc2;
}`;

const r_375_8_375_3_4n1 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
@compute @workgroup_size(8) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 375 */
  var lidx0 = i32(lindex.x); /* 8 */
  var alu0 = ((gidx0*24)+(lidx0*3));
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
    var alu3 = ((gidx0*36000)+(lidx0*4500)+bitcast<i32>(precast1));
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
    acc0 = (acc0+exp2(((val3-val2)*1.4426950408889634f))+exp2(((val4-val2)*1.4426950408889634f))+exp2(((val5-val2)*1.4426950408889634f))+exp2(((val6-val2)*1.4426950408889634f)));
    acc1 = (acc1+exp2(((val7-val0)*1.4426950408889634f))+exp2(((val8-val0)*1.4426950408889634f))+exp2(((val9-val0)*1.4426950408889634f))+exp2(((val10-val0)*1.4426950408889634f)));
    acc2 = (acc2+exp2(((val11-val1)*1.4426950408889634f))+exp2(((val12-val1)*1.4426950408889634f))+exp2(((val13-val1)*1.4426950408889634f))+exp2(((val14-val1)*1.4426950408889634f)));
  }
  data0[alu2] = (1/acc1);
  data0[alu1] = (1/acc2);
  data0[alu0] = (1/acc0);
}`;

const E_1125_125_8_4_3 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3:array<f32>;
@compute @workgroup_size(8,4) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 125 */
  var gidx1 = i32(gindex.y); /* 1125 */
  var lidx0 = i32(lindex.x); /* 8 */
  var lidx1 = i32(lindex.y); /* 4 */
  var precast0 = gidx1;
  var alu0 = ((gidx0*12)+(gidx1*12000)+(lidx0*1500)+(lidx1*3));
  var val0 = data1[alu0];
  var alu1 = (alu0+1);
  var val1 = data1[alu1];
  var alu2 = (alu0+2);
  var val2 = data1[alu2];
  var precast1 = (bitcast<u32>(precast0)<<3u);
  var alu3 = (lidx0+bitcast<i32>(precast1));
  var val3 = data2[alu3];
  var val4 = data3[alu3];
  data0[alu1] = (exp2(((val1-val3)*1.4426950408889634f))*val4);
  data0[alu2] = (exp2(((val2-val3)*1.4426950408889634f))*val4);
  data0[alu0] = (exp2(((val0-val3)*1.4426950408889634f))*val4);
}`;

const r_3_125_2_4_16_375_4_3_4 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
@compute @workgroup_size(2,4,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 125 */
  var gidx1 = i32(gindex.y); /* 3 */
  var lidx0 = i32(lindex.x); /* 2 */
  var lidx1 = i32(lindex.y); /* 4 */
  var lidx2 = i32(lindex.z); /* 16 */
  var precast0 = lidx2;
  var precast1 = (bitcast<u32>(precast0)<<2u);
  var cast0 = bitcast<i32>(precast1);
  var precast2 = gidx1;
  var precast3 = lidx0;
  var precast4 = (bitcast<u32>(precast2)<<7u);
  var precast5 = (bitcast<u32>(precast3)<<6u);
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
  for (var ridx5 = 0; ridx5 < 375; ridx5++) {
    var precast6 = ridx5;
    var alu0 = (bitcast<i32>(precast4)+bitcast<i32>(precast5)+cast0+(ridx5*1536));
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
    var precast7 = (bitcast<u32>(precast6)<<2u);
    var alu1 = ((gidx0*18000)+(gidx1*4500000)+(lidx0*2250000)+(lidx1*4500)+bitcast<i32>(precast7));
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
    acc0 = (acc0+(val16*val0)+(val17*val4)+(val18*val8)+(val19*val12));
    acc1 = (acc1+(val20*val0)+(val21*val4)+(val22*val8)+(val23*val12));
    acc2 = (acc2+(val24*val0)+(val25*val4)+(val26*val8)+(val27*val12));
    acc3 = (acc3+(val16*val1)+(val17*val5)+(val18*val9)+(val19*val13));
    acc4 = (acc4+(val20*val1)+(val21*val5)+(val22*val9)+(val23*val13));
    acc5 = (acc5+(val24*val1)+(val25*val5)+(val26*val9)+(val27*val13));
    acc6 = (acc6+(val16*val2)+(val17*val6)+(val18*val10)+(val19*val14));
    acc7 = (acc7+(val20*val2)+(val21*val6)+(val22*val10)+(val23*val14));
    acc8 = (acc8+(val24*val2)+(val25*val6)+(val26*val10)+(val27*val14));
    acc9 = (acc9+(val16*val3)+(val17*val7)+(val18*val11)+(val19*val15));
    acc10 = (acc10+(val20*val3)+(val21*val7)+(val22*val11)+(val23*val15));
    acc11 = (acc11+(val24*val3)+(val25*val7)+(val26*val11)+(val27*val15));
  }
  var alu15 = ((gidx0*768)+(gidx1*192000)+(lidx0*96000)+(lidx1*192)+cast0);
  data0[alu15] = acc0;
  data0[(alu15+1)] = acc3;
  data0[(alu15+2)] = acc6;
  data0[(alu15+3)] = acc9;
  data0[(alu15+64)] = acc1;
  data0[(alu15+65)] = acc4;
  data0[(alu15+66)] = acc7;
  data0[(alu15+67)] = acc10;
  data0[(alu15+128)] = acc2;
  data0[(alu15+129)] = acc5;
  data0[(alu15+130)] = acc8;
  data0[(alu15+131)] = acc11;
}`;

const r_125_8_4_16_96_3_3_4n2 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3:array<f32>;
@group(0) @binding(5)var<storage,read_write>data4:array<f32>;
@group(0) @binding(6)var<storage,read_write>data5:array<f32>;
@compute @workgroup_size(4,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 8 */
  var gidx1 = i32(gindex.y); /* 125 */
  var lidx0 = i32(lindex.x); /* 4 */
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
  for (var ridx4 = 0; ridx4 < 96; ridx4++) {
    var precast0 = ridx4;
    var precast1 = (bitcast<u32>(precast0)<<2u);
    var alu0 = ((gidx0*18432)+(lidx1*1152)+bitcast<i32>(precast1));
    var val0 = data4[alu0];
    var val1 = data4[(alu0+1)];
    var val2 = data4[(alu0+2)];
    var val3 = data4[(alu0+3)];
    var val4 = data4[(alu0+384)];
    var val5 = data4[(alu0+385)];
    var val6 = data4[(alu0+386)];
    var val7 = data4[(alu0+387)];
    var val8 = data4[(alu0+768)];
    var val9 = data4[(alu0+769)];
    var val10 = data4[(alu0+770)];
    var val11 = data4[(alu0+771)];
    var precast2 = (ridx4&15);
    var precast3 = (bitcast<u32>(precast2)<<2u);
    var alu1 = ((gidx1*768)+(lidx0*192)+((ridx4>>4u)*96000)+bitcast<i32>(precast3));
    var val12 = data3[alu1];
    var val13 = data3[(alu1+1)];
    var val14 = data3[(alu1+2)];
    var val15 = data3[(alu1+3)];
    var val16 = data3[(alu1+64)];
    var val17 = data3[(alu1+65)];
    var val18 = data3[(alu1+66)];
    var val19 = data3[(alu1+67)];
    var val20 = data3[(alu1+128)];
    var val21 = data3[(alu1+129)];
    var val22 = data3[(alu1+130)];
    var val23 = data3[(alu1+131)];
    acc0 = (acc0+(val12*val0)+(val13*val1)+(val14*val2)+(val15*val3));
    acc1 = (acc1+(val12*val4)+(val13*val5)+(val14*val6)+(val15*val7));
    acc2 = (acc2+(val12*val8)+(val13*val9)+(val14*val10)+(val15*val11));
    acc3 = (acc3+(val16*val0)+(val17*val1)+(val18*val2)+(val19*val3));
    acc4 = (acc4+(val16*val4)+(val17*val5)+(val18*val6)+(val19*val7));
    acc5 = (acc5+(val16*val8)+(val17*val9)+(val18*val10)+(val19*val11));
    acc6 = (acc6+(val20*val0)+(val21*val1)+(val22*val2)+(val23*val3));
    acc7 = (acc7+(val20*val4)+(val21*val5)+(val22*val6)+(val23*val7));
    acc8 = (acc8+(val20*val8)+(val21*val9)+(val22*val10)+(val23*val11));
  }
  var alu12 = (gidx0*48);
  var alu13 = (lidx1*3);
  var alu14 = (alu12+(gidx1*4608)+(lidx0*1152)+alu13);
  var val24 = data2[alu14];
  var alu15 = (alu14+1);
  var val25 = data2[alu15];
  var alu16 = (alu14+2);
  var val26 = data2[alu16];
  var alu17 = (alu14+384);
  var val27 = data2[alu17];
  var alu18 = (alu14+385);
  var val28 = data2[alu18];
  var alu19 = (alu14+386);
  var val29 = data2[alu19];
  var alu20 = (alu14+768);
  var val30 = data2[alu20];
  var alu21 = (alu14+769);
  var val31 = data2[alu21];
  var alu22 = (alu14+770);
  var val32 = data2[alu22];
  var alu23 = (alu12+alu13);
  var val33 = data5[alu23];
  var val34 = data5[(alu23+1)];
  var val35 = data5[(alu23+2)];
  var alu24 = ((gidx0*72000)+(gidx1*12)+(lidx0*3)+(lidx1*4500));
  var val36 = data1[alu24];
  var val37 = data1[(alu24+1)];
  var val38 = data1[(alu24+2)];
  var val39 = data1[(alu24+1500)];
  var val40 = data1[(alu24+1501)];
  var val41 = data1[(alu24+1502)];
  var val42 = data1[(alu24+3000)];
  var val43 = data1[(alu24+3001)];
  var val44 = data1[(alu24+3002)];
  data0[alu17] = (((1/(1.0f+exp2(((val37+(0.044715f*val37*val37*val37))*-2.302208198144325f))))*val37)+val27+acc3+val33);
  data0[alu20] = (((1/(1.0f+exp2(((val38+(0.044715f*val38*val38*val38))*-2.302208198144325f))))*val38)+val30+acc6+val33);
  data0[alu15] = (((1/(1.0f+exp2(((val39+(0.044715f*val39*val39*val39))*-2.302208198144325f))))*val39)+val25+acc1+val34);
  data0[alu18] = (((1/(1.0f+exp2(((val40+(0.044715f*val40*val40*val40))*-2.302208198144325f))))*val40)+val28+acc4+val34);
  data0[alu21] = (((1/(1.0f+exp2(((val41+(0.044715f*val41*val41*val41))*-2.302208198144325f))))*val41)+val31+acc7+val34);
  data0[alu16] = (((1/(1.0f+exp2(((val42+(0.044715f*val42*val42*val42))*-2.302208198144325f))))*val42)+val26+acc2+val35);
  data0[alu19] = (((1/(1.0f+exp2(((val43+(0.044715f*val43*val43*val43))*-2.302208198144325f))))*val43)+val29+acc5+val35);
  data0[alu22] = (((1/(1.0f+exp2(((val44+(0.044715f*val44*val44*val44))*-2.302208198144325f))))*val44)+val32+acc8+val35);
  data0[alu14] = (((1/(1.0f+exp2(((val36+(0.044715f*val36*val36*val36))*-2.302208198144325f))))*val36)+val24+acc0+val33);
}`;

const r_1500_16_24n2 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
var<workgroup> temp0: array<f32,16>;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@compute @workgroup_size(16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 1500 */
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

const r_1500_16_24n3 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
var<workgroup> temp0: array<f32,16>;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
@compute @workgroup_size(16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 1500 */
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

const E_125_8_4_16_3_3n1 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3:array<f32>;
@group(0) @binding(5)var<storage,read_write>data4:array<f32>;
@group(0) @binding(6)var<storage,read_write>data5:array<f32>;
@compute @workgroup_size(4,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 8 */
  var gidx1 = i32(gindex.y); /* 125 */
  var lidx0 = i32(lindex.x); /* 4 */
  var lidx1 = i32(lindex.y); /* 16 */
  var alu0 = (gidx0*48);
  var alu1 = ((gidx1*12)+(lidx0*3));
  var val0 = data2[alu1];
  var val1 = data3[alu1];
  var alu2 = (alu1+1);
  var val2 = data2[alu2];
  var val3 = data3[alu2];
  var alu3 = (alu1+2);
  var val4 = data2[alu3];
  var val5 = data3[alu3];
  var alu4 = (lidx1*3);
  var alu5 = (alu0+(gidx1*4608)+(lidx0*1152)+alu4);
  var val6 = data1[alu5];
  var alu6 = (alu5+1);
  var val7 = data1[alu6];
  var alu7 = (alu5+2);
  var val8 = data1[alu7];
  var alu8 = (alu5+384);
  var val9 = data1[alu8];
  var alu9 = (alu5+385);
  var val10 = data1[alu9];
  var alu10 = (alu5+386);
  var val11 = data1[alu10];
  var alu11 = (alu5+768);
  var val12 = data1[alu11];
  var alu12 = (alu5+769);
  var val13 = data1[alu12];
  var alu13 = (alu5+770);
  var val14 = data1[alu13];
  var alu14 = (alu0+alu4);
  var val15 = data4[alu14];
  var val16 = data5[alu14];
  var alu15 = (alu14+1);
  var val17 = data4[alu15];
  var val18 = data5[alu15];
  var alu16 = (alu14+2);
  var val19 = data4[alu16];
  var val20 = data5[alu16];
  data0[alu6] = (((val7-val0)*val1*val17)+val18);
  data0[alu7] = (((val8-val0)*val1*val19)+val20);
  data0[alu8] = (((val9-val2)*val3*val15)+val16);
  data0[alu9] = (((val10-val2)*val3*val17)+val18);
  data0[alu10] = (((val11-val2)*val3*val19)+val20);
  data0[alu11] = (((val12-val4)*val5*val15)+val16);
  data0[alu12] = (((val13-val4)*val5*val17)+val18);
  data0[alu13] = (((val14-val4)*val5*val19)+val20);
  data0[alu5] = (((val6-val0)*val1*val15)+val16);
}`;

const r_125_32_4_16_96_3_3_4 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3:array<f32>;
@compute @workgroup_size(4,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 32 */
  var gidx1 = i32(gindex.y); /* 125 */
  var lidx0 = i32(lindex.x); /* 4 */
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
    var alu1 = ((gidx1*4608)+(lidx0*1152)+cast0);
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
    acc0 = (acc0+(val12*val0)+(val13*val1)+(val14*val2)+(val15*val3));
    acc1 = (acc1+(val12*val4)+(val13*val5)+(val14*val6)+(val15*val7));
    acc2 = (acc2+(val12*val8)+(val13*val9)+(val14*val10)+(val15*val11));
    acc3 = (acc3+(val16*val0)+(val17*val1)+(val18*val2)+(val19*val3));
    acc4 = (acc4+(val16*val4)+(val17*val5)+(val18*val6)+(val19*val7));
    acc5 = (acc5+(val16*val8)+(val17*val9)+(val18*val10)+(val19*val11));
    acc6 = (acc6+(val20*val0)+(val21*val1)+(val22*val2)+(val23*val3));
    acc7 = (acc7+(val20*val4)+(val21*val5)+(val22*val6)+(val23*val7));
    acc8 = (acc8+(val20*val8)+(val21*val9)+(val22*val10)+(val23*val11));
  }
  var alu12 = (gidx0*48);
  var alu13 = (lidx1*3);
  var alu14 = (alu12+alu13);
  var val24 = data3[alu14];
  var val25 = data3[(alu14+1)];
  var val26 = data3[(alu14+2)];
  var alu15 = (acc0+val24);
  var alu16 = (acc1+val25);
  var alu17 = (acc2+val26);
  var alu18 = (acc3+val24);
  var alu19 = (acc4+val25);
  var alu20 = (acc5+val26);
  var alu21 = (acc6+val24);
  var alu22 = (acc7+val25);
  var alu23 = (acc8+val26);
  var alu24 = (alu12+(gidx1*18432)+(lidx0*4608)+alu13);
  data0[alu24] = ((1/(1.0f+exp2(((alu15+(0.044715f*alu15*alu15*alu15))*-2.302208198144325f))))*alu15);
  data0[(alu24+1)] = ((1/(1.0f+exp2(((alu16+(0.044715f*alu16*alu16*alu16))*-2.302208198144325f))))*alu16);
  data0[(alu24+2)] = ((1/(1.0f+exp2(((alu17+(0.044715f*alu17*alu17*alu17))*-2.302208198144325f))))*alu17);
  data0[(alu24+1536)] = ((1/(1.0f+exp2(((alu18+(0.044715f*alu18*alu18*alu18))*-2.302208198144325f))))*alu18);
  data0[(alu24+1537)] = ((1/(1.0f+exp2(((alu19+(0.044715f*alu19*alu19*alu19))*-2.302208198144325f))))*alu19);
  data0[(alu24+1538)] = ((1/(1.0f+exp2(((alu20+(0.044715f*alu20*alu20*alu20))*-2.302208198144325f))))*alu20);
  data0[(alu24+3072)] = ((1/(1.0f+exp2(((alu21+(0.044715f*alu21*alu21*alu21))*-2.302208198144325f))))*alu21);
  data0[(alu24+3073)] = ((1/(1.0f+exp2(((alu22+(0.044715f*alu22*alu22*alu22))*-2.302208198144325f))))*alu22);
  data0[(alu24+3074)] = ((1/(1.0f+exp2(((alu23+(0.044715f*alu23*alu23*alu23))*-2.302208198144325f))))*alu23);
}`;

const r_125_8_4_16_384_3_3_4 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3:array<f32>;
@group(0) @binding(5)var<storage,read_write>data4:array<f32>;
@compute @workgroup_size(4,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 8 */
  var gidx1 = i32(gindex.y); /* 125 */
  var lidx0 = i32(lindex.x); /* 4 */
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
    var alu1 = ((gidx1*18432)+(lidx0*4608)+cast0);
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
    acc0 = (acc0+(val12*val0)+(val13*val1)+(val14*val2)+(val15*val3));
    acc1 = (acc1+(val12*val4)+(val13*val5)+(val14*val6)+(val15*val7));
    acc2 = (acc2+(val12*val8)+(val13*val9)+(val14*val10)+(val15*val11));
    acc3 = (acc3+(val16*val0)+(val17*val1)+(val18*val2)+(val19*val3));
    acc4 = (acc4+(val16*val4)+(val17*val5)+(val18*val6)+(val19*val7));
    acc5 = (acc5+(val16*val8)+(val17*val9)+(val18*val10)+(val19*val11));
    acc6 = (acc6+(val20*val0)+(val21*val1)+(val22*val2)+(val23*val3));
    acc7 = (acc7+(val20*val4)+(val21*val5)+(val22*val6)+(val23*val7));
    acc8 = (acc8+(val20*val8)+(val21*val9)+(val22*val10)+(val23*val11));
  }
  var alu12 = (gidx0*48);
  var alu13 = (lidx1*3);
  var alu14 = (alu12+(gidx1*4608)+(lidx0*1152)+alu13);
  var val24 = data1[alu14];
  var alu15 = (alu14+1);
  var val25 = data1[alu15];
  var alu16 = (alu14+2);
  var val26 = data1[alu16];
  var alu17 = (alu14+384);
  var val27 = data1[alu17];
  var alu18 = (alu14+385);
  var val28 = data1[alu18];
  var alu19 = (alu14+386);
  var val29 = data1[alu19];
  var alu20 = (alu14+768);
  var val30 = data1[alu20];
  var alu21 = (alu14+769);
  var val31 = data1[alu21];
  var alu22 = (alu14+770);
  var val32 = data1[alu22];
  var alu23 = (alu12+alu13);
  var val33 = data4[alu23];
  var val34 = data4[(alu23+1)];
  var val35 = data4[(alu23+2)];
  data0[alu14] = (val24+acc0+val33);
  data0[alu15] = (val25+acc1+val34);
  data0[alu16] = (val26+acc2+val35);
  data0[alu17] = (val27+acc3+val33);
  data0[alu18] = (val28+acc4+val34);
  data0[alu19] = (val29+acc5+val35);
  data0[alu20] = (val30+acc6+val33);
  data0[alu21] = (val31+acc7+val34);
  data0[alu22] = (val32+acc8+val35);
}`;

const r_125_8_4_16_96_3_3_4n3 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3:array<f32>;
@group(0) @binding(5)var<storage,read_write>data4:array<f32>;
@compute @workgroup_size(4,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 8 */
  var gidx1 = i32(gindex.y); /* 125 */
  var lidx0 = i32(lindex.x); /* 4 */
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
  for (var ridx4 = 0; ridx4 < 96; ridx4++) {
    var precast0 = ridx4;
    var precast1 = (bitcast<u32>(precast0)<<2u);
    var alu0 = ((gidx0*18432)+(lidx1*1152)+bitcast<i32>(precast1));
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
    var precast2 = (ridx4&15);
    var precast3 = (bitcast<u32>(precast2)<<2u);
    var alu1 = ((gidx1*768)+(lidx0*192)+((ridx4>>4u)*96000)+bitcast<i32>(precast3));
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
    acc0 = (acc0+(val12*val0)+(val13*val1)+(val14*val2)+(val15*val3));
    acc1 = (acc1+(val12*val4)+(val13*val5)+(val14*val6)+(val15*val7));
    acc2 = (acc2+(val12*val8)+(val13*val9)+(val14*val10)+(val15*val11));
    acc3 = (acc3+(val16*val0)+(val17*val1)+(val18*val2)+(val19*val3));
    acc4 = (acc4+(val16*val4)+(val17*val5)+(val18*val6)+(val19*val7));
    acc5 = (acc5+(val16*val8)+(val17*val9)+(val18*val10)+(val19*val11));
    acc6 = (acc6+(val20*val0)+(val21*val1)+(val22*val2)+(val23*val3));
    acc7 = (acc7+(val20*val4)+(val21*val5)+(val22*val6)+(val23*val7));
    acc8 = (acc8+(val20*val8)+(val21*val9)+(val22*val10)+(val23*val11));
  }
  var alu12 = (gidx0*48);
  var alu13 = (lidx1*3);
  var alu14 = (alu12+(gidx1*4608)+(lidx0*1152)+alu13);
  var val24 = data1[alu14];
  var alu15 = (alu14+1);
  var val25 = data1[alu15];
  var alu16 = (alu14+2);
  var val26 = data1[alu16];
  var alu17 = (alu14+384);
  var val27 = data1[alu17];
  var alu18 = (alu14+385);
  var val28 = data1[alu18];
  var alu19 = (alu14+386);
  var val29 = data1[alu19];
  var alu20 = (alu14+768);
  var val30 = data1[alu20];
  var alu21 = (alu14+769);
  var val31 = data1[alu21];
  var alu22 = (alu14+770);
  var val32 = data1[alu22];
  var alu23 = (alu12+alu13);
  var val33 = data4[alu23];
  var val34 = data4[(alu23+1)];
  var val35 = data4[(alu23+2)];
  data0[alu14] = (val24+acc0+val33);
  data0[alu15] = (val25+acc1+val34);
  data0[alu16] = (val26+acc2+val35);
  data0[alu17] = (val27+acc3+val33);
  data0[alu18] = (val28+acc4+val34);
  data0[alu19] = (val29+acc5+val35);
  data0[alu20] = (val30+acc6+val33);
  data0[alu21] = (val31+acc7+val34);
  data0[alu22] = (val32+acc8+val35);
}`;

const setupNet = async (device, safetensor) => {
    const metadata = getTensorMetadata(safetensor);
    const infinityBuf = createInfinityUniformBuf(device);

    const layouts=[device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 7, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]})]

    const buf_0 = createEmptyBuf(device, 4608000);;
    const input0 = createEmptyBuf(device, 960000);;
    const buf_1 = createWeightBuf(device, 368640, getTensorBuffer(safetensor, metadata['conv1.weight']));
    const buf_2 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['conv1.bias']));
    const buf_3 = createEmptyBuf(device, 2304000);;
    const buf_4 = createWeightBuf(device, 1769472, getTensorBuffer(safetensor, metadata['conv2.weight']));
    const buf_5 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['conv2.bias']));
    const buf_6 = createEmptyBuf(device, 6000);;
    const buf_7 = createWeightBuf(device, 2304000, getTensorBuffer(safetensor, metadata['positional_embedding']));
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
    const buf_23 = createEmptyBuf(device, 54000000);;
    const buf_24 = createWeightBuf(device, 589824, getTensorBuffer(safetensor, metadata['blocks.0.attn.out.weight']));
    const buf_25 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.0.attn.out.bias']));
    const buf_26 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.0.mlp_ln.weight']));
    const buf_27 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.0.mlp_ln.bias']));
    const buf_28 = createEmptyBuf(device, 9216000);;
    const buf_29 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.0.mlp.0.weight']));
    const buf_30 = createWeightBuf(device, 6144, getTensorBuffer(safetensor, metadata['blocks.0.mlp.0.bias']));
    const buf_31 = createEmptyBuf(device, 2304000);;
    const buf_32 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.0.mlp.2.weight']));
    const buf_33 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.0.mlp.2.bias']));
    const buf_34 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.1.attn_ln.weight']));
    const buf_35 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.1.attn_ln.bias']));
    const buf_36 = createWeightBuf(device, 589824, getTensorBuffer(safetensor, metadata['blocks.1.attn.query.weight']));
    const buf_37 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.1.attn.query.bias']));
    const buf_38 = createWeightBuf(device, 589824, getTensorBuffer(safetensor, metadata['blocks.1.attn.key.weight']));
    const buf_39 = createWeightBuf(device, 589824, getTensorBuffer(safetensor, metadata['blocks.1.attn.value.weight']));
    const buf_40 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.1.attn.value.bias']));
    const buf_41 = createWeightBuf(device, 589824, getTensorBuffer(safetensor, metadata['blocks.1.attn.out.weight']));
    const buf_42 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.1.attn.out.bias']));
    const buf_43 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.1.mlp_ln.weight']));
    const buf_44 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.1.mlp_ln.bias']));
    const buf_45 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.1.mlp.0.weight']));
    const buf_46 = createWeightBuf(device, 6144, getTensorBuffer(safetensor, metadata['blocks.1.mlp.0.bias']));
    const buf_47 = createEmptyBuf(device, 2304000);;
    const buf_48 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.1.mlp.2.weight']));
    const buf_49 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.1.mlp.2.bias']));
    const buf_50 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.2.attn_ln.weight']));
    const buf_51 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.2.attn_ln.bias']));
    const buf_52 = createWeightBuf(device, 589824, getTensorBuffer(safetensor, metadata['blocks.2.attn.query.weight']));
    const buf_53 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.2.attn.query.bias']));
    const buf_54 = createWeightBuf(device, 589824, getTensorBuffer(safetensor, metadata['blocks.2.attn.key.weight']));
    const buf_55 = createWeightBuf(device, 589824, getTensorBuffer(safetensor, metadata['blocks.2.attn.value.weight']));
    const buf_56 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.2.attn.value.bias']));
    const buf_57 = createWeightBuf(device, 589824, getTensorBuffer(safetensor, metadata['blocks.2.attn.out.weight']));
    const buf_58 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.2.attn.out.bias']));
    const buf_59 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.2.mlp_ln.weight']));
    const buf_60 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.2.mlp_ln.bias']));
    const buf_61 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.2.mlp.0.weight']));
    const buf_62 = createWeightBuf(device, 6144, getTensorBuffer(safetensor, metadata['blocks.2.mlp.0.bias']));
    const buf_63 = createEmptyBuf(device, 2304000);;
    const buf_64 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.2.mlp.2.weight']));
    const buf_65 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.2.mlp.2.bias']));
    const buf_66 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.3.attn_ln.weight']));
    const buf_67 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.3.attn_ln.bias']));
    const buf_68 = createWeightBuf(device, 589824, getTensorBuffer(safetensor, metadata['blocks.3.attn.query.weight']));
    const buf_69 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.3.attn.query.bias']));
    const buf_70 = createWeightBuf(device, 589824, getTensorBuffer(safetensor, metadata['blocks.3.attn.key.weight']));
    const buf_71 = createWeightBuf(device, 589824, getTensorBuffer(safetensor, metadata['blocks.3.attn.value.weight']));
    const buf_72 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.3.attn.value.bias']));
    const buf_73 = createWeightBuf(device, 589824, getTensorBuffer(safetensor, metadata['blocks.3.attn.out.weight']));
    const buf_74 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.3.attn.out.bias']));
    const buf_75 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.3.mlp_ln.weight']));
    const buf_76 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.3.mlp_ln.bias']));
    const buf_77 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.3.mlp.0.weight']));
    const buf_78 = createWeightBuf(device, 6144, getTensorBuffer(safetensor, metadata['blocks.3.mlp.0.bias']));
    const buf_79 = createEmptyBuf(device, 2304000);;
    const buf_80 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.3.mlp.2.weight']));
    const buf_81 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['blocks.3.mlp.2.bias']));
    const output0 = createEmptyBuf(device, 2304000);;
    const buf_82 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['ln_post.weight']));
    const buf_83 = createWeightBuf(device, 1536, getTensorBuffer(safetensor, metadata['ln_post.bias']));

    const gpuWriteBuffer0 = device.createBuffer({size:input0.size, usage: GPUBufferUsage.COPY_SRC | GPUBufferUsage.MAP_WRITE });

    const gpuReadBuffer0 = device.createBuffer({size:output0.size, usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ });

    const kernels = [r_8_125_16_8_80_3_3_3, r_4_125_32_4_384_3_3_3, r_1500_16_24, r_1500_16_24n1, E_125_8_4_16_3_3, r_125_8_4_16_96_3_3_4, r_125_8_4_16_96_3_3_4n1, r_125_8_4_16_96_3_3_4, r_2_125_125_3_4_4_16_3_3_4, r_375_8_375_3_4, r_375_8_375_3_4n1, E_1125_125_8_4_3, r_3_125_2_4_16_375_4_3_4, r_125_8_4_16_96_3_3_4n2, r_1500_16_24n2, r_1500_16_24n3, E_125_8_4_16_3_3n1, r_125_32_4_16_96_3_3_4, r_125_8_4_16_384_3_3_4, r_1500_16_24n2, r_1500_16_24n3, E_125_8_4_16_3_3n1, r_125_8_4_16_96_3_3_4, r_125_8_4_16_96_3_3_4n1, r_125_8_4_16_96_3_3_4, r_2_125_125_3_4_4_16_3_3_4, r_375_8_375_3_4, r_375_8_375_3_4n1, E_1125_125_8_4_3, r_3_125_2_4_16_375_4_3_4, r_125_8_4_16_96_3_3_4n3, r_1500_16_24n2, r_1500_16_24n3, E_125_8_4_16_3_3n1, r_125_32_4_16_96_3_3_4, r_125_8_4_16_384_3_3_4, r_1500_16_24n2, r_1500_16_24n3, E_125_8_4_16_3_3n1, r_125_8_4_16_96_3_3_4, r_125_8_4_16_96_3_3_4n1, r_125_8_4_16_96_3_3_4, r_2_125_125_3_4_4_16_3_3_4, r_375_8_375_3_4, r_375_8_375_3_4n1, E_1125_125_8_4_3, r_3_125_2_4_16_375_4_3_4, r_125_8_4_16_96_3_3_4n3, r_1500_16_24n2, r_1500_16_24n3, E_125_8_4_16_3_3n1, r_125_32_4_16_96_3_3_4, r_125_8_4_16_384_3_3_4, r_1500_16_24n2, r_1500_16_24n3, E_125_8_4_16_3_3n1, r_125_8_4_16_96_3_3_4, r_125_8_4_16_96_3_3_4n1, r_125_8_4_16_96_3_3_4, r_2_125_125_3_4_4_16_3_3_4, r_375_8_375_3_4, r_375_8_375_3_4n1, E_1125_125_8_4_3, r_3_125_2_4_16_375_4_3_4, r_125_8_4_16_96_3_3_4n3, r_1500_16_24n2, r_1500_16_24n3, E_125_8_4_16_3_3n1, r_125_32_4_16_96_3_3_4, r_125_8_4_16_384_3_3_4, r_1500_16_24n2, r_1500_16_24n3, E_125_8_4_16_3_3n1];
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
        addComputePass(device, commandEncoder, pipelines[1], layouts[1], infinityBuf, [buf_3, buf_0, buf_4, buf_5], [125, 4, 1]);
        addComputePass(device, commandEncoder, pipelines[2], layouts[2], infinityBuf, [buf_6, buf_3, buf_7], [1500, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[3], layouts[3], infinityBuf, [buf_8, buf_3, buf_7, buf_6], [1500, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[4], layouts[4], infinityBuf, [buf_9, buf_3, buf_7, buf_6, buf_8, buf_10, buf_11], [8, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[5], layouts[5], infinityBuf, [buf_12, buf_9, buf_13, buf_14], [8, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[6], layouts[6], infinityBuf, [buf_15, buf_9, buf_16], [8, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[7], layouts[7], infinityBuf, [buf_17, buf_9, buf_18, buf_19], [8, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[8], layouts[8], infinityBuf, [buf_20, buf_12, buf_15], [125, 125, 2]);
        addComputePass(device, commandEncoder, pipelines[9], layouts[9], infinityBuf, [buf_21, buf_20], [375, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[10], layouts[10], infinityBuf, [buf_22, buf_20, buf_21], [375, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[11], layouts[11], infinityBuf, [buf_23, buf_20, buf_21, buf_22], [125, 1125, 1]);
        addComputePass(device, commandEncoder, pipelines[12], layouts[12], infinityBuf, [buf_15, buf_23, buf_17], [125, 3, 1]);
        addComputePass(device, commandEncoder, pipelines[13], layouts[13], infinityBuf, [buf_17, buf_3, buf_7, buf_15, buf_24, buf_25], [8, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[14], layouts[14], infinityBuf, [buf_8, buf_17], [1500, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[15], layouts[15], infinityBuf, [buf_6, buf_17, buf_8], [1500, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[16], layouts[16], infinityBuf, [buf_15, buf_17, buf_8, buf_6, buf_26, buf_27], [8, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[17], layouts[17], infinityBuf, [buf_28, buf_15, buf_29, buf_30], [32, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[18], layouts[18], infinityBuf, [buf_31, buf_17, buf_28, buf_32, buf_33], [8, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[19], layouts[19], infinityBuf, [buf_6, buf_31], [1500, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[20], layouts[20], infinityBuf, [buf_8, buf_31, buf_6], [1500, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[21], layouts[21], infinityBuf, [buf_17, buf_31, buf_6, buf_8, buf_34, buf_35], [8, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[22], layouts[22], infinityBuf, [buf_15, buf_17, buf_36, buf_37], [8, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[23], layouts[23], infinityBuf, [buf_12, buf_17, buf_38], [8, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[24], layouts[24], infinityBuf, [buf_9, buf_17, buf_39, buf_40], [8, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[25], layouts[25], infinityBuf, [buf_23, buf_15, buf_12], [125, 125, 2]);
        addComputePass(device, commandEncoder, pipelines[26], layouts[26], infinityBuf, [buf_22, buf_23], [375, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[27], layouts[27], infinityBuf, [buf_21, buf_23, buf_22], [375, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[28], layouts[28], infinityBuf, [buf_20, buf_23, buf_22, buf_21], [125, 1125, 1]);
        addComputePass(device, commandEncoder, pipelines[29], layouts[29], infinityBuf, [buf_12, buf_20, buf_9], [125, 3, 1]);
        addComputePass(device, commandEncoder, pipelines[30], layouts[30], infinityBuf, [buf_9, buf_31, buf_12, buf_41, buf_42], [8, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[31], layouts[31], infinityBuf, [buf_8, buf_9], [1500, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[32], layouts[32], infinityBuf, [buf_6, buf_9, buf_8], [1500, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[33], layouts[33], infinityBuf, [buf_12, buf_9, buf_8, buf_6, buf_43, buf_44], [8, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[34], layouts[34], infinityBuf, [buf_28, buf_12, buf_45, buf_46], [32, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[35], layouts[35], infinityBuf, [buf_47, buf_9, buf_28, buf_48, buf_49], [8, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[36], layouts[36], infinityBuf, [buf_6, buf_47], [1500, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[37], layouts[37], infinityBuf, [buf_8, buf_47, buf_6], [1500, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[38], layouts[38], infinityBuf, [buf_9, buf_47, buf_6, buf_8, buf_50, buf_51], [8, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[39], layouts[39], infinityBuf, [buf_12, buf_9, buf_52, buf_53], [8, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[40], layouts[40], infinityBuf, [buf_15, buf_9, buf_54], [8, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[41], layouts[41], infinityBuf, [buf_17, buf_9, buf_55, buf_56], [8, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[42], layouts[42], infinityBuf, [buf_20, buf_12, buf_15], [125, 125, 2]);
        addComputePass(device, commandEncoder, pipelines[43], layouts[43], infinityBuf, [buf_21, buf_20], [375, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[44], layouts[44], infinityBuf, [buf_22, buf_20, buf_21], [375, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[45], layouts[45], infinityBuf, [buf_23, buf_20, buf_21, buf_22], [125, 1125, 1]);
        addComputePass(device, commandEncoder, pipelines[46], layouts[46], infinityBuf, [buf_15, buf_23, buf_17], [125, 3, 1]);
        addComputePass(device, commandEncoder, pipelines[47], layouts[47], infinityBuf, [buf_17, buf_47, buf_15, buf_57, buf_58], [8, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[48], layouts[48], infinityBuf, [buf_8, buf_17], [1500, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[49], layouts[49], infinityBuf, [buf_6, buf_17, buf_8], [1500, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[50], layouts[50], infinityBuf, [buf_15, buf_17, buf_8, buf_6, buf_59, buf_60], [8, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[51], layouts[51], infinityBuf, [buf_28, buf_15, buf_61, buf_62], [32, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[52], layouts[52], infinityBuf, [buf_63, buf_17, buf_28, buf_64, buf_65], [8, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[53], layouts[53], infinityBuf, [buf_6, buf_63], [1500, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[54], layouts[54], infinityBuf, [buf_8, buf_63, buf_6], [1500, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[55], layouts[55], infinityBuf, [buf_17, buf_63, buf_6, buf_8, buf_66, buf_67], [8, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[56], layouts[56], infinityBuf, [buf_15, buf_17, buf_68, buf_69], [8, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[57], layouts[57], infinityBuf, [buf_12, buf_17, buf_70], [8, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[58], layouts[58], infinityBuf, [buf_9, buf_17, buf_71, buf_72], [8, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[59], layouts[59], infinityBuf, [buf_23, buf_15, buf_12], [125, 125, 2]);
        addComputePass(device, commandEncoder, pipelines[60], layouts[60], infinityBuf, [buf_22, buf_23], [375, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[61], layouts[61], infinityBuf, [buf_21, buf_23, buf_22], [375, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[62], layouts[62], infinityBuf, [buf_20, buf_23, buf_22, buf_21], [125, 1125, 1]);
        addComputePass(device, commandEncoder, pipelines[63], layouts[63], infinityBuf, [buf_12, buf_20, buf_9], [125, 3, 1]);
        addComputePass(device, commandEncoder, pipelines[64], layouts[64], infinityBuf, [buf_9, buf_63, buf_12, buf_73, buf_74], [8, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[65], layouts[65], infinityBuf, [buf_8, buf_9], [1500, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[66], layouts[66], infinityBuf, [buf_6, buf_9, buf_8], [1500, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[67], layouts[67], infinityBuf, [buf_12, buf_9, buf_8, buf_6, buf_75, buf_76], [8, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[68], layouts[68], infinityBuf, [buf_28, buf_12, buf_77, buf_78], [32, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[69], layouts[69], infinityBuf, [buf_79, buf_9, buf_28, buf_80, buf_81], [8, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[70], layouts[70], infinityBuf, [buf_6, buf_79], [1500, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[71], layouts[71], infinityBuf, [buf_8, buf_79, buf_6], [1500, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[72], layouts[72], infinityBuf, [output0, buf_79, buf_6, buf_8, buf_82, buf_83], [8, 125, 1]);
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
