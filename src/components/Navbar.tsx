import React, { useState, useEffect } from 'react';
import {
  Bell,
  Flame,
  Wifi,
  WifiOff,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  Cpu,
  RefreshCw,
  Sparkles,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { api, getOfflineQueue } from '../services/api';
import { NotificationItem } from '../types';

interface NavbarProps {
  onToggleSidebar: () => void;
  onNavigate: (page: string) => void;
  currentPage: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, onNavigate, currentPage }) => {
  const { user, logout, isOffline, toggleOfflineMode, syncOfflineData, currentStationStatus } = useAuth();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState<number>(0);
  const [showNotifDropdown, setShowNotifDropdown] = useState<boolean>(false);
  const [showProfileMenu, setShowProfileMenu] = useState<boolean>(false);
  const [offlineQueueCount, setOfflineQueueCount] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  const fetchNotifs = async () => {
    if (!user) return;
    try {
      const res = await api.getNotifications();
      setNotifications(res.notifications);
      setUnreadCount(res.unreadCount);
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    fetchNotifs();
    setOfflineQueueCount(getOfflineQueue().length);
    const interval = setInterval(() => {
      fetchNotifs();
      setOfflineQueueCount(getOfflineQueue().length);
    }, 15000);
    return () => clearInterval(interval);
  }, [user]);

  const handleMarkAllRead = async () => {
    try {
      await api.markAllNotificationsRead();
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (e) {
      // ignore
    }
  };

  const handleSyncNow = async () => {
    setIsSyncing(true);
    try {
      const count = await syncOfflineData();
      setOfflineQueueCount(getOfflineQueue().length);
      if (count > 0) {
        alert(`Successfully synced ${count} activities to the cloud database!`);
      }
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200 bg-white/95 px-4 backdrop-blur-md sm:px-6">
      {/* Left: Mobile Toggle & Brand */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
          aria-label="Toggle navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div
          onClick={() => onNavigate('dashboard')}
          className="flex cursor-pointer items-center gap-2.5 transition-transform hover:opacity-90"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-slate-900 via-sky-900 to-cyan-500 shadow-md shadow-cyan-500/10">
            <Sparkles className="h-5 w-5 text-cyan-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-slate-900 sm:text-lg">
                Adaptive Station
              </span>
              <span className="hidden rounded-full bg-cyan-100 px-2 py-0.5 text-[10px] font-semibold tracking-wider text-cyan-800 uppercase sm:inline-block">
                AI Pod v2.4
              </span>
            </div>
            <p className="hidden text-xs text-slate-500 md:block">
              Intelligent Personalized Learning System
            </p>
          </div>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-4">
        {/* Offline Mode Indicator & Sync */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={toggleOfflineMode}
            title={isOffline ? 'Offline Mode Active (Click to go Online)' : 'Online Mode (Click to simulate Offline)'}
            className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
              isOffline
                ? 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            {isOffline ? <WifiOff className="h-3.5 w-3.5" /> : <Wifi className="h-3.5 w-3.5" />}
            <span className="hidden sm:inline">{isOffline ? 'Offline Mode' : 'Online'}</span>
          </button>

          {offlineQueueCount > 0 && (
            <button
              onClick={handleSyncNow}
              disabled={isSyncing}
              className="flex items-center gap-1 rounded-full bg-cyan-600 px-2.5 py-1 text-xs font-medium text-white shadow-sm hover:bg-cyan-700"
              title="Unsynced records stored locally"
            >
              <RefreshCw className={`h-3 w-3 ${isSyncing ? 'animate-spin' : ''}`} />
              <span>Sync ({offlineQueueCount})</span>
            </button>
          )}
        </div>

        {/* Raspberry Pi Hardware Station Quick Indicator */}
        <button
          onClick={() => onNavigate('smart-station')}
          className="hidden items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:border-cyan-300 hover:bg-cyan-50 md:flex"
          title="Raspberry Pi 5 Station Status"
        >
          <Cpu className="h-3.5 w-3.5 text-cyan-600" />
          <span>Pi 5:</span>
          <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            {currentStationStatus}
          </span>
        </button>

        {/* Streak Counter for Students */}
        {user?.role === 'student' && (
          <div
            onClick={() => onNavigate('analytics')}
            className="flex cursor-pointer items-center gap-1.5 rounded-full bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-600 border border-orange-200 hover:bg-orange-100"
            title="Current Learning Streak"
          >
            <Flame className="h-4 w-4 fill-orange-500 text-orange-500 animate-bounce" />
            <span>{user.streak}d Streak</span>
          </div>
        )}

        {/* Notification Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifDropdown(!showNotifDropdown)}
            className="relative rounded-lg p-2 text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-cyan-600 text-[10px] font-bold text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifDropdown && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl ring-1 ring-black/5 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-slate-900 text-sm">Notifications</h3>
                  {unreadCount > 0 && (
                    <span className="rounded-full bg-cyan-100 px-2 py-0.5 text-xs font-medium text-cyan-800">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllRead}
                      className="text-xs text-cyan-700 hover:text-cyan-800 font-medium"
                    >
                      Mark all read
                    </button>
                  )}
                  <button
                    onClick={() => setShowNotifDropdown(false)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="mt-2 max-h-80 overflow-y-auto space-y-2.5 divide-y divide-slate-50">
                {notifications.length === 0 ? (
                  <p className="py-6 text-center text-xs text-slate-500">No new notifications</p>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n._id}
                      className={`pt-2.5 first:pt-0 ${n.read ? 'opacity-70' : 'opacity-100'}`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="text-xs font-semibold text-slate-800">{n.title}</h4>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap">
                          {new Date(n.createdAt).toLocaleDateString([], {
                            month: 'short',
                            day: 'numeric',
                          })}
                        </span>
                      </div>
                      <p className="mt-1 text-xs text-slate-600 line-clamp-2">{n.message}</p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center gap-2 rounded-full border border-slate-200 p-1 pl-2 hover:border-slate-300 hover:bg-slate-50"
          >
            <div className="text-right hidden sm:block">
              <p className="text-xs font-semibold text-slate-900">{user?.name || 'Guest'}</p>
              <p className="text-[10px] font-medium uppercase text-cyan-700 tracking-wider">
                {user?.role || 'Visitor'}
              </p>
            </div>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-cyan-300 font-semibold text-xs shadow-sm">
              {user?.name ? user.name[0].toUpperCase() : 'G'}
            </div>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl ring-1 ring-black/5 z-50">
              <div className="px-3 py-2 border-b border-slate-100 mb-1">
                <p className="text-xs font-semibold text-slate-900">{user?.name}</p>
                <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                <span className="mt-1 inline-block rounded bg-cyan-100 px-1.5 py-0.5 text-[10px] font-semibold text-cyan-800 uppercase">
                  Role: {user?.role}
                </span>
              </div>

              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  onNavigate('profile');
                }}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100"
              >
                <UserIcon className="h-4 w-4 text-slate-400" />
                <span>My Profile & Linking Code</span>
              </button>

              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  onNavigate('smart-station');
                }}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100"
              >
                <Cpu className="h-4 w-4 text-cyan-600" />
                <span>Smart Station Hardware</span>
              </button>

              <div className="my-1 border-t border-slate-100" />

              <button
                onClick={() => {
                  setShowProfileMenu(false);
                  logout();
                  onNavigate('landing');
                }}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50"
              >
                <LogOut className="h-4 w-4" />
                <span>Log Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
