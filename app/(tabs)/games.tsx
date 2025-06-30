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
  Dimensions,
  Platform,
  Modal,
  Share,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Play, Trophy, Lock, Zap, Target, Heart, Volume2, X, RotateCcw, Share2 } from 'lucide-react-native';

const { width, height } = Dimensions.get('window');

interface Game {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string[];
  playsLeft: number;
  isPremium: boolean;
  popularity: number;
  likes: string;
}

interface GameSession {
  currentRound: number;
  score: number;
  isActive: boolean;
  gameType: string;
  questions: GameQuestion[];
  currentQuestionIndex: number;
  selectedAnswer: number | null;
  showExplanation: boolean;
  gameComplete: boolean;
}

interface GameQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
  points: number;
}

interface WheelCategory {
  id: string;
  name: string;
  emoji: string;
  color: string;
  roasts: string[];
}

const GAMES: Game[] = [
  {
    id: 'lie-detector',
    title: 'Lie Detector Roast',
    description: 'Can you spot the truth, or get roasted trying?',
    icon: '🤥',
    color: ['#8B5CF6', '#A78BFA'],
    playsLeft: 3,
    isPremium: false,
    popularity: 2,
    likes: '2.4k',
  },
  {
    id: 'am-i-fool',
    title: 'Am I a Fool?',
    description: 'Judge others\' choices, but can you judge yours?',
    icon: '🤔',
    color: ['#3B82F6', '#60A5FA'],
    playsLeft: 2,
    isPremium: false,
    popularity: 1,
    likes: '3.1k',
  },
  {
    id: 'red-flag-radar',
    title: 'Red Flag Radar',
    description: 'Spot the red flags or become the red flag!',
    icon: '🚩',
    color: ['#EC4899', '#F472B6'],
    playsLeft: 1,
    isPremium: false,
    popularity: 3,
    likes: '1.8k',
  },
  {
    id: 'spin-the-roast',
    title: 'Spin the Roast',
    description: 'Spin for your destiny... and a side of roast!',
    icon: '🎯',
    color: ['#10B981', '#34D399'],
    playsLeft: 4,
    isPremium: false,
    popularity: 4,
    likes: '1.5k',
  },
];

// Game Questions with SAVAGE explanations
const LIE_DETECTOR_QUESTIONS: GameQuestion[] = [
  {
    id: 'ld1',
    question: 'Which dating app behavior is TRUE?',
    options: [
      'People actually read your bio before swiping',
      'Everyone uses their most recent photos',
      'Height requirements are just suggestions',
      'Most conversations die after "hey"'
    ],
    correctAnswer: 3,
    explanation: "Congratulations! You've mastered the art of digital disappointment. 'Hey' is where conversations go to die, just like your hopes and dreams on dating apps. 💀",
    points: 25,
  },
  {
    id: 'ld2',
    question: 'What do people REALLY do on social media?',
    options: [
      'Post authentic, unfiltered moments',
      'Stalk their ex\'s new partner obsessively',
      'Share genuine thoughts and feelings',
      'Use it to stay connected with close friends'
    ],
    correctAnswer: 1,
    explanation: "Ding ding! You know the dark truth. We're all FBI agents when it comes to our ex's new boo. That 3 AM deep dive into their Instagram from 2019? We've all been there, detective. 🕵️‍♀️",
    points: 25,
  },
  {
    id: 'ld3',
    question: 'Which texting habit is ACTUALLY common?',
    options: [
      'Responding immediately to show interest',
      'Typing long, thoughtful messages',
      'Leaving people on read for strategic reasons',
      'Using proper grammar and punctuation'
    ],
    correctAnswer: 2,
    explanation: "Bingo! You understand the psychological warfare that is modern texting. Leaving someone on read is the digital equivalent of emotional terrorism, and we're all guilty. 😈",
    points: 25,
  },
  {
    id: 'ld4',
    question: 'What happens in most relationships?',
    options: [
      'Couples communicate openly about problems',
      'People change their Netflix passwords as revenge',
      'Arguments are resolved maturely',
      'Both partners grow together equally'
    ],
    correctAnswer: 1,
    explanation: "CORRECT! Nothing says 'it's over' like changing the Netflix password. It's the modern equivalent of burning someone's belongings, except more devastating because now they can't finish their show. 📺💔",
    points: 25,
  },
];

