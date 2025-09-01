
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

const E_640_32_6_3 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_368640:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1_184320:array<f32>;
@compute @workgroup_size(32) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 640 */
  var lidx0 = i32(lindex.x); /* 32 */
  var alu0 = ((gidx0*288)+(lidx0*9));
  var val0 = data1_184320[alu0];
  var val1 = data1_184320[(alu0+1)];
  var val2 = data1_184320[(alu0+2)];
  var val3 = data1_184320[(alu0+3)];
  var val4 = data1_184320[(alu0+4)];
  var val5 = data1_184320[(alu0+5)];
  var val6 = data1_184320[(alu0+6)];
  var val7 = data1_184320[(alu0+7)];
  var val8 = data1_184320[(alu0+8)];
  var alu1 = ((gidx0*96)+(lidx0*3));
  data0_368640[(alu1+307200)] = val2;
  data0_368640[(alu1+307201)] = val5;
  data0_368640[(alu1+307202)] = val8;
  var alu5 = (-0.1666666716337204f*val2);
  var alu6 = (-0.1666666716337204f*val3);
  var alu7 = (-0.1666666716337204f*val5);
  data0_368640[(alu1+61441)] = (alu6+(-0.1666666716337204f*val4)+alu7);
  var alu9 = (-0.1666666716337204f*val6);
  var alu10 = (-0.1666666716337204f*val8);
  data0_368640[(alu1+61442)] = (alu9+(-0.1666666716337204f*val7)+alu10);
  var alu12 = (-0.1666666716337204f*val0);
  data0_368640[(alu1+61440)] = (alu12+(-0.1666666716337204f*val1)+alu5);
  var alu14 = (0.0416666679084301f*val3);
  var alu15 = (0.0416666679084301f*val6);
  var alu16 = (0.0416666679084301f*val0);
  data0_368640[(alu1+122880)] = (alu12+(0.1666666716337204f*val1)+alu5);
  var alu18 = (0.1666666716337204f*val2);
  data0_368640[(alu1+245760)] = (alu16+(-0.0833333358168602f*val1)+alu18);
  data0_368640[(alu1+184320)] = (alu16+(0.0833333358168602f*val1)+alu18);
  data0_368640[(alu1+122881)] = (alu6+(0.1666666716337204f*val4)+alu7);
  var alu22 = (0.1666666716337204f*val5);
  data0_368640[(alu1+245761)] = (alu14+(-0.0833333358168602f*val4)+alu22);
  data0_368640[(alu1+184321)] = (alu14+(0.0833333358168602f*val4)+alu22);
  data0_368640[(alu1+122882)] = (alu9+(0.1666666716337204f*val7)+alu10);
  var alu26 = (0.1666666716337204f*val8);
  data0_368640[(alu1+245762)] = (alu15+(-0.0833333358168602f*val7)+alu26);
  data0_368640[(alu1+184322)] = (alu15+(0.0833333358168602f*val7)+alu26);
  data0_368640[(alu1+1)] = (0.25f*val3);
  data0_368640[(alu1+2)] = (0.25f*val6);
  data0_368640[alu1] = (0.25f*val0);
}`;

const E_5_125_16_2_6_3 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_360000:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1_240000:array<f32>;
@compute @workgroup_size(16,2) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 125 */
  var gidx1 = i32(gindex.y); /* 5 */
  var lidx0 = i32(lindex.x); /* 16 */
  var lidx1 = i32(lindex.y); /* 2 */
  var precast0 = gidx0;
  var alu0 = (gidx0*24);
  var alu1 = (gidx1*48000);
  var alu2 = (lidx0*3000);
  var alu3 = (lidx1*12);
  var alu4 = (alu0+alu1+alu2+alu3);
  var val0 = data1_240000[alu4];
  var val1 = data1_240000[(alu4+1)];
  var val2 = data1_240000[(alu4+2)];
  var val3 = data1_240000[(alu4+3)];
  var val4 = data1_240000[(alu4+4)];
  var val5 = data1_240000[(alu4+5)];
  var val6 = data1_240000[(alu4+6)];
  var val7 = data1_240000[(alu4+7)];
  var val8 = data1_240000[(alu4+8)];
  var val9 = data1_240000[(alu4+9)];
  var val10 = data1_240000[(alu4+10)];
  var val11 = data1_240000[(alu4+11)];
  var alu5 = (alu0+alu3+alu1+alu2);
  var val12 = data1_240000[(alu5+3)];
  var val13 = data1_240000[(alu5+4)];
  var val14 = data1_240000[(alu5+7)];
  var val15 = data1_240000[(alu5+8)];
  var precast1 = (bitcast<u32>(precast0)<<1u);
  var val16 = select(0.0f, data1_240000[(alu5+12)], ((lidx1+bitcast<i32>(precast1))<249));
  var val17 = select(0.0f, data1_240000[(alu5+-1)], (0<(gidx0+lidx1)));
  var alu6 = ((gidx0*6)+(gidx1*12000)+(lidx0*750)+(lidx1*3));
  var alu7 = (-4.0f*val1);
  var alu8 = (-4.0f*val5);
  data0_360000[(alu6+60001)] = ((-4.0f*val4)+alu8+val6+val7);
  var alu10 = (-4.0f*val9);
  data0_360000[(alu6+60002)] = ((-4.0f*val8)+alu10+val10+val11);
  data0_360000[(alu6+60000)] = ((-4.0f*val0)+alu7+val2+val3);
  var alu13 = (4.0f*val4);
  data0_360000[(alu6+300001)] = (alu13+(-5.0f*val6)+val15);
  var alu15 = (4.0f*val8);
  data0_360000[(alu6+300002)] = (alu15+(-5.0f*val10)+val16);
  var alu17 = (4.0f*val0);
  data0_360000[(alu6+300000)] = (alu17+(-5.0f*val2)+val13);
  data0_360000[alu6] = ((4.0f*val17)+(-5.0f*val1)+val3);
  data0_360000[(alu6+1)] = ((4.0f*val12)+(-5.0f*val5)+val7);
  data0_360000[(alu6+2)] = ((4.0f*val14)+(-5.0f*val9)+val11);
  data0_360000[(alu6+120001)] = (((alu13+alu8)-val6)+val7);
  data0_360000[(alu6+120002)] = (((alu15+alu10)-val10)+val11);
  data0_360000[(alu6+120000)] = (((alu17+alu7)-val2)+val3);
  data0_360000[(alu6+180001)] = (((-2.0f*val4)-val5)+(2.0f*val6)+val7);
  data0_360000[(alu6+180002)] = (((-2.0f*val8)-val9)+(2.0f*val10)+val11);
  data0_360000[(alu6+180000)] = (((-2.0f*val0)-val1)+(2.0f*val2)+val3);
  data0_360000[(alu6+240001)] = (((2.0f*val4)-val5)+(-2.0f*val6)+val7);
  data0_360000[(alu6+240002)] = (((2.0f*val8)-val9)+(-2.0f*val10)+val11);
  data0_360000[(alu6+240000)] = (((2.0f*val0)-val1)+(-2.0f*val2)+val3);
}`;

const r_2_16_125_3_16_2_3_3_20_4 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_3456000:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1_368640:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2_360000:array<f32>;
@compute @workgroup_size(3,16,2) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var acc0: array<f32,9>;
  var gidx0 = i32(gindex.x); /* 125 */
  var gidx1 = i32(gindex.y); /* 16 */
  var gidx2 = i32(gindex.z); /* 2 */
  var lidx0 = i32(lindex.x); /* 3 */
  var lidx1 = i32(lindex.y); /* 16 */
  var lidx2 = i32(lindex.z); /* 2 */
  var alu0 = (lidx2*3);
  var alu1 = (gidx0*6);
  acc0[0] = 0.0f;
  acc0[1] = 0.0f;
  acc0[2] = 0.0f;
  acc0[3] = 0.0f;
  acc0[4] = 0.0f;
  acc0[5] = 0.0f;
  acc0[6] = 0.0f;
  acc0[7] = 0.0f;
  acc0[8] = 0.0f;
  for (var ridx1008 = 0; ridx1008 < 20; ridx1008++) {
    var precast0 = ridx1008;
    var alu11 = (alu1+(gidx2*180000)+(lidx0*60000)+alu0+(ridx1008*3000));
    var val0 = data2_360000[alu11];
    var val1 = data2_360000[(alu11+1)];
    var val2 = data2_360000[(alu11+2)];
    var val3 = data2_360000[(alu11+750)];
    var val4 = data2_360000[(alu11+751)];
    var val5 = data2_360000[(alu11+752)];
    var val6 = data2_360000[(alu11+1500)];
    var val7 = data2_360000[(alu11+1501)];
    var val8 = data2_360000[(alu11+1502)];
    var val9 = data2_360000[(alu11+2250)];
    var val10 = data2_360000[(alu11+2251)];
    var val11 = data2_360000[(alu11+2252)];
    var precast1 = (bitcast<u32>(precast0)<<2u);
    var alu12 = ((gidx1*3840)+(gidx2*184320)+(lidx0*61440)+(lidx1*240)+bitcast<i32>(precast1));
    var val12 = data1_368640[alu12];
    var val13 = data1_368640[(alu12+1)];
    var val14 = data1_368640[(alu12+2)];
    var val15 = data1_368640[(alu12+3)];
    var val16 = data1_368640[(alu12+80)];
    var val17 = data1_368640[(alu12+81)];
    var val18 = data1_368640[(alu12+82)];
    var val19 = data1_368640[(alu12+83)];
    var val20 = data1_368640[(alu12+160)];
    var val21 = data1_368640[(alu12+161)];
    var val22 = data1_368640[(alu12+162)];
    var val23 = data1_368640[(alu12+163)];
    acc0[1] = (acc0[1]+(val16*val0)+(val17*val3)+(val18*val6)+(val19*val9));
    acc0[4] = (acc0[4]+(val16*val1)+(val17*val4)+(val18*val7)+(val19*val10));
    acc0[7] = (acc0[7]+(val16*val2)+(val17*val5)+(val18*val8)+(val19*val11));
    acc0[2] = (acc0[2]+(val20*val0)+(val21*val3)+(val22*val6)+(val23*val9));
    acc0[5] = (acc0[5]+(val20*val1)+(val21*val4)+(val22*val7)+(val23*val10));
    acc0[8] = (acc0[8]+(val20*val2)+(val21*val5)+(val22*val8)+(val23*val11));
    acc0[3] = (acc0[3]+(val12*val1)+(val13*val4)+(val14*val7)+(val15*val10));
    acc0[6] = (acc0[6]+(val12*val2)+(val13*val5)+(val14*val8)+(val15*val11));
    acc0[0] = (acc0[0]+(val12*val0)+(val13*val3)+(val14*val6)+(val15*val9));
  }
  var alu23 = ((gidx1*36000)+(gidx2*1728000)+alu1+(lidx0*576000)+(lidx1*2250)+alu0);
  data0_3456000[alu23] = acc0[0];
  data0_3456000[(alu23+1)] = acc0[3];
  data0_3456000[(alu23+2)] = acc0[6];
  data0_3456000[(alu23+750)] = acc0[1];
  data0_3456000[(alu23+751)] = acc0[4];
  data0_3456000[(alu23+752)] = acc0[7];
  data0_3456000[(alu23+1500)] = acc0[2];
  data0_3456000[(alu23+1501)] = acc0[5];
  data0_3456000[(alu23+1502)] = acc0[8];
}`;

const E_48_125_16_8_3 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_2304000:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1_3456000:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2_768:array<f32>;
@compute @workgroup_size(16,8) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 125 */
  var gidx1 = i32(gindex.y); /* 48 */
  var lidx0 = i32(lindex.x); /* 16 */
  var lidx1 = i32(lindex.y); /* 8 */
  var precast0 = gidx1;
  var alu0 = ((gidx0*6)+(gidx1*12000)+(lidx0*750));
  var alu1 = (lidx1*3);
  var alu2 = (alu1+1);
  var alu3 = (alu1+2);
  var precast1 = (bitcast<u32>(precast0)<<4u);
  var val0 = data2_768[(lidx0+bitcast<i32>(precast1))];
  var alu4 = (alu0+(alu2>>2u));
  var val1 = data1_3456000[alu4];
  var val2 = data1_3456000[(alu4+576000)];
  var val3 = data1_3456000[(alu4+1152000)];
  var val4 = data1_3456000[(alu4+1728000)];
  var val5 = data1_3456000[(alu4+2304000)];
  var val6 = data1_3456000[(alu4+2880000)];
  var alu5 = (alu0+(alu3>>2u));
  var val7 = data1_3456000[alu5];
  var val8 = data1_3456000[(alu5+576000)];
  var val9 = data1_3456000[(alu5+1152000)];
  var val10 = data1_3456000[(alu5+1728000)];
  var val11 = data1_3456000[(alu5+2304000)];
  var val12 = data1_3456000[(alu5+2880000)];
  var alu6 = (alu0+(alu1>>2u));
  var val13 = data1_3456000[alu6];
  var val14 = data1_3456000[(alu6+576000)];
  var val15 = data1_3456000[(alu6+1152000)];
  var val16 = data1_3456000[(alu6+1728000)];
  var val17 = data1_3456000[(alu6+2304000)];
  var val18 = data1_3456000[(alu6+2880000)];
  var alu7 = ((gidx0*24)+(gidx1*48000)+(lidx0*3000)+alu1);
  var alu8 = (alu2&3);
  var alu9 = (alu8<3);
  var alu10 = (alu8==1);
  var alu11 = (alu8==2);
  var alu12 = (alu3&3);
  var alu13 = (alu12<3);
  var alu14 = (alu12==1);
  var alu15 = (alu12==2);
  var alu16 = (alu1&3);
  var alu17 = (alu16<3);
  var alu18 = (alu16==1);
  var alu19 = (alu16==2);
  var alu20 = select(0.0f,1.0f,(alu8<1));
  var alu21 = select(-8.0f,0.0f,alu9);
  var alu22 = select(-1.0f,0.0f,alu9);
  var alu23 = select(1.0f,0.0f,alu9);
  var alu24 = select(8.0f,0.0f,alu9);
  var alu25 = select(0.0f,1.0f,(alu12<1));
  var alu26 = select(-8.0f,0.0f,alu13);
  var alu27 = select(-1.0f,0.0f,alu13);
  var alu28 = select(1.0f,0.0f,alu13);
  var alu29 = select(8.0f,0.0f,alu13);
  var alu30 = select(0.0f,1.0f,(alu16<1));
  var alu31 = select(-8.0f,0.0f,alu17);
  var alu32 = select(-1.0f,0.0f,alu17);
  var alu33 = select(1.0f,0.0f,alu17);
  var alu34 = select(8.0f,0.0f,alu17);
  var alu35 = select(0.0f,-2.0f,alu10);
  var alu36 = select(0.0f,-1.0f,alu10);
  var alu37 = select(0.0f,1.0f,alu10);
  var alu38 = select(0.0f,2.0f,alu10);
  var alu39 = select(0.0f,1.0f,alu11);
  var alu40 = select(0.0f,4.0f,alu11);
  data0_2304000[(alu7+1)] = ((alu20*val1)+((alu20+alu37+alu39+alu23)*val2)+((alu20+alu36+alu39+alu22)*val3)+((alu20+alu38+alu40+alu24)*val4)+((alu20+alu35+alu40+alu21)*val5)+(alu23*val6)+val0);
  var alu42 = select(0.0f,-2.0f,alu14);
  var alu43 = select(0.0f,-1.0f,alu14);
  var alu44 = select(0.0f,1.0f,alu14);
  var alu45 = select(0.0f,2.0f,alu14);
  var alu46 = select(0.0f,1.0f,alu15);
  var alu47 = select(0.0f,4.0f,alu15);
  data0_2304000[(alu7+2)] = ((alu25*val7)+((alu25+alu44+alu46+alu28)*val8)+((alu25+alu43+alu46+alu27)*val9)+((alu25+alu45+alu47+alu29)*val10)+((alu25+alu42+alu47+alu26)*val11)+(alu28*val12)+val0);
  var alu49 = select(0.0f,-2.0f,alu18);
  var alu50 = select(0.0f,-1.0f,alu18);
  var alu51 = select(0.0f,1.0f,alu18);
  var alu52 = select(0.0f,2.0f,alu18);
  var alu53 = select(0.0f,1.0f,alu19);
  var alu54 = select(0.0f,4.0f,alu19);
  data0_2304000[alu7] = ((alu30*val13)+((alu30+alu51+alu53+alu33)*val14)+((alu30+alu50+alu53+alu32)*val15)+((alu30+alu52+alu54+alu34)*val16)+((alu30+alu49+alu54+alu31)*val17)+(alu33*val18)+val0);
}`;

