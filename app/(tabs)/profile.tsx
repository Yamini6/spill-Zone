import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Animated,
  Platform,
  Share,
  Modal,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Crown, 
  Trophy, 
  Star, 
  Settings, 
  Share2, 
  Moon, 
  Sun, 
  Volume2, 
  Lock, 
  Shuffle, 
  TrendingUp,
  Zap,
  Heart,
  MessageCircle,
  Target,
  RotateCcw,
  X,
  Info
} from 'lucide-react-native';

interface Badge {
  id: string;
  name: string;
  emoji: string;
  description: string;
  unlocked: boolean;
  isPremium: boolean;
  progress?: number;
  maxProgress?: number;
  glowColor?: string;
}

interface UserStats {
  roastPoints: number;
  postsShared: number;
  gamesWon: number;
  dayStreak: number;
  totalRoasts: number;
  favoriteTag: string;
  level: number;
  nextLevelPoints: number;
  reactions: number;
  pollWins: number;
  gameStreaks: number;
}

interface PostArchiveItem {
  id: string;
  content: string;
  tag: string;
  roast: string;
  reactions: number;
  timestamp: Date;
  isPinned?: boolean;
}

const AVATAR_EMOJIS = ['👑', '🎭', '⭐️', '💫', '✨', '🌟', '💎', '🔮', '🎪', '🎨', '🎯', '🎲'];

const BADGES: Badge[] = [
  {
    id: 'cringe-queen',
    name: 'Cringe Queen',
    emoji: '👑',
    description: '10+ cringe submissions',
    unlocked: true,
    isPremium: false,
    progress: 15,
    maxProgress: 10,
    glowColor: '#FF6B6B',
  },
  {
    id: 'left-on-read-og',
    name: 'Left on Read OG',
    emoji: '👻',
    description: '20+ ghosting stories',
    unlocked: true,
    isPremium: false,
    progress: 23,
    maxProgress: 20,
    glowColor: '#8B5CF6',
  },
  {
    id: 'savage-voter',
    name: 'Savage Voter',
    emoji: '🔥',
    description: '50+ poll votes',
    unlocked: false,
    isPremium: false,
    progress: 42,
    maxProgress: 50,
  },
  {
    id: 'drama-king',
    name: 'Drama King',
    emoji: '🎭',
    description: '15+ dramatic posts',
    unlocked: false,
    isPremium: false,
    progress: 8,
    maxProgress: 15,
  },
  {
    id: 'premium-player',
    name: 'Premium Player',
    emoji: '✨',
    description: 'Unlock with Premium subscription',
    unlocked: false,
    isPremium: true,
    glowColor: '#FFD700',
  },
  {
    id: 'roast-master',
    name: 'Roast Master',
    emoji: '🏆',
    description: 'Reach level 10',
    unlocked: false,
    isPremium: true,
    progress: 7,
    maxProgress: 10,
    glowColor: '#FFD700',
  },
];

const USER_STATS: UserStats = {
  roastPoints: 2847,
  postsShared: 23,
  gamesWon: 45,
  dayStreak: 7,
  totalRoasts: 156,
  favoriteTag: '#Ghosted',
  level: 7,
  nextLevelPoints: 3000,
  reactions: 1240,
  pollWins: 850,
  gameStreaks: 360,
};

const SAMPLE_POSTS: PostArchiveItem[] = [
  {
    id: '1',
    content: "My boyfriend keeps 'forgetting' to introduce me to his friends after 8 months of dating...",
    tag: '#RedFlag',
    roast: "His memory works fine when he wants to hide you. Maybe he 'forgot' he's in a relationship too?",
    reactions: 342,
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    isPinned: true,
  },
  {
    id: '2',
    content: "I spent $300 on concert tickets for my girlfriend's birthday. She said she'd rather have gotten jewelry...",
    tag: '#Ungrateful',
    roast: "Congrats on buying yourself concert tickets with extra steps. Next time try asking what she wants instead of guessing.",
    reactions: 217,
    timestamp: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
  },
  {
    id: '3',
    content: "My roommate keeps eating my food without asking and denies it when confronted...",
    tag: '#Boundaries',
    roast: "Time to spice things up – literally. Ghost pepper hot sauce makes a great food detective.",
    reactions: 423,
    timestamp: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
  },
];

const LEADERBOARD_DATA = [
  { rank: 1, name: 'RoastMaster2000', points: 3450, badge: 'Champion' },
  { rank: 2, name: 'SavageQueen', points: 3120, badge: 'Expert' },
  { rank: 3, name: 'CringeCollector', points: 2890, badge: 'Rising Star' },
];

