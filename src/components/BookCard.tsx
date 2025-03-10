import React, { useState, useEffect } from 'react';
import { Book } from '../types';
import { FileText, Download, BookOpen, Clock, Heart, Share2, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

interface BookCardProps {
  book: Book;
  onLoad?: () => void;
  index: number;
  progress: number;
  theme?: any;
}

export function BookCard({ book, onLoad, index, progress, theme }: BookCardProps) {
  const [imageError, setImageError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [loadingPhase, setLoadingPhase] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoaded(true);
    }, Math.min(index * 100, 1000));
    return () => clearTimeout(timer);
  }, [index]);

  useEffect(() => {
    if (progress > 0) {
      const phase = Math.floor((progress / 100) * 4);
      setLoadingPhase(phase);
    }
  }, [progress]);

  const getImageUrl = (url: string) => {
    const fileIdMatch = url.match(/id=([^&]+)/);
    if (fileIdMatch) {
      const fileId = fileIdMatch[1];
      return `https://drive.google.com/thumbnail?id=${fileId}&sz=w800`;
    }
    return url;
  };

  if (!book.title || !isLoaded) {
    return (
      <BookCardSkeleton progress={progress} phase={loadingPhase} index={index} />
    );
  }

  const getCategoryGradient = () => {
    const gradients: { [key: string]: string } = {
      'QUANTITATIVE APTITUDE': 'from-blue-600 to-indigo-600',
      'REASONING': 'from-purple-600 to-pink-600',
      'GENERAL KNOWLEDGE': 'from-emerald-600 to-teal-600',
      'GENERAL ENGLISH': 'from-cyan-600 to-blue-600',
      'HISTORY': 'from-amber-600 to-orange-600',
      'GEOGRAPHY': 'from-lime-600 to-green-600',
      'SCIENCE': 'from-sky-600 to-cyan-600',
      'POLITY': 'from-blue-600 to-indigo-600',
      'ECONOMY': 'from-violet-600 to-purple-600',
    };
    return gradients[book.category] || 'from-slate-600 to-gray-600';
  };

  return (
    <motion.div 
      className="group relative"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{ y: -8 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <div className={`absolute -inset-0.5 bg-gradient-to-r ${getCategoryGradient()} rounded-3xl blur opacity-25 group-hover:opacity-100 transition duration-300`}></div>
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden transition-all duration-300 shadow-sm hover:shadow-xl border border-slate-100 dark:border-gray-700">
        <div className="aspect-[4/3] bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-700 dark:to-gray-800 relative overflow-hidden">
          {!imageError ? (
            <img
              src={getImageUrl(book.coverUrl)}
              alt={book.title}
              className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-110"
              onError={() => setImageError(true)}
              onLoad={onLoad}
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-700 dark:to-gray-800">
              <BookOpen className="h-12 w-12 text-slate-400 dark:text-gray-500 mb-2" />
              <span className="text-sm text-slate-500 dark:text-gray-400">Cover not available</span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Action Buttons */}
          <div className="absolute bottom-4 right-4 flex space-x-2 opacity-0 group-hover:opacity-100 transform translate-y-2 group-hover:translate-y-0 transition-all duration-300">
            {book.driveLink && (
              <a
                href={book.driveLink}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-xl bg-white/90 backdrop-blur-sm text-blue-800 hover:bg-white hover:shadow-lg transition-all duration-200"
                title="Download"
              >
                <Download className="h-5 w-5" />
              </a>
            )}
            <button
              className="p-3 rounded-xl bg-white/90 backdrop-blur-sm text-pink-600 hover:bg-white hover:shadow-lg transition-all duration-200"
              title="Save"
            >
              <Heart className="h-5 w-5" />
            </button>
            <button
              className="p-3 rounded-xl bg-white/90 backdrop-blur-sm text-indigo-600 hover:bg-white hover:shadow-lg transition-all duration-200"
              title="Share"
            >
              <Share2 className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white line-clamp-2 group-hover:text-blue-800 dark:group-hover:text-blue-400 transition-colors">
                {book.title}
              </h3>
              <p className="text-sm text-slate-600 dark:text-gray-300 mt-1 flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                by {book.author}
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className={`px-3 py-1 text-xs font-medium rounded-full bg-gradient-to-r ${getCategoryGradient()} text-white shadow-sm`}>
                {book.category}
              </span>
              {book.fileType && (
                <span className="inline-flex items-center gap-1 px-3 py-1 text-xs font-medium rounded-full bg-gradient-to-r from-slate-800 to-slate-600 text-white shadow-sm">
                  <FileText className="h-3 w-3" />
                  {book.fileType}
                </span>
              )}
            </div>

            <p className="text-sm text-slate-600 dark:text-gray-300 line-clamp-2 border-t border-slate-100 dark:border-gray-700 pt-4">
              {book.description}
            </p>

            {book.fileSize && (
              <div className="flex items-center justify-between text-xs text-slate-500 dark:text-gray-400 pt-2 border-t border-slate-100 dark:border-gray-700">
                <span>Size: {book.fileSize}</span>
                <span className="px-2 py-1 rounded-md bg-slate-100 dark:bg-gray-700">
                  {book.fileType}
                </span>
              </div>
            )}
            
            {/* Read More Button */}
            {book.driveLink && (
              <div className="pt-2">
                <a
                  href={book.driveLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors"
                >
                  Read More
                  <ExternalLink className="ml-1 h-3.5 w-3.5" />
                </a>
              </div>
            )}
          </div>
        </div>
        
        {/* Hover Glow Effect */}
        <motion.div 
          className="absolute inset-0 pointer-events-none rounded-2xl"
          animate={{ 
            boxShadow: isHovered 
              ? `0 0 20px 2px rgba(${book.category === 'REASONING' ? '168, 85, 247' : book.category === 'QUANTITATIVE APTITUDE' ? '79, 70, 229' : '16, 185, 129'}, 0.3)` 
              : '0 0 0px 0px rgba(0, 0, 0, 0)'
          }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </motion.div>
  );
}

interface SkeletonProps {
  progress: number;
  phase: number;
  index: number;
}

function BookCardSkeleton({ progress, phase, index }: SkeletonProps) {
  const loadingStates = [
    'Getting Books For You..',
    'Fetching details...',
    'Almost ready...',
    'Finalizing...',
  ];

  const delayedProgress = Math.max(0, progress - index * 5);
  const currentLoadingState = loadingStates[phase] || loadingStates[0];

  return (
    <div className="relative">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-800/30 to-indigo-800/30 rounded-3xl blur opacity-25"></div>
      <div className="relative bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-sm border border-slate-100 dark:border-gray-700">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30">
          <div
            className="h-full bg-gradient-to-r from-blue-800 to-indigo-600 transition-all duration-300 ease-out"
            style={{ width: `${delayedProgress}%` }}
          />
        </div>

        <div className="aspect-[4/3] bg-gradient-to-br from-slate-50 to-slate-100 dark:from-gray-700 dark:to-gray-800 relative overflow-hidden">
          <div className="absolute inset-0 shimmer" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="inline-block p-3 rounded-full bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm shadow-sm">
                <div className="w-8 h-8 border-2 border-blue-800 dark:border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
              <p className="mt-4 text-sm font-medium text-slate-700 dark:text-gray-200 bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-sm">
                {currentLoadingState}
              </p>
              <p className="mt-2 text-xs text-slate-500 dark:text-gray-400 bg-white/90 dark:bg-gray-700/90 backdrop-blur-sm px-3 py-1 rounded-full inline-block shadow-sm">
                {delayedProgress}% Complete
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 relative">
          <div className="space-y-3">
            <div className="h-6 bg-slate-100 dark:bg-gray-700 rounded-lg w-3/4 shimmer" />
            <div className="h-4 bg-slate-100 dark:bg-gray-700 rounded-lg w-1/2 shimmer" />
            <div className="flex gap-2">
              <div className="h-6 bg-slate-100 dark:bg-gray-700 rounded-full w-24 shimmer" />
              <div className="h-6 bg-slate-100 dark:bg-gray-700 rounded-full w-16 shimmer" />
            </div>
            <div className="space-y-2">
              <div className="h-4 bg-slate-100 dark:bg-gray-700 rounded-lg w-full shimmer" />
              <div className="h-4 bg-slate-100 dark:bg-gray-700 rounded-lg w-2/3 shimmer" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}