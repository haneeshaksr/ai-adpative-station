import React, { useState, useEffect } from 'react';
import {
  Cpu,
  Tv,
  Camera,
  Mic,
  Volume2,
  Activity,
  Radio,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Database,
  Bot,
  Zap,
  Layers,
  Thermometer,
  ShieldCheck,
} from 'lucide-react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { HardwareTelemetry } from '../types';

export const SmartStationPage: React.FC = () => {
  const { user } = useAuth();
  const [telemetry, setTelemetry] = useState<HardwareTelemetry | null>(null);
  const [loading, setLoading] = useState(true);
  const [ledColor, setLedColor] = useState<string>('#00E5FF');
  const [buzzerTested, setBuzzerTested] = useState(false);

  const fetchStatus = async () => {
    try {
      const res = await api.getHardwareStatus();
      setTelemetry(res.hardware);
    } catch (e) {
      console.error('Failed to load station telemetry:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleTestBuzzer = () => {
    setBuzzerTested(true);
    setTimeout(() => setBuzzerTested(false), 2000);
  };

  if (loading && !telemetry) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-cyan-500 border-t-transparent" />
      </div>
    );
  }

  const p = telemetry?.peripherals;

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-700">
              Station Hardware Digital Twin
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight sm:text-3xl">
            Raspberry Pi 5 Smart Station
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Real-time telemetry, sensor telemetry, and peripheral device controllers
          </p>
        </div>

        <button
          onClick={fetchStatus}
          className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 shadow-2xs"
        >
          <RefreshCw className="h-3.5 w-3.5 text-cyan-600" />
          <span>Refresh Telemetry</span>
        </button>
      </div>

      {/* CORE STATION STATUS OVERVIEW BANNER */}
      <div className="rounded-3xl border border-slate-800 bg-slate-950 p-6 sm:p-8 text-white shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Cpu className="h-6 w-6" />
            </div>
            <div>
              <span className="font-mono text-xs text-cyan-400">
                STATION ID: {telemetry?.stationId || 'PI5-SMART-STATION-01'}
              </span>
              <h2 className="text-xl font-bold text-white">
                {telemetry?.stationName || 'Raspberry Pi 5 Adaptive Learning Pod'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-bold text-emerald-400 border border-emerald-500/30">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              STATUS: {telemetry?.status || 'ONLINE'}
            </span>
          </div>
        </div>

        {/* Live System Diagnostics Grid */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 text-xs">
          <div className="rounded-2xl bg-slate-900 p-4 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase">Board Model</span>
            <p className="mt-1 font-mono font-bold text-white">
              {telemetry?.raspberryPiModel || 'Raspberry Pi 5 - 8GB'}
            </p>
          </div>

          <div className="rounded-2xl bg-slate-900 p-4 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase">CPU Temperature</span>
            <p className="mt-1 font-mono font-bold text-emerald-400 flex items-center gap-1">
              <Thermometer className="h-4 w-4" />
              {telemetry?.cpuTempCelsius || 43.2}°C
            </p>
          </div>

          <div className="rounded-2xl bg-slate-900 p-4 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase">CPU Utilization</span>
            <p className="mt-1 font-mono font-bold text-cyan-300">
              {telemetry?.cpuUsagePercent || 18.5}%
            </p>
          </div>

          <div className="rounded-2xl bg-slate-900 p-4 border border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase">Active Session</span>
            <p className="mt-1 font-bold text-white truncate">{user?.name || 'Alex Rivera'}</p>
          </div>
        </div>

        {/* Service Connectivity Checks */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="rounded-2xl bg-slate-900 p-4 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bot className="h-5 w-5 text-cyan-400" />
              <div>
                <p className="text-xs font-bold text-white">Gemini AI Service</p>
                <p className="text-[10px] text-slate-400">
                  Latency: {telemetry?.aiService?.latencyMs || 142}ms
                </p>
              </div>
            </div>
            <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
              CONNECTED
            </span>
          </div>

          <div className="rounded-2xl bg-slate-900 p-4 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Database className="h-5 w-5 text-purple-400" />
              <div>
                <p className="text-xs font-bold text-white">Database Synchronization</p>
                <p className="text-[10px] text-slate-400">
                  Latency: {telemetry?.databaseService?.latencyMs || 14}ms
                </p>
              </div>
            </div>
            <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-bold text-emerald-400">
              CONNECTED
            </span>
          </div>
        </div>
      </div>

      {/* SENSORS & PERIPHERALS DIAGNOSTIC MATRIX */}
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xs space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
          Hardware Peripherals & Sensor Matrix
        </h2>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Touchscreen */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <Tv className="h-5 w-5 text-cyan-600" />
              <span className="text-[10px] font-bold text-emerald-600">CONNECTED</span>
            </div>
            <h3 className="text-xs font-bold text-slate-800">10.1" Touchscreen</h3>
            <p className="text-[10px] text-slate-500">{p?.touchscreen?.resolution || '1920x1080'}</p>
          </div>

          {/* Camera Module */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <Camera className="h-5 w-5 text-sky-600" />
              <span className="text-[10px] font-bold text-emerald-600">CONNECTED</span>
            </div>
            <h3 className="text-xs font-bold text-slate-800">Camera (Sony IMX708)</h3>
            <p className="text-[10px] text-slate-500">60 FPS • MTCNN Biometric Ready</p>
          </div>

          {/* Microphone */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <Mic className="h-5 w-5 text-indigo-600" />
              <span className="text-[10px] font-bold text-emerald-600">ACTIVE</span>
            </div>
            <h3 className="text-xs font-bold text-slate-800">Microphone Array</h3>
            <p className="text-[10px] text-slate-500">AI Speech Recognition Filter</p>
          </div>

          {/* Speaker */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <Volume2 className="h-5 w-5 text-purple-600" />
              <span className="text-[10px] font-bold text-emerald-600">ONLINE</span>
            </div>
            <h3 className="text-xs font-bold text-slate-800">Dual Audio Speaker</h3>
            <p className="text-[10px] text-slate-500">Volume: 75% • Audio Feedback</p>
          </div>

          {/* PIR Sensor */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <Radio className="h-5 w-5 text-emerald-600" />
              <span className="text-[10px] font-bold text-emerald-600">MOTION DETECTED</span>
            </div>
            <h3 className="text-xs font-bold text-slate-800">PIR Presence Sensor</h3>
            <p className="text-[10px] text-slate-500">Student Present at Station</p>
          </div>

          {/* OLED Mini Display */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <Activity className="h-5 w-5 text-amber-500" />
              <span className="text-[10px] font-bold text-emerald-600">DISPLAYING</span>
            </div>
            <h3 className="text-xs font-bold text-slate-800">0.96" I2C OLED</h3>
            <p className="text-[10px] text-slate-500">Showing 7-Day Streak & Time</p>
          </div>

          {/* RGB LED Control */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div
                className="h-4 w-4 rounded-full shadow-sm"
                style={{ backgroundColor: ledColor }}
              />
              <span className="text-[10px] font-bold text-cyan-700">ILLUMINATED</span>
            </div>
            <h3 className="text-xs font-bold text-slate-800">Status RGB LED</h3>
            <div className="flex gap-1.5 pt-1">
              {['#00E5FF', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'].map((c) => (
                <button
                  key={c}
                  onClick={() => setLedColor(c)}
                  className="h-4 w-4 rounded-full border border-slate-300 transition-transform hover:scale-125"
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Piezo Buzzer */}
          <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 space-y-2">
            <div className="flex items-center justify-between">
              <Zap className="h-5 w-5 text-amber-600" />
              <span className="text-[10px] font-bold text-slate-500">STANDBY</span>
            </div>
            <h3 className="text-xs font-bold text-slate-800">Piezo Haptic Buzzer</h3>
            <button
              onClick={handleTestBuzzer}
              className="rounded-lg bg-slate-200 px-2 py-1 text-[10px] font-bold text-slate-800 hover:bg-slate-300"
            >
              {buzzerTested ? 'BEEP! (Active)' : 'Test Buzzer Tone'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
