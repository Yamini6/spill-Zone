import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Animated,
  Dimensions,
  Platform,
  Modal,
  KeyboardAvoidingView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Send, Volume2, Clock, Users, ArrowLeft, Smile, Mic, Lock, Shield, TriangleAlert as AlertTriangle } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

interface ChatMessage {
  id: string;
  text: string;
  isBot: boolean;
  isUser: boolean;
  author?: string;
  timestamp: Date;
  hasVoice?: boolean;
  isPremiumVoice?: boolean;
  reactions?: { emoji: string; count: number }[];
}

interface MoodRoom {
  id: string;
  mood: string;
  emoji: string;
  color: readonly [string, string];
  backgroundColor: string;
  userCount: number;
  description: string;
  isActive?: boolean;
  isLocked?: boolean;
}

interface Poll {
  id: string;
  question: string;
  options: { label: string; votes: number; percentage: number; isSelected?: boolean }[];
  totalVotes: number;
  timestamp: Date;
}

interface MoodLockData {
  selectedMoodId: string;
  lockTime: number;
  expiresAt: number;
}

const MOOD_ROOMS: MoodRoom[] = [
  {
    id: 'sad',
    mood: 'Sad',
    emoji: '😢',
    color: ['#6366f1', '#8b5cf6'],
    backgroundColor: '#f0f4ff',
    userCount: 24,
    description: 'Share your feelings, support each other',
  },
  {
    id: 'cringe',
    mood: 'Cringe',
    emoji: '🔥',
    color: ['#f97316', '#fb923c'],
    backgroundColor: '#fff7ed',
    userCount: 18,
    description: 'Embrace the awkward moments',
  },
  {
    id: 'lonely',
    mood: 'Lonely',
    emoji: '💔',
    color: ['#ec4899', '#f472b6'],
    backgroundColor: '#fdf2f8',
    userCount: 12,
    description: 'Connect with fellow souls',
  },
  {
    id: 'chaotic',
    mood: 'Chaotic',
    emoji: '🤪',
    color: ['#10b981', '#34d399'],
    backgroundColor: '#f0fdf4',
    userCount: 31,
    description: 'Unleash the chaos within',
  },
];

const SAMPLE_MESSAGES: ChatMessage[] = [
  {
    id: '1',
    text: "Hey everyone! Welcome to the room. Feel free to share what's on your mind today. Sometimes talking about it helps. 💙",
    isBot: true,
    isUser: false,
    author: 'AI Assistant',
    timestamp: new Date(Date.now() - 25 * 60 * 1000),
    hasVoice: true,
    reactions: [
      { emoji: '👍', count: 12 },
      { emoji: '💙', count: 8 },
    ],
  },
  {
    id: '2',
    text: "Failed my exam today after studying for weeks. Feeling like all my effort was for nothing. 😔",
    isBot: false,
    isUser: false,
    author: 'Emma Thompson',
    timestamp: new Date(Date.now() - 23 * 60 * 1000),
    reactions: [
      { emoji: '🫂', count: 5 },
      { emoji: '💪', count: 3 },
    ],
  },
  {
    id: '3',
    text: "I'm sorry about your exam, Emma. That really sucks after putting in so much effort. Remember that one exam doesn't define your worth or intelligence. Would you like some advice on how to bounce back or just need a space to vent?",
    isBot: true,
    isUser: false,
    author: 'AI Assistant',
    timestamp: new Date(Date.now() - 22 * 60 * 1000),
    hasVoice: true,
    reactions: [
      { emoji: '❤️', count: 7 },
    ],
  },
];

const SAMPLE_POLL: Poll = {
  id: 'poll1',
  question: 'When you\'re feeling down, what helps you the most?',
  options: [
    { label: 'Talking to friends', votes: 42, percentage: 42, isSelected: true },
    { label: 'Alone time with music', votes: 28, percentage: 28 },
    { label: 'Physical activity', votes: 18, percentage: 18 },
    { label: 'Watching comfort shows', votes: 12, percentage: 12 },
  ],
  totalVotes: 100,
  timestamp: new Date(Date.now() - 17 * 60 * 1000),
};

