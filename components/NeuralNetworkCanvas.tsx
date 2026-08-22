import React, { useEffect, useRef } from 'react';

export const NeuralNetworkCanvas: React.FC = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let W = (canvas.width = window.innerWidth);
        let H = (canvas.height = window.innerHeight);
        let rafId: number;

        interface NeuralNode {
            x: number;
            y: number;
            vx: number;
            vy: number;
            radius: number;
            baseRadius: number;
            pulsePhase: number;
            pulseSpeed: number;
            color: string;
            glowColor: string;
            activity: number;
        }

        interface SynapsePulse {
            from: NeuralNode;
            to: NeuralNode;
            progress: number;
            speed: number;
            color: string;
            size: number;
        }

        const NODE_COUNT = Math.min(Math.floor((W * H) / 14000), 75);
        const MAX_DISTANCE = 160;
        const MOUSE_RADIUS = 180;

        const PALETTE = [
            { main: 'rgba(6, 182, 212, 0.85)', glow: 'rgba(6, 182, 212, 0.4)' },    // Cyan
            { main: 'rgba(59, 130, 246, 0.85)', glow: 'rgba(59, 130, 246, 0.35)' },  // Azul
            { main: 'rgba(168, 85, 247, 0.85)', glow: 'rgba(168, 85, 247, 0.35)' },  // Púrpura
            { main: 'rgba(245, 158, 11, 0.85)', glow: 'rgba(245, 158, 11, 0.35)' },  // Ámbar
        ];

        let nodes: NeuralNode[] = [];
        let pulses: SynapsePulse[] = [];
        let mouseX = -1000;
        let mouseY = -1000;

        const rand = (min: number, max: number) => Math.random() * (max - min) + min;

        const initNodes = () => {
            nodes = [];
            for (let i = 0; i < NODE_COUNT; i++) {
                const colorSet = PALETTE[Math.floor(Math.random() * PALETTE.length)];
                const r = rand(2.2, 4.2);
                nodes.push({
                    x: rand(0, W),
                    y: rand(0, H),
                    vx: rand(-0.45, 0.45),
                    vy: rand(-0.45, 0.45),
                    radius: r,
                    baseRadius: r,
                    pulsePhase: rand(0, Math.PI * 2),
                    pulseSpeed: rand(0.02, 0.05),
                    color: colorSet.main,
                    glowColor: colorSet.glow,
                    activity: 0
                });
            }
        };

        const spawnPulse = (from: NeuralNode, to: NeuralNode) => {
            pulses.push({
                from,
                to,
                progress: 0,
                speed: rand(0.012, 0.025),
                color: Math.random() > 0.4 ? 'rgba(6, 230, 255, 0.95)' : 'rgba(251, 191, 36, 0.95)',
                size: rand(2.5, 4.0)
            });
        };

        const handleResize = () => {
            if (!canvas) return;
            W = canvas.width = window.innerWidth;
            H = canvas.height = window.innerHeight;
            initNodes();
        };

        const handleMouseMove = (e: MouseEvent) => {
            mouseX = e.clientX;
            mouseY = e.clientY;
        };

        const handleMouseLeave = () => {
            mouseX = -1000;
            mouseY = -1000;
        };

        window.addEventListener('resize', handleResize);
        window.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseleave', handleMouseLeave);

        initNodes();

        let lastPulseSpawn = Date.now();

        const animate = () => {
            ctx.clearRect(0, 0, W, H);

            // 1. Actualizar posiciones de los nodos
            for (let i = 0; i < nodes.length; i++) {
                const n = nodes[i];
                n.x += n.vx;
                n.y += n.vy;

                // Rebotar en bordes
                if (n.x < 0 || n.x > W) n.vx *= -1;
                if (n.y < 0 || n.y > H) n.vy *= -1;

                // Efecto de proximidad del ratón
                const dxMouse = mouseX - n.x;
                const dyMouse = mouseY - n.y;
                const distMouse = Math.hypot(dxMouse, dyMouse);

                if (distMouse < MOUSE_RADIUS) {
                    const force = (1 - distMouse / MOUSE_RADIUS) * 0.8;
                    n.activity = Math.min(n.activity + 0.1, 1);
                    n.x -= (dxMouse / distMouse) * force * 1.5;
                    n.y -= (dyMouse / distMouse) * force * 1.5;
                } else {
                    n.activity = Math.max(n.activity - 0.02, 0);
                }

                n.pulsePhase += n.pulseSpeed;
            }

            // 2. Dibujar conexiones sinápticas (Líneas axonales)
            for (let i = 0; i < nodes.length; i++) {
                for (let j = i + 1; j < nodes.length; j++) {
                    const a = nodes[i];
                    const b = nodes[j];
                    const dist = Math.hypot(b.x - a.x, b.y - a.y);

                    if (dist < MAX_DISTANCE) {
                        const alpha = (1 - dist / MAX_DISTANCE) * (0.25 + (a.activity + b.activity) * 0.35);
                        
                        ctx.beginPath();
                        ctx.moveTo(a.x, a.y);
                        ctx.lineTo(b.x, b.y);
                        ctx.strokeStyle = `rgba(6, 182, 212, ${alpha})`;
                        ctx.lineWidth = 1.0 + (a.activity + b.activity) * 1.2;
                        ctx.stroke();

                        // Ocasionalmente disparar un pulso de datos
                        if (Math.random() < 0.0008 && pulses.length < 20) {
                            spawnPulse(a, b);
                        }
                    }
                }
            }

            // 3. Dibujar y actualizar pulsos sinápticos (Potenciales de Acción)
            if (Date.now() - lastPulseSpawn > 600 && nodes.length > 2) {
                const a = nodes[Math.floor(Math.random() * nodes.length)];
                // Buscar un nodo cercano conectado
                const closeNodes = nodes.filter(b => b !== a && Math.hypot(b.x - a.x, b.y - a.y) < MAX_DISTANCE);
                if (closeNodes.length > 0) {
                    const target = closeNodes[Math.floor(Math.random() * closeNodes.length)];
                    spawnPulse(a, target);
                    lastPulseSpawn = Date.now();
                }
            }

            for (let i = pulses.length - 1; i >= 0; i--) {
                const p = pulses[i];
                p.progress += p.speed;

                if (p.progress >= 1) {
                    pulses.splice(i, 1);
                    continue;
                }

                const curX = p.from.x + (p.to.x - p.from.x) * p.progress;
                const curY = p.from.y + (p.to.y - p.from.y) * p.progress;

                ctx.beginPath();
                ctx.arc(curX, curY, p.size, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.shadowColor = p.color;
                ctx.shadowBlur = 12;
                ctx.fill();
                ctx.shadowBlur = 0;
            }

            // 4. Dibujar nodos neuronales
            for (let i = 0; i < nodes.length; i++) {
                const n = nodes[i];
                const pulse = Math.sin(n.pulsePhase) * 0.8;
                const currentRadius = Math.max(1.5, n.baseRadius + pulse + n.activity * 2);

                // Halo de brillo
                ctx.beginPath();
                ctx.arc(n.x, n.y, currentRadius * 2.8, 0, Math.PI * 2);
                ctx.fillStyle = n.glowColor;
                ctx.fill();

                // Núcleo del soma neuronal
                ctx.beginPath();
                ctx.arc(n.x, n.y, currentRadius, 0, Math.PI * 2);
                ctx.fillStyle = n.activity > 0.3 ? '#ffffff' : n.color;
                ctx.shadowColor = n.color;
                ctx.shadowBlur = 10;
                ctx.fill();
                ctx.shadowBlur = 0;
            }

            rafId = requestAnimationFrame(animate);
        };

        rafId = requestAnimationFrame(animate);

        return () => {
            cancelAnimationFrame(rafId);
            window.removeEventListener('resize', handleResize);
            window.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseleave', handleMouseLeave);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            className="fixed inset-0 pointer-events-none z-0"
            style={{
                background: 'radial-gradient(ellipse at 50% 20%, #0c1836 0%, #050811 75%, #020409 100%)'
            }}
        />
    );
};

export default NeuralNetworkCanvas;
