export interface Member {
  id: string;
  fullName: string;
  dateOfBirth: string;
  gender: 'Male' | 'Female';
  maritalStatus: 'Single' | 'Married' | 'Divorced' | 'Widowed';
  occupation: string;
  nationalId?: string;
  phone: string;
  email: string;
  address: string;
  dateJoinedChurch: string;
  invitedBy?: string;
  bornAgain: {
    status: boolean;
    date?: string;
  };
  waterBaptized: {
    status: boolean;
    date?: string;
  };
  spiritBaptized: {
    status: boolean;
    date?: string;
  };
  notes?: string;
  ministries: string[];
  ageGroup: string;
  createdAt: string;
  updatedAt?: string;
}

export interface NewlyWed {
  id: string;
  coupleNames: string;
  dateOfWedding: string;
  counsellingStatus: 'Not Started' | 'In Progress' | 'Completed';
  assignedMentor?: string;
  createdAt: string;
}

export interface MarriagePreparation {
  id: string;
  coupleNames: string;
  intendedWeddingDate: string;
  sessionsAttended: number;
  totalSessions: number;
  notes?: string;
  createdAt: string;
}

export interface BabyDedication {
  id: string;
  childName: string;
  dateOfBirth: string;
  parentNames: string;
  parentMemberIds: string[];
  dateDedicated?: string;
  officiatingMinister?: string;
  createdAt: string;
}