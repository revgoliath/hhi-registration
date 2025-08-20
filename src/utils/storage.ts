import { Member, NewlyWed, MarriagePreparation, BabyDedication } from '../types/Member';

const STORAGE_KEYS = {
  MEMBERS: 'harvest_house_members',
  NEWLY_WEDS: 'harvest_house_newly_weds',
  MARRIAGE_PREP: 'harvest_house_marriage_prep',
  BABY_DEDICATIONS: 'harvest_house_baby_dedications',
};

export const storageService = {
  // Members
  getMembers(): Member[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MEMBERS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading members:', error);
      return [];
    }
  },

  saveMember(member: Member): void {
    try {
      const members = this.getMembers();
      const existingIndex = members.findIndex(m => m.id === member.id);
      
      if (existingIndex >= 0) {
        members[existingIndex] = member;
      } else {
        members.push(member);
      }
      
      localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
    } catch (error) {
      console.error('Error saving member:', error);
      throw new Error('Failed to save member data');
    }
  },

  deleteMember(id: string): void {
    try {
      const members = this.getMembers().filter(m => m.id !== id);
      localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(members));
    } catch (error) {
      console.error('Error deleting member:', error);
      throw new Error('Failed to delete member');
    }
  },

  // Newly Weds
  getNewlyWeds(): NewlyWed[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.NEWLY_WEDS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading newly weds:', error);
      return [];
    }
  },

  saveNewlyWed(newlyWed: NewlyWed): void {
    try {
      const newlyWeds = this.getNewlyWeds();
      const existingIndex = newlyWeds.findIndex(nw => nw.id === newlyWed.id);
      
      if (existingIndex >= 0) {
        newlyWeds[existingIndex] = newlyWed;
      } else {
        newlyWeds.push(newlyWed);
      }
      
      localStorage.setItem(STORAGE_KEYS.NEWLY_WEDS, JSON.stringify(newlyWeds));
    } catch (error) {
      console.error('Error saving newly wed:', error);
      throw new Error('Failed to save newly wed data');
    }
  },

  // Marriage Preparation
  getMarriagePrep(): MarriagePreparation[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.MARRIAGE_PREP);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading marriage preparation:', error);
      return [];
    }
  },

  saveMarriagePrep(marriagePrep: MarriagePreparation): void {
    try {
      const marriagePreps = this.getMarriagePrep();
      const existingIndex = marriagePreps.findIndex(mp => mp.id === marriagePrep.id);
      
      if (existingIndex >= 0) {
        marriagePreps[existingIndex] = marriagePrep;
      } else {
        marriagePreps.push(marriagePrep);
      }
      
      localStorage.setItem(STORAGE_KEYS.MARRIAGE_PREP, JSON.stringify(marriagePreps));
    } catch (error) {
      console.error('Error saving marriage preparation:', error);
      throw new Error('Failed to save marriage preparation data');
    }
  },

  // Baby Dedications
  getBabyDedications(): BabyDedication[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BABY_DEDICATIONS);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading baby dedications:', error);
      return [];
    }
  },

  saveBabyDedication(babyDedication: BabyDedication): void {
    try {
      const babyDedications = this.getBabyDedications();
      const existingIndex = babyDedications.findIndex(bd => bd.id === babyDedication.id);
      
      if (existingIndex >= 0) {
        babyDedications[existingIndex] = babyDedication;
      } else {
        babyDedications.push(babyDedication);
      }
      
      localStorage.setItem(STORAGE_KEYS.BABY_DEDICATIONS, JSON.stringify(babyDedications));
    } catch (error) {
      console.error('Error saving baby dedication:', error);
      throw new Error('Failed to save baby dedication data');
    }
  },

  // Utility methods
  clearAllData(): void {
    try {
      Object.values(STORAGE_KEYS).forEach(key => {
        localStorage.removeItem(key);
      });
    } catch (error) {
      console.error('Error clearing data:', error);
      throw new Error('Failed to clear data');
    }
  },

  exportData(): string {
    try {
      const data = {
        members: this.getMembers(),
        newlyWeds: this.getNewlyWeds(),
        marriagePrep: this.getMarriagePrep(),
        babyDedications: this.getBabyDedications(),
        exportDate: new Date().toISOString(),
      };
      return JSON.stringify(data, null, 2);
    } catch (error) {
      console.error('Error exporting data:', error);
      throw new Error('Failed to export data');
    }
  },

  importData(jsonData: string): void {
    try {
      const data = JSON.parse(jsonData);
      
      if (data.members) {
        localStorage.setItem(STORAGE_KEYS.MEMBERS, JSON.stringify(data.members));
      }
      if (data.newlyWeds) {
        localStorage.setItem(STORAGE_KEYS.NEWLY_WEDS, JSON.stringify(data.newlyWeds));
      }
      if (data.marriagePrep) {
        localStorage.setItem(STORAGE_KEYS.MARRIAGE_PREP, JSON.stringify(data.marriagePrep));
      }
      if (data.babyDedications) {
        localStorage.setItem(STORAGE_KEYS.BABY_DEDICATIONS, JSON.stringify(data.babyDedications));
      }
    } catch (error) {
      console.error('Error importing data:', error);
      throw new Error('Failed to import data');
    }
  }
};