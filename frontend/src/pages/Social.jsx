import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import api from '../utils/api';
import Navbar from '../components/Navbar';
import { Flame, UserPlus, Check, X, Users, Handshake, Search, Trophy, ArrowRight } from 'lucide-react';

const Social = () => {
  const { user } = useAuth();
  const [friends, setFriends] = useState([]);
  const [pendingRequests, setPendingRequests] = useState([]);
  const [searchUsername, setSearchUsername] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [processingId, setProcessingId] = useState(null);

  const fetchFriends = async () => {
    try {
      const { data } = await api.get('/social/friends');
      setFriends(data.friends || []);
      setPendingRequests(data.pendingRequests || []);
    } catch (err) {
      console.error('Failed to fetch friends:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFriends();
  }, []);

  const handleSendRequest = async (e) => {
    e.preventDefault();
    if (!searchUsername.trim()) return;
    setIsSending(true);
    try {
      const { data } = await api.post('/social/request', {
        username: searchUsername.trim().toLowerCase(),
      });
      toast.success(data.message);
      setSearchUsername('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send friend request');
    } finally {
      setIsSending(false);
    }
  };

  const handleAccept = async (requesterId) => {
    setProcessingId(requesterId);
    try {
      const { data } = await api.post('/social/accept', { requesterId });
      toast.success(data.message);
      await fetchFriends();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to accept request');
    } finally {
      setProcessingId(null);
    }
  };

  const handleDecline = async (requesterId) => {
    setProcessingId(requesterId);
    try {
      await api.post('/social/decline', { requesterId });
      toast.info('Request declined');
      await fetchFriends();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to decline request');
    } finally {
      setProcessingId(null);
    }
  };

  const handleSendStreakRequest = async (friendId) => {
    setProcessingId(friendId);
    try {
      const { data } = await api.post('/social/streak/request', { friendId });
      toast.success(data.message);
      await fetchFriends();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send streak request');
    } finally {
      setProcessingId(null);
    }
  };

  const handleAcceptStreakRequest = async (friendId) => {
    setProcessingId(friendId);
    try {
      const { data } = await api.post('/social/streak/accept', { friendId });
      toast.success(data.message);
      await fetchFriends();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to accept streak request');
    } finally {
      setProcessingId(null);
    }
  };

  const isActiveToday = (lastActiveDate) => {
    if (!lastActiveDate) return false;
    return new Date(lastActiveDate).toISOString().slice(0, 10) === new Date().toISOString().slice(0, 10);
  };

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-dark flex items-center gap-3">
            <Users className="text-primary" size={36} />
            Friends & Streaks
          </h1>
          <p className="text-dark-light mt-2 text-lg">
            Learn together, grow together. Keep those streaks alive! 🔥
          </p>
        </div>

        {/* Your Streak Card */}
        <div className="mb-8 rounded-2xl bg-gradient-to-r from-orange-50 via-amber-50 to-yellow-50 border-2 border-orange-200 p-6 shadow-md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center shadow-lg ${
                isActiveToday(user?.lastActiveDate)
                  ? 'bg-gradient-to-br from-orange-400 to-amber-500'
                  : 'bg-gray-200'
              }`}>
                <Flame
                  size={32}
                  className="text-white"
                  fill="currentColor"
                />
              </div>
              <div>
                <p className="text-sm font-bold text-dark-light uppercase tracking-wider">Your Streak</p>
                <p className="text-4xl font-black text-dark">{user?.personalStreak || 0} <span className="text-lg font-bold text-dark-light">days</span></p>
              </div>
            </div>
            <div className={`px-4 py-2 rounded-full text-sm font-bold ${
              isActiveToday(user?.lastActiveDate)
                ? 'bg-green-100 text-green-700 border border-green-200'
                : 'bg-gray-100 text-gray-500 border border-gray-200'
            }`}>
              {isActiveToday(user?.lastActiveDate) ? '✅ Active today' : '💤 Not active yet'}
            </div>
          </div>
        </div>

        {/* Add Friend Section */}
        <div className="mb-8 rounded-2xl bg-white border-2 border-surface-dark p-6 shadow-md">
          <h2 className="text-xl font-extrabold text-dark mb-4 flex items-center gap-2">
            <UserPlus size={22} className="text-primary" />
            Add a Friend
          </h2>
          <form onSubmit={handleSendRequest} className="flex gap-3">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-dark-light/40" />
              <input
                id="search-username"
                type="text"
                value={searchUsername}
                onChange={(e) => setSearchUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                className="w-full pl-11 pr-4 py-3 rounded-xl border-2 border-surface-dark bg-surface focus:border-primary focus:ring-4 focus:ring-primary/20 outline-none transition-all duration-200 text-dark placeholder-dark-light/50"
                placeholder="Enter username..."
                maxLength={20}
              />
            </div>
            <button
              type="submit"
              disabled={isSending || !searchUsername.trim()}
              className="px-6 py-3 rounded-xl font-bold text-white gradient-bg hover:opacity-90 active:scale-[0.98] transition-all duration-200 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center gap-2"
            >
              {isSending ? (
                <svg className="w-5 h-5 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <UserPlus size={18} />
              )}
              Send
            </button>
          </form>
          <p className="text-xs text-dark-light mt-2">Your username: <span className="font-bold text-primary">@{user?.username || 'not set'}</span></p>
        </div>

        {/* Pending Requests */}
        {pendingRequests.length > 0 && (
          <div className="mb-8 rounded-2xl bg-white border-2 border-secondary/30 p-6 shadow-md">
            <h2 className="text-xl font-extrabold text-dark mb-4 flex items-center gap-2">
              <span className="text-2xl">📬</span>
              Pending Requests
              <span className="ml-2 px-2.5 py-0.5 rounded-full bg-secondary text-white text-xs font-black">
                {pendingRequests.length}
              </span>
            </h2>
            <div className="space-y-3">
              {pendingRequests.map((req) => (
                <div
                  key={req._id}
                  className="flex items-center justify-between p-4 rounded-xl bg-surface border border-surface-dark hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full gradient-bg flex items-center justify-center text-white text-sm font-bold">
                      {req.name?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-dark">{req.name}</p>
                      <p className="text-xs text-dark-light">@{req.username}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      id={`accept-${req._id}`}
                      onClick={() => handleAccept(req._id)}
                      disabled={processingId === req._id}
                      className="px-4 py-2 rounded-xl font-bold text-white bg-success border-b-4 border-success-dark hover:brightness-110 active:border-b-0 active:translate-y-1 transition-all duration-100 cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                    >
                      <Check size={16} />
                      Accept
                    </button>
                    <button
                      id={`decline-${req._id}`}
                      onClick={() => handleDecline(req._id)}
                      disabled={processingId === req._id}
                      className="px-4 py-2 rounded-xl font-bold text-dark-light border-2 border-surface-dark hover:bg-surface-dark/50 transition-all duration-200 cursor-pointer disabled:opacity-50 flex items-center gap-1.5"
                    >
                      <X size={16} />
                      Decline
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Friends Leaderboard */}
        <div className="rounded-2xl bg-white border-2 border-surface-dark p-6 shadow-md">
          <h2 className="text-xl font-extrabold text-dark mb-6 flex items-center gap-2">
            <Trophy size={22} className="text-secondary" />
            Friends Leaderboard
          </h2>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                <p className="text-dark-light font-medium">Loading friends...</p>
              </div>
            </div>
          ) : friends.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-primary/10 flex items-center justify-center animate-float">
                <Users size={40} className="text-primary/60" />
              </div>
              <h3 className="text-lg font-bold text-dark mb-1">No friends yet</h3>
              <p className="text-dark-light text-sm max-w-sm mx-auto">
                Add friends using their username above and start building streaks together!
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {friends.map((friend, index) => (
                <div
                  key={friend._id}
                  className="flex items-center justify-between p-4 rounded-2xl bg-surface border-2 border-surface-dark hover:border-primary/30 hover:shadow-lg transition-all duration-300 group"
                >
                  <div className="flex items-center gap-4">
                    {/* Rank Badge */}
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-black ${
                      index === 0
                        ? 'bg-yellow-100 text-yellow-700 border-2 border-yellow-300'
                        : index === 1
                        ? 'bg-gray-100 text-gray-600 border-2 border-gray-300'
                        : index === 2
                        ? 'bg-orange-100 text-orange-700 border-2 border-orange-300'
                        : 'bg-surface-dark text-dark-light'
                    }`}>
                      {index + 1}
                    </div>

                    {/* Avatar */}
                    <div className="w-12 h-12 rounded-full gradient-bg flex items-center justify-center text-white font-bold text-lg group-hover:scale-110 transition-transform duration-300">
                      {friend.name?.charAt(0).toUpperCase()}
                    </div>

                    {/* Info */}
                    <div>
                      <p className="font-bold text-dark">{friend.name}</p>
                      <p className="text-xs text-dark-light">@{friend.username}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {/* Personal Streak */}
                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-50 border border-orange-200">
                      <Flame
                        size={16}
                        className={isActiveToday(friend.lastActiveDate) ? 'text-orange-500' : 'text-gray-400'}
                        fill={isActiveToday(friend.lastActiveDate) ? 'currentColor' : 'none'}
                      />
                      <span className={`text-sm font-extrabold ${
                        isActiveToday(friend.lastActiveDate) ? 'text-orange-600' : 'text-gray-400'
                      }`}>
                        {friend.personalStreak || 0}
                      </span>
                    </div>

                    {/* Shared Streak States */}
                    <div className="flex items-center gap-2">
                      {friend.streakStatus === 'active' && (
                        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-purple-50 border border-purple-200" title="Active shared streak">
                          <Handshake size={16} className="text-accent" />
                          <span className="text-sm font-extrabold text-accent">
                            {friend.sharedStreakCount || 0}
                          </span>
                        </div>
                      )}
                      
                      {friend.streakStatus === 'inactive' && (
                        <button
                          onClick={() => handleSendStreakRequest(friend._id)}
                          disabled={processingId === friend._id}
                          className="px-3 py-1.5 rounded-full text-xs font-bold text-accent bg-accent/10 border border-accent/20 hover:bg-accent/20 transition-all duration-200 disabled:opacity-50"
                        >
                          Start Streak 🔥
                        </button>
                      )}

                      {friend.streakStatus === 'pending_sent' && (
                        <span className="px-3 py-1.5 rounded-full text-xs font-bold text-gray-500 bg-gray-100 border border-gray-200">
                          Streak Requested
                        </span>
                      )}

                      {friend.streakStatus === 'pending_received' && (
                        <button
                          onClick={() => handleAcceptStreakRequest(friend._id)}
                          disabled={processingId === friend._id}
                          className="px-3 py-1.5 rounded-full text-xs font-bold text-white bg-accent hover:bg-accent-dark transition-all duration-200 disabled:opacity-50 animate-pulse-soft"
                        >
                          Accept Streak!
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Social;
