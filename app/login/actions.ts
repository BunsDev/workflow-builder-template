import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { headers } from 'next/headers';

export async function signInAction(formData: FormData) {
  'use server';
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  if (!email || !password) {
    redirect('/login?error=' + encodeURIComponent('Email and password are required'));
  }

  try {
    await auth.api.signInEmail({
      body: {
        email,
        password,
      },
      headers: await headers(),
    });
  } catch (error) {
    console.error('Sign in error:', error);
    redirect('/login?error=' + encodeURIComponent('Invalid email or password'));
  }

  redirect('/');
}

export async function signUpAction(formData: FormData) {
  'use server';
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const name = formData.get('name') as string;

  if (!email || !password || !name) {
    redirect('/login?mode=signup&error=' + encodeURIComponent('All fields are required'));
  }

  try {
    await auth.api.signUpEmail({
      body: {
        email,
        password,
        name,
      },
      headers: await headers(),
    });
  } catch (error) {
    console.error('Sign up error:', error);
    redirect(
      '/login?mode=signup&error=' +
        encodeURIComponent('Failed to create account. Email may already be in use.'),
    );
  }

  redirect('/');
}
