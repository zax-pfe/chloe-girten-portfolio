"use client";

// Copies the email address to the clipboard on click.
export default function CopyEmail({ email, className }) {
  const handleClick = () => navigator.clipboard.writeText(email);

  return (
    <button type="button" className={className} onClick={handleClick} aria-label={`Copier ${email}`}>
      {email}
    </button>
  );
}
