// Starts the OAuth2 flow by navigating to the backend Spring Security endpoint.
// We use a plain anchor (full page navigation) — NOT fetch or Axios — because
// this is a redirect flow that the browser must follow end-to-end.
//
// Flow:
//   1. Click → GET /oauth2/authorization/google
//   2. Spring redirects to Google
//   3. Google redirects back to backend callback
//   4. OAuth2AuthenticationSuccessHandler sets refresh cookie
//   5. Backend redirects browser to /oauth2/callback (frontend)
//   6. OAuthCallbackPage calls /auth/refresh, stores token, navigates to /dashboard

export default function GoogleLoginButton() {
  return (
    <a
      href="/oauth2/authorization/google"
      className="flex items-center justify-center gap-2 rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
    >
      <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
        <path
          fill="#4285F4"
          d="M22.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h5.9c-.3 1.4-1 2.6-2.2 3.4v2.8h3.6c2.1-1.9 3.2-4.8 3.2-8.4z"
        />
        <path
          fill="#34A853"
          d="M12 23c3 0 5.5-1 7.3-2.7l-3.6-2.8c-1 .7-2.3 1.1-3.7 1.1-2.9 0-5.3-1.9-6.2-4.5H2.1v2.8C3.9 20.4 7.7 23 12 23z"
        />
        <path
          fill="#FBBC05"
          d="M5.8 14.1c-.2-.7-.4-1.4-.4-2.1s.1-1.4.4-2.1V7.1H2.1C1.4 8.6 1 10.3 1 12s.4 3.4 1.1 4.9l3.7-2.8z"
        />
        <path
          fill="#EA4335"
          d="M12 5.4c1.6 0 3.1.6 4.2 1.7l3.2-3.2C17.5 2 15 1 12 1 7.7 1 3.9 3.6 2.1 7.1l3.7 2.8C6.7 7.3 9.1 5.4 12 5.4z"
        />
      </svg>
      Continue with Google
    </a>
  );
}
