import React from 'react';
export function Button({ variant = 'primary', size = 'md', className = '', ...props }: any) {
  const base = "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none disabled:opacity-50 disabled:pointer-events-none";
  const variants = {
    primary: "bg-primary text-black hover:bg-primaryHover",
    secondary: "bg-surface text-white hover:bg-surfaceHover border border-border",
    ghost: "bg-transparent hover:bg-surface text-gray-300"
  };
  const sizes = { sm: "h-8 px-3 text-xs", md: "h-10 px-4 text-sm", lg: "h-12 px-8 text-base" };
  return <button className={`${base} ${variants[variant as keyof typeof variants]} ${sizes[size as keyof typeof sizes]} ${className}`} {...props} />;
}