const E_24000_32_3 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_2304000:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1_2304000:array<f32>;
@compute @workgroup_size(32) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 24000 */
  var lidx0 = i32(lindex.x); /* 32 */
  var alu0 = ((gidx0*96)+(lidx0*3));
  var val0 = data1_2304000[alu0];
  var alu1 = (alu0+1);
  var val1 = data1_2304000[alu1];
  var alu2 = (alu0+2);
  var val2 = data1_2304000[alu2];
  data0_2304000[alu1] = ((1/(1.0f+exp2(((val1+(0.044715f*val1*val1*val1))*-2.302208198144325f))))*val1);
  data0_2304000[alu2] = ((1/(1.0f+exp2(((val2+(0.044715f*val2*val2*val2))*-2.302208198144325f))))*val2);
  data0_2304000[alu0] = ((1/(1.0f+exp2(((val0+(0.044715f*val0*val0*val0))*-2.302208198144325f))))*val0);
}`;

const r_8_125_32_4_3_3_768_3 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_1152000:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1_2304000:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2_1769472:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3_768:array<f32>;
@compute @workgroup_size(32,4) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var acc0: array<f32,9>;
  var gidx0 = i32(gindex.x); /* 125 */
  var gidx1 = i32(gindex.y); /* 8 */
  var lidx0 = i32(lindex.x); /* 32 */
  var lidx1 = i32(lindex.y); /* 4 */
  acc0[0] = 0.0f;
  acc0[1] = 0.0f;
  acc0[2] = 0.0f;
  acc0[3] = 0.0f;
  acc0[4] = 0.0f;
  acc0[5] = 0.0f;
  acc0[6] = 0.0f;
  acc0[7] = 0.0f;
  acc0[8] = 0.0f;
  for (var ridx1006 = 0; ridx1006 < 768; ridx1006++) {
    var alu9 = ((gidx1*221184)+(lidx0*6912)+(ridx1006*3));
    var val0 = data2_1769472[alu9];
    var val1 = data2_1769472[(alu9+1)];
    var val2 = data2_1769472[(alu9+2)];
    var val3 = data2_1769472[(alu9+2304)];
    var val4 = data2_1769472[(alu9+2305)];
    var val5 = data2_1769472[(alu9+2306)];
    var val6 = data2_1769472[(alu9+4608)];
    var val7 = data2_1769472[(alu9+4609)];
    var val8 = data2_1769472[(alu9+4610)];
    var alu10 = ((gidx0*24)+(lidx1*6)+(ridx1006*3000));
    var val9 = data1_2304000[alu10];
    var val10 = select(0.0f, data1_2304000[(alu10+-1)], (0<(gidx0+lidx1)));
    var val11 = data1_2304000[(alu10+1)];
    var val12 = data1_2304000[(alu10+2)];
    var val13 = data1_2304000[(alu10+3)];
    var val14 = data1_2304000[(alu10+4)];
    var val15 = data1_2304000[(alu10+5)];
    acc0[3] = (acc0[3]+(val11*val0)+(val12*val1)+(val13*val2));
    acc0[4] = (acc0[4]+(val11*val3)+(val12*val4)+(val13*val5));
    acc0[5] = (acc0[5]+(val11*val6)+(val12*val7)+(val13*val8));
    acc0[6] = (acc0[6]+(val13*val0)+(val14*val1)+(val15*val2));
    acc0[7] = (acc0[7]+(val13*val3)+(val14*val4)+(val15*val5));
    acc0[8] = (acc0[8]+(val13*val6)+(val14*val7)+(val15*val8));
    acc0[0] = (acc0[0]+(val10*val0)+(val9*val1)+(val11*val2));
    acc0[1] = (acc0[1]+(val10*val3)+(val9*val4)+(val11*val5));
    acc0[2] = (acc0[2]+(val10*val6)+(val9*val7)+(val11*val8));
  }
  var alu21 = ((gidx1*96)+(lidx0*3));
  var val16 = data3_768[alu21];
  var val17 = data3_768[(alu21+1)];
  var val18 = data3_768[(alu21+2)];
  var alu22 = ((gidx0*12)+(gidx1*144000)+(lidx0*4500)+(lidx1*3));
  data0_1152000[alu22] = (acc0[0]+val16);
  data0_1152000[(alu22+1)] = (acc0[3]+val16);
  data0_1152000[(alu22+2)] = (acc0[6]+val16);
  data0_1152000[(alu22+1500)] = (acc0[1]+val17);
  data0_1152000[(alu22+1501)] = (acc0[4]+val17);
  data0_1152000[(alu22+1502)] = (acc0[7]+val17);
  data0_1152000[(alu22+3000)] = (acc0[2]+val18);
  data0_1152000[(alu22+3001)] = (acc0[5]+val18);
  data0_1152000[(alu22+3002)] = (acc0[8]+val18);
}`;

const r_1500_16_48 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
var<workgroup> temp0: array<f32,16>;
@group(0) @binding(1)var<storage,read_write>data0_1500:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1_1152000:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2_1152000:array<f32>;
@compute @workgroup_size(16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var acc0: array<f32,1>;
  var acc1: array<f32,1>;
  var gidx0 = i32(gindex.x); /* 1500 */
  var lidx0 = i32(lindex.x); /* 16 */
  acc1[0] = 0.0f;
  acc0[0] = 0.0f;
  for (var ridx1002 = 0; ridx1002 < 48; ridx1002++) {
    var val0 = data2_1152000[((gidx0*768)+(lidx0*48)+ridx1002)];
    var val1 = data1_1152000[(gidx0+(lidx0*72000)+(ridx1002*1500))];
    acc0[0] = (acc0[0]+((1/(1.0f+exp2(((val1+(0.044715f*val1*val1*val1))*-2.302208198144325f))))*val1)+val0);
  }
  temp0[lidx0] = acc0[0];
  workgroupBarrier();
  if (((bool(lidx0))!=true)) {
    for (var ridx1101 = 0; ridx1101 < 16; ridx1101++) {
      var val2 = temp0[ridx1101];
      acc1[0] = (acc1[0]+val2);
    }
    data0_1500[gidx0] = (acc1[0]*0.0013020833333333333f);
  }
}`;

const r_1500_16_48n1 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
var<workgroup> temp0: array<f32,16>;
@group(0) @binding(1)var<storage,read_write>data0_1500:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1_1152000:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2_1152000:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3_1500:array<f32>;
@compute @workgroup_size(16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var acc0: array<f32,1>;
  var acc1: array<f32,1>;
  var gidx0 = i32(gindex.x); /* 1500 */
  var lidx0 = i32(lindex.x); /* 16 */
  acc1[0] = 0.0f;
  acc0[0] = 0.0f;
  var val0 = data3_1500[gidx0];
  for (var ridx1002 = 0; ridx1002 < 48; ridx1002++) {
    var val1 = data2_1152000[((gidx0*768)+(lidx0*48)+ridx1002)];
    var val2 = data1_1152000[(gidx0+(lidx0*72000)+(ridx1002*1500))];
    var alu2 = ((((1/(1.0f+exp2(((val2+(0.044715f*val2*val2*val2))*-2.302208198144325f))))*val2)+val1)-val0);
    acc0[0] = (acc0[0]+(alu2*alu2));
  }
  temp0[lidx0] = acc0[0];
  workgroupBarrier();
  if (((bool(lidx0))!=true)) {
    for (var ridx1101 = 0; ridx1101 < 16; ridx1101++) {
      var val3 = temp0[ridx1101];
      acc1[0] = (acc1[0]+val3);
    }
    data0_1500[gidx0] = (1/sqrt(((acc1[0]*0.0013020833333333333f)+1e-05f)));
  }
}`;

