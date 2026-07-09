module.exports = {

"[externals]/next/dist/compiled/next-server/app-page.runtime.dev.js [external] (next/dist/compiled/next-server/app-page.runtime.dev.js, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page.runtime.dev.js"));

module.exports = mod;
}}),
"[project]/src/providers/query-provider.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "QueryProvider": (()=>QueryProvider)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$query$2d$core$2f$build$2f$modern$2f$queryClient$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/query-core/build/modern/queryClient.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query/build/modern/QueryClientProvider.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2d$devtools$2f$build$2f$modern$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/@tanstack/react-query-devtools/build/modern/index.js [app-ssr] (ecmascript)");
'use client';
;
;
;
;
function QueryProvider({ children }) {
    const [queryClient] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useState"])(()=>new __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$query$2d$core$2f$build$2f$modern$2f$queryClient$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["QueryClient"]({
            defaultOptions: {
                queries: {
                    staleTime: 60 * 1000,
                    gcTime: 5 * 60 * 1000,
                    retry: (failureCount, error)=>{
                        const apiError = error;
                        if (apiError?.status === 404 || apiError?.status === 401 || apiError?.status === 403) {
                            return false;
                        }
                        return failureCount < 3;
                    },
                    refetchOnWindowFocus: false
                }
            }
        }));
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2f$build$2f$modern$2f$QueryClientProvider$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["QueryClientProvider"], {
        client: queryClient,
        children: [
            children,
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f40$tanstack$2f$react$2d$query$2d$devtools$2f$build$2f$modern$2f$index$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ReactQueryDevtools"], {
                initialIsOpen: false
            }, void 0, false, {
                fileName: "[project]/src/providers/query-provider.tsx",
                lineNumber: 35,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/src/providers/query-provider.tsx",
        lineNumber: 33,
        columnNumber: 5
    }, this);
}
}}),
"[project]/src/constants/index.ts [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
// ============================================================
// App Constants
// ============================================================
__turbopack_context__.s({
    "APP_DESCRIPTION": (()=>APP_DESCRIPTION),
    "APP_NAME": (()=>APP_NAME),
    "APP_VERSION": (()=>APP_VERSION),
    "CAMPAIGN_TYPES": (()=>CAMPAIGN_TYPES),
    "DATE_FORMATS": (()=>DATE_FORMATS),
    "PAGINATION": (()=>PAGINATION),
    "QUERY_KEYS": (()=>QUERY_KEYS),
    "ROUTES": (()=>ROUTES),
    "STATUS_COLORS": (()=>STATUS_COLORS),
    "STORAGE_KEYS": (()=>STORAGE_KEYS),
    "WORKFLOW_NODE_TYPES": (()=>WORKFLOW_NODE_TYPES)
});
const APP_NAME = 'AutoMarket';
const APP_DESCRIPTION = 'Enterprise Marketing Automation Platform';
const APP_VERSION = '1.0.0';
const ROUTES = {
    // Auth
    LOGIN: '/login',
    REGISTER: '/register',
    FORGOT_PASSWORD: '/forgot-password',
    RESET_PASSWORD: '/reset-password',
    VERIFY_EMAIL: '/verify-email',
    // App
    DASHBOARD: '/dashboard',
    // CRM
    CONTACTS: '/contacts',
    CONTACT_DETAIL: (id)=>`/contacts/${id}`,
    COMPANIES: '/companies',
    COMPANY_DETAIL: (id)=>`/companies/${id}`,
    // Marketing
    CAMPAIGNS: '/campaigns',
    CAMPAIGN_DETAIL: (id)=>`/campaigns/${id}`,
    CAMPAIGN_NEW: '/campaigns/new',
    // Automation
    WORKFLOWS: '/workflows',
    WORKFLOW_BUILDER: (id)=>`/workflows/${id}/builder`,
    WORKFLOW_LOGS: '/workflows/logs',
    // Content
    FORMS: '/forms',
    FORM_BUILDER: (id)=>`/forms/${id}/builder`,
    LANDING_PAGES: '/landing-pages',
    CONTENT_STUDIO: '/content-studio',
    SOCIAL: '/social',
    // Analytics
    ANALYTICS: '/analytics',
    REPORTS: '/reports',
    // Settings
    SETTINGS: '/settings',
    SETTINGS_GENERAL: '/settings/general',
    SETTINGS_SECURITY: '/settings/security',
    SETTINGS_NOTIFICATIONS: '/settings/notifications',
    SETTINGS_INTEGRATIONS: '/settings/integrations',
    SETTINGS_BILLING: '/settings/billing',
    SETTINGS_TEAM: '/settings/team',
    SETTINGS_AUDIT_LOGS: '/settings/audit-logs',
    // Profile
    PROFILE: '/profile',
    // Notifications
    NOTIFICATIONS: '/notifications'
};
const PAGINATION = {
    DEFAULT_PAGE: 1,
    DEFAULT_LIMIT: 25,
    LIMIT_OPTIONS: [
        10,
        25,
        50,
        100
    ]
};
const STORAGE_KEYS = {
    AUTH_TOKEN: 'am_access_token',
    REFRESH_TOKEN: 'am_refresh_token',
    TENANT_ID: 'am_tenant_id',
    WORKSPACE_ID: 'am_workspace_id',
    THEME: 'am_theme',
    SIDEBAR_STATE: 'am_sidebar_collapsed'
};
const DATE_FORMATS = {
    DISPLAY: 'MMM d, yyyy',
    DISPLAY_TIME: 'MMM d, yyyy h:mm a',
    ISO: "yyyy-MM-dd'T'HH:mm:ss",
    SHORT: 'MM/dd/yyyy',
    MONTH_YEAR: 'MMMM yyyy',
    TIME: 'h:mm a'
};
const STATUS_COLORS = {
    ACTIVE: 'text-green-600 bg-green-50 border-green-200',
    INACTIVE: 'text-gray-600 bg-gray-50 border-gray-200',
    PENDING: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    SUSPENDED: 'text-red-600 bg-red-50 border-red-200',
    DRAFT: 'text-gray-600 bg-gray-50 border-gray-200',
    PUBLISHED: 'text-green-600 bg-green-50 border-green-200',
    SCHEDULED: 'text-blue-600 bg-blue-50 border-blue-200',
    PAUSED: 'text-orange-600 bg-orange-50 border-orange-200',
    COMPLETED: 'text-purple-600 bg-purple-50 border-purple-200',
    FAILED: 'text-red-600 bg-red-50 border-red-200'
};
const CAMPAIGN_TYPES = {
    EMAIL: 'EMAIL',
    SMS: 'SMS',
    WHATSAPP: 'WHATSAPP',
    PUSH: 'PUSH'
};
const WORKFLOW_NODE_TYPES = {
    TRIGGER: 'trigger',
    CONDITION: 'condition',
    ACTION: 'action',
    DELAY: 'delay',
    BRANCH: 'branch',
    WEBHOOK: 'webhook',
    END: 'end'
};
const QUERY_KEYS = {
    USER: [
        'user'
    ],
    WORKSPACE: [
        'workspace'
    ],
    CONTACTS: [
        'contacts'
    ],
    CONTACT: (id)=>[
            'contacts',
            id
        ],
    COMPANIES: [
        'companies'
    ],
    COMPANY: (id)=>[
            'companies',
            id
        ],
    CAMPAIGNS: [
        'campaigns'
    ],
    CAMPAIGN: (id)=>[
            'campaigns',
            id
        ],
    WORKFLOWS: [
        'workflows'
    ],
    WORKFLOW: (id)=>[
            'workflows',
            id
        ],
    ANALYTICS: [
        'analytics'
    ],
    NOTIFICATIONS: [
        'notifications'
    ],
    DASHBOARD_STATS: [
        'dashboard',
        'stats'
    ]
};
}}),
"[project]/src/store/use-auth-store.ts [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "useAuthStore": (()=>useAuthStore)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/index.mjs [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$middleware$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/middleware.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$constants$2f$index$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/constants/index.ts [app-ssr] (ecmascript)");
;
;
;
const useAuthStore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["create"])()((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$middleware$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["devtools"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$middleware$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["persist"])((set)=>({
        user: null,
        tokens: null,
        isAuthenticated: false,
        isLoading: false,
        _hasHydrated: false,
        setHasHydrated: (state)=>set({
                _hasHydrated: state
            }),
        setSession: (session)=>{
            if ("TURBOPACK compile-time falsy", 0) {
                "TURBOPACK unreachable";
            }
            set({
                user: session.user,
                tokens: session.tokens,
                isAuthenticated: true,
                isLoading: false
            });
        },
        updateUser: (userData)=>set((state)=>({
                    user: state.user ? {
                        ...state.user,
                        ...userData
                    } : null
                })),
        clearSession: ()=>{
            if ("TURBOPACK compile-time falsy", 0) {
                "TURBOPACK unreachable";
            }
            set({
                user: null,
                tokens: null,
                isAuthenticated: false,
                isLoading: false
            });
        },
        setLoading: (loading)=>set({
                isLoading: loading
            })
    }), {
    name: 'auth-store',
    storage: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$middleware$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createJSONStorage"])(()=>localStorage),
    // Only persist these fields
    partialize: (state)=>({
            user: state.user,
            tokens: state.tokens,
            isAuthenticated: state.isAuthenticated
        }),
    onRehydrateStorage: ()=>(state)=>{
            state?.setHasHydrated(true);
        },
    // Critical: skip initial hydration to prevent SSR mismatch
    skipHydration: true
}), {
    name: 'AuthStore'
}));
}}),
"[project]/src/store/use-ui-store.ts [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "useUiStore": (()=>useUiStore)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/index.mjs [app-ssr] (ecmascript) <locals>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$middleware$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/zustand/esm/middleware.mjs [app-ssr] (ecmascript)");
;
;
const useUiStore = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__$3c$locals$3e$__["create"])()((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$middleware$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["devtools"])((0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$middleware$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["persist"])((set)=>({
        sidebarCollapsed: false,
        activeWorkspaceId: null,
        commandMenuOpen: false,
        _hasHydrated: false,
        setHasHydrated: (state)=>set({
                _hasHydrated: state
            }),
        setSidebarCollapsed: (collapsed)=>set({
                sidebarCollapsed: collapsed
            }),
        setActiveWorkspaceId: (workspaceId)=>set({
                activeWorkspaceId: workspaceId
            }),
        setCommandMenuOpen: (open)=>set({
                commandMenuOpen: open
            })
    }), {
    name: 'ui-storage',
    storage: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zustand$2f$esm$2f$middleware$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["createJSONStorage"])(()=>localStorage),
    partialize: (state)=>({
            sidebarCollapsed: state.sidebarCollapsed,
            activeWorkspaceId: state.activeWorkspaceId
        }),
    onRehydrateStorage: ()=>(state)=>{
            state?.setHasHydrated(true);
        },
    skipHydration: true
}), {
    name: 'GlobalUIStore'
}));
}}),
"[project]/src/providers/app-providers.tsx [app-ssr] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { g: global, __dirname } = __turbopack_context__;
{
__turbopack_context__.s({
    "AppProviders": (()=>AppProviders)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react-jsx-dev-runtime.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/server/route-modules/app-page/vendored/ssr/react.js [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$themes$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next-themes/dist/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$providers$2f$query$2d$provider$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/providers/query-provider.tsx [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/sonner/dist/index.mjs [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$use$2d$auth$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/store/use-auth-store.ts [app-ssr] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$use$2d$ui$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/store/use-ui-store.ts [app-ssr] (ecmascript)");
'use client';
;
;
;
;
;
;
;
// Hydrates Zustand persisted stores on client mount
function StoreHydrator() {
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useEffect"])(()=>{
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$use$2d$auth$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useAuthStore"].persist.rehydrate();
        __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$store$2f$use$2d$ui$2d$store$2e$ts__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["useUiStore"].persist.rehydrate();
    }, []);
    return null;
}
function AppProviders({ children }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2d$themes$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["ThemeProvider"], {
        attribute: "class",
        defaultTheme: "system",
        enableSystem: true,
        disableTransitionOnChange: true,
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$src$2f$providers$2f$query$2d$provider$2e$tsx__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["QueryProvider"], {
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(StoreHydrator, {}, void 0, false, {
                    fileName: "[project]/src/providers/app-providers.tsx",
                    lineNumber: 32,
                    columnNumber: 9
                }, this),
                children,
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$server$2f$route$2d$modules$2f$app$2d$page$2f$vendored$2f$ssr$2f$react$2d$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$sonner$2f$dist$2f$index$2e$mjs__$5b$app$2d$ssr$5d$__$28$ecmascript$29$__["Toaster"], {
                    position: "bottom-right",
                    expand: false,
                    richColors: true,
                    closeButton: true,
                    toastOptions: {
                        duration: 4000
                    }
                }, void 0, false, {
                    fileName: "[project]/src/providers/app-providers.tsx",
                    lineNumber: 34,
                    columnNumber: 9
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/src/providers/app-providers.tsx",
            lineNumber: 31,
            columnNumber: 7
        }, this)
    }, void 0, false, {
        fileName: "[project]/src/providers/app-providers.tsx",
        lineNumber: 25,
        columnNumber: 5
    }, this);
}
}}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}}),
"[externals]/next/dist/server/app-render/action-async-storage.external.js [external] (next/dist/server/app-render/action-async-storage.external.js, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/server/app-render/action-async-storage.external.js", () => require("next/dist/server/app-render/action-async-storage.external.js"));

module.exports = mod;
}}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)": (function(__turbopack_context__) {

var { g: global, __dirname, m: module, e: exports } = __turbopack_context__;
{
const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}}),

};

//# sourceMappingURL=%5Broot%20of%20the%20server%5D__dc0369b7._.js.map