/*
  # Sample Data for Development

  1. Sample Users
    - Create a few anonymous users for testing

  2. Sample Confessions
    - Add realistic confession data for development
    - Include various tags and roasts
    - Set up proper reaction and poll data

  3. Sample Chat Messages
    - Add some chat messages for different mood rooms
    - Include both user and bot messages
*/

-- Insert sample users
INSERT INTO users (id, handle, is_premium, stats) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'Anonymous_Roaster_1', false, '{
    "roastPoints": 1250,
    "postsShared": 5,
    "gamesWon": 12,
    "dayStreak": 3,
    "totalRoasts": 23,
    "favoriteTag": "#Ghosted"
  }'::jsonb),
  ('550e8400-e29b-41d4-a716-446655440002', 'Anonymous_Roaster_2', true, '{
    "roastPoints": 2847,
    "postsShared": 12,
    "gamesWon": 45,
    "dayStreak": 7,
    "totalRoasts": 67,
    "favoriteTag": "#RedFlag"
  }'::jsonb),
  ('550e8400-e29b-41d4-a716-446655440003', 'Anonymous_Roaster_3', false, '{
    "roastPoints": 890,
    "postsShared": 3,
    "gamesWon": 8,
    "dayStreak": 1,
    "totalRoasts": 15,
    "favoriteTag": "#Boundaries"
  }'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Insert sample confessions
INSERT INTO confessions (id, content, tag, roast, reactions, poll, user_id, created_at) VALUES
  (
    '660e8400-e29b-41d4-a716-446655440001',
    'My boyfriend keeps ''forgetting'' to introduce me to his friends after 8 months of dating. When I brought it up, he said I''m being too clingy. Am I overreacting?',
    '#RedFlag',
    'His memory works fine when he wants to hide you. Maybe he ''forgot'' he''s in a relationship too? 💀',
    '{"laugh": 342, "skull": 128, "shocked": 89, "cry": 67}'::jsonb,
    '{"you": 274, "them": 972, "both": 0}'::jsonb,
    '550e8400-e29b-41d4-a716-446655440001',
    now() - interval '2 hours'
  ),
  (
    '660e8400-e29b-41d4-a716-446655440002',
    'I spent $300 on concert tickets for my girlfriend''s birthday. She said she''d rather have gotten jewelry instead and seemed disappointed. Should I be upset?',
    '#Ungrateful',
    'Congrats on buying yourself concert tickets with extra steps. Next time try asking what she wants instead of guessing. 🎫',
    '{"laugh": 217, "skull": 89, "shocked": 64, "cry": 156}'::jsonb,
    '{"you": 312, "them": 375, "both": 205}'::jsonb,
    '550e8400-e29b-41d4-a716-446655440002',
    now() - interval '4 hours'
  ),
  (
    '660e8400-e29b-41d4-a716-446655440003',
    'My roommate keeps eating my food without asking and denies it when confronted. I''ve started labeling everything but it still disappears. What should I do?',
    '#Boundaries',
    'Time to spice things up – literally. Ghost pepper hot sauce makes a great food detective. What disappears today will burn tomorrow. 🌶️',
    '{"laugh": 423, "skull": 67, "shocked": 176, "cry": 89}'::jsonb,
    '{"you": 188, "them": 1379, "both": 0}'::jsonb,
    '550e8400-e29b-41d4-a716-446655440003',
    now() - interval '6 hours'
  ),
  (
    '660e8400-e29b-41d4-a716-446655440004',
    'I found out my best friend has been secretly dating my ex for 3 months. They both claim it ''just happened'' and they didn''t want to hurt me. Should I forgive them?',
    '#Betrayal',
    'Things that ''just happen'': rain, flat tires, hiccups. Things that don''t: secretly dating your best friend''s ex for a quarter of a year. Upgrade your friend circle, not your forgiveness policy. 🚩',
    '{"laugh": 156, "skull": 347, "shocked": 219, "cry": 289}'::jsonb,
    '{"you": 105, "them": 589, "both": 1409}'::jsonb,
    '550e8400-e29b-41d4-a716-446655440001',
    now() - interval '8 hours'
  ),
  (
    '660e8400-e29b-41d4-a716-446655440005',
    'My crush liked all my Instagram posts from 2019 at 3 AM but still hasn''t replied to my text from last week. What does this mean?',
    '#Ghosted',
    'They''re conducting archaeological research on your profile while your text message sits in digital purgatory. That''s not mixed signals, that''s a whole circus. 🎪',
    '{"laugh": 567, "skull": 234, "shocked": 123, "cry": 89}'::jsonb,
    '{"you": 45, "them": 890, "both": 12}'::jsonb,
    '550e8400-e29b-41d4-a716-446655440002',
    now() - interval '1 hour'
  ),
  (
    '660e8400-e29b-41d4-a716-446655440006',
    'I accidentally sent a voice message meant for my therapist to my ex. It was me crying about our breakup. He replied with a thumbs up emoji.',
    '#CringeText',
    'You really said ''here''s my emotional breakdown'' and he responded like you shared a pizza recipe. The audacity is astronomical. 💀',
    '{"laugh": 789, "skull": 456, "shocked": 234, "cry": 123}'::jsonb,
    '{"you": 234, "them": 1456, "both": 67}'::jsonb,
    '550e8400-e29b-41d4-a716-446655440003',
    now() - interval '30 minutes'
  )
