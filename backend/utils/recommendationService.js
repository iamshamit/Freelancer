const Job = require('../models/Job');
const Domain = require('../models/Domain');
const User = require('../models/User');

// Skill to domain mapping with weights
const skillDomainMapping = {
  // Web Development
  'web-development': {
    skills: ['JavaScript', 'React', 'Node.js', 'HTML/CSS', 'PHP', 'WordPress'],
    keywords: ['website', 'web app', 'frontend', 'backend', 'fullstack', 'responsive', 'api', 'database'],
    weight: 1.0
  },
  
  // Mobile Development
  'mobile-development': {
    skills: ['Mobile Development', 'React', 'JavaScript'],
    keywords: ['mobile app', 'android', 'ios', 'react native', 'flutter', 'app store', 'mobile'],
    weight: 1.0
  },
  
  // Design
  'design': {
    skills: ['UI/UX Design', 'Graphic Design'],
    keywords: ['design', 'ui', 'ux', 'user interface', 'user experience', 'figma', 'photoshop', 'branding', 'logo'],
    weight: 1.0
  },
  
  // Digital Marketing
  'digital-marketing': {
    skills: ['Digital Marketing', 'SEO', 'Content Writing'],
    keywords: ['marketing', 'seo', 'content', 'social media', 'advertising', 'campaign', 'analytics', 'copywriting'],
    weight: 1.0
  },
  
  // Data & Analytics
  'data-analytics': {
    skills: ['Data Analysis', 'Python'],
    keywords: ['data analysis', 'analytics', 'python', 'machine learning', 'statistics', 'visualization', 'reporting'],
    weight: 1.0
  },
  
  // DevOps & Backend
  'devops': {
    skills: ['DevOps', 'Node.js', 'Python'],
    keywords: ['devops', 'deployment', 'server', 'cloud', 'aws', 'docker', 'kubernetes', 'ci/cd'],
    weight: 1.0
  }
};

// Skill relationships for cross-recommendations
const skillRelationships = {
  'JavaScript': ['React', 'Node.js', 'HTML/CSS'],
  'React': ['JavaScript', 'HTML/CSS', 'Node.js'],
  'Node.js': ['JavaScript', 'DevOps'],
  'HTML/CSS': ['JavaScript', 'React', 'UI/UX Design'],
  'UI/UX Design': ['Graphic Design', 'HTML/CSS'],
  'Python': ['Data Analysis', 'DevOps'],
  'Digital Marketing': ['SEO', 'Content Writing'],
  'SEO': ['Digital Marketing', 'Content Writing'],
  'Content Writing': ['Digital Marketing', 'SEO']
};

class RecommendationService {
  
  // Analyze job content for skill keywords
  static analyzeJobContent(job, userSkills) {
    const content = `${job.title} ${job.description}`.toLowerCase();
    let skillMatches = 0;
    let keywordMatches = 0;
    let totalSkillWeight = 0;

    // Direct skill matching in content
    userSkills.forEach(skill => {
      if (content.includes(skill.toLowerCase())) {
        skillMatches++;
        totalSkillWeight += 2; // Higher weight for direct skill match
      }
    });

    // Check for domain keywords
    Object.values(skillDomainMapping).forEach(domain => {
      domain.keywords.forEach(keyword => {
        if (content.includes(keyword)) {
          keywordMatches++;
          totalSkillWeight += 1;
        }
      });
    });

    return {
      skillMatches,
      keywordMatches,
      totalSkillWeight,
      hasDirectSkillMatch: skillMatches > 0
    };
  }

  // Get domain relevance score for user skills
  static getDomainRelevanceScore(domainName, userSkills) {
    let maxScore = 0;
    const domainKey = domainName.toLowerCase().replace(/[^a-z]/g, '-');
    
    Object.entries(skillDomainMapping).forEach(([key, mapping]) => {
      if (domainKey.includes(key) || key.includes(domainKey)) {
        const skillMatches = userSkills.filter(skill => 
          mapping.skills.includes(skill)
        ).length;
        
        const score = (skillMatches / mapping.skills.length) * mapping.weight;
        maxScore = Math.max(maxScore, score);
      }
    });

    return maxScore;
  }

  // Get related skills suggestions
  static getRelatedSkills(userSkills) {
    const relatedSkills = new Set();
    
    userSkills.forEach(skill => {
      if (skillRelationships[skill]) {
        skillRelationships[skill].forEach(related => {
          if (!userSkills.includes(related)) {
            relatedSkills.add(related);
          }
        });
      }
    });

    return Array.from(relatedSkills);
  }

