"use client";

import { useEffect, useRef } from "react";

/* ═══════════════════════════════════════════════════════
   Babylon.js Armillary Sphere
   Golden material · Layered celestial ring rotations
   Locked vertical view · Auto horizontal orbit
   ═══════════════════════════════════════════════════════ */

let cachedBlobUrl: string | null = null;

interface ArmillarySphereProps {
    sectionPulse: number;
}

export function ArmillarySphere({ sectionPulse }: ArmillarySphereProps) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null); // ini current init, kalo udah di skip.
    const engineRef = useRef<any>(null);
    const momentumRef = useRef(0);
    const prevPulse = useRef(sectionPulse); //ngetrack animation

    /* ── Trigger momentum burst on section change, profile to smth.. etc── */
    useEffect(() => {
        if (sectionPulse !== prevPulse.current) {
            // Home → About → Projects accelerate then slow down
            momentumRef.current = 2.8;
            // detect changes, ini nyimpen jadi kalo ada new atas ke trigger karenae !=
            prevPulse.current = sectionPulse;
        }
    }, [sectionPulse]);

    useEffect(() => {
        //if engine exist do no init
        if (!canvasRef.current || engineRef.current) return;

        let engine: any;
        let scene: any;
        let resizeHandler: any;

        const init = async () => {
            //await ngaruh only load when component mount
            const BABYLON = await import("@babylonjs/core");
            await import("@babylonjs/loaders");

            // Guard: canvas may have unmounted during async import
            if (!canvasRef.current || engineRef.current) return;

            engine = new BABYLON.Engine(canvasRef.current, true, {
                alpha: true, // trans bg
                antialias: true, // smooth edge
                preserveDrawingBuffer: true, // ss
                stencil: true, // adv
            });

            engineRef.current = engine;

            /* ── Scene ── */
            scene = new BABYLON.Scene(engine);
            scene.clearColor = new BABYLON.Color4(0, 0, 0, 0); // transparant ( sky background behind canvas can show ( stary sky bg ))

            /* ── Camera — locked vertical, only horizontal orbit ── */
            const camera = new BABYLON.ArcRotateCamera(
                "cam", //name
                -Math.PI / 2, //horizontal rotate |start facing front
                Math.PI * 0.62, //vertival angle |slightly above equator
                5.2, //distacne from object| CLOSE radius → big sphere
                // new BABYLON.Vector3(0, 0.2, 0), //look at point| target slightly above center
                new BABYLON.Vector3(0, 0.05, 0), // perspective form
                scene,
            );

            // Lock vertical rotation (beta) no up and down
            camera.lowerBetaLimit = Math.PI * 0.62;
            camera.upperBetaLimit = Math.PI * 0.62;

            // Allow only horizontal drag
            camera.attachControl(canvasRef.current!, true);
            camera.panningSensibility = 0;

            // Lock zoom to keep sphere big ( jadi gabisa zoom )
            camera.lowerRadiusLimit = 5.0;
            camera.upperRadiusLimit =  5.5;
            camera.wheelPrecision = 100;

            // Smooth auto-rotation (horizontal / alpha axis)
            camera.useAutoRotationBehavior = true; //slow rotate camera
            if (camera.autoRotationBehavior) {
                // if user stop touching rotate else do not
                camera.autoRotationBehavior.idleRotationSpeed = 0.05;
                camera.autoRotationBehavior.idleRotationSpinupTime = 3000;
                camera.autoRotationBehavior.idleRotationWaitTime = 800;
            }

            /* ── Lighting — warm golden key + cool rim ── */
            const hemi = new BABYLON.HemisphericLight(
                "hemi",
                new BABYLON.Vector3(0, 1, 0.3),
                scene,
            );
            hemi.intensity = 1.1;
            hemi.diffuse = new BABYLON.Color3(1.0, 0.95, 0.82);
            hemi.groundColor = new BABYLON.Color3(0.1, 0.08, 0.2);

            const keyLight = new BABYLON.PointLight(
                "key",
                new BABYLON.Vector3(3, 5, 3),
                scene,
            );
            keyLight.intensity = 2.2;
            keyLight.diffuse = new BABYLON.Color3(1.0, 0.9, 0.65);

            const fillLight = new BABYLON.PointLight(
                "fill",
                new BABYLON.Vector3(-4, 2, -2),
                scene,
            );
            fillLight.intensity = 0.8;
            fillLight.diffuse = new BABYLON.Color3(0.55, 0.65, 1.0);

            const rimLight = new BABYLON.PointLight(
                "rim",
                new BABYLON.Vector3(0, -2, -4),
                scene,
            );
            rimLight.intensity = 0.5;
            rimLight.diffuse = new BABYLON.Color3(0.8, 0.75, 1.0);

            /* ── Environment Lighting (HDRI) ── */
            // Using a high-quality studio HDR for realistic golden reflections
            scene.environmentTexture = BABYLON.CubeTexture.CreateFromPrefilteredData(
                "https://playground.babylonjs.com/textures/environment.dds",
                scene
            );
            scene.environmentIntensity = 1.2;

            /* ── Post-Processing Pipeline (Bloom & Depth of Field) ── */
            const pipeline = new BABYLON.DefaultRenderingPipeline(
                "defaultPipeline", 
                true, // High Dynamic Range (HDR)
                scene, 
                [camera]
            );

            // Bloom settings (make the gold actually glow)
            pipeline.bloomEnabled = true;
            pipeline.bloomThreshold = 0.8;
            pipeline.bloomWeight = 0.6;
            pipeline.bloomKernel = 64;

            // Depth of Field is disabled because dynamic mesh scaling across different
            // responsive screen sizes causes the exact focal point to miss the subject.
            pipeline.depthOfFieldEnabled = false;

            /* ── Load model (with global blob cache for instant reopen) ── */
            if (!cachedBlobUrl) {
                //if not found fetch
                const response = await fetch(
                    "/assets/model/armillary_sphere.glb",
                );
                const blob = await response.blob();
                cachedBlobUrl = URL.createObjectURL(blob); //avoid refetching
            }

            const result = await BABYLON.SceneLoader.ImportMeshAsync(
                "",
                cachedBlobUrl,
                "",
                scene,
                undefined,
                ".glb",
            );

            const root = result.meshes[0];
            const allMeshes = root.getChildMeshes(false);

            // Clean up stray studio background planes from the downloaded GLB.
            // A backdrop is physically massive but has very few vertices compared to the sphere.
            let maxDiag = 0;
            allMeshes.forEach((m: any) => {
                if (
                    m.getBoundingInfo &&
                    typeof m.getTotalVertices === "function" &&
                    m.getTotalVertices() > 0
                ) {
                    maxDiag = Math.max(
                        maxDiag,
                        m.getBoundingInfo().diagonalLength,
                    );
                }
            });

            allMeshes.forEach((m: any) => {
                const name = m.name.toLowerCase();
                if (
                    name.includes("plane") ||
                    name.includes("bg") ||
                    name.includes("background") ||
                    name.includes("studio") ||
                    name.includes("backdrop")
                ) {
                    if (!m.isDisposed()) m.dispose();
                } else if (
                    m.getBoundingInfo &&
                    typeof m.getTotalVertices === "function" &&
                    m.getTotalVertices() > 0
                ) {
                    const diag = m.getBoundingInfo().diagonalLength;
                    // If a mesh stretches across most of the bounding volume but is extremely low-poly, it's a backdrop.
                    if (diag > maxDiag * 0.6 && m.getTotalVertices() < 1000) {
                        if (!m.isDisposed()) m.dispose();
                    }
                }
            });

            // Guarantee predictable size strictly for the remaining actual sphere mechanism
            root.normalizeToUnitCube();

            // center horizontally
            root.position.x = 0;
            root.position.z = 0;

            // compute model size
            const bounds = root.getHierarchyBoundingVectors();
            const size = bounds.max.subtract(bounds.min).length();

            // camera distance
            const distance = camera.radius;

            // desired screen coverage
            const fillFactor = 0.8;

            // compute scale automatically
            const scale = (distance * fillFactor) / size;

            root.scaling.scaleInPlace(scale);

            // keep stand visible
            root.position.y = -0.25;

            // Force perfect centering to undo any baked-in pivot offsets from the original GLB
            root.position.x = 0;
            root.position.z = 0;

            // Make it massive and push it down slightly so the pedestal rests perfectly on the platform/stairs
            // root.scaling.scaleInPlace(2.9);
            // root.position.y = -0.25 + Math.sin(elapsed * 0.35) * 0.025;
            // root.position.y = -0.18;

            /* ── Golden material override ── */
            const goldColor = new BABYLON.Color3(0.88, 0.72, 0.22);
            const goldEmissive = new BABYLON.Color3(0.08, 0.06, 0.01);

            result.meshes.forEach((mesh: any) => {
                const mat = mesh.material;
                if (!mat) return;

                // PBR materials (standard in GLB)
                if (mat.albedoColor !== undefined) {
                    mat.albedoColor = goldColor.clone();
                    mat.metallic = 0.95;
                    mat.roughness = 0.15;
                    mat.emissiveColor = goldEmissive.clone();
                    // Enhance reflections
                    if (mat.reflectivityColor !== undefined) {
                        mat.reflectivityColor = new BABYLON.Color3(
                            1.0,
                            0.9,
                            0.5,
                        );
                    }
                    // Amplify the environment reflection for realism
                    mat.environmentIntensity = 1.5;
                }
                // Standard materials fallback
                if (
                    mat.diffuseColor !== undefined &&
                    mat.albedoColor === undefined
                ) {
                    mat.diffuseColor = goldColor.clone();
                    mat.specularColor = new BABYLON.Color3(1.0, 0.88, 0.45);
                    mat.emissiveColor = goldEmissive.clone();
                }
            });

            /* ═══════════════════════════════════════════════
         LAYERED RING ROTATION — Celestial instrument
         ═══════════════════════════════════════════════ */

            // Gather all child meshes with geometry, sorted by bounding size
            // Largest = outermost ring, smallest = inner sphere/core
            const children = root.getChildMeshes(false);
            const meshesWithSize = children
                .filter((m: any) => {
                    try {
                        return m.getBoundingInfo && m.getTotalVertices() > 0;
                    } catch {
                        return false;
                    }
                })
                .map((m: any) => {
                    const bb = m.getBoundingInfo().boundingBox;
                    const size = bb.maximumWorld
                        .subtract(bb.minimumWorld)
                        .length();
                    return { mesh: m, size };
                })
                .sort((a: any, b: any) => b.size - a.size); // largest first

            // Identify the base (bottom-most mesh by Y position) → keep it still
            let baseMeshName = "";
            let lowestY = Infinity;
            meshesWithSize.forEach((item: any) => {
                const bb = item.mesh.getBoundingInfo().boundingBox;
                const minY = bb.minimumWorld.y;
                if (minY < lowestY) {
                    lowestY = minY;
                    baseMeshName = item.mesh.name;
                }
            });

            // Assign rotation behaviours based on sorted order
            type RingLayer = {
                mesh: any;
                baseSpeed: number;
                axis: "y" | "x" | "z";
                direction: number;
                wobblePhase: number;
                wobbleAmp: number;
            };

            const ringLayers: RingLayer[] = [];

            meshesWithSize.forEach((item: any, i: number, arr: any[]) => {
                // Skip the base pedestal — it stays perfectly still
                if (item.mesh.name === baseMeshName) return;

                const t = arr.length > 1 ? i / (arr.length - 1) : 0;

                // Outer rings rotate faster, inner rings slower
                // Outermost: ~0.003 rad/frame, innermost: ~0.0005 rad/frame
                const baseSpeed = 0.0008 + (1 - t) * 0.0025;

                // Alternate axes: outer=Y (main orbit), mid=Z (tilt), inner=X (wobble)
                const axes: Array<"y" | "x" | "z"> = ["y", "z", "x", "y", "z"];
                const axis = axes[i % axes.length];

                // Alternate directions for visual complexity
                const direction = i % 2 === 0 ? 1 : -1;

                // Gentle sinusoidal wobble unique to each ring
                const wobblePhase = i * 1.7;
                const wobbleAmp = 0.0002 + (1 - t) * 0.0003;

                ringLayers.push({
                    mesh: item.mesh,
                    baseSpeed,
                    axis,
                    direction,
                    wobblePhase,
                    wobbleAmp,
                });
            });

            /* ── Render loop ── */
            let elapsed = 0;

            scene.onBeforeRenderObservable.add(() => {
                const dt = engine.getDeltaTime() * 0.001;
                elapsed += dt;

                // Smoothly decay momentum after section change burst
                if (momentumRef.current > 1) {
                    momentumRef.current *= 0.985; // slower decay = smoother transition
                    if (momentumRef.current < 1.02) momentumRef.current = 1;
                }
                const momentum = Math.max(momentumRef.current, 1);

                // Animate each ring layer independently
                ringLayers.forEach((layer) => {
                    const wobble =
                        Math.sin(elapsed * 0.4 + layer.wobblePhase) *
                        layer.wobbleAmp;
                    const speed =
                        (layer.baseSpeed + wobble) * layer.direction * momentum;

                    switch (layer.axis) {
                        case "y":
                            layer.mesh.rotation.y += speed;
                            break;
                        case "x":
                            layer.mesh.rotation.x += speed;
                            break;
                        case "z":
                            layer.mesh.rotation.z += speed;
                            break;
                    }
                });

                // Very gentle vertical float of the entire assembly
                root.position.y = -0.18 + Math.sin(elapsed * 0.35) * 0.025;
            });

            /* ── GPU & Battery Throttling via IntersectionObserver ── */
            let renderLoopRunning = false;
            const renderFn = () => scene.render();

            const observer = new IntersectionObserver(
                (entries) => {
                    entries.forEach((entry) => {
                        if (entry.isIntersecting) {
                            if (!renderLoopRunning) {
                                engine.runRenderLoop(renderFn);
                                renderLoopRunning = true;
                            }
                        } else {
                            if (renderLoopRunning) {
                                engine.stopRenderLoop(renderFn);
                                renderLoopRunning = false;
                            }
                        }
                    });
                },
                { threshold: 0.1 },
            );

            if (canvasRef.current) {
                observer.observe(canvasRef.current);
            }

            resizeHandler = () => engine.resize();
            window.addEventListener("resize", resizeHandler);

            // Store observer on engine object for cleanup
            engineRef.current._throttleObserver = observer;
        };

        init();

        return () => {
            if (resizeHandler)
                window.removeEventListener("resize", resizeHandler);
            if (engineRef.current) {
                if (engineRef.current._throttleObserver) {
                    engineRef.current._throttleObserver.disconnect();
                }
                engineRef.current.dispose();
                engineRef.current = null;
            }
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                width: "100%",
                height: "100%",
                display: "block",
                outline: "none",
                touchAction: "none",
            }}
        />
    );
}
