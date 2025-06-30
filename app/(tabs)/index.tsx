import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Animated,
  Dimensions,
  Platform,
  TextInput,
  Modal,
  Image,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Send, Heart, MessageCircle, Smile, Zap, Flame, Skull, Frown, Droplet, RefreshCw, CircleAlert as AlertCircle, X } from 'lucide-react-native';
import { useConfessions, useSupabaseConnection, useComments } from '@/hooks/useSupabase';


const { width } = Dimensions.get('window');
const BG_COLORS = ['#F8E8FF', '#E8F8FF', '#FFE8E8', '#E8FFEA','#FFF6F6', '#F0FFF0'];

interface Post {
  id: string;
  content: string;
  tag: string;
  tagColor: readonly [string, string];
  roast: string;
  reactions: {
    laugh: number;
    skull: number;
    shocked: number;
    cry: number;
  };
  poll: {
    options: { label: string; votes: number; percentage: number }[];
    totalVotes: number;
  };
  comments: {
    id: string;
    author: string;
    text: string;
    timestamp: Date;
  }[];
  totalComments: number;
  timestamp: Date;
  backgroundColor: string;
}

const SAMPLE_POSTS: Post[] = [
  {
    id: '1',
    content: "My boyfriend keeps 'forgetting' to introduce me to his friends after 8 months of dating. When I brought it up, he said I'm being too clingy. Am I overreacting?",
    tag: '#RedFlag',
    tagColor: ['#6B4CE6', '#FF7979'],
    roast: "His memory works fine when he wants to hide you. Maybe he 'forgot' he's in a relationship too?",
    reactions: { laugh: 342, skull: 128, shocked: 89, cry: 67 },
    poll: {
      options: [
        { label: 'Him', votes: 972, percentage: 78 },
        { label: 'Her', votes: 274, percentage: 22 },
      ],
      totalVotes: 1246,
    },
    comments: [
      { 
        id: '1', 
        author: 'User123', 
        text: 'This is a huge red flag. You deserve better!', 
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) 
      },
      { 
        id: '2', 
        author: 'Skeptic', 
        text: "Maybe he's just shy? Talk to him directly.", 
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000) 
      },
    ],
    totalComments: 32,
    timestamp: new Date(),
    backgroundColor: '#F8E8FF',
  },
  {
    id: '2',
    content: "I spent $300 on concert tickets for my girlfriend's birthday. She said she'd rather have gotten jewelry instead and seemed disappointed. Should I be upset?",
    tag: '#Ungrateful',
    tagColor: ['#FF7979', '#6B4CE6'],
    roast: "Congrats on buying yourself concert tickets with extra steps. Next time try asking what she wants instead of guessing.",
    reactions: { laugh: 217, skull: 89, shocked: 64, cry: 156 },
    poll: {
      options: [
        { label: 'Him', votes: 312, percentage: 35 },
        { label: 'Her', votes: 375, percentage: 42 },
        { label: 'Both', votes: 205, percentage: 23 },
      ],
      totalVotes: 892,
    },
    comments: [
      { 
        id: '3', 
        author: 'Sympathizer', 
        text: "That's so thoughtless of her. The effort should matter most.", 
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000) 
      },
      { 
        id: '4', 
        author: 'Pragmatist', 
        text: 'Experiences over things! The concert was a great idea.', 
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) 
      },
      { 
        id: '5', 
        author: 'MaterialGirl', 
        text: 'I mean, who wouldn\'t want jewelry? She\'s not wrong.', 
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000) 
      },
    ],
    totalComments: 57,
    timestamp: new Date(),
    backgroundColor: '#E8F8FF',
  },
  {
    id: '3',
    content: "My roommate keeps eating my food without asking and denies it when confronted. I've started labeling everything but it still disappears. What should I do?",
    tag: '#Boundaries',
    tagColor: ['#6B4CE6', '#FF7979'],
    roast: "Time to spice things up – literally. Ghost pepper hot sauce makes a great food detective. What disappears today will burn tomorrow.",
    reactions: { laugh: 423, skull: 67, shocked: 176, cry: 89 },
    poll: {
      options: [
        { label: 'You', votes: 188, percentage: 12 },
        { label: 'Roommate', votes: 1379, percentage: 88 },
      ],
      totalVotes: 1567,
    },
    comments: [
      { 
        id: '6', 
        author: 'Avenger', 
        text: 'Time for some ghost pepper extract in the orange juice.', 
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000) 
      },
      { 
        id: '7', 
        author: 'Peacekeeper', 
        text: 'Just get a mini-fridge with a lock. Not worth the drama.', 
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000) 
      },
    ],
    totalComments: 71,
    timestamp: new Date(),
    backgroundColor: '#FFE8E8',
  },
  {
    id: '4',
    content: "I found out my best friend has been secretly dating my ex for 3 months. They both claim it 'just happened' and they didn't want to hurt me. Should I forgive them?",
    tag: '#Betrayal',
    tagColor: ['#FF7979', '#6B4CE6'],
    roast: "Things that 'just happen': rain, flat tires, hiccups. Things that don't: secretly dating your best friend's ex for a quarter of a year. Upgrade your friend circle, not your forgiveness policy.",
    reactions: { laugh: 156, skull: 347, shocked: 219, cry: 289 },
    poll: {
      options: [
        { label: 'You', votes: 105, percentage: 5 },
        { label: 'Ex', votes: 589, percentage: 28 },
        { label: 'Friend', votes: 1409, percentage: 67 },
      ],
      totalVotes: 2103,
    },
    comments: [
      { 
        id: '8', 
        author: 'Realist', 
        text: 'They both broke your trust. It will be hard to get that back.', 
        timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000) 
      },
      { 
        id: '9', 
        author: 'Optimist', 
        text: "If they are truly sorry, maybe they deserve a second chance?", 
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000) 
      },
      { 
        id: '10', 
        author: 'StoryTime', 
        text: "This happened to me, and they ended up getting married. Life is strange.", 
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000) 
      },
    ],
    totalComments: 104,
    timestamp: new Date(),
    backgroundColor: '#E8FFEA',
  },
];

