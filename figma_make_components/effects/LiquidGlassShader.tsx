import { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { decodeToCanvas } from '../../lib/utils/blurhash';

interface ShaderUniforms {
  time: number;
  width: number;
  height: number;
  mouseX: number;
  mouseY: number;
  tintR: number;
  tintG: number;
  tintB: number;
  saturation: number;
  distortion: number;
  blur: number;
  glassMode: 'light' | 'dark';
  shadowIntensity: number;
  shadowOffsetX: number;
  shadowOffsetY: number;
  shadowBlur: number;
  cornerRadius: number;
  chromaticAberration: number;
  shape: string;
  donutThickness: number;
  starPoints: number;
  starInnerRadius: number;
}

interface BackgroundMedia {
  url: string;
  type: 'image' | 'video';
  blurhash?: string;
}

interface LiquidGlassShaderProps {
  backgroundMedia: BackgroundMedia;
  uniforms: ShaderUniforms;
  className?: string;
  isTransitioning?: boolean;
  onReady?: () => void;
}

export default function LiquidGlassShader({ 
  backgroundMedia, 
  uniforms, 
  className, 
  isTransitioning = false, 
  onReady 
}: LiquidGlassShaderProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const programRef = useRef<WebGLProgram | null>(null);
  const textureRef = useRef<WebGLTexture | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const animationRef = useRef<number>();
  const startTimeRef = useRef<number>(Date.now());
  const imageAspectRef = useRef<number>(1);
  const lastResizeRef = useRef<string>('');
  
  const uniformLocationsRef = useRef<Record<string, WebGLUniformLocation | null>>({});
  
  const [hasDerivatives, setHasDerivatives] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const [isShaderReady, setIsShaderReady] = useState(false);

  const vertexShaderSource = `
    attribute vec2 a_position;
    attribute vec2 a_texCoord;
    varying vec2 v_texCoord;
    
    void main() {
      gl_Position = vec4(a_position, 0.0, 1.0);
      v_texCoord = a_texCoord;
    }
  `;

  const getFragmentShaderSource = useCallback((hasDerivatives: boolean) => `
    #ifdef GL_OES_standard_derivatives
    #extension GL_OES_standard_derivatives : enable
    #endif
    
    precision mediump float;
    
    uniform float u_time;
    uniform vec2 u_resolution;
    uniform vec2 u_mouse;
    uniform sampler2D u_texture;
    uniform float u_width;
    uniform float u_height;
    uniform vec3 u_tint;
    uniform float u_saturation;
    uniform float u_distortion;
    uniform float u_blur;
    uniform float u_imageAspect;
    uniform float u_canvasAspect;
    uniform float u_glassMode;
    uniform float u_shadowIntensity;
    uniform vec2 u_shadowOffset;
    uniform float u_shadowBlur;
    uniform float u_cornerRadius;
    uniform float u_chromaticAberration;
    uniform float u_shape;
    uniform float u_donutThickness;
    uniform float u_starPoints;
    uniform float u_starInnerRadius;
    
    varying vec2 v_texCoord;
    
    #define PI 3.141592653589793
    
    vec2 getCoverUV(vec2 uv, float imageAspect, float canvasAspect) {
      vec2 coverUV = uv;
      
      if (imageAspect > canvasAspect) {
        float scale = canvasAspect / imageAspect;
        coverUV.x = (uv.x - 0.5) * scale + 0.5;
      } else {
        float scale = imageAspect / canvasAspect;
        coverUV.y = (uv.y - 0.5) * scale + 0.5;
      }
      
      return coverUV;
    }
    
    float sdRoundedRect(vec2 pos, vec2 halfSize, vec4 cornerRadius) {
      cornerRadius.xy = (pos.x > 0.0) ? cornerRadius.xy : cornerRadius.zw;
      cornerRadius.x = (pos.y > 0.0) ? cornerRadius.x : cornerRadius.y;
      
      vec2 q = abs(pos) - halfSize + cornerRadius.x;
      return min(max(q.x, q.y), 0.0) + length(max(q, 0.0)) - cornerRadius.x;
    }
    
    float sdCircle(vec2 pos, float radius) {
      return length(pos) - radius;
    }
    
    float getShapeSDF(vec2 pos) {
      if (u_shape < 0.5) {
        return sdRoundedRect(pos, vec2(u_width, u_height), vec4(u_cornerRadius));
      } else {
        float radius = min(u_width, u_height);
        return sdCircle(pos, radius);
      }
    }
    
    float boxSDF(vec2 uv) {
      return getShapeSDF(uv);
    }
    
    float shadowSDF(vec2 uv) {
      vec2 shadowPos = uv - u_shadowOffset;
      return getShapeSDF(shadowPos);
    }
    
    vec2 randomVec2(vec2 co) {
      return fract(sin(vec2(
        dot(co, vec2(127.1, 311.7)),
        dot(co, vec2(269.5, 183.3))
      )) * 43758.5453);
    }
    
    vec3 sampleWithNoise(vec2 uv, float timeOffset, float mipLevel) {
      vec2 coverUV = getCoverUV(uv, u_imageAspect, u_canvasAspect);
      vec2 offset = randomVec2(coverUV + vec2(u_time + timeOffset)) / u_resolution.x;
      return texture2D(u_texture, coverUV + offset * pow(2.0, mipLevel) * 0.01).rgb;
    }
    
    vec3 sampleWithChromaticAberration(vec2 uv, float timeOffset, float mipLevel, float aberrationStrength) {
      if (aberrationStrength <= 0.0) {
        return sampleWithNoise(uv, timeOffset, mipLevel);
      }
      
      vec2 coverUV = getCoverUV(uv, u_imageAspect, u_canvasAspect);
      vec2 center = vec2(0.5);
      vec2 direction = normalize(coverUV - center);
      float distance = length(coverUV - center);
      
      float aberrationOffset = aberrationStrength * distance * 0.01;
      vec2 offset = randomVec2(coverUV + vec2(u_time + timeOffset)) / u_resolution.x;
      vec2 noiseOffset = offset * pow(2.0, mipLevel) * 0.01;
      
      float r = texture2D(u_texture, coverUV + direction * aberrationOffset * 1.2 + noiseOffset).r;
      float g = texture2D(u_texture, coverUV + noiseOffset).g;
      float b = texture2D(u_texture, coverUV - direction * aberrationOffset * 0.8 + noiseOffset).b;
      
      return vec3(r, g, b);
    }
    
    vec3 getBlurredColor(vec2 uv, float mipLevel) {
      return (
        sampleWithChromaticAberration(uv, 0.0, mipLevel, u_chromaticAberration) +
        sampleWithChromaticAberration(uv, 0.25, mipLevel, u_chromaticAberration) +
        sampleWithChromaticAberration(uv, 0.5, mipLevel, u_chromaticAberration) +
        sampleWithChromaticAberration(uv, 0.75, mipLevel, u_chromaticAberration) +
        sampleWithChromaticAberration(uv, 1.0, mipLevel, u_chromaticAberration)
      ) * 0.2;
    }
    
    vec3 saturate(vec3 color, float factor) {
      float gray = dot(color, vec3(0.299, 0.587, 0.114));
      return mix(vec3(gray), color, factor);
    }
    
    vec2 computeRefractOffset(float sdf, vec2 fragCoord) {
      if (sdf < 0.1) {
        return vec2(0.0);
      }
      
      float epsilon = 2.0;
      vec2 h = vec2(epsilon, 0.0);
      vec2 centeredUV1 = (fragCoord + h.xy) - u_mouse;
      vec2 centeredUV2 = (fragCoord - h.xy) - u_mouse;
      vec2 centeredUV3 = (fragCoord + h.yx) - u_mouse;
      vec2 centeredUV4 = (fragCoord - h.yx) - u_mouse;
      
      float sdf1 = boxSDF(centeredUV1);
      float sdf2 = boxSDF(centeredUV2);
      float sdf3 = boxSDF(centeredUV3);
      float sdf4 = boxSDF(centeredUV4);
      
      vec2 grad = normalize(vec2(sdf1 - sdf2, sdf3 - sdf4));
      float offsetAmount = pow(abs(sdf), 12.0) * -0.05 * u_distortion;
      return grad * offsetAmount;
    }
    
    float highlight(float sdf, vec2 fragCoord) {
      if (sdf < 0.1) {
        return 0.0;
      }
      
      float epsilon = 2.0;
      vec2 h = vec2(epsilon, 0.0);
      vec2 centeredUV1 = (fragCoord + h.xy) - u_mouse;
      vec2 centeredUV2 = (fragCoord - h.xy) - u_mouse;
      vec2 centeredUV3 = (fragCoord + h.yx) - u_mouse;
      vec2 centeredUV4 = (fragCoord - h.yx) - u_mouse;
      
      float sdf1 = boxSDF(centeredUV1);
      float sdf2 = boxSDF(centeredUV2);
      float sdf3 = boxSDF(centeredUV3);
      float sdf4 = boxSDF(centeredUV4);
      
      vec2 grad = normalize(vec2(sdf1 - sdf2, sdf3 - sdf4));
      return 1.0 - clamp(pow(1.0 - abs(dot(grad, vec2(-0.707, 0.707))), 0.5), 0.0, 1.0);
    }
    
    void main() {
      vec2 fragCoord = v_texCoord * u_resolution;
      vec2 centeredUV = fragCoord - u_mouse;
      float sdf = boxSDF(centeredUV);
      
      float normalizedInside = (sdf / u_height) + 1.0;
      float edgeBlendFactor = pow(normalizedInside, 12.0);
      
      vec2 coverUV = getCoverUV(v_texCoord, u_imageAspect, u_canvasAspect);
      vec3 baseTex = texture2D(u_texture, coverUV).rgb;
      
      vec2 sampleUV = v_texCoord + computeRefractOffset(normalizedInside, fragCoord);
      float mipLevel = mix(3.5 * u_blur, 1.5, edgeBlendFactor);
      
      vec3 blurredTex = getBlurredColor(sampleUV, mipLevel);
      blurredTex = mix(blurredTex, pow(saturate(blurredTex, u_saturation), vec3(0.5)), edgeBlendFactor);
      blurredTex *= u_tint;
      
      if (u_glassMode > 0.5) {
        blurredTex = mix(blurredTex, blurredTex * 0.7, 0.3);
        blurredTex += mix(0.0, 0.4, clamp(highlight(normalizedInside, fragCoord) * pow(edgeBlendFactor, 3.0), 0.0, 1.0));
        float rimLight = smoothstep(0.0, 0.2, sdf) * smoothstep(1.5, 0.3, sdf) * 0.15;
        blurredTex += vec3(rimLight);
      } else {
        blurredTex += mix(0.0, 0.3, clamp(highlight(normalizedInside, fragCoord) * pow(edgeBlendFactor, 5.0), 0.0, 1.0));
        blurredTex = mix(blurredTex, blurredTex * 1.1, 0.2);
      }
      
      float boxMask = 1.0 - clamp(sdf, 0.0, 1.0);
      gl_FragColor = vec4(mix(baseTex, blurredTex, vec3(boxMask)), 1.0);
    }
  `, [hasDerivatives]);

  const createShader = useCallback((gl: WebGLRenderingContext, type: number, source: string) => {
    const shader = gl.createShader(type);
    if (!shader) return null;
    
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      console.error('Shader compilation error:', gl.getShaderInfoLog(shader));
      gl.deleteShader(shader);
      return null;
    }
    
    return shader;
  }, []);

  const createProgram = useCallback((gl: WebGLRenderingContext, vertexShader: WebGLShader, fragmentShader: WebGLShader) => {
    const program = gl.createProgram();
    if (!program) return null;
    
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      console.error('Program linking error:', gl.getProgramInfoLog(program));
      gl.deleteProgram(program);
      return null;
    }
    
    return program;
  }, []);

  const createWhiteTexture = useCallback((gl: WebGLRenderingContext) => {
    const canvas2d = document.createElement('canvas');
    canvas2d.width = canvas2d.height = 512;
    const ctx = canvas2d.getContext('2d')!;
    
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 512, 512);
    
    return canvas2d;
  }, []);

  const loadTexture = useCallback((gl: WebGLRenderingContext, media: BackgroundMedia) => {
    const texture = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, texture);
    
    const initialCanvas = createWhiteTexture(gl);
    
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, initialCanvas);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

    if (media.type === 'video') {
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.removeAttribute('src');
      }
      
      const video = document.createElement('video');
      video.crossOrigin = 'anonymous';
      video.muted = true;
      video.loop = true;
      video.playsInline = true;
      video.autoplay = true;
      
      video.addEventListener('loadedmetadata', () => {
        imageAspectRef.current = video.videoWidth / video.videoHeight;
        setIsImageLoaded(true);
      });
      
      video.addEventListener('canplaythrough', () => {
        video.play().catch(e => {
          console.warn('Video autoplay failed:', e);
        });
      });
      
      video.src = media.url;
      videoRef.current = video;
    } else {
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.removeAttribute('src');
        videoRef.current = null;
      }
      
      if (media.url) {
        const image = new Image();
        image.crossOrigin = 'anonymous';
        image.onload = () => {
          imageAspectRef.current = image.width / image.height;
          setIsImageLoaded(true);
          
          gl.bindTexture(gl.TEXTURE_2D, texture);
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        };
        image.onerror = () => {
          console.warn('Failed to load image:', media.url);
          setIsImageLoaded(false);
        };
        image.src = media.url;
      }
    }
    
    return texture;
  }, [createWhiteTexture]);

  const updateVideoTexture = useCallback((gl: WebGLRenderingContext, texture: WebGLTexture, video: HTMLVideoElement) => {
    if (video.readyState >= video.HAVE_CURRENT_DATA) {
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    }
  }, []);

  const getShapeUniform = useCallback((shape: string): number => {
    switch (shape) {
      case 'rectangle': return 0.0;
      case 'circle': return 1.0;
      default: return 0.0;
    }
  }, []);

  const cacheUniformLocations = useCallback((gl: WebGLRenderingContext, program: WebGLProgram) => {
    const uniformNames = [
      'u_time', 'u_resolution', 'u_mouse', 'u_texture', 'u_width', 'u_height',
      'u_tint', 'u_saturation', 'u_distortion', 'u_blur', 'u_imageAspect',
      'u_canvasAspect', 'u_glassMode', 'u_shadowIntensity', 'u_shadowOffset', 
      'u_shadowBlur', 'u_cornerRadius', 'u_chromaticAberration', 'u_shape',
      'u_donutThickness', 'u_starPoints', 'u_starInnerRadius'
    ];
    
    const locations: Record<string, WebGLUniformLocation | null> = {};
    uniformNames.forEach(name => {
      locations[name] = gl.getUniformLocation(program, name);
    });
    
    uniformLocationsRef.current = locations;
  }, []);

  useEffect(() => {
    if (programRef.current && textureRef.current && !isShaderReady) {
      const timer = setTimeout(() => {
        setIsShaderReady(true);
        onReady?.();
      }, 200);
      
      return () => clearTimeout(timer);
    }
  }, [isShaderReady, onReady]);

  const fragmentShaderSource = useMemo(() => getFragmentShaderSource(hasDerivatives), [hasDerivatives, getFragmentShaderSource]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const gl = canvas.getContext('webgl');
    if (!gl) {
      console.error('WebGL not supported');
      return;
    }

    glRef.current = gl;

    const derivativeExt = gl.getExtension('OES_standard_derivatives');
    const hasDerivativesSupport = !!derivativeExt;
    setHasDerivatives(hasDerivativesSupport);

    const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
    
    if (!vertexShader || !fragmentShader) return;

    const program = createProgram(gl, vertexShader, fragmentShader);
    if (!program) return;

    programRef.current = program;
    cacheUniformLocations(gl, program);

    const vertices = new Float32Array([
      -1, -1, 0, 1,
       1, -1, 1, 1,
      -1,  1, 0, 0,
       1,  1, 1, 0,
    ]);

    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    const positionLocation = gl.getAttribLocation(program, 'a_position');
    const texCoordLocation = gl.getAttribLocation(program, 'a_texCoord');

    gl.enableVertexAttribArray(positionLocation);
    gl.enableVertexAttribArray(texCoordLocation);

    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 16, 0);
    gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 16, 8);

    setIsImageLoaded(false);
    if (backgroundMedia.url) {
      textureRef.current = loadTexture(gl, backgroundMedia);
    } else {
      const texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      const whiteCanvas = createWhiteTexture(gl);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, whiteCanvas);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      textureRef.current = texture;
      imageAspectRef.current = 1.0;
      setIsImageLoaded(true);
    }

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.removeAttribute('src');
      }
    };
  }, [backgroundMedia, createShader, createProgram, loadTexture, createWhiteTexture, fragmentShaderSource, cacheUniformLocations]);

  useEffect(() => {
    const render = () => {
      const canvas = canvasRef.current;
      const gl = glRef.current;
      const program = programRef.current;
      const texture = textureRef.current;

      if (!canvas || !gl || !program || !texture) return;

      const currentSize = `${canvas.offsetWidth}x${canvas.offsetHeight}`;
      if (lastResizeRef.current !== currentSize) {
        canvas.width = canvas.offsetWidth * devicePixelRatio;
        canvas.height = canvas.offsetHeight * devicePixelRatio;
        gl.viewport(0, 0, canvas.width, canvas.height);
        lastResizeRef.current = currentSize;
      }

      const canvasAspect = canvas.width / canvas.height;

      if (videoRef.current && backgroundMedia.type === 'video') {
        updateVideoTexture(gl, texture, videoRef.current);
      }

      gl.useProgram(program);

      const locations = uniformLocationsRef.current;

      gl.uniform1f(locations.u_time, (Date.now() - startTimeRef.current) / 1000);
      gl.uniform2f(locations.u_resolution, canvas.width, canvas.height);
      gl.uniform2f(locations.u_mouse, uniforms.mouseX * devicePixelRatio, uniforms.mouseY * devicePixelRatio);
      gl.uniform1i(locations.u_texture, 0);
      gl.uniform1f(locations.u_width, uniforms.width);
      gl.uniform1f(locations.u_height, uniforms.height);
      gl.uniform3f(locations.u_tint, uniforms.tintR, uniforms.tintG, uniforms.tintB);
      gl.uniform1f(locations.u_saturation, uniforms.saturation);
      gl.uniform1f(locations.u_distortion, uniforms.distortion);
      gl.uniform1f(locations.u_blur, uniforms.blur);
      gl.uniform1f(locations.u_imageAspect, imageAspectRef.current);
      gl.uniform1f(locations.u_canvasAspect, canvasAspect);
      gl.uniform1f(locations.u_glassMode, uniforms.glassMode === 'dark' ? 1.0 : 0.0);
      gl.uniform1f(locations.u_shadowIntensity, uniforms.shadowIntensity);
      gl.uniform2f(locations.u_shadowOffset, uniforms.shadowOffsetX, uniforms.shadowOffsetY);
      gl.uniform1f(locations.u_shadowBlur, uniforms.shadowBlur);
      gl.uniform1f(locations.u_cornerRadius, uniforms.cornerRadius);
      gl.uniform1f(locations.u_chromaticAberration, uniforms.chromaticAberration);
      gl.uniform1f(locations.u_shape, getShapeUniform(uniforms.shape));
      gl.uniform1f(locations.u_donutThickness, uniforms.donutThickness);
      gl.uniform1f(locations.u_starPoints, uniforms.starPoints);
      gl.uniform1f(locations.u_starInnerRadius, uniforms.starInnerRadius);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);

      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      animationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [uniforms, backgroundMedia, isTransitioning, updateVideoTexture, getShapeUniform]);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ width: '100%', height: '100%' }}
    />
  );
}



