const pdfParse = require('pdf-parse').default || require('pdf-parse');
const natural = require('natural');
const fs = require('fs').promises;
const path = require('path');

// Extract keywords from text
function extractKeywords(text) {
  const tokenizer = new natural.WordTokenizer();
  const words = tokenizer.tokenize(text.toLowerCase());
  
  // Expanded tech skills and keywords
  const techSkills = ['javascript', 'python', 'java', 'react', 'node', 'sql', 'aws', 'docker', 'kubernetes', 
    'typescript', 'angular', 'vue', 'mongodb', 'postgresql', 'redis', 'git', 'ci/cd', 'agile', 'scrum',
    'html', 'css', 'api', 'rest', 'graphql', 'microservices', 'cloud', 'azure', 'gcp', 'linux', 'devops',
    'machine learning', 'ai', 'data science', 'analytics', 'testing', 'automation', 'security', 'django',
    'flask', 'spring', 'boot', 'express', 'fastapi', 'selenium', 'junit', 'jest', 'cypress', 'jenkins',
    'terraform', 'ansible', 'kafka', 'rabbitmq', 'elasticsearch', 'spark', 'hadoop', 'pandas', 'numpy',
    'tensorflow', 'pytorch', 'scikit-learn', 'c++', 'c#', '.net', 'php', 'ruby', 'go', 'rust', 'swift',
    'kotlin', 'flutter', 'react native', 'ios', 'android', 'mysql', 'oracle', 'nosql', 'firebase',
    'communication', 'teamwork', 'leadership', 'problem solving', 'analytical', 'management'];
  
  const foundSkills = [];
  const text_lower = text.toLowerCase();
  
  techSkills.forEach(skill => {
    if (text_lower.includes(skill)) {
      foundSkills.push(skill);
    }
  });
  
  // Also extract common words as potential keywords
  const commonWords = words.filter(w => w.length > 3 && !['with', 'from', 'have', 'this', 'that', 'will', 'your', 'about'].includes(w));
  
  return [...new Set([...foundSkills, ...commonWords.slice(0, 20)])];
}

// Parse resume PDF
async function parseResume(filePath) {
  try {
    const dataBuffer = await fs.readFile(filePath);
    const pdf = require('pdf-parse');
    const data = await pdf(dataBuffer);
    const text = data.text;
    const keywords = extractKeywords(text);
    
    return {
      text,
      keywords,
      pages: data.numpages
    };
  } catch (error) {
    console.error('Error parsing resume:', error);
    throw error;
  }
}

// Calculate match score between resume and job
function calculateMatchScore(resumeKeywords, jobKeywords, jobDescription) {
  if (!resumeKeywords.length) return { score: 0, matchedKeywords: [] };
  
  const resumeSet = new Set(resumeKeywords.map(k => k.toLowerCase()));
  const jobSet = new Set(jobKeywords.map(k => k.toLowerCase()));
  
  let matchedKeywords = [];
  let matchCount = 0;
  
  // Check exact matches
  jobSet.forEach(keyword => {
    if (resumeSet.has(keyword)) {
      matchedKeywords.push(keyword);
      matchCount++;
    }
  });
  
  // Check partial matches
  resumeSet.forEach(resumeWord => {
    jobSet.forEach(jobWord => {
      if (resumeWord.includes(jobWord) || jobWord.includes(resumeWord)) {
        if (!matchedKeywords.includes(jobWord)) {
          matchedKeywords.push(jobWord);
          matchCount += 0.5;
        }
      }
    });
  });
  
  // If no job keywords, use base score
  const totalKeywords = jobSet.size || 1;
  const score = Math.round((matchCount / totalKeywords) * 100);
  
  return {
    score: Math.min(score, 100),
    matchedKeywords
  };
}

// Analyze resume against all jobs
async function analyzeResumeForJobs(resumePath, jobs) {
  try {
    const resumeData = await parseResume(resumePath);
    const matches = [];
    
    for (const job of jobs) {
      const jobKeywords = job.skills || [];
      const jobDescription = job.job_description || '';
      
      // Extract keywords from job description too
      const descKeywords = extractKeywords(jobDescription);
      const allJobKeywords = [...new Set([...jobKeywords, ...descKeywords])];
      
      const matchResult = calculateMatchScore(resumeData.keywords, allJobKeywords, jobDescription);
      
      // Store ALL matches, not just >= 50%
      matches.push({
        jobId: job.job_id,
        jobTitle: job.job_title,
        score: matchResult.score,
        matchedKeywords: matchResult.matchedKeywords
      });
    }
    
    return {
      resumeKeywords: resumeData.keywords,
      matches: matches.sort((a, b) => b.score - a.score)
    };
  } catch (error) {
    console.error('Error analyzing resume:', error);
    throw error;
  }
}

module.exports = {
  parseResume,
  extractKeywords,
  calculateMatchScore,
  analyzeResumeForJobs
};