// Updated reaction icons with animated emojis and new names
const REACTION_ICONS = {
  laugh: { emoji: '😂', label: 'Laugh', color: '#F59E0B' },
  skull: { emoji: '💀', label: 'Dark', color: '#6B7280' },
  shocked: { emoji: '😢', label: 'Sad', color: '#3B82F6' },
  cry: { emoji: '🫂', label: 'Me Too', color: '#EC4899' },
};

export default function FeedTab() {
  const [posts, setPosts] = useState<Post[]>(SAMPLE_POSTS);
  const [typingAnimations, setTypingAnimations] = useState<{ [key: string]: boolean }>({});
  const [votedPolls, setVotedPolls] = useState<string[]>(SAMPLE_POSTS.map(p => p.id));
  const [showCommentsModal, setShowCommentsModal] = useState(false);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [newComment, setNewComment] = useState('');
  
  const fadeAnims = useRef<{ [key: string]: Animated.Value }>({});
  const bounceAnims = useRef<{ [key: string]: Animated.Value }>({});
  const emojiAnims = useRef<{ [key: string]: { [key: string]: Animated.Value } }>({});

  // Supabase integration
  const { isConnected, error: connectionError } = useSupabaseConnection();
  const { confessions, loading, error, fetchConfessions, updateReaction, updatePoll } = useConfessions();
  
  // Comments hook for the selected post
  const { 
    comments: supabaseComments, 
    loading: commentsLoading, 
    createComment,
    fetchComments 
  } = useComments(selectedPost?.id || '');

  const shouldUseFallback = error || (loading && confessions.length === 0);

  const displayPosts = useMemo(() => {
    if (shouldUseFallback) {
      return posts;
    }

    const converted = confessions.map((confession): Post => {
      const pollData = confession.poll || { you: 0, them: 0, both: 0 };
      const totalVotes = pollData.you + pollData.them + pollData.both;
      
      const calculatePercentage = (votes: number) => {
        return totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
      };

      return {
        id: confession.id,
        content: confession.content,
        tag: confession.tag,
        tagColor: ['#6B4CE6', '#FF7979'] as const,
        roast: confession.roast,
        reactions: confession.reactions || { laugh: 0, skull: 0, shocked: 0, cry: 0 },
        poll: {
          options: [
            { label: 'You', votes: pollData.you, percentage: calculatePercentage(pollData.you) },
            { label: 'Them', votes: pollData.them, percentage: calculatePercentage(pollData.them) },
            { label: 'Both', votes: pollData.both, percentage: calculatePercentage(pollData.both) },
          ],
          totalVotes: totalVotes,
        },
        comments: [], // Will be loaded separately when modal opens
        totalComments: 0, // Will be updated when comments are loaded
        timestamp: new Date(confession.created_at),
        backgroundColor: '', // Placeholder
      };
    });

    const hashCode = (s: string) => s.split('').reduce((a,b) => (((a << 5) - a) + b.charCodeAt(0))|0, 0)

    converted.forEach((post, index) => {
      const forbiddenColors: string[] = [];
      if (index > 0) forbiddenColors.push(converted[index - 1].backgroundColor);
      if (index > 1) forbiddenColors.push(converted[index - 2].backgroundColor);
      if (index > 2) forbiddenColors.push(converted[index - 3].backgroundColor);

      const availableColors = BG_COLORS.filter(c => !forbiddenColors.includes(c));
      const colorOptions = availableColors.length > 0 ? availableColors : BG_COLORS;
      
      const colorIndex = Math.abs(hashCode(post.id)) % colorOptions.length;
      post.backgroundColor = colorOptions[colorIndex];
    });

    return converted;
  }, [shouldUseFallback, confessions]);

  // Initialize animations for any posts that don't have them yet
  displayPosts.forEach(post => {
    if (!fadeAnims.current[post.id]) {
      fadeAnims.current[post.id] = new Animated.Value(0);
    }
    if (!bounceAnims.current[post.id]) {
      bounceAnims.current[post.id] = new Animated.Value(1);
    }
    if (!emojiAnims.current[post.id]) {
      emojiAnims.current[post.id] = {};
      Object.keys(REACTION_ICONS).forEach(reactionType => {
        emojiAnims.current[post.id][reactionType] = new Animated.Value(1);
      });
    }
  });

  useEffect(() => {
    // Start fade-in animations
    displayPosts.forEach((post, index) => {
      if (fadeAnims.current[post.id]) {
        Animated.timing(fadeAnims.current[post.id], {
          toValue: 1,
          duration: 500,
          delay: index * 100,
          useNativeDriver: true,
        }).start();
      }
    });

    // Start typing animations with delay
    const timer = setTimeout(() => {
      const newTypingAnimations: { [key: string]: boolean } = {};
      displayPosts.forEach(post => {
        newTypingAnimations[post.id] = true;
      });
      setTypingAnimations(newTypingAnimations);
    }, 800);

    return () => clearTimeout(timer);
  }, [displayPosts]);

  const handleReaction = async (postId: string, reactionType: keyof Post['reactions']) => {
    // Only animate the specific emoji that was clicked
    const emojiAnim = emojiAnims.current[postId]?.[reactionType];
    if (emojiAnim) {
      Animated.sequence([
        Animated.timing(emojiAnim, {
          toValue: 1.5,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.spring(emojiAnim, {
          toValue: 1,
          tension: 300,
          friction: 10,
          useNativeDriver: true,
        }),
      ]).start();
    }

    if (!shouldUseFallback) {
      // Update in Supabase
      const success = await updateReaction(postId, reactionType);
      if (!success) {
        console.error('Failed to update reaction in Supabase');
      }
    } else {
      // Update local state for sample data
      setPosts(posts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            reactions: {
              ...post.reactions,
              [reactionType]: post.reactions[reactionType] + 1,
            },
          };
        }
        return post;
      }));
    }
  };

  const handlePollVote = async (postId: string, optionIndex: number) => {
    if (!shouldUseFallback) {
      // For Supabase data, we need to map option index to vote type
      const voteTypes = ['you', 'them', 'both'];
      const voteType = voteTypes[optionIndex] as 'you' | 'them' | 'both';
      
      const success = await updatePoll(postId, voteType);
      if (!success) {
        console.error('Failed to update poll in Supabase');
      }
    } else {
      // Update local state for sample data
      setPosts(posts.map(post => {
        if (post.id === postId) {
          const newOptions = [...post.poll.options];
          newOptions[optionIndex].votes += 1;
          const newTotal = post.poll.totalVotes + 1;
          
          // Recalculate percentages
          newOptions.forEach(option => {
            option.percentage = Math.round((option.votes / newTotal) * 100);
          });

          return {
            ...post,
            poll: {
              options: newOptions,
              totalVotes: newTotal,
            },
          };
        }
        return post;
      }));
    }
    setVotedPolls(prev => [...prev, postId]);
  };

  const handleShowComments = async (post: Post) => {
    setSelectedPost(post);
    setShowCommentsModal(true);
    
    // If using Supabase, fetch comments for this specific post
    if (!shouldUseFallback && post.id) {
      await fetchComments();
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim() || !selectedPost) return;

    if (!shouldUseFallback) {
      // Add comment to Supabase
      const result = await createComment(newComment.trim());
      if (result.success) {
        setNewComment('');
        // Comments will be updated automatically via the useComments hook
      } else {
        console.error('Failed to add comment:', result.error);
      }
    } else {
      // Update local state for sample data
      const comment = {
        id: Date.now().toString(),
        author: `User${Math.floor(Math.random() * 1000)}`,
        text: newComment.trim(),
        timestamp: new Date(),
      };

      setPosts(posts.map(post => {
        if (post.id === selectedPost.id) {
          return {
            ...post,
            comments: [...post.comments, comment],
            totalComments: post.totalComments + 1,
          };
        }
        return post;
      }));

      // Update selected post for modal
      setSelectedPost({
        ...selectedPost,
        comments: [...selectedPost.comments, comment],
        totalComments: selectedPost.totalComments + 1,
      });

      setNewComment('');
    }
  };

  const handleBoltLogoPress = async () => {
    try {
      const supported = await Linking.canOpenURL('https://bolt.new/');
      if (supported) {
        await Linking.openURL('https://bolt.new/');
      } else {
        console.log("Don't know how to open URI: https://bolt.new/");
      }
    } catch (error) {
      console.error('An error occurred', error);
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  const renderCommentsModal = () => {
    // Use Supabase comments if available, otherwise use local comments
    const commentsToShow = !shouldUseFallback ? 
      supabaseComments.map(comment => ({
        id: comment.id,
        author: comment.author,
        text: comment.text,
        timestamp: new Date(comment.created_at),
      })) : 
      selectedPost?.comments || [];

    return (
      <Modal
        visible={showCommentsModal}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowCommentsModal(false)}
            >
              <X size={24} color="#1F2937" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>
              Comments ({commentsToShow.length})
            </Text>
            <View style={styles.modalSpacer} />
          </View>

          {selectedPost && (
            <>
              <ScrollView style={styles.commentsScrollView}>
                {commentsLoading && !shouldUseFallback ? (
                  <View style={styles.loadingContainer}>
                    <Text style={styles.loadingText}>Loading comments...</Text>
                  </View>
                ) : commentsToShow.length > 0 ? (
                  commentsToShow.map((comment) => (
                    <View key={comment.id} style={styles.commentItem}>
                      <View style={styles.commentHeader}>
                        <Text style={styles.commentAuthor}>{comment.author}</Text>
                        <Text style={styles.commentTime}>{formatTime(comment.timestamp)}</Text>
                      </View>
                      <Text style={styles.commentText}>{comment.text}</Text>
                    </View>
                  ))
                ) : (
                  <View style={styles.noCommentsContainer}>
                    <Text style={styles.noCommentsText}>No comments yet</Text>
                    <Text style={styles.noCommentsSubtext}>Be the first to share your thoughts!</Text>
                  </View>
                )}
              </ScrollView>

              <View style={styles.commentInputContainer}>
                <TextInput
                  style={styles.commentInput}
                  placeholder="Add a comment..."
                  placeholderTextColor="#8E8E93"
                  value={newComment}
                  onChangeText={setNewComment}
                  multiline
                  maxLength={300}
                />
                <TouchableOpacity
                  style={[
                    styles.commentSendButton,
                    { opacity: newComment.trim() ? 1 : 0.5 }
                  ]}
                  onPress={handleAddComment}
                  disabled={!newComment.trim()}
                >
                  <Send size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            </>
          )}
        </SafeAreaView>
      </Modal>
    );
  };

  const renderPost = (post: Post) => {
    const fadeAnim = fadeAnims.current[post.id];
    const bounceAnim = bounceAnims.current[post.id];
    const hasVoted = votedPolls.includes(post.id);

    let winnerPercentage = 0;
    if (hasVoted) {
      winnerPercentage = Math.max(...post.poll.options.map(o => o.percentage), 0);
    }

    if (!fadeAnim || !bounceAnim) {
      return null;
    }

    // For Supabase posts, we need to get the comment count differently
    const commentCount = !shouldUseFallback ? 
      (supabaseComments.length || 0) : 
      post.totalComments;

    return (
      <Animated.View
        key={post.id}
        style={[
          styles.postCard,
          { backgroundColor: post.backgroundColor, opacity: fadeAnim },
        ]}
      >
        {/* Post Content */}
        <View style={styles.postHeader}>
          <Text style={styles.postContent}>{post.content}</Text>
          <LinearGradient
            colors={post.tagColor}
            style={styles.tagBadge}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Text style={styles.tagText}>{post.tag}</Text>
          </LinearGradient>
        </View>

        {/* AI Roast */}
        <View style={styles.roastContainer}>
          <View style={styles.roastBubble}>
            <View style={styles.roastTail} />
            <Text style={[styles.roastText, typingAnimations[post.id] && styles.typingText]}>
              <Text style={styles.roastLabel}>AI Roast: </Text>{post.roast}
            </Text>
          </View>
        </View>

        {/* Poll Section */}
        <View style={styles.pollSection}>
          <Text style={styles.pollTitle}>Who's wrong?</Text>
          <View style={styles.pollOptions}>
            {post.poll.options.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={styles.pollOption}
                onPress={() => handlePollVote(post.id, index)}
                disabled={hasVoted}
              >
                {hasVoted && (
                  <View 
                    style={[
                      styles.pollFill, 
                      { width: option.percentage === winnerPercentage ? '100%' : `${option.percentage}%` }
                    ]} 
                  />
                )}
                <View style={styles.pollContent}>
                  <Text style={styles.pollLabel}>{option.label}</Text>
                  {hasVoted && <Text style={styles.pollPercentage}>{option.percentage}%</Text>}
                </View>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.pollVotes}>{post.poll.totalVotes.toLocaleString()} votes</Text>
        </View>

        {/* Reactions */}
        <View style={styles.reactionsContainer}>
          <View style={styles.reactions}>
            {Object.entries(post.reactions).map(([type, count]) => {
              const reactionConfig = REACTION_ICONS[type as keyof typeof REACTION_ICONS];
              const emojiAnim = emojiAnims.current[post.id]?.[type];
              
              if (!reactionConfig || !emojiAnim) return null;
              
              return (
                <View key={type} style={styles.reaction}>
                  <TouchableOpacity
                    style={styles.reactionButton}
                    onPress={() => handleReaction(post.id, type as keyof Post['reactions'])}
                  >
                    <Animated.Text 
                      style={[
                        styles.reactionEmoji,
                        { transform: [{ scale: emojiAnim }] }
                      ]}
                    >
                      {reactionConfig.emoji}
                    </Animated.Text>
                    <Text style={styles.reactionCount}>{count}</Text>
                    <Text style={styles.reactionLabel}>
                      {reactionConfig.label}
                    </Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        </View>

        {/* Comments Preview */}
        <View style={styles.commentsSection}>
          {shouldUseFallback ? (
            // Sample data comments
            post.comments.length > 0 ? (
              <>
                {post.comments.slice(0, 2).map((comment, index) => (
                  <View key={comment.id} style={styles.comment}>
                    <Text style={styles.commentText}>
                      <Text style={styles.commentAuthor}>{comment.author}:</Text> {comment.text}
                    </Text>
                  </View>
                ))}
                <TouchableOpacity 
                  style={styles.viewAllComments}
                  onPress={() => handleShowComments(post)}
                >
                  <Text style={styles.viewAllText}>View all {post.totalComments} comments</Text>
                </TouchableOpacity>
              </>
            ) : (
              <TouchableOpacity 
                style={styles.viewAllComments}
                onPress={() => handleShowComments(post)}
              >
                <Text style={styles.viewAllText}>Be the first to comment</Text>
              </TouchableOpacity>
            )
          ) : (
            // Supabase data - show comment count or "be first to comment"
            <TouchableOpacity 
              style={styles.viewAllComments}
              onPress={() => handleShowComments(post)}
            >
              <Text style={styles.viewAllText}>
                {commentCount > 0 ? `View comments (${commentCount})` : 'Be the first to comment'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </Animated.View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Fixed Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>SpillZone</Text>
        
        <View style={styles.headerRight}>
          {/* Supabase Connection Status */}
          <View style={styles.connectionStatus}>
            {connectionError ? (
              <View style={styles.errorStatus}>
                <AlertCircle size={16} color="#EF4444" />
                <Text style={styles.errorText}>Connection Error</Text>
              </View>
            ) : isConnected ? (
              <View style={styles.connectedStatus}>
                <View style={styles.connectedDot} />
                <Text style={styles.connectedText}>Live</Text>
              </View>
            ) : (
              <View style={styles.connectingStatus}>
                <View style={styles.connectingDot} />
                <Text style={styles.connectingText}>Connecting...</Text>
              </View>
            )}
          </View>
          
          {/* Bolt.new Logo */}
          <TouchableOpacity 
            style={styles.boltLogoContainer}
            onPress={handleBoltLogoPress}
            activeOpacity={0.7}
          >
            <Image 
              source={require('@/assets/images/black_circle_360x360.png')}
              style={styles.boltLogo}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Error Display */}
      {error && (
        <View style={styles.errorBanner}>
          <AlertCircle size={16} color="#EF4444" />
          <Text style={styles.errorBannerText}>{error}</Text>
        </View>
      )}

      {/* Main Feed */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {!shouldUseFallback && displayPosts.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateTitle}>No confessions yet</Text>
            <Text style={styles.emptyStateText}>
              Be the first to share your story! Go to the Submit tab to add a confession.
            </Text>
          </View>
        ) : (
          displayPosts.map(renderPost)
        )}
      </ScrollView>

      {renderCommentsModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAF9F6',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    zIndex: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#6B4CE6',
    fontFamily: Platform.select({
      ios: 'Pacifico',
      android: 'Pacifico',
      default: 'serif',
    }),
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  connectedStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  connectedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  connectedText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
  },
  connectingStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  connectingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#F59E0B',
  },
  connectingText: {
    fontSize: 12,
    color: '#F59E0B',
    fontWeight: '600',
  },
  errorStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  errorText: {
    fontSize: 12,
    color: '#EF4444',
    fontWeight: '600',
  },
  boltLogoContainer: {
    width: width * 0.12, // 12vw equivalent
    height: width * 0.12, // 12vw equivalent
    borderRadius: (width * 0.12) / 2, // Half of width for perfect circle
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  boltLogo: {
    width: '100%',
    height: '100%',
  },
  errorBanner: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FECACA',
    borderWidth: 1,
    marginHorizontal: 16,
    marginTop: 8,
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  errorBannerText: {
    fontSize: 14,
    color: '#DC2626',
    flex: 1,
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
  },
  postCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  postHeader: {
    position: 'relative',
    marginBottom: 16,
  },
  postContent: {
    fontSize: 16,
    lineHeight: 24,
    color: '#2C2C2E',
    fontFamily: 'Manrope',
    paddingRight: 80,
  },
  tagBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  tagText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  roastContainer: {
    marginBottom: 16,
  },
  roastBubble: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    position: 'relative',
  },
  roastTail: {
    position: 'absolute',
    top: 12,
    left: -6,
    width: 12,
    height: 12,
    backgroundColor: '#FFFFFF',
    transform: [{ rotate: '45deg' }],
  },
  roastText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#6B4CE6',
    fontWeight: '500',
    fontFamily: 'Urbanist',
  },
  roastLabel: {
    fontWeight: '700',
  },
  typingText: {
    // Add typing animation styles if needed
  },
  pollSection: {
    marginBottom: 16,
  },
  pollTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2C2C2E',
    marginBottom: 12,
  },
  pollOptions: {
    gap: 8,
  },
  pollOption: {
    position: 'relative',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    padding: 12,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
  },
  pollFill: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    backgroundColor: 'rgba(107, 76, 230, 0.2)',
  },
  pollContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 1,
    position: 'relative',
  },
  pollLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#2C2C2E',
  },
  pollPercentage: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2C2C2E',
  },
  pollVotes: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 8,
  },
  reactionsContainer: {
    paddingVertical: 16,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5E5EA',
    marginBottom: 16,
  },
  reactions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  reaction: {
    alignItems: 'center',
    flex: 1,
  },
  reactionButton: {
    alignItems: 'center',
    gap: 4,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  reactionEmoji: {
    fontSize: 24,
    lineHeight: 28,
  },
  reactionCount: {
    fontSize: 12,
    color: '#8E8E93',
    fontWeight: '600',
  },
  reactionLabel: {
    fontSize: 10,
    color: '#8E8E93',
    fontWeight: '500',
  },
  commentsSection: {
    backgroundColor: '#F2F2F7',
    borderRadius: 12,
    padding: 16,
  },
  comment: {
    marginBottom: 8,
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#2C2C2E',
  },
  commentAuthor: {
    fontWeight: '600',
  },
  viewAllComments: {
    marginTop: 8,
  },
  viewAllText: {
    fontSize: 14,
    color: '#6B4CE6',
    fontWeight: '600',
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  modalSpacer: {
    width: 32,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 16,
    color: '#8E8E93',
  },
  commentsScrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  commentItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  commentTime: {
    fontSize: 12,
    color: '#8E8E93',
  },
  noCommentsContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  noCommentsText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 8,
  },
  noCommentsSubtext: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E5E5EA',
    gap: 12,
  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#E5E5EA',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 14,
    color: '#1F2937',
    maxHeight: 100,
    textAlignVertical: 'top',
  },
  commentSendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#6B4CE6',
    alignItems: 'center',
    justifyContent: 'center',
  },
});