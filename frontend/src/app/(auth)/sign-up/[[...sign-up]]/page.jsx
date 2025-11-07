import { SignUp } from "@clerk/nextjs";
import { ClerkLoaded, ClerkLoading } from '@clerk/nextjs'
import { Luggage } from 'lucide-react'


export default function SignUpPage() {
  return (
    <div className="relative min-h-screen w-full bg-gray-50 flex items-center justify-center py-12">
      {/* Background decorative pattern - subtle */}
      <div 
        className="absolute inset-0 -z-10 opacity-40"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgb(99 102 241 / 0.15) 1px, transparent 0)`,
          backgroundSize: '40px 40px'
        }}
      />

      <ClerkLoaded>
        <div className="w-full max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Left: marketing / splash - hidden on small screens */}
            <div className="hidden md:flex flex-col gap-6 pr-6">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-linear-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md">
                  <Luggage className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">TripVault</p>
                  <p className="text-xs text-gray-600">Organize trips, track expenses</p>
                </div>
              </div>

              <h2 className="text-4xl font-extrabold text-gray-900 leading-tight">Start managing your trip expenses effortlessly</h2>
              <p className="text-gray-600 max-w-xl">Join TripVault to organize trips, split expenses, and settle balances with your group.</p>

              <ul className="space-y-3 mt-4">
                <li className="flex items-start gap-3 text-gray-700">
                  <span className="mt-1 inline-block w-2 h-2 rounded-full bg-blue-500" />
                  <span>Easy expense splitting</span>
                </li>
                <li className="flex items-start gap-3 text-gray-700">
                  <span className="mt-1 inline-block w-2 h-2 rounded-full bg-indigo-500" />
                  <span>Secure authentication</span>
                </li>
                <li className="flex items-start gap-3 text-gray-700">
                  <span className="mt-1 inline-block w-2 h-2 rounded-full bg-blue-600" />
                  <span>Built for groups</span>
                </li>
              </ul>
              
            </div>

            {/* Right: sign up card */}
            <div className="flex justify-center">
              <div className="w-full max-w-md bg-white border border-gray-200 rounded-3xl p-6 md:p-8 shadow-lg">
                <div className="flex flex-col items-center gap-4 mb-2">
                  <div className="w-12 h-12 rounded-lg bg-linear-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md">
                    <Luggage className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-semibold text-gray-900">Create your account</h3>
                  <p className="text-sm text-gray-600 text-center">Sign up to get started with TripVault</p>
                </div>                <div className="w-full">
                  <SignUp
                    appearance={{
                      layout: {
                        socialButtonsVariant: "blockButton",
                        socialButtonsPlacement: "bottom",
                      },
                      variables: {
                        colorPrimary: "#4F46E5",
                        colorBackground: "#FFFFFF",
                        colorText: "#111827",
                        colorTextSecondary: "#6B7280",
                        colorTextOnPrimaryBackground: "#FFFFFF",
                        colorInputBackground: "#F9FAFB",
                        colorInputText: "#111827",
                        fontFamily: "var(--font-geist-sans), Inter, sans-serif",
                        borderRadius: "0.75rem",
                      },
                      elements: {
                        rootBox: "w-full",
                        card: "bg-transparent w-full shadow-none",
                        headerTitle: "text-2xl font-bold text-gray-900",
                        headerSubtitle: "text-gray-600",
                        socialButtonsBlockButton:
                          "bg-white border border-gray-300 hover:bg-gray-50 transition-all text-gray-900 font-medium w-full",
                        socialButtonsBlockButtonText: "text-gray-900 font-medium",
                        formButtonPrimary:
                          "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all text-white font-semibold shadow-md active:scale-95 normal-case w-full",
                        formFieldInput:
                          "bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-indigo-500 focus:ring-indigo-500/20",
                        formFieldLabel: "text-gray-700 font-medium",
                        footerActionLink: "text-indigo-600 hover:text-indigo-700 font-medium",
                        identityPreviewText: "text-gray-900",
                        identityPreviewEditButton: "text-indigo-600 hover:text-indigo-700",
                        formFieldInputShowPasswordButton: "text-gray-600 hover:text-gray-900",
                        formHeaderTitle: "text-gray-900",
                        formHeaderSubtitle: "text-gray-600",
                        dividerLine: "hidden",
                        dividerText: "hidden",
                        footerActionText: "text-gray-600",
                        otpCodeFieldInput: "border-gray-300 text-gray-900 bg-gray-50",
                        formResendCodeLink: "text-indigo-600 hover:text-indigo-700",
                        alertText: "text-sm",
                        formFieldErrorText: "text-red-600 text-xs",
                      },
                    }}
                  />
                </div>

                <div className="mt-4 text-center text-xs text-gray-500">Secure sign-up powered by Clerk</div>
              </div>
            </div>
          </div>
        </div>
      </ClerkLoaded>

      <ClerkLoading>
        <div className="flex flex-col items-center gap-4">
          <div className="flex space-x-2">
            <div className="w-3 h-3 bg-blue-600 rounded-full animate-bounce"></div>
            <div className="w-3 h-3 bg-indigo-600 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
            <div className="w-3 h-3 bg-blue-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
          </div>
          <p className="text-gray-600 text-sm">Loading sign up...</p>
        </div>
      </ClerkLoading>

      {/* Footer */}
      <div className="absolute bottom-8 left-0 right-0 text-center">
        <p className="text-xs text-gray-500">
          © 2025 TripVault. All rights reserved.
        </p>
      </div>
    </div>
  )
}