  // Calculate job recommendation score
  static calculateJobScore(job, user, contentAnalysis, domainScore) {
    let score = 0;
    
    // 1. Direct skill matching (40% weight)
    score += contentAnalysis.totalSkillWeight * 0.4;
    
    // 2. Domain relevance (25% weight)
    score += domainScore * 10 * 0.25;
    
    // 3. Budget preference (15% weight) - based on user's search history
    if (user.savedSearches.length > 0) {
      const avgBudgetPreference = user.savedSearches.reduce((sum, search) => {
        return sum + ((search.filters.minBudget || 0) + (search.filters.maxBudget || job.budget));
      }, 0) / user.savedSearches.length / 2;
      
      const budgetScore = Math.max(0, 1 - Math.abs(job.budget - avgBudgetPreference) / avgBudgetPreference);
      score += budgetScore * 3 * 0.15;
    }
    
    // 4. Recency bonus (10% weight)
    const daysSincePosted = (Date.now() - job.createdAt) / (1000 * 60 * 60 * 24);
    const recencyScore = Math.max(0, 1 - daysSincePosted / 30); // Decrease over 30 days
    score += recencyScore * 2 * 0.1;
    
    // 5. Employer rating bonus (10% weight)
    if (job.employer && job.employer.averageRating > 0) {
      score += (job.employer.averageRating / 5) * 2 * 0.1;
    }
    
    // Bonus for jobs with skills user can learn
    const relatedSkills = this.getRelatedSkills(user.skills || []);
    const jobContent = `${job.title} ${job.description}`.toLowerCase();
    const learningOpportunity = relatedSkills.some(skill => 
      jobContent.includes(skill.toLowerCase())
    );
    
    if (learningOpportunity) {
      score += 1; // Learning bonus
    }

    return score;
  }

  // Main recommendation function
  static async getRecommendedJobs(userId, limit = 6) {
    try {
      const user = await User.findById(userId);
      if (!user) throw new Error('User not found');

      const userSkills = user.skills || [];
      
      // Get all open jobs with populated data
      const allJobs = await Job.find({ status: 'open' })
        .populate('employer', 'name profilePicture averageRating')
        .populate('domain', 'name icon')
        .lean();

      if (userSkills.length === 0) {
        // Return recent jobs if no skills
        return allJobs
          .sort((a, b) => b.createdAt - a.createdAt)
          .slice(0, limit);
      }

      // Score and rank jobs
      const scoredJobs = allJobs.map(job => {
        const contentAnalysis = this.analyzeJobContent(job, userSkills);
        const domainScore = this.getDomainRelevanceScore(job.domain.name, userSkills);
        const score = this.calculateJobScore(job, user, contentAnalysis, domainScore);
        
        return {
          ...job,
          recommendationScore: score,
          matchReason: this.getMatchReason(contentAnalysis, domainScore, userSkills)
        };
      });

      // Sort by score and apply diversification
      scoredJobs.sort((a, b) => b.recommendationScore - a.recommendationScore);
      
      // Ensure diversity in recommendations
      const diversifiedJobs = this.diversifyRecommendations(scoredJobs, limit);
      
      return diversifiedJobs.slice(0, limit);

    } catch (error) {
      console.error('Recommendation service error:', error);
      throw error;
    }
  }

  // Get match reason for display
  static getMatchReason(contentAnalysis, domainScore, userSkills) {
    if (contentAnalysis.skillMatches > 0) {
      return `Matches ${contentAnalysis.skillMatches} of your skills`;
    } else if (domainScore > 0.5) {
      return 'Relevant to your skill domain';
    } else if (contentAnalysis.keywordMatches > 0) {
      return 'Related to your expertise area';
    } else {
      return 'Opportunity to learn new skills';
    }
  }

  // Ensure diversity in domain recommendations
  static diversifyRecommendations(scoredJobs, limit) {
    const diversified = [];
    const domainCounts = {};
    const maxPerDomain = Math.max(2, Math.floor(limit / 3));

    for (const job of scoredJobs) {
      const domainId = job.domain._id.toString();
      
      if (!domainCounts[domainId]) {
        domainCounts[domainId] = 0;
      }
      
      if (domainCounts[domainId] < maxPerDomain || diversified.length < limit) {
        diversified.push(job);
        domainCounts[domainId]++;
        
        if (diversified.length >= limit) break;
      }
    }

    return diversified;
  }

  // Get skill-based domain suggestions
  static async getSuggestedDomains(userSkills) {
    const domains = await Domain.find({ active: true }).lean();
    
    return domains.map(domain => {
      const relevanceScore = this.getDomainRelevanceScore(domain.name, userSkills);
      return {
        ...domain,
        relevanceScore,
        isRecommended: relevanceScore > 0.3
      };
    }).sort((a, b) => b.relevanceScore - a.relevanceScore);
  }
}

module.exports = RecommendationService;