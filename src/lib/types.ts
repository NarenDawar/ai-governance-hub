// lib/types.ts

// Enum for the status of the AI asset in its lifecycle
export enum AssetStatus {
    Proposed = 'Proposed',
    InReview = 'In Review',
    Active = 'Active',
    Retired = 'Retired',
  }
  
  // Enum for the risk classification based on initial triage
  export enum RiskLevel {
    Low = 'Low',
    Medium = 'Medium',
    High = 'High',
    Severe = 'Severe',
  }
  
  // The core interface for an AI Asset, based on the Module 1 requirements
  export interface AIAsset {
    id: string; // A unique identifier
    name: string; // The user-friendly name of the model/system
    owner: string; // The name or department of the model owner
    businessPurpose: string; // A brief description of what it's used for
    status: AssetStatus; // Current lifecycle status
    riskClassification: RiskLevel; // The assessed risk level
    dateRegistered: string; // The date it was added to the registry
  }