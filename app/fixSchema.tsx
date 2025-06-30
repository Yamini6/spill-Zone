import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { ArrowLeft, Database, TriangleAlert as AlertTriangle, CircleCheck as CheckCircle } from 'lucide-react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';

export default function FixSchema() {
  const [isFixing, setIsFixing] = useState(false);
  const [results, setResults] = useState<string[]>([]);

  const addResult = (message: string) => {
    setResults(prev => [...prev, message]);
  };

  const fixSchema = async () => {
    setIsFixing(true);
    setResults([]);
    
    try {
      addResult('🔧 Starting schema fix...');

      // First, let's check what tables exist
      addResult('📋 Checking existing tables...');
      
      const { data: tables, error: tablesError } = await supabase
        .rpc('get_table_names');

      if (tablesError) {
        addResult(`❌ Could not check tables: ${tablesError.message}`);
      }

      // Try to create the tables with the correct schema
      addResult('🏗️ Creating/updating tables...');

      // Create users table with correct schema
      const createUsersSQL = `
        CREATE TABLE IF NOT EXISTS users (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          handle text UNIQUE NOT NULL,
          is_premium boolean DEFAULT false,
          stats jsonb DEFAULT '{
            "roastPoints": 0,
            "postsShared": 0,
            "gamesWon": 0,
            "dayStreak": 0,
            "totalRoasts": 0,
            "favoriteTag": "#Ghosted"
          }'::jsonb,
          created_at timestamptz DEFAULT now()
        );
      `;

      const { error: usersError } = await supabase.rpc('exec_sql', { 
        sql: createUsersSQL 
      });

      if (usersError) {
        addResult(`❌ Users table error: ${usersError.message}`);
      } else {
        addResult('✅ Users table created/verified');
      }

      // Create confessions table
      const createConfessionsSQL = `
        CREATE TABLE IF NOT EXISTS confessions (
          id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
          content text NOT NULL,
          tag text NOT NULL,
          roast text NOT NULL,
          reactions jsonb DEFAULT '{
            "laugh": 0,
            "skull": 0,
            "shocked": 0,
            "cry": 0
          }'::jsonb,
          poll jsonb DEFAULT '{
            "you": 0,
            "them": 0,
            "both": 0
          }'::jsonb,
          user_id uuid REFERENCES users(id),
          created_at timestamptz DEFAULT now(),
          expires_at timestamptz DEFAULT now() + interval '24 hours'
        );
      `;

      const { error: confessionsError } = await supabase.rpc('exec_sql', { 
        sql: createConfessionsSQL 
      });

      if (confessionsError) {
        addResult(`❌ Confessions table error: ${confessionsError.message}`);
      } else {
        addResult('✅ Confessions table created/verified');
      }

      // Enable RLS
      addResult('🔒 Setting up Row Level Security...');
      
      const rlsSQL = `
        ALTER TABLE users ENABLE ROW LEVEL SECURITY;
        ALTER TABLE confessions ENABLE ROW LEVEL SECURITY;
        
        DROP POLICY IF EXISTS "Anyone can read confessions" ON confessions;
        DROP POLICY IF EXISTS "Anyone can insert confessions" ON confessions;
        DROP POLICY IF EXISTS "Anyone can update confessions" ON confessions;
        
        CREATE POLICY "Anyone can read confessions"
          ON confessions FOR SELECT TO anon, authenticated USING (true);
        
        CREATE POLICY "Anyone can insert confessions"
          ON confessions FOR INSERT TO anon, authenticated WITH CHECK (true);
          
        CREATE POLICY "Anyone can update confessions"
          ON confessions FOR UPDATE TO anon, authenticated USING (true);
      `;

      const { error: rlsError } = await supabase.rpc('exec_sql', { 
        sql: rlsSQL 
      });

      if (rlsError) {
        addResult(`⚠️ RLS setup warning: ${rlsError.message}`);
      } else {
        addResult('✅ Row Level Security configured');
      }

      addResult('🎉 Schema fix completed!');
      addResult('💡 Try running the debug tests again');

    } catch (error) {
      addResult(`❌ Fix failed: ${error}`);
    } finally {
      setIsFixing(false);
    }
  };

  const runManualSQL = () => {
    Alert.alert(
      'Manual SQL Setup',
      'Go to your Supabase dashboard → SQL Editor and run the migration files:\n\n1. supabase/migrations/20250630050902_old_feather.sql\n2. supabase/migrations/20250630050923_dawn_disk.sql\n\nThis will create all tables with the correct schema.',
      [
        { text: 'OK' }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#1F2937" />
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Fix Schema</Text>
        
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Warning */}
        <View style={styles.warningCard}>
          <AlertTriangle size={20} color="#F59E0B" />
          <View style={styles.warningContent}>
            <Text style={styles.warningTitle}>Schema Mismatch Detected</Text>
            <Text style={styles.warningText}>
              Your database schema doesn't match the expected structure. This usually happens when migrations weren't applied correctly.
            </Text>
          </View>
        </View>

        {/* Fix Options */}
        <View style={styles.optionsSection}>
          <Text style={styles.sectionTitle}>Fix Options</Text>
          
          <TouchableOpacity 
            style={styles.optionCard}
            onPress={runManualSQL}
          >
            <Database size={24} color="#6366F1" />
            <View style={styles.optionContent}>
              <Text style={styles.optionTitle}>Manual SQL Setup (Recommended)</Text>
              <Text style={styles.optionDescription}>
                Run the migration files directly in Supabase SQL Editor. This is the most reliable method.
              </Text>
            </View>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.optionCard, isFixing && styles.disabledCard]}
            onPress={fixSchema}
            disabled={isFixing}
          >
            <CheckCircle size={24} color={isFixing ? "#9CA3AF" : "#10B981"} />
            <View style={styles.optionContent}>
              <Text style={[styles.optionTitle, isFixing && styles.disabledText]}>
                {isFixing ? 'Fixing Schema...' : 'Auto Fix Schema'}
              </Text>
              <Text style={[styles.optionDescription, isFixing && styles.disabledText]}>
                Attempt to automatically create the correct table structure.
              </Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Results */}
        {results.length > 0 && (
          <View style={styles.resultsSection}>
            <Text style={styles.sectionTitle}>Results</Text>
            <View style={styles.resultsCard}>
              {results.map((result, index) => (
                <Text key={index} style={styles.resultText}>
                  {result}
                </Text>
              ))}
            </View>
          </View>
        )}

        {/* Manual Instructions */}
        <View style={styles.instructionsSection}>
          <Text style={styles.sectionTitle}>Manual Setup Instructions</Text>
          
          <View style={styles.instructionsCard}>
            <Text style={styles.instructionStep}>1. Go to your Supabase Dashboard</Text>
            <Text style={styles.instructionDetail}>
              Visit supabase.com → Your Project → SQL Editor
            </Text>
            
            <Text style={styles.instructionStep}>2. Run Migration Files</Text>
            <Text style={styles.instructionDetail}>
              Copy and paste the contents of these files in order:
            </Text>
            <Text style={styles.codeText}>
              • supabase/migrations/20250630050902_old_feather.sql{'\n'}
              • supabase/migrations/20250630050923_dawn_disk.sql
            </Text>
            
            <Text style={styles.instructionStep}>3. Verify Setup</Text>
            <Text style={styles.instructionDetail}>
              Go back to the Debug screen to verify everything is working.
            </Text>
          </View>
        </View>

        {/* Environment Check */}
        <View style={styles.envSection}>
          <Text style={styles.sectionTitle}>Environment Check</Text>
          
          <View style={styles.envCard}>
            <View style={styles.envItem}>
              <Text style={styles.envLabel}>Supabase URL:</Text>
              <Text style={styles.envValue}>
                {process.env.EXPO_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing'}
              </Text>
            </View>
            
            <View style={styles.envItem}>
              <Text style={styles.envLabel}>Anon Key:</Text>
              <Text style={styles.envValue}>
                {process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ? '✅ Set' : '❌ Missing'}
              </Text>
            </View>
            
            {(!process.env.EXPO_PUBLIC_SUPABASE_URL || !process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY) && (
              <Text style={styles.envWarning}>
                ⚠️ Make sure your .env file exists and contains your Supabase credentials
              </Text>
            )}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
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
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  warningCard: {
    flexDirection: 'row',
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  warningContent: {
    flex: 1,
  },
  warningTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#92400E',
    marginBottom: 4,
  },
  warningText: {
    fontSize: 14,
    color: '#92400E',
    lineHeight: 20,
  },
  optionsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  optionCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 12,
  },
  disabledCard: {
    opacity: 0.6,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 4,
  },
  optionDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  disabledText: {
    color: '#9CA3AF',
  },
  resultsSection: {
    marginBottom: 24,
  },
  resultsCard: {
    backgroundColor: '#1F2937',
    borderRadius: 8,
    padding: 16,
  },
  resultText: {
    fontSize: 12,
    color: '#F9FAFB',
    fontFamily: 'monospace',
    marginBottom: 4,
  },
  instructionsSection: {
    marginBottom: 24,
  },
  instructionsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  instructionStep: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginTop: 16,
    marginBottom: 4,
  },
  instructionDetail: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
    marginBottom: 8,
  },
  codeText: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#374151',
    backgroundColor: '#F3F4F6',
    padding: 8,
    borderRadius: 4,
    marginBottom: 8,
  },
  envSection: {
    marginBottom: 40,
  },
  envCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  envItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  envLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  envValue: {
    fontSize: 14,
    color: '#6B7280',
  },
  envWarning: {
    fontSize: 12,
    color: '#DC2626',
    marginTop: 8,
    fontStyle: 'italic',
  },
});