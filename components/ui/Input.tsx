import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({
  label,
  error,
  className,
  id,
  ...props
}: InputProps) {
  const inputId = id || props.name;
  
  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={inputId}>
          {label}
          {props.required && <span className="text-[var(--tdi-coral)] ml-1">*</span>}
        </label>
      )}
      <input
        id={inputId}
        className={cn(
          error && 'border-[var(--tdi-coral)]',
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm" style={{ color: 'var(--tdi-coral)' }}>
          {error}
        </p>
      )}
    </div>
  );
}

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({
  label,
  error,
  className,
  id,
  ...props
}: TextareaProps) {
  const textareaId = id || props.name;
  
  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={textareaId}>
          {label}
          {props.required && <span className="text-[var(--tdi-coral)] ml-1">*</span>}
        </label>
      )}
      <textarea
        id={textareaId}
        className={cn(
          'min-h-[120px] resize-y',
          error && 'border-[var(--tdi-coral)]',
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm" style={{ color: 'var(--tdi-coral)' }}>
          {error}
        </p>
      )}
    </div>
  );
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  placeholder?: string;
}

export function Select({
  label,
  error,
  options,
  placeholder = 'Select an option',
  className,
  id,
  ...props
}: SelectProps) {
  const selectId = id || props.name;
  
  return (
    <div className="mb-4">
      {label && (
        <label htmlFor={selectId}>
          {label}
          {props.required && <span className="text-[var(--tdi-coral)] ml-1">*</span>}
        </label>
      )}
      <select
        id={selectId}
        className={cn(
          'appearance-none bg-white',
          error && 'border-[var(--tdi-coral)]',
          className
        )}
        {...props}
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-1 text-sm" style={{ color: 'var(--tdi-coral)' }}>
          {error}
        </p>
      )}
    </div>
  );
}
