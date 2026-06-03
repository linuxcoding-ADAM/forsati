'use client';
import { redirect } from 'next/navigation';
// Redirect old /login to /sign-in
export default function LoginPage() {
  redirect('/sign-in');
}