ON CONFLICT (id) DO NOTHING;

-- Insert sample chat messages for different mood rooms
INSERT INTO chat_messages (room_id, text, is_bot, user_id, created_at) VALUES
  -- Sad room messages
  ('sad', 'Hey everyone! Welcome to the Sad room. Share your feelings, support each other, and remember to roast responsibly. ✨', true, null, now() - interval '25 minutes'),
  ('sad', 'Failed my exam today after studying for weeks. Feeling like all my effort was for nothing. 😔', false, '550e8400-e29b-41d4-a716-446655440001', now() - interval '23 minutes'),
  ('sad', 'I''m sorry about your exam. That really sucks after putting in so much effort. Remember that one exam doesn''t define your worth or intelligence. Would you like some advice on how to bounce back or just need a space to vent?', true, null, now() - interval '22 minutes'),
  ('sad', 'Just need to vent honestly. Thanks for listening 💙', false, '550e8400-e29b-41d4-a716-446655440001', now() - interval '20 minutes'),
  
  -- Cringe room messages
  ('cringe', '🔥 Welcome to the Cringe room. Embrace the awkward moments, and remember - we''ve all been there! 🤪', true, null, now() - interval '30 minutes'),
  ('cringe', 'I just waved back at someone who was waving at the person behind me. In a meeting. On Zoom. 🤦‍♀️', false, '550e8400-e29b-41d4-a716-446655440002', now() - interval '15 minutes'),
  ('cringe', 'The secondhand embarrassment is real but honestly that''s hilarious 😂', false, '550e8400-e29b-41d4-a716-446655440003', now() - interval '12 minutes'),
  
  -- Lonely room messages
  ('lonely', '💔 Connect with fellow souls in the Lonely room. You''re not alone in feeling alone. 🫂', true, null, now() - interval '45 minutes'),
  ('lonely', 'Anyone else feel like they''re surrounded by people but still feel completely alone?', false, '550e8400-e29b-41d4-a716-446655440003', now() - interval '10 minutes'),
  ('lonely', 'Literally yes. It''s like being in a crowded room but feeling invisible.', false, '550e8400-e29b-41d4-a716-446655440001', now() - interval '8 minutes'),
  
  -- Chaotic room messages
  ('chaotic', '🤪 Unleash the chaos within! Welcome to the Chaotic room where anything goes! 🌪️', true, null, now() - interval '20 minutes'),
  ('chaotic', 'I just ordered pizza to my ex''s house by accident and now I don''t know if I should go get it or let them have it 🍕', false, '550e8400-e29b-41d4-a716-446655440002', now() - interval '5 minutes'),
  ('chaotic', 'GO GET YOUR PIZZA. Assert dominance. Ring the doorbell and maintain eye contact. 😤', false, '550e8400-e29b-41d4-a716-446655440003', now() - interval '3 minutes')
ON CONFLICT DO NOTHING;