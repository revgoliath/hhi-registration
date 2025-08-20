import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Member, NewlyWed, MarriagePreparation, BabyDedication } from '../types/Member';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export function exportMembersToExcel(members: Member[]): void {
  try {
    const worksheet = XLSX.utils.json_to_sheet(
      members.map(member => ({
        'Full Name': member.fullName,
        'Date of Birth': member.dateOfBirth,
        'Age Group': member.ageGroup,
        'Gender': member.gender,
        'Marital Status': member.maritalStatus,
        'Occupation': member.occupation,
        'National ID': member.nationalId || '',
        'Phone': member.phone,
        'Email': member.email,
        'Address': member.address,
        'Date Joined Church': member.dateJoinedChurch,
        'Invited By': member.invitedBy || '',
        'Born Again': member.bornAgain.status ? 'Yes' : 'No',
        'Born Again Date': member.bornAgain.date || '',
        'Water Baptized': member.waterBaptized.status ? 'Yes' : 'No',
        'Water Baptized Date': member.waterBaptized.date || '',
        'Spirit Baptized': member.spiritBaptized.status ? 'Yes' : 'No',
        'Spirit Baptized Date': member.spiritBaptized.date || '',
        'Ministries': member.ministries.join(', '),
        'Notes': member.notes || '',
        'Created At': member.createdAt,
        'Updated At': member.updatedAt || ''
      }))
    );

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Members');
    
    const fileName = `harvest_house_members_${new Date().toISOString().split('T')[0]}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  } catch (error) {
    console.error('Error exporting to Excel:', error);
    throw new Error('Failed to export members to Excel');
  }
}

export function exportMembersToPDF(members: Member[]): void {
  try {
    const doc = new jsPDF('l', 'mm', 'a4'); // landscape orientation
    
    doc.setFontSize(16);
    doc.text('Harvest House International - Members List', 14, 15);
    
    doc.setFontSize(10);
    doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 25);
    doc.text(`Total Members: ${members.length}`, 14, 30);

    const tableData = members.map(member => [
      member.fullName,
      member.ageGroup,
      member.gender,
      member.phone,
      member.email,
      member.dateJoinedChurch,
      member.bornAgain.status ? 'Yes' : 'No',
      member.waterBaptized.status ? 'Yes' : 'No',
      member.ministries.join(', ')
    ]);

    doc.autoTable({
      head: [['Name', 'Age Group', 'Gender', 'Phone', 'Email', 'Joined', 'Born Again', 'Baptized', 'Ministries']],
      body: tableData,
      startY: 35,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [59, 130, 246] }, // blue-600
      alternateRowStyles: { fillColor: [249, 250, 251] }, // gray-50
    });

    const fileName = `harvest_house_members_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    throw new Error('Failed to export members to PDF');
  }
}

export function printMemberProfile(member: Member): void {
  try {
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      throw new Error('Unable to open print window');
    }

    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Member Profile - ${member.fullName}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .section { margin-bottom: 20px; }
            .section h3 { color: #1e40af; border-bottom: 2px solid #1e40af; padding-bottom: 5px; }
            .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
            .info-item { margin-bottom: 10px; }
            .label { font-weight: bold; }
            .ministries { display: flex; flex-wrap: wrap; gap: 5px; }
            .ministry-tag { background: #fef3c7; padding: 2px 8px; border-radius: 4px; font-size: 12px; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Harvest House International</h1>
            <h2>Member Profile</h2>
            <h3>${member.fullName}</h3>
          </div>
          
          <div class="section">
            <h3>Personal Information</h3>
            <div class="info-grid">
              <div class="info-item"><span class="label">Full Name:</span> ${member.fullName}</div>
              <div class="info-item"><span class="label">Gender:</span> ${member.gender}</div>
              <div class="info-item"><span class="label">Date of Birth:</span> ${new Date(member.dateOfBirth).toLocaleDateString()}</div>
              <div class="info-item"><span class="label">Age Group:</span> ${member.ageGroup}</div>
              <div class="info-item"><span class="label">Marital Status:</span> ${member.maritalStatus}</div>
              <div class="info-item"><span class="label">Occupation:</span> ${member.occupation}</div>
              ${member.nationalId ? `<div class="info-item"><span class="label">National ID:</span> ${member.nationalId}</div>` : ''}
            </div>
          </div>

          <div class="section">
            <h3>Contact Information</h3>
            <div class="info-grid">
              <div class="info-item"><span class="label">Phone:</span> ${member.phone}</div>
              <div class="info-item"><span class="label">Email:</span> ${member.email}</div>
              <div class="info-item" style="grid-column: 1 / -1;"><span class="label">Address:</span> ${member.address}</div>
            </div>
          </div>

          <div class="section">
            <h3>Church Information</h3>
            <div class="info-grid">
              <div class="info-item"><span class="label">Date Joined:</span> ${new Date(member.dateJoinedChurch).toLocaleDateString()}</div>
              ${member.invitedBy ? `<div class="info-item"><span class="label">Invited By:</span> ${member.invitedBy}</div>` : ''}
            </div>
          </div>

          <div class="section">
            <h3>Spiritual Status</h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="label">Born Again:</span> ${member.bornAgain.status ? 'Yes' : 'No'}
                ${member.bornAgain.date ? ` (${new Date(member.bornAgain.date).toLocaleDateString()})` : ''}
              </div>
              <div class="info-item">
                <span class="label">Water Baptized:</span> ${member.waterBaptized.status ? 'Yes' : 'No'}
                ${member.waterBaptized.date ? ` (${new Date(member.waterBaptized.date).toLocaleDateString()})` : ''}
              </div>
              <div class="info-item" style="grid-column: 1 / -1;">
                <span class="label">Spirit Baptized:</span> ${member.spiritBaptized.status ? 'Yes' : 'No'}
                ${member.spiritBaptized.date ? ` (${new Date(member.spiritBaptized.date).toLocaleDateString()})` : ''}
              </div>
            </div>
          </div>

          ${member.ministries.length > 0 ? `
            <div class="section">
              <h3>Ministry Involvement</h3>
              <div class="ministries">
                ${member.ministries.map(ministry => `<span class="ministry-tag">${ministry}</span>`).join('')}
              </div>
            </div>
          ` : ''}

          ${member.notes ? `
            <div class="section">
              <h3>Notes</h3>
              <p>${member.notes}</p>
            </div>
          ` : ''}

          <div class="section" style="margin-top: 40px; text-align: center; font-size: 12px; color: #666;">
            <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
    printWindow.focus();
    printWindow.print();
  } catch (error) {
    console.error('Error printing member profile:', error);
    throw new Error('Failed to print member profile');
  }
}