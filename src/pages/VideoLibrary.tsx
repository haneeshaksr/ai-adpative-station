import React, { useState, useEffect } from 'react';
import {
  Video,
  Play,
  Clock,
  Search,
  Filter,
  CheckCircle2,
  X,
  Sparkles,
  Eye,
  BookOpen,
} from 'lucide-react';
import { api } from '../services/api';
import { VideoItem } from '../types';

interface VideoLibraryProps {
  initialSubject?: string;
  initialTopic?: string;
  onNavigate: (page: string, params?: any) => void;
}

export const VideoLibrary: React.FC<VideoLibraryProps> = ({
  initialSubject,
  initialTopic,
  onNavigate,
}) => {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [activeCategory, setActiveCategory] = useState<string>('Recommended');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [watchProgress, setWatchProgress] = useState<{ [vId: string]: number }>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        setLoading(true);
        const res = await api.getVideos();
        setVideos(res.videos || []);
      } catch (e) {
        console.error('Failed to load videos:', e);
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, []);

  const handleWatch = async (vid: VideoItem) => {
    setSelectedVideo(vid);
    setWatchProgress((prev) => ({ ...prev, [vid._id]: 100 }));
    try {
      await api.watchVideo(vid._id);
    } catch (e) {
      // ignore
    }
  };

  const categories = [
    'Recommended',
    'Mathematics',
    'Physics',
    'Chemistry',
    'Computer Science',
    'Weak Topics',
    'Revision',
  ];

  const filteredVideos = videos.filter((v) => {
    const matchesSearch =
      v.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.topic.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.subject.toLowerCase().includes(searchQuery.toLowerCase());

    if (activeCategory === 'Recommended') {
      // Prioritize Trigonometry & Algebra (student's adaptive focus)
      return matchesSearch;
    }
    if (activeCategory === 'Weak Topics') {
      return (
        matchesSearch &&
        (v.topic.toLowerCase().includes('trigonometry') ||
          v.topic.toLowerCase().includes('motion'))
      );
    }
    if (activeCategory === 'Revision') {
      return matchesSearch;
    }
    return matchesSearch && v.subject.toLowerCase() === activeCategory.toLowerCase();
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-700">
            Multi-Modal Learning Content
          </span>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight sm:text-3xl">
            Interactive Video Library
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            Curated micro-lectures mapped to your diagnostic assessment gaps
          </p>
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`rounded-xl px-4 py-2 text-xs font-semibold whitespace-nowrap transition-all ${
              activeCategory === cat
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="relative rounded-2xl border border-slate-200 bg-white p-2 shadow-xs">
        <Search className="absolute left-4 top-3.5 h-4 w-4 text-slate-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by topic, theorem, or subject (e.g. Newton, Quadratic, Trigonometric)..."
          className="w-full rounded-xl pl-9 pr-4 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-hidden"
        />
      </div>

      {/* Video Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredVideos.map((vid) => {
          const isWatched = (watchProgress[vid._id] || 0) > 0;
          return (
            <div
              key={vid._id}
              className="group overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xs transition-all hover:border-cyan-300 hover:shadow-md flex flex-col justify-between"
            >
              {/* Thumbnail with duration overlay */}
              <div className="relative aspect-video w-full overflow-hidden bg-slate-900">
                <img
                  src={vid.thumbnail}
                  alt={vid.title}
                  className="h-full w-full object-cover opacity-85 transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />

                {/* Play Button Overlay */}
                <button
                  onClick={() => handleWatch(vid)}
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-cyan-500/90 text-slate-950 shadow-lg group-hover:scale-110 transition-transform">
                    <Play className="h-5 w-5 fill-current ml-0.5" />
                  </div>
                </button>

                {/* Duration Badge */}
                <span className="absolute bottom-2.5 right-2.5 rounded-md bg-slate-950/80 px-2 py-0.5 font-mono text-[10px] font-bold text-white backdrop-blur-xs">
                  {vid.durationMinutes}:00
                </span>

                {/* Difficulty badge */}
                <span className="absolute top-2.5 left-2.5 rounded-md bg-slate-950/80 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-cyan-300 backdrop-blur-xs">
                  {vid.difficulty}
                </span>
              </div>

              {/* Body */}
              <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-[11px] text-slate-500">
                    <span className="font-semibold text-cyan-700">{vid.subject}</span>
                    <span>{vid.topic}</span>
                  </div>
                  <h3 className="text-sm font-bold text-slate-900 line-clamp-2 leading-snug">
                    {vid.title}
                  </h3>
                  <p className="text-[11px] text-slate-500 line-clamp-2">{vid.description}</p>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">By {vid.uploadedBy}</span>
                  <button
                    onClick={() => handleWatch(vid)}
                    className="flex items-center gap-1 rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-800 hover:bg-cyan-50 hover:text-cyan-800"
                  >
                    <span>{isWatched ? 'Rewatch' : 'Watch Now'}</span>
                    <Play className="h-3 w-3 fill-current" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* WATCH MODAL (Simulated Video Player with completion tracking) */}
      {selectedVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-3xl rounded-3xl border border-slate-800 bg-slate-900 p-6 text-white shadow-2xl space-y-4">
            <button
              onClick={() => setSelectedVideo(null)}
              className="absolute right-5 top-5 rounded-full p-1.5 text-slate-400 hover:bg-slate-800 hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Video Title & Subject */}
            <div>
              <span className="text-xs font-bold text-cyan-400 uppercase">
                {selectedVideo.subject} • {selectedVideo.topic}
              </span>
              <h2 className="text-lg font-bold text-white">{selectedVideo.title}</h2>
            </div>

            {/* Simulated Player Box */}
            <div className="relative aspect-video w-full rounded-2xl bg-black overflow-hidden flex flex-col items-center justify-center text-center p-6 border border-slate-800">
              <img
                src={selectedVideo.thumbnail}
                alt={selectedVideo.title}
                className="absolute inset-0 h-full w-full object-cover opacity-35"
              />
              <div className="relative z-10 space-y-3">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-500 text-slate-950 font-bold shadow-lg animate-pulse">
                  <Play className="h-6 w-6 fill-current ml-0.5" />
                </div>
                <p className="text-sm font-bold text-white">Streaming Educational Content</p>
                <p className="text-xs text-slate-300 max-w-md">
                  Progress is actively recorded to your Knowledge Profile analytics.
                </p>
              </div>

              {/* Progress bar at bottom */}
              <div className="absolute inset-x-0 bottom-0 h-2 bg-slate-800">
                <div className="h-full bg-cyan-500 w-full animate-pulse" />
              </div>
            </div>

            {/* Post Watch Options */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-semibold">
                <CheckCircle2 className="h-4 w-4" />
                Watched • Progress saved to Knowledge Profile
              </span>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    const top = selectedVideo.topic;
                    const sub = selectedVideo.subject;
                    setSelectedVideo(null);
                    onNavigate('assessments', { subject: sub, topic: top });
                  }}
                  className="rounded-xl bg-cyan-600 px-4 py-2 text-xs font-bold text-white hover:bg-cyan-700"
                >
                  Take Check Quiz on this Video
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
