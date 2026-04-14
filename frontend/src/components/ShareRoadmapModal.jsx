import React, { useState, useEffect } from 'react';
import { Share2, X, Search, Check } from 'lucide-react';
import { toast } from 'react-toastify';
import api from '../utils/api';

const ShareRoadmapModal = ({ isOpen, onClose, roadmapId }) => {
  const [friends, setFriends] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchFriends();
      setSelectedFriends([]);
      setSearchQuery('');
    }
  }, [isOpen]);

  const fetchFriends = async () => {
    setIsLoading(true);
    try {
      const { data } = await api.get('/social/friends');
      setFriends(data.friends || []);
    } catch (error) {
      toast.error('Failed to load friends list');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleSelect = (friendId) => {
    setSelectedFriends(prev => 
      prev.includes(friendId) 
        ? prev.filter(id => id !== friendId)
        : [...prev, friendId]
    );
  };

  const handleShare = async () => {
    if (selectedFriends.length === 0) return;
    setIsSending(true);
    try {
      await api.post('/roadmap/share', {
        roadmapId,
        friendIds: selectedFriends
      });
      toast.success(`Roadmap sent to ${selectedFriends.length} friend(s)!`);
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to share roadmap');
    } finally {
      setIsSending(false);
    }
  };

  const filteredFriends = friends.filter(friend => 
    friend.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    friend.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-6 mt-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent/10 text-accent flex items-center justify-center">
              <Share2 size={20} />
            </div>
            <h2 className="text-xl font-extrabold text-dark">Share Roadmap</h2>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 border-b border-gray-100 bg-gray-50/50">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search friends..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-white focus:border-accent focus:ring-4 focus:ring-accent/20 outline-none transition-all text-sm font-medium"
            />
          </div>
        </div>

        {/* Friends List */}
        <div className="flex-1 overflow-y-auto p-2">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3 text-gray-400">
              <div className="w-8 h-8 border-4 border-accent border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm font-bold">Loading friends...</p>
            </div>
          ) : friends.length === 0 ? (
            <div className="text-center py-12 px-4 text-gray-500">
              <p className="font-bold text-lg mb-1">No friends yet</p>
              <p className="text-sm">Head to the Social page to add friends before sharing.</p>
            </div>
          ) : filteredFriends.length === 0 ? (
            <div className="text-center py-8 text-gray-500 text-sm font-bold">
              No matching friends found.
            </div>
          ) : (
            <div className="space-y-1 p-2">
              {filteredFriends.map((friend) => (
                <div 
                  key={friend._id}
                  onClick={() => handleToggleSelect(friend._id)}
                  className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all border-2 ${
                    selectedFriends.includes(friend._id) 
                      ? 'border-accent bg-accent/5 shadow-sm' 
                      : 'border-transparent hover:bg-gray-50'
                  }`}
                >
                  <div className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center text-white font-bold shrink-0">
                    {friend.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm flex font-bold text-dark truncate">
                      {friend.name}
                    </p>
                    <p className="text-xs text-gray-500 truncate">@{friend.username}</p>
                  </div>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors shrink-0 ${
                    selectedFriends.includes(friend._id)
                      ? 'bg-accent border-accent text-white'
                      : 'border-gray-300'
                  }`}>
                    {selectedFriends.includes(friend._id) && <Check size={14} strokeWidth={3} />}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-white">
          <button
            disabled={selectedFriends.length === 0 || isSending}
            onClick={handleShare}
            className="w-full py-3.5 rounded-xl font-bold text-white bg-accent border-b-4 border-accent-dark hover:brightness-110 active:border-b-0 active:translate-y-1 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {isSending ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Sending...
              </>
            ) : (
              <>
                <Share2 size={18} />
                Send to {selectedFriends.length} friend{selectedFriends.length !== 1 && 's'}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShareRoadmapModal;
