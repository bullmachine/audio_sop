import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  SoundOutlined,
  PlayCircleOutlined,
  PauseCircleOutlined,
  FilterOutlined,
  StepBackwardOutlined,
  StepForwardOutlined,
} from "@ant-design/icons";
import Breadcrumbs from "../../shared/component/Breadcrumbs";
import { Input } from "../../shared/component/Input";
import { Select } from "../../shared/component/Select";
import NoData from "../../shared/component/NoData";
import ServiceFactory from "../../services/serviceFactory";
import type { AudioSop } from "../../services/audioSopService";
import { useLoader } from "../../shared/hooks/useLoader";
import { useDebouncedSearch } from "../../hooks/useDebounce";
import { getAudioUrl } from "../../utils/audioUrl";
import { toast } from "react-toastify";

const getLabel = (ref: string | { _id: string; name?: string; stage?: string; language?: string }) => {
  if (typeof ref === "string") return ref;
  return ref.name || ref.stage || ref.language || "";
};

type PlaylistTrack = {
  id: string;
  src: string;
  originalName: string;
  sopName: string;
  assignmentId: string;
  order: number;
};

const buildPlaylist = (assignments: AudioSop[]): PlaylistTrack[] => {
  const tracks: PlaylistTrack[] = [];

  assignments.forEach((assignment) => {
    const sortedFiles = [...assignment.files].sort((a, b) => a.order - b.order);
    sortedFiles.forEach((file, index) => {
      tracks.push({
        id: file._id || `${assignment._id}-${index}`,
        src: getAudioUrl(file.filePath),
        originalName: file.originalName,
        sopName: assignment.sopName,
        assignmentId: assignment._id,
        order: file.order ?? index,
      });
    });
  });

  return tracks;
};

