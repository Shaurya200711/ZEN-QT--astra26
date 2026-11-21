'use client';
import { useState, useEffect, useRef } from 'react';

export default function TelemetryTerminal() {
  const [logs, setLogs] = useState([]);
  const endOfLogsRef = useRef(null);

  useEffect(() => {
    const sysLogs = [
      "[SYS] INSAT-3D THERMAL OP NOMINAL...",
      "[TRK] DEBRIS OBJ #8832 CLOSING VEL 28,450 KM/H",
      "[NET] UPLINK ESTABLISHED WITH NAVIC...",
      "[WARN] CYCLONE EYEWALL INTENSIFICATION DETECTED",
      "[SYS] RE-ROUTING GROUND TEAM ALPHA...",
      "[TRK] COLLISION PROBABILITY INCREASING: 4.2%"
    ];

    const interval = setInterval(() => {
      const randomLog = sysLogs[Math.floor(Math.random() * sysLogs.length)];
      const timestamp = new Date().toISOString().substring(11, 19);
      
      setLogs(prev => [...prev.slice(-15), `[${timestamp}] ${randomLog}`]);
    }, 800);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    endOfLogsRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <div className="h-full w-full bg-black text-green-500 font-mono text-xs p-4 overflow-y-auto border border-slate-700 rounded shadow-[0_0_15px_rgba(34,197,94,0.1)]">
      <div className="opacity-70 mb-4 pb-2 border-b border-green-900">++ ISRO COMMAND TERMINAL_v2.0 ++</div>
      {logs.map((log, i) => (
        <div key={i} className="mb-1">{log}</div>
      ))}
      <div ref={endOfLogsRef} />
    </div>
  );
}