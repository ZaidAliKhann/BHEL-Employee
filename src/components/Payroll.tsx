import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import { 
  Download, Wallet, CalendarRange, Scale, ShieldCheck, 
  HelpCircle, Printer, FileText, BadgeCheck
} from 'lucide-react';
import { Employee, SalaryRecord } from '../types';

interface PayrollProps {
  employee: Employee;
  salaries: SalaryRecord[];
}

export default function Payroll({
  employee,
  salaries
}: PayrollProps) {
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(
    salaries.length > 0 ? salaries[0].id : null
  );

  const selectedRecord = salaries.find(s => s.id === selectedRecordId) || salaries[0];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handleDownloadPdf = (record: SalaryRecord) => {
    if (!record) return;

    const doc = new jsPDF();
    const primaryColor = "#0b132b";
    
    // Header background bar
    doc.setFillColor(11, 15, 25); // Dark blue-slate
    doc.rect(0, 0, 210, 40, 'F');
    
    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(22);
    doc.text("BHARAT HEAVY ELECTRICALS LIMITED", 15, 20);
    
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(10);
    doc.text("BHEL House, Siri Fort, New Delhi - 110049, India | Corporate Payroll Division", 15, 28);
    
    // Horizontal separator
    doc.setDrawColor(200, 200, 200);
    doc.line(15, 48, 195, 48);
    
    // Document Title
    doc.setTextColor(11, 15, 25);
    doc.setFont("Helvetica", "bold");
    doc.setFontSize(14);
    doc.text(`SALARY PAYSLIP - ${record.month.toUpperCase()} ${record.year}`, 15, 58);
    
    // Metadata Block
    doc.setFont("Helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(80, 80, 80);
    
    doc.text(`Payslip ID: ${record.id}`, 15, 66);
    doc.text(`Disbursal Date: ${record.paidAt ? new Date(record.paidAt).toLocaleDateString() : 'N/A'}`, 15, 72);
    doc.text(`Status: DISBURSED`, 15, 78);
    
    // Employee Details Section
    doc.setDrawColor(220, 220, 220);
    doc.setFillColor(245, 247, 250);
    doc.rect(15, 85, 180, 35, 'F');
    doc.rect(15, 85, 180, 35, 'D');
    
    doc.setTextColor(11, 15, 25);
    doc.setFont("Helvetica", "bold");
    doc.text("EMPLOYEE SPECIFICATION", 20, 93);
    
    doc.setFont("Helvetica", "normal");
    doc.setTextColor(50, 50, 50);
    doc.text(`Employee Name: ${employee.name}`, 20, 100);
    doc.text(`Employee ID: ${employee.id}`, 20, 106);
    doc.text(`Designation: ${employee.designation}`, 20, 112);
    
    doc.text(`Department: ${employee.department}`, 110, 100);
    doc.text(`Reporting Manager: ${employee.reportingManager.split(' ')[0]}`, 110, 106);
    doc.text(`Date of Joining: ${employee.dateOfJoining}`, 110, 112);
    
    // Earnings & Deductions Tables
    doc.setFont("Helvetica", "bold");
    doc.setTextColor(11, 15, 25);
    doc.text("EARNINGS & BREAKDOWN", 15, 133);
    doc.text("DEDUCTIONS & TAX", 110, 133);
    
    // Draw table boxes
    doc.rect(15, 138, 85, 45); // Earnings
    doc.rect(110, 138, 85, 45); // Deductions
    
    doc.setFont("Helvetica", "normal");
    doc.setTextColor(60, 60, 60);
    // Earnings items
    doc.text("Basic Salary", 20, 146);
    doc.text(`${formatCurrency(record.baseSalary)}`, 70, 146);
    doc.text("H.R.A.", 20, 154);
    doc.text(`${formatCurrency(record.hra)}`, 70, 154);
    doc.text("Special Allowances", 20, 162);
    doc.text(`${formatCurrency(record.allowances)}`, 70, 162);
    
    // Deductions items
    doc.text("Provident Fund (PF)", 115, 146);
    doc.text(`${formatCurrency(record.deductions * 0.7)}`, 165, 146);
    doc.text("Professional Tax (PT)", 115, 154);
    doc.text(`${formatCurrency(record.deductions * 0.2)}`, 165, 154);
    doc.text("Health Insurance Levy", 115, 162);
    doc.text(`${formatCurrency(record.deductions * 0.1)}`, 165, 162);
    
    // Section totals
    doc.setFont("Helvetica", "bold");
    doc.setTextColor(11, 15, 25);
    const totalEarnings = record.baseSalary + record.hra + record.allowances;
    doc.text("Gross Earnings", 20, 175);
    doc.text(`${formatCurrency(totalEarnings)}`, 70, 175);
    
    doc.text("Total Deductions", 115, 175);
    doc.text(`${formatCurrency(record.deductions)}`, 165, 175);
    
    // Net Payable Section
    doc.setFillColor(235, 245, 255);
    doc.rect(15, 192, 180, 18, 'F');
    doc.rect(15, 192, 180, 18, 'D');
    
    doc.setTextColor(25, 118, 210); // Royal blue
    doc.setFontSize(12);
    doc.text("NET PAYABLE AMOUNT", 22, 203);
    doc.text(`${formatCurrency(record.netSalary)}`, 140, 203);
    
    // Footer notes and certification
    doc.setFontSize(9);
    doc.setFont("Helvetica", "italic");
    doc.setTextColor(100, 100, 100);
    doc.text("This is an electronically transmitted document authenticated via BHEL Corporate Single Sign-On.", 15, 230);
    doc.text("No physical signature is required. For verification contact: payroll_support@bhel.in", 15, 235);
    
    // Stamp block
    doc.setDrawColor(25, 118, 210);
    doc.setFillColor(255, 255, 255);
    doc.rect(145, 245, 45, 20);
    doc.setTextColor(25, 118, 210);
    doc.setFontSize(9);
    doc.setFont("Helvetica", "bold");
    doc.text("BHEL CORP", 155, 253);
    doc.text("CSO VERIFIED", 151, 260);
    
    // Save Document
    doc.save(`BHEL_Payslip_${record.month}_${record.year}.pdf`);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* List of Slips & Detailed Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Slips table */}
        <div className="lg:col-span-1 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-display text-sm font-bold text-slate-900 uppercase tracking-wider mb-1">Payroll History</h3>
            <p className="text-xs text-slate-500 mb-4 font-semibold">Select a cycle month to inspect the specific salary disbursal.</p>
          </div>

          <div className="space-y-3 max-h-[380px] overflow-y-auto custom-scrollbar">
            {salaries.length === 0 ? (
              <p className="text-xs text-slate-400 py-8 text-center">No payroll records logged.</p>
            ) : (
              salaries.map((record) => {
                const isSelected = selectedRecordId === record.id;
                return (
                  <div
                    key={record.id}
                    onClick={() => setSelectedRecordId(record.id)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      isSelected 
                        ? 'bg-blue-50 border-blue-400 text-blue-700 shadow-sm' 
                        : 'bg-slate-50/50 border-slate-100 hover:border-slate-200 text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold font-display uppercase tracking-wider">{record.month} {record.year}</span>
                      <span className="text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded font-extrabold uppercase">Disbursed</span>
                    </div>
                    <div className="flex items-center justify-between mt-3">
                      <span className="text-base font-mono font-extrabold text-slate-950">{formatCurrency(record.netSalary)}</span>
                      <span className="text-[10px] flex items-center gap-1 font-bold text-blue-600 hover:underline">
                        <FileText className="h-3.5 w-3.5" /> Inspect Details
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Breakdown Card */}
        {selectedRecord && (
          <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-5">
                <div>
                  <h3 className="font-display text-sm font-bold text-slate-900 uppercase tracking-wider">Salary Statement Breakdown</h3>
                  <p className="text-xs text-slate-500 mt-0.5 font-semibold">Disbursal details for {selectedRecord.month} {selectedRecord.year}</p>
                </div>

                <button
                  onClick={() => handleDownloadPdf(selectedRecord)}
                  className="flex items-center justify-center gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 px-4 py-2.5 text-xs font-semibold text-white transition-all shadow-md shadow-blue-600/10 cursor-pointer shrink-0"
                >
                  <Download className="h-4 w-4 shrink-0" />
                  Download PDF Payslip
                </button>
              </div>

              {/* Net Salary Highlight */}
              <div className="p-5 rounded-xl bg-blue-50/60 border border-blue-100/70 flex items-center justify-between mb-6 shadow-inner">
                <div>
                  <span className="text-[10px] text-blue-600 font-bold uppercase tracking-wider block">Net Payable Amount</span>
                  <span className="text-3xl font-mono font-extrabold text-slate-950 tracking-tight mt-1.5 block">
                    {formatCurrency(selectedRecord.netSalary)}
                  </span>
                </div>
                <div className="text-right">
                  <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-3 py-1 text-xs font-bold text-emerald-700">
                    <BadgeCheck className="h-4 w-4" /> Bank Disbursed
                  </span>
                  <span className="block text-[9px] text-slate-400 font-mono mt-1.5">Ref: BHEL_SSO_PAY_{selectedRecord.id}</span>
                </div>
              </div>

              {/* Earnings vs Deductions Split */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Earnings */}
                <div className="p-5 rounded-xl bg-slate-50 border border-slate-100 shadow-sm">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 pb-2 border-b border-slate-200/60 flex items-center justify-between">
                    <span>Corporate Earnings</span>
                    <span className="text-emerald-700 font-mono font-extrabold">{formatCurrency(selectedRecord.baseSalary + selectedRecord.hra + selectedRecord.allowances)}</span>
                  </h4>
                  
                  <div className="space-y-3.5 text-xs font-semibold text-slate-600">
                    <div className="flex justify-between items-center">
                      <span>Basic Corporate Salary</span>
                      <span className="text-slate-900 font-bold font-mono">{formatCurrency(selectedRecord.baseSalary)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>House Rent Allowance (HRA)</span>
                      <span className="text-slate-900 font-bold font-mono">{formatCurrency(selectedRecord.hra)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Dearness & Special Allowance</span>
                      <span className="text-slate-900 font-bold font-mono">{formatCurrency(selectedRecord.allowances)}</span>
                    </div>
                  </div>
                </div>

                {/* Deductions */}
                <div className="p-5 rounded-xl bg-slate-50 border border-slate-100 shadow-sm">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3 pb-2 border-b border-slate-200/60 flex items-center justify-between">
                    <span>Regulatory Deductions</span>
                    <span className="text-rose-700 font-mono font-extrabold">{formatCurrency(selectedRecord.deductions)}</span>
                  </h4>
                  
                  <div className="space-y-3.5 text-xs font-semibold text-slate-600">
                    <div className="flex justify-between items-center">
                      <span>Provident Fund (PF)</span>
                      <span className="text-slate-900 font-bold font-mono">{formatCurrency(selectedRecord.deductions * 0.7)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Professional Tax (PT)</span>
                      <span className="text-slate-900 font-bold font-mono">{formatCurrency(selectedRecord.deductions * 0.2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Health Insurance Levy</span>
                      <span className="text-slate-900 font-bold font-mono">{formatCurrency(selectedRecord.deductions * 0.1)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-start gap-2.5 p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-500 font-medium">
              <HelpCircle className="h-4 w-4 text-slate-400 shrink-0 mt-0.5" />
              <p>
                * Under central PSU rules, employee TDS and salary increments are governed strictly by the 3rd Pay Revision Committee guidelines. Tax computations are finalized at the closure of each financial cycle.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
