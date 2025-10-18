import React, { useRef, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface CodeInputProps {
  value: string;
  onChange: (value: string) => void;
  length?: number;
}

export const CodeInput: React.FC<CodeInputProps> = ({ value, onChange, length = 5 }) => {
  const [code, setCode] = useState<string[]>(Array(length).fill(''));
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    // Sync external value to internal state
    const digits = value.padEnd(length, '').split('').slice(0, length);
    setCode(digits);
  }, [value, length]);

  const handleChange = (index: number, digit: string) => {
    // Only allow digits
    if (digit && !/^\d$/.test(digit)) return;

    const newCode = [...code];
    newCode[index] = digit;
    setCode(newCode);
    onChange(newCode.join(''));

    // Auto-focus next input
    if (digit && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (!code[index] && index > 0) {
        // Move to previous input on backspace if current is empty
        inputRefs.current[index - 1]?.focus();
      } else {
        // Clear current input
        const newCode = [...code];
        newCode[index] = '';
        setCode(newCode);
        onChange(newCode.join(''));
      }
    } else if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === 'ArrowRight' && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length);
    const newCode = pastedData.padEnd(length, '').split('');
    setCode(newCode);
    onChange(pastedData);
    
    // Focus the next empty input or the last one
    const nextEmptyIndex = newCode.findIndex(digit => !digit);
    const focusIndex = nextEmptyIndex !== -1 ? nextEmptyIndex : length - 1;
    inputRefs.current[focusIndex]?.focus();
  };

  console.log('🔢 CodeInput rendering with:', { code, length, value });

  return (
    <div className="flex gap-3 justify-center my-4" style={{ minHeight: '80px' }}>
      {code.map((digit, index) => (
        <input
          key={index}
          ref={(el) => (inputRefs.current[index] = el)}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          autoFocus={index === 0}
          style={{
            width: '56px',
            height: '64px',
            fontSize: '24px',
            fontWeight: 'bold',
            textAlign: 'center',
            border: '3px solid hsl(var(--primary))',
            borderRadius: '8px',
            backgroundColor: digit ? 'hsl(var(--primary) / 0.1)' : 'hsl(var(--background))',
            color: 'hsl(var(--foreground))',
            outline: 'none',
            transition: 'all 0.2s',
          }}
          className="focus:ring-4 focus:ring-primary/50 hover:shadow-lg"
        />
      ))}
    </div>
  );
};
