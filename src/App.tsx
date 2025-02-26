import { useState, useEffect, useMemo, useRef } from 'react';
import { Library, ChevronLeft, ChevronRight, Menu, GraduationCap, Brain, Sparkles, Search, BookOpen, X, ArrowRight } from 'lucide-react';
import { categories } from './data';
import { SearchBar } from './components/SearchBar';
import { CategoryFilter } from './components/CategoryFilter';
import { BookCard } from './components/BookCard';
import { MenuBar } from './components/MenuBar';
import { fetchBooks } from './api';
import { Book } from './types';
import { useTheme } from './context/ThemeContext';
import { QuizApp } from './quiz/QuizApp';
import { motion, AnimatePresence } from 'framer-motion';

// Priority books that should always appear on the first page
const PRIORITY_BOOKS = [
  'Indian Polity by Laxmikanth 6th Edition McGraw Hill',
  'History of Modern India 2020 Edition Bipan Chandra',
  'Geography of India Majid Husain 9th Edition',
  'Ecology Environment Quick Revision Material Disha Experts',
  'Magbook Indian History Janmenjay Sahni',
  'Magbook General Science Poonam Singh',
  'Indian Economy by Ramesh Singh 12th Edition'
];

function App() {
  const { theme, setThemeById } = useTheme();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadedImages, setLoadedImages] = useState(0);
  const [totalProgress, setTotalProgress] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [showQuiz, setShowQuiz] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showWelcome, setShowWelcome] = useState(true);
  const [animationComplete, setAnimationComplete] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  const booksPerPage = window.innerWidth < 640 ? 4 : window.innerWidth < 1024 ? 6 : 9;

  const placeholderBooks = Array(booksPerPage).fill(null).map((_, i) => ({
    id: `placeholder-${i}`,
    title: '',
    author: '',
    category: '',
    coverUrl: '',
    description: '',
  }));

  useEffect(() => {
    // Welcome animation timing
    const timer = setTimeout(() => {
      setShowWelcome(false);
    }, 3000);
    
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!showWelcome && !animationComplete) {
      setAnimationComplete(true);
    }
  }, [showWelcome]);

  useEffect(() => {
    const loadBooks = async () => {
      try {
        const fetchedBooks = await fetchBooks();
        setBooks(fetchedBooks);
        
        let progress = 0;
        const interval = setInterval(() => {
          progress += 2;
          if (progress <= 100) {
            setTotalProgress(progress);
          } else {
            clearInterval(interval);
            setInitialLoadComplete(true);
          }
        }, 20);
      } catch (err) {
        setError('Failed to load books. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    if (animationComplete) {
      loadBooks();
    }
  }, [animationComplete]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedCategory]);

  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearch]);

  const handleImageLoad = (bookId: string) => {
    setLoadedImages(prev => prev + 1);
  };

  const filteredBooks = useMemo(() => {
    const filtered = books.filter((book) => {
      const matchesSearch = book.title.toLowerCase().includes(search.toLowerCase()) ||
                          book.author.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = !selectedCategory || book.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });

    if (currentPage === 1 && !search && !selectedCategory) {
      const priorityBooks: Book[] = [];
      const otherBooks: Book[] = [];

      filtered.forEach(book => {
        if (PRIORITY_BOOKS.some(title => 
          book.title.toLowerCase().includes(title.toLowerCase())
        )) {
          priorityBooks.push(book);
        } else {
          otherBooks.push(book);
        }
      });

      priorityBooks.sort((a, b) => {
        const aIndex = PRIORITY_BOOKS.findIndex(title => 
          a.title.toLowerCase().includes(title.toLowerCase())
        );
        const bIndex = PRIORITY_BOOKS.findIndex(title => 
          b.title.toLowerCase().includes(title.toLowerCase())
        );
        return aIndex - bIndex;
      });

      return [...priorityBooks, ...otherBooks];
    }

    return filtered;
  }, [books, search, selectedCategory, currentPage]);

  const totalPages = Math.ceil(filteredBooks.length / booksPerPage);
  const indexOfLastBook = currentPage * booksPerPage;
  const indexOfFirstBook = indexOfLastBook - booksPerPage;
  
  const displayBooks = useMemo(() => {
    if (loading) return placeholderBooks;
    
    const currentBooks = filteredBooks.slice(indexOfFirstBook, indexOfLastBook);
    
    if (!initialLoadComplete && currentPage > 2) {
      return currentBooks.slice(0, booksPerPage * 2);
    }
    
    return currentBooks;
  }, [loading, filteredBooks, currentPage, indexOfFirstBook, indexOfLastBook, initialLoadComplete, booksPerPage]);

  const paginate = (direction: 'prev' | 'next') => {
    const newPage = direction === 'next' ? currentPage + 1 : currentPage - 1;
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (showWelcome) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black">
        <motion.div 
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="text-center"
        >
          <motion.div 
            className="w-24 h-24 mx-auto mb-6 relative"
            animate={{ 
              rotate: 360,
              boxShadow: ["0 0 20px rgba(99, 102, 241, 0.5)", "0 0 40px rgba(168, 85, 247, 0.5)", "0 0 20px rgba(99, 102, 241, 0.5)"]
            }}
            transition={{ duration: 3, ease: "linear", repeat: Infinity }}
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 blur-xl opacity-70"></div>
            <div className="relative w-full h-full rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 flex items-center justify-center">
              <Library className="w-12 h-12 text-white" />
            </div>
          </motion.div>
          <motion.h1 
            className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            Digital Library
          </motion.h1>
          <motion.p 
            className="text-gray-400 mt-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
          >
            Your gateway to knowledge
          </motion.p>
        </motion.div>
      </div>
    );
  }

  if (showQuiz) {
    return <QuizApp onClose={() => setShowQuiz(false)} />;
  }

  return (
    <div className={`min-h-screen ${theme.bgGradient} transition-colors duration-500`}>
      {/* Floating Search Button */}
      {!showSearch && (
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="fixed top-7 right-20 z-50 p-3 rounded-full bg-white/20 backdrop-blur-md border border-white/30 shadow-lg hover:bg-white/30 transition-all duration-300"
          onClick={() => setShowSearch(true)}
        >
          <Search className="h-5 w-5 text-white" />
        </motion.button>
      )}

      {/* Expanded Search Overlay */}
      <AnimatePresence>
        {showSearch && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-50 pt-20 pb-10 px-4 bg-black/70 backdrop-blur-md flex flex-col"
          >
            <div className="max-w-3xl w-full mx-auto relative">
              <button 
                onClick={() => setShowSearch(false)}
                className="absolute -top-12 right-0 p-2 text-white/80 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
              
              <div className="relative">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search books by title or author..."
                  className="w-full px-6 py-4 pl-14 rounded-xl bg-white/10 backdrop-blur-md text-white placeholder-white/60 border border-white/20 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500/50 transition-all duration-300"
                />
                <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 h-5 w-5 text-white/70" />
              </div>
              
              {search && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 overflow-hidden max-h-[60vh] overflow-y-auto"
                >
                  {filteredBooks.length > 0 ? (
                    <div className="divide-y divide-white/10">
                      {filteredBooks.slice(0, 8).map((book) => (
                        <div key={book.id} className="p-4 hover:bg-white/10 transition-colors">
                          <h3 className="text-white font-medium">{book.title}</h3>
                          <p className="text-white/70 text-sm">{book.author}</p>
                          <div className="flex items-center mt-2">
                            <span className="text-xs px-2 py-1 rounded-full bg-white/20 text-white/90">{book.category}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 text-center text-white/80">
                      No books found matching "{search}"
                    </div>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header with Logo */}
      <header className={`sticky top-0 z-40 mb-3 sm:mb-6 ${theme.navBg} glass-nav`}>
        <div className="max-w-7xl mx-auto px-3 py-3 sm:px-6 sm:py-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl text-white shadow-md">
                <Library className="h-6 w-6" />
              </div>
              <h1 className={`text-2xl font-bold ${theme.textPrimary}`}>
                Digital Library
              </h1>
            </div>
            
            {/* Theme Selector */}
            <div className="flex space-x-2">
             
             
            
            </div>
          </div>
        </div>
        {loading && (
          <div className="absolute bottom-0 left-0 w-full h-0.5 bg-slate-200/20">
            <div 
              className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-300 ease-out"
              style={{ width: `${totalProgress}%` }}
            />
          </div>
        )}
      </header>

      <main className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative overflow-hidden rounded-3xl mb-8"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 to-purple-600 opacity-90"></div>
          <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1507842217343-583bb7270b66?ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center mix-blend-overlay"></div>
          
          <div className="relative z-10 px-6 py-12 sm:px-12 sm:py-20 text-white">
            <div className="max-w-3xl">
              <motion.h2 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
                className="text-3xl sm:text-5xl font-bold mb-4"
              >
                Discover a World of Knowledge
              </motion.h2>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.6 }}
                className="text-lg sm:text-xl text-white/90 mb-8 max-w-2xl"
              >
                Explore our vast collection of books across various subjects to enhance your learning journey.
              </motion.p>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="flex flex-wrap gap-4"
              >
                <button 
                  onClick={() => setShowSearch(true)}
                  className="px-6 py-3 bg-white text-indigo-700 rounded-xl hover:bg-white/90 transition-all duration-200 flex items-center gap-2 font-medium shadow-lg"
                >
                  <Search className="h-5 w-5" />
                  Search Books
                </button>
                <button 
                  onClick={() => setShowQuiz(true)}
                  className="px-6 py-3 bg-indigo-800/60 backdrop-blur-sm text-white rounded-xl hover:bg-indigo-800/80 transition-all duration-200 flex items-center gap-2 font-medium border border-white/20 shadow-lg"
                >
                  <Brain className="h-5 w-5" />
                  Take a Quiz
                </button>
              </motion.div>
            </div>
          </div>
          
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3"></div>
        </motion.div>

        {/* Category Filter with Animation */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <CategoryFilter
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            theme={theme}
          />
        </motion.div>

        {error ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-12"
          >
            <div className={`inline-block ${theme.cardBg} rounded-lg p-8 border border-white/10`}>
              <p className="text-red-400">{error}</p>
            </div>
          </motion.div>
        ) : (
          <>
            {/* Books Grid with Staggered Animation */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6 }}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
            >
              {displayBooks.map((book, index) => (
                <motion.div
                  key={book.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1, duration: 0.5 }}
                >
                  <BookCard 
                    book={book}
                    index={index}
                    onLoad={() => handleImageLoad(book.id)}
                    progress={totalProgress}
                    theme={theme}
                  />
                </motion.div>
              ))}
            </motion.div>

            {!loading && totalPages > 1 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="mt-12 flex justify-center items-center space-x-4"
              >
                <button
                  onClick={() => paginate('prev')}
                  disabled={currentPage === 1}
                  className={`flex items-center px-4 py-2 rounded-xl ${theme.textPrimary} hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
                >
                  <ChevronLeft className="h-5 w-5 mr-1" />
                  <span className="hidden sm:inline">Previous</span>
                </button>
                
                <div className={`px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium shadow-md`}>
                  {currentPage} / {totalPages}
                </div>

                <button
                  onClick={() => paginate('next')}
                  disabled={currentPage === totalPages}
                  className={`flex items-center px-4 py-2 rounded-xl ${theme.textPrimary} hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors`}
                >
                  <span className="hidden sm:inline">Next</span>
                  <ChevronRight className="h-5 w-5 ml-1" />
                </button>
              </motion.div>
            )}

            {!loading && !error && filteredBooks.length === 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12"
              >
                <div className={`inline-block ${theme.cardBg} rounded-lg p-8 border border-white/10`}>
                  <p className={`${theme.textSecondary} text-lg`}>
                    No books found. Try adjusting your search or filters.
                  </p>
                </div>
              </motion.div>
            )}
          </>
        )}
        
        {/* Featured Categories Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-16 mb-12"
        >
          <h2 className={`text-2xl sm:text-3xl font-bold ${theme.textPrimary} mb-6`}>Featured Categories</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {categories.slice(0, 4).map((category, index) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1, duration: 0.5 }}
                className={`group cursor-pointer rounded-2xl overflow-hidden relative h-40 ${category.color}`}
                onClick={() => setSelectedCategory(category.name)}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <div className="absolute inset-0 p-6 flex flex-col justify-between">
                  <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    {category.name === 'QUANTITATIVE APTITUDE' && <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="16" height="20" x="4" y="2" rx="2"/><line x1="8" x2="16" y1="6" y2="6"/><line x1="16" x2="16" y1="14" y2="18"/><path d="M16 10h.01"/><path d="M12 10h.01"/><path d="M8 10h.01"/><path d="M12 14h.01"/><path d="M8 14h.01"/><path d="M8 18h.01"/></svg>}
                    {category.name === 'REASONING' && <Brain className="w-6 h-6 text-white" />}
                    {category.name === 'GENERAL KNOWLEDGE' && <GraduationCap className="w-6 h-6 text-white" />}
                    {category.name === 'GENERAL ENGLISH' && <BookOpen className="w-6 h-6 text-white" />}
                  </div>
                  
                  <div>
                    <h3 className="text-white font-bold text-lg mb-1">{category.name}</h3>
                    <div className="flex items-center text-white/80 text-sm group-hover:text-white transition-colors">
                      <span>Explore</span>
                      <ArrowRight className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
        
        {/* Quiz Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="mb-16"
        >
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1600&q=80')] bg-cover bg-center mix-blend-overlay opacity-20"></div>
            
            <div className="relative p-8 sm:p-12">
              <div className="max-w-3xl">
                <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Test Your Knowledge</h2>
                <p className="text-white/90 mb-6">Challenge yourself with our interactive quizzes across various subjects.</p>
                
                <button 
                  onClick={() => setShowQuiz(true)}
                  className="px-6 py-3 bg-white text-purple-700 rounded-xl hover:bg-white/90 transition-all duration-200 flex items-center gap-2 font-medium shadow-lg"
                >
                  <Sparkles className="h-5 w-5" />
                  Start Quiz Now
                </button>
              </div>
            </div>
            
            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-pink-500/30 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3"></div>
          </div>
        </motion.div>
      </main>

      <MenuBar />
    </div>
  );
}

export default App;