const OperatorDashboard: React.FC = () => {
  const { simulateAsync } = useLoader();
  const [assignments, setAssignments] = useState<AudioSop[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [productFilter, setProductFilter] = useState("");
  const [stageFilter, setStageFilter] = useState("");
  const [currentTrackIndex, setCurrentTrackIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playlistRef = useRef<PlaylistTrack[]>([]);
  const currentTrackIndexRef = useRef(-1);
  const playTrackAtRef = useRef<(index: number) => Promise<void>>(async () => {});

  const playlist = useMemo(() => buildPlaylist(assignments), [assignments]);
useEffect(() => {
  if (!("mediaSession" in navigator)) return;

  // ▶ PLAY BUTTON (HEADSET)
  navigator.mediaSession.setActionHandler("play", async () => {
    const audio = audioRef.current;
    if (!audio) return;

    // 👉 IF SONG ENDED → PLAY NEXT
    if (audio.ended || audio.currentTime === audio.duration) {
      const next = currentTrackIndexRef.current + 1;

      if (next < playlistRef.current.length) {
        await playTrackAtRef.current(next);
      }
      return;
    }

    await audio.play();
    setIsPlaying(true);
  });

  // ⏸ PAUSE BUTTON
  navigator.mediaSession.setActionHandler("pause", () => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.pause();
    setIsPlaying(false);
  });

  // ⏭ NEXT BUTTON
  navigator.mediaSession.setActionHandler("nexttrack", async () => {
    const next = currentTrackIndexRef.current + 1;

    if (next < playlistRef.current.length) {
      await playTrackAtRef.current(next);
    }
  });

  // ⏮ PREVIOUS BUTTON
  navigator.mediaSession.setActionHandler("previoustrack", async () => {
    const prev = currentTrackIndexRef.current - 1;

    if (prev >= 0) {
      await playTrackAtRef.current(prev);
    }
  });

  return () => {
    navigator.mediaSession.setActionHandler("play", null);
    navigator.mediaSession.setActionHandler("pause", null);
    navigator.mediaSession.setActionHandler("nexttrack", null);
    navigator.mediaSession.setActionHandler("previoustrack", null);
  };
}, []);
  useEffect(() => {
    playlistRef.current = playlist;
  }, [playlist]);

  useEffect(() => {
    currentTrackIndexRef.current = currentTrackIndex;
  }, [currentTrackIndex]);

  const currentTrack = currentTrackIndex >= 0 ? playlist[currentTrackIndex] : null;

  const fetchAssignments = async (search?: string) => {
    const params: Record<string, string> = {};
    if (search) params.search = search;
    if (productFilter) params.product = productFilter;
    if (stageFilter) params.stage = stageFilter;

    const response = await ServiceFactory.audioSopService.getMyAssignments(params);
    setAssignments(response.data || []);
  };

  const fetchWithLoader = async (search?: string) => {
    setLoading(true);
    await simulateAsync(() => fetchAssignments(search), "Loading your audio files...", 800);
    setLoading(false);
  };

  const { updateSearchText, debouncedFetchData, cancelPendingCalls } = useDebouncedSearch(
    setSearchText,
    fetchAssignments,
    400
  );

  const productOptions = useMemo(() => {
    const map = new Map<string, string>();
    assignments.forEach((a) => {
      const id = typeof a.product === "string" ? a.product : a.product._id;
      map.set(id, getLabel(a.product));
    });
    return [{ label: "All Products", value: "" }, ...Array.from(map, ([value, label]) => ({ value, label }))];
  }, [assignments]);

  const stageOptions = useMemo(() => {
    const map = new Map<string, string>();
    assignments.forEach((a) => {
      const id = typeof a.stage === "string" ? a.stage : a.stage._id;
      map.set(id, getLabel(a.stage));
    });
    return [{ label: "All Stages", value: "" }, ...Array.from(map, ([value, label]) => ({ value, label }))];
  }, [assignments]);

  const stopPlayback = useCallback(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    setIsPlaying(false);
    setCurrentTrackIndex(-1);
  }, []);

  const playTrackAt = useCallback(
    async (index: number) => {
      const list = playlistRef.current;
      if (index < 0 || index >= list.length) return;

      const track = list[index];
      const audio = audioRef.current;
      if (!audio) return;

      try {
        audio.pause();
        audio.src = track.src;
        audio.load();
        await audio.play();
        setCurrentTrackIndex(index);
        setIsPlaying(true);
        // ✅ HEADSET FIX START
        if ("mediaSession" in navigator) {
          navigator.mediaSession.metadata = new MediaMetadata({
            title: track.originalName,
            artist: track.sopName,
            album: "Audio SOP",
          });

          navigator.mediaSession.playbackState = "playing";
        }
        if ("mediaSession" in navigator) {
          navigator.mediaSession.setPositionState({
            duration: audio.duration || 0,
            playbackRate: audio.playbackRate,
            position: audio.currentTime,
          });
        }
        // ✅ HEADSET FIX END
      } catch {
        toast.error(`Unable to play "${track.originalName}". Check that the file exists on the server.`);
        stopPlayback();
      }
    },
    [stopPlayback]
  );

  useEffect(() => {
    playTrackAtRef.current = playTrackAt;
  }, [playTrackAt]);

  const togglePlayPause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      return;
    }

    if (currentTrackIndexRef.current >= 0) {
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          toast.error("Playback failed");
          stopPlayback();
        });
      return;
    }

    if (playlistRef.current.length > 0) {
      playTrackAt(0);
    }
  }, [isPlaying, playTrackAt, stopPlayback]);

  const playPrevious = useCallback(() => {
    const idx = currentTrackIndexRef.current;
    if (idx > 0) playTrackAt(idx - 1);
  }, [playTrackAt]);

  const playNext = useCallback(() => {
    const idx = currentTrackIndexRef.current;
    const list = playlistRef.current;
    if (idx >= 0 && idx < list.length - 1) playTrackAt(idx + 1);
  }, [playTrackAt]);

  const playTrackById = useCallback(
    (trackId: string) => {
      const index = playlistRef.current.findIndex((t) => t.id === trackId);
      if (index === -1) return;

      if (currentTrackIndexRef.current === index && isPlaying) {
        audioRef.current?.pause();
        setIsPlaying(false);
        return;
      }

      if (currentTrackIndexRef.current === index && !isPlaying) {
        audioRef.current
          ?.play()
          .then(() => setIsPlaying(true))
          .catch(() => toast.error("Playback failed"));
        return;
      }

      playTrackAt(index);
    },
    [isPlaying, playTrackAt]
  );

  useEffect(() => {
    fetchWithLoader();
  }, [productFilter, stageFilter]);

  useEffect(() => {
    const audio = new Audio(); 
    // ✅ ADD THIS
audio.addEventListener("timeupdate", () => {
  if ("mediaSession" in navigator) {
    navigator.mediaSession.setPositionState({
      duration: audio.duration || 0,
      playbackRate: audio.playbackRate,
      position: audio.currentTime,
    });
  }
}); 
    audio.preload = "metadata";
    audioRef.current = audio;

    const handleEnded = () => {
      audio.pause();
      audio.currentTime = 0;
      setIsPlaying(false);
      if ("mediaSession" in navigator) {
        navigator.mediaSession.playbackState = "paused";
      }
    };

    const handleError = () => {
      const idx = currentTrackIndexRef.current;
      const list = playlistRef.current;
      const name = list[idx]?.originalName || "Audio file";
      toast.error(`Could not load "${name}". File may be missing on the server.`);
      stopPlayback();
    };

    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("error", handleError);

    return () => {
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("error", handleError);
      audio.pause();
      audio.src = "";
      audioRef.current = null;
    };
  }, [stopPlayback]);

  const hasPlaylist = playlist.length > 0;
  const canGoPrevious = currentTrackIndex > 0;
  const canGoNext = currentTrackIndex >= 0 && currentTrackIndex < playlist.length - 1;

  return (
    <div className="w-full pb-28">
      <Breadcrumbs
        className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg dark:from-gray-800 dark:to-gray-800"
        headTitle="My Audio Files"
        items={[{ label: "My Audio", path: "/my-audio" }]}/>
      <div className="mb-6 p-5 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Assigned Audio SOPs</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          Tracks play in admin order. Use earphone controls to navigate between tracks.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <Input
            placeholder="Search SOP name..."
            value={searchText}
            onChange={(e) => {
              updateSearchText(e.target.value);
              if (e.target.value.trim() === "") {
                cancelPendingCalls();
                fetchWithLoader("");
              } else {
                debouncedFetchData(e.target.value);
              }
            }}
          />
          <Select
            label=""
            options={productOptions}
            value={productFilter}
            onChange={(e) => setProductFilter(e.target.value)}
            searchable
          />
          <Select
            label=""
            options={stageOptions}
            value={stageFilter}
            onChange={(e) => setStageFilter(e.target.value)}
            searchable
          />
        </div>
      </div>

      {!loading && assignments.length === 0 ? (
        <NoData
          title="No Audio Files Assigned"
          message="Your administrator has not assigned any audio SOPs yet."
          className="py-12"
        />
      ) : (
        <div className="space-y-4">
          {assignments.map((assignment) => {
            const sortedFiles = [...assignment.files].sort((a, b) => a.order - b.order);

            return (
              <div
                key={assignment._id}
                className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
              >
                <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                  <div className="flex flex-wrap items-center gap-2">
                    <SoundOutlined className="text-blue-500" />
                    <h3 className="font-semibold text-gray-900 dark:text-white">{assignment.sopName}</h3>
                  </div>
                  <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500 dark:text-gray-400">
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
                      <FilterOutlined /> {getLabel(assignment.product)}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-full">
                      {getLabel(assignment.stage)}
                    </span>
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-50 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full">
                      {getLabel(assignment.language)}
                    </span>
                  </div>
                </div>

                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                  {sortedFiles.map((file, index) => {
                    const fileKey = file._id || `${assignment._id}-${index}`;
                    const isActive = currentTrack?.id === fileKey;
                    const rowPlaying = isActive && isPlaying;

                    return (
                      <div
                        key={fileKey}
                        className={`flex items-center gap-4 px-5 py-3 transition-colors ${
                          isActive
                            ? "bg-blue-50/80 dark:bg-blue-900/20"
                            : "hover:bg-gray-50 dark:hover:bg-gray-700/50"
                        }`}
                      >
                        <span
                          className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium ${
                            isActive
                              ? "bg-blue-500 text-white"
                              : "bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300"
                          }`}
                        >
                          {index + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                            {file.originalName}
                          </p>
                          <p className="text-xs text-gray-400">
                            {(file.size / 1024 / 1024).toFixed(2)} MB
                            {isActive && (
                              <span className="ml-2 text-blue-500">
                                {rowPlaying ? "Playing" : "Paused"}
                              </span>
                            )}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => playTrackById(fileKey)}
                          className={`flex items-center justify-center w-10 h-10 rounded-full transition-all ${
                            rowPlaying
                              ? "bg-red-500 hover:bg-red-600 text-white"
                              : isActive
                                ? "bg-amber-500 hover:bg-amber-600 text-white"
                                : "bg-blue-500 hover:bg-blue-600 text-white"
                          }`}
                          title={rowPlaying ? "Pause" : "Play"}
                        >
                          {rowPlaying ? <PauseCircleOutlined /> : <PlayCircleOutlined />}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {hasPlaylist && (
        <div
          className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 dark:border-gray-700 bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-[0_-4px_24px_rgba(0,0,0,0.08)]"
          role="region"
          aria-label="Audio player"
        >
          <div className="max-w-4xl mx-auto px-4 py-3 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">Now playing</p>
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {currentTrack?.originalName || "Select a track"}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                {currentTrack
                  ? `${currentTrack.sopName} · ${currentTrackIndex + 1} / ${playlist.length}`
                  : `${playlist.length} track(s) in queue`}
              </p>
            </div>

            <div className="flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={playPrevious}
                disabled={!canGoPrevious}
                className="flex items-center justify-center w-11 h-11 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                title="Previous track"
                aria-label="Previous track"
              >
                <StepBackwardOutlined className="text-lg" />
              </button>

              <button
                type="button"
                onClick={togglePlayPause}
                className="flex items-center justify-center w-14 h-14 rounded-full bg-blue-500 hover:bg-blue-600 text-white shadow-lg transition-transform hover:scale-105"
                title={isPlaying ? "Pause" : "Play"}
                aria-label={isPlaying ? "Pause" : "Play"}
              >
                {isPlaying ? (
                  <PauseCircleOutlined className="text-2xl" />
                ) : (
                  <PlayCircleOutlined className="text-2xl" />
                )}
              </button>

              <button
                type="button"
                onClick={playNext}
                disabled={!canGoNext}
                className="flex items-center justify-center w-11 h-11 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                title="Next track"
                aria-label="Next track"
              >
                <StepForwardOutlined className="text-lg" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OperatorDashboard;