const E_125_16_4_16_3_3 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_1152000:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1_1152000:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2_1152000:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3_1500:array<f32>;
@group(0) @binding(5)var<storage,read_write>data4_1500:array<f32>;
@group(0) @binding(6)var<storage,read_write>data5_768:array<f32>;
@group(0) @binding(7)var<storage,read_write>data6_768:array<f32>;
@compute @workgroup_size(4,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 16 */
  var gidx1 = i32(gindex.y); /* 125 */
  var lidx0 = i32(lindex.x); /* 4 */
  var lidx1 = i32(lindex.y); /* 16 */
  var alu0 = (gidx0*48);
  var alu1 = (gidx1*12);
  var alu2 = (lidx0*3);
  var alu3 = (alu1+alu2);
  var val0 = data3_1500[alu3];
  var val1 = data4_1500[alu3];
  var alu4 = (alu3+1);
  var val2 = data3_1500[alu4];
  var val3 = data4_1500[alu4];
  var alu5 = (alu3+2);
  var val4 = data3_1500[alu5];
  var val5 = data4_1500[alu5];
  var alu6 = (lidx1*3);
  var alu7 = (alu0+(gidx1*9216)+(lidx0*2304)+alu6);
  var val6 = data2_1152000[alu7];
  var alu8 = (alu7+1);
  var val7 = data2_1152000[alu8];
  var alu9 = (alu7+2);
  var val8 = data2_1152000[alu9];
  var alu10 = (alu7+768);
  var val9 = data2_1152000[alu10];
  var alu11 = (alu7+769);
  var val10 = data2_1152000[alu11];
  var alu12 = (alu7+770);
  var val11 = data2_1152000[alu12];
  var alu13 = (alu7+1536);
  var val12 = data2_1152000[alu13];
  var alu14 = (alu7+1537);
  var val13 = data2_1152000[alu14];
  var alu15 = (alu7+1538);
  var val14 = data2_1152000[alu15];
  var alu16 = (alu0+alu6);
  var val15 = data5_768[alu16];
  var val16 = data6_768[alu16];
  var alu17 = (alu16+1);
  var val17 = data5_768[alu17];
  var val18 = data6_768[alu17];
  var alu18 = (alu16+2);
  var val19 = data5_768[alu18];
  var val20 = data6_768[alu18];
  var alu19 = ((gidx0*72000)+alu1+alu2+(lidx1*4500));
  var val21 = data1_1152000[alu19];
  var val22 = data1_1152000[(alu19+1)];
  var val23 = data1_1152000[(alu19+2)];
  var val24 = data1_1152000[(alu19+1500)];
  var val25 = data1_1152000[(alu19+1501)];
  var val26 = data1_1152000[(alu19+1502)];
  var val27 = data1_1152000[(alu19+3000)];
  var val28 = data1_1152000[(alu19+3001)];
  var val29 = data1_1152000[(alu19+3002)];
  data0_1152000[alu10] = ((((((1/(1.0f+exp2(((val22+(0.044715f*val22*val22*val22))*-2.302208198144325f))))*val22)+val9)-val2)*val3*val15)+val16);
  data0_1152000[alu13] = ((((((1/(1.0f+exp2(((val23+(0.044715f*val23*val23*val23))*-2.302208198144325f))))*val23)+val12)-val4)*val5*val15)+val16);
  data0_1152000[alu8] = ((((((1/(1.0f+exp2(((val24+(0.044715f*val24*val24*val24))*-2.302208198144325f))))*val24)+val7)-val0)*val1*val17)+val18);
  data0_1152000[alu11] = ((((((1/(1.0f+exp2(((val25+(0.044715f*val25*val25*val25))*-2.302208198144325f))))*val25)+val10)-val2)*val3*val17)+val18);
  data0_1152000[alu14] = ((((((1/(1.0f+exp2(((val26+(0.044715f*val26*val26*val26))*-2.302208198144325f))))*val26)+val13)-val4)*val5*val17)+val18);
  data0_1152000[alu9] = ((((((1/(1.0f+exp2(((val27+(0.044715f*val27*val27*val27))*-2.302208198144325f))))*val27)+val8)-val0)*val1*val19)+val20);
  data0_1152000[alu12] = ((((((1/(1.0f+exp2(((val28+(0.044715f*val28*val28*val28))*-2.302208198144325f))))*val28)+val11)-val2)*val3*val19)+val20);
  data0_1152000[alu15] = ((((((1/(1.0f+exp2(((val29+(0.044715f*val29*val29*val29))*-2.302208198144325f))))*val29)+val14)-val4)*val5*val19)+val20);
  data0_1152000[alu7] = ((((((1/(1.0f+exp2(((val21+(0.044715f*val21*val21*val21))*-2.302208198144325f))))*val21)+val6)-val0)*val1*val15)+val16);
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

const r_3_125_125_4_4_4_3_3_16_4 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_27000000:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1_1152000:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2_1152000:array<f32>;
@compute @workgroup_size(4,4,4) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var acc0: array<f32,9>;
  var gidx0 = i32(gindex.x); /* 125 */
  var gidx1 = i32(gindex.y); /* 125 */
  var gidx2 = i32(gindex.z); /* 3 */
  var lidx0 = i32(lindex.x); /* 4 */
  var lidx1 = i32(lindex.y); /* 4 */
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
  var precast2 = (bitcast<u32>(precast0)<<8u);
  var cast0 = bitcast<i32>(precast2);
  var precast3 = (bitcast<u32>(precast1)<<6u);
  var cast1 = bitcast<i32>(precast3);
  for (var ridx1008 = 0; ridx1008 < 16; ridx1008++) {
    var precast4 = ridx1008;
    var precast5 = (bitcast<u32>(precast4)<<2u);
    var cast2 = bitcast<i32>(precast5);
    var alu9 = ((gidx0*9216)+cast0+cast1+(lidx2*2304)+cast2);
    var val0 = data2_1152000[alu9];
    var val1 = data2_1152000[(alu9+1)];
    var val2 = data2_1152000[(alu9+2)];
    var val3 = data2_1152000[(alu9+3)];
    var val4 = data2_1152000[(alu9+768)];
    var val5 = data2_1152000[(alu9+769)];
    var val6 = data2_1152000[(alu9+770)];
    var val7 = data2_1152000[(alu9+771)];
    var val8 = data2_1152000[(alu9+1536)];
    var val9 = data2_1152000[(alu9+1537)];
    var val10 = data2_1152000[(alu9+1538)];
    var val11 = data2_1152000[(alu9+1539)];
    var alu10 = ((gidx1*9216)+cast0+cast1+(lidx1*2304)+cast2);
    var val12 = data1_1152000[alu10];
    var val13 = data1_1152000[(alu10+1)];
    var val14 = data1_1152000[(alu10+2)];
    var val15 = data1_1152000[(alu10+3)];
    var val16 = data1_1152000[(alu10+768)];
    var val17 = data1_1152000[(alu10+769)];
    var val18 = data1_1152000[(alu10+770)];
    var val19 = data1_1152000[(alu10+771)];
    var val20 = data1_1152000[(alu10+1536)];
    var val21 = data1_1152000[(alu10+1537)];
    var val22 = data1_1152000[(alu10+1538)];
    var val23 = data1_1152000[(alu10+1539)];
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
  var alu21 = ((gidx1*18000)+(gidx2*9000000)+(gidx0*12)+(lidx0*2250000)+(lidx1*4500)+(lidx2*3));
  data0_27000000[alu21] = (acc0[0]*0.125f);
  data0_27000000[(alu21+1500)] = (acc0[1]*0.125f);
  data0_27000000[(alu21+3000)] = (acc0[2]*0.125f);
  data0_27000000[(alu21+1)] = (acc0[3]*0.125f);
  data0_27000000[(alu21+1501)] = (acc0[4]*0.125f);
  data0_27000000[(alu21+3001)] = (acc0[5]*0.125f);
  data0_27000000[(alu21+2)] = (acc0[6]*0.125f);
  data0_27000000[(alu21+1502)] = (acc0[7]*0.125f);
  data0_27000000[(alu21+3002)] = (acc0[8]*0.125f);
}`;

const r_375_16_3_375_4 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_18000:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1_27000000:array<f32>;
@compute @workgroup_size(16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var acc0: array<f32,3>;
  var gidx0 = i32(gindex.x); /* 375 */
  var lidx0 = i32(lindex.x); /* 16 */
  acc0[0] = (f32(-INFINITY));
  acc0[1] = (f32(-INFINITY));
  acc0[2] = (f32(-INFINITY));
  for (var ridx1003 = 0; ridx1003 < 375; ridx1003++) {
    var precast0 = ridx1003;
    var precast1 = (bitcast<u32>(precast0)<<2u);
    var alu3 = ((gidx0*72000)+(lidx0*4500)+bitcast<i32>(precast1));
    var val0 = data1_27000000[alu3];
    var val1 = data1_27000000[(alu3+1)];
    var val2 = data1_27000000[(alu3+2)];
    var val3 = data1_27000000[(alu3+3)];
    var val4 = data1_27000000[(alu3+1500)];
    var val5 = data1_27000000[(alu3+1501)];
    var val6 = data1_27000000[(alu3+1502)];
    var val7 = data1_27000000[(alu3+1503)];
    var val8 = data1_27000000[(alu3+3000)];
    var val9 = data1_27000000[(alu3+3001)];
    var val10 = data1_27000000[(alu3+3002)];
    var val11 = data1_27000000[(alu3+3003)];
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
  var alu20 = ((gidx0*48)+(lidx0*3));
  data0_18000[alu20] = acc0[0];
  data0_18000[(alu20+1)] = acc0[1];
  data0_18000[(alu20+2)] = acc0[2];
}`;

const r_375_16_3_375_4n1 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_18000:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1_27000000:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2_18000:array<f32>;
@compute @workgroup_size(16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var acc0: array<f32,3>;
  var gidx0 = i32(gindex.x); /* 375 */
  var lidx0 = i32(lindex.x); /* 16 */
  var alu0 = ((gidx0*48)+(lidx0*3));
  var alu1 = (alu0+2);
  var alu2 = (alu0+1);
  var val0 = data2_18000[alu2];
  var val1 = data2_18000[alu1];
  var val2 = data2_18000[alu0];
  acc0[0] = 0.0f;
  acc0[1] = 0.0f;
  acc0[2] = 0.0f;
  for (var ridx1003 = 0; ridx1003 < 375; ridx1003++) {
    var precast0 = ridx1003;
    var precast1 = (bitcast<u32>(precast0)<<2u);
    var alu6 = ((gidx0*72000)+(lidx0*4500)+bitcast<i32>(precast1));
    var val3 = data1_27000000[alu6];
    var val4 = data1_27000000[(alu6+1)];
    var val5 = data1_27000000[(alu6+2)];
    var val6 = data1_27000000[(alu6+3)];
    var val7 = data1_27000000[(alu6+1500)];
    var val8 = data1_27000000[(alu6+1501)];
    var val9 = data1_27000000[(alu6+1502)];
    var val10 = data1_27000000[(alu6+1503)];
    var val11 = data1_27000000[(alu6+3000)];
    var val12 = data1_27000000[(alu6+3001)];
    var val13 = data1_27000000[(alu6+3002)];
    var val14 = data1_27000000[(alu6+3003)];
    acc0[1] = (acc0[1]+exp2(((val7-val0)*1.4426950408889634f))+exp2(((val8-val0)*1.4426950408889634f))+exp2(((val9-val0)*1.4426950408889634f))+exp2(((val10-val0)*1.4426950408889634f)));
    acc0[2] = (acc0[2]+exp2(((val11-val1)*1.4426950408889634f))+exp2(((val12-val1)*1.4426950408889634f))+exp2(((val13-val1)*1.4426950408889634f))+exp2(((val14-val1)*1.4426950408889634f)));
    acc0[0] = (acc0[0]+exp2(((val3-val2)*1.4426950408889634f))+exp2(((val4-val2)*1.4426950408889634f))+exp2(((val5-val2)*1.4426950408889634f))+exp2(((val6-val2)*1.4426950408889634f)));
  }
  data0_18000[alu2] = (1/acc0[1]);
  data0_18000[alu1] = (1/acc0[2]);
  data0_18000[alu0] = (1/acc0[0]);
}`;

const E_1125_125_16_4_3 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_27000000:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1_27000000:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2_18000:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3_18000:array<f32>;
@compute @workgroup_size(16,4) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 125 */
  var gidx1 = i32(gindex.y); /* 1125 */
  var lidx0 = i32(lindex.x); /* 16 */
  var lidx1 = i32(lindex.y); /* 4 */
  var precast0 = gidx1;
  var alu0 = ((gidx0*12)+(gidx1*24000)+(lidx0*1500)+(lidx1*3));
  var val0 = data1_27000000[alu0];
  var alu1 = (alu0+1);
  var val1 = data1_27000000[alu1];
  var alu2 = (alu0+2);
  var val2 = data1_27000000[alu2];
  var precast1 = (bitcast<u32>(precast0)<<4u);
  var alu3 = (lidx0+bitcast<i32>(precast1));
  var val3 = data2_18000[alu3];
  var val4 = data3_18000[alu3];
  data0_27000000[alu1] = (exp2(((val1-val3)*1.4426950408889634f))*val4);
  data0_27000000[alu2] = (exp2(((val2-val3)*1.4426950408889634f))*val4);
  data0_27000000[alu0] = (exp2(((val0-val3)*1.4426950408889634f))*val4);
}`;

const r_6_125_2_4_16_4_3_375_4 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_1152000:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1_27000000:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2_1152000:array<f32>;
@compute @workgroup_size(2,4,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var acc0: array<f32,12>;
  var gidx0 = i32(gindex.x); /* 125 */
  var gidx1 = i32(gindex.y); /* 6 */
  var lidx0 = i32(lindex.x); /* 2 */
  var lidx1 = i32(lindex.y); /* 4 */
  var lidx2 = i32(lindex.z); /* 16 */
  var precast0 = lidx2;
  var precast1 = (bitcast<u32>(precast0)<<2u);
  var cast0 = bitcast<i32>(precast1);
  var precast2 = gidx1;
  var precast3 = lidx0;
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
  var precast4 = (bitcast<u32>(precast2)<<7u);
  var precast5 = (bitcast<u32>(precast3)<<6u);
  for (var ridx1007 = 0; ridx1007 < 375; ridx1007++) {
    var precast6 = ridx1007;
    var alu12 = (bitcast<i32>(precast4)+bitcast<i32>(precast5)+cast0+(ridx1007*3072));
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
    var val12 = data2_1152000[(alu12+2304)];
    var val13 = data2_1152000[(alu12+2305)];
    var val14 = data2_1152000[(alu12+2306)];
    var val15 = data2_1152000[(alu12+2307)];
    var precast7 = (bitcast<u32>(precast6)<<2u);
    var alu13 = ((gidx0*18000)+(gidx1*4500000)+(lidx0*2250000)+(lidx1*4500)+bitcast<i32>(precast7));
    var val16 = data1_27000000[alu13];
    var val17 = data1_27000000[(alu13+1)];
    var val18 = data1_27000000[(alu13+2)];
    var val19 = data1_27000000[(alu13+3)];
    var val20 = data1_27000000[(alu13+1500)];
    var val21 = data1_27000000[(alu13+1501)];
    var val22 = data1_27000000[(alu13+1502)];
    var val23 = data1_27000000[(alu13+1503)];
    var val24 = data1_27000000[(alu13+3000)];
    var val25 = data1_27000000[(alu13+3001)];
    var val26 = data1_27000000[(alu13+3002)];
    var val27 = data1_27000000[(alu13+3003)];
    acc0[1] = (acc0[1]+(val20*val0)+(val21*val4)+(val22*val8)+(val23*val12));
    acc0[4] = (acc0[4]+(val20*val1)+(val21*val5)+(val22*val9)+(val23*val13));
    acc0[7] = (acc0[7]+(val20*val2)+(val21*val6)+(val22*val10)+(val23*val14));
    acc0[10] = (acc0[10]+(val20*val3)+(val21*val7)+(val22*val11)+(val23*val15));
    acc0[2] = (acc0[2]+(val24*val0)+(val25*val4)+(val26*val8)+(val27*val12));
    acc0[5] = (acc0[5]+(val24*val1)+(val25*val5)+(val26*val9)+(val27*val13));
    acc0[8] = (acc0[8]+(val24*val2)+(val25*val6)+(val26*val10)+(val27*val14));
    acc0[11] = (acc0[11]+(val24*val3)+(val25*val7)+(val26*val11)+(val27*val15));
    acc0[0] = (acc0[0]+(val16*val0)+(val17*val4)+(val18*val8)+(val19*val12));
    acc0[3] = (acc0[3]+(val16*val1)+(val17*val5)+(val18*val9)+(val19*val13));
    acc0[6] = (acc0[6]+(val16*val2)+(val17*val6)+(val18*val10)+(val19*val14));
    acc0[9] = (acc0[9]+(val16*val3)+(val17*val7)+(val18*val11)+(val19*val15));
  }
  var alu27 = ((gidx0*768)+(gidx1*192000)+(lidx0*96000)+(lidx1*192)+cast0);
  data0_1152000[alu27] = acc0[0];
  data0_1152000[(alu27+1)] = acc0[3];
  data0_1152000[(alu27+2)] = acc0[6];
  data0_1152000[(alu27+3)] = acc0[9];
  data0_1152000[(alu27+64)] = acc0[1];
  data0_1152000[(alu27+65)] = acc0[4];
  data0_1152000[(alu27+66)] = acc0[7];
  data0_1152000[(alu27+67)] = acc0[10];
  data0_1152000[(alu27+128)] = acc0[2];
  data0_1152000[(alu27+129)] = acc0[5];
  data0_1152000[(alu27+130)] = acc0[8];
  data0_1152000[(alu27+131)] = acc0[11];
}`;

const r_125_16_4_16_3_3_192_4n2 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_1152000:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1_1152000:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2_1152000:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3_1152000:array<f32>;
@group(0) @binding(5)var<storage,read_write>data4_589824:array<f32>;
@group(0) @binding(6)var<storage,read_write>data5_768:array<f32>;
@compute @workgroup_size(4,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var acc0: array<f32,9>;
  var gidx0 = i32(gindex.x); /* 16 */
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
  for (var ridx1006 = 0; ridx1006 < 192; ridx1006++) {
    var precast0 = ridx1006;
    var precast1 = (bitcast<u32>(precast0)<<2u);
    var alu9 = ((gidx0*36864)+(lidx1*2304)+bitcast<i32>(precast1));
    var val0 = data4_589824[alu9];
    var val1 = data4_589824[(alu9+1)];
    var val2 = data4_589824[(alu9+2)];
    var val3 = data4_589824[(alu9+3)];
    var val4 = data4_589824[(alu9+768)];
    var val5 = data4_589824[(alu9+769)];
    var val6 = data4_589824[(alu9+770)];
    var val7 = data4_589824[(alu9+771)];
    var val8 = data4_589824[(alu9+1536)];
    var val9 = data4_589824[(alu9+1537)];
    var val10 = data4_589824[(alu9+1538)];
    var val11 = data4_589824[(alu9+1539)];
    var precast2 = (ridx1006&15);
    var precast3 = (bitcast<u32>(precast2)<<2u);
    var alu10 = ((gidx1*768)+(lidx0*192)+((ridx1006>>4u)*96000)+bitcast<i32>(precast3));
    var val12 = data3_1152000[alu10];
    var val13 = data3_1152000[(alu10+1)];
    var val14 = data3_1152000[(alu10+2)];
    var val15 = data3_1152000[(alu10+3)];
    var val16 = data3_1152000[(alu10+64)];
    var val17 = data3_1152000[(alu10+65)];
    var val18 = data3_1152000[(alu10+66)];
    var val19 = data3_1152000[(alu10+67)];
    var val20 = data3_1152000[(alu10+128)];
    var val21 = data3_1152000[(alu10+129)];
    var val22 = data3_1152000[(alu10+130)];
    var val23 = data3_1152000[(alu10+131)];
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
  var alu21 = (gidx0*48);
  var alu22 = (lidx1*3);
  var alu23 = (alu21+(gidx1*9216)+(lidx0*2304)+alu22);
  var val24 = data2_1152000[alu23];
  var alu24 = (alu23+1);
  var val25 = data2_1152000[alu24];
  var alu25 = (alu23+2);
  var val26 = data2_1152000[alu25];
  var alu26 = (alu23+768);
  var val27 = data2_1152000[alu26];
  var alu27 = (alu23+769);
  var val28 = data2_1152000[alu27];
  var alu28 = (alu23+770);
  var val29 = data2_1152000[alu28];
  var alu29 = (alu23+1536);
  var val30 = data2_1152000[alu29];
  var alu30 = (alu23+1537);
  var val31 = data2_1152000[alu30];
  var alu31 = (alu23+1538);
  var val32 = data2_1152000[alu31];
  var alu32 = (alu21+alu22);
  var val33 = data5_768[alu32];
  var val34 = data5_768[(alu32+1)];
  var val35 = data5_768[(alu32+2)];
  var alu33 = ((gidx0*72000)+(gidx1*12)+(lidx0*3)+(lidx1*4500));
  var val36 = data1_1152000[alu33];
  var val37 = data1_1152000[(alu33+1)];
  var val38 = data1_1152000[(alu33+2)];
  var val39 = data1_1152000[(alu33+1500)];
  var val40 = data1_1152000[(alu33+1501)];
  var val41 = data1_1152000[(alu33+1502)];
  var val42 = data1_1152000[(alu33+3000)];
  var val43 = data1_1152000[(alu33+3001)];
  var val44 = data1_1152000[(alu33+3002)];
  data0_1152000[alu26] = (((1/(1.0f+exp2(((val37+(0.044715f*val37*val37*val37))*-2.302208198144325f))))*val37)+val27+acc0[3]+val33);
  data0_1152000[alu29] = (((1/(1.0f+exp2(((val38+(0.044715f*val38*val38*val38))*-2.302208198144325f))))*val38)+val30+acc0[6]+val33);
  data0_1152000[alu24] = (((1/(1.0f+exp2(((val39+(0.044715f*val39*val39*val39))*-2.302208198144325f))))*val39)+val25+acc0[1]+val34);
  data0_1152000[alu27] = (((1/(1.0f+exp2(((val40+(0.044715f*val40*val40*val40))*-2.302208198144325f))))*val40)+val28+acc0[4]+val34);
  data0_1152000[alu30] = (((1/(1.0f+exp2(((val41+(0.044715f*val41*val41*val41))*-2.302208198144325f))))*val41)+val31+acc0[7]+val34);
  data0_1152000[alu25] = (((1/(1.0f+exp2(((val42+(0.044715f*val42*val42*val42))*-2.302208198144325f))))*val42)+val26+acc0[2]+val35);
  data0_1152000[alu28] = (((1/(1.0f+exp2(((val43+(0.044715f*val43*val43*val43))*-2.302208198144325f))))*val43)+val29+acc0[5]+val35);
  data0_1152000[alu31] = (((1/(1.0f+exp2(((val44+(0.044715f*val44*val44*val44))*-2.302208198144325f))))*val44)+val32+acc0[8]+val35);
  data0_1152000[alu23] = (((1/(1.0f+exp2(((val36+(0.044715f*val36*val36*val36))*-2.302208198144325f))))*val36)+val24+acc0[0]+val33);
}`;

const r_1500_16_48n2 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
var<workgroup> temp0: array<f32,16>;
@group(0) @binding(1)var<storage,read_write>data0_1500:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1_1152000:array<f32>;
@compute @workgroup_size(16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var acc0: array<f32,1>;
  var acc1: array<f32,1>;
  var gidx0 = i32(gindex.x); /* 1500 */
  var lidx0 = i32(lindex.x); /* 16 */
  acc1[0] = 0.0f;
  acc0[0] = 0.0f;
  for (var ridx1002 = 0; ridx1002 < 48; ridx1002++) {
    var val0 = data1_1152000[((gidx0*768)+(lidx0*48)+ridx1002)];
    acc0[0] = (acc0[0]+val0);
  }
  temp0[lidx0] = acc0[0];
  workgroupBarrier();
  if (((bool(lidx0))!=true)) {
    for (var ridx1101 = 0; ridx1101 < 16; ridx1101++) {
      var val1 = temp0[ridx1101];
      acc1[0] = (acc1[0]+val1);
    }
    data0_1500[gidx0] = (acc1[0]*0.0013020833333333333f);
  }
}`;

const r_1500_16_48n3 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
var<workgroup> temp0: array<f32,16>;
@group(0) @binding(1)var<storage,read_write>data0_1500:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1_1152000:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2_1500:array<f32>;
@compute @workgroup_size(16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var acc0: array<f32,1>;
  var acc1: array<f32,1>;
  var gidx0 = i32(gindex.x); /* 1500 */
  var lidx0 = i32(lindex.x); /* 16 */
  acc1[0] = 0.0f;
  acc0[0] = 0.0f;
  var val0 = data2_1500[gidx0];
  for (var ridx1002 = 0; ridx1002 < 48; ridx1002++) {
    var val1 = data1_1152000[((gidx0*768)+(lidx0*48)+ridx1002)];
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
    data0_1500[gidx0] = (1/sqrt(((acc1[0]*0.0013020833333333333f)+1e-05f)));
  }
}`;

const E_125_16_4_16_3_3n1 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_1152000:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1_1152000:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2_1500:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3_1500:array<f32>;
@group(0) @binding(5)var<storage,read_write>data4_768:array<f32>;
@group(0) @binding(6)var<storage,read_write>data5_768:array<f32>;
@compute @workgroup_size(4,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var gidx0 = i32(gindex.x); /* 16 */
  var gidx1 = i32(gindex.y); /* 125 */
  var lidx0 = i32(lindex.x); /* 4 */
  var lidx1 = i32(lindex.y); /* 16 */
  var alu0 = (gidx0*48);
  var alu1 = ((gidx1*12)+(lidx0*3));
  var val0 = data2_1500[alu1];
  var val1 = data3_1500[alu1];
  var alu2 = (alu1+1);
  var val2 = data2_1500[alu2];
  var val3 = data3_1500[alu2];
  var alu3 = (alu1+2);
  var val4 = data2_1500[alu3];
  var val5 = data3_1500[alu3];
  var alu4 = (lidx1*3);
  var alu5 = (alu0+(gidx1*9216)+(lidx0*2304)+alu4);
  var val6 = data1_1152000[alu5];
  var alu6 = (alu5+1);
  var val7 = data1_1152000[alu6];
  var alu7 = (alu5+2);
  var val8 = data1_1152000[alu7];
  var alu8 = (alu5+768);
  var val9 = data1_1152000[alu8];
  var alu9 = (alu5+769);
  var val10 = data1_1152000[alu9];
  var alu10 = (alu5+770);
  var val11 = data1_1152000[alu10];
  var alu11 = (alu5+1536);
  var val12 = data1_1152000[alu11];
  var alu12 = (alu5+1537);
  var val13 = data1_1152000[alu12];
  var alu13 = (alu5+1538);
  var val14 = data1_1152000[alu13];
  var alu14 = (alu0+alu4);
  var val15 = data4_768[alu14];
  var val16 = data5_768[alu14];
  var alu15 = (alu14+1);
  var val17 = data4_768[alu15];
  var val18 = data5_768[alu15];
  var alu16 = (alu14+2);
  var val19 = data4_768[alu16];
  var val20 = data5_768[alu16];
  data0_1152000[alu6] = (((val7-val0)*val1*val17)+val18);
  data0_1152000[alu7] = (((val8-val0)*val1*val19)+val20);
  data0_1152000[alu8] = (((val9-val2)*val3*val15)+val16);
  data0_1152000[alu9] = (((val10-val2)*val3*val17)+val18);
  data0_1152000[alu10] = (((val11-val2)*val3*val19)+val20);
  data0_1152000[alu11] = (((val12-val4)*val5*val15)+val16);
  data0_1152000[alu12] = (((val13-val4)*val5*val17)+val18);
  data0_1152000[alu13] = (((val14-val4)*val5*val19)+val20);
  data0_1152000[alu5] = (((val6-val0)*val1*val15)+val16);
}`;

const r_125_64_4_16_3_3_192_4 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_4608000:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1_1152000:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2_2359296:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3_3072:array<f32>;
@compute @workgroup_size(4,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var acc0: array<f32,9>;
  var gidx0 = i32(gindex.x); /* 64 */
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
  for (var ridx1006 = 0; ridx1006 < 192; ridx1006++) {
    var precast0 = ridx1006;
    var precast1 = (bitcast<u32>(precast0)<<2u);
    var cast0 = bitcast<i32>(precast1);
    var alu9 = ((gidx0*36864)+(lidx1*2304)+cast0);
    var val0 = data2_2359296[alu9];
    var val1 = data2_2359296[(alu9+1)];
    var val2 = data2_2359296[(alu9+2)];
    var val3 = data2_2359296[(alu9+3)];
    var val4 = data2_2359296[(alu9+768)];
    var val5 = data2_2359296[(alu9+769)];
    var val6 = data2_2359296[(alu9+770)];
    var val7 = data2_2359296[(alu9+771)];
    var val8 = data2_2359296[(alu9+1536)];
    var val9 = data2_2359296[(alu9+1537)];
    var val10 = data2_2359296[(alu9+1538)];
    var val11 = data2_2359296[(alu9+1539)];
    var alu10 = ((gidx1*9216)+(lidx0*2304)+cast0);
    var val12 = data1_1152000[alu10];
    var val13 = data1_1152000[(alu10+1)];
    var val14 = data1_1152000[(alu10+2)];
    var val15 = data1_1152000[(alu10+3)];
    var val16 = data1_1152000[(alu10+768)];
    var val17 = data1_1152000[(alu10+769)];
    var val18 = data1_1152000[(alu10+770)];
    var val19 = data1_1152000[(alu10+771)];
    var val20 = data1_1152000[(alu10+1536)];
    var val21 = data1_1152000[(alu10+1537)];
    var val22 = data1_1152000[(alu10+1538)];
    var val23 = data1_1152000[(alu10+1539)];
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
  var alu21 = (gidx0*48);
  var alu22 = (lidx1*3);
  var alu23 = (alu21+alu22);
  var val24 = data3_3072[alu23];
  var val25 = data3_3072[(alu23+1)];
  var val26 = data3_3072[(alu23+2)];
  var alu24 = (acc0[0]+val24);
  var alu25 = (acc0[1]+val25);
  var alu26 = (acc0[2]+val26);
  var alu27 = (acc0[3]+val24);
  var alu28 = (acc0[4]+val25);
  var alu29 = (acc0[5]+val26);
  var alu30 = (acc0[6]+val24);
  var alu31 = (acc0[7]+val25);
  var alu32 = (acc0[8]+val26);
  var alu33 = (alu21+(gidx1*36864)+(lidx0*9216)+alu22);
  data0_4608000[alu33] = ((1/(1.0f+exp2(((alu24+(0.044715f*alu24*alu24*alu24))*-2.302208198144325f))))*alu24);
  data0_4608000[(alu33+1)] = ((1/(1.0f+exp2(((alu25+(0.044715f*alu25*alu25*alu25))*-2.302208198144325f))))*alu25);
  data0_4608000[(alu33+2)] = ((1/(1.0f+exp2(((alu26+(0.044715f*alu26*alu26*alu26))*-2.302208198144325f))))*alu26);
  data0_4608000[(alu33+3072)] = ((1/(1.0f+exp2(((alu27+(0.044715f*alu27*alu27*alu27))*-2.302208198144325f))))*alu27);
  data0_4608000[(alu33+3073)] = ((1/(1.0f+exp2(((alu28+(0.044715f*alu28*alu28*alu28))*-2.302208198144325f))))*alu28);
  data0_4608000[(alu33+3074)] = ((1/(1.0f+exp2(((alu29+(0.044715f*alu29*alu29*alu29))*-2.302208198144325f))))*alu29);
  data0_4608000[(alu33+6144)] = ((1/(1.0f+exp2(((alu30+(0.044715f*alu30*alu30*alu30))*-2.302208198144325f))))*alu30);
  data0_4608000[(alu33+6145)] = ((1/(1.0f+exp2(((alu31+(0.044715f*alu31*alu31*alu31))*-2.302208198144325f))))*alu31);
  data0_4608000[(alu33+6146)] = ((1/(1.0f+exp2(((alu32+(0.044715f*alu32*alu32*alu32))*-2.302208198144325f))))*alu32);
}`;

const r_125_16_4_16_3_3_768_4 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_1152000:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1_1152000:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2_4608000:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3_2359296:array<f32>;
@group(0) @binding(5)var<storage,read_write>data4_768:array<f32>;
@compute @workgroup_size(4,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var acc0: array<f32,9>;
  var gidx0 = i32(gindex.x); /* 16 */
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
  for (var ridx1006 = 0; ridx1006 < 768; ridx1006++) {
    var precast0 = ridx1006;
    var precast1 = (bitcast<u32>(precast0)<<2u);
    var cast0 = bitcast<i32>(precast1);
    var alu9 = ((gidx0*147456)+(lidx1*9216)+cast0);
    var val0 = data3_2359296[alu9];
    var val1 = data3_2359296[(alu9+1)];
    var val2 = data3_2359296[(alu9+2)];
    var val3 = data3_2359296[(alu9+3)];
    var val4 = data3_2359296[(alu9+3072)];
    var val5 = data3_2359296[(alu9+3073)];
    var val6 = data3_2359296[(alu9+3074)];
    var val7 = data3_2359296[(alu9+3075)];
    var val8 = data3_2359296[(alu9+6144)];
    var val9 = data3_2359296[(alu9+6145)];
    var val10 = data3_2359296[(alu9+6146)];
    var val11 = data3_2359296[(alu9+6147)];
    var alu10 = ((gidx1*36864)+(lidx0*9216)+cast0);
    var val12 = data2_4608000[alu10];
    var val13 = data2_4608000[(alu10+1)];
    var val14 = data2_4608000[(alu10+2)];
    var val15 = data2_4608000[(alu10+3)];
    var val16 = data2_4608000[(alu10+3072)];
    var val17 = data2_4608000[(alu10+3073)];
    var val18 = data2_4608000[(alu10+3074)];
    var val19 = data2_4608000[(alu10+3075)];
    var val20 = data2_4608000[(alu10+6144)];
    var val21 = data2_4608000[(alu10+6145)];
    var val22 = data2_4608000[(alu10+6146)];
    var val23 = data2_4608000[(alu10+6147)];
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
  var alu21 = (gidx0*48);
  var alu22 = (lidx1*3);
  var alu23 = (alu21+(gidx1*9216)+(lidx0*2304)+alu22);
  var val24 = data1_1152000[alu23];
  var alu24 = (alu23+1);
  var val25 = data1_1152000[alu24];
  var alu25 = (alu23+2);
  var val26 = data1_1152000[alu25];
  var alu26 = (alu23+768);
  var val27 = data1_1152000[alu26];
  var alu27 = (alu23+769);
  var val28 = data1_1152000[alu27];
  var alu28 = (alu23+770);
  var val29 = data1_1152000[alu28];
  var alu29 = (alu23+1536);
  var val30 = data1_1152000[alu29];
  var alu30 = (alu23+1537);
  var val31 = data1_1152000[alu30];
  var alu31 = (alu23+1538);
  var val32 = data1_1152000[alu31];
  var alu32 = (alu21+alu22);
  var val33 = data4_768[alu32];
  var val34 = data4_768[(alu32+1)];
  var val35 = data4_768[(alu32+2)];
  data0_1152000[alu24] = (val25+acc0[1]+val34);
  data0_1152000[alu25] = (val26+acc0[2]+val35);
  data0_1152000[alu26] = (val27+acc0[3]+val33);
  data0_1152000[alu27] = (val28+acc0[4]+val34);
  data0_1152000[alu28] = (val29+acc0[5]+val35);
  data0_1152000[alu29] = (val30+acc0[6]+val33);
  data0_1152000[alu30] = (val31+acc0[7]+val34);
  data0_1152000[alu31] = (val32+acc0[8]+val35);
  data0_1152000[alu23] = (val24+acc0[0]+val33);
}`;

const r_125_16_4_16_3_3_192_4n3 = `fn nan() -> f32 { let bits = 0xffffffffu; return bitcast<f32>(bits); }
@group(0) @binding(0)
var<uniform> INFINITY : f32;
@group(0) @binding(1)var<storage,read_write>data0_1152000:array<f32>;
@group(0) @binding(2)var<storage,read_write>data1_1152000:array<f32>;
@group(0) @binding(3)var<storage,read_write>data2_1152000:array<f32>;
@group(0) @binding(4)var<storage,read_write>data3_589824:array<f32>;
@group(0) @binding(5)var<storage,read_write>data4_768:array<f32>;
@compute @workgroup_size(4,16) fn main(@builtin(workgroup_id) gindex: vec3<u32>,@builtin(local_invocation_id) lindex: vec3<u32>) {
  var acc0: array<f32,9>;
  var gidx0 = i32(gindex.x); /* 16 */
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
  for (var ridx1006 = 0; ridx1006 < 192; ridx1006++) {
    var precast0 = ridx1006;
    var precast1 = (bitcast<u32>(precast0)<<2u);
    var alu9 = ((gidx0*36864)+(lidx1*2304)+bitcast<i32>(precast1));
    var val0 = data3_589824[alu9];
    var val1 = data3_589824[(alu9+1)];
    var val2 = data3_589824[(alu9+2)];
    var val3 = data3_589824[(alu9+3)];
    var val4 = data3_589824[(alu9+768)];
    var val5 = data3_589824[(alu9+769)];
    var val6 = data3_589824[(alu9+770)];
    var val7 = data3_589824[(alu9+771)];
    var val8 = data3_589824[(alu9+1536)];
    var val9 = data3_589824[(alu9+1537)];
    var val10 = data3_589824[(alu9+1538)];
    var val11 = data3_589824[(alu9+1539)];
    var precast2 = (ridx1006&15);
    var precast3 = (bitcast<u32>(precast2)<<2u);
    var alu10 = ((gidx1*768)+(lidx0*192)+((ridx1006>>4u)*96000)+bitcast<i32>(precast3));
    var val12 = data2_1152000[alu10];
    var val13 = data2_1152000[(alu10+1)];
    var val14 = data2_1152000[(alu10+2)];
    var val15 = data2_1152000[(alu10+3)];
    var val16 = data2_1152000[(alu10+64)];
    var val17 = data2_1152000[(alu10+65)];
    var val18 = data2_1152000[(alu10+66)];
    var val19 = data2_1152000[(alu10+67)];
    var val20 = data2_1152000[(alu10+128)];
    var val21 = data2_1152000[(alu10+129)];
    var val22 = data2_1152000[(alu10+130)];
    var val23 = data2_1152000[(alu10+131)];
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
  var alu21 = (gidx0*48);
  var alu22 = (lidx1*3);
  var alu23 = (alu21+(gidx1*9216)+(lidx0*2304)+alu22);
  var val24 = data1_1152000[alu23];
  var alu24 = (alu23+1);
  var val25 = data1_1152000[alu24];
  var alu25 = (alu23+2);
  var val26 = data1_1152000[alu25];
  var alu26 = (alu23+768);
  var val27 = data1_1152000[alu26];
  var alu27 = (alu23+769);
  var val28 = data1_1152000[alu27];
  var alu28 = (alu23+770);
  var val29 = data1_1152000[alu28];
  var alu29 = (alu23+1536);
  var val30 = data1_1152000[alu29];
  var alu30 = (alu23+1537);
  var val31 = data1_1152000[alu30];
  var alu31 = (alu23+1538);
  var val32 = data1_1152000[alu31];
  var alu32 = (alu21+alu22);
  var val33 = data4_768[alu32];
  var val34 = data4_768[(alu32+1)];
  var val35 = data4_768[(alu32+2)];
  data0_1152000[alu24] = (val25+acc0[1]+val34);
  data0_1152000[alu25] = (val26+acc0[2]+val35);
  data0_1152000[alu26] = (val27+acc0[3]+val33);
  data0_1152000[alu27] = (val28+acc0[4]+val34);
  data0_1152000[alu28] = (val29+acc0[5]+val35);
  data0_1152000[alu29] = (val30+acc0[6]+val33);
  data0_1152000[alu30] = (val31+acc0[7]+val34);
  data0_1152000[alu31] = (val32+acc0[8]+val35);
  data0_1152000[alu23] = (val24+acc0[0]+val33);
}`;

const setupNet = async (device, safetensor) => {
    const metadata = getTensorMetadata(safetensor);
    const infinityBuf = createInfinityUniformBuf(device);

    const layouts=[device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 7, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]}),device.createBindGroupLayout({entries: [{binding: 0, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'uniform' }}, {binding: 1, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 2, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 3, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 4, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 5, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } },{binding: 6, visibility: GPUShaderStage.COMPUTE, buffer: { type: 'storage' } }]})]

    const buf_0 = createEmptyBuf(device, 1474560);;
    const buf_1 = createWeightBuf(device, 737280, getTensorBuffer(safetensor, metadata['conv1.weight']));
    const buf_2 = createEmptyBuf(device, 1440000);;
    const input0 = createEmptyBuf(device, 960000);;
    const buf_3 = createEmptyBuf(device, 13824000);;
    const buf_4 = createEmptyBuf(device, 9216000);;
    const buf_5 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['conv1.bias']));
    const buf_6 = createEmptyBuf(device, 9216000);;
    const buf_7 = createEmptyBuf(device, 4608000);;
    const buf_8 = createWeightBuf(device, 7077888, getTensorBuffer(safetensor, metadata['conv2.weight']));
    const buf_9 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['conv2.bias']));
    const buf_10 = createEmptyBuf(device, 6000);;
    const buf_11 = createWeightBuf(device, 4608000, getTensorBuffer(safetensor, metadata['positional_embedding']));
    const buf_12 = createEmptyBuf(device, 6000);;
    const buf_13 = createEmptyBuf(device, 4608000);;
    const buf_14 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.0.attn_ln.weight']));
    const buf_15 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.0.attn_ln.bias']));
    const buf_16 = createEmptyBuf(device, 4608000);;
    const buf_17 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.0.attn.query.weight']));
    const buf_18 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.0.attn.query.bias']));
    const buf_19 = createEmptyBuf(device, 4608000);;
    const buf_20 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.0.attn.key.weight']));
    const buf_21 = createEmptyBuf(device, 4608000);;
    const buf_22 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.0.attn.value.weight']));
    const buf_23 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.0.attn.value.bias']));
    const buf_24 = createEmptyBuf(device, 108000000);;
    const buf_25 = createEmptyBuf(device, 72000);;
    const buf_26 = createEmptyBuf(device, 72000);;
    const buf_27 = createEmptyBuf(device, 108000000);;
    const buf_28 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.0.attn.out.weight']));
    const buf_29 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.0.attn.out.bias']));
    const buf_30 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.0.mlp_ln.weight']));
    const buf_31 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.0.mlp_ln.bias']));
    const buf_32 = createEmptyBuf(device, 18432000);;
    const buf_33 = createWeightBuf(device, 9437184, getTensorBuffer(safetensor, metadata['blocks.0.mlp.0.weight']));
    const buf_34 = createWeightBuf(device, 12288, getTensorBuffer(safetensor, metadata['blocks.0.mlp.0.bias']));
    const buf_35 = createEmptyBuf(device, 4608000);;
    const buf_36 = createWeightBuf(device, 9437184, getTensorBuffer(safetensor, metadata['blocks.0.mlp.2.weight']));
    const buf_37 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.0.mlp.2.bias']));
    const buf_38 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.1.attn_ln.weight']));
    const buf_39 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.1.attn_ln.bias']));
    const buf_40 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.1.attn.query.weight']));
    const buf_41 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.1.attn.query.bias']));
    const buf_42 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.1.attn.key.weight']));
    const buf_43 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.1.attn.value.weight']));
    const buf_44 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.1.attn.value.bias']));
    const buf_45 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.1.attn.out.weight']));
    const buf_46 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.1.attn.out.bias']));
    const buf_47 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.1.mlp_ln.weight']));
    const buf_48 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.1.mlp_ln.bias']));
    const buf_49 = createWeightBuf(device, 9437184, getTensorBuffer(safetensor, metadata['blocks.1.mlp.0.weight']));
    const buf_50 = createWeightBuf(device, 12288, getTensorBuffer(safetensor, metadata['blocks.1.mlp.0.bias']));
    const buf_51 = createEmptyBuf(device, 4608000);;
    const buf_52 = createWeightBuf(device, 9437184, getTensorBuffer(safetensor, metadata['blocks.1.mlp.2.weight']));
    const buf_53 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.1.mlp.2.bias']));
    const buf_54 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.2.attn_ln.weight']));
    const buf_55 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.2.attn_ln.bias']));
    const buf_56 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.2.attn.query.weight']));
    const buf_57 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.2.attn.query.bias']));
    const buf_58 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.2.attn.key.weight']));
    const buf_59 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.2.attn.value.weight']));
    const buf_60 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.2.attn.value.bias']));
    const buf_61 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.2.attn.out.weight']));
    const buf_62 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.2.attn.out.bias']));
    const buf_63 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.2.mlp_ln.weight']));
    const buf_64 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.2.mlp_ln.bias']));
    const buf_65 = createWeightBuf(device, 9437184, getTensorBuffer(safetensor, metadata['blocks.2.mlp.0.weight']));
    const buf_66 = createWeightBuf(device, 12288, getTensorBuffer(safetensor, metadata['blocks.2.mlp.0.bias']));
    const buf_67 = createEmptyBuf(device, 4608000);;
    const buf_68 = createWeightBuf(device, 9437184, getTensorBuffer(safetensor, metadata['blocks.2.mlp.2.weight']));
    const buf_69 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.2.mlp.2.bias']));
    const buf_70 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.3.attn_ln.weight']));
    const buf_71 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.3.attn_ln.bias']));
    const buf_72 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.3.attn.query.weight']));
    const buf_73 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.3.attn.query.bias']));
    const buf_74 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.3.attn.key.weight']));
    const buf_75 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.3.attn.value.weight']));
    const buf_76 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.3.attn.value.bias']));
    const buf_77 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.3.attn.out.weight']));
    const buf_78 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.3.attn.out.bias']));
    const buf_79 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.3.mlp_ln.weight']));
    const buf_80 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.3.mlp_ln.bias']));
    const buf_81 = createWeightBuf(device, 9437184, getTensorBuffer(safetensor, metadata['blocks.3.mlp.0.weight']));
    const buf_82 = createWeightBuf(device, 12288, getTensorBuffer(safetensor, metadata['blocks.3.mlp.0.bias']));
    const buf_83 = createEmptyBuf(device, 4608000);;
    const buf_84 = createWeightBuf(device, 9437184, getTensorBuffer(safetensor, metadata['blocks.3.mlp.2.weight']));
    const buf_85 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.3.mlp.2.bias']));
    const buf_86 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.4.attn_ln.weight']));
    const buf_87 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.4.attn_ln.bias']));
    const buf_88 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.4.attn.query.weight']));
    const buf_89 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.4.attn.query.bias']));
    const buf_90 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.4.attn.key.weight']));
    const buf_91 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.4.attn.value.weight']));
    const buf_92 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.4.attn.value.bias']));
    const buf_93 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.4.attn.out.weight']));
    const buf_94 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.4.attn.out.bias']));
    const buf_95 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.4.mlp_ln.weight']));
    const buf_96 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.4.mlp_ln.bias']));
    const buf_97 = createWeightBuf(device, 9437184, getTensorBuffer(safetensor, metadata['blocks.4.mlp.0.weight']));
    const buf_98 = createWeightBuf(device, 12288, getTensorBuffer(safetensor, metadata['blocks.4.mlp.0.bias']));
    const buf_99 = createEmptyBuf(device, 4608000);;
    const buf_100 = createWeightBuf(device, 9437184, getTensorBuffer(safetensor, metadata['blocks.4.mlp.2.weight']));
    const buf_101 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.4.mlp.2.bias']));
    const buf_102 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.5.attn_ln.weight']));
    const buf_103 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.5.attn_ln.bias']));
    const buf_104 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.5.attn.query.weight']));
    const buf_105 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.5.attn.query.bias']));
    const buf_106 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.5.attn.key.weight']));
    const buf_107 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.5.attn.value.weight']));
    const buf_108 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.5.attn.value.bias']));
    const buf_109 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.5.attn.out.weight']));
    const buf_110 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.5.attn.out.bias']));
    const buf_111 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.5.mlp_ln.weight']));
    const buf_112 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.5.mlp_ln.bias']));
    const buf_113 = createWeightBuf(device, 9437184, getTensorBuffer(safetensor, metadata['blocks.5.mlp.0.weight']));
    const buf_114 = createWeightBuf(device, 12288, getTensorBuffer(safetensor, metadata['blocks.5.mlp.0.bias']));
    const buf_115 = createEmptyBuf(device, 4608000);;
    const buf_116 = createWeightBuf(device, 9437184, getTensorBuffer(safetensor, metadata['blocks.5.mlp.2.weight']));
    const buf_117 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.5.mlp.2.bias']));
    const buf_118 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.6.attn_ln.weight']));
    const buf_119 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.6.attn_ln.bias']));
    const buf_120 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.6.attn.query.weight']));
    const buf_121 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.6.attn.query.bias']));
    const buf_122 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.6.attn.key.weight']));
    const buf_123 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.6.attn.value.weight']));
    const buf_124 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.6.attn.value.bias']));
    const buf_125 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.6.attn.out.weight']));
    const buf_126 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.6.attn.out.bias']));
    const buf_127 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.6.mlp_ln.weight']));
    const buf_128 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.6.mlp_ln.bias']));
    const buf_129 = createWeightBuf(device, 9437184, getTensorBuffer(safetensor, metadata['blocks.6.mlp.0.weight']));
    const buf_130 = createWeightBuf(device, 12288, getTensorBuffer(safetensor, metadata['blocks.6.mlp.0.bias']));
    const buf_131 = createEmptyBuf(device, 4608000);;
    const buf_132 = createWeightBuf(device, 9437184, getTensorBuffer(safetensor, metadata['blocks.6.mlp.2.weight']));
    const buf_133 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.6.mlp.2.bias']));
    const buf_134 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.7.attn_ln.weight']));
    const buf_135 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.7.attn_ln.bias']));
    const buf_136 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.7.attn.query.weight']));
    const buf_137 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.7.attn.query.bias']));
    const buf_138 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.7.attn.key.weight']));
    const buf_139 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.7.attn.value.weight']));
    const buf_140 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.7.attn.value.bias']));
    const buf_141 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.7.attn.out.weight']));
    const buf_142 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.7.attn.out.bias']));
    const buf_143 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.7.mlp_ln.weight']));
    const buf_144 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.7.mlp_ln.bias']));
    const buf_145 = createWeightBuf(device, 9437184, getTensorBuffer(safetensor, metadata['blocks.7.mlp.0.weight']));
    const buf_146 = createWeightBuf(device, 12288, getTensorBuffer(safetensor, metadata['blocks.7.mlp.0.bias']));
    const buf_147 = createEmptyBuf(device, 4608000);;
    const buf_148 = createWeightBuf(device, 9437184, getTensorBuffer(safetensor, metadata['blocks.7.mlp.2.weight']));
    const buf_149 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.7.mlp.2.bias']));
    const buf_150 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.8.attn_ln.weight']));
    const buf_151 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.8.attn_ln.bias']));
    const buf_152 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.8.attn.query.weight']));
    const buf_153 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.8.attn.query.bias']));
    const buf_154 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.8.attn.key.weight']));
    const buf_155 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.8.attn.value.weight']));
    const buf_156 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.8.attn.value.bias']));
    const buf_157 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.8.attn.out.weight']));
    const buf_158 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.8.attn.out.bias']));
    const buf_159 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.8.mlp_ln.weight']));
    const buf_160 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.8.mlp_ln.bias']));
    const buf_161 = createWeightBuf(device, 9437184, getTensorBuffer(safetensor, metadata['blocks.8.mlp.0.weight']));
    const buf_162 = createWeightBuf(device, 12288, getTensorBuffer(safetensor, metadata['blocks.8.mlp.0.bias']));
    const buf_163 = createEmptyBuf(device, 4608000);;
    const buf_164 = createWeightBuf(device, 9437184, getTensorBuffer(safetensor, metadata['blocks.8.mlp.2.weight']));
    const buf_165 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.8.mlp.2.bias']));
    const buf_166 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.9.attn_ln.weight']));
    const buf_167 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.9.attn_ln.bias']));
    const buf_168 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.9.attn.query.weight']));
    const buf_169 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.9.attn.query.bias']));
    const buf_170 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.9.attn.key.weight']));
    const buf_171 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.9.attn.value.weight']));
    const buf_172 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.9.attn.value.bias']));
    const buf_173 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.9.attn.out.weight']));
    const buf_174 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.9.attn.out.bias']));
    const buf_175 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.9.mlp_ln.weight']));
    const buf_176 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.9.mlp_ln.bias']));
    const buf_177 = createWeightBuf(device, 9437184, getTensorBuffer(safetensor, metadata['blocks.9.mlp.0.weight']));
    const buf_178 = createWeightBuf(device, 12288, getTensorBuffer(safetensor, metadata['blocks.9.mlp.0.bias']));
    const buf_179 = createEmptyBuf(device, 4608000);;
    const buf_180 = createWeightBuf(device, 9437184, getTensorBuffer(safetensor, metadata['blocks.9.mlp.2.weight']));
    const buf_181 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.9.mlp.2.bias']));
    const buf_182 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.10.attn_ln.weight']));
    const buf_183 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.10.attn_ln.bias']));
    const buf_184 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.10.attn.query.weight']));
    const buf_185 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.10.attn.query.bias']));
    const buf_186 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.10.attn.key.weight']));
    const buf_187 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.10.attn.value.weight']));
    const buf_188 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.10.attn.value.bias']));
    const buf_189 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.10.attn.out.weight']));
    const buf_190 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.10.attn.out.bias']));
    const buf_191 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.10.mlp_ln.weight']));
    const buf_192 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.10.mlp_ln.bias']));
    const buf_193 = createWeightBuf(device, 9437184, getTensorBuffer(safetensor, metadata['blocks.10.mlp.0.weight']));
    const buf_194 = createWeightBuf(device, 12288, getTensorBuffer(safetensor, metadata['blocks.10.mlp.0.bias']));
    const buf_195 = createEmptyBuf(device, 4608000);;
    const buf_196 = createWeightBuf(device, 9437184, getTensorBuffer(safetensor, metadata['blocks.10.mlp.2.weight']));
    const buf_197 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.10.mlp.2.bias']));
    const buf_198 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.11.attn_ln.weight']));
    const buf_199 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.11.attn_ln.bias']));
    const buf_200 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.11.attn.query.weight']));
    const buf_201 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.11.attn.query.bias']));
    const buf_202 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.11.attn.key.weight']));
    const buf_203 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.11.attn.value.weight']));
    const buf_204 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.11.attn.value.bias']));
    const buf_205 = createWeightBuf(device, 2359296, getTensorBuffer(safetensor, metadata['blocks.11.attn.out.weight']));
    const buf_206 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.11.attn.out.bias']));
    const buf_207 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.11.mlp_ln.weight']));
    const buf_208 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.11.mlp_ln.bias']));
    const buf_209 = createWeightBuf(device, 9437184, getTensorBuffer(safetensor, metadata['blocks.11.mlp.0.weight']));
    const buf_210 = createWeightBuf(device, 12288, getTensorBuffer(safetensor, metadata['blocks.11.mlp.0.bias']));
    const buf_211 = createEmptyBuf(device, 4608000);;
    const buf_212 = createWeightBuf(device, 9437184, getTensorBuffer(safetensor, metadata['blocks.11.mlp.2.weight']));
    const buf_213 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['blocks.11.mlp.2.bias']));
    const output0 = createEmptyBuf(device, 4608000);;
    const buf_214 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['ln_post.weight']));
    const buf_215 = createWeightBuf(device, 3072, getTensorBuffer(safetensor, metadata['ln_post.bias']));

    const gpuWriteBuffer0 = device.createBuffer({size:input0.size, usage: GPUBufferUsage.COPY_SRC | GPUBufferUsage.MAP_WRITE });

    const gpuReadBuffer0 = device.createBuffer({size:output0.size, usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ });

    const kernels = [E_640_32_6_3, E_5_125_16_2_6_3, r_2_16_125_3_16_2_3_3_20_4, E_48_125_16_8_3, E_24000_32_3, r_8_125_32_4_3_3_768_3, r_1500_16_48, r_1500_16_48n1, E_125_16_4_16_3_3, r_125_16_4_16_3_3_192_4, r_125_16_4_16_3_3_192_4n1, r_125_16_4_16_3_3_192_4, r_3_125_125_4_4_4_3_3_16_4, r_375_16_3_375_4, r_375_16_3_375_4n1, E_1125_125_16_4_3, r_6_125_2_4_16_4_3_375_4, r_125_16_4_16_3_3_192_4n2, r_1500_16_48n2, r_1500_16_48n3, E_125_16_4_16_3_3n1, r_125_64_4_16_3_3_192_4, r_125_16_4_16_3_3_768_4, r_1500_16_48n2, r_1500_16_48n3, E_125_16_4_16_3_3n1, r_125_16_4_16_3_3_192_4, r_125_16_4_16_3_3_192_4n1, r_125_16_4_16_3_3_192_4, r_3_125_125_4_4_4_3_3_16_4, r_375_16_3_375_4, r_375_16_3_375_4n1, E_1125_125_16_4_3, r_6_125_2_4_16_4_3_375_4, r_125_16_4_16_3_3_192_4n3, r_1500_16_48n2, r_1500_16_48n3, E_125_16_4_16_3_3n1, r_125_64_4_16_3_3_192_4, r_125_16_4_16_3_3_768_4, r_1500_16_48n2, r_1500_16_48n3, E_125_16_4_16_3_3n1, r_125_16_4_16_3_3_192_4, r_125_16_4_16_3_3_192_4n1, r_125_16_4_16_3_3_192_4, r_3_125_125_4_4_4_3_3_16_4, r_375_16_3_375_4, r_375_16_3_375_4n1, E_1125_125_16_4_3, r_6_125_2_4_16_4_3_375_4, r_125_16_4_16_3_3_192_4n3, r_1500_16_48n2, r_1500_16_48n3, E_125_16_4_16_3_3n1, r_125_64_4_16_3_3_192_4, r_125_16_4_16_3_3_768_4, r_1500_16_48n2, r_1500_16_48n3, E_125_16_4_16_3_3n1, r_125_16_4_16_3_3_192_4, r_125_16_4_16_3_3_192_4n1, r_125_16_4_16_3_3_192_4, r_3_125_125_4_4_4_3_3_16_4, r_375_16_3_375_4, r_375_16_3_375_4n1, E_1125_125_16_4_3, r_6_125_2_4_16_4_3_375_4, r_125_16_4_16_3_3_192_4n3, r_1500_16_48n2, r_1500_16_48n3, E_125_16_4_16_3_3n1, r_125_64_4_16_3_3_192_4, r_125_16_4_16_3_3_768_4, r_1500_16_48n2, r_1500_16_48n3, E_125_16_4_16_3_3n1, r_125_16_4_16_3_3_192_4, r_125_16_4_16_3_3_192_4n1, r_125_16_4_16_3_3_192_4, r_3_125_125_4_4_4_3_3_16_4, r_375_16_3_375_4, r_375_16_3_375_4n1, E_1125_125_16_4_3, r_6_125_2_4_16_4_3_375_4, r_125_16_4_16_3_3_192_4n3, r_1500_16_48n2, r_1500_16_48n3, E_125_16_4_16_3_3n1, r_125_64_4_16_3_3_192_4, r_125_16_4_16_3_3_768_4, r_1500_16_48n2, r_1500_16_48n3, E_125_16_4_16_3_3n1, r_125_16_4_16_3_3_192_4, r_125_16_4_16_3_3_192_4n1, r_125_16_4_16_3_3_192_4, r_3_125_125_4_4_4_3_3_16_4, r_375_16_3_375_4, r_375_16_3_375_4n1, E_1125_125_16_4_3, r_6_125_2_4_16_4_3_375_4, r_125_16_4_16_3_3_192_4n3, r_1500_16_48n2, r_1500_16_48n3, E_125_16_4_16_3_3n1, r_125_64_4_16_3_3_192_4, r_125_16_4_16_3_3_768_4, r_1500_16_48n2, r_1500_16_48n3, E_125_16_4_16_3_3n1, r_125_16_4_16_3_3_192_4, r_125_16_4_16_3_3_192_4n1, r_125_16_4_16_3_3_192_4, r_3_125_125_4_4_4_3_3_16_4, r_375_16_3_375_4, r_375_16_3_375_4n1, E_1125_125_16_4_3, r_6_125_2_4_16_4_3_375_4, r_125_16_4_16_3_3_192_4n3, r_1500_16_48n2, r_1500_16_48n3, E_125_16_4_16_3_3n1, r_125_64_4_16_3_3_192_4, r_125_16_4_16_3_3_768_4, r_1500_16_48n2, r_1500_16_48n3, E_125_16_4_16_3_3n1, r_125_16_4_16_3_3_192_4, r_125_16_4_16_3_3_192_4n1, r_125_16_4_16_3_3_192_4, r_3_125_125_4_4_4_3_3_16_4, r_375_16_3_375_4, r_375_16_3_375_4n1, E_1125_125_16_4_3, r_6_125_2_4_16_4_3_375_4, r_125_16_4_16_3_3_192_4n3, r_1500_16_48n2, r_1500_16_48n3, E_125_16_4_16_3_3n1, r_125_64_4_16_3_3_192_4, r_125_16_4_16_3_3_768_4, r_1500_16_48n2, r_1500_16_48n3, E_125_16_4_16_3_3n1, r_125_16_4_16_3_3_192_4, r_125_16_4_16_3_3_192_4n1, r_125_16_4_16_3_3_192_4, r_3_125_125_4_4_4_3_3_16_4, r_375_16_3_375_4, r_375_16_3_375_4n1, E_1125_125_16_4_3, r_6_125_2_4_16_4_3_375_4, r_125_16_4_16_3_3_192_4n3, r_1500_16_48n2, r_1500_16_48n3, E_125_16_4_16_3_3n1, r_125_64_4_16_3_3_192_4, r_125_16_4_16_3_3_768_4, r_1500_16_48n2, r_1500_16_48n3, E_125_16_4_16_3_3n1, r_125_16_4_16_3_3_192_4, r_125_16_4_16_3_3_192_4n1, r_125_16_4_16_3_3_192_4, r_3_125_125_4_4_4_3_3_16_4, r_375_16_3_375_4, r_375_16_3_375_4n1, E_1125_125_16_4_3, r_6_125_2_4_16_4_3_375_4, r_125_16_4_16_3_3_192_4n3, r_1500_16_48n2, r_1500_16_48n3, E_125_16_4_16_3_3n1, r_125_64_4_16_3_3_192_4, r_125_16_4_16_3_3_768_4, r_1500_16_48n2, r_1500_16_48n3, E_125_16_4_16_3_3n1, r_125_16_4_16_3_3_192_4, r_125_16_4_16_3_3_192_4n1, r_125_16_4_16_3_3_192_4, r_3_125_125_4_4_4_3_3_16_4, r_375_16_3_375_4, r_375_16_3_375_4n1, E_1125_125_16_4_3, r_6_125_2_4_16_4_3_375_4, r_125_16_4_16_3_3_192_4n3, r_1500_16_48n2, r_1500_16_48n3, E_125_16_4_16_3_3n1, r_125_64_4_16_3_3_192_4, r_125_16_4_16_3_3_768_4, r_1500_16_48n2, r_1500_16_48n3, E_125_16_4_16_3_3n1, r_125_16_4_16_3_3_192_4, r_125_16_4_16_3_3_192_4n1, r_125_16_4_16_3_3_192_4, r_3_125_125_4_4_4_3_3_16_4, r_375_16_3_375_4, r_375_16_3_375_4n1, E_1125_125_16_4_3, r_6_125_2_4_16_4_3_375_4, r_125_16_4_16_3_3_192_4n3, r_1500_16_48n2, r_1500_16_48n3, E_125_16_4_16_3_3n1, r_125_64_4_16_3_3_192_4, r_125_16_4_16_3_3_768_4, r_1500_16_48n2, r_1500_16_48n3, E_125_16_4_16_3_3n1];
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
        addComputePass(device, commandEncoder, pipelines[0], layouts[0], infinityBuf, [buf_0, buf_1], [640, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[1], layouts[1], infinityBuf, [buf_2, input0], [125, 5, 1]);
        addComputePass(device, commandEncoder, pipelines[2], layouts[2], infinityBuf, [buf_3, buf_0, buf_2], [125, 16, 2]);
        addComputePass(device, commandEncoder, pipelines[3], layouts[3], infinityBuf, [buf_4, buf_3, buf_5], [125, 48, 1]);
        addComputePass(device, commandEncoder, pipelines[4], layouts[4], infinityBuf, [buf_6, buf_4], [24000, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[5], layouts[5], infinityBuf, [buf_7, buf_6, buf_8, buf_9], [125, 8, 1]);
        addComputePass(device, commandEncoder, pipelines[6], layouts[6], infinityBuf, [buf_10, buf_7, buf_11], [1500, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[7], layouts[7], infinityBuf, [buf_12, buf_7, buf_11, buf_10], [1500, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[8], layouts[8], infinityBuf, [buf_13, buf_7, buf_11, buf_10, buf_12, buf_14, buf_15], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[9], layouts[9], infinityBuf, [buf_16, buf_13, buf_17, buf_18], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[10], layouts[10], infinityBuf, [buf_19, buf_13, buf_20], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[11], layouts[11], infinityBuf, [buf_21, buf_13, buf_22, buf_23], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[12], layouts[12], infinityBuf, [buf_24, buf_16, buf_19], [125, 125, 3]);
        addComputePass(device, commandEncoder, pipelines[13], layouts[13], infinityBuf, [buf_25, buf_24], [375, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[14], layouts[14], infinityBuf, [buf_26, buf_24, buf_25], [375, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[15], layouts[15], infinityBuf, [buf_27, buf_24, buf_25, buf_26], [125, 1125, 1]);
        addComputePass(device, commandEncoder, pipelines[16], layouts[16], infinityBuf, [buf_19, buf_27, buf_21], [125, 6, 1]);
        addComputePass(device, commandEncoder, pipelines[17], layouts[17], infinityBuf, [buf_21, buf_7, buf_11, buf_19, buf_28, buf_29], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[18], layouts[18], infinityBuf, [buf_12, buf_21], [1500, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[19], layouts[19], infinityBuf, [buf_10, buf_21, buf_12], [1500, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[20], layouts[20], infinityBuf, [buf_19, buf_21, buf_12, buf_10, buf_30, buf_31], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[21], layouts[21], infinityBuf, [buf_32, buf_19, buf_33, buf_34], [64, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[22], layouts[22], infinityBuf, [buf_35, buf_21, buf_32, buf_36, buf_37], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[23], layouts[23], infinityBuf, [buf_10, buf_35], [1500, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[24], layouts[24], infinityBuf, [buf_12, buf_35, buf_10], [1500, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[25], layouts[25], infinityBuf, [buf_21, buf_35, buf_10, buf_12, buf_38, buf_39], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[26], layouts[26], infinityBuf, [buf_19, buf_21, buf_40, buf_41], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[27], layouts[27], infinityBuf, [buf_16, buf_21, buf_42], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[28], layouts[28], infinityBuf, [buf_13, buf_21, buf_43, buf_44], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[29], layouts[29], infinityBuf, [buf_27, buf_19, buf_16], [125, 125, 3]);
        addComputePass(device, commandEncoder, pipelines[30], layouts[30], infinityBuf, [buf_26, buf_27], [375, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[31], layouts[31], infinityBuf, [buf_25, buf_27, buf_26], [375, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[32], layouts[32], infinityBuf, [buf_24, buf_27, buf_26, buf_25], [125, 1125, 1]);
        addComputePass(device, commandEncoder, pipelines[33], layouts[33], infinityBuf, [buf_16, buf_24, buf_13], [125, 6, 1]);
        addComputePass(device, commandEncoder, pipelines[34], layouts[34], infinityBuf, [buf_13, buf_35, buf_16, buf_45, buf_46], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[35], layouts[35], infinityBuf, [buf_12, buf_13], [1500, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[36], layouts[36], infinityBuf, [buf_10, buf_13, buf_12], [1500, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[37], layouts[37], infinityBuf, [buf_16, buf_13, buf_12, buf_10, buf_47, buf_48], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[38], layouts[38], infinityBuf, [buf_32, buf_16, buf_49, buf_50], [64, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[39], layouts[39], infinityBuf, [buf_51, buf_13, buf_32, buf_52, buf_53], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[40], layouts[40], infinityBuf, [buf_10, buf_51], [1500, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[41], layouts[41], infinityBuf, [buf_12, buf_51, buf_10], [1500, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[42], layouts[42], infinityBuf, [buf_13, buf_51, buf_10, buf_12, buf_54, buf_55], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[43], layouts[43], infinityBuf, [buf_16, buf_13, buf_56, buf_57], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[44], layouts[44], infinityBuf, [buf_19, buf_13, buf_58], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[45], layouts[45], infinityBuf, [buf_21, buf_13, buf_59, buf_60], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[46], layouts[46], infinityBuf, [buf_24, buf_16, buf_19], [125, 125, 3]);
        addComputePass(device, commandEncoder, pipelines[47], layouts[47], infinityBuf, [buf_25, buf_24], [375, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[48], layouts[48], infinityBuf, [buf_26, buf_24, buf_25], [375, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[49], layouts[49], infinityBuf, [buf_27, buf_24, buf_25, buf_26], [125, 1125, 1]);
        addComputePass(device, commandEncoder, pipelines[50], layouts[50], infinityBuf, [buf_19, buf_27, buf_21], [125, 6, 1]);
        addComputePass(device, commandEncoder, pipelines[51], layouts[51], infinityBuf, [buf_21, buf_51, buf_19, buf_61, buf_62], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[52], layouts[52], infinityBuf, [buf_12, buf_21], [1500, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[53], layouts[53], infinityBuf, [buf_10, buf_21, buf_12], [1500, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[54], layouts[54], infinityBuf, [buf_19, buf_21, buf_12, buf_10, buf_63, buf_64], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[55], layouts[55], infinityBuf, [buf_32, buf_19, buf_65, buf_66], [64, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[56], layouts[56], infinityBuf, [buf_67, buf_21, buf_32, buf_68, buf_69], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[57], layouts[57], infinityBuf, [buf_10, buf_67], [1500, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[58], layouts[58], infinityBuf, [buf_12, buf_67, buf_10], [1500, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[59], layouts[59], infinityBuf, [buf_21, buf_67, buf_10, buf_12, buf_70, buf_71], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[60], layouts[60], infinityBuf, [buf_19, buf_21, buf_72, buf_73], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[61], layouts[61], infinityBuf, [buf_16, buf_21, buf_74], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[62], layouts[62], infinityBuf, [buf_13, buf_21, buf_75, buf_76], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[63], layouts[63], infinityBuf, [buf_27, buf_19, buf_16], [125, 125, 3]);
        addComputePass(device, commandEncoder, pipelines[64], layouts[64], infinityBuf, [buf_26, buf_27], [375, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[65], layouts[65], infinityBuf, [buf_25, buf_27, buf_26], [375, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[66], layouts[66], infinityBuf, [buf_24, buf_27, buf_26, buf_25], [125, 1125, 1]);
        addComputePass(device, commandEncoder, pipelines[67], layouts[67], infinityBuf, [buf_16, buf_24, buf_13], [125, 6, 1]);
        addComputePass(device, commandEncoder, pipelines[68], layouts[68], infinityBuf, [buf_13, buf_67, buf_16, buf_77, buf_78], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[69], layouts[69], infinityBuf, [buf_12, buf_13], [1500, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[70], layouts[70], infinityBuf, [buf_10, buf_13, buf_12], [1500, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[71], layouts[71], infinityBuf, [buf_16, buf_13, buf_12, buf_10, buf_79, buf_80], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[72], layouts[72], infinityBuf, [buf_32, buf_16, buf_81, buf_82], [64, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[73], layouts[73], infinityBuf, [buf_83, buf_13, buf_32, buf_84, buf_85], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[74], layouts[74], infinityBuf, [buf_10, buf_83], [1500, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[75], layouts[75], infinityBuf, [buf_12, buf_83, buf_10], [1500, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[76], layouts[76], infinityBuf, [buf_13, buf_83, buf_10, buf_12, buf_86, buf_87], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[77], layouts[77], infinityBuf, [buf_16, buf_13, buf_88, buf_89], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[78], layouts[78], infinityBuf, [buf_19, buf_13, buf_90], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[79], layouts[79], infinityBuf, [buf_21, buf_13, buf_91, buf_92], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[80], layouts[80], infinityBuf, [buf_24, buf_16, buf_19], [125, 125, 3]);
        addComputePass(device, commandEncoder, pipelines[81], layouts[81], infinityBuf, [buf_25, buf_24], [375, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[82], layouts[82], infinityBuf, [buf_26, buf_24, buf_25], [375, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[83], layouts[83], infinityBuf, [buf_27, buf_24, buf_25, buf_26], [125, 1125, 1]);
        addComputePass(device, commandEncoder, pipelines[84], layouts[84], infinityBuf, [buf_19, buf_27, buf_21], [125, 6, 1]);
        addComputePass(device, commandEncoder, pipelines[85], layouts[85], infinityBuf, [buf_21, buf_83, buf_19, buf_93, buf_94], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[86], layouts[86], infinityBuf, [buf_12, buf_21], [1500, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[87], layouts[87], infinityBuf, [buf_10, buf_21, buf_12], [1500, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[88], layouts[88], infinityBuf, [buf_19, buf_21, buf_12, buf_10, buf_95, buf_96], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[89], layouts[89], infinityBuf, [buf_32, buf_19, buf_97, buf_98], [64, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[90], layouts[90], infinityBuf, [buf_99, buf_21, buf_32, buf_100, buf_101], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[91], layouts[91], infinityBuf, [buf_10, buf_99], [1500, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[92], layouts[92], infinityBuf, [buf_12, buf_99, buf_10], [1500, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[93], layouts[93], infinityBuf, [buf_21, buf_99, buf_10, buf_12, buf_102, buf_103], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[94], layouts[94], infinityBuf, [buf_19, buf_21, buf_104, buf_105], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[95], layouts[95], infinityBuf, [buf_16, buf_21, buf_106], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[96], layouts[96], infinityBuf, [buf_13, buf_21, buf_107, buf_108], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[97], layouts[97], infinityBuf, [buf_27, buf_19, buf_16], [125, 125, 3]);
        addComputePass(device, commandEncoder, pipelines[98], layouts[98], infinityBuf, [buf_26, buf_27], [375, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[99], layouts[99], infinityBuf, [buf_25, buf_27, buf_26], [375, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[100], layouts[100], infinityBuf, [buf_24, buf_27, buf_26, buf_25], [125, 1125, 1]);
        addComputePass(device, commandEncoder, pipelines[101], layouts[101], infinityBuf, [buf_16, buf_24, buf_13], [125, 6, 1]);
        addComputePass(device, commandEncoder, pipelines[102], layouts[102], infinityBuf, [buf_13, buf_99, buf_16, buf_109, buf_110], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[103], layouts[103], infinityBuf, [buf_12, buf_13], [1500, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[104], layouts[104], infinityBuf, [buf_10, buf_13, buf_12], [1500, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[105], layouts[105], infinityBuf, [buf_16, buf_13, buf_12, buf_10, buf_111, buf_112], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[106], layouts[106], infinityBuf, [buf_32, buf_16, buf_113, buf_114], [64, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[107], layouts[107], infinityBuf, [buf_115, buf_13, buf_32, buf_116, buf_117], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[108], layouts[108], infinityBuf, [buf_10, buf_115], [1500, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[109], layouts[109], infinityBuf, [buf_12, buf_115, buf_10], [1500, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[110], layouts[110], infinityBuf, [buf_13, buf_115, buf_10, buf_12, buf_118, buf_119], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[111], layouts[111], infinityBuf, [buf_16, buf_13, buf_120, buf_121], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[112], layouts[112], infinityBuf, [buf_19, buf_13, buf_122], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[113], layouts[113], infinityBuf, [buf_21, buf_13, buf_123, buf_124], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[114], layouts[114], infinityBuf, [buf_24, buf_16, buf_19], [125, 125, 3]);
        addComputePass(device, commandEncoder, pipelines[115], layouts[115], infinityBuf, [buf_25, buf_24], [375, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[116], layouts[116], infinityBuf, [buf_26, buf_24, buf_25], [375, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[117], layouts[117], infinityBuf, [buf_27, buf_24, buf_25, buf_26], [125, 1125, 1]);
        addComputePass(device, commandEncoder, pipelines[118], layouts[118], infinityBuf, [buf_19, buf_27, buf_21], [125, 6, 1]);
        addComputePass(device, commandEncoder, pipelines[119], layouts[119], infinityBuf, [buf_21, buf_115, buf_19, buf_125, buf_126], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[120], layouts[120], infinityBuf, [buf_12, buf_21], [1500, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[121], layouts[121], infinityBuf, [buf_10, buf_21, buf_12], [1500, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[122], layouts[122], infinityBuf, [buf_19, buf_21, buf_12, buf_10, buf_127, buf_128], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[123], layouts[123], infinityBuf, [buf_32, buf_19, buf_129, buf_130], [64, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[124], layouts[124], infinityBuf, [buf_131, buf_21, buf_32, buf_132, buf_133], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[125], layouts[125], infinityBuf, [buf_10, buf_131], [1500, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[126], layouts[126], infinityBuf, [buf_12, buf_131, buf_10], [1500, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[127], layouts[127], infinityBuf, [buf_21, buf_131, buf_10, buf_12, buf_134, buf_135], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[128], layouts[128], infinityBuf, [buf_19, buf_21, buf_136, buf_137], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[129], layouts[129], infinityBuf, [buf_16, buf_21, buf_138], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[130], layouts[130], infinityBuf, [buf_13, buf_21, buf_139, buf_140], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[131], layouts[131], infinityBuf, [buf_27, buf_19, buf_16], [125, 125, 3]);
        addComputePass(device, commandEncoder, pipelines[132], layouts[132], infinityBuf, [buf_26, buf_27], [375, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[133], layouts[133], infinityBuf, [buf_25, buf_27, buf_26], [375, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[134], layouts[134], infinityBuf, [buf_24, buf_27, buf_26, buf_25], [125, 1125, 1]);
        addComputePass(device, commandEncoder, pipelines[135], layouts[135], infinityBuf, [buf_16, buf_24, buf_13], [125, 6, 1]);
        addComputePass(device, commandEncoder, pipelines[136], layouts[136], infinityBuf, [buf_13, buf_131, buf_16, buf_141, buf_142], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[137], layouts[137], infinityBuf, [buf_12, buf_13], [1500, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[138], layouts[138], infinityBuf, [buf_10, buf_13, buf_12], [1500, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[139], layouts[139], infinityBuf, [buf_16, buf_13, buf_12, buf_10, buf_143, buf_144], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[140], layouts[140], infinityBuf, [buf_32, buf_16, buf_145, buf_146], [64, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[141], layouts[141], infinityBuf, [buf_147, buf_13, buf_32, buf_148, buf_149], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[142], layouts[142], infinityBuf, [buf_10, buf_147], [1500, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[143], layouts[143], infinityBuf, [buf_12, buf_147, buf_10], [1500, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[144], layouts[144], infinityBuf, [buf_13, buf_147, buf_10, buf_12, buf_150, buf_151], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[145], layouts[145], infinityBuf, [buf_16, buf_13, buf_152, buf_153], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[146], layouts[146], infinityBuf, [buf_19, buf_13, buf_154], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[147], layouts[147], infinityBuf, [buf_21, buf_13, buf_155, buf_156], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[148], layouts[148], infinityBuf, [buf_24, buf_16, buf_19], [125, 125, 3]);
        addComputePass(device, commandEncoder, pipelines[149], layouts[149], infinityBuf, [buf_25, buf_24], [375, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[150], layouts[150], infinityBuf, [buf_26, buf_24, buf_25], [375, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[151], layouts[151], infinityBuf, [buf_27, buf_24, buf_25, buf_26], [125, 1125, 1]);
        addComputePass(device, commandEncoder, pipelines[152], layouts[152], infinityBuf, [buf_19, buf_27, buf_21], [125, 6, 1]);
        addComputePass(device, commandEncoder, pipelines[153], layouts[153], infinityBuf, [buf_21, buf_147, buf_19, buf_157, buf_158], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[154], layouts[154], infinityBuf, [buf_12, buf_21], [1500, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[155], layouts[155], infinityBuf, [buf_10, buf_21, buf_12], [1500, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[156], layouts[156], infinityBuf, [buf_19, buf_21, buf_12, buf_10, buf_159, buf_160], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[157], layouts[157], infinityBuf, [buf_32, buf_19, buf_161, buf_162], [64, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[158], layouts[158], infinityBuf, [buf_163, buf_21, buf_32, buf_164, buf_165], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[159], layouts[159], infinityBuf, [buf_10, buf_163], [1500, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[160], layouts[160], infinityBuf, [buf_12, buf_163, buf_10], [1500, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[161], layouts[161], infinityBuf, [buf_21, buf_163, buf_10, buf_12, buf_166, buf_167], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[162], layouts[162], infinityBuf, [buf_19, buf_21, buf_168, buf_169], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[163], layouts[163], infinityBuf, [buf_16, buf_21, buf_170], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[164], layouts[164], infinityBuf, [buf_13, buf_21, buf_171, buf_172], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[165], layouts[165], infinityBuf, [buf_27, buf_19, buf_16], [125, 125, 3]);
        addComputePass(device, commandEncoder, pipelines[166], layouts[166], infinityBuf, [buf_26, buf_27], [375, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[167], layouts[167], infinityBuf, [buf_25, buf_27, buf_26], [375, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[168], layouts[168], infinityBuf, [buf_24, buf_27, buf_26, buf_25], [125, 1125, 1]);
        addComputePass(device, commandEncoder, pipelines[169], layouts[169], infinityBuf, [buf_16, buf_24, buf_13], [125, 6, 1]);
        addComputePass(device, commandEncoder, pipelines[170], layouts[170], infinityBuf, [buf_13, buf_163, buf_16, buf_173, buf_174], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[171], layouts[171], infinityBuf, [buf_12, buf_13], [1500, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[172], layouts[172], infinityBuf, [buf_10, buf_13, buf_12], [1500, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[173], layouts[173], infinityBuf, [buf_16, buf_13, buf_12, buf_10, buf_175, buf_176], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[174], layouts[174], infinityBuf, [buf_32, buf_16, buf_177, buf_178], [64, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[175], layouts[175], infinityBuf, [buf_179, buf_13, buf_32, buf_180, buf_181], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[176], layouts[176], infinityBuf, [buf_10, buf_179], [1500, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[177], layouts[177], infinityBuf, [buf_12, buf_179, buf_10], [1500, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[178], layouts[178], infinityBuf, [buf_13, buf_179, buf_10, buf_12, buf_182, buf_183], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[179], layouts[179], infinityBuf, [buf_16, buf_13, buf_184, buf_185], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[180], layouts[180], infinityBuf, [buf_19, buf_13, buf_186], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[181], layouts[181], infinityBuf, [buf_21, buf_13, buf_187, buf_188], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[182], layouts[182], infinityBuf, [buf_24, buf_16, buf_19], [125, 125, 3]);
        addComputePass(device, commandEncoder, pipelines[183], layouts[183], infinityBuf, [buf_25, buf_24], [375, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[184], layouts[184], infinityBuf, [buf_26, buf_24, buf_25], [375, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[185], layouts[185], infinityBuf, [buf_27, buf_24, buf_25, buf_26], [125, 1125, 1]);
        addComputePass(device, commandEncoder, pipelines[186], layouts[186], infinityBuf, [buf_19, buf_27, buf_21], [125, 6, 1]);
        addComputePass(device, commandEncoder, pipelines[187], layouts[187], infinityBuf, [buf_21, buf_179, buf_19, buf_189, buf_190], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[188], layouts[188], infinityBuf, [buf_12, buf_21], [1500, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[189], layouts[189], infinityBuf, [buf_10, buf_21, buf_12], [1500, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[190], layouts[190], infinityBuf, [buf_19, buf_21, buf_12, buf_10, buf_191, buf_192], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[191], layouts[191], infinityBuf, [buf_32, buf_19, buf_193, buf_194], [64, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[192], layouts[192], infinityBuf, [buf_195, buf_21, buf_32, buf_196, buf_197], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[193], layouts[193], infinityBuf, [buf_10, buf_195], [1500, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[194], layouts[194], infinityBuf, [buf_12, buf_195, buf_10], [1500, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[195], layouts[195], infinityBuf, [buf_21, buf_195, buf_10, buf_12, buf_198, buf_199], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[196], layouts[196], infinityBuf, [buf_19, buf_21, buf_200, buf_201], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[197], layouts[197], infinityBuf, [buf_16, buf_21, buf_202], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[198], layouts[198], infinityBuf, [buf_13, buf_21, buf_203, buf_204], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[199], layouts[199], infinityBuf, [buf_27, buf_19, buf_16], [125, 125, 3]);
        addComputePass(device, commandEncoder, pipelines[200], layouts[200], infinityBuf, [buf_26, buf_27], [375, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[201], layouts[201], infinityBuf, [buf_25, buf_27, buf_26], [375, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[202], layouts[202], infinityBuf, [buf_24, buf_27, buf_26, buf_25], [125, 1125, 1]);
        addComputePass(device, commandEncoder, pipelines[203], layouts[203], infinityBuf, [buf_16, buf_24, buf_13], [125, 6, 1]);
        addComputePass(device, commandEncoder, pipelines[204], layouts[204], infinityBuf, [buf_13, buf_195, buf_16, buf_205, buf_206], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[205], layouts[205], infinityBuf, [buf_12, buf_13], [1500, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[206], layouts[206], infinityBuf, [buf_10, buf_13, buf_12], [1500, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[207], layouts[207], infinityBuf, [buf_16, buf_13, buf_12, buf_10, buf_207, buf_208], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[208], layouts[208], infinityBuf, [buf_32, buf_16, buf_209, buf_210], [64, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[209], layouts[209], infinityBuf, [buf_211, buf_13, buf_32, buf_212, buf_213], [16, 125, 1]);
        addComputePass(device, commandEncoder, pipelines[210], layouts[210], infinityBuf, [buf_10, buf_211], [1500, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[211], layouts[211], infinityBuf, [buf_12, buf_211, buf_10], [1500, 1, 1]);
        addComputePass(device, commandEncoder, pipelines[212], layouts[212], infinityBuf, [output0, buf_211, buf_10, buf_12, buf_214, buf_215], [16, 125, 1]);
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
