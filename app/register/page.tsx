import { Suspense } from "react"
import RegisterForm from "@/components/auth/register-form"

export default function RegisterPage() {
  return (
    <div className="container flex items-center justify-center min-h-screen py-12">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold mb-8 text-center">HabitHubus</h1>
        <Suspense fallback={<div className="w-full h-64 flex items-center justify-center">Загрузка...</div>}>
          <RegisterForm />
        </Suspense>
      </div>
    </div>
  )
}

