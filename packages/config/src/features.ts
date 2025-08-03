import { env } from "./env";

/**
 * Feature Flags Configuration
 * Centralized feature toggles for StudyStreaks
 */

export interface FeatureFlags {
  // Core features
  enableRegistration: boolean;
  enableAnalytics: boolean;
  enableMaintenanceMode: boolean;
  
  // Experimental features
  enableRealtimeNotifications: boolean;
  enableAdvancedGamification: boolean;
  enableAIHomeworkFeedback: boolean;
  enableVideoHomework: boolean;
  enableParentDashboard: boolean;
  
  // Integration features  
  enableGoogleClassroom: boolean;
  enableMicrosoftTeams: boolean;
  enableSIMSIntegration: boolean;
  
  // Beta features
  enableBuddySystem: boolean;
  enableClubsAndSocieties: boolean;
  enableHomeworkCollaboration: boolean;
  enableAdvancedReporting: boolean;
  
  // Compliance features
  enableGDPRCompliance: boolean;
  enableChildProtection: boolean;
  enableAccessibilityFeatures: boolean;
  
  // Performance features
  enableCaching: boolean;
  enableImageOptimization: boolean;
  enableBackgroundJobs: boolean;
}

/**
 * Get feature flags based on environment and configuration
 */
export function getFeatureFlags(): FeatureFlags {
  const isDevelopment = env.NODE_ENV === "development";
  const isProduction = env.NODE_ENV === "production";
  
  return {
    // Core features - always enabled based on env vars
    enableRegistration: env.NEXT_PUBLIC_ENABLE_REGISTRATION === "true",
    enableAnalytics: env.NEXT_PUBLIC_ENABLE_ANALYTICS === "true",
    enableMaintenanceMode: env.NEXT_PUBLIC_ENABLE_MAINTENANCE_MODE === "true",
    
    // Experimental features - enabled in development, controlled in production
    enableRealtimeNotifications: isDevelopment || isFeatureEnabled("REALTIME_NOTIFICATIONS"),
    enableAdvancedGamification: isDevelopment || isFeatureEnabled("ADVANCED_GAMIFICATION"),
    enableAIHomeworkFeedback: false, // Future feature
    enableVideoHomework: isDevelopment || isFeatureEnabled("VIDEO_HOMEWORK"),
    enableParentDashboard: isDevelopment || isFeatureEnabled("PARENT_DASHBOARD"),
    
    // Integration features - disabled by default
    enableGoogleClassroom: isFeatureEnabled("GOOGLE_CLASSROOM"),
    enableMicrosoftTeams: isFeatureEnabled("MICROSOFT_TEAMS"),
    enableSIMSIntegration: isFeatureEnabled("SIMS_INTEGRATION"),
    
    // Beta features - enabled in development
    enableBuddySystem: isDevelopment || isFeatureEnabled("BUDDY_SYSTEM"),
    enableClubsAndSocieties: isDevelopment || isFeatureEnabled("CLUBS_SOCIETIES"),
    enableHomeworkCollaboration: isDevelopment || isFeatureEnabled("HOMEWORK_COLLABORATION"),
    enableAdvancedReporting: isDevelopment || isFeatureEnabled("ADVANCED_REPORTING"),
    
    // Compliance features - always enabled
    enableGDPRCompliance: true,
    enableChildProtection: true,
    enableAccessibilityFeatures: true,
    
    // Performance features - enabled based on environment
    enableCaching: !isDevelopment,
    enableImageOptimization: !isDevelopment,
    enableBackgroundJobs: true,
  };
}

/**
 * Check if a specific feature is enabled via environment variable
 */
function isFeatureEnabled(feature: string): boolean {
  const envVar = `NEXT_PUBLIC_FEATURE_${feature}`;
  return process.env[envVar] === "true";
}

/**
 * Feature flag hooks for runtime checks
 */
export class FeatureService {
  private static instance: FeatureService;
  private flags: FeatureFlags;
  
  private constructor() {
    this.flags = getFeatureFlags();
  }
  
  public static getInstance(): FeatureService {
    if (!FeatureService.instance) {
      FeatureService.instance = new FeatureService();
    }
    return FeatureService.instance;
  }
  
  public isEnabled(feature: keyof FeatureFlags): boolean {
    return this.flags[feature];
  }
  
  public getFlags(): FeatureFlags {
    return { ...this.flags };
  }
  
  // Specific feature checks
  public canUserRegister(): boolean {
    return this.isEnabled("enableRegistration") && !this.isEnabled("enableMaintenanceMode");
  }
  
  public shouldShowAnalytics(): boolean {
    return this.isEnabled("enableAnalytics") && !this.isEnabled("enableMaintenanceMode");
  }
  
  public isInMaintenanceMode(): boolean {
    return this.isEnabled("enableMaintenanceMode");
  }
  
  public canAccessParentFeatures(): boolean {
    return this.isEnabled("enableParentDashboard");
  }
  
  public canUseBuddySystem(): boolean {
    return this.isEnabled("enableBuddySystem");
  }
  
  public canUseAdvancedGamification(): boolean {
    return this.isEnabled("enableAdvancedGamification");
  }
}

// Export singleton instance
export const featureService = FeatureService.getInstance();

// Export feature flags for direct access
export const features = getFeatureFlags();