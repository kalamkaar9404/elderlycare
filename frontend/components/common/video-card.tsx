'use client';

/**
 * VideoCard
 * ──────────
 * Displays a video card with a real image thumbnail.
 * - If `youtubeId` is provided, tries YouTube's hqdefault thumbnail first.
 * - If `imageUrl` is provided (Unsplash / any CDN), uses that.
 * - Falls back to a themed gradient with emoji if both fail.
 * Click → opens YouTube search in new tab (always works).
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Play, Clock, ExternalLink } from 'lucide-react';

export interface VideoCardProps {
  title: string;
  description: string;
  duration: string;
  channel: string;
  tag: string;
  tagColor: string;
  searchQuery: string;
  /** Real YouTube video ID — thumbnail from i.ytimg.com */
  youtubeId?: string;
  /** Direct image URL (Unsplash, etc.) — used if youtubeId absent or fails */
  imageUrl?: string;
  emoji: string;
  gradientFrom: string;
  gradientTo: string;
  index?: number;
}

export function VideoCard({
  title,
  description,
  duration,
  channel,
  tag,
  tagColor,
  searchQuery,
  youtubeId,
  imageUrl,
  emoji,
  gradientFrom,
  gradientTo,
  index = 0,
}: VideoCardProps) {
  const [ytFailed, setYtFailed]     = useState(false);
  const [imgFailed, setImgFailed]   = useState(false);

  const youtubeUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery)}`;

  // Determine which thumbnail to show
  const ytThumb   = youtubeId ? `https://i.ytimg.com/vi/${youtubeId}/hqdefault.jpg` : null;
  const showYt    = ytThumb && !ytFailed;
  const showImg   = !showYt && imageUrl && !imgFailed;
  const showGrad  = !showYt && !showImg;

  return (
    <motion.div
      className="glass-silk rounded-2xl overflow-hidden border-white/30 flex flex-col"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 * index, duration: 0.4 }}
      whileHover={{ y: -4, boxShadow: '0 20px 50px rgba(107,142,111,0.18)' }}
    >
      {/* ── Thumbnail ─────────────────────────────────────────────── */}
      <div
        className="relative aspect-video cursor-pointer overflow-hidden"
        onClick={() => window.open(youtubeUrl, '_blank', 'noopener,noreferrer')}
      >
        {/* Gradient base — always behind everything */}
        <div
          className="absolute inset-0"
          style={{ background: `linear-gradient(135deg, ${gradientFrom}, ${gradientTo})` }}
        />

        {/* Layer 1: YouTube thumbnail */}
        {showYt && (
          <img
            src={ytThumb!}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover"
            onError={() => setYtFailed(true)}
          />
        )}

        {/* Layer 2: Unsplash / CDN image */}
        {showImg && (
          <img
            src={imageUrl!}
            alt={title}
            className="absolute inset-0 w-full h-full object-cover"
            onError={() => setImgFailed(true)}
          />
        )}

        {/* Layer 3: Emoji fallback (gradient only) */}
        {showGrad && (
          <>
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full opacity-25"
                style={{ background: gradientTo }} />
              <div className="absolute -left-4 -bottom-4 w-24 h-24 rounded-full opacity-20"
                style={{ background: gradientFrom }} />
            </div>
            <div className="absolute inset-0 flex items-center justify-center pb-6">
              <motion.span
                className="text-6xl select-none"
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              >
                {emoji}
              </motion.span>
            </div>
          </>
        )}

        {/* Dark scrim over any image for readability */}
        {(showYt || showImg) && (
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
        )}

        {/* Play button — always visible */}
        <div className="absolute inset-0 flex items-center justify-center">
          <motion.div
            className="w-14 h-14 rounded-full flex items-center justify-center shadow-2xl"
            style={{ background: 'rgba(0,0,0,0.52)', backdropFilter: 'blur(4px)' }}
            whileHover={{ scale: 1.12 }}
            whileTap={{ scale: 0.94 }}
          >
            <Play className="h-6 w-6 text-white ml-0.5" fill="white" />
          </motion.div>
        </div>

        {/* Tag chip */}
        <span
          className="absolute top-3 left-3 text-white text-xs font-bold px-2.5 py-1 rounded-full z-10"
          style={{ background: tagColor, boxShadow: `0 2px 8px ${tagColor}70` }}
        >
          {tag}
        </span>

        {/* Duration chip */}
        <span className="absolute bottom-3 right-3 bg-black/70 text-white text-xs font-mono px-2 py-0.5 rounded z-10">
          {duration}
        </span>

        {/* YouTube link */}
        <a
          href={youtubeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-3 left-3 flex items-center gap-1 text-white/80 hover:text-white text-xs transition-colors z-10"
          onClick={(e) => e.stopPropagation()}
        >
          <ExternalLink className="h-3 w-3" />
          YouTube
        </a>
      </div>

      {/* ── Info row ───────────────────────────────────────────────── */}
      <div className="p-3 space-y-1">
        <p className="text-sm font-semibold text-foreground leading-snug line-clamp-2">{title}</p>
        <p className="text-xs text-muted-foreground line-clamp-1">{description}</p>
        <div className="flex items-center justify-between pt-1">
          <span className="text-xs text-muted-foreground font-medium">{channel}</span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />{duration}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
