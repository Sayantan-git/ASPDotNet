import type { Chapter } from '../types'

export const security: Chapter = {
  id: 'security',
  title: 'Security by design',
  description: 'Establish identity, enforce permissions, and protect data at every boundary.',
  level: 'Intermediate',
  accent: 'coral',
  lessons: [
    {
      id: 'authentication-and-authorization',
      title: 'Authentication is not authorization',
      subtitle: 'Knowing who made a request does not tell you what they may do.',
      minutes: 28,
      tags: [
        'authentication',
        'authorization',
        'ClaimsPrincipal',
        'schemes',
        'policies',
        '401',
        '403',
        'Identity',
      ],
      outcomes: [
        'Separate identity verification from permission checks.',
        'Explain schemes, claims, challenges, and forbids.',
        'Apply authorization at a trusted server boundary.',
      ],
      sections: [
        {
          title: 'Ask two different questions',
          body: '**Authentication** asks who the caller is, according to a trusted mechanism. **Authorization** asks whether that caller may perform this operation on this resource. A valid login does not grant permission to every task in the database. Checking only that a request has a token is insufficient; the token must be validated and its resulting identity must be authorized.\n\nASP.NET Core represents the current user with a ClaimsPrincipal. A claim is a statement such as a subject identifier, tenant, or permission. Claims only deserve trust because a configured mechanism validated their source and integrity. A client-provided user ID header is not authenticated identity by itself.',
        },
        {
          title: 'Schemes define authentication behavior',
          body: 'An authentication scheme names a handler and its options. Cookie and bearer handlers process different credentials. A default authenticate scheme establishes a principal, while challenge and forbid behavior tells unauthenticated or disallowed callers what happened. Multiple schemes require explicit design so the wrong credential source is not silently accepted.\n\n401 normally challenges authentication; 403 represents forbidden access. Browser-oriented cookie handlers may redirect in some contexts, while modern API endpoint behavior can use status responses. Configure and test the actual endpoint behavior rather than assuming every authentication failure returns JSON or every cookie handler redirects.',
        },
        {
          title: 'Enforce policy on the server',
          body: 'RequireAuthorization and Authorize metadata protect endpoints. Policies can require authenticated users, claims, roles, or custom requirements. UI hiding is only a convenience: a caller can send HTTP requests without using your UI. A fallback authorization policy can provide a secure default, with deliberately marked anonymous endpoints.\n\nASP.NET Core Identity provides account-management building blocks; it is not identical to every OAuth/OIDC identity provider. Prefer established identity systems for password handling, MFA, lockout, and recovery. These are difficult security protocols, not a few string comparisons. The examples focus on consuming a validated identity, not inventing an authentication service.',
        },
        {
          title: 'Role rules, policies, and anonymous exceptions',
          body: 'A role requirement names a role in a trusted identity. In a controller attribute, `[Authorize(Roles = "Admin,Manager")]` accepts either named role. Separate authorization attributes or requirements can combine as additional checks, so stacking them can require more than one condition. A policy can express claims or custom resource-aware requirements instead of spreading role names through business code.\n\n`[AllowAnonymous]` deliberately bypasses endpoint authorization requirements and should be used only for intended public operations. Test inherited controller metadata and fallback policies so a later refactor does not accidentally open a protected action. Public does not mean unvalidated, unlimited, or safe to expose secrets.\n\nBasic authentication encodes a username/password pair; Base64 is not encryption. TLS and a proper credential-validation mechanism are still required. An API key usually identifies a calling application or integration according to your system design, not automatically an end user. Keys can have scopes, storage, rotation, and lookup requirements. Do not memorize a universal table that labels every authentication method as always requiring, or never requiring, a database lookup.',
        },
      ],
      diagram: {
        title: 'Identity before permission',
        source:
          'flowchart LR\n  request["Request credential"] --> authn["Validate authentication"]\n  authn --> identity["Trusted ClaimsPrincipal"]\n  identity --> authz{"Policy permits operation?"}\n  authz -->|Yes| endpoint["Endpoint"]\n  authz -->|No| forbidden["Forbid / challenge"]',
        caption:
          'Authentication establishes an identity; authorization evaluates an operation using that identity and relevant resources.',
      },
      example: {
        title: 'Require a permission on an endpoint',
        filename: 'AuthorizationSetup.cs',
        language: 'csharp',
        setup:
          'Configuration excerpt for a host that already registers a real authentication handler. Place service registration before Build, middleware afterward, and map the endpoint before Run. No login or token issuance is implemented here.',
        code: 'builder.Services.AddAuthorization(options =>\n{\n    options.AddPolicy("ReadTasks", policy =>\n        policy.RequireAuthenticatedUser()\n            .RequireClaim("permission", "tasks:read"));\n});\n\napp.UseAuthentication();\napp.UseAuthorization();\napp.MapGet("/tasks/permissions", () => Results.Ok(new { canRead = true }))\n    .RequireAuthorization("ReadTasks");',
        output:
          'No valid identity -> authentication challenge\nIdentity without tasks:read -> forbidden\nIdentity with tasks:read -> 200',
        explanation: [
          'The policy uses claims from the validated principal, not values read directly from an untrusted request body.',
          'Authentication services and their real credential validation must be configured first.',
          'The permission grants the general operation. Resource ownership still needs a separate check for individual tasks.',
        ],
      },
      traps: [
        {
          question: 'Does a valid JWT allow access to every endpoint?',
          answer:
            'No. It establishes claims only after full validation. Endpoint permissions, tenant boundaries, and resource ownership must still be enforced.',
          warning: 'Signature validation and business authorization are different gates.',
        },
        {
          question: 'Is hiding a Delete button sufficient authorization?',
          answer:
            'No. Clients can send requests directly. The server must check the operation and resource regardless of what the UI displays.',
          warning: 'The frontend is not a trusted enforcement boundary.',
        },
      ],
      exercise: {
        title: 'Write an access matrix',
        brief: 'Define access for anonymous users, task owners, and project administrators.',
        steps: [
          'List read, create, update, and delete operations.',
          'Specify both endpoint permission and resource ownership rules.',
          'Write negative cases before implementing the happy path.',
        ],
        solution:
          "Create explicit cases for no identity, wrong permission, wrong tenant, another owner's task, and allowed ownership. Test each on the server. Decide whether forbidden resource existence is hidden with 404 and apply that choice consistently.",
      },
      quiz: {
        question: 'What does authorization decide?',
        options: [
          'Whether the compiler is installed',
          'Whether a caller may perform an operation',
          'Whether JSON can be parsed',
          'Whether every token is encrypted',
        ],
        answer: 1,
        explanation:
          'Authorization evaluates permissions for an operation, often using both identity and resource state. Authentication establishes who the caller is; parsing and encryption are separate concerns.',
      },
      references: [
        {
          label: 'Authentication overview',
          url: 'https://learn.microsoft.com/en-us/aspnet/core/security/authentication/?view=aspnetcore-10.0',
        },
        {
          label: 'Authorization overview',
          url: 'https://learn.microsoft.com/en-us/aspnet/core/security/authorization/introduction?view=aspnetcore-10.0',
        },
      ],
    },
    {
      id: 'cookies-jwt-and-oidc',
      title: 'Cookies, JWT, OAuth & OpenID Connect',
      subtitle: 'Choose an identity flow based on the client and threat model.',
      minutes: 55,
      tags: [
        'JWT',
        'cookies',
        'OAuth',
        'OIDC',
        'access token',
        'ID token',
        'PKCE',
        'refresh token',
        'SSO',
        'SAML',
        'revocation',
        'BFF',
        'client credentials',
      ],
      outcomes: [
        'Separate token format from authentication protocol.',
        'Explain JWT validation and storage risks.',
        'Choose established browser and API identity flows.',
      ],
      sections: [
        {
          title: 'These terms describe different layers',
          body: 'A cookie is a browser storage and transmission mechanism. A JWT is a structured token format. OAuth 2.0 is an authorization framework for delegated access. OpenID Connect adds an identity layer on top of OAuth. They are not four interchangeable login methods.\n\nAn ID token tells an OIDC client about an authentication event and user identity. An access token is intended for a resource API. Do not send an ID token to an API and assume it is the right credential. Token audience and purpose matter. Use authorization code flows with appropriate protections such as PKCE according to the client type and provider guidance.',
        },
        {
          title: 'A signed JWT is usually readable',
          body: 'A common JWT has base64url-encoded header and payload plus a signature. Signing protects integrity; it does not normally encrypt the payload. Anyone holding such a token can generally decode its claims. Do not place passwords or unnecessary personal data in it. Encrypted token formats are a separate capability.\n\nAn API must validate issuer, audience, signature, lifetime, and the relevant algorithm/key policy through established middleware. Checking only that three dot-separated segments exist, or decoding the payload without validation, authenticates nothing. Key rotation and metadata retrieval are operational concerns that a trusted provider integration should handle.',
        },
        {
          title: 'Storage changes the threat model',
          body: 'Browser cookies marked HttpOnly are not directly readable by ordinary page JavaScript, but the browser sends them automatically, which makes CSRF defenses important. Secure limits transmission to secure transport. SameSite helps with cross-site cookie behavior but is not a complete substitute for a correct antiforgery strategy.\n\nJavaScript-accessible token storage is exposed if an attacker runs script in the origin. An HttpOnly-cookie or backend-for-frontend design can reduce token exposure but still needs XSS, CSRF, and session protections. Refresh tokens, rotation, logout, and revocation need provider-specific design. A short-lived access token is not instant revocation by itself.',
        },
        {
          title: 'Authorization code flow, PKCE, and token purpose',
          body: 'In an authorization code flow, the client sends the user to a trusted authorization server with a registered redirect URI, requested scopes, and protocol protections. After authenticating and applying consent policy, the server redirects back with a short-lived code. The client redeems that code at the token endpoint. PKCE binds redemption to a verifier held by the initiating client; it does not turn a browser application into a confidential client with a secret.\n\nUse a maintained OIDC/OAuth library to handle redirect validation, state, nonce, PKCE, issuer/audience checks, and token handling. A public browser client can redeem a code with PKCE directly when the provider supports that model; a backend-for-frontend can redeem it server-side and keep tokens out of the browser. Do not assume every code exchange is necessarily server-to-server.\n\nOIDC adds an ID token for the relying client. The API receives an access token intended for its audience, not an ID token borrowed from the login response. OAuth also supports app-only client-credentials access, with no delegated human user. Tokens need not always be JWTs, and an access token is not universally a snapshot of all user information.',
          diagram: {
            title: 'Login and API access have different token audiences',
            source:
              'sequenceDiagram\n  participant Browser\n  participant Client as App client\n  participant IdP as Identity provider\n  participant API as TaskFlow API\n  Browser->>IdP: Authorization request with PKCE challenge\n  IdP-->>Client: Authorization code via registered redirect\n  Client->>IdP: Redeem code with verifier\n  IdP-->>Client: ID token and API access token\n  Client->>API: Access token for TaskFlow audience\n  API-->>Client: Authorized resource response',
            caption:
              'The client may be a public browser client or a backend, depending on the chosen flow. The ID token is not the API credential.',
          },
        },
        {
          title: 'Refresh rotation, reuse detection, and revocation',
          body: 'An access token grants resource access for a bounded lifetime. A refresh token is a credential presented to the authorization server to obtain another access token; it is not sent to ordinary API endpoints. Lifetimes such as 15 minutes or 30 days are example policy choices, not requirements of JWT or OAuth.\n\nWith rotation, successful refresh replaces the old refresh token. A provider can track the token family and detect reuse of an already-consumed credential. Handle legitimate concurrent refreshes through the provider\'s documented client behavior and avoid blindly retrying refresh requests that can consume or invalidate credentials. Store server-side refresh credentials securely, limit scope, and support revocation/device-session review as required.\n\nThe PDF says JWTs cannot be individually revoked. More precisely, a self-contained token validated entirely offline is normally accepted until expiry, even if another system has changed its policy. A denylist keyed by a token ID, a session/version check, introspection for suitable tokens, or provider-specific continuous access evaluation can add earlier rejection. Those choices introduce state, latency, availability, and propagation tradeoffs. Revoking a refresh token stops future refreshes but does not automatically invalidate every already-issued access token.\n\nHttpOnly prevents ordinary JavaScript from directly reading a cookie. It does not make an application "XSS safe": script running in the origin may still act as the user or read API responses. In-memory browser tokens also remain exposed to code running in that page. A BFF can reduce token exfiltration opportunities, but still needs cookie, CSRF, XSS, and session controls. There is no one storage table that is correct for every browser, native client, and service.',
        },
        {
          title: 'SSO, SAML, and the limits of global logout',
          body: "**Single sign-on (SSO)** is the experience of accessing several applications after authenticating through a shared identity provider. App B can redirect the user to the provider, which may reuse its login session and issue a response intended for App B without asking for credentials again. SSO is not one shared API access token passed indiscriminately to every application. Each relying application still validates its own expected issuer, audience, and protocol response.\n\n| Choice | Main representation | Typical context |\n| --- | --- | --- |\n| SAML 2.0 | XML assertions and protocol messages | Established enterprise browser federation |\n| OpenID Connect | OAuth-based flows and a JWT ID token | Modern web/native identity integrations |\n| OAuth access tokens | Opaque or structured tokens | Delegated or app-only resource access |\n\nSAML is not automatically insecure or unusable because it is older. Choose based on identity-provider capabilities, client type, existing federation, and operational support. OIDC is usually a natural fit for new OAuth-oriented applications, but protocol choice is not a substitute for secure configuration.\n\nLogging out of App A, ending the identity-provider session, revoking a refresh token, and invalidating App B's local cookie are different events. Disabling an account at the provider does not guarantee every existing app session disappears instantly. Front-channel/back-channel logout support, token lifetime, policy revalidation, caches, and propagation determine the actual delay. Test offboarding and forced logout against your chosen provider and every relevant client.",
          diagram: {
            title: 'One identity provider, separate application sessions',
            source:
              'flowchart TB\n  browser["Browser"] --> appA["App A session"]\n  browser --> appB["App B session"]\n  appA --> idp["Shared identity-provider login session"]\n  appB --> idp\n  idp --> tokenA["Response intended for App A"]\n  idp --> tokenB["Response intended for App B"]',
            caption:
              'Reusing the provider login can avoid another prompt. It does not merge app sessions or guarantee immediate global logout.',
          },
        },
        {
          title: 'Cookies and sessions can scale horizontally too',
          body: 'A browser cookie is a transport/storage mechanism, not proof of a server-side session lookup. ASP.NET Core cookie authentication commonly carries a protected ticket that servers can validate with compatible Data Protection keys; an optional ticket store introduces additional server-side state. Session middleware is another distinct feature.\n\nA server-stored session can be shared across replicas through an appropriate distributed store. Sticky routing is one possible strategy for instance-local state, not an unavoidable property of all session-based applications. Shared session data introduces coordination, availability, and latency costs, but is not limited to tiny deployments.\n\nREST statelessness concerns relying on stored client interaction context between requests; it does not forbid durable application data or require JWT. An authentication mechanism and the statefulness of the complete application must be assessed separately. Choose a secure identity/session design for the client and product, not to satisfy the slogan "JWT scales, cookies do not."',
        },
      ],
      diagram: {
        title: 'Validate an API access token',
        source:
          'flowchart LR\n  provider["Trusted identity provider"] --> client["Client receives access token"]\n  client --> api["API bearer handler"]\n  api --> checks["Issuer / audience / signature / lifetime"]\n  checks --> principal["ClaimsPrincipal"]\n  principal --> policy["Authorization policy"]',
        caption:
          'The API validates a token intended for that API. Decoding claims alone is not validation.',
      },
      example: {
        title: 'Use provider-backed bearer validation',
        filename: 'Program.cs',
        language: 'csharp',
        setup:
          "Complete host example after adding Microsoft.AspNetCore.Authentication.JwtBearer version 10.*. Configure Auth:Authority to your trusted HTTPS OIDC provider and Auth:Audience to this API's audience. Real provider configuration is required; no token is fabricated.",
        code: 'using Microsoft.AspNetCore.Authentication.JwtBearer;\nusing System.Security.Claims;\n\nvar builder = WebApplication.CreateBuilder(args);\nbuilder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)\n    .AddJwtBearer(options =>\n    {\n        options.Authority = builder.Configuration["Auth:Authority"]\n            ?? throw new InvalidOperationException("Configure trusted authority");\n        options.Audience = builder.Configuration["Auth:Audience"]\n            ?? throw new InvalidOperationException("Configure API audience");\n        options.MapInboundClaims = false;\n        options.RequireHttpsMetadata = true;\n    });\nbuilder.Services.AddAuthorization();\nvar app = builder.Build();\napp.UseAuthentication();\napp.UseAuthorization();\napp.MapGet("/me", (ClaimsPrincipal user) => new { subject = user.FindFirst("sub")?.Value })\n    .RequireAuthorization();\napp.Run();',
        output:
          'Missing or invalid bearer credential -> 401\nValid access token for this API -> authenticated response',
        explanation: [
          'Authority and audience define trusted token context. Do not take them from the incoming request.',
          'MapInboundClaims false preserves claim names such as sub for the application contract.',
          "Provider requirements vary. Verify issuer, audience, signing-key validation, lifetime, and expected claims with the provider's integration guidance and tests.",
        ],
      },
      traps: [
        {
          question: 'Is a JWT encrypted because its payload looks unreadable?',
          answer:
            'A typical signed JWT is base64url-encoded, not encrypted. Encoding can be reversed without a secret. The signature protects integrity, not payload confidentiality.',
          warning: 'Never store secrets in ordinary token claims.',
        },
        {
          question: 'Does deleting a browser token instantly revoke every copy?',
          answer:
            'No. Another holder may still use a valid unexpired bearer token unless the system checks revocation or other server-side state. Logout semantics require explicit design.',
          warning: 'Client cleanup and server-side invalidation are different operations.',
        },
        {
          question: 'Does an HttpOnly refresh cookie make XSS harmless?',
          answer:
            'No. HttpOnly prevents direct cookie access by ordinary JavaScript, but injected script can still make authenticated requests or read responses in the origin. XSS prevention and CSRF/session protections remain necessary.',
          warning:
            'Protecting one credential from direct reads is not the same as protecting every user action.',
        },
        {
          question: 'Does central SSO logout instantly invalidate every application session?',
          answer:
            'Not universally. Each application can have a separate local session and independently valid access tokens. Logout protocols, revalidation policy, lifetime, and propagation determine how quickly access ends.',
          warning:
            'Test the real offboarding path instead of promising instant revocation from an architecture diagram.',
        },
      ],
      exercise: {
        title: 'Audit a token integration',
        brief:
          'An API decodes a JWT and trusts its role claim without using authentication middleware.',
        steps: [
          'List the missing validation steps.',
          'Replace decoding-as-authentication with a trusted handler.',
          'Test wrong audience, expired token, and an invalid signature.',
        ],
        solution:
          'Decoding provides no trust. Use established bearer middleware with a fixed trusted issuer/authority, intended audience, signing-key validation, lifetime checks, and appropriate algorithm policy. Negative integration tests are essential. Never use production credentials in test fixtures or committed examples.',
      },
      quiz: {
        question: 'Which token is normally intended to authorize calls to a resource API?',
        options: [
          'An OIDC ID token regardless of audience',
          'An access token intended for that API',
          'A base64-encoded password',
          'Any cookie from any domain',
        ],
        answer: 1,
        explanation:
          'An access token represents access for a resource audience. ID tokens have a different OIDC purpose, and every credential must be validated for its intended context.',
      },
      references: [
        {
          label: 'JWT bearer authentication',
          url: 'https://learn.microsoft.com/en-us/aspnet/core/security/authentication/configure-jwt-bearer-authentication?view=aspnetcore-10.0',
        },
        {
          label: 'OpenID Connect',
          url: 'https://learn.microsoft.com/en-us/aspnet/core/security/authentication/configure-oidc-web-authentication?view=aspnetcore-10.0',
        },
        {
          label: 'OAuth 2.0 security best current practice',
          url: 'https://www.rfc-editor.org/rfc/rfc9700.html',
        },
        {
          label: 'OpenID Connect back-channel logout',
          url: 'https://openid.net/specs/openid-connect-backchannel-1_0.html',
        },
        {
          label: 'ASP.NET Core cookie authentication',
          url: 'https://learn.microsoft.com/en-us/aspnet/core/security/authentication/cookie?view=aspnetcore-10.0',
        },
      ],
    },
    {
      id: 'policies-and-ownership',
      title: 'Policies, ownership & tenant isolation',
      subtitle: 'A task ID is a locator, not permission to access the task.',
      minutes: 28,
      tags: ['resource authorization', 'ownership', 'BOLA', 'IDOR', 'tenant', 'policy', 'claims'],
      outcomes: [
        'Enforce object-level access checks.',
        'Derive identity from trusted claims.',
        'Test cross-user and cross-tenant denial.',
      ],
      sections: [
        {
          title: 'Protect the actual resource',
          body: "An endpoint can require a logged-in user and still expose everyone's tasks if it looks up arbitrary IDs without checking ownership. This is a form of broken object-level authorization, sometimes called BOLA or IDOR. Changing an integer ID in a URL should never be enough to cross a user or tenant boundary.\n\nAuthorize each operation on the requested resource. A user might be allowed to view a project but not delete it, or edit their own task but not another member's. Roles are broad labels; resource state and relationships often determine the real permission.",
        },
        {
          title: 'Use a trusted identity and explicit scope',
          body: "Derive the subject identifier from validated claims with a documented mapping. Never treat OwnerId in a create request as proof of ownership. A tenant identifier also needs validation against the user's membership and current operation. Subdomains, headers, and route values can select a tenant context, but selection is not authorization.\n\nFor simple ownership queries, filtering by both resource ID and owner ID can avoid loading an inaccessible object. More complex rules can use IAuthorizationService with a resource and operation requirement. Global query filters may help consistently scope data, but bypasses, administrative paths, and writes still require careful review.",
        },
        {
          title: 'Denial behavior is a contract',
          body: "Returning 404 for both absent and inaccessible resources can reduce existence disclosure. Returning 403 may be more informative in a trusted collaboration context. Choose based on the threat model and apply it consistently. Do not accidentally reveal inaccessible data through error messages, counts, search results, exports, or cached responses.\n\nWrite negative tests: user A cannot read user B's task, a member of tenant A cannot mutate tenant B's data, and a removed member loses access. Also test indirect paths such as batch operations and nested routes. Authorization is not complete just because the single-item GET path is protected.",
        },
      ],
      diagram: {
        title: 'Scope the lookup to the caller',
        source:
          'flowchart LR\n  principal["Validated subject"] --> scope["Authorized owner / tenant scope"]\n  id["Requested task ID"] --> query["Lookup within scope"]\n  scope --> query\n  query --> found{"Accessible match?"}\n  found -->|Yes| response["Return task"]\n  found -->|No| missing["404 under this policy"]',
        caption:
          'The untrusted ID is combined with a trusted access scope before data is returned.',
      },
      example: {
        title: "Query only the caller's task",
        filename: 'OwnedTaskEndpoint.cs',
        language: 'csharp',
        setup:
          'Endpoint excerpt for an authenticated EF Core API. TaskItem must include OwnerId, and your validated identity uses the sub claim with inbound mapping disabled. db is a registered TaskDbContext.',
        code: 'app.MapGet("/tasks/{id:int}", async (int id, TaskDbContext db,\n    System.Security.Claims.ClaimsPrincipal user, CancellationToken cancellationToken) =>\n{\n    string? ownerId = user.FindFirst("sub")?.Value;\n    if (string.IsNullOrWhiteSpace(ownerId))\n        return Results.Forbid();\n\n    var task = await db.Tasks.AsNoTracking()\n        .Where(item => item.Id == id && item.OwnerId == ownerId)\n        .Select(item => new { item.Id, item.Title, item.IsComplete })\n        .SingleOrDefaultAsync(cancellationToken);\n\n    return task is null ? Results.NotFound() : Results.Ok(task);\n}).RequireAuthorization();',
        output:
          "Owned existing task -> 200\nMissing or another owner's task -> 404\nAuthenticated identity missing required subject -> forbidden",
        explanation: [
          'The owner comes from the validated principal, not a request-supplied owner field.',
          'The database query applies both the requested ID and ownership condition.',
          'This simple ownership model does not cover team sharing. Add explicit membership/operation rules when the domain requires them.',
        ],
      },
      traps: [
        {
          question: 'Are random GUID resource IDs an authorization mechanism?',
          answer:
            'No. Hard-to-guess IDs can reduce casual discovery, but a leaked or known ID must still be access-controlled. IDs locate resources; authorization grants access.',
          warning: 'Security by unguessable URL alone is not ownership enforcement.',
        },
        {
          question: 'Does an EF global tenant filter solve all tenant security?',
          answer:
            'No. Filters can be bypassed and may not cover every raw query, administrative path, write, or cached response. They are a useful layer, not the whole authorization model.',
          warning: 'Test every data path that can cross a tenant boundary.',
        },
      ],
      exercise: {
        title: 'Write the cross-user test first',
        brief:
          'Create two users and one task owned by each, then test both read and update endpoints.',
        steps: [
          'Authenticate as the first user.',
          "Attempt to access the second user's task by a known ID.",
          'Assert no data is returned and no update was persisted.',
        ],
        solution:
          'The negative test should verify both the response contract and database state. A forbidden response after an unauthorized write has already happened is still a security failure. Apply the same checks to list, batch, export, and nested-resource paths.',
      },
      quiz: {
        question: 'Where should a create operation normally get the owner identity?',
        options: [
          'An arbitrary OwnerId in the JSON body',
          'A validated principal and authorized context',
          'The color of the UI profile icon',
          'The first row in the users table',
        ],
        answer: 1,
        explanation:
          'Ownership should be derived or validated against a trusted identity and authorization context. A client can submit any body value, so an OwnerId field is not proof of access.',
      },
      references: [
        {
          label: 'Resource-based authorization',
          url: 'https://learn.microsoft.com/en-us/aspnet/core/security/authorization/resourcebased?view=aspnetcore-10.0',
        },
      ],
    },
    {
      id: 'web-security',
      title: 'CORS, CSRF, XSS & unsafe input',
      subtitle: 'Match each defense to the threat it actually addresses.',
      minutes: 34,
      tags: ['CORS', 'CSRF', 'XSS', 'SQL injection', 'SSRF', 'antiforgery', 'uploads', 'OWASP'],
      outcomes: [
        'Distinguish browser read policy from access control.',
        'Explain antiforgery and output-encoding defenses.',
        'Identify server-side input and outbound-request risks.',
      ],
      sections: [
        {
          title: 'CORS is a browser policy, not authentication',
          body: 'The same-origin policy limits how browser scripts read cross-origin resources. CORS lets a server opt into specified cross-origin access. It does not stop a command-line client or another server from sending requests, and it does not establish user identity. A request blocked from being read by browser JavaScript may still have reached the server.\n\nAllow only intended origins, methods, and headers. An origin includes scheme, host, and port. Credentialed cookie requests need deliberate cross-origin configuration; allowing every origin together with credentials is not a valid blanket solution. Avoid reflecting any supplied Origin header without validation.',
        },
        {
          title: 'A preflight asks permission; it does not authenticate the caller',
          body: 'For a cross-origin request that is not CORS-safelisted, the browser can first send OPTIONS with Origin, Access-Control-Request-Method, and requested header names. A JSON Content-Type or an Authorization header commonly triggers this preflight even when the HTTP method otherwise looks simple. Not every cross-origin request is preflighted.\n\nThe preflight normally carries no user credential. The CORS policy answers whether that origin/method/header combination is allowed; the later actual request must still pass authentication and authorization. Place endpoint-aware CORS after routing and before the relevant authorization behavior according to the framework guidance. A proxy or authentication gateway that challenges all OPTIONS requests can break this workflow.\n\nFor a successful preflight, the browser checks the returned CORS headers and may send the actual request. For an ordinary safelisted request, the browser may already send it and then prevent JavaScript from reading the response when permission is missing. This distinction explains why CORS is not a general CSRF defense. A failed preflight and an unreadable actual response are different symptoms.\n\nIn the code example, a public status endpoint allows GET from one exact origin with specified headers. No user is authenticated by that allowlist. Test both the preflight and the actual response; a successful curl call alone cannot prove a browser CORS policy is correct.',
        },
        {
          title: 'CSRF and XSS attack different trust boundaries',
          body: '**CSRF** tricks a browser into sending an authenticated state-changing request using ambient credentials such as cookies. Use framework antiforgery protections for applicable cookie-authenticated forms and requests, suitable SameSite settings, and safe method semantics. A bearer token explicitly attached by trusted code has a different CSRF exposure, but storing it in a cookie changes that analysis.\n\n**XSS** causes untrusted content to execute as script in your origin. Use context-appropriate output encoding, avoid injecting raw HTML, and sanitize intentionally supported rich HTML with a proven library. Razor normally encodes output; Html.Raw on untrusted input bypasses that safety. A content security policy provides defense in depth, not a replacement for safe rendering.',
        },
        {
          title: 'The server has its own input risks',
          body: 'SQL injection comes from interpreting untrusted text as query structure. Use parameterized queries and trusted identifier mappings. SSRF occurs when untrusted input controls server-side outbound requests, potentially reaching internal services. Validate destination policy, redirects, and resolved addresses where needed rather than accepting arbitrary URLs.\n\nFor uploads, enforce size and content rules, use server-generated storage names, avoid executing uploaded content, and store it outside directly executable paths. Never combine an untrusted filename with a directory and assume path traversal is impossible. Rate limits, dependency updates, safe error responses, and least privilege complete a layered defense; none of these controls replaces the others.',
        },
      ],
      diagram: {
        title: 'Different threats, different defenses',
        source:
          'flowchart TB\n  input["Untrusted input"] --> sql["SQL: parameters"]\n  input --> html["HTML: encode / sanitize"]\n  input --> url["Outbound URL: destination policy"]\n  browser["Ambient browser credentials"] --> csrf["CSRF: antiforgery + cookie policy"]\n  origin["Cross-origin reads"] --> cors["CORS: explicit allowlist"]',
        caption:
          'A CORS setting does not prevent SQL injection, XSS, or unauthorized non-browser requests.',
      },
      example: {
        title: 'Allow one known frontend origin',
        filename: 'Program.cs',
        language: 'csharp',
        setup:
          'Complete host example for a public status endpoint. Replace the example origin with your real trusted frontend. This demonstrates CORS only; it is not an authentication system.',
        code: 'var builder = WebApplication.CreateBuilder(args);\nbuilder.Services.AddCors(options => options.AddPolicy("frontend", policy =>\n    policy.WithOrigins("https://app.example.com")\n        .WithMethods("GET")\n        .WithHeaders("Content-Type", "Authorization")));\n\nvar app = builder.Build();\napp.UseRouting();\napp.UseCors("frontend");\napp.MapGet("/status", () => new { status = "available" });\napp.Run();',
        output:
          'The allowed origin receives appropriate CORS response headers.\nOther clients are not thereby authenticated or blocked from direct HTTP access.',
        explanation: [
          'The allowlist is exact and does not accept arbitrary origin reflection.',
          'No AllowCredentials call is used because this example does not demonstrate cross-site cookies.',
          'Protected endpoints still need real authentication and authorization, independent of CORS.',
        ],
      },
      additionalExamples: [
        {
          title: 'Inspect the status endpoint preflight',
          filename: 'cors-preflight.http',
          language: 'http',
          setup:
            "Run this lesson's CORS example on http://localhost:5050 and send the request with an HTTP client. The Origin intentionally matches its configured allowlist. Sending the request manually inspects server headers; only a browser enforces its CORS rules.",
          code: 'OPTIONS http://localhost:5050/status\nOrigin: https://app.example.com\nAccess-Control-Request-Method: GET\nAccess-Control-Request-Headers: authorization',
          output:
            'The allowed preflight normally returns 204 with Access-Control-Allow-Origin, Access-Control-Allow-Methods, and Access-Control-Allow-Headers. No bearer token is present in this request.',
          explanation: [
            'The preflight asks permission to use an Authorization header later; it does not include or validate a real access token.',
            'Change Origin to an unapproved origin and compare the CORS headers. A status code alone is not the full browser permission decision.',
          ],
        },
      ],
      traps: [
        {
          question: 'Can CORS protect an API from unauthorized curl requests?',
          answer:
            'No. CORS is enforced by browsers for cross-origin script access. A non-browser client can still send requests. The server must authenticate and authorize them.',
          warning: 'A browser error message is not proof that the server rejected the operation.',
        },
        {
          question: 'Does Razor output encoding make Html.Raw safe for user content?',
          answer:
            'No. Html.Raw deliberately bypasses encoding. Only use raw output for content that is trusted or sanitized with an appropriate proven HTML policy.',
          warning:
            'Validation for a title is not automatically sanitization for arbitrary rich HTML.',
        },
      ],
      exercise: {
        title: 'Build a threat-to-control table',
        brief: 'TaskFlow adds comments, file uploads, and cookie-authenticated forms.',
        steps: [
          'Map comment rendering to XSS defenses.',
          'Map state-changing forms to antiforgery protections.',
          'Define upload size, name, storage, and content policies.',
        ],
        solution:
          'Encode plain comments, sanitize any intentionally supported rich HTML, protect cookie-authenticated mutations with antiforgery, and use restrictive upload handling. Test each boundary separately. Adding CORS or HTTPS does not replace these application-level defenses.',
      },
      quiz: {
        question: 'Which statement about CORS is correct?',
        options: [
          'It is a replacement for authorization',
          'It governs browser cross-origin access behavior',
          'It encrypts the database',
          'It stops every non-browser client',
        ],
        answer: 1,
        explanation:
          'CORS is a browser-enforced cross-origin policy. It does not authenticate users, encrypt data, or stop arbitrary HTTP clients from reaching an endpoint.',
      },
      references: [
        {
          label: 'CORS in ASP.NET Core',
          url: 'https://learn.microsoft.com/en-us/aspnet/core/security/cors?view=aspnetcore-10.0',
        },
        {
          label: 'Prevent CSRF',
          url: 'https://learn.microsoft.com/en-us/aspnet/core/security/anti-request-forgery?view=aspnetcore-10.0',
        },
        { label: 'OWASP Cheat Sheet Series', url: 'https://cheatsheetseries.owasp.org/' },
      ],
    },
    {
      id: 'secrets-and-data-protection',
      title: 'Secrets, passwords & Data Protection',
      subtitle:
        'Keep credentials out of Git and understand which cryptographic tool solves which problem.',
      minutes: 27,
      tags: [
        'secrets',
        'Data Protection',
        'password hashing',
        'key ring',
        'Key Vault',
        'user secrets',
        'encryption',
      ],
      outcomes: [
        'Separate secrets management, hashing, and data protection.',
        'Plan shared key storage for scaled deployments.',
        'Respond correctly to an exposed credential.',
      ],
      sections: [
        {
          title: 'Configuration is not a secret vault',
          body: "Do not commit passwords, tokens, private keys, or real connection credentials. Development user secrets keep values out of the project tree, but the tool does not encrypt them. Environment variables can be useful injection mechanisms, but may be visible in process inspection, diagnostics, or configuration dumps. Production secret stores such as Azure Key Vault add access control and operational management.\n\nPrefer managed or workload identity when supported instead of maintaining a long-lived password. Give the application only the permissions it needs. If a credential is committed, deleting the latest file is not enough: rotate or revoke it, investigate exposure, and follow the repository's incident procedure for history cleanup.",
        },
        {
          title: 'Hashing and encryption are different contracts',
          body: 'Password storage should use a purpose-built adaptive password hashing system, such as established identity framework components. A plain SHA-256 hash is too fast for password storage, and reversible encryption is usually the wrong goal. Password verification should not require recovering the original password.\n\nEncryption protects recoverable data confidentiality. Signatures and message authentication protect integrity. Encoding merely changes representation. Do not design a homegrown cryptographic protocol from primitives because the APIs look simple. Key management, rotation, nonce handling, and misuse resistance are as important as the algorithm name.',
        },
        {
          title: 'Data Protection has an application scope',
          body: 'ASP.NET Core Data Protection provides purpose-separated protection for application data such as authentication tickets and temporary payloads. A purpose string isolates uses so a token for one purpose is not accidentally accepted for another. Time-limited protectors can enforce expiry. This is not a password hashing API or a general substitute for a database encryption strategy.\n\nMultiple instances that must read the same protected data need a compatible shared key ring and application discriminator, with keys protected at rest and access tightly controlled. Ephemeral keys can invalidate cookies or tokens on restart. Retiring an old key differs from deleting it: deletion can make existing protected data permanently unreadable.',
        },
      ],
      diagram: {
        title: 'Choose protection by purpose',
        source:
          'flowchart TB\n  data["Sensitive information"] --> password["Password: adaptive hash"]\n  data --> secret["Credential: secret store"]\n  data --> ticket["App ticket: Data Protection"]\n  ticket --> keys["Protected, shared key ring when needed"]',
        caption:
          'These mechanisms solve different problems. None removes the need for least privilege and careful key handling.',
      },
      example: {
        title: 'Protect a time-limited application payload',
        filename: 'Program.cs',
        language: 'csharp',
        setup:
          'Complete web-host example using built-in Data Protection. It prints a local round-trip result, then starts a status endpoint. Production must explicitly plan key persistence, sharing, and at-rest protection.',
        code: 'using Microsoft.AspNetCore.DataProtection;\n\nvar builder = WebApplication.CreateBuilder(args);\nbuilder.Services.AddDataProtection().SetApplicationName("TaskFlow");\nvar app = builder.Build();\n\nvar provider = app.Services.GetRequiredService<IDataProtectionProvider>();\nvar protector = provider.CreateProtector("TaskFlow.Invitation.v1")\n    .ToTimeLimitedDataProtector();\nstring protectedValue = protector.Protect("invitation:42", TimeSpan.FromMinutes(15));\nConsole.WriteLine(protector.Unprotect(protectedValue));\n\napp.MapGet("/status", () => Results.Ok());\napp.Run();',
        output: 'invitation:42',
        explanation: [
          'The purpose identifies this payload contract separately from other protected values.',
          'The protected value has an expiry and should not be logged or treated as universally authorized just because it decrypts.',
          'The example uses local defaults. A real multi-instance deployment needs an explicit key-ring and identity-access plan.',
        ],
      },
      traps: [
        {
          question: 'Are user secrets encrypted by the Secret Manager tool?',
          answer:
            'No. They are stored outside the project to reduce accidental source-control exposure. They are a development convenience, not a hardened production vault.',
          warning: 'Do not log or publish them just because they are not in appsettings.json.',
        },
        {
          question: 'Is deleting a leaked API key from the latest commit sufficient?',
          answer:
            'No. It may remain in history, caches, or other copies. Revoke or rotate the credential immediately and investigate exposure through the appropriate incident process.',
          warning: 'History cleanup cannot make an already-exposed credential trustworthy again.',
        },
      ],
      exercise: {
        title: 'Prepare a secrets checklist',
        brief: 'TaskFlow will run in two replicas and use protected authentication cookies.',
        steps: [
          'Choose a shared, access-controlled key store.',
          'Define application-name compatibility and at-rest key protection.',
          'Document credential rotation and the impact of deleting old keys.',
        ],
        solution:
          'Both replicas need compatible Data Protection configuration and access to the shared key ring. Protect keys at rest and restrict identity permissions. Rotate keys and credentials through a tested process; deleting old keys can invalidate existing cookies and protected payloads.',
      },
      quiz: {
        question: 'Which approach is appropriate for storing user passwords?',
        options: [
          'Base64 encoding',
          'A fast unsalted general-purpose hash',
          'A proven adaptive password hasher',
          'A reversible string transformation in source code',
        ],
        answer: 2,
        explanation:
          'Use established password-hashing components designed to resist offline guessing, including appropriate salts and work factors. Encoding and fast general-purpose hashes do not provide that protection.',
      },
      references: [
        {
          label: 'Safe storage of app secrets',
          url: 'https://learn.microsoft.com/en-us/aspnet/core/security/app-secrets?view=aspnetcore-10.0',
        },
        {
          label: 'Data Protection overview',
          url: 'https://learn.microsoft.com/en-us/aspnet/core/security/data-protection/introduction?view=aspnetcore-10.0',
        },
      ],
    },
  ],
}
