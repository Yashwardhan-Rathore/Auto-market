'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import { useState } from 'react';
import { Loader2, ArrowLeft } from 'lucide-react';
import apiClient from '@/lib/apiClient';

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [emailSubmitted, setEmailSubmitted] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const email = watch('email');

  const onSubmit = async (data: ForgotPasswordForm) => {
    setServerError('');
    try {
      const response = await apiClient.post('/api/auth/forgot-password/', data);
      const result = response.data;

      toast.success('OTP sent successfully! Check your email.');
      setOtpSent(true);
      setEmailSubmitted(data.email);
      
      // Redirect to reset password page after 2 seconds
      setTimeout(() => {
        router.push(`/reset-password?email=${encodeURIComponent(data.email)}`);
      }, 2000);
    } catch (error: any) {
      const msg = error.response?.data?.detail || error.response?.data?.message || error.message || 'Failed to send OTP. Please try again.';
      setServerError(msg);
      toast.error(msg);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
            Reset your password
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Enter your email address and we'll send you an OTP to reset your password.
          </p>
        </div>

        {!otpSent ? (
          <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                {...register('email')}
                id="email"
                type="email"
                autoComplete="email"
                className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-blue-500 focus:outline-none focus:ring-blue-500 sm:text-sm"
                placeholder="Email address"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
              )}
            </div>

            {serverError && (
              <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
                {serverError}
              </div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => router.back()}
                className="flex w-full items-center justify-center gap-2 rounded-md border border-gray-300 bg-white py-2 px-4 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative flex w-full justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <Loader2 className="animate-spin h-5 w-5" />
                ) : (
                  'Send OTP'
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="mt-8 space-y-4 text-center">
            <div className="rounded-md bg-green-50 p-4">
              <p className="text-sm text-green-800">
                ✓ OTP has been sent to <strong>{emailSubmitted}</strong>
              </p>
            </div>
            <p className="text-sm text-gray-600">
              Redirecting to password reset page...
            </p>
            <button
              onClick={() => router.push(`/reset-password?email=${encodeURIComponent(emailSubmitted)}`)}
              className="w-full rounded-md bg-blue-600 py-2 px-4 text-sm font-medium text-white hover:bg-blue-700"
            >
              Continue to Reset Password
            </button>
          </div>
        )}

        <div className="text-center">
          <button
            onClick={() => router.push('/login')}
            className="text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            Back to Sign in
          </button>
        </div>
      </div>
    </div>
  );
}
