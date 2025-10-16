// Tüm authentication işlemleri için API isteklerini yöneten servis katmanı

export interface ApiResponse<T = any> {
    success: boolean;
    message: string;
    data?: T;
    error?: string;
}

interface RegisterData {
    email: string;
    password: string;
    name: string;
}

interface LoginData {
    email: string;
    password: string;
}

interface ForgotPasswordData {
    email: string;
}

interface ResetPasswordData {
    token: string;
    newPassword: string;
}

interface VerifyEmailData {
    email: string;
}

const API_BASE = '/api/auth';

// Genel API istek fonksiyonu (JWT token httpOnly cookie olarak saklandığı için browser otomatik olarak gönderir. Manuel olarak Authorization header'a eklemeye gerek yok.)
async function apiRequest<T>(
    endpoint: string,
    options: RequestInit = {}
): Promise<ApiResponse<T>> {
    try {
        const response = await fetch(`${API_BASE}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            credentials: 'include', // Cookie'lerin otomatik gönderilmesi için
            ...options,
        });

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('API Request Error:', error);
        return {
            success: false,
            message: 'Bağlantı hatası. Lütfen tekrar deneyin.',
            error: error instanceof Error ? error.message : 'Unknown error',
        };
    }
}

// Kullanıcı kaydı
export async function registerUser(data: RegisterData) {
    return apiRequest('/register', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

// Kullanıcı girişi
export async function loginUser(data: LoginData) {
    return apiRequest('/login', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

// E-posta doğrulama (token ile)
export async function verifyEmail(token: string) {
    return apiRequest(`/verify-email?token=${token}`, {
        method: 'GET',
    });
}

// Yeni doğrulama e-postası gönder
export async function resendVerificationEmail(data: VerifyEmailData) {
    return apiRequest('/verify-email', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

// Şifre sıfırlama talebi
export async function forgotPassword(data: ForgotPasswordData) {
    return apiRequest('/forgot-password', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

// Şifre sıfırlama token doğrulama
export async function verifyResetToken(token: string) {
    return apiRequest(`/reset-password?token=${token}`, {
        method: 'GET',
    });
}

// Yeni şifre belirleme
export async function resetPassword(data: ResetPasswordData) {
    return apiRequest('/reset-password', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

// Çıkış yap
export async function logoutUser() {
    return apiRequest('/logout', {
        method: 'POST',
    });
}

