
import React from 'react';
import { Check } from 'lucide-react';
import { Step } from '../types';

interface StepperOSAProps {
  currentStep: Step;
  servicePackage?: string;
}

const StepperOSA: React.FC<StepperOSAProps> = ({ currentStep, servicePackage }) => {
  const allSteps = [
    { id: Step.CUSTOMER_INFO, label: 'Thông tin khách hàng' },
    { id: Step.PAYMENT_QR, label: 'Thanh toán' },
    { id: Step.SEARCHING, label: 'Tìm kiếm cứu hộ' }
  ];

  // Ẩn bước thanh toán nếu khách hàng đã có gói
  const steps = allSteps.filter(step => {
    if (step.id === Step.PAYMENT_QR && servicePackage !== "Không có") {
      return false;
    }
    return true;
  });

  const getStepStatus = (stepId: number) => {
    // Xử lý các sub-step (RESCUE_LIST thuộc về SEARCHING)
    if (stepId === Step.SEARCHING) {
      if (currentStep === Step.SEARCHING || currentStep === Step.RESCUE_LIST) return 'active';
      if (currentStep > Step.RESCUE_LIST) return 'completed';
      return 'pending';
    }

    if (currentStep > stepId) return 'completed';
    if (currentStep === stepId) return 'active';
    return 'pending';
  };

  return (
    <div className="flex items-center justify-center space-x-4 px-10 overflow-x-auto pb-2">
      {steps.map((step, index) => {
        const status = getStepStatus(step.id);
        const stepDisplayNumber = index + 1;
        
        return (
          <React.Fragment key={step.id}>
            <div className="flex items-center space-x-2 shrink-0">
              <div 
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-500
                  ${status === 'completed' || status === 'active'
                    ? 'bg-vetc-green border-vetc-green text-white scale-110 shadow-sm' 
                    : 'bg-gray-100 border-gray-300 text-gray-400'}`}
              >
                {status === 'completed' ? <Check size={18} /> : stepDisplayNumber}
              </div>
              <span className={`text-sm font-medium transition-colors duration-500 whitespace-nowrap ${status !== 'pending' ? 'text-gray-800' : 'text-gray-400'}`}>
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className={`flex-1 h-0.5 min-w-[20px] max-w-[80px] transition-all duration-500 ${status === 'completed' ? 'bg-vetc-green' : 'bg-gray-200'}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
};

export default StepperOSA;
