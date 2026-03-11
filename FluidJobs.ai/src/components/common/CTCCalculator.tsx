import React, { useState, useEffect } from 'react';

interface CTCCalculatorProps {
    initialCTC?: number;
    label?: string;
    isStipend?: boolean;
}

const CTCCalculator: React.FC<CTCCalculatorProps> = ({
    initialCTC = 0,
    label = 'Target Annual CTC',
    isStipend = false
}) => {
    const [ctcInput, setCtcInput] = useState<string>(
        initialCTC ? initialCTC.toLocaleString('en-IN') : ''
    );
    const [ctc, setCtc] = useState<number>(initialCTC || 0);

    useEffect(() => {
        if (initialCTC > 0 && ctc === 0) {
            setCtc(initialCTC);
            setCtcInput(initialCTC.toLocaleString('en-IN'));
        }
    }, [initialCTC]);

    const handleCTCChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        // Remove non-numeric characters before parsing
        const rawValue = e.target.value.replace(/[^0-9]/g, '');

        if (!rawValue) {
            setCtcInput('');
            setCtc(0);
            return;
        }

        const numericValue = parseInt(rawValue, 10);
        setCtc(numericValue);
        // Format with commas to display smoothly in the input
        setCtcInput(numericValue.toLocaleString('en-IN'));
    };

    if (isStipend) {
        return null; // Don't show CTC calculator for stipends/internships
    }

    const basic = ctc * 0.50;
    const hra = ctc * 0.20;
    const specialAllowance = ctc * 0.20;
    const pf = ctc * 0.10;

    return (
        <div className="mt-6 mb-4 p-5 border border-gray-200 rounded-lg bg-gray-50 shadow-sm">
            <h4 className="text-sm font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                </svg>
                Quick CTC Breakdown
            </h4>

            <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wider">{label} (INR)</label>
                <input
                    type="text"
                    value={ctcInput}
                    onChange={handleCTCChange}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-800 focus:border-gray-800 bg-white transition-all shadow-sm"
                    placeholder="Enter CTC to see breakdown"
                />
            </div>

            {ctc > 0 && (
                <div className="space-y-2.5 text-sm text-gray-600 bg-white p-4 rounded-md border border-gray-200 shadow-sm">
                    <div className="flex justify-between items-center py-1 border-b border-gray-100">
                        <span className="flex items-center gap-2">Basic Pay (50%)</span>
                        <span className="font-medium text-gray-800">INR {(basic).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-gray-100">
                        <span className="flex items-center gap-2">HRA (20%)</span>
                        <span className="font-medium text-gray-800">INR {(hra).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                    </div>
                    <div className="flex justify-between items-center py-1 border-b border-gray-100">
                        <span className="flex items-center gap-2">Special Allowance (20%)</span>
                        <span className="font-medium text-gray-800">INR {(specialAllowance).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                    </div>
                    <div className="flex justify-between items-center pt-2 mt-1 font-semibold text-gray-900 border-t border-gray-300">
                        <span className="flex items-center gap-2">PF Contribution (10%)</span>
                        <span>INR {(pf).toLocaleString('en-IN', { maximumFractionDigits: 0 })}</span>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CTCCalculator;