const RED_FLAG_QUESTIONS: GameQuestion[] = [
  {
    id: 'rf1',
    question: 'They never post you on social media after 6 months of dating',
    options: ['Red Flag 🚩', 'Not a Red Flag ✅'],
    correctAnswer: 0,
    explanation: "MASSIVE red flag! 🚩 If they're hiding you like a dirty secret after 6 months, you're not their partner - you're their side quest. Time to upgrade yourself to main character status... somewhere else. 👑",
    points: 25,
  },
  {
    id: 'rf2',
    question: 'They still have their ex\'s number "just in case of emergency"',
    options: ['Red Flag 🚩', 'Not a Red Flag ✅'],
    correctAnswer: 0,
    explanation: "RED FLAG ALERT! 🚨 What emergency? Their ex getting stuck in a washing machine? Unless their ex is a doctor and they're having a heart attack, this is sus. Delete that number or delete yourself from this situation. 💀",
    points: 25,
  },
  {
    id: 'rf3',
    question: 'They want to split the bill on the first date',
    options: ['Red Flag 🚩', 'Not a Red Flag ✅'],
    correctAnswer: 1,
    explanation: "Not a red flag! ✅ Equality is sexy, and so is financial responsibility. If you think someone paying for their own food is a red flag, the real red flag is your entitlement. Welcome to 2025, where we split bills and toxic expectations. 💅",
    points: 25,
  },
  {
    id: 'rf4',
    question: 'They get jealous when you hang out with friends',
    options: ['Red Flag 🚩', 'Not a Red Flag ✅'],
    correctAnswer: 0,
    explanation: "CRIMSON RED FLAG! 🚩 If they're jealous of your friends, wait until they meet your houseplants. This is controlling behavior disguised as 'caring.' Run faster than they can say 'but I just love you so much.' 🏃‍♀️💨",
    points: 25,
  },
];

const AM_I_FOOL_QUESTIONS: GameQuestion[] = [
  {
    id: 'aif1',
    question: 'Someone spent their rent money on crypto because "it\'s going to the moon"',
    options: ['Foolish 🤡', 'Smart Move 🧠'],
    correctAnswer: 0,
    explanation: "FOOLISH! 🤡 The only thing going to the moon is their debt. Crypto bros really said 'who needs shelter when you have digital coins?' Hope those diamond hands keep you warm when you're homeless. 💎🏠❌",
    points: 25,
  },
  {
    id: 'aif2',
    question: 'Someone quit their job to become a full-time influencer with 200 followers',
    options: ['Foolish 🤡', 'Smart Move 🧠'],
    correctAnswer: 0,
    explanation: "PEAK FOOLISHNESS! 🤡 200 followers? That's not influence, that's just your family feeling sorry for you. The only thing you're influencing is your bank account... to hit zero. Time to influence yourself back to the job market. 📉",
    points: 25,
  },
  {
    id: 'aif3',
    question: 'Someone bought a house they couldn\'t afford because "YOLO"',
    options: ['Foolish 🤡', 'Smart Move 🧠'],
    correctAnswer: 0,
    explanation: "FINANCIALLY FOOLISH! 🤡 YOLO turned into YODO (You Only Default Once). That dream house became a nightmare faster than you can say 'foreclosure.' The bank is about to teach you that YOLO has consequences. 🏠💸",
    points: 25,
  },
  {
    id: 'aif4',
    question: 'Someone got back together with their ex for the 5th time',
    options: ['Foolish 🤡', 'Smart Move 🧠'],
    correctAnswer: 0,
    explanation: "EMOTIONALLY FOOLISH! 🤡 At this point, you're not dating - you're stuck in a toxic time loop. Einstein said insanity is doing the same thing and expecting different results. Congratulations, you've achieved scientific levels of delusion! 🔄💔",
    points: 25,
  },
];

const WHEEL_CATEGORIES: WheelCategory[] = [
  {
    id: 'love-life',
    name: 'Love Life',
    emoji: '💔',
    color: '#EF4444',
    roasts: [
      "Your dating history is like a Netflix series that got canceled after one season - lots of buildup but zero satisfying conclusion.",
      "You're the type to think 'ghosting' is a legitimate dating strategy and your idea of romance is remembering their name on the second date!",
      "Your love life has more plot holes than a B-movie script. Even your imaginary relationships need therapy.",
    ],
  },
  {
    id: 'career',
    name: 'Career',
    emoji: '📈',
    color: '#3B82F6',
    roasts: [
      "Your career trajectory is flatter than a pancake that's been run over by a steamroller. Twice.",
      "You're climbing the corporate ladder so slowly, snails are passing you with briefcases.",
      "Your LinkedIn profile reads like a participation trophy collection. 'Enthusiastic team player' = unemployed.",
    ],
  },
  {
    id: 'texting-fails',
    name: 'Texting Fails',
    emoji: '📱',
    color: '#10B981',
    roasts: [
      "Your texting game is weaker than gas station coffee. 'K' is not a conversation, it's an assassination.",
      "You reply to texts with the enthusiasm of a DMV employee on their last day before retirement.",
      "Your autocorrect has given up trying to fix your messages. Even AI thinks you're hopeless.",
    ],
  },
  {
    id: 'cringe-moments',
    name: 'Cringe Moments',
    emoji: '😳',
    color: '#F59E0B',
    roasts: [
      "Your cringe level is so high, it has its own gravitational pull. Scientists are studying you.",
      "You make awkward turtles look socially confident. Your cringe moments have their own Netflix documentary.",
      "The secondhand embarrassment from your stories could power a small city for a week.",
    ],
  },
  {
    id: 'ghosted',
    name: 'Ghosted',
    emoji: '👻',
    color: '#8B5CF6',
    roasts: [
      "You've been ghosted so many times, Casper filed a restraining order. Your dating app should come with a séance feature.",
      "People disappear from your life faster than your motivation on Monday morning.",
      "You're not getting ghosted, you're getting the full Houdini experience - now you see them, now you don't!",
    ],
  },
  {
    id: 'family-drama',
    name: 'Family Drama',
    emoji: '🏠',
    color: '#EC4899',
    roasts: [
      "Your family gatherings have more drama than a telenovela. The turkey isn't the only thing getting roasted at dinner.",
      "Your family tree needs pruning. Some of those branches are definitely dead weight.",
      "Family therapy sessions for your clan would require a stadium and a team of professional mediators.",
    ],
  },
];

