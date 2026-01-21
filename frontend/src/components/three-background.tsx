"use client"

import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Points, PointMaterial } from '@react-three/drei'
import * as THREE from 'three'

function ParticleField() {
    const ref = useRef<THREE.Points>(null)

    const particlesPosition = useMemo(() => {
        const positions = new Float32Array(2000 * 3)
        for (let i = 0; i < 2000; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 20
            positions[i * 3 + 1] = (Math.random() - 0.5) * 20
            positions[i * 3 + 2] = (Math.random() - 0.5) * 20
        }
        return positions
    }, [])

    useFrame((state) => {
        if (ref.current) {
            ref.current.rotation.x = state.clock.getElapsedTime() * 0.02
            ref.current.rotation.y = state.clock.getElapsedTime() * 0.03
        }
    })

    return (
        <Points ref={ref} positions={particlesPosition} stride={3} frustumCulled={false}>
            <PointMaterial
                transparent
                color="#3b82f6"
                size={0.02}
                sizeAttenuation={true}
                depthWrite={false}
                opacity={0.6}
            />
        </Points>
    )
}

function FloatingOrbs() {
    const orbRef1 = useRef<THREE.Mesh>(null)
    const orbRef2 = useRef<THREE.Mesh>(null)

    useFrame((state) => {
        const t = state.clock.getElapsedTime()
        if (orbRef1.current) {
            orbRef1.current.position.x = Math.sin(t * 0.3) * 3
            orbRef1.current.position.y = Math.cos(t * 0.2) * 2
            orbRef1.current.position.z = Math.sin(t * 0.4) * 2 - 5
        }
        if (orbRef2.current) {
            orbRef2.current.position.x = Math.cos(t * 0.4) * 4
            orbRef2.current.position.y = Math.sin(t * 0.3) * 3
            orbRef2.current.position.z = Math.cos(t * 0.2) * 2 - 6
        }
    })

    return (
        <>
            <mesh ref={orbRef1}>
                <sphereGeometry args={[0.8, 32, 32]} />
                <meshBasicMaterial color="#3b82f6" transparent opacity={0.15} />
            </mesh>
            <mesh ref={orbRef2}>
                <sphereGeometry args={[1.2, 32, 32]} />
                <meshBasicMaterial color="#8b5cf6" transparent opacity={0.1} />
            </mesh>
        </>
    )
}

export default function ThreeBackground() {
    return (
        <div className="fixed inset-0 -z-10">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/50 to-background pointer-events-none z-10" />
            <Canvas
                camera={{ position: [0, 0, 5], fov: 60 }}
                gl={{ antialias: true, alpha: true }}
                style={{ background: 'transparent' }}
            >
                <ambientLight intensity={0.5} />
                <ParticleField />
                <FloatingOrbs />
            </Canvas>
            <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-primary/5 -z-20" />
        </div>
    )
}