export default function ChatTab() {
  const [showMoodSelector, setShowMoodSelector] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<MoodRoom | null>(null);
  const [moodLockData, setMoodLockData] = useState<MoodLockData | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [poll, setPoll] = useState<Poll>(SAMPLE_POLL);
  const [message, setMessage] = useState('');
  const [showTyping, setShowTyping] = useState(false);
  const [timeLeft, setTimeLeft] = useState('');
  const [sessionStartTime, setSessionStartTime] = useState<number | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  
  // Track if component is mounted to prevent state updates on unmounted component
  const isMountedRef = useRef(true);
  
  // Individual animations for each mood choice
  const moodAnimations = useRef(
    MOOD_ROOMS.reduce((acc, room) => {
      acc[room.id] = {
        scale: new Animated.Value(1),
        glow: new Animated.Value(0),
      };
      return acc;
    }, {} as Record<string, { scale: Animated.Value; glow: Animated.Value }>)
  ).current;

  useEffect(() => {
    isMountedRef.current = true;
    
    // Check for existing mood lock on component mount
    checkMoodLock();
    
    // Pulse animation for mood indicator
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    );
    pulseAnimation.start();

    // Update time left every second for real-time countdown
    const timer = setInterval(() => {
      if (isMountedRef.current) {
        updateTimeLeft();
      }
    }, 1000);

    return () => {
      isMountedRef.current = false;
      pulseAnimation.stop();
      clearInterval(timer);
    };
  }, []);

  useEffect(() => {
    if (showMoodSelector) {
      // Animate modal appearance
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();

      // Stagger mood choice animations
      const staggerDelay = 100;
      MOOD_ROOMS.forEach((room, index) => {
        const timeout = setTimeout(() => {
          if (isMountedRef.current) {
            Animated.spring(moodAnimations[room.id].scale, {
              toValue: 1,
              tension: 100,
              friction: 8,
              useNativeDriver: true,
            }).start();
          }
        }, index * staggerDelay);

        // Store timeout for cleanup
        return () => clearTimeout(timeout);
      });
    } else {
      // Animate modal disappearance
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Reset mood animations
      MOOD_ROOMS.forEach((room) => {
        moodAnimations[room.id].scale.setValue(0.8);
        moodAnimations[room.id].glow.setValue(0);
      });
    }
  }, [showMoodSelector]);

  const checkMoodLock = () => {
    // In a real app, this would check AsyncStorage or a backend
    // For demo, we'll simulate checking localStorage-like storage
    const mockStoredData = null; // Replace with actual storage check
    
    if (mockStoredData) {
      const lockData: MoodLockData = mockStoredData;
      const now = Date.now();
      
      if (now < lockData.expiresAt) {
        // Still locked
        if (isMountedRef.current) {
          setMoodLockData(lockData);
          setSessionStartTime(lockData.lockTime);
          const room = MOOD_ROOMS.find(r => r.id === lockData.selectedMoodId);
          if (room) {
            setSelectedRoom(room);
            loadRoomMessages(room);
          }
          updateTimeLeft();
        }
      } else {
        // Lock expired, clear data
        clearMoodLock();
        if (isMountedRef.current) {
          setShowMoodSelector(true);
        }
      }
    } else {
      // No existing lock, show mood selector
      if (isMountedRef.current) {
        setShowMoodSelector(true);
      }
    }
  };

  const updateTimeLeft = () => {
    if (moodLockData && sessionStartTime && isMountedRef.current) {
      const now = Date.now();
      const sessionDuration = now - sessionStartTime;
      const remaining = moodLockData.expiresAt - now;
      
      if (remaining <= 0) {
        clearMoodLock();
        setShowMoodSelector(true);
        return;
      }
      
      // Calculate session time (how long they've been in the room)
      const sessionHours = Math.floor(sessionDuration / (1000 * 60 * 60));
      const sessionMinutes = Math.floor((sessionDuration % (1000 * 60 * 60)) / (1000 * 60));
      const sessionSeconds = Math.floor((sessionDuration % (1000 * 60)) / 1000);
      
      // Calculate remaining time until room expires
      const remainingHours = Math.floor(remaining / (1000 * 60 * 60));
      const remainingMinutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
      const remainingSeconds = Math.floor((remaining % (1000 * 60)) / 1000);
      
      const pad = (num: number) => num.toString().padStart(2, '0');
      
      // Show session time in format: "In room: 00:05:23 | Expires: 23:54:37"
      const sessionTime = `${pad(sessionHours)}:${pad(sessionMinutes)}:${pad(sessionSeconds)}`;
      const expiryTime = `${pad(remainingHours)}:${pad(remainingMinutes)}:${pad(remainingSeconds)}`;
      
      setTimeLeft(`In room: ${sessionTime} | ${expiryTime} left`);
    }
  };

  const clearMoodLock = () => {
    if (isMountedRef.current) {
      setMoodLockData(null);
      setSelectedRoom(null);
      setMessages([]);
      setTimeLeft('');
      setSessionStartTime(null);
    }
    // In a real app, clear from AsyncStorage
  };

  const handleMoodPress = (room: MoodRoom) => {
    // Animate press feedback
    Animated.parallel([
      Animated.sequence([
        Animated.timing(moodAnimations[room.id].scale, {
          toValue: 0.95,
          duration: 100,
          useNativeDriver: true,
        }),
        Animated.spring(moodAnimations[room.id].scale, {
          toValue: 1.05,
          tension: 300,
          friction: 10,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(moodAnimations[room.id].glow, {
        toValue: 1,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start(() => {
      // Complete selection after animation
      const timeout = setTimeout(() => {
        if (isMountedRef.current) {
          selectMood(room);
        }
      }, 300);
      
      return () => clearTimeout(timeout);
    });
  };

  const selectMood = (room: MoodRoom) => {
    if (!isMountedRef.current) return;
    
    const now = Date.now();
    const lockData: MoodLockData = {
      selectedMoodId: room.id,
      lockTime: now,
      expiresAt: now + (24 * 60 * 60 * 1000), // 24 hours
    };
    
    setMoodLockData(lockData);
    setSessionStartTime(now);
    setSelectedRoom(room);
    setShowMoodSelector(false);
    loadRoomMessages(room);
    updateTimeLeft();
    
    // In a real app, save to AsyncStorage
    // AsyncStorage.setItem('moodLockData', JSON.stringify(lockData));
  };

  const loadRoomMessages = (room: MoodRoom) => {
    if (!isMountedRef.current) return;
    
    // Load room-specific messages
    const roomMessages = SAMPLE_MESSAGES.map(msg => ({
      ...msg,
      text: msg.isBot ? 
        `Hey everyone! Welcome to the ${room.mood} room. ${room.description}, and remember to roast responsibly. ✨` :
        msg.text
    }));
    setMessages(roomMessages);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleSendMessage = () => {
    if (!message.trim() || !isMountedRef.current) return;

    const newMessage: ChatMessage = {
      id: Date.now().toString(),
      text: message,
      isBot: false,
      isUser: true,
      timestamp: new Date(),
      reactions: [],
    };

    setMessages([...messages, newMessage]);
    setMessage('');
    
    // Scroll to bottom
    const scrollTimeout = setTimeout(() => {
      if (isMountedRef.current) {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }
    }, 100);

    // Show typing indicator and simulate AI response
    if (message.toLowerCase().includes('/roastme') || message.toLowerCase().includes('/vent')) {
      if (isMountedRef.current) {
        setShowTyping(true);
      }
      
      const typingTimeout = setTimeout(() => {
        if (isMountedRef.current) {
          setShowTyping(false);
          const aiResponse: ChatMessage = {
            id: (Date.now() + 1).toString(),
            text: message.toLowerCase().includes('/roastme') 
              ? "Oh honey, you came to the right place for a reality check! 💀 But first, tell us what happened so we can roast it properly."
              : "I hear you. This is a safe space to let it all out. We're here to listen and support you through whatever you're going through. 💙",
            isBot: true,
            isUser: false,
            author: 'AI Assistant',
            timestamp: new Date(),
            hasVoice: true,
            reactions: [],
          };
          setMessages(prev => [...prev, aiResponse]);
          
          const scrollTimeout2 = setTimeout(() => {
            if (isMountedRef.current) {
              scrollViewRef.current?.scrollToEnd({ animated: true });
            }
          }, 100);
        }
      }, 2000);
    }
  };

  const handleReaction = (messageId: string, emoji: string) => {
    if (!isMountedRef.current) return;
    
    setMessages(messages.map(msg => {
      if (msg.id === messageId) {
        const existingReaction = msg.reactions?.find(r => r.emoji === emoji);
        if (existingReaction) {
          return {
            ...msg,
            reactions: msg.reactions?.map(r => 
              r.emoji === emoji ? { ...r, count: r.count + 1 } : r
            ),
          };
        } else {
          return {
            ...msg,
            reactions: [...(msg.reactions || []), { emoji, count: 1 }],
          };
        }
      }
      return msg;
    }));
  };

  const handlePollVote = (optionIndex: number) => {
    if (!isMountedRef.current) return;
    
    const newOptions = poll.options.map((option, index) => ({
      ...option,
      isSelected: index === optionIndex,
      votes: index === optionIndex ? option.votes + 1 : option.votes,
    }));
    
    const newTotal = poll.totalVotes + 1;
    newOptions.forEach(option => {
      option.percentage = Math.round((option.votes / newTotal) * 100);
    });

    setPoll({
      ...poll,
      options: newOptions,
      totalVotes: newTotal,
    });
  };

  const renderMoodSelector = () => (
    <Modal
      visible={showMoodSelector}
      transparent
      animationType="none"
      onRequestClose={() => {}}
    >
      <Animated.View 
        style={[
          styles.modalOverlay,
          { opacity: fadeAnim }
        ]}
      >
        <Animated.View 
          style={[
            styles.modalContent,
            { transform: [{ scale: scaleAnim }] }
          ]}
        >
          <ScrollView contentContainerStyle={styles.modalScrollContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.modalTitle}>What's your mood today?</Text>
            <Text style={styles.modalSubtitle}>
              Choose wisely - you'll be locked in this room for 24 hours!
            </Text>

            <View style={styles.moodGrid}>
              {MOOD_ROOMS.map((room) => (
                <Animated.View
                  key={room.id}
                  style={[
                    styles.moodChoiceContainer,
                    {
                      transform: [{ scale: moodAnimations[room.id].scale }],
                    }
                  ]}
                >
                  <TouchableOpacity
                    style={[
                      styles.moodChoice,
                      { backgroundColor: room.backgroundColor }
                    ]}
                    onPress={() => handleMoodPress(room)}
                    activeOpacity={0.8}
                  >
                    <Animated.View
                      style={[
                        styles.moodChoiceGlow,
                        {
                          backgroundColor: room.color[0],
                          opacity: moodAnimations[room.id].glow,
                        }
                      ]}
                    />
                    <Text style={styles.moodChoiceEmoji}>{room.emoji}</Text>
                    <Text style={[styles.moodChoiceText, { color: room.color[0] }]}>
                      {room.mood}
                    </Text>
                    <Text style={[styles.moodChoiceCount, { color: room.color[0] }]}>
                      {room.userCount} online
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              ))}
            </View>

            <View style={styles.privacySection}>
              <View style={styles.privacyHeader}>
                <Shield size={16} color="#6366f1" />
                <Text style={styles.privacyTitle}>Privacy First</Text>
              </View>
              <Text style={styles.privacyText}>
                • All messages auto-delete after 24 hours{'\n'}
                • No usernames — just anonymous vibes{'\n'}
                • AI drops support messages & polls hourly{'\n'}
                • Premium: Voice replies & mood history
              </Text>
            </View>

            <View style={styles.rulesSection}>
              <View style={styles.rulesHeader}>
                <AlertTriangle size={16} color="#f97316" />
                <Text style={styles.rulesTitle}>Community Rules</Text>
              </View>
              <Text style={styles.rulesText}>
                • No hate, nudity, or abuse — get flagged & lose points{'\n'}
                • Respect every emotion — this is a safe space for all
              </Text>
            </View>
          </ScrollView>
        </Animated.View>
      </Animated.View>
    </Modal>
  );

  if (!selectedRoom) {
    return (
      <SafeAreaView style={styles.container}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"} 
          style={styles.container}
          keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
        >
          {renderMoodSelector()}
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading...</Text>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"} 
        style={styles.container}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
      >
        {renderMoodSelector()}
        
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <Text style={styles.headerTitle}>Chatroom</Text>
            <View style={styles.headerBadges}>
              <LinearGradient
                colors={selectedRoom.color}
                style={styles.moodBadge}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
              >
                <Animated.Text 
                  style={[
                    styles.moodEmoji,
                    { transform: [{ scale: pulseAnim }] }
                  ]}
                >
                  {selectedRoom.emoji}
                </Animated.Text>
                <Text style={styles.moodText}>{selectedRoom.mood} Vibes</Text>
              </LinearGradient>
              <View style={styles.timeBadge}>
                <Clock size={12} color="#8E8E93" />
                <Text style={styles.timeText}>{timeLeft}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Room Selector - Locked State */}
        <View style={styles.roomSelector}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.roomScrollContent}
          >
            {MOOD_ROOMS.map((room) => (
              <View
                key={room.id}
                style={[
                  styles.moodCard,
                  { backgroundColor: room.backgroundColor },
                  room.id === selectedRoom.id && styles.activeMoodCard,
                  room.id !== selectedRoom.id && styles.lockedMoodCard,
                ]}
              >
                <Text 
                  style={[
                    styles.moodCardEmoji,
                    room.id !== selectedRoom.id && styles.lockedEmoji,
                  ]}
                >
                  {room.emoji}
                </Text>
                <Text style={[
                  styles.moodCardText, 
                  { color: room.id === selectedRoom.id ? room.color[0] : '#8E8E93' }
                ]}>
                  {room.mood}
                </Text>
                {room.id === selectedRoom.id ? (
                  <Text style={[styles.moodCardCount, { color: room.color[0] }]}>
                    {room.userCount} online
                  </Text>
                ) : (
                  <View style={styles.lockBadge}>
                    <Lock size={10} color="#8E8E93" />
                  </View>
                )}
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Welcome Message */}
        <View style={styles.welcomeContainer}>
          <LinearGradient
            colors={[selectedRoom.backgroundColor, '#f8fafc']}
            style={styles.welcomeCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={[styles.welcomeText, { color: selectedRoom.color[0] }]}>
              Welcome to the {selectedRoom.mood} room. {selectedRoom.description}, and remember to roast responsibly. ✨
            </Text>
          </LinearGradient>
        </View>

        {/* Chat Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map((msg) => (
            <View
              key={msg.id}
              style={[
                styles.messageContainer,
                msg.isUser ? styles.userMessageContainer : styles.otherMessageContainer,
              ]}
            >
              <View
                style={[
                  styles.messageBubble,
                  msg.isBot && styles.botBubble,
                  msg.isUser && styles.userBubble,
                  !msg.isBot && !msg.isUser && styles.otherBubble,
                ]}
              >
                {!msg.isUser && (
                  <View style={styles.messageHeader}>
                    <Text style={[styles.messageAuthor, msg.isBot && styles.botAuthor]}>
                      {msg.author}
                    </Text>
                    <Text style={styles.messageTime}>{formatTime(msg.timestamp)}</Text>
                    {msg.isBot && msg.hasVoice && (
                      <Text style={styles.premiumBadge}>Premium</Text>
                    )}
                  </View>
                )}
                
                {msg.isUser && (
                  <View style={styles.userMessageHeader}>
                    <Text style={styles.userMessageTime}>{formatTime(msg.timestamp)}</Text>
                    <Text style={styles.userMessageAuthor}>You</Text>
                  </View>
                )}

                <Text style={[
                  styles.messageText,
                  msg.isBot && styles.botMessageText,
                  msg.isUser && styles.userMessageText,
                ]}>
                  {msg.text}
                </Text>

                {msg.hasVoice && (
                  <View style={styles.voiceContainer}>
                    <TouchableOpacity style={[styles.voiceButton, msg.isBot && styles.botVoiceButton]}>
                      <Volume2 size={16} color={msg.isBot ? selectedRoom.color[0] : "#FFFFFF"} />
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {msg.reactions && msg.reactions.length > 0 && (
                <View style={[styles.reactionsContainer, msg.isUser && styles.userReactions]}>
                  {msg.reactions.map((reaction, index) => (
                    <TouchableOpacity
                      key={index}
                      style={styles.reactionBadge}
                      onPress={() => handleReaction(msg.id, reaction.emoji)}
                    >
                      <Text style={styles.reactionEmoji}>{reaction.emoji}</Text>
                      <Text style={styles.reactionCount}>{reaction.count}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          ))}

          {/* Poll */}
          <View style={styles.pollContainer}>
            <LinearGradient
              colors={[selectedRoom.backgroundColor, '#f8fafc']}
              style={styles.pollCard}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <View style={styles.pollHeader}>
                <Text style={[styles.pollAuthor, { color: selectedRoom.color[0] }]}>AI Poll</Text>
                <Text style={styles.pollTime}>{formatTime(poll.timestamp)}</Text>
              </View>
              <Text style={[styles.pollQuestion, { color: selectedRoom.color[0] }]}>{poll.question}</Text>
              <View style={styles.pollOptions}>
                {poll.options.map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.pollOption, 
                      option.isSelected && [styles.selectedPollOption, { borderColor: selectedRoom.color[0] }]
                    ]}
                    onPress={() => handlePollVote(index)}
                  >
                    <View style={[styles.pollRadio, option.isSelected && { borderColor: selectedRoom.color[0] }]}>
                      {option.isSelected && <View style={[styles.pollRadioSelected, { backgroundColor: selectedRoom.color[0] }]} />}
                    </View>
                    <Text style={styles.pollOptionText}>{option.label}</Text>
                    <Text style={[
                      styles.pollPercentage, 
                      option.isSelected && [styles.selectedPercentage, { color: selectedRoom.color[0] }]
                    ]}>
                      {option.percentage}%
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.pollVotes}>{poll.totalVotes} people voted</Text>
            </LinearGradient>
          </View>

          {/* Typing Indicator */}
          {showTyping && (
            <View style={styles.typingContainer}>
              <View style={styles.typingBubble}>
                <View style={styles.typingDots}>
                  <View style={[styles.typingDot, styles.typingDot1]} />
                  <View style={[styles.typingDot, styles.typingDot2]} />
                  <View style={[styles.typingDot, styles.typingDot3]} />
                </View>
                <Text style={styles.typingText}>Someone is typing...</Text>
              </View>
            </View>
          )}
        </ScrollView>

        {/* Command Suggestions */}
        <View style={styles.commandSuggestions}>
          <LinearGradient
            colors={[selectedRoom.backgroundColor, '#f8fafc']}
            style={styles.commandCard}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <View style={styles.commandHeader}>
              <Text style={[styles.commandTitle, { color: selectedRoom.color[0] }]}>Try these commands:</Text>
            </View>
            <View style={styles.commandTags}>
              <TouchableOpacity 
                style={[styles.commandTag, { borderColor: selectedRoom.color[0] }]}
                onPress={() => setMessage('/roastme')}
              >
                <Text style={[styles.commandTagText, { color: selectedRoom.color[0] }]}>/roastme</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.commandTag, { borderColor: selectedRoom.color[0] }]}
                onPress={() => setMessage('/vent')}
              >
                <Text style={[styles.commandTagText, { color: selectedRoom.color[0] }]}>/vent</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.commandTag, { borderColor: selectedRoom.color[0] }]}
                onPress={() => setMessage('/poll')}
              >
                <Text style={[styles.commandTagText, { color: selectedRoom.color[0] }]}>/poll</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>

        {/* Input Bar */}
        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              placeholder={`Message in ${selectedRoom.mood} room...`}
              placeholderTextColor="#8E8E93"
              value={message}
              onChangeText={setMessage}
              multiline
              maxLength={500}
            />
            <View style={styles.inputActions}>
              <TouchableOpacity style={styles.inputButton}>
                <Smile size={20} color="#8E8E93" />
              </TouchableOpacity>
              <TouchableOpacity style={styles.inputButton}>
                <Mic size={20} color="#8E8E93" />
              </TouchableOpacity>
            </View>
          </View>
          <TouchableOpacity
            style={[
              styles.sendButton, 
              { 
                backgroundColor: selectedRoom.color[0],
                opacity: message.trim() ? 1 : 0.5 
              }
            ]}
            onPress={handleSendMessage}
            disabled={!message.trim()}
          >
            <Send size={20} color="#FFFFFF" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#8E8E93',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    width: '100%',
    maxWidth: 400,
    maxHeight: height * 0.85,
  },
  modalScrollContent: {
    padding: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#1C1C1E',
    marginBottom: 8,
  },
  modalSubtitle: {
    fontSize: 14,
    textAlign: 'center',
    color: '#8E8E93',
    marginBottom: 32,
    lineHeight: 20,
  },
  moodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-evenly',
    marginBottom: 32,
    paddingHorizontal: 8,
    gap: 16,
  },
  moodChoiceContainer: {
    width: '45%',
    aspectRatio: 1,
    maxWidth: 150,
  },
  moodChoice: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'transparent',
    position: 'relative',
    overflow: 'hidden',
    paddingVertical: 16,
    paddingHorizontal: 12,
  },
  moodChoiceGlow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 18,
    opacity: 0,
  },
  moodChoiceEmoji: {
    fontSize: 48,
    marginBottom: 8,
    textAlign: 'center',
    lineHeight: 56,
  },
  moodChoiceText: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
    textAlign: 'center',
  },
  moodChoiceCount: {
    fontSize: 12,
    opacity: 0.8,
    textAlign: 'center',
    fontWeight: '500',
  },
  privacySection: {
    backgroundColor: '#f0f4ff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  privacyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  privacyTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#6366f1',
  },
  privacyText: {
    fontSize: 13,
    lineHeight: 20,
    color: '#4338ca',
  },
  rulesSection: {
    backgroundColor: '#fff7ed',
    borderRadius: 16,
    padding: 16,
  },
  rulesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 8,
  },
  rulesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#f97316',
  },
  rulesText: {
    fontSize: 13,
    lineHeight: 20,
    color: '#ea580c',
  },
  header: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
    paddingTop: Platform.OS === 'ios' ? 0 : 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '500',
    color: '#1C1C1E',
  },
  headerBadges: {
    flexDirection: 'row',
    gap: 8,
  },
  moodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    gap: 4,
  },
  moodEmoji: {
    fontSize: 14,
  },
  moodText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    backgroundColor: '#F2F2F7',
    gap: 4,
    minWidth: 200,
  },
  timeText: {
    fontSize: 10,
    fontWeight: '500',
    color: '#8E8E93',
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  roomSelector: {
    paddingVertical: 8,
  },
  roomScrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  moodCard: {
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'transparent',
    minWidth: 80,
    position: 'relative',
  },
  activeMoodCard: {
    borderColor: '#6366f1',
    shadowColor: '#6366f1',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  lockedMoodCard: {
    opacity: 0.5,
  },
  moodCardEmoji: {
    fontSize: 24,
    marginBottom: 4,
  },
  lockedEmoji: {
    opacity: 0.5,
  },
  moodCardText: {
    fontSize: 12,
    fontWeight: '500',
  },
  moodCardCount: {
    fontSize: 10,
    marginTop: 2,
  },
  lockBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 8,
    padding: 2,
  },
  welcomeContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  welcomeCard: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  welcomeText: {
    fontSize: 14,
    textAlign: 'center',
    fontWeight: '500',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    paddingBottom: 200,
  },
  messageContainer: {
    marginBottom: 16,
  },
  userMessageContainer: {
    alignItems: 'flex-end',
  },
  otherMessageContainer: {
    alignItems: 'flex-start',
  },
  messageBubble: {
    maxWidth: '75%',
    borderRadius: 16,
    padding: 12,
  },
  botBubble: {
    backgroundColor: '#f0f4ff',
    borderColor: '#e0e7ff',
    borderWidth: 1,
    borderTopLeftRadius: 4,
  },
  userBubble: {
    backgroundColor: '#6366f1',
    borderTopRightRadius: 4,
  },
  otherBubble: {
    backgroundColor: '#F2F2F7',
    borderTopLeftRadius: 4,
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
    gap: 8,
  },
  userMessageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginBottom: 4,
    gap: 8,
  },
  messageAuthor: {
    fontSize: 12,
    fontWeight: '500',
    color: '#1C1C1E',
  },
  botAuthor: {
    color: '#6366f1',
  },
  userMessageAuthor: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  messageTime: {
    fontSize: 12,
    color: '#8E8E93',
  },
  userMessageTime: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.7)',
  },
  premiumBadge: {
    fontSize: 10,
    fontWeight: '600',
    color: '#FFFFFF',
    backgroundColor: '#6366f1',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  messageText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#1C1C1E',
  },
  botMessageText: {
    color: '#1C1C1E',
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  voiceContainer: {
    marginTop: 8,
  },
  voiceButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#6366f1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  botVoiceButton: {
    backgroundColor: '#e0e7ff',
  },
  reactionsContainer: {
    flexDirection: 'row',
    marginTop: 4,
    gap: 4,
  },
  userReactions: {
    justifyContent: 'flex-end',
  },
  reactionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    backgroundColor: '#F2F2F7',
    gap: 2,
  },
  reactionEmoji: {
    fontSize: 12,
  },
  reactionCount: {
    fontSize: 12,
    color: '#8E8E93',
  },
  pollContainer: {
    marginVertical: 16,
    alignItems: 'center',
  },
  pollCard: {
    width: '100%',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  pollHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 8,
  },
  pollAuthor: {
    fontSize: 12,
    fontWeight: '500',
  },
  pollTime: {
    fontSize: 12,
    color: '#8E8E93',
  },
  pollQuestion: {
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 12,
  },
  pollOptions: {
    gap: 8,
  },
  pollOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    gap: 12,
  },
  selectedPollOption: {
    borderWidth: 2,
  },
  pollRadio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E5E5EA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pollRadioSelected: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  pollOptionText: {
    flex: 1,
    fontSize: 14,
    color: '#1C1C1E',
  },
  pollPercentage: {
    fontSize: 14,
    fontWeight: '500',
    color: '#8E8E93',
  },
  selectedPercentage: {
    fontWeight: '600',
  },
  pollVotes: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 12,
  },
  typingContainer: {
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  typingBubble: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F2F2F7',
    borderRadius: 16,
    borderTopLeftRadius: 4,
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  typingDots: {
    flexDirection: 'row',
    gap: 4,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#8E8E93',
  },
  typingDot1: {},
  typingDot2: {},
  typingDot3: {},
  typingText: {
    fontSize: 12,
    color: '#8E8E93',
  },
  commandSuggestions: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  commandCard: {
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E0E7FF',
  },
  commandHeader: {
    marginBottom: 8,
  },
  commandTitle: {
    fontSize: 12,
    fontWeight: '500',
  },
  commandTags: {
    flexDirection: 'row',
    gap: 8,
  },
  commandTag: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
  },
  commandTagText: {
    fontSize: 12,
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingBottom: Platform.OS === 'ios' ? 34 : 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
    gap: 8,
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#F2F2F7',
    paddingHorizontal: 16,
    paddingVertical: 8,
    maxHeight: 100,
  },
  textInput: {
    flex: 1,
    fontSize: 14,
    color: '#1C1C1E',
    maxHeight: 80,
    textAlignVertical: 'top',
  },
  inputActions: {
    flexDirection: 'row',
    gap: 4,
  },
  inputButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
});