import { useState, type InputHTMLAttributes, forwardRef } from 'react';

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>;

export const PasswordInput = forwardRef<HTMLInputElement, Props>(function PasswordInput(
  props,
  ref,
) {
  const [show, setShow] = useState(false);
  return (
    <span style={{ display: 'inline-flex', gap: 4 }}>
      <input ref={ref} type={show ? 'text' : 'password'} {...props} />
      <button
        type="button"
        onClick={() => setShow((s) => !s)}
        aria-label={show ? '비밀번호 숨기기' : '비밀번호 보기'}
        aria-pressed={show}
      >
        {show ? '숨기기' : '보기'}
      </button>
    </span>
  );
});
