import React, { useState, useRef, useEffect } from 'react';
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
  Platform,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, Info, ChevronDown, ChevronUp, Lightbulb, Camera, X, Check, CircleAlert as AlertCircle, Loader as Loader2 } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useConfessions } from '@/hooks/useSupabase';

interface Tag {
  id: string;
  label: string;
  color: string;
}

const AVAILABLE_TAGS: Tag[] = [
  { id: 'red-flag', label: '#RedFlag', color: '#EF4444' },
  { id: 'betrayal', label: '#Betrayal', color: '#8B5CF6' },
  { id: 'boundaries', label: '#Boundaries', color: '#10B981' },
  { id: 'ungrateful', label: '#Ungrateful', color: '#F59E0B' },
  { id: 'communication', label: '#Communication', color: '#3B82F6' },
  { id: 'trust', label: '#Trust', color: '#EC4899' },
  { id: 'long-distance', label: '#LongDistance', color: '#6366F1' },
  { id: 'family', label: '#Family', color: '#84CC16' },
  { id: 'ghosted', label: '#Ghosted', color: '#6B7280' },
  { id: 'cringe-text', label: '#CringeText', color: '#F97316' },
];

// Simple AI roast generator for demo
const generateRoast = (content: string, tag: string): string => {
  const roastTemplates = {
    '#RedFlag': [
      "That's not a red flag, that's the whole Soviet Union parade 🚩",
      "Red flags are flying higher than a kite festival in this situation 🪁",
      "The red flags are so obvious, even colorblind people can see them 👀",
    ],
    '#Ghosted': [
      "They disappeared faster than your motivation on Monday morning 👻",
      "You got ghosted so hard, Casper filed a restraining order 💀",
      "They vanished like your will to live during finals week ✨",
    ],
    '#Betrayal': [
      "That betrayal hit harder than student loan payments 💸",
      "They really said 'trust me' and then chose violence 🔪",
      "The audacity is astronomical - NASA wants to study it 🚀",
    ],
    '#Boundaries': [
      "Your boundaries are more optional than terms of service agreements 📋",
      "They respect your boundaries like cats respect closed doors 🚪",
      "Setting boundaries with them is like using a chocolate teapot ☕",
    ],
    '#CringeText': [
      "That text was so cringe, it has its own gravitational pull 🌍",
      "The secondhand embarrassment could power a small city 🏙️",
      "You really typed that with your whole chest and hit send 📱",
    ],
    '#Ungrateful': [
      "Their gratitude is rarer than a unicorn with good credit 🦄",
      "They appreciate things like vampires appreciate garlic 🧄",
      "You could give them the moon and they'd complain about the craters 🌙",
    ],
  };

  const templates = roastTemplates[tag as keyof typeof roastTemplates] || roastTemplates['#CringeText'];
  const randomTemplate = templates[Math.floor(Math.random() * templates.length)];
  
  return randomTemplate;
};

