import { Member } from '../types/Member';

export function calculateAge(dateOfBirth: string): number {
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

export function assignAgeGroup(member: Partial<Member>): string {
  if (!member.dateOfBirth) return 'Unknown';
  
  const age = calculateAge(member.dateOfBirth);
  
  if (age < 13) return 'Children';
  if (age < 18) return 'Youth';
  if (age < 35) return 'Young Adults';
  if (age < 55) return 'Adults';
  return 'Seniors';
}