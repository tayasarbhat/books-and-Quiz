import { Category } from '../types';
import { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp, Sparkles, Grid, BookOpen, Brain, Calculator, GraduationCap, X, Filter } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CategoryFilterProps {
  categories: Category[];
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
  theme: any;
}

export function CategoryFilter({ categories, selectedCategory, onSelectCategory, theme }: CategoryFilterProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const mainCategories = categories.filter(cat => 
    ['QUANTITATIVE APTITUDE', 'REASONING', 'GENERAL KNOWLEDGE', 'GENERAL ENGLISH'].includes(cat.name)
  );
  
  const otherCategories = categories.filter(cat => 
    !['QUANTITATIVE APTITUDE', 'REASONING', 'GENERAL KNOWLEDGE', 'GENERAL ENGLISH'].includes(cat.name)
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getCategoryIcon = (name: string) => {
    switch (name) {
      case 'QUANTITATIVE APTITUDE':
        return <Calculator className="h-5 w-5" />;
      case 'REASONING':
        return <Brain className="h-5 w-5" />;
      case 'GENERAL KNOWLEDGE':
        return <GraduationCap className="h-5 w-5" />;
      case 'GENERAL ENGLISH':
        return <BookOpen className="h-5 w-5" />;
      default:
        return null;
    }
  };

  const getCategoryStyle = (category: Category | null) => {
    if (!category) {
      return selectedCategory === null
        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 ring-2 ring-blue-500/50 ring-offset-2 ring-offset-slate-900'
        : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:shadow-indigo-500/25';
    }

    const isSelected = selectedCategory === category.name;
    return `${category.color} ${
      isSelected ? `ring-2 ring-offset-2 ${category.ringColor} ring-offset-slate-900` : ''
    }`;
  };

  const isOtherCategorySelected = selectedCategory && otherCategories.some(cat => cat.name === selectedCategory);

  // Mobile filter drawer
  const renderMobileFilterDrawer = () => (
    <AnimatePresence>
      {showMobileFilter && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-end sm:hidden"
          onClick={() => setShowMobileFilter(false)}
        >
          <motion.div 
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="w-full bg-slate-900 rounded-t-3xl p-6 max-h-[80vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Categories</h3>
              <button 
                onClick={() => setShowMobileFilter(false)}
                className="p-2 rounded-full bg-slate-800 text-white/70"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-3 mb-6">
              <button
                onClick={() => {
                  onSelectCategory(null);
                  setShowMobileFilter(false);
                }}
                className={`w-full flex items-center gap-3 p-3 rounded-xl text-white transition-all ${
                  selectedCategory === null ? 'bg-gradient-to-r from-blue-600 to-indigo-600' : 'bg-slate-800'
                }`}
              >
                <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                  <Sparkles className="h-5 w-5" />
                </div>
                <span className="font-medium">All Books</span>
                {selectedCategory === null && (
                  <span className="ml-auto w-2 h-2 rounded-full bg-white"></span>
                )}
              </button>
              
              {mainCategories.map(category => (
                <button
                  key={category.name}
                  onClick={() => {
                    onSelectCategory(category.name);
                    setShowMobileFilter(false);
                  }}
                  className={`w-full flex items-center gap-3 p-3 rounded-xl text-white transition-all ${
                    selectedCategory === category.name ? category.color : 'bg-slate-800'
                  }`}
                >
                  <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center">
                    {getCategoryIcon(category.name)}
                  </div>
                  <span className="font-medium">{category.name}</span>
                  {selectedCategory === category.name && (
                    <span className="ml-auto w-2 h-2 rounded-full bg-white"></span>
                  )}
                </button>
              ))}
            </div>
            
            <div className="border-t border-slate-700 pt-4">
              <h4 className="text-sm font-medium text-white/70 mb-3">Other Categories</h4>
              <div className="space-y-2">
                {otherCategories.map(category => (
                  <button
                    key={category.name}
                    onClick={() => {
                      onSelectCategory(category.name);
                      setShowMobileFilter(false);
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-xl text-white transition-all ${
                      selectedCategory === category.name ? 'bg-slate-700' : 'bg-slate-800/50'
                    }`}
                  >
                    <span>{category.name}</span>
                    {selectedCategory === category.name && (
                      <span className="w-2 h-2 rounded-full bg-white"></span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      {/* Mobile Filter Button */}
      <div className="sm:hidden mb-4">
        <button
          onClick={() => setShowMobileFilter(true)}
          className="w-full flex items-center justify-between px-4 py-3 bg-white/10 backdrop-blur-sm rounded-xl text-white border border-white/10"
        >
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            <span>Filter by Category</span>
          </div>
          {selectedCategory && (
            <span className="px-2 py-1 bg-white/20 rounded-lg text-sm">
              {selectedCategory}
            </span>
          )}
        </button>
      </div>

      {/* Desktop Category Grid */}
      <div className="hidden sm:block my-8">
        {/* Main Category Grid */}
        <div className="grid grid-cols-4 gap-4 mb-4">
          {mainCategories.map((category) => (
            <motion.button
              key={category.name}
              onClick={() => onSelectCategory(category.name)}
              className={`group relative p-3 rounded-2xl text-white transition-all duration-300 
                transform hover:scale-[1.02] hover:shadow-xl
                ${getCategoryStyle(category)}
                ${selectedCategory === category.name ? 'scale-[1.02]' : ''}`}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-1 rounded-xl bg-white/20 backdrop-blur-sm">
                    {getCategoryIcon(category.name)}
                  </div>
                </div>
                <h3 className="text-base font-semibold leading-tight">
                  {category.name}
                </h3>
                <div className="mt-1 h-1 w-12 bg-white/30 rounded-full overflow-hidden">
                  <div className="h-full w-0 group-hover:w-full bg-white/60 transition-all duration-700 ease-out" />
                </div>
              </div>
            </motion.button>
          ))}
        </div>

        {/* Action Buttons Grid */}
        <div className="grid grid-cols-2 gap-4">
          {/* All Books Button */}
          <motion.button
            onClick={() => onSelectCategory(null)}
            className={`group relative p-3 rounded-2xl text-white transition-all duration-300 
              transform hover:scale-[1.02] hover:shadow-xl
              ${getCategoryStyle(null)}
              ${selectedCategory === null ? 'scale-[1.02]' : ''}`}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <div className="p-1 rounded-xl bg-white/20 backdrop-blur-sm">
                  <Sparkles className="h-5 w-5" />
                </div>
              </div>
              <h3 className="text-base font-semibold leading-tight">
                All Books
              </h3>
              <div className="mt-1 h-1 w-12 bg-white/30 rounded-full overflow-hidden">
                <div className="h-full w-0 group-hover:w-full bg-white/60 transition-all duration-700 ease-out" />
              </div>
            </div>
          </motion.button>

          {/* More Categories Button */}
          <div className="relative" ref={dropdownRef}>
            <motion.button
              onClick={() => setIsOpen(!isOpen)}
              className={`group relative w-full p-3 rounded-2xl text-white transition-all duration-300 
                transform hover:scale-[1.02] hover:shadow-xl
                ${isOtherCategorySelected 
                  ? selectedCategory && otherCategories.find(cat => cat.name === selectedCategory)?.color
                  : 'bg-gradient-to-r from-purple-600 via-fuchsia-500 to-pink-600'
                }
                ${isOtherCategorySelected ? `ring-2 ring-offset-2 ${otherCategories.find(cat => cat.name === selectedCategory)?.ringColor} ring-offset-slate-900` : ''}`}
              whileHover={{ y: -4 }}
              whileTap={{ scale: 0.98 }}
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-1 rounded-xl bg-white/20 backdrop-blur-sm">
                    <Grid className="h-5 w-5" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold leading-tight">
                    {isOtherCategorySelected ? selectedCategory : 'More Categories'}
                  </h3>
                  {isOpen ? (
                    <ChevronUp className="h-5 w-5" />
                  ) : (
                    <ChevronDown className="h-5 w-5" />
                  )}
                </div>
                <div className="mt-1 h-1 w-12 bg-white/30 rounded-full overflow-hidden">
                  <div className="h-full w-0 group-hover:w-full bg-white/60 transition-all duration-700 ease-out" />
                </div>
              </div>
            </motion.button>

            <AnimatePresence>
              {isOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute left-0 right-0 mt-2 bg-slate-800/95 backdrop-blur-md rounded-xl shadow-xl z-50 border border-white/10"
                >
                  <div className="max-h-[60vh] overflow-y-auto divide-y divide-slate-700/50">
                    {otherCategories.map((category) => (
                      <button
                        key={category.name}
                        onClick={() => {
                          onSelectCategory(category.name);
                          setIsOpen(false);
                        }}
                        className={`w-full flex items-center justify-between p-3 sm:p-4 text-sm transition-all hover:bg-slate-700/50
                          ${selectedCategory === category.name ? 'bg-slate-700/70 font-medium text-white' : 'text-slate-300'}`}
                      >
                        <span>{category.name}</span>
                        {selectedCategory === category.name && (
                          <span className={`w-2 h-2 rounded-full ${category.color.replace('bg-gradient-to-r', 'bg')}`} />
                        )}
                      </button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {renderMobileFilterDrawer()}
    </>
  );
}