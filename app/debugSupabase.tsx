import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { ArrowLeft, CircleCheck as CheckCircle, Circle as XCircle, CircleAlert as AlertCircle, RefreshCw, Database, Wifi, Key } from 'lucide-react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';

interface TestResult {
  name: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  details?: any;
}

export default function DebugSupabase() {
  const [tests, setTests] = useState<TestResult[]>([
    { name: 'Environment Variables', status: 'pending', message: 'Checking...' },
    { name: 'Supabase Client', status: 'pending', message: 'Checking...' },
    { name: 'Database Connection', status: 'pending', message: 'Checking...' },
    { name: 'Users Table', status: 'pending', message: 'Checking...' },
    { name: 'Confessions Table', status: 'pending', message: 'Checking...' },
    { name: 'Insert Test', status: 'pending', message: 'Checking...' },
  ]);
  const [isRunning, setIsRunning] = useState(false);

  const updateTest = (index: number, status: TestResult['status'], message: string, details?: any) => {
    setTests(prev => prev.map((test, i) => 
      i === index ? { ...test, status, message, details } : test
    ));
  };

  const runTests = async () => {
    setIsRunning(true);
    
    // Reset all tests
    setTests(prev => prev.map(test => ({ ...test, status: 'pending', message: 'Checking...' })));

    try {
      // Test 1: Environment Variables
      const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
      const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
      
      if (!supabaseUrl || !supabaseKey) {
        updateTest(0, 'error', 'Missing environment variables', {
          url: supabaseUrl ? 'Set' : 'Missing',
          key: supabaseKey ? 'Set' : 'Missing'
        });
        setIsRunning(false);
        return;
      }
      
      updateTest(0, 'success', 'Environment variables found', {
        url: `${supabaseUrl.substring(0, 20)}...`,
        key: `${supabaseKey.substring(0, 20)}...`
      });

      // Test 2: Supabase Client
      try {
        if (!supabase) {
          updateTest(1, 'error', 'Supabase client not initialized');
          setIsRunning(false);
          return;
        }
        updateTest(1, 'success', 'Supabase client initialized');
      } catch (error) {
        updateTest(1, 'error', 'Failed to initialize Supabase client', error);
        setIsRunning(false);
        return;
      }

      // Test 3: Database Connection
      try {
        const { data, error } = await supabase
          .from('confessions')
          .select('count')
          .limit(1);
        
        if (error) {
          updateTest(2, 'error', `Connection failed: ${error.message}`, error);
        } else {
          updateTest(2, 'success', 'Database connection successful');
        }
      } catch (error) {
        updateTest(2, 'error', 'Network or connection error', error);
      }

      // Test 4: Users Table
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .limit(1);
        
        if (error) {
          updateTest(3, 'error', `Users table error: ${error.message}`, error);
        } else {
          updateTest(3, 'success', `Users table accessible (${data?.length || 0} records found)`);
        }
      } catch (error) {
        updateTest(3, 'error', 'Users table test failed', error);
      }

      // Test 5: Confessions Table
      try {
        const { data, error } = await supabase
          .from('confessions')
          .select('*')
          .limit(5);
        
        if (error) {
          updateTest(4, 'error', `Confessions table error: ${error.message}`, error);
        } else {
          updateTest(4, 'success', `Confessions table accessible (${data?.length || 0} records found)`, data);
        }
      } catch (error) {
        updateTest(4, 'error', 'Confessions table test failed', error);
      }

      // Test 6: Insert Test
      try {
        const testConfession = {
          content: 'Debug test confession - please ignore',
          tag: '#Debug',
          roast: 'This is a test roast for debugging purposes',
          reactions: { laugh: 0, skull: 0, shocked: 0, cry: 0 },
          poll: { you: 0, them: 0, both: 0 },
        };

        const { data, error } = await supabase
          .from('confessions')
          .insert([testConfession])
          .select()
          .single();
        
        if (error) {
          updateTest(5, 'error', `Insert failed: ${error.message}`, error);
        } else {
          updateTest(5, 'success', 'Insert test successful', data);
          
          // Clean up test data
          await supabase
            .from('confessions')
            .delete()
            .eq('id', data.id);
        }
      } catch (error) {
        updateTest(5, 'error', 'Insert test failed', error);
      }

    } catch (error) {
      console.error('Test suite error:', error);
    } finally {
      setIsRunning(false);
    }
  };

  useEffect(() => {
    runTests();
  }, []);

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle size={20} color="#10B981" />;
      case 'error':
        return <XCircle size={20} color="#EF4444" />;
      default:
        return <AlertCircle size={20} color="#F59E0B" />;
    }
  };

  const getStatusColor = (status: TestResult['status']) => {
    switch (status) {
      case 'success':
        return '#D1FAE5';
      case 'error':
        return '#FEF2F2';
      default:
        return '#FEF3C7';
    }
  };

  const getOverallStatus = () => {
    const hasErrors = tests.some(test => test.status === 'error');
    const allComplete = tests.every(test => test.status !== 'pending');
    
    if (hasErrors) return 'error';
    if (allComplete) return 'success';
    return 'pending';
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
        
        <Text style={styles.headerTitle}>Supabase Debug</Text>
        
        <TouchableOpacity 
          style={styles.refreshButton}
          onPress={runTests}
          disabled={isRunning}
        >
          <RefreshCw size={20} color={isRunning ? "#9CA3AF" : "#6366F1"} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Overall Status */}
        <View style={[styles.statusCard, { backgroundColor: getStatusColor(getOverallStatus()) }]}>
          <View style={styles.statusHeader}>
            {getStatusIcon(getOverallStatus())}
            <Text style={styles.statusTitle}>
              {getOverallStatus() === 'success' ? '✅ Supabase Connection Successful' :
               getOverallStatus() === 'error' ? '❌ Connection Issues Detected' :
               '⏳ Running Tests...'}
            </Text>
          </View>
          
          {getOverallStatus() === 'success' && (
            <Text style={styles.statusMessage}>
              All tests passed! Your Supabase integration is working correctly.
            </Text>
          )}
          
          {getOverallStatus() === 'error' && (
            <Text style={styles.statusMessage}>
              Some tests failed. Check the details below to troubleshoot.
            </Text>
          )}
        </View>

        {/* Test Results */}
        <View style={styles.testsSection}>
          <Text style={styles.sectionTitle}>Test Results</Text>
          
          {tests.map((test, index) => (
            <View key={index} style={[styles.testCard, { backgroundColor: getStatusColor(test.status) }]}>
              <View style={styles.testHeader}>
                {getStatusIcon(test.status)}
                <Text style={styles.testName}>{test.name}</Text>
              </View>
              
              <Text style={styles.testMessage}>{test.message}</Text>
              
              {test.details && (
                <View style={styles.testDetails}>
                  <Text style={styles.detailsTitle}>Details:</Text>
                  <Text style={styles.detailsText}>
                    {typeof test.details === 'string' 
                      ? test.details 
                      : JSON.stringify(test.details, null, 2)}
                  </Text>
                </View>
              )}
            </View>
          ))}
        </View>

        {/* Environment Info */}
        <View style={styles.envSection}>
          <Text style={styles.sectionTitle}>Environment Information</Text>
          
          <View style={styles.envCard}>
            <View style={styles.envItem}>
              <Database size={16} color="#6366F1" />
              <Text style={styles.envLabel}>Supabase URL:</Text>
              <Text style={styles.envValue}>
                {process.env.EXPO_PUBLIC_SUPABASE_URL 
                  ? `${process.env.EXPO_PUBLIC_SUPABASE_URL.substring(0, 30)}...`
                  : 'Not set'}
              </Text>
            </View>
            
            <View style={styles.envItem}>
              <Key size={16} color="#6366F1" />
              <Text style={styles.envLabel}>Anon Key:</Text>
              <Text style={styles.envValue}>
                {process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY 
                  ? `${process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY.substring(0, 30)}...`
                  : 'Not set'}
              </Text>
            </View>
          </View>
        </View>

        {/* Troubleshooting */}
        <View style={styles.troubleshootSection}>
          <Text style={styles.sectionTitle}>Troubleshooting</Text>
          
          <View style={styles.troubleshootCard}>
            <Text style={styles.troubleshootTitle}>Common Issues:</Text>
            
            <View style={styles.troubleshootItem}>
              <Text style={styles.troubleshootBullet}>•</Text>
              <Text style={styles.troubleshootText}>
                <Text style={styles.bold}>Missing .env file:</Text> Copy .env.example to .env and add your Supabase credentials
              </Text>
            </View>
            
            <View style={styles.troubleshootItem}>
              <Text style={styles.troubleshootBullet}>•</Text>
              <Text style={styles.troubleshootText}>
                <Text style={styles.bold}>Wrong URL/Key:</Text> Check your Supabase project settings → API
              </Text>
            </View>
            
            <View style={styles.troubleshootItem}>
              <Text style={styles.troubleshootBullet}>•</Text>
              <Text style={styles.troubleshootText}>
                <Text style={styles.bold}>Table doesn't exist:</Text> Run the migration files in your Supabase SQL editor
              </Text>
            </View>
            
            <View style={styles.troubleshootItem}>
              <Text style={styles.troubleshootBullet}>•</Text>
              <Text style={styles.troubleshootText}>
                <Text style={styles.bold}>Permission denied:</Text> Check Row Level Security policies in Supabase
              </Text>
            </View>
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
  refreshButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  statusCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  statusTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  statusMessage: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  testsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1F2937',
    marginBottom: 12,
  },
  testCard: {
    borderRadius: 8,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.1)',
  },
  testHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  testName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    flex: 1,
  },
  testMessage: {
    fontSize: 13,
    color: '#6B7280',
    marginBottom: 8,
  },
  testDetails: {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
    borderRadius: 6,
    padding: 8,
  },
  detailsTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  detailsText: {
    fontSize: 11,
    color: '#6B7280',
    fontFamily: 'monospace',
  },
  envSection: {
    marginBottom: 24,
  },
  envCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  envItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  envLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    minWidth: 80,
  },
  envValue: {
    fontSize: 12,
    color: '#6B7280',
    fontFamily: 'monospace',
    flex: 1,
  },
  troubleshootSection: {
    marginBottom: 40,
  },
  troubleshootCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  troubleshootTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: 12,
  },
  troubleshootItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
    gap: 8,
  },
  troubleshootBullet: {
    fontSize: 14,
    color: '#6366F1',
    fontWeight: 'bold',
    marginTop: 2,
  },
  troubleshootText: {
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 18,
    flex: 1,
  },
  bold: {
    fontWeight: '600',
    color: '#374151',
  },
});