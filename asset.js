
const materialShaders = []; // Shaders Counter
const speed = 10;




// --------------- Perlin Noise For Terrain -------- /

const noise = `
vec3 mod289(vec3 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 mod289(vec4 x) {
  return x - floor(x * (1.0 / 289.0)) * 289.0;
}

vec4 permute(vec4 x) {
     return mod289(((x*34.0)+1.0)*x);
}

vec4 taylorInvSqrt(vec4 r)
{
  return 1.79284291400159 - 0.85373472095314 * r;
}

float snoise(vec3 v)
  {
  const vec2  C = vec2(1.0/6.0, 1.0/3.0) ;
  const vec4  D = vec4(0.0, 0.5, 1.0, 2.0);

// First corner
  vec3 i  = floor(v + dot(v, C.yyy) );
  vec3 x0 =   v - i + dot(i, C.xxx) ;

// Other corners
  vec3 g = step(x0.yzx, x0.xyz);
  vec3 l = 1.0 - g;
  vec3 i1 = min( g.xyz, l.zxy );
  vec3 i2 = max( g.xyz, l.zxy );

  //   x0 = x0 - 0.0 + 0.0 * C.xxx;
  //   x1 = x0 - i1  + 1.0 * C.xxx;
  //   x2 = x0 - i2  + 2.0 * C.xxx;
  //   x3 = x0 - 1.0 + 3.0 * C.xxx;
  vec3 x1 = x0 - i1 + C.xxx;
  vec3 x2 = x0 - i2 + C.yyy; // 2.0*C.x = 1/3 = C.y
  vec3 x3 = x0 - D.yyy;      // -1.0+3.0*C.x = -0.5 = -D.y

// Permutations
  i = mod289(i);
  vec4 p = permute( permute( permute(
             i.z + vec4(0.0, i1.z, i2.z, 1.0 ))
           + i.y + vec4(0.0, i1.y, i2.y, 1.0 ))
           + i.x + vec4(0.0, i1.x, i2.x, 1.0 ));

// Gradients: 7x7 points over a square, mapped onto an octahedron.
// The ring size 17*17 = 289 is close to a multiple of 49 (49*6 = 294)
  float n_ = 0.142857142857; // 1.0/7.0
  vec3  ns = n_ * D.wyz - D.xzx;

  vec4 j = p - 49.0 * floor(p * ns.z * ns.z);  //  mod(p,7*7)

  vec4 x_ = floor(j * ns.z);
  vec4 y_ = floor(j - 7.0 * x_ );    // mod(j,N)

  vec4 x = x_ *ns.x + ns.yyyy;
  vec4 y = y_ *ns.x + ns.yyyy;
  vec4 h = 1.0 - abs(x) - abs(y);

  vec4 b0 = vec4( x.xy, y.xy );
  vec4 b1 = vec4( x.zw, y.zw );

  //vec4 s0 = vec4(lessThan(b0,0.0))*2.0 - 1.0;
  //vec4 s1 = vec4(lessThan(b1,0.0))*2.0 - 1.0;
  vec4 s0 = floor(b0)*2.0 + 1.0;
  vec4 s1 = floor(b1)*2.0 + 1.0;
  vec4 sh = -step(h, vec4(0.0));

  vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy ;
  vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww ;

  vec3 p0 = vec3(a0.xy,h.x);
  vec3 p1 = vec3(a0.zw,h.y);
  vec3 p2 = vec3(a1.xy,h.z);
  vec3 p3 = vec3(a1.zw,h.w);

//Normalise gradients
  vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
  p0 *= norm.x;
  p1 *= norm.y;
  p2 *= norm.z;
  p3 *= norm.w;

// Mix final noise value
  vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
  m = m * m;
  return 42.0 * dot( m*m, vec4( dot(p0,x0), dot(p1,x1),
                                dot(p2,x2), dot(p3,x3) ) );
}
`;
///////////////////////////////////////////////////////////////////////


// --------- Creating Road , Terrain and Grid asset ------- //