const PREMIUM_CATEGORIES: WheelCategory[] = [
  {
    id: 'ex-stories',
    name: 'Ex Stories',
    emoji: '💀',
    color: '#DC2626',
    roasts: [
      "Your ex stories are so wild, they should come with a disclaimer and a therapist's business card.",
      "You collect exes like Pokémon cards, except these ones all have emotional damage and trust issues.",
    ],
  },
  {
    id: 'bad-decisions',
    name: 'Bad Decisions',
    emoji: '🤡',
    color: '#7C3AED',
    roasts: [
      "Your decision-making skills are so questionable, Magic 8-Balls refuse to work for you.",
      "You make choices like you're playing life on expert mode with a blindfold and broken controller.",
    ],
  },
];

export default function GamesTab() {
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [gameSession, setGameSession] = useState<GameSession | null>(null);
  const [showSpinModal, setShowSpinModal] = useState(false);
  const [isSpinning, setIsSpinning] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<WheelCategory | null>(null);
  const [currentRoast, setCurrentRoast] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isPremium, setIsPremium] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  const wheelRotation = useRef(new Animated.Value(0)).current;
  const resultAnimation = useRef(new Animated.Value(0)).current;
  const cardAnimations = useRef(
    GAMES.reduce((acc, game) => {
      acc[game.id] = new Animated.Value(0);
      return acc;
    }, {} as Record<string, Animated.Value>)
  ).current;

  // Track if component is mounted to prevent state updates on unmounted component
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    
    // Stagger card animations on mount
    GAMES.forEach((game, index) => {
      const timeout = setTimeout(() => {
        if (isMountedRef.current) {
          Animated.timing(cardAnimations[game.id], {
            toValue: 1,
            duration: 500,
            delay: index * 100,
            useNativeDriver: true,
          }).start();
        }
      }, index * 100);
    });

    return () => {
      isMountedRef.current = false;
    };
  }, []);

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

  const getQuestionsForGame = (gameId: string): GameQuestion[] => {
    switch (gameId) {
      case 'lie-detector':
        return LIE_DETECTOR_QUESTIONS;
      case 'red-flag-radar':
        return RED_FLAG_QUESTIONS;
      case 'am-i-fool':
        return AM_I_FOOL_QUESTIONS;
      default:
        return [];
    }
  };

  const startGame = (game: Game) => {
    if (game.playsLeft === 0 && game.isPremium) {
      setShowPremiumModal(true);
      return;
    }

    if (game.playsLeft === 0) {
      Alert.alert('No Plays Left! 😭', 'Come back tomorrow for more games, or upgrade to Premium!');
      return;
    }

    if (game.id === 'spin-the-roast') {
      setSelectedGame(game);
      setShowSpinModal(true);
      setShowResult(false);
      setSelectedCategory(null);
      setCurrentRoast('');
    } else {
      // Start question-based game
      const questions = getQuestionsForGame(game.id);
      setSelectedGame(game);
      setGameSession({
        currentRound: 1,
        score: 0,
        isActive: true,
        gameType: game.id,
        questions: questions,
        currentQuestionIndex: 0,
        selectedAnswer: null,
        showExplanation: false,
        gameComplete: false,
      });
    }
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (!gameSession || gameSession.selectedAnswer !== null) return;

    const currentQuestion = gameSession.questions[gameSession.currentQuestionIndex];
    const isCorrect = answerIndex === currentQuestion.correctAnswer;
    const pointsEarned = isCorrect ? 25 : 0;

    setGameSession({
      ...gameSession,
      selectedAnswer: answerIndex,
      showExplanation: true,
      score: gameSession.score + pointsEarned,
    });
  };

  const nextQuestion = () => {
    if (!gameSession) return;

    const nextIndex = gameSession.currentQuestionIndex + 1;
    
    if (nextIndex >= gameSession.questions.length) {
      // Game complete
      setGameSession({
        ...gameSession,
        gameComplete: true,
      });
    } else {
      // Next question
      setGameSession({
        ...gameSession,
        currentQuestionIndex: nextIndex,
        currentRound: nextIndex + 1,
        selectedAnswer: null,
        showExplanation: false,
      });
    }
  };

  const restartGame = () => {
    if (!selectedGame) return;
    
    const questions = getQuestionsForGame(selectedGame.id);
    setGameSession({
      currentRound: 1,
      score: 0,
      isActive: true,
      gameType: selectedGame.id,
      questions: questions,
      currentQuestionIndex: 0,
      selectedAnswer: null,
      showExplanation: false,
      gameComplete: false,
    });
  };

  const exitGame = () => {
    setSelectedGame(null);
    setGameSession(null);
  };

  const shareScore = async () => {
    if (!gameSession || !selectedGame) return;

    const percentage = Math.round((gameSession.score / 100) * 100);
    const shareContent = {
      message: `I just scored ${gameSession.score}/100 (${percentage}%) on ${selectedGame.title}! 🎮\n\nCan you beat my score? Play on Roastify! 🔥`,
    };

    try {
      await Share.share(shareContent);
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const spinWheel = () => {
    if (isSpinning || !isMountedRef.current) return;

    setIsSpinning(true);
    setShowResult(false);
    triggerHaptic();

    // Calculate random rotation (3-5 full rotations + random segment)
    const baseRotations = 3 + Math.random() * 2; // 3-5 rotations
    const segmentAngle = 360 / WHEEL_CATEGORIES.length;
    const randomSegment = Math.floor(Math.random() * WHEEL_CATEGORIES.length);
    const finalRotation = baseRotations * 360 + randomSegment * segmentAngle;

    Animated.timing(wheelRotation, {
      toValue: finalRotation,
      duration: 3000,
      useNativeDriver: true,
    }).start(() => {
      if (!isMountedRef.current) return;
      
      // Determine which category was selected
      const normalizedRotation = finalRotation % 360;
      const selectedIndex = Math.floor(normalizedRotation / segmentAngle);
      const category = WHEEL_CATEGORIES[selectedIndex];
      
      setSelectedCategory(category);
      
      // Get random roast from category
      const randomRoast = category.roasts[Math.floor(Math.random() * category.roasts.length)];
      setCurrentRoast(randomRoast);
      
      // Show result with animation
      setShowResult(true);
      Animated.spring(resultAnimation, {
        toValue: 1,
        tension: 100,
        friction: 8,
        useNativeDriver: true,
      }).start();
      
      setIsSpinning(false);
      triggerHaptic();
    });
  };

  const shareRoast = async () => {
    if (!selectedCategory || !currentRoast) return;

    const shareContent = {
      message: `${selectedCategory.emoji} ${selectedCategory.name} Roast:\n\n"${currentRoast}"\n\n- Roasted by Roastify 🔥`,
    };

    try {
      await Share.share(shareContent);
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const resetSpin = () => {
    if (!isMountedRef.current) return;
    
    setShowResult(false);
    setSelectedCategory(null);
    setCurrentRoast('');
    resultAnimation.setValue(0);
  };

  const renderWheelSegment = (category: WheelCategory, index: number) => {
    const segmentAngle = 360 / WHEEL_CATEGORIES.length;
    const rotation = index * segmentAngle;
    
    return (
      <View
        key={category.id}
        style={[
          styles.wheelSegment,
          {
            backgroundColor: category.color,
            transform: [{ rotate: `${rotation}deg` }],
          },
        ]}
      >
        <View style={styles.segmentContent}>
          <Text style={styles.segmentEmoji}>{category.emoji}</Text>
          <Text style={styles.segmentText}>{category.name}</Text>
        </View>
      </View>
    );
  };

  const renderGameModal = () => {
    if (!selectedGame || !gameSession) return null;

    const currentQuestion = gameSession.questions[gameSession.currentQuestionIndex];
    const isCorrect = gameSession.selectedAnswer === currentQuestion?.correctAnswer;

    return (
      <Modal
        visible={true}
        animationType="slide"
        presentationStyle="fullScreen"
      >
        <SafeAreaView style={styles.modalContainer}>
          <LinearGradient
            colors={selectedGame.color}
            style={styles.modalHeader}
          >
            <TouchableOpacity
              style={styles.closeButton}
              onPress={exitGame}
            >
              <X size={24} color="#FFFFFF" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{selectedGame.icon} {selectedGame.title}</Text>
            <View style={styles.headerSpacer} />
          </LinearGradient>

          <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
            {gameSession.gameComplete ? (
              // Game Complete Screen
              <View style={styles.gameCompleteContainer}>
                <Text style={styles.gameCompleteTitle}>Game Complete! 🎉</Text>
                <Text style={styles.finalScore}>Final Score: {gameSession.score}/100</Text>
                <Text style={styles.scorePercentage}>
                  {Math.round((gameSession.score / 100) * 100)}% Accuracy
                </Text>
                
                <View style={styles.scoreBreakdown}>
                  <Text style={styles.breakdownTitle}>Score Breakdown:</Text>
                  <Text style={styles.breakdownText}>
                    Correct Answers: {gameSession.score / 25}/4
                  </Text>
                  <Text style={styles.breakdownText}>
                    Points per Correct: 25
                  </Text>
                </View>

                <View style={styles.gameCompleteActions}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.shareButton]}
                    onPress={shareScore}
                  >
                    <Share2 size={16} color="#FFFFFF" />
                    <Text style={styles.actionButtonText}>Share Score</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.actionButton, styles.restartButton]}
                    onPress={restartGame}
                  >
                    <RotateCcw size={16} color="#FFFFFF" />
                    <Text style={styles.actionButtonText}>Play Again</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ) : (
              // Game Question Screen
              <View style={styles.gameContainer}>
                <View style={styles.gameProgress}>
                  <Text style={styles.progressText}>
                    Question {gameSession.currentRound}/4
                  </Text>
                  <Text style={styles.scoreText}>
                    Score: {gameSession.score}/100
                  </Text>
                </View>

                <View style={styles.questionContainer}>
                  <Text style={styles.questionText}>{currentQuestion?.question}</Text>
                </View>

                <View style={styles.optionsContainer}>
                  {currentQuestion?.options.map((option, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.optionButton,
                        gameSession.selectedAnswer === index && (
                          isCorrect ? styles.correctOption : styles.incorrectOption
                        ),
                        gameSession.showExplanation && 
                        index === currentQuestion.correctAnswer && 
                        styles.correctOption,
                      ]}
                      onPress={() => handleAnswerSelect(index)}
                      disabled={gameSession.selectedAnswer !== null}
                    >
                      <Text style={[
                        styles.optionText,
                        gameSession.selectedAnswer === index && styles.selectedOptionText,
                        gameSession.showExplanation && 
                        index === currentQuestion.correctAnswer && 
                        styles.selectedOptionText,
                      ]}>
                        {option}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {gameSession.showExplanation && (
                  <View style={styles.explanationContainer}>
                    <View style={styles.explanationBubble}>
                      <Text style={styles.explanationText}>
                        {currentQuestion?.explanation}
                      </Text>
                    </View>
                    
                    <TouchableOpacity
                      style={styles.nextButton}
                      onPress={nextQuestion}
                    >
                      <Text style={styles.nextButtonText}>
                        {gameSession.currentQuestionIndex >= gameSession.questions.length - 1 
                          ? 'Finish Game' 
                          : 'Next Question'
                        }
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    );
  };

  const renderSpinModal = () => (
    <Modal
      visible={showSpinModal}
      animationType="slide"
      presentationStyle="fullScreen"
    >
      <SafeAreaView style={styles.modalContainer}>
        <LinearGradient
          colors={['#10B981', '#34D399']}
          style={styles.modalHeader}
        >
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setShowSpinModal(false)}
          >
            <X size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.modalTitle}>🎯 Spin the Roast</Text>
          <View style={styles.headerSpacer} />
        </LinearGradient>

        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
          <View style={styles.wheelContainer}>
            <Text style={styles.instructionText}>
              Spin the wheel to get your random roast category!
            </Text>

            <View style={styles.wheelWrapper}>
              <Animated.View
                style={[
                  styles.wheel,
                  {
                    transform: [
                      {
                        rotate: wheelRotation.interpolate({
                          inputRange: [0, 360],
                          outputRange: ['0deg', '360deg'],
                        }),
                      },
                    ],
                  },
                ]}
              >
                {WHEEL_CATEGORIES.map((category, index) => 
                  renderWheelSegment(category, index)
                )}
                
                <View style={styles.wheelCenter}>
                  <Text style={styles.wheelCenterText}>🎯</Text>
                </View>
              </Animated.View>
              
              <View style={styles.wheelPointer}>
                <View style={styles.pointerTriangle} />
              </View>
            </View>

            <TouchableOpacity
              style={[
                styles.spinButton,
                isSpinning && styles.spinButtonDisabled,
              ]}
              onPress={spinWheel}
              disabled={isSpinning}
            >
              <Text style={styles.spinButtonText}>
                {isSpinning ? 'Spinning...' : 'Spin the Wheel'}
              </Text>
            </TouchableOpacity>
          </View>

          {showResult && selectedCategory && (
            <Animated.View
              style={[
                styles.resultContainer,
                {
                  opacity: resultAnimation,
                  transform: [
                    {
                      scale: resultAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.8, 1],
                      }),
                    },
                  ],
                },
              ]}
            >
              <LinearGradient
                colors={[selectedCategory.color + '20', selectedCategory.color + '10']}
                style={styles.resultCard}
              >
                <View style={styles.resultHeader}>
                  <Text style={styles.resultEmoji}>{selectedCategory.emoji}</Text>
                  <Text style={styles.resultCategory}>{selectedCategory.name} Roast:</Text>
                </View>
                
                <View style={styles.roastBubble}>
                  <View style={styles.roastTail} />
                  <Text style={styles.roastText}>{currentRoast}</Text>
                </View>

                <View style={styles.resultActions}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.shareButton]}
                    onPress={shareRoast}
                  >
                    <Share2 size={16} color="#FFFFFF" />
                    <Text style={styles.actionButtonText}>Share Roast</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[styles.actionButton, styles.spinAgainButton]}
                    onPress={resetSpin}
                  >
                    <RotateCcw size={16} color="#FFFFFF" />
                    <Text style={styles.actionButtonText}>Spin Again</Text>
                  </TouchableOpacity>
                </View>

                {!isPremium && (
                  <TouchableOpacity style={styles.voiceRoastButton}>
                    <View style={styles.voiceRoastContent}>
                      <Volume2 size={16} color="#8B5CF6" />
                      <Text style={styles.voiceRoastText}>
                        Unlock voice roasts with Premium
                      </Text>
                      <Lock size={14} color="#8B5CF6" />
                    </View>
                  </TouchableOpacity>
                )}
              </LinearGradient>
            </Animated.View>
          )}
        </ScrollView>
      </SafeAreaView>
    </Modal>
  );

  const renderPremiumModal = () => (
    <Modal
      visible={showPremiumModal}
      transparent
      animationType="fade"
    >
      <View style={styles.premiumModalOverlay}>
        <View style={styles.premiumModalContent}>
          <LinearGradient
            colors={['#FFD700', '#FFA500']}
            style={styles.premiumModalHeader}
          >
            <Text style={styles.premiumModalIcon}>👑</Text>
            <Text style={styles.premiumModalTitle}>Upgrade to Premium</Text>
          </LinearGradient>
          
          <View style={styles.premiumModalBody}>
            <Text style={styles.premiumModalSubtitle}>
              You've used all your free plays for today. Upgrade to get more plays and exclusive features!
            </Text>
            
            <View style={styles.premiumFeatures}>
              <Text style={styles.premiumFeaturesTitle}>Premium Benefits:</Text>
              <View style={styles.featureItem}>
                <Text style={styles.featureCheck}>✓</Text>
                <Text style={styles.featureText}>10 game plays daily</Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureCheck}>✓</Text>
                <Text style={styles.featureText}>Voice roasts (hear your roasts read aloud)</Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureCheck}>✓</Text>
                <Text style={styles.featureText}>Exclusive premium-only games</Text>
              </View>
              <View style={styles.featureItem}>
                <Text style={styles.featureCheck}>✓</Text>
                <Text style={styles.featureText}>Ad-free experience</Text>
              </View>
            </View>
            
            <TouchableOpacity
              style={styles.upgradeButton}
              onPress={() => {
                setShowPremiumModal(false);
                setIsPremium(true);
                Alert.alert('Success! 🎉', 'Welcome to Premium! Enjoy all the exclusive features.');
              }}
            >
              <Text style={styles.upgradeButtonText}>Upgrade for $4.99/month</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.maybeLaterButton}
              onPress={() => setShowPremiumModal(false)}
            >
              <Text style={styles.maybeLaterText}>Maybe Later</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🎮 Roast Games</Text>
        <Text style={styles.headerSubtitle}>Get entertained, get roasted</Text>
        
        <View style={styles.headerStats}>
          <View style={styles.playsLeftBadge}>
            <Play size={16} color="#6B7280" />
            <Text style={styles.playsLeftText}>
              <Text style={styles.playsLeftNumber}>4/4</Text> plays left
            </Text>
          </View>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stats Section */}
        <View style={styles.statsSection}>
          <View style={styles.statCard}>
            <Trophy size={24} color="#FFD700" />
            <Text style={styles.statValue}>1,234</Text>
            <Text style={styles.statLabel}>Total Points</Text>
          </View>
          <View style={styles.statCard}>
            <Target size={24} color="#FF6B6B" />
            <Text style={styles.statValue}>67%</Text>
            <Text style={styles.statLabel}>Accuracy</Text>
          </View>
          <View style={styles.statCard}>
            <Zap size={24} color="#4ECDC4" />
            <Text style={styles.statValue}>12</Text>
            <Text style={styles.statLabel}>Streak</Text>
          </View>
        </View>

        {/* Games Grid */}
        <Text style={styles.sectionTitle}>Available Games 🎯</Text>
        
        <View style={styles.gamesGrid}>
          {GAMES.map((game) => (
            <Animated.View
              key={game.id}
              style={[
                styles.gameCardWrapper,
                {
                  opacity: cardAnimations[game.id],
                  transform: [
                    {
                      translateY: cardAnimations[game.id].interpolate({
                        inputRange: [0, 1],
                        outputRange: [50, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              <TouchableOpacity
                style={[
                  styles.gameCard,
                  game.playsLeft === 0 && !game.isPremium && styles.disabledCard,
                ]}
                onPress={() => startGame(game)}
                disabled={game.playsLeft === 0 && !game.isPremium}
              >
                <LinearGradient
                  colors={game.color}
                  style={styles.gameCardGradient}
                >
                  <View style={styles.gameCardContent}>
                    <Text style={styles.gameIcon}>{game.icon}</Text>
                    <Text style={styles.gameTitle}>{game.title}</Text>
                    <Text style={styles.gameDescription}>{game.description}</Text>
                    
                    <TouchableOpacity
                      style={styles.playButton}
                      onPress={() => startGame(game)}
                    >
                      <Text style={styles.playButtonText}>Play</Text>
                    </TouchableOpacity>
                  </View>
                </LinearGradient>
                
                <View style={styles.gameCardFooter}>
                  <View style={styles.popularityBadge}>
                    <Trophy size={12} color="#6B7280" />
                    <Text style={styles.popularityText}>#{game.popularity} Popular</Text>
                  </View>
                  <View style={styles.likesBadge}>
                    <Heart size={12} color="#6B7280" />
                    <Text style={styles.likesText}>{game.likes}</Text>
                  </View>
                </View>

                {game.playsLeft === 0 && !game.isPremium && (
                  <View style={styles.noPlaysOverlay}>
                    <Lock size={24} color="#FFFFFF" />
                    <Text style={styles.noPlaysText}>Tomorrow</Text>
                  </View>
                )}
              </TouchableOpacity>
            </Animated.View>
          ))}
        </View>

        {/* Leaderboard */}
        <View style={styles.leaderboardSection}>
          <Text style={styles.sectionTitle}>🏆 Top Roasters</Text>
          <View style={styles.leaderboardCard}>
            <View style={styles.leaderboardItem}>
              <View style={styles.leaderboardRank}>
                <Text style={styles.rankNumber}>1</Text>
              </View>
              <View style={styles.leaderboardInfo}>
                <Text style={styles.leaderboardName}>Jessica Williams</Text>
                <Text style={styles.leaderboardPoints}>12,450 points</Text>
              </View>
              <View style={styles.championBadge}>
                <Text style={styles.championText}>Champion</Text>
              </View>
            </View>
            
            <View style={styles.leaderboardItem}>
              <View style={[styles.leaderboardRank, styles.secondPlace]}>
                <Text style={styles.rankNumber}>2</Text>
              </View>
              <View style={styles.leaderboardInfo}>
                <Text style={styles.leaderboardName}>Michael Chen</Text>
                <Text style={styles.leaderboardPoints}>10,280 points</Text>
              </View>
              <View style={styles.expertBadge}>
                <Text style={styles.expertText}>Expert</Text>
              </View>
            </View>
            
            <View style={styles.leaderboardItem}>
              <View style={[styles.leaderboardRank, styles.thirdPlace]}>
                <Text style={styles.rankNumber}>3</Text>
              </View>
              <View style={styles.leaderboardInfo}>
                <Text style={styles.leaderboardName}>Olivia Rodriguez</Text>
                <Text style={styles.leaderboardPoints}>9,875 points</Text>
              </View>
              <View style={styles.risingStarBadge}>
                <Text style={styles.risingStarText}>Rising Star</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Premium Banner */}
        {!isPremium && (
          <TouchableOpacity
            style={styles.premiumBanner}
            onPress={() => setShowPremiumModal(true)}
          >
            <LinearGradient
              colors={['#FF6B6B', '#6B8CFF']}
              style={styles.premiumBannerGradient}
            >
              <View style={styles.premiumBannerContent}>
                <Text style={styles.premiumBannerIcon}>👑</Text>
                <View style={styles.premiumBannerText}>
                  <Text style={styles.premiumBannerTitle}>Upgrade to Premium</Text>
                  <Text style={styles.premiumBannerSubtitle}>
                    Get 10 daily plays + voice roasts!
                  </Text>
                </View>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        )}
      </ScrollView>

      {renderGameModal()}
      {renderSpinModal()}
      {renderPremiumModal()}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 20,
    paddingTop: 40,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 4,
  },
  headerStats: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  playsLeftBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  playsLeftText: {
    fontSize: 14,
    color: '#6B7280',
  },
  playsLeftNumber: {
    fontWeight: '600',
    color: '#1F2937',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  statsSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  gamesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  gameCardWrapper: {
    width: '48%',
    marginBottom: 16,
  },
  gameCard: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  disabledCard: {
    opacity: 0.6,
  },
  gameCardGradient: {
    padding: 16,
    minHeight: 140,
  },
  gameCardContent: {
    alignItems: 'center',
    flex: 1,
  },
  gameIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  gameTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 4,
  },
  gameDescription: {
    fontSize: 11,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.9,
    marginBottom: 12,
    lineHeight: 14,
  },
  playButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    marginTop: 'auto',
  },
  playButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  gameCardFooter: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  popularityBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  popularityText: {
    fontSize: 10,
    color: '#6B7280',
  },
  likesBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  likesText: {
    fontSize: 10,
    color: '#6B7280',
  },
  noPlaysOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  noPlaysText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4,
  },
  leaderboardSection: {
    marginBottom: 24,
  },
  leaderboardCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  leaderboardItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  leaderboardRank: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF6B6B',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  secondPlace: {
    backgroundColor: '#6B7280',
  },
  thirdPlace: {
    backgroundColor: '#6B7280',
  },
  rankNumber: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
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
  championBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  championText: {
    fontSize: 10,
    color: '#D97706',
    fontWeight: '600',
  },
  expertBadge: {
    backgroundColor: '#DBEAFE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  expertText: {
    fontSize: 10,
    color: '#2563EB',
    fontWeight: '600',
  },
  risingStarBadge: {
    backgroundColor: '#D1FAE5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  risingStarText: {
    fontSize: 10,
    color: '#059669',
    fontWeight: '600',
  },
  premiumBanner: {
    marginBottom: 40,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  premiumBannerGradient: {
    padding: 20,
  },
  premiumBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  premiumBannerIcon: {
    fontSize: 32,
    marginRight: 16,
  },
  premiumBannerText: {
    flex: 1,
  },
  premiumBannerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  premiumBannerSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.9,
    marginTop: 2,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingTop: 40,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerSpacer: {
    width: 32,
  },
  modalContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  // Game Modal Styles
  gameContainer: {
    paddingVertical: 20,
  },
  gameProgress: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  progressText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
  },
  scoreText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B6B',
  },
  questionContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  questionText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
    lineHeight: 26,
    textAlign: 'center',
  },
  optionsContainer: {
    gap: 12,
    marginBottom: 24,
  },
  optionButton: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: '#E5E7EB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  correctOption: {
    borderColor: '#10B981',
    backgroundColor: '#D1FAE5',
  },
  incorrectOption: {
    borderColor: '#EF4444',
    backgroundColor: '#FEF2F2',
  },
  optionText: {
    fontSize: 16,
    color: '#1F2937',
    textAlign: 'center',
    fontWeight: '500',
  },
  selectedOptionText: {
    fontWeight: '600',
  },
  explanationContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  explanationBubble: {
    backgroundColor: '#F3F4F6',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    position: 'relative',
  },
  explanationText: {
    fontSize: 15,
    lineHeight: 22,
    color: '#1F2937',
    fontWeight: '500',
  },
  nextButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  nextButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  gameCompleteContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  gameCompleteTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 16,
  },
  finalScore: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginBottom: 8,
  },
  scorePercentage: {
    fontSize: 18,
    color: '#6B7280',
    marginBottom: 24,
  },
  scoreBreakdown: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  breakdownTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  breakdownText: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 4,
  },
  gameCompleteActions: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 6,
  },
  shareButton: {
    backgroundColor: '#6B7280',
  },
  restartButton: {
    backgroundColor: '#FF6B6B',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  // Wheel Styles
  wheelContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  instructionText: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  wheelWrapper: {
    position: 'relative',
    marginBottom: 32,
  },
  wheel: {
    width: 240,
    height: 240,
    borderRadius: 120,
    backgroundColor: '#FFFFFF',
    borderWidth: 4,
    borderColor: '#E5E7EB',
    overflow: 'hidden',
    position: 'relative',
  },
  wheelSegment: {
    position: 'absolute',
    width: '50%',
    height: '50%',
    transformOrigin: 'bottom center',
  },
  segmentContent: {
    position: 'absolute',
    top: '25%',
    left: '50%',
    transform: [{ translateX: -12 }, { translateY: -12 }],
    alignItems: 'center',
  },
  segmentEmoji: {
    fontSize: 16,
    marginBottom: 2,
  },
  segmentText: {
    fontSize: 8,
    color: '#FFFFFF',
    fontWeight: '600',
    textAlign: 'center',
  },
  wheelCenter: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ translateX: -24 }, { translateY: -24 }],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  wheelCenterText: {
    fontSize: 20,
  },
  wheelPointer: {
    position: 'absolute',
    top: -8,
    left: '50%',
    transform: [{ translateX: -8 }],
  },
  pointerTriangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 16,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: '#FF6B6B',
  },
  spinButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  spinButtonDisabled: {
    opacity: 0.6,
  },
  spinButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  resultContainer: {
    marginTop: 24,
    marginBottom: 40,
  },
  resultCard: {
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  resultHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  resultEmoji: {
    fontSize: 24,
    marginRight: 8,
  },
  resultCategory: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  roastBubble: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
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
    fontSize: 14,
    lineHeight: 20,
    color: '#1F2937',
  },
  resultActions: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  spinAgainButton: {
    backgroundColor: '#FF6B6B',
  },
  voiceRoastButton: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    padding: 12,
  },
  voiceRoastContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  voiceRoastText: {
    fontSize: 12,
    color: '#8B5CF6',
    fontWeight: '500',
  },
  // Premium Modal Styles
  premiumModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  premiumModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    width: '100%',
    maxWidth: 400,
  },
  premiumModalHeader: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  premiumModalIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  premiumModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  premiumModalBody: {
    padding: 24,
  },
  premiumModalSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  premiumFeatures: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  premiumFeaturesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureCheck: {
    color: '#10B981',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  featureText: {
    fontSize: 14,
    color: '#374151',
    flex: 1,
  },
  upgradeButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  upgradeButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  maybeLaterButton: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  maybeLaterText: {
    color: '#6B7280',
    fontSize: 16,
    fontWeight: '600',
  },
});