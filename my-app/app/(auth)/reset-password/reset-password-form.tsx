'use client'

import { useActionState } from 'react'
import {
  updatePassword,
  type ActionState,
} from '@/app/(auth)/password-reset-actions'

const initialState: ActionState = {}

export function ResetPasswordForm() {
  const [state, formAction, pending] = useActionState(
    updatePassword,
    initialState,
  )

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <div>
        <label htmlFor="password" className="text-sm font-medium text-[#06152B]">
          New password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="new-password"
          minLength={8}
          maxLength={72}
          required
          className="mt-1 w-full rounded-md border border-[#AAB4C0] bg-white px-3 py-2 text-sm text-[#06152B] outline-none focus:border-[#0F62FE]"
        />
        <p className="mt-1 text-xs text-[#7A8694]">
          8–72 characters, including a letter and a number.
        </p>
      </div>

      <div>
        <label htmlFor="confirmPassword" className="text-sm font-medium text-[#06152B]">
          Confirm new password
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          autoComplete="new-password"
          maxLength={72}
          required
          className="mt-1 w-full rounded-md border border-[#AAB4C0] bg-white px-3 py-2 text-sm text-[#06152B] outline-none focus:border-[#0F62FE]"
        />
      </div>

      {state.error && (
        <p role="alert" className="text-sm text-[#B42318]">
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="w-full rounded-md bg-[#0F62FE] px-4 py-3 text-sm font-semibold text-white transition hover:bg-[#0353E9] disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? 'Updating...' : 'Update password'}
      </button>
    </form>
  )
}