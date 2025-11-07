import { SignIn } from "@clerk/nextjs";
import { ClerkLoaded, ClerkLoading } from '@clerk/nextjs'
import { Luggage } from 'lucide-react'


export default function SignInPage() {
  return (
    <div className="relative w-full min-h-screen bg-gray-50 flex items-center justify-center py-12">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-5 pointer-events-none" 
           style={{
             backgroundImage: `radial-gradient(circle, #6366f1 1px, transparent 1px)`,
             backgroundSize: '30px 30px'
           }}>
      </div>

      <ClerkLoaded>
        <div className="flex flex-col items-center gap-6 w-full max-w-md mx-auto px-4 relative z-10">
          {/* Logo and App Name */}
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-linear-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md">
              <Luggage className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold text-gray-900">TripVault</span>
          </div>

          {/* Welcome Text */}
          <div className="text-center space-y-2 mb-4">
            <h1 className="text-3xl font-bold text-gray-900">
              Sign in to TripVault
            </h1>
            <p className="text-gray-600 text-sm">
              Sign in to continue managing your trips and expenses
            </p>
          </div>

          {/* Sign In Component */}
          <div className="w-full bg-white rounded-xl overflow-hidden shadow-lg border border-gray-200">
            <SignIn 
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
                  borderRadius: "0.5rem",
                },
                elements: {
                  rootBox: "w-full",
                  card: "bg-white shadow-none w-full border-0",
                  headerTitle: "text-2xl font-bold text-gray-900",
                  headerSubtitle: "text-gray-600",
                  socialButtonsBlockButton: 
                    "bg-white border border-gray-300 hover:bg-gray-50 transition-all text-gray-700 font-medium",
                  socialButtonsBlockButtonText: "text-gray-700 font-medium",
                  formButtonPrimary:
                    "bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 transition-all text-white font-semibold shadow-md normal-case",
                  formFieldInput:
                    "bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-blue-500/20",
                  formFieldLabel: "text-gray-700 font-medium",
                  footerActionLink: "text-blue-600 hover:text-blue-700 font-medium",
                  identityPreviewText: "text-gray-900",
                  identityPreviewEditButton: "text-blue-600 hover:text-blue-700",
                  formFieldInputShowPasswordButton: "text-gray-500 hover:text-gray-700",
                  formHeaderTitle: "text-gray-900",
                  formHeaderSubtitle: "text-gray-600",
                  dividerLine: "bg-gray-200",
                  dividerText: "text-gray-500",
                  footerActionText: "text-gray-600",
                  otpCodeFieldInput: "border-gray-300 text-gray-900 bg-gray-50",
                  formResendCodeLink: "text-blue-600 hover:text-blue-700",
                  alertText: "text-sm",
                  formFieldErrorText: "text-red-600 text-xs",
                },
              }}
            />
          </div>

          {/* Additional Info */}
          <div className="text-center text-xs text-gray-500 mt-4">
            <p>Secure sign-in powered by Clerk</p>
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
          <p className="text-gray-600 text-sm">Loading sign in...</p>
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
