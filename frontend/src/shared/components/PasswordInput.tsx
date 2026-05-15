import { useState } from 'react';

interface PasswordInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  id?: string;
  name?: string;
  placeholder?: string;
  'aria-label'?: string;
}

export function PasswordInput({ value, onChange, id, name, placeholder, 'aria-label': ariaLabel }: PasswordInputProps) {
  const [show, setShow] = useState(false);

  return (
    <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
      <input
        type={show ? 'text' : 'password'}
        id={id}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        aria-label={ariaLabel}
        style={{
          width: '100%',
          padding: '8px 40px 8px 12px',
          border: '1px solid var(--color-border-strong)',
          borderRadius: 'var(--radius-md)',
          fontSize: '14px',
          color: 'var(--color-text)',
          outline: 'none',
          boxSizing: 'border-box',
        }}
      />
      <button
        type="button"
        aria-pressed={show}
        aria-label={show ? '비밀번호 숨기기' : '비밀번호 보기'}
        onClick={() => setShow((prev) => !prev)}
        style={{
          position: 'absolute',
          right: '8px',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--color-text-muted)',
          padding: '0',
          fontSize: '12px',
        }}
      >
        {show ? '숨기기' : '보기'}
      </button>
    </div>
  );
}
