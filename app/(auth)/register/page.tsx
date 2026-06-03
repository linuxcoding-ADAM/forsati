'use client';
import { redirect } from 'next/navigation';
// Redirect old /register to /sign-up
export default function RegisterPage() {
  redirect('/sign-up');
}