const planeGeom = new THREE.PlaneBufferGeometry(100, 100, 200, 200);
planeGeom.rotateX(-Math.PI * 0.5);
const planeMat = new THREE.MeshBasicMaterial({
    color: 0xff00ee
});
planeMat.onBeforeCompile = shader => {
    shader.uniforms.time = { value: 0 };
    shader.vertexShader =
        `
    uniform float time;
    varying vec3 vPos;
  ` + noise + shader.vertexShader;
    shader.vertexShader = shader.vertexShader.replace(
        `#include <begin_vertex>`,
        `#include <begin_vertex>
      vec2 tuv = uv;
      float t = time * 0.01 * ${speed}.;
      tuv.y += t;
      transformed.y = snoise(vec3(tuv * 5., 0.)) * 5.;
      transformed.y *= smoothstep(5., 15., abs(transformed.x)); // road stripe
      vPos = transformed;
    `
    );
    shader.fragmentShader =
        `
    #extension GL_OES_standard_derivatives : enable

    uniform float time;
    varying vec3 vPos;

    float line(vec3 position, float width, vec3 step){
      vec3 tempCoord = position / step;

      vec2 coord = tempCoord.xz;
      coord.y -= time * ${speed}. / 2.;

      vec2 grid = abs(fract(coord - 0.5) - 0.5) / fwidth(coord * width);
      float line = min(grid.x, grid.y);

      return min(line, 1.0);
    }
  ` + shader.fragmentShader;
    shader.fragmentShader = shader.fragmentShader.replace(
        `gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,
        `
    float l = line(vPos, 2.0, vec3(2.0));
    vec3 base = mix(vec3(0, 0.75, 1), vec3(0), smoothstep(5., 7.5, abs(vPos.x)));
    vec3 c = mix(outgoingLight, base, l);
    gl_FragColor = vec4(c, diffuseColor.a);
    `
    );
    materialShaders.push(shader);
};
//////////////////////////////////////////////



// ------------- Palm Tress Asset Creation ----------- //

const palmGeoms = [];
// log
const logGeom = new THREE.CylinderBufferGeometry(0.25, 0.125, 10, 5, 4, true);
logGeom.translate(0, 5, 0);
palmGeoms.push(logGeom);
// leaves
for (let i = 0; i < 20; i++) {
    let leafGeom = new THREE.CircleBufferGeometry(1.25, 4);
    leafGeom.translate(0, 1.25, 0);
    leafGeom.rotateX(-Math.PI * 0.5);
    leafGeom.scale(0.25, 1, THREE.Math.randFloat(1, 1.5));
    leafGeom.attributes.position.setY(0, 0.25);
    leafGeom.rotateX(THREE.Math.randFloatSpread(Math.PI * 0.5));
    leafGeom.rotateY(THREE.Math.randFloat(0, Math.PI * 2));
    leafGeom.translate(0, 10, 0);
    palmGeoms.push(leafGeom);
}
// merge
const palmGeom = THREE.BufferGeometryUtils.mergeBufferGeometries(palmGeoms, false);
palmGeom.rotateZ(THREE.Math.degToRad(-1.5));
// instancing
const instPalm = new THREE.InstancedBufferGeometry();
instPalm.attributes.position = palmGeom.attributes.position;
instPalm.attributes.uv = palmGeom.attributes.uv;
instPalm.index = palmGeom.index;
const palmPos = [];
for (let i = 0; i < 5; i++) {
    palmPos.push(-5, 0, i * 20 - 10 - 50);
    palmPos.push(5, 0, i * 20 - 50);
}
instPalm.setAttribute(
    "instPosition",
    new THREE.InstancedBufferAttribute(new Float32Array(palmPos), 3)
);

const palmMat = new THREE.MeshBasicMaterial({ color: 0x4B8920, side: THREE.DoubleSide });
palmMat.onBeforeCompile = shader => {
    shader.uniforms.time = { value: 0 };
    shader.vertexShader =
        `
    uniform float time;
    attribute vec3 instPosition;
  ` + shader.vertexShader;
    shader.vertexShader = shader.vertexShader.replace(
        `#include <begin_vertex>`,
        `#include <begin_vertex>

      transformed.x *= sign(instPosition.x); // flip
      vec3 ip = instPosition;
      ip.z = mod(50. + ip.z + time * ${speed}., 100.) - 50.;
      transformed *= 0.4 + smoothstep(50., 45., abs(ip.z)) * 0.6;
      transformed += ip;
    `
    );
    materialShaders.push(shader);
}
/////////////////////////////////////////////////////////////////////////



