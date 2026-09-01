"use client";

import { useEffect, useRef, useState } from "react";

/**
 * The hero's 3D field: a slowly turning lattice of eight-pointed stars —
 * the khatim, the most common motif in Islamic geometric ornament.
 *
 * Three.js is imported inside the effect so it is code-split out of the
 * initial bundle, and the whole thing degrades to a still frame when the
 * viewer has asked for reduced motion.
 */
export function Hero3D() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    let disposed = false;
    let cleanup: (() => void) | undefined;

    (async () => {
      let THREE: typeof import("three");
      try {
        THREE = await import("three");
      } catch {
        setFailed(true);
        return;
      }
      if (disposed || !mountRef.current) return;

      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      const scene = new THREE.Scene();
      scene.fog = new THREE.Fog(0x041a33, 9, 26);

      const camera = new THREE.PerspectiveCamera(
        42,
        mount.clientWidth / Math.max(mount.clientHeight, 1),
        0.1,
        100,
      );
      camera.position.set(0, 0, 13);

      const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.setSize(mount.clientWidth, mount.clientHeight);
      mount.appendChild(renderer.domElement);

      /** An eight-pointed star (khatim) as a flat shape, ready to extrude. */
      function starShape(outer: number, inner: number, points = 8) {
        const shape = new THREE.Shape();
        const step = Math.PI / points;
        for (let i = 0; i < points * 2; i++) {
          const r = i % 2 === 0 ? outer : inner;
          const a = i * step - Math.PI / 2;
          const x = Math.cos(a) * r;
          const y = Math.sin(a) * r;
          if (i === 0) shape.moveTo(x, y);
          else shape.lineTo(x, y);
        }
        shape.closePath();
        return shape;
      }

      const extrude = { depth: 0.16, bevelEnabled: true, bevelSize: 0.05, bevelThickness: 0.05, bevelSegments: 2 };

      const brand = new THREE.Color(0x1591dc);
      const gold = new THREE.Color(0xd6a24a);

      const group = new THREE.Group();
      // Sit the field to the right so it frames the headline instead of
      // running underneath it.
      group.position.set(3.1, 0.4, 0);
      scene.add(group);

      // The central star, drawn as a lit solid with a wireframe cage over it.
      const centreGeo = new THREE.ExtrudeGeometry(starShape(1.95, 0.82), extrude);
      centreGeo.center();
      const centre = new THREE.Mesh(
        centreGeo,
        new THREE.MeshStandardMaterial({
          color: brand,
          metalness: 0.35,
          roughness: 0.42,
          emissive: brand.clone().multiplyScalar(0.12),
        }),
      );
      group.add(centre);

      const cage = new THREE.LineSegments(
        new THREE.EdgesGeometry(centreGeo),
        new THREE.LineBasicMaterial({ color: gold, transparent: true, opacity: 0.55 }),
      );
      group.add(cage);

      // A ring of smaller stars, the way a girih pattern repeats around a centre.
      const ringGeo = new THREE.ExtrudeGeometry(starShape(0.62, 0.26), {
        ...extrude,
        depth: 0.1,
      });
      ringGeo.center();
      // Light blue, so the single gold note stays on the central star's cage.
      const ringMat = new THREE.MeshStandardMaterial({
        color: new THREE.Color(0x9fd8f8),
        metalness: 0.4,
        roughness: 0.3,
        emissive: new THREE.Color(0x1a5f92),
        transparent: true,
        opacity: 0.8,
      });
      const satellites: InstanceType<typeof THREE.Mesh>[] = [];
      const RING = 8;
      for (let i = 0; i < RING; i++) {
        const m = new THREE.Mesh(ringGeo, ringMat);
        const a = (i / RING) * Math.PI * 2;
        m.position.set(Math.cos(a) * 3.9, Math.sin(a) * 3.9, Math.sin(a * 2) * 0.7);
        m.rotation.z = a;
        group.add(m);
        satellites.push(m);
      }

      // Depth: a soft field of points behind everything.
      const COUNT = 420;
      const positions = new Float32Array(COUNT * 3);
      for (let i = 0; i < COUNT; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 34;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 22;
        positions[i * 3 + 2] = -Math.random() * 20 - 2;
      }
      const pointsGeo = new THREE.BufferGeometry();
      pointsGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
      const dust = new THREE.Points(
        pointsGeo,
        new THREE.PointsMaterial({ color: 0x8fd0f7, size: 0.055, transparent: true, opacity: 0.5 }),
      );
      scene.add(dust);

      scene.add(new THREE.AmbientLight(0xffffff, 0.55));
      const key = new THREE.DirectionalLight(0xffffff, 1.5);
      key.position.set(4, 6, 8);
      scene.add(key);
      const rim = new THREE.DirectionalLight(0x4aa8e8, 0.9);
      rim.position.set(-6, -3, 4);
      scene.add(rim);

      // Pointer parallax, damped so it never feels twitchy.
      const target = { x: 0, y: 0 };
      const onPointer = (e: PointerEvent) => {
        const r = mount.getBoundingClientRect();
        target.x = ((e.clientX - r.left) / r.width - 0.5) * 0.5;
        target.y = ((e.clientY - r.top) / r.height - 0.5) * 0.35;
      };
      if (!reduced) window.addEventListener("pointermove", onPointer, { passive: true });

      const onResize = () => {
        if (!mountRef.current) return;
        const w = mount.clientWidth;
        const h = Math.max(mount.clientHeight, 1);
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h);
      };
      window.addEventListener("resize", onResize);

      // Pause when off-screen or the tab is hidden — no wasted frames.
      let visible = true;
      const io = new IntersectionObserver(([entry]) => (visible = entry.isIntersecting), {
        threshold: 0.01,
      });
      io.observe(mount);
      const onVisibility = () => (visible = !document.hidden);
      document.addEventListener("visibilitychange", onVisibility);

      let raf = 0;
      const start = performance.now();

      const render = (now: number) => {
        raf = requestAnimationFrame(render);
        if (!visible) return;

        const t = (now - start) / 1000;
        group.rotation.y += (target.x - group.rotation.y) * 0.04;
        group.rotation.x += (target.y - group.rotation.x) * 0.04;
        centre.rotation.z = t * 0.07;
        cage.rotation.z = t * 0.07;
        satellites.forEach((m, i) => {
          const a = (i / RING) * Math.PI * 2 + t * 0.12;
          m.position.set(Math.cos(a) * 3.9, Math.sin(a) * 3.9, Math.sin(a * 2 + t * 0.3) * 0.7);
          m.rotation.z = a * 1.5;
        });
        dust.rotation.z = t * 0.01;

        renderer.render(scene, camera);
      };

      if (reduced) {
        renderer.render(scene, camera);
      } else {
        raf = requestAnimationFrame(render);
      }

      cleanup = () => {
        cancelAnimationFrame(raf);
        io.disconnect();
        document.removeEventListener("visibilitychange", onVisibility);
        window.removeEventListener("resize", onResize);
        window.removeEventListener("pointermove", onPointer);
        renderer.dispose();
        centreGeo.dispose();
        ringGeo.dispose();
        pointsGeo.dispose();
        scene.traverse((o) => {
          const mesh = o as { material?: { dispose?: () => void } };
          mesh.material?.dispose?.();
        });
        if (renderer.domElement.parentNode === mount) mount.removeChild(renderer.domElement);
      };
    })();

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      aria-hidden
      className={`absolute inset-0 ${failed ? "hidden" : ""}`}
      // The canvas is pure ornament; the hero reads fine without it.
    />
  );
}
