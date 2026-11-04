"use client";

import ContactLink from "../ContactLink/ContactLink";

// Copies the email address to the clipboard on click.
export default function CopyEmail({ email, className }) {
  const handleClick = () => navigator.clipboard.writeText(email);

  return (
    <ContactLink className={className} onClick={handleClick} aria-label={`Copier ${email}`}>
      {email}
    </ContactLink>
  );
}
