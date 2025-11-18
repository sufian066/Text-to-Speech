const Speech = require('../models/Speech.model');
const { getSupabaseClient } = require('../config/database');

// Save speech record
exports.saveSpeech = async (req, res, next) => {
  try {
    const { text, voiceName, languageCode, pitch, speed, volume, userId } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const dbType = process.env.DATABASE_TYPE;
    let savedSpeech;

    if (dbType === 'mongodb') {
      const speech = new Speech({
        text,
        voiceName: voiceName || 'Default',
        languageCode: languageCode || 'en-US',
        pitch: pitch || 1.0,
        speed: speed || 1.0,
        volume: volume || 1.0,
        userId: userId || 'anonymous'
      });
      savedSpeech = await speech.save();
    } else if (dbType === 'supabase') {
      const supabase = getSupabaseClient();
      const { data, error } = await supabase
        .from('speeches')
        .insert([{
          text,
          voice_name: voiceName || 'Default',
          language_code: languageCode || 'en-US',
          pitch: pitch || 1.0,
          speed: speed || 1.0,
          volume: volume || 1.0,
          user_id: userId || 'anonymous'
        }])
        .select()
        .single();
      
      if (error) throw error;
      savedSpeech = data;
    }

    res.json({
      success: true,
      speech: savedSpeech,
      message: 'Speech record saved successfully'
    });

  } catch (error) {
    next(error);
  }
};

// Get speech history
exports.getSpeechHistory = async (req, res, next) => {
  try {
    const { userId, limit = 20 } = req.query;
    const dbType = process.env.DATABASE_TYPE;

    let speeches;

    if (dbType === 'mongodb') {
      const query = userId ? { userId } : {};
      speeches = await Speech.find(query)
        .sort({ createdAt: -1 })
        .limit(parseInt(limit));
    } else if (dbType === 'supabase') {
      const supabase = getSupabaseClient();
      const query = supabase
        .from('speeches')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(parseInt(limit));

      if (userId) {
        query.eq('user_id', userId);
      }

      const { data, error } = await query;
      if (error) throw error;
      speeches = data;
    }

    res.json({
      success: true,
      speeches,
      count: speeches.length
    });

  } catch (error) {
    next(error);
  }
};

// Delete speech record
exports.deleteSpeech = async (req, res, next) => {
  try {
    const { id } = req.params;
    const dbType = process.env.DATABASE_TYPE;

    if (dbType === 'mongodb') {
      await Speech.findByIdAndDelete(id);
    } else if (dbType === 'supabase') {
      const supabase = getSupabaseClient();
      const { error } = await supabase
        .from('speeches')
        .delete()
        .eq('id', id);
      if (error) throw error;
    }

    res.json({
      success: true,
      message: 'Speech record deleted successfully'
    });

  } catch (error) {
    next(error);
  }
};

// Get statistics
exports.getStatistics = async (req, res, next) => {
  try {
    const { userId } = req.query;
    const dbType = process.env.DATABASE_TYPE;

    let totalSpeeches = 0;
    let totalCharacters = 0;

    if (dbType === 'mongodb') {
      const query = userId ? { userId } : {};
      const speeches = await Speech.find(query);
      totalSpeeches = speeches.length;
      totalCharacters = speeches.reduce((sum, speech) => sum + speech.text.length, 0);
    } else if (dbType === 'supabase') {
      const supabase = getSupabaseClient();
      const query = supabase.from('speeches').select('text');
      
      if (userId) {
        query.eq('user_id', userId);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      totalSpeeches = data.length;
      totalCharacters = data.reduce((sum, speech) => sum + speech.text.length, 0);
    }

    res.json({
      success: true,
      statistics: {
        totalSpeeches,
        totalCharacters,
        averageLength: totalSpeeches > 0 ? Math.round(totalCharacters / totalSpeeches) : 0
      }
    });

  } catch (error) {
    next(error);
  }
};