export default function ProfileTab() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [currentAvatar, setCurrentAvatar] = useState('👑');
  const [showPostArchive, setShowPostArchive] = useState(false);
  const [showBadgeDetails, setShowBadgeDetails] = useState<Badge | null>(null);
  const [showXPTooltip, setShowXPTooltip] = useState(false);

  const pulseAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const badgeAnimations = useRef(
    BADGES.reduce((acc, badge) => {
      acc[badge.id] = {
        scale: new Animated.Value(1),
        glow: new Animated.Value(0),
      };
      return acc;
    }, {} as Record<string, { scale: Animated.Value; glow: Animated.Value }>)
  ).current;

  useEffect(() => {
    // Pulse animation for premium crown
    if (isPremium) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    }

    // Progress bar animation
    const progressPercentage = (USER_STATS.roastPoints / USER_STATS.nextLevelPoints) * 100;
    Animated.timing(progressAnim, {
      toValue: progressPercentage,
      duration: 1500,
      useNativeDriver: false,
    }).start();

    // Badge glow animations for unlocked badges
    BADGES.forEach(badge => {
      if (badge.unlocked) {
        Animated.loop(
          Animated.sequence([
            Animated.timing(badgeAnimations[badge.id].glow, {
              toValue: 1,
              duration: 2000,
              useNativeDriver: false,
            }),
            Animated.timing(badgeAnimations[badge.id].glow, {
              toValue: 0.3,
              duration: 2000,
              useNativeDriver: false,
            }),
          ])
        ).start();
      }
    });
  }, [isPremium]);

  const triggerHaptic = () => {
    // Web-compatible haptic feedback alternative
    if (Platform.OS !== 'web') {
      // Would use Haptics.impactAsync here on native platforms
      console.log('Haptic feedback triggered');
    } else {
      // Web alternative - could add visual feedback here
      console.log('Web haptic alternative');
    }
  };

  const shuffleAvatar = () => {
    triggerHaptic();
    const availableEmojis = isPremium ? AVATAR_EMOJIS : AVATAR_EMOJIS.slice(0, 6);
    const newAvatar = availableEmojis[Math.floor(Math.random() * availableEmojis.length)];
    setCurrentAvatar(newAvatar);
    
    // Animate avatar change
    Animated.sequence([
      Animated.timing(pulseAnim, {
        toValue: 0.8,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.spring(pulseAnim, {
        toValue: 1,
        tension: 300,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleUpgrade = () => {
    Alert.alert(
      '👑 Upgrade to Premium',
      'Get unlimited games, voice roasts, exclusive badges, and premium themes!\n\nPrice: $2.99/month',
      [
        { text: 'Maybe Later', style: 'cancel' },
        { 
          text: 'Upgrade Now', 
          onPress: () => {
            setIsPremium(true);
            Alert.alert('Success! 🎉', 'Welcome to Premium! Enjoy all the exclusive features.');
          }
        },
      ]
    );
  };

  const shareProfile = async () => {
    const shareContent = {
      message: `Check out my SpillZone stats! 🔥\n\n👑 Level ${USER_STATS.level} Roast Master\n🎯 ${USER_STATS.roastPoints.toLocaleString()} Roast Points\n🏆 ${USER_STATS.gamesWon} Games Won\n\nJoin me on SpillZone for some savage roasts!`,
    };

    try {
      await Share.share(shareContent);
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleBadgePress = (badge: Badge) => {
    triggerHaptic();
    
    if (badge.isPremium && !isPremium) {
      handleUpgrade();
      return;
    }

    // Animate badge press
    Animated.sequence([
      Animated.timing(badgeAnimations[badge.id].scale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.spring(badgeAnimations[badge.id].scale, {
        toValue: 1,
        tension: 300,
        friction: 10,
        useNativeDriver: true,
      }),
    ]).start();

    setShowBadgeDetails(badge);
  };

  const progressPercentage = Math.min((USER_STATS.roastPoints / USER_STATS.nextLevelPoints) * 100, 100);

  const renderBadgeDetailsModal = () => (
    <Modal
      visible={!!showBadgeDetails}
      transparent
      animationType="fade"
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, isDarkMode && styles.darkModalContent]}>
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setShowBadgeDetails(null)}
          >
            <X size={20} color={isDarkMode ? '#FFFFFF' : '#6B7280'} />
          </TouchableOpacity>
          
          {showBadgeDetails && (
            <>
              <View style={styles.badgeModalHeader}>
                <Text style={styles.badgeModalEmoji}>{showBadgeDetails.emoji}</Text>
                <Text style={[styles.badgeModalTitle, isDarkMode && styles.darkText]}>
                  {showBadgeDetails.name}
                </Text>
                <Text style={[styles.badgeModalDescription, isDarkMode && styles.darkText]}>
                  {showBadgeDetails.description}
                </Text>
              </View>
              
              {showBadgeDetails.progress !== undefined && showBadgeDetails.maxProgress && (
                <View style={styles.badgeProgressSection}>
                  <Text style={[styles.badgeProgressLabel, isDarkMode && styles.darkText]}>
                    Progress: {showBadgeDetails.progress}/{showBadgeDetails.maxProgress}
                  </Text>
                  <View style={[styles.badgeProgressBar, isDarkMode && styles.darkProgressBar]}>
                    <View 
                      style={[
                        styles.badgeProgressFill,
                        { 
                          width: `${Math.min((showBadgeDetails.progress / showBadgeDetails.maxProgress) * 100, 100)}%`,
                          backgroundColor: showBadgeDetails.glowColor || '#FF6B6B'
                        }
                      ]} 
                    />
                  </View>
                </View>
              )}
              
              {showBadgeDetails.isPremium && !isPremium && (
                <TouchableOpacity style={styles.upgradeFromBadgeButton} onPress={handleUpgrade}>
                  <Crown size={16} color="#FFD700" />
                  <Text style={styles.upgradeFromBadgeText}>Upgrade to Unlock</Text>
                </TouchableOpacity>
              )}
            </>
          )}
        </View>
      </View>
    </Modal>
  );

  const renderPostArchiveModal = () => (
    <Modal
      visible={showPostArchive}
      animationType="slide"
      presentationStyle="fullScreen"
    >
      <SafeAreaView style={[styles.archiveModalContainer, isDarkMode && styles.darkContainer]}>
        <View style={[styles.archiveModalHeader, isDarkMode && styles.darkCard]}>
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={() => setShowPostArchive(false)}
          >
            <X size={24} color={isDarkMode ? '#FFFFFF' : '#1F2937'} />
          </TouchableOpacity>
          <Text style={[styles.archiveModalTitle, isDarkMode && styles.darkText]}>
            📚 Your Confessions Archive
          </Text>
          <View style={styles.headerSpacer} />
        </View>
        
        <ScrollView style={styles.archiveModalContent}>
          {SAMPLE_POSTS.map((post) => (
            <View key={post.id} style={[styles.archivePostCard, isDarkMode && styles.darkCard]}>
              {post.isPinned && (
                <View style={styles.pinnedBadge}>
                  <Star size={12} color="#FFD700" />
                  <Text style={styles.pinnedText}>Pinned</Text>
                </View>
              )}
              
              <View style={styles.archivePostHeader}>
                <Text style={[styles.archivePostTag, { color: '#FF6B6B' }]}>{post.tag}</Text>
                <Text style={[styles.archivePostDate, isDarkMode && styles.darkText]}>
                  {post.timestamp.toLocaleDateString()}
                </Text>
              </View>
              
              <Text style={[styles.archivePostContent, isDarkMode && styles.darkText]}>
                {post.content}
              </Text>
              
              <View style={styles.archiveRoastSection}>
                <Text style={[styles.archiveRoastLabel, isDarkMode && styles.darkText]}>
                  🤖 AI Roast:
                </Text>
                <Text style={[styles.archiveRoastText, isDarkMode && styles.darkText]}>
                  {post.roast}
                </Text>
              </View>
              
              <View style={styles.archivePostFooter}>
                <View style={styles.archiveReactions}>
                  <Heart size={16} color="#FF6B6B" />
                  <Text style={[styles.archiveReactionCount, isDarkMode && styles.darkText]}>
                    {post.reactions}
                  </Text>
                </View>
                
                <TouchableOpacity style={styles.sharePostButton}>
                  <Share2 size={16} color="#6B7280" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  return (
    <SafeAreaView style={[styles.container, isDarkMode && styles.darkContainer]}>
      {/* Header */}
      <View style={[styles.header, isDarkMode && styles.darkCard]}>
        <TouchableOpacity style={styles.headerButton} onPress={shareProfile}>
          <Share2 size={20} color={isDarkMode ? '#FFFFFF' : '#6B7280'} />
        </TouchableOpacity>
        
        <Text style={[styles.headerTitle, isDarkMode && styles.darkText]}>Profile</Text>
        
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.headerButton} 
            onPress={() => setIsDarkMode(!isDarkMode)}
          >
            {isDarkMode ? <Sun size={20} color="#FFFFFF" /> : <Moon size={20} color="#6B7280" />}
          </TouchableOpacity>
          <TouchableOpacity style={styles.headerButton}>
            <Settings size={20} color={isDarkMode ? '#FFFFFF' : '#6B7280'} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Animated.View
              style={[
                styles.avatarWrapper,
                {
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            >
              <LinearGradient
                colors={isPremium ? ['#FFD700', '#FFA500'] : ['#F3F4F6', '#E5E7EB']}
                style={styles.avatarGradient}
              >
                <Text style={styles.avatar}>{currentAvatar}</Text>
              </LinearGradient>
            </Animated.View>
            
            <TouchableOpacity style={styles.shuffleButton} onPress={shuffleAvatar}>
              <Shuffle size={16} color="#FFFFFF" />
            </TouchableOpacity>
            
            {isPremium && (
              <Animated.View
                style={[
                  styles.premiumCrown,
                  {
                    transform: [{ scale: pulseAnim }],
                  },
                ]}
              >
                <Crown size={20} color="#FFD700" />
              </Animated.View>
            )}
          </View>
          
          <Text style={[styles.username, isDarkMode && styles.darkText]}>
            Anonymous Roaster
          </Text>
          <Text style={[styles.userBio, isDarkMode && styles.darkText]}>
            {isPremium ? '👑 Premium Member' : 'Getting roasted since 2025'}
          </Text>
          <Text style={[styles.userTagline, isDarkMode && styles.darkText]}>
            "Left on Read Royalty"
          </Text>
        </View>

        {/* Roast Points Tracker */}
        <View style={[styles.statsSection, isDarkMode && styles.darkCard]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
              🔥 Your Roast Legacy
            </Text>
            <TouchableOpacity 
              style={styles.infoButton}
              onPress={() => setShowXPTooltip(!showXPTooltip)}
            >
              <Info size={16} color="#6B7280" />
            </TouchableOpacity>
          </View>
          
          {showXPTooltip && (
            <View style={[styles.tooltip, isDarkMode && styles.darkTooltip]}>
              <Text style={[styles.tooltipText, isDarkMode && styles.darkText]}>
                Earn points when your roast gets 💀 or 😂 reactions, win polls, or maintain game streaks!
              </Text>
            </View>
          )}
          
          <View style={styles.mainStat}>
            <Text style={[styles.mainStatValue, { color: isPremium ? '#FFD700' : '#FF6B6B' }]}>
              {USER_STATS.roastPoints.toLocaleString()}
            </Text>
            <Text style={[styles.mainStatLabel, isDarkMode && styles.darkText]}>
              Roast Points
            </Text>
            
            <View style={styles.levelInfo}>
              <Text style={[styles.levelText, isDarkMode && styles.darkText]}>
                Level {USER_STATS.level}
              </Text>
              <Text style={[styles.nextLevelText, isDarkMode && styles.darkText]}>
                {USER_STATS.roastPoints} / {USER_STATS.nextLevelPoints}
              </Text>
            </View>
            
            <View style={styles.progressContainer}>
              <View style={[styles.progressBar, isDarkMode && styles.darkProgressBar]}>
                <Animated.View 
                  style={[
                    styles.progressFill, 
                    { 
                      width: progressAnim.interpolate({
                        inputRange: [0, 100],
                        outputRange: ['0%', '100%'],
                        extrapolate: 'clamp',
                      }),
                      backgroundColor: isPremium ? '#FFD700' : '#FF6B6B'
                    }
                  ]} 
                />
              </View>
              <Text style={[styles.progressText, isDarkMode && styles.darkText]}>
                {Math.round(progressPercentage)}% to next level
              </Text>
            </View>
          </View>

          <View style={styles.statsGrid}>
            <View style={styles.statItem}>
              <MessageCircle size={20} color="#FF6B6B" />
              <Text style={[styles.statValue, isDarkMode && styles.darkText]}>
                {USER_STATS.reactions.toLocaleString()}
              </Text>
              <Text style={[styles.statLabel, isDarkMode && styles.darkText]}>
                💬 Reactions
              </Text>
            </View>
            <View style={styles.statItem}>
              <Target size={20} color="#4ECDC4" />
              <Text style={[styles.statValue, isDarkMode && styles.darkText]}>
                {USER_STATS.pollWins}
              </Text>
              <Text style={[styles.statLabel, isDarkMode && styles.darkText]}>
                🎯 Poll Wins
              </Text>
            </View>
            <View style={styles.statItem}>
              <Zap size={20} color="#8B5CF6" />
              <Text style={[styles.statValue, isDarkMode && styles.darkText]}>
                {USER_STATS.gameStreaks}
              </Text>
              <Text style={[styles.statLabel, isDarkMode && styles.darkText]}>
                🎮 Streaks
              </Text>
            </View>
          </View>

          <View style={styles.favoriteTag}>
            <Text style={[styles.favoriteTagLabel, isDarkMode && styles.darkText]}>
              Favorite Cringe Category:
            </Text>
            <Text style={styles.favoriteTagValue}>{USER_STATS.favoriteTag}</Text>
          </View>
        </View>

        {/* Badges Section */}
        <View style={[styles.badgesSection, isDarkMode && styles.darkCard]}>
          <View style={styles.sectionHeader}>
            <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
              🏆 Badges & Achievements
            </Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.badgesScrollContent}
          >
            {BADGES.map((badge) => (
              <TouchableOpacity
                key={badge.id}
                style={[
                  styles.badgeCard,
                  isDarkMode && styles.darkBadgeCard,
                  !badge.unlocked && styles.lockedBadge,
                  badge.isPremium && !isPremium && styles.premiumLockedBadge,
                ]}
                onPress={() => handleBadgePress(badge)}
              >
                <Animated.View
                  style={[
                    styles.badgeContent,
                    {
                      transform: [{ scale: badgeAnimations[badge.id].scale }],
                    },
                  ]}
                >
                  {badge.unlocked && badge.glowColor && (
                    <Animated.View
                      style={[
                        styles.badgeGlow,
                        {
                          backgroundColor: badge.glowColor,
                          opacity: badgeAnimations[badge.id].glow,
                        },
                      ]}
                    />
                  )}
                  
                  <Text style={[
                    styles.badgeEmoji,
                    (!badge.unlocked || (badge.isPremium && !isPremium)) && styles.lockedEmoji,
                  ]}>
                    {badge.emoji}
                  </Text>
                  <Text style={[
                    styles.badgeName,
                    isDarkMode && styles.darkText,
                    (!badge.unlocked || (badge.isPremium && !isPremium)) && styles.lockedText,
                  ]}>
                    {badge.name}
                  </Text>
                  <Text style={[
                    styles.badgeDescription,
                    isDarkMode && styles.darkText,
                    (!badge.unlocked || (badge.isPremium && !isPremium)) && styles.lockedText,
                  ]}>
                    {badge.description}
                  </Text>
                  
                  {badge.progress !== undefined && badge.maxProgress && (
                    <View style={styles.badgeProgressContainer}>
                      <View style={[styles.badgeProgressBarSmall, isDarkMode && styles.darkProgressBar]}>
                        <View 
                          style={[
                            styles.badgeProgressFillSmall,
                            { 
                              width: `${Math.min((badge.progress / badge.maxProgress) * 100, 100)}%`,
                              backgroundColor: badge.glowColor || '#FF6B6B'
                            }
                          ]} 
                        />
                      </View>
                      <Text style={[styles.badgeProgressText, isDarkMode && styles.darkText]}>
                        {badge.progress}/{badge.maxProgress}
                      </Text>
                    </View>
                  )}
                  
                  {badge.isPremium && !isPremium && (
                    <View style={styles.premiumBadgeOverlay}>
                      <Lock size={12} color="#FFD700" />
                    </View>
                  )}
                </Animated.View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Leaderboard Section (Premium) */}
        {isPremium && (
          <View style={[styles.leaderboardSection, isDarkMode && styles.darkCard]}>
            <View style={styles.sectionHeader}>
              <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
                🏆 Leaderboard
              </Text>
              <View style={styles.premiumBadge}>
                <Crown size={12} color="#FFD700" />
                <Text style={styles.premiumBadgeText}>Premium</Text>
              </View>
            </View>
            
            {LEADERBOARD_DATA.map((player) => (
              <View key={player.rank} style={[styles.leaderboardItem, isDarkMode && styles.darkLeaderboardItem]}>
                <View style={[
                  styles.leaderboardRank,
                  player.rank === 1 && styles.firstPlace,
                  player.rank === 2 && styles.secondPlace,
                  player.rank === 3 && styles.thirdPlace,
                ]}>
                  <Text style={styles.rankEmoji}>
                    {player.rank === 1 ? '🥇' : player.rank === 2 ? '🥈' : '🥉'}
                  </Text>
                </View>
                <View style={styles.leaderboardInfo}>
                  <Text style={[styles.leaderboardName, isDarkMode && styles.darkText]}>
                    {player.name}
                  </Text>
                  <Text style={[styles.leaderboardPoints, isDarkMode && styles.darkText]}>
                    {player.points.toLocaleString()} points
                  </Text>
                </View>
                <View style={[
                  styles.leaderboardBadge,
                  player.rank === 1 && styles.championBadge,
                  player.rank === 2 && styles.expertBadge,
                  player.rank === 3 && styles.risingStarBadge,
                ]}>
                  <Text style={[
                    styles.leaderboardBadgeText,
                    player.rank === 1 && styles.championText,
                    player.rank === 2 && styles.expertText,
                    player.rank === 3 && styles.risingStarText,
                  ]}>
                    {player.badge}
                  </Text>
                </View>
              </View>
            ))}
            
            <View style={[styles.userRankItem, isDarkMode && styles.darkUserRankItem]}>
              <View style={styles.userRankNumber}>
                <Text style={styles.userRankText}>12</Text>
              </View>
              <View style={styles.leaderboardInfo}>
                <Text style={[styles.leaderboardName, isDarkMode && styles.darkText]}>You</Text>
                <Text style={[styles.leaderboardPoints, isDarkMode && styles.darkText]}>
                  #12 out of 1.2k
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Post Archive Section */}
        <View style={[styles.archiveSection, isDarkMode && styles.darkCard]}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
            📚 Your Confessions Archive
          </Text>
          <TouchableOpacity 
            style={styles.archiveButton}
            onPress={() => setShowPostArchive(true)}
          >
            <Text style={[styles.archiveButtonText, isDarkMode && styles.darkText]}>
              View All Posts ({USER_STATS.postsShared})
            </Text>
            <TrendingUp size={16} color="#6B7280" />
          </TouchableOpacity>
        </View>

        {/* Subscription Management */}
        <View style={[styles.subscriptionSection, isDarkMode && styles.darkCard]}>
          <Text style={[styles.sectionTitle, isDarkMode && styles.darkText]}>
            {isPremium ? '👑 Premium Status' : '✨ Upgrade to Premium'}
          </Text>
          
          {isPremium ? (
            <View style={styles.premiumStatus}>
              <View style={styles.premiumStatusHeader}>
                <Text style={[styles.premiumPlanText, isDarkMode && styles.darkText]}>
                  Premium Plan
                </Text>
                <View style={styles.activeBadge}>
                  <Text style={styles.activeText}>Active</Text>
                </View>
              </View>
              <Text style={[styles.premiumExpiryText, isDarkMode && styles.darkText]}>
                Active until July 29, 2025
              </Text>
              
              <View style={styles.premiumFeatures}>
                <View style={styles.featureItem}>
                  <Text style={styles.featureCheck}>✓</Text>
                  <Text style={[styles.featureText, isDarkMode && styles.darkText]}>
                    10 Plays Daily
                  </Text>
                </View>
                <View style={styles.featureItem}>
                  <Volume2 size={14} color="#10B981" />
                  <Text style={[styles.featureText, isDarkMode && styles.darkText]}>
                    Voice Roasts with ElevenLabs
                  </Text>
                </View>
                <View style={styles.featureItem}>
                  <Crown size={14} color="#10B981" />
                  <Text style={[styles.featureText, isDarkMode && styles.darkText]}>
                    Premium Badges & Themes
                  </Text>
                </View>
                <View style={styles.featureItem}>
                  <Star size={14} color="#10B981" />
                  <Text style={[styles.featureText, isDarkMode && styles.darkText]}>
                    Pin Favorite Roasts
                  </Text>
                </View>
              </View>
              
              <TouchableOpacity style={styles.manageButton}>
                <Text style={styles.manageButtonText}>Manage Subscription</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity style={styles.upgradeCard} onPress={handleUpgrade}>
              <LinearGradient
                colors={['#FFD700', '#FFA500']}
                style={styles.upgradeCardGradient}
              >
                <Text style={styles.upgradeCardIcon}>👑</Text>
                <Text style={styles.upgradeCardTitle}>Upgrade to Premium</Text>
                <Text style={styles.upgradeCardSubtitle}>
                  • Unlimited game plays{'\n'}
                  • Voice roasts & custom avatars{'\n'}
                  • Exclusive premium badges{'\n'}
                  • Leaderboard access
                </Text>
                <View style={styles.upgradeCardButton}>
                  <Text style={styles.upgradeCardButtonText}>Get Premium - $2.99/mo</Text>
                </View>
              </LinearGradient>
            </TouchableOpacity>
          )}
        </View>

        {/* Footer */}
        <View style={[styles.footer, isDarkMode && styles.darkCard]}>
          <Text style={[styles.footerText, isDarkMode && styles.darkText]}>
            Built with 💀 by SpillZone
          </Text>
          <Text style={[styles.footerSubtext, isDarkMode && styles.darkText]}>
            Powered by Bolt.new
          </Text>
          <Text style={[styles.copyrightText, isDarkMode && styles.darkText]}>
            © 2025 Yamini K. All rights reserved.
          </Text>
        </View>
      </ScrollView>

      {renderBadgeDetailsModal()}
      {renderPostArchiveModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  darkContainer: {
    backgroundColor: '#1C1C1E',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 40,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  darkCard: {
    backgroundColor: '#2C2C2E',
    borderBottomColor: '#48484A',
  },
  headerButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  darkText: {
    color: '#FFFFFF',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatarWrapper: {
    width: 96,
    height: 96,
    borderRadius: 48,
    overflow: 'hidden',
  },
  avatarGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    fontSize: 48,
  },
  shuffleButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FF6B6B',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  premiumCrown: {
    position: 'absolute',
    top: -8,
    right: -8,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1F2937',
    alignItems: 'center',
    justifyContent: 'center',
  },
  username: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 4,
  },
  userBio: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  userTagline: {
    fontSize: 12,
    color: '#8B5CF6',
    fontStyle: 'italic',
  },
  statsSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  infoButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tooltip: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  darkTooltip: {
    backgroundColor: '#48484A',
  },
  tooltipText: {
    fontSize: 12,
    color: '#6B7280',
    lineHeight: 16,
  },
  mainStat: {
    alignItems: 'center',
    marginBottom: 24,
  },
  mainStatValue: {
    fontSize: 36,
    fontWeight: 'bold',
  },
  mainStatLabel: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 4,
    marginBottom: 8,
  },
  levelInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  levelText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  nextLevelText: {
    fontSize: 12,
    color: '#6B7280',
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    marginBottom: 8,
    overflow: 'hidden',
  },
  darkProgressBar: {
    backgroundColor: '#48484A',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#6B7280',
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 4,
  },
  statLabel: {
    fontSize: 10,
    color: '#6B7280',
    marginTop: 4,
    textAlign: 'center',
  },
  favoriteTag: {
    alignItems: 'center',
    paddingTop: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
  },
  favoriteTagLabel: {
    fontSize: 14,
    color: '#6B7280',
  },
  favoriteTagValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginTop: 4,
  },
  badgesSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  viewAllText: {
    fontSize: 14,
    color: '#FF6B6B',
    fontWeight: '600',
  },
  badgesScrollContent: {
    paddingRight: 20,
  },
  badgeCard: {
    width: 120,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    marginRight: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  darkBadgeCard: {
    backgroundColor: '#48484A',
  },
  lockedBadge: {
    opacity: 0.6,
  },
  premiumLockedBadge: {
    borderWidth: 2,
    borderColor: '#FFD700',
  },
  badgeContent: {
    alignItems: 'center',
    position: 'relative',
  },
  badgeGlow: {
    position: 'absolute',
    top: -6,
    left: -6,
    right: -6,
    bottom: -6,
    borderRadius: 18,
    opacity: 0.3,
  },
  badgeEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  lockedEmoji: {
    opacity: 0.5,
  },
  badgeName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 4,
  },
  badgeDescription: {
    fontSize: 10,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 12,
  },
  lockedText: {
    opacity: 0.6,
  },
  badgeProgressContainer: {
    width: '100%',
    marginTop: 8,
  },
  badgeProgressBarSmall: {
    width: '100%',
    height: 4,
    backgroundColor: '#E5E7EB',
    borderRadius: 2,
    marginBottom: 4,
  },
  badgeProgressFillSmall: {
    height: '100%',
    borderRadius: 2,
  },
  badgeProgressText: {
    fontSize: 8,
    color: '#6B7280',
    textAlign: 'center',
  },
  premiumBadgeOverlay: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: 8,
    padding: 2,
  },
  leaderboardSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  premiumBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  premiumBadgeText: {
    fontSize: 10,
    color: '#D97706',
    fontWeight: '600',
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  darkLeaderboardItem: {
    borderBottomColor: '#48484A',
  },
  leaderboardRank: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  firstPlace: {
    backgroundColor: '#FEF3C7',
  },
  secondPlace: {
    backgroundColor: '#E5E7EB',
  },
  thirdPlace: {
    backgroundColor: '#FED7AA',
  },
  rankEmoji: {
    fontSize: 20,
  },
  leaderboardInfo: {
    flex: 1,
  },
  leaderboardName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  leaderboardPoints: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  leaderboardBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  championBadge: {
    backgroundColor: '#FEF3C7',
  },
  expertBadge: {
    backgroundColor: '#DBEAFE',
  },
  risingStarBadge: {
    backgroundColor: '#D1FAE5',
  },
  leaderboardBadgeText: {
    fontSize: 10,
    fontWeight: '600',
  },
  championText: {
    color: '#D97706',
  },
  expertText: {
    color: '#2563EB',
  },
  risingStarText: {
    color: '#059669',
  },
  userRankItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#F0F4FF',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginTop: 8,
  },
  darkUserRankItem: {
    backgroundColor: '#48484A',
  },
  userRankNumber: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF6B6B',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  userRankText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  archiveSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  archiveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    marginTop: 8,
  },
  archiveButtonText: {
    fontSize: 16,
    color: '#1F2937',
    fontWeight: '600',
  },
  subscriptionSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  premiumStatus: {
    marginTop: 8,
  },
  premiumStatusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  premiumPlanText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  activeBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  activeText: {
    fontSize: 10,
    color: '#059669',
    fontWeight: '600',
  },
  premiumExpiryText: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 16,
  },
  premiumFeatures: {
    marginBottom: 16,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  featureCheck: {
    color: '#10B981',
    fontSize: 14,
    fontWeight: 'bold',
  },
  featureText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  manageButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  manageButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  upgradeCard: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 8,
  },
  upgradeCardGradient: {
    padding: 24,
    alignItems: 'center',
  },
  upgradeCardIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  upgradeCardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  upgradeCardSubtitle: {
    fontSize: 14,
    color: '#1F2937',
    lineHeight: 20,
    marginBottom: 20,
    textAlign: 'center',
  },
  upgradeCardButton: {
    backgroundColor: '#1F2937',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 32,
  },
  upgradeCardButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  footer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 40,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  footerText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  footerSubtext: {
    fontSize: 12,
    color: '#6B7280',
    marginBottom: 8,
  },
  copyrightText: {
    fontSize: 11,
    color: '#9CA3AF',
    fontStyle: 'italic',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    position: 'relative',
  },
  darkModalContent: {
    backgroundColor: '#2C2C2E',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  badgeModalHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  badgeModalEmoji: {
    fontSize: 64,
    marginBottom: 12,
  },
  badgeModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  badgeModalDescription: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  badgeProgressSection: {
    marginBottom: 20,
  },
  badgeProgressLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  badgeProgressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
  },
  badgeProgressFill: {
    height: '100%',
    borderRadius: 4,
  },
  upgradeFromBadgeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFD700',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  upgradeFromBadgeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  // Archive Modal Styles
  archiveModalContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  archiveModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 40,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  archiveModalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  headerSpacer: {
    width: 32,
  },
  archiveModalContent: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  archivePostCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    position: 'relative',
  },
  pinnedBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    gap: 4,
  },
  pinnedText: {
    fontSize: 10,
    color: '#D97706',
    fontWeight: '600',
  },
  archivePostHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  archivePostTag: {
    fontSize: 12,
    fontWeight: '600',
  },
  archivePostDate: {
    fontSize: 10,
    color: '#6B7280',
  },
  archivePostContent: {
    fontSize: 14,
    color: '#1F2937',
    lineHeight: 20,
    marginBottom: 12,
  },
  archiveRoastSection: {
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  archiveRoastLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B7280',
    marginBottom: 4,
  },
  archiveRoastText: {
    fontSize: 13,
    color: '#1F2937',
    lineHeight: 18,
    fontStyle: 'italic',
  },
  archivePostFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  archiveReactions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  archiveReactionCount: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  sharePostButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
});