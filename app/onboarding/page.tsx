'use client'

import { useActionState } from 'react'
import { completeOnboarding, type FormState } from './actions' // sesuaikan path import server action kamu

const initialState: FormState = {}

export default function OnboardingPage() {
  const [state, formAction, isPending] = useActionState(completeOnboarding, initialState)

  return (
    <form action={formAction}>
      {state.errors?.global && (
        <p className="text-red-500">{state.errors.global[0]}</p>
      )}

      <input name="shop_name" placeholder="Nama Usaha" />
      {state.errors?.shop_name && (
        <p className="text-red-500">{state.errors.shop_name[0]}</p>
      )}

      <input name="whatsapp_number" placeholder="Nomor WhatsApp" />
      {state.errors?.whatsapp_number && (
        <p className="text-red-500">{state.errors.whatsapp_number[0]}</p>
      )}

      <button type="submit" disabled={isPending}>
        {isPending ? 'Memproses...' : 'Simpan'}
      </button>
    </form>
  )
}
