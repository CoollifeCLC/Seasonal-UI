import React, { useEffect, useRef } from "react";

type Drop = {x:number;y:number;vx:number;vy:number;len:number};
type Flake = {x:number;y:number;vx:number;vy:number;r:number};
type Leaf = {x:number;y:number;vx:number;vy:number;spin:number;size:number};
type Cloud = {x:number;y:number;vx:number;w:number;h:number;alpha:number};

export default function WeatherFX() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const ctx = canvas.getContext("2d")!;
    let raf = 0, w = 0, h = 0, dpr = 1;

    let drops: Drop[] = [];     // rain/storm
    let flakes: Flake[] = [];   // snow
    let leaves: Leaf[] = [];    // wind
    let clouds: Cloud[] = [];   // cloudy
    let fogAlpha = 0;           // fog
    let lightningCooldown = 0;  // storm

    const html = document.documentElement;
    const wx = () => html.dataset.wx || "clear";
    const fxOpacity = () => {
      const v = parseFloat(getComputedStyle(html).getPropertyValue("--fx-opacity"));
      return Number.isFinite(v) ? Math.max(0, Math.min(1, v)) : 0;
    };

    function resetParticles(kind = wx()) {
      drops = []; flakes = []; leaves = []; clouds = []; fogAlpha = 0;
      const area = w*h;
      // densities tuned for perf
      const rainCount   = Math.min(350, Math.floor(area/13000));
      const snowCount   = Math.min(200, Math.floor(area/22000));
      const leafCount   = Math.min(120, Math.floor(area/30000));
      const cloudCount  = Math.min(8,   Math.floor(w/450));

      if (kind === "rain" || kind === "storm") {
        for (let i=0;i<rainCount;i++) drops.push(spawnDrop());
      }
      if (kind === "snow") {
        for (let i=0;i<snowCount;i++) flakes.push(spawnFlake());
      }
      if (kind === "wind") {
        for (let i=0;i<leafCount;i++) leaves.push(spawnLeaf());
      }
      if (kind === "cloudy") {
        for (let i=0;i<cloudCount;i++) clouds.push(spawnCloud());
      }
      if (kind === "fog") {
        fogAlpha = 0.25; // base fog layer
      }
    }

    function resize() {
      dpr = Math.max(1, window.devicePixelRatio || 1);
      canvas.width = Math.floor(window.innerWidth*dpr);
      canvas.height = Math.floor(window.innerHeight*dpr);
      canvas.style.width = window.innerWidth+"px";
      canvas.style.height = window.innerHeight+"px";
      ctx.setTransform(dpr,0,0,dpr,0,0);
      w = window.innerWidth; h = window.innerHeight;
      resetParticles();
    }

    function rnd(a:number,b:number){ return a + Math.random()*(b-a); }

    // spawners
    function spawnDrop(): Drop {
      return { x:rnd(-20,w+20), y:rnd(-h,0), vx:rnd(-1.4,-0.4), vy:rnd(7,12), len:rnd(8,16) };
    }
    function spawnFlake(): Flake {
      return { x:rnd(0,w), y:rnd(-h,0), vx:rnd(-0.3,0.3), vy:rnd(0.6,1.6), r:rnd(1,2.4) };
    }
    function spawnLeaf(): Leaf {
      return { x:rnd(-40,w+40), y:rnd(-20,h*0.2), vx:rnd(1.2,2.4), vy:rnd(0.6,1.2), spin:rnd(0,Math.PI*2), size:rnd(6,12) };
    }
    function spawnCloud(): Cloud {
      return { x:rnd(-200,w+200), y:rnd(20,h*0.35), vx:rnd(0.08,0.18), w:rnd(160,320), h:rnd(60,120), alpha:rnd(0.08,0.14) };
    }

    function drawLightning() {
      // occasional vertical strike from top
      if (lightningCooldown > 0) { lightningCooldown--; return; }
      if (Math.random() < 0.006) {
        lightningCooldown = 180; // ~3s at 60fps
        const x = rnd(w*0.15, w*0.85);
        const segments = 6 + Math.floor(Math.random()*5);
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        ctx.strokeStyle = "rgba(255,255,255,0.85)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, -20);
        let cx = x, cy = 0;
        for(let i=0;i<segments;i++){
          cx += rnd(-30,30);
          cy += rnd(40,70);
          ctx.lineTo(cx, cy);
        }
        ctx.stroke();
        // screen flash
        ctx.fillStyle = "rgba(255,255,255,0.08)";
        ctx.fillRect(0,0,w,h);
        ctx.restore();
      }
    }

    function drawCloud(c: Cloud) {
      ctx.save();
      ctx.globalAlpha = c.alpha;
      const g = ctx.createLinearGradient(c.x, c.y, c.x, c.y+c.h);
      g.addColorStop(0, "rgba(255,255,255,0.55)");
      g.addColorStop(1, "rgba(255,255,255,0.0)");
      ctx.fillStyle = g;
      // simple blobby cloud: 3 ellipses
      ctx.beginPath();
      ctx.ellipse(c.x, c.y, c.w*0.35, c.h*0.5, 0, 0, Math.PI*2);
      ctx.ellipse(c.x+c.w*0.35, c.y+10, c.w*0.45, c.h*0.65, 0, 0, Math.PI*2);
      ctx.ellipse(c.x-c.w*0.35, c.y+10, c.w*0.45, c.h*0.65, 0, 0, Math.PI*2);
      ctx.fill();
      ctx.restore();
      c.x += c.vx;
      if (c.x > w + 260) Object.assign(c, spawnCloud(), { x: -260 });
    }

    function drawLeaf(l: Leaf) {
      // simple lozenge leaf with rotation
      l.spin += 0.06; // tumble
      ctx.save();
      ctx.translate(l.x, l.y);
      ctx.rotate(Math.sin(l.spin)*0.6);
      ctx.fillStyle = "rgba(214, 164, 84, 0.9)"; // golden leaf
      const s = l.size;
      ctx.beginPath();
      ctx.moveTo(0, -s*0.6);
      ctx.quadraticCurveTo(s*0.7, 0, 0, s*0.6);
      ctx.quadraticCurveTo(-s*0.7, 0, 0, -s*0.6);
      ctx.fill();
      ctx.restore();
      l.x += l.vx; l.y += l.vy + Math.sin(l.spin)*0.2;
      if (l.x > w+30 || l.y > h+30) Object.assign(l, spawnLeaf(), { x: -20, y: rnd(0,h*0.3) });
    }

    function draw() {
      const kind = wx();
      const alpha = fxOpacity();
      ctx.clearRect(0,0,w,h);
      if (alpha <= 0) { raf = requestAnimationFrame(draw); return; }
      ctx.globalAlpha = alpha;

      // CLOUDY
      if (kind === "cloudy") {
        for (const c of clouds) drawCloud(c);
      }

      // FOG
      if (kind === "fog") {
        // softly brighten BG and lay a drifting fog sheet
        const t = performance.now()*0.00008;
        const grad = ctx.createRadialGradient(w*0.5 + Math.cos(t)*120, h*0.4 + Math.sin(t)*80, 80, w*0.5, h*0.5, Math.max(w,h));
        grad.addColorStop(0, `rgba(255,255,255,${fogAlpha*0.55})`);
        grad.addColorStop(1, `rgba(255,255,255,0)`);
        ctx.fillStyle = grad;
        ctx.fillRect(0,0,w,h);
      }

      // WIND
      if (kind === "wind") {
        for (const lf of leaves) drawLeaf(lf);
      }

      // RAIN/STORM
      if (kind === "rain" || kind === "storm") {
        ctx.strokeStyle = "rgba(255,255,255,0.75)";
        ctx.lineWidth = dpr > 1 ? 0.75 : 1;
        ctx.beginPath();
        for (const d of drops) {
          ctx.moveTo(d.x, d.y);
          ctx.lineTo(d.x + d.vx*2, d.y + d.vy*2);
          d.x += d.vx; d.y += d.vy;
          if (d.y > h || d.x < -30) Object.assign(d, spawnDrop(), { y: -10 });
        }
        ctx.stroke();
        if (kind === "storm") drawLightning();
      }

      // SNOW
      if (kind === "snow") {
        ctx.fillStyle = "rgba(255,255,255,0.92)";
        for (const f of flakes) {
          ctx.beginPath();
          ctx.arc(f.x, f.y, f.r, 0, Math.PI*2);
          ctx.fill();
          f.x += f.vx; f.y += f.vy;
          if (f.y > h+10) Object.assign(f, spawnFlake(), { y: -10, x: Math.random()*w });
        }
      }

      raf = requestAnimationFrame(draw);
    }

    function onVis(){ if (document.visibilityState === "hidden") cancelAnimationFrame(raf); else draw(); }

    resize(); draw();
    window.addEventListener("resize", resize);
    document.addEventListener("visibilitychange", onVis);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, []);

  return <canvas className="wx-layer" aria-hidden ref={ref} />;
}
