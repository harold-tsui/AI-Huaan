import { KnowledgeItem } from '../../shared/types/knowledge-item';

// Define a basic structure for UserProfile, can be expanded based on user_profile_schema from requirements
export interface UserProfile {
  userId: string;
  basicInfo?: Record<string, any>;
  skillsCapabilities?: Record<string, any>;
  preferences?: Record<string, any>;
  context?: Record<string, any>;
  behavioralPatterns?: Record<string, any>;
  changeIndicators?: Record<string, any>;
  learningPaths?: LearningPath[]; // Added to store user's learning paths
  interests?: string[]; // Added to store user's interests
  expertise?: string[]; // Added from service implementation
  learningGoals?: string[]; // Added from service implementation
  preferredSources?: string[]; // Added from service implementation
  interactionHistory?: UserAction[]; // Added to store user's actions
  dynamicContext?: Record<string, any>; // Added from service implementation
  lastUpdatedAt: string; // ISO 8601 date-time string
}

export interface UserAction {
  userId: string;
  actionType: string; // e.g., 'view_item', 'create_note', 'search_query'
  itemId?: string; // ID of the item related to the action
  timestamp: string; // ISO 8601 date-time string
  details?: Record<string, any>;
}

export interface BehaviorAnalysisReport {
  userId: string;
  patterns: Array<{ patternName: string; description: string; confidence?: number }>;
  trends: Array<{ trendName: string; direction: 'up' | 'down' | 'stable'; significance?: number }>;
  generatedAt: string; // ISO 8601 date-time string
}

export interface Recommendation {
  item: KnowledgeItem;
  relevanceScore: number;
  reasoning?: string;
}

export interface LearningPath {
  pathId: string;
  userId: string;
  title: string;
  description?: string;
  goals: string[];
  milestones: Array<{
    milestoneId: string;
    title: string;
    description?: string;
    estimatedDuration?: string; // e.g., '2 weeks', '3 days'
    resources?: KnowledgeItem[];
    isCompleted: boolean;
  }>;
  createdAt: string; // ISO 8601 date-time string
  updatedAt: string; // ISO 8601 date-time string
}

export interface IUserProfileService {
  /**
   * Builds or updates a user's profile.
   * @param userId The ID of the user.
   * @param userData Data to build or update the profile with.
   * @param behavioralData Optional behavioral data to incorporate.
   * @returns A Promise resolving to the UserProfile.
   */
  buildUserProfile(userId: string, actions?: UserAction[]): Promise<UserProfile>;

  /**
   * Analyzes user actions over a time window to identify behavioral patterns.
   * @param userId The ID of the user.
   * @param userActions An array of UserActions.
   * @param timeWindow Optional time window for analysis (e.g., { start: 'date', end: 'date' }).
   * @returns A Promise resolving to a BehaviorAnalysisReport.
   */
  analyzeBehavior(userId: string, options?: BehaviorAnalysisOptions): Promise<BehaviorAnalysisReport>;

  /**
   * Recommends content based on a user's profile and current context.
   * @param userId The ID of the user.
   * @param options Optional recommendation options.
   * @returns A Promise resolving to an array of Recommendations.
   */
  recommendContent(userId: string, options?: RecommendationOptions): Promise<Recommendation[]>;

  /**
   * Plans a personalized learning path for a user based on their profile and goals.
   * @param userProfile The UserProfile of the user.
   * @param learningGoals An array of learning goals.
   * @returns A Promise resolving to a LearningPath.
   */
  createLearningPath(userId: string, goal: string /*, options?: LearningPathOptions */): Promise<LearningPath>;

  /**
   * Updates the user's context based on a trigger event and new data.
   * @param userId The ID of the user.
   * @param triggerEvent A description of the event that triggered the update.
   * @param newData The new data to incorporate into the user's context.
   * @returns A Promise resolving to the updated UserProfile.
   */
  updateUserContext(userId: string, triggerEvent: string, newData: Partial<UserProfile>): Promise<UserProfile>;
}

export interface BehaviorAnalysisOptions {
  timeWindow?: { start: string; end: string };
  // Add other options as needed
}

export interface RecommendationOptions {
  maxResults?: number;
  // Add other options as needed
}

export interface LearningPathOptions {
  // Add options for learning path generation, e.g., preferredLearningStyle, difficultyLevel
}

export interface UserContextUpdate {
    // Define structure for context updates if needed
}