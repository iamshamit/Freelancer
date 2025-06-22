import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Archive, MessageSquare, ChevronLeft, Menu, X } from 'lucide-react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import ChatList from '../../components/chat/ChatList';
import ChatBox from '../../components/chat/ChatBox';

const ChatPage = () => {
  const { id: chatId } = useParams();
  const navigate = useNavigate();
  const chatBoxRef = useRef(null); // Add this ref for ChatBox
  
  // Storage keys
  const STORAGE_KEYS = {
    SHOW_ARCHIVED: 'chat_show_archived',
    SIDEBAR_WIDTH: 'chat_sidebar_width',
    SIDEBAR_COLLAPSED: 'chat_sidebar_collapsed'
  };

  // Initialize state from localStorage with fallbacks
  const [showArchived, setShowArchived] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.SHOW_ARCHIVED);
    return stored ? JSON.parse(stored) : false;
  });
  
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.SIDEBAR_WIDTH);
    return stored ? parseInt(stored, 10) : 384;
  });
  
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    const stored = localStorage.getItem(STORAGE_KEYS.SIDEBAR_COLLAPSED);
    return stored ? JSON.parse(stored) : false;
  });

  const [isResizing, setIsResizing] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startWidth, setStartWidth] = useState(384);
  const sidebarRef = useRef(null);
  const resizeHandleRef = useRef(null);

  const MIN_WIDTH = 280;
  const MAX_WIDTH = 600;
  const COLLAPSED_WIDTH = 0;

  // Save to localStorage whenever showArchived changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SHOW_ARCHIVED, JSON.stringify(showArchived));
  }, [showArchived]);

  // Save to localStorage whenever sidebarWidth changes (with debouncing for performance)
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      localStorage.setItem(STORAGE_KEYS.SIDEBAR_WIDTH, sidebarWidth.toString());
    }, 100); // Debounce to avoid excessive writes during resize

    return () => clearTimeout(timeoutId);
  }, [sidebarWidth]);

  // Save to localStorage whenever sidebar collapse state changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SIDEBAR_COLLAPSED, JSON.stringify(isSidebarCollapsed));
  }, [isSidebarCollapsed]);

  // Enhanced tab change handler with persistence
  const handleTabChange = useCallback((archived) => {
    setShowArchived(archived);
  }, []);

  // Smooth mouse move handler with RAF for better performance
  const handleMouseMove = useCallback((e) => {
    if (!isResizing) return;
    
    requestAnimationFrame(() => {
      const deltaX = e.clientX - startX;
      const newWidth = startWidth + deltaX;
      const constrainedWidth = Math.min(Math.max(newWidth, MIN_WIDTH), MAX_WIDTH);
      setSidebarWidth(constrainedWidth);
    });
  }, [isResizing, startX, startWidth]);

  const handleMouseUp = useCallback(() => {
    setIsResizing(false);
    document.body.style.userSelect = '';
    document.body.style.cursor = '';
    document.body.style.pointerEvents = '';
    
    // Remove the overlay
    const overlay = document.getElementById('resize-overlay');
    if (overlay) {
      overlay.remove();
    }
  }, []);

  const handleMouseDown = useCallback((e) => {
    e.preventDefault();
    e.stopPropagation();
    
    setIsResizing(true);
    setStartX(e.clientX);
    setStartWidth(sidebarWidth);
    
    // Prevent text selection and set cursor globally
    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';
    document.body.style.pointerEvents = 'none';
    
    // Create an overlay to capture mouse events everywhere
    const overlay = document.createElement('div');
    overlay.id = 'resize-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      cursor: col-resize;
      z-index: 9999;
      background: transparent;
    `;
    document.body.appendChild(overlay);
  }, [sidebarWidth]);

  // Enhanced collapse/uncollapse handler with persistence
  const handleToggleCollapse = useCallback(() => {
    setIsAnimating(true);
    setIsSidebarCollapsed(!isSidebarCollapsed);
    
    // Reset animation state after animation completes
    setTimeout(() => {
      setIsAnimating(false);
    }, 500); // Match the animation duration
  }, [isSidebarCollapsed]);

  // Effect to handle mouse events during resize
  useEffect(() => {
    if (isResizing) {
      const handleGlobalMouseMove = (e) => {
        e.preventDefault();
        handleMouseMove(e);
      };
      
      const handleGlobalMouseUp = (e) => {
        e.preventDefault();
        handleMouseUp();
      };

      // Add event listeners to document and window for better coverage
      document.addEventListener('mousemove', handleGlobalMouseMove, { passive: false });
      document.addEventListener('mouseup', handleGlobalMouseUp, { passive: false });
      window.addEventListener('mousemove', handleGlobalMouseMove, { passive: false });
      window.addEventListener('mouseup', handleGlobalMouseUp, { passive: false });
      
      return () => {
        document.removeEventListener('mousemove', handleGlobalMouseMove);
        document.removeEventListener('mouseup', handleGlobalMouseUp);
        window.removeEventListener('mousemove', handleGlobalMouseMove);
        window.removeEventListener('mouseup', handleGlobalMouseUp);
      };
    }
  }, [isResizing, handleMouseMove, handleMouseUp]);

  // Handle escape key to cancel resize
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isResizing) {
        setSidebarWidth(startWidth);
        handleMouseUp();
      }
    };

    if (isResizing) {
      document.addEventListener('keydown', handleEscape);
      return () => document.removeEventListener('keydown', handleEscape);
    }
  }, [isResizing, startWidth, handleMouseUp]);

  // Optional: Clear storage function (you can call this if needed)
  const clearStoredPreferences = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.SHOW_ARCHIVED);
    localStorage.removeItem(STORAGE_KEYS.SIDEBAR_WIDTH);
    localStorage.removeItem(STORAGE_KEYS.SIDEBAR_COLLAPSED);
    
    // Reset to defaults
    setShowArchived(false);
    setSidebarWidth(384);
    setIsSidebarCollapsed(false);
  }, []);

  return (
    <DashboardLayout>
      <div className="h-[calc(100vh-64px)] flex relative bg-gray-900 overflow-hidden">
        {/* Chat List Sidebar - Resizable with smooth collapse */}
        <motion.div
          ref={sidebarRef}
          initial={{ x: -20, opacity: 0 }}
          animate={{ 
            x: 0, 
            opacity: 1,
            width: isSidebarCollapsed ? COLLAPSED_WIDTH : sidebarWidth,
            minWidth: isSidebarCollapsed ? COLLAPSED_WIDTH : sidebarWidth,
            maxWidth: isSidebarCollapsed ? COLLAPSED_WIDTH : sidebarWidth,
          }}
          transition={{ 
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { type: "spring", stiffness: 300, damping: 30 },
            width: { 
              type: "spring", 
              stiffness: 400, 
              damping: 40,
              duration: 0.5
            },
            minWidth: { 
              type: "spring", 
              stiffness: 400, 
              damping: 40,
              duration: 0.5
            },
            maxWidth: { 
              type: "spring", 
              stiffness: 400, 
              damping: 40,
              duration: 0.5
            }
          }}
          style={{ 
            flexShrink: 0,
            // Disable transitions during manual resize
            transition: isResizing ? 'none' : undefined
          }}
          className={`${
            chatId ? 'hidden md:block' : 'block'
          } bg-gray-800 border-r border-gray-700 h-full relative overflow-hidden`}
        >
          {/* Animated content container */}
          <AnimatePresence mode="wait">
            {!isSidebarCollapsed && (
              <motion.div
                key="sidebar-content"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ 
                  duration: 0.3,
                  ease: "easeInOut",
                  delay: isSidebarCollapsed ? 0 : 0.1
                }}
                className="flex flex-col h-full w-full"
              >
                {/* Header with Tab Navigation */}
                <div className="flex-shrink-0 border-b border-gray-700">
                  <div className="p-4">
                    <motion.h2 
                      className="text-xl font-semibold text-white mb-4"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, duration: 0.3 }}
                    >
                      Messages
                    </motion.h2>
                    
                    {/* Tab Navigation */}
                    <motion.div 
                      className="flex p-1 bg-gray-900 rounded-lg"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.25, duration: 0.3 }}
                    >
                      <button
                        onClick={() => handleTabChange(false)}
                        className={`flex-1 flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                          !showArchived 
                            ? 'bg-orange-500 text-white shadow-lg' 
                            : 'text-gray-400 hover:text-white hover:bg-gray-800'
                        }`}
                      >
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Active
                      </button>
                      <button
                        onClick={() => handleTabChange(true)}
                        className={`flex-1 flex items-center justify-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                          showArchived 
                            ? 'bg-orange-500 text-white shadow-lg' 
                            : 'text-gray-400 hover:text-white hover:bg-gray-800'
                        }`}
                      >
                        <Archive className="w-4 h-4 mr-2" />
                        Archived
                      </button>
                    </motion.div>
                  </div>
                </div>
                
                {/* Chat List - Scrollable */}
                <motion.div 
                  className="flex-1 overflow-y-auto"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.3 }}
                >
                  <ChatList showArchived={showArchived} />
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Enhanced Resize Handle - only show when not collapsed */}
          <AnimatePresence>
            {!isSidebarCollapsed && (
              <motion.div
                ref={resizeHandleRef}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute top-0 right-0 w-1 h-full cursor-col-resize z-20 group"
                onMouseDown={handleMouseDown}
                style={{
                  background: isResizing 
                    ? 'linear-gradient(90deg, transparent, #f97316, transparent)' 
                    : 'transparent'
                }}
              >
                {/* Invisible wider hit area for easier grabbing */}
                <div className="absolute -left-2 -right-2 top-0 bottom-0" />
                
                {/* Visual indicator */}
                <div 
                  className={`w-full h-full transition-all duration-200 ${
                    isResizing 
                      ? 'bg-orange-500 shadow-lg shadow-orange-500/50' 
                      : 'bg-transparent group-hover:bg-orange-500/30'
                  }`}
                />
                
                {/* Resize dots indicator */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <div className="flex flex-col space-y-1">
                    <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                    <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                    <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Collapse/Expand Button - Always positioned at the right edge of sidebar */}
        <motion.button
          onClick={handleToggleCollapse}
          className="hidden md:flex absolute top-1/2 z-30 p-2 bg-gray-800 rounded-r-lg border border-l-0 border-gray-700 hover:bg-gray-700 shadow-lg hover:shadow-xl items-center justify-center"
          animate={{ 
            left: isSidebarCollapsed ? COLLAPSED_WIDTH : sidebarWidth,
          }}
          transition={{ 
            left: { 
              type: "spring", 
              stiffness: 300, 
              damping: 30,
              mass: 0.8
            }
          }}
          style={{ 
            transform: 'translateY(-50%)',
            transition: isResizing ? 'none' : undefined
          }}
        >
          <motion.div
            animate={{ 
              rotate: isSidebarCollapsed ? 0 : 180
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ 
              type: "spring",
              stiffness: 400,
              damping: 25
            }}
            className="flex items-center justify-center"
          >
            {isSidebarCollapsed ? (
              <Menu className="w-4 h-4 text-gray-400" />
            ) : (
              <ChevronLeft className="w-4 h-4 text-gray-400" />
            )}
          </motion.div>
        </motion.button>
            
        {/* Chat Box - Full height with smooth expansion */}
        <motion.div 
          className={`${
            chatId ? 'flex' : 'hidden md:flex items-center justify-center'
          } flex-1 bg-gray-900 relative min-w-0`}
          animate={{
            marginLeft: 0 // Ensure no margin conflicts
          }}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 40,
            duration: 0.5
          }}
        >
          {chatId ? (
            <motion.div
              key={chatId}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="w-full h-full"
            >
              <ChatBox 
                ref={chatBoxRef} // Pass the ref here
                chatId={chatId} 
                isFullPage={true} 
              />
            </motion.div>
          ) : (
            <motion.div 
              className="h-full flex items-center justify-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
            >
              <div className="text-center">
                <div className="relative">
                  <motion.div 
                    className="absolute inset-0 flex items-center justify-center"
                    animate={{ 
                      scale: [1, 1.1, 1],
                      opacity: [0.3, 0.5, 0.3]
                    }}
                    transition={{ 
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                  >
                    <div className="w-32 h-32 bg-orange-500/20 rounded-full blur-3xl"></div>
                  </motion.div>
                  <MessageSquare className="w-16 h-16 text-gray-600 mx-auto mb-4 relative" />
                </div>
                <h3 className="text-lg font-medium text-white mb-2">
                  Select a conversation
                </h3>
                <p className="text-gray-400">
                  Choose a chat from the list to start messaging
                </p>
              </div>
            </motion.div>
          )}
        </motion.div>
        
        {/* Mobile Back Button */}
        {chatId && (
          <motion.button
            onClick={() => navigate('/messages')}
            className="md:hidden fixed top-20 left-4 z-20 p-2 bg-gray-800 rounded-lg shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </motion.button>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ChatPage;