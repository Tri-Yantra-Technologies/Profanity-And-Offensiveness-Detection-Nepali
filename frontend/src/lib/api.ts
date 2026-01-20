import axios, { AxiosError } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8000';

// Configure axios with timeout
export const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000, // 10 second timeout
});

export interface LabelConfidence {
    label: string;
    confidence: number;
}

export interface PredictionResponse {
    profanity: LabelConfidence;
    offensiveness: LabelConfidence;
    latency_ms: number;
}

export interface MetaResponse {
    model_version: string;
    paper: string;
    paper_link: string;
    mock_mode: boolean;
    rate_limit: {
        requests: number;
        window_seconds: number;
    };
}

export interface ApiError {
    error: string;
    message: string;
    request_id?: string;
}

/**
 * Get user-friendly error message from API error
 */
const getErrorMessage = (err: unknown): string => {
    if (axios.isAxiosError(err)) {
        const axiosError = err as AxiosError<ApiError>;

        // Timeout
        if (axiosError.code === 'ECONNABORTED') {
            return 'Request timed out. Please try again.';
        }

        // Network error
        if (axiosError.code === 'ERR_NETWORK') {
            return 'Cannot connect to server. Please ensure the backend is running.';
        }

        // Rate limit
        if (axiosError.response?.status === 429) {
            return 'Too many requests. Please wait a moment and try again.';
        }

        // Server error with message
        if (axiosError.response?.data?.message) {
            return axiosError.response.data.message;
        }

        // Generic HTTP error
        if (axiosError.response?.status) {
            return `Server error (${axiosError.response.status}). Please try again.`;
        }
    }

    return 'An unexpected error occurred. Please try again.';
};

export const predictText = async (text: string): Promise<PredictionResponse> => {
    try {
        const response = await api.post<PredictionResponse>('/predict', { text });
        return response.data;
    } catch (err) {
        throw new Error(getErrorMessage(err));
    }
};

export const checkHealth = async (): Promise<{ status: string }> => {
    try {
        const response = await api.get('/health');
        return response.data;
    } catch (err) {
        throw new Error(getErrorMessage(err));
    }
};

export const getMeta = async (): Promise<MetaResponse> => {
    try {
        const response = await api.get<MetaResponse>('/meta');
        return response.data;
    } catch (err) {
        throw new Error(getErrorMessage(err));
    }
};
