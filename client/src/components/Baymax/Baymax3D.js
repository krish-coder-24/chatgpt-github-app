import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';

// Baymax Body Component
function BaymaxBody({ speaking, emotion, heartRate }) {
  const meshRef = useRef();
  const [hovered, setHovered] = useState(false);

  useFrame((state) => {
    // Breathing animation
    const breathe = Math.sin(state.clock.elapsedTime * 2) * 0.05 + 1;
    if (meshRef.current) {
      meshRef.current.scale.y = breathe;
      
      // Speaking animation
      if (speaking) {
        meshRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 8) * 0.1;
      }
      
      // Heart rate visualization
      if (heartRate > 100) {
        meshRef.current.material.color.setHex(0xff6b6b); // Red for high heart rate
      } else if (heartRate > 80) {
        meshRef.current.material.color.setHex(0xffd93d); // Yellow for elevated
      } else {
        meshRef.current.material.color.setHex(0x74c0fc); // Blue for normal
      }
    }
  });

  return (
    <group>
      {/* Main Body */}
      <mesh
        ref={meshRef}
        position={[0, 0, 0]}
        onPointerOver={() => setHovered(true)}
        onPointerOut={() => setHovered(false)}
      >
        <sphereGeometry args={[1.2, 32, 32]} />
        <meshPhongMaterial 
          color={hovered ? "#a5d8ff" : "#74c0fc"} 
          transparent 
          opacity={0.9}
          shininess={100}
        />
      </mesh>
      
      {/* Arms */}
      <mesh position={[-1.5, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.3, 0.3, 1.5]} />
        <meshPhongMaterial color="#74c0fc" transparent opacity={0.8} />
      </mesh>
      <mesh position={[1.5, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.3, 0.3, 1.5]} />
        <meshPhongMaterial color="#74c0fc" transparent opacity={0.8} />
      </mesh>
      
      {/* Legs */}
      <mesh position={[-0.5, -1.8, 0]}>
        <cylinderGeometry args={[0.4, 0.4, 1.8]} />
        <meshPhongMaterial color="#74c0fc" transparent opacity={0.8} />
      </mesh>
      <mesh position={[0.5, -1.8, 0]}>
        <cylinderGeometry args={[0.4, 0.4, 1.8]} />
        <meshPhongMaterial color="#74c0fc" transparent opacity={0.8} />
      </mesh>
    </group>
  );
}

// Baymax Head Component
function BaymaxHead({ speaking, emotion }) {
  const headRef = useRef();
  const leftEyeRef = useRef();
  const rightEyeRef = useRef();

  useFrame((state) => {
    if (speaking && headRef.current) {
      headRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 6) * 0.1;
    }
    
    // Eye expressions based on emotion
    if (leftEyeRef.current && rightEyeRef.current) {
      switch (emotion) {
        case 'happy':
          leftEyeRef.current.scale.y = 0.6;
          rightEyeRef.current.scale.y = 0.6;
          break;
        case 'concerned':
          leftEyeRef.current.rotation.z = 0.2;
          rightEyeRef.current.rotation.z = -0.2;
          break;
        case 'surprised':
          leftEyeRef.current.scale.y = 1.5;
          rightEyeRef.current.scale.y = 1.5;
          break;
        default:
          leftEyeRef.current.scale.y = 1;
          rightEyeRef.current.scale.y = 1;
          leftEyeRef.current.rotation.z = 0;
          rightEyeRef.current.rotation.z = 0;
      }
    }
  });

  return (
    <group ref={headRef} position={[0, 2, 0]}>
      {/* Head */}
      <mesh position={[0, 0, 0]}>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshPhongMaterial color="#74c0fc" transparent opacity={0.9} />
      </mesh>
      
      {/* Eyes */}
      <mesh ref={leftEyeRef} position={[-0.25, 0.1, 0.7]}>
        <boxGeometry args={[0.15, 0.3, 0.1]} />
        <meshBasicMaterial color="#000" />
      </mesh>
      <mesh ref={rightEyeRef} position={[0.25, 0.1, 0.7]}>
        <boxGeometry args={[0.15, 0.3, 0.1]} />
        <meshBasicMaterial color="#000" />
      </mesh>
    </group>
  );
}

// Heart Rate Visualization
function HeartRateVisualization({ heartRate, visible }) {
  const particlesRef = useRef();

  useFrame((state) => {
    if (particlesRef.current && visible && heartRate > 0) {
      const intensity = heartRate / 100;
      particlesRef.current.rotation.y += 0.01 * intensity;
      
      // Pulsing effect
      const pulse = Math.sin(state.clock.elapsedTime * (heartRate / 10)) * 0.3 + 1;
      particlesRef.current.scale.setScalar(pulse);
    }
  });

  if (!visible || !heartRate) return null;

  return (
    <group ref={particlesRef} position={[0, 0, 0]}>
      {Array.from({ length: 20 }).map((_, i) => (
        <mesh
          key={i}
          position={[
            Math.cos((i / 20) * Math.PI * 2) * 2,
            Math.sin((i / 20) * Math.PI * 2) * 2,
            0
          ]}
        >
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshBasicMaterial 
            color={heartRate > 100 ? "#ff6b6b" : "#ff8787"} 
            transparent 
            opacity={0.7} 
          />
        </mesh>
      ))}
    </group>
  );
}

// Status Display
function StatusDisplay({ heartRate, emotion, speaking }) {
  return (
    <group position={[0, 3.5, 0]}>
      <Text
        fontSize={0.3}
        color="#495057"
        anchorX="center"
        anchorY="middle"
      >
        {speaking ? "🗣️ Speaking..." : `💝 Heart Rate: ${heartRate || '--'} BPM`}
      </Text>
      <Text
        fontSize={0.25}
        color="#6c757d"
        anchorX="center"
        anchorY="middle"
        position={[0, -0.5, 0]}
      >
        😊 Emotion: {emotion || 'neutral'}
      </Text>
    </group>
  );
}

// Main Baymax 3D Component
const Baymax3D = ({ 
  speaking = false, 
  emotion = 'neutral', 
  heartRate = 0, 
  showHeartRate = false,
  message = "",
  onInteraction = () => {}
}) => {
  return (
    <div style={{ width: '100%', height: '500px', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
      <Canvas
        camera={{ position: [0, 2, 8], fov: 50 }}
        gl={{ antialias: true }}
      >
        {/* Lighting */}
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[10, 10, 5]}
          intensity={0.8}
          castShadow
        />
        <pointLight position={[0, 5, 0]} intensity={0.5} color="#a5d8ff" />

        {/* Baymax Components */}
        <BaymaxBody speaking={speaking} emotion={emotion} heartRate={heartRate} />
        <BaymaxHead speaking={speaking} emotion={emotion} />
        <HeartRateVisualization heartRate={heartRate} visible={showHeartRate} />
        <StatusDisplay heartRate={heartRate} emotion={emotion} speaking={speaking} />

        {/* Interactive Message */}
        {message && (
          <Text
            fontSize={0.4}
            color="#fff"
            anchorX="center"
            anchorY="middle"
            position={[0, -3, 0]}
            maxWidth={8}
          >
            💬 {message}
          </Text>
        )}

        {/* Controls */}
        <OrbitControls
          enablePan={false}
          enableZoom={true}
          enableRotate={true}
          maxPolarAngle={Math.PI / 2}
          minDistance={5}
          maxDistance={15}
        />
      </Canvas>
    </div>
  );
};

export default Baymax3D;