"use client";

import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "@/lib/motion";

const BRAND = {
  blue: 0x004aad,
  yellow: 0xffde59,
  red: 0xff3131,
} as const;

export function HeroThreeDecoration() {
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (!host || prefersReducedMotion()) return;

    const prefersDesktop = window.matchMedia("(min-width: 768px)").matches;
    if (!prefersDesktop) return;

    let disposed = false;
    let frame = 0;
    let renderer: import("three").WebGLRenderer | null = null;
    let resizeObserver: ResizeObserver | null = null;
    let intersectionObserver: IntersectionObserver | null = null;
    let visible = true;

    void import("three").then((THREE) => {
      if (disposed || !host) return;

      const width = host.clientWidth || 320;
      const height = host.clientHeight || 320;

      renderer = new THREE.WebGLRenderer({
        alpha: true,
        antialias: true,
        powerPreference: "low-power",
      });
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
      renderer.setSize(width, height, false);
      renderer.domElement.className = "h-full w-full";
      host.appendChild(renderer.domElement);

      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(42, width / height, 0.1, 20);
      camera.position.set(0, 0.15, 3.6);

      const ambient = new THREE.AmbientLight(0xffffff, 0.85);
      scene.add(ambient);
      const key = new THREE.DirectionalLight(0xffffff, 0.9);
      key.position.set(2, 3, 4);
      scene.add(key);
      const fill = new THREE.DirectionalLight(BRAND.yellow, 0.35);
      fill.position.set(-3, -1, 2);
      scene.add(fill);

      const group = new THREE.Group();

      const giftBody = new THREE.Mesh(
        new THREE.BoxGeometry(1.05, 0.72, 0.72),
        new THREE.MeshStandardMaterial({
          color: BRAND.blue,
          roughness: 0.35,
          metalness: 0.08,
        }),
      );
      giftBody.position.y = -0.08;
      group.add(giftBody);

      const giftLid = new THREE.Mesh(
        new THREE.BoxGeometry(1.12, 0.22, 0.78),
        new THREE.MeshStandardMaterial({
          color: BRAND.blue,
          roughness: 0.28,
          metalness: 0.12,
        }),
      );
      giftLid.position.y = 0.38;
      group.add(giftLid);

      const ribbonMat = new THREE.MeshStandardMaterial({
        color: BRAND.yellow,
        roughness: 0.4,
        metalness: 0.05,
      });
      const ribbonV = new THREE.Mesh(new THREE.BoxGeometry(0.14, 0.95, 0.8), ribbonMat);
      ribbonV.position.y = 0.05;
      group.add(ribbonV);
      const ribbonH = new THREE.Mesh(new THREE.BoxGeometry(1.14, 0.14, 0.8), ribbonMat);
      ribbonH.position.y = 0.05;
      group.add(ribbonH);

      const heart = new THREE.Mesh(
        new THREE.SphereGeometry(0.11, 16, 16),
        new THREE.MeshStandardMaterial({
          color: BRAND.red,
          roughness: 0.3,
          emissive: BRAND.red,
          emissiveIntensity: 0.15,
        }),
      );
      heart.position.set(0.72, 0.62, 0.35);
      group.add(heart);

      const star = new THREE.Mesh(
        new THREE.OctahedronGeometry(0.14, 0),
        new THREE.MeshStandardMaterial({
          color: BRAND.yellow,
          roughness: 0.25,
          metalness: 0.1,
        }),
      );
      star.position.set(-0.78, 0.55, -0.2);
      group.add(star);

      group.rotation.set(0.35, -0.55, 0.08);
      scene.add(group);

      const tick = (time: number) => {
        if (disposed || !renderer) return;
        frame = requestAnimationFrame(tick);
        if (!visible) return;
        const t = time * 0.001;
        group.rotation.y = -0.55 + Math.sin(t * 0.55) * 0.35;
        group.rotation.x = 0.35 + Math.sin(t * 0.4) * 0.12;
        group.position.y = Math.sin(t * 0.9) * 0.06;
        star.rotation.y += 0.02;
        renderer.render(scene, camera);
      };

      const onResize = () => {
        if (!host || !renderer) return;
        const w = host.clientWidth;
        const h = host.clientHeight;
        if (w < 1 || h < 1) return;
        camera.aspect = w / h;
        camera.updateProjectionMatrix();
        renderer.setSize(w, h, false);
      };

      resizeObserver = new ResizeObserver(onResize);
      resizeObserver.observe(host);

      intersectionObserver = new IntersectionObserver(
        ([entry]) => {
          visible = entry?.isIntersecting ?? true;
        },
        { threshold: 0.05 },
      );
      intersectionObserver.observe(host);

      frame = requestAnimationFrame(tick);
    });

    return () => {
      disposed = true;
      cancelAnimationFrame(frame);
      resizeObserver?.disconnect();
      intersectionObserver?.disconnect();
      if (renderer) {
        renderer.dispose();
        renderer.domElement.remove();
      }
      host.replaceChildren();
    };
  }, []);

  return (
    <div
      ref={hostRef}
      className="lp-hero-three pointer-events-none absolute inset-y-0 right-0 hidden w-[min(48vw,22rem)] md:block"
      aria-hidden
    />
  );
}