export default function SubmitTab() {
  const [storyText, setStoryText] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [showGuidelines, setShowGuidelines] = useState(false);
  const [showTips, setShowTips] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showError, setShowError] = useState(false);

  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(-20)).current;

  const { createConfession } = useConfessions();

  useEffect(() => {
    // Animate page entrance
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleTagPress = (tagId: string) => {
    if (selectedTag === tagId) {
      // Deselect if already selected
      setSelectedTag(null);
    } else {
      // Replace current selection with new one
      setSelectedTag(tagId);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'We need camera roll permissions to add images.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled) {
      setSelectedImage(result.assets[0].uri);
    }
  };

  const removeImage = () => {
    setSelectedImage(null);
  };

  const handleSubmit = async () => {
    if (!storyText.trim()) {
      Alert.alert('Story Required', 'Please share your story before submitting.');
      return;
    }

    if (!selectedTag) {
      Alert.alert('Tag Required', 'Please select a category tag.');
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Find the selected tag object
      const tagObject = AVAILABLE_TAGS.find(tag => tag.id === selectedTag);
      const tagLabel = tagObject?.label || selectedTag;
      
      // Generate AI roast
      const roast = generateRoast(storyText, tagLabel);
      
      // Submit to Supabase
      const result = await createConfession({
        content: storyText.trim(),
        tag: tagLabel,
        roast: roast,
      });

      setIsSubmitting(false);

      if (result.success) {
        Alert.alert(
          'Story Submitted! 🎉',
          'Your story has been submitted and roasted by our AI. Check the feed to see your roast!',
          [
            {
              text: 'View Feed',
              onPress: () => router.push('/(tabs)'),
            },
          ]
        );
        
        // Reset form
        setStoryText('');
        setSelectedTag(null);
        setSelectedImage(null);
      } else {
        setShowError(true);
        setTimeout(() => setShowError(false), 5000);
        console.error('Submission failed:', result.error);
      }
    } catch (error) {
      setIsSubmitting(false);
      setShowError(true);
      setTimeout(() => setShowError(false), 5000);
      console.error('Submission error:', error);
    }
  };

  const isSubmitEnabled = storyText.trim().length > 0 && selectedTag !== null;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <Animated.View 
        style={[
          styles.header,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Submit Your Story</Text>
        
        <View style={styles.headerSpacer} />
      </Animated.View>

      <ScrollView 
        style={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View
          style={[
            styles.formContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }],
            },
          ]}
        >
          {/* Content Guidelines */}
          <View style={styles.guidelinesCard}>
            <TouchableOpacity
              style={styles.guidelinesHeader}
              onPress={() => setShowGuidelines(!showGuidelines)}
            >
              <View style={styles.guidelinesHeaderLeft}>
                <Info size={20} color="#6366F1" />
                <Text style={styles.guidelinesTitle}>Content Guidelines</Text>
              </View>
              {showGuidelines ? (
                <ChevronUp size={20} color="#6B7280" />
              ) : (
                <ChevronDown size={20} color="#6B7280" />
              )}
            </TouchableOpacity>
            
            {showGuidelines && (
              <View style={styles.guidelinesContent}>
                <View style={styles.guidelineItem}>
                  <Check size={16} color="#10B981" />
                  <Text style={styles.guidelineText}>
                    Share real relationship situations and dilemmas
                  </Text>
                </View>
                <View style={styles.guidelineItem}>
                  <Check size={16} color="#10B981" />
                  <Text style={styles.guidelineText}>
                    Be respectful and considerate of all parties involved
                  </Text>
                </View>
                <View style={styles.guidelineItem}>
                  <X size={16} color="#EF4444" />
                  <Text style={styles.guidelineText}>
                    No explicit content, hate speech, or personally identifiable information
                  </Text>
                </View>
                <View style={styles.guidelineItem}>
                  <X size={16} color="#EF4444" />
                  <Text style={styles.guidelineText}>
                    No promotion, advertising, or spam content
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Story Input */}
          <View style={styles.storySection}>
            <View style={styles.storyInputContainer}>
              <TextInput
                style={styles.storyInput}
                placeholder="Got a moment that haunts you at 3 AM? We need the tea..."
                placeholderTextColor="#9CA3AF"
                value={storyText}
                onChangeText={setStoryText}
                multiline
                maxLength={500}
                textAlignVertical="top"
              />
              <View style={styles.characterCounter}>
                <Text style={[
                  styles.characterCountText,
                  storyText.length >= 450 && styles.characterCountWarning,
                ]}>
                  {storyText.length}/500
                </Text>
              </View>
            </View>

            {/* Writing Tips */}
            <TouchableOpacity
              style={styles.tipsToggle}
              onPress={() => setShowTips(!showTips)}
            >
              <Lightbulb size={16} color="#6366F1" />
              <Text style={styles.tipsToggleText}>Writing tips</Text>
              {showTips ? (
                <ChevronUp size={16} color="#6366F1" />
              ) : (
                <ChevronDown size={16} color="#6366F1" />
              )}
            </TouchableOpacity>

            {showTips && (
              <View style={styles.tipsContent}>
                <View style={styles.tipItem}>
                  <Check size={14} color="#6366F1" />
                  <Text style={styles.tipText}>
                    Be clear and concise about your situation
                  </Text>
                </View>
                <View style={styles.tipItem}>
                  <Check size={14} color="#6366F1" />
                  <Text style={styles.tipText}>
                    Include relevant context but avoid unnecessary details
                  </Text>
                </View>
                <View style={styles.tipItem}>
                  <Check size={14} color="#6366F1" />
                  <Text style={styles.tipText}>
                    Focus on the specific relationship issue you want advice on
                  </Text>
                </View>
                <View style={styles.tipItem}>
                  <Check size={14} color="#6366F1" />
                  <Text style={styles.tipText}>
                    Consider what you've tried already and what you're hoping to achieve
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Category Tags */}
          <View style={styles.tagsSection}>
            <View style={styles.tagsSectionHeader}>
              <Text style={styles.tagsSectionTitle}>Select category</Text>
              <Text style={styles.tagsCounter}>{selectedTag ? '1/1' : '0/1'}</Text>
            </View>
            
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.tagsScrollContent}
            >
              {AVAILABLE_TAGS.map((tag) => (
                <TouchableOpacity
                  key={tag.id}
                  style={[
                    styles.tagButton,
                    selectedTag === tag.id && [
                      styles.selectedTagButton,
                      { backgroundColor: tag.color },
                    ],
                  ]}
                  onPress={() => handleTagPress(tag.id)}
                >
                  <Text style={[
                    styles.tagButtonText,
                    selectedTag === tag.id && styles.selectedTagButtonText,
                  ]}>
                    {tag.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Image Upload */}
          <View style={styles.imageSection}>
            {!selectedImage ? (
              <TouchableOpacity style={styles.imageUploadButton} onPress={pickImage}>
                <View style={styles.imageUploadIcon}>
                  <Camera size={24} color="#6366F1" />
                </View>
                <Text style={styles.imageUploadTitle}>Add an image (optional)</Text>
                <Text style={styles.imageUploadSubtitle}>JPEG, PNG • Max 5MB</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.imagePreviewContainer}>
                <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
                <TouchableOpacity style={styles.removeImageButton} onPress={removeImage}>
                  <X size={20} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </Animated.View>
      </ScrollView>

      {/* Fixed Bottom Actions */}
      <View style={styles.bottomActions}>
        {showError && (
          <View style={styles.errorMessage}>
            <AlertCircle size={16} color="#EF4444" />
            <View style={styles.errorMessageContent}>
              <Text style={styles.errorMessageTitle}>
                Submission failed, please give it another try.
              </Text>
              <Text style={styles.errorMessageSubtitle}>
                Don't worry, failed submissions don't cost credits.
              </Text>
            </View>
          </View>
        )}
        
        <TouchableOpacity
          style={[
            styles.submitButton,
            !isSubmitEnabled && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={!isSubmitEnabled || isSubmitting}
        >
          {isSubmitting ? (
            <View style={styles.submitButtonContent}>
              <Loader2 size={20} color="#FFFFFF" />
              <Text style={styles.submitButtonText}>Submitting...</Text>
            </View>
          ) : (
            <Text style={[
              styles.submitButtonText,
              !isSubmitEnabled && styles.submitButtonTextDisabled,
            ]}>
              Submit Story
            </Text>
          )}
        </TouchableOpacity>
        
        <Text style={styles.bottomNote}>
          Your story will be roasted by AI and appear in the feed
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
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
    borderBottomColor: '#F3F4F6',
  },
  backButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1F2937',
  },
  headerSpacer: {
    width: 32,
  },
  content: {
    flex: 1,
  },
  formContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 200,
  },
  guidelinesCard: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    marginBottom: 24,
    overflow: 'hidden',
  },
  guidelinesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  guidelinesHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  guidelinesTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  guidelinesContent: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 12,
  },
  guidelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  guidelineText: {
    fontSize: 13,
    color: '#6B7280',
    flex: 1,
    lineHeight: 18,
  },
  storySection: {
    marginBottom: 24,
  },
  storyInputContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
    marginBottom: 12,
  },
  storyInput: {
    fontSize: 16,
    color: '#1F2937',
    minHeight: 120,
    textAlignVertical: 'top',
  },
  characterCounter: {
    alignItems: 'flex-end',
    marginTop: 8,
  },
  characterCountText: {
    fontSize: 12,
    color: '#6B7280',
  },
  characterCountWarning: {
    color: '#EF4444',
  },
  tipsToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  tipsToggleText: {
    fontSize: 12,
    color: '#6366F1',
    fontWeight: '500',
  },
  tipsContent: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 16,
    marginTop: 12,
    gap: 12,
  },
  tipItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  tipText: {
    fontSize: 12,
    color: '#1E40AF',
    flex: 1,
    lineHeight: 16,
  },
  tagsSection: {
    marginBottom: 24,
  },
  tagsSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  tagsSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
  },
  tagsCounter: {
    fontSize: 12,
    color: '#6B7280',
  },
  tagsScrollContent: {
    paddingRight: 20,
    gap: 8,
  },
  tagButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#FFFFFF',
  },
  selectedTagButton: {
    borderColor: 'transparent',
  },
  tagButtonText: {
    fontSize: 12,
    color: '#6B7280',
    fontWeight: '500',
  },
  selectedTagButtonText: {
    color: '#FFFFFF',
  },
  imageSection: {
    marginBottom: 24,
  },
  imageUploadButton: {
    borderWidth: 2,
    borderColor: '#D1D5DB',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  imageUploadIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  imageUploadTitle: {
    fontSize: 14,
    fontWeight: '500',
    color: '#1F2937',
    marginBottom: 4,
  },
  imageUploadSubtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  imagePreviewContainer: {
    position: 'relative',
    borderRadius: 12,
    overflow: 'hidden',
  },
  imagePreview: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  removeImageButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomActions: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
    paddingHorizontal: 20,
    paddingVertical: 16,
    paddingBottom: Platform.OS === 'ios' ? 34 : 16,
  },
  errorMessage: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    gap: 8,
  },
  errorMessageContent: {
    flex: 1,
  },
  errorMessageTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#DC2626',
    marginBottom: 2,
  },
  errorMessageSubtitle: {
    fontSize: 12,
    color: '#6B7280',
  },
  submitButton: {
    backgroundColor: '#6366F1',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  submitButtonDisabled: {
    backgroundColor: '#E5E7EB',
  },
  submitButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  submitButtonTextDisabled: {
    color: '#9CA3AF',
  },
  bottomNote: {
    fontSize: 12,
    color: '#6B7280',
    textAlign: 'center',
  },
});